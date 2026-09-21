"""Ps 31 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps031/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; appends audit_v2.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}
verses = data['verses']


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


def decision(id, refs, latin, kind, why, options):
    data['decisions'].append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options})


data['version'] = 2
data['status'] = 'reviewed'

# 31:8 — the Latinist's major: 'hac' dropped
verses['31:8'] = 'Eu {intellectum}, e te instruirei neste caminho por onde andarás: * {firmabo} sobre ti os meus olhos.'
d = decisions['intellectum']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «O demonstrativo hac foi omitido» → ‘neste caminho por onde andarás’. Taken (a slip of'
             ' draft 1). The blind reader heard the Lord speaking in 31:8 though the change of voice is not announced — as the Latin.')

# 31:2 — the stylist ('imputou' juridical) and the blind reader (unknown)
d = decisions['imputavit']
d['why'] += (' Heard (draft 1): the stylist — «“Imputou” traz um tom jurídico e pouco corrente à oração» → ‘não atribuiu pecado’; the blind'
             ' reader listed \'imputou\' as unknown. Taken: \'atribuir\' is the plainer of two faithful words for the reckoning (λογίζομαι; D2);'
             ' the cost is the echo of Romans 4:8 as the Church\'s Portuguese says it (\'imputar\', from memory, unverified), which a reader'
             ' of the Latin column still sees. \'imputou\' is option 1.')
demote(d)
d['options'].insert(0, option('atribuiu', {'imputavit': 'atribuiu'}, 'Ruling (draft 2): the stylist; the blind reader.', 'stylist'))

# 31:4 — the stylist's worst line ('se fez pesada' translated; the subject late)
verses['31:4'] = 'Porque de dia e de noite {gravata}: * {conversus} {aerumna}, {spina}.'
d = decisions['gravata']
d['why'] += (' Heard (draft 1): the stylist\'s worst line — «“Se fez pesada” soa traduzido; o sujeito chega tarde» → ‘Porque de dia e de noite'
             ' a vossa mão ficou pesada sobre mim’. Taken whole: the subject first (order, D2), and \'ficou pesada\' still says the change'
             ' (\'became heavy\'), which the Latin\'s passive is.')
for x in d['options']:
    x['forms'] = {'gravata': x['forms']['gravata'] + ' sobre mim a vossa mão'}
demote(d)
d['options'].insert(0, option('a vossa mão ficou pesada sobre mim', {'gravata': 'a vossa mão ficou pesada sobre mim'},
                              'Ruling (draft 2): the stylist; subject first.', 'stylist'))

# 31:5b — the stylist + the blind reader: 'contra mim a minha injustiça' may be heard as an injustice done to me
verses['31:5b'] = '{order5b}: * e vós {remisisti} a impiedade do meu pecado.'
decision('order5b', ['31:5b'], 'Dixi: Confitébor advérsum me injustítiam meam Dómino', 'order',
         'Heard (draft 1): the stylist — «“Contra mim a minha” amontoa sons semelhantes e intercala uma expressão difícil» → ‘Disse: Contra mim'
         ' mesmo, confessarei ao Senhor a minha injustiça’; the blind reader: \'Confessarei contra mim a minha injustiça\' can be heard as'
         ' \'an injustice committed against me\'. Taken whole: \'contra mim mesmo\' fronted cannot attach to \'injustiça\'; \'mesmo\' is the'
         ' reflexive emphasis Portuguese needs (Matos Soares 1932 has it); the order is grammar (D2). confitéri of sin → confessar (D5).',
         [option('Disse: Contra mim mesmo, confessarei ao Senhor a minha injustiça',
                 {'order5b': 'Disse: Contra mim mesmo, {confitebor} ao Senhor a minha injustiça'}, 'Ruling (draft 2): the stylist.', 'stylist'),
          option('Eu disse: Confessarei contra mim a minha injustiça ao Senhor',
                 {'order5b': 'Eu disse: Confessarei contra mim a minha injustiça ao Senhor'}, 'Draft 1: the Latin\'s order; misheard.', 'draft')])
decisions['confitebor']['options'][0]['forms'] = {'confitebor': 'confessarei'}
decisions['confitebor']['options'][0]['label'] = 'confessarei'

# 31:6 — the stylist: direct order
verses['31:6'] = '{pro_hac}, {omnis_sanctus} orará a vós, * no tempo oportuno.'
d = decisions['pro_hac']
d['why'] += (' Draft 2: the stylist\'s direct order taken (\'Por isto, todo santo orará a vós\'; draft 1 \'Por isto orará a vós todo santo\').'
             ' The blind reader heard \'Por isto\' as \'because God forgave\' — the reading intended.')
d = decisions['omnis_sanctus']
d['why'] += (' Heard (draft 1): the blind reader took \'todo santo\' as the saints the Church venerates first, a person who lives by God'
             ' second — the same hearing as 30:24 \'seus santos\'; the Latin\'s sanctus (ὅσιος) is the same word either way. Kept.')

# 31:9b — the blind reader heard 'apertai' as said to the congregation (the vós of 31:9); the Latin changes to the singular
verses['31:9b'] = 'Com {camo} e freio, {domine9}{constringe} as {maxillas} deles, * que não se aproximam de vós.'
decision('domine9', ['31:9b'], 'In camo et freno maxíllas eórum constrínge (singular, after Nolíte, plural)', 'grammar',
         'The Latin tells the two addressees apart by number: \'Nolíte fíeri\' (plural, men) and then \'constrínge … ad te\' (singular, God).'
         ' Portuguese says \'vós\' to both. Heard (draft 1): the blind reader took \'apertai as queixadas deles\' as \'an order to the'
         ' community to restrain the animals\' — a cost of vós, as at 10:2, where the remedy was to name the subject. Here the hidden subject'
         ' of constrínge is named in the vocative (rule 2: a subject hidden in a verb ending may be named): \'Senhor\'. Matos Soares 1932'
         ' does the same in parentheses (\'sujeita (ó Senhor)\').',
         [option('Senhor, ', {'domine9': 'Senhor, '}, 'Ruling (draft 2): the addressee named.', 'MS1932'),
          option('(none)', {'domine9': ''}, 'Draft 1: heard as said to the congregation.', 'draft')])
decision('maxillas', ['31:9b'], 'maxíllas eórum', 'word',
         'maxíllæ (σιαγόνας; only here): jaws. Heard (draft 1): the blind reader listed \'queixadas\' (Matos Soares 1932) as unknown. \'maxilas\''
         ' is the Latin\'s own word and known from anatomy; \'mandíbulas\' the same thing.',
         [option('maxilas', {'maxillas': 'maxilas'}, 'Ruling (draft 2): the cognate, known.', 'draft'),
          option('queixadas', {'maxillas': 'queixadas'}, 'Draft 1 (MS1932): unknown to the blind reader.', 'MS1932'),
          option('mandíbulas', {'maxillas': 'mandíbulas'}, 'The same, anatomical.', 'draft')])

# 31:10 — the stylist: the fronted object makes 'aquele' sound like the subject; the rhyme pecador / Senhor avoided by the first colon
verses['31:10'] = '{multa}, * {sperantem}.'
d = decisions['sperantem']
d['why'] += (' Heard (draft 1): the stylist — «A abertura faz esperar que “aquele” seja o sujeito; a chegada de “a misericórdia” obriga a'
             ' reorganizar a frase» → ‘mas a misericórdia cercará aquele que espera no Senhor’. Taken, and the rhyme it brings (pecador /'
             ' Senhor at the two cadences) is mended in the first colon instead (decision multa).')
demote(d)
d['options'].insert(0, option('mas a misericórdia cercará aquele que espera no Senhor',
                              {'sperantem': 'mas a misericórdia cercará aquele que espera no Senhor'}, 'Ruling (draft 2): the stylist.', 'stylist'))
d['options'] = [d['options'][0], d['options'][1]]
decision('multa', ['31:10'], 'Multa flagélla peccatóris', 'order',
         'The Latin is verbless and fronts the adjective. With the second colon in natural order (the stylist), \'Muitos são os flagelos do'
         ' pecador\' rhymes with \'Senhor\' at the final. The subject first, \'Os flagelos do pecador são muitos\', ends the colon on'
         ' \'muitos\' — a copula supplied, the order Portuguese\'s (D2). flagéllum → flagelo (90:10; listed as unknown by the blind reader,'
         ' who still heard \'the punishments the sinner receives\').',
         [option('Os flagelos do pecador são muitos', {'multa': 'Os flagelos do pecador são muitos'}, 'Ruling (draft 2): no rhyme.', 'draft'),
          option('Muitos são os flagelos do pecador', {'multa': 'Muitos são os flagelos do pecador'}, 'Draft 1: the Latin\'s order; rhymes with Senhor after draft 2.', 'draft')])

steps = json.loads((folder / 'audit_v2.json').read_text(encoding='utf-8'))
data['audit'].extend(steps)
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
