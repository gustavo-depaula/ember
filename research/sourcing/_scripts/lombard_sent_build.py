"""Split the Corpus Corporum TEI of Lombard's Sententiae (PL 192) into one file per distinction.
usage: lombard_sent_build.py <tei.xml> <book dir>"""
import json, re, sys
import xml.etree.ElementTree as ET

NS = '{http://www.tei-c.org/ns/1.0}'
src, out = sys.argv[1], sys.argv[2]
body = ET.parse(src).getroot().find(NS + 'text').find(NS + 'body')


def ws(s):
    return re.sub(r'\s+', ' ', s).strip()


def flat(e, drop_notes=False):
    """Text of an element, page breaks dropped; optionally also inline notes."""
    parts = [e.text or '']
    for c in e:
        if c.tag == NS + 'note' and drop_notes:
            pass
        else:
            parts.append(flat(c, drop_notes))
        parts.append(c.tail or '')
    return ''.join(parts)


def notes(e):
    return [ws(flat(n)) for n in e.iter(NS + 'note')]


def roman(n):
    r = ''
    for v, s in [(50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            r += s
            n -= v
    return r


proper = r'\b(deus|dei|deo|deum|christus|christi|christo|christum|adam|spiritus sanctus|spiritus sancti|spiritu sancto|spiritum sanctum|spiritus|sancti|sanctus|maria|virgine|joannis|augustini|ecclesia|ecclesiae|trinitatis|patris|filii|filius|pater)\b'
caps = {'spiritus sanctus', 'spiritus sancti', 'spiritu sancto', 'spiritum sanctum'}


def sentence(t):
    t = t.lower()
    t = re.sub(proper, lambda m: m.group(0).title() if m.group(0) in caps or m.group(0) in
               ('deus', 'dei', 'deo', 'deum', 'christus', 'christi', 'christo', 'christum', 'adam', 'maria',
                'joannis', 'augustini', 'trinitatis') else m.group(0), t)
    t = t.replace('Spiritus Sancti', 'Spiritus Sancti')
    return t[:1].upper() + t[1:]


def chapters(d2):
    res = []
    for d3 in d2.findall(NS + 'div3'):
        h = d3.find(NS + 'head')
        raw = ws(flat(h, True))
        hn = notes(h)
        m = re.match(r'(\d+)\.?\s*(.*)', raw)
        # two heads lost their number in the source (I d. 33?, III d. 2): it is the previous one plus 1
        num, title = (m.group(1), m.group(2).strip()) if m else (str(len(res) + 1), raw)
        lines = []
        if hn:
            lines.append('*' + ' '.join(hn) + '*')
        for p in d3.findall(NS + 'p'):
            t = ws(flat(p))
            if t:
                lines.append(t)
        res.append((('## ' + num + '. ' + title) if title else '## ' + num, lines))
    return res


def render(title, secs):
    o = ['# ' + title, '']
    for h, lines in secs:
        o += [h, ''] if h else []
        for l in lines:
            o += [l, '']
    return '\n'.join(o).rstrip() + '\n'


def write(id_, title, secs):
    open(f'{out}/la/{id_}.md', 'w').write(render(title, secs))


toc = []
nwords = 0
book = 0
cur = None
files = []
divs = []
# document order, with divs nested in the book-level div1
for c in body:
    t = c.tag[len(NS):]
    if t == 'div1':
        h = ws(flat(c.find(NS + 'head'), True))
        if h.startswith('LIBER'):
            book += 1
            sub = ws(re.sub(r'^LIBER \w+\.?', '', h))
            cur = {'id': f'liber-{book}', 'sub': sub, 'children': []}
            toc.append(cur)
            for d2 in c.findall(NS + 'div2'):
                divs.append((book, d2))
        elif h.startswith('PETRI LOMBARDI'):
            files.append(('prologus', 'Prologus', [('', [ws(flat(p)) for p in c.findall(NS + 'p')])]))
            toc.append({'id': 'prologus', 'title': 'Prologus'})
    elif t == 'div2':
        divs.append((book, c))
    elif t == 'note':
        for d1 in c.findall(NS + 'div1'):
            h = ws(flat(d1.find(NS + 'head'), True))
            if h.startswith('ARTICULI'):
                secs = [('', [ws(flat(p)) for p in d1.findall(NS + 'p')])]
                app = d1
            elif h.startswith('IN '):
                secs.append(('## ' + sentence(h.rstrip('.')), [ws(flat(p)) for p in d1.findall(NS + 'p')]))
app_secs = secs

counts = {}
books = {1: 'De mysterio Trinitatis', 2: 'De rerum corporalium et spiritualium creatione et formatione, aliisque pluribus eo pertinentibus', 3: 'De incarnatione Verbi', 4: 'De sacramentis et signis sacramentalibus'}
for b, d2 in divs:
    n = counts[b] = counts.get(b, 0) + 1
    h = ws(flat(d2.find(NS + 'head'), True))
    h = re.sub(r'^DI\w+\.?\s+(PRIMA|[IVXL]+)\.?\s*', '', h)
    h = re.sub(r'\s*\([^)]*\)\s*$', '', h)
    title = f'Distinctio {roman(n)}' + (f'. {sentence(h)}' if h else '')
    id_ = f'l{b}-d{n:02d}'
    files.append((id_, title, chapters(d2)))
    for node in toc:
        if node['id'] == f'liber-{b}':
            node['children'].append({'id': id_, 'title': title})
files.append(('articuli', 'Articuli in quibus Magister Sententiarum non tenetur communiter ab omnibus', app_secs))
toc.append({'id': 'articuli', 'title': 'Articuli in quibus Magister Sententiarum non tenetur communiter ab omnibus'})
for node in toc:
    if node['id'].startswith('liber-'):
        b = int(node['id'][-1])
        node['title'] = f'Liber {["", "Primus", "Secundus", "Tertius", "Quartus"][b]}. {books[b]}'
        del node['sub']
    node['title'] = {'la': node['title']}
    for ch in node.get('children', []):
        ch['title'] = {'la': ch['title']}
for id_, title, secs in files:
    write(id_, title, secs)
    nwords += len(render(title, secs).split())
json.dump(toc, open(f'{out}/toc.json', 'w'), ensure_ascii=False, indent=2)
print(counts, len(files), nwords)
