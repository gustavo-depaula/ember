#!/usr/bin/env python3
"""Import the New Advent Catholic Encyclopedia (1907–1914) into
content/books/catholic-encyclopedia/.

Source: the newadvent.org `cathen/` mirror. The Catholic Encyclopedia
(Robert Appleton Co., New York, 15 volumes 1907–1914) is in the US public
domain — copyright was not renewed and the work pre-dates the 1923 cutoff.
New Advent's HTML transcription, while curated by Kevin Knight, does not add
new copyrightable expression to the underlying text.

Usage:
    python3 scripts/import-cathen.py prepare-cache   # uses the shared cache
    python3 scripts/import-cathen.py list             # show parsed index
    python3 scripts/import-cathen.py letter <a|b|...> # import one letter
    python3 scripts/import-cathen.py all              # full import (~11k articles)
"""
from __future__ import annotations

import json
import re
import shutil
import string
import sys
import unicodedata
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ZIP = Path.home() / "Documents" / "newadvent.zip"
CACHE = ROOT / "scripts" / "_cache" / "newadvent"
CATHEN_DIR = CACHE / "cathen"
BOOK_DIR = ROOT / "content" / "books" / "catholic-encyclopedia"

BOOK_ID = "catholic-encyclopedia"
BOOK_NAME_EN = "The Catholic Encyclopedia"
BOOK_AUTHOR_EN = "Charles G. Herbermann, ed. (Robert Appleton Co., 1907–1914)"


# ---------------------------------------------------------------------------
# HTML → Markdown (shared shape with import-fathers.py, slimmed for cathen)
# ---------------------------------------------------------------------------

DROP_TAGS = {"script", "style", "noscript"}
INLINE_TAGS = {"a", "span", "font", "small", "abbr", "cite"}


_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def load_html(path: Path) -> BeautifulSoup:
    text = path.read_text(encoding="utf-8", errors="replace")
    # A handful of New Advent source pages contain orphan HTML comment
    # markers (e.g. an unintentional `<!--` mid-paragraph). lxml then treats
    # everything to EOF as comment, swallowing the colophon and adjacent
    # blocks. Strip comments upfront — they carry no rendered content.
    text = _COMMENT_RE.sub("", text)
    text = text.replace("<!--", "").replace("-->", "")
    # Strip a known corruption signature left behind by orphan comments in
    # ~72 New Advent source files (e.g. `<!--3ref=u44=xxyyyk.htm">` inside a
    # paragraph). Once the comment markers are gone, the literal `3ref=…`
    # fragment lands in the body text — purge it.
    text = re.sub(r'\d+ref=\w+=xxyyyk\.htm"?>', "", text)
    return BeautifulSoup(text, "lxml")


def text_of(node) -> str:
    if node is None:
        return ""
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True))


def _ascii_fold(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def slug(text: str, *, max_len: int = 80) -> str:
    text = _ascii_fold(text).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if len(text) <= max_len:
        return text
    cut = text[:max_len]
    last = cut.rfind("-")
    if last >= max_len // 2:
        cut = cut[:last]
    return cut.strip("-")


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


def _render_table(table: Tag) -> str:
    """Convert an HTML <table> to a Markdown pipe table.

    Best-effort: flattens cell content (replaces internal `<br>` with ` / `),
    escapes pipes, and emits a header-separator row after the first row. Does
    not preserve `rowspan` / `colspan`, but keeps the textual data intact and
    legible — better than the bs4 default of squashing all cell text into one
    run-on string.
    """
    rows = table.find_all("tr")
    if not rows:
        return ""
    out_rows: list[list[str]] = []
    for tr in rows:
        cells = tr.find_all(["td", "th"], recursive=False)
        if not cells:
            continue
        row: list[str] = []
        for c in cells:
            text = _inline(c)
            text = re.sub(r"\s*\n+\s*", " / ", text)
            text = re.sub(r"\s+", " ", text).strip()
            text = text.replace("|", "\\|")
            row.append(text or " ")
        out_rows.append(row)
    if not out_rows:
        return ""
    width = max(len(r) for r in out_rows)
    for r in out_rows:
        while len(r) < width:
            r.append(" ")
    lines = ["| " + " | ".join(out_rows[0]) + " |",
             "|" + "|".join([" --- "] * width) + "|"]
    for r in out_rows[1:]:
        lines.append("| " + " | ".join(r) + " |")
    return "\n".join(lines)


def html_to_markdown(root: Tag) -> str:
    out: list[str] = []
    for el in root.children:
        if isinstance(el, NavigableString):
            txt = str(el).strip()
            if txt:
                out.append(_collapse(txt))
            continue
        name = (el.name or "").lower()
        if name in DROP_TAGS:
            continue
        if name in ("h1", "h2", "h3", "h4"):
            level = int(name[1])
            inner = _collapse(_inline(el))
            if inner:
                out.append(f"{'#' * level} {inner}")
        elif name == "p":
            cls = (el.get("class") or [""])[0]
            inner = _collapse(_inline(el))
            if not inner:
                continue
            if cls == "h1a":
                out.append(f"*{inner}*")
            else:
                out.append(inner)
        elif name == "blockquote":
            inner = _collapse(html_to_markdown(el))
            if inner:
                quoted = "\n".join(f"> {line}" if line else ">" for line in inner.splitlines())
                out.append(quoted)
        elif name in ("ul", "ol"):
            bullet = "-" if name == "ul" else "1."
            items: list[str] = []
            for li in el.find_all("li", recursive=False):
                inner = _collapse(_inline(li))
                if inner:
                    items.append(f"{bullet} {inner}")
            if items:
                out.append("\n".join(items))
        elif name == "div":
            inner = html_to_markdown(el)
            if inner.strip():
                out.append(inner)
        elif name == "table":
            t = _render_table(el)
            if t:
                out.append(t)
        elif name == "hr":
            out.append("---")
        elif name == "br":
            continue
        else:
            inner = _collapse(_inline(el))
            if inner:
                out.append(inner)
    return "\n\n".join(out)


# ---------------------------------------------------------------------------
# Article extraction
# ---------------------------------------------------------------------------

@dataclass
class ArticleSource:
    author: str = ""
    article: str = ""
    year: str = ""

    def description(self) -> str:
        bits = []
        if self.author:
            bits.append(self.author.rstrip("."))
        if self.article:
            bits.append(f'"{self.article}"')
        if self.year:
            bits.append(f"The Catholic Encyclopedia, {self.year}")
        return ". ".join(bits) + "." if bits else ""


def parse_article_source(soup: BeautifulSoup) -> ArticleSource:
    src = ArticleSource()
    for idn, attr in (("mlaauthor", "author"), ("mlaarticle", "article"), ("mlayear", "year")):
        span = soup.find("span", id=idn)
        if span:
            setattr(src, attr, text_of(span).strip(' .,"\''))
    return src


def extract_article(soup: BeautifulSoup) -> Tag | None:
    main = soup.find("div", id="springfield2")
    if not main:
        return None
    for cls in ("pub",):
        for el in main.find_all("div", class_=cls):
            el.decompose()
    for el in main.find_all("div", id="ogdenville"):
        el.decompose()
    for span in main.find_all("span", class_="breadcrumbs"):
        span.decompose()
    for span in main.find_all("span", class_="navb"):
        span.decompose()
    return main


# ---------------------------------------------------------------------------
# Index parsing
# ---------------------------------------------------------------------------

@dataclass
class Entry:
    article_id: str       # e.g., "01001a"
    title: str
    summary: str = ""     # short description from index page
    letter: str = ""


_CATHEN_LINK_RE = re.compile(r"^\.\./cathen/(\w+)\.htm$")


def parse_letter_index(letter: str) -> list[Entry]:
    """Parse the full index for one letter (a-ce.htm style file)."""
    path = CATHEN_DIR / f"{letter}-ce.htm"
    if not path.is_file():
        return []
    soup = load_html(path)
    main = soup.find("div", id="springfield2")
    if not main:
        return []
    out: list[Entry] = []
    seen: set[str] = set()
    for a in main.find_all("a", href=True):
        m = _CATHEN_LINK_RE.match(a["href"])
        if not m:
            continue
        article_id = m.group(1)
        # Skip the letter-index pages (a-ce, a.htm, etc.) and the home.
        if article_id in {"index"} or re.fullmatch(r"[a-z]", article_id) or re.fullmatch(r"[a-z]-ce", article_id):
            continue
        if article_id in seen:
            continue
        seen.add(article_id)
        title = text_of(a).strip()
        if not title:
            continue
        # Summary is the inline text immediately following the <a> until the
        # next <br> sibling. Walk siblings.
        summary_parts: list[str] = []
        for sib in a.next_siblings:
            if isinstance(sib, Tag) and sib.name == "br":
                break
            if isinstance(sib, NavigableString):
                summary_parts.append(str(sib))
            elif isinstance(sib, Tag):
                summary_parts.append(text_of(sib))
        summary = re.sub(r"\s+", " ", "".join(summary_parts)).strip(" -—–")
        out.append(Entry(article_id=article_id, title=title, summary=summary, letter=letter))
    return out


def parse_all_indexes() -> list[Entry]:
    out: list[Entry] = []
    for letter in string.ascii_lowercase:
        out.extend(parse_letter_index(letter))
    return out


# ---------------------------------------------------------------------------
# Article rendering
# ---------------------------------------------------------------------------

def render_article(article_id: str) -> tuple[str, str, ArticleSource]:
    """Load an article page, return (title, markdown, source)."""
    path = CATHEN_DIR / f"{article_id}.htm"
    if not path.is_file():
        return ("", "", ArticleSource())
    soup = load_html(path)
    h1 = soup.find("h1")
    title = text_of(h1) if h1 else article_id
    src = parse_article_source(soup)
    main = extract_article(soup)
    if not main:
        return (title, "", src)
    # Strip the h1 (we write it as the chapter heading).
    for tag in main.find_all("h1"):
        tag.decompose()
    md = html_to_markdown(main).strip()
    return (title, md, src)


# ---------------------------------------------------------------------------
# Emission
# ---------------------------------------------------------------------------

def write_book(entries: list[Entry]) -> dict:
    en_dir = BOOK_DIR / "en-US"
    en_dir.mkdir(parents=True, exist_ok=True)
    # Clean stale chapters from prior runs.
    for ff in en_dir.glob("*.md"):
        ff.unlink()

    # Build TOC grouped by letter.
    by_letter: dict[str, list[tuple[Entry, str]]] = {}
    written = 0
    skipped = 0
    skipped_examples: list[str] = []
    sources_set: set[str] = set()

    for entry in entries:
        title, md, src = render_article(entry.article_id)
        if not md:
            skipped += 1
            if len(skipped_examples) < 10:
                skipped_examples.append(f"{entry.article_id}: {entry.title}")
            continue
        title = title or entry.title
        chap_id = entry.article_id
        body_lines = [f"# {title}"]
        if entry.summary:
            body_lines.append(f"*{entry.summary}*")
        body_lines.append(md)
        (en_dir / f"{chap_id}.md").write_text("\n\n".join(body_lines) + "\n", encoding="utf-8")
        by_letter.setdefault(entry.letter, []).append((entry, title))
        written += 1
        if src.author:
            sources_set.add(src.author)

    toc: list[dict] = []
    for letter in sorted(by_letter.keys()):
        children = [
            {"id": e.article_id, "title": {"en-US": title}}
            for (e, title) in by_letter[letter]
        ]
        toc.append({
            "id": f"letter-{letter}",
            "title": {"en-US": letter.upper()},
            "children": children,
        })

    meta = {
        "id": BOOK_ID,
        "name": {"en-US": BOOK_NAME_EN},
        "author": {"en-US": BOOK_AUTHOR_EN},
        "composed": "1907–1914",
        "languages": ["en-US"],
        "sources": [{
            "language": "en-US",
            "url": "http://www.newadvent.org/cathen/",
            "description": (
                "The Catholic Encyclopedia, 15 vols., Robert Appleton Co., "
                "New York, 1907–1914. Public domain. HTML transcription by "
                "New Advent / Kevin Knight."
            ),
        }],
        "toc": toc,
    }
    with (BOOK_DIR / "book.json").open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return {
        "written": written,
        "skipped": skipped,
        "skipped_examples": skipped_examples,
        "letters": len(by_letter),
    }


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_prepare_cache() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if CATHEN_DIR.is_dir() and (CATHEN_DIR / "a-ce.htm").is_file():
        print(f"cache already populated at {CATHEN_DIR}")
        return
    if not ARCHIVE_ZIP.is_file():
        raise SystemExit(f"missing source archive {ARCHIVE_ZIP}")
    print(f"unzipping {ARCHIVE_ZIP} → {CACHE}")
    with zipfile.ZipFile(ARCHIVE_ZIP) as zf:
        for name in zf.namelist():
            if name.startswith(("fathers/", "cathen/", "library/")):
                zf.extract(name, CACHE)
    print(f"cache ready at {CATHEN_DIR}")


def cmd_list() -> None:
    entries = parse_all_indexes()
    counts: dict[str, int] = {}
    for e in entries:
        counts[e.letter] = counts.get(e.letter, 0) + 1
    for letter in sorted(counts):
        print(f"  {letter.upper()}: {counts[letter]}")
    print(f"\nTotal articles: {len(entries)}")


def cmd_letter(letter: str) -> None:
    entries = parse_letter_index(letter.lower())
    print(f"{len(entries)} entries for letter {letter.upper()}")
    info = write_book(entries)
    print(f"  written {info['written']}, skipped {info['skipped']}")


def cmd_all() -> None:
    entries = parse_all_indexes()
    print(f"parsed {len(entries)} entries across all letters")
    if BOOK_DIR.is_dir():
        shutil.rmtree(BOOK_DIR)
    info = write_book(entries)
    print(f"\n=== Summary ===")
    print(f"wrote {info['written']} articles")
    print(f"skipped {info['skipped']}")
    if info["skipped_examples"]:
        print("first skipped:")
        for s in info["skipped_examples"]:
            print(f"  - {s}")


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "prepare-cache":
        cmd_prepare_cache()
    elif cmd == "list":
        cmd_list()
    elif cmd == "letter":
        if len(sys.argv) < 3:
            raise SystemExit("usage: letter <a|b|...>")
        cmd_letter(sys.argv[2])
    elif cmd == "all":
        cmd_all()
    else:
        raise SystemExit(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
