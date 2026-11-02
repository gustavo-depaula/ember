"""Parse the DCO Word dump of Bridget's Latin works into chapters.

Usage: import and call parse() -> dict book-key -> {'prologue': [paras], 'chapters': [(label, rubric, [paras])]}
"""
import re, collections

SRC = '/Users/gustavo/Documents/prayer/research/sourcing/bridget-of-sweden/dco/rev.txt'
raw = open(SRC, encoding='utf-8').read().replace('\xa0', ' ')
LINES = raw.splitlines()

HYP = re.compile(r'HYPERLINK\s+"[^"]*"(\s*\\l\s*"[^"]*")?\s*')

# word frequencies, for deciding whether a detached drop cap belongs to the next word
WORDS = collections.Counter(w.lower() for w in re.findall(r"[A-Za-zæ]+", raw))


def dropcap(m):
    a, b = m.group(1), m.group(2)
    joined = (a + b).lower()
    if WORDS[joined] >= 2:
        return a + b
    return a + ' ' + b


def clean_line(s):
    s = s.strip()
    s = re.sub(r'^"\s*(?=\{)', '', s)
    s = HYP.sub('', s)
    s = re.sub(r'\{\s*([A-Z])\s*,', r'\1,', s)
    s = re.sub(r'\{\s*([A-Z]) (?=[a-z])', lambda m: '\x00' + m.group(1) + ' ', s)
    s = re.sub(r'\x00([A-Z]) ([a-z]+)', lambda m: dropcap(m), s)
    s = s.replace('{', '')
    s = re.sub(r'(?<=[a-z])0\b', '', s)
    s = re.sub(r'^0\s+', '', s)
    s = re.sub(r'\s+([,.;:?!])', r'\1', s)
    s = re.sub(r'\s{2,}', ' ', s).strip()
    return s


def split_verses(s, n, minlen=700):
    """Strip sequential verse numbers; return (paragraphs, next expected verse)."""
    m = re.match(r'^(\d+)\s*(?=\S)', s)
    if m and int(m.group(1)) >= 2:
        n = int(m.group(1))
        s = s[m.end():]
    elif m and int(m.group(1)) == 1:
        s = s[m.end():]
        n = 1
    paras, cur = [], ''
    pos = 0
    while True:
        mm = None
        for skip in (1, 2, 3):
            pat = re.compile(r'(?<=[\s"\'.?!:;,)])%d(?=\s*[^\s\d])' % (n + skip))
            mm = pat.search(s, pos)
            if mm:
                n += skip - 1
                break
        if not mm:
            break
        seg = s[pos:mm.start()].strip()
        cur = (cur + ' ' + seg).strip() if cur else seg
        if len(cur) >= minlen and re.search(r'[.?!:"\'»]$', cur):
            paras.append(cur)
            cur = ''
        pos = mm.end()
        n += 1
    seg = s[pos:].strip()
    cur = (cur + ' ' + seg).strip() if cur else seg
    if cur:
        paras.append(cur)
    return paras, n + 1 if False else n


def book_ranges():
    heads = []
    for i, l in enumerate(LINES):
        m = re.match(r'\s*(LIB(?:ER|RI)|Libri) ([IVX]+)', l)
        if m:
            heads.append((m.group(2), i))
    out = {}
    for k, (b, i) in enumerate(heads):
        j = heads[k + 1][1] if k + 1 < len(heads) else len(LINES)
        out[b] = (i + 1, j)
    return out


CAPUT = re.compile(r'^Caput[\s:]*(\d+[a-z]?)\s*[:.]?\s*(.*)$')


def parse_standard(lo, hi):
    prologue, chapters = [], []
    cur = None
    n = 1
    for l in LINES[lo:hi]:
        if l.strip() == 'INDEX':
            break
        if not l.strip():
            continue
        m = CAPUT.match(l.strip())
        if m:
            cur = [m.group(1), clean_line(m.group(2)), []]
            chapters.append(cur)
            n = 1
            continue
        s = clean_line(l)
        if not s:
            continue
        paras, n = split_verses(s, 1)
        (cur[2] if cur else prologue).extend(paras)
    return prologue, chapters


def parse(book):
    lo, hi = book_ranges()[book]
    return parse_standard(lo, hi)
