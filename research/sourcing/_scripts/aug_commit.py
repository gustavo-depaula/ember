"""Commit each Augustine book on its own (la/ + book.json). usage: aug_commit.py name..."""
import glob, os, subprocess, sys, time
sys.path.insert(0, os.path.dirname(__file__))
import aug_build as B

def git(*a):
    for i in range(6):
        r = subprocess.run(["git", *a], cwd=B.ROOT, capture_output=True, text=True)
        if r.returncode == 0 or "index.lock" not in r.stderr:
            return r
        time.sleep(3 * (i + 1))
    return r

for name in sys.argv[1:]:
    bd = os.path.join("content", "books", "church-fathers", "augustine", name)
    words = sum(len(open(f, encoding="utf-8").read().split()) for f in glob.glob(os.path.join(B.ROOT, bd, "la", "*.md")))
    sp = B.SPECS[name]
    extra = ["research/sourcing/_scripts/aug_la.py", "research/sourcing/_scripts/aug_build.py", "research/sourcing/_scripts/aug_commit.py"] if name == "city-of-god" else []
    msg = (f"Add Latin to Augustine's {sp['la']} (la)\n\nMaurist/PL text from augustinus.it ({sp['dir']}), tier A, same chapter files as the NPNF English; "
           f"{words} Latin words. NBA headings and notes dropped. Built by research/sourcing/_scripts/aug_build.py.")
    git("add", "--", bd, *extra)
    r = git("commit", "-q", "-m", msg, "--", bd, *extra)
    sha = git("rev-parse", "--short", "HEAD").stdout.strip()
    print(name, words, sha, r.returncode, r.stderr.strip()[:100])
