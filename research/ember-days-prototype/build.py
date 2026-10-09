"""Prototype the Ember Days' page of days.

Builds ember-days.html from template.html: one page in five states (not yet in
the rule, the week far off, a week under way, a week kept whole, a day
missed), drawn with the program page's own parts. Self-contained: fonts and
card art are inlined, so the file opens anywhere.

    python3 -m venv /tmp/ember-venv && /tmp/ember-venv/bin/pip install pillow
    /tmp/ember-venv/bin/python research/ember-days-prototype/build.py
"""

import base64
import io
import json
import re
from pathlib import Path

from PIL import Image

here = Path(__file__).parent
root = here.parents[1]
cards_dir = root / 'content/practices/saint-of-the-day/data/holy-cards'
missal = root / 'content/do/web/www/missa/English/Tempora'


def data_uri(raw: bytes, mime: str) -> str:
    return f'data:{mime};base64,{base64.b64encode(raw).decode()}'


def art(card: str) -> str:
    image = Image.open(root / f'content/saints/{card}.png').convert('RGB')
    image.thumbnail((360, 540))
    out = io.BytesIO()
    image.save(out, 'JPEG', quality=82)
    return data_uri(out.getvalue(), 'image/jpeg')


def font(path: str) -> str:
    return data_uri((root / path).read_bytes(), 'font/ttf')


def collect(file: str) -> str:
    """The day's first collect, from the missal the practice reads."""
    text = (missal / f'{file}.txt').read_text()
    return re.search(r'\[Oratio\]\n(.+)', text).group(1).strip()


seasons = []
for season, days in [
    ('advent', ['2026-12-16', '2026-12-18', '2026-12-19']),
    ('lent', ['2027-02-17', '2027-02-19', '2027-02-20']),
    ('pentecost', ['2027-05-19', '2027-05-21', '2027-05-22']),
    ('september', ['2027-09-22', '2027-09-24', '2027-09-25']),
]:
    card = json.loads((cards_dir / f'{season}_ember_days.json').read_text())
    seasons.append({
        'id': season,
        'name': card['name']['en-US'],
        'verse': card['prayerExcerpt']['en-US'],
        'days': days,
        'art': art(f'{season}_ember_days'),
    })

collects = [collect('Adv3-3'), collect('Adv3-5'), collect('Adv3-6')]

html = (here / 'template.html').read_text()
for key, value in {
    '__SEASONS__': json.dumps(seasons),
    '__COLLECTS__': json.dumps(collects),
    '__JUNICODE__': font('apps/app/assets/fonts/Junicode.ttf'),
    '__JUNICODE_ITALIC__': font('apps/app/assets/fonts/Junicode-Italic.ttf'),
    '__GARAMOND__': font('node_modules/@expo-google-fonts/eb-garamond/400Regular/EBGaramond_400Regular.ttf'),
    '__GARAMOND_ITALIC__': font(
        'node_modules/@expo-google-fonts/eb-garamond/400Regular_Italic/EBGaramond_400Regular_Italic.ttf'
    ),
    '__CINZEL__': font('node_modules/@expo-google-fonts/cinzel/400Regular/Cinzel_400Regular.ttf'),
}.items():
    html = html.replace(key, value)
(here / 'ember-days.html').write_text(html)
print('wrote', here / 'ember-days.html')
