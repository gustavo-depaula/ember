"""Ps 123 draft 2 from draft 1 (prayed.v1.json) after the v1 readers."""
import json

d = json.load(open('prayed.v1.json', encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['123:2b'] = "Quando os homens {exsurgerent} contra nós, * {forte} nos teriam {deglutissent} vivos:"

def dec(i):
    return next(x for x in d['decisions'] if x['id'] == i)

# aspect of the two cum-clauses (latinist), one decision, two slots
x = dec('irasceretur')
x['refs'] = ['123:2b', '123:3b']
x['latin'] = 'Cum exsúrgerent … Cum irascerétur furor eórum in nos'
x['why'] += " The two cum-clauses are built alike (imperfect subjunctives); draft 1 made both punctual ('se levantaram', 'se irou'). The v1 Latinist (minor) asked the durative for irascerétur; the two are kept parallel, so 2b moves with it."
x['options'] = [
    {"label": "se levantavam … se irava", "forms": {"exsurgerent": "se levantavam", "irasceretur": "se irava"}, "note": "Draft 2, from the Latinist: the imperfect, a rage still going on when the flood would have closed over us; MS1932 has 'se levantavam' in 2b. Both Latin words (furor, irásci) kept in the glossary's forms.", "from": "latinist"},
    {"label": "se levantaram … se irou", "forms": {"exsurgerent": "se levantaram", "irasceretur": "se irou"}, "note": "Draft 1. The events as single outbursts; equally grammatical.", "from": "draft"},
    {"label": "se levantavam … se inflamava", "forms": {"exsurgerent": "se levantavam", "irasceretur": "se inflamava"}, "note": "DRB's image ('was enkindled'); natural Portuguese, and would answer the ambiguity reader, who listed 'se irou' as a word a churchgoer may not know. It is an image the Latin does not have.", "from": "DRB"},
    {"label": "se levantavam … se enfurecia", "forms": {"exsurgerent": "se levantavam", "irasceretur": "se enfurecia"}, "note": "Plain; but 'o furor se enfurecia' makes a jingle of one root where the Latin has two.", "from": "draft"},
]

x = dec('absorbuisset')
x['why'] += " In draft 1 it was 'engolido', like deglutíssent in 123:2b. The v1 Latinist (minor) and the v1 stylist both objected: the two verses then end on the same word, an echo the Latin does not have, and the change from mouth to flood is lost. By D15's test they are right here: the Greek has two verbs in these two verses (κατέπιον / κατεπόντισεν), so the Latin's two stay two."
x['options'] = [
    {"label": "tragado", "forms": {"absorbuisset": "tragado"}, "note": "Draft 2, the stylist's word: plain and concrete, what water does ('tragado pelas águas'). A local departure from the absorbére row (engolir), made because deglutíre stands beside it; the row's worry about 'traga' (also trazer's subjunctive) does not arise with the participle.", "from": "stylist"},
    {"label": "absorvido", "forms": {"absorbuisset": "absorvido"}, "note": "The Latinist's fix: the cognate. Heard in Brazil of sponges and paper, not of a flood.", "from": "latinist"},
    {"label": "engolido", "forms": {"absorbuisset": "engolido"}, "note": "Draft 1, the absorbére row's verb; merges the two verbs of 2b and 3b.", "from": "glossary"},
    {"label": "submergido", "forms": {"absorbuisset": "submergido"}, "note": "The Greek's sense; but submergir is demérgere's verb (68:3b, 68:16), and it is not the Latin's image.", "from": "draft"},
]
x = dec('deglutissent')
x['options'] = [o for o in x['options'] if o['label'] != 'tragado']
x['options'][0]['note'] = "Draft, kept. The psalter's verb for deglutíre (105:17 'engoliu'); 'engolir vivo' is idiom. Since draft 2 the next verse has 'tragado' for absorbére, so the Latin's two verbs are two again."
x['why'] = "Two Latin verbs of swallowing in two verses: deglutíre (κατέπιον) here, absorbére (κατεπόντισεν, 'sank, drowned') in 123:3b. deglutíre keeps its psalter verb (105:17); absorbére takes 'tragar' in 123:3b (see 'absorbuisset')."

x = dec('pertransivit')
x['why'] += " The v1 Latinist (minor) asked 'atravessar': 'passar' can be heard as going past. The ambiguity reader heard 'passou a torrente' as 'crossed safely' — which is the Latin's sense: the soul came through the torrent; the unbearable water is what it would have met without the Lord."
atr = next(o for o in x['options'] if o['label'].startswith('atravessou'))
pas = next(o for o in x['options'] if o['label'].startswith('passou'))
atr['note'] = "Draft 2, from the Latinist (and the pertransíre row's own option): 'went right through', the per- of the Latin. A new object for the row (a stream), so no clash with 104:13 'passaram de nação em nação'."
atr['from'] = 'latinist'
pas['note'] = "Draft 1, the row's verb and MS1932's; can be heard as 'went past'."
x['options'] = [atr, pas]

x = dec('forte')
x['why'] += " The v1 stylist flagged 'talvez' + conditional as slightly off to a trained ear but proposed no change (the subjunctive would change the sense); the ambiguity reader heard 'talvez' as doubt, which is what forte and fórsitan say."

d['choices']['123:2b'] = "The verse opens with a capital, as the Latin's 'Cum' does (draft 1 had a lower case; the stylist pointed at the mismatch with 123:3b). exsúrgere in → levantar-se contra (glossary row exsúrgere). The imperfect subjunctive after 'cum' → 'se levantavam', parallel with 'se irava' in 123:3b (decision 'irasceretur'). 'vivos' at the end: the Latin puts it before the verb, Portuguese idiom after ('engolir vivo'); order yields (D2). Length flags accepted: see the checks steps."
d['choices']['123:3b'] = "'aqua' singular → 'a água'; the flood comes without introduction, as in the Latin (the ambiguity reader noticed it; nothing is added). The two apodoses ('talvez nos teriam engolido vivos' / 'talvez a água nos teria tragado') are built alike, with two verbs for the Latin's two (draft 2)."
d['choices']['123:5'] += " The stylist (v1) asked to drop the articles before 'nossa alma' to shorten the long second colon: refused, rule 5 keeps the article before possessives; the Latin colon is as long (20 syllables by checks.py)."
d['choices']['123:6'] += " The ambiguity reader could hear 'presa aos dentes' as 'caught in their teeth' as well as 'prey'; both are the image, and the likely hearing was prey. Kept."
d['status'] = 'draft'
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "Draft 1, claude-opus-5-5 in a fresh context, with latin.json. Three minors, no major; all taken (two verbs of swallowing; the aspect of irascerétur; atravessar).",
     "outcomes": [
        {"verse": "123:3b", "remark": "deglutíssent and absorbuísset both 'engolido'; the Latin keeps two verbs → 'absorvido'", "outcome": "taken", "decision": "absorbuisset", "reason": "the distinction taken, with the stylist's 'tragado' rather than 'absorvido' (a sponge's word); 'absorvido' kept as an option"},
        {"verse": "123:3b", "remark": "irascerétur durative → 'se irava'", "outcome": "taken", "decision": "irasceretur", "reason": "taken, and 123:2b 'se levantavam' moved with it to keep the two cum-clauses parallel"},
        {"verse": "123:5", "remark": "pertransíre → 'atravessar', not 'passar'", "outcome": "taken", "decision": "pertransivit"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "Draft 1, claude-opus-5-5 in a fresh context, with latin.json. Worst line 123:5, best 123:8. Five remarks: two taken, two were 'keep' notes, one refused.",
     "outcomes": [
        {"verse": "123:2b", "remark": "lower-case 'quando' against the Latin's 'Cum' and 123:3b", "outcome": "taken"},
        {"verse": "123:2b", "remark": "'talvez' + conditional slightly off; keep, flagged only", "outcome": "refused", "decision": "forte", "reason": "no change proposed; the subjunctive would make the counterfactual a real possibility"},
        {"verse": "123:3b", "remark": "'engolido' twice → 'tragado' for absorbuísset", "outcome": "taken", "decision": "absorbuisset"},
        {"verse": "123:3b", "remark": "'se irou' stiff but keep", "outcome": "refused", "decision": "irasceretur", "reason": "the stylist proposed no change; the verb became 'se irava' on the Latinist's remark, the word kept"},
        {"verse": "123:5", "remark": "drop the articles: 'Nossa alma passou … talvez nossa alma'", "outcome": "refused", "reason": "rule 5 keeps the article before possessives; the Latin colon is as long; the vowel run is eased by 'atravessou / atravessado' in draft 2"}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "Draft 1, Portuguese only, claude-opus-5-5 in a fresh context. Sixteen items, nearly all the Latin's own openness heard rightly (the hanging conditional, 'talvez' as doubt, the unintroduced water, whose teeth). Unknown words: 'se irou', 'furor', 'torrente' — glossary words, kept ('se inflamava' now an option in 'irasceretur').",
     "outcomes": [
        {"verse": "123:1", "remark": "the conditional hangs; could be heard as saying the Lord is absent", "outcome": "refused", "reason": "the Latin's own suspension across two verses; the apodosis follows in 2b"},
        {"verse": "123:2b", "remark": "'talvez' heard as doubt", "outcome": "refused", "decision": "forte", "reason": "forte / fórsitan mean 'perhaps'; 'certamente' (MS1932) is an option"},
        {"verse": "123:3b", "remark": "'a água' comes unexplained", "outcome": "refused", "reason": "so in the Latin; nothing is added"},
        {"verse": "123:5", "remark": "'passou a torrente' heard as crossed safely, clashing with the next colon", "outcome": "taken", "decision": "pertransivit", "reason": "'atravessou' (with the Latinist); 'crossed safely' is the Latin's sense, the second colon is the unreal alternative"},
        {"verse": "123:5", "remark": "'água insuportável' an odd collocation", "outcome": "refused", "decision": "intolerabilem", "reason": "the Latin's adjective in its plainest Portuguese form; 'intolerável', 'irresistível' remain options"},
        {"verse": "123:6", "remark": "'presa aos dentes' could be 'caught in the teeth'", "outcome": "refused", "decision": "captionem", "reason": "likely heard as prey; both hearings carry the image"},
        {"verse": "123:3b", "remark": "unknown: 'se irou', 'furor'", "outcome": "option", "decision": "irasceretur", "reason": "glossary words (irásci, furor) kept; 'se inflamava' offered"},
        {"verse": "123:5", "remark": "unknown: 'torrente'", "outcome": "refused", "reason": "glossary word (torrens), kept as in 109:7"}]},
    {"step": "revision", "version": 2, "note": "v2: 123:2b capital 'Quando' and 'se levantavam'; 123:3b 'se irava', 'tragado'; 123:5 'atravessou / atravessado'. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the v1 readers read)."},
]
json.dump(d, open('prayed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
