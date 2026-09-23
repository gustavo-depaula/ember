"""ps101 draft 2: the v1 readers' remarks, taken or kept as options. Reads prayed.v1.json, writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
V = d['verses']
d['version'] = 2
d['status'] = 'draft'


def front(decId, label):
    opts = dec[decId]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(i))


# 101:3 — the future subjunctive (stylist; grammar, D2)
front('tribulor', 'eu estiver atribulado')
dec['tribulor']['options'][0]['note'] = 'Ruling (v2, the stylist): the future subjunctive, as 3b *em que vos invocar* — the two verses now run in parallel. MS1932 *me achar atribulado*.'
dec['tribulor']['options'][0]['from'] = 'stylist'
dec['tribulor']['options'][1]['note'] = 'Draft 1: 68:18\'s form; the stylist heard it as translated after *qualquer dia em que*.'
dec['tribulor']['why'] += ' v2: the stylist asked for the future subjunctive, which is how Portuguese says it and matches 3b; taken (grammar, D2).'

# 101:6 — stylist's aderir kept as an option
dec['os']['options'].append({"label": "os meus ossos aderiram à minha carne", "forms": {"os": "os meus ossos aderiram à minha carne"}, "note": "The stylist (v1): *colar-se* calls up glue; MS1932's verb in the *adhærére* row. Refused: the row proposes *colar-se* for a body part (21:16), and the ambiguity reader heard the image rightly (skin and bones).", "from": "stylist"})
dec['os']['why'] += ' v1: the Latinist (minor) asked for the singular — refused for the reason above, and it stays option 2; the stylist asked *aderiram* — refused for the row, option.'

# 101:9 — order (stylist)
V['101:9'] = 'O dia todo me afrontavam os meus inimigos: * e {jurabant} os que me louvavam.'
d['choices']['101:9'] += ' v2: the second colon in the stylist\'s order (*e juravam contra mim os que me louvavam*), breaking the jingle *louvavam juravam*; order only (D2).'

# 101:11 — two finite verbs (stylist; grammar), with eleváre's verb
V['101:11'] = '{afacie} da vossa ira e indignação: * porque me elevastes e {allisisti}.'
dec['allisisti']['why'] = dec['allisisti']['why'].replace("*elevando-me* keeps the participle with *eleváre*'s own verb", "v2: *élevans* becomes a finite verb, *me elevastes e …*, at the stylist's request (the gerund with *-me, me* tripped the tongue) — grammar, D2; the order lift-then-throw stays. *elevar* is *eleváre*'s own verb (the stylist's *erguestes* refused for that)")

# 101:14 — finite verb (stylist; grammar)
V['101:14'] = 'Vós vos levantareis e tereis piedade de Sião: * porque é tempo de ter piedade dela, porque {venit} o tempo.'
d['choices']['101:14'] = d['choices']['101:14'].replace('*exsúrgens → levantando-vos*', '*exsúrgens* → *vos levantareis e* (v2, the stylist: *Vós, levantando-vos* stumbles on *vós / vos*; the participle made a finite verb, grammar, D2; the row\'s *levantar-se*)')

# 101:15 — stylist's sua refused
dec['terraejus']['options'][1]['note'] = 'The stylist (v1): smoother, and Sião is the only referent. Refused: after *os vossos servos* the ear takes *sua* as theirs; the ambiguity reader already could not tell whose pity it was.'
dec['terraejus']['options'][1]['from'] = 'stylist'

# 101:19 — Latinist's em refused
dec['altera']['options'][1]['note'] = 'The Latinist (v1, minor): the Latin\'s *in* + ablative. Refused: *escritas em outra geração* is heard as written later, by others; the Greek εἰς and DRB \'unto\' give *para*.'
dec['altera']['options'][1]['from'] = 'latinist'

# 101:23 — in unum
V['101:23'] = 'Quando os povos se reunirem {inunum}, * e os reis, para servirem ao Senhor.'
d['decisions'].insert(next(i for i, x in enumerate(d['decisions']) if x['id'] == 'virtutis'), {
    "id": "inunum", "refs": ["101:23"], "latin": "In conveniéndo pópulos in unum", "kind": "glossary",
    "why": "The formula of 2:2 and 47:5 (*convenérunt in unum* → *se reuniram juntos*; the *in unum* row names 101:23). The stylist (v1) heard a pleonasm and asked *num só* — the same objection the Ps 47 stylist raised, refused there for the formula; *num só* states a unity the Latin only allows (the Latinist's reason at 2:2).",
    "options": [
        {"label": "juntos", "forms": {"inunum": "juntos"}, "note": "Ruling: the row, as 2:2 and 47:5.", "from": "glossary"},
        {"label": "num só", "forms": {"inunum": "num só"}, "note": "The stylist (v1).", "from": "stylist"}]})

# 101:24 — fewness as a clause (stylist)
dec['paucitatem']['options'].insert(0, {"label": "Anunciai-me quão poucos são os meus dias", "forms": {"paucitatem": "Anunciai-me quão poucos são os meus dias"}, "note": "Ruling (v2, the stylist): the fewness said as a clause — the count kept, the noun turned into grammar (as D16).", "from": "stylist"})
dec['paucitatem']['options'][1]['note'] = 'Draft 1; the stylist heard an arithmetic report.'
dec['paucitatem']['why'] += ' v2: the stylist\'s *quão poucos são* taken — it keeps fewness (not length) and only changes the grammar.'

# 101:25 — no meio (stylist)
V['101:25'] = '{revoces} {dimidio} dos meus dias: * de geração em geração {anni}.'
d['decisions'].insert(next(i for i, x in enumerate(d['decisions']) if x['id'] == 'anni'), {
    "id": "dimidio", "refs": ["101:25"], "latin": "in dimídio diérum meórum", "kind": "word",
    "why": "*dimídium* is the half and the middle (L&S; ἐν ἡμίσει); DRB 'in the midst'. The stylist (v1) found *na metade* measured and colloquial and asked *no meio*, which is the plainer of two faithful words (Portuguese *meio* is also half); taken. *dimidiáre → chegar à metade* (D44) keeps the root elsewhere.",
    "options": [
        {"label": "no meio", "forms": {"dimidio": "no meio"}, "note": "Ruling (v2, the stylist); DRB 'midst'.", "from": "stylist"},
        {"label": "na metade", "forms": {"dimidio": "na metade"}, "note": "Draft 1; MS1932. The exact half.", "from": "MS1932"}]})

# 101:26 — No princípio refused
dec['initio']['options'][1]['note'] = 'The stylist (v1): plainer and liturgical, the echo of creation. Refused for the row: that echo is *In princípio*, a different Latin word, which 118:152/160 keep apart. MS1932.'
dec['initio']['options'][1]['from'] = 'stylist'

# 101:28 — ipse
dec['idem']['options'].append({"label": "o mesmo, vós mesmo", "forms": {"idem": "o mesmo, vós mesmo"}, "note": "The Latinist (v1, minor): *ipse* intensifies. Refused: *idem ipse* renders the Greek ὁ αὐτός, one idea; the doubled Portuguese is heavy and breaks the colon.", "from": "latinist"})

# 101:29 — guiada refused
dec['dirigetur']['options'].append({"label": "será guiada", "forms": {"dirigetur": "será guiada"}, "note": "The stylist (v1): *dirigida* sounds administrative. Refused: *guiar* is *dedúcere*'s (D22); the *dirígere* row keeps *dirigir*.", "from": "stylist"})

d['audit'] += [
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5, fresh context, with latin.json. No major; three minors, all refused and kept as options.",
     "outcomes": [
         {"verse": "101:6", "remark": "os meum singular: o meu osso se colou", "outcome": "option", "decision": "os", "reason": "the singular is heard as one particular bone; number is grammar (D2, D29)"},
         {"verse": "101:19", "remark": "in + ablative: em outra geração", "outcome": "option", "decision": "altera", "reason": "heard as written later by others; the Greek εἰς, DRB 'unto'"},
         {"verse": "101:28", "remark": "idem ipse: o mesmo, vós mesmo", "outcome": "option", "decision": "idem", "reason": "idem ipse renders ὁ αὐτός; the doubled Portuguese is heavy"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5, fresh context, with latin.json. 11 remarks: 6 taken (grammar and order, or the plainer faithful word), 5 refused and kept as options. Best line 101:28, worst 101:14 (now rewritten).",
     "outcomes": [
         {"verse": "101:3", "remark": "future subjunctive: eu estiver atribulado", "outcome": "taken"},
         {"verse": "101:6", "remark": "colaram → aderiram", "outcome": "option", "decision": "os", "reason": "the adhærére row keeps colar-se for a body part (21:16)"},
         {"verse": "101:9", "remark": "jingle -avam: e juravam contra mim os que me louvavam", "outcome": "taken"},
         {"verse": "101:11", "remark": "elevando-me, me: two finite verbs", "outcome": "taken", "decision": "allisisti"},
         {"verse": "101:14", "remark": "Vós, levantando-vos: Vós vos levantareis e", "outcome": "taken"},
         {"verse": "101:15", "remark": "da terra dela → da sua terra", "outcome": "option", "decision": "terraejus", "reason": "sua heard as the servants' own land"},
         {"verse": "101:23", "remark": "reunirem juntos pleonasm → num só", "outcome": "option", "decision": "inunum", "reason": "the in unum formula (2:2, 47:5); num só states a unity the Latin only allows"},
         {"verse": "101:24", "remark": "o pequeno número → quão poucos são", "outcome": "taken", "decision": "paucitatem"},
         {"verse": "101:25", "remark": "na metade → no meio", "outcome": "taken", "decision": "dimidio"},
         {"verse": "101:26", "remark": "No início → No princípio", "outcome": "option", "decision": "initio", "reason": "inítio/princípium kept apart (row, 118:152/160)"},
         {"verse": "101:29", "remark": "dirigida → guiada", "outcome": "option", "decision": "dirigetur", "reason": "guiar is dedúcere's (D22)"}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5, fresh context, Portuguese alone. 34 readings; the hard ones are the Latin's own (101:24 who answers whom; 101:17 whose glory; 101:22 who proclaims). Unknown: desfaleceram/desfalecerão (row, as at 89:9), atribulado, memorial — kept. 101:8 *Vigiei* heard as keeping watch before lying awake; kept, *Velei* stays option. 101:5 *ferido como o feno* heard as vague; *erva* stays option. 101:15 the subject of *terão piedade* unclear — the Latin's too (no subject); kept.",
     "outcomes": [
         {"verse": "101:4", "remark": "desfaleceram unknown", "outcome": "refused", "reason": "the defícere row; the echo with 101:28"},
         {"verse": "101:8", "remark": "Vigiei heard as keeping watch", "outcome": "option", "decision": "vigilavi", "reason": "Velei is heard with velório; the vigil is in the Latin word"},
         {"verse": "101:13", "remark": "memorial unknown / monument", "outcome": "option", "decision": "memoriale", "reason": "the Latin's word; heard rightly as remembrance"},
         {"verse": "101:15", "remark": "subject of terão piedade unclear", "outcome": "refused", "reason": "the Latin names no subject either"}]},
    {"step": "revision", "version": 2, "note": "v2: 101:3 future subjunctive; 101:9 order; 101:11 *porque me elevastes e me derrubastes*; 101:14 *Vós vos levantareis e tereis piedade*; 101:24 *quão poucos são os meus dias*; 101:25 *no meio*. New decisions `inunum`, `dimidio`. Draft 1 kept as prayed.v1.json."}
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print('v2 written')
