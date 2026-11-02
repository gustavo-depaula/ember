"""Parse Wrangham's 'Liturgical Poetry of Adam of St. Victor' (1881, archive.org OCR) into Latin (Gautier) + English sequences.
usage: python3 -I victorines_wrangham.py [--dump]  -> prints a summary; build() returns [(n, la_title, en_title, la_lines, en_lines)]"""
import re, sys
from pathlib import Path
D = Path('research/sourcing/victorines/ia-wrangham')
RANGES = {'v01': (1154, 9792), 'v02': (393, 8975), 'v03': (397, 6880)}
EN_W = set("the and of to his her with that is from by who thy thou thee he she all for are hath doth our us shall yet then they their was on as be not it this but or we your you my when where hast art dost let who whom whose which what through unto into upon there here these those them him its o'er e'er ere thine mine have had has were would should may might can could will".split())
LA_W = set("et est qui quae quod non cum ad per sunt ut sed hic haec hoc nos tu te tibi sibi nobis dei domine christe quia ergo vel aut ille ipse esse tui tua tuo quo qua nec nam sic sua suo eum ei eo ex sub super ab pro ne si quam mea meum deo deus dum jam tam quam cui quem quos quas ejus ipsa ipsum omnes omnia nostra nostri".split())

def rom(s):
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}; t = 0
    for i, c in enumerate(s):
        t += -v[c] if i + 1 < len(s) and v[c] < v[s[i + 1]] else v[c]
    return t

def lang(lines):
    w = re.findall(r"[a-z]+", ' '.join(lines).lower())
    e = sum(x in EN_W for x in w); l = sum(x in LA_W for x in w)
    return 'en' if e > l else 'la'

def kind(raw):
    s = raw.strip()
    c = re.sub(r'\s+', '', s)
    if not s: return 'blank'
    if re.fullmatch(r'[A-Z]', c): return 'dropcap'
    m = re.fullmatch(r'([IVXLCT]{1,9})[.,;:]?', c)
    if m: return 'num'
    if re.fullmatch(r'\d{1,4}', c) or re.fullmatch(r'(I{1,3}|IV|V)\.?[A-Z]{1,2}', c) or 'ADAMOFST' in c or re.fullmatch(r'[A-Z]', c) and False: return 'junk'
    if re.fullmatch(r'[A-Z]', c): return 'dropcap'
    if not re.search(r'[a-z]', s) and len(re.findall(r'[A-Z]', s)) >= 3: return 'head'
    return 'verse'

def clean_verse(s):
    s = s.strip()
    s = re.sub(r'(?<=[^\d\s])\s+(\d{1,3})$', lambda m: '' if int(m.group(1)) % 5 == 0 else m.group(0), s)
    s = re.sub(r'\s+', ' ', s)
    s = s.replace('■', '').replace('^', '').replace('•', '')
    return s.strip()

def build():
    out = []
    for v, (a, b) in RANGES.items():
        L = (D / (v + '.txt')).read_text(encoding='utf-8').split('\n')[a - 1:b]
        start = 1 if v == 'v01' else None
        cur = 0
        regions = {}   # n -> list of (kind, text)
        if v == 'v01': regions[1] = []; cur = 1
        pend_drop = None
        for raw in L:
            k = kind(raw)
            if k == 'num':
                n = rom(re.sub(r'\s+', '', raw).strip('.,;:').replace('T', 'I'))
                prev = max(regions) if regions else 0
                nxt = prev + 1
                if v != 'v01' and not regions and n in (40, 76): nxt = n
                if n == nxt and (v == 'v01' and n >= 2 or v != 'v01'):
                    regions[n] = []; cur = n
                    regions[n].append(('num', n)); continue
                if n == cur: regions[cur].append(('num', n)); continue
                continue
            if cur == 0: continue
            if k == 'dropcap': pend_drop = raw.strip(); continue
            if k == 'verse':
                t = raw
                if pend_drop:
                    t = pend_drop + re.sub(r'^\s*[■\^\*•\s]+', '', t) if re.match(r'^\s*[■\^\*•]', t) else pend_drop + t.lstrip()
                    pend_drop = None
                regions[cur].append(('verse', clean_verse(t)))
            elif k == 'head':
                regions[cur].append(('head', re.sub(r'\s+', ' ', raw.strip())))
        for n, items in regions.items():
            blocks = []; heads = []; cb = []; ch = []
            for kd, t in items:
                if kd == 'verse':
                    cb.append(t)
                else:
                    if cb: blocks.append((ch, cb)); cb = []; ch = []
                    if kd == 'head': ch.append(t)
            if cb: blocks.append((ch, cb))
            la_l, en_l, la_h, en_h = [], [], [], []
            for hh, bl in blocks:
                lg = lang(bl)
                if len(bl) > 0 and sum(lang([x]) == lg for x in bl) < 0.7 * len(bl):
                    prev = lg
                    for x in bl:
                        w = re.findall(r"[a-z]+", x.lower())
                        e = sum(y in EN_W for y in w); l = sum(y in LA_W for y in w)
                        cls = 'en' if e > l else 'la' if l > e else prev
                        prev = cls
                        (la_l if cls == 'la' else en_l).append(x)
                else:
                    (la_l if lg == 'la' else en_l).extend(bl)
                (la_h if lg == 'la' else en_h).extend(hh)
            out.append((n, la_h[:1], en_h[:1], la_l, en_l))
    return out

def stanzas(lines):
    paras, cur = [], []
    for l in lines:
        cur.append(l)
        if re.search(r'[.!?]["”’]?$', l) and len(cur) >= 2:
            paras.append('  \n'.join(cur)); cur = []
    if cur: paras.append('  \n'.join(cur))
    return paras

if __name__ == '__main__':
    r = build()
    print(len(r), [x[0] for x in r][:120])
    for n, lh, eh, la, en in r:
        if abs(len(la) - len(en)) > 8 or not la or not en: print('MISMATCH', n, lh, eh, len(la), len(en))
    for n, lh, eh, la, en in r[:2] + r[40:41]:
        print(n, lh, eh); print('\n'.join(la[:6])); print('--'); print('\n'.join(en[:6]))
