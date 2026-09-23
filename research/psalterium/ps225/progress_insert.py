"""Insert canticle 225's row into the shared PROGRESS.md, after the last row numbered 150-224 (re-read at run time).
python3.13 research/psalterium/ps225/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 225 (Dómine, audívi auditiónem tuam — Canticum Habacuc, Hab 3:2–19, Friday Lauds II) | 32 | 2 | reviewed — Latinist gate on v2 clean of majors; four minors held (3:6b *dos séculos* against his singular *do século*, option; 3:10b *fez ouvir a sua voz*, the row; 3:14b *era como a* against his *é*, option; 3:19a *corças* against *cervos*, the row). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 2 minors, *cervos* and *deu a sua voz*, both refused under rows; v2: 4 minors, held), stylist (12 remarks: 5 taken — *Deteve-se* (pés / pé echo), *dos séculos*, *montareis os vossos cavalos*, *era como a*, *Que a podridão entre*, and *em salmos* in half; refused: *anúncio*, *dai-lhe vida* (option), *Curvaram-se*, *hão de ir*, *arrancado*, *cervos*; best 3:18, worst 3:19b), "
       "ambiguity (about 60 readings; acted on: *seculares* heard as 'lay', the verbless 3:14b, *entre* as 'between'; *chifres*, *peles*, *meu Jesus*, the oaths of 3:9a noted as the Latin's own; unknown Farã, Madiã, quadrigas, proferistes, fulgurante, bramido, fervilhe, cingido, aprisco, corças) | " + str(count) + " | "
       "DO ids 3:2a–3:19b; the inline `(5a)`, `(6a)`, `(10a)` markers not reproduced. Heading *(Canticum Habacuc * Hab 3:2-19)* not translated (D7). Text = Jerome's Vulgate of Habakkuk from the Hebrew, not the Gallican; the LXX is a distant witness. "
       "render.py and checks.py ran unchanged on 225; `ps225/show_parallels.py` builds `consult/parallels/ps225.md` (Bolls VULG, DRB, WLC; Rahlfs LXX csv; MS1932 from the PDF text layer pp. 856–857; DM1962 Friday Lauds; DO pt); third-party texts in `consult/ps225/` (gitignored). "
       "Kept against the Hebrew-family Portuguese (MS1932 glosses, DM1962, CNBB): *chifres* (córnua), *diabo*, *o vosso Cristo*, *meu Jesus* (Jesu meo), *até o pescoço*, *as peles*. *Eu ouvi* twice (3:2a, 3:16a) so the verb is not the *vós* imperative. "
       "Brazilian circulation fetched (`ps225/circulation.md`, fragments only: CNBB LH Friday Lauds II prays Hab 3,2-4.13a.15-19 from the Hebrew, omitting the verses of wrath; not a Mass reading per a Lectionary survey). "
       "**Hardest / for Gustavo:** 3:18 *meu Jesus* (every Brazilian text says *meu Salvador*); 3:19a *corças* (masculine *cervórum*; three Latinist remarks); 3:2a *a vossa notícia*; 3:9a *Levantando, levantareis*; 3:14b *era* vs *é*. "
       "New rows: *sǽculi (genitive of age)*, *quadríga*, *scíndere*, *gurges*, *turbo*, *scatére*, *putrédo*, *germen*, *denudáre*, *obstupefácere*, *fulgúrans*, *mentíri (of a crop)*, *Jesus (in Deo Jesu meo)*, *Deus Dóminus (subject)*, *abscíndere* (all open); evidence added to 16 rows. Scripts: `ps225/show_parallels.py`, `concord.py`, `gloss.py`, `rowfind.py`, `build_v1.py`, `build_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 225 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 225:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
