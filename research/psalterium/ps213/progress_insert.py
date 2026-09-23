"""Insert canticle 213's row into the shared PROGRESS.md, after the last row numbered 150-212 (re-read at run time).
python3.13 research/psalterium/ps213/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 213 (Hymnum cantémus Dómino — Jdt 16:15–22, Wednesday Lauds I) | 8 | 2 | reviewed — Latinist gate on v2 clean of majors; one minor held as an option (16:21 *genus meum → a minha linhagem* against his *o meu povo*, which merges *pópulus*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 1 minor, *dará* for *dabit*, taken; v2: 1 minor, held), stylist (6 remarks: 4 taken — *esplêndido*, *com as águas* moved, *linhagem*, *dará*; 2 refused — *em vosso poder* (rule 5), *que se ergue*; *e tudo foi feito* kept as an option; best 16:15, worst 16:21), "
       "ambiguity (16 readings; *excelente*, *raça*, the waters-as-cause acted on; *Adonai* unknown, kept) | " + str(count) + " | "
       "DO ids 16:15–16:22 (DO splits the Vulgate's 16:17, so the numbering runs one ahead of the Clementine from 16:18). Heading line *(Canticum Judith * Judith 16:15-22)* not translated (D7, as 233 and 211). Text = Jerome's Vulgate Judith (from an Aramaic text), not the Gallican; the LXX is another recension and no Hebrew exists. "
       "render.py and checks.py ran unchanged on 213; `ps213/show_parallels.py` builds `consult/parallels/ps213.md` (Bolls VULG, DRB from drbo.org, Rahlfs LXX csv, MS1932 from the PDF text layer — `consult/ps213/ms1932-judith16.txt`). "
       "Copied: the formula *porque dissestes, e as coisas foram feitas … e foram criadas* (32:9 = 148:5), 103:30 *Enviastes o vosso espírito*, 81:5 *serão abalados*, 96:5 *como cera*, 21:15b *derreter-se*, *diante da vossa face*, *junto de vós*, *visitar*, *carnes*, D37 *para todo o sempre*. "
       "Brazilian circulation fetched (`ps213/circulation.md`: CNBB LH Wednesday Lauds I prays Jt 16,1-2.13-15 from the Greek as a paraphrase, with *Toda a vossa criatura vos sirva* and *junto a vós serão grandes em tudo*, and omits 16:21–22; the votive Mass of Mary Help of Christians, secondary source; *todo-poderoso* in the Creed and collects). "
       "**Hardest / for Gustavo:** 16:21 *genus* → *linhagem* (*raça* heard as ethnic, *povo* is *pópulus*'s); 16:16 *præclárus* of God → *esplêndido* (a local departure from the row's *excelente*, proposed for God only); 16:22 *dabit … in carnes* → *dará … nas carnes* and the bare *sintam*. "
       "New rows: *genus*, *omnípotens*, *superáre*, *creatúra*, *Adonái* (all open); evidence added to 11 rows. Scripts: `ps213/show_parallels.py`, `concord.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 213 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 213:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
