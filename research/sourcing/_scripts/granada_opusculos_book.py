import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from granada_lib import *
from cuervo import *
L = vol(11)
KW = ("MANUAL DE", "MEMORIAL", "VITA CHRISTI", "RECOPILACI", "TRATADO DE", "OBRAS DE", "GRANADA")
pieces = [("manual-1557", "Manual de diversas oraciones y espirituales ejercicios (1557)", 253, 5613), ("manual-ampliado", "Manual de oraciones y meditaciones (edición ampliada)", 5613, 13566),
          ("memorial-del-cristiano", "Memorial de lo que debe hacer el cristiano", 13566, 13994), ("tratado-de-oraciones", "Tratado de algunas oraciones muy devotas", 13994, 15841),
          ("vita-christi", "Vita Christi: breve sumario de la vida de Cristo", 15841, 18622), ("tratado-de-meditacion", "Tratado de la meditación", 18622, 19748),
          ("recopilacion", "Recopilación breve del Libro de la oración", 19748, 20994)]
secs = []
for cid, title, a, b in pieces:
    secs.append((cid, title, clean(L[a + 1:b], run_kw=KW)))
slug = "manual-y-opusculos"
write_sections(BASE / slug, "es-ES", secs)
quick_book(slug, "granada-manual-y-opusculos", 11,
 ("Manual de oraciones y otros opúsculos", "Manual of Prayers and Other Opuscula", "Manual de orações e outros opúsculos"),
 ("Los opúsculos de devoción de Fray Luis de Granada reunidos en el tomo XI de Cuervo: el Manual de diversas oraciones (1557) y su edición ampliada, el Memorial de lo que debe hacer el cristiano, el Tratado de algunas oraciones, el Vita Christi, el Tratado de la meditación y la Recopilación breve del Libro de la oración.",
  "The devotional opuscula of Fray Luis de Granada gathered in Cuervo's vol. XI: the Manual of various prayers (1557) and its enlarged edition, the Memorial of what a Christian must do, the Treatise on some prayers, the Vita Christi, the Treatise on meditation and the brief Recopilación of the Book of Prayer.",
  "Os opúsculos de devoção de Frei Luís de Granada reunidos no tomo XI de Cuervo: o Manual de diversas orações (1557) e sua edição ampliada, o Memorial do que deve fazer o cristão, o Tratado de algumas orações, o Vita Christi, o Tratado da meditação e a Recopilação breve do Livro da oração."),
 "1557-1574", [(None, None, [c for c, _, _ in secs if sum(len(x.split()) for x in _) >= 0])], "Seven pieces, one file each. The prayer and consideration headings printed in capitals are dropped by the cleaning, so the files run on without them; Cuervo's variants are not imported.", "manual-y-opusculos", 1906, "Texts of the 1557 Manual, the later editions and the 1574 Recopilación.")
