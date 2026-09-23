"""Print glossary rows whose first cell matches any of the given regexes (case-insensitive, accents loose).
Usage: python3.13 research/psalterium/ps121/gl.py 'idips' 'átri' ...   (--all to search the whole row)"""
import re
import sys
import unicodedata
from pathlib import Path

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae')

args = sys.argv[1:]
whole = '--all' in args
args = [a for a in args if a != '--all']
pats = [re.compile(fold(a)) for a in args]
text = (Path(__file__).resolve().parent.parent / 'glossary.md').read_text()
for i, line in enumerate(text.splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    key = fold(line if whole else (cells[1] if len(cells) > 1 else ''))
    if any(p.search(key) for p in pats):
        print(f'{i}: {line[:1500]}')
        print()
