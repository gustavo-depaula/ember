"""Guéranger domgueranger.net posts -> list of (kind,text) paragraphs with [^N] footnotes."""
import json, re, html
ROOT='/Users/gustavo/Documents/prayer/'
_P=None
def posts():
    global _P
    if _P is None:
        _P=[]
        for i in (1,2,3):
            _P+=json.load(open(ROOT+f'research/sourcing/gueranger/dgapi/posts-{i}.json'))
    return _P
def title(p): return html.unescape(re.sub(r'<[^>]+>','',p['title']['rendered'])).strip()
def find(prefix):
    return [p for p in posts() if title(p).startswith(prefix)]
def inline(s):
    s=re.sub(r'<sup><a [^>]*href="#footnote_(\d+)_\d+"[^>]*>[^<]*</a></sup>',lambda m:'[^%s]'%m.group(1),s)
    def wrap(m,d):
        x=m.group(2)
        if not x.strip(): return x
        return (' ' if x[:1].isspace() else '')+d+x.strip()+d+(' ' if x[-1:].isspace() else '')
    s=re.sub(r'<(em|i)>(.*?)</\1>',lambda m:wrap(m,'*'),s,flags=re.S)
    s=re.sub(r'<(strong|b)>(.*?)</\1>',lambda m:wrap(m,'**'),s,flags=re.S)
    s=re.sub(r'<br\s*/?>',' ',s)
    s=re.sub(r'<[^>]+>','',s)
    s=html.unescape(s).replace('\xa0',' ')
    s=re.sub(r'<(em|i)>\s*','*',s); s=re.sub(r'\s*</(em|i)>','*',s)
    s=re.sub(r'\*\s*\*','',s)
    s=re.sub(r'\s+',' ',s).strip()
    s=re.sub(r'(?<=[*\w])\*(?=\w)','*',s)
    s=re.sub(r'\s+([,.;:)])(?=\s|$)',r'\1',s) if False else s
    s=re.sub(r'\s+(\[\^\d+\])',r'\1',s)
    s=re.sub(r'(\[\^\d+\])\s+([.,;:»)])',r'\1\2',s)
    if s.replace('**','').count('*')%2: s=re.sub(r'(?<!\*)\*(?!\*) ?','',s)
    return s
def parse(p):
    """returns (paras,[(kind,text)], notes{num:text})"""
    c=p['content']['rendered']
    notes={}
    m=re.search(r'<ol class="footnotes">(.*?)</ol>',c,re.S)
    if m:
        for li in re.finditer(r'<li id="footnote_(\d+)_\d+"[^>]*>(.*?)</li>',m.group(1),re.S):
            t=re.sub(r'<span class="footnote-back-link-wrapper">.*?</span>','',li.group(2),flags=re.S)
            notes[int(li.group(1))]=inline(t)
        c=c[:m.start()]
    out=[]
    for m in re.finditer(r'<(p|h\d|blockquote)([^>]*)>(.*?)</\1>',c,re.S):
        t=inline(m.group(3))
        if not t: continue
        k='h' if m.group(1).startswith('h') else ('c' if 'has-text-align-center' in m.group(2) else 'p')
        out.append((k,t))
    return out,notes
