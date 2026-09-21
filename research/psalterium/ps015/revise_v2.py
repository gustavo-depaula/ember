"""Ps 15 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps015/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; then add audit_v2.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def demote(d):
    o = d['options'][0]
    o['note'] = 'Draft 1. ' + o['note'].removeprefix('Ruling: ')


data['version'] = 2
data['status'] = 'reviewed'

# 15:8 — 'antevia': the Latinist (major), the stylist and the blind reader (unknown word) all against it
d = decisions['providebam']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «Neste contexto, providébam exprime ver diante de si. “Antevia” introduz antecipação'
             ' temporal … deslocando a imagem da presença constante diante dos olhos» → ‘Eu via o Senhor sempre à minha vista’; the stylist —'
             ' «“antevia” sugere prever algo futuro» → ‘Eu via sempre o Senhor diante de mim’; the blind reader listed ‘antevia’ as unknown and'
             ' heard ‘previa que veria o Senhor’ first. Three readers against one word: taken.')
demote(d)
d['options'][0]['from'] = 'draft'
d['options'].insert(0, option('Eu via o Senhor sempre à minha vista', {'providebam': 'Eu via o Senhor sempre à minha vista'},
                              'Ruling (draft 2): the Latinist’s fix, the Latin’s order (Dóminum … in conspéctu meo semper). The προ- is carried by ‘à minha vista’ (before me in place), which is the sense the Greek προωρώμην has here; the temporal foresight is Acts 2:31’s reading (providens), not the verb’s in this verse. ‘via … vista’ says the seeing twice, as pro-vidére … conspéctus does.', 'latinist'))
# the old option 2 ('Eu via sempre o Senhor à minha vista') stays; add the stylist's line
d['options'].append(option('Eu via sempre o Senhor diante de mim', {'providebam': 'Eu via sempre o Senhor diante de mim'},
                           'The stylist’s line. ‘diante de mim’ drops conspéctus’s ‘vista’ (glossary, open; 14:4a ‘À vista dele’).', 'stylist'))

# 15:4b — 'de sangue' held against the Latinist's major ('de sangues')
d = decisions['conventicula']
d['why'] += (' Heard (draft 1): the Latinist, MAJOR — «O singular elimina o plural concreto e incomum do latim» → ‘de sangues’. HELD: the'
             ' glossary row vir sánguinum → ‘homem de sangue’ (5:7b; 25:9, 54:24, 138:19 to follow) already loses the same plural, and one'
             ' ruling must serve all six places of the plural (with 50:16 Líbera me de sanguínibus). In Portuguese ‘sangue’ is a mass noun;'
             ' ‘sangues’ is heard as a slip or as kinds of blood, not as ‘bloodshed’. The blind reader heard ‘de sangue’ as ‘reuniões com'
             ' derramamento de sangue’ first and ‘ritos com sangue’ second — the two readings of the plural. Proposed to the glossary as an'
             ' open row for Gustavo (sanguínes, plural).')
d['options'].append(option('congregarei os seus ajuntamentos … de sangues', {'conventicula': 'congregarei os seus ajuntamentos', 'sangue': 'de sangues'},
                           'The Latinist’s fix: the plural kept. Refused (held against a major): the glossary’s vir sánguinum → ‘homem de sangue’ loses the plural, and ‘sangues’ is heard as a slip.', 'latinist'))
data['verses']['15:4b'] = 'Não {conventicula} {sangue}, * nem {perlabia}.'
for o in d['options'][:-1]:
    o['forms']['sangue'] = 'de sangue'

# 15:4b — 'com os meus lábios' at the verse's end (proparoxytone): the stylist
d = decisions['perlabia']
d['why'] += (' Heard (draft 1): the stylist — «“Lábios” é proparoxítono e deixa duas sílabas átonas depois do último apoio» →'
             ' ‘nem pelos meus lábios me lembrarei dos seus nomes’. Taken in its order (rule 4), with the ruling’s ‘com’ (the instrument).')
old = d['options']
d['options'] = [
    option('com os meus lábios me lembrarei dos seus nomes', {'perlabia': 'com os meus lábios me lembrarei dos seus nomes'},
           'Ruling (draft 2): the stylist’s order — the lips before the verb, so the verse ends on the paroxytone ‘nomes’ (rule 4; the ear leads on order, D28). ‘com’ kept for per (the instrument: to remember aloud, to name).', 'stylist'),
    option('me lembrarei dos seus nomes com os meus lábios', {'perlabia': 'me lembrarei dos seus nomes com os meus lábios'},
           'Draft 1: the Latin’s order; the verse ends on the proparoxytone ‘lábios’.', 'draft'),
    option('pelos meus lábios me lembrarei dos seus nomes', {'perlabia': 'pelos meus lábios me lembrarei dos seus nomes'},
           'The stylist’s line: ‘per’ to the letter; ‘pelos’ can be heard as ‘for the sake of’.', 'stylist'),
    option('me lembrarei dos seus nomes pelos meus lábios', {'perlabia': 'me lembrarei dos seus nomes pelos meus lábios'},
           old[1]['note'], 'DRB'),
]

# 15:5 — 'cálice' at the mediant: the stylist
d = decisions['calicis']
d['why'] += (' Heard (draft 1): the stylist — «“Cálice” é proparoxítono» → ‘A parte da minha herança e do meu cálice é o Senhor: * sois vós'
             ' que me restituireis a minha herança’. Refused, kept as an option: the Latin opens on Dóminus, and the verse turns from'
             ' ‘O Senhor’ to ‘sois vós’ — both colons open on the person; his order ends the colon on ‘Senhor’ and moves the turn.')
data['verses']['15:5'] = '{calicis}: * sois vós que me restituireis a minha herança.'
d['options'] = [
    option('O Senhor é a parte da minha herança e do meu cálice', {'calicis': 'O Senhor é a parte da minha herança e do meu cálice'},
           'Ruling (drafts 1–2): the Latin’s words in the Latin’s order; the proparoxytone at the mediant accepted (as Ps 90:1 ‘Altíssimo’). The stylist’s order refused: it moves Dóminus from the head of the verse.', 'draft'),
    option('O Senhor é a parte da minha herança e do cálice meu', {'calicis': 'O Senhor é a parte da minha herança e do cálice meu'},
           'The possessive after: the mediant on a stressed syllable, at the cost of a poetic inversion (rule 5).', 'draft'),
    option('A parte da minha herança e do meu cálice é o Senhor', {'calicis': 'A parte da minha herança e do meu cálice é o Senhor'},
           'The stylist’s line: the mediant on ‘Senhor’; Dóminus leaves the head of the verse.', 'stylist'),
]

# 15:7 — 'e ainda até a noite': the stylist
d = decisions['noctem']
d['why'] += (' Heard (draft 1): the stylist — «A sequência “e ainda até” acumula partículas … “ainda” também pode ser ouvido como indicação de'
             ' duração» → ‘e até a noite os meus rins também me repreenderam’. Refused, kept as an option: ínsuper et → ‘e ainda’ is the'
             ' glossary’s, and 15:9 opens its last colon with the same two words (ínsuper et caro mea); the stylist’s ‘também’ breaks the'
             ' pair. The blind reader heard ‘até a noite’ as ‘until night’ first, ‘even at night’ second — both inside usque ad noctem.')
data['verses']['15:7'] = 'Bendirei o Senhor, que me deu entendimento: * {noctem} me repreenderam.'
d['options'] = [
    option('e ainda até a noite os meus rins', {'noctem': 'e ainda até a noite os meus rins'},
           'Ruling (drafts 1–2): ínsuper et → ‘e ainda’ (glossary; the same words open 15:9’s last colon), usque ad → ‘até’; the verse ends on the paroxytone ‘repreenderam’.', 'DRB'),
    option('e ainda até de noite os meus rins', {'noctem': 'e ainda até de noite os meus rins'},
           '‘even at night’ — Matos Soares 1932’s sense; ‘até’ as ‘even’ rather than ‘until’.', 'MS1932'),
    option('e até a noite os meus rins também', {'noctem': 'e até a noite os meus rins também'},
           'The stylist’s line: fewer particles in a row; ínsuper becomes ‘também’, and the pair with 15:9 (‘e ainda a minha carne’) is lost.', 'stylist'),
]

# 15:3 — the stylist's worst line: refused, his words kept as options
d = decisions['sanctis']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «A abertura fica sintaticamente suspensa; depois da pausa, “fez maravilhosas” soa'
             ' como uma construção transportada do latim» → ‘Quanto aos santos … tornou maravilhosas’. Refused: the suspension is the'
             ' Latin’s own (a hanging dative taken up by in eis), and ‘Quanto aos’ decides the grammar the Latin leaves open; his line is'
             ' option 3. The blind reader heard ‘fez maravilhosas’ with the Lord as subject, as meant; ‘todas as minhas vontades neles’ he'
             ' found unclear — so is the Latin.')
d['options'][2]['from'] = 'stylist'
d['options'][2]['note'] += ' The stylist’s line.'
d = decisions['mirificavit']
d['options'].append(option('tornou maravilhosas', {'mirificavit': 'tornou maravilhosas'},
                           'The stylist’s verb. Refused: the glossary’s mirificáre → ‘fazer maravilhoso’ (4:4 ‘fez maravilhoso o seu santo’, the same verb beside the same noun).', 'stylist'))

# 15:10 / 15:11 — the blind reader's tests recorded
d = decisions['inferno']
d['why'] += (' Heard (draft 1): the blind reader, as feared — ‘no inferno’ first as «o lugar de castigo após a morte», second as «o domínio'
             ' dos mortos». The Latinist passed it; no critic asked for a change. Kept, for Gustavo’s ear (glossary row inférnus).')
d = decisions['dabis']
d['why'] += (' Heard (draft 1): the blind reader took ‘ver a corrupção’ first as moral corruption, second as bodily decay. Kept: ‘vidére'
             ' corruptiónem’ is the Latin’s and Acts’ (2:27, 13:35) image; the verse’s first colon (the soul, the dead) and 15:9 (the flesh)'
             ' lean it toward the body for one who prays the whole.')
d = decisions['delectationes']
d['why'] += ' Heard (draft 1): the blind reader listed ‘deleites’ as unknown. Kept; ‘delícias’ (delíciæ’s) is option 2.'

data['choices']['15:4b'] = ('memor esse → lembrar-se de (glossary). nómina → nomes. The last colon fronts ‘com os meus lábios’ so that the verse ends on'
                            ' ‘nomes’ (the stylist, rule 4).')
data['choices']['15:8'] += (' Draft 2: ‘antevia’ replaced by ‘via’ (the Latinist’s major; the stylist and the blind reader agreed).')

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
