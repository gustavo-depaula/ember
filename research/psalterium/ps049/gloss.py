"""Print glossary rows whose first cell matches (accent-blind): python3.13 gloss.py [-n CHARS] '<regex>' ...
Read-only."""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe').replace('ǽ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
limit = 700
if args and args[0] == '-n':
    limit = int(args[1])
    args = args[2:]
lines = glossary.read_text(encoding='utf-8').split('\n')
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
            print(line[:limit])
            print()
