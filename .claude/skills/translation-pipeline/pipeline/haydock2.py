"""Haydock's commentary through the book pipeline (run-book2.sh).

The commentary is not a book: it is notes keyed by chapter and verse in
content/bible/haydock/<bible book>.json. `export` lays a group of Bible books
out as a working book under content/books/_haydock/<group>/ (never committed:
.git/info/exclude), one paragraph per note, so the pipeline's paragraph-for-
paragraph checks hold every note to exactly one translation. `import` turns
the reviewed pt-BR back into content/bible/haydock/pt-BR/<bible book>.json.

A Bible book's introduction (intros.json) is the file `bNN-<book>-a000.md`,
its paragraphs keyed `⟦intro #<n>⟧`; `intro:<book>` exports the introduction
alone, for a book whose notes are already translated (the Gospels).

Each paragraph opens with the note's key, `⟦<chapter>:<verses> #<n>⟧`, and the
first note on a verse adds the verse in the Matos Soares Bible, `⟨MS …⟩`, the
Portuguese Bible the note is read under. Both are copied unchanged into the
translation (translation-conventions.md) and stripped on import.

  haydock2.py export <group> <bible book|intro:bible book>...   writes the working book
  haydock2.py import <group>                   writes the pt-BR JSON of each of its
                                               Bible books (and their introductions
                                               into pt-BR/intros.json) and prints the paths;
                                               exits 1 and prints why if anything is off

Run from the worktree root (ROOT).
"""
import glob, json, os, re, shutil, sys

here = os.path.dirname(os.path.abspath(__file__))
apparatus = re.compile(r"\{[^{}]*\|\}")
head = re.compile(r"^⟦(\d+):([\d-]+) #(\d+)⟧ (?:⟨MS [^⟩]*⟩ )?")


def span(verses):
    a, _, b = verses.partition("-")
    return int(a), int(b or a)


def notesOf(bible):
    d = json.load(open("content/bible/haydock/%s.json" % bible))
    return d, [(c, v, i, n) for c in sorted(d, key=int) for v in sorted(d[c], key=span) for i, n in enumerate(d[c][v], 1)]


def label(bibles):
    names = json.load(open(here + "/haydock-names.json"))
    return " and ".join([", ".join(names[b] for b in bibles[:-1]), names[bibles[-1]]] if len(bibles) > 1 else [names[bibles[0]]])


def export(group, bibles):
    book = "content/books/_haydock/" + group
    shutil.rmtree(book, ignore_errors=True)
    os.makedirs(book + "/en-US")
    toc = []
    intros = json.load(open("content/bible/haydock/intros.json"))
    names = json.load(open(here + "/haydock-names.json"))
    for k, item in enumerate(bibles, 1):
        bible = item.removeprefix("intro:")
        if intros.get(bible):
            fid = "b%02d-%s-a000" % (k, bible)
            ps = ["⟦intro #%d⟧ %s" % (i, re.sub(r"\s+", " ", t).strip()) for i, t in enumerate(intros[bible], 1)]
            open("%s/en-US/%s.md" % (book, fid), "w").write("\n\n".join(ps) + "\n")
            toc.append({"id": fid, "title": {"en-US": "Introduction to %s" % names[bible]}})
        if item.startswith("intro:"):
            continue
        _, notes = notesOf(bible)
        ms = json.load(open("content/bible/matos-soares/%s.json" % bible))
        for c in sorted({c for c, _, _, _ in notes}, key=int):
            out = []
            for _, v, i, n in [x for x in notes if x[0] == c]:
                verse = ""
                if i == 1 and v != "0":
                    a, b = span(v)
                    text = " ".join(ms.get(c, {}).get(str(x), "") for x in range(a, b + 1)).strip()
                    if text:
                        verse = "⟨MS %s:%s: %s⟩ " % (c, v, re.sub(r"\s+", " ", text))
                out.append("⟦%s:%s #%d⟧ %s%s" % (c, v, i, verse, re.sub(r"\s+", " ", n).strip()))
            fid = "b%02d-%s-c%03d" % (k, bible, int(c))
            open("%s/en-US/%s.md" % (book, fid), "w").write("\n\n".join(out) + "\n")
            toc.append({"id": fid, "title": {"en-US": "%s %s" % (names[bible], c)}})
    name = label([b for b in bibles if not b.startswith("intro:")] or [b.removeprefix("intro:") for b in bibles])
    title = ("Haydock's introductions to " if all(b.startswith("intro:") for b in bibles) else "Haydock on ") + name
    bj = {"id": "book/_haydock-" + group, "name": {"en-US": title}, "author": {"en-US": "George Leo Haydock"},
          "languages": ["en-US"], "haydock": bibles, "toc": toc}
    open(book + "/book.json", "w").write(json.dumps(bj, ensure_ascii=False, indent=2) + "\n")
    shutil.copy(here + "/haydock-conventions.md", book + "/translation-conventions.md")
    print("%s: %d files, %d words" % (book, len(toc), sum(len(open(f).read().split()) for f in glob.glob(book + "/en-US/*.md"))))


def voices(s):
    return len(re.split(r"\s+—\s+", apparatus.sub("", s)))


def importGroup(group):
    book = "content/books/_haydock/" + group
    bj = json.load(open(book + "/book.json"))
    bad, outputs = [], {}
    srcIntros = json.load(open("content/bible/haydock/intros.json"))
    introsPath = "content/bible/haydock/pt-BR/intros.json"
    ptIntros = json.load(open(introsPath)) if os.path.exists(introsPath) else {}
    for k, item in enumerate(bj["haydock"], 1):
        bible = item.removeprefix("intro:")
        # A book's paragraphs are told apart by their keys, not their files:
        # groups exported before the introduction had a file of its own
        # (`-a000`) kept it in `-c000`, the file a chapter 0 (a title note in
        # Proverbs, Canticles, Ecclesiasticus, Lamentations, Baruch) also takes,
        # and there the notes overwrote it.
        def paragraphs(lang):
            out = []
            for f in sorted(glob.glob("%s/%s/b%02d-%s-[ac]*.md" % (book, lang, k, bible))):
                ps = [p.strip() for p in open(f).read().split("\n\n") if p.strip()]
                if lang == "pt-BR":
                    bad.extend("%s: a translator's note (the JSON has no place for one)" % os.path.basename(f) for p in ps if p.startswith("[^"))
                out += [p for p in ps if not p.startswith("[^")]
            return out
        src, pt = paragraphs("en-US"), paragraphs("pt-BR")
        isIntro = lambda p: p.startswith("⟦intro #")
        # An introduction the group's source lost is translated by a later group.
        if srcIntros.get(bible) and any(isIntro(p) for p in src):
            ps = [p for p in pt if isIntro(p)]
            keyed = [re.match(r"^⟦intro #(\d+)⟧ ", p) for p in ps]
            if len(ps) != len(srcIntros[bible]) or any(not m or int(m.group(1)) != i for i, m in enumerate(keyed, 1)):
                bad.append("%s: the introduction's paragraphs do not match the source's %d keyed ⟦intro #n⟧" % (bible, len(srcIntros[bible])))
            else:
                ptIntros[bible] = [p[m.end():].strip() for p, m in zip(ps, keyed)]
        if item.startswith("intro:"):
            continue
        d, notes = notesOf(bible)
        got = [p for p in pt if not isIntro(p)]
        if len(got) != len(notes):
            bad.append("%s: %d notes in pt-BR for %d" % (bible, len(got), len(notes))); continue
        result = {}
        for (c, v, i, n), p in zip(notes, got):
            key = "%s:%s #%d" % (c, v, i)
            m = head.match(p)
            if not m or (m.group(1), m.group(2), int(m.group(3))) != (c, v, i):
                bad.append("%s %s: the paragraph does not open with its key ⟦%s⟧" % (bible, key, key)); continue
            y = p[m.end():].strip()
            if "⟦" in y or "⟨MS" in y:
                bad.append("%s %s: a key or verse marker inside the note" % (bible, key))
            if apparatus.findall(n) != apparatus.findall(y):
                bad.append("%s %s: the {…|} apparatus blocks differ from the source's" % (bible, key))
            if voices(n) != voices(y):
                bad.append("%s %s: %d “ — ” voices in the source, %d in pt-BR" % (bible, key, voices(n), voices(y)))
            result.setdefault(c, {}).setdefault(v, []).append(y)
        if not bad:
            # Same key order as the English file, so the two diff side by side.
            outputs["content/bible/haydock/pt-BR/%s.json" % bible] = {c: {v: result[c][v] for v in d[c]} for c in d}
    if bad:
        print("\n".join(bad)); sys.exit(1)
    if any(b.removeprefix("intro:") in ptIntros for b in bj["haydock"]):
        # In the English file's book order.
        outputs[introsPath] = {b: ptIntros[b] for b in srcIntros if b in ptIntros}
    for path, data in outputs.items():
        json.dump(data, open(path, "w"), ensure_ascii=False, separators=(",", ":"))
    print("\n".join(outputs))


cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "export": export(a[0], a[1:])
elif cmd == "import": importGroup(a[0])
