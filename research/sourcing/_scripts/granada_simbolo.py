import sys, re
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cuervo import *
KW = ("OBRAS DE", "INTRODUCCI", "PARTE ", "VARIANTES", "SÍMBOLO", "SIMBOLO")
ROM = lambda n: ["", "I", "II", "III", "IV", "V"][n]
# (vol, part, lo for chapters, [front specs (id,label,start,end)])
CFG = {1: (5, 1004, [("p1-dedicatoria", "Dedicatoria", 389, 520), ("p1-lector", "Al cristiano lector", 669, 1004), ("p1-argumento", "Argumento de la primera parte", 1004, "FIRST")]),
       2: (6, 212, [("p2-preambulo", "Preámbulo", 225, "FIRST")]),
       3: (7, 251, [("p3-prologo", "Prólogo", 287, 669), ("p3-tratado1", "Tratado primero: de las conveniencias del misterio", 669, "FIRST")]),
       4: (8, 188, [("p4-lector", "Al cristiano lector", 188, 416), ("p4-intro", "Cuarta parte: del misterio de nuestra redención", 416, "FIRST")])}
def heads_of(L, lo, hi):
    out = []; T = 1; last = 0; lastd = 0
    for i in range(lo, hi):
        s = re.sub(r"\s+", " ", L[i]).strip()
        m = re.match(r"^TRATADO (II|SEGUNDO|III|TERCERO)\.?$", s)
        if m:
            T = 3 if m.group(1) in ("III", "TERCERO") else 2; last = 0; lastd = 0
            out.append(("T", i, T, 0)); continue
        m = re.match(r"^C\S{1,3}P\S{0,3}TULO\s+(\S{1,8})\.?$", s)
        if m:
            v = 1 if m.group(1).upper() in ("PRIMERO", "PRLMERO") else roman_val(m.group(1))
            if v is None or v < last + 1 or v > last + 3: v = last + 1
            out.append(("C", i, T, v)); last = v; continue
        m = re.match(r"^DI[AÁ]LOGO (\S{1,5})\.?$", s)
        if m and is_upper(s):
            v = roman_val(m.group(1))
            if v is None or v < lastd + 1 or v > lastd + 2: v = lastd + 1
            out.append(("D", i, T, v)); lastd = v
    return out

def part(P):
    v, lo, front = CFG[P]
    L = vol(v)
    end = len(L)
    for i in range(lo + 800, len(L)):
        if re.match(r"^\s*(FIN DESTA|VARIANTES DE LAS|TABLA DE|CAP.TULOS DE LA|FIN DE LA TABLA)", L[i]) or re.match(r"^\s*TABLA\s*$", L[i]):
            end = i; break
    hs = heads_of(L, lo, end)
    multi = len({h[2] for h in hs}) > 1
    first = [h for h in hs if h[0] != "T"][0][1]
    out = []
    for cid, lab, st, en in front:
        lg = []
        paras = clean(L[st + 1:first - 8 if en == "FIRST" else en], run_kw=KW, log=lg)
        out.append((cid, lab, paras))
    real = [h for h in hs]
    for k, (kind, h, T, n) in enumerate(real):
        nxt = real[k + 1][1] if k + 1 < len(real) else end
        pre = "p%d-t%d-" % (P, T) if multi else "p%d-" % P
        if kind == "T":
            t, i = title_of(L, h)
            paras = clean(L[i:nxt], run_kw=KW)
            out.append((pre + "intro", "Tratado %s%s" % (ROM(T), (": " + t[:1].lower() + t[1:]) if t else ""), paras)); continue
        if kind == "C":
            t = title_above(L, h)
            paras = clean(L[h + 1:nxt], run_kw=KW)
            out.append((pre + "c%d" % n, "%sCapítulo %d%s" % ("Parte %s, " % ROM(P) if not multi else "Parte %s, tratado %s, c" % (ROM(P), ROM(T)) if False else "", n, (". " + t[:1].upper() + t[1:]) if t else ""), paras))
        else:
            t, i = title_of(L, h)
            paras = clean(L[i:nxt], run_kw=KW)
            out.append((pre + "d%d" % n, "Diálogo %s%s" % (ROM2(n), (". " + t[:1].upper() + t[1:]) if t else ""), paras))
    out = [(c, t, p) for c, t, p in out if sum(len(x.split()) for x in p) > 12]
    return out
ROM2 = lambda n: ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][n]
secs = {P: part(P) for P in (1, 2, 3, 4)}
if __name__ == "__main__":
    for P in (1, 2, 3, 4):
        print("PART", P, len(secs[P]), sum(sum(len(x.split()) for x in p) for _, _, p in secs[P]))
        for c, t, p in secs[P][:6] + secs[P][-2:]:
            print("  ", c, sum(len(x.split()) for x in p), t[:90], "|", p[0][:50] if p else None)
        print("  ", [c for c, _, _ in secs[P]])
