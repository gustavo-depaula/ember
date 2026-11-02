"""Write book.json: bookjson.write(bookdir, fields, order) -> toc built from each chapter's H1 in every language folder.
order: list of chapter ids (file stems) in reading order."""
import json, re
from pathlib import Path

def h1(p):
    for l in p.read_text(encoding="utf-8").splitlines():
        if l.startswith("# "): return l[2:].strip()
    raise SystemExit(f"no H1 in {p}")

def write(bookdir, fields, order):
    bd = Path(bookdir)
    langs = fields["languages"]
    toc = []
    for cid in order:
        t = {}
        for lg in langs:
            f = bd / lg / f"{cid}.md"
            if f.exists(): t[lg] = h1(f)
        toc.append({"id": cid, "title": t})
    d = dict(fields); d["toc"] = toc
    (bd / "book.json").write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    on_disk = {p.stem for lg in langs for p in (bd / lg).glob("*.md")}
    miss = on_disk - set(order)
    if miss: print("chapters on disk but not in order:", sorted(miss))
    print("wrote", bd / "book.json", len(toc), "chapters")
