"""v2 of canticle 231 from the v1 readers (critic/v1.*.json). Reads prayed.v1.json, writes prayed.json.
python3.13 research/psalterium/ps231/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
v = d['verses']
v['1:71'] = '{salutem} nossos inimigos, * e da mão de todos os que nos odeiam.'
dec = {x['id']: x for x in d['decisions']}

# 1:70 a sǽculo — Latinist and stylist (and the ambiguity reader's likely hearing): 'eternal prophets'.
a = dec['asaeculo']
opts = {o['label']: o for o in a['options']}
first = opts['que são desde os tempos antigos']
first['note'] = ('v2, taken from the v1 Latinist and stylist (the ambiguity reader heard "prophets who have always existed" '
                 'as the likely meaning). The Greek ἀπ\' αἰῶνος and the Latin a sǽculo said of men mean "from of old"; '
                 'MS1932 and the CNBB say the same (CNBB "desde os tempos mais antigos"). The row keeps "desde sempre" '
                 'where the subject is God\'s (24:6 mercies, 92:2, 40:14); a person cannot be "desde sempre". +2 syllables.')
opts['que são desde sempre']['note'] = ('v1, the row word for word (24:6). Refused in v2: said of the prophets it was heard '
                                        'as eternity by all three readers.')
a['options'] = [first, opts['que são desde sempre'], opts['que são de outrora'],
                {'label': 'desde os séculos antigos', 'forms': {'asaeculo': 'desde os séculos antigos'},
                 'note': 'The v1 stylist\'s form: keeps sǽculum concrete, drops sunt.', 'from': 'stylist'}]
a['why'] += (' v2: the row\'s "desde sempre" fits a sǽculo when the subject is God or his mercies; here it is men, and every '
             'reader heard eternity, so the sense splits (a context split the Latin permits: a sǽculo itself is "from the age").')

# 1:71 Salútem ex — all three readers heard the genitive.
s = dec['salutem']
s['options'] = [
    {'label': 'Salvação que nos livra dos', 'forms': {'salutem': 'Salvação que nos livra dos'},
     'note': 'v2. The noun stays (and its apposition to the horn); a relative verb carries ex, and it governs the second colon too: '
             '"que nos livra dos nossos inimigos, e da mão de todos". livrar is liberáre\'s verb (1:74 livrados), so ex and '
             'liberáti share a verb in Portuguese; the sense is the same (rescue out of). +3 syllables.', 'from': 'draft'},
    {'label': 'Salvação dos', 'forms': {'salutem': 'Salvação dos'},
     'note': 'v1, with DRB. Refused: all three readers heard "our enemies\' salvation" first.', 'from': 'draft'},
    {'label': 'Para nos salvar dos', 'forms': {'salutem': 'Para nos salvar dos'},
     'note': 'DM1962 and the CNBB. Clear and familiar; the noun becomes a verb and a purpose is added.', 'from': 'DM1962'},
    {'label': 'Salvação contra os', 'forms': {'salutem': 'Salvação contra os'},
     'note': 'The v1 Latinist\'s fix. The noun alone; but the second colon "e da mão" then has no preposition to hang on.',
     'from': 'latinist'},
]
s['why'] += ' v2: the Latinist, the stylist and the ambiguity reader all heard the genitive; the relative "que nos livra" is taken.'

# 1:79 in viam — stylist: 'dirigir … ao' unidiomatic.
i = dec['inviam']
opts = {o['label']: o for o in i['options']}
p = opts['para o caminho']
p['note'] = ('v2, taken from the v1 stylist ("ao" unidiomatic after dirigir). Motion into, as the Latin; 118:128 ad ómnia '
             'mandáta tua dirigébar → "dirigido para". The repeated "para" follows the Latin\'s ad … in.')
p['from'] = 'stylist'
opts['ao caminho']['note'] = 'v1 (26:11 "à vereda"); the stylist found "dirigir … ao caminho" unidiomatic.'
i['options'] = [p, opts['ao caminho'], opts['no caminho']]

# 1:74 — stylist's 'o sirvamos' / 'livres' refused; record as a decision.
d['verses']['1:74'] = 'Que, sem temor, {liberati} da mão dos nossos inimigos, * {serviamus}.'
d['decisions'].insert([x['id'] for x in d['decisions']].index('liberati') + 1, {
    'id': 'serviamus', 'refs': ['1:74'], 'latin': 'serviámus illi', 'kind': 'word',
    'why': 'The Latin has the dative illi after the verb. The v1 stylist asked for the proclitic "o sirvamos" as more natural.',
    'options': [
        {'label': 'sirvamos a ele', 'forms': {'serviamus': 'sirvamos a ele'},
         'note': 'Kept: the dative and its place kept, 6 syllables as the Latin, a paroxytone close; "servir a Deus" is the ordinary '
                 'Brazilian regency.', 'from': 'draft'},
        {'label': 'o sirvamos', 'forms': {'serviamus': 'o sirvamos'},
         'note': 'MS1932 and the v1 stylist: lighter, -2 syllables; for Gustavo.', 'from': 'stylist'},
    ]})

d['choices']['1:70'] = d['choices']['1:70'].replace('The Latin', 'v2: "desde os tempos antigos" (decision asaeculo). The Latin', 1)
d['choices']['1:71'] += ' v2: "Salvação que nos livra dos" (decision salutem).'
d['choices']['1:74'] = d['choices']['1:74'].replace("serviámus illi → 'sirvamos a ele': the dative kept, and a paroxytone close; 'o sirvamos' (MS1932) is two syllables short and stiffer.", 'serviámus illi → decision serviamus.')
d['choices']['1:79'] = d['choices']['1:79'].replace(' pedes → pés', ' v2: "para o caminho" (decision inviam). pedes → pés')

d['audit'] += [
    {'step': 'checks', 'note': 'v1: hard pass (ids 1:68–1:79; "+" and "*" in 1:68, "*" elsewhere). Soft: 1:68b −3, 1:74a −5, 1:76a +3 with the proparoxytone Altíssimo at the mediant, 1:79a +4; each recorded in the choices.'},
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'claude-opus-5-5, fresh context, read latin.json. Two minors, no majors; clauses, tenses and moods, images and marks confirmed.',
     'outcomes': [
         {'verse': '1:70', 'remark': 'desde sempre overstates a sǽculo; desde os tempos antigos', 'outcome': 'taken'},
         {'verse': '1:71', 'remark': 'dos read as genitive; Salvação contra', 'outcome': 'taken',
          'reason': 'Fixed with "Salvação que nos livra dos" rather than "contra", which leaves "e da mão" hanging (decision salutem).'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'claude-opus-5-5, fresh context, read latin.json. Five remarks: three taken, two kept as options. Worst line 1:71, best 1:78.',
     'outcomes': [
         {'verse': '1:70', 'remark': 'desde sempre sounds eternal/careless; desde os séculos antigos', 'outcome': 'taken',
          'reason': 'Taken as "desde os tempos antigos" with the Latinist; the stylist\'s form is an option.'},
         {'verse': '1:71', 'remark': 'dos heard as possessive; Salvação, livres dos', 'outcome': 'taken',
          'reason': 'Fixed with the relative "que nos livra dos".'},
         {'verse': '1:74', 'remark': 'sirvamos a ele stiff, livrados heavy; livres … o sirvamos', 'outcome': 'option',
          'decision': 'serviamus',
          'reason': 'livrados is the liberáre row\'s participle (123:7b); "sirvamos a ele" keeps the Latin\'s dative and length. Both kept as options for Gustavo (decisions liberati, serviamus).'},
         {'verse': '1:77', 'remark': 'o saber academic; o conhecimento', 'outcome': 'option', 'decision': 'scientia',
          'reason': 'The sciéntia row (18:3, 72:11, 93:10, 138:6) has passed readers in four psalms; conhecimento is its named option. For Gustavo with the row.'},
         {'verse': '1:79', 'remark': 'dirigir … ao caminho unidiomatic; para o caminho', 'outcome': 'taken'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'claude-opus-5-5, fresh context, read the Portuguese only. Nineteen readings, four unknown words (chifre as strength, remissão, Oriente as a title, entranhas as compassion).',
     'outcomes': [
         {'verse': '1:70', 'remark': 'desde sempre heard as eternal prophets', 'outcome': 'taken'},
         {'verse': '1:71', 'remark': "our enemies' salvation; Salvação hangs without a verb", 'outcome': 'taken',
          'reason': 'The relative clause fixes the first; the verbless apposition is the Latin\'s (Salútem continues 1:69–70).'},
         {'verse': '1:69', 'remark': 'chifre puzzling / slang', 'outcome': 'refused',
          'reason': 'The cornu row and 17:3c; rule 5 keeps the horn. The dative is placed before the noun to avoid 131:17\'s cuckold reading (decision cornu).'},
         {'verse': '1:78', 'remark': 'Oriente heard as the East', 'outcome': 'option', 'decision': 'oriens',
          'reason': 'That is the Latin\'s own word and its double sense (DRB "the Orient"; the Vulgate\'s Messianic name in Zech 3:8, 6:12). "o Sol nascente" (MS1932, CNBB) is option 2, for Gustavo.'},
         {'verse': '1:78', 'remark': 'entranhas heard as guts', 'outcome': 'refused', 'reason': 'D44.'},
         {'verse': '1:73', 'remark': 'O juramento hangs; conceder has no object', 'outcome': 'refused',
          'reason': 'The Latin\'s apposition (Jusjurándum, accusative) and its ut-clause carried into 1:74, as DRB.'},
         {'verse': '1:77', 'remark': 'o saber heard as o sabor', 'outcome': 'refused',
          'reason': 'Second reading only; likely heard as knowledge. The row stands (see the stylist\'s 1:77).'},
         {'verse': '1:68, 1:70, 1:72, 1:76, 1:77, 1:79', 'remark': 'unstated subjects and seu/seus referents', 'outcome': 'refused',
          'reason': 'Each heard correctly as likely; the Latin leaves the same subjects and pronouns.'},
         {'verse': '1:77', 'remark': 'remissão unknown', 'outcome': 'refused',
          'reason': 'The Creed\'s word ("a remissão dos pecados"), and the CNBB\'s here (decision remissio).'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': 'v2: 1:70 "que são desde os tempos antigos"; 1:71 "Salvação que nos livra dos nossos inimigos"; 1:79 "para o caminho da paz". New decision serviamus for the stylist\'s refused "o sirvamos". prayed.v1.json / prayed.v1.vos.json kept (the text the v1 readers read).'},
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
