#!/usr/bin/env python3
"""
Build the V0.5/V0.6 catechetical-formation book.

Reads:
  - sessions.json (structural spine: 90 sessions, Pius X Q ranges, Aquinas + Trent refs)
  - content.json (original writing: ekphrasis, scripture, closing per session, EN + PT)
  - existing source books (catechism-pius-x-1912, catechetical-instructions, catechism-of-trent)
  - images/manifest.json (optional, from the image-curation agent)

Writes:
  - 90 chapter markdown files per language → en-US/<id>.md, pt-BR/<id>.md
  - book.json (TOC for the 90 sessions)

Replaces the old build-catechetical-formation.sh.

Mostly-selection assembly: every catechism passage (Pius X, Aquinas,
Trent) is reproduced verbatim from the source books. Original Ember
content (ekphrasis, scripture cap, closing reflection, and the optional
*editorial* pastoral reading) lives in content.json and is clearly
labeled in the rendered output so a reader can tell at a glance what
comes from a saint and what comes from the Ember editors.

Voice for V0.5/V0.6:
- Pius X asks (Q&A) — verbatim
- St. Thomas teaches (warm pastoral exposition) — verbatim from Aquinas's
  Catechetical Instructions; only present where a chapter is mapped
- The Roman Catechism teaches — verbatim from Trent; used as primary
  exposition where Aquinas is silent
- A pastoral reading — *Ember editorial commentary* (optional). Authored
  prose that reads the saints with a lay audience; quotes are explicitly
  attributed. Rendered with its own H2 label so it is never confused
  with the verbatim sections above.
- Scripture verse caps the doctrine
- Closing reflection ~30 words
- Going Deeper section (Trent) appended at the end when Aquinas was the
  primary teacher
"""

import json
import re
import sys
from pathlib import Path

BOOK_DIR = Path(__file__).resolve().parent.parent  # content/libraries/base/books/catechetical-formation/
BOOKS_DIR = BOOK_DIR.parent                         # content/libraries/base/books/
OUT = BOOK_DIR
PX = BOOKS_DIR / "catechism-pius-x-1912"
AQ = BOOKS_DIR / "catechetical-instructions"
TR = BOOKS_DIR / "catechism-of-trent"

SESSIONS_FILE = OUT / "sessions.json"
CONTENT_FILE = OUT / "content.json"
IMAGES_MANIFEST = OUT / "images/manifest.json"

LANGS = ["en-US", "pt-BR"]

LABELS = {
    "en-US": {
        "pius_x": "Pius X asks",
        "aquinas": "St. Thomas teaches",
        "trent_teacher": "The Roman Catechism teaches",
        "editorial": "A pastoral reading",
        "scripture": "Scripture",
        "closing": "Closing",
        "going_deeper": "Going Deeper — *Catechism of Trent*",
        "image_caption": "Image",
    },
    "pt-BR": {
        "pius_x": "São Pio X pergunta",
        "aquinas": "São Tomás ensina",
        "trent_teacher": "O Catecismo Romano ensina",
        "editorial": "Uma leitura pastoral",
        "scripture": "Escritura",
        "closing": "Oração final",
        "going_deeper": "Aprofundamento — *Catecismo de Trento*",
        "image_caption": "Imagem",
    },
}

# ----- source extraction -----

def read_chapter(book_dir: Path, lang: str, chapter_id: str) -> str:
    """Read a source chapter, stripping the H1 line and the blank below it."""
    path = book_dir / lang / f"{chapter_id}.md"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=False)
    # Skip first H1 + blank line if present
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
        if lines and lines[0].strip() == "":
            lines = lines[1:]
    return "\n".join(lines).strip()


def resolve_anchor(anchor, lang: str) -> str:
    """Resolve a section anchor to a string for the given language.

    Anchors can be:
      - A plain string (language-agnostic, e.g. "@opening" or "Creed")
      - An object {"en": "...", "pt": "...", ...} with per-language anchors

    The lang parameter uses codes like "en-US" and "pt-BR". Bilingual
    anchor objects use short codes "en" and "pt". This function maps
    between them.
    """
    if isinstance(anchor, str):
        return anchor
    if isinstance(anchor, dict):
        lang_short = lang.split("-")[0]
        return anchor.get(lang_short, anchor.get("en", ""))
    return str(anchor)


def extract_section(book_dir: Path, lang: str, chapter_id: str, anchor) -> str:
    """Extract a section from a chapter by its H2 anchor.

    The anchor is matched case-insensitively against the H2 heading text. The
    extracted section runs from the matching `## <heading>` line through (and
    excluding) the next `## ` heading, or end of file. The H2 heading itself
    is included so the section identifies itself in the output.

    Special anchor `"@opening"` extracts the chapter content from after the H1
    (and its blank line) up to the first H2 — i.e., the introductory paragraphs
    that come before any subsection.

    Anchors can be plain strings or bilingual objects {"en": "...", "pt": "..."}.

    Footnotes referenced inside the section but defined later in the chapter
    are preserved (we don't try to extract them); markdown renderers tolerate
    dangling footnote refs gracefully.
    """
    resolved = resolve_anchor(anchor, lang)
    if not resolved:
        return ""

    path = book_dir / lang / f"{chapter_id}.md"
    lines = path.read_text(encoding="utf-8").splitlines(keepends=False)

    # Special: opening = pre-H2 content
    if resolved.strip().lower() == "@opening":
        out = []
        skipping_h1 = True
        for line in lines:
            if skipping_h1:
                if line.startswith("# "):
                    continue
                if line.strip() == "" and not out:
                    continue
                skipping_h1 = False
            if line.startswith("## "):
                break
            out.append(line)
        while out and out[-1].strip() == "":
            out.pop()
        return "\n".join(out).strip()

    anchor_lower = resolved.strip().lower()
    out = []
    in_range = False
    for line in lines:
        if line.startswith("## "):
            heading = line[3:].strip().lower()
            # Match by substring — anchor can be a partial title
            if anchor_lower in heading:
                in_range = True
                out.append(line)
                continue
            elif in_range:
                # next H2 — stop
                break
        elif in_range:
            out.append(line)
    while out and out[-1].strip() == "":
        out.pop()
    if not out:
        # Anchor not found — return empty rather than the whole chapter
        return ""
    return "\n".join(out).strip()


def resolve_chapter_ref(book_dir: Path, lang: str, ref) -> str:
    """Resolve a chapter reference into text.

    Accepts either a string ("chapter-id" → whole chapter, minus H1) or an
    object ({"chapter": "id", "sections": [...]} → concatenated
    sections). Sections can be plain strings or bilingual objects
    {"en": "...", "pt": "..."}. For backwards compat, sessions.json may
    use either form.
    """
    if isinstance(ref, str):
        return read_chapter(book_dir, lang, ref)
    chapter_id = ref["chapter"]
    sections = ref.get("sections")
    if not sections:
        return read_chapter(book_dir, lang, chapter_id)
    parts = []
    for anchor in sections:
        text = extract_section(book_dir, lang, chapter_id, anchor)
        if text:
            parts.append(text)
    return "\n\n".join(parts)

Q_PATTERN = re.compile(r"^\*\*(\d+)\.\*\*")

def extract_pius_x_range(chapter_id: str, lang: str, q_from: int, q_to: int) -> str:
    """Extract Pius X Q range from a chapter file. q_from and q_to are inclusive.

    Trailing-H2 trim: source Pius X chapters carry section markers like
    `## § 2. Hope - Charity` placed BEFORE the first Q of the next subsection.
    When the previous Q is the last in the requested range, that header gets
    captured at the tail of the slice — an orphan heading announcing content
    that lives in the next session. We therefore strip a single trailing H2
    (and its surrounding blanks) when it follows the last in-range Q's content
    and is followed by no further in-range content.
    """
    text = (PX / lang / f"{chapter_id}.md").read_text(encoding="utf-8")
    lines = text.splitlines(keepends=False)
    out = []
    in_range = False
    for line in lines:
        m = Q_PATTERN.match(line)
        if m:
            n = int(m.group(1))
            if q_from <= n <= q_to:
                in_range = True
            else:
                in_range = False
        if in_range:
            out.append(line)
    # Trim trailing blank lines
    while out and out[-1].strip() == "":
        out.pop()
    # Strip a single trailing orphan H2 (a section marker for content that
    # belongs to the next session's slice) and any blanks above it
    if out and out[-1].startswith("## "):
        out.pop()
        while out and out[-1].strip() == "":
            out.pop()
    return "\n".join(out).strip()


def assemble_pius_x_section(session: dict, lang: str) -> str:
    """Concatenate all Pius X passages for the session."""
    parts = []
    for ref in session.get("pius_x", []):
        text = extract_pius_x_range(ref["chapter"], lang, ref["from"], ref["to"])
        if text:
            parts.append(text)
    return "\n\n".join(parts)


def assemble_aquinas_section(session: dict, lang: str) -> str:
    """Concatenate all Aquinas passages for the session.

    Each entry in session['aquinas'] is either a chapter ID string (whole
    chapter) or an object with optional `sections` (list of H2 anchors to
    slice). Multiple entries are joined with horizontal rules.
    """
    parts = []
    for ref in session.get("aquinas", []):
        text = resolve_chapter_ref(AQ, lang, ref)
        if text:
            parts.append(text)
    return "\n\n---\n\n".join(parts)


def assemble_trent_section(session: dict, lang: str) -> str:
    """Resolve the Trent reference(s) for the session.

    `session['trent']` may be:
      - null/missing → no Trent
      - a chapter ID string → whole chapter
      - an object `{chapter, sections?}` → optionally sliced by H2 anchors
      - a list of any of the above → multiple Trent chapters (e.g., s089 covers the
        6th petition + 7th petition + Amen, each in a separate Trent chapter)
    """
    ref = session.get("trent")
    if not ref:
        return ""
    if isinstance(ref, list):
        parts = []
        for sub in ref:
            text = resolve_chapter_ref(TR, lang, sub)
            if text:
                parts.append(text)
        return "\n\n---\n\n".join(parts)
    return resolve_chapter_ref(TR, lang, ref)


# ----- chapter assembly -----

def build_chapter(session: dict, content: dict, lang: str, image_meta: dict | None, suppress_trent: bool, suppress_aquinas: bool) -> str:
    """Build one chapter's markdown text.

    Layout:
      title → image + ekphrasis → Pius X (Q&A) → St. Thomas teaches (if Aquinas chapter present and not suppressed)
                                              → The Roman Catechism teaches (when Aquinas is silent)
                                              → A pastoral reading (Ember editorial, optional)
            → Scripture cap → Closing prayer
            → ---
            → Going Deeper — Catechism of Trent (if Trent chapter present and not suppressed)

    The daily 8–15 min read ends at the Closing prayer. Trent is always the optional deeper layer.
    suppress_trent / suppress_aquinas=True: drops the corresponding section because a previous session already emitted the same source (consecutive sessions sharing one chapter cluster around a single teaching; the deeper teaching is held over from the first session of the cluster).
    """
    L = LABELS[lang]
    title = session["title"][lang]
    order = session["order"]
    sid = session["id"]

    px_text = assemble_pius_x_section(session, lang)
    aq_text = "" if suppress_aquinas else assemble_aquinas_section(session, lang)
    tr_text = "" if suppress_trent else assemble_trent_section(session, lang)

    ekphrasis = content.get("ekphrasis", {}).get(lang, "").strip()
    scripture = content.get("scripture", {})
    closing = content.get("closing", {}).get(lang, "").strip()
    editor_note = content.get("editor_note", {}).get(lang, "").strip() if content.get("editor_note") else ""
    # Ember editorial commentary — original prose authored for this book.
    # Distinct from the verbatim Aquinas/Trent excerpts above; gets its own
    # labeled H2 ("A pastoral reading" / "Uma leitura pastoral") so the
    # reader can see at a glance what is editorial vs. verbatim source.
    editorial = content.get("editorial", {}).get(lang, "").strip() if content.get("editorial") else ""

    if lang == "en-US":
        sref = scripture.get("ref_en", "")
        stext = scripture.get("text_en", "")
        order_label = f"Session {order:02d}"
    else:
        sref = scripture.get("ref_pt", "")
        stext = scripture.get("text_pt", "")
        order_label = f"Sessão {order:02d}"

    out_lines = []
    # Header — order + title
    out_lines.append(f"# {order_label} — {title}")
    out_lines.append("")

    # Image (if provided in manifest)
    if image_meta:
        filename = image_meta.get("filename", "")
        attribution = image_meta.get("attribution", "")
        if filename:
            alt = image_meta.get("title", title)
            out_lines.append(f"![{alt}](../images/{filename})")
            if attribution:
                out_lines.append(f"*{attribution}*")
            out_lines.append("")

    # Ekphrasis (italic block quote, points the eye)
    if ekphrasis:
        for para in ekphrasis.split("\n\n"):
            out_lines.append(f"> *{para}*")
        out_lines.append("")

    # Pius X
    if px_text:
        out_lines.append(f"## {L['pius_x']}")
        out_lines.append("")
        out_lines.append(px_text)
        out_lines.append("")

    # Daily teacher: Aquinas if mapped; otherwise Trent steps in (e.g., sacraments,
    # precepts, and Pius X chapters where Aquinas's Naples sermons are silent). Trent
    # only goes to Going Deeper when Aquinas has already taught above; otherwise Trent
    # is the primary exposition for the day.
    trent_used_inline = False
    if aq_text:
        out_lines.append(f"## {L['aquinas']}")
        out_lines.append("")
        out_lines.append(aq_text)
        out_lines.append("")
    elif tr_text:
        out_lines.append(f"## {L['trent_teacher']}")
        out_lines.append("")
        out_lines.append(tr_text)
        out_lines.append("")
        trent_used_inline = True

    # A pastoral reading — Ember editorial. Optional. Sits AFTER the verbatim
    # teacher (or stands alone when no Aquinas/Trent is mapped), and is
    # always rendered with its own labeled H2 so it is never confused with
    # the verbatim sections above.
    if editorial:
        out_lines.append(f"## {L['editorial']}")
        out_lines.append("")
        out_lines.append(editorial)
        out_lines.append("")

    # Scripture cap
    if stext:
        out_lines.append(f"> **{L['scripture']}.** *{stext}* — {sref}")
        out_lines.append("")

    # Editor's note (rare — used when historical numbering / textual variants need explaining
    # to the reader, e.g., the Pius X 9th/10th vs Aquinas 9th/10th commandment swap).
    if editor_note:
        out_lines.append(editor_note)
        out_lines.append("")

    # Closing reflection / prayer — this is the natural daily-read endpoint.
    if closing:
        out_lines.append(f"> *{closing}*")
        out_lines.append("")

    # Going Deeper — Trent. Only when Aquinas was the primary teacher above; otherwise
    # Trent already taught inline and there's nothing further to add.
    if tr_text and not trent_used_inline:
        out_lines.append("---")
        out_lines.append("")
        out_lines.append(f"#### {L['going_deeper']}")
        out_lines.append("")
        out_lines.append(tr_text)
        out_lines.append("")

    return "\n".join(out_lines).rstrip() + "\n"


# ----- TOC for book.json -----

GROUP_TITLES = {
    "preliminary": {
        "en-US": "First Notions of the Christian Faith",
        "pt-BR": "Primeiras Noções da Fé Cristã",
    },
    "creed": {
        "en-US": "Part I — The Apostles' Creed",
        "pt-BR": "Parte I — O Símbolo dos Apóstolos",
    },
    "decalogue": {
        "en-US": "Part II — The Decalogue",
        "pt-BR": "Parte II — O Decálogo",
    },
    "precepts": {
        "en-US": "Part III — Precepts of the Church",
        "pt-BR": "Parte III — Preceitos da Igreja",
    },
    "virtues": {
        "en-US": "Part IV — The Virtues",
        "pt-BR": "Parte IV — As Virtudes",
    },
    "sacraments": {
        "en-US": "Part V — The Sacraments",
        "pt-BR": "Parte V — Os Sacramentos",
    },
    "prayer": {
        "en-US": "Part VI — The Lord's Prayer",
        "pt-BR": "Parte VI — A Oração Dominical",
    },
    "marian": {
        "en-US": "Part VII — The Hail Mary",
        "pt-BR": "Parte VII — A Ave-Maria",
    },
}

GROUP_ORDER = [
    "preliminary",
    "creed",
    "decalogue",
    "precepts",
    "virtues",
    "sacraments",
    "prayer",
    "marian",
]


def build_book_json(sessions: list[dict]) -> dict:
    toc = []
    for group_key in GROUP_ORDER:
        group_sessions = [s for s in sessions if s["group"] == group_key]
        if not group_sessions:
            continue
        if len(group_sessions) == 1 and group_key == "preliminary":
            # preliminary has 2 sessions actually — skip this branch
            pass

        if group_key == "marian":
            # one session — no nesting; emit as a single leaf
            s = group_sessions[0]
            toc.append({
                "id": s["id"],
                "title": {
                    "en-US": f"Session {s['order']:02d} — {s['title']['en-US']}",
                    "pt-BR": f"Sessão {s['order']:02d} — {s['title']['pt-BR']}",
                },
            })
        else:
            children = []
            for s in group_sessions:
                children.append({
                    "id": s["id"],
                    "title": {
                        "en-US": f"Session {s['order']:02d} — {s['title']['en-US']}",
                        "pt-BR": f"Sessão {s['order']:02d} — {s['title']['pt-BR']}",
                    },
                })
            toc.append({
                "id": f"part-{group_key}",
                "title": GROUP_TITLES[group_key],
                "children": children,
            })

    return {
        "id": "catechetical-formation",
        "name": {
            "en-US": "Catechetical Formation",
            "pt-BR": "Formação Catequética",
        },
        "author": {
            "en-US": "St. Pius X · St. Thomas Aquinas · Council of Trent",
            "pt-BR": "São Pio X · São Tomás de Aquino · Concílio de Trento",
        },
        "description": {
            "en-US": (
                "A 90-day catechetical formation track. Each daily session opens with a sacred image, "
                "presents one cluster of questions from the Catechism of St. Pius X (1912), receives "
                "pastoral teaching from St. Thomas Aquinas's Naples Lent sermons (1273) — or, where "
                "Aquinas is silent, from the Roman Catechism of the Council of Trent (1566) — caps the "
                "doctrine with one verse of Scripture, and closes with a brief reflection. The full text "
                "of the Catechism of Trent is appended to each session as 'Going Deeper' for those who "
                "want the longer form. Curated for young adults — beautiful, doctrinally complete, "
                "beginner-friendly but fruitful for everyone. All 433 questions of the Catechism of St. "
                "Pius X are covered."
            ),
            "pt-BR": (
                "Uma trilha de formação catequética de 90 dias. Cada sessão diária abre com uma imagem "
                "sagrada, apresenta um conjunto de perguntas do Catecismo de São Pio X (1912), recebe "
                "ensinamento pastoral dos sermões da Quaresma de Nápoles de São Tomás de Aquino (1273) — "
                "ou, onde São Tomás é silencioso, do Catecismo Romano do Concílio de Trento (1566) — "
                "coroa a doutrina com um versículo da Escritura e encerra com uma breve reflexão. O texto "
                "integral do Catecismo de Trento é anexado a cada sessão como 'Aprofundamento' para quem "
                "deseja a forma mais longa. Curada para jovens adultos — bela, doutrinariamente completa, "
                "amigável ao iniciante e frutuosa a todos. Todas as 433 perguntas do Catecismo de São Pio "
                "X estão cobertas."
            ),
        },
        "composed": "1273–1912",
        "languages": ["en-US", "pt-BR"],
        "sources": [
            {
                "language": "en-US",
                "url": "internal:catechism-pius-x-1912+catechetical-instructions+catechism-of-trent",
                "description": (
                    "Curated anthology drawing on three public-domain catechetical works in this "
                    "library: Catechism of St. Pius X (1912), Aquinas's Catechetical Instructions "
                    "(Collins translation, 1939), and the Roman Catechism (McHugh-Callan, 1923). "
                    "All catechism passages are reproduced verbatim under the labels \"Pius X asks\", "
                    "\"St. Thomas teaches\", and \"The Roman Catechism teaches\". Ekphrases, Scripture "
                    "caps, closing reflections, and the optional pastoral readings (rendered under "
                    "their own \"A pastoral reading\" label) are original Ember editorial; Scripture "
                    "text follows the Douay-Rheims."
                ),
            },
            {
                "language": "pt-BR",
                "url": "internal:catechism-pius-x-1912+catechetical-instructions+catechism-of-trent",
                "description": (
                    "Antologia curada extraída de três obras catequéticas em domínio público desta "
                    "biblioteca: Catecismo de São Pio X (1912, tradução Escravas de Maria), Instruções "
                    "Catequéticas de São Tomás (do inglês de Collins, 1939) e Catecismo Romano "
                    "(tradução de Frei Leopoldo Pires Martins, OFM, 1951). As passagens dos catecismos "
                    "são reproduzidas literalmente sob os rótulos \"São Pio X pergunta\", \"São Tomás "
                    "ensina\" e \"O Catecismo Romano ensina\". Ekfrases, versículos, orações finais e "
                    "as leituras pastorais opcionais (rotuladas como \"Uma leitura pastoral\") são "
                    "redação editorial original da Ember; o texto bíblico segue Pereira de Figueiredo."
                ),
            },
        ],
        "toc": toc,
    }


# ----- driver -----

def main():
    sessions_data = json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
    content_data = json.loads(CONTENT_FILE.read_text(encoding="utf-8"))
    sessions = sessions_data["sessions"]
    content_by_id = {c["session_id"]: c for c in content_data["content"]}

    # Optional images manifest
    images_by_id = {}
    if IMAGES_MANIFEST.exists():
        images_data = json.loads(IMAGES_MANIFEST.read_text(encoding="utf-8"))
        for img in images_data.get("images", []):
            images_by_id[img["session_id"]] = img

    # Coverage audit — every Pius X Q must appear in some session
    covered = set()
    for s in sessions:
        for ref in s.get("pius_x", []):
            for q in range(ref["from"], ref["to"] + 1):
                covered.add(q)
    expected = set(range(1, 434))
    missing = expected - covered
    duplicate_count = sum(1 for q in covered)  # simple sanity check; ranges shouldn't overlap

    if missing:
        print(f"⚠️  WARNING: missing Pius X Qs (not assigned to any session): {sorted(missing)}", file=sys.stderr)
    else:
        print(f"✅ Coverage audit: all 433 Pius X questions assigned to sessions.")

    # Build chapters
    OUT.joinpath("en-US").mkdir(parents=True, exist_ok=True)
    OUT.joinpath("pt-BR").mkdir(parents=True, exist_ok=True)

    # Smart Trent dedupe:
    #   Trent is suppressed when (a) the current session shares the same Trent chapter
    #   as the previous session AND (b) the current session has an Aquinas chapter mapped
    #   that can carry the daily teaching. When the current session has no Aquinas
    #   (typically sacrament sub-sessions, where Aquinas is silent), Trent is always
    #   emitted because it's the only teacher available — suppressing would leave the
    #   chapter with just the Pius X Q&A and no exposition.
    #
    # Aquinas is INTENTIONALLY NOT deduped: each session receives the full sermon, even
    # when consecutive sessions zoom into different Pius X questions inside the same
    # sermon. The daily reader meets the full teaching every morning. This costs ~1–2 MB
    # in the .pray and is the right tradeoff for the formation experience.
    last_trent = None
    for session in sessions:
        sid = session["id"]
        content = content_by_id.get(sid, {})
        image = images_by_id.get(sid)

        # Compare Trent refs by chapter ID (so consecutive sliced sessions of one
        # chapter still share a "last_trent" identity but each emits its own slice).
        current_trent = session.get("trent")
        current_trent_chapter = (
            current_trent if isinstance(current_trent, str)
            else (current_trent.get("chapter") if isinstance(current_trent, dict) else None)
        )
        has_aquinas = bool(session.get("aquinas"))

        # Suppress Trent only when (a) same chapter as last session AND (b) the current
        # Trent ref has NO sections list (i.e., would re-emit the whole chapter that the
        # previous session already carried). If sections are specified, the slicing is
        # the dedupe — different slices, no suppression.
        is_sliced = isinstance(current_trent, dict) and bool(current_trent.get("sections"))
        suppress_trent = (
            bool(current_trent_chapter)
            and current_trent_chapter == last_trent
            and has_aquinas
            and not is_sliced
        )
        if current_trent_chapter:
            last_trent = current_trent_chapter

        for lang in LANGS:
            md = build_chapter(session, content, lang, image, suppress_trent, suppress_aquinas=False)
            (OUT / lang / f"{sid}.md").write_text(md, encoding="utf-8")

    # Write book.json
    book = build_book_json(sessions)
    (OUT / "book.json").write_text(json.dumps(book, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    en_count = len(list((OUT / "en-US").glob("session-*.md")))
    pt_count = len(list((OUT / "pt-BR").glob("session-*.md")))
    print(f"Wrote {en_count} en-US chapters, {pt_count} pt-BR chapters")
    print(f"Wrote book.json with {len(book['toc'])} TOC groups")


if __name__ == "__main__":
    main()
