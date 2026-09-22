"""Draft 2 of Ps 55 from the v1 readers. Run once: python3.13 research/psalterium/ps055/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note_add=None):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    chosen = opts.pop(i)
    old = opts[0]
    old['note'] = old['note'].replace('Ruling; ', 'Draft 1; ').replace('Ruling.', 'Draft 1.')
    if note_add:
        chosen['note'] = note_add
    opts.insert(0, chosen)


d['version'] = 2
v = d['verses']

# 55:2–3 conculcare: stylist (calcar aos pés is the set phrase)
promote('conculcare', 'me calcou aos pés / Calcaram-me aos pés',
        'Ruling (v2); stylist v1: *pisar aos pés* is two idioms crossed, *calcar aos pés* the set phrase; = 90:13 and MS1932. Ps 7:6\'s trouble was the subjunctive *calque*, not the idiom.')
dec['conculcare']['options'][0]['from'] = 'stylist'
dec['conculcare']['why'] += ' **v2:** the stylist refused *pisar aos pés* in both verses as a crossed idiom and asked for *calcar aos pés*; taken — the Ps 7 readers stumbled on the rare form *calque*, while *calcou / calcaram* are current; the ambiguity reader passed *calcou*-family words without remark.'

# 55:4: Latinist — plain *da* keeps ab open
dec['altitudine']['options'].insert(1, {"label": "Da altura do dia", "forms": {"altitudine": "Da altura do dia"}, "note": "Ruling (v2); latinist v1: *desde* makes *ab* only temporal; *da* keeps time, place and cause open.", "from": "latinist"})
promote('altitudine', 'Da altura do dia')
dec['altitudine']['why'] += ' **v2:** the Latinist asked for plain *da*, which keeps *ab* as open as the Latin (time from which, or cause); taken.'

# 55:6: stylist order, tense kept
v['55:6'] = 'O dia todo {exsecrabantur} as minhas palavras: * contra mim {copula} todos os seus pensamentos para o mal.'
dec['copula']['why'] += ' **v2:** the Latin order (*contra mim eram todos os seus pensamentos para o mal*), from the stylist: *para o mal* no longer trails after a comma. His present *são* refused — the first colon is past — and stays option 2.'

# 55:7: Latinist — bare active
promote('abscondent', 'esconderão', 'Ruling (v2); latinist v1: the Latin is active and objectless; the reflexive changed the voice and closed what it leaves open.')
dec['abscondent']['options'][1]['note'] = 'Draft 1; DRB, MS1932 — supplies the reflexive.'
dec['abscondent']['why'] += ' **v2:** the Latinist marked the reflexive (minor) and asked for the bare verb; taken — it is the ambiguity the brief says to keep, and the ambiguity reader already heard the enemies lying hidden in draft 1.'

# 55:10: stylist (conheci que not current; bare eis clipped) — perfect kept
dec['cognovi']['options'].insert(0, {"label": "eis que eu soube: vós sois", "forms": {"cognovi": "eis que eu soube: vós sois"}, "note": "Ruling (v2); the stylist's build (*eis que eu sei: vós sois*) with the Latin's perfect kept (19:7a *agora soube*, where the present drew a Latinist major).", "from": "stylist"})
for o in dec['cognovi']['options'][1:]:
    o['forms'] = {"cognovi": "eis, " + o['forms']['cognovi'] + " que vós sois"}
    o['note'] = o['note'].replace('Ruling; ', 'Draft 1 build; ')
v['55:10'] = 'Em qualquer dia em que vos invocar: * {cognovi} o meu Deus.'
dec['cognovi']['options'].append({"label": "eis que eu sei: vós sois", "forms": {"cognovi": "eis que eu sei: vós sois"}, "note": "stylist v1 as proposed; refused: the present (see 19:7a).", "from": "stylist"})
dec['cognovi']['why'] += ' **v2:** the stylist found *conheci que* not current and the bare *eis,* clipped; the ambiguity reader found the past after *em qualquer dia* jarring. Taken: *eis que* and *saber* (19:7a); the *quóniam*-clause said after a colon, which is how Portuguese says it. The perfect stays, as the Latin.'

# 55:11: Latinist + stylist — two nouns
dec['sermonem']['options'].insert(0, {"label": "a fala", "forms": {"sermonem": "a fala"}, "note": "Ruling (v2); stylist v1. The Latin's two nouns, and the Greek's (ῥῆμα / λόγον).", "from": "stylist"})
for o in dec['sermonem']['options']:
    if o['label'] == 'a palavra':
        o['note'] = 'Draft 1; D15. Both the Latinist and the stylist heard the repetition as a slip.'
    if o['label'] == 'o discurso':
        o['note'] = 'latinist v1; a speech made — heard as praising someone\'s speech.'
        o['from'] = 'latinist'
dec['sermonem']['options'] = [o for i, o in enumerate(dec['sermonem']['options']) if not (i > 0 and o['label'] == 'a fala')]
dec['sermonem']['why'] += ' **v2:** the Latinist (minor) and the stylist both refused *a palavra … a palavra*: the Latin varies its noun, and the doubled word sounds like a copying slip. Taken, as the local decision D15 allows — the Greek differs here too, which is D15\'s own test. Of the two proposed nouns, the stylist\'s *a fala* (the thing spoken) over the Latinist\'s *o discurso* (a speech, heard as someone\'s oration). D15 refused *falas* in the plural with a possessive (*as vossas falas*, 118); the singular without one reads as the pair *palavra / fala*. Cost: 55:5 *sermónes meos* stays *as minhas palavras* (τοὺς λόγους, as 55:6 *verba*), so *sermo* has two Portuguese words in this psalm; the refrain\'s echo 55:5 / 55:11 still rests on *palavra*.'

# 55:12: stylist colon taken; *cumprir* refused
v['55:12'] = '{inme}, Deus, {vota}, * que {reddam}: louvores a vós.'
d['decisions'].append({
    "id": "reddam", "refs": ["55:12"], "latin": "quæ reddam, laudatiónes tibi", "kind": "glossary",
    "why": "*vota réddere → pagar os votos* (the réddere row; 21:26 *pagarei os meus votos*, finished). The stylist (v1) finds *pagar votos* commercial and asks *cumprir*; refused for the formula's sake — it recurs at 49:14, 60:9, 65:13, 115:5, 115:9, and *pagar* keeps the debt the Latin and Greek (ἀποδώσω) name; the ambiguity reader heard 'I will fulfil them by praising you' without trouble. His colon before the apposition taken (v2).",
    "options": [
        {"label": "pagarei", "forms": {"reddam": "pagarei"}, "note": "Ruling; the row, 21:26.", "from": "glossary"},
        {"label": "cumprirei", "forms": {"reddam": "cumprirei"}, "note": "stylist v1; MS1932 *cumprirei*. Would part from 21:26.", "from": "stylist"}
    ]})

d['choices']['55:8'] = '*fácies … confrínges* → *salvareis … quebrareis*: the stylist (v1) heard a chime of *-areis* across the asterisk; the Latin has the same echo (two futures in *-es*), so it is kept (rule 5). His move (*quebrareis na ira os povos*) would put the two futures side by side across the mediant. *por nada* keeps the Latin\'s open *pro níhilo*: the ambiguity reader heard it split between "in no way" and "freely" — so is the Latin (DRB "for nothing"); *de nenhum modo* stays option 2.'
d['choices']['55:12'] = d['choices']['55:12'] + ' v2: a colon before the apposition, from the stylist.'

d['audit'].extend([
    {"step": "latinist", "file": "critic/v1.latinist.json", "note": "claude-opus-5-5 (fresh context). Three minors, all taken.", "outcomes": [
        {"verse": "55:4", "remark": "*desde* makes *ab* only temporal → *Da altura do dia*", "outcome": "taken"},
        {"verse": "55:7", "remark": "reflexive *se esconderão* changes the voice; objectless active", "outcome": "taken"},
        {"verse": "55:11", "remark": "*verbum / sermónem* flattened into *palavra* twice → *o discurso*", "outcome": "taken", "reason": "a second noun taken; the stylist's *a fala* chosen over *o discurso*, which stays an option"}]},
    {"step": "stylist", "file": "critic/v1.stylist.json", "note": "claude-opus-5-5 (fresh context). 7 remarks on 7 verses; best line 55:9, worst 55:11. 5 taken (55:2, 55:3, 55:6 order, 55:10, 55:11), 1 taken in part (55:12 colon; *cumprir* an option), 1 refused (55:8 rhyme).", "outcomes": [
        {"verse": "55:2", "remark": "*pisar aos pés* crossed idiom → *calcou aos pés*", "outcome": "taken"},
        {"verse": "55:3", "remark": "same → *Calcaram-me aos pés*", "outcome": "taken"},
        {"verse": "55:6", "remark": "*para o mal* trails → *contra mim são todos os seus pensamentos para o mal*", "outcome": "taken", "reason": "order taken; the present *são* refused (the first colon is past), option in `copula`"},
        {"verse": "55:8", "remark": "*salvareis … quebrareis* chime", "outcome": "refused", "reason": "the Latin has the same echo (*fácies … confrínges*); the proposed move sets the two futures side by side across the mediant"},
        {"verse": "55:10", "remark": "*conheci que* not current; bare *eis,* clipped → *eis que eu sei: vós sois*", "outcome": "taken", "reason": "build taken with the perfect *soube* (19:7a); the present is an option in `cognovi`"},
        {"verse": "55:11", "remark": "doubled *palavra* sounds a slip → *a fala*", "outcome": "taken"},
        {"verse": "55:12", "remark": "*pagar votos* commercial → *que cumprirei: louvores a vós*", "outcome": "option", "decision": "reddam", "reason": "colon taken; *pagar* kept for the *vota réddere* formula (21:26 and five more places)"}]},
    {"step": "ambiguity", "file": "critic/v1.ambiguity.json", "note": "claude-opus-5-5 (fresh context). 24 readings; the likely hearing was the intended one in most. Unknown: *atribulou*, *altura do dia*, *espreitarão* — two glossary words and the Latin's crux, kept.", "outcomes": [
        {"verse": "55:4", "remark": "*altura do dia* unclear", "outcome": "refused", "reason": "the Latin's crux; now *Da altura do dia* (Latinist)"},
        {"verse": "55:5", "remark": "*a carne* heard as one's own body", "outcome": "refused", "reason": "the Latin's word (σάρξ), kept concrete (rule 5); 55:11 *o homem* answers it"},
        {"verse": "55:8", "remark": "*esperaram pela minha alma*: hostile sense not obvious", "outcome": "option", "decision": "sustinuerunt", "reason": "the context (55:7 *espreitarão*) gives it; *vida* is option 3"},
        {"verse": "55:8", "remark": "*por nada os salvareis* split, 'freely' possible", "outcome": "refused", "reason": "the Latin's own openness (*pro níhilo*); *de nenhum modo* is option 2"},
        {"verse": "55:9b", "remark": "*Assim como também na vossa promessa* seems incomplete", "outcome": "refused", "reason": "the Latin clause is as elliptical"},
        {"verse": "55:10", "remark": "past *conheci* jarring after *em qualquer dia*", "outcome": "taken", "reason": "*eis que eu soube:* — still the perfect, as the Latin, but *eis que* now carries it"},
        {"verse": "55:12", "remark": "*os vossos votos* can sound like God's; *Em mim estão* heard as 'within me'", "outcome": "refused", "reason": "*vota tua* and *in me* are as open; MS1932's explanation and *Sobre mim* are options in `inme`"},
        {"verse": "55:2", "remark": "*atribulou*, *espreitarão* unknown", "outcome": "refused", "reason": "glossary words (tribuláre, observáre); reported to the rows"}]},
    {"step": "revision", "version": 2, "note": "v2: 55:2–3 *calcar aos pés*; 55:4 *Da altura do dia*; 55:6 Latin order; 55:7 bare *esconderão*; 55:10 *eis que eu soube: vós sois o meu Deus*; 55:11 *a fala*; 55:12 colon, and *pagar* made a decision (`reddam`). Draft 1 kept as prayed.v1.json."}
])

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
