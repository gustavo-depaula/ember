# Contact sheet of the upper-centre (face) region of each card, labelled.
import sys
from pathlib import Path
from PIL import Image, ImageDraw

names = sys.argv[2:]
out = sys.argv[1]
cols, w, h = 8, 240, 250
sheet = Image.new('RGB', (cols * w, ((len(names) + cols - 1) // cols) * (h + 20)), 'white')
draw = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    im = Image.open(Path('content/saints') / f'{n}.png').convert('RGB')
    crop = im.crop((262, 230, 762, 750)).resize((w, h))
    x, y = (i % cols) * w, (i // cols) * (h + 20)
    sheet.paste(crop, (x, y))
    draw.text((x + 4, y + h + 3), n, fill='black')
sheet.save(out)
