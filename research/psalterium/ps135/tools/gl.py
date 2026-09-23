"""Glossary rows whose first cell matches a regex; prints term | rendering | status (truncated), and optionally the note.
Usage: gl.py '<regex>' [width] [--note]"""
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parents[2]
pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 300
note = '--note' in sys.argv
for i, line in enumerate((root / 'glossary.md').read_text().splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if not cells or not pat.search(cells[0]):
        continue
    shown = cells[:3] + (cells[3:4] if note else [])
    print(f'{i}: ' + ' | '.join(c[:width] for c in shown))
