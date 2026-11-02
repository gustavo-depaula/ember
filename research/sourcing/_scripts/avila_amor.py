"""Tratado del amor de Dios: es from the Apostolado Mariano booklet (1995), introduction omitted."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/tratado-del-amor-de-dios"
L = (R / "research/sourcing/john-of-avila/ia-tomo2/Tratado_del_amor_de_Dios___San_Juan_de__vila.txt").read_text(encoding="utf-8").split("\n")
HEADS = ["Dios nos ama como padre, madre y esposo", "Pruebas de su amor", "Fundamentos del amor de Cristo; largueza de Dios con Cristo",
         "Nuestra predestinación en Cristo", "Su amor al Padre reverbera en nosotros", "Grandeza del amor de Cristo",
         "El amor de los santos, superado por el amor de Cristo", "La locura de la cruz", "Fundamento de nuestra esperanza", "Cristo continúa presente",
         "Meditación del beneficio que nos hizo el Señor en el sacramento de la Eucaristía", "Del modo que el Señor tuvo para hacernos este beneficio"]
def norm(s): return re.sub(r"\W+", "", s.lower())
# locate headings
idx = []
bl = blocks_of(L)
pos = 0
start = next(i for i, l in enumerate(L) if l.strip().startswith("Dios nos ama como padre"))
lines = L[start:]
NOTE = re.compile(r"^\s*\d{1,2}[.,]\s+\S")
FOOT = re.compile(r"^\d{1,2}[.,]\s*(?:Cf\.\s*)?(?:[1-3]\s)?[A-ZÁÉ][A-Za-zñé]{1,6}[.,]+\s*\d")
secs, cur, title = [], [], None
buf = []
for b in blocks_of(lines):
    t = join_lines(b)
    if re.fullmatch(r"\d{1,3}", t): continue
    hit = next((h for h in HEADS if norm(t) == norm(h)), None)
    if hit:
        if title: secs.append((title, buf))
        title, buf = hit, []
    else:
        buf.append(t)
secs.append((title, buf))
assert len(secs) == len(HEADS), len(secs)
chapters = []
nextn = 1
for k, (t, paras) in enumerate(secs):
    notes, out, marks = [], [], {}
    for p in paras:
        if re.match(r"^l\.\s", p): p = "1." + p[2:]
        if re.match(r"^%d\.\s" % nextn, p):
            nextn += 1
        elif re.match(r"^\d{1,2}[.,]\s", p) and len(p) < 80:
            parts = re.split(r"(?<!Cf\.)\s(?=\d{1,2}[.,]\s+\S)", p)
            for x in parts:
                notes.append(re.sub(r"^\d{1,2}[.,]\s*", "", x).strip())
                marks.setdefault(len(out) - 1, []).append(len(notes))
            continue
        if out and not END.search(out[-1]) and not re.match(r"^\d{1,2}\.\s", p):
            prev = out[-1]
            out[-1] = (prev[:-1] + p) if prev.endswith("-") and re.match(r"[a-z]", p) else prev + " " + p
        else:
            out.append(p)
    # a page's notes may follow a sentence broken by the page: attach to the paragraph that ends up holding it
    keep = []
    for i, p in enumerate(out):
        p = re.sub(r"^l\. ", "1. ", p)
        keep.append(p)
    for pi, ns in marks.items():
        keep[max(pi, 0)] += "".join("[^%d]" % n for n in ns)
    keep += ["[^%d]: %s" % (i + 1, n) for i, n in enumerate(notes)]
    chapters.append(("c%02d" % (k + 1), t[0].upper() + t[1:], keep))
if __name__ == "__main__":
    for cid, t, paras in chapters: write_chapter(OUT / "es-ES" / (cid + ".md"), t, paras)
    print(len(chapters), sum(words(p) for p in (OUT / "es-ES").glob("*.md")))
