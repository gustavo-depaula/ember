"""Cleaning helpers for Cuervo's Obras de Fr. Luis de Granada (archive.org OCR, 14 vols)."""
import re, sys, collections, glob
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *
IA = Path("/Users/gustavo/Documents/prayer/research/sourcing/louis-of-granada/ia")

def vol(n):
    return [re.sub(r"[ \t]+", " ", l).rstrip() for l in (IA / ("obrascue%02dluisuoft.txt" % n)).read_text(encoding="utf-8").split("\n")]

_uni = None; _bi = None
def vocab():
    global _uni, _bi
    if _uni is None:
        _uni = collections.Counter(); _bi = collections.Counter()
        for f in sorted(glob.glob(str(IA / "obrascue*luisuoft.txt"))):
            toks = re.findall(r"[a-záéíóúñüA-ZÁÉÍÓÚÑ]+", Path(f).read_text(encoding="utf-8").lower())
            _uni.update(toks); _bi.update(zip(toks, toks[1:]))
    return _uni, _bi

def is_upper(s):
    L = [c for c in s if c.isalpha()]
    return len(L) >= 3 and sum(c.isupper() for c in L) / len(L) > 0.8

def find(lines, rx, lo=0, hi=None):
    r = re.compile(rx)
    return [i for i in range(lo, hi or len(lines)) if r.search(lines[i])]

SMALL = {"de", "la", "el", "los", "las", "y", "en", "del", "que", "á", "a", "se", "con", "por", "para", "su", "sus", "al", "o", "un", "una", "es", "lo", "como", "no", "sobre"}
PROPER = {"dios", "cristo", "jesucristo", "jesús", "señor", "espíritu", "santo", "iglesia", "san", "santa", "sant", "virgen", "maría", "david", "adán", "evangelio", "pasión", "símbolo", "fe", "nuestra", "nuestro", "salvador", "juan", "pablo", "pedro", "moisés", "egipto", "sacramento", "eucaristía"}

def title_of(lines, h, maxn=5, skip_heading=True):
    """Collect the uppercase lines after heading line h -> (title, next_index)."""
    i = h + 1; parts = []
    while i < len(lines) and len(parts) < maxn:
        s = lines[i].strip()
        if not s:
            i += 1
            if parts and (i >= len(lines) or not lines[i].strip()): break
            continue
        if is_upper(s) and len(s) < 120:
            parts.append(s); i += 1
        else:
            break
    t = " ".join(parts).lower()
    t = re.sub(r"\s+", " ", t)
    words = t.split(" ")
    out = []
    for k, w in enumerate(words):
        out.append(w.capitalize() if (k == 0 or w.strip(",.;:") in PROPER) else w)
    return " ".join(out).strip(" ."), i

JUNK = re.compile(r"[\^\\%?|{}~\[\]<>*_=]")
ALPHA = "abcdefghilmnopqrstuvyzáéíóú"
def edits1(w):
    sp = [(w[:i], w[i:]) for i in range(len(w) + 1)]
    return {a + c + b[1:] for a, b in sp if b for c in ALPHA} | {a + b[1:] for a, b in sp if b} | {a + c + b for a, b in sp for c in ALPHA}

GEN = [(r"^[Iil]{1,2}cho\b", "Dicho"), (r"^Y\'l ", "El "), (r"^[Il]cho\b", "Dicho")]
def fix_dropcap(par, log=None):
    toks = par.split(" ")
    while toks and (JUNK.search(toks[0]) or not re.search(r"[A-Za-zÁÉÍÓÚáéíóúñ]", toks[0])):
        toks.pop(0)
    if not toks: return par
    uni, bi = vocab()
    def bare(t): return re.sub(r"[^\wáéíóúñü]", "", t.lower()).replace("0", "o")
    # an all-caps token among the first three is the small-caps rest of the initial word
    for k in range(min(3, len(toks))):
        t = re.sub(r"[^\wÁÉÍÓÚÑ]", "", toks[k])
        if len(t) >= 2 and t.isupper() and k <= 2:
            toks = toks[k:]; caps = True; break
    else:
        caps = False
    w = bare(toks[0]); nxt = bare(toks[1]) if len(toks) > 1 else ""
    cands = set()
    if not caps: cands.add(w)
    for c in ALPHA: cands.add(c + w)
    if len(w) <= 2 and not caps:
        for c in ALPHA:
            cands.add(c + w[1:]); cands.add(c + w[-1:])
    if len(w) > 6 and not caps: cands = {w}
    def score(c):
        return bi.get((c, nxt), 0) * 1000 + uni.get(c, 0) - (0 if c == w else 5)
    best = max(cands, key=score)
    if score(best) <= 0: best = w
    post = re.match(r"^[\wÁÉÍÓÚáéíóúñü]*(.*)$", toks[0]).group(1)
    first = best[:1].upper() + best[1:] + post
    rest = toks[1:]
    # one-edit repairs of unknown words in the first dozen tokens
    for k in range(min(10, len(rest))):
        m = re.match(r"^([¿¡(«]*)([A-Za-záéíóúñ]+)(.*)$", rest[k])
        if not m: continue
        pre, wd, po = m.groups(); lw = wd.lower()
        if uni.get(lw, 0) >= 3 or len(lw) < 3: continue
        alts = [e for e in edits1(lw) if uni.get(e, 0) >= 30]
        if alts:
            nb = max(alts, key=lambda e: uni[e] + 1000 * (bi.get((e, bare(rest[k + 1])), 0) if k + 1 < len(rest) else 0))
            rest[k] = pre + (nb.capitalize() if wd[:1].isupper() else nb) + po
    if log is not None and best != w: log.append((w, best))
    out = " ".join([first] + rest)
    for rx, rep in GEN:
        out = re.sub(rx, rep, out, count=1)
    return out

NOTE_START = re.compile(r"^[(<\[]\s*(\d{1,2}|[iIl1]{1,2}|[a-z*])\s*[)\]]\s+\S")
MARK = re.compile(r"\(\s*(?:\d{1,2}|[iIl1]{1,2})\s*\)")

def clean(lines, run_kw=(), dropcap=True, log=None, notes_ok=True):
    """lines: raw body lines of one chapter/section (heading already removed). -> paragraphs list."""
    kept = []
    for l in lines:
        s = l.strip()
        if not s:
            kept.append(""); continue
        if re.fullmatch(r"[\d\s.,;:*\-—|IlO]{1,8}", s) and not re.search(r"[A-Za-z]", s.replace("I", "").replace("l", "").replace("O", "")):
            continue
        up = re.sub(r"[\d.,;:*|]", "", s)
        if is_upper(up) and len(s) < 90:
            if re.match(r"^(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA) PARTE\b[^\d]*$", s) and not any(k in s.upper() for k in ("TRATADO", "LIBRO DE")):
                kept.append("##" + s.capitalize()); continue
            if re.match(r"^§ ?[IVXL]+\.?$", s):
                kept.append("##" + s); continue
            if any(k in s.upper() for k in run_kw) or re.search(r"\d", s) or re.match(r"^(TRATADO|LIBRO|PARTE|CAP|FIN|OBRAS|VARIANTES|COMIENZA|MEMORIAL|ADICIONES|INTRODUCCI)", s):
                continue
        kept.append(s)
    blocks = []
    cur = []
    for s in kept:
        if s: cur.append(s)
        elif cur: blocks.append(cur); cur = []
    if cur: blocks.append(cur)
    blocks = [[("\n##" + t[2:] + "\n") if t.startswith("##") else t for t in b] for b in blocks]
    paras = [re.sub(r"\s*OBRAS DE [A-Z.]{4,8}\s+[IVX]+\s*[—\-]\s*[\dIl ]{1,6}", "", join_lines(b)) for b in blocks]
    if dropcap and paras:
        # junk at line starts of the first paragraph
        first = blocks[0]
        paras[0] = join_lines([(" ".join(t for t in ln.split(" ") if not (JUNK.search(t)))) if k < 4 else ln for k, ln in enumerate(first)])
        paras[0] = fix_dropcap(paras[0], log)
    # footnotes
    notes, body = [], []
    for p in paras:
        if notes_ok and NOTE_START.match(p) and len(p) < 700 and body:
            notes.append(re.sub(r"^[(<\[]\s*[\w*]{1,2}\s*[)\]]\s+", "", p))
        else:
            body.append(p)
    body = merge_paragraphs(body)
    if notes:
        txt = "\n\u0001".join(body)
        k = 0
        def rep(m):
            nonlocal k
            if k < len(notes):
                k += 1; return "[^%d]" % k
            return ""
        txt = re.sub(r"\s+(?=\(\s*(?:\d{1,2}|[iIl1]{1,2})\s*\))", "", txt)
        txt = MARK.sub(rep, txt)
        body = txt.split("\n\u0001")
        while k < len(notes):
            k += 1; body[-1] += "[^%d]" % k
        body += ["[^%d]: %s" % (i + 1, n) for i, n in enumerate(notes)]
    return body

def write_sections(outdir, lang, secs):
    """secs: list of (id, title, paras). Returns total words."""
    tot = 0
    for cid, title, paras in secs:
        write_chapter(Path(outdir) / lang / (cid + ".md"), title, paras)
        tot += sum(len(p.split()) for p in paras)
    return tot

def build(L, specs, run_kw, log=None):
    """specs: list of (id, label, start, end) ; end None = next start. label None -> title from the uppercase lines."""
    out = []
    for k, (cid, label, start, end) in enumerate(specs):
        if end is None:
            end = specs[k + 1][2] if k + 1 < len(specs) else len(L)
        t, i = title_of(L, start)
        if label is None:
            title = t[:1].upper() + t[1:]
        else:
            title = label + (". " + t[:1].upper() + t[1:] if t and len(t) < 160 else "")
        if label is not None and len(t) >= 160:
            i = start + 1
        lg = []
        paras = clean(L[i:end], run_kw=run_kw, log=lg)
        if log is not None: log.extend((cid, a, b) for a, b in lg)
        out.append((cid, title, paras))
    return out

def report(secs):
    for cid, title, paras in secs:
        n = sum(len(p.split()) for p in paras)
        print("%-24s %6d  %s" % (cid, n, title[:70]))


ROMAN_OK = r"[IVXLCDMilvx1]{1,8}|PRIMER[OA]|PRLMER[OA]|[ÚU]LTIMO|ÚNICO|UNICO"
def auto(L, lo, hi, bumps=None):
    """Specs from strict heading lines in [lo,hi). Returns (specs, treatises) ; treatises: {n: subtitle}."""
    head = re.compile(r"^(TRATADO|C\S{1,3}P\S{0,3}TULO|CAP1TULO|PR[OÓ]LOGO|PROLOGO)(?:\s+(%s))?\.?$" % ROMAN_OK)
    specs = []; T = 1; k = 0; subs = {}; tcount = collections.Counter()
    for i in range(lo, hi):
        s = re.sub(r"\s+", " ", L[i]).strip()
        m = head.match(s)
        if not m: continue
        _l = [c for c in s if c.isalpha()]
        if sum(c.isupper() for c in _l) / max(1, len(_l)) < 0.7 and not s.startswith("CAP"): continue
        if m.group(1).startswith("C") and not re.search(r"TULO", m.group(1)): continue
        kind, num = m.group(1), m.group(2)
        if kind == "TRATADO":
            rm = {"I": 1, "V": 5, "X": 10}
            r = (num or "I").upper().replace("L", "I").replace("1", "I"); v = 0
            for a_, b_ in zip(r, r[1:] + " "):
                v += -rm.get(a_, 1) if rm.get(b_, 0) > rm.get(a_, 1) else rm.get(a_, 1)
            T = v; k = 0
            subs[T] = title_of(L, i)[0]
            specs.append(("t%d-portada" % T, None, i, None, "treatise")); continue
        if bumps and i in bumps:
            T = bumps[i]; k = 0
        if kind.startswith("PR"):
            specs.append(("t%d-prologo" % max(T, 1), "Prólogo", i, None, "prologo")); continue
        k += 1
        specs.append(("t%d-c%d" % (max(T, 1), k), "Capítulo %s" % (lambda n: "I" if n == "1" else n.upper() if re.fullmatch(r"[IVXLCDMilvx1]{1,8}", n) else n.capitalize())((num or "").replace("Ultimo", "último")), i, None, "cap"))
    return specs, subs


def assemble(L, front, lo, hi, tail, KW, label="Tratado", bumps=None):
    """front/tail: explicit specs (id,label,start,end). Returns secs (non-empty) and group list [(gid,gtitle,[ids])]."""
    specs, subs = auto(L, lo, hi, bumps)
    allspecs = list(front)
    allspecs += [(a, b, c, d) for a, b, c, d, _ in specs]
    allspecs += list(tail)
    allspecs.sort(key=lambda x: x[2])
    fixed = []
    for k, (cid, lab, st, en) in enumerate(allspecs):
        if en is None:
            en = allspecs[k + 1][2] if k + 1 < len(allspecs) else len(L)
        fixed.append((cid, lab, st, en))
    log = []
    secs = build(L, fixed, KW, log)
    secs = [(c, t, p) for c, t, p in secs if sum(len(x.split()) for x in p) > 15]
    # title cleanup: prefix treatise
    out = []
    for c, t, p in secs:
        m = re.match(r"t(\d+)-", c)
        if m:
            n = int(m.group(1))
            t = "%s %s, %s" % (label, ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] if n <= 10 else n, t[:1].lower() + t[1:]) if c.endswith("portada") is False else "%s %s" % (label, n)
            t = t[:1].upper() + t[1:]
        out.append((c, t, p))
    return out, subs, log

def roman_val(s):
    t = s.upper().replace("L", "I").replace("!", "I").replace("|", "I").replace("1", "I").replace("H", "II").replace("U", "II").replace("Ü", "II")
    t = t.replace("Í", "I").replace("0", "O")
    if not re.fullmatch(r"[IVXC]+", t): 
        if re.fullmatch(r"[IVXLC]+", s.upper()): t = s.upper()
        else: return None
    rm = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100}
    v = 0
    for a, b in zip(t, t[1:] + " "):
        v += -rm[a] if rm.get(b, 0) > rm[a] else rm[a]
    return v

def title_above(L, h, maxn=6):
    i = h - 1; parts = []
    while i > 0 and not L[i].strip(): i -= 1
    while i > 0 and len(parts) < maxn:
        s = re.sub(r"\s+", " ", L[i]).strip()
        if s and is_upper(s) and len(s) < 100 and not re.search(r"\d", s) and not re.match(r"^(PARTE|OBRAS|INTRODUCCI)", s):
            parts.append(s); i -= 1
            continue
        if not s: 
            i -= 1
            if not parts: continue
            break
        break
    t = " ".join(reversed(parts)).lower()
    words = t.split(" ")
    t = " ".join(w.capitalize() if (k == 0 or w.strip(",.;:") in PROPER) else w for k, w in enumerate(words))
    return t.strip(" .")

def chapter_heads(L, lo, hi, rx=r"^C\S{1,3}P\S{0,3}TULO\s+(\S{1,8})\.?$"):
    """[(line, number)] with monotone repair."""
    out = []; last = 0
    for i in range(lo, hi):
        s = re.sub(r"\s+", " ", L[i]).strip()
        m = re.match(rx, s)
        if not m: continue
        v = roman_val(m.group(1)) if m.group(1).upper() not in ("PRIMERO", "PRLMERO") else 1
        if v is None or v < last + 1 or v > last + 3: v = last + 1
        out.append((i, v)); last = v
    return out
