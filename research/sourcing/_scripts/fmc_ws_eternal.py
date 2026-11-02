"""Manning, The Eternal Priesthood, from the Wikisource transcription (1884 fourth edition) -> manning-opera-omnia/eternal-priesthood."""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(__file__))
import fmc_ws_book as B, fmc_import as F
D = '/Users/gustavo/Documents/prayer/research/sourcing/manning/ws/ep/The_Eternal_Priesthood'
root = '/Users/gustavo/Documents/prayer/content/books/manning-opera-omnia/eternal-priesthood'
os.makedirs(root + '/en-US', exist_ok=True); os.makedirs(root + '/sources/en-US-originals', exist_ok=True)
toc = []; words = 0; raw = []; nn = 0
def emit(cid, title, ps, notes):
    global words, nn
    md = '# %s\n\n%s\n' % (title, '\n\n'.join(ps))
    if notes: md += '\n' + '\n\n'.join('[^%d]: %s' % (i + 1, n) for i, n in enumerate(notes)) + '\n'
    open('%s/en-US/%s.md' % (root, cid), 'w').write(md); words += len(md.split()); nn += len(notes)
    toc.append({'id': cid, 'title': {'en-US': title}}); raw.append('===== %s =====\n%s\n' % (title, md))
ps, _ = B.parse_paras(open(D + '.html').read(), True)
ded = ps[10:21]
emit('dedication', 'Dedication', [x for x in ded if not x.startswith('ORATIO')] and [re.sub(r'\s+', ' ', ' '.join(ded[:9])).replace('*', '')] + [x for x in ded[9:] if x], [])
for i in range(1, 21):
    ps, ns = B.parse_paras(open(D + '_Chapter_%d.html' % i).read(), True)
    k = next(j for j, p in enumerate(ps) if re.match(r'^CHAPTER [IVXL]+\.?$', p))
    title = F.title_case(ps[k + 1]); body = ps[k + 2:]
    emit('chapter-%d' % i, 'Chapter %s. %s' % (F.roman(i), title), body, ns)
open(root + '/sources/en-US-originals/eternal-priesthood-wikisource.txt', 'w').write('\n'.join(raw))
cfg = {"id": "manning-eternal-priesthood", "dir": "manning-opera-omnia/eternal-priesthood", "slug": "eternal-priesthood", "work": "manning/eternal-priesthood",
 "author": "Cardinal Henry Edward Manning", "author_pt": "Cardeal Henry Edward Manning", "died": 1892,
 "name": "The Eternal Priesthood", "name_pt": "O Sacerdócio Eterno",
 "desc": "Manning's meditations for priests (1883), in twenty chapters: the nature, powers and relations of the priesthood, the obligations to sanctity, the instrumental means of perfection, the end of the priest, his dangers, helps, sorrows, friend, preaching, liberty, obedience, rewards, house, life and death.",
 "desc_pt": "As meditações de Manning para sacerdotes (1883), em vinte capítulos: a natureza, os poderes e as relações do sacerdócio, as obrigações de santidade, os meios instrumentais da perfeição, o fim do sacerdote, seus perigos, auxílios, tristezas, amigo, pregação, liberdade, obediência, recompensas, casa, vida e morte.",
 "composed": 1883, "editor": "Henry Edward Manning (London: Burns and Oates, fourth edition, 1884)", "year": 1884,
 "url": "https://en.wikisource.org/wiki/The_Eternal_Priesthood", "edition": "The Eternal Priesthood (London: Burns and Oates; New York: Catholic Publication Society, fourth edition, 1884), Wikisource transcription.",
 "srcfull": "The dedication and the twenty chapters, with Manning's footnotes. The text is the Wikisource volunteer transcription; the editors' markup and page numbers are dropped. Raw text in sources/en-US-originals/.",
 "start": 1, "end": 2}
F.write_book(cfg, root, toc, words, nn, [''])
print(len(toc), 'files', words, 'words', nn, 'notes')
