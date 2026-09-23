"""Ps 112 draft 2 — after the v1 readers (claude-opus-5-5, fresh context)."""
import json
p = 'research/psalterium/ps112/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['112:7'] = "{suscitans} da terra o {inops}, * e {stercore} {erigens} o pobre:"
V['112:9'] = "{qui9} {indomo} a estéril, * {matrem}."
dec = {x['id']: x for x in d['decisions']}

# 112:5 humilia — Latinist minor + stylist + ambiguity reader: the plural noun.
h = dec['humilia']
old = h['options']
h['options'] = [
    {"label": "olha para as coisas humildes", "forms": {"humilia": "olha para as coisas humildes"},
     "note": "Ruling in v2: the Latinist (minor: the neuter's plural lost), the stylist (hiatus *o-que-é-hu*, abstract) and the ambiguity reader (heard *o que é humilde* as a humble person) all pointed here. DRB 'the low things'.", "from": "latinist"},
    {"label": "olha para o que é humilde", "forms": {"humilia": "olha para o que é humilde"},
     "note": "Draft 1: the neuter as a clause; heard as a person, and loses the plural.", "from": "draft"},
    {"label": "olha as coisas humildes", "forms": {"humilia": "olha as coisas humildes"},
     "note": "The stylist's: *olhar* without *para*; the finished psalms say *olhar para* for *réspicere* (103:32, 30:8, 32:14).", "from": "stylist"},
    old[2],
]
h['why'] += " **v2:** the plural noun *as coisas humildes* taken from the Latinist and the stylist; *o que é humilde* was heard as a person by the ambiguity reader. The attachment of *no céu e na terra* stays open, as the Latin's."

# 112:7 suscitans — finite verbs (stylist), Latin order in 7b (stylist).
s = dec['suscitans']
s['options'] = [
    {"label": "Ele levanta … ergue", "forms": {"suscitans": "Ele levanta", "erigens": "ergue"},
     "note": "Ruling in v2: the stylist (worst line: 'dangling gerunds … read like a translation') and the ambiguity reader (heard it 'broken off'). Finite verbs are grammar (D2); the subject named is the Lord of 112:5. DM1962 and the CNBB make the same move.", "from": "stylist"},
    {"label": "Levantando … erguendo", "forms": {"suscitans": "Levantando", "erigens": "erguendo"},
     "note": "Draft 1: the Latin's participles as gerunds (as 17:51); the Latinist praised it; the two other readers heard a sentence without a verb.", "from": "draft"},
    {"label": "Suscitando … erguendo", "forms": {"suscitans": "Suscitando", "erigens": "erguendo"},
     "note": "The cognate; heard as 'provoking'.", "from": "draft"},
]
s['why'] += " **v2:** finite verbs taken (see option 0); 7b now follows the Latin's order *de stércore érigens* → *e do esterco ergue* (the stylist's)."

# 112:7 inops — new decision recording the D38 row against the stylist.
d['decisions'].insert(d['decisions'].index(dec['stercore']), {
    "id": "inops", "refs": ["112:7"], "latin": "ínopem", "kind": "glossary",
    "why": "D38 settles *inops → carente*. The stylist heard *carente* as social-work or emotional ('uma pessoa carente') and asked *necessitado*; the ambiguity reader named the same second sense (it heard 'the needy person' first). This is the fault the row already records at 85:1 and 87:9. Kept under D38 — *necessitado* is reserved for *egénus*, and *inops* is the row's to change, not this psalm's; the evidence is added to the row for the coordinator.",
    "options": [
        {"label": "carente", "forms": {"inops": "carente"}, "note": "Ruling; D38.", "from": "glossary"},
        {"label": "necessitado", "forms": {"inops": "necessitado"}, "note": "The stylist's; *egénus*'s reserved word (D38 row).", "from": "stylist"},
        {"label": "desvalido", "forms": {"inops": "desvalido"}, "note": "MS1932 *o desvalido*; D38's named option (one reader did not know it).", "from": "MS1932"},
    ]})

# 112:8 — stylist's *assentar* refused, recorded as a decision.
d['decisions'].insert(d['decisions'].index(dec['qui9']), {
    "id": "collocet", "refs": ["112:8"], "latin": "Ut cóllocet eum", "kind": "word",
    "why": "*Collocáre* is 'to place, station, set, lodge' (L&S); the Greek καθίσαι and the Hebrew are 'to seat', which is where the stylist's *assentar* (and the CNBB's *assentar-se*) comes from. Rule 1: the Latin's verb, *colocar* (the row, 22:1; MS1932 *para o colocar*). The stylist found *colocá-lo* flat and clipped; the proclitic *para o colocar* (MS1932) is the other Brazilian-possible order and is kept as option.",
    "options": [
        {"label": "Para colocá-lo", "forms": {"collocet": "Para colocá-lo"}, "note": "Ruling; the everyday Brazilian enclisis after an infinitive.", "from": "draft"},
        {"label": "Para o colocar", "forms": {"collocet": "Para o colocar"}, "note": "MS1932; proclitic, ends the phrase on the verb's stress.", "from": "MS1932"},
        {"label": "Para o assentar", "forms": {"collocet": "Para o assentar"}, "note": "The stylist's; the Greek's and the Hebrew's 'seat', not *collocáre*. Refused (rule 1).", "from": "stylist"},
    ]})
V['112:8'] = "{collocet} com os príncipes, * com os príncipes do seu povo."

# 112:9 — main verb (stylist), 67:6b's order.
q = dec['qui9']
q['options'] = [
    {"label": "Ele faz habitar … a estéril", "forms": {"qui9": "Ele faz habitar"},
     "note": "Ruling in v2: the stylist heard *Ele, que …* wait for a main verb that never comes. A main verb (grammar, D2), matching 112:7 *Ele levanta*; the object after *numa casa*, as 67:6b *faz habitar numa casa os de um só costume*, which also sets *a estéril* beside its apposition *alegre mãe de filhos* across the asterisk.", "from": "stylist"},
    {"label": "Ele, que faz habitar", "forms": {"qui9": "Ele, que faz habitar"}, "note": "Draft 1 (the relative kept, as 103:32); heard as unfinished.", "from": "draft"},
    {"label": "Que faz habitar", "forms": {"qui9": "Que faz habitar"}, "note": "The bare relative, as the Latin.", "from": "draft"},
]
q['why'] += " **v2:** the relative becomes a main verb; see option 0. The stylist's own order (*Ele faz a estéril habitar numa casa*) was weighed: it separates *faz habitar*, the formula of 28:10 and 67:6b."

# 112:4 — stylist's reorder refused, as option on a new small decision.
V['112:4'] = "{excelsus}, * {gloria4}."
d['decisions'].insert(d['decisions'].index(dec['quis']), {
    "id": "gloria4", "refs": ["112:4"], "latin": "et super cælos glória ejus", "kind": "order",
    "why": "The stylist heard the verse trail off on *glória* and asked *e a sua glória, sobre os céus*. Refused: the Latin ends on *glória ejus*; the build is 56:6's refrain (*e por toda a terra a vossa glória*), where the glory ends the verse too; and *glória* is paroxytone for the tone (gló-ria). Kept as option.",
    "options": [
        {"label": "e sobre os céus a sua glória", "forms": {"gloria4": "e sobre os céus a sua glória"}, "note": "Ruling; the Latin's order; as 56:6.", "from": "draft"},
        {"label": "e a sua glória, sobre os céus", "forms": {"gloria4": "e a sua glória, sobre os céus"}, "note": "The stylist's; ends on an oxytone.", "from": "stylist"},
    ]})

d['choices']['112:4'] = d['choices']['112:4'] + " The ambiguity reader listed *Excelso* as unknown — D43's known cost (the Ps 46 reader too); kept."
d['choices']['112:7'] = "*pauper → pobre*; *inops → carente* (decision `inops`). The ambiguity reader listed *esterco* as unknown; kept — the concrete image (rule 5), and the alternatives are rarer (*monturo*) or change the thing (*lixo*)."
d['choices']['112:1'] += " The ambiguity reader heard *meninos* as young children and said an adult congregation may not feel addressed: that is the cost of decision `pueri`, flagged for Gustavo."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, read latin.json. One minor (112:5 *humília*'s plural); taken. Praised the gerunds and the open attachment of *in cælo et in terra*.",
    "outcomes": [{"verse": "112:5", "remark": "o que é humilde shifts the neuter plural", "outcome": "taken"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, read latin.json. Best line 112:2, worst 112:7. Five remarks: three taken (112:5, 112:7 finite verbs and order, 112:9 main verb), two refused as options (112:4 order; 112:8 *assentar*), and one word refused under D38 (*carente*).",
    "outcomes": [
        {"verse": "112:4", "remark": "ends on glória, trails; reorder", "outcome": "option", "decision": "gloria4", "reason": "the Latin ends on glória ejus; = 56:6's build; glória is paroxytone"},
        {"verse": "112:5", "remark": "o que é humilde wordy, hiatus", "outcome": "taken"},
        {"verse": "112:7", "remark": "dangling gerunds → finite verbs", "outcome": "taken"},
        {"verse": "112:7", "remark": "carente social-work register → necessitado", "outcome": "option", "decision": "inops", "reason": "D38 settles carente; necessitado is egénus's; evidence passed to the row"},
        {"verse": "112:8", "remark": "colocá-lo flat → o assentar", "outcome": "option", "decision": "collocet", "reason": "assentar is the Greek/Hebrew 'seat'; collocáre is 'place' (rule 1)"},
        {"verse": "112:9", "remark": "Ele, que … never reaches a main verb", "outcome": "taken", "decision": "qui9"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Ten readings, two unknown words (*Excelso*, *esterco*). Acted on: 112:5 *o que é humilde* heard as a person (with the Latinist); 112:7 heard broken off (with the stylist). Kept: *meninos* heard as literal children (the ruling's known cost, flagged); *carente* emotional sense (D38); *Excelso* (D43), *esterco* (rule 5). The rest (*do seu povo* = God's people; *colocá-lo* = the poor man; *numa casa* dwelling/household; *da terra* ground) are the Latin's own openness or the intended first hearing.",
    "outcomes": [
        {"verse": "112:1", "remark": "meninos heard as literal children", "outcome": "option", "decision": "pueri", "reason": "the Latin's first sense and its liturgy's; servos is option 1, flagged for Gustavo"},
        {"verse": "112:5", "remark": "o que é humilde heard as a humble person", "outcome": "taken"},
        {"verse": "112:5", "remark": "no céu e na terra attaches to humilde or olha", "outcome": "refused", "reason": "the Latin's own ambiguity, kept on purpose"},
        {"verse": "112:7", "remark": "gerunds heard as broken off", "outcome": "taken"},
        {"verse": "112:7", "remark": "carente emotional sense", "outcome": "option", "decision": "inops", "reason": "D38"},
        {"verse": "112:4", "remark": "Excelso unknown", "outcome": "refused", "reason": "D43 settled; known cost"},
        {"verse": "112:7", "remark": "esterco unknown", "outcome": "refused", "reason": "concrete image (rule 5); monturo rarer, lixo another thing"},
        {"verse": "112:8", "remark": "seu povo: God's or the poor man's", "outcome": "refused", "reason": "the Latin's pópuli sui is as open; the first hearing is the intended one"},
        {"verse": "112:9", "remark": "numa casa: dwelling or household", "outcome": "refused", "reason": "domus holds both; = 67:6b"}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2 (revise_v2.py; v1 kept as prayed.v1.json): 112:5 *as coisas humildes*; 112:7 *Ele levanta da terra o carente, e do esterco ergue o pobre*; 112:9 *Ele faz habitar numa casa a estéril*. New decisions recording refusals: `gloria4`, `inops`, `collocet`. Wording changed materially in 7 and 9: Latinist gate re-run requested."})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
