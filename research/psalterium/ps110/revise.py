"""Ps 110 draft 2: apply the v1 readers' outcomes to prayed.json (prayed.v1.json kept)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text())
assert d['version'] == 1

d['version'] = 2
d['status'] = 'reviewed'

dec = {x['id']: x for x in d['decisions']}

ex = dec['exquisita']
ex['why'] += (
    ' **Draft 2:** the Latinist (v1, minor) found that *segundo* settles the open *in* + accusative on "according to", '
    'and asked for bare *em*; taken — the Latin leaves open whether the works are sought out in, for, or according to '
    'all his wills, and *em* keeps that. The stylist called the colon the worst line (*procuradas* heard as "in demand", '
    'the colon hard to parse) and asked *primorosas segundo*: refused and kept as an option — *primorosas* takes the '
    'adjectival sense of the participle ("choice, exquisite", which L&S does give) and drops the seeking that the Latin '
    'and the Greek ἐξεζητημένα both carry, and *segundo* is the closing the Latinist refused. The ambiguity reader heard '
    'the colon as vague — the Latin is.'
)
ex['options'] = [
    {"label": "procuradas em", "forms": {"exquisita": "procuradas em"},
     "note": "Ruling (draft 2): the row's verb; *in* left open, as the Latinist asked.", "from": "latinist"},
    {"label": "procuradas segundo", "forms": {"exquisita": "procuradas segundo"},
     "note": "draft 1; DRB 'according to' — closes the preposition, which the Latinist called defensible.", "from": "draft"},
    {"label": "primorosas segundo", "forms": {"exquisita": "primorosas segundo"},
     "note": "the stylist's: parses at once; takes the 'exquisite' sense of the participle and loses the seeking.", "from": "stylist"},
    {"label": "proporcionadas a", "forms": {"exquisita": "proporcionadas a"},
     "note": "MS1932: the sense 'fitted to' made explicit — an interpretation of the participle.", "from": "MS1932"},
    {"label": "buscadas em", "forms": {"exquisita": "buscadas em"},
     "note": "*buscar* is *quǽrere*'s verb; refused for the row.", "from": "draft"},
]

cg = dec['congregatione']
cg['why'] += (
    ' **Readers (v1):** the stylist heard *coração / congregação* as a loud rhyme and *congregação* as bureaucratic, and '
    'asked *e na assembleia*: refused — *assembleia* is *ecclésia*\'s (D34), and the rhyme is the price of two rulings '
    '(the 9:2a formula and the row); kept as an option. The ambiguity reader heard *conselho* first as advice — D33 keeps '
    '*conselho* where the Latin can mean both; accepted.'
)
cg['options'].append({"label": "no conselho dos justos, e na assembleia", "forms": {"congregatione": "no conselho dos justos, e na assembleia"},
                      "note": "the stylist's: breaks the rhyme; spends *ecclésia*'s word (D34).", "from": "stylist"})

v3 = dec['v3a']
v3['why'] += (
    ' **Readers (v1):** the stylist asked *Louvor* (the sense is praise) and the ambiguity reader heard the sacrament first — '
    'the cost already named at 95:6 and 103:1b. Refused for those rulings and for *laudátio → louvor* in 110:10b; '
    'Gustavo decides the three twins together.'
)
for o in v3['options']:
    if o['label'].startswith('Louvor'):
        o['from'] = 'stylist'
        o['note'] = "the stylist's (and DRB *praise*); refused: *louvor* is *laudátio*'s in 110:10b (and *laus*'s), and breaks the twin rulings of 95:6 / 103:1b."

it = dec['intellectus']
it['why'] += (
    ' **Ambiguity reader (v1):** *os que o praticam* has an unclear antecedent (fear, wisdom, commandments) — the Latin\'s '
    '*eum* is as open, and is kept so; *Bom entendimento* was heard with "a real chance" of "getting along well" — '
    'the row\'s word (31:8–9) is kept, *inteligência* (MS1932, DM1962 elsewhere) would take *intellígere*\'s family.'
)

d['verses']['110:2'] = d['verses']['110:2']  # slot unchanged; option 0 changed

d['choices']['110:2'] = d['choices']['110:2'] + ' Draft 2: *segundo* → *em* (Latinist; decision `exquisita`).'
d['choices']['110:9b'] += ' The ambiguity reader heard *terrível* partly as "horrible" and *temor* as being afraid of God — both the rows\' known costs (D43; *timor → temor*), kept.'

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
     "note": "One minor; taken. Tenses, persons, supplied copulas and pointing all passed.",
     "outcomes": [
         {"verse": "110:2", "remark": "*segundo* settles the open *in* + accusative; bare *em* keeps it open", "outcome": "taken"}
     ]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "model": "claude-opus-5-5 (fresh context, with latin.json)",
     "note": "Three remarks, all on the opening verses; best line 110:9b, worst 110:2. None taken as it stands: each swaps a word under a ruling or takes another sense; all three kept as options.",
     "outcomes": [
         {"verse": "110:1", "remark": "rhyme coração / congregação; *congregação* bureaucratic → *assembleia*", "outcome": "option", "decision": "congregatione",
          "reason": "*assembleia* is *ecclésia*'s (D34); the rhyme is fixed by the 9:2a formula and the row"},
         {"verse": "110:2", "remark": "*procuradas* opaque, colon does not parse → *primorosas segundo*", "outcome": "option", "decision": "exquisita",
          "reason": "takes the adjectival 'exquisite' sense and drops the seeking of *exquisíta* / ἐξεζητημένα; *segundo* is the closing the Latinist refused"},
         {"verse": "110:3", "remark": "*Confissão* heard as the sacrament → *Louvor*", "outcome": "option", "decision": "v3a",
          "reason": "95:6 / 103:1b twins rule *confissão*; *louvor* is *laudátio*'s in 110:10b"}
     ]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "model": "claude-opus-5-5 (fresh context)",
     "note": "Fifteen readings, two unknown words (*magnificência*, *equidade* — both rows' known costs, kept). Nothing heard that the Latin excludes except the row costs below; no change made.",
     "outcomes": [
         {"verse": "110:1", "remark": "*conselho* heard as advice; whose congregation unclear", "outcome": "refused", "reason": "D33 keeps *conselho* where the Latin can mean both; the Latin leaves the congregation's owner open (decision congregatione)"},
         {"verse": "110:2", "remark": "colon vague", "outcome": "refused", "reason": "the Latin is open; draft 2 keeps it so (decision exquisita)"},
         {"verse": "110:3", "remark": "*Confissão* heard as the sacrament", "outcome": "option", "decision": "v3a", "reason": "as the stylist's remark"},
         {"verse": "110:4", "remark": "subject known only at *o Senhor*", "outcome": "refused", "reason": "the Latin's own order; the apposition is the ruling (decision dominus4)"},
         {"verse": "110:7", "remark": "*lhes* could be heard as the nations", "outcome": "refused", "reason": "*illis* refers back to *pópulo suo* at the end of 110:5b, as heard most likely"},
         {"verse": "110:9b", "remark": "*terrível* heard partly as 'horrible'; *temor* as being afraid", "outcome": "refused", "reason": "D43 and the *timor* row; the Latin's words"},
         {"verse": "110:10b", "remark": "antecedent of *o* unclear; *Bom entendimento* as 'getting along'", "outcome": "refused", "reason": "*eum* is open in the Latin; *entendimento* is the row's word (31:8–9)"},
         {"verse": "110:3, 110:8", "remark": "unknown: *magnificência*, *equidade*", "outcome": "refused", "reason": "the rows keep them (known costs, listed in the glossary)"}
     ]},
    {"step": "revision", "version": 2,
     "note": "v2: one wording change, 110:2 *procuradas segundo* → *procuradas em* (Latinist). prayed.v1.json kept. Stylist and ambiguity proposals recorded as options. Latinist gate owed on v2."}
]

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
