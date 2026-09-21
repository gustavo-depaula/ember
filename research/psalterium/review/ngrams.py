"""Shared Latin word runs (≥ N words, default 4) between finished verses, for reading twins by hand.

python3.13 review/ngrams.py [N] → each maximal shared run, the verses that have it, and their Portuguese.
Runs made only of very common words are skipped.
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

here = Path(__file__).resolve().parent
n = int(sys.argv[1]) if len(sys.argv) > 1 else 4
stop = set('et in non ad a ab de est me mihi te tibi qui quia quoniam sunt eius ejus mea meam meum tua tuam tuum tuo tuae sua suam suum eorum super cum ut nos'.split())


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae').replace('Œ', 'Oe')
    text = text.replace('ǽ', 'ae').replace('Ǽ', 'Ae')
    decomposed = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in decomposed if not unicodedata.combining(c)).lower()
    text = re.sub(r'\([^)]*\)', ' ', text)
    return re.sub(r'[^a-z ]+', ' ', text).split()


rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
byid = {r['id']: r for r in rows}
index = defaultdict(set)
for r in rows:
    w = plain(r['la'])
    for i in range(len(w) - n + 1):
        gram = tuple(w[i:i + n])
        if sum(1 for x in gram if x not in stop) >= 2:
            index[gram].add(r['id'])

# merge grams by the set of verses sharing them
bypair = defaultdict(list)
for gram, ids in index.items():
    if len(ids) > 1:
        bypair[tuple(sorted(ids))].append(' '.join(gram))
for ids, grams in sorted(bypair.items()):
    print('## ' + ' | '.join(sorted(set(grams))[:4]))
    for vid in ids:
        print(f"   {vid:8} {byid[vid]['la']}\n            {byid[vid]['pt']}")
print(f'-- {len(bypair)} verse groups')
