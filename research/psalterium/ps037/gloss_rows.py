"""Print glossary rows whose first cell (Latin) matches any of the given accent-blind regexes.
python3.13 research/psalterium/ps037/gloss_rows.py [--short] pat1 pat2 ...  (--short: cut each row to 600 chars)"""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    return ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
short = '--short' in args
args = [a for a in args if a != '--short']
lines = glossary.read_text(encoding='utf-8').split('\n')
for pattern in args:
    regex = re.compile(plain(pattern))
    print(f'## {pattern}')
    for number, line in enumerate(lines, 1):
        if not line.startswith('|'):
            continue
        cells = line.split('|')
        if len(cells) < 3:
            continue
        if regex.search(plain(cells[1])):
            text = line if not short else line[:600]
            print(f'{number}: {text}')
    print()
