"""Ps 35 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps035/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def add(id, refs, latin, kind, why, options):
    d = {'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options}
    data['decisions'].append(d)
    D[id] = d


data['version'] = 2
data['status'] = 'reviewed'

# 35:3 — the Latinist, MAJOR: ad ódium is purpose / result, not a second coordinated verb
d = D['odium']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Ad odium” exprime uma relação de finalidade ou resultado com o ódio; não'
             ' coordena uma segunda ação com “seja encontrada”» → ‘seja encontrada para ódio’. Taken in the plain form: \'para ser'
             ' odiada\' keeps *ad*\'s purpose (para) and says whose hatred without naming it, as the Latin; the bare \'para ódio\' is'
             ' the calque (option 2). The blind reader heard God finding and hating first — the same hearing survives.')
d['options'].insert(0, opt('seja encontrada para ser odiada', {'odium': 'seja encontrada para ser odiada'},
                           'Ruling (draft 2): the Latinist\'s purpose, in plain Portuguese.', 'latinist'))
d['options'][1]['note'] = 'Draft 1: a coordination the Latin does not have (the Latinist, major).'

# 35:7b — the Latinist, MAJOR: quemádmodum as an exclamation
d = D['quemadmodum']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Quemadmodum” introduz aqui uma exclamação sobre a multiplicação da'
             ' misericórdia. “Assim como” transforma-a numa comparação com a salvação mencionada anteriormente» → ‘como multiplicastes'
             ' a vossa misericórdia, ó Deus!’. Taken: the Greek ὡς, Douay-Rheims (\'O how\') and Matos Soares 1932 (\'Quanto\') all read'
             ' the exclamation, and the Latinist reads the Latin so; draft 1\'s \'the Latin word is comparative\' was one reading made'
             ' the only one. \'como\' with the exclamation mark; the comparison stays as option 1.')
d['options'] = [
    opt('como … !', {'quemadmodum': 'como', 'bang7': '!'}, 'Ruling (draft 2): the exclamation (the Latinist; ὡς; DRB; MS1932).', 'latinist'),
    opt('assim como', {'quemadmodum': 'assim como', 'bang7': '.'}, 'Draft 1: the comparison — refused by the Latinist (major).', 'draft'),
    opt('quanto … !', {'quemadmodum': 'quanto', 'bang7': '!'}, 'Matos Soares 1932: the exclamation, freer.', 'MS1932'),
]
V['35:7b'] = 'Salvareis os homens e os {jumenta}, Senhor: * {quemadmodum} multiplicastes a vossa misericórdia, ó Deus{bang7}'

# 35:9 — the Latinist, minor: voluptátis singular → refused (the voluptas row); the stylist: the regency 'com'
d = D['potabis']
d['why'] += (' Heard (draft 1): the Latinist, minor — «“Voluptatis” está no singular … altera o número» → ‘da vossa delícia’.'
             ' Refused, as the voluptas row refused the same remark at 26:4b: *delícias* is the Portuguese idiom (number is grammar);'
             ' \'da vossa delícia\' is option 2.')
d['options'].append(opt('lhes dareis de beber (… da vossa delícia)', {'potabis': 'lhes dareis de beber'},
                        'The Latinist: the singular noun (V[35:9] would read \'da vossa delícia\').', 'latinist'))
d = D['inebriabuntur']
d['why'] += (' Heard (draft 1): the stylist — «A passiva seguida de “da fartura” tem regência pouco natural» → ‘Ficarão embriagados'
             ' com a fartura’. Taken in part: \'com\', the regency of *embriagar(-se)*; the future passive \'Serão\' kept (the Latin\'s'
             ' voice, μεθυσθήσονται) — \'Ficarão\' is option 3. The blind reader heard drink first: the image, kept (the row).')
d['options'].insert(0, opt('Serão embriagados com', {'inebriabuntur': 'Serão embriagados com'},
                           'Ruling (draft 2): the passive, with the Portuguese regency (the stylist, in part).', 'stylist'))
d['options'][1]['note'] = 'Draft 1 (\'Serão embriagados da\'): the regency the stylist heard as foreign.'
d['options'][1]['forms'] = {'inebriabuntur': 'Serão embriagados da'}
d['options'][2]['forms'] = {'inebriabuntur': 'Embriagar-se-ão com'}
d['options'].append(opt('Ficarão embriagados com', {'inebriabuntur': 'Ficarão embriagados com'}, 'The stylist.', 'stylist'))
V['35:9'] = '{inebriabuntur} a {ubertate} da vossa casa: * e da torrente das vossas delícias {potabis}.'

# 35:5 — the stylist: the direct order, *autem* audible
V['35:5'] = 'Meditou a iniquidade no seu leito: * {astitit} em todo caminho que não é bom, {order5}.'
add('order5', ['35:5'], 'malítiam autem non odívit', 'order',
    'The Latin fronts the object (malítiam … non odívit). Heard (draft 1): the stylist — «A inversão deixa o verbo pendurado no fim e'
    ' soa construída para parecer solene. A ordem direta também permite ouvir melhor a oposição expressa por “autem”» → ‘mas não'
    ' odiou a malícia’. Taken: the order is Portuguese grammar, *autem* is adversative here (he walked the bad way, *but* the malice'
    ' he did not hate), and the colon now ends on a paroxytone (rule 4) instead of \'odiou\'.',
    [opt('mas não odiou a {malitia}', {'order5': 'mas não odiou a {malitia}'}, 'Ruling (draft 2): the stylist.', 'stylist'),
     opt('e a {malitia} não odiou', {'order5': 'e a {malitia} não odiou'}, 'Draft 1: the Latin\'s order; ends oxytone.', 'draft')])
D['malitia']['why'] += (' The blind reader heard \'a intenção de fazer mal\' first, slyness second, innuendo third: the cognate kept.')

# refused with reasons, recorded on the decisions
D['semetipso']['why'] += (' Heard (draft 1): the stylist — «“cometeria faltas” alonga o primeiro membro» → ‘que pecaria em si mesmo’.'
                          ' Refused: *pecar* is peccáre\'s (the delínquere row; 33:22–23 *cometerão faltas*); option 3 is'
                          ' Matos Soares\'s *pecar*. The blind reader heard \'within himself\' and \'against himself\'; the Latin\'s'
                          ' order is kept.')
D['v6b']['why'] += (' Heard (draft 1): the stylist — «esta elipse soa como uma frase interrompida» → ‘e a vossa verdade chega até as'
                    ' nuvens’. Refused: the ellipsis is the Latin\'s, and the colon is said alone as the Matins response (R. *Et'
                    ' véritas tua usque ad nubes*), where a supplied verb weighs more; option 1.')

AMBIGUITY_STEP = {
    'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
    'note': 'Draft 1. 21 items, 5 unknown words (iniquidade ×4, torrente). Heard rightly or within the Latin\'s range: *dos seus olhos* (the unjust man\'s), *à sua vista* (God\'s — the Latin leaves it open), *encontrada e odiada* (God finds and hates), *não quis entender para agir bem*, *Meditou a iniquidade* (plotting), *a malícia* (intent to harm), *um grande abismo* (unfathomable; second, threatening), *Salvareis os homens e os animais*, *os filhos dos homens*, *junto de vós … a fonte da vida*, *na vossa luz veremos a luz*, *o pé da soberba* (the proud man\'s assault), *foram expulsos*.',
    'outcomes': [
        {'verse': '35:3', 'remark': '\'iniquidade\' unknown (also 35:4, 35:5, 35:13)', 'outcome': 'refused', 'reason': 'iníquitas → iniquidade (glossary, every psalm); no plainer word keeps it apart from malítia and nequítia.'},
        {'verse': '35:9', 'remark': '\'torrente\' unknown', 'outcome': 'refused', 'reason': 'torrens → torrente (35:9, 17:5, 109:7); a common word, and the image of drink needs a stream.'},
        {'verse': '35:2', 'remark': '\'cometeria faltas em si mesmo\' heard first as \'against himself\'', 'outcome': 'refused', 'decision': 'semetipso', 'reason': 'The Latin\'s order and words (in semetípso after the verb); \'within himself\' is heard too; option 1 fixes it.'},
        {'verse': '35:3', 'remark': '\'seja encontrada e odiada\' — whose hatred (God\'s, others\', his own)', 'outcome': 'taken', 'decision': 'odium', 'reason': 'Changed for the Latinist (\'para ser odiada\'); the Latin names no hater either.'},
        {'verse': '35:8', 'remark': '\'esperarão\' heard first as waiting', 'outcome': 'refused', 'reason': 'speráre → esperar (row; 7:2, 20:8, 90:2 the same two hearings); the Latin\'s word.'},
        {'verse': '35:9', 'remark': '\'Serão embriagados\' heard as drunk', 'outcome': 'refused', 'decision': 'inebriabuntur', 'reason': 'The image kept unexplained (the inebriáre row, 22:5b).'},
        {'verse': '35:12', 'remark': '\'não me abale\' heard first as faith / composure shaken', 'outcome': 'refused', 'decision': 'moveat', 'reason': 'The movéri row records the same hearing; σαλεύσαι holds both.'},
        {'verse': '35:13', 'remark': '\'Ali\' — where?', 'outcome': 'refused', 'reason': 'Ibi, the Latin\'s; its place is not named.'},
        {'verse': '35:7', 'remark': '\'um grande abismo\' heard as threat', 'outcome': 'refused', 'decision': 'abyssus', 'reason': 'Unfathomable was the first reading; the image is the Latin\'s.'},
    ]}

REVISION_NOTE = ('ps035/revise_v2.py: 35:3 \'seja encontrada para ser odiada\' (Latinist MAJOR); 35:7b \'como multiplicastes … ó Deus!\''
                 ' (Latinist MAJOR); 35:5 \'mas não odiou a malícia\' (the stylist); 35:9 \'Serão embriagados com a fartura\' (the'
                 ' stylist, in part). Refused with options: 35:2 \'pecaria\', 35:6 \'chega até as nuvens\', 35:9 \'da vossa delícia\'.')

data['audit'] += [
    {'step': 'checks', 'note': 'Draft 1: hard pass. 35:3 second +6, 35:4 first +6 / second −4, 35:2 first +4, 35:5 first −3. 35:4 and 35:5 end on oxytones (\'bem\', \'odiou\').'},
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. Two majors, one minor. «A tradução conserva, em geral, o conteúdo e as imagens do latim; os desvios identificados dizem respeito a duas relações sintáticas e a um singular traduzido pelo plural.» Passed \'cometeria faltas em si mesmo\', \'agiu com engano à sua vista\', \'pôs-se em todo caminho\', \'malícia\', the 35:6 ellipsis, \'animais\', \'ao abrigo\', \'fartura\', \'junto de vós\', \'não me abale\'.',
     'outcomes': [
         {'verse': '35:3', 'remark': 'MAJOR: \'e odiada\' coordinates what *ad ódium* subordinates → \'seja encontrada para ódio\'', 'outcome': 'taken', 'decision': 'odium',
          'reason': 'As \'para ser odiada\'; his calque is option 2.'},
         {'verse': '35:7b', 'remark': 'MAJOR: *quemádmodum* is an exclamation, \'assim como\' makes a comparison → \'como multiplicastes … ó Deus!\'', 'outcome': 'taken', 'decision': 'quemadmodum'},
         {'verse': '35:9', 'remark': 'minor: *voluptátis* singular → \'da vossa delícia\'', 'outcome': 'refused', 'decision': 'potabis',
          'reason': 'The voluptas row (26:4b, the same remark refused): the plural is the idiom; the singular is an option.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Four remarks; best 35:10, worst 35:2. «O salmo tem sobriedade e imagens fortes, mas algumas inversões e elipses ainda fazem ouvir a tradução por trás da oração.» Two taken (one in part), two refused with options.',
     'outcomes': [
         {'verse': '35:2', 'remark': 'worst line: \'cometeria faltas\' long → \'que pecaria em si mesmo\'', 'outcome': 'option', 'decision': 'semetipso',
          'reason': '*pecar* is peccáre\'s; delínquere → cometer faltas (row).'},
         {'verse': '35:5', 'remark': 'the inversion leaves the verb hanging → \'mas não odiou a malícia\'', 'outcome': 'taken', 'decision': 'order5'},
         {'verse': '35:6', 'remark': 'the ellipsis sounds interrupted → \'e a vossa verdade chega até as nuvens\'', 'outcome': 'option', 'decision': 'v6b',
          'reason': 'The Latin\'s ellipsis; the colon is the Matins response said alone.'},
         {'verse': '35:9', 'remark': '\'Serão embriagados da fartura\' a foreign regency → \'Ficarão embriagados com a fartura\'', 'outcome': 'taken', 'decision': 'inebriabuntur',
          'reason': 'In part: \'com\'; the passive \'Serão\' kept (the Latin\'s voice); \'Ficarão\' is option 4.'}]},
    AMBIGUITY_STEP,
    {'step': 'revision', 'version': 2, 'note': REVISION_NOTE},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written;', len(data['decisions']), 'decisions')
