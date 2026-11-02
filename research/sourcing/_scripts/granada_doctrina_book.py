import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
from granada_segments import *
L = vol(13)
KW = ("DOCTRINA CRISTIANA", "COMPENDIO", "OBRAS DE", "PARTE,")
def first(rx, lo=0):
    return next(i for i in range(lo, len(L)) if re.match(rx, re.sub(r"\s+", " ", L[i]).strip()))
p4 = 15880
end = 20831
front = [("lector", "Al cristiano lector", 286, 354)]
segs = [("p1", "Primera parte", 361, 4351), ("p2", "Segunda parte", 4358, 10402), ("p3", "Tercera parte", 10405, p4)]
secs, groups = segments(L, front, segs, KW, title_pos="below")
slug = "compendio-de-doctrina-cristiana"
secs.append(("sermones", "Sermones", clean(L[p4 + 1:end], run_kw=KW)))
write_sections(BASE / slug, "es-ES", secs)
names = {"p1": "Primera parte", "p2": "Segunda parte", "p3": "Tercera parte"}
quick_book(slug, "granada-compendio-de-doctrina-cristiana", 13,
 ("Compendio de doctrina cristiana (versión castellana)", "Compendium of Christian Doctrine (Spanish version)", "Compêndio de doutrina cristã (versão castelhana)"),
 ("Compendio de doctrina cristiana que Fray Luis de Granada escribió en portugués (Lisboa 1559), en la versión castellana del P. Justo Cuervo (1906): la fe, los mandamientos, la oración y los sacramentos en tres partes y los sermones. El original portugués no se ha hallado en texto.",
  "The Compendium of Christian Doctrine that Fray Luis de Granada wrote in Portuguese (Lisbon 1559), in the Spanish version of Fr. Justo Cuervo (1906): faith, commandments, prayer and the sacraments in three parts with the sermons. The Portuguese original has not been found as text.",
  "O Compêndio de doutrina cristã que Frei Luís de Granada escreveu em português (Lisboa 1559), na versão castelhana do P. Justo Cuervo (1906): a fé, os mandamentos, a oração e os sacramentos em três partes e os sermões. O original português não foi encontrado em texto."),
 "1559", [(None, None, ["lector"])] + [(g, names[g], ids) for g, l, ids in groups] + [(None, None, ["sermones"])], "Cuervo's Spanish translation of the Portuguese Compendio de doutrina christãa; tables and notes are not imported.", "compendio-de-doctrina-cristiana", 1906, "Translation made by Cuervo from the Portuguese original.")
