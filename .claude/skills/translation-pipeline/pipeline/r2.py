"""Single-shot review rounds (run-book2.sh): the whole round is one model call.

A review step used to be an agent session: it loaded the book through its
tools, edited files itself and re-read its growing context on every turn
(~12 turns, ~1.1M cache-read tokens a step). Here the driver puts the text in
one message, the reviewer answers with exact-text patches, and this script
applies them, so a step costs one read of the book plus its answer.

  r2.py prompt <bookdir> <out> <round> full|delta [prev-changes.json]
        writes the user message for a round (the system prompt is review2.system.md)
  r2.py parts <bookdir> <maxWords>
        the book's chapter files in review parts of at most maxWords source words, one part a line
  r2.py apply <bookdir> <answer> <round> <engine> <mode> <changes-out.json>
        applies the answer's patches, appends the round to the journal's review
        log, writes the changed paragraphs; prints "meaning=N minor=N applied=N failed=N"

Paragraphs are numbered as audit.py numbers them: blank-line separated blocks
of a chapter file, a translator's footnote excluded.
"""
import glob, json, os, re, sys

here = os.path.dirname(os.path.abspath(__file__))


def lang(book):
    return "la" if os.path.isdir(book + "/la") else "en-US"


def blocks(text):
    """[(start, end)] of the paragraphs of a chapter file, translator's note excluded."""
    out = []
    for m in re.finditer(r"(?:[^\n]|\n(?!\s*\n))+", text):
        s = m.group(0).strip()
        if not s or (s.startswith("[^") and "Nota do tradutor" in s):
            continue
        start = m.start() + (len(m.group(0)) - len(m.group(0).lstrip()))
        out.append((start, start + len(s)))
    return out


def paras(path):
    t = open(path).read()
    return [t[a:b] for a, b in blocks(t)]


# A very long book is translated one part at a time (BOOK_SCOPE, the prefix of
# the part's files: "fp-"); see t2.py.
scope = os.environ.get("BOOK_SCOPE", "")


def toc(book):
    return json.load(open(book + "/book.json")).get("toc", [])


def tocNodes(ns):
    for n in ns:
        yield n
        yield from tocNodes(n.get("children", []))


def allChapters(book):
    fs = [os.path.basename(f) for f in sorted(glob.glob("%s/%s/%s*.md" % (book, lang(book), scope)))]
    if scope:
        order = {n.get("id"): i for i, n in enumerate(tocNodes(toc(book)))}
        fs.sort(key=lambda f: (order.get(f[:-3], len(order)), f))
    return fs


def chapters(book):
    """The chapters of this review: a long book is reviewed in parts (R2_ONLY,
    space-separated chapter files), each to convergence, because one message
    holding a 70k-word book and its translation is past what a full read keeps
    its attention on."""
    only = os.environ.get("R2_ONLY", "").split()
    return [c for c in allChapters(book) if not only or c in only]


def parts(book, maxWords):
    words = lambda c: len(open("%s/%s/%s" % (book, lang(book), c)).read().split())
    chs = allChapters(book)
    total = sum(words(c) for c in chs)
    n = max(1, -(-total // int(maxWords)))
    out, cur, size = [], [], 0
    # Even parts: close one when it reaches its share of the book.
    for c in chs:
        w, target = words(c), total / n * (len(out) + 1)
        # Close before a chapter that would overshoot the share by more than it
        # falls short: one long chapter at the end otherwise kept the whole book
        # in one part, too long for Codex (Peri hermeneias, a 36k-word chapter).
        if cur and len(out) < n - 1 and size + w > target and size + w - target > target - size:
            out.append(cur); cur = []
        cur.append(c); size += w
        if size >= total / n * (len(out) + 1) and len(out) < n - 1:
            out.append(cur); cur = []
    if cur: out.append(cur)
    print("\n".join(" ".join(p) for p in out))


def notes(path):
    """The translator's footnotes of a chapter file, which the paragraph numbering skips."""
    if not os.path.exists(path): return ""
    ns = [p.strip() for p in open(path).read().split("\n\n") if p.strip().startswith("[^") and "Nota do tradutor" in p]
    return "\n\n".join(ns)


def notesBlock(book, ch):
    n = notes("%s/pt-BR/%s" % (book, ch))
    return "### pt-BR/%s — translator's footnotes (not numbered as paragraphs; they stand after the paragraphs they serve)\n%s" % (ch, n) if n else ""


def pair(book, ch, i, src, tgt):
    return "### pt-BR/%s [%d]\nSRC: %s\nPT: %s" % (ch, i + 1, src[i] if i < len(src) else "—", tgt[i] if i < len(tgt) else "—")


def journal(book):
    j = book + "/pt-BR/translation-journal.md"
    if not os.path.exists(j): return "(no journal)"
    t = open(j).read()
    part = os.environ.get("R2_PART")
    if not part or "\n## Review log" not in t:
        return t
    # A part's reviewers see only that part's rounds of the review log.
    head, log = t.split("\n## Review log", 1)
    rounds = re.split(r"\n(?=### )", log)
    keep = [r for r in rounds[1:] if r.startswith("### Part %s, " % part)]
    return head.rstrip() + "\n\n## Review log (this part's rounds)\n" + ("\n".join(keep) or "(none yet)") + "\n"


def audit(book, only=()):
    """The mechanical audit report, from audit.py (its reading copies are not used here)."""
    import subprocess, tempfile
    d = tempfile.mkdtemp(prefix="r2audit")
    subprocess.run(["python3.13", here + "/audit.py", book, d, *only], capture_output=True, text=True)
    return open(d + "/report.md").read() if os.path.exists(d + "/report.md") else "(audit failed to run)"


def bookJson(book):
    if not scope:
        return open(book + "/book.json").read()
    # The whole toc of a long book is a megabyte: send this review's titles only.
    bj = json.load(open(book + "/book.json"))
    mine = {c[:-3] for c in chapters(book)}
    titles = [{"id": n["id"], "title": n.get("title", {})} for n in tocNodes(bj.get("toc", [])) if n.get("id") in mine]
    rest = {k: v for k, v in bj.items() if k != "toc"}
    return json.dumps(rest, ensure_ascii=False, indent=2) + "\n\n(toc titles of this review's chapters; fix one with `file: book.json` and its exact pt-BR text)\n" + json.dumps(titles, ensure_ascii=False, indent=1)


def prompt(book, out, rnd, mode, prev=None):
    parts = ["# Review round %s (%s read)" % (rnd, mode), "", "Book: `%s`. Source language: `%s/` (canonical); target: `pt-BR/`." % (book, lang(book)), ""]
    if os.environ.get("R2_PART"):
        cs = chapters(book)
        parts += ["This book is reviewed in parts, each on its own; this is part %s: `%s` to `%s` (%d chapter files). Read and fix only these; the journal and book.json are the whole book's." % (os.environ["R2_PART"], cs[0], cs[-1], len(cs)), ""]
    if mode == "full":
        body = []
        for ch in chapters(book):
            src, tgt = paras("%s/%s/%s" % (book, lang(book), ch)), paras("%s/pt-BR/%s" % (book, ch)) if os.path.exists("%s/pt-BR/%s" % (book, ch)) else []
            body += [pair(book, ch, i, src, tgt) for i in range(max(len(src), len(tgt)))]
            if notesBlock(book, ch): body.append(notesBlock(book, ch))
        parts += ["## The mechanical audit (already run)", "", audit(book, chapters(book) if os.environ.get("R2_ONLY") else ()), "", "## book.json", "", "```json", bookJson(book), "```", "",
                  "## The translation journal", "", journal(book), "", "## The text, paragraph by paragraph", "", "\n\n".join(body)]
    else:
        changes = json.load(open(prev))
        want = {}
        for c in changes["changed"]:
            if c["file"].startswith("pt-BR/") and c.get("para"):
                ch = c["file"][len("pt-BR/"):]
                for i in (c["para"] - 1, c["para"], c["para"] + 1):
                    if i >= 1: want.setdefault(ch, set()).add(i)
        body = []
        for ch in sorted(want):
            src, tgt = paras("%s/%s/%s" % (book, lang(book), ch)), paras("%s/pt-BR/%s" % (book, ch))
            body += [pair(book, ch, i - 1, src, tgt) for i in sorted(want[ch]) if i - 1 < max(len(src), len(tgt))]
            if notesBlock(book, ch): body.append(notesBlock(book, ch))
        fixes = "\n".join("- `%s`%s (%s): “%s” → “%s” — %s" % (f["file"], " [%s]" % f["para"] if f.get("para") else "", f.get("class", "?"), f["old"], f["new"], f.get("why", "")) for f in changes["fixes"])
        parts += ["## The changes to verify (made by the previous round's reviewer)", "", fixes or "(none)", "",
                  "## The paragraphs those changes touched, with their neighbours, as they now stand", "", "\n\n".join(body) or "(no chapter paragraph changed)", "",
                  "## The mechanical audit of the touched chapters", "", audit(book, sorted(want)), "",
                  "## book.json", "", "```json", bookJson(book), "```", "", "## The translation journal", "", journal(book)]
    open(out, "w").write("\n".join(parts) + "\n")


def answer(path):
    """The JSON object at the end of a reviewer's answer."""
    t = open(path).read()
    fences = re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", t, re.S)
    for cand in reversed(fences or [t[t.find("{"):t.rfind("}") + 1]]):
        try:
            return json.loads(cand)
        except Exception:
            continue
    raise ValueError("no JSON object in the answer")


def apply(book, ans, rnd, engine, mode, changesOut):
    a = answer(ans)
    applied, failed, changed = [], [], []
    for f in a.get("fixes", []):
        rel = f.get("file", "").lstrip("./")
        path = os.path.normpath(os.path.join(book, rel))
        old, new = f.get("old", ""), f.get("new", "")
        if not path.startswith(os.path.normpath(book) + "/") or not os.path.exists(path) or not old or old == new:
            failed.append((f, "bad file or empty change")); continue
        t = open(path).read()
        where = None
        if rel.startswith("pt-BR/") and rel != "pt-BR/translation-journal.md" and f.get("para"):
            bs = blocks(t)
            i = int(f["para"]) - 1
            if 0 <= i < len(bs) and t[bs[i][0]:bs[i][1]].count(old) == 1:
                where = bs[i][0] + t[bs[i][0]:bs[i][1]].index(old)
        if where is None and t.count(old) == 1:
            where = t.index(old)
            if rel.startswith("pt-BR/") and rel != "pt-BR/translation-journal.md":
                f["para"] = next((k + 1 for k, (s, e) in enumerate(blocks(t)) if s <= where < e), f.get("para"))
        if where is None:
            failed.append((f, "old text not found exactly once (%d)" % t.count(old))); continue
        open(path, "w").write(t[:where] + new + t[where + len(old):])
        applied.append(f)
        changed.append({"file": rel, "para": f.get("para") if rel.startswith("pt-BR/") and rel != "pt-BR/translation-journal.md" else None})
    meaning = sum(1 for f in a.get("fixes", []) if f.get("class") == "meaning")
    minor = len(a.get("fixes", [])) - meaning
    json.dump({"round": rnd, "fixes": applied, "changed": changed, "failed": [{"fix": f, "why": w} for f, w in failed]}, open(changesOut, "w"), ensure_ascii=False, indent=1)
    # The review log in the journal is what later rounds read; keep it short.
    j = book + "/pt-BR/translation-journal.md"
    if os.path.exists(j):
        t = open(j).read()
        if "## Review log" not in t:
            t = t.rstrip() + "\n\n## Review log\n"
        line = lambda f: "- `%s`%s: “%s” → “%s” — %s" % (f["file"], " [%s]" % f["para"] if f.get("para") else "", f["old"], f["new"], f.get("why", ""))
        e = ["", "### %sRound %s (%s, %s read)" % ("Part %s, " % os.environ["R2_PART"] if os.environ.get("R2_PART") else "", rnd, engine, mode), ("Verdict: %d meaning-level, %d minor. %s" % (meaning, minor, a.get("summary", ""))).rstrip()]
        e += [line(f) + " *(meaning)*" if f.get("class") == "meaning" else line(f) for f in applied]
        e += ["- NOT APPLIED (%s): %s" % (w, line(f)) for f, w in failed]
        e += ["- Rejected: %s — %s — %s" % (r.get("where", ""), r.get("finding", ""), r.get("why", "")) for r in a.get("rejected", [])]
        open(j, "w").write(t.rstrip() + "\n" + "\n".join(e) + "\n")
    print("meaning=%d minor=%d applied=%d failed=%d" % (meaning, minor, len(applied), len(failed)))


cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "prompt": prompt(a[0], a[1], a[2], a[3], a[4] if len(a) > 4 else None)
elif cmd == "apply": apply(*a[:6])
elif cmd == "parts": parts(a[0], a[1])
