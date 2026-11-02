import re, glob, collections
ROOT = '/Users/gustavo/Documents/prayer'
TOK = re.compile(r"[A-Za-zÀ-ÿ]+")
_c = {}
def vocab(lang, exclude=()):
    key = (lang, tuple(exclude))
    if key in _c: return _c[key]
    c = collections.Counter()
    for f in glob.glob(f'{ROOT}/content/books/*/{lang}/*.md'):
        if any(x in f for x in exclude): continue
        c.update(w.lower() for w in TOK.findall(open(f, encoding='utf-8').read()))
    _c[key] = c
    return c
def unknown(text, lang, exclude=(), minc=2):
    v = vocab(lang, exclude)
    out = collections.Counter()
    for w in TOK.findall(text):
        if v[w.lower()] < minc: out[w] += 1
    return out
