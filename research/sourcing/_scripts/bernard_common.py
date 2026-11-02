"""Shared helpers for the Bernard imports: CC (Migne PL) TEI parsing."""
import re, html

def clean_inline(s):
    s = re.sub(r'<pb[^>]*/>', ' ', s)
    s = re.sub(r'<note>(.*?)</note>', r'\1', s, flags=re.S)
    s = re.sub(r'<emph>.*?</emph>', ' ', s)           # PL column numbers in headings
    s = re.sub(r'<hi>(.*?)</hi>', lambda m: '\x01' + m.group(1) + '\x02', s, flags=re.S)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    s = s.replace('\x02 \x01', ' ').replace('\x02\x01', '')
    s = re.sub(r'\x01\s*', '*', s); s = re.sub(r'\s*\x02', '*', s)
    s = re.sub(r'\*\s*\*', '', s)
    s = re.sub(r'\*(\s*[.,;:)»]*)\*', r'\1', s)
    return s.replace('--', '—')

def cc_sections(path):
    """-> list of {'head': cleaned head, 'paras': [...]} in document order (every <head> opens a section)."""
    x = open(path, encoding='utf-8').read()
    x = x[x.index('<text>'):]
    out = []
    for m in re.finditer(r'<head>(.*?)</head>|<p>(.*?)</p>|<l>(.*?)</l>', x, flags=re.S):
        h, p, l = m.groups()
        if h is not None:
            out.append({'head': clean_inline(h), 'rawhead': h, 'paras': []})
        else:
            if not out: out.append({'head': '', 'rawhead': '', 'paras': []})
            t = clean_inline(p if p is not None else l)
            if t: out[-1]['paras'].append(t)
    return out

def roman(n):
    r = ''
    for v, s in [(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n >= v: r += s; n -= v
    return r
