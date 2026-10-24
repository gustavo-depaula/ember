"""Single-shot translation (run-book2.sh): the book is translated in a few
model calls without tools, each one a span of source paragraphs of at most
~unitWords, and this script writes the files.

The agent-session translator spent ~25 turns re-reading its growing context
(2-3M cache-read tokens a book) to look up conventions and write files; here
the conventions travel in the system prompt and the sibling works' Key Terms
in the message, so a call is one read of its span plus the answer.

  t2.py units <bookdir>                       how many calls the book needs
  t2.py prompt <bookdir> <unit> <out>         the user message for unit k (1-based)
  t2.py write <bookdir> <unit> <answer>       writes unit k's paragraphs (and, from
                                              unit 1, book.json; the journal from any
                                              unit that sends one); exits 1 with the
                                              problems when the answer is unusable
  t2.py check <bookdir>                       final structural check; exits 1 on problems
"""
import glob, json, os, re, sys

unitWords = 9000
here = os.path.dirname(os.path.abspath(__file__))


def lang(book):
    return "la" if os.path.isdir(book + "/la") else "en-US"


def paras(t):
    return [p.strip() for p in t.split("\n\n") if p.strip()]


# A very long book (the Summa) is translated one part at a time: BOOK_SCOPE is
# the prefix of that part's chapter files ("fp-"), and its toc titles are
# translated by titles.py, so the calls neither send nor return book.json's toc.
scope = os.environ.get("BOOK_SCOPE", "")


def tocOrder(book):
    """Chapter ids in toc order (a question's prooemium before its articles,
    which file names sort after them)."""
    out = []
    def walk(ns):
        for n in ns:
            out.append(n.get("id") or n.get("file", "")); walk(n.get("children", []))
    walk(json.load(open(book + "/book.json")).get("toc", []))
    return {c: i for i, c in enumerate(out)}


def chapters(book):
    fs = [os.path.basename(f) for f in sorted(glob.glob("%s/%s/%s*.md" % (book, lang(book), scope)))]
    if scope:
        order = tocOrder(book)
        fs.sort(key=lambda f: (order.get(f[:-3], len(order)), f))
    return fs


def bookJsonText(book):
    if not scope:
        return open(book + "/book.json").read().strip()
    bj = json.load(open(book + "/book.json"))
    return json.dumps({k: v for k, v in bj.items() if k != "toc"}, ensure_ascii=False, indent=2)


def journalNoLog(book):
    t = open(journalPath(book)).read()
    return t.split("\n## Review log")[0].rstrip() + "\n"


def units(book):
    """[(file, first, last)] spans of whole paragraphs, 0-based inclusive, in book order."""
    out = []
    for ch in chapters(book):
        ps = paras(open("%s/%s/%s" % (book, lang(book), ch)).read())
        start, size = 0, 0
        for i, p in enumerate(ps):
            w = len(p.split())
            if size and size + w > unitWords:
                out.append((ch, start, i - 1)); start, size = i, 0
            size += w
        out.append((ch, start, len(ps) - 1))
    # Merge small neighbouring spans (short chapters) into one call.
    merged = []
    for u in out:
        if merged and wordsOf(book, merged[-1]) + wordsOf(book, [u]) <= unitWords:
            merged[-1] = merged[-1] + [u]
        else:
            merged.append([u])
    return merged


def wordsOf(book, spans):
    n = 0
    for ch, a, b in spans:
        n += sum(len(p.split()) for p in paras(open("%s/%s/%s" % (book, lang(book), ch)).read())[a:b + 1])
    return n


def siblings(book):
    """Key Terms tables of the closest translated works: same author (or the same
    Aquinas section), else the two reference Fathers."""
    parent = os.path.dirname(book)
    cands = [j for j in glob.glob(parent + "/*/pt-BR/translation-journal.md") if not j.startswith(book + "/")]
    if "aquinas-opera-omnia" in book and len(cands) < 2:
        cands += glob.glob(book.split("aquinas-opera-omnia")[0] + "aquinas-opera-omnia/*/*/pt-BR/translation-journal.md")
    if not cands:
        root = book.split("content/books")[0] + "content/books"
        cands = [root + "/church-fathers/ambrose/repentance/pt-BR/translation-journal.md"] + sorted(glob.glob(root + "/church-fathers/athanasius/*/pt-BR/translation-journal.md"))[:1]
    cands = sorted(set(cands), key=os.path.getmtime, reverse=True)[:3]
    out = []
    for j in cands:
        t = open(j).read()
        m = re.search(r"^## [^\n]*(Termos|Terms)[^\n]*\n(.*?)(?=^## )", t, re.S | re.M)
        table = m.group(0).strip() if m else t[:3000]
        bj = json.load(open(os.path.dirname(os.path.dirname(j)) + "/book.json"))
        name = bj.get("name", {})
        out.append("### %s — %s / %s\n\n%s" % (os.path.relpath(os.path.dirname(os.path.dirname(j)), os.path.dirname(parent)), name.get("en-US", ""), name.get("pt-BR", ""), table[:6000]))
    return "\n\n".join(out)


def journalPath(book):
    return book + "/pt-BR/translation-journal.md"


def prompt(book, k, out):
    us = units(book)
    spans = us[k - 1]
    parts = ["# Translation call %d of %d" % (k, len(us)), "", "Book: `%s`. Source: `%s/`." % (os.path.basename(book), lang(book)), ""]
    if lang(book) == "la" and os.path.isdir(book + "/en-US"):
        parts += ["The book has `la/` (the canonical source) and `en-US/` (a reference translation: consult it for register and terminology only). Both are given below for this call's paragraphs.", ""]
    parts += ["## book.json" + (" (without its toc: this call translates one part of the book, `%s*` files; titles are done separately)" % scope if scope else ""), "", "```json", bookJsonText(book), "```", ""]
    if k == 1 and scope and os.path.exists(journalPath(book)):
        parts += ["## The book's journal so far (from its parts already translated)", "", journalNoLog(book), ""]
    elif k == 1:
        parts += ["## Key Terms of the closest translated works in this corpus (follow their conventions)", "", siblings(book), ""]
    else:
        parts += ["## The journal so far (from the earlier calls)", "", (journalNoLog(book) if scope else open(journalPath(book)).read()) if os.path.exists(journalPath(book)) else "(none)", ""]
        prev = us[k - 2][-1]
        prevPt = paras(open("%s/pt-BR/%s" % (book, prev[0])).read()) if os.path.exists("%s/pt-BR/%s" % (book, prev[0])) else []
        if prevPt:
            parts += ["## The end of the previous call's translation (for continuity; do not repeat it)", "", "\n\n".join(prevPt[-3:]), ""]
    parts += ["## Translate these paragraphs", ""]
    for ch, a, b in spans:
        ps = paras(open("%s/%s/%s" % (book, lang(book), ch)).read())
        ref = paras(open("%s/en-US/%s" % (book, ch)).read()) if lang(book) == "la" and os.path.exists("%s/en-US/%s" % (book, ch)) else None
        parts += ["### %s, paragraphs %d–%d of %d" % (ch, a + 1, b + 1, len(ps)), ""]
        for i in range(a, b + 1):
            parts.append("[%d] %s" % (i + 1, ps[i]))
            if ref and len(ref) == len(ps):
                parts.append("    (en-US reference: %s)" % ref[i])
            parts.append("")
    want = ["`=== pt-BR/%s [%d-%d] ===`" % (ch, a + 1, b + 1) for ch, a, b in spans]
    # Once the journal exists a call sends back only what it adds: resending a
    # long book's whole journal every call outgrew the output limit (Summa, call 14).
    additions = ", then `=== pt-BR/translation-journal.md (additions) ===` only if you add terms or decisions: under each journal heading you add to (`## Termos`, `## Decisões`, …), only the new table rows or bullets; never repeat what the journal already has"
    if k == 1 and not (scope and os.path.exists(journalPath(book))):
        tail = ", then `=== pt-BR/translation-journal.md ===`" + (" only; no book.json." if scope else " and `=== book.json ===`.")
    else:
        tail = additions + "."
    parts += ["## Your answer", "", "Give, in this order: " + ", ".join(want) + tail]
    open(out, "w").write("\n".join(parts) + "\n")


def sections(text):
    out, cur = {}, None
    for line in text.split("\n"):
        if re.match(r"^=== pt-BR/translation-journal\.md \(additions\) ===\s*$", line):
            cur = ("journal-additions", None, None); out[cur] = []; continue
        m = re.match(r"^=== (\S+?)(?: \[(\d+)-(\d+)\])? ===\s*$", line)
        if m:
            cur = (m.group(1), int(m.group(2)) if m.group(2) else None, int(m.group(3)) if m.group(3) else None); out[cur] = []
        elif cur:
            out[cur].append(line)
    return {k: "\n".join(v).strip() for k, v in out.items()}


def mergeJournal(old, add):
    """Appends each `## Heading` block of `add` to the end of that section of
    the journal (rows stay in their table), or adds the section before the
    review log when the journal lacks it."""
    blocks, cur = {}, None
    for line in add.split("\n"):
        if line.startswith("## "):
            cur = line[3:].strip(); blocks.setdefault(cur, [])
        elif cur and line.strip() and not set(line.strip()) <= set("|-: "):
            blocks[cur].append(line)
    lines = old.rstrip("\n").split("\n")
    have = set(l.strip() for l in lines)
    for head, new in blocks.items():
        # A repeated line (a table's header row, a row resent) is not added again.
        new = [l for l in new if l.strip() not in have]
        if not new: continue
        idx = [i for i, l in enumerate(lines) if l.startswith("## ") and l[3:].strip().lower() == head.lower()]
        if idx:
            end = next((i for i in range(idx[0] + 1, len(lines)) if lines[i].startswith("## ")), len(lines))
            last = max(i for i in range(idx[0], end) if lines[i].strip())
            lines[last + 1:last + 1] = new
        else:
            log = next((i for i, l in enumerate(lines) if l.startswith("## Review log")), len(lines))
            gap = [""] if log and lines[log - 1].strip() else []
            lines[log:log] = gap + ["## " + head, ""] + new + ([""] if log < len(lines) else [])
    return "\n".join(lines) + "\n"


def write(book, k, ans):
    us = units(book)
    secs = sections(open(ans).read())
    problems = []
    os.makedirs(book + "/pt-BR", exist_ok=True)
    for ch, a, b in us[k - 1]:
        got = secs.get(("pt-BR/" + ch, a + 1, b + 1))
        if got is None:
            problems.append("no section for pt-BR/%s [%d-%d]" % (ch, a + 1, b + 1)); continue
        ps = [re.sub(r"^\[\d+\] ", "", p) for p in paras(got)]
        src = paras(open("%s/%s/%s" % (book, lang(book), ch)).read())
        # A translator's footnote may follow the paragraphs it serves.
        body = [p for p in ps if not (p.startswith("[^") and "Nota do tradutor" in p)]
        if len(body) != b - a + 1:
            problems.append("pt-BR/%s [%d-%d]: %d paragraphs for %d" % (ch, a + 1, b + 1, len(body), b - a + 1)); continue
        if re.search(r"truncated to [0-9]+ chars", got):
            problems.append("pt-BR/%s: clip marker" % ch); continue
        path = "%s/pt-BR/%s" % (book, ch)
        have = []
        if a > 0 and os.path.exists(path):
            # The paragraphs before this span (a rerun of this span replaces its own).
            for x in paras(open(path).read()):
                if sum(1 for y in have if not (y.startswith("[^") and "Nota do tradutor" in y)) >= a: break
                have.append(x)
        open(path, "w").write("\n\n".join(have + ps) + "\n")
    if problems:
        print("\n".join(problems)); sys.exit(1)
    j = secs.get(("pt-BR/translation-journal.md", None, None))
    if j:
        # The calls of a part see the journal without its review log (the earlier
        # parts' rounds); keep that log under the journal they send back.
        old = open(journalPath(book)).read() if os.path.exists(journalPath(book)) else ""
        if scope and "\n## Review log" in old and "\n## Review log" not in j:
            j = j.rstrip() + "\n\n## Review log" + old.split("\n## Review log", 1)[1].rstrip()
        open(journalPath(book), "w").write(j + "\n")
    add = secs.get(("journal-additions", None, None))
    if add and os.path.exists(journalPath(book)):
        open(journalPath(book), "w").write(mergeJournal(open(journalPath(book)).read(), add))
    if k == 1 and scope and not os.path.exists(journalPath(book)):
        print("no journal in call 1"); sys.exit(1)
    if k == 1 and not scope:
        bj = secs.get(("book.json", None, None), "")
        bj = re.sub(r"^```(?:json)?\s*|\s*```$", "", bj.strip())
        try:
            new = json.loads(bj)
        except Exception as e:
            print("book.json: not valid JSON (%s)" % e); sys.exit(1)
        old = json.load(open(book + "/book.json"))
        if set(new) - set(old):
            print("book.json: new top-level fields %s" % sorted(set(new) - set(old))); sys.exit(1)
        if "pt-BR" not in new.get("languages", []):
            new["languages"] = old.get("languages", []) + ["pt-BR"]
        open(book + "/book.json", "w").write(json.dumps(new, ensure_ascii=False, indent=2) + "\n")
        if not os.path.exists(journalPath(book)):
            print("no journal in call 1"); sys.exit(1)


def check(book):
    problems = []
    for ch in chapters(book):
        p = "%s/pt-BR/%s" % (book, ch)
        if not os.path.exists(p):
            problems.append("missing pt-BR/" + ch); continue
        a = paras(open("%s/%s/%s" % (book, lang(book), ch)).read())
        b = [x for x in paras(open(p).read()) if not (x.startswith("[^") and "Nota do tradutor" in x)]
        if len(a) != len(b):
            problems.append("pt-BR/%s: %d paragraphs for %d" % (ch, len(b), len(a)))
    if problems:
        print("\n".join(problems)); sys.exit(1)


cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "units": print(len(units(a[0])))
elif cmd == "prompt": prompt(a[0], int(a[1]), a[2])
elif cmd == "write": write(a[0], int(a[1]), a[2])
elif cmd == "check": check(a[0])
