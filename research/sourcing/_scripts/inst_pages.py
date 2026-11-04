"""Parse an archive.org djvu.xml into pages of word boxes: pickle list of pages, each [(x0,y0,x1,y1,text,conf)]."""
import re, sys, pickle, html
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8', errors='replace').read()
pages = []
for pg in s.split('<OBJECT ')[1:]:
    m = re.search(r'width="(\d+)" height="(\d+)"', pg)
    ws = []
    for c, conf, t in re.findall(r'<WORD coords="([\d,-]+)" x-confidence="(\d+)">(.*?)</WORD>', pg, re.S):
        l, b, r, tp = map(int, c.split(','))
        ws.append((l, tp, r, b, html.unescape(t).strip(), int(conf)))
    pages.append({'w': int(m.group(1)), 'h': int(m.group(2)), 'words': ws})
pickle.dump(pages, open(out, 'wb'))
print(len(pages), sum(len(p['words']) for p in pages))
