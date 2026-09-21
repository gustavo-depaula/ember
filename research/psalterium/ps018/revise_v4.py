"""Ps 18 draft 4: the Latinist gate on draft 3 weighed. python3.13 research/psalterium/ps018/revise_v4.py
Reads prayed.v3.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v3.json').read_text(encoding='utf-8'))
data['version'] = 4
byId = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


d = byId['alienis']
d['why'] += (" Heard (draft 3, the gate): the Latinist, MAJOR — *dos estranhos* chooses persons; the Latin also keeps others' faults, in contrast with "
             "*occúltis meis*, and the ambiguity must stay → *dos alheios* (his fix for the second time). Taken verbatim: the Portuguese masculine plural, "
             "like the Latin's masculine/neuter *aliénis*, holds both the people and what is theirs (*o alheio*, what belongs to another), and it still "
             "agrees with *domináti*'s masculine subject in 18:14b. The three readings the gates asked for (faults of others, strangers, and both) are "
             "the three options; the rule that decides is D2's — keep the Latin's ambiguity.")
d['options'] = [
    opt('dos alheios', {'alienis': 'dos alheios'}, "Ruling (draft 4): the Latinist's fix at two gates; masculine plural open to persons and to what is theirs, as aliénis is.", 'latinist'),
    opt('dos estranhos', {'alienis': 'dos estranhos'}, "Draft 3: persons only (the glossary's word for them); the Latinist marked it major.", 'glossary'),
    opt('das alheias', {'alienis': 'das alheias'}, "Draft 2: others' faults only (DRB *those of others*); marked major.", 'DRB'),
]

data['audit'].extend([
    {'step': 'checks', 'note': 'Draft 3: hard pass (checks.py exit 0). Soft flags as at draft 2; 18:13 last colon 12 / 12.'},
    {'step': 'latinist', 'file': 'critic/v3.latinist.json',
     'note': 'Draft 3, the gate. Two majors, two minors; the marks confirmed. One major taken verbatim (18:13), one held (18:15b); minors refused.',
     'outcomes': [
         {'verse': '18:10', 'remark': "minor, third time: 'pelo século do século'", 'outcome': 'refused', 'reason': 'D27.'},
         {'verse': '18:11', 'remark': "minor again: 'muita pedra preciosa'", 'outcome': 'refused', 'decision': 'multa', 'reason': 'Number is grammar (D2); the stylist.'},
         {'verse': '18:13', 'remark': "MAJOR: 'dos estranhos' closes aliénis to persons; others' faults must stay open → 'dos alheios'", 'outcome': 'taken', 'decision': 'alienis',
          'reason': 'Taken verbatim: the masculine plural holds both readings, as the Latin does, and agrees with domináti.'},
         {'verse': '18:15b', 'remark': "MAJOR, third time: 'meu auxiliador'", 'outcome': 'refused', 'decision': 'adjutor', 'reason': 'HELD (D19); for a ruling.'},
     ]},
    {'step': 'revision', 'version': 4,
     'note': "v4. Changed against draft 3: 18:13 *e dos alheios poupai o vosso servo* (Latinist gate major, verbatim). Held: 18:15b *auxílio*. Draft 3 is prayed.v3.json / prayed.v3.vos.json. Script: ps018/revise_v4.py."},
])
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v4 written')
