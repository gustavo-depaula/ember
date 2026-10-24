"""Mechanical audit and reading copies for one review round (run-book.sh).

A reviewer used to spend its first turns writing throwaway scripts to align
paragraphs and compare references, printing the whole book into its context a
second time. This does that work once, deterministically, before the round.

usage: audit.py <bookdir> <outdir> [chapter file ...]   (default: every chapter)

Writes into <outdir>:
  report.md        every mechanical flag, or "no flags"
  pairs-<ch>-pN.md source and pt-BR side by side, paragraph by paragraph
  pt-<ch>-pN.md    pt-BR alone, for a source-blind read
The reading copies are hard-wrapped (book paragraphs run past the 2,000
characters a file reader clips at) and split into parts small enough to load
whole. Prints the names of the reading copies, one per line.
"""
import glob, json, os, re, sys, textwrap

book, out = sys.argv[1].rstrip("/"), sys.argv[2]
only = set(sys.argv[3:])
lang = "la" if os.path.isdir(book + "/la") else "en-US"
os.makedirs(out, exist_ok=True)
for f in glob.glob(out + "/*.md"):
    os.remove(f)

partWords = 11000
perKind = 40  # flags of one kind shown before the rest are only counted


def paras(f):
    return [p.strip() for p in open(f).read().split("\n\n") if p.strip()]


def wrap(s):
    return "\n".join(textwrap.fill(l, 1200, break_long_words=False, break_on_hyphens=False) or l for l in s.split("\n"))


def words(s):
    return len(s.split())


flags = {}


def flag(kind, where, what):
    flags.setdefault(kind, []).append("%s: %s" % (where, what))


def writeParts(prefix, blocks):
    names, part, size = [], [], 0
    def flush():
        nonlocal part, size
        if part:
            name = "%s-p%d.md" % (prefix, len(names) + 1)
            open(os.path.join(out, name), "w").write("\n\n".join(part) + "\n")
            names.append(name)
        part, size = [], 0
    for b in blocks:
        if size and size + words(b) > partWords:
            flush()
        part.append(b); size += words(b)
    flush()
    return names


english = re.compile(r"\b(the|and|of|which|with|that|shall|unto|thee|thou|have|their|from)\b", re.I)
enBooks = re.compile(r"\b(Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Hebrews|James|Peter|Jude|Revelation|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Kings|Chronicles|Psalms?|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Ezekiel|Wisdom|Sirach|Song of Songs) \d")
refs = lambda s: sorted(re.findall(r"\d+:\d+(?:[-–]\d+)?", s))
views = []
# A book translated one part at a time (run-book2.sh book#scope) is audited on
# that part's files only; pt-BR joins `languages` when the last part is done.
scope = os.environ.get("BOOK_SCOPE", "")

for src in sorted(glob.glob("%s/%s/%s*.md" % (book, lang, scope))):
    name = os.path.basename(src)
    if only and name not in only: continue
    ch = name[:-3]
    tgt = "%s/pt-BR/%s" % (book, name)
    if not os.path.exists(tgt):
        flag("missing file", name, "no pt-BR counterpart"); continue
    raw = open(tgt).read()
    a = paras(src)
    b = paras(tgt)
    # A translator's footnote is the one block pt-BR may add.
    notes = [p for p in b if p.startswith("[^") and "Nota do tradutor" in p]
    b = [p for p in b if p not in notes]
    aligned = len(a) == len(b)
    if not aligned:
        flag("paragraph count", name, "%d source blocks vs %d pt-BR blocks — the pairs below are NOT aligned past the first divergence" % (len(a), len(b)))
    ha, hb = [p.split(" ")[0] for p in a if p.startswith("#")], [p.split(" ")[0] for p in b if p.startswith("#")]
    if ha != hb:
        flag("headings", name, "%d source headings vs %d pt-BR, or their levels differ" % (len(ha), len(hb)))
    if re.search(r"truncated to [0-9]+ chars", raw):
        flag("truncation marker", name, "a reader's clip marker was translated into the text")
    for i, y in enumerate(b, 1):
        where = "%s [%d]" % (name, i)
        if y.count("“") != y.count("”"):
            flag("unbalanced quotes", where, "%d “ vs %d ”" % (y.count("“"), y.count("”")))
        if '"' in y:
            flag("straight quotes", where, 'contains " (%d)' % y.count('"'))
        if re.search(r"[^\n ]  +[^ \n]", y):
            flag("double space", where, "…%s…" % re.search(r".{0,20}[^\n ]  +[^ \n].{0,20}", y).group(0))
        m = re.search(r" [,;:.!?](?!\.)", y)
        if m:
            flag("space before punctuation", where, "…%s…" % y[max(0, m.start() - 20):m.end() + 10])
        m = re.search(r"\b(\w{3,}) \1\b", y, re.I)
        if m:
            flag("repeated word", where, "“%s”" % m.group(0))
        if len(english.findall(y)) >= 4:
            flag("English left in pt-BR", where, " ".join(english.findall(y)[:6]))
        m = enBooks.search(y)
        if m and lang == "en-US":
            flag("English Bible book name", where, m.group(0))
    if aligned:
        for i, (x, y) in enumerate(zip(a, b), 1):
            where = "%s [%d]" % (name, i)
            if lang == "en-US" and refs(x) != refs(y):
                flag("Scripture references differ", where, "source %s | pt-BR %s" % (" ".join(refs(x)) or "none", " ".join(refs(y)) or "none"))
            wx, wy = words(x), words(y)
            if wx > 40 and not 0.7 <= wy / wx <= 1.6:
                flag("length outlier", where, "pt-BR is %.0f%% of the source's word count" % (100 * wy / wx))
            for mark, label in (("*", "emphasis markers"), ("[^", "footnote markers"), ("(", "parentheses")):
                if x.count(mark) != y.count(mark) and not (mark == "[^" and notes):
                    flag(label + " differ", where, "source %d | pt-BR %d" % (x.count(mark), y.count(mark)))
            if x.startswith(">") != y.startswith(">"):
                flag("blockquote differs", where, "one side is a blockquote, the other is not")
    n = max(len(a), len(b))
    pairs = ["### [%d]\nSRC: %s\nPT: %s" % (i + 1, wrap(a[i]) if i < len(a) else "—", wrap(b[i]) if i < len(b) else "—") for i in range(n)]
    views += writeParts("pairs-" + ch, pairs)
    views += writeParts("pt-" + ch, ["[%d] %s" % (i + 1, wrap(y)) for i, y in enumerate(b)])

for extra in sorted(os.listdir(book + "/pt-BR")) if os.path.isdir(book + "/pt-BR") else []:
    if extra != "translation-journal.md" and not os.path.exists("%s/%s/%s" % (book, lang, extra)):
        flag("stray file", "pt-BR/" + extra, "no source counterpart")

try:
    bj = json.load(open(book + "/book.json"))
    if not scope and "pt-BR" not in bj.get("languages", []): flag("book.json", "languages", "pt-BR missing")
    for field in ("name", "author", "description"):
        if isinstance(bj.get(field), dict) and "pt-BR" not in bj[field]: flag("book.json", field, "pt-BR missing")
    missing = [t.get("file", "?") for t in bj.get("toc", []) if isinstance(t.get("title"), dict) and "pt-BR" not in t["title"]]
    if missing: flag("book.json", "toc", "titles without pt-BR: %s" % ", ".join(missing[:8]))
except Exception as e:
    flag("book.json", "file", "not valid JSON: %s" % e)

# Key Terms: a row whose source term occurs in the source but whose rendering
# never occurs in pt-BR (or the reverse) is worth a look. Indicative only: rows
# often list inflected forms or alternatives that a plain count cannot follow.
journal = book + "/pt-BR/translation-journal.md"
if os.path.exists(journal):
    srcText = " ".join(open(f).read() for f in glob.glob("%s/%s/%s*.md" % (book, lang, scope))).lower()
    tgtText = " ".join(open(f).read() for f in glob.glob(book + "/pt-BR/" + scope + "*.md") if not f.endswith("translation-journal.md")).lower()
    inTable = False
    for line in open(journal):
        if line.startswith("#"):
            inTable = "key terms" in line.lower() or "termos" in line.lower()
        if not (inTable and line.startswith("|")) or set(line.strip()) <= set("|-: "):
            continue
        cols = [re.sub(r"[*_`“”\"]", "", c).strip() for c in line.strip().strip("|").split("|")]
        if len(cols) < 2: continue
        first = lambda c: re.split(r"[/;,(]", c)[0].strip().lower()
        s, t = first(cols[0]), first(cols[1])
        if len(s) < 3 or len(t) < 3 or s in ("source", "term", "english", "latin", "en-us", "la"): continue
        # Count by stem, so an inflected form (justify → justificado) still matches.
        stem = lambda w: w[:-2] if " " not in w and len(w) > 6 else w
        ns, nt = srcText.count(stem(s)), tgtText.count(stem(t))
        if ns > 0 and nt == 0:
            flag("Key Terms row to check (indicative)", "journal", "“%s” ×%d in source | “%s” ×%d in pt-BR" % (s, ns, t, nt))
else:
    flag("journal", "pt-BR/translation-journal.md", "missing")

lines = ["## Mechanical audit (already run by the driver)", ""]
if not flags:
    lines.append("No flags: paragraph and heading counts, Scripture references, markup counts, quotation marks, spacing, leftover English, `book.json` and stray files all check out.")
for kind, items in flags.items():
    lines.append("**%s** (%d)" % (kind, len(items)))
    lines += ["- " + i for i in items[:perKind]]
    if len(items) > perKind: lines.append("- … and %d more of this kind" % (len(items) - perKind))
    lines.append("")
open(os.path.join(out, "report.md"), "w").write("\n".join(lines).rstrip() + "\n")
print("\n".join(views))
