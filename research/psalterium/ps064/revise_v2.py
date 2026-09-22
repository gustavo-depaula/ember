"""Draft 2 of Ps 64 after the v1 readers (Latinist, stylist, ambiguity; Claude Opus, fresh context)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
V = d['verses']
V['64:14'] = "{induti}, e os vales abundarão em trigo: * clamarão, pois {hymnumdicent}."
dec = {x['id']: x for x in d['decisions']}


def opt(label, forms, note, frm):
    return {'label': label, 'forms': forms, 'note': note, 'from': frm}


def front(did, index):
    o = dec[did]['options']
    o.insert(0, o.pop(index))


# 64:5 assumpsisti: Latinist fix taken
front('assumpsisti', 1)
dec['assumpsisti']['options'][0]['note'] = 'v2 — the Latinist\'s fix (προσελάβου, take to oneself); the stylist and the blind reader both heard *recolhestes* as gathering things up'
dec['assumpsisti']['options'][1]['note'] = 'draft 1 — the glossary row (17:17, 26:10); heard as gathering things / jingle with *escolhestes*'
dec['assumpsisti']['why'] += ' **v2:** all three readers stopped at *recolhestes* (Latinist: a shift toward sheltering; stylist: a jingle with *escolhestes*, and taking in laundry; blind reader: gathering up). Here God takes a chosen man to himself — the Latinist\'s *tomastes para vós* says it. The glossary row stays *recolher* for 17:17 and 26:10, where a man is drawn out of danger; 64:5 is noted there as the exception.'

# 64:6 comma (stylist)
dec['inmari']['options'][0]['forms']['inmari'] = 'e no mar, ao longe'
dec['inmari']['options'][0]['label'] = 'e no mar, ao longe'
dec['inmari']['options'][0]['note'] = 'v2 — the stylist\'s comma, so the adverb is heard apart; the relation left open, as the Latin'

# 64:7 com o vosso poder (stylist)
front('invirtute', 1)
dec['invirtute']['options'][0]['note'] = 'v2 — the stylist: *no vosso poder* was heard as locative, where the Latin is instrumental; the preposition is grammar (D2)'
dec['invirtute']['options'][1]['note'] = 'draft 1 — the formula as 20:2, 53:3 (where it is locative)'

# 64:8 termini: confins (stylist asked for a plain spatial word; blind reader heard borders)
front('termini', 1)
dec['termini']['options'][0]['note'] = 'v2 — one word with 64:6, as the Greek (πέρατα both); the stylist heard *os limites* as administrative and the blind reader as frontiers'
dec['termini']['options'].append(opt('nos extremos', {'termini': 'nos extremos'}, 'the stylist\'s proposal: plain and spatial, but a new word for the psalter', 'stylist'))
dec['asignis']['options'][1]['note'] = 'DRB \'at thy signs\'; the Latinist\'s minor (v1) asked for it; +3 syllables'
dec['asignis']['options'][1]['from'] = 'latinist'

# 64:10 locupletare: Latinist refused, kept as option
dec['locupletare']['options'].append(opt('multiplicastes o enriquecê-la', {'locupletare': 'multiplicastes o enriquecê-la'}, 'the Latinist\'s minor (v1): keeps the infinitive and *eam*; a nominalised infinitive with an enclitic is not said in Portuguese', 'latinist'))

# 64:11 germinans: substantive (Latinist + stylist)
front('germinans', 1)
dec['germinans']['options'][0]['note'] = 'v2 — the Latinist and the stylist both read *gérminans* as the subject; the blind reader heard no subject in the gerund. *germina* is paroxytone (ger-MI-na), so the cadence holds'
dec['germinans']['options'][1]['note'] = 'draft 1 — the participle as a gerund; subject left unnamed'
dec['germinans']['options'].append(opt(' o que brota', {'germinans': ' o que brota'}, 'the stylist\'s word; leaves the *gérmen* root', 'stylist'))

# 64:12 benignitas: stylist refused (D44)
d['decisions'].append({
    'id': 'benignitas', 'refs': ['64:12'], 'latin': 'benignitátis tuæ', 'kind': 'glossary',
    'why': 'D44 settled *benígnitas → benignidade* and names this verse; it is kept apart from *bónitas → bondade*. The stylist asked for *bondade* (a long Latinate word at the mediant) and the blind reader listed *benignidade* as unknown — the row\'s known cost. Refused under D44; *bondade* is the option.',
    'options': [
        opt('benignidade', {'benignitas': 'benignidade'}, 'D44', 'glossary'),
        opt('bondade', {'benignitas': 'bondade'}, 'the stylist (v1): plainer; merges with *bónitas*', 'stylist'),
    ]})
V['64:12'] = "Bendireis a coroa do ano da vossa {benignitas}: * e os vossos campos {rep12} de fartura."

# 64:13 speciosa: Latinist fix; pinguescent: stylist refused, option
front('speciosa', 1)
dec['speciosa']['options'][0]['note'] = 'v2 — the Latinist\'s fix (DRB \'the beautiful places\'); *belezas* drifted to an abstraction and the blind reader heard it so'
dec['speciosa']['options'][1]['note'] = 'draft 1'
dec['pinguescent']['options'].append(opt('Ficarão fartos', {'pinguescent': 'Ficarão fartos'}, 'the stylist (v1: worst line, *engordar* sounds comic, of livestock and diets); *fartos* is satiety, not fatness, and echoes *fartura* (ubértas) — the image changes', 'stylist'))
dec['pinguescent']['why'] += ' **v2:** the stylist called it the worst line (comic) and the blind reader was confused; with *os lugares formosos* the subject is now plainly land, which is where *engordar* has its farming sense. Kept (rule 5: fat stays fat); *Ficarão fartos* is the option.'

# 64:14 induti: verb first (stylist's order, without the poetic inversion)
dec['induti']['options'] = [
    opt('Estão vestidos os carneiros das ovelhas', {'induti': 'Estão vestidos os carneiros das ovelhas'}, 'v2 — the verb first, as the Latin and the stylist; plain verb–subject order rather than his *Vestidos estão*', 'stylist'),
    opt('Os carneiros das ovelhas estão vestidos', {'induti': 'Os carneiros das ovelhas estão vestidos'}, 'draft 1 — subject first; the stylist: the verse deflates on *estão vestidos*', 'draft'),
    opt('Vestiram-se os carneiros das ovelhas', {'induti': 'Vestiram-se os carneiros das ovelhas'}, 'the Greek middle ἐνεδύσαντο; the voice changes against the Latin', 'draft'),
    opt('Foram vestidos os carneiros das ovelhas', {'induti': 'Foram vestidos os carneiros das ovelhas'}, 'the Latin\'s passive as an event', 'draft'),
]
front('hymnumdicent', 0)
dec['hymnumdicent']['options'].insert(0, opt('hão de entoar um hino', {'hymnumdicent': 'hão de entoar um hino'}, 'v2 — the stylist: *abundarão / clamarão / entoarão* jingled; the periphrastic future is the same tense (as 29:9 *hei de clamar*), and *entoar* is kept (his *cantar* is cantáre\'s)', 'stylist'))
dec['hymnumdicent']['options'][1]['note'] = 'draft 1 — three *-arão* in one verse'

C = d['choices']
C['64:5'] = '*aquele que* rather than MS1932\'s *o que*, which a Brazilian ear can take as \'what\'. *inhabitáre → habitar*. *átrio* kept (the row), though the blind reader did not know it (the third). The first colon is +8 against the Latin in v2 (*Bem-aventurado*, D19, and *tomastes para vós*); one breath still.'
C['64:13'] = '*accingéntur → serão cingidas*, passive as the Latin, echoing 64:7 *cingido*. *colles → colinas*. *exsultátio → exultação* (row; unknown to the blind reader again). First colon +4 in v2.'
C['64:4'] += ' **The blind reader heard *propício às nossas impiedades* as God favouring our sins** — the second reader to hear the row\'s adjective that way (24:11). Kept for the row; the main session should look at *propitiári* before 77:38, 78:9.'
C['64:8'] += ' *éxitus … véspere*: the blind reader found *as saídas da manhã e da tarde* opaque (exits, departures). It is the Latin\'s own crux, left concrete and unresolved on purpose (decision `exitus`).'
C['64:10b'] += ' The blind reader found *deles* without antecedent and *a sua preparação* opaque; the Latin\'s *illórum* and *ejus* are just as unanchored (and the Greek has σου), so neither is resolved.'
C['64:2'] += ' The blind reader half-heard *voto* as a ballot; *pagar os votos* is the psalter\'s established phrase (21:26, 49:14, 60:9), kept.'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)', 'note': '5 minor, no major. 64:5, 64:11, 64:13 taken; 64:8 and 64:10 refused and kept as options.',
     'outcomes': [
        {'verse': '64:5', 'remark': 'recolhestes shifts assumere toward sheltering', 'outcome': 'taken'},
        {'verse': '64:8', 'remark': 'a signis tuis causal: temerão diante dos vossos sinais', 'outcome': 'option', 'decision': 'asignis', 'reason': 'the timére a row takes a direct object; the reader himself calls it defensible, and the colon is already +4'},
        {'verse': '64:10', 'remark': 'locupletare nominalised: multiplicastes o enriquecê-la', 'outcome': 'option', 'decision': 'locupletare', 'reason': 'a nominalised infinitive with an enclitic is not Portuguese; the draft keeps *multiplicar* and the root of *locupletáre*, which is grammar (D2); the stylist named this line the best'},
        {'verse': '64:11', 'remark': 'gérminans is the subject: o que germina', 'outcome': 'taken'},
        {'verse': '64:13', 'remark': 'speciósa: os lugares formosos, not belezas', 'outcome': 'taken'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)', 'note': '9 remarks in 8 verses; 6 taken, 3 refused as options. Worst line 64:13, best 64:10.',
     'outcomes': [
        {'verse': '64:5', 'remark': 'escolhestes / recolhestes jingle; recolher = laundry', 'outcome': 'taken', 'reason': 'with the Latinist\'s wording *tomastes para vós*'},
        {'verse': '64:6', 'remark': 'comma before ao longe', 'outcome': 'taken'},
        {'verse': '64:7', 'remark': 'com o vosso poder (instrumental)', 'outcome': 'taken'},
        {'verse': '64:8', 'remark': 'os limites abstract → nos extremos', 'outcome': 'taken', 'reason': 'as *os confins* (one word with 64:6, the same Greek) rather than a new word; *nos extremos* is an option'},
        {'verse': '64:11', 'remark': 'gerund has no subject → o que brota', 'outcome': 'taken', 'reason': 'as *o que germina*, keeping the Latin root; *o que brota* is an option'},
        {'verse': '64:12', 'remark': 'benignidade → bondade', 'outcome': 'option', 'decision': 'benignitas', 'reason': 'D44 settled *benignidade* for this very verse, apart from *bónitas → bondade*'},
        {'verse': '64:13', 'remark': 'engordarão comic → Ficarão fartas', 'outcome': 'option', 'decision': 'pinguescent', 'reason': 'fat is the Latin\'s image (rule 5); *fartos* is satiety and echoes *fartura* (ubértas). With the subject now *os lugares formosos*, the farming sense of *engordar* is clearer'},
        {'verse': '64:14', 'remark': 'verb first: Vestidos estão os carneiros', 'outcome': 'taken', 'reason': 'as plain verb–subject *Estão vestidos*, avoiding the inversion'},
        {'verse': '64:14', 'remark': 'triple -arão → hão de cantar um hino', 'outcome': 'taken', 'reason': 'as *hão de entoar um hino*: *entoar* kept for dícere + song (*cantar* is cantáre\'s)'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context, Portuguese only)', 'note': '29 readings, 10 unknown words (iníquos, propício, impiedades, átrios, equidade, confins, cingido, benignidade, cingidas, exultação — all glossary words, kept). Acted on: 64:5 recolhestes, 64:11 subject, 64:13 belezas (with the other readers). Recorded in choices: 64:2 voto, 64:4 propício (heard as favouring sin — flagged for the row), 64:8 saídas, 64:10b deles / preparação.',
     'outcomes': [
        {'verse': '64:4', 'remark': 'propício às impiedades heard as favouring sin', 'outcome': 'refused', 'reason': 'the glossary row and 24:11; flagged for the main session in the row and in choices; *perdoareis* is the option'},
        {'verse': '64:5', 'remark': 'recolhestes heard as gathering', 'outcome': 'taken'},
        {'verse': '64:8', 'remark': 'saídas heard as exits', 'outcome': 'refused', 'reason': 'the Latin\'s own crux, kept concrete (decision `exitus`)'},
        {'verse': '64:8', 'remark': 'os limites heard as frontiers', 'outcome': 'taken', 'reason': 'now *os confins*'},
        {'verse': '64:10b', 'remark': 'deles / a sua preparação unanchored', 'outcome': 'refused', 'reason': 'as unanchored in the Latin'},
        {'verse': '64:11', 'remark': 'no audible subject', 'outcome': 'taken'},
        {'verse': '64:13', 'remark': 'engordarão as belezas confusing', 'outcome': 'taken', 'reason': '*os lugares formosos* taken; *engordarão* kept'},
        {'verse': '64:14', 'remark': 'pois heard as because', 'outcome': 'refused', 'reason': '*étenim → pois* (glossary)'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 64:5 *tomastes para vós*; 64:6 comma; 64:7 *com o vosso poder*; 64:8 *os confins*; 64:11 *o que germina*; 64:13 *os lugares formosos do deserto*; 64:14 *Estão vestidos os carneiros das ovelhas … hão de entoar um hino*; new decision `benignitas` records the refused *bondade*. Draft 1 kept as prayed.v1.json.'},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
