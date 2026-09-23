"""Print glossary rows whose FIRST cell matches any of the given regexes (case-insensitive,
accents stripped). Usage: python3.13 gloss_lookup.py [--max N] [--any] regex ...
--any matches against the whole row instead of the first cell."""
import re
import sys
import unicodedata
from pathlib import Path

args = sys.argv[1:]
limit = 1600
whole = False
if '--max' in args:
    i = args.index('--max')
    limit = int(args[i + 1])
    del args[i:i + 2]
if '--any' in args:
    whole = True
    args.remove('--any')


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


pats = [re.compile(fold(a)) for a in args]
gl = Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(gl.read_text(encoding='utf-8').split('\n'), 1):
    if not line.startswith('| '):
        continue
    cells = line.split('|')
    target = fold(line if whole else cells[1])
    if any(p.search(target) for p in pats):
        text = line if len(line) <= limit else line[:limit] + ' …[+%d]' % (len(line) - limit)
        print(f'{n}: {text}\n')
