"""Builds content/books/sertillanges-opera-omnia/vie-intellectuelle/fr-FR/*.md from
archive.org's DjVu XML of the 1921 first edition (lavieintellectue00sert).

  python3.13 scripts/parse-sertillanges-vie-intellectuelle.py <djvu.xml> <out dir>

The output was then corrected by hand against the page images; rerunning it overwrites that.

The XML keeps the printed paragraphs. A page opens with its running head ("18 LA VIE
INTELLECTUELLE", "LA VOCATION INTELLECTUELLE 17") and ends with its footnotes ("(1) …");
a paragraph cut by a page break is rejoined when the next page opens in lowercase.
OCR misreadings are left for the hand pass against the scan."""
import os, re, sys
import xml.etree.ElementTree as ET

xmlPath, out = sys.argv[1], sys.argv[2]
pages = ET.parse(xmlPath).getroot().findall(".//OBJECT")
# A hyphen ending a line joins the word, except before a pronoun or particle (gagnerez-vous).
keep = {"vous", "nous", "il", "elle", "ils", "elles", "on", "je", "tu", "moi", "toi", "lui", "leur", "les", "le", "la",
        "y", "en", "ce", "même", "là", "ci", "t", "être", "dire", "à-dire", "unes", "uns", "delà", "dessus", "dessous"}

def joinLines(lines):
    s = ""
    for l in lines:
        l = re.sub(r"\s+", " ", l).strip()
        if not l: continue
        if s.endswith("-") and not s.endswith(" -"):
            first = re.match(r"[\wÀ-ÿ'’]+", l)
            s = s + l if first and first.group(0).lower().split("'")[0] in keep else s[:-1] + l
        else:
            s = (s + " " + l) if s else l
    return s

def paras(pg):
    return [joinLines([" ".join((w.text or "") for w in ln.iter("WORD")) for ln in p.iter("LINE")]) for p in pg.iter("PARAGRAPH")]

head = re.compile(r"^(\d{1,3}\s+[A-ZÀ-Ý'’ .,-]{6,}|[A-ZÀ-Ý'’ .,-]{6,}\s+\d{1,3})$")
note = re.compile(r"^\((\d)\)\s*(.*)")
body, notes = [], []   # body: (text, pageNo); notes: per page list
started = False
for i, pg in enumerate(pages):
    ps = [p for p in paras(pg) if p]
    if not started:
        if any(p.startswith("AVANT-PROPOS") for p in ps):
            started = True; ps = ps[[k for k, p in enumerate(ps) if p.startswith("AVANT-PROPOS")][0]:]
        else: continue
    if any(p.startswith("TABLE DES MATI") for p in ps): break
    if ps and head.match(ps[0]): ps = ps[1:]
    pageNotes = []
    while ps and note.match(ps[-1]): pageNotes.insert(0, ps.pop())
    # A note may run over two OCR paragraphs: "(1) …" then a continuation.
    for k, p in enumerate(ps):
        if note.match(p) and k > 0 and all(not note.match(q) or True for q in ps[k:]):
            pageNotes = ps[k:] + pageNotes; ps = ps[:k]; break
    if ps and body and not re.search(r"[.!?:;»\"]\s*$", body[-1][0]) and ps[0][:1].islower():
        prev = body.pop()[0]
        ps[0] = (prev[:-1] + ps[0]) if prev.endswith("-") and ps[0].split()[0].lower() not in keep else (prev + " " + ps[0])
    body += [(p, pageNotes if k == len(ps) - 1 else []) for k, p in enumerate(ps)]
    # Notes are attached to the page's last paragraph; markers are matched per chapter below.
    if not ps and pageNotes and body: body[-1] = (body[-1][0], body[-1][1] + pageNotes)

chapters, cur = [], None
for text, pn in body:
    if text.startswith("AVANT-PROPOS"):
        cur = {"id": "avant-propos", "paras": ["# Avant-propos"], "notes": []}; chapters.append(cur); continue
    m = re.match(r"^CHAPITRE\s+([IVXL]+|PREMIER)\b", text)
    if m:
        n = 1 if m.group(1) == "PREMIER" else ["I","II","III","IV","V","VI","VII","VIII","IX"].index(m.group(1)) + 1
        cur = {"id": "ch%d" % n, "paras": ["# Chapitre %s" % ("premier" if n == 1 else m.group(1))], "notes": []}; chapters.append(cur); continue
    if re.fullmatch(r"[IVX]{1,4}|[IL]{2}|[I1l]", text.strip()):
        cur["paras"].append("## " + text.strip()); cur["notes"] += pn; continue
    cur["paras"].append(text); cur["notes"] += pn

os.makedirs(out, exist_ok=True)
for ch in chapters:
    ps, n, defs = ch["paras"], 0, []
    notes = [note.match(x) for x in ch["notes"]]
    queue = [m.group(2) for m in notes if m]
    res = []
    for p in ps:
        def mark(m):
            global n
            if not queue: return m.group(0)
            n += 1; defs.append("[^%d]: %s" % (n, queue.pop(0))); return "[^%d]" % n
        res.append(re.sub(r"\s?\((\d)\)", mark, p) if not p.startswith("#") else p)
    open(os.path.join(out, ch["id"] + ".md"), "w").write("\n\n".join(res + defs) + "\n")
    print(ch["id"], len(res), "paragraphs", n, "notes", len(queue), "unmatched")
