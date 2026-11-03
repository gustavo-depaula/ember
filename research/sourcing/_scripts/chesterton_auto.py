#!/usr/bin/env python3 -I
"""Chesterton Gutenberg text -> corpus book, driven by a spec (see chesterton_specs/*.json).
usage: chesterton_auto.py plan SPEC.json   list detected chapters
       chesterton_auto.py build SPEC.json  write content/books/chesterton-opera-omnia/<slug>/
Spec: slug, id, name, name_pt, desc, desc_pt, year, pg (number) or src (path under research/sourcing/chesterton),
 url, edition {editor, year}, edition_note, head (regex on a heading block joined with ' / '), min_line, max_line,
 part (regex for part headings), title_sub [[regex, repl]...], title_case (bool, default title-case if all caps),
 skip_re, verse_min_indent (default 6), lead (title for text before the first heading), drop_heads (regexes),
 heading_lines (n lines of the heading block to drop from the body, default whole block)."""
import json, re, sys, shutil, unicodedata
from pathlib import Path
ROOT = Path("/Users/gustavo/Documents/prayer")
SRC = ROOT / "research/sourcing/chesterton"
spec = json.load(open(sys.argv[2]))
mode = sys.argv[1]
path = SRC / spec["src"] if spec.get("src") else SRC / f"pg2/{spec['pg']}.txt"
L = path.read_text(encoding="utf-8-sig", errors="replace").splitlines()
s = next((i for i, l in enumerate(L) if l.startswith("*** START")), -1) + 1
e = next((i for i, l in enumerate(L) if l.startswith("*** END")), len(L))
s = max(s, spec.get("min_line", 1) - 1); e = min(e, spec.get("max_line", e + 1) - 1) if spec.get("max_line") else e
_eg = [i for i in range(s, e) if re.match(r"End of (the )?Project Gutenberg", L[i].strip())]
if _eg: e = _eg[0]
_te = [i for i in range(s, e) if re.fullmatch(r"(@@ )?_?THE END\.?_?", L[i].strip(), re.I) and i > s + (e - s) // 2]
if _te and not spec.get("keep_tail"): e = _te[0]
SM = {"of","the","and","in","to","a","an","by","for","on","with","from","at","or","as","is","his","her","our","its","but","not","upon","into"}
def tcase(t):
    if t != t.upper(): return t
    ws = t.lower().split(" ")
    rom = {"i","ii","iii","iv","v","vi","vii","viii","ix","x","xi","xii","xiii","xiv","xv","xvi","xvii","xviii","xix","xx","xxi","xxii","xxiii","xxiv","xxv","xxvi","xxvii","xxviii","xxix","xxx","xxxi","xxxii","xxxiii","xxxiv","xxxv","xxxvi","xxxvii","xxxviii","xxxix","xl"}
    return " ".join(w.upper() if re.sub(r"[.:,]", "", w) in rom and len(ws) > 1 else (w if (i and w in SM and not ws[i-1].endswith((".", ":"))) else re.sub(r"^(\W*)(\w)", lambda m: m.group(1) + m.group(2).upper(), w)) for i, w in enumerate(ws))
def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode().lower()
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return "-".join(t.split("-")[:7])
head_re = re.compile(spec["head"], re.I)
part_re = re.compile(spec["part"], re.I) if spec.get("part") else None
drops = [re.compile(x, re.I) for x in spec.get("drop_heads", [])]
cands = []  # (start_line, end_line_of_block, text, is_part)
i = s; blank = 2
while i < e:
    if not L[i].strip(): blank += 1; i += 1; continue
    j = i
    while j < e and L[j].strip(): j += 1
    if blank >= spec.get("blank", 2) and j - i <= spec.get("maxlines", 3):
        t = " / ".join(x.strip() for x in L[i:j])
        if not any(d.search(t) for d in drops):
            if part_re and part_re.search(t): cands.append((i, j, t, True))
            elif head_re.search(t): cands.append((i, j, t, False))
    i = j; blank = 0
if spec.get("title_next"):
    nr = re.compile(spec["title_next"], re.I); out2 = []; skipto = -1
    for (a, b, t, ip) in cands:
        if a < skipto: continue
        if nr.fullmatch(t) and not ip:
            k = b
            while k < e and not L[k].strip(): k += 1
            m = k
            while m < e and L[m].strip(): m += 1
            nt = " ".join(x.strip() for x in L[k:m])
            if len(nt) < 80 and not nt.endswith((".", ",")) and m - k <= 2 and (nt.upper() == nt or spec.get("title_next_any")):
                out2.append((a, m, t + ". " + nt, False)); skipto = m; continue
            out2.append((a, b, t, False)); continue
        out2.append((a, b, t, ip))
    cands = out2
if spec.get("toc_from"):
    tl = []; k = spec["toc_from"] - 1; gap = 0
    while k < e:
        x = L[k].strip()
        if not x: gap += 1
        else:
            if gap >= 3 and len(tl) > 3: break
            gap = 0
            x = re.sub(r"\s+[\dvxiVXI]+$", "", x).strip()
            if x.upper() != "PAGE" and x.upper() != "CONTENTS": tl.append(x)
        k += 1
    spec_toc_end = k
    cands = []; pos = max(s, spec_toc_end)
    for x in tl:
        nx = re.sub(r"\s+", " ", x).lower()
        k = pos
        while k < e and not (re.sub(r"\s+", " ", L[k].strip()).lower() == nx and (k == 0 or not L[k-1].strip())): k += 1
        if k >= e: print("toc title not found:", x, file=sys.stderr); continue
        cands.append((k, k + 1, tcase(x) if x == x.upper() else x, x in spec.get("toc_parts", [])))
        pos = k + 1
if spec.get("items"):
    cands = []; pos = s
    for it in spec["items"]:
        rx = re.compile(it[0], re.I); k = pos
        while k < e and not rx.fullmatch(L[k].strip()): k += 1
        if k >= e: sys.exit("item not found: " + str(it))
        cands.append((k, k + 1 + (it[2] if len(it) > 2 else 0), it[1], bool(len(it) > 3 and it[3])))
        pos = k + 1
if spec.get("titles") or spec.get("part_titles"):
    ti = iter(spec.get("titles", [])); pi = iter(spec.get("part_titles", [])); c2 = []
    for (a, b, t, ip) in cands:
        nt = next(pi, None) if ip else next(ti, None)
        c2.append((a, b, nt or t, ip))
    cands = c2
_fixed = set(spec.get("titles", [])) | set(spec.get("part_titles", []))
if spec.get("single"): cands = [(s, s, spec["name"], False)]
def title_of(t):
    if t in _fixed: return t
    if spec.get("items") and t in [x[1] for x in spec["items"]]: return t
    t = re.sub(r"_", "", t)
    ts = spec.get("title_sub", [])
    ts = [ts[k:k + 2] for k in range(0, len(ts), 2)] if ts and isinstance(ts[0], str) else ts
    for a, b in ts: t = re.sub(a, b, t)
    t = re.sub(r"\s*/\s*", " ", t); t = re.sub(r"\s+", " ", t).strip()
    t = re.sub(r"[A-Z][A-Z' ]{6,}[A-Z]", lambda m: tcase(m.group()), t) if t != t.upper() else t
    t = t.replace("--", "—").strip(" .")
    if not spec.get("title_case", True): return t
    m = re.match(r"^([IVXLC]+\.)\s+(.*)$", t)
    if m: return m.group(1) + " " + tcase(m.group(2))
    return tcase(t)
def clean(t):
    t = t.replace("--", "—").replace("=", "")
    t = re.sub(r"_([^_]+)_", r"*\1*", t)
    t = re.sub(r"(?<!\w)_|_(?!\w)", "", t)
    return re.sub(r"\s+", " ", t).strip()
skip = re.compile(spec["skip_re"]) if spec.get("skip_re") else None
vmin = spec.get("verse_min_indent", 4)
def render(chunk):
    paras, cur = [], []
    for l in chunk + [""]:
        if skip and skip.search(l): continue
        if re.match(r"^\s*\[(Illustration|Pg|Page)[^\]]*\]\s*$", l): continue
        if l.strip() == "":
            if cur: paras.append(cur); cur = []
        else: cur.append(l)
    paras = [p for p in paras if not (re.match(r"\s*\[(Illustration|Sidenote)", p[0]) and p[-1].rstrip().endswith("]"))]
    res = []
    for p in paras:
        if len(p) == 1 and re.fullmatch(r"@@ \*[ *]*", p[0].strip()): res.append("* * *"); continue
        if len(p) == 1 and re.fullmatch(r"\s*(\*\s*){3,}|\s*-{5,}\s*|\s*_{5,}\s*", p[0]): res.append("* * *"); continue
        ind = [len(x) - len(x.lstrip()) for x in p]
        verse = (spec.get("verse", True) and len(p) >= 2 and all(i >= vmin for i in ind)
                 and sum(len(x.strip()) for x in p) / len(p) < 62 and max(ind) - min(ind) >= 0)
        if spec.get("poetry") and len(p) >= 2: verse = True
        if spec.get("auto_verse", True) and len(p) >= 2 and max(len(x.strip()) for x in p) <= 56 and not any(x.startswith("@@") for x in p): verse = True
        if spec.get("verse_all") and len(p) >= 2 and sum(len(x.strip()) for x in p) / len(p) < 58 and not spec.get("prose_wrapped", False): verse = True
        if verse: res.append("  \n".join(clean(x) for x in p))
        else: res.append(clean(" ".join(p)))
    return res
chapters = []; toc = []; part = None; n = 0
bounds = [c[0] for c in cands] + [e]
if spec.get("lead") and cands:
    chapters.append((slug(spec["lead"]), spec["lead"], s, cands[0][0], None))
for k, (a, b, t, ispart) in enumerate(cands):
    nxt = bounds[k + 1]
    if ispart:
        npart = globals().get("npart", 0) + 1
        part = {"id": f"part{npart:02d}-{slug(title_of(t))}", "title": title_of(t)}
        # a part heading directly before a chapter heading: no body
        continue
    n += 1
    ttl = title_of(t)
    if spec.get("no_part") and re.search(spec["no_part"], t): part = None
    cid = f"ch{n:02d}-{slug(re.sub(r'^[IVXLC0-9]+[.] ', '', ttl))}" if not spec.get("ids_plain") else slug(ttl)
    chapters.append((cid, ttl, b, nxt, part))
    part = part if not spec.get("part_once") else part
if mode == "plan":
    for c in chapters: print(c[0], "|", c[1], "|", c[2] + 1, c[3] + 1, ("[" + c[4]["title"] + "]") if c[4] else "")
    sys.exit()
dest = ROOT / "content/books/chesterton-opera-omnia" / spec["slug"]
out = dest / "en-US"
if out.exists() and dest.parent.name == "chesterton-opera-omnia": shutil.rmtree(out)
out.mkdir(parents=True, exist_ok=True)
tocs = []; total = 0; seen_parts = {}
for cid, ttl, a, b, prt in chapters:
    body = render(L[a:b])
    while body and re.fullmatch(r"(@@ )?THE END\.?|\* \* \*", body[-1]): body.pop()
    if spec.get("strip_tail"):
        while body and re.search(spec["strip_tail"], body[-1]): body.pop()
    bare = re.sub(r"^[IVXLC0-9]+[.] ", "", ttl).lower()
    while len(body) > 1 and (body[0].lower().rstrip(".") == bare or re.fullmatch(r"[IVXLC]+[.]?", body[0])): body.pop(0)
    text = f"# {ttl}\n\n" + "\n\n".join(body) + "\n"
    (out / f"{cid}.md").write_text(text, encoding="utf-8"); total += len(text.split())
    node = {"id": cid, "title": {"en-US": ttl}}
    if prt:
        if prt["id"] not in seen_parts:
            seen_parts[prt["id"]] = {"id": prt["id"], "title": {"en-US": prt["title"]}, "children": []}; tocs.append(seen_parts[prt["id"]])
        seen_parts[prt["id"]]["children"].append(node)
    else: tocs.append(node)
(dest / "sources/en-US-originals").mkdir(parents=True, exist_ok=True)
(dest / "sources/en-US-originals" / f"{spec['slug']}.txt").write_text("\n".join(L[s:e]) + "\n", encoding="utf-8")
book = {"id": spec["id"], "cover": "classic",
 "name": {"en-US": spec["name"], "pt-BR": spec["name_pt"]},
 "author": {"en-US": "G. K. Chesterton", "pt-BR": "G. K. Chesterton"},
 "description": {"en-US": spec["desc"], "pt-BR": spec["desc_pt"]},
 "composed": str(spec["year"]), "languages": ["en-US"], "work": "chesterton/" + spec["slug"],
 "editions": {"en-US": spec["edition"]},
 "sources": [{"language": "en-US", "url": spec["url"], "edition": spec["edition_note"],
   "description": spec.get("source_desc", "Chapter divisions as printed; Gutenberg front and back matter dropped, line wraps joined, underscored italics converted, double hyphens set as em dashes. Raw text in sources/en-US-originals/."),
   "tier": "A", "tierEvidence": spec.get("tier_ev", f"Public domain: Chesterton died in 1936 (more than 70 years ago, so public domain in Brazil, the UK and the EU) and the book was published in {spec['year']} (public domain in the US).")}],
 "toc": tocs}
(dest / "book.json").write_text(json.dumps(book, indent=2, ensure_ascii=False) + "\n")
print(spec["slug"], total, "words", len(chapters), "chapters")
