"""Gives an existing pt-BR translation the paragraphing of its source, so the
review (r2.py) can pair them paragraph by paragraph. Divine Intimacy's pt-BR
followed the English edition's paragraphs, and its Italian source is an OCR
transcription whose breaks are mostly the printed book's but sometimes a page
break that splits a sentence.

One model call per chapter returns the source paragraphs to join (a break
inside a sentence, an OCR artifact) and the pt-BR re-broken at the remaining
source breaks. No word changes: the script checks that each side's text is
the same apart from whitespace at the breaks.

  realign.py list <bookdir>                    chapters out of step with the source
  realign.py prompt <bookdir> <chapter> <out>  the message for one chapter
  realign.py write <bookdir> <chapter> <answer>
                                               applies it; exits 1 with the
                                               problems when it is unusable
  realign.py repair-prompt / repair-write      the same for a chapter whose pt-BR
                                               differs in content (it followed the
                                               English edition): rebuilt from the
                                               source, reusing the existing pt-BR
"""
import os, re, sys

from srclang import sourceLang


def paras(path):
    return [p.strip() for p in open(path).read().split("\n\n") if p.strip()]


def flat(ps):
    return re.sub(r"\s+", " ", " ".join(ps)).strip()


def shifted(a, b):
    """Equal counts can still be out of step (a heading against prose, a long
    paragraph against a short one): Divine Intimacy had nine such chapters."""
    for x, y in zip(a, b):
        wx, wy = len(x.split()), len(y.split())
        if x.startswith("#") != y.startswith("#") or (max(wx, wy) >= 15 and not 0.6 * wx <= wy <= 1.6 * wx):
            return True
    return False


def mismatched(book):
    src = sourceLang(book)
    out = []
    for f in sorted(os.listdir("%s/%s" % (book, src))):
        t = "%s/pt-BR/%s" % (book, f)
        if f.endswith(".md") and os.path.exists(t):
            a, b = paras("%s/%s/%s" % (book, src, f)), paras(t)
            if len(a) != len(b) or shifted(a, b):
                out.append(f)
    return out


def prompt(book, ch, out):
    src = sourceLang(book)
    a, b = paras("%s/%s/%s" % (book, src, ch)), paras("%s/pt-BR/%s" % (book, ch))
    parts = [
        "Align the paragraphing of a Portuguese translation with its source. The source (`%s/`) is an OCR transcription of the printed book: its paragraph breaks are the book's, except that a page break sometimes split a sentence in two. The translation (`pt-BR/`) followed another edition's paragraphs." % src,
        "",
        "1. Find the source breaks that fall inside a sentence (the paragraph ends without final punctuation and the next one continues the sentence). Those are OCR artifacts: list the number of the paragraph before each such break, to be joined with the next one. Join nothing else.",
        "2. Re-break the translation so it has exactly one paragraph for each source paragraph left after those joins, in order, each holding the translation of that paragraph. Move breaks only: do not change, add or drop a single character of the translation other than the line breaks between paragraphs. A heading is its own paragraph on both sides.",
        "",
        "Answer with exactly these two sections, nothing else:",
        "",
        "```",
        "=== joins ===",
        "<the source paragraph numbers to join with the next, comma-separated, or none>",
        "=== pt-BR ===",
        "<the translation, its paragraphs separated by one blank line, without numbers>",
        "```",
        "",
        "## Source: %s/%s (%d paragraphs)" % (src, ch, len(a)),
        "",
    ]
    parts += ["[%d] %s\n" % (i + 1, p) for i, p in enumerate(a)]
    parts += ["## Translation: pt-BR/%s (%d paragraphs)" % (ch, len(b)), ""]
    parts += ["[%d] %s\n" % (i + 1, p) for i, p in enumerate(b)]
    open(out, "w").write("\n".join(parts) + "\n")


def write(book, ch, ans):
    src = sourceLang(book)
    sp, tp = "%s/%s/%s" % (book, src, ch), "%s/pt-BR/%s" % (book, ch)
    a, b = paras(sp), paras(tp)
    t = open(ans).read()
    m = re.search(r"^=== joins ===\s*\n(.*?)\n=== pt-BR ===\s*\n(.*)", t, re.S | re.M)
    if not m:
        print("no sections"); sys.exit(1)
    joins = sorted({int(x) for x in re.findall(r"\d+", m.group(1))})
    newB = [re.sub(r"^\[\d+\] ", "", p) for p in paras_text(m.group(2).strip().rstrip("`").strip())]
    problems = []
    if any(j < 1 or j >= len(a) for j in joins):
        problems.append("join out of range: %s" % joins)
    for j in joins:
        if j < len(a) and re.search(r"[.!?»”:;)]\**$", a[j - 1].strip()):
            problems.append("join %d: paragraph ends a sentence" % j)
    newA = []
    for i, p in enumerate(a):
        if newA and i in joins:  # paragraph i (1-based) joins with i+1, which is a[i]
            newA[-1] = newA[-1] + " " + p
        else:
            newA.append(p)
    if flat(newB) != flat(b):
        problems.append("pt-BR text changed")
    if len(newA) != len(newB):
        problems.append("%d source paragraphs for %d pt-BR" % (len(newA), len(newB)))
    if problems:
        print("\n".join(problems)); sys.exit(1)
    if joins:
        open(sp, "w").write("\n\n".join(newA) + "\n")
    open(tp, "w").write("\n\n".join(newB) + "\n")
    print("joins=%d pt=%d->%d" % (len(joins), len(b), len(newB)))


def repairPrompt(book, ch, out):
    src = sourceLang(book)
    a, b = paras("%s/%s/%s" % (book, src, ch)), paras("%s/pt-BR/%s" % (book, ch))
    parts = [
        "Rebuild a Brazilian Portuguese chapter so it translates its source paragraph by paragraph. The source (`%s/`, an OCR transcription of the printed book) is canonical. The existing translation (`pt-BR/`) partly followed an English edition that differs from this source: it may lack paragraphs, headings or date lines of the source, have passages the source lacks, or have them in another order." % src,
        "",
        "Give exactly one pt-BR paragraph per source paragraph, in the source's order. Where the existing translation has that paragraph's text, reuse its wording verbatim. Translate from the source what it lacks, in the same register and terms (Brazilian Portuguese, curly quotes “ ”, *tu* in prayer to God). Drop what the source lacks. Keep the markdown of the source (headings, bold numbers, italics). Do not correct the source.",
        "",
        "Answer with exactly this, nothing else:",
        "",
        "```",
        "=== pt-BR ===",
        "<the chapter, its paragraphs separated by one blank line, without numbers>",
        "=== notes ===",
        "<one line per paragraph you translated anew or dropped, e.g. `[15] translated: missing in pt-BR`, `dropped: \"…\" (not in the source)`>",
        "```",
        "",
        "## Source: %s/%s (%d paragraphs)" % (src, ch, len(a)),
        "",
    ]
    parts += ["[%d] %s\n" % (i + 1, p) for i, p in enumerate(a)]
    parts += ["## Existing translation: pt-BR/%s (%d paragraphs)" % (ch, len(b)), ""]
    parts += ["[%d] %s\n" % (i + 1, p) for i, p in enumerate(b)]
    open(out, "w").write("\n".join(parts) + "\n")


def repairWrite(book, ch, ans):
    src = sourceLang(book)
    a = paras("%s/%s/%s" % (book, src, ch))
    m = re.search(r"^=== pt-BR ===\s*\n(.*?)\n=== notes ===\s*\n?(.*)", open(ans).read(), re.S | re.M)
    if not m:
        print("no sections"); sys.exit(1)
    newB = [re.sub(r"^\[\d+\] ", "", p) for p in paras_text(m.group(1).strip())]
    if len(newB) != len(a):
        print("%d source paragraphs for %d pt-BR" % (len(a), len(newB))); sys.exit(1)
    open("%s/pt-BR/%s" % (book, ch), "w").write("\n\n".join(newB) + "\n")
    print(m.group(2).strip().rstrip("`").strip().replace("\n", " | "))


def paras_text(t):
    return [p.strip() for p in t.split("\n\n") if p.strip()]


cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "list": print("\n".join(mismatched(a[0])))
elif cmd == "prompt": prompt(a[0], a[1], a[2])
elif cmd == "write": write(a[0], a[1], a[2])
elif cmd == "repair-prompt": repairPrompt(a[0], a[1], a[2])
elif cmd == "repair-write": repairWrite(a[0], a[1], a[2])
