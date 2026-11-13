"""Term-consistency check of a translated book against its journal's Key Terms.

The translator settles each recurring term in the journal's table, but a book
translated in many calls drifts: the same source term gets a second rendering
in a later span. Reading the whole book again to find those places costs a full
review; this script finds them mechanically, and a single model call judges
only the flagged paragraphs.

  terms.py lang <bookdir>             the language the book was translated from, as the
                                      journal's Key Terms header names it (for SOURCE_LANG)
  terms.py scan <bookdir>             prints the flags: per term, the paragraphs where
                                      the source has the term and the pt-BR lacks its rendering
  terms.py prompt <bookdir> <outprefix> <maxWords>
                                      writes the user messages of the check calls (system
                                      prompt terms.system.md), <outprefix>-1.md, -2.md, …,
                                      each of at most maxWords words; prints how many

Each answer is applied with `r2.py apply`, as a review round (terms-check.sh).

Matching is by word stems (a word's first letters, its ending cut), so that
inflected forms meet: *gratiam* and *gratia*, *graças* and *graça*. A term's
cell may hold variants (`a / b; c`), paired one to one with the rendering's when
both have the same count. Only terms the translation mostly follows are
checked: a term rendered as stated in fewer than `minHit` of its paragraphs is
one the table states loosely (a rendering that depends on context), and its
misses would be noise.
"""
import json, os, re, sys, unicodedata
import r2

# MIN_HIT raises the bar for a book with a very large table (the Summa: 2,422 rows).
minHit = float(os.environ.get("MIN_HIT", "0.6"))
minSeen = 3


def fold(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


# Portuguese plurals that change the stem: razões/razão, males/mal.
plurals = [(r"oes$", "ao"), (r"aes$", "ao"), (r"ais$", "al"), (r"eis$", "el"), (r"ois$", "ol"), (r"ns$", "m")]


def words(s):
    ws = re.findall(r"[a-z0-9]+", fold(s))
    for a, b in plurals:
        ws = [re.sub(a, b, w) if len(w) > 4 else w for w in ws]
    return ws


def stem(w):
    return w if len(w) <= 4 else w[:-1] if len(w) == 5 else w[:max(5, len(w) - 2)]


# A source term made only of such words is everywhere in the text, in senses
# the table never meant (*non*, *esse*), so it is not checked.
common = set("non sic est esse et in ad de per quod sed ergo autem enim the of and to not is be que no y el la en se ne le les et pas est".split())


# Words a rendering may drop and still be the same rendering: "Santo
# Agostinho" is followed by "Agostinho", "o Damasceno" by "Damasceno".
optional = set("santo santa sao s o a os as de do da dos das e em no na um uma".split())


def pattern(term, pt=False):
    """A regex for a term's words, next to each other in the source (either
    order for two words: *peccatum originale*, *originale peccatum*); in the
    rendering in order, one word allowed between them."""
    ws = words(term)
    if pt and any(w not in optional for w in ws):
        ws = [w for w in ws if w not in optional]
    if not ws or (not pt and all(w in common for w in ws)): return None
    # An ending adds a few letters (*appetibile*, *appetibilibus*); more make
    # another word (*intellectum*, *intellectualibus*).
    part = lambda w: re.escape(stem(w)) + r"[a-z]{0,%d}" % (len(w) - len(stem(w)) + 4) if len(w) > 4 else re.escape(w)
    if pt:
        return re.compile(r"\b" + r"(?:\W+[a-z0-9]+)?\W+".join(map(part, ws)) + r"\b")
    orders = [ws, ws[::-1]] if len(ws) == 2 else [ws]
    return re.compile("|".join(r"\b" + r"\W+".join(map(part, o)) + r"\b" for o in orders))


def clean(cell):
    cell = re.sub(r"\([^)]*\)", " ", cell)
    return re.sub(r"[*“”\"‘’`]", "", cell)


def variants(cell):
    return [v.strip() for v in re.split(r"\s*(?:/|;|\bou\b|\bor\b)\s*", clean(cell)) if len(words(v.strip())) > 0]


def checkable(term):
    """An abbreviation (*Eccle.*, *Is.*) matches other words; it is not checked."""
    return "." not in term


def glossary(book):
    j = book + "/pt-BR/translation-journal.md"
    if not os.path.exists(j): return []
    lines = open(j).read().split("\n## Review log")[0].split("\n")
    rows = []
    for i, l in enumerate(lines):
        if not l.startswith("|") or set(l.strip()) <= set("|-: "): continue
        if i + 1 < len(lines) and set(lines[i + 1].strip()) <= set("|-: ") and lines[i + 1].strip(): continue
        cells = [c.strip() for c in l.strip().strip("|").split("|")]
        if len(cells) < 2 or not cells[0] or not cells[1]: continue
        rows.append(l.strip())
    return rows


headers = {"latim": "la", "ingles": "en-US", "english": "en-US", "espanhol": "es-ES", "spanish": "es-ES",
           "frances": "fr-FR", "french": "fr-FR", "italiano": "it", "italian": "it"}


def journalLang(book):
    """The source language the journal's Key Terms table names in its header,
    or None. The canonical source can have changed since the translation (a
    Latin text imported later), and the table is in the language translated from."""
    j = book + "/pt-BR/translation-journal.md"
    if not os.path.exists(j): return None
    for l in open(j).read().split("\n## Review log")[0].split("\n"):
        m = re.match(r"^\|\s*([^|]+?)\s*\|\s*Portugu", l)
        if m and fold(m.group(1)) in headers:
            code = headers[fold(m.group(1))]
            # Divine Intimacy's Italian lives in it/ or it-IT/.
            if code == "it" and not os.path.isdir(book + "/it"): code = "it-IT"
            return code if os.path.isdir(book + "/" + code) else None
    return None


def pairs(row):
    """[(source term, [renderings])] of a glossary row. A rendering the notes
    quote ("“Argumento” quando designa uma argumentação") is allowed too."""
    cells = [c.strip() for c in row.strip("|").split("|")]
    src, pt = variants(cells[0]), variants(cells[1])
    if not src or not pt: return []
    also = [q.strip() for c in cells[2:] for q in re.findall(r"“([^”]{1,40})”", c)]
    out = list(zip(src, [[p] for p in pt])) if len(src) == len(pt) else [(s, list(pt)) for s in src]
    return [(s, ps + also) for s, ps in out]


def checks(rows):
    """{row: [(source term, source pattern, [rendering patterns])]}. A source
    term in several rows may take any of their renderings."""
    allowed = {}
    for row in rows:
        for s, ps in pairs(row):
            allowed.setdefault(tuple(words(s)), []).extend(ps)
    out = {}
    for row in rows:
        for s, _ in pairs(row):
            ps = allowed[tuple(words(s))]
            # A term kept as it is (a name, a Latin tag) needs no check.
            if any(words(s) == words(p) for p in ps) or not checkable(s): continue
            sp = pattern(s)
            # The stem of the term's longest word, a quick test before the regex.
            key = stem(max(words(s), key=len))
            if sp: out.setdefault(row, []).append((s, sp, [pattern(p, True) for p in ps], key))
    return out


def scan(book):
    """{row: {"seen": n, "miss": [(chapter, para, source term)]}}"""
    rows = glossary(book)
    cs = [(row, c) for row, c_ in checks(rows).items() for c in c_]
    res = {row: {"seen": 0, "miss": []} for row in rows}
    for ch in r2.allChapters(book):
        sp = "%s/%s/%s" % (book, r2.lang(book), ch)
        tp = "%s/pt-BR/%s" % (book, ch)
        if not os.path.exists(tp): continue
        src, tgt = r2.paras(sp), r2.paras(tp)
        if len(src) != len(tgt): continue
        for i, (s, t) in enumerate(zip(src, tgt)):
            fs, ft = " ".join(words(s)), " ".join(words(t))
            for row, (term, spat, ppats, key) in cs:
                if key not in fs or not spat.search(fs): continue
                res[row]["seen"] += 1
                if not any(p and p.search(ft) for p in ppats):
                    res[row]["miss"].append((ch, i + 1, term))
    return res


def flags(book):
    out = []
    for row, r in scan(book).items():
        if r["seen"] < minSeen or not r["miss"]: continue
        if 1 - len(r["miss"]) / r["seen"] < minHit: continue
        out += [(ch, p, term, row) for ch, p, term in r["miss"]]
    return out


def prompt(book, prefix, maxWords):
    by = {}
    for ch, p, term, row in flags(book):
        by.setdefault((ch, p), []).append((term, row))
    order = {c: i for i, c in enumerate(r2.allChapters(book))}
    chunks, cur, n = [], [], 0
    for (ch, p), ts in sorted(by.items(), key=lambda kv: (order[kv[0][0]], kv[0][1])):
        src, tgt = r2.paras("%s/%s/%s" % (book, r2.lang(book), ch)), r2.paras("%s/pt-BR/%s" % (book, ch))
        ts = list(dict.fromkeys(ts))
        block = "### pt-BR/%s [%d]\nTERMS:\n%s\nSRC: %s\nPT: %s" % (ch, p, "\n".join("- *%s* — %s" % (t, row) for t, row in ts), src[p - 1], tgt[p - 1])
        w = len(block.split())
        if cur and n + w > maxWords:
            chunks.append(cur); cur, n = [], 0
        cur.append((block, [row for _, row in ts])); n += w
    if cur: chunks.append(cur)
    index = {r: i for i, r in enumerate(glossary(book))}
    for k, c in enumerate(chunks, 1):
        rows = sorted({r for _, rs in c for r in rs}, key=index.get)
        parts = ["# Term-consistency check", "", "Book: `%s`. Source language: `%s/` (the one it was translated from); target: `pt-BR/`." % (book, r2.lang(book)), "",
                 "## The Key Terms rows in question", "", "\n".join(rows), "",
                 "## The flagged paragraphs (%d)" % len(c), "", "\n\n".join(b for b, _ in c)]
        open("%s-%d.md" % (prefix, k), "w").write("\n".join(parts) + "\n")
    print(len(chunks))


if __name__ == "__main__":
    cmd, a = sys.argv[1], sys.argv[2:]
    if cmd == "scan":
        for row, r in sorted(scan(a[0]).items(), key=lambda kv: -len(kv[1]["miss"])):
            if not r["miss"]: continue
            hit = 1 - len(r["miss"]) / r["seen"]
            print("%4d/%-4d %3.0f%% %s %s" % (len(r["miss"]), r["seen"], 100 * hit, "CHECK" if r["seen"] >= minSeen and hit >= minHit else "     ", row[:140]))
    elif cmd == "lang": print(journalLang(a[0]) or r2.lang(a[0]))
    elif cmd == "prompt": prompt(a[0], a[1], int(a[2]))
