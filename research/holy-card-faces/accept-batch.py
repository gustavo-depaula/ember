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
        "feast": c["feast"],
        "name": c["name"],
        "patronOf": c["patronOf"],
        "prayerExcerpt": c["prayerExcerpt"],
        "meta": {
            "face": c["face"],
            "basis": c["basis"],
            "excerpt": c["excerptSource"],
            "sources": c["sources"],
            "history": [{"date": date, "note": notes.get(cid, f"New card, generated with new-card.sh from {batch['dossier']}.")}],
        },
    }
    (cards_dir / f"{cid}.json").write_text(json.dumps(card, ensure_ascii=False, indent=2) + "\n")
    hits = [i for i, l in enumerate(lines) if l.startswith("- [ ]") and c["catalogMatch"] in l]
    if len(hits) != 1:
        sys.exit(f"{cid}: catalogMatch {c['catalogMatch']!r} matched {len(hits)} unticked lines")
    lines[hits[0]] = "- [x]" + lines[hits[0]][5:] + f" — `{cid}`"

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
