"""Ps 135 draft 2 from draft 1 (prayed.v1.json) after the v1 readers."""
import json
d = json.load(open('prayed.v1.json'))
d['version'] = 2
dec = {x['id']: x for x in d['decisions']}

q = dec['qui']
q['why'] += (" v2: the stylist (v1) showed that written 'Aquele que' is a subject that never gets a verb, while the ear hears the lines "
             "continuing 'Dai graças ao Senhor…' — which is exactly the Greek's build (datives, τῷ ποιοῦντι…). With the crasis, 'Àquele que' "
             "makes each line the object of the thanks; the sound is unchanged, the page is now grammatical. The Latin's nominative 'Qui' is the "
             "relative's own case and cannot show the antecedent's; this is grammar (D2). 113:8 is not a litany after an imperative and keeps 'Aquele que'.")
q['options'].insert(0, {"label": "Àquele que", "forms": {"qui": "Àquele que"}, "note": "Ruling (v2): the stylist's; each line continues 'Dai graças ao', as the Greek datives do.", "from": "stylist"})
q['options'][1]['note'] = "Draft 1, as 113:8: a subject left without a verb on the page."

x = dec['excussit']
x['why'] += (" v2: the Latinist (minor) asked the singular — the plural changes the Latin's number. Taken, with the virtus row's singular 'o seu poder' "
             "rather than his 'a sua força', which is fortitúdo's word (17:2). The ambiguity reader had heard 'as suas forças' as the army; 'poder' "
             "leaves that sense less audible, as the Latin word itself does.")
opts = x['options']
x['options'] = [opts[1], opts[0], {"label": "sacudiu … a sua força", "forms": {"excussit": "sacudiu", "virtutem": "a sua força"}, "note": "The Latinist's fix; força is fortitúdo's word.", "from": "latinist"}] + opts[2:]
x['options'][0]['note'] = "Ruling (v2): the Latin's number, the virtus row's word; the Latinist's remark taken."
x['options'][1]['note'] = "Draft 1: D43's plural 'forças' (strength and troops); the Latinist refused the change of number."

e = dec['excelso']
e['why'] += (" v2: the stylist asked 'levantado' (bookish Latinism; the arm's image lost) and the ambiguity reader listed 'excelso' as unknown. "
             "Rule 5 keeps concrete images concrete, and the row was made for excélsus said of God (46:3), not of an arm. Local departure, "
             "recorded in the glossary row; 'levantado' is MS1932's word and keeps a paroxytone at the mediant.")
e['options'] = [e['options'][2], e['options'][1], e['options'][0]]
e['options'][0].update({"note": "Ruling (v2): the stylist's and MS1932's; the raised arm, concrete.", "from": "stylist"})
e['options'][2]['note'] = "Draft 1: the settled row (D43); unknown to the ambiguity reader, 'bookish' to the stylist."

p = dec['potestatem']
p['options'].append({"label": "para o domínio sobre o dia / a noite", "forms": {"potd": "para o domínio sobre o dia", "potn": "para o domínio sobre a noite"}, "note": "Stylist (v1): breaks the run of d-onsets. Refused: 'sobre' adds a preposition for a genitive the Latin has, and the ambiguity reader heard 'to rule the day' first as it stands.", "from": "stylist"})

d['verses']['135:23'] = "{quia} na nossa {humilitate} se lembrou de nós: * {refr}."
d['decisions'].append({
    "id": "quia", "refs": ["135:23"], "latin": "Quia in humilitáte nostra memor fuit nostri: * quóniam …", "kind": "word",
    "why": ("The verse opens 'Quia' and its refrain 'quóniam': two causal words in the Latin. Draft 1 said 'Porque … * porque', which the stylist heard as a "
            "stutter (his worst line). 'Pois' for 'quia' keeps the two words apart as the Latin does, and leaves the refrain untouched in all 27 verses. "
            "The glossary's default for quia is 'porque' and 'pois' was ruled where 'por que' questions follow (D42); here the collision is with the "
            "refrain's own 'porque'. The Vespers antiphon (135:1a + 135:23) reads 'Dai graças ao Senhor, pois na nossa humilhação se lembrou de nós'."),
    "options": [
        {"label": "Pois", "forms": {"quia": "Pois"}, "note": "Ruling (v2): the stylist's; quia and quóniam kept apart.", "from": "stylist"},
        {"label": "Porque", "forms": {"quia": "Porque"}, "note": "Draft 1; the glossary's default; 'porque … porque' heard as a stutter.", "from": "draft"}
    ]})
d['choices']['135:23'] = "memor esse + gen. → lembrar-se de (row). Proclisis 'se lembrou' after the adverbial. 'Pois' for quia: decision quia."
d['choices']['135:15'] += " virtútem → 'o seu poder' (v2, the Latinist)."
d['choices']['135:12'] += " 'levantado' (v2): decision excelso."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. One minor (135:15, number of virtútem); taken with the row's word. Overall: faithful, marks match.",
    "outcomes": [{"verse": "135:15", "remark": "virtútem singular; 'as suas forças' changes number", "outcome": "taken", "reason": "the row's singular 'o seu poder' in place of his 'a sua força' (fortitúdo's word)"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Four remarks; 3 taken, 1 kept as an option. Best line 135:6, worst 135:23.",
    "outcomes": [
        {"verse": "135:4 (and the nine other 'Qui' verses)", "remark": "'Aquele que' is a subject with no verb; 'Àquele que' continues the dative", "outcome": "taken", "decision": "qui"},
        {"verse": "135:8", "remark": "'domínio do dia' stumbles; 'domínio sobre o dia'", "outcome": "option", "decision": "potestatem", "reason": "adds a preposition for the Latin's genitive; the blind reader heard the sense at once"},
        {"verse": "135:12", "remark": "'excelso' bookish; 'levantado'", "outcome": "taken", "decision": "excelso"},
        {"verse": "135:23", "remark": "'Porque … porque' stutters; 'Pois' for quia", "outcome": "taken", "decision": "quia"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Every 'likely heard' reading is the Latin's sense, except 135:15 'sacudiu' (image unclear) and 135:25 'toda a carne' (biblical idiom). Unknown: luminares, excelso, Seon, amorreus, Og, Basã (names expected).",
    "outcomes": [
        {"verse": "135:12", "remark": "excelso unknown", "outcome": "taken", "decision": "excelso"},
        {"verse": "135:15", "remark": "'sacudiu Faraó' image unclear; 'forças' heard as army", "outcome": "refused", "reason": "'sacudiu' is the Latin's image (excútere, L&S 'throw off … into the sea') and 126:4's verb for the same Greek; 'forças' changed by the Latinist's remark"},
        {"verse": "135:25", "remark": "'toda a carne' may be heard as meat", "outcome": "refused", "reason": "the Latin's flesh, kept as at 64:3; 'alimento' beside it steers the hearing"},
        {"verse": "135:13", "remark": "'partiu' could be 'departed'", "outcome": "refused", "reason": "with a direct object and 'em partes' it is only 'split'; he heard it so"},
        {"verse": "135:7", "remark": "luminares unknown", "outcome": "refused", "reason": "the word of every Portuguese version, including the Liturgia das Horas; 'luzeiros' is rarer"},
        {"verse": "135:19", "remark": "'A Seon' — the 'a' may confuse", "outcome": "refused", "reason": "he heard the object of 'matou' first; the bare name would lose the case"}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 'Àquele que' in the ten Qui-verses (stylist); 135:15 'o seu poder' (Latinist); 135:12 'levantado' (stylist + ambiguity, local departure from the excélsus row); 135:23 'Pois' for quia (stylist). Draft 1 kept as prayed.v1.json."})
json.dump(d, open('prayed.json', 'w'), ensure_ascii=False, indent=2)
