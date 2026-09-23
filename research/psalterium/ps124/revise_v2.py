"""Ps 124 draft 2 from draft 1 (prayed.v1.json) after the v1 readers."""
import json
from pathlib import Path

here = Path(__file__).parent
d = json.loads((here / 'prayed.v1.json').read_text())
d['version'] = 2
d['status'] = 'draft'

dec = {x['id']: x for x in d['decisions']}

# sortem: quinhão first
s = dec['sortem']
s['why'] += " v1 readers: the stylist (fails plain) and the ambiguity reader both heard 'a sorte dos justos' as the luck or fate of the just first — a wrong first hearing (D2)."
opts = {o['label']: o for o in s['options']}
q = opts['o quinhão']
q['note'] = "Draft 2. The allotted share, a plain word every Brazilian knows ('o seu quinhão'), free in the glossary; it says what sors (κλῆρος) is here — the lot that fell to the just — without the luck the readers heard. Taken for the stylist's objection, in a word of my own choosing (see 'a partilha')."
q['from'] = 'draft'
a = opts['a sorte']
a['note'] = "Draft 1. The Latin's word, as 30:15 and the CNBB; refused in v2 because both the stylist and the ambiguity reader heard 'luck / fate' first."
p = {"label": "a partilha", "forms": {"sortem": "a partilha"}, "note": "The stylist's proposal. Plain; but it is the act of dividing an estate more than the portion received, and its verb 'partilhar' is distribúere's (D43).", "from": "stylist"}
s['options'] = [q, a, p, opts['a herança']]

# oblig: laços first
o = dec['oblig']
o['why'] += " v1 readers: the Latinist passed 'as amarras'; the stylist found it an odd picture ('mooring ropes', fails plain / native) and asked 'laços'; the ambiguity reader listed 'amarras' as an unknown word and heard it as nautical or as captivity. obligátio occurs only here in the psalter (grep)."
opts = {x['label']: x for x in o['options']}
l = opts['os laços']
l['note'] = "Draft 2, the stylist's proposal. The plainest word for bonds, and in Portuguese it holds ties and snares together — close to L&S's 'ensnaring, entangling' and to the Greek's knots. Cost, accepted: 'laço' is láqueus's word (glossary), and láqueus stands in the very next psalm (123:7); but obligátio is a hapax, the Greek words differ (στραγγαλιά / παγίς), so the merge touches one verse, and a wrong or blank first hearing (D2) is the greater fault."
l['from'] = 'stylist'
am = opts['as amarras']
am['note'] = "Draft 1, passed by the Latinist. Keeps the binding image in a word no other Latin noun holds; but unknown to the ambiguity reader and heard as mooring ropes by the stylist."
o['options'] = [l, am, opts['os enredos'], opts['os caminhos tortuosos']]

# ejus: note the reader
e = dec['ejus']
e['why'] += " v1 ambiguity reader: heard Jerusalem first, with hesitation; listed the dweller, the Lord, and 'seu' as 'your' (você) as other readings. The Latin is as open (bar the last); kept."

# benefac: stylist best line
dec['benefac']['options'][0]['note'] += " The v1 stylist named 124:4 the best line of the psalm."

d['choices']['124:3'] += " v1: the stylist asked 'suas mãos' without the article (a lighter end); refused under rule 5 (the article before possessives). The ambiguity reader heard 'vara' as a stick for beating more than a sceptre: kept, the Latin's concrete image (virga row; 'cetro' is the row's option)."
d['choices']['124:5'] += " v1: the stylist found the first colon too long (about 30 syllables) and asked 'obram' for 'praticam'; refused — the length is the Latin's own (30), the colon cannot be split (rule 4), and 'praticar a iniquidade' is the glossary row. The ambiguity reader noted that 'levará' does not say where; neither does 'addúcet' (Greek ἀπάξει, 'lead away'); kept."
d['choices']['124:1'] += " v1 ambiguity reader: unsure whether 'quem habita em Jerusalém' is the mountain, the one who trusts, or the city's people — the Latin's own openness (Greek ὁ κατοικῶν); kept."

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No remarks: every clause adequate, the copulas and the resumptive 'os' accepted as permitted, 'as amarras' praised for keeping the Latin's image against the Hebrew; marks match.", "outcomes": []},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Four remarks on two verses; best line 124:4, worst 124:5. Two taken (sorte → quinhão, in my word rather than his; amarras → laços), two refused.", "outcomes": [
        {"verse": "124:3", "remark": "'sorte' heard as luck; 'a partilha'", "outcome": "taken", "decision": "sortem", "reason": "the fault taken, with 'o quinhão' rather than 'a partilha' (the portion received, not the act of dividing; partilhar is distribúere's). 'a partilha' kept as an option."},
        {"verse": "124:3", "remark": "'as suas mãos' drags; drop the article", "outcome": "refused", "reason": "rule 5 keeps the article before possessives."},
        {"verse": "124:5", "remark": "'amarras' opaque; 'laços'", "outcome": "taken", "decision": "oblig"},
        {"verse": "124:5", "remark": "colon too long; 'obram' for 'praticam'", "outcome": "refused", "reason": "the Latin colon is as long (30 syllables) and cannot be split (rule 4); 'praticar a iniquidade' is the glossary row."}
    ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Seven items; unknown words 'amarras' and 'vara' as sceptre. Two acted on (sorte, amarras); the rest are the Latin's own openness or its concrete image.", "outcomes": [
        {"verse": "124:1", "remark": "who 'quem habita em Jerusalém' is", "outcome": "refused", "reason": "the Latin's own openness (ὁ κατοικῶν)."},
        {"verse": "124:2b", "remark": "'ao seu redor' has no clear antecedent; 'seu' as 'your'", "outcome": "option", "decision": "ejus", "reason": "the Latin 'ejus' is as open; 'ao redor dela' (the Greek's feminine) stays the option."},
        {"verse": "124:3", "remark": "'vara' heard as a stick for beating, dominion missed", "outcome": "refused", "reason": "the Latin's concrete image (virga row); 'cetro' interprets."},
        {"verse": "124:3", "remark": "'sorte' heard as luck/fate", "outcome": "taken", "decision": "sortem"},
        {"verse": "124:3", "remark": "'estendam as suas mãos à iniquidade' — several readings", "outcome": "refused", "reason": "the likely hearing (doing evil themselves) is the Latin's sense."},
        {"verse": "124:5", "remark": "'amarras' unclear / unknown", "outcome": "taken", "decision": "oblig"},
        {"verse": "124:5", "remark": "'levará' does not say where", "outcome": "refused", "reason": "nor does 'addúcet'; nothing supplied."}
    ]},
    {"step": "revision", "version": 2, "note": "v2: 124:3 'a sorte' → 'o quinhão'; 124:5 'as amarras' → 'os laços'. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the v1 readers read). Script: revise_v2.py."},
    {"step": "checks", "note": "Draft 2: hard pass; the same length flags as draft 1, accepted for the same reasons ('o quinhão' is the same length as 'a sorte'). No rhyme or cadence flags."}
]

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
