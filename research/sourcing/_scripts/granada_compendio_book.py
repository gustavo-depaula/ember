import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
from granada_segments import *
L = vol(9)
KW = ("COMPENDIO", "OBRAS DE", "SUMARIO", "BREVE TRATADO")
front = [("prologo", "Prólogo", 164, 280), ("dedicatoria", "Al serenísimo príncipe Alberto", 280, 330), ("lector", "Al cristiano lector", 330, 418)]
segs = [("p1", "Primera parte", 418, 2029), ("p2", "Segunda parte", 2029, 9912), ("p3", "Tercera parte", 9912, 15316), ("p4", "Cuarta parte", 15316, 17655), ("bt", "Breve tratado del modo de catequizar", 17655, 19560)]
secs, groups = segments(L, front, segs, KW)
slug = "compendio-del-simbolo"
write_sections(BASE / slug, "es-ES", secs)
g2 = [(None, None, ["prologo", "dedicatoria", "lector"])] + groups
g2 = [(g, {"p1": "Primera parte: de la fe y la creación", "p2": "Segunda parte: de las excelencias de la fe", "p3": "Tercera parte: del misterio de la redención", "p4": "Cuarta parte: de la vida de Cristo y la Iglesia", "bt": "Breve tratado del modo de catequizar"}.get(g, l), ids) if g else (g, l, ids) for g, l, ids in g2]
quick_book(slug, "granada-compendio-del-simbolo", 9,
 ("Compendio de la Introducción del símbolo de la fe", "Compendium of the Introduction to the Creed", "Compêndio da Introdução do símbolo da fé"),
 ("Compendio de Fray Luis de Granada (1585, dedicado al archiduque Alberto) de la Introducción del símbolo de la fe en cuatro partes, con el Breve tratado del modo de catequizar a los nuevos convertidos.",
  "Fray Luis de Granada's compendium (1585, dedicated to Archduke Albert) of the Introduction to the Creed, in four parts, with the short treatise on how to catechize new converts.",
  "Compêndio de Frei Luís de Granada (1585) da Introdução do símbolo da fé, em quatro partes, com o Breve tratado do modo de catequizar os recém-convertidos."),
 "1585", g2, "Prologue, dedication, four parts of the Compendio (the so-called fifth part of the Símbolo) and the Breve tratado del modo de catequizar. Cuervo's tables are not imported.", "compendio-del-simbolo", 1908, "Text of the 1585 Compendio.")
