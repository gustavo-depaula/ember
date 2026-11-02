"""OCR repair for Pohl's Latin: lexicon from the whole Latin corpus in content/books (cached), fragment repair of
line starts next to a lost drop capital, and a vote-based fix of single-letter OCR slips."""
import collections, glob, os, pickle, re, sys
sys.path.insert(0, os.path.dirname(__file__))
import bonaventure_common as bc

CACHE = 'research/sourcing/kempis/lexicon.pkl'
_lex = None


def lexicon():
    global _lex
    if _lex is not None:
        return _lex
    if os.path.exists(CACHE):
        _lex = pickle.load(open(CACHE, 'rb'))
        return _lex
    c = collections.Counter()
    for f in glob.glob('content/books/**/la/*.md', recursive=True):
        if 'kempis-opera-omnia' in f:
            continue  # unrepaired OCR of the same volumes
        for w in re.findall(r'[a-zA-Zæœ]{2,}', open(f, errors='replace').read()):
            c[w.lower()] += 1
    c = collections.Counter({w: n for w, n in c.items() if n >= 3})
    pickle.dump(c, open(CACHE, 'wb'))
    _lex = c
    return c


def fix_ocr(text, log=None):
    L = lexicon()

    def rep(m):
        w = m.group(0)
        lw = w.lower()
        n = L.get(lw, 0)
        if len(w) < 4 or n >= 20000:
            return w
        cs = [x for x in bc._raw(lw) if L.get(x, 0) >= 400]
        if not cs:
            return w
        best = max(cs, key=lambda x: L[x])
        if not ((n <= 200 and L[best] >= 8 * n + 500) or L[best] >= 60 * n + 3000):
            return w
        second = sorted((L[x] for x in cs), reverse=True)[1:2]
        if second and second[0] * 3 > L[best]:
            return w
        if log is not None:
            log.append((w, best))
        return best[:1].upper() + best[1:] if w[0].isupper() else best
    return re.sub(r'[A-Za-zæœ]{4,}', rep, text)


def frag_line(line, prev='', first=False):
    """A line start whose first letters were eaten by a drop capital: strip glyph junk, then try 1-3 letter prefixes;
    after a hyphenated line end the prefix must complete the split word."""
    L = lexicon()
    m = re.match(r'^[^A-Za-z]*([A-Za-z]+)(.*)$', line, re.S)
    if not m:
        return line
    t, rest = m.groups()
    sm = re.search(r'([A-Za-z]+)-\s*$', prev)
    if sm:
        stem = sm.group(1).lower()
        if L.get(stem + t.lower(), 0) >= 30:
            return t + rest
        cands = {p: L[stem + p + t.lower()] for k in (1, 2, 3) for p in _prefixes(k) if L.get(stem + p + t.lower(), 0) >= 50}
        if cands:
            best = max(cands, key=cands.get)
            srt = sorted(cands.values(), reverse=True)
            if not (len(srt) > 1 and srt[1] * 3 > srt[0]):
                return best + t + rest
        return t + rest
    if len(t) < 3 or L.get(t.lower(), 0) >= 30 or (t[0].isupper() and not first):
        return t + rest
    cands = {}
    for k in (1, 2, 3):
        for p in _prefixes(k):
            w = p + t.lower()
            if L.get(w, 0) >= 150:
                cands[w] = L[w]
    if not cands:
        return t + rest
    best = max(cands, key=cands.get)
    srt = sorted(cands.values(), reverse=True)
    if len(srt) > 1 and srt[1] * 3 > srt[0]:
        return t + rest
    return (best[:1].upper() + best[1:] if t[0].isupper() else best) + rest


_pre = {}


def _prefixes(k):
    if k not in _pre:
        import itertools
        _pre[k] = [''.join(p) for p in itertools.product('abcdefghilmnopqrstuvx', repeat=k)]
    return _pre[k]


def repair_open(lines, n=16):
    """Apply frag_line to the first n non-empty lines of a chapter."""
    out, k, prev = [], 0, ''
    KEEP = {'O', 'A', 'E', 'ET', 'IN', 'AD', 'DE', 'EX', 'SI', 'UT', 'NON', 'SED', 'QVI', 'QUI', 'CVM', 'CUM'}
    for l in lines:
        if l.strip() and k == 0:  # junk glyphs where the drop capital stood
            tk = re.sub(r'\s+', ' ', l).strip().split(' ')
            while len(tk) > 2 and len(re.sub(r'[a-z]', '', tk[0])) == len(tk[0]) and tk[0] not in KEEP and len(tk[0]) <= 5 and lexicon().get(re.sub(r'[^a-z]', '', tk[1].lower()), 0) >= 50:
                tk = tk[1:]
            l = ' '.join(tk)
        if l.strip() and k < n:
            l = frag_line(re.sub(r'\s+', ' ', l), prev, k == 0)
            k += 1
        if l.strip():
            prev = l
        out.append(l)
    return out


def tidy(p):
    """Drop glyph-junk tokens left by drop capitals ('y^^^On', '^LM'); a token with one stray symbol keeps its letters."""
    out = []
    for t in p.split(' '):
        if t in ('t5', 'i5', 't0', 'i0', 'ro', 'so5'):
            continue
        n = len(re.findall(r'[\^@■•¢€§|{}~<>\\]', t))
        if n >= 2 or (n and len(t) <= 3):
            continue
        out.append(re.sub(r'[\^@■•¢€§|{}~<>\\]', '', t))
    p = ' '.join(out)
    return p[:1].upper() + p[1:]
