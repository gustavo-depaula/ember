"""Grep the DO Latin psalter and show the finished Portuguese of matching verses.
Usage: python3.13 research/psalterium/ps121/grepv.py '<latin regex>' ['<pt regex>' to grep Portuguese instead]"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
latdir = root.parent.parent / 'content/do/horas/Latin/Psalterium/Psalmorum'

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

def pt_verses(n):
    p = root / f'ps{n:03d}' / 'prayed.vos.json'
    if not p.exists():
        return {}
    d = json.loads(p.read_text())
    return d.get('verses', d)

mode_pt = len(sys.argv) > 2 and sys.argv[1] == '--pt'
pat = re.compile(fold(sys.argv[2] if mode_pt else sys.argv[1]))
for f in sorted(latdir.glob('Psalm*.txt'), key=lambda p: (len(p.stem), p.stem)):
    m = re.match(r'Psalm(\d+)$', f.stem)
    if not m:
        continue
    n = int(m.group(1))
    pts = pt_verses(n)
    for line in f.read_text().splitlines():
        if ' ' not in line:
            continue
        vid, lat = line.split(' ', 1)
        pt = pts.get(vid, '')
        hay = fold(pt) if mode_pt else fold(lat)
        if pat.search(hay):
            print(f'{vid}  {lat}\n        {pt}')
