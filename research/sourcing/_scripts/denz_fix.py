"""Denzinger 1911 OCR: repair the systematic confusions (li/ll -> h/H/U, m -> ni/rn) against a Latin word list.
usage: denz_fix.py <_all.json> <catho-latin.txt> <out.json>"""
import json, re, sys, collections, itertools

a = json.load(open(sys.argv[1]))
vocab = collections.Counter()
for w in re.findall(r"[A-Za-zÆæŒœ]+", open(sys.argv[2]).read()):
    vocab[w.lower()] += 1
own = collections.Counter(w.lower() for e in a['entries'] for w in re.findall(r"[A-Za-z]+", e['text']))
for w, c in own.items():
    if c >= 5 and not re.search(r'[HU]', w): vocab[w] += c
RULES = [('h', 'li'), ('h', 'll'), ('h', 'il'), ('h', 'b'), ('u', 'll'), ('ni', 'm'), ('rn', 'm'), ('ii', 'u'), ('ii', 'n'), ('tl', 'ti'), ('cl', 'd'), ('f', 's'), ('Ii', 'li'), ('lI', 'll')]

def variants(w):
    lw = w
    seen = {lw}
    out = []
    for a_, b_ in [(x, y) for x, y in RULES]:
        for m in re.finditer(re.escape(a_), lw):
            out.append(lw[:m.start()] + b_ + lw[m.end():])
    return out

def cand(w):
    # uppercase H/U inside a word stand for li/ll/il/ii
    base = w
    if re.search(r'(?<=[a-z])[HU]|[HU](?=[a-z])', w[1:]) or w[-1:] in 'HU' and len(w) > 2:
        opts = []
        pos = [i for i, c in enumerate(w) if c in 'HU' and i > 0]
        subs = {'H': ['li', 'll', 'il', 'h'], 'U': ['li', 'll', 'il', 'u', 'ii']}
        for combo in itertools.product(*[subs[w[i]] for i in pos]):
            s = list(w)
            for i, r in zip(pos, combo): s[i] = r
            opts.append(''.join(s))
        return opts
    return variants(base) + [x for v in variants(base) for x in variants(v)]

def fix_word(w):
    lw = w.lower()
    if len(w) < 3 or lw in vocab or not w.isalpha():
        if not (len(w) > 2 and re.search(r'(?<=[a-z])[HU]', w)): return w
    best = None
    for c in cand(w):
        cl = c.lower()
        if vocab.get(cl, 0) >= 2 and (best is None or vocab[cl] > vocab[best.lower()]): best = c
    if best is None: return w
    return best[0].upper() + best[1:] if w[0].isupper() else best

def fix(t):
    return re.sub(r"[A-Za-z]+", lambda m: fix_word(m.group(0)), t)

changed = 0
for e in a['entries']:
    n = fix(e['text'])
    if n != e['text']: changed += 1
    e['text'] = n
json.dump(a, open(sys.argv[3], 'w'), ensure_ascii=False)
print('entries changed', changed)
for e in a['entries'][375:383] + a['entries'][2030:2034]: print(e['d'], e['text'][:200])
