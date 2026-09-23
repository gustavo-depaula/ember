"""Insert Ps 140's row into the shared PROGRESS.md after the last row numbered 119-139 (re-read at run time).
python3.13 research/psalterium/ps140/progress_insert.py"""
import re
from pathlib import Path

pr = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
row = ("| 140 | 11 | 2 | reviewed — Latinist gate clean of majors (v2: two minors, both held as options — 140:5 *unja* against his *engorde* (the impinguáre row, 22:5b; asked on v1 too); 140:6 *no que lhes agrada* against his plural *nas coisas que lhes agradam*). "
       "**All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7; DO's file has none, LXX and MS1932 print *Psalmus David*) | "
       "latinist ×2 (v1: three minors, all held as options — *porta de cerco*, *dar desculpas*, *engorde*), stylist (5 remarks: 2 taken — 140:6 order *até a minha oração ainda está*, 140:8 *Dispersaram-se*; 3 kept as options — *Dirija-se a minha oração*, *me desculpar*, *até que passe*; best 140:9, worst 140:6), "
       "ambiguity (24 readings, nearly all the Latin's own obscurities; unknown *vespertino* (→ *da tarde*, taken), *unja*, *espessura*, *tropeços*) — stylist and ambiguity read draft 1 only | 18 | "
       "Liturgy by grep: 140:2–4a the incensation prayer of the Ordo (*Dirigátur, Dómine…*), 140:2 the Gradual of Quad1-2 / Pent19-0 and the Vespers versicle split after *orátio mea*; *Pone, Dómine, custódiam* R.br.; antiphon *Dómine, clamávi ad te, exáudi me*. "
       "Brazilian circulation fetched (hand-missal *Suba como incenso até vós, Senhor, a minha oração*; CNBB LH *Minha oração suba a vós como incenso*) in `ps140/circulation.md`. "
       "**Hardest / for Gustavo:** 140:2 *Que a minha oração seja dirigida* — the Latin's verb against Brazil's universal *Suba* (option), subject first because *Seja dirigida a / Dirija-se a minha oração* is heard as 'à minha oração'; "
       "140:6–7 left as obscure as the Latin (*no que lhes agrada*, *unidos à rocha*, *porque tiveram poder*, *a espessura da terra*), the Hebrew's 'against' not imported; 140:4 *desvieis* kept apart from inclináre (118:36). "
       "New rows: óstium circumstántiæ, excusáre excusatiónes, communicáre cum, eléctus, vespertínus, crassitúdo, posse (absolute), retiáculum; one formula row; evidence added to 15 rows (140:9 *armaram*, a local departure from statúere → firmar). "
       "Scripts: `ps140/gl.py`, `draft2.py`, `gate2.py`, `glossary_rows.json`, `progress_insert.py`; helper `ps005/glossary_add.py`. |\n")
lines = pr.read_text(encoding='utf-8').splitlines(keepends=True)
if not any(l.startswith('| 140 |') for l in lines):
    idx = None
    for i, l in enumerate(lines):
        m = re.match(r'\| (\d+) \|', l)
        if m and 119 <= int(m.group(1)) < 140:
            idx = i
    lines.insert(idx + 1, row)
    pr.write_text(''.join(lines), encoding='utf-8')
    print('inserted after line', idx + 1)
else:
    print('already there')
