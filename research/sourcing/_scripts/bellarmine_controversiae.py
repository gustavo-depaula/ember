import sys, re; sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bellarmine_split import *
ORDS = 'PRIM SECUND TERTI QUART QUINT SEXT SEPTIM OCTAV NON DECIM'.split()
BK = re.compile(r'^(?:DE [A-Z ,.]{3,40}?\s+)?(?:(?:LIBER|CONTROVERSIA|CONTR\.)\.?\s+(?P<o>PRIM|SECUND|TERTI|QUART|QUINT|SEXT|SEPTIM|OCTAV|NON|DECIM)\w*|(?P<o2>PRIM|SECUND|TERTI|QUART|QUINT|SEXT|SEPTIM|OCTAV|NON|DECIM)\w*\s+(?:CONTROVERSIA|PETITIO)|(?:LIBER|CONTROVERSIA)\.?\s+(?P<r>[IVX]{1,4}))\b[\s.,:]*(?:(?:DE|De)\b.*)?$', re.I)
def bn(p):
    if len(p) > 120: return None
    m = BK.match(p)
    if not m: return None
    o = m.group('o') or m.group('o2')
    return ORDS.index(o.upper()) + 1 if o else rom(m.group('r'))
def segment(paras, lo, hi):
    """-> (pre_paras, [ [book_n, kind, idx, [(cn, idx, inline)]] ])"""
    books = []; book = None
    for i in range(lo, hi):
        p = paras[i]
        if len(p) > 120: continue
        b = bn(p)
        if b is not None:
            if book is None and b == 1 or book is not None and b == book[0] + 1:
                book = [b, 'Controversia' if 'CONTR' in p.upper() else 'Liber', i, []]; books.append(book)
            continue
        m = CHAP.match(p)
        if not m: continue
        n = rom(m.group(1))
        if n is None: continue
        if book is None:
            if n == 1: book = [1, 'Liber', None, []]; books.append(book)
            else: continue
        exp = book[3][-1][0] + 1 if book[3] else 1
        if exp <= n <= exp + 2: book[3].append((n, i, m.group(2).strip()))
    return books
def build(slug, vols, name, descs, composed='1586', parts=None, lang='la', outdir=None, bid=None, work=None):
    """vols: list of (vol, start_line, end_line|None). Builds one book from the concatenated segments."""
    allp = []; srcs = []
    for v, a, z in vols:
        P = bc.clean_volume(v).split('\n\n')
        hi = (z - 1) // 2 if z else next(i for i, p in enumerate(P) if re.match(r'^INDEX\b', p) and i > 800)
        allp.extend(P[(a - 1) // 2:hi]); srcs.append(vives_source(v))
    paras = explode(allp)
    books = segment(paras, 0, len(paras))
    chapters = []; log = []
    if not books or not books[0][3]:
        books = [[1, 'Liber', None, [(1, -1, '')]]]
    synth = books[0][2] is None and books[0][3][0][1] == -1
    first = next((c[1] for b in books for c in b[3]), len(paras))
    if books[0][2] is not None and books[0][2] < first: first = books[0][2]
    pre = [] if synth else [bc.fix(p) for p in clean_body(paras[:first])]
    if words(' '.join(pre)) >= 100:
        chapters.append(dict(id='praefatio', title={'la': 'Praefatio', 'en-US': 'Preface'}, md={'la': ('Praefatio', pre)}))
    multi = len(books) > 1
    for bi, b in enumerate(books):
        prev = 0
        bend = books[bi + 1][2] if bi + 1 < len(books) and books[bi + 1][2] else (books[bi + 1][3][0][1] if bi + 1 < len(books) and books[bi + 1][3] else len(paras))
        grp = (f'b{b[0]}', {'la': f'{b[1]} {roman(b[0])}', 'en-US': ('Book ' if b[1] == 'Liber' else 'Controversy ') + roman(b[0])}) if multi else None
        if b[2] is not None:
            cstart = b[3][0][1] if b[3] else bend
            intro = [bc.fix(p) for p in clean_body(paras[b[2] + 1:cstart])]
            if words(' '.join(intro)) >= (1 if not b[3] else 40):
                ttl = 'Textus' if not b[3] else 'Praefatio'
                if not b[3] and words(' '.join(intro)) > 9000:
                    cur, cw, k = [], 0, 1
                    for q in intro + [None]:
                        if q is None or cw > 4500 and not q.startswith('#'):
                            if cur:
                                chapters.append(dict(id=f'b{b[0]}p{k:02d}' if multi else f'p{k:02d}', title={'la': f'Pars {k}', 'en-US': f'Part {k}'}, group=grp, md={'la': (f'Pars {k}', cur)})); k += 1
                            cur, cw = [], 0
                        if q is not None: cur.append(q); cw += len(q.split())
                else:
                    chapters.append(dict(id=f'b{b[0]}intro' if multi else 'intro', title={'la': ttl, 'en-US': ttl}, group=grp, md={'la': (ttl, intro)}))
        for ci, (n, i, inl) in enumerate(b[3]):
            if n != prev + 1: log.append(f'{slug} {b[1]} {b[0]}: chapter(s) {prev+1}-{n-1} merged into the previous (heading not read)')
            prev = n
            nxt = b[3][ci + 1][1] if ci + 1 < len(b[3]) else (books[bi + 1][2] if bi + 1 < len(books) and books[bi + 1][2] else books[bi + 1][3][0][1] if bi + 1 < len(books) and books[bi + 1][3] else len(paras))
            t, j = title_after(paras, i, inl) if i >= 0 else ('', 0)
            body = [bc.fix(p) for p in clean_body(paras[j:nxt])]
            cid = f'b{b[0]}c{n:02d}' if multi else f'c{n:02d}'
            h = (f'Caput {roman(n)}' + (f'. {t}' if t else '')) if i >= 0 else 'Textus'
            gl = f'{b[1]} {roman(b[0])}'
            chapters.append(dict(id=cid, title={'la': h, 'en-US': h}, group=grp, md={'la': (h, body)}))
    # stray text before the first chapter of later books is attached to the book's first chapter by position; nothing is dropped
    for ci, c in enumerate(list(chapters)):
        h, ps = c['md']['la']
        if c['id'] == 'c01' and h == 'Textus' and words(' '.join(ps)) > 9000:
            new = []; cur, cw, k = [], 0, 1
            for q in ps + [None]:
                if q is None or cw > 4500:
                    if cur: new.append(dict(id=f'p{k:02d}', title={'la': f'Pars {k}', 'en-US': f'Part {k}'}, md={'la': (f'Pars {k}', cur)})); k += 1
                    cur, cw = [], 0
                if q is not None: cur.append(q); cw += len(q.split())
            chapters[ci:ci + 1] = new
    ed = dict(VIVES_ED)
    if lang != 'la':
        for c in chapters:
            c['title'] = {(lang if k == 'la' else k): v for k, v in c['title'].items()}; c['md'] = {lang: v for k, v in c['md'].items()}
            if c.get('group'): c['group'] = (c['group'][0], {(lang if k == 'la' else k): v for k, v in c['group'][1].items()})
        for sc in srcs: sc['language'] = lang
    d = mkbook(bid or 'bellarmine-controversiae-' + slug, work or 'controversiae/' + slug, name, descs, composed, [lang], {lang: ed}, srcs)
    d['work'] = 'bellarmine/' + (work or 'controversiae-' + slug)
    if lang != 'la': d['author'] = {lang: AUTHOR[lang], 'en-US': AUTHOR['en-US'], 'pt-BR': AUTHOR['pt-BR']}
    wc = write_book(outdir or 'controversiae/' + slug, d, chapters)
    author_file()
    return wc, log
