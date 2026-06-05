#!/usr/bin/env python3
"""Import the New Advent Church Fathers archive into content/books/church-fathers/.

Source: the newadvent.org `fathers/` mirror, distributed as an HTML snapshot
zip. The English translations are public domain — the Ante-Nicene Fathers
(Roberts/Donaldson, T. & T. Clark, 1885–1896) and the Nicene & Post-Nicene
Fathers (Schaff, Christian Literature Co., 1886–1900), revised and edited for
New Advent by Kevin Knight.

Usage:
    python3 scripts/import-fathers.py prepare-cache
    python3 scripts/import-fathers.py list
    python3 scripts/import-fathers.py work <work-id>
    python3 scripts/import-fathers.py author <author-slug>
    python3 scripts/import-fathers.py all

`work-id` is the New Advent file basename (e.g., `1101` for Augustine's
Confessions). `author-slug` is the slug of the Father's name as it appears in
the master index (e.g., `augustine-of-hippo`).
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import unicodedata
import zipfile
from dataclasses import dataclass, field
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

ROOT = Path(__file__).resolve().parent.parent
ARCHIVE_ZIP = Path.home() / "Documents" / "newadvent.zip"
CACHE = ROOT / "scripts" / "_cache" / "newadvent"
FATHERS_DIR = CACHE / "fathers"
BOOKS_ROOT = ROOT / "content" / "books" / "church-fathers"

# Reserved if we ever need to skip a specific work — left empty for now.
# Collisions with existing repo book ids fall through to assign_book_id's
# `-schaff` / `-anf` suffix chain so both versions can coexist.
SKIP_WORK_IDS: dict[str, str] = {}


# ---------------------------------------------------------------------------
# HTML helpers
# ---------------------------------------------------------------------------

_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)


def load_html(path: Path) -> BeautifulSoup:
    text = path.read_text(encoding="utf-8", errors="replace")
    # Strip HTML comments — a handful of New Advent source files have orphan
    # `<!--` markers (e.g. `<!--3ref=u44=xxyyyk.htm">`) that lxml otherwise
    # treats as opening an unterminated comment, swallowing the rest of the
    # page. Comments carry no rendered content for us, so stripping them
    # uniformly is safe.
    text = _COMMENT_RE.sub("", text)
    text = text.replace("<!--", "").replace("-->", "")
    text = re.sub(r'\d+ref=\w+=xxyyyk\.htm"?>', "", text)
    return BeautifulSoup(text, "lxml")


_DIACRITIC_MAP = {"æ": "ae", "œ": "oe", "ø": "o", "ß": "ss", "ł": "l", "đ": "d"}


def _ascii_fold(text: str) -> str:
    out = []
    for ch in text:
        low = ch.lower()
        if low in _DIACRITIC_MAP:
            out.append(_DIACRITIC_MAP[low])
        else:
            out.append(ch)
    nfkd = unicodedata.normalize("NFKD", "".join(out))
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def slug(text: str, *, max_len: int = 60) -> str:
    text = _ascii_fold(text).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    if len(text) <= max_len:
        return text
    cut = text[:max_len]
    # Truncate at the last hyphen so we don't cut a word in the middle.
    last_hyphen = cut.rfind("-")
    if last_hyphen >= max_len // 2:
        cut = cut[:last_hyphen]
    return cut.strip("-")


def text_of(node: Tag | NavigableString | None) -> str:
    if node is None:
        return ""
    return re.sub(r"\s+", " ", node.get_text(" ", strip=True))


# ---------------------------------------------------------------------------
# HTML → Markdown
# ---------------------------------------------------------------------------

INLINE_TAGS = {"a", "span", "font", "small", "abbr", "cite"}
DROP_TAGS = {"script", "style", "noscript"}


def _wrap_emphasis(inner: str, marker: str) -> str:
    """Wrap text in `marker` (e.g. `**` or `*`). If inner spans multiple
    lines (typically from `<br>` separators inside the wrapper), emit each
    non-empty line as its own emphasis span — markdown `**` / `*` do not
    span paragraph breaks."""
    if "\n" not in inner:
        return f"{marker}{inner}{marker}"
    lines = [ln.strip() for ln in re.split(r"\n+", inner) if ln.strip()]
    if not lines:
        return ""
    if len(lines) == 1:
        return f"{marker}{lines[0]}{marker}"
    return "\n\n".join(f"{marker}{ln}{marker}" for ln in lines)


def _inline(node) -> str:
    """Walk an inline subtree, return markdown text."""
    parts: list[str] = []
    for child in getattr(node, "children", []):
        if isinstance(child, NavigableString):
            # Normalize whitespace — text nodes carry stray newlines from
            # source HTML formatting that confuse downstream paragraph logic.
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
        elif name == "sub":
            inner = _inline(child).strip()
            if inner:
                parts.append(f"~{inner}~")
        elif name == "q":
            inner = _inline(child).strip()
            if inner:
                parts.append(f"“{inner}”")
        elif name in INLINE_TAGS:
            # Drop link wrapper, keep visible text. New Advent links almost all
            # point to other newadvent articles that don't resolve in-app.
            parts.append(_inline(child))
        else:
            # Unknown inline tag — descend.
            parts.append(_inline(child))
    return "".join(parts)


def _collapse(text: str) -> str:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _render_table(table: Tag) -> str:
    """Convert an HTML <table> to a Markdown pipe table (best-effort)."""
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
    """Convert a New Advent content `<div>` into Markdown.

    Handles: h1–h4, p, blockquote, ul/ol/li, br. Drops the page colophon
    (`<div class="pub">`), nav bars, and breadcrumbs the caller is expected to
    have removed already.
    """
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
                # Chapter subtitle/summary — render as italic block.
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
            # Recurse into divs we don't otherwise handle (e.g., wrapping
            # divs left in the content area after boilerplate removal).
            inner = html_to_markdown(el)
            if inner.strip():
                out.append(inner)
        elif name == "table":
            t = _render_table(el)
            if t:
                out.append(t)
        elif name == "br":
            continue  # handled inside _inline; top-level <br> is noise
        elif name == "hr":
            out.append("---")
        else:
            # Fallback: render as paragraph.
            inner = _collapse(_inline(el))
            if inner:
                out.append(inner)
    return "\n\n".join(out)


# ---------------------------------------------------------------------------
# New Advent page model
# ---------------------------------------------------------------------------

@dataclass
class SourceMeta:
    translator: str = ""
    work: str = ""           # e.g., "Nicene and Post-Nicene Fathers, First Series"
    volume: str = ""
    editor: str = ""
    publisher: str = ""
    year: str = ""

    def series_code(self) -> str:
        w = self.work.lower()
        if "ante-nicene" in w:
            return "anf"
        if "first series" in w:
            return "npnf1"
        if "second series" in w:
            return "npnf2"
        return ""

    def description(self) -> str:
        sentences: list[str] = []
        if self.translator:
            sentences.append(self.translator.rstrip("."))
        edition_bits: list[str] = []
        if self.work:
            piece = "From " + self.work.rstrip(".")
            if self.volume:
                piece += f", {self.volume.rstrip('.')}"
            edition_bits.append(piece)
        if self.editor:
            edition_bits.append(self.editor.rstrip("."))
        if self.publisher or self.year:
            tail = " ".join(p.rstrip(",.") for p in (self.publisher, self.year) if p)
            if tail:
                edition_bits.append(tail)
        if edition_bits:
            sentences.append(", ".join(edition_bits))
        sentences.append("Revised and edited for New Advent by Kevin Knight")
        return ". ".join(s for s in sentences if s) + "."


def parse_source_meta(soup: BeautifulSoup) -> SourceMeta:
    src_p = soup.find("p", id="src")
    meta = SourceMeta()
    if not src_p:
        return meta
    def span(idn: str) -> str:
        s = src_p.find("span", id=idn)
        return text_of(s).rstrip(".,") if s else ""
    meta.translator = span("srctrans")
    meta.work = span("srcwork")
    meta.volume = span("srcvolume")
    meta.editor = span("srced")
    meta.publisher = span("srcpublisher")
    meta.year = span("srcyear")
    return meta


def extract_main(soup: BeautifulSoup) -> Tag | None:
    """Return the cleaned content div (`<div id="springfield2">`)."""
    main = soup.find("div", id="springfield2")
    if not main:
        return None
    # Drop boilerplate inside the content div.
    for sel in (
        {"name": "div", "class_": "pub"},
        {"name": "div", "id": "ogdenville"},
    ):
        for el in main.find_all(**sel):
            el.decompose()
    # Drop the breadcrumb line if duplicated in body.
    for span in main.find_all("span", class_="breadcrumbs"):
        span.decompose()
    # Strip prev/next navigation if present.
    for span in main.find_all("span", class_="navb"):
        span.decompose()
    return main


def page_title(soup: BeautifulSoup) -> str:
    h1 = soup.find("h1")
    return text_of(h1)


# ---------------------------------------------------------------------------
# Index parsing — fathers/index.html → authors + works
# ---------------------------------------------------------------------------

@dataclass
class WorkRef:
    title: str
    file_id: str          # e.g., "1101"
    spurious: bool = False


@dataclass
class AuthorEntry:
    name: str             # e.g., "Augustine of Hippo"
    slug: str             # e.g., "augustine-of-hippo"
    is_saint: bool = False
    is_doctor: bool = False
    cathen_ref: str = ""  # e.g., "cathen/02084a.htm"
    works: list[WorkRef] = field(default_factory=list)


_FATHERS_LINK_RE = re.compile(r"^\.\./fathers/(\w+)\.htm$")


def parse_master_index() -> list[AuthorEntry]:
    """Walk fathers/index.html and assemble author → works."""
    idx_path = FATHERS_DIR / "index.html"
    if not idx_path.is_file():
        raise SystemExit(f"missing {idx_path}; run prepare-cache first")
    soup = load_html(idx_path)
    main = soup.find("div", id="springfield2")
    if not main:
        raise SystemExit("could not locate <div id=springfield2> in fathers index")

    authors: list[AuthorEntry] = []
    current: AuthorEntry | None = None

    for el in main.find_all(["p", "br"], recursive=True):
        if el.name == "p":
            # New author starts at each <p> with a <strong> heading; works
            # within the author hang off subsequent <br><a href> patterns
            # rendered as siblings of the same <p>.
            strong = el.find("strong")
            if not strong:
                continue
            name = text_of(strong)
            if not name:
                continue
            # Filter out the page heading "The Fathers of the Church".
            if name.lower().startswith("the fathers"):
                continue
            # Strip trailing parens dates from name for the slug, keep them
            # in the display name.
            display = name
            slugbase = re.sub(r"\s*\(.*?\)\s*$", "", name).strip()
            current = AuthorEntry(
                name=display,
                slug=slug(slugbase) or slug(display),
            )
            # Saint / Doctor flags are in <font color> spans following <strong>.
            siblings = list(el.children)
            for ch in siblings:
                if not isinstance(ch, Tag):
                    continue
                txt = text_of(ch).upper()
                if "[SAINT]" in txt:
                    current.is_saint = True
                if "[DOCTOR]" in txt:
                    current.is_doctor = True
            # Author bio cathen link is the first <a> inside <strong>'s parent.
            bio_a = el.find("a", href=True)
            if bio_a and bio_a.find("strong"):
                current.cathen_ref = bio_a.get("href", "").lstrip("./")
            # Works in this <p>: any <a href="../fathers/..."> sibling.
            for a in el.find_all("a", href=True):
                m = _FATHERS_LINK_RE.match(a["href"])
                if not m:
                    continue
                wid = m.group(1)
                title = text_of(a)
                # The "spurious" marker sits as a <font color="#007700"> sibling
                # immediately after the link.
                spurious = False
                nxt = a.find_next_sibling()
                if isinstance(nxt, Tag) and nxt.name == "font":
                    if "spurious" in text_of(nxt).lower():
                        spurious = True
                current.works.append(WorkRef(title=title, file_id=wid, spurious=spurious))
            if current.works:
                authors.append(current)
            current = None  # each <p> is one author block in this layout
    return authors


# ---------------------------------------------------------------------------
# Work extraction
# ---------------------------------------------------------------------------

@dataclass
class Chapter:
    file_id: str          # source basename, e.g., "110101"
    chap_id: str          # repo chapter id, e.g., "ch01"
    title: str
    markdown: str = ""


@dataclass
class Work:
    file_id: str
    author: AuthorEntry
    title: str
    series: str = ""
    composed: str = ""
    chapters: list[Chapter] = field(default_factory=list)
    source: SourceMeta = field(default_factory=SourceMeta)


def _is_toc_page(main: Tag, work_id: str) -> list[tuple[str, str]]:
    """If `main` is a TOC page, return [(child_file_id, link_text)] in order.

    Heuristic: the page has ≥2 anchors pointing at `../fathers/<work_id>\\d+.htm`.
    """
    children: list[tuple[str, str]] = []
    seen: set[str] = set()
    pattern = re.compile(rf"^\.\./fathers/({re.escape(work_id)}\d+)\.htm$")
    for a in main.find_all("a", href=True):
        m = pattern.match(a["href"])
        if not m:
            continue
        cid = m.group(1)
        if cid in seen:
            continue
        seen.add(cid)
        children.append((cid, text_of(a)))
    return children if len(children) >= 2 else []


def load_chapter(file_id: str) -> tuple[str, str, SourceMeta]:
    """Load a chapter page, return (title, markdown, source_meta)."""
    path = FATHERS_DIR / f"{file_id}.htm"
    if not path.is_file():
        return ("", "", SourceMeta())
    soup = load_html(path)
    title = page_title(soup)
    src = parse_source_meta(soup)
    main = extract_main(soup)
    if not main:
        return (title, "", src)
    # Remove the <h1> (we keep the title separately) so the chapter body
    # doesn't repeat it.
    for h1 in main.find_all("h1"):
        h1.decompose()
    md = html_to_markdown(main)
    return (title, md.strip(), src)


def build_work(ref: WorkRef, author: AuthorEntry) -> Work:
    """Resolve a WorkRef into a populated Work (chapters + source meta)."""
    work_path = FATHERS_DIR / f"{ref.file_id}.htm"
    if not work_path.is_file():
        raise FileNotFoundError(work_path)
    soup = load_html(work_path)
    # Prefer the index entry title; it's usually shorter / curated. Fall back
    # to the page's <h1> if the index didn't have a usable title.
    work_title = ref.title or page_title(soup)
    # Parse source BEFORE extract_main; the latter strips <div class="pub">.
    work_source = parse_source_meta(soup)
    main = extract_main(soup)
    if not main:
        raise ValueError(f"no content div in {work_path}")

    work = Work(
        file_id=ref.file_id,
        author=author,
        title=work_title,
        source=work_source,
    )

    toc_children = _is_toc_page(main, ref.file_id)
    if toc_children:
        for idx, (child_id, child_title) in enumerate(toc_children, start=1):
            ch_title, ch_md, ch_src = load_chapter(child_id)
            if not ch_md:
                continue
            # Prefer the page's <h1> when the TOC link text is sparse (e.g. a
            # bare number like "1" from Gregory the Great's Epistles index).
            link = child_title.strip()
            if not link or re.fullmatch(r"[\dIVXLCDM]+\.?", link):
                label = ch_title or link or f"Chapter {idx}"
            else:
                label = link
            work.chapters.append(Chapter(
                file_id=child_id,
                chap_id=f"ch{idx:03d}",
                title=label,
                markdown=ch_md,
            ))
            if not work.source.work and ch_src.work:
                work.source = ch_src
        # The TOC page itself may contain a preface section above the links;
        # for now we let that drop. (Most TOC pages are pure link lists.)
    else:
        # Single-page work.
        for h1 in main.find_all("h1"):
            h1.decompose()
        md = html_to_markdown(main).strip()
        if md:
            work.chapters.append(Chapter(
                file_id=ref.file_id,
                chap_id="ch001",
                title=work_title,
                markdown=md,
            ))

    work.series = work.source.series_code()
    return work


# ---------------------------------------------------------------------------
# Author / work id assignment + collision handling
# ---------------------------------------------------------------------------

def existing_book_ids() -> set[str]:
    out: set[str] = set()
    for bj in (ROOT / "content" / "books").rglob("book.json"):
        try:
            with bj.open() as fh:
                meta = json.load(fh)
            if "id" in meta:
                out.add(meta["id"])
        except (OSError, json.JSONDecodeError):
            pass
    return out


def assign_book_id(author_slug: str, work_slug: str, existing: set[str]) -> str:
    base = f"{author_slug}-{work_slug}"[:80]
    if base not in existing:
        return base
    for suffix in ("schaff", "npnf", "anf", "new-advent"):
        candidate = f"{base}-{suffix}"[:80]
        if candidate not in existing:
            return candidate
    raise RuntimeError(f"cannot find non-colliding id for {base}")


def _normalize_author_name(name: str) -> str:
    """Drop trailing parens (year ranges) and stray punctuation."""
    n = re.sub(r"\s*\(.*?\)\s*$", "", name).strip()
    return n.replace("'", "")


def _short_form(name: str) -> str:
    """'Augustine of Hippo' → 'augustine'; 'Cyril of Jerusalem' → 'cyril'."""
    n = _normalize_author_name(name)
    n = re.split(r"\s+(?:of|the)\s+", n, maxsplit=1, flags=re.IGNORECASE)[0]
    return slug(n)


def _long_form(name: str) -> str:
    """'Cyril of Jerusalem' → 'cyril-jerusalem' (drops 'of'/'the')."""
    n = _normalize_author_name(name)
    n = re.sub(r"\s+(?:of|the)\s+", " ", n, flags=re.IGNORECASE)
    return slug(n)


def assign_author_slugs(authors: list[AuthorEntry]) -> None:
    """Mutate each author's `.slug` to a stable, collision-free slug.

    Strategy: prefer the compact 'augustine' form; if multiple authors share
    that form, expand them all to 'cyril-jerusalem' / 'cyril-alexandria' form.
    """
    # First pass: count short-form collisions.
    short_counts: dict[str, int] = {}
    for au in authors:
        short_counts[_short_form(au.name)] = short_counts.get(_short_form(au.name), 0) + 1
    seen: dict[str, int] = {}
    for au in authors:
        short = _short_form(au.name)
        if short_counts[short] > 1:
            chosen = _long_form(au.name) or short
        else:
            chosen = short
        # Final dedup safety net.
        base = chosen
        n = seen.get(base, 0) + 1
        seen[base] = n
        au.slug = base if n == 1 else f"{base}-{n}"


def short_work_slug(title: str, author_name: str = "") -> str:
    t = title
    # Drop trailing parens (author/source notes).
    t = re.sub(r"\s*\(.*?\)\s*$", "", t).strip()
    # Drop subtitle after colon / em-dash.
    t = re.split(r"\s*[:—]\s*", t, maxsplit=1)[0]
    # Strip the author from titles like "Letters of St. Augustine of Hippo"
    # or "Epistles of Cyprian of Carthage" so the slug is just "letters".
    if author_name:
        short_name = _short_form(author_name)
        if short_name:
            # Strip "of [St.] <Author> [of <Place>] [the <Epithet>]" *only at
            # the end of the title*. This collapses "Letters of St. Augustine
            # of Hippo" → "Letters" while leaving titles like "Epistle of
            # Ignatius to the Ephesians" untouched (because "to" doesn't match
            # the allowed tail pattern).
            pattern = re.compile(
                rf"\s+(?:of|by)\s+(?:st\.?\s+)?{re.escape(short_name)}"
                r"(?:\s+(?:of|the)\s+[A-Za-z]+)*\s*$",
                re.IGNORECASE,
            )
            t = pattern.sub("", t).strip()
    # Drop leading articles.
    t = re.sub(r"^(?:the|a|an|of|on|to)\s+", "", t, flags=re.IGNORECASE)
    s = slug(t, max_len=70)
    s = re.sub(r"^(?:the-|a-|an-|of-|on-|to-)+", "", s)
    return s


# ---------------------------------------------------------------------------
# Emission
# ---------------------------------------------------------------------------

def write_work(work: Work, existing: set[str], existing_paths: set[Path]) -> dict | None:
    """Materialize a Work to `content/books/church-fathers/...`. Returns
    summary {id, dir, chapters} or None if skipped."""
    if not work.chapters:
        print(f"  skip (no chapters): {work.title}")
        return None

    author_slug = work.author.slug
    work_slug = short_work_slug(work.title, work.author.name)
    if not work_slug:
        work_slug = f"work-{work.file_id}"

    book_id = assign_book_id(author_slug, work_slug, existing)
    existing.add(book_id)

    book_dir = BOOKS_ROOT / author_slug / work_slug
    if book_dir in existing_paths:
        # Same author writing two works with the same slugified title (rare;
        # e.g., generic "Letters" + "Letters of Augustine"). Add a suffix.
        book_dir = BOOKS_ROOT / author_slug / f"{work_slug}-{work.file_id}"
    existing_paths.add(book_dir)
    en_dir = book_dir / "en-US"
    en_dir.mkdir(parents=True, exist_ok=True)

    # Wipe stale chapter files so re-runs don't accumulate orphans.
    for ff in en_dir.glob("*.md"):
        ff.unlink()

    toc: list[dict] = []
    for ch in work.chapters:
        md_path = en_dir / f"{ch.chap_id}.md"
        body = f"# {ch.title}\n\n{ch.markdown}\n" if ch.title else f"{ch.markdown}\n"
        md_path.write_text(body, encoding="utf-8")
        toc.append({
            "id": ch.chap_id,
            "title": {"en-US": ch.title or f"Chapter {len(toc) + 1}"},
        })

    meta = {
        "id": book_id,
        "name": {"en-US": work.title},
        "author": {"en-US": work.author.name},
        "languages": ["en-US"],
        "sources": [{
            "language": "en-US",
            "url": f"http://www.newadvent.org/fathers/{work.file_id}.htm",
            "description": work.source.description() or "New Advent (Church Fathers archive)",
        }],
        "toc": toc,
    }
    with (book_dir / "book.json").open("w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2, ensure_ascii=False)
        fh.write("\n")

    print(f"  wrote {book_id} ({len(work.chapters)} chapters)")
    return {"id": book_id, "dir": str(book_dir.relative_to(ROOT)), "chapters": len(work.chapters)}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def cmd_prepare_cache() -> None:
    CACHE.mkdir(parents=True, exist_ok=True)
    if FATHERS_DIR.is_dir() and (FATHERS_DIR / "index.html").is_file():
        print(f"cache already populated at {FATHERS_DIR}")
        return
    if not ARCHIVE_ZIP.is_file():
        raise SystemExit(f"missing source archive {ARCHIVE_ZIP}")
    print(f"unzipping {ARCHIVE_ZIP} → {CACHE}")
    with zipfile.ZipFile(ARCHIVE_ZIP) as zf:
        for name in zf.namelist():
            if name.startswith(("fathers/", "cathen/", "library/")):
                zf.extract(name, CACHE)
    print(f"cache ready at {CACHE}")


def cmd_list() -> None:
    authors = parse_master_index()
    assign_author_slugs(authors)
    total = 0
    for au in authors:
        flags = []
        if au.is_saint: flags.append("S")
        if au.is_doctor: flags.append("D")
        flag = f"[{','.join(flags)}]" if flags else "  "
        print(f"{flag} {au.name}  ({au.slug})")
        for w in au.works:
            spur = " [spurious]" if w.spurious else ""
            print(f"     {w.file_id}  {w.title}{spur}")
            total += 1
    print(f"\n{len(authors)} authors, {total} works")


def cmd_work(work_id: str) -> None:
    authors = parse_master_index()
    assign_author_slugs(authors)
    for au in authors:
        for ref in au.works:
            if ref.file_id == work_id:
                if work_id in SKIP_WORK_IDS:
                    print(f"skipping {work_id} (already imported as {SKIP_WORK_IDS[work_id]})")
                    return
                print(f"building {au.name} / {ref.title}  (#{ref.file_id})")
                work = build_work(ref, au)
                existing = existing_book_ids()
                write_work(work, existing, set())
                return
    raise SystemExit(f"work id {work_id!r} not found")


def cmd_author(author_slug: str) -> None:
    authors = parse_master_index()
    assign_author_slugs(authors)
    target = next((au for au in authors if au.slug == author_slug), None)
    if not target:
        raise SystemExit(f"author {author_slug!r} not found")
    existing = existing_book_ids()
    used_paths: set[Path] = set()
    for ref in target.works:
        if ref.file_id in SKIP_WORK_IDS:
            print(f"  skip {ref.file_id} → already imported as {SKIP_WORK_IDS[ref.file_id]}")
            continue
        try:
            work = build_work(ref, target)
        except (FileNotFoundError, ValueError) as e:
            print(f"  ERROR on {ref.file_id} ({ref.title}): {e}")
            continue
        write_work(work, existing, used_paths)


def cmd_all() -> None:
    authors = parse_master_index()
    assign_author_slugs(authors)
    # Fresh slate: any prior import goes away so re-runs don't leave orphan
    # directories from previous slug schemes.
    if BOOKS_ROOT.is_dir():
        shutil.rmtree(BOOKS_ROOT)
    existing = existing_book_ids()
    used_paths: set[Path] = set()
    failed: list[tuple[str, str, str]] = []
    skipped: list[tuple[str, str, str]] = []
    written: list[dict] = []

    for au in authors:
        print(f"\n== {au.name} ==")
        for ref in au.works:
            if ref.file_id in SKIP_WORK_IDS:
                skipped.append((au.name, ref.title, f"already imported as {SKIP_WORK_IDS[ref.file_id]}"))
                continue
            try:
                work = build_work(ref, au)
            except (FileNotFoundError, ValueError) as e:
                failed.append((au.name, ref.title, str(e)))
                continue
            summary = write_work(work, existing, used_paths)
            if summary:
                written.append({**summary, "author": au.name, "title": ref.title})

    print(f"\n=== Summary ===")
    print(f"Wrote {len(written)} books, {sum(w['chapters'] for w in written)} chapters.")
    if skipped:
        print(f"\nSkipped ({len(skipped)}):")
        for a, t, why in skipped[:30]:
            print(f"  - {a} / {t}: {why}")
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for a, t, why in failed[:30]:
            print(f"  - {a} / {t}: {why}")


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    cmd = sys.argv[1]
    if cmd == "prepare-cache":
        cmd_prepare_cache()
    elif cmd == "list":
        cmd_list()
    elif cmd == "work":
        if len(sys.argv) < 3:
            raise SystemExit("usage: work <work-id>")
        cmd_work(sys.argv[2])
    elif cmd == "author":
        if len(sys.argv) < 3:
            raise SystemExit("usage: author <author-slug>")
        cmd_author(sys.argv[2])
    elif cmd == "all":
        cmd_all()
    else:
        raise SystemExit(f"unknown command: {cmd}")


if __name__ == "__main__":
    main()
