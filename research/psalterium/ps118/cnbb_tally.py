"""Diction only: which nouns the CNBB Bible (Hebrew family, consult/bolls-CNBB-19-119.json) uses for the law in Ps 119.

Run from the repo root:  python3.13 research/psalterium/ps118/cnbb_tally.py
Not a witness of sense (rule 1) — it shows what current Brazilian Catholic usage calls these things.
"""

import json
import re
from collections import Counter
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here.parent / 'consult/bolls-CNBB-19-119.json').read_text(encoding='utf-8'))
stems = r'justificaç|testemunh|mandament|preceit|decret|estatut|orden|ordem|determinaç|sentenç|juízo|julgament|palavra|promessa|oráculo|\bleis?\b|norma|prescriç|vontade|ensinament|instruç|caminho|vereda|senda'
tally = Counter()
for verse in data:
    text = re.sub(r'<[^>]+>', '', verse['text'])
    for hit in re.findall(rf'\w*(?:{stems})\w*', text, flags=re.I):
        tally[re.sub(r's$', '', hit.lower())] += 1
print(', '.join(f'{k} {n}' for k, n in tally.most_common()))
for verse in data[:16]:
    print(verse['verse'], re.sub(r'<[^>]+>', '', verse['text']))
