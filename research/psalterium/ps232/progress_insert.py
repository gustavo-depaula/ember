"""Insert canticle 232's row into the shared PROGRESS.md, after the last row numbered 150-231 (re-read at run time).
python3.13 research/psalterium/ps232/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 232 (Magníficat — Canticum B. Mariæ Virginis, Luke 1:46–55, daily Vespers) | 15 | 2 | reviewed — the Latinist gate on v2 found no majors; its one minor (1:49 *por mim* → *em mim*) was taken. "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; the Latinist and the stylist read latin.json | "
       "latinist ×2 (v1: 1 minor, 1:51 *fez potência*, held as an option; v2: 1 minor, taken), "
       "stylist (4 remarks: 2 taken — 1:48 commas, 1:49 the dative; 2 kept as options — 1:51 *mostrou o seu poder*, 1:55 *Abraão,* without *a*; worst 1:51, best 1:53), "
       "ambiguity (13 readings; acted on: 1:49 'made me into', 1:51 run-on, 1:52 *Depôs* unknown → *Derrubou*; *soberbos* unknown, kept) | " + str(count) + " | "
       "DO ids 1:46–1:55 (Luke's). In *Magníficat + ** the '+' stands directly before the '*' and is kept there. Heading not translated (D7). The text is the Vulgate of Luke. "
       "**The shared checks.py crashes on the empty colon between '+' and '*'** (for Gustavo); it was not edited, and `ps232/checks232.py` is a local copy whose only change is that an empty colon measures 0. "
       "parallels.py handles psalm numbers only, so `ps232/show_parallels.py` builds `consult/parallels/ps232.md` from Bolls VULG/TISCH/DRB, the drbo.org notes, MS1932 (PDF text layer) and DM1962; DO's Portuguese is DM1962's. "
       "Brazilian circulation was fetched and quoted in fragments only (`ps232/circulation.md`): the CNBB LH (Vespers, a secondary web witness; a paraphrase with *amor* and *pequenez*) and the Lectionary (the draft follows it wherever it is the Latin's sense). "
       "**Hardest / for Gustavo:** 1:48 *humilitátem* → *humildade* (a context split from 30:8's *humilhação*; the LH's *pequenez* is the option); 1:46 the order around '+ *'; 1:51 *agiu com potência*; 1:55 *pelos séculos* against the familiar *para sempre* (D43). "
       "New row: *mens cordis* (open); evidence added to 10 rows. Scripts: `ps232/show_parallels.py`, `concord.py`, `gloss.py`, `checks232.py`, `revise_v2.py`, `record_gate.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 232 ') for l in lines):
    raise SystemExit('already there')
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 232:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
