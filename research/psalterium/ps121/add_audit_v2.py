"""Record the v2 Latinist gate in Ps 121's audit and mark the psalm reviewed."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
if any(s.get('file') == 'critic/v2.latinist.json' for s in d['audit']):
    raise SystemExit('already added')
d['status'] = 'reviewed'
d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'claude-opus-5-5, fresh context, read latin.json. Draft 2. Two minors, no major: both held with options. Gate clean of majors.', 'outcomes': [
    {'verse': '121:2', 'remark': "'se detinham' adds stopping → estavam parados", 'outcome': 'option', 'decision': 'stantes', 'reason': "the gate contradicts itself: on draft 1 it marked 'parados' for the same fault (a stop). Two other readers heard 'parados' as stuck or idle; 'se detinham' is the deter-se row, DM1962's verb, and the Latin's length. Draft 1's wording stays option 1"},
    {'verse': '121:4', 'remark': "'de Israel' closes the indeclinable Israël on the genitive → para Israel", 'outcome': 'option', 'decision': 'israel', 'reason': "'para' closes it the other way, on the Greek's dative; 'de' is the Latin surface and Douay-Rheims, and in Portuguese it is also 'concerning'. Raised only on the second reading"}
]})
for x in d['decisions']:
    if x['id'] == 'israel':
        x['options'][1]['note'] += ' Asked for by the v2 Latinist gate (minor); held, reason in the audit.'
        x['options'][1]['from'] = 'latinist'
    if x['id'] == 'stantes':
        for o in x['options']:
            if o['label'] == 'estavam parados':
                o['note'] += ' The v2 Latinist gate asked for it back (minor), having marked it on draft 1; held.'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
