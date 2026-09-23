"""Insert Ps 142's row into the shared PROGRESS.md after the last row numbered 119-141 (re-read at run time).
python3.13 research/psalterium/ps142/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 142 | 14 | 2 | reviewed — Latinist gate clean of majors (v2: three minors, all held as options — 142:2 *na vossa presença* against his *diante dos vossos olhos*; 142:3b *de outrora* against *de há muito* (v1 asked *do século*); 142:9 *em vós me refugiei* against *a vós me acolhi*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus: DO's Latin has none (D7). The last Penitential Psalm; formulas shared with 101 (*escutai a minha oração*, *não desvieis de mim a vossa face*, *escutai-me depressa*) and 6/37 checked with `ps142/concord.py` | "
       "latinist ×2 (v1: one minor, held as option; v2: three minors, held), stylist (8 remarks: 2 taken — 142:3b the Latin's order *angustiou-se sobre mim o meu espírito*, 142:8b *por onde eu ande*; 6 refused, 3 of them options — *diante de vós* 142:6, *dareis a vida* 142:10b; *destruireis* 142:11b–12b refused under D24; best 142:7a, worst 142:10b), "
       "ambiguity (18 readings, nearly all as meant; unknown *vivente*, *outrora*, *vivificareis*, *equidade*, *atribulam* — kept; 142:7b *e serei* flagged as open to a wrong reading, held with *senão serei* as option) — stylist and ambiguity read draft 1 only | " + str(count) + " | "
       "Thursday Lauds antiphon *Éripe me … ad te confúgi*; Advent antiphon (24:1 + 142:9); V. *Non intres in judícium* (Epi2-3); Offertory Quad6-1, Gradual Quad5-0 — grep. "
       "Brazilian circulation fetched, not asserted (`ps142/circulation.md`): *Não entreis em juízo com o vosso servo* and *Ensinai-me a fazer vossa vontade, pois sois o meu Deus* (Ave Maria, Hebrew-based) — ours has the same first halves. "
       "**Hardest / for Gustavo:** 142:3b *mórtuos sǽculi → os mortos de outrora* (two Latinist minors, *outrora* unknown to the blind reader); 142:1 *obsecrátio → prece* (δέησις, merged with prex/deprecátio by D15); 142:5 *facta → feitos* kept apart from *ópera → obras*; 142:10b *vivificareis* — the seventh unknown for the row. "
       "New rows *confúgere*, *obscúra*, *mórtui sǽculi*, *factum*, *terra recta*, *spíritus tuus bonus*; the formula row; evidence added to 14 rows. Scripts: `ps142/revise_v2.py`, `finish_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 142 |') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+) \|', l)
    if m and 119 <= int(m.group(1)) < 142:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:8])
