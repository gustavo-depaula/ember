"""Ps 51 draft 2 from the v1 readers. python3.13 research/psalterium/ps051/revise_v2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
v = d['verses']

d['version'] = 2
d['status'] = 'reviewed'

# 51:4 — drop *uma* (as 51:10); fecísti dolum re-ruled
v['51:4'] = 'O dia todo a tua língua {cogitavit} injustiça: * como navalha {acuta}, {dolum}.'
dec['acuta']['why'] = dec['acuta']['why'].replace(
    'The article *uma* as in *como uma imagem* (38:7), *como um surdo* (37:14).',
    'Draft 1 had the article (*como uma navalha*); v2 drops it here and in 51:10, after the stylist (a beat for nothing in a long colon); MS1932 has none either.')
dec['cogitavit']['options'][1]['note'] += ' The stylist (v1) asked for *maquinou a injustiça* (\'pensou em\' weak) — refused: the row keeps *pensar em*, and the blind reader heard \'plotted\' first anyway.'
dec['cogitavit']['options'][1]['from'] = 'stylist'

dec['dolum']['why'] = (
    'dolus → *engano* (open row). The verb is *fácere*, and the psalm uses it twice: the wicked man *fecísti dolum* (51:4), God *quia fecísti* (51:11). '
    'Draft 1 kept the verb (*fizeste engano*, MS1932 word for word) for that echo; but the blind reader heard *fizeste engano* first as \'you made a mistake\' — '
    '*engano* in daily Brazilian speech is an error — and the stylist heard the bare noun as a calque. *fizeste o engano* (his fix) is still \'you made the mistake\'. '
    'A wrong first hearing is a fault (D2), so the verb gives way: *tramaste o engano* — to contrive, which is what ἐποίησας δόλον means here (DRB \'wrought deceit\') and cannot be heard as an error. '
    'Cost: the echo with 51:11 *o fizestes* is lost. *agiste com engano* (35:3\'s build for *dolóse egit*) is the option that keeps the row nearest.')
dec['dolum']['options'] = [
    {'label': 'tramaste o engano', 'forms': {'dolum': 'tramaste o engano'}, 'note': 'Ruling (v2): cannot be heard as \'made a mistake\'; loses the fácere echo.', 'from': 'ambiguity'},
    {'label': 'fizeste engano', 'forms': {'dolum': 'fizeste engano'}, 'note': 'draft 1; MS1932; keeps fácere and the echo with 51:11, heard as \'you made a mistake\' by the blind reader.', 'from': 'MS1932'},
    {'label': 'fizeste o engano', 'forms': {'dolum': 'fizeste o engano'}, 'note': 'the stylist\'s (v1); the same wrong hearing.', 'from': 'stylist'},
    {'label': 'agiste com engano', 'forms': {'dolum': 'agiste com engano'}, 'note': '35:3\'s build (another Latin).', 'from': 'glossary'},
    {'label': 'urdiste o engano', 'forms': {'dolum': 'urdiste o engano'}, 'note': 'literary.', 'from': 'draft'},
]

# 51:5 — stylist's *com equidade* as an option
dec['aequitatem']['options'].append({'label': 'falar com equidade', 'forms': {'aequitatem': 'falar com equidade'}, 'note': 'stylist (v1): \'falar a equidade\' not usage. Refused: it turns the accusative of content (what is spoken) into manner; the row (*falar mentira*) and 16:9b, where the same change was a Latinist major.', 'from': 'stylist'})
dec['benignitatem']['options'][1]['note'] += ' The stylist (v1) proposed it; it keeps the -dade rhyme too.'
dec['benignitatem']['options'][1]['from'] = 'stylist'

# 51:6 — vocative
dec['lingua']['options'][1]['note'] += ' The stylist (v1) asked for it (\'reads like an appositive\'); refused, because the Latin leaves exactly that open and the Latinist named the kept nominative as right.'
dec['lingua']['why'] += ' The blind reader heard a second object as quite possible aloud — the Greek\'s own reading, so no wrong hearing.'

# 51:7 — emigráre, comma before the ellipsis
v['51:7'] = 'Por isso Deus te destruirá {infinem}, * te arrancará, e {emigrabit} da tua tenda: {radicem}, da terra dos vivos.'
dec['emigrabit']['why'] = (
    'emigráre is used transitively, \'make you migrate\' (μεταναστεύσαι σε, \'remove you from your dwelling\'). Draft 1 kept the cognate (*te fará emigrar*), which would also serve 61:7 *non emigrábo*. '
    'Both the stylist (\'bureaucratic, passports\') and the blind reader (\'suggests voluntary migration abroad\') heard it wrongly: *emigrar* is now a voluntary going abroad. '
    '*desalojar* is exactly \'put out of one\'s lodging\' and is plain Brazilian (it is what is said of families driven from their homes by flood or eviction); it keeps the forced removal from a dwelling the Latin says. '
    'MS1932 and the stylist\'s *te fará sair* is plainer but empties the force. 61:7 (Ps 61, not yet translated) decides its intransitive for itself; *não serei desalojado* is available. '
    'evéllere → *arrancar* (open row, which names 51:7). tabernáculum → *tenda* (row).')
dec['emigrabit']['options'] = [
    {'label': 'te desalojará', 'forms': {'emigrabit': 'te desalojará'}, 'note': 'Ruling (v2).', 'from': 'draft'},
    {'label': 'te fará emigrar', 'forms': {'emigrabit': 'te fará emigrar'}, 'note': 'draft 1; the cognate; heard as going abroad by two readers.', 'from': 'draft'},
    {'label': 'te fará sair', 'forms': {'emigrabit': 'te fará sair'}, 'note': 'MS1932; the stylist\'s (v1); loses the force.', 'from': 'stylist'},
    {'label': 'te desterrará', 'forms': {'emigrabit': 'te desterrará'}, 'note': '\'banish\', a little stronger.', 'from': 'draft'},
]
dec['radicem']['why'] += ' v2 adds the comma the stylist asked for (*e a tua raiz, da terra dos vivos*), so that *raiz da terra* is not heard as one phrase; the blind reader found the verbless colon hard to attach, and the comma is the least that helps without choosing the verb.'

# 51:9
dec['praevaluit']['options'].append({'label': 'se fez forte na sua vaidade', 'forms': {'praevaluit': 'se fez forte na sua vaidade'}, 'note': 'stylist (v1): \'prevaleceu\' wants a rival. Refused: it is the Greek\'s ἐδυναμώθη, not the Latin\'s word (rule 1); the row keeps the Latin\'s own descendant.', 'from': 'stylist'})

# 51:10 — drop *uma*
v['51:10'] = 'Eu, porém, como oliveira frutífera na casa de Deus, * {speravi} na misericórdia de Deus para sempre: e pelos séculos dos séculos.'
d['choices']['51:10'] = d['choices']['51:10'].replace('→ *uma oliveira frutífera* (κατάκαρπος; *uma* as 38:7)', '→ *como oliveira frutífera* (κατάκαρπος); draft 1 had *uma*, dropped in v2 after the stylist (the colon is long, the article adds a beat and nothing else)')
d['choices']['51:9'] += ' The stylist (v1) asked for *abundância*; refused — the multitúdo row keeps one word (5:7b/5:11b set them against each other), *abundância* is abundántia\'s, and 48:7 has this phrase word for word.'

# 51:11
dec['conspectu']['options'][2]['note'] += ' The stylist (v1) asked for *pois é bom diante dos vossos santos* (\'à vista\' commercial; *porque* twice); refused for the row\'s noun; *porque* is quia and quóniam alike, as elsewhere.'
dec['conspectu']['options'][2]['from'] = 'stylist'
dec['conspectu']['why'] += ' The blind reader listed \'paid in cash\' as a possible hearing of *à vista*, and heard the right sense first.'

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
