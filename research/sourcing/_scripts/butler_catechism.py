"""Butler's Catechism, Irish four-archbishops edition with Milner's Scriptural Catechism (archive.org mostrev00butl)."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr
src = Path("research/sourcing/catechisms/mostrev00butl.txt")
out = Path("content/books/butler-catechism/en-US")
out.mkdir(parents=True, exist_ok=True)
ps = cat_ocr.paragraphs(src.read_text(), glue=True)
ps = [(n, re.sub(r" ([?;:!,])", r"\1", t)) for n, t in ps]
Q = re.compile(r"^(Q|Question)\s*[\.,:;\-]?\s+(.*)$"); A = re.compile(r"^(A|Answer)\s*[\.,:;]\s*(.*)$")
LES = re.compile(r"^LESSON ([IVXLT]+)\.?(?:\s+(.*))?$")
def qa(paras):
    res, k, st = [], 0, None
    for _, t in paras:
        m = Q.match(t)
        if m: k += 1; res.append(f"**{k}.** {m.group(2)}"); st = "q"; continue
        m = A.match(t)
        if m and st in ("q", "a"): res.append("*" + m.group(2) + "*"); st = "a"; continue
        if st in ("a", "ac") and not t.isupper(): res.append("*" + t + "*"); st = "ac"; continue
        res.append(t); st = None
    return "\n\n".join(res)
sc = next(n for n, t in ps if n > 3000 and t.upper().startswith("SCRIPTURAL CATECHISM"))
ap = next(n for n, t in ps if n > 3500 and t.startswith("APPENDIX"))
idx = [k for k, (n, t) in enumerate(ps) if LES.match(t) and n > 300 and n < sc]
chapters = []
for c, (a, b) in enumerate(zip(idx, idx[1:] + [None]), 1):
    end_n = sc if b is None else ps[b][0]
    seg = [x for x in ps[a + 1:] if x[0] < end_n]
    title = (LES.match(ps[a][1]).group(2) or "").strip(" .")
    if not title and seg and not Q.match(seg[0][1]) and len(seg[0][1]) < 100: title = seg[0][1].strip(" ."); seg = seg[1:]
    chapters.append((f"lesson-{c:02d}", f"Lesson {c}" + (f": {title}" if title else ""), seg))
chapters.append(("scriptural-catechism", "The Scriptural Catechism, by Bishop Milner", [x for x in ps if sc < x[0] < ap]))
tab = next((n for n, t in ps if n > ap and t.startswith("LESSON TABLETS")), 10**9)
chapters.append(("appendix", "Appendix", [x for x in ps if ap < x[0] < tab]))
order = []
for cid, title, seg in chapters:
    (out / f"{cid}.md").write_text(f"# {title}\n\n{qa(seg)}\n", encoding="utf-8"); order.append(cid)
json.dump(order, open("research/sourcing/catechisms/_butler_order.json", "w"))
print(len(order))
