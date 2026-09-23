"""Glossary rows whose first cell matches any regex (accent-folded): Latin | Portuguese | status, plus the first N chars of
the note and any bold fragment mentioning a given verse-string (Ps 224 lookups).
python3.13 research/psalterium/ps224/gloss_brief.py [-n 200] '<regex>' [...]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
limit = 200
if args and args[0] == '-n':
    limit, args = int(args[1]), args[2:]
pats = [re.compile(plain(a)) for a in args]
root = Path(__file__).resolve().parents[1]
for n, line in enumerate((root / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if cells and any(p.search(plain(cells[0])) for p in pats):
        head = ' | '.join(c[:160] for c in cells[:3])
        note = ' | '.join(cells[3:])[:limit]
        print(f'{n}: {head} || {note}')
