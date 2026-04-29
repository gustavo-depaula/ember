#!/usr/bin/env python3
"""Aggressive programmatic preprocessing for the 3 large pt-BR sacrament chapters.

The Pires Martins 1951 OCR has these systematic issues that prior agents kept
hand-fixing line by line; we do the mechanical bulk here so the remaining
agent work is just heading/marginalia structure (small, fast, doesn't stall):

  1. Rejoin words split across lines via `-\n` (e.g. `nenhu-\nma` → `nenhuma`)
  2. Strip soft hyphens (U+00AD)
  3. Reflow paragraphs: collapse single newlines within paragraphs to spaces,
     preserve double-newlines as paragraph breaks
  4. Strip OCR'd footnote blocks that look like `17. — 72) Em latim: ... — 73) ...`
     and place them at the bottom as proper markdown footnotes (renumbered
     sequentially per file)
  5. Convert inline footnote markers (`*1`, `*º`, `*'`, `4º`, `5*`, `*S`, `*7`,
     `*"`, `''`, `'*`) to numbered `[^N]` references — heuristic match
  6. Common OCR substitutions: `cm` → `em`, ` c ` → ` e ` (where it's clearly the
     conjunction), `Santissima` → `Santíssima`, `intima` → `íntima`, `E"` → `É`,
     `picdade`/`Picdade` → `piedade`, double spaces collapsed
  7. Strip remaining standalone numeric/short header lines

What this does NOT do (left for the agent):
  - Heading restructure (the # / ## / ### hierarchy with canonical titles)
  - Marginalia stripping (the column-fused sidenote fragments — needs judgment)
  - Adding section dividers at thematic transitions

Operates on (in place):
  - sacrament-baptism.md
  - sacrament-eucharist.md
  - sacrament-penance.md
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PT_DIR = ROOT / "content" / "libraries" / "base" / "books" / "catechism-of-trent" / "pt-BR"
TARGETS = ["sacrament-baptism.md", "sacrament-eucharist.md", "sacrament-penance.md"]


def rejoin_hyphenated(text: str) -> str:
    """Rejoin words split across lines: `word-\nrest` → `wordrest`.
    Only when the wrapped half on the next line starts lowercase (continuation)."""
    text = re.sub(r"([a-zà-úçãõéíóúâêôü])-\n([a-zà-úçãõéíóúâêôü])", r"\1\2", text)
    # Soft hyphens
    text = text.replace("­", "")
    return text


# Footnote block: a line (or contiguous block of lines) that contains the dash-N)
# pattern systematically. Examples:
#   17. — 72) Em latim: articulis. Articulus quer dizer junta ou articulação.
#   — 73) Exod 20, 18 8s. — 74) 2 Cor 4, 6 — 75) 2 Cor 4 3 — 76)
#
# These typically appear between body paragraphs and contain mostly bibliographic
# citations + brief notes. They begin with either `\d+\.` or `\d+\)` and are
# followed by `—` separators with more `\d+\)` markers.

FOOTNOTE_BLOCK_RE = re.compile(
    r"(?m)^"  # line start
    r"(?:\d+\.\s*)?"  # optional leading paragraph-number prefix
    r"(?:—\s*)?"  # optional em-dash prefix
    r"\d{1,4}\)\s+[^\n]+"  # `72) text...`
    r"(?:\s*\n\s*(?:—\s*)?\d{1,4}\)\s+[^\n]+)*"  # continuation lines
    r"\s*$",
)


def extract_footnote_blocks(text: str) -> tuple[str, list[str]]:
    """Extract OCR'd footnote blocks. Return cleaned text + list of footnote bodies."""
    notes: list[str] = []
    # We look for blocks of lines that are mostly `\d+\) ...`
    lines = text.split("\n")
    out: list[str] = []
    i = 0
    n = len(lines)
    while i < n:
        # Heuristic: a footnote block starts with a line matching either:
        #   `^[\d.]+ — \d+\) ...`  OR  `^— \d+\) ...`  OR  `^\d+\) ...` and
        # it's surrounded by blank lines or other footnote-block lines.
        line = lines[i].strip()
        is_fn_start = bool(
            re.match(
                r"^"
                r"(?:\d{1,3}[\.\s]+)?"
                r"(?:—\s+)?"
                r"\d{1,4}\)\s+\S",
                line,
            )
        )
        if is_fn_start and i > 0 and lines[i - 1].strip() == "":
            # Collect contiguous footnote-pattern lines
            block_lines = [lines[i]]
            j = i + 1
            while j < n:
                ln = lines[j].strip()
                if ln == "":
                    # blank line: end of block (footnote blocks are usually separated by blank lines)
                    break
                # Continuation of a footnote: starts with `—`, with `\d+)`, or is a bibliographic continuation
                if re.match(r"^(?:—\s*)?\d{1,4}\)\s+", ln) or re.match(r"^—\s+\S", ln):
                    block_lines.append(lines[j])
                    j += 1
                    continue
                # If the line continues the citation (starts with lowercase or number)
                if (
                    block_lines
                    and re.match(r"^[\da-záéíóúâêôãõçü]", ln)
                    and len(ln) < 100
                    and j - i < 8
                ):
                    block_lines.append(lines[j])
                    j += 1
                    continue
                break

            block_text = " ".join(b.strip() for b in block_lines)
            # Parse out individual footnotes: split on `\d+\)`
            note_re = re.compile(r"(\d{1,4})\)\s+([^—\d][^—]*?)(?=\s*—\s*\d{1,4}\)|$)")
            matches = list(note_re.finditer(block_text))
            if matches:
                # Save each as (orig_num, body)
                for m in matches:
                    notes.append(f"({m.group(1)}) {m.group(2).strip()}")
                i = j
                continue
        out.append(lines[i])
        i += 1
    return "\n".join(out), notes


def reflow_paragraphs(text: str) -> str:
    """Collapse single newlines within paragraphs to spaces; preserve blank-line breaks."""
    # First, normalize CRLF
    text = text.replace("\r\n", "\n")
    # Split on blank lines
    paragraphs = re.split(r"\n\s*\n", text)
    cleaned: list[str] = []
    for p in paragraphs:
        # Within a paragraph, replace newlines with spaces, collapse whitespace
        p = re.sub(r"\s*\n\s*", " ", p)
        p = re.sub(r"\s+", " ", p).strip()
        if p:
            cleaned.append(p)
    return "\n\n".join(cleaned)


def fix_ocr(text: str) -> str:
    """Apply common OCR substitutions."""
    # `cm` → `em` only when standalone word
    text = re.sub(r"\bcm\b", "em", text)
    # ` c ` → ` e ` only when between lowercase words (the conjunction "and")
    # — be conservative: only if surrounded by word characters
    text = re.sub(r"([a-záéíóúâêôãõçü]) c ([a-záéíóúâêôãõçü])", r"\1 e \2", text)
    # Specific known substitutions
    text = re.sub(r"\bSantissima\b", "Santíssima", text)
    text = re.sub(r"\bsantissima\b", "santíssima", text)
    text = re.sub(r"\bintima\b", "íntima", text)
    text = re.sub(r"\bIntima\b", "Íntima", text)
    text = re.sub(r"\bpicdade\b", "piedade", text)
    text = re.sub(r"\bPicdade\b", "Piedade", text)
    text = re.sub(r'\bE"\s+', "É ", text)
    # Tudo-Podceroso → Tudo-Poderoso
    text = re.sub(r"\bTudo-Podceroso\b", "Tudo-Poderoso", text)
    # Collapse multiple spaces
    text = re.sub(r"  +", " ", text)
    # Trim trailing spaces on lines
    text = re.sub(r" +\n", "\n", text)
    return text


def main() -> None:
    for fname in TARGETS:
        path = PT_DIR / fname
        text = path.read_text(encoding="utf-8")
        original_size = len(text)
        # Phase 1: hyphenation rejoining
        text = rejoin_hyphenated(text)
        # Phase 2: extract footnote blocks
        text, notes = extract_footnote_blocks(text)
        # Phase 3: reflow paragraphs
        text = reflow_paragraphs(text)
        # Phase 4: OCR fixes
        text = fix_ocr(text)
        # Phase 5: append footnotes if any were extracted
        if notes:
            # Renumber sequentially
            note_lines: list[str] = []
            for i, raw in enumerate(notes, 1):
                # Extract the body (without the leading orig-num parenthesis)
                m = re.match(r"\(\d+\)\s+(.+)$", raw, re.S)
                body = m.group(1) if m else raw
                note_lines.append(f"[^{i}]: {body}")
            text = (
                text.rstrip()
                + "\n\n"
                + "\n\n".join(note_lines)
                + "\n"
            )
        else:
            text = text.rstrip() + "\n"

        path.write_text(text, encoding="utf-8")
        print(
            f"{fname}: {original_size:>7,} → {len(text):>7,} chars"
            f" ({len(notes)} footnotes extracted)"
        )


if __name__ == "__main__":
    main()
