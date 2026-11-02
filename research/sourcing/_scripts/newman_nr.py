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
    h = re.sub(r'\[<a name="return(\d+)"[^>]*>\s*Notes?\s*\d*\s*</a>\]', lambda m: '\x00%s\x01' % m.group(1), h)
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

def dropcap(t):
    m = re.match(r'^(I) ([A-Z]{2,})(?= [a-z])', t)
    if m and m.group(2) not in ('II', 'III', 'IV', 'VI'): return 'I ' + m.group(2).lower() + t[m.end():]
    m = re.match(r'^((?:\d+\. )?)([A-Z])([A-Z]{1,})(?=[ ,;:.—] ?[a-z"\'(*A-Z]|[ ,;:.]$| [a-z"\'(*]|’)', t)
    if m and m.group(2) + m.group(3) not in ('II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'XI', 'XII'):
        return m.group(1) + m.group(2) + m.group(3).lower() + t[m.end():]
    return t

def norm(b):
    return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', b)).replace('\xa0', ' ').split())

def blocks(s):
    out = []
    for m in re.finditer(r'<(h[1-4]|p|blockquote|pre)\b[^>]*>(.*?)</\1>|<hr>', s, re.S | re.I):
        if m.group(0) == '<hr>': out.append(('hr', '')); continue
        tag, b = m.group(1).lower(), m.group(2)
        if tag == 'blockquote':
            ps = re.findall(r'<p\b[^>]*>(.*?)</p>', b, re.S | re.I)
            for p in (ps or [b]):
                t = inline(p)
                if t: out.append(('q', t))
            continue
        if tag == 'p' and ('href="#top"' in b or ('Newman Reader' in b and 'Copyright' in b)): continue
        out.append((tag, b))
    return out

def convert(url, title=None, keep_first_heading=False):
    """-> (markdown, warnings). title: H1 text; the page's first h2 is dropped (it is the title)."""
    bl = blocks(body(url))
    nidx = next((k for k, (t, b) in enumerate(bl) if t == 'h3' and norm(b) in ('Note', 'Notes')), len(bl))
    notes = {}
    for t, b in bl[nidx + 1:]:
        if t != 'p': continue
        txt = inline(b, para=False)
        mm = re.match(r'^(\d+)\.\s*(.*)$', txt, re.S)
        if mm: notes[mm.group(1)] = mm.group(2)
        elif notes: notes[max(notes, key=int)] += ' ' + txt
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
            if not head or (title and head == title): continue
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
