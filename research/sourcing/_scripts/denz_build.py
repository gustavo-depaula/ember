"""Denzinger 1911: lines.json (denz_extract.py) + the printed Index chronologicus -> chapters of D-numbered entries.
usage: denz_build.py <lines.json> <d1911.txt> <out-dir>"""
import json, re, sys, pathlib

lines = json.load(open(sys.argv[1]))
raw = open(sys.argv[2]).read().split('\n')
out = pathlib.Path(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)

# 1. entry starts: longest monotone chain of number candidates
C = []
for i, x in enumerate(lines):
    for k, n in x['cands']:
        if 1 <= n <= 2150: C.append((i, n, k))
n = len(C); best = [1] * n; prev = [-1] * n
for j in range(n):
    lj, nj, kj = C[j]
    for k in range(j - 1, max(-1, j - 400), -1):
        lk, nk, kk = C[k]
        if lk < lj and 1 <= nj - nk <= 14 and best[k] + 1 - 0.02 * (nj - nk - 1) > best[j] - 0:
            sc = best[k] + 1
            if sc > best[j]: best[j] = sc; prev[j] = k
j = max(range(n), key=lambda x: best[x]); chain = []
while j != -1: chain.append(C[j]); j = prev[j]
chain.reverse()
have = {c[1] for c in chain}
print('chain', len(chain), 'first', chain[0], 'last', chain[-1], 'missing', len([k for k in range(chain[0][1], chain[-1][1] + 1) if k not in have]), file=sys.stderr)

# 2. entry text
def strip_ws(x, kind=None, num=None):
    ws = [w for w in x['ws']]
    toks = [w[2] for w in ws]
    if kind == 'L': toks = toks[1:]
    elif kind == 'R': toks = toks[:-1]
    elif kind == 'F': toks[-1] = re.sub(r'\d{3,4}$', '', toks[-1])
    return ' '.join(t for t in toks if t)

right_of = {}
def clean_line(x):
    t = ' '.join(w[2] for w in x['ws'])
    return t
starts = {c[0]: c for c in chain}
entries = []
cur = None
for i, x in enumerate(lines):
    if i in starts:
        _, num, kind = starts[i]
        cur = {'d': num, 'p': x['p'], 'lines': [strip_ws(x, kind, num)]}
        entries.append(cur)
    elif cur is not None:
        # trailing marginal cross-reference numbers sit beyond the text block
        toks = [w for w in x['ws']]
        while len(toks) > 1 and re.fullmatch(r'\(?[\d*^]{1,5}\)?|[\^\d]+', toks[-1][2]) and toks[-1][0] > x['left'] + 1700 - 0 and False:
            toks.pop()
        cur['lines'].append(' '.join(w[2] for w in toks))
    # page header lines (running heads) were already excluded by height or kept; drop by pattern below
JUNK = re.compile(r'^\s*(\d{1,3}\s+)?[A-Za-z\.\s\(\)]{0,50}\b\d{3,4}\s*[—–\-]+\s*\d{3,4}.*$')
def finish(e):
    ls = [l for l in e['lines'] if l.strip() and not (JUNK.match(l) and len(l) < 120)]
    t = ''
    for l in ls:
        l = re.sub(r'^\(\s*[\d*^a-zA-Z]{1,4}\s*\)\s*', '', l) if not t else l
        l = re.sub(r'^\(\s*\d{1,4}\s*\)\s+(?=[A-Za-zÀ-ÿ])', '', l) if t == '' else l
        if t.endswith('-') and l[:1].islower(): t = t[:-1] + l
        else: t = (t + ' ' + l) if t else l
    t = re.sub(r'\s+', ' ', t).strip()
    return t
for e in entries: e['text'] = finish(e)

# 3. groups from the printed Index chronologicus
sg = next(i for i, l in enumerate(raw) if re.search(r'Index\s+siglorum', l))
seg = raw[472 - 5:sg]
groups = []
pending = None
for l in seg:
    l = re.sub(r'\s+', ' ', l).strip()
    l = re.sub(r'^(Num\.\s*)', '', l); l = re.sub(r'\s*Pag\.?-?\s*$', '', l)
    m = re.match(r'^(\d{1,4})(?: sqq?)?\s', l)
    if m:
        if pending is not None:
            groups.append((int(m.group(1)), pending)); pending = None
    elif re.search(r'\b[1-9]\d{2}\s*[—–\-]+\s*[1-9]\d{2,3}\b|\(oec|Conc\. [A-Z]{4}|Symbol', l) and 4 < len(l) < 95 and not re.search(r'Index\s+chron', l):
        pending = (pending + ' / ' + l) if pending else l
    elif l.startswith('(S. ') and pending is None: pending = l
json.dump({'groups': groups, 'entries': [{'d': e['d'], 'p': e['p'], 'text': e['text']} for e in entries]}, open(sys.argv[3] + '/_all.json', 'w'), ensure_ascii=False)
print('groups', len(groups), groups[:6], file=sys.stderr)
