"""De-interleave two-column (Latin | vernacular) OCR lines into a Latin paragraph and a vernacular paragraph."""
import re, glob, collections, os, sys, random
sys.path.insert(0, os.path.dirname(__file__))
from mc_lib import join, hyphen_vocab
ROOT = '/Users/gustavo/Documents/prayer/'
_cache = {}
def counts(lang, nbytes=6_000_000):
    if lang in _cache: return _cache[lang]
    files = sorted(glob.glob(ROOT + f'content/books/*/*/{lang}/*.md') + glob.glob(ROOT + f'content/books/*/{lang}/*.md'))
    random.Random(1).shuffle(files)
    c = collections.Counter(); n = 0
    for f in files:
        t = open(f, errors='replace').read(); n += len(t)
        c.update(re.findall(r"[a-zàâçéèêëîïôûùœæ]+", t.lower()))
        if n > nbytes: break
    _cache[lang] = c
    return c

def labeller(vern):
    L = counts('la'); E = counts(vern)
    tl = sum(L.values()); te = sum(E.values())
    def lab(w):
        w = w.lower()
        a = (L.get(w, 0) + .1) / tl; b = (E.get(w, 0) + .1) / te
        r = a / (a + b)
        if L.get(w, 0) + E.get(w, 0) < 2:
            if re.search(r'(orum|arum|ibus|atur|etur|untur|emus|abit|abunt|ione|itas|ui|ae|um|us|is|am|em|ant|unt|at|it)$', w) and len(w) > 3: return 'L' if vern == 'en-US' or not re.search(r'(ant|ait|ais|ion|tion)$', w) else 'N'
            return 'N'
        return 'L' if r > .8 else ('V' if r < .2 else 'N')
    return lab

def runs(line, lab):
    toks = line.split()
    labs = [lab(re.sub(r"[^A-Za-zÀ-ÿ]", '', t)) if re.search(r'[A-Za-zÀ-ÿ]', t) else 'N' for t in toks]
    # neutral tokens take the label of the previous labelled one (or next)
    last = None
    for i, l in enumerate(labs):
        if l == 'N': labs[i] = last if last else 'N'
        else: last = l
    nxt = None
    for i in range(len(labs) - 1, -1, -1):
        if labs[i] == 'N': labs[i] = nxt if nxt else 'V'
        else: nxt = labs[i]
    # remove isolated flips
    for i in range(1, len(labs) - 1):
        if labs[i - 1] == labs[i + 1] != labs[i]: labs[i] = labs[i - 1]
    out = []
    for t, l in zip(toks, labs):
        if out and out[-1][0] == l: out[-1][1].append(t)
        else: out.append([l, [t]])
    return [(l, ' '.join(ts)) for l, ts in out]

def split_block(lines, vern, lab, V):
    """lines of one OCR block -> [latin_text, vern_text] or None when not bilingual."""
    tl = tv = 0; allruns = []
    for ln in lines:
        r = runs(ln, lab); allruns.append(r)
        for l, t in r:
            n = len(t.split())
            if l == 'L': tl += n
            else: tv += n
    if tl < 8 or tv < 8 or min(tl, tv) / (tl + tv) < .18: return None
    la = [t for r in allruns for l, t in r if l == 'L']
    ve = [t for r in allruns for l, t in r if l == 'V']
    return join(la, V), join(ve, V)

def deinterleave(lines, vern='en-US'):
    lab = labeller(vern); V = hyphen_vocab(lines)
    out = []; cur = []; n_bi = 0
    def flush():
        nonlocal n_bi
        if not cur: return
        r = split_block(cur, vern, lab, V) if len(cur) >= 4 else None
        if r:
            n_bi += 1
            out.extend([r[0], '', r[1], ''])
        else:
            out.extend(cur)
        cur.clear()
    for ln in lines:
        if ln.strip(): cur.append(re.sub(r'\s+', ' ', ln.strip()))
        else:
            flush(); out.append('')
    flush()
    return out, n_bi
