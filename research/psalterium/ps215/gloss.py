"""Glossary rows whose first cell matches an accent-folded regex; cells cut to a length (glossary.md is ~1MB).
python3.13 research/psalterium/ps215/gloss.py [-n 600] '<regex>' [...]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
cut = 600
if args[:1] == ['-n']:
    cut, args = int(args[1]), args[2:]
pats = [re.compile(plain(a)) for a in args]
for n, line in enumerate((Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if any(p.search(plain(cells[0])) for p in pats):
        print(f'{n}: ' + ' | '.join(c[:cut] for c in cells))
