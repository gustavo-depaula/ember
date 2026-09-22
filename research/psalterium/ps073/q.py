"""Latin regex over every translated psalm folder: prints Latin + current prayed text.

Usage: python3.13 research/psalterium/ps073/q.py '<latin regex>' ['<latin regex>' ...]
Reads each psNNN/latin.json + prayed.vos.json (skips folders without them). Read-only.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

base = Path(__file__).resolve().parent.parent


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


pairs = []
for folder in sorted(base.glob('ps[0-9][0-9][0-9]')):
    la, pt = folder / 'latin.json', folder / 'prayed.vos.json'
    if not la.exists() or not pt.exists():
        continue
    try:
        latin = json.loads(la.read_text(encoding='utf-8'))
        prayed = json.loads(pt.read_text(encoding='utf-8'))
    except Exception:
        continue
    if isinstance(prayed, dict) and 'verses' in prayed:
        prayed = prayed['verses']
    for vid, text in latin.items():
        pairs.append((vid, text, prayed.get(vid, '?')))

for pattern in sys.argv[1:]:
    rx = re.compile(plain(pattern))
    print(f'## {pattern}')
    for vid, la, pt in pairs:
        if rx.search(plain(la)):
            print(f'{vid:8} {la}\n         {pt}')
    print()
