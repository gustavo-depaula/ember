"""Split Gutenberg Baltimore Catechism No. 1 (#14551) / No. 3 (#14553) into chapter markdown.
usage: split_baltimore13.py 1|3 SRC OUTDIR   (writes OUTDIR/*.md and OUTDIR/../_toc{n}.json)"""
import re, sys, json
from pathlib import Path

num, src, out = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
lines = src.read_text(encoding="utf-8").splitlines()
s = next(i for i, l in enumerate(lines) if l.startswith("*** START"))
e = next(i for i, l in enumerate(lines) if l.startswith("*** END"))
text = "\n".join(lines[s + 1:e])
text = re.sub(r"\{(?:Transcriber's Note|T\.N\.).*?\}", "", text, flags=re.S)
text = re.sub(r"End of Project Gutenberg's.*", "", text)
lines = text.split("\n")

ORD = "FIRST SECOND THIRD FOURTH FIFTH SIXTH SEVENTH EIGHTH NINTH TENTH ELEVENTH TWELFTH THIRTEENTH FOURTEENTH FIFTEENTH SIXTEENTH SEVENTEENTH EIGHTEENTH NINETEENTH TWENTIETH".split()
def ordn(n):
    if n <= 20: return ORD[n-1]
    if n == 30: return "THIRTIETH"
    return {2: "TWENTY", 3: "THIRTY"}[n // 10] + "-" + ORD[n % 10 - 1]
SMALL = {"of", "and", "the", "on", "for", "to", "its", "from", "upon", "in", "at", "after", "before"}
def title(t):
    ws = t.lower().replace(".", "").split()
    return " ".join(w if (i and w in SMALL) else "-".join(p.capitalize() for p in w.split("-")) for i, w in enumerate(ws)).replace("'S", "'s")
def idx(pred, start=0):
    return next(i for i in range(start, len(lines)) if pred(lines[i]))
def paras(block):
    ps, cur = [], []
    for l in block:
        if l.strip() == "":
            if cur: ps.append(cur); cur = []
        else: cur.append(l)
    if cur: ps.append(cur)
    return ps

def para(p, hymn=False):
    t = p[0].strip()
    if len(p) == 1 and t == t.upper() and re.search(r"[A-Z]{3}", t) and not re.search(r"\d", t) and len(t) < 95:
        return "## " + title(t)
    if hymn and len(p) <= 2 and not re.search(r"[.,;:!?]$", t) and len(t) < 60 and not re.match(r"\d", t):
        h = "## " + t
        return h + (f"\n\n*{p[1].strip()}*" if len(p) == 2 else "")
    if all(re.match(r"^\s*(\(\d+\)|\d+[.)]|[a-z][.)]) ", l) or l.startswith("  ") or not i for i, l in enumerate(p)) and len(p) > 1 and any(re.match(r"^\s*\(\d+\)", l) for l in p):
        items = []
        for l in p:
            if re.match(r"^\s*\(\d+\) ", l) or not items: items.append(l.strip())
            else: items[-1] += " " + l.strip()
        return "\n".join(x + "  " for x in items).rstrip()
    if (len(p) > 1 and all(len(l) < 48 for l in p)) or hymn or any(l.startswith("  ") for l in p[1:]):
        return "\n".join(x.strip() + "  " for x in p).rstrip()
    return re.sub(r"(?<= )\*(?= )", r"\\*", " ".join(x.strip() for x in p))

def qa_blocks(block, hymn=False):
    """Q&A (both layouts) -> markdown."""
    if num == "1":
        qre = re.compile(r"^(\d+)\. Q\. ?(.*)$")
    else:
        qre = re.compile(r"^Q\. (\d+)\. (?:\{(\d+)\} )?(.*)$")
    outp, i = [], 0
    ps = paras(block)
    # re-split by Q lines so that an answer can span several paragraphs
    cur = None
    def flush():
        nonlocal cur
        if cur: outp.append(cur); cur = None
    for p in ps:
        m = qre.match(p[0])
        if m:
            flush()
            qn = m.group(1)
            extra = m.group(2) if num == "3" else None
            qtxt = m.group(3) if num == "3" else m.group(2)
            ai = next((k for k, l in enumerate(p) if l.startswith("A.")), None)
            if ai is None: raise SystemExit("no answer: " + p[0])
            q = " ".join(x.strip() for x in [qtxt] + p[1:ai])
            a = [l for l in p[ai:]]
            a[0] = a[0][2:].strip()
            tag = f" (No. 2: {extra})" if extra else ""
            cur = {"head": f"**{qn}.**{tag} {q}", "ans": [a]}
        elif cur is not None and not (len(p) == 1 and p[0].strip() == p[0].strip().upper() and re.search(r"[A-Z]{3}", p[0])):
            cur["ans"].append(p)
        else:
            flush(); outp.append(para(p, hymn))
    flush()
    res = []
    for o in outp:
        if isinstance(o, str): res.append(o); continue
        parts = []
        for k, a in enumerate(o["ans"]):
            if any(re.match(r"^\s*\(\d+\) ", l) for l in a):
                items = []
                for l in a:
                    if re.match(r"^\s*\(\d+\) ", l) or not items: items.append(l.strip())
                    else: items[-1] += " " + l.strip()
                parts.append("\n".join(f"*{x}*  " for x in items).rstrip())
            else:
                parts.append("*" + " ".join(x.strip() for x in a) + "*")
        res.append(o["head"] + "\n\n" + "\n\n".join(parts))
    return "\n\n".join(res)

chapters = []
if num == "1":
    c0 = idx(lambda l: l == "PRAYERS")
    cat = idx(lambda l: l == "CATECHISM", c0)
    marks = []
    pos = cat
    for n in range(1, 34):
        name = "NINTEENTH" if n == 19 else ordn(n)
        pos = idx(lambda l, name=name: l == f"LESSON {name}", pos); marks.append((n, pos)); pos += 1
    mp = idx(lambda l: l == "MORNING PRAYERS", marks[-1][1])
    pm = idx(lambda l: l == "PRAYERS FOR MASS", mp)
    rc = idx(lambda l: l == "THE RIGHT MANNER OF CONFESSING", pm)
    hy = idx(lambda l: l == "HYMNS", rc)
    chapters.append(("prayers", "Prayers", lines[c0 + 1:cat], False))
    for k, (n, i) in enumerate(marks):
        j = marks[k + 1][1] if k + 1 < len(marks) else mp
        chapters.append((f"lesson-{n:02d}", f"Lesson {n} — {title(lines[i+1].strip())}", lines[i + 2:j], False))
    chapters += [("morning-evening-prayers", "Morning and Evening Prayers", lines[mp + 1:pm], False),
                 ("prayers-for-mass", "Prayers for Mass", lines[pm + 1:rc], False),
                 ("confession-communion-devotions", "Confession, Communion, the Rosary and the Stations", lines[rc + 1:hy], False),
                 ("hymns", "Hymns", lines[hy + 1:], True)]
else:
    toc = {}
    for l in lines[:400]:
        m = re.match(r"^Lesson [A-Z-]+--(.*)$", l)
        if m: toc[len(toc) + 1] = m.group(1).strip()
    toc[23] = "On the Ends for which the Holy Eucharist was Instituted"
    toc[31] = "The First Commandment--On the Honor and Invocation of the Saints"
    toc[36] = "On the Third, Fourth, Fifth and Sixth Commandments of the Church"
    toc[37] = "On the Last Judgment and Resurrection, Hell, Purgatory and Heaven"
    pr = idx(lambda l: l == "PRAYERS")
    pr = idx(lambda l: l == "PRAYERS", pr + 1)
    c1 = idx(lambda l: l == "CATECHISM", pr)
    c2 = idx(lambda l: l == "CATECHISM.", c1)
    marks = []; pos = c2
    for n in range(1, 38):
        pos = idx(lambda l, n=n: l == f"LESSON {ordn(n)}.", pos); marks.append((n, pos)); pos += 1
    pre = idx(lambda l: l == "PREFACE TO NO. 3")
    note = idx(lambda l: l == "NOTE")
    contents = idx(lambda l: l == "CONTENTS", pre)
    chapters.append(("note", "Note on the Baltimore Series", lines[note + 1:pre], False))
    chapters.append(("preface", "Preface to No. 3", lines[pre + 1:contents], False))
    chapters.append(("prayers", "Prayers", lines[pr + 1:c1], False))
    chapters.append(("questions-on-the-prayers", "Questions on the Prayers", lines[c1 + 1:c2], False))
    chapters.append(("catechism", "What Is a Catechism?", lines[c2 + 1:marks[0][1]], False))
    for k, (n, i) in enumerate(marks):
        j = marks[k + 1][1] if k + 1 < len(marks) else len(lines)
        chapters.append((f"lesson-{n:02d}", f"Lesson {n} — {toc[n]}", lines[i + 2:j], False))

out.mkdir(parents=True, exist_ok=True)
meta = []
for cid, t, block, hy in chapters:
    body = qa_blocks(block, hy)
    (out / f"{cid}.md").write_text(f"# {t}\n\n{body}\n", encoding="utf-8")
    meta.append({"id": cid, "title": t})
(out.parent / f"_toc{num}.json").write_text(json.dumps(meta, indent=1))
print(len(meta), "chapters")
