"""Ps 148 draft 2 from the v1 readers. python3.13 research/psalterium/ps148/revise_v2.py"""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['148:4'] = 'Louvai-o, céus dos céus: * e todas as águas {supercaelos} louvem o nome do Senhor.'
V['148:14a'] = '{confessio} {superterram}: * e exaltou o chifre do seu povo.'
dec = {x['id']: x for x in d['decisions']}

d['decisions'].append({
    "id": "supercaelos", "refs": ["148:4", "148:14a"], "latin": "quæ super cælos sunt … super cælum et terram", "kind": "order",
    "why": "The stylist (v1) found the relative *que estão sobre os céus* prosy and long before the main verb *louvem*, and heard *confissão … sobre o céu e a terra* as 'a confession about heaven and earth'. Both taken: the relative clause with its copula becomes a prepositional phrase (grammar, D2 — the waters are still located above the heavens, nothing added or lost), and *acima de* for *super* in both places of the psalm, so 148:4 and 148:14a say the same preposition as the Latin does. *acima de* cannot be heard as 'about'. Cost: elsewhere *super cælos* is *sobre os céus* (8:2b, 56:6, 107:5), where no 'about' reading threatens; the Benedicite's *aquæ omnes, quæ super cælos sunt* (Dan 3:59) should decide with this line in view.",
    "options": [
        {"label": "acima dos céus … acima do céu e da terra", "forms": {"supercaelos": "acima dos céus", "superterram": "está acima do céu e da terra"}, "note": "Ruling (v2): the stylist's.", "from": "stylist"},
        {"label": "que estão sobre os céus … está sobre o céu e a terra", "forms": {"supercaelos": "que estão sobre os céus", "superterram": "está sobre o céu e a terra"}, "note": "Draft 1: the Latin's relative, *sobre* as 8:2b.", "from": "draft"}
    ]})

c = dec['confessio']
for o in c['options']:
    o['label'] = o['label'].replace(' está', '')
    o['forms']['confessio'] = o['forms']['confessio'].replace(' está', '')
c['why'] += " v1 readers: the Latinist passed it; the stylist and the ambiguity reader both heard the confessional first and did not know *confissão* as praise — the cost named at 95:6, 103:1b and 110:3, now met a fourth time. Held, for Gustavo to decide the four together; the stylist himself kept the word and only moved the preposition (taken, `supercaelos`)."

f = dec['facta']
f['options'][1]['from'] = 'stylist'
f['options'][1]['note'] = "Draft 1 of 32:9 and the stylist's v1 proposal here ('the Portuguese can be bare too'); MS1932's verb *mandou* is in this option only by its first form — the stylist kept *ordenou*. Refused: 32:9's stylist asked the opposite and got it; the twins must read alike (rule 6)."
f['options'].insert(1, {"label": "foram feitas … ordenou … foram criadas", "forms": {"facta": "foram feitas", "mandavit": "ordenou", "creata": "foram criadas"}, "note": "The stylist (v1): bare, *ordenou* kept. Would part the twins 32:9 / 148:5.", "from": "stylist"})

pr = dec['praeteribit']
pr['options'].append({"label": "pôs uma lei, e não passará", "forms": {"praeteribit": "não passará"}, "note": "The stylist (v1) wants *lei* for *decreto* ('bureaucratic'). Refused: *præcéptum → decreto* is settled (D19) and *lei* is *lex*'s word. Recorded here; the word itself lives in the D19 row.", "from": "stylist"})

s = dec['spiritus']
s['options'].insert(1, {"label": "vento das tempestades", "forms": {"spiritus": "vento das tempestades"}, "note": "The stylist (v1): the article makes it a named power, not a label. Refused for rule 6: 10:7 has the same Latin words bare. If taken, 10:7 should move with it.", "from": "stylist"})

h = dec['hymnus']
for o in h['options']:
    o['forms']['filiis'] = o['forms']['filiis'].replace('que se aproxima dele', 'que dele se aproxima')
    o['label'] = o['label'].replace('que se aproxima dele', 'que dele se aproxima')
h['why'] += " v2: the stylist's order *o povo que dele se aproxima* taken (the line no longer dies on *dele*; order only). The ambiguity reader heard the hymn as addressed to the saints first and *santos* as the canonized; the other readings were in his list too — the openness the Latin has."

d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "Claude Opus 5.5, fresh context. No remarks: every tense, voice, number and person kept; the supplied *as coisas* and *está* named as the only additions, as grammar.", "outcomes": []})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "Claude Opus 5.5, fresh context. Seven remarks on six verses; best line 148:3, worst 148:14a. Three taken (order and grammar), three refused and kept as options (each would break a formula or a settled word), one was advice to keep.", "outcomes": [
    {"verse": "148:4", "remark": "relative 'que estão sobre os céus' prosy and long", "outcome": "taken", "decision": "supercaelos", "reason": "grammar: a relative clause with copula becomes a prepositional phrase"},
    {"verse": "148:5", "remark": "'as coisas' is paraphrase; go bare", "outcome": "option", "decision": "facta", "reason": "32:9 is the same Latin and took 'as coisas' from its own stylist; rule 6"},
    {"verse": "148:6", "remark": "'pôs um decreto' bureaucratic; 'lei'", "outcome": "option", "decision": "praeteribit", "reason": "præcéptum → decreto settled (D19); lei is lex's"},
    {"verse": "148:8", "remark": "'vento das tempestades' with the article", "outcome": "option", "decision": "spiritus", "reason": "10:7 has the same Latin words, bare; rule 6"},
    {"verse": "148:14a", "remark": "'confissão … sobre' heard as 'about'; 'acima de'", "outcome": "taken", "decision": "supercaelos"},
    {"verse": "148:14a", "remark": "'chifre' comic connotation; keep it", "outcome": "refused", "reason": "he asks for no change; the cornu row keeps the image everywhere"},
    {"verse": "148:14b", "remark": "ends on weak 'dele'; 'que dele se aproxima'", "outcome": "taken", "decision": "hymnus"}
]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "Claude Opus 5.5, fresh context, Portuguese only. 26 ambiguities, 4 unknown words. No wrong first hearing that the Latin does not share, except the known costs: *poderes* heard as abstract (as at 102:21), *confissão* heard as sin confessed (as at 95:6, 103:1b, 110:3), *chifre* heard literally or as the cuckold (the cornu row). *desde os céus* heard rightly ('those in the heavens, praise'). 148:12: he heard *Jovens e virgens* as part of the subject of *louvem* — the Greek puts all of 148:11–12 before αἰνεσάτωσαν, so that reading is the Latin's too; kept.", "outcomes": [
    {"verse": "148:2", "remark": "'poderes' heard abstract", "outcome": "refused", "reason": "D43 / 102:21 formula; 'exércitos' kept as option", "decision": "virtutes"},
    {"verse": "148:7", "remark": "'dragões' heard as fairy-tale dragons", "outcome": "refused", "reason": "the Latin's word (δράκοντες); 73:13", "decision": "dracones"},
    {"verse": "148:12", "remark": "'Jovens e virgens' heard as subject of 'louvem'", "outcome": "refused", "reason": "an ambiguity the Latin and Greek share"},
    {"verse": "148:14a", "remark": "'confissão' heard as sin confessed; unknown as praise", "outcome": "refused", "reason": "the three twins' ruling; for Gustavo together", "decision": "confessio"},
    {"verse": "148:14a", "remark": "'chifre' literal / insult", "outcome": "refused", "reason": "cornu row: the image stays, unexplained, as in the Latin"},
    {"verse": "148:14b", "remark": "hymn heard as addressed to the saints", "outcome": "refused", "reason": "the Latin datives are open the same way; 'para' keeps the widest reading", "decision": "hymnus"}
]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 148:4 *e todas as águas acima dos céus* and 148:14a *está acima do céu e da terra* (new decision `supercaelos`, stylist); 148:14b *o povo que dele se aproxima* (stylist, order). Refused stylist proposals added as options in `facta`, `praeteribit`, `spiritus`. Draft 1 kept as prayed.v1.json."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
