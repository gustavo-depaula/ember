"""Stage two, draft 5 → draft 6 after critic/v5.{latinist,stylist,ambiguity}.part2.json.
python3.13 research/psalterium/ps009/revise_v6.py  (reads prayed.v5.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v5.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def first(decisionId, label, note, source, oldNote=None):
    d = dec[decisionId]
    chosen = next(o for o in d['options'] if o['label'] == label)
    old = d['options'][0]
    if oldNote:
        old['note'] = oldNote
    chosen['note'] = note
    chosen['from'] = source
    d['options'] = [chosen] + [o for o in d['options'] if o is not chosen]


# 9:23 — the stylist: 'se enche de soberba' (the noun of supérbia; ensoberbece listed unknown by the blind reader)
V['9:23'] = V['9:23'].replace('Enquanto o ímpio se ensoberbece,', 'Enquanto o ímpio {superbit},')
data['decisions'].insert(data['decisions'].index(dec['incenditur']), {
    'id': 'superbit', 'refs': ['9:23'], 'latin': 'Dum supérbit ímpius', 'kind': 'word',
    'why': 'supérbire (ὑπερηφανεύεσθαι), ‘to be proud’. Draft 5 had Matos Soares 1932’s ‘se ensoberbece’: the stylist found it hard in the mouth and uncommon, the blind reader listed it as a word he did not know. The line was also the psalm’s longest against its Latin (+8).',
    'options': [
        opt('se enche de soberba', {'superbit': 'se enche de soberba'}, 'Ruling since draft 6, the stylist’s: the noun of the same root (supérbia → soberba), plain; the verb becomes a light verb and its noun — grammar (D2).', 'stylist'),
        opt('se ensoberbece', {'superbit': 'se ensoberbece'}, 'Draft 5, Matos Soares 1932: one verb for one, but rare and hard to say; unknown to the blind reader.', 'MS1932'),
        opt('se orgulha', {'superbit': 'se orgulha'}, 'Shortest and commonest; leaves the root of supérbia.', 'draft'),
    ]})

# 9:25 — exasperou unknown to the blind reader; D15's test (one Greek verb, παροξύνω, in 9:25 and 9:34) → provocou
first('exacerbavit', 'provocou',
      'Ruling since draft 6. The blind reader did not know ‘exasperou’, and D15’s test, which the draft set aside for the Latin’s variation, points the same way: 9:25 and 9:34 have one Greek verb (παρώξυνεν both), so the Latin’s two verbs are its elegance, and Douay-Rheims merges them (‘provoked’ both). The two verses now echo each other: ‘O pecador provocou o Senhor … Por que razão o ímpio provocou a Deus?’ — which is what the Greek does. Where exacerbáre and irritáre stand in one verse (105:32, 106:11) a second word is still needed; the glossary row’s ‘exasperar’ stays proposed there, with this evidence against it.',
      'DRB', 'Draft 5, as the glossary row proposes for exacerbáre: listed as unknown by the blind reader. It keeps the Latin’s two verbs apart; D15 would merge them.')

# 9:30a / 9:30b — the stylist: 'arma emboscada', 'como leão'
ins = dec['insidiae']
ins['options'][0]['forms'] = {'ins29': 'de emboscada', 'ins30a': 'arma emboscada', 'ins30b': 'Arma emboscada'}
ins['options'][0]['label'] = 'emboscada'
ins['options'][0]['note'] = ('Ruling. The noun heard three times, the family kept. Since draft 6 the verb is ‘armar emboscada’ (the stylist, 9:30a: ‘fica de emboscada às escondidas, como um leão’ piled small words before the lion) — the living idiom for insidiári; 9:29 keeps ‘Senta-se de emboscada’ for Sedet in insídiis.')
ins['options'].insert(1, opt('emboscada (draft 5)', {'ins29': 'de emboscada', 'ins30a': 'fica de emboscada', 'ins30b': 'Fica de emboscada'}, 'Draft 5: ‘ficar de emboscada’; the stylist found the colon heavy with small words.', 'draft'))
V['9:30a'] = V['9:30a'].replace('como um leão no seu', 'como leão no seu')
data['choices']['9:30a'] = ('Ps 10:5b’s first colon copied (decision respiciunt). ‘como leão’ without the article, as quasi leo (the stylist). spelúnca → covil: the blind reader listed ‘covil’ as unknown, the stylist kept it in his own line; kept.')

# 9:34 — the stylist: natural order
V['9:34'] = 'Por que razão o ímpio {irritavit} a Deus? * pois disse no seu coração: Não {requiret}.'
data['choices']['9:34'] = data['choices']['9:34'] + ' Since draft 6 the subject stands before the verb (the stylist: the draft’s order was bookish).'

# 9:35a — the stylist: one 'vós', 'pois'
d = dec['vides']
d['options'].insert(0, opt('Vedes, pois vós considerais', {'vides': 'Vedes, pois vós considerais'},
    'Ruling since draft 6, the stylist’s: the Latin’s pronoun only where the Latin has it (tu with consíderas), and ‘pois’ for the causal quóniam. ‘Vedes’ is the indicative (the imperative is ‘vede’).', 'stylist'))
d['options'][1]['note'] = 'Draft 5: two ‘vós’ close together; the stylist heard the opening heavy and demonstrative — the Latin has no pronoun with vides.'

# 9:37 — Latinist (major) and blind reader agree: 'fora da terra dele' places the dying elsewhere
p = dec['peribitis']
p['why'] += (' Draft 5 had D20’s ‘fora da terra dele’. Here it fails: the Latinist (MAJOR) says it puts the death in another place, where de terra is removal from it, and the blind reader '
             'heard exactly that (‘as nações morrerão fora da terra de Deus’). At 2:12 ‘fora do caminho’ was right because straying from the way is the sense; here it is not.')
p['options'].insert(0, opt('perecereis da terra dele, nações', {'peribitis': 'perecereis da terra dele, nações'},
    'Ruling since draft 6. The Latin’s own preposition (de → de), which here can only be heard as ‘from’ — ‘to die of his land’ says nothing — and the vocative moved to the end so that ‘nações da terra dele’ is not heard as one phrase (order, D2). The verb stays períre → perecer (the Latinist’s ‘desaparecereis’ is another verb).', 'latinist'))
p['options'][1]['note'] = 'Draft 5, D20’s preposition: the Latinist (MAJOR) and the blind reader both heard the nations dying outside the land.'
p['options'].append(opt('desaparecereis, nações, da terra dele', {'peribitis': 'desaparecereis, nações, da terra dele'}, 'The Latinist’s fix: the sense, with another verb.', 'latinist'))
for o in p['options']:
    if o['label'] == 'perecereis, nações, da terra dele':
        o['note'] = 'The calque in the Latin’s order: ‘nações da terra dele’ runs together as ‘nations of his land’.'

# 9:38 — the stylist: 'o preparo'
d = dec['auris']
d['options'].insert(0, opt('o vosso ouvido ouviu o preparo do coração deles', {'auris': 'o vosso ouvido ouviu o preparo do coração deles'},
    'Ruling since draft 6, the stylist’s: ‘preparo’ is the same root as præparátio, shorter, and it is readiness (ἑτοιμασία) — ‘preparo’ in Brazil is being ready for something; it breaks the run of -ção (preparação, coração).', 'stylist'))
d['options'][1]['note'] = 'Draft 5: ‘a preparação do coração deles’ — the stylist heard a monotonous run of -ção; the blind reader heard ‘the inner disposition to pray’ first.'

# 9:39 — the stylist: 'torne mais a se engrandecer'
V['9:39'] = '{v39a}, * para que o homem não {apponat} a se engrandecer sobre a terra.'
a = dec['apponat']
a['options'].insert(0, opt('torne mais', {'apponat': 'torne mais'}, 'Ruling since draft 6, the stylist’s: ‘não torne mais a se engrandecer’ — ‘tornar a’ is the idiom for doing again (appónere, ‘add’), the proclitic ‘se’ as Brazilian speech has it. ‘mais’ kept for ultra, which the stylist’s line dropped.', 'stylist'))
a['options'][1]['note'] = 'Draft 5: ‘não volte mais a engrandecer-se’; the stylist heard the colon long and the enclisis hard before ‘sobre a terra’.'

# 9:37 — the stylist's reversal of the formula, refused (as at 9:6); recorded on decision saeculi
s = dec['saeculi']
rev = next(o for o in s['options'] if o['label'] == 'pelos séculos dos séculos, e para sempre')
rev['note'] += ' The stylist asked for it again at 9:37 (his worst line of the second stage), where the formula ends the first colon; refused for the same reason.'

data['version'] = 6
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 6 written')
