"""Ps 25 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps025/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
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


data['version'] = 2
data['status'] = 'reviewed'

# 25:5 — the Latinist's MAJOR: odívi has present sense
d = decisions['odivi']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Odi é um perfeito com sentido presente: exprime o ódio atual do salmista.'
             ' “Odiei” desloca essa afirmação para o passado» → ‘Odeio’. Taken: odívi is the Vulgate\'s form of odi, whose perfect is'
             ' present in sense (24:19 odérunt → ‘me odeiam’, the same Latinist\'s ruling there); here it heads a vow whose other verbs are'
             ' futures (non introíbo, non sedébo). The glossary row odísse gets the note that 118:104 ‘odiei’ is to be re-read by it.')
demote(d)
d['options'][0], d['options'][1] = d['options'][1], d['options'][0]
d['options'][0]['note'] = 'Ruling (draft 2): the present sense of odi (the Latinist; 24:19).'
d['options'][0]['from'] = 'latinist'

# 25:3 — the stylist and the blind reader: 'comprazi' bookish / unknown
d = decisions['complacui']
d['why'] += (' Heard (draft 1): the stylist — «“Me comprazi” soa livresco e pouco corrente» → ‘achei prazer na vossa verdade’; the blind'
             ' reader listed ‘comprazi’ as unknown. Taken: ‘achar prazer em’ says complacére in (take pleasure in) with the preposition'
             ' kept; of two faithful words the plainer (D2). The Latin root is lost; ‘me comprazi’ stays an option.')
demote(d)
d['options'].insert(0, option('achei prazer na vossa verdade', {'complacui': 'achei prazer na vossa verdade'},
                              'Ruling (draft 2): the stylist\'s words, the plain idiom for taking pleasure in.', 'stylist'))

# 25:2 — the blind reader heard 'tentai-me' first as 'lead me into sin'
d = decisions['tenta']
d['why'] += (' Heard (draft 1): the blind reader took ‘tentai-me’ first as «Induzi-me a pecar» — a wrong first hearing, which the'
             ' Latin beside ‘Proba me’ does not give (tentáre there is to put to the test). Changed to ‘experimentai-me’: the verb of'
             ' trying and testing, free in the glossary, kept apart from provar (probáre) in the same colon, and safe at the vós'
             ' imperative (past ‘experimentei’). Where men tempt God (77:18, 77:41, 77:56, 94:8, 105:14) ‘tentar’ is heard rightly and'
             ' can stay; the split is recorded in the glossary.')
demote(d)
d['options'].insert(0, option('experimentai-me', {'tenta': 'experimentai-me'},
                              'Ruling (draft 2): testing, not temptation, heard first.', 'ambiguity'))

# 25:4 — the blind reader heard 'o conselho' as advice; the stylist on the order of the second colon
d = decisions['concilium']
d['why'] += (' Heard (draft 1): the blind reader took ‘com o conselho da vaidade’ first as «uma recomendação ditada pela vaidade» — the'
             ' cost D33 names for conselho. The preposition changes, not the word: ‘Não me sentei no conselho da vaidade’ — one sits'
             ' ON a council, and the body is heard (Matos Soares 1932 has ‘na assembléia’). cum → ‘em’ is grammar.')
verses['25:4'] = 'Não me sentei {concilium} {vanitatis}: * e com {iniqua} não entrarei.'
for o in d['options']:
    word = o['forms']['concilium']
    o['forms']['concilium'] = 'no ' + word[2:] if word.startswith('o ') else 'na ' + word[2:]
d['options'][0]['note'] = 'Ruling (draft 2): the body, sat in (the blind reader heard advice after ‘com’).'
d['options'].append(option('com o conselho', {'concilium': 'com o conselho'},
                           'Draft 1: the Latin\'s cum; heard as advice.', 'draft'))
d = decisions['iniqua']
d['why'] += (' Heard (draft 1): the stylist — the long complement before the verb leaves the colon hanging, and ‘fazem coisas'
             ' iníquas’ is heavy → ‘e não entrarei com os que praticam iniquidades’. Refused: ‘praticar’ is operári iniquitátem\'s'
             ' (another Latin build), and his order ends the verse on a proparoxytone (‘iníquas’) or on that verb\'s noun; the verb last'
             ' is the Latin\'s order and gives the cadence (‘entrarei’, as 25:5 ‘sentarei’). His line is an option. The blind reader'
             ' listed ‘iníquas’ unknown: the glossary\'s iníquus.')
d['options'].append(option('e não entrarei com os que praticam iniquidades (the stylist)',
                           {'iniqua': 'os que praticam iniquidades'},
                           'The stylist\'s words (with the verb moved his way the verse would read ‘e não entrarei com …’); operári\'s verb.',
                           'stylist'))

# 25:9 — the stylist: the vocative in the middle
d = decisions['perdas']
d['why'] += (' Heard (draft 1): the stylist — «O vocativo entre “os ímpios” e “a minha alma” obriga a uma mudança brusca de entonação»'
             ' → ‘Deus, não façais perecer com os ímpios a minha alma’. Taken (order, D2): the vocative first; the versicle still stands'
             ' alone, and its response (‘nem com os homens de sangue a minha vida’) is unchanged.')
verses['25:9'] = 'Deus, {perdas} com os ímpios a minha alma, * nem com os homens de {sanguinum} a minha vida:'
for o in d['options']:
    o['forms']['perdas'] = o['forms']['perdas'].replace('Não', 'não')

# 25:10 — the stylist's worst line: the inversion; 'dádivas'
d = decisions['muneribus']
d['why'] += (' Heard (draft 1): the stylist\'s worst line — «A inversão soa construída … “Dádivas” acrescenta solenidade» → ‘a direita'
             ' deles está cheia de presentes’. The order taken back (draft 1 had inverted only to avoid ending on the proparoxytone'
             ' ‘dádivas’; the Latin itself ends on the proparoxytone munéribus, so the cadence is the Latin\'s). The word refused for'
             ' the glossary (14:4b ‘dádivas’; the row is open) — ‘presentes’ is its option, and the row gets the evidence. The blind'
             ' reader heard gifts first, bribes by inference, as in 14:4b.')
verses['25:10'] = 'Em cujas mãos há iniquidades: * a direita deles está cheia de {muneribus}.'
data['choices']['25:10'] = data['choices']['25:10'].split(' The second colon is turned')[0] + (
    ' The natural order ends the verse on the proparoxytone ‘dádivas’, as the Latin ends on munéribus (draft 1 had turned the'
    ' colon; the stylist\'s worst line).')

# 25:5 choice and odivi option
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
