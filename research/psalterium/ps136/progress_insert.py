"""Insert Ps 136's row into the shared PROGRESS.md after the last row numbered 119-135 (re-read at run time).
python3.13 research/psalterium/ps136/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 136 | 12 | 2 | reviewed — Latinist gate clean of majors (v2: two minors, both held as options — 136:1 gerund *lembrando-nos* against *quando nos lembrávamos*; 136:6b *puser* against *propuser*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7) | "
       "latinist ×2 (v1: one minor, 136:7b *nela* — option; v2: two minors, held), stylist (3 remarks, all taken: 136:3a the Latin's order, 136:8 *infeliz* for *miserável*, 136:9 the row's *tomar* and no comma; best 136:4, worst 136:3a), "
       "ambiguity (21 readings, unknown *Edom*, *salgueiros*, *arremessar*, *retribuíste*; *miserável* heard as an insult, acted on) | 18 | "
       "*Super flúmina* — 136:1 the Offertory of Pent20-0 and Quad5-4 (Missal's *dum … tui, Sion*); Responsories 1 and 6 of Easter IV (Pasc4-0); Monastic Vespers antiphon *Hymnum cantáte nobis * de cánticis Sion* — grep. "
       "Brazilian circulation fetched (CNBB LH *Junto aos rios da Babilônia*, 136:1–6 only on the page; Lectionary, Lent IV B, refrain *Que se prenda a minha língua ao céu da boca, se de ti, Jerusalém, eu me esquecer*) in `ps136/circulation.md`. "
       "**136:8–9 translated as they stand**, neither softened nor intensified: *Bem-aventurado quem tomar e arremessar os teus pequeninos contra a rocha* (not *esmagar* / *despedaçar*). "
       "**Hardest / for Gustavo:** 136:1 *Sobre os rios* (the Latin's word) against the LH's *Junto aos*; 136:2 *instrumentos* (órgana) against the familiar *harpas*; 136:6a *à minha garganta* (= 21:16) against the refrain's *ao céu da boca*; 136:7b *Esvaziai* (LXX image) against *Arrasai*. "
       "New rows *órganum*, *cántio*, *abdúcere*, *propónere*, *míser*, *salix*, two formula rows; evidence added to 13 rows. Scripts: `ps136/revise_v2.py`, `glossary_rows.json`, `progress_insert.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if any(l.startswith('| 136 |') for l in lines):
    print('already there')
else:
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 136:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
