"""Ps 18 draft 3: the Latinist gate on draft 2 weighed. python3.13 research/psalterium/ps018/revise_v3.py
Reads prayed.v2.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v2.json').read_text(encoding='utf-8'))
data['version'] = 3
byId = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


d = byId['alienis']
d['why'] += (" Heard (draft 2, the gate): the Latinist, MAJOR — *das alheias* fixes the faults of others; aliénis is open to persons, and the next verse's "
             "masculine *domináti* favours them → *e dos alheios poupai o vosso servo*. Taken in substance, with the glossary's word for persons: the participle "
             "is decisive — *delícta* is neuter and would give *domináta*; the subject of 18:14b is masculine, the aliéni (the Greek the same: ἀπὸ ἀλλοτρίων … "
             "μου κατακυριεύσωσιν). So the Latin's reading is 'spare your servant from strangers; if they have not ruled over me'. *dos estranhos* is the "
             "row's word for persons (17:46 *filhos estranhos*); *alheios* as a noun for people is not said. The noun *faltas* supplied at 18:13's middle colon "
             "now serves only *ab occúltis meis* (neuter, 'my hidden things'). The draft-2 *alheias* came from reading the adjectives as one series; the Latinist's "
             "own first fix asked for it, the second refutes it (D24's variance), and the grammar decides.")
d['options'] = [
    opt('dos estranhos', {'alienis': 'dos estranhos'}, "Ruling (draft 3): persons, as *domináti* requires; the glossary's *estranho* for persons.", 'glossary'),
    opt('dos alheios', {'alienis': 'dos alheios'}, "The Latinist's gate fix; *alheios* as a noun for people is not current.", 'latinist'),
    opt('das alheias', {'alienis': 'das alheias'}, "Draft 2: others' faults (DRB *those of others*); the Latinist marked it major at the gate.", 'DRB'),
]
data['verses']['18:13'] = data['verses']['18:13'].replace('e das {alienis}', 'e {alienis}')

byId['delicta']['why'] += " Draft 3: the noun supplied now serves only *ab occúltis meis*; *ab aliénis* is persons (see alienis), so nothing is carried into it."

d = byId['dominati']
d['why'] += " Draft 3: the subject is the strangers of 18:13 (masculine domináti), which *Se não me tiverem dominado* now follows without a supplied noun."

data['audit'].extend([
    {'step': 'checks', 'note': 'Draft 2: hard pass (checks.py exit 0). Soft flags accepted: 18:3 +6 / +5 (*Um dia … ao outro dia*, *uma noite … à outra noite*: the Latin\'s datives spelt out, taken for the blind reader\'s misheard *à noite*); 18:6a −5 / +3; 18:6b +4; 18:9 +3; 18:10 +5; 18:13 +4. No rhyme flag (18:5\'s gone with the stylist\'s order).'},
    {'step': 'latinist', 'file': 'critic/v2.latinist.json',
     'note': 'Draft 2, the gate. Two majors, two minors; the marks confirmed. «A tradução conserva, em geral, o sentido do latim e suas imagens.» One major taken in substance (18:13), one held (18:15b); minors refused.',
     'outcomes': [
         {'verse': '18:10', 'remark': "minor again: 'pelo século do século'", 'outcome': 'refused', 'reason': 'D27, as at draft 1.'},
         {'verse': '18:11', 'remark': "minor: 'muitas pedras preciosas' turns the collective singular plural → 'muita pedra preciosa'", 'outcome': 'refused', 'decision': 'multa',
          'reason': 'Number is grammar (D2); the stylist found the singular unnatural; the quantity kept, as he says.'},
         {'verse': '18:13', 'remark': "MAJOR: 'das alheias' fixes others' faults; aliénis open to persons, favoured by masculine domináti → 'dos alheios'", 'outcome': 'taken', 'decision': 'alienis',
          'reason': "Taken in substance: *dos estranhos* (the glossary's word for persons). domináti is masculine, so its subject is persons, not delícta."},
         {'verse': '18:15b', 'remark': "MAJOR again: 'meu auxílio' → 'meu auxiliador'", 'outcome': 'refused', 'decision': 'adjutor',
          'reason': 'HELD (D19), as at draft 1; for a ruling.'},
     ]},
    {'step': 'revision', 'version': 3,
     'note': "v3. Changed against draft 2: 18:13 *e dos estranhos poupai o vosso servo* (Latinist gate major, in substance: *domináti* makes the aliéni persons). Held: 18:15b *auxílio*. Draft 2 is prayed.v2.json / prayed.v2.vos.json. Script: ps018/revise_v3.py."},
])
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v3 written')
