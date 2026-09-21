"""Confirm that the current draft leaves the wording of 118:1–32 exactly as draft 3 had it, and that
prayed.vos.json is the current prayed.json flattened. python3.13 research/psalterium/ps118/verify_untouched.py"""

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


_, old = flat('prayed.v3.json')
data, new = flat('prayed.json')
print('118:1–32 unchanged since draft 3:', all(old[k] == new[k] for k in old), f'({len(old)} → {len(new)} verses)')
print('prayed.vos.json is current:', json.loads((here / 'prayed.vos.json').read_text(encoding='utf-8')) == new)
print(data['version'], data['status'], data['range'], len(data['decisions']), 'decisions;', [s['step'] for s in data['audit']])
