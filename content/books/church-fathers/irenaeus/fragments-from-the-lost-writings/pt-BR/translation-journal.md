# Diário de tradução — Fragmentos das obras perdidas de Irineu (pt-BR)

Fonte: en-US/ (tradução de Alexander Roberts, Ante-Nicene Fathers, vol. 1, 1885, revista para New Advent por Kevin Knight).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Irenaeus / Irenæus of Lyons | Irineu / Santo Irineu de Lião | forma brasileira usual |
| presbyter(s) | presbítero(s) | |
| the Church / Churches | a Igreja / as Igrejas | maiúscula da fonte |
| diocese(s) | diocese(s) | |
| the Word / the Word of God | o Verbo / o Verbo de Deus | ¶39 "the word" minúsculo → "o verbo", para manter o jogo com "o Verbo feito carne" |
| Holy Spirit / the Spirit | Espírito Santo / o Espírito | |
| Eucharist / oblation / antitypes | Eucaristia / oblação / antítipos | |
| dispensation | economia | ¶29 e ¶116 |
| type / typified / prefigured | figura / figurado / prefigurado | |
| Saviour / Redeemer | Salvador / Redentor | |
| First-begotten | Primogênito | |
| beam of wood / wood | madeiro / lenho | |
| repentance | penitência | como em `ambrose/repentance` |
| soothsayer | adivinho | |
| fornication | fornicação | |
| kingdom of heaven | reino dos céus | |
| Florinus / Polycarp / John | Florino / Policarpo / João | |
| Soter / Anicetus / Pius / Hyginus / Telesphorus / Sixtus | Sotero / Aniceto / Pio / Higino / Telésforo / Xisto | |
| Sanctus / Blandina | Sanctus / Blandina | ver Decisões |
| Balaam / Midian / Gideon / Jerubbaal / Joshua / Nun | Balaão / Madiã / Gedeão / Jerobaal / Josué / Nun | |
| Aaron / Miriam / Naaman / Elisha / Samson / Zacharias | Aarão / Míriam / Naamã / Eliseu / Sansão / Zacarias | |
| Joseph / Levi / Judah / Simeon / Zebulon, Zabulon / Benjamin | José / Levi / Judá / Simeão / Zabulon / Benjamim | |
| Josephus / Ethiopians / Greeks | Josefo / etíopes / gregos | |
| Lower Asia | Ásia Inferior | nota do tradutor 1 |
| Zebedee | Zebedeu | |

## Decisões

- Pronomes referentes a Deus e a Cristo em minúscula ("ele", "vossa glória"), segundo o uso do português; títulos mantêm a maiúscula da fonte.
- Tratamento: o copista (¶3), Florino (¶5), Vítor (¶7, ¶104) e o leitor (¶29, ¶115) por *tu*; a Deus (¶5) e a Cristo (¶116, "Your glory") por *vós*; Oseias 9:10 "your fathers" por *vossos*.
- Grego em escrita grega mantido como na fonte, entre parênteses e sem itálico; o itálico da fonte (*Joshua*, *On Easter*) é mantido.
- ¶5: "that blessed and presbyter" (lapso da fonte, falta "apostolic") espelhado como "aquele bem-aventurado e presbítero"; a vírgula espúria de "through, God's mercy" foi omitida.
- ¶23: a grafia grega da fonte "μελεπᾷν" (por μελετᾶν) foi espelhada.
- ¶27: o mártir Sanctus mantém a forma latina, para não se confundir com o adjetivo "santo".
- ¶47: "ass" → "jumento" (masculino), porque a fonte continua com "upon whom" referindo-se ao corpo de Cristo.
- ¶96: "burning light" → "luz ardente", para manter o par luz/Luz da frase seguinte.
- ¶68: a lacuna "..." da fonte foi mantida.
- Fragmentos repetidos (9/42, 8/48, 25/45) traduzidos de modo coerente, mas acompanhando as diferenças de redação da fonte ("deserving"/"worthy").
- Notas do tradutor: [^1] ¶5, origem da carta a Florino e sentido de "Ásia Inferior"; [^2] ¶7, destinatário (Vítor de Roma) e contexto da controvérsia pascal; [^3] ¶37, o número dez como iota, inicial de Jesus; [^4] ¶39, identidade dos nomes Josué e Jesus em grego.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Full read of ch001 (117 paragraphs, 4 translator's notes), book.json and the journal: one wrong antecedent commitment in [114], an omitted 'like seed' in [63], an imprecise 'unreservedly' in [104].
- `pt-BR/ch001.md` [114]: “embora a memória daquele não nos tenha sido apresentada” → “embora a memória daqueles não nos tenha sido apresentada” — source 'the memory of the former … that of the latter' contrasts the martyrs (former) with the three youths (latter) of the same sentence; singular 'daquele' points the reader to Daniel instead *(meaning)*
- `pt-BR/ch001.md` [63]: “que é semeada no mundo como num campo, [semente]” → “que é semeada como semente no mundo, como num campo, [semente]” — source 'which is sown like seed in the world, as in a field'; 'like seed' was dropped, and the bracketed '[semente]' was left without an antecedent
- `pt-BR/ch001.md` [104]: “simples e irrefletidamente, recebem” → “com simplicidade e sem reservas, recebem” — source 'simply and unreservedly receive': 'unreservedly' means without reservation, not thoughtlessly
- Rejected: pt-BR/ch001.md [110] — 'deu a luz aos cegos' might need a crase — 'a luz' is the direct object ('gave light'), so a crase would be wrong; this is not 'dar à luz'
- Rejected: pt-BR/ch001.md [7] — the 'For' of 'For some consider themselves bound' is not rendered — the connective is redundant after the 'Pois' of the previous sentence; leaving it out loses no sense
- Rejected: pt-BR/ch001.md [27] — 'very admirably' rendered as 'de modo admirável' — the intensifier adds little, and the sense is unchanged

### Round 2 (codex, full read)
Verdict: 3 meaning-level, 1 minor. Leitura integral dos 117 parágrafos, quatro notas, book.json e diário: quatro correções, relativas a referentes, relação sintática e colchetes editoriais.
- `pt-BR/ch001.md` [25]: “quando for revestido dela” → “quando a alma for revestida do corpo” — O sujeito é a alma, que adiante recebe os corpos ('it shall not receive bodies'). A tradução inverte a relação, fazendo o corpo revestir-se da alma. *(meaning)*
- `pt-BR/ch001.md` [25]: “tendo por companheira uma consorte justa, não insidiosa” → “tendo por companheiro um consorte justo, não insidioso” — O consorte da alma neste trecho é o corpo; o feminino perpetua a inversão dos referentes na oração anterior. *(meaning)*
- `pt-BR/ch001.md` [74]: “a afinidade do ensinamento e a santíssima” → “a afinidade do ensinamento e da santíssima” — O original fala da afinidade entre o ensinamento e a fé. A preposição também rege o segundo termo. *(meaning)*
- `pt-BR/ch001.md` [104]: “Considera [apenas] o autor” → “[Considera] apenas o autor” — Em 'Just [consider]', os colchetes identificam o verbo como suplemento editorial, não o advérbio.
- Rejected: pt-BR/ch001.md [19] — 'Nunca mal dos que não o merecem' poderia indicar quem não merece censura. — Na construção paralela, o segundo 'o' pode retomar o falar bem da primeira oração, preservando o sentido de 'undeserving'; não há erro inequívoco.
- Rejected: pt-BR/ch001.md [115] — O número 'seiscentos' parece incompleto no contexto. — O original traz exatamente 'six hundred'; a tradução não deve completar o número por conjectura.

### Round 3 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Full read of ch001 (117 paragraphs, 4 translator's notes), book.json and the journal; no defects found.
- Rejected: pt-BR/ch001.md [25] — 'recebê-lo-á' is singular where the source has 'it shall receive these' — The pronoun picks up 'o que lhe pertence', which is singular, so the concord is correct and the sense is unchanged.
- Rejected: pt-BR/ch001.md [88] — Tenses are mixed: 'seria preso' against 'serão de novo soltos' — This follows the source's own shift ('shall be bound … shall be again loosed') inside a reported prophecy, and it reads correctly in Portuguese.
- Rejected: pt-BR/translation-journal.md (Decisões, tratamento) — The list of *tu* addressees leaves out the imperatives in [53] ('Sabe') and [63] ('Observa') — Both are addressed to the reader, as the journal records for [29] and [115]. The list does not claim to be exhaustive, and nothing in it is false.
