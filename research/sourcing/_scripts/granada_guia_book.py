import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
import re
D = BASE / "guia-de-pecadores"
def t(lang, f): return h1(D / lang / (f + ".md"))
S = lambda f: {"es-ES": t("es-ES", f)}
front = [{"id": f, "title": S(f)} for f in ["prologo-galeato", "prologo", "argumento"]]
b1 = {"id": "libro-1", "title": {"es-ES": "Libro primero: exhortación a la virtud"}, "children": [{"id": "l1-c%d" % n, "title": S("l1-c%d" % n)} for n in range(1, 30)]}
b2 = {"id": "libro-2", "title": {"es-ES": "Libro segundo: doctrina de las virtudes"}, "children": [{"id": "l2-prologo", "title": S("l2-prologo")}] + [{"id": "l2-c%d" % n, "title": S("l2-c%d" % n)} for n in range(1, 24)]}
srcs = [{
 "language": "es-ES", "url": "https://www.dominicos.org/media/uploads/recursos/libros/granada_gu%C3%ADa_de_pecadores.pdf",
 "edition": "Fr. Luis de Granada, Guía de pecadores, in Doctrina cristiana (Madrid: Melchor Sánchez, 1657), transcribed by Fr. José María (Santiago de Compostela 2007, rev. 2009) for dominicos.org.",
 "description": "Both books with Granada's Prólogo galeato and his prologue; 29 + 23 chapters. Born-digital text with near-faithful old orthography; the transcriber's bracketed glosses are kept in the text and his footnotes (original marginal notes, Latin of the quoted Scripture) are kept as footnotes. His page numbers, Λ marks and appended Euquerio letter are removed. The transcriber's introduction and index are not imported.",
 "tier": "B", "tierEvidence": "Granada's text is from 1567/1657 (public domain); the transcription is freely given away by the Spanish Dominicans."}]
write_book("guia-de-pecadores", "granada-guia-de-pecadores",
 {"es-ES": "Guía de pecadores", "en-US": "The Sinner's Guide", "pt-BR": "Guia de pecadores"},
 {"es-ES": "Obra mayor de Fray Luis de Granada (1567, redacción definitiva): el libro primero persuade a la virtud con sus títulos y privilegios; el segundo enseña la doctrina de las virtudes y los remedios contra los vicios. Texto de la edición de Madrid 1657, con el Prólogo galeato sobre el fruto de la buena doctrina.",
  "en-US": "The masterpiece of Fray Luis de Granada (1567, definitive redaction): the first book urges virtue by its motives and privileges; the second teaches the doctrine of the virtues and the remedies against vices. Text of the Madrid 1657 edition, with the Prólogo galeato on the fruit of good reading.",
  "pt-BR": "Obra maior de Frei Luís de Granada (1567, redação definitiva): o primeiro livro persuade à virtude por seus títulos e privilégios; o segundo ensina a doutrina das virtudes e os remédios contra os vícios."},
 "1567", ["es-ES"], {"es-ES": {"editor": "Fr. José María (transcription of the Madrid 1657 edition)", "year": 2007}}, srcs,
 front + [b1, b2], "guia-de-pecadores",
 copies=[(R / "research/sourcing/louis-of-granada/web/dom-guia.txt", "spanish-originals", "guia-de-pecadores-dominicos-1657.txt")])

# English book
E = BASE / "guia-de-pecadores-mckenna-en"
toc = [{"id": "c%d" % n, "title": {"en-US": h1(E / "en-US" / ("c%d.md" % n))}} for n in range(1, 49)]
srcs = [{"language": "en-US", "url": "https://archive.org/details/sinnersguide0000vene",
 "edition": "The Sinner's Guide, translated from the Spanish by a Dominican Father [C. H. McKenna OP] (London 1883); archive.org scan of the TAN Books reprint, OCR text.",
 "description": "All 48 chapters of the 1883 translation, which divides the work differently from the Spanish (48 chapters against 29 + 23). The TAN introduction, the papal brief and the publisher's pages are removed. Section headings are kept. The last page's OCR is damaged at the line starts and was repaired by hand.",
 "tier": "A", "tierEvidence": "Translation of 1883 (McKenna)."}]
write_book("guia-de-pecadores-mckenna-en", "granada-guia-de-pecadores-mckenna",
 {"en-US": "The Sinner's Guide (McKenna)", "pt-BR": "Guia de pecadores (McKenna, inglês)"},
 {"en-US": "The Sinner's Guide in the English of a Dominican Father (C. H. McKenna OP, 1883): both books of Granada's Guía de pecadores in 48 chapters, from the TAN reprint.",
  "pt-BR": "A Guia de pecadores na tradução inglesa de um padre dominicano (C. H. McKenna OP, 1883), em 48 capítulos."},
 "1567", ["en-US"], {"en-US": {"translator": "C. H. McKenna OP (\"a Dominican Father\")", "year": 1883}}, srcs, toc, "guia-de-pecadores",
 copies=[(R / "research/sourcing/louis-of-granada/ia/sinnersguide0000vene.txt", "english-originals", "sinners-guide-mckenna-tan.txt")])
