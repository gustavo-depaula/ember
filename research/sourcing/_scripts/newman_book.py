"""Build a Newman book from cached Newman Reader pages.
usage: newman_book.py plan INDEX_PATH            list the pages of an index with titles and word counts
       newman_book.py build CONFIG.json          write the book folder (book.json, en-US/*.md, sources/)
CONFIG: {dir, id, slug, name, name_pt, desc, desc_pt, composed, editor, year, edition, note, index, 
         chapters: [[pagepath, id, title|null], ...], parts: [{id,title,title_pt,from:id}], extra_sources: [...]}"""
import sys, os, json, re
sys.path.insert(0, os.path.dirname(__file__))
import newman_nr as n

def plan(path, tree=False):
    for u in (n.tree_links if tree else n.index_links)(path):
        bl = n.blocks(n.body(u))
        h = next((n.norm(b) for t, b in bl if t in ('h1', 'h2')), '?')
        w = len(re.findall(r"\w+", n.norm(' '.join(b for t, b in bl))))
        print('%-40s %6d  %s' % (u.replace(n.ROOT, ''), w, h[:90]))

def convert_multi(path, title):
    import newman_verse as v
    if path == 'verses/dedication': return v.dedication()
    if path.startswith('verses/verse'): return v.convert(n.ROOT + path, title)
    """PATH may join several pages with '+': one chapter, footnotes renumbered in order."""
    pages = path.split('+')
    body, foot, warn, off = [], [], [], 0
    for i, pg in enumerate(pages):
        pg, _, sl = pg.partition('@')
        a, _, z = sl.partition(':')
        md, w = n.convert(n.ROOT + pg, title, start=a or None, stop=z or None)
        warn += w
        if i == 0 and title is None: title = md.split('\n', 1)[0][2:].strip()
        md = re.sub(r'\[\^(\d+)\]', lambda m: '[^%d]' % (int(m.group(1)) + off), md)
        lines = md.split('\n')
        fl = [l for l in lines if re.match(r'\[\^\d+\]:', l)]
        bl = [l for l in lines if not re.match(r'\[\^\d+\]:', l)]
        if i: bl = bl[2:] if bl[0].startswith('# ') else bl
        off += len(fl); foot += fl; body.append('\n'.join(bl).strip())
    out = '\n\n'.join(body) + '\n'
    if foot: out += '\n' + '\n'.join(foot) + '\n'
    return re.sub(r'\n{3,}', '\n\n', out), warn

def build(cfg):
    root = '/Users/gustavo/Documents/prayer/content/books/newman-opera-omnia/' + cfg['slug']
    os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
    toc, raw, warns, words, flat = [], [], [], 0, []
    for path, cid, title in cfg['chapters']:
        md, w = convert_multi(path, title)
        title = md.split('\n', 1)[0][2:].strip()
        if not title: warns.append('no title ' + path)
        warns += w
        open('%s/en-US/%s.md' % (root, cid), 'w').write(md)
        words += len(md.split())
        flat.append({'id': cid, 'title': {'en-US': title}})
        for pg in ([] if path == 'verses/dedication' else [x.partition('@')[0] for x in path.split('+')]):
            raw.append('===== %s =====\n%s\n' % (pg, n.norm(' '.join(b for t, b in n.blocks(n.body(n.ROOT + pg))))))
    parts = cfg.get('parts')
    if parts:
        ids = [c['id'] for c in flat]
        for i, p in enumerate(parts):
            a = ids.index(p['from']); b = ids.index(parts[i + 1]['from']) if i + 1 < len(parts) else len(ids)
            toc.append({'id': p['id'], 'title': {'en-US': p['title'], 'pt-BR': p['title_pt']}, 'children': flat[a:b]})
    else: toc = flat
    open(root + '/sources/en-US-originals/newmanreader-%s.txt' % cfg['slug'], 'w').write('\n'.join(raw))
    book = {
        'id': cfg['id'], 'cover': 'classic',
        'name': {'en-US': cfg['name'], 'pt-BR': cfg['name_pt']},
        'author': {'en-US': 'John Henry Newman', 'pt-BR': 'John Henry Newman'},
        'description': {'en-US': cfg['desc'], 'pt-BR': cfg['desc_pt']},
        'composed': cfg['composed'], 'languages': ['en-US'], 'work': 'newman/' + cfg['slug'],
        'editions': {'en-US': {'editor': cfg['editor'], 'year': cfg['year']}},
        'sources': [{'language': 'en-US', 'url': 'https://www.newmanreader.org/works/' + cfg['index'],
            'edition': cfg['edition'],
            'description': '%d chapters: Newman Reader page numbers, navigation and its editorial remarks are dropped; Newman\'s own notes are kept as footnotes. %s Raw page text in sources/en-US-originals/.' % (len(flat), cfg.get('note', '')),
            'tier': 'A',
            'tierEvidence': "Public domain: Newman died in 1890 and the text is of a Longmans impression (or earlier edition) before 1930. The Newman Reader page footers claim copyright in the site's transcription (c) 2007 NINS; a plain transcription of a public-domain text adds no authorship under US law."}],
        'toc': toc}
    book['sources'] += cfg.get('extra_sources', [])
    json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
    print('\n'.join(warns)); print(root, len(flat), 'chapters', words, 'words')

def sample(slug, pgfile, k=60):
    """Check k random 7-word windows of the book against a Gutenberg text."""
    import random, glob
    norm = lambda s: re.sub(r'[^a-z ]+', '', re.sub(r'\s+', ' ', re.sub(r'--|[‘’“”—–-]', ' ', re.sub(r'\[(?:pg )?\d+\]|\{\d+\}', ' ', s.lower()).replace('æ', 'ae').replace('œ', 'oe'))))
    pg = ' '.join(norm(open(pgfile, encoding='utf-8', errors='ignore').read()).split())
    toks, who = [], []
    for f in sorted(glob.glob('/Users/gustavo/Documents/prayer/content/books/newman-opera-omnia/%s/en-US/*.md' % slug)):
        t = open(f).read(); t = re.sub(r'\[\^\d+\].*', '', t)
        tt = ' '.join(norm(re.sub(r'[*#>_]', ' ', t)).split()).split(); toks += tt; who += [os.path.basename(f)] * len(tt)
    random.seed(1); miss = 0
    for _ in range(k):
        i = random.randrange(len(toks) - 7); w = ' '.join(toks[i:i + 7])
        if w not in pg: miss += 1; print('MISS', who[i], w)
    print('misses %d/%d' % (miss, k))

if __name__ == '__main__':
    if sys.argv[1] == 'plan': plan(sys.argv[2])
    elif sys.argv[1] == 'tplan': plan(sys.argv[2], True)
    elif sys.argv[1] == 'build': build(json.load(open(sys.argv[2])))
    elif sys.argv[1] == 'sample': sample(sys.argv[2], sys.argv[3])
