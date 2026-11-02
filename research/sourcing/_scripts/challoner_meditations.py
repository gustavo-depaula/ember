"""Split Challoner's Meditations (IA ConsiderationsUponChristianTruths, 1874) into day chapters.
usage: challoner_meditations.py <djvu.txt> <outdir>   (writes en-US/*.md and toc.json)"""
import re, sys, json
from pathlib import Path
src, out = sys.argv[1], Path(sys.argv[2])
L = open(src, encoding='utf8').read().split('\n')
MON = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
MONN = ['January','February','March','April','May','June','July','August','September','October','November','December']
def up(s):
    a = [c for c in s if c.isalpha()]
    return len(a) >= 3 and sum(c.isupper() for c in a)/len(a) > .7
FURN = re.compile(r"^\W*(\d+\s+)?(Digitized|Google|M[EK]DITATIONS?\s+(FO[RKB]|TO|TOR)|EVER[YT]\s+DA[YT]\s+IN\s+THE\s+YEA?R|VOL\.?\s+I+|\d{1,3})\W*(\d+\W*)?\s*$", re.I)
import difflib
def furn(s):
    t = s.strip()
    if FURN.match(t) or t.startswith('Digitized'): return True
    a = re.sub(r'[^A-Za-z]', '', t).upper()
    if 8 <= len(a) <= 22 and len(t) < 45:
        for ref in ('MEDITATIONSFOR', 'EVERYDAYINTHEYEAR', 'MEDITATIONSFOREVERYDAYINTHEYEAR'):
            if difflib.SequenceMatcher(None, a, ref).ratio() > .75: return True
    return False
def monlabel(s):
    m = re.match(r"^\W{0,2}(J[A-Z]{2}[A-Z1'|-]{1,6}|[A-Z][A-Za-z1|]{2,8})\W{0,4}\s*(\S{0,4})\.?\s*$", s.strip())
    if not m: return None
    w = re.sub(r'[^A-Z]', '', m.group(1).upper().replace('1','L').replace('|','I'))
    w = w.replace('UART','UARY')
    for i, full in enumerate(MONN):
        if w == full.upper(): return i, m.group(2)
    return None
cons = re.compile(r"^\W{0,2}\w{0,3}C\S{3,8}[,.]?\s+(first|firs\S|fi\S{1,3}t|6rst|flrst|Tst)\b|^\W{0,2}C\S{3,8}\s+the havoc")
starts = {}  # label line idx -> (kind)
st = [i for i, l in enumerate(L) if re.match(r"^\s*\S{0,3}C\S{3,8},?\s+first", l) and 'ons' in l[:16].lower().replace('  ', '')]
st = set(i for i, l in enumerate(L) if re.match(r"^\s*C\S{3,8},?\s+first", l))
labels = []
for i, l in enumerate(L):
    s = l.strip()
    if monlabel(s) and not furn(s):
        labels.append(i)
# movable labels: uppercase run before a Consider-first
for i in sorted(st):
    p = [j for j in range(i-1, max(i-14, 0), -1) if L[j].strip() and not furn(L[j])][:4]
    k = next((j for j in p if up(L[j].strip()) and len(L[j].strip()) < 70), None)
    if k is None: raise SystemExit(f'no label for {i}')
    labels.append(k)
labels.append(next(i for i, l in enumerate(L) if l.strip().startswith('WEDNESDAY  AFTER  TRINITY')))
labels = sorted(set(labels))
# drop labels that are a title line inside 5 lines after a previous label
clean = []
for k in labels:
    if clean and k - clean[-1] < 5 and not monlabel(L[k]): continue
    if clean and k - clean[-1] < 5: continue
    clean.append(k)
def prevnb(k, maxgap=3):
    j = k-1
    while j > 0 and k-j <= maxgap and (not L[j].strip() or furn(L[j])): j -= 1
    return j if L[j].strip() and not furn(L[j]) else None
def isup(j): return up(L[j].strip()) and len(L[j].strip()) < 70 and not monlabel(L[j])
heads = []
for k in clean:
    if monlabel(L[k]):
        lab = [L[k].strip()]; j = k+1; ks = k
    else:
        ks = k
        while True:
            p = prevnb(ks)
            if p is not None and isup(p) and (not heads or p > heads[-1]['label_end']): ks = p
            else: break
        lab = []; j = ks
        while j < len(L):
            if not L[j].strip() or furn(L[j]): j += 1; continue
            if isup(j) and not (lab and cons.match(L[j].strip())): lab.append(L[j].strip()); j += 1
            else: break
    # title: lines up to the first "Consider, first" line
    while not L[j].strip() or furn(L[j]): j += 1
    t = []
    while not re.match(r"^\W{0,3}\w{0,3}C\S{3,10}[,.]?\s+(first|fir\S+|fi\S{1,3}t|6rst|flrst|Tst|the havoc)", L[j].strip()) and len(t) < 4:
        if furn(L[j]) or not L[j].strip(): j += 1; continue
        t.append(L[j].strip()); j += 1
        if re.search(r"[.,;:?!)\u201d'\"]\W*$", t[-1]) and not re.match(r"^\s*For\s+the", next((L[q] for q in range(j, min(j+4, len(L))) if L[q].strip()), "")): break
    heads.append(dict(start=ks, label=' '.join(lab), title=' '.join(t), body=j, label_end=j))
# end of document, part 1
end1 = next(i for i, l in enumerate(L) if re.search(r"TH[EX]\s+END\s+(OF|or)\s+THE\s+FIRST\s+PART", l))
endall = max(i for i, l in enumerate(L) if l.strip().startswith('CONTENTS') and i < 36000 and i > 35000)
def clean_text(s):
    s = re.sub(r'\s+', ' ', s).strip()
    return s
OUT = []
for n, h in enumerate(heads):
    e = heads[n+1]['start'] if n+1 < len(heads) else endall
    if h['start'] < end1 < e: e = end1
    paras = []; cur = []; pagebreak = False; gap = False
    for i in range(h['body'], e):
        s = L[i].strip()
        if not s:
            gap = True; continue
        if furn(s):
            pagebreak = True; continue
        newp = bool(re.match(r"^\W{0,3}\w{0,3}C\S{3,8}[,.]?\s+(first|secondly|thirdly|secondly|thir\S+|seco\S+|fir\S+|the havoc)\b|^Conclu|^C[o0]n\S{4,8}\s+(to|that|with|upon|if|never|ever|by|sinc|O|my|thy)\b", s)) \
               or (gap and not pagebreak and cur and re.search(r"[.!?”]\W*$", cur[-1]))
        if newp and cur:
            paras.append(' '.join(cur)); cur = []
        cur.append(s); gap = False; pagebreak = False
    if cur: paras.append(' '.join(cur))
    # join hyphenation
    paras = [re.sub(r'(\w)- (\w)', r'\1\2', re.sub(r'\s+', ' ', p)) for p in paras]
    OUT.append((h, paras))
import pickle
pickle.dump(OUT, open(out/'parsed.pkl', 'wb'))
print(len(OUT))
