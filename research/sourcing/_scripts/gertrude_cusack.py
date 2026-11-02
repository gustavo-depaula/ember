"""M. F. Cusack, The Life and Revelations of St. Gertrude (1870), from the Internet Archive OCR -> corpus book."""
import re, sys, os, shutil
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gm_common import *

SRC = RAW + 'cusack.txt'
L = open(SRC).read().split('\n')
PARTS = [('life', 1750, 4486, 'Part I: The Life of St. Gertrude'),
         ('ii', 4486, 6804, 'Part II: The Revelations, Book II (written by herself)'),
         ('iii', 6804, 13089, 'Part III: The Revelations, Book III'),
         ('iv', 13089, 20607, 'Part IV: The Revelations, Book IV'),
         ('v', 20607, 23861, 'Part V: The Revelations, Book V')]
HEADRE = re.compile(r'^\s*CHAPTE[RB]\s+[IVXLCTYlJ1]+[.,]?\s*$')
RUN = re.compile(r'^(?:\d{1,3}\s+)?[A-Z][A-Z \'’,.\-—]{5,70}(?:\s+\d{1,3})?\.?$')

def is_run(t):
    return bool(re.fullmatch(r'\d{1,3}|[ivxlc]{1,5}', t.lower())) or (len(t) < 75 and bool(RUN.match(t)) and not HEADRE.match(t))

def paragraphs(lines):
    out = []
    for blk in blocks(lines):
        blk = [b for b in blk if not is_run(b.strip())]
        if not blk: continue
        t = join_lines(blk)
        if re.match(r'^[*†‡]\s', t): continue          # page-foot notes
        out.append(t)
    m = []
    for p in out:
        if m and not re.search(r'[.!?:;»"”’)\]—]\s*$', m[-1]) and p[:1].islower():
            m[-1] += ' ' + p
        else: m.append(p)
    return m

def tidy(p):
    p = re.sub(r'(?<=[a-z.,;:!?])\*+', '', p)
    return p

ROM = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
def rom(s):
    s = re.sub(r'[^IVXLC]', '', s.replace('l', 'I').upper().replace('Y', 'V').replace('T', 'I').replace('J', 'I').replace('B', ''))
    v = 0
    for i, c in enumerate(s):
        n = ROM[c]
        v += -n if i + 1 < len(s) and ROM[s[i + 1]] > n else n
    return v

def build():
    res = []
    for pid, a, b, ptitle in PARTS:
        idx = [i for i in range(a, b) if HEADRE.match(L[i])]
        chs = []
        last = 0
        for k, i in enumerate(idx):
            j = idx[k + 1] if k + 1 < len(idx) else b
            seg = L[i + 1:j]
            bl = blocks(seg)
            title = ''
            body_start = 0
            if bl:
                t0 = join_lines(bl[0])
                if len(t0) < 260 and not is_run(t0):
                    title = t0; body_start = 1
            rest = []
            for blk in bl[body_start:]:
                rest += blk + ['']
            ps = [tidy(p) for p in paragraphs(rest)]
            if ps:
                f = ps[0].split(' ', 1)
                if f[0].isupper() and len(f[0]) > 2 and len(f) > 1: ps[0] = f[0].capitalize() + ' ' + f[1]
            m = re.search(r'CHAPTE[RB]\s+(\S+)', L[i])
            v = rom(m.group(1)) if m else 0
            num = v if last < v <= last + 3 else last + 1
            last = num
            chs.append((title, ps, num))
        res.append((pid, ptitle, chs))
    return res

if __name__ == '__main__':
    R = build()
    files, toc = [], []
    for pid, ptitle, chs in R:
        node = {'id': pid, 'title': {'en-US': ptitle}, 'children': []}
        print(pid, len(chs), sum(len(' '.join(p).split()) for _, p, _ in chs), 'missing', sorted(set(range(1, chs[-1][2] + 1)) - {c[2] for c in chs}))
        for title, ps, n in chs:
            title = re.sub(r'\s+', ' ', title).strip()
            cid = f'{pid}-c{n:02d}'
            t = f'Chapter {n}' + (f': {title.rstrip(".")}' if title else '')
            files.append((cid, f'# {t}\n\n' + '\n\n'.join(ps) + '\n'))
            node['children'].append({'id': cid, 'title': {'en-US': t}})
        toc.append(node)
    B = REPO + '/content/books/gertrude-opera-omnia/legatus-cusack'
    shutil.rmtree(B, ignore_errors=True)
    meta = book_meta('gertrude-legatus-cusack', 'gertrude/legatus-divinae-pietatis',
        {'en-US': 'The Life and Revelations of St. Gertrude', 'pt-BR': 'Vida e Revelações de Santa Gertrudes'},
        {'en-US': 'Cusack\'s 1870 English version of the Legatus divinae pietatis: a life of Gertrude drawing on Book I and the Latin lives, then Books II-V in her own and her sisters\' words. Rearranged and abridged, so it is a separate book from the Latin.',
         'pt-BR': 'A versão inglesa de Cusack (1870) do Legatus divinae pietatis: uma vida de Gertrudes baseada no Livro I e nas biografias latinas, e em seguida os Livros II a V. Reorganizada e resumida, por isso é um livro à parte do latim.'},
        'c. 1289-1302', ['en-US'], {'en-US': {'translator': 'M. F. Cusack (a Poor Clare)', 'year': 1870}},
        [{'language': 'en-US', 'url': 'https://archive.org/details/thelifeandrevela00gertuoft',
          'edition': 'The Life and Revelations of Saint Gertrude, Virgin and Abbess, of the Order of St. Benedict, London: Burns & Oates, 1870 (translated from the Latin of Canteleu, 1662).',
          'description': 'Internet Archive OCR. Contents pages, running heads, page-foot notes and the appended prayer manual and index are dropped; chapters are numbered by order within each part (research/sourcing/_scripts/gertrude_cusack.py). Book I is not translated: its substance is in Part I.',
          'tier': 'A', 'tierEvidence': 'English translation published 1865/1870.'}],
        toc)
    write_book(B, meta, {'en-US': files})
    os.makedirs(B + '/sources/en-US-originals', exist_ok=True)
    shutil.copy(SRC, B + '/sources/en-US-originals/cusack-life-and-revelations-1870.txt')
    print(words(B + '/en-US'), len(files))
