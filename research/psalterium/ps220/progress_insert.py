"""Insert canticle 220's row into the shared PROGRESS.md, after the last row numbered 150-219 (re-read at run time).
python3.13 research/psalterium/ps220/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 220 (Benedíctus es, Dómine, Deus patrum nostrórum — Dan 3:52–57, Sunday Lauds II) | 7 | 2 | reviewed — Latinist clean on v1 and on the v2 gate (no remarks). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (both clean), stylist (7 remarks: 1 taken — *Bendito sois vós, que*; *e vos sentais* and *E bendito é* kept as options; *para sempre* at every final, *por todas as eras*, and the 3:58 refrain reorder refused; best 3:57, worst 3:56), "
       "ambiguity (6 readings, *querubins* and *firmamento* unknown; none acted on) | " + str(count) + " | "
       "DO ids 3:52–3:58: DO splits the Clementine 3:52 in two, so its ids run one ahead (DO 3:58 = Vulg 3:57, the Benedicite's first verse). Heading *(Canticum Trium Puerorum * Dan 3:52-57)* not translated (D7). Latin = Vulgate Daniel from Theodotion's Greek. "
       "render.py and checks.py ran unchanged; `ps220/show_parallels.py` builds `consult/parallels/ps220.md` (Bolls VULG, Rahlfs Theodotion + Old Greek, DRB from drbo.org, **MS1932 Daniel from the PDF text layer, printed pp. 766–767** — canticle 210 had thought it unavailable). "
       "Copied: 3:52b = 210's 3:56b, 3:58 = 210's 3:57, 79:2b *estais sentado sobre os querubins*, 71:19's verbless *E bendito o nome*, 212's *por todos os séculos*, *Bendito sois*, *digno de louvor*. "
       "Circulation (`ps220/circulation.md`): CNBB LH Sunday Lauds and the Lectionary (Dn 3,52.53-54.55.56-57) sing the same paraphrase, *Sede bendito … A vós louvor, honra e glória eternamente!*; the Diurnal lacks the canticle. "
       "**Hardest / for Gustavo:** *super-* ×8 → *sumamente* (210's word, now also *sumamente digno de louvor / glorioso*; *muito* collides with *laudábilis nimis*; 3:54b–3:55b run +6); *intuéri* → *olhais* (new row; *sondais* CNBB option); 3:53 verbless. "
       "New rows: *intuéri*, *superlaudábilis / supergloriósus* (open); evidence added to 5 rows. Scripts: `show_parallels.py`, `concord.py`, `glossrows.py`, `revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 220 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 220:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
