"""Second pass for notes left in the body: start from each page's '(Translator.)' line and climb while the type is small."""
import sys, re, glob, statistics
sys.argv = ['x']
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import bernard_cantica_mm as M
from en_common import join_lines
D = M.BOOK + '/en-US/'
files = {f: open(f).read() for f in glob.glob(D + 's*.md')}
def norm(s): return re.sub(r'[^a-z]', '', s.lower())
cands = []
for v in ('01', '02'):
    for pi, p in enumerate(M.pages(M.COORDS % v)):
        ls = [l for par in p for l in par]
        if len(ls) < 6: continue
        H = statistics.median(l['h'] for l in ls[1:8])
        for j, l in enumerate(ls):
            if 'ransl' in l['text'] and j > 2:
                k = j
                while k - 1 > 0 and ls[k - 1]['h'] < 0.9 * H and not (M.NOTE1.match(ls[k]['text']) or M.NOTEN.match(ls[k]['text'])):
                    k -= 1
                t = re.sub(r"^(\*|[tf†‡J§+•])\s+", '', join_lines([x['text'] for x in ls[k:j + 1]]))
                cands.append(M.tidy(M.fix_text(t)))
moved = 0
for t in cands:
    if len(t) < 40: continue
    head = norm(t[:50]); 
    for f, s in files.items():
        cut = s.find('\n[^')
        body = s[:cut] if cut > 0 else s
        nb = norm(body); a = nb.find(head)
        if a < 0: continue
        idx = [i for i, ch in enumerate(body) if ch.isalpha()]
        st = idx[a]
        m = re.compile(r'\(?Transl\w*\.?\)?').search(body, st)
        if not m or m.end() - st > 4000: continue
        en = m.end()
        while st > 0 and body[st - 1] in '*+•"\'■ ' and body[st-1] != '\n': st -= 1
        frag = body[st:en].strip(' *+•■')
        n = len(re.findall(r'^\[\^\d+\]:', s, re.M)) + 1
        body2 = body[:st].rstrip() + '[^%d] ' % n + body[en:].lstrip()
        s2 = body2 + (s[cut:] if cut > 0 else '')
        s2 = s2.rstrip('\n') + '\n\n[^%d]: %s\n' % (n, frag)
        files[f] = s2; moved += 1
        print(f.split('/')[-1], len(frag)); break
for f, s in files.items(): open(f, 'w').write(s)
print('moved', moved)
