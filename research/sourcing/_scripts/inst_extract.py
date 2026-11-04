"""Institutions liturgiques: word boxes -> per-page body lines (margin notes, running heads, page-foot notes split off).
usage: inst_extract.py tN.pkl out.pkl"""
import re, sys, pickle, statistics
from collections import Counter
FN = re.compile(r'^\(?\s*(\d{1,2}|[a-z])\s*[)\]]')

def lines_of(words, h):
    ws = sorted(words, key=lambda w: (w[1] + w[3]) / 2)
    lines, cur, cy = [], [], None
    for w in ws:
        cy_w = (w[1] + w[3]) / 2
        hh = max(10, w[3] - w[1])
        if cur and abs(cy_w - cy) <= 0.5 * max(18, statistics.median([x[3] - x[1] for x in cur])):
            cur.append(w)
            cy = sum((x[1] + x[3]) / 2 for x in cur) / len(cur)
        else:
            if cur: lines.append(cur)
            cur, cy = [w], cy_w
    if cur: lines.append(cur)
    return [sorted(l) for l in lines]

def page(p):
    W, H, ws = p['w'], p['h'], [w for w in p['words'] if w[4]]
    if len(ws) < 3: return dict(body=[], margin=[], W=W, H=H, L=0, R=W)
    # body right edge: most common right end of line-final words
    ls = lines_of(ws, H)
    ends = Counter()
    for l in ls:
        if len(l) >= 4: ends[round(l[-1][2] / 25)] += 1
    ends = Counter()
    for l in ls:
        if len(l) >= 4: ends[round(l[-1][2] / 25)] += 1
    if ends:
        mb = max(ends, key=lambda b: ends[b])
        xs = sorted(l[-1][2] for l in ls if len(l) >= 4 and abs(round(l[-1][2] / 25) - mb) <= 1)
        R = xs[len(xs) // 2]
    else:
        R = W
    starts = Counter(round(l[0][0] / 25) for l in ls if len(l) >= 4)
    L = (min(b for b, c in starts.items() if c >= 0.4 * max(starts.values())) * 25) if starts else 0
    pts = [((l[-1][1] + l[-1][3]) / 2, l[-1][2]) for l in ls if len(l) >= 4 and abs(l[-1][2] - R) <= 0.02 * W]
    a, b = R, 0.0
    if len(pts) >= 8:
        my = sum(p[0] for p in pts) / len(pts); mx = sum(p[1] for p in pts) / len(pts)
        vy = sum((p[0] - my) ** 2 for p in pts)
        if vy > 0:
            b = sum((p[0] - my) * (p[1] - mx) for p in pts) / vy
            a = mx - b * my
    edge = lambda w: a + b * (w[1] + w[3]) / 2
    PUNCT = set('.,;:!?()«»—-’\'"')
    def junky(t):
        if re.search(r'[A-Za-zÀ-ÿœŒ0-9]', t): return False
        return len(t) >= 2 and t not in ('...', '--', '—-') or (len(t) == 1 and t not in PUNCT)
    body_w = [w for w in ws if w[0] <= edge(w) + 0.004 * W and not junky(w[4])]
    # left margin (mirrored pages): longest covered run by word mass; words wholly left of it are margin
    bw = 8
    cov = [0] * (W // bw + 2)
    for w in body_w:
        for b in range(int(w[0] // bw), int(w[2] // bw) + 1): cov[b] += 1
    thr = 0.45 * max(cov) if cov else 0
    runs, st, gap = [], None, 0
    for b, c in enumerate(cov):
        if c > thr:
            if st is None: st = b
            last, gap = b, 0
        elif st is not None:
            gap += 1
            if gap >= 2:
                runs.append((st, last)); st = None
    if st is not None: runs.append((st, last))
    if runs:
        mass = lambda r: sum(cov[r[0]:r[1] + 1])
        best = max(runs, key=mass)
        lo = best[0] * bw - 30
        body_w = [w for w in body_w if (w[0] + w[2]) / 2 >= lo + 6]
    margin = [w for w in ws if w not in body_w]
    bl = lines_of(body_w, H)
    out = []
    for l in bl:
        out.append(dict(x0=l[0][0], x1=l[-1][2], y=(l[0][1] + l[0][3]) / 2, h=statistics.median([w[3] - w[1] for w in l]), t=' '.join(w[4] for w in l), n=len(l)))
    return dict(body=out, margin=[' '.join(w[4] for w in l) for l in lines_of(margin, H)], R=R, L=L, W=W, H=H)

if __name__ == '__main__':
    P = pickle.load(open(sys.argv[1], 'rb'))
    pickle.dump([page(p) for p in P], open(sys.argv[2], 'wb'))
