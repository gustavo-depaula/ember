"""Accent-blind grep helpers for Ps 61.

  python3.13 grep.py gloss PAT...   glossary lines containing PAT (snippets)
  python3.13 grep.py pt PAT...      rendered Portuguese of finished psalms
  python3.13 grep.py la PAT...      DO Latin psalter
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[1]
repo = root.parents[1]


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


mode, pats = sys.argv[1], [re.compile(fold(p)) for p in sys.argv[2:]]

if mode == 'gloss':
    for n, line in enumerate((root / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
        f = fold(line)
        for p in pats:
            for m in p.finditer(f):
                a, b = max(0, m.start() - 150), m.end() + 250
                head = line.split('|')[1][:50] if line.startswith('|') else ''
                print(f'{n} [{head.strip()}]: …{line[a:b]}…')
                print()
elif mode == 'pt':
    for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
        if d.name == 'ps061':
            continue
        f = d / 'prayed.vos.json'
        if not f.exists():
            f = d / 'prayed.json'
        if not f.exists():
            continue
        data = json.loads(f.read_text(encoding='utf-8'))
        verses = data.get('verses', data)
        for vid, text in verses.items():
            if isinstance(text, str) and any(p.search(fold(text)) for p in pats):
                print(f'{vid}: {text}')
elif mode == 'v':
    for v in sys.argv[2:]:
        d = root / ('ps%03d' % int(v.split(':')[0]))
        f = d / 'prayed.vos.json'
        if not f.exists():
            continue
        data = json.loads(f.read_text(encoding='utf-8'))
        for k, t in data.items():
            if k == v or (k.startswith(v) and not k[len(v):len(v) + 1].isdigit()):
                print(k, t)
elif mode == 'la':
    d = repo / 'content/do/horas/Latin/Psalterium/Psalmorum'
    for f in sorted(d.glob('Psalm*.txt'), key=lambda x: x.name):
        for line in f.read_text(encoding='utf-8').splitlines():
            if any(p.search(fold(line)) for p in pats):
                print(f'{f.stem}: {line}')
