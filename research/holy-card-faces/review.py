# Whole-card review grid of drafts (frame, initial, stray text, composition), labelled.
# Usage (repo root): .venv/bin/python research/holy-card-faces/review.py <out.jpg> <card-id>...
import sys
from pathlib import Path
from PIL import Image, ImageDraw

out, names = sys.argv[1], sys.argv[2:]
cols, w, h = 5, 400, 600
sheet = Image.new('RGB', (cols * w, ((len(names) + cols - 1) // cols) * (h + 20)), 'white')
draw = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    im = Image.open(Path('research/holy-card-faces/drafts') / f'{n}.png').convert('RGB').resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 20)
    sheet.paste(im, (x, y))
    draw.text((x + 4, y + h + 3), n, fill='black')
sheet.save(out, quality=90)
