import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
W = ROOT + 'research/sourcing/gregory-the-great/ws/Homiliarum_in_Evangelia/'
def fn(i):  # 1..40
    return W + ('Homiliarum_in_Evangelia_I-%s.wiki' % ROM[i-1] if i <= 20 else 'Homiliarum_in_Evangelia_%s.wiki' % ROM[i-1])
chs = {}; toc = []; raw = []
t = strip_wiki(open(W + 'Homiliarum_in_Evangelia_Prae.wiki').read())
t = re.sub(r'^=+.*?=+\s*$', '', t, flags=re.M)
ps = paras(t)
chs['praefatio'] = '# Praefatio\n\n' + '\n\n'.join(ps)
toc.append({'id': 'praefatio', 'title': {'la': 'Praefatio'}}); raw.append(open(W + 'Homiliarum_in_Evangelia_Prae.wiki').read())
for i in range(1, 41):
    src = open(fn(i)).read(); raw.append(src)
    t = strip_wiki(src)
    t = re.sub(r'^=+.*?=+\s*$', '', t, flags=re.M)
    ps = paras(t)
    cid = 'h%02d' % i; title = 'Homilia %s' % ROM[i-1]
    chs[cid] = '# %s\n\n' % title + '\n\n'.join(ps)
    toc.append({'id': cid, 'title': {'la': title}})
book = {
 "id": "gregory-great-pope-homilies-on-the-gospels", "cover": "classic",
 "name": {"la": "Homiliae XL in Evangelia", "en-US": "Forty Gospel Homilies", "pt-BR": "Quarenta Homilias sobre os Evangelhos"},
 "author": gregory_author(),
 "description": {
  "la": "Quadraginta homiliae in Evangelia, in duos libros divisae, quas Gregorius Romae ad populum habuit vel dictavit (590-593), cum epistola ad Secundinum Tauromenitanum episcopum.",
  "en-US": "The forty homilies on the Gospel readings of the Roman year that Gregory preached or dictated in Rome in 590-593, in two books, with his prefatory letter to Bishop Secundinus of Taormina. Latin text of the Maurist edition (Migne, PL 76), as transcribed on Latin Wikisource; no public-domain English translation of the whole is known.",
  "pt-BR": "As quarenta homilias sobre os Evangelhos do ano litúrgico romano que Gregório pregou ou ditou em Roma entre 590 e 593, em dois livros, com a carta-prefácio a Secundino, bispo de Taormina. Texto latino da edição beneditina (Migne, PL 76)."},
 "composed": "590-593", "languages": ["la"], "work": "gregory-the-great/homiliae-in-evangelia",
 "editions": {"la": {"editor": "Maurist edition (Sainte-Marthe, 1705), as reprinted in Migne, PL 76 (1849)"}},
 "sources": [{"language": "la", "url": "https://la.wikisource.org/wiki/Homiliarum_in_Evangelia",
   "edition": "Homiliarum in Evangelia, preface and homilies I-XL, on Latin Wikisource (from Documenta Catholica Omnia, PL 76); cross-checked in word count (91.6k) against the DCO transcription.",
   "description": "Wikitext removed, wrapped lines rejoined into paragraphs; one file per homily.",
   "tier": "A", "tierEvidence": "Text of a 6th-century work in the 1705 Maurist edition (Migne 1849): public domain."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(ROOT + 'content/books/church-fathers/gregory-great-pope/homilies-on-the-gospels', book, {'la': chs}, '\n---\n'.join(raw), 'homiliae-in-evangelia')
print(sum(words(m) for m in chs.values()))
