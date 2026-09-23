"""Insert Ps 148's row into the shared PROGRESS.md after the last row numbered 119-147 (re-read at run time).
python3.13 research/psalterium/ps148/progress_insert.py"""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
pr = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = ("| 148 | 14 | 2 | reviewed — Latinist gate on v2 clean of majors (one minor verse, held: 148:12 *só o seu nome* against his *o nome só dele* — option; the missing *(13)* marker refused by the brief). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7; DO's Psalm148.txt begins at *Laudáte*, no *Allelúja*). The Benedicite (DO Psalm210) shares much but is not yet translated, so no precedent; named where it bears (*glácies* beside *pruína*, *virtútes*, *aquæ super cælos*) | "
       "latinist ×2 (v1: no remarks; v2: one minor verse, held), stylist (7 remarks: 3 taken — 148:4 *as águas acima dos céus*, 148:14a *acima do céu e da terra*, 148:14b *o povo que dele se aproxima*; 3 options — bare *foram feitas* (32:9 identity), *lei* for *decreto* (D19), *vento das tempestades* (10:7 identity); *chifre* kept at his own request; best 148:3, worst 148:14a), "
       "ambiguity (26 readings; unknown *céus dos céus*, *abismos*, *chifre* figurative, *confissão* as praise — kept; *poderes* heard abstract, as at 102:21) — stylist and ambiguity read draft 1 only | " + str(count) + " | "
       "Copied: 148:5 = 32:9 whole; 148:2 *todos os seus poderes* = 102:21; 148:6 = 9:6's *para sempre, e pelos séculos dos séculos* + D19 *decreto* + 104:10 *firmar*; 148:8 *vento de tempestades* = 10:7, *cumprem a sua palavra* = 102:20; 148:7 *dragões* = 73:13; 148:10 *aves aladas* = 77:27; 148:14a *exaltou o chifre* (cornu row). Liturgy by grep: Lauds antiphon *Omnes Ángeli ejus * laudáte Dóminum de cælis*; *Sol et luna … exaltátum est nomen ejus solíus* (Quad3-0); *Júvenes et vírgines …* (Nat2-0). "
       "Brazilian circulation fetched (`ps148/circulation.md`: CNBB LH, Hebrew-based and metrical — *Louvai o Senhor Deus nos altos céus*, *grandes peixes* — none taken). "
       "**Hardest / for Gustavo:** 148:14a *A sua confissão* (the fourth praise-place of the noun, with 95:6, 103:1b, 110:3; with *ejus* it can be heard as God confessing); 148:1/7 *desde os céus … desde a terra* (*dos céus* heard as 'Lord of the heavens'); 148:10 *pécora → gado* beside *feras* (against 8:8's *animais*). "
       "New rows *de cælis … de terra*, *glácies*, *super* → *acima de*, *Hymnus ómnibus sanctis*; two formula rows (32:9 = 148:5; the antiphons); evidence on 17 rows. Scripts: `ps148/concord.py`, `revise_v2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 148 |') for l in lines):
    print('already there')
    raise SystemExit
idx = None
for i, l in enumerate(lines):
    m = re.match(r'\| (\d+) \|', l)
    if m and 119 <= int(m.group(1)) < 148:
        idx = i
lines.insert(idx + 1, row)
pr.write_text(''.join(lines), encoding='utf-8')
print('inserted after line', idx + 1, lines[idx][:8])
