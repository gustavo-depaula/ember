"""Diff the General Roman Calendar (grc.tsv, built by build_grc.py) against
our universal OF sanctoral entries (content/of/calendar/sanctoral.json).

Reports:
  (a) GRC celebrations missing from our universal entries — with where their
      Mass texts can be found (regional formulary, content/of-data calendar
      stub, ember-extra `alternatives[]`) and the matching holy card;
  (b) our universal entries that are not in the GRC;
  (c) rank mismatches.

ember-extra texts: pass `--ember-extra <clone>/novus-ordo-missae/data/masses/sanctorale`
for the current upstream; otherwise the vendored snapshot in this repo's
history (commit 8a9789412, content/libraries/base/of/masses/sanctorale) is read
with `git show`.

Run from the repo root:  python3.13 research/of-calendar-gaps/diff.py [--ember-extra DIR]
"""

import csv
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[2]
here = Path(__file__).parent
snapshot = "8a9789412"
snapshot_dir = "content/libraries/base/of/masses/sanctorale"


def fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    s = re.sub(r"\biohn\b", "john", s)  # upstream scanno "Saint Iohn Paul Ii"
    return re.sub(r"\s+", " ", s.replace("’", "'"))


def titles(entry: dict) -> str:
    return " | ".join(fold(v) for v in (entry.get("title") or {}).values())


def mmdd(rule: dict) -> str | None:
    return f"{rule['month']:02d}-{rule['day']:02d}" if rule.get("type", "fixed") == "fixed" and "month" in rule else None


def load_ember_extra(arg_dir: str | None):
    cache: dict[str, dict | None] = {}

    def get(date: str) -> dict | None:
        if date in cache:
            return cache[date]
        doc = None
        if arg_dir:
            p = Path(arg_dir) / f"{date}.json"
            doc = json.loads(p.read_text()) if p.exists() else None
        else:
            r = subprocess.run(
                ["git", "show", f"{snapshot}:{snapshot_dir}/{date}.json"],
                cwd=root, capture_output=True, text=True,
            )
            doc = json.loads(r.stdout) if r.returncode == 0 else None
        cache[date] = doc
        return doc

    return get


def alt_summary(alt: dict) -> str:
    plain = ((alt.get("collect") or {}).get("body") or {}).get("plain") or {}
    langs = [l for l in ("la", "pt-BR", "en") if plain.get(l)]
    slots = [k for k in alt if k not in ("key", "title", "description", "rank", "rankLocalized", "liturgicalColor")]
    return f"ember-extra alt `{alt['key']}` (collect {'/'.join(langs) or 'none'}; slots: {', '.join(slots)}; upstream rank {alt.get('rank')})"


def main() -> None:
    ee_dir = sys.argv[sys.argv.index("--ember-extra") + 1] if "--ember-extra" in sys.argv else None
    ember_extra = load_ember_extra(ee_dir)
    grc = list(csv.DictReader(open(here / "grc.tsv"), delimiter="\t"))
    cal = json.loads((root / "content/of/calendar/sanctoral.json").read_text())
    temporal_refs = {e["formularyRef"] for e in json.loads((root / "content/of/calendar/temporal.json").read_text())}
    universal = [e for e in cal if e["scope"] == "universal"]
    regional = [e for e in cal if e["scope"] != "universal"]

    stubs = []  # content/of-data calendar entries with no formulary (second celebrations)
    for p in sorted((root / "content/of-data/calendar/sanctorale").glob("*/*.json")):
        d = json.loads(p.read_text())
        if not (root / "content/of/formularies/sanctoral" / p.parent.name / p.name).exists():
            stubs.append(d)

    cards = [json.loads(p.read_text()) for p in sorted((root / "content/practices/saint-of-the-day/data/holy-cards").glob("*.json"))]

    # Movable universal entries are matched by keyword alone.
    by_date: dict[str, list[dict]] = {}
    for e in universal:
        by_date.setdefault(mmdd(e["dateRule"]) or "movable", []).append(e)

    matched_ours: set[str] = set()
    missing, mismatches = [], []
    for g in grc:
        kw, date = g["keyword"], g["date"]
        if g["temporal"]:
            if g["temporal"] not in temporal_refs:
                missing.append((g, "temporal ref absent", "", ""))
            continue
        pool = by_date.get(date if re.match(r"\d\d-\d\d$", date) else "movable", [])
        hit = next((e for e in pool if kw in titles(e)), None)
        same_day_grc = [x for x in grc if x["date"] == date]
        if not hit and len(pool) == 1 and len(same_day_grc) == 1:
            hit = pool[0]  # single celebration that day, differently spelled
        if hit:
            matched_ours.add(hit["formularyRef"])
            if hit["rank"] != g["rank"]:
                mismatches.append((date, g["title"], g["rank"], hit["rank"], hit["formularyRef"]))
            continue

        where = []
        for e in regional:
            if mmdd(e["dateRule"]) == date and kw in titles(e):
                where.append(f"regional `{e['formularyRef']}` ({e['scope']}, {e['rank']})")
        for s in stubs:
            if s.get("date") and f"{s['date']['month']:02d}-{s['date']['day']:02d}" == date and kw in titles(s):
                where.append(f"of-data stub `{s['id']}` (title only, rank {s.get('rank')})")
        ee = ember_extra(date) if re.match(r"\d\d-\d\d$", date) else None
        for alt in (ee or {}).get("alternatives", []) or []:
            if kw in titles(alt):
                where.append(alt_summary(alt))
        card = [
            c for c in cards
            if c.get("feast") and f"{c['feast']['month']:02d}-{c['feast']['day']:02d}" == date
            and (kw in titles({"title": c.get("name")}) or kw.split()[0] in c["id"])
        ]
        card_s = "; ".join(f"{c['id']} (proper={c.get('proper', '—')})" for c in card) or "none"
        missing.append((g, "; ".join(where) or "NO TEXTS IN REPO/UPSTREAM", card_s, g["source"]))

    non_grc = [e for e in universal if e["formularyRef"] not in matched_ours]

    out = ["# OF universal sanctoral vs General Roman Calendar", ""]
    out += ["## (a) GRC celebrations missing from our universal entries", "",
            "| date | celebration | rank | texts available | holy card | source |", "|---|---|---|---|---|---|"]
    for g, where, card, src in missing:
        out.append(f"| {g['date']} | {g['title']} | {g['rank']} | {where} | {card} | {src} |")
    out += ["", "## (b) Our universal entries not in the GRC", "", "| ref | date | rank | title |", "|---|---|---|---|"]
    for e in non_grc:
        out.append(f"| {e['formularyRef']} | {mmdd(e['dateRule']) or 'movable'} | {e['rank']} | {e['title'].get('en-US') or e['title'].get('la')} |")
    out += ["", "## (c) Rank mismatches (GRC vs ours)", "", "| date | celebration | GRC | ours | ref |", "|---|---|---|---|---|"]
    for m in mismatches:
        out.append("| " + " | ".join(m) + " |")
    report = "\n".join(out) + "\n"
    (here / "diff-report.md").write_text(report)
    print(report)


if __name__ == "__main__":
    main()
