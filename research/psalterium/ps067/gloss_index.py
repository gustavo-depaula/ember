"""Compact index of glossary.md rows: Latin | Portuguese (truncated) | status. Ps 67 helper.
Usage: python3.13 research/psalterium/ps067/gloss_index.py [regex]  (regex filters on the full row)
"""
import re
import sys
from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'glossary.md'
pattern = re.compile(sys.argv[1], re.I) if len(sys.argv) > 1 else None
full = len(sys.argv) > 2
for n, line in enumerate(path.read_text().splitlines(), 1):
    if not line.startswith('|') or line.startswith('| ---'):
        continue
    if pattern and not pattern.search(line):
        continue
    if full:
        print(f'{n}: {line}\n')
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    cells = (cells + ['', '', ''])[:3]
    print(f'{n}: {cells[0][:60]} | {cells[1][:110]} | {cells[2][:20]}')
