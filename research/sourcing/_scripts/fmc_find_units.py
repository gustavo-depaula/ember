"""fmc_find_units.py SRC TOC_FROM TOC_TO BODY_FROM : read 'ROMAN. / TITLE' entries from a contents page and
find each title's line in the body; prints JSON units [{id,title,from}] (chapter-N)."""
import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
src, a, b, body = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
L = open(src, encoding='utf8', errors='ignore').read().split('\n')
def capsy(l):
    x = [c for c in l if c.isalpha()]
    return len(x) >= 3 and sum(c.isupper() for c in x) >= 0.8 * len(x)
tit = []
for i in range(a - 1, b):
    l = L[i].strip()
    if re.fullmatch(r'[IVXLCl|1!]{1,6}\.?', l):
        j = i + 1
        while j < b and not L[j].strip(): j += 1
        if capsy(L[j]): tit.append(re.sub(r'[\s.\-\d·]*$', '', re.sub(r'\s+', ' ', re.sub(r'\.\s*\.[\s.]*.*$', '', L[j].strip()))))
key = lambda s: re.sub(r'[^A-Z]', '', s.upper().replace('K', 'C'))
out = []; pos = body
for n, t in enumerate(tit, 1):
    k = key(t)[:14]
    hit = next((i + 1 for i in range(pos - 1, len(L)) if capsy(L[i]) and key(L[i]).startswith(k[:10]) and len(L[i]) < 70), None)
    out.append({'id': 'chapter-%d' % n, 'title': 'Chapter %d. %s' % (n, t), 'from': hit}); pos = hit or pos
print(json.dumps(out, indent=0))
