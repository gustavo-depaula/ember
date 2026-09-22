"""Draft 2 of Ps 80 from the v1 readers (kept as prayed.v1.json)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
v = d['verses']
v['80:3'] = '{sumite} um salmo, e {date}: * {order3}.'
v['80:5'] = 'Porque é decreto em Israel: * e juízo {deojacob}.'
v['80:8'] = 'Na tribulação me invocaste, e eu te livrei: * eu te escutei {abscondito} da tempestade: eu te provei junto à água da {contradictionis}.'
v['80:15'] = '{pronihilo} eu teria humilhado os seus inimigos: * e teria {misissem} a minha mão sobre aqueles que os atribulam.'
dec = {x['id']: x for x in d['decisions']}

dec['exsultate']['options'].append({"label": "Exultai a", "forms": {"exsultate": "Exultai a"}, "note": "stylist v1: heard *para* as a direction of travel. Refused: the row (2:11) keeps *para*; *exultar* takes no dative object in Portuguese and *a Deus* would be heard as one.", "from": "stylist"})
dec['exsultate']['why'] += " v1: the stylist asked *Exultai a Deus*; kept as option 4, the row stands (a glossary word is not changed in one psalm)."

dec['date']['options'].append({"label": "fazei soar o tamborim", "forms": {"date": "fazei soar o tamborim"}, "note": "stylist v1: 'give it voice'. The sense, but *soar* is supplied and *dar* lost.", "from": "stylist"})
dec['date']['why'] += " v1: both the stylist and the ambiguity reader heard 'hand over the tambourine' first. That is one of the Latin's own two readings (DRB 'bring hither'), so the verb is kept; *fazei soar* (stylist) is option 5 and *tocai* option 2 — the first place Gustavo may want to overrule."

dec['jucundum']['options'].append({"label": "suave", "forms": {"jucundum": "suave"}, "note": "stylist v1 ('agradável' flat); refused: *suave* is *suávis*'s word.", "from": "stylist"})
dec['jucundum']['why'] += " v1: the stylist found *agradável* flat and asked *suave*; refused (the *suávis* row), option 4."

d['decisions'].append({
  "id": "order3", "refs": ["80:3"], "latin": "psaltérium jucúndum cum cíthara", "kind": "order",
  "why": "v1: the stylist heard the verse fall badly on the proparoxytone *cítara*, and asked for the order *com a cítara, o saltério …*. Order is the ear's (D2), and nothing of the Latin is lost; the colon now closes on the paroxytone *agradável*. The ambiguity reader heard *saltério* as the book of Psalms first — the Latin *psaltérium* has the same double sense, kept.",
  "options": [
    {"label": "com a cítara, o saltério agradável", "forms": {"order3": "com a cítara, o saltério {jucundum}"}, "note": "Ruling (v2): the stylist's order, with the row's adjective.", "from": "stylist"},
    {"label": "o saltério agradável com a cítara", "forms": {"order3": "o saltério {jucundum} com a cítara"}, "note": "draft 1: the Latin's order, closing on the proparoxytone as the Latin does.", "from": "draft"}
  ]})

dec['pronihilo']['options'].insert(0, {"label": "Com um nada, talvez,", "forms": {"pronihilo": "Com um nada, talvez,"}, "note": "Ruling (v2): the stylist's; keeps *nihil* and is heard as 'with a trifle, easily'.", "from": "stylist"})
dec['pronihilo']['options'][1]['note'] = "draft 1: the row's *por nada*; v1 stylist and ambiguity reader both heard 'for no reason / in vain' — a reversal of the sense."
dec['pronihilo']['why'] += " v1: both the stylist and the ambiguity reader heard *Por nada* as 'for no reason' or 'in vain' — the opposite of the sense; a wrong first hearing is a fault (D2), so this verse departs from the 55:8 row as the row allowed. *Com um nada* (the stylist's) keeps the Latin's 'nothing' and says the ease. The ambiguity reader also heard *talvez* as doubt; it is the Latin's *fórsitan*, kept."

dec['misissem']['why'] += " v1: the stylist heard *os que os atribulam* as a stutter; *aqueles que os atribulam* taken (a pronoun, grammar)."

dec['deojacob']['why'] += " v1: the Latinist (minor) asked for *para o*, calling *do* defensible; refused — the ambiguity reader heard *do* as God's own ordinance, which is the reading the parallel *in Israël* supports. The articles *um … um* were dropped in v2 at the stylist's request (the vowels of *Porque é um*); the Latin has none."

d['choices']['80:5'] += " v2: *Porque é decreto … e juízo* without articles, as the Latin (stylist: the hiatus *é um*)."
d['choices']['80:8'] += " v2: *eu te escutei … eu te provei* with the pronoun before the verb, as in the first colon (stylist: *escutei-te … provei-te* stiff after *me invocaste … te livrei*); the subject *eu* named to carry the proclisis (rule 2)."
d['version'] = 2
d['status'] = 'draft'
d['audit'] += [
 {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. One minor (80:5 dative); refused. Overall: faithful, marks match.",
  "outcomes": [{"verse": "80:5", "remark": "genitive *do Deus de Jacó* settles the dative", "outcome": "refused", "decision": "deojacob", "reason": "he calls it defensible; the possessive dative is what the parallel *in Israël* supports and what the ambiguity reader heard; *para o* is heard as 'in God's favour'. Kept as option 2."}]},
 {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Seven remarks; four taken, three kept as options. Best line 80:17, worst 80:15.",
  "outcomes": [
   {"verse": "80:2", "remark": "*exultar para* not native; *Exultai a Deus*", "outcome": "option", "decision": "exsultate", "reason": "the glossary row (2:11) stands; a row is not changed in one psalm."},
   {"verse": "80:3", "remark": "*dai o tamborim* heard as 'hand over'; *fazei soar*", "outcome": "option", "decision": "date", "reason": "'hand over' is one of the Latin's two readings (DRB); *soar* is supplied."},
   {"verse": "80:3", "remark": "final proparoxytone *cítara*; reorder", "outcome": "taken", "decision": "order3"},
   {"verse": "80:3", "remark": "*agradável* flat; *suave*", "outcome": "option", "decision": "jucundum", "reason": "*suave* is *suávis*'s word (row)."},
   {"verse": "80:5", "remark": "hiatus *Porque é um*; drop the articles", "outcome": "taken"},
   {"verse": "80:8", "remark": "enclisis *escutei-te … provei-te* after proclisis", "outcome": "taken"},
   {"verse": "80:15", "remark": "*Por nada* misheard; *Com um nada*", "outcome": "taken", "decision": "pronihilo"},
   {"verse": "80:15", "remark": "*os que os* stutters; *aqueles que os*", "outcome": "taken", "decision": "misissem"}]},
 {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. 22 readings; most are the Latin's own openness (subjects in 80:6–7, the time of the enemies in 80:16, *eos* in 80:17). Unknown: *saltério*, *cítara*, *assinalado*, *fardos*, *atribulam*.",
  "outcomes": [
   {"verse": "80:3", "remark": "*dai o tamborim* heard as 'hand over'", "outcome": "refused", "decision": "date", "reason": "one of the Latin's own readings; option kept."},
   {"verse": "80:3", "remark": "*saltério* heard as the book of Psalms", "outcome": "refused", "reason": "*psaltérium* has the same double sense in Latin; the instrument is clear beside *cítara*."},
   {"verse": "80:5", "remark": "subject of *é* not audible", "outcome": "refused", "reason": "the Latin leaves it unspoken."},
   {"verse": "80:6", "remark": "subjects of *pôs*, *saía*, *ouviu* unclear", "outcome": "refused", "reason": "the Latin's openness (choices 80:6)."},
   {"verse": "80:8", "remark": "*água da contradição* not recognized as a place name", "outcome": "refused", "decision": "contradictionis", "reason": "it is the Latin's name, and the image of strife is heard; *contenda* option."},
   {"verse": "80:9", "remark": "*darei testemunho* heard as 'in your favour'", "outcome": "refused", "decision": "contestabor", "reason": "= 49:7 (one Greek); *advertirei* option."},
   {"verse": "80:15", "remark": "*Por nada* heard as 'in vain', reversing the sense", "outcome": "taken", "decision": "pronihilo"},
   {"verse": "80:16", "remark": "*o tempo deles será pelos séculos* sounds like a reward to the enemies", "outcome": "refused", "reason": "the Latin says exactly this and leaves it as open; not resolved."},
   {"verse": "80:17", "remark": "*os* may be heard as the enemies", "outcome": "refused", "reason": "the Latin's *eos* is as open."},
   {"verse": "80:17", "remark": "*gordura do trigo* odd", "outcome": "refused", "decision": "adipe", "reason": "rule 5 keeps *fat*; *flor do trigo* option."}]},
 {"step": "revision", "version": 2, "note": "v2: 80:3 order (stylist); 80:5 articles dropped (stylist); 80:8 proclisis with *eu* (stylist); 80:15 *Com um nada, talvez,* (stylist and ambiguity reader) and *aqueles que os* (stylist). Draft 1 kept as prayed.v1.json."}]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
