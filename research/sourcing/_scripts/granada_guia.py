"""Guía de pecadores (1567): es-ES from the dominicos.org transcription of the 1657 Madrid ed."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
SRC = R / "research/sourcing/louis-of-granada/web/dom-guia.txt"
OUT = R / "content/books/louis-of-granada-opera-omnia/guia-de-pecadores"
T = SRC.read_text(encoding="utf-8").split("\n")

def idx(pred, start=0):
    return next(i for i in range(start, len(T)) if pred(T[i]))

i_gal = idx(lambda l: l.strip() == "PRÓLOGO GALEATO", 100)
i_idx = idx(lambda l: l.strip() == "ÍNDICE GENERAL")
i_pro = idx(lambda l: "Prólogo" in l and "§" in l)
i_arg = idx(lambda l: l.strip() == "Argumento deste primero libro", i_pro)
i_b1 = idx(lambda l: l.strip() == "PRIMERA PARTE", i_arg)
i_b2 = idx(lambda l: l.startswith("LIBRO SEGUNDO DE LA"), i_b1)
i_end = idx(lambda l: l.strip() == "[FIN DE LA GUÍA DE PECADORES]", i_b2)

# titles from the index
idxl = T[i_idx:i_pro]
titles = {}
cur = None; book = 0
for l in idxl:
    s = l.strip()
    if s.startswith("I. COMIENZA"): book = 1
    elif s.startswith("II. LIBRO SEGUNDO"): book = 2
    m = re.match(r"(?:\[\d+\] )?Capítulo ([IVXL]+)\. (.*)", s)
    if m:
        cur = (book, m.group(1)); titles[cur] = m.group(2)
    elif cur and s and not s.isupper() and not re.match(r"^(I{1,3}|IV|V|VI{0,3}|IX|X)(\.\d)?\.? ", s) and not s.startswith(("Prólogo", "II.", "PRIMERA", "SEGUNDA")) and len(s) < 95 and not re.match(r"^[IVX]+\.\d", s):
        if re.match(r"^(Donde|Y |Que|En )", s) or not re.search(r"[.]$", titles[cur]) :
            titles[cur] += " " + s

def roman(s):
    v = {"I": 1, "V": 5, "X": 10, "L": 50}; t = 0
    for a, b in zip(s, s[1:] + " "):
        t += -v[a] if v.get(b, 0) > v[a] else v[a]
    return t

def norm(s):
    return re.sub(r"\W+", "", s.lower())

notes_re = None
def process(lines):
    """Page numbers out, footnotes paired with their markers, paragraphs rebuilt."""
    out = []
    notes = []
    i = 0
    while i < len(lines):
        s = lines[i].strip()
        if re.fullmatch(r"\d{1,3}", s):
            n = s
            hit = None
            for j in range(len(out) - 1, max(-1, len(out) - 90), -1):
                for m in re.finditer(r"(?<=\S) %s(?=[.,;:)»?!]|\s|$)(?!\d)" % n, out[j]):
                    pre = out[j][:m.start()].split(" ")[-1] if m.start() else ""
                    nxt = out[j][m.end():m.end() + 1]
                    if (pre[:1].isupper() and len(pre) <= 4 or pre[:1].isdigit()) and nxt == ",":
                        continue
                    if pre[:1].isupper() and len(pre) <= 4:
                        continue
                    hit = (j, m)
                if hit: break
            prevb = i > 0 and lines[i - 1].strip() != ""
            nxt_blank = i + 1 < len(lines) and lines[i + 1].strip() == ""
            if hit and (prevb or nxt_blank):
                j, m = hit
                k = len(notes) + 1
                out[j] = out[j][:m.start()] + "[^%d]" % k + out[j][m.end():]
                body = []
                i += 1
                while i < len(lines) and not lines[i].strip():
                    i += 1
                while i < len(lines) and lines[i].strip() and not re.fullmatch(r"\d{1,3}|[IVXL]{1,6}", lines[i].strip()):
                    body.append(lines[i].strip()); i += 1
                notes.append(join_lines(body))
                continue
            i += 1
            continue
        if not re.fullmatch(r"[IVXL]{1,6}", s):
            out.append(lines[i])
        i += 1
    return out, notes

def build(lines, heading_mode=True):
    out, notes = process(lines)
    paras = []; cur = []
    def flush():
        nonlocal cur
        if cur:
            paras.append(join_lines(cur)); cur = []
    for raw in out:
        s = raw.strip()
        s = re.sub(r"\s*\[\d{1,3}\]", "", s)
        if not s or s == "Λ":
            if not s: flush()
            continue
        if re.match(r"^(PRIMERA|SEGUNDA|TERCERA) PARTE\b", s) or re.match(r"^\[?FIN DE", s):
            flush(); continue
        if re.match(r"^[IVXL]+\. [A-ZÁÉÍÓÚ¿¡]", s) and len(s) < 110:
            flush(); cur = ["##HEAD " + s]
            continue
        if cur and cur[0].startswith("##HEAD ") and not re.search(r"[.?!:]$", cur[-1]) and s[:1].islower() and len(s) < 110:
            cur.append(s); continue
        if cur and cur[0].startswith("##HEAD "):
            flush()
        cur.append(s)
        if len(raw.strip()) < 86 and re.search(r"[.?!:»)\]]$", s):
            flush()
    flush()
    paras = [("## " + p[7:]) if p.startswith("##HEAD ") else p for p in paras]
    paras = merge_paragraphs(paras)
    return paras, notes

def finish(paras, notes):
    # keep only notes that are referenced
    for n in range(1, len(notes) + 1):
        if not notes[n - 1].strip():
            paras = [p.replace("[^%d]" % n, "") for p in paras]
    used = [n for n in range(1, len(notes) + 1) if notes[n - 1].strip() and any("[^%d]" % n in p for p in paras)]
    body = list(paras)
    defs = ["[^%d]: %s" % (n, notes[n - 1]) for n in used]
    return body + defs

chap = {}  # id -> (title, paras)
def chapters(lo, hi, bk):
    heads = []
    for i in range(lo, hi):
        m = re.match(r"(?:\[\d+\] )?Capítulo ([IVXL]+)\.", T[i].strip())
        if m: heads.append((i, roman(m.group(1)), m.group(1)))
    for k, (i, n, rn) in enumerate(heads):
        end = heads[k + 1][0] if k + 1 < len(heads) else hi
        full = re.sub(r" \d{1,3}$", "", titles[(bk, rn)]).split(" Conclusión de la segunda")[0].split(" EL CUAL")[0]
        target = norm(full)
        j = i; acc = ""
        # consume title lines
        while j < end:
            acc += norm(re.sub(r"^(\[\d+\] )?Capítulo [IVXL]+\.", "", T[j]))
            j += 1
            if len(acc) >= len(target) * 0.97: break
        body = T[j:end]
        paras, notes = build(body)
        chap["l%d-c%d" % (bk, n)] = ("Capítulo %d" % n, full, finish(paras, notes))

chapters(i_b1, i_b2, 1)
chapters(i_b2, i_end, 2)
# l2 prologue
p2 = idx(lambda l: l.strip() == "Prólogo", i_b2)
c1 = idx(lambda l: l.startswith("Capítulo I."), i_b2)
paras, notes = build(T[p2 + 1:c1])
chap["l2-prologo"] = ("Prólogo del libro segundo", None, finish(paras, notes))
# front matter
paras, notes = build(T[i_gal + 1:i_idx - 3])
paras[0] = paras[0][paras[0].index("Una de las cosas"):]
chap["prologo-galeato"] = ("Prólogo galeato", None, finish(paras, notes))
paras, notes = build(T[i_pro + 1:i_arg])
chap["prologo"] = ("Prólogo", None, finish(paras, notes))
paras, notes = build(T[i_arg + 1:i_b1 - 3])
chap["argumento"] = ("Argumento del primer libro", None, finish(paras, notes))

order = ["prologo-galeato", "prologo", "argumento"] + ["l1-c%d" % n for n in range(1, 30)] + ["l2-prologo"] + ["l2-c%d" % n for n in range(1, 24)]
if __name__ == "__main__":
    miss = [o for o in order if o not in chap]
    print("missing", miss)
    tot = 0
    for o in order:
        if o not in chap: continue
        t, sub, paras = chap[o]
        h1 = t + (". " + sub if sub else "")
        if len(h1) > 300: print("LONG", o)
        write_chapter(OUT / "es-ES" / (o + ".md"), h1, paras)
        tot += sum(len(p.split()) for p in paras)
    print("words", tot)
