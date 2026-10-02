"""Writes the corpus inventory the `related` curation works from.

Each holy card lists what its page shows (see seed-related.py). Curating those
lists by hand means knowing everything a card could name: every practice, book,
chapter and collection, and every other card. This flattens them into a few
tab-separated files under related/inventory/, one line per item, so a curator
can grep them instead of opening hundreds of manifests.

Run from the repo root:  python3 research/holy-card-faces/related-inventory.py
"""

import glob, json, os

out = "research/holy-card-faces/related/inventory/"
os.makedirs(out, exist_ok=True)


def en(v):
    return (v or {}).get("en-US", "") if isinstance(v, dict) else (v or "")


def pt(v):
    return (v or {}).get("pt-BR", "") if isinstance(v, dict) else ""


def clip(s, n=160):
    s = " ".join(str(s).split())
    return s if len(s) <= n else s[: n - 1] + "…"


def write(name, header, rows):
    with open(out + name, "w") as f:
        f.write("\t".join(header) + "\n")
        for r in rows:
            f.write("\t".join(str(c).replace("\t", " ") for c in r) + "\n")
    print(name, len(rows))


rows = []
for f in sorted(glob.glob("content/practices/saint-of-the-day/data/holy-cards/*.json")):
    c = json.load(open(f))
    feast = f"{c['feast']['month']:02d}-{c['feast']['day']:02d}" if "feast" in c else ""
    rows.append([c["id"], en(c["name"]), pt(c["name"]), c.get("kind", ""), feast, c.get("proper", ""),
                 c.get("lifeChapter", ""), "yes" if "related" in c else "", clip(en(c["patronOf"]), 90)])
write("cards.tsv", ["id", "name", "name_pt", "kind", "feast", "proper", "lifeChapter", "has_related", "patronOf"], rows)

rows = []
for f in sorted(glob.glob("content/practices/*/manifest.json")):
    m = json.load(open(f))
    if m["id"] == "saint-of-the-day":
        continue
    hc = m.get("holyCard", "")
    rows.append([f"practice/{m['id']}", en(m["name"]), pt(m["name"]), ",".join(m.get("categories", [])),
                 ",".join(m.get("tags", [])), ",".join(hc) if isinstance(hc, list) else hc,
                 clip(en(m.get("description")))])
write("practices.tsv", ["ref", "name", "name_pt", "categories", "tags", "holyCard", "description"], rows)

rows = []
for f in sorted(glob.glob("content/books/**/book.json", recursive=True)):
    b = json.load(open(f))
    shelf = f.split("/")[2]
    rows.append([f"book/{b.get('id') or os.path.basename(os.path.dirname(f))}", en(b.get("name")),
                 en(b.get("author")), ",".join(b.get("languages", [])), shelf, clip(en(b.get("description")))])
write("books.tsv", ["ref", "name", "author", "languages", "shelf", "description"], rows)

rows = []
for f in sorted(glob.glob("content/chapters/*/chapter.json")):
    c = json.load(open(f))
    rows.append([f"chapter/{c['id']}", en(c.get("title")), pt(c.get("title")), ",".join(c.get("tags", [])),
                 clip(en(c.get("subtitle")))])
write("chapters.tsv", ["ref", "title", "title_pt", "tags", "subtitle"], rows)

rows = []
for f in sorted(glob.glob("content/collections/*.json")):
    c = json.load(open(f))
    items = [b["ref"] for s in c.get("sections", []) for b in s.get("blocks", []) if b.get("kind") == "item"]
    rows.append([c["id"] if c["id"].startswith("collection/") else f"collection/{c['id']}", en(c.get("name")), ",".join(c.get("tags", [])), len(items),
                 clip(en(c.get("description"))), " ".join(items)])
write("collections.tsv", ["ref", "name", "tags", "items", "description", "item_refs"], rows)
