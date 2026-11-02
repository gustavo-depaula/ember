"""Wikisource parse-JSON -> (paragraphs, footnotes{n: text}). Italic -> *..*, sup.reference -> [^n]."""
import json, re
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.paras = []; s.cur = []; s.skip = 0; s.stack = []; s.notes = {}; s.note = None; s.inref = 0
    def flush(s):
        t = re.sub(r'\s+', ' ', ''.join(s.cur)).strip()
        t = re.sub(r'\x01\s*\x02', ' ', t)
        t = re.sub('\x01(\\s+)', lambda m: m.group(1) + '\x01', t); t = re.sub('(\\s+)\x02', lambda m: '\x02' + m.group(1), t)
        t = t.replace('\x01', '*').replace('\x02', '*'); t = re.sub(r'\*\*', '', t)
        if t:
            if s.note is not None: s.notes[s.note] = (s.notes.get(s.note, '') + ' ' + t).strip()
            else: s.paras.append(t)
        s.cur = []
    def handle_starttag(s, t, a):
        a = dict(a); c = a.get('class', '') or ''
        skip = t in ('style', 'script', 'link', 'table') or 'ws-noexport' in c or 'pagenum' in c or 'mw-editsection' in c or 'mw-cite-backlink' in c
        if t == 'sup' and 'reference' in c:
            m = re.search(r'cite_note-(\d+)', json.dumps(a)) or re.search(r'cite&#95;note-(\d+)', json.dumps(a))
            href = [v for k, v in a.items() if k == 'id'] 
            s.stack.append(('refsup', 1)); s.skip += 1
            s._pending = True
            return
        if t == 'ol' and 'references' in c: s.flush(); s.inref = 1
        if t == 'li' and s.inref:
            s.flush(); m = re.search(r'cite[_&#95;]*note-(\d+)', a.get('id', '') or ''); s.note = m.group(1) if m else str(len(s.notes) + 1)
        s.stack.append((t, skip))
        if skip: s.skip += 1
        if t in ('p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'dd', 'dt') and not s.skip: s.flush()
        if t in ('i', 'em') and not s.skip: s.cur.append('\x01')
    def handle_endtag(s, t):
        if not s.stack: return
        tt, sk = s.stack.pop()
        if sk: s.skip -= 1
        if tt == 'refsup': return
        if t in ('i', 'em') and not s.skip: s.cur.append('\x02')
        if t in ('p', 'div', 'h1', 'h2', 'h3', 'h4', 'li'):
            if not s.skip: s.flush()
            if t == 'li': s.note = None
    def handle_data(s, d):
        if s.skip: 
            return
        s.cur.append(d)
def convert(path):
    h = json.load(open(path))['parse']['text']
    # turn sup refs into markers before parsing
    h = re.sub(r'<sup[^>]*class="[^"]*reference[^"]*"[^>]*>.*?cite_note-(\d+)"?.*?</sup>', lambda m: '[[FN%s]]' % m.group(1), h, flags=re.S)
    p = P(); p.feed(h); p.flush()
    paras = []
    for x in p.paras:
        x = re.sub(r'\[\[FN(\d+)\]\]', r'[^\1]', x)
        if paras and not re.match(r'^[IVXLC]+\.?\s*[—–-]', paras[-1]) and not re.search(r'[.!?:;»”\"\]]$', re.sub(r'\[\^\d+\]$', '', paras[-1])) and x[:1].islower(): paras[-1] += ' ' + x
        else: paras.append(x)
    return paras, p.notes
