
## Termos

| claritas / agilitas / impassibilitas | claridade / agilidade / impassibilidade | Propriedades dos corpos glorificados |
| corpus animale / corpus spirituale | corpo animal / corpo espiritual | Mantida a distinção paulina explicada pelo autor |
| passibilis / impassibilis | passível / impassível | Capacidade ou incapacidade de sofrer |
| alligatio | vinculação | Ligação dos espíritos ao fogo corpóreo no cap. 90 |
| poena damni / poena sensus | pena de dano / pena de sentido | Terminologia esclarecida na nota [^94] |
| Purgatorium / poenae purgatoriae | purgatório / penas purgatórias | Purificação depois da morte |
| per fidem / per speciem | pela fé / pela visão | Contraste da citação paulina no cap. 91 |
| continens / temperatus | continente / temperante | Distinção moral esclarecida na nota [^95] |
| species inditae | espécies infundidas | Formas inteligíveis presentes nos anjos desde sua criação |
| iudicium finale | juízo final | Distinto do juízo individual das almas |

## Decisões

- Preservados os 113 parágrafos da fonte nos capítulos 85–97 do livro IV, além de dois parágrafos de notas do tradutor. Mantido sem destaque o subtítulo do cap. 95, conforme a fonte.
- Conservadas as referências e a redação própria das citações, inclusive 1 Coríntios 15:51, Lucas 16:22 e Isaías 65:17. Não foram acrescentados números de versículos às referências que só indicam livro ou capítulo; “ult.” permanece “último capítulo”.
- No cap. 91, “per speciem” foi traduzido por “pela visão”, em oposição a “pela fé”; “dissolvi”, na citação de Filipenses 1:23, por “partir”, conservando-se “dissolução do corpo” na explicação subsequente.
- Mantidas as concepções naturais e cosmológicas do autor, inclusive a distinção dos sexos, o movimento do céu e a permanência ou cessação das diferentes criaturas no estado final.
- Nota [^94], cap. 90: esclarece “pena de dano” e “pena de sentido”, evitando que a segunda expressão seja entendida como necessariamente dependente de órgãos sensoriais. Nota [^95], cap. 95: explica a distinção técnica entre “continente” e “temperante”.

## Review log

### Part 1 of 9, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Read all of b1-ch001 to b1-ch067 against the Leonine Latin: two wrong case splits in ch. 22 (meaning) and one garbled quotation in ch. 67 (minor); all audit flags were checked and are not defects.
- `pt-BR/b1-ch022.md` [4]: “ou é incompatível com essa quididade, ou lhe é contrário, como o existir por si” → “ou é discordante dessa quididade, isto é, incompatível com ela, como o existir por si” — Latin 'aut est dissonum illi quidditati seu repugnans … aut ei consonum' gives two cases. The PT lists three, so 'primeiro modo' and 'segundo modo' no longer point to the right cases. *(meaning)*
- `pt-BR/b1-ch022.md` [8]: “ou por algo que pertence à essência daquela coisa, ou pela própria essência, ou por alguma outra coisa” → “ou por algo que pertence à essência daquela coisa, isto é, pela própria essência, ou por alguma outra coisa” — Latin 'aut per aliquid quod est de essentia illius rei, sive per essentiam ipsam, aut per aliquid aliud' gives two alternatives, matching 'Si primo modo' and 'Si autem … per aliquam aliam causam'. The PT lists three. *(meaning)*
- `pt-BR/b1-ch067.md` [11]: “quando se diz “Deus sabe”, ou “soube, que isto acontecerá”,” → “quando se diz “Deus sabe que isto acontecerá” ou “Deus soube que isto acontecerá”,” — Source has 'Deus scit, vel scivit, hoc futurum'. The quotation marks split the phrase badly: the second quotation starts mid-clause and has no subject.
- Rejected: pt-BR/b1-ch010.md [4], pt-BR/b1-ch011.md [4] — Repeated word “todo todo” — It translates 'omne totum' ('every whole') literally and is grammatical. It is not a typo.
- Rejected: pt-BR/b1-ch002.md [3] — Emphasis count differs (12/10) and parentheses were added — The adjacent italic spans *concupiscentia* and *sapientiae deducet…* were merged into one quotation. The parentheses only hold Scripture references. No content is lost.
- Rejected: pt-BR/b1-ch006.md [5] — Length outlier (166%) — Checked clause by clause: complete and faithful, with no additions.
- Rejected: pt-BR/b1-ch026.md [11] — Emphasis count differs (4/2) — The two quoted pieces of Wisdom 14:21 were joined into one italic span, with 'a saber, o de Deus' kept outside it. The content is intact.
- Rejected: pt-BR/b1-ch012.md [10], b1-ch044.md [14], b1-ch067.md [12] — Extra emphasis markers — Retained Latin and Greek terms (*quia*, *Theos*, *theasthe*, *de dicto*, *de re*) are italicized as house style requires.

### Part 1 of 9, Round 2 (codex, full read)
Verdict: 5 meaning-level, 1 minor. Leitura integral dos 67 capítulos, com notas, metadados, diário e alertas mecânicos: seis correções; nenhum novo defeito nos alertas.
- `book.json`: “Tradução integral derivada de Shapcote, alinhada linha a linha com o latim da edição Leonina.” → “Tradução integral do latim da edição Leonina, alinhada linha a linha com o original, com o inglês derivado de Shapcote como referência.” — A tradução pt-BR procede do latim, conforme a orientação fornecida e editions.pt-BR.from; Shapcote é apenas a referência inglesa. *(meaning)*
- `pt-BR/b1-ch006.md` [3]: “comprovação experimental” → “comprovação” — Experimentum designa aqui comprovação pela razão humana; 'experimental' restringe indevidamente a afirmação à verificação empírica. *(meaning)*
- `pt-BR/b1-ch016.md` [6]: “Ora, Deus é necessário existir por si.” → “Ora, o ser de Deus é necessário por si.” — Corrige a construção sintática defeituosa, preservando Deum autem est per se necesse esse.
- `pt-BR/b1-ch026.md` [8]: “a geração, falando por si,” → “a geração, propriamente falando,” — Per se loquendo indica que se considera a geração em sentido próprio; não significa falar por si. *(meaning)*
- `pt-BR/b1-ch037.md` [8]: “*quão bom é o Deus de Israel para os que têm o coração reto*” → “*quão bom é Deus para Israel, para os que têm o coração reto*” — Na citação quam bonus Israel Deus, Israel é destinatário da bondade divina, não complemento possessivo de Deus. *(meaning)*
- `pt-BR/b1-ch067.md` [9]: “é tal que deles procedem de modo contingente” → “é tal que delas procedem de modo contingente” — Ex eis refere-se às causas próximas: os contingentes procedem delas. 'Deles' retoma indevidamente os contingentes. *(meaning)*
- Rejected: pt-BR/b1-ch013.md [20] — A oposição final entre 'por si' e 'por acidente' parece contrariar o argumento. — A tradução reproduz exatamente non coniunguntur per se, sed per accidens; não cabe corrigir o raciocínio da fonte.
- Rejected: pt-BR/b1-ch026.md [14] — A afirmação de que o animal não pode existir sem a diferença racional parece omitir a alternativa irracional. — O latim fornecido também diz somente absque rationali differentia. Não há omissão na tradução.

### Part 1 of 9, Round 3 (claude, full read)
Verdict: 0 meaning-level, 4 minor. Full read of b1-ch001 to b1-ch067: faithful and complete. Four minor fixes: one small addition in ch. 49 and three work titles made consistent across files.
- `pt-BR/b1-ch049.md` [4]: “dizemos que sabemos o que é cada coisa quando conhecemos sua causa” → “dizemos que sabemos cada coisa quando conhecemos sua causa” — Latin 'scire dicimur unumquodque cum causam cognoscimus' says only 'know each thing'. The added 'o que é' turns knowledge through the cause into knowledge of the essence.
- `pt-BR/b1-ch049.md` [8]: “no capítulo VII de *Os nomes divinos*” → “no capítulo VII de *Dos nomes divinos*” — The same work (De Div. Nom.) is titled *Dos nomes divinos* in ch. 26, 28 and 29; the title should be the same throughout the book.
- `pt-BR/b1-ch058.md` [12]: “no capítulo VII de *Os nomes divinos*” → “no capítulo VII de *Dos nomes divinos*” — Same work title as in ch. 26, 28 and 29 (*Dos nomes divinos*).
- `pt-BR/b1-ch005.md` [7]: “no livro II de *Sobre o céu e o mundo*” → “no livro II de *Do céu e do mundo*” — Aristotle's *De caelo et mundo* is rendered *Do céu e do mundo* four times in ch. 20; the title should be the same throughout the book.
- Rejected: pt-BR/b1-ch027.md [10], b1-ch040.md [7], b1-ch066.md [16], b1-ch067.md [13] — Scripture references look off (Job 11:8, Wisdom 7:11, Sirach 23:29 and 39:24 in the usual numbering) — The PT reproduces the source's own references; the author's or edition's numbering is not corrected.
- Rejected: pt-BR/b1-ch021.md [^4] and b1-ch063.md [^13] — Two translator's notes both explain 'matéria assinalada' — Both are accurate, and each helps the reader in its own chapter; neither only restates the text.
- Rejected: pt-BR/b1-ch023.md [11] — 'loquentium in lege Sarracenorum' rendered 'que discorrem sobre a lei dos sarracenos' — Acceptable rendering of the loquentes (the Muslim theologians of the kalām); the sense is kept.

### Part 1 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as quatro alterações e lidos integralmente os 11 parágrafos apresentados, a nota do tradutor e os metadados pertinentes: nenhum novo defeito encontrado.

### Part 2 of 9, Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Read part 2 (b1-ch068 to b2-ch036) in full: one dropped negation in b1-ch096 [3] (meaning), three ungrammatical calques of necesse esse, and one dropped qualifier in b1-ch069 [13]; the audit flags were checked and rejected.
- `pt-BR/b1-ch096.md` [3]: “Disso se vê que o ódio de coisa alguma pode convir a Deus.” → “Disso se vê que a Deus não pode convir o ódio de coisa alguma.” — source: odium alicuius rei Deo convenire non potest; without “não” the sentence reads as affirmative and reverses the chapter's thesis *(meaning)*
- `pt-BR/b1-ch069.md` [13]: “pois é impossível enumerar, uma a uma, as partes do infinito” → “pois é em si mesmo impossível enumerar as partes do infinito” — source: partes infiniti numerari secundum se impossibile est; the qualifier secundum se was replaced by an added “uma a uma”
- `pt-BR/b2-ch012.md` [4]: “E assim não seria por si mesma de ser necessário” → “E assim não seria necessária por si mesma” — non esset per seipsum necesse esse; “de ser necessário” is not grammatical Portuguese
- `pt-BR/b2-ch015.md` [8]: “chega-se a algo que é por si de ser necessário” → “chega-se a algo que é necessário por si” — per se necesse esse; “é por si de ser necessário” is not grammatical Portuguese
- `pt-BR/b2-ch015.md` [9]: “é por si de ser necessário, o que nunca pode ser por outro” → “é necessário por si, o que nunca pode ser por outro” — per seipsum necesse esse; same broken construction
- Rejected: pt-BR/b2-ch016.md [16], pt-BR/b2-ch034.md [4] — audit: repeated word “nada nada” — correct rendering of ex nihilo nihil fit (“do nada nada se faz”)
- Rejected: pt-BR/b2-ch002.md [5] — audit: 10 emphasis markers in source, 8 in pt-BR — mirati sunt was folded into the first italic span and the gloss scilicet philosophi placed outside it; the quotation and the gloss are both complete
- Rejected: pt-BR/b2-ch028.md [15] — audit: length outlier — the Sicut… ita nec construction is spelled out in full; nothing was added
- Rejected: pt-BR/b1-ch091.md [15] — “delectabar per singulos dies ludens coram eo” is Proverbs 8:30, not Proverbs 9 — the source reads Prov. 9; correcting the author's citation is not allowed
- Rejected: pt-BR/b1-ch090.md [2] — awkward in-chapter heading — it renders the source heading's own odd syntax literally; defensible

### Part 2 of 9, Round 2 (codex, full read)
Verdict: 5 meaning-level, 1 minor. Leitura integral dos 71 capítulos, notas e metadados pertinentes: cinco defeitos de sentido e um de concordância; nenhum defeito nos alertas mecânicos.
- `pt-BR/b1-ch095.md` [6]: “pois nada pode querer senão querendo a si mesma” → “pois Deus nada pode querer senão querendo a si mesmo” — O masculino seipsum refere-se a Deus; a tradução faz da própria vontade o objeto desse querer. *(meaning)*
- `pt-BR/b1-ch096.md` [8]: “nada odiastes do que fizestes” → “nada odiais do que fizestes” — Odisti é forma do verbo defectivo odi com sentido presente: a fonte afirma que Deus nada odeia, não apenas que nada odiou. *(meaning)*
- `pt-BR/b1-ch096.md` [10]: “Odiastes todos os que praticam a iniquidade” → “Odiais todos os que praticam a iniquidade” — Odisti, do verbo defectivo odi, tem aqui sentido presente; a tradução o desloca para o passado. *(meaning)*
- `pt-BR/b2-ch004.md` [9]: “considera-se primeiro as criaturas” → “consideram-se primeiro as criaturas” — Na construção passiva com se, o verbo deve concordar com o sujeito plural as criaturas.
- `pt-BR/b2-ch009.md` [6]: “assim como a potência ativa é algo que age, assim sua essência é algo que é.” → “assim como algo é agente por sua potência ativa, também é ente por sua essência.” — Potentia activa e essentia são instrumentais: algo age pela potência e é pela essência. A tradução transforma a potência e a essência em sujeitos. *(meaning)*
- `pt-BR/b2-ch028.md` [7]: “aquilo que existe por si mesmo é anterior” → “aquilo que existe em vista de si mesmo é anterior” — Propter se indica finalidade, em oposição a propter aliud; não significa existir por si, como princípio independente. *(meaning)*
- Rejected: pt-BR/b1-ch069.md [13]; pt-BR/b2-ch028.md [15] — Alertas de extensão da tradução. — A expansão decorre da construção portuguesa; os argumentos e qualificadores do latim estão preservados.
- Rejected: pt-BR/b2-ch002.md [5] — Diferença no número de marcadores de ênfase. — A reorganização sintática reúne segmentos da citação; a citação e as glosas permanecem completas e distintas.
- Rejected: pt-BR/b2-ch016.md [16]; pt-BR/b2-ch034.md [4] — Repetição de nada. — Do nada nada se faz traduz corretamente ex nihilo nihil fit; as duas ocorrências têm funções diferentes.

### Part 2 of 9, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of b1-ch068 to b2-ch036: one meaning defect, a lost negation in b1-ch089 [15]. Audit flags were already settled in earlier rounds; no new argument.
- `pt-BR/b1-ch089.md` [15]: “Portanto, o mal de coisa alguma pode ser um bem para ele.” → “Portanto, não pode ser um bem para ele o mal de coisa alguma.” — Source: Nullius igitur malum sibi potest esse bonum. With “coisa alguma” before the verb and no “não”, the sentence reads as affirmative and reverses the claim. Same pattern as the round-1 fix in b1-ch096 [3]. *(meaning)*
- Rejected: pt-BR/b2-ch003.md [8] — The work title “Sobre a origem da alma” is not italicized. — The source does not italicize “de origine animae” either, so the translation follows the source.
- Rejected: pt-BR/b2-ch028.md [8] — Job is cited as 41:2 here but as 41:11 for the same verse in b1-ch093 [13]. — Both references follow the source exactly; correcting the author's citations is not allowed.
- Rejected: pt-BR/b1-ch102.md [10] — “de si mesma” could be read as referring to the beatitude rather than to God (sui). — God is his own beatitude (ch. 101), so the reflexive is correct either way.

### Part 2 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos 14–16 de pt-BR/b1-ch089.md: a correção preserva a negação do latim e não introduz problemas; nenhum novo defeito encontrado.

### Part 3 of 9, Round 1 (claude, full read)
Verdict: 2 meaning-level, 3 minor. Full read of b2-ch037 to b2-ch078. The main findings are a reversed attribution of the agent-intellect thesis to Alexander and Avicenna (ch076) and an ambiguous rendering of 'in quo fiunt omnia intelligibilia' (ch078). The rest are a matter/form adjective slip, a 'matéria-prima' drift and a Latin OCR slip in Wisdom 7:23; all audit flags were dismissed.
- `pt-BR/b2-ch076.md` [3]: “tampouco o intelecto agente é um só em todos, como também afirmam Alexandre e Avicena, que não sustentam que o intelecto possível seja um só para todos.” → “tampouco o intelecto agente é um só em todos, contrariamente ao que afirmam também Alexandre e Avicena, os quais, no entanto, não sustentam que o intelecto possível seja um só para todos.” — In the source, 'ut Alexander etiam ponit, et Avicenna' reports their thesis that the agent intellect is one for all, a single separate substance. The PT says they hold that it is not one in all, which reverses their position. *(meaning)*
- `pt-BR/b2-ch050.md` [4]: “composto de matéria e forma individuais” → “composto de forma e de matéria individual” — The argument is about individual matter, as in the previous sentence ('ex forma et materia individuali'). The plural 'individuais' extends the adjective to the form.
- `pt-BR/b2-ch069.md` [13]: “a recepção da matéria-prima” → “a recepção da matéria primeira” — The source has 'materia prima'. The book renders it 'matéria primeira' throughout, and 'matéria-prima' means raw material in Portuguese.
- `la/b2-ch049.md` [12]: “omncaeles spiritus” → “omnes spiritus” — This is an unmistakable OCR slip. Wisdom 7:23 reads 'qui capiat omnes spiritus intelligibiles', and the PT already translates 'todos'.
- NOT APPLIED (old text not found exactly once (0)): - `pt-BR/b2-ch078.md` [4]: “*no qual se tornam todas as coisas inteligíveis*” → “*no qual se fazem todos os inteligíveis*” — The source reads 'in quo fiunt omnia intelligibilia': all the intelligibles come to be in the possible intellect. The PT can be read as 'in which all things become intelligible', which is the agent intellect's function.
- Rejected: pt-BR/b2-ch037.md [4], [7] — The audit flags the repeated word 'nada nada'. — 'Do nada nada se faz' correctly renders 'ex nihilo nihil fieri'.
- Rejected: pt-BR/b2-ch044.md [6] — The source has a parenthesis and the PT does not. — The parenthesis '(quae Origenes animata ponebat)' became a relative clause after a comma. The content is complete.
- Rejected: pt-BR/b2-ch058.md [14] — The emphasis markers differ in count. — The PT italicizes the work title *Dos dogmas eclesiásticos*, which is the house practice for titles. The quotation's italics are kept.
- Rejected: pt-BR/b2-ch038.md [14] — 'ex parte post' is rendered 'em direção ao presente'. — This is an interpretive gloss but correct in context: the next clause says the present is the terminus of the past.
- Rejected: pt-BR/b2-ch068.md [11] — 'adamas' is rendered 'diamante'. — The medieval sense of the word is debatable, so the literal rendering is a defensible choice.
- Rejected: pt-BR/b2-ch078.md [12] — The source cites 'III Physic.' where VIII would be expected. — The author and the edition are not corrected; the PT follows the source.

### Part 3 of 9, Round 2 (codex, full read)
Verdict: 7 meaning-level, 1 minor. Leitura integral dos 42 capítulos, b2-ch037 a b2-ch078, com notas, auditoria e metadados pertinentes: 7 defeitos de sentido e 1 menor; alertas mecânicos rejeitados.
- `pt-BR/b2-ch045.md` [12]: “de cada uma que eram” → “delas, individualmente, que eram” — A construção mistura «cada uma» com «eram boas». A correção preserva o sentido distributivo de «de singulis» e o plural da citação.
- `pt-BR/b2-ch072.md` [6]: “nem que o incorpóreo se une ao corpóreo” → “e que o incorpóreo não se une ao corpóreo” — «Neque sic incorporeum corporeo coniungi» nega que a união ocorra desse modo. «Nem que» desloca a negação para o entender e rompe a coordenação. *(meaning)*
- `pt-BR/b2-ch073.md` [19]: “embora possa haver múltiplos seres aquecidos” → “embora possa haver múltiplos atos de ser aquecido” — «Multiplex calefieri» designa a multiplicidade dos aquecimentos passivos, não a dos seres que são aquecidos. *(meaning)*
- `pt-BR/b2-ch073.md` [31]: “não recebe de novo algumas espécies inteligíveis” → “não recebe de novo espécie inteligível alguma” — «Non igitur de novo recipit aliquas species intelligibiles» exclui qualquer nova recepção; «não recebe algumas» restringe a negação a parte das espécies. *(meaning)*
- `pt-BR/b2-ch073.md` [38]: “não recebe algumas espécies inteligíveis” → “não recebe espécies inteligíveis” — «Non recipit aliquas species intelligibiles» nega a recepção de espécies provenientes de nossos fantasmas em geral, não apenas de algumas. *(meaning)*
- `pt-BR/b2-ch073.md` [38]: “nunca recebe algumas espécies dos fantasmas” → “nunca recebe espécie alguma dos fantasmas” — «Nunquam ... recipit aliquas species a phantasmatibus» conclui que nenhuma espécie é recebida dos fantasmas; a tradução limita indevidamente essa negação. *(meaning)*
- `pt-BR/b2-ch076.md` [21]: “as formas da arte não recebem a ação da arte, mas somente a semelhança formal” → “as formas da arte não adquirem a capacidade de agir da arte, mas somente sua semelhança formal” — «Non consequuntur actionem artis» significa que as formas produzidas não adquirem a operação própria da arte, como confirma a frase seguinte. Não significa que deixem de receber sua ação. *(meaning)*
- `pt-BR/b2-ch078.md` [4]: “no qual se tornam todas as coisas inteligíveis” → “no qual se fazem todos os inteligíveis” — «In quo fiunt omnia intelligibilia» apresenta os inteligíveis como aquilo que se faz no intelecto possível. A tradução atribui-lhe ambiguamente o tornar as coisas inteligíveis, função do agente. Retoma a correção anterior não aplicada, com o trecho exato. *(meaning)*
- Rejected: pt-BR/b2-ch037.md [4], [7] — Repetição de «nada nada» apontada pela auditoria. — «Do nada nada se faz» traduz corretamente «ex nihilo nihil fieri»; as duas ocorrências têm funções distintas.
- Rejected: pt-BR/b2-ch044.md [6] — Ausência dos parênteses presentes na fonte. — O conteúdo foi preservado na oração «que Orígenes considerava animados», com concordância que identifica os corpos como antecedente.
- Rejected: pt-BR/b2-ch058.md [14] — Número diferente de marcadores de ênfase. — A diferença decorre do destaque do título «Dos dogmas eclesiásticos»; a ênfase da citação foi preservada.

### Part 3 of 9, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of the 42 chapters b2-ch037 to b2-ch078 with their translator's notes: no new defects, and the Round 2 fixes are applied correctly.
- Rejected: pt-BR/b2-ch039.md [4] — 'substantiae immateriales, et absque contrarietate' is rendered as two groups: 'as substâncias imateriais e as isentas de contrariedade'. — The Latin allows this reading. 'Absque contrarietate' can point to the heavenly bodies, which have no contrary, as in ch040 [6], so the split is defensible.
- Rejected: pt-BR/b2-ch060.md [7] — 'Retórica' is not italicized, although the book italicizes work titles elsewhere. — The source writes 'in sua rhetorica' without italics as a running mention, not a cited title. The PT follows the source.
- Rejected: pt-BR/b2-ch076.md [16] — 'Et similiter videmus in aliis animalibus perfectis quod quaedam ignobilia...' is recast with 'ao passo que'. — The contrast between perfect animals, which need an agent of their own kind, and lower animals generated by the sun alone keeps the argument's sense.
- Rejected: pt-BR/b2-ch037.md [4], [7]; b2-ch044.md [6]; b2-ch058.md [14] — The mechanical audit flags a repeated word, a missing parenthesis and a different count of emphasis markers. — Earlier rounds already rejected these flags, and there is no new argument.

### Part 4 of 9, Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Read all 47 chapters (b2-ch079 to b3-ch024) clause by clause, with their translator's notes and the audit flags; found no objective defects.
- Rejected: pt-BR/b2-ch079.md [17] — Audit: emphasis markers differ (source 2, pt-BR 4) — The extra pair italicizes the work title *Dos dogmas eclesiásticos*. The file italicizes work titles throughout, and the quotation's italics match the source.
- Rejected: pt-BR/b3-ch007.md [6] — Audit: repeated word “age age” — “tudo o que age age enquanto existe em ato” renders “quicquid agit, agit” correctly. The repetition is grammatical: subject clause followed by its verb.
- Rejected: pt-BR/b2-ch098.md [4], [15] — *Sobre a alma* here, *Da alma* in the neighbouring chapters — Both are accepted Portuguese titles for De anima. Each file is internally consistent and the Key Terms table sets no rule for it.
- Rejected: pt-BR/b2-ch082.md [19] — Duplicated clause “também tem operação por si” — The source repeats “et per se habet operationem”. The translation keeps the source as it is.
- Rejected: pt-BR/b3-ch020.md [9] — “virtuosus” rendered as “poderoso” — In this text virtus often means power, and the list pairs it with “sábio e operante”. This is a defensible reading.
- Rejected: pt-BR/b3-ch022.md [13] — Psalm 8 verse addressed to God with “vós” (“submetestes”) — The vós form is correctly conjugated and is a recognized reverential way to address God in Portuguese. No other address to God in the file conflicts with it.

### Part 4 of 9, Round 2 (codex, full read)
Verdict: 3 meaning-level, 1 minor. Lidos integralmente os 47 capítulos, suas notas, os metadados pertinentes e o diário: três correções de sentido e uma de regência; ambos os alertas mecânicos rejeitados.
- `pt-BR/b2-ch079.md` [5]: “quanto mais considera as coisas imateriais” → “quanto mais imateriais são as coisas que considera” — O comparativo em 'magis immaterialia' qualifica a imaterialidade das coisas consideradas, não a quantidade ou frequência da consideração. *(meaning)*
- `pt-BR/b2-ch083.md` [40]: “A essa verdade concorda” → “Com essa verdade concorda” — Nesse sentido, a regência é 'concordar com'.
- `pt-BR/b2-ch089.md` [10]: “tem seu fundamento, enquanto sujeito próprio, no espírito” → “tem seu fundamento, como em seu sujeito próprio, no espírito” — 'Sicut in proprio subiecto' indica que o espírito é o sujeito no qual se funda o poder formativo; 'enquanto sujeito próprio' atribui indevidamente essa condição ao poder. *(meaning)*
- `pt-BR/b2-ch092.md` [9]: “como existentes por si mesmas” → “como existentes em vista de si mesmas” — 'Propter se existentia' exprime finalidade: as coisas mais nobres existem em vista de si mesmas. Não se trata aqui de subsistência por si. *(meaning)*
- Rejected: pt-BR/b2-ch079.md [17] — Diferença na quantidade de marcadores de ênfase. — O par adicional destaca o título da obra; o destaque da citação foi preservado.
- Rejected: pt-BR/b3-ch007.md [6] — Repetição 'age age'. — Os verbos pertencem a orações diferentes: 'tudo o que age' é o sujeito de 'age enquanto existe em ato'.
- Rejected: pt-BR/b2-ch085.md [13] — 'Nem qualquer substância intelectual' poderia parecer negar que a alma seja uma substância intelectual. — A construção admite a elipse de 'ser corpo', recuperável pelo contexto; não constitui uma negação inequívoca da natureza intelectual da alma.

### Part 4 of 9, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Read all 47 chapters (b2-ch079 to b3-ch024), their translator's notes and both audit flags. One ambiguous pronoun in b2-ch098 [9] invites a reversed causal reading; nothing else is objectively wrong.
- `pt-BR/b2-ch098.md` [9]: “Deus, por sua vez, conhece-as como sua causa própria” → “Deus, por sua vez, conhece-as enquanto é causa própria delas” — Source: 'Deus autem cognoscit eas sicut propria causa', meaning God knows them as being their proper cause. With God as subject, 'como sua causa própria' reads most naturally as 'as his own cause', which reverses the causal relation. *(meaning)*
- Rejected: pt-BR/b2-ch079.md [17] — Audit: emphasis markers differ (source 2, pt-BR 4) — The extra pair italicizes the work title *Dos dogmas eclesiásticos*. The quotation's italics match the source. Already rejected in rounds 1 and 2.
- Rejected: pt-BR/b3-ch007.md [6] — Audit: repeated word “age age” — It renders 'quicquid agit, agit': the subject clause is followed by its verb. Grammatical, and already rejected in rounds 1 and 2.
- Rejected: pt-BR/b2-ch091.md [10], b2-ch094.md [7], b2-ch096.md — phantasma rendered “imagens da imaginação” here but “fantasmas” in neighbouring chapters — Each file is internally consistent and the Key Terms table sets no rule for phantasma. The sense is unchanged.
- Rejected: pt-BR/b2-ch098.md [13] — “de modo mais universal e mais restrito” looks self-contradictory — It follows the source 'universaliori modo et contractiori', which describes the range across the order of substances. The literal rendering is faithful.

### Part 4 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente os parágrafos 8–10 de pt-BR/b2-ch098.md contra o latim: a correção identifica corretamente Deus como causa própria das substâncias separadas; nenhum defeito encontrado.

### Part 5 of 9, Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Read b3-ch025 to b3-ch077 in full: one pronoun referent error (Platão/Aristóteles, ch076), two grammar slips (ch044, ch045), one quotation drawn toward familiar Bible wording (ch051), one note wording slip (ch027); the two audit flags are not defects.
- `pt-BR/b3-ch076.md` [3]: “A terceira providência, por sua vez, ele a estabelece” → “A terceira providência, por sua vez, Platão a estabelece” — source 'Tertiam vero providentiam ponit' has Plato as subject; after the sentence on Aristotle, 'ele' points to Aristóteles *(meaning)*
- `pt-BR/b3-ch045.md` [8]: “aquele pelo qual se pode tornar-se todas as coisas, e o agente, aquele pelo qual se pode produzir todas as coisas” → “aquele pelo qual é possível tornar-se todas as coisas, e o agente, aquele pelo qual é possível produzir todas as coisas” — 'se pode tornar-se' doubles the pronoun and 'se pode produzir todas as coisas' breaks passive concord; 'est omnia fieri / omnia facere' = é possível tornar-se / produzir
- `pt-BR/b3-ch044.md` [5]: “Isso não é possível a nenhum homem conhecer pelos princípios” → “Nenhum homem pode conhecer isso pelos princípios” — ungrammatical fronted object; source 'Quod non est possibile aliquem hominem scire'
- `pt-BR/b3-ch051.md` [10]: “bebei o vinho que preparei para vós” → “bebei o vinho que misturei para vós” — source quotes 'vinum quod miscui vobis'; keep the source's wording, not the familiar Bible rendering
- `pt-BR/b3-ch027.md`: ““Quiliastas” deriva do grego que significa “mil”” → ““Quiliastas” deriva do termo grego que significa “mil”” — translator's note: 'do grego que significa' lacks a noun and reads as if the Greek language meant 'thousand'
- Rejected: pt-BR/b3-ch027.md [14] — audit: source parenthesis '(quasi millenarii)' missing — the content is kept as 'isto é, milenaristas'; replacing the parenthesis with an apposition is a style choice
- Rejected: pt-BR/b3-ch029.md [4] — audit: emphasis markers 6 vs 4 — the source's two italic spans for Cícero's definition ('Est enim gloria' + 'frequens… laude') are joined into one italic span in reordered Portuguese; all quoted text stays italic
- Rejected: pt-BR/b3-ch048.md [6] — 'vix in ultima aetate' rendered 'dificilmente … antes da velhice' — both say that perfection in speculation comes, if at all, only in old age; the argument is unchanged
- Rejected: pt-BR/b3-ch040.md [9], b3-ch057.md [7], b3-ch063.md [10], b3-ch068.md [9], b3-ch075.md [17] — Scripture references that differ from modern chapter numbering — they reproduce the source's own references; correcting the author's citations is out of scope

### Part 5 of 9, Round 2 (codex, full read)
Verdict: 7 meaning-level, 2 minor. Leitura integral dos 53 capítulos, b3-ch025 a b3-ch077, com notas, metadados pertinentes e histórico: sete defeitos de sentido e dois menores.
- `pt-BR/b3-ch042.md` [10]: “falando por si, o intelecto não recebe algo senão de modo inteligível” → “o intelecto não recebe por si algo senão de modo inteligível” — “Per se loquendo” qualifica a recepção própria do intelecto; não significa falar por si. *(meaning)*
- `pt-BR/b3-ch046.md` [9]: “nosso intelecto possível, porém, o entende pela espécie inteligível” → “nosso intelecto possível, porém, entende o que ele próprio é pela espécie inteligível” — O latim contrapõe dois modos de autoconhecimento. O pronome “o” retoma indevidamente o que são as substâncias separadas. *(meaning)*
- `pt-BR/b3-ch047.md` [4]: “O homem não me verá e viverá” → “Nenhum homem me verá e continuará vivo” — “Non videbit me homo et vivet” nega que alguém veja Deus e permaneça vivo; a tradução permite afirmar que o homem não verá Deus, mas viverá. *(meaning)*
- `pt-BR/b3-ch051.md` [3]: “entender a substância divina, que todas as mentes naturalmente desejam” → “entender a substância divina, o que todas as mentes naturalmente desejam” — O relativo neutro “quod” retoma o ato de entender a substância divina, não a própria substância. *(meaning)*
- `pt-BR/b3-ch057.md` [7]: “a medida do homem e a do anjo é a mesma” → “a medida do homem é a mesma que a do anjo” — Corrige a concordância do verbo no singular com o sujeito composto, preservando a identidade das medidas.
- `pt-BR/b3-ch062.md` [9]: “julgue haver nela algum mal ou algo melhor do que ela” → “julgue haver nela algum mal ou existir algo melhor do que ela” — O latim exclui tanto julgar haver mal naquela visão quanto julgar existir algo superior a ela. “Nela” não deve restringir a segunda alternativa. *(meaning)*
- `pt-BR/b3-ch062.md` [14]: “Não será abalado para sempre aquele que habita em Jerusalém” → “Jamais será abalado aquele que habita em Jerusalém” — “Non commovebitur in aeternum” significa que nunca será abalado, não que o abalo deixará de durar para sempre. *(meaning)*
- `pt-BR/b3-ch065.md` [6]: “é causa deste outro homem, falando por si” → “é causa por si deste outro homem” — “Per se loquendo” qualifica a causalidade por si, em oposição à causalidade por acidente; não atribui fala ao homem. *(meaning)*
- `pt-BR/b3-ch068.md` [8]: “conserva contínua e sempre no ser” → “conserva continuamente e sempre no ser” — “Contínua” não funciona como advérbio nessa coordenação; falta o sufixo de “continuamente”.
- Rejected: pt-BR/b3-ch027.md [14] — Ausência dos parênteses de “(quasi millenarii)”. — O conteúdo está integralmente preservado na aposição “isto é, milenaristas”, conforme já reconhecido na rodada anterior.
- Rejected: pt-BR/b3-ch029.md [4] — Quantidade diferente de marcadores de ênfase. — A reorganização da definição de Cícero reúne dois segmentos num único trecho em itálico, sem perda de conteúdo ou destaque.

### Part 5 of 9, Round 3 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Read b3-ch025 to b3-ch077 in full, source beside translation: one meaning-level fix (ambiguous negation in ch075 [10]); the audit flags were already resolved in earlier rounds.
- `pt-BR/b3-ch075.md` [10]: “Assim, todos os indivíduos não podem perecer, embora algum deles pereça.” → “Assim, nem todos os indivíduos podem perecer, embora algum deles pereça.” — source 'non possunt omnia individua deficere' denies that all can fail; 'todos … não podem' reads in Portuguese as 'none can perish', which contradicts the concessive clause *(meaning)*
- Rejected: pt-BR/b3-ch046.md [9] — 'entende a si mesmo como às outras coisas': crase before a direct object — this is a prepositioned direct object after 'como', used to disambiguate; it is accepted usage, not an error
- Rejected: pt-BR/b3-ch044.md [6] — 'a menos que sejam privados da capacidade para isso' expands 'nisi sint orbati' inside the quotation — an interpretive rendering of Aristotle's 'maimed' (for virtue); the sense is unchanged
- Rejected: pt-BR/b3-ch053.md [9], ch056, ch059, ch064 vs ch045, ch046 — the De anima title appears as 'da Alma' in some files and as 'Sobre a alma' in others — each file is internally consistent; the house rules do not require normalizing across files

### Part 5 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos 9–11 de pt-BR/b3-ch075.md contra o latim: a correção da negação está correta, sem novos defeitos nos trechos apresentados.

### Part 6 of 9, Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of b3-ch078–b3-ch126: translation is faithful and complete; one fix for an ambiguous referent ('o primeiro') in ch092 [4].
- `pt-BR/b3-ch092.md` [4]: “ao qual já havia enviado outro servo, sem que o primeiro o saiba” → “ao qual já havia enviado outro servo, sem que o servo que recebe a ordem o saiba” — source 'illo ignorante' refers to the servant now being sent; 'o primeiro' reads as the servant sent first (the other one), inverting who is ignorant
- Rejected: pt-BR/b3-ch101.md [3] — 'astrologus' rendered 'astrônomo' while ch084/ch085 use 'astrólogo' — medieval astrologus covers astronomy, and eclipse prediction is astronomical; the choice is defensible in context
- Rejected: pt-BR/b3-ch120.md [13] — 'haec tamen positio' rendered 'a primeira dessas posições' — the next sentence shows Thomas means the world-soul position, which is the first one named; the rendering is correct
- Rejected: pt-BR/b3-ch083.md [3], b3-ch118.md [7] — Scripture references (Jó 33; Êxodo 20:2 for 'Audi Israel') do not match the quoted verses — they are the source's own references; the author and the edition are not corrected
- Rejected: pt-BR/b3-ch090.md [10] — 'Et infra 17' rendered 'mais adiante, em 15:17' — the verse is correctly identified and the reference is not changed
- Rejected: pt-BR/b3-ch120.md [27] — bare verse numbers 3, 7, 8 expanded to 'Êxodo 20:3' and so on — the same references stated in full; the audit's Scripture check passed

### Part 6 of 9, Round 2 (codex, full read)
Verdict: 5 meaning-level, 0 minor. Leitura integral dos 49 capítulos b3-ch078–b3-ch126, incluindo notas, auditoria, diário e títulos correspondentes: cinco defeitos de sentido, dois deles no book.json.
- `book.json`: “por sua alma nos mover, como dizem alguns” → “pelo poder da alma que o move, como dizem alguns” — O título latino do capítulo 87 refere-se à alma que move o corpo celeste, não à alma movendo diretamente a nós. *(meaning)*
- `book.json`: “Capítulo 112 — Que as criaturas racionais são governadas por si mesmas” → “Capítulo 112 — Que as criaturas racionais são governadas em vista de si mesmas” — Propter seipsas indica a finalidade do governo divino; 'por si mesmas' atribui às criaturas a autoria desse governo. *(meaning)*
- `pt-BR/b3-ch080.md` [17]: “e do príncipe dos persas e dos gregos” → “e do príncipe dos persas e do príncipe dos gregos” — O latim enumera o príncipe dos persas e o dos gregos como distintos; a tradução atribui ambos os povos a um único príncipe. *(meaning)*
- `pt-BR/b3-ch097.md` [13]: “as nuvens se condensam em orvalho” → “as nuvens se adensam com o orvalho” — Nubes rore concrescunt descreve as nuvens adensando-se com o orvalho, não se transformando em orvalho. *(meaning)*
- `pt-BR/b3-ch119.md` [5]: “alimentado ou saciado” → “alimentado ou dessedentado” — Pascitur vel potatur distingue receber alimento de receber bebida; 'saciado' deixa de explicitar o segundo ato. *(meaning)*
- Rejected: pt-BR/b3-ch094.md [5] — A expressão 'o que foi demonstrado anteriormente' parece afirmar que já se demonstrou a limitação da providência. — A aparente incongruência está no próprio latim, 'Quod prius fuit ostensum'; não há fundamento para corrigir o autor ou identificar um erro inequívoco de OCR.
- Rejected: pt-BR/b3-ch118.md [4] — 'Não crê em Deus' poderia confundir dar crédito a Deus com acreditar em sua existência. — Em português, crer em alguém também significa dar-lhe crédito; o contexto da submissão intelectual permite essa leitura de 'non credit Deo'.

### Part 6 of 9, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of b3-ch078–b3-ch126 (49 chapters, notes, journal, book.json): one minor concord fix in ch125 [12]; no meaning-level defects.
- `pt-BR/b3-ch125.md` [12]: “por dispensa, foram permitidos ter várias esposas e concubinas e repudiar a esposa” → “por dispensa, foi permitido ter várias esposas e concubinas e repudiar a esposa” — source 'indultum videtur uxores plures habere... et uxoris repudium'; the subject is a pair of infinitives, so the participle stays in the impersonal singular ('foi permitido'), not the masculine plural
- Rejected: pt-BR/b3-ch097.md [6], b3-ch104.md [14] — 'São Dionísio' and 'Santo Agostinho' add an honorific the source lacks — the honorific does not change what the reader learns; this is a style choice, not a defect
- Rejected: pt-BR/b3-ch080.md [10] — 'sedes... iudicas' (2nd person singular) rendered with 'Vós' — reverential vós for God is consistent across these files (e.g. ch089 [5], ch112 [13]); not a wrong person
- Rejected: pt-BR/b3-ch085.md [17] — 'semper' apparently dropped in 'que é má precisamente por não estar de acordo com a reta razão' — 'precisamente' carries the same sense (the choice is bad by the very fact it departs from right reason); nothing is lost
- Rejected: pt-BR/b3-ch084.md / b3-ch104.md / b3-ch120.md — work titles vary across files ('da Alma' vs 'de Sobre a alma', 'Cidade de Deus' vs 'A cidade de Deus') — each file is internally consistent and the house rules forbid normalizing across files

### Part 6 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos 11–12 de pt-BR/b3-ch125.md contra o latim: a correção para “foi permitido” está correta e não introduziu problemas; nenhum novo defeito encontrado.

### Part 7 of 9, Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of b3-ch127 to b4-ch009 (46 files): one Scripture quotation in b3-ch154 [7] restored to the source's Vulgate wording; all three audit flags checked and rejected.
- `pt-BR/b3-ch154.md` [7]: “*a sabedoria de Deus, através das gerações, passa para as almas santas” → “*a sabedoria de Deus, através das nações, passa para as almas santas” — source quotes the Vulgate 'per nationes'; 'gerações' follows modern Bible versions instead of the source's own wording *(meaning)*
- Rejected: pt-BR/b3-ch137.md [5] — Length outlier: pt-BR is 161% of the source's word count — The paragraph is complete and faithful; the extra length comes from ordinary Portuguese periphrasis of a short Latin sentence.
- Rejected: pt-BR/b4-ch004.md [18] — Emphasis markers 12 in source, 10 in pt-BR — The source splits '*ipse*, inquiens, *salvum faciet…*' around the speech verb; the translation puts 'dizendo' before the quotation and italicizes the whole quotation once. No content is lost.
- Rejected: pt-BR/b4-ch008.md [4] — Repeated word 'que que' — 'do que que o Filho seja excluído' is the comparative 'do que' followed by the conjunction 'que'. It is grammatical and the sense is clear.
- Rejected: pt-BR/b3-ch141.md [8] — PT has 'aos interiores' where the source reads 'ad inferiora' — The context (exterior goods to interior ones, body to soul) supports the Leonine reading 'interiora', which the translation follows. The translation is correct.
- Rejected: pt-BR/b3-ch132.md [22], [26]; b3-ch144.md [13]; b4-ch005.md [5] — Scripture references that do not match the verse quoted (1 Tim 4, Rom 12, Apoc 22:27, Exod 20) — The translation reproduces the references as the source gives them; the author and the edition are not corrected.

### Part 7 of 9, Round 2 (codex, full read)
Verdict: 5 meaning-level, 0 minor. Leitura integral dos 46 capítulos, respectivas notas, metadados e diário: cinco defeitos de sentido; os três alertas mecânicos não exigem correção.
- `pt-BR/b3-ch154.md` [3]: “pois é de Deus que temos fé” → “pois nossa fé diz respeito a Deus” — Em 'de Deo enim fidem habemus', Deus é o objeto da fé; não se afirma aqui sua procedência. *(meaning)*
- `pt-BR/b3-ch154.md` [24]: “para que os homens não sejam enganados por essas coisas e acreditem na mentira” → “para que os homens, enganados por essas coisas, não acreditem na mentira” — Em 'ne per huiusmodi homines decepti mendacio credant', a negação rege 'acreditem na mentira'. A coordenação portuguesa deixa essa ação fora do alcance claro da negação. *(meaning)*
- `pt-BR/b4-ch001.md` [11]: “não pode elevar-se plenamente à contemplação” → “não pode de modo algum elevar-se à contemplação” — 'Omnino elevari non potest' exprime impossibilidade nesse estado, conforme a oposição precedente entre somente crer e contemplar; não apenas impossibilidade de contemplação plena. *(meaning)*
- `pt-BR/b4-ch007.md` [27]: “antes do nascimento da Virgem” → “antes de Cristo nascer da Virgem” — 'Ante nativitatem ex virgine' refere-se ao nascimento de Cristo a partir da Virgem, não ao nascimento da própria Virgem. *(meaning)*
- `pt-BR/b4-ch008.md` [4]: “o que, contudo, é manifestamente provado pelo testemunho da Escritura” → “embora o testemunho da Escritura prove manifestamente que o Filho é verdadeiro Deus” — O que a Escritura prova é a divindade do Filho. Na redação portuguesa, 'o que' retoma a afirmação negativa imediatamente anterior, invertendo o argumento. *(meaning)*
- Rejected: pt-BR/b3-ch137.md [5] — Extensão de 161% em relação ao latim. — Todas as cláusulas correspondem ao original; a expansão decorre da construção portuguesa.
- Rejected: pt-BR/b4-ch004.md [18] — Diferença no número de marcadores de ênfase. — A tradução desloca 'dizendo' para antes da citação, reunindo dois segmentos em itálico sem perda de conteúdo.
- Rejected: pt-BR/b4-ch008.md [4] — Repetição 'que que'. — São o término da locução comparativa 'do que' e a conjunção da oração seguinte; a construção é gramatical.
- Rejected: pt-BR/b4-ch001.md [3], [14], [17] — Tradução de 'vix' por 'apenas'. — 'Apenas' admite o sentido de 'mal' ou 'escassamente'; o contexto explicita a limitação e a dificuldade do conhecimento. É uma escolha defensável.

### Part 7 of 9, Round 3 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Read all 46 files of part 7 (b3-ch127 to b4-ch009) with their footnotes: one meaning fix (Jas 1:13 restored to the source's Vulgate wording) and one minor fix (b3-ch130 [5] clause structure); all three audit flags checked and rejected.
- `pt-BR/b3-ch162.md` [8]: “pois Deus não pode ser tentado pelo mal” → “pois Deus não é tentador para o mal” — The source quotes the Vulgate 'Deus enim intentator malorum est', which says God is not a tempter to evil. That reading is what supports the chapter's thesis that God causes no one to sin. 'Não pode ser tentado pelo mal' follows the Greek and modern Bible versions, not the source's own wording. *(meaning)*
- `pt-BR/b3-ch130.md` [5]: “é conveniente que pareçam pertencer ao estado de perfeição” → “parecem pertencer convenientemente ao estado de perfeição” — 'convenienter ad perfectionis statum pertinere videntur' means 'they seem fittingly to belong'. The translation turns the adverb into a main clause ('it is fitting that they seem').
- Rejected: pt-BR/b3-ch137.md [5] — Length outlier, 161% of the source — Every clause matches the source; the extra length is ordinary Portuguese periphrasis.
- Rejected: pt-BR/b4-ch004.md [18] — Emphasis markers 12 in source, 10 in pt-BR — 'dizendo' is moved before the quotation, so the source's two italic segments become one. No content is lost.
- Rejected: pt-BR/b4-ch008.md [4] — Repeated word 'que que' — It is the comparative 'do que' followed by the conjunction 'que'. The construction is grammatical and the sense is clear.
- Rejected: pt-BR/b3-ch136.md [15] — 'illud melius sit' rendered as 'o matrimônio seja melhor' — The context and the following quotation ('non omnes capiunt verbum hoc') support reading 'illud' as marriage.

### Part 7 of 9, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Verificadas as duas alterações e lidos integralmente os seis parágrafos apresentados, em confronto com o latim; nenhum defeito adicional encontrado.
- Rejected: pt-BR/b3-ch162.md [8] — Possível necessidade de restaurar «Deus não pode ser tentado pelo mal». — A leitura ativa «não é tentador para o mal» é defensável para o latim citado, «intentator malorum», e corresponde ao argumento imediato; não cabe substituí-la pela redação de versões modernas.

### Part 8 of 9, Round 1 (claude, full read)
Verdict: 4 meaning-level, 0 minor. Read b4-ch010 to b4-ch048 in full against the Latin. Fixed a reversed causal 'cum' (ch040), a wrong antecedent in the Cyril quotation (ch024), a dropped 'ideo' that reads as a negation (ch014), and 'habitu' rendered so the garment sense the argument depends on is lost (ch037). The audit flags are not defects.
- `pt-BR/b4-ch040.md` [15]: “a alma, embora seja mais nobre que o corpo, não é suposto do corpo” → “a alma, por ser mais nobre que o corpo, não é suposto do corpo” — Source says 'cum sit nobilior corpore'. Here 'cum' is causal: the nobler one is form, not suppositum, and the objection's conclusion about the divinity depends on that. 'embora' turns it into a concession and breaks the argument. *(meaning)*
- `pt-BR/b4-ch024.md` [7]: “e dela emana, assim como também de Deus Pai” → “e dele emana, assim como também de Deus Pai” — Source says 'profluit ab eo'. 'eo' is masculine or neuter and cannot refer to 'veritas'. Cyril means the Spirit flows from Him (the Son), and Aquinas cites it for that reason. *(meaning)*
- `pt-BR/b4-ch014.md` [11]: “Não se diz, porém, que a sabedoria divina é sua essência, ao passo que em nós a sabedoria acrescenta algo à essência, como se a sabedoria divina fosse inferior à nossa, mas porque” → “Se se diz, porém, que a sabedoria divina é sua essência, ao passo que em nós a sabedoria acrescenta algo à essência, não é como se a sabedoria divina fosse inferior à nossa, mas porque” — Source says 'Non autem ideo dicitur quod … quasi … sed quia'. It denies a reason, not the statement. With 'ideo' dropped, the Portuguese reads as if it were not said that divine wisdom is His essence. *(meaning)*
- `pt-BR/b4-ch037.md` [13]: “*Encontrado em seu aspecto como homem*” → “*Encontrado em seu hábito como homem*” — The chapter says the error took its occasion from 'habitu' read as a garment, and goes on to explain the 'veste' metaphor. 'aspecto' hides the word that carries the clothing sense. 'hábito' keeps both senses, as the Latin does. *(meaning)*
- Rejected: pt-BR/b4-ch034.md [7] — Emphasis and parenthesis counts differ from the source. — The single italic span was split into separate quotations, and '(aut ad aliquem aliorum prophetarum)' became a comma clause. All content is kept.
- Rejected: pt-BR/b4-ch034.md [12] — Emphasis count differs. — The quotation '*exivi*, inquit, *a patre…*' was joined into one italic span with 'diz' after it. Nothing is lost.
- Rejected: pt-BR/b4-ch042.md [4] — Extra emphasis markers. — The retained Greek *logos* is italicized, as the house rule requires.
- Rejected: pt-BR/b4-ch038.md [11] — The source parenthesis is missing. — The parenthetical about 'co' is rendered with em dashes inside the quotation. Its content is complete.
- Rejected: pt-BR/b4-ch037.md [11] — Length outlier (174%). — The paragraph is complete and faithful. The extra length is ordinary Portuguese expansion of a short Latin sentence.
- Rejected: pt-BR/b4-ch029.md [15] — Editor's inline note. — Kept in place, with the Latin reading *ipsius* unchanged and the editor's words translated.

### Part 8 of 9, Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Lidos integralmente os 39 capítulos, suas notas e os alertas mecânicos; encontrada uma omissão de nome no título do sumário.
- `book.json`: “Capítulo 34 — O erro de Teodoro de Mopsuéstia sobre a união do Verbo com o homem” → “Capítulo 34 — O erro de Teodoro de Mopsuéstia e de Nestório sobre a união do Verbo com o homem” — O título latino inclui expressamente 'et Nestorii', preservado no capítulo, mas omitido no sumário em português. *(meaning)*
- Rejected: pt-BR/b4-ch022.md [7] — “Livre é aquele que é causa de si” poderia sugerir que alguém causa sua própria existência. — O contexto imediato delimita a expressão à ação voluntária que procede do próprio agente; a formulação é defensável nesse sentido.

### Part 8 of 9, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of part 8: checked the one book.json change (ch. 34 title gains 'e de Nestório') against the Latin title; it is correct, and no other text was touched.
- Rejected: book.json, b4-ch034 pt-BR title — The pt-BR title now names Nestorius, but the en-US title does not. — The canonical Leonine title is 'De errore Theodori Mopsuesteni et Nestorii circa unionem Verbi ad hominem', and the chapter heading keeps it. The English title omits the name. The previous round's addition follows the source, and the wording 'e de Nestório' is grammatical and consistent with the other titles.

### Part 9 of 9, Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of b4-ch049 to b4-ch097 against the Latin: one minor fix (duplicated “mesmo” in ch081 [7]); references, footnotes and the journal's claims for chapters 85–97 check out.
- `pt-BR/b4-ch081.md` [7]: “permanece o mesmo mesmo depois de as coisas se corromperem” → “permanece o mesmo ainda depois de as coisas se corromperem” — source: virtus divina maneat eadem etiam rebus corruptis; “o mesmo mesmo” reads as a duplicated word; “ainda” renders etiam without the repetition
- Rejected: pt-BR/b4-ch069.md [8] — audit: 10 emphasis markers in source, 8 in pt-BR — the source's adjacent *Prima* … *dies azymorum* are merged into one italic span *primeiro dia dos Ázimos*; all quoted text stays in italics, nothing is lost
- Rejected: pt-BR/b4-ch050.md [12] — “senão por alguma falha” for nisi propter aliquod peccatum, then “algum pecado” in the conclusion — in the general premise peccatum means any failure to reach an end (as in ch051 [8], [10]); “falha” is a defensible rendering and the conclusion keeps “pecado”
- Rejected: pt-BR/b4-ch051.md [5] — “nem todos pecamos em Adão” might suggest that some did sin — the Latin Non igitur in Adam omnes peccavimus has the same scope (non omnes); the rendering is faithful
- Rejected: pt-BR/b4-ch069.md [6] — Mateus 25:17 (the institution narrative is 26:17) — the source reads Matth. 25:17; the edition is not corrected
- Rejected: pt-BR/b4-ch063.md [8] — ‘hic est corpus meum’ rendered “aqui está meu corpo” — the adverbial reading of hic (“here is”) is the standard one and matches the English reference

### Part 9 of 9, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral dos 49 capítulos, notas, auditoria, journal e campos pertinentes de book.json: dois defeitos de sentido e um desvio terminológico.
- `pt-BR/b4-ch083.md` [23]: “Ele o alimentará com o pão da vida” → “Ela o alimentará com o pão da vida” — O sujeito de cibabit é a sabedoria personificada, retomada também por de ipsa etiam sapientia; o pronome masculino muda o referente. *(meaning)*
- `pt-BR/b4-ch084.md` [5]: “tornando-o conforme ao corpo de sua glória” → “tornando-o conforme ao corpo de sua claridade” — O latim traz claritatis; a tabela de termos estabelece claridade para claritas nas propriedades dos corpos glorificados.
- `pt-BR/b4-ch097.md` [8]: “a consumação daquilo que não deve permanecer” → “a destruição daquilo que não deve permanecer” — Consumptio designa aqui a destruição das coisas pelo fogo, não sua consumação ou conclusão. *(meaning)*
- Rejected: pt-BR/b4-ch069.md [8] — Diferença na quantidade de marcadores de ênfase. — A tradução reúne Prima e dies azymorum num único trecho em itálico, sem perder texto ou destaque.
- Rejected: pt-BR/b4-ch060.md, nota [^86] — Possível nota meramente repetitiva. — A nota explicita o significado lexical de Cristo como Ungido, esclarecendo a relação entre os termos; não é apenas comentário doutrinal.

### Part 9 of 9, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of b4-ch083 [22–24], b4-ch084 [4–6] and b4-ch097 [7–9] with their notes: the three round-2 fixes (Ela, claridade, destruição) are correct, and no new defects were found.
- Rejected: pt-BR/b4-ch083.md [23] — “Ela” opens the Sirach quotation with no feminine antecedent in the sentence itself — Thomas introduces the quotations as said of wisdom, and “Também da própria sabedoria” confirms that subject; the feminine matches Ecclus 15:2–3, where wisdom is the subject.
- Rejected: pt-BR/b4-ch084.md [6] — “parece que deve ter a mesma matéria” for videtur quod habeat eandem materiam adds a modal — In this context “deve ter” reads as an inference, not as an obligation; the argument and its conclusion are unchanged.
- Rejected: pt-BR/b4-ch097.md [8] — “destruição” for consumptio loses the link to consumptivum (“o que consome”) — The sense is right: fire destroys what will not remain in the future state. The earlier “consumação” said the opposite; keeping the same root in both words is a style choice, not a defect.
- Rejected: pt-BR/b4-ch097.md [9] — “criação corporal” for creatura corporalis — Taken collectively, “criação corporal” means the corporeal creation and does not change the sense.
