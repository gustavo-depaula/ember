"""Search the final prayed.vos.json of every finished psalm (and the Latin beside it).
python3.13 pfind.py '<pt regex>' ['<latin regex>']"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[1]
latinRoot = root.parents[1] / 'content/do/horas/Latin/Psalterium/Psalmorum'


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


def latin(n):
    path = latinRoot / f'Psalm{n}.txt'
    out = {}
    if path.exists():
        for line in path.read_text(encoding='utf-8').splitlines():
            m = re.match(r'(\d+:\d+[a-z]?)\s+(.*)', line)
            if m:
                out[m.group(1)] = m.group(2)
    return out


pt = re.compile(sys.argv[1])
la = re.compile(plain(sys.argv[2])) if len(sys.argv) > 2 else None
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    f = folder / 'prayed.vos.json'
    if not f.exists():
        continue
    data = json.loads(f.read_text(encoding='utf-8'))
    verses = data.get('verses', data)
    lat = latin(int(folder.name[2:]))
    for vid, text in verses.items():
        if not isinstance(text, str):
            continue
        l = lat.get(vid, '')
        if pt.search(text) and (la is None or la.search(plain(l))):
            print(f'{vid}\n  LA {l}\n  PT {text}')
