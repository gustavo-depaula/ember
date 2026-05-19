#!/usr/bin/env python3
"""Audit cleanup quality for all 84 Catechism of Trent chapter files.

Heuristics catch common cleanup deficits:
  - Missing `# ` chapter heading at top
  - Too few `##` section headings (fewer than 3 in a long chapter)
  - Hyphenated word-splits across spaces (`forçosamen- te`, `cmpre- garem`) — pt-BR OCR artifact
  - Mid-line `Catecismo Romano` / `1 Parte:` page-break artifacts
  - Dense bibliographic citation chunks (e.g., `; Gal 3, 27; Eph 5, 27;`) inline mid-text
  - Stray smart-quote pairs at line starts (marginalia indicators)
  - OCR character glitches (`cm `, ` c `, `Santissima`, `intima`, `picdade`)
  - Lines starting with `*`, `'`, `"` followed by a number (footnote-marker artifacts)

Each file gets a score and a list of issues. Top of stdout: summary by language.
Bottom: per-file detail for files that fail the quality bar.
"""

from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BOOK_DIR = ROOT / "content" / "libraries" / "base" / "books" / "trent-catechism"

# Pass thresholds (file with fewer than these issues passes)
MAX_HYPHEN_SPLITS = 2
MAX_PAGE_HEADERS = 0
MAX_OCR_GLITCHES = 5
MIN_SECTION_HEADINGS_LONG = 4   # for files >5000 chars
MIN_SECTION_HEADINGS_SHORT = 1  # for shorter files

# Patterns
HYPHEN_SPLIT_RE = re.compile(r"\b\w+- \w+\b")  # word-(space)other → likely line-break artifact
PAGE_HEADER_RE = re.compile(
    r"(?:^|\n)\s*(?:\d{1,4}\s+\*?\s*)?Catecismo Romano(?:\.|\s)|"
    r"(?:^|\n)\s*[IVX]+\.?\s*Parte:|"
    r"(?:^|\n)\s*(?:Iv|IV|V|VI|VII|VIII)\.\s+Da\s+\w+\s+\d",
)
OCR_GLITCHES = [
    re.compile(r"\bcm\b"),               # should be "em"
    re.compile(r"\bSantissima\b"),       # should be Santíssima
    re.compile(r"\bintima\b"),           # should be íntima (in pt-BR contexts)
    re.compile(r"\bpicdade\b"),          # should be piedade
    re.compile(r"\bPicdade\b"),
    re.compile(r"\bcle\b"),              # should be ele
    re.compile(r"\bscu\b"),              # should be seu
    re.compile(r"\bapora\b"),            # should be agora
    re.compile(r'E"\s'),                 # should be É (followed by space)
    re.compile(r"\bMis-\s*oa\s*térios\b"),  # specific OCR garble
    re.compile(r"\bdentriom\b"),         # specific OCR garble
    re.compile(r"\bTudo-Podceroso\b"),
    re.compile(r"\bcmpregar"),
    re.compile(r"\bExpirito\b"),         # should be Espírito (occurs as Espirito too — that one is acceptable)
]
INLINE_CITATION_BLOCK_RE = re.compile(
    r"(?:[A-Z][a-z]+\s+\d+,?\s*\d+(?:[\-–]\d+)?[;,]\s*){2,}",
)
FOOTNOTE_MARKER_INLINE_RE = re.compile(r"(?<![\^])\*\s*\d{1,3}\b|\B\'\d{1,3}\b")


def audit_file(path: Path) -> tuple[int, dict]:
    text = path.read_text(encoding="utf-8")
    issues: dict[str, int] = {}
    issues["chars"] = len(text)
    issues["lines"] = text.count("\n") + 1
    # Count both `## ` and `### ` as section structure (both are valid hierarchy markers)
    issues["section_headings"] = len(re.findall(r"(?m)^##+ ", text))
    issues["chapter_heading_ok"] = 1 if text.lstrip().startswith("# ") else 0
    issues["hyphen_splits"] = len(HYPHEN_SPLIT_RE.findall(text))
    issues["page_headers"] = len(PAGE_HEADER_RE.findall(text))
    issues["ocr_glitches"] = sum(len(p.findall(text)) for p in OCR_GLITCHES)
    # Inline citations only count in the BODY (not in [^N]: footnote definitions)
    body_lines = [ln for ln in text.split("\n") if not re.match(r"^\[\^\d+\]:", ln)]
    body = "\n".join(body_lines)
    issues["inline_citations"] = len(INLINE_CITATION_BLOCK_RE.findall(body))
    issues["fn_marker_inline"] = len(FOOTNOTE_MARKER_INLINE_RE.findall(text))
    issues["ends_with_footnotes"] = 1 if re.search(r"\n\[\^\d+\]:", text) else 0

    # Score: lower = better. Each violation contributes points.
    score = 0
    if not issues["chapter_heading_ok"]:
        score += 100
    min_h = MIN_SECTION_HEADINGS_LONG if issues["chars"] > 5000 else MIN_SECTION_HEADINGS_SHORT
    if issues["section_headings"] < min_h:
        score += (min_h - issues["section_headings"]) * 5
    if issues["hyphen_splits"] > MAX_HYPHEN_SPLITS:
        score += (issues["hyphen_splits"] - MAX_HYPHEN_SPLITS) * 2
    if issues["page_headers"] > MAX_PAGE_HEADERS:
        score += issues["page_headers"] * 5
    if issues["ocr_glitches"] > MAX_OCR_GLITCHES:
        score += issues["ocr_glitches"] - MAX_OCR_GLITCHES
    if issues["inline_citations"] > 1:
        score += (issues["inline_citations"] - 1) * 2
    if issues["fn_marker_inline"] > 5:
        score += (issues["fn_marker_inline"] - 5)
    return score, issues


def main() -> int:
    threshold = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    by_lang: dict[str, list[tuple[int, str, dict]]] = defaultdict(list)
    for lang in ("en-US", "pt-BR"):
        lang_dir = BOOK_DIR / lang
        for path in sorted(lang_dir.glob("*.md")):
            score, issues = audit_file(path)
            by_lang[lang].append((score, path.name, issues))

    # Summary
    for lang, results in by_lang.items():
        n_total = len(results)
        n_pass = sum(1 for s, _, _ in results if s <= threshold)
        n_fail = n_total - n_pass
        print(f"{lang}: {n_pass}/{n_total} pass (threshold ≤{threshold}), {n_fail} need work")

    print()

    # Per-file detail for failing files
    print(f"=== Files scoring > {threshold} (need cleanup) ===")
    for lang, results in by_lang.items():
        for score, name, issues in sorted(results, key=lambda r: -r[0]):
            if score <= threshold:
                break
            issues_str = (
                f"hd={issues['chapter_heading_ok']} "
                f"sec={issues['section_headings']} "
                f"hyph={issues['hyphen_splits']} "
                f"pg={issues['page_headers']} "
                f"ocr={issues['ocr_glitches']} "
                f"cit={issues['inline_citations']} "
                f"fn={issues['fn_marker_inline']}"
            )
            print(f"  {lang}/{name:<35} score={score:>4}  ({issues_str}) chars={issues['chars']:,}")

    print()
    print(f"=== Top-scored (cleanest) examples ===")
    for lang, results in by_lang.items():
        sorted_pass = sorted([(s, n) for s, n, _ in results if s <= threshold])[:3]
        for score, name in sorted_pass:
            print(f"  {lang}/{name:<35} score={score}")

    # Exit non-zero if any file fails
    any_fail = any(s > threshold for results in by_lang.values() for s, _, _ in results)
    return 1 if any_fail else 0


if __name__ == "__main__":
    sys.exit(main())
