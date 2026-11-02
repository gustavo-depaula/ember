"""Clean archive.org OCR of the Library of Fathers (LF 22) / Tourscher pages into markdown paragraphs.

usage: python3.13 -I aug_en_clean.py <txt> <startline> <endline> <mode: lf|tour>  > out.md
Rough: unwrap lines, drop running heads, marginal references and footnotes where recognisable.
"""
import re, sys

path, a, b, mode = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
lines = open(path, encoding="utf-8", errors="replace").read().split("\n")[a - 1:b]
lines = [re.sub(r"\s+", " ", l).strip() for l in lines]

def head(l):
    if not l or len(l.split()) > 14:
        return False
    if re.match(r"^\d{1,3}\s+\S", l) and not re.match(r"^\d{1,3}\.\s", l):
        return True
    if re.search(r"\s\d{1,3}$", l) and l.isupper() is False and len(l.split()) <= 8 and re.search(r"[A-Za-z]{3}", l) and mode == "tour":
        return True
    return False

SPK = re.compile(r"^(A[uvp]?[uvg]?[cg]?[Gg]?\.?|Au[cg]|Ad|AD|AUG|Aug|Avuc|AuGc|Ap|Av)\s?[.—\-–]+\s")
paras, cur = [], []
def flush():
    global cur
    if cur:
        paras.append(" ".join(cur)); cur = []
for i, l in enumerate(lines):
    prev_blank = i == 0 or not lines[i - 1]
    if not l:
        if mode == "lf":
            continue
        continue
    if prev_blank and head(l):
        continue
    if mode == "tour" and SPK.match(l):
        flush()
    if mode == "lf" and re.match(r"^(?:[ivx]+\.\s+)?\d{1,2}\.\s+[A-Z]", l):
        flush()
        l = re.sub(r"^[ivx]+\.\s+", "", l)
    cur.append(l)
flush()
out = []
for p in paras:
    p = re.sub(r"(\w)- (\w)", r"\1\2", p) if mode == "lf" else re.sub(r"(\w)- (\w)", r"\1\2", p)
    p = re.sub(r"\s+", " ", p).strip()
    if p:
        out.append(p)
print("\n\n".join(out))
