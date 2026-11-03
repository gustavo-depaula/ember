"""Library of the Fathers (Oxford, 1847-57) archive.org djvu.xml -> body lines without marginal refs, running heads or small-type notes.
usage: python3 -I aug_lf.py file.xml FIRST LAST   (page indices, 0-based, inclusive) -> prints body text, '<<' marks chapter margins"""
import re, sys, html, statistics, collections
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
ROMAN = re.compile(r'^(?:[IVXLC]{1,7}|\d{1,3})[.,]?$')
def body_left(pg):
    c = collections.Counter(int(w[0] / 12) for ln in pg['lines'] for w in ln if w[0] < 0.45 * pg['w'])
    if not c: return 0
    k = max(c, key=lambda k: c[k] + c.get(k - 1, 0) + c.get(k + 1, 0))
    return k * 12
def body_right(pg):
    c = collections.Counter(int(w[2] / 12) for ln in pg['lines'] for w in ln[-1:] if w[2] > 0.55 * pg['w'])
    if not c: return pg['w']
    k = max(c, key=lambda k: c[k] + c.get(k - 1, 0) + c.get(k + 1, 0))
    return k * 12 + 12
def lh(ws):
    hs = sorted(b - d for a, b, c, d, t in ws if len(t) >= 3)
    return hs[len(hs) // 2] if hs else 0
def page_lines(pg, skip_head=True):
    """-> list of dict(text, x (first body word x - left), margin (margin words), h, y)."""
    L = body_left(pg); R = body_right(pg)
    out = []
    for ln in pg['lines']:
        body = [w for w in ln if w[0] >= L - 30 and w[0] <= R - 5]
        marg = [w for w in ln if not (w[0] >= L - 30 and w[0] <= R - 5)]
        if not body: continue
        out.append(dict(text=' '.join(w[4] for w in body), x=body[0][0] - L, right=body[-1][2], marg=[w[4] for w in marg], h=lh(body), y=ln[0][3], L=L))
    return out
if __name__ == '__main__':
    pgs = load_pages(sys.argv[1]); a, b = int(sys.argv[2]), int(sys.argv[3])
    for i in range(a, b + 1):
        pg = pgs[i]; ls = page_lines(pg)
        print('--- page', i, 'L', ls[0]['L'] if ls else '')
        for l in ls: print('%4d h%2d y%4d [%s] %s' % (l['x'], l['h'], l['y'], ' '.join(l['marg'])[:25], l['text'][:80]))
