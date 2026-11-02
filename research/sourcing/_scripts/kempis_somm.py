"""Repair of the Sommalius (Antwerp 1615) OCR: long s read as f, e as c, n as u, etc., by lexicon vote over multi-letter swaps."""
import itertools, re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import kempis_fix as kf

SW = {'f': 'sf', 'c': 'ce', 'e': 'ec', 'u': 'un', 'n': 'nu', 'i': 'il', 'l': 'li', 't': 'tl', 'a': 'ao', 'o': 'oa', 'r': 'rt', 'h': 'hb', 'b': 'bh', 'm': 'mn', 'q': 'qg', 's': 'sf'}


def cands(w, L, maxsub=3):
    pos = [i for i, ch in enumerate(w) if ch in SW and len(SW[ch]) > 1]
    best = None
    for k in range(1, maxsub + 1):
        for comb in itertools.combinations(pos, k):
            for rep in itertools.product(*[SW[w[i]][1:] for i in comb]):
                x = list(w)
                for i, r in zip(comb, rep):
                    x[i] = r
                x = ''.join(x)
                n = L.get(x, 0)
                if n >= 3 and (best is None or (k, -n) < (best[0], -best[1])):
                    best = (k, n, x)
        if best:
            return best[2]
    return None


def fix_word(w, L):
    lw = w.lower()
    if len(lw) < 3 or L.get(lw, 0) >= 3:
        return w
    if len(lw) > 14:
        return w
    c = cands(lw, L, 3 if len(lw) <= 9 else 2)
    if not c:
        return w
    return c[:1].upper() + c[1:] if w[0].isupper() else c


def fix_text(t):
    L = kf.lexicon()
    t = t.replace('ſ', 's')
    t = re.sub(r'(?<=[a-z])- (?=[a-z])', '', t)
    return re.sub(r"[A-Za-z]+", lambda m: fix_word(m.group(0), L), t)


if __name__ == '__main__':
    L = open('research/sourcing/kempis/sommalius/bub_gb_nPb3WGcYj1wC.txt', errors='replace').read().split('\n')
    seg = ' '.join(L[int(sys.argv[1]):int(sys.argv[2])])
    print(fix_text(seg))
