"""pdftotext -bbox words -> layout-like text without a right-hand margin column.

usage: fds_bbox.py in.pdf out.txt margin_x   (words after a gap >= 4.5pt at xMin >= margin_x are dropped)
"""
import re, subprocess, sys, html
pdf, out, mx = sys.argv[1], sys.argv[2], float(sys.argv[3])
xml = subprocess.run(['pdftotext', '-bbox', pdf, '-'], capture_output=True, text=True, errors='replace').stdout
pages = re.split(r'<page ', xml)[1:]
res = []
for pg in pages:
    words = [(float(a), float(b), float(c), html.unescape(w)) if (float(d) - float(b) >= 8.4 or float(a) < mx) else None for a, b, c, d, w in re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>', pg)]
    words = [w for w in words if w]
    words.sort(key=lambda t: (t[1], t[0]))
    lines, cur, cy = [], [], None
    for x0, y, x1, w in words:
        if cy is None or abs(y - cy) > 3.5:
            if cur:
                lines.append(cur)
            cur, cy = [], y
        cur.append((x0, x1, w))
    if cur:
        lines.append(cur)
    txt = []
    for ln in lines:
        ln.sort()
        keep, prev = [], None
        for x0, x1, w in ln:
            keep.append((x0, w))
            prev = x1
        if keep:
            txt.append(' ' * max(0, int((keep[0][0] - 40) / 3.5)) + ' '.join(w for _, w in keep))
    res.append('\n'.join(txt))
open(out, 'w').write('\f'.join(res))
