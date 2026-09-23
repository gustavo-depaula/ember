"""Insert canticle 231's row into the shared PROGRESS.md, after the last row numbered 150-230 (re-read at run time).
python3.13 research/psalterium/ps231/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 231 (Benedíctus Dóminus, Deus Israël — Canticum Zachariæ, Luke 1:68–79, daily Lauds) | 12 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors held as options (1:70 *sanctórum … prophetárum* order, 1:77 *dos pecados deles*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 2 minors, both taken — 1:70 *desde sempre* → *desde os tempos antigos*, 1:71 genitive *Salvação dos*; v2: 2 minors, held), "
       "stylist (5 remarks: 3 taken — 1:70, 1:71 *Salvação que nos livra dos*, 1:79 *para o caminho*; 2 kept as options — *o sirvamos*/*livres*, *o conhecimento*; worst 1:71, best 1:78), "
       "ambiguity (19 readings; 1:70 'eternal prophets' and 1:71 genitive acted on; unknown: chifre as strength, remissão, Oriente as a title, entranhas) | " + str(count) + " | "
       "DO ids 1:68–1:79 (Luke's), '+' after the first word reproduced as 233. Heading not translated (D7). The text is the Vulgate of Luke, not the Gallican. "
       "render.py and checks.py ran unchanged; parallels.py handles psalm numbers only, so `ps231/show_parallels.py` builds `consult/parallels/ps231.md` from Bolls VULG/TISCH/DRB, drbo.org notes, MS1932 (PDF text layer) and DM1962; DO's Portuguese is DM1962's. "
       "Copied: the D41 head formula, 17:3c *chifre de salvação*, 104:42 *seu servo*, 17:51 *usar de misericórdia*, 123:7b *livrados*, 233 *diante da face* / *povo*, 106:10 *sentados nas trevas e na sombra da morte*, D44 *entranhas*. "
       "Brazilian circulation fetched (`ps231/circulation.md`): CNBB LH (daily Lauds) and Lectionary responsorial — a paraphrase from the Greek / Nova Vulgata (*poderoso Salvador*, future *fará brilhar o Sol nascente*, *no caminho da paz*). "
       "**Hardest / for Gustavo:** 1:78 *óriens ex alto* → *o Oriente do alto* against the familiar *Sol nascente*; 1:69 *chifre* (the slang risk, flagged again); 1:77 *o saber* (another objection to the sciéntia row); 1:70 *a sǽculo* split from the row for men. "
       "New rows: *óriens ex alto*, *remíssio*, *jusjurándum* (open); evidence added to 12 rows. Scripts: `ps231/show_parallels.py`, `concord.py`, `gloss.py`, `revise_v2.py`, `gate_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 231 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 231:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
