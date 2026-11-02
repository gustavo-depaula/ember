"""Schroeder 1937 (archive.org schroeder-disciplinary-councils OCR) -> English canon text per council.
usage: councils_schroeder.py <start> <end> <out.md> <title>   (1-based line range of the council's section)
Keeps each canon's Summary (italic) and Text; drops Schroeder's History, Comment and footnotes."""
import re, sys, pathlib

SRC = pathlib.Path(__file__).resolve().parents[1] / 'councils' / 'schroeder1937.txt'
start, end, out, title = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3], sys.argv[4]
lines = SRC.read_text().split('\n')[start - 1:end]

RUN = re.compile(r'^\s*(\d+\s+)?(DECREES OF THE COUNCILS|(FIRST|SECOND|THIRD|FOURTH|FIFTH)?\s*(COUNCIL|LATERAN|LYONS|VIENNE|CONSTANTINOPLE|BASLE|CONSTANCE)[A-Z .,!:]*)\s*[\dIOSl$!]*\s*$', re.I)
def clean_lines(ls):
    o = []
    for l in ls:
        if re.match(r'^\s*\d{3}\s*$', l):  # bare page number
            continue
        if re.match(r'^\s*\d{1,3}\s+DECREES OF THE COUNCILS', l) or re.match(r'^\s*DECREES OF THE COUNCILS\s+\d{1,3}\s*$', l):
            continue
        if re.match(r'^\s*(FIRST|SECOND|THIRD|FOURTH|FIFTH)?\s*(LATERAN COUNCIL|COUNCIL OF [A-Z]+|COUNCIL OF CONSTANTINOPLE)\s*[\dIOSl$!]{2,4}\s*$', l, re.I):
            continue
        o.append(l)
    return o
lines = clean_lines(lines)

def num(s):
    s = s.strip().translate(str.maketrans('OlI', '011')) if not re.fullmatch(r'[IVX]+', s.strip()) else s.strip()
    return s
HEAD = re.compile(r'^\W*(CANON|Canon|CANOX|CANON:)\s+([0-9IOlSoVX]{1,4})\W*$')
SER = re.compile(r'^\s*(FIRST|SECOND|THIRD)\s+SERIES\s*$')
blocks, cur = [], None
for l in lines:
    m, s = HEAD.match(l), SER.match(l)
    if s:
        blocks.append(('series', s.group(1).capitalize() + ' series', [])); cur = None; continue
    if m:
        cur = ['canon', m.group(2), []]; blocks.append(tuple(cur[:2]) + (cur[2],)); cur = blocks[-1][2]; continue
    if cur is not None:
        cur.append(l)

FN = re.compile(r'^[\d*°€‘\'’•]{1,3}\s*[A-Za-z(]')
CITE = re.compile(r'Mansi|Denzinger|Friedberg|Hefele|Cf\.|cf\.|Corpus|Ibid|ibid|Migne|Decretum|Gratian|Bullarium|Potthast|Hardouin|Fournier|Müller|Reg\.', re.I)
def paras(ls):
    ps, p = [], []
    for l in ls:
        if re.match(r'^[\s|*]*(Text|S[a-z]{1,4}ary|Co\w{1,3}ment)[.,]', l) and p:
            ps.append(p); p = []
        if l.strip():
            p.append(l.strip())
        elif p:
            ps.append(p); p = []
    if p: ps.append(p)
    return ps
FNP = re.compile(r'^[^\w]{0,3}\w{0,2}\s?\d{0,3}\s*[A-Za-z(]')
def is_fn(p):
    first = ' '.join(p[:2])
    return bool(re.match(r'^[^\w]{0,3}[\dzlIi]{1,3}[.,]?\s+\S', p[0]) and CITE.search(first[:140]))
def merge(ps):
    ps = [p for p in ps if not (is_fn(p) and not re.match(r'^[|\s]*(Text|S[a-z]{1,4}ary|Co\w{1,3}ment)[.,]', p[0]))]
    o = []
    for p in ps:
        if o and not re.match(r'^(Text|S[a-z]{1,4}ary|Co\w{1,3}ment)[.,]', p[0]) and (o[-1][-1].endswith('-') or (not re.search(r'[.;:?!"”’)\]|]\s*$', o[-1][-1]) and p[0][:1].islower())):
            o[-1] = o[-1] + p
        else:
            o.append(p)
    return o
def join(p):
    t = ''
    for l in p:
        if t.endswith('-') and l[:1].islower():
            t = t[:-1] + l
        else:
            t += (' ' if t else '') + l
    return re.sub(r'\s+', ' ', t).strip()

res = [f'# {title}\n']
n = 0
def emit(summ, text):
    global n
    res.append(f'### Canon {n}\n')
    if summ: res.append('*' + ' '.join(summ) + '*\n')
    res.append('\n\n'.join(text) + '\n')
def conv(lab):
    v = lab.translate(str.maketrans('OlSo', '0150')) if not re.fullmatch(r'[IVX]+', lab) else lab
    v = {'I':1,'II':2,'III':3,'IV':4,'V':5,'VI':6,'VII':7,'VIII':8,'IX':9,'X':10,'XI':11,'XII':12}.get(v, v)
    try: return int(v)
    except Exception: return None
for kind, lab, body in blocks:
    if kind == 'series':
        res.append(f'## {lab}\n'); n = 0; continue
    v = conv(lab)
    if v == 1 and n > 1:
        res.append('## Further decrees\n'); n = 0
    n = v if v and v > n else n + 1
    summ, text, mode = [], [], None
    for p in merge(paras(body)):
        t = join(p)
        if re.match(r'^S[a-z]{1,4}ary[.,]', t):
            if text:
                emit(summ, text); n += 1; summ, text = [], []
            mode = 'S'; t = re.sub(r'^S[a-z]{1,4}ary[.,]?\s*', '', t)
        elif re.match(r'^[|\s]*Text[.,]', t):
            mode = 'T'; t = re.sub(r'^[|\s]*Text[.,]\s*', '', t)
        elif re.match(r'^(Co\w{1,3}ment|Note|Remark|Historical)[.,\b]', t):
            mode = None
        elif mode in ('S', 'T'):
            if (FN.match(t) or re.match(r'^\S{1,2}\s', t)) and CITE.search(t[:60]) and len(t) < 600:
                continue
        if mode == 'S': summ.append(t)
        elif mode == 'T': text.append(t)
    if text:
        emit(summ, text)
pathlib.Path(out).write_text('\n'.join(res))
print(out, n, 'canons', len(' '.join(res).split()), 'words')
