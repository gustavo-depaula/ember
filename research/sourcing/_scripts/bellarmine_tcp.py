"""TCP (EEBO) TEI -> chapters. Long s normalised; speakers kept as 'D.'/'M.' labels as printed."""
import re, xml.etree.ElementTree as ET
NS = '{http://www.tei-c.org/ns/1.0}'
def norm(t):
    t = t.replace('ſ', 's').replace('•', '').replace('●', '')
    t = re.sub(r'\s+', ' ', t)
    return t.strip()
def txt(e):
    parts = []
    def w(x):
        tag = x.tag.replace(NS, '')
        if tag in ('note',): return
        if tag == 'g': parts.append(x.text or '') if False else None
        if x.text and tag not in ('g',): parts.append(x.text)
        for c in x:
            w(c)
            if c.tail: parts.append(c.tail)
    w(e)
    return norm(''.join(parts))
def paras(div):
    out = []
    for e in div:
        tag = e.tag.replace(NS, '')
        if tag == 'head': continue
        if tag in ('p', 'item', 'argument', 'trailer', 'label'):
            t = txt(e)
            if t: out.append(t)
        elif tag == 'sp':
            sp = e.find(NS + 'speaker'); who = txt(sp) if sp is not None else ''
            ps = [txt(p) for p in e if p.tag.replace(NS, '') in ('p', 'l')]
            if ps: out.append((who + ' ' if who else '') + ' '.join(x for x in ps if x))
        elif tag == 'list':
            out.extend(txt(i) for i in e if txt(i))
        elif tag == 'div':
            h = e.find(NS + 'head'); ht = txt(h) if h is not None else ''
            if ht: out.append('## ' + ht)
            out.extend(paras(e))
    return out
def chapters(path):
    root = ET.parse(path).getroot()
    body = root.find(f'.//{NS}body')
    res = []
    def walk(d):
        for e in d:
            if e.tag == NS + 'div':
                res.append(e)
    walk(body)
    return res
