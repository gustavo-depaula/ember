
## Termos

| one substance / similar substance | uma só substância / substância semelhante | Distinção central da argumentação; os termos gregos são conservados em itálico. |
| likeness / equality | semelhança / igualdade | Mantida a distinção verbal que estrutura os §§ 67–76. |
| Ursacius / Valens / Germinius | Ursácio / Valente / Germínio | Conforme os diários das obras de Santo Atanásio. |
| Hosius / Basil / Eustathius | Ósio / Basílio / Eustátio | Conforme os diários das obras de Santo Atanásio. |
| Paul of Samosata / the Samosatene | Paulo de Samósata / o samosatense | |
| Photinus / Marcion | Fotino / Marcião | Formas já empregadas no corpus. |
| Sirmium / Nicæa / Ancyra | Sírmio / Niceia / Ancira | |
| Seth / Methuselah | Set / Matusalém | |
| jointly suffered | sofreu conjuntamente | Conservada a expressão cuja ambiguidade o autor examina no § 79. |

## Decisões

- Traduzidos os parágrafos-fonte 170–200, preservando os 31 parágrafos, a numeração autoral 67–92 e os parágrafos separados do credo e de sua explicação.
- No parágrafo 184, “Father and to Himself” foi entendido como lacuna de “Son” e traduzido “Pai e Filho de si mesmo”, conforme a formulação completa retomada no parágrafo 185.
- No parágrafo 186, removido o resíduo tipográfico “k29--'” após o termo grego e restituído o ponto de interrogação exigido pela frase.
- Conservadas as grafias gregas recebidas, inclusive “ὁμοοίσιον” nos parágrafos 182 e 189, sem normalização silenciosa; todas aparecem em itálico.
- No parágrafo 173, conservada a referência João 4:13; no parágrafo 176, conservados os duzentos e trinta anos de Adão, conforme a fonte.
- No parágrafo 197, adotado “tu” no diálogo com o interlocutor hipotético singular; mantido “vós” nas interpelações aos bispos.
- No parágrafo 196, conservada a designação “Concílio de Samósata”, tal como recebida, sem substituição por outra localização.
- Não foram acrescentadas notas do tradutor neste trecho; as distinções terminológicas são desenvolvidas pelo próprio autor.

## Review log

### Round 1 (claude, full read)
Verdict: 5 meaning-level, 6 minor. Full read of ch001 [1]-[200], journal and book.json: 5 meaning fixes (qualifier in [11], misreadings in [44] and [73], misattribution to Photinus in [144], inverted negation in [197]) and 6 minor fixes for consistency and format.
- `pt-BR/ch001.md` [11]: “Interpreta-o de modo bastante favorável.” → “Interpreta-o de modo um tanto favorável.” — source says 'somewhat favourably', a moderating qualifier; 'bastante' turns it into an intensifier *(meaning)*
- `pt-BR/ch001.md` [17]: “o abuso que dela fez o samosateno” → “o abuso que dela fez o samosatense” — Key Terms gives 'o samosatense', which [194] uses
- `pt-BR/ch001.md` [32]: “*Uma cópia da Blasphemia composta em Sírmio por Ósio e Potâmio.*” → “*Uma cópia da* Blasphemia *composta em Sírmio por Ósio e Potâmio.*” — source sets Blasphemia in roman inside the italic heading; [66] keeps the same contrast for 'Dedicação'
- `pt-BR/ch001.md` [34]: “o Pai Todo-poderoso” → “o Pai Todo-Poderoso” — the file otherwise writes 'Todo-Poderoso' ([67], [76], [84])
- `pt-BR/ch001.md` [44]: “Pois só Ele possui aquilo que deu” → “Pois Ele possui somente aquilo que deu” — 'He only has what He gave' means He has only what He gave, so the gift equals what He has; 'só Ele possui' says only He possesses it, which the argument does not say *(meaning)*
- `pt-BR/ch001.md` [73]: “Ele é tudo aquilo que o Pai é” → “Ele está em tudo aquilo em que o Pai está” — source: 'He is in all in which the Father is'; 'é tudo aquilo que o Pai é' would also make Him Father *(meaning)*
- `pt-BR/ch001.md` [144]: “e o Pai não fez chover de si mesmo, como o Senhor da parte do Senhor, conforme dizem Fotino e Sabélio;” → “e não, como dizem Fotino e Sabélio, que o Pai tenha feito chover de si mesmo, como o Senhor da parte do Senhor;” — Photinus and Sabellius say the Father rained from Himself; moved to the end of the clause, the phrase attributes the negation to them *(meaning)*
- `pt-BR/ch001.md` [181]: “enganaram o imperador para que” → “enganaram o Imperador para que” — the file writes 'Imperador' in [16] and [23]
- `pt-BR/ch001.md` [181]: “porque o imperador, por vossas” → “porque o Imperador, por vossas” — the file writes 'Imperador' in [16] and [23]
- `pt-BR/ch001.md` [188]: “Pai todo-poderoso” → “Pai Todo-Poderoso” — the file otherwise writes 'Todo-Poderoso'
- `pt-BR/ch001.md` [197]: “para que aquilo que me oferecem não seja leite, mas não leite de ovelha” → “receando que aquilo que me oferecem seja leite, mas não leite de ovelha” — source: 'lest that which is offered be milk but not sheep's milk'; 'para que … não seja' adds a negation and makes the clause say the reverse *(meaning)*
- Rejected: pt-BR/ch001.md [162], [169] — audit: parentheses replaced by dashes — the dashes keep the same parenthetical content and boundaries; this is a style choice
- Rejected: pt-BR/ch001.md (emphasis audit) — 166 emphasis-count differences — they come from the **n.** paragraph numbers and the italicised Greek terms, both house format
- Rejected: pt-BR/ch001.md [167] — source 'Unbegotten' rendered 'Unigênito' — the source has an evident slip: the clause concerns the Son and only 'Only-begotten' fits 'His source is the Unborn substance'
- Rejected: pt-BR/ch001.md [197] — 'tu' address to the hypothetical objector — this is a journal decision and the singular reading is defensible
- Rejected: pt-BR/ch001.md [73] — 'dividing the three substances' rendered 'distinguir' — it fits the sentence, which goes on to deny any separation of substance

### Round 2 (codex, full read)
Verdict: 3 meaning-level, 0 minor. Leitura integral dos 200 parágrafos, das duas notas, do diário, de book.json e dos apontamentos da auditoria: três defeitos de sentido.
- `pt-BR/ch001.md` [193]: “e, por conseguinte, mais de oito almas tenham sido salvas” → “e, por conseguinte, não tenham sido salvas mais de oito almas” — Na fonte, 'lest' abrange também a consequência de terem sido salvas mais de oito almas. A tradução deixa essa segunda oração afirmativa. *(meaning)*
- `pt-BR/ch001.md` [193]: “para que algum dos que sepultaram Moisés não tenha conhecido” → “para que nenhum dos que sepultaram Moisés tenha conhecido” — 'Lest any one ... should have known' significa impedir que qualquer deles tenha conhecido, não que algum deles não tenha conhecido. *(meaning)*
- `pt-BR/ch001.md` [196]: “do Deus ingênito, que é gerado, mas coeterno” → “do Deus ingênito, e que o Filho é gerado, mas coeterno” — A fonte retoma o Filho em 'that He is begotten'. A oração relativa portuguesa liga 'é gerado' ao antecedente imediato 'Deus ingênito', confundindo os sujeitos. *(meaning)*
- Rejected: pt-BR/ch001.md [47], [137], [158] — Tradução de 'impossible', 'possible' e 'possibility' por termos relativos à impassibilidade e à passibilidade. — O contexto trata expressamente da capacidade de padecer; são lapsos tipográficos evidentes da fonte, corretamente interpretados na tradução.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 [1]-[200], notes, journal and book.json; earlier fixes verified, no new defects found.
- Rejected: pt-BR/ch001.md [129] — 'going forth as an utterance from the speaker's lips' may have lost 'as an utterance' — 'a palavra que sai dos lábios de quem fala' carries the same sense; nothing the reader needs is lost
- Rejected: pt-BR/ch001.md [^1] — translator's note on ὁμοούσιος / ὁμοιούσιος checked as a claim of fact — The meanings are correct, and the -ον forms are the neuter/accusative of the same adjectives. The note adds information for the introduction, where the terms appear before the author explains them
- Rejected: pt-BR/ch001.md [^2] — translator's note linking essentia to esse checked as a claim of fact — The etymological relation is correct and explains 'because it is always' (quia semper est); it does not merely restate the text
- Rejected: pt-BR/ch001.md [59] — 'rather to be with God than to be born' rendered 'estava com Deus, em vez de estar nascendo' — It keeps the source's contrast between being with God and coming to be; the wording is a style choice
- Rejected: pt-BR/translation-journal.md — 'Não foram acrescentadas notas do tradutor neste trecho' while [14] and [36] carry notes — The decision covers source paragraphs 170–200 only, and that range has no notes, so the claim is true
