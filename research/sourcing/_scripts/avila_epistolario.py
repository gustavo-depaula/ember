"""Epistolario espiritual: es from the Apostolado Mariano digital edition (modernised, 100 letters)."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/epistolario"
L = (R / "research/sourcing/john-of-avila/ia-tomo2/Cartas___San_Juan_de__vila.txt").read_text(encoding="utf-8").split("\n")
pat = re.compile(r"^\W*(\d{1,3})(?:['’]\d)?[\W_]{0,4}\s*[—–\-=.]{0,4}\W*((?:A|AL|AA|AÅ|AA|PARA|Para|PARa)\b[A-ZÁÉÍÓÚÑa-záéíóúñ ,.'’()]{3,}.*)$")
start = next(i for i, l in enumerate(L) if i > 300 and l.strip() == "EPISTOLARIO ESPIRITUAL") 
heads = []
for i in range(start, len(L)):
    m = pat.match(L[i])
    if not m or L[i][:1].islower():
        continue
    rest = m.group(2)
    if not re.match(r"^(A|AL|AA|AÅ|PARA|Para|PARa)\s", rest):
        continue
    letters = re.sub(r"[^A-Za-zÁÉÍÓÚÑáéíóúñ]", "", rest)
    if sum(c.isupper() for c in letters) < 0.4 * len(letters):
        continue
    if len(L[i]) > 130:
        continue
    heads.append((i, int(m.group(1)), rest))
print(len(heads), [h[1] for h in heads][:110], file=sys.stderr)
LOW = set("a al aa de del la las los el y e para en mi muy este estos estas esta reino reinos señor señora ilustrísima persona devota devoto doncella monja religiosa religioso sacerdote predicador caballero amigo amigos mujer mujeres devotas devotos estudiante virtuosa desconsolado afligida afligido misma mismo hijo hija suya suyo suyos suyas unos unas un una sus su consagrada espiritual discípulo obispo arzobispo presidente concilio condesa compañía asistente sevilla escrupulosa navidad cordoba córdoba que siendo".split())
def title(rest):
    rest = re.sub(r"[^A-Za-zÁÉÍÓÚÑáéíóúñ .]+$", "", rest.replace("AÅ", "A").replace("AA ", "A ")).strip(" .")
    rest = re.sub(r"\s+", " ", rest)
    out = []
    for w in rest.lower().split():
        base = re.sub(r"[^a-záéíóúñ]", "", w)
        out.append(w if (base in LOW and out) else w[0].upper() + w[1:])
    t = " ".join(out)
    return t[0].upper() + t[1:]
FOOT = re.compile(r"^(\*\d?|“|”|\d{1,2})\s+[A-ZÁÉÍÓÚ¿¡«]")
FIX = {10: "A un señor de este reino, siendo asistente de Sevilla", 15: "A una mujer atribulada", 16: "A una señora casada", 17: "A doña Sancha Carrillo", 18: "A una señora monja, atribulada",
       31: "A doña Leonor de Hinestrosa", 50: "A un caballero de Córdoba", 54: "A unos amigos atribulados suyos", 73: "A un caballero amigo suyo", 82: "Para el P. Antonio de Córdoba, de la Compañía de Jesús",
       89: "A don Pedro Guerrero", 90: "A don Pedro Guerrero, arzobispo de Granada", 91: "A don Cristóbal de Rojas y Sandoval, obispo de Córdoba", 92: "Al obispo de Córdoba, presidente del Concilio",
       93: "A la muy ilustre señora la condesa de Feria", 95: "Al P. Diego Laínez", 29: "A una señora ilustrísima", 30: "A la misma señora ilustrísima"}
chapters = []
for k, (i, n, rest) in enumerate(heads):
    end = heads[k + 1][0] if k + 1 < len(heads) else len(L)
    lines = [x for x in L[i + 1:end] if not re.fullmatch(r"\s*\d{1,3}\s*", x)]
    paras = [join_lines(b) for b in blocks_of(lines)]
    paras = merge_paragraphs(paras)
    notes, keep = [], []
    for j, p in enumerate(paras):
        if j >= 2 and FOOT.match(p) and len(p) < 900 and keep and not re.match(r"^\d{1,2}\.\s", p):
            notes.append(re.sub(r"^(\*\d?|“|”|\d{1,2})\s+", "", p)); keep[-1] += "[^%d]" % len(notes)
        else:
            keep.append(p)
    if keep:
        keep[0] = "*" + keep[0] + "*" if len(keep[0]) < 400 else keep[0]
    keep += ["[^%d]: %s" % (q + 1, t) for q, t in enumerate(notes)]
    t = FIX.get(k + 1, title(rest))
    chapters.append(("l%03d" % (k + 1), "Carta %d. %s" % (k + 1, t), keep, n))
if __name__ == "__main__":
    for cid, t, paras, n in chapters:
        write_chapter(OUT / "es-ES" / (cid + ".md"), t, paras)
    print(len(chapters), sum(words(p) for p in (OUT / "es-ES").glob("*.md")))
    for c in chapters[:3] + chapters[24:30]: print(c[0], c[1], c[3])
