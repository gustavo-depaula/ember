"""Insert Ps 134's row into the shared PROGRESS.md after the last row numbered 119-133 (re-read at run time).
python3.13 research/psalterium/ps134/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 134 | 21 | 2 | reviewed — Latinist gate clean (v2: no remark). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. The *Allelúja* titulus not reproduced (D7; absent from DO's Latin, as 110–113). The Hetzenauer print read is skipped and owed | "
       "latinist ×2 (v1: 4 minors — 2 taken: 7a *Faz sair* (edúcere, not the Greek's *subir*), 7b *gado*; 2 refused: *se deixará rogar*, *simulacros*; v2: clean), stylist (7 remarks: taken — 134:5 *eu sei*, *gado*, *nem sequer*, 134:14 verb last; kept as options — *tesouros*, *memória*, *Tornem-se*; worst 134:14, best 134:16), "
       "ambiguity (unknown *átrios*, *depósitos*, *memorial*, *aplacar* and the names; *soube* heard as news, acted on) — stylist and ambiguity read draft 1 only | 16 | "
       "Copied: 134:2 = 133:1b (but *Vós que estais*, below); 134:13 = 101:13; 134:14 = 89:13's *deixar-se aplacar para com*; 134:15–18 = 113:12–16 (idols, futures kept, *Façam-se*); 134:21 *ele que* as 133:3. Names *Seon, amorreus, Og, Basã, Canaã* agree with 135:19–20. "
       "Liturgy by grep: 134:1a + 2a and 134:3a + 14b Tuesday Lauds antiphons; 134:6a Wednesday Vespers antiphon (Roman and Monastic). Brazilian circulation fetched, not asserted (CNBB LH, Hebrew-based: *Louvai o Senhor, porque é bom*, *Eu bem sei que o Senhor é tão grande*, *A Seon que foi rei amorreu*) in `ps134/circulation.md`. "
       "**Hardest / for Gustavo:** 134:2 *Vós que estais* — a departure from the 133:1b formula (a bare *Que* after *o Senhor* makes the Lord the one standing, sharpest in the Lauds antiphon), proposed back for 133:1b; 134:14 *deprecábitur* → *se deixará aplacar* (89:13) against *rogar* (reluctance in Brazil); 134:7 two verbs of bringing out → *Faz sair* / *Tira*. "
       "No new rows; evidence added to 11 rows (incl. *cognóvi* without a time-word → *sei*, proposed). Scripts: `ps134/tools/gl.py`, `tools/xref.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 134 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 134:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
