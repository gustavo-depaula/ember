"""Ps 20 draft 2 -> draft 3, after the v2 Latinist gate. python3.13 research/psalterium/ps020/revise_v3.py
Reads prayed.v2.json (never prayed.json), so it is safe to re-run; then add audit_v3.json with ps005/audit_add.py."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v2.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def to_front(d, label, note, source=None):
    o = next(o for o in d['options'] if o['label'] == label)
    d['options'].remove(o)
    first = d['options'][0]
    first['note'] = 'Drafts 1–2. ' + first['note'].removeprefix('Ruling: ').removeprefix('Ruling (draft 2): ')
    o['note'] = note
    if source:
        o['from'] = source
    d['options'].insert(0, o)


data['version'] = 3

# 20:11 — the Latinist, MAJOR at the gate: 'descendência' explains the image of seed, which the Latin pairs with 'fruto'.
d = decisions['semen']
d['why'] += (' Gate (draft 2): the Latinist, MAJOR — «“Descendência” explicita o referente da imagem de “semente”, que o latim conserva em'
             ' paralelo com “fruto”» → ‘a sua semente’. Taken: the glossary row is open and names this verse; here the fruit is kept and the'
             ' seed answers it, so the image cannot be dropped without breaking the pair (D2). The second colon (‘dentre os filhos dos homens’)'
             ' tells the ear the seed is offspring. The row’s general ruling stays for Gustavo.')
to_front(d, 'a sua semente',
         'Ruling (draft 3): the Latinist at the gate — the image kept, answering ‘o seu fruto’ (Douay-Rheims ‘their seed’).', 'latinist')

# 20:13 — the Latinist, MAJOR again: dorsum a predicate noun; 'ficar de costas' adds a verb and makes a posture.
d = decisions['dorsum']
d['why'] += (' Gate (draft 2): the Latinist, MAJOR again — «O latim faz de “dorso” o predicativo dos inimigos. A tradução resolve essa'
             ' construção insólita como uma postura corporal, acrescentando “ficar”» → ‘fareis deles um dorso’. Taken in substance: the'
             ' predicate noun with no added verb, in the glossary build for pónere + predicate (fazer de X Y, 17:12) — ‘fareis deles costas’ —'
             ' with the Portuguese word for a man’s back (‘costas’, plural only; ‘dorso’ is an animal’s or a book’s). As strange as the'
             ' Latin, which is the Latin’s strangeness (D2). ‘ficar de costas’ stays one touch away.')
data['decisions'][data['decisions'].index(d)]['options'].insert(
    1, option('fareis deles costas', {'dorsum': '{a13a} deles costas'},
              'Ruling (draft 3): the Latinist’s construction (predicate noun, no added verb) with the Portuguese human back.', 'latinist'))
to_front(d, 'fareis deles costas',
         'Ruling (draft 3): the Latinist’s construction (predicate noun, no added verb) with the Portuguese human back.')

# 20:14 — the Latinist, minor: the passive imperative. Refused.
d = decisions['exaltare']
d['why'] += (' Gate (draft 2): the Latinist, minor — «O imperativo latino é passivo. A forma reflexiva é defensável como leitura média» →'
             ' ‘Sede exaltado’. Refused: he grants the middle reading; the glossary row Exaltáre → exaltai-vos is the formula wherever it'
             ' opens a verse (56:6, 56:12, 93:2, 107:6), and ‘Sede exaltado’ is a stiff passive the ear hears as a decree. Kept as an option.')
d['options'].append(option('Sede exaltado, Senhor, no vosso poder', {'exaltare': 'Sede exaltado, Senhor, no vosso {virtus14}'},
                           'The Latinist’s fix at the gate: the passive imperative kept as passive.', 'latinist'))

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v3 written')
