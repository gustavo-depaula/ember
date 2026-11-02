import sys, os, pickle
sys.path.insert(0, os.path.dirname(__file__))
from imp_common import *
la, en, toc, raw = pickle.load(open('/tmp/w/moralia.pkl', 'rb'))
book = {
 "id": "gregory-great-pope-moralia-in-iob", "cover": "classic",
 "name": {"la": "Moralia in Iob", "en-US": "Morals on the Book of Job", "pt-BR": "Morais sobre o Livro de Jó"},
 "author": gregory_author(),
 "description": {
  "la": "Expositio in librum beati Iob, triginta quinque libris, quam Gregorius Constantinopoli inchoavit et Romae perfecit; cum epistola ad Leandrum Hispalensem et praefatione.",
  "en-US": "Gregory's vast commentary on the Book of Job in thirty-five books, begun at Constantinople for his monastic companions and finished in Rome (c. 578-595): each verse is read historically, then allegorically, then morally. With the letter to Leander of Seville and the preface. Latin text of the Maurist edition (Migne, PL 75-76); English from the Oxford Library of the Fathers (1844-50), as transcribed on Lectionary Central.",
  "pt-BR": "O imenso comentário de Gregório ao Livro de Jó em trinta e cinco livros, começado em Constantinopla para os seus companheiros monges e concluído em Roma (c. 578-595): cada versículo é lido no sentido histórico, depois alegórico, depois moral. Com a carta a Leandro de Sevilha e o prefácio. Texto latino da edição beneditina (Migne, PL 75-76); inglês da Library of the Fathers de Oxford (1844-50)."},
 "composed": "578-595", "languages": ["la", "en-US"], "work": "gregory-the-great/moralia-in-iob",
 "editions": {"la": {"editor": "Maurist edition (Sainte-Marthe, 1705), as reprinted in Migne, PL 75-76 (1849)"},
              "en-US": {"translator": "Library of the Fathers (Oxford: Parker, 1844-50), preface by Charles Marriott", "year": 1844, "from": "la"}},
 "sources": [
  {"language": "la", "url": "https://la.wikisource.org/wiki/Moralia",
   "edition": "Moralia, Epistola, Praefatio and Pars I-VI (Books I-XXXV) on Latin Wikisource (from the Corpus Corporum TEI of PL 75-76), with the Maurist chapter divisions (Caput) kept as headings.",
   "description": "Wikitext removed; the inline PL page counter and the Maurist [Vet./Rec.] chapter cross-references stripped; sections numbered 1., 2. ... set as paragraphs. Raw text in sources/la-originals.",
   "tier": "A", "tierEvidence": "Text of a 6th-century work in the 1705 Maurist edition (Migne 1849): public domain."},
  {"language": "en-US", "url": "https://lectionarycentral.com/gregorymoraliaindex.html",
   "edition": "Morals on the Book of Job by S. Gregory the Great (Library of the Fathers, 3 vols in 4, Oxford: Parker; London: Rivington, 1844-50), transcribed by Lectionary Central; the Epistle, Preface and Books I-XXXV. The transcriber's footnotes are only partly added (the Epistle has them).",
   "description": "Navigation removed; the translator's chapter numbers [ii]... set as Chapter headings; summaries italicised; Scripture references kept inline.",
   "tier": "A", "tierEvidence": "Oxford translation of 1844-50: public domain."}],
 "arrived": {"la": "2026-11-02", "en-US": "2026-11-02"}, "toc": toc}
d = ROOT + 'content/books/church-fathers/gregory-great-pope/moralia-in-iob'
write_book(d, book, {'la': la, 'en-US': en}, '\n---\n'.join(raw), 'moralia')
