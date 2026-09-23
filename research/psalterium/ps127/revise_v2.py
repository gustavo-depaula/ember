"""Ps 127 draft 2 from draft 1 after the v1 readers. Run from the repo root:
python3.13 research/psalterium/ps127/revise_v2.py
"""

import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


# 127:2 beátus es: natural order (stylist) — the order is grammar, D2
d['verses']['127:2'] = 'Porque comerás {labores} das tuas mãos: * {beatus2}, {bene}.'
for o in dec['beati']['options']:
    o['forms']['beatus2'] = {'Bem-aventurados': 'és bem-aventurado', 'Felizes': 'és feliz'}[o['forms']['beati']]
dec['beati']['options'][0]['note'] += ' v2: 127:2 in the natural order, és bem-aventurado (stylist: the inversion is Latinate and "és, e" makes a hiatus at the comma); the Latin order stays as the next option.'
dec['beati']['options'].append({'label': 'Bem-aventurados … bem-aventurado és', 'forms': {'beati': 'Bem-aventurados', 'beatus2': 'bem-aventurado és'}, 'note': 'Draft 1: the Latin order (beátus es), Matos Soares 1932. Changed for the stylist.', 'from': 'draft'})

# 127:3a/3b copula (stylist): present
promote('verbless', 'é … são')
dec['verbless']['options'][0]['note'] = 'v2, the stylist\'s: a present copula in both members, so the pair stays parallel ("A tua esposa é como videira abundante"). Rule 2 allows it; the stylist named the verbless 3a the worst line of the psalm, and the ambiguity reader already heard the verbless line as a present description — so the copula states what is heard, not a new reading. The present of a nominal sentence is the timeless present in Portuguese; the CNBB has it too. Cost: the Latin\'s open tense is made present.'
dec['verbless']['options'][0]['from'] = 'stylist'
for o in dec['verbless']['options']:
    if o['label'] == 'verbless':
        o['note'] = 'Draft 1. A tableau, as the Latin. The stylist: "without a verb the line hangs"; worst line.'

# 127:3b olivárum plural (Latinist minor)
promote('novellae', 'como rebentos de oliveiras')
dec['novellae']['options'][0]['note'] = 'v2, the Latinist\'s (minor): the Latin\'s plural olivárum. Draft 1\'s reason for the singular (sibilants) was weak against the Latin\'s number; the line still reads alone as the Corpus Christi antiphon. The ambiguity reader did not know "rebentos"; kept, as the word Brazil sings in the CNBB text of this verse ("rebentos de oliveira"); "mudas" is the plainest option.'
dec['novellae']['options'][0]['from'] = 'latinist'
for o in dec['novellae']['options']:
    if o['label'] == 'como rebentos de oliveira':
        o['note'] = 'Draft 1: the CNBB\'s generic singular. Changed for the Latinist.'

# 127:5 bona → os bens (stylist)
promote('bona', 'os bens')
dec['bona']['options'][0]['note'] = 'v2, the stylist\'s: of two faithful words the plainer and shorter (D2); brings the longest colon of the psalm from 23 to 20 syllables, the Latin\'s count. 26:13 "os bens do Senhor" and Matos Soares 1932 have it. Draft 1 feared "the city\'s property"; the ambiguity reader heard "goods" vaguely even with "coisas boas", so the draft\'s word bought nothing.'
dec['bona']['options'][0]['from'] = 'stylist'

# options for refused stylist remarks
dec['quia'] = {
    'id': 'quia', 'refs': ['127:2'], 'latin': 'quia manducábis', 'kind': 'word',
    'why': 'The stylist asked for "Pois" at the head of the sentence ("Porque" alone sounds like a clause that lost its main verb). The glossary keeps quia → porque, with "pois" only where "por que" questions follow (D42). The ambiguity reader heard "Porque" as "because" at once.',
    'options': [
        {'label': 'Porque', 'forms': {'quia': 'Porque'}, 'note': 'Draft; the glossary\'s default, Matos Soares 1932. Kept: the causal link to 127:1 is what the Latin has, and the reader heard it.', 'from': 'glossary'},
        {'label': 'Pois', 'forms': {'quia': 'Pois'}, 'note': 'The stylist\'s. Refused as a departure from D42 that the ear did not need (the ambiguity reader had no trouble with "Porque").', 'from': 'stylist'},
    ],
}
d['verses']['127:2'] = '{quia} comerás {labores} das tuas mãos: * {beatus2}, {bene}.'
dec['ejus'] = {
    'id': 'ejus', 'refs': ['127:1'], 'latin': 'in viis ejus',
    'kind': 'ambiguity',
    'why': 'The stylist: with a plural subject "seus" may be heard as "their own ways". The ambiguity reader listed both readings and named "the Lord\'s ways" as the likely hearing. 118:3 has "nos seus caminhos" for the same Latin.',
    'options': [
        {'label': 'nos seus caminhos', 'forms': {'ejus': 'nos seus caminhos'}, 'note': 'Draft; 118:3\'s words; Matos Soares 1932. Kept: the ambiguity reader heard the Lord\'s ways first.', 'from': 'draft'},
        {'label': 'nos caminhos dele', 'forms': {'ejus': 'nos caminhos dele'}, 'note': 'The stylist\'s. Unambiguous, but colloquial at a cadence and it would part the verse from 118:3.', 'from': 'stylist'},
    ],
}
d['verses']['127:1'] = '{beati} todos os que temem o Senhor, * os que andam {ejus}.'
dec['lateribus']['options'].insert(1, {'label': 'aos lados', 'forms': {'lateribus': 'aos lados'}, 'note': 'The stylist\'s ("nos lados" sounds colloquial, "lá pelos lados"). Refused: "aos lados" puts the vine beside the house, where the Latin\'s "in" puts it on its sides; and the ambiguity reader heard "nos lados" as the outside walls — the Latin\'s image.', 'from': 'stylist'})

order = ['beati', 'quia', 'labores', 'bene', 'ejus', 'verbless', 'vitis', 'lateribus', 'novellae', 'ecce', 'benedicat', 'bona', 'videas', 'pacem']
d['decisions'] = [dec[k] for k in order]
d['version'] = 2
d['status'] = 'draft'
d['choices']['127:5'] += ' The ambiguity reader heard "O Senhor te bendiga de Sião" as "the Lord of Zion" first; the formula is 133:3\'s and is left as it is (the Latin\'s ex Sion is as close to Dóminus); "e vejas" can be heard as an imperative — "e que vejas" is option 1 of videas.'
d['choices']['127:6'] += ' The ambiguity reader heard "a paz sobre Israel" as a second object of "vejas" — the Latin\'s accusative, as intended.'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Two minors, no major. 127:3b plural taken; 127:2 partitive refused.', 'outcomes': [
        {'verse': '127:2', 'remark': 'partitive "dos trabalhos" for the direct accusative', 'outcome': 'option', 'decision': 'labores', 'reason': 'The partitive is how Portuguese says eating from a store — grammar under D2, Matos Soares 1932\'s wording; "comer os trabalhos" is heard as eating the labour itself. The Latinist called it idiomatic; his wording is option 1.'},
        {'verse': '127:3b', 'remark': 'olivárum plural collapsed to "oliveira"', 'outcome': 'taken', 'decision': 'novellae'},
    ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. 6 remarks: 4 taken (és bem-aventurado; é / são in 3a–3b; os bens), 2 refused and kept as options (Pois; nos caminhos dele), 1 refused as an option (aos lados). Worst 127:3a, best 127:6.', 'outcomes': [
        {'verse': '127:1', 'remark': '"nos seus caminhos" heard as their own ways', 'outcome': 'option', 'decision': 'ejus', 'reason': 'The ambiguity reader heard the Lord\'s ways first; 118:3 has the same words for the same Latin.'},
        {'verse': '127:2', 'remark': '"Porque" at the head → "Pois"', 'outcome': 'option', 'decision': 'quia', 'reason': 'D42 keeps porque; the ambiguity reader heard "because" at once.'},
        {'verse': '127:2', 'remark': 'inverted "bem-aventurado és" → "és bem-aventurado"', 'outcome': 'taken', 'decision': 'beati'},
        {'verse': '127:3a', 'remark': 'verbless line hangs → "é como"', 'outcome': 'taken', 'decision': 'verbless'},
        {'verse': '127:3a', 'remark': '"nos lados" colloquial → "aos lados"', 'outcome': 'option', 'decision': 'lateribus', 'reason': '"aos lados" moves the vine beside the house; the Latin has "in", and the ambiguity reader heard "nos lados" as the walls.'},
        {'verse': '127:3b', 'remark': 'copula to match 3a → "são como"', 'outcome': 'taken', 'decision': 'verbless'},
        {'verse': '127:5', 'remark': '"as coisas boas" flat and long → "os bens"', 'outcome': 'taken', 'decision': 'bona'},
    ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, blind. 11 readings; unknown words "rebentos", "Sião". Nothing changed on its account alone; it decided two stylist remarks (seus, nos lados) and supported one (the copula).', 'outcomes': [
        {'verse': '127:1', 'remark': '"seus caminhos" his or their own; likely the Lord\'s', 'outcome': 'refused', 'reason': 'Heard rightly; kept.'},
        {'verse': '127:3a', 'remark': 'description or promise; heard as present', 'outcome': 'taken', 'decision': 'verbless', 'reason': 'The present copula states what was heard.'},
        {'verse': '127:3b', 'remark': '"rebentos" unknown', 'outcome': 'option', 'decision': 'novellae', 'reason': 'Kept as the word of the Brazilian liturgical text of this verse; "mudas" and "renovos" are options.'},
        {'verse': '127:5', 'remark': '"de Sião" heard as "the Lord of Zion"', 'outcome': 'refused', 'reason': 'The formula is 133:3\'s; a reordering would touch both psalms — noted for the glossary row.'},
        {'verse': '127:5', 'remark': '"e vejas" possibly heard as an imperative', 'outcome': 'option', 'decision': 'videas', 'reason': 'After "te bendiga" the wish is heard; "e que vejas" is the option.'},
        {'verse': '127:5', 'remark': '"Sião" unknown', 'outcome': 'refused', 'reason': 'A proper name, kept (as 19:3, 133:3).'},
        {'verse': '127:6', 'remark': '"a paz" heard as a second object of "vejas"', 'outcome': 'taken', 'reason': 'This is the Latin\'s accusative; the draft stands.'},
    ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 127:2 és bem-aventurado; 127:3a–3b present copula é / são; 127:3b de oliveiras; 127:5 os bens. Two new decisions record refused stylist remarks (quia, ejus). Draft 1 kept as prayed.v1.json.'},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
