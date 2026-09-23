"""Insert canticle 226's row into the shared PROGRESS.md, after the last row numbered 150-225 (re-read at run time).
python3.13 research/psalterium/ps226/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 226 (Audíte, cæli, quæ loquor — Canticum Moysis, Deut 32:1–43, Saturday Lauds II) | 65 | 2 | reviewed — Latinist gate on v2 clean of majors; one minor held as an option (32:7 *possuiu*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json | "
       "latinist ×2 (v1: 4 minors — 2 taken, *a minha palavra* and *o tomou*, *tesouros* with the stylist; *cordel* refused for the row; v2: 1 minor, held), "
       "stylist (17 remarks: 8 taken — *Adense-se*, *a minha palavra*, *na imundície*, *que te adquiriu*, *em volta*, *a criança de peito*, *Não foi por isto: porque*, *tesouros*, *em quem*; 9 refused, four for glossary rows; worst 32:38, best 32:22), "
       "ambiguity (63 readings, mostly as open as the Latin; *possuiu* = sexual/demonic, *o que mama* misparsed, *por isso, porque* muddled — acted on; 13 unknown words, kept) | " + str(count) + " | "
       "DO ids 32:1–32:65 are line numbers; the text is Deut 32:1–43 (map in `ps226/show_parallels.py`). Heading line not translated (D7). The text is Jerome's Deuteronomy, not the Gallican. "
       "render.py and checks.py ran unchanged on 226. `ps226/show_parallels.py` builds `consult/parallels/ps226.md` from Bolls VULG/DRB/WLC, the Rahlfs LXX csv, MS1932 from the PDF text layer (pp. 361–365) and the Diurnal Monástico 1962 (Deut 32:1–18 only). "
       "Copied: 134:14a (32:52), 16:8 (*a menina do olho*), 104:11 (*a corda da sua herança*), 77:21 (*um fogo se acendeu*), 13:3 (*veneno de áspides*), 215/216 (*senão eu*). "
       "Brazilian circulation fetched (`ps226/circulation.md`): CNBB LH Saturday Lauds II (Dt 32,1-12); Lectionary responsorials Tuesday wk 19 year I (Dt 32,3-12, *A porção do Senhor é o seu povo*) and Friday wk 18 year II (Dt 32,35cd-36ab.39abcd.41). "
       "**Hardest / for Gustavo:** 32:7 *possédit* → *adquiriu* (off the *possidére* row, person as object); 32:49 *thesáuris* → *tesouros* (against the open *depósito* row, two readers); 32:15 *provoca* held (options *incita*, *estimula*); 32:21 *tutano do trigo*; 32:63 *de captivitáte, nudáti … cápitis*. "
       "New rows: *hostis*, *factor*, *recalcitráre*, *medúlla*, *lactans*, *cóndere*, *sordes*, *circumdúcere*, *concréscere* (open); evidence added to 14 rows. Scripts: `ps226/show_parallels.py`, `concord.py`, `gloss.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 226 ') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+)[ |]', l)
    if m and 150 <= int(m.group(1)) < 226:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:12])
