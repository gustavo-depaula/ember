"""Read a Tesseract TSV of a Solesmes (1877) page of the Liber specialis gratiae.
Drops the running head, the marginal notes (left of the body's left edge, found from the word coverage per x) and the footnote
block (smaller type below the body). Returns body lines [dict(l, t, h, text)] and the body's left edge."""
import csv, sys, statistics, collections

def words_by_line(path):
    rows = list(csv.DictReader(open(path, encoding='utf-8', errors='replace'), delimiter='\t', quoting=csv.QUOTE_NONE))
    lines = collections.OrderedDict()
    for r in rows:
        if r['level'] != '5' or not r['text'].strip() or float(r['conf']) < 0: continue
        k = (r['block_num'], r['par_num'], r['line_num'])
        lines.setdefault(k, []).append(dict(l=int(r['left']), t=int(r['top']), w=int(r['width']), h=int(r['height']), txt=r['text'].strip()))
    return list(lines.values())

def body_edge(ls):
    cov = collections.Counter()
    for ws in ls:
        seen = set()
        for w in ws:
            if w['w'] > 300: continue
            for x in range(w['l'], w['l'] + w['w']): seen.add(x)
        cov.update(seen)
    if not cov: return (0, 999)
    mx = max(cov.values())
    xs = [x for x in sorted(cov) if cov[x] >= 0.45 * mx]
    return (xs[0], xs[-1]) if xs else (0, 999)

def page(path):
    ls = [[w for w in ws if 150 < w['t'] < 1150 and w['l'] < 960] for ws in words_by_line(path)]
    ls = [ws for ws in ls if ws]
    x0, x1 = body_edge(ls)
    L = []
    for ws in ls:
        ws = [w for w in ws if x0 - 2 < w['l'] + w['w'] / 2 < x1 + 3]
        if not ws: continue
        ws.sort(key=lambda w: w['l'])
        hs = [w['h'] for w in ws if len(w['txt']) >= 4]
        L.append(dict(l=ws[0]['l'], t=min(w['t'] for w in ws), h=statistics.median(hs) if hs else 0,
                      text=' '.join(w['txt'] for w in ws), n=len(ws)))
    L.sort(key=lambda x: x['t'])
    return L, x0

def split_foot(L):
    """cut footnotes: from the first line after 60% of the page whose height is < 0.85 of the body median"""
    hs = [x['h'] for x in L if x['h'] and x['n'] >= 4]
    if not hs: return L, []
    hb = statistics.median(sorted(hs)[len(hs) // 3:])
    for i, x in enumerate(L):
        if x['t'] > 560 and x['h'] and x['h'] < 0.84 * hb and x['n'] >= 2:
            return L[:i], L[i:]
    return L, []

if __name__ == '__main__':
    L, x0 = page(sys.argv[1])
    B, F = split_foot(L)
    print('x0', x0)
    for x in B: print('B', x['l'], x['t'], round(x['h']), x['text'][:80])
    for x in F: print('F', x['l'], x['t'], round(x['h']), x['text'][:80])
