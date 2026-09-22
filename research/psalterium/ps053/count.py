"""Count word families in the DO Latin psalter (Pss 1-150) — scratch tool for Ps 53's glossary proposals.

usage: python3.13 research/psalterium/ps053/count.py '<regex>' [--show]
Accents are stripped before matching, so write the pattern unaccented.
"""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do/web/www/horas/Latin/Psalterium/Psalmorum'


def plain(s):
    s = s.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    return ''.join(c for c in unicodedata.normalize('NFD', s) if not unicodedata.combining(c)).lower()


pattern = re.compile(sys.argv[1])
show = '--show' in sys.argv
hits = []
for n in range(1, 151):
    f = root / f'Psalm{n}.txt'
    if not f.exists():
        continue
    for line in f.read_text(encoding='utf-8').splitlines():
        if pattern.search(plain(line)):
            hits.append(line.strip())
print(len(hits), 'verses')
if show:
    for h in hits:
        print(h)
