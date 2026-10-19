#!/usr/bin/env python3
"""Fold the older Augustine books into the augustinus.cc ones as versions,
then retire them.

Each older book is a version of its new one, its text and structure as they
were: content/books/church-fathers/augustine/ (New Advent's NPNF, with the
Portuguese translated from it) becomes the `npnf` version, and Outler's
Confessions (content/books/augustine-confessions/, CCEL) the `outler` one.
New Advent's Confessions are Pilkington's, which augustinus.cc already gives
as a version, so that book only retires.

Where an older Book pairs with a page of the new book, its node carries
`match`, so switching text lands on the same Book. Pairs are made by Book in
order, by number for letters and homilies, by Benedictine number for the
sermons, and from New Advent's Hebrew psalm numbers to the Vulgate's.
References to the retired ids are pointed at the new ones.

Run once, after scrape-augustinus-cc.py build:
    python3 scripts/merge-npnf-augustine.py
"""
from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NPNF = ROOT / "content" / "books" / "church-fathers" / "augustine"
OUTLER = ROOT / "content" / "books" / "augustine-confessions"
OO = ROOT / "content" / "books" / "augustine-opera-omnia"

# NPNF directory → its new book(s). A `+` sends its Books to two new books.
TARGETS = {
    "acts-or-disputation-against-fortunatus-the-manichaean": "anti-manichaean/contra-fortunatum",
    "against-the-epistle-of-manichaeus-called-fundamental": "anti-manichaean/contra-epistolam-fundamenti",
    "against-two-letters-of-the-pelagians": "anti-pelagian/contra-duas-epistulas",
    "answer-to-letters-of-petilian-bishop-of-cirta": "anti-donatist/contra-litteras-petiliani",
    "baptism-against-the-donatists": "anti-donatist/de-baptismo",
    "care-to-be-had-for-the-dead": "pastoral/de-cura-pro-mortuis",
    "catechising-of-the-uninstructed": "pastoral/de-catechizandis-rudibus",
    "christian-doctrine": "exegetical/de-doctrina-christiana",
    "city-of-god": "dogmatic/de-civitate-dei",
    "concerning-faith-of-things-not-seen": "dogmatic/de-fide-rerum-invisibilium",
    "concerning-the-nature-of-good-against-the-manichaeans": "anti-manichaean/de-natura-boni",
    "consentius": "pastoral/contra-mendacium",
    "continence": "pastoral/de-continentia",
    "creed": "pastoral/de-symbolo-ad-catechumenos",
    "enarrations-or-expositions-on-the-psalms": "psalms",
    "enchiridion": "dogmatic/enchiridion-ad-laurentium",
    "faith-and-the-creed": "dogmatic/de-fide-et-symbolo",
    "good-of-marriage": "pastoral/de-bono-coniugali",
    "good-of-widowhood": "pastoral/de-bono-viduitatis",
    "grace-and-free-will": "anti-pelagian/de-gratia-et-libero-arbitrio",
    "grace-of-christ-and-on-original-sin": "anti-pelagian/de-gratia-christi",
    "harmony-of-the-gospels": "exegetical/de-consensu-evangelistarum",
    "holy-trinity": "dogmatic/de-trinitate",
    "holy-virginity": "pastoral/de-sancta-virginitate",
    "homilies-on-the-first-epistle-of-john": "homilies-on-john/in-epistulam-iohannis",
    "letters": "letters",
    "lying": "pastoral/de-mendacio",
    "man-s-perfection-in-righteousness": "anti-pelagian/de-perfectione-iustitiae",
    "marriage-and-concupiscence": "anti-pelagian/de-nuptiis-et-concupiscentia",
    "merits-and-remission-of-sin-and-infant-baptism": "anti-pelagian/de-peccatorum-meritis",
    "morals-of-the-catholic-church": "anti-manichaean/de-moribus-ecclesiae",
    "morals-of-the-manichaeans": "anti-manichaean/de-moribus-ecclesiae",
    "nature-and-grace": "anti-pelagian/de-natura-et-gratia",
    "our-lord-s-sermon-on-the-mount": "exegetical/de-sermone-domini-in-monte",
    "patience": "pastoral/de-patientia",
    "predestination-of-the-saints-gift-of-perseverance": "anti-pelagian/de-praedestinatione-sanctorum+anti-pelagian/de-dono-perseverantiae",
    "proceedings-of-pelagius": "anti-pelagian/de-gestis-pelagii",
    "profit-of-believing": "dogmatic/de-utilitate-credendi",
    "rebuke-and-grace": "anti-pelagian/de-correptione-et-gratia",
    "reply-to-faustus-the-manichaean": "anti-manichaean/contra-faustum",
    "sermons-on-selected-lessons-of-the-new-testament": "sermons",
    "soliloquies": "philosophical/soliloquia",
    "soul-and-its-origin": "anti-pelagian/de-anima-et-eius-origine",
    "spirit-and-the-letter": "anti-pelagian/de-spiritu-et-littera",
    "tractates-on-the-gospel-of-john": "homilies-on-john/in-iohannis-evangelium",
    "two-souls-against-the-manichaeans": "anti-manichaean/de-duabus-animabus",
    "work-of-monks": "pastoral/de-opere-monachorum",
}
# Only retires: the same translation is already in the new book.
DUPLICATES = {"confessions": "autobiographical/confessiones"}

# Pages of the new books that front the work and have no NPNF counterpart:
# Augustine's Revisions entry, the letters sent with a work, Possidius' list.
PREFATORY = re.compile(r"^(Revisions\b|Letters$|Letter 212/a)")
# Where New Advent's Book 1 carries the prologue the new book sets apart.
SKIP_PROLOGUE = {"holy-trinity", "homilies-on-the-first-epistle-of-john"}
# New Advent's pairs that go to named nodes rather than in order.
PAIRS = {
    "morals-of-the-catholic-church": ["ch002"],
    "morals-of-the-manichaeans": ["ch003"],
}

ROMAN = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def roman(s: str) -> int:
    total = 0
    for i, ch in enumerate(s):
        v = ROMAN[ch]
        total += -v if i + 1 < len(s) and ROMAN[s[i + 1]] > v else v
    return total


# ── Units ───────────────────────────────────────────────────────────────

def files_under(node: dict, lang_dir: Path) -> list[Path]:
    """A node's page and its descendants' pages, in reading order."""
    out = [lang_dir / f"{node['id']}.md"] if (lang_dir / f"{node['id']}.md").is_file() else []
    for child in node.get("children") or []:
        out += files_under(child, lang_dir)
    return out


def npnf_units(npnf: Path, meta: dict) -> list[dict]:
    """One unit per Book of the older book: {title, nodes}."""
    toc = meta["toc"]
    if npnf.name == "harmony-of-the-gospels":
        # New Advent lists the Harmony's 153 chapters flat; a Book starts
        # where the chapter numbers start again or a prologue opens it.
        units, last = [], 0
        for node in toc:
            m = re.match(r"Chapter (\d+)", node["title"]["en-US"])
            n = int(m.group(1)) if m else 0
            if not units or not m or n <= last:
                units.append({"title": node["title"], "nodes": []})
            units[-1]["nodes"].append(node)
            last = n
        return units
    return [{"title": node["title"], "nodes": [node]} for node in toc]


def target_nodes(target: dict) -> list[dict]:
    """The new book's top-level nodes that an older Book can pair with; a
    series book's are its documents."""
    nodes = target["toc"]
    if all(n.get("children") and n["id"].startswith("v") for n in nodes):
        nodes = [c for n in nodes for c in n["children"]]
    return [n for n in nodes if not PREFATORY.match(n["title"]["en-US"])]


# ── Pairing ─────────────────────────────────────────────────────────────

def number_of(title: str, word: str) -> str | None:
    m = re.match(rf"(?:{word}) (\d+[A-Za-z]?(?:/[A-Z])?\*?)\b", title)
    return m.group(1) if m else None


def benedictine(unit_files: list[Path]) -> str | None:
    text = unit_files[0].read_text(encoding="utf-8")[:400] if unit_files else ""
    m = re.search(r"\[([IVXLCDM]+)\.? Ben", text)
    return str(roman(m.group(1))) if m else None


def vulgate(hebrew: int) -> int:
    if hebrew <= 8 or hebrew >= 148:
        return hebrew
    if hebrew in (9, 10):
        return 9
    if hebrew in (114, 115):
        return 113
    if hebrew == 116:
        return 114
    if hebrew == 147:
        return 146
    return hebrew - 1


def psalm_of(node: dict) -> int | None:
    """The Vulgate number, from the Latin title: the English labels of some
    volumes switch to the Hebrew numbering ("Exposition of Psalm 122" for
    Enarratio in Psalmum 121)."""
    m = re.search(r"Psalm(?:um|i|us)? (\d+)", node["title"]["la"])
    return int(m.group(1)) if m else None


def found(units: list[dict], lookup) -> list[tuple[dict, dict]]:
    """The pairs a lookup finds; an older page without one simply carries no
    `match`, and is reported."""
    pairs = [(u, n) for u in units if (n := lookup(u)) is not None]
    for u in units:
        if lookup(u) is None:
            print(f"    no counterpart for {u['title']['en-US']}")
    return pairs


def pair(npnf: Path, units: list[dict], target: dict, en_dir: Path) -> list[tuple[dict, dict]]:
    name = npnf.name
    nodes = target_nodes(target)
    if name in SKIP_PROLOGUE:
        nodes = [n for n in nodes if not re.match(r"Prologue", n["title"]["en-US"])]
    if name in PAIRS:
        by_id = {n["id"]: n for n in nodes}
        return [(u, by_id[i]) for u, i in zip(units, PAIRS[name], strict=True)]
    if name == "letters":
        by_number = {number_of(n["title"]["en-US"], "Letter"): n for n in nodes}
        return found(units, lambda u: by_number.get(number_of(u["title"]["en-US"], "Letter")))
    if name in ("tractates-on-the-gospel-of-john", "homilies-on-the-first-epistle-of-john"):
        # The site calls them Homilies, New Advent Tractates, and the 1 John
        # book switches from one to the other at the seventh.
        word = "Homily|Tractate"
        by_number = {number_of(n["title"]["en-US"], word): n for n in nodes}
        return found(units, lambda u: by_number.get(number_of(u["title"]["en-US"], word)))
    if name == "sermons-on-selected-lessons-of-the-new-testament":
        by_number: dict[str, dict] = {}
        for n in nodes:
            by_number.setdefault(number_of(n["title"]["en-US"], "Sermon"), n)
        return found(units, lambda u: by_number.get(benedictine(files_under(u["nodes"][0], en_dir))))
    if name == "enarrations-or-expositions-on-the-psalms":
        first: dict[int, dict] = {}
        for volume in target["toc"]:
            for n in volume["children"]:
                p = psalm_of(n)
                if p is not None:
                    first.setdefault(p, n)
        return found(units, lambda u: first.get(vulgate(int(re.search(r"\d+", u["title"]["en-US"]).group()))))
    if len(units) == 1:
        return [(units[0], nodes[0])]
    if len(units) != len(nodes):
        raise SystemExit(f"{name}: {len(units)} Books against {len(nodes)} pages")
    return list(zip(units, nodes))


# ── Sources ─────────────────────────────────────────────────────────────

def translators(description: str) -> tuple[str, str]:
    """("Holmes & Wallis, rev. Warfield", "1887") from New Advent's credit."""
    m = re.search(r"Translated by (.+?)\. From", description)
    year = (re.findall(r"\b18\d\d\b", description) or [""])[0]
    if not m:
        return "", year
    by, _, rev = m.group(1).partition(" and revised by ")
    surnames = " & ".join(name.split()[-1] for name in re.split(r",? and |, ", by))
    return (f"{surnames}, rev. {rev.split()[-1]}" if rev else surnames), year


def npnf_sources(npnf_meta: dict, langs: list[str]) -> list[dict]:
    en = next(s for s in npnf_meta["sources"] if s["language"] == "en-US")
    names, year = translators(en["description"])
    credit = en["description"].split(". From")[0].removeprefix("Translated by ")
    entries = {
        "en-US": {**en, "label": f"{names} (NPNF, {year})"},
        "pt-BR": {
            "language": "pt-BR", "url": en["url"],
            "description": f"Portuguese translation by Claude of the English of {credit} "
                           "(Nicene and Post-Nicene Fathers), reviewed in several rounds against it.",
            "label": f"Claude, from {names} (NPNF)",
        },
    }
    return [entries[lang] for lang in langs]


def copy_texts(src: Path, dest: Path, langs: list[str], ids: dict[str, str], keep: set[str] | None) -> None:
    """Copy an older book's pages (and translation journals) unchanged into a
    version directory, renaming ids where two books share one version."""
    for lang in langs:
        (dest / lang).mkdir(parents=True, exist_ok=True)
        for f in sorted((src / lang).iterdir()):
            stem = f.stem
            if stem == "translation-journal":
                target = dest / lang / f.name
                if target.exists():
                    target = dest / lang / f"translation-journal-{src.name}.md"
                shutil.copy(f, target)
            elif keep is None or stem in keep:
                shutil.copy(f, dest / lang / f"{ids.get(stem, stem)}{f.suffix}")


def node_ids(nodes: list[dict]) -> set[str]:
    out = set()
    for n in nodes:
        out.add(n["id"])
        out |= node_ids(n.get("children") or [])
    return out


def renamed(nodes: list[dict], ids: dict[str, str]) -> list[dict]:
    return [{**n, "id": ids.get(n["id"], n["id"]),
             **({"children": renamed(n["children"], ids)} if n.get("children") else {})} for n in nodes]


def add_version(tdir: Path, version: dict) -> None:
    target = load(tdir / "book.json")
    versions = [v for v in target.get("versions", []) if v["id"] != version["id"]]
    target["versions"] = versions + [version]
    save(tdir / "book.json", target)


def merge_npnf(groups: dict[str, list[tuple[str, list[dict], list[dict], set[str] | None]]], ids: dict[str, str]) -> None:
    """Each new book's `npnf` version, from the older book or books that
    pair with it: (npnf name, its TOC nodes, the pairs, ids to take)."""
    for target_dir, parts in groups.items():
        tdir = OO / target_dir
        shutil.rmtree(tdir / "versions" / "npnf", ignore_errors=True)
        toc, langs, sources = [], [], []
        for k, (name, nodes, pairs, keep) in enumerate(parts):
            npnf = NPNF / name
            meta = load(npnf / "book.json")
            # Two older books in one version (the two Morals) keep their
            # pages apart by a prefix.
            rename = {i: f"b{k + 1}-{i}" for i in node_ids(nodes)} if len(parts) > 1 else {}
            for unit, node in pairs:
                unit["nodes"][0]["match"] = node["id"]
            book_langs = [lang for lang in ("en-US", "pt-BR") if (npnf / lang).is_dir()]
            copy_texts(npnf, tdir / "versions" / "npnf", book_langs, rename, keep)
            toc += renamed(nodes, rename)
            langs += [lang for lang in book_langs if lang not in langs]
            for src in npnf_sources(meta, book_langs):
                same = next((s for s in sources if s["language"] == src["language"]), None)
                if same is None:
                    sources.append(src)
                elif src["description"] not in same["description"]:
                    same["description"] += " / " + src["description"]
        add_version(tdir, {"id": "npnf", "languages": langs, "sources": sources, "toc": toc})
        print(f"{target_dir:46} ← {', '.join(p[0][:30] for p in parts)}  ({', '.join(langs)})")


def merge_outler(ids: dict[str, str]) -> None:
    """Outler's Confessions, whole: his introduction, the Revisions entry,
    the thirteen books, in English and Portuguese."""
    meta = load(OUTLER / "book.json")
    tdir = OO / "autobiographical" / "confessiones"
    shutil.rmtree(tdir / "versions" / "outler", ignore_errors=True)
    toc = meta["toc"]
    books = [n for n in toc if n["id"].startswith("book-")]
    for node in toc:
        if node["id"] == "augustine-s-testimony-concerning-the-confessions":
            node["match"] = "ch001"
    for i, node in enumerate(books, 2):
        node["match"] = f"ch{i:03d}"
    copy_texts(OUTLER, tdir / "versions" / "outler", ["en-US", "pt-BR"], {}, None)
    add_version(tdir, {
        "id": "outler",
        "languages": ["en-US", "pt-BR"],
        "sources": [
            {**meta["sources"][0], "description": "Albert C. Outler's translation (1955), with his introduction, from the Christian Classics Ethereal Library.", "label": "Albert C. Outler (1955)"},
            {"language": "pt-BR", "url": meta["sources"][0]["url"],
             "description": "Portuguese translation by Claude of Albert C. Outler's English (1955), with his introduction.",
             "label": "Claude, from Outler (1955)"},
        ],
        "toc": toc,
    })
    ids[meta["id"]] = load(tdir / "book.json")["id"]
    shutil.rmtree(OUTLER)
    print("augustine-confessions (Outler)                 → autobiographical/confessiones")


# ── References ──────────────────────────────────────────────────────────

REFERENCE_FILES = [
    *sorted((ROOT / "content" / "practices").rglob("*.json")),
    *sorted((ROOT / "content" / "collections").glob("*.json")),
    ROOT / "apps" / "site" / "src" / "views" / "LibraryView.astro",
    ROOT / "apps" / "app" / "src" / "features" / "search" / "Acervo.tsx",
    ROOT / "apps" / "admin" / "scripts" / "seed-usage.ts",
]


def dedupe(value):
    """Two old books now one: drop the repeat a list then holds."""
    if isinstance(value, list):
        seen, out = set(), []
        for item in (dedupe(v) for v in value):
            key = json.dumps(item, sort_keys=True) if isinstance(item, (dict, str)) else None
            if key is not None and key in seen:
                continue
            if key is not None:
                seen.add(key)
            out.append(item)
        return out
    if isinstance(value, dict):
        return {k: dedupe(v) for k, v in value.items()}
    return value


def repoint(ids: dict[str, str]) -> None:
    pattern = re.compile(r"\bbook/(" + "|".join(re.escape(i) for i in sorted(ids, key=len, reverse=True)) + r")\b(?![-\w])")
    for path in REFERENCE_FILES:
        text = path.read_text(encoding="utf-8")
        new = pattern.sub(lambda m: f"book/{ids[m.group(1)]}", text)
        if new == text:
            continue
        if path.suffix == ".json":
            # Keep the file's own indentation (tabs in some collections).
            lead = re.search(r"^\{\n([ \t]+)", new)
            indent = lead.group(1) if lead else 2
            new = json.dumps(dedupe(json.loads(new)), ensure_ascii=False, indent=indent) + "\n"
        path.write_text(new, encoding="utf-8")
        print(f"repointed {path.relative_to(ROOT)}")


def main() -> None:
    ids: dict[str, str] = {}
    groups: dict[str, list] = {}
    for name, dest in TARGETS.items():
        npnf = NPNF / name
        meta = load(npnf / "book.json")
        units = npnf_units(npnf, meta)
        targets = dest.split("+")
        if len(targets) > 1:  # each Book its own new book
            for target_dir, unit in zip(targets, units, strict=True):
                pairs = pair(npnf, [unit], load(OO / target_dir / "book.json"), npnf / "en-US")
                groups.setdefault(target_dir, []).append((name, unit["nodes"], pairs, node_ids(unit["nodes"])))
        else:
            pairs = pair(npnf, units, load(OO / dest / "book.json"), npnf / "en-US")
            groups.setdefault(dest, []).append((name, meta["toc"], pairs, None))
        ids[meta["id"]] = load(OO / targets[0] / "book.json")["id"]
    merge_npnf(groups, ids)
    for name in TARGETS:
        shutil.rmtree(NPNF / name)
    for name, dest in DUPLICATES.items():
        ids[load(NPNF / name / "book.json")["id"]] = load(OO / dest / "book.json")["id"]
        shutil.rmtree(NPNF / name)
    merge_outler(ids)
    if not any(NPNF.iterdir()):
        NPNF.rmdir()
    repoint(ids)


if __name__ == "__main__":
    main()
