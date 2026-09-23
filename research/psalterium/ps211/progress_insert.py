"""Insert canticle 211's row into the shared PROGRESS.md, after the last row numbered 150-210 (re-read at run time).
python3.13 research/psalterium/ps211/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 211 (Benedíctus es, Dómine — 1 Chr 29:10–13, Monday Lauds I) | 7 | 2 | reviewed — Latinist gate on v2 clean of majors; one minor held as an option (29:13 *ínclitum → glorioso* against his *ilustre*, raised on v1 too — for Gustavo). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 3 minors — *ómnium* neuter, *damos graças* (D5), *glorioso* — all held as options; v2: 1 minor, held), stylist (2 remarks: 29:12b *sobre todas as coisas* taken; 29:11c inversion *estais vós* kept as an option — the Latin ends proparoxytone on *príncipes* too; best 29:12, worst 29:11c), "
       "ambiguity (8 items, 1 acted on — 29:12b *domínio de*; unknown *magnificência*) | " + str(count) + " | "
       "DO ids are 1 Chr's: 29:10, 29:11/11b/11c, 29:12/12b, 29:13. Heading line *(Canticum David * 1 Par. 29:10-13)* not translated (D7, as 233). Text = Clementine Vulgate of 1 Chr (Bolls VULG), not the Gallican. "
       "render.py and checks.py ran unchanged on 211; `parallels.py` gives only Latin + DO pt for a canticle, so `ps211/show_parallels.py` builds `ps211/parallels.md` (Rahlfs LXX csv; DRB and WLC from Bolls, `consult/bolls-*-13-29.json`); no MS1932 or DM1962 for this text. "
       "Copied: 118:12 *Bendito sois, Senhor*; 102:17 *desde sempre* + D23 *para sempre*; 73:16 *Vossa é…*; *magnificência*, *potência*, *domínio* (rows); D5 *damos graças*. "
       "Brazilian circulation fetched (`ps211/circulation.md`: CNBB LH Monday Lauds I and the Lectionary, Fri 33rd wk OT yr I — *Senhor Deus de Israel, o nosso pai, desde sempre e por toda a eternidade*; *o vosso nome glorioso*). "
       "**Hardest / for Gustavo:** 29:10 *Deus Israël patris nostri* → *Deus do nosso pai Israel* (reordered: the genitive makes Israel the father; *Deus de Israel, nosso pai* is heard as God our father — the Greek's reading); 29:13 *ínclitum → glorioso*; 29:12 / 12b *ómnium → todas as coisas* (neuter). "
       "New rows: *ínclitus* (open), *divítiæ*, *victória*, *cuncta*, formula *Benedíctus es, Dómine*; evidence added to 6 rows. Scripts: `ps211/show_parallels.py`, `concord.py`, `add_audit.py`, `revise_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 211 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 211:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
