"""Prototype ways a program's closing sheet could read.

Builds program-finish.html from template.html: the sheet shown after a
program's last Amen, in several wordings, each for a round of the Ember days
kept whole and for a novena finished. Self-contained: fonts, ornaments and
texts are inlined, the texts read from the corpus.

    python3 -m venv /tmp/ember-venv && /tmp/ember-venv/bin/pip install pillow
    /tmp/ember-venv/bin/python research/program-finish-prototype/build.py
"""

import base64
import io
import json
import re
from pathlib import Path

from PIL import Image

here = Path(__file__).parent
root = here.parents[1]
textures = root / 'apps/app/assets/textures'
cards = root / 'content/practices/saint-of-the-day/data/holy-cards'
prayers = root / 'content/do/web/www/missa/English/Ordo/Prayers.txt'


def data_uri(raw: bytes, mime: str) -> str:
    return f'data:{mime};base64,{base64.b64encode(raw).decode()}'


def png(name: str, width: int) -> str:
    image = Image.open(textures / f'{name}.png')
    image.thumbnail((width, width))
    out = io.BytesIO()
    image.save(out, 'PNG')
    return data_uri(out.getvalue(), 'image/png')


def font(path: str) -> str:
    return data_uri((root / path).read_bytes(), 'font/ttf')


def card(card_id: str) -> dict:
    data = json.loads((cards / f'{card_id}.json').read_text())
    return {'name': data['name']['en-US'], 'verse': data['prayerExcerpt']['en-US']}


def versicle() -> list[str]:
    """The Mass's own leave-taking, from the missal the practices read."""
    text = prayers.read_text()
    lines = re.search(r'\[Benedicamus Domino\]\n(.+)\n(.+)', text)
    return [lines.group(1)[3:], lines.group(2)[3:]]


fonts = 'node_modules/@expo-google-fonts'
html = (here / 'template.html').read_text()
for key, value in {
    '__LENT__': json.dumps(card('lent_ember_days')),
    '__PENTECOST__': json.dumps(card('pentecost_ember_days')),
    '__NATIVITY__': json.dumps(card('nativity_christ')),
    '__VERSICLE__': json.dumps(versicle()),
    '__CORNER_TL__': png('corner_top_left', 240),
    '__CORNER_TR__': png('corner_top_right', 240),
    '__CORNER_BL__': png('corner_bottom_left', 240),
    '__CORNER_BR__': png('corner_bottom_right', 240),
    '__RULE__': png('horizontal_marker', 420),
    '__PAPER__': data_uri((root / 'apps/app/assets/envelope-paper.jpg').read_bytes(), 'image/jpeg'),
    '__JUNICODE__': font('apps/app/assets/fonts/Junicode.ttf'),
    '__JUNICODE_ITALIC__': font('apps/app/assets/fonts/Junicode-Italic.ttf'),
    '__GARAMOND__': font(f'{fonts}/eb-garamond/400Regular/EBGaramond_400Regular.ttf'),
    '__GARAMOND_ITALIC__': font(f'{fonts}/eb-garamond/400Regular_Italic/EBGaramond_400Regular_Italic.ttf'),
    '__CINZEL__': font(f'{fonts}/cinzel/400Regular/Cinzel_400Regular.ttf'),
    '__PINYON__': font(f'{fonts}/pinyon-script/400Regular/PinyonScript_400Regular.ttf'),
}.items():
    html = html.replace(key, value)
(here / 'program-finish.html').write_text(html)
print('wrote', here / 'program-finish.html')
