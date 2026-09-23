"""Ps 131 v1 -> v2 after latinist, stylist, ambiguity readers."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['131:5'] = V['131:5'].replace('até que eu encontre', 'até que encontre')
V['131:6'] = 'Eis que em Éfrata {audivimus}: * nós a encontramos nos campos da selva.'
V['131:11'] = '{veritatem}, e {frustr}: * Do fruto do teu ventre porei sobre o teu trono.'

dec = {x['id']: x for x in d['decisions']}


def first(did, label):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


# 131:17 genitive
c = dec['cornu']
c['why'] += ' v2: the genitive adopted — the Latin reader for the word, and the stylist and ambiguity readers both heard *pôr chifre* (cuckoldry) in *um chifre para Davi*, which the genitive removes; the two colons stay parallel as two things God makes ready.'
first('cornu', 'o chifre de Davi')
c['options'][0]['note'] = 'v2 ruling: genitive, the Latin read as it stands (DRB margin, MS1932 *o poder de David* with its gloss removed). Keeps the horn-image and loses the colloquial echo.'
c['options'][0]['from'] = 'critic'
c['options'][1]['note'] = 'v1 draft: dative with the Greek and DRB. Refused in v2: *chifre para alguém* is heard as cuckoldry in Brazil (stylist, ambiguity).'

# 131:7 stare
s = dec['steterunt']
s['why'] += ' v2: the Latin reader: *stare* is standing, *se deter* adds arrested motion; 121:2 had *erant stantes* after a journey, 131:7 has none. *estiveram* taken.'
first('steterunt', 'estiveram os seus pés')
s['options'][0]['note'] = 'v2 ruling: plain, the verb the Latin has (the Latin reader).'
s['options'][0]['from'] = 'critic'
s['options'][1]['note'] = 'v1 draft, after 121:2; refused in v2 as adding motion.'

# 131:11 order and frustrari
v = dec['veritatem']
v['why'] += ' v2: the stylist heard three unstressed *a*s run together (*a verdade a Davi … não a*). The subject is put first and the object pronoun made enclitic in *há de frustrá-la*.'
v['options'].insert(0, {'label': 'O Senhor jurou a Davi a verdade', 'forms': {'veritatem': 'O Senhor jurou a Davi a verdade'}, 'note': 'v2 ruling (stylist): the plain order; *a verdade* at the caesura then carries *frustrá-la*.', 'from': 'critic'})
f = dec['frustr']
f['why'] += ' v2: *não a frustrará* dropped with the order change; *não há de frustrá-la* keeps the cognate, puts the pronoun after the verb (no *não a* cluster), and gives a paroxytone at the mediant. The ambiguity reader did not know *frustrar* for an oath, which is the cost of the cognate.'
f['options'].insert(0, {'label': 'não há de frustrá-la', 'forms': {'frustr': 'não há de frustrá-la'}, 'note': 'v2 ruling (stylist).', 'from': 'critic'})

# 131:6 order
a = dec['audivimus']
a['why'] += ' v2: the place name fronted (stylist) so the mediant is not the proparoxytone *Éfrata*; D28 lets order yield to the ear. *falar* kept although the Latin reader calls it slightly explanatory: the bare *a ouvimos* is heard as a voice.'
for o in a['options']:
    if o['label'] == 'ouvimos falar dela':
        o['forms'] = {'audivimus': 'ouvimos falar dela'}

ch = d['choices']
ch['131:5'] = ch['131:5'].replace("*donec invéniam* → *até que eu encontre* (subject named: *até que encontre* could be heard in the third person).", "*donec invéniam* → *até que encontre* (v2: the supplied *eu* dropped at the stylist's word; *minhas têmporas* keeps the first person).")
ch['131:6'] = ch['131:6'] + ' *selva* kept against the stylist\'s *bosque*: D44 ruled it (*silva* is one word through the psalter).'
ch['131:17'] = "*Illuc → Ali*. *parávi* perfect kept (*preparei*), against the future of the first colon, as the Latin. *lucérna → lâmpada* as 17:29, 118:105. *Christo meo → para o meu Cristo* (D19). v2: with the genitive (decision cornu) 17a is 12 syllables; the length flag on 17b (+4) is accepted for *para o meu Cristo*."
ch['131:7'] = ch['131:7'].replace('Length flag 7a', 'Length flag 7a')

d['audit'].append({
    'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'No critical or major issue; six minors.',
    'outcomes': [
        {'verse': '131:3', 'remark': 'oath si resolved into plain negative', 'outcome': 'kept', 'decision': 'si_oath', 'reason': 'The glossary row and 94:10, 88:36 rule the plain negative; the reader calls it defensible. The literal stays as option 2.'},
        {'verse': '131:4', 'remark': 'same as 131:3', 'outcome': 'kept', 'decision': 'si_oath', 'reason': 'Follows 131:3.'},
        {'verse': '131:6', 'remark': '*falar* supplied', 'outcome': 'kept', 'decision': 'audivimus', 'reason': 'Reader calls it acceptable idiom; *a ouvimos* is heard as hearing a voice.'},
        {'verse': '131:7', 'remark': '*se detiveram* shifts stand to halt', 'outcome': 'adopted', 'decision': 'steterunt', 'reason': '*estiveram*.'},
        {'verse': '131:15', 'remark': '*pánibus* plural made singular', 'outcome': 'kept', 'decision': 'panibus', 'reason': 'D42: plural *panes* for bread is idiom, rendered singular (41:4, 104:40).'},
        {'verse': '131:17', 'remark': '*cornu David* is genitive', 'outcome': 'adopted', 'decision': 'cornu', 'reason': '*o chifre de Davi*; also removes the colloquial echo the other readers heard.'},
    ]})
d['audit'].append({
    'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'Worst line 131:17, best 131:18.',
    'outcomes': [
        {'verse': '131:5', 'remark': 'long colon; drop the supplied *eu*', 'outcome': 'adopted', 'reason': '*até que encontre*.'},
        {'verse': '131:6', 'remark': 'proparoxytone mediant *Éfrata*', 'outcome': 'adopted', 'decision': 'audivimus', 'reason': '*Eis que em Éfrata ouvimos falar dela*.'},
        {'verse': '131:6', 'remark': '*selva* heard as jungle; *bosque*', 'outcome': 'refused', 'reason': 'D44 rules *silva → selva* psalter-wide.'},
        {'verse': '131:11', 'remark': 'three unstressed *a*s; inverted order', 'outcome': 'adopted', 'decision': 'veritatem', 'reason': '*O Senhor jurou a Davi a verdade, e não há de frustrá-la*.'},
        {'verse': '131:13', 'remark': '*habitação sua* bookish; *para sua habitação*', 'outcome': 'refused', 'decision': 'sibi', 'reason': '*sua habitação* rhymes with the mediant *Sião* (rule 5, accidental rhyme); the postposed possessive is the Latin\'s order and still sayable.'},
        {'verse': '131:17', 'remark': '*chifre para Davi* heard as cuckoldry', 'outcome': 'adopted', 'decision': 'cornu', 'reason': 'Genitive *o chifre de Davi*.'},
    ]})
d['audit'].append({
    'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context, Portuguese only)',
    'note': 'Mostly the Latin\'s own ambiguities (whose widow, whose priests, the face of the Christ, the unnamed *eam*); kept per D2. Unknown words: mansidão, sonolência, têmporas, Éfrata, frustrar of an oath.',
    'outcomes': [
        {'verse': '131:17', 'remark': 'colloquial *pôr chifre*', 'outcome': 'adopted', 'decision': 'cornu', 'reason': 'Genitive removes the dative that triggers the echo.'},
        {'verse': '131:5', 'remark': '*têmporas* unknown / Ember Days', 'outcome': 'kept', 'decision': 'tempora', 'reason': 'The concrete image; *fontes* is heard as springs, worse. After *olhos* and *pálpebras* the head is near.'},
        {'verse': '131:6', 'remark': '*dela* has no clear antecedent', 'outcome': 'kept', 'decision': 'audivimus', 'reason': 'The Latin\'s *eam* has none either; naming the ark is a gloss.'},
        {'verse': '131:10', 'remark': 'whose face is turned', 'outcome': 'kept', 'reason': 'The Latin\'s grammar (*fáciem Christi tui*); 83:10 the same.'},
        {'verse': '131:15', 'remark': '*Bendizendo, bendirei* heard as odd', 'outcome': 'kept', 'decision': 'benedicens', 'reason': 'D2 keeps the figure; heard as emphatic, which is its sense.'},
        {'verse': '131:1', 'remark': '*mansidão* unknown', 'outcome': 'kept', 'reason': 'Row, 44:5b, 89:10b.'},
    ]})
d['audit'].append({'step': 'revision', 'version': 2, 'file': 'prayed.json', 'note': 'v1 kept as prayed.v1.json / prayed.v1.vos.json. Changed: 131:5 (*eu* dropped), 131:6 (Éfrata fronted), 131:7 (*estiveram*), 131:11 (order, *não há de frustrá-la*), 131:17 (genitive *o chifre de Davi*).'})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
