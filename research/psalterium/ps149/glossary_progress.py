"""Ps 149 finishing step: targeted insertions into the shared glossary.md and PROGRESS.md (re-read at run time)."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]

terms = [
    "| chorus (*in choro*) | *em coro* (*Louvem o seu nome em coro*) | open | Ps 149:3. L&S: first a ring-dance with song, then the band, then a choir; the Greek χορός and the Hebrew are the dance. The cognate keeps the word and the Church's sense (DRB 'in choir', MS1932 *em coro*); *na dança* (the CNBB's *com danças*, Hebrew) and *no coro* options. 150:4 *in týmpano et choro* should agree. |",
    "| exaltátio (ὕψωσις) | *exaltação*, the Latin's number (*As exaltações de Deus na garganta deles*) | open | Ps 149:6; the noun of the exaltáre row. *louvores* (MS1932, DRB 'high praise') would merge it with *laus* two verses before; *A exaltação* (DM1962) option. The ambiguity reader listed *exaltações* as unknown but heard 'praises of God'. |",
    "| gládii ancípites | *espadas de dois gumes* | open | Ps 149:6 (plural kept; DM1962 and the CNBB agree, MS1932 *de dois fios*). *gumes* unknown to the ambiguity reader; kept. |",
    "| allígare (in compédibus) · compédes · mánicæ férreæ · nóbiles | *prender (em grilhões)* · *grilhões* · *algemas de ferro* · *nobres* | open | Ps 149:8. *atar* (bind to the letter) option — odd with iron; *prender* is comprehéndere's working verb (D25), never in the same verse. *grilhões* as 104:18 (unknown to the ambiguity reader; kept). *nobres* (DRB), not MS1932's *príncipes* (príncipes's word). |",
    "| increpátio (plural, 149:7) | *repreensões* (*repreensões entre os povos*) | open | Ps 149:7; the increpáre row's noun (17:16b, 38:12). *castigos* (DRB 'chastisements', MS1932, the CNBB) is corrípere's word (D21) and harder than the Latin; option. *in natiónibus … in pópulis → entre … entre* held against a v2 Latinist minor (*sobre / nas*, options). |",
]
formula = "| *Exsultábunt Sancti in glória. R. Lætabúntur in cubílibus suis* (149:5; V./R. Commune C3, Sancti 11-09, missa Ordo/Post.txt) · *… exaltatiónes Dei in fáucibus eórum* (149:5–6a; antiphon, Commune C3a) · *Hymnus ómnibus Sanctis ejus … glória hæc est ómnibus sanctis ejus* (148:14b + 149:9b; All Saints antiphon, Sancti 11-01) — grep | *Exultarão os santos na glória. R. Hão de alegrar-se nos seus leitos* · *… as exaltações de Deus na garganta deles* · *… esta glória é para todos os seus santos* (the dative *para*, as 148:14b) | working — Ps 149 |"
progress = "| 149 | 9 | 2 | reviewed — Latinist gate on v2 clean of majors (one minor, held as an option: 149:7 *entre as nações … entre os povos* against his *sobre / nas*). **All readers were claude-opus-5-5 in fresh context, run by the coordinator**; Latinist and stylist read latin.json. DM1962 parallel read. No titulus (D7: DO's Psalm149.txt has no *Allelúja* line). 149:1a = 95:1 / 97:1; 149:1b = 88:6 *na assembleia dos santos*; 149:4 = 146:11's *se agrada*; 149:9b's dative = 148:14b. Verses 6–9 kept unsoftened and unhardened (*vingança*, *repreensões*, *grilhões*, *algemas de ferro*). v2: 149:6 *na garganta deles … nas mãos deles* (Latinist + stylist: *sua* was heard as God's throat), 149:5b *hão de alegrar-se*, 149:3 *lhe entoem salmos*. Brazilian circulation: `ps149/circulation.md`. |"

g = root / 'glossary.md'
text = g.read_text(encoding='utf-8')
assert 'Ps 149:3. L&S' not in text, 'already applied'
lines = text.split('\n')
f = lines.index('## Formulas (identical wherever the Latin is identical)')
k = f - 1
while not lines[k].startswith('|'):
    k -= 1
lines[k + 1:k + 1] = terms
d = lines.index('## Doublets')
k = d - 1
while not lines[k].startswith('|'):
    k -= 1
lines.insert(k + 1, formula)
g.write_text('\n'.join(lines), encoding='utf-8')

pr = root / 'PROGRESS.md'
lines = pr.read_text(encoding='utf-8').split('\n')
assert not any(l.startswith('| 149 |') for l in lines)
i = max(n for n, l in enumerate(lines) if l.startswith('| 148 |'))
lines.insert(i + 1, progress)
pr.write_text('\n'.join(lines), encoding='utf-8')
print('ok')
