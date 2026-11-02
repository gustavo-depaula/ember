"""Anselm's letters, Libri III-IV (Migne PL 159), from a Latin tesseract OCR of the Documenta Catholica Omnia page scan.
usage: python3 -I anselm_letters34.py   (from repo root); OCR text in research/sourcing/anselm/ocr159/pNNN.txt"""
import re, json, sys, glob, collections
from pathlib import Path
sys.path.insert(0, 'research/sourcing/_scripts')
from letters_build import rnum, roman, nice

OCR = Path('research/sourcing/anselm/ocr159')
ROOT = Path('content/books/anselm-opera-omnia/epistolae')
ABBR = {'Z': 'Z'}

def vocab():
    c = collections.Counter()
    for f in glob.glob('content/books/anselm-opera-omnia/*/la/*.md') + glob.glob('content/books/bernard-opera-omnia/*/la/*.md'):
        c.update(re.findall(r'[A-Za-z]+', Path(f).read_text(encoding='utf-8').lower()))
    return c
V = vocab()

DEL = collections.defaultdict(list)
for _w, _c in V.items():
    if _c >= 3 and len(_w) >= 4:
        for _i in range(len(_w)): DEL[_w[:_i] + _w[_i + 1:]].append(_w)
        DEL[_w].append(_w)

def near(lw):
    c = collections.Counter()
    for cand in DEL.get(lw, []): c[cand] += V[cand]            # lw is a deletion of cand (one char dropped)
    for i in range(len(lw)):
        for cand in DEL.get(lw[:i] + lw[i + 1:], []):          # substitution or transposition-like
            if len(cand) == len(lw): c[cand] += V[cand]
    for i in range(len(lw) - 1):
        sw = lw[:i] + lw[i + 1] + lw[i] + lw[i + 2:]
        if sw in V: c[sw] += V[sw] * 2
    for cand in list(DEL.get(lw, [])) : pass
    if not c: return None
    (b, n), = c.most_common(1)
    return b if n >= 15 else None

def fixword(w):
    lw = w.lower()
    if lw in V or len(w) < 3: return w
    cands = []
    for a, b in (('z', 'ae'), ('zz', 'ae'), ('x', 'ae'), ('ii', 'u'), ('li', 'h'), ('1', 'l'), ('0', 'o'), ('cl', 'd'), ('rn', 'm'), ('ni', 'm'), ('q', 'qu')):
        if a in lw:
            for i in [m.start() for m in re.finditer(re.escape(a), lw)][:1]:
                cands.append(lw[:i] + b + lw[i + len(a):])
    cands += [lw.replace('z', 'ae')]
    best = max((x for x in cands if x in V), key=lambda x: V[x], default=None)
    if not best and w.islower() and len(w) >= 5: best = near(lw)
    if not best: return w
    return best.capitalize() if w[0].isupper() else best

HDR = re.compile(r'ANSELMI CANTUAR|ARCH[IL]*EP\. OPP|PARS III|^LIBER (TERTIUS|QUARTUS)\.? *$|NOTAE\.?\s*$|^\W*\d{1,3}\W*$')

def pages():
    out = []
    for f in sorted(glob.glob(str(OCR / 'p*.txt'))):
        out.append(Path(f).read_text(encoding='utf-8'))
    return '\n'.join(out)

def main():
    txt = pages()
    lines = []
    book = 3
    for ln in txt.split('\n'):
        s = ln.strip()
        if re.match(r'^LIBER QUARTUS', s) : book = 4; lines.append(('BOOK', 4)); continue
        if re.match(r'^LIBER TERTIUS', s): continue
        if HDR.search(s) and len(s) < 100: continue
        lines.append(s)
    letters = []; cur = None
    i = 0; book = 3
    L = lines
    while i < len(L):
        s = L[i]
        if isinstance(s, tuple): book = 4; i += 1; continue
        m = re.match(r'^EPISTOLA\s+([A-Za-z0-9]{1,9})\b(?:[^A-Za-z]*|\s+[A-Z][A-Z .,]{0,4})$', s)
        if m:
            cur = {'book': book, 'num': m.group(1), 'lines': []}; letters.append(cur); i += 1; continue
        if cur is not None: cur['lines'].append(s)
        i += 1
    # sequential numbering within books
    seq = {3: 0, 4: 0}; out = []
    for l in letters:
        seq[l['book']] += 1; l['n'] = seq[l['book']]
    for l in letters:
        ls = l['lines']
        k = 0
        while k < len(ls) and not ls[k].strip(): k += 1
        who = ls[k].strip() if k < len(ls) else ''
        who = re.sub(r'^[A-Za-z0-9]*SELMI\s+(?:4D|AD|ad)\s+', 'AD ', who) if re.match(r'^[A-Za-z0-9]{0,2}[NK]SELMI|^ANSELMI', who) else who
        who = re.sub(r'^AD\s+', 'Ad ', who.rstrip('. '), flags=re.I) if who.upper().startswith('AD ') else who
        l['who'] = nice(who) if who.upper() == who or who.startswith('Ad') else who
        text = '\n'.join(ls[k + 1:])
        text = re.sub(r'-\n(?=\S)', '', text)
        paras = [re.sub(r'\s+', ' ', p).strip() for p in re.split(r'\n\s*\n', text)]
        paras = [p for p in paras if len(p) > 2]
        paras = [re.sub(r'[A-Za-z0-9]+', lambda m: fixword(m.group(0)), p) for p in paras]
        l['paras'] = paras
    return letters

def write_book():
    import shutil
    L = main(); d = Path('content/books/anselm-opera-omnia/epistolae-iii-iv')
    if d.exists(): shutil.rmtree(d)
    toc = []; grp = None
    for l in L:
        gid = 'liber-%d' % l['book']
        if grp is None or grp['id'] != gid:
            grp = {'id': gid, 'title': {'la': ['', '', '', 'Liber III. Epistolae Anselmi archiepiscopi Cantuariensis', 'Liber IV. Epistolae Anselmi archiepiscopi Cantuariensis'][l['book']]}, 'children': []}; toc.append(grp)
        cid = 'l%d-e%03d' % (l['book'], l['n'])
        t = 'Epistola %s' % roman(l['n']) + ('. ' + re.sub(r'[^\w ,.\'-]', '', l['who']).strip(' .,') if l['who'] else '')
        ps = list(l['paras'])
        if len(ps) > 1 and len(ps[0]) < 350: ps[0] = '*%s*' % ps[0].strip('*')
        (d / 'la').mkdir(parents=True, exist_ok=True)
        (d / 'la' / (cid + '.md')).write_text('# %s\n\n%s\n' % (t, '\n\n'.join(ps)), encoding='utf-8')
        grp['children'].append({'id': cid, 'title': {'la': t}})
    meta = {'id': 'anselm-epistolae-iii-iv', 'cover': 'classic',
      'name': {'la': 'Epistolae (libri III-IV)', 'en-US': 'Letters (Books III-IV)', 'pt-BR': 'Cartas (livros III-IV)'},
      'author': {'la': 'Anselmus Cantuariensis', 'en-US': 'St. Anselm of Canterbury', 'pt-BR': 'Santo Anselmo de Cantuária'},
      'description': {'la': 'Epistolae Anselmi archiepiscopi Cantuariensis, libri tertius et quartus, ex Patrologia Latina 159 (1853), secundum Gerberonem. Textus ex imagine paginarum per OCR prima vice descriptus, mendis plenus.',
                      'en-US': 'The letters of Anselm as archbishop of Canterbury, Books III and IV of the Gerberon–Migne order (Patrologia Latina 159, 1853), the letters to and from kings, popes and bishops in the investiture dispute. Latin only, from a fresh OCR of the page scan: no clean transcription exists, so the text still carries many recognition errors, running heads and fragments of the printed apparatus. It is a draft to be corrected against the Migne scan; the first two books are the separate book Letters (Books I-II).',
                      'pt-BR': 'As cartas de Anselmo como arcebispo de Cantuária, livros III e IV da ordem de Gerberon e Migne (PL 159): cartas a reis, papas e bispos na questão das investiduras. Texto em rascunho, obtido por OCR de uma digitalização, ainda com muitos erros de reconhecimento.'},
      'composed': '1093-1109', 'languages': ['la'], 'work': 'anselm/epistolae',
      'editions': {'la': {'editor': 'J.-P. Migne (Patrologia Latina 159)', 'year': 1853}},
      'sources': [{'language': 'la', 'url': 'https://www.documentacatholicaomnia.eu/02m/1033-1109,_Anselmus_Cantuariensis,_Epistolarum_Libri_Quatuor,_MLT.pdf',
        'edition': 'S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 159 (Paris 1853), Epistolae, libri III-IV; page scan from Documenta Catholica Omnia, re-read with Tesseract 5 (Latin model, tessdata_best) at 200 dpi.',
        'description': 'Letters numbered in sequence within each book (the printed numerals are not always legible); addressee lines, running heads and the printed apparatus are only partly removed, and common recognition slips (ae read as z, and so on) are corrected against the vocabulary of the other imported Latin. Expect errors.',
        'tier': 'A', 'tierEvidence': 'Anselm died in 1109; Migne’s 1853 printing is public domain everywhere.'}],
      'toc': toc}
    (d / 'book.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(len(L), sum(len(' '.join(l['paras']).split()) for l in L))

if __name__ == '__main__':
    write_book()
