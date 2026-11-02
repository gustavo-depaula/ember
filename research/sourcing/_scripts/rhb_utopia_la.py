"""More, Utopia (Latin): The Latin Library page -> la corpus book. Sections follow the bracketed marginal summaries."""
import re, html, json, os
ROOT = '/Users/gustavo/Documents/prayer'
t = open(ROOT + '/research/sourcing/more-and-fisher/tll-more.html', errors='ignore').read()
t = t[t.find('<body'):]
ps = re.split(r'(?i)<p[^>]*>', t)
items = []
for p in ps[1:]:
    x = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', p))).strip()
    if not x or x.startswith('Neo-Latin') : continue
    items.append(x)
title_line = items.pop(0)
secs = [['Praefatio: Liber primus', []]]
for x in items:
    m = re.fullmatch(r'\[(.+?)\.?\]', x)
    if m:
        secs.append([m.group(1)[0].upper() + m.group(1)[1:], []])
    else: secs[-1][1].append(x)
root = ROOT + '/content/books/more-opera-omnia/utopia'
os.makedirs(root + '/la', exist_ok=True); os.makedirs(root + '/sources/la-originals', exist_ok=True)
toc = []; part = None; words = 0
for i, (name, body) in enumerate(secs):
    if name.startswith('Raphaelis sermo pomeridianus'):
        part = None
    if i == 0: part = {'id': 'liber-primus', 'title': {'la': 'Liber primus', 'en-US': 'Book I', 'pt-BR': 'Livro I'}, 'children': []}; toc.append(part)
    if name.startswith('Raphaelis sermo pomeridianus'):
        part = {'id': 'liber-secundus', 'title': {'la': 'Liber secundus', 'en-US': 'Book II', 'pt-BR': 'Livro II'}, 'children': []}; toc.append(part)
        name = 'Raphaelis sermo pomeridianus'
    if i == 0: name = 'Prooemium'
    cid = 'sectio-%02d' % (i + 1)
    md = '# %s\n\n%s\n' % (name.rstrip('.'), '\n\n'.join(body))
    open('%s/la/%s.md' % (root, cid), 'w').write(md); words += len(md.split())
    part['children'].append({'id': cid, 'title': {'la': name.rstrip('.')}})
open(root + '/sources/la-originals/utopia-latin-library.txt', 'w').write(title_line + '\n\n' + '\n\n'.join(items))
book = {'id': 'more-utopia', 'cover': 'classic',
 'name': {'la': 'De optimo statu reipublicae deque nova insula Utopia', 'en-US': 'Utopia', 'pt-BR': 'Utopia'},
 'author': {'la': 'Thomas Morus', 'en-US': 'St. Thomas More', 'pt-BR': 'São Tomás More'},
 'description': {'la': 'Libellus vere aureus nec minus salutaris quam festivus de optimo reipublicae statu deque nova insula Utopia (1516): sermo Raphaelis Hythlodaei de insula Utopiensium.',
   'en-US': "More's Utopia in the original Latin (1516): Raphael Hythlodaeus on the best state of a commonwealth and on the island of Utopia, in two books. The English by Ralph Robinson (1551) is a separate book, Utopia (Ralph Robinson's translation).",
   'pt-BR': 'A Utopia de More no latim original (1516): Rafael Hitlodéu sobre o melhor estado de uma república e sobre a ilha de Utopia, em dois livros.'},
 'composed': 1516, 'languages': ['la'], 'work': 'more/utopia',
 'editions': {'la': {'editor': 'Thomas More (Louvain: Thierry Martens, 1516), text as given by The Latin Library', 'year': 1516}},
 'sources': [{'language': 'la', 'url': 'https://www.thelatinlibrary.com/more.html', 'edition': 'De optimo statu reipublicae deque nova insula Utopia, Books I-II (The Latin Library; edition not stated, orthography of a modern text in u/v and i/j normalised to u and i).',
   'description': 'Books I and II complete without the parerga (letters, verses, alphabet). Sections follow the bracketed marginal summaries of the text. Raw text in sources/la-originals/.',
   'tier': 'A', 'tierEvidence': 'More died in 1535 and the text is of the 1516 first edition; the Latin Library carries it as a plain transcription.'}],
 'toc': toc}
json.dump(book, open(root + '/book.json', 'w'), ensure_ascii=False, indent=2); open(root + '/book.json', 'a').write('\n')
print(len(secs), 'sections', words, 'words')
