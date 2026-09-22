"""Print glossary rows whose first cell matches any of the given accent-blind patterns."""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[1]
text = (root / 'glossary.md').read_text(encoding='utf-8')


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


pats = [re.compile(fold(p)) for p in sys.argv[1:]]
width = 1200
for n, line in enumerate(text.splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    head = fold(cells[1]) if len(cells) > 1 else ''
    if any(p.search(head) for p in pats):
        print(f'{n}: {line[:width]}')
        print()
