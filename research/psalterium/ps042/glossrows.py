"""Print glossary rows whose first column matches any of the given (accent-blind) regexes.
Usage: python3.13 glossrows.py [--full] pat1 pat2 ...
"""
import re
import sys
import unicodedata
from pathlib import Path

def fold(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.replace('æ', 'ae').replace('œ', 'oe').lower()

args = sys.argv[1:]
full = '--full' in args
args = [a for a in args if a != '--full']
pats = [re.compile(fold(a)) for a in args]
g = Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(g.read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    key = fold(cells[1])
    if any(p.search(key) for p in pats):
        out = line if full else line[:700]
        print(f'{n}: {out}\n')
