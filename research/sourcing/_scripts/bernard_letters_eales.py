"""Bernard, Letters, in Samuel J. Eales's English (Life and Works of Saint Bernard, vols. 1-3, London: John Hodges,
1889-1896; archive.org saintbernardlife00bernuoft, saintbernardlife02bernuoft, lifeworksofsaint03bern)
-> bernard-opera-omnia/epistolae/en-US, beside the Latin (Mabillon's numbering in Migne).

Read from the word-coordinate files (_djvu.xml in research/sourcing/_skipped/coords/). Per page: the running head
("LETTER CXLV.", "APPENDIX TO LETTERS.") and page number are dropped; the notes at the foot are told from the text by
their smaller type (vols. 1-2) or by the gap and closer leading above them (vol. 3), and paired with the markers on
the same page. A letter starts at a "LETTER N." line set off from the page (indented, taller, or followed by its
address); the few headings the OCR lost are checked against the running heads, which name the letter on every page.

Eales follows the Maurist numbering of the 1839 edition, which is the Latin's, for letters 1-419. He moves the
fragment to Nicholas of Cambrai (Latin 420) to 455, so his 420-454 are Latin 421-455; his 485-488 are Latin 457-460.
The rest (his 456-458 charters, 459 Peter de Roya's letter, 460 Henry of Troyes's grant, and the appendix of letters
found by Hüffer and others, 461-484, 489-490) have no Latin here and are English-only chapters (eales-NNN).
usage: python3.13 bernard_letters_eales.py [--only=N,N]"""
import json, os, pickle, re, statistics, sys
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages  # noqa: E402
from en_common import join_lines, inW  # noqa: E402

ROOT = '/Users/gustavo/Documents/prayer'
SK = ROOT + '/research/sourcing/_skipped'
BOOK = ROOT + '/content/books/bernard-opera-omnia/epistolae'
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
# (scan, first letter, last letter, first page, end page, note mode)
VOLS = [('saintbernardlife00bernuoft', 1, 145, 124, 466, 'h'),
        ('saintbernardlife02bernuoft', 146, 380, 23, 491, 'h'),
        ('lifeworksofsaint03bern', 381, 490, 88, 285, 'gap')]
ROMV = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
STATS = {'notes': 0, 'unplaced': 0, 'continued': 0}


def rom(s):
    t = 0
    for i, c in enumerate(s):
        x = ROMV[c]
        t += -x if i + 1 < len(s) and ROMV[s[i + 1]] > x else x
    return t


def roman(n):
    out = ''
    for v, s in ((1000, 'M'), (900, 'CM'), (500, 'D'), (400, 'CD'), (100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            out += s
            n -= v
    return out


def fixr(s):
    s = s.upper().replace('1', 'I').replace('J', 'I').replace('Y', 'V').replace('H', 'II').replace('^', 'L').replace(' ', '')
    return re.sub(r'IL$', 'II', s)


def lev(a, b):
    d = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        p, d[0] = d[0], i
        for j, cb in enumerate(b, 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (ca != cb))
    return d[-1]


def latin_of(e):
    """Eales's number -> the Latin chapter id, or None"""
    if e <= 419:
        return e
    if e <= 454:
        return e + 1
    if e == 455:
        return 420
    if 485 <= e <= 488:
        return e - 28
    return None


# ---------- page geometry ----------
RH = re.compile(r'^\W{0,2}(?:\S{1,4}\s+)?(?:[LI]\s?[EK]\s?T\s?T?\s?[EK]\s?R\s?S?|APPENDIX\s+TO\s+LETTERS|INDEX|I\s?NDEX)\b', re.I)
PGNUM = re.compile(r'^[\dIilo°QSBOy?]{1,4}[.,]?$')
NOTE = re.compile(r'^\s*(?:[1-9IilJ\]]|[*†‡§])\s*[\[A-Z(“"]')
SIG = re.compile(r'(?i)^\s*(?:VOL\.?\s*[IVXil]+\.?\s*\d*|[\dA-Z.\s]{1,9})\s*$')
HD = re.compile(r'^[\s,.]*(?:[LI][EK]\s?T\s?T?\s?[EK]\s?R|LETTP:R)\s+([IVXLCDMlJYH^1]+(?: VI)?|[cdlxvi]+)\s*[.,:]?\s*(.*)$', re.I)
HDNO = re.compile(r'^\s*No\.\s+(CD[LXVI]+)\.\s*(.*)$')


def vol_stats(P):
    hs, sp = [], []
    for p in P:
        ls = [l for par in p for l in par]
        hs += [l['h'] for l in ls]
        sp += [ls[i]['yb'] - ls[i - 1]['yb'] for i in range(1, len(ls)) if 0 < ls[i]['yb'] - ls[i - 1]['yb'] < 200]
    return statistics.median(hs), statistics.median(sp)


def strip_head(ls, H):
    k = 0
    while k < min(3, len(ls)):
        t = ls[k]['text'].strip()
        if PGNUM.match(t) or (RH.match(t) and len(t.split()) <= 6 and not re.search(r'A\.\s*D|Circa|[\[({]', t)
                                   and (ls[k]['h'] < 0.85 * H or re.search(r'\d{2}|[a-z]{4}|(?:^|\s)[\dlIoO]{2,4}$', t))):
            k += 1
            continue
        break
    ls = ls[k:]
    while ls and SIG.match(ls[-1]['text']) and len(ls[-1]['text'].split()) <= 3 and ls[-1]['x1'] - ls[-1]['x0'] < 500:
        ls = ls[:-1]
    return ls


def split_h(ls, H, S):
    """notes in smaller type: the trailing run of small or closely set lines"""
    n = len(ls)
    if n < 2:
        return ls, []
    gap = [ls[i]['yb'] - ls[i - 1]['yb'] if i else 999 for i in range(n)]

    def noteish(i):
        if ls[i]['h'] < 0.88 * H:
            return True
        gp, gn = gap[i], (gap[i + 1] if i + 1 < n else None)
        if gn is None:
            return gp < 0.88 * S
        return gn < 0.88 * S and (gp < 0.88 * S or ls[i]['h'] < 0.97 * H)
    k, i = None, n - 1
    if not noteish(i) and noteish(i - 1):
        i -= 1
    while i >= 0 and (noteish(i) or (i >= 1 and noteish(i - 1) and i + 1 < n and noteish(i + 1))):
        k = i
        i -= 1
    if k is None:
        return ls, []
    small_run = n - k >= 2 and statistics.median(l['h'] for l in ls[k:]) < 0.85 * H
    if not (NOTE.match(ls[k]['text']) or gap[k] > 1.2 * S or k == 0 or small_run):
        for j in range(k, n):
            if NOTE.match(ls[j]['text']) and gap[j] > 1.05 * S:
                return ls[:j], ls[j:]
        return ls, []
    if any(HD.match(l['text']) and l['h'] >= 0.95 * H for l in ls[k:]):
        return ls, []
    return ls[:k], ls[k:]


def split_gap(ls, H, S):
    """notes set off by a gap and in closer leading (vol. 3)"""
    n = len(ls)
    if n < 2:
        return ls, []
    gap = [ls[i]['yb'] - ls[i - 1]['yb'] if i else 0 for i in range(n)]
    for k in reversed([i for i in range(1, n) if gap[i] > 1.12 * S]):
        rest = ls[k:]
        if any(HD.match(l['text']) or HDNO.match(l['text']) for l in rest):
            break
        mh = statistics.median(l['h'] for l in rest)
        start = NOTE.match(rest[0]['text']) or rest[0]['text'].lstrip()[:1] in '[*'
        if len(rest) == 1:
            ok = bool(start) and mh < 1.02 * H
        else:
            ms = statistics.median(gap[k + 1:])
            ok = mh < 0.965 * H or (ms < 0.9 * S and mh < 1.0 * H) or (start and (ms < 0.9 * S or gap[k] > 1.6 * S))
        if ok:
            return ls[:k], ls[k:]
        if gap[k] > 1.3 * S:
            break
    return ls, []


def heading_of(l, ls, j, H, left):
    """-> Eales's number if line j is a letter heading"""
    t = l['text']
    m = HD.match(t)
    if m:
        try:
            n = rom(fixr(m.group(1)))
        except KeyError:
            return None
        nxt = [x['text'] for x in ls[j + 1:j + 4]]
        if re.search(r'[\(\{\[]|A\.\s*[DI]|Circa', m.group(2)) or any(re.match(r'^\s*(To|TO|From|FROM)\s', x) for x in nxt) \
                or l['x0'] > left + 80 or l['h'] > 1.12 * H:
            return n
        return None
    m = HDNO.match(t)
    if m:
        return rom(m.group(1))
    return None


# ---------- notes and markers ----------
SKIPWORD = re.compile(r"^(?:(?i:no|ep|epp|pp|cap|chap|col|vol|tom|bk|lib|ser|serm|sermon|ps|ver|vv|art|fol|fols|tome|letter|letters)|[cpnbvt]|[ivxlc]+)\.?,?$")


def note_items(nls):
    """note lines -> [[marker, text]]; marker None = continues the previous page's last note"""
    out = []
    for l in nls:
        t = l['text'].strip()
        m = re.match(r"^([1-9IilJ\]]|[*†‡§]|-|'-'|-'|[tf](?=\s+[A-Z\[]))\s*(?=[\[A-Z(“\"'a-z])", t)
        if m and (NOTE.match(t) or m.group(1) in ('-', "'-'", "-'", '*', '†', 't', 'f')):
            mk = m.group(1)
            mk = {'I': '1', 'i': '1', 'l': '1', 'J': '1', ']': '1', '-': '2', "'-'": '2', "-'": '2', 't': '†', 'f': '†'}.get(mk, mk)
            out.append([mk, t[m.end():]])
        elif out:
            out[-1][1] = join_lines([out[-1][1], t])
        else:
            out.append([None, t])
    return out


def place_markers(body, items, notes, pi):
    """replace the markers of this page's notes in its body lines by ⟦k⟧ (index into notes)"""
    used = set()
    for mk, txt in items:
        notes.append(txt)
        k = len(notes) - 1
        STATS['notes'] += 1
        done = False
        if mk.isdigit():
            rx = re.compile(r"(?<=[A-Za-z.,;:!?'\"’”)\]])(\s?)%s(?![\d])(?=[\s,.;:)'’\]]|$)" % mk)
            alt = re.compile(r"(?<=[A-Za-z.,;:])(['’]?-['’]?|['’]-?)(?=\s|$)") if mk == '2' else None
        else:
            rx = re.compile(r"(?<=[A-Za-z.,;:!?'\"’”)\]])\s?%s" % re.escape(mk))
            alt = re.compile(r"(?<=[A-Za-z.,;:!?'\"’”)\]])\s?[*t+](?=\s|$)") if mk in '*†' else None
        for r in [x for x in (rx, alt) if x]:
            for li, l in enumerate(body):
                for m in r.finditer(l['text']):
                    if (li, m.start()) in used:
                        continue
                    before = l['text'][:m.start()].split()
                    if mk.isdigit() and before and r is rx and m.group(1) and SKIPWORD.match(before[-1]):
                        continue
                    if mk.isdigit() and before and re.search(r"\d[.,]?$", before[-1]):
                        continue
                    l['text'] = l['text'][:m.start()] + '⟦%d⟧' % k + l['text'][m.end():]
                    used.add((li, m.start()))
                    done = True
                    break
                if done:
                    break
            if done:
                break
        if not done:
            STATS['unplaced'] += 1
            if body:
                body[-1]['text'] += ' ⟦%d⟧' % k
            else:
                notes[-1] = notes[-1]


# ---------- text ----------
def common(w):
    return LEX.get(w.lower(), 0) >= 3


SUBS = (('Ji', 'h'), ('/i', 'h'), ('J', 'h'), ('/', 'h'), ('li', 'h'), ('rn', 'm'), ('ii', 'u'), ('1', 'l'), ('0', 'o'), ('vv', 'w'), ('\\v', 'w'), ('c', 'e'), ('e', 'c'), ('f', 't'), ('t', 'f'))


def word_fix(m):
    """an italic or broken letter read as another: tlie, tJie, t/ian, tJic"""
    w = m.group(0)
    if inW(w) or not re.search(r"[A-Za-z]", w) or w[:1].isupper() and not re.search(r"[J/\\]", w[1:]):
        return w
    cands = {w}
    for _ in range(2):
        nxt = set()
        for x in cands:
            for a, b in SUBS:
                for i in [y.start() for y in re.finditer(re.escape(a), x)]:
                    nxt.add(x[:i] + b + x[i + len(a):])
        for c in sorted(nxt, key=len, reverse=True):
            if inW(c) and LEX.get(c.lower(), 0) >= 20:
                return c
        cands = nxt
    return w


def tidy(p):
    p = re.sub(r"\s+", ' ', p).strip()
    p = re.sub(r"\s+([,;:!?.])(?=\s|$|[\"'’”)⟦])", r"\1", p)
    p = re.sub(r"\(\s+", '(', p)
    p = re.sub(r"\s+\)", ')', p)
    p = re.sub(r"(?<=[a-z]),(?=[a-z])", ', ', p)
    p = re.sub(r"[A-Za-z]*[J/\\][a-z]+|[a-z]+(?:li|rn|ii|vv)[a-z]*|[a-z]+[10][a-z]+", word_fix, p)
    p = re.sub(r"\b([A-Za-z]{2,}) ([a-z]{2,})\b", lambda m: m.group(1) + m.group(2) if common(m.group(1) + m.group(2)) and not (common(m.group(1)) and common(m.group(2))) else m.group(0), p)
    p = re.sub(r"\bi (Cor|Kings|Tim|Thess|Pet|John|Sam|Chron|Macc|S\. John|S\. Pet)\b", r"1 \1", p)
    p = re.sub(r"(?<=[a-z])\^(?=[a-z])", '', p)
    p = re.sub(r"(?<=\s)[•«»■](?=\s)", '', p)
    p = re.sub(r"\s{2,}", ' ', p)
    return p.replace('S.Bernard', 'S. Bernard').replace(' Bee,', ' Bec,').replace(' Bee.', ' Bec.')


SMALL = {'of', 'the', 'and', 'to', 'in', 'on', 'for', 'at', 'a', 'an', 'by', 'from', 'with', 'who', 'had', 'or', 'as', 'his', 'her', 'their', 'that', 'whom', 'which', 'was', 'is', 'concerning', 'about', 'but', 'not', 'he'}


CAPFIX = {'OK': 'OF', 'OE': 'OF', 'OX': 'ON', 'THK': 'THE', 'THI-:': 'THE', 'TIIE': 'THE', 'AMHOT': 'ABBOT', 'EOR': 'FOR', 'OR': 'OR'}


def cap_word(w):
    core = re.sub(r"[^A-Za-z-:]", '', w)
    if core in CAPFIX:
        return w.replace(core, CAPFIX[core])
    if len(core) > 2 and core.isupper() and not common(core):
        for a, b in (('K', 'E'), ('H', 'II'), ('E', 'F'), ('0', 'O')):
            c = core.replace(a, b)
            if c != core and common(c):
                return w.replace(core, c)
    return w


def title_case(t):
    if sum(c.isupper() for c in t) >= 0.6 * sum(c.isalpha() for c in t):
        t = ' '.join(cap_word(w) for w in re.sub(r"\bl(?=[A-Z])", 'I', t).split())
    if sum(c.isupper() for c in t) < 0.6 * sum(c.isalpha() for c in t):
        return t
    out = []
    for i, w in enumerate(t.split()):
        core = re.sub(r"[^A-Za-z]", '', w)
        if re.fullmatch(r"[IVXLC]+\.?,?", w) and core not in ('I', 'C', 'L', 'V', 'X') or re.fullmatch(r"[A-Z]\.,?", w):
            out.append(w)
        elif i and core.lower() in SMALL:
            out.append(w.lower())
        else:
            out.append(re.sub(r"[A-Za-z]+", lambda m: m.group(0)[0].upper() + m.group(0)[1:].lower(), w, count=1).replace("'S", "'s"))
    return ' '.join(out)


PNUM = {'i': 1, 'I': 1, 'l': 1, 'J': 1}


def parnum(tok, expected):
    t = ''.join({'i': '1', 'I': '1', 'l': '1', 'J': '1', 'o': '0', 'O': '0', 'n': '11', 'z': '2', 'S': '5', 'g': '9'}.get(c, c) for c in tok)
    return int(t) if t.isdigit() and expected <= int(t) <= expected + 2 else None


# ---------- main ----------
def letters():
    """-> {eales_no: dict(head=[lines], lines=[(text, newpara)], notes=[...])}"""
    out, notes = {}, []
    for vol, lo, hi, p0, p1, mode in VOLS:
        P = pages('%s/coords/%s_djvu.xml' % (SK, vol))
        H, S = vol_stats(P[p0:p1])
        cur = None
        expected = lo
        for pi in range(p0, p1):
            ls = [dict(l) for par in P[pi] for l in par]
            if not ls:
                continue
            ls = strip_head(ls, H)
            body, nls = (split_h if mode == 'h' else split_gap)(ls, H, S)
            items = note_items(nls)
            if items and items[0][0] is None:
                if notes:
                    notes[-1] = join_lines([notes[-1], items[0][1]])
                    STATS['continued'] += 1
                items = items[1:]
            place_markers(body, items, notes, pi)
            if not body:
                continue
            xs = sorted(l['x0'] for l in body)
            left = xs[len(xs) // 4]
            right = sorted(l['x1'] for l in body)[len(body) // 2]
            for j, l in enumerate(body):
                n = heading_of(l, body, j, H, left) if len(l['text']) < 120 else None
                if n is not None and n != expected:
                    raw = (HD.match(l['text']) or HDNO.match(l['text'])).group(1)
                    strong = re.search(r"[\[({]|A\.\s*D|Circa", l['text']) or any(re.match(r"^\s*(To|TO|From|FROM)\s", x['text']) for x in body[j + 1:j + 3])
                    if expected < n <= expected + 2:
                        print('LETTER(S) MISSING before %d (page %d)' % (n, pi))
                    elif strong and expected <= hi and n != expected - 1 and lev(fixr(raw), roman(expected)) <= 1:
                        print('heading %r taken as %d (page %d)' % (l['text'][:40], expected, pi))
                        n = expected
                    else:
                        print('  ignored heading-like %r (%d, expecting %d, page %d)' % (l['text'][:50], n, expected, pi))
                        n = None
                if n is not None:
                    cur = out[n] = {'head': [l['text']], 'lines': [], 'page': pi}
                    expected = n + 1
                    continue
                if cur is None:
                    continue
                # local left margin, to tell an indented line (a new paragraph) from the skew of the page
                near = sorted(x['x0'] for x in body[max(0, j - 4):j + 5])
                lft = min(left, near[len(near) // 3])
                indent = l['x0'] - lft > (28 if mode == 'h' else 45)
                short_prev = j > 0 and right - body[j - 1]['x1'] > 160 and re.search(r"[.!?:\"”’)\]]\s*(⟦\d+⟧)?\s*$", body[j - 1]['text'])
                centred = l['x0'] - lft > 150 and right - l['x1'] > 120
                prev_t = body[j - 1]['text'] if j else (cur['lines'][-1][0] if cur['lines'] else '')
                ends = re.search(r"[.!?:;\"”’)\]]['’”]?\s*(⟦\d+⟧\s*)*$", prev_t) or not prev_t
                cur['lines'].append((l['text'], bool((indent or short_prev) and ends), centred, j == 0))
        if expected <= hi:
            print('vol ends before letter', expected)
    return out, notes


def compose(e, L, notes):
    head = L['head'][0]
    m = HD.match(head) or HDNO.match(head)
    rest = m.group(2).strip()
    lines = L['lines']
    k = 0
    # heading continued (vol. 3: "[Formerly No. 324; the former / No. 382 is now No. 321] (Circa A. D. 1150.)")
    while k < 2 and k < len(lines) and (rest.count('[') > rest.count(']') or rest.count('(') + rest.count('{') > rest.count(')') + rest.count('}')) \
            and not re.match(r"^\s*(To|TO|From|FROM|THE|A\s|[A-Z]{3,}\s+[A-Z]{2,})", lines[k][0]) and len(lines[k][0]) < 75:
        rest += ' ' + lines[k][0]
        k += 1
    # the address: centred lines (or capitals) after the heading
    addr = []
    while k < len(lines) and len(addr) < 4:
        t = lines[k][0]
        caps = sum(c.isupper() for c in t) >= 0.6 * max(1, sum(c.isalpha() for c in t))
        if not addr and (re.match(r"^\s*(To|TO|From|FROM|Fragment|Letter|Peter|Dom|Gerulf|Brother|Hatto|PRIVILEGE|REPLY|THE|A\s)", t) or caps or lines[k][2]):
            addr.append(t)
        elif addr and caps and len(t) < 80 and not re.search(r"[a-z]{4}", re.sub(r"⟦\d+⟧", '', t)) and not re.search(r"[.]\s*(⟦\d+⟧)?$", re.sub(r"\b(S|ST|B)\.$", '', addr[-1].strip())):
            addr.append(t)
        elif addr and lines[k][2] and len(t) < 70 and not re.search(r"[.!?]\s*$", addr[-1]):
            addr.append(t)
        else:
            break
        k += 1
    if HDNO.match(head) and not addr:
        addr = [rest]
        rest = ''
    address = join_lines(addr) if addr else ''
    marks = re.findall(r"⟦\d+⟧", rest + address)
    rest = re.sub(r"\s*⟦\d+⟧", '', rest)
    address = re.sub(r"\s*⟦\d+⟧", '', address)
    address = tidy(title_case(address)).rstrip('.').rstrip(',')
    address = re.sub(r"[.\s]*[*†'\-]+$", '', address).strip()
    # paragraphs
    paras = []
    for t, new, centred, top in lines[k:]:
        if paras and not new and not (top and False):
            paras[-1] = join_lines([paras[-1], t])
        elif paras and top and not new:
            paras[-1] = join_lines([paras[-1], t])
        else:
            paras.append(t)
    # a paragraph broken at the page foot: it does not end a sentence and the next starts in lower case
    merged = []
    for p in paras:
        if merged and p[:1].islower() and not re.search(r"[.!?:\"”’]\s*(⟦\d+⟧\s*)*$", merged[-1]):
            merged[-1] = join_lines([merged[-1], p])
        else:
            merged.append(p)
    paras = [tidy(p) for p in merged]
    # paragraph numbers
    exp = 1
    for i, p in enumerate(paras):
        mm = re.match(r"^(\S{1,3}|\S \S)[.,]\s+(?=\S)", p)
        if mm:
            v = parnum(mm.group(1).replace(' ', ''), exp)
            if v:
                paras[i] = '**%d.** %s' % (v, p[mm.end():])
                exp = v + 1
    # the summary (Mabillon's argument, in italics)
    if paras and re.match(r"^(He|Bernard|She|They|In this|This|The Abbot|Concerning|On behalf|Respecting|Against|Also against|On the same|In favour|That|About)\b", paras[0]) and len(paras[0].split()) < 160 and len(paras) > 1:
        paras[0] = '*%s*' % re.sub(r"\s*((?:⟦\d+⟧\s*)+)$", r"*\1", paras[0]).rstrip('*') if not paras[0].endswith('⟧') else '*' + re.sub(r"((?:\s*⟦\d+⟧)+)$", r"*\1", paras[0])
        paras[0] = re.sub(r"\*\*$", '*', paras[0])
    if marks and paras:
        paras[0] += ''.join(marks)
    date = tidy(rest.replace('{', '(').replace('}', ')')).strip()
    date = re.sub(r"^[.,\s]+", '', date)
    return address, date, paras


def render(title, sub, paras, notes):
    used = []

    def rep(m):
        used.append(tidy(notes[int(m.group(1))]))
        return '[^%d]' % len(used)
    body = [re.sub(r"\s?⟦(\d+)⟧", rep, p) for p in paras]
    md = '# %s\n\n' % title
    if sub:
        md += '*%s*\n\n' % sub.replace('*', '')
    md += '\n\n'.join(body) + '\n'
    if used:
        md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, n) for i, n in enumerate(used)) + '\n'
    return md


def main():
    only = None
    for a in sys.argv[1:]:
        if a.startswith('--only='):
            only = set(int(x) for x in a[7:].split(','))
    L, notes = letters()
    print(len(L), 'letters', STATS)
    missing = [n for n in range(1, 491) if n not in L]
    print('missing', missing)
    book = json.load(open(BOOK + '/book.json'))
    leaves = {}

    def walk(ns):
        for x in ns:
            if 'children' in x:
                walk(x['children'])
            else:
                leaves[x['id']] = x
    walk(book['toc'])
    os.makedirs(BOOK + '/en-US', exist_ok=True)
    extra, words = [], 0
    for e in sorted(L):
        address, date, paras = compose(e, L[e], notes)
        la = latin_of(e)
        num = roman(la) if la else roman(e)
        title = 'Letter %s. %s' % (num, address) if address else 'Letter %s' % num
        sub = date
        if la and la != e:
            sub = ("Letter %s in Eales's numbering. " % roman(e)) + sub
        cid = 'e%03d' % la if la else 'eales-%03d' % e
        if only and e not in only:
            continue
        md = render(title, sub.strip(), paras, notes)
        open('%s/en-US/%s.md' % (BOOK, cid), 'w').write(md)
        words += len(md.split())
        if la:
            leaves[cid]['title']['en-US'] = title
        else:
            extra.append({'id': cid, 'title': {'en-US': title}})
    if only:
        return
    for g in book['toc']:
        if 'children' in g and re.match(r'Epistolae ', g['title'].get('la', '')):
            g['title']['en-US'] = g['title']['la'].replace('Epistolae', 'Letters').replace('-', '–')
    book['toc'] = [g for g in book['toc'] if g['id'] != 'eales-additions']
    book['toc'].append({'id': 'eales-additions', 'title': {'en-US': "Letters Added in Eales's Edition", 'pt-BR': 'Cartas acrescentadas na edição de Eales'}, 'children': extra})
    print('words', words, 'english-only', len(extra))
    book['languages'] = ['la', 'en-US']
    book['editions']['en-US'] = {'translator': 'Samuel J. Eales', 'year': '1889–1896'}
    book['description']['en-US'] = re.sub(r" Latin only, from a machine-corrected OCR\.", " Latin from a machine-corrected OCR.", book['description']['en-US'])
    if 'Eales' not in book['description']['en-US']:
        book['description']['en-US'] += (" The English is Samuel J. Eales's (Life and Works of Saint Bernard, 1889–1896), with his notes: his numbering follows the Latin to 419, "
                                         "and the letters he adds (charters, letters to Bernard, and those found by Hüffer and others) follow the Latin as an English-only group.")
    book['sources'] = [x for x in book['sources'] if x['language'] != 'en-US'] + [{
        'language': 'en-US', 'url': 'https://archive.org/details/saintbernardlife00bernuoft',
        'edition': "Life and Works of Saint Bernard, Abbot of Clairvaux, ed. Dom John Mabillon, translated and edited with additional notes by Samuel J. Eales: "
                   "vols. 1-2, second edition (London: Burns & Oates, n.d.; archive.org saintbernardlife00bernuoft, saintbernardlife02bernuoft), "
                   "letters I-CCCLXXX; vol. 3 (London: John Hodges, 1896; archive.org lifeworksofsaint03bern), letters CCCLXXXI-CDXC.",
        'description': "Archive.org OCR read from the word-coordinate files and cleaned by script, not proofread: running heads, page numbers and signature marks dropped, "
                       "the translator's footnotes told from the text by their type and placed at their marker (or, where the OCR lost the marker, at the end of the text of their page). "
                       "Eales's numbering is the Latin's for letters 1-419; his 420-454 are Latin 421-455, his 455 is Latin 420, and his 485-488 are Latin 457-460, "
                       "so those chapters carry a line giving his number. His 456-484, 489 and 490 (charters, letters to Bernard, and the appendix of letters found since Mabillon) have no Latin here and are English-only chapters. "
                       "Latin 456 (to Raymond, a doubtful letter) has no English. Letters 42 and 77 are given by Eales only as a note sending the reader to the treatises.",
        'tier': 'A', 'tierEvidence': 'Eales died in 1910; the volumes were printed 1889-1896: public domain in the US.'}]
    book['arrived'] = dict(book.get('arrived') or {}, **{'en-US': '2026-11-03'})
    json.dump(book, open(BOOK + '/book.json', 'w'), ensure_ascii=False, indent=2)
    open(BOOK + '/book.json', 'a').write('\n')


if __name__ == '__main__':
    main()
