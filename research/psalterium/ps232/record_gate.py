"""Record the v2 Latinist gate on ps232, take its 1:49 minor, and mark the canticle reviewed.
python3.13 research/psalterium/ps232/record_gate.py  (refuses to run twice)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(s['step'] == 'latinist' and s.get('file') == 'critic/v2.latinist.json' for s in d['audit']):
    raise SystemExit('already recorded')
dec = {x['id']: x for x in d['decisions']}
f = dec['fecit']
f['why'] += (' Gate: the v2 Latinist (minor) heard *por mim* as "through me" or "in my place", which the dative does not carry, '
             'and asked for *fez em mim*. Taken after the gate. Two readers have now struck the bare clitic and *por*; *em mim* '
             'is the MS1932 and Diurnal wording, and the gate asked for it.')
em = next(o for o in f['options'] if o['forms']['fecit'] == 'fez em mim')
f['options'].remove(em)
em['note'] = 'Gate (v2 Latinist): MS1932 and the Diurnal. The great things are done in her; it avoids *por mim* ("through me") and the bare clitic ("made me into").'
em['from'] = 'latinist'
f['options'].insert(0, em)
d['audit'].append({
    'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': ('Gate on v2: claude-opus-5-5, fresh context, with latin.json. No majors, one minor, taken. It confirmed the tenses, '
             'persons, images, the open Abraham apposition, and the + and * marks in every verse.'),
    'outcomes': [{'verse': '1:49', 'remark': 'por mim may be heard as "through me" / "in my place"; fez em mim', 'outcome': 'taken',
                  'decision': 'fecit', 'reason': 'Only this preposition changes, to the MS1932 and Diurnal wording; checks re-run and they pass.'}]})
d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded; status reviewed')
