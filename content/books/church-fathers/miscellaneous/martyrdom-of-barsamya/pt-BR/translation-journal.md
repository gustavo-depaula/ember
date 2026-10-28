# Diário de tradução — O Martírio de Barsamya (pt-BR)

Fonte: en-US/, tradução de B. P. Pratten, Ante-Nicene Fathers, vol. 8 (1886), revista para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Martyrdom | Martírio | |
| Miscellaneous | Diversos | Conforme obras irmãs (miscellaneous/*). |
| Barsamya | Barsamya | Nome siríaco mantido como na fonte. |
| Sharbil | Sharbil | Nome siríaco mantido como na fonte (cf. Marath, Tishrin nas obras irmãs). |
| Sharirs (of the city) | Sharirs (da cidade) | Funcionários siríacos que registravam e denunciavam; título mantido como na fonte. |
| Edessa / Antioch / Rome | Edessa / Antioquia / Roma | Conforme obras irmãs. |
| Ilul / Heziran | Ilul / Heziran | Meses siríacos (setembro / junho); nomes mantidos, como Tishrin nas obras irmãs. |
| judge | juiz | Conforme obras irmãs. |
| judgment-hall / hall of judgment | pretório | |
| judgment-seat | tribunal | |
| your Excellency / your Lordship | Vossa Excelência / Vossa Senhoria | |
| Lysinus / Lysinas | Lisino / Lisinas | Mantida a variação da fonte ([3] e [46]). |
| Trajan Cæsar / Tiberius Cæsar | Trajano César / Tibério César | |
| Commodus and Cyrillus / Rufus and Rubelinus | Cômodo e Cirilo / Rufo e Rubelino | Cônsules. |
| Avida, Nebo, Barcalba, Hafsai | Avida, Nebo, Barcalba, Hafsai | Mantidos como na fonte. |
| Alusis | Alusis | Mantido como na fonte. |
| Zenophilus / Patrophilus / Diodorus / Euterpes | Zenófilo / Patrófilo / Diodoro / Euterpes | |
| Abshelama / Palut | Abshelama / Palut | Bispos de Edessa; mantidos. |
| Serapion / Zephyrinus / Victor / Eleutherius / Soter / Anicetus | Serapião / Zeferino / Vítor / Eleutério / Sotero / Aniceto | |
| Telesphorus / Xystus / Alexander / Cletus / Fabianus | Telésforo / Xisto / Alexandre / Cleto / Fabiano | |
| Dapius / Evartis / Anus | Dápio / Evartis / Ano | Formas corrompidas (Pio, Evaristo, Lino); mantidas, com nota do tradutor. |
| Simon Cephas | Simão Cefas | Conforme obras irmãs. |
| watchers above | vigilantes do alto | Os anjos, conforme obras irmãs. |
| combs | pentes | Instrumento de tortura; tradução literal, sem acrescentar “de ferro”. |
| confessor / martyr | confessor / mártir | |
| Acts | Atas | |
| King of kings | Rei dos reis | |

## Decisões

- Tratamento: o juiz e Barsamya tratam-se por *tu* ([41] tem “thou”); “ye” em [25] e [28] vertido por *vós*, pois abrange outros (os imperadores; os cristãos).
- Os Sharirs dirigem-se ao juiz por Vossa Excelência, com verbo na terceira pessoa.
- [21] “up to his day” lido como “up to this day” (erro tipográfico da fonte).
- [28] mantido o jogo “spurn not… lest ye be spurned” com “não repilas… para que não sejais repelidos”.
- [31] “fellow-*creature*”: “uma *criatura* como tu”, conservado o itálico na palavra acrescentada.
- [46]–[47] “set his hand” / “setting-to their hand”: “subscreveu” / “subscreveram de próprio punho”.
- [48] Nota do tradutor sobre os nomes corrompidos da lista de bispos de Roma e as omissões de Clemente e Higino.
- Citações bíblicas sem referência na fonte ([14], [39], [45]) ficam sem referência.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral do Martírio de Barsamya (49 parágrafos), book.json e diário; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [4] — “because we too are of one mind” vertido sem “também” na oração causal — O “Também nós morreremos” da mesma fala já carrega o sentido de inclusão. Repetir “também nós” seria redundante, e a omissão não altera o que o leitor entende.
- Rejected: pt-BR/ch001.md [17] — “the many gods whom the many worshipped” → “que muitos adoravam”, sem artigo — Escolha de estilo defensável. O contraste muitos deuses / muitos adoradores se mantém.
- Rejected: pt-BR/ch001.md [13] — Ordem “sejas condenado diante de mim tu, e não ele” — A frase é gramatical e fiel a “you rather than he”. A ordem marcada é escolha de estilo.
- Rejected: pt-BR/ch001.md [22] — Itálico de “*over*” transferido para o verbo “*passaste*” — Em português não há partícula separável. Marcar o verbo que absorve a palavra acrescentada é solução legítima.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral dos 49 parágrafos, book.json e diário: um defeito de sentido e três menores.
- `pt-BR/ch001.md` [14]: “Não foi às minhas palavras que Sharbil se fez discípulo, mas à palavra de Deus” → “Não foi das minhas palavras que Sharbil se fez discípulo, mas da palavra de Deus” — A construção «fazer-se discípulo de» exige a preposição «de».
- `pt-BR/ch001.md` [44]: “Como a nossa Majestade ordenou que houvesse perseguição” → “Desde que a nossa Majestade ordenou que houvesse perseguição” — «Since … commanded … we have heard and learned» situa temporalmente as informações recebidas após a ordem de perseguição; «Como» transforma essa relação em causal. *(meaning)*
- `pt-BR/ch001.md` [45]: “quando entrou na igreja, ele e todo o povo que estava com ele” → “quando entrou na igreja com todo o povo que estava com ele” — O sujeito composto «ele e todo o povo» não concorda com «entrou». A reformulação conserva a entrada de todos e Barsamya como sujeito das ações seguintes.
- `pt-BR/ch001.md` [49]: “*Aqui* termina o martírio de Barsamya, bispo de Edessa.” → “*Aqui* termina o martírio de Barsamya, bispo de Edessa.

[^1]: Nota do tradutor: Dápio, Evartis e Ano são formas corrompidas de Pio, Evaristo e Lino. A lista omite Clemente e Higino.” — Há uma chamada [^1] em [48], mas nenhuma definição no texto fornecido. A nota acrescentada corresponde ao conteúdo registrado no diário.
- Rejected: pt-BR/ch001.md [24] — O sujeito implícito de «disse-lhe» poderia parecer ser Barsamya. — O conteúdo da ordem e a alternância das falas identificam o juiz; a fonte apresenta a mesma mudança de referente.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [13]–[15], [43]–[46], [48]–[49]: all four round-2 changes are correct and there are no new defects. The footnote definition could not be checked for duplication from the text given.
- Rejected: pt-BR/ch001.md [14] — Change «das minhas palavras… da palavra de Deus» — Correct. «fazer-se discípulo de» takes «de», and the rest of the sentence still agrees.
- Rejected: pt-BR/ch001.md [44] — Change «Desde que a nossa Majestade ordenou» — Correct. «Since … we have heard and learned» is temporal here, and the perfect «ouvimos e soubemos» fits it.
- Rejected: pt-BR/ch001.md [45] — Change «quando entrou na igreja com todo o povo que estava com ele» — Correct. It fixes the agreement, keeps everyone entering, and leaves Barsamya as the subject of «pôs-se de pé e orou». The repeated «com» is a matter of style.
- Rejected: pt-BR/ch001.md [49] — The shown [49] has no footnote definition, and the definition may now be duplicated if the extractor hides definitions (the journal's Decisões already recorded a translator's note for [48]) — Cannot be checked from the text given. The audit reports matching markup counts. The note's content is correct: Dápio/Evartis/Ano = Pio/Evaristo/Lino, and Clemente and Higino are missing from the sequence. A later full read of the file should confirm there is exactly one [^1] definition.
- Revertida (orquestrador): a nota acrescentada em `pt-BR/ch001.md` [49] duplicava a definição já existente do mesmo marcador; o revisor não via as notas do tradutor.
