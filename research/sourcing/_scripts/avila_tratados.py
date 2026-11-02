"""Sermones (Tercera parte de las Obras, 1596): Apostolado Mariano vol. III-IV (Sacramento, Espíritu Santo, Virgen)."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/sermones"
SRC = R / "research/sourcing/john-of-avila/ia-tomo2"
HEAD = re.compile(r"^\W{0,2}[TFP]?RATADO\s*(\d+)")
RUN = re.compile(r"^\s*(DEL SANTÍSIM\w* SACRAMENTO|DEL ESPÍRITU SANTO|DE NUESTRA SE[ÑN]ORA|TRAT[.,]\s*\d.*|EPÍSTOLA.*|ÍNDICE)\s*$")
KEEP = {"dios", "cristo", "jesús", "jesucristo", "maría", "corpus", "espíritu", "virgen", "señor", "santísimo", "sacramento", "juan", "josé", "pedro", "pablo", "ana", "joaquín", "eucaristía", "san", "santa", "santos", "ángel", "cristiano", "cristianos", "nieves", "navidad", "adán", "eva", "israel", "jerusalén", "jacob", "egipto", "moisés", "abrahán", "isaac", "elías", "santísima", "pasión", "cruz", "iglesia", "espíritu"}

def sentence(t):
    t = re.sub(r"\s*\((?:\d+|I|ID|D|1D|II|III|11)\)\.?\s*$", "", t.strip()).strip(" .")
    t = re.sub(r"\s+", " ", t)
    words_ = t.lower().split(" ")
    out = []
    for i, w in enumerate(words_):
        b = re.sub(r"\W", "", w)
        out.append(w[:1].upper() + w[1:] if (i == 0 or b in KEEP) else w)
    s = " ".join(out)
    s = re.sub(r"(?i)\bespíritu santo\b", "Espíritu Santo", s)
    s = re.sub(r"(?i)\bnuestra señora\b", "Nuestra Señora", s)
    s = re.sub(r"(?i)\bla santísima virgen maría\b", "la Santísima Virgen María", s)
    s = re.sub(r"\bSan Jos[oO]é\b", "San José", s)
    return s

def clean_blocks(lines):
    """Blocks of cleaned text lines; footnotes glued to a paragraph are split off."""
    out = []
    cur = []
    def flush():
        nonlocal cur
        if cur: out.append(cur)
        cur = []
    for ln in lines:
        s = ln.strip()
        if not s:
            flush(); continue
        if re.fullmatch(r"\d{1,4}", s) or RUN.match(s):
            continue
        if re.match(r"^\(\d{1,3}\)\s+\S", s) and cur and not re.match(r"^\(\d{1,3}\)\s", cur[0]):
            flush()
        cur.append(s)
    flush()
    return out

def chapter(num, rawtitle, blocks):
    notes, paras = {}, []
    order = []
    for b in blocks:
        t = join_lines(b)
        m = re.match(r"^\((\d{1,3})\)\s+(.*)$", t)
        if m:
            # several footnotes can share a block
            parts = re.split(r"\s(?=\(\d{1,3}\)\s+[A-ZÁÉÍÓÚ¿¡])", t)
            for p in parts:
                mm = re.match(r"^\((\d{1,3})\)\s+(.*)$", p)
                if mm:
                    notes.setdefault(int(mm.group(1)), []).append(mm.group(2)); order.append(int(mm.group(1)))
            continue
        paras.append(t)
    return paras, notes

def finish(paras, notes, titlemark):
    out = []
    for p in paras:
        m = re.match(r"^([0-9iIlL]{1,3})\.\s?[—–.-]+\s?([^.?!]{3,100}[.?!])\s*(.*)$", p)
        if m:
            h = m.group(2).rstrip(".")
            out.append("## 0. " + (sentence(h) if h.isupper() else h))
            if m.group(3): out.append(m.group(3))
        elif re.fullmatch(r"(Primera|Segunda) parte\.?", p):
            out.append("## " + p.strip("."))
        elif re.fullmatch(r"\([^()]{3,80}\)\.?", p):
            out.append("*" + p.strip("(). ") + ".*")
        else:
            out.append(p)
    k = 0
    for i, p in enumerate(out):
        if p.startswith("## 0. "):
            k += 1
            out[i] = "## %d. %s" % (k, p[6:])
    # merge page-split paragraphs (not headings)
    merged = []
    for p in out:
        if merged and not p.startswith(("#", "*")) and not merged[-1].startswith(("#", "*")) and not END.search(merged[-1]):
            prev = merged[-1]
            merged[-1] = (prev[:-1] + p) if prev.endswith("-") and re.match(r"[a-zñáéíóú]", p) else prev + " " + p
        else:
            merged.append(p)
    # footnote markers
    defs, queue = [], {k: list(v) for k, v in notes.items()}
    def sub(m):
        n = int(m.group(1))
        if queue.get(n):
            defs.append(queue[n].pop(0))
            return "[^%d]" % len(defs)
        return m.group(0)
    merged = [re.sub(r"\((\d{1,3})\)", sub, p) for p in merged]
    leftover = [t for k in sorted(queue) for t in queue[k]]
    for t in leftover:
        defs.append(t)
        # unreferenced note: attach to the first paragraph
        for i, p in enumerate(merged):
            if not p.startswith(("#", "*")):
                merged[i] = p + "[^%d]" % len(defs); break
    merged = [re.sub(r"\s+(\[\^\d+\])", r"\1", p) for p in merged]
    return merged + ["[^%d]: %s" % (i + 1, d) for i, d in enumerate(defs)]

def tratados(fname, lo, hi, minpos=0):
    L = (SRC / fname).read_text(encoding="utf-8").split("\n")[lo:hi]
    heads = [i for i, l in enumerate(L) if HEAD.match(l)]
    res = []
    for k, i in enumerate(heads):
        end = heads[k + 1] if k + 1 < len(heads) else len(L)
        res.append((int(HEAD.match(L[i]).group(1)), L[i + 1:end]))
    return res

TITLEFIX = {"remfdio": "remedio", "¡ acordaos": "¡Acordaos", "Iglesia,": "Iglesia", "comunión,": "comunión", "A comunión, prenda": "La comunión, prenda", "ruenas": "buenas", "Eva": "Eva", "La eucaristía": "La Eucaristía"}

def split_title(blocks):
    """The first block holds the uppercase title, then maybe a parenthetical note and epigraph lines."""
    first = blocks[0]
    tl, rest = [], []
    for j, ln in enumerate(first):
        letters = [c for c in ln if c.isalpha()]
        upper = sum(c.isupper() for c in letters) > 0.6 * len(letters) if letters else False
        if j < 3 and upper and not rest and not ln.startswith(("(", "“", "¿")) :
            tl.append(ln)
            if ln.rstrip().endswith("."): 
                rest = first[j + 1:]; break
        else:
            rest = first[j:]; break
    else:
        rest = []
    return " ".join(tl), ([rest] if rest else []) + blocks[1:]

def build(fname, lo, hi):
    L = (SRC / fname).read_text(encoding="utf-8").split("\n")[lo:hi]
    heads = [i for i, l in enumerate(L) if HEAD.match(l)]
    chs = []
    for k, i in enumerate(heads):
        end = heads[k + 1] if k + 1 < len(heads) else len(L)
        blocks = clean_blocks(L[i + 1:end])
        title, blocks = split_title(blocks)
        # "Segunda parte" repeats the number of the previous tratado
        if chs and int(HEAD.match(L[i]).group(1)) == chs[-1][3] and title.upper().startswith(("SEGUNDA", "A LOS")) or (chs and not title and blocks and blocks[0][0].startswith("Segunda parte")):
            chs[-1][2].extend(blocks); continue
        chs.append([None, title, blocks, int(HEAD.match(L[i]).group(1))])
    return chs

TITLES = {"virgen-03": "Natividad de la Santísima Virgen María (I)", "virgen-06": "Natividad de la Santísima Virgen María (II)",
          "virgen-08": "Soledad de la Santísima Virgen María", "virgen-10": "Asunción de la Santísima Virgen María (I)",
          "virgen-11": "Asunción de la Santísima Virgen María (II)", "virgen-12": "Natividad de la Santísima Virgen María (III)",
          "virgen-13": "Anunciación de la Virgen María (II)"}

def render(chs, prefix, label, numbered=False):
    out = {}
    for n, (_, title, blocks, on) in enumerate(chs, 1):
        n = on if numbered else n
        mark = re.search(r"\((\d{1,3})\)\.?\s*$", title)
        t = sentence(title)
        for a_, b_ in TITLEFIX.items(): t = t.replace(a_, b_)
        paras, notes = chapter(n, title, blocks)
        paras = finish(paras, notes, None)
        cid = "%s-%02d" % (prefix, n)
        out[cid] = ("%s %d. %s" % (label, n, TITLES.get(cid, t)), paras)
    return out

if __name__ == "__main__":
    allc = {}
    allc.update(render(build("Obras_de_San_Juan_de__vila__Tomo_3_.txt", 160, 29278), "sacramento", "Santísimo Sacramento"))
    allc.update(render(build("Obras_de_San_Juan_de__vila__Tomo_4_.txt", 45, 4160), "espiritu", "Espíritu Santo", True))
    allc.update(render(build("Obras_de_San_Juan_de__vila__Tomo_4_.txt", 4160, 17030), "virgen", "Virgen", True))
    allc.pop("sacramento-01")  # the Tratado del amor de Dios is its own book
    for cid, (t, paras) in allc.items():
        write_chapter(OUT / "es-ES" / (cid + ".md"), t, paras)
        print(cid, t, sum(len(p.split()) for p in paras))
