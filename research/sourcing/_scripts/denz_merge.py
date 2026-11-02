"""Denzinger 1911: take the clean text of catho.org's Latin Denzinger for each D number the 1911 OCR confirms.
usage: denz_merge.py <_fixed.json> <catho-latin.txt> <out.json>"""
import json, re, sys, collections

a = json.load(open(sys.argv[1]))
L = open(sys.argv[2]).read().split('\n')
cat = collections.defaultdict(list)
for l in L[257:]:
    m = re.match(r'^(\d+)\s+(\d+)([a-z]?)\s+(\S.*)$', l)
    if m: cat[int(m.group(2))].append((m.group(3), m.group(1), m.group(4)))
W = lambda t: set(w.lower() for w in re.findall(r'[A-Za-z]{4,}', t))
VOC = set(w.lower() for w in re.findall(r'[A-Za-z]+', ' '.join(L)))
ocr = {e['d']: e for e in a['entries']}
out, stats = [], collections.Counter()
lastp = 0
for d in range(1, 2148):
    cands = cat.get(d, [])
    o = ocr.get(d)
    if o: lastp = o['p']
    if not cands:
        if o and sum(w.lower() in VOC for w in re.findall(r'[A-Za-z]{3,}', o['text'])) > 0.8 * max(1, len(re.findall(r'[A-Za-z]{3,}', o['text']))): out.append(dict(d=d, p=o['p'], text=o['text'], src='ocr')); stats['ocr-only'] += 1
        else: stats['absent-or-garbled'] += 1
        continue
    if cands:
        if len(cands) == 1:
            best = cands[0]; src = 'catho' if o else 'catho-unconfirmed'
            if not o and d < 48: stats['skipped-ambiguous'] += 1; continue
        elif o:
            ow = W(o['text'])
            sc = sorted(((len(ow & W(c[2])) / (len(ow | W(c[2])) or 1), c) for c in cands), key=lambda x: -x[0])
            if sc[0][0] < 0.12: stats['skipped-ambiguous'] += 1; continue
            best = sc[0][1]; src = 'catho'
        else:
            stats['skipped-ambiguous'] += 1; continue
        out.append(dict(d=d, p=(o['p'] if o else lastp), text=best[2], src=src, ds=best[1] + best[0])); stats[src] += 1
json.dump({'entries': out, 'groups': []}, open(sys.argv[3], 'w'), ensure_ascii=False)
print(dict(stats), len(out), sum(len(e['text'].split()) for e in out))
