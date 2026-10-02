"""Applies curated `related` lists to the holy cards, checking them first.

The curation (see related/README.md) writes one proposal file per batch,
related/batch-*.json, mapping a card id to the `related` its page should show.
This checks every ref against the corpus the way build-corpus.py does, drops a
card link the other card already makes (the app shows a link from both sides),
and writes each list into its card, before the provenance trail. A card that
already has a list is left alone unless --replace is given.

Run from the repo root:
  python3 research/holy-card-faces/apply-related.py related/batch-03.json [--check] [--replace]
"""

import glob, json, os, sys

root = "research/holy-card-faces/"
cards_dir = "content/practices/saint-of-the-day/data/holy-cards/"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
check_only = "--check" in sys.argv
replace = "--replace" in sys.argv

practices = {os.path.basename(os.path.dirname(f)) for f in glob.glob("content/practices/*/manifest.json")}
collections = {os.path.basename(f)[:-5] for f in glob.glob("content/collections/*.json")}
chapters = {os.path.basename(os.path.dirname(f)) for f in glob.glob("content/chapters/*/chapter.json")}
books = set()
for f in glob.glob("content/books/**/book.json", recursive=True):
    books.add(json.load(open(f)).get("id") or os.path.basename(os.path.dirname(f)))
known = {"practice": practices, "collection": collections, "chapter": chapters, "book": books}

cards = {}
for f in glob.glob(cards_dir + "*.json"):
    c = json.load(open(f))
    cards[c["id"]] = c


def ref_ok(ref):
    kind, _, rid = ref.partition("/")
    return rid in known.get(kind, ())


def links_of(cid):
    return set(cards[cid].get("related", {}).get("cards", []))


problems = []
proposal = {}
for path in args:
    p = path if os.path.exists(path) else root + path
    for cid, rel in json.load(open(p)).items():
        if cid in proposal:
            problems.append(f"{cid}: proposed twice")
        proposal[cid] = rel

for cid, rel in proposal.items():
    if cid not in cards:
        problems.append(f"{cid}: no such card")
        continue
    unknown = set(rel) - {"pray", "read", "collections", "cards"}
    if unknown:
        problems.append(f"{cid}: unknown keys {sorted(unknown)}")
    for kind in ("pray", "read"):
        groups = rel.get(kind, [])
        for g in groups:
            if set(g) - {"title", "refs"} or not g.get("refs"):
                problems.append(f"{cid}: malformed {kind} group {g}")
            if len(groups) > 1 and not g.get("title"):
                problems.append(f"{cid}: {kind} has several groups, one untitled")
            if g.get("title") and set(g["title"]) != {"en-US", "pt-BR"}:
                problems.append(f"{cid}: {kind} title needs en-US and pt-BR: {g['title']}")
            for r in g.get("refs", []):
                if not ref_ok(r):
                    problems.append(f"{cid}: {r} is not in the corpus")
                if kind == "pray" and not r.startswith("practice/"):
                    problems.append(f"{cid}: pray names {r}, not a practice")
                if kind == "read" and r.startswith("practice/"):
                    problems.append(f"{cid}: read names practice {r}")
    for r in rel.get("collections", []):
        if not ref_ok(r) or not r.startswith("collection/"):
            problems.append(f"{cid}: collection {r} is not in the corpus")
    for other in rel.get("cards", []):
        if other not in cards or other == cid:
            problems.append(f"{cid}: card {other} is not another card")

if problems:
    print("\n".join(problems))
    raise SystemExit(f"{len(problems)} problems; nothing written")

written = skipped = 0
for cid, rel in sorted(proposal.items()):
    card = cards[cid]
    if "related" in card and not replace:
        skipped += 1
        continue
    # A link the other card already makes would show twice.
    others = [o for o in rel.get("cards", []) if cid not in links_of(o)]
    rel = {**rel, "cards": others} if others else {k: v for k, v in rel.items() if k != "cards"}
    rel = {k: rel[k] for k in ("pray", "read", "collections", "cards") if rel.get(k)}
    if not rel:
        continue
    if check_only:
        written += 1
        continue
    meta = card.pop("meta", None)
    card.pop("related", None)
    card["related"] = rel
    if meta is not None:
        card["meta"] = meta
    open(cards_dir + cid + ".json", "w").write(json.dumps(card, ensure_ascii=False, indent=2) + "\n")
    written += 1
print(f"{'would write' if check_only else 'written'}: {written}, skipped (already curated): {skipped}")
