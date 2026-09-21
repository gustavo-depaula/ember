"""One-off correction: the first run of resolve_pending.py marked every pending ambiguity remark on 30:12 'taken'; only
the 'sobremaneira' one was. The other three were recommended 'refuse' and are set so. Idempotent.

python3.13 research/psalterium/review/apply/fix_ps030_1212.py
"""

import json
from pathlib import Path

path = Path(__file__).resolve().parents[2] / 'ps030/prayed.json'
prayed = json.loads(path.read_text(encoding='utf-8'))
fixed = 0
for step in prayed['audit']:
    for o in step.get('outcomes') or []:
        if o.get('verse') == '30:12' and 'resolution' in o and 'sobremaneira' not in o['remark'] and o['outcome'] == 'taken':
            o['outcome'] = 'refused'
            o['resolution'] = 'main session, 2026-09-21 (DECISIONS.md, review of the finished work): as recommended'
            fixed += 1
path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('fixed', fixed)
