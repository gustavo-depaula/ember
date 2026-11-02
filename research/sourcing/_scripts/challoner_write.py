"""Stage 2: date the heads, repair OCR against a second witness (1859 ed.), write chapters.
usage: challoner_write.py <parsed.pkl> <witness.txt> <bookdir>"""
import pickle, re, sys, json, difflib
from pathlib import Path
from collections import Counter, defaultdict
O = pickle.load(open(sys.argv[1], 'rb'))
B = ' '.join(open(f, encoding='utf8').read() for f in sys.argv[2].split(','))
book = Path(sys.argv[3]); (book/'en-US').mkdir(parents=True, exist_ok=True)
W = set(w.strip().lower() for w in open('/usr/share/dict/words')) | set(w.strip().lower() for w in open('/usr/share/dict/web2a'))
tok = lambda t: re.findall(r"[A-Za-z]+", t)
btoks = [w.lower() for w in tok(B)]
bc = Counter(btoks)
ac = Counter(w.lower() for h, p in O for t in p + [h['title']] for w in tok(t))
def known(w, strict=False):
    if w in W or (not strict and bc[w] >= 3 and ac[w] >= 1): return True
    for suf in ('s','es','ed','d','ing','ly','est','er','ers','ness','ings','ies','ful','less','ment','ments','th','eth','st'):
        if w.endswith(suf):
            b = w[:-len(suf)]
            if b in W or b+'e' in W or (suf == 'ies' and b+'y' in W) or (len(b) > 2 and b[-1] == b[-2] and b[:-1] in W): return True
    return False
bknown = lambda w: w in W or bc[w] >= 3
ctx4 = defaultdict(Counter); ctx2 = defaultdict(Counter)
for i in range(2, len(btoks)-2):
    ctx4[(btoks[i-2], btoks[i-1], btoks[i+1], btoks[i+2])][btoks[i]] += 1
    ctx2[(btoks[i-1], btoks[i+1])][btoks[i]] += 1
fixes = Counter()
def repair(text):
    ws = list(re.finditer(r"[A-Za-z]+", text)); lw = [m.group().lower() for m in ws]
    res = []; last = 0
    for i, m in enumerate(ws):
        w = lw[i]
        if known(w) or len(w) < 2: continue
        g = lambda k: lw[k] if 0 <= k < len(lw) else ''
        cand = None
        for key, tab in (((g(i-2), g(i-1), g(i+1), g(i+2)), ctx4), (((g(i-1), g(i+1))), ctx2)):
            c = tab.get(key)
            if c:
                best, n = c.most_common(1)[0]
                if best != w and bknown(best) and len(w) > 3 and not best.startswith(w) and not w.startswith(best) and difflib.SequenceMatcher(None, w, best).ratio() >= .6:
                    cand = best; break
        if cand:
            s = m.group()
            cand = cand.upper() if s.isupper() and len(s) > 1 else cand.capitalize() if s[0].isupper() else cand
            res.append((m.start(), m.end(), cand)); fixes[(w, cand.lower())] += 1
    out = []; last = 0
    for a, b, c in res: out += [text[last:a], c]; last = b
    return ''.join(out) + text[last:]
def lead(p, idx=9):
    m = re.match(r"^(\W*\S+?)(\W*)\s+(\S+?)(\W*)\s+", p+' ')
    if not m: return p
    sm = lambda a, b: difflib.SequenceMatcher(None, re.sub(r'\W', '', a).lower(), b).ratio()
    w1 = re.sub(r'^\W+', '', m.group(1))
    r1 = {k: sm(w1, k.lower()) for k in ('Consider', 'Conclude')}
    k1 = max(r1, key=r1.get)
    if r1[k1] < .55: return p
    if k1 == 'Conclude': return k1 + p[m.end(1):]
    r2 = {k: sm(m.group(3), k) for k in ('first', 'secondly', 'thirdly')}
    k2 = max(r2, key=r2.get)
    if r2[k2] < .5:
        if idx < 3: return f"Consider, {('first','secondly','thirdly')[idx]}, " + p[m.end(2):].lstrip()
        return p
    return f"Consider, {k2}," + p[m.end(4):] if m.group(4).startswith(',') or True else p
def tidy(s):
    s = re.sub(r'\b\w?D\w?gitized\s+by\s+\S+\s*', '', s)
    s = re.sub(r'[\^*]', '', s); s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\s+([,.;:?!])', r'\1', s)
    return s
MONN = ['January','February','March','April','May','June','July','August','September','October','November','December']
DIM = [31,29,31,30,31,30,31,31,30,31,30,31]
VOC = [w for w, n in ac.items() if n >= 8 and len(w) > 2 and w in W]
ROMAN = re.compile(r"^[ivxlc]+$")
def fixtitle(t):
    def f(m):
        w = m.group(); l = w.lower()
        if known(l, True) or ROMAN.match(l) or len(l) < 2 or l in ('st', 'matt', 'eccles', 'cf'): return w
        c = difflib.get_close_matches(l, VOC, 1, .7)
        if not c: return w
        c = c[0]; return c.upper() if w.isupper() else c.capitalize() if w[0].isupper() else c
    return re.sub(r"[A-Za-z]+", f, t)
BT = {}
def btitles():
    LB = B.split('\n'); seen = 0
    for i, l in enumerate(LB):
        m = re.match(r"^\s*(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\W*\s*(\d+)\W*$", l)
        if not m: continue
        j = i+1; tt = []
        while j < len(LB) and len(tt) < 3:
            if LB[j].strip() and 'itized' not in LB[j]:
                tt.append(LB[j].strip())
                if re.search(r"[.,;:?!)]\W*$", tt[-1]): break
            j += 1
        BT.setdefault((MONN.index(m.group(1).capitalize()), int(m.group(2))), []).append(' '.join(tt))
def nbad(t): return sum(1 for w in re.findall(r"[A-Za-z]+", t) if not known(w.lower(), True) and not ROMAN.match(w.lower()) and w.lower() not in ('st', 'matt', 'eccles', 'cf', 'luke', 'ps', 'rom', 'cor', 'heb', 'tit'))
def sentence(t):  # uppercase titles -> title case
    if sum(c.isupper() for c in t) > .7*sum(c.isalpha() for c in t):
        t = t.title()
        t = re.sub(r"\b(Of|The|On|In|And|For|After|To|At)\b", lambda m: m.group().lower(), t)
        t = t[0].upper()+t[1:]
    return t
def small(t):
    t = t.title() if t.isupper() else t
    t = re.sub(r"\b(Of|The|On|In|And|For|After|To|At|Within)\b", lambda m: m.group().lower(), t)
    return t[0].upper()+t[1:]
def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
# date assignment
def monidx(lab):
    w = re.sub(r'[^A-Z]', '', lab.upper().replace('1','L').replace('|','I')); w = w.replace('UART','UARY')
    for i, f in enumerate(MONN):
        if w.startswith(f.upper()[:3]) and w[:3] == f.upper()[:3] and re.match(r"^[A-Z]*$", w) and len(w) >= 3 and (w == f.upper() or w[:3] == f.upper()[:3] and len(w) > 3 and difflib.SequenceMatcher(None, w, f.upper()).ratio() > .7): return i
    return None
heads = [h for h, p in O]
dated = {}  # index -> (m,d)
seq = [(0,1)]
def run(start_idx, m, d, count):
    for k in range(count):
        dated[start_idx+k] = (m, d); d += 1
        if d > DIM[m] or (m == 1 and d > 19 and start_idx == 0): m, d = m+1, 1
run(0, 0, 1, 50)  # Jan 1 - Feb 19
fixed_zone = {}
for i, h in enumerate(heads):
    if 50 <= i < 53:
        mi = monidx(re.sub(r'[\d.\s]+$', '', h['label'])); d = int(re.search(r'\d+', h['label']).group()); dated[i] = (mi, d)
    elif 53 <= i < 175:
        mi = monidx(re.sub(r'[\d.\s]+$', '', h['label']))
        if mi is not None: dated[i] = (mi, int(re.search(r'\d+', h['label']).group()))
J14 = next(i for i in range(53, len(heads)) if monidx(re.sub(r'[\d.\s]+$', '', heads[i]['label'])) == 5)
for k in range(17): dated[J14+k] = (5, 14+k)
m, d = 6, 1
for k in range(J14+17, len(heads)):
    dated[k] = (m, d); d += 1
    if d > DIM[m]: m, d = m+1, 1
assert dated[len(heads)-1] == (11, 31), dated[len(heads)-1]
# sanity: month label agrees with assigned month where parseable
bad = []
for i, h in enumerate(heads):
    if i in dated:
        mi = monidx(re.sub(r'[\d.\s\'\"|]+$', '', h['label'].strip(' \'"')))
        if mi is not None and mi != dated[i][0]: bad.append((i, h['label'], dated[i]))
if bad: print('MONTH MISMATCH', bad[:10])
groups = []  # (group id, en title, pt title, [chapters])
def group_of(i, h):
    if i in dated:
        m, d = dated[i]
        if i < 50 or i >= J14:
            return MONN[m]
        if 50 <= i < 53: return 'Lent and Holy Week'
        return 'Eastertide' if m in (3, 4) else None
    lab = h['label'].upper()
    return None
season = None
chapters = []; used = Counter()
def lab_title(h, i):
    if i in dated:
        m, d = dated[i]; return f"{MONN[m]} {d}"
    lb = tidy(repair(h['label'])).rstrip('.,')
    lb = re.sub(r'TRINIT\s*Y-SUND\s*AY', 'TRINITY-SUNDAY', lb); lb = re.sub(r'I\^T', 'LENT', lb)
    lb = re.sub(r'\bOP\b', 'OF', lb); lb = re.sub(r'CHRISTI?!?$|CHRIST!$', 'CHRISTI', lb); lb = lb.replace('CORPUS- CHRISTI', 'CORPUS-CHRISTI')
    lb = re.sub(r'^TUESDAY$', 'TUESDAY IN THE FIRST WEEK OF LENT', lb)
    lb = re.sub(r"^[^A-Za-z]+", '', lb)
    return small(fixtitle(lb))
PATCH = [("HelL","Hell"),("V On the Worm of HeB","On the Worm of Hell"),("Happiness cf Heaven","Happiness of Heaven"),("ihn the Enjoyment of the mortified Bodies","On the Endowments of the glorified Bodies"),
("Peewe of a Christian","Peace of a Christian"),("aU the","all the"),("Lors showing himself to his Disciples after kis","Lord's showing himself to his Disciples after his"),("Lors showing","Lord's showing"),
("8ouI","Soul"),("GospeL","Gospel."),("suf- offering","suffering"),("tntr Saviours","our Saviour's"),("On NeU) Yeat$ Day","On New Year's Day"),("make hy the Example vf","make by the Example of"),
("0» take different States of departed Sons","On the different States of departed Souls"),("Thanks.nng","Thanksgiving"),("Sup~ unction","Supplication"),("On iS. Joseph","On St. Joseph"),("24«","24"),("Prescriptions against Impurity »","Prescriptions against Impurity"),
("Zacheus","Zacheus"),("hear false","bear false"),("ifc","&c."),("wiU","will"),("Michcelmas","Michaelmas"),("LorcTs","Lord's"),("Ecce Homo I Behold","Ecce Homo! Behold"),("B€U‘abbas","Barabbas"),("eviL","evil"),("SouL","Soul"),
("Chi the eternal","On the eternal"),("iTn the Gospel read","On the Gospel read"),("aU our","all our"),("WiU","Will"),("tile Benefits","the Benefits"),("Oft the","On the"),("hi our Lord","On our Lord"),("n our Saviour s being","On our Saviour's being"),
("ON THE SACRED NAME OF JESUS. For the first","On the Sacred Name of Jesus. For the first"),("Rules of Pasting","Rules of Fasting")]
def patch(h):
    for a, b in PATCH: h = h.replace(a, b)
    h = re.sub(r"\b(Lord|Saviour|Son|Mother|Lady)\s?s\b(?!')", r"\1's", h)
    h = re.sub(r"\b(our (?:Lord|Saviour)|Saviour|Lord|Mother|Son)s\b", r"\1's", h)
    h = re.sub(r"\s+", " ", h).strip()
    return h
btitles()
for i, (h, paras) in enumerate(O):
    lab = lab_title(h, i)
    title = fixtitle(tidy(repair(h['title'])))
    if i in dated and dated[i] in BT:
        cands = [c for c in [title] + [tidy(c) for c in BT[dated[i]]] if c]
        title = min(cands, key=nbad) if cands else ''
    title = re.sub(r'^[>\W]+', '', title); title = sentence(title).rstrip(',. ')
    title = title.replace('   ', ' ')
    paras = [tidy(repair(p)) for p in paras]
    paras = [lead(p, n) for n, p in enumerate(p for p in paras if p)]
    # derive group
    L_ = re.sub(r'\s+', ' ', h['label'].upper())
    if i < 50 or i >= J14: grp = MONN[dated[i][0]]
    elif i < 53: grp = 'Lent and Holy Week'
    elif 'EASTER SUNDAY' in L_: season = 'Eastertide'
    elif 'ABOVE' == '': pass
    if 53 <= i < J14:
        if i == 53: season = 'Lent and Holy Week'
        if 'EASTER SUNDAY' in L_: season = 'Eastertide'
        if 'FRIDAY AFTER THE OCTAVE OF THE ASC' in re.sub(r'\s+', ' ', L_): season = 'Whitsuntide and Corpus Christi'
        grp = season
    if i in dated and i < 50 or i >= J14: cid = f"{MONN[dated[i][0]][:3].lower()}-{dated[i][1]:02d}"
    elif i in dated and 50 <= i < 53: cid = f"{MONN[dated[i][0]][:3].lower()}-{dated[i][1]:02d}"
    elif i in dated: cid = f"{MONN[dated[i][0]][:3].lower()}-{dated[i][1]:02d}"
    else:
        cid = slug(lab)
        if used[cid] or cid in ('lent', 'tuesday') or len(cid) < 7: cid = slug(lab + ' ' + ' '.join(title.split()[:4]))
    used[cid] += 1
    assert used[cid] == 1, cid
    h1 = patch(f"{lab} — {title}" if title else lab)
    if not title: title = ''
    (book/'en-US'/f'{cid}.md').write_text(f"# {h1}\n\n" + '\n\n'.join(paras) + '\n', encoding='utf8')
    chapters.append((grp, cid, h1))
json.dump(chapters, open(book/'toc-en.json', 'w'), ensure_ascii=False, indent=0)
print(len(chapters), 'fixes', sum(fixes.values()), len(fixes))
import random; random.seed(3); print(random.sample(sorted(fixes),60))
