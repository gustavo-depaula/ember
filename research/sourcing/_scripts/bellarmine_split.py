"""Splitting and book writing shared by the Bellarmine imports."""
import re, os, json, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bellarmine_common as bc
from bellarmine_common import ROOT, BOOKS, capsy, words

ORD = {'PRIMUM':1,'PRIMUS':1,'PRIMA':1,'SECUNDUM':2,'SECUNDUS':2,'SECUNDA':2,'TERTIUM':3,'TERTIUS':3,'TERTIA':3,'QUARTUM':4,'QUARTUS':4,
       'QUINTUM':5,'QUINTUS':5,'SEXTUM':6,'SEXTUS':6,'SEPTIMUM':7,'SEPTIMUS':7,'OCTAVUM':8,'OCTAVUS':8,'NONUM':9,'NONUS':9,'DECIMUM':10,'DECIMUS':10}
def rom(s):
    s = s.upper().strip(' .\'-:')
    if s in ORD: return ORD[s]
    s = s.replace('Y', 'V').replace('T', 'I').replace('1', 'I').replace('L', 'I') if not re.fullmatch(r'L?X{0,3}(IX|IV|V?I{0,3})', s.replace('Y','V').replace('T','I').replace('1','I')) else s.replace('Y','V').replace('T','I').replace('1','I')
    if not s or not re.fullmatch(r'[IVXLC]+', s): return None
    v = {'I':1,'V':5,'X':10,'L':50,'C':100}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i + 1 < len(s) and v[c] < v[s[i+1]] else v[c]
    return t if 0 < t < 90 else None
def roman(n):
    r = ''
    for v, s in [(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r

CHAP = re.compile(r'^(?:CAP(?:UT|ITULUM)?|Cap)\.?\s*([IVXLTY1l]+|PRIMUM|SECUNDUM|TERTIUM)[.\s\-\'‘’:;]*(.*)$')
BOOK = re.compile(r'^LIBER\.?\s+(PRIM|SECUND|TERTI|QUART|QUINT|SEXT|SEPTIM|OCTAV|NON|DECIM)\w*\.?\s*$', re.I)
def bnum(s):
    m = BOOK.match(s)
    return ('PRIM SECUND TERTI QUART QUINT SEXT SEPTIM OCTAV NON DECIM'.split().index(m.group(1).upper()) + 1) if m else None

def walk(paras, lo, hi, chap_re=CHAP, book_re=BOOK, nbooks=None, gap=3):
    """-> list of books [(n, idx|None, [(cn, idx, inline_title)])]; sequential acceptance of headings."""
    books = []; cur = None
    for i in range(lo, hi):
        p = paras[i]
        if len(p) > 140: continue
        b = bnum(p) if book_re else None
        if b is not None and (cur is None and b == 1 or cur is not None and b == cur[0] + 1):
            cur = [b, i, []]; books.append(cur); continue
        m = chap_re.match(p)
        if not m: continue
        n = rom(m.group(1))
        if n is None: continue
        if cur is None: cur = [1, None, []]; books.append(cur)
        exp = cur[2][-1][0] + 1 if cur[2] else 1
        if exp <= n <= exp + gap - 1 or (not cur[2] and n == 1):
            cur[2].append((n, i, m.group(2).strip()))
    return books

def isjunk(p):
    t = p.split()
    if not t: return True
    good = sum(1 for w in t if re.fullmatch(r"[A-Za-zÀ-ÿæœÆŒ.,;:?!'\"«»()\-]*[A-Za-zÀ-ÿæœ]{2,}[A-Za-zÀ-ÿæœ.,;:?!'\"«»()\-]*", w))
    return good < 0.6 * len(t) and len(p) > 3 or (len(t) < 6 and len(p) < 40 and good < len(t))

def clean_body(ps, fix=True):
    out = []
    for p in ps:
        if len(p) <= 60 and capsy(p): continue
        if len(p) <= 3 or isjunk(p): continue
        out.append(p)
    return out

def title_after(paras, i, inline):
    """(title, next_index): inline title, else the short paragraph(s) after the heading."""
    if inline and len(inline) > 2: return inline, i + 1
    j = i + 1; t = []
    while j < len(paras) and len(paras[j]) <= 170 and len(t) < 2 and not paras[j].endswith(('?', ':', ';')) or (j < len(paras) and t == [] and len(paras[j]) <= 170 and j == i + 1):
        t.append(paras[j]); j += 1
        if t and len(' '.join(t)) > 120: break
        if not paras[j-1].endswith(('.',)) and len(t) == 1 and j < len(paras) and len(paras[j]) <= 80 and paras[j][:1].islower(): continue
        break
    return ' '.join(t).strip(' .;') if t else '', j

def esc(s): return s.replace('\\', '\\\\') if False else s

def write_chapter(lang_dir, cid, h1, paras):
    os.makedirs(lang_dir, exist_ok=True)
    body = '\n\n'.join(paras)
    open(f'{lang_dir}/{cid}.md', 'w').write(f'# {h1}\n\n{body}\n')
    return words(body)

def write_book(dirname, d, chapters, langs_dirs=None):
    """d: book.json fields except toc. chapters: list of dict(id, title{lang}, group=None|(gid, titledict), md{lang: (h1, paras)})."""
    root = f'{BOOKS}/bellarmine-opera-omnia/{dirname}'
    os.makedirs(root, exist_ok=True)
    toc = []; grp = {}; wc = {}
    for ch in chapters:
        node = {'id': ch['id'], 'title': ch['title']}
        g = ch.get('group')
        if g:
            if g[0] not in grp:
                grp[g[0]] = {'id': g[0], 'title': g[1], 'children': []}; toc.append(grp[g[0]])
            grp[g[0]]['children'].append(node)
        else: toc.append(node)
        for lang, (h1, paras) in ch['md'].items():
            wc[lang] = wc.get(lang, 0) + write_chapter(f'{root}/{lang}', ch['id'], h1, paras)
    d = dict(d); d['toc'] = toc
    with open(f'{root}/book.json', 'w') as f:
        json.dump(d, f, ensure_ascii=False, indent=2); f.write('\n')
    return wc

AUTHOR = {'la': 'Robertus Bellarminus', 'it': 'Roberto Bellarmino', 'en-US': 'St. Robert Bellarmine', 'pt-BR': 'São Roberto Belarmino'}
VIVES_ED = {'editor': 'Justin Fèvre (Vivès, Paris)', 'year': 1870}
def vives_source(vol, desc_extra=''):
    return {'language': 'la', 'url': f'https://archive.org/details/{bc.VOLS[vol][:-2] if bc.VOLS[vol].endswith("_0") else bc.VOLS[vol]}',
            'edition': f'Roberti Bellarmini Opera omnia, ed. Justin Fèvre, tom. {vol} (Paris: Vivès, 1870-74).',
            'description': 'Archive.org OCR (djvu.txt, Boston College copy) cleaned by script: running heads, page numbers and the reference-only footnote blocks removed, line-end hyphens joined, recognisable OCR slips corrected by a lexicon pass, so some remain. ' + desc_extra,
            'tier': 'A', 'tierEvidence': 'Bellarmine died in 1621; the Vivès edition of 1870-74 is public domain.'}
def mkbook(bid, work, names, descs, composed, langs, editions, sources, cover='classic'):
    return {'id': bid, 'cover': cover, 'name': names, 'author': {k: v for k, v in AUTHOR.items() if k in ('en-US', 'pt-BR') or k in langs},
            'description': descs, 'composed': composed, 'languages': langs, 'work': f'bellarmine/{work}', 'editions': editions, 'sources': sources}

def author_file():
    p = f'{ROOT}/content/authors/bellarmine.json'
    if os.path.exists(p): return
    json.dump({'name': {'en-US': 'St. Robert Bellarmine', 'pt-BR': 'São Roberto Belarmino'}, 'century': 17,
               'matches': ['Robert Bellarmine', 'St. Robert Bellarmine', 'Saint Robert Bellarmine', 'Bellarmine, Robert', 'Robertus Bellarminus', 'Roberto Bellarmino', 'Bellarmine, Robert, Saint, 1542-1621']},
              open(p, 'w'), ensure_ascii=False, indent=2); open(p, 'a').write('\n')


def title_after(paras, i, inline):
    if inline and len(inline) > 2: return inline.strip(' .;'), i + 1
    if i + 1 >= len(paras) or len(paras[i+1]) > 170: return '', i + 1
    t = paras[i+1]; j = i + 2
    if j < len(paras) and len(paras[j]) <= 120 and paras[j][:1].islower() and not capsy(paras[j]): t += ' ' + paras[j]; j += 1
    return t.strip(' .;'), j

def en_paras(path, lo=0, hi=None):
    """Paragraphs of an archive.org English djvu.txt: page heads/numbers dropped, hyphens joined."""
    raw = open(path, errors='replace').read().split('\n')[lo:hi]
    paras = []; cur = []
    for l in raw + ['']:
        l = l.strip()
        if l: cur.append(l); continue
        if cur:
            paras.append(cur); cur = []
    out = []
    for ls in paras:
        t = ''
        for s in ls:
            if t.endswith('-') and s[:1].islower() and len(t) > 1 and t[-2].isalpha(): t = t[:-1] + s
            else: t = (t + ' ' + s) if t else s
        t = re.sub(r'\s+', ' ', t).strip()
        if re.fullmatch(r'[\dIVXLivxl\s.|\-]+', t) or (len(t) < 70 and re.search(r'\|\s*\d+\s*$|^\d+\s*\|', t)): continue
        out.append(t)
    return out


SMALL = {'of','the','and','in','to','a','an','for','on','by','at','from','with','or'}
def titlecase(t):
    w = t.lower().split()
    return ' '.join(x if (i and x in SMALL) else x[:1].upper() + x[1:] for i, x in enumerate(w))
def dropcap_merge(ps):
    """OCR drop caps leave the first line as its own paragraph: join it to the following lowercase paragraph."""
    out = []
    for p in ps:
        if out and p[:1].islower() and len(out[-1]) < 90 and not out[-1].endswith(('.', '?', '!', ':', ';')) and not out[-1].startswith('#'):
            out[-1] += ' ' + p
        else: out.append(p)
    return out
