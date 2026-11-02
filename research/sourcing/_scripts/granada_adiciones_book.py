import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
import granada_adiciones as g
from cuervo import write_sections
write_sections(BASE / "adiciones-al-memorial", "es-ES", g.secs)
ids = [c for c, _, _ in g.secs]
groups = [(None, None, ["prologo"]),
          ("amor-de-dios", "Tratado del amor de Dios", [i for i in ids if i.startswith("t1-") or i.startswith("c22-")]),
          ("vida-de-cristo", "Meditaciones muy devotas de la vida de Cristo", [i for i in ids if i.startswith("m-")])]
quick_book("adiciones-al-memorial", "granada-adiciones-al-memorial", 4,
 ("Adiciones al Memorial de la vida cristiana", "Additions to the Memorial of the Christian Life", "Adições ao Memorial da vida cristã"),
 ("Adiciones de Fray Luis de Granada al Memorial (1574): el tratado del amor de Dios, con las consideraciones sobre los beneficios y perfecciones divinas, y las Meditaciones muy devotas de la vida de Cristo, de su niñez, pasión y resurrección.",
  "Fray Luis de Granada's additions to the Memorial (1574): the treatise on the love of God, with considerations on the divine benefits and perfections, and the devout Meditations on the life of Christ, from his childhood to the Passion and Resurrection.",
  "Adições de Frei Luís de Granada ao Memorial (1574): o tratado do amor de Deus, com considerações sobre os benefícios e perfeições divinas, e as Meditações muito devotas da vida de Cristo."),
 "1574", groups, "Prologue, the treatise on the love of God (22 chapters and the considerations in chapter XXII) and the Meditaciones muy devotas on Christ's life. The Filomena of St Bonaventure that Cuervo appends, his variants and tables are not imported.", "adiciones-al-memorial", 1907, "Text of the 1574 Adiciones.")
