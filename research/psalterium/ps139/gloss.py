"""Print glossary rows whose FIRST cell matches any regex (accent-folded), truncated.
python3.13 research/psalterium/ps139/gloss.py [--full] '<regex>' [...]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
full = '--full' in args
args = [a for a in args if a != '--full']
limit = 100000 if full else 1500
pats = [re.compile(plain(a)) for a in args]
g = Path(__file__).resolve().parents[1] / 'glossary.md'
for n, line in enumerate(g.read_text(encoding='utf-8').split('\n'), 1):
    if not line.startswith('| '):
        continue
    cells = line.split('|')
    first = plain(cells[1]) if len(cells) > 1 else ''
    if any(p.search(first) for p in pats):
        if full:
            print(f'L{n}: {line}\n')
        else:
            head = '|'.join(cells[:4])
            tail = '|'.join(cells[4:])
            print(f'L{n}: {head[:700]} ||| …{tail[-500:]}\n')
