"""Insert canticle 221's row into the shared PROGRESS.md, after the last row numbered 150-220 (re-read at run time).
python3.13 research/psalterium/ps221/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 221 (Confitébor tibi, Dómine, quóniam irátus es mihi — Isa 12:1–6, Monday Lauds II) | 7 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors held as options (12:1 *se desviou*, 12:6 *agiu magnificamente*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 1 minor, *júbilo* → *alegria*, held for the row; v2: 2 minors, held), stylist (5 remarks: 2 taken — 12:1 *se afastou* for *voltou atrás*, 12:6 *fez coisas magníficas* for *agiu com magnificência*; 3 kept as options — *desígnios*, *Dai a conhecer*, *morada*; worst 12:5, best 12:4), "
       "ambiguity (12 readings; *voltou atrás* = 'retracted' and *magnificência* unknown acted on; *invenções* heard as gadgets, held for the row) | " + str(count) + " | "
       "DO ids 12:1–12:7 (DO splits Vulgate 12:2, so from 12:3 the ids run one ahead). Heading line not translated (D7). The text is Jerome's Isaiah, not the Gallican. "
       "render.py and checks.py ran unchanged on 221. `ps221/show_parallels.py` builds `consult/parallels/ps221.md` from Bolls VULG/WLC/DRB, drbo.org, the Rahlfs LXX csv, and MS1932 from the PDF text layer (p. 1458; `consult/ps221/ms1932-isaiah12.txt`). "
       "Copied: 117:14 (12:3), 104:1 (12:4b), 11:6b *agirei com confiança*, the *Confitébor tibi, Dómine* formula (D5). "
       "Brazilian circulation fetched (`ps221/circulation.md`): CNBB LH Thursday Lauds II; Lectionary at the Easter Vigil, the Sacred Heart (B) and Advent III (C) — a paraphrase from the Hebrew (*manancial da salvação*, *maravilhas*, *habitantes*). "
       "**Hardest / for Gustavo:** 12:4 *fóntibus Salvatóris* → *fontes do Salvador* against the sung refrain; 12:5 *adinventiónes* of God → *invenções* (second objection to the row, after 76:13); 12:1 *convérsus est furor* → *se afastou* (off the *convértere* row). "
       "New rows: *haurire*, *magnífice* (open); evidence added to 8 rows. Scripts: `ps221/show_parallels.py`, `concord.py`, `gloss.py`, `revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 221 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 221:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
