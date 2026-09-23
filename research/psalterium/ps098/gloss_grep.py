"""Print glossary rows whose first cell matches a regex (short form), for Ps 98 drafting."""
import re
import sys

pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 else 300
for n, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) < 2:
        continue
    if pat.search(cells[0]):
        print(f'{n}: {cells[0][:120]} || {cells[1][:width]} || {(cells[2] if len(cells) > 2 else "")[:width]}')
        print()
