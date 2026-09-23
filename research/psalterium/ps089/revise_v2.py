import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
V=d['verses']; D={x['id']:x for x in d['decisions']}
d['version']=2
V['89:9b']="Os nossos anos {meditabuntur} como a aranha: * os dias dos nossos anos são neles setenta anos."
V['89:10']="Mas, se {potentatibus}, oitenta anos: * e {amplius} é fadiga e dor."
V['89:12']="Assim fazei conhecer a vossa direita: * e os de coração instruído na sabedoria."
V['89:14']="De manhã {repleti} da vossa misericórdia: * e exultamos, e nos deleitamos em todos os nossos dias."
# factus
f=D['factus']
f['options'].insert(0,{"label":"para nós vos tornastes refúgio","forms":{"factus":"para nós vos tornastes refúgio"},"note":"v2 — the stylist's order: removes the stutter 'vós vos' and keeps the dative nobis as 'para nós'","from":"stylist"})
f['why']+=" v2: the stylist heard 'vós vos tornastes' as a stutter on the opening line; his order ('Senhor, para nós vos tornastes refúgio') is grammar and order only (D2) and returns the dative to the letter; taken."
# saeculum
s=D['saeculum8']
opts={o['label']:o for o in s['options']}
s['options']=[opts['a nossa vida'],opts['o nosso tempo'],opts['a nossa idade'],opts['o nosso século']]
s['options'][0]['note']="v2 — the Latinist (minor): sǽculum here is the span of our life; DRB 'our life'. The ambiguity reader heard 'o nosso tempo' also as hours or a schedule."
s['options'][0]['from']="latinist"
s['options'][1]['note']="draft 1 — a time word; heard as 'our era' (Latinist) or a schedule (ambiguity reader)"
s['why']+=" v2: the Latinist's fix taken — 'tempo' was vaguer than the Latin, not more open."
# meditabuntur
m=D['meditabuntur']
m['options'][0],m['options'][1]=m['options'][1],m['options'][0]
m['options'][0]['note']="v2 — the stylist's request and the glossary's verb (meditári → meditar); the deponent read with a passive sense, as L&S allows in late Latin and as DRB and MS1932 read it"
m['options'][0]['from']="stylist"
m['options'][1]['note']="draft 1 — DRB, MS1932 'considerados'; the stylist heard it as office-report prose; the ambiguity reader found the line puzzling either way"
m['why']+=" v2: the stylist found 'considerados' a heavy report word and asked for 'meditados'; that is the glossary's verb for meditári, so both the ear and consistency point the same way. The strangeness that remains is the Latin's own (the ambiguity reader could not tell the point of the spider in either wording). Taken."
# potentatibus
D['potentatibus']['why']+=" v2: the colon now opens 'Mas, se …' (the stylist: 'Se, porém,' is written style); autem → mas; order only."
D['potentatibus']['options'][2]['forms']['potentatibus']="houver vigor"
# repleti
D['repleti']['why']+=" v2: 'de manhã' moved to the head of the verse — the stylist heard 'cheios de manhã' as 'full of morning' (worst line); order only."
# deus2
D['deus2']['why']+=" v1 ambiguity reader: heard the predicate ('you are God') first, the comma being inaudible — so the line carries both readings to the ear, which is what the Latin does."
# a saeculo decision
d['decisions'].insert(2,{"id":"asaeculo","refs":["89:2"],"latin":"a sǽculo et usque in sǽculum","kind":"glossary","why":"The Latinist (minor) asked for the concrete 'desde os séculos e até os séculos'. Refused: the phrase is settled across the psalter as 'desde sempre e para todo o sempre' (40:14 = 105:48, D37, D41; the glossary row names 89:2 as a copy), and the plural 'os séculos' is not the Latin's number either. D23 merged in sǽculum with in ætérnum on the Greek test (εἰς τὸν αἰῶνα).","options":[{"label":"desde sempre e para todo o sempre","forms":{"asaeculo":"desde sempre e para todo o sempre"},"note":"the formula (D37, D41)","from":"glossary"},{"label":"desde os séculos e até os séculos","forms":{"asaeculo":"desde os séculos e até os séculos"},"note":"the Latinist's (v1, minor)","from":"latinist"}]})
V['89:2']=V['89:2'].replace("desde sempre e para todo o sempre","{asaeculo}")
C=d['choices']
C['89:9b']="in ipsis → 'neles', now after the copula (v2, the stylist: a comma-cut 'neles' at the head was a false start); 'são' supplied. aránea → 'a aranha', with the article, as a kind."
C['89:12']+=" v2: 'os de coração instruído' (the stylist: 'os instruídos de coração' is stiff and 'de coração' can be heard as 'sincerely'); the participle and the heart kept, order only."
C['89:13']+=" The ambiguity reader listed 'aplacar' as unknown; kept (decision deprecabilis, where 'sede propício' is the plain option)."
C['89:10b']+=" The ambiguity reader listed 'sobreveio' as unknown; kept — supervénit's own verb, and 'veio sobre nós' would add the Greek's ἐφ᾿ ἡμᾶς, which the Latin lacks."
C['89:15']+=" The ambiguity reader heard 'Alegramo-nos' as present or exhortative; the form is the Portuguese past as well, and 89:14's 'fomos cheios' sets the tense; accepted."
lat_out=[
 {"verse":"89:2","remark":"a sǽculo et usque in sǽculum flattened to 'desde sempre … para todo o sempre'","outcome":"option","decision":"asaeculo","reason":"settled formula (D37, D41; 40:14 = 105:48); the glossary row names 89:2"},
 {"verse":"89:8","remark":"sǽculum nostrum: 'o nosso tempo' vaguer than 'a nossa vida'","outcome":"taken","decision":"saeculum8"}]
sty_out=[
 {"verse":"89:1","remark":"'vós vos tornastes' stutters","outcome":"taken","decision":"factus"},
 {"verse":"89:9b","remark":"'considerados' heavy; use 'meditados'","outcome":"taken","decision":"meditabuntur"},
 {"verse":"89:9b","remark":"'neles,' at the head is a false start","outcome":"taken"},
 {"verse":"89:10","remark":"'Se, porém,' written style","outcome":"taken"},
 {"verse":"89:12","remark":"'os instruídos de coração' stiff; 'de coração' = sincerely","outcome":"taken"},
 {"verse":"89:14","remark":"'cheios de manhã' heard as 'full of morning'","outcome":"taken","decision":"repleti"}]
amb_out=[
 {"verse":"89:2","remark":"predicate heard first","outcome":"refused","reason":"both readings are the Latin's; the line still carries both"},
 {"verse":"89:3","remark":"plea vs past 'e dissestes' unclear link","outcome":"refused","reason":"the Latin's own juxtaposition (Ne avértas … et dixísti)"},
 {"verse":"89:5","remark":"'vigília' heard as a vigil, not a watch","outcome":"refused","reason":"vigília is the Portuguese for the night watch (MS1932); 'guarda' is heard as a person — option in tamquam5"},
 {"verse":"89:5","remark":"'seus anos' referent unclear","outcome":"refused","reason":"eórum is as open in the Latin"},
 {"verse":"89:6","remark":"no subject; subjunctive heard as a wish","outcome":"refused","reason":"the Latin's mood and missing subject, kept on purpose (decision mood6)"},
 {"verse":"89:8","remark":"'o nosso tempo' heard as a schedule","outcome":"taken","decision":"saeculum8"},
 {"verse":"89:9b","remark":"point of the spider unclear","outcome":"refused","reason":"the Latin's crux; no gloss added"},
 {"verse":"89:10b","remark":"mansidão then castigados clash","outcome":"refused","reason":"the Latin's puzzle, not explained (D2)"},
 {"verse":"89:11","remark":"'vosso temor' could be God's own fear","outcome":"refused","reason":"timóre tuo is as open; 'por temor de vós' is an option"},
 {"verse":"89:12","remark":"second colon heard as a fragment","outcome":"refused","reason":"verbless in the Latin; reordered for the stylist"},
 {"verse":"89:15","remark":"'Alegramo-nos' heard present/exhortative","outcome":"refused","reason":"the form is past too; 89:14 sets the tense"},
 {"verse":"89:17","remark":"'sobre nós' with encaminhai puzzling","outcome":"refused","reason":"the Latin's dírige super nos"},
 {"verse":"89:13 / 89:7 / 89:10b","remark":"unknown words: aplacar, desfalecemos, sobreveio","outcome":"refused","reason":"desfalecer is the glossary's; sobreveio is supervénit's verb; aplacar has 'sede propício' as option"}]
d['audit']+= [
 {"step":"latinist","file":"critic/v1.latinist.json","note":"Reader: claude-opus-5-5, fresh context (run by the coordinator). 2 minor, no major: 89:8 taken; 89:2 refused for the settled formula.","outcomes":lat_out},
 {"step":"stylist","file":"critic/v1.stylist.json","note":"Reader: claude-opus-5-5, fresh context. 6 remarks in 5 verses, all order or a choice between faithful words; all taken. Best line 89:9, worst 89:14.","outcomes":sty_out},
 {"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"Reader: claude-opus-5-5, fresh context. Most readings listed are the Latin's own openness; one taken (89:8).","outcomes":amb_out},
 {"step":"revision","version":2,"note":"v2: 89:1 order (para nós vos tornastes refúgio); 89:8 a nossa vida; 89:9b meditados and 'são neles'; 89:10 Mas, se; 89:12 os de coração instruído; 89:14 De manhã fomos cheios. Draft 1 kept as prayed.v1.json."}]
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
