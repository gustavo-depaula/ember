"""Shared Newman Reader (cached HTML in research/sourcing/newman/nr-html) -> markdown converter.
Used by the newman_*.py book scripts. A page becomes one chapter: h2 title, h3/h4 subheads,
paragraphs, blockquotes, verse (<br> -> hard break), the page's Notes as [^N] footnotes."""
import re, hashlib, html, os, urllib.parse
CACHE = os.path.join(os.path.dirname(__file__), '..', 'newman', 'nr-html')
ROOT = 'https://www.newmanreader.org/works/'

def load(url):
    t = open(os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest() + '.html'), 'rb').read()
    try: s = t.decode('utf-8')
    except UnicodeDecodeError: s = t.decode('cp1252')
    return s

def body(url):
    s = load(url)
    return s[s.find('<body'):]

def index_links(path):
    """Ordered unique page paths (relative to ROOT) linked from the work's index, same directory only."""
    url = ROOT + path
    d = url.rsplit('/', 1)[0] + '/'
    out = []
    for h in re.findall(r'href="([^"#]+)', body(url)):
        v = urllib.parse.urljoin(url, h)
        if v.startswith(d) and v.endswith('.html') and not v.endswith('index.html') and v not in out:
            out.append(v)
    return out

def inline(h, para=True):
    h = re.sub(r'<font[^>]*><b>\[</b></font>.*?NR\]</b></font>', '', h, flags=re.S)
    h = re.sub(r'</?font[^>]*>', '', h)
    def _marker(m):
        t = m.group(0)
        num = re.search(r'name="return(\d+)"', t) or re.search(r'(?:Notes?|Name)\s*(\d+)', re.sub(r'<[^>]*>', ' ', t)) or re.search(r'href="#note(\d+)"', t)
        return '\x00%s\x01' % (num.group(1) if num else '1')
    h = re.sub(r'\[(?:(?!\]).){0,250}?href="#note\s*\d*"[^>]*>(?:\s|<[^>]*>)*(?:Notes?|Name)[\s\d]*</a>(?:</u>)?\]', _marker, h, flags=re.S)
    h = re.sub(r'<a href="#return\d+">Return to text</a>', '', h)
    h = re.sub(r'<a name="[^"]*"></a>', '', h)
    h = re.sub(r'<br\s*/?>', '\x02', h)
    h = re.sub(r'<(?!/?(?:i|em|b)\b)[^>]+>', '', h)
    def split_ital(m):
        segs = re.split(r'(\s*\x02\s*)', m.group(2))
        return ''.join('<i>%s</i>' % x if i % 2 == 0 and x.strip() else x for i, x in enumerate(segs))
    h = re.sub(r'<(i|em)>(.*?)</\1>', split_ital, h, flags=re.S)
    h = re.sub(r'(?:&nbsp;|\xa0){3,}\s*', ' \x03 ', h)
    h = re.sub(r'<(i|em)>(\s*\x02\s*)</\1>', r'\2', h)
    h = re.sub(r'<(i|em)>\s*</\1>', ' ', h)
    h = re.sub(r'<(i|em)>(\s*)', r'\2*', h); h = re.sub(r'(\s*)</(i|em)>', r'*\1', h)
    h = re.sub(r'<b>', '**', h); h = re.sub(r'</b>', '**', h)
    h = html.unescape(h).replace('\xa0', ' ')
    h = re.sub(r'(?<=\S)\{\d+\}(?=\S)', '', h)
    h = re.sub(r'\s*\{\d+\}\s*', ' ', h)
    h = re.sub(r'(^|\x02)\s*\x03\s*', r'\1', h)
    h = h.replace('\x03', '—')
    h = re.sub(r'\s*\x02\s*', '\x02', h)
    h = re.sub(r'[ \t\r\n]+', ' ', h).strip()
    h = h.replace('\x02', '  \n') if para else h.replace('\x02', ' ')
    h = re.sub(r'\*\*\s*\*\*', '', h); h = re.sub(r'\*\s+\*', ' ', h); h = re.sub(r'\*\*(\s*)\*\*', r'\1', h)
    return h.strip()

PRE = r'((?:\x00\d+\x01 ?)?(?:\d+\. )?[\u201c"\u2018\']?)'

_D = None
def _word(w, stem=True):
    global _D
    if _D is None:
        try: _D = set(x.strip().lower() for x in open('/usr/share/dict/words', errors='ignore'))
        except OSError: _D = set()
        _D |= {'about', 'have', 'am', 'was', 'shall', 'will', 'would', 'cannot'}
    w = w.lower()
    return w in _D or (stem and any(x in _D for x in (w[:-1], w[:-2], w[:-3] if w.endswith('ing') else w)))

def _join(L, X):
    """Small capitals: 'C HARLES' -> 'Charles', but 'I HAVE' -> 'I have', 'A LETTER' -> 'A letter'."""
    if len(X) > 1 and L in 'IA' and _word(X) and not _word(L + X, False): return L + ' ' + X.lower()
    return L + X.lower()

def smallcaps(t):
    for _ in range(4):
        m = re.match('^' + PRE + r'([A-Z]) ([A-Z]+)\b(?! [A-Z]{2})', t)
        if not m: break
        t = m.group(1) + _join(m.group(2), m.group(3)) + t[m.end():]
        m = re.match(r'^(.*?\b[A-Z][a-z]+ )([A-Z]) ([A-Z]+)\b', t)
        if m: t = m.group(1) + m.group(2) + m.group(3).lower() + t[m.end():]
    return t

def dropcap(t):
    t = smallcaps(t)
    m = re.match('^' + PRE + r'(I) ([A-Z]{2,})(?= [a-z])', t)
    if m and m.group(3) not in ('II', 'III', 'IV', 'VI'): return m.group(1) + 'I ' + m.group(3).lower() + t[m.end():]
    m = re.match('^' + PRE + r'([A-Z])([A-Z]+)(?=[ ,;:.\u2014] ?(?:[a-z"\'(*]|[A-Z](?![A-Z]))|[ ,;:.]$|[\u2019\'])', t)
    if m and not re.fullmatch(r'[IVXL]+', m.group(2) + m.group(3)):
        return m.group(1) + m.group(2) + m.group(3).lower() + t[m.end():]
    return t

def norm(b):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', b)).replace('\xa0', ' ').split())

def blocks(s):
    out = []
    s = re.sub(r'(<p\b[^>]*>(?:(?!</p>|<p\b).)*?)(?=<p\b)', r'\1</p>', s, flags=re.S | re.I)
    s = re.sub(r'<table\b(?:(?!<table\b).)*?</table>', lambda m: '' if 'href="#' in m.group(0) and m.group(0).count('<p') < 3 or '#</a>' in m.group(0) else m.group(0), s, flags=re.S | re.I)
    for m in re.finditer(r'<(h[1-4]|p|blockquote|pre)\b[^>]*>(.*?)</\1>|<hr>', s, re.S | re.I):
        if m.group(0) == '<hr>': out.append(('hr', '')); continue
        tag, b = m.group(1).lower(), m.group(2)
        if tag == 'blockquote':
            ps = re.findall(r'<p\b[^>]*>(.*?)</p>', b, re.S | re.I)
            for p in (ps or [b]):
                t = inline(p)
                if t: out.append(('q', t))
            continue
        if tag == 'p' and ('href="#top"' in b or norm(b).startswith('—NR') or ('Contents' in b and 'Works' in b and 'Home' in b) or ('Newman Reader' in b and 'Copyright' in b)): continue
        out.append((tag, b))
    return out

def convert(url, title=None, keep_first_heading=False):
    """-> (markdown, warnings). title: H1 text; the page's first h2 is dropped (it is the title)."""
    bl = blocks(body(url))
    nidx = next((k for k, (t, b) in enumerate(bl) if t == 'h3' and norm(b) in ('Note', 'Notes')), len(bl))
    notes, last = {}, None
    hm = re.search(r'name="note\s*(\d+)"', bl[nidx][1]) if nidx < len(bl) else None
    nxt = int(hm.group(1)) if hm else 1
    for t, b in bl[nidx + 1:]:
        if t != 'p': continue
        txt = re.sub(r'\s*(?:\[[^\]]*NR\*?\*?\])?\s*Return to text\s*$', '', inline(b, para=False))
        am = re.search(r'name="note\s*(\d+)"', b)
        mm = re.match(r'^(\d+)\.\s*(.*)$', txt, re.S)
        if am or (mm and int(mm.group(1)) == nxt):
            num = int(am.group(1)) if am else nxt
            if mm and int(mm.group(1)) == num: txt = mm.group(2)
            notes[str(num)] = txt; last = str(num); nxt = num + 1
        elif last: notes[last] += '\n\n' + txt
        else: notes[str(nxt)] = txt; last = str(nxt); nxt += 1
    warn = []
    first = True
    lines = ['# ' + (title or ''), '']
    for t, b in bl[:nidx]:
        if t == 'hr': continue
        if t in ('h1', 'h2', 'h3', 'h4'):
            raw = [x for x in (inline(x, para=False).replace('*', '') for x in re.split(r'<br\s*/?>', b)) if x]
            head = ' '.join(raw)
            if first and t in ('h1', 'h2'):
                first = False
                if title is None: lines[0] = '# ' + head
                continue
            first = False
            if not head or (title and head.rstrip('.') == title.rstrip('.')): continue
            lines += [('#' * (2 if t in ('h2', 'h3') else 3)) + ' ' + head, '']
            continue
        first = False
        txt = inline(b) if t in ('p', 'pre') else b
        if not txt: continue
        txt = '\n'.join(dropcap(l) if i == 0 else l for i, l in enumerate(txt.split('\n')))
        if t == 'q': txt = '\n'.join('> ' + l for l in txt.split('\n'))
        lines += [txt, '']
    text = '\n'.join(lines)
    refs = re.findall(r'\x00(\d+)\x01', text)
    text = re.sub(r'\x00(\d+)\x01', lambda m: '[^%s]' % m.group(1), text)
    text = text.rstrip() + '\n'
    if refs:
        for r in dict.fromkeys(refs):
            if r not in notes: warn.append('%s: ref %s has no note' % (url, r))
        text += '\n' + '\n'.join('[^%s]: %s' % (r, notes.get(r, '')) for r in dict.fromkeys(refs)) + '\n'
    unused = set(notes) - set(refs)
    if unused: warn.append('%s: notes without refs %s' % (url, sorted(unused, key=int)))
    return re.sub(r'\n{3,}', '\n\n', text), warn
