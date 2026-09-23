"""Ps 110 draft 3: record the v2 Latinist gate (prayed.v2.json kept)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text())
assert d['version'] == 2
d['version'] = 3
d['status'] = 'reviewed'

dec = {x['id']: x for x in d['decisions']}

ex = dec['exquisita']
ex['why'] += (
    ' **Draft 3:** the v2 gate asked the opposite of the v1 gate — *em* reads as a locative ("searched for inside his '
    'wills") and blurs the relation of conformity; fix *segundo*. The two runs contradict each other; the deciding '
    'weights are that *segundo* is DRB\'s reading, that v1 already called it defensible, and that the stylist found '
    'the colon hard to parse even with it — *em* is harder. Back to draft 1\'s *procuradas segundo*; *em* stays an option.'
)
opts = {o['label']: o for o in ex['options']}
seg = opts['procuradas segundo']
seg['note'] = 'Ruling (draft 3, = draft 1): DRB "according to"; asked by the v2 gate, called defensible by the v1 gate.'
seg['from'] = 'latinist'
em = opts['procuradas em']
em['note'] = 'draft 2, from the v1 gate (keeps *in* open); the v2 gate heard it as a locative.'
ex['options'] = [seg, em] + [o for o in ex['options'] if o['label'] not in ('procuradas segundo', 'procuradas em')]

it = dec['intellectus']
it['why'] += (
    ' **v2 gate (minor):** *praticam* leans the open *eum* toward *timor*; asked *fazem*. Held: *praticar* equally takes '
    'wisdom, the commandments or understanding as object (the ambiguity reader heard all three), whereas *fazer o temor* '
    'or *fazer o entendimento* is heard as nothing; the v1 gate passed *praticam*. *fazem* is the option.'
)
for o in it['options']:
    if o['label'].endswith('o fazem'):
        o['from'] = 'latinist'
        o['note'] = "the v2 gate's: the Latin's light verb; *fazer o temor* is heard as nothing in Portuguese."

d['choices']['110:2'] = d['choices']['110:2'].replace(
    ' Draft 2: *segundo* → *em* (Latinist; decision `exquisita`).',
    ' Draft 2 had *em* (v1 gate); draft 3 returns to *segundo* (v2 gate; decision `exquisita`).')

d['audit'] += [
    {"step": "latinist", "file": "critic/v2.latinist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
     "note": "Gate clean of majors: two minors. 110:2 taken (reverses the v1 gate's request — the runs contradict; the draft-1 wording both gates have now accepted as right or defensible is restored). 110:10b held with option.",
     "outcomes": [
         {"verse": "110:2", "remark": "*em* reads as locative; *segundo* for the relation of conformity", "outcome": "taken"},
         {"verse": "110:10b", "remark": "*praticam* narrows *eum* toward *timor*; *fazem*", "outcome": "option", "decision": "intellectus",
          "reason": "*fazer o temor* is not Portuguese; *praticar* stays open between fear, wisdom and understanding; the v1 gate passed it"}
     ]},
    {"step": "revision", "version": 3,
     "note": "v3: 110:2 back to *procuradas segundo* (= draft 1, which both gates have read). prayed.v2.json kept. No further gate owed: the only change restores wording the v1 gate read and the v2 gate asked for."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
