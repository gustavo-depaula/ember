"""Ps 22 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps022/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d, prefix='Draft 1. '):
    o = d['options'][0]
    o['note'] = prefix + o['note'].removeprefix('Ruling: ')


data['version'] = 2
data['status'] = 'reviewed'

# 22:5b — the Latinist's one MAJOR: held
d = decisions['impinguasti']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «“Impinguasti” significa tornar gordo; “ungistes” conserva a aplicação do óleo, mas'
             ' elimina a imagem concreta de engordar presente no latim» → ‘Engordastes com óleo a minha cabeça’. HELD, for Gustavo’s ear:'
             ' (1) the Greek behind the Latin is ἐλίπανας ἐν ἐλαίῳ (consult/parallels/ps022.md) — λιπαίνω is to oil, to anoint with fat,'
             ' so the Latin verb is the translator’s word for an anointing and the head is not being fattened; (2) his line is a wrong first'
             ' hearing (a head made fat) that the reader would stop at, and a wrong first hearing is a fault; (3) every Vulgate-family'
             ' witness (Douay-Rheims ‘anointed’, Matos Soares 1932 ‘Ungiste’) says the same. The fat is kept in the options: ‘Untastes’'
             ' (untar, from unto, grease) is the one wording that keeps it without absurdity. The blind reader did not stop at ‘Ungistes’.'
             ' 140:5 ‘non impínguet caput meum’ must follow whatever is ruled here.')
d['options'][2]['note'] = 'The Latinist’s line (draft 1 major, held): the Latin verb to the letter; heard as a head made fat — absurd.'
d['options'][2]['from'] = 'latinist'

# 22:5b — the stylist's worst line: the exclamation moved forward
d = decisions['praeclarus']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «A retomada exclamativa depois de “embriaga” quebra o movimento da frase.'
             ' “Excelente” … fecha o louvor com um tom de avaliação pouco espontâneo» → ‘e como é esplêndido o meu cálice que embriaga!’.'
             ' The order taken: Portuguese opens an exclamation with its ‘como é’ and names the thing after, and the colon then ends on the'
             ' cup, as the Latin’s ends on the praise — both are the whole of the colon. ‘esplêndido’ refused: the glossary’s præclárus'
             ' → excelente (15:6 twice) stands, and ‘esplêndido’ is a proparoxytone. The Latinist passed the praise; the blind reader heard'
             ' the cup’s wine as physical first — the Latin’s image, kept.')
demote(d)
data['verses']['22:5b'] = '{impinguasti} a minha cabeça: * e {praeclarus} o meu cálice {inebrians}!'
d['options'].insert(0, option('como é excelente', {'praeclarus': 'como é excelente'},
                              'Ruling (draft 2): the exclamation first (the stylist’s order), the glossary’s word; the colon ends on the cup.',
                              'stylist'))
d['options'].append(option('como é esplêndido', {'praeclarus': 'como é esplêndido'},
                           'The stylist’s word: the colon’s order is his, the word is not the glossary’s (15:6).', 'stylist'))

# 22:1 — the stylist on 'num lugar de pastagem ali': refused, with a comma
d = decisions['collocavit']
d['why'] += (' Heard (draft 1): the stylist — «A sequência “num lugar de pastagem ali” soa como uma retomada improvisada» → ‘ali me colocou'
             ' num lugar de pastagem’. Refused: the half-verse is sung alone as an antiphon that opens on the place (‘In loco páscuæ * ibi'
             ' me collocávit’, Office of the Dead; Thursday Prime), and ‘ibi’ is the Latin’s own resumption. A comma now marks it as'
             ' deliberate: ‘num lugar de pastagem, ali me colocou’. His order (the place last) is recorded here, not as a slot option:'
             ' it is a change of the verse’s order, not of a word.')
data['verses']['22:1'] = 'O Senhor {regit}, e nada me faltará: * num lugar de {pascuae}, ali me {collocavit}.'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
