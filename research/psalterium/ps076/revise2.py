"""Draft 2 of Ps 76 from the v1 readers (prayed.v1.json kept)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
v = d['verses']
dec = {x['id']: x for x in d['decisions']}

def opt(did, label, forms, note, frm, first=False):
    o = {'label': label, 'forms': forms, 'note': note, 'from': frm}
    if first:
        dec[did]['options'].insert(0, o)
    else:
        dec[did]['options'].append(o)

def promote(did, label):
    ops = dec[did]['options']
    i = next(k for k, o in enumerate(ops) if o['label'] == label)
    ops.insert(0, ops.pop(i))

# 76:5 fiquei perturbado (stylist)
v['76:5'] = 'Os meus olhos {anticipaverunt}: * {turbatus}, e não falei.'
d['decisions'].append({'id': 'turbatus', 'refs': ['76:5'], 'latin': 'turbátus sum', 'kind': 'grammar',
  'why': "turbári → perturbar (row). The perfect passive of an inner state: 'fui perturbado' (118:60's form) is heard as someone else troubling the speaker (the v1 stylist); 'fiquei perturbado' says the state, and is still passive in build. Grammar, under D2.",
  'options': [
    {'label': 'fiquei perturbado', 'forms': {'turbatus': 'fiquei perturbado'}, 'note': 'v2: the stylist.', 'from': 'stylist'},
    {'label': 'fui perturbado', 'forms': {'turbatus': 'fui perturbado'}, 'note': 'Draft 1; 118:60.', 'from': 'draft'},
    {'label': 'perturbei-me', 'forms': {'turbatus': 'perturbei-me'}, 'note': 'Reflexive, as 76:17 se perturbaram.', 'from': 'stylist'}]})
d['choices']['76:5'] = "v2 'fiquei perturbado' (decision `turbatus`); 76:17's 'se perturbaram' (of the abysses) follows 45:4's waters."

# 76:6 tive em mente
v['76:6'] = 'Pensei nos dias antigos: * e tive em mente os anos eternos.'
d['choices']['76:6'] = d['choices']['76:6'].replace("'tive na mente' for in mente hábui, MS1932's wording.", "v2 'tive em mente' (the stylist: the living idiom; draft 1 'tive na mente', MS1932) — the same words, the idiom's preposition.")

# 76:8 voltará
dec['apponet']['options'].insert(0, {'label': 'voltará ainda a ser mais favorável', 'forms': {'apponet': 'voltará ainda a ser mais favorável'}, 'note': "v2: the stylist — 'voltar a' is the current auxiliary of repetition.", 'from': 'stylist'})
for o in dec['apponet']['options']:
    if o['label'] == 'tornará ainda a ser mais favorável':
        o['note'] = 'Draft 1.'
dec['apponet']['why'] += " v2: 'voltar a' for 'tornar a' (the stylist), the same idiom, plainer."
opt('proiciet', 'rejeitará (the stylist)', {'proiciet': 'rejeitará'}, "The v1 stylist asked it (object-less 'lançará fora' hangs; '-ra pa-'); held for the row — see audit.", 'stylist')
# drop the duplicate earlier 'rejeitará' draft option
dec['proiciet']['options'] = [o for o in dec['proiciet']['options'] if not (o['label'] == 'rejeitará' and o['from'] == 'draft')]

# 76:9 até o fim
v['76:9'] = 'Ou cortará {infinem} a sua misericórdia, * de geração em geração?'
promote('infinem', 'até o fim')
dec['infinem']['options'][0]['note'] = "v2: the Latinist and the stylist, independently — keeps in finem apart from 76:8's in ætérnum (48:9's build); not negated, so D27's misreading does not arise."
dec['infinem']['options'][1]['note'] = 'Draft 1: D27, perpetuity.'
dec['infinem']['why'] += " v2: both readers asked 'até o fim' so that the Latin's move from in ætérnum to in finem is heard; taken, and the phrase moved after the verb (the stylist's order)."

# 76:11 E eu disse
v['76:11'] = 'E eu disse: Agora {coepi}: * esta é a mudança da {dextera} do {excelsi}.'
dec['coepi']['why'] = dec['coepi']['why'].replace("No subject pronoun supplied: 'E eu disse' was tried and put the colon 4 syllables over.", "v2: the subject 'eu' supplied (grammar): without it the stylist and the ambiguity reader both heard 'and he said' (God).")
d['decisions'].append({'id': 'dextera', 'refs': ['76:11'], 'latin': 'déxteræ', 'kind': 'glossary',
  'why': "déxtera → a direita (row, open; 17:36a, 15:11, 117:16 — the blind readers there heard the right hand first). The v1 stylist asks 'mão direita' (bare 'direita' = side, or politics); the ambiguity reader heard the hand but called it opaque. Held for the row, which binds many psalms; the option is here and the row notes the remark.",
  'options': [
    {'label': 'direita', 'forms': {'dextera': 'direita'}, 'note': 'Ruling: the row.', 'from': 'glossary'},
    {'label': 'mão direita', 'forms': {'dextera': 'mão direita'}, 'note': 'The stylist: the hand named.', 'from': 'stylist'},
    {'label': 'destra', 'forms': {'dextera': 'destra'}, 'note': 'MS1932 dextra; hieratic.', 'from': 'MS1932'}]})
dec['excelsi']['why'] += " v1: the stylist found 'Excelso' precious beside the usual 'Altíssimo', and the ambiguity reader listed it unknown (as the Ps 46 reader did 'excelso'); held under D43, flagged in the row for Gustavo."

# 76:12 order
promote('abinitio', 'das vossas maravilhas desde o início')
dec['abinitio']['options'][0]['note'] = "v2: the stylist — the verb reaches its complement first; 'desde o início' at the end can still go with 'me lembrarei' or with 'maravilhas', so the Latin's two readings stay open."
dec['abinitio']['options'][1]['note'] = "Draft 1: the Latin's order; the ear stumbles on 'o início das vossas maravilhas'."

# 76:13 invenções held
opt('adinventio', 'desígnios (the stylist)', {'adinventio': 'desígnios'}, 'The v1 stylist asked it again; see the MS1932 option. Refused: consílium\'s word (D33).', 'stylist')
dec['adinventio']['options'] = [o for o in dec['adinventio']['options'] if o['label'] != 'desígnios']
dec['adinventio']['options'][-1]['label'] = 'desígnios'
dec['adinventio']['options'][-1]['note'] = "MS1932, and the v1 stylist's request; consílium's word (D33)."
dec['adinventio']['why'] += " v1: the stylist named 76:13 the worst line for 'invenções' (gadgets, fabrications) and the ambiguity reader listed it unknown / odd. Held: the row serves six places, three of them bad devisings; the one plain alternative (desígnios) is taken. Flagged in the row for Gustavo."

# 76:14 no santo + qual
v['76:14'] = 'Deus, {insancto} o vosso caminho: {quis} Deus é grande como o nosso Deus? * vós sois o Deus que fazeis maravilhas.'
dec['insancto']['options'].insert(0, {'label': 'no santo está', 'forms': {'insancto': 'no santo está'}, 'note': "v2: the Latinist — the bare neuter, place or holiness left open (59:8's v2 ruling); the copula supplied because 'no santo' alone, verbless, is too cryptic to stand as a versicle.", 'from': 'latinist'})
dec['insancto']['options'] = [o for o in dec['insancto']['options'] if o['label'] != 'no santo']
for o in dec['insancto']['options']:
    if o['label'] == 'no lugar santo':
        o['note'] = "Draft 1: the row; 76:20's parallel; DRB. The ambiguity reader heard the sanctuary."
dec['insancto']['why'] += " v2: the Latinist (minor) marked 'lugar' as choosing one reading of ἐν τῷ ἁγίῳ; that is right under rule 2 (keep ambiguities), as at 59:8, so the bare 'no santo' is taken. Cost: 76:20 stays verbless while 76:14 has 'está'."
d['decisions'].append({'id': 'quis', 'refs': ['76:14'], 'latin': 'quis Deus magnus sicut Deus noster?', 'kind': 'grammar',
  'why': "'Que Deus é grande' is heard first as the exclamation 'how great God is!' (the stylist and the ambiguity reader both). 'Qual' makes it a question from the first word; the same words otherwise. The versicle's response (Psalmi matutinum) reads alone from it.",
  'options': [
    {'label': 'qual', 'forms': {'quis': 'qual'}, 'note': 'v2: the stylist.', 'from': 'stylist'},
    {'label': 'que', 'forms': {'quis': 'que'}, 'note': 'Draft 1 (MS1932 que … há).', 'from': 'draft'}]})

# 76:17 ó Deus refused -> option
v['76:17'] = 'Viram-vos as águas, {deus17}, viram-vos as águas: * e temeram, e se perturbaram os abismos.'
d['decisions'].append({'id': 'deus17', 'refs': ['76:17'], 'latin': 'Vidérunt te aquæ, Deus', 'kind': 'glossary',
  'why': "The bare vocative 'Deus', as everywhere in the psalter (glossary; 50:3a). The v1 stylist asked 'ó Deus' for the pause; refused for the glossary's rule, kept as the option.",
  'options': [
    {'label': 'Deus', 'forms': {'deus17': 'Deus'}, 'note': 'Ruling: the bare vocative.', 'from': 'glossary'},
    {'label': 'ó Deus', 'forms': {'deus17': 'ó Deus'}, 'note': 'The stylist; MS1932.', 'from': 'stylist'}]})

# 76:18 grande estrondo
dec['multitudo']['options'].insert(0, {'label': 'Grande estrondo das águas', 'forms': {'multitudo': 'Grande estrondo das águas'}, 'note': "v2: the stylist — 'muito estrondo' is colloquial ('what a racket'); still verbless, the mass of the sound kept as its greatness.", 'from': 'stylist'})
for o in dec['multitudo']['options']:
    if o['label'] == 'Muito estrondo das águas':
        o['note'] = 'Draft 1: quantity kept; heard as colloquial.'
dec['multitudo']['why'] += " v2: the stylist heard 'Muito estrondo' as colloquial; 'Grande estrondo' is MS1932's adjective without his supplied verb — number becomes size, which for the multitude of a sound is how Portuguese says it."
opt('vocem', 'as nuvens deram a sua voz', {'vocem': 'as nuvens deram a sua voz'}, "The v1 stylist (and the Latinist's 'deram voz'): the Latin's verb; the row says 'deu a sua voz' is not said.", 'stylist')
dec['vocem']['why'] += " v1: the Latinist asked 'deram voz' (dare), the stylist 'deram a sua voz'; both held for the row (17:14, 45:7), whose reason — 'dar a voz' is not Portuguese for making a sound, and 'dar voz a' means to voice something else — stands. The ambiguity reader heard 'the clouds thundered'."

# 76:20 option
v['76:20'] = 'No mar o vosso caminho, e as vossas veredas {aquis}: * e as vossas pegadas não serão conhecidas.'
d['decisions'].append({'id': 'aquis', 'refs': ['76:20'], 'latin': 'in aquis multis', 'kind': 'glossary',
  'why': "aquæ multæ without the article, as 28:3 'sobre muitas águas' and 17:17 'de muitas águas' (the phrase kept one across psalms, rule 6). The v1 stylist asked 'nas muitas águas' (the vast waters, not 'several waters'); kept as the option.",
  'options': [
    {'label': 'em muitas águas', 'forms': {'aquis': 'em muitas águas'}, 'note': 'Ruling: as 28:3, 17:17.', 'from': 'glossary'},
    {'label': 'nas muitas águas', 'forms': {'aquis': 'nas muitas águas'}, 'note': 'The stylist.', 'from': 'stylist'}]})

d['version'] = 2
d['status'] = 'reviewed'
d['audit'] += [
 {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Four minors, no major: 76:9 and 76:14 taken; 76:7 and 76:18 refused.',
  'outcomes': [
   {'verse': '76:7', 'remark': "scopébam = 'sweep'; 'examinava' abstracts", 'outcome': 'option', 'decision': 'scopebam', 'reason': "The form scopébam is an -ēbam imperfect, the conjugation of scopo, -ere (= σκοπέω, 'search'), which L&S gives for this very verse; the sweeping verb scopáre would make scopábam. The Greek ἔσκαλλεν is a searching verb. 'varria' (DRB) stays option 3."},
   {'verse': '76:9', 'remark': 'in finem merged with 76:8 in ætérnum', 'outcome': 'taken', 'decision': 'infinem'},
   {'verse': '76:14', 'remark': "'lugar' resolves the ambiguity of in sancto", 'outcome': 'taken', 'decision': 'insancto'},
   {'verse': '76:18', 'remark': "'fizeram ouvir' paraphrases dedérunt", 'outcome': 'refused', 'decision': 'vocem', 'reason': "The row vocem dare → fazer ouvir a voz (17:14, 45:7): 'deram voz' is heard as 'gave voice to' something."}]},
 {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. 16 remarks in 13 verses; best 76:19, worst 76:13. Taken 8, refused 8 (each kept as an option).',
  'outcomes': [
   {'verse': '76:3', 'remark': "'procurei' heavy; 'busquei'", 'outcome': 'refused', 'decision': 'exquisivi', 'reason': "exquírere → procurar (row; 26:8), kept apart from quǽrere → buscar; the gain is one syllable."},
   {'verse': '76:4', 'remark': "'me exercitei' sounds like a gym (also 76:7, 76:13); 'me agitei'", 'outcome': 'refused', 'decision': 'exerceri', 'reason': "The row across Ps 118 (five places) and 54:3; 'agitar-se' is another verb's meaning and the stylist has no form for 76:13. Not added as an option for that reason; the row's own option 'ocupar-se' is there."},
   {'verse': '76:5', 'remark': "'fui perturbado' → 'fiquei perturbado'", 'outcome': 'taken', 'decision': 'turbatus'},
   {'verse': '76:6', 'remark': "'tive na mente' → 'tive em mente'", 'outcome': 'taken'},
   {'verse': '76:8', 'remark': "'lançará fora' hangs; 'rejeitará'", 'outcome': 'refused', 'decision': 'proiciet', 'reason': "proícere → lançar (row, which names 76:8); 'rejeitar' is reprobáre's (117:22). The missing object is the Latin's."},
   {'verse': '76:8', 'remark': "'tornará ainda a' → 'voltará ainda a'", 'outcome': 'taken', 'decision': 'apponet'},
   {'verse': '76:9', 'remark': "'para sempre' repeats 76:8; 'até o fim'", 'outcome': 'taken', 'decision': 'infinem'},
   {'verse': '76:11', 'remark': "'E disse' heard as 'he said'", 'outcome': 'taken', 'decision': 'coepi'},
   {'verse': '76:11', 'remark': "'a direita' → 'mão direita'; 'Excelso' → 'Altíssimo'", 'outcome': 'refused', 'decision': 'dextera', 'reason': "déxtera → a direita (row, readers of 15:11, 17:36a heard the hand); Excélsus kept apart from Altíssimus (D43). Both options; both flagged in the glossary."},
   {'verse': '76:12', 'remark': "'desde o início' splits verb and complement; put it last", 'outcome': 'taken', 'decision': 'abinitio'},
   {'verse': '76:13', 'remark': "'invenções' comic for God; 'desígnios'", 'outcome': 'refused', 'decision': 'adinventio', 'reason': "desígnios is consílium's word (D33); the row serves six places; flagged for Gustavo."},
   {'verse': '76:14', 'remark': "'que Deus é grande' heard as exclamation; 'qual'", 'outcome': 'taken', 'decision': 'quis'},
   {'verse': '76:17', 'remark': "bare 'Deus' abrupt; 'ó Deus'", 'outcome': 'refused', 'decision': 'deus17', 'reason': 'The glossary rule: bare vocative, no ó.'},
   {'verse': '76:18', 'remark': "'Muito estrondo' colloquial; 'Grande estrondo'", 'outcome': 'taken', 'decision': 'multitudo'},
   {'verse': '76:18', 'remark': "'deram a sua voz'", 'outcome': 'refused', 'decision': 'vocem', 'reason': 'The vocem dare row (17:14, 45:7).'},
   {'verse': '76:20', 'remark': "'em muitas águas' → 'nas muitas águas'", 'outcome': 'refused', 'decision': 'aquis', 'reason': 'aquæ multæ without the article in 28:3 and 17:17; the phrase kept one.'}]},
 {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, Portuguese only. 30 readings, 6 unknown words (Excelso, desfaleceu, vigílias, roda, invenções, veredas).',
  'outcomes': [
   {'verse': '76:11', 'remark': "'E disse' could be God", 'outcome': 'taken', 'decision': 'coepi'},
   {'verse': '76:14', 'remark': "'que Deus é grande' as exclamation", 'outcome': 'taken', 'decision': 'quis'},
   {'verse': '76:4', 'remark': "'me exercitei' heard as physical exercise (also 76:7, 76:13)", 'outcome': 'refused', 'decision': 'exerceri', 'reason': 'The row; the cost it names (54:3) is confirmed here and noted in the glossary.'},
   {'verse': '76:13', 'remark': "'invenções' odd / unknown", 'outcome': 'refused', 'decision': 'adinventio', 'reason': 'The row; flagged for Gustavo.'},
   {'verse': '76:11', 'remark': "'Excelso' unknown; 'direita' opaque", 'outcome': 'refused', 'decision': 'excelsi', 'reason': 'D43; flagged.'},
   {'verse': '76:8', 'remark': "object of 'lançará fora' inaudible", 'outcome': 'refused', 'decision': 'proiciet', 'reason': "The Latin has none; the reader heard 'reject us' anyway."},
   {'verse': '76:6', 'remark': "'anos eternos' heard as eternity", 'outcome': 'refused', 'reason': "The Latin's words (ἔτη αἰώνια); both Vulgate-family witnesses keep them."},
   {'verse': '76:5', 'remark': "'vigílias' unknown / church vigils", 'outcome': 'refused', 'reason': 'The Latin word (the night watches); a second reading the Latin itself allows a Christian ear.'},
   {'verse': '76:18b', 'remark': "'na roda' opaque", 'outcome': 'refused', 'decision': 'inrota', 'reason': "The Latin's concrete image (ἐν τῷ τροχῷ), rule 5."}]},
 {'step': 'revision', 'version': 2, 'note': "v2 (prayed.v1.json kept; script revise2.py): 76:5 'fiquei perturbado'; 76:6 'tive em mente'; 76:8 'voltará ainda a'; 76:9 'cortará até o fim'; 76:11 'E eu disse'; 76:12 'das vossas maravilhas desde o início'; 76:14 'no santo está', 'qual Deus'; 76:18 'Grande estrondo das águas'. New decisions: turbatus, dextera, quis, deus17, aquis."}]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
