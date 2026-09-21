"""Find repeated Latin cola across the finished text and compare their Portuguese.

python3.13 review/twins.py [min_words]  → groups of cola whose folded Latin (punctuation and case dropped) is identical,
with at least min_words words (default 3); prints each group with its Portuguese colon, marking '!!' when the Portuguese
cola (punctuation and case dropped) differ. Cola are cut at the pointing marks (*, †, ‡, +) — so a colon that the
Portuguese moved across a mark will show as a divergence to be read by hand.
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

here = Path(__file__).resolve().parent
minw = int(sys.argv[1]) if len(sys.argv) > 1 else 3


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()
    text = re.sub(r'\([^)]*\)', ' ', text)
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z ]+', ' ', text)).strip()


def ptnorm(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w ]+', ' ', text.lower())).strip()


def cut(text):
    text = re.sub(r'\([^)]*\)', ' ', text)
    return [c for c in re.split(r'\s*[†‡*+]\s*', text) if c.strip()]


rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
groups = defaultdict(list)
for r in rows:
    la, pt = cut(r['la']), cut(r['pt'])
    if len(la) != len(pt):
        continue
    for i, (a, b) in enumerate(zip(la, pt)):
        key = plain(a)
        if len(key.split()) >= minw:
            groups[key].append((r['id'], i, a.strip(), b.strip()))

diverge = same = 0
for key, items in sorted(groups.items(), key=lambda kv: kv[1][0][0]):
    if len(items) < 2:
        continue
    forms = {ptnorm(b) for _, _, _, b in items}
    flag = '!!' if len(forms) > 1 else 'ok'
    if flag == '!!':
        diverge += 1
    else:
        same += 1
    print(f'{flag} {key}')
    for vid, i, a, b in items:
        print(f'     {vid:8} c{i}  {b}')
print(f'-- {same} identical groups, {diverge} divergent groups')
