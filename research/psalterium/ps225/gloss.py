"""Print glossary rows whose first cell (the Latin) matches a regex, accent-folded; notes cut to N chars.
python3.13 research/psalterium/ps225/gloss.py [-n 600] '<regex>' [...]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower().replace('j', 'i')


args = sys.argv[1:]
limit = 600
if args and args[0] == '-n':
    limit = int(args[1])
    args = args[2:]
pats = [re.compile(plain(a)) for a in args]
path = Path(__file__).resolve().parents[1] / 'glossary.md'
for n, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    head = plain(cells[1])
    if any(p.search(head) for p in pats):
        print(f'{n}: {line[:limit]}\n')
