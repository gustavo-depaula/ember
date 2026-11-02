"""Denzinger, Enchiridion symbolorum (ed. 11, Bannwart, Freiburg 1911), archive.org OCR -> entries by D number.
usage: denz_parse.py <djvu.txt> <out.json>"""
import re, sys, json

SIGLA = re.compile(r'\b(ML|MG|Msi|Hrd|Hfl|CspQ|CspANQ|Jf|Pth|Cst|MGh|CSEL|Rcht|Bar\(?Th|MBR|DuPl|KBdS|BR\(?T|Ed\.|ib\.|cf\.|Cf\.|AAS|ASS|Hrt|Rsk|Mir|Kch|Bullar)\b')
GREEK = re.compile(r'\b(Kai|Tf\||TTpo|tou|Tou|xou|uuv|TTepi|ctuv|ouk|ouv|T6v|Toi?\b)|\|Li|\bK\^|[a-z][A-Z]{2,}[a-z]?[A-Z]')
RUN = re.compile(r'^\s*(\d{1,3}\s+)?[A-Za-z\.\s]{0,40}\b\d{3,4}\s*[—–\-]+\s*\d{3,4}\b.*$')

def load(path):
    L = open(path).read().split('\n')
    s = next(i for i, l in enumerate(L) if i > 1500 and re.match(r'^\s*Symbolum\s+Apostolicum', l)) if False else 2262
    e = 35560
    return [re.sub(r'\s+', ' ', l).strip() for l in L[s:e]]

def is_greek(l):
    toks = l.split()
    if not toks: return False
    bad = sum(1 for t in toks if GREEK.search(t))
    nonlat = sum(1 for c in l if c in '<>^|~{}®©§')
    return bad / len(toks) > 0.25 or nonlat > 2

def main(src, out):
    lines = load(src)
    # drop page running heads and Greek lines
    keep = []
    for l in lines:
        if RUN.match(l) and len(l) < 110: continue
        if re.match(r'^[\d\[\]]*\s*(Index|Infallibilitas|Romanus Pontifex)\b', l): continue
        keep.append(l)
    # paragraphs
    paras, cur = [], []
    for l in keep:
        if not l:
            if cur: paras.append(cur); cur = []
        else:
            cur.append(l)
    if cur: paras.append(cur)
    res = []
    for p in paras:
        txt = ' '.join(p)
        glines = sum(is_greek(x) for x in p)
        if glines > len(p) / 2: continue
        sig = len(SIGLA.findall(txt))
        if sig >= 2 and len(txt) < 1500: continue
        res.append([x for x in p if not is_greek(x)])
    # entry segmentation by increasing D number at the start of a line
    entries, exp = [], 1
    cur = None
    for p in res:
        for l in p:
            m = re.match(r'^(\d{1,4})\s+(?:\((\d{1,4})\)\s*)?(\S.*)$', l)
            if m and exp <= int(m.group(1)) <= exp + 6 and not re.match(r'^\d', m.group(3)):
                cur = {'d': int(m.group(1)), 'old': m.group(2), 'lines': [m.group(3)]}
                entries.append(cur); exp = cur['d'] + 1
            elif cur is not None:
                cur['lines'].append(l)
        if cur is not None: cur['lines'].append('')
    json.dump(entries, open(out, 'w'), ensure_ascii=False)
    got = {e['d'] for e in entries}
    miss = [n for n in range(1, 2148) if n not in got]
    print(len(entries), 'entries; last', entries[-1]['d'], '; missing', len(miss), miss[:50])

main(*sys.argv[1:3])
