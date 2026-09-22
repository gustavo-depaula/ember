"""Concordance across translated psalms: Latin verses matching a regex (accents stripped) with their current Portuguese.

python3.13 research/psalterium/ps070/conc.py 'potenti' 'magnal'
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402


def flat(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


rows = []
for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
    lj, pj = d / 'latin.json', d / 'prayed.json'
    if not (lj.exists() and pj.exists()):
        continue
    try:
        lat = json.loads(lj.read_text(encoding='utf-8'))
        pt = resolve(json.loads(pj.read_text(encoding='utf-8')))
    except Exception as e:  # a psalm mid-edit by another agent
        print(f'skip {d.name}: {e}')
        continue
    for vid, text in lat.items():
        rows.append((vid, text, pt.get(vid, '')))

for pat in sys.argv[1:]:
    rx = re.compile(pat, re.I)
    print(f'=== {pat}')
    for vid, la, po in rows:
        if rx.search(flat(la)):
            print(f'{vid}  {la}\n        {po}')
