import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
import granada_memorial as g
names = {1: "Exhortación a bien vivir", 2: "De la penitencia y confesión", 3: "De la comunión", 4: "Regla de bien vivir", 5: "De la oración vocal", 6: "De la oración mental y del Vita Christi", 7: "Del amor de Dios"}
groups = emit_treatises("memorial-de-la-vida-cristiana", g.secs, ["dedicatoria", "prologo"], names)
# the Pater noster pieces at the end of treatise VII are part of that group already (ids start with t7-)
toc = toc_from("memorial-de-la-vida-cristiana", groups)
src = [cuervo_source(3, "Text of the first edition (Salamanca 1565).", "Dedication, preface, prologue and the seven treatises (exhortation to good living, penance, communion, rules of Christian life, vocal prayer, mental prayer with the Vita Christi, love of God), with the three meditations on the Pater noster. Cuervo's apparatus of variants (about 1600 lines) and table are not imported.")]
write_book("memorial-de-la-vida-cristiana", "granada-memorial-de-la-vida-cristiana",
 {"es-ES": "Memorial de la vida cristiana", "en-US": "Memorial of the Christian Life", "pt-BR": "Memorial da vida cristã"},
 {"es-ES": "Memorial de Fray Luis de Granada (1565) en siete tratados: exhortación a bien vivir, penitencia y confesión, comunión, reglas de vida cristiana, oración vocal, oración mental con la vida de Cristo, y amor de Dios.",
  "en-US": "Fray Luis de Granada's Memorial (1565) in seven treatises: exhortation to good living, penance and confession, communion, rules of Christian life, vocal prayer, mental prayer with the life of Christ, and the love of God.",
  "pt-BR": "Memorial de Frei Luís de Granada (1565) em sete tratados: exortação ao bem viver, penitência e confissão, comunhão, regras de vida cristã, oração vocal, oração mental com a vida de Cristo e amor de Deus."},
 "1565", ["es-ES"], {"es-ES": {"editor": "Justo Cuervo OP", "year": 1907}}, src, toc, "memorial-de-la-vida-cristiana",
 copies=[(Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia/obrascue03luisuoft.txt"), "spanish-originals", "obras-cuervo-03.txt")])
