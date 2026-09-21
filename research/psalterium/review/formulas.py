"""Formula rows of glossary.md, each checked against the finished text.

python3.13 review/formulas.py → for every formula row: the Latin cell, the rendering cell (short), the status (short),
and every finished verse whose folded Latin contains any italic Latin phrase of the cell (split at '…'), with its
Portuguese — so that divergent twins can be read side by side.
"""
import json
import re
import unicodedata
from pathlib import Path

here = Path(__file__).resolve().parent


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()
    return re.sub(r'[^a-z ]+', ' ', text)


def squash(t):
    return re.sub(r'\s+', ' ', plain(t)).strip()


rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
for r in rows:
    r['sq'] = squash(re.sub(r'\([^)]*\)', ' ', r['la']))
lines = (here.parent / 'glossary.md').read_text(encoding='utf-8').splitlines()
inside = False
for i, line in enumerate(lines, 1):
    if line.startswith('## Formulas'):
        inside = True
        continue
    if line.startswith('## ') and inside and not line.startswith('## Formulas'):
        inside = False
    if not inside or not line.startswith('| ') or line.startswith('| Latin') or line.startswith('| ---'):
        continue
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    lat, pt, status = cells[0], cells[1], cells[2] if len(cells) > 2 else ''
    phrases = []
    for chunk in re.findall(r'\*([^*]+)\*', lat):
        for piece in re.split(r'…|\.\.\.', chunk):
            sq = squash(piece)
            if len(sq.split()) >= 2:
                phrases.append(sq)
    print(f'\n### line {i}: {lat[:160]}')
    print(f'    PT: {pt[:220]}')
    print(f'    ST: {status[:120]}')
    for r in rows:
        if any(p in r['sq'] for p in phrases):
            print(f"    {r['id']:8} {r['pt']}")
