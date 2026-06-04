#!/usr/bin/env python3
"""Import New Advent's Douay-Rheims Bible (Challoner revision, with notes)
into content/books/douay-rheims-challoner/.

The text is the Challoner-revised Douay-Rheims (1749/1752/1899), public
domain. New Advent's transcription adds the original Challoner footnotes
inline (rendered here as italicized parentheticals after the verse), plus
cross-reference hyperlinks to Catholic Encyclopedia articles (stripped here
since those don't resolve in-app).

One book, three-level TOC:
    Testament  →  Book  →  Chapter

Usage:
    python3 scripts/import-douay.py prepare-cache
    python3 scripts/import-douay.py all
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import zipfile
from dataclasses import dataclass
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ZIP = Path.home() / "Documents" / "newadvent.zip"
CACHE = ROOT / "scripts" / "_cache" / "newadvent"
BIBLE_DIR = CACHE / "douay"          # use the simpler springfield2-layout copy
BOOK_DIR = ROOT / "content" / "books" / "douay-rheims-challoner"
BOOK_ID = "douay-rheims-challoner"


# Canonical book order, grouped by section. (code, full-name, n-chapters).
# n-chapters is the upper bound used for the file glob — extra files (if any)
# are picked up anyway by scanning the dir.
BOOKS = [
    # --- Old Testament: Pentateuch ---
    ("OT-pentateuch", "The Pentateuch", [
        ("gen", "Genesis"),
        ("exo", "Exodus"),
        ("lev", "Leviticus"),
        ("num", "Numbers"),
        ("deu", "Deuteronomy"),
    ]),
    # --- Old Testament: Historical Books ---
    ("OT-historical", "Historical Books", [
        ("jos", "Joshua"),
        ("jdg", "Judges"),
        ("rut", "Ruth"),
        ("1sa", "1 Samuel"),
        ("2sa", "2 Samuel"),
        ("1ki", "1 Kings"),
        ("2ki", "2 Kings"),
        ("1ch", "1 Chronicles"),
        ("2ch", "2 Chronicles"),
        ("ezr", "Ezra"),
        ("neh", "Nehemiah"),
        ("tob", "Tobit"),
        ("jth", "Judith"),
        ("est", "Esther"),
        ("1ma", "1 Maccabees"),
        ("2ma", "2 Maccabees"),
    ]),
    # --- Old Testament: Wisdom ---
    ("OT-wisdom", "Wisdom Books", [
        ("job", "Job"),
        ("psa", "Psalms"),
        ("pro", "Proverbs"),
        ("ecc", "Ecclesiastes"),
        ("son", "Song of Songs"),
        ("wis", "Wisdom"),
        ("sir", "Sirach"),
    ]),
    # --- Old Testament: Major Prophets ---
    ("OT-major-prophets", "Major Prophets", [
        ("isa", "Isaiah"),
        ("jer", "Jeremiah"),
        ("lam", "Lamentations"),
        ("bar", "Baruch"),
        ("eze", "Ezekiel"),
        ("dan", "Daniel"),
    ]),
    # --- Old Testament: Minor Prophets ---
    ("OT-minor-prophets", "Minor Prophets", [
        ("hos", "Hosea"),
        ("joe", "Joel"),
        ("amo", "Amos"),
        ("oba", "Obadiah"),
        ("jon", "Jonah"),
        ("mic", "Micah"),
        ("nah", "Nahum"),
        ("hab", "Habakkuk"),
        ("zep", "Zephaniah"),
        ("hag", "Haggai"),
        ("zec", "Zechariah"),
        ("mal", "Malachi"),
    ]),
    # --- New Testament: Gospels & Acts ---
    ("NT-gospels", "Gospels & Acts", [
        ("mat", "Matthew"),
        ("mar", "Mark"),
        ("luk", "Luke"),
        ("joh", "John"),
        ("act", "Acts of the Apostles"),
    ]),
    # --- New Testament: Pauline Epistles ---
    ("NT-pauline", "Epistles of St. Paul", [
        ("rom", "Romans"),
        ("1co", "1 Corinthians"),
        ("2co", "2 Corinthians"),
        ("gal", "Galatians"),
        ("eph", "Ephesians"),
        ("phi", "Philippians"),
        ("col", "Colossians"),
        ("1th", "1 Thessalonians"),
        ("2th", "2 Thessalonians"),
        ("1ti", "1 Timothy"),
        ("2ti", "2 Timothy"),
        ("tit", "Titus"),
        ("phm", "Philemon"),
        ("heb", "Hebrews"),
    ]),
    # --- New Testament: General Epistles & Revelation ---
    ("NT-general", "General Epistles & Revelation", [
        ("jam", "James"),
        ("1pe", "1 Peter"),
        ("2pe", "2 Peter"),
        ("1jo", "1 John"),
        ("2jo", "2 John"),
        ("3jo", "3 John"),
        ("jud", "Jude"),
        ("rev", "Revelation"),
    ]),
]


# ---------------------------------------------------------------------------
# Shared HTML → Markdown
# ---------------------------------------------------------------------------

DROP_TAGS = {"script", "style", "noscript"}
INLINE_TAGS = {"a", "span", "font", "small", "abbr", "cite"}


_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def load_html(path: Path) -> BeautifulSoup:
    text = path.read_text(encoding="utf-8", errors="replace")
    text = _COMMENT_RE.sub("", text)
    text = text.replace("<!--", "").replace("-->", "")
    return BeautifulSoup(text, "lxml")


def text_of(node) -> str:
    if node is None:
        return ""
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True))


def _wrap_emphasis(inner: str, marker: str) -> str:
    if "\n" not in inner:
        return f"{marker}{inner}{marker}"
    lines = [ln.strip() for ln in re.split(r"\n+", inner) if ln.strip()]
    if not lines:
        return ""
    if len(lines) == 1:
        return f"{marker}{lines[0]}{marker}"
    return "\n\n".join(f"{marker}{ln}{marker}" for ln in lines)


def _inline(node) -> str:
    parts: list[str] = []
    for child in getattr(node, "children", []):
        if isinstance(child, NavigableString):
            parts.append(re.sub(r"\s+", " ", str(child)))
            continue
        name = (child.name or "").lower()
        if name in DROP_TAGS:
            continue
        if name == "br":
            parts.append("  \n")
        elif name in ("b", "strong"):
            inner = _inline(child).strip()
            if inner:
                parts.append(_wrap_emphasis(inner, "**"))
        elif name in ("i", "em"):
            inner = _inline(child).strip()
            if inner:
                parts.append(_wrap_emphasis(inner, "*"))
        elif name == "sup":
            inner = _inline(child).strip()
            if inner:
                parts.append(f"^{inner}^")
        elif name == "q":
            inner = _inline(child).strip()
            if inner:
                parts.append(f"“{inner}”")
        elif name == "span":
            cls = (child.get("class") or [""])[0]
            if cls == "stiki":
                # Challoner footnote — render as italic parenthetical right
                # where it appears inline with the verse.
                inner = _inline(child).strip()
                if inner:
                    parts.append(f" *({inner})*")
            elif cls == "verse":
                # Verse number marker — render as **N**.
                inner = _inline(child).strip()
                if inner:
                    parts.append(f"**{inner}** ")
            elif cls.startswith("pro"):
                # Each verse in chapter prose lives in a <span class="proNNN">.
                # All verses sit inside one chapter-level <p>; emit a paragraph
                # break before each so the verse layout survives.
                inner = _inline(child).strip()
                if inner:
                    parts.append("\n\n" + inner)
            else:
                parts.append(_inline(child))
        elif name in INLINE_TAGS:
            parts.append(_inline(child))
        else:
            parts.append(_inline(child))
    return "".join(parts)


def _collapse(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chapter_markdown(soup: BeautifulSoup) -> str:
    """Render a Bible chapter page to clean Markdown.

    Strategy: walk the prose/poetry blocks, treating each <span class="proXXX">
    (or the parent <p class="bibleprose">) as one verse. Verse number markers
    and footnotes are rendered inline.
    """
    main = soup.find("div", id="springfield2")
    if not main:
        return ""

    # Drop New Advent boilerplate inside the content div.
    for sel in [
        ("div", {"class": "biblenav"}),
        ("div", {"id": "bibleguide"}),
        ("div", {"class": "pub"}),
        ("div", {"id": "ogdenville"}),
        ("blockquote", {"class": "copyright"}),
    ]:
        for el in main.find_all(sel[0], **{k: v for k, v in sel[1].items()}):
            el.decompose()

    # Drop the <h1> (we set the chapter title outside the body).
    for h1 in main.find_all("h1"):
        h1.decompose()

    out: list[str] = []
    for el in main.children:
        if isinstance(el, NavigableString):
            continue
        name = (el.name or "").lower()
        if name in DROP_TAGS:
            continue
        if name == "p":
            inner = _collapse(_inline(el))
            if inner:
                out.append(inner)
        elif name == "div":
            cls = (el.get("class") or [""])[0]
            if cls == "h1a":
                # Chapter summary line.
                inner = _collapse(_inline(el))
                if inner:
                    out.append(f"*{inner}*")
            else:
                inner = chapter_markdown(BeautifulSoup(str(el), "lxml"))
                if inner.strip():
                    out.append(inner)
        elif name == "blockquote":
            inner = _collapse(_inline(el))
            if inner:
                quoted = "\n".join(f"> {ln}" for ln in inner.splitlines())
                out.append(quoted)
    return "\n\n".join(out).strip()


# ---------------------------------------------------------------------------
# Per-book chapter discovery
# ---------------------------------------------------------------------------

@dataclass
class Chapter:
    book_code: str        # "gen"
    n: int                # chapter number
    file_id: str          # "gen001"


def discover_chapters(book_code: str) -> list[Chapter]:
    chapters: list[Chapter] = []
    for f in sorted(BIBLE_DIR.glob(f"{book_code}[0-9][0-9][0-9].htm")):
        n = int(f.stem[len(book_code):])
        if n == 0:
            # gen000.htm is a redirect to gen001.htm — skip.
            continue
        chapters.append(Chapter(book_code=book_code, n=n, file_id=f.stem))
    return chapters


def render_chapter(chap: Chapter) -> str:
    path = BIBLE_DIR / f"{chap.file_id}.htm"
    if not path.is_file():
        return ""
    soup = load_html(path)
    return chapter_markdown(soup)


# ---------------------------------------------------------------------------
# Emission
# ---------------------------------------------------------------------------

def write_book() -> dict:
    if BOOK_DIR.is_dir():
        shutil.rmtree(BOOK_DIR)
    en_dir = BOOK_DIR / "en-US"
    en_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    total_chapters = 0
    missing_books: list[str] = []

    for section_id, section_label, books in BOOKS:
        book_nodes: list[dict] = []
        for book_code, book_name in books:
            chapters = discover_chapters(book_code)
            if not chapters:
                missing_books.append(book_code)
                continue
            chap_nodes = []
            for ch in chapters:
                md = render_chapter(ch)
                if not md:
                    continue
                body = f"# {book_name} {ch.n}\n\n{md}\n"
                (en_dir / f"{ch.file_id}.md").write_text(body, encoding="utf-8")
                chap_nodes.append({
                    "id": ch.file_id,
                    "title": {"en-US": f"Chapter {ch.n}"},
                })
                total_chapters += 1
            if chap_nodes:
                book_nodes.append({
                    "id": f"book-{book_code}",
                    "title": {"en-US": book_name},
                    "children": chap_nodes,
                })
        if book_nodes:
            toc.append({
                "id": f"section-{section_id}",
                "title": {"en-US": section_label},
                "children": book_nodes,
            })

    meta = {
        "id": BOOK_ID,
        "name": {"en-US": "Douay-Rheims Bible (Challoner Revision, with Notes)"},
        "author": {"en-US": "Bp. Richard Challoner (revisor, 1749–1752)"},
        "composed": "1582–1610; revised 1749–1752",
        "languages": ["en-US"],
        "sources": [{
            "language": "en-US",
            "url": "http://www.newadvent.org/bible/",
            "description": (
                "Douay-Rheims Bible, Challoner Revision: Old Testament first "
                "published 1609 by the English College at Douay; New Testament "
                "1582 by the English College at Rheims; revised and annotated "
                "1749 by Bishop Richard Challoner. Imprimatur +James Cardinal "
                "Gibbons, Archbishop of Baltimore, 1 September 1899. "
                "Transcribed and hyperlinked by Kevin Knight for New Advent."
            ),
        }],
        "toc": toc,
    }
    with (BOOK_DIR / "book.json").open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return {
        "chapters": total_chapters,
        "sections": len(toc),
        "books": sum(len(s["children"]) for s in toc),
        "missing": missing_books,
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_prepare_cache() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if BIBLE_DIR.is_dir() and (BIBLE_DIR / "index.html").is_file():
        print(f"cache already populated at {BIBLE_DIR}")
        return
    if not ARCHIVE_ZIP.is_file():
        raise SystemExit(f"missing source archive {ARCHIVE_ZIP}")
    print(f"unzipping {ARCHIVE_ZIP} → {CACHE}")
    with zipfile.ZipFile(ARCHIVE_ZIP) as zf:
        for name in zf.namelist():
            if name.startswith(("bible/", "douay/", "summa/")):
                zf.extract(name, CACHE)
    print(f"cache ready at {BIBLE_DIR}")


def cmd_all() -> None:
    info = write_book()
    print(f"wrote {info['chapters']} chapters across {info['books']} books "
          f"in {info['sections']} sections")
    if info["missing"]:
        print(f"missing: {info['missing']}")


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "prepare-cache":
        cmd_prepare_cache()
    elif cmd == "all":
        cmd_all()
    else:
        raise SystemExit(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
