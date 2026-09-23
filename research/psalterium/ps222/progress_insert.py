"""Insert canticle 222's row into the shared PROGRESS.md, after the last row numbered 150-221 (re-read at run time).
python3.13 research/psalterium/ps222/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 222 (Ego dixi: In dimídio diérum meórum — Canticum Ezechiæ, Isa 38:10–20, Tuesday Lauds II) | 15 | 2 | reviewed — Latinist gate on v2 clean of majors; one minor held as an option (38:13 *enrolada longe de mim* against his *enrolada e tirada de mim*, which says *tirar* twice). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: clean; v2: 1 minor, held), stylist (6 remarks: 4 taken — 38:12 transitive *olhar* without the doubled *para o*, 38:13 *longe de mim*, 38:14 the Latin's order, 38:20 comma; 1 in part — 38:20 *Eis, em paz* loses a comma but gets no verb; 1 refused — *dar a conhecer*, the row; worst 38:20, best 38:21), "
       "ambiguity (26 readings; *acabareis comigo* heard as a plural 'you' acted on — *vós acabareis comigo*; *inferno* heard as hell, left to the row; unknown *urdia*, *tecelão*, *ceifou-me*, *definharam*, *vivificareis*, *amaríssima*, kept) | " + str(count) + " | "
       "DO ids 38:10–38:24 are the canticle's own line numbers; the text is Isa 38:10–20 of Jerome's Vulgate (from the Hebrew), not the Gallican. Heading line *(Canticum Ezechiæ * Isa 38:10-24)* not translated (D7). "
       "render.py and checks.py ran unchanged on 222; parallels.py cannot build canticles, so `ps222/show_parallels.py` builds `consult/parallels/ps222.md` (Bolls VULG, DRB, WLC; Rahlfs LXX csv; MS1932 from the PDF text layer; DM1962 Tuesday Lauds) with a DO↔Vulgate verse map; all downloads in `consult/ps222/`. "
       "Copied: 101:25 *no meio dos meus dias*, 48:16/88:49 *do inferno*, *terra dos vivos*, *os que descem à cova*, 94:5 *ele mesmo o fez*, 137:7 *vós me vivificareis*, *Vós, porém*, *salvai-me*, *todos os dias da … vida*, *na casa do Senhor*, *fazer conhecer*. "
       "Brazilian circulation fetched (`ps222/circulation.md`: CNBB LH Tuesday Lauds II prays Is 38,10-14.17-20 as a paraphrase — *mansão triste dos mortos*; the Lectionary's responsorial, Friday of the 15th week (year II), same text; Mt 16:18 CNBB *as forças do Inferno*). "
       "**Hardest / for Gustavo:** *ínferi / inférnus* → *inferno* (the open row; 38:10 and 38:22); 38:14 *succídit me* → *ceifou-me*, which collides with *métere → ceifar* (125:5); 38:13 *generátio* → *geração* (heard as contemporaries; *idade* option); 38:20 *Ecce, in pace amaritúdo mea amaríssima*, kept verbless and open. "
       "New rows: *succídere*, *ordíri*, *convólvere*, *attenuáre*, *recogitáre*, *amaríssimus*, *vim páti* (all open); evidence added to 19 rows. Scripts: `ps222/show_parallels.py`, `concord.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 222 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 222:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
