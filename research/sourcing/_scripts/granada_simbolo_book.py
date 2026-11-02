import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
import granada_simbolo as g
from cuervo import write_sections
import re, shutil
slug = "introduccion-del-simbolo"
allsecs = [x for P in (1, 2, 3, 4) for x in g.secs[P]]
write_sections(BASE / slug, "es-ES", allsecs)
def leaves(ids):
    d = BASE / slug / "es-ES"
    return [{"id": i, "title": {"es-ES": h1(d / (i + ".md"))}} for i in ids]
ids = {P: [c for c, _, _ in g.secs[P]] for P in (1, 2, 3, 4)}
toc = [{"id": "introd", "title": {"es-ES": "Dedicatoria y prólogo"}, "children": leaves(["p1-dedicatoria", "p1-lector"])}]
toc.append({"id": "parte-1", "title": {"es-ES": "Primera parte: de la creación del mundo y el conocimiento de Dios por las criaturas"}, "children": leaves([i for i in ids[1] if i not in ("p1-dedicatoria", "p1-lector")])})
toc.append({"id": "parte-2", "title": {"es-ES": "Segunda parte: de las excelencias de nuestra santa fe y religión cristiana"}, "children": leaves(ids[2])})
t3 = [{"id": "p3-prologo", "title": {"es-ES": h1(BASE / slug / "es-ES" / "p3-prologo.md")}}]
t3 += [{"id": "parte-3-t1", "title": {"es-ES": "Tratado primero: de las conveniencias del misterio de la redención"}, "children": leaves([i for i in ids[3] if i.startswith("p3-t1")])},
       {"id": "parte-3-t2", "title": {"es-ES": "Tratado segundo: de las figuras y diálogos"}, "children": leaves([i for i in ids[3] if i.startswith("p3-t2")])}]
toc.append({"id": "parte-3", "title": {"es-ES": "Tercera parte: del misterio de nuestra redención a la luz natural"}, "children": t3})
t4 = leaves([i for i in ids[4] if i in ("p4-lector", "p4-intro")])
t4 += [{"id": "parte-4-t1", "title": {"es-ES": "Tratado primero: del misterio de la redención por la luz de la fe"}, "children": leaves([i for i in ids[4] if i.startswith("p4-t1")])},
       {"id": "parte-4-t2", "title": {"es-ES": "Tratado segundo: diálogos que responden a las objeciones acerca del Mesías"}, "children": leaves([i for i in ids[4] if i.startswith("p4-t2")])}]
toc.append({"id": "parte-4", "title": {"es-ES": "Cuarta parte: del misterio de nuestra redención por la luz de la fe"}, "children": t4})
src = [cuervo_source(v, "Part %d of the Introducción del símbolo de la fe (Salamanca 1583)." % (v - 4), "Part %d with its prologue and apparatus removed." % (v - 4)) for v in (5, 6, 7, 8)]
src[0]["description"] = "Parts I-IV of the Introducción del símbolo de la fe (vols. V-VIII), with the dedication and prologues of the author; the papal briefs, the editor's apparatus of variants and the tables are removed. OCR cleaned by script, not proofread."
src = src[:1] + [dict(s_, description="Part %d of the same work (this volume's OCR text)." % (i + 2)) for i, s_ in enumerate(src[1:])]
write_book(slug, "granada-introduccion-del-simbolo",
 {"es-ES": "Introducción del símbolo de la fe", "en-US": "Introduction to the Creed", "pt-BR": "Introdução do símbolo da fé"},
 {"es-ES": "Obra mayor de Fray Luis de Granada (1583), en cuatro partes: la creación y el conocimiento de Dios por las criaturas; las excelencias de la fe y la religión cristiana; el misterio de la redención a la luz natural; y a la luz de la fe, con los diálogos sobre las objeciones acerca del Mesías.",
  "en-US": "Fray Luis de Granada's major work (1583) in four parts: creation and the knowledge of God through creatures; the excellences of the faith and the Christian religion; the mystery of redemption by natural light; and by the light of faith, with the dialogues answering objections about the Messiah.",
  "pt-BR": "Obra maior de Frei Luís de Granada (1583), em quatro partes: a criação e o conhecimento de Deus pelas criaturas; as excelências da fé e da religião cristã; o mistério da redenção à luz natural; e à luz da fé, com os diálogos sobre as objeções acerca do Messias."},
 "1583", ["es-ES"], {"es-ES": {"editor": "Justo Cuervo OP", "year": 1908}}, src, toc, "introduccion-del-simbolo",
 copies=[(Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia/obrascue%02dluisuoft.txt" % v), "spanish-originals", "obras-cuervo-%02d.txt" % v) for v in (5, 6, 7, 8)])
