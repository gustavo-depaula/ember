"""Guéranger L'Année liturgique: domgueranger.net WordPress JSON -> list of items (para/verse/heading/blank) + footnotes."""
import json, re, html, os
G = '/Users/gustavo/Documents/prayer/research/sourcing/gueranger/'
_posts = None
def post(slug):
    global _posts
    if _posts is None:
        _posts = {}
        for i in (1, 2, 3):
            for x in json.load(open(G + f'dgapi/posts-{i}.json')):
                _posts[x['slug']] = x
    return _posts[slug]

def inline(h):
    h = re.sub(r'<sup[^>]*>\s*<a[^>]*href="#footnote_(\d+)_\d+"[^>]*>.*?</a>\s*</sup>', lambda m: '\x01%s\x02' % m.group(1), h, flags=re.S)
    h = re.sub(r'<br\s*/?>', ' ', h)
    h = re.sub(r'<(em|i)\b[^>]*>', '\x03', h); h = re.sub(r'</(em|i)>', '\x04', h)
    h = re.sub(r'<(strong|b)\b[^>]*>', '\x05', h); h = re.sub(r'</(strong|b)>', '\x06', h)
    h = re.sub(r'<[^>]+>', '', h)
    h = html.unescape(h).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', h).strip()

def italic_all(t):
    s = re.sub(r'[\x05\x06\x01\x02\d]', '', t) if False else t
    s = t.replace('\x05', '').replace('\x06', '')
    return s.startswith('\x03') and s.endswith('\x04') and s.count('\x03') == 1

def render(t):
    t = re.sub(r'\x03\s*\x04', '', t)
    t = t.replace('\x05', '**').replace('\x06', '**')
    # italics: move edge spaces outside, drop empties
    t = re.sub(r'\x03(\s*)', lambda m: m.group(1) + '\x03', t); t = re.sub(r'(\s*)\x04', lambda m: '\x04' + m.group(1), t)
    t = t.replace('\x03', '*').replace('\x04', '*')
    t = re.sub(r'\*\*\*', '**', t) if False else t
    t = re.sub(r'\x01(\d+)\x02', r'[^\1]', t)
    return re.sub(r'\s+', ' ', t).strip()

def parse(slug):
    c = post(slug)['content']['rendered']
    notes = {}
    m = re.search(r'<ol class="footnotes">(.*?)</ol>', c, re.S)
    if m:
        for n, body in re.findall(r'<li id="footnote_(\d+)_\d+"[^>]*>(.*?)</li>', m.group(1), re.S):
            body = re.sub(r'<span class="footnote-back-link-wrapper">.*?</span>', '', body, flags=re.S)
            body = body.replace('&lt;br/&gt;', ' / ').replace('&lt;br /&gt;', ' / ')
            notes[int(n)] = render(inline(body))
        c = c[:m.start()]
    items = []
    for al, inner in re.findall(r'<p([^>]*)>(.*?)</p>', c, re.S):
        t = inline(inner)
        if not re.sub(r'[\x01-\x06]', '', t).strip():
            items.append(('blank', '', False)); continue
        items.append(('p', t, 'center' in al))
    return items, notes

def upper(t):
    s = re.sub(r'[\x01-\x06]|\[\^\d+\]', '', t)
    al = [ch for ch in s if ch.isalpha()]
    return len(al) >= 3 and sum(ch.isupper() for ch in al) / len(al) >= .85
