"""Search glossary rows by the Latin (first cell) or anywhere; print trimmed rows.

usage: python3.13 research/psalterium/ps102/gl.py [--full] [--any] regex...
"""
import re, sys, unicodedata
from pathlib import Path

args = sys.argv[1:]
full = '--full' in args
anywhere = '--any' in args
pats = [a for a in args if not a.startswith('--')]

def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

lines = (Path(__file__).parent.parent / 'glossary.md').read_text().splitlines()
for n, line in enumerate(lines, 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 4:
        continue
    key = strip(line if anywhere else cells[1])
    if any(re.search(strip(p), key) for p in pats):
        if full:
            print(f'{n}: {line}\n')
        else:
            print(f'{n}: {cells[1].strip()[:70]} || {cells[2].strip()[:160]} || {cells[3].strip()[:40]}')
