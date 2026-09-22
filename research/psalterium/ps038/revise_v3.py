"""Ps 38 draft 3 from draft 2 (prayed.v2.json) after the v2 Latinist gate. python3.13 research/psalterium/ps038/revise_v3.py"""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v2.json').read_text(encoding='utf-8'))
byId = {d['id']: d for d in data['decisions']}


def o(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


d = byId['abonis']
d['options'].insert(0, o('quanto às coisas boas', {'abonis': 'quanto às coisas boas'},
                         'Ruling (v3): the Latinist\'s gate fix — leaves open whether the good things were withheld or not spoken of, and keeps the plural *bona*.', 'latinist'))
d['options'][1]['note'] = 'Draft 2. ' + d['options'][1]['note']
d['why'] += (' v3 (the gate, minor): *longe do bem* makes a spatial sense the Latin lacks and turns the plural into an abstract;'
             ' *quanto às coisas boas* leaves both readings open, which is what D2 asks. Taken; it costs the stylist\'s brevity'
             ' (the colon is +8) and has a faint register of paperwork.')

byId['imagine']['why'] += (' Gate (v2, minor, repeated from v1): *como* settles a phrase the tradition also reads as \'in the image'
                           ' (of God)\'. Held: *passa em imagem* is not a Portuguese sentence, and a prayed line must be one; the'
                           ' reader of the Latin column sees *in imágine*. Option 2 is his wording.')
byId['dedisti']['why'] += (' Gate (v2, minor): he wants the dative and *dar* back (*destes-me como afronta ao insensato*) — on draft 1 he'
                           ' had passed *para o insensato*. Held: *afronta ao insensato* is heard as an insult offered to the fool,'
                           ' and the blind reader could not tell the direction with *para*; the genitive says whose scorn it is.'
                           ' His wording is the option.')
r = byId['remitte']
r['options'].insert(1, o('Relevai-me', {'remitte': 'Relevai-me'},
                         'The gate\'s proposal: *relevar* holds both \'pardon\' and \'relieve\'. Rare with a person as object in Brazil.', 'latinist'))
r['why'] += (' Gate (v2, minor): *Perdoai-me* keeps only \'forgive\'; *Relevai-me* would keep both. Held: *relevar alguém* is'
             ' uncommon, and the blind reader heard \'relent\' as a second sense of *Perdoai-me* already. Option 2.')

data['choices']['38:3'] = data['choices']['38:3'].replace('Draft 1\'s first colon was +6; v2 (*longe do bem*) shortens it', 'First colon +8 in v3 (*quanto às coisas boas*, the gate\'s fix)')
data['version'] = 3
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v3 written')
