"""Toc titles of one part of a long book (run-book2.sh book#scope): the part's
text is translated in t2.py calls that never see the megabyte toc, so its
titles are translated here in one call, after the text, from the en-US/la
titles and the pt-BR headings.

  titles.py prompt <bookdir> <scope> <out>
  titles.py write <bookdir> <scope> <answer>   exits 1 (changes nothing) if a title is missing
"""
import json, os, re, sys


def nodes(ns):
    for n in ns:
        yield n
        yield from nodes(n.get("children", []))


def mine(bj, scope):
    return [n for n in nodes(bj["toc"]) if n.get("id") == scope or n.get("id", "").startswith(scope + "-")]


def head(book, i):
    p = "%s/pt-BR/%s.md" % (book, i)
    if not os.path.exists(p): return ""
    ps = [x.strip() for x in open(p).read().split("\n\n") if x.strip()]
    return " / ".join(ps[:2])[:400]


def prompt(book, scope, out):
    bj = json.load(open(book + "/book.json"))
    lines = ["# Toc titles of part `%s` of `%s`" % (scope, os.path.basename(book)), ""]
    want = [f for f in ("name", "author", "description") if isinstance(bj.get(f), dict) and "pt-BR" not in bj[f]]
    if want:
        lines += ["Also give the book's %s in pt-BR:" % ", ".join("`%s`" % f for f in want), "", "```json", json.dumps({f: bj[f] for f in want}, ensure_ascii=False, indent=1), "```", ""]
    j = book + "/pt-BR/translation-journal.md"
    if os.path.exists(j):
        lines += ["## The journal's terms", "", open(j).read().split("\n## Review log")[0][:20000], ""]
    lines += ["## The nodes", ""]
    for n in mine(bj, scope):
        t = n.get("title", {})
        lines.append("- `%s` | en-US: %s | la: %s%s" % (n["id"], t.get("en-US", ""), t.get("la", ""), (" | pt-BR text: " + head(book, n["id"])) if head(book, n["id"]) else ""))
    open(out, "w").write("\n".join(lines) + "\n")


def write(book, scope, ans):
    t = open(ans).read()
    m = re.findall(r"```(?:json)?\s*(\{.*\})\s*```", t, re.S)
    a = json.loads(m[-1] if m else t[t.find("{"):t.rfind("}") + 1])
    bj = json.load(open(book + "/book.json"))
    ns = mine(bj, scope)
    missing = [n["id"] for n in ns if not str(a.get("titles", {}).get(n["id"], "")).strip()]
    if missing:
        print("titles missing for %d nodes: %s" % (len(missing), ", ".join(missing[:10]))); sys.exit(1)
    for n in ns:
        n.setdefault("title", {})["pt-BR"] = a["titles"][n["id"]].strip()
    for f in ("name", "author", "description"):
        if isinstance(bj.get(f), dict) and "pt-BR" not in bj[f]:
            if not a.get(f): print("no pt-BR %s" % f); sys.exit(1)
            bj[f]["pt-BR"] = a[f].strip()
    open(book + "/book.json", "w").write(json.dumps(bj, ensure_ascii=False, indent=2) + "\n")
    print("%d titles" % len(ns))


cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "prompt": prompt(*a)
elif cmd == "write": write(*a)
