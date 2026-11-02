"""Split the Corpus Corporum TEI of Lombard's Psalm commentary (PL 191) or Pauline Collectanea (PL 191-192).
usage: lombard_comm_build.py psalms|paul <book dir> <tei.xml>...    -> <dir>/la/*.md, <dir>/toc.json"""
import json, re, sys
import xml.etree.ElementTree as ET

NS = '{http://www.tei-c.org/ns/1.0}'
mode, out, srcs = sys.argv[1], sys.argv[2], sys.argv[3:]


def ws(s):
    return re.sub(r'\s+', ' ', s).strip()


def txt(e):
    parts = [e.text or '']
    for c in e:
        if c.tag == NS + 'pb':
            parts.append(' ')
        elif c.tag == NS + 'LACUNA':
            parts.append(' [lacuna] ')
        else:
            parts.append(txt(c))
        parts.append(c.tail or '')
    return ''.join(parts)


def sent(h):
    h = ws(re.sub(r'^\s*\d+\s+', '', ws(h)))
    if sum(c.isupper() for c in h) > 2 * sum(c.islower() for c in h):
        h = ' '.join(w if re.match(r'^[«(]?[IVXLC]+[.,:»)]*$', w) else w.capitalize() if w[0].isalpha() else w[0] + w[1:].capitalize()
                     for w in h.split())
    return h


def blocks(e, level):
    """Markdown blocks of a div: paragraphs, then sub-divs as ## sections."""
    res = []
    for c in e:
        t = c.tag[len(NS):]
        if t == 'p' or t == 'l':
            s = ws(txt(c)).replace('*', '')
            if not s:
                continue
            if re.match(r'^(PARS [IVX]+, )?VERS\.', s) and len(s) < 1500:
                s = '**' + s + '**'
            elif re.match(r'^[A-Z]{2,8}\.$', s) and level >= 1:
                s = '### ' + s.title()
            res.append(s)
        elif t.startswith('div'):
            res.append(None)  # placeholder for ordering
            res.pop()
            h = c.find(NS + 'head')
            ht = sent(txt(h)) if h is not None else ''
            if ht:
                res.append('## ' + ht)
            res += blocks(c, level + 1)
    return res


def render(title, bl):
    return '# ' + title + '\n\n' + '\n\n'.join(bl) + '\n'


def body(f):
    return ET.parse(f).getroot().find(NS + 'text').find(NS + 'body')


files, toc = [], []


def add(id_, title, bl):
    files.append((id_, title, bl))


def roman(n):
    r = ''
    for v, s in [(100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            r += s
            n -= v
    return r


if mode == 'psalms':
    fr = []
    n = 0
    for d in body(srcs[0]):
        if d.tag != NS + 'div1':
            continue
        head = ws(txt(d.find(NS + 'head')))
        if head.startswith('COLLATIO'):
            files[-1][2].append('## ' + sent(head))
            files[-1][2].extend(blocks(d, 2))
            continue
        isps = n > 0 or 'COMMENTARIUS IN PSALMOS' in head
        if re.match(r'PSALMUS ([IVXLC]+|SECUNDUS)', head) or 'COMMENTARIUS IN PSALMOS' in head:
            n += 1
            m = re.match(r'PSALMUS ([IVXLC]+|SECUNDUS)', head)
            assert 'COMMENTARIUS' in head or m.group(1) in (roman(n), 'SECUNDUS'), (head, n)
            add(f'ps-{n:03d}', f'Psalmus {roman(n)}', blocks(d, 1))
        else:
            k = len(fr) + 1
            fr.append(f'prae-{k:02d}')
            t = sent(head.replace('.', '')) if 'PRAEFATIO' not in head else 'Praefatio'
            t = {'AD LECTOREM': 'Ad lectorem'}.get(head.rstrip('.'), t)
            if k == 1:
                t = 'Epistola nuncupatoria Richardi Cenomani ad Vincentium Lunellum'
            if k == 2:
                t = 'Prologus Richardi Cenomani: collatio diversarum translationum Psalterii'
            add(fr[-1], t, blocks(d, 1))
    assert n == 150, n
    toc.append({'id': 'praefationes', 'title': 'Praefationes', 'children': [{'id': i} for i in fr]})
    for g, (a, b) in enumerate([(1, 50), (51, 100), (101, 150)]):
        toc.append({'id': f'quinquagena-{g + 1}', 'title': f'Quinquagena {roman(g + 1)}: Psalmi {a}-{b}',
                    'children': [{'id': f'ps-{i:03d}'} for i in range(a, b + 1)]})
else:
    ab = {'ROMANOS': 'rom', 'I AD CORINTHIOS': '1cor', 'II AD CORINTHIOS': '2cor', 'GALATAS': 'gal', 'EPHESIOS': 'eph',
          'PHILIPPENSES': 'phil', 'COLOSSENSES': 'col', 'I AD THESSALONICENSES': '1thess',
          'II AD THESSALONICENSES': '2thess', 'I AD TIMOTHAEUM': '1tim', 'II AD TIMOTHEUM': '2tim', 'TITUM': 'tit',
          'PHILEMONEM': 'phlm', 'HEBRAEOS': 'heb'}
    for f in srcs:
        for d in body(f):
            if d.tag != NS + 'div1':
                continue
            head = ws(re.sub(r'\d+', '', txt(d.find(NS + 'head')))).rstrip('.')
            if head.startswith('PETRI LOMBARDI PRAEFATIO'):
                add('praefatio', 'Praefatio', blocks(d, 1))
                toc.append({'id': 'praefatio'})
                continue
            m = re.match(r'IN EPISTOLAM (?:AD )?(.*)', head)
            key = next(k for k in ab if m.group(1).replace('AD ', '').strip() == k.replace('AD ', '').strip())
            a = ab[key]
            node = {'id': a, 'title': sent(head), 'children': []}
            toc.append(node)
            direct = [c for c in d if c.tag == NS + 'p']
            divs = [c for c in d if c.tag == NS + 'div2']
            if direct and not divs:
                add(a, sent(head), blocks(d, 1))
                node['children'].append({'id': a})
                continue
            if direct:
                tmp = ET.Element(NS + 'div2')
                tmp.extend(direct)
                bl = blocks(tmp, 1)
                if bl:
                    add(a + '-00', 'Prologus', bl)
                    node['children'].append({'id': a + '-00'})
            ch = 0
            for dv in divs:
                h = ws(txt(dv.find(NS + 'head'))).rstrip('.')
                if h.upper().startswith('ARGUMENTUM'):
                    idx, t = a + '-arg', 'Argumentum'
                else:
                    ch += 1
                    idx, t = f'{a}-{ch:02d}', f'Caput {roman(ch)}'
                bl = blocks(dv, 1)
                add(idx, t, bl)
                node['children'].append({'id': idx})

titles = {i: t for i, t, _ in files}


def fill(n):
    if 'title' not in n:
        n['title'] = titles[n['id']]
    n['title'] = {'la': n['title'].replace(' Ad ', ' ad ')}
    for c in n.get('children', []):
        fill(c)


import os
os.makedirs(out + '/la', exist_ok=True)
words = 0
for i, t, bl in files:
    s = render(t, bl)
    words += len(s.split())
    open(f'{out}/la/{i}.md', 'w').write(s)
for n in toc:
    fill(n)
json.dump(toc, open(f'{out}/toc.json', 'w'), ensure_ascii=False, indent=2)
print(len(files), words)
