#!/usr/bin/env python3
"""Hearth v2 corpus builder.

Walks the flat content tree, splits per-language where appropriate (OF Mass
propers and OF library files), canonicalizes JSON, hashes blobs, emits
per-item manifests + a top-level catalog.json into the output directory.

Usage:
    python3 scripts/build-corpus.py [output_dir]

Default output: _site/hearth/v2/

The output is suitable for serving over static hosting (GitHub Pages):

    {output}/catalog.json
    {output}/blobs/{ab}/{cd}/{full-sha256}

Every catalog item references its manifest blob by hash. Manifests reference
content blobs by hash. Updates are blob-grained: a typo fix in one prayer
emits one new prayer-content blob + one new prayer-manifest blob and updates
catalog.json — clients fetch only the changed bytes.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import snowballstemmer

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"

# Languages used in OF Mass propers and OF library files (per-language splittable).
OF_LANGS: set[str] = {"la", "es", "en", "pt-BR", "it", "fr", "de"}

# Languages used elsewhere in the corpus (kept multilingual, treated as one blob).
APP_LANGS: set[str] = {"en-US", "pt-BR", "la"}

# Combined language detection set — any dict whose keys are a non-empty subset
# of this is treated as a localized leaf during per-language splitting.
ALL_LANGS: set[str] = OF_LANGS | APP_LANGS


# ---------------------------------------------------------------------------
# Canonicalization & hashing
# ---------------------------------------------------------------------------

def canonical_json(obj: Any) -> bytes:
    """Stable bytes for hashing: sorted keys, no whitespace, ensure_ascii=False."""
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ---------------------------------------------------------------------------
# Builder state
# ---------------------------------------------------------------------------

class Builder:
    def __init__(self, output: Path):
        self.output = output
        self.blobs_dir = output / "blobs"
        self.blobs_dir.mkdir(parents=True, exist_ok=True)

        # Hashes already written to disk (skip duplicate writes).
        self.written_hashes: set[str] = set()

        # Catalog items: id -> entry
        self.catalog: dict[str, dict] = {}

        # Stats
        self.blobs_written = 0
        self.bytes_written = 0
        self.items_emitted = 0

    def write_blob(self, data: bytes) -> tuple[str, int]:
        """Write a blob if not already on disk; return (hash, size)."""
        h = sha256_hex(data)
        if h not in self.written_hashes:
            path = self.blobs_dir / h[:2] / h[2:4] / h
            if not path.exists():
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
                self.blobs_written += 1
                self.bytes_written += len(data)
            self.written_hashes.add(h)
        return h, len(data)

    def write_json_blob(self, obj: Any) -> tuple[str, int]:
        return self.write_blob(canonical_json(obj))

    def add_catalog(self, item_id: str, entry: dict) -> None:
        if item_id in self.catalog:
            raise ValueError(f"duplicate catalog id: {item_id}")
        self.catalog[item_id] = entry
        self.items_emitted += 1

    def finalize(self) -> None:
        """Write catalog.json."""
        catalog = {
            "version": 2,
            "generated": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "items": dict(sorted(self.catalog.items())),
        }
        catalog_path = self.output / "catalog.json"
        catalog_path.write_bytes(canonical_json(catalog))


# ---------------------------------------------------------------------------
# Per-language splitter
# ---------------------------------------------------------------------------

def is_localized_leaf(obj: Any) -> bool:
    """A dict with keys that are all language codes (and at least one)."""
    if not isinstance(obj, dict) or not obj:
        return False
    return all(k in ALL_LANGS for k in obj.keys())


def split_languages(obj: Any) -> tuple[Any, dict[str, Any]]:
    """Return (shape, {lang: per-lang-tree}).

    The shape is `obj` with every localized leaf replaced by `None`.
    Each per-lang tree is `obj` with every localized leaf collapsed to that
    language's value (string), if present.
    """
    # Discover all languages used anywhere in obj
    found_langs: set[str] = set()
    def discover(o: Any) -> None:
        if is_localized_leaf(o):
            found_langs.update(o.keys())
        elif isinstance(o, dict):
            for v in o.values():
                discover(v)
        elif isinstance(o, list):
            for v in o:
                discover(v)
    discover(obj)

    def shape_walk(o: Any) -> Any:
        if is_localized_leaf(o):
            return None
        if isinstance(o, dict):
            return {k: shape_walk(v) for k, v in o.items()}
        if isinstance(o, list):
            return [shape_walk(v) for v in o]
        return o

    def lang_walk(o: Any, lang: str) -> Any:
        if is_localized_leaf(o):
            return o.get(lang)  # may be None
        if isinstance(o, dict):
            return {k: lang_walk(v, lang) for k, v in o.items()}
        if isinstance(o, list):
            return [lang_walk(v, lang) for v in o]
        return o

    shape = shape_walk(obj)
    per_lang = {lang: lang_walk(obj, lang) for lang in sorted(found_langs)}
    return shape, per_lang


# ---------------------------------------------------------------------------
# Per-kind walkers
# ---------------------------------------------------------------------------

def build_practices(b: Builder) -> None:
    """Each practice's catalog blob is the original `manifest.json` body merged
    with resource hashes (flow / fragments / data / tracks / per-day / images).
    One fetch gives clients everything they need to render the practice card and
    know what blobs to load on demand."""
    src = CONTENT / "practices"
    if not src.is_dir():
        return
    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        pid = d.name
        manifest_path = d / "manifest.json"
        if not manifest_path.is_file():
            print(f"  warn: practice {pid} has no manifest.json")
            continue
        with manifest_path.open(encoding="utf-8") as fh:
            manifest_data = json.load(fh)

        # Flow may be inline in manifest (`flow: { sections: [...] }`) or
        # in a sibling `flow.json` that gets hashed out. Inline is preferred
        # for short prayers; flow.json is preferred for longer practices.
        inline_flow = manifest_data.get("flow")
        flow_entry = None
        flow_path = d / "flow.json"
        if isinstance(inline_flow, dict):
            if flow_path.is_file():
                raise SystemExit(
                    f"practice {pid}: has both inline `flow` in manifest and a flow.json file"
                )
        elif flow_path.is_file():
            with flow_path.open(encoding="utf-8") as fh:
                flow_data = json.load(fh)
            fh_hash, fh_size = b.write_json_blob(flow_data)
            flow_entry = {"hash": fh_hash, "size": fh_size}

        fragments = []
        frag_dir = d / "fragments"
        if frag_dir.is_dir():
            for ff in sorted(frag_dir.glob("*.json")):
                with ff.open(encoding="utf-8") as fh:
                    fdata = json.load(fh)
                fhh, fhs = b.write_json_blob(fdata)
                fragments.append({"id": ff.stem, "hash": fhh, "size": fhs})

        data_files = []
        data_dir = d / "data"
        if data_dir.is_dir():
            # Practices declare logical names for cycle/tracks data in the
            # manifest's `data` block: { "<logical-name>": "data/<file>.json" }.
            # The runtime resolver keys cycleData by this logical name, so map
            # rel → logical and emit the logical as `name` when present. Fall
            # back to the rel path stem for practices that don't declare it.
            file_to_logical = {}
            for logical, path in (manifest_data.get("data") or {}).items():
                if isinstance(path, str) and path.startswith("data/"):
                    file_to_logical[path[len("data/"):]] = logical
            for ff in sorted(data_dir.rglob("*.json")):
                rel = ff.relative_to(data_dir).as_posix()
                with ff.open(encoding="utf-8") as fh:
                    dd = json.load(fh)
                dh, ds = b.write_json_blob(dd)
                name = file_to_logical.get(rel, rel)
                data_files.append({"name": name, "hash": dh, "size": ds})

        tracks_files = []
        tracks_dir = d / "tracks"
        if tracks_dir.is_dir():
            for ff in sorted(tracks_dir.rglob("*.json")):
                rel = ff.relative_to(tracks_dir).as_posix()
                with ff.open(encoding="utf-8") as fh:
                    td = json.load(fh)
                th, ts = b.write_json_blob(td)
                tracks_files.append({"name": rel, "hash": th, "size": ts})

        per_day = {}
        programs_dir = d / "programs"
        if programs_dir.is_dir():
            days_dir = programs_dir / "days"
            if days_dir.is_dir():
                for ff in sorted(days_dir.glob("*.json")):
                    day_key = ff.stem
                    with ff.open(encoding="utf-8") as fh:
                        dd = json.load(fh)
                    dh, ds = b.write_json_blob(dd)
                    per_day[day_key] = {"hash": dh, "size": ds}

        images = []
        img_dir = d / "images"
        if img_dir.is_dir():
            for ff in sorted(img_dir.rglob("*")):
                if ff.is_file() and ff.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}:
                    rel = ff.relative_to(img_dir).as_posix()
                    ih, isize = b.write_blob(ff.read_bytes())
                    images.append({"rel": rel, "hash": ih, "size": isize, "mime": _mime_for(ff)})

        # Merge: original manifest body + resource hashes. Drop legacy path-based
        # `data`/`tracks` fields since v2 uses hash-based lookups. `flow` is
        # kept as inline `{ sections: [...] }` but stripped if it's a legacy
        # string pointer (e.g. `"flow": "flow.json"` from pre-merge manifests).
        item_manifest = {**manifest_data, "id": f"practice/{pid}"}
        if not isinstance(item_manifest.get("flow"), dict):
            item_manifest.pop("flow", None)
        for legacy in ("data", "tracks"):
            item_manifest.pop(legacy, None)
        if flow_entry is not None:
            item_manifest["flowHash"] = flow_entry
        if fragments:
            item_manifest["fragments"] = fragments
        if data_files:
            item_manifest["dataHashes"] = data_files
        if tracks_files:
            item_manifest["trackHashes"] = tracks_files
        if per_day:
            item_manifest["perDay"] = per_day
        if images:
            item_manifest["images"] = images

        ih, isize = b.write_json_blob(item_manifest)

        catalog_entry = {"kind": "practice", "hash": ih, "size": isize}
        if isinstance(manifest_data.get("name"), dict):
            catalog_entry["name"] = manifest_data["name"]
        if "icon" in manifest_data:
            catalog_entry["icon"] = manifest_data["icon"]
        if "tags" in manifest_data:
            catalog_entry["tags"] = manifest_data["tags"]
        if "categories" in manifest_data and isinstance(manifest_data["categories"], list):
            catalog_entry["tags"] = list(set((catalog_entry.get("tags") or []) + manifest_data["categories"]))
        b.add_catalog(f"practice/{pid}", catalog_entry)


def build_chapters(b: Builder) -> None:
    src = CONTENT / "chapters"
    if not src.is_dir():
        return
    for d in sorted(p for p in src.iterdir() if p.is_dir()):
        cid = d.name

        chap_meta = d / "chapter.json"
        if not chap_meta.is_file():
            print(f"  warn: chapter {cid} has no chapter.json")
            continue
        with chap_meta.open(encoding="utf-8") as fh:
            meta = json.load(fh)

        content_entry = None
        content_path = d / "content.json"
        if content_path.is_file():
            with content_path.open(encoding="utf-8") as fh:
                content_data = json.load(fh)
            ch, cs = b.write_json_blob(content_data)
            content_entry = {"hash": ch, "size": cs}

        prose: list[dict] = []
        sections_dir = d / "sections"
        if sections_dir.is_dir():
            for ff in sorted(sections_dir.glob("*.md")):
                stem = ff.stem
                if "." in stem:
                    base, lang = stem.rsplit(".", 1)
                else:
                    base, lang = stem, ""
                bh, bs = b.write_blob(ff.read_bytes())
                prose.append({"file": f"sections/{base}", "lang": lang, "hash": bh, "size": bs})

        item_manifest = {**meta, "id": f"chapter/{cid}"}
        if content_entry:
            item_manifest["contentHash"] = content_entry
        if prose:
            item_manifest["prose"] = prose

        ih, isize = b.write_json_blob(item_manifest)
        catalog_entry = {"kind": "chapter", "hash": ih, "size": isize}
        if isinstance(meta.get("title"), dict):
            catalog_entry["title"] = meta["title"]
        if "tags" in meta:
            catalog_entry["tags"] = meta["tags"]
        b.add_catalog(f"chapter/{cid}", catalog_entry)


# ---------------------------------------------------------------------------
# Per-book full-text search index (stemmed inverted index, one blob per lang)
# ---------------------------------------------------------------------------

# Snowball ships no Latin algorithm. For 'la' we tokenize-only (no stemming);
# Latin liturgical text is short and users typically search the surface form.
SEARCH_STEMMERS: dict[str, str | None] = {
    "en-US": "english",
    "pt-BR": "portuguese",
    "la": None,
}

# Per-language stopword list. Generous on purpose — high-document-frequency
# words are useless for ranking and dominate the index size (a 150-stopword
# list drops ~70% of postings on a 12k-chapter book). Stems are computed
# from these surface forms below, so listing "be" also drops "is/was/were".
SEARCH_STOPWORDS: dict[str, set[str]] = {
    "en-US": {
        # articles, prepositions, conjunctions
        "the", "a", "an", "of", "in", "on", "at", "by", "to", "for", "with",
        "from", "as", "and", "or", "but", "nor", "so", "yet", "if", "than",
        "then", "because", "since", "while", "though", "although", "unless",
        "until", "before", "after", "during", "about", "into", "onto", "upon",
        "over", "under", "between", "among", "through", "above", "below",
        "across", "behind", "beyond", "without", "within", "near",
        # verbs (Snowball folds tense / number, but list surfaces for clarity)
        "be", "is", "am", "are", "was", "were", "been", "being",
        "have", "has", "had", "having",
        "do", "does", "did", "done", "doing",
        "will", "would", "shall", "should", "may", "might", "can", "could",
        "must", "ought", "need",
        # pronouns
        "i", "me", "my", "mine", "myself",
        "you", "your", "yours", "yourself", "yourselves",
        "he", "him", "his", "himself",
        "she", "her", "hers", "herself",
        "it", "its", "itself",
        "we", "us", "our", "ours", "ourselves",
        "they", "them", "their", "theirs", "themselves",
        # demonstratives / determiners / quantifiers
        "this", "that", "these", "those", "such",
        "all", "any", "each", "every", "some", "many", "much", "few", "more",
        "most", "other", "another", "both", "either", "neither", "no", "not",
        "none", "one", "two", "three", "first", "second", "last", "own",
        # interrogatives / relatives
        "who", "whom", "whose", "which", "what", "where", "when", "why", "how",
        # common adverbs / fillers
        "very", "just", "only", "also", "even", "still", "ever", "never",
        "always", "often", "sometimes", "usually", "now", "here", "there",
        "yes", "well", "thus", "hence", "therefore", "however", "indeed",
        "rather", "really", "perhaps", "almost",
        # very common verbs / nouns that crush the index
        "say", "said", "see", "seen", "saw", "make", "made", "take", "took",
        "give", "gave", "go", "went", "gone", "come", "came", "get", "got",
        "find", "found", "know", "knew", "known", "think", "thought",
        "called", "use", "used", "place", "places", "way", "ways", "time",
        "times", "year", "years", "day", "days", "thing", "things",
    },
    "pt-BR": {
        # artigos, preposições, conjunções
        "o", "a", "os", "as", "um", "uma", "uns", "umas",
        "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
        "ao", "à", "aos", "às", "por", "para", "com", "sem", "sob", "sobre",
        "entre", "até", "desde", "contra", "perante",
        "e", "ou", "mas", "porém", "todavia", "contudo", "que", "se", "como",
        "quando", "porque", "pois", "então", "logo", "assim", "também", "ainda",
        # verbos auxiliares e comuns
        "ser", "é", "são", "era", "eram", "foi", "foram", "sido", "sendo",
        "estar", "está", "estão", "estava", "estavam", "esteve", "estiveram",
        "ter", "tem", "têm", "tinha", "tinham", "teve", "tiveram", "tido",
        "haver", "há", "havia", "houve", "houveram",
        "ir", "vai", "vão", "ia", "iam", "foi", "foram",
        "fazer", "faz", "fazem", "fez", "fizeram", "feito",
        "dizer", "diz", "dizem", "disse", "disseram", "dito",
        "poder", "pode", "podem", "podia", "podiam", "pôde", "puderam",
        "querer", "quer", "querem", "queria", "queriam",
        # pronomes
        "eu", "tu", "ele", "ela", "nós", "vós", "eles", "elas",
        "me", "te", "lhe", "lhes", "nos", "vos", "se", "si",
        "meu", "minha", "meus", "minhas",
        "teu", "tua", "teus", "tuas",
        "seu", "sua", "seus", "suas",
        "nosso", "nossa", "nossos", "nossas",
        "vosso", "vossa", "vossos", "vossas",
        # demonstrativos / quantificadores
        "este", "esta", "estes", "estas", "isto",
        "esse", "essa", "esses", "essas", "isso",
        "aquele", "aquela", "aqueles", "aquelas", "aquilo",
        "todo", "toda", "todos", "todas", "muito", "muita", "muitos", "muitas",
        "pouco", "pouca", "poucos", "poucas", "mais", "menos", "outro", "outra",
        "outros", "outras", "mesmo", "mesma", "mesmos", "mesmas", "tal", "tais",
        # interrogativos / negação
        "qual", "quais", "quem", "onde", "quando", "como", "porque", "porquê",
        "não", "nem", "nunca", "jamais", "sim",
    },
    "la": {
        # conjunções e preposições
        "et", "ac", "atque", "aut", "vel", "sed", "nec", "neque", "que",
        "in", "ad", "ex", "de", "ab", "cum", "per", "pro", "sine", "sub",
        "super", "inter", "ante", "post", "apud", "circa", "contra",
        # auxiliares
        "est", "sunt", "esse", "erat", "erant", "fuit", "fuerunt", "fuisse",
        "sit", "sint", "esset", "essent",
        # pronomes
        "ego", "tu", "is", "ea", "id", "nos", "vos", "ipse", "ipsa", "ipsum",
        "se", "sui", "sibi", "me", "te", "mihi", "tibi", "nobis", "vobis",
        "meus", "mea", "meum", "tuus", "tua", "tuum",
        "suus", "sua", "suum", "noster", "vester",
        "hic", "haec", "hoc", "ille", "illa", "illud", "iste", "ista", "istud",
        "qui", "quae", "quod", "quis", "quae", "quid",
        # negação / advérbios comuns
        "non", "ne", "nihil", "nullus", "nec", "neque", "etiam", "iam", "nunc",
        "tunc", "ubi", "ibi", "hic", "inde", "tam", "ita", "sic", "ut", "uti",
        "si", "nisi", "quia", "quoniam", "quod", "cum", "dum", "donec",
        # verbos comuns
        "facere", "facit", "fecit", "factus", "dicere", "dicit", "dixit",
        "habere", "habet", "habuit", "potest", "posse", "potuit",
    },
}

# Word boundary tokenizer — Unicode letters, ≥2 chars, lowercased. Mirrors
# what the JS-side stemmer will see at query time.
_TOKEN_RE = re.compile(r"[\w]{2,}", re.UNICODE)

# Markdown and HTML stripping for search-index text extraction. The output
# does not need to be presentation-perfect — only good enough to yield clean
# tokens. Snippet text shown at query time comes from a runtime chapter
# fetch + stripHtml, not from these strings.
_MD_STRIPPERS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"^---\n.*?\n---\n", re.DOTALL), ""),     # frontmatter
    (re.compile(r"```.*?```", re.DOTALL), " "),            # fenced code
    (re.compile(r"`([^`]+)`"), r"\1"),                     # inline code
    (re.compile(r"!\[[^\]]*\]\([^)]*\)"), " "),            # images
    (re.compile(r"\[([^\]]+)\]\([^)]*\)"), r"\1"),         # links → text
    (re.compile(r"\[\^[^\]]+\]"), " "),                    # footnote refs
    (re.compile(r"^>\s?", re.MULTILINE), ""),              # blockquote
    (re.compile(r"^#{1,6}\s+", re.MULTILINE), ""),         # headers
    (re.compile(r"[*_]{1,3}([^*_]+)[*_]{1,3}"), r"\1"),    # emphasis
    (re.compile(r"<[^>]+>"), " "),                         # html tags
]


def extract_plain_text(raw: str, is_html: bool) -> str:
    """Strip markdown / HTML markup down to tokenizable plain text."""
    text = raw
    if is_html:
        text = re.sub(r"<[^>]+>", " ", text)
    else:
        for pat, repl in _MD_STRIPPERS:
            text = pat.sub(repl, text)
    return text


# Posting list cap per stem — top N chapters by frequency are kept; rarer
# matches are dropped. Users almost never scroll past 100 results.
POSTINGS_CAP_PER_STEM = 100

# Document-frequency cap. A stem present in more than this fraction of the
# book's chapters is dropped entirely — too common to be useful for ranking
# and a major source of bloat.
DF_FRACTION_CAP = 0.5


def build_search_index_for_book(
    chapters_by_lang: dict[str, dict[str, dict]],
    chapter_sources: dict[str, dict[str, tuple[bytes, bool]]],
) -> dict[str, dict]:
    """Build {lang -> index dict} given the chapter raw bytes by id+lang.

    Index shape (compact; the reader rebuilds the human form at query time):
        { "v": 1, "l": "en-US", "s": "snowball-english",
          "c": ["chapId0", "chapId1", ...],
          "t": { "<stem>": [chapIdx, count, chapIdx, count, ...] } }

    Posting lists are flat `[ci, n, ci, n, ...]` arrays sorted by count desc.
    Surface forms are NOT stored — the reader re-stems chapter text at snippet
    time to find an anchor (cheap, since only the top ~20 visible results need
    snippets and the body is fetched lazily anyway).
    """
    langs: set[str] = set()
    for per_lang in chapters_by_lang.values():
        langs.update(per_lang.keys())

    indexes: dict[str, dict] = {}
    for lang in sorted(langs):
        algo = SEARCH_STEMMERS.get(lang)
        stemmer = snowballstemmer.stemmer(algo) if algo else None
        stopwords = SEARCH_STOPWORDS.get(lang, set())
        if stemmer is not None and stopwords:
            stopwords = set(stemmer.stemWords(sorted(stopwords)))

        chapter_ids = sorted(cid for cid, per in chapters_by_lang.items() if lang in per)
        chapter_idx_of = {cid: i for i, cid in enumerate(chapter_ids)}
        df_drop_threshold = max(1, int(len(chapter_ids) * DF_FRACTION_CAP))

        # stem -> { chapter_idx: count }
        postings: dict[str, dict[int, int]] = {}

        for cid in chapter_ids:
            raw_bytes, is_html = chapter_sources[cid][lang]
            try:
                raw = raw_bytes.decode("utf-8", errors="replace")
            except Exception:
                continue
            text = extract_plain_text(raw, is_html)
            ci = chapter_idx_of[cid]
            for match in _TOKEN_RE.finditer(text):
                surface = match.group(0).lower()
                stem = stemmer.stemWord(surface) if stemmer else surface
                if len(stem) < 2 or stem in stopwords:
                    continue
                bucket = postings.setdefault(stem, {})
                bucket[ci] = bucket.get(ci, 0) + 1

        compact_tokens: dict[str, list[int]] = {}
        for stem, by_chap in postings.items():
            if len(by_chap) > df_drop_threshold:
                continue  # too common to be useful
            ranked = sorted(by_chap.items(), key=lambda kv: (-kv[1], kv[0]))
            ranked = ranked[:POSTINGS_CAP_PER_STEM]
            flat: list[int] = []
            for ci, n in ranked:
                flat.append(ci)
                flat.append(n)
            compact_tokens[stem] = flat

        indexes[lang] = {
            "v": 1,
            "l": lang,
            "s": f"snowball-{algo}" if algo else "none",
            "c": chapter_ids,
            "t": compact_tokens,
        }

    return indexes


# Editorial scratch files that live in language dirs but are never chapters.
NON_CHAPTER_STEMS = {"translation-journal", "translator-notes-log", "findings", "needs-human-eyes"}


def _first_h1(text: str) -> str | None:
    """Return the text of a markdown body's leading H1, or None if the first
    non-blank line isn't an H1. The first H1 is the canonical displayed title."""
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        if s.startswith("# "):
            return s[2:].strip().rstrip("#").strip()
        return None
    return None


def _title_tokens(s: str) -> set[str]:
    """Word tokens of a title, ignoring markdown, punctuation, case, and order —
    so a TOC label that merely reorders or shortens the H1 isn't flagged as drift
    (e.g. 'A Purificação (2 fev)' vs '2 fev — A Purificação')."""
    s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s)
    s = re.sub(r"[^\w\s]", " ", s.lower())
    return {w for w in s.split() if w}


def _toc_index(meta: dict) -> tuple[set[str], dict[str, dict]]:
    ids: set[str] = set()
    titles: dict[str, dict] = {}
    def walk(nodes: Iterable[dict]) -> None:
        for n in nodes:
            ids.add(n["id"])
            if isinstance(n.get("title"), dict):
                titles[n["id"]] = n["title"]
            walk(n.get("children") or [])
    walk(meta.get("toc") or [])
    return ids, titles


def _validate_book_titles(bid: str, meta: dict, chapter_sources: dict) -> None:
    """Soft (non-fatal) checks: every chapter .md should lead with an H1 that
    matches its TOC label, and every body file should map to a TOC node."""
    if not meta.get("toc"):
        return
    toc_ids, toc_titles = _toc_index(meta)
    for chap_id in sorted(chapter_sources):
        if chap_id not in toc_ids:
            langs = ",".join(sorted(chapter_sources[chap_id]))
            print(f"  warn: book/{bid}: orphan file '{chap_id}' ({langs}) — no matching TOC node id")
            continue
        for lang, (raw, is_html) in sorted(chapter_sources[chap_id].items()):
            if is_html:
                continue
            h1 = _first_h1(raw.decode("utf-8", "replace"))
            if h1 is None:
                print(f"  warn: book/{bid}: {chap_id} [{lang}] has no leading H1 — title won't render")
                continue
            toc_title = (toc_titles.get(chap_id) or {}).get(lang)
            if toc_title:
                # Drop pure-number tokens so numeric reformats ("41 — Epiphany" vs
                # "Epiphany (January 6)") and short nav labels ("Chapter 1" vs
                # "1 Chronicles 1") don't register. Warn only when both titles are
                # multi-word and share NO words — i.e. genuinely different titles.
                a = {t for t in _title_tokens(h1) if not t.isdigit()}
                b = {t for t in _title_tokens(toc_title) if not t.isdigit()}
                if len(a) >= 2 and len(b) >= 2 and not (a & b):
                    print(f"  warn: book/{bid}: {chap_id} [{lang}] H1 drifts from TOC title")
                    print(f"        H1:  {h1}")
                    print(f"        TOC: {toc_title}")


def build_books(b: Builder) -> None:
    src = CONTENT / "books"
    if not src.is_dir():
        return
    book_css = CONTENT / "book.css"
    style_entry = None
    if book_css.is_file():
        sh, ss = b.write_blob(book_css.read_bytes())
        style_entry = {"hash": sh, "size": ss}

    # book.json may live at any depth under content/books/ — a parent like
    # content/books/aquinas-opera-omnia/ has no book.json of its own, only its
    # leaf children do. Corpus id comes from meta["id"], so physical nesting
    # never changes catalog ids.
    for book_meta_path in sorted(src.rglob("book.json")):
        d = book_meta_path.parent
        with book_meta_path.open(encoding="utf-8") as fh:
            meta = json.load(fh)
        bid = meta.get("id") or d.name

        chapters_by_lang: dict[str, dict[str, dict]] = {}
        chapter_sources: dict[str, dict[str, tuple[bytes, bool]]] = {}
        for sub in sorted(d.iterdir()):
            # Skip non-language dirs: assets, editorial scratch (`_review`, etc.),
            # and nested book roots. A leading `_` marks a non-content directory.
            if (
                sub.is_dir()
                and sub.name not in {"images", "fonts", "sources"}
                and not sub.name.startswith("_")
                and not (sub / "book.json").is_file()
            ):
                lang = sub.name
                for ff in sorted(sub.glob("*.md")):
                    chap_id = ff.stem
                    if chap_id in NON_CHAPTER_STEMS:
                        continue
                    raw = ff.read_bytes()
                    bh, bs = b.write_blob(raw)
                    chapters_by_lang.setdefault(chap_id, {})[lang] = {"hash": bh, "size": bs}
                    chapter_sources.setdefault(chap_id, {})[lang] = (raw, False)
                for ff in sorted(sub.glob("*.html")):
                    chap_id = ff.stem
                    raw = ff.read_bytes()
                    bh, bs = b.write_blob(raw)
                    chapters_by_lang.setdefault(chap_id, {})[lang] = {"hash": bh, "size": bs, "format": "html"}
                    chapter_sources.setdefault(chap_id, {})[lang] = (raw, True)

        _validate_book_titles(bid, meta, chapter_sources)

        images = []
        img_dir = d / "images"
        if img_dir.is_dir():
            for ff in sorted(img_dir.rglob("*")):
                if ff.is_file() and ff.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png"}:
                    rel = ff.relative_to(img_dir).as_posix()
                    ih, isize = b.write_blob(ff.read_bytes())
                    images.append({"rel": rel, "hash": ih, "size": isize, "mime": _mime_for(ff)})

        search_index_refs: dict[str, dict] = {}
        if chapters_by_lang:
            indexes = build_search_index_for_book(chapters_by_lang, chapter_sources)
            for lang, index in indexes.items():
                sih, sis = b.write_json_blob(index)
                search_index_refs[lang] = {"hash": sih, "size": sis}

        item_manifest = {**meta, "id": f"book/{bid}", "chapters": chapters_by_lang}
        if style_entry:
            item_manifest["style"] = style_entry
        if images:
            item_manifest["images"] = images
        if search_index_refs:
            item_manifest["searchIndex"] = search_index_refs

        ih, isize = b.write_json_blob(item_manifest)
        catalog_entry = {"kind": "book", "hash": ih, "size": isize}
        if isinstance(meta.get("name"), dict):
            catalog_entry["name"] = meta["name"]
        if "author" in meta:
            catalog_entry["author"] = meta["author"]
        if "languages" in meta:
            catalog_entry["langs"] = meta["languages"]
        if "tags" in meta:
            catalog_entry["tags"] = meta["tags"]
        b.add_catalog(f"book/{bid}", catalog_entry)



def build_of(b: Builder) -> None:
    """New OF Mass corpus (content/of/): rebuilt missal in the @ember/missal-schema
    shape. Each item is a single multilingual blob (formularies are small and
    fetched per-day; the app selects its language client-side).

    Catalog kinds:
      mass-formulary/<id>   one formulary (propers, readings, prefaces, parts)
      order-of-mass         the Order of Mass bundle (EPs, blessings, frame)
      of-calendar/<name>    temporal + sanctoral statics (fetched once, cached)
    """
    src = CONTENT / "of"
    if not src.is_dir():
        return

    fdir = src / "formularies"
    if fdir.is_dir():
        for f in sorted(fdir.rglob("*.json")):
            with f.open(encoding="utf-8") as fh:
                data = json.load(fh)
            fid = data.get("id")
            if not fid:
                continue
            item_id = f"mass-formulary/{fid}"
            h, size = b.write_json_blob(data)
            entry = {"kind": "mass-formulary", "hash": h, "size": size}
            for k in ("kind", "scope", "structure", "season", "color", "rank"):
                v = data.get(k)
                if isinstance(v, str):
                    # `kind` collides with the catalog key name; expose as massKind.
                    entry["massKind" if k == "kind" else k] = v
            b.add_catalog(item_id, entry)

    order_path = src / "order" / "order-of-mass.json"
    if order_path.is_file():
        with order_path.open(encoding="utf-8") as fh:
            data = json.load(fh)
        h, size = b.write_json_blob(data)
        b.add_catalog("order-of-mass", {"kind": "order-of-mass", "hash": h, "size": size})

    cal_dir = src / "calendar"
    if cal_dir.is_dir():
        for f in sorted(cal_dir.glob("*.json")):
            name = f.stem  # temporal | sanctoral
            with f.open(encoding="utf-8") as fh:
                data = json.load(fh)
            h, size = b.write_json_blob(data)
            b.add_catalog(f"of-calendar/{name}", {"kind": "of-calendar", "hash": h, "size": size})


# Divinum Officium datasets (see docs/features/divinum-officium.md).
DO_LANG_DIRS = {"Latin": "la", "English": "en-US", "Portugues": "pt-BR"}
DO_HORAS_DATASETS = {
    "Tempora": "horas-tempora",
    "Sancti": "horas-sancti",
    "Commune": "horas-commune",
    "TemporaM": "horas-tempora-m",
    "SanctiM": "horas-sancti-m",
    "CommuneM": "horas-commune-m",
    "Psalterium": "horas-psalterium",
    "Appendix": "horas-appendix",
    "Regula": "horas-regula",
    "Martyrologium": "horas-martyrologium",
    "Martyrologium1570": "horas-martyrologium-1570",
    "Martyrologium1955R": "horas-martyrologium-1955r",
    "Martyrologium1960": "horas-martyrologium-1960",
}
DO_MISSA_DATASETS = {
    "Tempora": "missa-tempora",
    "Sancti": "missa-sancti",
    "Commune": "missa-commune",
    "Ordo": "missa-ordo",
}


def build_do(b: Builder) -> None:
    """Divinum Officium datasets: one catalog item per dataset.

    content/do is generated by scripts/build-do-content.ts (never hand-edited);
    the path-to-dataset routing here mirrors that script's import scope —
    change both together.
    Each dataset manifest is a path index mapping a DO file id to per-language
    blob refs (localized datasets) or directly to a blob ref (the
    language-independent Ordinarium scripts and Tabulae calendar tables).
    The engine fetches files lazily through these indexes.
    """
    src = CONTENT / "do"
    if not src.is_dir():
        return
    meta = json.loads((src / "meta.json").read_text(encoding="utf-8"))

    localized: dict[str, dict[str, dict[str, dict]]] = {}  # dataset -> file id -> lang -> ref
    plain: dict[str, dict[str, dict]] = {}  # dataset -> file id -> ref

    for f in sorted(src.rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(src).as_posix()
        if rel in ("meta.json", "inventory.json"):
            continue
        # content/do mirrors the upstream files verbatim; the blob is the raw
        # text and the engine parses it on read (parseDoFile). The file id is
        # the path without the `.txt` mirror extension.
        id_path = rel[: -len(".txt")] if rel.endswith(".txt") else rel
        parts = id_path.split("/")
        ref = dict(zip(("hash", "size"), b.write_blob(f.read_bytes())))
        if parts[0] == "Tabulae":
            plain.setdefault("tabulae", {})["/".join(parts[1:])] = ref
        elif parts[0] == "horas" and parts[1] == "Ordinarium":
            plain.setdefault("ordinarium", {})["/".join(parts[2:])] = ref
        elif len(parts) == 2 and parts[1] in ("horas.dialog", "horas.setup", "missa.dialog", "missa.setup"):
            plain.setdefault("dialog", {})[parts[1]] = ref
        elif parts[0] in ("horas", "missa") and len(parts) >= 4:
            lang = DO_LANG_DIRS.get(parts[1])
            datasets = DO_HORAS_DATASETS if parts[0] == "horas" else DO_MISSA_DATASETS
            dataset = datasets.get(parts[2])
            if lang is None or dataset is None:
                raise ValueError(f"unexpected content/do path: {rel}")
            file_id = "/".join(parts[3:])
            localized.setdefault(dataset, {}).setdefault(file_id, {})[lang] = ref
        else:
            raise ValueError(f"unexpected content/do path: {rel}")

    def emit(dataset: str, manifest: dict) -> None:
        item_id = f"do-data/{dataset}"
        ih, isize = b.write_json_blob(manifest)
        b.add_catalog(item_id, {"kind": "do-data", "hash": ih, "size": isize})

    for dataset, files in sorted(localized.items()):
        emit(dataset, {"id": f"do-data/{dataset}", "doCommit": meta["commit"], "localized": True, "files": files})
    for dataset, files in sorted(plain.items()):
        emit(dataset, {"id": f"do-data/{dataset}", "doCommit": meta["commit"], "localized": False, "files": files})
    emit("meta", {"id": "do-data/meta", **meta})


def _count_collection_items(blocks: list[dict] | None, depth: int = 0, cid: str = "") -> int:
    """Recursively count item-blocks in a section's blocks tree.

    Enforces the depth-2 nesting cap so the corpus can never publish a tree
    the renderer doesn't know how to display.
    """
    if blocks is None:
        return 0
    n = 0
    for b in blocks:
        kind = b.get("kind")
        if kind == "item":
            n += 1
        elif kind == "section":
            if depth >= 1:
                raise ValueError(
                    f"collection {cid}: sections may nest at most one level deep"
                )
            n += _count_collection_items(b.get("blocks"), depth + 1, cid)
        # 'prose' has no ref — not counted
    return n


def build_collections(b: Builder) -> None:
    src = CONTENT / "collections"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        cid = f.stem
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)

        # Validate the manifest shape — Hearth v2 accepts only the sectioned form.
        if "items" in data:
            raise ValueError(
                f"collection {cid}: legacy `items[]` is no longer accepted; migrate to `sections[]`"
            )
        if not isinstance(data.get("sections"), list):
            raise ValueError(f"collection {cid}: `sections[]` is required")

        # Ensure id is set
        data["id"] = f"collection/{cid}"

        # Count items by walking sections (validates depth as a side effect).
        item_count = 0
        for section in data["sections"]:
            blocks = section.get("blocks") if isinstance(section, dict) else None
            item_count += _count_collection_items(blocks, 0, f"collection/{cid}")

        h, size = b.write_json_blob(data)
        catalog_entry = {"kind": "collection", "hash": h, "size": size}
        if isinstance(data.get("name"), dict):
            catalog_entry["name"] = data["name"]
        if isinstance(data.get("description"), dict):
            catalog_entry["description"] = data["description"]
        if "tags" in data:
            catalog_entry["tags"] = data["tags"]
        if "icon" in data:
            catalog_entry["icon"] = data["icon"]
        catalog_entry["itemCount"] = item_count
        b.add_catalog(f"collection/{cid}", catalog_entry)


def build_templates(b: Builder) -> None:
    """Plan-of-life templates — starter packs for a rule of life.

    Each lives in `content/plan-of-life-templates/<id>.json`:
      - name / description / manifesto (localized)
      - practices[] with ref + tier + schedule (+ optional time / enabled)
      - optional resolutions[] and collections[] to pre-pin

    Published as `plan-of-life-template/<id>` corpus items; warmed like
    collections after boot.
    """
    src = CONTENT / "plan-of-life-templates"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        tid = f.stem
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)

        if not isinstance(data.get("practices"), list) or not data["practices"]:
            raise ValueError(
                f"plan-of-life-template {tid}: `practices[]` is required and non-empty"
            )
        for p in data["practices"]:
            if not isinstance(p, dict):
                raise ValueError(f"plan-of-life-template {tid}: each practice must be an object")
            # A placeholder names a prescribed practice the corpus doesn't host
            # yet (e.g. Lectio Divina) — it carries a name, not a ref/schedule,
            # and is never approximated by a different real practice.
            if p.get("placeholder") is True:
                if not isinstance(p.get("name"), dict):
                    raise ValueError(
                        f"plan-of-life-template {tid}: a placeholder practice needs a localized `name`"
                    )
                continue
            if not p.get("ref"):
                raise ValueError(
                    f"plan-of-life-template {tid}: each practice needs a `ref` (or `placeholder: true`)"
                )
            if p.get("tier") not in ("essential", "ideal", "extra"):
                raise ValueError(
                    f"plan-of-life-template {tid}: practice {p.get('ref')} has invalid tier"
                )
            if not isinstance(p.get("schedule"), dict) or not p["schedule"].get("type"):
                raise ValueError(
                    f"plan-of-life-template {tid}: practice {p.get('ref')} needs a schedule"
                )

        data["id"] = f"plan-of-life-template/{tid}"

        h, size = b.write_json_blob(data)
        catalog_entry = {"kind": "plan-of-life-template", "hash": h, "size": size}
        if isinstance(data.get("name"), dict):
            catalog_entry["name"] = data["name"]
        if isinstance(data.get("description"), dict):
            catalog_entry["description"] = data["description"]
        if "tags" in data:
            catalog_entry["tags"] = data["tags"]
        if "icon" in data:
            catalog_entry["icon"] = data["icon"]
        b.add_catalog(f"plan-of-life-template/{tid}", catalog_entry)


def build_checkup(b: Builder) -> None:
    """Spiritual-checkup data — published as `checkup/<name>` corpus items."""
    src = CONTENT / "checkup"
    if not src.is_dir():
        return
    for f in sorted(src.glob("*.json")):
        name = f.stem
        with f.open(encoding="utf-8") as fh:
            data = json.load(fh)
        h, size = b.write_json_blob(data)
        item_manifest = {"id": f"checkup/{name}", "data": {"hash": h, "size": size}}
        ih, isize = b.write_json_blob(item_manifest)
        b.add_catalog(f"checkup/{name}", {"kind": "checkup", "hash": ih, "size": isize})


def build_creators(b: Builder) -> None:
    """Catholic creators — directory + per-creator manifest.

    Each creator lives in `content/creators/<id>/`:
      - manifest.json   → CreatorManifest shape (without avatar/banner hashes)
      - avatar.webp     → optional 512x512 avatar (hashed via the image pipeline)
      - banner.webp     → optional 1600x900 hero (same pipeline)

    Live items (episodes, videos, articles) are NOT in the corpus — they live
    in SQLite, fetched at runtime from external feeds.
    """
    src = CONTENT / "creators"
    if not src.is_dir():
        return
    for cdir in sorted(src.iterdir()):
        if not cdir.is_dir():
            continue
        cid = cdir.name
        manifest_path = cdir / "manifest.json"
        if not manifest_path.exists():
            continue
        with manifest_path.open(encoding="utf-8") as fh:
            data = json.load(fh)

        avatar = cdir / "avatar.webp"
        if avatar.exists():
            ah, asize = b.write_blob(avatar.read_bytes())
            data["avatarHash"] = {"hash": ah, "size": asize}
        banner = cdir / "banner.webp"
        if banner.exists():
            bh, bsize = b.write_blob(banner.read_bytes())
            data["bannerHash"] = {"hash": bh, "size": bsize}

        data["id"] = f"creator/{cid}"

        h, size = b.write_json_blob(data)
        catalog_entry: dict[str, Any] = {"kind": "creator", "hash": h, "size": size}
        if isinstance(data.get("name"), dict):
            catalog_entry["name"] = data["name"]
        if "tags" in data:
            catalog_entry["tags"] = data["tags"]
        if isinstance(data.get("role"), str):
            catalog_entry["creatorRole"] = data["role"]
        if isinstance(data.get("languages"), list):
            catalog_entry["creatorLanguages"] = data["languages"]
        channels = data.get("channels") or []
        has_qa = any(
            isinstance(c, dict) and c.get("format") == "qa" for c in channels
        )
        if has_qa:
            catalog_entry["hasQa"] = True
        b.add_catalog(f"creator/{cid}", catalog_entry)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _discover_langs(obj: Any) -> set[str]:
    """Find all language codes used as dict keys anywhere in obj."""
    found: set[str] = set()
    def walk(o: Any) -> None:
        if isinstance(o, dict):
            for k, v in o.items():
                if k in ALL_LANGS:
                    found.add(k)
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    walk(obj)
    return found


def _mime_for(p: Path) -> str:
    s = p.suffix.lower()
    return {
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".md": "text/markdown",
        ".html": "text/html",
        ".css": "text/css",
        ".json": "application/json",
    }.get(s, "application/octet-stream")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main(argv: list[str]) -> int:
    output = Path(argv[1]) if len(argv) > 1 else (ROOT / "_site" / "hearth" / "v2")
    output = output.resolve()
    print(f"[corpus] output: {output}")

    if not CONTENT.is_dir():
        print(f"error: {CONTENT} not found", file=sys.stderr)
        return 1

    output.mkdir(parents=True, exist_ok=True)
    b = Builder(output)

    t0 = time.time()
    print("[corpus] practices...")
    build_practices(b)
    print("[corpus] chapters...")
    build_chapters(b)
    print("[corpus] books...")
    build_books(b)
    print("[corpus] of (rebuilt missal corpus)...")
    build_of(b)
    print("[corpus] divinum-officium...")
    build_do(b)
    print("[corpus] collections...")
    build_collections(b)
    print("[corpus] plan-of-life templates...")
    build_templates(b)
    print("[corpus] checkup...")
    build_checkup(b)
    print("[corpus] creators...")
    build_creators(b)
    b.finalize()
    elapsed = time.time() - t0

    catalog_size = (output / "catalog.json").stat().st_size
    blob_count = sum(1 for _ in b.blobs_dir.rglob("*") if _.is_file())
    print()
    print(f"[corpus] done in {elapsed:.1f}s")
    print(f"  items in catalog: {b.items_emitted}")
    print(f"  blobs written:    {b.blobs_written}")
    print(f"  blobs total:      {blob_count}")
    print(f"  bytes written:    {b.bytes_written:,}")
    print(f"  catalog.json:     {catalog_size:,} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
