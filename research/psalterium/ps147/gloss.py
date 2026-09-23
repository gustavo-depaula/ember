"""Glossary rows whose Latin cell matches a regex (accent-folded): line, Latin cell, rendering cell, status, first N chars of note.
python3.13 research/psalterium/ps147/gloss.py '<regex>' [N]"""
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


pat = re.compile(plain(sys.argv[1]))
n = int(sys.argv[2]) if len(sys.argv) > 2 else 200
path = Path(__file__).resolve().parents[1] / 'glossary.md'
for i, line in enumerate(path.read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('| '):
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if len(cells) < 3 or not pat.search(plain(cells[0])):
        continue
    note = cells[3] if len(cells) > 3 else ''
    print(f'{i}: {cells[0]} || {cells[1][:300]} || {cells[2][:20]} || {note[:n]}')
