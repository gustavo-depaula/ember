"""Print glossary rows whose Latin column matches any of the given regexes (accent-insensitive).

usage: python3.13 research/psalterium/ps106/gl.py [-n CHARS] regex [regex ...]
"""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
text = (root / 'glossary.md').read_text()


def fold(s):
    s = s.replace('æ', 'ae').replace('Æ', 'Ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


args = sys.argv[1:]
width = 700
if args and args[0] == '-n':
    width = int(args[1])
    args = args[2:]
pats = [re.compile(fold(a)) for a in args]
for no, line in enumerate(text.splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    head = fold(cells[1])
    if any(p.search(head) for p in pats):
        print(f'{no}: {line[:width]}')
        print()
