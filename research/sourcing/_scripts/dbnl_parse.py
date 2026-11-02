"""Parse a DBNL TEI XML (Ruusbroec, David ed.) into blocks: ('head', rend, text) / ('p', text) with footnotes."""
import re, html, sys
def clean_inline(s, notes):
    # footnotes
    def note(m):
        notes.append(clean_inline(m.group(2), []))
        return f'\x01{len(notes)}\x02'
    s = re.sub(r'<note ([^>]*)>(.*?)</note>', note, s, flags=re.S)
    s = re.sub(r'<hi rend="i">(.*?)</hi>', r'*\1*', s, flags=re.S)
    s = re.sub(r'<hi rend="sup">(.*?)</hi>', r'\1', s, flags=re.S)
    s = re.sub(r'<hi rend="[^"]*">(.*?)</hi>', r'\1', s, flags=re.S)
    s = re.sub(r'-\s*<lb n="\d+"/>\s*', '', s)   # hyphenated line break
    s = re.sub(r'<lb n="\d+"/>\s*', ' ', s)
    s = re.sub(r'<pb [^>]*/>\s*', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('\xa0', ' ')
    s = re.sub(r'\s+', ' ', s).strip()
    s = re.sub(r'\*\s*\*', '', s)
    return s
def blocks(path):
    t = open(path, encoding='utf-8').read()
    t = t[t.index('<text'):]
    out = []
    for m in re.finditer(r'<head([^>]*)>(.*?)</head>|<p>(.*?)</p>|<item>(.*?)</item>|<l>(.*?)</l>|<div type="chapter">|<cf>|</cf>|<row>|<table>', t, re.S):
        if m.group(0).startswith('<div'):
            out.append(('div',)); continue
        if m.group(0) in ('<cf>', '</cf>'):
            out.append((m.group(0),)); continue
        if m.group(0).startswith('<head'):
            notes = []
            out.append(('head', m.group(1), clean_inline(m.group(2), notes), notes))
        else:
            body = m.group(3) if m.group(3) is not None else (m.group(4) if m.group(4) is not None else m.group(5))
            if body is None: continue
            notes = []
            txt = clean_inline(body, notes)
            out.append(('l' if m.group(5) is not None else 'p', txt, notes))
    return out
if __name__ == '__main__':
    for b in blocks(sys.argv[1]):
        if b[0] == 'head': print('HEAD', b[1], b[2][:100])
        elif b[0] == 'div': print('--div')
