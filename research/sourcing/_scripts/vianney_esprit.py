import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from ocr_clean import *
RAW = '/Users/gustavo/Documents/prayer/research/sourcing/cure-of-ars/raw/'
ROOT = '/Users/gustavo/Documents/prayer/content/books/cure-of-ars-opera-omnia/esprit/en-US/'
os.makedirs(ROOT, exist_ok=True)
O = open(RAW + 'en-spirit1865.txt', encoding='utf8').read().split('\n')
W = [l.rstrip() for l in open(RAW + 'ewtn.txt', encoding='utf8').read().split('\n')]
def head(t):
    t = t.strip()
    if len(t) > 60: return False
    if re.search(r'by Google|Digitized', t, re.I): return True
    if re.search(r'S[PFI][A-Z]{1,4}\s+O[A-Z]\s+T[A-Z]{1,2}\s+\S{0,4}[CGO]\S{1,3}\s+O[FP]\s+\S{2,4}', t): return True
    if re.fullmatch(r'[\d\s.,Il|]{1,6}', t): return True
    return False
def ocr(a, b, title, cid):
    paras, notes = clean(O[a - 1:b], [head], 'sym')
    paras = [re.sub(r'\s+', ' ', p) for p in paras if len(p) > 2]
    paras = [p for p in paras if re.sub(r'\W+', '', p).lower() != re.sub(r'\W+', '', title).lower()]
    txt = render(title, paras, notes)
    open(ROOT + cid + '.md', 'w').write(txt); return len(txt.split())
# EWTN chapters
idx = [(i, l) for i, l in enumerate(W) if re.match(r'^(CHAPTER \d+ ?: ?|PART II)', l)]
chap = {}
part = 1; order = []
for k, (i, l) in enumerate(idx):
    if i < 60: continue
    if l.startswith('PART II'): part = 2; continue
    n = int(re.match(r'CHAPTER (\d+)', l).group(1))
    j = idx[k + 1][0] if k + 1 < len(idx) else len(W)
    body = [x.strip() for x in W[i + 1:j] if x.strip()]
    chap[(part, n)] = (re.sub(r'^CHAPTER \d+ ?: ?', '', l).strip(), body)
first = next(i for i, l in enumerate(W) if i > 60 and len(l) > 200)
firstch = next(i for i, l in idx if i > 60)
intro = [x.strip() for x in W[first:firstch] if x.strip()]
def ew(title, body, cid):
    txt = '# %s\n\n%s\n' % (title, '\n\n'.join(body))
    open(ROOT + cid + '.md', 'w').write(txt); return len(txt.split())
T1 = ["Catechism on Salvation","Catechism on the Love of God","Catechism on the Prerogatives of the Pure Soul","Catechism on the Holy Spirit","Catechism on the Blessed Virgin","Catechism on the Sanctification of Sunday","Catechism on the Word of God","Catechism on Prayer","Catechism on the Priesthood","Catechism on the Holy Sacrifice of the Mass","Catechism on the Real Presence","Catechism on Communion","Catechism on Frequent Communion","Catechism on Sin","On the Same Subject","Catechism on Pride","Catechism on Impurity","Catechism on Confession","Catechism on the Cardinal Virtues","Catechism on Hope","Catechism on Suffering"]
E1 = {1:1,2:2,3:6,4:3,5:4,6:7,7:5,8:8,9:9,10:10,11:11,12:12,13:13,14:14,16:15,17:16,18:17,19:20,20:19,21:18}
T4 = ["On Salvation","On Death","On the Last Judgment","On Sin","On Temptations","On Pride","On Avarice","On Luxury","On Envy","On Gluttony","On Anger","On Sloth","On Grace","On Habitual Grace","On Prayer","On the Love of God","On Paradise"]
E4 = {i: i for i in range(1, 14)}; E4.update({15: 14, 16: 15, 17: 16})
E4 = {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,15:14,16:15,17:16}
E4 = {k: v for k, v in E4.items()}
# Part IV EWTN has 16 chapters: Salvation..Grace(13), Prayer(14), Love of God(15), Paradise(16) -> Bowden 1-13, 15, 16, 17
E4 = {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,15:14,16:15,17:16}
tot = 0
tot += ocr(50, 194, 'Preface', 'preface')
tot += ew('The Curé of Ars in His Catechisms', intro, 'p1-00')
for n in range(1, 22):
    cid = 'p1-%02d' % n
    if n in E1: t, body = chap[(1, E1[n])]; tot += ew(T1[n - 1], body, cid)
    else: tot += ocr(4076, 4244, T1[n - 1], cid)
tot += ocr(5253, 5498, 'The Curé of Ars in His Homilies', 'p2-00')
H = [(5499, 5564, 'Homily on the Parable of the Cockle'), (5565, 5665, 'Homily on the Parable of the Labourers'), (5666, 5930, 'Homily on the Gospel for the First Sunday in Lent'), (5931, 6158, 'Homily on the Gospel for the Twenty-first Sunday after Pentecost'), (6159, 6344, 'Homily for the Last Sunday in the Year')]
for k, (a, b, t) in enumerate(H, 1): tot += ocr(a, b, t, 'p2-%02d' % k)
C = [(6350, 7257, 'The Curé of Ars in His Conversation'), (7258, 7354, 'Faith of M. Vianney'), (7355, 7527, 'Hope of M. Vianney'), (7528, 7773, 'Charity of M. Vianney'), (7774, 8063, 'Thoughts of M. Vianney on the Joys of the Interior Life'), (8064, 8279, 'Zeal of M. Vianney'), (8280, 8406, 'Love of M. Vianney for the Poor'), (8407, 8637, 'Humility of M. Vianney'), (8638, 8758, 'Thoughts of M. Vianney on Self-Denial and Suffering'), (8759, 8937, 'How M. Vianney Spoke of the Saints')]
for k, (a, b, t) in enumerate(C, 1): tot += ocr(a, b, t, 'p3-%02d' % k)
for n in range(1, 18):
    cid = 'p4-%02d' % n
    if n in E4: t, body = chap[(2, E4[n])]; tot += ew(T4[n - 1], body, cid)
    else: tot += ocr(10692, 10825, T4[n - 1], cid)
print(tot, sorted(chap)[:3], len(chap), len(intro))
