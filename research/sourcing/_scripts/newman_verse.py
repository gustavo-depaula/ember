"""Newman Reader verse pages (one <td> per line inside a table) -> markdown with hard line breaks.
convert(url, title) -> (markdown, warnings); index_titles(path) -> {pageurl: link text}."""
import re, html, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import newman_nr as n

def index_titles(path):
    b = n.body(n.ROOT + path)
    d = n.ROOT + path.rsplit('/', 1)[0] + '/'
    out = {}
    for num, h, t in re.findall(r'<td[^>]*>(?:\s|&nbsp;)*(\d+)\.(?:\s|&nbsp;)*</td>\s*<td[^>]*><a href="([^"#]+\.html)">(.*?)</a>', b, re.S):
        out[d + h] = '%s. %s' % (num, n.norm(t))
    return out

def convert(url, title):
    b = n.body(url)
    j = b.find('</h2>')
    end = b.find('</table>', b.rfind('<td', 0, b.find('Top</a>')) if 'Top</a>' in b else None)
    seg = b[j:b.find('<a href="#top">')] if '<a href="#top">' in b else b[j:]
    cells = re.findall(r'<td[^>]*>(.*?)</td>', seg, re.S | re.I)
    out, warn = [], []
    for c in cells:
        lead_break = bool(re.match(r'^\s*(?:<[^>]*>\s*)*<br', c, re.I))
        if re.fullmatch(r'\d+\.', n.norm(c)):
            out.append(('num', n.norm(c))); continue
        if re.search(r'<i>', c):
            t = n.inline(c, para=True)
            if t: out.append(('line', t, 0, lead_break))
            continue
        first = True
        for pc in re.split(r'<br\s*/?>', c):
            indent = len(re.findall(r'&nbsp;|\xa0', re.match(r'^(?:\s|&nbsp;|\xa0|<[^>]*>)*', pc).group(0)))
            t = n.inline(pc, para=False)
            t = re.sub(r'^([A-Z]) ([A-Z]{2,})\b', lambda m: n._join(m.group(1), m.group(2)) if m.group(1) != 'O' else 'O ' + m.group(2).lower(), t)
            t = re.sub(r'^([IA])([A-Z]{2,})\b', lambda m: n._join(m.group(1), m.group(2)), t)
            if not t: continue
            out.append(('line', t, indent, lead_break and first)); first = False
    # assemble
    lines = []
    for item in out:
        if item[0] == 'num': lines.append(('num', item[1])); continue
        _, t, ind, br = item
        if br and lines and lines[-1][0] != 'gap': lines.append(('gap',))
        if ind >= 5 and lines and lines[-1][0] == 'line' and not re.search(r'[,.;:!?—)\'"”’*\]]\s*$', lines[-1][1]):
            lines[-1] = ('line', lines[-1][1] + ' ' + t); continue
        lines.append(('line', t))
    md = ['# ' + title, '']
    buf = []
    def flush():
        if buf:
            buf[0] = n.dropcap(buf[0])
            md.append('  \n'.join(buf)); md.append(''); buf.clear()
    for it in lines:
        if it[0] == 'gap': flush()
        elif it[0] == 'num': flush(); md += ['**' + it[1] + '**', '']
        else: buf.append(it[1])
    flush()
    text = '\n'.join(md)
    refs = re.findall(r'\x00(\d+)\x01', text)
    text = re.sub(r'\x00(\d+)\x01', lambda m: '[^%s]' % m.group(1), text)
    full, w = n.convert(url, title)
    defs = n.LAST_NOTES
    text = text.rstrip() + '\n'
    if refs:
        text += '\n' + '\n'.join('[^%s]: %s' % (r, defs.get(r, '')) for r in dict.fromkeys(refs)) + '\n'
        for r in refs:
            if r not in defs: warn.append('%s: ref %s has no note' % (url, r))
    return re.sub(r'\n{3,}', '\n\n', text), warn

def dedication():
    """The dedication to Badeley, which sits on the index page under the 'dedication' anchor."""
    b = n.body(n.ROOT + 'verses/index.html')
    i = b.find('name="dedication"'); j = b.find('<a href="#top">', i)
    out = ['# Dedication', '']
    for t, x in n.blocks(b[i:j]):
        if t in ('h2', 'h3', 'h4'): continue
        tx = n.inline(x) if t == 'p' else x
        if tx: out += [n.dropcap(tx) if t == 'p' else '> ' + tx, '']
    return '\n'.join(out).rstrip() + '\n', []
