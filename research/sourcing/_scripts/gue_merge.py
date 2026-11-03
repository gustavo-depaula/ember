"""Vote between two OCRs of one text: dg (domgueranger.net) tokens are kept unless an aligned archive.org token is a clearly better French word."""
import unicodedata, re, os, glob, collections, json
ROOT = '/Users/gustavo/Documents/prayer/'
CACHE = ROOT + 'research/sourcing/gueranger/frfreq.json'
def norm(w):
    w = w.lower().replace('’', "'").replace('œ', 'oe')
    w = re.sub(r"^(?:[ldjmtsnc]|qu|jusqu|lorsqu|puisqu)'", '', w)
    return re.sub(r'[^a-zà-ÿæ]', '', w)
def freq():
    if os.path.exists(CACHE): return collections.Counter(json.load(open(CACHE)))
    c = collections.Counter()
    for f in glob.glob(ROOT + 'content/books/*/*/fr-FR/*.md') + glob.glob(ROOT + 'content/books/*/*/*/fr-FR/*.md'):
        if 'gueranger' in f: continue
        for w in re.findall(r"[A-Za-zà-ÿœæÀ-Ý]+", open(f, errors='ignore').read()):
            c[w.lower()] += 1
    json.dump({w: n for w, n in c.items() if n >= 2}, open(CACHE, 'w'))
    return c
F = None
def latfreq():
    p = ROOT + 'research/sourcing/gueranger/lafreq.json'
    if os.path.exists(p): return json.load(open(p))
    c = collections.Counter()
    for f in glob.glob(ROOT + 'content/books/*/*/la/*.md') + glob.glob(ROOT + 'content/books/*/*/*/la/*.md'):
        for w in re.findall(r"[A-Za-zà-ÿœæ]+", open(f, errors='ignore').read()):
            c[norm(w)] += 1
    d = {w: n for w, n in c.items() if n >= 2}
    json.dump(d, open(p, 'w')); return d
LA = {}
def ed1(a, b):
    if abs(len(a) - len(b)) > 2: return 9
    import difflib
    return max(len(a), len(b)) - sum(m.size for m in difflib.SequenceMatcher(None, a, b).get_matching_blocks())
def pick(a, b):
    na, nb = norm(a), norm(b)
    if len(na) < 3 or len(nb) < 3 or na == nb: return None
    if re.fullmatch(r'[ivxlc]+e?', na) or re.fullmatch(r'[ivxlc]+e?', nb): return None
    def strip(x): return ''.join(c for c in unicodedata.normalize('NFD', x) if unicodedata.category(c) != 'Mn')
    if strip(na) == strip(nb): return None
    if re.search(r'\d', b): return None
    fa, fb = max(F.get(na, 0), LA.get(na, 0)), max(F.get(nb, 0), LA.get(nb, 0))
    if ed1(na, nb) > 2: return None
    if fa >= 2 and fb < 2: return None
    if fb >= 2 and fa < 2: return b
    if fa >= 2 and fb >= 2 and (fa >= 20 or na[:-1] == nb[:-1] or na == nb + 's' or nb == na + 's'): return None
    if fb > 30 * max(fa, 1) and len(na) > 2: return b
    return None
def tok(s): return re.findall(r'\S+', s)
def prep_archive(text):
    t = text.replace('\x0c', ' ')
    return tok(re.sub(r'-\s*\n\s*', '', t))
def build_index(at):
    idx = collections.defaultdict(list)
    keys = [norm(w) for w in at]
    for i in range(len(keys) - 3):
        idx[(keys[i], keys[i + 1], keys[i + 2], keys[i + 3])].append(i)
    return keys, idx
def merge_para(p, at, keys, idx, log):
    toks = tok(p)
    if len(toks) < 6: return p
    nk = [norm(w) for w in toks]
    cands = []
    for i in range(len(toks) - 3):
        key = tuple(nk[i:i + 4])
        if '' in key: continue
        c = idx.get(key)
        if c and len(c) == 1: cands.append((i, c[0]))
    if not cands: return p
    # consistent anchors: keep those whose offset j-i agrees with the median
    offs = sorted(j - i for i, j in cands)
    med = offs[len(offs) // 2]
    good = [(i, j) for i, j in cands if abs((j - i) - med) < 25]
    if not good: return p
    lo = max(0, min(j - i for i, j in good) - 12)
    hi = min(len(at), max(j - i for i, j in good) + len(toks) + 12)
    win = at[lo:hi]
    import difflib
    sm = difflib.SequenceMatcher(None, nk, [norm(w) for w in win], autojunk=False)
    out = list(toks)
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'replace' and i2 - i1 == j2 - j1 and i2 - i1 <= 3:
            for k in range(i2 - i1):
                i = i1 + k
                r = pick(toks[i], win[j1 + k])
                if r:
                    lead = re.match(r'^\W*', toks[i]).group(0); trail = re.search(r'\W*$', toks[i]).group(0)
                    core = re.sub(r'^\W+|\W+$', '', r).replace("'", '’')
                    if toks[i].lstrip('«“([')[:1].isupper() and not core[:1].isupper(): core = core[:1].upper() + core[1:]
                    out[i] = lead + core + trail
                    log.append((toks[i], out[i]))
    return ' '.join(out)
def setup():
    global F, LA
    F = freq(); LA = latfreq()
