"""Institutions liturgiques: s{N}.pkl streams -> chapter markdown for one tome. usage: inst_assemble.py N outdir"""
import re, sys, os, json, pickle
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import inst_build as B
FREQ = B.FREQ
INST = '/Users/gustavo/Documents/prayer/research/sourcing/gueranger/inst/'

VOW = 'aeiouyéèêëâîïôûœhAEIOUYÉÈÊÂÎÔÛŒH'
SUBS_A = [('é', 'ê'), ('é', 'è'), ('ê', 'é'), ('è', 'é'), ('e', 'é'), ('c', 'e'), ('ct', 'et'), ('lc', 'le'), ('rn', 'm'), ('ii', 'u'), ('ie', 'le'), ('é', 'e'), ('à', 'a'), ('ô', 'o')]
SUBS_B = [('ci', 'd'), ('cl', 'd'), ('li', 'h'), ('t', 'l'), ('l', 't'), ('i', 'l'), ('l', 'i'), ('u', 'n'), ('n', 'u'), ('a', 'à'), ('o', 'ô')]

def fx(w):
    lw = w.lower()
    fo = FREQ.get(lw, 0)
    if len(lw) < 3 or fo > 2000: return w
    best, bf = None, 0
    for tier, subs in ((0, SUBS_A), (1, SUBS_B)):
        for a, b in subs:
            i = lw.find(a)
            while i != -1:
                c = lw[:i] + b + lw[i + len(a):]
                f = FREQ.get(c, 0)
                ok = (f >= 200 and fo < 0.02 * f) if tier == 0 else (f >= 300 and fo == 0)
                if ok and f > bf: best, bf = c, f
                i = lw.find(a, i + 1)
    if best:
        return best[0].upper() + best[1:] if w[0].isupper() else best
    return w

TOK = re.compile(r"[A-Za-zÀ-ÿœŒ]+")
def fix_text(t):
    t = t.replace("'", '’').replace('’’', '’')
    # junk tokens from margin spill
    toks = t.split(' ')
    keep = []
    for k in toks:
        if re.search(r'[\^■•~<>|]', k) and sum(c.isalpha() for c in k) <= 3: continue
        keep.append(re.sub(r'[\^■•~|]', '', k) if sum(c.isalpha() for c in k) > 3 else k)
    t = ' '.join(keep)
    # elided l’ misread as T/F/P/r
    def el(m):
        a, rest = m.group(1), m.group(2)
        w = a + rest
        if FREQ.get(w.lower(), 0) < 5 and FREQ.get(rest.lower(), 0) >= 30 and rest[0] in VOW:
            return 'l’' + rest
        return w
    t = re.sub(r'(?<![\wÀ-ÿ’])([FPTrIt])([A-Za-zÀ-ÿœŒ]{3,})(?![\wÀ-ÿ])', el, t)
    # OCR letter swaps, only in mostly-French prose
    ws = TOK.findall(t)
    if ws and sum(FREQ.get(w.lower(), 0) > 0 for w in ws) / len(ws) >= 0.8:
        t = TOK.sub(lambda m: fx(m.group(0)), t)
    return re.sub(r'\s+([,.])(?=\s|$)', r'\1', re.sub(r' {2,}', ' ', t)).strip()

SMALL = {'de', 'du', 'des', 'la', 'le', 'les', 'et', 'en', 'au', 'aux', 'dans', 'à', 'sur', 'pour', 'par', 'l’', 'd’', 'ou', 'un', 'une', 'qui', 'que', 'ce', 'ces', 'sa', 'son', 'ses', 'a'}
def titlecase(s):
    m = re.match(r'^N[O0]TE\s*([A-Z])\W*$', s)
    if m: return 'Note ' + m.group(1)
    s = s.replace('^', '’').replace("'", '’')
    out = []
    for i, w in enumerate(s.lower().split()):
        w2 = re.sub(r'^(l’|d’)(\w)', lambda m: m.group(1) + m.group(2).upper(), w) if i else w
        if i == 0: w2 = w[:1].upper() + w[1:]
        out.append(w2)
    return ' '.join(out)

def build_md(title, its, notes, chapter=False):
    """its: items; returns markdown"""
    its = list(its)
    while chapter and len(its) > 1 and (its[0][0] == 'h' and not re.match(r'^N[O0]TES? D[UI]', its[0][1]) or B.upper_ratio(its[0][1]) > 0.7 and len(its[0][1]) < 400): its = its[1:]
    body, in_notes = [], False
    labels = []
    for kind, tx, pg, lb in its:
        if kind == 'h':
            if re.match(r'^N[O0]TES? D[UI]', tx):
                in_notes = True
                body.append(('h2', 'Notes du chapitre')); continue
            if re.match(r'^CH[A-Z]{3,6}\s+[IVXLC!]+\W*$', tx): continue
            body.append(('h3' if in_notes else 'h2', titlecase(tx) if len(tx) < 90 else tx))
        else:
            t = fix_text(tx)
            if len(t) < 3 or not re.search(r'[A-Za-zÀ-ÿ]', t): continue
            body.append(('p', t))
    # renumber footnotes
    order = []
    for _, t in body:
        for m in re.findall(r'\[\^(p\d+_\d+)\]', t):
            if m not in order: order.append(m)
    mp = {o: str(i + 1) for i, o in enumerate(order)}
    out = ['# ' + title, '']
    for k, t in body:
        t = re.sub(r'\[\^(p\d+_\d+)\]', lambda m: '[^%s]' % mp[m.group(1)], t)
        out += [('## ' + t) if k == 'h2' else ('### ' + t) if k == 'h3' else t, '']
    for o in order:
        out += ['[^%s]: %s' % (mp[o], fix_text(notes.get(o, '')) or '—'), '']
    return '\n'.join(out).rstrip() + '\n'

def find(items, page, rx=None, after=0):
    for i in range(after, len(items)):
        k, t, pg, lb = items[i]
        if pg >= page and (rx is None or (k == 'h' and re.search(rx, t))):
            return i
    raise SystemExit('start not found %s %s' % (page, rx))

def segments(tome, items, spec):
    """spec: [(id, title, page, rx)] ; last entry sentinel (None, None, page, rx) ends the stream."""
    idx, prev = [], 0
    for sid, title, page, rx in spec:
        i = find(items, page, rx, prev)
        idx.append(i); prev = i
    res = []
    for n in range(len(spec) - 1):
        sid, title, page, rx = spec[n]
        a, b = idx[n], idx[n + 1]
        seg = items[a:b]
        # consume leading title headings
        j = 0
        while j < len(seg) and seg[j][0] == 'h' and j < 6 and not re.match(r'^N[O0]TES? D[UI]', seg[j][1]): j += 1
        res.append((sid, title, seg[j:]))
    return res
