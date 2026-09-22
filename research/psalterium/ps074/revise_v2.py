import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
d['verses']['74:7'] = "{quia} nem do oriente, nem do ocidente, nem {desertis}: * {quoniam} Deus é juiz."
dec = {x['id']: x for x in d['decisions']}

t = dec['tempus']
t['why'] += " v2: the stylist found *eu … eu* heavy in one short colon (the Latin names *ego* once, at *judicábo*); the first *eu* is dropped — the person of *tomar* is fixed by *eu julgarei* in the same breath. The ambiguity reader heard *tomar o tempo* first as 'find the time'; it is close to the Latin's own 'take a time', and kept."
t['options'] = [
  {"label": "quando tomar o tempo", "forms": {"tempus": "quando tomar o tempo"}, "note": "Ruling (v2): the stylist's; *ego* said once, at the verb it stands beside.", "from": "stylist"},
  {"label": "quando eu tomar o tempo", "forms": {"tempus": "quando eu tomar o tempo"}, "note": "draft 1; the person named twice.", "from": "draft"},
  {"label": "quando eu tiver tomado o tempo", "forms": {"tempus": "quando eu tiver tomado o tempo"}, "note": "the future perfect to the letter.", "from": "draft"},
  {"label": "no tempo que eu tiver fixado", "forms": {"tempus": "no tempo que eu tiver fixado"}, "note": "MS1932; *fixar* interprets *accípere*.", "from": "MS1932"}]

q = dec['quia']
q['why'] += " v2: the stylist heard *porque … porque* at the head of both cola as a stutter, and the Latin itself varies the word (*quia / quóniam*); the second becomes *pois*."
q['options'] = [
  {"label": "Porque … pois", "forms": {"quia": "Porque", "quoniam": "pois"}, "note": "Ruling (v2): the stylist's; varies where the Latin varies.", "from": "stylist"},
  {"label": "Porque … porque", "forms": {"quia": "Porque", "quoniam": "porque"}, "note": "draft 1; the defaults.", "from": "draft"},
  {"label": "Pois … porque", "forms": {"quia": "Pois", "quoniam": "porque"}, "note": "varied the other way.", "from": "draft"}]

e = dec['exinanita']
e['why'] += " v2: the Latinist (minor) asked for the passive *não foi esvaziada*: the Latin is a passive perfect. The voice is taken, the verb kept: *não foi esgotada* — dregs are drained, not 'emptied'."
e['options'] = [
  {"label": "não foi esgotada", "forms": {"exinanita": "não foi esgotada"}, "note": "Ruling (v2): the Latin's passive (Latinist), MS1932's verb.", "from": "latinist"},
  {"label": "não se esgotou", "forms": {"exinanita": "não se esgotou"}, "note": "draft 1; MS1932.", "from": "MS1932"},
  {"label": "não foi esvaziada", "forms": {"exinanita": "não foi esvaziada"}, "note": "the Latinist's fix; the root sense of *exinaníre*.", "from": "latinist"}]

i = dec['inclinavit']
i['why'] += " v2: the Latinist (minor) asked for the bare *E inclinou*, calling the supplied *o* defensible. Refused: without an object Portuguese *inclinou deste para aquele* is heard as intransitive, 'he leaned from this one to that' — a new sense; the pronoun is grammar (rule 2) and the ambiguity reader heard it as the cup."

f = dec['iniqueagere']
f['why'] += " v2: the ambiguity reader listed *ajais* and *iniquamente* as unknown; kept for the echo *iníquos … iniquamente* (no remark from the Latinist or the stylist). *Não procedais* is one touch away."

d['decisions'].append({
  "id": "loqui", "refs": ["74:6"], "latin": "nolíte loqui advérsus Deum iniquitátem", "kind": "word",
  "why": "*loqui* with a content object → *falar* + noun (the *loqui mendácium* row: *falar mentira*, 16:9b *falou soberba*, 57:2 *falais justiça*). The stylist heard *falar iniquidade* as a calque and asked *digais*; refused — *dícere* is *dizer* in this psalm (74:5 *Dixi → Eu disse*) and the row keeps the content object with *falar*. His line is option 2.",
  "options": [
    {"label": "faleis", "forms": {"loqui": "faleis"}, "note": "Ruling: the *loqui* row.", "from": "glossary"},
    {"label": "digais", "forms": {"loqui": "digais"}, "note": "the stylist's; *dícere*'s verb.", "from": "stylist"}]})
d['verses']['74:6'] = "Não ergais {inaltum} o vosso chifre: * não {loqui} iniquidade contra Deus."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Two minors in 74:9; one taken in part, one refused.", "outcomes": [
  {"verse": "74:9", "remark": "supplied object *o* in *E o inclinou*", "outcome": "refused", "decision": "inclinavit", "reason": "without it *inclinou* is heard as intransitive ('leaned'), a sense the Latin lacks; the pronoun is grammar."},
  {"verse": "74:9", "remark": "passive *exinaníta* rendered as reflexive", "outcome": "taken", "decision": "exinanita", "reason": "voice taken (*não foi esgotada*); his verb *esvaziada* kept as option 3."}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Four remarks; two taken, two refused. Best line 74:10, worst 74:3.", "outcomes": [
  {"verse": "74:3", "remark": "doubled *eu*; *tomar o tempo* heard as 'use up time'", "outcome": "taken", "decision": "tempus", "reason": "first *eu* dropped; *tomar o tempo* kept as the Latin's verb."},
  {"verse": "74:4", "remark": "*habitam* proparoxytone at the mediant; *moram*", "outcome": "refused", "reason": "*habitam* is ha-BI-tam, a paroxytone (checks.py agrees); *habitar* is the Latin's verb."},
  {"verse": "74:6", "remark": "*falar iniquidade* calqued; *digais*", "outcome": "option", "decision": "loqui", "reason": "the *loqui* row keeps *falar* with a content object; *dizer* is dícere's."},
  {"verse": "74:7", "remark": "*porque … porque* stutters; *pois* for *quóniam*", "outcome": "taken", "decision": "quia"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 25 readings, most the Latin's own openness (speaker of 74:3–4 and 74:11, the anacoluthon of 74:7, the paradox of 74:8, the unstated objects of 74:9–10) — kept. Unknown: *ajais*, *iniquamente*, *ergais*, *borra*, *justiças*, *chifre* as power.", "outcomes": [
  {"verse": "74:3", "remark": "*tomar o tempo* heard as 'find the time'", "outcome": "refused", "decision": "tempus", "reason": "near the Latin's 'take a time'; no plainer verb keeps *accípere*."},
  {"verse": "74:3", "remark": "*julgarei as justiças*: plural puzzling, heard as 'judge with justice'", "outcome": "refused", "decision": "justitias", "reason": "the sense heard is right; the plural is the Latin's (row)."},
  {"verse": "74:5", "remark": "*chifre* heard as literal or cuckold", "outcome": "refused", "reason": "the *cornu* row keeps the image (rule 5); the stylist too says it must stay."},
  {"verse": "74:6", "remark": "*o vosso chifre* could be God's", "outcome": "refused", "reason": "74:5 names the addressees just before; the Latin's *vestrum* is the same."},
  {"verse": "74:7", "remark": "incomplete sentence", "outcome": "refused", "decision": "quia", "reason": "the anacoluthon is the Latin's."},
  {"verse": "74:9", "remark": "*o inclinou*: cup or person", "outcome": "refused", "decision": "inclinavit", "reason": "heard as the cup first."},
  {"verse": "74:5", "remark": "*ajais*, *iniquamente* unknown", "outcome": "refused", "decision": "iniqueagere", "reason": "the echo *iníquos … iniquamente* is the Latin's; *procedais* option."}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 74:3 *quando tomar o tempo* (stylist); 74:7 *pois Deus é juiz* (stylist); 74:9 *não foi esgotada* (Latinist, voice); 74:6 decision `loqui` added for the refused *digais*."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
