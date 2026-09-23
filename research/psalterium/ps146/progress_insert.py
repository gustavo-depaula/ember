"""Insert Ps 146's row into the shared PROGRESS.md after the last row numbered 119-145 (re-read at run time).
python3.13 research/psalterium/ps146/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 146 | 12 | 2 | reviewed — Latinist gate on v2 clean of majors (three minors, all held as options — 146:2 *os dispersos* against his *as dispersões* (asked on v1 too); 146:7 *ação de graças* as the object of *Entoai* against his adverbial *com louvor*; 146:9 *animais* (the juménta row) against *gado*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. The *Allelúja* titulus is not reproduced (D7; absent from DO's Latin, as in 110–112, 134, 145) | "
       "latinist ×2 (v1: 2 minors — *dispersões*, the *contrítos / contritiónes* echo — both held as options; v2: 3 minors, held), stylist (4 remarks: taken — 146:7 *Entoai ao Senhor ação de graças* (his worst line); kept as options — 3 *quebrantado … quebrantos*, 9 *gado*, 10 *terá gosto*; best 146:4), "
       "ambiguity (14 readings, the likely hearing always the Latin's; unknown *enfaixa*, *contrito*, *cítara*, *comprazerá* — kept) — stylist and ambiguity read draft 1 only | 12 | "
       "Copied: 146:3 *contrito* = 50:19 and *fraturas* = 59:4 (same Greek); 146:5 the *Grande é o … Senhor* formula (47:2); 146:7 *entoai salmos … com a cítara* (D25, 97:5); 146:8b = 103:14 (*feno … e erva para o serviço dos homens*); 146:10a *se comprazerá* = 111:1 (θελήσει ἐν); 146:11 *os que o temem* (102:17), *esperam na sua misericórdia* (32:18b). "
       "Liturgy by grep: antiphons *Deo nostro jucúnda sit laudátio* (146:1b without *decóra*) and *Laudáte Dóminum qui sanat contrítos corde* (Thursday Lauds); the short responsory *Magnus Dóminus noster* (Saturday Vespers) and the St Raphael Gradual (146:5). Brazilian circulation fetched (CNBB LH read verbatim from the saved page `consult/lh-cnbb-salmo-146147.html`; CNBB Bible `consult/bolls-CNBB-19-147.json`) in `ps146/circulation.md`. "
       "**Hardest / for Gustavo:** 146:7 *præcínite* → *Entoai*, which shares the verb with *entoai salmos* (v1's *Começai o canto* kept apart, the stylist's worst line); 146:3 *contrito … fraturas* (Greek consistency with 50:19 / 59:4 against the Latin's root echo); 146:1 *decóra → belo* and *porque o salmo é bom* (subject first so it is not heard as 'the Lord is good'). "
       "New rows: *præcínere*, *in confessióne* as object, *nómina vocáre*, *decórus*; two formula rows; evidence added to 14 rows. Scripts: `ps146/concord.py`, `draft2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 146 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 146:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
