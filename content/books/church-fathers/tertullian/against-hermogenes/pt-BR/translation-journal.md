
## Termos

| substratum | substrato | Cap. 41; mantido o complemento parentético “(da criação)”. |
| equable impulse | impulso uniforme | Cap. 41; em oposição ao movimento turbulento. |
| Word / Wisdom | Verbo / Sabedoria | Designações pessoais no cap. 45; “His word”, na enumeração posterior, conserva a minúscula: “sua palavra”. |
| Stoics | estoicos | Cap. 44. |

## Decisões

- Mantidos os 16 parágrafos da fonte deste trecho, incluindo os títulos dos capítulos 39–45; a definição da nota [^4] é um acréscimo identificado.
- Nota [^4], no cap. 40: esclarece os sentidos de *kósmos* que fundamentam o argumento sobre o mundo e o ornamento.
- No cap. 39, preservada a alternância entre “separável” e “inseparável”, conforme a fonte, sem corrigir a aparente contradição.
- No título do cap. 41, “Now Uncertain and Vague” foi entendido como lapso por “How Uncertain and Vague” e vertido pela construção nominal “A incerteza e a imprecisão”.
- Preservada a referência Daniel 3:21, conforme a fonte, sem ajustá-la à passagem aludida.
- No cap. 45, mantidos o tratamento reverente “vossas mãos” e a passagem subsequente à terceira pessoa, bem como as formulações próprias das citações bíblicas.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 0 minor. Full read of ch001 [1]–[92], footnotes, journal and book.json; two fidelity fixes ([13] 'por si mesma', [17] lost 'at the present time'); audit flags checked and rejected.
- `pt-BR/ch001.md` [13]: “que existia por si mesma, apenas juntamente com Deus” → “que também ela existia, apenas juntamente com Deus” — source: "that it did itself exist, only along with God". This is an emphatic "itself" (it too existed), not "by itself"; "por si mesma" asserts self-subsistence and clashes with "only along with God". *(meaning)*
- `pt-BR/ch001.md` [17]: “ao dar-lhe meios, naquele momento, pelos quais” → “ao dar-lhe hoje meios pelos quais” — source: "giving Him means at the present time" (Latin hodie). The translation moved the time to the past moment of creation. *(meaning)*
- Rejected: pt-BR/ch001.md [7], [23] — audit: fewer parentheses in PT — "(the title)" and "this (evil)" are worked into the sentence ("o título Deus", "esse mal"). No content is lost.
- Rejected: pt-BR/ch001.md [39], [47], [55] — audit: emphasis counts differ — PT adds italics to the Greek words and to Est/erat, and merges "*without form*, *and*" into one span. No emphasis is lost.
- Rejected: pt-BR/ch001.md [5] — "aquele que o fez" for "which He made" — The next clause assigns imperfection to the maker ("and He made it of a part"), and the Latin reads "quod fecit". The reading is defensible.
- Rejected: pt-BR/translation-journal.md — "16 parágrafos" for chapters 39–45, which have 15 — A chunk starting at [77] (body of ch. 38) has 16 paragraphs. The claim cannot be shown false.
- Rejected: pt-BR/ch001.md [79] — "Deus não fez o mundo" adds an object to "God made it not out of His own self" — This follows the argument of ch. 2 (God made all things not of Himself). The sense is unchanged.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[92], das quatro notas, do diário, de book.json e dos alertas mecânicos; encontrada uma inversão de negação.
- `pt-BR/ch001.md` [49]: “ou, de outro modo, não fique impossibilitado” → “ou, de outro modo, fique impossibilitado” — A fonte diz “or else be unable”: ficar impossibilitado de aplicar o nome a uma espécie particular de Matéria. O “não” acrescentado inverte essa afirmação. *(meaning)*
- Rejected: pt-BR/ch001.md [75] — “Retratas o que declaraste” poderia parecer um falso cognato de “retract”. — Retratar também admite uso transitivo no sentido de retirar ou desdizer uma declaração; a construção é válida.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of ch001 [48]–[50]: the round-2 fix in [49] removed a negation the source requires; restored with 'nem'. Headings [48] and [50] are clean.
- `pt-BR/ch001.md` [49]: “ou, de outro modo, fique impossibilitado” → “nem, de outro modo, fique impossibilitado” — Source: 'in order that I may be sure … and so not claim … or else be unable …'. The 'not' covers both alternatives, so certainty prevents both outcomes. Without the negation, becoming unable to apply the name to a species of Matter becomes a purpose, which contradicts the argument. 'nem' restores the negation without the ambiguity of 'ou … não'. *(meaning)*
- Rejected: pt-BR/ch001.md [49] — Round 2 held that 'não fique impossibilitado' inverted 'or else be unable' — The clause sits under 'not claim … or else be unable', a negated disjunction in a purpose clause. Both undesirable outcomes are excluded, so the negation is required. Dropping it inverted the sense.

### Round 4 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos parágrafos [1]–[92], das quatro notas, do diário, de book.json e dos cinco alertas mecânicos; nenhum novo defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [71] — A expressão “prova manifesta de sua existência” parece contradizer a argumentação contra a existência da Matéria. — A fonte canônica diz expressamente “the manifest proof of its existence”; a tradução preserva essa formulação, que não cabe corrigir por interpretação.
