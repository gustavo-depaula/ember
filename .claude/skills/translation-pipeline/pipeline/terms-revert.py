"""Undoes the term-check fixes that made the reading worse.

The first term-check runs (Nov 12-13, 2026) fixed every rendering that drifted
from the Key Terms table, including a plain word swapped for the table's
stiffer one ("enganos" → "dolos"). terms.system.md now leaves those alone;
this puts back the ones already committed. The model reads only the saved fix
lists (old text, new text, reason), not the book.

  terms-revert.py prompt <rundir> <outprefix> <maxFixes>
        writes the user messages (system prompt terms-revert.system.md),
        <outprefix>-1.md, -2.md, …; prints how many
  terms-revert.py apply <bookdir> <rundir> <answer>…
        puts back the original text of each fix the answers name, where the
        fixed text still stands once in its paragraph; prints the counts
"""
import glob, json, os, re, sys
import r2


def fixes(run):
    """{id: fix} of the check rounds' text fixes (the glossary's are kept)."""
    out = {}
    for f in sorted(glob.glob(run + "/c-*/changes-1.json")):
        c = re.search(r"/c-(\d+)/", f).group(1)
        for i, x in enumerate(json.load(open(f))["fixes"], 1):
            if x["file"].startswith("pt-BR/") and not x["file"].endswith("translation-journal.md"):
                out["c%s-%d" % (c, i)] = x
    return out


def prompt(run, prefix, maxFixes):
    fs = list(fixes(run).items())
    chunks = [fs[i:i + maxFixes] for i in range(0, len(fs), maxFixes)] or []
    for k, c in enumerate(chunks, 1):
        lines = ["- `%s` %s: «%s» → «%s» — %s" % (i, x.get("class", "?"), x["old"], x["new"], x.get("why", "")) for i, x in c]
        open("%s-%d.md" % (prefix, k), "w").write("# Fixes to judge (%d)\n\n%s\n" % (len(c), "\n".join(lines)))
    print(len(chunks))


def answer(path):
    t = open(path).read()
    for cand in reversed(re.findall(r"```(?:json)?\s*(\{.*?\})\s*```", t, re.S) or [t[t.find("{"):t.rfind("}") + 1]]):
        try:
            return json.loads(cand)
        except Exception:
            continue
    raise ValueError("no JSON object in " + path)


def apply(book, run, answers):
    fs = fixes(run)
    want = [i for a in answers for i in answer(a).get("revert", [])]
    done, gone = [], []
    for i in dict.fromkeys(want):
        x = fs.get(i)
        if not x: continue
        path = "%s/%s" % (book, x["file"])
        t = open(path).read()
        bs = r2.blocks(t)
        p = x.get("para")
        a, b = bs[p - 1] if p and p <= len(bs) else (0, len(t))
        seg = t[a:b]
        # Later rounds may have changed the span again; then it stays as it is.
        if seg.count(x["new"]) != 1:
            gone.append(i); continue
        seg = seg.replace(x["new"], x["old"])
        open(path, "w").write(t[:a] + seg + t[b:])
        done.append(i)
    json.dump({"reverted": done, "notFound": gone}, open(run + "/revert.json", "w"), indent=1)
    print("judged=%d marked=%d reverted=%d notFound=%d" % (len(fs), len(set(want)), len(done), len(gone)))


if __name__ == "__main__":
    cmd, a = sys.argv[1], sys.argv[2:]
    if cmd == "prompt": prompt(a[0], a[1], int(a[2]))
    elif cmd == "apply": apply(a[0], a[1], a[2:])
