"""Parse the archive.org DjVuXML of Denzinger 1911 into per-page line boxes (pages.pkl)."""
import sys, pickle
import xml.etree.ElementTree as ET
pages = []
for ev, el in ET.iterparse(sys.argv[1], events=('end',)):
    if el.tag == 'OBJECT':
        W, H = int(el.get('width')), int(el.get('height'))
        lines = []
        for ln in el.iter('LINE'):
            ws = []
            for w in ln.iter('WORD'):
                c = list(map(int, w.get('coords').split(',')))
                ws.append((c[0], c[1], c[2], c[3], w.text or ''))
            if ws:
                lines.append(ws)
        pages.append((W, H, lines))
        el.clear()
pickle.dump(pages, open(sys.argv[2], 'wb'))
print(len(pages))
