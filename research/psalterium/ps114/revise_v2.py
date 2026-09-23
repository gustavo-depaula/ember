import json
p='research/psalterium/ps114/prayed.json'
d=json.load(open(p,encoding='utf-8'))
d['version']=2
d['status']='reviewed'
v=d['verses']
v['114:2']="Porque inclinou para mim o seu ouvido: * e {invocabo} {indiebus}."
dec={x['id']:x for x in d['decisions']}
# 4b comma removed
m=dec['misericors']
m['options'][0]['forms']['misericors']="o Senhor é misericordioso e justo"
m['options'][0]['label']="o Senhor é misericordioso e justo"
m['options'][0]['note']="v2 — the stylist's punctuation (no pause between the two adjectives); MS1932 has the same"
m['options'][0]['from']="stylist"
m['options'].append({"label":"o Senhor é misericordioso, e justo","forms":{"misericors":"o Senhor é misericordioso, e justo"},"note":"v1 — the comma kept *e justo* as an afterthought; the stylist heard reciters halt on it","from":"draft"})
m['why']+=" v2: the comma after *misericordioso* removed at the stylist's request — punctuation only (D2)."
# 114:2 order
ib=dec['indiebus']
ib['why']+=" v2: the time phrase moved after the verb at the stylist's request (order only, D2), so the colon no longer ends on a bare objectless verb; the verb before its adverbial also reads the absolute *invocarei* more easily."
ib['options'].append({"label":"nos meus dias (before the verb)","forms":{"indiebus":"nos meus dias"},"note":"v1 order: *e nos meus dias invocarei* — select together with the verses' v1 draft (prayed.v1.json)","from":"draft"})
# 114:7 fez o bem
d['decisions'].append({
 "id":"benefecit","refs":["114:7"],"latin":"Dóminus benefécit tibi","kind":"glossary",
 "why":"The *benefácere* row (56:3 *ao Deus que me fez bem*; 48:19 *quando lhe fizeres bem*) gives *fazer bem*; this verse is named in the row. The stylist hears *te fez bem* as therapeutic ('was good for you', as a walk *faz bem*) and asks for the article. The ambiguity reader heard 'has been good to you' first, 'made you well' second. Ruled: the row, so the three places stay one wording; *te fez o bem* is proposed in the glossary as the row's alternative, to be taken in all three at once if Gustavo prefers it.",
 "options":[
  {"label":"te fez bem","forms":{"benefecit":"te fez bem"},"note":"the row; = 56:3","from":"glossary"},
  {"label":"te fez o bem","forms":{"benefecit":"te fez o bem"},"note":"the stylist's; the row already lists *me fez o bem* as an option","from":"stylist"}
 ]})
v['114:7']="Volta, {anima}, ao teu repouso: * porque o Senhor {benefecit}."
# 114:8 option
d['decisions'].append({
 "id":"lacrimis","refs":["114:8"],"latin":"óculos meos a lácrimis, * pedes meos a lapsu",
 "kind":"order",
 "why":"The stylist marks the proparoxytone *lágrimas* at the mediant as the psalm's worst line and asks to front the complements. Refused: the Latin's own mediant is the proparoxytone *lácrimis*; the fronting is inversion for its own sake (rule 5); and the second colon is 55:13's *os meus pés da queda* word for word, which the inversion would break.",
 "options":[
  {"label":"os meus olhos das lágrimas, * os meus pés da queda","forms":{"lacr":"os meus olhos das lágrimas, * os meus pés da queda"},"note":"v1; the Latin's order; = 55:13 in the last colon","from":"draft"},
  {"label":"das lágrimas os meus olhos, * da queda os meus pés","forms":{"lacr":"das lágrimas os meus olhos, * da queda os meus pés"},"note":"the stylist's; oxytone and paroxytone cadences","from":"stylist"}
 ]})
v['114:8']="Porque arrancou a minha alma da morte: ‡ {lacr}."
d['audit'].append({"step":"latinist","file":"critic/v1.latinist.json","note":"claude-opus-5-5, fresh context, with latin.json. No remarks: tenses, the Septuagintal readings and the permitted liberties (copula, finite *guarda*, named *ele*) all passed.","outcomes":[]})
d['audit'].append({"step":"stylist","file":"critic/v1.stylist.json","note":"claude-opus-5-5, fresh context, with latin.json. Four remarks: two taken (order and punctuation only), two kept as options. Worst line 114:8, best 114:3a.","outcomes":[
 {"verse":"114:8","remark":"proparoxytone 'lágrimas' at the mediant; front the complements","outcome":"option","decision":"lacrimis","reason":"The Latin's mediant is the proparoxytone *lácrimis*; the inversion is for its own sake and would break 55:13's *os meus pés da queda*."},
 {"verse":"114:7","remark":"'te fez bem' sounds therapeutic; 'te fez o bem'","outcome":"option","decision":"benefecit","reason":"The *benefácere* row (56:3, 48:19) says *fazer bem*; changing one place would split the row. Proposed in the glossary as the row's alternative for all three places."},
 {"verse":"114:4b","remark":"no comma before 'e justo'","outcome":"taken","reason":"Punctuation only (D2)."},
 {"verse":"114:2","remark":"'e invocarei nos meus dias' instead of ending on the bare verb","outcome":"taken","reason":"Order only (D2); the Latin's words and the absolute verb are kept."}]})
d['audit'].append({"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"claude-opus-5-5, fresh context, prayed.vos.json only. Twelve readings, no unknown words. All are the Latin's own openness or already met by the rows: the objectless *Amei* (decision `dilexi`), the objectless *invocarei*, *inferno* heard as hell of the damned (the open row, D22; in the Office of the Dead the overtone is read on purpose), *pequeninos* heard as the lowly as well as children (the row), *fui humilhado* shamed or brought low (the Latin's), *repouso* peace or the grave, *queda* with a moral overtone (D44 foresaw it), *região dos vivos* this life or heaven (the Latin's, the Office of the Dead reads both). *Agradarei* possibly misheard as *agradecerei*: held (D44, settled). Nothing changed.","outcomes":[
 {"verse":"114:9","remark":"'Agradarei' may be misheard as 'agradecerei'","outcome":"refused","reason":"*placére → agradar* is settled (D44) and names this verse; a slip of the ear, not a second sense of the text."},
 {"verse":"114:7","remark":"'te fez bem' also 'made you well'","outcome":"option","decision":"benefecit","reason":"Heard rightly first; see the stylist's remark on the same words."}]})
d['audit'].append({"step":"revision","version":2,"note":"v2: 114:2 *e invocarei nos meus dias* (order); 114:4b comma dropped; two new decisions recording refused stylist proposals (`benefecit`, `lacrimis`). Draft 1 kept as prayed.v1.json."})
open(p,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
