"""Prototype ways of veiling a holy card not yet received.

Builds veil.html from template.html: the same few cards under each veil, as
an album row (two held, the rest veiled) and as the card page's hero.
The line-drawing veil needs a pre-rendered asset, made here with Pillow; the
others are CSS stand-ins for what expo-image can do at runtime (blurRadius,
tint) over the thumbnail the app already has.

    research/holy-card-faces/.venv/bin/python research/veil-prototype/build.py
"""

import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

here = Path(__file__).parent
root = here.parents[1]
cards_dir = root / 'content/practices/saint-of-the-day/data/holy-cards'
samples = ['francis_assisi', 'therese', 'jerome', 'peter', 'lourdes', 'michael_archangel',
           'cosmas_damian']
held = {'francis_assisi', 'therese'}

out = here / 'assets'
out.mkdir(exist_ok=True)


def line_drawing(card: str) -> str:
    """The art as an engraver's line: edges in sepia ink on nothing."""
    src = Image.open(root / f'content/saints/thumbs/{card}.webp').convert('L')
    edges = src.filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.autocontrast(edges, cutoff=2)
    # Ink where the edges are strong, transparent elsewhere.
    alpha = edges.point(lambda v: 0 if v < 40 else min(255, int((v - 40) * 1.6)))
    ink = Image.new('RGBA', src.size, (110, 82, 31, 0))
    ink.putalpha(alpha)
    path = out / f'{card}-lines.png'
    ink.save(path)
    return path.name


cards = []
for card in samples:
    data = json.loads((cards_dir / f'{card}.json').read_text())
    cards.append({
        'id': card,
        'name': data['name']['en-US'],
        'shelf': data.get('shelf', ''),
        'held': card in held,
        'thumb': f'../../content/saints/thumbs/{card}.webp',
        'full': f'../../content/saints/{card}.webp',
        'lines': f'assets/{line_drawing(card)}',
    })

frame = '../../apps/app/assets/textures/card_back_frame.webp'
cinzel = '../../node_modules/@expo-google-fonts/cinzel/400Regular/Cinzel_400Regular.ttf'
html = (here / 'template.html').read_text()
html = html.replace('__CARDS__', json.dumps(cards)).replace('__FRAME__', frame).replace('__CINZEL__', cinzel)
(here / 'veil.html').write_text(html)
print('wrote', here / 'veil.html')
