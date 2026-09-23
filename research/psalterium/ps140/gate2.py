"""Ps 140: record the v2 Latinist gate in prayed.json."""
import json
from pathlib import Path

p = Path('research/psalterium/ps140/prayed.json')
d = json.loads(p.read_text())
dec = {x['id']: x for x in d['decisions']}
b = dec['beneplacitis']
if not any(o['label'] == 'nas coisas que lhes agradam' for o in b['options']):
    b['options'].append({'label': 'nas coisas que lhes agradam', 'forms': {'beneplacitis': 'nas coisas que lhes agradam'},
                         'note': "The v2 Latinist's (minor): keeps the plural. Refused: 'coisas' is a noun the Latin does not have, and the relative 'o que' already covers many things; four syllables more.", 'from': 'latinist'})
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json',
        'note': 'Gate on v2 — Claude Opus 5.5, fresh context, with latin.json. 2 minor, no major; both refused and kept as options. Gate clean of majors.',
        'outcomes': [
            {'verse': '140:5', 'remark': "'unja' drops the fattening; asks 'engorde' (again, as v1)", 'outcome': 'option', 'decision': 'impinguet', 'reason': 'The impinguáre row (22:5b, where the Latinist withdrew the same request) is ungir; two minors on the same point are weighed, not obeyed.'},
            {'verse': '140:6', 'remark': "plural beneplácitis collapsed; asks 'nas coisas que lhes agradam'", 'outcome': 'option', 'decision': 'beneplacitis', 'reason': "Supplies 'coisas'; 'o que' is number-neutral in Portuguese."},
        ]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
