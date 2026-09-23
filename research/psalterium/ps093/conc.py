"""Ps 93 helper: search finished psalms' Latin (accent-insensitive regex) and show the prayed Portuguese.
Usage: python3.13 research/psalterium/ps093/conc.py '<regex>' [--pt]  (--pt searches the Portuguese instead)"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').replace('æ', 'ae').replace('Æ', 'Ae').lower()


pat = re.compile(fold(sys.argv[1]))
pt = '--pt' in sys.argv
for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
    if d.name == 'ps093':
        continue
    lat_p, vos_p = d / 'latin.json', d / 'prayed.vos.json'
    if not (lat_p.exists() and vos_p.exists()):
        continue
    lat = json.loads(lat_p.read_text(encoding='utf-8'))
    vos = json.loads(vos_p.read_text(encoding='utf-8'))
    if 'verses' in vos:
        vos = vos['verses']
    for vid, la in lat.items():
        tr = vos.get(vid, '')
        hay = fold(tr) if pt else fold(la)
        if pat.search(hay):
            print(f'{vid}\n  LA {la}\n  PT {tr}')
