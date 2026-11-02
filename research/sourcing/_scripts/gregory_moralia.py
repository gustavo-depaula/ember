import sys, os, re, html
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
G = ROOT + 'research/sourcing/gregory-the-great/'
LW = G + 'ws/Moralia_/Moralia_'
ROMLC = [r.lower() for r in ROM]

def strip_page_numbers(t, maxjump=3):
    # The TEI page counter is inlined as a bare number; real numerals in the text are rare and never chain by +1..3.
    ms = list(re.finditer(r'(?<=[A-Za-z,;:?!).])\s(\d{1,4})\s(?=\S)', t))
    vals = [int(m.group(1)) for m in ms]
    def near(k, j):
        return 1 <= abs(vals[k] - vals[j]) <= maxjump and (vals[k] - vals[j]) * (k - j) > 0 and abs(ms[k].start() - ms[j].start()) > 120
    drop = [m for k, m in enumerate(ms) if (k > 0 and near(k, k-1)) or (k + 1 < len(ms) and near(k+1, k))]
    for m in reversed(drop):
        t = t[:m.start()] + ' ' + t[m.end():]
    return t

def clean_la(t, numbered=True):
    t = strip_wiki(t)
    t = re.sub(r'\[\s*(?:Vet|Rec)[^\]]*\]', '', t)
    t = re.sub(r'(?<![\w.])\d{3,4}(?=\s)', '', t)
    t = strip_page_numbers(t)
    t = re.sub(r'\s*CAPUT ([IVXLC]+|[A-Z]{5,})\.?(?:\s*\.)?', lambda m: '\n\n@@CAP %s@@\n\n' % m.group(1), t)
    t = re.sub(r'^=+.*?=+\s*$', '', t, flags=re.M)
    return t

PRIMUM = {'PRIMUM': 'I', 'SECUNDUM': 'II', 'TERTIUM': 'III'}
def split_numbered(p, state):
    """Cut a paragraph where the next section number N. starts inside it."""
    out = []
    while True:
        cut = None
        for n in (state['n'], state['n'] + 1):
            m = re.search(r'(?<=[.;:?!)”"])\s(%d)\.\s(?=[A-ZÆŒ])' % n, p)
            if m and (cut is None or m.start() < cut.start()):
                cut = m
        if not cut: break
        out.append(p[:cut.start()].strip()); p = p[cut.start():].strip()
        state['n'] = int(cut.group(1)) + 1
    out.append(p)
    return [x for x in out if x]

def latin_book(body):
    state = {'n': 1}
    ps = paras2(body)
    # first paragraph "1." may open with number
    res = []
    for p in ps:
        m = re.match(r'(\d{1,3})\.\s', p)
        if m and int(m.group(1)) in (state['n'], state['n'] + 1): state['n'] = int(m.group(1)) + 1
        res.extend(split_numbered(p, state) if True else [p])
    out = []
    for p in res:
        c = re.fullmatch(r'@@CAP (\w+)@@', p)
        if c:
            out.append('### Caput %s' % PRIMUM.get(c.group(1), c.group(1)))
        elif p.isupper() and len(p) < 40:
            out.append('**%s**' % p.rstrip('.').capitalize())
        else:
            # a heading marker inside a paragraph (after a lemma line)
            parts = re.split(r'@@CAP (\w+)@@', p)
            for k, x in enumerate(parts):
                if k % 2: out.append('### Caput %s' % PRIMUM.get(x, x))
                elif x.strip(): out.append(x.strip())
    return out

NAMES = {}
ORD = ['PRIMUS','SECUNDUS','TERTIUS','QUARTUS','QUINTUS','SEXTUS','SEPTIMUS','OCTAVUS','NONUS','DECIMUS','UNDECIMUS','DUODECIMUS']
def lname(n):
    if n <= 12: return [ORD[n-1]]
    if n < 20: return ['DECIMUS ' + ORD[n-11]]
    t, u = divmod(n, 10)
    base = {2: 'VIGESIMUS', 3: 'TRIGESIMUS'}[t]
    return [base] if u == 0 else [base + ' ' + ORD[u-1]]
def latin_books():
    books = {}; raw = []
    texts = []
    for pars in ['I', 'II', 'III', 'IV', 'V', 'VI']:
        t = open(LW + pars + '.wiki').read(); raw.append(t); texts.append(t)
    full = '\n'.join(texts)
    full = re.sub(r'(?m)^\*.*$', '', full)
    pos = []
    for n in range(1, 36):
        nm = lname(n)[0]
        m = re.search(r'(?m)^(?:[^a-z\n]{0,40}?)(?:==\s*)?LIBER %s(?=[ .,=])\s*\.?(?:\s*,\s*ET ULTIMUS)?\s*\.?\s*(?:==)?' % nm, full)
        assert m, n
        pos.append((m.start(), m.end()))
    for n in range(35):
        end = pos[n+1][0] if n < 34 else len(full)
        books[n+1] = (lname(n+1)[0], full[pos[n][1]:end])
    return books, raw

def english(f):
    t = open(G + 'en/lc-moralia/' + f, errors='ignore').read()
    ps = re.findall(r'<p[^>]*>(.*?)</p>', t, flags=re.S)
    out = []
    for p in ps:
        p = re.sub(r'<(i|em)>', '*', p, flags=re.I); p = re.sub(r'</(i|em)>', '*', p, flags=re.I)
        s = re.sub(r'<[^>]+>', '', p); s = html.unescape(s).replace('\xa0', ' ')
        s = re.sub(r'\s+', ' ', s).strip()
        s = re.sub(r'\*\s+\*', ' ', s); s = s.replace('**', '')
        if s and s != '*': out.append(s)
    return out

if __name__ == '__main__':
    books, raw = latin_books()
    print('latin books', len(books))
    chs_la = {}; chs_en = {}; toc = []
    # epistle & preface
    prae = open(LW + 'prae.wiki').read(); raw.append(prae)
    e, p = re.split(r'^==\s*Praefatio\s*==\s*$', prae, flags=re.M)
    e = e.split('==Epistola ==', 1)[1]
    for cid, ttl, txt in [('epistola', 'Epistola ad Leandrum', e), ('praefatio', 'Praefatio', p)]:
        ps = latin_book(clean_la(txt))
        chs_la[cid] = '# %s\n\n' % ttl + '\n\n'.join(ps)
    def en_text(f, endmark_pred):
        ps = english(f)
        return ps
    def trim_en(ps, start_pred):
        i = next(k for k, s in enumerate(ps) if start_pred(s))
        # drop trailing nav
        j = len(ps)
        while j > i and re.fullmatch(r'(BOOK [IVXL]+\.?|Moralia Index|The Preface|Home.*|THE PREFACE.*)', ps[j-1]): j -= 1
        return ps[i:j]
    def en_chapters(ps, label):
        out = []; fn = {}; first = True
        body = []
        for s in ps:
            m = re.fullmatch(r'\[([ivxlc]+)\]\s*(?:\[([^\]]+)\])?', s)
            if m:
                body.append('### Chapter %s' % m.group(1).upper())
                if m.group(2): body.append('**%s**' % m.group(2).title())
                continue
            m = re.fullmatch(r'\[([A-Z ,.]+)\]', s)
            if m:
                body.append('**%s**' % m.group(1).title()); continue
            if (s.isupper() and len(s) < 60 and s.endswith('.')) or s == 'HISTORICAL INTERPRETATION':
                body.append('**%s**' % s.rstrip('.').title()); continue
            m = re.match(r'^\[([a-z])\]\s+(.+)$', s)
            if m and len(s) > 6:
                fn[m.group(1)] = m.group(2); continue
            body.append(s)
        txt = body
        if label != 'ep' and not any(x == '### Chapter I' for x in txt):
            idx = 1 if txt and txt[0].startswith('*') and txt[0].endswith('*') else 0
            txt.insert(idx, '### Chapter I')
        md = '\n\n'.join(txt)
        for k in fn: md = re.sub(r'\[%s\]' % k, '[^%s]' % k, md)
        if fn: md += '\n\n' + '\n'.join('[^%s]: %s' % (k, v) for k, v in fn.items())
        return md
    # English epistle / preface
    ps = english('Epistle.html'); i = next(k for k, s in enumerate(ps) if s.lstrip('*').startswith('To the Most Devout'))
    ps = ps[i:]
    while re.fullmatch(r'(BOOK I|Home.*)', ps[-1]): ps.pop()
    ps = [s.replace('*', '') if k < 2 else s for k, s in enumerate(ps)]
    ps = [re.sub(r'^([IVX]+)\. ', lambda m: '### Chapter %s\n\n' % m.group(1), s) for s in ps]
    chs_en['epistola'] = '# Epistle to Leander\n\n' + en_chapters(ps, 'ep')
    ps = english('Preface.html'); i = next(k for k, s in enumerate(ps) if s.startswith('1. '))
    ps = ps[i:]
    chs_en['praefatio'] = '# Preface\n\n' + en_chapters(ps, 'pr')
    toc.append({'id': 'epistola', 'title': {'la': 'Epistola ad Leandrum', 'en-US': 'Epistle to Leander'}})
    toc.append({'id': 'praefatio', 'title': {'la': 'Praefatio', 'en-US': 'Preface'}})
    for n in range(1, 36):
        name, body = books[n]
        ttl = 'Liber %s' % ROM[n-1]; ttle = 'Book %s' % ROM[n-1]
        ps = latin_book(clean_la(body))
        # rubric summary is the first paragraph: italicise
        if ps and not ps[0].startswith('###'): ps[0] = '*%s*' % ps[0]
        cid = 'b%02d' % n
        chs_la[cid] = '# %s\n\n' % ttl + '\n\n'.join(ps)
        eps = english('Book%02d.html' % n)
        k = next(k for k, s in enumerate(eps) if re.fullmatch(r'BOOK %s\.?' % ROM[n-1], s))
        eps = eps[k+1:]
        while re.fullmatch(r'(BOOK [IVXL]+\.?|Moralia Index|Home.*)', eps[-1]): eps.pop()
        j = 0
        while j < len(eps) and len(eps[j]) < 900 and not re.match(r'(\[|\d|Ver\.|[A-Z]{2,}\b|THE PREFACE)', eps[j]) and not eps[j].isupper(): j += 1
        summ = ' '.join(eps[:j]); eps = ['*%s*' % summ] + eps[j:]
        chs_en[cid] = '# %s\n\n' % ttle + en_chapters(eps, cid)
        toc.append({'id': cid, 'title': {'la': ttl, 'en-US': ttle}})
    import pickle; pickle.dump((chs_la, chs_en, toc, raw), open('/tmp/w/moralia.pkl', 'wb'))
    print(sum(words(m) for m in chs_la.values()), sum(words(m) for m in chs_en.values()))
