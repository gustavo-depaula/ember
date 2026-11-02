import re, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))

REPO = '/Users/gustavo/Documents/prayer'
BOOKS = REPO + '/content/books/francis-de-sales-opera-omnia'

def wc(s):
    return len(s.split())

def write_chapter(book, lang, cid, title, paras):
    d = f'{BOOKS}/{book}/{lang}'
    os.makedirs(d, exist_ok=True)
    body = '\n\n'.join(p for p in paras if p.strip())
    open(f'{d}/{cid}.md', 'w').write(f'# {title}\n\n{body}\n')
    return wc(body)

def en_lines(path, start=0, end=None, head_re=None, foot_re=None):
    """Plain djvu text -> paragraphs, with hyphen joins; head_re drops running heads."""
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')[start:end]
    paras, cur = [], []
    maxw = 62
    def flush():
        nonlocal cur
        if cur:
            paras.append(cur)
        cur = []
    skip = False
    for l in lines:
        s = re.sub(r'\s+', ' ', l).strip()
        if not s:
            skip = False
            continue
        if skip:
            continue
        if foot_re and foot_re.match(s):
            skip = True
            continue
        if head_re and head_re.match(s):
            continue
        if re.fullmatch(r'[\dIVXLivxl\.]{1,8}|[A-Z]|\*?\d{1,3}', s):
            continue
        if cur and len(cur[-1]) < 0.72 * maxw and re.search(r'[.!?:;"”)\]]$', cur[-1]):
            flush()
        cur.append(s)
    flush()
    out = []
    for p in paras:
        t = ''
        for s in p:
            if not t:
                t = s
            elif re.search(r'[a-z]-$', t) and re.match(r'[a-z]', s):
                t = t[:-1] + s
            else:
                t += ' ' + s
        out.append(t)
    return out

AUTH = {'fr-FR': 'Saint François de Sales', 'en-US': 'St. Francis de Sales', 'pt-BR': 'São Francisco de Sales'}
FR_SRC = lambda desc, vol: {
    'language': 'fr-FR', 'url': 'https://www.donboscosanto.eu/francesco_di_sales/',
    'edition': f'Œuvres de saint François de Sales, édition complète d’après les autographes et les éditions originales, {vol}, Annecy: J. Niérat, 1892-1932. Scans with text layer (2022 re-OCR) from donboscosanto.eu.',
    'description': desc, 'tier': 'A',
    'tierEvidence': 'Francis died in 1622; the Annecy edition is of his own text in period spelling, published in or before 1932. Only Francis’s own text is used, not the editors’ apparatus.'}

def write_book(book, bid, name, desc, composed, langs, editions, sources, toc, extra=None):
    os.makedirs(f'{BOOKS}/{book}', exist_ok=True)
    d = {'id': bid, 'cover': 'classic', 'name': name, 'author': AUTH, 'description': desc,
         'composed': composed, 'languages': langs, 'work': f'francis-de-sales/{book}',
         'editions': editions, 'sources': sources, 'toc': toc,
         'arrived': {l: '2026-11-02' for l in langs}}
    if extra:
        d.update(extra)
    json.dump(d, open(f'{BOOKS}/{book}/book.json', 'w'), ensure_ascii=False, indent=2)
    open(f'{BOOKS}/{book}/book.json', 'a').write('\n')

def leaf(cid, **titles):
    return {'id': cid, 'title': {k.replace('_', '-'): v for k, v in titles.items()}}

def subheads(paras, start_re=r'^␂\s*(ARTICLE|Article)\b'):
    """Turn centered 'ARTICLE N' + title lines into '## ' headings."""
    out, i = [], 0
    while i < len(paras):
        p = paras[i]
        if re.match(start_re, p):
            t = [p.lstrip('␂').strip()]
            j = i + 1
            while j < len(paras) and j < i + 4 and len(paras[j]) < 110 and (paras[j].startswith('␂') or paras[j].isupper() or (paras[j][:1].islower() and len(paras[j]) < 70 and not re.search(r'[.;:]$', paras[j]))) :
                t.append(paras[j].lstrip('␂').strip())
                j += 1
            out.append('## ' + ' — '.join(t))
            i = j
            continue
        out.append(p.lstrip('␂'))
        i += 1
    return out

def trim_tail(paras):
    while paras and (paras[-1].startswith('␂') or paras[-1].isupper() or len(paras[-1]) < 6):
        paras = paras[:-1]
    return paras
