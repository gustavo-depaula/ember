
## Termos

| Abbot John | abade João | Monge citado no capítulo 26. |
| Lycus | Lico | Cidade próxima ao deserto onde vive o abade João. |
| hundredfold | cêntuplo | Também “cem vezes”, conforme a construção da frase. |
| king's highway / royal road | estrada do rei / estrada real | Imagem do caminho espiritual reto. |

## Decisões

- Concluída a tradução de `ch022.md`, parágrafos 75–83, encerrando a Conferência 24 e a obra.
- Acrescentada a nota do tradutor `[^3]` para esclarecer a contagem antiga nos dedos e a passagem da mão esquerda para a direita na representação do número cem.
- Lido “a single field of house” como “a single field or house”, vertido por “um único campo ou casa”, conforme a enumeração dos bens no contexto.
- Conservadas as atribuições da fonte aos profetas Abdias e Ageu, sem substituí-las por outras atribuições nem acrescentar referências bíblicas ausentes.
- Mantida a expressão incomum “distrusting anger” como “ira desconfiada”, sem emendar o adjetivo da fonte.

## Review log

### Part 1 of 6, Round 1 (claude, full read)
Verdict: 3 meaning-level, 5 minor. Read ch001–ch003 in full. Fixed one reversed sense (counterfeit works of piety), one wrong antecedent (discretion), one weakened “cannot”, a concord error, two place-name inconsistencies, a Key Terms drift and a non-standard locution.
- `pt-BR/ch001.md` [43]: ““Tu governa cinco cidades, e tu, dez”” → ““Governa tu cinco cidades, e tu, dez”” — “Governa” is the correct affirmative imperative for “tu”; moving the pronoun after the verb is a stylistic change, not a concord correction.
- `pt-BR/ch001.md` [64]: “alguma obra de piedade que procede do verdadeiro pensamento dos padres, mas conduz,” → “alguma obra de piedade que não procede do verdadeiro pensamento dos padres e conduz,” — This passage is about counterfeit coins, which the same paragraph says “are not stamped by … the approved Catholic fathers”. The source's “as it does come” is a slip for “does not come”. As written, the Portuguese reverses the sense. *(meaning)*
- `pt-BR/ch001.md` [67]: “que vivia em Lícon” → “que vivia em Lico” — This is the same Abbot John and the same place as in Conference 24. The Key Terms table renders it “Lico”.
- `pt-BR/ch002.md` [9]: “caminhar sempre pela estrada régia” → “caminhar sempre pela estrada real” — The Key Terms table renders “royal road” as “estrada real”.
- `pt-BR/ch002.md` [15]: “Por meio delas, pode-se subir com menor fadiga até o mais alto cume da perfeição; sem elas,” → “Por meio dele, pode-se subir com menor fadiga até o mais alto cume da perfeição; sem ele,” — “By means of which … without which” refers to discretion, not to the virtues: without discretion, even those who toil most willingly fail. The rest of the conference argues exactly this. *(meaning)*
- `pt-BR/ch002.md` [36]: “esconder às furtivas um pão seco” → “esconder furtivamente um pão seco” — “às furtivas” is not an established Portuguese locution.
- `pt-BR/ch003.md` [33]: “podem, por razão suficiente, não alcançar a caridade apostólica nem subir” → “não podem, por razão suficiente, alcançar a caridade apostólica nem subir” — Source says “cannot … attain”. The Portuguese “podem … não alcançar” turns the impossibility into a mere possibility and weakens the a fortiori argument. *(meaning)*
- `pt-BR/ch003.md` [6]: “deserto de Cétis” → “deserto de Cétia” — Conference 1 spells the name “Cétia” throughout. The spelling should be the same across the book.
- Rejected: audit: parentheses differ (11 places) — Source parentheses are missing in pt-BR. — Each one was converted to dashes or commas, and its content is kept in full.
- Rejected: audit: emphasis markers differ (ch001 [19], ch002 [52], ch003 [48]) — pt-BR has extra italics. — The extra italics are on retained Greek phrases, as the house style requires.
- Rejected: pt-BR/ch002.md [72]-[73] — The Latin heading and paragraph left in Latin by the English edition were translated. — Portuguese is the target language, so translating the Latin is correct.
- Rejected: pt-BR/ch001.md [61] — The reference “2 Coríntios 11:4” should be 11:14. — The source edition gives 11:4, and the house rules do not allow correcting the edition.
- Rejected: pt-BR/ch001.md [4] footnote [^1] — Check the claim about the title “papa”. — Correct: Castor was bishop of Apt and Leontius bishop of Fréjus, and “papa” was then an honorific title of bishops.

### Part 1 of 6, Round 2 (codex, full read)
Verdict: 2 meaning-level, 3 minor. Leitura integral de ch001–ch003, notas, audit, book.json e diário: 2 defeitos de sentido e 3 menores.
- `pt-BR/ch001.md` [30]: “pode não permanecer no homem” → “não pode permanecer no homem” — A fonte diz “cannot remain”, expressando impossibilidade, não apenas a possibilidade de não permanecer. *(meaning)*
- `pt-BR/ch001.md` [49]: “nos pudessem ser dadas sua graça e o conhecimento” → “nos pudessem ser dados sua graça e o conhecimento” — O particípio no plural deve concordar no masculino com os dois núcleos de gêneros diferentes.
- `pt-BR/ch002.md` [43]: “não devem ser simplesmente censuradas e que a dor” → “não devem ser censuradas e, além disso, que a dor” — “Not merely not to be scolded” exclui a censura e acrescenta outra exigência; “não devem ser simplesmente censuradas” permite entender que censurá-las seria apenas insuficiente. *(meaning)*
- `pt-BR/ch003.md` [39]: “Firma meus passos em vossos caminhos” → “Firmai meus passos em vossos caminhos” — O imperativo deve concordar com o tratamento por vós empregado na mesma oração.
- `pt-BR/translation-journal.md`: ““Tu governa” mixes the pronoun with the imperative form and breaks concord; the imperative needs the pronoun after the verb.” → ““Governa” is the correct affirmative imperative for “tu”; moving the pronoun after the verb is a stylistic change, not a concord correction.” — A justificativa gramatical é falsa: “governa” concorda com “tu” no imperativo afirmativo, e o sujeito expresso não precisa ser posposto.
- Rejected: pt-BR/ch002.md [36] — A expressão “autor de sua Paixão” parece deslocada no relato da gula. — A fonte traz expressamente “author of His Passion”; não cabe corrigir a edição por conjectura.
- Rejected: pt-BR/ch003.md [21] — A expressão “em guerra contra o Senhor segundo a carne” parece estranha ao argumento. — Corresponde ao texto canônico “at war with the Lord according to the flesh”; a estranheza já está na fonte.

### Part 1 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [29]–[31], [48]–[50], ch002 [42]–[44] and ch003 [38]–[40]: the five changes from round 2 are correct and the shown paragraphs are clean.
- Rejected: pt-BR/ch002.md [43] — “remedies for wounds be faithfully received” rendered “recebidos com confiança” rather than “fielmente”. — Receiving remedies from the elders “faithfully” here means receiving them trustingly; “com confiança” keeps that sense and does not misinform.
- Rejected: pt-BR/ch003.md [39] — “he shall not be cast away” rendered “não será abandonado”. — The rendering keeps the sense of the verse as quoted: the righteous who falls is not rejected or given up. It is a defensible choice, not a mistranslation.
- Rejected: pt-BR/ch002.md [42] — “standing over against his cell” committed to “diante da cela do ancião”. — Apollos has just gone to the old man's monastery, and the darts strike the old man, who then leaves his cell. The commitment matches the context.
- Rejected: pt-BR/translation-journal.md, Round 1 log, ch001 [43] — The corrected reason calls the applied change stylistic, which seems to contradict recording it as a fix. — The log only records what that round did. The corrected reason is grammatically true, and the record does not affect the text.

### Part 2 of 6, Round 1 (claude, full read)
Verdict: 0 meaning-level, 4 minor. Read ch004–ch007 in full against the source: content complete and faithful, notes accurate; four minor fixes (one vós concord error, three God-pronoun capitalizations against file convention).
- `pt-BR/ch004.md` [21]: “a menos que vós mesmos, que conheceis” → “a menos que vós mesmo, que conheceis” — Source: 'unless You Yourself'. Reverential vós for a single person takes a singular adjective, as in 'sois justo, Senhor' elsewhere; 'mesmos' reads as plural.
- `pt-BR/ch005.md` [74]: “pois Ele expulsou das terras alheias” → “pois ele expulsou das terras alheias” — Every other pronoun for God in ch005 is lowercase (e.g. [48], [68]); this one breaks the file's convention.
- `pt-BR/ch007.md` [15]: “cujo auxílio vem de Vós” → “cujo auxílio vem de vós” — ch007 writes pronouns for God in lowercase mid-sentence ('vossos testemunhos', 'convosco', 'vos falarei'); this capital breaks that convention.
- `pt-BR/ch007.md` [21]: “Minha alma se apegou a Vós” → “Minha alma se apegou a vós” — Same file convention: the next clause in this paragraph already reads 'vossos testemunhos'.
- Rejected: pt-BR/ch006.md [33] — 'acídia' here, while ch005 uses 'acédia' — Both are valid Portuguese spellings, the term is not in Key Terms, and ch006 uses it only once, so the file is internally consistent.
- Rejected: pt-BR/ch007.md [15]-[69] — A period or comma is added after Scripture references (e.g. 'Mateus 8:9. Se') — Punctuation around the reference is a layout choice that does not change the reading; it is not an objective defect.
- Rejected: pt-BR/ch007.md [18] — 'Êxodo 8:21' and '1 Coríntios 10:4-6' are wrong references (should be Ex 18:21 and 2 Cor 10:4-6) — The translation keeps the source's chapter and verse; the edition is not corrected.
- Rejected: pt-BR/ch006.md [6] — 'chegando de fato às vias de fato' repeats 'de fato' — Clumsy but grammatical and faithful; this is a style matter.

### Part 2 of 6, Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Leitura integral de ch004–ch007: 310 blocos, seis notas, auditoria e metadados pertinentes; três correções de sentido por referentes pronominais.
- `pt-BR/ch005.md` [39]: “para seu próprio país, sem a intenção” → “para o próprio país dos israelitas, sem a intenção” — A fonte distingue “their own country”, o país dos israelitas, de “his own land”, a terra de Nabucodonosor. O possessivo atual confunde os dois destinos. *(meaning)*
- `pt-BR/ch006.md` [30]: “por tê-lo tornado um homem melhor” → “por ter tornado Jó um homem melhor” — Quem se tornou melhor pelas tentações foi Jó. O pronome atual retoma imediatamente “ao diabo”, atribuindo-lhe essa melhora. *(meaning)*
- `pt-BR/ch007.md` [84]: “que enchia a própria boca com imundícies” → “que o monge enchia a própria boca com imundícies” — O episódio descreve o que acontecia a Moisés durante a possessão. A omissão do sujeito permite atribuir ao demônio a ação de encher a própria boca. *(meaning)*
- Rejected: Auditoria mecânica de ch004.md–ch007.md — Diferenças de ênfase e de parênteses. — Os itálicos adicionais distinguem termos estrangeiros conforme a regra editorial; os conteúdos parentéticos foram preservados com outras formas de pontuação.
- Rejected: pt-BR/ch005.md [56] — A abstinência excessiva aparece como resultado da fraqueza e da enfermidade, invertendo a causalidade esperada. — A tradução conserva exatamente a relação expressa na fonte: “which results from weakness of the flesh and infirmity”.
- Rejected: pt-BR/ch007.md [36] — A dupla negação em “recusar-nos a crer que suas almas não estão unidas” contraria o argumento de Germano. — A mesma dupla negação está na fonte. Eliminá-la corrigiria o texto canônico, sem constituir correção de tradução.

### Part 2 of 6, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral de ch004–ch007 e das quatro notas do tradutor. Uma correção menor de modalidade em ch007 [27]. Nenhum defeito de sentido.
- `pt-BR/ch007.md` [27]: “de tal modo que devemos considerá-los apenas” → “de tal modo que podemos considerá-los apenas” — A fonte diz 'we can think of them as only inciting', que expressa possibilidade. 'Devemos' transforma a frase em obrigação.
- Rejected: pt-BR/ch006.md [21] — 'não porque estas sejam' retoma 'aflição', que está no singular — A concordância com 'consideradas' deixa claro que o referente são as aflições, como 'these' na fonte. O sentido não fica obscuro.
- Rejected: pt-BR/ch007.md [84] — 'imundícies que ele mesmo produzia' atribui a origem das imundícies ao próprio Moisés — 'Which he supplied' é ambíguo na fonte. A leitura escolhida é defensável e coerente com a correção da rodada 2.
- Rejected: pt-BR/ch005.md [77] — O versículo cita 'te' no singular e a glosa passa para 'vos' no plural — Na glosa, Serapião aplica o versículo aos seus dois ouvintes. A mudança de pessoa é uma escolha defensável.
- Rejected: auditoria mecânica, ch004–ch007 — Diferenças na contagem de ênfase e de parênteses — Os itálicos marcam termos gregos e latinos retidos. O conteúdo dos parênteses foi mantido com travessões ou vírgulas. Já rejeitado na rodada 2.

### Part 2 of 6, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados integralmente os parágrafos 26–28 de ch007.md, as duas notas exibidas e os metadados pertinentes. A alteração para “podemos” está correta e não introduziu problemas; nenhum defeito encontrado no trecho apresentado.

### Part 3 of 6, Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch008–ch011 (Conferences 8–11) against en-US; all audit flags checked; no defects found.
- Rejected: ch008–ch011, 20 paragraphs flagged "parentheses differ" — Parenthetical clauses missing their parentheses — Each one is kept, either set off with dashes or commas or worked into the sentence (e.g. "(earlier law)" → "dessa lei anterior", "(as the heart)" → "enquanto o coração"); nothing is dropped.
- Rejected: ch008.md [6], ch009.md [39], ch009.md [66] — Emphasis markers added — Italics mark retained foreign words (*trogalia*, the Greek εὐκή/ἐπιούσιον phrases), as the house rules require.
- Rejected: ch008.md [75] — "por uma única verdade" seems senseless (likely "blow" in the original) — It renders the canonical en-US exactly; the source is not changed to correct the edition.
- Rejected: ch011.md [46] — "castidade perfeita" where the context of ch. 13 suggests charity — It follows the canonical source ("perfect chastity"); not an unmistakable OCR slip.
- Rejected: ch008.md [54] [^5], ch010.md [^1], ch011.md [^1] — Translator's notes checked as claims of fact — Hermas's Shepherd does describe an angel of righteousness and an angel of wickedness (Mandate 6.2). The third hour is about 9 a.m. Cenobia are communal monasteries. All three are correct.
- Rejected: ch009.md [105] — References "1 João 5:16" and "1 João 3:16" (should be 1 Jo 5:14, Jo 3:16) — The source gives these references, and the translation reproduces them faithfully; correcting the edition is out of scope.

### Part 3 of 6, Round 2 (codex, full read)
Verdict: 2 meaning-level, 1 minor. Leitura integral de ch008–ch011, incluindo notas, metadados, diário e todos os apontamentos mecânicos: dois defeitos de sentido e um defeito sintático menor.
- `pt-BR/ch008.md` [12]: “primeiro, para que os santos mistérios, se não estivessem cobertos por nenhum véu de sentido espiritual, não ficassem igualmente expostos” → “primeiro, pelo receio de que os santos mistérios, se não estivessem cobertos por nenhum véu de sentido espiritual, ficassem igualmente expostos” — O original apresenta a exposição indiscriminada e a consequente ausência de diferença como perigos a evitar. A construção atual faz de «não houvesse diferença» uma finalidade divina. *(meaning)*
- `pt-BR/ch009.md` [21]: “tudo o que ela receber, tudo o que empreender, tudo o que fizer será oração perfeitamente pura e sincera” → “seja o que for que ela receba, empreenda ou faça, a oração será perfeitamente pura e sincera” — O original afirma que a oração será pura independentemente do que a alma receba, empreenda ou faça; não identifica essas ações com a própria oração. *(meaning)*
- `pt-BR/ch010.md` [45]: “aquilo que desejamos ser encontrados” → “tais como desejamos ser encontrados” — Corrige a construção sintática defeituosa, preservando a comparação entre nossa disposição antes da oração e durante ela.
- Rejected: pt-BR/ch008.md [50]; pt-BR/ch009.md [24] — «visão de um irmão» e «tua santidade» divergem literalmente de «a brother's victim» e «four holiness». — O contexto confirma lapsos inequívocos da fonte por «vision» e «your holiness»; as traduções recuperam corretamente o sentido.

### Part 3 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch008 [11–13], ch009 [20–22] and ch010 [44–46]. The three fixes from round 2 are correct and fit their sentences; no new defects.
- Rejected: pt-BR/ch008.md [12] — “Ela também produz” could have an unclear referent after “Algumas passagens” — The source's “It” is just as open. The context (Scripture compared to a field, the “grass for the cattle”) makes the referent clear.
- Rejected: pt-BR/ch009.md [21] — After the fix, “ela” follows the plural subject “os pensamentos da alma” — It follows the source, whose “it” refers to the soul. “alma” is the nearest feminine noun, so the reading is unambiguous.
- Rejected: pt-BR/ch010.md [45] — “às necessidades sagradas do mosteiro” for “the sacred uses” — It is a defensible rendering that keeps the sense of work put to the monastery's service.

### Part 4 of 6, Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch012–ch015 (Conferences 13–16). One meaning fix (wrong antecedent in ch012 [27]); audit flags and source-edition reference errors checked and accepted.
- `pt-BR/ch012.md` [27]: “não só acompanha essa proteção, mas constantemente a precede” → “não só as acompanha, mas constantemente as precede” — Source: 'so great is the kindness of the Creator towards His creatures, that His Providence not only accompanies it, but actually constantly precedes it'. 'It' is the creature (Latin 'comitetur eam' = creaturam), not the protection. Providence 'accompanying protection' misstates the sense; the next sentence ('My God will prevent me with His mercy') confirms that providence goes before the person. *(meaning)*
- Rejected: ch012 [12], [15], [21], [57]; ch013 [45]; ch015 [21], [39], [48], [51], [60], [69] — Mechanical audit: parentheses differ — Each source parenthetical is kept, set off with commas or dashes. No content is lost.
- Rejected: ch012 [18]; ch013 [6], [51]; ch014 [15]; ch015 [45] — Mechanical audit: emphasis markers differ — The extra markers italicize retained Greek words, as the house rules require.
- Rejected: ch012 [30] — 'Ezequiel 1:19-20' is the wrong reference (should be 11:19-20) — The error is in the source edition. It is kept, since the source is not corrected; the same applies to '2 Coríntios 5:16' in ch013 [33] and to Luke being named for Mark in ch014 [6].
- Rejected: ch012 [58] — 'Fortalecendo-nos com esse alimento' recasts the dangling participle — The English participle is loose. The rendering keeps the sense that Chaeremon's teaching sustained them on the way.
- Rejected: ch013 [33] — Address changes from plural (vós) to singular (tu) — The source passage addresses Cassian singly (Latin 'si ergo vis'). The singular is correct.
- Rejected: ch015 [21] — 'broker' rendered as 'irmão' — 'broker' is an obvious OCR slip for 'brother'. The translation reads it correctly.

### Part 4 of 6, Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 239 parágrafos de ch012–ch015, das três notas, da auditoria, do journal e de book.json: um defeito menor de formatação; nenhum defeito de sentido.
- `pt-BR/ch014.md` [33]: “chamado Athera” → “chamado *Athera*” — Athera é um termo grego retido em transliteração; deve receber itálico conforme a regra editorial.

### Part 4 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch014 [32]–[33] and the chapter's footnote: the italicization of *Athera* is correct and the paragraphs have no defects.
- Rejected: pt-BR/ch014.md [33] — Mechanical audit: emphasis markers differ (source 0, pt-BR 2) — The markers italicize the retained foreign term *Athera*, which is the change under review and is correct.
- Rejected: pt-BR/ch014.md [33] — 'que examina o merecimento de todos' for 'which searches out the deserts of all' — 'deserts' here means what each person deserves (merits), so 'merecimento' is correct.
- Rejected: pt-BR/ch014.md [33] — 'Por que o fogo não estava em paz comigo, quando já cessaram' mixes tenses — The source mixes tenses the same way ('why was not the fire at peace with me, when my more serious contests ... have ceased'). The sense is unchanged.

### Part 5 of 6, Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Read ch016–ch019 in full. Fixed one false friend (imprudência for impudence) and one misleading antecedent of "aquele que"; the audit flags check out as acceptable.
- `pt-BR/ch016.md` [9]: “censurando a ousadia de nossa imprudência” → “censurando a audácia de nossa impudência” — Source says "the audacity of our impudence". "Imprudência" is a false friend: it means lack of prudence, not shamelessness. *(meaning)*
- `pt-BR/ch017.md` [52]: “Pois se levanta, em sua blasfêmia, não contra os homens, mas contra Deus, aquele que nada censura no irmão senão sua felicidade; e assim” → “Pois aquele que nada censura no irmão senão sua felicidade se levanta, em sua blasfêmia, não contra os homens, mas contra Deus; e assim” — Source: "he does not raise himself up against men, but … against God, who carps at nothing in his brother except his felicity". The subject is the envious man. Placed right after "Deus", "aquele que" reads as an apposition to God. *(meaning)*
- Rejected: pt-BR/ch018.md [52] — Latin sentence left untranslated — The English source deliberately leaves this passage in Latin. Keeping it, in italics, is faithful to the source.
- Rejected: pt-BR/ch016.md [78] — "e não fizer coisa alguma justa" contradicts Ezekiel 33:15 — It renders the source's own wording, "do no righteous thing". The house rule forbids correcting the edition.
- Rejected: pt-BR/ch016.md [78] — "foi novamente dito ao profeta" where the source has "to him" — In context the "him" is Isaiah, who is told "Go, return, and speak to Hezekiah", so the rendering makes the correct referent explicit.
- Rejected: audit: parentheses and emphasis flags — Counts of parentheses and emphasis differ from the source — Parentheticals became dashes or commas with their content kept. The extra emphasis is italics on retained Greek or Latin. The "(lose)" and "(and feared)" insertions are kept.

### Part 5 of 6, Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Lidos integralmente os 240 parágrafos de ch016–ch019, as sete notas, a auditoria e os metadados; encontrada uma falha de referência sintática.
- `pt-BR/ch019.md` [39]: “lei mosaica, cuja inclinação” → “lei mosaica; a inclinação para essas faltas” — A fonte diz “the inclination to which”: a inclinação para as faltas capitais. “Cuja inclinação” expressa posse e se liga indevidamente à lei mosaica. *(meaning)*
- Rejected: pt-BR/ch018.md [31] — Possível erro em “é verdadeira e não parcialmente perfeito”. — É admissível omitir o sufixo -mente no primeiro de dois advérbios coordenados: “verdadeira” equivale aqui a “verdadeiramente”.

### Part 5 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch019 [38]–[39] and footnote [^1]: the previous fix (antecedent of “the inclination to which”) is correct, and no new defects were found.
- Rejected: pt-BR/ch019.md [39] — “um dos discípulos a quem Jesus amava” could read as one of several disciples Jesus loved — The source, “one of the disciples, whom Jesus loved”, is equally open. The rendering follows it and does not misinform.
- Rejected: pt-BR/ch019.md [27] — audit: parentheses differ (source 1, pt-BR 0) — The paragraph is not in this delta. Round 1 already reviewed and accepted the parentheses flags as parentheticals rendered with dashes or commas.

### Part 6 of 6, Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of ch020–ch022 (Conferences 21, 23, 24) against the source: two grammar slips (ch020 [90], ch022 [57]) and one Isaiah quotation turned from imperative into indicative (ch022 [75]); footnotes, Key Terms and audit flags otherwise check out.
- `pt-BR/ch020.md` [90]: “oferecem ao Senhor tudo o que possuem, juntamente com a si mesmos” → “oferecem ao Senhor tudo o que possuem e também a si mesmos” — source: 'offer all that they have to the Lord equally with themselves'; 'juntamente com a si mesmos' is ungrammatical (preposition 'com' followed by 'a si')
- `pt-BR/ch022.md` [57]: “onde é impossível encontrar alguém, ou quase ninguém, que adote” → “onde é impossível encontrar alguém, ou quase impossível, que adote” — source: 'impossible to find anyone, or scarcely anyone'; 'impossível encontrar … quase ninguém' mixes two constructions and reads as a contradiction
- `pt-BR/ch022.md` [75]: “Eis que todos vós que acendeis um fogo, cercados de chamas, caminhais à luz de vosso fogo” → “Eis, todos vós que acendeis um fogo, cercados de chamas, caminhai à luz de vosso fogo” — source quotes Isaiah 50:11 with an imperative ('walk in the light of your fire'); the indicative 'caminhais' turns the prophet's command into a statement; the same quotation in ch021 [30] already uses 'caminhai' *(meaning)*
- Rejected: ch020–ch022, 16 parenthesis flags — parentheses in the source missing in PT — each parenthetical is kept, rendered with dashes or commas; no content lost
- Rejected: ch020 [86]/[87], ch020 [105], ch021 [30], ch022 [48] — extra emphasis markers — italics on retained Latin/Greek (Quadragesima, πρακτικὴ, funambuli, λογικόν etc.) follow house rules
- Rejected: pt-BR/ch020.md [15] — 'Mateus 16:25' for 'what shall a man give in exchange for his soul' — the reference is the source's own; the edition is not corrected
- Rejected: pt-BR/ch021.md [27] — 'o reparam com uma penitência imediata' for 'avenge it by immediate chastisement' — a defensible rendering of the same sense (self-punishment for the lapse)
- Rejected: pt-BR/ch020.md [105] — 'não acrediteis' adds a negation absent from 'i.e., believe that…' — the English is elliptical after 'use not your liberty'; the negation restores the evident sense

### Part 6 of 6, Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 260 blocos de ch020–ch022, das seis notas, do journal, do book.json e da auditoria: dois defeitos de sentido; os apontamentos mecânicos não exigem correção.
- `pt-BR/ch022.md` [30]: “me permitir afrouxar, ainda que minimamente, o propósito de mortificação que abracei para retirar teu boi” → “me permitir, para retirar teu boi, afrouxar, ainda que minimamente, o propósito de mortificação que abracei” — Na fonte, retirar o boi seria a finalidade de afrouxar a mortificação. Na tradução, essa finalidade fica ligada a abraçar o propósito de mortificação. *(meaning)*
- `pt-BR/ch022.md` [60]: “E assim, embaraçado por maiores exigências desta vida” → “E assim, como esse homem está embaraçado por maiores exigências desta vida” — Na fonte, quem está embaraçado pelas exigências da vida é o homem que abandonou os anciãos. O particípio solto na tradução atribui essa condição ao sujeito da oração principal, o diabo. *(meaning)*
- Rejected: pt-BR/ch021.md [54] — A dupla negação em “não esperam não poder obter” parece contrariar o argumento. — A mesma dupla negação consta expressamente da fonte inglesa. Não há fundamento seguro para tratá-la como erro de OCR e corrigir a edição.

### Part 6 of 6, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch022 [29]–[31] and [59]–[61]: both previous fixes ([30] purpose clause, [60] dangling participle) are correct and their sentences intact; no defects found.
- Rejected: pt-BR/ch022.md [60] — 'persuadindo-os … e pintando-os em seu coração' could read as if the second 'os' meant the persons rather than the deserts — 'como se estivessem semeados de delícias maravilhosas' fixes the referent as the deserts, matching the source's 'portraying them'; the sentence is understood correctly
- Rejected: pt-BR/ch022.md [60] — 'como já não estará sujeito' uses the future where the source has the present 'is liable' — the whole consequence in the source is future ('will not even allow', 'will never suffer'); the future keeps the sequence coherent without changing the sense
