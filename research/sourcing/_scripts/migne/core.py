"""Shared cleaning for the Migne 1856 OCR of Bérulle and Olier (two columns, running heads, hyphenation)."""
import re, json, os, sys
from pathlib import Path
from collections import Counter

ROOT = Path('/Users/gustavo/Documents/prayer')
END = re.compile(r'[.!?:;»"”)\]]\s*$')
HEAD_WORDS = re.compile(r"C[O0]M[PI]L|CARD[IL1]|CAUD|BER[UL1I]|OLIER|OL1EU|ŒUVRES|OEUVRES|CEUVRES|CEIVRES", re.I)


def upper_ratio(s):
    letters = [c for c in s if c.isalpha()]
    return sum(c.isupper() for c in letters) / len(letters) if letters else 0


import difflib
REF = ['CONTROVERSE', 'COMPLETES', 'CARDINAL', 'BERULLE', 'EUCHARISTIE', 'GRANDEURS', 'LETTRES', 'OEUVRES', 'PIETE', 'REGLEMENT', 'OLIER', 'MEMOIRES', 'CATECHISME', 'INTRODUCTION', 'JOURNEE', 'CEREMONIES', 'ORDRES', 'ENERGUMENES', 'MEMORIAL', 'DIRECTION']
EXTRA_REF = []


def _norm(t):
    return t.upper().translate(str.maketrans('ÉÈÊÀÂÎÔÛŒÇ', 'EEEAAIOUOC'))


def looks_runhead(s):
    if len(s) > 110 or upper_ratio(s) < 0.75:
        return False
    if not re.search(r'[—–\-]|\d{2,4}\s*$|^\W*\d{2,4}', s):
        return False
    for t in re.findall(r"[A-Za-zÀ-ÿŒ]{5,}", s):
        for r in REF + EXTRA_REF:
            if difflib.SequenceMatcher(None, _norm(t), r).ratio() >= 0.72:
                return True
    return False


def is_runhead(s, extra=None):
    s = s.strip()
    if looks_runhead(s):
        return True
    if not s:
        return False
    if re.fullmatch(r'[\d\sIil|.,\-—_=~^*<>■§•]{1,6}', s):
        return True
    if len(s) < 100 and upper_ratio(s) > 0.6 and HEAD_WORDS.search(s) and re.search(r"COMPL|CARD|ŒUVRES|OEUVRES|CEUVRES", s, re.I):
        return True
    if extra and extra.search(s):
        return True
    return False


def join(lines):
    t = ''
    for ln in lines:
        ln = re.sub(r'\s+', ' ', ln.strip())
        if not t:
            t = ln
        elif re.search(r'[A-Za-zÀ-ÿ]-$', t) and re.match(r'[a-zà-ÿ]', ln):
            t = t[:-1] + ln
        else:
            t += ' ' + ln
    return t.strip()


def blocks(lines, extra=None):
    """Blank-separated blocks, page furniture dropped. Page-break splits are re-merged."""
    out, cur = [], []
    for ln in lines:
        ln = ln.replace('\x0c', '')
        if not ln.strip():
            if cur:
                out.append(cur); cur = []
            continue
        if is_runhead(ln, extra):
            continue
        cur.append(ln)
    if cur:
        out.append(cur)
    return [join(b) for b in out]


def merge(paras):
    res = []
    for p in paras:
        if res and not END.search(res[-1]) and p[:1].islower() and not res[-1].startswith('#'):
            prev = res[-1]
            res[-1] = (prev[:-1] + p) if re.search(r'[A-Za-zà-ÿ]-$', prev) else prev + ' ' + p
        else:
            res.append(p)
    return res


# ---- spelling by vote against the corpus vocabulary -------------------------------------------
WORD = re.compile(r"[A-Za-zÀ-ÿŒœ]+")
_vocab = None


def vocab():
    global _vocab
    if _vocab is None:
        c = Counter()
        for p in (ROOT / 'content/books').glob('*/*/fr-FR/*.md'):
            if any(x in p.parts[-4] for x in ('berulle', 'olier')):
                continue
            c.update(w.lower() for w in WORD.findall(p.read_text(encoding='utf-8')))
        _vocab = c
    return _vocab


GROUPS = ['ilt1j!|', 'ceo', 'nuvr', 'ao', 'hb', 'sf', 'vy', 'mn', 'gq', 'dl', 'ei']
PAIRS = [('ii', 'u'), ('ii', 'n'), ('li', 'h'), ('rn', 'm'), ('iii', 'm'), ('oii', 'on'), ('tl', 'd'), ('cl', 'd'), ('ri', 'n'), ('ni', 'm'), ('lt', 'h')]
SUBS = []
for g in GROUPS:
    for a in g:
        for b in g:
            if a != b:
                SUBS.append((a, b))
SUBS += PAIRS + [(b, a) for a, b in PAIRS]
LETTERS = 'abcdefghijklmnopqrstuvwxyzéèêàâîôûçœ'


def edits1(w):
    out = set()
    for a, b in SUBS:
        start = 0
        while True:
            k = w.find(a, start)
            if k < 0:
                break
            out.add(w[:k] + b + w[k + len(a):])
            start = k + 1
    for i in range(len(w)):
        out.add(w[:i] + w[i + 1:])
    return out


def candidates(w):
    one = edits1(w)
    if len(w) >= 7:
        two = set()
        for x in one:
            two |= edits1(x)
        return one | two
    return one


def spell(text, minfreq=6):
    V = vocab()
    local = Counter(w.lower() for w in WORD.findall(text))
    cache = {}
    def fix(m):
        w = m.group(0)
        lw = w.lower()
        if len(lw) < 4 or V[lw] >= 3 or local[lw] >= 4:
            return w
        if lw not in cache:
            cands = [(V[c], c) for c in candidates(lw) if V[c] >= minfreq]
            cands.sort(reverse=True)
            if not cands or (len(cands) > 1 and cands[0][0] < 3 * cands[1][0]):
                cache[lw] = None
            else:
                cache[lw] = cands[0][1]
        r = cache[lw]
        if r is None:
            return w
        if w.isupper():
            return r.upper()
        return r.capitalize() if w[0].isupper() else r
    return WORD.sub(fix, text)


def fix_fr(s):
    s = re.sub(r"\b[Ll]\s*['’]\s*", lambda m: m.group(0).replace(' ', ''), s)
    s = s.replace('“', '«').replace('”', '»')
    s = re.sub(r'\s+([;:!?»])', r' \1', s)
    s = re.sub(r'«\s+', '« ', s)
    s = re.sub(r'\s*\.\s*\.\s*\.', '…', s)
    s = s.replace("'", '’')
    s = re.sub(r'\b[Ll]\s*’\s*', lambda m: m.group(0).replace(' ', ''), s)
    return s.strip()


def clean_paras(bl, do_spell=True):
    ps = merge([b for b in bl if b])
    ps = [fix_fr(p) for p in ps]
    if do_spell:
        ps = [spell(p) for p in ps]
    return ps


def write_md(path, title, paras, lead=None):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    body = []
    if lead:
        body.append('*' + lead + '*')
    body += paras
    path.write_text(f'# {title}\n\n' + '\n\n'.join(body) + '\n', encoding='utf-8')
    return sum(len(p.split()) for p in body)

# ---- chapter boundaries by the "summary paragraph then text, both starting with I." signal -----
ONE = re.compile(r'^(?:1|I|l|Il|\|)\s?[.,]\s')
SUMM = re.compile(r'[—-]\s*(?:II|Il|Ii|11|IL)\s?[.,].*[—-]\s*(?:III|Ill|111|IIl|Ili)\s?[.,]|[—-]\s*(?:II|Il|Ii|11|IL)\s?[.,]')


def find_openers(bl, minsumm=1):
    """index of the first block of each chapter head: caps title blocks, then a summary block, then the text block starting 'I.'"""
    idx = []
    for i in range(1, len(bl)):
        if ONE.match(bl[i]) and SUMM.search(bl[i - 1]) and not ONE.match(bl[i - 1][:6] + ' '):
            s = i - 1
            while s - 1 >= 0 and len(bl[s - 1]) < 260 and upper_ratio(bl[s - 1]) > 0.55 and i - s < 5:
                s -= 1
            idx.append(s)
    return idx


# ---- sections by heading regex -------------------------------------------------------------------
def roman(s):
    s = s.upper().replace('Ï', 'I').replace('Î', 'I').replace('|', 'I').replace('!', 'I').replace('1', 'I').replace('H', 'II').replace('Ï', 'I').replace('U', 'V')
    s = re.sub(r'[^IVXL]', '', s)
    s = re.sub(r'L$', 'I', s)
    s = s.replace('L', 'I') if not s.startswith('L') else s
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50}
    t = 0
    for a, b in zip(s, s[1:] + ' '):
        v = vals[a]
        t += -v if vals.get(b, 0) > v else v
    return t


def sections(L, a, b, head_re, word, extra=None):
    """Split lines a..b at headings matching head_re (group 1 = numeral). Returns [(num, lines)], and a lead (lines before the first heading)."""
    marks = []
    for i in range(a, b):
        m = head_re.match(L[i].strip())
        if m:
            g = m.group(1)
            n = 1 if g.upper().startswith('PREM') else roman(g)
            prev = marks[-1][1] if marks else 0
            if n <= prev or n > prev + 3:
                n = prev + 1
            marks.append((i, n))
    if extra:
        marks = sorted(marks + [(i, n) for i, n in extra.items()])
    secs = []
    for k, (i, n) in enumerate(marks):
        j = marks[k + 1][0] if k + 1 < len(marks) else b
        secs.append((n, L[i + 1:j]))
    lead = L[a:marks[0][0]] if marks else L[a:b]
    return lead, secs


def subtitle_and_body(bl):
    """Leading caps blocks become the subtitle (if they read as French); the rest is the body."""
    k = 0
    sub = []
    while k < len(bl) and k < 4 and upper_ratio(bl[k]) > 0.6 and len(bl[k]) < 400 and not re.search(r'[a-z]{5,}', bl[k]):
        sub.append(bl[k]); k += 1
    return ' '.join(sub), bl[k:]


def readable(t):
    V = vocab()
    ws = [w.lower() for w in WORD.findall(t) if len(w) > 2]
    return bool(ws) and all(V[w] >= 2 for w in ws) and not re.search(r'[\^<>{}|\[\]\d]|\b[a-z]\b', t.replace('’', ' ').replace("'", ' ').lower().replace(' a ', ' ').replace(' à ', ' '))


def title_from(prefix, sub):
    sub = fix_fr(sub).strip(' .—-')
    sub = re.sub(r'\s*-\s+', '', sub) if False else sub
    if sub and readable(sub) and len(sub) < 200:
        s = sub.lower()
        s = s[0].upper() + s[1:]
        s = re.sub(r'\b(jésus|dieu|marie|christ|vierge|trinité|incarnation|eucharistie|esprit|père|fils|verbe)\b', lambda m: m.group(1).capitalize(), s)
        return f'{prefix}. {s}'
    return prefix


def rom_pieces(s):
    s = s.upper().replace('Ï', 'I').replace('Î', 'I').replace('|', 'I').replace('1', 'I').replace('!', 'I').replace('Y', 'V').replace('U', 'V').replace('H', 'II')
    s = re.sub(r'[^IVXLC]', '', s)
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
    t = 0
    for a, b in zip(s, s[1:] + ' '):
        v = vals[a]
        t += -v if vals.get(b, 0) > v else v
    return t


PIECE = re.compile(r"^\W{0,3}§?\s*([IVXLClÏÎ1|!yYuUhH]{1,9})\s?[.,:]\s{1,8}(\S.*)$")


def find_pieces(L, a, b, maxn, jump=4, minupper=0.6, start=0):
    prev, out = start, []
    for i in range(a, b):
        m = PIECE.match(L[i].strip())
        if not m or is_runhead(L[i]):
            continue
        rest = m.group(2)
        if upper_ratio(rest) < minupper:
            continue
        n = rom_pieces(m.group(1))
        if prev < n <= min(prev + jump, maxn):
            out.append((n, i)); prev = n
    return out
