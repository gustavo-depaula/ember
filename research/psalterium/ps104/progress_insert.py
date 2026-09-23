"""Insert ps104's PROGRESS row in psalm order (after the last row numbered below 104). Re-reads and writes in one go."""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = (
    f"| 104 | 44 | 2 | reviewed — Latinist gate clean of majors (v2: four minors; one taken, 104:38 *pesou* for the perfect of *incúbuit*; three held with reasons: "
    "104:26 the supplied *e* before *Aarão* (without it Aaron is heard as an apposition to Moses), 104:33 *árvores* against *arvoredo* (lignum row), "
    "104:24 *mais forte que* against *fortaleceu acima de* (super as a comparative, 50:9, 18:11)). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; "
    "Latinist and stylist read latin.json. No DM1962 section for this psalm. The Hetzenauer print read is skipped and owed "
    "| latinist ×2 (v1: one major — 104:6 *servi ejus* as genitive singular, refused on the printed LXX plural δοῦλοι; five minors: 104:19 *A palavra do Senhor* taken, 104:9, 24, 33, 38 held), "
    "stylist (7 remarks: 4 taken — 104:5, 15, 19 twice, 30; refused 104:6, 104:28 *exacerbou*, 104:32 *fogo ardente*; worst 104:19, best 104:4), "
    "ambiguity (38 items, 11 unknown words; 104:19 *enviou* without an object mended) "
    f"| {count} | the narrative follows Ps 77 wherever the Latin repeats (104:36 = 77:51, 104:29 ≈ 77:44, *mosca canina*, *pão do céu*, *e correram as águas*, *tirou*); "
    "104:41 *Rompeu* against 77:15 *Fendeu* (the Latin verb rules). Rows proposed: *funículus*, *pertransíre*, *incúmbere*, *bruchus*, *penetrália*, *pónere* with two accusatives; "
    "five formula rows for the Saturday Matins antiphons and versicles and the Quad4-4 Introit verse. D31 (104:16 *esteio*) and D32 (104:6 *descendência*) applied at their named tests; "
    "104:28 *exacerbou* is a local exception to D27 for Gustavo; Ps 105 had only a literal draft to compare |"
)
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 104 |') for line in lines):
    raise SystemExit('already there')
at = None
for i, line in enumerate(lines):
    m = re.match(r'\| (\d+) \|', line)
    if m and int(m.group(1)) < 104 and i > 5:
        at = i
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after line', at + 1)
