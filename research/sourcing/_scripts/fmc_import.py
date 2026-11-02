"""Faber / Challoner / Manning: archive.org djvu OCR -> corpus book (en-US only).
usage: fmc_import.py CONFIG.json
CONFIG keys: id, dir (under content/books), slug, work, name, name_pt, author, author_pt, desc, desc_pt, composed,
  editor, year, edition, url, srcnote, src (djvu path), start, end (1-based line numbers, end exclusive),
  levels: ["BOOK","CHAPTER"] top-down heading keywords that make toc nodes/files (deepest = file),
  inline: ["SECTION"] keywords that become ## headings inside a file,
  front: [{id,title,from,to}] line ranges for preface etc, back: same for appendices,
  fn: true to extract symbol footnotes, label: {"CHAPTER":"Chapter"} """
import sys, os, re, json, collections
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
ROOT = '/Users/gustavo/Documents/prayer'
NUM = r'([IVXLCDMivxl1!TUYJH]{1,9})'
OCRFIX = [(r'\btlie\b', 'the'), (r'\btbe\b', 'the'), (r'\bTlie\b', 'The'), (r'\bTbe\b', 'The'), (r'\bwliich\b', 'which'), (r'\bwhicli\b', 'which'),
          (r'\bwbich\b', 'which'), (r'\btbat\b', 'that'), (r'\btbis\b', 'this'), (r'\bliis\b', 'his'), (r'\bwitli\b', 'with'), (r'\bwitb\b', 'with'),
          (r'\bhimself\b', 'himself'), (r'\bGocl\b', 'God'), (r'\bEaith\b', 'Faith'), (r'\bGrod\b', 'God'), (r'\bJESTJS\b', 'JESUS'), (r'\bJestjs\b', 'Jesus'),
          (r'\btliat\b', 'that'), (r'\btliis\b', 'this'), (r'\btliey\b', 'they'), (r'\btliem\b', 'them'), (r'\btlien\b', 'then'), (r'\btliere\b', 'there'),
          (r'\btlioso\b', 'those'), (r'\bwlio\b', 'who'), (r'\bwhorn\b', 'whom'), (r'\bwliat\b', 'what'), (r'\bwlien\b', 'when'), (r'\bwliere\b', 'where')]
def rom(s):
    s = s.upper().replace('H', 'II').replace('!', 'I').replace('1', 'I').replace('T', 'I').replace('U', 'I').replace('J', 'I').replace('Y', 'V')
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t
def norm(t):
    t = re.sub(r'\s+', ' ', t).strip()
    t = re.sub(r'\s+([;:!?,.])', r'\1', t)
    t = t.replace(' )', ')').replace('( ', '(')
    for a, b in OCRFIX: t = re.sub(a, b, t)
    return t
def capsy(l):
    a = [c for c in l if c.isalpha()]
    return len(a) >= 2 and sum(c.isupper() for c in a) >= 0.7 * len(a)
def title_case(t):
    t = re.sub(r'(^|\s)[_\W]+(?=\s)', r'\1', re.sub(r'\s+', ' ', t).strip()).strip().rstrip('.,')
    t = re.sub(r'(\w)- (\w)', r'\1\2', t)
    ws = ['of' if w == 'op' else w for w in t.lower().split(' ')]
    SM = {'of', 'the', 'and', 'in', 'to', 'a', 'an', 'by', 'for', 'on', 'with', 'from', 'at', 'or', 'as', 'is', 'his', 'her', 'our', 'its', 'but', 'not'}
    out = []
    for i, w in enumerate(ws):
        first = i == 0 or ws[i - 1].endswith(('.', ':', ';'))
        out.append(w if (not first and w in SM) else re.sub(r"^(\W*)(\w)", lambda m: m.group(1) + m.group(2).upper(), w))
    return ' '.join(out)
def split_units(lines, cfg):
    kws = cfg['levels'] + cfg.get('inline', [])
    rx = re.compile(r'^\s*(' + '|'.join(kws) + r')\s+' + NUM + r'\s*[.,]?\s*\S{0,3}\s*$')
    marks = [(i, m.group(1), rom(m.group(2))) for i, l in enumerate(lines) for m in [rx.match(l)] if m]
    return marks
def get_title(seg):
    """caps lines right after a heading -> (title, rest)"""
    n = 0
    while n < len(seg) and not seg[n].strip(): n += 1
    t = []
    while n < len(seg) and seg[n].strip() and capsy(seg[n]): t.append(seg[n].strip()); n += 1
    if not t:
        return '', seg[n:] if n < len(seg) else []
    # a title may continue after one blank line if still caps
    m = n
    while m < len(seg) and not seg[m].strip(): m += 1
    if m < len(seg) and m - n <= 2 and capsy(seg[m]) and len(' '.join(t)) < 40 and not re.match(r'^\s*(' + '|'.join(cfg_kws) + r')\b', seg[m]):
        k = m; extra = []
        while k < len(seg) and seg[k].strip() and capsy(seg[k]): extra.append(seg[k].strip()); k += 1
        if len(extra) <= 2 and not re.search(r'\d', ' '.join(extra)): t += extra; n = k
    return ' '.join(t), seg[n:]
FNSTART = re.compile(r'^(\*+|[†‡§|]+|[tJfF%]|\*\*)\s+(?=\S)')
def blocks_of(lines):
    out, cur = [], []
    for ln in lines:
        ln = ln.replace('\x0c', '')
        if ln.strip(): cur.append(ln)
        elif cur: out.append(cur); cur = []
    if cur: out.append(cur)
    return out
def runhead_counts(blocks):
    c = collections.Counter()
    for b in blocks:
        t = norm(E.join_lines(b))
        if len(t.split()) <= 12: c[re.sub(r'[\d\W_]+', '', t).lower()] += 1
    return c
def is_head(t, counts, strict):
    w = t.split()
    if re.fullmatch(r'[\dIl|ivxlcIVXLC]{1,6}\.?', t) and re.search(r'\d', t) or re.fullmatch(r'\d{1,4}', t): return True
    if re.fullmatch(r'[\dIil|]{1,4}', t): return True
    if len(w) > 14 or not w: return False
    key = re.sub(r'[\d\W_]+', '', t).lower()
    a = [c for c in t if c.isalpha()]
    if not a: return True
    up = sum(c.isupper() for c in a) / len(a)
    hasnum = bool(re.match(r'^[\dIl|]{1,4}\s', t) or re.search(r'\s[\dIl|]{1,4}\.?$', t))
    if up >= 0.6 and hasnum and not re.search(r'[a-z]{4,}', t): return True
    if up >= 0.9 and counts[key] >= 3 and len(w) <= 10: return True
    return False
def smallcaps(p):
    m = re.match(r"^(\W*)([A-Z]{2,})(\s+)([a-z])", p)
    if m and m.group(2).lower() in E.W and m.group(2) not in ('OF',): return m.group(1) + m.group(2).capitalize() + p[m.end(2):]
    return p
def process(lines, cfg, counts, fnstate):
    """lines -> markdown paragraph list with footnotes; fnstate: dict(n=count, notes={})"""
    bl = [norm(E.join_lines(b)) for b in blocks_of(lines)]
    pages, cur = [], {'body': [], 'fn': []}
    for b in bl:
        if not b: continue
        if re.match(r'^\W*(Digi\w*[ -]+by|Google\b|>?y Google|Original from)', b) and len(b) < 60: continue
        if is_head(b, counts, True): pages.append(cur); cur = {'body': [], 'fn': []}; continue
        if cfg.get('fn') and FNSTART.match(b) and len(b) < 1800:
            m = FNSTART.match(b)
            if m.group(1) in ('*', '**', '***', '†', '‡', '§', '|', '||', 'J', 't', 'f', '%') and (m.group(1) in '*†‡§|' or True):
                if not re.search(r'[A-Za-z]{3,}', b[m.end():]): continue
                cur['fn'].append((m.group(1), b[m.end():].strip())); continue
        cur['body'].append(b)
    pages.append(cur)
    out = []
    for pg in pages:
        body = pg['body']
        for key, text in pg['fn']:
            fnstate['n'] += 1; ref = '[^%d]' % fnstate['n']; fnstate['notes'][fnstate['n']] = text
            placed = False
            pat = re.compile(r'(?<=[\w.,;:!?"”’\')])(?:\*+|[†‡§])(?=[\s.,;:)]|$)')
            for i, b in enumerate(body):
                mm = pat.search(b)
                if mm: body[i] = b[:mm.start()] + ref + b[mm.end():]; placed = True; break
            if not placed:
                if body: body[-1] = body[-1] + ref
                else: out.append(ref)
        out.extend(body)
    if cfg.get('romanheads'): out = ['## ' + p if re.fullmatch(r'[IVX]{1,5}\.', p) else p for p in out]
    out = [smallcaps(p) for p in out]
    merged = []
    for p in out:
        plain = re.sub(r'\[\^\d+\]', '', merged[-1]) if merged else ''
        if merged and not re.search(r'[.!?"”’:;)\]]\s*$', plain) and p[:1].islower() and not merged[-1].startswith('#'):
            merged[-1] = E.join_lines([merged[-1], p])
        else: merged.append(p)
    return merged
def root_dir(cfg):
    return os.path.join(ROOT, 'content/books', cfg['dir'])
def roman(n):
    out = ''
    for v, r in ((1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v: out += r; n -= v
    return out
def pre_key(part, cfg):
    return (part['id'].split('-')[1] + '.') if part and len(cfg['levels']) > 1 else ''
def units_mode(cfg, all_lines, counts, root):
    """explicit units: [{id,title,from,part?}] (1-based start lines, in order); each runs to the next start or cfg['end'].
    Leading capitals / numeral blocks (the printed headings) are dropped."""
    us = cfg['units']; fnstate = {'n': 0, 'notes': {}}; toc = []; part = None; words = 0
    for fr in cfg.get('front', []):
        n0 = fnstate['n']; paras = process(all_lines[fr['from'] - 1:fr['to'] - 1], cfg, counts, fnstate)
        words += emit(root, fr['id'], fr['title'], paras, fnstate, n0); toc.append({'id': fr['id'], 'title': {'en-US': fr['title']}})
    for i, u in enumerate(us):
        e = us[i + 1]['from'] if i + 1 < len(us) else cfg['end']
        seg = all_lines[u['from'] - 1:e - 1]
        bl = blocks_of(seg)
        while bl and (capsy(' '.join(bl[0])) or re.fullmatch(r'[\W\dIVXLivxl]{0,8}', ' '.join(bl[0]).strip())): bl.pop(0)
        lines = [l for b in bl for l in b + ['']]
        n0 = fnstate['n']; paras = process(lines, cfg, counts, fnstate)
        words += emit(root, u['id'], u['title'], paras, fnstate, n0)
        node = {'id': u['id'], 'title': {'en-US': u['title']}}
        if u.get('part'):
            if not part or part['id'] != u['part']['id']:
                part = {'id': u['part']['id'], 'title': {'en-US': u['part']['title']}, 'children': []}; toc.append(part)
            part['children'].append(node)
        else: part = None; toc.append(node)
    return toc, words, fnstate
def emit(root, cid, title, paras, fnstate, n0):
    notes = {k: v for k, v in fnstate['notes'].items() if k > n0}
    keys = sorted(notes); mp = {k: i + 1 for i, k in enumerate(keys)}
    body = re.sub(r'\[\^(\d+)\]', lambda m: '[^%d]' % mp[int(m.group(1))] if int(m.group(1)) in mp else m.group(0), '\n\n'.join(paras))
    md = '# %s\n\n%s\n' % (title, body)
    if keys: md += '\n' + '\n\n'.join('[^%d]: %s' % (mp[k], notes[k]) for k in keys) + '\n'
    open('%s/en-US/%s.md' % (root, cid), 'w').write(md)
    return len(md.split())
def write_book(cfg, root, toc, words, nn, all_lines):
    if len(all_lines) > 1: open(root + '/sources/en-US-originals/%s-ia.txt' % cfg['slug'], 'w').write('\n'.join(all_lines[cfg['start'] - 1:cfg['end'] - 1]))
    book = {'id': cfg['id'], 'cover': 'classic',
            'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
            'author': {'en-US': cfg['author'], 'pt-BR': cfg['author_pt']},
            'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']},
            'composed': cfg['composed'], 'languages': ['en-US'], 'work': cfg['work'],
            'editions': {'en-US': {'editor': cfg['editor'], 'year': cfg['year']}},
            'sources': [{'language': 'en-US', 'url': cfg['url'], 'edition': cfg['edition'],
                         'description': cfg['srcfull'] if cfg.get('srcfull') else cfg.get('srcnote', '') + ' Running heads and page numbers are dropped; the OCR was cleaned of line-break hyphens and the commonest recognition slips, and isolated slips remain. Raw OCR in sources/en-US-originals/.',
                         'tier': 'A', 'tierEvidence': '%s died in %d and the edition is of %d, so the text is public domain.' % (cfg['author'], cfg['died'], cfg['year'])}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print(root, len(os.listdir(root + '/en-US')), 'files', words, 'words;', nn, 'footnotes')
def main():
    global cfg_kws
    cfg = json.load(open(sys.argv[1]))
    cfg_kws = cfg.get('levels', []) + cfg.get('inline', [])
    src = cfg['src'] if os.path.isabs(cfg['src']) else os.path.join(ROOT, 'research/sourcing', cfg['src'])
    all_lines = open(src, encoding='utf8', errors='ignore').read().split('\n')
    for k, v in cfg.get('fixlines', {}).items(): all_lines[int(k) - 1] = v
    os.makedirs(root_dir(cfg) + '/en-US', exist_ok=True); os.makedirs(root_dir(cfg) + '/sources/en-US-originals', exist_ok=True)
    body_lines = all_lines[cfg['start'] - 1:cfg['end'] - 1]
    counts = runhead_counts(blocks_of(body_lines))
    if cfg.get('units'):
        toc, words, fs = units_mode(cfg, all_lines, counts, root_dir(cfg))
        write_book(cfg, root_dir(cfg), toc, words, fs['n'], all_lines); return
    marks = split_units(body_lines, cfg)
    lv = {k: i for i, k in enumerate(cfg['levels'])}
    root = os.path.join(ROOT, 'content/books', cfg['dir'])
    os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
    # build unit list
    units = []  # dict(kind,level,num,title,lines)
    for j, (i, kw, num) in enumerate(marks):
        e = marks[j + 1][0] if j + 1 < len(marks) else len(body_lines)
        title, rest = get_title(body_lines[i + 1:e])
        units.append({'kw': kw, 'num': num, 'title': title, 'lines': rest, 'head': body_lines[i].strip()})
    # merge duplicates / empties
    merged = []
    for u in units:
        words = len(' '.join(u['lines']).split())
        if merged and merged[-1]['kw'] == u['kw'] and merged[-1]['num'] == u['num'] and len(' '.join(merged[-1]['lines']).split()) < 25:
            if not merged[-1]['title']: merged[-1]['title'] = u['title']
            merged[-1]['lines'] = merged[-1]['lines'] + u['lines']; continue
        merged.append(u)
    units = merged
    # leading text before first heading
    pre = body_lines[:marks[0][0]] if marks else body_lines
    fnstate = {'n': 0, 'notes': {}}
    files = []  # (id, title, md, part_idx)
    toc = []; part = None; words = 0; warn = []
    label = cfg.get('label', {})
    def lab(kw, num, title):
        n = num
        return '%s %s. %s' % (label.get(kw, kw.title()), ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX', 'XXXI', 'XXXII', 'XXXIII', 'XXXIV', 'XXXV', 'XXXVI', 'XXXVII', 'XXXVIII', 'XXXIX', 'XL'][num] if num < 41 else str(num), title_case(title)) if title else '%s %s' % (label.get(kw, kw.title()), num)
    def write(cid, title, paras, notes_start):
        nonlocal words
        notes = {k: v for k, v in fnstate['notes'].items() if k > notes_start}
        # renumber notes locally
        keys = sorted(notes); mp = {k: i + 1 for i, k in enumerate(keys)}
        body = '\n\n'.join(paras)
        body = re.sub(r'\[\^(\d+)\]', lambda m: '[^%d]' % mp[int(m.group(1))] if int(m.group(1)) in mp else m.group(0), body)
        md = '# %s\n\n%s\n' % (title, body)
        if keys: md += '\n' + '\n\n'.join('[^%d]: %s' % (mp[k], notes[k]) for k in keys) + '\n'
        open('%s/en-US/%s.md' % (root, cid), 'w').write(md); words += len(md.split())
    for fr in cfg.get('front', []):
        n0 = fnstate['n']
        paras = process(all_lines[fr['from'] - 1:fr['to'] - 1], cfg, counts, fnstate)
        write(fr['id'], fr['title'], paras, n0); toc.append({'id': fr['id'], 'title': {'en-US': fr['title']}})
    top = cfg['levels'][0]; deep = cfg['levels'][-1]
    cur_file = None
    def flush():
        pass
    seq = collections.Counter(); expect = {}
    for u in units:
        kw = u['kw']; n0 = fnstate['n']
        if kw in cfg.get('inline', []):
            # inline heading inside the current file: handled when composing; fall through below
            pass
    # compose: iterate units, accumulating inline units into the preceding file unit
    groups = []  # list of dict(unit, extra[(kw,num,title,lines)])
    for u in units:
        if u['kw'] in cfg.get('inline', []):
            if groups and groups[-1].get('file'): groups[-1]['extra'].append(u)
            else: warn.append('inline before file %s %s' % (u['kw'], u['num']))
        else:
            groups.append({'u': u, 'extra': [], 'file': u['kw'] == deep})
    prevnum = {}
    for g in groups:
        u = g['u']; kw = u['kw']
        if kw != deep:
            # part
            seq[kw] += 1
            if u['num'] != seq[kw]: warn.append('part numbering %s: got %s expected %s' % (kw, u['num'], seq[kw]))
            ptitle = lab(kw, seq[kw], u['title'])
            if cfg.get('ptitles', {}).get(str(seq[kw])): ptitle = '%s %s. %s' % (label.get(kw, kw.title()), roman(seq[kw]), cfg['ptitles'][str(seq[kw])])
            part = {'id': '%s-%d' % (kw.lower(), seq[kw]), 'title': {'en-US': ptitle}, 'children': []}
            toc.append(part)
            seq[deep] = 0 if cfg.get('reset', True) else seq[deep]
            intro = process(u['lines'], cfg, counts, fnstate)
            if sum(len(p.split()) for p in intro) > 150:
                n0 = fnstate['n']
                cid = '%s-%d-intro' % (kw.lower(), seq[kw]); write(cid, ptitle + ': Introduction' if False else 'Introduction to ' + ptitle.split('.')[0], intro, n0)
                part['children'].append({'id': cid, 'title': {'en-US': 'Introduction to ' + ptitle.split('.')[0]}})
            continue
        seq[deep] += 1
        if u['num'] != seq[deep]: warn.append('%s numbering in %s: got %s expected %s (%s)' % (deep, part['id'] if part else '-', u['num'], seq[deep], u['title'][:30]))
        n0 = fnstate['n']
        paras = process(u['lines'], cfg, counts, fnstate)
        for x in g['extra']:
            paras.append('## ' + lab(x['kw'], x['num'], x['title']))
            paras += process(x['lines'], cfg, counts, fnstate)
        title = lab(kw, seq[deep], u['title'])
        ov = cfg.get('titles', {}).get('%s%d' % (pre_key(part, cfg), seq[deep]))
        if ov: title = '%s %s. %s' % (label.get(kw, kw.title()), roman(seq[deep]), ov)
        pre_id = ('%s-%d-' % (cfg['levels'][0].lower(), seq[cfg['levels'][0]])) if len(cfg['levels']) > 1 else ''
        cid = '%s%s-%d' % (pre_id, deep.lower(), seq[deep])
        write(cid, title, paras, n0)
        node = {'id': cid, 'title': {'en-US': title}}
        (part['children'] if part and len(cfg['levels']) > 1 else toc).append(node)
    for fr in cfg.get('back', []):
        n0 = fnstate['n']
        paras = process(all_lines[fr['from'] - 1:fr['to'] - 1], cfg, counts, fnstate)
        write(fr['id'], fr['title'], paras, n0); toc.append({'id': fr['id'], 'title': {'en-US': fr['title']}})
    # raw source
    open(root + '/sources/en-US-originals/%s-ia.txt' % cfg['slug'], 'w').write('\n'.join(all_lines[cfg['start'] - 1:cfg['end'] - 1]))
    book = {'id': cfg['id'], 'cover': 'classic',
            'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
            'author': {'en-US': cfg['author'], 'pt-BR': cfg['author_pt']},
            'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']},
            'composed': cfg['composed'], 'languages': ['en-US'], 'work': cfg['work'],
            'editions': {'en-US': {'editor': cfg['editor'], 'year': cfg['year']}},
            'sources': [{'language': 'en-US', 'url': cfg['url'], 'edition': cfg['edition'],
                         'description': cfg['srcfull'] if cfg.get('srcfull') else cfg.get('srcnote', '') + ' Running heads and page numbers are dropped; the OCR was cleaned of line-break hyphens and the commonest recognition slips, and isolated slips remain. Raw OCR in sources/en-US-originals/.',
                         'tier': 'A', 'tierEvidence': '%s died in %d and the edition is of %d, so the text is public domain.' % (cfg['author'], cfg['died'], cfg['year'])}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    nfiles = len(os.listdir(root + '/en-US'))
    print('\n'.join(warn)); print(root, nfiles, 'files', words, 'words;', fnstate['n'], 'footnotes')
if __name__ == "__main__":
    main()
