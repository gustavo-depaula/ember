"""Letters of Sala Balust's critical Epistolario (BAC 1952, vol. I) that the Apostolado Epistolario book lacks."""
import re, sys, json, unicodedata
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *
from avila_bac_letters import S, upper_ratio

R = Path("/Users/gustavo/Documents/prayer")
OUT = R / "content/books/john-of-avila-opera-omnia/epistolario-sala-balust"
SRC = re.compile(r"^\((?:[^)]{0,200}?)(Ms\.|Mí\.|lis\.|Ecl\.|Kd\.|ed\. 1|Ed\. 1|Ed\.|ff?\. \d|Xf\.|Orig|Arch\.|Bibl\.|Apóg|Copia|Madrid|Roma|Sevilla|Granada|Escorial)", re.I)
HEADRE = re.compile(r"^(\S{1,5})(?: \[(\d)\])? ((?:A|AL|AA|PARA|AUN|DE|A-|A\.L|EL|[ÁA]L|AÑO)\b ?\S.*)$")
def num(t):
    t = t.replace("g", "9").replace("X", "1").replace("S", "5").replace("£", "6").replace("O", "0").replace("l", "1").replace("I", "1").replace("f}", "6").replace("(J", "6").replace("J", "")
    d = re.sub(r"\D", "", t)
    return int(d) if d else None
def starts():
    out = {}
    for i in range(18990, 72500):
        if SRC.match(S[i]) and not re.match(r"^\((A\. H\.|Cf\.|Véase|\d)", S[i]):
            h, j = [], i - 1
            while j > i - 8 and len(h) < 4:
                if S[j]:
                    if upper_ratio(S[j]) > 0.5 or (re.search(r"[\]\*]$", S[j]) and upper_ratio(S[j]) > 0.3): h.insert(0, (j, S[j]))
                    else: break
                j -= 1
            if h: out[h[0][0]] = (i, " ".join(x[1] for x in h))
    # broad header candidates the source-line search missed
    for i in range(18990, 72500):
        m = HEADRE.match(S[i])
        if m and upper_ratio(S[i]) > 0.5 and len(S[i]) > 10 and not any(abs(i - k) < 14 for k in out) and m.group(1) not in ("PARTE",):
            out[i] = (i, S[i])
    return sorted((k, v[0], v[1]) for k, v in out.items())

def numbered():
    st = starts()
    res, prev = [], 0
    for k, (h, s, t) in enumerate(st):
        m = re.match(r"^(\S{1,6})(?: \[(\d)\])? ", t)
        n = num(m.group(1)) if m and m.group(1) not in ("A", "AL", "EPISTOLARIO.", "CARTA") else None
        sub = m.group(2) if m else None
        # a numbered header carries its own number (sub-letters 20 [1] keep it); otherwise guess the next
        if n and (n >= prev and n <= prev + 12):
            pass
        elif n is None:
            nxt = next((num(re.match(r"^(\S{1,6})", x[2]).group(1)) for x in st[k + 1:] if re.match(r"^\d", x[2])), None)
            n = prev + 1 if (nxt is None or nxt > prev + 1) else None
        else:
            n = None
        if n is not None:
            res.append((n, sub, h, s, t))
            prev = max(prev, n)
    return res

REFLINE = re.compile(r"^\d{1,3}\s+(?:Cf\.\s+|OÍ\.\s+)?(?:[1-4]\s)?[A-ZÍÓ'][A-Za-zíéÍ'.]{1,7}\.?\s*[\dIl]{1,3}\s*[,.:]")
EL = re.compile(r"^(CARTA \d+|EPISTOLARIO\.? .*PARTE.*|\d{1,4}|Págs\.?|[\d ]{1,8})$")
def body(h, s, e):
    """Text lines of one letter, without the header, source line, apparatus and notes."""
    lines = S[s + 1:e]
    blocks = blocks_of(lines)
    out = []
    first = True
    for b in blocks:
        bl = [x for x in b if not EL.match(x) and not REFLINE.match(x) and not re.match(r"^\d{1,4}\s?[:;.]?$", x)]
        if not bl: continue
        txt = " ".join(bl)
        if first and re.match(r"^[(<\[]", bl[0]) and len(txt) < 260:
            continue
        if first:
            first = False
            out.append(("sum", join_lines(bl))); continue
        # apparatus: variant readings and sigla
        if "||" in txt or re.search(r"\]\s.*\b(T|Esc\.|B|C|G|Ed\.)\b\s*(\||$)", txt) or re.match(r"^[A-Z] - .* = ", txt):
            continue
        if re.match(r"^\d+(?:-\d+)? ", txt) and ("]" in txt or " om." in txt):
            continue
        # scripture/line references: "444 Le. 12, 4."
        if all(re.match(r"^\d{1,3}\s+(Cf\.\s)?(\d\s)?[A-ZÍ][a-zíé]{1,5}\.?\s*\d", x) for x in bl): continue
        # editor's footnotes
        if re.match(r"^[*°º]\s", bl[0]) or re.match(r"^\d{1,2}\s[A-Z]\.\s", bl[0]) and len(txt) < 1200 and False: continue
        if re.match(r"^[*°º•]", bl[0]): continue
        cl = [re.sub(r"^\d{1,3}\s+(?=\S)", "", x) if (re.match(r"^\d{1,3}\s", x) and int(x.split()[0]) % 5 == 0) else x for x in bl]
        out.append(("p", join_lines(cl)))
    return out


def stems(text, n=140):
    t = unicodedata.normalize("NFD", text.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    w = re.findall(r"[a-z]{4,}", t)[:n]
    return set(x[:4] for x in w)

def apostolado():
    d = {}
    for f in sorted((R / "content/books/john-of-avila-opera-omnia/epistolario/es-ES").glob("l*.md")):
        txt = f.read_text(encoding="utf-8")
        d[f.stem] = stems(" ".join(txt.split("\n\n")[2:]))
    return d

def index_titles():
    t = " ".join(S[395:1500])
    t = re.sub(r"\s+", " ", t)
    out = {}
    for m in re.finditer(r"(?<![\d.])(\d{1,3})\. ((?:A|Al|Para|De|\[)[^0-9]{3,170}?)\s*[.·•…\s]*(\d{3,4})\s", t):
        n = int(m.group(1))
        if n not in out and n <= 253: out[n] = m.group(2).strip(" .")
    return out

import avila_tratados as t
SUBS = {None: "", "1": "a", "2": "b", "3": "c", "4": "d"}
def build_all(threshold=0.33):
    r = numbered(); ap = apostolado(); it = index_titles()
    chapters, dups = [], []
    for k, (n, sub, h, s, tt) in enumerate(r):
        e = r[k + 1][2] if k + 1 < len(r) else h + 400
        parts = body(h, s, e)
        paras = [x for kd, x in parts if kd == "p"]
        summ = next((x for kd, x in parts if kd == "sum"), "")
        st = stems(" ".join(paras))
        best = max((len(st & a) / max(1, len(st | a)) for a in ap.values()), default=0)
        if best >= threshold:
            dups.append(n); continue
        paras = [re.sub(r"[*•]+", "", p).strip() for p in paras]
        paras = merge_paragraphs([p for p in paras if p])
        title = re.sub(r"^\d+\s+", "", it.get(n, "")) or None
        if not title or sub:
            hh = re.sub(r"^\S{1,6}(?: \[\d\])? ", "", tt).strip(" *[]")
            title = t.sentence(hh)
        title = re.sub(r"\\s*\\.?\\s*\\d{3,4}\\s*$", "", title)
        lab = "Carta %d%s" % (n, " [%s]" % sub if sub else "")
        body_ = (["*" + summ.strip() + "*"] if summ else []) + paras
        chapters.append(("l%03d%s" % (n, SUBS.get(sub, sub or "")), "%s. %s" % (lab, title), body_))
    return chapters, dups

if __name__ == "__main__":
    ch, dups = build_all()
    print(len(ch), "new;", len(dups), "already in the Apostolado book")
    seen = set()
    for cid, title, bd in ch:
        if cid in seen: print("DUP", cid); continue
        seen.add(cid)
        write_chapter(OUT / "es-ES" / (cid + ".md"), title, bd)
    print(sum(words(p) for p in (OUT / "es-ES").glob("*.md")))
