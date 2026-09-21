"""Accent-blind grep over DO's Latin (horas + missa), outside the psalm files: python3.13 grep_do.py '<regex>' ...
Prints file:line and the line (cut at 220 chars), and a count per pattern. Read-only."""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


files = [p for sub in ('horas/Latin', 'missa/Latin') for p in (root / sub).rglob('*.txt') if 'Psalmorum' not in p.parts]
for pattern in sys.argv[1:]:
    regex = re.compile(pattern)
    print(f'## {pattern}')
    count = 0
    for path in sorted(files):
        for n, line in enumerate(path.read_text(encoding='utf-8', errors='replace').splitlines(), 1):
            if regex.search(plain(line)):
                count += 1
                print(f'{path.relative_to(root)}:{n}: {line.strip()[:220]}')
    print(f'-- {count} lines\n')
