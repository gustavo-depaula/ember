"""Ps 88 helper: glossary rows whose Latin cell matches a stem (accents folded); prints Latin | Portuguese | status and the note cut to N chars.
Usage: python3.13 research/psalterium/ps088/gq.py N stem1 stem2 ..."""
import sys, unicodedata, pathlib

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

width = int(sys.argv[1])
stems = [fold(a) for a in sys.argv[2:]]
path = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(path.read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 4:
        continue
    key = fold(cells[1])
    if any(s in key for s in stems):
        head = ' | '.join(c.strip()[:300] for c in cells[1:4])
        note = '|'.join(cells[4:]).strip()
        print(f'{n}: {head} || {note[:width]}\n')
