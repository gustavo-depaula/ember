"""Find translator's notes the page parser left in the body (their lines are in smaller type at the page foot),
cut them out of the en-US chapters and make them footnotes, the marker placed where the note text stood."""
import sys, re, glob, json
sys.argv = ['x']
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import bernard_cantica_mm as M
from en_common import join_lines
D = M.BOOK + '/en-US/'
leaks = []
for v in ('01', '02'):
    for pi, p in enumerate(M.pages(M.COORDS % v)):
        ls = [l for par in p for l in par]
        if len(ls) < 8:
            continue
        hs = sorted(l['h'] for l in ls)
        H = hs[int(0.7 * (len(hs) - 1))]
        small = [l['h'] < 0.82 * H for l in ls]
        k = None
        i = len(ls) - 1
        while i >= 3 and (small[i] or (small[i - 1] and i + 1 < len(ls) and small[i + 1])):
            k = i
            i -= 1
        if k is None or len(ls) - k < 2:
            continue
        t = join_lines([l['text'] for l in ls[k:]])
        if M.NOTE1.match(t) or M.NOTEN.match(t):
            t = re.sub(r"^(\*|[tf†‡J§])\s+", '', t)
        leaks.append((v, pi, M.tidy(M.fix_text(t))))
files = {f: open(f).read() for f in glob.glob(D + '*.md')}
def norm(s): return re.sub(r'[^a-z]', '', s.lower())
moved = 0
for v, pi, t in leaks:
    if len(t) < 30:
        continue
    head, tail = norm(t[:60]), norm(t[-40:])
    for f, s in files.items():
        body, _, notes = s.partition('\n[^1]:')
        nb = norm(body)
        a = nb.find(head)
        if a < 0 or nb.find(tail, a) < 0:
            continue
        # map normalised offsets back to the text
        idx = [i for i, ch in enumerate(body) if ch.isalpha()]
        st = idx[a]; en = idx[nb.find(tail, a) + len(tail) - 1] + 1
        while en < len(body) and body[en] in '.)"\' ': en += 1
        if en - st > 3000 or '\n#' in body[st:en]:
            continue
        frag = body[st:en].strip()
        # extend start back over a leading marker
        n = len(re.findall(r'^\[\^\d+\]:', s, re.M)) + 1
        body = body[:st].rstrip() + '[^%d] ' % n + body[en:].lstrip()
        s = body + ('\n[^1]:' + notes if notes else '') 
        s = s.rstrip('\n') + '\n\n[^%d]: %s\n' % (n, frag.strip('* '))
        files[f] = s
        moved += 1
        print(f.split('/')[-1], v, pi, len(frag))
        break
for f, s in files.items():
    open(f, 'w').write(s)
print('moved', moved, 'of', len(leaks))
