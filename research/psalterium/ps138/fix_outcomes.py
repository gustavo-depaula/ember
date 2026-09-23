"""Turn ps138's prose `outcomes` strings into the structured records AGENT-BRIEF.md asks for (site.py needs dicts)."""

import json
import re
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
p = json.loads(path.read_text(encoding='utf-8'))


def record(text):
    ref = re.match(r'(138:\d+[ab]?)\s*', text)
    head, _, reason = text[ref.end() if ref else 0:].partition(': ')
    low = text.lower()
    if 'flagged for gustavo' in low:
        outcome = 'pending'
    elif 'kept as option' in low or 'option kept' in low or 'option notes' in low:
        outcome = 'option'
    elif re.search(r'\b(taken|fixed by|now \*)', low):
        outcome = 'taken'
    else:
        outcome = 'refused'
    return {'verse': ref.group(1) if ref else '138', 'remark': head.strip() if ref else text, 'outcome': outcome, 'reason': reason.strip() or text}


for step in p['audit']:
    if step.get('outcomes'):
        step['outcomes'] = [o if isinstance(o, dict) else record(o) for o in step['outcomes']]
path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
for step in p['audit']:
    for o in step.get('outcomes') or []:
        print(step['step'], o['verse'], o['outcome'], '|', o['remark'][:60])
