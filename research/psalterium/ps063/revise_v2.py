"""Ps 63 draft 2: apply the reader outcomes to prayed.json (draft 1 kept as prayed.v1.json)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['63:3'] = 'Vós me protegestes do {conventu} dos malvados: * da multidão dos que praticam a iniquidade.'
V['63:4'] = V['63:4'].replace('como uma espada', 'como espada')
V['63:9'] = 'Perturbaram-se todos aqueles que os viam: * e temeu todo homem.'
dec = {x['id']: x for x in d['decisions']}

def front(did, opt):
    o = dec[did]['options']
    o.insert(0, opt)

# 63:7 scrutinio: 'no seu sondar' to option 0 (Latinist)
o = dec['scrutinio']['options']
o.insert(0, o.pop(1)); o[0]['note'] = 'v2 ruling — the Latinist: *de tanto* adds an intensive the bare ablative does not state'; o[0]['from'] = 'latinist'
o.append({'label': 'na sondagem', 'forms': {'scrutinio': 'na sondagem'}, 'note': "the Latinist's fix; *sondagem* is heard in Brazil as an opinion poll or a drilling", 'from': 'latinist'})
dec['scrutinio']['why'] += " **v2:** the Latinist (minor) found *de tanto* an intensive the Latin does not state; *no seu sondar* (option 1 of draft 1) taken — it keeps the root a third time and leaves failure and exhaustion open. The stylist had named draft 1's line the psalm's best, for the threefold root, which stays."
# 63:7b accedet
o = dec['accedet']['options']
o.insert(0, o.pop(1)); o[0]['note'] = "v2 ruling — the Latinist: *accédere* is to draw near, not to arrive; = 33:6"; o[0]['from'] = 'latinist'
dec['accedet']['why'] += " **v2:** the Latinist (minor) read *chegará* as attainment where *accédet* is approach; taken. It also removes the vowel pile-up *chegará a um* the stylist heard."
# 63:6b narraverunt
o = dec['narraverunt']['options']
o.insert(0, {'label': 'Narraram que esconderiam', 'forms': {'narraverunt': 'Narraram que esconderiam'}, 'note': "v2 ruling — the Latinist: *como* narrows *ut* to 'how'; a content clause, DRB's 'talked of hiding'", 'from': 'latinist'})
o.append({'label': 'Contaram que esconderiam', 'forms': {'narraverunt': 'Contaram que esconderiam'}, 'note': "the stylist's plainer verb; refused for the *narráre → narrar* row (18:2, 21:23)", 'from': 'stylist'})
dec['narraverunt']['why'] += " **v2:** the Latinist (minor): *como* reads *ut* as 'how'; *que* (content) taken. The stylist asked *Contaram* for *Narraram*; kept as an option — the *narráre* row repeats across psalms, and the doubled r is not a trip in Brazilian speech."
# 63:6 nequam
dec['nequam']['options'].append({'label': 'perversa', 'forms': {'nequam': 'perversa'}, 'note': "the stylist: a fuller close than the monosyllable; refused — *perverso* is *pervérsus*'s word (17:27)", 'from': 'stylist'})
dec['nequam']['why'] += " **v2:** the stylist found the monosyllable close weak and asked *perversa*; refused for the collision, kept as an option. An oxytone close is allowed."
# 63:8 order
o = dec['plagae']['options']
o.insert(0, o.pop(1)); o[0]['note'] = "v2 ruling — the stylist; the Greek's parse (αἱ πληγαὶ αὐτῶν the subject)"; o[0]['from'] = 'stylist'
o[0]['forms'] = {'plagaeLine': 'As feridas deles tornaram-se setas de pequeninos'}; o[0]['label'] = 'As feridas deles tornaram-se setas de pequeninos'
dec['plagae']['why'] += " **v2:** the stylist named draft 1's order the worst line (parsed backwards; *deles … eles* at mediant and final) and the ambiguity reader could not say what it meant. Taken: order is grammar (D2), and the parse is the Greek's, which the Latin translates; the other reading was an accident of the Latin's word order more than a meaning it carries. Draft 1's order stays option 2."
d['decisions'].append({
    'id': 'protexisti', 'refs': ['63:3'], 'latin': 'Protexísti me', 'kind': 'grammar',
    'why': "The stylist found the enclitic on *Protegestes-me* at the head of the verse stiff and asked for the subject named with the proclitic, as 60:4 *Vós me guiastes* (the same request, taken there). A subject pronoun is grammar (D2). It also marks the verse as a statement after the imperatives of 63:2, which the ambiguity reader half heard as a plea.",
    'options': [
        {'label': 'Vós me protegestes', 'forms': {'protexisti': 'Vós me protegestes'}, 'note': 'v2 ruling — the stylist; = 60:4', 'from': 'stylist'},
        {'label': 'Protegestes-me', 'forms': {'protexisti': 'Protegestes-me'}, 'note': 'draft 1; no pronoun, as the Latin', 'from': 'draft'}]})
V['63:3'] = '{protexisti} do {conventu} dos malvados: * da multidão dos que praticam a iniquidade.'
c = d['choices']
c['63:4'] = c['63:4'].replace('*ut gládium → como uma espada*, the article supplied and', '*ut gládium → como espada* (v2: the stylist asked the article away; the Latin has none), with')
c['63:8'] = "*infirmátæ sunt → se enfraqueceram* (17:37, 26:2b, 30:11b). *Contra eos* kept: their tongues grew weak against themselves. v2's order removes draft 1's *deles … eles* echo at mediant and final."
c['63:9'] = "*conturbáti sunt → perturbaram-se* (47:6); *omnis homo → todo homem*, verb first as the Latin and 38:12b. v2 (the stylist): *todos aqueles que os viam* for the stutter *os que os*; *e temeu todo homem* for a fuller close than the clipped *todo homem temeu*."
c['63:7b'] = c['63:7b'].replace('The first colon is +5 syllables (checks)', 'The first colon is long (checks)')
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
