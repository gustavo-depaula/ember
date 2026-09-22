"""Print glossary rows whose Latin cell (or, with -a, whole row) matches any regex given.

Usage: python3.13 gloss_lookup.py [-a] [-n MAXCHARS] regex [regex ...]
"""
import re
import sys
import unicodedata
from pathlib import Path

args = sys.argv[1:]
whole = False
maxc = 1500
if args and args[0] == '-a':
    whole = True
    args = args[1:]
if args and args[0] == '-n':
    maxc = int(args[1])
    args = args[2:]


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')


pats = [re.compile(fold(a)) for a in args]
lines = Path(__file__).resolve().parent.parent.joinpath('glossary.md').read_text().splitlines()
for i, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    target = fold(line if whole else (cells[1] if len(cells) > 1 else ''))
    if any(p.search(target) for p in pats):
        print(f'--- {i}: {line[:maxc]}')
