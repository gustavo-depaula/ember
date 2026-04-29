#!/usr/bin/env python3
"""Mechanical (lossless) cleanup pass on the raw split chapter files.

This handles only the fully programmatic, judgment-free transforms:
  - en-US: strip [an error...] SSI artifacts, soft hyphens, NBSP, leading-space
           paragraph indentation, repeated blank lines.
  - pt-BR: same plus strip the OCR running headers/footers from print page-breaks
           ("12 Catecismo Romano", "1º Artigo 8 1 89", "Catecismo Romano. | Parte:..."),
           strip standalone page-number lines.

What this does NOT do (left for per-file subagent cleanup):
  - heading restructure (# / ## / ###)
  - footnote extraction & markdown conversion
  - OCR word-level fixes (font/letter substitutions)
  - paragraph re-merging across line wraps
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "libraries" / "base" / "books" / "catechism-of-trent"


def clean_common(text: str) -> str:
    # Strip soft hyphens, NBSP, BOM
    text = text.replace("­", "")
    text = text.replace(" ", " ")
    text = text.replace("﻿", "")
    # Server-side include error message (en-US)
    text = re.sub(
        r"\[an error occurred while processing this directive\]\s*",
        "",
        text,
    )
    # Strip leading single-space (paragraph-indent artifact from HTML render)
    lines = text.split("\n")
    lines = [re.sub(r"^[ \t]+", "", ln) for ln in lines]
    # Collapse runs of blank lines
    out: list[str] = []
    blank = 0
    for ln in lines:
        if ln.strip() == "":
            blank += 1
            if blank <= 1:
                out.append("")
        else:
            blank = 0
            out.append(ln)
    return "\n".join(out).strip() + "\n"


PT_HEADER_RES = [
    # "12 Catecismo Romano", "12 Catecismo Romano. | Parte: Do Simbolo dos Apóstolos"
    re.compile(r"^\d{1,4}M?\s+Catecismo Romano.*$", re.M),
    # "Catecismo Romano — 30" (volume signature lines at end)
    re.compile(r"^Catecismo Romano\s*[—-]\s*\d+\s*$", re.M),
    # "1º Artigo 8 1 89", "1º Artigo 65 2-6 ; 9", "Nº Artigo 65 ..."
    re.compile(r"^[N1-9]º\s+Artigo[^\n]*\d[^\n]*$", re.M),
    # "1º Sacramento 8 ..." or just "1º Sacramento"
    re.compile(r"^[1-9]º\s+Sacramento[^\n]*$", re.M),
    # "1º Mandamento ..." running header
    re.compile(r"^[1-9]º\s+Mandamento[^\n]*$", re.M),
    # "Proêmio 85 3-7 81" / "Proêmio 84 8-10 83"
    re.compile(r"^Proêmio\s+8\d[^\n]*\d+\s*$", re.M),
    # Petitions: "I. Petição ...", "X. Amém 58 4-6 607"
    re.compile(r"^[IVX]+\.\s+(Petição|Amém|Padre)[^\n]*\d+\s*$", re.M),
    # Bare page-numbers / standalone short numerics (3 digits or fewer)
    re.compile(r"^\s*\d{1,4}\s*$", re.M),
    # "Do Simbolo dos Apóstolos" / "Os Sacramentos" / "Os Mandamentos" / "A Oração"
    # — running titles repeated mid-chapter (only if standalone short line)
    re.compile(r"^Do Simbolo dos Apóstolos\s*$", re.M),
    re.compile(r"^Os Sacramentos\s*$", re.M),
    re.compile(r"^Os Mandamentos\s*$", re.M),
    re.compile(r"^A Oração Dominical\s*$", re.M),
]


def clean_pt(text: str) -> str:
    for r in PT_HEADER_RES:
        text = r.sub("", text)
    return clean_common(text)


def clean_en(text: str) -> str:
    return clean_common(text)


def main() -> None:
    en_dir = BOOK_DIR / "en-US"
    pt_dir = BOOK_DIR / "pt-BR"

    n_en = 0
    for path in sorted(en_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        new = clean_en(text)
        path.write_text(new, encoding="utf-8")
        n_en += 1

    n_pt = 0
    for path in sorted(pt_dir.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        new = clean_pt(text)
        path.write_text(new, encoding="utf-8")
        n_pt += 1

    print(f"Cleaned {n_en} en-US + {n_pt} pt-BR files")


if __name__ == "__main__":
    main()
