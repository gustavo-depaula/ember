#!/usr/bin/env python3
"""Import New Advent's Summa Theologica into
content/books/aquinas-summa-theologica-new-advent/.

This is the Shapcote / Fathers of the English Dominican Province translation
(Second and Revised Edition, 1920) — the same canonical PD translation used
by the Geremia mirror (already imported as `aquinas-summa-theologiae`), but
New Advent organizes the corpus differently: one HTML file per **question**,
with each article as an inline `<h2 id="articleN">` section. The Geremia
version splits article-by-article instead.

Both are kept so future readers can compare presentations. Layout here:
- One book: `aquinas-summa-theologica-new-advent`
- TOC: 7 parts (Prima Pars, Prima Secundae, Secunda Secundae, Tertia Pars,
  Supplementum, Appendix I, Appendix II), each with question children.
- One chapter per question.

Usage:
    python3 scripts/import-summa-new-advent.py prepare-cache
    python3 scripts/import-summa-new-advent.py all
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import unicodedata
import zipfile
from dataclasses import dataclass
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ZIP = Path.home() / "Documents" / "newadvent.zip"
CACHE = ROOT / "scripts" / "_cache" / "newadvent"
SUMMA_DIR = CACHE / "summa"
BOOK_DIR = ROOT / "content" / "books" / "aquinas-summa-theologica-new-advent"

BOOK_ID = "aquinas-summa-theologica-new-advent"


# (part-digit, label, slug, question-count expected — used only for sanity).
PARTS = [
    ("1", "Prima Pars",                "prima-pars",          120),
    ("2", "Prima Secundae",            "prima-secundae",      115),
    ("3", "Secunda Secundae",          "secunda-secundae",    191),
    ("4", "Tertia Pars",               "tertia-pars",          91),
    ("5", "Supplementum",              "supplementum",        100),
    ("6", "Appendix I",                "appendix-i",            2),
    ("7", "Appendix II",               "appendix-ii",           1),
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


def extract_main(soup: BeautifulSoup) -> Tag | None:
    main = soup.find("div", id="springfield2")
    if not main:
        return None
    for el in main.find_all("div", class_="pub"):
        el.decompose()
    for el in main.find_all("div", id="ogdenville"):
        el.decompose()
    for span in main.find_all("span", class_="breadcrumbs"):
        span.decompose()
    return main


# ---------------------------------------------------------------------------
# Summa-specific parsing
# ---------------------------------------------------------------------------

@dataclass
class Question:
    part_digit: str       # "1".."7"
    qnum: int
    file_id: str          # e.g., "1001"
    title: str            # short title (e.g., "Sacred doctrine, considered in itself")
    markdown: str = ""


def question_title(soup: BeautifulSoup, qnum: int) -> str:
    """Pull a clean question title from <title>: 'SUMMA THEOLOGICA: <title> (FP, Q. 1)'."""
    t = soup.find("title")
    if not t:
        return f"Question {qnum}"
    raw = text_of(t)
    raw = re.sub(r"^SUMMA THEOLOGICA:\s*", "", raw, flags=re.IGNORECASE)
    # Drop trailing ' (FP, Q. 1)' / ' (Appendix I, Q. 1)' parenthetical.
    raw = re.sub(r"\s*\([^()]*Q\.?\s*\d+[^()]*\)\s*$", "", raw)
    return raw.strip() or f"Question {qnum}"


def render_question(file_id: str, part_digit: str, qnum: int) -> Question:
    path = SUMMA_DIR / f"{file_id}.htm"
    if not path.is_file():
        return Question(part_digit=part_digit, qnum=qnum, file_id=file_id, title=f"Question {qnum}")
    soup = load_html(path)
    title = question_title(soup, qnum)
    main = extract_main(soup)
    if not main:
        return Question(part_digit=part_digit, qnum=qnum, file_id=file_id, title=title)
    # Strip the question title <h1> if present (we use the title separately).
    for h1 in main.find_all("h1"):
        h1.decompose()
    md = html_to_markdown(main).strip()
    return Question(part_digit=part_digit, qnum=qnum, file_id=file_id, title=title, markdown=md)


# ---------------------------------------------------------------------------
# Emission
# ---------------------------------------------------------------------------

def write_book() -> dict:
    if BOOK_DIR.is_dir():
        shutil.rmtree(BOOK_DIR)
    en_dir = BOOK_DIR / "en-US"
    en_dir.mkdir(parents=True, exist_ok=True)

    toc: list[dict] = []
    total_q = 0
    skipped: list[str] = []

    for part_digit, part_label, part_slug, _ in PARTS:
        # Find all questions for this part by scanning the directory.
        questions: list[Question] = []
        for f in sorted(SUMMA_DIR.glob(f"{part_digit}[0-9][0-9][0-9].htm")):
            fid = f.stem
            qnum = int(fid[1:])
            q = render_question(fid, part_digit, qnum)
            if not q.markdown:
                skipped.append(fid)
                continue
            questions.append(q)
        children = []
        for q in questions:
            chap_id = f"p{part_digit}-q{q.qnum:03d}"
            body = f"# Question {q.qnum}. {q.title}\n\n{q.markdown}\n"
            (en_dir / f"{chap_id}.md").write_text(body, encoding="utf-8")
            children.append({
                "id": chap_id,
                "title": {"en-US": f"Q{q.qnum}. {q.title}"},
            })
            total_q += 1
        if children:
            toc.append({
                "id": f"part-{part_slug}",
                "title": {"en-US": part_label},
                "children": children,
            })

    meta = {
        "id": BOOK_ID,
        "name": {
            "en-US": "Summa Theologica (Shapcote, 1920)",
            "la": "Summa Theologiae",
        },
        "author": {
            "en-US": "St. Thomas Aquinas",
            "la": "Sanctus Thomas Aquinas",
        },
        "composed": "1265–1274",
        "languages": ["en-US"],
        "sources": [{
            "language": "en-US",
            "url": "http://www.newadvent.org/summa/",
            "description": (
                "The Summa Theologica of St. Thomas Aquinas, Second and Revised "
                "Edition, 1920. Literally translated by Fathers of the English "
                "Dominican Province (Shapcote translation). Online edition by "
                "Kevin Knight, New Advent. Public domain."
            ),
        }],
        "toc": toc,
    }
    with (BOOK_DIR / "book.json").open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    return {"questions": total_q, "parts": len(toc), "skipped": skipped}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_prepare_cache() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if SUMMA_DIR.is_dir() and (SUMMA_DIR / "index.html").is_file():
        print(f"cache already populated at {SUMMA_DIR}")
        return
    if not ARCHIVE_ZIP.is_file():
        raise SystemExit(f"missing source archive {ARCHIVE_ZIP}")
    print(f"unzipping {ARCHIVE_ZIP} → {CACHE}")
    with zipfile.ZipFile(ARCHIVE_ZIP) as zf:
        for name in zf.namelist():
            if name.startswith(("summa/", "bible/", "douay/")):
                zf.extract(name, CACHE)
    print(f"cache ready at {SUMMA_DIR}")


def cmd_all() -> None:
    info = write_book()
    print(f"wrote {info['questions']} questions across {info['parts']} parts")
    if info["skipped"]:
        print(f"skipped {len(info['skipped'])}: {info['skipped'][:5]}")


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
