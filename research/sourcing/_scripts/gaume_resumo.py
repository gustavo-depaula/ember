"""Resumo do Catecismo de Perseverança (Porto 1868; archive.org resumodocatecism00gaum) -> pt-PT chapters."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr

src = Path("research/sourcing/catechisms/pt/gaume-resumo-1868.txt")
out = Path("content/books/gaume-resumo-catecismo-perseveranca/pt-PT")
out.mkdir(parents=True, exist_ok=True)
ps = cat_ocr.paragraphs(src.read_text())
RUN = re.compile(r"^(\S{1,5} )?(DE PERSEVERAN|RESUMO DO CATECISMO|CATECISMO DE PERSEV|ANALYSE|PERSEVERAN)\S*( \S{1,5})?$|^\S{1,5} ANALYSE$|^ANALYSE \S{1,5}$", re.I)
ps = [(n, re.sub(r"\s+", " ", t)) for n, t in ps if not (len(t) < 40 and RUN.match(t))]
PART = re.compile(r"^(PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA) PARTE$")
LES = re.compile(r"^(?:\S{0,3}\s)?(?:[IVXLCUlTnY]{1,8}[\.\-\^=*«'/\"º\s]{0,5}\s*L[IÍ][CÇ][ÃA]O\.?|L[IÍ][CÇ][ÃA]O\.?\s+[IVXL]{1,6}\.?|PRIMEIRA L[IÍ][CÇ][ÃA]O)$")
Q = re.compile(r"^P[\.,]\s*(.*)$")
A = re.compile(r"^[RKB]\.\s*(.*)$")
PN = {"PRIMEIRA": 1, "SEGUNDA": 2, "TERCEIRA": 3, "QUARTA": 4}

def mend(paras):
    """The scan has blank lines inside sentences: join a paragraph that stops without end punctuation to the next unless that begins a question or answer."""
    out = []
    for n, t in paras:
        if out and not re.search(r"[.?!:;»\")\]]$", out[-1][1]) and not Q.match(t) and not A.match(t) and not t.startswith(("Tomo a resolu", "Resolu")) and len(out[-1][1]) < 1500:
            out[-1] = (out[-1][0], out[-1][1] + " " + t)
        else: out.append((n, t))
    return out

def qa(paras):
    paras = mend(paras)
    res, k, st = [], 0, None
    for _, t in paras:
        m = Q.match(t)
        if m: k += 1; res.append(f"**{k}.** {m.group(1)}"); st = "q"; continue
        m = A.match(t)
        if m and st == "q": res.append("*" + m.group(1) + "*"); st = "a"; continue
        if st in ("a", "ac") and not t.startswith(("Tomo a resolu", "Resolu")):
            res.append("*" + t + "*"); st = "ac"; continue
        res.append(t); st = None
    return "\n\n".join(res)

chapters = []
d0 = next(n for n, t in ps if t.startswith("DISCURSO PRELIMINAR"))
p1 = next(n for n, t in ps if PART.match(t) and n > d0)
chapters.append(("discurso-preliminar", "Discurso preliminar", [x for x in ps if d0 < x[0] < p1]))
an = next(n for n, t in ps if n > 19000 and t.startswith("RESUMO DO CATECISMO DE PERSEVERANÇA") or (n > 19400 and t == "ANALYSE"))
body = [x for x in ps if p1 <= x[0] < an]
part, cnt, cur = 0, 0, None
def close():
    global cur
    if cur: chapters.append(cur); cur = None
i = 0
while i < len(body):
    n, t = body[i]
    if PART.match(t):
        close(); part = PN[t.split()[0]]; cnt = 0; i += 1
        # the part's subtitle paragraphs come before the first lesson: skip them
        while i < len(body) and not LES.match(body[i][1]): i += 1
        continue
    if LES.match(t):
        close(); cnt += 1; i += 1
        title = ""
        if i < len(body) and not Q.match(body[i][1]) and len(body[i][1]) < 220:
            title = body[i][1].strip(" .—-"); i += 1
        cur = (f"parte-{part}-licao-{cnt:02d}", f"Parte {part}, Lição {cnt}" + (f": {title.capitalize()}" if title else ""), [])
        continue
    if cur: cur[2].append((n, t))
    i += 1
close()
chapters.append(("analyse", "Análise de Camillo Castello-Branco", [x for x in ps if x[0] > an]))
order = []
for cid, title, seg in chapters:
    body_md = qa(seg) if cid != "analyse" and cid != "discurso-preliminar" else "\n\n".join(t for _, t in mend(seg))
    (out / f"{cid}.md").write_text(f"# {title}\n\n{body_md}\n", encoding="utf-8")
    order.append(cid)
json.dump(order, open("research/sourcing/catechisms/_resumo_order.json", "w"))
print(len(order))
from collections import Counter
print(Counter(c[0].split("-licao")[0] for c in chapters))
