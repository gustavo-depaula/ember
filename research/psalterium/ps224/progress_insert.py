"""Insert canticle 224's row into the shared PROGRESS.md, after the last row numbered 150-223 (re-read at run time).
python3.13 research/psalterium/ps224/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 224 (Cantémus Dómino — Canticum Moysis, Exod 15:1–19, Thursday Lauds I) | 22 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors held as options "
       "(15:7 *ao sopro do vosso furor* against 15:11 *espírito*, raised on v1 too; 15:22 *no meio do mar* for *ejus*, v2's audibility fix). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 1 minor, 15:7, held; v2: 2 minors, held), stylist (4 remarks, all taken: 15:13 reordered, 15:19 *fizestes*, 15:20 *e ainda além*, 15:21 *fez voltar*; best 15:8, worst 15:13), "
       "ambiguity (34 readings; taken: 15:9 *se fartará* (was heard as spiritual filling), 15:22 *no meio do mar*; unknown *despojos*, *Desembainharei*, *Filisteia*, *Edom*, *Moab*, *impetuosas* — kept) | " + str(count) + " | "
       "DO ids 15:1–15:22 are DO's lines; the text is Jerome's Vulgate Exod 15:1–19, not the Gallican (DO's heading says 15:1-22). Heading *(Canticum Moysis * Exod. 15:1-22)* not translated (D7). "
       "render.py and checks.py ran unchanged on 224; `parallels.py` handles psalm numbers only, so `ps224/show_parallels.py` builds `consult/parallels/ps224.md` (Bolls VULG, DRB, WLC, CNBB in `consult/ps224/`; Rahlfs LXX; MS1932 pp. 125–127; DM1962 Thursday Lauds). "
       "Copied: 117:14 whole at 15:2 (also the Lauds II antiphon), 56:11 *se engrandeceu*, 17:16 *sopro*, 147:7 *Soprou o … espírito*, 103:6 *deter-se*, 68:3 *profundeza*, 82:14 *palha*, 36:14 *desembainhar*, 137:7 *estendestes a vossa mão*, 79:10 *guia*, 73:2 *possuístes*, 78:11 *grandeza do vosso braço*, 104:41 *pela terra seca*. "
       "Brazilian circulation fetched (`ps224/circulation.md`: CNBB LH Saturday Lauds I, Hebrew paraphrase; the Easter Vigil refrain *Cantemos ao Senhor que fez brilhar a sua glória!*). "
       "**Hardest / for Gustavo:** 15:1 *magnificátus est* → *se engrandeceu* against the Vigil's *fez brilhar a sua glória*; *dejécit* → *derrubou* against the known *precipitou*; 15:7 *spíritus* → *sopro* / 15:11 *espírito*; 15:17 *formído et pavor* → *o terror e o pavor* (moves off 54:5's *pavor*); 15:19 *operátus es* → *fizestes* (D43's option); 15:20 *et ultra* → *e ainda além*. "
       "New rows: *dejícere*, *obtinére*, *obrigéscere*, *vir pugnátor*, *unda*, *magníficus*, *in ætérnum et ultra*, *eques*, *Philísthiim* (all open); formula antiphons *Cantémus Dómino * glorióse* and *Fortitúdo mea* (open); evidence added to 21 rows. "
       "Scripts: `ps224/show_parallels.py`, `gloss.py`, `gloss_brief.py`, `concord.py`, `add_checks_audit.py`, `revise_v2.py`, `checks_v2_audit.py`, `gate_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 224 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 224:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
