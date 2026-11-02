"""Split the DCO Spanish Tratado de la oración y meditación into chapter files."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

SRC = Path("/Users/gustavo/Documents/prayer/research/sourcing/peter-of-alcantara/es_dco.txt")
OUT = Path(sys.argv[1])
lines = SRC.read_text(encoding="utf-8").split("\n")
JUNK = re.compile(r"^\s*(file:///|San Pedro de Alcántara 1499|SANPEDRO|\[ ?(Capítulo|Índice))|^\s*(PRIMERA|SEGUNDA) PARTE\s*$|^\s*Fin del libro")
days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"]
ROM = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10, "XI": 11, "XII": 12}
# body starts at the Prólogo heading after the index
start = next(i for i, l in enumerate(lines) if i > 150 and l.strip() == "PRÓLOGO")
cur, secs, part = None, [], 1
for i in range(start, len(lines)):
    l = lines[i]
    if re.match(r"^\s*SEGUNDA PARTE\s*$", l):
        part = 2
    m = re.match(r"^\s+CAPÍTULO ([IVX]+)(?:\.(\d))?\. (.*)$", l)
    if l.strip() == "PRÓLOGO" and cur is None:
        cur = {"id": "prologo", "title": "Prólogo", "lines": []}
        secs.append(cur)
        continue
    if m:
        num, sub, t = m.groups()
        # title may continue on next line
        j = i + 1
        while lines[j].strip():
            t += " " + lines[j].strip()
            lines[j] = ""
            j += 1
        if sub:
            base = "p1-c%d" % ROM[num]
            cid = "%s-%s" % (base, days[int(sub) - 1])
            title = "Meditación del " + days[int(sub) - 1].replace("miercoles", "miércoles").replace("sabado", "sábado")
        else:
            cid = "p%d-c%d" % (part, ROM[num])
            t = t.strip()
            title = "Capítulo %s. %s" % (num, t[0] + t[1:].lower())
        cur = {"id": cid, "title": title, "lines": []}
        secs.append(cur)
        continue
    if cur is not None and not JUNK.search(l):
        cur["lines"].append(l)
import json
res = []
for s in secs:
    paras = [join_lines(b) for b in blocks_of(s["lines"])]
    out = []
    for p in paras:
        if p.isupper() and len(p) < 40:
            out.append("## " + p[0] + p[1:].lower())
        else:
            out.append(p)
    out = merge_paragraphs(out)
    # the prologue heading line repeats the book title block; drop leading title paragraph in prologue
    write_chapter(OUT / (s["id"] + ".md"), s["title"], out)
    res.append((s["id"], s["title"], sum(len(p.split()) for p in out)))
for r in res:
    print(*r, sep="\t")
