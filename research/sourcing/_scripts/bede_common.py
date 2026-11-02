import sys, os, re, html
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
WS = ROOT + 'research/sourcing/bede/ws/'
BD = ROOT + 'content/books/bede-opera-omnia/'
def bede_author(): return {"la": "Beda Venerabilis", "en-US": "St. Bede the Venerable", "pt-BR": "São Beda, o Venerável"}
def read_ws(name, sub=None):
    p = WS + name + '/' + (sub or name) + '.wiki'
    return open(p).read()
def clean_ws(t):
    t = strip_wiki(t)
    t = re.sub(r'\(\d{4}[A-D]?\)', '', t)
    t = re.sub(r'\[\[Patrologia Latina[^\]]*\]\]', '', t)
    t = re.sub(r'(?m)^.*Migne Patrologia Latina Tomus.*$', '', t)
    t = re.sub(r'^.*J\. P\. Migne\s*$', '', t, flags=re.M)
    t = re.sub(r'^=+\s*(.*?)\s*=+\s*$', r'\n\1\n', t, flags=re.M)
    return t
def fordham(path):
    """Fordham Sourcebook page -> list of paragraphs (headings kept as 'CHAPTER ..' lines)."""
    t = open(path, errors='ignore').read()
    t = t[t.find('Medieval Sourcebook:'):]
    t = re.sub(r'<script.*?</script>', '', t, flags=re.S)
    t = re.sub(r'<(i|em)>', '\x02', t, flags=re.I); t = re.sub(r'</(i|em)>', '\x01', t, flags=re.I)
    t = re.sub(r'</p>|<br\s*/?>\s*</p>', '\n\n', t, flags=re.I)
    t = re.sub(r'<[^>]+>', '', t); t = html.unescape(t).replace('\xa0', ' ')
    out = []
    for p in re.split(r'\n\s*\n', t):
        p = re.sub(r'\s+', ' ', p).strip()
        p = p.replace('\x02', '*').replace('\x01', '*')
        p = re.sub(r'\*\s*\*', ' ', p); p = re.sub(r'(?<=\w)\* (?=\*)', ' ', p)
        if p: out.append(p)
    return out
def unshout(p):
    m = re.match(r'([A-Z]{2,})\b', p)
    if m and m.group(1) not in ('II', 'III', 'IV', 'VI', 'XI', 'IX'):
        p = m.group(1).capitalize() + p[len(m.group(1)):]
    return p
def sentence(s):
    s = re.sub(r'\s+', ' ', s).strip().strip('*').strip()
    return s[:1].upper() + s[1:].lower() if s.isupper() else s

def titlecase(s):
    small = {'a','an','the','of','in','on','by','to','and','his','her','he','she','with','from','for','at','as','or','was','were','is','who','that','which','it','him','them','their','into','upon'}
    s = re.sub(r'\s+', ' ', s).strip().strip('*').strip()
    if not s.isupper(): return s
    ws = s.lower().split(' ')
    return ' '.join(w if (w in small and k) else (w[:1].upper() + w[1:]) for k, w in enumerate(ws))
