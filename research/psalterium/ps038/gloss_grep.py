"""Print glossary rows whose Latin cell matches any lemma given (accent-blind), truncated."""
import sys, unicodedata, re, pathlib

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

g = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
width = int(sys.argv[1]) if sys.argv[1].isdigit() else 700
pats = [fold(p) for p in sys.argv[1:] if not p.isdigit()]
for n, line in enumerate(g.read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    head = fold(cells[1]) if len(cells) > 1 else ''
    if any(re.search(p, head) for p in pats):
        print(f'{n}: {line[:width]}\n')
