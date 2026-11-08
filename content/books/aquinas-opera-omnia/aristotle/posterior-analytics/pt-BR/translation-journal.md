
## Termos

| intellectus possibilis / intellectus agens | intelecto possível / intelecto agente | Distintos em g2-c020 na recepção do conhecimento universal e na abstração dos universais. |
| experimentum | experiência | Conhecimento formado a partir de muitas recordações dos particulares. |
| universale quiescens in anima | universal em repouso na alma | Universal considerado à parte dos singulares, nos quais há movimento. |
| Callias | Cálias | Forma portuguesa do nome. |
| recta ratio factibilium | reta razão das coisas que se podem produzir | Fórmula que define a arte em g2-c020. |

## Decisões

- Conservadas as 73 unidades de parágrafo de g2-c020, inclusive os períodos que se prolongam por vários parágrafos, os blocos de citação e os suplementos entre sinais angulares.
- Mantido “intelecto” tanto para a potência cognoscitiva quanto para o hábito dos primeiros princípios; o contexto distingue os sentidos.
- Em g2-c020 [62], traduzida “reversio” pela retomada do combate do exército em fuga, conforme o desenvolvimento do próprio exemplo.
- Não acrescentadas notas do tradutor nesta lição: o comentário explica os termos técnicos e a comparação militar.

## Review log

### Part 1 of 3, Round 1 (claude, full read)
Verdict: 2 meaning-level, 2 minor. Full read of g1-c001 to g1-c026 against the Latin: fixed a mistranslated lemma (“nihil differt”) in two places in g1-c014, a misplaced editorial bracket in g1-c003 and an unfinished clause in g1-c020; the audit flags are otherwise not defects.
- `pt-BR/g1-c014.md` [4]: “Pois nada impede que alguém, interrogado sobre coisas contingentes, enuncie depois a conclusão.” → “Pois não faz diferença que alguém, interrogado sobre coisas contingentes, enuncie depois a conclusão.” — source “Nihil enim differt” means “it makes no difference”, not “nothing prevents”; the commentary in [19] explains it as the conclusion following equally from contingent and from necessary premises *(meaning)*
- `pt-BR/g1-c014.md` [19]: “***Pois nada impede que alguém, interrogado sobre coisas contingentes, enuncie depois a conclusão***” → “***Pois não faz diferença que alguém, interrogado sobre coisas contingentes, enuncie depois a conclusão***” — same lemma “nihil enim differt”; keeps it identical to the corrected text in [4] *(meaning)*
- `pt-BR/g1-c003.md` [10]: “***<Antes, porém,> de fazer a indução***” → “***Antes, <porém,> de fazer a indução***” — source “Ante <autem> quam sit inducere”: only “autem” is the editor's supplement, so only “porém” goes inside the brackets
- `pt-BR/g1-c020.md` [6]: “ou o de que, de iguais subtraindo iguais,” → “ou o de retirar coisas iguais de coisas iguais,” — source “aut quod est aequalia ab aequalibus”; the Portuguese clause is left unfinished and ungrammatical; the new wording matches the phrasing of g1-c018 [10]
- Rejected: pt-BR/g1-c007.md [23] — repeated word “todo todo” — renders “omne totum” (every whole); grammatical and correct
- Rejected: pt-BR/g1-c011.md [28] — repeated word “demonstra demonstra” — “quem demonstra demonstra a propriedade” renders “demonstrator demonstrat passionem”; grammatical
- Rejected: pt-BR/g1-c006.md [25] — space before punctuation in “. . .” — the source lemma has the same ellipsis
- Rejected: parentheses-differ flags (g1-c001 [44], g1-c004 [65], g1-c007 [13], g1-c026 [10], etc.) — source parentheses missing in PT — replaced by dashes or separate sentences with the content intact; house rule forbids transplanting source punctuation
- Rejected: pt-BR/g1-c004.md [15], g1-c006.md [19] — length outliers — complete and faithful; the extra length comes from Portuguese periphrasis
- Rejected: pt-BR/g1-c018.md [17] — lemma “Que seja possível afirmar ao mesmo tempo” does not match the opening of g1-c020 [3] — follows the source's own lemma “contingere autem simul affirmare”; the cross-reference is still identifiable

### Part 1 of 3, Round 2 (codex, full read)
Verdict: 4 meaning-level, 0 minor. Leitura integral de g1-c001 a g1-c026, incluindo notas, auditoria, journal e book.json fornecidos: quatro correções de sentido.
- `pt-BR/g1-c005.md` [41]: “subdivide o segundo membro da primeira divisão” → “subdivide um dos membros da primeira divisão” — “Alterum membrum” significa aqui um dos dois membros. A posição foi apresentada primeiro; o segundo membro era a dignidade. *(meaning)*
- `pt-BR/g1-c012.md` [27]: “convém a algum sujeito particular, e não universalmente” → “convém a algum sujeito de modo particular, e não universalmente” — “Particulariter et non universaliter” qualifica o modo de convir ao sujeito, não o sujeito como particular. *(meaning)*
- `pt-BR/g1-c025.md` [4]: “como a ciência especulativa à geometria” → “como a ciência da visão à geometria” — “Speculativa” designa aqui a óptica, expressamente identificada em [23] como “perspectiva”, não a ciência especulativa em geral. *(meaning)*
- `pt-BR/g1-c025.md` [23]: “***ciência especulativa***, isto é, a óptica” → “***ciência da visão***, isto é, a óptica” — “Speculativa, idest perspectiva” identifica a ciência da visão; a tradução deve preservar essa acepção específica, também usada em g1-c021 [23]. *(meaning)*
- Rejected: pt-BR/g1-c010.md [10] — Ler “contrarium” como sujeito e “privatio aut contradictio” como seus predicativos. — A leitura coordenada adotada na tradução é respaldada pelo comentário em [33]: “contrarium, privatio et contradictio sunt in eodem genere”.
- Rejected: pt-BR/g1-c026.md [5] — Substituir “de certo modo” por uma referência explícita a apenas alguns homens. — O texto canônico traz “quodam modo”; a tradução o conserva, embora o comentário em [19] explicite a aplicação à quantidade particular.
- Rejected: pt-BR/g1-c026.md [8] — Inversão entre A e C na formulação do silogismo. — A formulação problemática já está no latim fornecido: “A quidem omni inest C”. Não cabe corrigir a edição por meio da tradução.

### Part 1 of 3, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of g1-c001 to g1-c026 against the Latin, with notes, audit, journal and book.json: one meaning fix in g1-c003 [3] ("dois ângulos retos" for "duos rectos"); the rest is clean.
- `pt-BR/g1-c003.md` [3]: “assim como que tem dois ângulos retos, sem mais” → “assim como que tem ângulos iguais a dois retos, sem mais” — source "quod duos rectos habet" means having angles equal to two right angles, as the book renders it everywhere else (g1-c002 [5], g1-c011 [5]); "tem dois ângulos retos" says the triangle has two right angles, which is false *(meaning)*
- Rejected: pt-BR/g1-c026.md [18] — "*o que foi morto morreu*" differs from g1-c010's "aquilo que foi morto pereceu" for "interfectum interiit" — both renderings are correct, and the example remains recognizable; this is a style difference, not a defect
- Rejected: pt-BR/g1-c004.md [70] — lemma "De premissas primeiras" does not match g1-c004 [16] "Proceder de premissas primeiras" — the lemma is grammatical and identifies the passage; the Latin lemma is itself a truncated "ex primis autem"
- Rejected: audit flags g1-c001 to g1-c026 — parentheses and emphasis counts differ, length outliers, "todo todo", "demonstra demonstra", ". . ." — rechecked against the Latin: parentheticals are kept as dashes or separate sentences, emphasis differences come from Portuguese word order, and the rest was already rejected in round 1 with no new argument

### Part 1 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura delta de g1-c003 [2–4]: a correção sobre os ângulos está correta e não prejudica o contexto; nenhum novo defeito encontrado. Os parágrafos sinalizados pela auditoria não foram incluídos nesta delta.

### Part 2 of 3, Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Read all of g1-c027 to g1-c044 against the Latin. Found one meaning error (g1-c029 [4], the D/A containment reversed) and four minor grammar or ambiguity slips; all flagged translator's notes are accurate.
- `pt-BR/g1-c029.md` [4]: “Por exemplo, D, ainda que esteja em todo A, predique-se também de todo B” → “Por exemplo, se D estiver em A como em um todo e se predicar de todo B” — “D in toto A sit” means D is contained under A, as the commentary at [23] says: “D contineatur universaliter sub A”. In this translation “D está em todo A” means D is predicated of all A, which is the reverse relation. *(meaning)*
- `pt-BR/g1-c029.md` [6]: “nada pode estar em todo um e em nenhum outro” → “nada pode estar em todo um e em nenhum do outro” — The source is “in hoc quidem omni, in illo autem nullo”. “em nenhum outro” reads as “in no other thing”; g1-c028 [7] already uses “em nenhum do outro”.
- `pt-BR/g1-c031.md` [48]: “o que alguns, por suporem, erraram acerca dos princípios” → “e alguns, por suporem isso, erraram acerca dos princípios” — The source is “quod quidam existimantes, circa principia erraverunt”. As written, “o que” is left as the object of “erraram”, which is ungrammatical.
- `pt-BR/g1-c037.md` [40]: “como que dispersa a visão” → “por exemplo, que dispersa a visão” — The source is “puta quod sit disgregativus visus”, an example. “como que” means “as it were” and blurs the example.
- `pt-BR/g1-c044.md` [29]: “***nem ciência indemonstrável***, a saber, há das coisas que podem ser de outro modo” → “***nem ciência indemonstrável***, isto é, tampouco há ciência indemonstrável das coisas que podem ser de outro modo” — The source is “neque scientia indemonstrabilis, scilicet est eorum quae contingit aliter se habere”, a negative clause. “a saber, há” reads as an affirmation.
- Rejected: pt-BR/g1-c030.md [12], pt-BR/g1-c036.md [40] — Audit flag for the repeated word “todo todo”. — It renders “omne totum” correctly and is grammatical.
- Rejected: audit: parentheses differ (9 places) — Source parentheses dropped. — In each place the parenthetical content is kept, as dashes, a semicolon or a separate sentence. No content is lost.
- Rejected: pt-BR/g1-c043.md [14] — Length outlier (161%). — The added length comes from spelling out “ex quibus” and “circa quod”. Nothing is added to the meaning.
- Rejected: pt-BR/g1-c034.md [7] — The lemma is translated as an affirmative, although Aristotle and §292 have the negative. — The Latin source is affirmative, and the house rule forbids correcting the edition. The translator's note [^11] states the discrepancy accurately.
- Rejected: pt-BR/g1-c030.md [4] — “et si non separabilia sint” rendered as “que não são separáveis”, dropping “even if”. — This follows Aquinas's own reading in [12]: “quaedam particularia quae non sunt separabilia”.
- Rejected: pt-BR/g1-c028.md [^8], g1-c029.md [^9], g1-c032.md [^10], g1-c036.md [^13], g1-c040.md [^15], g1-c043.md [^17] — Translator's notes on inconsistencies in the source. — Each claim was checked against the logic and the letters and is correct. None of them only restates the text.

### Part 2 of 3, Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral de g1-c027.md a g1-c044.md, incluindo notas, auditoria e metadados pertinentes: um defeito de sentido e três menores.
- `pt-BR/g1-c036.md` [31]: “aquilo esteja nessas muitas coisas segundo algo comum” → “aquilo não esteja nessas muitas coisas segundo algo comum” — A fonte traz “quod illud non insit”. A tradução elimina essa negação; apesar da tensão com a explicação seguinte, a regra exige conservar a redação da edição. *(meaning)*
- `pt-BR/g1-c037.md` [34]: “ao triângulo ***enquanto*** triângulo e é demonstrado dele” → “ao triângulo ***enquanto*** ***triângulo*** e é demonstrado dele” — O segundo “triangulus” também está destacado em negrito e itálico na fonte.
- `pt-BR/g1-c041.md` [51]: “à qual acompanha a diversidade do gênero” → “a qual acompanha a diversidade do gênero” — “Acompanhar” é transitivo direto nessa construção; não há preposição que autorize a crase.
- `pt-BR/g1-c041.md` [54]: “pertencem a um único gênero o fato de que ***as coisas demonstradas” → “pertencem a um único gênero ***o fato de que*** ***as coisas demonstradas” — A expressão traduz “cum”, destacado em negrito e itálico na fonte.
- Rejected: pt-BR/g1-c036.md [34] — “Atomis, idest indivisibilibus” foi condensado em “indivisíveis”. — A glosa explicita o significado do termo; a tradução conserva esse significado e sua identificação com os termos extremos.

### Part 2 of 3, Round 3 (claude, delta read)
Verdict: 2 meaning-level, 0 minor. Delta read of g1-c036 [30–32], g1-c037 [33–35], g1-c041 [50–55]: reverted the round-2 negation in c036 [31], which contradicted the next sentence, and fixed the reversed subject in c041 [51]; the other two round-2 fixes are correct.
- `pt-BR/g1-c036.md` [31]: “aquilo não esteja nessas muitas coisas segundo algo comum” → “aquilo esteja nessas muitas coisas segundo algo comum” — The next sentence says what “hoc” is: “Hoc enim verum est… oportet enim, si inest pluribus, quod insit eis secundum aliquid commune”. So the “non” in “quod illud non insit” is the redundant negation of medieval Latin after a negated governing clause (“non est suus intellectus quod hoc non…”), not a third negation. Translated literally, the Portuguese says “isso é verdadeiro” of “não esteja… segundo algo comum” and then says that it is necessary for it to be there by something common. Dropping it translates the idiom; it does not correct the edition. *(meaning)*
- `pt-BR/g1-c041.md` [51]: “a qual acompanha a diversidade do gênero” → “a qual é acompanhada pela diversidade do gênero” — Source “quam concomitatur diversitas generis scibilis”: “quam” is the object and “diversitas generis” the subject. Without the crase, “a qual acompanha a diversidade do gênero” reads with the diversity of principles as subject, which reverses the relation. The passive voice keeps the source's direction and the right regency. *(meaning)*
- Rejected: pt-BR/g1-c037.md [34] — Two adjacent emphasis spans “***enquanto*** ***triângulo***” after the round-2 fix. — They mirror the source's separate spans “***secundum quod*** est ***triangulus***”. Correct.
- Rejected: pt-BR/g1-c041.md [54] — Round-2 emphasis added on “o fato de que”. — It renders “***cum***”, which is emphasized in the source. Correct; the sentence is intact.
- Rejected: pt-BR/g1-c036.md [30] — “et si iterum insit A” translated with B as subject (“se… estiver em A”). — The parallel dative “illi communi” shows the predicate is in A, then in that common. The reading is correct.

### Part 2 of 3, Round 4 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral das 18 lições, g1-c027 a g1-c044, incluindo notas, auditoria e metadados pertinentes: uma correção menor de regência.
- `pt-BR/g1-c030.md` [16]: “às quais transcendem inteiramente” → “as quais transcendem inteiramente” — Transcender, no sentido de ultrapassar, rege objeto direto; não há preposição que justifique a crase.

### Part 2 of 3, Round 5 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of g1-c030 [15–16]: the round-4 crase removal is right in regency but makes the sensible things the subject of “transcendem”, reversing the source; added the subject “elas”.
- `pt-BR/g1-c030.md` [16]: “as quais transcendem inteiramente” → “as quais elas transcendem inteiramente” — Source “quae ab eis omnimode transcenduntur”: the separate substances transcend the sensible things. Without an explicit subject, “as quais transcendem inteiramente” reads as the sensible things doing the transcending, which reverses the relation. “elas” (the substances, “Estas”) makes the subject explicit and keeps the direct object. *(meaning)*
- Rejected: pt-BR/g1-c030.md [15] — “eorum quorum sensum non habemus” rendered as “daquilo para o qual não possuímos o sentido” — This is a faithful rendering; the regency and the sense are correct.

### Part 2 of 3, Round 6 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral das 18 lições, g1-c027.md a g1-c044.md, com conferência das notas, dos apontamentos da auditoria, do diário e dos metadados pertinentes: nenhum novo defeito objetivo encontrado.

### Part 3 of 3, Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of g2-c001–g2-c020 against the Latin, plus the audit flags, footnote [^19] and the journal rows: no objective defects found.
- Rejected: audit: emphasis markers / parentheses (g2-c001 to g2-c020) — Counts of emphasis markers and parentheses differ from the source — The differences come from regrouping bold-italic spans for Portuguese word order, from source markup that was already broken (e.g. `***simpliciter ‘si est,’* nihil`), and from Thomas's parentheticals rendered as dashes (g2-c003 [44], g2-c006 [23]/[24]) or restructured sentences. No lemma or content is lost.
- Rejected: audit: length outliers g2-c009 [7], g2-c011 [3], g2-c019 [6] — pt-BR runs about 160–170% of the source's word count — These are terse Aristotelian passages. The Portuguese spells out the terms of the syllogism (A/B/C) and the ellipses that the Latin compresses, without adding any content.
- Rejected: pt-BR/g2-c006.md [17] — Nested italics `***“*tragelaphus*”***` looks like broken markup — In CommonMark this parses as an em nested inside a strong em and renders correctly, so it is not a defect.
- Rejected: pt-BR/g2-c018.md [24] — “Apresenta a segunda causa” where context ([22] “duas razões”) suggests *rationem* — The translation follows the source's reading *Secundam causam*. Changing it would correct the edition rather than fix an unmistakable OCR slip.
- Rejected: pt-BR/g2-c017.md [6] — “Entre esses termos médios” for *Horum autem*, which may refer to the problems — Thomas reads the passage as being about middles (“Sunt autem quaedam media … genere”, [28]), and the next sentence keeps “problemas”. The rendering is defensible.
- Rejected: pt-BR/g2-c010.md [4], [31] — *crystallus* rendered “cristal” rather than “gelo” — Thomas treats it as crystal formed from fully condensed water, so the literal rendering fits the commentary.
- Rejected: pt-BR/g2-c007.md vs g2-c001.md — *quia/propter quid* rendered “que é/porquê” in g2-c007 but “fato/razão do fato” in g2-c001, and Lua/lua capitalized differently across files — Each file is internally consistent, and the house rules do not require cross-file normalization. The Key Terms table does not fix either rendering.

### Part 3 of 3, Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 20 capítulos g2-c001–g2-c020, da nota, do diário e dos campos pertinentes de book.json, com conferência da auditoria: nenhum defeito objetivo confirmado.
- Rejected: pt-BR/g2-c013.md [6] — “Cada um dos outros pertence a todos os ímpares” poderia incluir indevidamente a primalidade. — O último elemento pode designar conjuntamente “primo em ambos os sentidos”, conforme a explicação de Tomás em [34]; os demais são número e ímpar. A leitura é defensável.
- Rejected: pt-BR/g2-c016.md [16] — Identificação de Alcibíades com Hércules. — A identificação está expressamente no latim: “Alcibiades, idest Hercules”. A tradução preserva a edição; não cabe corrigir essa afirmação do texto-fonte.
