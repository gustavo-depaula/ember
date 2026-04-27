"""Convert ThML body XML into Markdown.

Strategy: walk the element tree depth-first, dispatching by local tag name.
Block-level elements emit blank-line-separated paragraphs; inline elements
emit Markdown spans. Footnotes are collected per chapter and appended.

What we emit:
  <p>                          -> paragraph
  <head> / <h1..h6>            -> Markdown heading (level chosen by caller)
  <lg> / <l>                   -> blockquote with two-space hard breaks
  <q>                          -> "curly-quoted" inline
  <list> / <item>              -> "- item"
  <i> / <emph>                 -> *italic*
  <b> / <strong>               -> **bold**
  <scripRef>                   -> inner text (passage attribute dropped in v1)
  <scripCom> / <scripContext>  -> inner text (indexing wrapper, no UI)
  <note>                       -> Markdown footnote ([^N] + def at end)
  <a href=...>                 -> inner text (cross-doc links dropped in v1)
  <pb/>                        -> dropped
  <br/>                        -> hard line break (two trailing spaces)
  unknown                      -> inner text + log warning
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Iterable

from lxml import etree


@dataclass
class ConversionStats:
    dropped_links: int = 0
    unknown_elements: dict[str, int] = field(default_factory=dict)


@dataclass
class _Builder:
    parts: list[str] = field(default_factory=list)
    footnotes: list[str] = field(default_factory=list)
    stats: ConversionStats = field(default_factory=ConversionStats)

    def push(self, s: str) -> None:
        if s:
            self.parts.append(s)

    def render(self) -> str:
        body = "".join(self.parts).strip()
        body = re.sub(r"[ \t]+\n", "  \n", body)  # preserve hard breaks but collapse trailing spaces
        body = re.sub(r"\n{3,}", "\n\n", body)
        if self.footnotes:
            body += "\n\n" + "\n\n".join(self.footnotes)
        return body + "\n"


_BLOCK_TAGS = {
    "p",
    "div",
    "div1",
    "div2",
    "div3",
    "div4",
    "div5",
    "div6",
    "lg",
    "list",
    "blockquote",
    "head",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "table",
}

_INLINE_PASSTHROUGH = {"span", "scripcontext"}  # render children, no wrapper


def convert(body: etree._Element, stats: ConversionStats | None = None) -> tuple[str, ConversionStats]:
    """Convert a ThML body element subtree to Markdown."""
    b = _Builder(stats=stats or ConversionStats())
    _walk_block(body, b, heading_level=2)
    return b.render(), b.stats


def _local(el: etree._Element) -> str:
    return etree.QName(el).localname.lower()


def _walk_block(el: etree._Element, b: _Builder, heading_level: int) -> None:
    tag = _local(el)
    text = el.text or ""

    # Skip ThML head if it leaks through
    if tag in ("thml.head", "head") and tag == "thml.head":
        return

    if tag == "p":
        b.push("\n\n")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("\n\n")
        return

    if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
        level = int(tag[1])
        b.push("\n\n" + "#" * level + " ")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("\n\n")
        return

    if tag == "head":
        # ThML <head> is a heading inside a div; level depends on enclosing div depth.
        b.push("\n\n" + "#" * max(1, min(heading_level, 6)) + " ")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("\n\n")
        return

    if tag in ("div1", "div2", "div3", "div4", "div5", "div6"):
        next_level = int(tag[3]) + 1  # div1 children get h2-ish
        if text and text.strip():
            b.push(_clean_inline(text))
        for child in el:
            _walk_block(child, b, heading_level=next_level)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag == "lg":
        b.push("\n\n")
        # render each <l> as a blockquote line with a trailing hard break
        for child in el:
            if _local(child) == "l":
                b.push("> ")
                if child.text:
                    b.push(_clean_inline(child.text))
                for sub in child:
                    _walk_inline(sub, b)
                b.push("  \n")
            else:
                _walk_inline(child, b)
        b.push("\n")
        return

    if tag == "list":
        b.push("\n\n")
        for child in el:
            if _local(child) == "item":
                b.push("- ")
                if child.text:
                    b.push(_clean_inline(child.text))
                for sub in child:
                    _walk_inline(sub, b)
                b.push("\n")
        b.push("\n")
        return

    if tag == "blockquote":
        b.push("\n\n")
        inner = _Builder(stats=b.stats)
        if text:
            inner.push(_clean_inline(text))
        for child in el:
            _walk_block(child, inner, heading_level=heading_level)
        rendered = "".join(inner.parts).strip()
        b.footnotes.extend(inner.footnotes)
        for line in rendered.splitlines():
            b.push(f"> {line}\n" if line else ">\n")
        b.push("\n")
        return

    if tag == "div":
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_block(child, b, heading_level=heading_level)
        return

    # Unknown / void block — fall through to inline handling, but skip
    # whitespace-only tails so we don't leak blank lines between paragraphs.
    text_in = el.text and el.text.strip()
    has_kids = len(el) > 0
    if not text_in and not has_kids:
        if el.tail and el.tail.strip():
            b.push(_clean_inline(el.tail))
        return
    _walk_inline(el, b)


def _walk_inline(el: etree._Element, b: _Builder) -> None:
    tag = _local(el)
    text = el.text or ""

    if tag in _BLOCK_TAGS:
        _walk_block(el, b, heading_level=3)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag in ("i", "em", "emph"):
        b.push("*")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("*")
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag in ("b", "strong"):
        b.push("**")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("**")
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag == "q":
        b.push("“")
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        b.push("”")
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag == "scripref":
        # Drop the passage attribute; preserve the visible citation text.
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag in ("scripcom", "scripcontext"):
        # Indexing wrappers — not user-facing navigation.
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag == "note":
        idx = len(b.footnotes) + 1
        marker = f"[^{idx}]"
        b.push(marker)
        # Build the footnote body with its own builder so footnote-internal
        # paragraphs/spans don't leak into the main text.
        inner = _Builder(stats=b.stats)
        if text:
            inner.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, inner)
        rendered = "".join(inner.parts).strip()
        rendered = re.sub(r"\s+", " ", rendered)
        b.footnotes.append(f"{marker}: {rendered}")
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag == "a":
        href = el.get("href") or ""
        if href:
            b.stats.dropped_links += 1
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag in ("pb", "milestone"):
        # Void marker — skip the tail if it's whitespace-only (the common case)
        # so we don't leak blank "  " lines between paragraphs.
        if el.tail and el.tail.strip():
            b.push(_clean_inline(el.tail))
        return

    if tag == "br":
        b.push("  \n")
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    if tag in _INLINE_PASSTHROUGH or tag in ("name", "added", "deleted", "sic", "corr"):
        if text:
            b.push(_clean_inline(text))
        for child in el:
            _walk_inline(child, b)
        if el.tail:
            b.push(_clean_inline(el.tail))
        return

    # Unknown — pass through inner text and log
    b.stats.unknown_elements[tag] = b.stats.unknown_elements.get(tag, 0) + 1
    if text:
        b.push(_clean_inline(text))
    for child in el:
        _walk_inline(child, b)
    if el.tail:
        b.push(_clean_inline(el.tail))


def _clean_inline(s: str) -> str:
    # Collapse runs of whitespace inside a text node but never across nodes
    # (the walkers already control structural whitespace).
    s = re.sub(r"\s+", " ", s)
    # Markdown special chars that show up in 17th-century prose
    s = s.replace("\\", "\\\\")
    return s
