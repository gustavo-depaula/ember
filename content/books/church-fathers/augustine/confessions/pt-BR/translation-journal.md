
## Decisões

- Em XIII, 33, §48, “concreted matter” foi vertido como “matéria criada juntamente com elas”, conforme a explicação parentética da própria fonte, que ressalta a criação simultânea da matéria e de sua forma.
- Em XIII, 34, §49, preservada a expressão “ação racional” da fonte, sem substituí-la por “ação irracional”.
- Em XIII, 36, §51, reorganizada a sintaxe truncada da fonte para explicitar a ligação entre o repouso divino no sétimo dia e o anúncio do repouso humano, mantendo todas as suas orações.

## Review log

### Part 1 of 4, Round 1 (claude, full read)
Verdict: 3 meaning-level, 5 minor. Read all 69 files of part 1. Fixed an OCR-induced contradiction (ch004-14), two misleading headings (in chapter files and book.json), carried-over :— punctuation and one regency error.
- `pt-BR/ch004-chapter-14.md` [4]: “se ele tivesse sido exaltado e esses mesmos homens o houvessem censurado” → “se ele não tivesse sido elogiado, mas esses mesmos homens o houvessem censurado” — source "upraised" is an OCR slip for "unpraised" (Latin si non laudatum vituperarent); the PT "exaltado e ... censurado" contradicts itself *(meaning)*
- `pt-BR/ch001-chapter-11.md` [1]: “Acometido de uma doença, pede com insistência o batismo, para aflição de sua mãe;” → “Acometido de uma doença, estando sua mãe aflita, pede com insistência o batismo;” — source "His Mother Being Troubled": the illness troubles the mother, not his request for baptism, which she wanted to grant *(meaning)*
- `book.json`: “Acometido de uma doença, pede com insistência o batismo, para aflição de sua mãe;” → “Acometido de uma doença, estando sua mãe aflita, pede com insistência o batismo;” — same correction as the chapter heading *(meaning)*
- `pt-BR/ch003-chapter-11.md` [1]: “e o sonho memorável a respeito do filho que Deus lhe concedeu.” → “e o sonho memorável que Deus lhe concedeu a respeito do filho.” — source: the dream was granted by God; the PT relative clause attaches to "filho", as if God granted her the son
- `book.json`: “e o sonho memorável a respeito do filho que Deus lhe concedeu.” → “e o sonho memorável que Deus lhe concedeu a respeito do filho.” — same correction as the chapter heading
- `pt-BR/ch001-chapter-16.md` [3]: “como exemplo de devassidão:—” → “como exemplo de devassidão:” — source punctuation ":—" is not carried into Portuguese
- `pt-BR/ch001-chapter-16.md` [4]: “ao dizer:—” → “ao dizer:” — source punctuation ":—" is not carried into Portuguese
- `pt-BR/ch001-chapter-07.md` [3]: “providenciastes com todas as forças vitais” → “munistes de todas as forças vitais” — "providenciar com" has no valid regency with the relative object "um corpo que"; source: "hast introduced all vital energies"
- Rejected: ch001-chapter-16.md [4] — space before punctuation in ". . ." — the spaced ellipsis reproduces the source's own marking of the omission in the Terence quotation
- Rejected: audit: emphasis markers / parentheses — added bold markers; parentheses turned into commas or dashes — the bold markers are the house paragraph-number format, and the parenthetical content is kept with different punctuation
- Rejected: ch001-chapter-13.md [2] — source reads "Biab", PT reads "Dido" — the PT correctly fixes an obvious source typo
- Rejected: ch003-chapter-06.md [2] / ch004-chapter-15.md [3] — James 1:17 rendered with "variação" and "mudança" in swapped order — both renderings are faithful; this is a style variation, not a defect
- Rejected: ch001-chapter-06.md [2] — "safety" rendered as "segurança" rather than "salvação" — a literal and defensible rendering of the source wording

### Part 1 of 4, Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos 69 arquivos fornecidos da parte 1, notas, metadados pertinentes, diário e alertas mecânicos: um defeito de sentido e um de regência.
- `pt-BR/ch001-chapter-13.md` [4]: “não tivesse esquecido inteiramente de si” → “não se tivesse esquecido inteiramente de si” — Na construção pronominal com complemento introduzido por 'de', falta o pronome 'se': esquecer-se de si.
- `pt-BR/ch002-chapter-05.md` [3]: “não acreditamos na explicação” → “não acreditamos que ele tenha sido cometido” — Em 'we do not believe it', o referente é o crime: não se acredita em sua ocorrência sem um motivo plausível. A tradução desloca essa incredulidade para uma explicação. *(meaning)*
- Rejected: pt-BR/ch001-chapter-03.md [2] — Possível erro em 'vós, que contendes todas as coisas'. — 'Contendes' é a forma correta de 'conter' na segunda pessoa do plural do presente do indicativo.
- Rejected: pt-BR/ch003-chapter-10.md [2] — 'Fig-tree' traduzido por 'figo'. — O contexto distingue o fruto colhido da árvore-mãe e imediatamente o retoma como 'Which fig'; 'figo' preserva o referente inequívoco.

### Part 1 of 4, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001-chapter-13 [3]-[4] and ch002-chapter-05 [2]-[3]: both previous fixes (esquecer-se de si; the referent of 'believe it') are correct and broke nothing nearby; no new defects.
- Rejected: pt-BR/ch002-chapter-05.md [3] — “não acreditamos que ele tenha sido cometido” may read oddly after “investigamos por que se cometeu um crime” — This follows the canonical English “we do not believe it”, where “it” refers to the crime. The fix is faithful, and the tension is in the source itself.
- Rejected: pt-BR/ch002-chapter-05.md [3] — crase in “até àquele homem” — “atribuir a” takes an indirect object, so the crase after “até” is optional and correct here.
- Rejected: pt-BR/ch002-chapter-05.md [^4] — Translator's note on Catiline and Sallust — Accurate: the quotation “ne per otium torpescerent manus aut animus” comes from Sallust's De Catilinae coniuratione 16.
- Rejected: audit: emphasis markers (ch001-chapter-13 [2]-[4], ch002-chapter-05 [2]-[3]) — pt-BR adds 4 emphasis markers per paragraph — These are the house-format **N.** bold paragraph numbers, not a defect.

### Part 2 of 4, Round 1 (claude, full read)
Verdict: 3 meaning-level, 2 minor. Read all 61 files of part 2 against en-US. Fixed one wrong verb person (púnhamos), one mistranslation of "at length" and one subject shift, plus two OCR slips in source Scripture references. All other audit flags are accounted for.
- `pt-BR/ch008-chapter-07.md` [2]: “e me púnhamos frente a frente comigo mesmo” → “e me púnheis frente a frente comigo mesmo” — source: "Thou set me face to face with myself"; the subject is God (vós). "púnhamos" is first person plural ("we put") and names the wrong subject. *(meaning)*
- `pt-BR/ch005-chapter-14.md` [2]: “que podiam enfim responder às objeções de maneira razoável” → “que podiam responder às objeções longamente e de maneira razoável” — source: "could at length, and not irrationally, answer objections". Here "at length" means "extensively" (Latin copiose), not "finally". *(meaning)*
- `pt-BR/ch008-chapter-02.md` [2]: “e que haviam inspirado no povo o amor pelo” → “e com os quais ela inspirara no povo o amor pelo” — source: "to which almost all the nobility of Rome were wedded, and had inspired the people with the love of". The nobility inspired the people; the translation made the rites the subject. *(meaning)*
- `en-US/ch006-chapter-01.md` [2]: “Luke 7:12-l5” → “Luke 7:12-15” — OCR slip in the source: the letter l stands for the digit 1. The audit flagged the mismatch; the translation already has 7:12-15.
- `en-US/ch008-chapter-12.md` [3]: “Matthew 19:2l” → “Matthew 19:21” — OCR slip in the source: the letter l stands for the digit 1. The translation correctly has 19:21.
- Rejected: audit: emphasis markers / parentheses (all files in part) — Counts of emphasis markers and parentheses differ from the source — The extra emphasis markers are the bold paragraph numbers required by house format. The source's parentheses are rendered as dashes or commas, a defensible style choice that keeps every clause.
- Rejected: pt-BR/ch007-chapter-10.md [2] — Audit flagged "conhece conhece" as a repeated word — "quem a conhece conhece a eternidade" is correct: the first verb ends the subject clause, the second is the main verb.
- Rejected: pt-BR/ch008-chapter-12.md [1] — Audit flagged a Scripture reference (13:13) with no counterpart in the source — The source heading has "Rom. XIII. 13" in Roman numerals; it is rendered as "Romanos 13:13", matching book.json.
- Rejected: pt-BR/ch007-chapter-09.md [3] — "Guiará os mansos na justiça" renders the source's "in judgment" — "Na justiça" is the standard Portuguese rendering of this psalm phrase (mishpat, judicium), so the sense is unchanged.
- Rejected: pt-BR/ch008-chapter-02.md [4] — "Roma, outrora vencedora" for "whom Rome once conquered" — The sense is kept: Rome once defeated these gods and now worships them.

### Part 2 of 4, Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 61 arquivos fornecidos, com notas, metadados pertinentes, diário e alertas da auditoria: uma correção menor de formatação; nenhum defeito inequívoco de sentido.
- `pt-BR/ch007-chapter-09.md` [1]: “sobre o Λόγος com” → “sobre o *Λόγος* com” — A regra de formatação exige itálico para expressões gregas mantidas na tradução.
- Rejected: pt-BR/ch007-chapter-03.md [3] — A expressão “vós permitis o mal” parece destoar da discussão anterior sobre Deus sofrer o mal. — A fonte canônica diz expressamente “You allow evil”; a tradução preserva essa leitura.
- Rejected: pt-BR/ch008-chapter-02.md [6] — O pronome em “ensinara-a publicamente” poderia parecer retomar “salvação”. — “Retórica” também é antecedente feminino expresso, e o contraste contextual permite resolver a referência; não há erro inequívoco.

### Part 2 of 4, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch007-chapter-09 [1]-[2]: the italics fix is correct; fixed one stray closing dash in [2].
- `pt-BR/ch007-chapter-09.md` [2]: “habitasse entre os homens —, proporcionastes-me” → “habitasse entre os homens, proporcionastes-me” — source has an anacoluthon dash ('among men—You procured'); in the PT the dash closes no opening dash and is followed by a comma. That is transplanted punctuation and wrong in Portuguese.
- Rejected: pt-BR/ch007-chapter-09.md [1] — Previous fix italicized Λόγος in the heading — Correct: the house format puts retained Greek in italics, and the heading text is otherwise unchanged.
- Rejected: book.json toc ch007-chapter-09 — pt-BR title has Λόγος without italic markers, unlike the Markdown heading — book.json titles are plain text with no Markdown elsewhere; asterisks there would show literally.
- Rejected: pt-BR/ch007-chapter-09.md [1]-[4] — Audit: emphasis markers differ from source — The italics are for the Greek word in [1] and the bold paragraph numbers in the others, as house format requires.
- Rejected: pt-BR/ch007-chapter-09.md [2] — 'inflated with most monstrous pride' rendered 'inflado de monstruosa soberba' without the superlative — The intensity is kept; this is a style choice, not a change of sense.

### Part 2 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos [1]-[3]: a retirada do travessão está correta e não introduziu problemas; nenhum novo defeito encontrado. O parágrafo [4], também sinalizado pela auditoria, não foi fornecido neste delta.
- Rejected: pt-BR/ch007-chapter-09.md [1]-[3] — A auditoria aponta diferenças na quantidade de marcadores de ênfase. — Nos trechos fornecidos, correspondem ao itálico do termo grego e ao negrito dos números de parágrafo, exigidos pelas regras de formatação.

### Part 3 of 4, Round 1 (claude, full read)
Verdict: 4 meaning-level, 8 minor. Full read of Book 9 ch. 4 to Book 11 ch. 15: 4 meaning fixes (number of years at Monica's death, apposition in XI,5, vocative in XI,7) and 8 minor fixes (grammar, concord, typo, punctuation, two small fidelity slips).
- `pt-BR/ch009-chapter-04.md` [7]: “Mas que dor! E como desapareceu!” → “Mas que dor era aquela? E como desapareceu?” — source asks two questions (“But what pain? Or how did it depart?”); the translation turns them into exclamations
- `pt-BR/ch009-chapter-11.md` [3]: “aos cinquenta e seis anos de sua idade e aos trinta e três da minha” → “no quinquagésimo sexto ano de sua idade e no trigésimo terceiro da minha” — source says “the fifty-sixth year of her age, and the thirty-third of mine”, which are ordinals; “aos trinta e três” gives ages one year too high and contradicts the Book 9 summary (“aos trinta e dois anos”) *(meaning)*
- `pt-BR/ch009-chapter-12.md` [7]: “chore por meus pecados diante de vós” → “chore por meus pecados contra vós” — source: “weep for my sins against You”; “diante de vós” loses that the sins are against God
- `pt-BR/ch010-chapter-18.md` [2]: “até que me fosse apresentada aquilo que procurava” → “até que me fosse apresentado aquilo que procurava” — concord: the participle agrees with the neuter “aquilo”
- `pt-BR/ch010-chapter-21.md` [2]: “detesto e execr o” → “detesto e execro” — typo: stray space inside “execro”
- `pt-BR/ch010-chapter-36.md` [2]: “resgatardes minha vida da corrupção, coroar-me de” → “resgatardes minha vida da corrupção, me coroardes de” — breaks the series of inflected infinitives (perdoardes, curardes, resgatardes, saciardes)
- `pt-BR/ch010-chapter-39.md` [2]: “e sinto antes que minhas feridas são curadas por Vós do que que não foram causadas por mim” → “e sinto que minhas feridas antes são curadas por vós do que deixam de ser causadas por mim” — removes the “que que” the audit flagged; “Vós” is capitalized here while the rest of the file uses lowercase “vós/vos”
- `pt-BR/ch010-chapter-40.md` [2]: “Mas esses meus pesos miseráveis, Hebreus 12:1 fazem-me” → “Mas esses meus pesos miseráveis Hebreus 12:1 fazem-me” — the comma separates the subject from its verb
- `pt-BR/ch011-chapter-05.md` [2]: “seu corpo — Vós, a mente que comanda os membros —, Vós, a matéria da qual ele faz alguma coisa —, Vós, a capacidade” → “seu corpo; fizestes a mente que comanda os membros; fizestes a matéria da qual ele faz alguma coisa; fizestes a capacidade” — source: “Thou [made] the mind… Thou the matter…”; the elliptic “Vós, a mente” reads as an apposition that identifies God with the mind and the matter *(meaning)*
- `pt-BR/ch011-chapter-05.md` [2]: “exteriormente —, Vós, os sentidos de seu corpo” → “exteriormente; fizestes os sentidos de seu corpo” — same apposition problem: as written, God is called the senses of the body; source means God made them *(meaning)*
- `pt-BR/ch011-chapter-07.md` [2]: “o Verbo, Deus convosco, ó Deus,” → “o Verbo, Deus que está convosco, Deus,” — source: “the Word, God with You, God” (Jo 1:1), which predicates that the Word is God; “ó Deus” turns the second “God” into a vocative and loses that *(meaning)*
- `pt-BR/ch011-chapter-13.md` [3]: “mas todos estes nossos anos só terão sido quando todos tiverem deixado de ser” → “mas todos estes nossos anos serão quando todos tiverem deixado de ser” — source: “all these of ours shall be when all shall cease to be”; the future perfect “terão sido” changes the tense
- Rejected: pt-BR/ch009-chapter-06.md [2] — “in his sixteenth year” rendered “aos quinze anos” — the sixteenth year is age fifteen; this is correct and matches “Mal tinha quinze anos”
- Rejected: pt-BR/ch010-chapter-40.md [2] — “Tampouco éreis Vós eu mesmo” departs from the garbled English “Nor was I myself the discoverer” — makes the elliptic English explicit, consistent with the next sentence (“nor was it Thou”); defensible
- Rejected: pt-BR/ch011-chapter-15.md [4] — “Is it nature?” rendered “É o futuro?” — the source has an unmistakable OCR slip for “future”; the context requires future
- Rejected: pt-BR/ch010-chapter-31.md [5] — “Romanos 13:23” is a wrong citation — copied faithfully from the source; the source is not corrected
- Rejected: audit: emphasis/parentheses/space before punctuation — bold paragraph numbers, parenthesized Scripture references, “. . .” ellipses — format and style choices; the ellipses follow the source; no defect

### Part 3 of 4, Round 2 (codex, full read)
Verdict: 4 meaning-level, 2 minor. Leitura integral da parte 3, incluindo notas, títulos, metadados pertinentes e auditoria: quatro defeitos de sentido e dois menores.
- `pt-BR/ch010-chapter-34.md` [4]: “são transmitidos às mãos de seus artistas” → “são transmitidos às suas mãos de artistas” — A fonte diz “their artistic hands”: são as mãos dos mesmos homens por cujas almas passam os modelos, não as mãos de artistas pertencentes a eles. *(meaning)*
- `pt-BR/ch010-chapter-36.md` [3]: “não por vós, mas em vosso lugar” → “não por amor de vós, mas em vosso lugar” — “Not for Your sake” indica a finalidade de sermos amados e temidos pelos homens; “não por vós” atribui a Deus o papel de quem ama e teme. *(meaning)*
- `pt-BR/ch010-chapter-36.md` [3]: “que sejamos amados por vós” → “que sejamos amados por amor de vós” — “Let us be loved for Your sake” pede que os homens nos amem por amor de Deus, não que Deus nos ame. *(meaning)*
- `pt-BR/ch010-chapter-39.md` [2]: “e sinto que minhas feridas antes são curadas por vós do que deixam de ser causadas por mim.” → “e sinto minhas feridas antes como curadas por vós do que como não causadas por mim.” — “Not inflicted by me” trata de não ter causado as feridas. A revisão anterior introduziu outra ideia: deixar de continuar causando-as. *(meaning)*
- `pt-BR/ch010-chapter-43.md` [2]: “1 Timóteo 2:5 apareceu entre os pecadores mortais e o Justo imortal —,” → “1 Timóteo 2:5 —, apareceu entre os pecadores mortais e o Justo imortal,” — O travessão deve encerrar a expressão explicativa antes de “apareceu”; na posição atual, encerra também o predicado principal dentro do inciso.
- `pt-BR/translation-journal.md`: “3 meaning fixes” → “4 meaning fixes” — O registro enumera quatro correções marcadas como meaning, incluindo duas intervenções distintas em XI,5; o próprio veredito informa quatro.
- Rejected: pt-BR/ch010-chapter-12.md [2] — A expressão “contamos todos os sentidos do corpo” parece inverter a relação entre contar e perceber. — A formulação estranha está na fonte canônica: “with which we number all the senses of the body”. Não cabe corrigir a edição por meio da tradução.
- Rejected: pt-BR/ch010-chapter-23.md [3] — “Estejam dispostos a ser enganados” parece contradizer a afirmação seguinte de que não querem ser enganados. — A fonte contém expressamente “they are willing to be deceived”; a tradução preserva essa leitura.

### Part 3 of 4, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of Book 9 ch. 4 to Book 11 ch. 15, footnotes, book.json titles and journal: one minor fidelity slip (an added referent “deles” in IX,12); the earlier rounds' fixes hold.
- `pt-BR/ch009-chapter-12.md` [5]: “nem durante as orações deles derramei lágrimas” → “nem durante essas orações derramei lágrimas” — source: “neither in their prayers did I shed tears”. “Their” refers back to “those prayers”; the Latin has “nec in eis precibus”. “As orações deles” brings in other people's prayers, which has no antecedent and reads as a second set of prayers.
- Rejected: pt-BR/ch010-chapter-03.md [4] — “I beseech You” rendered “eu vos pergunto” — Renders the Latin “quaeso”, a softened “I ask”; the sense is unchanged.
- Rejected: pt-BR/ch009-chapter-06.md [2] — “Quanto a o termos criado” not contracted — The contraction rule before a nominalized infinitive is disputed among grammarians; defensible.
- Rejected: pt-BR/ch010-chapter-27.md [2] — “Too late did I love You” rendered “Tarde demais vos amei” instead of the traditional “Tarde vos amei” — Matches the English “too late”; a defensible choice.
- Rejected: pt-BR/ch010-chapter-40.md and later files — Stressed pronoun is “Vós” here but “vós” in earlier files — Each file is internally consistent; reverential capitalization is not normalized.
- Rejected: pt-BR/ch009-chapter-09.md, ch010-chapter-35.md footnotes [^16], [^20] — Translator's notes on marriage tablets and the Roman circus — Both claims are accurate and add context the text does not give.

### Part 3 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificada a alteração e lidos integralmente os parágrafos [4–6] e a nota [^17]; nenhum novo defeito encontrado.
- Rejected: pt-BR/ch009-chapter-12.md [5] — A retomada “nem durante essas orações” poderia parecer redundante. — A própria fonte retoma a oração depois do inciso. A alteração mantém essa estrutura e identifica corretamente as orações já mencionadas.
- Rejected: pt-BR/ch009-chapter-12.md [4–6] — A auditoria aponta diferenças nos marcadores de ênfase. — Nos trechos apresentados, as diferenças correspondem à numeração em negrito e ao itálico dos termos gregos e dos versos latinos, conforme as regras.

### Part 4 of 4, Round 1 (claude, full read)
Verdict: 1 meaning-level, 5 minor. Full read of ch011-chapter-16 to ch013: six fixes (§22 number OCR slip in source and PT, one meaning error on single/double ratio, one ungrammatical phrase, two plural "Vós mesmos"); audit flags otherwise not defects.
- `en-US/ch011-chapter-17.md` [2]: “2. I ask, Father” → “22. I ask, Father” — OCR slip: the sequence runs 21, 22, 23; the source paragraph number dropped a digit
- `pt-BR/ch011-chapter-17.md` [2]: “**2.** Pergunto” → “**22.** Pergunto” — paragraph is §22 (between §21 and §23); follows the corrected source
- `pt-BR/ch011-chapter-26.md` [2]: “Admiraria que não fosse da própria mente.” → “Seria de admirar se não fosse da própria mente.” — source: "It is wonderful to me, if it be not of the mind itself"; "Admiraria que" has no subject or object and is ungrammatical
- `pt-BR/ch011-chapter-27.md` [2]: “ou que tem a mesma duração ou o dobro dela” → “ou que é simples ou dupla em relação a ela” — source: "single or double in respect of it"; "mesma duração" repeats "igual" and loses the single/double ratio (simplum/duplum) *(meaning)*
- `pt-BR/ch013-chapter-15.md` [4]: “porque Vós mesmos sois esse livro” → “porque Vós mesmo sois esse livro” — reverential vós for one person takes the singular "mesmo", as everywhere else in the book
- `pt-BR/ch013-chapter-38.md` [2]: “porque Vós mesmos sois vosso repouso” → “porque Vós mesmo sois vosso repouso” — source: "You Yourself"; the singular addressee takes "mesmo"
- Rejected: pt-BR/ch013-chapter-02.md [3] — PT "numa vida semelhante ao abismo" where the source reads "a light resembling" — the source's "light" is an OCR slip for "life" (Latin vitam; Pilkington reads "life"); the PT gives the intended sense
- Rejected: pt-BR/ch013-chapter-27.md [2] — "daqueles em quem ainda não veem o fruto" against the source's "those who behold not as yet the fruit" — matches the Latin "quorum nondum fructum vident"; a defensible reading of an ambiguous English clause
- Rejected: pt-BR/ch013-chapter-37.md [2] — "nem agis no tempo" fills the verb missing from the source's "nor do You in time" — the English "do" supports "agis"; the verb lost in the source cannot be recovered from the canonical text
- Rejected: parentheses-differ audit flags (21) — source parentheses rendered with em-dashes — punctuation choice; the parenthetical content is kept in every flagged place

### Part 4 of 4, Round 2 (codex, full read)
Verdict: 4 meaning-level, 0 minor. Leitura integral dos 89 arquivos desta parte, com notas, metadados pertinentes, diário e alertas mecânicos: quatro defeitos de sentido.
- `pt-BR/ch012-chapter-03.md` [2]: “não era absolutamente nada” → “não era um nada absoluto” — A fonte diz “not altogether nothing”: havia algo, embora informe. Em português, “não era absolutamente nada” normalmente afirma a inexistência completa. *(meaning)*
- `pt-BR/ch012-chapter-15.md` [6]: “não era absolutamente nada” → “não era um nada absoluto” — “Inasmuch as it was not altogether nothing” distingue o quase nada do nada absoluto; a concordância negativa portuguesa inverte essa afirmação. *(meaning)*
- `pt-BR/ch012-chapter-28.md` [2]: “Essas coisas elas veem” → “Essas coisas eles veem” — “They” retoma os outros leitores apresentados no início do parágrafo como “Outros”, não as coisas criadas. *(meaning)*
- `pt-BR/ch013-chapter-37.md` [2]: “o repouso que sucede ao tempo” → “o repouso que resulta do tempo” — A fonte diz “the rest which results from time”, indicando decorrência; “sucede ao tempo” substitui essa relação por posterioridade. *(meaning)*
- Rejected: Auditoria: diferenças de ênfase — Possível alteração da formatação. — As diferenças correspondem à numeração em negrito exigida pelas regras e à aplicação de itálico ao latim preservado, sem alteração de conteúdo.
- Rejected: Auditoria: quatro diferenças de referências bíblicas — Possível acréscimo de referências. — As referências já estão na fonte: os títulos usam algarismos romanos, e “5:l” e “1:l8” apresentam a letra l no lugar do algarismo 1.
- Rejected: pt-BR/ch012-chapter-31.md [2] — Repetição em “não conseguimos nem conseguimos até agora”. — Embora pouco fluente, “conseguimos” pode representar tanto o pretérito quanto o presente, preservando a distinção temporal da fonte.

### Part 4 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of ch011-chapter-16 to ch013 (89 files) against en-US. Found one meaning fix (ch013-18 "as You make" rendered as an epithet) and one minor fix (tu/vós address shift in ch013-22). Audit flags and earlier-round items are otherwise not defects.
- `pt-BR/ch013-chapter-18.md` [2]: “fazei surgir, Vós que criais, Vós que dais alegria e capacidade —” → “fazei surgir, assim como fazeis, assim como dais alegria e capacidade —” — Source: "let there arise, as You make, as You give joy and ability" (Latin sicut facis, sicut das). The clause states the manner of the arising; the PT turns it into two epithets and loses the comparison. *(meaning)*
- `pt-BR/ch013-chapter-22.md` [2]: “— já não segundo tua espécie, como se seguisses teu próximo que foi adiante de ti, nem como se vivesses segundo” → “— já não segundo vossa espécie, como se seguísseis vosso próximo que foi adiante de vós, nem como se vivêsseis segundo” — Source: "your kind … your neighbour". This continues the plural address of "transformai-vos pela renovação de vossa mente" just before it; the PT switches to singular tu within the same sentence.
- Rejected: pt-BR/ch012-chapter-16.md [23] — "e lhe deis forma e firmeza" has an ambiguous antecedent ("tudo o que sou" or the mother). — The English "conform and confirm it" is equally open, and the nearer reading (all that I am) remains available; not an objective error.
- Rejected: pt-BR/ch013-chapter-21.md [29] — "refrear-se no amor deste mundo" for "restrain themselves from the love of this world". — "Refrear-se em" (to hold oneself in check in) carries the sense of restraint; defensible regency.
- Rejected: pt-BR/ch013-chapter-09.md, ch013-chapter-15.md, ch013-chapter-21.md, ch011-chapter-23.md, ch011-chapter-27.md (translator's notes) — Checked translator's notes [^22]–[^26] as claims of fact. — All are accurate: Latin quantity versus Portuguese stress, Ambrose's hymn, the songs of ascents, parchment made of skin, and the fish as a symbol of Christ and the Eucharist.

### Part 4 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as duas correções e lidos integralmente os cinco blocos apresentados, com os alertas mecânicos e metadados pertinentes; nenhum novo defeito.
- Rejected: pt-BR/ch013-chapter-22.md [2] — Mudança de pessoa em “transformai-vos [...] para que ele possa discernir”. — A própria fonte muda de “your mind” para “that he may prove”; a tradução preserva essa particularidade.
