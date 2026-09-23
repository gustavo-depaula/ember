"""ps086 draft 2 from draft 1 (prayed.v1.json) after the v1 readers."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
v = d['verses']
v['86:4b'] = 'Eis os estrangeiros, e Tiro, e {aethiopum}, * estes ali {fuerunt}.'
v['86:6'] = 'O Senhor narrará {scripturis} {populorum}: * {horum} {fuerunt6} nela.'
dec = {x['id']: x for x in d['decisions']}


def front(did, label):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


front('horum', 'daqueles que')
dec['horum']['options'][0]['note'] = "Ruling (v2): the stylist's request — 'destes' after a comma hung loose, and the ambiguity reader heard an unclear fragment. Both readings (apposition to the princes, or a new group) survive. Cost: 'these' becomes 'those'. DRB 'of them that'."
dec['horum']['options'][0]['from'] = 'stylist'
dec['horum']['options'][1]['note'] = "Draft 1: 'hic' as 'este', the relative after a comma; heard as Latin carried over."
front('sicut', 'Como de')
dec['sicut']['options'][0]['note'] = "Ruling (v2): the stylist's; no supplied pronoun, as the Latin. Read as Portuguese 'é de' (belongs to): the dwelling in thee is as the dwelling of all who rejoice. One syllable shorter."
dec['sicut']['options'][0]['from'] = 'stylist'
dec['sicut']['options'][1]['note'] = "Draft 1: the supplied pronoun 'a'; the stylist and the ambiguity reader both heard a word missing before anything was named."
dec['habitatio']['options'][1]['note'] = "The stylist's request (v1): plainer. Refused: morada is habitáculum's (D44), and the habitátio row keeps habitação."
dec['habitatio']['options'][1]['from'] = 'stylist'
new = {
    "id": "populorum", "refs": ["86:6"], "latin": "populórum, et príncipum",
    "kind": "order",
    "why": "The stylist asked to swap the pair so the mediant does not fall on the proparoxytone 'príncipes'. Refused: the order of the list is the Latin's, and 'príncipum' stands next to 'horum, qui fuérunt in ea' across the asterisk — in the Greek τούτων belongs to the rulers, so moving them away weakens the one reading the Greek makes plain. The Latin's mediant is a proparoxytone too.",
    "options": [
        {"label": "dos povos e dos príncipes", "forms": {"populorum": "dos povos e dos príncipes"}, "note": "Ruling: the Latin's order.", "from": "draft"},
        {"label": "dos príncipes e dos povos", "forms": {"populorum": "dos príncipes e dos povos"}, "note": "The stylist: an oxytone-free paroxytone mediant; the list reversed.", "from": "stylist"},
    ],
}
i = [x['id'] for x in d['decisions']].index('horum')
d['decisions'].insert(i, new)
d['version'] = 2
d['status'] = 'reviewed'
d['choices']['86:4b'] += " v2: 'estes ali estiveram' (the stylist's order, keeping ali for illic as 13:5): 'estes estiveram' ran es-tes es-ti- together before the cadence."
d['choices']['86:5'] += " The ambiguity reader heard 'Acaso Sião dirá' as a question expecting 'no', which inverts the sense of the verses around it — the known cost of the numquid row (7:12), sharper here; the Latin's numquid has the same formal lean. Held; 'Acaso não dirá Sião' (DRB, MS1932) is option 2 — for Gustavo. He also heard 'um homem e outro homem' as two particular men: the Latin's image, as DRB's 'this man and that man'; kept."
d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No remarks: the copula, the genitives of 86:4 and 86:7, the doubled homo and the tenses all passed.", "outcomes": []},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. Five remarks; best line 86:3, worst 86:7. Three taken (86:4b order, 86:6 daqueles, 86:7 Como de), two refused and kept as options.", "outcomes": [
        {"verse": "86:4b", "remark": "estes estiveram ali: es-tes es-ti- run together; 'estes lá estiveram'", "outcome": "taken", "reason": "Order taken; 'ali' kept for illic (13:5) rather than 'lá'."},
        {"verse": "86:6", "remark": "proparoxytone mediant 'príncipes'; swap to 'dos príncipes e dos povos'", "outcome": "option", "decision": "populorum", "reason": "The Latin's order and mediant; 'príncipum' next to 'horum' keeps the Greek's reading."},
        {"verse": "86:6", "remark": "'destes' hangs loose; 'daqueles que'", "outcome": "taken", "decision": "horum"},
        {"verse": "86:7", "remark": "'Como a de' sounds like a missing word; 'Como de'", "outcome": "taken", "decision": "sicut"},
        {"verse": "86:7", "remark": "'habitação' bureaucratic; 'morada'", "outcome": "option", "decision": "habitatio", "reason": "morada is habitáculum's (D44); the habitátio row keeps habitação."},
    ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese only. Sixteen readings; unknown: Raab, Tiro, Sião (proper names, kept). Most are the Latin's own openness (whose foundations, who speaks in 86:4, where 'ali' is, what 'escrituras' are).", "outcomes": [
        {"verse": "86:1", "remark": "'Os seus fundamentos' heard as the Lord's", "outcome": "refused", "decision": "ejus", "reason": "The Latin's ejus is as open; 'dela' would decide."},
        {"verse": "86:1", "remark": "'tendas de Jacó' heard as literal tents", "outcome": "refused", "reason": "The Latin's image (tabernáculum → tenda, row)."},
        {"verse": "86:4", "remark": "speaker of 'Eu me lembrarei' unclear; 'que me conhecem' unclear", "outcome": "refused", "reason": "The Latin does not name the speaker; the genitive agrees with the names as the Latin's does."},
        {"verse": "86:5", "remark": "'Acaso Sião dirá' heard as expecting 'no', inverting the sense", "outcome": "option", "decision": "numquid", "reason": "The numquid row and the Latin's particle; the 'não' of DRB and MS1932 is option 2, flagged for Gustavo."},
        {"verse": "86:5", "remark": "'um homem e outro homem' heard as two particular men", "outcome": "refused", "decision": "homo", "reason": "The Latin's doubled homo; explaining it (MS1932) is refused by rule 2."},
        {"verse": "86:6", "remark": "'destes, que estiveram nela' an unclear fragment", "outcome": "taken", "decision": "horum"},
        {"verse": "86:6", "remark": "'escrituras' heard as Holy Scripture or writings by the peoples", "outcome": "refused", "decision": "scripturis", "reason": "The Latin's word carries the same range."},
        {"verse": "86:7", "remark": "'Como a de …' hard to parse aloud", "outcome": "taken", "decision": "sicut"},
        {"verse": "86:7", "remark": "'em ti' heard as God", "outcome": "refused", "reason": "The te is the city of 86:3; in this psalter God is vós, so 'ti' already points away from him."},
    ]},
    {"step": "revision", "version": 2, "note": "v2 (revise2.py from prayed.v1.json): 86:4b order 'estes ali estiveram'; 86:6 'daqueles que'; 86:7 'Como de'; new decision populorum recording the refused swap."},
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
