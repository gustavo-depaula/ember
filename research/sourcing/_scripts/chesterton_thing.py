#!/usr/bin/env python3 -I
"""Clean the Dodd Mead 1930 OCR of The Thing into chapter files. usage: chesterton_thing.py ocr.txt outdir"""
import re, sys, json, difflib, collections
from pathlib import Path
src, out = sys.argv[1], Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
lines = Path(src).read_text(encoding="utf-8", errors="replace").splitlines()
titles = ["The Sceptic as a Critic","Is Humanism a Religion?","The Drift from Domesticity","Logic—and Lawn Tennis","Obstinate Orthodoxy","The Usual Article","Why I Am a Catholic","What Do They Think?","The Mask of the Agnostic","The Early Bird in History","Protestantism: A Problem Novel","A Simple Thought","The Call to the Barbarians","On the Novel with a Purpose","The Revolt Against Ideas","The Feasts and the Ascetic","Who Are the Conspirators?","The Hat and the Halo","On Two Allegories","The Protestant Superstitions","On Courage and Independence","The Nordic Hindoo","A Spiritualist Looks Back","The Roots of Sanity","Some of Our Errors","The Slavery of the Mind","Inge versus Barnes","What We Think About","The Optimist as a Suicide","The Outline of the Fall","The Idols of Scotland","If They Had Believed","Peace and the Papacy","The Spirit of Christmas"]
def norm(s): return re.sub(r"[^A-Z]", "", s.upper())
# heading positions
pos = [(45, "Introduction")]
INTRO_END = 172
i = 312
for t in titles:
    best = None
    for j in range(i, len(lines)):
        l = lines[j].strip()
        if len(l) < 5 or re.search(r"\d", l): continue
        if difflib.SequenceMatcher(None, norm(l), norm(t)).ratio() >= 0.9 and l.upper() == l or norm(l) == norm(t):
            best = j; break
    if best is None: sys.exit("no heading: " + t)
    pos.append((best, t)); i = best + 1
pos.append((len(lines), None))
# end of last chapter: stop at publisher's ads / end; find 'THE END' or last page
def is_runhead(l):
    l = l.strip()
    if not l or len(l) > 62: return False
    if re.fullmatch(r"[\dIVXLlOo.,]{1,6}", l): return True       # bare page number
    up = sum(c.isupper() for c in l); al = sum(c.isalpha() for c in l)
    if re.match(r"^\d{1,3}\s+\S", l) or re.search(r"\s\S{1,5}$", l) and re.search(r"\d", l):
        return al == 0 or up / al > 0.5 or "THE" in l.upper() or True
    if re.search(r"(THE|DHE|PHE)[,:]?\s*(THING|TRING|TAING|THA|DEING)", l.upper()): return True
    return False
vers = collections.Counter()
chaps = []
for (a, t), (b, _) in zip(pos, pos[1:]):
    chunk = lines[a + 1:(INTRO_END if t == "Introduction" else b)]
    paras, cur = [], []
    for l in chunk + [""]:
        if l.strip() == "":
            if cur: paras.append(cur); cur = []
        else: cur.append(l.rstrip())
    keep = []
    for p in paras:
        if len(p) == 1 and is_runhead(p[0]): continue
        if len(p) == 1 and re.fullmatch(r"(CHAPTER|PAGE|CONTENTS)\s*", p[0]): continue
        keep.append(p)
    chaps.append((t, keep))
# hyphen statistics over the entire body
alltext = " ".join(" ".join(" ".join(p) for p in k) for _, k in chaps)
mid = collections.Counter(m.group(0).lower() for m in re.finditer(r"[A-Za-z]+-[A-Za-z]+", alltext))
solid = collections.Counter(w.lower() for w in re.findall(r"[A-Za-z]+", alltext))
def join_hyph(text):
    def f(m):
        a, b = m.group(1), m.group(2)
        comp = (a + "-" + b).lower(); sol = (a + b).lower()
        return a + "-" + b if mid[comp] > solid[sol] else a + b
    return re.sub(r"([A-Za-z]+)-\s+([a-z]+)", f, text)
res = {}
for t, keep in chaps:
    ps = []
    for p in keep:
        txt = " ".join(l.strip() for l in p)
        txt = re.sub(r"\s+", " ", txt).strip()
        txt = txt.replace("--", "—")
        ps.append(txt)
    ps = ["sense." if x == "™, sense." else x for x in ps]
    # re-join paragraphs broken by a page head
    merged = []
    for t2 in ps:
        if merged and not re.search(r"[.!?:;”\"’)—]$", merged[-1]) and re.match(r"[a-z]", t2):
            merged[-1] += " " + t2
        else: merged.append(t2)
    final = []
    for x in merged:
        x = join_hyph(x)
        x = re.sub(r"(?<=[a-z]) (\d{2,3}) (?=[a-z])", " ", x)
        x = re.sub(r"\s*[_|~\\@]+\.?(?=\s|[A-Za-z])\s*", " ", x)
        for a, b in [("wWhat", "What"), ("weEapINc", "leading"), ("St. Joan oF Arc", "St. Joan of Arc"), ("I caME", "I came"), ("I caNNoT", "I cannot"), (" EARLY BERD OTN, HES TORY gI", "")]:
            x = x.replace(a, b)
        x = x.replace(" go THE *EHiMsG", "").replace("1 doubt", "I doubt")
        x = re.sub(r"\bIr\b", "It", x)
        x = re.sub(r"[Mm]ediz(val)", lambda m: ("Medi" if m.group(0)[0] == "M" else "medi") + "æval", x)
        final.append(x)
    res[t] = final
res["The Spirit of Christmas"] = [x for x in res["The Spirit of Christmas"] if "GAYLORD" not in x and "PRINTEOINU" not in x]
res["The Call to the Barbarians"] = [x for x in res["The Call to the Barbarians"] if x != "Iio"]
json.dump({k: v for k, v in res.items()}, open(out.parent / "thing_clean.json", "w"), ensure_ascii=False, indent=0)
print({k: sum(len(x.split()) for x in v) for k, v in res.items()})
