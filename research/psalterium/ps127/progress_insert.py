"""Insert Ps 127's row into the shared PROGRESS.md after the last row with a lower psalm number in 120-132 (re-read at run time).
python3.13 research/psalterium/ps127/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 127 | 7 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held as an option: 127:2 partitive *comerás dos trabalhos* against his *os trabalhos*, as on v1). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7, as 119–122, 133). "
       "The Hetzenauer print read is skipped and owed | latinist ×2 (v1: two minors — 127:3b plural *oliveiras* taken, 127:2 partitive held; v2: the partitive again, held), "
       "stylist (7 remarks: 4 taken — *és bem-aventurado*, present copula *é / são* in 127:3a–3b, *os bens*; 3 kept as options — *Pois*, *nos caminhos dele*, *aos lados*; worst 127:3a, best 127:6), "
       "ambiguity (11 readings; unknown *rebentos*, *Sião*; *de Sião* heard as 'the Lord of Zion', left as 133:3's formula) | 14 | "
       "*Beáti omnes* — Vespers antiphon (Day3 / Daya3) and Monastic None; 127:3b is the Corpus Christi Vespers antiphon *Sicut novéllæ olivárum* (grep); the Nuptial Mass Gradual *Uxor tua* and Communion *Ecce sic benedicetur* (web, not in DO). "
       "Brazilian circulation fetched (CNBB LH and Lectionary: *Felizes os que temem o Senhor e trilham seus caminhos*, *videira bem fecunda no coração da tua casa*, *rebentos de oliveira*, *O Senhor te abençoe de Sião*) in `ps127/circulation.md`. "
       "**Hardest:** 127:6 *pacem* (accusative, object of *vídeas*) → *a paz sobre Israel*, apart from 124:5's nominative *paz*; 127:3a *in latéribus* → *nos lados* (the Latin's sides, against the Hebrew's recesses all Brazilian texts follow); "
       "127:4–5 *bendito / te bendiga* (the open benedícere row) against the familiar *abençoado / te abençoe*. New rows *vitis*, *latus* (side), *novéllæ*, *uxor*, verbless comparison; evidence added to 9 rows; *bona* now split between *os bens* and *coisas boas* — flagged. "
       "Scripts: `ps127/revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 127 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 127:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
