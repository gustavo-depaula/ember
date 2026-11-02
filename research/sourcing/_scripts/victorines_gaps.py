"""Report gaps in 'Caput N' numbering inside each toc group of the given book dirs."""
import json, re, sys
def rom(s):
    v = {'I':1,'V':5,'X':10,'L':50,'C':100}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i+1 < len(s) and v[c] < v[s[i+1]] else v[c]
    return t
def walk(nodes, where, out):
    seq = []
    for n in nodes:
        if 'children' in n: walk(n['children'], where + '/' + n['title']['la'][:20], out); continue
        m = re.match(r'Caput ([IVXLC]+|primum)\b', n['title']['la'])
        if m: seq.append(1 if m.group(1) == 'primum' else rom(m.group(1)))
    for a, b in zip(seq, seq[1:]):
        if b != a + 1 and b != a: out.append((where, a, b))
for d in sys.argv[1:]:
    out = []; walk(json.load(open(d + '/book.json'))['toc'], '', out)
    if out: print(d.split('/')[-1], out[:6])
