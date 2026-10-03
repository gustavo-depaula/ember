"""Make each holy card's "print": the veil of a card not yet received.

The card as an uncoloured plate, pulled in sepia on parchment, with a
parchment band fading in at the foot where the app writes the name. Made
here rather than tinted at runtime: React Native has no sepia filter on iOS.

    python3 scripts/print-cards.py <saints dir>

Writes <saints dir>/prints/<id>.webp (768 wide, for the card page) and
<saints dir>/prints/thumbs/<id>.webp (384 wide, for tiles) from each
<id>.png, skipping those already newer than their source. Needs Pillow.
"""

import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps

parchment = (243, 233, 210)
# The sepia ramp: shadows to a warm brown, highlights to parchment.
ink = (92, 70, 40)


def print_of(src: Image.Image, width: int) -> Image.Image:
    height = round(width * src.height / src.width)
    art = src.convert('L').resize((width, height), Image.LANCZOS)
    art = ImageEnhance.Contrast(art).enhance(0.85)
    art = ImageEnhance.Brightness(art).enhance(1.18)
    sepia = ImageOps.colorize(art, black=ink, white=parchment)
    # Half-faded into the paper, as if the plate were pulled lightly.
    card = Image.blend(Image.new('RGB', sepia.size, parchment), sepia, 0.5)
    # The band for the name: parchment rising over the foot of the card.
    band = round(height * 0.22)
    fade = Image.linear_gradient('L').resize((width, band))
    fade = fade.point(lambda v: min(255, int(v * 1.6)))
    foot = Image.new('L', (width, height), 0)
    foot.paste(fade, (0, height - band))
    return Image.composite(Image.new('RGB', sepia.size, parchment), card, foot)


def main(saints: Path) -> None:
    made = 0
    for png in sorted(saints.glob('*.png')):
        targets = [(saints / 'prints' / f'{png.stem}.webp', 768),
                   (saints / 'prints' / 'thumbs' / f'{png.stem}.webp', 384)]
        stale = [(t, w) for t, w in targets if not t.exists() or png.stat().st_mtime > t.stat().st_mtime]
        if not stale:
            continue
        src = Image.open(png)
        for target, width in stale:
            target.parent.mkdir(parents=True, exist_ok=True)
            print_of(src, width).save(target, 'WEBP', quality=80)
        made += 1
    print(f'  Printed {made} holy cards')


if __name__ == '__main__':
    main(Path(sys.argv[1]))
