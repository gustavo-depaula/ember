"""Benson / More / Fisher: Gutenberg or archive.org plain text -> en-US corpus book (heading-regex driven).
usage: rhb_build.py plan CONFIG.json     show detected headings
       rhb_build.py build CONFIG.json    write the book
CONFIG: id, dir, slug, work, name, name_pt, author, author_pt, desc, desc_pt, composed, editor, year, edition, url, srcnote,
 tierEvidence, lang (en-US), src (path under research/sourcing), start, end (1-based lines, end exclusive), mode pg|ia,
 chap_re (regex on a stripped line; groups: n = numeral/label, t = inline title), part_re (same), label ("Chapter" or ""),
 title_next (take next block as title if short), sec_re (lone numeral lines -> ## heading), drop (regexes), drop_blocks,
 front/back: [{id,title,from,to}] raw ranges, titles: {n: title}, lead_title (title for text before first chapter, optional)"""
import sys, os, re, json, collections
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
ROOT = '/Users/gustavo/Documents/prayer'
SM = {'of','the','and','in','to','a','an','by','for','on','with','from','at','or','as','is','his','her','our','its','but','not','upon','into'}
def tcase(t):
    t = re.sub(r'\s+', ' ', t).strip().rstrip('.,')
    if t != t.upper(): return t
    ws = t.lower().split(' ')
    return ' '.join(w if (i and w in SM) else re.sub(r"^(\W*)(\w)", lambda m: m.group(1) + m.group(2).upper(), w) for i, w in enumerate(ws))
def romfix(t):
    t = re.sub(r'\b([IVXLivxl]{1,7})\b', lambda m: m.group(1).upper() if re.fullmatch(r'[IVXL]+', m.group(1).upper()) and m.group(1) in ('Ii','Iii','Iv','Vi','Vii','Viii','Ix','Xi','Xii','Xiii','Xiv','Xv','Xvi','Xvii','Xviii','Xix','Xx') else m.group(1), t)
    return re.sub(r'\s*--\s*', ': ', t)
def blocks_of(lines):
    out, cur = [], []
    for ln in lines:
        ln = ln.replace('\x0c', '').rstrip()
        if ln.strip(): cur.append(ln)
        elif cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def joinb(b, mode):
    if mode == 'pg': t = ' '.join(x.strip() for x in b)
    else: t = E.join_lines(b)
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s*--\s*', '—', t)
    return t
OCR = [(r'\btlie\b','the'),(r'\btbe\b','the'),(r'\bTlie\b','The'),(r'\bTbe\b','The'),(r'\bwliich\b','which'),(r'\bwhicli\b','which'),(r'\bwbich\b','which'),
       (r'\btbat\b','that'),(r'\btbis\b','this'),(r'\bliis\b','his'),(r'\bwitli\b','with'),(r'\bwitb\b','with'),(r'\bGocl\b','God'),(r'\bGrod\b','God'),
       (r'\btliat\b','that'),(r'\btliis\b','this'),(r'\btliey\b','they'),(r'\btliem\b','them'),(r'\btlien\b','then'),(r'\btliere\b','there'),(r'\bwlio\b','who'),
       (r'\bwliat\b','what'),(r'\bwlien\b','when'),(r'\bwliere\b','where'),(r'\bhirn\b','him'),(r'\bwhorn\b','whom')]
def fix(t, mode):
    if mode == 'ia':
        for a, b in OCR: t = re.sub(a, b, t)
        t = re.sub(r'\s+([;:!?,.])', r'\1', t)
    return t
def is_head(t, counts, cfg):
    if re.fullmatch(r'[\dIil|]{1,4}\.?', t) and re.search(r'\d', t): return True
    if re.fullmatch(r'\d{1,4}', t): return True
    for r in cfg.get('drop', []):
        if re.search(r, t): return True
    w = t.split()
    if not w or len(w) > 12 or cfg['mode'] != 'ia': return False
    key = re.sub(r'[\d\W_]+', '', t).lower()
    a = [c for c in t if c.isalpha()]
    if not a: return True
    up = sum(c.isupper() for c in a) / len(a)
    hasnum = bool(re.match(r'^[\dIl|]{1,4}\s', t) or re.search(r'\s[\dIl|]{1,4}\.?$', t))
    if up >= 0.6 and hasnum and not re.search(r'[a-z]{4,}', t): return True
    if hasnum and counts[key] >= 2 and len(w) <= 9: return True
    if up >= 0.9 and counts[key] >= 3 and len(w) <= 10: return True
    return False
def runcounts(lines, mode):
    c = collections.Counter()
    for b in blocks_of(lines):
        t = joinb(b, mode)
        if len(t.split()) <= 12: c[re.sub(r'[\d\W_]+', '', t).lower()] += 1
    return c
def paras(lines, cfg, counts=None):
    out = []
    for b in blocks_of(lines):
        t = fix(joinb(b, cfg['mode']), cfg['mode'])
        if not t: continue
        if cfg.get('dropfull') and re.fullmatch(cfg['dropfull'], t): continue
        if counts is not None and is_head(t, counts, cfg): continue
        out.append(t)
    res = []
    for p in out:
        if res and not re.search(r'[.!?"”’:;)\]*_]\s*$', res[-1]) and p[:1].islower() and not res[-1].startswith('#') and cfg['mode'] == 'ia':
            res[-1] = E.join_lines([res[-1], p])
        else: res.append(p)
    return res
AUTH = {'benson': dict(author='Mgr. Robert Hugh Benson', author_pt='Mons. Robert Hugh Benson', died=1914),
        'more': dict(author='St. Thomas More', author_pt='São Tomás More', died=1535),
        'fisher': dict(author='St. John Fisher', author_pt='São João Fisher', died=1535)}
def resolve(cfg, lines):
    if isinstance(cfg['start'], str):
        cfg['start'] = next(i for i, l in enumerate(lines) if re.search(cfg['start'], l.strip()) and i > cfg.get('after', 30)) + 2
    if isinstance(cfg['end'], str):
        cfg['end'] = next((i for i, l in enumerate(lines) if i > cfg['start'] and re.search(cfg['end'], l.strip())), len(lines)) + 1
def load(cfg):
    for k, v in AUTH.items():
        if cfg['dir'].startswith(k + '-'):
            for a, b in v.items(): cfg.setdefault(a, b)
    cfg.setdefault('work', cfg['dir'].replace('-opera-omnia', '').replace('/', '/'))
    cfg.setdefault('mode', 'pg' if cfg['src'].find('/pg/') >= 0 else 'ia')

    p = cfg['src'] if os.path.isabs(cfg['src']) else os.path.join(ROOT, 'research/sourcing', cfg['src'])
    return open(p, encoding='utf8', errors='ignore').read().split('\n')
def marks(body, cfg):
    if cfg.get('manual'):
        out = []
        for h, title, *rest in cfg['manual']:
            class M:  # manual heading
                def __init__(s, t, kind): s.t = t; s.kind = kind
                def group(s, k=0): return s.t if k == 0 else None
                def groupdict(s): return {'t': s.t, 'n': ''}
            out.append((h - cfg['start'], 'part' if rest and rest[0] == 'part' else 'chap', M(title, 'x')))
        return out
    cr = re.compile(cfg['chap_re']); pr = re.compile(cfg['part_re']) if cfg.get('part_re') else None
    out = []
    for i, l in enumerate(body):
        s = l.strip()
        if not s: continue
        if pr and pr.match(s): out.append((i, 'part', pr.match(s)))
        elif cr.match(s): out.append((i, 'chap', cr.match(s)))
    return out
def plan(cfg):
    lines = load(cfg); resolve(cfg, lines); body = lines[cfg['start'] - 1:cfg['end'] - 1]
    for i, k, m in marks(body, cfg): print(cfg['start'] + i, k, repr(m.group(0)[:70]))
def roman(n):
    out = ''
    for v, r in ((1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')):
        while n >= v: out += r; n -= v
    return out
def build(cfg):
    lines = load(cfg); resolve(cfg, lines); body = lines[cfg['start'] - 1:cfg['end'] - 1]
    counts = runcounts(body, cfg['mode']) if cfg['mode'] == 'ia' else None
    mk = marks(body, cfg)
    root = os.path.join(ROOT, 'content/books', cfg['dir'])
    lang = cfg.get('lang', 'en-US')
    os.makedirs(root + '/' + lang, exist_ok=True); os.makedirs(root + '/sources/%s-originals' % lang, exist_ok=True)
    words = 0; toc = []; part = None; warn = []; nchap = 0; npart = 0
    def write(cid, title, ps):
        nonlocal words
        if cfg.get('h2'):
            ps = ['## ' + tcase(x) if re.fullmatch(cfg['h2'], x) else x for x in ps]
        if cfg.get('pgfn'):
            notes, keep = {}, []
            for x in ps:
                fm = re.fullmatch(r'\[Footnote (\d+): (.*)\]', x)
                if fm: notes[fm.group(1)] = fm.group(2)
                else: keep.append(x)
            keep = [re.sub(r'\[(\d+)\]', lambda m: '[^%s]' % m.group(1) if m.group(1) in notes else m.group(0), x) for x in keep]
            ps = keep + [''] * 0
            if notes: ps = keep + ['\n'.join('[^%s]: %s' % (k, v) for k, v in sorted(notes.items(), key=lambda kv: int(kv[0])))]
        md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
        open('%s/%s/%s.md' % (root, lang, cid), 'w').write(md); words += len(md.split())
    def add(node):
        (part['children'] if part is not None else toc).append(node)
    for fr in cfg.get('front', []):
        write(fr['id'], fr['title'], paras(lines[fr['from'] - 1:fr['to'] - 1], cfg, counts)); toc.append({'id': fr['id'], 'title': {lang: fr['title']}})
    if mk and cfg.get('lead_title') and mk[0][0] > 0:
        ps = paras(body[:mk[0][0]], cfg, counts)
        if sum(len(p.split()) for p in ps) > 40:
            write(cfg.get('lead_id','preface'), cfg['lead_title'], ps); toc.append({'id': cfg.get('lead_id','preface'), 'title': {lang: cfg['lead_title']}})
    label = cfg.get('label', 'Chapter'); secre = re.compile(cfg['sec_re']) if cfg.get('sec_re') else None
    pcount = 0
    for j, (i, kind, m) in enumerate(mk):
        e = mk[j + 1][0] if j + 1 < len(mk) else len(body)
        seg = body[i + 1:e]
        inl = (m.groupdict().get('t') or '').strip()
        # title from following block
        title = inl
        if not title and (cfg.get('title_next') or (kind == 'part' and cfg.get('part_title_next'))):
            bl = blocks_of(seg)
            if bl:
                t0 = joinb(bl[0], cfg['mode'])
                if len(t0.split()) <= cfg.get('title_max', 12) and (t0 == t0.upper() or not re.search(r'[a-z]{3,}.*[.!?]$', t0) or re.match(cfg.get('title_ok', r'^\b$'), t0)) and not (secre and secre.match(t0)):
                    title = t0
                    k = 0; seen = 0
                    while seen < 1 and k < len(seg):
                        if seg[k].strip(): 
                            while k < len(seg) and seg[k].strip(): k += 1
                            seen = 1
                        else: k += 1
                    seg = seg[k:]
        if title == '__skip': continue
        title = tcase(title).rstrip('.') if title else ''
        n = (m.groupdict().get('n') or '').strip().rstrip('.')
        if cfg.get('nfix') and n: n = n.upper().replace('1','I').replace('L','I').replace('Y','V')
        if kind == 'chap' and cfg.get('renumber'): pcount += 1; n = roman(pcount)
        if kind == 'part':
            npart += 1; pcount = 0
            ptitle = (m.group(0).strip().rstrip('.') if not inl and not n else None)
            ptitle = romfix(tcase(re.sub(r'\s+', ' ', m.group(0).strip().rstrip('.'))))
            if title and title not in ptitle: ptitle += ': ' + title
            part = {'id': 'part-%d' % npart, 'title': {lang: ptitle}, 'children': []}; toc.append(part)
            ps = paras(seg, cfg, counts)
            if sum(len(p.split()) for p in ps) > 60:
                write('part-%d-intro' % npart, ptitle, ps); part['children'].append({'id': 'part-%d-intro' % npart, 'title': {lang: ptitle}})
            continue
        nchap += 1
        cid = 'chapter-%02d' % nchap if cfg.get('pad', True) else 'chapter-%d' % nchap
        ov = cfg.get('titles', {}).get(str(nchap))
        if ov: title = ov
        pre = (label + ' ' if label else '') + n
        if not n and m.group(0).strip().upper() != 'CHAPTER' and not m.groupdict().get('n') and not label == '':
            pre = tcase(m.group(0).strip()); cid = re.sub(r'\W+', '-', pre.lower()).strip('-')
        htitle = pre + '. ' + title if (title and n) else (title or pre or ('%d' % nchap))
        if secre:
            ps = []; cur = []
            for l in seg:
                if secre.match(l.strip()):
                    ps += paras(cur, cfg, counts); cur = []
                    ps.append('## ' + l.strip().rstrip('.'))
                else: cur.append(l)
            ps += paras(cur, cfg, counts)
        else: ps = paras(seg, cfg, counts)
        if sum(len(p.split()) for p in ps) < 8: warn.append('tiny %s %s' % (cid, htitle))
        write(cid, htitle, ps); add({'id': cid, 'title': {lang: htitle}})
    for fr in cfg.get('back', []):
        write(fr['id'], fr['title'], paras(lines[fr['from'] - 1:fr['to'] - 1], cfg, counts)); toc.append({'id': fr['id'], 'title': {lang: fr['title']}})
    open(root + '/sources/%s-originals/%s.txt' % (lang, cfg['slug']), 'w').write('\n'.join(body))
    book = {'id': cfg['id'], 'cover': 'classic',
            'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
            'author': {'en-US': cfg['author'], 'pt-BR': cfg['author_pt']},
            'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']},
            'composed': cfg['composed'], 'languages': [lang], 'work': cfg['work'],
            'editions': {lang: {'editor': cfg['editor'], 'year': cfg['year']}},
            'sources': [{'language': lang, 'url': cfg['url'], 'edition': cfg['edition'],
                         'description': cfg.get('srcnote', '') + (' Running heads and page numbers are dropped; the OCR was cleaned of line-break hyphens and the commonest recognition slips, and isolated slips remain.' if cfg['mode'] == 'ia' else ' Gutenberg licence and transcriber notes are dropped.') + ' Raw text in sources/%s-originals/.' % lang,
                         'tier': 'A', 'tierEvidence': cfg.get('tierEvidence', '%s died in %d and the edition is of %d, so the text is public domain.' % (cfg['author'], cfg['died'], cfg['year']))}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print('\n'.join(warn)); print(root, nchap, 'chapters', words, 'words (source %d)' % len(' '.join(body).split()))
if __name__ == '__main__':
    cfg = json.load(open(sys.argv[2]))
    {'plan': plan, 'build': build}[sys.argv[1]](cfg)
