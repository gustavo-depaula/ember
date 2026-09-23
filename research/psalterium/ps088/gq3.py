"""Ps 88 helper: compact glossary lookup — Latin cell matching any stem (accents folded), prints line no., Latin, Portuguese (cut), status (cut)."""
import sys, unicodedata, pathlib

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

stems = [fold(a) for a in sys.argv[1:]]
path = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(path.read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 4:
        continue
    key = fold(cells[1])
    hit = [s for s in stems if s in key]
    if hit:
        print(f'{n} [{hit[0]}] {cells[1].strip()[:90]} → {cells[2].strip()[:160]} ({cells[3].strip()[:25]})')
