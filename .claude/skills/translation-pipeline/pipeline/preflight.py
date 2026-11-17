"""Checks a book's source before any call is spent on it.

  python3.13 preflight.py <book dir>      (BOOK_SCOPE limits it to a part)

A flaw in the source costs a whole translation call per attempt, and two
attempts then fail the book: Guía de pecadores l1-c15 lost two calls to a
footnote the OCR had run into the one before it. Prints one line per issue.
Exit 1 when a hard issue is found:
  - a footnote marker without its definition, or a definition without a marker
  - a definition given twice
  - a gap in a chapter's footnote numbers (1, 2, 3, 5): usually a note merged
    into its neighbour
  - an empty chapter file
Warnings (exit 0) are likely OCR splits: a paragraph ending without
punctuation followed by one starting in lowercase, and garbage paragraphs.
"""
import os, re, sys
from srclang import sourceLang

book = sys.argv[1].rstrip("/")
lang = sourceLang(book)
scope = os.environ.get("BOOK_SCOPE", "")
src = "%s/%s" % (book, lang)
hard, warn = [], []


def paras(t):
    return [p.strip() for p in t.split("\n\n") if p.strip()]


for f in sorted(os.listdir(src)):
    if not f.endswith(".md") or not f.startswith(scope):
        continue
    t = open("%s/%s" % (src, f)).read()
    ps = paras(t)
    if not ps:
        hard.append("%s: empty" % f)
        continue
    defs = re.findall(r"^\[\^([^\]]+)\]:", t, re.M)
    body = re.sub(r"^\[\^[^\]]+\]:", "", t, flags=re.M)
    marks = set(re.findall(r"\[\^([^\]]+)\]", body))
    for d in sorted(set(defs)):
        if defs.count(d) > 1:
            hard.append("%s: note [^%s] defined %d times" % (f, d, defs.count(d)))
    for m in sorted(marks - set(defs)):
        hard.append("%s: marker [^%s] has no definition" % (f, m))
    for d in sorted(set(defs) - marks):
        hard.append("%s: note [^%s] has no marker" % (f, d))
    nums = sorted({int(x) for x in set(defs) | marks if x.isdigit()})
    gaps = [n for n in range(nums[0], nums[-1]) if n not in nums] if nums else []
    if gaps:
        hard.append("%s: footnote numbers skip %s" % (f, ", ".join(map(str, gaps))))
    for i, p in enumerate(ps):
        letters = sum(c.isalpha() for c in p)
        if len(p) > 20 and letters < 0.5 * len(p) and not p.startswith(("|", "[^", "#")):
            warn.append("%s [%d]: mostly non-letters: %s" % (f, i + 1, p[:60]))
        # OCR debris inside a paragraph: a word with a capital after a small
        # letter (mBMeZA) or letters fused with digits (z4), and paragraphs
        # made mostly of one- and two-letter scraps.
        junk = [w for w in re.findall(r"\w+", p) if re.search(r"[a-z][A-Z]|^[A-Za-z]+\d|^\d+[A-Za-z]{1,2}$", w) and not re.fullmatch(r"\d+(st|nd|rd|th|a|o|er|e|me)", w)]
        if junk:
            warn.append("%s [%d]: debris %s" % (f, i + 1, " ".join(junk[:5])))
        words = re.findall(r"[^\W\d_]+", p)
        if len(words) >= 8 and sum(len(w) <= 2 for w in words) > 0.6 * len(words):
            warn.append("%s [%d]: scraps: %s" % (f, i + 1, p[:60]))
        if i + 1 < len(ps):
            q = ps[i + 1]
            if (not p.startswith(("#", "[^", ">", "|", "-", "*")) and not re.search(r"[.!?:;»”\"')\]*_—…]$", p)
                    and q[:1].islower()):
                warn.append("%s [%d-%d]: possible split: …%s / %s…" % (f, i + 1, i + 2, p[-40:], q[:40]))

for x in hard:
    print("HARD " + x)
for x in warn:
    print("warn " + x)
sys.exit(1 if hard else 0)
