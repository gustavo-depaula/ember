"""Sanity checks on ps017/prayed.json beyond checks.py: python3.13 research/psalterium/ps020/validate.py <folder> (copied from ps017)
- every {slot} used in a verse (or inside another form) is filled by exactly one decision's option 0
- no option 0 whose forms are all empty; no decision whose option-0 forms are only other slots
- every option of a decision fills the same slots
- every decision's slots reach a verse"""
import json
import re
from pathlib import Path

import sys
here = Path(sys.argv[1]).resolve()
data = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
slot = re.compile(r'\{(\w+)\}')
owner, problems = {}, []
for d in data['decisions']:
    keys = set(d['options'][0]['forms'])
    for k in keys:
        if k in owner:
            problems.append(f'slot {k} in two decisions: {owner[k]}, {d["id"]}')
        owner[k] = d['id']
    for o in d['options'][1:]:
        if set(o['forms']) != keys:
            problems.append(f'{d["id"]}: option {o["label"]!r} fills {sorted(o["forms"])} not {sorted(keys)}')
    forms0 = d['options'][0]['forms'].values()
    if all(not f.strip() for f in forms0):
        problems.append(f'{d["id"]}: option 0 all empty')
    if all(slot.sub('', f).strip(' ,') == '' for f in forms0):
        problems.append(f'{d["id"]}: option 0 is only other slots')
used = set()
for text in list(data['verses'].values()) + [f for d in data['decisions'] for o in d['options'] for f in o['forms'].values()]:
    used |= set(slot.findall(text))
for k in used - set(owner):
    problems.append(f'slot {k} used but not defined')
for k in set(owner) - used:
    problems.append(f'slot {k} of {owner[k]} reaches no verse')
print('\n'.join(problems) or f"ok: {len(data['decisions'])} decisions, {len(owner)} slots, version {data['version']}, status {data['status']}")
