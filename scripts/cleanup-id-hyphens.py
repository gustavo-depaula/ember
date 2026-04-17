#!/usr/bin/env python3
"""
Cleanup hyphenated line breaks in Intimità Divina markdown files.
Merges "word-\n" + continuation into a single word.
Also removes stray page-header lines that slipped through the parser.
"""

import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
IT_DIR = BASE / "content/libraries/carmelite/books/intimita-divina/it"

PAGE_HEADER_PATTERNS = [
    re.compile(r'^\d+\s+[IVX]+\s+SETTIMANA', re.IGNORECASE),
    re.compile(r'^[IVX]+\s+[-–—]\s+[A-ZÀ-Ü].*\s+\d+\s*$'),
    re.compile(r'^\d+\s+[A-ZÀ-Ü].*\s+\d+\s*$'),
    re.compile(r'^[IVX]+\s+SETTIMANA', re.IGNORECASE),
    re.compile(r'^\d+\s+SETTIMANA', re.IGNORECASE),
    re.compile(r'^SETTIMANA\s+(D|DI)', re.IGNORECASE),
    re.compile(r'^\d+\s+(Feste|FESTE)', re.IGNORECASE),
    re.compile(r'^(Feste|FESTE)\s+(fisse|FISSE|pIssE|vISSE)', re.IGNORECASE),
    # Roman numeral section headers like "XII - IL TRATTO INTIMO CON DIO"
    re.compile(r'^[IVXLCDM]+\s*[-–—]\s+[A-ZÀ-Ü\s]{5,}\d*\s*$'),
    # Page numbers on their own line
    re.compile(r'^\d{1,3}\s*$'),
    # Lines like "cia 1 SETTIMANA DOPO PASQUA"
    re.compile(r'^[a-zà-ü]{1,5}\s+\d+\s+SETTIMANA', re.IGNORECASE),
    # Lines like "XXXI + CARITÀ FR UMILTÀ 211"
    re.compile(r'^[IVXLCDM]+\s*[+*]\s+[A-ZÀ-Ü].*\d+\s*$'),
]


def is_page_header(line):
    stripped = line.strip()
    if not stripped:
        return False
    for pat in PAGE_HEADER_PATTERNS:
        if pat.search(stripped):
            return True
    return False


def fix_hyphens(text):
    """Merge hyphenated line breaks: 'word-\\n' + 'rest' -> 'wordrest'"""
    lines = text.split('\n')
    result = []
    i = 0
    merges = 0
    while i < len(lines):
        line = lines[i]
        # Check if line ends with a hyphenated word break
        # Match: letter + hyphen at end of line, next line starts with lowercase
        if (i + 1 < len(lines) and
            re.search(r'[a-zà-üA-ZÀ-Ü]-\s*$', line) and
            lines[i + 1].strip() and
            lines[i + 1].strip()[0].islower()):
            # Merge: remove trailing hyphen and join with next line
            merged = re.sub(r'-\s*$', '', line) + lines[i + 1].strip()
            result.append(merged)
            merges += 1
            i += 2
        else:
            result.append(line)
            i += 1
    return '\n'.join(result), merges


def remove_page_headers(text):
    """Remove page header lines from body text (not from ## heading or ### headers)."""
    lines = text.split('\n')
    result = []
    removed = 0
    for line in lines:
        stripped = line.strip()
        # Keep heading lines, section headers, and empty lines
        if stripped.startswith('#') or not stripped:
            result.append(line)
            continue
        if is_page_header(stripped):
            removed += 1
            continue
        result.append(line)
    return '\n'.join(result), removed


def collapse_blank_lines(text):
    """Collapse 3+ consecutive blank lines to 2."""
    return re.sub(r'\n{4,}', '\n\n\n', text)


total_merges = 0
total_removed = 0
files_changed = 0

for md_file in sorted(IT_DIR.glob("giorno-*.md")):
    original = md_file.read_text()
    text = original

    text, merges = fix_hyphens(text)
    text, removed = remove_page_headers(text)
    text = collapse_blank_lines(text)

    if text != original:
        md_file.write_text(text)
        files_changed += 1
        total_merges += merges
        total_removed += removed
        if merges > 0 or removed > 0:
            print(f"  {md_file.name}: {merges} hyphens, {removed} headers")

print(f"\nTotal: {files_changed} files changed, {total_merges} hyphens merged, {total_removed} headers removed")
