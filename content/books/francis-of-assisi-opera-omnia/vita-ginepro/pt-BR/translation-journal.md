# Diário de tradução — Vida de frei Junípero (pt-BR)

Fonte: it/, *Vita di frate Ginepro*, transcrição de M. Mastrorilli, Politecnico di Bari, preservada no Wayback Machine; edição não indicada, da família textual de Cesari, conforme book.json.
Destino: pt-BR.

## Termos

| Italiano | Português | Notas |
|---|---|---|
| Vita di Frate Ginepro | Vida de frei Junípero | Título estabelecido no book.json. |
| Frate Ginepro | frei Junípero | Conservado o nome estabelecido no book.json. |
| Santo Francesco | São Francisco | Conforme os trabalhos irmãos. |
| frate + nome / frati / Frati Minori | frei / irmãos / frades menores | Conforme os trabalhos irmãos. |
| Frate Egidio / Frate Simone d'Ascesi / Frate Ruffino / Frate Lione | frei Egídio / frei Simão de Assis / frei Rufino / frei Leão | Conforme as formas portuguesas e os trabalhos irmãos. |
| Frate Amazialbene / Niccolò / Niccolajo | frei Amazialbene / Nicolau / Nicolau | Conservado Amazialbene; unificadas as variantes do nome do tirano. |
| Gesù Cristo / Padre celestiale / Spirito Santo | Jesus Cristo / Pai celestial / Espírito Santo | |
| Santissima Vergine Maria | Santíssima Virgem Maria | |
| Ordine / Religione | Ordem | Ambas designam a instituição religiosa nestes capítulos. |
| Guardiano / Generale / prelato | guardião / ministro-geral / prelado | “Generale” explicitado segundo o ofício franciscano. |
| capitolo / convento | Capítulo / convento, comunidade | “Comunidade” quando designa o conjunto dos religiosos. |
| luogo / luoghicciuolo | lugar / pequena casa dos irmãos | “Lugar” também designa o estabelecimento religioso. |
| Santa Maria degli Angeli / Ascesi / Scesi | Santa Maria dos Anjos / Assis / Assis | Conforme os trabalhos irmãos. |
| Valle di Spuleto / Ispuleto / Monte della Vernia | vale de Espoleto / Espoleto / monte Alverne | Conforme os trabalhos irmãos. |
| Viterbo / Roma | Viterbo / Roma | |
| umiltade / caritade / obbedienzia | humildade / caridade / obediência | Conforme os trabalhos irmãos. |
| per santa obbedienzia | pela santa obediência | Conforme os trabalhos irmãos. |
| indiscreto zelo | zelo sem discernimento | Conservada a distinção entre caridade e falta de discernimento. |
| pietà / compassione / divozione | piedade / compaixão / devoção | |
| salute della anima / vita beata | salvação da alma / vida bem-aventurada | |
| orazione / meditazione / ratto | oração / meditação / arrebatado | Vocabulário espiritual conforme os trabalhos irmãos. |
| cose temporali | coisas temporais | Conforme os trabalhos irmãos. |
| tonica / cappa / cappuccio / corda | túnica / capa / capuz / cordão | Vestuário religioso. |
| lesina / fucile | sovela / ferro de ferir fogo | Ferramenta de perfuração e peça de aço usada para produzir faíscas; “fucile” não designa arma de fogo neste contexto. |
| colla | suplício da polé | Tortura por suspensão e puxões, descrita no cap-003. |
| fregio / campanelle d'ariento | faixa ornamental / sininhos de prata | Ornamento do altar no cap-005. |
| farinata col butirro | mingau de farinha com manteiga | Sem especificar um cereal que o original não identifica. |
| altalena | gangorra | O próprio original descreve o brinquedo. |
| confusione / vilificare | humilhação / humilhar | No contexto da busca do desprezo de si. |
| Frate pecorella | irmão ovelhinha | Preservada a imagem afetiva dirigida a frei Leão. |
| giudicio finale | Juízo Final | |

## Decisões

- Tradução integral do italiano fornecido; o inglês foi consultado somente como referência. Preservados os quinze títulos e os limites dos parágrafos.
- Mantidas as entradas pt-BR já existentes em name, author e description do book.json; acrescentados os títulos do sumário e pt-BR à lista de idiomas.
- Empregados “tu” no tratamento singular familiar e “vós” no plural e nos tratamentos honoríficos explícitos do italiano. No cap-005, preservada a passagem de “vós” a “tu” dentro da fala de frei Junípero ao ministro-geral.
- Acrescentada a nota do tradutor 1, ao final do cap-001, para explicar o jogo entre o nome Junípero e a floresta desejada por São Francisco.
- No cap-003, preservados os procedimentos de tortura descritos no italiano, inclusive a corda apertada na cabeça e o suplício da polé, que a referência inglesa altera ou simplifica.
- Nos cap-008 e cap-011, traduzida a nudez completa expressa pelo italiano, sem introduzir a roupa interior mencionada na referência inglesa.
- No cap-010, conservadas a tábua amarrada ao corpo e a afirmação de que a comida conservaria o corpo “úmido”; não substituída esta última pela paráfrase de saúde da referência inglesa.
- No cap-012, interpretada a construção “per la stanza di lungi degli altri Frati” como referência à morada distante dos outros irmãos; preservada a informação omitida na referência inglesa.
- No cap-014, conservada a possibilidade de frei Junípero pensar em grandes feitos de si mesmo, sem acrescentar a finalidade “para Deus” presente na referência inglesa.
- No cap-015, conservada a ordem “Lava-a e cala-te” na recapitulação de São Francisco, embora as falas anteriores não tragam “cala-te”.
- Regularizados lapsos gráficos inequívocos da transcrição, como “ersere”, “tntta”, “vottre”, “molte” por “morte”, “l,ione” e “Relione”, sem alterar o sentido.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of cap-001 to cap-015, the journal and book.json; one meaning fix (a possessive in cap-003 that names the wrong family); the rest of the translation is faithful and complete.
- `pt-BR/cap-003.md` [2]: “pois acreditavam que aquele homem fosse de sua família” → “pois acreditavam que aquele homem fosse parente do guardião” — The source reads «credendo veramente che e' fusse di suo parentado»: they believed the condemned man was a kinsman of the guardian. Placed after «os carrascos e alguns dos presentes», «sua família» reads as the onlookers' own family. *(meaning)*
- Rejected: pt-BR/cap-012.md [2] — «pois moravam longe» for «per la stanza di lungi degli altri Frati» may over-interpret the source — The journal states this reading as a decision, and the obscure phrase supports it. It is not an objective defect.
- Rejected: pt-BR/cap-012.md [2] — «Oimè» rendered «Ai de nós!» instead of «Ai de mim!» — It agrees with the first-person plural of the sentence that follows. The sense is unchanged, so this is a style choice.
- Rejected: pt-BR/cap-007.md [2] — The reply «Di fuori» is extended in quotation marks to include the explanation that follows, and «o inimigo» is supplied as subject — The source punctuation is ambiguous. Supplying the subject resolves an implicit referent without changing the sense.
- Rejected: book.json description.pt-BR — Omits «il buon giullare di Dio» found in the Italian description — The description is a summary field, not translated text. The existing pt-BR entry was kept by decision.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos quinze capítulos, da nota do tradutor, do diário e do book.json; nenhum defeito objetivo encontrado.
