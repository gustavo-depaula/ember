"""Pull bibliographic metadata from a ThML <ThML.head> block.

The ThML 1.04 spec puts Dublin Core fields inside <electronicEdInfo> as
HTML-style <meta name="DC.Foo" content="..."> elements; <generalInfo> and
<printSourceInfo> hold prose descriptions.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

from lxml import etree


# ISO 639-1/2/3 → BCP-47 used by Ember libraries. Default region for "en"
# is US because that's what the existing libraries use.
_LANG_MAP = {
    "en": "en-US",
    "en-us": "en-US",
    "en-gb": "en-GB",
    "pt": "pt-BR",
    "pt-br": "pt-BR",
    "fr": "fr-FR",
    "fr-fr": "fr-FR",
    "es": "es-ES",
    "it": "it",
    "la": "la",
    "el": "el",
    "de": "de",
}


@dataclass
class BookMeta:
    title: Optional[str] = None
    author: Optional[str] = None
    language: str = "en-US"
    composed: Optional[object] = None  # int | str | None
    source_url: Optional[str] = None
    source_description: Optional[str] = None
    rights: Optional[str] = None
    print_source: dict[str, str] = field(default_factory=dict)


def _meta_value(head: etree._Element, name: str) -> Optional[str]:
    # <meta name="DC.Title" content="..."> — case-insensitive match on name
    for el in head.iter():
        tag = etree.QName(el).localname.lower()
        if tag != "meta":
            continue
        n = el.get("name") or el.get("NAME")
        if n and n.lower() == name.lower():
            content = el.get("content") or el.get("CONTENT")
            if content:
                return content.strip()
    return None


def _text_of(parent: etree._Element, *path_options: str) -> Optional[str]:
    for path in path_options:
        el = parent.find(path)
        if el is not None:
            text = " ".join(el.itertext()).strip()
            if text:
                return text
    return None


def _normalize_lang(raw: Optional[str]) -> str:
    if not raw:
        return "en-US"
    key = raw.strip().lower()
    return _LANG_MAP.get(key, raw.strip())


def _parse_composed(raw: Optional[str]) -> Optional[object]:
    """Coerce a date-like string to Ember's `composed` shape per
    docs/content/book-format.md (number | "c. YYYY" | "YYYY–YYYY" | "Nth century")."""
    if not raw:
        return None
    s = raw.strip()
    # Plain 4-digit year
    m = re.fullmatch(r"(\d{4})", s)
    if m:
        return int(m.group(1))
    # "circa 1418", "ca. 1418", "~1418"
    m = re.fullmatch(r"(?:circa|ca\.?|c\.?|~)\s*(\d{3,4})", s, re.IGNORECASE)
    if m:
        return f"c. {m.group(1)}"
    # Range with hyphen, en-dash, or "to"
    m = re.fullmatch(r"(\d{3,4})\s*(?:[-–—]|to)\s*(\d{3,4})", s)
    if m:
        return f"{m.group(1)}–{m.group(2)}"
    # "13th century"
    m = re.fullmatch(r"(\d{1,2})(?:st|nd|rd|th)?\s*c(?:entury)?\.?", s, re.IGNORECASE)
    if m:
        n = int(m.group(1))
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10 if n % 100 not in (11, 12, 13) else 0, "th")
        return f"{n}{suffix} century"
    return s  # unknown shape — pass through, hand-edit later


def extract(tree: etree._ElementTree) -> BookMeta:
    root = tree.getroot()
    # ThML.head and ThML.body are the only top-level children of <ThML>;
    # tag names are case-sensitive in spec but we accept either case.
    head = None
    for child in root:
        local = etree.QName(child).localname
        if local.lower() == "thml.head":
            head = child
            break
    if head is None:
        return BookMeta()

    title = _meta_value(head, "DC.Title") or _text_of(head, ".//title")
    creator = _meta_value(head, "DC.Creator") or _meta_value(head, "DC.Creator.Author")
    date = _meta_value(head, "DC.Date") or _meta_value(head, "DC.Date.Created")
    lang = _meta_value(head, "DC.Language")
    identifier = _meta_value(head, "DC.Identifier") or _meta_value(head, "DC.Identifier.URL")
    rights = _meta_value(head, "DC.Rights")

    # Fallback to <printSourceInfo> for date when DC.Date is absent
    if not date:
        for tag in ("publicationDate", "pubDate", "imprint"):
            t = _text_of(head, f".//{tag}")
            if t:
                m = re.search(r"\b(\d{3,4})\b", t)
                if m:
                    date = m.group(1)
                    break

    print_source: dict[str, str] = {}
    for el in head.iter():
        local = etree.QName(el).localname
        if local in ("title", "author", "publisher", "publicationDate", "imprint"):
            text = " ".join(el.itertext()).strip()
            if text and local not in print_source:
                print_source[local] = text

    return BookMeta(
        title=title,
        author=creator,
        language=_normalize_lang(lang),
        composed=_parse_composed(date),
        source_url=identifier,
        source_description="Christian Classics Ethereal Library (ccel.org)",
        rights=rights,
        print_source=print_source,
    )
