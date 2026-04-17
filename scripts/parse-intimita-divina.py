#!/usr/bin/env python3
"""
Parse the OCR'd text of Intimità Divina (6 volumes) into individual meditation files.

Strategy:
1. Read all 6 volumes sequentially
2. Use "Meditazione" headers as primary delimiters (~370 total)
3. Between each pair, find Colloquio to split body vs colloquy
4. Look backwards ~12 lines from each Meditazione for title (UPPERCASE lines) + PRESENZA DI DIO
5. Output each meditation as giorno-NNN.md
"""

import re
import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SOURCE_DIR = BASE / "content/libraries/carmelite/sources/italian-originals"
OUTPUT_DIR = BASE / "content/libraries/carmelite/books/intimita-divina/it"

VOLUMES = ["id_vol_I.txt", "id_vol_II.txt", "id_vol_III.txt",
           "id_vol_IV.txt", "id_vol_V.txt", "id_vol_VI.txt"]

MEDITAZIONE_RE = re.compile(r'^[|\s]*Meditazione[.,;:\s]*[^a-zA-Zà-ü]*$', re.IGNORECASE)
COLLOQUIO_RE = re.compile(r'^[|\s]*Colloquio[.,;:\s]*[^a-zA-Zà-ü]*$', re.IGNORECASE)
PRESENZA_RE = re.compile(
    r'(PRESENZA|raesenza|rassinza|Presenza|PRÈSENZA|Presbnza|enesenza|MeseNzA|mesenza|pnusanza|senza\s+pr)',
    re.IGNORECASE
)

# Page header patterns: "30 I SETTIMANA D'AVVENTO" or "4 - LA CARITÀ... 33"
# These have a page number at start or end (or both)
PAGE_HEADER_PATTERNS = [
    re.compile(r'^\d+\s+[IVX]+\s+SETTIMANA', re.IGNORECASE),       # "30 I SETTIMANA D'AVVENTO"
    re.compile(r'^\d+\s*[-–—]\s+.*\d+\s*[.:;]?\s*$'),              # "4 - TITLE 33"
    re.compile(r'^\d+\s+[A-ZÀ-Ü].*\s+\d+\s*$'),                   # "26 TITLE 33"
    re.compile(r'^[IVX]+\s+SETTIMANA', re.IGNORECASE),              # "I SETTIMANA D'AVVENTO"
    re.compile(r'^\d+\s+SETTIMANA', re.IGNORECASE),                 # "1 SETTIMANA D'AVVENTO"
    re.compile(r'^SETTIMANA\s+(D|DI)', re.IGNORECASE),              # "SETTIMANA D'AVVENTO"
    re.compile(r'^\d+\s+(Feste|FESTE)', re.IGNORECASE),             # "232 FESTE FISSE"
    re.compile(r'^(Feste|FESTE)\s+(fisse|FISSE|pIssE|vISSE)', re.IGNORECASE),
]


def read_all_volumes():
    all_lines = []
    vol_starts = {}
    for vol in VOLUMES:
        vol_starts[vol] = len(all_lines)
        path = SOURCE_DIR / vol
        with open(path, "r", encoding="utf-8") as f:
            all_lines.extend(f.readlines())
    return all_lines, vol_starts


def find_markers(lines, pattern):
    return [i for i, line in enumerate(lines) if pattern.match(line.strip())]


def is_page_header(line):
    stripped = line.strip()
    for pat in PAGE_HEADER_PATTERNS:
        if pat.search(stripped):
            return True
    return False


def is_title_candidate(line):
    """A line is a title candidate if it's mostly uppercase, not too long, not a page header."""
    stripped = line.strip()
    if not stripped or len(stripped) < 4:
        return False
    if is_page_header(stripped):
        return False
    if PRESENZA_RE.search(stripped):
        return False
    # Skip lines that are just numbers, Roman numerals, or OCR artifacts
    if re.match(r'^[\dIVXLCDM\s.,;:!?|«»()\-–—]+$', stripped):
        return False
    # Must have some alphabetic content
    alpha = [c for c in stripped if c.isalpha()]
    if len(alpha) < 4:
        return False
    # Must be mostly uppercase (>55%)
    upper_ratio = sum(1 for c in alpha if c.isupper()) / len(alpha)
    if upper_ratio < 0.55:
        return False
    # Filter out very long lines (likely paragraph text, not titles)
    if len(stripped) > 80:
        return False
    return True


def has_liturgical_ref(line):
    stripped = line.strip()
    return bool(re.search(
        r'(dom\.|domenica|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|'
        r'Avvento|Quaresima|Pasqua|Pentecoste|Epifania|Natale|Risurrezione|'
        r'Ascensione|Trinità|Settuagesima|Sessagesima|Quinquagesima|'
        r'Corpus Domini|Palme|Ceneri|gennaio|febbraio|marzo|aprile|'
        r'maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)',
        stripped, re.IGNORECASE
    ))


def extract_title_and_presenza(lines, med_idx):
    """
    Look backwards max 12 lines from Meditazione to extract title and PRESENZA.
    Returns (title, liturgical_ref, presenza_text)
    """
    search_start = max(0, med_idx - 14)

    # Find PRESENZA DI DIO
    presenza_line = None
    presenza_text = ""
    for i in range(med_idx - 1, search_start - 1, -1):
        if PRESENZA_RE.search(lines[i]):
            presenza_line = i
            plines = []
            for j in range(i, med_idx):
                s = lines[j].strip()
                if s and not MEDITAZIONE_RE.match(s):
                    plines.append(s)
            raw = " ".join(plines)
            # Remove "PRESENZA DI DIO. —" prefix (various OCR forms)
            raw = re.sub(r'^.*?DI\s+\w+\s*[.—–\-,]+\s*', '', raw, count=1)
            presenza_text = raw.strip()
            break

    # Look for title between search_start and PRESENZA (or med_idx)
    title_end = presenza_line if presenza_line else med_idx
    title_search_start = max(search_start, title_end - 10)

    title_parts = []
    liturgical_ref = ""

    for i in range(title_search_start, title_end):
        stripped = lines[i].strip()
        if not stripped:
            continue
        if is_title_candidate(stripped):
            # Clean trailing OCR artifacts
            cleaned = re.sub(r'\s*[.:;|]+\s*$', '', stripped)
            cleaned = re.sub(r'^\d+\s*[-–—]\s*', '', cleaned)  # Remove leading "4 - "
            cleaned = re.sub(r'\s+\d+\s*$', '', cleaned)  # Remove trailing page numbers
            if cleaned and len(cleaned) > 3:
                title_parts.append(cleaned)
        elif has_liturgical_ref(stripped) and not is_page_header(stripped):
            # Clean liturgical ref
            lr = re.sub(r'^\d+\s+', '', stripped)  # Remove leading page num
            lr = re.sub(r'\s+\d+\s*$', '', lr)  # Remove trailing page num
            liturgical_ref = lr.strip()

    title = " ".join(title_parts).strip()
    # Final cleanup
    title = re.sub(r'\s+', ' ', title)

    return title, liturgical_ref, presenza_text


def clean_text_block(lines, start, end):
    """Extract text, skipping page headers."""
    text_lines = []
    for i in range(start, min(end, len(lines))):
        stripped = lines[i].strip()
        if is_page_header(stripped):
            continue
        text_lines.append(lines[i].rstrip())
    return "\n".join(text_lines).strip()


def format_markdown(seq_num, title, liturgical_ref, presenza, med_text, col_text):
    parts = []

    heading = f"## {seq_num}"
    if title:
        heading += f" — {title}"
    parts.append(heading)

    if liturgical_ref:
        parts.append(f"*{liturgical_ref}*")

    parts.append("")

    if presenza:
        parts.append("### Presenza di Dio")
        parts.append("")
        parts.append(presenza)
        parts.append("")

    if med_text:
        parts.append("### Meditazione")
        parts.append("")
        parts.append(med_text)
        parts.append("")

    if col_text:
        parts.append("### Colloquio")
        parts.append("")
        parts.append(col_text)

    return "\n".join(parts) + "\n"


def main():
    print("Reading all volumes...")
    lines, vol_starts = read_all_volumes()
    print(f"Total lines: {len(lines)}")

    print("Finding markers...")
    med_indices = find_markers(lines, MEDITAZIONE_RE)
    col_indices = find_markers(lines, COLLOQUIO_RE)

    # Filter out any Meditazione markers in front matter (before line 700 of vol I)
    # The front matter includes index, preface, abbreviations
    first_real = vol_starts.get("id_vol_I.txt", 0) + 700
    med_indices = [i for i in med_indices if i >= first_real]

    print(f"Meditazione markers: {len(med_indices)}")
    print(f"Colloquio markers: {len(col_indices)}")

    # Build colloquio lookup for fast searching
    col_set = sorted(col_indices)

    meditations = []
    for idx, med_line in enumerate(med_indices):
        next_med_line = med_indices[idx + 1] if idx + 1 < len(med_indices) else len(lines)

        # Find colloquio between this and next Meditazione
        col_line = None
        for c in col_set:
            if med_line < c < next_med_line:
                col_line = c
                break

        # Extract title and PRESENZA (look backwards ~12 lines)
        title, liturgical_ref, presenza = extract_title_and_presenza(lines, med_line)

        # Extract meditation text
        med_text_end = col_line if col_line else next_med_line
        med_text = clean_text_block(lines, med_line + 1, med_text_end)

        # Extract colloquio text
        col_text = ""
        if col_line:
            col_text = clean_text_block(lines, col_line + 1, next_med_line)

        seq_num = idx + 1
        meditations.append({
            "index": seq_num,
            "title": title,
            "liturgical_ref": liturgical_ref,
            "presenza": presenza,
            "meditation_text": med_text,
            "colloquio_text": col_text,
            "med_line": med_line,
            "col_line": col_line,
        })

    # Report
    print(f"\nParsed {len(meditations)} meditations")
    titled = sum(1 for m in meditations if m["title"])
    print(f"With title: {titled}")
    print(f"Without title: {len(meditations) - titled}")

    print("\n--- First 15 meditations ---")
    for m in meditations[:15]:
        med_w = len(m["meditation_text"].split())
        col_w = len(m["colloquio_text"].split())
        print(f"  giorno-{m['index']:03d}: {m['title'][:55] if m['title'] else '(no title)'} "
              f"| {med_w}w+{col_w}w")

    # Print untitled
    untitled = [m for m in meditations if not m["title"]]
    if untitled:
        print(f"\n--- Untitled ({len(untitled)}) ---")
        for m in untitled[:20]:
            start = max(0, m['med_line'] - 6)
            ctx = [lines[j].strip() for j in range(start, m['med_line']) if lines[j].strip()]
            print(f"  giorno-{m['index']:03d} (L{m['med_line']}): {' | '.join(ctx[-3:])[:90]}")

    # Write files
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for m in meditations:
        filepath = OUTPUT_DIR / f"giorno-{m['index']:03d}.md"
        md = format_markdown(
            m["index"], m["title"], m["liturgical_ref"],
            m["presenza"], m["meditation_text"], m["colloquio_text"]
        )
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md)

    print(f"\nWrote {len(meditations)} files to {OUTPUT_DIR}")

    # Metadata JSON
    meta_path = SOURCE_DIR / "meditations-metadata.json"
    meta = []
    for m in meditations:
        meta.append({
            "index": m["index"],
            "title": m["title"],
            "liturgical_ref": m["liturgical_ref"],
            "file": f"giorno-{m['index']:03d}.md",
            "med_words": len(m["meditation_text"].split()),
            "col_words": len(m["colloquio_text"].split()),
        })
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print(f"Wrote metadata to {meta_path}")

    total_w = sum(m["med_words"] + m["col_words"] for m in meta)
    print(f"\nTotal words: {total_w}")

    # Check for problematic entries
    short = [m for m in meta if m["med_words"] < 50]
    if short:
        print(f"\nShort meditations (<50w): {len(short)}")
        for m in short[:10]:
            print(f"  {m['file']}: {m['med_words']}w | {m['title'][:50]}")


if __name__ == "__main__":
    main()
