#!/usr/bin/env python3
"""Download Alban Butler's Lives of the Saints (1894 Benziger Bros. ed.).

Source: https://sacred-texts.com/chr/lots/index.htm

Outputs:
- content/books/butler-lives-of-saints/sources/english-originals/lives-of-saints.txt
  (one combined raw archive, with `---` between source pages)
- content/books/butler-lives-of-saints/en-US/<chapter-id>.md
  (one cleaned markdown chapter per saint)
- content/books/butler-lives-of-saints/_plan.json (internal: TOC plan)

The page structure on sacred-texts.com is very uniform — each chapter page has
an <h3> heading like "January 1.—THE CIRCUMCISION OF OUR LORD." followed by
plain <p> paragraphs and "p. NN" page-marker paragraphs interleaved. We strip
the navigation chrome and page markers, merge paragraphs split across page
breaks, convert <i>/<b> to markdown, and emit one .md file per saint.
"""

from __future__ import annotations

import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "books" / "butler-lives-of-saints"
SOURCES_DIR = BOOK_DIR / "sources" / "english-originals"
EN_DIR = BOOK_DIR / "en-US"
PLAN_PATH = BOOK_DIR / "_plan.json"
RAW_TXT = SOURCES_DIR / "lives-of-saints.txt"

BASE_URL = "https://sacred-texts.com/chr/lots/"
INDEX_URL = BASE_URL + "index.htm"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    ),
    "Accept": "text/html",
    "Accept-Language": "en-US",
}

MONTH_PREFIX = {
    "January": "jan", "February": "feb", "March": "mar", "April": "apr",
    "May": "may", "June": "jun", "July": "jul", "August": "aug",
    "September": "sep", "October": "oct", "November": "nov", "December": "dec",
}


def slugify(s: str) -> str:
    s = re.sub(r"[''`]", "", s)
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s.lower()).strip("-")
    return s


def fetch(url: str) -> str:
    resp = requests.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    # The pages are UTF-8 (declared in the <meta>) but the server omits a
    # charset in the Content-Type header, so `requests` falls back to ISO-8859-1
    # which corrupts em dashes and accents. Force UTF-8.
    resp.encoding = "utf-8"
    return resp.text


def build_plan() -> list[dict]:
    """Parse the index page; return a list of {section, entries} dicts."""
    html = fetch(INDEX_URL)
    soup = BeautifulSoup(html, "html.parser")
    sections: list[dict] = []
    current: dict | None = None
    for tag in soup.find_all(["h3", "a"]):
        if tag.name == "h3":
            current = {"section": tag.get_text(strip=True), "entries": []}
            sections.append(current)
        elif tag.name == "a" and current is not None:
            href = tag.get("href", "")
            m = re.match(r"^lots(\d+)\.htm$", href)
            if m:
                current["entries"].append({
                    "href": href,
                    "num": int(m.group(1)),
                    "title": tag.get_text(strip=True),
                })

    # Dedupe (Title Page appears under both "Front Matter" and shows twice)
    seen = set()
    for sec in sections:
        new = []
        for e in sec["entries"]:
            if e["num"] not in seen:
                seen.add(e["num"])
                new.append(e)
        sec["entries"] = new

    # Drop front matter (Title Page, Index)
    sections = [
        s for s in sections
        if s["section"] not in ("Front Matter", "Lives of the Saints")
    ]

    # Assign chapter IDs
    for sec in sections:
        if sec["section"] == "Lives of Certain Saints":
            for e in sec["entries"]:
                slug = slugify(re.sub(r"^St\.?\s+", "", e["title"]))
                e["chapter_id"] = f"cert-{slug}"
                e["day"] = None
        else:
            prefix = MONTH_PREFIX[sec["section"]]
            for e in sec["entries"]:
                m = re.match(r"^(\d+)\.\s*(.+)$", e["title"])
                if m:
                    day = int(m.group(1))
                    rest = m.group(2)
                else:
                    day = None
                    rest = e["title"]
                rest_clean = re.sub(r"^St\.?\s+", "", rest)
                rest_clean = re.sub(
                    r",?\s*(Pope|Bishop|Martyr|Virgin|Confessor|Abbot|Abbess|Doctor|"
                    r"King|Queen|Hermit|Widow|Patriarch|Apostle|Empress|Prince|"
                    r"Priest|Deacon|Archbishop|Cardinal|Prophet|Evangelist).*$",
                    "", rest_clean, flags=re.IGNORECASE)
                slug = slugify(rest_clean)
                e["chapter_id"] = (
                    f"{prefix}-{day:02d}-{slug}" if day is not None
                    else f"{prefix}-{slug}"
                )
                e["day"] = day

    # Verify uniqueness
    all_ids = [e["chapter_id"] for s in sections for e in s["entries"]]
    if len(all_ids) != len(set(all_ids)):
        from collections import Counter
        dupes = [k for k, v in Counter(all_ids).items() if v > 1]
        raise ValueError(f"Duplicate chapter IDs: {dupes}")
    return sections


def inline_to_md(node: Tag | NavigableString) -> str:
    """Convert a BeautifulSoup element's contents to inline markdown."""
    if isinstance(node, NavigableString):
        return str(node)
    parts: list[str] = []
    for child in node.children:
        if isinstance(child, NavigableString):
            parts.append(str(child))
        elif isinstance(child, Tag):
            name = child.name.lower()
            if name in ("i", "em"):
                inner = inline_to_md(child).strip()
                parts.append(f"*{inner}*" if inner else "")
            elif name in ("b", "strong"):
                inner = inline_to_md(child).strip()
                parts.append(f"**{inner}**" if inner else "")
            elif name == "br":
                parts.append("\n")
            elif name == "a":
                # Page-anchor links (<a name="page_NN">...</a>) — the inner is
                # the "p. NN" font span, which we want to drop entirely.
                if child.get("name", "").startswith("page_"):
                    continue
                parts.append(inline_to_md(child))
            elif name == "font":
                # Drop "p. NN" font wrappers
                txt = child.get_text()
                if re.fullmatch(r"\s*p\.\s*\d+\s*", txt):
                    continue
                parts.append(inline_to_md(child))
            else:
                parts.append(inline_to_md(child))
    return "".join(parts)


def normalize_whitespace(s: str) -> str:
    # Collapse all runs of whitespace (including line breaks within a paragraph)
    # to single spaces. Trim ends.
    return re.sub(r"\s+", " ", s).strip()


def parse_chapter(html: str, fallback_heading: str = "") -> tuple[str, str, str]:
    """Return (heading, body_markdown, raw_text).

    heading: the saint/feast heading text (without trailing period).
    body_markdown: cleaned markdown (paragraphs separated by blank lines).
    raw_text: plain text dump for the archive .txt.

    A few pages (e.g. lots392.htm, St. Servulus) ship without the usual
    centered <h3> chapter heading. For those we fall back to `fallback_heading`
    (synthesized from the index TOC entry) and begin collecting body text after
    the centered "by Alban Butler" preamble instead of after the <h3>.
    """
    soup = BeautifulSoup(html, "html.parser")

    # The chapter title is the <h3 align="center"> inside the body.
    # The book title <h1> ("LIVES OF THE SAINTS.") may also appear; ignore it.
    h3 = soup.find("h3", align="center") or soup.find("h3")
    heading = ""
    if h3 is not None:
        heading = h3.get_text(separator=" ", strip=True)
        heading = re.sub(r"\s+", " ", heading).strip().rstrip(".")
    if not heading:
        heading = fallback_heading
    has_h3 = h3 is not None

    # Find the chapter's containing paragraph stream.
    # Strategy: walk the document's tags in order; start collecting only AFTER
    # we pass the chapter heading <h3>, then stop at the footer nav.
    body = soup.body or soup
    paragraphs: list[tuple[str, bool]] = []
    started = False
    for el in body.find_all(True):
        name = el.name.lower()
        if not started:
            if has_h3:
                if name == "h3":
                    started = True
                continue
            # No <h3> on this page: skip the leading centered "by Alban Butler"
            # preamble, then begin collecting at the first real body <p> (which
            # is processed below — do not `continue` past it).
            if name != "p":
                continue
            if el.get("align", "").upper() == "CENTER":
                continue
            started = True
        # Detect end of body (footer nav)
        if name == "nav":
            break
        if name == "div" and "filenav" in (el.get("class") or []):
            break
        if name != "p":
            continue
        # Skip the centered "by Alban Butler" preamble (rarely after h3, but guard)
        if el.get("align", "").upper() == "CENTER":
            a = el.find("a", href="index.htm")
            if a is not None:
                continue
        # If this <p> wraps a filenav div, it's the footer
        if el.find("div", class_="filenav") is not None:
            break
        # Sacred-texts flags a paragraph split across a page break with a
        # <span class="contnote">[paragraph continues]</span> prefix. Detect it,
        # strip the marker text, and remember to rejoin this fragment onto the
        # preceding paragraph below.
        is_cont = el.find("span", class_="contnote") is not None
        text_md = inline_to_md(el).strip()
        text_norm = normalize_whitespace(text_md)
        if is_cont or text_norm.lstrip("*").startswith("[paragraph continues]"):
            is_cont = True
            text_norm = re.sub(r"^\**\s*\[paragraph continues\]\**\s*", "", text_norm)
        if not text_norm:
            continue
        # Drop pure page-marker paragraphs
        if re.fullmatch(r"\*?\*?p\.\s*\d+\*?\*?", text_norm):
            continue
        # Drop bare punctuation paragraphs
        if text_norm in (".", "·"):
            continue
        paragraphs.append((text_norm, is_cont))

    # Merge paragraphs that were split across page breaks: if a paragraph
    # ends without terminal punctuation AND the next starts with a lowercase
    # letter (or a non-letter that suggests continuation), merge them.
    merged: list[str] = []
    for para, is_cont in paragraphs:
        if merged:
            prev = merged[-1]
            last_char = prev[-1] if prev else ""
            first_char = para[0] if para else ""
            terminal = last_char in '.!?":;)”’'
            continues = first_char.islower() or first_char in ",;:)”’"
            # Paragraphs flagged "[paragraph continues]" in the source are an
            # explicit page-break split: always rejoin, regardless of the
            # surrounding punctuation/case heuristic.
            if is_cont or (not terminal and continues):
                merged[-1] = prev + " " + para
                continue
        merged.append(para)

    # Convert "**Reflection**.—..." paragraphs to a "## Reflection" heading
    # followed by the rest of the text.
    body_blocks: list[str] = []
    for para in merged:
        m = re.match(
            r"^\*\*(Reflection|Reflections?)\*\*\s*[.\-—–:]+\s*(.*)$",
            para, flags=re.DOTALL)
        if m:
            body_blocks.append(f"## Reflection")
            rest = m.group(2).strip()
            if rest:
                body_blocks.append(rest)
        else:
            body_blocks.append(para)

    body_md = "\n\n".join(body_blocks)

    # Raw text for the archive .txt — strip HTML to plain text but keep
    # paragraph structure (single blank line between paragraphs).
    raw_lines = [heading, ""] if heading else []
    for para in merged:
        # strip markdown formatting from raw text
        plain = re.sub(r"\*\*([^*]+)\*\*", r"\1", para)
        plain = re.sub(r"\*([^*]+)\*", r"\1", plain)
        raw_lines.append(plain)
        raw_lines.append("")
    raw_text = "\n".join(raw_lines).strip()

    return heading, body_md, raw_text


def main() -> None:
    print("→ Building plan from index page …")
    plan = build_plan()
    total = sum(len(s["entries"]) for s in plan)
    print(f"  {len(plan)} sections, {total} chapters")

    BOOK_DIR.mkdir(parents=True, exist_ok=True)
    SOURCES_DIR.mkdir(parents=True, exist_ok=True)
    EN_DIR.mkdir(parents=True, exist_ok=True)
    PLAN_PATH.write_text(json.dumps(plan, indent=2))

    raw_parts: list[str] = []
    i = 0
    for sec in plan:
        for entry in sec["entries"]:
            i += 1
            url = BASE_URL + entry["href"]
            chap_id = entry["chapter_id"]
            print(f"[{i:>3}/{total}] {entry['href']} → {chap_id}")
            html = fetch(url)
            # Synthesize a heading for the rare page that ships without an <h3>
            # (e.g. St. Servulus / lots392.htm), from this index TOC entry.
            name_part = re.sub(r"^\d+\.\s*", "", entry["title"]).strip()
            if entry.get("day") is not None:
                fallback_heading = f"{sec['section']} {entry['day']}.—{name_part.upper()}"
            else:
                fallback_heading = name_part.upper()
            heading, body_md, raw_text = parse_chapter(html, fallback_heading)
            entry["heading"] = heading

            md_path = EN_DIR / f"{chap_id}.md"
            md_full = f"# {heading}\n\n{body_md}\n" if heading else body_md + "\n"
            md_path.write_text(md_full, encoding="utf-8")

            sep_header = (
                f"=== PAGE {entry['num']:03d}: {entry['href']} ===\n"
                f"=== CHAPTER: {chap_id} ===\n"
                f"=== TITLE: {entry['title']} ==="
            )
            raw_parts.append(sep_header + "\n\n" + raw_text)
            time.sleep(0.3)  # be polite

    RAW_TXT.write_text("\n\n---\n\n".join(raw_parts) + "\n", encoding="utf-8")
    PLAN_PATH.write_text(json.dumps(plan, indent=2))

    wc = sum(len(p.split()) for p in raw_parts)
    print(f"\n✓ Wrote {RAW_TXT}")
    print(f"  size: ~{len(RAW_TXT.read_text()):,} chars, ~{wc:,} words")
    print(f"✓ Wrote {total} markdown chapters into {EN_DIR}/")


if __name__ == "__main__":
    main()
