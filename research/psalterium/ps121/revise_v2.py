"""Make draft 2 of Ps 121 from draft 1 (prayed.v1.json) after the v1 readers."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text())
d['version'] = 2
v = d['verses']
v['121:4'] = 'Pois para lá subiram as tribos, as tribos do Senhor: * testemunho {israel}, para {confitendum} do Senhor.'
v['121:6'] = 'Rogai {quae6} {jerusalem6}: * e abundância para os que te amam:'
v['121:9'] = '{propter9} da casa do Senhor, nosso Deus, * busquei {bona} para ti.'

dec = {x['id']: x for x in d['decisions']}

def first(decision_id, label):
    opts = dec[decision_id]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))

# 121:1 — the Latinist's plural is option 2 already; say so.
o = next(o for o in dec['dicta']['options'] if o['label'].startswith('com as coisas'))
o['note'] += ' Asked for by the v1 Latinist (minor: the number). Refused as the text: the neuter clause is how Portuguese says a plural quæ with no noun (as D26 says the plural elóquia with a clause), and the plural adds three weak syllables to a line that is also sung alone as an antiphon.'

# 121:2 — the stylist's and the ambiguity reader's objection to 'parados' is taken.
first('stantes', 'se detinham')
dec['stantes']['why'] += ' Draft 2: the v1 stylist heard \'parados\' as stalled or idle feet, and the ambiguity reader heard \'stopped, stuck, idle\' first — a wrong first hearing, so the ruling moves to \'se detinham\'. The Latinist\'s \'estavam de pé\' cannot be said of feet.'
for o in dec['stantes']['options']:
    if o['label'] == 'se detinham':
        o['note'] = 'Draft 2 ruling, from the v1 stylist; the Diurnal Monástico 1962 (\'Já nossos pés se detêm\') and the CNBB wording have the same verb. The deter-se row (1:1, 103:6: halting on a road — here at its end). Eight syllables, as the Latin. Cost: it says the halt more than the standing.'
        o['from'] = 'stylist'
    if o['label'] == 'estavam parados':
        o['note'] = 'Draft 1. The state, with the Latin\'s own build (estavam + participle); Matos Soares 1932 \'param\'. Heard by the stylist and the ambiguity reader as stalled, stuck, idle.'
dec['stantes']['options'].append({'label': 'estavam de pé', 'forms': {'stantes': 'estavam de pé'}, 'note': 'The v1 Latinist\'s fix (minor), the stare row\'s wording. Refused: \'os pés estavam de pé\' says the feet stood on their feet.', 'from': 'latinist'})

# 121:3 — the stylist's 'num só todo' kept as an option.
dec['idipsum']['options'].insert(1, {'label': 'num só todo', 'forms': {'idipsum': 'num só todo'}, 'note': 'The v1 stylist (worst line of the psalm: \'em conjunto\' is office language). Refused as the text: it supplies a noun, \'todo\', and closes in idípsum on unity-as-a-whole, where \'em conjunto\' keeps the Greek\'s \'together\' and its family with \'juntos\' (33:4, 61:10, 73:6). The ambiguity reader heard \'em conjunto\' as \'everyone takes part together\' — the Greek\'s sense. For Gustavo\'s ear.', 'from': 'stylist'})

# 121:4 — new decision for the stylist's 'louvar'.
d['decisions'].insert(next(i for i, x in enumerate(d['decisions']) if x['id'] == 'israel') + 1, {
    'id': 'confitendum', 'refs': ['121:4'], 'latin': 'ad confiténdum nómini Dómini', 'kind': 'glossary',
    'why': 'confitéri to God → dar graças a (D5). The v1 stylist found the second colon too long for one breath and asked for \'louvar\'.',
    'options': [
        {'label': 'dar graças ao nome', 'forms': {'confitendum': 'dar graças ao nome'}, 'note': 'Ruling (D5): keeps the dative, and stays apart from laudáre → louvar. Twenty syllables against the Latin\'s nineteen.', 'from': 'glossary'},
        {'label': 'louvar o nome', 'forms': {'confitendum': 'louvar o nome'}, 'note': 'The v1 stylist (and the CNBB wording). Refused: louvar is laudáre\'s, which D5 keeps apart from confitéri.', 'from': 'stylist'}
    ]
})

# 121:6 — new decision for the clause.
d['decisions'].insert(next(i for i, x in enumerate(d['decisions']) if x['id'] == 'jerusalem6'), {
    'id': 'quae6', 'refs': ['121:6'], 'latin': 'quæ ad pacem sunt', 'kind': 'word',
    'why': 'A neuter plural relative with no noun: \'the things that are for peace\' (Douay-Rheims). The v1 Latinist asked for the plural (minor); the v1 stylist heard \'o que é para a\' as a gloss and asked for \'o que serve à\'. The ambiguity reader heard \'pray for the peace of Jerusalem\' — the sense.',
    'options': [
        {'label': 'o que é para a paz', 'forms': {'quae6': 'o que é para a paz'}, 'note': 'Ruling, as draft 1: the neuter clause for a plural quæ, as 121:1; nothing supplied.', 'from': 'draft'},
        {'label': 'as coisas que são para a paz', 'forms': {'quae6': 'as coisas que são para a paz'}, 'note': 'The v1 Latinist (minor): the plural. Refused for the reason given at 121:1; +3 syllables to a colon already +2.', 'from': 'latinist'},
        {'label': 'o que serve à paz', 'forms': {'quae6': 'o que serve à paz'}, 'note': 'The v1 stylist. Refused: \'servir\' puts in a verb of usefulness for the bare \'sunt ad\'.', 'from': 'stylist'}
    ]
})

# 121:7 — força taken.
first('virtute', 'na tua força')
dec['virtute']['why'] += ' Draft 2: the v1 stylist (\'poder\' abstract and political; virtus here goes with the towers) and the ambiguity reader (heard \'in your power, abstract\', some \'in your dominion\') agree. A local departure, as 102:20 \'poderosos em força\': there is no fortitúdo in this psalm to collide with. 47:14 (Sion\'s virtus, \'no seu poder\') may want to follow; proposed in the glossary.'
for o in dec['virtute']['options']:
    if o['label'] == 'na tua força':
        o['note'] = 'Draft 2 ruling, from the v1 stylist: Douay-Rheims \'in thy strength\'; concrete beside the towers; the versicle said alone reads \'Haja paz na tua força\'. Cost: força is fortitúdo\'s elsewhere.'
        o['from'] = 'stylist'
    if o['label'] == 'no teu poder':
        o['note'] = 'Draft 1: the row, as 47:14. Heard abstract by two readers.'

# 121:8 — the stylist's wording is option 1 already.
for o in dec['loquebar']['options']:
    if o['label'].startswith('eu falava de paz'):
        o['note'] += ' Asked for by the v1 stylist (\'falar paz sobre\' a calque). Refused: pacem is the accusative of content, kept as 84:9 \'falará paz\' and as the mendácium row keeps 16:9b \'falou soberba\'; \'falar de paz\' changes what is spoken into what is talked about.'
        o['from'] = 'stylist'

# 121:9 — new decision for bona.
d['decisions'].append({
    'id': 'bona', 'refs': ['121:9'], 'latin': 'quæsívi bona tibi', 'kind': 'glossary',
    'why': 'bona, neuter plural. The bona tríbuere row (12:6b, 83:13) has \'coisas boas\', because \'bens\' was heard as property. The v1 stylist found \'coisas boas\' weak for the psalm\'s last cadence and asked for \'os bens\'; the ambiguity reader heard \'good things (material or gifts)\' either way.',
    'options': [
        {'label': 'coisas boas', 'forms': {'bona': 'coisas boas'}, 'note': 'Ruling: the glossary row.', 'from': 'glossary'},
        {'label': 'os bens', 'forms': {'bona': 'os bens'}, 'note': 'The v1 stylist (\'busquei para ti os bens\'); Matos Soares 1932 \'procurei bens para ti\'. Refused under the row: heard as property.', 'from': 'stylist'}
    ]
})

d['choices']['121:6'] += ' The ambiguity reader heard this \'te\' (and the \'ti\' of 121:9) as God. Nothing is supplied: the turn to Jerusalem is the Latin\'s, 121:2 has already made her \'tu\' by name, and in this psalter God is \'vós\', so the pronoun itself says who is meant.'
d['choices']['121:3'] += ' The ambiguity reader listed \'se edifica\' and \'participação\' as possibly unknown and heard a possible moral sense of \'edificar\'; kept — edificar is the psalter\'s verb (50:20).'
d['choices']['121:5'] = d['choices']['121:5'] + ' The ambiguity reader heard \'thrones were set up for judging\' first — the sense — and listed \'se assentaram\' as possibly unknown; kept.'

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
