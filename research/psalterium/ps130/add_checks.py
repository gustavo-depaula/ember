"""Ps 130 v1: record the checks step in the audit."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'checks' for a in d['audit']):
    d['audit'].append({'step': 'checks', 'note': 'Hard checks pass. Soft flags accepted: 130:2b first colon +5 by the counter, about +2 once the elisions are sung (*Como‿a*, *desmamada‿está*, *sobre‿a*) — the noun the Latin hides and the copula *est* are both needed; 130:3 second colon +3 is the settled formula (D37, = 112:2b, 113:26, 120:8, 124:2b); the 130:2a / 130:2b finals both *alma* are the Latin\'s own echo (*ánimam meam* / *ánima mea*).'})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ok')
