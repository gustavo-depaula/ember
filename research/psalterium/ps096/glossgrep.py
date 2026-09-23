"""Print glossary rows whose first cell matches any of the given regexes (Ps 96 lookup helper)."""
import re
import sys
import unicodedata

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

pats = [re.compile(fold(p)) for p in sys.argv[2:]]
width = int(sys.argv[1])
for n, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    head = fold(cells[1])
    if any(p.search(head) for p in pats):
        print(n, line[:width].rstrip())
        print()
