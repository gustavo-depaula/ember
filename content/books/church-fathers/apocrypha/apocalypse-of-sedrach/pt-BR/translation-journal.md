# Diário de tradução — Apocalipse de Sedrac (pt-BR)

Fonte: en-US/, tradução de Andrew Rutherfurd em Ante-Nicene Fathers, vol. 9, edição de Allan Menzies, Christian Literature Publishing Co., 1896; revista e editada para o New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Apocalypse of Sedrach | Apocalipse de Sedrac | “Unknown date; very late”: “data desconhecida; muito tardio”. |
| Sedrach | Sedrac | Forma adotada para o protagonista. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Lord / Jesus Christ | Senhor / Jesus Cristo | Conforme os livros irmãos. |
| Father / only begotten Son / Saviour | Pai / Filho unigênito / Salvador | Conforme os livros irmãos. |
| divine spirit / divinity | espírito divino / divindade | Conservadas as designações da fonte. |
| Master / Second Coming | Mestre / Segunda Vinda | |
| love / repentance / Orthodox Christians | amor / arrependimento / cristãos ortodoxos | “Ortodoxos” preserva a designação da fonte, sem especificar uma comunhão moderna. |
| Adam / David / Abraham / Michael | Adão / Davi / Abraão / Miguel | Conforme os livros irmãos. |
| Jordan / Jerusalem / Teman / Bosor | Jordão / Jerusalém / Temã / Bosor | |
| devil / Antichrist | diabo / Anticristo | Conforme os livros irmãos. |
| paradise / tree of life / commandment | paraíso / árvore da vida / mandamento | Conforme os livros irmãos. |
| righteous / righteousness / sinners | justo / justiça / pecadores | Conforme os livros irmãos. |
| soul / body / flesh | alma / corpo / carne | Conforme os livros irmãos. |
| trust | depósito | A alma confiada por Deus, conforme Apocalipse de Esdras. |
| suit / plead / judgment | causa / pleitear / julgamento | Preservada a linguagem judicial do diálogo. |
| chastisement / discipline | castigo / correção | Distinção mantida no diálogo sobre o castigo humano. |
| Abraham's bosom / refreshment / rest | seio de Abraão / refrigério / repouso | |
| baptism / intercessions / liturgies | batismo / intercessões / liturgias | |
| æons | éons | Conservada a expressão peculiar “mundo dos éons”. |
| John / Romans | João / Romanos | Nomes dos livros nas referências bíblicas. |
| for ever and ever / Amen | pelos séculos dos séculos / Amém | Conforme as fórmulas dos livros irmãos. |

## Decisões

- Mantidos os 19 parágrafos da fonte, inclusive o título, com os números autorais de 1 a 16 em negrito e fora de listas. A definição da nota do tradutor é um parágrafo adicional do aparato.
- Empregado “vós” no tratamento de Deus e de Cristo; “tu” nas falas dirigidas a Sedrac e no pedido ao arcanjo Miguel. Nas apóstrofes ao corpo, o tratamento acompanha o número do destinatário.
- Preservadas as particularidades da edição, inclusive a advertência sobre a árvore da vida, as construções obscuras sobre a criação e a beleza no capítulo 7, as imagens corporais do capítulo 11 e as mudanças de interlocutor ou de tempo verbal, sem correções conjecturais.
- “Make approach” foi traduzido por “aproximar-se”, sem acrescentar uma referência à adoração que o inglês não explicita.
- “Repentance” foi traduzido em geral por “arrependimento”; na descrição dos pés que vão aos templos, “making repentance” foi vertido por “fazendo penitência”, pelo caráter de prática corporal.
- Conservada em latim e itálico a frase “Peccatores enim non salvantur”. Acrescentada a nota do tradutor [^1] com sua tradução, pois a edição não a fornece.
- Conservadas somente as referências bíblicas expressas na fonte: João 15:13 e Romanos 2:4, esta última em sua posição no período.
- Mantida sem alteração a descrição bibliográfica textual em `sources`: o campo é uma string vinculada à fonte inglesa, não um objeto de descrições localizadas.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of 19 paragraphs, footnote, book.json and journal; translation faithful and complete; one journal Key Terms row lists an absent term (Son of God)
- `pt-BR/translation-journal.md`: “| Lord / Jesus Christ / Son of God | Senhor / Jesus Cristo / Filho de Deus | Conforme os livros irmãos. |” → “| Lord / Jesus Christ | Senhor / Jesus Cristo | Conforme os livros irmãos. |” — "Son of God" / "Filho de Deus" does not occur in the source or the translation; the row claims a form that is absent
- Rejected: pt-BR/ch001.md [3]–[19] — Audit flags emphasis markers differ — The extra markers are the house-style bold paragraph numbers (**1.**–**16.**); in [18] the Latin italics are kept as in the source
- Rejected: pt-BR/ch001.md [5] — "mouth to mouth" rendered "de viva voz" instead of the biblical "boca a boca" — "de viva voz" conveys direct personal speech; this is a defensible stylistic rendering, not a mistranslation
- Rejected: pt-BR/ch001.md [17] — "Não sabeis" (plural) amid address to Sedrach in the singular — God answers Sedrach and Michael, who prayed together; "Do you not know" is open, and the plural is defensible where no name is given
- Rejected: pt-BR/ch001.md [10] — "to guard them" made explicit as "guardar os homens" — The clarification resolves the pronoun correctly (man/men) and adds no content

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 19 parágrafos, da nota do tradutor, do book.json e do diário; conferidas as 16 sinalizações mecânicas, sem novos defeitos objetivos.
