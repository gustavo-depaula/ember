# Consistency audit of the finished psalms

Audit only (2026-09-21). No `prayed.json`, glossary row or decision was changed. Scope: all 851 prayed verses in the 42 folders that have a `prayed.json` (Pss 1–36, 53, 90, 117, 118, 133, 233), resolved with `latin.resolve`, set beside `latin.readVerses`.

**Scripts** (all in `review/`, read-only, run with `python3.13 review/<name>.py`):

| script | what it does |
| --- | --- |
| `corpus.py` | builds `corpus.json` / `corpus.tsv`: every finished verse, Latin + folded Latin + Portuguese |
| `rules.py [filter] [--hits]` | about 60 D-rulings / settled rows as (Latin regex, expected Portuguese regex); prints the misses (`rules.out`) |
| `rows_vs_text.py` | about 45 working/open rows checked the same way (`rows_vs_text.out`) |
| `formulas.py` | every glossary formula row beside the finished verses that contain its Latin (`formulas.out`) |
| `twins.py`, `ngrams.py` | repeated Latin cola, and shared Latin 3-word runs, across finished verses, with their Portuguese (`twins.out`, `ngrams.out`) |
| `homograph.py` | every bare Portuguese word ending in -i/-í, for the D1/D13 ban |
| `recount.py` | recounts the counts that rulings rest on, over DO Pss 1–150, pattern and text both folded (`recount.out`) |
| `q.py`, `v.py`, `dec.py`, `row.py`, `rows.py`, `dupes.py` | ad-hoc query, verse print, decisions for a verse, glossary row print, row list, duplicate rows |

Regex misses were all read by hand. Anything that my patterns flagged but that turned out to be a false alarm (for example *invoquei*, *busquei*, or *persiga* caught by a stem pattern) is not reported.

---

## 1. Rulings against the text

### What holds

Every place where a ruling's Latin occurs in the finished text follows the ruling, or else a decision note covers the exception. The checks:

- **D3**: *exaudíre*, 32/32 verses → *escutar*; *audíre*, 9/9; *inténdere*, 3/3. *Intendérunt arcum* is a separate row.
- **D4**: 3/3.
- **D5**: 20/20 confitéri verses → *dar graças*. 31:5b is sin → *confessar*.
- **D6**: 34/34.
- **D13**: 117:19.
- **D14**: 5/5.
- **D15**: *mandáta* 38, *testimónia* 24, *lex* 34, *judícium* 38, *via* 45, *sémita* 8, *verbum* 29, *sermo* 6 and *confúndi* 16 all follow. *Justificatiónes* follows in all 30; 118:62's *justificatiónis* is decided locally.
- **D16/D26**: *elóquium* follows in all 23, including the local decisions at 11:7, 17:31 and 18:15a (*palavras*).
- **D17**: 2:7–9 is *tu*, and so are 31:8, 34:3 and 90:9–16.
- **D18**: 2:11.
- **D19**: *beátus* 8, *præcéptum* 3, *suscéptor* 5, *adjútor* 14/14 → *auxílio*, *Christus* 4. *Suscípere* follows in 7; 16:12 *Agarraram-me* is argued in decision `susceperunt`.
- **D20**: 2:12.
- **D21**: 6:2.
- **D22**: *deduc me* → *guiar*. 7:6 and 21:16 have *fazer descer*, which D25 allows. 14:4a and 30:18 are other builds, each argued.
- **D24**: *pérdere* 7, *tota die* 5, *exspectáre* 5. *Malígnus* follows in 7. 34:17 *malignitáte* is another word. 36:8–9 *malignári* is the verb, argued in decision `malignari`.
- **D25**: *psállere* follows in 10. At 7:13, *converterdes* stands.
- **D27**: *in finem* 6; 15:11 and 17:36b *até o fim* are allowed by D27. *In sǽculum sǽculi* 9, *irritáre* and *exacerbáre* 3, *húmilis* 4.
- **D29**: 3. **D30**: 5. **D31**: 3. **D32**: 9 (20:11 *semente* is D32's own exception). **D34**: *ecclésia* 5; *concílium* at 21:17 and 1:5. **D35**: 6 + 1. **D36**: 6.
- **D1/D13, the homograph ban**: `homograph.py` lists every bare word ending in -i/-í. None of them is a *vós* imperative of an -ir verb. *Abri* (118:131), *ouvi* (30:13), *pedi* (26:4), *corri* and *escondi* are all first-person perfects that the Latin has.

### Findings

**1.1 · 5:12a — D23 broken with no exception**
- **Latin:** *Et læténtur omnes, qui sperant in te, * in ætérnum exsultábunt: et habitábis in eis.*
- **Now:** *E alegrem-se todos os que esperam em vós, * exultarão **eternamente**: e habitareis neles.*
- **Rule:** D23 (*in ætérnum → para sempre*). The `choices` note still cites the pre-D23 glossary ("in ætérnum → eternamente (glossary)"). No decision covers it; *eternamente* is typed into the verse text itself, not a slot. It is the only one of the 23 *in ætérnum* verses that does not say *para sempre*. Ps 5 was made before D23 and was never swept.
- **Fix:** *exultarão para sempre*.

**1.2 · 9:23 — D33's *desígnio* not applied**
- **Latin:** *comprehendúntur in consíliis quibus cógitant*
- **Now:** *ficam presos nos **conselhos** em que pensam*
- **Rule:** D33 gives *desígnio* where *consílium* is what someone intends. This is the build of 20:12 *cogitavérunt consília* → *pensaram em desígnios*, which is one of D33's two founding verses. Ps 9 predates D33; decision `consiliis` says "consílium → conselho (glossary)" and was never revisited.
- **Fix:** *ficam presos nos desígnios em que pensam*. D33's rule 'where a verse can mean both, *conselho*' can still let 12:2 (*hei de pôr conselhos na minha alma*) and 13:6 (*o conselho do indigente*) stand, but that is a judgement to record.

**1.3 · 90:15 — *erípere* with no source named**
- **Latin:** *erípiam eum et glorificábo eum*
- **Now:** *eu o **arrancarei** e o glorificarei*
- **Rule:** the *erípere* row (open). It has since found that where no source is named, *arrancar* leaves the sentence hanging, and the text now says *libertar* in every such place: 6:5 *libertai a minha alma*, 118:153 and 118:170 *libertai-me*, 21:9 *que ele o liberte*, 33:8 *e os libertará*. 90:15 is the one exception. Its decision `eripiam` argues that the preceding *na tribulação* supplies the 'from where'. That was written first, before any of the evidence above existed.
- **Fix:** option 1 of `eripiam`, *eu o libertarei*. This is Sunday Compline, so it is prayed every week.
- **Glossary:** the row's rendering cell still says *arrancar* with no qualifier (see 4.10).

**1.4 · *odívi* in two tenses — 25:5 and 118:104 (and 35:5)**

| verse | Latin | Portuguese now |
| --- | --- | --- |
| 25:5 | *Odívi ecclésiam malignántium* | ***Odeio** a assembleia dos malvados* |
| 118:104 | *proptérea odívi omnem viam iniquitátis* | *por isso **odiei** todo caminho de iniquidade* |

- **Rule:** the *odísse* row (open). It now takes *odi/odívi* as a perfect with present sense (the Latinist's majors, taken at 24:19 and 25:5). 118:104 is not reconciled with it; HANDOFF item 15 already asks for a re-read. 35:5 *malítiam autem non odívit* → *não odiou a malícia* stands in a past narrative (*meditátus est … ástitit*), so the past may be right there.
- **Fix:** decide whether 118:104 (*intelléxi: proptérea odívi*, also narrative) keeps *odiei*. If it does, add a line to the row saying which contexts take the present.

**1.5 · *usque in sǽculum / usque in ætérnum* split (D23 family)**

| verse | Latin | Portuguese now |
| --- | --- | --- |
| 17:51 | *et sémini ejus usque in sǽculum* | *e com a sua descendência **para sempre*** |
| 27:9 | *et extólle illos usque in ætérnum* | *e erguei-os **para todo o sempre*** |

- **Rule:** D23 makes the two Latin phrases one. 27:9 argues *usque* → *todo* (decision `usque`, and formula row 849). 17:51 drops *usque* ("usque in sǽculum → para sempre (in sǽculum, glossary)"). Each is argued alone; they are not reconciled.
- **Reach:** *usque in* occurs in 24 lines of the psalter.
- **Fix:** one ruling for *usque in sǽculum/ætérnum*. Either 17:51 → *para todo o sempre*, or 27:9 → *para sempre* (27:9's option 1).

**1.6 · 34:10b *inops* → *carente*, the other three → *indigente***
- **Places:** 11:6a *dos indigentes*, 13:6 *do indigente* and 36:14b *o indigente*, against 34:10b *Vós que arrancais o carente*.
- **Rule:** the row is open, and HANDOFF item 17 already names the choice (*indigente* / *carente* / *desvalido*). Reported only because it is a live split in the text.
- **Fix:** pick one; four verses.

**Covered by a decision note (not findings):**
- 16:12 *Agarraram-me*.
- 25:4 *concílium* → *conselho*: συνέδριον, so not a D34 case.
- 29:9 *hei de clamar*: argued as a rhyme; see 2.2.
- 30:11b *foram perturbados*.
- 30:12 *valde → sobremaneira*.
- 36:26 *será abençoada*.
- 118:60 *para guardar*: see 2.3.
- 118:163 *Odiei*.
- 20:14 *entoaremos em salmos os vossos poderes* and 32:3 *entoai-lhe bem os salmos*: D25 bent for an accusative object and for *bene*, both argued.

---

## 2. Twins and refrains

`twins.py` found 27 groups of identical Latin cola. Only 1 group is divergent (2.3). `ngrams.py` gave 155 groups of verses that share a 3-word Latin run; all were read.

**These hold word for word:**
- the refrain of Ps 117 (5 verses) and 117:10–12;
- 8:2a = 8:10; 23:7 = 23:9; 23:8 = 23:10a; 17:13/17:14 last colon; 17:21a = 17:25a;
- 3:6b = 117:13b; 5:11a = 13:3b; 7:18b = 12:6b; 9:30a = 10:5b; 13:1b = 13:3a (second colon); 13:3d = 35:2b; 33:15a = 36:27a;
- 17:43 / 34:5 *ante fáciem venti*; 9:10 / 9:22 *in opportunitátibus*; 24:16 = 118:132 *Olhai para mim, e tende piedade de mim*; 26:14 / 36:34 *Aguarda o Senhor*; 30:25 / 26:14 *e que o … coração se fortaleça*;
- Ps 28's seven *A voz do Senhor*; the four *hereditábunt terram* and the three *Noli æmulári* of Ps 36;
- the Ps 118 formulas: 25 = 107, 81 = 114, 74 = 147, 83 = 141, 61 = 109, 149b/156b, *doce me justificatiónes tuas* ×6, *in toto corde* ×7, *judícia justítiæ tuæ* ×4, *secúndum elóquium tuum* ×6;
- *Deus meus es tu* ×5 (*Vós sois o meu Deus*);
- the movéri family: 9:27 and 29:7 *não serei abalado*, 14:5b *não será abalado*, 15:8 *para eu não ser abalado*, 20:8 *não será abalado*;
- *in manus tuas* (30:6, 9:35a).

**2.1 · *Legem pone mihi, Dómine* — two verbs, unreconciled**

| verse | Latin | Portuguese now |
| --- | --- | --- |
| 118:33 | *Legem pone mihi, Dómine, viam justificatiónum tuárum* | ***Imponde-me por lei, Senhor,** o caminho dos vossos preceitos* |
| 118:102 | *legem posuísti mihi* | *vós me impusestes uma lei* |
| 26:11 | *Legem pone mihi, Dómine, in via tua* | ***Ponde uma lei para mim, Senhor,** no vosso caminho* |

- **Rule:** the Latin is one phrase, and 118:33's decision `legem_pone` names 26:11 as the same phrase. Both psalms met the same *Ponde-me* misparse, and each cured it differently. 26:11 (decision `legem`) never weighs 118's *impor*. The objects differ (118:33 has a double accusative; 26:11 has none), so identical wording is not owed, but the same verb is.
- **Fix:** 26:11 *Imponde-me uma lei, Senhor, no vosso caminho*. That is *impor* as in 118:33/102, and the enclitic cannot be heard as 'put me'. Or else argue in both decisions why the verbs differ.

**2.2 · *Ad te, Dómine, clamábo***
- **Now:** 27:1 *A vós, Senhor, clamarei*; 29:9 *A vós, Senhor, hei de clamar*.
- **Why they differ:** 29:9 took the stylist's periphrasis to break the rhyme *clamarei … suplicarei* (decision `clamabo`), which 27:1 does not have. Explained, but the recurring opening now has two forms, and the decision does not mention 27:1.
- **Fix:** add the cross-reference to decision `clamabo`, or accept the split. Low.

**2.3 · *ut custódiam mandáta tua* — the only divergent colon group**
- **Now:** 118:60 *para guardar os vossos mandamentos*; 118:134 and 118:146 *para que eu guarde os vossos mandamentos*.
- **Why:** explained in the 118:60 `choices` ("same subject, so Portuguese uses the infinitive"; in 134/146 the main verb's subject is God). That is grammar under D2, so it is not a breach. Formula row 795 lists only 134b = 146b; add 118:60 and the reason.

**2.4 · *in omni témpore***
- **Now:** 33:2 and 118:20 *em todo tempo*; 9:26a *em todo **o** tempo*.
- **Why:** 9:26a's `choices` gives the article without comparing the other two. Unexplained across psalms.
- **Fix:** one form, three verses. Low.

**2.5 · Also seen, explained, low**
- 6:5 *libertai a minha alma* against 16:13 *arrancai a minha alma do ímpio*: the second has a source, which follows the *erípere* row's rule.
- 21:22 *a minha pequenez* against *humilhação* everywhere else: argued in the *humílitas* row.
- 28:7 has *concutiéntis* and *commovébit*, two Latin verbs, both rendered *abalar*. Not a twin, but the Latin varies where the Portuguese repeats; no note found.

---

## 3. The counts rulings rest on

All recounted over DO Pss 1–150 with pattern and text folded (`recount.py`, output in `recount.out`). "Lines" are DO prayed lines; repeated ids count as separate lines.

**Wrong or incomplete, but none changes a ruling:**

| claim (where) | recount | effect on the ruling |
| --- | --- | --- |
| *beátus* "29×" (D19; glossary row 57) | **26 lines, 27 occurrences** (68:16 *absórbeat* is not *beátus*) | an overcount. The ruling rests on sense, not the number. |
| *justificatiónes* "29 in Ps 118 + 104:45" (D15; the Ps 118 decision `justificationes`; glossary row 33 "29 of its 30") | **28** plural lines in Ps 118 + 104:45 = 29. The "29 in Ps 118" counts 118:62's singular, which D15 itself excludes. | none |
| *deprecátio* "14 verses", "11 of its 14 at a cadence" (D22, D35) | **15 lines**: 6:10, 16:1a, 21:25, 27:2, 27:6, 38:13, 54:2, 60:2, 65:19, 85:6, 118:169, 129:2b, 139:7, 141:7, 144:19. The cadence figure should be redone on 15. | none; all 6 finished places say *prece* |
| *inférnus* "19 verses" (D22) | 18 lines (48:15 is two lines of one id) | none |
| *psállere* beside *cantáre* "12:6b, 20:14, 103:33, 107:2" (D25; glossary row 384) | **9 lines**: also 32:3, 67:33a, 97:4, 104:2, 143:9 (32:3 is finished and met it) | an undercount that **strengthens** D25 |
| *confitéri* + *laudáre* in one verse "34:18, 108:30, 105:47" (D5) | **4**: also **43:9** (*In Deo laudábimur … confitébimur*) | strengthens D5 |
| *orbis* "Ps 17 counted 12" (D30) | **15 lines**: 9:8b, 17:16a, 18:5, 23:1, 32:8, 48:2, 49:12, 71:8, 88:12, 89:2, 92:1b, 95:10, 95:13, 97:6, 97:9 | none; D30 covers "all". The *mundus* claim holds (only *mundo corde* 23:4, *cor mundum* 50:12, and the *emund-/mundáb-* verbs). |
| *firmaméntum* list (D31: 17:2, 24:14, 70:3; 18:2; 72:4, 150:1) | **9 lines**: D31 names none of **71:16, 88:41, 104:16** | the ruling splits by sense, so it holds, but three places are unassigned. 104:16 *firmaméntum panis* is a prop but not God. List them. |
| D29's list has "105:38 *in sanguínibus*" | the line is **105:39** (105:38 has the singular *sánguinem*) | a wrong id only; 8 plural lines, as claimed |
| D14: Ps 135's refrain "27 times" | 27 in Ps 135 ✓, and the same words also stand in **99:4b** (DO id; *in ætérnum misericórdia ejus*) | the D14/D23 refrain family reaches Ps 99 as well |

**Confirmed as written:**
- D3: 74 occurrences in 70 lines. The four *inténde/exáudi* parallels.
- D4: 8. D9: 6.
- D15/D19: *præcéptum* 8, never in Ps 118. D19: *felix* never occurs.
- D21: *árguere* 5, *increpáre* 12, never in one verse.
- D22: *in conspéctu* 51. D24: *tota die* 26.
- D25: *psallam* 12.
- D27: 48:9 is the only verse with both *in ætérnum* and *in finem*. *Úsquequo … in finem* 4. *Exacerbáre* 8. *Irritáre* 10 (88:35 *írritum* is another word).
- D32: 17 (125:6a *sémina* is literal seed). D34: *ecclésia* 10, *concílium* 4. D18: 2.
- Glossary rows: *sustinére* 15; *exspectáre* 14; *éripe* 17; *usque in ætérnum* 4; *serváre* 5; *mirificáre* 4; *gáudium* 4; *erubéscere* 9; *inops* 14 (with *inópia*); *Dóminus virtútum* 16; *grátias ágere* never.

Not recounted: D15's "182 law-words / 81 at a cadence" (it needs `ps118/terms.py`'s definitions).

---

## 4. Glossary hygiene

**Status or rendering cells that disagree with the rulings or the text:**

1. **Row 752 *Confitémini Dómino quóniam bonus***. The rendering cell is *Louvai o Senhor, porque ele é bom* and the status is "open (hangs on confitéri)". D5 settled it, and 117:1 and 117:29 say ***Dai graças ao Senhor, porque ele é bom***. An agent copying the formula row would get the wrong verb. Future places: 105:1, 106:1, 135:1–3 …
2. **Row 753 *confitébor nómini tuo*** and **row 787 *et psallam nómini Dómini altíssimi*** are still "open (hangs on …)", although D5 and D25 are settled.
3. **Row 54 *in sǽculum***: "working", while row 55 (*in ætérnum*) is settled by D23, which merged the two. **Rows 772 and 804** are also still "open", with both halves settled (D23, D27). Row 772 also cites 9:6, which is row 804's phrase, and omits **20:5**, its real twin in the finished text.
4. **Row 608 *sustinére***: "open", although **D36** ruled it. **Row 50 *speráre in***: "working", although D36 says *esperar em* stays *speráre*'s. **Row 327 *exspectáre***: settled (D24), but its note still says "wants a ruling before Ps 26".
5. **Row 189 *concílium***: the rendering cell is *assembleia* and the status "open". D34 rules *concílium* by its Greek, and the text has three renderings: 1:5 *assembleia*, 21:17 *congregação*, 25:4 *conselho*. The cell matches one of the three.
6. **Row 188 *consílium***: the rendering cell says only *conselho*. D33 splits it into *conselho / desígnio*, and 19:5, 20:12, 32:10 and 32:11 say *desígnio*.
7. **D27 *húmilis → humilde***: settled, but there is **no row of its own**. It appears only inside D27 and the *inops* row.
8. **Row 125 *adjútor***: "open". D19's text says "stays apart from … *adjútor → auxílio*", and the text is uniform (14/14). HANDOFF says it wants Gustavo's ruling. The status is consistent with HANDOFF but not with D19's wording; say which.
9. **Row 849 *usque in ætérnum*** does not mention 17:51 *usque in sǽculum* (see 1.5). **Row 795 *ut custódiam mandáta tua*** omits 118:60 (see 2.3).
10. **Row 67 *erípere***: the rendering cell is "arrancar" (open). The row's own note and the text now say *libertar* wherever no source is named (six places). The cell should state the split; 90:15 is the one verse left over (1.3).
11. **Row 497 *liberátor → libertador*** (working) against **row 66 *liberáre → livrar***: the noun sits in *erípere*'s family (*libertar*), not *liberáre*'s. There is no note of the crossing.

**Duplicate rows for one term:**

| rows | what |
| --- | --- |
| **799 = 803** | *Óculi ejus in páuperem respíciunt* (9:30a = 10:5b): the same formula twice. 803 is a later copy. |
| **774 ⊂ 806** | *Sepúlcrum patens est guttur eórum …* (5:11a = 13:3b): 806 repeats 774 and adds the third colon. |
| **644 ≈ 841** | *Lavábo inter innocéntes manus meas* (25:6): a term row and a formula row with the same wording. |
| **236 = 63 + 126** | *suscéptor + suscípere together*, a third row beside the two it combines. All three are settled (D19). |
| **96 vs 39** | *verbum* has its own row (**working**) beside the settled *verbum / sermo / elóquium* row (**settled D15**): two statuses for one word. |
| **816 / 857** | *inclína ad me aurem tuam* in two formula rows (857 is the Ps 30 ≈ Ps 70 note). An overlap more than a duplicate. |

---

## Could not check

- Any Greek, Hebrew or Rahlfs claim behind a ruling, and any Bible or liturgical wording (I asserted none).
- Whether a verse "means a plan" (D33) or "says perpetuity" (D27) is my reading, flagged as such above.
- The untranslated side of the doublets (Ps 52, 70, 143 …).
- D15's cadence counts.
- Semantic appropriateness beyond the rulings: this is a consistency audit, not a new Latinist reading.

---

## Summary, ordered by how much prayed text each finding touches

| # | finding | finished verses touched | reach beyond |
| --- | --- | --- | --- |
| 4.1 | Formula row 752 says *Louvai o Senhor* for *Confitémini Dómino* (the text says *Dai graças*) | 2 (117:1, 29) | every later *Confitémini* (105, 106, 135 …) |
| 1.6 | *inops*: *carente* once, *indigente* three times | 4 | 14 lines |
| 2.1 | *Legem pone mihi, Dómine*: *Ponde uma lei para mim* (26:11) against *Imponde-me por lei* (118:33, 102) | 3 | — |
| 2.4 | *in omni témpore*: *em todo o tempo* (9:26a) against *em todo tempo* (33:2, 118:20) | 3 | — |
| 4.5–4.6 | *concílium* / *consílium* rows describe one rendering; the text has three / two | 3 + 4 | 1:5–39:11; 32:10 onward |
| 1.4 | *odívi*: *Odeio* (25:5) against *odiei* (118:104); 35:5 *não odiou* | 2–3 | *odísse* family |
| 1.5 | *usque in sǽculum/ætérnum*: *para sempre* (17:51) against *para todo o sempre* (27:9) | 2 | 24 *usque in* lines |
| 2.2 | *Ad te, Dómine, clamábo*: *clamarei* / *hei de clamar* (explained) | 2 | — |
| 2.3 | 118:60 *para guardar* against 118:134/146 (explained; row omits it) | 1 (3) | — |
| 1.1 | **5:12a *eternamente*** — D23 broken with no exception | 1 | — |
| 1.2 | **9:23 *conselhos*** where D33 gives *desígnios* (same build as 20:12) | 1 | — |
| 1.3 | **90:15 *arrancarei*** with no source, against the *erípere* practice (Sunday Compline) | 1 | 35 *erípere* lines |
| 4.2–4.4, 4.7–4.11 | stale statuses (753, 787, 54, 772, 804, 608, 50, 327, 125), a missing *húmilis* row, the *erípere* cell, *liberátor* | 0 (text right) | whichever psalm next consults them |
| 4 (duplicates) | 799 = 803, 774 ⊂ 806, 644 ≈ 841, 236, 96/39, 816/857 | 0 | — |
| 3 | counts: *beátus* 29 → 26/27; *deprecátio* 14 → 15; *psállere* + *cantáre* 4 → 9; *confitéri* + *laudáre* 3 → 4; *orbis* 12 → 15; *firmaméntum* 3 places unassigned; D29's id 105:38 → 105:39; *justificatiónes* 29 → 28 + 1; *inférnus* 19 → 18. No ruling's reasoning falls. | 0 | — |
