"""Denzinger 1911: per-page line boxes (pages.pkl) -> main-text lines with D numbers (entries.json).
Main text = lines of body height (footnotes and apparatus are set smaller); D numbers = numeric tokens in the outer margin."""
import pickle, re, sys, json, statistics as st

pages = pickle.load(open(sys.argv[1], 'rb'))
pages = [(W, H, [[(a, b, c, d, t.strip()) for a, b, c, d, t in ws] for ws in lines]) for W, H, lines in pages]
GREEK = re.compile(r'\b(Kai|TTpo|toO|Tou|tou|xou|ouv|TTepi|ctuv|ouk|T6v|b[eé]|ev|Tf\||KaTa|eic;|Tqv|Tiqv|auTou|auTO)\b|\|Li|\bK\^|[a-z]{1,3}[A-Z]{2,}|[A-Z]{2,}[a-z]{2,}[A-Z]')

def info(ws):
    return dict(x0=min(w[0] for w in ws), x1=max(w[2] for w in ws), y=ws[0][3], h=st.median(w[1] - w[3] for w in ws),
                txt=' '.join(w[4] for w in ws), ws=ws)

def is_greek(t):
    toks = t.split()
    if len(toks) < 2: return False
    bad = sum(1 for k in toks if GREEK.search(k))
    sym = sum(t.count(c) for c in '<>^|~{}®©§')
    return bad / len(toks) > 0.22 or sym > 1

def start_end():
    return 33, 633

s, e = start_end()
print('pages', s, e, file=sys.stderr)
out = []
for pn in range(s, e):
    W, H, lines = pages[pn]
    L = [info(ws) for ws in lines]
    main = [l for l in L if l['h'] >= 47.5]
    if not main: continue
    # Latin text block edges: most common x0 of main lines
    xs = sorted(l['x0'] for l in main if len(l['txt']) > 12)
    if not xs: continue
    left = st.median(xs[:max(3, len(xs) // 2)])
    rights = sorted(l['x1'] for l in main if len(l['txt']) > 25)
    right = st.median(rights[len(rights) // 2:]) if rights else W
    # two-column page: Greek on the right
    twocol = any(l['x0'] > W * 0.55 for l in main) and any(l['x1'] < W * 0.62 for l in main)
    for l in main:
        t = l['txt']
        if twocol and l['x0'] > W * 0.55: continue
        if is_greek(t): continue
        ws = l['ws']
        cands = []
        if re.fullmatch(r'\d{1,4}', ws[0][4]) and len(ws) > 1: cands.append(('L', int(ws[0][4])))
        if len(ws) > 1 and re.fullmatch(r'\d{1,4}', ws[-1][4]): cands.append(('R', int(ws[-1][4])))
        if len(ws) > 1:
            m = re.match(r'^.*[^\d\s](\d{3,4})$', ws[-1][4])
            if m: cands.append(('F', int(m.group(1))))
        out.append(dict(p=pn, y=l['y'], x0=l['x0'], left=left, cands=cands, ws=[(w[0], w[2], w[4]) for w in ws]))
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
print(len(out), 'lines', file=sys.stderr)
