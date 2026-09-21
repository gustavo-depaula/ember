"""Sanity checks on ps017/prayed.json beyond checks.py: python3.13 research/psalterium/ps020/validate.py <folder> (copied from ps017)
- every {slot} used in a verse (or inside another form) is filled by exactly one decision's option 0
- no option 0 whose forms are all empty
- an option 0 made only of other slots (a decision that follows another, as 118:145 `requiram` follows `exquirere`)
  is allowed, as latin.resolve allows it; what is refused is a chain that comes back to itself
- every option of a decision fills the same slots
- a `standing` decision (Ps 4's `governing`: a rule, not a wording) has no forms, and is skipped
- every decision's slots reach a verse"""
import json
import re
from pathlib import Path

import sys
here = Path(sys.argv[1]).resolve()
data = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
slot = re.compile(r'\{(\w+)\}')
owner, problems, first = {}, [], {}
for d in data['decisions']:
    if not any('forms' in o for o in d['options']):
        if d.get('kind') != 'standing':
            problems.append(f'{d["id"]}: no option has forms, and the decision is not a standing one')
        continue
    keys = set(d['options'][0].get('forms', {}))
    for k in keys:
        if k in owner:
            problems.append(f'slot {k} in two decisions: {owner[k]}, {d["id"]}')
        owner[k] = d['id']
    for o in d['options'][1:]:
        if set(o.get('forms', {})) != keys:
            problems.append(f'{d["id"]}: option {o["label"]!r} fills {sorted(o.get("forms", {}))} not {sorted(keys)}')
    forms0 = d['options'][0].get('forms', {})
    first.update(forms0)
    if all(not f.strip() for f in forms0.values()):
        problems.append(f'{d["id"]}: option 0 all empty')


def cycles(name, seen=()):
    if name in seen:
        return True
    return any(cycles(inner, seen + (name,)) for inner in slot.findall(first.get(name, '')))


for k in first:
    if cycles(k):
        problems.append(f'slot {k} of {owner[k]}: option 0 comes back to itself through other slots')
used = set()
for text in list(data['verses'].values()) + [f for d in data['decisions'] for o in d['options'] for f in o.get('forms', {}).values()]:
    used |= set(slot.findall(text if isinstance(text, str) else ' '.join(text.values())))
for k in used - set(owner):
    problems.append(f'slot {k} used but not defined')
for k in set(owner) - used:
    problems.append(f'slot {k} of {owner[k]} reaches no verse')
print('\n'.join(problems) or f"ok: {len(data['decisions'])} decisions, {len(owner)} slots, version {data['version']}, status {data['status']}")
sys.exit(1 if problems else 0)
