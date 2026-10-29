"""First extraction: Lírio Católico's Mass times against the Catholic Mass Times scrape both
directories were seeded from.

  python3 extract.py <lirio horario_missa dir> <cmt churches.jsonl> <cmt mapping.jsonl> <out dir>

Lírio re-keyed every church to an integer id, so the two are joined on coordinates (4 dp, the
precision his import kept), with the name breaking the rare tie. Writes:
  lirio-map.jsonl   {lirioId, sourceId, emberId}  — the join the weekly diff keys on
  report.jsonl      one line per Lírio church: category + both schedules
"""

import collections
import glob
import json
import re
import sys
import unicodedata
from pathlib import Path

lirioDir, cmtPath, mappingPath, outDir = map(Path, sys.argv[1:5])
outDir.mkdir(parents=True, exist_ok=True)

lirio = [c for f in sorted(glob.glob(str(lirioDir / "uf/*.json"))) for c in json.load(open(f))]
cmt = {c["id"]: c for c in map(json.loads, open(cmtPath)) if c["id"].startswith("BR")}
emberId = {m["sourceId"]: m["id"] for m in map(json.loads, open(mappingPath))}

byPoint = collections.defaultdict(list)
for c in cmt.values():
    byPoint[(round(c["lat"], 4), round(c["lng"], 4))].append(c)

def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]", "", s)

letters, days = "UMTWHFS", ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

# The source's year-round weekly Mass rows, in Lírio's shape (day → times). Monthly, seasonal
# and dated rows have no place in his model, so they are counted, not compared.
def weeklyGrid(c):
    grid, other = collections.defaultdict(set), 0
    for s in c.get("ss", []):
        if s["e"] != "mass":
            continue
        # The scrape carries `st`/`df`/`dt` as numbers on some rows and strings on others.
        if s.get("f") != "weekly" or str(s.get("df", 101)) != "101" or str(s.get("dt", 1231)) != "1231":
            other += 1
            continue
        t = str(s["st"]).zfill(4)
        for d in s["d"]:
            if d in letters:
                grid[days[letters.index(d)]].add(f"{t[:2]}:{t[2:]}")
    return {k: sorted(v) for k, v in grid.items()}, other

def pairs(grid):
    return {(d, t) for d, ts in grid.items() for t in ts}

def category(src, his):
    if src == his:
        return "same"
    if not src:
        return "he_structured_text"  # source had only free text; he parsed it into a grid
    if not his:
        return "he_dropped_schedule"
    a, b = pairs(src), pairs(his)
    return "he_added_times" if a < b else "he_removed_times" if b < a else "schedule_changed"

def handEdited(c):
    # His bulk import is stamped with the bare date; an edit stamps a full ISO timestamp.
    return "T" in c.get("atualizado", "")

counts = collections.Counter()
with open(outDir / "lirio-map.jsonl", "w") as mapOut, open(outDir / "report.jsonl", "w") as rep:
    for c in lirio:
        cands = byPoint.get((round(c["lat"], 4), round(c["lng"], 4)), []) if "lat" in c else []
        if len(cands) > 1:
            cands = [x for x in cands if norm(x["n"]) == norm(c["nome"]) or norm(x.get("ln")) == norm(c["nome"])] or cands
        src = cands[0] if cands else None
        his = {k: sorted(v) for k, v in c.get("missas", {}).items()}
        if src is None:
            cat, grid, other = ("new_church" if handEdited(c) else "unmatched"), {}, 0
        else:
            grid, other = weeklyGrid(src)
            cat = category(grid, his)
            mapOut.write(json.dumps({"lirioId": c["id"], "sourceId": src["id"], "emberId": emberId.get(src["id"])}, ensure_ascii=False) + "\n")
        key = cat + (" (hand-edited)" if handEdited(c) else "")
        counts[key] += 1
        renamed = src is not None and norm(c["nome"]) not in (norm(src["n"]), norm(src.get("ln")))
        rep.write(json.dumps({
            "category": cat, "handEdited": handEdited(c), "renamed": renamed,
            "lirioId": c["id"], "sourceId": src and src["id"], "emberId": src and emberId.get(src["id"]),
            "name": c["nome"], "sourceName": src and src.get("ln", src["n"]),
            "his": his, "source": grid, "sourceOtherRows": other,
            "sourceText": src and src.get("mt"), "lirio": c,
        }, ensure_ascii=False) + "\n")

matched = sum(1 for _ in open(outDir / "lirio-map.jsonl"))
print(f"{len(lirio)} Lírio churches, {matched} joined to the source, {len(cmt) - matched} source BR churches he lacks")
for k, v in counts.most_common():
    print(f"{v:6}  {k}")
