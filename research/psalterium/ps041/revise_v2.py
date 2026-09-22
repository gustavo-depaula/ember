"""Ps 41 draft 2 from the v1 readers. Run from the repo root: python3.13 research/psalterium/ps041/revise_v2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
v = d['verses']

d['version'] = 2

# 41:3 — stylist: *irei* (shorter, plainer); *chegarei* kept as option.
o = dec['veniam']['options']
o[0], o[1] = o[1], o[0]
o[0]['note'] = 'Ruling (v2): stylist and MS1932 — plainer and three syllables shorter; *ir* avoids the wrong standpoint of *vir* as well as *chegar* does.'
o[0]['from'] = 'stylist'
o[1]['note'] = 'draft 1; ἥξω "arrive". The stylist found it weaker and the colon crowded (*chegarei, e aparecerei*).'
dec['veniam']['why'] += ' v2: the stylist asked for *irei* (the colon was +3 and *chegarei, e aparecerei* stumbled); taken.'

# 41:7 — stylist: natural order, the verb before *dentro de mim mesmo*; *mesmo* (ipsum) kept.
v['41:7'] = '{meipsum}: * por isso me lembrarei de vós desde a terra do Jordão e {hermon}, desde o pequeno monte.'
m = dec['meipsum']
m['options'] = [
    {'label': 'A minha alma está perturbada dentro de mim mesmo', 'forms': {'meipsum': 'A minha alma está perturbada dentro de mim mesmo'}, 'note': 'Ruling (v2): the stylist\'s order (*mim mesmo a minha* clotted); *mesmo* for *-ipsum* kept against his *dentro de mim*.', 'from': 'stylist'},
    {'label': 'Dentro de mim mesmo a minha alma está perturbada', 'forms': {'meipsum': 'Dentro de mim mesmo a minha alma está perturbada'}, 'note': 'draft 1: the Latin\'s order; DRB, MS1932.', 'from': 'draft'},
    {'label': 'A minha alma está perturbada dentro de mim', 'forms': {'meipsum': 'A minha alma está perturbada dentro de mim'}, 'note': 'stylist\'s line; drops *mesmo* (-ipsum) — refused as a lost word.', 'from': 'stylist'},
    {'label': 'Para comigo a minha alma está perturbada', 'forms': {'meipsum': 'Para comigo a minha alma está perturbada'}, 'note': '*ad* as "towards me"; Augustine\'s reading; unclear.', 'from': 'draft'},
]
m['why'] += ' v2: the stylist found *Dentro de mim mesmo a minha alma* muddy (three m-syllables) and a translated phrase at the head; the verb is put first (order, D2) and *mesmo* kept.'

# 41:7 second colon — stylist: comma after Jordão removed, so that Hermon hangs on *terra* (DRB's syntax).
dec['hermon']['why'] += ' v2: the stylist asked that *e do Hermon* not hang alone; the comma after *Jordão* is removed, joining it to *terra* (DRB "from the land of Jordan and Hermoniim"). The Latinist (minor) asked for the plural *dos Hermons*; refused — the Latin transliterates a name, it does not translate a plural; his wording is option 3.'

# 41:11 — stylist: pronominal passive.
v['41:11'] = 'Enquanto se quebram os meus ossos, * afrontaram-me os meus inimigos que me atribulam.'
d['decisions'].append({
    'id': 'confringuntur', 'refs': ['41:11'], 'latin': 'Dum confringúntur ossa mea', 'kind': 'grammar',
    'why': 'The present passive. v2: the stylist found *são quebrados* flat and asked for the pronominal passive, which keeps the voice and the tense and puts *ossos* at the mediant; taken (grammar, D2).',
    'options': [
        {'label': 'se quebram os meus ossos', 'forms': {}, 'note': 'Ruling (v2): stylist.', 'from': 'stylist'},
        {'label': 'os meus ossos são quebrados', 'forms': {}, 'note': 'draft 1; the analytic passive; MS1932 the same.', 'from': 'draft'},
    ],
})
v['41:11'] = 'Enquanto {confr} os meus ossos, * afrontaram-me os meus inimigos que me atribulam.'
c = d['decisions'][-1]['options']
c[0]['forms'] = {'confr': 'se quebram'}
c[1]['forms'] = {'confr': 'são quebrados'}
c[1]['label'] = 'são quebrados (os meus ossos são quebrados)'

# refused remarks become options where they are not already
dec['confessio']['why'] += ' v2: the stylist heard *exultação e de ação* as a tongue-twister and asked *louvor*; refused — *louvor* is laus\'s, and *ação de graças* keeps the noun beside the refrain\'s *darei graças* (D5). His line is option 2.'
dec['confessio']['options'][1]['from'] = 'stylist'
dec['confessio']['options'][1]['note'] = 'stylist, DRB, MS1932; *louvor* is laus\'s.'
dec['panes']['why'] += ' v2: the Latinist (minor) asked for *os meus pães*; refused as at 40:10 (the idiom; number is grammar, D2, D29). Option 3.'
dec['inme']['why'] += ' v2: the blind reader heard it as grief within, being refilled, or poured out to God — the openness the Latin has; kept.'
dec['excelsa']['why'] += ' v2: the blind reader heard heights first and the billows second, and found *passaram sobre mim* odd with heights — the Latin\'s own strangeness; kept.'
dec['salutare']['why'] += ' v2: the blind reader heard it as a title of God, meaning obscure — the Latin image; kept. Ps 42 v2 (42:6) has the same words.'

d['choices']['41:7'] = d['choices']['41:7'] + ' The blind reader heard *desde* as place first (time second).'
d['choices']['41:5'] = d['choices']['41:5'] + ' The blind reader heard *tenda* as tent, helped by *casa de Deus*, with the shop sense possible; the row stands.'
d['choices']['41:10'] = d['choices']['41:10'] + ' Ps 42 v2 has *e por que ando triste, enquanto me aflige o inimigo?* — the *dum* clause identical.'

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
