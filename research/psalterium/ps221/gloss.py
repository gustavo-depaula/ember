"""Print glossary rows whose first cell matches a regex: term | rendering | status, and optionally the evidence cell grepped.
python3.13 research/psalterium/ps221/gloss.py '<regex on first cell>' [--full] [--grep '<regex in evidence>']"""
import re
import sys
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'
args = sys.argv[1:]
full = '--full' in args
grep = None
if '--grep' in args:
    grep = re.compile(args[args.index('--grep') + 1])
pat = re.compile(args[0], re.I)
for n, line in enumerate(glossary.read_text(encoding='utf-8').split('\n'), 1):
    if not line.startswith('| '):
        continue
    cells = [c.strip() for c in line.strip('|').split(' | ')]
    if not pat.search(cells[0]):
        continue
    print(f'{n}: {cells[0]} || {cells[1] if len(cells) > 1 else ""} || {cells[2] if len(cells) > 2 else ""}')
    if full:
        print('    ', ' | '.join(cells[3:])[:3000])
    elif grep and len(cells) > 3:
        for m in re.finditer(r'[^.]*' + grep.pattern + r'[^.]*\.', ' '.join(cells[3:])):
            print('     >', m.group(0).strip()[:600])
