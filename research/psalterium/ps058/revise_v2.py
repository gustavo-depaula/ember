"""Draft 2 of Ps 58: readers' remarks on v1 applied (see audit)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
v = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 58:10, 58:18: vocative before the verb, as the Latin (quia, Deus, suscéptor meus es) — stylist
for k in ('58:10', '58:18'):
    v[k] = v[k].replace('porque vós sois, Deus, o meu amparo', 'porque vós, Deus, sois o meu amparo')

# 58:7 = 58:15: mediant moved off 'cães' — stylist (order only)
for k, s in (('58:7', 'famem7'), ('58:15', 'famem15')):
    v[k] = v[k].replace('{%s} como cães,' % s, '{%s},' % s)
f = dec['famem']
f['why'] += ' **v2:** the stylist heard four nasal -ão/-ães beats with the mediant on *cães*; the order is turned (*e como cães passarão fome*) so the mediant falls on *fome* — order only (D2); his *terão* is not taken (the verb stays *pati*\'s idiom).'
f['options'] = [
    {"label": "como cães passarão fome", "forms": {"famem7": "como cães passarão fome", "famem15": "como cães passarão fome"}, "note": "v2; the stylist's order, draft's verb", "from": "stylist"},
    {"label": "passarão fome como cães", "forms": {"famem7": "passarão fome como cães", "famem15": "passarão fome como cães"}, "note": "draft 1; the Latin's order; mediant on *cães*", "from": "draft"},
    {"label": "como cães terão fome", "forms": {"famem7": "como cães terão fome", "famem15": "como cães terão fome"}, "note": "the stylist's whole line", "from": "stylist"},
    {"label": "padecerão fome como cães", "forms": {"famem7": "padecerão fome como cães", "famem15": "padecerão fome como cães"}, "note": "MS1932", "from": "MS1932"},
]

# 58:4 tomaram
c = dec['ceperunt']
c['why'] += ' **v2:** the stylist found *apanharam* colloquial (a bus, a beating) and the ambiguity reader heard "be beaten" too; *tomaram*, the plainest *cápere*, taken instead. His *prenderam* is refused: *prender* is *comprehéndere*\'s, four verses later in this psalm (58:13).'
c['options'] = [
    {"label": "tomaram", "forms": {"ceperunt": "tomaram"}, "note": "v2; the plainest *cápere*", "from": "draft"},
    {"label": "apanharam", "forms": {"ceperunt": "apanharam"}, "note": "draft 1; DRB *caught*; colloquial for the stylist", "from": "draft"},
    {"label": "prenderam", "forms": {"ceperunt": "prenderam"}, "note": "the stylist's; comprehéndere's verb (58:13) — refused", "from": "stylist"},
]

# 58:5 segui reto
x = dec['direxi']
x['why'] += ' **v2:** the stylist heard *segui direito* as street directions; *segui reto* (his) keeps the straight line and adds the upright one. Taken: the same word-sense, said better.'
x['options'].insert(0, {"label": "segui reto", "forms": {"direxi": "segui reto"}, "note": "v2; the stylist's", "from": "stylist"})

# 58:6b option
x = dec['intende']
x['why'] += ' **v2:** the stylist asked *Aplicai-vos a visitar*; refused, it leaves D3\'s *atender* (kept parallel to *exaudíre* across the psalter). Kept as an option. The ambiguity reader heard a benevolent visit before a judging one — *visitáre* is as open in the Latin.'
x['options'].append({"label": "Aplicai-vos a visitar", "forms": {"intende": "Aplicai-vos a visitar"}, "note": "the stylist's; leaves D3", "from": "stylist"})

# 58:10 precederá option
x = dec['praeveniet']
x['why'] += ' **v2:** the stylist found *se adiantará a mim* bureaucratic and the final *a mim* limp, and asked *me precederá*. Refused for the family (16:13, 20:4 hold *adiantar-se a* after two Latinist rulings); the prævenire row still leaves the friendly places open, so it is option 2 for the coordinator.'
x['options'].insert(1, {"label": "me precederá", "forms": {"praeveniet": "me precederá"}, "note": "the stylist's; plain, but another verb than 16:13, 20:4", "from": "stylist"})

# 58:12 populi — refusal noted
dec['populi']['why'] += ' **v2:** the stylist asked the nominative (*para que o meu povo nunca se esqueça*), calling it the Latin\'s natural reading. Held: *oblivísci* takes the genitive, and the Greek the Latin renders is a genitive object; the nominative plural would be *os meus povos*. His line is option 2 (with *nunca* for *nequándo*).'

# 58:13 delito option
x = dec['delictum']
x['why'] += ' **v2:** the stylist and the ambiguity reader heard *falta* first as "lack". The stylist\'s *delito* is refused: the delíctum row keeps *falta* across the psalter (18:13, 21:2, 24:7), and *delito* is a word of the police report. Option.'
x['options'].append({"label": "O delito … a palavra", "forms": {"delictum": "O delito", "sermonem": "a palavra"}, "note": "the stylist's", "from": "stylist"})

# 58:13b non erunt
v['58:13b'] = v['58:13b'].replace('e deixarão de existir.', '{nonerunt}.')
d['decisions'].append({
    "id": "nonerunt", "refs": ["58:13b"], "latin": "et non erunt", "kind": "word",
    "why": "Draft 1 had *e deixarão de existir* to avoid the rhyme of *e não existirão* with the mediant *consumação*. The Latinist (minor) called it paraphrase (the ceasing is added) and asked *e não existirão*; the stylist heard *deixarão* still chiming with *consumação* and called it clinical, and asked *e não serão mais* (DRB *they shall be no more*). The stylist's is taken: no rhyme, no added verb, and it is how Portuguese says 'they will be no more'. D39's *existir* for *esse* absolute stays the option; there, *e não serei mais* hung and rhymed, here it does neither.",
    "options": [
        {"label": "e não serão mais", "forms": {"nonerunt": "e não serão mais"}, "note": "v2; the stylist's; DRB", "from": "stylist"},
        {"label": "e não existirão", "forms": {"nonerunt": "e não existirão"}, "note": "the Latinist's; D39's verb; rhymes with the mediant", "from": "latinist"},
        {"label": "e deixarão de existir", "forms": {"nonerunt": "e deixarão de existir"}, "note": "draft 1", "from": "draft"},
    ]})
d['choices']['58:13b'] = "*annuntiáre → anunciar* (D41) in the passive. *et non erunt* is decision `nonerunt` (v2)."

# 58:17b factus es
v['58:17b'] = v['58:17b'].replace('Porque vos fizestes', 'Porque {factus}')
d['decisions'].append({
    "id": "factus", "refs": ["58:17b"], "latin": "Quia factus es suscéptor meus", "kind": "glossary",
    "why": "The Latinist (minor) heard *vos fizestes* as an active 'you made yourself' and asked *vos tornastes*. Held: *fazer-se* + predicate is ordinary Portuguese for 'become', and it is how *factus es* is already said in 60:4 (*vos fizestes a minha esperança*) and 117:21, 28b (*vos fizestes salvação para mim*) — one Latin formula, one Portuguese. *vos tornastes* is the option; if taken, those three places move with it.",
    "options": [
        {"label": "vos fizestes", "forms": {"factus": "vos fizestes"}, "note": "as 60:4, 117:21", "from": "glossary"},
        {"label": "vos tornastes", "forms": {"factus": "vos tornastes"}, "note": "the Latinist's", "from": "latinist"},
    ]})

d['choices']['58:10'] = "*quia, Deus, suscéptor meus es* recurs word for word in 58:18 and is identical there: *porque vós, Deus, sois o meu amparo* (*suscéptor → amparo*, D19). v2: the vocative moved before the verb, as the Latin has it, after the stylist heard *sois, Deus, o* stutter in both verses; his *ó* not taken (the psalter's bare vocative, D44). *vós* supplied so that *Deus* is heard as a vocative."
d['choices']['58:7'] = d['choices']['58:7'].replace("Identical to 58:15.", "Identical to 58:15 (both follow decision `famem`).")

d['version'] = 2
d['audit'].append({"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5 (fresh context, read latin.json). Two minors, no major: 'faithful, close'; the Septuagintal readings kept. 58:13b answered by another wording; 58:17b held for the formula.", "outcomes": [
    {"verse": "58:17b", "remark": "vos fizestes reads as active reflexive; vos tornastes", "outcome": "option", "decision": "factus", "reason": "fazer-se is Portuguese for 'become' and is the formula already in 60:4, 117:21, 117:28b"},
    {"verse": "58:13b", "remark": "deixarão de existir adds ceasing; e não existirão", "outcome": "option", "decision": "nonerunt", "reason": "his wording rhymes with the mediant consumação; the stylist's e não serão mais adds no verb and does not rhyme — taken instead"}]})
d['audit'].append({"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5 (fresh context, read latin.json). Nine remarks in eight verses; worst line 58:13b, best 58:17. Five taken (58:5, 58:7 = 58:15 order, 58:10 and 58:18 order, 58:13b), 58:4 answered with another word, four refused and kept as options.", "outcomes": [
    {"verse": "58:4", "remark": "apanharam colloquial; prenderam", "outcome": "refused", "decision": "ceperunt", "reason": "prender is comprehéndere's (58:13); the complaint taken — tomaram replaces apanharam"},
    {"verse": "58:5", "remark": "segui direito = street directions; segui reto", "outcome": "taken"},
    {"verse": "58:6b", "remark": "Aplicai-vos a visitar", "outcome": "option", "decision": "intende", "reason": "leaves D3's atender"},
    {"verse": "58:7", "remark": "-ão/-ães chime at the mediant; e como cães terão fome", "outcome": "taken", "decision": "famem", "reason": "order taken; his terão not taken (passar fome kept) — also 58:15"},
    {"verse": "58:10", "remark": "sois, Deus, o stutters; vós, ó Deus, sois", "outcome": "taken", "reason": "order taken; ó not added (bare vocative, D44)"},
    {"verse": "58:10", "remark": "se adiantará a mim bureaucratic; me precederá", "outcome": "option", "decision": "praeveniet", "reason": "keeps the prævenire family of 16:13, 20:4"},
    {"verse": "58:12", "remark": "the people should be the subject; para que o meu povo nunca se esqueça", "outcome": "option", "decision": "populi", "reason": "oblivísci takes the genitive and the Greek is a genitive object"},
    {"verse": "58:13", "remark": "falta heard as lack; O delito", "outcome": "option", "decision": "delictum", "reason": "the delíctum row keeps falta (18:13, 21:2, 24:7); delito is police language"},
    {"verse": "58:13b", "remark": "rhyme and clinical deixarão de existir; e não serão mais", "outcome": "taken", "decision": "nonerunt"},
    {"verse": "58:18", "remark": "overlong; sois, Deus, o stutter; cantarei salmos", "outcome": "taken", "reason": "the order taken as in 58:10; cantarei salmos refused — psállere is entoar salmos (D25), cantar is cantáre's"}]})
d['audit'].append({"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5 (fresh context). 31 ambiguities, most the Latin's own (the unnamed subjects of 58:7–8 and 58:14, visitáre's judging or kind visit, *his* mercy after addressing God, the hanging accusatives of 58:13, the obscure 58:13b). Unknown words: escarnecereis, soberba, consumação, confins, entoarei — all glossary words, kept. Acted on: 58:4 *apanharam* (heard 'be beaten', with the stylist) → *tomaram*; 58:12 heard as the enemies forgetting my people — which is the ruling's reading, so it is understood as intended.", "outcomes": [
    {"verse": "58:4", "remark": "apanharam heard as be beaten", "outcome": "taken", "decision": "ceperunt"},
    {"verse": "58:13", "remark": "falta heard as lack", "outcome": "refused", "decision": "delictum", "reason": "the row's word; other readers heard sins first"},
    {"verse": "58:6b", "remark": "visitar heard as a benevolent visit", "outcome": "refused", "reason": "visitáre carries both in the Latin; not closed"},
    {"verse": "58:10", "remark": "sua misericórdia: whose?", "outcome": "refused", "reason": "the switch of person is the Latin's (ejus)"}]})
d['audit'].append({"step": "revision", "version": 2, "note": "v2: 58:4 tomaram; 58:5 segui reto; 58:7 = 58:15 e como cães passarão fome; 58:10, 58:18 porque vós, Deus, sois o meu amparo; 58:13b e não serão mais. New decisions nonerunt, factus. Draft 1 kept as prayed.v1.json."})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
