"""Ps 122 finishing step: targeted edits to the shared glossary.md and PROGRESS.md (re-read at run time)."""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent


def append_to_row(lines, prefix, addition):
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            assert l.rstrip().endswith('|'), l[:80]
            if 'Ps 122' in l:
                return
            lines[i] = l.rstrip()[:-1].rstrip() + ' ' + addition + ' |\n'
            return
    raise SystemExit(f'row not found: {prefix}')


def insert_after(lines, prefix, row):
    if any(l.startswith(row[:40]) for l in lines):
        return
    for i, l in enumerate(lines):
        if l.startswith(prefix):
            lines.insert(i + 1, row + '\n')
            return
    raise SystemExit(f'anchor not found: {prefix}')


g = root / 'glossary.md'
lines = g.read_text().splitlines(keepends=True)
append_to_row(lines, '| leváre |',
              "**Ps 122:1 *Ad te levávi óculos meos* → *A vós levantei os meus olhos, * vós que habitais nos céus*** — 24:1's order for the same *Ad te levávi* (not 120:1's *Levantei os meus olhos para*, where the Latin itself begins with the verb); *vós que* names the subject of *qui hábitas* (93:2's remedy), so the Monday Vespers antiphon *Qui hábitas in cælis* reads alone. Passed all readers (the stylist's best line).")
append_to_row(lines, '| abundántia |',
              "**Ps 122:4 *oppróbrium abundántibus* (τοῖς εὐθηνοῦσιν) → *afronta para os prósperos*** — 72:12's *prósperos* for persons; the ambiguity reader heard it as neutral 'those who do well', as the Latin is. MS1932 / DRB *ricos* option. Passed the Latinist twice.")
insert_after(lines, '| replére (passive) |',
             "| repléri of what is suffered (*repléti sumus despectióne*) | *estar farto* (*porque estamos muito fartos de desprezo … Porque a nossa alma está muito farta*) | open | Ps 122:3, 122:4 (ἐπλήσθημεν / ἐπλήσθη). Departs from the replére row (*estar cheio*): *cheios de desprezo* (and the Latinist's *repletos*) is heard first as contempt we feel. All three v1 readers heard *fartos* as 'fed up with' — which is contempt suffered to excess, the Latin's sense; kept, and the v2 Latinist passed it. DM1962 *farta*, CNBB *fartos* (verified). Options *cheios*, *saciados* (the stylist; saciar is satiáre's). 87:4 *repléta est malis ánima mea → está cheia de males* stays (nothing to mishear there); 73:20 not yet done. |")
insert_after(lines, '| abúsio |',
             "| despéctio | desprezo (*de desprezo … e desprezo para os soberbos*) | open | Ps 122:3, 122:4, its only places (grep); ἐξουδένωσις, the family already *desprezo* (contémptus 118:22, abjéctio 21:7, abúsio 30:19). L&S 'a looking down upon, contempt'. The CNBB has *desprezo* both times (verified). |")
g.write_text(''.join(lines))

pr = root / 'PROGRESS.md'
plines = pr.read_text().splitlines(keepends=True)
row = ("| 122 | 5 | 2 | reviewed — Latinist gate clean (v2: no remark). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; "
       "Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7, as 119/120/133). Liturgical use and CNBB circulation in ps122/circulation.md. "
       "The Hetzenauer print read is skipped and owed | latinist ×2 (v1: two minors — 122:4 articles, taken as *afronta para os prósperos, e desprezo para os soberbos*; "
       "122:3 *fartos* → *repletos*, option; v2: clean), stylist (4 remarks: 1 taken — 122:4 articles; 3 options — *saciados*, a verb in 122:2b), "
       "ambiguity (8 items, no unknown words; 122:4 draft 1 heard as insult aimed at the prosperous → changed) |\n")
if not any(l.startswith('| 122 |') for l in plines):
    idx = None
    for i, l in enumerate(plines):
        m = re.match(r'\| (\d+) \|', l)
        if m and int(m.group(1)) < 122:
            idx = i
    plines.insert(idx + 1, row)
    pr.write_text(''.join(plines))
