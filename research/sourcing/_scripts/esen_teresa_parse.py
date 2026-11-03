"""Stanbrook Letters of St. Teresa (IA djvu OCR) -> letters.json (num, date, heading, summary, paras)."""
import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
import en_common as E
def rom(s):
    s = s.strip(' .').replace('l', 'I').replace('1', 'I').replace('!', 'I').replace('i', 'I').replace('|', 'I').upper()
    if not re.fullmatch(r'[IVXLC]{1,9}', s): return None
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}; t = 0
    for i, c in enumerate(s): t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t
PAGENUM = re.compile(r'\s{2,}[\dilIrtsSo\.,]{1,5}\s*$|^\s*\d+\s{2,}')
def is_to(l): return re.match(r'^\s*TO\s+[A-ZÑÁÉÍÓÚ]', l) and not PAGENUM.search(l)
DATE = re.compile(r'(1\s?[5]\s?[5-8]\s?\d|uncertain|Unknown|\?|\b15\d\d)')
def parse(path, first_num):
    L = open(path, errors='replace').read().replace('\x0c', '').split('\n')
    nb = [i for i, l in enumerate(L) if l.strip()]
    starts = []  # (line index of block start, line index of TO)
    exp = first_num
    for k, i in enumerate(nb):
        s = L[i].strip()
        r = rom(s) if len(s) <= 9 else None
        if r and exp <= r < exp + 4:
            for j in nb[k + 1:k + 6]:
                if is_to(L[j]) or re.match(r'^\s*(FROM|LETTER)', L[j]): starts.append((i, j, r)); exp = r + 1; break
                if len(L[j]) > 100: break
            else:
                if k + 2 < len(nb) and DATE.search(L[nb[k + 1]]) and len(L[nb[k + 1]]) < 90 and re.match(r'^[A-Z][a-zñéáó]+', L[nb[k + 1]].strip()):
                    starts.append((i, nb[k + 2], r)); exp = r + 1
    got = {s[1] for s in starts}
    # date+TO headings that the numeral pass missed
    extra = []
    for k, i in enumerate(nb):
        if is_to(L[i]) and i not in got and k >= 2:
            prev = L[nb[k - 1]]
            if DATE.search(prev) and len(prev) < 90 and not any(s[0] <= nb[k - 1] <= s[1] for s in starts): extra.append((nb[k - 1], i, None))
    allst = sorted(starts + extra)
    return L, allst, extra

FNVOC = re.compile(r"(Fuente|Life|Found|Way|Letter|ch\.|Ibid|See |Cf\.|Obras|Rel\.|Sp\.|Bishop|Prior|born|died|Father|Fr\.|convent|Carmel|Mother|Sister|Note|Hist|Vol)")
FNMARK = re.compile(r"""^\s*([\^\*°†‡]|['"’‘]{1,2}|\d{1,2}\s)\s*[A-Z(\[\d]""")
def is_fn(b):
    t = ' '.join(b)
    m = FNMARK.match(t)
    if not m: return False
    return m.group(1)[0] in '^*°†‡' or m.group(1)[0].isdigit() or bool(FNVOC.search(t[:200]))
def is_rh(b):
    t = ' '.join(b).strip()
    if len(b) > 2 or len(t) > 90: return False
    if re.search(r"TERESA'?S\s+LETTERS|TERESA['’]S\s+LETTERS|ST\.\s+TERESA", t) and re.search(r'\d', t) : return True
    if re.fullmatch(r'[\dIil|lrtsoO\.]{1,5}', t): return True
    if re.match(r'^(TO|FROM|LETTER)\b', t) and PAGENUM.search(t): return True
    if re.match(r"^\d+\s+[A-Z][A-Z\s'.,]+$", t): return True
    return False
def clean_par(p):
    p = re.sub(r'\^\d*', '', p).replace('*', '')
    p = re.sub(r'\s+', ' ', p).strip()
    return p
def body(lines):
    blocks = []; cur = []
    for l in lines:
        if l.strip(): cur.append(l)
        elif cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    out = []; dropfn = False
    for b in blocks:
        if is_rh(b): dropfn = False; continue
        if dropfn: continue
        if is_fn(b): dropfn = True; continue
        if re.match(r'^\s*(LETTER|FROM)\s+(OF|FROM)?\s*[A-Z]', b[0]) and b[0].strip() == b[0].strip().upper() and not PAGENUM.search(b[0]): break
        t = E.join_lines(b); t = clean_par(t)
        if t: out.append(t)
    res = []
    for p in out:
        if res and not re.search(r'[.!?:;"”’\')\]]\s*$', res[-1]) and p[:1].islower(): res[-1] = E.join_lines([res[-1], p])
        else: res.append(p)
    return res
def letters(path, first_num, end_re=r'^\s*(END\s+OF|APPENDIX\s*$)'):
    L, st, extra = parse(path, first_num)
    endl = next((i for i, l in enumerate(L) if i > st[-1][1] and re.match(end_re, l)), len(L))
    out = []
    for k, (a, b, n) in enumerate(st):
        e = st[k + 1][0] if k + 1 < len(st) else endl
        nb = [i for i in range(a, b) if L[i].strip()]
        date = clean_par(L[nb[-1]]) if nb and nb[-1] != a or (nb and n is None) else ''
        if n is not None and len(nb) >= 2: date = clean_par(L[nb[-1]])
        i = b; hd = []
        while is_to(L[b]) and i < e and L[i].strip():
            u = re.sub(r'[^A-Za-z]', '', L[i])
            if hd and (not u or sum(c.isupper() for c in u) < 0.8 * len(u)): break
            hd.append(L[i]); i += 1
        heading = clean_par(' '.join(hd)) if hd else ''
        rest = body(L[i:e])
        rest = [p for p in rest if not re.search(r"\b(Fuente|Obras de|Introd\.|(Found|Life|Way|Castle)\.?,? (ch|Bk)\.)", p)]
        summ = ''
        if rest and len(rest[0]) < 420 and not rest[0].startswith('JESUS') and len(rest) > 1: summ = rest.pop(0)
        out.append({'num': n, 'date': date, 'heading': heading, 'summary': summ, 'paras': rest})
    return out
if __name__ == '__main__' and len(sys.argv) > 3:
    json.dump(letters(sys.argv[1], int(sys.argv[2])), open(sys.argv[3], 'w'), ensure_ascii=False, indent=1)
