#!/usr/bin/env python3
"""Split the Catechism of Trent sources into per-chapter raw .md files.

Sources:
  - en-US: McHugh & Callan 1923 (catholicapologetics.info, 42 .shtml pages, already
           split by `=== PAGE N: <filename> ===` markers in the source .txt)
  - pt-BR: Pires Martins 1951 (Internet Archive djvu.txt, single OCR file split here
           by absolute line ranges identified via grep for CAPITULO/PARTE markers)

Output: 42 raw .md files per language at content/libraries/base/books/catechism-of-trent/
        {en-US,pt-BR}/{chapter-id}.md. The output is intentionally raw — minimal cleanup,
        body text preserved verbatim — so a downstream cleanup pass (parallel subagents
        per the import-book skill) can add proper headings, fix OCR artifacts in the
        Portuguese, convert footnotes, and so on.

Re-runnable: deletes and recreates the per-language directories.
"""

from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / "content" / "libraries" / "base"
SRC_EN = BASE / "sources" / "english-originals" / "catechism-of-trent.txt"
SRC_PT = BASE / "sources" / "portuguese-originals" / "catechism-of-trent.txt"
BOOK_DIR = BASE / "books" / "catechism-of-trent"

# 42 canonical chapters. The IDs are shared across both languages so the TOC can
# reference the same id for matched content. Part IV in Pires Martins originally
# has 17 chapters (the 8 introductory chapters on prayer in general are kept as a
# single combined file `prayer-intro.md` so that both languages have parallel TOCs).

# (chapter_id, en_page_filename or None)
EN_PAGES: list[tuple[str, str]] = [
    ("preface", "Preface.shtml"),
    ("creed-intro", "ApostlesCreed00.shtml"),
    ("creed-01", "ApostlesCreed01.shtml"),
    ("creed-02", "ApostlesCreed02.shtml"),
    ("creed-03", "ApostlesCreed03.shtml"),
    ("creed-04", "ApostlesCreed04.shtml"),
    ("creed-05", "ApostlesCreed05.shtml"),
    ("creed-06", "ApostlesCreed06.shtml"),
    ("creed-07", "ApostlesCreed07.shtml"),
    ("creed-08", "ApostlesCreed08.shtml"),
    ("creed-09", "ApostlesCreed09.shtml"),
    ("creed-10", "ApostlesCreed10.shtml"),
    ("creed-11", "ApostlesCreed11.shtml"),
    ("creed-12", "ApostlesCreed12.shtml"),
    ("sacraments-intro", "Holy7Sacraments.shtml"),
    ("sacrament-baptism", "Holy7Sacraments-Baptism.shtml"),
    ("sacrament-confirmation", "Holy7Sacraments-Confirmation.shtml"),
    ("sacrament-eucharist", "Holy7Sacraments-Eucharist.shtml"),
    ("sacrament-penance", "Holy7Sacraments-Penance.shtml"),
    ("sacrament-extreme-unction", "Holy7Sacraments-Unction.shtml"),
    ("sacrament-holy-orders", "Holy7Sacraments-Orders.shtml"),
    ("sacrament-matrimony", "Holy7Sacraments-Matrimony.shtml"),
    ("decalogue-intro", "TenCommandments.shtml"),
    ("commandment-01", "TenCommandments-first.shtml"),
    ("commandment-02", "TenCommandments-second.shtml"),
    ("commandment-03", "TenCommandments-third.shtml"),
    ("commandment-04", "TenCommandments-fourth.shtml"),
    ("commandment-05", "TenCommandments-fifth.shtml"),
    ("commandment-06", "TenCommandments-sixth.shtml"),
    ("commandment-07", "TenCommandments-seventh.shtml"),
    ("commandment-08", "TenCommandments-eighth.shtml"),
    ("commandment-09-10", "TenCommandments-ninth-tenth.shtml"),
    ("prayer-intro", "TheLordsPrayer.shtml"),
    ("prayer-our-father", "TheLordsPrayer00.shtml"),
    ("petition-01", "TheLordsPrayer01.shtml"),
    ("petition-02", "TheLordsPrayer02.shtml"),
    ("petition-03", "TheLordsPrayer03.shtml"),
    ("petition-04", "TheLordsPrayer04.shtml"),
    ("petition-05", "TheLordsPrayer05.shtml"),
    ("petition-06", "TheLordsPrayer06.shtml"),
    ("petition-07", "TheLordsPrayer07.shtml"),
    ("amen", "TheLordsPrayerAmen.shtml"),
]

# (chapter_id, start_line_inclusive, end_line_inclusive)  — 1-indexed
PT_RANGES: list[tuple[str, int, int]] = [
    ("preface", 4630, 5190),
    # Part I — Símbolo
    ("creed-intro", 5194, 5341),
    ("creed-01", 5342, 6416),
    ("creed-02", 6417, 7092),
    ("creed-03", 7093, 7660),
    ("creed-04", 7661, 8418),
    ("creed-05", 8419, 9174),
    ("creed-06", 9175, 9572),
    ("creed-07", 9573, 10029),
    ("creed-08", 10030, 10538),
    ("creed-09", 10539, 11758),
    ("creed-10", 11759, 12153),
    ("creed-11", 12154, 12885),
    ("creed-12", 12886, 13477),
    # Part II — Sacramentos
    ("sacraments-intro", 13478, 14759),
    ("sacrament-baptism", 14760, 17146),
    ("sacrament-confirmation", 17147, 18003),
    ("sacrament-eucharist", 18004, 21094),
    ("sacrament-penance", 21095, 23980),
    ("sacrament-extreme-unction", 23981, 24613),
    ("sacrament-holy-orders", 24614, 25892),
    ("sacrament-matrimony", 25893, 27044),
    # Part III — Decálogo
    ("decalogue-intro", 27045, 27584),
    ("commandment-01", 27585, 28614),
    ("commandment-02", 28615, 29480),
    ("commandment-03", 29481, 30264),
    ("commandment-04", 30265, 31000),
    ("commandment-05", 31001, 31708),
    ("commandment-06", 31709, 32206),
    ("commandment-07", 32207, 33065),
    ("commandment-08", 33066, 33837),
    ("commandment-09-10", 33838, 34465),
    # Part IV — Oração (Pires Martins Cap I-VIII compressed into prayer-intro)
    ("prayer-intro", 34466, 35969),
    ("prayer-our-father", 35970, 36731),
    ("petition-01", 36732, 37030),
    ("petition-02", 37031, 37618),
    ("petition-03", 37619, 38279),
    ("petition-04", 38280, 38987),
    ("petition-05", 38988, 39775),
    ("petition-06", 39776, 40532),
    ("petition-07", 40533, 41028),
    ("amen", 41029, 41315),
]


def split_english() -> dict[str, str]:
    """Return {chapter_id: body_text} for all 42 English chapters."""
    text = SRC_EN.read_text(encoding="utf-8")
    # Split by page separators
    pages = re.split(r"\n*---\n*", text)
    by_filename: dict[str, str] = {}
    for page in pages:
        page = page.strip()
        if not page:
            continue
        # Header lines: `=== PAGE N: <filename> ===\n=== TITLE: <title> ===`
        m = re.match(
            r"=== PAGE \d+: (\S+) ===\s*\n=== TITLE: ([^=]+) ===\s*\n*",
            page,
        )
        if not m:
            print(f"  WARN: page has no header: {page[:80]!r}")
            continue
        filename = m.group(1)
        body = page[m.end():].strip()
        # Strip server-side include error messages
        body = re.sub(
            r"\[an error occurred while processing this directive\]\s*",
            "",
            body,
        )
        by_filename[filename] = body

    out: dict[str, str] = {}
    for cid, fname in EN_PAGES:
        if fname not in by_filename:
            print(f"  MISSING en-US page: {fname} (chapter {cid})")
            continue
        out[cid] = by_filename[fname]
    return out


def split_portuguese() -> dict[str, str]:
    """Return {chapter_id: body_text} for all 42 Portuguese chapters."""
    lines = SRC_PT.read_text(encoding="utf-8").split("\n")
    out: dict[str, str] = {}
    for cid, lo, hi in PT_RANGES:
        # Convert to 0-indexed slice
        chunk = "\n".join(lines[lo - 1 : hi]).strip()
        out[cid] = chunk
    return out


def write_chapters(lang: str, chapters: dict[str, str]) -> int:
    out_dir = BOOK_DIR / lang
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    for cid, body in chapters.items():
        path = out_dir / f"{cid}.md"
        path.write_text(body + "\n", encoding="utf-8")
        print(f"  [{lang}/{cid}] {len(body):,} chars → {path.name}")
    return len(chapters)


def main() -> None:
    print("Splitting English (McHugh & Callan)…")
    en = split_english()
    print(f"  → {len(en)} chapters")

    print("\nSplitting Portuguese (Pires Martins)…")
    pt = split_portuguese()
    print(f"  → {len(pt)} chapters")

    print("\nWriting English chapters…")
    n_en = write_chapters("en-US", en)

    print("\nWriting Portuguese chapters…")
    n_pt = write_chapters("pt-BR", pt)

    print(f"\nDone. {n_en} en-US + {n_pt} pt-BR chapter files written.")


if __name__ == "__main__":
    main()
