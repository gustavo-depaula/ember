"""Insert canticle 214's row into the shared PROGRESS.md, after the last row numbered 150-213 (re-read at run time).
python3.13 research/psalterium/ps214/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 214 (Audíte verbum Dómini, gentes — Jer 31:10–14, Thursday Lauds I) | 9 | 2 | reviewed — Latinist gate on v2 clean of majors; one minor held as an option (31:17 *a dolóre suo → depois da sua dor*, raised on v1 too; he calls it defensible and the Douay tradition; the separative *livres da sua dor* is the option, for Gustavo). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 4 minors on 2 verses — 31:14 *pelo trigo* and *rebanhos e manadas* taken; 31:17 *depois da* and *júbilo* held as options; v2: 1 minor, held), stylist (6 remarks: 31:11 *como o pastor o seu rebanho* taken, 31:14 *vacas* met by the Latinist's fix; *do mais forte*, *regozijo*, *após*, the object-first 31:18 kept as options; best 31:15, worst 31:17), "
       "ambiguity (15 readings; 31:12 *mais poderoso* heard as a superlative, 31:16 *em coro* heard as singing and *a virgem* as possibly Mary — options kept; unknown *afluirão*, *crias*, *congregará* — kept) | " + str(count) + " | "
       "DO ids 31:10–31:18 are DO's line numbers, not Jeremiah's verses (the text is Jer 31:10–14; DO drops the closing *ait Dóminus*, which survives in the antiphon). Heading line *(Canticum Jeremiæ * Jer 31:10-18)* not translated (D7). Text = Jerome's Vulgate Jeremiah, not the Gallican. "
       "render.py and checks.py ran unchanged on 214; `parallels.py` handles psalm numbers only, so `ps214/show_parallels.py` builds `consult/parallels/ps214.md` (Bolls VULG, DRB, WLC in `consult/ps214/`; Rahlfs LXX Jer 38; MS1932 from the PDF text layer; DM1962 Thursday Lauds). "
       "Copied: 48:2 *Escutai* (rule 3), 146:2 *congregará*, 77:42 *resgatou*, *o poderoso*, 64:5b *será cheio dos bens*, 4:8 *trigo … vinho … azeite*, 149:3 *em coro*, 29:12 *converter … em júbilo*, 22:5b *embriagar*, 62:6 *gordura*. "
       "Brazilian circulation fetched (`ps214/circulation.md`: CNBB LH Thursday Lauds II, Hebrew-based — *Ouvi, nações*, *qual pastor a seu rebanho*, *afluirão*, *a virgem dançará*; the Lectionary refrain *O Senhor nos guardará qual pastor a seu rebanho*; DO's antiphon *Pópulus meus, ait Dóminus, bonis meis adimplébitur*). "
       "**Hardest / for Gustavo:** 31:14 *super fruménto* → *pelo trigo* (for, not an apposition) and *pécorum et armentórum* → *rebanhos e manadas* (costs an echo of *gregem*); 31:16 *in choro* → *em coro* against the Hebrew's dance; 31:17 *gáudium* → *júbilo* (evidence added to the row open for a ruling) and *a dolóre* → *depois da*. "
       "New rows: *luctus*, *confluere*, *super* + abl., *hortus irríguus* (all open), formula antiphon *Pópulus meus* (open); evidence added to 11 rows. Scripts: `ps214/show_parallels.py`, `gloss.py`, `concord.py`, `draft2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 214 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 214:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
