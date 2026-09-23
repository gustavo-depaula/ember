"""Print glossary rows whose FIRST cell matches any regex (accent-folded). Ps 144 lookups.
python3.13 research/psalterium/ps144/rows.py '<regex>' [...] [--max N]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
cap = 1500
if '--max' in args:
    i = args.index('--max')
    cap = int(args[i + 1])
    args = args[:i] + args[i + 2:]
pats = [re.compile(plain(a)) for a in args]
g = Path(__file__).resolve().parents[1] / 'glossary.md'
for n, line in enumerate(g.read_text(encoding='utf-8').split('\n'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    first = plain(cells[1])
    if any(p.search(first) for p in pats):
        print(f'{n}: {line[:cap]}\n')
