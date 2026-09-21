"""Ps 24 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps024/revise_v2.py
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


def decision(id, refs, latin, kind, why, options):
    data['decisions'].append({'id': id, 'refs': refs, 'latin': latin, 'kind': kind, 'why': why, 'options': options})


data['version'] = 2
data['status'] = 'reviewed'

# 24:19 — the Latinist's MAJOR (odérunt is a perfect with present sense); also mends the stylist's rhyme
verses['24:19'] = '{respice} para os meus inimigos, porque se multiplicaram, * e com ódio iníquo {oderunt}.'
decision('oderunt', ['24:19'], 'et ódio iníquo odérunt me', 'grammar',
         'odísse is defective: the perfect form has present sense ("I hate"). Heard (draft 1): the Latinist, MAJOR — «Odérunt é perfeito'
         ' de forma, mas tem sentido presente: expressa o ódio atual dos inimigos. “Odiaram” desloca esse estado para o passado» (Allen and'
         ' Greenough § 205) → ‘me odeiam’. Taken, as Ps 17:18 already has it (‘que me odeiam’). It also mends the stylist’s remark on the'
         ' rhyme ‘multiplicaram / odiaram’ at the two cadences; his reorder (‘e me odeiam com ódio iníquo’) would end on the proparoxytone'
         ' ‘iníquo’ and is not needed. The glossary’s 118:104 ‘odívi → odiei’ is the late perfect odívi, another form.',
         [option('me odeiam', {'oderunt': 'me odeiam'}, 'Ruling (draft 2): the present sense of odi (the Latinist; 17:18).', 'latinist'),
          option('me odiaram', {'oderunt': 'me odiaram'}, 'Draft 1: the perfect form taken as a past; rhymes with ‘multiplicaram’.', 'draft')])

# 24:7b — the stylist on 'lembrai-vos de mim, vós'
d = decisions['memento']
d['why'] += (' Heard (draft 1): the stylist — «O “vós” isolado depois de “mim” soa como uma correção acrescentada» → ‘vós lembrai-vos de'
             ' mim’. Taken in another form: the emphatic subject right after the imperative, ‘lembrai-vos vós de mim’, the Portuguese'
             ' place for a stressed subject of an imperative (his ‘vós lembrai-vos’ reads as an indicative). tu kept.')
demote(d)
d['options'].insert(0, option('lembrai-vos vós de mim', {'memento': 'lembrai-vos vós de mim'},
                              'Ruling (draft 2): the emphatic subject after the verb.', 'stylist'))

# 24:12 — the stylist: the hidden subject
d = decisions['statuit']
d['why'] += (' Heard (draft 1): the stylist — «o sujeito oculto deixa o ouvinte procurando quem age. “Firmar uma lei” também soa pouco'
             ' natural» → ‘O Senhor lhe estabeleceu uma lei’. The subject taken as a pronoun (D2: a subject pronoun may be supplied):'
             ' ‘ele lhe firmou uma lei’ — ‘ele’ follows ‘o Senhor’ at the end of the question, as the Latin’s unnamed subject does; naming'
             ' the Lord is his option. ‘estabelecer’ refused: constitúere’s; statúere → firmar is the glossary’s (118:38).')
verses['24:12'] = 'Quem é o homem que teme o Senhor? * {statuit} uma lei no caminho que escolheu.'
demote(d)
d['options'].insert(0, option('ele lhe firmou', {'statuit': 'ele lhe firmou'},
                              'Ruling (draft 2): the subject supplied as a pronoun.', 'stylist'))
d['options'].append(option('o Senhor lhe estabeleceu', {'statuit': 'o Senhor lhe estabeleceu'},
                           'The stylist’s line: the subject named, constitúere’s verb.', 'stylist'))

# 24:14 — the stylist's worst line: the hanging clause
d = decisions['manifestetur']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «A elipse soa como uma frase interrompida» → ‘e a sua aliança é para que lhes'
             ' seja manifestada’. Taken: a copula supplied (D2), the Latin’s purpose clause kept whole.')
demote(d)
verses['24:14'] = 'O Senhor é o {firmamentum} dos que o temem: * e a sua {testamentum} {manifestetur}.'
d['options'][0]['forms'] = {'manifestetur': ', para que lhes seja manifestada'}
d['options'][1]['forms'] = {'manifestetur': 'lhes será manifestada'}
d['options'][1]['note'] = 'Douay-Rheims: a future supplied.'
d['options'].insert(0, option('é para que lhes seja manifestada', {'manifestetur': 'é para que lhes seja manifestada'},
                              'Ruling (draft 2): the copula supplied (the stylist).', 'stylist'))

# 24:15 — the stylist: verbless
d = decisions['oculi']
d['why'] += (' Heard (draft 1): the stylist — «A ausência de verbo torna a abertura uma indicação abreviada» → ‘Os meus olhos estão sempre'
             ' voltados para o Senhor’. Taken: the draft’s option 2 and the glossary’s respícere build (10:5b); D2 lets the copula in,'
             ' and the antiphon stands as well with it.')
demote(d)
d['options'][0], d['options'][1] = d['options'][1], d['options'][0]
d['options'][0]['note'] = 'Ruling (draft 2): the verb supplied (the stylist; 10:5b).'

# 24:17 — the stylist: cadence of 'multiplicaram-se', and the order of the second colon
verses['24:17'] = 'As tribulações do meu coração se multiplicaram: * {erue} das minhas {necessitatibus}.'
d = decisions['erue']
d['why'] += (' Heard (draft 1): the stylist — ‘multiplicaram-se’ before the asterisk puts the stress three syllables from the end, and the'
             ' object first after it piles up inversions → ‘As tribulações do meu coração se multiplicaram: * libertai-me das minhas'
             ' necessidades’. Both taken (order only).')

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
