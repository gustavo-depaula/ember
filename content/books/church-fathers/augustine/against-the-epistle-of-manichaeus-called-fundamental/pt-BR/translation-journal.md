
## Termos

| existence / non-existence | existência / não existência | Oposição desenvolvida no capítulo 40. |
| supreme existence | existência suprema | Designação de Deus no parágrafo autoral 46. |
| Chief Good | sumo bem | Cabeçalho do capítulo 42. |
| voluntary corruption / penal corruption | corrupção voluntária / corrupção como castigo | Conserva-se a repetição de “corrupção”, essencial ao argumento. |

## Decisões

- Traduzidos os parágrafos-fonte 90–101, mantendo os 12 parágrafos, os cinco cabeçalhos, a numeração autoral e as referências bíblicas.
- Mantido “tu” nas interpelações ao interlocutor individual dos parágrafos autorais 44, 46 e 47; nas citações bíblicas dirigidas a uma pluralidade de ouvintes, empregado “vós”.
- No parágrafo autoral 45, conservada a oposição entre “corromper” e “destruir”, pois a discussão trata expressamente da escolha vocabular dos tradutores latinos.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of ch001 (101 paragraphs), book.json and the journal; fixed two fidelity slips ([7], [20]) and one word slip ([53]); audit flags are house-style formatting.
- `pt-BR/ch001.md` [7]: “se dignasse dar-me interiormente a convicção de sua existência” → “se dignasse convencer-me interiormente de si mesmo” — source: 'would vouchsafe to convince me inwardly of Himself'; the PT narrows this to conviction of God's existence, which the source does not say *(meaning)*
- `pt-BR/ch001.md` [20]: “preferiria aguardar o Paráclito como alguém que ainda viria a admitir que ele veio em Mani” → “antes aguardaria o Paráclito como ainda por vir do que admitiria que ele veio em Mani” — source: 'I should rather look for the Paraclete as still to come, than allow that He came in Manichæus'; 'ainda viria a admitir' reads as 'would come to admit' and hides the comparison *(meaning)*
- `pt-BR/ch001.md` [53]: “onde a vastidão sem limites se estende” → “onde o vazio sem limites se estende” — source: 'the boundless emptiness stretches'; 'vastidão' means vastness, not emptiness
- Rejected: pt-BR/ch001.md (audit: emphasis markers) — Emphasis counts differ from the source in 49 paragraphs — The difference comes from the house-style bold paragraph numbers and the italic Greek *ἄποιον*; nothing is wrong
- Rejected: pt-BR/ch001.md [36] vs [67] — The same Manichaean quotation is rendered differently ('pestífera'/'pestilenta', 'temível'/'terrível') — The source wording also differs ('land'/'region'); the variation is a style choice and the sense is unchanged
- Rejected: pt-BR/ch001.md [77] — Self-quotation of [71] uses vós where [71] uses tu — Augustine paraphrases rather than quotes verbatim, and here he addresses the Manichaeans in the plural ('if they can understand it'); defensible
- Rejected: pt-BR/ch001.md passim — Pronouns for God alternate between 'Ele' and 'ele' — The house rules forbid normalizing reverential capitalization; fixing it would mean many edits with no change in sense
- Rejected: pt-BR/ch001.md [27] — 'amado irmão de Pático' looks like a mistranslation of the vocative — It follows the canonical English 'beloved brother of Patticus'; the source is not corrected
- Rejected: pt-BR/ch001.md [^1] — Translator's note on 'assunção' — Accurate lexical clarification; it prevents a reading as the Marian Assumption, so it is not just a restatement of the text

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Lidos integralmente os 101 parágrafos, a nota do tradutor, book.json, o diário e os apontamentos mecânicos; encontrados dois defeitos de sentido.
- `pt-BR/ch001.md` [18]: “não fosse celebrada pelos que criam nele, diminuindo assim a devoção” → “não fosse celebrada pelos que criam em Mani, para não diminuir a devoção” — A intenção atribuída a Mani era impedir que a celebração da paixão de Cristo diminuísse a devoção à comemoração de sua própria morte. A tradução apresenta essa diminuição como resultado da ausência de celebração. *(meaning)*
- `pt-BR/ch001.md` [80]: “os corpos de animais ou de seres humanos” → “os corpos de reses ou de seres humanos” — O inglês especifica 'cattle', isto é, gado; 'animais' elimina essa especificação. *(meaning)*
- Rejected: pt-BR/ch001.md [53] — “Partes” traduz o estranho “pans” do inglês. — A enumeração de seis partes torna evidente o lapso de OCR por 'parts'; a tradução recupera corretamente o sentido.
- Rejected: pt-BR/ch001.md [75] — Atribuir os gansos ao fogo por serem bípedes contradiz a classificação anteriormente apresentada. — A incongruência está na fonte canônica, que diz 'in fire as bipeds'; a tradução a reproduz fielmente.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read: checked the fixes in ch001 [18] and [80] and read [17]–[19] and [79]–[81] in full; both fixes are correct and no new defects were found.
- Rejected: pt-BR/ch001.md [18] — The round-2 fix 'para não diminuir a devoção' could be read as going beyond the English 'so as to lessen' — In the source, the celebration of Christ's passion is what would lessen the devotion to Mani's Bema. The purpose reading is the only one that makes sense of the argument, and 'em Mani' correctly resolves the ambiguous 'himself'.
- Rejected: pt-BR/ch001.md [80] — Check whether 'reses' is right for 'cattle' — 'Rês/reses' means a head of cattle and keeps the source's specificity. The sentence's concord is intact.
- Rejected: pt-BR/ch001.md [81] — 'Só a corrupção é mal' for 'Evil Alone is Corruption' may reverse subject and predicate — 'Evil is nothing but corruption' and 'only corruption is evil' state the same identity, so the sense is unchanged.
