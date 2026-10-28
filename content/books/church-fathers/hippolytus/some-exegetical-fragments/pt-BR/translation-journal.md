
## Termos

| Only-begotten / Hades | Unigênito / Hades | |
| Targum / the Seventy | Targum / os Setenta | “Targumist expositor” → “expositor do Targum”. |
| psalm / song / psalmody / psaltery | salmo / cântico / salmodia / saltério | “Saltério” também designa o livro dos Salmos. |
| psalm of song / song of psalmody | salmo de cântico / cântico de salmodia | Mantida a distinção técnica de §492. |
| Songs of degrees / speculation | Cânticos dos degraus / contemplação | “Speculation” designa aqui a atividade contemplativa, contraposta à prática. |
| Sem / Cham / Japheth | Sem / Cam / Jafé | “Chain” regularizado como “Cham”. |
| Helkanah / Shemaiah / Iddo / Achia / Chizkiel | Elcana / Semeias / Ado / Aías / Ezequiel | Formas portuguesas dos nomes bíblicos reconhecíveis. |
| Bachthansar / Babel / Aspasianus / Adrian | Nabucodonosor / Babilônia / Vespasiano / Adriano | |
| Asaph / Idithum (Jeduthun) / Aman (Heman) / Ethan | Asaf / Iditum (Jedutun) / Amã (Hemã) / Etã | Preservadas as variantes entre parênteses. |
| Theodotion / Symmachus / Aquila | Teodocião / Símaco / Áquila | |
| rattles / cubit | matracas / côvado | Instrumentos de madeira percutidos em §§446–449. |

## Decisões

- Traduzidos os 243 parágrafos de §291 a §533, preservando inclusive os parágrafos compostos de uma única palavra ou sinal de pontuação, as frases interrompidas e a divisão entre §§473–474, onde falta o termo hebraico anunciado pela fonte.
- Conservadas as peculiaridades históricas, genealógicas, cronológicas e numéricas da fonte, inclusive a tradução do Targum siríaco para o hebraico atribuída aos Setenta (§311), a sucessão dos transmissores da lei, “Moisés” em vez de Noé (§455), os três dias de luto (§479) e as referências Salmos 127:7 e 139:15.
- Regularizados erros tipográficos inequívocos, entre eles “tinder” → “under” (§307), “clown” → “down” (§311), “be” → “he” (§§416 e 494), “Chain” → “Cham” (§§438 e 456), “live” → “five” (§464), “sun” → “son” (§480), “110 to years” (§481), “hook” → “book” (§485), “simpleway” (§492), “who who” (§508), “rounded” → “founded” (§512) e “alleges” → “aliens” (§515). Em §472, recomposta a ordem evidentemente corrompida de “their fathers”. Em §520, “IXXXIX” foi lido como “LXXXIX”, isto é, 89.
- Conservadas em itálico, sem reconstrução conjectural, as sequências gregas corrompidas da fonte em §§493, 506 e 515; traduzidas as explicações que as acompanham.
- Mantidas as formas de nomes obscuros cuja identificação não é segura, como Anathal, Taleg, Babin, Ephran, Abdiahu e Samean; “Jacobus Rohaviensis” foi vertido como “Jacó Rohaviensis”, sem substituir o qualificativo por uma identificação geográfica conjectural.
- “Pence” (§487) foi vertido como “denários”, em referência às duas dívidas da parábola evangélica; mantidos os valores cinquenta e quinhentos.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of ch001 [1]–[533]: faithful and complete; two minor fixes (verb form in the heading of [76], transplanted ':—' in [507]).
- `pt-BR/ch001.md` [76]: “Bispo de Roma, Antepor à sua Exposição” → “Bispo de Roma, Antepôs à sua Exposição” — source 'Prefixed by Hippolytus'; the infinitive 'Antepor' leaves the relative clause without a finite verb; the past tense 'Antepôs' is needed
- `pt-BR/ch001.md` [507]: “*Hipólito, então, respondeu*:—” → “*Hipólito, então, respondeu*:” — source punctuation ':—' transplanted; elsewhere ([45], [54], [56], [312]) the file uses a plain colon
- Rejected: pt-BR/ch001.md [55], [209], [241] — audit: parentheses differ — the editorial supplies '(we should say)', '(Himself)' and '(shall)' are absorbed into the Portuguese syntax ('diríamos', 'se revela', 'terminarão'); nothing is lost
- Rejected: pt-BR/ch001.md [88]–[266] and others — audit: emphasis markers differ — these are the house-style bold paragraph numbers (**1.**) and italics for retained foreign words such as *cemphus*; the formatting is correct
- Rejected: pt-BR/ch001.md [134], [303], [306], [452], [462], [469], [497]–[532] — audit: Scripture references differ — the source's Roman-numeral references (Prov. IX. 1, Ps. LV. 15, etc.) are converted to Portuguese chapter:verse with the same numbers
- Rejected: pt-BR/ch001.md [402] — added 'a' before 'José, filho de Gjuchanan' makes him a second recipient — this matches the source's parallel construction in [401] and the tradition that Antigonus handed the law to both Joses; the reading is defensible
- Rejected: pt-BR/ch001.md [50] — 'de quem é rico o pão, senão de nós?' for 'whose bread is rich, if not ours?' — an awkward but grammatical ellipsis ('de quem ... senão de nós'); the sense is preserved

### Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Leitura integral dos 533 parágrafos, notas, book.json, diário e alertas: três correções de sentido, duas relativas ao mesmo termo.
- `pt-BR/ch001.md` [112]: “pelo cabrito-montês, indica” → “pelo corço, indica” — A fonte diz “roe”, um cervídeo, não um cabrito-montês. *(meaning)*
- `pt-BR/ch001.md` [112]: “como um cabrito-montês, para manter” → “como um corço, para manter” — Também nesta ocorrência, “roe” designa um cervídeo. *(meaning)*
- `pt-BR/ch001.md` [494]: “E então, pouco a pouco, destinando” → “E então, algum tempo depois, destinando” — “By and by” indica um momento posterior; não afirma que a nomeação dos dirigentes ocorreu gradualmente. *(meaning)*
- Rejected: pt-BR/ch001.md [152] — Auditoria aponta um parêntese a menos. — O excedente da fonte está em “from (he land”, erro tipográfico por “from the land”. A tradução “da terra” está correta.
- Rejected: pt-BR/ch001.md [160] — O texto apresenta 500 anos como metade de 10.000. — A inconsistência numérica já está na fonte; a tradução a preserva.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of 533 paragraphs, notes, book.json and journal: one minor fix (dropped superlative in [311]); the text is otherwise faithful and complete.
- `pt-BR/ch001.md` [311]: “pela mão de nosso bem-aventurado guia” → “pela mão de nosso mui bem-aventurado guia” — Source says 'our most blessed ruler'. The superlative was dropped.
- Rejected: pt-BR/ch001.md [48] — 'Contudo, logo sua autoridade lhes traria dificuldades' for 'will not be by any means void of trouble to them' — The double negative is rendered as a positive with the same sense. Nothing is lost.
- Rejected: pt-BR/ch001.md [152] — 'num país onde não nascestes; e ali morrereis' shifts from singular to plural address — The quoted oracle addresses Jeconiah and his mother together, and Jeremiah 22:26 uses the plural there.
- Rejected: pt-BR/ch001.md [213] — 'encher o mar' where Daniel 2:35 has the earth — The source (Eusebius as quoted) says 'fill the sea'. The translation keeps the source's own wording.

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 1 minor. Revisados os parágrafos 310–312, a alteração e as notas fornecidas; tradução correta, com uma inexatidão menor na justificativa do diário.
- `pt-BR/translation-journal.md`: “The superlative was dropped, while the same preface keeps the others ('excelentíssima lei', 'poderosíssimo').” → “The superlative was dropped.” — A justificativa cita formas ausentes do parágrafo: a tradução traz 'excelente lei', conforme 'excellent law', e não contém 'poderosíssimo'. A correção de 'most blessed' continua válida.

### Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read: checked the one journal edit (round-3 log justification trimmed to 'The superlative was dropped.'). It is correct; no defects in what was shown.
- Rejected: pt-BR/translation-journal.md, Termos — The Key Terms table has no header or delimiter row — The table may have been excerpted for this message. It is outside the round-4 change and does not misstate anything.
