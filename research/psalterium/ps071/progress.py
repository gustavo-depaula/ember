"""Insert the Ps 71 row into PROGRESS.md in psalm order (targeted, reads fresh)."""
import re
from pathlib import Path

g = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = g.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 71 |') for l in lines), 'already there'
row = ("| 71 | 20 | 2 | reviewed — Latinist gate clean of majors (v2: two minors, both held with options — 71:6 *o velo* back, 71:10 *trarão* repeated). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. **For Gustavo: 71:6 *lã* vs *velo*** (the Latinist's fleece against the ambiguity reader's mishearing) "
       "| latinist ×2 (v1: 4 minors — taken 71:12 *quem o auxiliasse*, 71:14 *digno de honra*, 71:16 *esteio*; held 71:10 *trarão* (D42); v2: the two minors above), "
       "stylist (10 remarks: 6 taken — 71:6 *lã*, 71:9 subject first, 71:14 *as suas almas*, 71:15 *e sempre adorarão por ele*, 71:16 comma and *erva*; refused 71:10 *dons*, 71:13 *necessitado* (D38), 71:19 *se encherá* (replére row); best 71:17, worst 71:14), "
       "ambiguity (33 readings; unknown *velo, Társis, Sabá, dádivas, usuras, feno, Líbano*; acted on *velo*, *feno*, *sustento*) — stylist and ambiguity read draft 1 only "
       "| 20 | *Deus, judícium tuum regi da.* Epiphany (71:10–11) and Advent (71:7, 71:8, 71:11) texts; the close of Book II (*assim seja, assim seja*, D41). "
       "**Hardest:** 71:16 *firmaméntum* (D31's local place: *sustento* heard as food → *esteio*) and *fænum* split from 36:2 (*erva* where it flowers); 71:15 *adorábunt de ipso* (*por ele*, kept open); 71:12 *adjútor* as a clause, a local departure from the open row. "
       "New rows (open): oríri, prócidere, vellus, fænum, donum, honorábilis, adoráre de ipso, lingere terram; one formula row; evidence added to 13 rows. Scripts: `ps071/revise_v2.py`, `finish_v2.py`, `gloss.py`, `progress.py`, `glossary_rows.json`. |")


def num(l):
    m = re.match(r'\| (\d+) \|', l)
    return int(m.group(1)) if m else None


rows = [(i, num(l)) for i, l in enumerate(lines) if num(l) is not None]
before = [i for i, n in rows if 56 <= n < 71]
after = [i for i, n in rows if 71 < n <= 80]
i = (max(before) + 1) if before else min(after)
lines.insert(i, row)
g.write_text('\n'.join(lines), encoding='utf-8')
print('inserted at', i + 1)
