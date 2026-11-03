#!/usr/bin/env python3 -I
"""Write chesterton_specs/<slug>.json from the table in this file (edit the table, rerun)."""
import json, sys
from pathlib import Path
out = Path(__file__).parent / "chesterton_specs"
def mk(slug, pg, year, name, name_pt, desc, desc_pt, head=None, ed="", edy=None, note=None, **kw):
    d = {"slug": slug, "id": "chesterton-" + slug, "pg": pg, "year": year, "name": name, "name_pt": name_pt, "desc": desc, "desc_pt": desc_pt,
         "edition": {"editor": ed or "First edition", "year": edy or year},
         "url": f"https://www.gutenberg.org/ebooks/{pg}", "edition_note": note or f"{name} ({ed or 'first edition'}, {edy or year}), Project Gutenberg #{pg}.",
         "head": head or "^$^"}
    d.update(kw)
    (out / f"{slug}.json").write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
exec(open(Path(__file__).parent / "chesterton_table.py").read())
