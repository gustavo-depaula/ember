"""Shared writer for the Spanish-authors English pass (esen_*.py): chapters -> en-US-only book dir."""
import os, re, json, sys
sys.path.insert(0, os.path.dirname(__file__))
import en_common as E
ROOT = '/Users/gustavo/Documents/prayer'
def write_book(cfg, chapters, rawfiles=()):
    """cfg: id, dir, work, name, name_pt, author(+_es), author_pt, desc, desc_pt, composed, translator, year, url, edition, srcdesc, died.
    chapters: list of (cid, title, markdown_body_without_H1)."""
    root = os.path.join(ROOT, 'content/books', cfg['dir'])
    os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
    words = 0; toc = []
    for cid, title, body in chapters:
        md = '# %s\n\n%s\n' % (title, body.strip())
        open('%s/en-US/%s.md' % (root, cid), 'w').write(md); words += len(md.split())
        toc.append({'id': cid, 'title': {'en-US': title}})
    for src in rawfiles:
        open(root + '/sources/en-US-originals/' + os.path.basename(src), 'w').write(open(src, errors='replace').read())
    a = {'en-US': cfg['author'], 'pt-BR': cfg['author_pt']}
    if cfg.get('author_es'): a = {'es-ES': cfg['author_es'], **a}
    book = {'id': cfg['id'], 'cover': 'quarter', 'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']}, 'author': a,
            'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']}, 'composed': cfg['composed'], 'languages': ['en-US'],
            'work': cfg['work'], 'editions': {'en-US': {'translator': cfg['translator'], 'year': cfg['year']}},
            'sources': [{'language': 'en-US', 'url': cfg['url'], 'edition': cfg['edition'], 'description': cfg['srcdesc'], 'tier': 'A',
                         'tierEvidence': cfg.get('tierev', 'Published %d, before 1930; public domain in the US.' % cfg['year'])}],
            'toc': toc}
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print(root, len(chapters), 'chapters', words, 'words')
    return root
