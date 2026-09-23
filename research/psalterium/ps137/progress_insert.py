"""Insert Ps 137's row into the shared PROGRESS.md after the last row numbered 119-136 (re-read at run time).
python3.13 research/psalterium/ps137/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 137 | 9 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held as an option: 137:1b *voltado para* against his *em direção ao*, for the 5:8b doublet). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7; DO's file has no *Ipsi David*). The Hetzenauer print read is skipped and owed | "
       "latinist ×2 (v1: clean; v2: one minor, held), stylist (5 remarks: 1 taken — 137:2b to the Latin's order *acima de tudo o vosso santo nome*; 4 kept as options — *eu vos invocar*, *o que é humilde / alto*, *dareis vida*, *desprezeis*; best 137:7, worst 137:6), "
       "ambiguity (12 readings; the final *acima de tudo* heard as 'above all', met by the reorder; unknown *excelso*, *vivificareis*, *desdenheis*) — stylist and ambiguity read draft 1 only | 12 | "
       "Copied: 137:1a = 9:2 = 110:1; 1b *adorábo ad templum* = 5:8b; 2b *Super misericórdia tua, et veritáte tua* = 113:10; 3 = 101:3b / 55:10; 6 *humília réspicit* = 112:5. "
       "Brazilian circulation fetched, not asserted (*Na presença dos anjos eu vos cantarei*, Canção Nova / Ave Maria, Hebrew-based) in `ps137/circulation.md`. "
       "**Hardest / for Gustavo:** 137:1b *na presença* (the conspéctus row's worship branch, not Ps 5's paper trial *à vista*); 2b *super omne, nomen* read by DO's comma against the Greek's 'above every name'; "
       "137:7 *vivificareis* — sixth psalm a reader did not know it; a ruling is proposed in the vivificáre row. Evidence added to 6 rows. "
       "Scripts: `ps137/concord.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 137 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 137:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
