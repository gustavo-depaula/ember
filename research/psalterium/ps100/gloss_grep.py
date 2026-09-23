"""Print glossary rows whose first cell (Latin) matches any given regex. Usage: gloss_grep.py [-n N] regex..."""
import re
import sys
import unicodedata

args = sys.argv[1:]
limit = 900
if args and args[0] == '-n':
    limit = int(args[1])
    args = args[2:]


def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


pats = [re.compile(strip(a)) for a in args]
for i, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    first = strip(cells[1]) if len(cells) > 1 else ''
    if any(p.search(first) for p in pats):
        print(f'{i}: {line.strip()[:limit]}\n')
