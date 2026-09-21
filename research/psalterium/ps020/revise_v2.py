"""Ps 20 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps020/revise_v2.py
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


def byLabel(d, label):
    return next(o for o in d['options'] if o['label'] == label)


data['version'] = 2
data['status'] = 'reviewed'

# 20:4 — the Latinist (minor): anticipation lost in 'viestes ao encontro dele'
d = decisions['praevenisti']
d['why'] += (' Heard (draft 1): the Latinist, minor — «A tradução não conserva a ideia de antecipação expressa pelo verbo» → ‘vos antecipastes'
             ' a ele’. Taken in substance with the glossary’s own verb for prævenire (118:147–148 ‘Adiantei-me’), so that the psalter keeps one'
             ' verb for the Latin one; ‘antecipar’ stays anticipáre’s (76:5, 78:8 ut cito anticípent nos misericórdiæ tuæ). The blind reader'
             ' did not stop at the line.')
demote(d)
adiantar = byLabel(d, 'vos adiantastes a ele')
d['options'].remove(adiantar)
adiantar['note'] = ('Ruling (draft 2): the anticipation kept (the Latinist), in prævenire’s verb in this psalter (118:147–148); God is first'
                    ' with his blessings — the ‘prevenient’ sense, said in plain Portuguese.')
adiantar['from'] = 'latinist'
d['options'].insert(0, adiantar)
d['options'].append(option('vos antecipastes a ele', {'praevenisti': 'vos antecipastes a ele'},
                           'The Latinist’s words; ‘antecipar’ is left to anticipáre (76:5, 78:8).', 'latinist'))

# 20:5 — the stylist (the proparoxytone final); the Latinist (minor: the plural of séculos)
d = decisions['longitudo']
d['why'] += (' Heard (draft 1): the Latinist, minor — the plural ‘pelos séculos dos séculos’ for the singular (→ ‘pelo século do século’) —'
             ' refused: settled in D27. The stylist — «O final proparoxítono deixa duas sílabas átonas depois do apoio da voz» → ‘e lhe destes,'
             ' para sempre e pelos séculos dos séculos, longos dias’. Refused, kept as an option: the Latin itself ends on sǽculi, the formula'
             ' ends a verse wherever it stands in the psalter (9:6), and his line holds the object back behind a parenthesis of nine syllables.')
data['decisions'].insert(data['decisions'].index(d) + 1, {
    'id': 'longitudo_order', 'refs': ['20:5'], 'latin': 'et tribuísti ei longitúdinem diérum in sǽculum, et in sǽculum sǽculi',
    'kind': 'order',
    'why': ('The stylist asked for the formula inside the colon so that the verse does not end on the proparoxytone ‘séculos’. Refused: the Latin'
            ' ends on sǽculi too, and the formula (D27) closes verses throughout the psalter; the parenthesis holds ‘longos dias’ back nine'
            ' syllables.'),
    'options': [
        option('e lhe destes … para sempre, e pelos séculos dos séculos', {'o5': 'e lhe destes {longitudo} para sempre, e pelos séculos dos séculos'},
               'Ruling: the Latin’s order.', 'draft'),
        option('e lhe destes, para sempre e pelos séculos dos séculos, …', {'o5': 'e lhe destes, para sempre e pelos séculos dos séculos, {longitudo}'},
               'The stylist’s line: the verse ends on ‘dias’.', 'stylist'),
    ]})
verses['20:5'] = 'Pediu-vos vida: * {o5}.'

# 20:6 — the stylist: direct order
data['decisions'].insert(data['decisions'].index(decisions['decor']) + 1, {
    'id': 'order6', 'refs': ['20:6'], 'latin': 'glóriam et magnum decórem impónes super eum',
    'kind': 'order',
    'why': ('Heard (draft 1): the stylist — «O objeto anteposto retarda o verbo e faz ouvir a construção latina. A ordem direta conserva a imagem e'
            ' dá mais firmeza ao final» → ‘poreis sobre ele glória e grande esplendor’. Taken: order only (D2). What is lost: the Latin fronts'
            ' ‘glóriam’ against the first colon’s ‘glória’ (a chiasmus); the two still stand in one verse.'),
    'options': [
        option('poreis sobre ele glória e grande …', {'o6': 'poreis sobre ele glória e grande {decor}'},
               'Ruling (draft 2): the stylist’s direct order; the verse ends on the oxytone ‘esplendor’.', 'stylist'),
        option('glória e grande … poreis sobre ele', {'o6': 'glória e grande {decor} poreis sobre ele'},
               'Draft 1: the Latin’s order, the object first.', 'draft'),
    ]})
verses['20:6'] = 'Grande é a sua glória na vossa salvação: * {o6}.'

# 20:7 — the blind reader heard the Greek's reading; the stylist: the formula first
d = decisions['dabis']
d['why'] += (' Heard (draft 1): the blind reader heard ‘o dareis como bênção’ FIRST as «Concedereis bênçãos ao próprio rei» — the Greek’s'
             ' dative, which the Latin does not have: a wrong first hearing. Taken: ‘fareis dele uma bênção’ (Douay-Rheims’ sense, ‘give him to'
             ' be a blessing’), where the king can only be the blessing. The cost: dare becomes ‘fazer’. The stylist — «“Séculos” termina a'
             ' primeira metade com duas sílabas depois da tônica» → ‘Porque pelos séculos dos séculos o dareis como bênção’: his order taken'
             ' (order only; the mediant on ‘bênção’). The Latinist’s minor on the plural ‘séculos’ refused (D27).')
demote(d)
fazer = byLabel(d, 'fareis dele uma bênção')
d['options'].remove(fazer)
fazer['note'] = ('Ruling (draft 2): the king made a blessing, which the blind reader could not hear in ‘o dareis como bênção’; the stylist’s'
                 ' order, so that the mediant falls on ‘bênção’.')
fazer['from'] = 'ambiguity'
d['options'].insert(0, fazer)
verses['20:7'] = 'Porque pelos séculos dos séculos {dabis}: * o alegrareis {gaudio} com o vosso rosto.'

d = decisions['gaudio']
d['why'] += (' Heard (draft 1): the blind reader listed ‘júbilo’ as unknown (and understood the verse). Kept: the other two candidates fail'
             ' (see options); for the glossary row gáudium.')

# 20:9 — the stylist: 'Que a vossa mão seja encontrada'
d = decisions['inveniatur']
d['why'] += (' Heard (draft 1): the stylist — «A abertura soa como uma determinação formal. Um “que” torna mais natural a súplica, sem desfazer a'
             ' passiva» → ‘Que a vossa mão seja encontrada por todos os vossos inimigos’. Taken (order and the particle of wish; the passive'
             ' and the verb kept). The blind reader heard the hand reaching the enemies, by the pull of the second colon — the sense.')
for o in d['options']:
    o['forms']['inveniatur9a'] = o['forms']['inveniatur9a'].replace('Seja ', 'seja ')
a = decisions['address']
a['options'][0]['forms']['a9a'] = 'Que a vossa mão {inveniatur9a} por todos os vossos inimigos'
a['options'][1]['forms']['a9a'] = 'Que a tua mão {inveniatur9a} por todos os teus inimigos'
a['why'] += (' Heard (draft 1): the blind reader took 20:9 as said to the Lord and, at 20:10, kept ‘vós’ as the Lord «embora a mudança para o'
             ' Senhor possa causar dúvida» — the doubt the Latin itself raises; no reader asked for the tu reading.')

# 20:12 — the stylist's worst line: 'desviaram … contra', 'pensaram conselhos'; the blind reader heard advice
d = decisions['declinaverunt']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «“Desviar contra” combina movimentos que não se encaixam espontaneamente em'
             ' português; o ouvido espera “desviar de”» → ‘voltaram males contra vós’; the blind reader heard ‘directed evils against you’'
             ' by context, and ‘warded off evils’ second. Taken: the turning is kept, and declináre with an object meets convértere nowhere in'
             ' this psalm. Cost: ‘voltar’ is convértere’s verb elsewhere.')
demote(d)
volt = byLabel(d, 'voltaram males')
d['options'].remove(volt)
volt['note'] = 'Ruling (draft 2): the stylist’s verb — the plainest ‘turn against’.'
volt['from'] = 'stylist'
d['options'].insert(0, volt)

data['decisions'].insert(data['decisions'].index(d) + 1, {
    'id': 'consilia', 'refs': ['20:12'], 'latin': 'cogitavérunt consília, quæ non potuérunt stabilíre',
    'kind': 'word',
    'why': ('cogitáre → pensar em (glossary); consílium: in Ps 19:5 the Latinist and the blind reader both refused ‘conselho(s)’ for a person’s'
            ' plan (advice was heard), and that verse took ‘desígnio’. Here the blind reader heard ‘pensaram conselhos’ FIRST as «recomendações ou'
            ' orientações» and the stylist found the pair not current («parece falar de recomendações pensadas») → ‘pensaram em planos que não'
            ' puderam firmar’. Taken with Ps 19’s noun, so that the king’s ‘desígnio’ confirmed (19:5) and the enemies’ ‘desígnios’ not made firm'
            ' (20:12) answer each other as the Latin’s consílium … consília do. stabilíre → firmar (glossary statúere, open).'),
    'options': [
        option('pensaram em desígnios', {'c12': 'pensaram em desígnios'},
               'Ruling (draft 2): the stylist’s build (‘pensar em’, the glossary’s cogitáre) with Ps 19:5’s noun.', 'stylist'),
        option('pensaram em planos', {'c12': 'pensaram em planos'}, 'The stylist’s line: the plainer noun.', 'stylist'),
        option('pensaram conselhos', {'c12': 'pensaram conselhos'}, 'Draft 1: the glossary noun; heard as advice.', 'draft'),
    ]})
verses['20:12'] = 'Porque {declinaverunt} {a12}: * {c12} que não puderam firmar.'

# 20:13 — the Latinist, MAJOR: 'dar as costas' explains the predicate noun
d = decisions['dorsum']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Dorsum” é predicativo de “eos”: fareis deles um dorso. “Dar as costas” explica a imagem'
             ' como uma ação, resolvendo a expressão peculiar do latim» → ‘fareis deles um dorso’; the blind reader heard ‘fareis os inimigos'
             ' fugir’ first. Taken in substance: the predicate is kept as a state, with the copula Portuguese needs (D2) — ‘os fareis ficar de'
             ' costas’, ‘you will make them be backs-turned’ — and ‘costas’, the Portuguese back (‘dorso’ is an animal’s or a book’s).'
             ' ‘dar’, which the Latin does not have, is gone.')
demote(d)
for o in d['options']:
    o['forms']['dorsum'] = 'os {a13a} ' + o['forms']['dorsum']
d['options'].insert(0, option('ficar de costas', {'dorsum': 'os {a13a} ficar de costas'},
                              'Ruling (draft 2): the predicate as a state (the Latinist), the copula ‘ficar’ supplied; the back kept.', 'latinist'))
d['options'].append(option('fareis deles um dorso', {'dorsum': '{a13a} deles um dorso'},
                           'The Latinist’s line: ‘fazer de X Y’ is the glossary build for pónere + predicate (17:12); ‘dorso’ is an animal’s or a'
                           ' book’s back in Portuguese, not a man’s.', 'latinist'))
verses['20:13'] = 'Porque {dorsum}: * {a13b} o rosto deles.'

# 20:14 — the Latinist, MAJOR: plural and function of virtútes; the stylist: the echo at both cadences
d = decisions['virtutes']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Virtutes” está no plural e designa o conteúdo celebrado pelos dois verbos. A tradução o'
             ' reduz ao poder singular e o apresenta como destinatário dos salmos» → ‘cantaremos e celebraremos em salmos as vossas forças’.'
             ' Taken in substance: the plural back, and the accusative — ‘entoar em salmos’ keeps D25’s two words (entoar … salmos) while'
             ' taking a direct object; ‘forças’ refused (força is fortitúdo’s), ‘celebrar’ refused (D25). The stylist — «A mesma palavra nos'
             ' dois pousos produz um eco excessivamente marcado» → ‘Senhor, no vosso poder, exaltai-vos’: refused, kept as an option — the'
             ' echo is the Latin’s own (in virtúte tua … virtútes tuas, at the same two cadences; rule 5’s exception), and ‘Exaltai-vos’ opens'
             ' the formula of 56:6, 56:12, 107:6.')
demote(d)
d['options'].insert(0, option('e entoaremos em salmos os vossos poderes', {'virtutes': 'e entoaremos em salmos os vossos poderes'},
                              'Ruling (draft 2): the Latin’s plural and its accusative; ‘poderes’ can also serve the plural virtútes of 102:21, 148:2'
                              ' (the Powers who praise).', 'latinist'))
for o in d['options'][1:]:
    o['forms']['virtutes'] = 'e entoaremos salmos ' + o['forms']['virtutes']
d['options'].append(option('e celebraremos em salmos as vossas forças', {'virtutes': 'e celebraremos em salmos as vossas forças'},
                           'The Latinist’s line: ‘celebrar’ is not D25’s verb, ‘força’ is fortitúdo’s.', 'latinist'))
verses['20:14'] = '{exaltare}: * cantaremos {virtutes}.'
data['decisions'].append({
    'id': 'exaltare', 'refs': ['20:14'], 'latin': 'Exaltáre, Dómine, in virtúte tua',
    'kind': 'order',
    'why': ('Glossary: Exaltáre → exaltai-vos (open; the row names 20:14). The stylist asked to move the imperative to the mediant, to break the'
            ' echo poder … poder(es). Refused: the echo is the Latin’s own, and the imperative heads the formula wherever it stands (56:6, 56:12,'
            ' 93:2, 107:6).'),
    'options': [
        option('Exaltai-vos, Senhor, no vosso poder', {'exaltare': 'Exaltai-vos, Senhor, no vosso {virtus14}'}, 'Ruling: the Latin’s order.', 'draft'),
        option('Senhor, no vosso poder, exaltai-vos', {'exaltare': 'Senhor, no vosso {virtus14}, exaltai-vos'},
               'The stylist’s line: the mediant on the imperative.', 'stylist'),
    ]})

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
