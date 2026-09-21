"""D1/D13 check: bare Portuguese words ending in -i / -í (no enclitic hyphen) that could be an -ir verb's vós imperative
equal to a first-person preterite. Prints each distinct word with its verses, for reading by hand.

python3.13 review/homograph.py
"""
import json
import re
from collections import defaultdict
from pathlib import Path

here = Path(__file__).resolve().parent
rows = json.loads((here / 'corpus.json').read_text(encoding='utf-8'))
skip = set('aqui ali mi ti si daí dali ali assim nenhum aí até'.split())
found = defaultdict(list)
for r in rows:
    for m in re.finditer(r"(?<![\w-])(\w+[iíì])(?![\w-])", r['pt']):
        w = m.group(1)
        lw = w.lower()
        if lw in skip or len(lw) < 3:
            continue
        found[lw].append(r['id'])
for w, ids in sorted(found.items()):
    print(f'{w:16} {len(ids):3}  {" ".join(ids[:12])}')
