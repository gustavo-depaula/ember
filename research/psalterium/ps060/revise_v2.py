"""Ps 60 draft 2 from the v1 readers (claude-opus-5-5, fresh context). Reads prayed.v1.json, writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
d = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
V = d['verses']
dec = {x['id']: x for x in d['decisions']}

# 60:3 — the subject before its verb (stylist), 'quando', 'uma rocha' and 'o meu' kept
V['60:3'] = 'Dos confins da terra a vós clamei: * {anxiaretur}, sobre uma rocha me exaltastes.'
a = dec['anxiaretur']
a['kind'] = 'order'
a['why'] += (' **v2:** the stylist found the inverted *se angustiava o meu coração* made the ear wait for the main verb in a long colon, and asked *enquanto meu coração se angustiava, sobre a rocha*. The order is taken (D2: order yields to the ear) — the clause now closes on its verb before the turn; *quando* (shorter), *o meu* (the article before possessives, rule 5) and *uma rocha* (= 26:6) are kept. Cost: the antiphon of Pent02-5 splits *Dum anxiarétur * Cor meum*; in Portuguese it would split *Quando o meu coração * se angustiava, …*, which still reads.')
a['options'] = [
    {'label': 'quando o meu coração se angustiava', 'forms': {'anxiaretur': 'quando o meu coração se angustiava'}, 'note': 'Ruling (v2); the stylist\'s order.', 'from': 'stylist'},
    {'label': 'quando se angustiava o meu coração', 'forms': {'anxiaretur': 'quando se angustiava o meu coração'}, 'note': 'Draft 1; the Latin\'s order, verb first.', 'from': 'draft'},
    {'label': 'enquanto o meu coração se angustiava', 'forms': {'anxiaretur': 'enquanto o meu coração se angustiava'}, 'note': 'the stylist\'s conjunction; *dum* as duration; one syllable longer.', 'from': 'stylist'},
    {'label': 'quando o meu coração estava angustiado', 'forms': {'anxiaretur': 'quando o meu coração estava angustiado'}, 'note': 'MS1932 (*quando estava angustiado o meu coração*); a state rather than the verb.', 'from': 'MS1932'},
]

# 60:4 — 'Vós me guiastes' (stylist)
V['60:4'] = '{deduxisti}, porque vos fizestes a minha esperança: * {turris} {afacie}.'
d['decisions'].insert(1, {
    'id': 'deduxisti', 'refs': ['60:4'], 'latin': 'Deduxísti me', 'kind': 'grammar',
    'why': '*dedúcere → guiar* (D22). The stylist found the enclitic *Guiastes-me* at the head of the verse bookish and clipped, and asked *Vós me guiastes*: a subject pronoun D2 allows, and it puts the pronoun where Brazilian speech puts it. Taken. It also answers the *vos fizestes* of the same colon, as the Latin\'s *-sti … es* both point at God.',
    'options': [
        {'label': 'Vós me guiastes', 'forms': {'deduxisti': 'Vós me guiastes'}, 'note': 'Ruling (v2); stylist.', 'from': 'stylist'},
        {'label': 'Guiastes-me', 'forms': {'deduxisti': 'Guiastes-me'}, 'note': 'Draft 1; no pronoun, as the Latin.', 'from': 'draft'},
    ]})

# 60:4 a facie — the Latinist's wording as an option, ruling held
f = dec['afacie']
f['why'] += (' **v2:** the Latinist (minor) wants the face and the sense \'against\': *contra a face do inimigo*. Refused: 43:17 has the same three words as *diante do inimigo* and rule 6 asks one wording; the glossary row gives *diante de* for ἀπὸ προσώπου where *da face de* is not Portuguese; and *diante de* holds both the facing and the shelter. His wording is added as an option.')
f['options'].insert(2, {'label': 'contra a face do inimigo', 'forms': {'afacie': 'contra a face do inimigo'}, 'note': 'Latinist v1 (minor): the face and the opposition both said.', 'from': 'latinist'})

# 60:5 velamento — held
dec['velamento']['why'] += (' **v2:** the Latinist (minor) asks *sob o véu das vossas asas* for the concrete covering. Refused: the Greek is σκέπη, as 35:8\'s *tegmen*, and one Greek word with no difference of sense gets one Portuguese word (D15); *sob o véu* was already option 3. No other reader remarked.')

# 60:6 hereditatem — held
dec['hereditatem']['why'] += (' **v2:** the stylist asks *a herança* (the indefinite \'weak\' after the mediant). Refused: the definite names an inheritance already known, which the Latin does not; the article is grammar, but here it carries sense. His wording was already option 2.')
dec['hereditatem']['options'][1]['from'] = 'stylist'
dec['hereditatem']['options'][1]['note'] = 'stylist v1: more natural and solemn; names a known inheritance.'

# 60:7 — 'aos dias' (stylist) and 'de geração e geração' (Latinist + stylist)
di = dec['dies']
di['why'] += (' **v2:** the stylist: *acrescentar sobre* is not idiomatic — one adds *a* something — and the reciter stumbles. Taken: the preposition is grammar (D2), the image of days upon days stays in *dias aos dias*, and MS1932 and DRB build it so.')
di['options'] = [di['options'][1], di['options'][0], di['options'][2]]
di['options'][0]['note'] = 'Ruling (v2); stylist v1; MS1932, DRB.'
di['options'][0]['from'] = 'stylist'
di['options'][1]['note'] = 'Draft 1; *super* kept as *sobre*; not idiomatic after *acrescentar*.'
di['options'][1]['from'] = 'draft'
g = dec['generationis']
g['why'] += (' **v2:** both the Latinist (minor) and the stylist refused the hybrid: *de geração em geração* is a fixed idiom of succession, and hung on *o dia* it makes nonsense; the blind reader found *até o dia* hard to parse. Both asked for the letter, *de geração e geração*. Taken — it keeps the Latin\'s genitive pair and *et*, and the doubling of the noun says \'every generation\' without borrowing the idiom. The stylist\'s added *e* before *os seus anos* is refused: the Latin has no *et*, and the ellipsis is the Latin\'s.')
g['options'] = [g['options'][1], g['options'][0], g['options'][2]]
g['options'][0]['note'] = 'Ruling (v2); Latinist v1 and stylist v1; the letter.'
g['options'][0]['from'] = 'latinist'
g['options'][1]['note'] = 'Draft 1; the formula hung on *o dia* — refused by both readers as a hybrid.'
g['options'].append({'label': 'e os seus anos, até o dia de geração e geração', 'forms': {'generationis': 'até o dia de geração e geração', 'v7et': 'e os seus anos'}, 'note': 'stylist v1: with *e*, which the Latin lacks.', 'from': 'stylist'})
for o in g['options'][:-1]:
    o['forms']['v7et'] = 'os seus anos'
V['60:7'] = '{dies}: * {v7et}, {generationis}.'

# 60:8 — 'Ele permanece' (stylist; the blind reader heard other subjects)
p = dec['permanet']
p['why'] += (' **v2:** the stylist asked *Ele permanece*: after the king\'s years the bare verb can be taken as an imperative, or its subject sought in *a sua misericórdia* of the next colon — the blind reader listed both. Taken: a subject pronoun D2 allows, and *Ele* still does not say who (the king, or the one the Church hears in him).')
p['options'] = [p['options'][1], p['options'][0]]
p['options'][0]['note'] = 'Ruling (v2); stylist v1; MS1932.'
p['options'][0]['from'] = 'stylist'
p['options'][1]['note'] = 'Draft 1; the subject left in the verb, heard by the blind reader also as an imperative or with *misericórdia* as subject.'
r = dec['requiret']
r['why'] += (' **v2:** the stylist found *pro-cu-ra-rá* after *as* a tongue-twister and asked *buscará*. Refused: *buscar* is *quǽrere*\'s word (23:6), and *requírere → procurar* is the row in four psalms; the blind reader heard *procurar* as \'seek / search into\', the two readings the Latin holds. *buscará* is already option 3.')

# 60:9 — order (stylist), 'pagar' held, 'entoar' held
V['60:9'] = '{v9a}: * para {reddam} os meus votos {dedie}.'
d['decisions'].append({
    'id': 'v9order', 'refs': ['60:9'], 'latin': 'Sic psalmum dicam nómini tuo in sǽculum sǽculi', 'kind': 'order',
    'why': 'The stylist: in the Latin order the mediant falls on the proparoxytone *séculos* and the colon is too long for one breath. He asked *Assim, pelos séculos dos séculos, cantarei um salmo ao vosso nome*. The order is taken (D2), so the colon closes on *nome*; *cantarei* is refused — *psalmum dícere → entoar um salmo* is 17:50\'s and 26:6b\'s wording (D25\'s family), and *cantar* is kept for *cantáre*. Length is unchanged (the formula is eight syllables). The first colon is the V of the Prime Preces versicle and still reads alone.',
    'options': [
        {'label': 'Assim, pelos séculos dos séculos, entoarei um salmo ao vosso nome', 'forms': {'v9a': 'Assim, pelos séculos dos séculos, entoarei um salmo ao vosso nome'}, 'note': 'Ruling (v2); the stylist\'s order with the glossary\'s verb.', 'from': 'stylist'},
        {'label': 'Assim entoarei um salmo ao vosso nome pelos séculos dos séculos', 'forms': {'v9a': 'Assim entoarei um salmo ao vosso nome pelos séculos dos séculos'}, 'note': 'Draft 1; the Latin\'s order; a proparoxytone at the mediant.', 'from': 'draft'},
        {'label': 'Assim, pelos séculos dos séculos, cantarei um salmo ao vosso nome', 'forms': {'v9a': 'Assim, pelos séculos dos séculos, cantarei um salmo ao vosso nome'}, 'note': 'stylist v1 verbatim; *cantar* is *cantáre*\'s.', 'from': 'stylist'},
    ]})
dec['reddam']['why'] += (' **v2:** the stylist asked *cumprir* again (\'pagar sounds commercial\'); refused for the formula, as in Ps 55. The blind reader heard *votos* as vows first.')
dec['reddam']['options'][1]['note'] = 'MS1932; the Ps 55 stylist\'s and the Ps 60 stylist\'s request.'

d['choices']['60:9'] = ('*psalmum dícere → entoar um salmo* (17:50, 26:6b; D25\'s family); the blind reader listed *entoarei* as a word he did not know — the D25 cost, noted, the settled verb kept. *in sǽculum sǽculi → pelos séculos dos séculos* (D27), moved to the head of the verse in v2 (decision `v9order`) so the mediant is not a proparoxytone. checks: the first colon is still long, the formula being eight syllables for five.')
d['choices']['60:3'] = d['choices']['60:3'].replace('*se‿an-*', '*-ção se‿an-*')
d['choices']['60:5'] += ' The blind reader heard *tenda* as a camping tent as well as God\'s dwelling — the cost the *tabernáculum* row already records.'

d['audit'].extend([
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '3 minor, no major. 60:7 taken; 60:4 and 60:5 refused (glossary consistency), each kept as an option.',
     'outcomes': [
         {'verse': '60:4', 'remark': 'a fácie → diante do flattens the face; contra a face do inimigo', 'outcome': 'option', 'decision': 'afacie', 'reason': '= 43:17 (rule 6) and the a fácie row; diante de holds facing and shelter.'},
         {'verse': '60:5', 'remark': 'velaméntum abstracted to abrigo; sob o véu', 'outcome': 'option', 'decision': 'velamento', 'reason': 'σκέπη = 35:8 tegmen → abrigo (D15); already option 3.'},
         {'verse': '60:7', 'remark': 'de geração em geração a hybrid; de geração e geração', 'outcome': 'taken', 'decision': 'generationis'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '9 remarks; best line 60:2, worst 60:7. 5 taken (all order, grammar or a supplied pronoun), 4 refused and kept as options.',
     'outcomes': [
         {'verse': '60:3', 'remark': 'colon long; inverted se angustiava o meu coração; enquanto meu coração se angustiava, sobre a rocha', 'outcome': 'taken', 'decision': 'anxiaretur', 'reason': 'order taken; enquanto, bare meu and a rocha refused (length, rule 5, = 26:6).'},
         {'verse': '60:4', 'remark': 'Guiastes-me bookish; Vós me guiastes', 'outcome': 'taken', 'decision': 'deduxisti'},
         {'verse': '60:6', 'remark': 'uma herança weak; a herança', 'outcome': 'option', 'decision': 'hereditatem', 'reason': 'the definite names a known inheritance the Latin does not name.'},
         {'verse': '60:7', 'remark': 'acrescentar sobre not idiomatic; aos dias', 'outcome': 'taken', 'decision': 'dies'},
         {'verse': '60:7', 'remark': 'até o dia de geração em geração nonsense; e os seus anos, até o dia de geração e geração', 'outcome': 'taken', 'decision': 'generationis', 'reason': 'the added e refused (the Latin has none); kept as an option.'},
         {'verse': '60:8', 'remark': 'subjectless Permanece; Ele permanece', 'outcome': 'taken', 'decision': 'permanet'},
         {'verse': '60:8', 'remark': 'procurará a tongue-twister; buscará', 'outcome': 'option', 'decision': 'requiret', 'reason': 'buscar is quǽrere\'s; requírere → procurar in four psalms.'},
         {'verse': '60:9', 'remark': 'proparoxytone mediant, long colon; pelos séculos dos séculos first, cantarei', 'outcome': 'taken', 'decision': 'v9order', 'reason': 'order taken; cantarei refused (psalmum dícere → entoar um salmo, 17:50, 26:6b), kept as an option.'},
         {'verse': '60:9', 'remark': 'pagar commercial; cumprir', 'outcome': 'option', 'decision': 'reddam', 'reason': 'the vota réddere formula (21:26, 49:14, 55:12).'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '8 ambiguities, 1 unknown word. Heard as meant in 60:4, 60:5, 60:8 (ejus: God first — the Latin allows it), 60:9. Acted on: 60:7 (hard to parse) and 60:8 Permanece (read as an imperative or with the next colon\'s subject).',
     'outcomes': [
         {'verse': '60:3', 'remark': 'exaltastes might be heard as praised', 'outcome': 'refused', 'reason': '= 26:6; the rock makes the sense; heard rightly first.'},
         {'verse': '60:4', 'remark': 'torre de força could be the speaker', 'outcome': 'refused', 'reason': 'heard as God first; the apposition is the Latin\'s.'},
         {'verse': '60:5', 'remark': 'tenda sounds like a camping tent', 'outcome': 'refused', 'reason': 'the tabernáculum row\'s known cost; tabernáculo is the option.'},
         {'verse': '60:7', 'remark': 'até o dia hard to parse; no verb', 'outcome': 'taken', 'decision': 'generationis', 'reason': 'the hybrid removed; the ellipsis is the Latin\'s and stays.'},
         {'verse': '60:8', 'remark': 'Permanece: imperative, or subject in the next colon', 'outcome': 'taken', 'decision': 'permanet'},
         {'verse': '60:8', 'remark': 'a sua: God\'s or the king\'s', 'outcome': 'refused', 'reason': 'the Latin\'s ejus is open the same way; kept on purpose.'},
         {'verse': '60:8', 'remark': 'quem as procurará: point unclear', 'outcome': 'refused', 'reason': 'the Latin question is open between fathoming and seeking; sondará is the option.'},
         {'verse': '60:9', 'remark': 'votos may be wishes or votes; entoarei unknown', 'outcome': 'refused', 'reason': 'heard as vows first (= 21:26); entoar salmos is D25.'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 60:3 order (quando o meu coração se angustiava); 60:4 Vós me guiastes; 60:7 aos dias, de geração e geração; 60:8 Ele permanece; 60:9 pelos séculos dos séculos moved to the head. Draft 1 kept as prayed.v1.json.'},
])

(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
