import json
p='research/psalterium/ps092/prayed.json'
d=json.load(open(p))
d['version']=2
d['status']='reviewed'
v=d['verses']
v['92:3b']="{elev3b} as suas ondas, * {avocibus} vozes das muitas águas."
D={x['id']:x for x in d['decisions']}

e=D['elev1']
e['refs']=["92:3a","92:3b"]
e['why']+=" v2: the stylist heard the verb-first colon as 'they raised up the rivers' and asked for the subject first; the ambiguity reader listed the same reading. A Latin ear takes *flúmina* as the subject without effort, so the misparse is the Portuguese order's, not the Latin's ambiguity; order is grammar (D2). Taken in all three colons, so the repetition stays exact: *Os rios elevaram … os rios elevaram … Os rios elevaram*."
e['options']=[
 {"label":"Os rios elevaram","forms":{"elev1":"Os rios elevaram","elev3b":"Os rios elevaram"},"note":"Ruling (v2): subject first, the anaphora kept in all three colons; the stylist's, and MS1932's order.","from":"stylist"},
 {"label":"Elevaram os rios","forms":{"elev1":"Elevaram os rios","elev3b":"Elevaram os rios"},"note":"Draft 1: the Latin's verb-first order; heard as 'they raised the rivers' by two readers.","from":"draft"}]
v['92:3a']="{elev1}, Senhor: * os rios elevaram a sua voz."

a=D['avocibus']
a['why']+=" v2: the Latinist (minor) held that *com* reduces *a* to accompaniment and closes what the Latin leaves open; he asked for *pelas*. Taken: Portuguese *por* spans cause, agent and means as *a* + ablative does, where *com* is only accompaniment — the ambiguity reader heard 'accompanied' first with *com*."
a['options']=[
 {"label":"pelas","forms":{"avocibus":"pelas"},"note":"Ruling (v2): the Latinist's; *por* is as open as *a*.","from":"latinist"},
 {"label":"com as","forms":{"avocibus":"com as"},"note":"Draft 1: DRB 'with', MS1932 *com*; accompaniment only.","from":"draft"},
 {"label":"ao som das","forms":{"avocibus":"ao som das"},"note":"Adds 'sound' beside 'voices'; a word the Latin lacks."}]

el=D['elationes']
el['why']+=" v2: the stylist (fails 'concrete', 'native') and the ambiguity reader both heard *elevações* as terrain, and the ambiguity reader listed it as unknown in this sense. Two readers, one fault: a wrong first hearing. Ruled for *os vagalhões*, L&S's own gloss for this verse ('high waves') — a concrete sea word, distinct from *ondas* (*fluctus*, 92:3b); the image of lifting survives in the size of the wave. The stylist's *as vagas* was weighed and refused: in Brazil *vagas* is heard first as vacancies, and it is a near-synonym of *ondas* that would blur *fluctus* and *elatiónes*."
el['options']=[
 {"label":"os vagalhões","forms":{"elationes":"os vagalhões"},"note":"Ruling (v2): L&S 'high waves', DRB 'surges'; concrete.","from":"DRB"},
 {"label":"as elevações","forms":{"elationes":"as elevações"},"note":"Draft 1, MS1932: the Latin's image of lifting; heard as terrain by two readers.","from":"draft"},
 {"label":"as vagas","forms":{"elationes":"as vagas"},"note":"The stylist's; *vagas* is heard first as vacancies, and blurs with *ondas*.","from":"stylist"},
 {"label":"a ressaca","forms":{"elationes":"a ressaca"},"note":"DM1962, from the Hebrew 'breakers'.","from":"DM1962"}]

dc=D['decor']
dc['why']+=" v1: the Latinist (minor) asked for *beleza* ('decor is comeliness, not radiance'). Refused under the row, as at 44:12 where the same minor was refused twice: *beleza* is *pulchritúdo*'s, and 95:6 / 103:1 need the two apart. The ambiguity reader and the stylist passed *esplendor* (the stylist called 92:1a the best line)."
for o in dc['options']:
    if o['label']=='beleza': o['note']+=" Also the v1 Latinist's fix."

lg=D['longitudo']
lg['why']+=" v1: the Latinist (minor) said *por longos dias* reduces an idiom of unending duration to a finite span and asked for *pela longura dos dias*. Refused: *longura* is archaic in Brazil (rule 5), and the row, set at 22:6b, is kept so the phrase reads alike in both psalms; the ambiguity reader heard 'for a long time, possibly forever', which is the Latin's own openness. His wording is an option."
lg['options'].insert(2,{"label":"pela longura dos dias","forms":{"longitudo":"pela longura dos dias"},"note":"The v1 Latinist's; *longura* archaic.","from":"latinist"})

cr=D['credibilia']
cr['why']+=" v1: the stylist found the colon prosaic and asked for *sobremaneira* and no article (*Vossos testemunhos*). Refused: *sobremaneira* was unknown to blind readers at 118:96 and 30:12 (the *nimis* row, D38 review), and the article before a possessive is a style rule (rule 5). The ambiguity reader heard *se tornaram* as implying they were once less credible — that is the Latin's *facta sunt* (ἐπιστώθησαν, 'were confirmed'); kept."
cr['options'].append({"label":"sobremaneira dignos de fé","forms":{"credibilia":"sobremaneira dignos de fé"},"note":"The stylist's; *sobremaneira* unknown to earlier blind readers.","from":"stylist"})

pa=D['parata']
pa['why']+=" v1: the stylist found the colon long and asked to drop the article (*Vosso trono*); refused, the article before possessives is a style rule (rule 5); *pronto* (option) is the way to shorten it. The ambiguity reader asked what *desde então* points to — the Latin's *ex tunc* is as unanchored; kept."

d['audit']+= [
 {"step":"latinist","file":"critic/v1.latinist.json","note":"claude-opus-5-5, fresh context. 3 minor, no major. 92:3b taken; 92:1a and 92:5 refused under glossary rows.",
  "outcomes":[
   {"verse":"92:1a","remark":"decor is beauty, not radiance: vestiu-se de beleza","outcome":"option","decision":"decor","reason":"glossary row decor → esplendor, beleza kept for pulchritúdo (95:6/103:1); the same minor refused twice at 44:12"},
   {"verse":"92:3b","remark":"'com' flattens a + ablative; pelas","outcome":"taken"},
   {"verse":"92:5","remark":"por longos dias finite; pela longura dos dias","outcome":"option","decision":"longitudo","reason":"longura archaic; row and 22:6b kept"}]},
 {"step":"stylist","file":"critic/v1.stylist.json","note":"claude-opus-5-5, fresh context. 5 remarks; best line 92:1a, worst 92:5. 3a/3b order taken; 4b taken in another word (vagalhões, not vagas); 92:2 and 92:5 refused.",
  "outcomes":[
   {"verse":"92:2","remark":"drop article: Vosso trono","outcome":"refused","reason":"article before possessives is rule 5"},
   {"verse":"92:3a","remark":"verb-first misheard as 'they raised the rivers'; Os rios elevaram","outcome":"taken"},
   {"verse":"92:3b","remark":"keep anaphora parallel: Os rios elevaram","outcome":"taken"},
   {"verse":"92:4b","remark":"elevações is terrain; as vagas","outcome":"option","decision":"elationes","reason":"the fault taken, but os vagalhões chosen: vagas heard as vacancies and blurs with ondas (fluctus)"},
   {"verse":"92:5","remark":"prosaic; sobremaneira, drop article","outcome":"option","decision":"credibilia","reason":"sobremaneira unknown to earlier blind readers; article is rule 5"}]},
 {"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"claude-opus-5-5, fresh context. 13 readings, 2 unknown words (cingiu; elevações in this sense). Acted on elevações and the 3a verb-first reading; the rest are the Latin's own openness.",
  "outcomes":[
   {"verse":"92:1a","remark":"e se cingiu: with strength or bare; cingiu unknown","outcome":"refused","reason":"the Latin's complement-less verb; cingir is the glossary's (17:33, 64:7)"},
   {"verse":"92:2","remark":"desde então unanchored; switch ele→vós abrupt","outcome":"refused","reason":"both are the Latin's (ex tunc; the turn to tu)"},
   {"verse":"92:3a","remark":"Elevaram os rios read as 'they raised the rivers'","outcome":"taken"},
   {"verse":"92:3b","remark":"com as vozes: accompaniment first","outcome":"taken"},
   {"verse":"92:4b","remark":"elevações heard as terrain; unknown in this sense","outcome":"taken"},
   {"verse":"92:5","remark":"se tornaram implies once less credible; convém as 'advisable'; por longos dias finite","outcome":"refused","reason":"facta sunt is the Latin's; convém is the row (64:2); longos dias the row (22:6b)"}]},
 {"step":"revision","version":2,"note":"v2: subject first in 92:3a/3b (anaphora kept in three colons); a vócibus → pelas; elatiónes → os vagalhões. Draft 1 kept as prayed.v1.json."}]
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
