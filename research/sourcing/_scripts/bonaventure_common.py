"""Shared helpers for the Bonaventure imports."""
import re, html, json, os

def html_text(path):
    s = open(path, 'rb').read().decode('utf-8', errors='replace')
    s = re.sub(r'(?is)<(script|style).*?</\1>', '', s)
    s = re.sub(r'(?i)<br\s*/?>|</p>|</div>|</h\d>|</tr>|</li>', '\n', s)
    return html.unescape(re.sub(r'<[^>]+>', '', s))

def roman(n):
    r = ''
    for v, s in [(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r

def words(path_or_text):
    t = open(path_or_text).read() if os.path.exists(path_or_text) else path_or_text
    return len(t.split())

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w').write(text)

def book_json(root, d):
    os.makedirs(root, exist_ok=True)
    with open(os.path.join(root, 'book.json'), 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')

def author_file():
    p = 'content/authors/bonaventure.json'
    if not os.path.exists(p):
        json.dump({'name': {'en-US': 'St. Bonaventure', 'pt-BR': 'São Boaventura'}, 'century': 13,
                   'saint': 'bonaventure',
                   'matches': ['Bonaventure', 'Bonaventura', 'Bonaventure, Saint, Cardinal', 'Bonaventure, Saint, Cardinal, 1221-1274', 'Bonaventura, Santo']},
                  open(p, 'w'), ensure_ascii=False, indent=2)
        open(p, 'a').write('\n')

def deaccent_la(s):
    for a, b in {'à':'a','á':'a','è':'e','é':'e','ì':'i','í':'i','ò':'o','ó':'o','ù':'u','ú':'u','À':'A','É':'E','È':'E','Ì':'I','Ò':'O','Ù':'U','\x97':'—','\x96':'–','\x92':'’','\x93':'“','\x94':'”'}.items():
        s = s.replace(a, b)
    return s

PT_AUTHOR = 'São Boaventura'
EN_AUTHOR = 'St. Bonaventure'
LA_AUTHOR = 'Bonaventura de Balneoregio'

def emit(slug, bid, names, descr, composed, work, langs, editions, sources, toc, files, cover='classic', group=None):
    """files: {lang: {chapter_id: markdown}}; toc: [(id, {lang: title}) or (id, titles, children)]"""
    root = 'content/books/bonaventure-opera-omnia/' + slug
    import shutil
    for l in langs:
        shutil.rmtree(os.path.join(root, l), ignore_errors=True)
        for cid, text in files.get(l, {}).items():
            write(os.path.join(root, l, cid + '.md'), text.rstrip('\n') + '\n')
    def node(t):
        n = {'id': t[0], 'title': t[1]}
        if len(t) > 2: n['children'] = [node(c) for c in t[2]]
        return n
    d = {'id': bid, 'cover': cover, 'name': names,
         'author': {'la': LA_AUTHOR, 'en-US': EN_AUTHOR, 'pt-BR': PT_AUTHOR} if 'la' in langs else {'en-US': EN_AUTHOR, 'pt-BR': PT_AUTHOR},
         'description': descr, 'composed': composed, 'languages': langs, 'work': work,
         'editions': editions, 'sources': sources, 'toc': [node(t) for t in toc]}
    book_json(root, d)
    return root

def src(language, url, edition, description, tier, evidence):
    return {'language': language, 'url': url, 'edition': edition, 'description': description, 'tier': tier, 'tierEvidence': evidence}

def is_en(t):
    w = t.lower().split()
    en = sum(w.count(x) for x in ('the', 'of', 'and', 'to', 'is', 'that', 'his', 'which'))
    la = sum(w.count(x) for x in ('et', 'est', 'quod', 'in', 'ad', 'non', 'ut', 'sed', 'quae', 'qui'))
    return en > la

def numbered_en(lines):
    """Facing-text OCR (Boehner, Healy): English numbered paragraphs. -> list of [num, text]; drops Latin pages, page heads, footnotes."""
    blocks = []; cur = []
    for ln in lines:
        if ln.strip(): cur.append(ln.strip())
        elif cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    head = re.compile(r'^(CHAPTER|PROLOGUE|CHAP\.)[^a-z]{0,25}$|^[A-Z .,:;-]{4,40}\s+\d{1,3}$|^\d{1,3}\s+[A-Z .,:;-]{4,40}$')
    keep = []
    for i, b in enumerate(blocks):
        t = ' '.join(b)
        if len(b) == 1 and head.match(b[0]): keep.append(('H', t)); continue
        keep.append(('B', t))
    # drop footnote blocks that precede a header
    out = []
    for i, (k, t) in enumerate(keep):
        out.append([k, t])
    for i in range(len(out)):
        if out[i][0] == 'H':
            j = i - 1
            while j >= 0 and out[j][0] == 'B' and len(out[j][1].split()) < 45 and re.match(r'^\d+[\s).,]|^[A-Z]?\d', out[j][1]) and not re.match(r'^\d+\. [A-Z][a-z]+ [a-z]+ [a-z]+', out[j][1]):
                out[j][0] = 'F'; j -= 1
    paras = []
    for k, t in out:
        if k != 'B' or not is_en(t): continue
        m = re.match(r'^([0-9gIlOoiz]{1,2})[.,] (.*)$', t)
        if m:
            tok = m.group(1); prev = paras[-1][0] if paras else 0
            n = {'g': 9, 'I': 1, 'l': 1, 'O': 0, 'o': 0, 'iz': 11}.get(tok) or (int(tok) if tok.isdigit() else prev + 1)
            paras.append([n, m.group(2)])
        elif paras: paras[-1][1] += ' ' + t
    for p in paras:
        p[1] = re.sub(r'(\w)- (?=[a-z])', r'\1', p[1])
    return paras
