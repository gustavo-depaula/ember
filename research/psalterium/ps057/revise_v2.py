"""Ps 57 draft 2 from the v1 readers (claude-opus-5-5, fresh context)."""
import json
p = 'prayed.json'
d = json.load(open(p))
d['version'] = 2
v = d['verses']
v['57:4'] = "Desde {vulva} os pecadores {alienati}, desde {utero} {errare}: * falaram {falsa}."
v['57:5'] = "{furor} da serpente: * {aspidis} da áspide surda, e que tapa os seus ouvidos,"
v['57:10'] = "Antes que os vossos espinhos {intellegerent} {rhamnum}: * {viventes}, assim na ira os {absorbet}."
v['57:11'] = "O justo se alegrará {viderit} a vingança: * lavará as suas mãos no sangue do pecador."
dec = {x['id']: x for x in d['decisions']}

a = dec['alienati']
a['why'] += " Draft 2 takes the stylist's order (both *desde* phrases fronted, a chiasm) and *se fizeram estranhos*, which drops the two enclitics side by side; the blind reader heard *estranhos* as 'odd people' — the cost of the *aliénus* row, weighed against a cognate heard as modern jargon."
a['options'] = [
    {"label": "se fizeram estranhos", "forms": {"alienati": "se fizeram estranhos"}, "note": "Ruling (v2, stylist); *aliénus → estranho* row.", "from": "stylist"},
    {"label": "tornaram-se estranhos", "forms": {"alienati": "tornaram-se estranhos"}, "note": "draft 1.", "from": "draft"},
    {"label": "se alienaram", "forms": {"alienati": "se alienaram"}, "note": "the cognate; DRB 'are alienated'; heard as a modern word.", "from": "DRB"},
]
d['decisions'].insert(d['decisions'].index(a) + 1, {
    "id": "errare", "refs": ["57:4"], "latin": "erravérunt ab útero", "kind": "order",
    "why": "*erráre → extraviar-se* (row, which names 57:4). With the *desde* phrase fronted (the stylist's order) the pronoun goes before the verb: *se extraviaram*.",
    "options": [
        {"label": "se extraviaram", "forms": {"errare": "se extraviaram"}, "note": "Ruling (v2).", "from": "stylist"},
        {"label": "erraram", "forms": {"errare": "erraram"}, "note": "MS1932; *errar* is heard first as 'made a mistake'.", "from": "MS1932"},
    ]})
vu = dec['vulva']
vu['why'] += " The stylist (v2) proposed bare *desde o seio* to shorten the colon; refused: the *úterus* row exists because bare *seio* is the breast. It stays an option."
vu['options'].insert(1, {"label": "o ventre … o seio", "forms": {"vulva": "o ventre", "utero": "o seio"}, "note": "stylist; shorter; bare *seio* is heard as the breast (row *úterus*).", "from": "stylist"})

f = dec['furor']
f['why'] += " Draft 2 takes the stylist's *é semelhante ao*: *é à semelhança* is a calque with a hiatus, and the feminine *a da áspide* sent the blind reader back to *serpente*. The root of *similitúdo* stays (*semelhante*); a noun turning adjective is grammar (D2). *o da áspide* now picks up *furor*, as the Latin's genitive picks up the likeness."
f['options'] = [
    {"label": "O furor deles é semelhante ao … como o", "forms": {"furor": "O furor deles é semelhante ao", "aspidis": "como o"}, "note": "Ruling (v2, stylist).", "from": "stylist"},
    {"label": "O furor deles é à semelhança … como a", "forms": {"furor": "O furor deles é à semelhança", "aspidis": "como a"}, "note": "draft 1; the noun kept.", "from": "draft"},
    {"label": "Eles têm um furor à semelhança … como a", "forms": {"furor": "Eles têm um furor à semelhança", "aspidis": "como a"}, "note": "the dative as *ter*.", "from": "draft"},
]

i = dec['intendit']
i['why'] += " The Latinist (v1, minor) asks for the present: the verbs around it are futures (*devénient*, *auferéntur*, *cónteret*), which makes the present the more natural reading. Taken; the perfect of the two Vulgate witnesses is the option."
i['options'] = [
    {"label": "arma", "forms": {"intendit": "arma"}, "note": "Ruling (v2, Latinist).", "from": "latinist"},
    {"label": "armou", "forms": {"intendit": "armou"}, "note": "draft 1; DRB, MS1932.", "from": "draft"},
    {"label": "retesa", "forms": {"intendit": "retesa"}, "note": "the Latinist's verb; exact but little known (row *inténdere arcum*).", "from": "latinist"},
]

s = dec['supercecidit']
s['why'] += " The Latinist (v1, minor): *super-* is where the fire falls (upon), not whence; *de cima* turned it round. *cair sobre* needs its object in Portuguese, so *eles* is supplied, as DRB and MS1932 do; *sobreveio* (the Latinist's) loses the falling."
s['options'] = [
    {"label": "sobre eles", "forms": {"supercecidit": "sobre eles"}, "note": "Ruling (v2); DRB 'fallen on them'.", "from": "latinist"},
    {"label": "de cima", "forms": {"supercecidit": "de cima"}, "note": "draft 1; nothing supplied, but the preposition turned round.", "from": "draft"},
]

ab = dec['absorbet']
ab['why'] += " Draft 2 adds *a* before *vivos* (the stylist): it ties *sicut vivéntes* to the object *eos*, as the Latin's accusative does."
d['decisions'].insert(d['decisions'].index(ab), {
    "id": "viventes", "refs": ["57:10"], "latin": "sicut vivéntes", "kind": "grammar",
    "why": "*vivéntes* agrees with *eos*: 'swallows them as living men'. The preposition *a* marks it as the object in Portuguese.",
    "options": [
        {"label": "como a vivos", "forms": {"viventes": "como a vivos"}, "note": "Ruling (v2, stylist).", "from": "stylist"},
        {"label": "como vivos", "forms": {"viventes": "como vivos"}, "note": "draft 1.", "from": "draft"},
    ]})
d['decisions'].append({
    "id": "viderit", "refs": ["57:11"], "latin": "cum víderit vindíctam", "kind": "grammar",
    "why": "The blind reader heard draft 1's *quando vir* as the infinitive *vir*, 'when vengeance comes'. *ao ver* (MS1932's build) cannot be misheard and is two syllables shorter; the future-perfect nuance of *víderit* is carried by *se alegrará*.",
    "options": [
        {"label": "ao ver", "forms": {"viderit": "ao ver"}, "note": "Ruling (v2, from the ambiguity reader); MS1932.", "from": "ambiguity"},
        {"label": "quando vir", "forms": {"viderit": "quando vir"}, "note": "draft 1; *vir* heard as 'to come'.", "from": "draft"},
    ]})
d['choices']['57:11'] = d['choices']['57:11'].replace("in the natural order rather than the mesóclise;", "in the natural order rather than the mesóclise; *lavar as mãos* may ring as Pilate's idiom to the blind reader — it is the Latin's image;")
d['choices']['57:10'] = "The blind reader found *os vossos espinhos entendessem o espinheiro* incomprehensible, as the Latin and the Greek are; kept (decision `intellegerent`). The subject of *engole* is unnamed, as in the Latin."
d['choices']['57:12'] = d['choices']['57:12'] + " *os* (the Latin's *eos*) has no near antecedent, as in the Latin — the sinners of 57:10–11."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, read latin.json. 2 minor; both taken.",
  "outcomes": [
    {"verse": "57:8", "remark": "intendit present, not committed to the perfect", "outcome": "taken", "decision": "intendit"},
    {"verse": "57:9", "remark": "supercecidit = fell upon, not from above", "outcome": "taken", "decision": "supercecidit"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context. 5 remarks in 4 verses; 3 taken, 1 taken in part (order and verb, not bare *seio*), 1 refused. Worst line 57:4, best 57:12.",
  "outcomes": [
    {"verse": "57:4", "remark": "colon too long; front the desde phrases; se fizeram; bare seio", "outcome": "option", "decision": "vulva", "reason": "Order and *se fizeram estranhos* taken; bare *seio* refused — the *úterus* row: bare *seio* is the breast."},
    {"verse": "57:5", "remark": "é à semelhança a calque with hiatus → é semelhante ao", "outcome": "taken", "decision": "furor"},
    {"verse": "57:5", "remark": "como a da → como o da (picks up furor)", "outcome": "taken", "decision": "furor"},
    {"verse": "57:10", "remark": "como a vivos", "outcome": "taken", "decision": "viventes"},
    {"verse": "57:9", "remark": "serão levados for serão tirados", "outcome": "refused", "decision": "fluit", "reason": "*auferre → tirar* is settled (D41) and *levar* is addúcere's (D42); already an option."}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 20 readings, 3 unknown words (áspide, encantadores as snake-charmers, espinheiro). One change: 57:11 *quando vir*.",
  "outcomes": [
    {"verse": "57:11", "remark": "quando vir heard as 'when vengeance comes'", "outcome": "taken", "decision": "viderit"},
    {"verse": "57:5", "remark": "a da: referent unclear", "outcome": "taken", "decision": "furor"},
    {"verse": "57:4", "remark": "estranhos heard as odd people", "outcome": "refused", "decision": "alienati", "reason": "The *aliénus → estranho* row; the cognate is heard as modern jargon. Weighed in the decision."},
    {"verse": "57:10", "remark": "entendessem the thorn-bush incomprehensible", "outcome": "refused", "decision": "intellegerent", "reason": "The Latin and the Greek say it so; *crescer* would import a sense neither has."},
    {"verse": "57:6", "remark": "encanta sabiamente sounds like praise", "outcome": "refused", "reason": "*sapiénter* (D43); the Latin's own irony, the charmer's skill."},
    {"verse": "57:8", "remark": "subject of armou/arma unheard", "outcome": "refused", "reason": "The Latin names none."},
    {"verse": "57:12", "remark": "os has no near antecedent", "outcome": "refused", "reason": "*eos* is the Latin's, the same distance back."},
    {"verse": "57:5", "remark": "áspide unknown", "outcome": "refused", "reason": "The Latin's animal; concrete images stay (rule 5)."},
    {"verse": "57:10", "remark": "espinheiro unknown", "outcome": "refused", "decision": "intellegerent", "reason": "The plainest name for a thorny shrub; *sarça* is the Burning Bush."}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 57:4 fronted chiasm *Desde o ventre os pecadores se fizeram estranhos, desde o seio materno se extraviaram*; 57:5 *é semelhante ao … como o da*; 57:8 *arma* (present); 57:9 *caiu fogo sobre eles*; 57:10 *como a vivos*; 57:11 *ao ver*. Draft 1 kept as prayed.v1.json."})
json.dump(d, open(p, 'w'), ensure_ascii=False, indent=2)
