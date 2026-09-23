"""Insert Ps 150's row into the shared PROGRESS.md after the last row numbered 119-149 (re-read at run time).
python3.13 research/psalterium/ps150/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 150 | 5 | 2 | reviewed — Latinist gate on v2 clean of majors. Two minors are held as options: 150:4 *o instrumento* against his *a flauta*, and 150:5 *de aclamação* against his *de júbilo* (D43). The v1 Latinist had counted *instrumento* a fidelity. v2's wording is the same as v1's, because no reader remark was taken into the text. "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7; DO's Psalm150.txt has no *Allelúja* line). The Latin's *(6)* marker is not reproduced | "
       "latinist ×2 (v1: 1 minor — *sonoros* for *benesonántibus*, refused with dictionary evidence, *bem sonantes* option; v2: 2 minors, held), stylist (3 remarks, all refused: *de sua grandeza* (rule 5); *o órgão* and *de júbilo* kept as options; best 150:1, worst 150:4), "
       "ambiguity (8 readings; *coro* heard as singers, *todo espírito* as spirits, *multidão* as a crowd — the named costs; unknown *firmamento*, *saltério*, *cítara*, *címbalos*, *tamborim* — kept) — stylist and ambiguity read draft 1 (the same text) | " + str(count) + " | "
       "Copied: 150:1 *nos seus santos* = 67:36; *firmamento* (D31, decided here as the sky); *poder / poderes* (virtus row, 148:2); 150:2 *multidão … grandeza* (rows); 150:3 *ao som da trombeta* built as 46:6 *à voz da trombeta*, *saltério e cítara* = 56:9; 150:4 *tamborim* (67:26, 80:3), *coro* agreeing with 149:3, *instrumento* = 136:2; 150:5 *aclamação* (D43). Liturgy by grep: the priest's thanksgiving after Mass (missa Ordo/Post.txt) and Holy Saturday Lauds (Quad6-6r). "
       "Brazilian circulation fetched (`ps150/circulation.md`: CNBB LH, Hebrew-based — *dança*, *tambor*, *flautas*, *címbalos sonoros … de júbilo*, *tudo o que vive e que respira*; ARA *todo ser que respira*; nothing in circulation says *todo espírito*). "
       "**Hardest / for Gustavo:** 150:5 *omnis spíritus* → *todo espírito* (the Latin's word; the only line Brazil knows is the Hebrew's *tudo o que respira*); 150:4 *órganum* → *instrumento* (generic, against *flauta* / *órgão*) and *chorus* → *coro* (with 149:3, against *dança*); 150:1 *in sanctis* → *santos* (persons) against the holy places. "
       "New rows: *cýmbala benesonántia · jubilatiónis*, *sonus tubæ*, *chordæ*, *omnis spíritus*; evidence added to 10 rows. Scripts: `ps150/concord.py`, `fix_choro.py`, `revise_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 150 |') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+) \|', l)
    if m and 119 <= int(m.group(1)) < 150:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:8])
