# Before/after face pairs: original card (content/saints) beside its draft.
import sys
from PIL import Image, ImageDraw

out, names = sys.argv[1], sys.argv[2:]
cols, w, h = 4, 230, 240
rows = (len(names) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (2 * w + 16), rows * (h + 18)), 'white')
draw = ImageDraw.Draw(sheet)
for i, n in enumerate(names):
    box = (100, 250, 924, 700) if n == 'philip_james' else (262, 200, 762, 720)
    x, y = (i % cols) * (2 * w + 16), (i // cols) * (h + 18)
    for j, p in enumerate([f'content/saints/{n}.png', f'research/holy-card-faces/drafts/{n}.png']):
        sheet.paste(Image.open(p).convert('RGB').crop(box).resize((w, h)), (x + j * w, y))
    draw.text((x + 4, y + h + 3), n, fill='black')
sheet.save(out, quality=88)
