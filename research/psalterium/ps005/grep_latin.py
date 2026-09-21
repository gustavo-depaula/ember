"""Accent-blind grep over the DO Latin psalter: python3.13 grep_latin.py '<regex>' ['<regex>' ...]
Prints psalm-file:verse lines whose accent-stripped lowercase text matches. Read-only."""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/horas/Latin/Psalterium/Psalmorum'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


def number(path):
    found = re.search(r'(\d+)', path.stem)
    return int(found.group(1)) if found else 0


for pattern in sys.argv[1:]:
    regex = re.compile(pattern)
    print(f'## {pattern}')
    count = 0
    for path in sorted(root.glob('Psalm*.txt'), key=number):
        if number(path) > 150:
            continue
        for line in path.read_text(encoding='utf-8').splitlines():
            if regex.search(plain(line)):
                count += 1
                print(f'{path.stem}: {line.strip()}')
    print(f'-- {count} lines\n')
