"""Update the Ps 118 row of PROGRESS.md for 118:129–176 (draft 16): the psalm is whole, so the row becomes `118`.
Earlier notes are kept; this changes the head cells and appends. Reads and writes in one step.
python3.13 research/psalterium/ps118/progress_part4.py"""

import sys
from pathlib import Path

path = Path(__file__).resolve().parents[1] / 'PROGRESS.md'
lines = path.read_text(encoding='utf-8').split('\n')
hits = [i for i, l in enumerate(lines) if l.startswith('| 118 (1–128) |')]
if len(hits) != 1:
    sys.exit('row not found exactly once — nothing written')
row = lines[hits[0]]

head = '| 118 (1–128) | 128 of 176 | 12 | reviewed (partial: stanzas Aleph–Ain; 118:129–176 next; later agents append; **Latinist gate not clean on purpose for 81–128: two majors held, 118:92 and 118:114**) |'
newHead = '| 118 | 176 | 16 | reviewed (**whole: Aleph–Tau**, staged over four agents; **Latinist gate not clean on purpose for 81–128: two majors held, 118:92 and 118:114**; clean of majors for 129–176) |'
critics = (" **129–176** (read alone, from `ps118/part4/`; outputs `critic/v<k>.<role>.part4.json`): latinist ×4 (v13: 6 minors, all one remark — the D16 clause's past tense — refused; "
           "v14: the same minors plus 118:140 CRITICAL and 118:138 MAJOR, both on wordings draft 14 had changed for the blind reader, both taken in substance; v15: no remark at all; "
           "v16, the gate on the final wording: no major, 2 minors refused with options — 118:140 *todo* for *veheménter*, 118:152 *Desde o início*, which he had passed three times), "
           "stylist ×2 (v13: 9 verses, worst 118:152, best 118:142; v15: 10 verses, worst 118:138, best 118:142 again — of the 10, 5 taken in draft 16 (118:136, 138, 152, 154, 175 — his own line or its substance), 3 are *ditos* (D16), 2 held: 118:135, 118:173; **no stylist has read draft 16**), "
           "ambiguity ×2 (v13: 42 items, 3 real faults mended — 118:138 *Mandastes* + bare object heard as \"you sent\", 118:154 *Julgai o meu juízo* heard as \"evaluate my opinion\", 118:140 *muito ardente* heard as \"fervent\"; v15: 36 items, all three heard rightly)")
notes = (" **118:129–176 (fourth agent, drafts 13–16; drafts 12–15 kept as `prayed.v<k>.json`, `literal.v12.json` too): THE PSALM IS WHOLE.** `range` reads 118:1–118:176 and the ordinary `checks.py` now exits 0 on the folder, as does `ps118/partial.py`; "
         "118:1–128 proved untouched by `ps118/verify_untouched_v12.py`. The law-terms add slots to the existing decisions (21 of them extended); 41 new verse-local decisions. "
         "**Nothing is held against a Latinist major in this portion.** Three verses took three or four wordings because two readers pulled opposite ways: 118:138 (*Mandastes os …* heard as \"sent\" → *Mandastes que … sejam*, Latinist major → *Ordenastes … como … e como*, the stylist's worst line → his line, *Ordenastes como justiça os vossos testemunhos: e a vossa verdade sem medida*), "
         "118:140 (*é muito ardente* → *é fogo muito ardente*, Latinist critical → *está todo em brasa*), 118:154 (*Julgai o meu juízo* → *Julgai a minha causa … por causa do*, an echo → *Julgai em juízo a minha causa … pelo que dissestes*). "
         "**Held against the stylist twice, for the Latin's word:** 118:135 *Iluminai a vossa face* (the stanza's own repetition *illúminat … illúmina*; he wants *Fazei brilhar*), 118:173 *Seja a vossa mão para me salvar* (his lines put *veníre* for *fíeri*), and the order of 118:154b (*vivificai-me* last, the psalm's refrain). "
         "**D16, place by place:** the clause *o que dissestes* stands in all six singulars (118:133, 140 as subject, 154 after *propter* → *pelo que dissestes*, 169 after *juxta* → *conforme*, 170, 172) — no remark from the stylist in either reading, understood by the blind reader in both, the Latinist's tense minor twice and then silence twice on the same words (D24's variance again); "
         "the plural *os vossos ditos* (118:148, 158, 162) **refused by the stylist in all three places in both readings, six of six** — he wants *palavras*; understood by the blind reader, never listed as unknown. Alternatives laid out on the `open` elóquium evidence row, including a split nobody has tried (clause for the singular, *palavras* for the five plurals). "
         "**D23 held at 118:142, 144, 152, 160** with no reader remark; 118:142 was the stylist's best line both times. "
         "118:176 closes the psalm as planned: *Extraviei-me como ovelha que se perdeu: buscai o vosso servo* (*perecer* would make a dead sheep; *buscar* kept apart from *procurar* to the end). "
         "Rule-3 traps met: *Dirigi* (→ *Endireitai*), *Redimi-me / Remi-me* (→ *Resgatai-me*, which the Ps 7 agent reached independently), *Ouvi* (→ *Escutai*). "
         "Glossary: 22 term rows and 4 formula rows appended, evidence added to 18 existing rows (`ps118/glossary_part4.json` through `ps005/glossary_add.py`; verse lists checked by `ps118/grep_stems.py`). "
         "**Wanting a ruling:** the elóquium evidence row (now with the whole psalm's verdicts); *illumináre fáciem* → *iluminar* against *fazer brilhar* (before 30:17, 66:2); *Fiat manus tua* (118:173); *scándalum* → *tropeço*; *gratis* → *sem motivo*; *tabéscere* → *definhar*; *prævenire* → *adiantar-se* (the transitive places unsettled); *serváre* → *observar*; *eructáre* → *fazer jorrar* (before 18:3, 44:2a); *formidáre* → *ter pavor de*; *conspéctus* (*à vista de* fails with verbs of motion); *mandáre* with a bare object; *períre* at 118:176; *judícium* beside *causa* (9:5, 34:23). "
         "Script note: `ps118/partial.py` raised IndexError on a complete psalm (its progress line indexed the first missing verse) — one line made conditional; nothing shared was touched. Hetzenauer print read still owed for the whole psalm.")

if not row.startswith(head) or row.count(' | 120 | ') != 1 or not row.endswith(' |'):
    sys.exit('row is not in the shape expected — nothing written')
row = newHead + row[len(head):]
row = row.replace(' | 120 | ', critics + ' | 161 | ')
row = row[:-2] + notes + ' |'
lines[hits[0]] = row
path.write_text('\n'.join(lines), encoding='utf-8')
print('PROGRESS.md row updated')
