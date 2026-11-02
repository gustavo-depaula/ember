"""Shared helpers for the Gertrude / Mechtilde imports."""
import re, json, os

REPO = '/Users/gustavo/Documents/prayer'
RAW = REPO + '/research/sourcing/gertrude-and-mechtilde/'

def join_lines(ls):
    s = ''
    for ln in ls:
        ln = re.sub(r'\s+', ' ', ln.strip())
        if s.endswith('-') and ln[:1].islower() and not s.endswith(' -') and not s.endswith('--'):
            s = s[:-1] + ln
        else:
            s = (s + ' ' + ln) if s else ln
    return s.strip()

def blocks(lines):
    out, cur = [], []
    for ln in lines:
        ln = ln.replace('\x0c', '')
        if ln.strip():
            cur.append(ln.strip())
        elif cur:
            out.append(cur); cur = []
    if cur: out.append(cur)
    return out

def write_book(bookdir, meta, chapters):
    """chapters: {lang: [(id, md)]}; meta: book.json dict"""
    for lang, items in chapters.items():
        d = f'{bookdir}/{lang}'
        os.makedirs(d, exist_ok=True)
        for cid, md in items:
            open(f'{d}/{cid}.md', 'w').write(md)
    json.dump(meta, open(f'{bookdir}/book.json', 'w'), ensure_ascii=False, indent=2)
    open(f'{bookdir}/book.json', 'a').write('\n')

def words(path):
    import glob
    return sum(len(open(f).read().split()) for f in glob.glob(path + '/*.md'))

GAUTH = {'la': 'Gertrudis Magna', 'en-US': 'St. Gertrude the Great', 'pt-BR': 'Santa Gertrudes, a Grande'}

def book_meta(id, work, names, descs, composed, langs, editions, sources, toc, author=None, cover='classic'):
    return {'id': id, 'cover': cover, 'name': names, 'author': author or GAUTH, 'description': descs,
            'composed': composed, 'languages': langs, 'work': work, 'editions': editions,
            'sources': sources, 'toc': toc}
