import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
D={x['id']:x for x in d['decisions']}
d['version']=3; d['status']='reviewed'
pn=D['pronihilo']
pn['options'].insert(0,{"label":"coisas que são tidas por nada serão os seus anos","forms":{"pronihilo":"coisas que são tidas por nada serão os seus anos"},"note":"v3 — the v2 Latinist (minor) asked for the finite passive of habéntur; the verb restored, 'coisas' kept for the neuter quæ","from":"latinist"})
pn['options'].append({"label":"os que são tidos por nada, tais serão os seus anos","forms":{"pronihilo":"os que são tidos por nada, tais serão os seus anos"},"note":"the v2 Latinist's line; 'os que' is masculine, heard as persons, where quæ is neuter","from":"latinist"})
pn['why']+=" v3: the finite verb taken from the v2 Latinist; his masculine 'os que' refused (quæ is neuter: things, not people)."
dp=D['deprecabilis']
dp['options'].insert(0,{"label":"deixai-vos aplacar para com os vossos servos","forms":{"deprecabilis":"deixai-vos aplacar para com os vossos servos"},"note":"v3 — the v2 Latinist (minor): super is 'toward', 'em favor de' leans interpretive","from":"latinist"})
dp['why']+=" v3: super → 'para com', taken from the v2 Latinist; 'em favor dos' (DRB) kept as an option."
sc=D['saeculum8']
sc['why']+=" v2 Latinist (minor) asked to return to 'o nosso tempo' and 'iluminação': the two runs contradict each other on sǽculum (v1 asked 'a nossa vida'), and the ambiguity reader heard 'tempo' as a schedule — 'vida' held. 'iluminação' refused under the illuminátio row (26:1, 43:4b: heard as lighting)."
sc['options'].append({"label":"o nosso tempo na iluminação","forms":{"saeculum8":"o nosso tempo na iluminação"},"note":"the v2 Latinist's fix (renders 'o nosso tempo na iluminação à luz …' — select only with the verse edited); iluminação refused by the row","from":"latinist"})
D['potentatibus']['why']+=" The v2 Latinist (minor) asked 'se nos fortes' (DRB): held — potentátus is power, not persons (L&S; the persons sense is late); 'nos fortes' is option 1."
d['audit'].append({"step":"latinist","file":"critic/v2.latinist.json","note":"Reader: claude-opus-5-5, fresh context, with latin.json. Gate: no major; four minors — two taken (89:5 finite verb, 89:13 para com), two held with options (89:8, 89:10).","outcomes":[
 {"verse":"89:5","remark":"quæ pro níhilo habéntur: keep the finite passive","outcome":"taken","decision":"pronihilo"},
 {"verse":"89:8","remark":"sǽculum → tempo, illuminátio → iluminação","outcome":"option","decision":"saeculum8","reason":"contradicts the v1 Latinist on sǽculum; 'tempo' misheard by the ambiguity reader; iluminação refused by the illuminátio row"},
 {"verse":"89:10","remark":"in potentátibus → nos fortes","outcome":"option","decision":"potentatibus","reason":"potentátus is power, not persons"},
 {"verse":"89:13","remark":"super → para com, not em favor de","outcome":"taken","decision":"deprecabilis"}]})
d['audit'].append({"step":"revision","version":3,"note":"v3: the two Latinist minors taken (89:5, 89:13). Small wording changes after a clean gate; not re-read. Draft 2 kept as prayed.v2.json."})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
