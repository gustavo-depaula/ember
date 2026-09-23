"""Normalize Ps 131 audit outcomes to the brief's vocabulary: taken | refused | option."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
optionDecisions = {'si_oath', 'audivimus', 'panibus', 'sibi'}
for step in d['audit']:
    for o in step.get('outcomes', []):
        if o['outcome'] == 'adopted':
            o['outcome'] = 'taken'
        elif o['outcome'] in ('kept', 'held'):
            if o.get('decision') in optionDecisions:
                o['outcome'] = 'option'
            else:
                o['outcome'] = 'refused'
                o.pop('decision', None) if o.get('decision') not in ('tempora', 'benedicens') else None
        elif o['outcome'] == 'refused' and o.get('decision') in optionDecisions:
            o['outcome'] = 'option'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(sorted({o['outcome'] for s in d['audit'] for o in s.get('outcomes', [])}))
