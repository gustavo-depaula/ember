import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
x = dec['idipsum']
old = x['options'][0]
old['note'] = "DRB's reading, but its final *fim* rhymes with 40:8's *mim* (checks)."
x['options'] = [
    {'label': 'no mesmo sentido', 'forms': {'idipsum': 'no mesmo sentido'}, 'note': "Ruling: DRB 'to the same purpose'; *in* + accusative, *idípsum* 'the very same'. Chosen over *para o mesmo fim* for the rhyme *fim / mim* at two neighbouring finals.", 'from': 'checks'},
    old,
] + x['options'][1:]
d['choices']['40:7b'] = 'The ruling on *in idípsum* is local (D9 deferred); see decision `idipsum`. The second colon is +1 on the Latin.'
for step in d['audit']:
    if step['step'] == 'draft':
        step['note'] = step['note'].replace('*para o mesmo fim*', '*no mesmo sentido*')
d['audit'].append({'step': 'checks', 'note': 'Draft 1: hard pass. Length: 40:2 first colon +4 (*Bem-aventurado* and *necessitado*, the settled words), 40:14 second +4 (*assim seja* twice for *fiat* twice), 40:9 first +3, 40:12 second +3 (*à minha custa*, the formula), 40:7 first −4, 40:12 first −3; accepted. Rhyme 40:7b / 40:8 (*fim … mim*) mended before any reader: *no mesmo sentido*. Cadences: several oxytone finals where the Latin is paroxytone (*Senhor*, *mim*, *vós*); allowed by rule 4.'})
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
