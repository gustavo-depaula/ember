"""Insert Ps 143's row into the shared PROGRESS.md after the last row numbered 119-142 (re-read at run time).
python3.13 research/psalterium/ps143/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 143 | 18 | 2 | reviewed — Latinist gate clean of majors (v2: one minor, held as an option: 143:10 *éripe me* → *libertai-me* against his *arrancai-me*, the erípere row's source rule). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. No titulus (D7: DO's Psalm143.txt has none). Precedent from `ps143/concord.py`: 143:1 = 17:35, 143:3 built as 8:5 (D25), 143:4 *se fez semelhante* = 48:13, 143:5–7 = 17:10, 17:15, 17:17, 103:32, 143:15b = 32:12 | "
       "latinist ×2 (v1: two minors, both options; v2: one minor, held), stylist (11 remarks: 5 taken — 2b subject named, 3 *a ele* fronted, 6 *Fazei brilhar*, 12b *ornadas em redor,*, 13 *de um para outro*; 6 options — *adestra*, *das muitas águas*, *filhos estrangeiros*, *proferiu*, *transbordando*, *muro*; best 143:5, worst 143:13), "
       "ambiguity (30 readings; *filhos estranhos* heard as odd children, *vaidade* as conceit, *direita* not as the hand; unknown *fulgurar* — replaced — *saltério*, *fumegarão*, *iniquidade*, *celeiros*, *amparo*) — stylist and ambiguity read draft 1 only | 25 | "
       "Saturday Vespers antiphons (143:1–2, 143:15b), Pasc4-0 responsory (143:9), Gradual 03-27 (143:1) — grep; formula row added. Brazilian circulation fetched, not asserted (`ps143/circulation.md`: Ave Maria *plantas novas*, *feliz o povo cujo Deus é o Senhor*; CNBB LH — all Hebrew-based, reading 12–14 as 'our sons'; the Latin's *quorum* makes them the strangers' prosperity, kept). "
       "**Hardest / for Gustavo:** the three rescue verbs 143:7/10/11 (*arrancai-me · libertai-me · arrancai-me*); *filhos estranhos* (second psalm misheard — proposal in the aliénus row); *boves … crassæ* → *vacas* (the Latin's feminine). Evidence added to 12 rows, 7 new terms. "
       "Scripts: `ps143/concord.py`, `draft2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 143 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 143:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
