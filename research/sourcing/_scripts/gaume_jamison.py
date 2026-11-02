"""Jamison's translation of Gaume's Petit catéchisme de persévérance (archive.org catechismperserv00gaumuoft)."""
import re, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
import cat_ocr

src = Path("research/sourcing/catechisms/catechismperserv00gaumuoft.txt")
out = Path("content/books/gaume-catechism-of-perseverance-jamison/en-US")
out.mkdir(parents=True, exist_ok=True)
text = src.read_text()
ps = cat_ocr.paragraphs(text, glue=True)
RUN = re.compile(r"^(\S{1,5} )?(COURSE|INTRODUCTION|CATECHISM OF PERSEV)\b.{0,30}$", re.I)
def fix(t):
    t = t.replace("—", " — ")
    t = re.sub(r"\s+", " ", t)
    t = re.sub(r" ([?;:!,])", r"\1", t)
    t = re.sub(r"(?<=[a-z]) \.(?= |$)", ".", t)
    return t
ps = [(n, fix(t)) for n, t in ps if not (len(t) < 45 and RUN.match(t))]
CH = re.compile(r"^CHAP\w*\.? ([IVXLCYTUlLi1'\u2018]{1,10})[\.,]?\s*(.*)$")
starts = {"c1": 1636, "c2": 6520, "c3": 12260, "c4": 16795}
def course(n): return 4 if n >= 16795 else 3 if n >= 12260 else 2 if n >= 6520 else 1 if n >= 1636 else 0
intro_a = 793
prayer_a = 1588
Q = re.compile(r"^(Q|Question)\s*[\.,:;\-]\s*(.*)$")
A = re.compile(r"^(A|Answer)\s*[\.,:;]\s*(.*)$")

def qa(paras):
    res, k, state = [], 0, None
    for _, t in paras:
        m = Q.match(t)
        if m:
            k += 1; res.append(f"**{k}.** {m.group(2)}"); state = "q"; continue
        m = A.match(t)
        if m and state == "q":
            res.append("*" + m.group(2) + "*"); state = "a"; continue
        if state in ("a", "ac") and not re.match(r"^[IVX]+\.", t):
            res.append("*" + t + "*"); state = "ac"; continue
        res.append(t); state = None
    return "\n\n".join(res)

chapters = []  # (id, title, paras)
chapters.append(("introduction", "Introduction", [(n, t) for n, t in ps if intro_a <= n < prayer_a]))
chapters.append(("prayer-before-and-after-catechism", "Prayer before and after Catechism", [(n, t) for n, t in ps if prayer_a < n < 1636]))
i = 0
body = [(n, t) for n, t in ps if n >= 1636]
idxs = [k for k, (n, t) in enumerate(body) if CH.match(t) and len(t) < 160]
cnt = {}
for a, b in zip(idxs, idxs[1:] + [len(body)]):
    n0 = body[a][0]; c = course(n0)
    cnt[c] = cnt.get(c, 0) + 1
    seg = body[a + 1:b]
    title = CH.match(body[a][1]).group(2).strip(" .,")
    if not title and seg and not Q.match(seg[0][1]) and len(seg[0][1]) < 120:
        title = seg[0][1].strip(" .,"); seg = seg[1:]
    cid = f"course-{c}-chapter-{cnt[c]:02d}"
    t = f"Course {c}, Chapter {cnt[c]}" + (f": {title}" if title else "")
    chapters.append((cid, t, seg))
for cid, t, seg in chapters:
    (out / f"{cid}.md").write_text(f"# {t}\n\n{qa(seg)}\n", encoding="utf-8")
json.dump([c[0] for c in chapters], open("research/sourcing/catechisms/_gaume_order.json", "w"))
print(len(chapters), cnt)
