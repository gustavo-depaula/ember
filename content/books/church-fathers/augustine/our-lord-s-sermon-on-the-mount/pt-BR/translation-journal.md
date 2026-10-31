
## Decisões

- No §87, “turnouts of men” foi traduzido por “tumultos dos homens”, segundo o contexto das perturbações comparadas aos ventos.
- Conservado em um único parágrafo o §87, que encerra o Livro Segundo e a obra.

## Review log

### Part 1 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of ch001.md (§1–80); three fixes: 'serving of the body' rendered as care of the body (§17), an ambiguous negation in §55, and a misplaced 'sequer' in §72; audit flags are formatting only.
- `pt-BR/ch001.md` [26]: “e o cuidado do corpo abaixo” → “e o serviço do corpo abaixo” — source: 'the serving of the body the lower', i.e. the body's service, picked up again by 'the service of the body' in the next clause; 'cuidado do corpo' turns this into care given to the body *(meaning)*
- `pt-BR/ch001.md` [76]: “O misericordioso, porém, não oferece resistência com o propósito de corrigir” → “O misericordioso, porém, deixa de resistir com o propósito de corrigir” — source: 'offers no resistance, that he does it for the purpose of correcting'; the PT negation can be read as 'he does not resist in order to correct', which inverts the point *(meaning)*
- `pt-BR/ch001.md` [96]: “embora nas palavras destes não encontremos sequer o que desejaram” → “embora também nas palavras destes não encontremos o que desejaram” — source: 'although even in the words of these we do not find what they have wished'; 'even' goes with 'in the words of these', not with the object
- Rejected: pt-BR/ch001.md [50] — 'para fora da porta da cidade' adds 'da cidade' to 'outside the gate' — the reference is the young man of Nain, carried out of the city gate (Lk 7:12); this makes explicit what the source refers to and adds nothing false
- Rejected: pt-BR/ch001.md [23] — 'nossa cidadania está nos céus' for 'our conversation is in heaven' — 'conversation' is the archaic rendering of politeuma/conversatio; 'cidadania' gives its sense and does not misinform
- Rejected: pt-BR/ch001.md [81] — PT 'por ti, como seu senhor' where the source reads 'by time as his master' — 'time' is an OCR slip for 'thee', and the PT renders the intended sense correctly
- Rejected: pt-BR/ch001.md [91] — 'por julgares que' added before the two reasons — it makes explicit that these are the lender's mistaken motives, which the sentence requires to make sense; it does not change the meaning

### Part 1 of 2, Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos 106 blocos de ch001.md (§§1–80), das três notas, do audit, do journal e de book.json; encontrados dois defeitos menores de construção.
- `pt-BR/ch001.md` [45]: “e sobre quem seremos coroados quando o vencermos” → “e ao vencermos o qual seremos coroados” — “On conquering whom we shall be crowned” significa que seremos coroados ao vencê-lo; “sobre quem” introduz uma relação sintática indevida.
- `pt-BR/ch001.md` [63]: “de tal modo que nem ambos são fiéis” → “de tal modo que não são ambos fiéis” — O inglês diz “they are not both believers”. A negação simples exige “não”; “nem” está empregado indevidamente nessa construção.
- Rejected: pt-BR/ch001.md — sinalizações mecânicas — Diferenças de ênfase e de parênteses. — Correspondem à numeração em negrito, aos termos gregos em itálico e à substituição de parênteses por outras formas de pontuação, com o conteúdo preservado.
- Rejected: pt-BR/ch001.md [59] — “Este incorruptível se revestirá de incorruptibilidade” parece exigir “corruptível”. — O texto canônico fornecido diz “this incorruptible”. Não há evidência suficiente para atribuir a anomalia especificamente a OCR.
- Rejected: pt-BR/ch001.md [64] — A condição de que o casamento fosse desfeito contradiz o argumento sobre conservar a união. — A tradução reproduz “unless the marriage were broken up” do inglês fornecido. Corrigir a negação sem comprovar um erro de OCR alteraria a edição canônica.

### Part 1 of 2, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001.md [44]–[46] and [62]–[64]: both previous fixes in [45] and [63] are correct, and the shown paragraphs have no defects.
- Rejected: pt-BR/ch001.md [45] — “e ao vencermos o qual seremos coroados” reads as stilted — The relative pronoun is carried along with the prepositional infinitive clause, a construction attested in literary Portuguese. It renders “on conquering whom we shall be crowned” correctly and is grammatical.
- Rejected: pt-BR/ch001.md [63] — check the change to “não são ambos fiéis” — It matches “they are not both believers” and keeps the sentence’s concord.
- Rejected: pt-BR/ch001.md [46] — “à qual não devemos contradizer” uses an indirect object with contradizer — Contradizer with the preposition a is an accepted regency, and the sense is clear.

### Part 2 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 4 minor. Full read of ch002 (§1–87): two meaning fixes (§9 'não se mostra justo', §44 'qualquer livro') and four minor ones (typo, petition order, capitalization, untranslated i.e.); the audit flags are not defects.
- `pt-BR/ch002.md` [6]: ““Agrad ai a todos os homens” → ““Agradai a todos os homens” — Stray space inside the verb 'Agradai'.
- `pt-BR/ch002.md` [9]: “Pois finge ser um homem justo, mas não se mostra como é;” → “Pois finge ser um homem justo, mas não se mostra justo de fato;” — The source says 'he pretends, but does not show himself, to be a righteous man': he feigns righteousness without showing it. 'não se mostra como é' says something else (that he hides his true self). *(meaning)*
- `pt-BR/ch002.md` [44]: “censurar temerariamente em outro livro aquilo” → “censurar temerariamente em qualquer livro aquilo” — The source says 'to blame in any book'; 'em outro livro' narrows the claim. *(meaning)*
- `pt-BR/ch002.md` [51]: “sua vontade seja feita assim na terra como no céu” → “sua vontade seja feita assim no céu como na terra” — The source has 'as in heaven so in earth', the order used everywhere else in the chapter. The next clause depends on that order (body = earth, soul = heaven).
- `pt-BR/ch002.md` [21]: “O apóstolo Paulo, por sua vez, diz” → “O Apóstolo Paulo, por sua vez, diz” — Internal consistency: the file writes 'o Apóstolo Paulo' in §57 and §67 and capitalizes 'Apóstolo' throughout.
- `pt-BR/ch002.md` [114]: “*i.e.*, que não apenas ouve” → “*isto é*, que não apenas ouve” — Latin abbreviation left untranslated; the rest of the file renders it as '*isto é*'.
- Rejected: pt-BR/ch002.md (audit: emphasis, parentheses) — Emphasis and parenthesis counts differ from the source. — The extra asterisks are the house `**N.**` paragraph numbers. The missing parentheses were turned into em dashes, which is a style choice with no content lost.
- Rejected: pt-BR/ch002.md [38] — 'Herodes' where Luke 13:1 names Pilate. — The source has Herod; the author and edition are not corrected.
- Rejected: pt-BR/ch002.md [56] — 'lava teus rostos' where §54 has 'lava teu rosto'. — It follows the source's 'wash your faces' in this quotation; not a translation defect.
- Rejected: pt-BR/ch002.md [55] — The source reads 'pertaining to the booty'. — This is an OCR slip for 'body', and the PT already reads 'corpo', so the translation is correct.

### Part 2 of 2, Round 2 (codex, full read)
Verdict: 3 meaning-level, 1 minor. Leitura integral de ch002.md ([1]–[114], §§1–87), book.json e diário: três defeitos de sentido e uma inconsistência de maiúscula; alertas mecânicos sem perda de conteúdo.
- `pt-BR/ch002.md` [10]: “o apóstolo Pedro” → “o Apóstolo Pedro” — O arquivo emprega consistentemente a inicial maiúscula nesse título, inclusive em “o Apóstolo Paulo”.
- `pt-BR/ch002.md` [80]: “Os propósitos de alguns homens” → “Os pecados de alguns homens” — “Aims” é um lapso evidente por “sins”: a explicação imediatamente seguinte identifica esses mesmos elementos como pecados manifestos. “Propósitos” perpetua o erro no sentido da citação. *(meaning)*
- `pt-BR/ch002.md` [86]: “Para os fracos, fiz-me fraco” → “Para os fracos, fiz-me como um fraco” — O original diz “became I as weak”, preservando a comparação. A explicação subsequente trata de considerar a fraqueza alheia como própria. *(meaning)*
- `pt-BR/ch002.md` [100]: “com a mesma intenção com que deseja recebê-los” → “com a mesma intenção com que deseja que lhe sejam concedidos” — O original fala da intenção com que deseja que outros lhe concedam benefícios, não da intenção com que ele próprio deseja recebê-los. *(meaning)*

### Part 2 of 2, Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch002 (§1–87) against en-US, with book.json and the journal: no defects; the earlier rounds' fixes hold, and the audit flags are not defects.
- Rejected: pt-BR/ch002.md (audit: emphasis, parentheses) — Emphasis and parenthesis counts differ from the source. — The extra asterisks are the `**N.**` paragraph numbers. The missing parentheses became em dashes ([19], [22], [56], [82] and others), with no content lost. Round 1 already rejected this finding.
- Rejected: pt-BR/ch002.md [43] — 'pela massa de uma corporeidade' renders 'by the mass of His corporeity'. — The sentence denies that God has any corporeity. 'uma' keeps that sense and avoids implying that God has a body. The meaning is unchanged.
- Rejected: pt-BR/ch002.md [17] — The final rhetorical question is split, and its second half becomes a statement. — The content and logic are intact. Splitting the sentence is a syntax choice.
- Rejected: pt-BR/ch002.md [107] — Possible omissions in the lists from Galatians 5. — All 17 works of the flesh and all 9 fruits of the Spirit are present and in the source's order.
