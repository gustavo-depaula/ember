"""Marmion/Chautard import library: archive.org OCR dump -> chapters (paragraphs, running heads, page-bottom notes)."""
import re, os, json, sys, collections
sys.path.insert(0, os.path.dirname(__file__))
import bookjson
ROOT = '/Users/gustavo/Documents/prayer/'
SRC = ROOT + 'research/sourcing/'
ROM = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI','XXII','XXIII','XXIV','XXV','XXVI','XXVII','XXVIII','XXIX','XXX']

def load(path):
    return open(path, errors='replace').read().replace('\x0c', '').split('\n')

def hyphen_vocab(lines):
    hy, plain = set(), set()
    for l in lines:
        for w in re.findall(r"[A-Za-zÀ-ÿŒœ’']+(?:-[A-Za-zÀ-ÿŒœ’']+)+", l):
            hy.add(w.lower())
        for w in re.findall(r"[A-Za-zÀ-ÿŒœ’']+", l):
            plain.add(w.lower())
    return hy, plain

def caps_ratio(t):
    L = [c for c in t if c.isalpha()]
    return sum(c.isupper() for c in L) / len(L) if L else 0

def blocks(lines):
    out, cur = [], []
    for ln in lines:
        if ln.strip():
            cur.append(re.sub(r'\s+', ' ', ln.strip()))
        elif cur:
            out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def join(ls, V):
    hy, plain = V
    s = ''
    for ln in ls:
        if s.endswith('-') and ln[:1].islower() and not s.endswith(' -') and not s.endswith('--'):
            a = re.search(r"([\wÀ-ÿ’']+)-$", s); b = re.match(r"([\wÀ-ÿ’']+)", ln)
            if a and b and (a.group(1) + '-' + b.group(1)).lower() in hy and (a.group(1) + b.group(1)).lower() not in plain:
                s = s + ln
            else:
                s = s[:-1] + ln
        else:
            s = (s + ' ' + ln) if s else ln
    return s.strip()

def hkey(t):
    t = re.sub(r'^[\dIVXLOolSsTtBbi!|]{1,4}(?=\s)\s*', '', t.strip())
    t = re.sub(r'\s*(?<=\s)[\dIVXLOolSsTtBbi!|,]{1,4}\W*$', '', t)
    return re.sub(r'[^A-Za-zÀ-ÿ]', '', t).lower()

NUMONLY = re.compile(r'^[\dIil|!.,\s]{1,5}$')
def is_head(t, freq):
    if len(t) > 110: return False
    if NUMONLY.match(t) and re.search(r'\d', t): return True
    cr = caps_ratio(t)
    key = hkey(t)
    if cr >= 0.6 and len(key) >= 6:
        if re.match(r'^[\dIl!|iAÛ\W]{1,6}\s', t) and re.search(r'\d', t[:5]): return True
        if re.search(r'\s[\dIl!|i,]{1,5}\W*$', t) and re.search(r'\d', t[-6:]): return True
        if freq[key] >= 4: return True
    return False

FN_START = re.compile(r'^(?:[1-9]\d?|[iIlrT!\[]{1,2})\s?[\.,)\]]\s*\S')
def is_note(t):
    if len(t) > 420: return False
    if FN_START.match(t) and re.search(r'[A-Za-z]', t[3:]): return True
    return bool(re.search(r'\s[—-]\s*[2-4]\s?[\.,)]', t) and len(t) < 300)

LONEROM = re.compile(r'^[IVXLivxlTtHhÎîÏï1!|]{1,5}[.,]?$')

def chapter(lines, V, lang, drop=(), lead_drop=True, marker=None):
    """lines -> (paras, notes). Handles running heads, page notes, section numerals."""
    freq = collections.Counter()
    bl = blocks(lines)
    joined = [join(b, V) for b in bl]
    for t in joined:
        if len(t) < 110:
            freq[hkey(t)] += 1
    return joined, freq

def junk(t):
    if len(t) >= 130: return False
    a = sum(c.isalpha() or c == ' ' for c in t) / max(len(t), 1)
    ws = t.split()
    return a < .8 or (ws and sum(len(w) for w in ws) / len(ws) < 3.2) or not re.search(r'[.!?»”"\')\]]\s*(\[\^\d+\])*$', t)

def build_chapter(joined, freq, lang, fix, nsec_start=0, keep_lead=False, drop=(), sections=True):
    # leading title blocks: caps or parenthetical, up to the first long block
    i = 0
    while not keep_lead and i < len(joined) and i < 6 and (joined[i] == '' or ((caps_ratio(joined[i]) > .6 or joined[i].startswith('(') or len(joined[i]) < 60) and len(joined[i]) < 130 and not re.match(r'^(Sommaire|Summary|SOMMAIRE|SUMMARY)', joined[i], re.I) and not LONEROM.match(joined[i]))):
        i += 1
    body = joined[i:]
    # trailing title blocks of the next chapter
    while body and len(body[-1]) < 130 and (caps_ratio(body[-1]) > .6 or body[-1].startswith('(') or (junk(body[-1]) and not is_note(body[-1]))):
        body.pop()
    pages = [{'body': [], 'fn': []}]
    for t in body:
        if any(re.search(d, t) for d in drop): continue
        if is_head(t, freq):
            pg = pages[-1]
            if pg['body'] and is_note(pg['body'][-1]) and not pg['fn']:
                pg['fn'].append(pg['body'].pop())
            pages.append({'body': [], 'fn': []}); continue
        pages[-1]['body'].append(t)
    out, notes, n = [], {}, 0
    SENT = re.compile(r'[.!?»"”:;…)\]*]\s*(\[\^\d+\])*\s*$')
    for pg in pages:
        body = pg['body']
        refs = ''
        for t in pg['fn']:
            n += 1; notes[n] = fixnote(t, lang); refs += f'[^{n}]'
        if refs:
            if body: body[-1] += refs
            else: out.append(refs)
        for b in body:
            if out and not out[-1].startswith('## ') and not re.search(r'[?!»]\s*(\[\^\d+\])*\s*$', out[-1]) and b[:1].islower() and not b.startswith('['):
                m = re.search(r'((?:\[\^\d+\])+)\s*$', out[-1])
                tail = m.group(1) if m else ''
                prev = out[-1][:m.start()] if m else out[-1]
                m2 = re.search(r'((?:\[\^\d+\])+)\s*$', b)
                out[-1] = prev.rstrip() + ' ' + b + (tail if not m2 else tail)
            else:
                out.append(b)
    # section numerals (OCR confusions normalised; a missing numeral stays missing)
    res, k = [], nsec_start
    for p in out:
        if LONEROM.match(p) and len(p) <= 6:
            if not sections: continue
            q = re.sub(r'[.,]', '', p).replace('v', 'V')
            q = re.sub(r'[lLi!|1ÎîÏïTt]', 'I', q).replace('H', 'II').replace('h', 'II')
            q = re.sub(r'VV+', 'V', q)
            v = ROM.index(q) + 1 if q in ROM[:12] else k + 1
            k = v if v > k else k + 1
            res.append(f'## {ROM[k-1]}'); continue
        res.append('### Note' if re.fullmatch(r'NOTES?\.?', p) else fix(p))
    return res, notes

def fixnote(t, lang):
    t = re.sub(r'^[iIlrT!\[]{1,2}\s?[\.,)]\s*', '1. ', t) if not re.match(r'^\d', t) else t
    return t

def clean_marks(p, lang):
    # strip stray footnote call digits glued to words/punctuation
    p = re.sub(r'(?<=[a-zà-ÿ])\d{1,2}(?=[\s.,;:!?»”)’]|$)', '', p)
    p = re.sub(r'(?<=[.,;:!?»”])\d{1,2}(?=\s|$)', '', p)
    return p

def fix_fr(s):
    s = clean_marks(s, 'fr')
    s = s.replace('“', '« ').replace('”', ' »').replace("'", '’')
    s = re.sub(r'\bàme', 'âme', s)
    s = re.sub(r'\s+([;:!?»])', r' \1', s)
    s = re.sub(r'(?<=[a-zà-ÿ\)])([;:!?])(?=\s)', r' \1', s) if False else s
    s = re.sub(r'«\s*', '« ', s)
    s = s.replace('œ ', 'œ ')
    s = re.sub(r'\s+', ' ', s)
    return s

def fix_en(s):
    s = clean_marks(s, 'en')
    s = re.sub(r'\s+([;:!?,.])', r'\1', s) if False else s
    return re.sub(r'\s+', ' ', s)

def render(title, paras, notes):
    t = [f'# {title}', '']
    for p in paras:
        t += [p, '']
    for k in sorted(notes):
        t += [f'[^{k}]: {notes[k]}', '']
    return '\n'.join(t).rstrip() + '\n'

def split(lines, starts):
    """starts: list of regex (str) matched sequentially against stripped, whitespace-collapsed lines; returns list of line ranges."""
    idx, pos = [], 0
    for rx in starts:
        r = re.compile(rx)
        j = next((i for i in range(pos, len(lines)) if r.search(re.sub(r'\s+', ' ', lines[i].strip()))), None)
        if j is None: raise SystemExit('no match: ' + rx + ' after ' + str(pos))
        idx.append(j); pos = j + 1
    return idx

def words(path):
    import glob
    n = 0
    for f in glob.glob(path + '/*.md'):
        n += len(open(f).read().split())
    return n

def make_book(folder, bid, work, names, authors, descs, composed, langs, editions, sources, toc, author_en='Bl. Columba Marmion', cover=None):
    """names/authors/descs: dict lang->str (include en-US and pt-BR). toc: list of (id, {lang: title})."""
    d = {'id': bid, 'name': names, 'author': authors, 'description': descs, 'composed': composed, 'languages': langs,
         'work': work, 'editions': editions, 'sources': sources,
         'toc': [{'id': i, 'title': t} for i, t in toc]}
    if cover: d['cover'] = cover
    bookjson.write(folder, d)
