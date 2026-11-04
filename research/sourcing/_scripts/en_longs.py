"""Repair long-s OCR (s read as f) in 18th-century English: a token that is not a word but becomes one when some f's turn to s.
usage: en_longs.py IN OUT  (lexicon: every en-US chapter in content/books, cached)"""
import collections, glob, itertools, os, pickle, re, sys
CACHE = '/Users/gustavo/Documents/prayer/research/sourcing/_cfg_en/lex_en.pkl'
def lexicon():
    if os.path.exists(CACHE): return pickle.load(open(CACHE, 'rb'))
    c = collections.Counter()
    for f in glob.glob('/Users/gustavo/Documents/prayer/content/books/**/en-US/*.md', recursive=True):
        if 'eloquence' in f or 'fables' in f or 'dialogues' in f: continue
        try: c.update(w.lower() for w in re.findall(r"[A-Za-z]{2,}", open(f, errors='replace').read()))
        except OSError: pass
    c = collections.Counter({w: n for w, n in c.items() if n >= 3})
    pickle.dump(c, open(CACHE, 'wb')); return c
L = None
def fixword(w):
    lw = w.lower()
    if 'f' not in lw: return w
    n = L.get(lw, 0)
    idx = [i for i, ch in enumerate(lw) if ch == 'f']
    if len(idx) > 5: return w
    best, bn = None, 0
    for r in range(1, len(idx) + 1):
        for sub in itertools.combinations(idx, r):
            cand = list(lw)
            for i in sub: cand[i] = 's'
            cand = ''.join(cand); cn = L.get(cand, 0)
            if cn > bn: best, bn = cand, cn
    if best is None or bn < 3 or n >= bn * 0.5 and n >= 20: return w
    if n > bn: return w
    out = ''.join(best[i].upper() if w[i].isupper() else best[i] for i in range(len(w)))
    return out
def fix(t):
    t = t.replace('ſ', 's')
    return re.sub(r"[A-Za-z]{3,}", lambda m: fixword(m.group(0)), t)
if __name__ == '__main__':
    L = lexicon()
    s = open(sys.argv[1], encoding='utf8', errors='ignore').read()
    open(sys.argv[2], 'w').write(fix(s))
