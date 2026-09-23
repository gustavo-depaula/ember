import json
p='research/psalterium/ps099/prayed.json'; d=json.load(open(p))
d['version']=2
v=d['verses']
v['99:3b']="{populus} e as ovelhas da sua {pascua}: ‡ entrai com {confessione} {portas}, * com hinos {atria}: dai-lhe graças."
D={x['id']:x for x in d['decisions']}
pop=D['populus']
pop['why']+=" v2: the Latinist and the stylist both refused the supplied 'Somos' (minor) as closing the apposition-or-vocative question the Latin keeps open. Taken: the verbless phrase returns, with its articles (rule 5). At the head of the verse it may be heard either as '[we,] his people' continuing 99:3a or as the address to those told 'entrai' — the two readings the Latin allows. The Latinist's 'Povo seu' and the stylist's 'Seu povo e ovelhas' drop the articles; refused for rule 5."
pop['options']=[
 {"label":"O seu povo","forms":{"populus":"O seu povo"},"note":"Ruling (v2): the Latin's verbless nominative, both readings open.","from":"latinist"},
 {"label":"Somos o seu povo","forms":{"populus":"Somos o seu povo"},"note":"Draft 1: copula supplied (DRB, MS1932); refused by the Latinist and the stylist as closing the ambiguity.","from":"draft"},
 {"label":"Povo seu","forms":{"populus":"Povo seu"},"note":"Latinist's fix (with 'e ovelhas' it would drop the articles); refused, rule 5.","from":"latinist"},
 {"label":"Nós somos o seu povo","forms":{"populus":"Nós somos o seu povo"},"note":"MS1932.","from":"MS1932"}]
D['portas']['why']+=" v2: the stylist heard 'graças' at mediant and final as a chime and asked for the order 'entrai com ação de graças por suas portas, * com hinos por seus átrios'. Order is grammar (D2): taken, so the manner phrase comes first and the nouns close each colon; the Latin's root echo (confessióne / confitémini) still sounds, but no longer on both marks. His article-less 'por suas' is refused (rule 5): 'pelas suas portas … nos seus átrios' kept."
for o in D['portas']['options']:
    pass
D['portas']['options'][0]['note']="Ruling: each noun its natural preposition; the second member agrees with 95:8. v2: placed after the manner phrase (stylist's order)."
D['portas']['options'].append({"label":"(v1 order) pelas suas portas com ação de graças, * nos seus átrios com hinos","forms":{"portas":"pelas suas portas","atria":"nos seus átrios"},"note":"Draft 1, the Latin's order; puts 'graças' at the mediant and at the final. The slots are the same; the order lives in the verse string of prayed.v1.json.","from":"draft"})
D['confessione']['why']+=" v2: after the stylist's reorder the echo stays inside the verse but off the mediant."
D['usque']['why']+=" v1 Latinist (minor) asked 'e até geração e geração a sua verdade' for 'usque in'. Refused: 'até geração e geração' is not a Portuguese phrase, and the formula row (18 places) is 'de geração em geração'; kept as an option."
D['usque']['options'].append({"label":"até geração e geração","forms":{"usque":"até geração e geração"},"note":"Latinist v1 (minor): the letter of 'usque in … et …'; not idiomatic.","from":"latinist"})
D['servite']['why']+=" v1: the Latinist (minor) and the stylist both asked for 'servi ao Senhor', as for 2:11. Refused under settled D18; the option stands for Gustavo. The ambiguity reader noted 'sede' may flash as the noun 'thirst' for a moment before the imperative is heard — the vós form's known cost."
d['decisions'].append({"id":"pascua","refs":["99:3b"],"latin":"oves páscuæ ejus","kind":"glossary","why":"The páscua row: 'pastagem', applied at 73:1, 78:13 and 94:7 ('o povo da sua pastagem', the Invitatory). The stylist (v1) found 'pastagem' agricultural and asked 'pasto', the traditional word. Refused for the row: 94:7, 73:1 and 78:13 have the same phrase and the reader should meet it identically; kept as an option.","options":[
 {"label":"pastagem","forms":{"pascua":"pastagem"},"note":"Ruling: the row, as 73:1, 78:13, 94:7.","from":"glossary"},
 {"label":"pasto","forms":{"pascua":"pasto"},"note":"Stylist v1; MS1932 'do seu pasto'. Would need 73:1, 78:13, 94:7 to follow.","from":"stylist"}]})
d['choices']['99:3b']="átria → átrios (row; unknown to the v1 ambiguity reader again, kept as the Latin's word). hymnus → hino. 'dai-lhe graças': D5 with the dative pronoun; 'dai' ≠ 'dei'. v2 order after the stylist."
d['choices']['99:4b']+=" The ambiguity reader heard 'suave' as kind/gentle, with a risk of the colloquial 'chill'; the suávis row keeps it (33:9, 85:5). 'verdade' heard as truth; the véritas row."
d['audit'] += [
 {"step":"latinist","file":"critic/v1.latinist.json","note":"claude-opus-5-5, fresh context, with latin.json. 3 minor, no major: 99:3b taken; 99:2a refused (D18); 99:4b refused (not Portuguese), option.","outcomes":[
  {"verse":"99:2a","remark":"'sede servos' turns the imperative into a status; asks 'servi ao Senhor'","outcome":"refused","decision":"servite","reason":"D18 is settled: the bare 'servi' is also 'I served'; kept as option 2 for Gustavo."},
  {"verse":"99:3b","remark":"supplied 'Somos' closes the apposition/vocative ambiguity","outcome":"taken","decision":"populus"},
  {"verse":"99:4b","remark":"'usque in' flattened; asks 'até geração e geração'","outcome":"refused","decision":"usque","reason":"not a Portuguese phrase; the formula row 'de geração em geração'; option."}]},
 {"step":"stylist","file":"critic/v1.stylist.json","note":"claude-opus-5-5, fresh context. Worst line 99:3b, best 99:4b. 4 remarks: 2 taken, 2 refused as options.","outcomes":[
  {"verse":"99:2a","remark":"'sede servos' heavy; asks 'servi ao Senhor'","outcome":"option","decision":"servite","reason":"D18 (settled)."},
  {"verse":"99:3b","remark":"'Somos' decides the construction","outcome":"taken","decision":"populus"},
  {"verse":"99:3b","remark":"'pastagem' agricultural; asks 'pasto'","outcome":"option","decision":"pascua","reason":"the páscua row, identical at 73:1, 78:13, 94:7."},
  {"verse":"99:3b","remark":"'graças' chimes at mediant and final; reorder","outcome":"taken","decision":"portas","reason":"order only (D2); his article-less 'por suas' refused for rule 5."}]},
 {"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"claude-opus-5-5, fresh context. Every likely hearing is the intended one; unknown words: átrios, exultação (both rows, kept).","outcomes":[
  {"verse":"99:2a","remark":"'sede' may flash as 'thirst'","outcome":"refused","decision":"servite","reason":"likely heard as the imperative; D18."},
  {"verse":"99:3a","remark":"'e não nós mesmos' takes a moment to resolve; heard rightly","outcome":"refused","decision":"ipsefecit","reason":"the Latin's ellipsis, heard as intended."},
  {"verse":"99:3b","remark":"'átrios' unknown","outcome":"refused","reason":"the átrium row keeps the Latin's word."},
  {"verse":"99:2b","remark":"'exultação' unknown","outcome":"refused","reason":"the exsultátio row keeps it."},
  {"verse":"99:4b","remark":"'suave' may be heard colloquially","outcome":"refused","decision":"suavis","reason":"likely heard as gentle/kind; the suávis row."},
  {"verse":"99:4b","remark":"'verdade' truth or faithfulness","outcome":"refused","reason":"the Latin's word; véritas row."}]},
 {"step":"revision","version":2,"note":"v2: 99:3b only — the verbless 'O seu povo' (Latinist + stylist) and the stylist's order that moves 'graças' off the mediant. Draft 1 kept as prayed.v1.json."}]
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
