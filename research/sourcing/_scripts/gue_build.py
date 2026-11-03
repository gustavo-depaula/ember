"""Guéranger import: chapter markdown + book.json writer (shared by gue_*.py)."""
import re, os, json, sys
sys.path.insert(0, os.path.dirname(__file__))
import bookjson
ROOT = '/Users/gustavo/Documents/prayer/'
BASE = ROOT + 'content/books/gueranger-opera-omnia/'
STRAY = re.compile(r'^(?:\[\^\d+\]|[\s.,;:»«)!?’\'"-])+$')

def merge_stray(paras):
    out = []
    for k, t in paras:
        if out and STRAY.match(t) and out[-1][0] == 'p':
            out[-1] = ('p', out[-1][1] + (t.strip() if t.strip().startswith('[^') or t.strip()[:1] in '.,;:)!?»' else ' ' + t.strip()))
        else:
            out.append((k, t))
    return out

def chapter_md(title, paras, notes=None, merge=True):
    """paras: [(kind,text)] kind in p|c|h2|h3|q ; notes: {num:text}"""
    paras = merge_stray(paras) if merge else paras
    notes = notes or {}
    refs = []
    for _, t in paras:
        for m in re.findall(r'\[\^(\d+)\]', t):
            if m not in refs: refs.append(m)
    mp = {o: str(i + 1) for i, o in enumerate(refs)}
    body = ['# ' + title, '']
    for k, t in paras:
        t = re.sub(r'\[\^(\d+)\]', lambda m: '[^%s]' % mp[m.group(1)], t)
        if k == 'h2': t = '## ' + t
        elif k == 'h3': t = '### ' + t
        elif k == 'q': t = '> ' + t
        body += [t, '']
    for o in refs:
        n = notes.get(int(o))
        if n is None:
            raise SystemExit('missing note %s in %s' % (o, title))
        body += ['[^%s]: %s' % (mp[o], n), '']
    return '\n'.join(body).rstrip() + '\n'

def words(s): return len(re.findall(r'\w+', s))

def write_book(slug, d, chapters, sources_txt=None, srclang=None):
    """chapters: {lang: {cid: md}} ; sources_txt: {name: text} written to sources/<srclang>-originals/"""
    root = BASE + slug + '/'
    tot = {}
    for lang, cs in chapters.items():
        os.makedirs(root + lang, exist_ok=True)
        tot[lang] = 0
        for cid, md in cs.items():
            open(root + lang + '/' + cid + '.md', 'w').write(md)
            tot[lang] += words(md)
    for name, (lang, txt) in (sources_txt or {}).items():
        sd = root + 'sources/%s-originals/' % lang
        os.makedirs(sd, exist_ok=True)
        open(sd + name + '.txt', 'w').write(txt)
    bookjson.write(root, d)
    print(slug, tot)
    return root

NAME_AUTHOR = {'fr-FR': 'Prosper Guéranger', 'en-US': 'Prosper Guéranger', 'pt-BR': 'Prosper Guéranger'}
def book(id, work, name, desc, composed, languages, editions, sources, toc):
    d = {'id': id, 'cover': 'classic', 'name': name, 'author': dict(NAME_AUTHOR), 'description': desc,
         'composed': composed, 'languages': languages, 'work': 'gueranger/' + work,
         'editions': editions, 'sources': sources, 'toc': toc}
    return d

def src(lang, url, edition, description, tier='A', ev='Guéranger died in 1875; text first published in his lifetime or by 1931.'):
    return {'language': lang, 'url': url, 'edition': edition, 'description': description, 'tier': tier, 'tierEvidence': ev}
DG = 'https://www.domgueranger.net/'

def toc_of(items, lang='fr-FR'):
    return [{'id': i, 'title': {lang: t}} for i, t in items]
def sub(paras, a, b): return paras[a:b]
def dump_src(posts_paras):
    return '\n\n---\n\n'.join(posts_paras)

_VB = r'(est|n’est|dit|fait|peut|doit|faut|veut|voit|croit|agit|sait|vaut|sont|ont|fut|fût|sera|serait|aurait|pourrait|suffirait|voudrait|était|avait|semble|peuvent|doivent|font|vont|reprend|répond|prétend|entend|vient|devient|tient|convient|reste|importe)'
_NOT = {'platon', 'baton', 'caton', 'maton', 'tutelle', 'mortelle', 'immortelle', 'telle'}
def fixhy(t):
    """Restore hyphens lost in the domgueranger.net transcription: inversion (dit-il, a-t-il, est-ce) and -même."""
    t = re.sub(r'\bJésusChrist', 'Jésus-Christ', t)
    t = re.sub(r'\b(peut|Peut)(être)\b', r'\1-\2', t)
    t = re.sub(r'\b(elle|lui|eux|elles|soi|moi|toi|nous|vous|celui|celle|ceux|celles)(même|mêmes)\b', r'\1-\2', t)
    t = re.sub(r'\b' + _VB + r'(ils|il|elles|elle|on|ce)\b(?![-’\'])', lambda m: m.group(1) + '-' + m.group(2), t, flags=re.I)
    t = re.sub(r'\b(\w+ait)(ils|il|elles|elle|on)\b', r'\1-\2', t)
    t = re.sub(r'\b(mut|conclut|traduit|suffit|reçut|conçut|fût|crut|eût|plût)(ils|il|elles|elle|on)\b', r'\1-\2', t, flags=re.I)
    def c(m):
        w = m.group(0)
        if w.lower() in _NOT: return w
        return m.group(1) + '-t-' + m.group(2)
    t = re.sub(r'\b([A-Za-zÀ-ÿ]*[aeéi])t(ils|il|elles|elle|on)\b', lambda m: c(m) if (m.group(1).lower() in ('a', 'ya') or re.search(r'(ra|rai|e|ie|ute|ve|se|te)$', m.group(1).lower()) and len(m.group(1)) > 2) else m.group(0), t, flags=re.I)
    return t
