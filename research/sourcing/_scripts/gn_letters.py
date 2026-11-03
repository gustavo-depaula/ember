#!/usr/bin/env python3
"""Build church-fathers/gregory-nazianzen/letters from New Advent's three division pages.

    python3.13 research/sourcing/_scripts/gn_letters.py

Reads research/sourcing/gregory-nazianzen/na/3103{a,b,c}.htm (fetched from newadvent.org/fathers/) and writes one
chapter per <h2> section (a letter, or in Division III a correspondent's
letters), under one toc node per division. The importer that built the other
fathers books took only 3103.htm, the index, because its sub-page pattern
wants digits and these pages end in a letter.
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGES = HERE.parent / "gregory-nazianzen" / "na"
ROOT = HERE.parents[2]
BOOK = ROOT / "content/books/church-fathers/gregory-nazianzen/letters"

spec = importlib.util.spec_from_file_location("fathers", ROOT / "scripts/import-fathers.py")
fathers = importlib.util.module_from_spec(spec)
sys.modules["fathers"] = fathers
spec.loader.exec_module(fathers)

DIVISIONS = [
    ("a", "d1", "Division I. Letters on the Apollinarian Controversy"),
    ("b", "d2", "Division II. Correspondence with St. Basil the Great"),
    ("c", "d3", "Division III. Miscellaneous Letters"),
]


def sections(page: Path) -> list[tuple[str, str]]:
    main = fathers.extract_main(fathers.load_html(page))
    for h1 in main.find_all("h1"):
        h1.decompose()
    md = fathers.html_to_markdown(main)
    parts = re.split(r"^## (.+)$", md, flags=re.M)
    out = []
    for title, body in zip(parts[1::2], parts[2::2]):
        if title.strip() == "About this page":
            break
        title = re.sub(r"^\d+\.\s+", "", title.strip()).rstrip(".")
        body = re.sub(r"^###", "##", body.strip(), flags=re.M)
        out.append((title, body))
    return out


def main() -> None:
    out = BOOK / "en-US"
    for f in out.glob("*.md"):
        f.unlink()
    toc = []
    for suffix, did, dtitle in DIVISIONS:
        children = []
        for i, (title, body) in enumerate(sections(PAGES / f"3103{suffix}.htm"), 1):
            cid = f"{did}-{i:02d}"
            (out / f"{cid}.md").write_text(f"# {title}\n\n{body}\n", encoding="utf-8")
            children.append({"id": cid, "title": {"en-US": title}})
        toc.append({"id": did, "title": {"en-US": dtitle}, "children": children})
    meta_path = BOOK / "book.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["toc"] = toc
    for s in meta["sources"]:
        s["url"] = "https://www.newadvent.org/fathers/3103.htm"
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    n = sum(len(d["children"]) for d in toc)
    words = sum(len(f.read_text(encoding="utf-8").split()) for f in out.glob("*.md"))
    print(f"{n} chapters, {words} words")


if __name__ == "__main__":
    main()
