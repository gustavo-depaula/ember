"""Shared engine for the Garrigou-Lagrange / Tanquerey imports: heading-driven split of an
archive.org OCR dump into chapter files (ocr_clean for paragraphs and footnotes) and a book.json."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import ocr_clean as oc

REPO = '/Users/gustavo/Documents/prayer'
RAW = REPO + '/research/sourcing/'


def roman(n):
    out = ''
    for v, s in ((1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            out += s
            n -= v
    return out


def sentence(t):
    t = re.sub(r'(\w)- (\w)', r'\1\2', re.sub(r'\s+', ' ', t)).strip(' .—-')
    t = re.sub(r"(\w['’]) ", r'\1', t)
    if t.isupper() or sum(c.isupper() for c in t) > 0.6 * max(1, sum(c.isalpha() for c in t)):
        t = t.lower()
    return t[:1].upper() + t[1:]


def junk(p):
    q = re.sub(r'\[\^\d+\]', '', p).strip()
    return len(q) < 80 and not q.startswith('#') and sum(c.isalpha() for c in q) < 0.6 * max(1, len(q))


def norm(l):
    return re.sub(r'\s+', ' ', l.replace('\x0c', '')).strip()


def load(path, a=0, b=None):
    return open(path, errors='replace').read().split('\n')[a:b]


def title_block(lines, i, maxlines=4):
    """the short block right after heading line i, if it looks like a title"""
    j = i + 1
    while j < len(lines) and not lines[j].strip():
        j += 1
    blk = []
    while j < len(lines) and lines[j].strip() and len(blk) < maxlines:
        blk.append(norm(lines[j]))
        j += 1
    txt = ' '.join(blk)
    if len(txt) > 160 or not txt:
        return '', i + 1
    return txt, j


def parse(lines, prx, urx, heads, fnstyle='num', fix=lambda s: s, pre=None, words=('Chapter', 'Article', 'Introduction'), stop=None,
          ptitle_lines=3, utitle_lines=3, minintro=120, p0=0, titles=None, tfix=lambda s: s):
    """returns list of nodes: dict(id, title, parent(id,title) or None, paras, notes)"""
    if pre:
        lines = [pre(l) for l in lines]
    H = []
    for i, l in enumerate(lines):
        s = norm(l)
        if prx and prx.match(s):
            H.append((i, 'p'))
        elif urx and urx.match(s):
            H.append((i, 'u'))
    pw, uw, iw = words
    segs, p, u = [], p0, 0
    parent = None
    for k, (i, kind) in enumerate(H):
        j = H[k + 1][0] if k + 1 < len(H) else len(lines)
        tb, body0 = title_block(lines, i, ptitle_lines if kind == 'p' else utitle_lines)
        body = lines[body0:j]
        if kind == 'p':
            p += 1
            u = 0
            parent = (f'ch{p}', f'{pw} {roman(p)}. {sentence(tb)}' if tb else f'{pw} {roman(p)}')
            segs.append(dict(kind='p', id=f'ch{p}-intro', title=iw, parent=parent, body=body))
        else:
            u += 1
            if parent is None:
                parent = None
            ut = f'{uw} {roman(u)}. {sentence(tb)}' if tb else f'{uw} {roman(u)}'
            if parent is None:
                segs.append(dict(kind='u', id=f'art{u}', title=ut, parent=None, body=body))
            else:
                segs.append(dict(kind='u', id=f'{parent[0]}-a{u}', title=ut, parent=parent, body=body))
    nodes = []
    carry = None
    for sg in segs:
        sg['title'] = tfix(sg['title'])
        if sg['parent']:
            sg['parent'] = (sg['parent'][0], tfix(sg['parent'][1]))
    for sg in segs:
        paras, notes = oc.clean(sg['body'], heads, fnstyle, stop=stop)
        paras = [fix(x) for x in paras if not junk(x)]
        notes = {k: fix(v) for k, v in notes.items()}
        wc = sum(len(x.split()) for x in paras)
        if sg['kind'] == 'p' and wc < minintro:
            # drop: too short to be a file (ignore stray lines)
            if paras:
                carry = (paras, notes)
            continue
        sg.update(paras=paras, notes=notes, wc=wc)
        nodes.append(sg)
    return nodes


def write_lang(root, lang, nodes, prefix_title=True):
    d = f'{root}/{lang}'
    os.makedirs(d, exist_ok=True)
    total = 0
    for n in nodes:
        t = n['title']
        if n['parent'] and n['kind'] == 'u':
            t = n['title']
        txt = oc.render(t if n['kind'] == 'u' or not n['parent'] else f"{n['parent'][1]}: {n['title']}", n['paras'], n['notes'])
        open(f"{d}/{n['id']}.md", 'w').write(txt)
        total += n['wc']
    return total


def toc(nodes, titles_by_lang):
    """titles_by_lang: {lang: {id: title}}; nodes = original-language nodes"""
    out, cur = [], None
    for n in nodes:
        tt = {lg: m[n['id']] for lg, m in titles_by_lang.items() if n['id'] in m}
        par = n['parent']
        if par is None:
            out.append(dict(id=n['id'], title=tt))
            cur = None
            continue
        if cur is None or cur['id'] != par[0]:
            cur = dict(id=par[0], title={lg: m.get('__p_' + par[0], par[1]) for lg, m in titles_by_lang.items() if '__p_' + par[0] in m}, children=[])
            out.append(cur)
        cur['children'].append(dict(id=n['id'], title=tt))
    return out


def titles_map(nodes):
    m = {}
    for n in nodes:
        m[n['id']] = n['title']
        if n['parent']:
            m['__p_' + n['parent'][0]] = n['parent'][1]
    return m


def write_json(root, d):
    os.makedirs(root, exist_ok=True)
    json.dump(d, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(root + '/book.json', 'a').write('\n')


def author_file(slug, name_en, name_pt, century, matches):
    p = f'{REPO}/content/authors/{slug}.json'
    if os.path.exists(p):
        return
    json.dump(dict(name={'en-US': name_en, 'pt-BR': name_pt}, century=century, matches=matches), open(p, 'w'), ensure_ascii=False, indent=2)
    open(p, 'a').write('\n')


def chunk(lines, id, title, heads, fnstyle='num', fix=lambda s: s, pre=None, stop=None, kind='u', parent=None):
    if pre:
        lines = [pre(l) for l in lines]
    paras, notes = oc.clean(lines, heads, fnstyle, stop=stop)
    paras = [fix(x) for x in paras if not junk(x)]
    notes = {k: fix(v) for k, v in notes.items()}
    return dict(kind=kind, id=id, title=title, parent=parent, paras=paras, notes=notes, wc=sum(len(x.split()) for x in paras))


def pre_common(l):
    l = l.rstrip()
    l = re.sub(r'\s*[¬]\s*$', '-', l)
    l = re.sub(r'\((i|l|I)\)', '(1)', l)
    return l


def words(nodes):
    return sum(n['wc'] for n in nodes)


def en_prepare(lines, heads):
    """English Herder OCR: page-bottom footnotes are blocks 'N text' and body markers are ' N' after
    punctuation. Rewrite both as '(N)' so ocr_clean's numeric style can place them."""
    raw = oc.blocks(lines)
    bl = [(b, oc.join_lines(b)) for b in raw]
    pages, cur = [], []
    for b, t in bl:
        cur.append([b, t])
        if oc.is_head(t, heads):
            pages.append(cur)
            cur = []
    pages.append(cur)
    out, last = [], 0
    for pg in pages:
        nums = []
        for k, (b, t) in enumerate(pg):
            m = re.match(r'^(\d{1,3}|\d[il]|[il]\d|[il]{1,2})\s+(?=\S)', t)
            if not m:
                continue
            tok = m.group(1).translate(str.maketrans('ilI', '111'))
            if tok == str(last + 1) or (tok == '1' and not nums):
                last = int(tok)
                pg[k] = [None, f'({tok}) ' + t[m.end():]]
                nums.append((tok, k))
        for tok, k in nums:
            for j, (b, t) in enumerate(pg):
                if j == k or t.startswith('(' + tok + ') '):
                    continue
                nb, c = re.subn(r'(?<=[\w.,;:”"’)\'])\s+' + tok + r'(?=\s|$)', '(' + tok + ')', t, count=1)
                if c:
                    pg[j] = [None, nb]
                    break
        out += pg
    res = []
    for b, t in out:
        res += (b if b is not None else [t]) + ['']
    return res


def fix_en(s):
    s = s.replace('¬', '')
    s = re.sub(r'\s+([.,;:])\[\^', r'\1[^', s)
    s = re.sub(r'([a-z”"’)])\s+\.\s+\d{1,3}\s+(?=[A-Z“])', r'\1. ', s)
    return s


def merged_nodes(langs):
    """langs: ordered {lang: nodes}; original-language order first, other-language-only nodes slotted before the first shared id"""
    order = list(langs)
    base = list(langs[order[0]])
    ids = {n['id'] for n in base}
    for lg in order[1:]:
        extra = [n for n in langs[lg] if n['id'] not in ids]
        if not extra:
            continue
        first_shared = next((n['id'] for n in langs[lg] if n['id'] in ids), None)
        for n in extra:
            before = langs[lg].index(n) < next((i for i, m in enumerate(langs[lg]) if m['id'] == first_shared), 10**9)
            if before:
                base.insert(0 + sum(1 for b in base if b.get('_pre')), dict(n, _pre=True))
            else:
                base.append(n)
            ids.add(n['id'])
    return base


def finish(slug, meta, langs, srcs=()):
    """meta: id, work, name{}, author{}, description{}, composed, editions{}, sources[]; writes md + book.json; returns word counts"""
    root = f'{REPO}/content/books/{slug}'
    for lg, nodes in langs.items():
        d = f'{root}/{lg}'
        os.makedirs(d, exist_ok=True)
        keep = {n['id'] + '.md' for n in nodes}
        for f in os.listdir(d):
            if f.endswith('.md') and f not in keep:
                os.remove(f'{d}/{f}')
        for n in nodes:
            txt = oc.render(n['title'], n['paras'], n['notes'])
            open(f"{d}/{n['id']}.md", 'w').write(txt)
    import shutil
    for sdir, path, name in srcs:
        os.makedirs(f'{root}/sources/{sdir}', exist_ok=True)
        shutil.copy(path, f'{root}/sources/{sdir}/{name}')
    tm = {lg: titles_map(nodes) for lg, nodes in langs.items()}
    base = merged_nodes(langs)
    # a node's title map needs the node from whichever language has it
    d = dict(meta)
    d['languages'] = list(langs)
    d['toc'] = toc(base, tm)
    write_json(root, d)
    return {lg: words(nodes) for lg, nodes in langs.items()}


def authors():
    author_file('garrigou-lagrange', 'Reginald Garrigou-Lagrange', 'Reginaldo Garrigou-Lagrange', 20, ['Reginald Garrigou-Lagrange', 'Réginald Garrigou-Lagrange', 'Garrigou-Lagrange'])
    author_file('tanquerey', 'Adolphe Tanquerey', 'Adolphe Tanquerey', 20, ['Adolphe Tanquerey', 'Tanquerey'])
