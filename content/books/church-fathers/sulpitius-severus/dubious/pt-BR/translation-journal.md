# Diário de tradução — Cartas duvidosas (pt-BR)

Fonte: en-US/, tradução de Alexander Roberts, Nicene and Post-Nicene Fathers, Second Series, vol. 11 (1894), revista por Kevin Knight para a New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Dubious | Cartas duvidosas | Paralelo a *Genuine* → “Cartas autênticas” |
| Sulpitius Severus | Sulpício Severo | Conforme as obras irmãs, inclusive datas nos metadados |
| Claudia | Cláudia | Irmã e destinatária; tratada por *tu* |
| presbyter / bishop | presbítero / bispo | Conforme as obras irmãs |
| Last Judgment | Juízo Final | |
| virginity / chastity / purity / continence | virgindade / castidade / pureza / continência | |
| righteousness / righteous | justiça / justo | Na Carta 2, definida como “não cometer pecado” |
| contempt of the world | desprezo do mundo | |
| commandment / precept / counsel | mandamento / preceito / conselho | Distinção de 1 Coríntios 7:25 |
| covetousness / avarice | cobiça / avareza | Cobiça dos bens alheios; avareza com os próprios (Carta 2, cap. 8) |
| detract / detraction / detractor | detrair / detração / detrator | Termo moral tradicional, distinto de calúnia e maledicência |
| evil-speaker / speak evil / evil-speaking | maldizente / falar mal | |
| brides of Christ / bridegroom / betrothed | esposas de Cristo / esposo / noivo | “after the manner of brides” → “à maneira das noivas” |
| handmaid of Christ / of the Lord | serva de Cristo / do Senhor | |
| shamefacedness | pudor | |
| divine bath / second birth | banho divino / segundo nascimento | O batismo (Carta 2, cap. 16) |
| repentance | arrependimento | Conforme as obras irmãs |
| Gehenna | geena | |
| Gentiles and publicans | gentios e publicanos | |
| Lamb | Cordeiro | |
| the Apostle | o Apóstolo | Paulo |
| Noah / Abraham / Isaac / Moses / David / Isaiah | Noé / Abraão / Isaac / Moisés / Davi / Isaías | |
| Peter / Paul / John / Timothy | Pedro / Paulo / João / Timóteo | |
| Mary / Martha / Lazarus / Adam / Eve | Maria / Marta / Lázaro / Adão / Eva | |
| Ecclesiastes (citações de Sirácida) | Eclesiástico | Ver decisões |
| Paul the Bishop | o bispo Paulo | Destinatário das Cartas 3 e 4 |
| Xenocrates / Polemo | Xenócrates / Polêmon | Carta 4 |
| Tutus | Tuto | Carta 5 |
| Salvius / Dionysius / Porphyrius / Zibberinus / Maximinus | Sálvio / Dionísio / Porfírio / Zibberino / Maximino | Carta 6 |
| the Volusians / Volusian property | os Volusianos / propriedade dos Volusianos | Carta 6 |
| Matarum | Matarum | Lugar não identificado; mantido como na fonte |
| husbandmen / country people / rustics | lavradores / camponeses | Carta 6 |
| acres | jeiras | Medida agrária romana (*iugerum*) |

## Decisões

- Tratamento: *tu* para Cláudia e para a virgem; *vós* nas falas dirigidas a Deus (os ímpios, Noé, Abraão, Moisés, Davi e Isaías) e na fala do Filho de Deus aos condenados.
- Cartas 3, 4, 6 e 7: *tu* para o destinatário singular (o bispo Paulo, Sálvio), como na fonte; “Sir” → “senhor”. Carta 5: “your nobleness” e “your Excellency” → “Vossa Nobreza” e “Vossa Excelência” (terceira pessoa); “you all” → *vós*.
- Referências bíblicas embutidas no texto (herança dos links da New Advent) mantidas na posição aproximada da fonte, com o nome português do livro e capítulo:versículo.
- “Ecclesiastes 4:21”, “Ecclesiastes 4:31”, “k28--Ecclesiastes 26:24” e “k28--Ecclesiastes 28:24”: as passagens citadas são do Eclesiástico (Sirácida), não do Eclesiastes; traduzidas como “Eclesiástico”, e o prefixo espúrio “k28--” foi omitido.
- Títulos “Chapter 12” (Carta 1) e “Chapter 14” (Carta 2) corrigidos para “Capítulo 2” e “Capítulo 4”: são erros evidentes da edição, entre os capítulos 1 e 3, e 3 e 5, respectivamente. Os capítulos 12 a 19 do fim da Carta 2 seguem a numeração da fonte.
- Colchetes do editor (Carta 2, cap. 8) mantidos como na fonte.
- Nota do tradutor [^1] (Carta 2, cap. 8): explica “remédio apostólico” como alusão a 1 Coríntios 7:9.
- Nota do tradutor [^2] (Carta 3): explica o laserpício, especiaria cara, em contraste com o cominho barato, para que se perceba o humor da carta.
- Nota do tradutor [^3] (Carta 4): identifica Xenócrates e Polêmon, escolarcas da Academia platônica.
- “*Of the Master as Above.*” (Carta 5) → “*Do Mestre, como acima.*”: rubrica de manuscrito que indica outra peça do mesmo autor; mantida em itálico, sem interpretação.
- “in the plain” (Carta 6) → “no campo”, preservando a ambiguidade entre o campo e a arena do litígio.
- “crocus” → “açafrão”, usado como tintura de cabelo e cosmético; “ceruse” → “alvaiade”; “nitre” → “nitro” (usado como sabão); “laser” → “laserpício”.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of the 7 dubious letters (80 paragraphs, 3 notes, journal, book.json): one ambiguous negation that can reverse a Sirach quotation, and one ungoverned subjunctive; the rest is faithful and clean.
- `pt-BR/ch001.md` [41]: “para que não se estendam para receber e se fechem para dar” → “para que não se estendam para receber nem se fechem para dar” — source (Eclo 4:31): the hands must not be stretched out to receive and shut against giving; with “e” the second verb is not negated and the advice is reversed *(meaning)*
- `pt-BR/ch001.md` [29]: “; e assim uma coisa de tão grande dificuldade venha a não ser de proveito algum” → “; e, nesse caso, uma coisa de tão grande dificuldade não seria de proveito algum” — the subjunctive “venha” has no governing clause after “para ver se … não são necessárias” and reads as a wish; the source states a consequence (“and thus … may be of no advantage”)
- Rejected: pt-BR/ch001.md [35] — “à sua direita” for those condemned in Mt 25:41 — the source says “right hand”; the translation follows the source and does not correct the edition
- Rejected: pt-BR/ch001.md [33] — “Isto foi chorar sinceramente com os que choravam: remover a causa do choro” recasts “when the occasion of the weeping was removed” — same sense, defensible rewording
- Rejected: pt-BR/ch001.md [49] — “como que outra natureza” adds a softener — slight idiomatic softening, the sense is kept

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral dos 80 blocos das sete cartas, das três notas, do diário e de book.json: um defeito de sentido e três menores.
- `pt-BR/ch001.md` [33]: “és transgressor da lei” → “és transgressora da lei” — A interlocutora tratada por tu é Cláudia; o predicativo deve concordar no feminino.
- `pt-BR/ch001.md` [35]: “viver humilde e manso” → “viver humilde e mansa” — A instrução dirige-se a Cláudia; o adjetivo deve concordar no feminino.
- `pt-BR/ch001.md` [47]: “Que se adorne de todos os modos” → “Que se adorne, certamente” — “By all means” expressa assentimento enfático, não uma indicação de que se adorne de todas as maneiras. *(meaning)*
- `pt-BR/translation-journal.md`: “são erros evidentes da edição, entre os capítulos 1 e 3.” → “são erros evidentes da edição, entre os capítulos 1 e 3, e 3 e 5, respectivamente.” — O título “Chapter 14” da Carta 2 aparece entre os capítulos 3 e 5, não entre 1 e 3.
- Rejected: pt-BR/ch001.md [77] — A afirmação de que vinte jeiras não podem ser administradas por um só cultivador parece contrariar o argumento. — A fonte diz expressamente “cannot certainly be managed by one cultivator”; a tradução preserva a negação da edição.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 1 minor. Delta read of ch001 [32]-[36], [46]-[48] and the journal: all four round-2 fixes are correct; one feminine concord left over in [35] (“ávido” → “ávida”).
- `pt-BR/ch001.md` [35]: “não ser ávido” → “não ser ávida” — source: “not to be greedy”, addressed to Cláudia; in the same list round 2 changed “manso” to “mansa”, so this adjective must also be feminine
- Rejected: pt-BR/ch001.md [47] — “Que se adorne, certamente” might weaken “by all means” — “by all means” here expresses emphatic assent; “certamente” renders it faithfully
- Rejected: pt-BR/translation-journal.md — the wording “entre os capítulos 1 e 3, e 3 e 5, respectivamente” is a little heavy — the statement is now accurate; the wording is a style choice

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Lidos integralmente os blocos [34]–[36], as notas, book.json e o diário; a correção para “não ser ávida” está correta e não introduziu problemas. Nenhum novo defeito encontrado.
