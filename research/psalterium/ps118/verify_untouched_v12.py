"""Confirm that the current draft leaves the wording of 118:1–128 exactly as draft 12 had it (flattened text and
raw slotted text), that no draft-12 decision lost an option, a label or a form (slots may only be ADDED), that the
old choices and audit steps are intact, and that prayed.vos.json is the current prayed.json flattened.
The v12 twin of verify_untouched_v6.py.   python3.13 research/psalterium/ps118/verify_untouched_v12.py"""

import json
import re
import sys
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


oldData, old = flat('prayed.v12.json')
data, new = flat('prayed.json')
results = []
results.append(('118:1–128 unchanged since draft 12 (flattened)', all(old[k] == new[k] for k in old)))
results.append(('raw (slotted) 118:1–128 unchanged', all(oldData['verses'][k] == data['verses'][k] for k in oldData['verses'])))
results.append(('the old verses come first, in the same order', list(data['verses'])[: len(old)] == list(old)))

byId = {d['id']: d for d in data['decisions']}
lost = []
for d in oldData['decisions']:
    now = byId.get(d['id'])
    if not now:
        lost.append(d['id'] + ' (decision gone)')
        continue
    nowOptions = {o['label']: o for o in now['options']}
    if d['options'][0]['label'] != now['options'][0]['label']:
        lost.append(d['id'] + ' (option 0 changed)')
    for o in d['options']:
        if o['label'] not in nowOptions:
            lost.append(f"{d['id']} / {o['label']} (option gone)")
            continue
        for slot, form in o['forms'].items():
            if nowOptions[o['label']]['forms'].get(slot) != form:
                lost.append(f"{d['id']} / {o['label']} / {slot}")
results.append((f'draft-12 decisions intact (options, labels, forms) {lost}', not lost))
results.append(('old choices intact', all(data['choices'].get(k) == v for k, v in oldData['choices'].items())))
auditIntact = all(
    (new_ == old_) or (old_['step'] == 'handoff' and new_['note'].startswith(old_['note']))  # the handoff step is extended by each agent
    for old_, new_ in zip(oldData['audit'], data['audit'])
)
results.append(('old audit steps intact (handoff only extended)', auditIntact))
results.append(('prayed.vos.json is current', json.loads((here / 'prayed.vos.json').read_text(encoding='utf-8')) == new))
for label, ok in results:
    print('ok  ' if ok else 'FAIL', label)
print(f"{len(old)} → {len(new)} verses; {len(oldData['decisions'])} → {len(data['decisions'])} decisions")
print(data['version'], data['status'], data.get('range'), [s['step'] for s in data['audit']][len(oldData['audit']):])
sys.exit(0 if all(ok for _, ok in results) else 1)
