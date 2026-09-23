"""Insert Ps 144's row into the shared PROGRESS.md after the last row numbered 119-143 (re-read at run time).
python3.13 research/psalterium/ps144/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 144 | 22 | 2 | reviewed — Latinist gate clean of majors (v2: two minors, both held as options — 144:2 *Todos os dias* against his *Cada dia* (the per síngulos dies row, asked on v1 too: a ruling across 7:12, 41:11b, 144:2 is proposed); 144:13a *de geração em geração* = 44:18a against *em toda geração e geração*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7; DO's file begins at *Exaltábo te*). The Hetzenauer print read is skipped and owed | "
       "latinist ×2 (v1: two minors, held as options), stylist (6 remarks, none taken — each would swap a glossary word: *anunciarão*, *glória magnífica*, *dar a conhecer*, *atenderá*, *destruirá*, *dirá*; all options but *glória magnífica*; best 144:16, worst 144:5), "
       "ambiguity (26 readings; one taken: 144:19 subject supplied, *Ele fará*; unknown *magnificência* ×2) — stylist and ambiguity read draft 1 only | 21 | "
       "Copied: 144:3 = 47:2 = 95:4; 144:8 = 102:8 (*pátiens* / *longánimis*, one Greek); 144:13a = 44:18a; 144:1–2, 21 = 20:5's formula; 144:10 = 137:4's build; 144:4 *declararão* = 141:3's departure; 144:13b (the Gallican verse the Hebrew lacks) and 144:17 share their second colon word for word. "
       "144:15–16 (Benedictio mensae, Corpus Christi Gradual) checked in DO and the CNBB lectionary fetched: `ps144/circulation.md` — its use as a Brazilian mealtime grace was **not** confirmed. "
       "**Hardest / for Gustavo:** 144:21 *falará o louvor* (stylist: not Portuguese; *dirá* merges loqui with dícere); 144:4 *Geração após geração* (the Hebraism, *após* supplied); 144:14 *levanta … esmagados* (145:8 should copy). 6 new rows, 1 formula, evidence on 14. "
       "Scripts: `ps144/concord.py`, `rows.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 144 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 144:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
