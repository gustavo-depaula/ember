
## Decisões

- Em g9-c008, §11, o sujeito de *attendit* foi entendido como Mateus, que levou em conta a vontade do pai; não se adotou a leitura divergente da referência inglesa, que atribui a consideração ao Senhor.
- Em g9-c008, §13, conservada a ordem “Pedro, João, Tiago” da citação latina, distinta da ordem do §4. No §14, conservado o singular “Não chores”, conforme *noli flere*, distinto do plural do §5.
- Em g9-c008, §20, conservada a construção passiva de *nec hoc ipsum quare plangatur intelligitur*: “nem sequer se compreende por que é pranteada”, sem adotar a interpretação inglesa segundo a qual a sinagoga não compreende por que chora.

## Review log

### Part 1 of 6, Round 1 (claude, full read)
Verdict: 4 meaning-level, 0 minor. Full read of part 1 (g1-pr to g13-c001, 36 files): 4 meaning fixes (a misreadable clause in g10-c005, a source slip in g10-c011, the false friend renuntiare in g10-c012, reversed quoniam in g13-c001); the rest is faithful and complete.
- `pt-BR/g10-c005.md` [24]: “e os anjos servirão como juiz de todos àquele que se fez homem semelhante a nós” → “e os anjos servirão, como a juiz de todos, àquele que se fez homem semelhante a nós” — source: ei tamquam iudici omnium ministrabunt Angeli; the PT wording makes the angels the judge *(meaning)*
- `pt-BR/g10-c011.md` [3]: “para o servirem.” → “para lhe prepararem hospedagem.” — source parerent is a slip for pararent (Vulgate; the same verse is quoted as pararent in [11], rendered 'para lhe prepararem hospedagem'); the messengers go to prepare lodging, not to serve *(meaning)*
- `pt-BR/g10-c012.md` [6]: “permiti-me primeiro renunciar ao que está em casa” → “permiti-me primeiro despedir-me dos que estão em casa” — renuntiare here means take leave (Gr. apotaxasthai); false friend; the commentary in [24], [25] and [29] reads it as saying goodbye *(meaning)*
- `pt-BR/g13-c001.md` [4]: “Por isso, o que dissestes nas trevas” → “Pois o que dissestes nas trevas” — quoniam gives a reason, not a consequence; [12] already renders it 'Pois' *(meaning)*
- Rejected: pt-BR/g11-c004.md [5], [10], [11] — audit: repeated word 'despreza despreza', 'ouve ouve' — required by the syntax: 'Quem me despreza despreza...'
- Rejected: audit: unbalanced quotes, emphasis markers, parentheses — quotes span several verse blocks; bold verse numbers; dashes instead of parentheses — multi-verse speech opened and closed across paragraphs; added bold numbers are the house format; dashes are a valid Portuguese equivalent
- Rejected: pt-BR/g10-c012.md [20] — length outlier 162% — the Latin is terse; the translation is complete and adds nothing
- Rejected: book-wide (g10 vs g11-c005 onward) — Teofilato / Teofilacto; Comentador grego / Autor grego — each file is internally consistent and both forms are accepted Portuguese; unifying them is a style choice for the Key Terms table, not a defect here
- Rejected: pt-BR/g10-c009.md [10] — 'E tinha medo' (singular) vs 'tinham medo' in verse [3] — follows the source's own reading timebat in this quotation
- Rejected: pt-BR/g12-c012.md [2], [12] — the doctor of the Law addresses Jesus with tu, not vós — consistent within the file and defensible for a hostile speaker

### Part 1 of 6, Round 2 (codex, full read)
Verdict: 2 meaning-level, 2 minor. Leitura integral dos 36 arquivos desta parte, das notas, do book.json, do diário e dos alertas apresentados: 2 defeitos de sentido e 2 de formatação.
- `pt-BR/g11-c003.md` [13]: “onde se mostrar digna” → “onde houver alguém digno” — A dignidade diz respeito ao destinatário da paz, como confirma a frase seguinte, «Si quis autem non sit dignus»; o feminino atribui essa dignidade à própria paz. *(meaning)*
- `pt-BR/g11-c009.md` [24]: “jazia no chão: suas próprias forças não bastavam para que se levantasse e buscasse” → “jazia no chão, por não ter forças próprias suficientes para levantar-se, a fim de que buscasse” — «Ut ad se sanandum medicum [...] requireret» exprime a finalidade dessa condição: buscar o médico. A tradução inclui buscar o médico entre aquilo que suas forças não permitiam fazer. *(meaning)*
- `pt-BR/g12-c001.md`: “Epiusion é a transliteração” → “*Epiusion* é a transliteração” — A transliteração grega conservada na nota deve estar em itálico.
- `pt-BR/g12-c009.md`: “Em latim, hic pode significar” → “Em latim, *hic* pode significar” — O termo latino conservado na nota deve estar em itálico.
- Rejected: pt-BR/g10-c007.md [11] — A expressão «morte do tirano» parece estranha no argumento. — Corresponde ao texto canônico fornecido, «mors tyranni»; não há base suficiente para emendar a fonte ou substituir seu sentido.
- Rejected: pt-BR/g12-c011.md [28] — A construção «julgar alguém seu próximo» pode causar dificuldade inicial. — Admite leitura gramatical com sujeito intercalado: alguém julgar seu próximo. Reordená-la seria uma melhoria de clareza, não correção obrigatória.

### Part 1 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the four fixes in g11-c003, g11-c009, g12-c001 and g12-c009, and of the paragraphs around them: all correct, no new defects.
- Rejected: pt-BR/g11-c003.md [13] — “onde houver alguém digno” drops the verb *videbitur* (“parecer”). — “segundo meu juízo” in the same clause already carries the idea of judgement. The fix rightly moves the worthiness from the peace to the person who receives it.
- Rejected: pt-BR/g11-c009.md [24] — *ut ... requireret* could be read as a result clause (“de modo que precisava do médico”) rather than a purpose clause. — Latin *ut* with the imperfect subjunctive allows either reading, and the purpose reading fits Augustine's anti-Pelagian argument. The fix correctly removes seeking the physician from what his strength could not do.

### Part 2 of 6, Round 1 (claude, full read)
Verdict: 5 meaning-level, 8 minor. Full read of part 2 (36 files, g13-c002 to g17-c004): 13 fixes, 5 meaning (ambiguous 'pelos defuntos', wrong subject or possessive in g17-c002, OCR 'culpae' for 'copulae', dropped 'omnis') and 8 minor (quotation address consistency, an unclosed quote, one grammar slip).
- `pt-BR/g13-c002.md` [13]: “feitas pelos defuntos” → “feitas em favor dos defuntos” — source *pro defunctis*: offerings made for the dead; “feitas pelos defuntos” reads as made by the dead *(meaning)*
- `pt-BR/g14-c002.md` [20]: ““Senhor, deixai-a este ano”” → ““Senhor, deixa-a este ano”” — quotes verse 8, rendered in this file with *tu* (“deixa-a”); keep the quotation consistent with the pericope
- `pt-BR/g14-c002.md` [22]: ““se não, no futuro a cortareis”, a saber, quando vierdes no juízo” → ““se não, no futuro a cortarás”, a saber, quando vieres no juízo” — quotes verse 9 (“a cortarás” in [5]); same address throughout the quotation
- `pt-BR/g15-c004.md` [41]: “foi feito como mandastes” → “foi feito como mandaste” — quotes verse 22, rendered in [9] as “como mandaste”
- `pt-BR/g16-c003.md` [7]: “mas ninguém lhe dava nada.” → “mas ninguém lhe dava nada”.” — the parable's opening quote in [2] is never closed in this file
- `pt-BR/g16-c004.md` [21]: “é o mesmo que pecar “diante de vós”” → “é o mesmo que pecar “diante de ti”” — quotes *coram te* of verse 18, rendered “diante de ti” in [3]
- `pt-BR/g16-c004.md` [21]: “e “diante de vós”, no próprio santuário” → “e “diante de ti”, no próprio santuário” — same quotation of verse 18; keep “diante de ti”
- `pt-BR/g16-c005.md` [13]: “ele mostrou prestar culto a nenhum outro Deus senão” → “viu-se que ele não prestava culto a nenhum outro Deus senão” — *nenhum* after the verb needs a negation; source *colere visus est*
- `pt-BR/g16-c005.md` [33]: “e nunca decidistes que” → “e nunca decidiste que” — the son addresses the father with *tu* throughout the parable (“te sirvo”)
- `pt-BR/g17-c002.md` [17]: “o apego tenta nossa avareza” → “tenta com a avareza nossos afetos” — the subject of *tentat* is mammon and *affectus* is its object (our affections); the translation makes “o apego” the subject *(meaning)*
- `pt-BR/g17-c002.md` [29]: “os que subordinam suas ameaças aos próprios desejos, iludindo-se com sua bondade” → “os que subordinam as ameaças de Deus aos próprios desejos, iludindo-se com a bondade divina” — *minas eius* and *de bonitate eius* refer to God; “suas ameaças” reads as the sinners' own threats *(meaning)*
- `pt-BR/g17-c003.md` [20]: “para que não negues que Deus seja o autor de tua culpa” → “para que não negues que Deus seja o autor de tua união” — Ambrose (Exp. in Luc. VIII) reads *tuae copulae*; *culpae* is an OCR slip, and the context (“quod Deus coniunxit”) makes the union, not guilt, the referent *(meaning)*
- `pt-BR/g17-c004.md` [7]: “nem as riquezas são criminosas” → “nem todas as riquezas são criminosas” — *non omnis … aut divitiae criminosae*: the negation carries *omnis* to riches too; the translation denies that riches are ever criminal *(meaning)*
- Rejected: pt-BR/g14-c003.md to g16-c005.md — verse numbers are plain (“10 Ensinava”) instead of bold `**10.**` as in other files — follows the source format and is consistent within each file; not a defect
- Rejected: pt-BR/g13-c010.md [30] vs g14-c006.md [15] — *Graecus* rendered “Um autor grego” in one file and “Grego” in another — both are accurate; each file is internally consistent
- Rejected: pt-BR/g15-c006.md [18] — “Agostinho, A Leta”: the letter is Ep. 243 to Laetus — follows the source's *ad Laetam*; correcting the edition's attribution is beyond the rules
- Rejected: mechanical audit, unbalanced quotes — quotes open and close in different paragraphs — they balance across each pericope, except g16-c003, fixed above

### Part 2 of 6, Round 2 (codex, full read)
Verdict: 7 meaning-level, 2 minor. Leitura integral dos 36 arquivos, notas, auditoria, book.json e diário: sete correções de sentido e duas correções menores de contagem no diário.
- `pt-BR/g13-c005.md` [20]: “aquele que esperara muitos anos” → “aquele que esperara viver por muitos anos” — Multa tempora fuerat praestolatus refere-se aos muitos anos futuros que esperava ter, não a anos já passados esperando. *(meaning)*
- `pt-BR/g13-c007.md` [11]: “Passando, portanto, pela alma” → “Deixando, portanto, de lado a alma” — Pertransiens animam significa passar por cima da consideração da alma, para tratar somente do corpo, como explicita a oração seguinte. *(meaning)*
- `pt-BR/g13-c013.md` [20]: “separou-nos uns dos outros e mostrou outro Pai” → “separou-nos do diabo e mostrou outro Pai” — Nos ab invicem separavit refere-se à separação entre o diabo, apresentado como pai, e nós, seus antigos filhos por imitação. *(meaning)*
- `pt-BR/g14-c003.md` [14]: “Jesus havia curado um homem no sábado” → “Jesus havia curado uma pessoa no sábado” — Hominem designa aqui um ser humano: a pessoa curada é a mulher mencionada em todo o comentário. 'Um homem' atribui-lhe indevidamente o sexo masculino. *(meaning)*
- `pt-BR/g16-c003.md` [28]: “que são as privações mais miseráveis” → “o que constitui uma privação mais miserável” — Miserabiliora ieiunia qualifica a falta de boas obras e virtudes, não as próprias obras e virtudes; o comparativo também deve ser preservado. *(meaning)*
- `pt-BR/g16-c004.md` [27]: “antes de compreender a Deus, estando longe, mas já o procurando piedosamente” → “antes que o filho compreendesse a Deus, quando estava longe, mas já o procurava piedosamente” — O sujeito de intelligeret e quaereret é o filho. A construção reduzida portuguesa liga essas ações ao sujeito da oração principal, 'seu pai'. *(meaning)*
- `pt-BR/g16-c004.md` [45]: “Assim, os gentios não existem; o cristão existe.” → “Assim, não se trata dos gentios, mas do cristão.” — Gentes non sunt, Christianus est identifica quem o filho representa nesta interpretação; não nega a existência dos gentios. A distinção posterior entre ser vivificado e reviver confirma o argumento. *(meaning)*
- `pt-BR/translation-journal.md`: “12 fixes, 5 meaning” → “13 fixes, 5 meaning” — O registro enumera treze correções: cinco de sentido e oito menores, conforme também informa o próprio Verdict.
- `pt-BR/translation-journal.md`: “and 7 minor (quotation address consistency” → “and 8 minor (quotation address consistency” — A lista contém oito correções menores, não sete.
- Rejected: auditoria mecânica — arquivos desta parte — Aspas desequilibradas por parágrafo e diferenças nos marcadores de ênfase. — As citações se fecham ao longo das respectivas perícopes; as diferenças de ênfase assinaladas correspondem ao negrito dos números dos versículos.
- Rejected: pt-BR/g13-c004.md [9] — Tradução com 168% da contagem de palavras do latim. — A expansão decorre das construções portuguesas necessárias; todas as orações correspondem ao latim, sem acréscimo de conteúdo.
- Rejected: pt-BR/g16-c005.md [18] — O publicano que se justifica parece confundir-se com o fariseu. — O texto canônico diz publicano iustificanti se. A tradução preserva a identificação da edição, cuja correção não cabe nesta revisão.

### Part 2 of 6, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of part 2 (36 files, g13-c002 to g17-c004) against the Latin, with translator's notes, audit flags and journal; no new defects found, and the earlier fixes are correct and intact.
- Rejected: pt-BR/g13-c008.md [2]–[6] — The pericope for verses 27–31 has no quotation marks, although it continues the speech that g13-c007 opens and closes with quotation marks. — The file is internally consistent and does not misattribute the speech. Quotation style is not normalized across files.
- Rejected: pt-BR/g14-c002.md [14] — “devem ser entendidos também como as três idades” adds “também”, while the source has *Sed id triennium intelligendum est*. — *Sed* introduces a second reading after the three refusals of fruit. “Também” marks that alternative and changes nothing the reader learns.
- Rejected: pt-BR/g13-c004.md [6], g14-c002.md [17], g14-c005.md [28], g14-c006.md [19], g17-c001.md [14] — Verse quotations inside the commentary differ slightly from the pericope wording, for example omitting “Senhor”, “todos” or “cada um”. — Each follows the commentary's own Latin citation (*dimitte illam hoc anno*, *discedite a me, operarii*, *convocatis debitoribus*), which omits those words. That is correct, not drift.
- Rejected: pt-BR/g17-c002.md, g17-c004.md — The sources are cited as “Gregório, Morais sobre Jó” and “Sobre as palavras do Senhor”, while other files use “Gregório, Morais” and “Sobre as Palavras do Senhor”. — Each file is internally consistent, and both forms identify the work correctly.
- Rejected: pt-BR/g16-c005.md [13] — The text cites “Salmo 72:23” with Vulgate numbering instead of Hebrew numbering (73). — It follows the source's *Psalmo 72, 23* and quotes the Vulgate text. Renumbering would correct the edition, which the house rules forbid.
- Rejected: mechanical audit, unbalanced quotes and emphasis markers — Quotes open and close in different paragraphs, and the count of bold markers differs from the source. — Each pericope's quotes balance across its paragraphs, and the extra emphasis markers are the bold verse numbers, as rounds 1 and 2 already found.

### Part 3 of 6, Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of g17-c005 to g20-c002 (59 files): the translation is complete and faithful, the translator's notes check out, and the only defect is one missing accent (faisca → faísca).
- `pt-BR/g18-c010.md` [7]: “como um relâmpago que faisca” → “como um relâmpago que faísca” — Present tense of faiscar takes an accent: faísca (fulgur coruscans).
- Rejected: audit: unbalanced quotes (35 flags) — Opening and closing quotation marks fall in different paragraphs — Each case is a multi-verse quotation that opens in its first verse and closes in its last; in g2-c014 to g2-c022 and g2-c027 the canticle runs across several chapter files. Nothing is missing.
- Rejected: audit: emphasis markers differ (124 flags) — pt-BR adds bold verse numbers, and the number style varies between files (`**22.**`, `**2**`, plain `7`) — Bold verse numbers follow the house format. Each file is internally consistent, and the meaning is unaffected.
- Rejected: pt-BR/g2-c001.md [24] — The source parenthesis (hoc est optime vel strenue) became an 'isto é' clause — The content is fully kept; dropping the parentheses is a punctuation choice.
- Rejected: pt-BR/g18-c001.md [7] — Length outlier at 160% of the source — Checked clause by clause against the Latin: no additions. The length comes from Portuguese periphrasis.
- Rejected: Teofilacto / Teofilato; Gregório Nazianzeno / de Nazianzo; Morais / Morais sobre Jó — Name and title forms vary between files — Both forms of each are valid Portuguese, and each file is consistent. With no Key Terms row to enforce, normalizing across the book is a style decision.
- Rejected: pt-BR/g17-c005.md [10] — 'ela estava mais morta' commits the subject to the soul — In context the antecedent is anima mortua, so the reading is defensible.
- Rejected: pt-BR/g18-c004.md [13] — 'por direito de senhor' for iure servitii — It states the same claim from the master's side; the reader is not misinformed.

### Part 3 of 6, Round 2 (codex, full read)
Verdict: 4 meaning-level, 2 minor. Leitura integral dos 59 arquivos, das notas, do book.json e do diário: quatro defeitos de sentido e dois menores.
- `pt-BR/g18-c002.md` [6]: “nem uma repreensão severa abata, ou a conivência não convide à culpa.” → “para que nem uma repreensão severa abata, nem a conivência convide à culpa.” — O latim apresenta dois efeitos a evitar; a coordenação portuguesa mistura indevidamente «nem», «ou» e «não».
- `pt-BR/g19-c007.md` [2]: “ao aproximar-se de Jericó, um cego” → “ao aproximar-se Jesus de Jericó, um cego” — O sujeito implícito de «appropinquaret» é Jesus; a construção portuguesa atribui a aproximação ao cego, que estava sentado. *(meaning)*
- `pt-BR/g19-c007.md` [11]: “ao aproximar-se de Jericó, um cego” → “ao aproximar-se Jesus de Jericó, um cego” — Na citação repetida, quem se aproxima de Jericó é Jesus, não o cego sentado à beira do caminho. *(meaning)*
- `pt-BR/g2-c027.md` [8]: “O Senhor visitou seu povo como quem definhava por uma longa enfermidade, e o redimiu com o sangue de seu Filho único, como quem fora vendido sob o pecado.” → “O Senhor visitou seu povo, como que definhando por uma longa enfermidade e vendido sob o pecado, e o redimiu com o sangue de seu Filho único.” — «Tabescentem» e «venditam» qualificam «plebem». As duas construções com «como quem» atribuíam ao Senhor a enfermidade e a condição de vendido sob o pecado. *(meaning)*
- `pt-BR/g2-c037.md` [2]: “para dirigir nossos pés pelo caminho da paz.” → “para dirigir nossos pés pelo caminho da paz”.” — Falta fechar a aspa aberta em g2-c027 [3]. Diferentemente do que afirma o registro anterior, o último versículo do cântico também não contém o fechamento.
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/g2-c010.md` [24]: “e foi dela que o Unigênito tomou a forma da humanidade.” → “e foi da Virgem que o Unigênito tomou a forma da humanidade.” — «Ex qua» retoma a Virgem, da qual Cristo recebeu a humanidade; em português, «dela» retoma imediatamente «uma mesma linhagem».
- Rejected: pt-BR/g20-c001.md [12] — A afirmação de que todos os ricos são avarentos parece contrariar o comentário posterior. — A generalização está expressamente no latim: «omnes divites avaros»; não cabe corrigir o autor.
- Rejected: pt-BR/g20-c002.md [58] — Referência a talentos e a recompensas desiguais na comparação das parábolas. — Ambas as particularidades constam da fonte: «quinque talenta» e «praemiis ... imparibus».

### Part 3 of 6, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of 59 files (g17-c005 to g20-c002), their translator's notes, book.json and the journal: one meaning-level defect, the 'dela' antecedent in g2-c010 [24], resubmitted from round 2.
- `pt-BR/g2-c010.md` [24]: “e foi dela que o” → “e foi da Virgem que o” — Ex qua refers to the Virgin, from whom the Only-begotten took his humanity. In Portuguese, 'dela' attaches to the nearest feminine noun, 'uma mesma linhagem', which weakens Cyril's point that the body did not come from Joseph. Resubmitted from round 2, which was not applied; the span is shorter to avoid the earlier match failure. *(meaning)*
- Rejected: pt-BR/g2-c008.md [4] — Latin 'hoc die … aequinoctium, illo solstitium' rendered 'naquele dia … equinócio, ou neste o solstício', which looks swapped — Portuguese 'este' points to the nearer mention (December) and 'aquele' to the farther (March), so equinox–March and solstice–December are kept correctly.
- Rejected: pt-BR/g2-c007.md [5] — 'pontifices templi' rendered 'sumos sacerdotes' for priests serving their course — Bede uses pontifex for these priests, and g2-c003 [5] presents them as several high priests established under David; the rendering follows the source.
- Rejected: pt-BR/g2-c004.md [8] — PT 'não o dizemos apenas' adds a negation absent from 'Et hoc tantum … dicimus, sed et in futuro' — The 'tantum … sed et' construction requires the 'not only … but also' sense; the PT renders the evident meaning.

### Part 3 of 6, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Conferidos g2-c010 [23–25] e a nota [^35]: a alteração para «da Virgem» está correta, sem novos defeitos. Os parágrafos [2–5] citados pelo audit não foram fornecidos, impedindo verificar seus alertas.

### Part 4 of 6, Round 1 (claude, full read)
Verdict: 2 meaning-level, 2 minor. Part 4 read in full (g20-c003 to g25-c001): two meaning defects from reversed este/aquele referents (g21-c005 [13], g23-c005 [14]) and two minor quotation drifts; translator's notes 40–50 checked and accurate.
- `pt-BR/g21-c005.md` [13]: “este segundo a carne, aquele segundo o espírito” → “pai segundo a carne, servo segundo o espírito” — Source: hoc secundum carnem, illud secundum spiritum, meaning David is father according to the flesh and servant according to the spirit. In Portuguese, "este" points to the nearer word (servo) and "aquele" to the farther (pai), so the sentence says the opposite. *(meaning)*
- `pt-BR/g23-c005.md` [14]: “este se refere ao corpo de Cristo, aquele ao sangue” → “o pão se refere ao corpo de Cristo, o vinho ao sangue” — Source: bread is referred to the body and wine to the blood. In Portuguese, "este" points to vinho and "aquele" to pão, so the referents are reversed. *(meaning)*
- `pt-BR/g23-c013.md` [17]: “o manso e humilde” → “o manso e brando” — Source: mansuetum et mitem. Both words mean gentle; "humilde" is pulled toward the wording of Mt 11:29, which the source does not use.
- `pt-BR/g24-c001.md` [11]: ““Dai a César o que é de César”” → ““Restituí a César o que é de César”” — Source: reddite. The book renders it "Restituí" (g21-c003 [8], [17], [20], where Teofilacto contrasts date with reddite); "Dai" is the familiar Bible wording.
- Rejected: pt-BR/g20-c003.md [27] and other g20 files — "Teofilato" in g20 files against "Teofilacto" from g21 on — Both forms are attested in Portuguese, and each file is internally consistent.
- Rejected: pt-BR/g21-c002.md [29] — "Eu vos darei as nações" for dabo tibi (singular) — Reverential vós for addresses within the Godhead is used consistently in the book ("Sentai-vos à minha direita").
- Rejected: pt-BR/g23-c012.md [10] — "não por minhas feridas, mas pelas vossas" seems inverted — It follows the source as given (non mea, sed tua vulnera), and the source is not corrected.
- Rejected: audit: unbalanced quotes, emphasis markers, parentheses — Mechanical flags — Quotes in verse blocks open and close across adjacent verses, the italics are the commentary formatting, and the source parentheses are rendered with dashes or commas without loss of content.
- Rejected: audit: length outliers g22-c006 [21], g23-c010 [19] — pt-BR runs about 160% of source length — Checked clause by clause: nothing is added; the length comes from expanding the Latin syntax.

### Part 4 of 6, Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 45 arquivos, notas, journal e book.json: 4 correções de sentido e 1 menor; alertas mecânicos sem novos defeitos.
- `pt-BR/g21-c002.md` [22]: “lhe devolveram desonrados e de mãos vazias, sem que aqueles tivessem conseguido obter deles qualquer proveito” → “despediram desonrados e sem fruto para si mesmos, sem terem podido tirar deles proveito algum” — Os judeus são o sujeito de potuerunt proficere; de quibus refere-se aos enviados. São os judeus que não tiraram proveito dos enviados, não o contrário. *(meaning)*
- `pt-BR/g24-c002.md` [14]: “para que, se falarmos a palavra de Deus por desejo de ostentação” → “para evitar que, se falarmos a palavra de Deus por desejo de ostentação” — Ne abrange tanto a permanência da culpa dos ouvintes quanto o surgimento da culpa do pregador. O silêncio visa evitar esses resultados; a tradução os apresenta como finalidade. *(meaning)*
- `pt-BR/g24-c003.md` [4]: “nada digno de morte lhe foi feito” → “nada digno de morte foi feito por ele” — Ei é aqui dativo de agente: Pilatos afirma que Jesus não praticou nada merecedor da morte, não que nada dessa natureza lhe tenha sido feito. *(meaning)*
- `pt-BR/g24-c003.md` [16]: “nada digno de morte lhe foi feito” → “nada digno de morte foi feito por ele” — Repete-se a declaração de inocência: actum est ei refere-se ao que Jesus praticou. A conclusão de Ambrósio confirma que nenhum dos dois o declara culpado. *(meaning)*
- `pt-BR/g25-c001.md` [28]: “ao acrescentar: “Eram Maria Madalena”” → “ao acrescentar: “Era Maria Madalena”” — A citação abreviada tem sujeito singular, e o próprio latim emprega erat.
- Rejected: pt-BR/g21-c004.md [11] — “Já não puderam morrer” parece exigir o futuro. — O texto canônico traz potuerunt, no passado, diferentemente de poterunt na citação do parágrafo 24. A tradução preserva essa diferença.
- Rejected: pt-BR/g23-c010.md [7] — “Permitindo até que emerjam um pouco” parece contrariar a imagem da aprendizagem de natação. — O latim fornecido traz emergi. Substituir por submergir pressuporia corrigir a fonte sem certeza de erro de OCR.
- Rejected: pt-BR/g23-c014.md [26] — A pergunta “Não te vi no jardim?” é atribuída a Mateus. — A atribuição Matthaeus está expressamente na fonte canônica; não cabe corrigir a atribuição do autor por meio da tradução.

### Part 4 of 6, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of part 4 (g20-c003 to g25-c001, 45 files) with footnotes 40–50: no new defects; prior fixes verified, mechanical flags already adjudicated.
- Rejected: pt-BR/g22-c007.md [22] — “não devemos entendê-lo como o etéreo, ou o sideral, ou o aéreo” seems to contradict Bede's known point that the heaven which passes is the aerial one — The canonical Latin reads “non aethereum, sive sidereum, sive aereum”, and the translation follows it. Restoring “sed aereum” would correct the edition, which is not done.
- Rejected: pt-BR/g22-c006.md [19] — “quando se encontra diante do sol” for “cum fuerit ex regione solis” (opposite the sun) — “Diante do sol” can be read as facing the sun, i.e. opposite it, which fits a lunar eclipse. The sense is not misstated.
- Rejected: pt-BR/g21-c002.md [43] — “ou será dispersado como palha” adds “como palha” to “vel ventilabit eum” — The palha image is in the very next sentence of the source (“ut ab area paleae”). Bringing it forward clarifies the winnowing metaphor without adding content.
- Rejected: pt-BR/g24-c004.md [13], footnote 48 — The note points out the source's error in calling *pagos* Greek — The note is factually correct (πάγος is Greek for crag, *pagus* is Latin for district) and corrects the reader without altering the source.
- Rejected: attribution labels across files (“Um comentador grego” / “Um autor grego”; “Sobre os Evangelhos” / “sobre os Evangelhos”) — Rendering varies between files — No Key Terms row governs these labels, and each file is internally consistent.

### Part 5 of 6, Round 1 (claude, full read)
Verdict: 5 meaning-level, 2 minor. Read part 5 in full (g25-c002 to g5-c008, 36 files). Fixed five meaning defects: an ambiguous referent in Ambrose, two mistranslations from OCR slips (muneris, deferatur), and Salmon rendered as Salomão. Fixed two minor slips. The rest is faithful and complete.
- `pt-BR/g25-c004.md` [21]: “e mais elevadas; este, dos acontecimentos” → “e mais elevadas; Lucas, dos acontecimentos” — *hic* is Luke. In this sentence “este” can only point back to João, the one name in it, which reverses the contrast. *(meaning)*
- `pt-BR/g25-c004.md` [21]: “Este empregou uma exposição histórica mais ampla; aquele, um resumo” → “Lucas empregou uma exposição histórica mais ampla; João, um resumo” — *hic historico usus circuitu, ille compendio*: Luke uses the fuller account, John the summary. As written, the pronouns can be read the wrong way round. *(meaning)*
- `pt-BR/g3-c008.md` [14]: “preparou para recebê-lo!*.” → “preparou para recebê-lo!*” — A stray period after the exclamation mark.
- `pt-BR/g4-c008.md` [35]: ““que foi filho de Helmadam”” → ““que foi filho de Elmadã”” — The lemma quotes the genealogy, which reads Elmadã in [7]. All the other names in the list use the Portuguese form (Esli, Cosã, Melqui).
- `pt-BR/g4-c008.md` [40]: ““que foi filho de Salomão”” → ““que foi filho de Salmon”” — The Glossa's *Salomon* sits between Booz and Naasson, so it is Salmon (verse 32, [11]). “Salomão” names Solomon and breaks the chain. *(meaning)*
- `pt-BR/g4-c008.md` [52]: “autor do número místico” → “autor do dom místico” — *mystici auctor numeris* is an OCR slip for *muneris*: *mystici* does not agree with *numeris*. Ambrose has *mystici auctor muneris*, “author of the mystic gift”. *(meaning)*
- `pt-BR/g5-c002.md` [12]: “É bom, se for abandonado, não usurpado.” → “É bom, se for conferido, não usurpado.” — *deseratur* is a long-s OCR slip for *deferatur*. Ambrose reads *Bonum, si deferatur, non si rapiatur*, so power is good if conferred, not seized. “Abandonado” makes no sense. *(meaning)*
- Rejected: unbalanced quotes (24 flags) — Opening and closing quotation marks fall in different paragraphs. — Each case is one Gospel quotation running across several verse blocks. Every flagged quotation opens and closes correctly.
- Rejected: emphasis markers / g3-c008 to g4-c002 — Bold `**N.**` verse numbers in most files, plain numbers in these. — The source has no bold, and each file is internally consistent. This is a defensible format choice, not a defect.
- Rejected: pt-BR/g4-c008.md [27], [35] — The source parentheses are missing. — Their content is kept, set off with commas and dashes. Nothing is lost.
- Rejected: pt-BR/g3-c014.md [11], pt-BR/g5-c005.md [27] — Length outliers. — Checked clause by clause. The added length is normal expansion and adds no content.
- Rejected: pt-BR/g4-c008.md [35] — “Melca” and “Matatias” differ from Meleia and Matatá in the verses. — Ambrose's Latin has *Melcha* and *Mathathiae*. The translation follows the commentator's own text.
- Rejected: pt-BR/g4-c008.md [^60] — Possible restating note. — It adds a factual caution that the etymologies are traditional, not philological. It is accurate.

### Part 5 of 6, Round 2 (codex, full read)
Verdict: 11 meaning-level, 4 minor. Lidos integralmente os 36 arquivos, suas notas, o journal e o book.json; propostas correções pontuais de sentido e gramática e a remoção de uma nota redundante.
- `pt-BR/g3-c010.md` [16]: “Por isso lhes ameaça especialmente” → “Por isso os ameaça especialmente” — A pessoa ameaçada é objeto direto de ameaçar; cabe os, não lhes.
- `pt-BR/g4-c002.md` [12]: “seu leito e seu repouso” → “seu leito e sua cama” — Stratum designa a cama ou o leito, não o repouso. *(meaning)*
- `pt-BR/g4-c002.md` [30]: “Toda carne, isto é, todo homem, não pôde ver nesta vida” → “Nem toda carne, isto é, nem todo homem, pôde ver nesta vida” — A oposição ao juízo final indica que nem todos viram Cristo nesta vida, não que ninguém o tenha visto. *(meaning)*
- `pt-BR/g4-c003.md` [7]: “os termos natus e filius” → “os termos latinos natus (“nascido”) e filius (“filho”)” — Os significados das palavras são necessários para compreender a distinção lexical apresentada pelo autor. *(meaning)*
- `pt-BR/g4-c003.md` [7]: “genimen, porém, pode designar” → “genimen (“cria”), porém, pode designar” — Falta traduzir o termo cujo emprego o comentário compara com natus e filius. *(meaning)*
- `pt-BR/g4-c003.md` [7]: “Raramente, porém, esses termos são empregados a respeito dos animais” → “Raramente, porém, a designação genimina é empregada a respeito dos animais” — A restrição final retoma genimina; não abrange natus e filius, apresentados anteriormente como termos empregados para animais. *(meaning)*
- `pt-BR/g4-c005.md` [13]: “Não posso descobrir os passos do Redentor” → “Não posso desnudar os pés do Redentor” — Vestigia denudare refere-se aqui a descobrir os pés, no contexto de desatar a sandália, não a descobrir passos. *(meaning)*
- `pt-BR/g4-c006.md` [7]: “maior do que qualquer outro entre os nascidos de mulher” → “a quem nenhum dos nascidos de mulher foi superior” — Quo inter natos mulierum maior nemo fuerit afirma que ninguém foi maior que João; não afirma que João foi maior que todos os demais. *(meaning)*
- `pt-BR/g5-c002.md` [13]: “para dominar os outros, primeiro se serve” → “para dominar os outros, primeiro serve” — Prius servit significa que primeiro presta serviço ou se sujeita; se serve introduz um sentido reflexivo ausente. *(meaning)*
- `pt-BR/g5-c003.md` [13]: “Não te deixe, portanto, prender o herege” → “Não te deixes, portanto, prender pelo herege” — Corrige a construção com deixar-se e mantém o tratamento por tu empregado no parágrafo.
- `pt-BR/g5-c006.md` [10]: “era anunciado como aquele que seria crucificado” → “anunciava que seria crucificado” — Qui crucifigendum se a saeculo praeconabatur apresenta o próprio Senhor anunciando sua crucificação; a tradução mudou a construção para passiva. *(meaning)*
- `pt-BR/g5-c007.md` [24]: “pois o diabo entrara de onde Cristo saíra” → “pois o diabo entrara no lugar de onde Cristo saíra” — O lugar abandonado por Cristo é o destino da entrada do diabo, não sua procedência. *(meaning)*
- `pt-BR/g5-c007.md` [25]: “e imediatamente, lançando o homem no meio, sai dele.” → “e o demônio, imediatamente, lançando o homem no meio, sai dele.” — Quem lança o homem e sai dele é o demônio; sem explicitar a mudança, a frase conserva o Senhor como sujeito. *(meaning)*
- `pt-BR/g5-c007.md` [25]: “sai dele*.[^63]” → “sai dele*.” — Remove o marcador da nota redundante, conforme a regra fornecida.
- `pt-BR/g5-c007.md`: “[^63]: *Nota do tradutor:* A interpretação aproxima “no meio”, lugar onde o demônio lança o homem, da “via do meio”, o uso moderado da ira contra o mal.” → “” — A nota apenas repete a interpretação explicitamente desenvolvida no parágrafo; a regra determina sua remoção.
- Rejected: Alertas mecânicos desta parte — Aspas desequilibradas, diferenças de ênfase e parênteses e dois desvios de extensão. — As citações se fecham entre parágrafos; a formatação é consistente por arquivo; o conteúdo dos parênteses e das passagens mais longas foi preservado.
- Rejected: pt-BR/g25-c005.md [11] — “Consome nossa humildade” poderia resultar de confusão entre humilitatem e humiditatem. — O texto fornecido traz humilitatem. A suspeita contextual não demonstra uma falha inequívoca de OCR que autorize emendar a fonte.
- Rejected: pt-BR/g4-c006.md [8] — A filha de Aretas parece identificada com a esposa do irmão de Herodes. — A mesma identificação está no latim fornecido; corrigi-la alteraria o conteúdo da fonte.
- Rejected: pt-BR/g5-c006.md [10] — O antecedente de qui figurabatur poderia ser o lugar da paixão. — A retomada do Senhor também é gramaticalmente possível e compatível com a prefiguração pelo sangue das vítimas; não há erro inequívoco nessa escolha.

### Part 5 of 6, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Read all 36 files of part 5 against the Latin; one meaning defect fixed (g3-c002 [19], added qualifier “apenas”); the rest is faithful and complete.
- `pt-BR/g3-c002.md` [19]: “Não avalies apenas o que vês” → “Não avalies o que vês” — source: noli hoc aestimare quod cernis; Ambrose tells the reader not to judge by what is seen (the weakness and poverty). The added “apenas” reduces this to “not only by what you see”. *(meaning)*
- Rejected: mechanical audit (quotes, emphasis, parentheses, length) — Unbalanced quotes, emphasis differences, missing parentheses, length outliers — Already settled in rounds 1–2: verse quotations close across blocks, each file is consistent, and the parenthetical content is kept.
- Rejected: pt-BR/g4-c008.md [25], [30] — Matthew's “Matthan” rendered Natã — The source reads Nathan in both places; the translation follows the commentator's text.
- Rejected: pt-BR/g4-c008.md [43] — Cainan begets Sala at thirty-five, against the LXX's 130 — The source says triginta quinque; correcting it would correct the edition.
- Rejected: pt-BR/g3-c010.md [20] — “não terá vindo igualmente para a queda e a ressurreição de algumas pessoas” might misread non aeque aliis — The rendering keeps Origen's point that the same persons first fall and then rise; it is defensible.
- Rejected: pt-BR/g4-c003.md [7] — “termos latinos” for words Basil originally wrote in Greek — In the Latin source being translated the terms are Latin; the gloss is accurate to the text.

### Part 5 of 6, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos 18–19 de pt-BR/g3-c002.md contra o latim; a retirada de “apenas” está correta e não introduziu defeitos. O alerta de ênfase do parágrafo 3 já foi resolvido no histórico de revisão.

### Part 6 of 6, Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of the 35 files from g5-c009 to g9-c008: two fixes (the 'erunt' OCR slip rendered as a future tense in Lk 5:10, and 'exaltai' for 'exaltais'); audit flags reviewed and dismissed.
- `pt-BR/g6-c003.md` [4]: “que serão companheiros de Simão” → “que eram companheiros de Simão” — The source reads 'erunt', an OCR slip for 'erant' (Vulgate Lk 5:10; the same verse is quoted as 'qui erant socii Simonis' in §8 and rendered 'que eram' there). The future tense contradicts the narrative. *(meaning)*
- `pt-BR/g7-c001.md` [16]: “vós que até hoje exaltai Davi” → “vós que até hoje exaltais Davi” — 'extollitis' is present indicative; 'exaltai' is the imperative form.
- Rejected: audit: emphasis markers / unbalanced quotes — Bold verse numbers and quotations spanning several verse paragraphs — House format; each quotation opens in one verse paragraph and closes in a later one.
- Rejected: pt-BR/g6-c002.md [18], pt-BR/g6-c005.md [9] — Source parentheses rendered as dashes — Defensible punctuation choice; no content lost.
- Rejected: pt-BR/g7-c009.md [2] — 'Perdoa' (singular) beside plural verbs — Follows the source 'Dimitte'.
- Rejected: pt-BR/g7-c003.md [^65] — Translator's note on the name etymologies — It tells the reader the etymologies are traditional, not modern, which is useful information; it does not merely restate the text.
- Rejected: pt-BR/g6-c006.md [19] — 'publicanos e fariseus' where 'pecadores' is expected — Faithful to the source 'Pharisaeis'; the source is not corrected for content.

### Part 6 of 6, Round 2 (codex, full read)
Verdict: 4 meaning-level, 0 minor. Leitura integral dos 35 arquivos de g5-c009.md a g9-c008.md, das notas, do journal, dos campos pt-BR de book.json e dos alertas apresentados: quatro correções de sentido.
- `pt-BR/g7-c003.md` [14]: “Não foi somente então que lhe deu esse nome pela primeira vez” → “Não foi então que lhe deu esse nome pela primeira vez” — Em 'Non modo primum ... sed longe prius', modo significa 'agora': Beda nega que essa tenha sido a primeira ocasião. 'Somente' torna contraditória a indicação de que o nome fora dado muito antes. *(meaning)*
- `pt-BR/g8-c006.md` [42]: “antes de chegar a Betânia” → “antes da chegada de Jesus a Betânia” — A chegada mencionada pertence ao episódio de Jesus e Lázaro. A construção portuguesa atribui a chegada a João, sujeito de 'ao começar a falar'. *(meaning)*
- `pt-BR/g9-c002.md` [10]: “para que não creiam e sejam salvos” → “para impedir que, crendo, sejam salvos” — Em 'ne credentes salvi fiant', a negação abrange a salvação mediante a fé. A tradução coordena 'sejam salvos' afirmativamente com 'não creiam', deixando incorreto ou ambíguo o alcance da negação. *(meaning)*
- `pt-BR/g9-c002.md` [40]: “para que não creiam e sejam salvos” → “para impedir que, crendo, sejam salvos” — A citação repete 'ne credentes salvi fiant': o diabo procura impedir que sejam salvos mediante a fé. É necessário preservar o alcance da negação também nesta ocorrência. *(meaning)*
- Rejected: pt-BR/g7-c011.md [7] — A frase termina incompleta em 'poderá, contudo'. — O próprio trecho latino termina em 'poterit tamen'; não houve omissão na tradução.
- Rejected: pt-BR/g9-c006.md [53] — 'A grandeza que se compraz na antiga doçura' parece exigir 'a multidão'. — O texto canônico traz 'magnitudinem'. Substituí-lo por 'multitudinem' exigiria uma emenda conjectural, não demonstrada pelo material fornecido.

### Part 6 of 6, Round 3 (claude, full read)
Verdict: 3 meaning-level, 0 minor. Full read of 35 files (g5-c009 to g9-c008): 3 reported meaning fixes: two unnecessary substitutions of the valid gerund 'descendo' in g7-c004 [2] and [5], and clarification of an ambiguous 'ele' in g6-c005 [32]; translator's notes and book.json checked, nothing else wrong.
- `pt-BR/g7-c004.md` [2]: “E, descendo com eles, parou” → “E, descendendo com eles, parou” — Assessment corrected in round 4: 'descendo' is the valid gerund of 'descer'; 'descendendo' is the gerund of 'descender', which also admits the sense 'descer'. The original wording required no correction.
- `pt-BR/g7-c004.md` [5]: “E, descendo do monte com eles, parou” → “E, descendendo do monte com eles, parou” — Assessment corrected in round 4: in this quotation of 'descendens de monte', 'descendo' is the valid gerund of 'descer'. The substitution with 'descendendo' was unnecessary.
- `pt-BR/g6-c005.md` [32]: “pois antes se diz que ele orou” → “pois antes se diz que o Senhor orou” — 'orasse praemittitur ... non propter suffragium, sed propter exemplum' refers to the Lord's prayer just before (Lk 5:16), as in Ambrose's text; 'ele' right after 'esse paralítico' makes the paralytic the one who prayed *(meaning)*
- Rejected: pt-BR/g6-c004.md [17] — 'Maniqueu' for Manichaeus instead of 'Mani' — Attested Portuguese form for the founder; a defensible rendering
- Rejected: pt-BR/g9-c007.md [37] — 'Máximo' for 'maximus' as the destroyer of the statue — Follows the canonical source; the edition is not corrected
- Rejected: pt-BR/g7-c012.md [4] — Tense shift 'constrói ... cavou ... colocou' — Mirrors the source's 'aedificanti ... fodit ... posuit'; the sense is clear
- Rejected: audit: emphasis markers, unbalanced quotes, length outliers — Flags on bold verse numbers, multi-paragraph quotations and long paragraphs — House format; quotations open and close across verse paragraphs; the long paragraphs carry the full source content

### Part 6 of 6, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 3 minor. Lidos os nove parágrafos apresentados, a nota e os metadados: nenhuma correção necessária na tradução atual; três correções no journal sobre o gerúndio descendo.
- `pt-BR/translation-journal.md`: “3 meaning fixes, the 'descendo' misspelling in g7-c004 [2] and [5] and an ambiguous 'ele' in g6-c005 [32]” → “3 reported meaning fixes: two unnecessary substitutions of the valid gerund 'descendo' in g7-c004 [2] and [5], and clarification of an ambiguous 'ele' in g6-c005 [32]” — Descendo é o gerúndio correto de descer; as duas substituições não corrigiram erros de sentido.
- `pt-BR/translation-journal.md`: “source 'descendens' is a participle; 'descendo' is the first-person present ('I descend'), a misspelling that makes another word *(meaning)*” → “Assessment corrected in round 4: 'descendo' is the valid gerund of 'descer'; 'descendendo' is the gerund of 'descender', which also admits the sense 'descer'. The original wording required no correction.” — A justificativa confunde o gerúndio de descer com uma forma de descender e declara incorreta uma tradução válida.
- `pt-BR/translation-journal.md`: “same verse quoted: 'descendens de monte'; 'descendo' is the first-person present, not the gerund *(meaning)*” → “Assessment corrected in round 4: in this quotation of 'descendens de monte', 'descendo' is the valid gerund of 'descer'. The substitution with 'descendendo' was unnecessary.” — Descendo é precisamente o gerúndio de descer, adequado à descida do monte.
- Rejected: pt-BR/g7-c004.md [2], [5] — Reverter obrigatoriamente 'descendendo' para 'descendo'. — Descender também admite o sentido de descer; a forma atual é defensável. O erro objetivo está na justificativa registrada, que nega a validade de descendo.

### Part 6 of 6, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the three round-4 journal corrections on the gerund 'descendo': all accurate and consistent with the entries they replace; no chapter text changed; no defects.
- Rejected: pt-BR/translation-journal.md, Round 3 entries for g7-c004 [2] and [5] — The corrected rationale says 'descender' also admits the sense 'descer', which may be an unsupported claim — Dictionaries record 'descender' in the sense of 'descer', though as an archaic sense. The claim is not false, and the corrected entries now correctly say that 'descendo' was a valid gerund.
- Rejected: pt-BR/g7-c004.md [2], [5] — Revert 'descendendo' to 'descendo' — This is outside the delta: the paragraphs were not shown. The revert was also already rejected in round 4, and there is no new argument beyond preference for the more usual form.
