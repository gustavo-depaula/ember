"""Accent-blind search: glossary lines (snippets) and prayed.json verses of finished psalms.

usage: find.py [--gloss|--prayed] term [term ...]
For prayed files, prints the verse id, the Latin (latin.json if present) and the Portuguese
of every verse whose Latin or Portuguese contains a term.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

root = Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
mode = 'both'
if '--gloss' in sys.argv:
    mode = 'gloss'
if '--prayed' in sys.argv:
    mode = 'prayed'
terms = [fold(a) for a in args]

if mode in ('both', 'gloss'):
    for i, line in enumerate((root / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
        f = fold(line)
        for t in terms:
            for m in re.finditer(re.escape(t), f):
                a = max(0, m.start() - 160)
                b = min(len(line), m.end() + 200)
                print(f'G{i}: …{line[a:b]}…')
                break

def fill(text, decisions):
    for _ in range(5):
        for d in decisions:
            if not d.get('options'):
                continue
            for k, v in d['options'][0].get('forms', {}).items():
                text = text.replace('{' + k + '}', v)
    return text

if mode in ('both', 'prayed'):
    for p in sorted(root.glob('ps[0-9][0-9][0-9]/prayed.json')):
        if p.parent.name == 'ps047':
            continue
        try:
            data = json.loads(p.read_text(encoding='utf-8'))
        except Exception:
            continue
        latin = {}
        lj = p.parent / 'latin.json'
        if lj.exists():
            try:
                lat = json.loads(lj.read_text(encoding='utf-8'))
                latin = lat.get('verses', lat) if isinstance(lat, dict) else {}
            except Exception:
                pass
        decs = data.get('decisions', [])
        for vid, txt in data.get('verses', {}).items():
            pt = fill(txt, decs)
            la = latin.get(vid, '')
            if isinstance(la, dict):
                la = la.get('text', '')
            hay = fold(pt) + ' || ' + fold(str(la))
            if any(t in hay for t in terms):
                print(f'{vid}: LA {la}\n       PT {pt}')
