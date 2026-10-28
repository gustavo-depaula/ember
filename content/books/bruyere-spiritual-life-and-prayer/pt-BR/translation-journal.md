
## Termos

| pontiff / high priest | pontífice / sumo sacerdote | Preservada a distinção lexical da fonte. |
| kingly priesthood | sacerdócio régio | |
| hypostatic union | união hipostática | |
| sevenfold Spirit | Espírito septiforme | |
| Communion of Saints | Comunhão dos Santos | |
| Holy of Holies | Santo dos Santos | |
| discretion | discrição | No sentido monástico de discernimento e justa medida. |
| St. Barnabas / St. Stephen / Melchisedech | São Barnabé / Santo Estêvão / Melquisedeque | |
| stacte / cassia | estoraque / cássia | Aromas mencionados no Salmo 44. |

## Decisões

- Preservados os 51 parágrafos de c24, inclusive as quebras de frase entre [4–5], [13–14], [23–24], [28–29] e [38–39]; mantidas as 63 definições de notas em um único bloco final.
- As notas latinas foram traduzidas segundo sua própria redação, preservando diferenças em relação às citações inglesas, especialmente nas notas 25 e 54. Mantidas as citações latinas no texto corrido.
- “Finis” foi traduzido por “Fim”, por funcionar como indicação editorial de encerramento.
- Não foram acrescentadas notas do tradutor, dada a abundância de notas da fonte.

## Review log

### Part 1 of 3, Round 1 (claude, full read)
Verdict: 2 meaning-level, 3 minor. Read c01–c11 in full. Fixed a misleading rendering of Ecclesiasticus 37:15 (text and note), 'age por todos' in Ephesians 4:6 (text and note), and OCR-garbled Latin in c11. Spurious OCR text in the source (c01 [30]-[31], c03 [22]-[40]) needs removal from both languages by a maintainer.
- `pt-BR/c01.md` [21]: “junto de um homem santo, que saibas observar o temor de Deus, cuja alma” → “junto de um homem santo, de quem saibas que observa o temor de Deus, cuja alma” — Source: 'whomsoever thou shalt know to observe the fear of God'. It is the holy man who observes the fear of God. 'que saibas observar' reads as 'that you know how to observe'. *(meaning)*
- `pt-BR/c01.md` [32]: “junto de um homem santo, que saibas observar o temor de Deus;” → “junto de um homem santo, de quem saibas que observa o temor de Deus;” — Latin 'quemcumque cognoveris observantem timorem Dei': whom you know to be observing the fear of God. Same misattribution as in the text. *(meaning)*
- `pt-BR/c02.md` [3]: “que está acima de todos, age por todos e está em todos nós” → “que está acima de todos, age por meio de todos e está em todos nós” — Source: 'through all'. 'age por todos' reads as 'acts on behalf of all'. Now matches the rendering of the same verse in c04.
- `pt-BR/c02.md` [25]: “age por todos e está em todos nós (Efésios 4:4-6)” → “age por meio de todas as coisas e está em todos nós (Efésios 4:4-6)” — Latin 'per omnia' means through all things. Now matches c04 note 1.
- `pt-BR/c11.md` [28]: “*intellectual illumiua*, e inflame nossos afetos, *affectum influmvia*” → “*intellectum illumina*, e inflame nossos afetos, *affectum inflamma*” — OCR garble of the prayer Aperi Domine ('intellectum illumina, affectum inflamma') was carried into PT. The en-US source has the same OCR slip and should be fixed too.
- Rejected: pt-BR/c01.md [30]-[31], pt-BR/c03.md [22]-[40] — Text about a 2006 study and a table of student counts. — This is spurious OCR or hallucinated text in the en-US source, and the PT mirrors it. It should be deleted from both files by a maintainer. It is not a translation defect, and deleting it only in PT would desync the paragraphs.
- Rejected: pt-BR/c04.md [14] 12:46; c07.md [16] Filipenses 6:6, Gálatas 6:20, João 7:20; c08.md [32] Eclesiástico 1:18 — Impossible or wrong Scripture references. — PT faithfully reproduces the references of the source edition. The house rule forbids correcting the edition.
- Rejected: audit: unbalanced quotes / space before punctuation — Quotes open in one paragraph and close in the next; spaced '. . .' ellipses. — The quotations span paragraphs as in the source, and the spaced ellipsis is the source's style.
- Rejected: audit: emphasis c07.md [16], c09.md [13], c11.md [28] — Italics counts differ from the source. — c07 resolves '*Ibid.*' to the explicit book name, which is correct. c09 italicizes *Pater noster* consistently with the rest of the file. c11 italicizes the retained Latin.

### Part 1 of 3, Round 2 (codex, full read)
Verdict: 7 meaning-level, 1 minor. Lidos integralmente os 300 blocos de c01–c11, incluindo notas, além da auditoria, do book.json e do diário: sete defeitos de sentido e um desvio terminológico.
- `pt-BR/c01.md` [7]: “com inteligência e discernimento” → “com inteligência e discrição” — A fonte emprega “discretion”, cuja tradução fixada na tabela de termos é “discrição”.
- `pt-BR/c06.md` [42]: “ou compreendido apenas em parte” → “ou parcialmente mal compreendido” — “Partially misunderstood” indica compreensão parcialmente errada, não apenas incompleta. *(meaning)*
- `pt-BR/c08.md` [17]: “para que, se forem longas, o inimigo não tenha tempo de lançar distrações em nosso coração” → “para evitar que, se forem longas, o inimigo tenha tempo de lançar distrações em nosso coração” — A fonte recomenda brevidade para evitar que a duração prolongada dê tempo ao inimigo; a tradução inverte o efeito das orações longas. *(meaning)*
- `pt-BR/c09.md` [4]: “E não nos deixeis cair em tentação” → “E não nos conduzais à tentação” — “Lead us not into temptation” pede que não sejamos conduzidos à tentação; a fórmula familiar empregada substitui isso por não sucumbir à tentação. *(meaning)*
- `pt-BR/c09.md` [12]: “e não nos deixeis cair em tentação” → “e não nos conduzais à tentação” — A citação diz “lead us not into temptation”, distinguindo ser conduzido à tentação de cair nela. *(meaning)*
- `pt-BR/c09.md` [21]: “E não nos deixeis cair em tentação (Lucas 11:1-4).” → “E não nos conduzais à tentação (Lucas 11:1-4).” — A nota diz “ne nos inducas in tentationem”: não nos conduzas à tentação, e não simplesmente não nos deixes sucumbir a ela. *(meaning)*
- `pt-BR/c09.md` [21]: “E não nos deixeis cair em tentação. Mas livrai-nos” → “E não nos conduzais à tentação. Mas livrai-nos” — Também nesta nota, “ne nos inducas in tentationem” deve conservar a ação de conduzir expressa pela fonte. *(meaning)*
- `pt-BR/c10.md` [8]: “mas para que a “cultivasse e guardasse”” → “mas para que o “cultivasse e guardasse”” — O objeto de “dress it and keep it” é o jardim. O pronome feminino faz a tradução retomar “criação” em vez de “jardim”. *(meaning)*
- Rejected: pt-BR/c01.md [32], nota 8 — A citação do segundo mandamento está incompleta. — A própria nota latina fornecida omite o mandamento do amor ao próximo. A tradução acompanha essa lacuna da fonte.
- Rejected: Auditoria: Scripture references differ, c01–c11 — A auditoria apresenta referências bíblicas portuguesas sem correspondentes na fonte. — As referências estão presentes na fonte com abreviaturas e algarismos romanos; a indicação “source none” decorre da detecção mecânica.

### Part 1 of 3, Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Read all paragraphs of c01–c11 with their notes, the audit, book.json and the journal. Found one minor defect: a doubled closing punctuation in c03 [5].
- `pt-BR/c03.md` [5]: “não procedeis segundo o homem?”.[^4]” → “não procedeis segundo o homem?”[^4]” — The quotation ends with a question mark, so the period after it doubles the closing punctuation; the other files close such questions without a period (c06 [23], c07 [9]).
- Rejected: pt-BR/c08.md [16] — 'homem carnal' for 'sensual man' (1 Cor 2:14), rendered 'homem sensual' in c03 [4] — The book uses 'carnal', 'animal' and 'sensual' man for the same idea (c03 [2]-[4]). The sense is unchanged and no Key Terms row fixes the term.
- Rejected: pt-BR/c01.md [8] — 'Bastava que ... faça hoje parte': present subjunctive after an imperfect main verb — The present subjunctive is acceptable here because the clause states a fact that still holds ('now forms part'). This is a style choice, not an error.
- Rejected: en-US/c11.md [28] — The source still has the OCR slips 'intellectual illumiua' and 'affectum influmvia' — The Portuguese is already corrected to 'intellectum illumina, affectum inflamma'. The source file cannot be fixed through this answer format, so a maintainer must edit en-US by hand.
- Rejected: pt-BR/c07.md, c08.md (nEle, dAquele) vs c03.md, c04.md (n’Ele, d’Aquele) — The contracted pronoun is written differently in different files — Each file is consistent within itself, which is what the house rule requires.

### Part 1 of 3, Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os parágrafos c03 [4–6] e conferida a correção de pontuação em [5]: correta, sem efeitos adversos nem novos defeitos no trecho apresentado.

### Part 2 of 3, Round 1 (claude, full read)
Verdict: 1 meaning-level, 11 minor. Full read of c12–c18. Fixed one source OCR slip, a c17 heading that did not match the toc, the ambiguous 'iluminismo', Odilão, 4 Reis→2 Reis, five italicized book names in c15 footnotes, and two concord breaks in c18 footnotes.
- `en-US/c12.md` [8]: “In was in this sense” → “It was in this sense” — OCR slip in the source: 'In' for 'It'.
- `pt-BR/c17.md` [1]: “# Capítulo XVI: Da vida unitiva” → “# Capítulo XVI: A vida unitiva” — book.json toc has 'A vida unitiva', and the other headings drop 'Of' the same way (c16 'A contemplação').
- `pt-BR/c18.md` [13]: “Sem dúvida, o iluminismo é um perigo” → “Sem dúvida, o iluminismo místico é um perigo” — The source means religious illuminism (credulity about visions), set against naturalism. Bare 'iluminismo' reads in pt-BR as the Enlightenment, which would make the contrast meaningless. *(meaning)*
- `pt-BR/c16.md` [5]: “Santo Odilo” → “Santo Odilão” — The Portuguese name of St. Odilo of Cluny is Odilão.
- `pt-BR/c18.md` [42]: “(4 Reis 4:27)” → “(2 Reis 4:27)” — Vulgate 4 Reg. is 2 Reis in Portuguese naming. The book already converts 1 Reg. to 1 Samuel (c14 [^6]).
- `pt-BR/c15.md` [34]: “(*Tobias* 2:17, 18)” → “(Tobias 2:17, 18)” — Only 'Ibid.' was italic in the source. When resolved to a book name, the book name goes in roman, as in [^6] and [^20] of this file.
- `pt-BR/c15.md` [34]: “(*Mateus* 20:22)” → “(Mateus 20:22)” — Bible book names are not italicized elsewhere in the footnotes.
- `pt-BR/c15.md` [34]: “(*Mateus* 26:39)” → “(Mateus 26:39)” — Bible book names are not italicized elsewhere in the footnotes.
- `pt-BR/c15.md` [34]: “(*Cântico dos Cânticos* 3:2)” → “(Cântico dos Cânticos 3:2)” — Bible book names are not italicized elsewhere in the footnotes.
- `pt-BR/c15.md` [34]: “(*Cântico dos Cânticos* 3:4)” → “(Cântico dos Cânticos 3:4)” — Bible book names are not italicized elsewhere in the footnotes.
- `pt-BR/c18.md` [42]: “aspirai com zelo às coisas espirituais, mas sobretudo ao de profetizar (Ibid., 14:1)” → “aspirai com zelo às coisas espirituais, mas sobretudo a profetizar (Ibid., 14:1)” — 'ao de profetizar' presupposes 'dom', but the antecedent here is 'coisas'. Latin 'magis autem ut prophetetis'.
- `pt-BR/c18.md` [42]: “Aspirai com zelo às coisas espirituais, mas sobretudo ao de profetizar (1 Coríntios 14:1)” → “Aspirai com zelo às coisas espirituais, mas sobretudo a profetizar (1 Coríntios 14:1)” — Same concord break as [^9].
- Rejected: pt-BR/c14.md [28]–[30] — The devil addresses Christ as 'tu' in [28] and as 'vós' in [29]–[30]. — This follows the source's own shift from 'thou' to capitalized 'Thou'. It is defensible.
- Rejected: pt-BR/c18.md [34] — The last sentence is reordered ('tornar tão simples a alma humana… órgãos'). — The English sentence is garbled. The rendering is a reasonable reading of it.
- Rejected: pt-BR/c15.md [7]–[9], [^5]; c13 [13]–[14]; c15 [24]–[25] — Paragraphs and a footnote are split by page-break artifacts. — The source has the same splits, and the translation preserves them.
- Rejected: pt-BR/c17.md [14]–[15] — '. . .' with spaces, and unbalanced quotes. — The ellipsis style is consistent within c17, and the quote runs across paragraphs as in the source.
- Rejected: pt-BR/c14.md [^4], [^5]; c16 [^22]; c17 [^7] — Some Scripture references are wrong (Heb 1:5, Ez 27:18, Mt 5:3, Ef 3:12). — They reproduce the source's references. The house rules do not allow correcting the author or the edition.
- Rejected: audit: emphasis c14 [23], [46], [47]; c17 [26] — The PT has more emphasis markers than the source. — These are the italics the house rules require for retained Latin.

### Part 2 of 3, Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 248 blocos de c12–c18, incluindo notas, com conferência dos alertas mecânicos, do journal e dos campos pertinentes de book.json; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/c12.md [6]–[7] — Aspas aparentemente desequilibradas em [6]. — A citação continua em [7], com reabertura de aspas e fechamento ao final, como na fonte.
- Rejected: pt-BR/c17.md [19] — Ausência dos parênteses presentes em “other (mystic) way”. — “Outra via, a mística” preserva integralmente o esclarecimento por meio de uma aposição.
- Rejected: pt-BR/c18.md [14] e [42], nota 14 — “Mas sobretudo ao de profetizar” parece uma construção incompleta. — É um excerto elíptico da citação completa em [12], na qual “ao” retoma “ao dom” e depende de “aspirai”. A fonte também apresenta apenas o fragmento nessa passagem.

### Part 3 of 3, Round 1 (claude, full read)
Verdict: 5 meaning-level, 0 minor. Read c19–c24 in full: a deer misread as 'heart' in the Climacus quotation, two wrong references in c20's footnotes, and a stray chemistry-journal line in c23 removed from both the source and the translation; nothing else.
- `pt-BR/c19.md` [27]: “a alma, assim como o coração, ferida pela flecha do amor” → “a alma, como o cervo ferido pela flecha do amor” — Source 'the soul like the heart, wounded by the arrow' is the hart (deer) of Ps 41, which the passage quotes next on thirst; the same OCR misreading was rendered 'cervo' in c20 [30]. *(meaning)*
- `pt-BR/c20.md` [84]: “(Romanos 6:57)” → “(Romanos 6:5-7)” — The quoted text is Rom 6:5-7; 'vi, 57' in the source has lost its hyphen, and Romans 6 has no verse 57. *(meaning)*
- `pt-BR/c20.md` [84]: “[^57]: I, questão 2, art. 3, resposta à 4ª objeção.” → “[^57]: I-II, questão 3, art., resposta à 4ª objeção.” — Source 'I, 2 quæst., 3 art. Ad 4' means I-II, q. 3 (as in c19 n. 18, 'I, 2 quæst. LXI' rendered 'I-II'). The translation points to Part I, q. 2, a. 3, which is a different passage. *(meaning)*
- `en-US/c23.md` [31]: “The 1992 paper by the authors of this review was published in the journal *Journal of the Royal Society of Chemistry*.” → “” — Text-recognition error: this sentence about a chemistry journal is not part of the 1900 book and breaks into the end of the chapter. *(meaning)*
- `pt-BR/c23.md` [31]: “O artigo de 1992 dos autores desta resenha foi publicado na revista *Journal of the Royal Society of Chemistry*.” → “” — Translation of the same stray sentence; removed together with the source line. *(meaning)*
- Rejected: c20 [34]-[38], c22 [20]-[21], c24 [23]-[24], [28]-[29], [38]-[39] — Unbalanced quotes — Each quotation continues across paragraphs or a split sentence, as in the source; the marks are correct within the continuous text.
- Rejected: c19 [4], [23], [24]; c20 [26], [77], [78], [84] — Space before punctuation — These are the source's spaced ellipses '. . .', kept as they are.
- Rejected: c19 [27] — '33º degrau' while note 29 cites grad. xxx — The mismatch is in the source; the translation must not correct the author.
- Rejected: c20 [28] — Denis the Carthusian placed in the 14th century — This is the author's own statement; the translation renders it faithfully.
- Rejected: c21 [8] — Inserted '[…]' and an opening quote mark — Text is missing from the source at this point; the mark shows the gap and adds nothing.
- Rejected: c21 n. 14 — Lucas 16:24 — This is the source's own citation, so it is not corrected.

### Part 3 of 3, Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Lidos integralmente os 266 blocos de c19–c24, incluindo notas, e conferidos os metadados, o journal e os alertas: dois defeitos menores, nenhum defeito de sentido.
- `pt-BR/c20.md` [84]: “(São Bernardo, Sobre o Cântico.” → “(São Bernardo, Sobre o Cântico).” — O parêntese da referência na nota 8 ficou aberto. Fechá-lo corrige a pontuação sem acrescentar dados à referência.
- `pt-BR/c22.md` [12]: “até que, no fim dos séculos, virá pela última vez” → “até que, no fim dos séculos, venha pela última vez” — A oração temporal introduzida por «até que», referida a um acontecimento futuro, exige aqui o subjuntivo.
- Rejected: Alertas de referências bíblicas em c19–c24 — Referências detectadas apenas no português. — A fonte apresenta as referências com abreviaturas e algarismos romanos; sua conversão para nomes portugueses e algarismos arábicos explica os alertas.
- Rejected: Alertas de ênfase em c20, c21, c23 e c24 — Contagens diferentes de marcadores de itálico. — Os acréscimos destacam expressões latinas conservadas, conforme a regra editorial; em c24, a redução decorre da substituição de «Ibid.» em itálico pela referência explícita.
- Rejected: pt-BR/c20.md [84], nota 57 — «art.» aparece sem número. — A referência fornecida pela fonte também não contém um número inequívoco de artigo; completá-lo exigiria informação externa.

### Part 3 of 3, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c20 [83]-[84] and c22 [11]-[13]: both fixes (parenthesis closed in note 8, subjunctive after «até que») are correct; no new defects.
- Rejected: pt-BR/c20.md [83] / [84] n. 70 — O texto corrido diz «desejamos» e a nota 70 diz «pedimos» — A fonte também difere: «desire» no texto inglês, «petimus» na nota latina. Cada um foi traduzido segundo sua própria redação, como registra o journal.
- Rejected: pt-BR/c20.md [84] n. 64 — A citação abrange Tiago 5:17-18, mas a referência indica só 5:17 — A referência é a da própria fonte («Jac. v, 17») e não se corrige o autor.
