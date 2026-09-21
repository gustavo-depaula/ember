"""Ps 31 draft 2 -> draft 3: the one major of the v2 Latinist gate, taken verbatim. python3.13 research/psalterium/ps031/revise_v3.py
Reads prayed.v2.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v2.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}

data['version'] = 3
d = decisions['domine9']
d['why'] += (' Gate (draft 2): the Latinist, MAJOR — «O vocativo “Senhor” não consta do latim e explicita um destinatário que o imperativo'
             ' deixa sem nome» → ‘Com cabresto e freio, apertai as maxilas deles’. Taken verbatim in draft 3: rule 2 lets a subject'
             ' *pronoun* be supplied, not a vocative noun, and Matos Soares 1932\'s \'(ó Senhor)\' is one of the parenthetical glosses D28'
             ' says to ignore. The blind reader\'s wrong first hearing (\'apertai\' said to the congregation) comes back; it is the cost of'
             ' vós to both addressees, which the Latin tells apart only by number, and \'de vós\' at the end of the verse still names God.'
             ' \'Senhor, \' is option 1 for Gustavo.')
# option 0 may not be empty, so the slot spans the colon's head
data['verses']['31:9b'] = '{domine9} as {maxillas} deles, * que não se aproximam de vós.'
d['options'] = [
    {'label': 'Com cabresto e freio, apertai', 'forms': {'domine9': 'Com {camo} e freio, {constringe}'},
     'note': 'Ruling (draft 3): the Latinist\'s gate, verbatim; the Latin names no one.', 'from': 'latinist'},
    {'label': 'Com cabresto e freio, Senhor, apertai', 'forms': {'domine9': 'Com {camo} e freio, Senhor, {constringe}'},
     'note': 'Draft 2: the addressee named (the blind reader\'s mishearing); a vocative the Latin lacks.', 'from': 'draft'},
]

for step in data['audit']:
    for o in step.get('outcomes', []):
        if o.get('decision') == 'domine9':
            o['reason'] = 'Taken in draft 2; undone in draft 3 at the Latinist\'s gate (a vocative the Latin lacks). The mishearing stands.'

data['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Draft 2 — the gate. One remark: 31:9b MAJOR on the supplied vocative \'Senhor,\' → removed. Every other draft-2 change passed'
            ' without remark (\'atribuiu\', \'a vossa mão ficou pesada sobre mim\', \'Disse: Contra mim mesmo, confessarei ao Senhor a minha'
            ' injustiça\', \'Por isto, todo santo orará a vós\', \'neste caminho\', \'maxilas\', \'Os flagelos do pecador são muitos, * mas a'
            ' misericórdia cercará aquele que espera no Senhor\'). «A tradução conserva adequadamente o sentido do latim, inclusive suas'
            ' imagens e construções menos habituais, salvo pelo vocativo acrescentado em 31:9b.»',
    'outcomes': [{'verse': '31:9b', 'remark': "MAJOR: the vocative 'Senhor' is not in the Latin → 'Com cabresto e freio, apertai as maxilas deles'",
                  'outcome': 'taken', 'decision': 'domine9'}],
})
data['audit'].append({'step': 'revision', 'version': 3,
                      'note': 'v3 (revise_v3.py, from prayed.v2.json): 31:9b the supplied \'Senhor,\' removed, the gate\'s fix verbatim. No other change; no critic has read draft 3.'})
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 3 written')
