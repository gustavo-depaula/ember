#!/usr/bin/env python3 -I
"""Write book.json from a spec json (see /tmp/chest/*.book.json) and the split config."""
import json, re, sys
from pathlib import Path
spec = json.load(open(sys.argv[1])); cfg = json.load(open(sys.argv[2]))
d = Path(cfg["out"]).parent
toc = []
for ch in cfg["chapters"]:
    node = {"id": ch["id"], "title": {"en-US": ch["title"]}}
    g = ch.get("part")
    if not g:
        toc.append(node); continue
    if not toc or toc[-1]["id"] != g["id"]:
        toc.append({"id": g["id"], "title": {"en-US": g["title"]}, "children": []})
    toc[-1]["children"].append(node)
book = {
 "id": spec["id"], "cover": "classic",
 "name": {"en-US": spec["name"], "pt-BR": spec["name_pt"]},
 "author": {"en-US": "G. K. Chesterton", "pt-BR": "G. K. Chesterton"},
 "description": {"en-US": spec["desc"], "pt-BR": spec["desc_pt"]},
 "composed": str(spec["year"]), "languages": ["en-US"],
 "work": "chesterton/" + d.name,
 "editions": {"en-US": spec["edition"]},
 "sources": spec["sources"], "toc": toc}
(d / "book.json").write_text(json.dumps(book, indent=2, ensure_ascii=False) + "\n")
