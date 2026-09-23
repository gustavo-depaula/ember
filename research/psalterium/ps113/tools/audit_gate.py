import json
from pathlib import Path
p = Path('research/psalterium/ps113/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
assert d['audit'][-1]['step'] == 'checks v2'
dec = {x['id']: x for x in d['decisions']}
dec['benedicti']['options'].append({'label': 'Benditos vós', 'forms': {'benedicti': 'Benditos vós'}, 'note': "Latinist gate: verbless, as the Latin; leaves wish and statement open, but a verbless Portuguese clause reads as a fragment when chanted.", 'from': 'latinist'})
d['audit'].append({'step': 'latinist gate v2', 'file': 'critic/v2.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. No majors; two minor points, both already exposed as decisions.',
  'outcomes': [
    {'ref': '113:17–19', 'from': 'latinist (minor)', 'outcome': "refused on the adjútor row (uniform 'auxílio' across the psalter); the agent noun stays an option in decision adj ('auxiliador'; the gate proposed 'ajudador', same point)."},
    {'ref': '113:23', 'from': 'latinist (minor)', 'outcome': "refused: the wish follows 113:22's jussive and a verbless 'Benditos vós pelo Senhor' reads as a fragment; added as a third option in decision benedicti."},
  ]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
