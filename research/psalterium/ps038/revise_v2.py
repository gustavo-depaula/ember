"""Ps 38 draft 2 from draft 1 (prayed.v1.json) after the three v1 readers. python3.13 research/psalterium/ps038/revise_v2.py"""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
byId = {d['id']: d for d in data['decisions']}


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def lead(decision, label, note=None):
    """Move the option with this label to the front (the new ruling)."""
    options = byId[decision]['options']
    i = next(k for k, opt in enumerate(options) if opt['label'] == label)
    chosen = options.pop(i)
    if note:
        chosen['note'] = note
    options.insert(0, chosen)
    options[1]['note'] = 'Draft 1. ' + options[1]['note']


def front(decision, option, why=None):
    byId[decision]['options'].insert(0, option)
    byId[decision]['options'][1]['note'] = 'Draft 1. ' + byId[decision]['options'][1]['note']
    if why:
        byId[decision]['why'] += ' ' + why


front('consisteret', o('se erguia', {'consisteret': 'se erguia'},
      'Ruling (v2): the stylist\'s plain verb of standing up; *postava* was unknown to the blind reader. erguer-se is also one of astáre\'s words, but the two never meet in a verse.', 'stylist'),
      'v2: *se postava* was stiff to the stylist and unknown to the blind reader; *se erguia* taken.')

front('abonis', o('longe do bem', {'abonis': 'longe do bem'},
      'Ruling (v2): the separative *a*, as 30:21 and 30:12b (*longe de*); *bona* as the abstract *o bem* (as univérsa → *tudo*), which also shortens the colon.', 'latinist'),
      'v2: the Latinist (minor) read *a bonis* as separative and refused *sobre* (it makes the good things the topic); the stylist'
      ' also refused *sobre coisas boas* (a topic of conversation) and found the colon breathless. Both asked for *calar-se*'
      ' (*calei-me das coisas boas*, *calei-me acerca do bem*), which is tacére\'s verb (the silére / tacére row, 27:1) and would'
      ' break the echo with 38:13b *Não fiqueis em silêncio*. The separative taken with *longe de*, the psalter\'s way of saying the'
      ' separating *a* (30:21, 30:12b).')

lead('fire', 'ardeu … um fogo se inflamará',
     'Ruling (v2): the blind reader heard *se aqueceu* as \'was comforted\' — the heat of distress was lost. *ardeu* keeps the heat and stays apart from inflamar-se.')
byId['fire']['why'] += ' v2: the blind reader heard *O meu coração se aqueceu* as \'my heart was warmed (comforted)\'; *ardeu* taken.'

lead('mensurabiles', 'pusestes em medida',
     'Ruling (v2): the Latin\'s verb and the idea of measure in a plain noun; *mensuráveis* was unknown to the blind reader and \'technical\' to the stylist.')
byId['mensurabiles']['options'].append(o('fizestes medidos', {'mensurabiles': 'fizestes medidos'}, 'The stylist\'s; a calque of pónere + predicate (17:33\'s fault).', 'stylist'))
byId['mensurabiles']['why'] += ' v2: *mensuráveis* unknown to the blind reader, a technical Latinism to the stylist; Matos Soares 1932\'s *pusestes em medida* taken.'

lead('thesaurizat', 'Acumula tesouros',
     'Ruling (v2): *Entesoura* was unknown to the blind reader, who could not hear its subject or what *os* stood for; the Latinist marked *os* as dangling. A noun gives *os* its antecedent (the treasures = *ea*).')
byId['thesaurizat']['options'].append(o('Ajunta tesouros', {'thesaurizat': 'Ajunta tesouros'}, 'The stylist\'s; *ajunta … juntará* would make one verb of thesaurizáre and congregáre.', 'stylist'))
byId['thesaurizat']['why'] += ' v2: see the Latinist\'s *os* and the blind reader\'s unknown *Entesoura*; *Acumula tesouros* taken.'

lead('exspectatio', 'qual é a minha espera?',
     'Ruling (v2): the noun, as the Latinist and the stylist both asked. *espera* is waiting, not hope; the verbs stay apart (D36), this is exspectátio\'s noun where it stands as subject.')
byId['exspectatio']['why'] += (' v2: the Latinist (minor) and the stylist (\'que é que\' is filler) both asked for *qual é a minha espera?*.'
                              ' Taken: *espera* is the noun of waiting, the plain one the row lacked (*expectativa* bureaucratic, *o que aguardo* a clause).'
                              ' It shares the root of *esperar* (D36\'s cost, again); proposed on the row.')

front('dedisti', o('fizestes de mim a afronta do insensato', {'dedisti': 'fizestes de mim a afronta do insensato'},
      'Ruling (v2): the genitive (the stylist) — the fool is the one who scorns, which *para o* left unclear to the blind reader; afronta kept (the row: *opróbrio* failed two readers).', 'stylist'),
      'v2: the blind reader could not tell the direction of *afronta para o insensato*; the stylist asked for a genitive (*o opróbrio do insensato*). The genitive taken with the row\'s noun.')

front('refrigerer', o('seja reanimado', {'refrigerer': 'seja reanimado'},
      'Ruling (v2): the Latin\'s passive (the Latinist); *alento* was unknown to the blind reader.', 'latinist'),
      'v2: the Latinist (minor) asked for the passive, *seja reanimado*; *alento* unknown to the blind reader. Taken; and *antes que eu parta* → *antes de partir* (the stylist: \'que eu\' twice in one colon).')

data['verses']['38:14'] = '{remitte}, para que eu {refrigerer} antes de partir, * {nonero}.'
data['choices']['38:14'] = 'priúsquam ábeam → *antes de partir* (v2, the stylist: *antes que eu parta* doubled *que eu*; same subject, so the infinitive). The Latin\'s *ero* stays independent: *e já não existirei*.'
data['choices']['38:3'] = data['choices']['38:3'].replace('First colon +6', 'Draft 1\'s first colon was +6; v2 (*longe do bem*) shortens it')
data['choices']['38:9'] = 'Draft 1 *uma afronta para o insensato* (+4); v2 the genitive, shorter. iníquitas → iniquidade.'
data['version'] = 2
data['status'] = 'reviewed'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
