"""Print glossary rows whose FIRST cell (accent-blind) matches any pattern.
python3.13 gloss.py [-n LEN] pat1 pat2 ..."""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
length = 700
if args and args[0] == '-n':
    length = int(args[1])
    args = args[2:]
pats = [re.compile(plain(a)) for a in args]
for line in glossary.read_text(encoding='utf-8').splitlines():
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    first = plain(cells[1])
    if any(p.search(first) for p in pats):
        print(line[:length])
        print()
