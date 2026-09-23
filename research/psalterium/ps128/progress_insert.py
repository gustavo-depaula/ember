"""Insert Ps 128's row into the shared PROGRESS.md after the last row with a lower psalm number in 119-127 (re-read at run time).
python3.13 research/psalterium/ps128/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 128 | 7 | 2 | reviewed — Latinist gate clean (v2: no remark). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7, as 119–127 and 133). "
       "The Hetzenauer print read is skipped and owed | latinist ×2 (v1: one minor, 128:3 *trabalharam* generic — his cognate *fabricaram* refused, the fault met by *forjaram*; v2: clean), "
       "stylist (4 remarks: 3 taken — *forjaram*, *O Senhor, que é justo,*, 128:7 *Dela não encheu a mão quem ceifa, * nem o regaço quem recolhe os feixes*; 1 refused — quotation marks in 128:8; best 128:2, worst 128:7), "
       "ambiguity (14 readings; *seio* heard as the breast and *trabalharam* as 'behind my back', both acted on; *pescoços* heard as beheading, kept; unknown *bendissemos*, *ceifa*, *feixes*) — stylist and ambiguity read draft 1 only | 12 | "
       "*Sæpe expugnavérunt me* — 128:1a the Vespers antiphon (Daya3; Monastic feria 2), 128:1–4 the Tract of Passion Sunday (Quad5-0), 128:3 read of the scourging by St Bernard (V6) — grep. "
       "Brazilian circulation fetched, not asserted (CNBB LH, Hebrew-based: *Quanto eu fui perseguido desde jovem*, *o meu dorso*, *a erva dos telhados*, *Em nome do Senhor vos bendizemos*; Hora Média of Thursday, week IV by inference) in `ps128/circulation.md`. "
       "**Hardest / for Gustavo:** 128:2 *étenim* → *mas* (local departure from the row's *pois*, heard as 'because'); 128:3 *fabricavérunt* without an object → *forjaram*; 128:7 *sinus* → *regaço* (local departure from *seio*); "
       "128:8b *nós vos bendissemos* (117:26b; CNBB's present an option) with the speaker left open. New rows *sæpe*, *concídere*, *cervix*, *prolongáre*, *præteríre*, the antiphon formula; evidence added to 12 rows. "
       "Scripts: `ps128/revise_v2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 128 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 128:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
