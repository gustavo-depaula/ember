"""Insert the Ps 64 row into PROGRESS.md in psalm order (targeted, reads fresh)."""
import re
from pathlib import Path

g = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = g.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 64 |') for l in lines), 'already there'
row = ("| 64 | 14 | 2 | reviewed — Latinist gate clean of majors (six minors: 64:8 *véspere* ablative, *e à tarde*, taken after the gate — his own fix, no critic has re-read it; "
       "four held as options: 64:8 *a signis* causal, 64:10 *o enriquecê-la* (twice), 64:11 *germinando* (the v1 run asked the opposite — for Gustavo), 64:14 *Vestiram-se*; 64:14 *étenim* 'e sim' refused, left to the étenim row). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator** (Codex out of credits); Latinist and stylist read latin.json. The Hetzenauer print read is skipped and owed "
       "| latinist ×2 (v1: five minors — 64:5 *tomastes para vós*, 64:11 *o que germina*, 64:13 *os lugares formosos* taken; 64:8, 64:10 options; v2: above), "
       "stylist (9 remarks: taken 64:5, 64:6 comma, 64:7 *com o vosso poder*, 64:8 *os confins*, 64:14 verb first and *hão de entoar*; options 64:12 *bondade* (D44), 64:13 *Ficarão fartos*, 64:11 *o que brota* / 64:8 *extremos*; worst 64:13, best 64:10), "
       "ambiguity (29 readings, 10 unknown words, all glossary words; *propício às nossas impiedades* heard as God favouring sin — flagged in the row) — stylist and ambiguity read draft 1 only "
       "| 25 | *Te decet hymnus* (Lauds antiphon, Requiem Introit, Office of the Dead). "
       "**Hardest:** 64:8 *éxitus matutíni, et véspere* (kept concrete; the ablative taken), 64:10 *multiplicásti locupletáre eam* (Hebraism: *multiplicastes a sua riqueza*), 64:7 *virtus* and *poténtia* in one verse (*poder* / *potência*). "
       "New rows (open): replére → encher (passive), poténtia, accíngere, locupletáre, rivus, genímina, stillicídium, gérminans, speciósa, indúere, hymnum dícere, éxitus… véspere, collis; one formula row; evidence added to 15 rows (64:5 departs from *assúmere → recolher*). "
       "Scripts: `ps064/revise_v2.py`, `gloss.py`, `progress.py`, `glossary_rows.json`. |")


def num(l):
    m = re.match(r'\| (\d+) \|', l)
    return int(m.group(1)) if m else None


rows = [(i, num(l)) for i, l in enumerate(lines) if num(l) is not None]
before = [i for i, n in rows if 54 <= n < 64]
after = [i for i, n in rows if 64 < n <= 80]
i = (max(before) + 1) if before else min(after)
lines.insert(i, row)
g.write_text('\n'.join(lines), encoding='utf-8')
print('inserted at', i + 1)
