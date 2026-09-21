"""Confirm that the current draft leaves the wording of 118:1–80 exactly as draft 6 had it (flattened text),
that no draft-6 decision lost an option, a label or a form, and that prayed.vos.json is the current
prayed.json flattened.   python3.13 research/psalterium/ps118/verify_untouched_v6.py"""

import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent


def flat(name):
    data = json.loads((here / name).read_text(encoding='utf-8'))
    forms = {}
    for decision in data['decisions']:
        forms.update(decision['options'][0]['forms'])

    def fill(text):
        while '{' in text:
            text = re.sub(r'\{(\w+)\}', lambda m: forms[m.group(1)], text)
        return text

    return data, {k: fill(v) for k, v in data['verses'].items()}


oldData, old = flat('prayed.v6.json')
data, new = flat('prayed.json')
print('118:1–80 unchanged since draft 6:', all(old[k] == new[k] for k in old), f'({len(old)} → {len(new)} verses)')
print('raw (slotted) 118:1–80 unchanged:', all(oldData['verses'][k] == data['verses'][k] for k in oldData['verses']))

byId = {d['id']: d for d in data['decisions']}
lost = []
for d in oldData['decisions']:
    now = byId.get(d['id'])
    if not now:
        lost.append(d['id'] + ' (decision gone)')
        continue
    nowOptions = {o['label']: o for o in now['options']}
    if [o['label'] for o in d['options']][0] != now['options'][0]['label']:
        lost.append(d['id'] + ' (option 0 changed)')
    for o in d['options']:
        if o['label'] not in nowOptions:
            lost.append(f"{d['id']} / {o['label']} (option gone)")
            continue
        for slot, form in o['forms'].items():
            if nowOptions[o['label']]['forms'].get(slot) != form:
                lost.append(f"{d['id']} / {o['label']} / {slot}")
print('draft-6 decisions intact (options, labels, forms):', not lost, lost)
print('old choices intact:', all(data['choices'].get(k) == v for k, v in oldData['choices'].items()))
auditIntact = all(
    (new_ == old_) or (old_['step'] == 'handoff' and new_['note'].startswith(old_['note']))  # the handoff step is extended by each agent
    for old_, new_ in zip(oldData['audit'], data['audit'])
)
print('old audit steps intact (handoff only extended):', auditIntact)
print('prayed.vos.json is current:', json.loads((here / 'prayed.vos.json').read_text(encoding='utf-8')) == new)
print(data['version'], data['status'], data['range'], len(data['decisions']), 'decisions;', [s['step'] for s in data['audit']][len(oldData['audit']):])
