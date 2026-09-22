"""Print glossary rows whose first cell matches (accent-blind) any regex; long cells truncated.
python3.13 research/psalterium/ps043/gloss.py [--full] '<regex>' ..."""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
full = False
limit = 700
if args and args[0] == '--full':
    full = True
    args = args[1:]
lines = glossary.read_text(encoding='utf-8').splitlines()
for pattern in args:
    regex = re.compile(plain(pattern))
    print(f'## {pattern}')
    for line in lines:
        if not line.startswith('|'):
            continue
        cells = line.split('|')
        if len(cells) < 3:
            continue
        if regex.search(plain(cells[1])):
            print(line if full else line[:limit])
            print()
