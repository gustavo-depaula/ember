"""Record the v2 Latinist gate in Ps 148. python3.13 research/psalterium/ps148/gate2.py"""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
d['status'] = 'reviewed'
s = next(x for x in d['decisions'] if x['id'] == 'solius')
s['options'].append({"label": "é exaltado o nome só dele", "forms": {"solius": "é exaltado o nome só dele"}, "note": "The v2 Latinist (minor): *solíus* agrees with *ejus*, 'the name of him alone', so *só* should restrict the person. Held as an option: in Portuguese *só o seu nome* already says 'his name and no other's' — the contrast with other beings is the one heard (DRB 'his name alone', MS1932 'só o seu nome'); *o nome só dele* is not how the line would be said, and the same colon stands alone in two antiphons.", "from": "latinist"})
s['why'] += " The v2 Latinist (minor) wanted *só* on the person (*o nome só dele*); held, reason in the option."
d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "Claude Opus 5.5, fresh context, with latin.json. Gate on draft 2: no majors; one minor verse (148:12) with two remarks, both held. The v2 changes (148:4 *acima dos céus*, 148:14a *acima do céu e da terra*, 148:14b order) drew no remark.", "outcomes": [
    {"verse": "148:12", "remark": "solíus agrees with ejus: 'o nome só dele'", "outcome": "option", "decision": "solius", "reason": "*só o seu nome* already contrasts him with others in Portuguese; the fix is not sayable; DRB and MS1932 have the same build"},
    {"verse": "148:12", "remark": "the (13) marker is missing", "outcome": "refused", "reason": "the brief: inline (13)-style markers are not translated and not reproduced"}
]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
