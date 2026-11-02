import re, sys, json
sys.path.insert(0, '/Users/gustavo/Documents/prayer/research/sourcing/_scripts')
from vocab import unknown
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/philip-neri/raw/'
ROM = 'I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX XX XXI XXII XXIII XXIV XXV XXVI'.split()

def clean(lines, drop):
    out = []
    for l in lines:
        s = re.sub(r'\s+', ' ', l.strip())
        if not s: out.append(''); continue
        if drop(s): continue
        out.append(s)
    # join, dehyphenate
    paras = []; cur = ''
    for s in out:
        if s == '':
            if cur: paras.append(cur); cur = ''
            continue
        if cur.endswith('-') and not cur.endswith(' -') and s[:1].islower():
            cur = cur[:-1] + s
        else:
            cur = (cur + ' ' + s) if cur else s
    if cur: paras.append(cur)
    return paras

def it_letters():
    L = open(RAW + 'lavitadisfilippo01capeuoft.txt').read().split('\n')
    seg = L[18656:19987 + 60]
    res = {}
    idx = [(i, l.strip()) for i, l in enumerate(seg) if re.fullmatch(r'(I{1,3}|IV|V|VI{0,3}|IX|X{1,2}I{0,3}|XIV|XV|XVI{0,3}|XIX|XXIV|XXV|XXVI)\.', l.strip())]
    return seg, idx
if __name__ == '__main__':
    seg, idx = it_letters()
    print([x[1] for x in idx])

def split_letters(L, heads, end):
    out = []
    for k, h in enumerate(heads):
        e = heads[k + 1] if k + 1 < len(heads) else end
        out.append(L[h + 1:e])
    return out

def it_all():
    L = open(RAW + 'lavitadisfilippo01capeuoft.txt').read().split('\n')
    heads = []
    pat = re.compile(r'^(I{1,3}|IL|IV|V|VI{0,3}|IX|X{1,2}I{0,3}|XIV|XV|XVI{0,3}|XIX|XXI?V?I?I?I?)\.\s*$')
    last = 18656
    for n, r in enumerate(ROM):
        found = None
        for i in range(last + 1, 20000):
            s = L[i].strip().replace('IL', 'II') if L[i].strip() == 'IL' else L[i].strip()
            if s == r + '.' or (r == 'II' and s == 'II'):
                found = i; break
            if r == 'XVII' and L[i].strip().startswith('A  Tiberio'):
                found = i - 1; break
        assert found, r
        heads.append(found); last = found
    end = next(i for i in range(heads[-1], 20100) if 'LETTERA  DI  S.' in L[i])
    return split_letters(L, heads, end), L[end:end + 80]

def parse(lines, drop):
    # header block: first non-empty lines until blank after >=2 nonempty
    i = 0
    while not lines[i].strip(): i += 1
    hdr = []
    while lines[i].strip():
        hdr.append(re.sub(r'\s+', ' ', lines[i].strip())); i += 1
    body = clean(lines[i:], drop)
    return hdr, body

def it_drop(s):
    return bool(re.fullmatch(r'([\do]+ +)?Documenti\.?( +\d+)?|[\do]+ +Documenti\.?|Documenti\.? +[\do]+|[\d\s.,:;\'"-]{0,6}', s))

def en_all():
    L = open(RAW + 'lifesaintphilip00baccgoog.txt').read().split('\n')
    heads = []
    for r in ROM:
        key = 'LETTER ' + r
        i = next((i for i in range(13300, 15300) if L[i].strip() == key or (r == 'XXII' and L[i].strip() == 'LETTEK XXII')), None)
        heads.append(i)
    end = next(i for i in range(heads[-1], 15300) if 'SONNETS' in L[i])
    return split_letters(L, heads, end), L[end:end + 120]

def en_drop(s):
    return bool(re.fullmatch(r'[\d\s«».,:;\'"-]{0,6}|LETTERS|OF|SAINT PHILIP NERI|VOL\. II\.|ST\. PHILIP\'?S LETTERS|.{0,3}\d{2,3}.{0,2}', s))
