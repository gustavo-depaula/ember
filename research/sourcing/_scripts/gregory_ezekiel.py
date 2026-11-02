import sys, os, re
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
G = ROOT + 'research/sourcing/gregory-the-great/'
W = G + 'ws/Homiliarum_in_Ezechielem_Prophetam/Homiliarum_in_Ezechielem_Prophetam'
chs = {}; toc = []; raw = []
def add(cid, title, ps):
    chs[cid] = '# %s\n\n' % title + '\n\n'.join(ps)
    toc.append({'id': cid, 'title': {'la': title}})
top = open(W + '.wiki').read(); raw.append(top)
pref = re.search(r'Praefatio\.\s*</CENTER>(.*?)\n\*\[\[', top, flags=re.S).group(1)
add('b1-praefatio', 'Liber I, Praefatio', paras2(pref))
for i in range(1, 13):
    src = open(W + '_%s.wiki' % ROM[i-1]).read(); raw.append(src)
    t = strip_wiki(src).replace('>>sequitur Lber Secundus>>', '')
    t = re.sub(r'^=+.*?=+\s*$', '', t, flags=re.M)
    add('b1-h%02d' % i, 'Liber I, Homilia %s' % ROM[i-1], paras2(t))
# Book II: DCO text
d = open(G + 'dco/Homiliarum_in_Ezechielem_Prophetam_Liber_Secundus.txt').read(); raw.append(d)
lines = [l for l in d.split('\n')]
body = []
for l in lines:
    if re.fullmatch(r'\s*\d{1,3}\s*', l): continue
    body.append(l)
t = '\n'.join(body)
t = t.split('Praefatio.', 1)[1]
t = re.sub(r'\n\s*FINIS\s*$', '', t.rstrip())
parts = re.split(r'\n(HOMILIA (?:PRIMA|[IVX]+)\.?)[ \t]*\n', '\n' + t)
add('b2-praefatio', 'Liber II, Praefatio', paras2(parts[0]))
for k in range(1, len(parts), 2):
    n = (k // 2) + 1
    add('b2-h%02d' % n, 'Liber II, Homilia %s' % ROM[n-1], paras2(parts[k+1]))
book = {
 "id": "gregory-great-pope-homilies-on-ezekiel", "cover": "classic",
 "name": {"la": "Homiliae in Hiezechihelem prophetam", "en-US": "Homilies on Ezekiel", "pt-BR": "Homilias sobre Ezequiel"},
 "author": gregory_author(),
 "description": {
  "la": "Homiliae XXII in Hiezechihelem prophetam, duobus libris: in priore (593) visiones primae partis libri, in altero (593-594, Longobardis Romam obsidentibus) visio extrema de aedificio in monte.",
  "en-US": "Twenty-two homilies on the prophet Ezekiel in two books, preached in Rome in 593 and revised in 601: Book I on the opening visions (the living creatures, the wheels, the watchman), Book II on the vision of the temple on the mountain, preached while the Lombards were besieging the city. Latin text of the Maurist edition (Migne, PL 76); no public-domain English translation is known.",
  "pt-BR": "Vinte e duas homilias sobre o profeta Ezequiel, em dois livros, pregadas em Roma em 593 e revistas em 601: o Livro I sobre as primeiras visões (os seres vivos, as rodas, a sentinela), o Livro II sobre a visão do templo no monte, pregado enquanto os lombardos cercavam a cidade. Texto latino da edição beneditina (Migne, PL 76)."},
 "composed": "593-601", "languages": ["la"], "work": "gregory-the-great/homiliae-in-hiezechihelem",
 "editions": {"la": {"editor": "Maurist edition (Sainte-Marthe, 1705), as reprinted in Migne, PL 76 (1849)"}},
 "sources": [
  {"language": "la", "url": "https://la.wikisource.org/wiki/Homiliarum_in_Ezechielem_Prophetam",
   "edition": "Book I (preface and homilies I-XII): Homiliarum in Ezechielem Prophetam on Latin Wikisource (from Documenta Catholica Omnia, PL 76).",
   "description": "Wikitext removed, wrapped lines rejoined into paragraphs; verse lemmas set as their own paragraphs.",
   "tier": "A", "tierEvidence": "Text of a 6th-century work in the 1705 Maurist edition (Migne 1849): public domain."},
  {"language": "la", "url": "https://www.documentacatholicaomnia.eu/01p/0590-0604,_SS_Gregorius_I_Magnus,_Homiliarum_in_Ezechielem_Prophetam_Liber_Secundus,_LT.pdf",
   "edition": "Book II (preface and homilies I-X): Documenta Catholica Omnia, Homiliarum in Ezechielem Prophetam Liber Secundus, LT text of PL 76 (Latin Wikisource has no Book II).",
   "description": "PDF text layer: page numbers dropped, column-broken lines rejoined into paragraphs.",
   "tier": "A", "tierEvidence": "Same Maurist/Migne text; public domain."}],
 "arrived": {"la": "2026-11-02"}, "toc": toc}
write_book(ROOT + 'content/books/church-fathers/gregory-great-pope/homilies-on-ezekiel', book, {'la': chs}, '\n---\n'.join(raw), 'homiliae-in-hiezechihelem')
print(len(chs), sum(words(m) for m in chs.values()))
