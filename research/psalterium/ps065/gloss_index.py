"""Print the first three cells of glossary rows whose Latin cell matches a regex (ps065 helper)."""
import re
import sys

pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 else 200
for n, line in enumerate(open('research/psalterium/glossary.md', encoding='utf-8'), 1):
    if not line.startswith('| '):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if pat.search(cells[0]):
        print(n, ' | '.join(cells[:3])[:width])
