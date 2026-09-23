"""Print glossary rows whose FIRST cell matches a regex (accent-folded), truncated.
python3.13 research/psalterium/ps220/glossrows.py '<regex>' [maxchars]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


root = Path(__file__).resolve().parents[1]
pat = re.compile(plain(sys.argv[1]))
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 700
for n, line in enumerate((root / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    if pat.search(plain(cells[1])):
        print(f'{n}: {line[:limit]}\n')
