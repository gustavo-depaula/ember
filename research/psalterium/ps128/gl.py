"""Print glossary rows whose first cell matches a regex (first cells + truncated notes)."""
import re
import sys
import unicodedata

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 else 400
for n, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 4:
        continue
    if pat.search(fold(cells[1])):
        print(f'{n}: {line.strip()[:width]}')
