"""Print glossary rows whose first cell matches a regex (accent-blind), evidence truncated.

usage: python3.13 grows.py '<regex>' [maxchars]
"""
import re
import sys
import unicodedata
from pathlib import Path

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

pat = re.compile(fold(sys.argv[1]))
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 400
text = (Path(__file__).resolve().parent.parent / 'glossary.md').read_text()
for n, line in enumerate(text.splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    head = fold(cells[1])
    if pat.search(head):
        out = line if len(line) <= limit else line[:limit] + ' …'
        print(f'{n}: {out}')
