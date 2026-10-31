
## Termos

| free will / freedom of will | livre-arbítrio / liberdade da vontade | Em XXII, 30, conserva-se a distinção entre poder não pecar e não poder pecar. |
| perpetual Sabbath / Sabbath rest | sábado perpétuo / repouso sabático | Imagem do repouso eterno em XXII, 30. |
| the Lord's day | o dia do Senhor | Em XXII, 30, ligado à ressurreição de Cristo e ao oitavo dia. |

## Decisões

- Em XXII, 29, preservou-se a distinção entre ver Deus “na carne” e “pela carne”, sobre a qual se apoia o argumento.
- Em XXII, 30, “indefeasible” e “indefeasibly” foram traduzidos por expressões de impossibilidade de perda, preservando o caráter irrevogável da justiça, da felicidade e das alegrias eternas.

## Review log

### Part 1 of 12, Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of ch001–ch002 (City of God, Books 1–2): one meaning fix (ch002 [38] relative clause made the people the object) and three minor fixes (comma, verb form, reference parentheses); audit flags checked and rejected.
- `pt-BR/ch002.md` [38]: “do povo, que ele próprio havia elevado tanto Colatino quanto Bruto ao consulado” → “do povo, que, ele próprio, havia elevado tanto Colatino quanto Bruto ao consulado” — source: the people 'had themselves raised to the consular office both Collatinus and Brutus'; 'que ele próprio havia elevado' reads as 'whom he himself had raised', making the people the object *(meaning)*
- `pt-BR/ch001.md` [70]: “em obediência à ordem divina ou, em conformidade com suas leis, representaram” → “em obediência à ordem divina ou em conformidade com suas leis, representaram” — source: 'waged war in obedience to the divine command, or in conformity with His laws'; the misplaced comma attaches 'em conformidade com suas leis' to 'representaram' and splits the subject
- `pt-BR/ch001.md` [96]: “Perdesteis o proveito” → “Perdestes o proveito” — the 2nd person plural preterite of 'perder' is 'perdestes'
- `pt-BR/ch001.md` [50]: “Os três jovens (Daniel 3) eram cativos” → “Os três jovens Daniel 3 eram cativos” — source has the reference inline without parentheses, like every other Scripture reference in the file
- Rejected: pt-BR/ch002.md [70] — audit: repeated word 'que que' — 'temer mais que fosse divulgada do que que deixasse de ser praticada' is a correct 'do que' + 'que' sequence
- Rejected: pt-BR/ch002.md [59] — 'cujos juízos ninguém pode compreender plenamente' against source 'whose judgments are fully comprehensible, justly reprehensible by none' — the elliptical parallel lets 'by none' govern both adjectives; the PT follows that reading, which agrees with the Latin (iudicia occulta)
- Rejected: pt-BR/ch001.md [17], [24], [34], [60], [72], [75], [94]; ch002.md [24], [33], [40], [48], [49], [70] — audit: parentheses differ — each source parenthetical is kept as commas or dashes with the same content; nothing is dropped
- Rejected: pt-BR/ch002.md [14], [33] — audit: emphasis markers differ — the added italics mark retained Latin (Fugalia, Flamen Dialis, Martialis, Quirinalis) and 'elite', as the house rules require
- Rejected: pt-BR/ch001.md [75] [^3] — note identifies the Cato of ch. 30 as Cato the Elder — correct: Cato the Elder urged the destruction of Carthage; Cato of Utica is the suicide

### Part 1 of 12, Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos 180 blocos de ch001–ch002, das nove notas, do book.json e do diário: dois defeitos gramaticais menores; nenhum defeito de sentido identificado.
- `pt-BR/ch001.md` [70]: “mataram homens maus, de modo algum violaram” → “mataram homens maus de modo algum violaram” — A vírgula separa o sujeito longo, iniciado por “aqueles que”, do predicado “de modo algum violaram”.
- `pt-BR/ch001.md` [81]: “daquele cujos mandamentos não podemos desobedecer” → “daquele a cujos mandamentos não podemos desobedecer” — Na regência padrão, desobedecer exige a preposição “a”, que deve preceder o relativo.
- Rejected: ch001.md e ch002.md — alertas mecânicos — Diferenças de parênteses e de ênfase; sequência “que que” em ch002.md [70]. — Os incisos mantêm seu conteúdo com outra pontuação; os itálicos adicionais são justificáveis; “do que que deixasse” combina corretamente a locução comparativa com a conjunção da oração seguinte.

### Part 1 of 12, Round 3 (claude, delta read)
Verdict: 1 meaning-level, 1 minor. Delta read of ch001 [69]–[71] and [80]–[82]: the [81] fix is correct; the [70] fix left two predicates with no connector, now fixed with the source's semicolon and subject, plus removal of the comma between subject and verb.
- `pt-BR/ch001.md` [70]: “mataram homens maus de modo algum violaram” → “mataram homens maus; tais pessoas de modo algum violaram” — source: 'have put to death wicked men; such persons have by no means violated the commandment'. With the comma removed, two finite predicates (mataram / violaram) sit side by side with no connector. Restoring the source's semicolon and its subject 'such persons' makes the sentence grammatical again. *(meaning)*
- `pt-BR/ch001.md` [70]: “em conformidade com suas leis, representaram” → “em conformidade com suas leis representaram” — the comma separates the subject 'aqueles que travaram guerras…' from its verb 'representaram'
- Rejected: pt-BR/ch001.md [81] — round-2 change 'daquele a cujos mandamentos não podemos desobedecer' — correct: 'desobedecer' takes 'a', which goes before the relative; it matches the source 'whose commands we may not neglect'

### Part 1 of 12, Round 4 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 180 blocos, das nove notas, do book.json e do diário: um ajuste menor de regência; nenhum defeito de sentido identificado.
- `pt-BR/ch001.md` [39]: “seu grande bem, cuja obediência enriquecia sua alma” → “seu grande bem, e sua alma se enriquecia pela obediência a essa vontade” — O source diz “by obedience to which”: Jó obedece à vontade do Senhor. A construção possessiva “cuja obediência” não exprime corretamente essa regência.
- Rejected: ch001.md e ch002.md — alertas mecânicos — Diferenças de parênteses e itálicos; repetição “que que”. — Os incisos conservam seu conteúdo; os itálicos adicionais assinalam termos retidos; “do que que deixasse” combina corretamente a comparação com a oração subordinada.
- Rejected: pt-BR/ch002.md [74], [76] — Alternância entre tratamento singular e plural. — O próprio source alterna a personificação singular da estirpe romana com o plural explícito “yourselves”, acompanhado pela tradução.

### Part 1 of 12, Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [38]–[40]: the round-4 fix in [39] is correct and the shown paragraphs are clean.
- Rejected: pt-BR/ch001.md [39] — Round-4 change “e sua alma se enriquecia pela obediência a essa vontade” followed by “; e não se entristeceu” — It renders “by obedience to which his soul was enriched” correctly: the obedience is to the will. The sentence and the following clause stay grammatical.
- Rejected: pt-BR/ch001.md [39] — “For it was well” rendered “Foi bom, portanto” — The connective is a defensible choice and the sense is unchanged.
- Rejected: pt-BR/ch001.md [40] — “mammon of iniquity” rendered “riquezas da iniquidade” — This is an accepted rendering of the biblical phrase and the meaning is kept.

### Part 2 of 12, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Read ch003–ch004 in full: fixed an ambiguous subject in III,28 and an ambiguous 'dos seus' in III,20 (meaning), and one inconsistent capital in III,9; rejected all audit flags.
- `pt-BR/ch003.md` [79]: “Aos massacres anteriores e ainda recentes de Mário, o Velho, Mário, o Jovem, e Carbão, que pertenciam ao mesmo partido, acrescentaram atrocidades ainda maiores.” → “Aos massacres anteriores e ainda recentes de Mário, o Velho, Mário, o Jovem, e Carbão, que pertenciam ao mesmo partido, acrescentaram atrocidades ainda maiores, cometidas por eles próprios.” — Source: the younger Marius and Carbo added greater atrocities to the elder Marius's massacres. As written, all three names attach to 'massacres' and 'acrescentaram' has no clear subject. *(meaning)*
- `pt-BR/ch003.md` [63]: “a se recusarem a passar para o lado dos seus.” → “a se recusarem a passar para o lado de seus inimigos.” — Source: 'unwilling to revolt to their enemies'. 'dos seus' normally means 'their own people', which reverses the sense. *(meaning)*
- `pt-BR/ch003.md` [23]: “primeira Guerra Púnica” → “primeira guerra púnica” — Every other occurrence in this file uses lowercase 'guerra púnica'; keep the file internally consistent.
- Rejected: pt-BR/ch003.md [73] — Audit flag: repeated word 'uma uma' — 'de uma uma divindade boa' is correct: 'de uma' (of the one) is followed by 'uma divindade'. It is awkward but not a defect.
- Rejected: pt-BR/ch003.md, ch004.md (19 places) — Audit flag: parentheses differ — The translator turned the source parentheses into dashes or commas and dropped no content. This is a style choice.
- Rejected: pt-BR/ch003.md, ch004.md (8 places) — Audit flag: emphasis markers differ — The extra italics mark retained Latin and Greek terms (Stator, Lectisternia, Tellus, Fortuna Muliebris, Villa Publica, ἀρετη), as house rules require.
- Rejected: pt-BR/ch003.md [55] — *Hortênsio* in italics — The source itself italicizes *Hortensius* here; the translation mirrors it.
- Rejected: pt-BR/ch004.md footnotes [^12], [^13] — Translator's notes on the Di Consentes and on superstitiosus/superstes — Both facts are correct: there were twelve Di Consentes, and the etymology is Cicero's in De Natura Deorum II.

### Part 2 of 12, Round 2 (codex, full read)
Verdict: 5 meaning-level, 0 minor. Lidos integralmente os 161 blocos de ch003.md e ch004.md, as oito notas, a auditoria, o journal e book.json; encontrados cinco defeitos de sentido.
- `pt-BR/ch003.md` [3]: “Dos males que somente os perversos temem” → “Dos únicos males que os perversos temem” — A fonte restringe os males temidos pelos perversos, não as pessoas que temem esses males. *(meaning)*
- `pt-BR/ch003.md` [11]: “é útil aos homens se apresentarem como descendentes dos deuses” → “é útil aos homens fingirem ser descendentes dos deuses” — “Feign themselves” explicita o caráter fictício dessa ascendência, omitido no título traduzido. *(meaning)*
- `pt-BR/ch003.md` [14]: “dar à luz Eneias, tendo por pai o homem Anquises” → “dar à luz Eneias, filho do homem Anquises” — Anquises é o pai de Eneias. O gerúndio pode atribuir esse pai a Vênus, sujeito da oração. *(meaning)*
- `pt-BR/ch003.md` [79]: “Aos massacres anteriores e ainda recentes de Mário, o Velho, Mário, o Jovem, e Carbão, que pertenciam ao mesmo partido, acrescentaram atrocidades ainda maiores, cometidas por eles próprios.” → “Mário, o Jovem, e Carbão, que pertenciam ao mesmo partido, acrescentaram atrocidades ainda maiores aos massacres anteriores e ainda recentes de Mário, o Velho.” — A fonte atribui os massacres anteriores a Mário, o Velho, e as atrocidades adicionais a Mário, o Jovem, e Carbão. O acréscimo da rodada anterior não desfez a ambiguidade entre o complemento e o sujeito. *(meaning)*
- `pt-BR/ch004.md` [4]: “se houvesse no Estado apenas homens bons e honestos” → “se ao menos houvesse no Estado homens bons e honestos” — “If only there were good and honest men” exige a presença de homens bons e honestos, não que todos os homens do Estado sejam assim. *(meaning)*
- Rejected: pt-BR/ch003.md [73] — Repetição “uma uma”. — A primeira ocorrência é pronome, retomando uma das deusas; a segunda é artigo de “divindade”. Mantém-se a rejeição anterior.
- Rejected: pt-BR/ch004.md [48] — “Para os quais” parece retomar a multidão de deuses. — Pode retomar os dons anteriormente mencionados; a referência subsequente a cada benefício humano esclarece a correspondência pretendida. Não há erro de sentido demonstrável.

### Part 2 of 12, Round 3 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of ch003–ch004 (161 blocks, 8 footnotes): two meaning fixes for misleading possessive and subject pronouns (III,24 Gracchus's head; IV,19 the demons' wiles); footnotes check out.
- `pt-BR/ch003.md` [71]: “O assassino do próprio Graco vendeu sua cabeça ao cônsul” → “O assassino do próprio Graco vendeu a cabeça de sua vítima ao cônsul” — Source: the assassin sold Gracchus's head. 'sua cabeça' refers to the subject, so the sentence says the assassin sold his own head. *(meaning)*
- `pt-BR/ch004.md` [44]: “e tanto mais deveriam eles atentar para sua astúcia e suas artimanhas” → “e tanto mais deveriam os homens atentar para a astúcia e as artimanhas desses demônios” — Source: 'they ought the rather to advert to their wits and wiles'. The worshippers should beware of the demons' cunning. As written, 'eles' follows 'demônios malignos', so the demons are told to attend to their own cunning. *(meaning)*
- Rejected: pt-BR/ch004.md [65] — Source says 'Jovinian'; PT has 'Joviano' — The emperor meant is Jovian (Latin 'Ioviani'). 'Joviano' is the correct Portuguese name; 'Jovinian' is Dods's slip, not a reading to transplant.
- Rejected: pt-BR/ch003.md [10] — 'Por que não seria um tanto quanto o outro?' might be read as the idiom 'um tanto quanto' (somewhat) — In context it parses as 'one as much as the other', which matches the source. It is awkward, not wrong.
- Rejected: pt-BR/ch003.md [73] — Audit flag 'uma uma' — Already rejected twice: pronoun followed by article. No new argument.
- Rejected: pt-BR/ch003.md, ch004.md — Audit flags for parentheses and emphasis — Same as earlier rounds: parentheses became dashes or commas with nothing dropped, and the extra italics mark retained Latin and Greek.

### Part 2 of 12, Round 4 (codex, delta read)
Verdict: 1 meaning-level, 0 minor. Verificadas as duas correções anteriores e lidos integralmente os seis blocos e as oito notas apresentados; encontrado um defeito de referência de gênero.
- `pt-BR/ch004.md` [44]: “para que os próprios que dedicaram a imagem” → “para que as próprias matronas que dedicaram a imagem” — “They themselves who have dedicated the image” retoma as matronas romanas, explicitamente identificadas como dedicantes. O masculino obscurece essa referência, essencial à observação sobre a loquacidade feminina. *(meaning)*

### Part 2 of 12, Round 5 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch003–ch004 (all paragraphs and the eight translator's notes) against the source and the audit; no remaining defects found.
- Rejected: pt-BR/ch004.md [16] — 'afflicted rather than changed' rendered 'antes afligido do que transferido a outros' — The argument contrasts Rome with the Assyrian kingdom, which passed to the Medes. 'Changed' here means passing to another people, so the rendering gives the source's sense.
- Rejected: pt-BR/ch003.md [58] — 'brazen and bloodless' rendered 'são de bronze e não têm sangue' — The literal image keeps the pun: a bronze face cannot blush. This is a defensible choice, not an error.
- Rejected: pt-BR/ch003.md [21], [36], [55], [61]; ch004.md footnotes — Translator's notes (Capitoline geese, Stator, the yoke, the bulla, Fortuna Muliebris, Consentes, superstitiosus) — Each claim checks out: the geese were sacred to Juno and the Gallic attack was at night; the yoke rite and the bulla are described correctly; there were twelve Di Consentes; the superstes etymology is Cicero's.
- Rejected: pt-BR/ch003.md [73]; audit parentheses and emphasis flags — 'uma uma'; source parentheses missing; extra italics — Already rejected in rounds 1–3, and there is no new argument. The first 'uma' is a pronoun and the second an article; no content was dropped where parentheses became dashes; the italics mark retained Latin and Greek.

### Part 3 of 12, Round 1 (claude, full read)
Verdict: 7 meaning-level, 2 minor. Leitura integral de ch005 e ch006. Sete defeitos corrigidos: negação perdida em VI, 4; erro de digitalização 'now/not' em VI, 6, corrigido na fonte e na tradução; dois referentes trocados (Múcio, Segécia); gentílico 'picentinos'; a frase 'causa que produz e é produzida' com sua nota; uma regência.
- `pt-BR/ch005.md` [30]: “que produz, mas é produzida, é Deus;[^17]” → “que produz, mas não é produzida, é Deus;[^17]” — A frase seguinte opõe Deus às demais causas, que 'tanto produzem como são produzidas', e pouco antes Deus é chamado 'espírito incriado'. O latim diz 'quae facit nec fit'. A forma atual diz no corpo do texto que Deus é produzido. *(meaning)*
- `pt-BR/ch005.md`: “[^17]: *Nota do tradutor:* O texto inglês fornecido diz “makes but is made”, aqui conservado literalmente. A formulação contradiz a expressão “espírito incriado” usada pouco antes e a oposição às demais causas na frase seguinte; o contexto indica a falta de uma negação: “produz, mas não é produzida”.” → “[^17]: *Nota do tradutor:* O texto inglês traz aqui “makes but is made”, sem a negação que o contexto exige: pouco antes, Deus é chamado “espírito incriado”, e a frase seguinte opõe-Lhe as demais causas, que “tanto produzem como são produzidas”. A negação foi restituída na tradução.” — Nota de rodapé do parágrafo [30]. Ajusta a nota à correção do texto, que agora restitui a negação.
- `pt-BR/ch005.md` [61]: “quem falará de seus direitos meritórios ao reino dos céus por ter entregado às chamas” → “quem poderá alegar os próprios méritos para o reino dos céus por ter entregado às chamas” — Quem entrega o corpo inteiro às chamas é o mártir cristão, não Múcio ('who shall speak of his meritorious claims… if for it he may have given… his whole body'). Com 'seus' logo depois de 'Múcio fez isso', o leitor atribui esses méritos a Múcio. *(meaning)*
- `pt-BR/ch005.md` [72]: “embora não adorassem a deusa Segécia, que lhes deu os outros bens da terra” → “embora não adorassem a deusa Segécia, e que lhes deu os outros bens da terra” — Na fonte, 'who gave the other blessings' refere-se a Deus ('The same… who gave'). Como está, o relativo se liga a Segécia e atribui a ela os bens da terra. *(meaning)*
- `pt-BR/ch005.md` [74]: “Os picentinos, os marsos e os pelignos” → “Os picenos, os marsos e os pelignos” — Os Picentes, habitantes do Piceno, são em português 'picenos'. 'Picentinos' designa outro povo, os Picentini da Campânia. *(meaning)*
- `pt-BR/ch005.md` [42]: “é a virtude que se contenta com nenhum outro juízo humano senão” → “é a virtude que não se contenta com nenhum outro juízo humano senão” — Com 'nenhum' depois do verbo, a construção portuguesa pede 'não' antes do verbo. O sentido não muda.
- `pt-BR/ch006.md` [20]: “No entanto, é colocada depois com razão; logo, não é *nenhuma*.” → “No entanto, é colocada depois com razão; logo, é *nenhuma*.” — A fonte diz 'therefore it is *none*'. 'Não é *nenhuma*' lê-se como a negação da conclusão do argumento ('aquilo que é *nenhuma*…'). *(meaning)*
- `pt-BR/ch006.md` [26]: “não Deus — agora elevado pelo Espírito de Deus” → “não Deus — não elevado pelo Espírito de Deus” — 'now lifted up' é erro de digitalização de 'not lifted up' (latim 'non tamen Spiritu Dei… sublevatus'). Em VI, 2 o mesmo Varrão é 'not… made free by the Holy Spirit'. Como está, a tradução afirma que Varrão foi elevado pelo Espírito de Deus. *(meaning)*
- `en-US/ch006.md` [26]: “not God—now lifted up by the Spirit of God” → “not God—not lifted up by the Spirit of God” — Erro inequívoco de digitalização ('now' por 'not'), contrário ao latim e ao argumento. Corrige-se a fonte segundo a regra da casa. *(meaning)*
- Rejected: pt-BR/ch005.md [29] — Auditoria: palavra repetida 'acontecem acontecem' — 'todas as coisas que acontecem acontecem pelo destino' é construção correta e fiel a 'all things happen which do happen'.
- Rejected: pt-BR/ch005.md [36], [61], [82]; pt-BR/ch006.md [6]–[9], [20], [37] — Auditoria: número de parênteses diferente da fonte — O conteúdo dos parênteses está todo presente, em travessões ou incorporado à frase. Nada foi omitido.
- Rejected: pt-BR/ch005.md [53]; pt-BR/ch006.md [4], [11], [22] — Auditoria: itálicos a mais — Itálico em palavra grega conservada (λατρεία, μῦθος) e no título da obra *Acadêmicos*, conforme as regras de formatação.
- Rejected: pt-BR/ch005.md [44] — 'pais' para 'fathers' (patrícios) — Tradução literal defensável do 'fathers' de Dods. É escolha de estilo.
- Rejected: pt-BR/ch005.md [30] — 'detestamos sua opinião mais do que os estoicos' é ambíguo — A ambiguidade já existe na fonte inglesa, e a leitura natural é a correta.

### Part 3 of 12, Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 133 blocos de ch005 e ch006, das oito notas, dos metadados, do diário e dos apontamentos mecânicos: nenhum novo defeito na tradução; uma contagem incorreta no diário.
- `pt-BR/translation-journal.md`: “Seis defeitos corrigidos:” → “Sete defeitos corrigidos:” — A enumeração reúne sete defeitos: duas negações, um erro de digitalização, dois referentes, um gentílico e uma regência.
- Rejected: pt-BR/ch005.md [12] — O primeiro gêmeo segura o calcanhar do segundo, invertendo o relato bíblico. — A inversão está expressamente na fonte inglesa e foi traduzida fielmente; não cabe corrigir a edição pelo relato bíblico.
- Rejected: pt-BR/ch005.md [14] — A pergunta sobre morrer no mesmo instante parece contrariar o argumento sobre destinos diferentes. — A fonte também diz “dying at the same moment”. A incoerência não demonstra um erro inequívoco de OCR que autorize sua alteração.

### Part 3 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of part 3 (ch005–ch006): checked the one journal change (Seis → Sete); the count is correct and no new defects were found.
- Rejected: pt-BR/translation-journal.md (Part 3, Round 1 summary) — The count 'Sete defeitos corrigidos' might not match the enumeration — The list has seven items: the negation in VI, 4, the OCR slip in VI, 6, Múcio, Segécia, 'picentinos', 'produz, mas não é produzida' and one regency. The pt/en fix to [26] counts as one defect. That also agrees with the verdict '7 meaning-level, 2 minor'.

### Part 4 of 12, Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch007–ch009 (Books 7–9) and their translator's notes: one fix, an added 'apenas' in VII, 5 that limits a claim the source states without limitation; the audit flags were checked and are not defects.
- `pt-BR/ch007.md` [16]: “pôde, em toda a sua extensão, chegar apenas à natureza da alma racional” → “pôde, em toda a sua extensão, estender-se até a natureza da alma racional” — Source says the theology was able 'to extend itself even to the nature of the rational soul'. The added 'apenas' turns a statement about how far it reached into a limitation that the text states only later ('though it has reached as far as the soul, it has not reached to the true God'). *(meaning)*
- Rejected: pt-BR/ch009.md [36] — Mechanical audit flags the repeated word 'bem bem'. — 'aquele bem bem-aventurado e beatificante' renders 'that blessed and beatific good': the noun 'bem' followed by the adjective 'bem-aventurado'. It is correct.
- Rejected: ch007–ch009 (parentheses and emphasis flags) — Source parentheses dropped; emphasis counts differ. — Parenthetical content is kept as commas or dashes, with nothing lost. The extra emphasis markers are the italics required for retained Greek and Latin.
- Rejected: pt-BR/ch007.md [54] — 'Xenofonte de Cólofon' should be Xenophanes. — The source reads 'Xenophon of Colophon'. The house rule forbids correcting the edition.
- Rejected: pt-BR/ch008.md [56] — Jeremias 16:10 here and 16:20 in [60] are cited for the same verse. — Both references reproduce the source. The source is not changed to correct the edition.

### Part 4 of 12, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral de ch007–ch009: 219 blocos e 10 notas, com conferência da auditoria, do journal e de book.json; encontrados 2 defeitos de sentido e 1 menor.
- `pt-BR/ch007.md` [97]: “foi introduzido pelos persas e empregado pelo próprio Numa” → “veio dos persas e foi empregado pelo próprio Numa” — O source diz 'introduced from the Persians', indicando a procedência da prática, não que os persas tenham sido os agentes de sua introdução. *(meaning)*
- `pt-BR/ch009.md` [8]: “e se tornaram incorrigíveis pelo castigo” → “e não podem ser corrigidos pelo castigo” — 'Incorrigible by punishment' significa que o castigo não consegue corrigi-los; a tradução faz do castigo a causa de se tornarem incorrigíveis. *(meaning)*
- `pt-BR/ch009.md` [36]: “Numa há o temor de uma miséria eterna; no outro,” → “Num caso há o temor de uma miséria eterna; no outro,” — Corrige a retomada paralela dos dois casos: 'Numa ... no outro' alterna indevidamente o gênero do referente.
- Rejected: pt-BR/ch007.md [57] — O uso de 'porque' poderia alterar a relação entre a deposição de Saturno e a precedência da causa sobre a semente. — A ligação causal é uma leitura defensável da explicação física atribuída a Varrão, que o texto refuta em seguida.
- Rejected: pt-BR/ch008.md [27] — 'Pelo que exprimem as palavras do apóstolo' poderia parecer uma correção do source. — A citação descreve o conhecimento manifestado por Deus; a tradução explicita essa via de conhecimento sem pressupor contato histórico entre Platão e o apóstolo.

### Part 4 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch007 [96–97] and ch009 [7–9, 35–37]: the three fixes from round 2 are correct, and the paragraphs shown have no new defects.
- Rejected: pt-BR/ch007.md [97] — Check of the fix 'veio dos persas e foi empregado pelo próprio Numa'. — It renders 'introduced from the Persians' as the origin of the practice, and the coordination with 'e, mais tarde, pelo filósofo Pitágoras' stays grammatical.
- Rejected: pt-BR/ch007.md [97] — 'quem não deseja levar uma vida piedosa nem mesmo agora procure a vida eterna' might misplace 'even now'. — 'Nem mesmo agora' modifies the wish to be pious ('qui nec modo vult esse pius'), which is the sense the source requires.
- Rejected: pt-BR/ch009.md [8] — Check of the fix 'e não podem ser corrigidos pelo castigo'. — It renders 'incorrigible by punishment' correctly and agrees with 'envelheceram na iniquidade'.
- Rejected: pt-BR/ch009.md [36] — Check of the fix 'Num caso ... no outro'; the audit also flags 'bem bem'. — The parallel 'Num caso ... no outro' is now regular. 'Bem bem-aventurado' is the noun 'bem' followed by the adjective, already rejected in round 1.

### Part 5 of 12, Round 1 (claude, full read)
Verdict: 2 meaning-level, 4 minor. Read ch010 and ch011 in full against the source: fixed a wrong object pronoun (ch010 [38]) and a garbled 'not merely… but even' (ch011 [6]), plus a duplicated phrase, a leftover e.g. and two accent errors.
- `pt-BR/ch010.md` [38]: “que nos ordenam sacrificá-los a eles” → “que nos ordenam oferecer-lhes sacrifícios” — source: 'who order us to sacrifice to them'; 'sacrificá-los' makes the gods or angels themselves the victims of the sacrifice *(meaning)*
- `pt-BR/ch011.md` [6]: “que não pode apenas deleitar-se em sua luz imutável e nela permanecer, mas nem sequer suportá-la” → “que não só não pode deleitar-se na luz imutável de Deus e nela permanecer, mas nem sequer suportá-la” — source: 'not merely from delighting and abiding in, but even from tolerating His unchangeable light'; 'não pode apenas deleitar-se' does not state the first negation, and 'sua' could refer to the mind *(meaning)*
- `pt-BR/ch010.md` [8]: “recebem sua vida bem-aventurada e a luz da verdade — sua vida bem-aventurada e a luz da verdade — da mesma fonte” → “recebem sua vida bem-aventurada e a luz da verdade da mesma fonte” — the source repeats 'their blessed life, and the light of truth' by a transcription slip; the PT keeps the repetition as a meaningless aside
- `pt-BR/ch010.md` [14]: “como, *e.g*., um coração” → “como, por exemplo, um coração” — untranslated abbreviation; ch011 renders e.g. as 'por exemplo'
- `pt-BR/ch010.md` [38]: “os *periúrgos*” → “os *periurgos*” — paroxytone word; the u is followed by r in the same syllable, so it takes no accent (compare 'teurgos')
- `pt-BR/ch010.md` [68]: “vós mesmos demolís” → “vós mesmos demolis” — oxytone ending in -is with no hiatus takes no accent (compare 'partis', 'sentis')
- Rejected: pt-BR/ch010.md, pt-BR/ch011.md (parentheses and emphasis flags) — Parentheses replaced by dashes or commas; italic *e.g.* and *i.e.* dropped; Greek words italicized — punctuation and abbreviations rendered naturally with nothing lost; italics on retained Greek follow house rules
- Rejected: pt-BR/ch010.md [23] [^3] — Translator's note might only restate the text — it glosses the technical sense of 'espiritual' (the image-bearing part of the soul), which a reader would otherwise misread; it is not a pure restatement
- Rejected: pt-BR/ch010.md vs pt-BR/ch011.md headings — 'Capítulo 1 —' in one file, 'Capítulo 1. —' in the other — each file is internally consistent
- Rejected: pt-BR/ch010.md [16] — 'que a alma, por lhe ser superior, usa' inverts 'being inferior' — same relation stated from the soul's side; the sense is unchanged
- Rejected: pt-BR/ch011.md [69] — 'pois não é uma criatura que… desse origem a um duplo conhecimento' looks like a reinterpretation — it matches the sense of the source (God's rest is not a creature, which would yield a twofold morning and evening knowledge)

### Part 5 of 12, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Lidos integralmente os 154 blocos de ch010.md e ch011.md, as quatro notas, os alertas, o journal e book.json: duas correções de sentido e uma de grafia latina.
- `pt-BR/ch010.md` [70]: “pelos arautos que o precederam e pelos apóstolos que ele enviou” → “pelos arautos que o precederam, e pregada pelos apóstolos que ele enviou” — No original, os apóstolos coordenam-se com Cristo como pregadores da crença; na tradução, ficam ligados aos arautos que anunciaram sua vinda. *(meaning)*
- `pt-BR/ch010.md` [76]: “*De Regressu Animœ*” → “*De Regressu Animæ*” — Erro inequívoco de transcrição reproduzido do original: o genitivo latino de anima é animae, também escrito animæ, não animœ.
- `pt-BR/ch011.md` [52]: “Deus, com este nosso sol, não teve o propósito de beneficiar a criação material nem de dar esplendor à sua beleza e, por isso, criou um único sol para este único mundo” → “a razão pela qual Deus criou este nosso sol — um único sol para este único mundo — não foi beneficiar a criação material nem dar esplendor à sua beleza” — O original contrapõe duas explicações para a criação do sol: beneficiar a criação ou encerrar uma alma pecadora. A expressão 'e, por isso, criou' faz da ausência de propósito benéfico a causa da criação, alterando o argumento. *(meaning)*
- Rejected: pt-BR/ch010.md [63] — A localização da citação de Virgílio como quase no último verso da quarta Écloga parece problemática. — A localização reproduz expressamente o texto-fonte; não é um defeito da tradução e não cabe corrigir a edição.

### Part 5 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch010 [69–71, 75–77] and ch011 [51–53]: the three fixes (apostles as preachers, Animæ, the sun argument) match the source, and no new defects were found.
- Rejected: pt-BR/ch011.md [52] — In the revised sentence, 'teria acontecido, antes, que somente uma alma pecou' pairs an indicative with the conditional 'teria acontecido'. — The indicative after 'acontecer que' is grammatical, and the subjunctive 'merecesse' carries the result clause. The sentence now keeps both of the source's alternatives: God's purpose of benefiting creation is denied, and chance is offered in its place.
- Rejected: pt-BR/ch010.md [70] — The repeated 'pregada' in the new text could be redundant. — The repetition is what ties the apostles to 'preached'. Without it they would read as a second agent of 'foretold', and the following relative clause 'que encheram o mundo' still refers to the apostles, as in the source.

### Part 6 of 12, Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch012 and ch013: the translation is faithful and complete. One minor fix: a mid-sentence capitalized Greek word in ch013 [60].
- `pt-BR/ch013.md` [60]: “Por outro lado, *Πνεῦμα* é invariavelmente” → “Por outro lado, *πνεῦμα* é invariavelmente” — In the source Πνεῦμα begins the sentence, so it is capitalized there. In the PT it stands mid-sentence and should be lowercase, as everywhere else in the paragraph.
- Rejected: pt-BR/ch013.md [60] — The audit flags the extra Scripture reference 7:16. The verse quoted ("I have made all breath") is really Isaías 57:16. — The PT renders the source's "Isaiah chapter vii, verse 16" faithfully. Correcting the edition's reference is out of scope for the translation.
- Rejected: pt-BR/ch012.md [16] — "Eclesiastes 10:13" for "pride is the beginning of sin", which is Sirach 10:13. — The PT follows the source's citation. Changing it would correct the edition, not the translation.
- Rejected: pt-BR/ch012.md, ch013.md (parentheses flags) — Parenthetical asides rendered with em dashes. — No content is lost; this is a defensible punctuation choice.
- Rejected: pt-BR/ch012.md [8], ch013.md [58], [60], [61] (emphasis flags) — Extra italic markers. — They italicize retained Greek words (οὐσία, ἔπλασεν, πνεῦμα, πνοή), as the house rules require.
- Rejected: pt-BR/ch013.md [26] — "decline the second" rendered as "escapar da segunda morte" even though the footnote says "declinar" was kept. — The pun is kept with "declinar da própria coisa" in the preceding sentence, so the footnote's claim holds.
- Rejected: pt-BR/ch013.md [54] vs [28], [34] — "dela comeres" vs "dele comeres" for "eat thereof". — Either referent (the tree or the fruit) is defensible, and the sense is unchanged.

### Part 6 of 12, Round 2 (codex, full read)
Verdict: 1 meaning-level, 4 minor. Leitura integral dos 130 blocos de ch012.md e ch013.md, das seis notas, da auditoria, do diário e dos metadados: uma falha de sentido, duas falhas gramaticais menores e uma nota redundante.
- `pt-BR/ch012.md` [19]: “uma vontade má.[^2] Ora” → “uma vontade má. Ora” — Remove o marcador da nota redundante eliminada abaixo.
- `pt-BR/ch012.md`: “[^2]: *Nota do tradutor:* “Eficiente” designa aqui a causa que produz algo; “deficiente” aponta para uma falta ou um afastamento do bem, e não para uma força que produza o mal como uma realidade própria.” → “” — A nota apenas reformula a explicação já presente no parágrafo sobre produção, deficiência e afastamento do bem; as regras determinam remover notas que apenas repetem o texto.
- `pt-BR/ch012.md` [38]: “e que, desde sua própria criação, estivessem sujeitos a essas mudanças temporais” → “e os sujeitasse, desde sua própria criação, a essas mudanças temporais” — Corrige a coordenação sintática: o movimento tornava necessária a existência do tempo e sujeitava os anjos às mudanças temporais.
- `pt-BR/ch013.md` [14]: “toda essa angústia às vezes é antecipada por” → “toda essa angústia às vezes é evitada por” — “Forestalled” significa impedida ou evitada, não antecipada no tempo. A continuação confirma que a rapidez impede que a angústia seja sentida. *(meaning)*
- `pt-BR/ch013.md` [56]: “serão membros de Cristo” → “venham a ser membros de Cristo” — A construção “Não que” exige aqui o subjuntivo; a substituição preserva a referência futura.

### Part 6 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch012 [18–20, 37–39] and ch013 [13–15, 55–57]: all five previous fixes are correct and fit their context; no new defects.
- Rejected: pt-BR/ch012.md footnotes — After [^2] was removed, the remaining labels are [^1] and [^3], leaving a gap in the numbering. — Markdown footnote labels are identifiers, and every remaining marker still has exactly one definition. Nothing is broken.
- Rejected: pt-BR/ch012.md [38] — “e os sujeitasse” could be a looser reading of “and that they … should be subject”. — In the source, the subjection clause is a second object of “necessitated”. Making it a second verb of the same relative clause keeps the sense, and it repairs the broken coordination the previous text had.
- Rejected: pt-BR/ch013.md [14] — “nenhuma pena seja imposta pelo pecado” for “nothing be awarded to sin”. — It conveys that, in martyrdom, the penalty due to sin is not exacted. This is a defensible rendering, and the previous rounds did not flag it.

### Part 7 of 12, Round 1 (claude, full read)
Verdict: 1 meaning-level, 5 minor. Full read of ch014–ch015: one weakened intensifier, one wrong relative-pronoun antecedent, and four 'apóstolo' capitalizations inconsistent within ch015; audit flags reviewed and accepted.
- `pt-BR/ch015.md` [17]: “pela bondade de outra pessoa, ainda que fosse seu irmão,” → “pela bondade de outra pessoa, e, o que é mais, de seu irmão,” — source 'even his brother's' (Latin 'et hoc fratris') stresses the offence; 'ainda que' reads as a concession *(meaning)*
- `pt-BR/ch015.md` [55]: “a respeito da qual nosso Senhor diz” → “a respeito do qual nosso Senhor diz” — 'of which' refers to 'this world' (Latin 'saeculo, de quo'); the feminine form points to 'cidade'
- `pt-BR/ch015.md` [51]: “diz o apóstolo” → “diz o Apóstolo” — ch015 writes 'o Apóstolo' for Paul everywhere else ([5], [7], [15], [18]); keep the file consistent
- `pt-BR/ch015.md` [51]: “que o apóstolo interpreta” → “que o Apóstolo interpreta” — same consistency with the rest of ch015
- `pt-BR/ch015.md` [75]: “recomendadas pelo apóstolo” → “recomendadas pelo Apóstolo” — same consistency with the rest of ch015
- `pt-BR/ch015.md` [75]: “como o apóstolo também os chama” → “como o Apóstolo também os chama” — same consistency with the rest of ch015
- Rejected: pt-BR/ch014.md [77] — Long Latin passage left untranslated — The source edition (Dods) deliberately leaves it in Latin; the translation keeps the same parity
- Rejected: pt-BR/ch014.md [32] — Audit: Scripture ref 6:1 not in source — Source has the OCR slip 'Galatians 6:l'; 'Gálatas 6:1' is correct
- Rejected: pt-BR/ch014.md [41] — Source reference 'k28--1 John 8:36' rendered as 'João 8:36' — The source string is garbled; John 8:36 is the right reference
- Rejected: pt-BR/ch015.md [25], [31] — 'Plínio, o Moço' credited with Natural History material — This follows the source ('the younger Pliny'); the house rule says not to correct the edition
- Rejected: ch014/ch015 parentheses audit — Source parentheses rendered as dashes — A defensible punctuation choice; no content was lost
- Rejected: pt-BR/ch014.md — Mixed Ele/ele capitalization for God — Mixed throughout the file; the house rule forbids normalizing reverential capitalization
- Rejected: pt-BR/ch014.md [69] — 'enquanto esta, por sua vez, se sujeita a Deus' refers to reason rather than the soul — Matches Augustine's Latin 'si tamen et illa Deo subdita est' (illa = mens/ratio)

### Part 7 of 12, Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 162 blocos de ch014–ch015, das cinco notas, do relatório mecânico, do diário e de book.json: quatro defeitos de sentido e um menor.
- `pt-BR/ch014.md` [69]: “Não deixamos de encontrar resistência neles e percebemos” → “Não é verdade que não encontramos resistência neles, mas percebemos” — O original pergunta se não encontramos ausência de resistência. “Não deixamos de encontrar resistência” afirma o contrário. *(meaning)*
- `pt-BR/ch015.md` [15]: “Repreende diante de todos os que pecam” → “Aos que pecam, repreende-os diante de todos” — O original manda repreender os pecadores diante de todos; a tradução liga “os que pecam” ao público da repreensão e deixa seu objeto indeterminado. *(meaning)*
- `pt-BR/ch015.md` [25]: “ou deles se veem rolar para fora” → “ou se veem ossos rolarem para fora delas” — Corrige a construção pronominal: são os ossos que rolam para fora das sepulturas.
- `pt-BR/ch015.md` [45]: “mulheres que já não fossem suas irmãs” → “mulheres que não fossem já suas irmãs” — “Not already their sisters” significa que não fossem previamente suas irmãs; “já não fossem” significa que haviam deixado de sê-lo. *(meaning)*
- `pt-BR/ch015.md` [51]: “para a parte melhor, a cidade celeste” → “para a parte melhor da cidade celeste” — O texto canônico diz “the better part of the heavenly city”; a tradução transforma a relação entre parte e cidade numa identificação. *(meaning)*
- Rejected: pt-BR/ch015.md [79] — A área total indicada como 900 côvados por 150 não corresponde à soma dos três pavimentos. — Os números reproduzem exatamente o original; corrigir o cálculo alteraria a edição canônica.
- Rejected: pt-BR/ch015.md [79] — “Cavernas curvas” parece uma tradução incorreta de “curved ribs”. — “Cavernas” é o termo náutico para as peças transversais da estrutura do casco.

### Part 7 of 12, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of all ch014–ch015 paragraphs, the footnotes and the audit flags: after the round-1 and round-2 fixes the text is clean, with no new defects.
- Rejected: pt-BR/ch014.md [69] — Round-2 fix 'Não é verdade que não encontramos resistência neles, mas percebemos…' could read as a negation — 'Não é verdade que…?' is the rhetorical question expecting assent, which matches the source 'Do we meet with no resistance in them, but perceive…?'
- Rejected: pt-BR/ch015.md [49], [57] — Names Jabel, Sela, Noema, Maviael, Matusael differ from the English forms (Jabal, Zillah, Naamah, Mehujael, Methusael) — These are the standard forms in Portuguese Bibles of the Vulgate tradition; they are not errors
- Rejected: pt-BR/ch015.md [36] — 'vinte a menos' followed by '170 anos' does not match 182 − 20 — The inconsistency is in the source; the translation reproduces it, and the edition is not corrected
- Rejected: pt-BR/ch015.md [74] — The 'inasmuch as God commanded…' period is recast as a main clause before 'isso é certamente uma figura' — The sentence is grammatical, and no content is lost or changed
- Rejected: ch014 [22], [27], [35]; ch015 [65] (audit) — Emphasis counts differ from the source — The translation adds italics to Greek and Latin terms that were left unformatted or in quotation marks, as the house format requires

### Part 8 of 12, Round 1 (claude, full read)
Verdict: 3 meaning-level, 7 minor. Full read of ch016 (110 paragraphs): fixed an OCR-driven mistranslation ('sem reinar'), plural vós breaking the singular-address argument in [76], garbled Greek in [70], and four small fidelity/consistency slips.
- `pt-BR/ch016.md` [94]: “quer, antes, “sem reinar”” → “quer, antes, “sem fingimento”” — source 'without reigning' is an OCR slip for 'without feigning' (Latin sine fictione); the next sentence ('a ficção do homem que não mente') depends on it; 'sem reinar' is nonsense here *(meaning)*
- `pt-BR/ch016.md` [76]: “Senhor, se encontrei favor diante de vós” → “Senhor, se encontrei favor diante de ti” — Augustine's argument is that Abraham addressed the Lord in the singular; 'diante de vós' reads as plural and undercuts it *(meaning)*
- `pt-BR/ch016.md` [76]: “Rogo-vos, Senhor, visto que vosso servo encontrou graça a vossos olhos” → “Rogo-te, Senhor, visto que teu servo encontrou graça a teus olhos” — the point is that Lot, unlike his plural 'meus senhores' greeting, here addresses the Lord in the singular; the plural forms erase the contrast the argument rests on *(meaning)*
- `pt-BR/ch016.md` [70]: “derivada de *αἰὼk29--·ν*” → “derivada de *αἰών*” — encoding garbage copied from the source; the word is αἰών
- `pt-BR/ch016.md` [70]: “se chama *αἰωk29--·νιον*” → “se chama *αἰώνιον*” — encoding garbage copied from the source; the word is αἰώνιον
- `pt-BR/ch016.md` [43]: “como se devesse ser considerado nascido antes naquele momento” → “como se devesse, antes, ser considerado nascido naquele momento” — source 'as if he was rather to be held as having been born then'; placed after 'nascido', 'antes' reads as 'born before'
- `pt-BR/ch016.md` [69]: “e te multiplicarei extraordinariamente” → “e te encherei extraordinariamente” — source 'will fill you exceedingly'; the quotation was pulled toward the familiar 'multiply' wording
- `pt-BR/ch016.md` [97]: “derramou óleo sobre ela” → “derramou óleo sobre o seu topo” — source 'poured oil upon the top of it'; 'top' was dropped
- `pt-BR/ch016.md` [110]: “a rola e o pombo representavam” → “a rola e a pomba representavam” — refers back to the symbol rendered 'pomba' in [62]–[63]; keep the same bird
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/ch016.md` [70]: “chamam *αἰώk29--·νιον*” → “chamam *αἰώνιον*” — encoding garbage copied from the source; the word is αἰώνιον
- Rejected: pt-BR/ch016.md [94] — Greek ἄλαστος is likely ἄπλαστος (LXX Gn 25:27) — the PT follows the source edition; the Greek form cannot be confirmed from the given text and is not changed
- Rejected: pt-BR/ch016.md [4],[6],[11],[35],[44],[56],[63],[72] — audit: parentheses dropped — contents kept as dashes or appositions; nothing lost
- Rejected: pt-BR/ch016.md [14],[70],[94] — audit: emphasis count differs — Greek words italicized as retained-language terms; correct
- Rejected: pt-BR/ch016.md [58] — 'Vós sois sacerdote' instead of 'Tu és' — reverential vós toward Christ, consistent with the file's address to God in [104]; a defensible choice
- Rejected: pt-BR/ch016.md [^2] — translator's note on hermafroditos/hermafroditas — factually correct and needed to make the gender wordplay intelligible in Portuguese

### Part 8 of 12, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral dos 110 parágrafos, das três notas, dos metadados e do diário; conferidos todos os alertas mecânicos. Encontrados dois defeitos de sentido e uma corrupção gráfica residual.
- `pt-BR/ch016.md` [70]: “*αἰώk29--·νιον*” → “*αἰώνιον*” — Resta uma ocorrência com corrupção de codificação; a forma íntegra aparece no final do mesmo parágrafo.
- `pt-BR/ch016.md` [82]: “seu único filho, a quem fora dito:” → “seu único filho, tendo sido dito ao próprio Abraão:” — A promessa foi dirigida a Abraão, como o próprio parágrafo explicita anteriormente. Na tradução, a oração relativa atribui a Isaac o recebimento dessas palavras. *(meaning)*
- `pt-BR/ch016.md` [98]: “quando uma lhe foi dada por engano em lugar da outra” → “quando uma lhe foi dada fraudulentamente em lugar da outra” — O original diz 'falsely given': trata-se de uma substituição enganosa deliberada. 'Por engano' apresenta a troca como acidental. *(meaning)*
- Rejected: pt-BR/ch016.md [73] — O título emprega 'regeneração' ao tratar da capacidade de gerar filhos. — O título canônico também emprega 'regeneration'; a tradução preserva a peculiaridade da edição.
- Rejected: pt-BR/ch016.md [90] — Isaac aparece no septuagésimo ano quando nascem seus filhos. — O original fornecido diz expressamente 'seventieth'; não é erro da tradução.

### Part 8 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch016 [69]–[70], [71], [81]–[83], [97]–[99]: the [70] Greek fix and the [98] fix are correct; the [82] fix adds a name inside the Hebrews quotation, now trimmed to 'tendo-lhe sido dito'.
- `pt-BR/ch016.md` [82]: “seu único filho, tendo sido dito ao próprio Abraão:” → “seu único filho, tendo-lhe sido dito:” — source quotes Hebrews 'to whom it was said'; the previous fix rightly makes Abraham the one addressed but adds 'ao próprio Abraão' inside the quotation; 'tendo-lhe sido dito' refers back to the subject without adding words
- Rejected: pt-BR/ch016.md [70] — verify the Greek repair — all three Greek forms now read αἰώνιον / αἰών / αἰώνιον, italicized; correct
- Rejected: pt-BR/ch016.md [98] — 'fraudulentamente' for 'falsely given' — the substitution of Leah was a deliberate deception; the rendering is correct and the sentence's concord holds
- Rejected: pt-BR/ch016.md [98] — 'por causa de seu filho José' for 'by his son Joseph' — Jacob entered Egypt on Joseph's account; the sense is kept

### Part 8 of 12, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Conferida a alteração em ch016.md [82] e lidos integralmente [81]–[83], as notas fornecidas, os metadados e o diário. A correção preserva o sentido e a concordância; nenhum novo defeito objetivo encontrado.

### Part 9 of 12, Round 1 (claude, full read)
Verdict: 4 meaning-level, 3 minor. Full read of Books 17–18 (ch017.md, ch018.md); 7 fixes: 1 Sam 15:28 kept to the Latin reading Augustine rejects (2 places), wrong tense in the Ps 89 quotation that the textual remark relies on, the ch18 [136] opening reversed, plus a regency slip, a heading attachment and a second tense fix.
- `pt-BR/ch017.md` [4]: “na medida que parecer suficiente” → “na medida em que parecer suficiente” — standard locution is "na medida em que"
- `pt-BR/ch017.md` [29]: “O Senhor arrancou hoje de tua mão o reino de Israel, e o dará” → “O Senhor arrancou hoje de Israel o reino, tirando-o de tua mão, e o dará” — source "rent the kingdom from Israel out of your hand"; [30] says this Greek wording, not the Latin "kingdom of Israel", is the one quoted here *(meaning)*
- `pt-BR/ch017.md` [29]: ““O Senhor arrancou hoje de tua mão o reino de Israel”, reinou” → ““O Senhor arrancou hoje de Israel o reino, tirando-o de tua mão”, reinou” — same quotation, same Greek reading as defended in [30] *(meaning)*
- `pt-BR/ch017.md` [41]: “, e que foi o único a ter poder para libertar” → “, o único que teve poder para libertar” — source "in Christ, Who Alone Had Power"; "e que foi" makes "substância" the subject instead of Christ
- `pt-BR/ch017.md` [42]: “Até quando, Senhor, vos desviareis, até o fim?” → “Até quando, Senhor, vos desviais, até o fim?” — source "do You turn away" (present); the text then says some copies have not the present but "will You turn away", which the future here contradicts *(meaning)*
- `pt-BR/ch017.md` [42]: “Até quando desviareis de mim vosso rosto?” → “Até quando desviais de mim vosso rosto?” — source "How long do You turn away Your face" is present
- `pt-BR/ch018.md` [136]: “Não penso, de fato, que seja temerário dizer ou crer o que alguns pensaram ou podem pensar” → “Não penso, de fato, que se deva dizer ou crer temerariamente o que alguns pensaram ou podem pensar” — Augustine refutes the ten-persecutions theory and ends calling the opposite view "no less rash"; the PT made him endorse it *(meaning)*
- Rejected: pt-BR/ch017.md, pt-BR/ch018.md (audit: parentheses) — source parentheses rendered as dashes or commas — punctuation choice; content kept
- Rejected: pt-BR/ch018.md (audit: emphasis) — Greek words italicized where source is plain — house style italicizes retained Greek
- Rejected: pt-BR/ch018.md [73] — Gálatas 2:14-20 for the dividing wall (actually Ephesians 2) — reference copied from the source edition; not corrected
- Rejected: pt-BR/ch017.md [56] — heading says Salmo 15, text in [58] says Salmo 16 — the source has the same mismatch

### Part 9 of 12, Round 2 (codex, full read)
Verdict: 1 meaning-level, 4 minor. Leitura integral dos 213 blocos dos Livros 17–18, das seis notas e dos dados fornecidos: uma correção de sentido e duas gralhas gregas, cada uma corrigida na fonte e na tradução.
- `pt-BR/ch017.md` [18]: “deve gloriar-se de modo algum em si mesmo, mas no Senhor” → “deve gloriar-se no Senhor, e de modo algum em si mesmo” — A fonte nega expressamente gloriar-se em si mesmo. A expressão negativa está mal posicionada depois do verbo afirmativo. *(meaning)*
- `en-US/ch018.md` [24]: “ἌΑρης” → “Ἄρης” — Gralha inequívoca na fonte: o alfa inicial do nome grego de Marte está duplicado.
- `pt-BR/ch018.md` [24]: “*ἌΑρης*” → “*Ἄρης*” — Corrige a duplicação indevida do alfa inicial do nome grego de Marte, herdada da fonte.
- `en-US/ch018.md` [62]: “ἰχδὺς” → “ἰχθὺς” — Gralha inequívoca: a palavra grega para peixe contém theta, não delta; o próprio acróstico exige a inicial de Θεοῦ.
- `pt-BR/ch018.md` [62]: “*ἰχδὺς*” → “*ἰχθὺς*” — Corrige a troca de theta por delta herdada da fonte, preservando a palavra grega para peixe e sua correspondência com o acróstico.
- Rejected: pt-BR/ch018.md [60] — Espaço antes da pontuação em “Σ . . . .”. — Reproduz as reticências espaçadas da fonte junto à letra do acróstico; não é um espaço acidental.

### Part 9 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch017 [17–19] and ch018 [23–25, 61–63]: the reordered negation in [18] and the two Greek typo fixes (Ἄρης, ἰχθὺς) are correct; the surrounding paragraphs have no defects.
- Rejected: pt-BR/ch017.md [17] — “nosso auxiliador” adds a possessive the source (“He, the helper”) lacks — Implicit in the context (He has enabled us); the meaning is unchanged
- Rejected: pt-BR/ch017.md [18] — “the extremes of man” rendered as “os momentos finais do homem” — The next clause (“the ending in which he shall be found”) makes the temporal sense explicit; the rendering is faithful
- Rejected: pt-BR/ch018.md [63] — “if only the transcribers do not neglect” rendered with “contanto que” — The conditional reservation is kept; a defensible choice

### Part 10 of 12, Round 1 (claude, full read)
Verdict: 0 meaning-level, 5 minor. Capítulo 19 lido parágrafo a parágrafo contra a fonte; cinco correções menores (regência e objeto em [33], superlativo omitido e 'outro' acrescentado em citações de Êxodo em [62]).
- `pt-BR/ch019.md` [33]: “que se travam guerras, mesmo entre aqueles que têm prazer” → “que se travam guerras, mesmo por aqueles que têm prazer” — source: 'wars are waged, even by those who take pleasure'; 'entre' muda o agente da passiva para lugar
- `pt-BR/ch019.md` [33]: “e é tão avesso a compartilhá-la que não confia” → “e é tão avesso a associar-se que não confia” — source: 'so jealous of partnership'; recusa companhia, não a partilha da força
- `pt-BR/ch019.md` [62]: “veneramos e amamos como nossos concidadãos bem-aventurados” → “veneramos e amamos como nossos concidadãos beatíssimos” — source: 'our most blessed fellow citizens'; superlativo omitido
- `pt-BR/ch019.md` [62]: “como com voz de trovão: “Aquele que sacrificar a qualquer outro deus” → “como com voz de trovão: “Aquele que sacrificar a qualquer deus” — source: 'unto any god, save unto the Lord only'; 'outro' acrescentado (cf. [55])
- `pt-BR/ch019.md` [62]: “nessa lei está escrito: “Aquele que sacrificar a qualquer outro deus” → “nessa lei está escrito: “Aquele que sacrificar a qualquer deus” — source: 'unto any god, save unto the Lord alone'; 'outro' acrescentado
- Rejected: pt-BR/ch019.md [25] — Mateus 17:7 para 'Ai do mundo por causa dos escândalos' (o versículo é Mt 18:7) — a tradução reproduz a referência da fonte; não se corrige a edição
- Rejected: pt-BR/ch019.md [14] — pergunta da fonte ('how inadequate was even his ability here?') vertida como exclamação — é pergunta retórica; a exclamação preserva o sentido
- Rejected: pt-BR/ch019.md [8], [13], [19], [27], [34], [59] — parênteses da fonte ausentes (auditoria) — convertidos em vírgulas ou travessões, sem perda de conteúdo
- Rejected: pt-BR/ch019.md [14], [15], [34], [46], [50], [59] — marcadores de ênfase a mais (auditoria) — grego e latim retidos postos em itálico, conforme a regra da casa

### Part 10 of 12, Round 2 (codex, full read)
Verdict: 4 meaning-level, 1 minor. Leitura integral dos 72 blocos de ch019.md, das três notas, da auditoria, do journal e de book.json: quatro defeitos de sentido e um de gramática; os alertas mecânicos não exigem correção.
- `pt-BR/ch019.md` [21]: “para não condenar à morte, sem saber, um inocente” → “para não executar, sem saber, um inocente” — A fonte diz 'put an innocent man to death': trata da execução, não apenas da condenação. *(meaning)*
- `pt-BR/ch019.md` [21]: “e o condenou à morte sem descobri-la” → “e o executou sem descobri-la” — A fonte afirma 'has put him to death', indicando que a execução efetivamente ocorreu. *(meaning)*
- `pt-BR/ch019.md` [55]: “Pois, embora, se quiseres considerar atentamente o assunto, verás que nada é vantajoso” → “Pois, embora possas ver, se quiseres considerar atentamente o assunto, que nada é vantajoso” — A oração concessiva introduzida por 'embora' exige o subjuntivo; a reformulação preserva a condição intercalada.
- `pt-BR/ch019.md` [59]: “Cristo foi condenado à morte por juízes de reto juízo ou justos” → “Cristo foi executado por juízes de reto juízo ou justos” — A fonte diz 'Christ was put to death', afirmando a execução, não somente a sentença. *(meaning)*
- `pt-BR/ch019.md` [61]: “Apolo diz que Cristo foi condenado à morte por juízes de reto juízo” → “Apolo diz que Cristo foi executado por juízes de reto juízo” — A fonte diz 'Christ was put to death'; deve ser preservada a afirmação da execução. *(meaning)*
- Rejected: pt-BR/ch019.md [62] — 'Em certo lugar' poderia indicar uma passagem da obra de Porfírio, em vez da localização dos espíritos. — A pontuação incompleta da fonte permite a leitura locativa adotada; o trecho fornecido não sustenta uma correção inequívoca.

### Part 10 of 12, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of ch019 (72 blocks, 3 notes): one meaning-level fix in [33] (object misread as subject) and one minor fix in [62] (ambiguous pronoun).
- `pt-BR/ch019.md` [33]: “Pois até aqueles contra os quais fazem guerra desejam tornar seus e submeter às leis de sua própria paz.” → “Pois desejam tornar seus até aqueles contra os quais fazem guerra e submetê-los às leis de sua própria paz.” — The source reads 'even those whom they make war against they wish to make their own'. In the Portuguese, 'aqueles' reads as the subject of 'desejam' and the verbs have no object, so the sentence misstates who wishes what. *(meaning)*
- `pt-BR/ch019.md` [62]: “e lhe mandam prestar-lhe culto” → “e lhe mandam prestar culto a Ele” — The source reads 'command it to worship Him'. The two 'lhe' refer to the soul and to God respectively; the second one is left ambiguous.
- Rejected: pt-BR/ch019.md [16] — 'mais empenhada em alcançar seu fim do que repousando em sua obra concluída' is not parallel — The construction is understandable and the sense is intact; this is style, not a defect.
- Rejected: pt-BR/ch019.md [68] — 'paz de Babilônia' sits beside 'para a Babilônia' and 'pela Babilônia' — Both usages are accepted in Portuguese and the sense does not change.
- Rejected: pt-BR/ch019.md [8], [13], [14], [15], [19], [27], [34], [46], [50], [59] — Audit flags for parentheses and emphasis markers — Round 1 already resolved these: the parentheses became commas or dashes, and the italics mark retained Greek and Latin.

### Part 10 of 12, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as duas correções e lidos integralmente os seis blocos fornecidos, as três notas, a auditoria, o journal e book.json. Correções válidas, sem novos defeitos.

### Part 11 of 12, Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Full read of ch020–ch021: one unclear clause in ch021 [73] fixed; four consistency slips (an ellipsis style in ch020, three chapter-heading formats in ch021); audit flags checked and rejected.
- `pt-BR/ch021.md` [73]: “pelos incrédulos e pelos que vivem sem Deus depois de mortos” → “pelos incrédulos e ímpios que já morreram” — source: 'for the unbelieving and godless who are dead'; 'vivem sem Deus depois de mortos' reads as if the dead still live without God and blurs the sense *(meaning)*
- `pt-BR/ch020.md` [52]: “escarnecedores. [...] Contudo” → “escarnecedores. . . . Contudo” — the rest of the file ([17], [22], [78]) marks the source's omission with '. . .'; keep the file consistent
- `pt-BR/ch021.md` [78]: “## Capítulo 25 —” → “## Capítulo 25. —” — chapters 1–24 in this file use 'Capítulo N. —'; keep headings consistent
- `pt-BR/ch021.md` [83]: “## Capítulo 26 —” → “## Capítulo 26. —” — chapters 1–24 in this file use 'Capítulo N. —'; keep headings consistent
- `pt-BR/ch021.md` [88]: “## Capítulo 27 —” → “## Capítulo 27. —” — chapters 1–24 in this file use 'Capítulo N. —'; keep headings consistent
- Rejected: pt-BR/ch020.md [91] — audit flag: repeated word 'toca toca' — 'quem vos toca / toca a menina de seu olho': subject clause followed by its verb; correct grammar
- Rejected: pt-BR/ch020.md [17], [22], [78] — audit flag: space before punctuation — these are the source's spaced ellipses '. . .', reproduced on purpose
- Rejected: ch020/ch021 (17 paragraphs) — audit flag: parentheses differ — the source's parentheticals are kept as dashes or commas with the content intact; a defensible style choice
- Rejected: pt-BR/ch021.md [57] and [^4] — heading says the man 'será condenado' while the chapter argues no one will be — it follows the canonical English, and the translator's note states the discrepancy correctly; the source is not to be corrected
- Rejected: pt-BR/ch021.md [42] — 'reparation' rendered 'talião' — the next sentence defines it as suffering what one did ('eye for eye'); 'talião' gives that sense and is Cicero's term
- Rejected: pt-BR/ch020.md [13] — Matthew 11:24 'than for you' rendered 'do que para ti' — the verse addresses Capernaum in the singular; the English 'you' is open, and 'ti' is defensible
- Rejected: pt-BR/ch020.md [61] — 'na medida que parecer necessária' — 'medida' is the noun here and 'que' is the subject of 'parecer'; grammatical

### Part 11 of 12, Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 191 parágrafos de ch020–ch021, das quatro notas, dos metadados, do diário e dos alertas mecânicos: dois defeitos de sentido.
- `pt-BR/ch020.md` [23]: “mas viriam a crer nele.” → “mas viriam a crer em Cristo.” — “Himself” retoma explicitamente Jesus Cristo; em português, “nele” fica ligado ao diabo, mencionado na mesma oração. *(meaning)*
- `pt-BR/ch020.md` [42]: “antes desse reinado dos santos com Cristo?” → “antes do fim desse reinado dos santos com Cristo?” — O argumento compara o término da prisão do diabo ao término do reinado dos santos. A tradução atual situa aquele término antes do próprio reinado. *(meaning)*
- Rejected: pt-BR/ch021.md [54] — “Pelo hábito de vencer” foi ligado ao fortalecimento dos vícios, apesar da vírgula no inglês. — O contraste imediato com vícios acostumados a vencer e dominar sustenta essa leitura; a tradução é defensável.
- Rejected: pt-BR/ch021.md [87] — Referência aos corpos dos mortos antes da ressurreição. — O inglês canônico diz expressamente “the bodies of the dead”; a tradução preserva o texto recebido.

### Part 11 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch020 [22]–[24] and [41]–[43]: both previous fixes ([23] and [42]) are correct against the source, and no new defects were found.
- Rejected: pt-BR/ch020.md [23] — Check of the change “nele” → “em Cristo” — The source's 'believers in Himself' refers back to the Lord Jesus Christ. The new wording removes the ambiguity with the devil and keeps the sentence's concord.
- Rejected: pt-BR/ch020.md [42] — Check of the change “antes desse reinado” → “antes do fim desse reinado” — The argument compares the end of the devil's binding with the end of the saints' reign, as the rest of the paragraph shows ('the reign of the saints ... shall last longer'). The fix states that sense without breaking the question.
- Rejected: pt-BR/ch020.md [42] — 'and pass into that kingdom' is rendered as a main verb ('e passarão àquele reino') rather than inside the 'till' clause — The English is open between the two readings, and either way the souls pass into the kingdom with no death. The reader's understanding does not change, so this is not an objective defect.
- Rejected: pt-BR/ch020.md [23] — 'had power to take captive' rendered 'tinha poder para manter cativo' — The sense of the devil's dominion over the human race is kept. This is a defensible choice.

### Part 12 of 12, Round 1 (claude, full read)
Verdict: 2 meaning-level, 4 minor. Full read of ch022 (Book 22): six fixes, two meaning (garbled subject in [14], 'promised Himself' in [109]) and four minor (place-name consistency, a dropped superlative, a Job quotation drifting toward familiar wording); audit flags acceptable.
- `pt-BR/ch022.md` [14]: “homens que sabiam conhecer apenas uma ou, no máximo, duas línguas” → “homens que, como sabiam, conheciam apenas uma ou, no máximo, duas línguas” — source: men whom they knew to be acquainted with only one or two languages; 'homens que sabiam conhecer' gives the knowing to the speakers and reads as 'knew how to know' *(meaning)*
- `pt-BR/ch022.md` [109]: “ele prometeu a si mesmo” → “ele se prometeu a nós” — source 'He has promised Himself' (God as the reward); 'prometeu a si mesmo' means he made a promise to himself *(meaning)*
- `pt-BR/ch022.md` [23]: “então bispo de Uzala” → “então bispo de Uzali” — the same town appears as 'Uzali' in [42] and in the source; keep the file consistent
- `pt-BR/ch022.md` [33]: “que residia em Calama” → “que residia em Cálama” — the same town is written 'Cálama' twice in [41]; keep the file consistent
- `pt-BR/ch022.md` [34]: “do bem-aventurado Estêvão” → “do beatíssimo Estêvão” — source 'the most blessed Stephen'; the superlative was dropped
- `pt-BR/ch022.md` [104]: ““Eu vos conhecia pelo ouvir dos ouvidos” → ““Eu ouvira falar de vós pelo ouvir dos ouvidos” — source 'I have heard of You by the hearing of the ear'; 'conhecia' follows the familiar Bible wording instead of the source
- Rejected: pt-BR/ch022.md [5], [7], [8], [72] — emphasis markers differ — *i.e.* and *e.g.* are translated as 'isto é' and 'por exemplo', so they need no italics; in [72] the Greek word is italicized as retained Greek
- Rejected: pt-BR/ch022.md [5], [10], [17], [23], [28], [113] — parentheses differ — the source parentheticals are rendered with paired dashes; no content is lost
- Rejected: pt-BR/ch022.md [17] — 'safety' rendered 'salvação' in the city-of-God sentence, 'segurança' elsewhere — defensible: the argument turns on Latin *salus*, and in this sentence it refers to eternal salvation
- Rejected: pt-BR/ch022.md [16], [52], [67], [82] — translator's notes checked as claims of fact — *lupa* as she-wolf or prostitute, the vestals, the levirate and the ancient pedagogue are all stated correctly

### Part 12 of 12, Round 2 (codex, full read)
Verdict: 2 meaning-level, 2 minor. Leitura integral dos 114 blocos de ch022.md, das quatro notas, do book.json e do diário; encontrados dois defeitos de sentido e dois menores. Conferidos todos os alertas mecânicos.
- `pt-BR/ch022.md` [51]: “Essa substância tão veloz em tamanha lentidão?” → “A mais veloz das substâncias em tamanha lentidão?” — O original diz “swiftest”, afirmando superioridade sobre todas as demais substâncias, não apenas grande velocidade. *(meaning)*
- `pt-BR/ch022.md` [67]: “aqueles que neste mundo costumam casar-se e ser dadas em casamento” → “os que neste mundo costumam casar-se e as que costumam ser dadas em casamento” — Corrige a discordância entre “aqueles” e “dadas”, preservando os dois grupos distinguidos no argumento.
- `pt-BR/ch022.md` [86]: “ou o desejo nos precipite a fazer o que não devemos” → “ou o desejo não nos precipite a fazer o que não devemos” — O “lest” do original abrange também esta oração: devemos vigiar para evitar que o desejo nos precipite ao ilícito. *(meaning)*
- `pt-BR/ch022.md` [89]: “caiu, tornou-se semelhante aos animais” e gera como eles” → “caiu”, ele “tornou-se semelhante aos animais” e gera como eles” — Encerra a oração causal introduzida por “como” e restitui a oração principal: após a queda, o homem tornou-se semelhante aos animais e gera como eles.
- Rejected: pt-BR/ch022.md [44], [69], [100] — Estranheza de “Eu curei o povo”, “uma só cabeça” e “não julgaram possível”. — As três formulações reproduzem o SRC fornecido. A estranheza contextual ou a divergência da redação bíblica habitual não bastam para autorizar uma correção da fonte como OCR.
- Rejected: pt-BR/ch022.md [82] — Possível necessidade de repetir “não” antes de “seja muito difícil”. — Aqui “para que não” pode reger toda a coordenação, apresentando a obstinação e a dificuldade de submissão como consequências a evitar.

### Part 12 of 12, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch022 [50]-[52], [66]-[68], [85]-[90] and notes [^2], [^3]: all four previous fixes are correct and no new defects were found.
- Rejected: pt-BR/ch022.md [51] — “A mais veloz das substâncias” checked against “This swiftest substance” — The superlative is kept and matches the parallel “a mais leve das substâncias” in the sentence before.
- Rejected: pt-BR/ch022.md [67] — “os que … costumam casar-se e as que costumam ser dadas em casamento” — Concord is now correct, and the two groups the argument separates (males who marry, females given in marriage) stay distinct.
- Rejected: pt-BR/ch022.md [86] — “ou o desejo não nos precipite” — The repeated negation fits the series of “para que … não” clauses and renders the “lest” that also covers this clause.
- Rejected: pt-BR/ch022.md [89] — “como “o homem, colocado em honra, caiu”, ele “tornou-se semelhante aos animais”” — The causal clause is closed and the main clause restored; the sense matches the source.
- Rejected: pt-BR/ch022.md [51] — “negou que ela fosse um corpo” drops “at all” — The denial is already total in Portuguese; no content is lost.
- Rejected: pt-BR/ch022.md [68] — Heading “O homem perfeito…” lacks the “Do/Dos” used in neighbouring headings — Style choice; the content of the heading is complete and correct.
- Rejected: pt-BR/ch022.md [88] — “como posso chamá-lo” for “as I may call it” — With no question mark it reads as a concessive aside; defensible.
