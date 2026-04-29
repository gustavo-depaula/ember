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
    "eng": "en-US",
    "en-us": "en-US",
    "en-gb": "en-GB",
    "pt": "pt-BR",
    "por": "pt-BR",
    "pt-br": "pt-BR",
    "fr": "fr-FR",
    "fra": "fr-FR",
    "fre": "fr-FR",
    "fr-fr": "fr-FR",
    "es": "es-ES",
    "spa": "es-ES",
    "it": "it",
    "ita": "it",
    "la": "la",
    "lat": "la",
    "el": "el",
    "ell": "el",
    "grc": "grc",
    "de": "de",
    "deu": "de",
    "ger": "de",
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
    """Find the first match for a Dublin Core metadata field.

    CCEL ThML 1.04 supports two forms in `<ThML.head>`:
      1. Element form: `<DC.Creator sub="Author" scheme="short-form">Thomas à Kempis</DC.Creator>`
      2. HTML form:    `<meta name="DC.Creator" content="..." />`
    Newer files use the element form (the DTD made `<DC.X>` a real element).
    """
    target = name.lower()
    # Element form — case-insensitive on local name
    for el in head.iter():
        local = etree.QName(el).localname.lower()
        if local != target:
            continue
        text = " ".join(el.itertext()).strip()
        if text:
            return text
    # HTML form
    for el in head.iter():
        if etree.QName(el).localname.lower() != "meta":
            continue
        n = el.get("name") or el.get("NAME")
        if n and n.lower() == target:
            content = el.get("content") or el.get("CONTENT")
            if content and content.strip():
                return content.strip()
    return None


def _meta_values_with_attr(head: etree._Element, name: str, attr: str) -> dict[str, str]:
    """Return {attr_value: text} for all matching `<DC.X>` element-form fields.
    Used to prefer e.g. scheme="short-form" over scheme="file-as" when picking
    the canonical author display string.
    """
    out: dict[str, str] = {}
    target = name.lower()
    for el in head.iter():
        if etree.QName(el).localname.lower() != target:
            continue
        key = (el.get(attr) or el.get(attr.upper()) or "").strip()
        text = " ".join(el.itertext()).strip()
        if text and key not in out:
            out[key] = text
    return out


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

    # Title: prefer DC.Title sub="Main", then any DC.Title, then <title>
    titles_by_sub = _meta_values_with_attr(head, "DC.Title", "sub")
    title = (
        titles_by_sub.get("Main")
        or titles_by_sub.get("main")
        or _meta_value(head, "DC.Title")
        or _text_of(head, ".//title")
    )

    # Author: prefer the human-readable forms over the CCEL slug.
    creators_by_scheme = _meta_values_with_attr(head, "DC.Creator", "scheme")
    creator = (
        creators_by_scheme.get("short-form")
        or creators_by_scheme.get("file-as")
        or _meta_value(head, "DC.Creator")
    )
    if creator and creator.lower() == (creators_by_scheme.get("ccel") or "").lower():
        creator = creators_by_scheme.get("file-as") or creator

    # Composed date: DC.Date is usually the digitization timestamp, NOT
    # composition. Prefer <firstPublished>/<published> from <generalInfo>;
    # otherwise scan printSourceInfo for a year. As a last resort use a
    # DC.Date *only* if it's a plausible composition year (pre-1900 4-digit).
    date = _text_of(head, ".//firstPublished") or _text_of(head, ".//pubDate")
    if not date:
        for tag in ("published", "publicationDate", "imprint"):
            t = _text_of(head, f".//{tag}")
            if t:
                m = re.search(r"\b(1[0-8]\d{2}|[3-9]\d{2})\b", t)
                if m:
                    date = m.group(1)
                    break
    if not date:
        raw_dc = _meta_value(head, "DC.Date") or _meta_value(head, "DC.Date.Created")
        if raw_dc and re.fullmatch(r"\d{3,4}", raw_dc.strip()) and int(raw_dc.strip()) < 1900:
            date = raw_dc.strip()

    lang = _meta_value(head, "DC.Language")
    rights = _meta_value(head, "DC.Rights")

    # Source URL: prefer a real http(s) URL from any DC.Identifier, then
    # synthesize from <authorID>/<bookID> if they exist.
    ids_by_scheme = _meta_values_with_attr(head, "DC.Identifier", "scheme")
    identifier = None
    for v in ids_by_scheme.values():
        if v.startswith("http://") or v.startswith("https://"):
            identifier = v
            break
    if not identifier:
        single = _meta_value(head, "DC.Identifier") or _meta_value(head, "DC.Identifier.URL")
        if single and (single.startswith("http://") or single.startswith("https://")):
            identifier = single
    if not identifier:
        author_id = _text_of(head, ".//authorID")
        book_id = _text_of(head, ".//bookID") or _text_of(head, ".//workID")
        if author_id and book_id:
            identifier = f"https://www.ccel.org/ccel/{author_id}/{book_id}/"

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
