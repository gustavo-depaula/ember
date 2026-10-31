
## Termos

| Phoebe / Cenchris | Febe / Cencreia | Mulher recomendada pelo Apóstolo e porto de Corinto. |
| Prisca / Aquila / Epaenetus / Ephenetus | Prisca / Áquila / Epêneto | As duas grafias latinas do último nome recebem a mesma forma portuguesa. |
| Andronicus / Iunia | Andrônico / Júnia | Nomes dos parentes e companheiros de prisão de Paulo. |
| Ampliatus / Urbanus / Stachys / Apelles | Ampliato / Urbano / Estáquis / Apeles | Nomes das saudações de Romanos 16. |
| Aristobolus / Herodion / Narcissus | Aristóbulo / Herodião / Narciso | Nomes das saudações de Romanos 16. |
| Tryphaena / Tryphosa / Persis / Rufus | Trifena / Trifosa / Pérside / Rufo | Nomes das saudações de Romanos 16. |
| Asyncritus / Phlegon / Hermas / Patrobas / Hermes | Assíncrito / Flegonte / Hermas / Pátrobas / Hermes | Mantida a distinção entre Hermas e Hermes. |
| Philologus / Iulia / Nereus / Olympias | Filólogo / Júlia / Nereu / Olímpia | “Olímpia” acompanha também a identificação como irmã de Nereu no n. 1210. |
| Lucius / Iason / Sosipater / Tertius | Lúcio / Jasão / Sosípatro / Tércio | Nomes das saudações finais. |
| Caius / Erastus / Quartus | Gaio / Erasto / Quarto | Nomes das saudações finais. |
| osculum sanctum / osculum pacis | beijo santo / beijo da paz | Distinção entre a expressão do versículo e a designação litúrgica. |
| offendicula / scandala | tropeços / escândalos | Distinção lexical conservada no n. 1216. |
| arcarius civitatis | tesoureiro da cidade | Explicado pelo autor como guardião das receitas comuns. |
| tempora aeterna | tempos eternos | Conservada a expressão para as duas interpretações do n. 1225. |

## Decisões

- Preservados os 113 parágrafos-fonte de `rom-c17.md [1–113]`; a definição da nota do tradutor é um parágrafo adicional.
- Mantidas as referências recebidas do latim, inclusive Mateus 10:11, Atos 18:2, Hebreus 12:22 e seguinte, 2 João 5:10, Salmo 67:6 e Cântico dos Cânticos 1:1, sem harmonização com o inglês.
- Conservadas as diferenças entre os versículos e os lemas do comentário: ausência de Flegonte e ordem distinta de Hermas e Hermes no n. 1209; Olímpia apresentada como irmã de Nereu no n. 1210; “trabalharam” no n. 1207; “esmagará” no n. 1220; e “na revelação” no n. 1224.
- Mantidas as particularidades do latim nas citações, inclusive Filipenses 1:8, Efésios 3:8 e seguinte e Filipenses 2:11, sem incorporar complementos ou reformulações da referência inglesa.
- No n. 1227, a primeira interpretação de *soli Deo sapienti* foi vertida como “somente por Deus, que é sábio”, preservando a distinção em relação à interpretação seguinte, “o único sábio [...] por essência”.
- No n. 1228, conservada a consequência ontológica de *Pater esset per Filium*: “o Pai seria pelo Filho”, sem substituir “ser” por “ser sábio”.
- A nota [^48], após o parágrafo-fonte 36, esclarece a diferença entre as leituras latinas *digne sanctis* e *digne satis*.
- Regularizada a marcação tipográfica defeituosa de *Quartus* no parágrafo-fonte 100, mantendo “Quarto” em negrito e itálico como os demais lemas.

## Review log

### Part 1 of 4, Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of rom-c01 to c04: one typo, one ambiguous rendering (c02 [151]), one ungrammatical verse (c04 [12]) and one emphasis mismatch (c04 [155]); audit flags checked and dismissed.
- `pt-BR/rom-c02.md` [263]: “lhe adv viesse fruto” → “lhe adviesse fruto” — Typo: 'adv viesse' should be 'adviesse' (from 'advir', Latin accrescat).
- `pt-BR/rom-c02.md` [151]: “que é a ressurreição dos pecados” → “que consiste em ressurgir dos pecados” — Source says 'quae est a peccatis', a rising from sins. 'Ressurreição dos pecados' reads as the sins themselves rising again. *(meaning)*
- `pt-BR/rom-c04.md` [12]: “E por que não façamos o mal” → “E por que não fazermos o mal” — 'Por que não' with the present subjunctive is ungrammatical. The personal infinitive keeps the sense of 'et non … faciamus mala'.
- `pt-BR/rom-c04.md` [155]: “***Em seus caminhos** há **destruição e infelicidade***” → “***Em seus caminhos* há *destruição e infelicidade***” — Source is '***in viis eorum* est *contritio et infelicitas***': 'est' is bold only, and the two lemma parts are bold-italic. The PT nesting inverts this, leaving 'há' italic only.
- Rejected: pt-BR/rom-c03.md [28], pt-BR/rom-c04.md [12] — Parentheses dropped — '(inquam)' is rendered as ', digo,' and the verse parenthesis is recast as a 'como' clause. All content is kept, so this is a style choice.
- Rejected: emphasis flags (17 paragraphs) — Different counts of italic/bold markers — Each difference comes from merged lemmas, added translations of retained Latin (rom-c03 [182]) or italicized Latin terms such as *fornices*. No quotation or lemma is lost.
- Rejected: pt-BR/rom-c02.md [48], rom-c03 [219], rom-c04 [181] and similar — Scripture references that do not match the real verse (Isaías 68:5, 1 Samuel 17, Romanos 11:3, etc.) — They reproduce the Latin source's own references. House rules forbid correcting the author or the edition.
- Rejected: pt-BR/rom-c03.md [259] — Gênesis 17:14 rendered positively, while the Vulgate verse continues 'non fuerit' — The source quotation is truncated with 'etc.' and the translation follows it.

### Part 1 of 4, Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 1.115 blocos de rom-c01.md a rom-c04.md, das 13 notas, do journal, dos campos pt-BR de book.json e dos alertas mecânicos: quatro defeitos de sentido e um menor.
- `pt-BR/rom-c02.md` [34]: “me separou desde o ventre de minha mãe” → “me separou do ventre de minha mãe” — Aqui, ex utero é explicado como separação da sinagoga pela conversão. “Desde” transforma essa procedência em indicação temporal. *(meaning)*
- `pt-BR/rom-c02.md` [385]: “***de modo*** que aquilo que é de Deus lhes é conhecido, ***que são inescusáveis***” → “aquilo que é de Deus lhes é conhecido ***de tal modo que são inescusáveis***” — A posição de “de modo que” deixa a construção truncada; ita ... ut estabelece a relação consecutiva entre o conhecimento e a ausência de desculpa.
- `pt-BR/rom-c03.md` [142]: “seus pensamentos acusando-se ou também defendendo-se mutuamente” → “seus pensamentos ora os acusando, ora também os defendendo” — Os pensamentos acusam ou defendem os homens, conforme a explicação nos parágrafos 183–184; a construção reflexiva faz os pensamentos acusarem ou defenderem uns aos outros. *(meaning)*
- `pt-BR/rom-c03.md` [159]: “aquele que recebe a justiça pela primeira vez” → “aquele que passa a possuir a justiça” — Iustitiam de novo accipit indica a aquisição da justiça, sem restringi-la à primeira vez na vida. *(meaning)*
- `pt-BR/rom-c04.md` [86]: “É isso o que diz: ***Não façamos o mal***” → “É isso o que diz ao perguntar por que ***não fazemos o mal***” — Non faciamus retoma a pergunta de Romanos 3:8: por que não fazer o mal para obter o bem? Trata-se da segunda consequência absurda, não de uma proibição. *(meaning)*
- Rejected: pt-BR/rom-c03.md [67] — “Determinação de afastar-se de Deus” parece contrariar o argumento sobre os meios de remissão. — A tradução reproduz destinatio aversionis a Deo. Corrigi-la exigiria emendar a fonte sem certeza de erro de OCR.
- Rejected: pt-BR/rom-c04.md [54] — “A promessa divina imite o juízo humano” parece incompatível com a explicação seguinte. — A fonte diz expressamente imitetur humanum iudicium; a dificuldade não foi introduzida pela tradução.

### Part 1 of 4, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of rom-c01 to rom-c04, the footnotes, book.json and the audit flags: no new defects. The remaining doubtful points come from the source's own readings or are defensible style choices.
- Rejected: pt-BR/rom-c02.md [478] — Sabedoria 14:31 is rendered 'a transgressão dos justos', which looks incoherent; the Vulgate reads 'iniustorum'. — The source reads 'in iustorum' and the translation follows it. The reading may be an OCR slip, but not unmistakably enough to emend the source under the house rule.
- Rejected: pt-BR/rom-c01.md [5] — 'E, adiante, em 9:20' follows Isaías 45:9 and could be read as Isaiah 9:20, although the bold marks a Romans lemma. — The source 'Et infra IX, 20' is equally open. Elsewhere the translation renders 'infra' as 'adiante, em' for Romans, so the rendering is consistent.
- Rejected: pt-BR/rom-c02.md [347] — 'Pois todas as coisas não remetem ao primeiro princípio como à sua causa própria' could be read as a universal negation. — The following 'mas como a uma causa comum' makes the contrast clear. The sense is kept, so the wording is a style choice.
- Rejected: pt-BR/rom-c02.md [270], [255], [199] — The lemma for 'ita quod in me' varies ('assim, quanto depende de mim' / 'de modo que, quanto está em mim'). — Each paragraph renders the source correctly in its own sentence. The source itself varies the gloss ('id est quantum ad me pertinet').

### Part 2 of 4, Round 1 (claude, full read)
Verdict: 10 meaning-level, 0 minor. Read rom-c05 to rom-c08 in full: fixed six Vulgate Samuel/Kings names to the modern names rom-c05 uses, two absit glosses in c07 that read as affirmatives, and an interpolated "ocasião" in the 7:10 quotation (twice).
- `pt-BR/rom-c06.md` [142]: “2 Reis 14:14: *Todos morremos*” → “2 Samuel 14:14: *Todos morremos*” — II Reg. XIV, 14 is 2 Samuel 14:14 in the modern naming used in rom-c05 (I Reg. → 1 Samuel, IV Reg. → 2 Reis); "2 Reis 14:14" sends the reader to the wrong book *(meaning)*
- `pt-BR/rom-c06.md` [271]: “segundo aquilo de 1 Reis 16:7:” → “segundo aquilo de 1 Samuel 16:7:” — I Reg. XVI, 7 is 1 Samuel 16:7, and rom-c05 [30] renders the same citation as 1 Samuel 16:7 *(meaning)*
- `pt-BR/rom-c08.md` [39]: “como se lê em 3 Reis 17:17 ss.” → “como se lê em 1 Reis 17:17 ss.” — III Reg. XVII is 1 Reis 17 in modern naming, as rom-c05 [191] renders III Reg. *(meaning)*
- `pt-BR/rom-c08.md` [39]: “como se lê em 4 Reis 4:18 ss.” → “como se lê em 2 Reis 4:18 ss.” — IV Reg. IV is 2 Reis 4 in modern naming, as rom-c05 [140] renders IV Reg. *(meaning)*
- `pt-BR/rom-c08.md` [92]: “segundo 1 Reis 16:17:” → “segundo 1 Samuel 16:17:” — I Reg. XVI is 1 Samuel 16; the chapter and verse are kept from the source *(meaning)*
- `pt-BR/rom-c08.md` [233]: “segundo 1 Reis 30:25:” → “segundo 1 Samuel 30:25:” — I Reg. XXX, 25 is 1 Samuel 30:25; 1 Reis has no chapter 30 *(meaning)*
- `pt-BR/rom-c07.md` [27]: “***De modo algum***, a saber, se deve permanecer no pecado” → “***De modo algum***, a saber, que se deva permanecer no pecado” — source: absit, scilicet quod … permanendum sit; the PT reads as the statement "one must remain in sin" *(meaning)*
- `pt-BR/rom-c07.md` [128]: “***De modo algum***, a saber, devemos pecar porque fomos libertados da lei;” → “***De modo algum***, a saber, que pequemos por termos sido libertados da lei;” — source: absit, scilicet ut peccemus, quia sumus a lege liberati; the PT states the opposite ("we must sin") *(meaning)*
- `pt-BR/rom-c08.md` [62]: “que era para a vida, era para mim ocasião de morte” → “que era para a vida, era para a morte” — source 7:10: hoc esse ad mortem; "ocasião" is Thomas's later gloss (occasionaliter, n. 549), not part of the verse *(meaning)*
- `pt-BR/rom-c08.md` [124]: “era para mim ocasião de morte***” → “era para a morte***” — source quotes the verse: hoc esse ad mortem; the added "ocasião de" puts the commentary's answer into the objection *(meaning)*
- Rejected: pt-BR/rom-c06.md [22] — "Timóteo 2:5" has no book number — the source has "Tim. II, 5" without a numeral; adding one would correct the edition
- Rejected: pt-BR/rom-c06.md [44] — "Eclesiastes 2:11" quotes Sirach — the source has "Eccle.", which this file elsewhere uses for Ecclesiastes; the misattribution belongs to the edition
- Rejected: pt-BR/rom-c06.md [255]–[293] — "Lei" switches to lowercase "lei" from Lectio 6 on — capitalization is a style matter and does not change the sense; left as is
- Rejected: pt-BR/rom-c08.md [118] — "ocasião de morte" in the gloss — the source there says "occasionaliter", so the wording is correct

### Part 2 of 4, Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Lidos integralmente os 956 parágrafos, as 11 notas, os metadados e o diário: encontrados três defeitos de sentido; nenhum defeito adicional nos alertas mecânicos.
- `pt-BR/rom-c05.md` [49]: “segundo o que Deus propõe ao salvar os homens por sua graça.” → “segundo o propósito de Deus de salvar os homens por sua graça.” — Em 'Deus proponit ex gratia sua homines salvare', salvar os homens é o objeto do propósito divino, não a circunstância em que Deus propõe outra coisa. *(meaning)*
- `pt-BR/rom-c07.md` [170]: “*Envergonhai-vos dos jardins*” → “*Vós vos envergonhais dos jardins*” — 'Erubescitis' está no presente do indicativo: afirma que se envergonham, não ordena que se envergonhem. *(meaning)*
- `pt-BR/rom-c08.md` [253]: “de modo que eu não seja levado por ela ao pecado” → “de modo que eu não seja levado pela corrupção do corpo ao pecado” — 'Ab ea' retoma a corrupção corporal explicada nos parágrafos anteriores. Em português, 'por ela' remete à graça de Deus, invertendo o papel da graça na libertação. *(meaning)*
- Rejected: Alertas mecânicos de rom-c05.md a rom-c08.md — Diferenças de ênfase e de parênteses. — Decorrem do reagrupamento dos lemas, do itálico aplicado ao latim retido e da regularização da marcação corrompida em rom-c06.md [293]. Em rom-c08.md [5], os travessões preservam integralmente o inciso.
- Rejected: pt-BR/rom-c08.md [196] — A frase final parece inverter a relação causal entre pecado e concupiscência. — O latim recebido, 'quod operatur concupiscentia carnis', admite a concupiscência como sujeito de 'operatur'. Não há erro inequívoco de tradução sem emendar a fonte.

### Part 2 of 4, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Read rom-c05 to rom-c08 in full, with their footnotes and the audit flags: one minor defect, a sentence without a main clause in rom-c06 [235]; the earlier rounds' fixes hold.
- `pt-BR/rom-c06.md` [235]: “Embora se possa dizer que a justificação de Cristo se estende” → “Pode-se também dizer que a justificação de Cristo se estende” — source: Quamvis possit dici … licet quantum ad efficientiam; the PT sentence holds two concessive clauses (embora … ainda que …) and no main clause, so it is grammatically incomplete. Making the first clause the main one keeps the sense of an alternative answer.
- Rejected: pt-BR/rom-c06.md [206] — Cain's words, “maior do que aquilo para o qual eu possa merecer perdão”, read awkwardly — grammatical and faithful to quam ut veniam merear; a style matter
- Rejected: pt-BR/rom-c05.md [97] — “a saber, sua fé” might point to Abraham rather than to the believers — “a eles” just before it resolves the possessive; the sense is not lost
- Rejected: pt-BR/rom-c05.md [58] — the lemma accepto (“considerando-a a seu favor”) lost its bold-italic — the gloss is fully translated and the emphasis count matches; a reader is not misled
- Rejected: pt-BR/rom-c07.md [115], rom-c08.md [56], [102], [227], rom-c06.md [282] — references point to the wrong place (Tiago 6:8, Ezequiel 36:27, Romanos 14:18, Miqueias 8:5, Êxodo 20:34 quoting Ezekiel) — each one reproduces the Latin edition's citation; correcting it would correct the edition
- Rejected: mechanical audit, rom-c05 to rom-c08 — emphasis and parenthesis counts differ — the differences come from regrouped lemmas, italics added for retained Latin (*stipe pendenda*, *ex condigno*) and dashes used for the parenthesis in rom-c08 [5]; nothing is missing

### Part 2 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificados a alteração, os parágrafos 234–236 e as três notas apresentadas; nenhum novo defeito. Os alertas mecânicos não trazem trechos novos e já foram examinados nas rodadas anteriores.
- Rejected: pt-BR/rom-c06.md [235] — “Pode-se também dizer” não reproduz literalmente a concessiva “Quamvis possit dici”. — A formulação preserva a apresentação de uma resposta alternativa ao parágrafo anterior e resolve a frase sem oração principal, mantendo integralmente a distinção entre suficiência e eficiência.

### Part 3 of 4, Round 1 (claude, full read)
Verdict: 6 meaning-level, 3 minor. Full read of rom-c09 to rom-c12. Fixed six meaning errors (a dative misread, an OCR slip *confessionem*→*consessionem*, a mis-attached citation, a reversed double negative, and a split sentence in c12 [107] needing two fixes) and two minor ones (verse/lemma mismatch, a missing pronoun).
- `pt-BR/rom-c09.md` [177]: “Ora, convém dizê-lo não só aos judeus, mas também aos gentios.” → “Ora, não só aos judeus, mas também aos gentios convém dizer isso.” — The Latin *convenit dicere non solum Iudaeis, sed etiam gentibus* means it befits Jews and Gentiles to say this. The PT read as saying it *to* them. *(meaning)*
- `pt-BR/rom-c09.md` [257]: “mas o próprio Espírito intercede por nós com gemidos inenarráveis” → “mas o próprio Espírito pede por nós com gemidos inexprimíveis” — The lemmas in n. 692–693 and 304–305 quote this verse as “pede” and “inexprimíveis”. The argument turns on *postulare* meaning to ask, so the verse should match.
- `pt-BR/rom-c09.md` [258]: “porque intercede pelos santos segundo Deus” → “porque pede pelos santos segundo Deus” — This makes the verse match the lemma in n. 694 (***pede pelos santos***), which renders *postulat*.
- `pt-BR/rom-c09.md` [375]: “isto é, expôs à paixão para a expiação” → “isto é, expô-lo à paixão para a expiação” — The source has *exposuit eum passioni*. The PT dropped the object pronoun.
- `pt-BR/rom-c09.md` [401]: “Em terceiro lugar, o próprio reconhecimento do Pai” → “Em terceiro lugar, seu próprio assento junto do Pai” — *confessionem* is an OCR slip for *consessionem* (sitting with), as the lemma ***qui est a dextris Dei*** and the following *consedere* show. The PT rendered the slip. *(meaning)*
- `pt-BR/rom-c10.md` [168]: “E isso decorre sobretudo da autoridade citada em Deuteronômio 9:4:” → “E isso decorre sobretudo da autoridade citada. Deuteronômio 9:4:” — *ex auctoritate inducta* is the Exodus text already quoted, and Deut 9:4 is a separate confirming citation. The PT made Deuteronomy the source of the authority. *(meaning)*
- `pt-BR/rom-c11.md` [54]: “a saber, negar que ele não tenha morrido” → “a saber, negar que ele tenha morrido” — The point is that doubting the descent amounts to denying Christ died. In Portuguese the double negative says the opposite (that he did die). *(meaning)*
- `pt-BR/rom-c12.md` [107]: “Com efeito, os gentios são os fiéis que se tornarão mornos. Mateus 24:12:” → “Com efeito, os gentios, isto é, os fiéis que se tornarão mornos — Mateus 24:12:” — In the Latin, *Gentiles … qui tepescent … vel etiam qui totaliter cadent …, Iudaeis conversis in pristinum fervorem restituentur* is one sentence. Restoration applies to both groups, and the PT split away the main verb. *(meaning)*
- `pt-BR/rom-c12.md` [107]: “*Porque abundou a iniquidade, a caridade de muitos esfriará*. Ou mesmo os que cairão” → “*Porque abundou a iniquidade, a caridade de muitos esfriará* —, ou mesmo os que cairão” — This completes the previous fix so that “serão restituídos” governs both the lukewarm and the fallen. *(meaning)*
- Rejected: pt-BR/rom-c09.md [108] — The last sentence says the opposite of the argument (the Apostle does not treat of flesh that is a vice). — It follows the corrupt Latin as given, and translator's note [^25] signals the apparent lacuna. The note is accurate.
- Rejected: pt-BR/rom-c10.md [118] — The three things are listed as only “a eleição … a predestinação e a eleição”. — This mirrors a corruption in the Latin (*dilectionem* is missing). Restoring it is not an unmistakable single-word OCR fix.
- Rejected: pt-BR/rom-c11.md [49] — “sentido interior da Lei” seems to contradict the contrast with the spiritual sense (expected *exteriorem*). — This is likely an edition issue, not an unmistakable OCR slip, and the PT follows the source.
- Rejected: various (e.g. c09 [18], [128], [130]; c12 [99], [193]) — Scripture references differ from modern numbering. — These references are kept as given in the Latin by design.

### Part 3 of 4, Round 2 (codex, full read)
Verdict: 3 meaning-level, 8 minor. Leitura integral dos 1.210 parágrafos, das 14 notas, do journal e de book.json: 3 correções de sentido e 8 ajustes menores, incluindo a remoção de três notas redundantes.
- `pt-BR/rom-c09.md` [352]: “isto é, derramando todo o esplendor dos santos.” → “isto é, a ti que derramas todo o esplendor dos santos.” — O acusativo profundentem refere-se a te, o Filho gerado; o gerúndio português atribui o derramamento ao Pai que gera. *(meaning)*
- `pt-BR/rom-c09.md` [418]: “ferido exteriormente.[^28]” → “ferido exteriormente.” — Retira o marcador da nota redundante, cuja explicação já consta integralmente no parágrafo.
- `pt-BR/rom-c09.md`: “[^28]: *Nota do tradutor:* O autor associa aqui *tribulatio* (“tribulação”) a *tribuli* (“abrolhos”, plantas espinhosas), aproximando verbalmente a aflição da imagem de ser ferido por espinhos.” → “” — A nota apenas repete a associação etimológica e a imagem já explicadas pelo autor; deve ser removida conforme a regra para notas redundantes.
- `pt-BR/rom-c11.md` [94]: “mas não a todo momento.[^34]” → “mas não a todo momento.” — Retira o marcador da nota que apenas reformula a explicação já dada no parágrafo.
- `pt-BR/rom-c11.md`: “[^34]: *Nota do tradutor:* A fórmula escolástica *semper, sed non ad semper* distingue a validade permanente do preceito da exigência de praticar o ato em todos os momentos: a obrigação de agir se concretiza nas circunstâncias apropriadas.” → “” — A distinção entre obrigação permanente e realização segundo as circunstâncias já está explicitada no texto; a nota apenas a reitera.
- `pt-BR/rom-c12.md` [75]: “no Enchiridion, que” → “no *Enchiridion*, que” — O título latino conservado deve estar em itálico.
- `pt-BR/rom-c12.md` [85]: “explicado de quatro maneiras.[^35]” → “explicado de quatro maneiras.” — Retira o marcador da nota redundante sobre os sentidos de emulação, já apresentados e desenvolvidos pelo autor.
- `pt-BR/rom-c12.md`: “[^35]: *Nota do tradutor:* “Emulação” conserva aqui a amplitude do latim *aemulatio*, que pode designar tanto o empenho em imitar alguém quanto o ciúme ou a rivalidade. Essa ambivalência permite as quatro interpretações seguintes.” → “” — A nota apenas repete a distinção lexical e sua relação com as quatro interpretações, expressamente explicadas no texto.
- `pt-BR/rom-c12.md` [151]: “Não pouparei nem terei misericórdia, deixando de dispersá-los” → “Não pouparei nem, por misericórdia, deixarei de dispersá-los” — A negativa abrange a misericórdia que impediria a dispersão. O gerúndio da tradução apresenta deixar de dispersá-los como consequência, invertendo o sentido. *(meaning)*
- `pt-BR/rom-c12.md` [225]: “***Para vossa misericórdia***, isto é, na graça de Cristo” → “***Na misericórdia concedida a vós***, isto é, na graça de Cristo” — Nesta primeira interpretação, in vestram misericordiam é o objeto de não crer, explicado por in gratiam Christi. A preposição para o transforma indevidamente em finalidade. *(meaning)*
- `pt-BR/rom-c12.md` [263]: “a partir do artesão, do ferro e do que não tem forma.” → “*a partir do* artesão, do ferro e *do* que não tem forma.” — Restabelece o destaque metalinguístico das duas ocorrências de ex no exemplo que explica essa preposição.
- Rejected: Alertas mecânicos de ênfase, exceto pt-BR/rom-c12.md [263]; pt-BR/rom-c10.md [281] — Diferenças nas contagens de ênfase e de parênteses. — As demais diferenças decorrem da reunião ou divisão de lemas, da regularização de marcação defeituosa e do destaque de palavras latinas. Em [281], os travessões preservam integralmente o inciso.
- Rejected: pt-BR/rom-c10.md [123] — A reprovação é apresentada como preparação dos pecados. — A tradução reproduz o latim fornecido, que não contém non antes de importat. A contradição contextual não autoriza acrescentar uma negação à fonte.
- Rejected: pt-BR/rom-c12.md [56] — A expressão “um pacto de queda” parece inadequada. — Ela traduz in pactionem casus. O paralelo com impactionem em rom-c10 [302] sugere corrupção textual, mas não basta para estabelecer uma correção inequívoca de OCR.

### Part 3 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of rom-c09 to rom-c12. Fixed one wrong subject in the verse Rom 9:28 (meaning), a verse/lemma mismatch at Rom 9:27, and a quotation tense in c09 [46] (minor).
- `pt-BR/rom-c10.md` [247]: “*Pois ele leva a palavra a seu cumprimento e a abrevia com equidade, porque” → “*Pois uma palavra que leva à consumação e abrevia com equidade, porque” — Latin *Verbum enim consummans, et abbrevians in aequitate*: *verbum* is the subject, not the object of an implied 'he'. The commentary (n. 803, 'a palavra do Evangelho será uma palavra que abrevia e leva à consumação') and the lemma in [277] depend on this reading. *(meaning)*
- `pt-BR/rom-c10.md` [246]: “os remanescentes serão salvos” → “um resto será salvo” — Brings the verse in line with the lemma in [276] (***Um resto será salvo***) and with the rendering of *reliquiae* in rom-c12.
- `pt-BR/rom-c09.md` [46]: “sereis verdadeiramente livres” → “sois verdadeiramente livres” — The source quotes John 8:36 as *vere liberi estis* (present). The PT followed the familiar future-tense wording instead.
- Rejected: pt-BR/rom-c10.md [280] — 'nada deles que seja equitativo ... permanece por observar' seems to reverse the expected sense (moral precepts remain). — It renders the Latin as given (*nihil ipsorum remanet observandum quod est aequum*). Supplying *nisi* would correct the edition, not an OCR slip.
- Rejected: pt-BR/rom-c09.md [7] — 'Deus, enviando ... e, pelo pecado, condenou' joins a gerund to a finite verb. — It mirrors the anacoluthon of the Latin verse (*mittens ... et de peccato, damnavit*). Defensible as given.
- Rejected: pt-BR/rom-c12.md [175] — The verse keeps 'para vossa misericórdia' after round 2 changed the lemma in [225]. — In the verse the phrase stays open to all three readings the commentary gives. Only the lemma had to commit to the first.

### Part 3 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Verificadas as três alterações, os sete parágrafos apresentados, as notas e os metadados: um ajuste menor no tempo verbal de uma citação.
- `pt-BR/rom-c09.md` [46]: “eles lhes serão perdoados” → “eles lhes são perdoados” — A citação traz remittuntur, presente passivo; conservar o tempo da fonte, como na correção de estis neste mesmo parágrafo.
- Rejected: pt-BR/rom-c10.md [247] — A expressão “Pois uma palavra que...” não apresenta oração principal completa. — A construção fragmentária acompanha o latim fornecido, também sem verbo finito nessa oração; não exige completar a fonte.
- Rejected: pt-BR/rom-c09.md [46] — A contagem dos marcadores de ênfase difere. — O latim divide defeituosamente a marcação em “s*piritus”; a tradução mantém a citação inteira em itálico.

### Part 3 of 4, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of rom-c09 [45]–[47] and the listed footnotes: the tense fix in [46] (*remittuntur* → “são perdoados”) is correct and the shown text is clean.
- Rejected: pt-BR/rom-c09.md [46] — “eles lhes são perdoados” after “perdoardes” mixes present and future subjunctive. — It follows the source's *remiseritis … remittuntur* (future perfect, then present) and is grammatical in Portuguese.
- Rejected: pt-BR/rom-c09.md [46] — “lei do estímulo” for *lex fomitis*. — This is a defensible rendering of *fomes*, and Thomas glosses it at once as the law that inclines to sin. It is not a defect.
- Rejected: pt-BR/rom-c09.md [45] — “Atos 5:2” for a verse that is really Acts 5:32. — The source gives *Act. V, 2*, and references are kept as given in the Latin by design.

### Part 4 of 4, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of rom-c13 to rom-c17: fixed two meaning errors ('investigáveis' reversing Rom 11:33's 'unsearchable'; a misattached relative clause in n. 1216) and one ambiguous 'não se come' in n. 1074.
- `pt-BR/rom-c13.md` [26]: “e seus caminhos investigáveis” → “e seus caminhos insondáveis” — In Rom 11:33, the verse being recalled, the Vulgate *investigabiles* means 'that cannot be searched out'. 'Investigáveis' says the opposite. *(meaning)*
- `pt-BR/rom-c17.md` [87]: “e outros desprezavam os que provocam dissensões e tropeços.” → “e outros desprezavam outros; são esses os que provocam dissensões e tropeços.” — Source: 'alii alios spernerent, qui dissensiones et offendicula faciunt'. The relative clause points back to the lemma; it is not the object of *spernerent*. The translation made the despised people the troublemakers. *(meaning)*
- `pt-BR/rom-c14.md` [185]: “não se come com magnificência” → “não quando come com magnificência” — Source: 'non quidem si comedat magnifice … sed quando'. 'Não se come' reads as an impersonal 'one does not eat' instead of the intended 'not when he eats'.
- Rejected: mechanical audit, emphasis counts (c13–c17) — Fewer or more emphasis markers than the source — These are lemmas with an inserted 'sitis'/'debetis' merged into one bold span, plus the Quartus markup the journal regularized. Nothing is lost.
- Rejected: pt-BR/rom-c14.md [133] — Length outlier (162%) — The paragraph is complete and faithful clause by clause; nothing was added.
- Rejected: pt-BR/rom-c16.md [173] — Gelasius's parenthesis rendered with commas — Punctuation choice. The clause is fully kept.
- Rejected: pt-BR/rom-c15.md [48] — 'caritatem' rendered as 'autoridade' — The context (n. 1090, 'ex auctoritate iudicantis') requires authority, so the rendering is correct.
- Rejected: c13–c17, various — Wrong chapter or verse numbers (e.g. Tito 2:5, 1 Pedro 2:23, Mateus 1:11, Gênesis 3:27) — The Latin source has these numbers, and house policy keeps the edition's references.

### Part 4 of 4, Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Leitura integral dos 917 parágrafos, das 10 notas, do book.json, do diário e dos alertas mecânicos: três defeitos de sentido.
- `pt-BR/rom-c15.md` [37]: “a primeira proibição de se abster de certos produtos da terra” → “a primeira proibição de comer certos produtos da terra” — A proibição exigia abster-se desses produtos; o português diz que era proibido abster-se, invertendo o sentido. *(meaning)*
- `pt-BR/rom-c16.md` [55]: “*Todas as promessas de Deus nele estão*” → “*Todas as promessas de Deus têm nele seu sim*” — Na citação, ‘est’ designa a afirmação ‘sim’: as promessas são confirmadas em Cristo. Não significa que as promessas ‘estão’ nele. *(meaning)*
- `pt-BR/rom-c16.md` [182]: “nas orações dirigidas a ele por mim” → “nas orações dirigidas a ele em meu favor” — ‘Pro me fusis’ significa feitas em favor de Paulo. Após ‘dirigidas’, ‘por mim’ atribui a Paulo a autoria das orações. *(meaning)*
- Rejected: pt-BR/rom-c15.md [133] — Substituir ‘por si mesmo’ por uma referência explícita à ação de Cristo. — ‘Per seipsum’ admite a leitura referente à pureza intrínseca dos alimentos, desenvolvida na sequência. A ação de Cristo é explicitamente preservada no final: ‘por ele, isto é, por ele ter realizado isso’.
- Rejected: pt-BR/rom-c16.md [93] — A afirmação de que havia alguém capaz de instruir contradiz o desenvolvimento seguinte. — O português reproduz o latim fornecido, ‘illum esse’. Alterar para ‘não havia ninguém’ exigiria emendar a fonte para ‘nullum’, sem comprovação inequívoca de erro de OCR.

### Part 4 of 4, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of rom-c13 to rom-c17 with journal and book.json: one meaning fix (dangling 'ao dizer' making the rulers the speaker in n. 1041) and one minor fix to translator's note [^43].
- `pt-BR/rom-c14.md` [84]: “que, ao dizer que os tributos são devidos aos reis como remuneração de seu trabalho, os governantes podem pecar” → “que, como o Apóstolo diz que os tributos são devidos aos reis como remuneração de seu trabalho, os governantes podem pecar” — Source: 'cum tributa dicat regibus esse debita'. The subject of 'dicat' is the Apostle. The gerund 'ao dizer' attaches to 'os governantes', so the rulers become the ones who say it. *(meaning)*
- `pt-BR/rom-c14.md`: “são as capacidades de percepção sensível, cujo exercício fica suspenso durante o sono” → “são as capacidades de sensação e de movimento voluntário, cujo exercício fica suspenso durante o sono” — Translator's note [^43]. In the medieval medical and philosophical usage that Aquinas follows, *virtus animalis* covers both the sensitive and the motive powers. The note limited it to sense perception.
- Rejected: pt-BR/rom-c13.md [29], pt-BR/rom-c16.md [159] and [179] — 'Filêmon' in rom-c13, 'Filemom' in rom-c16 — Both are accepted pt-BR forms. Each file is internally consistent, and the Key Terms table does not fix either form.
- Rejected: pt-BR/rom-c15.md [193] — 'por aquilo que não faz' seems illogical — It renders the source's 'de eo quod homo non facit' literally. The source is not emended for a possible editorial reading.
- Rejected: mechanical audit, emphasis and length flags (c13–c17) — Emphasis counts differ; rom-c14 [133] is a length outlier — Rechecked. The emphasis differences come from bold lemma spans merged around an inserted 'sitis' or 'debetis'. Rom-c14 [133] is complete and faithful clause by clause. Both were already rejected in round 1.

### Part 4 of 4, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as duas alterações, os parágrafos 83–85 de rom-c14.md e as notas 42–43: correções adequadas, sem novos defeitos. Os alertas mecânicos já foram rejeitados nas rodadas anteriores.
