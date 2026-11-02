"""Audi, filia (1556, Avisos y reglas cristianas): es from Sala Balust's edition (Juan Flors, 1963); editor's introduction and apparatus omitted."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/audi-filia-1556"
L = (R / "research/sourcing/john-of-avila/avisosyreglascri00avil.txt").read_text(encoding="utf-8").split("\n")
S = [re.sub(r"\s+", " ", l).strip() for l in L]
# (id, title, first line, last line exclusive) in the OCR
UNITS = [("dedicatoria", "Al muy ilustre señor don Luis Puerto Carrero, conde de Palma", 5435, 5476),
         ("al-lector", "Luis Gutiérrez, librero, al devoto lector", 5478, 5551),
         ("breve-regla", "Breve regla de vida cristiana", 5556, 5812),
         ("p1-mundo", "I. Audi, filia: el lenguaje del mundo y la honra vana", 5838, 6009),
         ("p1-carne", "I. Audi, filia: el lenguaje de la carne", 6009, 6691),
         ("p1-demonio", "I. Audi, filia: el lenguaje del demonio", 6691, 7831),
         ("p1-oir-a-dios", "I. Audi, filia: a quién debemos oír", 7831, 8122),
         ("p2-conocimiento", "II. Et vide: del propio conocimiento", 8122, 9757),
         ("p2-poco-conocimiento", "II. Et vide: del poco conocimiento de sí mismo y del verdadero de Jesucristo", 9757, 10819),
         ("p2-projimos", "II. Et vide: con qué ojos hemos de mirar los prójimos", 10819, 11103),
         ("p3-revelaciones", "III. Et inclina aurem tuam: de las malas revelaciones del demonio", 11103, 11811),
         ("p3-discrecion", "III. Et inclina aurem tuam: avisos de discreción de espíritus", 11811, 12023),
         ("p3-director", "III. Et inclina aurem tuam: la soberbia, causa de engaños; el director espiritual", 12023, 12489),
         ("p3-orejas-de-dios", "III. Et inclina aurem tuam: cómo ninguna criatura inclina su oreja a Dios con la diligencia con que Él la inclina a sus criaturas", 12489, 13165),
         ("p3-mirada-de-dios", "III. Et inclina aurem tuam: la mirada de Dios sobre nosotros", 13165, 13564),
         ("p4-pueblo", "IV. Et obliviscere populum tuum", 13564, 14133),
         ("p5-casa", "V. Et domum patris tui", 14133, 14284),
         ("p6-hermosura", "VI. Et concupiscet Rex decorem tuum", 14284, 15746)]
FURN = re.compile(r"^(\d{1,3}\s*)?(\d{1,3}\.\s?—\s?)?(Avisos y reglas cristianas|[IVX]+\.\s(Audi,? filia|Et vide|Et inclina aurem tuam|Et obliviscere populum tuum|Et domum patris tui|Et concupiscet Rex decorem tuum)\.?(\s[ABC])?\.?|Breve regla de vida cristiana)\s*(\d{1,3})?$|^\d{1,3}$|^\.\d$|^[\W\d]{1,4}$|^V\.?$")
expected = 1
notes_all = {}
MARK = re.compile(r"\s?\(\^\)|[A-Z]?['’]?\^+['’%.]?|(?<=[a-z,.;:])['’]\^")
def unit(lo, hi, heading_title):
    global expected
    lines = S[lo:hi]
    blocks = blocks_of(lines)
    paras, notes, nums = [], [], [0]
    for b in blocks:
        bl = [x for x in b if not FURN.match(x)]
        if not bl: continue
        # footnote block: lines starting with the expected note number
        if re.match(r"^\d{1,3}\s+[A-ZÁ¿\"“«\[]", bl[0]) and 1 <= int(bl[0].split()[0]) <= 420 and sum(len(x) for x in bl) < 600:
            for x in bl:
                m = re.match(r"^(\d{1,3})\s+(.*)$", x)
                if m and (not notes or int(m.group(1)) > nums[-1]):
                    notes.append(m.group(2)); nums.append(int(m.group(1)))
                elif notes:
                    notes[-1] += " " + x
            continue
        paras.append(join_lines(bl))
    out = []
    for p in paras:
        p = re.sub(r"f\.\s?\d+\s?[rv]\b", "", p)
        p = re.sub(r"(?<=\w)/\s?(?=\w)", "", p).replace("/", "")
        m = re.match(r"^\[(.+)\]$", p)
        mk = len(MARK.findall(p))
        out.append((p, mk))
    return out, notes

import avila_tratados as t

def clean(p):
    m = re.search(r"\b([A-ZÁÉÍÓÚ])[-—~]\s?\^+\s", p)
    if m:
        p = p[:m.start()] + p[m.end():]
        if p[:1].islower(): p = m.group(1) + p
    p = MARK.sub("", p)
    p = re.sub(r"\s+([,.;:!?)»])", r"\1", p)
    p = re.sub(r"(?<=[a-záéíóúñ])- [VvXx]\s(?=[a-záéíóúñ])", "", p)
    p = re.sub(r"(?<=[a-záéíóúñ])- (?=[a-záéíóúñ])", "", p)
    p = re.sub(r"\s+", " ", p).strip()
    return p

def render(ps, notes):
    out = []
    raw = []
    for p, _ in ps:
        # a blank line also falls after a drop cap or at a page break: join when the sentence is unfinished and the next piece continues it
        if raw and not re.search(r"[.!?:\]]\W*$", raw[-1]) and re.match(r"^([a-záéíóúñ(]|[A-ZÁÉ][-—~]\s?\^)", p):
            raw[-1] = (raw[-1][:-1] + p) if raw[-1].endswith("-") else raw[-1] + " " + p
        else:
            raw.append(p)
    for p in raw:
        p = clean(p)
        if not p: continue
        letters = [c for c in p if c.isalpha()]
        if p.startswith("[") and p.rstrip("*. ").endswith("]") and len(p) < 260:
            h = re.sub(r"^(\d+\.|[A-Za-z]\)|\[\d*\.?\]|[ivx]+\.)\s*", "", t.sentence(p.strip("[]* ")), flags=re.I)
            h = re.sub(r"^\d+\.?\]\s*", "", h).strip(" '’")
            out.append("## " + h[:1].upper() + h[1:]); continue
        if letters and len(p) < 260 and sum(c.isupper() for c in letters) > 0.8 * len(letters):
            out.append("## " + t.sentence(p.strip("[]*. "))); continue
        out.append(re.sub(r",$", ".", p))
    merged = out
    # a heading or a stray bracketed fragment directly before another heading adds nothing
    if notes:
        merged += ["## Citas del editor", "\n".join("- " + re.sub(r"\s+", " ", n).strip() for n in notes)]
    return merged

chapters = []
for cid, title, lo, hi in UNITS:
    ps, notes = unit(lo, hi, title)
    chapters.append((cid, title, ps, notes))

if __name__ == "__main__":
    tot = 0
    for cid, title, ps, notes in chapters:
        paras = render(ps, notes)
        write_chapter(OUT / "es-ES" / (cid + ".md"), title, paras)
        tot += sum(len(x.split()) for x in paras)
    print(tot)
