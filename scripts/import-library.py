#!/usr/bin/env python3
"""Import the New Advent "Catholic Library" — papal encyclicals, Vatican II
documents, and Holy See declarations — into content/books/papal-magisterium/.

Source: the newadvent.org `library/` mirror. Each `docs_<code>.htm` filename
encodes the issuing pope or dicastery in a short letter+ordinal prefix:

  be14 — Benedict XIV (1740–1758)         pi09 — Pius IX (1846–1878)
  bo08 — Boniface VIII (1294–1303)        pi11 — Pius XI (1922–1939)
  cf   — Pontifical Council for the Family pi12 — Pius XII (1939–1958)
  df   — CDF / Holy Office                 gr16 — Gregory XVI (1831–1846)
  dw   — Cong. for Divine Worship          jo23 — John XXIII (1958–1963)
  ec21 — Second Vatican Council            jp02 — John Paul II (1978–2005)
  le13 — Leo XIII (1878–1903)              pa06 — Paul VI (1963–1978)
  ss33 — Secretariat of State (1933 Concordat)

Copyright note: documents before 1923 are US public domain. Holy See texts
since then are © Libreria Editrice Vaticana; New Advent reproduces them under
fair-use practice. Imported here for personal/devotional use; the imported
manifest records the publishing context per document.

Usage:
    python3 scripts/import-library.py prepare-cache
    python3 scripts/import-library.py list
    python3 scripts/import-library.py all
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import unicodedata
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ZIP = Path.home() / "Documents" / "newadvent.zip"
CACHE = ROOT / "scripts" / "_cache" / "newadvent"
LIBRARY_DIR = CACHE / "library"
BOOK_DIR = ROOT / "content" / "books" / "papal-magisterium"

BOOK_ID = "papal-magisterium"
BOOK_NAME_EN = "Papal Magisterium and Vatican II"

# Group code → (display name, slug, sort rank). Rank orders sections in the
# TOC; chronological with Vatican II as its own grouping.
GROUPS: list[tuple[str, str, str, int]] = [
    ("bo08", "Boniface VIII",                       "boniface-viii",                  1),
    ("pa03", "Paul III",                            "paul-iii",                       2),
    ("be14", "Benedict XIV",                        "benedict-xiv",                   3),
    ("gr16", "Gregory XVI",                         "gregory-xvi",                    4),
    ("pi09", "Pius IX",                             "pius-ix",                        5),
    ("le13", "Leo XIII",                            "leo-xiii",                       6),
    ("pi10", "Pius X",                              "pius-x",                         7),
    ("df07", "Holy Office / CDF (St. Pius X era)",  "holy-office-pius-x",             7),
    ("pi11", "Pius XI",                             "pius-xi",                        8),
    ("ss33", "Holy See — Concordats",               "holy-see-concordats",            8),
    ("pi12", "Pius XII",                            "pius-xii",                       9),
    ("jo23", "John XXIII",                          "john-xxiii",                    10),
    ("ec21", "Second Vatican Council",              "vatican-ii",                    11),
    ("pa06", "Paul VI",                             "paul-vi",                       12),
    ("dw80", "Cong. for Divine Worship",            "divine-worship",                13),
    ("df75", "CDF (1970s)",                         "cdf-1970s",                     14),
    ("df76", "CDF (1976)",                          "cdf-1976",                      14),
    ("df80", "CDF (1980)",                          "cdf-1980",                      14),
    ("df83", "CDF (1980s)",                         "cdf-1980s",                     14),
    ("df84", "CDF (1980s)",                         "cdf-1980s",                     14),
    ("df86", "CDF (1980s)",                         "cdf-1980s",                     14),
    ("df88", "CDF (1980s)",                         "cdf-1980s",                     14),
    ("df95", "CDF (1990s)",                         "cdf-1990s",                     14),
    ("df96", "CDF (1990s)",                         "cdf-1990s",                     14),
    ("df97", "CDF (1990s)",                         "cdf-1990s",                     14),
    ("cf96", "Pontifical Council for the Family",   "council-for-family",            15),
    ("jp02", "John Paul II",                        "john-paul-ii",                  16),
]


def group_for(code: str) -> tuple[str, str, int]:
    """Map a file-id prefix to (display, slug, rank)."""
    # Match the longest prefix.
    for prefix, display, slug_, rank in sorted(GROUPS, key=lambda t: -len(t[0])):
        if code.startswith(prefix):
            return (display, slug_, rank)
    return ("Other", "other", 99)


# ---------------------------------------------------------------------------
# HTML → Markdown (shared shape)
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


def _ascii_fold(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def slug(text: str, *, max_len: int = 60) -> str:
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
# Library page parsing
# ---------------------------------------------------------------------------

@dataclass
class Document:
    file_id: str              # e.g., "docs_le13ae"
    title: str                # "Aeterni Patris"
    subtitle: str = ""        # "On the Restoration of Christian Philosophy"
    year: str = ""            # "1879"
    group_display: str = ""   # "Leo XIII"
    group_slug: str = ""      # "leo-xiii"
    group_rank: int = 99


def _extract_year_subtitle(raw: str) -> tuple[str, str]:
    """The library index puts trailing info like '(Leo XIII, 1879)' after
    each document title. Return (subtitle_without_year, year)."""
    raw = raw.strip().strip(":,.;")
    year = ""
    m = re.search(r"\((?:[^()]*?,\s*)?(\d{4})\)\s*$", raw)
    if m:
        year = m.group(1)
        # Strip the parenthetical from the subtitle for cleanness.
        raw = raw[: m.start()].strip()
    return raw, year


def parse_library_index() -> list[Document]:
    idx_path = LIBRARY_DIR / "index.html"
    if not idx_path.is_file():
        raise SystemExit(f"missing {idx_path}; run prepare-cache first")
    soup = load_html(idx_path)
    main = soup.find("div", id="springfield2")
    if not main:
        raise SystemExit("no springfield2 div in library index")

    docs: list[Document] = []
    seen: set[str] = set()
    link_re = re.compile(r"^\.\./library/(docs_\w+)\.htm$")

    for a in main.find_all("a", href=True):
        m = link_re.match(a["href"])
        if not m:
            continue
        fid = m.group(1)
        if fid in seen:
            continue
        seen.add(fid)
        # The visible title sits inside the <a><b>...</b></a>; the trailing
        # subtitle text follows the </a> up to the next <br>.
        title = text_of(a.find("b")) or text_of(a)
        title = title.rstrip(":,. ").strip()
        subtitle_parts: list[str] = []
        for sib in a.next_siblings:
            if isinstance(sib, Tag) and sib.name == "br":
                break
            if isinstance(sib, NavigableString):
                subtitle_parts.append(str(sib))
            elif isinstance(sib, Tag):
                subtitle_parts.append(text_of(sib))
        raw_sub = re.sub(r"\s+", " ", "".join(subtitle_parts)).strip()
        subtitle, year = _extract_year_subtitle(raw_sub)
        # Strip the prefix `docs_` for group lookup.
        code = fid.removeprefix("docs_")
        gdisp, gslug, grank = group_for(code)
        docs.append(Document(
            file_id=fid,
            title=title,
            subtitle=subtitle,
            year=year,
            group_display=gdisp,
            group_slug=gslug,
            group_rank=grank,
        ))
    return docs


# ---------------------------------------------------------------------------
# Document rendering
# ---------------------------------------------------------------------------

def render_document(doc: Document) -> tuple[str, str]:
    """Load a library doc page, return (title, markdown)."""
    path = LIBRARY_DIR / f"{doc.file_id}.htm"
    if not path.is_file():
        return ("", "")
    soup = load_html(path)
    h1 = soup.find("h1")
    title = text_of(h1) if h1 else doc.title
    main = soup.find("div", id="springfield2")
    if not main:
        return (title, "")
    for el in main.find_all("div", class_="pub"):
        el.decompose()
    for el in main.find_all("div", id="ogdenville"):
        el.decompose()
    for span in main.find_all("span", class_="breadcrumbs"):
        span.decompose()
    for span in main.find_all("span", class_="navg"):
        span.decompose()
    for tag in main.find_all("h1"):
        tag.decompose()
    return (title, html_to_markdown(main).strip())


# ---------------------------------------------------------------------------
# Emission
# ---------------------------------------------------------------------------

def write_book(docs: list[Document]) -> dict:
    if BOOK_DIR.is_dir():
        shutil.rmtree(BOOK_DIR)
    en_dir = BOOK_DIR / "en-US"
    en_dir.mkdir(parents=True, exist_ok=True)

    grouped: dict[tuple[int, str, str], list[tuple[Document, str]]] = {}
    written = 0
    skipped: list[str] = []

    for doc in docs:
        title, md = render_document(doc)
        if not md:
            skipped.append(f"{doc.file_id}: {doc.title}")
            continue
        chap_id = doc.file_id  # e.g., "docs_le13ae"
        # Chapter body: title, then subtitle (italics), then markdown body.
        body_lines = [f"# {title}"]
        sub = doc.subtitle.strip()
        if doc.year:
            sub = f"{sub} ({doc.year})" if sub else f"({doc.year})"
        if sub:
            body_lines.append(f"*{sub}*")
        body_lines.append(md)
        (en_dir / f"{chap_id}.md").write_text("\n\n".join(body_lines) + "\n", encoding="utf-8")
        key = (doc.group_rank, doc.group_slug, doc.group_display)
        grouped.setdefault(key, []).append((doc, title))
        written += 1

    toc: list[dict] = []
    for (rank, slug_, display) in sorted(grouped):
        section_docs = grouped[(rank, slug_, display)]
        # Sort by year (ascending) then title.
        section_docs.sort(key=lambda pair: (pair[0].year or "9999", pair[1]))
        children = []
        for (doc, ttl) in section_docs:
            label = ttl if not doc.year else f"{ttl} ({doc.year})"
            children.append({"id": doc.file_id, "title": {"en-US": label}})
        toc.append({
            "id": f"section-{slug_}",
            "title": {"en-US": display},
            "children": children,
        })

    meta = {
        "id": BOOK_ID,
        "name": {"en-US": BOOK_NAME_EN},
        "author": {"en-US": "Various Popes, Roman Dicasteries, and the Second Vatican Council"},
        "composed": "1302–2003",
        "languages": ["en-US"],
        "sources": [{
            "language": "en-US",
            "url": "http://www.newadvent.org/library/",
            "description": (
                "Sourced from New Advent's Catholic Library "
                "(http://www.newadvent.org/library/). Pre-1923 documents are "
                "in the US public domain. Holy See texts after 1923 are "
                "© Libreria Editrice Vaticana, reproduced under fair-use "
                "practice for personal study and devotional use; the "
                "authoritative texts are at vatican.va."
            ),
        }],
        "toc": toc,
    }
    with (BOOK_DIR / "book.json").open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return {"written": written, "skipped": skipped, "sections": len(toc)}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_prepare_cache() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if LIBRARY_DIR.is_dir() and (LIBRARY_DIR / "index.html").is_file():
        print(f"cache already populated at {LIBRARY_DIR}")
        return
    if not ARCHIVE_ZIP.is_file():
        raise SystemExit(f"missing source archive {ARCHIVE_ZIP}")
    print(f"unzipping {ARCHIVE_ZIP} → {CACHE}")
    with zipfile.ZipFile(ARCHIVE_ZIP) as zf:
        for name in zf.namelist():
            if name.startswith(("fathers/", "cathen/", "library/")):
                zf.extract(name, CACHE)
    print(f"cache ready at {LIBRARY_DIR}")


def cmd_list() -> None:
    docs = parse_library_index()
    by_group: dict[str, list[Document]] = {}
    for d in docs:
        by_group.setdefault(d.group_display, []).append(d)
    for group, items in sorted(by_group.items(), key=lambda kv: kv[1][0].group_rank):
        print(f"\n{group} ({len(items)})")
        for d in items[:5]:
            yr = f" ({d.year})" if d.year else ""
            print(f"  - {d.title}{yr}")
        if len(items) > 5:
            print(f"  ... +{len(items) - 5} more")
    print(f"\nTotal: {len(docs)}")


def cmd_all() -> None:
    docs = parse_library_index()
    print(f"parsed {len(docs)} documents")
    info = write_book(docs)
    print(f"\nwrote {info['written']} documents across {info['sections']} sections")
    if info["skipped"]:
        print(f"skipped {len(info['skipped'])}:")
        for s in info["skipped"][:10]:
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
    elif cmd == "all":
        cmd_all()
    else:
        raise SystemExit(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
