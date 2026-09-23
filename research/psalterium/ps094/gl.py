"""Print glossary rows (term | rendering | status | first chars of notes) whose term column matches a regex."""
import re
import sys

pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 else 300
for n, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cols = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cols) < 2:
        continue
    if pat.search(cols[0]):
        rest = ' | '.join(cols[3:])[:width]
        print(f'{n}: {cols[0]} || {cols[1]} || {cols[2] if len(cols) > 2 else ""} || {rest}')
