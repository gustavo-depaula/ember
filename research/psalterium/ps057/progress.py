"""Insert the Ps 57 row into PROGRESS.md in psalm order (targeted, reads fresh)."""
from pathlib import Path
g = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = g.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 57 |') for l in lines), 'already there'
row = ("| 57 | 11 | 2 | reviewed — Latinist gate clean of majors (three minors held, all options: 57:4 *mentiras* against *falsidades* (D15: ψεύδη is mendácium's Greek), 57:8 *que corre* against *que escorre* (*escorre* is 57:9 *fluit*'s), 57:9 *caiu fogo sobre eles* — the v2 gate asked back the *de cima* the v1 gate had refused). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator** (Codex out of credits). The Hetzenauer print read is skipped and owed "
       "| latinist ×2 (v1: two minors, both taken — 57:8 *arma* (present), 57:9 *sobre eles*; v2: the three above), stylist (5 remarks: taken 57:4 the fronted chiasm and *se fizeram estranhos* (worst line), 57:5 *é semelhante ao … como o da*, 57:10 *como a vivos*; bare *seio* refused (the úterus row), *levados* refused (D41/D42); best 57:12), "
       "ambiguity (20 items, 3 unknown words — *áspide*, *encantadores* as snake-charmers, *espinheiro*, kept; 57:11 *quando vir* heard as 'when vengeance comes' → *ao ver*) — stylist and ambiguity read draft 1 only "
       "| 17 | *Si vere útique.* Address *vós* to the judges (57:2–3, 57:10); God is not addressed. No liturgical use of the psalm's own text found (the Matins antiphon *Juste judicáte* is a free form). "
       "**Hardest:** 57:10 *Priúsquam intellégerent spinæ vestræ rhamnum* (kept as the Latin: *entendessem o espinheiro*; the blind reader found it incomprehensible, as it is), 57:2 *vere útique* / 57:12 *útique … útique* (one *de fato* three times; *vere* as *é … verdade que*), 57:4 two womb-words and a colon +10 by the counter. "
       "57:7 *cónteret … confrínget* → *quebrará … despedaçará* (45:10's split, two Greek verbs). D2/D3/D15/D41/D42/D43/D44 applied. New rows (open): útique, recta judicáre, vulva, obturáre, incantáre / venéficus, mola, decúrrere / flúere, supercádere, rhamnus, absorbére, similitúdo (ὁμοίωσις); evidence added to 14 rows. "
       "Scripts: `ps057/revise_v2.py`, `gate_v2.py`, `gloss.py`, `move_terms.py`, `progress.py`, `glossary_rows.json`. |")
i = next(i for i, l in enumerate(lines) if l.startswith('| 56 |'))
lines.insert(i + 1, row)
g.write_text('\n'.join(lines), encoding='utf-8')
print('inserted at', i + 2)
