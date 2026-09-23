"""Insert canticle 215's row into the shared PROGRESS.md, after the last row numbered 150-214 (re-read at run time).
python3.13 research/psalterium/ps215/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 215 (Vere tu es Deus abscónditus — Isa 45:15–25, Friday Lauds I) | 16 | 2 | reviewed — Latinist gate on v2 clean of majors; two minors on two verses held as options (45:20 *às escondidas* against his place-reading *em lugar escondido*; 45:23 *Nada souberam* against his *Não souberam* — the v1 stylist asked for *Nada*, so the two readers conflict: for Gustavo; *o seu lenho esculpido* against *o lenho da sua escultura*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 3 minors, all taken — 45:18 present tense *cria, forma, faz* for the participles and *plastes* kept a noun, *o seu modelador*; 45:24 asyndeton; v2: 2 minors, held), stylist (8 verses: 5 taken — 45:16 *partiram*, 45:17 no article, 45:23 *Nada souberam*, 45:29 *Portanto, dirá: No Senhor …*, commas in 45:25 and 45:30; refused — 45:21 moving *em vão* (the Latin's open placement, decision), *digo a justiça*, *aconselhai-vos*, the two *desde*; best 45:28, worst 45:29), "
       "ambiguity (24 readings; 45:25 two-claim reading acted on; 45:21 *em vão* heard both ways, as intended; unknown *coraram*, *lenho*, *rogam*, *confins* — kept) | " + str(count) + " | "
       "DO ids 45:15–45:30 are DO's line numbers, not Isaiah's verses (the text is Isa 45:15–25; DO splits Vulgate 45:18, 20, 21, 23). Heading line *(Canticum Isaiæ * Isa 45:15-30)* not translated (D7; for a DO file: *(Cântico de Isaías * Isa 45:15-30)*). Text = Jerome's Vulgate Isaiah from the Hebrew, identical to the Clementine; the LXX is distant. "
       "render.py and checks.py ran unchanged on 215; `parallels.py` handles psalm numbers only, so `ps215/show_parallels.py` builds `consult/parallels/ps215.md` (Bolls VULG, DRB, WLC in `consult/ps215/`; Rahlfs LXX; MS1932 from the PDF text layer; DM1962 Friday Lauds festive canticle). "
       "Copied: 81:5 *Não souberam* (as option), 33:3 *No Senhor será louvada*, 142:2 *será justificado*, 17:32 *senão*, 9:30a *às escondidas*, 57:2 *falar justiça*, 33:6 *aproximai-vos*, 7:13 / D25 *Convertei-vos*, 62:12 *jurar por*, 85:16 *domínio*, 49:16 *as minhas justiças*, 121:6 *rogar*, D15, D27, D32, D41, D43. "
       "Brazilian circulation fetched (`ps215/circulation.md`: CNBB LH Friday Lauds I, a Hebrew-based paraphrase — *Deus escondido*, *Voltai-vos para mim*, *jurar*; the Lectionary, Wednesday of Advent III, Is 45,6b-8.18.21b-25 — *todo joelho há de dobrar-se*, *justificada e glorificada toda a descendência de Israel*). "
       "**Hardest / for Gustavo:** 45:28 *curvábitur omne genu … jurábit* → *se dobrará todo joelho … jurará* (Isaiah's Latin, not Paul's *confitébitur*; *dobrar* against the curvar row); 45:21 *frustra* left open between the saying and the quotation; 45:23 *Nada / Não souberam*; 45:24 *consiliámini* → *tomai conselho* (a departure from the *planejar* row); 45:30 *louvada* against the circulating *glorificada*. "
       "New rows: *plastes*, *fabricátor*, *nescíre* (absolute, for Gustavo), *repugnáre*, *audítum fácere* (all open), formulas *Quia mihi curvábitur omne genu* and the antiphon *In Dómino justificábitur* (open); evidence added to 22 rows. Scripts: `ps215/show_parallels.py`, `gloss.py`, `concord.py`, `fix_v1.py`, `revise_v2.py`, `audit_v2.py`, `checks_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 215 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 215:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
