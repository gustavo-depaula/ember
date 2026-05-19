#!/usr/bin/env python3
"""Import 'My Catholic Faith' (Bp. Louis LaRavoire Morrow, 1949 / 2021 rev. ed.).

Source PDF: https://fsspx.asia/sites/default/files/documents/my-catholic-faith.pdf

The PDF is a 423-page pictorial catechism in 193 numbered lessons. Each lesson
has a header illustration on the first page, a single bold "N. TITLE" heading,
two-column body text alternating between answer paragraphs (11pt) and smaller
Scripture commentary (9pt), and Q&A questions in a bold face (Type3 ref 428).

This script:
  - Auto-detects lesson page ranges by scanning for 12pt+ bold "N. TITLE" lines.
  - Extracts per-lesson markdown via layout-aware fragment grouping
    (column-aware reading order, role tagging by font size + face).
  - Extracts the header illustration as WebP; falls back to rasterizing the
    top-of-page region when the image is embedded as vector glyphs.
  - Repairs missing-space artifacts ('ofthorns' -> 'of thorns',
    'BlessedTrinity' -> 'Blessed Trinity') via a conservative wordninja +
    wordfreq + glue-word/camelCase heuristic.
  - Carves the appendix (Church Year, Most Important Prayers) out of lesson 193
    into their own chapter files. Skips the Index.

Re-runnable: wipes the en-US/ and images/ subdirs of the book directory and
regenerates them deterministically.

Dependencies (install into a venv):
    pip install pymupdf wordninja wordfreq
System tools: pdfimages (poppler-utils), magick (ImageMagick) for PNG -> WebP.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from collections import defaultdict
from pathlib import Path

import fitz
import wordninja
from wordfreq import zipf_frequency

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "books" / "morrow-my-catholic-faith"
PDF_URL = "https://fsspx.asia/sites/default/files/documents/my-catholic-faith.pdf"
DEFAULT_PDF = ROOT / ".cache" / "morrow-my-catholic-faith.pdf"

# ---------------------------------------------------------------------------
# Font / layout constants (discovered via probing the source PDF)
# ---------------------------------------------------------------------------

FONT_BOLD = "Type3 (428 0 R)"  # 12pt lesson heading + 11pt questions
FONT_ITALIC = "Type3 (598 0 R)"  # image captions

COLUMN_SPLIT_X = 247.0  # page is 504 wide; ~247 cleanly separates left col
                       # tails (rare past 245) from right col starts (cluster at 250+).
RUNNING_HEADER_Y = 30.0  # text above this is running header / folio
HEADING_RE = re.compile(r"^(\d+)\.\s+(.+)$")

# Closed-class words that signal a genuine glue artifact like 'ofthorns'.
GLUE_FIRST = {
    "a", "i", "of", "if", "in", "on", "to", "by", "at", "as", "is", "or", "no", "do",
    "the", "and", "end", "us", "we", "he", "she", "it", "his", "her", "for",
    "an", "all", "are", "was", "were", "this", "that", "with", "from", "but",
    "have", "had", "has", "did", "does", "be", "been", "should", "would", "could",
    "will", "may", "must", "him", "them", "their", "our",
}
_WORD_RE = re.compile(r"[A-Za-z][A-Za-z']*")

# Rare Catholic / historical proper nouns that wordfreq under-reports
# (zipf < 2.5). Used as a supplementary allowlist when validating splits.
CATHOLIC_VOCAB = {
    "trajan", "thessalonica", "nicea", "loretto", "gethsemani", "chalcedon",
    "bacteriology", "arles", "tarsus", "trent", "padua", "lima", "compostela",
    "calais", "monica", "claver", "athanasius", "ephesus", "antioch",
    "siena", "saba", "lourdes", "fatima", "assisi", "covet", "shalt",
    "pentecost", "matrimony", "contrition", "thy", "thee", "thou",
    "mundelein", "purificator", "burse",
    # space-split target vocabulary (rejoined post-extract):
    "viaticum", "diriment", "toledano", "gioja", "passionists", "apostatize",
    "apostatized", "apostasized", "incardinated", "corporally", "indult",
    "mayest", "adoreth", "humbleth", "didst", "reignest", "hostia",
    "trappists", "tantum", "sacramentum", "antiquum", "jubilatio",
    "procedenti", "laudate", "quoniam", "confirmata", "spiritui",
    "saeculorum", "elevation",
}

# Multi-token sequences that the PDF splits with stray spaces. Each entry is
# (tokens, joined). Conservative: every entry is either a religious term, a
# proper name, or an unambiguous OCR artifact unlikely to collide with normal
# English. Ambiguous cases (e.g. 'framing'/'training', 'Cod'/'God') are left
# for human / LLM review.
SPLIT_FIXES = [
    # Religious technical terms (rare enough that the joined form is unique)
    (("Via", "ti", "cum"), "Viaticum"),
    (("via", "ti", "cum"), "Viaticum"),
    (("dir", "i", "ment"), "diriment"),
    (("a", "post", "at", "i", "zed"), "apostatized"),
    (("a", "post", "at", "ize"), "apostatize"),
    (("a", "post", "at", "ized"), "apostatized"),
    (("an", "in", "du", "lt"), "an indult"),
    (("in", "card", "in", "a", "ted"), "incardinated"),
    (("Passion", "is", "ts"), "Passionists"),
    (("Trapp", "is", "ts"), "Trappists"),
    # Archaic verb forms (King James Scripture quotes)
    (("adore", "th"), "adoreth"),
    (("humble", "th"), "humbleth"),
    (("may", "est"), "mayest"),
    (("did", "st"), "didst"),
    (("reign", "est"), "reignest"),
    (("sinn", "eth"), "sinneth"),
    # Proper names (always misspelled identically when split)
    (("Salutaris", "Host", "i", "a"), "Salutaris Hostia"),
    (("Gi", "oj", "a"), "Gioja"),
    (("Just", "in"), "Justin"),  # only in the Saints list context — risk acceptable
    (("Opt", "at", "us"), "Optatus"),
    (("End", "li", "cher"), "Endlicher"),
    (("Leverrie", "r"), "Leverrier"),
    (("Mende", "l"), "Mendel"),
    (("Sem", "mel", "we", "is"), "Semmelweis"),
    (("Zac", "he", "us"), "Zacheus"),
    (("To", "led", "a", "no"), "Toledano"),
    # Latin words that always appear inline-italicized in body text
    (("ep", "is", "co", "pos"), "*episcopos*"),
    (("The", "os"), "*Theos*"),
    # Unique single-word OCR typos in the source PDF
    (("Pashcal",), "Pascal"),
    (("Elevationl",), "Elevation"),
    (("commandedall",), "commanded all"),
    (("BlessedTrinity",), "Blessed Trinity"),  # safety net
    (("Chruch",), "Church"),
    # High-frequency 2-token splits in body text
    (("A", "men"), "Amen"),
    (("a", "like"), "alike"),
    (("a", "men"), "amen"),
    # More proper-name splits and OCR fragmentations
    (("Mach", "a", "be", "us"), "Maccabeus"),
    (("Mile", "vi"), "Milevi"),
    (("Cons", "i", "stories"), "Consistories"),
    (("vicar", "i", "at", "es"), "vicariates"),
    (("organ", "iz", "a", "tions"), "organizations"),
    (("organ", "iz", "a", "tion"), "organization"),
    (("tempt", "a", "tions"), "temptations"),
    (("resp", "on", "si", "bility"), "responsibility"),
    (("prop", "a", "gator"), "propagator"),
    (("prop", "a", "gators"), "propagators"),
    (("as", "signed"), "assigned"),
]


def _build_split_fix_regex():
    """Compile SPLIT_FIXES into a single alternation regex for fast application."""
    patterns = []
    for src, dst in SPLIT_FIXES:
        if isinstance(src, str):
            src_tokens = (src,)
        else:
            src_tokens = src
        # word-boundaries + whitespace between tokens
        pat = r"\b" + r"\s+".join(re.escape(t) for t in src_tokens) + r"\b"
        patterns.append((re.compile(pat), dst))
    return patterns


_SPLIT_FIX_PATTERNS = _build_split_fix_regex()

# Words that SPLIT_FIXES intentionally produces — without protection, split_glued
# would happily re-shatter 'Amen' back into 'A men' or 'alike' into 'a like'.
PROTECTED_REJOINED = {
    w.lower()
    for _, dst in SPLIT_FIXES
    for w in re.findall(r"[A-Za-z]+", dst)
    if len(w) >= 3
}

# ---------------------------------------------------------------------------
# Lesson 193 is followed by appendix sections on the same continuous pages.
# Detected boundaries (PDF 1-indexed):
#   lesson 193  CONCLUSION: WHY I AM A CATHOLIC      pp 406-407
#   appendix    THE CHURCH YEAR                       pp 408-411
#   appendix    THE MOST IMPORTANT PRAYERS            pp 412-415
#   skip        INDEX                                 pp 416-423
# ---------------------------------------------------------------------------

APPENDIX_OVERRIDE = {
    193: (406, 407),
}
APPENDICES = [
    ("appendix-church-year", "The Church Year", 408, 411),
    ("appendix-prayers", "The Most Important Prayers", 412, 415),
]
INDEX_FIRST_PAGE = 416  # everything from here on is the printed index — skip


# ---------------------------------------------------------------------------
# Text cleanup
# ---------------------------------------------------------------------------

def _is_word(p: str, threshold: float) -> bool:
    if len(p) < 2:
        return False
    if p.lower() in CATHOLIC_VOCAB:
        return True
    return zipf_frequency(p.lower(), "en") >= threshold


def _binary_glue_split(token: str):
    """Try every binary split at position 2..len-2; return (left, right) if the
    left is a glue word and right is a common English word. Used as a fallback
    when wordninja over-segments tokens like 'ofsin' -> 'of s in'.
    """
    for i in range(2, len(token) - 1):
        left, right = token[:i], token[i:]
        if left.lower() in GLUE_FIRST and _is_word(right, 3.0):
            return left, right
    return None


def split_glued(token: str) -> str:
    """Split missing-space artifacts conservatively.

    Three paths, tried in order:
      1. CamelCase: split at every '[a-z][A-Z]' boundary, then re-apply
         wordninja to each piece to catch nested glue (e.g. 'wordofGod' ->
         'wordof','God' -> 'word','of','God'). Accept if every final piece
         is a common English word (zipf >= 3.0).
      2. wordninja split: accept if every piece is a common word AND at
         least one piece is a known glue word ('of', 'the', ...).
      3. Binary glue split (fallback): only for tokens whose own zipf is
         near zero (i.e. clearly not a real word like 'ofsin'). Tries
         every '<glue> <word>' split; recovers cases wordninja over-splits
         into 1-char middles.
    """
    if not token or len(token) < 3:
        return token

    # Known-good religious/proper-noun vocabulary takes precedence — without
    # this, wordninja happily re-splits 'Viaticum' back into 'Via ti cum'.
    # Also protect any word the SPLIT_FIXES table intentionally produces.
    lower = token.lower()
    if lower in CATHOLIC_VOCAB or lower in PROTECTED_REJOINED:
        return token

    # Path 1: camelCase boundary + nested wordninja
    if re.search(r"[a-z][A-Z]", token):
        camel_parts = re.split(r"(?<=[a-z])(?=[A-Z])", token)
        expanded: list[str] = []
        for p in camel_parts:
            # Apply wordninja to each camel piece without requiring glue,
            # since the camelCase boundary already evidences gluing.
            # Require every nested piece to be either:
            #   - a known glue word ('of', 'the', 'and', ...), OR
            #   - >= 3 chars and a real common English word.
            # The length-3 floor suppresses wordninja's tendency to chop
            # short proper nouns like 'Vico' into 'Vi co', while the glue
            # exception preserves 'wordof' -> 'word'+'of'.
            sub = wordninja.split(p) if len(p) >= 5 else [p]
            if len(sub) >= 2 and all(
                s.lower() in GLUE_FIRST or (len(s) >= 3 and _is_word(s, 3.0))
                for s in sub
            ):
                expanded.extend(sub)
            else:
                expanded.append(p)
        # When the expanded split contains a glue word, accept rare proper
        # nouns (saints, places: 'Pentecost', 'Lourdes', 'Assisi'); otherwise
        # require the standard common-word bar.
        has_glue = any(p.lower() in GLUE_FIRST for p in expanded)
        threshold = 2.5 if has_glue else 3.0
        if all(_is_word(p, threshold) for p in expanded):
            return " ".join(expanded)
        return token  # CamelCase but unsplittable (likely proper noun)

    # Path 2a: ALL-CAPS — glued caps like 'THOUSHALL' / 'THOUSHALTNOTCOVET'.
    # Lowercase, ask wordninja, re-uppercase. Preserves single-word all-caps
    # tokens (APOSTLES, JERUSALEM) which yield 1 piece. Uses a looser zipf
    # bar (2.7) because biblical commandment vocabulary ('covet', 'shalt')
    # is genuinely rare in modern frequency data. Handles trailing 'S
    # (possessive) by stripping & re-attaching.
    caps_match = re.fullmatch(r"([A-Z]+)(['][A-Z])?", token)
    if caps_match and len(caps_match.group(1)) >= 6:
        base, suffix = caps_match.group(1), caps_match.group(2) or ""
        caps_pieces = wordninja.split(base.lower())
        if len(caps_pieces) >= 2 and all(_is_word(p, 2.7) for p in caps_pieces):
            return " ".join(p.upper() for p in caps_pieces) + suffix

    # Path 2b: wordninja with glue requirement.
    # Variable threshold based on whether the original token is a real word:
    # - Clearly not a word (zipf < 2): trust the split, allow any rare piece (>=1)
    # - Borderline (>=2): require pieces be common (>=3)
    # Allow 1-char pieces only for valid English single-letter words ('a', 'I').
    orig_zipf = zipf_frequency(token.lower(), "en")
    pieces = wordninja.split(token)
    if len(pieces) >= 2 and any(p.lower() in GLUE_FIRST for p in pieces):
        threshold = 1.0 if orig_zipf < 2.0 else 3.0
        if all(
            (len(p) >= 2 and zipf_frequency(p.lower(), "en") >= threshold)
            or (len(p) == 1 and p.lower() in {"a", "i"})
            for p in pieces
        ):
            return " ".join(pieces)

    # Path 2c: original is clearly not a word and wordninja produces a clean
    # split of common words. Catches 'Himselfgave' / 'shouldfirst' / 'didnot'
    # where neither piece is a glue word but both are reasonably common.
    if orig_zipf < 1.5 and len(pieces) >= 2:
        if all(_is_word(p, 3.0) for p in pieces):
            return " ".join(pieces)

    # Path 3: binary fallback — only if original token isn't a real English word
    if orig_zipf < 1.5:
        pair = _binary_glue_split(token)
        if pair:
            return f"{pair[0]} {pair[1]}"

    return token


def clean_text(text: str) -> str:
    """Repair missing-space artifacts and common typography issues."""
    # Rejoin known PDF token-splits (e.g. 'Via ti cum' -> 'Viaticum') BEFORE
    # the wordninja splitter runs — once a token sequence is reunited as a
    # real word, the splitter shouldn't touch it.
    for pat, replacement in _SPLIT_FIX_PATTERNS:
        text = pat.sub(replacement, text)
    text = _WORD_RE.sub(lambda m: split_glued(m.group(0)), text)
    # Fix a recurring 'word--word' artifact: collapse to em-dash with surrounding spaces.
    text = re.sub(r"(\w)--(\w)", r"\1 — \2", text)
    # All-caps possessive missing trailing space: APOSTLES'CREED -> APOSTLES' CREED.
    # Require 2+ caps after the apostrophe so legit single-letter possessives
    # like GOD'S aren't split into GOD' S.
    text = re.sub(r"([A-Z])'([A-Z][A-Z])", r"\1' \2", text)
    # Sentence-end punctuation glued to next sentence: "object.We" -> "object. We"
    # (Conservative: only when a lowercase letter precedes the punctuation, to
    # avoid breaking things like 'Mt. Carmel' or initials.)
    text = re.sub(r"([a-z][.!?])([A-Z][a-z])", r"\1 \2", text)
    # "Iam" -> "I am" (recurring Scripture quote artifact).
    text = re.sub(r"\bIam\b", "I am", text)
    # Number glued to its preceding short word: "of300", "ages of12" -> "of 300" / "of 12".
    text = re.sub(r"\b(of|to|in|on|at|by|from|for|with|into|onto|over|under|about|ages?|aged)(\d)", r"\1 \2", text)
    # Hyphen at end of broken line not re-joined: "im- pediments" -> "impediments".
    text = re.sub(r"(\w+)- (\w+)", _rejoin_hyphenated, text)
    # Mid-sentence spurious period: "his. ordination" -> "his ordination" — only
    # when both sides are short and lowercase (typical OCR artifact).
    text = re.sub(r"\b([a-z]{1,4})\. ([a-z]{2,})\b", _maybe_drop_period, text)
    # "Chruch" -> "Church" (genuine typo in the source PDF, lesson 192 heading).
    text = re.sub(r"\bChruch\b", "Church", text)
    # Collapse runs of whitespace introduced by the splits.
    text = re.sub(r"[ \t]+", " ", text)
    # No space between '*' (closing italic) and trailing punctuation.
    text = re.sub(r"\*\s+([,.;:!?])", r"*\1", text)
    return text


def _rejoin_hyphenated(m):
    a, b = m.group(1), m.group(2)
    joined = a + b
    # Rejoin when the joined word is a real English word (zipf>=3). Aggressive
    # by design: line-break hyphens in this PDF are far more common than
    # legitimate compound words, and the LLM-per-chapter review can flag any
    # rare false-positive rejoinings.
    if zipf_frequency(joined.lower(), "en") >= 3.0:
        return joined
    return m.group(0)


def _maybe_drop_period(m):
    """Drop a mid-sentence period if the joined form looks more like a normal
    English bigram than a sentence break."""
    a, b = m.group(1), m.group(2)
    # If 'a' is a very common closed-class word (his, the, of, ...), the period
    # is almost certainly an OCR artifact — drop it.
    if a.lower() in GLUE_FIRST | {"prevented", "made"}:
        return f"{a} {b}"
    return m.group(0)


# ---------------------------------------------------------------------------
# Layout-aware extraction
# ---------------------------------------------------------------------------

def classify_span(span):
    sz = round(span["size"], 1)
    font = span["font"]
    return sz, font == FONT_BOLD, font == FONT_ITALIC


def line_fragments(line):
    """Split a line into runs of consecutive spans sharing (size, bold, italic)."""
    frags = []
    cur = None
    for span in line["spans"]:
        sig = classify_span(span)
        if cur and cur["sig"] == sig:
            cur["text"] += span["text"]
            cur["x1"] = max(cur["x1"], span["bbox"][2])
        else:
            if cur is not None:
                frags.append(cur)
            cur = {
                "sig": sig,
                "text": span["text"],
                "x0": span["bbox"][0],
                "y0": span["bbox"][1],
                "x1": span["bbox"][2],
                "y1": span["bbox"][3],
            }
    if cur is not None:
        frags.append(cur)
    out = []
    for f in frags:
        text = f["text"].strip()
        if not text:
            continue
        sz, bold, italic = f["sig"]
        out.append({"x0": f["x0"], "y0": f["y0"], "x1": f["x1"], "y1": f["y1"],
                    "text": text, "size": sz, "bold": bold, "italic": italic})
    return out


def collect_lines(page):
    """Collect text fragments. Drops the running-header band, but only when
    the candidate line is at small size — a 12pt lesson heading near the top
    of the page (e.g. lesson 66) is a real heading, not a header.
    """
    out = []
    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            y0 = line["bbox"][1]
            if y0 < RUNNING_HEADER_Y:
                # Only drop if this is small-size text (page number / folio /
                # running title); a 12pt+ bold heading near the top is kept.
                if not any(round(s["size"], 1) >= 12.0 for s in line["spans"]):
                    continue
            out.extend(line_fragments(line))
    return out


def find_heading(lines):
    """Return the index of the first numbered lesson heading line.

    Iterates lines in reading order; merges adjacent 12pt+ bold fragments on
    the same physical line (handles lessons where the 'N.' is in 13pt and
    the title is in 12pt, like lesson 61). Falls back to the first bold-12pt
    line if no numbered match is found (e.g. for appendix sections).
    """
    fallback = None
    i = 0
    while i < len(lines):
        l = lines[i]
        if l["size"] >= 12.0 and l["bold"]:
            # Merge with adjacent same-line 12pt+ bold fragments.
            merged_text = l["text"]
            j = i + 1
            while j < len(lines) and lines[j]["size"] >= 12.0 and lines[j]["bold"] and abs(lines[j]["y0"] - l["y0"]) < 6:
                merged_text += " " + lines[j]["text"]
                j += 1
            if HEADING_RE.match(merged_text.strip()):
                # Replace fragment text with merged title (so heading extraction
                # downstream sees the full 'N. TITLE').
                lines[i]["text"] = merged_text.strip()
                # Remove the merged-away duplicates.
                for k in range(j - 1, i, -1):
                    lines.pop(k)
                return i
            if fallback is None:
                fallback = i
            i = j
            continue
        i += 1
    return fallback


def reading_order_key(l):
    # Use floor division (not round) so fragments straddling the .5 rounding
    # boundary (e.g. y0=522.515 vs y0=522.488) land in the same bucket.
    # 7-point bands sit comfortably below the ~11pt line spacing.
    return (int(l["y0"] // 7), l["x0"])


def split_columns(lines):
    left = sorted([l for l in lines if l["x0"] < COLUMN_SPLIT_X], key=reading_order_key)
    right = sorted([l for l in lines if l["x0"] >= COLUMN_SPLIT_X], key=reading_order_key)
    return left, right


def group_paragraphs(lines):
    paras = []
    cur = None
    for l in lines:
        style = (l["size"], l["bold"], l["italic"])
        if cur and cur["style"] == style and (l["y0"] - cur["y_last"]) < 1.6 * l["size"]:
            cur["text"] += " " + l["text"].strip()
            cur["y_last"] = l["y1"]
        else:
            if cur:
                paras.append(cur)
            cur = {"style": style, "text": l["text"].strip(), "y_last": l["y1"]}
    if cur:
        paras.append(cur)
    return paras


def role_for(style, text=""):
    """Classify a paragraph by style + text shape.

    A 12pt+ bold line is the chapter heading if it matches 'N. TITLE',
    otherwise a section divider (rendered as H2). This prevents
    un-numbered dividers like 'EMINENT CATHOLICS' from competing with
    the numbered lesson heading for H1 status.
    """
    sz, bold, italic = style
    if sz >= 12.0 and bold:
        return "heading" if HEADING_RE.match(text.strip()) else "section"
    if italic:
        return "caption"
    if sz == 9.0:
        return "commentary"
    if sz == 11.0 and bold:
        return "question"
    return "body"


def page_blocks(page, is_first):
    lines = collect_lines(page)
    blocks = []
    if is_first:
        heading_idx = find_heading(lines)
        if heading_idx is not None:
            heading_line = lines[heading_idx]
            # H1 always comes first in the markdown — even if the in-PDF
            # heading sits mid-page below a section divider, the chapter
            # heading must precede the divider content for clean reader UX.
            blocks.append({"role": "heading", "text": heading_line["text"].strip()})
            pre = [l for l in lines if l["y0"] < heading_line["y0"] and l is not heading_line]
            pre.sort(key=reading_order_key)
            for para in group_paragraphs(pre):
                blocks.append({"role": role_for(para["style"], para["text"]), "text": para["text"]})
            body_lines = [l for l in lines if l["y0"] > heading_line["y1"]]
        else:
            body_lines = lines
    else:
        body_lines = lines
    left, right = split_columns(body_lines)
    for col in (left, right):
        for para in group_paragraphs(col):
            blocks.append({"role": role_for(para["style"], para["text"]), "text": para["text"]})
    return blocks


def merge_inline_italic(blocks):
    """Stitch inline italic words back into surrounding body paragraphs.

    The PDF puts short Latin / proper-noun italics ('credo', 'papa',
    'Corpus Christi') inline within body text. After fragment splitting they
    appear as standalone caption-role blocks. Reattach them as inline `*...*`.

    Only inlines SHORT italic spans (<=40 chars / no sentence-end punctuation).
    Long italic blocks are genuine sidebars that should stay as their own
    paragraphs.
    """
    out = []
    i = 0
    while i < len(blocks):
        b = blocks[i]
        text = b["text"].strip()
        is_short_italic = (
            b["role"] == "caption"
            and len(text) <= 40
            and not re.search(r"[.!?]\s*$", text)
        )
        if (
            is_short_italic
            and out and out[-1]["role"] in {"body", "commentary"}
            and i + 1 < len(blocks)
            and blocks[i + 1]["role"] in {"body", "commentary"}
            and out[-1]["role"] == blocks[i + 1]["role"]
        ):
            prev = out[-1]
            nxt = blocks[i + 1]
            prev["text"] = prev["text"].rstrip() + " *" + text + "* " + nxt["text"].lstrip()
            i += 2
            continue
        out.append(b)
        i += 1
    return out


def merge_continuations(blocks):
    """Stitch paragraphs that span column / page breaks."""
    out = []
    for b in blocks:
        # Two adjacent questions where the first doesn't end with '?' are a
        # single question that wrapped across a column or page break.
        if (
            out and out[-1]["role"] == "question" and b["role"] == "question"
            and not out[-1]["text"].rstrip().endswith(("?", "!"))
        ):
            out[-1]["text"] = out[-1]["text"].rstrip() + " " + b["text"].lstrip()
            continue
        # Pull a leading punctuation mark off a body that follows a question.
        if (
            out and out[-1]["role"] == "question"
            and b["role"] == "body"
            and not out[-1]["text"].rstrip().endswith(("?", "!", ".", ":"))
            and b["text"].lstrip().startswith(("?", "!", ":"))
        ):
            stripped = b["text"].lstrip()
            mark = stripped[0]
            out[-1]["text"] = out[-1]["text"].rstrip() + mark
            rest = stripped[1:].lstrip()
            if rest:
                b["text"] = rest
            else:
                continue
        if (
            out and out[-1]["role"] == b["role"] in {"body", "commentary"}
            and out[-1]["text"]
            and out[-1]["text"][-1] not in ".!?\"'"
        ):
            out[-1]["text"] = out[-1]["text"] + " " + b["text"]
            continue
        out.append(b)
    return out


_TITLE_SMALL = {"a", "an", "and", "as", "at", "but", "by", "for", "in", "of", "on", "or", "the", "to", "with"}


def _titleize(words):
    return " ".join(
        w.lower() if i > 0 and w.lower() in _TITLE_SMALL else w[:1].upper() + w[1:].lower()
        for i, w in enumerate(words)
    )


def title_case_lesson(heading_text: str) -> str:
    """'1. RELIGION AND THE END OF MAN' -> '1. Religion and the End of Man'."""
    parts = heading_text.split(maxsplit=1)
    if len(parts) < 2:
        return heading_text
    num, rest = parts
    return f"{num} " + _titleize(rest.split())


def title_case_lesson_or_section(text: str) -> str:
    """Title-case section dividers like 'EMINENT CATHOLICS' or 'APOSTOLICITY OF CATHOLIC DOCTRINES'."""
    return _titleize(text.split())


def render_markdown(blocks, image_ref=None, heading_override=None):
    """Render blocks as Markdown chapter content.

    When `heading_override` is set, suppress any in-page heading blocks plus
    any 'body' blocks that match a known section-divider label (e.g. 'APPENDIX'),
    and emit the override as the single H1.
    """
    DIVIDER_LABELS = {"APPENDIX"}

    lines: list[str] = []
    heading_done = False
    caption_text = None

    if heading_override:
        lines.extend([f"# {heading_override}", ""])
        if image_ref:
            lines.extend([f"![]({image_ref})", ""])
        heading_done = True

    for b in blocks:
        role, text = b["role"], b["text"]
        if role == "caption" and not heading_done:
            caption_text = text
            continue
        if role == "heading":
            if heading_override:
                # Skip the auto-detected heading; override already emitted.
                continue
            title = title_case_lesson(text)
            lines.extend([f"# {title}", ""])
            if image_ref:
                lines.extend([f"![]({image_ref})", ""])
            if caption_text:
                lines.extend([f"*{caption_text}*", ""])
            heading_done = True
            continue
        if heading_override and role == "body" and text.strip().upper() in DIVIDER_LABELS:
            continue
        if role == "section":
            lines.extend(["", f"## {title_case_lesson_or_section(text)}", ""])
        elif role == "question":
            lines.extend(["", f"**{text}**", ""])
        elif role == "commentary":
            lines.extend([f"> {text}", ""])
        else:
            lines.extend([text, ""])
    return "\n".join(lines).strip() + "\n"


def extract_chapter_markdown(doc, start_page, end_page, image_ref=None, heading_override=None):
    """Top-level: extract a page range as markdown using all the above helpers."""
    blocks = []
    for i, pi in enumerate(range(start_page - 1, end_page)):
        blocks.extend(page_blocks(doc[pi], is_first=(i == 0)))
    blocks = merge_inline_italic(blocks)
    blocks = merge_continuations(blocks)
    for b in blocks:
        b["text"] = clean_text(b["text"])
    md = render_markdown(blocks, image_ref=image_ref, heading_override=heading_override)
    # Second pass after title-case conversion catches single-token typos like
    # 'Chruch' that don't match their all-caps source form during the block-level
    # pass (case-sensitive regex). Skip image-ref lines to keep filenames intact.
    cleaned_lines = []
    for line in md.split("\n"):
        if re.match(r"\s*!\[[^\]]*\]\([^)]+\)\s*$", line):
            cleaned_lines.append(line)
        else:
            cleaned_lines.append(clean_text(line))
    return "\n".join(cleaned_lines)


# ---------------------------------------------------------------------------
# Lesson discovery
# ---------------------------------------------------------------------------

def find_lessons(doc):
    """Walk the PDF and return [{num, title, start, end}, ...] for all 193 lessons."""
    headings = []
    for pi in range(doc.page_count):
        page = doc[pi]
        for block in page.get_text("dict")["blocks"]:
            if block["type"] != 0:
                continue
            for line in block["lines"]:
                spans = line["spans"]
                if not spans:
                    continue
                if not all(s["font"] == FONT_BOLD and round(s["size"], 1) >= 12.0 for s in spans):
                    continue
                text = "".join(s["text"] for s in spans).strip()
                m = HEADING_RE.match(text)
                if m:
                    headings.append((pi + 1, int(m.group(1)), m.group(2).strip()))
                    break
            else:
                continue
            break
    lessons = []
    for i, (start_page, num, title) in enumerate(headings):
        end_page = headings[i + 1][0] - 1 if i + 1 < len(headings) else doc.page_count
        if num in APPENDIX_OVERRIDE:
            start_page, end_page = APPENDIX_OVERRIDE[num]
        lessons.append({"num": num, "title": title, "start": start_page, "end": end_page})
    return lessons


# ---------------------------------------------------------------------------
# Image extraction
# ---------------------------------------------------------------------------

def extract_image(pdf_path, doc, start_page, dest_webp, raster_fallback=True):
    """Extract the lesson's header image to a WebP file. Returns True on success.

    1. Try pdfimages on the start page; if it finds raster images, pick the largest.
    2. Otherwise, if `raster_fallback` is on, rasterize the page region above
       the lesson heading using pymupdf at 2x zoom.
    """
    dest_webp.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        subprocess.run(
            ["pdfimages", "-f", str(start_page), "-l", str(start_page), "-png", str(pdf_path), str(td / "img")],
            check=False, capture_output=True,
        )
        pngs = sorted(td.glob("img-*.png"))
        if pngs:
            largest = max(pngs, key=lambda p: p.stat().st_size)
            subprocess.run(["magick", str(largest), "-quality", "85", str(dest_webp)], check=True, capture_output=True)
            return True
    if not raster_fallback:
        return False
    # Rasterize page region above the heading.
    page = doc[start_page - 1]
    lines = collect_lines(page)
    hidx = find_heading(lines)
    if hidx is None:
        return False
    heading_y = lines[hidx]["y0"]
    if heading_y < 60:  # heading near top => no image above
        return False
    clip = fitz.Rect(0, RUNNING_HEADER_Y, page.rect.width, heading_y - 4)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), clip=clip)
    with tempfile.TemporaryDirectory() as td:
        png = Path(td) / "raster.png"
        pix.save(str(png))
        subprocess.run(["magick", str(png), "-quality", "85", str(dest_webp)], check=True, capture_output=True)
    return True


# ---------------------------------------------------------------------------
# Pipeline
# ---------------------------------------------------------------------------

def ensure_pdf(pdf_path: Path) -> Path:
    if pdf_path.exists():
        return pdf_path
    pdf_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading PDF from {PDF_URL} -> {pdf_path}", flush=True)
    with urllib.request.urlopen(PDF_URL) as resp, open(pdf_path, "wb") as f:
        shutil.copyfileobj(resp, f)
    return pdf_path


def wipe(path: Path):
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True)


def import_lesson(doc, pdf_path, lesson, out_md_dir, out_img_dir):
    num = lesson["num"]
    base = f"lesson-{num:03d}"
    md_path = out_md_dir / f"{base}.md"
    img_path = out_img_dir / f"{base}.webp"
    img_ok = extract_image(pdf_path, doc, lesson["start"], img_path)
    image_ref = f"../images/{base}.webp" if img_ok else None
    md = extract_chapter_markdown(doc, lesson["start"], lesson["end"], image_ref=image_ref)
    md_path.write_text(md)
    return img_ok


def import_appendix(doc, pdf_path, chapter_id, title, start, end, out_md_dir, out_img_dir):
    base = chapter_id
    md_path = out_md_dir / f"{base}.md"
    img_path = out_img_dir / f"{base}.webp"
    img_ok = extract_image(pdf_path, doc, start, img_path)
    image_ref = f"../images/{base}.webp" if img_ok else None
    md = extract_chapter_markdown(doc, start, end, image_ref=image_ref, heading_override=title)
    md_path.write_text(md)
    return img_ok


def regenerate_toc(lessons, manifest_path):
    """Rewrite book.json's TOC titles to match the PDF source verbatim."""
    manifest = json.loads(manifest_path.read_text())

    by_num = {l["num"]: l for l in lessons}
    parts = {"part-1": (1, 83), "part-2": (84, 122), "part-3": (123, 193)}

    new_toc = []
    for part_id, (lo, hi) in parts.items():
        existing = next((n for n in manifest["toc"] if n["id"] == part_id), None)
        if not existing:
            continue
        children = []
        for num in range(lo, hi + 1):
            l = by_num.get(num)
            if not l:
                continue
            title = clean_text(title_case_lesson(f"{num}. {l['title']}"))
            children.append({
                "id": f"lesson-{num:03d}",
                "title": {"en-US": title},
            })
        new_toc.append({"id": part_id, "title": existing["title"], "children": children})

    # Appendix is hand-curated; keep its existing structure.
    appendix = next((n for n in manifest["toc"] if n["id"] == "appendix"), None)
    if appendix:
        new_toc.append(appendix)

    manifest["toc"] = new_toc
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--pdf", type=Path, default=DEFAULT_PDF, help="Path to source PDF (downloaded if missing)")
    ap.add_argument("--lessons-only", action="store_true", help="Skip wiping; only rewrite content")
    args = ap.parse_args()

    pdf_path = ensure_pdf(args.pdf)
    doc = fitz.open(pdf_path)

    md_dir = BOOK_DIR / "en-US"
    img_dir = BOOK_DIR / "images"
    if not args.lessons_only:
        wipe(md_dir)
        wipe(img_dir)

    lessons = find_lessons(doc)
    if len(lessons) != 193:
        print(f"WARN: expected 193 lessons, found {len(lessons)}", file=sys.stderr)

    missing_images = []
    print(f"Importing {len(lessons)} lessons...", flush=True)
    for i, l in enumerate(lessons, 1):
        ok = import_lesson(doc, pdf_path, l, md_dir, img_dir)
        if not ok:
            missing_images.append(l["num"])
        if i % 25 == 0 or i == len(lessons):
            print(f"  {i}/{len(lessons)} lessons", flush=True)

    print(f"Importing {len(APPENDICES)} appendix chapters...", flush=True)
    for chapter_id, title, start, end in APPENDICES:
        ok = import_appendix(doc, pdf_path, chapter_id, title, start, end, md_dir, img_dir)
        if not ok:
            missing_images.append(chapter_id)

    regenerate_toc(lessons, BOOK_DIR / "book.json")

    print(f"\nDone.")
    print(f"  Markdown files: {len(list(md_dir.glob('*.md')))}")
    print(f"  Image files:    {len(list(img_dir.glob('*.webp')))}")
    if missing_images:
        print(f"  Without image:  {missing_images}")


if __name__ == "__main__":
    main()
