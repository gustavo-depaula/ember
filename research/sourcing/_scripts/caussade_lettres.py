import re, sys, os, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import ocr_clean as oc
R = '/Users/gustavo/Documents/prayer/research/sourcing/caussade/'
B = '/Users/gustavo/Documents/prayer/content/books/caussade-opera-omnia/lettres-spirituelles/'
RN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX','XXXI','XXXII','XXXIII','XXXIV','XXXV','XXXVI','XXXVII']
COUNTS = [11,37,16,21,19,26,18]
BOOKS_FR = ['Estime et amour de l’abandon','Exercice de la vertu d’abandon','Obstacles à l’abandon','Premières épreuves des âmes appelées à l’état d’abandon : sécheresses, impuissances, dégoûts','Nouvelles épreuves : souffrances, afflictions, privations','Suites des épreuves : crainte, incertitude, abandon apparent','Dernières épreuves : agonie et mort mystique']
BOOKS_EN = ['On the Esteem for and Love of this Virtue','On the Exercise of the Virtue of Abandonment','On the Obstacles to Abandonment','First Trials of Souls called to the State of Abandonment: Dryness, Powerlessness, Disgust','New Trials: Sufferings, Afflictions, Privations','Continuation of the Trials: Fear, Uncertainty, Apparent Abandonment','Last Trials: Agony and Mystic Death']
ORD = ['premier','deuxième','troisième','quatrième','cinquième','sixième','septième']
ORDEN = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh']

def load(f): return open(R+f, errors='replace').read().split('\n')

# ---------- French
t1 = load('labandonlaprovid0001caus.txt'); t2 = load('labandonlaprovid0000caus.txt')
end1 = next(i for i in range(14000, len(t1)) if t1[i].startswith('TABLE DES MATI'))
segs = [(t1, 7300, end1), (t2, 195, 10935)]
heads_re = re.compile(r'^LETTRE\b')
raw = []  # (book, lines)
for lines, a, b in segs:
    idx = [i for i in range(a, b) if heads_re.match(lines[i].strip())]
    # book starts
    for k, i in enumerate(idx):
        j = idx[k+1] if k+1 < len(idx) else b
        # stop at next LIVRE heading
        for m in range(i+1, j):
            if re.match(r'^LIVRE\b', lines[m].strip()):
                j = m; break
        raw.append(lines[i+1:j])
assert len(raw) == sum(COUNTS), len(raw)

EXTRA = [re.compile(r'(ABANDON|ÉPREUVES|MYSTIQUE|OBSTACLES|AGONIE|EXERCICE|SOUFFRANCES|SÉCHERESSE|CRAINTE|APPENDICE|ESTIME|LETTRES|PRIVATIONS|AFFLICTIONS)'), ]
def headfn(t):
    return len(t) < 50 and not re.search(r'[a-z]{4,}', t.replace('Ab','')) and any(r.search(t) for r in EXTRA)
FIXES = [(r'\bSœur\b','Sœur'),(r'\bét re\b','être'),(r'\bm\'', 'm’'),(r'\bœ','œ')]
def fixfr(s):
    s = oc.fix_fr(s)
    s = s.replace("'", '’')
    s = re.sub(r'\bà me\b', 'âme', s)
    s = re.sub(r'\bn0s\b', 'nos', s)
    s = re.sub(r'(\w)\s*\(\s*(\d)\s*\)', r'\1(\2)', s) if False else s
    return s
SAL = re.compile(r'^(Ma|Mon|Mes|Madame|Monsieur|Mademoiselle|Mà|machère|Très)\b|\b(chère|Sœur,|Mère,|Mère Sœur|fille,)')
def header(blocks):
    h = []
    while blocks and len(h) < 4 and len(blocks[0]) < 170 and not SAL.search(blocks[0]):
        h.append(blocks.pop(0))
    return h, blocks
def clean_lines(ls):
    out = []
    for l in ls:
        s = l.strip()
        if re.fullmatch(r'\d{1,3}\.?', s): continue
        out.append(l)
    return out
def split_header(ls):
    """take leading blocks (addressee/summary/date) off the raw lines; return header blocks and remaining lines"""
    blocks, cur = [], []
    for l in ls:
        if l.strip(): cur.append(l)
        else:
            if cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    k, h = 0, []
    while k < len(blocks) and len(h) < 4:
        t = oc.join_lines(blocks[k])
        if re.fullmatch(r'[\d\s.]{1,5}', t) or re.fullmatch(r'[_—\-–\s]{1,8}', t): k += 1; continue
        if len(t) <= 2 or (re.search(r'\d', t) and t.isupper() and not re.match(r'^(À|A|AU|AUX)\b', t)): k += 1; continue
        if len(t) >= 170 or (SAL.search(t) and not re.match(r'^(À|A|AU|AUX)\s+[A-ZÀ-Ý]', t)): break
        h.append(t); k += 1
    rest = []
    for b in blocks[k:]:
        rest += b + ['']
    return h, rest
fr = []
bi, n = 0, 0
for k, ls in enumerate(raw):
    while n >= COUNTS[bi]: bi += 1; n = 0
    n += 1
    h, rest = split_header(clean_lines(ls))
    paras, notes = oc.clean(rest, [re.compile(r'^[^a-z]{6,}$'), headfn], 'num')
    fr.append(dict(book=bi, n=n, h=h, paras=paras, notes=notes))

ADDR = re.compile(r"^((?:À|A|AU|AUX)\s+(?:[A-ZÀ-ÝŒ\-’'.,]+(?:\s+|$))+(?:\([^)]*\))?)\s*(.*)$")
def addr_summary(h):
    addr = [x for x in h if re.match(r'^(A|À|AU|AUX|A\s+LA)\b', x) and (x.isupper() or re.match(r'^[AÀ] [A-ZÉ]', x)) and len(x) < 120]
    a = addr[0] if addr else ''
    rest = [x for x in h if x is not a]
    return a, rest

def sc(s):  # small caps sentence case for addressee
    s = s.strip().rstrip('.')
    low = s.lower()
    words = []
    for w in low.split(' '):
        if w in ('de','du','des','la','le','aux','au','à','a','et','en','une','un','postulante','personne','séculière','qui','fut','depuis','religieuse','annonciade','dame','supérieure','novice'): words.append(w)
        else: words.append('-'.join(p[:1].upper()+p[1:] for p in w.split('-')) if w not in ('même','sœur','mère') else w)
    r = ' '.join(words)
    r = re.sub(r'^A ', 'À ', r)
    r = r.replace('La Même','la même').replace('La Sœur','la Sœur').replace('La Mère','la Mère').replace('À la Même','À la même')
    r = re.sub(r'^(À) La\b', r'\1 la', r)
    return r[:1].upper()+r[1:]

if __name__ == '__main__' and 'dump' in sys.argv:
    for L in fr:
        print(L['book']+1, L['n'], '|', ' || '.join(L['h']), '|', (L['paras'][0][:60] if L['paras'] else None), len(L['paras']), len(L['notes']))

# ---------- header normalisation (French)
def fix_addr(t):
    t = t.replace('MÉÈMÉ','MÊME').replace('MÉÈME','MÊME').replace('MÈME','MÊME').replace('MÉRE','MÈRE').replace('D€','DE').replace('MÊME','MÊME')
    return t
DATE = re.compile(r'^[A-ZÉ][\wé\-]+(?:\s[\wé]+)?,?\s*(?:\d{1,2}\s+[a-zéû]+\s+)?[\d]{3,4}\.?$')
def fr_head(h):
    addr = summ = date = ''
    lines = []
    for t in h:
        t = fix_addr(re.sub(r'\s+', ' ', t)).strip()
        m = ADDR.match(t)
        if m and not addr:
            addr = re.sub(r'\s*\(\d\)$', '', sc(m.group(1))); t = m.group(2).strip()
            if not t: continue
        if DATE.match(t) and len(t) < 40:
            date = t.rstrip('.'); continue
        t = t.rstrip(',')
        summ = (summ + ' ' + t).strip() if summ else t
    return addr, summ, date
def sentence(s):
    s = s.strip().rstrip('.,')
    return s[:1].upper() + s[1:]

# ---------- English
en_lines = load('ccel-abandonment.txt')
ENH = re.compile(r'^\s{2}Letter ([IVXLC]+)\.--(.*)$')
eidx = [i for i in range(4820, 16800) if ENH.match(en_lines[i])]
assert len(eidx) == sum(COUNTS), len(eidx)
en_end = next(i for i in range(16700, 16900) if 'Amen! Amen!' in en_lines[i]) + 1
en = []
bi, n = 0, 0
for k, i in enumerate(eidx):
    while n >= COUNTS[bi]: bi += 1; n = 0
    n += 1
    j = eidx[k+1] if k+1 < len(eidx) else en_end
    seg = en_lines[i+1:j]
    # stop at book titles
    for m, l in enumerate(seg):
        if re.match(r'^(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH) BOOK', l.strip()):
            seg = seg[:m]; break
    title = ENH.match(en_lines[i]).group(2).strip().rstrip('.')
    # header = up to first ____ line
    sep = next((m for m, l in enumerate(seg[:14]) if l.strip().startswith('____')), -1)
    hdr = [re.sub(r'\s+', ' ', ' '.join(p)).strip() for p in [[]]]
    hp, cur = [], []
    for l in (seg[:sep] if sep >= 0 else []):
        if l.strip(): cur.append(l.strip())
        elif cur: hp.append(' '.join(cur)); cur = []
    if cur: hp.append(' '.join(cur))
    body = seg[sep+1:] if sep >= 0 else seg
    # drop trailing separators / empty
    paras, defs, cur = [], {}, []
    def flush():
        global cur
        if cur:
            t = re.sub(r'\s+', ' ', ' '.join(cur)).strip()
            m = re.match(r'^\[(\d+)\]\s+(.*)$', t)
            if m: defs[m.group(1)] = m.group(2)
            elif t and not t.startswith('____'): paras.append(t)
        cur = []
    for l in body:
        if l.strip(): cur.append(l.strip())
        else: flush()
    flush()
    # renumber footnote markers
    order = []
    def rep(m):
        key = m.group(1)
        if key not in defs: return m.group(0)
        if key not in order: order.append(key)
        return f'[^{order.index(key)+1}]'
    paras = [re.sub(r'\[(\d+)\]', rep, p) for p in paras]
    notes = {order.index(k)+1: defs[k] for k in order}
    en.append(dict(book=bi, n=n, title=title, h=hp, paras=paras, notes=notes))

def en_date(L):
    t = ' '.join(L['h'])
    m = re.search(r'--([^.]*?(?:\d{4})[^.]*)\.?$', t) or re.search(r'((?:[A-Z][a-z]+, )?(?:\d{1,2} \w+ )?17\d\d)\.?$', t)
    return m.group(1) if m else ''

# ---------- text fixes (French), grown from a vocabulary pass
import glob, collections
FRFIX = {}
if os.path.exists(R + 'lettres_frfix.json'):
    FRFIX = json.load(open(R + 'lettres_frfix.json'))
def frtext(s):
    s = fixfr(s)
    s = re.sub(r'\s*_{4,}\s*', ' ', s).replace('_', '')
    s = re.sub(r'^\*\s+', '', s)
    s = re.sub(r'\b([ld])(?=[A-ZÉ][a-zéèêàâîôûç]{3,})', r'\1’', s)
    s = s.replace('Pautre', 'l’autre').replace('(1re lettre.)', '(1re lettre.)')
    for a, b in FRFIX.items():
        s = re.sub(r'(?<![\wÀ-ÿ])' + re.escape(a) + r'(?![\wÀ-ÿ])', b, s)
    return s
def entext(s):
    s = re.sub(r'\s*_{4,}\s*', ' ', s).strip()
    s = s.replace(' -- ', ' — ').replace('--', '—')
    return s.replace("'", '’').replace('“', '“')

# ---------- write
def title_fr(L):
    a, summ, date = fr_head(L['h'])
    s = sentence(frtext(summ)) if summ else ''
    return f"Lettre {RN[L['n']-1]}" + (f". {s}" if s else ''), a, s, date
def render(h1, italics, paras, notes):
    t = [f'# {h1}', '']
    for i in italics:
        t += [f'*{i}*', '']
    for p in paras:
        t += [p, '']
    for k in sorted(notes):
        t += [f'[^{k}]: {notes[k]}', '']
    return '\n'.join(t).rstrip() + '\n'
def build():
    os.makedirs(B + 'fr-FR', exist_ok=True); os.makedirs(B + 'en-US', exist_ok=True)
    toc = []
    words = {'fr-FR': 0, 'en-US': 0}
    groups = {}
    for L, E in zip(fr, en):
        assert (L['book'], L['n']) == (E['book'], E['n'])
        cid = f"l{L['book']+1}-{L['n']:02d}"
        h1, a, s, date = title_fr(L)
        ds = date
        if not re.search(r'17[1-4]\d', ds or ''):
            d2 = en_date(E)
            ds = d2 if d2 else ds
        ital_mark = False
        ital = []
        la = (re.sub(r'^A ', 'À ', a) + (f', {ds}' if ds else '')) if a else (ds or '')
        if la: ital.append(la)
        if s and False: ital.append(s)
        pf = [frtext(p) for p in L['paras']]
        if pf: pf[0] = re.sub(r'^[A-ZÉ][\wé]+(?:\s[\wé]+)?,\s*(?:\d{1,2}\s+[a-zéû]+\s+)?1?\d{3,4}\.?\s+(?=\S)', '', pf[0])
        pf = [p for p in pf if p.strip() and not re.fullmatch(r'[\[\(\{]\s*\d?\s*[\]\)\}]?', p.strip())]
        pf = [re.sub(r'^[\(\[][\dJ]?\s+(?=[a-zà-ÿ])', '', p) for p in pf]
        nf0 = {k: frtext(v) for k, v in L['notes'].items()}
        for i, p in enumerate(pf):
            m = re.match(r'^\{1\}\s+(.*)$', p)
            if m:
                nf0[len(nf0)+1] = m.group(1); pf.pop(i); ital_mark = True; break
        pf = [re.sub(r'\((\d)\)', lambda m: f'[^{m.group(1)}]' if int(m.group(1)) in nf0 else m.group(0), p) for p in pf]
        nf = nf0
        if ital_mark and ital: ital[0] += '[^1]'
        open(B + f'fr-FR/{cid}.md', 'w').write(render(h1, ital, pf, nf))
        words['fr-FR'] += sum(len(p.split()) for p in pf)
        eh1 = f"Letter {RN[E['n']-1]}. {entext(E['title'])}"
        eit = [entext(x) for x in E['h']]
        eit = [x for x in eit]
        pe = [entext(p) for p in E['paras']]
        ne = {k: entext(v) for k, v in E['notes'].items()}
        open(B + f'en-US/{cid}.md', 'w').write(render(eh1, eit, pe, ne))
        words['en-US'] += sum(len(p.split()) for p in pe)
        groups.setdefault(L['book'], []).append({'id': cid, 'title': {'fr-FR': h1, 'en-US': eh1}})
    for b in range(7):
        toc.append({'id': f'livre-{b+1}', 'title': {'fr-FR': f'Livre {ORD[b]}. {BOOKS_FR[b]}', 'en-US': f'{ORDEN[b]} Book. {BOOKS_EN[b]}'}, 'children': groups[b]})
    return toc, words

if __name__ == '__main__' and 'write' in sys.argv:
    toc, words = build()
    json.dump(toc, open(R + 'lettres_toc.json', 'w'), ensure_ascii=False)
    print(words)
