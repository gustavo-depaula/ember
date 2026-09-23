"""Latin regex -> each finished psalm's verse with its prayed Portuguese (Ps 131 lookups).
python3.13 research/psalterium/ps131/concord.py '<regex>' [...]"""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
pats = [re.compile(a, re.I) for a in sys.argv[1:]]
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    lat = folder / 'latin.json'
    vos = folder / 'prayed.vos.json'
    if not lat.exists() or not vos.exists() or folder.name == 'ps131':
        continue
    L = json.loads(lat.read_text(encoding='utf-8'))
    P = json.loads(vos.read_text(encoding='utf-8'))
    for k, v in L.items():
        if any(p.search(v) for p in pats):
            print(f'{k}  {v}\n      {P.get(k, "—")}')
