"""Mechtilde, Liber specialis gratiae (Solesmes 1877, BLB Karlsruhe scan, own tesseract OCR) -> corpus book.
run from the repo root after mechtilde_assemble.py has written /tmp/blb/paras.json"""
import sys, os, re, json, collections
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from gm_common import *
import kempis_fix as K

P = json.load(open('/tmp/blb/paras.json'))
L = K.lexicon()
ROM = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
def roman(s):
    s = s.replace('l', 'I').upper().replace('Y', 'V').replace('J', 'I').replace('U', 'V').replace('1', 'I').replace('T', 'I')
    s = re.sub(r'[^IVXLC]', '', s)
    v = 0
    for i, c in enumerate(s):
        n = ROM[c]
        v += -n if i + 1 < len(s) and ROM[s[i + 1]] > n else n
    return v

def junk(tok):
    return re.fullmatch(r'[|{}~^_\\<>«»‘’"“”*°•.,:;()\[\]-]{1,3}', tok) is not None and tok not in ('.', ',', ':', ';', '«', '»', ')', '(')

AE = lambda w: [w[:i] + 'ae' + w[i + 1:] for i, c in enumerate(w) if c == 'e'] + [w[:i] + 'oe' + w[i + 1:] for i, c in enumerate(w) if c == 'e'] + ([w.replace('cce', 'coe')] if 'cce' in w else [])
def ligature(m):
    w = m.group(0); lw = w.lower(); n = L.get(lw, 0)
    if len(lw) < 3 and lw != 'qu': return w
    cs = [c for c in AE(lw) if L.get(c, 0) >= 50]
    if not cs: return w
    best = max(cs, key=lambda c: L[c])
    if L[best] < 20 * n + 50: return w
    return best[:1].upper() + best[1:] if w[0].isupper() else best

def fix(text):
    text = ' '.join(t for t in text.split(' ') if not junk(t))
    text = re.sub(r'\b(que|Que)\b', lambda m: 'quae' if m.group(0) == 'que' else 'Quae', text)
    text = re.sub(r'[A-Za-z]{3,}', ligature, text)
    text = K.fix_ocr(text)
    text = text.replace(' ,', ',').replace(' .', '.').replace(' ;', ';')
    return re.sub(r'\s+', ' ', text).strip()

def join(lines):
    s = ''
    for ln in lines:
        ln = ln.strip()
        if s.endswith('-') and ln[:1].islower(): s = s[:-1] + ln
        else: s = (s + ' ' + ln) if s else ln
    return s

def upper_ratio(t):
    a = [c for c in t if c.isalpha()]
    return sum(c.isupper() for c in a) / len(a) if a else 0

HEAD = re.compile(r'^\W{0,3}(?:\w{0,3}\s)?\W{0,3}([CG]AP[UO][TY1])\s+(PREVIUM|PRAEVIUM|PRIMUM|[IVXLCYlj1TUvx]+)\b')
PARS = re.compile(r'^PARS\s+(PRIMA|SECUNDA|TERTIA|QUARTA|QUINTA|SEXTA|SEPTIMA)')
PN = {'PRIMA': 1, 'SECUNDA': 2, 'TERTIA': 3, 'QUARTA': 4, 'QUINTA': 5, 'SEXTA': 6, 'SEPTIMA': 7}

def build():
    # locate body start: first PROLOGUS after the editors' preface
    start = next(i for i, p in enumerate(P) if p['text'].strip().startswith('PROLOGUS'))
    items = []   # (kind, part, num, title, lines)
    cur = dict(kind='prologus', part=0, num=0, title='', lines=[])
    items.append(cur)
    part = 1
    last = -1
    i = start + 1
    while i < len(P):
        t = P[i]['text'].strip()
        m = PARS.match(t)
        h = HEAD.match(t) if P[i]['n'] <= 9 else None
        if m and P[i]['n'] <= 6:
            part = PN[m.group(1)]; last = -1; i += 1; continue
        if h:
            k = h.group(2).upper()
            num = 0 if k in ('PREVIUM', 'PRAEVIUM') else 1 if k == 'PRIMUM' else roman(k)
            if k not in ('PREVIUM', 'PRAEVIUM', 'PRIMUM') and not (last < num <= last + 3): num = last + 1
            last = num
            title = []
            j = i + 1
            while j < len(P) and len(title) < 3 and upper_ratio(P[j]['text']) > 0.6 and P[j]['n'] <= 12 and not HEAD.match(P[j]['text']):
                title.append(P[j]['text']); j += 1
            cur = dict(kind='caput', part=part, num=num, title=re.sub(r'-\s+\W?\s*(?=[A-Za-z])', '', ' '.join(title)), lines=[])
            items.append(cur); i = j; continue
        if cur['kind'] == 'prologus' and PARS.match(t): pass
        cur['lines'].append(P[i]); i += 1
    return items

def paras_of(lines):
    ps, buf = [], []
    for x in lines:
        if x['indent'] and buf:
            ps.append(join(buf)); buf = []
        buf.append(x['text'])
    if buf: ps.append(join(buf))
    return ps

if __name__ == '__main__':
    items = build()
    byp = collections.defaultdict(list)
    for it in items: byp[it['part']].append(it)
    for p, its in sorted(byp.items()):
        nums = [i['num'] for i in its]
        miss = [n for n in range(0, max(nums) + 1) if n not in nums and n > 0]
        print('part', p, len(its), 'max', max(nums), 'missing', miss, 'words', sum(len(' '.join(x['text'] for x in i['lines']).split()) for i in its))

    MAUTH = {'la': 'Mechtildis de Hackeborn', 'en-US': 'St. Mechtilde of Hackeborn', 'pt-BR': 'Santa Matilde de Hackeborn'}
    B = REPO + '/content/books/mechtilde-of-hackeborn-opera-omnia/liber-specialis-gratiae'
    import shutil
    shutil.rmtree(B, ignore_errors=True)
    files, toc, cur = [], [], None
    PNAME = {1: 'Pars I', 2: 'Pars II', 3: 'Pars III', 4: 'Pars IV', 5: 'Pars V', 6: 'Pars VI', 7: 'Pars VII'}
    seen = set()
    for it in items:
        ps = [fix(p) for p in paras_of(it['lines'])]
        ps = [p for p in ps if p]
        if it['kind'] == 'prologus':
            cid, t = 'prologus', 'Prologus'
        else:
            cid = f"p{it['part']}-c{it['num']:02d}"
            t0 = fix(it['title'].lower()) if it['title'] else ''
            t0 = t0[:1].upper() + t0[1:]
            lab = 'Caput previum' if it['num'] == 0 else f"Caput {it['num']}"
            t = lab + (': ' + t0.rstrip('.') if t0 else '')
        if cid in seen: cid += 'b'
        seen.add(cid)
        files.append((cid, f'# {t}\n\n' + '\n\n'.join(ps) + '\n'))
        node = {'id': cid, 'title': {'la': t}}
        if it['kind'] == 'prologus': toc.append(node)
        else:
            if cur is None or cur['_p'] != it['part']:
                cur = {'id': f"pars-{it['part']}", 'title': {'la': PNAME[it['part']]}, 'children': [], '_p': it['part']}
                toc.append(cur)
            cur['children'].append(node)
    for n in toc: n.pop('_p', None)
    meta = book_meta('mechtilde-liber-specialis-gratiae', 'mechtilde-of-hackeborn/liber-specialis-gratiae',
        {'la': 'Liber specialis gratiae', 'en-US': 'The Book of Special Grace', 'pt-BR': 'O Livro da Graça Especial'},
        {'la': 'Liber specialis gratiae: revelationes sanctae Mechtildis, virginis Ordinis Sancti Benedicti, in septem partes divisae, a Gertrude et alia sorore conscriptae.',
         'en-US': 'The revelations of St. Mechtilde of Hackeborn, singer of Helfta, in seven parts, written down by Gertrude the Great and another nun.',
         'pt-BR': 'As revelações de Santa Matilde de Hackeborn, a cantora de Helfta, em sete partes, escritas por Gertrudes, a Grande, e por outra religiosa.'},
        'c. 1290-1299', ['la'], {'la': {'editor': 'Solesmes Benedictines (L. Paquelin)', 'year': 1877}},
        [{'language': 'la', 'url': 'https://digital.blb-karlsruhe.de/download/pdf/3327242.pdf',
          'edition': 'Revelationes Gertrudianae ac Mechtildianae, vol. II: Sanctae Mechtildis virginis ordinis Sancti Benedicti Liber specialis gratiae, Poitiers/Paris: H. Oudin, 1877 (Solesmes edition).',
          'description': 'Page scan of the Badische Landesbibliothek Karlsruhe (urn:nbn:de:bsz:31-60070), OCR with Tesseract (eng model) by research/sourcing/_scripts/mechtilde_{page,assemble,build}.py: running heads, marginal notes and the editors\' footnotes are dropped; the ligatures ae/oe lost by the OCR are restored and single-letter slips repaired by lexicon vote. Not proofread.',
          'tier': 'A', 'tierEvidence': 'Public-domain 1877 print.'}],
        toc, author=MAUTH)
    write_book(B, meta, {'la': files})
    os.makedirs(B + '/sources/la-originals', exist_ok=True)
    open(B + '/sources/la-originals/liber-specialis-gratiae-ocr.txt', 'w').write('\n'.join(p['text'] for p in P) + '\n')
    print(words(B + '/la'), len(files))
