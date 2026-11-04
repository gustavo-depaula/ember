import sys, os, re, json, shutil
sys.path.insert(0, os.path.dirname(__file__))
from gq_fr import *
import bookjson
ROOT = '/Users/gustavo/Documents/prayer/'
BASE = ROOT + 'content/books/gueranger-opera-omnia/annee-liturgique/'
DG = 'https://domgueranger.net/'

def slugify(t):
    t = t.lower()
    for a, b in (('à', 'a'), ('â', 'a'), ('é', 'e'), ('è', 'e'), ('ê', 'e'), ('ë', 'e'), ('î', 'i'), ('ï', 'i'), ('ô', 'o'), ('û', 'u'), ('ù', 'u'), ('ç', 'c'), ('œ', 'oe'), ('’', ''), ("'", '')):
        t = t.replace(a, b)
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return t[:48].strip('-')

def build_fr(vol, folder, bid, names, descs, posts, composed, toc_prefix=''):
    """posts: list of (slug, intro_title or None). Returns (words, nchapters)."""
    B = BASE + folder + '/'
    if os.path.exists(B + 'fr-FR'): shutil.rmtree(B + 'fr-FR')
    os.makedirs(B + 'fr-FR'); os.makedirs(B + 'sources/french-originals', exist_ok=True)
    toc = []; n = 0; words = 0; used = set()
    for slug, intro in posts:
        chaps, notes = split_post(slug, intro)
        txt = []
        items, _ = parse(slug)
        for k, t, c in items:
            if k == 'p': txt.append(re.sub(r'[\x01-\x06]', '', t))
        open(B + f'sources/french-originals/{slug}.txt', 'w').write('\n\n'.join(txt) + '\n')
        for title, blocks in chaps:
            n += 1
            cid = f'{n:03d}-{slugify(title) or "chapitre"}'
            md = chapter_md(title, blocks, notes)
            open(B + f'fr-FR/{cid}.md', 'w').write(md)
            words += len(md.split())
            toc.append((cid, title))
    return B, toc, words

def write_book(B, bid, names, descs, composed, toc, post_slugs, edition_note, order_note=''):
    sources = [{'language': 'fr-FR', 'url': DG + s + '/', 'edition': edition_note, 'description': 'Dom Guéranger site (Societas pro canonizatione D. Guéranger), WordPress text of the 14th edition (1900). Split at each day or feast heading; verse kept as hard line breaks; footnotes renumbered per chapter.', 'tier': 'A', 'tierEvidence': 'Guéranger died in 1875; the text is the 19th-century edition transcribed.'} for s in post_slugs]
    d = {'id': bid, 'name': names, 'author': {'fr-FR': 'Dom Prosper Guéranger', 'en-US': 'Dom Prosper Guéranger', 'pt-BR': 'Dom Prosper Guéranger'},
         'description': descs, 'composed': composed, 'languages': ['fr-FR'], 'work': 'gueranger/annee-liturgique',
         'editions': {'fr-FR': {'editor': 'Dom Prosper Guéranger, abbé de Solesmes (14th ed., Oudin)', 'year': 1900}},
         'sources': sources, 'toc': [{'id': i, 'title': {'fr-FR': t}} for i, t in toc]}
    bookjson.write(B, d)
