import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
import granada_oracion as g
ids = [c for c, _, _ in g.secs]
pick = lambda pre: [i for i in ids if i.startswith(pre)]
groups = [(None, None, ["epistola", "prologo"]),
          ("parte-1", "Primera parte: de la materia de la oración", pick("p1-")),
          ("parte-2", "Segunda parte: de la devoción y de las cosas que la ayudan o impiden", pick("p2-")),
          ("parte-3", "Tercera parte: sermones de la oración", pick("p3-")),
          ("tres-tratados", "Tres breves tratados: oración, ayuno y limosna", pick("t3-"))]
toc = toc_from("libro-de-la-oracion", groups)
src = [cuervo_source(2, "Text of the 1554 first edition with the later additions (the three sermons and the Tres breves tratados of the 1566 redaction).",
       "Prologue, the 14 meditations (mornings: the Passion; nights: the seven treatises) with the chapters on method, the second part on devotion, the three sermons on prayer and the three short treatises. Cuervo's 3000-line apparatus of variants between the editions is not imported.")]
write_book("libro-de-la-oracion", "granada-libro-de-la-oracion",
 {"es-ES": "Libro de la oración y meditación", "en-US": "Book of Prayer and Meditation", "pt-BR": "Livro da oração e meditação"},
 {"es-ES": "Libro de Fray Luis de Granada (1554) que enseña a orar meditando los misterios de la fe: catorce meditaciones para los días de la semana (la Pasión por la mañana; muerte, juicio, infierno, gloria y beneficios por la noche), el método de la oración, la segunda parte sobre la devoción y sus impedimentos, tres sermones sobre la oración y los tres breves tratados de la oración, el ayuno y la limosna.",
  "en-US": "Fray Luis de Granada's book (1554) teaching how to pray by meditating on the mysteries of the faith: fourteen meditations for the days of the week (the Passion in the morning; death, judgment, hell, heaven and God's benefits at night), the method of prayer, the second part on devotion and its obstacles, three sermons on prayer and the three short treatises on prayer, fasting and almsgiving.",
  "pt-BR": "Livro de Frei Luís de Granada (1554) que ensina a rezar meditando os mistérios da fé: catorze meditações para os dias da semana, o método da oração, a segunda parte sobre a devoção e seus impedimentos, três sermões sobre a oração e os três breves tratados da oração, do jejum e da esmola."},
 "1554-1566", ["es-ES"], {"es-ES": {"editor": "Justo Cuervo OP", "year": 1906}}, src, toc, "libro-de-la-oracion",
 copies=[(IA_ := Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia/obrascue02luisuoft.txt"), "spanish-originals", "obras-cuervo-02.txt")])
