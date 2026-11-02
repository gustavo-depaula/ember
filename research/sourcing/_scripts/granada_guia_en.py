"""Guía de pecadores: McKenna's English (1883), from the TAN reprint scan."""
import re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import *
R = Path("/Users/gustavo/Documents/prayer")
L = (R / "research/sourcing/louis-of-granada/ia/sinnersguide0000vene.txt").read_text(encoding="utf-8").split("\n")
OUT = R / "content/books/louis-of-granada-opera-omnia/guia-de-pecadores-mckenna-en"

# titles from contents
toc = {}
cur = None
for l in L[236:470]:
    s = l.strip()
    m = re.fullmatch(r"CHAPTER (\d+)", s)
    if m: cur = int(m.group(1)); toc[cur] = ""; continue
    if cur and s and not re.match(r"^(Section|Page)", s) and not re.search(r"\.{3,}", s) or (cur and re.search(r"[A-Za-z]{3}.*\.{2,}\s*\S{1,4}$", s) and not s.startswith("Section")):
        t = re.sub(r"[\s.:;_,\-]*\.{2,}.*$", "", s)
        t = re.sub(r"\s+\S{1,4}$", "", t) if re.search(r"\.{2,}", s) else t
        toc[cur] = (toc[cur] + " " + t).strip()
start = next(i for i in range(1000, len(L)) if L[i].strip() == "CHAPTER 1")
stop = [i for i in range(start, len(L)) if "(Lk. 9:23)" in L[i]][-1] + 8
body = L[start:stop]
nb = []
k = 0
while k < len(body):
    l = body[k]
    if re.fullmatch(r"SECTION [IVXL]+\s*", l):
        nb += ["", "##H Section " + l.strip().split()[1] + ". " + re.sub(r"^\W+", "", body[k + 1].strip()), ""]; k += 2; continue
    if re.fullmatch(r"#\w{0,5}\s*", l):
        k += 1; continue
    nb.append(l); k += 1
body = nb
head_re = re.compile(r"^(\d{1,3}\s+The Sinner.s Guide|The Sinner.s Guide\s+\d{1,3}|[A-Z][A-Za-z:’' ,\-]{5,50} \d{1,3}|\d{1,3}|[|«¢ ]*)\s*$")
heads = []
for i, l in enumerate(body):
    m = re.fullmatch(r"\W{0,3}CHAPTER (\d+)\W{0,3}\s*", l)
    if m: heads.append((i, int(m.group(1))))
print([n for _, n in heads] == list(range(1, 49)), len(heads))
chap = {}
for k, (i, n) in enumerate(heads):
    end = heads[k + 1][0] if k + 1 < len(heads) else len(body)
    lines = [l for l in body[i + 1:end] if not (l.strip() and head_re.match(l) and not re.match(r"^SECTION", l)) or not l.strip()]
    bl = blocks_of(lines)
    paras = [join_lines(b) for b in bl]
    # drop title (first 1-3 lines equal to toc)
    out = []
    j = 0
    # section headings: "SECTION I" followed by title as own block
    for p in paras:
        out.append(p)
    # first block is the chapter's title
    title = re.sub(r"^\W+", "", out[0])
    out = out[1:]
    res = []
    skip = False
    for idx2, p in enumerate(out):
        if p.startswith("##H "):
            res.append("## " + p[4:]); continue
        res.append(p)
    res = merge_paragraphs([p for p in res])
    chap[n] = (title, res)
if __name__ == "__main__":
    tot = 0
    for n in range(1, 49):
        t, res = chap[n]
        # section: heading "## SECTION I" then next para is its title -> merge
        fin = []
        i = 0
        while i < len(res):
            if res[i].startswith("## Section") and i + 1 < len(res) and len(res[i + 1]) < 110 and not res[i+1].endswith("."):
                fin.append(res[i] + ". " + res[i + 1]); i += 2
            else:
                fin.append(res[i]); i += 1
        write_chapter(OUT / "en-US" / ("c%d.md" % n), "Chapter %d. %s" % (n, t), fin)
        tot += sum(len(p.split()) for p in fin)
    print("words", tot)
    print({n: chap[n][0] for n in (1, 2, 6, 34, 48)})
