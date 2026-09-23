"""Ps 88 helper: apply the v2 revision (after the v1 readers) to prayed.json."""
import json, pathlib

p = pathlib.Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text())
V, C = d['verses'], d['choices']
dec = {x['id']: x for x in d['decisions']}

d['version'] = 2

# 88:7 stylist: 'Porque quem' stutters
V['88:7'] = V['88:7'].replace('Porque quem', 'Pois quem')
C['88:7'] += " Draft 2: *Quóniam → Pois* here (the stylist: *Porque quem* stutters /ke ke/ at the opening, and the blind reader heard *Porque* as 'because', not as a question)."

# 88:18 stylist + ambiguity: beneplácito unknown
V['88:18'] = "Porque a glória do poder deles sois vós: * e {bene} será exaltado o nosso chifre."
d['decisions'].insert([x['id'] for x in d['decisions']].index('assump'), {
    "id": "bene", "refs": ["88:18"], "latin": "in beneplácito tuo", "kind": "word",
    "why": "*Beneplácitum* as a noun (εὐδοκία, good pleasure) has no settled row. Draft 1 had *no vosso beneplácito*; the stylist called it chancery Latin and the blind reader listed it as unknown. *Boa vontade* is already the word for *bona volúntas* (5:13b, 50:20), so it is not free. *Favor* is plain and keeps the sense of goodwill freely given.",
    "options": [
        {"label": "no vosso favor", "forms": {"bene": "no vosso favor"}, "note": "Ruling (v2): the stylist's word, with the Latin's *in*.", "from": "stylist"},
        {"label": "no vosso beneplácito", "forms": {"bene": "no vosso beneplácito"}, "note": "Draft 1: the Latin's word; unknown to the blind reader.", "from": "draft"},
        {"label": "no vosso agrado", "forms": {"bene": "no vosso agrado"}, "note": "Closer to *placére → agradar* (row).", "from": "draft"}
    ]})
C['88:18'] = C['88:18'].replace("*beneplácitum* as a noun → *beneplácito* (the Ps 5:13b note on the *beneplácitum fácere* row). ", "") + " The blind reader flagged *chifre* for the Brazilian slang sense; the row (open) keeps the image, as 88:25."

# 88:34 latinist: dissipar keeps dispérgere's image
d34 = dec['d34']
d34['options'].insert(0, {"label": "dissiparei / farei mal", "forms": {"d34": "dissiparei", "n34": "farei mal na minha verdade"}, "note": "Ruling (v2): the Latinist's *dissipar*, which keeps the image of scattering and is Portuguese with *misericórdia*.", "from": "latinist"})
d34['options'][1]['note'] = "Draft 1: *retirar* (MS1932), the ear for *dispérgere*; the Latinist found the image lost."
d34['why'] += " Draft 2 (the Latinist): *dissiparei*, which keeps the scattering and still reads as Portuguese. The blind reader found *nem farei mal na minha verdade* obscure; kept, for the Latin's echo of 88:23 (no Latinist remark), with MS1932's sense as the option."

# 88:41 ambiguity: sebes unknown
sep = dec['sep']
sep['options'].insert(0, {"label": "cercas / fortaleza", "forms": {"sep": "cercas", "f41": "fizestes da sua fortaleza um pavor"}, "note": "Ruling (v2): *cercas*, since the blind reader did not know *sebes*; it shares 79:13's word for *macéria*.", "from": "ambiguity"})
sep['options'][1]['label'] = "sebes / fortaleza (draft 1)"
sep['options'][1]['note'] = "Draft 1: *sebes* keeps *sepes* apart from 79:13's *macéria*."
sep['why'] += " Draft 2: *cercas*: the blind reader listed *sebes* as unknown, and a word nobody knows is a higher cost than sharing *cerca* with 79:13."

# 88:45 latinist (object is eum) + stylist (-lhe stiff)
em = dec['em45']
em['options'].insert(0, {"label": "Vós o destruístes, apartando-o", "forms": {"em45": "Vós o destruístes, apartando-o da purificação"}, "note": "Ruling (v2): the Latinist's reading — *eum* the object, *ab* as separation — with proclisis (*Destruístes-o* is not the *vós* form).", "from": "latinist"})
em['options'][1]['label'] = "Destruístes-lhe a purificação (draft 1)"
em['options'][1]['note'] = "Draft 1: purification made the thing destroyed (Latinist, minor); the stylist found *-lhe* stiff."
em['options'].insert(2, {"label": "Destruístes a sua purificação", "forms": {"em45": "Destruístes a sua purificação"}, "note": "The stylist's plain form; the same reading as draft 1.", "from": "stylist"})
em['why'] += " Draft 2: the Latinist showed that draft 1 made the purification the object; *apartando-o da* restores both *eum* and *ab* at the cost of about two syllables."

# 88:48 stylist
V['88:48'] = "Lembrai-vos do que é o meu ser: * pois acaso em vão {con48} todos os filhos dos homens?"
C['88:48'] += " Draft 2 (the stylist): *do que é* for *quæ* (draft 1 *de qual é* sounded translated), and *em vão* before the verb, which is the Latin's order (*vane constituísti*)."

# 88:51 stylist + ambiguity
V['88:51'] = "Lembrai-vos, Senhor, da afronta dos vossos servos, * que de muitas nações {ct51} no meu seio."
ct = dec['ct51']
ct['options'].insert(0, {"label": "guardei", "forms": {"ct51": "guardei"}, "note": "Ruling (v2): the stylist and the blind reader both heard *contive* as 'I restrained'.", "from": "stylist"})
ct['options'][1]['note'] = "Draft 1: the row (76:10); heard in Brazil as 'restrained'."
ct['options'][2]['label'] = "guardei (MS1932)"
del ct['options'][2]
ct['why'] = ct['why'].replace("It is kept at the end, as in the Latin.", "Draft 2 moves *de muitas nações* forward, next to *que* (the stylist): at the end it dangled, and the blind reader lost the parse. The genitive still belongs to the reproach.")

# refusals recorded as options where the remark lives on
dec['brac13']['options'].append({"label": "o vosso braço com potência", "forms": {"b13": "o vosso braço com potência"}, "note": "The Latinist: verbless, as the Latin.", "from": "latinist"})
dec['brac13']['why'] += " The Latinist (minor) asked for the verbless *o vosso braço com potência*. This is refused because the Greek fixes the predicate reading and the echo of 88:12 is the Latin's own (*Tui … tua … tuum*); his form is kept as an option. The stylist's *poderio* was refused because *poténtia → potência* is the row (64:7, 70:16, 79:3)."
dec['oath36']['why'] += " The Latinist (minor) asked for the formula to be kept (*se eu mentir a Davi!*). Refused: the blind reader would hear a condition that says the opposite. His form is option 2 (*pela minha santidade: se eu mentir*)."
dec['conf6']['why'] += " The Latinist (minor) asked for *celebrarão* (the accusative kept) and *deveras* for *étenim*. Refused: D5 is settled and 70:22 already has *dar graças por* with an accusative. *e também* renders *étenim* (καί). *Celebrarão* stays option 1."
dec['assump']['why'] += " The Latinist (minor) asked for *acolhimento*, to keep 88:19 and 88:27 apart. Refused for the Greek link (D15's test); it remains option 3."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. 7 minor, no major. Taken 2 (88:34, 88:45); refused 5 (88:6, 88:13, 88:15, 88:19, 88:36), each kept as an option where it had a form.",
    "outcomes": [
        {"verse": "88:6", "remark": "dar graças por turns objects into causes; étenim = 'deveras'", "outcome": "option", "decision": "conf6", "reason": "D5 is settled; 70:22 already renders confitéri + accusative with *por*."},
        {"verse": "88:13", "remark": "no copula: 'o vosso braço com potência'", "outcome": "option", "decision": "brac13", "reason": "The Greek fixes the predicate reading; it echoes 88:12."},
        {"verse": "88:15", "remark": "jubilatio → júbilo", "outcome": "refused", "reason": "D43 settled *jubilátio → aclamação* and names 88:15."},
        {"verse": "88:19", "remark": "amparo blurs assúmptio with suscéptor; 'acolhimento'", "outcome": "option", "decision": "assump", "reason": "ἀντίλημψις / ἀντιλήμπτωρ are one word in the Greek (D15's test)."},
        {"verse": "88:34", "remark": "retirar loses dispérgere; 'dissiparei'", "outcome": "taken", "decision": "d34"},
        {"verse": "88:36", "remark": "keep the oath formula 'se eu mentir a Davi!'", "outcome": "option", "decision": "oath36", "reason": "Heard as a condition with the opposite sense; D2 lets grammar yield."},
        {"verse": "88:45", "remark": "eum is the object; 'apartando-o da purificação'", "outcome": "taken", "decision": "em45"}
    ]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. 7 verses; best 88:33, worst 88:48. Taken 5 (88:7, 88:18, 88:45 in part, 88:48, 88:51); refused 2 (88:13, 88:39).",
    "outcomes": [
        {"verse": "88:7", "remark": "'Porque quem' stutters; 'Pois quem'", "outcome": "taken"},
        {"verse": "88:13", "remark": "'com potência' technical; 'poderio'", "outcome": "refused", "reason": "*poténtia → potência* is the row (64:7, 70:16, 79:3); *poderio* is its option there."},
        {"verse": "88:18", "remark": "'beneplácito' chancery Latin; 'por vosso favor'", "outcome": "taken", "decision": "bene"},
        {"verse": "88:39", "remark": "'desdenhastes' harsh and rare; 'desprezastes'", "outcome": "refused", "reason": "*desprezar* is *spérnere*'s word; *despícere → desdenhar* (row, 21:25 keeps both apart)."},
        {"verse": "88:45", "remark": "'Destruístes-lhe' stiff; 'Destruístes a sua purificação'", "outcome": "option", "decision": "em45", "reason": "The Latinist's reading (eum as the object) was taken; the stylist's form keeps draft 1's reading."},
        {"verse": "88:48", "remark": "'de qual é' translated; 'do que é'; 'em vão' before the verb", "outcome": "taken"},
        {"verse": "88:51", "remark": "'contive' = restrained; 'de muitas nações' dangles", "outcome": "taken", "decision": "ct51"}
    ]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, blind. 66 readings and 7 unknown words. Acted on: 88:7 (question not heard, *Pois*), 88:18 *beneplácito* unknown (*favor*), 88:41 *sebes* unknown (*cercas*), 88:51 parse lost (order and *guardei*). The rest are accepted: the Latin's own obscurities (88:34b, 88:37 the witness, 88:45 purification, 88:52 *mudança*), settled words (*Cristo* D19, *poderes* D43, *para sempre* in D27's formula, *voltará a* in the *appónere* row), and *chifre* (row, open; the image stays, rule 5). *Tabor*, *Hermon*, *profanastes*, *açoites* stay as they are: they are proper names and words that belong to the register.",
    "outcomes": [
        {"verse": "88:7", "remark": "'Porque quem' not heard as a question", "outcome": "taken"},
        {"verse": "88:18", "remark": "beneplácito unknown; chifre slang", "outcome": "taken", "decision": "bene"},
        {"verse": "88:41", "remark": "sebes unknown", "outcome": "taken", "decision": "sep"},
        {"verse": "88:51", "remark": "parse lost; 'seio' odd", "outcome": "taken", "decision": "ct51"},
        {"verse": "88:34", "remark": "'nem farei mal na minha verdade' obscure", "outcome": "option", "decision": "d34", "reason": "Kept for the Latin's echo of 88:23; MS1932's sense is the option."},
        {"verse": "88:36", "remark": "'Uma vez' heard as 'one time'", "outcome": "refused", "reason": "*Semel → uma vez* (61:12); in an oath, 'once' is enough."},
        {"verse": "88:47", "remark": "'até quando … para sempre' sounds contradictory", "outcome": "refused", "reason": "D27's formula (78:5)."},
        {"verse": "88:52", "remark": "'a mudança do vosso Cristo' incomprehensible; 'Com que' parse", "outcome": "option", "decision": "cm52", "reason": "The Latin is itself obscure; *troca* is no clearer."},
        {"verse": "88:39", "remark": "'Cristo' heard as Jesus", "outcome": "refused", "reason": "D19: *Christus → Cristo* on purpose."}
    ]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 88:7 *Pois quem*; 88:18 *no vosso favor* (new decision `bene`); 88:34 *dissiparei*; 88:41 *cercas*; 88:45 *Vós o destruístes, apartando-o da purificação*; 88:48 *do que é* and *em vão* before the verb; 88:51 *que de muitas nações guardei no meu seio*. Draft 1 is kept as prayed.v1.json."})

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
