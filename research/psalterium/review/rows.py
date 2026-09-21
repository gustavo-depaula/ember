"""List glossary rows: python3.13 review/rows.py [status-regex]  → line, section, Latin cell, rendering cell (short), status.
Also flags Latin cells that occur in more than one row (duplicates)."""
import re
import sys
from collections import defaultdict
from pathlib import Path

here = Path(__file__).resolve().parent
text = (here.parent / 'glossary.md').read_text(encoding='utf-8').splitlines()
want = re.compile(sys.argv[1], re.I) if len(sys.argv) > 1 else None
section = ''
seen = defaultdict(list)
for i, line in enumerate(text, 1):
    if line.startswith('#'):
        section = line.strip('# ')
        continue
    if not line.startswith('|') or line.startswith('| ---') or line.startswith('| Latin') or line.startswith('| |'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    if len(cells) < 3:
        continue
    lat, pt, status = cells[0], cells[1], cells[2]
    key = re.sub(r'[*_`]', '', lat).lower()
    seen[key].append(i)
    if want and not want.search(status):
        continue
    print(f'{i:4} [{section[:10]}] {lat[:60]} | {pt[:70]} | {status[:40]}')
print('\n## Latin cells appearing in more than one row')
for key, lines in seen.items():
    if len(lines) > 1:
        print(lines, key[:80])
