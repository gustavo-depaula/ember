"""Ps 23 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps023/revise_v2.py
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

# 23:4 — the stylist's worst line
d = decisions['innocens']
d['why'] += (' Heard (draft 1): the stylist’s worst line — «“Inocente de mãos” soa calcado no latim; a construção exige uma pequena'
             ' decifração ao ser ouvida» → ‘Quem tem mãos inocentes e coração puro’. The Latinist passed the calque; the blind reader'
             ' understood it (‘quem não praticou o mal’). Taken in the form of the draft’s own option 1: ‘Aquele que tem …’ answers'
             ' ‘Quem subirá?’ as Ps 14:2 answers its question, where the stylist’s ‘Quem tem’ would sound like a second question. The'
             ' ablatives of respect become the objects of a supplied ‘ter’ — the sense of the Latin, both nouns and both adjectives'
             ' kept; the antiphon reads ‘Aquele que tem mãos inocentes e coração puro subirá ao monte do Senhor’.')
demote(d)
old = d['options']
d['options'] = [
    option('Aquele que tem mãos inocentes e coração puro', {'innocens': 'Aquele que tem mãos inocentes e coração puro'},
           'Ruling (draft 2): the natural build (the stylist), answering the question as Ps 14:2.', 'stylist'),
    old[0],
    option('Quem tem mãos inocentes e coração puro', {'innocens': 'Quem tem mãos inocentes e coração puro'},
           'The stylist’s words: heard as a second question after ‘Quem subirá … ou quem estará de pé’.', 'stylist'),
    old[2],
]

# 23:5 — the stylist: Senhor / Salvador rhyme the two cadences
d = decisions['salutari']
d['why'] += (' Heard (draft 1): the stylist — «“Senhor” e “Salvador” fazem rimar as duas cadências» (checks.py flagged it too) →'
             ' ‘Este receberá do Senhor a bênção: * e de Deus, seu Salvador, a misericórdia’. Taken for the second colon only: the'
             ' title moves inside, the colon ends on ‘misericórdia’, and the rhyme is gone; the first colon keeps the Latin’s order'
             ' (‘a bênção do Senhor’, benedictiónem a Dómino). The Latinist passed ‘seu Salvador’.')
data['verses']['23:5'] = 'Este {accipiet} a bênção do Senhor: * e de Deus, {salutari}, a misericórdia.'

# 23:10 — the stylist: 'é ele' heard as a restart
d = decisions['ipseest']
d['why'] += (' Heard (draft 1): the stylist — «A vírgula sugere uma suspensão, mas “é ele” soa como um reinício da frase» → ‘O Senhor dos'
             ' poderes: ele é o Rei da glória’. Taken: the colon gives the pause, and after it ‘ele’ first is the emphasis (ipse) — the'
             ' answer to the question stands as a sentence of its own. 23:8’s answer has the same punctuation (‘forte e poderoso: o Senhor'
             ' poderoso na batalha’), so the two answers of the dialogue now sound alike.')
demote(d)
data['verses']['23:10'] = 'Quem é este Rei da glória? * O Senhor {virtutum}: {ipseest} o Rei da glória.'
d['options'][0], d['options'][1] = d['options'][1], d['options'][0]
d['options'][0]['note'] = 'Ruling (draft 2): after a colon (the stylist), ‘ele’ first carries ipse.'
d['options'][0]['from'] = 'stylist'

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
