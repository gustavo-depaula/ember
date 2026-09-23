"""Find Latin word-runs of Ps 105 (>= K words, default 4) that recur in other translated psalms; print the other verse's Latin and Portuguese.

python3.13 research/psalterium/ps105/tools/twins.py [K]
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[2]
k = int(sys.argv[1]) if len(sys.argv) > 1 else 4


def plain(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()
    s = s.replace('æ', 'ae').replace('œ', 'oe')
    return re.findall(r'[a-z]+', s)


def load(folder):
    lat = folder / 'latin.json'
    pv = folder / 'prayed.vos.json'
    if not lat.exists() or not pv.exists():
        return None
    latin = json.loads(lat.read_text(encoding='utf-8'))
    pt = json.loads(pv.read_text(encoding='utf-8'))
    if 'verses' in pt:
        pt = pt['verses']
    return latin, pt


src = Path('content/do/horas/Latin/Psalterium/Psalmorum/Psalm105.txt')
mine = {}
for line in src.read_text(encoding='utf-8').split('\n'):
    m = re.match(r'(105:\d+[a-z]?)\s+(.*)', line)
    if m:
        mine[m.group(1)] = m.group(2)

others = {}
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    if folder.name == 'ps105':
        continue
    got = load(folder)
    if got:
        others[folder.name] = got

for vid, text in mine.items():
    words = plain(text)
    grams = {' '.join(words[i:i + k]) for i in range(len(words) - k + 1)}
    hits = []
    for name, (latin, pt) in others.items():
        for oid, otext in latin.items():
            ow = ' '.join(plain(otext))
            common = [g for g in grams if g in ow]
            if common:
                hits.append((oid, otext, pt.get(oid, '?'), max(common, key=len)))
    if hits:
        print(f'=== {vid}: {text}')
        for oid, otext, ptext, g in hits:
            print(f'  {oid} [{g}]')
            print(f'    L: {otext}')
            print(f'    P: {ptext}')
