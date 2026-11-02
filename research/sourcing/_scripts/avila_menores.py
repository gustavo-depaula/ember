"""Escritos menores (Documentos espirituales) and Dos pláticas a sacerdotes: Apostolado Mariano vol. I."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import avila_tratados as t
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
BOOKS = R / "content/books/john-of-avila-opera-omnia"
L = (t.SRC / "Obras_de_San_Juan_de__vila__Tomo_1_.txt").read_text(encoding="utf-8").split("\n")
t.RUN = re.compile(r"^\s*(\d{3}\s+)?(\d\W+)?(D.CUMENTOS ESPIRITUALES|[DT]OS PLÁTICAS A SACERDOT\w+|PLÁTICA (PRIMERA|SEGUNDA)|DOCTRINA ADMIRABLE|EXPOSICI.N BREVE.*|REGLAS DE VIDA PERFECTA|DIEZ DOCUMENTOS.*|GRADOS DE HUMILDAD|QUINCE AVISOS|DIEZ AVISOS|DEO GRATIAS|ÍNDICE)(\s+\d+)?\W*$")

def section(lo, hi, skip):
    lines = L[lo:hi]
    # drop the first `skip` non-empty lines (the title)
    n = 0
    for i, ln in enumerate(lines):
        if ln.strip():
            n += 1
            if n == skip:
                lines = lines[i + 1:]; break
    blocks = t.clean_blocks(lines)
    paras, notes = t.chapter(0, "", blocks)
    conv = []
    for p in paras:
        letters = [c for c in p if c.isalpha()]
        if letters and len(p) < 220 and sum(c.isupper() for c in letters) > 0.8 * len(letters):
            conv.append("## " + re.sub(r"^([A-Z]\. )(\w)", lambda m: m.group(1) + m.group(2).upper(), t.sentence(p.strip("[]. "))))
        else:
            conv.append(re.sub(r"^l\. ", "1. ", p))
    conv = [("*Ps. 118.*" if p.startswith("## (ps") else p) for p in conv]
    conv = [p for p in conv if not re.match(r"^## [\dLl1.\-—– ]+doctrina admirable|^imera sí$|^## (psn|plática primera)|^## \W*$", p, re.I)]
    return t.finish(conv, notes, None)

ESC = [("doctrina-admirable", "Doctrina admirable (instrucción a un mancebo)", 17744, 18553, 3),
       ("bienaventuranzas", "Exposición breve de las bienaventuranzas", 18554, 18614, 3),
       ("reglas-de-vida-perfecta", "Reglas de vida perfecta", 18615, 18898, 1),
       ("diez-documentos", "Diez documentos para la vida espiritual", 18899, 19038, 2),
       ("grados-de-humildad", "Grados de humildad", 19039, 19108, 1),
       ("diez-avisos", "Diez avisos para caminar por la vía recta", 19109, 19207, 2),
       ("quince-avisos", "Quince avisos para quien desea ser religioso", 19208, 19298, 2)]
PLA = [("platica-1", "Plática primera a los clérigos de Córdoba", 19298, 19700, 1),
       ("platica-2", "Plática segunda a los clérigos de Córdoba", 19701, 20403, 1)]
if __name__ == "__main__":
    for folder, spec in (("escritos-menores", ESC), ("platicas", PLA)):
        for cid, title, lo, hi, skip in spec:
            paras = section(lo, hi, skip)
            write_chapter(BOOKS / folder / "es-ES" / (cid + ".md"), title, paras)
            print(cid, sum(len(p.split()) for p in paras))
