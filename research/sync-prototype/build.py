"""Builds index.html: the account and device-joining screens, in the app's skin,
light and dark.

The template is static; this only inlines what the app ships and a browser has
no other way to reach: Junicode (subset to Latin), the Me page's notch flourish
in both themes, and three holy cards for the Me page's shelf.

Needs ImageMagick and fontTools. Run from the repo root:
  python3 research/sync-prototype/build.py
"""

import base64
import io
import subprocess
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

here = Path(__file__).parent
root = here.parents[1]


def uri(raw: bytes, mime: str) -> str:
    return f'data:{mime};base64,{base64.b64encode(raw).decode()}'


def image(path: str, width: int, fmt: str, mime: str) -> str:
    raw = subprocess.run(
        ['magick', str(root / path), '-resize', f'{width}x', '-quality', '80', f'{fmt}:-'],
        check=True, capture_output=True,
    ).stdout
    return uri(raw, mime)


def font(name: str) -> str:
    face = TTFont(root / f'apps/app/assets/fonts/{name}.ttf')
    options = subset.Options(layout_features=['kern', 'liga'])
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=[*range(0x20, 0x17F), *range(0x2010, 0x2040), 0x2192, 0x2720, 0x2726, 0x271E])
    subsetter.subset(face)
    out = io.BytesIO()
    face.save(out)
    return uri(out.getvalue(), 'font/ttf')


html = (here / 'template.html').read_text()
for key, value in {
    '__JUNICODE__': font('Junicode'),
    '__JUNICODE_ITALIC__': font('Junicode-Italic'),
    '__FLOURISH_LIGHT__': image('apps/app/assets/textures/notch_you_light.png', 1000, 'webp', 'image/webp'),
    '__FLOURISH_DARK__': image('apps/app/assets/textures/notch_you_dark.png', 1000, 'webp', 'image/webp'),
    '__CARD_1__': image('content/saints/therese.png', 240, 'jpg', 'image/jpeg'),
    '__CARD_2__': image('content/saints/joseph.png', 240, 'jpg', 'image/jpeg'),
    '__CARD_3__': image('content/saints/francis_assisi.png', 240, 'jpg', 'image/jpeg'),
    '__CARD_4__': image('content/saints/aparecida.png', 240, 'jpg', 'image/jpeg'),
}.items():
    html = html.replace(key, value)
(here / 'index.html').write_text(html)
print('index.html', len(html) // 1024, 'KB')
