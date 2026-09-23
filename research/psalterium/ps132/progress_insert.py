"""Insert Ps 132's row into the shared PROGRESS.md after the last row numbered 119-131 (re-read at run time).
python3.13 research/psalterium/ps132/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 132 | 4 | 2 | reviewed — Latinist gate clean of majors (v2: two minors, both refused — the inline *(3a)* marker, not reproduced by rule 4; *para todo o sempre* against his *para sempre*, D37 names 132:3b). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7, as 119–127, 133) "
       "| latinist ×2 (v1: one minor, *para todo o sempre*, refused for D37; v2: the same, and *(3a)*, refused), "
       "stylist (2 remarks: 132:1 finite clause *que os irmãos habitem juntos* taken; 132:3b *Pois* kept as option; worst 132:1, best 132:2b; the Aarão / Sião rhyme judged harmless — the Latin's Aaron / Sion), "
       "ambiguity (6 readings, the Latin's sense heard first in each; unknown *unguento*, *orla*, *Hermon*, *Aarão*) | 8 | "
       "132:1–2a is the Gradual of Pent22-0 and three saints' Masses, the Vespers antiphon (Day4 / Daya4 / Monastic feria 3) and a Matins versicle (C3 and others) — grep; the Holy Thursday Mandatum not found in DO, not verified. "
       "Brazilian circulation fetched (CNBB LH read from the saved page `consult/lh_salmo133.html`: *Vinde e vede como é bom, como é suave*; Ave Maria and the song *Como é bom, como é agradável* by search summary) in `ps132/circulation.md`. "
       "**Hardest:** 132:1 *Ecce* → *Eis* (the row) against the familiar *Vede* / *Oh*; *jucúndum* → *agradável* by Ps 111's split (a thing), which is also the familiar Brazilian word; "
       "132:2a *unguéntum* → *unguento* (the Latin's ointment against the Hebrew's oil every Brazilian text follows); 132:3b *mandávit … benedictiónem* → *ordenou* (the row) against 41:9's *mandou*. "
       "New rows *unguéntum*, *ora*, *descéndere*, *ros*, the 132:1–2a Gradual formula; evidence added to 10 rows. "
       "Scripts: `ps132/revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 132 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 132:
            idx = i
    lines.insert(idx + 1, row + '\n')
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
