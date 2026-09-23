"""Insert Ps 138's row into the shared PROGRESS.md after the last row numbered 119-137 (re-read at run time).
python3.13 research/psalterium/ps138/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 138 | 23 | 3 | reviewed — Latinist gate on v2: **one major held** (138:15 *os meum*, asked *o meu osso*; held with Ps 101:6's ruling on the same collective singular — **for Gustavo: both change together or neither**); three minors: 138:14 *o conhece* → *conhece* taken (**draft 3, unread by a gate**), 138:6 order and 138:11 *iluminação* held. "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. No titulus (D7) | "
       "latinist ×2 (v1: two minors — 138:6 *acima de mim* → *de mim* taken, 138:15 plural / *substância* declined; v2 gate as above), stylist (6 remarks: 2 taken — 138:10 Latin order breaks the *guiará / segurará* rhyme, 138:20 *vós dizeis* → *dizeis*; 4 held as options; best 138:16, worst 138:20), "
       "ambiguity (33 readings; 138:20 heard as God speaking, met by the stylist's fix; unknown *calquem, definhava, amparastes*, all rows) — stylist and ambiguity read draft 1 only | 23 | "
       "Liturgy: 138:1–2, 18b, 5b, 6a the Easter Introit (*Resurréxi*); 138:17 the Apostles (Introit 02-24, Gradual, Commune); antiphons *Dómine, probásti me*, *Mirabília ópera tua*. Brazilian circulation fetched (`ps138/circulation.md`). "
       "Gallican against the Hebrew kept: 138:6 *ex me*, 138:11b, 138:16 *dies formabúntur, et nemo in eis*, 138:17 *amíci tui … principátus*, 138:20 *civitátes tuas*. "
       "**Hardest / for Gustavo:** 138:1 *o meu sentar e o meu ressurgir*; 138:6 *de mim* vs *acima de mim*; 138:8 *inferno*; the illuminátio row's *luz* now meets *lumen* (138:11–12). New rows: principátus, imperféctum, sessio · resurréctio, os; two formulas; evidence added to 12 rows. "
       "Scripts: `ps138/gloss_lookup.py`, `show.py`, `revise_v2.py`, `revise_v3.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 138 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 138:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
