"""Print glossary rows whose first cell matches any term, truncated. Ps 87 helper."""
import re
import sys
import unicodedata

def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

terms = [strip(t) for t in sys.argv[2:]]
width = int(sys.argv[1])
for line in open('research/psalterium/glossary.md', encoding='utf-8'):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    first = strip(cells[1])
    for t in terms:
        if re.search(t, first):
            print(line[:width].rstrip())
            print('---')
            break
