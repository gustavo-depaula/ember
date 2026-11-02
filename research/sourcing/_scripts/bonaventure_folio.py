"""Layout-aware reader for Quaracchi folio djvu.xml (archive.org).

Per page: split into two columns by x, drop marginal words (outside the column's body measure),
cut the editors' footnote block off the column's tail by line pitch (body ~47px, notes ~39px) and size,
and return body lines with an indent flag (paragraph start).
usage: python3 -I bonaventure_folio.py v05.xml FIRSTPAGE [LASTPAGE]   (prints body text; '=== NOTE' lines show where notes were cut)"""
DEBUG = False
import re, sys, html, statistics, collections

NOTE_VOC = re.compile(r"\b(Cfr|cfr|codd?|Vat|tom|pag|nota|Vide|vide|supra|infra|ed\.|edit|Cod|Ms|Mss|mss|seqq|ibid|Ibid|cap\.|lib\.|serm|Serm|dist|Sent|text|Ps\.|Lib\.|Opp)\b")

def load_pages(path):
    s = open(path, errors='replace').read()
    pages = []
    for ob in re.split(r'<OBJECT ', s)[1:]:
        w = int(re.search(r'width="(\d+)"', ob).group(1)); h = int(re.search(r'height="(\d+)"', ob).group(1))
        lines = []
        for ln in re.findall(r'<LINE>(.*?)</LINE>', ob, re.S):
            ws = [(int(a), int(b), int(c), int(d), html.unescape(e).strip()) for a, b, c, d, e in
                  re.findall(r'<WORD coords="(\d+),(\d+),(\d+),(\d+)"[^>]*>(.*?)</WORD>', ln, re.S)]
            if ws: lines.append(ws)
        pages.append(dict(w=w, h=h, lines=lines))
    return pages

NOTE_MARK = re.compile(r"^[\"'’^*•‘“§»]\s?[A-Z0-9(\[]?.{0,60}?(\b\d+\b|%s)" % NOTE_VOC.pattern.replace('\\b(', '(').rstrip(')\\b') + ")")
HEAD = re.compile(r"^(S\. ?Bonav\b.*|[\dIVXLl .]{1,8}|[A-ZÀ-Ý.,\- ]{1,40}\d*)$")

def lh(ws):
    hs = [b - d for a, b, c, d, t in ws if len(t) >= 3]
    return statistics.median(hs) if hs else 0

def edge(vals, hi=False):
    """Column edge: the extreme x bin (12px) that still holds a fifth of the commonest bin's lines."""
    c = collections.Counter(int(v / 12) for v in vals)
    if not c: return None
    top = max(c.values())
    ks = [k for k, n in c.items() if n >= 0.25 * top]
    return (max(ks) if hi else min(ks)) * 12 + 6

def page_body(pg):
    """-> list of (text, indent_flag, kind) for body lines in reading order; plus count of cut note lines."""
    W = pg['w']
    big = [ws for ws in pg['lines'] if lh(ws) >= 44 and ws[0][3] > 200 * pg['h'] / 3398 and ws[-1][2] - ws[0][0] <= 0.62 * W]   # collatio / sermon heads
    lines = [ws for ws in pg['lines'] if ws[-1][2] - ws[0][0] <= 0.62 * W and not any(ws is b for b in big)]   # full-width lines: Summarium, titles
    cov = [0] * (W + 2)
    for ws in lines:
        for a, b, c, d, t in ws:
            for x in range(max(0, a), min(W, c)): cov[x] += 1
    LOW = max(1, len(lines) // 14)
    lo, hi = int(0.38 * W), int(0.62 * W)
    best, mid, x = (-1, W / 2), W / 2, lo
    while x < hi:
        if cov[x] <= LOW:
            y = x
            while y < hi and cov[y] <= LOW: y += 1
            if y - x > best[0]: best = (y - x, (x + y) / 2)
            x = y
        else: x += 1
    mid = best[1]
    if DEBUG: print('MID', mid, best)
    cols = {0: [], 1: []}; centred = []
    for ws in lines:
        if ws[0][0] < mid - 30 and ws[-1][2] > mid + 30 and ws[-1][2] - ws[0][0] < 0.45 * W:   # a centred head, not a column line
            centred.append(ws); continue
        l = [x for x in ws if (x[0] + x[2]) / 2 < mid]; r = [x for x in ws if (x[0] + x[2]) / 2 >= mid]
        if l: cols[0].append(l)
        if r: cols[1].append(r)
    out = []; notes = 0
    keyed = []
    for ci in (0, 1):
        L = cols[ci]
        wide = [ws for ws in L if ws[-1][2] - ws[0][0] > 500]
        if len(wide) < 5: continue
        left = edge([ws[0][0] for ws in wide if ws[0][0] > (60 if ci == 0 else mid + 20)] or [ws[0][0] for ws in wide])
        right = edge([ws[-1][2] for ws in wide], True)
        # drop marginal words
        L2 = []
        for ws in L:
            k = [x for x in ws if x[0] >= left - 40 and x[2] <= right + 40]
            if k and k[-1][2] - k[0][0] > 0: L2.append(k)
        L2.sort(key=lambda ws: statistics.median([x[3] for x in ws]))
        L2 = [ws for ws in L2 if statistics.median([x[3] for x in ws]) > 200 * pg['h'] / 3398]
        tops = [statistics.median([x[3] for x in ws]) for ws in L2]
        pitch = [min(60, max(30, tops[i+1] - tops[i])) for i in range(len(L2) - 1)] + [47]
        # small type (footnotes, the editors' Summarium, Scholia) has a line pitch ~39 against ~47 for the text:
        # a line is small when the median pitch of the five around it is under 43.5
        def small(i):
            w = pitch[max(0, i-2):i+2] or [47]
            return statistics.median(w) < 43.5
        sm = [small(i) for i in range(len(L2))]
        # a note that the pitch test missed (a one- or two-line note at the foot): from its marker line to the column end
        mark = next((i for i, ws in enumerate(L2) if tops[i] > 0.55 * pg['h'] and NOTE_MARK.match(' '.join(x[4] for x in ws))), len(L2))
        sm = [f or i >= mark for i, f in enumerate(sm)]
        if DEBUG: print(ci, [(int(t), f, ws[0][4]) for t, f, ws in zip(tops, sm, L2)][:6], left, right)
        body = [ws for ws, f in zip(L2, sm) if not f]
        runs = [ws for ws, f in zip(L2, sm) if f]
        bh = statistics.median([lh(ws) for ws in body]) if body else 29
        notes += len(runs)
        for ws in body:
            t = ' '.join(x[4] for x in ws)
            keyed.append(((ci, statistics.median([x[3] for x in ws])), (t, ws[0][0] > left + 40, ws, left, right)))
    for ws in big + centred:
        c = 0 if (ws[0][0] + ws[-1][2]) / 2 < mid + 0.12 * W else 1
        keyed.append(((c, statistics.median([x[3] for x in ws]) - 0.5), ('@@' + ' '.join(x[4] for x in ws), False, ws, 0, 0)))
    keyed.sort(key=lambda k: k[0])
    return [v for _, v in keyed], notes

if __name__ == '__main__':
    P = load_pages(sys.argv[1]); a = int(sys.argv[2]); b = int(sys.argv[3]) if len(sys.argv) > 3 else a
    for n in range(a, b + 1):
        body, nn = page_body(P[n-1])
        print('=== PAGE', n, 'notes cut', nn)
        for t, ind, *_ in body: print(('   ' if ind else '') + t)

RUNHEAD_L = re.compile(r'^(?:\d{3}\s+)?(?:(?:DE|IN|SERMO|SERMONES)\s+[A-ZÀ-Ý.\- ]{2,40}?\s+)?(?:C[O0]LL\w{0,5}|SERMO|SERM\w{0,3})[ .]+[IVXLlHU1]{1,7}[.,]?\s+(?=\S)')
RUNHEAD_R = re.compile(r'\s+(?:C[O0]LL\w{0,5}|SERMO)[ .]+[IVXLlHU1]{1,7}[.,]?(?:\s+\d{3})?$')
SUMM = re.compile(r'^[SB5]\s?[uUn][mn][mn]\s?[aA][rR]', re.I)
COLL = re.compile(r'^(?:COLLATIO|COLL\w{0,4}[ .]*\w{0,3}|C[O0]LL[A-Z.\\]{2,6})\s+([IVXLlHU1]+)\.?$')

def stream(pages, a, b, heads=None):
    """Body lines of djvu pages a..b (1-based): ('H', text) for all-caps heads that matter, ('L', text, indent) for text."""
    out = []
    for n in range(a, b + 1):
        pg = pages[n-1]
        out.append(('G', n))
        # a collatio/sermon opens with full-width lines: title, then the editors' Summarium (dropped)
        span = sorted([ws for ws in pg['lines'] if ws[-1][2] - ws[0][0] > 0.62 * pg['w'] and ws[0][3] > 200 * pg['h'] / 3398], key=lambda ws: ws[0][3])
        si = next((i for i, ws in enumerate(span) if SUMM.match(' '.join(x[4] for x in ws))), None)
        if si is not None:
            title = [' '.join(x[4] for x in ws) for ws in span[:si]]
            out.append(('S', join(title)))
        body, _ = page_body(pg)
        for t, ind, ws_, lft, rgt in body:
            t = re.sub(r'\s+', ' ', t).strip()
            if not t: continue
            if t.startswith('@@'): out.append(('H', t[2:])); continue
            t = RUNHEAD_L.sub('', t); t = RUNHEAD_R.sub('', t)   # a page head the OCR merged into the first/last text line
            if not t: continue
            if heads and heads.match(t) and len(t) < 40: out.append(('H', t)); continue
            if HEAD.match(t) and not re.match(r'^\d+[.,] ', t):
                continue
            out.append(('L', t, ind, bool(ws_) and ws_[-1][2] < rgt - 110))
    return out

def paragraphs(items, marker=None):
    """items from stream -> list of ('H', text) / ('P', text); a paragraph starts at an indented line or a numbered one."""
    res = []; cur = []; prev_short = False
    def flush():
        nonlocal cur
        if cur: res.append(('P', join(cur))); cur = []
    for it in items:
        if it[0] == 'G': res.append(it); continue
        if it[0] in 'HS': flush(); res.append(it); continue
        _, t, ind, short = it
        if marker and marker.match(t): flush(); res.append(('M', t)); prev_short = True; continue
        if cur and (re.match(r'^\d{1,2}\s?[.,] ?[A-Z]', t) or (ind and (prev_short or re.search(r'[.:;?!)\]»]$', cur[-1])))): flush()
        cur.append(t); prev_short = short
    flush()
    return res

def join(ls):
    t = ''
    for s in ls:
        if t.endswith('-') and s[:1].islower() and len(t) > 1 and t[-2].isalpha(): t = t[:-1] + s
        else: t = (t + ' ' + s) if t else s
    return re.sub(r'\s+', ' ', t).strip()

def roman(n):
    r = ''
    for v, s in [(1000,'M'),(900,'CM'),(500,'D'),(400,'CD'),(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r

def head_roman(t):
    """Roman numeral token at the end of an OCR'd head ('COLLATIO XIIL' -> 'XIII'), None if there is none."""
    m = re.search(r'\b([IiVXLlUYKH1NnJTvx]{1,7})\.?\s*$', t)
    if not m: return None
    r = m.group(1).replace('n', 'II').replace('N', 'II').replace('l', 'I').replace('J', 'I').replace('T', 'I').upper().replace('1', 'I').replace('Y', 'V').replace('K', 'V').replace('U', 'II').replace('H', 'II')
    if r.endswith('L'): r = r[:-1] + 'I'
    return r

def split_numbered(paras, prefix_re=r'COLL', first=1, last=None):
    """paras (H/S/P) -> {n: [items]}: item n starts at the first head after the previous one that reads as n."""
    out = {}; n = first - 1; cur = None
    for it in paras:
        if it[0] == 'H' and re.search(prefix_re, it[1]) and head_roman(it[1]) == roman(n + 1) and (last is None or n + 1 <= last):
            n += 1; cur = out.setdefault(n, []); continue
        if it[0] == 'H': continue
        if cur is not None: cur.append(it)
    return out

def clean(t, fix=None, log=None):
    """Strip note-marker glyphs and scanner debris from a folio paragraph, then lexicon-repair."""
    t = re.sub(r'[\^\\|{}■¬~•§]', '', t)
    t = re.sub(r"(?<=[A-Za-z.,;:)])\s?['’\"*°`]+(?=[\s.,;:)]|$)", '', t)      # note marker after a word
    t = re.sub(r"\s['’\"*°`]+\s", ' ', t)
    t = re.sub(r'(?<=[a-z])\d{1,2}(?=[\s.,;:)]|$)', '', t)                     # superscript numeral fused to a word
    t = re.sub(r'\s+([.,;:?!])', r'\1', t)
    t = re.sub(r'\b[JlL]esus\b', 'Iesus', t); t = re.sub(r'\b[JlL]esu\b', 'Iesu', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return fix(t, log) if fix else t
