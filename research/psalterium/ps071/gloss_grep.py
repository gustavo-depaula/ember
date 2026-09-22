"""Print glossary rows matching each stem (row cut to N chars). Usage: gloss_grep.py N stem [stem ...]"""
import sys
import unicodedata
from pathlib import Path

gloss = Path(__file__).resolve().parents[1] / 'glossary.md'


def fold(s):
    s = s.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c)).lower().replace('j', 'i')


width = int(sys.argv[1])
lines = gloss.read_text(encoding='utf-8').splitlines()
for stem in sys.argv[2:]:
    print(f'=== {stem}')
    for i, line in enumerate(lines, 1):
        if not line.startswith('|'):
            continue
        first = fold(line.split('|')[1]) if line.count('|') > 2 else ''
        if fold(stem) in first:
            print(f'{i}: {line[:width]}')
