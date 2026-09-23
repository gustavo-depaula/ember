"""Ps 98 draft 2: apply the v1 readers' remarks that are taken; keep the rest as options. prayed.v1.json is the kept draft."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'draft'
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note_add=None, new=None):
    """Move the option with this label to position 0 (or insert `new` there)."""
    opts = dec[did]['options']
    if new is not None:
        opts.insert(0, new)
        return
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    o = opts.pop(i)
    if note_add:
        o['note'] = (o.get('note', '') + ' — ' + note_add).strip(' —')
    opts.insert(0, o)


# 98:1 irascantur: both the stylist and the ambiguity reader heard *irem-se* as *ir-se* ("go away").
promote('irascantur', 'enfureçam-se', 'v2: taken from the stylist; the ambiguity reader heard *irem-se* as "go away" too', )
dec['irascantur']['options'][0]['from'] = 'stylist'
dec['irascantur']['why'] += (" **v2:** the stylist and the ambiguity reader both heard *irem-se* first as *ir-se* ('let the peoples go away'), and the ambiguity reader listed it as unknown — a wrong first hearing, which D2 counts a fault. *Enfureçam-se* taken: it is anger, as *irásci* is, and the verb *enfurecer* renders no other Latin verb in the psalter (the noun *furor* is the ira / furor row, a different word class). *Irritem-se* (MS1932) is weaker in Brazil ('be annoyed'). *Irem-se* stays an option.")

# 98:1 sedet: stylist + ambiguity reader: *o que* read as 'that which', the link loose.
promote('sedet', None, new={"label": "aquele que se senta", "forms": {"sedet": "aquele que se senta"},
                            "note": "v2 — the stylist's *aquele que*, with the plain *se senta* for his *se assenta*", "from": "stylist"})
dec['sedet']['why'] += (" **v2:** the stylist heard *o que* first as 'that which', and the ambiguity reader could not hear how the relative joins the verse. *Aquele que* names a person; *se senta* (the stylist's *se assenta*, in its current form) is two syllables shorter than *está sentado*, which pays for *aquele*. The departure from 79:2b's *estais sentado* is accepted: that verse is the second person, not identical Latin.")

# 98:3 confiteantur: the ambiguity reader heard *Deem … vosso* as 'you all, give thanks to your own name'.
promote('confiteantur', 'Que os povos deem graças', 'v2: taken — names the subject, so *vosso* can only be God\'s')
dec['confiteantur']['options'][0]['from'] = 'ambiguity'
dec['confiteantur']['why'] += (" **v2:** the ambiguity reader heard bare *Deem* as a plural imperative ('you all') and then *vosso* as the addressees' own name. Naming the subject the verb ending hides (D2) closes the misreading and gives 66:4's own build, *Que os povos vos deem graças*. The Latinist (minor) asked *Louvem* for *confitéri*: refused under D5 (settled), which keeps *louvar* for *laudáre*.")

# 98:4 directiones: *retidões* unknown to the ambiguity reader, 'sounds invented' to the stylist.
promote('directiones', 'a retidão', 'v2: taken — the plural was unknown to the ambiguity reader and refused by the stylist')
dec['directiones']['options'].append({"label": "as vias retas", "forms": {"directiones": "as vias retas"},
                                      "note": "the stylist's; supplies *vias*, a noun the Latin does not have", "from": "stylist"})
dec['directiones']['why'] += (" **v2:** the plural *retidões* was listed unknown by the ambiguity reader and heard as a coined word by the stylist, at the mediant. Number is grammar (D2); the singular *a retidão* is the psalter's word for *diréctio* (44:7, 118:7) and every reader knows it. The stylist's *as vias retas* is refused: it adds *vias* (an image of roads) the Latin does not name; kept as an option.")

# 98:4 fecisti: the Latinist (minor) asked *fizestes*.
promote('fecisti', 'fizestes', 'v2: taken from the Latinist')
dec['fecisti']['options'][0]['from'] = 'latinist'
dec['fecisti']['why'] += (" **v2:** the Latinist (minor) found *praticastes* adds habitual exercise and asked the plain *fizestes*. Taken: 118:121's reason for *praticar* (*Fiz juízo* heard as 'formed an opinion') does not arise when the object is *o juízo e a justiça em Jacó* after *vós*; and the *fácere judícium* row is open with four builds, so this is a fifth piece of evidence, not a departure from a ruling. Cost: the identical object pair reads *Pratiquei* in 118:121 — flagged in the row.")

# 98:8 ulciscens: stylist (worst line) and ambiguity reader: the gerund hangs.
promote('ulciscens', None, new={"label": "vos vingastes de", "forms": {"ulciscens": "vos vingastes de"},
                                "note": "v2 — the participle as a finite verb, coordinated with *fostes*", "from": "draft"})
dec['ulciscens']['why'] += (" **v2:** the stylist named 98:8 the worst line — the gerund *vingando-vos* has no finite verb to hang on and the colon trails — and the ambiguity reader found the *e* + gerund link loose. The participle becomes a finite verb coordinated with *fostes* (*vós lhes fostes propício, e vos vingastes de …*): grammar, as D2 allows, with the verb and its object unchanged. The stylist's noun *vingador de* is refused because *vingador de alguém/algo* is heard as 'avenger on behalf of' — the opposite sense; kept as an option.")

for vid, txt in list(d['verses'].items()):
    pass
d['verses']['98:1'] = "O Senhor {regnavit}, {irascantur} os povos: * {sedet} sobre os querubins, abale-se a terra."

d['audit'].append({
    "step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
    "note": "3 minors, no major. One taken (98:4 *fizestes*), two refused under settled rulings (D5, D19). Overall: 'a faithful, close rendering'.",
    "outcomes": [
        {"verse": "98:3", "remark": "confitéri → louvem / confessem, not deem graças", "outcome": "refused", "decision": "confiteantur", "reason": "D5 (settled): *dar graças a* for *confitéri* to God; *louvar* is kept for *laudáre*."},
        {"verse": "98:4", "remark": "praticastes adds habitual nuance; fizestes", "outcome": "taken", "decision": "fecisti"},
        {"verse": "98:7", "remark": "præcéptum → preceito, not decreto", "outcome": "refused", "reason": "D19 (settled) lists this verse: *preceitos* is *justificatiónes*' word in Ps 118, *decreto* is *præcéptum*'s across all eight places."}
    ]})
d['audit'].append({
    "step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
    "note": "4 remarks on 3 verses; best line 98:9, worst 98:8. Three taken (one in modified form), one refused and kept as an option.",
    "outcomes": [
        {"verse": "98:1", "remark": "irem-se heard as ir-se; enfureçam-se", "outcome": "taken", "decision": "irascantur"},
        {"verse": "98:1", "remark": "o que read as 'that which'; aquele que se assenta", "outcome": "taken", "decision": "sedet", "reason": "taken as *aquele que se senta* (the current form of the verb)"},
        {"verse": "98:4", "remark": "retidões not current; as vias retas", "outcome": "option", "decision": "directiones", "reason": "the fault taken (singular *a retidão*); his wording refused because it adds *vias*"},
        {"verse": "98:8", "remark": "hanging gerund; vingador de", "outcome": "option", "decision": "ulciscens", "reason": "the fault taken (finite verb *vos vingastes de*); *vingador de* refused — heard as 'avenger on behalf of'"}
    ]})
d['audit'].append({
    "step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "20 readings, 5 unknown words (irem-se, excelso, retidões, escabelo, propício). Changed: 98:1 twice, 98:3, 98:4, 98:8. Held: the Latin's own openness in 98:3 (*a honra do rei ama o juízo*), 98:5 (the footstool adored; *é santo*), 98:7 subject of *deu*.",
    "outcomes": [
        {"verse": "98:1", "remark": "irem-se heard as 'go away'; unknown", "outcome": "taken", "decision": "irascantur"},
        {"verse": "98:1", "remark": "link between the relative and the verse not audible", "outcome": "taken", "decision": "sedet"},
        {"verse": "98:3", "remark": "Deem … vosso heard as 'you all … your own name'", "outcome": "taken", "decision": "confiteantur"},
        {"verse": "98:3", "remark": "a honra do rei ama o juízo obscure", "outcome": "refused", "reason": "the Latin's own sentence, kept word for word (the Septuagintal reading); MS1932's *está em amar* interprets"},
        {"verse": "98:3", "remark": "porque é terrível e santo: the name or God", "outcome": "refused", "reason": "the Latin's neuters point to the name; the Portuguese keeps both hearings open, as the Latin reader also hears God behind his name"},
        {"verse": "98:4", "remark": "retidões unknown / unclear", "outcome": "taken", "decision": "directiones"},
        {"verse": "98:5", "remark": "adorai o escabelo: the footstool itself; escabelo unknown", "outcome": "refused", "decision": "adorate", "reason": "the Latin's direct object is kept (rule 1); *escabelo* is the concrete noun (rule 5), *estrado* stays the option"},
        {"verse": "98:5", "remark": "é santo: footstool or God", "outcome": "refused", "decision": "sanctumest", "reason": "the ambiguity is the one the decision keeps on purpose"},
        {"verse": "98:2", "remark": "excelso unknown", "outcome": "refused", "reason": "D43 settled *excélsus → excelso*"},
        {"verse": "98:8", "remark": "propício unknown", "outcome": "refused", "decision": "propitius", "reason": "the propitiári row keeps *propício* where the object is a person and names this verse"},
        {"verse": "98:8", "remark": "e + gerund link loose; deles unclear", "outcome": "taken", "decision": "ulciscens", "reason": "the gerund made finite; *deles* kept — it points to the same people, as the Latin's *eórum* does"}
    ]})
d['audit'].append({"step": "revision", "version": 2,
                   "note": "v2: 98:1 *enfureçam-se* (stylist + ambiguity), *aquele que se senta* (stylist); 98:3 *Que os povos deem graças* (ambiguity); 98:4 *a retidão* (stylist + ambiguity), *fizestes* (Latinist); 98:8 *e vos vingastes de* (stylist + ambiguity). Draft 1 kept as prayed.v1.json."})

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
