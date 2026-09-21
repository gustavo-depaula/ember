"""Ps 27 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps027/revise_v2.py
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

# 27:1 — the Latinist's MAJOR (the future assimilábor, the second negation) and the stylist's worst line (breath)
d = decisions['assimilabor']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Assimilábor é futuro indicativo passivo afirmativo: apresenta a assimilação'
             ' … como consequência temida do silêncio divino. A tradução introduz uma segunda negação e substitui esse futuro por um'
             ' subjuntivo» → ‘não suceda que vos caleis comigo, e eu serei assemelhado aos que descem à cova’; the stylist\'s worst'
             ' line — the second colon wants too much breath → ‘para que não vos caleis comigo, nem eu me torne como os que descem à'
             ' cova’. Held against the Latinist, with the stylist\'s ‘nem’ taken: the glossary row nequándo … et (working; 2:12,'
             ' eight places) supplies the second negation because Portuguese ‘para que não A, e B’ is heard as ‘so that B’ — the'
             ' feared thing wished for, a wrong first hearing; ‘nem’ is the row\'s ‘e não’ in one word and saves two syllables.'
             ' Portuguese cannot keep a future indicative inside ‘para que não’ / ‘não suceda que’ (both govern the subjunctive);'
             ' the fear is what the clause says. ‘semelhante’ kept (assimilári, the becoming like), not the stylist\'s ‘como’. The'
             ' Latinist\'s wording is an option. The blind reader heard ‘descem à cova’ as dying.')
verses['27:1'] = 'A vós, Senhor, clamarei, meu Deus, {sileas}: * {taceas}, nem eu {assimilabor} aos que descem à cova.'
d['options'].append(option('não suceda que vos caleis comigo, e eu serei semelhante (the Latinist)',
                           {'assimilabor': 'serei semelhante'},
                           'The Latinist\'s future (‘assemelhado’ softened); with ‘para que não’ it reads ‘… nem eu serei semelhante’,'
                           ' ungrammatical — it needs his ‘não suceda que’ for the first half too.', 'latinist'))
data['choices']['27:1'] = data['choices']['27:1'] + (
    ' Draft 2: ‘e eu não me torne’ → ‘nem eu me torne’ (the stylist\'s breath; the nequándo … et row\'s second negation in one word).')

# 27:3b — the stylist: 'há' after 'Os que … falam'
d = decisions['mala']
d['why'] += (' Heard (draft 1): the stylist — after ‘Os que … falam’, ‘há males’ leaves the build hanging → ‘mas têm males nos seus'
             ' corações’. Taken: the verb supplied (D2) now keeps the subject of the colon, so the opposition is heard; eórum stays in'
             ' ‘nos seus corações’, and the blind reader heard the hearts as the talkers\'. ‘há’ is an option.')
demote(d)
d['options'].insert(0, option('mas têm males nos seus corações', {'mala': 'mas têm males nos seus corações'},
                              'Ruling (draft 2): the verb with the colon\'s subject (the stylist).', 'stylist'))

# 27:4b — the stylist: 'lhes … deles', 'pagar a retribuição'
d = decisions['redde']
d['why'] += (' Heard (draft 1): the stylist — «“Lhes […] deles” pesa na boca, e “pagar a retribuição” soa burocrático» →'
             ' ‘retribuí-lhes a sua retribuição’. Refused: ‘retribuí’ is also ‘I repaid’ (the row retribúere at the vós imperative,'
             ' rule 3), and réddere → pagar is the glossary\'s, which names this verse; ‘deles’ keeps eórum from being heard as God\'s'
             ' (‘a sua’ beside a ‘vós’ address is heard as ‘your’ by many). The blind reader heard the punishment due to them — the'
             ' sense. His line is an option.')
d['options'].append(option('retribuí-lhes a sua retribuição', {'redde': 'retribuí-lhes a sua retribuição'},
                           'The stylist\'s words: the root twice, but ‘retribuí’ = ‘I repaid’ (rule 3).', 'stylist'))

# 27:7b — the stylist: 'de minha vontade' incomplete
d = decisions['voluntate']
d['why'] += (' Heard (draft 1): the stylist — «“De minha vontade” soa como uma locução incompleta» → ‘por minha própria vontade’.'
             ' Taken in part: ‘de minha própria vontade’ — the idiom he asks for, with ex → ‘de’ kept (‘por minha vontade’ is also'
             ' heard as ‘if it were up to me’); ‘própria’ is the Portuguese weight of the possessive in this phrase. The blind'
             ' reader heard it rightly, ‘willingly’.')
demote(d)
d['options'].insert(0, option('de minha própria vontade', {'voluntate': 'de minha própria vontade'},
                              'Ruling (draft 2): the complete idiom (the stylist), ex → de.', 'stylist'))
d['options'].append(option('por minha própria vontade', {'voluntate': 'por minha própria vontade'},
                           'The stylist\'s words.', 'stylist'))

# 27:7 — the Latinist (minor): adjútor, held (D19 / D24)
d = decisions['adjutor']
d['why'] += (' Heard (draft 1): the Latinist, minor — ‘auxiliador’. Held (D19/D24), as in 26:9b and 29:11; the participle adjútus'
             ' → ‘auxiliado’ keeps the family.')

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
