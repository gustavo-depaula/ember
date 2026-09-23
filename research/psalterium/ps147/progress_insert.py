"""Insert Ps 147's row into the shared PROGRESS.md after the last row numbered 119-146 (re-read at run time).
python3.13 research/psalterium/ps147/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 147 | 9 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held as an option: 147:3 *Ele pôs a paz nas tuas fronteiras* against his double accusative *Ele fez das tuas fronteiras a paz*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7: DO's Psalm147.txt has no *Allelúja* line). The Hetzenauer print read is skipped and owed | "
       "latinist ×2 (v1: three minors, all taken — *a sua fala*, *quem suportará?*, the singular *toda nação*; v2: one minor, held), stylist (5 remarks: 4 taken — 147:3 *e te sacia com a gordura do trigo*, 147:4 *a sua fala*, 147:6 *como migalhas*, 147:9 *fazer assim com*; 1 option — *resistirá*; best 147:5, worst 147:4), "
       "ambiguity (13 readings; unknown *ferrolhos* (kept), *subsistirá*, *bocados* (both replaced); *espírito* heard as the Spirit first, held) — stylist and ambiguity read draft 1 only | 16 | "
       "Copied: 147:3 *ádipe fruménti* = 80:17; 147:6 *quis sustinébit* began as 129:3 and left it (the sustinére row's *suportar*; a ruling on 129:3 proposed); 147:7 built as 106:20 (*Enviou a sua palavra, e os curou*) and 77:20 / 104:41 (*correram as águas*). "
       "Liturgy by grep: Alleluia verse 147:1–2 (Pasc2-3, Pasc3-0t); Corpus Christi V. *Pósuit fines tuos pacem. R. Et ádipe fruménti sátiat te* (Pent01-4, Pent02-5o) — formula row. Brazilian circulation fetched, not asserted (`ps147/circulation.md`: lectionary/LH *Glorifica o Senhor, Jerusalém … celebra teu Deus, ó Sião*; *A paz em teus limites garantiu e te dá como alimento a flor do trigo* — Hebrew-based; neither taken, *flor do trigo* an option). "
       "**Hardest / for Gustavo:** 147:4 elóquium beside sermo → *a sua fala … a sua palavra* (D15's λόγιον/λόγος split; *fala* now the second word for speech in 55:11 and here); 147:7 *soprará o seu espírito* (not *vento*); 147:9 *non … omni* kept open. "
       "**For the main session:** the *Qui* clauses are *Ele …* here and in 145:7a but bare *Que …* in Ps 146 (146:9 and 147:5 are both *Qui dat*). 2 new rows, 1 formula, evidence on 8 rows. "
       "Scripts: `ps147/concord.py`, `gloss.py`, `revise2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 147 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 147:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
