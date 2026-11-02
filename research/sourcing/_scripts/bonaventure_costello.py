"""Costello's Holiness of Life (1923) beside the Latin De perfectione vitae ad sorores. usage: python3 -I bonaventure_costello.py [go]"""
import re, sys, json, statistics
sys.path.insert(0, 'research/sourcing/_scripts')
from bonaventure_common import *

L = open('research/sourcing/bonaventure/en/holinessoflife00costuoft.txt', errors='replace').read().split('\n')
FN = re.compile(r"^[\d«»'\"*a-z]{1,2}\s?(Cf\.|See |Ps\.|Matt|Luke|Mark|John|Rom|Cor|Eph|Gal|Heb|Jas|Prov|Eccl|Is\.|Isa|Jer|Job|Wis|Sir|Gen|Ex|Deut|Apoc|Acts|S\. |St\. |Ibid|Op\.|Serm|Ser'n|De |Ep\.|Hugh|Bonav|Lk|Mt|1 Th|2 Th|1 Pet|Col|Phil|Tit|Tim|Jn|Mich|Zach|Dan|Hos|Mal|Wisd|Eccles|Cant|Lev|Num|Kings|Judg|Tob|Esth|Jud|Macc|Bernard|Greg|Aug|Ambr|Hier|Chrys)")
HEAD = re.compile(r"^(\d+\s+)?(Holiness o[fr.]? ?Li[^ ]*|Preface|Index|Foreword|Contents)\s*(\d+|[ivxlc]+)?\s*[.,]?$|^\s*(\d+|[ivxlcIVXLC]+)\s*$|^(z|I|1|2)\s+Holiness|^Pre\[ace|^[A-Z][A-Za-z ,'-]{3,40}\s+[ivxlc]+$", re.I)

def prose(lo, hi):
    ls = [l.rstrip() for l in L[lo:hi]]
    out = []
    for l in ls:
        s = l.strip()
        if not s: continue
        if HEAD.match(s) and len(s) < 40: continue
        if FN.match(s) and len(s) < 120: continue
        out.append(s)
    med = statistics.median(len(x) for x in out)
    paras = [[]]
    for i, s in enumerate(out):
        paras[-1].append(s)
        if len(s) < 0.72 * med and re.search(r'[.!?"”:]$', s) and i + 1 < len(out): paras.append([])
    txt = ['%s' % join_lines(p) for p in paras if p]
    return [x for x in (tidy(re.sub(r'\s+', ' ', t.replace('hOt', 'not'))) for t in txt) if x]

try: WORDS = set(w.strip().lower() for w in open('/usr/share/dict/words'))
except OSError: WORDS = set()
def tidy(t):
    t = re.sub(r'\b\d{1,3}\s+Holiness\s+o\S*\s+Li\S*', '', t)
    t = re.sub(r'\bHoliness\s+o\S*\s+Li\S*\s+\d{1,3}\b', '', t)
    t = re.sub(r'\b(True|Perfect|Silence|The|Prayer|Memory|Final)\s+[A-Za-z\[\]-]+(\s+[A-Za-z\[\]-]+)?\s+\d{1,3}\b(?=\s+[a-z])', '', t) if False else t
    if re.match(r'^\S{1,5}\s+(Cf\.|S\. |See )', t) and len(t) < 160: return ''
    def fx(m):
        w = m.group(0); lw = w.lower()
        if WORDS and lw not in WORDS:
            for a, b in (('rn', 'm'), ('b', 'h'), ('ii', 'u'), ('tl', 'th'), ('cl', 'd')):
                if a in lw:
                    c = lw.replace(a, b)
                    if c in WORDS: return c.capitalize() if w[0].isupper() else c
        return w
    return re.sub(r"[A-Za-z]{4,}", fx, t)

idx = [i for i, l in enumerate(L) if re.match(r'^CHAPTER [IVX]+\s*$', l.strip())]
end = next(i for i, l in enumerate(L) if i > idx[-1] and l.strip().startswith('INDEX'))
pro_lo = next(i for i, l in enumerate(L) if i > 60 and l.strip().startswith('PREFACE'))
pro_hi = next(i for i, l in enumerate(L) if i > pro_lo and l.strip().startswith('FOREWORD'))
files = {'prologus': '# Prologue\n\n' + '\n\n'.join(prose(pro_lo + 1, pro_hi))}
TIT = ['True self-knowledge', 'True humility', 'Perfect poverty', 'Silence and discretion of speech', 'The practice of prayer', 'The memory of Christ’s Passion', 'Perfect love of God', 'Final perseverance']
toc = [('prologus', {'la': 'Prologus', 'en-US': 'Prologue'})]
la = json.load(open('content/books/bonaventure-opera-omnia/de-perfectione-vitae-ad-sorores/book.json'))
latit = {t['id']: t['title']['la'] for t in la['toc']}
for n, a in enumerate(idx):
    b = idx[n + 1] if n + 1 < len(idx) else end
    k = a + 1
    while not L[k].strip(): k += 1
    title_lines = []
    while L[k].strip(): title_lines.append(L[k].strip()); k += 1
    cid = 'c%02d' % (n + 1)
    t = 'Chapter %s. %s' % (roman(n + 1), TIT[n])
    files[cid] = '# %s\n\n' % t + '\n\n'.join(prose(k, b))
    toc.append((cid, {'la': latit.get(cid, 'Caput %s' % roman(n + 1)), 'en-US': t}))
print({k: len(v.split()) for k, v in files.items()}, [ (c, latit.get(c)) for c in ['c01','c08']])
if len(sys.argv) > 1:
    la['languages'] = ['la', 'en-US']
    la['editions']['en-US'] = {'translator': 'Laurence Costello', 'year': 1923}
    la['sources'].append(src('en-US', 'https://archive.org/details/holinessoflife00costuoft', 'Holiness of Life: De perfectione vitae ad sorores, by St. Bonaventure, translated by Laurence Costello, with a foreword by John McIntyre and an editor’s introduction (St. Louis and London: B. Herder, 1923).', 'The translation only (prologue and eight chapters); the foreword, introduction and index are left out. Paragraph breaks are rebuilt from the short last lines of the OCR, so some are missing or misplaced, and a few stray page heads and note fragments may remain.', 'A', 'Published in 1923, before 1931: public domain in the US.'))
    toc_en = {c: x['en-US'] for c, x in [(c, d) for c, d in [(t[0], t[1]) for t in toc]]}
    for t in la['toc']: t['title']['en-US'] = toc_en[t['id']]
    root = 'content/books/bonaventure-opera-omnia/de-perfectione-vitae-ad-sorores'
    for cid, text in files.items(): write('%s/en-US/%s.md' % (root, cid), text + '\n')
    la['description']['en-US'] = la['description']['en-US'].replace('The Latin is the Quaracchi text', 'The English is Laurence Costello’s 1923 translation (Holiness of Life), which follows the chapters. The Latin is the Quaracchi text')
    book_json(root, la)
