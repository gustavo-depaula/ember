"""Cleaner for the Vivès Opera omnia djvu.txt (archive.org): strips running heads, page numbers,
reference-only footnote blocks and (N) markers; joins hyphenated lines; yields paragraphs."""
import re, os, json
ROOT = '/Users/gustavo/Documents/prayer'
SRC = ROOT + '/research/sourcing/bellarmine'
BOOKS = ROOT + '/content/books'
VOLS = {1:'operaomnia01bell_0',2:'operaomnia02bell_0',3:'operaomnia03bell_0',4:'operaomnia04bell',5:'operaomnia05bell',
        6:'operaomnia06bell_0',7:'operaomnia07bell',8:'operaomnia08bell',9:'operaomnia09bell',10:'operaomnia10bell',
        11:'operaomnia11bell',12:'operaomnia12bell'}
PG = '\x0c'
def capsy(s):
    L = [c for c in s if c.isalpha()]
    return len(L) >= 3 and sum(c.isupper() for c in L) / len(L) > .6
NUM = re.compile(r'^\s*\d{1,4}\s*$')
HEADNUM = re.compile(r'^(.{4,70}?)\s+\d{1,4}$')
REF = re.compile(r'\b[A-Z][a-z]{0,6}\.\s+[IVXLC1l]+[,.]\s*\d|\bcap\.|\bPsal|\bIb\.|\bId\.')
SUBS = [(r'\bqux\b','quae'),(r'\bqua?e\s*stio\b','quaestio'),(r'\bsit\b(?=\s*$)','sit'),(r'\bprsesertim\b','praesertim')]

def clean_volume(v, force=False):
    out = f'{SRC}/clean/vol{v:02d}.txt'
    if os.path.exists(out) and not force: return open(out).read()
    raw = open(f'{SRC}/vives/{VOLS[v]}.txt', errors='replace').read().replace('¬', '¬')
    lines = [re.sub(r'\s+', ' ', l).strip() for l in raw.split('\n')]
    n = len(lines); drop = set(); marks = set()
    nb = [i for i, l in enumerate(lines) if l]          # non-blank indices
    pos = {i: k for k, i in enumerate(nb)}
    for k, i in enumerate(nb):
        l = lines[i]
        if NUM.match(l):
            for kk in (k - 1, k + 1):
                if 0 <= kk < len(nb):
                    j = nb[kk]; t = lines[j]
                    if len(t) <= 75 and capsy(t) and not NUM.match(t):
                        drop.update((i, j)); marks.add(min(i, j)); break
            else:
                # bare page number between blank runs
                if 0 < i < n - 1 and not lines[i-1] and not lines[i+1] and int(l) > 3:
                    pass
        elif capsy(l) and len(l) <= 70 and HEADNUM.match(l):
            m = HEADNUM.match(l)
            if capsy(m.group(1)) and re.search(r'LIBER|CAP|GRADUS|CONTROV|DE |ET |PRINC|PSAL|CONCIO', m.group(1)):
                drop.add(i); marks.add(i)
    res = []
    for i, l in enumerate(lines):
        if i in marks: res.append(PG)
        elif i in drop: continue
        else: res.append(l)
    text = '\n'.join(res)
    # pages
    pages = text.split(PG)
    outp = []
    for p in pages:
        paras = [re.sub(r'\s*\n\s*', '\n', q.strip()) for q in re.split(r'\n\s*\n', p) if q.strip()]
        while paras:
            q = paras[-1]
            if len(q) < 700 and (re.match(r'^[-—\s·.]*\(\s*[\dlI]{1,2}\s*\)', q) or (REF.search(q) and re.search(r'\([\dlI]{1,2}\)', q))):
                paras.pop()
            else: break
        outp.append(paras)
    # join paragraphs across pages
    paras = []
    for pi, ps in enumerate(outp):
        for qi, q in enumerate(ps):
            if re.match(r'^(Tom\.|TOM\.)\s*[IVXL]+\.?$', q) or re.match(r'^\d{1,3}\*?$', q): continue
            if qi == 0 and paras and re.search(r'[¬-]$', paras[-1]) and re.match(r'^[a-zæœ]', q):
                paras[-1] += '\n' + q
            elif qi == 0 and paras and not re.search(r'[.:;?!»"”)]\s*$', paras[-1]) and re.match(r'^[a-zàéíóúæœ]', q) and len(paras[-1]) > 40:
                paras[-1] += '\n' + q
            else: paras.append(q)
    final = []
    for q in paras:
        q = re.sub(r'[¬]\s*\n\s*', '', q)
        q = re.sub(r'(?<=[a-zæœ])-\n(?=[a-zæœ])', '', q)
        q = q.replace('\n', ' ')
        q = re.sub(r'\s*\(\s*[\dlI]{1,2}\s*\)(?=[\s.,;:?!]|$)', '', q)
        q = re.sub(r'\s+([.,;:?!])', r'\1', q)
        for a, b in SUBS: q = re.sub(a, b, q)
        q = re.sub(r'\s+', ' ', q).strip()
        if q: final.append(q)
    s = '\n\n'.join(final) + '\n'
    open(out, 'w').write(s)
    return s

def words(s): return len(re.findall(r'\w+', s))


def lexicon_from_clean():
    """Word frequencies from every cleaned volume, installed as the lexicon of bonaventure_common.fix_ocr."""
    import collections, bonaventure_common as bc
    if bc._lex and getattr(bc, '_bell', False): return bc
    c = collections.Counter()
    for v in VOLS:
        for w in re.findall(r"[a-zA-Zæœ]{4,}", clean_volume(v)): c[w.lower()] += 1
    bc._lex = c; bc._bell = True
    return bc

def fix(text):
    bc = lexicon_from_clean()
    return bc.fix_ocr(text)
