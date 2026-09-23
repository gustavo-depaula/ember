"""Ps 149 draft 2: after the v1 readers (latinist, stylist, ambiguity; claude-opus-5-5, fresh context)."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
V = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 149:3 — proclisis instead of the enclitic on the subjunctive
V['149:3'] = 'Louvem o seu nome {choro}: * com tamborim e saltério {psallant}:'
d['decisions'].insert(3, {
    "id": "psallant", "refs": ["149:3"], "latin": "psallant ei", "kind": "order",
    "why": "*psállere → entoar salmos* is settled (D25) and must stay: *cantáre* stands beside it in 149:1, so the stylist's 'cantem-lhe salmos' would give the Latin's two verbs one Portuguese verb. His complaint was the enclisis 'entoem-lhe', stiff at the close of the colon. After the fronted instruments Brazilian Portuguese puts the pronoun before the verb, and the colon then ends on the plain 'salmos'. Placement of a clitic is grammar (D2).",
    "options": [
        {"label": "lhe entoem salmos", "forms": {"psallant": "lhe entoem salmos"}, "note": "Ruling (v2): proclisis; answers the stylist within D25.", "from": "stylist"},
        {"label": "entoem-lhe salmos", "forms": {"psallant": "entoem-lhe salmos"}, "note": "Draft 1; the enclisis of the written norm.", "from": "draft"},
        {"label": "cantem-lhe salmos", "forms": {"psallant": "cantem-lhe salmos"}, "note": "Stylist; refused — cantar is cantáre's (149:1), psállere is entoar salmos (D25).", "from": "stylist"}
    ]
})

# 149:5 — 'hão de alegrar-se' first
c = dec['cubil']
c['options'].insert(0, {"label": "hão de alegrar-se nos seus leitos", "forms": {"cubil": "hão de alegrar-se nos seus leitos"},
                        "note": "Ruling (v2): the stylist's periphrastic future, with the article kept ('nos seus', as 4:5). Still a future, still the Latin's order; no mesóclise, no proclisis at the head of the response, no rhyme with 149:4.", "from": "stylist"})
c['options'][1]['note'] = "Draft 1: the Latin's order, mesóclise; the stylist heard it as antiquated."
c['why'] +=" v2: the stylist heard the mesóclise as antiquated and tripping at the head of the colon, and proposed 'hão de alegrar-se' — the future said the way Brazilian speech says it with a pronominal verb. It changes how the thing is said, not what (D2): taken. The versicle's response then reads 'Hão de alegrar-se nos seus leitos.'"

# 149:6 — garganta deles / mãos deles
co = dec['copula']
co['options'][0]['forms']['v6cop'] = '{exalt} na garganta deles'
co['options'][1]['forms']['v6cop'] = '{exalt} estarão na garganta deles'
co['options'][0]['label'] = 'verbless (o seu louvor na assembleia … / As exaltações de Deus na garganta deles)'
V['149:6'] = '{v6cop}: * e espadas de dois gumes {manibus}.'
d['decisions'].insert(d['decisions'].index(dec['exalt']) + 1, {
    "id": "eorum", "refs": ["149:6"], "latin": "in gútture eórum … in mánibus eórum", "kind": "grammar",
    "why": "Draft 1 had 'na sua garganta … nas suas mãos'. The Latinist (minor) and the stylist both heard 'na sua garganta', right after 'de Deus', as God's throat; *eórum* is plural and is the saints'. 'deles' removes the misreading, and since the Latin repeats *eórum*, the second colon repeats 'deles' too (the repetition is the Latin's; the ambiguity reader heard 'nas suas mãos' rightly, but the two possessives should stay alike). The stylist's 'em suas gargantas' mends it by changing the Latin's singular *gútture* to a plural — refused, kept as option.",
    "options": [
        {"label": "na garganta deles … nas mãos deles", "forms": {"manibus": "nas mãos deles"}, "note": "Ruling (v2): the Latinist's fix, and the same pronoun for the second eórum.", "from": "latinist"},
        {"label": "nas suas mãos (with 'na garganta deles')", "forms": {"manibus": "nas suas mãos"}, "note": "Draft 1's second colon; the ambiguity reader heard it rightly.", "from": "draft"}
    ]
})
dec['exalt']['options'].append({"label": "em suas gargantas (stylist)", "forms": {"exalt": "As exaltações de Deus"}, "note": "The stylist's whole colon was 'As exaltações de Deus em suas gargantas … em suas mãos': the plural changes *gútture*'s number; refused in decision eorum. Recorded here only as the stylist's wording: 'As exaltações de Deus em suas gargantas'.", "from": "stylist"})
# that appended option has no distinct form; replace with a proper one on the eorum decision instead
dec['exalt']['options'].pop()
for x in d['decisions']:
    if x['id'] == 'eorum':
        x['options'].append({"label": "em suas gargantas … em suas mãos", "forms": {"manibus": "em suas mãos"}, "note": "Stylist: plural gargantas (the verse would read 'As exaltações de Deus em suas gargantas'); refused — changes the Latin's singular gútture. Selecting this option changes only the second colon.", "from": "stylist"})

# 149:9 — neles as option from the stylist
j = dec['judicium']
j['options'][2]['from'] = 'stylist'
j['options'][2]['note'] = "*in eis* to the letter; the stylist's request ('plainer, shorter'). Refused: 'fazer neles o juízo' leaves the relation unclear (on them? among them?), where 'sobre eles' is 118:84's build and the ambiguity reader heard it rightly (on the kings and nobles)."

d['version'] = 2
d['choices']['149:6'] = d['choices']['149:6'].replace("The two *eórum* are 'sua … suas'.", "The two *eórum* are 'deles … deles' (v2; decision eorum).")
d['choices']['149:3'] += " 'saltério' and 'tamborim' were unknown to the ambiguity reader; kept (glossary rows, instruments the Latin names)."
d['choices']['149:7'] += " The second colon is verbless as in the Latin; the ambiguity reader found it could sound incomplete but heard it rightly ('castigar os povos'). 'vingança' was heard as 'vingar-se das nações' — the Latin's word, kept unsoftened."
d['choices']['149:8'] = d['choices']['149:8'] + " 'grilhões' was unknown to the ambiguity reader; kept (104:18, the concrete image)."

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "1 minor (149:6 possessive); taken. Overall: close, faithful, tense/mood/number/person match.",
     "outcomes": [{"verse": "149:6", "remark": "'na sua garganta' can be read as God's throat; eórum is the saints'", "outcome": "taken", "decision": "eorum"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "4 remarks; 2 taken (149:5, 149:6 possessive), 1 taken in another form (149:3 proclisis instead of 'cantem-lhe'), 1 refused as option (149:9 neles). Best line 149:1, worst 149:6.",
     "outcomes": [
         {"verse": "149:3", "remark": "'entoem-lhe salmos' stiff; proposes 'cantem-lhe salmos'", "outcome": "option", "decision": "psallant", "reason": "The stiffness is answered by proclisis 'lhe entoem salmos'; 'cantem' refused because psállere is entoar salmos (D25) and cantáre stands in 149:1."},
         {"verse": "149:5", "remark": "mesóclise antiquated; proposes 'hão de alegrar-se em seus leitos'", "outcome": "taken", "decision": "cubil", "reason": "Taken with the article kept: 'hão de alegrar-se nos seus leitos'."},
         {"verse": "149:6", "remark": "'sua garganta' heard as God's; proposes 'em suas gargantas … em suas mãos'", "outcome": "taken", "decision": "eorum", "reason": "The fault taken, by the Latinist's fix 'na garganta deles'; the plural 'gargantas' refused (changes gútture's number), kept as option."},
         {"verse": "149:9", "remark": "'fazerem sobre eles' wordy; proposes 'neles'", "outcome": "refused", "decision": "judicium", "reason": "'fazer neles o juízo' leaves the relation unclear; 'sobre eles' is 118:84's build and was heard rightly by the ambiguity reader."}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "19 readings listed; the likely hearing is right in every verse. One fault shared with the other readers (149:6 'sua' → God's throat as a possible reading) mended. Unknown words: saltério, tamborim, gumes, grilhões, exaltações — all kept (glossary rows or the Latin's concrete words).",
     "outcomes": [
         {"verse": "149:6", "remark": "'na sua garganta' could be God's", "outcome": "taken", "decision": "eorum"},
         {"verse": "149:1", "remark": "verbless colon may confuse; 'o seu' could be 'vosso'", "outcome": "refused", "decision": "copula", "reason": "Likely hearing was right (the Lord's praise in the assembly); the verbless clause is the Latin's."},
         {"verse": "149:7", "remark": "verbless second colon may sound incomplete", "outcome": "refused", "reason": "The Latin's ellipsis; heard rightly."},
         {"verse": "149:6", "remark": "'exaltações' may sound strange / unknown", "outcome": "refused", "decision": "exalt", "reason": "The noun of exaltar; 'louvores' would merge it with laus (149:1, 3). Options kept."},
         {"verse": "149:3", "remark": "saltério, tamborim unknown", "outcome": "refused", "reason": "Instruments the Latin names; glossary rows."},
         {"verse": "149:8", "remark": "grilhões unknown", "outcome": "refused", "reason": "The concrete image (104:18); 'correntes' would be vaguer."}
     ]},
    {"step": "revision", "version": 2, "note": "v2: 149:3 'lhe entoem salmos' (proclisis; stylist's stiffness, D25 kept); 149:5 'hão de alegrar-se nos seus leitos' (stylist); 149:6 'na garganta deles … nas mãos deles' (Latinist + stylist). Draft 1 kept as prayed.v1.json. Script: draft2.py."}
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
