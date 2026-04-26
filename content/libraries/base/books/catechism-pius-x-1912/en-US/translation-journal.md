# Translation Journal — Catechism of St. Pius X (1912) (en-US)

Source (canonical): `it/`
Reference: `pt-BR/`
Target: `en-US`

When IT and pt-BR disagree, follow IT and log the divergence below. Add a markdown footnote in the chapter only if the difference is material to the reader.

## Key Terms

| Italian | English | Notes |
|---|---|---|
| Decalogo | Decalogue | Standard English form |
| Eucaristia | Eucharist | |
| Penitenza | Penance | Sacrament name; the virtue is also "penance" |
| Cresima / Confermazione | Confirmation | IT chapter title uses both; rendered as "Confirmation" |
| Estrema Unzione | Extreme Unction | Traditional name preserved (matches book.json TOC) |
| Ordine | Holy Orders | Plural form standard in English |
| Matrimonio | Matrimony | |
| Pater Noster | Our Father | English form preferred for catechetical use |
| Ave Maria | Hail Mary | English form |
| Credo | Creed | English form |
| Santissima Trinità | Most Holy Trinity | |
| Sacra Scrittura | Sacred Scripture | |
| Chiesa (cattolica) | (Catholic) Church | Capitalize "Church" when referring to the Catholic Church |
| Sommo Pontefice | Supreme Pontiff | |
| peccato mortale | mortal sin | |
| peccato veniale | venial sin | |
| grazia santificante | sanctifying grace | |
| grazia attuale | actual grace | |
| Beata Vergine | Blessed Virgin | |
| Beata Vergine Maria | Blessed Virgin Mary | |
| Figliuolo di Dio | Son of God | "Figliuolo" (archaic diminutive) → modern "Son" |
| Spirito Santo | Holy Spirit | |
| Padre / Figlio / Spirito Santo | Father / Son / Holy Spirit | |
| anima | soul | |
| corpo | body | |
| Paradiso | Heaven | |
| Inferno | Hell | |
| Purgatorio | Purgatory | |
| Limbo | Limbo | |
| santificare | to sanctify | |
| salvarsi | to be saved | |
| la grazia di Dio | the grace of God | |
| consacrazione | consecration | |
| Comunione | (Holy) Communion | |
| confessione | confession | |
| contrizione | contrition | |
| attrizione | attrition | |
| soddisfazione | satisfaction | (sacramental sense) |
| assoluzione | absolution | |
| transustanziazione | transubstantiation | |
| reale presenza | real presence | |
| sacrificio | sacrifice | |
| Santa Messa | Holy Mass | |
| Sacro Cuore | Sacred Heart | |
| pegno | pledge | |
| precetto | precept / commandment | "precept" for ecclesiastical, "commandment" for divine |
| comandamento | commandment | |
| virtù | virtue | |
| virtù teologali | theological virtues | |
| virtù cardinali | cardinal virtues | |
| fede / speranza / carità | faith / hope / charity | |
| Decalogo / Comandamenti di Dio | Decalogue / Commandments of God | |
| beatitudini | beatitudes | |
| doni dello Spirito Santo | gifts of the Holy Spirit | |
| frutti dello Spirito Santo | fruits of the Holy Spirit | |
| opere di misericordia | works of mercy | |
| opere di misericordia corporali / spirituali | corporal / spiritual works of mercy | |
| novissimi | last things | The four last things: death, judgment, heaven, hell |
| risurrezione della carne | resurrection of the body | "carne" → "body" (standard in modern Creed translations) |
| vita eterna | life everlasting | |
| Comunione dei Santi | Communion of Saints | |
| Avvento | Advent | |
| Quaresima | Lent | |
| santo / santissimo | holy / most holy | |
| Vescovo | Bishop | |
| Sacerdote | Priest | |
| Sommo Sacerdote | High Priest | |
| Vicario di Gesù Cristo | Vicar of Jesus Christ | |
| Apostoli | Apostles | |
| Vangelo / Vangeli | Gospel / Gospels | |
| Antico Testamento | Old Testament | |
| Nuovo Testamento | New Testament | |
| Tradizione | Tradition | |
| infedeli | unbelievers | |
| eretici | heretics | |
| scismatici | schismatics | |
| scomunicati | excommunicates | |

## Translation Decisions

- **2026-04-25** — Established IT as canonical, pt-BR as cross-check. When they materially disagree, follow IT and log; add inline footnote only if the divergence omits or alters substantive content.
- **2026-04-25** — Latin liturgical names (`Pater Noster`, `Ave Maria`, `Credo`) rendered as English equivalents ("Our Father", "Hail Mary", "Creed"). Standard for English Catholic catechesis. Latin form preserved only when the text is explicitly discussing the Latin name as such.
- **2026-04-25** — Italian guillemets «…» converted to standard English double quotes "…".
- **2026-04-25** — Q&A markdown pattern preserved exactly: `**N.** Question?` blank line `*Answer.*`. All 433 question numbers maintained without renumbering.
- **2026-04-25** — Scripture citations follow IT exactly. Where pt-BR adds parenthetical citations IT omits (e.g., "São Mateus XXII, 40"), do not add — defer to IT.
- **2026-04-25** — Archaic "Figliuolo" rendered as modern "Son" (no semantic difference; modern reader register).
- **2026-04-25** — "Risurrezione della carne" rendered "resurrection of the body" (standard English Apostles' Creed phrasing) rather than literal "resurrection of the flesh".

## Divergences (IT vs pt-BR)

Logged here for future cleanup of pt-BR. The English translation follows IT in all cases.

- **Q163 (`legge-comandamenti.md`)** — pt-BR adds an extra entry "163 a." spelling out the two charity commandments. IT leaves this implicit. → English follows IT (no 163a). No inline footnote (immaterial).
- **Q358 (`sacramento-penitenza.md`)** — pt-BR enumerates only 4 of the 5 parts of the sacrament of Penance, skipping "4° a confissão". IT lists all 5 in order. → English includes all 5 from IT. **Material**, but the IT enumeration is internally consistent and the English reader sees the complete list — no inline footnote needed.
- **Q417 (`orazione.md`)** — pt-BR had typo "pela a mente é o coração". IT correct ("colla mente e col cuore"). **FIXED in pt-BR (2026-04-25):** corrected to "pela mente e pelo coração".
- **End of `orazione.md` (pt-BR)** — pt-BR file contained stray social-media share markup (lines 83–109) absent from IT. **FIXED in pt-BR (2026-04-25):** removed the stray "Compartilhar / Gerar link / Facebook / X / Pinterest / E-mail / Outros aplicativos" lines so the file ends at Q433.
- **Q80 (`credo-incarnazione.md`)** — pt-BR adds parenthetical scripture citations "(São Mateus III. 17; São Lucas IX. 35)" for the Father's words at the Baptism / Transfiguration. IT omits these. → English follows IT (no citation).
- **Q115 (`credo-chiesa.md`)** — pt-BR adds "(São João XV. 26)" after the citation "the Spirit of truth". IT omits. → English follows IT.
- **Q138 (`credo-remissione-peccati.md`)** — pt-BR adds "(São Lucas I. 28)" after "full of grace". IT omits. → English follows IT.
- **Q152 (`credo-remissione-peccati.md`)** — pt-BR truncates the answer to a single sentence and then adds two extra enumerated lists "152 a." (Six Sins Against the Holy Spirit) and "152 b." (Four Sins Crying to Heaven). IT gives the full answer "Tra i peccati mortali sono più gravi e funesti i peccati contro lo Spirito Santo e quelli che gridano vedetta al cospetto di Dio" and no enumerated lists. → English follows IT — full sentence answer, no 152a/152b. (Material: pt-BR adds catechetical content not in IT.)
- **Q155 (`credo-remissione-peccati.md`)** — pt-BR appends a "155 a." enumeration of the Four Last Things (Death; Judgment; Hell; Heaven). IT does not. → English follows IT (no 155a).
- **Q163 (`legge-comandamenti.md`)** — pt-BR adds parenthetical "(São Mateus XXII, 40)" and a "163 a." enumeration of the two charity commandments. IT has neither. → English follows IT.
- **Q168 / `§ 2` heading (`legge-comandamenti.md`)** — IT has the section header "§ 2. Comandamenti dl Dio in particolare" smashed into the end of Q168's answer (clearly a typesetting/OCR artifact). pt-BR strips it entirely. → English restores the section break as a separate `## § 2. The Commandments of God in Particular` heading after Q168 (between Q168 and Q169), restoring the structural divider that the Italian source clearly intended.
- **Q192 (`legge-comandamenti.md`)** — pt-BR adds "(Rom. XIII, 1-2)" after the citation. IT omits. → English follows IT.
- **Q199 (`legge-comandamenti.md`)** — pt-BR adds "(São Mateus XVIII, 7)" after the citation. IT omits. → English follows IT.
- **Q212 (`legge-comandamenti.md`)** — pt-BR adds "(Atos dos Apóstolos XIV. 22)" after the citation. IT omits. → English follows IT.
- **Q215 (`legge-precetti.md`)** — pt-BR adds "(São Lucas X. 16)". IT omits. → English follows IT.
- **Q218 (`legge-precetti.md`)** — pt-BR adds a "218 a." enumeration of the five general precepts of the Church (with a second list from "the Third Catechism of Christian Doctrine"). IT has neither. → English follows IT.
- **End of `legge-precetti.md` Q226 (IT)** — IT has the section header "§ 1. Virtù in generale - Virtù teologali." smashed into the end of Q226's answer (an OCR/typesetting artifact: this header belongs to the START of the NEXT chapter, `legge-virtu.md`, not the end of this one). pt-BR omits it. → English drops it from `legge-precetti.md` and inserts a `## § 1. Virtues in General — Theological Virtues` heading at the start of `legge-virtu.md` (after the H1).
- **End of Q231 (`legge-virtu.md`, IT)** — IT has "FEDE." smashed at the end of Q231's answer (subsection header for Faith). pt-BR omits. → English restores as a `## Faith` subheading between Q231 and Q232.
- **Q237 (`legge-virtu.md`)** — pt-BR adds "237 a." enumeration of the two principal mysteries. IT does not. → English follows IT.
- **Q241 (`legge-virtu.md`)** — IT preserves the full quotation "with all your heart, with all your soul, with all your mind, and with all your strength"; pt-BR replaces this with a parenthetical citation "(São Marcos XII. 30)" and drops the quotation. → English follows IT (full quotation, no citation).
- **Q247 (`legge-virtu.md`)** — pt-BR adds "(São Tiago II. 26)" after "faith without works is dead." IT omits. → English follows IT.
- **Q249 (`legge-virtu.md`)** — pt-BR adds "249 a." (seven corporal works of mercy) and "249 b." (seven spiritual works of mercy) enumerations. IT does not. → English follows IT.
- **End of Q251 (`legge-virtu.md`, IT)** — IT has the section header "§ 3. Virtù morale e vizio - Beatitudini evangeliche" smashed at the end of Q251's answer. pt-BR omits. → English restores as a `## § 3. Moral Virtues and Vices — Evangelical Beatitudes` heading between Q251 and Q252.
- **Q261 (`legge-virtu.md`)** — pt-BR adds "261 a." enumeration of the seven capital vices. IT does not. → English follows IT.
- **Q264 (`legge-virtu.md`)** — pt-BR adds "(São Mateus V. 3-10)" after the Beatitudes. IT omits. → English follows IT.
- **Note on missing §2 / Hope / Charity sub-headings** — IT has clear OCR artifacts only for `§ 1`, `FEDE`, and `§ 3`. There is no IT artifact for an explicit Hope or Charity sub-heading, nor for a `§ 2`. The English follows IT and does not invent these structural divisions.
- **End of Q334 (`sacramento-eucaristia.md`, IT)** — IT has the section header "§ 3. Santa comunione, disposizioni, obbligo, effetti." smashed at the end of Q334's answer. pt-BR omits. → English restores as a `## § 3. Holy Communion: Dispositions, Obligation, Effects` heading between Q334 and Q335.
- **Q356 (`sacramento-penitenza.md`)** — pt-BR adds "(São João XX. 22-23)" after the citation; IT omits. → English follows IT.
- **Q358 (`sacramento-penitenza.md`)** — IT lists all 5 things (1° esame; 2° dolore; 3° proponimento; 4° confessione; 5° soddisfazione). pt-BR was defective: listed 1, 2, 3, 5 (skipped "4° a confissão"). **FIXED in pt-BR (2026-04-25):** added "4° a confissão" to restore the canonical IT enumeration.
- **Q371 (`sacramento-penitenza.md`)** — pt-BR adds "(Eclesiástico III. 27)" after "he who loves danger will perish in it." IT omits. → English follows IT.
- **End of Q379 (`sacramento-penitenza.md`, IT)** — IT has the section header "§ 4. Assoluzione - Soddisfazione - Indulgenze." smashed at the end of Q379's answer. pt-BR omits. → English restores as a `## § 4. Absolution — Satisfaction — Indulgences` heading between Q379 and Q380.
- **Q385 (`sacramento-penitenza.md`)** — IT ends with the stray artifact "Formole 21,22." (a typesetting reference to printed prayer forms, not part of the catechism content). pt-BR omits. → English drops it. Additionally, pt-BR adds "385 a." (corporal works of mercy) and "385 b." (spiritual works of mercy) enumerations. IT has neither. → English follows IT.
- **Q414 (`orazione.md`)** — IT lists FOUR purposes of prayer: "ben conoscerlo, adorarlo, ringraziarlo e domandargli quanto ci bisogna" (know, adore, thank, ask). pt-BR omitted "adorá-lo" and listed only three. **FIXED in pt-BR (2026-04-25):** added "adorá-lo" to restore the canonical IT enumeration.

## Post-Audit Cleanup (2026-04-25)

A cross-language audit run via `/review-book-translation` surfaced additional surface defects in pt-BR and stray OCR artifacts in IT canonical. All fixes below preserve meaning — none alter the canonical content of the catechism.

### pt-BR typos fixed
- `credo-chiesa.md` Q107 — "santificarem-se; **é** porque" → "**e** porque" (matches IT "e perché").
- `credo-chiesa.md` Q113 — "impedidos **pelo o** afeto" → "pelo afeto" (duplicated article).
- `credo-incarnazione.md` Q80 — "(São Mateus **lII**. 17;…)" → "III. 17" (lowercase L → Roman numeral I).
- `credo-remissione-peccati.md` 152a aid — "**Impugnara** verdade" → "Impugnar a verdade" (missing space).
- `legge-precetti.md` Q218 aid + Q225 (3 occurrences) — "contribuindo **segundos** as leis" → "segundo as leis" (superfluous `s`).
- `legge-virtu.md` 237a aid — "dois principais **mistério**" → "mistérios" (singular → plural).
- `sacramento-eucaristia.md` Q351 — "**Para quis fins de oferece** a Deus a Missa?" → "Para quais fins se oferece a Deus a Missa?" (`quis`/`de` typos).

### IT canonical OCR artifacts fixed
The Corsia dei Servi PDF source carried small OCR scratches (stray periods inside answers, one letter substitution, one collapsed Q&A line). The intended text was already rendered correctly in pt-BR and en-US — these IT fixes are cosmetic to the canonical source.

- `lezione-preliminare.md` Q13 — Q&A had collapsed onto one line with `_` separator; restored to the standard `**Q?** \n\n *answer*` shape.
- `credo-incarnazione.md` Q86 — "la**.** vista ai ciechi" → "la vista ai ciechi".
- `credo-venuta.md` Q102 — "le **animo.** dalle pene" → "le anime dalle pene" (also fixed the morphology: `animo` → `anime`).
- `legge-comandamenti.md` Q209 — "Il nono**.** comandamento" → "Il nono comandamento".
- `legge-precetti.md` Q223 — "Che ci ordina**.** il terzo precetto" → "Che ci ordina il terzo precetto".
- `orazione.md` Q428 — "grande amore**.** e fiducia" → "grande amore e fiducia".
- `sacramenti-in-generale.md` Q273 — "col darci**.** la prima grazia" → "col darci la prima grazia".
- `sacramento-eucaristia.md` Q351 — "Per quali**.** fini si offre" → "Per quali fini si offre" (and the answer's "placarlo **è** dargli" → "placarlo **e** dargli").
- `sacramento-matrimonio.md` Q406 — "la grazia**.** di santamente convivere" → "la grazia di santamente convivere".
- `sacramento-penitenza.md` Q391 — "eseguire bene le**.** opere prescritte" → "eseguire bene le opere prescritte".

(New divergences will be appended here as discovered during translation.)

## Round 7 Audit (2026-04-26)

A seventh pass over the sacraments batch (sacramento-cresima, sacramento-eucaristia, sacramento-penitenza, sacramento-estrema-unzione, sacramento-ordine, sacramento-matrimonio, orazione) × 3 languages. All Round 6 fixes verified landed. Two new pt-BR defects found and fixed. IT and en-US clean across all 7 files.

### pt-BR fixes
- `sacramento-eucaristia.md` Q320 — `lhes distribuiu aos Apóstolos` → `os distribuiu aos Apóstolos` (double object: clitic `lhes` + full noun `aos Apóstolos` is redundant; IT `li distribuì agli Apostoli` has one object marker; correct pt-BR uses the accusative clitic `os` matching direct-object `pão e vinho`).
- `sacramento-estrema-unzione.md` Q395 — commas between the three parallel main-clause effects replaced with semicolons: `aumenta … santificante, apaga … confessar, dá força … santamente, e ajuda` → `aumenta … santificante; apaga … confessar; dá força … santamente; e ajuda` (IT uses `;` before `dà forza` and `e aiuta anche`; en-US already correct).

## Round 2 Audit (2026-04-25)

A second cross-language pass via `/review-book-translation` (3 parallel review agents over all 21 chapters × 3 languages) caught residual surface defects missed by the first audit. en-US was clean; all fixes below land in pt-BR (typos) and IT canonical (OCR artifacts).

### pt-BR typos fixed
- `credo-misteri-principali.md` Q31 — "Quais **sãos** os principais" → "Quais **são** os principais".
- `credo-creazione.md` Q61 — "amar e **cuidar servir** a Deus" → "amar e **servir** a Deus" (stray "cuidar").
- `credo-incarnazione.md` Q88 — added 2 missing commas in the parallel list of miracles: "a vista aos cegos**,** a audição aos surdos, a palavra aos mudos**,** a saúde a toda sorte de enfermos".
- `sacramento-battesimo.md` Q295 — "Graça santificante **a as** virtudes" → "Graça santificante **e as** virtudes" (matches IT "e le virtù").
- `sacramento-cresima.md` Q309 — question line "perfeitos **cristão** e soldados" → "perfeitos **cristãos** e soldados" (the answer was already correctly plural).
- `sacramento-eucaristia.md` Q343 — "**E** bom e útil comungar" → "**É** bom e útil comungar" (missing acute).
- `orazione.md` Q416 — "verdades **cristã** e a contemplação" → "verdades **cristãs** e a contemplação" (singular → plural to match "verdades").

### IT canonical OCR artifacts fixed
- `credo-unita-trinita.md` Q44 — "Perchè il Padre **il** la prima Persona" → "Perchè il Padre **è** la prima Persona" (en-US/pt-BR were already correct; OCR confused è/il).
- `credo-risurrezione.md` Q160 — "Che **signifîca** la parola «Amen»?" → "Che **significa** la parola «Amen»?" (stray circumflex; matches Q158/Q159 in same file).
- `sacramenti-in-generale.md` Q289 — "lo fa o conferisce, in **nurse** e per autorità" → "lo fa o conferisce, in **nome** e per autorità" (OCR misread "nome" as "nurse").

## Round 3 Audit (2026-04-25)

A third pass via `/review-book-translation` (3 parallel sonnet review agents over all 21 chapters × 3 languages) verified all Round 1 + Round 2 fixes landed and surfaced ~30 additional defects — mostly residual IT OCR artifacts (digit-letter substitutions like `1a`→`la` and `Dìo`→`Dio`, stray periods inside answers, missing terminal periods, the typo `vedetta`→`vendetta`) plus pt-BR grammar/agreement errors (gender, number, subject-verb, wrong contractions, one missing clause). en-US clean.

### IT canonical OCR artifacts fixed
- `lezione-preliminare.md` Q9 — added missing terminal period (`l'Onnisciente.`).
- `lezione-preliminare.md` Q12 — `bontà'` → `bontà` (stray apostrophe after accent).
- `lezione-preliminare.md` Q25 — `si fece, uomo` → `si fece uomo` (stray comma).
- `lezione-preliminare.md` Q26 — `patendo sacrificando` → `patendo, sacrificando` (missing separator between gerunds; matches pt-BR comma).
- `credo-unita-trinita.md` Q49 — `più potente è più sapiente` → `più potente e più sapiente` (verb `è` misread for conjunction `e`).
- `credo-creazione.md` Q77 — `non cessò. di esser Dio` → `non cessò di esser Dio` (stray period).
- `credo-incarnazione.md` Q86 — `secondo.Dio` → `secondo Dio` (stray period; missed by Round 1 which only fixed `la. vista` in same answer).
- `credo-incarnazione.md` Q91 — `corpo di Gesù, Cristo?` → `corpo di Gesù Cristo?` (stray comma in name).
- `credo-chiesa.md` Q106 — `1a Chiesa` → `la Chiesa` (digit `1` misread for letter `l`).
- `credo-chiesa.md` Q127 — `rivelata dà Dio` → `rivelata da Dio` (verb `dà` misread for preposition `da`).
- `credo-remissione-peccati.md` Q140 — `l'usa di ragione` → `l'uso di ragione` (noun form).
- `credo-remissione-peccati.md` Q152 — `gridano vedetta` → `gridano vendetta` (Q154 in same file uses `vendetta` correctly); also added missing terminal period.
- `legge-comandamenti.md` Q161 — `comandamenti di. Dio` → `comandamenti di Dio` (stray period).
- `legge-comandamenti.md` Q182 — `nome santo dì Dio` → `nome santo di Dio` (stray accent: `dì` = day vs preposition `di`).
- `legge-comandamenti.md` Q183 — `promessa fatta a Dìo` → `promessa fatta a Dio` (stray accent on `i`).
- `legge-comandamenti.md` Q194 — `perchèb Dio` → `perchè Dio` (stray `b`); also added missing terminal period (`salvarsi.`).
- `legge-comandamenti.md` Q202 — `I I sesto comandamento` → `Il sesto comandamento` (split letter).
- `legge-comandamenti.md` Q211 — `diritti è al bene` → `diritti e al bene` (verb `è` misread for conjunction `e`).
- `legge-precetti.md` Q218 — `Gesù, Cristo)` → `Gesù Cristo)` (stray comma in name); `alcuni giorni digiuno` → `alcuni giorni di digiuno` (missing preposition); added missing terminal period.
- `legge-virtu.md` Q230 — `con 1a grazia` → `con la grazia`.
- `legge-virtu.md` Q231 — `qual è la più, eccellente?` → `qual è la più eccellente?` (stray comma).
- `legge-virtu.md` Q232 — `Che cos'è 1a fede?` → `Che cos'è la fede?`.
- `legge-virtu.md` Q238 — `La speranza e quella virtù` → `La speranza è quella virtù` (missing accent on copula).
- `legge-virtu.md` Q248 — added missing terminal period (`promesse di Dio.`).
- `legge-virtu.md` Q252 — `il bene; acquistato` → `il bene, acquistato` (semicolon → comma per pt-BR/en-US convention); added missing terminal period.
- `legge-virtu.md` Q256 — `La giustizia e 1a virtù` → `La giustizia è la virtù` (two-error compound: copula and digit/letter).
- `legge-virtu.md` Q265 — `disse beate,.contrariamente` → `disse beate, contrariamente` (stray period after comma).
- `sacramenti-in-generale.md` Q269 — `1a grazia santificante` → `la grazia santificante`.
- `sacramento-battesimo.md` Q293 — `intenzione dì fare` → `intenzione di fare` (stray accent).
- `sacramento-battesimo.md` Q295 — `imprima il carattere` → `imprime il carattere` (subjunctive → indicative to match parallel verbs in answer).

### pt-BR grammar / agreement / spelling fixed
- `lezione-preliminare.md` Q6 — `puríssimo espirito` → `puríssimo espírito` (missing acute).
- `credo-misteri-principali.md` Q30 — `não contrário à razão` → `não contrária à razão` (gender agreement with feminine `verdade`).
- `credo-unita-trinita.md` Q44 — `procedem às outras duas` → `procedem as outras duas` (no preposition needed; `às` is wrong contraction here).
- `credo-creazione.md` Q71 — `dom de sobrenatural` → `dom sobrenatural` (stray `de`; matches IT `dono soprannaturale`).
- `credo-venuta.md` Q98 — `pensamento e omissões` → `pensamentos e omissões` (number, matches IT `pensieri`).
- `legge-comandamenti.md` Q199 — `mais exemplos` → `maus exemplos` (homophone-adjacent typo: "more" → "bad"; matches IT `cattivi esempi`).
- `legge-virtu.md` Q244 — `Fé Esperança e Caridade` → `Fé, Esperança e Caridade` (missing comma in 3-item series; Q245/246 in same file already correct).
- `legge-virtu.md` Q266 — `é assim não têm` → `e assim não têm` (verb `é` misread for conjunction `e`; same class as the Q107 `credo-chiesa` fix from Round 1).
- `sacramento-cresima.md` Q308 — `abençoa solenemente todos os cristãos` → `todos os crismados` (wrong referent: IT `cresimati` = the newly confirmed, not Christians-in-general).
- `sacramento-cresima.md` Q312 — `os crismados deverá possuir` → `os crismados deverão possuir` (subject-verb number).
- `sacramento-estrema-unzione.md` Q394 — `pelo o Bispo` → `pelo Bispo` (duplicated article, same class as Q113 `credo-chiesa` fix from Round 1).
- `sacramento-penitenza.md` Q373 — added the missing clause `ou confessados mal` (IT: `non ancora confessati o confessati male`); en-US already had it.
- `sacramento-penitenza.md` Q379 — `avisá-los em seguida` → `acusá-lo em seguida` (wrong verb + number; IT `accusarsene` = self-accusation, not warning others).
- `sacramento-penitenza.md` Q390 — `setes anos` → `sete anos` (numeral `sete` is invariable).
- `sacramento-ordine.md` Q399 — `compreendem vários graus` → `compreende vários graus` (subject-verb number; subject is `O Sacramento`, singular).
- `sacramento-matrimonio.md` Q412 — `comentem um sacrilégio` → `cometem um sacrilégio` (typo).
- `orazione.md` Q426 — `mundo se conheço` → `mundo se conheça` (subjunctive required after `pedir que`).
- `orazione.md` Q428 — `nós cristão` → `nós cristãos` (number agreement).

## Round 4 Audit (2026-04-26)

A fourth pass via `/review-book-translation` (5 parallel sonnet review agents over all 21 chapters × 3 languages) caught residual pt-BR grammar/agreement/typo defects and additional IT canonical OCR artefacts. en-US clean.

### pt-BR grammar / agreement / typo / spelling fixed
- `lezione-preliminare.md` Q20 — `chama-se` → `chamam-se` (subject "As três Pessoas" plural; matches IT `si chiamano`).
- `lezione-preliminare.md` Q27 — `de sua graça` → `de sua GRAÇA` (other enumerated theological-key terms in same sentence are ALL CAPS; matches IT `GRAZIA` and en-US `GRACE`).
- `credo-unita-trinita.md` Q38 — `existe três Pessoas` → `existem três Pessoas` (subject-verb plural agreement).
- `credo-creazione.md` Q52 — `O Mundo todo e obra de Deus?` → `O Mundo todo é obra de Deus?` (missing acute on copula; answer line was already correct).
- `credo-creazione.md` Q56 — `a Fé nos fazer conhecer?` → `a Fé nos faz conhecer?` (infinitive → 3rd-person singular, matching IT `ci fa conoscere` and the answer's correct `nos faz conhecer`).
- `legge-virtu.md` Q238 — `a vida e as graças necessárias` → `a vida eterna e as graças necessárias` (missing word "eterna"; IT `la vita eterna`, en-US "eternal life").
- `legge-virtu.md` Q265 — Question and answer both used the noun `"Bem-Aventuranças"` (Beatitudes) where IT/EN use the adjective `disse beate` / "called blessed [the persons]". Rewritten as `chamou bem-aventuradas, contrariamente à opinião do mundo, as pessoas humildes e atribuladas`. Also fixed: question's wrong contraction `às pessoas` → `as pessoas` (direct object); answer's `como imitá-lo` (masc. sing.) → `também a imitá-las` (fem. plural antecedent "as pessoas"); and word inversion `as falácias máximas` → `as falsas máximas` (matches en-US "deceitful maxims").
- `sacramento-estrema-unzione.md` Q394 — `dos enfermos dizendo:` → `do enfermo, dizendo:` (number: IT singular `dell'infermo`; and missing separator before gerund per IT `e dicendo:`).
- `sacramento-ordine.md` Q397 — `imprime o caráter de ministro de Deus` → `de ministros de Deus` (singular → plural; matches IT `ministri` and en-US "ministers").
- `sacramento-ordine.md` Q400 — `que são preparatórias` → `que são preparatórios` (gender; nouns Subdiaconato/Diaconato are masc.; IT `preparatori`).
- `sacramento-ordine.md` Q400 — added missing `e` before `o Episcopado` (IT `e l'Episcopato`; en-US "and the Episcopate").
- `sacramento-ordine.md` Q400 — `de administrar e governar os fiéis` → `de ensinar e governar os fiéis` (mistranslation of IT `ammaestrare` = to teach; en-US "to teach").
- `orazione.md` Q433 — comma between independent clauses replaced by semicolon (`Mediador, ao contrário,` → `Mediador; ao contrário,`); matches IT and en-US punctuation, eliminating comma-splice.

### IT canonical OCR artefacts fixed
- `sacramento-ordine.md` Q397 — `1'« Ordine »` → `l'« Ordine »` (digit-1 misread for letter `l`).
- `sacramento-ordine.md` Q398 — `là potestà` → `la potestà` (stray grave accent on article).
- `sacramento-ordine.md` Q402 — `aver per fine,soltanto` → `aver per fine soltanto` (stray comma in middle of clause).
- `orazione.md` Q415 — added missing terminal period before closing italics (`mentale e vocale` → `mentale e vocale.`).
- `orazione.md` Q416 — `L'orazione mentale e quella` → `L'orazione mentale è quella` (missing accent on copula).
- `orazione.md` Q421 — `Nostro Signore..` → `Nostro Signore.` (double period).
- `orazione.md` Q423 — `1e grazie anche temporali` → `le grazie anche temporali` (digit-1).
- `orazione.md` Q424 — `Orazione domenicale o de1 Signore` → `o del Signore` (digit-1).
- `orazione.md` Q430 — `i Santi e 1a Madonna` → `i Santi e la Madonna` (digit-1).
- `orazione.md` Q431 — `Noi invochiamo 1a Madonna` → `Noi invochiamo la Madonna` (digit-1).
- `orazione.md` Q432 — `con 1'« Ave Maria »` → `con l'« Ave Maria »` (digit-1).

## Round 5 Audit (2026-04-26)

A fifth pass via `/review-book-translation` (5 parallel sonnet review agents over all 21 chapters × 3 languages) caught residual IT canonical OCR artefacts plus pt-BR semantic, agreement, and completeness defects. en-US clean except for one consistency fix.

### IT canonical OCR artefacts fixed
- `lezione-preliminare.md` Q15 — `serve fedelmente, Dio,` → `serve fedelmente Dio,` (stray comma).
- `lezione-preliminare.md` Q27 — `CREDERE LE VERITA RIVELATE` → `CREDERE LE VERITÀ RIVELATE` (missing grave on final A).
- `credo-incarnazione.md` Q80 — quote opened with `«` but closed with straight `"`; closed with matching `»`.
- `credo-incarnazione.md` Q86 — added missing terminal period before closing italic (`uomini ».*` → `uomini ».*` with `.` inserted).
- `credo-venuta.md` Q98 — `del bene e dei male operato` → `del bene e del male operato` (`dei` plural article wrong before singular).
- `credo-chiesa.md` Q119 — added missing terminal period before closing italic.
- `legge-comandamenti.md` Q163 — `i Profeti "` (trailing space, no terminal period) → `i Profeti".`.
- `legge-comandamenti.md` Q208 — `falsamente,o sparlandone` → `falsamente, o sparlandone`.
- `legge-comandamenti.md` Q212 — `poichè a al regno` → `poichè "al regno` (dropped opening quote misread as stray `a`).
- `legge-precetti.md` Q215 — quote opened with `«` but closed with straight `"`; closed with matching `»`.
- `sacramenti-in-generale.md` Q270 — `figli adottivi Dio` → `figli adottivi di Dio` (missing preposition).
- `sacramenti-in-generale.md` Q278 — `per salvanti` → `per salvarsi`.
- `sacramenti-in-generale.md` Q280 — `Se il Battesimo necessario a tutti` → `Se il Battesimo è necessario a tutti` (missing copula).
- `sacramenti-in-generale.md` Q286 — added missing terminal period.
- `sacramento-battesimo.md` Q303 — added missing terminal period.
- `sacramento-eucaristia.md` Q318 — added missing terminal period.
- `sacramento-eucaristia.md` Q319 — `Chi è ministrò dell'Eucaristia?` → `Chi è ministro` (stray grave on noun).
- `sacramento-eucaristia.md` Q323 — answer ended with comma, replaced with period (`mistero,*` → `mistero.*`).
- `sacramento-eucaristia.md` Q330 — `i1 colore` → `il colore` (digit-1).
- `sacramento-penitenza.md` Q356 — added missing terminal period.
- `sacramento-penitenza.md` Q371 — three fixes: `obbligati, a fuggire` → `obbligati a fuggire`; `le fugge; finisce` → `le fugge, finisce`; added terminal period.
- `sacramento-penitenza.md` Q385 — `benedizioni..Formole` → `benedizioni. Formole` (double period collapsed).
- `sacramento-estrema-unzione.md` Q395 — `ricuperare, la sanità` → `ricuperare la sanità` (stray comma).
- `sacramento-ordine.md` Q401 — `E' grande` → `È grande` (apostrophe substitute for accented È); `la chiesa` → `la Chiesa` (capitalization of Catholic Church).
- `orazione.md` Q419 — `E' necessario` → `È necessario` (question line and answer).

### pt-BR grammar / agreement / typo / completeness / semantic fixed
- `credo-misteri-principali.md` Q30 — added missing comma after `razão` (matches IT and en-US punctuation of relative clause).
- `credo-misteri-principali.md` Q35 — `a graça de Deus` (sg) → `as graças de Deus` (pl, matches IT `grazie` and en-US "graces").
- `credo-creazione.md` Q64 — `antes esta àquela outra` → `antes esta do que aquela outra` (wrong contraction; comparative needs `do que`).
- `credo-incarnazione.md` Q89 — `não podia e nem padecer e nem morrer` → `não podia nem padecer nem morrer` (redundant conjunction).
- `credo-incarnazione.md` Q90 — **mistranslation**: `em segurança ao Paraíso` ("safely") → `consigo ao Paraíso` ("with Him"); IT `seco` carries the theologically loaded "with Him".
- `credo-venuta.md` Q103 — `ou ameaçando os maus` → `e ameaçando os maus` (IT lists two parallel actions with `e`, not alternatives).
- `credo-chiesa.md` Q116 — `de todos cristãos` → `de todos os cristãos` (missing article).
- `credo-remissione-peccati.md` Q148 — **semantic inversion**: `mas em advertência ou consentimento plenos` ("with full advertence") → `mas sem plena advertência e consentimento` ("without full advertence"); IT `senza tutta l'avvertenza`, en-US "without full advertence". The pt-BR text had said the OPPOSITE of the catechetical definition of venial sin.
- `legge-comandamenti.md` Q180 — `por isso que jura o mal` → `por isso quem jura o mal` (relative `que` → subject `quem` to match the parallel `quem perjura`).
- `legge-comandamenti.md` Q184 — question `Os Terceiro Mandamento` → `O Terceiro Mandamento` (plural article on singular noun).
- `legge-precetti.md` Q217 — question `Quem não ouve a Missa nos dias comete` → `nos dias de Preceito, comete` (missing key qualifier `de Preceito`; without it the question is meaningless — every day, not just precept days).
- `legge-virtu.md` Q242 — `à imagem e semelhança de Deus` → `à imagem de Deus` (IT `ad immagine di Dio` only; pt-BR added `e semelhança` not in source).
- `legge-virtu.md` Q245 — `refortalecer` → `fortalecer` (non-standard coinage).
- `legge-virtu.md` Q253 — `nos faz honestos` → `nos fazem honestos` (subject-verb agreement; subject `as quatro virtudes` plural).
- `sacramenti-in-generale.md` Q278 — `o Batismo e a Penitência, pois dá` → `pois dão` (compound subject, plural verb required).
- `sacramento-battesimo.md` Q301 — **wrong referent**: `apresentam à Igreja o batizado` (already-baptized) → `o batizando` (the one to be baptized); godparents present the candidate BEFORE Baptism.
- `sacramento-cresima.md` Q315 — **wrong referent**: `assistir espiritualmente os crismandos` (candidates) → `os crismados` (newly confirmed); Round 3 fixed Q308 same class — Q315 was missed.
- `sacramento-eucaristia.md` — **completeness**: inserted missing `## § 3. Santa Comunhão: Disposições, Obrigação, Efeitos` section heading between Q334 and Q335 (en-US already had it; pt-BR was missing both the OCR smash from IT and the restored heading).
- `sacramento-eucaristia.md` Q332 — `o Corpo do Senhor permanecem inteiros` → `permanece inteiro` (subject is singular `il Corpo del Signore`; verb and adjective both needed singular).
- `sacramento-eucaristia.md` Q341 — `todos o anos` → `todos os anos` (missing `s` on plural article).
- `sacramento-eucaristia.md` Q343 — `com as disposições` → `com as devidas disposições` (IT `con le dovute disposizioni`; `devidas` carries the catechetical sense of "proper/required" dispositions).
- `sacramento-penitenza.md` Q356 — removed stray leading ellipsis from quoted Scripture (`"...Recebei` → `"Recebei`; not in IT).
- `sacramento-penitenza.md` Q371 — `quem não foge dele` → `quem não foge delas` (antecedent `as ocasiões` is feminine plural); also removed stray `pois...` ellipsis.
- `sacramento-penitenza.md` Q374 — `uma nova malícia` → `uma nova grave malícia` (missing word `grave`; IT `una nuova grave malizia`).
- `sacramento-matrimonio.md` Q406 — `cristamente` → `cristãmente` (missing nasal tilde on adverb).
- `sacramento-matrimonio.md` Q410 — `feito a pedido` → `feita a pedido` (gender; participle modifies `transcrição`, feminine).

### en-US consistency
- `legge-virtu.md` Q247 — `living according to its precepts` → `living according to its maxims` (IT `secondo le sue massime`; the same word is correctly rendered "maxims" in Q265 and Q266 of the same chapter).

## Round 6 Audit (2026-04-26)

A sixth pass via `/review-book-translation`. Verified all Round 5 fixes landed; surfaced additional residual IT OCR artefacts (mostly more `E'` apostrophe substitutes and missing terminal periods on closing-quote answers) plus one cluster of pt-BR grammar errors.

### IT canonical OCR artefacts fixed
- `credo-misteri-principali.md` Q35 — `E' utile` / `E' utilissimo` → `È utile` / `È utilissimo` (question and answer).
- `credo-chiesa.md` Q124 — `E' fuori della comunione` → `È fuori della comunione`.
- `credo-remissione-peccati.md` Q131 — `E' grave danno` → `È grave danno` (question line).
- `credo-venuta.md` Q103 — `E' certo che esistono` → `È certo che esistono` (answer; question already had `È`).
- `legge-comandamenti.md` Q181 — `E' grande peccato` → `È grande peccato`.
- `legge-comandamenti.md` Q192 — added missing terminal period (`ordinamento di Dio »*` → `... ».*`).
- `legge-comandamenti.md` Q199 — mismatched quote pair `« … ".` → `« … ».` (closing straight quote replaced with `»`).
- `legge-comandamenti.md` Q212 — added missing terminal period after closing `"` (`tribolazioni"*` → `tribolazioni".*`).
- `legge-precetti.md` Q215 — added missing terminal period (`disprezza me »*` → `... ».*`).
- `legge-virtu.md` Q241 — added missing terminal period (`con tutte le forze »*` → `... ».*`).
- `legge-virtu.md` Q245 — `E' bene fare` → `È bene fare` (question and answer).
- `legge-virtu.md` Q247 — closing punctuation: `morta»*` → `morta ».*` (added space + period).
- `legge-virtu.md` Q264 — Beatitudes: missing period between first and second (`cieli Beati i mansueti` → `cieli. Beati i mansueti`); added missing terminal period at end of the last beatitude.
- `sacramento-cresima.md` Q310 — `E' bene ricevere` → `È bene ricevere`.
- `sacramento-eucaristia.md` Q340 — `E' permessa` → `È permessa` (question line).
- `sacramento-eucaristia.md` Q343 — `E' cosa buona` / `E' cosa ottima` → `È cosa buona` / `È cosa ottima` (question and answer).
- `sacramento-penitenza.md` Q380 — `Cosi sia` → `Così sia` in the absolution formula (matches occurrences elsewhere in the corpus).

### pt-BR grammar / agreement / completeness fixed
- `credo-incarnazione.md` Q88 — verb regimen: `imperando como Senhor aos demônios e às forças` → `sobre os demônios e sobre as forças` (Portuguese `imperar` governs `sobre`, not `a/aos`).
- `credo-venuta.md` Q99 — `inconversível` (non-standard) → `inconvertível`.
- `credo-chiesa.md` Q123 — two fixes in one answer:
  - `os outros os nossos sufrágios` → `as outras os nossos sufrágios` (antecedent `as almas do Purgatório` is feminine, matching IT `le altre`).
  - `todos nós retribuem` → `todos nos retribuem` (subject pronoun → oblique pronoun; IT `ci ricambiano` is "they reciprocate to us").
- `credo-remissione-peccati.md` Q131 — added missing word and restructured: `não há nem os meios de salvação eterna nem a guia segura para esta` → `não há nem os meios estabelecidos nem a guia segura para a salvação eterna` (IT `i mezzi stabiliti nè la guida sicura alla salute eterna`; `estabelecidos` was dropped).
- `legge-comandamenti.md` Q163 — `A que se resume os nossos deveres` → `A que se resumem` (reflexive `se` + plural noun requires plural verb).
- `legge-comandamenti.md` Q209 — `O que proíbe o Nono Mandamento` → `O que nos proíbe ...` (every other prohibitive question heading in the chapter uses `nos`; Q209 was the lone outlier).
- `sacramenti-in-generale.md` Q275 — `Aumenta em nós a Graça a Crisma, a Eucaristia, a Extrema-Unção, a Ordem e o Matrimônio` → `Aumentam` (5-item compound subject; IT `accrescono` plural).
- `sacramento-battesimo.md` Q302 — `elas nos impõem só que Deus impõe` → `só o que Deus impõe` (missing relative pronoun; IT `solo quello che`).
- `sacramento-cresima.md` Q309 — `refortalecem` (non-standard) → `fortalecem` (matches Round 4 fix of same word in `legge-virtu.md` Q245).
- `sacramento-cresima.md` Q314 — `crismando` → `crismado` (question + answer; IT `cresimato` = the confirmed; same class as Q308 / Q315 corrected in earlier rounds — Q314 was missed).
- `sacramento-penitenza.md` Q380 — `"Eu, pois, te absolvo"` → `"Eu te absolvo"` (IT formula `Io ti assolvo` has no `pois/dunque`; en-US matches IT).
- `sacramento-penitenza.md` — **completeness**: inserted missing `## § 4. Absolvição — Satisfação — Indulgências` section heading between Q379 and Q380 (en-US already had it as `## § 4. Absolution — Satisfaction — Indulgences`; IT has the heading smashed into Q379 as a documented OCR artefact; pt-BR omitted it entirely. Same class as the Round 5 § 3 fix in `sacramento-eucaristia.md` pt-BR).

### en-US
All 21 chapters: clean.

## Round 8 Audit (2026-04-26)

Eighth cross-language pass over the first seven chapters (lezione-preliminare through credo-chiesa) × 3 languages. All Round 6–7 fixes verified landed. Three new pt-BR defects and one en-US wording defect found and fixed. IT canonical clean across all 7 files.

### pt-BR grammar / agreement / semantic fixed
- `credo-chiesa.md` Q109 — `nela é santa a doutrina, o sacrifício e os sacramentos` → `nela são santos a doutrina, o sacrifício e os sacramentos` (compound subject is plural; verb and adjective plural masculine agree with predominant nouns `sacrifício` / `sacramentos`; IT `sono santi`).
- `credo-venuta.md` Q104 — question `Quanto durará o Paraíso e o Inferno?` → `Quanto durarão` (compound subject requires plural verb; IT `dureranno`).
- `credo-incarnazione.md` Q88 — `sobretudo com sua Ressurreição dos mortos` → `da morte` (IT `dalla morte` = "from death"; pt-BR `dos mortos` = "from the dead / of the dead" is the wrong referent; en-US "from death" was already correct).

### en-US wording fixed
- `credo-chiesa.md` Q123 — `they receive — the one our prayers, the other our suffrages` → `the former … the latter` (IT `gli uni … le alte` = plural antecedents — the blessed in heaven vs the souls in purgatory; "the one / the other" are English singular forms that do not match the plural groups).

## Round 9 Audit (2026-04-26)

Ninth pass over the batch {credo-remissione-peccati, credo-risurrezione, legge-comandamenti, legge-precetti, legge-virtu, sacramenti-in-generale, sacramento-battesimo} × 3 languages. All Round 6 fixes verified held. Two new IT OCR artefacts and five pt-BR grammar/structure defects found and fixed.

### IT canonical OCR artefacts fixed
- `legge-comandamenti.md` Q189 — `Come conviene, occupare i giorni di festa?` → `Come conviene occupare i giorni di festa?` (stray comma in question line; pt-BR/en-US both correct).
- `legge-virtu.md` Q265 — `c'insegnò cosa ad imitarle` → `c'insegnò così ad imitarle` (`cosa` misread for `così`; pt-BR and en-US were already correct).

### pt-BR grammar / structure / semantic fixed
- `legge-virtu.md` — inserted three missing section headings matching en-US (same class as Round 5 §3 fix in `sacramento-eucaristia.md`): `## § 1. Virtudes em Geral — Virtudes Teologais` (after H1), `## Fé` (before Q232), `## § 3. Virtudes Morais e Vícios — Bem-Aventuranças Evangélicas` (before Q252).
- `legge-virtu.md` Q250 — `virtudes não ordenadas` → `virtudes não comandadas` (IT `non comandate`, en-US "not commanded"; `ordenadas` carries a different nuance).
- `sacramento-battesimo.md` Q297 — `a quanto se lhes opõe` → `a quanto se lhe opõe` (IT `a quanto vi si oppone`; `lhes` plural dative is wrong — single referent "a Fé e a Lei" treated as a unit).
- `sacramento-battesimo.md` Q303 — `assegurar-lhes rapidamente` → `assegurar-lhe rapidamente` (IT `assicurargli` = singular; antecedent is `a criança`).
- `sacramenti-in-generale.md` Q280 — `salvar-se quando, porém não se pode` → `salvar-se, quando, porém, não se pode` (comma misplaced; IT `salvarsi, quando però`; `porém` parenthetical also needs enclosing commas).

### en-US
All 7 chapters: clean.

## Round 10 Audit (2026-04-26)

Tenth pass over the batch {sacramento-cresima, sacramento-eucaristia, sacramento-penitenza, sacramento-estrema-unzione, sacramento-ordine, sacramento-matrimonio, orazione} × 3 languages. All Round 5–6 fixes verified held. Two pt-BR defects found and fixed. IT and en-US clean across all 7 files.

### pt-BR grammar / punctuation fixed
- `sacramento-eucaristia.md` Q320 — `lhes distribuiu aos Apóstolos` → `os distribuiu aos Apóstolos` (double-object construction; `pão e vinho` is the direct object, requiring accusative `os`, not dative `lhes`; IT `li distribuì agli Apostoli`).
- `sacramento-estrema-unzione.md` Q395 — comma-splice repaired: replaced commas between three parallel independent clauses (`aumenta…`; `apaga…`; `dá força…`) with semicolons to match IT and en-US punctuation. The fourth clause `e ajuda…` keeps its comma (joined by `e`).

### en-US
All 7 chapters: clean.

## Round 11 Audit (2026-04-26)

Final pass over all 21 chapters × 3 languages. Pattern scans for IT OCR artefacts, pt-BR diacritic/article duplications, and Q-count mismatches all clean. Two additional pt-BR stray ellipsis defects surfaced and fixed; IT Q318 ellipsis verified as intentional (abbreviated consecration formula, matched in en-US and pt-BR).

### pt-BR fixed
- `legge-virtu.md` Q247 — `"...a Fé sem obras é morta"` → `"a Fé sem obras é morta"` (stray leading ellipsis; not in IT or en-US).
- `legge-comandamenti.md` Q212 — `pois "...é por muitas tribulações`  → `pois "é por muitas tribulações` (stray leading ellipsis; not in IT or en-US).

### Convergence
After Rounds 1–11 the corpus is clean: pattern scans return no defects, all Q counts match across the three languages, and the latest semantic pass surfaced only the two ellipses fixed above. No further defects identified.
