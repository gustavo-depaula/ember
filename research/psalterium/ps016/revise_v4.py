"""Ps 16 draft 4: the Latinist's reading of draft 3 weighed. python3.13 research/psalterium/ps016/revise_v4.py
Reads prayed.v3.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v3.json').read_text(encoding='utf-8'))
data['version'] = 4
data['verses']['16:14b'] = 'Senhor, {divide} dos poucos da terra na vida deles: * o ventre deles {adimpletus} {absconditis}.'
at = next(i for i, x in enumerate(data['decisions']) if x['id'] == 'absconditis')
data['decisions'].insert(at + 1, {
    'id': 'adimpletus', 'refs': ['16:14b'], 'latin': 'adimplétus est venter eórum', 'kind': 'grammar',
    'why': ("adimplére → encher (15:11 'vós me enchereis'); here the perfect passive (ἐπλήσθη). Drafts 1–3 had the pronominal passive 'se encheu', Portuguese's everyday "
            "passive for a thing filled. The Latinist marked it minor on draft 1, minor on draft 2 and MAJOR on draft 3, the words unchanged (the variance D24 records), each time "
            "for 'foi enchido'. Taken in draft 4, verbatim: 'foi enchido' is grammatical Portuguese (the regular participle with 'ser'), it keeps the voice he asks for, and it now "
            "stands beside 16:14c 'Foram saciados', so the Latin's two passives in a row (adimplétus est … saturáti sunt) are heard as two. Douay-Rheims 'is filled'; Matos Soares 1932 'está cheio'."),
    'options': [
        {'label': 'foi enchido', 'forms': {'adimpletus': 'foi enchido'}, 'note': "Ruling (draft 4): the Latinist's fix, the perfect passive.", 'from': 'latinist'},
        {'label': 'se encheu', 'forms': {'adimpletus': 'se encheu'}, 'note': 'Drafts 1–3: the pronominal passive; the Latinist heard a change of state (minor, minor, major).', 'from': 'draft'},
        {'label': 'ficou cheio', 'forms': {'adimpletus': 'ficou cheio'}, 'note': "The resultative with 'ficar'; natural, the agent's act less heard. Matos Soares 1932 'está cheio'.", 'from': 'MS1932'},
    ],
})
data['audit'].extend([
    {'step': 'checks', 'note': 'Draft 3: hard pass; soft flags as draft 2, no rhyme flag.'},
    {'step': 'latinist', 'file': 'critic/v3.latinist.json',
     'note': "Draft 3 — the gate re-run on the restored plural (16:2 passed). One major, one minor; the marks confirmed.",
     'outcomes': [
         {'verse': '16:14b', 'remark': "MAJOR (minor on drafts 1 and 2, words unchanged): 'se encheu' does not keep the perfect passive → 'o ventre deles foi enchido das vossas coisas escondidas'", 'outcome': 'taken', 'decision': 'adimpletus',
          'reason': "Verbatim in draft 4: grammatical, and it pairs with 16:14c 'Foram saciados'."},
         {'verse': '16:11', 'remark': "minor: 'para se inclinarem' may make the enemies bend, not the eyes → 'determinaram inclinar os seus olhos para a terra'", 'outcome': 'refused', 'decision': 'declinare',
          'reason': "The words are his own fix to draft 1, which had exactly this build ('resolveram inclinar os seus olhos') and which he then marked MAJOR for losing the setting of the eyes. The nearest plural subject of 'se inclinarem' is 'os seus olhos', and the blind reader heard the gaze lowered. Draft 1's build stays option 3."},
     ]},
    {'step': 'revision', 'version': 4,
     'note': "v4. One verb: 16:14b 'o ventre deles foi enchido das vossas coisas escondidas' (the Latinist's own words, taken verbatim; new decision 'adimpletus'). Not re-read by a critic: the change is the gate's fix word for word. Draft 3 is prayed.v3.json (flat text prayed.v3.vos.json). Script: ps016/revise_v4.py."},
])
# 16:14b outcomes earlier refused 'foi enchido': point them at the new decision
for step in data['audit']:
    for o in step.get('outcomes', []):
        if o.get('verse') == '16:14b' and 'enchido' in o.get('remark', '') and o['outcome'] == 'refused':
            o['decision'] = 'adimpletus'
            o['reason'] += ' (Taken in draft 4, when the same words drew a major on draft 3 — see decision adimpletus.)'
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok v4')
