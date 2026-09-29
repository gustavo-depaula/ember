# Face contact sheet mixing drafts (d:<id>) and committed cards (<id>), labelled.
# Usage (repo root): .venv/bin/python research/holy-card-faces/facesheet.py <out.jpg> <id|d:id>...
import sys
from pathlib import Path
from PIL import Image, ImageDraw

out, names = sys.argv[1], sys.argv[2:]
cols, w, h = 8, 240, 250
sheet = Image.new('RGB', (cols * w, ((len(names) + cols - 1) // cols) * (h + 20)), 'white')
draw = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    path = Path('research/holy-card-faces/drafts') / f'{n[2:]}.png' if n.startswith('d:') else Path('content/saints') / f'{n}.png'
    crop = Image.open(path).convert('RGB').crop((262, 230, 762, 750)).resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 20)
    sheet.paste(crop, (x, y))
    draw.text((x + 4, y + h + 3), n, fill='black')
sheet.save(out, quality=90)
