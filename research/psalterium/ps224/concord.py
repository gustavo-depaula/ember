"""Latin regex (accent-folded) -> each finished psalm's verse with its prayed Portuguese (Ps 224 lookups).
Copied from ps214/concord.py (via ps210, itself from ps131/concord.py), with accent folding.
python3.13 research/psalterium/ps224/concord.py '<regex>' [...]"""
import json
import re
import sys
import unicodedata
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


root = Path(__file__).resolve().parents[1]
pats = [re.compile(plain(a)) for a in sys.argv[1:]]
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    lat = folder / 'latin.json'
    vos = folder / 'prayed.vos.json'
    if not lat.exists() or not vos.exists() or folder.name == 'ps224':
        continue
    L = json.loads(lat.read_text(encoding='utf-8'))
    P = json.loads(vos.read_text(encoding='utf-8'))
    for k, v in L.items():
        if any(p.search(plain(v)) for p in pats):
            print(f'{folder.name[2:]} {k}  {v}\n      {P.get(k, "—")}')
