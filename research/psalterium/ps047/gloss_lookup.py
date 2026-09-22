"""Print glossary rows whose first cell (accent-folded) contains any of the given stems."""
import sys
import unicodedata
from pathlib import Path

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

root = Path(__file__).resolve().parent.parent
lines = (root / 'glossary.md').read_text(encoding='utf-8').splitlines()
stems = [fold(a) for a in sys.argv[1:] if not a.startswith('--')]
full = '--full' in sys.argv
width = 10000 if full else 700
for i, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    first = fold(cells[1]) if len(cells) > 1 else ''
    for s in stems:
        if s in first:
            print(f'{i}: {line[:width]}')
            print()
            break
