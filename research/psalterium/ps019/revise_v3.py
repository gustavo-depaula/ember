"""Ps 19 draft 2 -> draft 3, after the v2 Latinist gate. python3.13 research/psalterium/ps019/revise_v3.py
Reads prayed.v2.json (never prayed.json), so it is safe to re-run; then add audit_v3.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v2.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}

data['version'] = 3

# 19:7a — the Latinist's minor (v1) became MAJOR at the gate (v2): the perfect. His fix 'agora soube' was already option 3.
d = decisions['cognovi']
d['why'] += (' Gate (draft 2): the Latinist again, now MAJOR — «O perfeito exprime a aquisição do conhecimento; o presente conserva apenas o'
             ' estado resultante … não preserva o tempo» → ‘agora soube’. Taken: his fix is the option that keeps the perfect in the verb Portuguese'
             ' uses with ‘que’ (118:152 ‘soube’); the cost is a slightly conversational ring (‘I have just learned’). ‘agora sei’ stays one touch away.')
soube = next(o for o in d['options'] if o['label'] == 'agora soube')
d['options'].remove(soube)
first = d['options'][0]
first['note'] = 'Drafts 1–2. ' + first['note'].removeprefix('Ruling: ')
soube['note'] = ('Ruling (draft 3): the Latinist’s fix at the gate — the perfect of ‘come to know’, in saber (the collocation with ‘que’,'
                 ' as 118:152).')
soube['from'] = 'latinist'
d['options'].insert(0, soube)

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v3 written')
