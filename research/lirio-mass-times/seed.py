"""The Lírio desk's starting state (apps/admin, `lirio_church` + `lirio_item`), as SQL.

  python3 seed.py <lirio dir> <lirio-map.jsonl> <out.sql> <cmt churches.jsonl> [<older cmt snapshot>...]

Every church of his becomes a `lirio_church` row, joined to ours through `extract.py`'s map: the copy
the first weekly upload is compared with. Each record he edited by hand since his bulk import (a
full timestamp in `atualizado`; the import stamped a bare date) becomes a pending `lirio_item`, his
record set against the source record he started from.

He copied the source somewhere between our scrapes, so a grid line counts as his change only if it
differs from every copy passed: otherwise the source moved, not him. `before` is written so the
desk's own diff (apps/backend/src/lib/lirio.ts) finds exactly those lines.

Apply with `wrangler d1 execute ember-mass-times --file=<out.sql>` (--local or --remote); it
replaces whatever the two tables held.
"""

import collections
import glob
import gzip
import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

lirioDir, mapPath, outPath, newest = map(Path, sys.argv[1:5])
older = [Path(p) for p in sys.argv[5:]]

def loadSource(path):
    lines = gzip.open(path, "rt") if str(path).endswith(".gz") else open(path)
    return {c["id"]: c for c in map(json.loads, lines) if c["id"].startswith("BR")}

lirio = [c for f in sorted(glob.glob(str(lirioDir / "uf/*.json"))) for c in json.load(open(f))]
join = {m["lirioId"]: m for m in map(json.loads, open(mapPath))}
sources = [loadSource(newest), *map(loadSource, older)]

grids = {"mass": "missas", "confession": "confissoes", "adoration": "adoracao"}
letters, days = "UMTWHFS", ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]

def clock(v):
    t = str(v).zfill(4)
    return f"{t[:2]}:{t[2:]}"

# A source record in his shape: what his import would have made of it.
def asLirio(c):
    out = {"id": None, "nome": c.get("ln") or c["n"], "endereco": c.get("ad"),
           "telefones": [c["te"]] if c.get("te") else None, "site": c.get("w"),
           "observacoes": c.get("i"), "lat": c["lat"], "lng": c["lng"]}
    for kind, key in grids.items():
        grid = collections.defaultdict(set)
        for s in c.get("ss", []):
            if s["e"] != kind or s.get("f") != "weekly":
                continue
            # The scrape carries these as numbers on some rows and strings on others.
            if str(s.get("df", 101)) != "101" or str(s.get("dt", 1231)) != "1231":
                continue
            time = clock(s["st"]) + (f"–{clock(s['et'])}" if s.get("et") else "")
            for d in s["d"]:
                if d in letters:
                    grid[days[letters.index(d)]].add(time)
        if grid:
            out[key] = {d: sorted(ts) for d, ts in grid.items()}
    return {k: v for k, v in out.items() if v is not None}

def slots(grid):
    return {(d, t) for d, ts in (grid or {}).items() for t in ts}

# The source record, with each grid line he didn't change (by some copy's account) set to his.
def before(his, copies):
    out = dict(copies[0])
    for key in grids.values():
        mine = slots(his.get(key))
        theirs = [slots(c.get(key)) for c in copies]
        kept = set()
        for slot in mine | set().union(*theirs):
            changed = all((slot in mine) != (slot in t) for t in theirs)
            if (slot not in mine) if changed else (slot in mine):
                kept.add(slot)
        grid = collections.defaultdict(list)
        for d, t in sorted(kept):
            grid[d].append(t)
        if grid:
            out[key] = dict(grid)
        else:
            out.pop(key, None)
    out["id"] = his["id"]
    return out

def lit(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return str(v)
    if not isinstance(v, str):
        v = json.dumps(v, ensure_ascii=False)
    return "'" + v.replace("'", "''") + "'"

now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
items = 0
with open(outPath, "w") as out:
    out.write("DELETE FROM lirio_item;\nDELETE FROM lirio_church;\n")
    for c in lirio:
        j = join.get(c["id"])
        churchId = j and j.get("emberId")
        out.write(f"INSERT INTO lirio_church (lirio_id, record, updated, church_id) VALUES "
                  f"({c['id']}, {lit(c)}, {lit(c.get('atualizado'))}, {lit(churchId)});\n")
        if "T" not in c.get("atualizado", ""):
            continue
        copies = [asLirio(s[j["sourceId"]]) for s in sources if j and j["sourceId"] in s]
        prior = before(c, copies) if copies else None
        out.write(f"INSERT INTO lirio_item (id, lirio_id, church_id, status, before, after, created_at) "
                  f"VALUES ({lit(str(uuid.uuid4()))}, {c['id']}, {lit(churchId)}, 'pending', "
                  f"{lit(prior)}, {lit(c)}, {lit(now)});\n")
        items += 1

print(f"{len(lirio)} churches, {items} waiting → {outPath}")
