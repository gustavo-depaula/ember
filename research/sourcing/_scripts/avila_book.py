"""Write book.json for an Ávila book from its chapter files (titles = H1)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from emberlib import AVILA_AUTHOR

def build(bookdir, meta, langs, order=None):
    bookdir = Path(bookdir)
    ids = order or sorted(p.stem for p in (bookdir / langs[0]).glob("*.md"))
    toc = []
    for cid in ids:
        t = {}
        for lg in langs:
            f = bookdir / lg / (cid + ".md")
            if f.exists():
                t[lg] = f.read_text(encoding="utf-8").split("\n", 1)[0][2:].strip()
        toc.append({"id": cid, "title": t})
    m = {"id": meta["id"], "cover": "quarter", "name": meta["name"], "author": AVILA_AUTHOR,
         "description": meta["description"], "composed": meta["composed"], "languages": langs,
         "work": meta["work"], "editions": meta["editions"], "sources": meta["sources"], "toc": toc}
    (bookdir / "book.json").write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
