"""Draft 16 of Ps 118, no wording change: tests/check-site.js found that decision "v154b" had no word to touch — both
its forms were nothing but slots of other decisions ({e_propter} {vivifica}), and a nested slot keeps its own owner.
The preposition of 118:154b now belongs to v154b ("pel" + the term's own singular form, which contracts rightly with
every option of "eloquia": pelo que dissestes / pelo vosso dito / pela vossa palavra …), and the slot e_propter, which
only this verse used, leaves "eloquia".   Run once:  python3.13 research/psalterium/ps118/fix_v16_touch.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
byId = {d['id']: d for d in data['decisions']}
d = byId['v154b']
if data['version'] != 16 or 'pel{e_sg}' in json.dumps(d, ensure_ascii=False):
    sys.exit('expected draft 16 before this fix')

for o in byId['eloquia']['options']:
    o['forms'].pop('e_propter')
d['latin'] = 'et rédime me: * propter elóquium tuum vivífica me'
d['options'][0]['forms'] = {'v154b': 'pel{e_sg} {vivifica}'}
d['options'][1]['forms'] = {'v154b': '{vivifica} pel{e_sg}'}
d['options'].append({
    'label': 'por causa do que dissestes vivificai-me', 'forms': {'v154b': 'por causa d{e_sg} {vivifica}'},
    'note': 'Draft 14\'s wording: propter in full. Left in draft 16 because "a minha causa … por causa do" set one word in two senses inside one verse (the stylist). It returns only if decision "judica154" goes back to "Julgai o meu juízo".', 'from': 'draft'})
d['why'] += ' The preposition is this decision\'s word to touch: propter → "por" contracted with the term\'s article ("pelo que dissestes"; Matos Soares 1932 has "pela"), cause being what the Latin says; the term itself stays with decision "eloquia" (slot e_sg).'

checks = [s for s in data['audit'] if s['step'] == 'checks'][-1]
checks['note'] += ' Afterwards tests/check-site.js found decision "v154b" untouchable on the site (both forms were only other decisions\' slots); mended without changing a word of the text by ps118/fix_v16_touch.py — the preposition of 118:154b now belongs to it and the slot e_propter is gone from "eloquia". prayed.vos.json is byte-identical, so every critic file still describes the text.'

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v154b mended')
