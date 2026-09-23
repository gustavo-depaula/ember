"""Ps 140 draft 2: applies the v1 readers' outcomes to prayed.json (draft 1 kept as prayed.v1.json)."""
import json
from pathlib import Path

p = Path('research/psalterium/ps140/prayed.json')
d = json.loads(p.read_text())
assert d['version'] == 1
d['version'] = 2
d['status'] = 'reviewed'
V = d['verses']
V['140:6'] = 'Porque {adhucet} {beneplacitis}: * foram engolidos, {juncti}, os seus juízes.'
V['140:8'] = '{dissipata} os nossos ossos junto ao {infernum}: * porque para vós, Senhor, Senhor, estão os meus olhos: em vós esperei, não tireis a minha alma.'
V['140:10'] = 'Cairão {ejus} os pecadores: * {singulariter}.'

dec = {x['id']: x for x in d['decisions']}

def opt(label, slot, form, note, frm):
    return {'label': label, 'forms': {slot: form}, 'note': note, 'from': frm}

# 140:2 dirigatur — stylist refused, kept as option
dec['dirigatur']['options'].append(opt('Dirija-se a minha oração', 'dirigatur', 'Dirija-se a minha oração',
    "The v1 stylist's ('verb first, like a prayer'). Refused: said aloud it is 'dirija-se à minha oração' (go to my prayer), the very mishearing the subject-first order avoids; and the pronominal would want 'à vossa presença'.", 'stylist'))

# 140:2 elevatio — 'da tarde' promoted (the blind reader did not know 'vespertino'; D2 the plainer of two faithful words)
e = dec['elevatio']
e['options'] = [e['options'][1], e['options'][0], e['options'][2]]
e['options'][0]['note'] = "v2. MS1932's noun phrase; the plainer of two faithful words (D2), taken after the v1 ambiguity reader listed 'vespertino' as unknown."
e['options'][1]['note'] = "v1. The Latin's adjective and the hand-missal's wording; ties the line to Vespers; unknown to the v1 ambiguity reader."
e['why'] += " v2: 'da tarde' — the ambiguity reader listed 'vespertino' among unknown words, and D2 gives the plainer of two faithful words the verse."

# 140:3 ostium — Latinist's noun refused
dec['ostium']['options'].append(opt('e aos meus lábios uma porta de cerco', 'ostium', 'e aos meus lábios uma porta de cerco',
    "The v1 Latinist's (minor): keeps the noun. Refused: 'cerco' is heard first as a siege.", 'latinist'))

# 140:4 excusandas — both proposals refused, kept as options
x = dec['excusandas']
x['options'][2]['note'] = "DRB 'to make excuses'; also the v1 Latinist's fix (minor: no reflexive in the gerundive). Refused: it drops the Latin's repetition (D2)."
x['options'][2]['from'] = 'latinist'
x['options'].append(opt('para me desculpar com desculpas', 'excusandas', 'para me desculpar com desculpas',
    "The v1 stylist's: names the person. Refused: the gerundive has none; the ambiguity reader already heard 'so that I would make excuses' first.", 'stylist'))

# 140:5 impinguet — Latinist refused under the row
dec['impinguet']['options'][2]['note'] = "The Latin's literal 'fatten'; the v1 Latinist's fix (minor). Refused under the row (22:5b, where the Latinist withdrew the same request)."
dec['impinguet']['options'][2]['from'] = 'latinist'

# 140:6 adhucet — new decision (stylist's order taken)
d['decisions'].insert([i for i, x in enumerate(d['decisions']) if x['id'] == 'beneplacitis'][0], {
    'id': 'adhucet', 'refs': ['140:6'], 'latin': 'Quóniam adhuc et orátio mea',
    'kind': 'order',
    'why': "Adhuc 'still' and et 'also, even' both stand before the subject. v1 split them round it ('ainda a minha oração também está'), which the stylist found had two adverbs pulling in two places (his worst line). His order is taken: et → 'até' (even), its other plain sense (MS1932 'até a minha oração'), and 'ainda' beside the verb. Order and the plainer of two faithful words (D2); no word lost. 'Porque' is kept for quóniam against his 'Pois' (the default).",
    'options': [
        opt('até a minha oração ainda está', 'adhucet', 'até a minha oração ainda está', "v2, the stylist's order (with 'Porque').", 'stylist'),
        opt('ainda a minha oração também está', 'adhucet', 'ainda a minha oração também está', 'v1.', 'draft'),
    ]})

# 140:8 dissipata — stylist taken
d['decisions'].insert([i for i, x in enumerate(d['decisions']) if x['id'] == 'infernum'][0], {
    'id': 'dissipata', 'refs': ['140:8'], 'latin': 'Dissipáta sunt ossa nostra',
    'kind': 'grammar',
    'why': "dissipáre → dispersar for bones strewn (the row; 52:6b, 21:15). v1 had the periphrastic passive 'Foram dispersos'; the stylist heard 'dispersos os nossos ossos' hiss and blur in choir. The pronominal passive 'Dispersaram-se' is the same verb and the same sense, with a thing as subject (grammar, D2); taken. 21:15 'foram dispersos todos os meus ossos' is another Latin verb (dispérgere) in another psalm and stays.",
    'options': [
        opt('Dispersaram-se', 'dissipata', 'Dispersaram-se', "v2, the stylist's.", 'stylist'),
        opt('Foram dispersos', 'dissipata', 'Foram dispersos', "v1: the Latin's passive; as 21:15.", 'draft'),
    ]})

# 140:10 singulariter — slot widened; stylist's 'até que passe' refused
s = dec['singulariter']
s['options'] = [
    opt('a sós estou eu, até que eu passe', 'singulariter', 'a sós estou eu, até que eu passe', 'The row (4:10); tránseam is first person and says so.', 'glossary'),
    opt('a sós estou eu, até que passe', 'singulariter', 'a sós estou eu, até que passe', "The v1 stylist's: the second 'eu' dropped. Refused: bare 'passe' is heard as 'until it (the danger) passes' — one of the readings the ambiguity reader listed — where the Latin's form is first person.", 'stylist'),
    opt('sozinho estou eu, até que eu passe', 'singulariter', 'sozinho estou eu, até que eu passe', 'Plainer; a masculine the Latin does not have.', 'draft'),
    opt('eu estou só, até que eu passe', 'singulariter', 'eu estou só, até que eu passe', 'MS1932.', 'MS1932'),
]

d['choices']['140:3'] = "'guarda' is the noun, as 38:2b; the ambiguity reader noted it could be heard as the verb after 'Ponde', and took the noun. Kept."
d['choices']['140:6'] += " The ambiguity reader found 'no que lhes agrada' contradictory on first hearing: the Latin is as obscure (decision beneplacitis); not clarified."
d['choices']['140:7'] = "'espessura' was listed unknown by the ambiguity reader; it is crassitúdo's plain word and no plainer faithful one exists (decision crassitudo). Kept."
d['choices']['140:9'] = d['choices']['140:9'] + " 'tropeços' listed unknown by the ambiguity reader, as at 48:14; kept under the row. The stylist named 140:9 the best line."

A = d['audit']
A.append({'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'Claude Opus 5.5, fresh context, with latin.json. 3 minor, no major; all three refused, each kept as an option.', 'outcomes': [
    {'verse': '140:3', 'remark': "relative clause for the noun genitive; asks 'uma porta de cerco'", 'outcome': 'option', 'decision': 'ostium', 'reason': "'cerco' is heard as a siege; a noun made a clause is grammar (D2)."},
    {'verse': '140:4', 'remark': "reflexive added; asks 'para dar desculpas'", 'outcome': 'option', 'decision': 'excusandas', 'reason': "His fix drops the Latin's figura etymologica, which D2 keeps; the reflexive only gives the infinitive a Portuguese build."},
    {'verse': '140:5', 'remark': "'unja' flattens impinguet; asks 'engorde'", 'outcome': 'option', 'decision': 'impinguet', 'reason': 'The impinguáre row (22:5b) is ungir, and the 22:5b Latinist withdrew this very request.'},
]})
A.append({'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': "Claude Opus 5.5, fresh context, with latin.json. 5 remarks: 2 taken (140:6 order, 140:8 voice), 3 kept as options. Worst line 140:6, best 140:9.", 'outcomes': [
    {'verse': '140:2', 'remark': "'Que … seja dirigida' flat; asks 'Dirija-se a minha oração'", 'outcome': 'option', 'decision': 'dirigatur', 'reason': "Heard aloud as 'dirija-se à minha oração' (go to my prayer)."},
    {'verse': '140:4', 'remark': "'se desculpar' has no clear subject; asks 'me'", 'outcome': 'option', 'decision': 'excusandas', 'reason': 'The gerundive names no person; the ambiguity reader heard the first person anyway.'},
    {'verse': '140:6', 'remark': "'ainda … também' split round the subject", 'outcome': 'taken', 'decision': 'adhucet'},
    {'verse': '140:8', 'remark': "'Foram dispersos os nossos ossos' hisses", 'outcome': 'taken', 'decision': 'dissipata'},
    {'verse': '140:10', 'remark': "second 'eu' redundant", 'outcome': 'option', 'decision': 'singulariter', 'reason': "Without it 'passe' is heard as 'until it passes'; tránseam is first person."},
]})
A.append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': "Claude Opus 5.5, fresh context. 24 ambiguities, nearly all the Latin's own (140:4b attachment, 140:6, 140:7, eléctis, ejus) and left open on purpose; unknown words: vespertino, unja, espessura, tropeços. One change: 'vespertino' → 'da tarde'.", 'outcomes': [
    {'verse': '140:2', 'remark': "'vespertino' unknown", 'outcome': 'taken', 'decision': 'elevatio'},
    {'verse': '140:3', 'remark': "'guarda' could be heard as the verb", 'outcome': 'refused', 'reason': 'The reader took the noun; = 38:2b.'},
    {'verse': '140:4', 'remark': "subject of 'se desculpar' open", 'outcome': 'refused', 'reason': 'Heard first as the first person, the right sense; the Latin names no person.'},
    {'verse': '140:4b', 'remark': 'first colon attaches forward or back; eléctis persons or things; comunhão Eucharistic', 'outcome': 'refused', 'reason': "The attachment and eléctis are the Latin's ambiguities; 'comunhão' was heard as fellowship first."},
    {'verse': '140:5', 'remark': "'unja' unknown; image of the oil unclear", 'outcome': 'refused', 'reason': 'The glossary word (22:5b); the image is the Latin\'s.'},
    {'verse': '140:6', 'remark': "'no que lhes agrada' heard as contradictory; rock image unclear", 'outcome': 'refused', 'reason': "The Latin is this obscure; the Hebrew's 'against' is not imported."},
    {'verse': '140:7', 'remark': "subject of 'tiveram poder' open; 'espessura' unknown; simile's attachment unclear", 'outcome': 'refused', 'reason': "The open subject is the Latin's (decision potuerunt); espessura has no plainer faithful word."},
    {'verse': '140:8', 'remark': "'inferno' heard as hell; 'porque' hard to connect", 'outcome': 'refused', 'reason': 'The inférnus row (open, D22); quia → porque is the default.'},
    {'verse': '140:9', 'remark': "'tropeços' unknown / whose stumbles", 'outcome': 'refused', 'reason': 'The scándalum row; heard as traps first, the right sense.'},
    {'verse': '140:10', 'remark': "'dele' owner unclear; 'passe' may be heard as dying", 'outcome': 'refused', 'reason': "The owner is left open as ejus leaves it; 'passar' is the Latin's verb."},
]})
A.append({'step': 'revision', 'version': 2, 'note': "v2: 140:2 'sacrifício da tarde'; 140:6 'Porque até a minha oração ainda está' (stylist's order); 140:8 'Dispersaram-se os nossos ossos' (stylist). Draft 1 kept as prayed.v1.json. Latinist gate owed on v2."})

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
