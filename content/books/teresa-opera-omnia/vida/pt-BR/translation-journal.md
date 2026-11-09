
## Termos

| vuestra merced | Vossa Mercê | tratamento do confessor (c40, carta) |
| merced(es) | mercê(s) | graças místicas recebidas |
| arrobamiento / arrebatamiento | arroubamento / arrebatamento | c40 |
| fatigarse | afligir-se | sentido teresiano |
| asimiento | apego | c40 ¶21 |
| perlacía | prelazia | c40 ¶18 |
| Descalcez Carmelitana | Descalcez Carmelitana | notas do editor, c40 n. 3 |
| Religión (ordem religiosa) | Religião | mantido com maiúscula, como na fonte |
| Padre Maestro Ávila | Padre Mestre Ávila | São João de Ávila; carta, n. do tradutor [^3] |
| Jhs. | Jhs. | mantido; n. do tradutor no prólogo |

## Decisões

- c40: locuções divinas em discurso direto mantidas sem aspas, como na fonte (dois-pontos e maiúscula).
- c40 ¶3: nota do tradutor [^10], eco de Mateus 5:18 («não faltará um til»).
- c40 ¶8: «para enseñarme» da fonte lido como «para ensiná-las» (as pessoas de recolhimento), como Lewis.
- c40 ¶11: «temían» lido como erro por «ternían» → «teriam».
- c40 ¶22: o «não» redundante mantido com a n. 6 do editor, que o comenta.
- c40 ¶25: «señor y padre mío» → «senhor e pai meu».
- c40 n. 1: «traducidos en nuestra lengua» → «traduzidos em castelhano», para o leitor brasileiro não entender português; a citação antiga mantém a mistura «buscava-o… não te achei» da fonte.
- carta ¶4–¶5: a divisão da fonte no meio da frase («não me resta / mais para fazer») mantida; nota do tradutor [^3] sobre São João de Ávila colocada após ¶4.
- carta n. 2: assinatura de Báñez («L. Fr. D." Bañes'» no OCR) normalizada para «L. Fr. D.º Bañes».
- prologo ¶3: nota do tradutor [^3] sobre «Jhs.».
- Títulos de obras citadas nas notas do editor (Historia de la Reforma etc.) mantidos no original, sem itálico, como na fonte.

## Review log

### Part 1 of 4, Round 1 (claude, full read)
Verdict: 2 meaning-level, 2 minor. Read c01–c13 in full, source beside translation; fixed one ambiguous antecedent, one wrong subject in an editor's quotation, one missing translator's-note marker and one lowercase «Vossa Mercê».
- `pt-BR/c01.md` [7]: “para ler vidas de santos; era o que eu mais amava” → “para ler vidas de santos; era este o que eu mais amava” — source «que era el que yo más quería» refers to the brother; «era o que eu mais amava» reads as if reading saints' lives were what she loved most *(meaning)*
- `pt-BR/c02.md` [15]: “e ela, deixando-se levar com simplicidade, veio a apoderar-se de seu coração e a perturbar-lhe o sossego” → “e, como ela se deixou levar dessa afeição com simplicidade, esta veio a apoderar-se de seu coração e a perturbar-lhe o sossego” — source «de la cual, dejándose llevar con sencillez, vino a apoderarse de su corazón»: it is the afición that takes over her heart, not Teresa; PT made «ela» the subject of apoderar-se *(meaning)*
- `pt-BR/c06.md` [8]: “sendo aio, o podia mandar” → “sendo aio[^7], o podia mandar” — translator's note [^7] on «aio» is defined after the chapter but has no marker in the text
- `pt-BR/c13.md` [25]: “vossa mercê o verá” → “Vossa Mercê o verá” — Key Terms table gives «Vossa Mercê»; capitalized in every other chapter
- Rejected: pt-BR/c01.md [12] — parenthesis count differs (source opens with «[» and closes with «)») — source bracket is an OCR slip; PT normalizes it to a matched parenthesis
- Rejected: pt-BR/c05.md [15], c07.md [28] — source «Banón», PT «Barrón» — Teresa's confessor was Vicente Barrón; «Banón» is an OCR misreading, and the translation gives the correct name
- Rejected: pt-BR/c07.md [22] — source «otras voluntades más honestas», PT «pouco honestas» — the standard text reads «menos honestas» and the context requires it; the PT follows the sense, and the source is left as the edition prints it
- Rejected: pt-BR/c07.md [8] — «no le pesaba» rendered «lhe desagradava» — the «no» is pleonastic (Báñez's emendation in n. 2 and Lewis read it the same way), so the PT gives the intended sense
- Rejected: audit: emphasis markers in footnotes — italics added in editor's notes — they mark Spanish and Latin words cited as words, which is consistent with house style

### Part 1 of 4, Round 2 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Read c01–c13 in full against es-ES: one minor fix cutting an unconfirmable frequency claim in the translator's note on «Sua Majestade»; the rest is clean.
- `pt-BR/c01.md` [11]: “é o nome que Santa Teresa dá a Deus com mais frequência ao longo do livro” → “é um dos nomes que Santa Teresa dá a Deus com mais frequência ao longo do livro” — Translator's note [^10], defined after c01 ¶11. «Señor» occurs more often than «Su Majestad» in the Vida, so the claim that it is the most frequent name cannot be confirmed; cut back to what is certain.
- Rejected: audit: parentheses in c07 [4], [5], [7], [10], [14], [18] and c08 [6], [11], [15], [16] — Parenthesis counts differ from the source. — Each pair sets off an aside the source runs in with commas, or gives the Spanish word in a note. Clauses and sense are kept.
- Rejected: audit: emphasis markers in c01–c13 footnotes — Italics added in editor's notes. — They mark Spanish and Latin words cited as words, consistent with the house rule for retained Latin and Spanish; already rejected in round 1.
- Rejected: pt-BR/c06.md [14] — Editor's quotation of the defective earlier printing left in Spanish. — The note is about the wording of that printing, so the Spanish must be kept for the comparison to make sense.
- Rejected: pt-BR/c07.md [24], c10.md [13], c12.md [11] — «1. R.» / «1. P.» kept from the OCR, where «l.» is meant. — Kept as the source prints it, consistently across these notes; it is a citation siglum and misinforms no one.
- Rejected: pt-BR/c08.md [4] — «das vidas mais penosas» adds «mais» to «una de las vidas penosas». — The source sentence is superlative in sense («que me parece se puede imaginar»); the addition renders it, not a new claim.
- Rejected: pt-BR/c13.md [9], [15] — «soledade» here, «solidão» in other chapters. — Both are valid Portuguese for «soledad», and each file is internally consistent; no Key Terms row fixes the word.

### Part 1 of 4, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c01 [10]–[12] and note [^10]: the round-2 fix is correct and no new defects were found.
- Rejected: pt-BR/c01.md [11] — The marker [^10] stands on «Vossa Majestade», but the note names «Sua Majestade» (*Su Majestad*). — Both are the same courtly title, one in direct address and one in the third person. The note explains the title, so the reader is not misled.
- Rejected: pt-BR/c01.md [11] — «para que desde esta edad no fuera toda vuestra» is rendered without the negation. — The «no» is expletive after «nada por hacer». The sense is that God left nothing undone so that she would be wholly His, and Lewis reads it the same way.
- Rejected: pt-BR/c01.md [10] — «los buenos deseos que comencé» is rendered «com que comecei». — The sense is the same: the good desires she began with. It is a defensible style choice.

### Part 2 of 4, Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of c14–c25 against es-ES: translation complete and faithful; fixed a missing footnote marker (c18) and cut an unverifiable claim from a translator's note (c22).
- `pt-BR/c18.md` [13]: “A vontade é a que mantém a tela, mas” → “A vontade é a que mantém a tela[^4], mas” — translator's note [^4] on «mantener la tela» is defined after the chapter but its marker is missing from the paragraph it explains
- `pt-BR/c22.md`: “[^8]: *Nota do tradutor:* Expressão obscura do original, de sentido discutido. A tradução inglesa de David Lewis entende-a como considerar-se encerrado num espaço definido, com Deus em toda a volta; por isso se manteve tal como a Santa a escreveu.” → “[^8]: *Nota do tradutor:* Expressão obscura do original, de sentido discutido; por isso se manteve tal como a Santa a escreveu.” — the precise claim about how Lewis renders «en cuadrada manera» cannot be confirmed; cut back to what is certain
- Rejected: mechanical audit, emphasis/parentheses flags (c14–c25) — extra italics and parentheses — italics mark retained Spanish/Latin words in editor's notes; parentheses add translations of Latin quotations, quote the original form (c15 n.4, c25 n.5), or reproduce the source's own incisos. None is a defect
- Rejected: c14–c19, c22–c25 vs c20–c21 — «vossa mercê» lowercase in some files, «Vossa Mercê» in others — each file is internally consistent; capitalization of address is not normalized
- Rejected: c16 n.8, c20 n.3, c20 n.12 — work titles in italics, against the journal decision for editor's notes — that decision is recorded for c40; the italicized titles here are retained Spanish/Latin and are internally consistent per file. Not worth churning
- Rejected: pt-BR/c16.md [4] — «porque não pode gozar tanto sozinha» adds «sozinha» — makes explicit the sense of «no puede tanto gozar» (she cannot hold so much joy by herself), as the context of sharing requires
- Rejected: pt-BR/c20.md [^17] — note reading «Vocación» as «advocación» (titular feast) — standard editorial explanation of the term; consistent with the editor's note placing the event at San José
- Rejected: pt-BR/c23.md n.9 — Laredo called physician of João II rather than João III — the source edition says Juan II; the author or edition is not corrected

### Part 2 of 4, Round 2 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of c14–c25 against es-ES: complete and faithful; two minor fixes where fatigarse (distress) was rendered as «fatigada(s)» instead of the Key Terms «aflito/a».
- `pt-BR/c15.md` [18]: “não andem as almas tão fatigadas, quando” → “não andem as almas tão aflitas, quando” — source «no anden las almas tan fatigadas … como yo he andado» uses fatigarse in the Teresian sense of distress; the Key Terms table renders it as afligir-se
- `pt-BR/c25.md` [18]: “toda alvoroçada e fatigada, sem saber” → “toda alvoroçada e aflita, sem saber” — source «toda alborotada y fatigada» means distressed, not tired; the Key Terms table gives fatigarse → afligir-se
- Rejected: pt-BR/c17.md [10] — «depois de me ter fatigado muitos anos» departs from the Key Terms row fatigarse → afligir-se — here she has worn herself out for years struggling with the memory; the literal sense of tiring fits, so «fatigado» is correct
- Rejected: pt-BR/c20.md [30] — «diante de Vós» where the source has «delante de Ti» — it brings the quoted verse into line with the vós address Teresa uses to God throughout; a defensible choice that does not change the meaning
- Rejected: pt-BR/c19.md [5] — «Entendem que tem virtudes» where the source has the singular «Entiende» — the subject in the source is ambiguous, and the context (others see the fruit and want to share it) supports the plural reading

### Part 2 of 4, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 2 minor. Delta read of c15 [17–19] and c25 [17–19]: both prior fixes are correct; fixed a present-to-past tense shift in c15 [18] and «fadiga» → «aflição» in c25 [19] per Key Terms.
- `pt-BR/c15.md` [18]: “como me custaram muitos trabalhos pô-los em limpo” → “como a quem custa muitos trabalhos pô-los em limpo” — source «como a quien le cuestan muchos trabajos sacarlos en limpio» is present and generic: setting them out is laborious, so she defers them. The past tense «custaram» suggests the work is already done.
- `pt-BR/c25.md` [19]: “estando nesta grande fadiga” → “estando nesta grande aflição” — «esta gran fatiga» refers back to the distress of [18] («aflita», «aflição»), not tiredness; the Key Terms table gives fatigarse → afligir-se. «tirá-la» still agrees.
- Rejected: pt-BR/c25.md [18] — «aflita» followed by «Nesta aflição» repeats the root — the source has the same pairing («fatigada… En esta aflición»); not a defect
- Rejected: pt-BR/c25.md [18] — «Louvem-vos» for «Alábenos» — «Alábenos» is «alaben os» (vos); the rendering is correct
- Rejected: pt-BR/c25.md [19] — audit flag: parenthesis not in source — it marks the source's own aside («aun entonces no había comenzado a tener ninguna visión») for clarity; content unchanged

### Part 2 of 4, Round 4 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c15 [17–19] and c25 [18–20]: both prior fixes («a quem custa», «aflição») are correct and fit their sentences («tirá-la» agrees); no new defects.
- Rejected: pt-BR/c15.md [18] — «a quem custa muitos trabalhos» in the singular, where the source has the plural «le cuestan» — In Portuguese the subject of «custar» is the infinitive «pô-los em limpo», and «muitos trabalhos» is the cost, so the singular is grammatical. The generic present sense of the source is kept.
- Rejected: pt-BR/c15.md [18] — «e assim não andem as almas» adds «assim» to «y no anden» — It makes explicit the purpose the source's «y» carries here: knowing the signs keeps souls from such distress. The meaning is unchanged.
- Rejected: pt-BR/c25.md [18] — «embora não me pareça que nenhuma em tanto extremo» is elliptical — It follows the source's own ellipsis («aunque no me parece ninguna en tanto extremo») and stays understandable.

### Part 3 of 4, Round 1 (claude, full read)
Verdict: 1 meaning-level, 4 minor. Read c26–c33 in full: one meaning fix (c28 [18], the confessor is the one who increases the fear), two missing translator-note markers in c31, two accent slips on Álvarez in c30 notes; audit flags checked, nothing to change.
- `pt-BR/c28.md` [18]: “de curar o medo que eu trazia, quando este se tornava maior” → “de curar o medo que eu trazia, fazendo-mo maior” — source «puniéndomele mayor»: the confessor himself made the fear greater while trying to cure it; the translation turns it into the fear growing by itself *(meaning)*
- `pt-BR/c31.md` [13]: “tendo rezado um noturno e dizendo” → “tendo rezado um noturno[^14] e dizendo” — translator's note [^14] on «noturno» is defined but has no marker in the text
- `pt-BR/c31.md` [24]: “é como no canto de órgão, em que” → “é como no canto de órgão[^15], em que” — translator's note [^15] on «canto de órgão» is defined but has no marker in the text
- `pt-BR/c30.md` [25]: “assegurar ao P. Alvarez e a Salcedo” → “assegurar ao P. Álvarez e a Salcedo” — the name is spelled Álvarez in every other note of the book (c26, c28, c29, c32, c33)
- `pt-BR/c30.md` [29]: “O P. Baltasar Alvarez, segundo Gracián.” → “O P. Baltasar Álvarez, segundo Gracián.” — the name is spelled Álvarez in every other note of the book
- Rejected: audit: emphasis markers (18 flags, c27–c33) — pt-BR adds italics the source lacks — the italics mark retained Latin (Laetatus sum…, Domine da mihi aquam, sed suaviter et efficaciter) or Teresa's original spellings quoted in the editor's notes; this follows the house rule and is applied consistently
- Rejected: pt-BR/c26.md [3] — «temerosa de qualquer coisa que não seja ofender a Deus» looked like a reversed negation of «temerosa de nada, sino de ofender a Dios» — here «nada» means «anything»: the soul fears anything except offending God. The translation is correct and matches Lewis
- Rejected: pt-BR/c27.md, c28.md «vossa mercê» vs Key Terms «Vossa Mercê» — lowercase form of address — this is reverential capitalization, which the rules say not to normalize; each file is internally consistent
- Rejected: pt-BR/c30.md [25] — «Breve introdução» where the source has «Breve traducción» — the work's actual title is «Breve introducción»; the rendering is not wrong for the reader
- Rejected: pt-BR/c32.md [9] — added «não» in «para que eu não torne a cair» — the source «para que yo torne a caer» drops the negation, which the sense requires; supplying it is correct

### Part 3 of 4, Round 2 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Read c26–c33 in full (text, editor's notes, translator's notes, marker placement): every source footnote is present and placed, the round-1 fixes hold, the translator's notes check out factually, and no defects were found.
- Rejected: pt-BR/c32.md [13], [16] — «Relisiones/relisiones» rendered «Ordens religiosas», while the Key Terms row lists «Religião» for the religious order — That row records the capitalised «Religião» where the translation keeps it; «Ordens religiosas» gives the same sense. In [16], «fundado as religiões» would mislead a modern reader into reading «religions».
- Rejected: pt-BR/c32.md [19] — «tendo já comprada a casa em bom lugar» for «en buena parte», which could mean «largely» — Reading «en buena parte» as a good location is the standard interpretation (Lewis, Kavanaugh) and fits «aunque pequeña»; not a mistranslation.
- Rejected: pt-BR/c31.md [13], [20] — Teresa's spellings «inistante», «pusilaminidade» are not italicised, while c32 italicises *sentible* and *disistir* — Each file is internally consistent, and the editor's note marks the spelling in both cases.
- Rejected: pt-BR/c26.md [5] — «cuestión» rendered «tortura» — In 16th-century Spanish «cuestión» carries the sense of «cuestión de tormento»; the rendering is defensible and keeps the contrast with «repreensão».
- Rejected: pt-BR/c31.md [27] — subject of «ayuda su Majestad» shifted to the small things («ajudam, com o favor de Sua Majestade») — The agency of His Majesty is kept explicitly and the reader gets the same sense; a style choice.
- Rejected: audit: emphasis markers (18 flags, c27–c33) — pt-BR has italics the source lacks — They mark retained Latin or Teresa's original spellings quoted in the editor's notes, per house rule; already rejected in round 1 and nothing new.

### Part 4 of 4, Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Read c34–c40, carta and prologo in full. The text is faithful; I fixed one false claim about the Vulgate in a translator's note, added the missing markers for two translator's notes, and trimmed one note to what is certain.
- `pt-BR/c35.md`: “Teresa toma-o no sentido do castelhano *fingir* e aplica a Deus o que no salmo se diz do ‘trono da iniquidade’.” → “Teresa toma-o no sentido do castelhano *fingir*.” — Translator's note [^16]. In the Vulgate, 'Numquid adhaeret tibi sedes iniquitatis, qui fingis laborem in praecepto', the clause 'qui fingis' agrees with 'tibi', so it is addressed to God, not said of the throne of iniquity. The claim is false; cut it. *(meaning)*
- `pt-BR/c37.md` [13]: “*ilustre*[^5].” → “*ilustre*[^5][^7].” — Translator's note [^7], on letter titles and the blank space left on the paper, is defined but no paragraph cites it. Its place is here, at 'deixa papel… ilustre'.
- `pt-BR/c38.md` [33]: “as Bulas da Ordem” → “as Bulas da Ordem[^17]” — Translator's note [^17], on the 'Bulas da Ordem', is defined but no paragraph cites it.
- `pt-BR/c39.md`: “O maravedi era a menor unidade de conta de Castela; o ducado valia 375 maravedis. A desproporção entre o que se paga da dívida e o que se recebe de volta é, pois, imensa.” → “O maravedi era a unidade de conta de Castela; o ducado valia 375 maravedis.” — Translator's note [^14]. 'Menor unidade' is uncertain, since the blanca was worth half a maravedi; cut back to what is certain. The last sentence only restates the text.
- Rejected: pt-BR/c34.md [32] — The source says 'o el P. Ibáñez' (or); the translation says 'e'. — The note opens with 'los dos grandes varones', so 'and' is the sense meant.
- Rejected: pt-BR/c34.md [37] — The source's 'Barrientes' is given as 'Barrientos'. — The man's name is Barrientos. This is a probable OCR or press slip in a proper name; it does not change what the reader learns.
- Rejected: pt-BR/c36.md [17] — 'cabildo' rendered as 'cabido', with translator's note [^28]. — The editor's note 14 records that the Cabildo was invited to the junta, and the translator's note gives both senses of the word, so it does not overstate.
- Rejected: pt-BR/c39.md [5] — Translator's note [^13] links the voice 'como envolta num silvo' to 1 Kings 19:12. — The Vulgate citation 'sibilus aurae tenuis' and the numbering '3 Reis' are correct, and the note offers the link as an echo, not as a source Teresa cites.
- Rejected: pt-BR/c35.md [22] / c38.md [40] — 'Trianos' in one note and 'Tríanos' in the other. — They are in different files, and each file is consistent with itself.

### Part 4 of 4, Round 2 (claude, full read)
Verdict: 2 meaning-level, 2 minor. Read c34–c40, carta and prologo in full. Fixed a reversed ironic clause in c39 ¶15 and a referent wrongly committed to Teresa in c39 ¶21 (meaning), and made the quotation marks in c39 consistent (minor). The rest is faithful.
- `pt-BR/c39.md` [15]: “salvo umas coisinhas miúdas como sal, que não têm peso nem volume — parece que um pássaro as levaria no bico —, e que não temos por grande efeito e mortificação;” → “a não ser que tenhamos por grande efeito e mortificação umas coisinhas miúdas como sal, que não têm peso nem volume — parece que um pássaro as levaria no bico —;” — The source says 'salvo sí unas cositas menudas como sal… no tenemos por gran efeto y mortificación', which is ironic: unless we count such trifles as great effects. The next clause ('pois fazemos caso de algumas coisas') confirms it, and Lewis reads it the same way. The translation says we do not count them as great, which reverses the sense. *(meaning)*
- `pt-BR/c39.md` [21]: “sem me apegar a nada mais do que a contentar o Senhor” → “sem ir apegada a nada mais do que a contentar o Senhor” — The source says 'una persona de su parte que me diese la mano… sin ir asida a nada más de a contentar al Señor'. 'Asida' most naturally agrees with 'persona', the helper God sent. The translation makes Teresa the one detached. The new wording keeps the source's feminine form and its reference open. *(meaning)*
- `pt-BR/c39.md` [10]: “mas chamo “dito por mim” o que” → “mas chamo «dito por mim» o que” — The source has «dicho de mí». The rest of c39 uses «» for quotations, so these marks make the file inconsistent.
- `pt-BR/c39.md`: “A voz “como envolta num silvo” ecoa” → “A voz «como envolta num silvo» ecoa” — Translator's note [^13]. The other quotations in c39 use «», so this note should too.
- Rejected: pt-BR/c34.md [16] — 'servir a el Señor de principio' is rendered 'como no princípio'. — 'De principio' means afresh, as at the start. 'Como no princípio' is a defensible reading and does not misinform the reader.
- Rejected: pt-BR/c38.md [4] — 'para estimar y tener en poco' is rendered 'para ter em pouco', dropping 'estimar'. — In this context 'estimar' only weighs things before the verdict 'tener en poco'. Adding 'estimar' back would read as a contradiction in Portuguese, and dropping it costs no sense.
- Rejected: pt-BR/c36.md [21] — Added 'pobres' and 'todos' ('umas pobres mulherzinhas', 'digo a todos os que'), and the parentheses flagged by the audit. — Both render the diminutive and the clarifying aside of the source without changing the sense. The parentheses only set off Teresa's 'digo a los que…'.
- Rejected: pt-BR/c39.md [27] / [^15] — The note says the Quicumque was said at Prime on Sundays. — This is correct for the Breviary of Teresa's time.

### Part 4 of 4, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c39: verified the four round-2 fixes (¶15, ¶21, ¶10, note [^13]) and reread ¶9–¶11, ¶14–¶16, ¶20–¶22 and notes [^13]–[^15]; found no defects.
- Rejected: pt-BR/c39.md [15] — The fix turns the trifles clause into an ironic 'a não ser que tenhamos por grande efeito…'. — 'Salvo sí… no tenemos por gran efeto' carries an expletive 'no'. The new wording gives the ironic sense, agrees with 'pois fazemos caso de algumas coisas', and the sentence stays grammatical.
- Rejected: pt-BR/c39.md [21] — The fix changes 'sem me apegar' to 'sem ir apegada'. — 'Apegada' agrees with 'uma pessoa', as 'asida' does in the source. The clause stays intact.
- Rejected: pt-BR/c39.md [10] — 'los grandes trabajos que se pasan en tratar personas a quien Dios…' is rendered as trials that those persons undergo in dealing with others. — The Spanish is ambiguous, and Lewis also makes those persons the ones who suffer. The reading is defensible.
- Rejected: pt-BR/c39.md [14] — '¿y no los fiaremos nosotros?' is rendered 'e não os confiaremos nós a Ele'. — It follows the parallel 'Fíanse ellos mesmos de Dios': we entrust them to God as they entrust themselves. The reading is defensible and does not misinform.
