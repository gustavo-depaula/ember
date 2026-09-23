"""Insert Ps 145's row into the shared PROGRESS.md after the last row numbered 119-144 (re-read at run time).
python3.13 research/psalterium/ps145/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 145 | 9 | 3 | reviewed — Latinist gate on v2: **one major held, for Gustavo** (145:4 *in terram suam* → *voltará à terra*: with *sua* the blind reader heard the native land; the gate wants *suam* back — option 1, one touch); one minor held as the option (145:7a *Ele guarda* against the relative *Que guarda*). "
       "**Draft 3 (145:8b *esmagados*, copying 144:14) is unread by a gate.** **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. The *Allelúja* titulus not reproduced (D7; absent from DO's Latin). The Hetzenauer print read is skipped and owed | "
       "latinist ×2 (v1: 2 minors — *auxiliador*, *Que guarda* — both held as options; v2: 1 major held, 1 minor held), stylist (5 remarks: taken — 2b *Nos príncipes não confieis*, 9 *destruirá*, 10 *ó Sião*; kept as options — 5 *e cuja esperança*, 7a *julga a causa*; worst 7a, best 7b), "
       "ambiguity (22 items, no unknown words; acted on: 4 homeland, 10 Sião as apposition, 9 *exterminará* heard as the sinners) — stylist and ambiguity read draft 1 only | 15 | "
       "Copied: 145:2a = 102:1's build (*Louva, ó minha alma, o Senhor*) and 103:33's last colon (*enquanto eu existir*); 145:5 83:6's *cujo auxílio* + the *que fez o céu e a terra* formula; 145:7a = 102:6 (*faz juízo para os que sofrem injustiça*); 145:7b = 101:21 (*solta os acorrentados*); 145:8b = 144:14 (*esmagados*); 145:9 = 93:6's *forasteiro*, *órfão*, *viúva*. "
       "Liturgy by grep: antiphons *Laudábo Deum meum in vita mea* and *Lauda ánima mea Dóminum, qui érigit elísos et díligit justos*; Offertory Pasc3-0 / Pasc7-5 (145:2a). Brazilian circulation fetched (CNBB LH, Hebrew-based, in `ps145/circulation.md`; page in `consult/lh-cnbb-salmo-145146.html`); Lectionary refrains by search summary only. "
       "**Hardest / for Gustavo:** 145:4 *voltará à terra* (the held major); 145:9 *destruirá* departs from the *dispérdere → exterminar* row with a thing as object (proposed); 145:7a *faz juízo* heard by the stylist as 'behave sensibly', held for 102:6. "
       "New rows: *revérti in terram suam* (open, for Gustavo), the formula row for the Offertory/antiphons; evidence added to 13 rows. Scripts: `ps145/concord.py`, `revise_v2.py`, `revise_v3.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 145 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 145:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
