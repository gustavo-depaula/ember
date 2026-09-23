"""Print glossary rows whose first cell matches any pattern (Ps 131 lookup).
python3.13 research/psalterium/ps131/gloss_look.py [maxchars] pat1 pat2 ..."""
import re
import sys
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'
args = sys.argv[1:]
limit = 700
if args and args[0].isdigit():
    limit = int(args[0])
    args = args[1:]
pats = [re.compile(a, re.I) for a in args]
for n, line in enumerate(glossary.read_text(encoding='utf-8').split('\n'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    first = cells[1] if len(cells) > 1 else ''
    if any(p.search(first) for p in pats):
        print(f'{n}: {line[:limit]}')
        print()
