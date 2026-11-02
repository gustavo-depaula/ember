import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
from granada_segments import *
L = vol(10)
KW = ("GUIA DE PEC", "GUÍA DE PEC", "LIBRO I", "LIBRO II", "OBRAS DE", "PARTE I", "SEGUNDA PARTE", "PRIMERA PARTE")
front = [("lector", "Al lector", 391, 475)]
segs = [("l1", "Libro primero", 475, 2704), ("l2", "Libro segundo", 2707, 7869), ("p2", "Segunda parte: oración, confesión y comunión", 8325, 19192)]
secs, groups = segments(L, front, segs, KW, title_pos="below")
slug = "guia-de-pecadores-primitiva"
write_sections(BASE / slug, "es-ES", secs)
names = {"l1": "Libro primero: exhortación a la virtud", "l2": "Libro segundo: reglas de bien vivir", "p2": "Segunda parte: oración, confesión y comunión (con el Vita Christi)"}
g2 = [(None, None, ["lector"])] + [(g, names[g], ids) for g, l, ids in groups]
quick_book(slug, "granada-guia-primitiva", 10,
 ("Guía de pecadores (texto primitivo)", "The Sinner's Guide (first text)", "Guia de pecadores (texto primitivo)"),
 ("Primera redacción de la Guía de pecadores de Fray Luis de Granada (Lisboa, 1556-1557): el libro primero de exhortación a la virtud, el libro segundo con las reglas de bien vivir, y la segunda parte sobre la oración, la confesión y la comunión. Distinta de la redacción definitiva de 1567.",
  "The first redaction of Fray Luis de Granada's Sinner's Guide (Lisbon 1556-1557): book one, the exhortation to virtue; book two, the rules of good living; and the second part on prayer, confession and communion. Distinct from the definitive text of 1567.",
  "Primeira redação da Guia de pecadores de Frei Luís de Granada (Lisboa, 1556-1557): o livro primeiro, de exortação à virtude; o segundo, com as regras do bem viver; e a segunda parte sobre a oração, a confissão e a comunhão."),
 "1556-1557", g2, "Both books of the first part and the second part of the original Guía; the Tratado de la oración y meditación of Peter of Alcántara and Hieronymus of Ferrara's treatise on the three vows that Cuervo prints in the same volume are not Granada's and are not imported.", "guia-de-pecadores-primitiva", 1906, "Text of the 1556-1557 Lisbon editions.")
