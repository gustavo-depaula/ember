"""Print the full glossary rows whose first cell matches each regex (accent-blind, case-blind).
python3.13 research/psalterium/ps032/rows.py [--max N] regex ..."""
import re
import sys
import unicodedata
from pathlib import Path

lines = (Path(__file__).resolve().parents[1] / 'glossary.md').read_text(encoding='utf-8').splitlines()
args = sys.argv[1:]
limit = 900
if args and args[0] == '--max':
    limit = int(args[1])
    args = args[2:]


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


for term in args:
    print('==', term)
    for n, line in enumerate(lines, 1):
        if line.startswith('| ') and re.search(term, plain(line.split('|')[1])):
            print(f'{n}: {line[:limit]}')
            print()
