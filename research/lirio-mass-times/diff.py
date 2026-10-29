"""What Lírio Católico changed, as proposals against our directory.

  python3 diff.py --first  <lirio dir> <cmt churches.jsonl> <lirio-map.jsonl> <out dir> [<older cmt snapshot>...]
  python3 diff.py --weekly <previous lirio dir> <lirio dir> <lirio-map.jsonl> <out dir>

--first   his hand edits since his bulk import, each against the source record he started from. He
          copied the source somewhere between our scrapes, so pass the older snapshots too: a change
          is his only if it holds against every copy (else the source moved, not him).
--weekly  every record whose `atualizado` moved since the previous download, against that download.

His model is one grid of weekday → times per kind and can't say "first Friday of the month", so a
proposal carries only his *changes* — the times he added or removed — never his whole grid. A time
he removed is matched to our weekly rule on that day; a monthly or seasonal Mass of ours is
something his grid never held, so nothing he does can remove it.

Writes proposals.jsonl (one church per line) and proposals.md (the same, to read on the desk).
"""

import collections
import glob
import gzip
import json
import sys
from pathlib import Path

mode = sys.argv[1]
if mode not in ("--first", "--weekly"):
    sys.exit(__doc__)
a, b, mapPath, outDir = map(Path, sys.argv[2:6])
outDir.mkdir(parents=True, exist_ok=True)

def loadLirio(d):
    return {c["id"]: c for f in sorted(glob.glob(str(d / "uf/*.json"))) for c in json.load(open(f))}

join = {m["lirioId"]: m for m in map(json.loads, open(mapPath))}
kinds = {"missas": "mass", "confissoes": "confession", "adoracao": "adoration"}
fields = {"nome": "name", "endereco": "address", "cep": "postalCode", "telefones": "phone",
          "site": "website", "instagram": "instagram", "paroco": "pastor",
          "observacoes": "info", "eventos": "events"}
letters, days = "UMTWHFS", ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

# A source record in Lírio's shape: what he imported, as near as the scrape can say.
def asLirio(c):
    grid = {k: collections.defaultdict(set) for k in kinds.values()}
    for s in c.get("ss", []):
        if s["e"] not in grid or s.get("f") != "weekly":
            continue
        if str(s.get("df", 101)) != "101" or str(s.get("dt", 1231)) != "1231":
            continue
        t = str(s["st"]).zfill(4)
        start = f"{t[:2]}:{t[2:]}"
        if s.get("et"):
            e = str(s["et"]).zfill(4)
            start += f"–{e[:2]}:{e[2:]}"
        for d in s["d"]:
            if d in letters:
                grid[s["e"]][days[letters.index(d)]].add(start)
    out = {"nome": c.get("ln") or c["n"], "endereco": c.get("ad"), "lat": c["lat"], "lng": c["lng"],
           "telefones": [c["te"]] if c.get("te") else None, "site": c.get("w"), "observacoes": c.get("i")}
    for key, kind in kinds.items():
        if grid[kind]:
            out[key] = {d: sorted(ts) for d, ts in grid[kind].items()}
    return out

def slots(grid):
    return {(d, t) for d, ts in (grid or {}).items() for t in ts}

# Formatting isn't a change: phones compare as national digits, everything else by its words.
def comparable(key, v):
    if not v:
        return None
    if key == "telefones":
        return sorted({"".join(ch for ch in t if ch.isdigit()).removeprefix("55") for t in v})
    return " ".join(str(v).split()).lower() if isinstance(v, str) else v

def delta(before, after):
    changes = []
    for key, name in fields.items():
        if comparable(key, before.get(key)) == comparable(key, after.get(key)):
            continue
        x, y = before.get(key) or None, after.get(key) or None
        changes.append({"field": name, "before": x, "after": y})
    if before.get("lat") is not None and after.get("lat") is not None:
        moved = abs(before["lat"] - after["lat"]) + abs(before["lng"] - after["lng"])
        if moved > 0.0005:  # ~50 m; his edits round coordinates differently
            changes.append({"field": "location", "before": [before["lat"], before["lng"]],
                            "after": [after["lat"], after["lng"]]})
    for key, kind in kinds.items():
        x, y = slots(before.get(key)), slots(after.get(key))
        for d, t in sorted(y - x):
            changes.append({"kind": kind, "add": {"day": d, "time": t}})
        for d, t in sorted(x - y):
            changes.append({"kind": kind, "remove": {"day": d, "time": t}})
    return changes

proposals = []
if mode == "--first":
    def loadSource(path):
        lines = gzip.open(path, "rt") if str(path).endswith(".gz") else open(path)
        return {c["id"]: c for c in map(json.loads, lines) if c["id"].startswith("BR")}
    lirio, source = loadLirio(a), loadSource(b)
    older = [loadSource(p) for p in sys.argv[6:]]
    for c in lirio.values():
        if "T" not in c.get("atualizado", ""):
            continue  # his bulk import stamps a bare date; an edit stamps a full timestamp
        j = join.get(c["id"])
        src = j and source.get(j["sourceId"])
        changes = delta(asLirio(src), c) if src else [{"new": True}]
        for snap in older:
            o = snap.get(j["sourceId"]) if src else None
            if o:
                seen = {json.dumps(ch, sort_keys=True) for ch in delta(asLirio(o), c)}
                changes = [ch for ch in changes if json.dumps(ch, sort_keys=True) in seen or "field" in ch]
        proposals.append({"lirioId": c["id"], "emberId": j and j.get("emberId"), "name": c["nome"],
                          "city": c["cidade"], "uf": c["uf"], "edited": c["atualizado"],
                          "changes": changes, "lirio": c})
else:
    prev, cur = loadLirio(a), loadLirio(b)
    for i, c in cur.items():
        p = prev.get(i)
        if p and p.get("atualizado") == c.get("atualizado"):
            continue
        j = join.get(i)
        changes = delta(p, c) if p else [{"new": True}]
        proposals.append({"lirioId": i, "emberId": j and j.get("emberId"), "name": c["nome"],
                          "city": c["cidade"], "uf": c["uf"], "edited": c.get("atualizado"),
                          "changes": changes, "lirio": c})
    for i, p in prev.items():
        if i not in cur:
            j = join.get(i)
            proposals.append({"lirioId": i, "emberId": j and j.get("emberId"), "name": p["nome"],
                              "city": p["cidade"], "uf": p["uf"], "changes": [{"removed": True}], "lirio": p})

proposals = [p for p in proposals if p["changes"]]
with open(outDir / "proposals.jsonl", "w") as f:
    for p in proposals:
        f.write(json.dumps(p, ensure_ascii=False) + "\n")

def line(ch):
    if ch.get("new"):
        return "new church (not in our directory)"
    if ch.get("removed"):
        return "he removed this church"
    if "field" in ch:
        return f"{ch['field']}: {ch['before']!r} → {ch['after']!r}"
    op = "add" if "add" in ch else "remove"
    s = ch[op]
    return f"{ch['kind']}: {op} {s['day']} {s['time']}"

with open(outDir / "proposals.md", "w") as f:
    f.write(f"# Lírio Católico — {len(proposals)} churches changed ({mode[2:]})\n\n")
    for p in sorted(proposals, key=lambda p: (p["uf"], p["city"], p["name"])):
        target = f"`{p['emberId']}`" if p["emberId"] else "no match in ours"
        f.write(f"## {p['name']} — {p['city']}/{p['uf']} ({target}, lirio {p['lirioId']})\n\n")
        for ch in p["changes"]:
            f.write(f"- {line(ch)}\n")
        f.write("\n")

kinds_of = collections.Counter(
    "new" if ch.get("new") else "removed" if ch.get("removed") else ch.get("field") or f"{ch['kind']} {'add' if 'add' in ch else 'remove'}"
    for p in proposals for ch in p["changes"])
print(f"{len(proposals)} churches with changes → {outDir}/proposals.md")
for k, v in kinds_of.most_common():
    print(f"{v:6}  {k}")
