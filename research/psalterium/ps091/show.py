"""Print rendered verses of finished psalms: python3.13 show.py 32:2 56:9 ... (reads psN/prayed.vos.json; Latin beside)."""
import json, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for ref in sys.argv[1:]:
    ps = ref.split(':')[0]
    f = root / f'ps{int(ps):03d}' / 'prayed.vos.json'
    if not f.exists():
        print(ref, '— no prayed.vos.json')
        continue
    d = json.loads(f.read_text(encoding='utf-8'))
    verses = d.get('verses', d)
    lat = {}
    lf = root / f'ps{int(ps):03d}' / 'latin.json'
    if lf.exists():
        lj = json.loads(lf.read_text(encoding='utf-8'))
        lat = lj.get('verses', lj)
    for k, v in verses.items():
        if k == ref or (ref.endswith('*') and k.startswith(ref[:-1])):
            print(k, '|', lat.get(k, ''), '\n   ', v)
