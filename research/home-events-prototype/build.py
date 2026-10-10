"""Builds index.html: four directions for an "events" row on Today, under Daily Meditations.

The row's first card says which holy cards today can give and how; the rest are
the programs coming up that the reader can join. Everything is as seen on
Saturday 10 October 2026: the Office or a prayed day gives St. Francis Borgia
(off the Mass calendar), Mass draws an altar card, the Aparecida novena is on
its eighth day, and the novenas ahead are dated from their manifests' `ends`.

Needs ImageMagick. Run from the repo root:
  python3 research/home-events-prototype/build.py
"""

import base64
import json
import subprocess
from pathlib import Path

here = Path(__file__).parent
root = here.parents[1]


def uri(raw: bytes, mime: str) -> str:
    return f'data:{mime};base64,{base64.b64encode(raw).decode()}'


def jpeg(path: str, width: int) -> str:
    raw = subprocess.run(
        ['magick', str(root / path), '-resize', f'{width}x', '-quality', '78', 'jpg:-'],
        check=True, capture_output=True,
    ).stdout
    return uri(raw, 'image/jpeg')


def card(cid: str) -> str:
    return jpeg(f'content/saints/{cid}.png', 360)


def practice(pid: str) -> str:
    return json.loads((root / f'content/practices/{pid}/manifest.json').read_text())['name']['pt-BR']


today = {
    'date': 'Sábado, 10 de outubro',
    'ways': [
        {'glyph': 'book', 'act': 'Reze o Ofício', 'alt': 'ou guarde o dia: oferecimento, terço e exame',
         'card': 'São Francisco de Borja', 'art': card('francis_borgia')},
        {'glyph': 'chalice', 'act': 'Vá à Missa', 'alt': 'sorteada entre as 73 cartas da Missa',
         'card': 'Uma carta do altar'},
    ],
}

# state: running (in the reader's plan) | today | ahead
events = [
    {'card': 'aparecida', 'practice': 'our-lady-aparecida-novena', 'short': 'N. Sra. Aparecida',
     'dates': '3–11 de outubro', 'state': 'running', 'day': 8, 'label': 'Dia 8 de 9', 'when': 'termina amanhã',
     'num': '3', 'dow': 'em curso'},
    {'card': 'peter_alcantara', 'practice': 'st-peter-of-alcantara-novena', 'short': 'S. Pedro de Alcântara',
     'dates': '10–18 de outubro', 'state': 'today', 'label': 'Começa hoje', 'when': 'hoje', 'num': '10', 'dow': 'sáb', 'in': 0},
    {'card': 'john_paul_ii', 'practice': 'st-john-paul-ii-novena', 'short': 'S. João Paulo II',
     'dates': '13–21 de outubro', 'state': 'ahead', 'label': 'Em 3 dias', 'when': 'terça', 'num': '13', 'dow': 'ter', 'in': 3},
    {'card': 'frei_galvao', 'practice': 'st-anthony-galvao-novena', 'short': 'Frei Galvão',
     'dates': '16–24 de outubro', 'state': 'ahead', 'label': 'Em 6 dias', 'when': 'sexta', 'num': '16', 'dow': 'sex', 'in': 6},
    {'card': 'all_saints', 'practice': 'all-saints-novena', 'short': 'Todos os Santos',
     'dates': '23–31 de outubro', 'state': 'ahead', 'label': 'Em 13 dias', 'when': '23 de outubro', 'num': '23', 'dow': 'sex', 'in': 13},
    {'card': 'all_souls', 'practice': 'holy-souls-novena', 'short': 'Fiéis Defuntos',
     'dates': '25 out – 2 nov', 'state': 'ahead', 'label': 'Em 15 dias', 'when': '25 de outubro', 'num': '25', 'dow': 'dom', 'in': 15},
    {'card': 'christ_king', 'practice': 'christ-the-king-novena', 'short': 'Cristo Rei',
     'dates': '13–21 de novembro', 'state': 'ahead', 'label': 'Em 34 dias', 'when': '13 de novembro', 'num': '13', 'dow': 'nov', 'in': 34},
]
for e in events:
    e['title'] = practice(e['practice'])
    e['art'] = card(e['card'])

meditations = [
    {'title': 'Intimidade Divina', 'sub': 'A oração de recolhimento', 'art': jpeg('content/art/meditation-intimita.jpg', 400)},
    {'title': 'Meditações de Santo Afonso', 'sub': 'Da confiança em Deus', 'art': jpeg('content/art/meditation-alphonsus.jpg', 400)},
    {'title': 'Meditação do Dia', 'sub': 'Opus Dei', 'art': jpeg('content/art/meditation-opus-dei.jpg', 400)},
]

data = {
    'today': today, 'events': events, 'meditations': meditations,
    'frame': jpeg('apps/app/assets/textures/card_back_frame.webp', 360),
}
html = (here / 'template.html').read_text()
html = html.replace('/*DATA*/', 'const data = ' + json.dumps(data, ensure_ascii=False))
html = html.replace('__JUNICODE__', uri((root / 'apps/app/assets/fonts/Junicode.ttf').read_bytes(), 'font/ttf'))
(here / 'index.html').write_text(html)
print('index.html', len(html) // 1024, 'KB')
