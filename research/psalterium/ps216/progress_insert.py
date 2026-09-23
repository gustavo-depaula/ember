"""Insert canticle 216's row into the shared PROGRESS.md, after the last row numbered 150-215 (re-read at run time).
python3.13 research/psalterium/ps216/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 216 (Miserére nostri, Deus ómnium — Sir 36:1–16, Saturday Lauds I) | 16 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors held (36:10 *quem escapa* against his *quem se salva*, kept as an option; 36:11 *príncipes inimigos*, which he noted only). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 1 minor, *atormentai* too narrow, *abatei* taken; v2: 2 minors, held), stylist (8 remarks: 1 taken — *como nós também conhecemos*; refused under glossary rows: *misericórdias*, *grandes obras* ×2, *estrangeiras*, *poder*, *princípio*; the *primogênito* cadence kept; best 36:9, worst 36:1), "
       "ambiguity (27 readings; *quem se salva* heard as a curse on the saved, acted on; *herdareis*, *invocado*, *primogênito* as Christ, *braço direito* noted; unknown *inenarráveis*, *compaixões*, *primogênito*) | " + str(count) + " | "
       "DO ids are the canticle's own lines 36:1–36:16, drifting from the Clementine verses (map at the head of `consult/parallels/ps216.md`). Heading *(Canticum Ecclesiastici * Sir 36:1-16)* not translated (D7). Text = the Vulgate (Old Latin) Sirach, not the Gallican; LXX the source; no Hebrew at hand. "
       "render.py and checks.py ran unchanged on 216; `ps216/show_parallels.py` builds `consult/parallels/ps216.md` (Bolls VULG, DRB from drbo.org, Rahlfs LXX csv, MS1932 from the PDF text layer, DM1962 Saturday Lauds, DO pt); third-party texts in `consult/ps216/` (gitignored). "
       "Homograph ban applied twice: *afligi* → *abatei* (36:8), *Reuni* → *Congregai* (36:12). Copied: 122:3 *Tende piedade de nós*, *compaixões*, *as grandes coisas*, *saber que* (collocation), *senão* (17:32, canticle 212), *à vista de*, *Despertai* (the row named the verse), 9:36 *Quebrai*, 81:8 *herdar*, *desde o início*, *santificação*, *repouso*. "
       "Brazilian circulation fetched (`ps216/circulation.md`, fragments only: CNBB LH Monday Lauds II prays Eclo 36,1-7.13-16 from the Greek as a paraphrase, omitting the verses of wrath; Lectionary Wednesday week 8 year I). "
       "**Hardest / for Gustavo:** 36:10 *qui salvátur* → *quem escapa* (readers split: the ambiguity reader heard a curse on the saved, the v2 Latinist wants the passive back); 36:13 *E os herdareis* (the Latin's openness; heard as inheriting from the dead); 36:14 *invocado o vosso nome* (the Hebraism, heard as calling upon); 36:1 *Deus de todos*. "
       "New rows: *Deus ómnium*, *immíttere*, *immutáre*, *tóllere (remove)*, *salvári*, *pessimáre*, *coæquáre*, *inenarrábilis* (all open); evidence added to 16 rows. Scripts: `ps216/show_parallels.py`, `concord.py`, `gloss.py`, `revise_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 216 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 216:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
