import re, sys, json
def rom(s):
    v = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    t = 0
    for i, c in enumerate(s):
        n = v[c]
        t += -n if i + 1 < len(s) and v[s[i+1]] > n else n
    return t
HDR = re.compile(r'^\s*\.?\s*([IVXLCDM]{1,12})(?:\s*[-–]?\s*(bis|ter|quater|quinquies))?\s*(?:\([^)]*\))?\s*\.?\s*$')
def upper_ratio(s):
    L = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in L) / len(L) if L else 0
def parse(path, first=1, start_idx=None, app_min=20):
    lines = open(path, encoding='utf-8', errors='replace').read().split('\n')
    start = start_idx if start_idx is not None else next(i for i, l in enumerate(lines) if l.strip() == 'LETTRES')
    out = []; year = None; cur = None
    last = first - 1
    i = start
    while i < len(lines):
        l = lines[i]
        m = HDR.match(l)
        j = i + 1
        while j < len(lines) and not lines[j].strip():
            j += 1
        n = rom(m.group(1)) if m else 0
        if m and j < len(lines) and ((n == last + 1) or (n == last and m.group(2)) or (upper_ratio(lines[j].strip()) > 0.6 and len(lines[j].strip()) > 3 and (last - 1 <= n <= last + 40))):
            if True:
                if cur: out.append(cur)
                cur = {'n': n, 'sfx': m.group(2) or '', 'year': year, 'lines': [], 'num': m.group(1)}
                last = max(last, n)
                i += 1
                continue
        my = re.match(r'^\s*(ANN[EÉ]ES?\s+.*|ANNEES ANTERIEURES.*)$', l)
        if my and not cur is None and upper_ratio(l.strip()) > 0.6:
            year = l.strip()
            if cur: out.append(cur); cur = None
            i += 1; continue
        if my and cur is None:
            year = l.strip()
        if re.match(r'^\s*(TABLE|APPENDICE|GLOSSAIRE|INDEX|TABLE G)\b', l) and upper_ratio(l.strip()) > 0.8 and last > (app_min if l.strip().startswith('APPENDICE') else 20) and cur and len(cur['lines']) > 3:
            out.append(cur); cur = None
            break
        if cur is not None:
            cur['lines'].append(l)
        i += 1
    if cur: out.append(cur)
    return out
if __name__ == '__main__':
    r = parse(sys.argv[1])
    print(len(r), r[0]['n'], r[-1]['n'])
    ns = [x['n'] for x in r]
    print([ (a,b) for a,b in zip(ns,ns[1:]) if b!=a+1][:20])
    print(sum(len(' '.join(x['lines']).split()) for x in r))
    for x in r[:2]+r[-1:]: print(x['num'], x['year'], x['lines'][:3], x['lines'][-3:])
