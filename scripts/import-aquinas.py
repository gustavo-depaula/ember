#!/usr/bin/env python3
"""Import the public-domain Aquinas corpus into content/books/aquinas-opera-omnia/.

Source: the Geremia/AquinasOperaOmnia GitHub mirror of dhspriory.org/thomas
(originally compiled by Fr. Joseph Kenny OP, 1936-2013). It contains bilingual
Latin / English HTML for the bulk of Aquinas's works.

Usage:
    python3 scripts/import-aquinas.py prepare-cache
    python3 scripts/import-aquinas.py list
    python3 scripts/import-aquinas.py work <work-id>
    python3 scripts/import-aquinas.py all

The script is idempotent: re-running rewrites markdown but build-corpus.py
re-hashes only changed bytes, so iterations are cheap.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / "_cache" / "aquinas-opera-omnia"
GEREMIA_URL = "https://github.com/Geremia/AquinasOperaOmnia"
BOOKS_ROOT = ROOT / "content" / "books" / "aquinas-opera-omnia"
PRAYERS_ROOT = ROOT / "content" / "prayers"

AUTHOR = {
    "en-US": "St. Thomas Aquinas",
    "la": "Sanctus Thomas Aquinas",
}


# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

def load_html(path: Path) -> BeautifulSoup:
    text = path.read_text(encoding="utf-8", errors="replace")
    # lxml is required: the Geremia files use unclosed <p> tags pervasively,
    # which html.parser interprets as nesting the rest of the body inside the
    # first <p>. lxml's HTML mode auto-closes them at the next block boundary.
    return BeautifulSoup(text, "lxml")


def td_text(td: Tag) -> str:
    """Extract text from a <td>, preserving inline italics/bold as markdown and
    converting <a href> into bare text (drop the link, keep the visible text).
    Collapse whitespace."""
    parts: list[str] = []
    for child in _walk_inline(td):
        parts.append(child)
    text = "".join(parts)
    # Collapse runs of whitespace; preserve single newlines from <br>.
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _walk_inline(node) -> list[str]:
    out: list[str] = []
    for child in getattr(node, "children", []):
        if isinstance(child, NavigableString):
            out.append(str(child))
            continue
        name = child.name.lower() if child.name else ""
        if name in ("br",):
            out.append("\n")
        elif name in ("b", "strong"):
            inner = "".join(_walk_inline(child)).strip()
            if inner:
                out.append(f"**{inner}**")
        elif name in ("i", "em"):
            inner = "".join(_walk_inline(child)).strip()
            if inner:
                out.append(f"*{inner}*")
        elif name in ("sup",):
            inner = "".join(_walk_inline(child)).strip()
            if inner:
                out.append(f"^{inner}^")
        elif name in ("p",):
            out.extend(_walk_inline(child))
            out.append("\n\n")
        elif name in ("a", "span", "font", "small"):
            out.extend(_walk_inline(child))
        else:
            out.extend(_walk_inline(child))
    return out


def slug(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


# ---------------------------------------------------------------------------
# Summa Theologiae parser
# ---------------------------------------------------------------------------

# Each Summa question file (FPNNN.html / FSNNN.html / SSNNN.html / TPNNN.html /
# XPNNN.html) contains one Question, with the proem + articles separated by
# <hr> elements. Each article has:
#   - <h3> title
#   - <table> with rows whose tds are (Latin, English)
# We classify English rows by leading bold/italic prefix:
#   Objection N:  →  objection
#   On the contrary,  →  sed-contra
#   I answer that,  →  respondeo
#   Reply to Objection N: →  reply
#   (anything else, including prooemium text) → prose

_LEAD = r"^[\*\s_]*"  # allow bold/italic markdown markers + whitespace
OBJECTION_RE = re.compile(_LEAD + r"Objection\s+(\d+)[:\.]", re.IGNORECASE)
SED_CONTRA_RE = re.compile(_LEAD + r"On the contrary", re.IGNORECASE)
RESPONDEO_RE = re.compile(_LEAD + r"I answer that", re.IGNORECASE)
REPLY_RE = re.compile(_LEAD + r"Reply to Objection\s+(\d+)[:\.]", re.IGNORECASE)
FURTHER_RE = re.compile(_LEAD + r"Further", re.IGNORECASE)  # used to detect objection 2+ when "Objection N:" prefix absent


@dataclass
class SummaArticle:
    question_num: int
    article_num: int
    title_en: str
    title_la: str
    objections: list[tuple[str, str]] = field(default_factory=list)  # (la, en)
    sed_contra: tuple[str, str] | None = None
    respondeo: tuple[str, str] | None = None
    replies: list[tuple[str, str]] = field(default_factory=list)


@dataclass
class SummaQuestion:
    part_code: str  # FP / FS / SS / TP / XP
    num: int
    title_en: str
    title_la: str
    proem_en: str
    proem_la: str
    articles: list[SummaArticle]


def parse_summa_question(path: Path, part_code: str) -> SummaQuestion:
    """Parse one Summa Question HTML file into proem + articles.

    The Geremia HTML is anchor-driven: each section opens with
    <a name="FPQ<n>OUTP1"> (proem) or <a name="FPQ<n>A<m>THEP1"> (article m).
    We walk the body in document order, segmenting by these anchors, then
    extract the title <h3> + bilingual <table> rows from each segment.
    """
    soup = load_html(path)
    body = soup.find("body") or soup

    anchor_re = re.compile(rf"{part_code}Q(\d+)(?:(OUTP)|A(\d+)THEP)\d+")

    qnum_match = re.search(rf"{part_code}(\d+)", path.stem)
    qnum = int(qnum_match.group(1)) if qnum_match else 0

    # Collect anchors in document order.
    sections: list[dict] = []
    for a in body.find_all("a", attrs={"name": True}):
        m = anchor_re.match(a.get("name", ""))
        if not m:
            continue
        kind = "proem" if m.group(2) == "OUTP" else "article"
        anum = int(m.group(3)) if m.group(3) else 0
        sections.append({"anchor": a, "kind": kind, "anum": anum,
                          "h3": None, "rows": []})

    if not sections:
        return SummaQuestion(part_code, qnum, "", "", "", "", [])

    # For each section, walk forward until the next section's anchor,
    # collecting <h3> + <tr> children.
    anchors = {id(s["anchor"]): s for s in sections}
    current: dict | None = None
    next_anchor_id = id(sections[0]["anchor"]) if sections else None

    for el in body.find_all(True):  # iterate every descendant tag
        if el.name == "a" and el.get("name") and id(el) in anchors:
            current = anchors[id(el)]
            continue
        if current is None:
            continue
        if el.name == "h3" and current["h3"] is None:
            current["h3"] = td_text(el)
        elif el.name == "tr":
            tds = el.find_all("td", recursive=False)
            if len(tds) >= 2:
                la = td_text(tds[0])
                en = td_text(tds[1])
                if la or en:
                    current["rows"].append((la, en))

    # The first section (proem) holds the Question's en/la title in its <h3>
    # and the proem prose in its <table>. For Q1 of each part, the <h3> also
    # carries the Part header + Treatise header above the actual Q title —
    # strip those so the TOC reads cleanly.
    proem = next((s for s in sections if s["kind"] == "proem"), None)
    title_en, title_la, proem_en, proem_la = "", "", "", ""
    if proem:
        # The proem table puts the title <h3> in BOTH columns of the first row.
        # The h3 we captured is whichever appeared first in DOM order — the
        # Latin column. So pull both column h3s for accuracy.
        # Quick path: use the row data — the first row's two cells are the
        # title (and contain <h3>). We already collected non-title rows in
        # "rows" only if the row had 2 tds. So include row 0's two tds.
        # Actually our collection grabs every tr unconditionally — fine.
        # Reconstruct: first row's la is la title, en is en title.
        if proem["rows"]:
            la0, en0 = proem["rows"][0]
            # If the first row looks like a title (short, no objection marker),
            # split it out.
            if not _row_marker(en0) and len(en0) < 400:
                title_la = _clean_question_title(la0)
                title_en = _clean_question_title(en0)
                tail = proem["rows"][1:]
            else:
                tail = proem["rows"]
            proem_la = "\n\n".join(la for la, _ in tail).strip()
            proem_en = "\n\n".join(en for _, en in tail).strip()

    articles: list[SummaArticle] = []
    for s in sections:
        if s["kind"] != "article":
            continue
        # Geremia HTML carries only the English article title in its <h3>.
        # Leave Latin blank so the TOC reads "Articulus N" not "Articulus N —
        # <english>".
        art = SummaArticle(
            question_num=qnum,
            article_num=s["anum"],
            title_en=s["h3"] or "",
            title_la="",
        )
        _classify_rows(art, s["rows"])
        articles.append(art)

    return SummaQuestion(
        part_code=part_code,
        num=qnum,
        title_en=title_en,
        title_la=title_la,
        proem_en=proem_en,
        proem_la=proem_la,
        articles=articles,
    )


def _classify_rows(article: SummaArticle, rows: list[tuple[str, str]]) -> None:
    """Group rows into objections / sed_contra / respondeo / replies.

    A row is the *start* of a new section if its English text matches one of
    the section markers; subsequent rows extend the current section until the
    next marker."""
    current: str | None = None
    current_la: list[str] = []
    current_en: list[str] = []
    current_idx = 0

    def flush() -> None:
        nonlocal current, current_la, current_en, current_idx
        if current is None:
            return
        la = "\n\n".join(x for x in current_la if x).strip()
        en = "\n\n".join(x for x in current_en if x).strip()
        if current == "objection":
            article.objections.append((la, en))
        elif current == "sed-contra":
            article.sed_contra = (la, en)
        elif current == "respondeo":
            article.respondeo = (la, en)
        elif current == "reply":
            article.replies.append((la, en))
        current = None
        current_la = []
        current_en = []

    for la, en in rows:
        marker = _row_marker(en)
        if marker:
            flush()
            current = marker[0]
            current_idx = marker[1]
            # Strip the marker phrase from the English text so the body reads
            # cleanly; keep the Latin verbatim.
            en = _strip_marker(en, current)
            current_la = [la]
            current_en = [en]
        else:
            if current is None:
                # Prelude lines before the first marker — treat as objection 1
                # preamble. Rare; in practice the prelude (article title's
                # rationale) is part of objection 1 or just title prose.
                continue
            current_la.append(la)
            current_en.append(en)
    flush()


def _row_marker(en: str) -> tuple[str, int] | None:
    if OBJECTION_RE.match(en):
        m = OBJECTION_RE.match(en)
        return ("objection", int(m.group(1)))
    if SED_CONTRA_RE.match(en):
        return ("sed-contra", 0)
    if RESPONDEO_RE.match(en):
        return ("respondeo", 0)
    if REPLY_RE.match(en):
        m = REPLY_RE.match(en)
        return ("reply", int(m.group(1)))
    return None


_MARKER_RES = [
    re.compile(r"^[\*_\s]*Objection\s+\d+[:\.][\*_\s]*", re.IGNORECASE),
    re.compile(r"^[\*_\s]*On the contrary[,\.]?[\*_\s]*", re.IGNORECASE),
    re.compile(r"^[\*_\s]*I answer that[,\.]?[\*_\s]*", re.IGNORECASE),
    re.compile(r"^[\*_\s]*Reply to Objection\s+\d+[:\.][\*_\s]*", re.IGNORECASE),
]


def _strip_marker(en: str, kind: str) -> str:
    for r in _MARKER_RES:
        en = r.sub("", en, count=1)
    return en.strip()


# ---------------------------------------------------------------------------
# Summa Theologiae work driver
# ---------------------------------------------------------------------------

PART_CODES = {
    "FP": ("I", "Prima Pars", "First Part"),
    "FS": ("I-II", "Prima Secundae", "First Part of the Second Part"),
    "SS": ("II-II", "Secunda Secundae", "Second Part of the Second Part"),
    "TP": ("III", "Tertia Pars", "Third Part"),
    "XP": ("Suppl.", "Supplementum", "Supplement"),
}


def build_summa_theologiae() -> dict:
    """Walk summa/{FP,FS,SS,TP,XP}/ and emit one book with a 3-level TOC:
    Part → Question → Article."""
    book_dir = BOOKS_ROOT / "summa-theologiae"
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    en_dir.mkdir(parents=True, exist_ok=True)
    la_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    written_en = 0
    written_la = 0

    for part_code in ["FP", "FS", "SS", "TP", "XP"]:
        part_dir = CACHE / "summa" / part_code
        if not part_dir.is_dir():
            print(f"  skip {part_code}: not found")
            continue
        roman, la_label, en_label = PART_CODES[part_code]
        part_node = {
            "id": part_code.lower(),
            "title": {"en-US": f"Part {roman} — {en_label}", "la": la_label},
            "children": [],
        }
        files = sorted(part_dir.glob(f"{part_code}*.html"))
        # Skip index / outline files.
        files = [f for f in files if re.fullmatch(rf"{part_code}\d+", f.stem)]
        for fp in files:
            try:
                q = parse_summa_question(fp, part_code)
            except Exception as exc:
                print(f"  warn: {fp.name} parse failed: {exc}")
                continue
            if q.num == 0:
                continue
            q_node = {
                "id": f"{part_code.lower()}-q{q.num:03d}",
                "title": {
                    "en-US": f"Question {q.num}" + (f" — {q.title_en}" if q.title_en else ""),
                    "la": f"Quaestio {q.num}" + (f" — {q.title_la}" if q.title_la else ""),
                },
                "children": [],
            }
            # Optional proem chapter.
            if q.proem_en or q.proem_la:
                proem_id = f"{part_code.lower()}-q{q.num:03d}-pr"
                _write_md(en_dir / f"{proem_id}.md", _proem_md_en(q))
                _write_md(la_dir / f"{proem_id}.md", _proem_md_la(q))
                written_en += 1
                written_la += 1
                q_node["children"].append({
                    "id": proem_id,
                    "title": {"en-US": "Prooemium", "la": "Prooemium"},
                })
            for art in q.articles:
                art_id = f"{part_code.lower()}-q{q.num:03d}-a{art.article_num:02d}"
                _write_md(en_dir / f"{art_id}.md", _article_md_en(art))
                _write_md(la_dir / f"{art_id}.md", _article_md_la(art))
                written_en += 1
                written_la += 1
                q_node["children"].append({
                    "id": art_id,
                    "title": {
                        "en-US": f"Article {art.article_num}" + (f" — {art.title_en}" if art.title_en else ""),
                        "la": f"Articulus {art.article_num}" + (f" — {art.title_la}" if art.title_la else ""),
                    },
                })
            part_node["children"].append(q_node)
        if part_node["children"]:
            toc.append(part_node)

    manifest = {
        "id": "aquinas-summa-theologiae",
        "name": {"en-US": "Summa Theologiae", "la": "Summa Theologiae"},
        "author": AUTHOR,
        "description": {
            "en-US": "Aquinas's unfinished theological masterwork (1265–1274), the architecture of Catholic theology for seven centuries. Question-and-article form: objection, sed contra, respondeo, replies. Latin Leonine edition; English translation by Fr. Laurence Shapcote OP (\"Fathers of the English Dominican Province\"), Benziger 1911–1925.",
            "la": "Opus theologicum magnum, inchoatum 1265, morte interruptum 1273. Forma quaestionum et articulorum: obiectiones, sed contra, respondeo, ad obiecta.",
        },
        "composed": "1265–1273",
        "languages": ["en-US", "la"],
        "sources": [
            {
                "language": "en-US",
                "url": GEREMIA_URL,
                "description": "Translation by Fr. Laurence Shapcote OP, attributed to \"Fathers of the English Dominican Province\" (Benziger 1911–1925; Benziger 1947 reprint). Public domain. Digitized by Sandra K. Perry; mirrored from dhspriory.org via the Geremia/AquinasOperaOmnia GitHub repository (compiled by Fr. Joseph Kenny OP).",
            },
            {
                "language": "la",
                "url": GEREMIA_URL,
                "description": "Leonine edition (public domain), via the Geremia mirror of dhspriory.org.",
            },
        ],
        "toc": toc,
    }
    _write_manifest(book_dir, manifest)
    return {"book": "aquinas-summa-theologiae", "en": written_en, "la": written_la}


def _proem_md_en(q: SummaQuestion) -> str:
    out = [f"# Question {q.num}"]
    if q.title_en:
        out[0] += f" — {q.title_en}"
    out.append("")
    if q.proem_en:
        out.append(q.proem_en)
    return "\n".join(out).rstrip() + "\n"


def _proem_md_la(q: SummaQuestion) -> str:
    out = [f"# Quaestio {q.num}"]
    if q.title_la:
        out[0] += f" — {q.title_la}"
    out.append("")
    if q.proem_la:
        out.append(q.proem_la)
    return "\n".join(out).rstrip() + "\n"


def _article_md_en(art: SummaArticle) -> str:
    lines: list[str] = [f"# Article {art.article_num}"]
    if art.title_en:
        lines[0] += f" — {art.title_en}"
    lines.append("")
    for i, (_, en) in enumerate(art.objections, start=1):
        lines.append(f"## Objection {i}")
        lines.append("")
        lines.append(en)
        lines.append("")
    if art.sed_contra:
        lines.append("## On the contrary")
        lines.append("")
        lines.append(art.sed_contra[1])
        lines.append("")
    if art.respondeo:
        lines.append("## I answer that")
        lines.append("")
        lines.append(art.respondeo[1])
        lines.append("")
    for i, (_, en) in enumerate(art.replies, start=1):
        lines.append(f"## Reply to Objection {i}")
        lines.append("")
        lines.append(en)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def _article_md_la(art: SummaArticle) -> str:
    lines: list[str] = [f"# Articulus {art.article_num}"]
    if art.title_la:
        lines[0] += f" — {art.title_la}"
    lines.append("")
    for i, (la, _) in enumerate(art.objections, start=1):
        lines.append(f"## Obiectio {i}")
        lines.append("")
        lines.append(la)
        lines.append("")
    if art.sed_contra:
        lines.append("## Sed contra")
        lines.append("")
        lines.append(art.sed_contra[0])
        lines.append("")
    if art.respondeo:
        lines.append("## Respondeo")
        lines.append("")
        lines.append(art.respondeo[0])
        lines.append("")
    for i, (la, _) in enumerate(art.replies, start=1):
        lines.append(f"## Ad {_ordinal_la(i)}")
        lines.append("")
        lines.append(la)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def _clean_question_title(text: str) -> str:
    """The Q-title <h3> on Q1 of each Part also carries the Part header and
    Treatise header above. Strip lines that look like part/treatise headers
    (ALL CAPS opening, or contain "PROOEMIUM" / "PROLOGUE" / "(Question..."),
    keep the last meaningful line as the title."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    keep: list[str] = []
    for line in lines:
        ul = line.upper()
        if ul == "PROOEMIUM" or ul == "PROLOGUE":
            continue
        if re.match(r"^(PRIMA|SECUNDA|TERTIA|FIRST|SECOND|THIRD)\s+PARS", line, re.IGNORECASE):
            continue
        if re.match(r"^(QUAESTIO|QUESTION)\s*\d", line, re.IGNORECASE):
            continue
        if re.match(r"^FIRST PART", line):
            continue
        if "(Question [" in line or "(QUAESTIO " in line:
            continue
        keep.append(line)
    return keep[-1] if keep else text.strip()


_LA_ORDINALS = ["primum", "secundum", "tertium", "quartum", "quintum", "sextum",
                "septimum", "octavum", "nonum", "decimum"]

def _ordinal_la(n: int) -> str:
    if 1 <= n <= len(_LA_ORDINALS):
        return _LA_ORDINALS[n - 1]
    return f"{n}m"


# ---------------------------------------------------------------------------
# Catena Aurea parser
# ---------------------------------------------------------------------------
# Each Gospel file (CAMatthew.htm, CAMark.htm, CALuke.htm, CAJohn.htm) holds
# the entire Catena for that Gospel. Chapters open with <a name="N"> where N
# is the chapter number; the prologue/dedication opens with <a name="0">.
# Within a chapter, content is bilingual <tr>/<td> pairs with three row
# types:
#   - centered header rows ("Lectio N" or "Gospel chapter / verse range")
#   - verse text rows (Greek/Latin Vulgate | English with "Ver. N." marker)
#   - patristic gloss rows (la: <b>Author</b>: text / en: <span color="blue">
#     Author</span>: text). The author name is preserved as **bold** in our
#     markdown via the inline walker.

CATENA_GOSPELS = {
    "matthew": ("CAMatthew.htm", "Matthew", "Matthaeum", 28),
    "mark":    ("CAMark.htm",    "Mark",    "Marcum",    16),
    "luke":    ("CALuke.htm",    "Luke",    "Lucam",     24),
    "john":    ("CAJohn.htm",    "John",    "Ioannem",   21),
}


def parse_catena_file(path: Path) -> list[dict]:
    """Return a list of chapters: { num, rows: list[tuple] }.

    Each row is either:
      - ("__header__", text) for colspan=2 section headers (Lectio N, etc.)
      - ("__scripture__", la, en) for rows whose <td> wraps content in
        <blockquote> — Bible verses commented on
      - (la, en) for ordinary patristic gloss rows
    The Catena Aurea's prologue/dedication isn't always anchored (CAJohn has
    no <a name="0">); rows seen before the first anchor are collected under
    chapter 0.
    """
    soup = load_html(path)
    body = soup.find("body") or soup

    # Find chapter anchors (name is a numeric string).
    chapter_anchors: list[Tag] = []
    for a in body.find_all("a", attrs={"name": True}):
        name = a.get("name", "")
        if re.fullmatch(r"\d+", name):
            chapter_anchors.append(a)

    chapter_ids = {id(a): int(a.get("name")) for a in chapter_anchors}
    chapters: dict[int, dict] = {0: {"num": 0, "rows": []}}
    # Default: any content before the first anchor goes to chapter 0 (prologue).
    current: dict | None = chapters[0]

    for el in body.find_all(True):
        if el.name == "a" and id(el) in chapter_ids:
            num = chapter_ids[id(el)]
            current = chapters.setdefault(num, {"num": num, "rows": []})
            continue
        if current is None:
            continue
        if el.name == "tr":
            tds = el.find_all("td", recursive=False)
            if len(tds) == 1:
                # colspan=2 row — likely a Lectio header.
                text = td_text(tds[0])
                if text.strip():
                    current["rows"].append(("__header__", text.strip()))
            elif len(tds) >= 2:
                # Skip the contents-table rows that list chapter links: each
                # cell is just "*N*" or similar (typically inside a table with
                # cellpadding=6 rather than 12). All cells very short, all
                # primarily a single <a href="#N"> link.
                if _is_catena_toc_row(tds):
                    continue
                la_td, en_td = tds[0], tds[1]
                la_is_quote = la_td.find("blockquote") is not None
                en_is_quote = en_td.find("blockquote") is not None
                la = td_text(la_td)
                en = td_text(en_td)
                # Skip chapter-header rows (e.g. "Caput 1" / "CHAPTER I") —
                # the chapter heading is already supplied by the markdown
                # # heading from the outline.
                if _is_catena_chapter_header(la, en):
                    continue
                if la_is_quote or en_is_quote:
                    if la or en:
                        current["rows"].append(("__scripture__", la, en))
                elif la or en:
                    current["rows"].append((la, en))

    # Drop chapter 0 if it has no rows (most Catenas have an anchored prologue).
    if not chapters[0]["rows"]:
        del chapters[0]

    return [chapters[k] for k in sorted(chapters)]


_TOC_LINK_RE = re.compile(r"^[\s\*]*\d+[\s\*]*$")
_CHAPTER_HDR_RE = re.compile(r"^[\s\*]*(?:Caput|Capitulum|CHAPTER|Chapter)\s+[IVXLCDM\d]+[\s\*]*\.?$", re.IGNORECASE)


def _is_catena_chapter_header(la: str, en: str) -> bool:
    """Detect rows that label the chapter (e.g. "Caput 1" / "CHAPTER I").
    The markdown # heading from the outline already provides this label."""
    la_clean = la.strip().strip("*").strip()
    en_clean = en.strip().strip("*").strip()
    matches = 0
    if la_clean and _CHAPTER_HDR_RE.match(la_clean):
        matches += 1
    if en_clean and _CHAPTER_HDR_RE.match(en_clean):
        matches += 1
    return matches >= 1 and max(len(la_clean), len(en_clean)) < 40


def _is_catena_toc_row(tds) -> bool:
    """Heuristic: TOC rows in the Catena Aurea contents tables have cells
    containing just chapter numbers (often wrapped in asterisks like `*2*`)
    and link to in-file anchors. Filter them out so they don't leak into the
    prologue or chapter bodies."""
    if len(tds) < 2:
        return False
    short_link_count = 0
    for td in tds:
        text = td_text(td).strip()
        if not text:
            continue
        if len(text) > 10:
            return False
        if _TOC_LINK_RE.match(text):
            short_link_count += 1
    return short_link_count >= 2


def _catena_chapter_md(chapter: dict, lang: str, gospel_en: str, gospel_la: str) -> str:
    num = chapter["num"]
    if num == 0:
        heading_en = "Prologue and Dedication"
        heading_la = "Prologus et Dedicatio"
    else:
        heading_en = f"Chapter {num} — {gospel_en}"
        heading_la = f"Caput {num} — Evangelium secundum {gospel_la}"
    lines: list[str] = []
    lines.append(f"# {heading_en if lang == 'en-US' else heading_la}")
    lines.append("")
    for row in chapter["rows"]:
        kind = row[0]
        if kind == "__header__":
            text = row[1].strip().strip("*").strip()
            if text:
                lines.append(f"## {text}")
                lines.append("")
            continue
        if kind == "__scripture__":
            la, en = row[1], row[2]
            text = en if lang == "en-US" else la
            if not text:
                continue
            for line in text.split("\n"):
                line = line.strip()
                if line:
                    lines.append(f"> {line}")
            lines.append("")
            continue
        la, en = row[0], row[1]
        text = en if lang == "en-US" else la
        if not text:
            continue
        lines.append(text)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def build_catena(gospel_key: str) -> dict:
    src_name, gospel_en, gospel_la, n_chapters = CATENA_GOSPELS[gospel_key]
    src = CACHE / src_name
    if not src.is_file():
        return {"book": f"aquinas-catena-aurea-{gospel_key}", "error": f"missing {src_name}"}
    book_dir = BOOKS_ROOT / "catena-aurea" / gospel_key
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    en_dir.mkdir(parents=True, exist_ok=True)
    la_dir.mkdir(parents=True, exist_ok=True)

    chapters = parse_catena_file(src)
    toc: list[dict] = []
    for chap in chapters:
        num = chap["num"]
        cid = "prologue" if num == 0 else f"ch{num:02d}"
        _write_md(en_dir / f"{cid}.md", _catena_chapter_md(chap, "en-US", gospel_en, gospel_la))
        _write_md(la_dir / f"{cid}.md", _catena_chapter_md(chap, "la", gospel_en, gospel_la))
        if num == 0:
            toc.append({"id": cid, "title": {"en-US": "Prologue and Dedication", "la": "Prologus et Dedicatio"}})
        else:
            toc.append({"id": cid, "title": {"en-US": f"Chapter {num}", "la": f"Caput {num}"}})

    manifest = {
        "id": f"aquinas-catena-aurea-{gospel_key}",
        "name": {
            "en-US": f"Catena Aurea on {gospel_en}",
            "la": f"Catena Aurea in Evangelium secundum {gospel_la}",
        },
        "author": AUTHOR,
        "description": {
            "en-US": f"Aquinas's verse-by-verse gloss on the Gospel of {gospel_en}, weaving the Greek and Latin Fathers into a single continuous commentary. Commissioned by Pope Urban IV. English translation by John Henry Parker (J.G.F. and J. Rivington, London, 1841–1845); the project that produced the *Library of the Fathers* under Newman, Pusey, and Keble.",
            "la": f"Glossa textualis super Evangelium secundum {gospel_la}, ex commentariis sanctorum patrum graecorum et latinorum confecta, Urbano IV pontifice iubente.",
        },
        "composed": "1262–1268",
        "languages": ["en-US", "la"],
        "sources": [
            {
                "language": "en-US",
                "url": GEREMIA_URL,
                "description": "John Henry Parker translation, London 1841–1845 (J.G.F. and J. Rivington), with the dedication translated by Joseph Kenny OP. Public domain. Mirrored from dhspriory.org via the Geremia/AquinasOperaOmnia GitHub repository.",
            },
            {
                "language": "la",
                "url": GEREMIA_URL,
                "description": "Latin text from Aquinas's autograph (Marietti edition), public domain. Mirrored via Geremia.",
            },
        ],
        "toc": toc,
    }
    _write_manifest(book_dir, manifest)
    return {"book": manifest["id"], "chapters": len(chapters)}


def build_catena_matthew() -> dict:
    return build_catena("matthew")


def build_catena_mark() -> dict:
    return build_catena("mark")


def build_catena_luke() -> dict:
    return build_catena("luke")


def build_catena_john() -> dict:
    return build_catena("john")


# ---------------------------------------------------------------------------
# Linear-chapter parser
# ---------------------------------------------------------------------------
# Used by SCG (Pegis), Compendium, opuscula, Aristotle commentaries, biblical
# commentaries. The format is: one HTML file containing a stream of <h2>/<h3>
# chapter / lectio headers + bilingual <table> bodies, often with a header
# table-of-contents at the top.

@dataclass
class LinearChapter:
    anchor: str
    num: int | str
    title_en: str
    title_la: str
    body_en: str
    body_la: str


def parse_linear_file(path: Path, anchor_re: str) -> list[LinearChapter]:
    """Split a linear bilingual file into chapters by anchor name.

    `anchor_re` matches the anchor name pattern that opens each chapter,
    e.g. r"^(\\d+)$" for ContraGentiles1.htm's anchors, or whatever the
    file uses."""
    soup = load_html(path)
    body = soup.find("body") or soup

    chapters: list[LinearChapter] = []
    pattern = re.compile(anchor_re)
    current: dict | None = None

    def commit():
        if current is None or current.get("num") is None:
            return
        # Stitch all encountered tds.
        la = "\n\n".join(s for s in current["la"] if s).strip()
        en = "\n\n".join(s for s in current["en"] if s).strip()
        chapters.append(LinearChapter(
            anchor=current["anchor"],
            num=current["num"],
            title_en=current["title_en"],
            title_la=current["title_la"],
            body_en=en,
            body_la=la,
        ))

    # The regex needs to match even when the cell content opens with bold/
    # italic markers (`**Caput 1...**`), so we drop the `^` anchor and use
    # search() — but only on the lead-stripped version of the cell text.
    title_hdr_re = re.compile(r"(?:Caput|Capitulum|CHAPTER|Chapter)\s+[IVXLCDM\d]+", re.IGNORECASE)
    lectio_hdr_re = re.compile(r"^(?:Lectio|LECTURE|Lecture)\s+[IVXLCDM\d]+", re.IGNORECASE)
    for el in body.descendants:
        if not isinstance(el, Tag):
            continue
        if el.name == "a" and el.get("name"):
            name = el.get("name", "")
            m = pattern.match(name)
            if m:
                commit()
                # The anchor itself often wraps the chapter title in <b>; pull
                # any inline text as the initial English title.
                anchor_text = td_text(el)
                current = {
                    "anchor": name,
                    "num": m.group(1) if m.groups() else name,
                    "title_en": anchor_text,
                    "title_la": "",
                    "la": [],
                    "en": [],
                    "skip_next_title_row": True,
                }
                continue
        if current is None:
            continue
        if el.name in ("h2", "h3", "h4"):
            text = td_text(el)
            if not current["title_en"]:
                current["title_en"] = text
        if el.name == "tr":
            tds = el.find_all("td", recursive=False)
            if len(tds) >= 2:
                la_td, en_td = tds[0], tds[1]
                la = td_text(la_td)
                en = td_text(en_td)
                # Title rows: "Caput N — title" pattern. Inspect cells with the
                # bold/italic prefix stripped so "**Caput 1**" still matches.
                la_for_match = la.lstrip("*").lstrip()
                en_for_match = en.lstrip("*").lstrip()
                if current.get("skip_next_title_row") and (
                    title_hdr_re.match(la_for_match) or title_hdr_re.match(en_for_match)
                ):
                    if not current["title_la"]:
                        current["title_la"] = la
                    current["skip_next_title_row"] = False
                    continue
                current["skip_next_title_row"] = False
                la_stripped = la.strip().strip("*").strip()
                en_stripped = en.strip().strip("*").strip()
                # Lectio/Lecture sub-headers (e.g. "Lectio 1" / "LECTURE 1"):
                # short bilingual rows that match the lectio pattern.
                if (lectio_hdr_re.match(la_stripped) or lectio_hdr_re.match(en_stripped)) and len(en) < 60:
                    label = en_stripped if en_stripped else la_stripped
                    current["la"].append(f"\n## {la_stripped}\n" if la_stripped else "")
                    current["en"].append(f"\n## {label}\n" if label else "")
                    continue
                # Scripture rows: td wraps content in <blockquote>.
                la_quote = la_td.find("blockquote") is not None
                en_quote = en_td.find("blockquote") is not None
                if la_quote or en_quote:
                    if la:
                        current["la"].append("\n".join(f"> {line.strip()}" for line in la.split("\n") if line.strip()))
                    if en:
                        current["en"].append("\n".join(f"> {line.strip()}" for line in en.split("\n") if line.strip()))
                    continue
                current["la"].append(la)
                current["en"].append(en)

    commit()
    return chapters


def parse_linear_file_by_header_rows(path: Path) -> list[LinearChapter]:
    """Alternative parser: split chapters by table rows whose first/second
    cell text starts with "Caput N" / "Capitulum N" / "CHAPTER N".

    Used for opuscula like De Ente et Essentia that lack <a name> anchors and
    use only header rows for boundaries."""
    soup = load_html(path)
    body = soup.find("body") or soup
    chapters: list[LinearChapter] = []

    chapter_re = re.compile(
        r"^(?:Caput|Capitulum|CHAPTER|Chapter|Prooemium|Prologus|Lectio|LECTURE|Lecture|Lection|LESSON|Lesson)\s*([IVXLCDM\d]*)\b",
        re.IGNORECASE,
    )

    current: dict | None = None

    def commit():
        if current is None or current.get("num") is None:
            return
        chapters.append(LinearChapter(
            anchor=str(current["num"]),
            num=current["num"],
            title_en=current["title_en"],
            title_la=current["title_la"],
            body_en="\n\n".join(s for s in current["en"] if s).strip(),
            body_la="\n\n".join(s for s in current["la"] if s).strip(),
        ))

    n_proem = 0
    lectio_hdr_re = re.compile(r"^(?:Lectio|LECTURE|Lecture)\s+[IVXLCDM\d]+", re.IGNORECASE)
    for tr in body.find_all("tr"):
        tds = tr.find_all("td", recursive=False)
        if len(tds) < 2:
            continue
        la_td, en_td = tds[0], tds[1]
        la = td_text(la_td)
        en = td_text(en_td)
        la_match = chapter_re.match(la.strip().lstrip("*").strip())
        en_match = chapter_re.match(en.strip().lstrip("*").strip())
        if la_match or en_match:
            # Chapter boundary. The header row often also carries the chapter's
            # opening prose in the same <td> (Geremia files put the chapter
            # title inside a <b> tag at the top of the body td). Strip the
            # title line and keep the remainder as the first body chunk.
            commit()
            m = la_match or en_match
            num_text = (m.group(1) or "").strip() if m else ""
            if not num_text:
                # Prooemium or no number — assign sequential 0/proem
                num = "prooemium" if "Prooem" in la or "Prologue" in en or "Prologus" in en else f"proem{n_proem}"
                n_proem += 1
            else:
                num = _roman_or_int(num_text)

            def _strip_header(s: str) -> str:
                inner = re.sub(
                    r"^(?:Caput|Capitulum|CHAPTER|Chapter|Prooemium|Prologus|Lectio|LECTURE|Lecture|Lection|LESSON|Lesson)\s*[IVXLCDM\d]*\b[\.,:]*\s*",
                    "", s.lstrip("*").lstrip(),
                    count=1, flags=re.IGNORECASE,
                ).lstrip()
                # Strip any trailing or leading bold/italic markers left
                # behind by header removal.
                inner = inner.strip()
                while inner.startswith("**"):
                    inner = inner[2:].strip()
                while inner.endswith("**"):
                    inner = inner[:-2].strip()
                return inner

            la_rest = _strip_header(la).strip()
            en_rest = _strip_header(en).strip()
            current = {
                "num": num,
                "title_en": "",
                "title_la": "",
                "la": [la_rest] if la_rest else [],
                "en": [en_rest] if en_rest else [],
            }
            continue
        if current is None:
            continue
        la_stripped = la.strip().strip("*").strip()
        en_stripped = en.strip().strip("*").strip()
        # Inner Lectio/Lecture header — short bilingual marker like
        # "Lectio 1" / "LECTURE 1".
        if (lectio_hdr_re.match(la_stripped) or lectio_hdr_re.match(en_stripped)) and len(en) < 60:
            label = en_stripped or la_stripped
            if la_stripped:
                current["la"].append(f"\n## {la_stripped}\n")
            if label:
                current["en"].append(f"\n## {label}\n")
            continue
        # Scripture rows: td contains <blockquote>.
        la_quote = la_td.find("blockquote") is not None
        en_quote = en_td.find("blockquote") is not None
        if la_quote or en_quote:
            if la:
                current["la"].append("\n".join(f"> {line.strip()}" for line in la.split("\n") if line.strip()))
            if en:
                current["en"].append("\n".join(f"> {line.strip()}" for line in en.split("\n") if line.strip()))
            continue
        current["la"].append(la)
        current["en"].append(en)

    commit()
    return chapters


def _roman_or_int(s: str):
    s = s.strip().upper()
    if not s:
        return 0
    if s.isdigit():
        return int(s)
    roman = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    if not all(c in roman for c in s):
        return s.lower()
    total = 0
    prev = 0
    for c in reversed(s):
        v = roman[c]
        if v < prev:
            total -= v
        else:
            total += v
        prev = v
    return total


def parse_linear_file_p_bilingual(path: Path) -> list[LinearChapter]:
    """Parser for files like De Mixtione Elementorum that use <p> with
    Latin / English separated by <br> instead of bilingual <tr>/<td> pairs.

    Each paragraph is one numbered unit:
      <p><a name="Text">1. Latin text<br>
      English text</a>
    """
    soup = load_html(path)
    body = soup.find("body") or soup
    title_en = ""
    h1 = body.find("h1")
    if h1:
        title_en = td_text(h1).strip().split("\n")[0]
    la_chunks: list[str] = []
    en_chunks: list[str] = []
    for p in body.find_all("p"):
        text = td_text(p)
        if not text:
            continue
        # Split on first \n — Latin before, English after.
        if "\n" in text:
            la, _, en = text.partition("\n")
            la = la.strip()
            en = en.strip()
            if la:
                la_chunks.append(la)
            if en:
                en_chunks.append(en)
        else:
            # Only one line: treat as English (translator notes after the
            # bilingual section).
            en_chunks.append(text.strip())
    if not la_chunks and not en_chunks:
        return []
    return [LinearChapter(
        anchor="1",
        num=1,
        title_en=title_en,
        title_la=title_en,
        body_en="\n\n".join(en_chunks).strip(),
        body_la="\n\n".join(la_chunks).strip(),
    )]


def parse_linear_file_by_h3(path: Path) -> list[LinearChapter]:
    """Parser for files like SSLamentations.htm that lack <tr>/<td> and use
    flat <h3>...</h3> chapter boundaries with <p> content between.

    Each chapter spans from one <h3> heading to the next; content paragraphs
    are <p> elements. English-only content (no bilingual table)."""
    soup = load_html(path)
    body = soup.find("body") or soup
    chapters: list[LinearChapter] = []
    current: dict | None = None
    chapter_re = re.compile(
        r"(?:Caput|Capitulum|CHAPTER|Chapter|Prooemium|Prologus|Lectio|LECTURE|Lecture|Lection|LESSON|Lesson)\s*([IVXLCDM\d]*)",
        re.IGNORECASE,
    )

    def commit():
        if current is None:
            return
        chapters.append(LinearChapter(
            anchor=str(current["num"]),
            num=current["num"],
            title_en=current["title_en"],
            title_la="",
            body_en="\n\n".join(s for s in current["en"] if s).strip(),
            body_la="",
        ))

    n_proem = 0
    # Heuristic: a "chapter heading" <p> is short, centered (style contains
    # "text-align: center" or similar), and bold, with content matching
    # CHAPTER N or similar.
    for el in body.find_all(["h2", "h3", "h4", "p", "blockquote"]):
        is_heading_el = el.name in ("h2", "h3", "h4")
        text = td_text(el).strip()
        first_line = text.split("\n")[0].strip().strip("*").strip()
        if not is_heading_el and el.name == "p":
            # Try treating a <p> as a heading if its first line matches the
            # CHAPTER/Lectio pattern AND the whole <p> is short enough that
            # it's clearly a heading (not body prose that happens to start
            # with "Chapter N"). The whole-p length budget is 200 chars to
            # accommodate `<b>CHAPTER N<br>folio-ref</b>` style headings.
            stripped = text.strip().strip("*").strip()
            if len(stripped) < 200 and chapter_re.match(first_line):
                is_heading_el = True
        if is_heading_el:
            m = chapter_re.search(first_line)
            if m:
                commit()
                num_text = (m.group(1) or "").strip()
                if num_text:
                    num = _roman_or_int(num_text)
                else:
                    num = "prooemium" if any(w in text.lower() for w in ("prooemium", "prologue", "prologus")) else f"proem{n_proem}"
                    n_proem += 1
                title = re.sub(
                    r"^(?:Chapter|CHAPTER|Caput|Lectio|Lecture|Lection|Lesson|Prologus|Prooemium)\s*[IVXLCDM\d]*[:\.,]?\s*",
                    "",
                    text,
                    flags=re.IGNORECASE,
                ).strip().strip("*").strip()
                current = {
                    "num": num,
                    "title_en": title,
                    "en": [],
                }
                continue
        if current is None:
            continue
        if not text:
            continue
        if el.name == "blockquote":
            current["en"].append("\n".join(f"> {line.strip()}" for line in text.split("\n") if line.strip()))
        else:
            current["en"].append(text)
    commit()
    return chapters


def parse_linear_file_single_chapter(path: Path) -> list[LinearChapter]:
    """Final fallback: treat the entire file as one chapter, collecting every
    bilingual <tr> into a single body. Used for opuscula that have no chapter
    divisions (e.g. De aeternitate mundi, De motu cordis)."""
    soup = load_html(path)
    body = soup.find("body") or soup
    la_chunks: list[str] = []
    en_chunks: list[str] = []
    title_en = ""
    title_la = ""
    h1 = body.find("h1")
    if h1:
        title_en = td_text(h1).strip().split("\n")[0]
        title_la = title_en
    for tr in body.find_all("tr"):
        tds = tr.find_all("td", recursive=False)
        if len(tds) < 2:
            continue
        la = td_text(tds[0])
        en = td_text(tds[1])
        if la:
            la_chunks.append(la)
        if en:
            en_chunks.append(en)
    if not en_chunks and not la_chunks:
        return []
    return [LinearChapter(
        anchor="1",
        num=1,
        title_en=title_en,
        title_la=title_la,
        body_en="\n\n".join(en_chunks).strip(),
        body_la="\n\n".join(la_chunks).strip(),
    )]


def _clean_chapter_title(text: str, lang: str) -> str:
    """Strip 'CHAPTER N' / 'Caput N' prefixes and markdown wrappers; keep the
    descriptive title."""
    if not text:
        return ""
    # Strip markdown bold/italic markers around the whole text.
    text = text.strip().strip("*_").strip()
    parts = [p.strip().strip("*_").strip() for p in re.split(r"\n+", text) if p.strip()]
    # Drop lines that are pure "CHAPTER N" / "Caput N" / etc.
    keep = []
    for p in parts:
        if re.fullmatch(r"(?:CHAPTER|Chapter|CAPUT|Caput|Capitulum)\s+[IVXLCDM\d]+\s*[\.,]?\s*[IVXLCDM\d]*",
                        p, re.IGNORECASE):
            continue
        if re.fullmatch(r"(?:PART\s+\w+|LIBER\s+\w+|BOOK\s+\w+)", p, re.IGNORECASE):
            continue
        keep.append(p)
    return " — ".join(keep) if keep else ""


@dataclass
class LinearWorkSpec:
    book_id: str
    name_en: str
    name_la: str
    composed: int | str
    description_en: str
    description_la: str
    translator_note_en: str   # appears in sources for the English translation
    source_files: list[str]   # file paths in CACHE
    anchor_re: str = r"^(\d+)$"
    chapter_label_en: str = "Chapter"
    chapter_label_la: str = "Caput"
    # Optional book-grouping: if multiple source files, group chapters by file.
    group_titles_en: list[str] = field(default_factory=list)
    group_titles_la: list[str] = field(default_factory=list)
    # Parser mode: "anchor" (default, requires <a name>) or "header-rows"
    # (split by Caput/CHAPTER text in tr cells, no anchors needed).
    mode: str = "anchor"
    # Pauline biblical-commentary anchor encoding: <chap><lec> (e.g. "11" =
    # chapter 1 lectio 1, "162" = chapter 16 lectio 2). When True the linear
    # builder decodes anchors into chapter/lectio pairs for TOC and filenames.
    pauline_anchors: bool = False


def build_linear_work(spec: LinearWorkSpec, sub_path: str | None = None) -> dict:
    """Generic builder for linear-chapter works.

    `sub_path` is the relative path under content/books/aquinas-opera-omnia/
    where the book is written (e.g. "opuscula/de-ente-et-essentia"). If None,
    derives from `spec.book_id` (strips the "aquinas-" prefix and uses that).
    """
    if sub_path is None:
        sub = spec.book_id.removeprefix("aquinas-")
        book_dir = BOOKS_ROOT / sub
    else:
        book_dir = BOOKS_ROOT / sub_path
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    en_dir.mkdir(parents=True, exist_ok=True)
    la_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    total = 0
    has_groups = len(spec.source_files) > 1 and spec.group_titles_en

    for idx, rel in enumerate(spec.source_files):
        src = CACHE / rel
        if not src.is_file():
            print(f"  warn: {rel} not found, skipping")
            continue
        try:
            if spec.mode == "header-rows":
                chapters = parse_linear_file_by_header_rows(src)
            elif spec.mode == "single-chapter":
                chapters = parse_linear_file_single_chapter(src)
            elif spec.mode == "p-bilingual":
                chapters = parse_linear_file_p_bilingual(src)
            elif spec.mode == "h3-chapters":
                chapters = parse_linear_file_by_h3(src)
            else:
                chapters = parse_linear_file(src, spec.anchor_re)
                # Auto-fall back to header-rows mode if anchors yielded nothing.
                if not chapters:
                    chapters = parse_linear_file_by_header_rows(src)
                # Try h3 splitting if no <tr>/<td> bilingual structure.
                if not chapters or (len(chapters) == 1 and not chapters[0].body_la):
                    h3_chapters = parse_linear_file_by_h3(src)
                    if len(h3_chapters) > 1:
                        chapters = h3_chapters
                # Final fallback for unchaptered short treatises.
                if not chapters:
                    chapters = parse_linear_file_single_chapter(src)
                # Last resort: <p>-bilingual format.
                if not chapters:
                    chapters = parse_linear_file_p_bilingual(src)
        except Exception as exc:
            print(f"  warn: {rel} parse failed: {exc}")
            continue

        group_node = None
        if has_groups:
            group_id = f"book-{idx + 1}"
            group_node = {
                "id": group_id,
                "title": {
                    "en-US": spec.group_titles_en[idx] if idx < len(spec.group_titles_en) else f"Book {idx + 1}",
                    "la": spec.group_titles_la[idx] if idx < len(spec.group_titles_la) else f"Liber {idx + 1}",
                },
                "children": [],
            }
            toc.append(group_node)

        for chap in chapters:
            num = chap.num
            try:
                num_int = int(num)
            except (ValueError, TypeError):
                num_int = 0
            # Pauline anchor decoding: 2-digit "XY" → ch X lec Y;
            # 3-digit "XYZ" → ch XY lec Z.
            pauline_ch, pauline_lec = None, None
            if spec.pauline_anchors and num_int > 0:
                s = str(num_int)
                if len(s) == 1:
                    # Just a chapter number, no lectio (rare; prologue case)
                    pauline_ch, pauline_lec = num_int, 0
                elif len(s) == 2:
                    pauline_ch, pauline_lec = int(s[0]), int(s[1])
                else:  # 3-digit
                    pauline_ch, pauline_lec = int(s[:2]), int(s[2])

            if pauline_ch is not None and pauline_ch > 0 and pauline_lec > 0:
                cid_base = f"c{pauline_ch:02d}-l{pauline_lec}"
            elif pauline_ch is not None and pauline_ch == 0:
                cid_base = "prologue"
            else:
                cid_base = f"ch{num_int:03d}" if num_int else f"ch-{slug(str(num))}"
            cid = f"b{idx + 1}-{cid_base}" if has_groups else cid_base
            title_en_clean = _clean_chapter_title(chap.title_en, "en-US")
            title_la_clean = _clean_chapter_title(chap.title_la, "la") or title_en_clean

            if pauline_ch is not None and pauline_ch > 0 and pauline_lec > 0:
                md_en = _pauline_chapter_md(
                    pauline_ch, pauline_lec, title_en_clean, chap.body_en, "en-US",
                    spec.chapter_label_en, spec.chapter_label_la,
                )
                md_la = _pauline_chapter_md(
                    pauline_ch, pauline_lec, title_la_clean, chap.body_la, "la",
                    spec.chapter_label_en, spec.chapter_label_la,
                )
            elif pauline_ch is not None and pauline_ch == 0:
                md_en = f"# Prologue\n\n{chap.body_en.strip()}\n"
                md_la = f"# Prologus\n\n{chap.body_la.strip()}\n"
            else:
                md_en = _linear_chapter_md(num_int or num, title_en_clean, chap.body_en, spec.chapter_label_en)
                md_la = _linear_chapter_md(num_int or num, title_la_clean, chap.body_la, spec.chapter_label_la)
            _write_md(en_dir / f"{cid}.md", md_en)
            _write_md(la_dir / f"{cid}.md", md_la)
            total += 1
            if pauline_ch is not None and pauline_ch > 0 and pauline_lec > 0:
                node_title_en = f"Chapter {pauline_ch}, Lecture {pauline_lec}"
                if title_en_clean:
                    node_title_en += f" — {title_en_clean}"
                node_title_la = f"Caput {pauline_ch}, Lectio {pauline_lec}"
                if title_la_clean:
                    node_title_la += f" — {title_la_clean}"
            elif pauline_ch is not None and pauline_ch == 0:
                node_title_en = "Prologue"
                node_title_la = "Prologus"
            elif isinstance(num, str) and num.startswith("prooemium"):
                node_title_en = "Prooemium"
                node_title_la = "Prooemium"
            elif isinstance(num, str) and num.startswith("proem"):
                node_title_en = "Prologue"
                node_title_la = "Prologus"
            else:
                node_title_en = f"{spec.chapter_label_en} {num_int or num}"
                if title_en_clean:
                    node_title_en += f" — {title_en_clean}"
                node_title_la = f"{spec.chapter_label_la} {num_int or num}"
                if title_la_clean:
                    node_title_la += f" — {title_la_clean}"
            node = {
                "id": cid,
                "title": {"en-US": node_title_en, "la": node_title_la},
            }
            (group_node["children"] if group_node else toc).append(node)

    manifest = {
        "id": spec.book_id,
        "name": {"en-US": spec.name_en, "la": spec.name_la},
        "author": AUTHOR,
        "description": {"en-US": spec.description_en, "la": spec.description_la},
        "composed": spec.composed,
        "languages": ["en-US", "la"],
        "sources": [
            {
                "language": "en-US",
                "url": GEREMIA_URL,
                "description": spec.translator_note_en,
            },
            {
                "language": "la",
                "url": GEREMIA_URL,
                "description": "Latin Leonine / Marietti edition (public domain), mirrored from dhspriory.org via the Geremia/AquinasOperaOmnia GitHub repository.",
            },
        ],
        "toc": toc,
    }
    _write_manifest(book_dir, manifest)
    return {"book": spec.book_id, "chapters": total}


def _pauline_chapter_md(
    chap: int, lec: int, title: str, body: str, lang: str,
    label_en: str = "Chapter", label_la: str = "Caput",
) -> str:
    """Render a chapter+sub-unit heading. For biblical commentaries the
    natural labels are Chapter/Lecture; for Boethius's De Trinitate they're
    Question/Article. The spec's chapter_label_en/la are used as the upper
    label and the lower label is derived (Lecture vs Article)."""
    upper_en, upper_la = label_en, label_la
    if label_en.lower() == "article":
        outer_en, outer_la = "Question", "Quaestio"
        inner_en, inner_la = "Article", "Articulus"
    elif label_en.lower() in ("section", "lecture", "lesson", "lectio"):
        outer_en, outer_la = "Chapter", "Caput"
        inner_en, inner_la = "Lecture", "Lectio"
    else:
        outer_en, outer_la = "Chapter", "Caput"
        inner_en, inner_la = "Lecture", "Lectio"
    if lang == "en-US":
        heading = f"# {outer_en} {chap}, {inner_en} {lec}"
    else:
        heading = f"# {outer_la} {chap}, {inner_la} {lec}"
    if title:
        heading += f" — {title}"
    return f"{heading}\n\n{body.strip()}\n"


def _linear_chapter_md(num, title: str, body: str, label: str) -> str:
    if isinstance(num, str) and num.startswith("prooemium"):
        heading = "# Prooemium"
    elif isinstance(num, str) and num.startswith("proem"):
        heading = "# Prologue"
    else:
        heading = f"# {label} {num}"
        if title:
            heading += f" — {title}"
    return f"{heading}\n\n{body.strip()}\n"


# ---------------------------------------------------------------------------
# Disputed Questions parser
# ---------------------------------------------------------------------------
# Each DQ HTML file holds one Question with N articles. The articles are
# anchor-delimited (<a name="1">, "2", etc.) and contain "ARTICLE I/II..."
# header rows followed by bilingual <tr>/<td> pairs. We don't try to split
# objection / sed-contra / respondeo (the Mulligan English uses prose markers
# like "Difficulties" / "To the Contrary" / "Reply" that differ between
# disputed questions). Instead each article becomes one flat chapter.


def parse_dq_question_file(path: Path) -> tuple[str, list[dict]]:
    """Return (question_title, articles[]). Each article is dict
    {num, title_en, title_la, rows: list[(la, en)]}."""
    soup = load_html(path)
    body = soup.find("body") or soup

    title_en = ""
    h2 = body.find("h2")
    if h2:
        title_en = td_text(h2).strip()

    # Anchors named "N" or "Q:N" open articles. De Potentia uses "1:1" / "1:2"
    # / etc. (Q-numbered). For other DQ files anchors are plain integers.
    articles: list[dict] = []
    anchor_ids: dict[int, dict] = {}
    seen_articles: set[int] = set()
    for a in body.find_all("a", attrs={"name": True}):
        name = a.get("name", "")
        m = re.fullmatch(r"(?:\d+:)?(\d+)", name)
        if not m:
            continue
        anum = int(m.group(1))
        if anum in seen_articles:
            # Second / third anchor with the same article number — skip.
            continue
        seen_articles.add(anum)
        art = {"num": anum, "rows": [], "title_en": "", "title_la": ""}
        articles.append(art)
        anchor_ids[id(a)] = art

    current: dict | None = None
    for el in body.find_all(True):
        if el.name == "a" and id(el) in anchor_ids:
            current = anchor_ids[id(el)]
            continue
        if current is None:
            continue
        if el.name == "tr":
            tds = el.find_all("td", recursive=False)
            if len(tds) == 1:
                # colspan=2 header row, contains "ARTICLE I" + title.
                text = td_text(tds[0]).strip()
                first_line = text.split("\n")[0].strip().strip("*_").strip()
                is_article_header = (
                    re.match(r"^ARTICLE\s+[IVXLCDM\d]+", first_line, re.IGNORECASE)
                    or re.match(r"^Article\s+\d+", first_line)
                )
                if not current["title_en"] and is_article_header:
                    current["title_en"] = "\n".join(
                        l for l in text.split("\n") if l.strip()
                    )
                else:
                    current["rows"].append(("__hdr__", text))
            elif len(tds) >= 2:
                la = td_text(tds[0])
                en = td_text(tds[1])
                if la or en:
                    current["rows"].append((la, en))

    return title_en, articles


def _dq_article_md(art: dict, lang: str) -> str:
    lines: list[str] = []
    num = art["num"]
    lines.append(f"# {'Article' if lang == 'en-US' else 'Articulus'} {num}")
    # If the title block contains the question (e.g. "What is truth?"), include
    # it as a subheading.
    if art["title_en"]:
        title_lines = []
        for raw in art["title_en"].split("\n"):
            stripped = raw.strip().strip("*_").strip()
            if not stripped:
                continue
            if re.match(r"^ARTICLE\s+[IVXLCDM\d]+\s*[\.,:]?\s*$", stripped, re.IGNORECASE):
                continue
            if re.match(r"^Article\s+\d+\s*[\.,:]?\s*$", stripped):
                continue
            title_lines.append(stripped)
        if title_lines:
            lines.append("")
            lines.append("*" + " ".join(title_lines) + "*")
    lines.append("")
    for la, en in art["rows"]:
        if la == "__hdr__":
            text = en.strip().strip("*_").strip()
            if text and not re.fullmatch(r"ARTICLE\s+[IVXLCDM\d]+\s*[\.,:]*", text, re.IGNORECASE):
                lines.append(f"## {text}")
                lines.append("")
            continue
        body = en if lang == "en-US" else la
        if not body:
            continue
        lines.append(body)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


@dataclass
class DQWorkSpec:
    book_id: str
    sub_path: str
    name_en: str
    name_la: str
    composed: int | str
    description_en: str
    description_la: str
    translator_note_en: str
    # File globber: prefix + numeric range, or explicit list.
    file_prefix: str           # e.g. "QDdeVer"
    question_count: int
    question_titles_en: dict[int, str] = field(default_factory=dict)
    # For De Unione Verbi where one work has Q1 with N articles each in a
    # separate file (QDdeUnione.htm = article 1, QDdeUnione2.htm = article 2,
    # etc.). When True, the loop iterates files as articles of Q1 instead of
    # as separate questions.
    single_question_multi_file: bool = False


def _parse_dq_article_whole_file(path: Path, anum: int) -> dict | None:
    """For single_question_multi_file works: read the whole bilingual file as
    one article. Drop the contents-table navigation rows. The article rows
    are the bilingual <tr>/<td> pairs that follow."""
    soup = load_html(path)
    body = soup.find("body") or soup
    rows: list[tuple[str, str]] = []
    title_en = ""
    for tr in body.find_all("tr"):
        tds = tr.find_all("td", recursive=False)
        if len(tds) == 1:
            text = td_text(tds[0]).strip()
            if text and not title_en and re.search(r"(?:Article|Articulus)\s+[IVXLCDM\d]+", text, re.IGNORECASE):
                title_en = text
            elif text:
                rows.append(("__hdr__", text))
        elif len(tds) >= 2:
            la = td_text(tds[0])
            en = td_text(tds[1])
            if la or en:
                rows.append((la, en))
    if not rows:
        return None
    return {"num": anum, "rows": rows, "title_en": title_en, "title_la": ""}


def build_dq_work(spec: DQWorkSpec) -> dict:
    book_dir = BOOKS_ROOT / spec.sub_path
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    en_dir.mkdir(parents=True, exist_ok=True)
    la_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    total = 0

    if spec.single_question_multi_file:
        # Each file is one ARTICLE of a single Question (Q1).
        q_node = {
            "id": "q01",
            "title": {
                "en-US": "Question 1",
                "la": "Quaestio 1",
            },
            "children": [],
        }
        for an in range(1, spec.question_count + 1):
            src = CACHE / f"{spec.file_prefix}{an}.htm"
            if not src.is_file():
                alt = CACHE / f"{spec.file_prefix}.htm"
                if alt.is_file() and an == 1:
                    src = alt
                else:
                    print(f"  skip {src.name}: not found")
                    continue
            art = _parse_dq_article_whole_file(src, an)
            if art is None:
                continue
            aid = f"q01-a{an:02d}"
            _write_md(en_dir / f"{aid}.md", _dq_article_md(art, "en-US"))
            _write_md(la_dir / f"{aid}.md", _dq_article_md(art, "la"))
            total += 1
            q_node["children"].append({
                "id": aid,
                "title": {
                    "en-US": f"Article {an}",
                    "la": f"Articulus {an}",
                },
            })
        if q_node["children"]:
            toc.append(q_node)
    else:
        for qn in range(1, spec.question_count + 1):
            src = CACHE / f"{spec.file_prefix}{qn}.htm"
            if not src.is_file():
                # Some DQ files use <prefix>.htm for Q1 and <prefix>N.htm for Q2+,
                # while single-question works (de-anima, de-spiritualibus-creaturis)
                # use <prefix>.htm alone.
                alt = CACHE / f"{spec.file_prefix}.htm"
                if alt.is_file() and qn == 1:
                    src = alt
                else:
                    print(f"  skip {src.name}: not found")
                    continue
            try:
                title_en, articles = parse_dq_question_file(src)
            except Exception as exc:
                print(f"  warn: {src.name} parse failed: {exc}")
                continue
            if not articles:
                continue
            q_id = f"q{qn:02d}"
            q_node = {
                "id": q_id,
                "title": {
                    "en-US": f"Question {qn}" + (f" — {title_en}" if title_en else ""),
                    "la": f"Quaestio {qn}",
                },
                "children": [],
            }
            for art in articles:
                aid = f"{q_id}-a{art['num']:02d}"
                _write_md(en_dir / f"{aid}.md", _dq_article_md(art, "en-US"))
                _write_md(la_dir / f"{aid}.md", _dq_article_md(art, "la"))
                total += 1
                q_node["children"].append({
                    "id": aid,
                    "title": {
                        "en-US": f"Article {art['num']}",
                        "la": f"Articulus {art['num']}",
                    },
                })
            toc.append(q_node)

    manifest = {
        "id": spec.book_id,
        "name": {"en-US": spec.name_en, "la": spec.name_la},
        "author": AUTHOR,
        "description": {"en-US": spec.description_en, "la": spec.description_la},
        "composed": spec.composed,
        "languages": ["en-US", "la"],
        "sources": [
            {"language": "en-US", "url": GEREMIA_URL, "description": spec.translator_note_en},
            {"language": "la", "url": GEREMIA_URL,
             "description": "Latin Leonine / Marietti edition (public domain), mirrored via the Geremia/AquinasOperaOmnia GitHub repository."},
        ],
        "toc": toc,
    }
    _write_manifest(book_dir, manifest)
    return {"book": spec.book_id, "articles": total}


def build_quodlibetales() -> dict:
    """QDquodlib.htm holds all 12 Quodlibets in one file. Anchors are
    "<Q>-<A>" (e.g. 1-1, 2-2, 9-4). Quodlibets 1 & 2 have English (Sandra
    Edwards, PIMS 1983); the rest are Latin only with scattered English
    fragments by Freddoso and West.
    """
    src = CACHE / "QDquodlib.htm"
    if not src.is_file():
        return {"book": "aquinas-quodlibetales", "error": "missing QDquodlib.htm"}
    book_dir = BOOKS_ROOT / "disputed-questions" / "quodlibetales"
    en_dir = book_dir / "en-US"
    la_dir = book_dir / "la"
    en_dir.mkdir(parents=True, exist_ok=True)
    la_dir.mkdir(parents=True, exist_ok=True)

    soup = load_html(src)
    body = soup.find("body") or soup
    anchor_re = re.compile(r"^(\d+)-(\d+)$")

    # Collect each anchor in document order with its (Q, A) tuple.
    article_anchors: list[tuple[Tag, int, int]] = []
    seen: set[tuple[int, int]] = set()
    for a in body.find_all("a", attrs={"name": True}):
        m = anchor_re.match(a.get("name", ""))
        if not m:
            continue
        key = (int(m.group(1)), int(m.group(2)))
        if key in seen:
            continue
        seen.add(key)
        article_anchors.append((a, key[0], key[1]))

    article_data: dict[tuple[int, int], dict] = {
        (q, a): {"q": q, "a": a, "title": "", "rows": []}
        for _, q, a in article_anchors
    }
    anchor_ids = {id(a): article_data[(q, an)] for a, q, an in article_anchors}

    current: dict | None = None
    for el in body.find_all(True):
        if el.name == "a" and id(el) in anchor_ids:
            current = anchor_ids[id(el)]
            # The anchor often wraps the question/article title in <b>.
            t = td_text(el).strip().strip("*_").strip()
            if t and not current["title"]:
                current["title"] = t.split("\n")[0]
            continue
        if current is None:
            continue
        if el.name == "tr":
            tds = el.find_all("td", recursive=False)
            if len(tds) == 1:
                txt = td_text(tds[0]).strip()
                if txt:
                    current["rows"].append(("__hdr__", txt))
            elif len(tds) >= 2:
                la = td_text(tds[0])
                en = td_text(tds[1])
                if la or en:
                    current["rows"].append((la, en))

    # Group by Quodlibet.
    toc: list[dict] = []
    total = 0
    by_quodlibet: dict[int, list[dict]] = {}
    for key in sorted(article_data):
        q, a = key
        by_quodlibet.setdefault(q, []).append(article_data[key])

    roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]
    for q in sorted(by_quodlibet):
        q_node = {
            "id": f"q{q:02d}",
            "title": {
                "en-US": f"Quodlibet {roman[q-1] if q-1 < len(roman) else q}",
                "la": f"Quodlibet {roman[q-1] if q-1 < len(roman) else q}",
            },
            "children": [],
        }
        for art in by_quodlibet[q]:
            aid = f"q{q:02d}-a{art['a']:02d}"
            _write_md(en_dir / f"{aid}.md", _quodlib_article_md(art, "en-US"))
            _write_md(la_dir / f"{aid}.md", _quodlib_article_md(art, "la"))
            total += 1
            q_node["children"].append({
                "id": aid,
                "title": {
                    "en-US": f"Article {art['a']}" + (f" — {_short_title(art['title'])}" if art['title'] else ""),
                    "la": f"Articulus {art['a']}",
                },
            })
        toc.append(q_node)

    manifest = {
        "id": "aquinas-quodlibetales",
        "name": {"en-US": "Quodlibetal Questions", "la": "Quaestiones Quodlibetales"},
        "author": AUTHOR,
        "description": {
            "en-US": "Twelve sets of *quodlibeta* — open-topic disputations conducted by Aquinas at Paris (Advent and Lent, 1268–1272) in which the master answered any question put by the audience. Quodlibets I–II have a full English translation by Sandra Edwards (PIMS, 1983); Quodlibets III–XII are Latin only with scattered English fragments by Freddoso and West.",
            "la": "Duodecim quodlibeta — disputationes Thomae Parisienses (Adventu et Quadragesima, 1268–1272) in quibus magister cuilibet ex auditoribus quaerenti respondebat.",
        },
        "composed": "1268–1272",
        "languages": ["en-US", "la"],
        "sources": [
            {
                "language": "en-US",
                "url": GEREMIA_URL,
                "description": "Quodlibets I–II: Sandra Edwards, *Quodlibetal Questions 1 and 2* (Mediaeval Sources in Translation 27, Pontifical Institute of Mediaeval Studies, Toronto, 1983) — may be under copyright until 2078. Quodlibets III–XII: partial English fragments by Alfred J. Freddoso and Jason Lewis Andrew West. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            },
            {
                "language": "la",
                "url": GEREMIA_URL,
                "description": "Latin Leonine / Marietti edition (public domain), mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            },
        ],
        "toc": toc,
    }
    _write_manifest(book_dir, manifest)
    return {"book": "aquinas-quodlibetales", "articles": total}


def _short_title(text: str) -> str:
    text = re.sub(r"^(?:Article|Articulus|Question|Quaestio)\s+\d+\s*[:\.,]?\s*", "", text, flags=re.IGNORECASE)
    text = text.strip().strip("*_").strip()
    if len(text) > 80:
        text = text[:77].rstrip() + "..."
    return text


def _quodlib_article_md(art: dict, lang: str) -> str:
    q, a = art["q"], art["a"]
    label = "Quodlibet" if lang == "en-US" else "Quodlibet"
    lines = [f"# {label} {q}, Article {a}" if lang == "en-US" else f"# Quodlibet {q}, Articulus {a}"]
    if art["title"]:
        lines.append("")
        lines.append(f"*{art['title']}*")
    lines.append("")
    for la, en in art["rows"]:
        if la == "__hdr__":
            text = en.strip().strip("*_").strip()
            if text:
                lines.append(f"## {text}")
                lines.append("")
            continue
        body = en if lang == "en-US" else la
        if not body:
            continue
        lines.append(body)
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


DQ_WORKS: dict[str, DQWorkSpec] = {
    "de-veritate": DQWorkSpec(
        book_id="aquinas-de-veritate",
        sub_path="disputed-questions/de-veritate",
        name_en="Disputed Questions on Truth",
        name_la="Quaestiones Disputatae de Veritate",
        composed="1256–1259",
        description_en="Twenty-nine disputed questions held at Paris during Aquinas's first regency — on truth, knowledge, providence, grace, conscience, and the relations between intellect and will. The longest single set of *quaestiones disputatae* he composed.",
        description_la="Viginti novem quaestiones disputatae apud Parisios in prima magisterii sui regentia — de veritate, scientia, providentia, gratia, conscientia, et intellectus et voluntatis relatione.",
        translator_note_en="English translation by Robert W. Mulligan, S.J. (vol. 1, Q. 1–9), James V. McGlynn, S.J. (vol. 2, Q. 10–20), and Robert W. Schmidt, S.J. (vol. 3, Q. 21–29). Henry Regnery Company, Chicago, 1952–1954. Translation status: may be under copyright in the United States until 2049; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdeVer",
        question_count=29,
    ),
    "de-potentia": DQWorkSpec(
        book_id="aquinas-de-potentia",
        sub_path="disputed-questions/de-potentia",
        name_en="Disputed Questions on the Power of God",
        name_la="Quaestiones Disputatae de Potentia",
        composed="1265–1266",
        description_en="Ten disputed questions, conducted at Rome — on the divine power, especially as it bears on creation, the Trinity, and the procession of the Holy Spirit.",
        description_la="Decem quaestiones disputatae apud Romam — de potentia divina, praesertim in creatione, Trinitate et processione Spiritus Sancti.",
        translator_note_en="English translation by the English Dominican Fathers, *On the Power of God* (Newman Press, 1952; Burns Oates & Washbourne, London, 1932–34). Translation status: the 1932 edition is mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdePotentia",
        question_count=10,
    ),
    "de-spiritualibus-creaturis": DQWorkSpec(
        book_id="aquinas-de-spiritualibus-creaturis",
        sub_path="disputed-questions/de-spiritualibus-creaturis",
        name_en="Disputed Question on Spiritual Creatures",
        name_la="Quaestio Disputata de Spiritualibus Creaturis",
        composed="1267–1268",
        description_en="A single disputed question of eleven articles on the metaphysics of immaterial substances — chiefly the angels and the human soul — held during Aquinas's stay at the papal *studium* of Viterbo or Rome.",
        description_la="Quaestio disputata una undecim articulorum, de metaphysica substantiarum immaterialium — angelorum praecipue et animae humanae.",
        translator_note_en="English translation by Mary C. Fitzpatrick (Marquette University Press, 1949). Translation status: may be under copyright in the United States until 2044; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdeSpirCreat",
        question_count=1,
    ),
    "de-unione-verbi": DQWorkSpec(
        book_id="aquinas-de-unione-verbi",
        sub_path="disputed-questions/de-unione-verbi",
        name_en="Disputed Question on the Union of the Incarnate Word",
        name_la="Quaestio Disputata de Unione Verbi Incarnati",
        composed="1272",
        description_en="A single disputed question of five articles on the hypostatic union — on whether the union of human and divine in Christ is one or many, on the act of being in Christ, and on the soul of Christ.",
        description_la="Quaestio disputata una quinque articulorum, de unione hypostatica — utrum unio in Christo sit una vel multiplex, de actu essendi in Christo, et de anima Christi.",
        translator_note_en="Translation drawn from the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdeUnione",
        question_count=5,
        single_question_multi_file=True,
    ),
    "de-virtutibus": DQWorkSpec(
        book_id="aquinas-de-virtutibus",
        sub_path="disputed-questions/de-virtutibus",
        name_en="Disputed Questions on the Virtues",
        name_la="Quaestiones Disputatae de Virtutibus",
        composed="1271–1272",
        description_en="Five disputed questions on the virtues — on the virtues in general, on charity, on fraternal correction, on hope, and on the cardinal virtues — composed during Aquinas's second Paris regency.",
        description_la="Quinque quaestiones disputatae de virtutibus — de virtutibus in communi, de caritate, de correctione fraterna, de spe, de virtutibus cardinalibus — in secunda regentia Parisiensi.",
        translator_note_en="English translation by E. M. Atkins, ed. Atkins and Williams (Cambridge University Press, 2005) for some; Ralph McInerny (St. Augustine's Press, 1999) for others. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdeVirtutibus",
        question_count=5,
    ),
    "qd-de-anima": DQWorkSpec(
        book_id="aquinas-qd-de-anima",
        sub_path="disputed-questions/qd-de-anima",
        name_en="Disputed Question on the Soul",
        name_la="Quaestio Disputata de Anima",
        composed="1265–1266",
        description_en="A single disputed question of twenty-one articles on the human soul — its substantiality, its union with the body, its powers, and its survival after death. Distinct from Aquinas's commentary on Aristotle's *De anima*.",
        description_la="Quaestio disputata una vigintiunius articulorum, de anima humana — substantialitate, unione cum corpore, potentiis, et superstitione post mortem. Distincta a commentario in Aristotelis *De anima*.",
        translator_note_en="English translation by John Patrick Rowan (B. Herder Book Co., 1949). Translation status: may be under copyright in the United States until 2044; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
        file_prefix="QDdeAnima",
        question_count=1,
    ),
}


def _make_dq_builder(key: str):
    def builder():
        return build_dq_work(DQ_WORKS[key])
    return builder


# ---------------------------------------------------------------------------
# Linear-work registrations
# ---------------------------------------------------------------------------

LINEAR_WORKS: dict[str, tuple[LinearWorkSpec, str | None]] = {
    "compendium-theology": (
        LinearWorkSpec(
            book_id="aquinas-compendium-theology",
            name_en="Compendium of Theology",
            name_la="Compendium Theologiae",
            composed="1265–1273",
            description_en="A short systematic theology composed for Aquinas's secretary Reginald of Piperno, organized around the three theological virtues: faith, hope, and charity. Unfinished — the treatment of faith breaks off in the section on the Eucharist, and hope is incomplete. English translation by Cyril Vollert, S.J. (B. Herder, St. Louis, 1947).",
            description_la="Theologia systematica brevis, Reginaldo de Piperno secretario dicta, circa tres virtutes theologicas ordinata: fidem, spem, caritatem. Opus inchoatum, morte interruptum.",
            translator_note_en="English translation by Cyril Vollert, S.J., *Compendium of Theology* (B. Herder Book Co., St. Louis, 1947). Translator's introduction notes the work was dedicated to Reginald of Piperno. Translation status: may be under copyright in the United States until 2042; mirrored from dhspriory.org via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Compendium.htm"],
        ),
        "compendium-theology",
    ),
    "de-ente-et-essentia": (
        LinearWorkSpec(
            book_id="aquinas-de-ente-et-essentia",
            name_en="On Being and Essence",
            name_la="De Ente et Essentia",
            composed="c. 1252",
            description_en="Aquinas's early metaphysical treatise, written for his Dominican brethren, on the meaning of \"being\" and \"essence\" — the foundational vocabulary of scholastic metaphysics.",
            description_la="Tractatus metaphysicus iuvenilis, fratribus Dominicanis dictatus, de significatione \"entis\" et \"essentiae\" — vocabulario fundamentali metaphysicae scholasticae.",
            translator_note_en="English translation by Robert T. Miller, mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeEnte&Essentia.htm"],
            chapter_label_en="Chapter",
            chapter_label_la="Capitulum",
            mode="header-rows",
        ),
        "opuscula/de-ente-et-essentia",
    ),
    "de-regno": (
        LinearWorkSpec(
            book_id="aquinas-de-regno",
            name_en="On Kingship (to the King of Cyprus)",
            name_la="De Regno (ad Regem Cypri)",
            composed="c. 1267",
            description_en="A treatise on Christian political philosophy — the nature of kingship, the common good, and the duties of a Christian ruler — composed for Hugh II of Lusignan, King of Cyprus. Aquinas wrote Book I and the opening of Book II; the rest was completed by Ptolemy of Lucca.",
            description_la="Tractatus de philosophia politica christiana — natura regni, bono communi, officiis regis Christiani — Hugoni II Lusignano regi Cypri compositus.",
            translator_note_en="English translation by Gerald B. Phelan, revised by I. Th. Eschmann, O.P. (Pontifical Institute of Mediaeval Studies, Toronto, 1949). Translation status: may be under copyright in the United States until 2044; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeRegno.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-regno",
    ),
    "de-principiis-naturae": (
        LinearWorkSpec(
            book_id="aquinas-de-principiis-naturae",
            name_en="On the Principles of Nature",
            name_la="De Principiis Naturae",
            composed="c. 1252",
            description_en="A short early treatise on the Aristotelian principles of nature: matter, form, and privation; the four causes; the relations between generation and the principles. Written for Aquinas's fellow Dominican Brother Sylvester.",
            description_la="Tractatus brevis iuvenilis de principiis aristotelicis naturae: materia, forma, privatione; quattuor causis; relationibus inter generationem et principia.",
            translator_note_en="English translation by R. A. Kocourek (1956). Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DePrincNaturae.htm"],
            chapter_label_la="Capitulum",
            mode="header-rows",
        ),
        "opuscula/de-principiis-naturae",
    ),
    "de-aeternitate-mundi": (
        LinearWorkSpec(
            book_id="aquinas-de-aeternitate-mundi",
            name_en="On the Eternity of the World",
            name_la="De Aeternitate Mundi",
            composed="c. 1271",
            description_en="A short treatise responding to the Latin Averroist debate at Paris: whether the world could have been eternal *de potentia Dei absoluta*. Aquinas defends the philosophical possibility (against Bonaventure) while affirming the *de facto* creation in time (against the Averroists).",
            description_la="Tractatus brevis ad disputationem averroistarum latinorum Parisiensium pertinens: utrum mundus potuerit esse aeternus.",
            translator_note_en="English translation by Robert T. Miller. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeEternitateMundi.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-aeternitate-mundi",
    ),
    "de-unitate-intellectus": (
        LinearWorkSpec(
            book_id="aquinas-de-unitate-intellectus",
            name_en="On the Unity of the Intellect against the Averroists",
            name_la="De Unitate Intellectus contra Averroistas",
            composed="1270",
            description_en="Aquinas's polemic against the Latin Averroist position — held by Siger of Brabant and others at Paris — that there is only one separate intellect for the whole human race. A central document in the late medieval reception of Aristotle.",
            description_la="Polemica contra positionem averroistarum latinorum — Siger Brabantini aliorum Parisiensium — unum tantum intellectum separatum humani generis esse.",
            translator_note_en="English translation by Beatrice H. Zedler (Marquette University Press, 1968). Translation status: may be under copyright in the United States until 2063; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeUnitateIntellectus.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-unitate-intellectus",
    ),
    "de-substantiis-separatis": (
        LinearWorkSpec(
            book_id="aquinas-de-substantiis-separatis",
            name_en="On Separate Substances",
            name_la="De Substantiis Separatis",
            composed="c. 1271",
            description_en="A treatise on the angels — separate (immaterial) substances — surveying Aristotle, Plato, and the Neoplatonists before setting out Aquinas's own metaphysics of the angelic order. Unfinished.",
            description_la="Tractatus de angelis — substantiis separatis (immaterialibus) — Aristotelem, Platonem, Neoplatonicos recensens, deinde metaphysicam propriam ordinis angelici proponens. Inchoatum.",
            translator_note_en="English translation by Francis J. Lescoe (Saint Joseph College, West Hartford, 1959). Translation status: may be under copyright in the United States until 2054; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SubstSepar.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-substantiis-separatis",
    ),
    "de-mixtione-elementorum": (
        LinearWorkSpec(
            book_id="aquinas-de-mixtione-elementorum",
            name_en="On the Mixture of the Elements",
            name_la="De Mixtione Elementorum",
            composed="c. 1273",
            description_en="A short physical treatise on how the four classical elements combine in a compound body — addressing whether the elements remain actually or only virtually present in the mixed body.",
            description_la="Tractatus brevis physicus de modo quo quattuor elementa in corpore composito miscentur.",
            translator_note_en="English translation by Vincent R. Larkin. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["MixtioElementorum.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-mixtione-elementorum",
    ),
    "de-motu-cordis": (
        LinearWorkSpec(
            book_id="aquinas-de-motu-cordis",
            name_en="On the Motion of the Heart",
            name_la="De Motu Cordis",
            composed="c. 1273",
            description_en="A short physical treatise written for Master Philip de Castro Caeli on the cause of the heart's motion — whether it is natural, animal, or violent.",
            description_la="Tractatus brevis physicus Philippo de Castro Caeli scriptus, de causa motus cordis.",
            translator_note_en="English translation by Vincent R. Larkin. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeMotuCordis.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-motu-cordis",
    ),
    "de-operationibus-occultis": (
        LinearWorkSpec(
            book_id="aquinas-de-operationibus-occultis",
            name_en="On the Occult Works of Nature",
            name_la="De Operationibus Occultis Naturae",
            composed="c. 1269–1272",
            description_en="A letter to an unnamed knight on the causes of the \"hidden\" effects of natural bodies — magnetism, the influence of celestial bodies, and similar phenomena — and what can be known about them by reason.",
            description_la="Epistola militi cuidam, de causis operationum occultarum corporum naturalium — magnetismo, influxu corporum caelestium — et quid de eis ratione cognosci possit.",
            translator_note_en="English translation by Joseph B. McAllister. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["OperatOccult.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-operationibus-occultis",
    ),
    "de-sortibus": (
        LinearWorkSpec(
            book_id="aquinas-de-sortibus",
            name_en="On the Casting of Lots",
            name_la="De Sortibus",
            composed="1271",
            description_en="A short treatise composed for James of Tonengo on the moral status of casting lots — when (if ever) it is permissible and what the practice signifies.",
            description_la="Tractatus brevis Iacobo de Tonengo compositus, de statu morali sortium — quando liceant et quid significent.",
            translator_note_en="English translation drawn from the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Sortibus.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-sortibus",
    ),
    "contra-impugnantes": (
        LinearWorkSpec(
            book_id="aquinas-contra-impugnantes",
            name_en="Against Those Who Attack the Religious Life",
            name_la="Contra Impugnantes Dei Cultum et Religionem",
            composed="1256",
            description_en="A defense of the mendicant religious orders against the attacks of William of Saint-Amour and the secular masters at Paris on the theological legitimacy of the friars' way of life.",
            description_la="Defensio ordinum religiosorum mendicantium contra impugnationes Guillelmi de Sancto Amore et magistrorum saecularium Parisiensium.",
            translator_note_en="English translation by John Procter, O.P. (1902, Sands & Co., Edinburgh / Westminster, Md., 1950 reprint). Public domain. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["ContraImpugnantes.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/contra-impugnantes",
    ),
    "contra-retrahentes": (
        LinearWorkSpec(
            book_id="aquinas-contra-retrahentes",
            name_en="Against Those Who Discourage Entry into Religious Life",
            name_la="Contra Retrahentes ab Ingressu Religionis",
            composed="1271",
            description_en="A short polemic, written near the end of Aquinas's life, against those who would dissuade young men from entering the religious orders — chiefly the Dominicans — against parental or worldly objections.",
            description_la="Polemica brevis, fere in fine vitae Thomae composita, contra eos qui adolescentes a religionis ingressu — praesertim Dominicanorum — dissuadere conantur.",
            translator_note_en="English translation by John Procter, O.P. (1902). Public domain. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["ContraRetrahentes.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/contra-retrahentes",
    ),
    "de-perfectione-vitae": (
        LinearWorkSpec(
            book_id="aquinas-de-perfectione-vitae",
            name_en="On the Perfection of the Spiritual Life",
            name_la="De Perfectione Spiritualis Vitae",
            composed="1269",
            description_en="An ascetical-theological defense of the religious life, arguing that the perfection of charity — by the counsels of poverty, chastity, and obedience — is the work to which the religious orders are vowed. Against Gerard of Abbeville.",
            description_la="Defensio asceticotheologica vitae religiosae, ostendens perfectionem caritatis — consiliis paupertatis, castitatis, oboedientiae — esse opus ad quod ordines religiosi voventur.",
            translator_note_en="English translation by John Procter, O.P. (1902). Public domain. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["PerfectVitaeSpir.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-perfectione-vitae",
    ),
    "contra-errores-graecorum": (
        LinearWorkSpec(
            book_id="aquinas-contra-errores-graecorum",
            name_en="Against the Errors of the Greeks",
            name_la="Contra Errores Graecorum",
            composed="1263",
            description_en="A treatise prepared at the request of Pope Urban IV on the doctrinal points in dispute between the Latin Church and the Greek East — the procession of the Holy Spirit, the primacy of the Roman pontiff, purgatory, and the use of unleavened bread — in view of a possible reunion.",
            description_la="Tractatus, Urbano IV petente, de capitibus dogmaticis inter Ecclesiam Latinam et Orientem Graecum disputatis — processione Spiritus Sancti, primatu Romani pontificis, purgatorio, azymis — in spe unionis.",
            translator_note_en="Translation drawn from the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["ContraErrGraecorum.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/contra-errores-graecorum",
    ),
    "de-articulis-fidei": (
        LinearWorkSpec(
            book_id="aquinas-de-articulis-fidei",
            name_en="On the Articles of Faith and the Sacraments of the Church",
            name_la="De Articulis Fidei et Ecclesiae Sacramentis",
            composed="1262",
            description_en="A short pastoral handbook for Archbishop Leonard of Palermo: a list of the articles of faith, the errors that oppose them, and a treatment of the seven sacraments.",
            description_la="Manuale pastorale breve archiepiscopo Leonardo Panormitano: articuli fidei et errores contrarii, item de septem sacramentis.",
            translator_note_en="English translation by Joseph B. Collins (1939). Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeArticulisFidei.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-articulis-fidei",
    ),
    "de-rationibus-fidei": (
        LinearWorkSpec(
            book_id="aquinas-de-rationibus-fidei",
            name_en="On the Reasons for the Faith (to the Cantor of Antioch)",
            name_la="De Rationibus Fidei (ad Cantorem Antiochenum)",
            composed="c. 1264",
            description_en="A short apologetic treatise written for a cantor at Antioch on the rational defense of central Christian mysteries — the Trinity, the Incarnation, the Eucharist, predestination — in dialogue with Muslims, Greeks, and Armenians.",
            description_la="Tractatus apologeticus brevis cantori cuidam Antiocheno scriptus, de defensione rationali mysteriorum christianorum praecipuorum — Trinitatis, Incarnationis, Eucharistiae, praedestinationis — coram Mahumedanis, Graecis et Armeniis.",
            translator_note_en="English translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Rationes.htm"],
            chapter_label_la="Capitulum",
        ),
        "opuscula/de-rationibus-fidei",
    ),
    "principium": (
        LinearWorkSpec(
            book_id="aquinas-principium",
            name_en="Inaugural Sermons (Rigans montes / Hic est liber)",
            name_la="Principia: Rigans montes / Hic est liber",
            composed="1256",
            description_en="Aquinas's two inaugural lectures as Master of Theology at Paris (Spring 1256): *Rigans montes de superioribus suis* on the dignity of Sacred Scripture, and *Hic est liber mandatorum Dei* — the commendation and division of Scripture that every new master delivered.",
            description_la="Duo principia Thomae cum suscepta licentia magistri in theologia Parisiis (vere 1256): *Rigans montes de superioribus suis* de dignitate Sacrae Scripturae, et *Hic est liber mandatorum Dei* — commendatio et divisio Sacrae Scripturae quae a novo magistro fiebat.",
            translator_note_en="English translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Principium.htm"],
            chapter_label_la="Caput",
        ),
        "opuscula/principium",
    ),
    "to-bernard-abbot": (
        LinearWorkSpec(
            book_id="aquinas-to-bernard-abbot",
            name_en="Letter to Abbot Bernard",
            name_la="Epistola ad Bernardum Abbatem",
            composed="c. 1264",
            description_en="A short letter of consultation from Aquinas to the Cistercian Abbot Bernard of Casamari on a matter of monastic discipline.",
            description_la="Epistola brevis consultationis Thomae ad Bernardum abbatem Cisterciensem Casemariensem de quaestione disciplinae monasticae.",
            translator_note_en="Translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["ToBernardAbbot.htm"],
            chapter_label_la="Caput",
        ),
        "opuscula/to-bernard-abbot",
    ),
    "to-duchess-flanders": (
        LinearWorkSpec(
            book_id="aquinas-to-duchess-flanders",
            name_en="Letter to the Duchess of Brabant (on the Government of the Jews)",
            name_la="Epistola ad Ducissam Brabantiae (de Regimine Iudaeorum)",
            composed="c. 1271",
            description_en="A short letter of consultation from Aquinas to Duchess Aleydis of Brabant on the moral and political questions surrounding the government of Jewish subjects in a Christian principality.",
            description_la="Epistola brevis consultationis Thomae ad Aleydem ducissam Brabantiae de quaestionibus moralibus et politicis circa regimen subditorum Iudaeorum in principatu Christiano.",
            translator_note_en="Translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["ToDuchessFlanders.htm"],
            chapter_label_la="Caput",
        ),
        "opuscula/to-duchess-flanders",
    ),
    "de-emptione": (
        LinearWorkSpec(
            book_id="aquinas-de-emptione",
            name_en="On Buying and Selling on Credit (to Brother James of Viterbo)",
            name_la="De Emptione et Venditione ad Tempus",
            composed="c. 1262",
            description_en="A short reply on the moral question of credit sales and the just price.",
            description_la="Responsum breve de quaestione morali venditionum ad tempus et de pretio iusto.",
            translator_note_en="Translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Emptio.htm"],
            chapter_label_la="Caput",
        ),
        "opuscula/de-emptione",
    ),
    "de-mixtione-elementorum": (
        LinearWorkSpec(
            book_id="aquinas-de-mixtione-elementorum",
            name_en="On the Mixture of the Elements",
            name_la="De Mixtione Elementorum",
            composed="c. 1273",
            description_en="A short physical treatise on how the four classical elements combine in a compound body — addressing whether the elements remain actually or only virtually present in the mixed body.",
            description_la="Tractatus brevis physicus de modo quo quattuor elementa in corpore composito miscentur.",
            translator_note_en="English translation by Peter Orlowski (1995, 1997). Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["MixtioElementorum.htm"],
            chapter_label_la="Capitulum",
            mode="p-bilingual",
        ),
        "opuscula/de-mixtione-elementorum",
    ),
    # ------ Aristotle commentaries ------
    "comm-ethics": (
        LinearWorkSpec(
            book_id="aquinas-comm-ethics",
            name_en="Commentary on the Nicomachean Ethics",
            name_la="Sententia Libri Ethicorum",
            composed="1271–1272",
            description_en="Aquinas's complete *expositio* of the ten books of Aristotle's *Nicomachean Ethics*, in the lectio format he used for all the Aristotelian commentaries. The most influential medieval reading of the *Ethics*.",
            description_la="Expositio Thomae completa decem librorum *Ethicorum Nicomacheorum* Aristotelis, secundum modum lectionis quo omnia commentaria aristotelica composuit. Maximi momenti medii aevi lectio *Ethicorum*.",
            translator_note_en="English translation by C. I. Litzinger, O.P. (Henry Regnery, Chicago, 1964; reprinted Dumb Ox Books, Notre Dame, 1993). Translation status: may be under copyright in the United States until 2059; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[f"Ethics{n}.htm" for n in range(1, 11)],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            group_titles_en=[f"Book {n}" for n in range(1, 11)],
            group_titles_la=[f"Liber {n}" for n in range(1, 11)],
        ),
        "aristotle/ethics",
    ),
    "comm-physics": (
        LinearWorkSpec(
            book_id="aquinas-comm-physics",
            name_en="Commentary on the Physics",
            name_la="Sententia super Physicam",
            composed="1268–1269",
            description_en="Aquinas's lectio-by-lectio commentary on the eight books of Aristotle's *Physics*.",
            description_la="Expositio Thomae octo librorum *Physicae* Aristotelis, secundum modum lectionis.",
            translator_note_en="English translation by Richard J. Blackwell, Richard J. Spath, and W. Edmund Thirlkel (Yale University Press, 1963; reprinted Dumb Ox Books). Translation status: may be under copyright in the United States until 2058; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[f"Physics{n}.htm" for n in range(1, 9)],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            group_titles_en=[f"Book {n}" for n in range(1, 9)],
            group_titles_la=[f"Liber {n}" for n in range(1, 9)],
        ),
        "aristotle/physics",
    ),
    "comm-metaphysics": (
        LinearWorkSpec(
            book_id="aquinas-comm-metaphysics",
            name_en="Commentary on the Metaphysics",
            name_la="Sententia super Metaphysicam",
            composed="1270–1272",
            description_en="Aquinas's lectio-by-lectio commentary on Aristotle's *Metaphysics*, books I–XII (XIII–XIV combined). The metaphysical complement to the Ethics commentary.",
            description_la="Expositio Thomae secundum modum lectionis librorum I–XII *Metaphysicae* Aristotelis (XIII–XIV simul). Complementum metaphysicum commentarii in *Ethica*.",
            translator_note_en="English translation by John P. Rowan (Henry Regnery, Chicago, 1961). Translation status: may be under copyright in the United States until 2056; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[f"Metaphysics{n}.htm" for n in range(1, 13)] + ["Metaphysics13-14.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            group_titles_en=[f"Book {n}" for n in range(1, 13)] + ["Books 13–14"],
            group_titles_la=[f"Liber {n}" for n in range(1, 13)] + ["Libri 13–14"],
        ),
        "aristotle/metaphysics",
    ),
    "comm-politics": (
        LinearWorkSpec(
            book_id="aquinas-comm-politics",
            name_en="Commentary on the Politics",
            name_la="Sententia Libri Politicorum",
            composed="1269–1272",
            description_en="Aquinas's commentary on Aristotle's *Politics*. Unfinished — the Geremia mirror contains only Book I.",
            description_la="Expositio Thomae *Politicae* Aristotelis. Opus inchoatum — speculum Geremiae solum Librum I continet.",
            translator_note_en="English translation by Richard J. Regan (Hackett, 2007) — copyrighted, Book I via Geremia/AquinasOperaOmnia. Latin is Leonine (public domain).",
            source_files=["Politics.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            mode="header-rows",
        ),
        "aristotle/politics",
    ),
    "comm-de-anima": (
        LinearWorkSpec(
            book_id="aquinas-comm-de-anima",
            name_en="Commentary on Aristotle's De Anima",
            name_la="Sentencia super De Anima",
            composed="1267–1268",
            description_en="Aquinas's commentary on the three books of Aristotle's *On the Soul* — the key Aristotelian text behind his anthropology.",
            description_la="Expositio trium librorum *De Anima* Aristotelis — textus aristotelicus maximus pondere ad anthropologiam Thomae.",
            translator_note_en="English translation by Robert Pasnau (Yale University Press, 1999) — copyrighted; older partial translation by Kenelm Foster OP & Sylvester Humphries OP (Routledge, 1951) mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeAnima.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/de-anima",
    ),
    "comm-posterior-analytics": (
        LinearWorkSpec(
            book_id="aquinas-comm-posterior-analytics",
            name_en="Commentary on the Posterior Analytics",
            name_la="Expositio Posteriorum Analyticorum",
            composed="1271–1272",
            description_en="Aquinas's commentary on Aristotle's *Posterior Analytics* — the logic of scientific demonstration, the most important Aristotelian source for his methodology.",
            description_la="Expositio *Posteriorum Analyticorum* Aristotelis — logica demonstrationis scientificae, fons aristotelicus maximus methodologiae Thomae.",
            translator_note_en="English translation by Richard Berquist (Dumb Ox Books, 2007) — copyrighted; older translation by F. R. Larcher OP (Magi Books, 1970) mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["PostAnalytica.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/posterior-analytics",
    ),
    "comm-peri-hermeneias": (
        LinearWorkSpec(
            book_id="aquinas-comm-peri-hermeneias",
            name_en="Commentary on the Peri Hermeneias",
            name_la="Expositio Libri Peryermeneias",
            composed="1270–1271",
            description_en="Aquinas's commentary on Aristotle's *De Interpretatione* (Peri Hermeneias) — the foundational treatise on propositions and judgment. Unfinished — Aquinas covered chapters 1–14 of Book II.",
            description_la="Expositio *De Interpretatione* (Peri Hermeneias) Aristotelis — tractatus fundamentalis de propositionibus et iudicio. Opus inchoatum — Thomas usque ad cap. 14 libri II pervenit.",
            translator_note_en="English translation by Jean T. Oesterle (Marquette University Press, 1962). Translation status: may be under copyright in the United States until 2057; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["PeriHermeneias.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/peri-hermeneias",
    ),
    "comm-de-caelo": (
        LinearWorkSpec(
            book_id="aquinas-comm-de-caelo",
            name_en="Commentary on the De Caelo et Mundo",
            name_la="Sententia super De Caelo et Mundo",
            composed="1272–1273",
            description_en="Aquinas's commentary on Aristotle's *De Caelo et Mundo* — the cosmological treatise on the heavens, the elements, and motion. Unfinished — Aquinas covered Book I and part of Book III before his death.",
            description_la="Expositio *De Caelo et Mundo* Aristotelis — tractatus cosmologicus de caelis, de elementis, de motu. Opus inchoatum — Librum I et partem Libri III antequam moreretur composuit.",
            translator_note_en="English translation by Fabian Larcher OP and Pierre H. Conway OP (typescript, 1963–64). Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DeCoelo.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/de-caelo",
    ),
    "comm-meteora": (
        LinearWorkSpec(
            book_id="aquinas-comm-meteora",
            name_en="Commentary on the Meteorologica",
            name_la="Sententia super Meteora",
            composed="c. 1268–1270",
            description_en="Aquinas's commentary on Aristotle's *Meteorologica* — meteorological and atmospheric phenomena. Unfinished — Aquinas covered only Books I and part of II.",
            description_la="Expositio *Meteorologicorum* Aristotelis — de phaenomenis meteorologicis et atmosphaericis. Opus inchoatum — solum Librum I et partem II tractavit.",
            translator_note_en="Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["Meteora.htm"],
            anchor_re=r"^(\d+\.\d+)$",
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/meteora",
    ),
    "comm-generation-corruption": (
        LinearWorkSpec(
            book_id="aquinas-comm-generation-corruption",
            name_en="Commentary on the De Generatione et Corruptione",
            name_la="Sentencia super De Generatione et Corruptione",
            composed="c. 1272–1273",
            description_en="Aquinas's commentary on Aristotle's *De Generatione et Corruptione* — on substantial change, the elements, and prime matter.",
            description_la="Expositio *De Generatione et Corruptione* Aristotelis — de mutatione substantiali, de elementis, de materia prima.",
            translator_note_en="English translation by Pierre H. Conway OP and R. F. Larcher OP (1964, typescript). Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["GenCorrup.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/generation-corruption",
    ),
    "comm-de-sensu": (
        LinearWorkSpec(
            book_id="aquinas-comm-de-sensu",
            name_en="Commentary on the De Sensu et Sensato",
            name_la="Sententia super De Sensu et Sensato",
            composed="c. 1268–1270",
            description_en="Aquinas's commentary on Aristotle's *De Sensu et Sensato* — on the external senses and their objects, complementing the *De Anima* commentary.",
            description_la="Expositio *De Sensu et Sensato* Aristotelis — de sensibus exterioribus eorumque obiectis, ad commentarium *De Anima* pertinens.",
            translator_note_en="English translation by Edward M. Macierowski. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SensuSensato.htm"],
            chapter_label_en="Chapter",
            chapter_label_la="Caput",
            mode="h3-chapters",
        ),
        "aristotle/de-sensu",
    ),
    "comm-de-memoria": (
        LinearWorkSpec(
            book_id="aquinas-comm-de-memoria",
            name_en="Commentary on the De Memoria et Reminiscentia",
            name_la="Sententia super De Memoria et Reminiscentia",
            composed="c. 1268–1270",
            description_en="Aquinas's commentary on Aristotle's *De Memoria et Reminiscentia* — on memory and recollection, completing the parva naturalia commentaries.",
            description_la="Expositio *De Memoria et Reminiscentia* Aristotelis — de memoria et reminiscentia, ad commentaria parvorum naturalium pertinens.",
            translator_note_en="English translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["MemoriaReminiscentia.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
        ),
        "aristotle/de-memoria",
    ),
    # ------ Other commentaries ------
    "boethius-de-trinitate": (
        LinearWorkSpec(
            book_id="aquinas-boethius-de-trinitate",
            name_en="Commentary on Boethius's De Trinitate",
            name_la="Super Boethium De Trinitate",
            composed="1257–1259",
            description_en="Aquinas's commentary on the first three chapters of Boethius's *De Trinitate*. The Prooemium contains Aquinas's celebrated discussion of the divisions of speculative science. Unfinished.",
            description_la="Expositio Thomae primorum trium capitum *De Trinitate* Boethii. Prooemium continet discussionem Thomae celeberrimam de divisione scientiae speculativae. Opus inchoatum.",
            translator_note_en="English translation by Armand Maurer (PIMS, Toronto, 1953). Translation status: may be under copyright in the United States until 2048; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["BoethiusDeTr.htm"],
            chapter_label_en="Article",
            chapter_label_la="Articulus",
            pauline_anchors=True,
        ),
        "commentaries/boethius-de-trinitate",
    ),
    "compendium-corpus-christi": (
        LinearWorkSpec(
            book_id="aquinas-office-corpus-christi",
            name_en="Office of Corpus Christi",
            name_la="Officium Corporis Christi",
            composed=1264,
            description_en="The full liturgical office Aquinas composed in 1264 at the request of Pope Urban IV for the new feast of the Body of Christ — Mass, Matins, Lauds, the Little Hours, Vespers, the Octave readings, and the famous hymns *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum*, and the sequence *Lauda Sion*.",
            description_la="Officium liturgicum completum Thomae anno 1264, Urbano IV petente, pro festo Corporis Christi novo — Missa, Matutinum, Laudes, Horae Minores, Vesperae, lectiones octavae, et hymni celebres *Pange Lingua*, *Sacris Solemniis*, *Verbum Supernum*, sequentia *Lauda Sion*.",
            translator_note_en="Mirrored via the Geremia/AquinasOperaOmnia GitHub repository. Combines CorpusChristi.htm + CorpusChristiMass.htm + CorpusChristiLauds.htm + CorpusChristiLittleHrs.htm + CorpusChristiVes2.htm + CorpusChristiOct.htm + CorpusChristiRd.htm.",
            source_files=[
                "CorpusChristi.htm",
                "CorpusChristiMass.htm",
                "CorpusChristiLauds.htm",
                "CorpusChristiLittleHrs.htm",
                "CorpusChristiVes2.htm",
                "CorpusChristiOct.htm",
                "CorpusChristiRd.htm",
            ],
            chapter_label_en="Part",
            chapter_label_la="Pars",
            group_titles_en=[
                "First Vespers and Matins",
                "Mass (Cibavit)",
                "Lauds",
                "Little Hours",
                "Second Vespers",
                "Office of the Octave",
                "Readings of the Octave",
            ],
            group_titles_la=[
                "Vesperae Primae et Matutinum",
                "Missa (Cibavit)",
                "Laudes",
                "Horae Minores",
                "Vesperae Secundae",
                "Officium Octavae",
                "Lectiones Octavae",
            ],
        ),
        "office-of-corpus-christi",
    ),
    # Super Sententias: the canonical full bilingual is sourced from
    # aquinas.cc via scripts/scrape-aquinas-cc.py (slug "super-sententias").
    # The Geremia mirror only has a handful of articles via index pages and
    # rendered as one-line dumps, so we don't import it here.
    # ------ Biblical commentaries ------
    "super-matthaeum": (
        LinearWorkSpec(
            book_id="aquinas-super-matthaeum",
            name_en="Commentary on the Gospel of Matthew",
            name_la="Super Evangelium S. Matthaei Lectura",
            composed="1269–1270",
            description_en="Aquinas's lectures on Matthew at Paris (1269–1270), preserved as a *reportatio* by his student Léger of Besançon. The Geremia mirror contains chapters 1–12.",
            description_la="Lectiones Thomae in Matthaeum apud Parisios (1269–1270), conservatae per *reportationem* discipuli sui Legerii Bisuntini. Speculum Geremiae continet capita 1–12.",
            translator_note_en="English translation by R. F. Larcher, O.P. (1965, typescript), with edits and supplements. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SSMatthew.htm"],
            anchor_re=r"^(\d+)$",
            chapter_label_en="Chapter",
            chapter_label_la="Caput",
        ),
        "biblical/super-matthaeum",
    ),
    "super-iohannem": (
        LinearWorkSpec(
            book_id="aquinas-super-iohannem",
            name_en="Commentary on the Gospel of John",
            name_la="Super Evangelium S. Ioannis Lectura",
            composed="1270–1272",
            description_en="Aquinas's commentary on John — widely considered his finest Scripture commentary, the fruit of his second Paris regency. 21 chapters plus an appendix.",
            description_la="Expositio Thomae in Ioannem — a multis fructus optimus expositionum Sacrae Scripturae aestimata, opus regentiae secundae Parisiensis. 21 capita cum appendice.",
            translator_note_en="English translation by Fabian R. Larcher, O.P., and James A. Weisheipl, O.P. (Magi Books, 1980; revised Aquinas Institute, 2010). Translation status: may be under copyright in the United States until 2075; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[f"John{n}.htm" for n in range(1, 22)] + ["JohnApp.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            group_titles_en=[f"Chapter {n}" for n in range(1, 22)] + ["Appendix"],
            group_titles_la=[f"Caput {n}" for n in range(1, 22)] + ["Appendix"],
        ),
        "biblical/super-iohannem",
    ),
    "super-paulum": (
        LinearWorkSpec(
            book_id="aquinas-super-paulum",
            name_en="Commentary on the Letters of St. Paul",
            name_la="Super Epistolas S. Pauli Lectura",
            composed="1265–1273",
            description_en="Aquinas's commentaries on the Pauline epistles — the heart of his theology of grace, Christology, and the Eucharist. Available in the Geremia mirror: 1 Corinthians, 2 Corinthians, Galatians, Ephesians, Philippians, Colossians, 1 Thessalonians, Hebrews, Philemon. Romans and the Pastorals are not yet mirrored in bilingual form.",
            description_la="Expositiones Thomae in Epistolas Paulinas — fons theologiae gratiae, christologiae et Eucharistiae apud Thomam. In speculo Geremiae disponibiles: 1 Cor, 2 Cor, Gal, Eph, Phil, Col, 1 Thess, Hebr, Philm. Romanos et Pastorales nondum in forma bilingui.",
            translator_note_en="Translations by Fabian R. Larcher, O.P., and others — various translators per epistle. Some translations are under copyright. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[
                "SS1Cor.htm", "SS1Cor11RP.htm", "SS2Cor.htm",
                "SSGalatians.htm",
                "SSEph.htm", "Eph1.htm", "Eph2.htm", "Eph3.htm",
                "Eph4.htm", "Eph5.htm", "Eph6.htm",
                "SSPhilippians.htm",
                "SSColossians.htm", "SS1Thes.htm",
                "SSHebrews.htm", "SSPhilemon.htm",
            ],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            group_titles_en=[
                "1 Corinthians", "1 Corinthians 11 (Reportatio)", "2 Corinthians",
                "Galatians",
                "Ephesians (Introduction by Matthew Lamb)",
                "Ephesians 1", "Ephesians 2", "Ephesians 3",
                "Ephesians 4", "Ephesians 5", "Ephesians 6",
                "Philippians",
                "Colossians", "1 Thessalonians",
                "Hebrews", "Philemon",
            ],
            group_titles_la=[
                "In I Corinthios", "In I Corinthios cap. 11 (Reportatio)", "In II Corinthios",
                "In Galatas",
                "In Ephesios (Introductio)",
                "In Ephesios cap. 1", "In Ephesios cap. 2", "In Ephesios cap. 3",
                "In Ephesios cap. 4", "In Ephesios cap. 5", "In Ephesios cap. 6",
                "In Philippenses",
                "In Colossenses", "In I Thessalonicenses",
                "In Hebraeos", "In Philemonem",
            ],
            pauline_anchors=True,
        ),
        "biblical/super-paulum",
    ),
    "super-iob": (
        LinearWorkSpec(
            book_id="aquinas-super-iob",
            name_en="Commentary on the Book of Job",
            name_la="Expositio super Iob ad litteram",
            composed="1261–1265",
            description_en="Aquinas's literal commentary on Job, read against the providence question. Composed during his time at the papal court of Orvieto.",
            description_la="Expositio Thomae ad litteram super Iob, quaestionem providentiae considerans. Composita Urbeveteri, in curia papali.",
            translator_note_en="English translation by Brian Mulladay, ed. by The Aquinas Institute. Translation status: may be under copyright; mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SSJob.htm"],
            chapter_label_en="Lecture",
            chapter_label_la="Lectio",
            pauline_anchors=True,
        ),
        "biblical/super-iob",
    ),
    "super-threnos": (
        LinearWorkSpec(
            book_id="aquinas-super-threnos",
            name_en="Commentary on Lamentations",
            name_la="In Threnos Jeremiae Expositio",
            composed="c. 1252–1259",
            description_en="An early literal commentary on the Book of Lamentations, likely from Aquinas's Paris bachelor years.",
            description_la="Expositio prima Thomae litteralis in librum Threnorum, fere ex annis baccalaureatus Parisiensis.",
            translator_note_en="English translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SSLamentations.htm"],
            chapter_label_en="Chapter",
            chapter_label_la="Caput",
        ),
        "biblical/super-threnos",
    ),
    "super-matt-petri-de-scala": (
        LinearWorkSpec(
            book_id="aquinas-super-matt-petri-de-scala",
            name_en="Commentary on Matthew (Reportatio of Peter of Scala)",
            name_la="Super Matthaeum (Reportatio Petri de Scala)",
            composed="c. 1269–1270",
            description_en="A *reportatio* of Aquinas's Matthew lectures by Peter of Scala — an alternate transmission of the Matthew commentary chapters that complements R. F. Larcher's text.",
            description_la="*Reportatio* Petri de Scala lectionum Thomae in Matthaeum — transmissio alternativa quae *reportationem* Legerii Bisuntini complet.",
            translator_note_en="English translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["SSMattPetriDeScala.htm"],
            chapter_label_en="Chapter",
            chapter_label_la="Caput",
        ),
        "biblical/super-matt-petri-de-scala",
    ),
    "super-psalmos": (
        LinearWorkSpec(
            book_id="aquinas-super-psalmos",
            name_en="Commentary on the Psalms",
            name_la="Postilla super Psalmos",
            composed="1273",
            description_en="Aquinas's final commentary, on the Psalms — incomplete. He reached only Psalm 54 (numbered Ps 51 in the Hebrew, depending on the system) before his death.",
            description_la="Expositio ultima Thomae, in Psalmos — opus inchoatum, morte interruptum. Solum usque ad Psalmum 54 (vel 51, secundum numerationem) pervenit.",
            translator_note_en="English translation by Stephen Loughlin (2005). Mirrored from the Geremia/AquinasOperaOmnia GitHub repository's PsalmsAquinas directory.",
            source_files=[
                "PsalmsAquinas/ThoPs0.htm",
                "PsalmsAquinas/ThoPs1.htm",
                "PsalmsAquinas/ThoPs2.htm",
                "PsalmsAquinas/ThoPs3.htm",
                "PsalmsAquinas/ThoPs4.htm",
                "PsalmsAquinas/ThoPs5.htm",
                "PsalmsAquinas/ThoPs6.htm",
                "PsalmsAquinas/ThoPs7.htm",
                "PsalmsAquinas/ThoPs8.htm",
                "PsalmsAquinas/ThoPs9.htm",
                "PsalmsAquinas/ThoPs10H11.htm", "PsalmsAquinas/ThoPs11H12.htm",
                "PsalmsAquinas/ThoPs12H13.htm", "PsalmsAquinas/ThoPs13H14.htm",
                "PsalmsAquinas/ThoPs14H15.htm", "PsalmsAquinas/ThoPs16H17.htm",
                "PsalmsAquinas/ThoPs17H18.htm", "PsalmsAquinas/ThoPs18H19.htm",
                "PsalmsAquinas/ThoPs19H20.htm", "PsalmsAquinas/ThoPs20H21.htm",
                "PsalmsAquinas/ThoPs21H22.htm", "PsalmsAquinas/ThoPs22H23.htm",
                "PsalmsAquinas/ThoPs23H24.htm", "PsalmsAquinas/ThoPs26H27.htm",
                "PsalmsAquinas/ThoPs28H29.htm", "PsalmsAquinas/ThoPs29H30.htm",
                "PsalmsAquinas/ThoPs33H34.htm", "PsalmsAquinas/ThoPs34H35.htm",
                "PsalmsAquinas/ThoPs35H36.htm",
                "PsalmsAquinas/ThoPs42H43.htm",
                "PsalmsAquinas/ThoPs46H47.htm", "PsalmsAquinas/ThoPs47H48.htm",
                "PsalmsAquinas/ThoPs48H49.htm", "PsalmsAquinas/ThoPs49H50.htm",
                "PsalmsAquinas/ThoPs50H51.htm", "PsalmsAquinas/ThoPs51H52.htm",
                "PsalmsAquinas/ThoPs52H53.htm", "PsalmsAquinas/ThoPs53H54.htm",
                "PsalmsAquinas/ThoPs54H55.htm",
            ],
            chapter_label_en="Section",
            chapter_label_la="Sectio",
            group_titles_en=[
                "Prologue",
                "Psalm 1", "Psalm 2", "Psalm 3", "Psalm 4", "Psalm 5",
                "Psalm 6", "Psalm 7", "Psalm 8", "Psalm 9",
                "Psalm 10 (Vulg. 11)", "Psalm 11 (Vulg. 12)",
                "Psalm 12 (Vulg. 13)", "Psalm 13 (Vulg. 14)",
                "Psalm 14 (Vulg. 15)", "Psalm 16 (Vulg. 17)",
                "Psalm 17 (Vulg. 18)", "Psalm 18 (Vulg. 19)",
                "Psalm 19 (Vulg. 20)", "Psalm 20 (Vulg. 21)",
                "Psalm 21 (Vulg. 22)", "Psalm 22 (Vulg. 23)",
                "Psalm 23 (Vulg. 24)", "Psalm 26 (Vulg. 27)",
                "Psalm 28 (Vulg. 29)", "Psalm 29 (Vulg. 30)",
                "Psalm 33 (Vulg. 34)", "Psalm 34 (Vulg. 35)",
                "Psalm 35 (Vulg. 36)",
                "Psalm 42 (Vulg. 43)",
                "Psalm 46 (Vulg. 47)", "Psalm 47 (Vulg. 48)",
                "Psalm 48 (Vulg. 49)", "Psalm 49 (Vulg. 50)",
                "Psalm 50 (Vulg. 51)", "Psalm 51 (Vulg. 52)",
                "Psalm 52 (Vulg. 53)", "Psalm 53 (Vulg. 54)",
                "Psalm 54 (Vulg. 55)",
            ],
            group_titles_la=[
                "Prologus",
                "Psalmus 1", "Psalmus 2", "Psalmus 3", "Psalmus 4", "Psalmus 5",
                "Psalmus 6", "Psalmus 7", "Psalmus 8", "Psalmus 9",
                "Psalmus 10 (Vulg. 11)", "Psalmus 11 (Vulg. 12)",
                "Psalmus 12 (Vulg. 13)", "Psalmus 13 (Vulg. 14)",
                "Psalmus 14 (Vulg. 15)", "Psalmus 16 (Vulg. 17)",
                "Psalmus 17 (Vulg. 18)", "Psalmus 18 (Vulg. 19)",
                "Psalmus 19 (Vulg. 20)", "Psalmus 20 (Vulg. 21)",
                "Psalmus 21 (Vulg. 22)", "Psalmus 22 (Vulg. 23)",
                "Psalmus 23 (Vulg. 24)", "Psalmus 26 (Vulg. 27)",
                "Psalmus 28 (Vulg. 29)", "Psalmus 29 (Vulg. 30)",
                "Psalmus 33 (Vulg. 34)", "Psalmus 34 (Vulg. 35)",
                "Psalmus 35 (Vulg. 36)",
                "Psalmus 42 (Vulg. 43)",
                "Psalmus 46 (Vulg. 47)", "Psalmus 47 (Vulg. 48)",
                "Psalmus 48 (Vulg. 49)", "Psalmus 49 (Vulg. 50)",
                "Psalmus 50 (Vulg. 51)", "Psalmus 51 (Vulg. 52)",
                "Psalmus 52 (Vulg. 53)", "Psalmus 53 (Vulg. 54)",
                "Psalmus 54 (Vulg. 55)",
            ],
        ),
        "biblical/super-psalmos",
    ),
    # ------ Letters and Historical ------
    "to-john-vercelli": (
        LinearWorkSpec(
            book_id="aquinas-to-john-vercelli",
            name_en="Letter to John of Vercelli, Master General",
            name_la="Epistola ad Ioannem Vercellensem",
            composed="1271",
            description_en="Aquinas's reply to forty-three articles submitted by John of Vercelli, Master General of the Dominicans, on theological questions disputed at Paris.",
            description_la="Responsum Thomae ad quadraginta tres articulos a Ioanne Vercellensi, Magistro Generali Ordinis Praedicatorum, super quaestionibus theologicis Parisiensibus.",
            translator_note_en="Translation mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["DearJohn.htm"],
            chapter_label_en="Article",
            chapter_label_la="Articulus",
        ),
        "opuscula/to-john-vercelli",
    ),
    "roman-chapters": (
        LinearWorkSpec(
            book_id="aquinas-roman-chapters",
            name_en="Acts of the Roman Province Chapters",
            name_la="Acta Capitulorum Provinciae Romanae",
            composed="1260–1273",
            description_en="The acts of the Dominican Roman Province chapters in which Aquinas took part — Naples 1260 through Rome 1273. Primary documents of Dominican life during Aquinas's career.",
            description_la="Acta capitulorum provinciae Romanae Ordinis Praedicatorum in quibus Thomas interfuit — a Neapoli 1260 usque ad Romam 1273.",
            translator_note_en="English translation by Joseph Kenny, O.P. Mirrored via the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=["RomanChapters.htm"],
            chapter_label_en="Chapter",
            chapter_label_la="Capitulum Provinciale",
            anchor_re=r"^(\d{4})$",
        ),
        "historical/roman-chapters",
    ),
    # ------ Sermons ------
    "sermons": (
        LinearWorkSpec(
            book_id="aquinas-sermons",
            name_en="Sermons",
            name_la="Sermones",
            composed="1265–1273",
            description_en="Aquinas's surviving university sermons — preached at Paris and Naples on the dominical and saints-day pericopes. Distinct from the Lenten *Catechetical Instructions* at Naples (1273), which are filed separately.",
            description_la="Sermones Thomae superstites — apud Parisios et Neapolim de pericopis dominicis et sanctorum praedicati. Distincti a sermonibus Quadragesimalibus Neapolitanis (1273), qui *Instructiones Catecheticae* nominantur et separatim invenientur.",
            translator_note_en="English translations from the Geremia/AquinasOperaOmnia GitHub repository.",
            source_files=[
                "Sermons.htm",
                "Serm08PuerIesus.htm",
                "Serm11Emitte.htm",
                "Serm14Attendite.htm",
                "Serm16InveniDavid.htm",
                "Serm20BeataGens.htm",
                "Creed.htm",
                "PaterNoster.htm",
                "AveMaria.htm",
                "TenCommandments.htm",
                "DeDivinisMoribus.htm",
            ],
            chapter_label_en="Sermon",
            chapter_label_la="Sermo",
            group_titles_en=[
                "Index of Sermons",
                "Puer Iesus (Sermon 8) — On the Boy Jesus",
                "Emitte (Sermon 11) — Pentecost",
                "Attendite (Sermon 14) — On False Prophets",
                "Inveni David (Sermon 16) — On David, the Servant",
                "Beata Gens (Sermon 20) — On the Blessed Nation",
                "Sermons on the Apostles' Creed (1273 Naples — Latin source)",
                "Sermons on the Lord's Prayer (1273 Naples — Latin source)",
                "Sermons on the Hail Mary (1273 Naples — Latin source)",
                "Sermons on the Ten Commandments (1273 Naples — Latin source)",
                "De divinis moribus",
            ],
            group_titles_la=[
                "Index Sermonum",
                "Puer Iesus (Sermo 8)",
                "Emitte (Sermo 11)",
                "Attendite (Sermo 14)",
                "Inveni David (Sermo 16)",
                "Beata Gens (Sermo 20)",
                "Sermones super Symbolum Apostolorum",
                "Sermones super Pater Noster",
                "Sermones super Ave Maria",
                "Sermones super Decem Praecepta",
                "De divinis moribus",
            ],
        ),
        "sermons",
    ),
}


def _make_linear_builder(key: str):
    def builder():
        spec, sub = LINEAR_WORKS[key]
        return build_linear_work(spec, sub)
    return builder




# ---------------------------------------------------------------------------
# Generic file writers
# ---------------------------------------------------------------------------

def _write_md(path: Path, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")


def _write_manifest(book_dir: Path, manifest: dict) -> None:
    book_dir.mkdir(parents=True, exist_ok=True)
    (book_dir / "book.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

WORK_BUILDERS: dict[str, Callable[[], dict]] = {
    "summa-theologiae": build_summa_theologiae,
    "catena-aurea-matthew": build_catena_matthew,
    "catena-aurea-mark": build_catena_mark,
    "catena-aurea-luke": build_catena_luke,
    "catena-aurea-john": build_catena_john,
}

for _key in LINEAR_WORKS:
    WORK_BUILDERS[_key] = _make_linear_builder(_key)

for _key in DQ_WORKS:
    WORK_BUILDERS[_key] = _make_dq_builder(_key)

WORK_BUILDERS["quodlibetales"] = build_quodlibetales


def prepare_cache() -> None:
    if CACHE.exists() and (CACHE / "index.html").is_file():
        print(f"cache ready: {CACHE}")
        return
    CACHE.parent.mkdir(parents=True, exist_ok=True)
    subprocess.check_call([
        "git", "clone", "--depth", "1",
        "https://github.com/Geremia/AquinasOperaOmnia.git",
        str(CACHE),
    ])
    print(f"cache ready: {CACHE}")


def list_works() -> None:
    print("Available works:")
    for wid in sorted(WORK_BUILDERS):
        print(f"  - {wid}")


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    cmd = sys.argv[1]
    if cmd == "prepare-cache":
        prepare_cache()
        return 0
    if cmd == "list":
        list_works()
        return 0
    if cmd == "work":
        if len(sys.argv) < 3:
            print("usage: work <work-id>")
            return 1
        wid = sys.argv[2]
        if wid not in WORK_BUILDERS:
            print(f"unknown work: {wid}")
            return 1
        result = WORK_BUILDERS[wid]()
        print(json.dumps(result, indent=2))
        return 0
    if cmd == "all":
        for wid, fn in WORK_BUILDERS.items():
            print(f"[{wid}]")
            result = fn()
            print(json.dumps(result, indent=2))
        return 0
    print(f"unknown command: {cmd}")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
