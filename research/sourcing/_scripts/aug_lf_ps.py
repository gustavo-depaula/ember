"""LF Expositions on the Psalms (6 vols, djvu.xml) -> stream of body lines and headings."""
import sys, re
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from bonaventure_folio import load_pages
import aug_lf
ORD = r'(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH)'
HPS = re.compile(r'^\W{0,3}\d?P[SB]AL[MN]S?\s+([IVXLCDl1|!]+)\W*$')
HSUB = re.compile(r'^\W{0,3}(?:(%s)\s+(?:EXPOSITION|DISCOURSE|SERMON|ENARRATION)|(?:EXPOSITION|DISCOURSE|SERMON|ENARRATION|HOMILY)\s+(?:THE\s+)?(%s|[IVXLCl1T!|]+))\W*$' % (ORD, ORD))
def stream(pgs, first=0, last=None):
    out = []
    for i in range(first, (last if last is not None else len(pgs) - 1) + 1):
        pg = pgs[i]; H = pg['h']
        ls = aug_lf.page_lines(pg)
        body = sorted(l['h'] for l in ls if len(l['text']) > 40)
        med = body[len(body) // 2] if body else 0
        for l in ls:
            t = l['text'].strip()
            if l['y'] < 0.1 * H or l['y'] > 0.955 * H: continue
            if HPS.match(t): out.append(('P', t, i, l)); continue
            if HSUB.match(t): out.append(('S', t, i, l)); continue
            if len(t) < 4 or sum(c.isalpha() for c in t) < 0.5 * len(t): continue
            if l['h'] < 0.86 * med: continue
            out.append(('L', t, i, l))
    return out
if __name__ == '__main__':
    pgs = load_pages(sys.argv[1])
    for k, t, i, l in stream(pgs):
        if k != 'L': print(i, k, t)
