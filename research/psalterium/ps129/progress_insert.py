"""Insert Ps 129's row into the shared PROGRESS.md after the last row numbered 119-128 (re-read at run time).
python3.13 research/psalterium/ps129/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 129 | 8 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held: 129:4b *se sustentou na sua palavra* against his *aguardou a sua palavra*). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7, as 119–128 and 133). "
       "The Hetzenauer print read is skipped and owed | latinist ×2 (v1: two minors, both met — 129:4b the Latin's *in* restored, 129:8 the redémptio / rédimet echo → *redimirá*; v2: one minor, held), "
       "stylist (5 remarks: 3 taken — 129:3 *subsistirá*, 129:4b two verbs, 129:8 *redimirá*; 2 kept as options — 129:4a *eu vos esperei*, *há propiciação*; best 129:6, worst 129:4a), "
       "ambiguity (11 readings; unknown *propiciação*, *copiosa*, *vigília* (as watch), *iniquidades* — kept; *suportará* heard as 'tolerate', acted on) — stylist and ambiguity read draft 1 only | " + str(count) + " | "
       "*De profúndis* — Vespers antiphon, Office of the Dead (antiphon *Si iniquitátes*, versicle *De profúndis*), Christmas II Vespers antiphon *Apud Dóminum misericórdia*, Septuagesima Tract, Pent22 Gradual, Pent23 Introit — grep. "
       "Brazilian circulation fetched, not asserted (CNBB LH, Hebrew-based: *Das profundezas eu clamo a vós, Senhor*, *quem haverá de subsistir?*, *copiosa redenção*; Vulgate-based devotional De profundis for the souls with *observardes as iniquidades*, *propiciação*, *clemência*, *remir*) in `ps129/circulation.md`. "
       "**Hardest / for Gustavo:** 129:4a *propitiátio* → *propiciação* (placátio's word, D43; unknown to the blind reader again; *clemência*, *perdão* options); 129:1 *clamei* (the Latin's perfect) against the familiar *clamo*; "
       "sustinére three times in two verses → *subsistirá* / *esperei por vós* / *se sustentou na* (by construction; the Latinist runs pulled 4b opposite ways); 129:8 *redimirá* — a local exception to the redímere row for the echo with *redenção*. "
       "New rows *observáre* (God, of sins), *copiósus*, *fíant … intendéntes*; the formula row; evidence added to 9 rows. Scripts: `ps129/revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 129 |') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+) \|', l)
    if m and 119 <= int(m.group(1)) < 129:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:8])
