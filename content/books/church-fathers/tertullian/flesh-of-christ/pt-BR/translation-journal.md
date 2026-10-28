
## Termos

| sensual / sense | dotado de sensibilidade / sensibilidade, sensação, sentido | No capítulo 12, vocabulário da percepção, sem conotação erótica. |
| Word / word of God | Verbo / palavra de Deus | “Verbo” quando designa a Pessoa; conforme as obras irmãs. |
| dispensation | dispensação | Conforme *Contra Práxeas* e *Sobre a monogamia*; ver nota [^3]. |
| sinful flesh / sin in the flesh | carne pecadora / pecado na carne | Distinção entre *carnem peccati* e *peccatum carnis*, central no capítulo 16. |
| Ebion | Ébion | Conforme o *Apêndice* e *Sobre o véu das virgens*. |
| Æons | Éons | Conforme *Contra os valentinianos* e *Contra Práxeas*; ver nota [^4]. |
| Alexander / Michael / Zechariah | Alexandre / Miguel / Zacarias | |
| David / Jesse / Solomon / Jonas | Davi / Jessé / Salomão / Jonas | Davi, Jessé e Salomão conforme as obras irmãs de Tertuliano. |
| Eve / Elisabeth / Jacob / Emmanuel | Eva / Isabel / Jacó / Emanuel | |
| Mediator / quickening spirit | Mediador / espírito vivificante | |
| loins / seed / stem / blossom | lombos / semente / ramo / flor | Preservadas as imagens corporais, genealógicas e vegetais do argumento. |
| prescriptive testimony | testemunho de prescrição | Mantido o vocabulário jurídico já adotado. |
| On the Testimony of the Soul / On the Resurrection of the Flesh | Sobre o testemunho da alma / Sobre a ressurreição da carne | Títulos citados nos capítulos 12 e 25. |

## Decisões

- Traduzidos os parágrafos 25–52, correspondentes aos títulos e textos dos capítulos 12–25, sem dividir ou fundir os parágrafos da fonte; as duas notas do tradutor são acréscimos identificados.
- Conservada a grafia latina “Animœ anima sensus est” exatamente como fornecida. Mantidos também *coagulum*, *mamilla* e *ex abundanti*, sem acrescentar traduções ao texto onde a fonte não as fornece.
- Nos capítulos 18–19, preservado o emprego de “Espírito” para o Filho, sem substituí-lo por “Espírito Santo”; esta última forma traduz as ocorrências explícitas de “Holy Ghost”.
- No capítulo 19, preservado o contraste entre o singular e o plural de João 1:13, inclusive a acusação de adulteração feita pelo autor, sem harmonização com outra redação bíblica.
- No capítulo 20, “made” foi traduzido por “feito”, distinguindo-o de “nascido”, porque o argumento depende dessa diferença; mantidas as formulações fisiológicas da edição.
- No capítulo 23, preservadas as afirmações sobre a virgindade, o parto e o “ventre aberto”, inclusive “esposa” para “wife”, sem harmonização doutrinal. Mantida também a atribuição a Ezequiel da passagem sobre a novilha, sem acrescentar uma referência ausente da fonte.
- Mantida a referência “Isaías 46:9” no capítulo 24, tal como fornecida.
- Acrescentada a nota [^3], no capítulo 17, para esclarecer o sentido teológico de “dispensação”, e a nota [^4], no capítulo 24, para explicar “Éons” e sua relação com a imagem das genealogias.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of ch001 [1]–[52], footnotes, journal and book.json: one broken quotation of Christ in [12] and one drift (“idea”→“realidade”) in [4]; otherwise faithful and complete.
- `pt-BR/ch001.md` [12]: ““De quem”, diz ele, “se envergonhar de mim, também eu me envergonharei.”” → ““Quem”, diz ele, “se envergonhar de mim, dele também eu me envergonharei.”” — source: “Whosoever shall be ashamed of me, of him will I also be ashamed”; “De quem” cannot be the subject of “se envergonhar”, and the clause “of him” was lost
- `pt-BR/ch001.md` [4]: “não conseguiram apreender plenamente a realidade de sua carne” → “não conseguiram apreender plenamente a ideia de sua carne” — source: “failed to grasp the full idea of His flesh”; “realidade” replaces the notion with the fact
- Rejected: pt-BR/ch001.md [21], [33] — emphasis markers added — italics on the retained Latin *animalis*, *Carnem Peccati* and *Peccatum Carnis*, as the house rules require
- Rejected: pt-BR/ch001.md [22] — parenthesis “(that is)” dropped — rendered as “isto é,” in the running text; nothing is lost
- Rejected: translation-journal.md, Termos, row sensual — “dotado de sensibilidade” ×0 — the text has the feminine “dotada de sensibilidade”, which agrees with “alma”; the row is correct
- Rejected: pt-BR/ch001.md [6] — “Poupai” breaks the series of third-person jussives in Marcion's speech — the source has a direct imperative “Spare”; a plural address is defensible
- Rejected: pt-BR/ch001.md [37] — heading “Ela é aqui chamada” for “He is Here Called” — it agrees with “segunda Pessoa”, and the referent stays clear

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral dos 52 parágrafos, das quatro notas, do diário e de book.json; conferidos os apontamentos mecânicos. Encontrados dois defeitos de sentido.
- `pt-BR/ch001.md` [16]: “aquela passagem em que os que admiravam sua doutrina diziam conhecer” → “essa passagem, pois os que admiravam sua doutrina diziam conhecer” — A fonte introduz uma justificativa com “because”; a tradução a transforma numa oração relativa, perdendo a relação causal. *(meaning)*
- `pt-BR/ch001.md` [38]: “para que, sendo inteiramente filho de um homem, não deixasse” → “para evitar que, se fosse inteiramente filho de um homem, deixasse” — “Lest” abrange tanto deixar de ser Filho de Deus quanto nada ter a mais que Salomão ou Jonas. A redação atual apresenta a segunda consequência como finalidade desejada e perde o caráter condicional de “if”. *(meaning)*
- Rejected: pt-BR/ch001.md [8] — Menção ao Evangelho de João seguida da referência Mateus 3:16. — A discrepância já consta da fonte canônica e foi fielmente preservada.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of ch001 [15]–[17], [37]–[39] and footnotes: both round-2 fixes are correct; one new meaning defect in [16] (“not have been in existence” narrowed to “not alive”).
- `pt-BR/ch001.md` [16]: “poderiam não estar vivas” → “poderiam não existir” — source: “might possibly not have been in existence”; “não estar vivas” narrows this to having died and leaves out brothers who were never born, which the next sentence (“nem todos temos irmãos ou mãe”) depends on *(meaning)*
- Rejected: pt-BR/ch001.md [16] — check of the round-2 fix “essa passagem, pois os que admiravam…” — renders “because” correctly; the sentence's concord and its link to the preceding clause are intact
- Rejected: pt-BR/ch001.md [38] — check of the round-2 fix “para evitar que, se fosse inteiramente filho de um homem, deixasse…” — it renders “lest … if” faithfully; both consequences now depend on “para evitar que”, and the following “e nada tivesse” agrees
- Rejected: pt-BR/ch001.md [38] — lowercase “filho de um homem” beside “Filho de Deus” — source: “the Son of a man”, which names the hypothetical human sonship, not the title; the contrast is a defensible choice
- Rejected: pt-BR/ch001.md [38] — “faltava-lhe apenas assumir carne” for “He only wanted to assume flesh” — “wanted” here means “lacked”; the rendering is correct

### Round 4 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 52 parágrafos, das quatro notas, do diário e de book.json, com conferência dos apontamentos mecânicos: nenhum novo defeito objetivo encontrado.
