"""Accent-blind grep over the Latin of finished psalm folders, printing the Latin verse and its current Portuguese.
python3.13 research/psalterium/ps038/xref.py '<regex>' ['<regex>' ...]"""
import json
import re
import sys
import unicodedata
from pathlib import Path

base = Path(__file__).resolve().parents[1]


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe').replace('ǽ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


folders = sorted(p for p in base.glob('ps[0-9][0-9][0-9]') if (p / 'prayed.vos.json').exists() and (p / 'latin.json').exists())
for pattern in sys.argv[1:]:
    regex = re.compile(plain(pattern))
    print(f'## {pattern}')
    for folder in folders:
        if folder.name == 'ps038':
            continue
        latin = json.loads((folder / 'latin.json').read_text(encoding='utf-8'))
        if isinstance(latin, dict) and 'verses' in latin:
            latin = latin['verses']
        prayed = json.loads((folder / 'prayed.vos.json').read_text(encoding='utf-8'))
        verses = prayed.get('verses', prayed)
        for vid, text in latin.items():
            if regex.search(plain(text)):
                print(f'  {vid}  {text}\n        → {verses.get(vid, "?")}')
