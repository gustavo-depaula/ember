"""Update the Ps 118 row of PROGRESS.md for 118:81–128 (draft 11). Earlier notes are kept; this only appends.
python3.13 research/psalterium/ps118/progress_part3.py"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
lines = path.read_text(encoding='utf-8').split('\n')
hits = [i for i, l in enumerate(lines) if l.startswith('| 118 (1–80) |')]
if len(hits) != 1:
    sys.exit('row not found exactly once')
row = lines[hits[0]]

head = '| 118 (1–80) | 80 of 176 | 6 | reviewed (partial: stanzas Aleph–Jod; 118:81–128 next; later agents append) |'
newHead = '| 118 (1–128) | 128 of 176 | 11 | reviewed (partial: stanzas Aleph–Ain; 118:129–176 next; later agents append; **Latinist gate not clean on purpose for 81–128: two majors held, 118:92 and 118:114**) |'
critics = (" **81–128** (read alone, from `ps118/part3/`; outputs `critic/v<k>.<role>.part3.json`): latinist ×3 (v7: 1 minor, 118:114 agent nouns, refused under D19; "
           "v8: 2 majors — 118:128 middle voice taken back to the passive, 118:114 held; v10: 2 majors held — 118:92 the counterfactual for *nisi quod … est*, which he had passed twice, "
           "and 118:114 again — plus 3 minors refused with options: the D16 clause's past tense at 118:82 and 116, *pelo que aguardo* for *ab exspectatióne mea*), "
           "stylist ×2 (v7: 19 verses, worst 118:92, best 118:94; v9: 11 verses, worst 118:128, best 118:105), "
           "ambiguity ×1 (v7: 49 items, 4 real faults mended: 118:82 *pelo que dissestes* heard as cause, 118:85 *fábulas*, 118:97 *todo o dia*, 118:115 *malignos* heard as demons)")
notes = (" **118:81–128 (third agent, drafts 7–11; drafts 6–10 kept as `prayed.v<k>.json`, `literal.v6.json` too):** 118:1–80 proved untouched by `ps118/verify_untouched_v6.py`; "
         "the law-terms add slots to the existing decisions, 48 new verse-local decisions. "
         "**Held against the Latinist on purpose:** 118:92 (counterfactual *Se a minha meditação não fosse a vossa lei … talvez eu tivesse perecido*: Douay-Rheims and Matos Soares both counterfactual, mood is grammar under D2, the indicative build was the stylist's worst line and is option 2 of `nisi_quod`) "
         "and 118:114 (*o meu auxílio e o meu amparo*, D19 and Ps 117's precedent; the same words were minor, then major, then major across his three readings). "
         "Held against the stylist: the passive *eu era dirigido para* (118:128, the Latinist governs), *ditos / dito* (D16), *eternamente* (he put *para sempre* in four lines — evidence on the glossary row). "
         "**D15 held with no reader remark on any law-term.** **D16:** the clause *o que dissestes* passed the stylist twice and the blind reader at 118:82 and 116 (after a preposition it needs care: *pelo que dissestes* was heard as cause, so defícere in → *à espera de*, Matos Soares's word, at 81, 82, 123); "
         "the plural *os vossos ditos* was refused by the stylist twice at 118:103 — its first refusals; the noun *o dito da vossa justiça* (118:123) refused by him twice, understood by the blind reader; the Latinist's only remark on the clause is its tense, on his third reading. "
         "118:95 *para me fazer perecer* restored in draft 11 to agree with the pérdere row opened by Ps 5:7a (D22) — the stylist had found it heavy. "
         "Glossary: 35 term rows and 5 formula rows appended, evidence added to 14 existing rows (`ps118/glossary_part3.py`; every verse list checked by `ps118/grep_latin_part3.py`). "
         "**Wanting a ruling:** the `open` elóquium evidence row (D16), *in ætérnum* → *eternamente* or *para sempre*, *defícere in* → *à espera de*, *exspectáre* → *aguardar* (before Ps 26), *fácere judícium* → *praticar* (collides with operári), *pérdere*, *malígnus*, *permanére / perseveráre*, *odísse / ódio habére*, *tota die* → *o dia todo*. "
         "Rule 3 trap met: *Agi* (118:126 stays *É tempo de agir*). `ps118/part3.py` = part2.py with other defaults; the next agent runs `part3.py 129 176 part4`. Hetzenauer print read still owed. "
         "**The next agent starts from version 11: copy prayed.json to prayed.v11.json first.**")

if not row.startswith(head) or row.count(' | 72 | ') != 1 or not row.endswith(' |'):
    sys.exit('row is not in the shape expected — nothing written')
row = newHead + row[len(head):]
row = row.replace(' | 72 | ', critics + ' | 120 | ')
row = row[:-2] + notes + ' |'
lines[hits[0]] = row
path.write_text('\n'.join(lines), encoding='utf-8')
print('PROGRESS.md row updated')
