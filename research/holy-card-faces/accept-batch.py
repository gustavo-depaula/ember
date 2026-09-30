# Accept a batch's reviewed drafts: copy them to content/saints/, write each card's data file
# (with its meta trail), tick the catalog, and mark the latest log entry of each card kept.
# Usage (repo root): python3 research/holy-card-faces/accept-batch.py batches/batch-N.json [history note per id as id=note ...]
import json
import shutil
import sys
from pathlib import Path

dir = Path("research/holy-card-faces")
batch = json.loads((dir / sys.argv[1]).read_text())
notes = dict(a.split("=", 1) for a in sys.argv[2:])
cards_dir = Path("content/practices/saint-of-the-day/data/holy-cards")
catalog = Path("docs/plans/holy-cards-catalog.md")
lines = catalog.read_text().split("\n")
date = batch["date"]

for c in batch["cards"]:
    cid = c["id"]
    draft = dir / "drafts" / f"{cid}.png"
    if not draft.exists():
        sys.exit(f"missing draft for {cid}")
    shutil.copyfile(draft, f"content/saints/{cid}.png")
    card = {
        "id": cid,
        **({"feast": c["feast"]} if "feast" in c else {}),
        "name": c["name"],
        "patronOf": c["patronOf"],
        "prayerExcerpt": c["prayerExcerpt"],
        **({"lifeChapter": c["lifeChapter"]} if "lifeChapter" in c else {}),
        **({"proper": c["proper"]} if "proper" in c else {}),
        "meta": {
            "face": c.get("face", "-"),
            "basis": c["basis"],
            "excerpt": c["excerptSource"],
            "sources": c["sources"],
            "history": [{"date": date, "note": notes.get(cid, f"New card, generated with new-card.sh from {batch['dossier']}.")}],
        },
    }
    (cards_dir / f"{cid}.json").write_text(json.dumps(card, ensure_ascii=False, indent=2) + "\n")
    # A list line holds one card; an inline line ("[ ] Advent — Sunday · [ ] Advent — weekday") holds several,
    # and there catalogMatch is the item's text right after its box.
    item = "[ ] " + c["catalogMatch"]
    # An item on an inline line wins: "Sanctus" is also a word of a list line (Sts. Pothinus, Sanctus, …).
    # The item ends at a separator, so "Gospel" doesn't take "Gospel Acclamation".
    def ends(rest):
        return rest == "" or rest.startswith((" ·", " —", ";", ","))
    inline = [i for i, l in enumerate(lines) if l.count("[ ]") > 1 and any(
        ends(l[k + len(item):]) for k in range(len(l)) if l.startswith(item, k))]
    hits = inline or [i for i, l in enumerate(lines) if (l.startswith("- [ ]") and l.count("[ ]") == 1 and c["catalogMatch"] in l) or item in l]
    if len(hits) != 1:
        sys.exit(f"{cid}: catalogMatch {c['catalogMatch']!r} matched {len(hits)} unticked lines")
    line = lines[hits[0]]
    if item in line:
        start = line.index(item)
        end = line.find(" · [", start)
        end = len(line) if end == -1 else end
        lines[hits[0]] = line[:start] + "[x]" + line[start + 3:end] + f" — `{cid}`" + line[end:]
    else:
        lines[hits[0]] = "- [x]" + line[5:] + f" — `{cid}`"

    # Rosary mysteries that share a feast's card ("[ ] The Resurrection — shares Easter Sunday") tick with it.
    for also in c.get("alsoTicks", []):
        item = "[ ] " + also
        hit = [i for i, l in enumerate(lines) if item in l]
        if len(hit) != 1:
            sys.exit(f"{cid}: alsoTicks {also!r} matched {len(hit)} lines")
        l = lines[hit[0]]
        start = l.index(item)
        end = l.find(" · [", start)
        end = len(l) if end == -1 else end
        lines[hit[0]] = l[:start] + "[x]" + l[start + 3:end] + f" — `{cid}`" + l[end:]

catalog.write_text("\n".join(lines))

log = dir / "log.jsonl"
entries = [json.loads(l) for l in log.read_text().splitlines()]
ids = {c["id"] for c in batch["cards"]}
latest = {}
for i, e in enumerate(entries):
    if e["card"] in ids and e.get("kind") == "generate":
        latest[e["card"]] = i
for i, e in enumerate(entries):
    if e["card"] in ids and e.get("kind") == "generate" and "verdict" not in e:
        e["verdict"] = "kept" if latest[e["card"]] == i else "rejected"
log.write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in entries))
print(f"accepted {len(ids)} cards")
