"""Grep the rendered Portuguese (prayed.vos.json, else prayed.json) of all finished psalms, accent-blind."""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[1]


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


pats = [re.compile(fold(p)) for p in sys.argv[1:]]
for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
    if d.name == 'ps056':
        continue
    f = d / 'prayed.vos.json'
    if not f.exists():
        f = d / 'prayed.json'
    if not f.exists():
        continue
    data = json.loads(f.read_text(encoding='utf-8'))
    verses = data.get('verses', data)
    if not isinstance(verses, dict):
        continue
    for vid, text in verses.items():
        if not isinstance(text, str):
            continue
        if any(p.search(fold(text)) for p in pats):
            print(f'{d.name} {vid}: {text}')
