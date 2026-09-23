"""Insert canticle 223's row into the shared PROGRESS.md, after the last row numbered 150-222 (re-read at run time).
python3.13 research/psalterium/ps223/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 223 (Exsultávit cor meum in Dómino — Canticum Annæ, 1 Sam 2:1–10, Wednesday Lauds II) | 16 | 2 | reviewed — Latinist gate on v2 clean of majors; three minors: one taken after the gate (2:2 *super* → *sobre os meus inimigos*, triumph, not 34:21's *contra*), two held as raised on v1 too (2:4 *palavras altivas*, his *o falar de coisas altivas* an option; 2:7 *pão*, D42). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 4 minors — *Dilatou-se* and *faz descer* taken, *o falar de* an option, *pães* refused; v2: 3 minors as above), stylist (8 remarks: 3 taken — *Dilatou-se*, *os eixos*, the plain order of 2:14; refused or options: 2:1 order (88:25's), *conhecimentos*, *alugaram-se*, *reconduz*, *tenha*; best 2:10, worst 2:7), "
       "ambiguity (24 readings; *bem* and *polos* acted on; *chifre*, *infernos*, *Cristo* heard as foreseen; unknown *chifre* as metaphor, *altivas*, *cingidos*, *alçará*, kept) | " + str(count) + " | "
       "DO ids 2:1–2:16 are DO's own line numbers, not the Vulgate's verses (map in `ps223/show_parallels.py`); DO's heading says *3 Reg 2:1-16* for 1 Sam (1 Kgs in the Vulgate's naming) 2:1–10. Heading line not translated (D7). "
       "render.py and checks.py ran unchanged on 223; `parallels.py` gives only Latin and DO Portuguese for a canticle, so `ps223/show_parallels.py` builds `consult/parallels/ps223.md` (Bolls VULG, DRB, WLC, Rahlfs LXX csv, MS1932 from the PDF text layer, Diurnal Monástico). "
       "Copied: *cornu → chifre* in the order of 88:25; *aos infernos … traz de volta* from 212; *dar a morte* (36:32); 112:7's *levanta do pó … do esterco*; *impérium → domínio*; D19 *Cristo*, D30 *mundo*, D38, D42. "
       "Brazilian circulation fetched (`ps223/circulation.md`: the CNBB LH Wednesday Lauds II and the Lectionary, 22 Dec and Tuesday of Week 1 in Ordinary Time, even years, one Hebrew-family text with *fronte*, *sepultura*, *colunas*, *Ungido*; MS1932). "
       "The coordinator's note that *Christus → o seu Ungido* had precedent was not found in any finished psalm; D19 followed, *Ungido* an option. "
       "**Hardest / for Gustavo:** 2:9 *dedúcit ad ínferos* → *faz descer aos infernos* (the *dedúcere* row's *fazer descer*), which now differs in the verb from 212's *conduzis* — the *ad ínferos* row updated so one ruling covers both; 2:13 *cárdines* → *eixos*; local departures: 2:6 *superátus* → *vencido* (row *superar*), 2:12 *téneat* → *ocupe* (row *tomar*), 2:9 *vivíficat* → *dá a vida* (the row's option). "
       "New rows: *cardo*, *róbur*, *se locáre*, *conticéscere*, *vétera*, *sublimáre*, *subleváre* (all open); evidence added to 22 rows. Scripts: `ps223/show_parallels.py`, `concord.py`, `revise_v2.py`, `record_gate.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 223 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 223:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
