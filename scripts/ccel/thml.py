"""Walk a ThML document tree and group <divN> elements into Ember chapters.

ThML uses <div1>/<div2>/<div3> for nested structure. The importer picks one of
those depths as the "chapter level" — every div at that depth becomes one
Markdown file, and shallower divs become TOC group nodes.

Granularity: by default we pick the deepest level whose median word count
lands in [500, 5000] words; the user can override with --chapter-level.
"""

from __future__ import annotations

import re
import statistics
from dataclasses import dataclass, field
from typing import Optional

from lxml import etree


@dataclass
class Section:
    """One node in the divN tree — may be a TOC group or a chapter leaf."""

    level: int                          # 1, 2, 3, ...
    type: Optional[str]                 # the divN @type attribute, e.g. "Chapter"
    title: str
    raw_id: Optional[str]               # divN @id or @n
    n: Optional[str]                    # divN @n (numeric label)
    element: etree._Element
    word_count: int
    children: list["Section"] = field(default_factory=list)

    @property
    def is_leaf(self) -> bool:
        return not self.children


def parse(source: bytes | str) -> etree._ElementTree:
    """Parse a ThML file. CCEL files declare a DOCTYPE with HTML entities;
    we tell lxml to load the DTD only if we can find it locally — otherwise
    we strip the DOCTYPE and substitute named entities ourselves."""
    if isinstance(source, str):
        source = source.encode("utf-8")
    parser = etree.XMLParser(
        remove_blank_text=False,
        recover=True,
        resolve_entities=False,
        load_dtd=False,
        no_network=True,
        huge_tree=True,
    )
    cleaned = _strip_doctype(source)
    cleaned = _substitute_named_entities(cleaned)
    return etree.ElementTree(etree.fromstring(cleaned, parser))


def find_body(tree: etree._ElementTree) -> etree._Element:
    root = tree.getroot()
    for child in root:
        if etree.QName(child).localname.lower() == "thml.body":
            return child
    raise ValueError("ThML document has no <ThML.body>")


def walk(body: etree._Element) -> list[Section]:
    """Return the tree of sections found in the body, ordered as in source."""
    return [_section_from(el) for el in body if _is_div(el)]


def pick_chapter_level(roots: list[Section], requested: str = "auto") -> int:
    """Decide which divN depth becomes a chapter file.

    `requested`: 'auto' | 'div1' | 'div2' | 'div3' | 'div4'. With 'auto' we
    pick the deepest level whose median word count is in [500, 5000].
    """
    if requested != "auto":
        m = re.fullmatch(r"div([1-6])", requested)
        if not m:
            raise ValueError(f"--chapter-level must be 'auto' or 'div1'..'div6', got {requested!r}")
        return int(m.group(1))

    target_min, target_max = 500, 5000
    candidates: dict[int, list[int]] = {}
    for r in roots:
        _gather_word_counts(r, candidates)

    # Walk levels deepest-first; first to land in range wins.
    for level in sorted(candidates.keys(), reverse=True):
        sizes = candidates[level]
        if not sizes:
            continue
        median = statistics.median(sizes)
        if target_min <= median <= target_max:
            return level

    # Nothing in range — pick the level whose median is closest to the
    # geometric mean of the bounds.
    target = (target_min * target_max) ** 0.5
    best = min(
        candidates.items(),
        key=lambda kv: abs(statistics.median(kv[1]) - target) if kv[1] else float("inf"),
        default=(1, []),
    )
    return best[0]


def flatten_chapters(roots: list[Section], chapter_level: int) -> list[tuple[list[Section], Section]]:
    """Return [(ancestors, chapter_section)] in document order.

    Ancestors are the divs above the chapter level — they form the TOC group
    nodes. The chapter section itself is the divN at exactly chapter_level
    (or the deepest div if the document is shallower than chapter_level).
    """
    out: list[tuple[list[Section], Section]] = []
    for r in roots:
        _flatten(r, [], chapter_level, out)
    return out


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------


def _div_level(el: etree._Element) -> Optional[int]:
    """Return N for <divN> (where N is 1-6), or None for non-div elements."""
    if not isinstance(el.tag, str):
        return None  # comment / PI / entity — skip
    name = etree.QName(el).localname.lower()
    if not name.startswith("div") or len(name) != 4:
        return None
    suffix = name[3]
    if suffix in "123456":
        return int(suffix)
    return None


def _is_div(el: etree._Element) -> bool:
    return _div_level(el) is not None


def _section_from(el: etree._Element) -> Section:
    level = _div_level(el) or 1
    children = [_section_from(c) for c in el if _is_div(c)]
    title = _extract_title(el)
    raw_id = el.get("id") or el.get("ID") or el.get("n") or el.get("N")
    n = el.get("n") or el.get("N")
    word_count = _count_words(el)
    return Section(
        level=level,
        type=el.get("type") or el.get("TYPE"),
        title=title,
        raw_id=raw_id,
        n=n,
        element=el,
        word_count=word_count,
        children=children,
    )


def _extract_title(el: etree._Element) -> str:
    # ThML lets the title sit either on a @title attribute or in a child <head>.
    title_attr = el.get("title") or el.get("TITLE")
    if title_attr and title_attr.strip():
        return title_attr.strip()
    for child in el:
        if etree.QName(child).localname.lower() == "head":
            text = " ".join(child.itertext()).strip()
            if text:
                return text
    # Last resort: derive from @type + @n
    t = el.get("type") or el.get("TYPE") or ""
    n = el.get("n") or el.get("N") or ""
    if t and n:
        return f"{t} {n}".strip()
    if t:
        return t.strip()
    if n:
        return n.strip()
    return "Untitled"


def _count_words(el: etree._Element) -> int:
    text = " ".join(t for t in el.itertext() if t)
    return len(text.split())


def _gather_word_counts(s: Section, acc: dict[int, list[int]]) -> None:
    if s.is_leaf:
        acc.setdefault(s.level, []).append(s.word_count)
        return
    # A non-leaf div's "own" word count is the sum of its leaves; we still
    # record it so callers can decide to use it as a chapter level.
    acc.setdefault(s.level, []).append(s.word_count)
    for c in s.children:
        _gather_word_counts(c, acc)


def _flatten(
    s: Section,
    ancestors: list[Section],
    chapter_level: int,
    out: list[tuple[list[Section], Section]],
) -> None:
    if s.level >= chapter_level or s.is_leaf:
        out.append((list(ancestors), s))
        return
    next_ancestors = ancestors + [s]
    for c in s.children:
        _flatten(c, next_ancestors, chapter_level, out)


_DOCTYPE_RE = re.compile(rb"<!DOCTYPE[^>]*(?:\[[^\]]*\])?\s*>", re.IGNORECASE | re.DOTALL)


def _strip_doctype(data: bytes) -> bytes:
    return _DOCTYPE_RE.sub(b"", data, count=1)


# A practical subset of HTML entities CCEL ThML files actually use.
_NAMED_ENTITIES = {
    "nbsp": " ",
    "ndash": "–",
    "mdash": "—",
    "lsquo": "‘",
    "rsquo": "’",
    "ldquo": "“",
    "rdquo": "”",
    "hellip": "…",
    "copy": "©",
    "deg": "°",
    "para": "¶",
    "sect": "§",
    "middot": "·",
    "dagger": "†",
    "Dagger": "‡",
    "agrave": "à",
    "aacute": "á",
    "acirc": "â",
    "atilde": "ã",
    "auml": "ä",
    "aring": "å",
    "aelig": "æ",
    "ccedil": "ç",
    "egrave": "è",
    "eacute": "é",
    "ecirc": "ê",
    "euml": "ë",
    "igrave": "ì",
    "iacute": "í",
    "icirc": "î",
    "iuml": "ï",
    "ntilde": "ñ",
    "ograve": "ò",
    "oacute": "ó",
    "ocirc": "ô",
    "otilde": "õ",
    "ouml": "ö",
    "oelig": "œ",
    "ugrave": "ù",
    "uacute": "ú",
    "ucirc": "û",
    "uuml": "ü",
    "yacute": "ý",
    "Eacute": "É",
    "Aacute": "Á",
    "Iacute": "Í",
    "Oacute": "Ó",
    "Uacute": "Ú",
    "Ntilde": "Ñ",
    "Ccedil": "Ç",
    "szlig": "ß",
    "pound": "£",
    "Agrave": "À",
    "Egrave": "È",
    "Igrave": "Ì",
    "Ograve": "Ò",
    "Ugrave": "Ù",
    "Acirc": "Â",
    "Ecirc": "Ê",
    "Icirc": "Î",
    "Ocirc": "Ô",
    "Ucirc": "Û",
    "Auml": "Ä",
    "Euml": "Ë",
    "Iuml": "Ï",
    "Ouml": "Ö",
    "Uuml": "Ü",
    "Atilde": "Ã",
    "Otilde": "Õ",
    "AElig": "Æ",
    "OElig": "Œ",
    "thinsp": " ",
    "ensp": " ",
    "emsp": " ",
    "shy": "",
    "iquest": "¿",
    "iexcl": "¡",
    "laquo": "«",
    "raquo": "»",
}


def _substitute_named_entities(data: bytes) -> bytes:
    text = data.decode("utf-8", errors="replace")

    def sub(m: re.Match[str]) -> str:
        name = m.group(1)
        if name in _NAMED_ENTITIES:
            return _NAMED_ENTITIES[name]
        if name.startswith("#"):
            return m.group(0)  # let the parser handle numeric refs
        if name in ("amp", "lt", "gt", "quot", "apos"):
            return m.group(0)  # XML built-ins
        return ""  # silently drop unknown — better than parser error

    return re.sub(r"&([A-Za-z][A-Za-z0-9]*|#\d+|#x[0-9A-Fa-f]+);", sub, text).encode("utf-8")
