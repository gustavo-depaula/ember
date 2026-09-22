"""Insert the Ps 66 row into PROGRESS.md in psalm order (targeted, reads fresh)."""
import re
from pathlib import Path

g = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = g.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 66 |') for l in lines), 'already there'
row = ("| 66 | 6 | 2 | reviewed — Latinist gate clean (v2: one minor, 66:3 *em todas as nações* for *entre*, taken). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator** (Codex out of credits). The Hetzenauer print read is skipped and owed "
       "| latinist ×2 (v1: two minors, one point — *louvem* for D5's *deem graças* at 66:4 = 66:6, held, option; v2: the minor above, taken), "
       "stylist (4 remarks: taken 66:7b subject first *Deus nos bendiga* (worst line) and *e que o temam*; bare vocative *Deus* at 66:4 / 66:6 held under the row, option *ó Deus*; best 66:3), "
       "ambiguity (8 items, every likeliest hearing right; *o* of *e o temam* as an article → mended; unknown *equidade*, *exultem*, *confins*, kept) — stylist and ambiguity read draft 1 only "
       "| 7 | *Deus misereátur.* 66:2a is the Lauds antiphon; 66:7b's colons are said alone (blessing, responsory). "
       "**Hardest:** the third-person wish four times (66:4 = 66:6, *Que os povos vos deem graças*), 66:7b verb-first blessing vs subject-first, *benedícere* God → man kept *bendizer* (open row). "
       "New row (open): métuere → temer; one formula row; evidence added to 6 rows. Scripts: `ps066/revise_v2.py`, `finish_v2.py`, `gloss.py`, `progress.py`, `glossary_rows.json`. |")


def num(l):
    m = re.match(r'\| (\d+) \|', l)
    return int(m.group(1)) if m else None


rows = [(i, num(l)) for i, l in enumerate(lines) if num(l) is not None]
before = [i for i, n in rows if 56 <= n < 66]
after = [i for i, n in rows if 66 < n <= 80]
i = (max(before) + 1) if before else min(after)
lines.insert(i, row)
g.write_text('\n'.join(lines), encoding='utf-8')
print('inserted at', i + 1)
