"""Insert canticle 212's row into the shared PROGRESS.md, after the last row numbered 150-211 (re-read at run time).
python3.13 research/psalterium/ps212/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 212 (Magnus es, Dómine, in ætérnum — Tob 13:1–11, Tuesday Lauds I) | 11 | 2 | reviewed — Latinist gate on v2 clean (no remarks). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 2 minors — 13:4 comma taken; 13:8 *a nação* refused, held as an option; v2: clean), "
       "stylist (5 remarks: 3 taken — 13:4 cleft dropped and *ele* named, *narreis vós*, 13:9 *usará da sua misericórdia convosco*; 2 refused — *praticai* (operári's verb; option), *exaltai também*; best 13:6, worst 13:4), "
       "ambiguity (20 readings; 13:4 *por isso* heard pointing back, acted on with *para isto*; 13:2 *infernos* heard as hell, held for ruling; unknown *flagelais*, *infernos*, *iniquidades*, *usar de* — kept) | " + str(count) + " | "
       "DO ids 13:1–13:11 are DO's own (DO splits the Clementine's 13:4, so from 13:6 it runs one ahead). Heading line *(Canticum Tobiæ * Tob. 13:1-11)* not translated (D7, as 233, 211, 213). "
       "Text = Jerome's Vulgate Tobit (from an Aramaic text), not the Gallican; the LXX is a different text, so no Greek test (D15). "
       "render.py and checks.py ran unchanged on 212; `parallels.py` gives only Latin + pt-PT for a canticle, so `ps212/show.py` prints the Clementine and LXX from Bolls (`consult/bolls-{VULG,LXX}-68-13.json`) and DRB from drbo.org (`consult/drb-tobit13.txt`; Bolls has no DRB Tobit); MS1932 from the PDF text layer (`consult/ms1932-tobit13.txt`). "
       "Copied: D23 *para sempre*, 144:13a *todos os séculos*, 43:12 *dispersar entre as nações*, 97:2 *à vista das nações*, 17:32 *senão*, 6:5 *por causa da vossa misericórdia*, 2:11 *temor e tremor*, 125:3 *fez conosco*, 89:3 *Convertei-vos*, 105:3 *fazei a justiça*, 17:51 *usar de misericórdia*, 133:1a *Bendizei o Senhor, todos*, 75:11 *celebrar*, D5 *dar graças* (×4). "
       "Brazilian circulation fetched (`ps212/circulation.md`: CNBB LH Tuesday Lauds I prays Tb 13,2-8 from the Greek-based text as a paraphrase — *Vós sois grande, Senhor, para sempre*, *fazeis descer aos abismos da terra*, *seus eleitos* — and the Lectionary's Tb 13 responsorial has the same text; the Creed *todo-poderoso*, *desceu à mansão dos mortos*; DO's antiphon *Exaltáte Regem sæculórum in opéribus vestris*). "
       "**Hardest / for Gustavo:** 13:2 *ad ínferos* → *aos infernos* (the Latin's plural; the Creed says *mansão dos mortos*; proposed as a formula row for 212, 223, 234); 13:4 *ídeo … ut* → *para isto … para que* (a local departure from the *por isso* row) and *ignórant* → *não o conhecem* (*ignorar* = snub); 13:8 *in gentem peccatrícem* → *sobre uma nação* (which nation left open). "
       "New rows: *flagelláre*, *effúgere*, *ignoráre*, *Rex sæculórum*, *præter* (all open), formula *ad ínferos* (open, for Gustavo); evidence added to 18 rows. "
       "Scripts: `ps212/concord.py`, `gloss.py`, `show.py`, `strip.py`, `patch_v1.py`, `revise_v2.py`, `checks_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 212 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 212:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
