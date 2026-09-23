import json
p='research/psalterium/ps115/prayed.json'
d=json.load(open(p,encoding='utf-8'))
d['version']=2
d['verses']['115:3']="Que retribuirei ao Senhor, * por tudo o que {retribuit}?"
D={x['id']:x for x in d['decisions']}
r=D['retribuit']
r['latin']="Quid retríbuam … quæ retríbuit mihi?"
r['why']+=" v2: the subject pronoun *ele* dropped at the stylist's request (grammar, D2): after *ao Senhor* the ear takes the Lord as subject, and *o que ele me* thickened the line. v1's form is option 1."
r['options']=[
 {"label":"me retribuiu","forms":{"retribuit":"me retribuiu"},"note":"v2 — the stylist's line; the repetition kept","from":"stylist"},
 {"label":"ele me retribuiu","forms":{"retribuit":"ele me retribuiu"},"note":"v1 — the subject named, so that *tudo* cannot be heard as subject","from":"draft"},
 {"label":"me concedeu","forms":{"retribuit":"me concedeu"},"note":"the Brazilian Ordo's sense (*me tem concedido*); drops the repetition","from":"draft","warn":True}]
h=D['hostia']
h['why']=("The *hóstia* row (open) is *vítima* (26:6b *uma vítima de aclamação*, 95:8 *Tomai vítimas*); it names this verse and says the word must differ from *sacrifício* (*sacrificáre* is here) — both candidates do. "
 "v1 kept the row. Both the stylist and the ambiguity reader faulted *vítima de louvor* (heard as 'someone harmed', 'victim of praise'; the ambiguity reader listed the sacrificial sense as unknown) — as the Ps 26 blind reader did before. "
 "v2 takes the stylist's *hóstia*: it is the Latin's own word (rule 2 keeps words), MS1932's (*uma hóstia de louvor*), and in this psalm the Church reads the verse eucharistically (Corpus Christi Vespers antiphon *Cálicem salutáris accípiam: et sacrificábo hóstiam laudis*, DO Pent01-4), so the first hearing the row feared — the Host — is here the liturgy's own. "
 "Cost: a local departure — one Latin word is *vítima* at 26:6b and 95:8 and *hóstia* here. Proposed in the glossary row for a ruling across the three places.")
h['options']=[
 {"label":"uma hóstia","forms":{"hostia":"uma hóstia"},"note":"v2 — the stylist; MS1932; the Latin's word","from":"stylist"},
 {"label":"uma vítima","forms":{"hostia":"uma vítima"},"note":"v1 — the *hóstia* row; heard as someone harmed by two readers","from":"glossary"}]
h['refs']=["115:7b"]
pr=D['pretiosa']
pr['why']+=" The stylist (v1) asked to front *à vista do Senhor* ('the weight at the front'; he said it is nearer the Latin, but the Latin's first word is *pretiósa*). Refused, kept as option 2: it moves the predicate off the head where the Latin has it, and the versicle said alone (*Pretiósa in conspéctu Dómini*) would lose its opening word."
pr['options'].append({"label":"à vista … é preciosa","forms":{"pretiosa":"{pv} é preciosa"},"note":"the stylist (v1): place first, then predicate","from":"stylist"})
q=D['quia']
q['why']+=" The ambiguity reader felt the main clause missing after *porque* — which is the Latin's own suspense (*quia* reaches across the asterisk and into 7b) — and noted the homophone *por que*; kept."
c=d['choices']
c['115:7b']=c['115:7b'].replace("*laus → louvor*.","*laus → louvor*. v2 *hóstia* (decision `hostia`).")
c['115:9']+=" The ambiguity reader listed *átrios* as unknown (the fourth blind reader to do so; the row keeps it, the Latin's word) and heard *no meio de ti* rightly as said to the city."
d['status']='reviewed'
d['audit'] += [
 {"step":"latinist","file":"critic/v1.latinist.json","note":"claude-opus-5-5, fresh context. No remarks: tense, person, voice, the Septuagintal *in excéssu*, the *coram / in conspéctu* split and the pointing all passed.","outcomes":[]},
 {"step":"stylist","file":"critic/v1.stylist.json","note":"claude-opus-5-5, fresh context. 3 remarks; 2 taken, 1 kept as an option. Best line 115:4, worst 115:7b.","outcomes":[
   {"verse":"115:3","remark":"drop the subject *ele*","outcome":"taken"},
   {"verse":"115:5","remark":"front *à vista do Senhor* before *é preciosa*","outcome":"option","decision":"pretiosa","reason":"the Latin's head word is *pretiósa*; the versicle said alone would lose it"},
   {"verse":"115:7b","remark":"*vítima de louvor* heard as a crime victim; use *hóstia*","outcome":"taken","decision":"hostia"}]},
 {"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"claude-opus-5-5, fresh context. 12 readings, 3 unknown words.","outcomes":[
   {"verse":"115:1","remark":"*Acreditei* heard as faith first","outcome":"refused","reason":"the Latin's sense; no change needed"},
   {"verse":"115:2","remark":"*fora de mim* heard as distress first, ecstasy second","outcome":"refused","reason":"the Latin leaves it open; the row's phrase keeps both (decision `excessu`)"},
   {"verse":"115:2","remark":"*Todo homem* human / male","outcome":"refused","reason":"the Latin's *homo*; heard as every human being"},
   {"verse":"115:4","remark":"*Tomarei* drink / take up","outcome":"refused","reason":"both are in the image; the eucharistic hearing is the liturgy's"},
   {"verse":"115:5","remark":"*votos* as votes / good wishes","outcome":"refused","reason":"heard as vows first; the *réddere* row"},
   {"verse":"115:5","remark":"*preciosa* valued / costly","outcome":"refused","reason":"the Latin's *pretiósa* holds both"},
   {"verse":"115:7a","remark":"*porque* with the main clause felt missing; homophone *por que*","outcome":"refused","reason":"the Latin's own suspense (decision `quia`)"},
   {"verse":"115:7a","remark":"*serva* social status","outcome":"refused","reason":"heard rightly first"},
   {"verse":"115:7b","remark":"*Rompestes* unknown / heard as third person","outcome":"refused","reason":"the *vós* past, required by D1; heard rightly first"},
   {"verse":"115:7b","remark":"*vítima* in its everyday sense; sacrificial sense unknown","outcome":"taken","decision":"hostia"},
   {"verse":"115:9","remark":"*átrios* unknown","outcome":"refused","reason":"the Latin's word, kept by the *átrium* row"},
   {"verse":"115:9","remark":"*de ti* before the vocative","outcome":"refused","reason":"heard rightly (the city)"}]},
 {"step":"revision","version":2,"note":"v2: 115:3 *ele* dropped (stylist); 115:7b *uma vítima* → *uma hóstia* (stylist + ambiguity reader; a local departure from the open *hóstia* row, proposed in the glossary). Draft 1 kept as prayed.v1.json."}]
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
