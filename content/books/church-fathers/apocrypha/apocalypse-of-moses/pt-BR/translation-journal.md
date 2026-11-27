# Diário de tradução — Apocalipse de Moisés (pt-BR)

Fonte: en-US/, tradução de Alexander Walker em Ante-Nicene Fathers, vol. 8, editado por Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revisão e edição para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Apocalypse of Moses | Apocalipse de Moisés | “Unknown date”: “data desconhecida”. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Adam / Eve / Moses | Adão / Eva / Moisés | |
| Cain / Abel / Seth | Caim / Abel / Set | |
| Diaphotus / Amilabes | Diáfoto / Amilabes | Nomes alternativos de Caim e Abel, respectivamente. |
| Michael / Gabriel / Uriel / Raphael | Miguel / Gabriel / Uriel / Rafael | |
| Jael | Jael | Mantida a designação divina da fonte. |
| Lord / God the Father / Lord of Hosts | Senhor / Deus Pai / Senhor dos Exércitos | Senhor e Deus Pai conforme os livros irmãos. |
| devil / Satan / serpent | diabo / Satanás / serpente | Diabo, Satanás e serpente conforme os livros irmãos. |
| paradise / tree of life | paraíso / árvore da vida | Paraíso conforme os livros irmãos. |
| covenant / commandment / transgression | aliança / mandamento / transgressão | |
| righteousness / glory / resurrection | justiça / glória / ressurreição | Ressurreição conforme os livros irmãos. |
| oil of compassion | óleo da compaixão | Mantido o nome dado ao óleo procurado por Set e Eva. |
| olive oil | azeite de oliva | Distinto do óleo da compaixão. |
| cherubim / seraphim / archangel | querubins / serafins / arcanjo | |
| Acherusian lake | lago Aquerúsio | |
| soul / spirit / vessel | alma / espírito / vaso | Preservadas as imagens e distinções da fonte. |
| seal / to seal | selo / selar | No fechamento do túmulo. |
| falling asleep | adormecimento | Imagem da morte no parágrafo 23. |
| unbeginning and life-giving Spirit | Espírito sem princípio e vivificante | Mantidos os dois qualificativos da doxologia. |
| for ever / to ages of ages | para sempre / pelos séculos dos séculos | Conforme os livros irmãos. |
| Alleluia / Amen | Aleluia / Amém | Conforme os livros irmãos. |

## Decisões

- Mantida a divisão em 24 parágrafos, inclusive o longo relato de Eva no parágrafo 12, sem subdivisões.
- Empregado “tu” no tratamento singular entre personagens e nas falas de Deus a um indivíduo; “vós” no plural e no tratamento reverente dirigido a Deus. Conservadas as mudanças entre interlocução individual e coletiva.
- No sonho do parágrafo 4, explicitados Abel e Caim nas retomadas pronominais para distinguir quem suplica de quem bebe.
- Corrigido o lapso tipográfico “Eye” para “Eva” no parágrafo 9, sem alterar a personagem.
- Preservadas as particularidades narrativas e formulações incomuns da edição, inclusive a promessa sobre o novo filho no parágrafo 5, a perda da vida nas dores do parto, a descendência masculina na sentença à serpente, os perfumes para alimento e a enumeração de “ambas as espécies” no parágrafo 12.
- Mantidas as mudanças de voz narrativa entre terceira e primeira pessoa, inclusive “vosso pai” e “eu, Eva”, sem uniformização.
- “Angel of humanity” foi traduzido literalmente por “anjo da humanidade”, sem atribuir identidade ou função não explicitadas pela fonte.
- “Desire” foi mantido como “desejo” no relato da tentação, inclusive na afirmação de que é a cabeça de todo pecado.
- Não foram acrescentadas referências bíblicas às alusões e citações que a fonte deixa sem referência, nem notas do tradutor.
- A descrição bibliográfica de `sources` foi conservada como cadeia de texto, conforme a estrutura original de `book.json`; os campos multilíngues existentes receberam as entradas em pt-BR.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of 24 paragraphs: completeness, names and journal are correct; two lexical fixes in [12] (ungracious → ingrato, girdle → cinta).
- `pt-BR/ch001.md` [12]: “te tornaste um instrumento funesto para enganares” → “te tornaste um instrumento ingrato para enganares” — source says 'ungracious instrument' (Greek ἀχάριστον, ungrateful); 'funesto' (fatal) changes the sense *(meaning)*
- `pt-BR/ch001.md` [12]: “fiz para mim uma cintura” → “fiz para mim uma cinta” — source says 'girdle'; in current usage 'cintura' means the waist, while 'cinta' keeps the feminine concord of the next clause
- Rejected: pt-BR/ch001.md [10] — 'equal to three days' rendered 'restando-lhe três dias' — the source is open, and the rendering matches the sense of the passage (three days remain)
- Rejected: pt-BR/ch001.md [12] — plural 'Fazeis bem', 'comerdes', 'sereis' where the English 'you' could be singular — Eve speaks for both ('Deus nos colocou'), and the plural fits the 'like gods' promise; defensible
- Rejected: pt-BR/ch001.md [15] — 'blew them up' rendered 'os avivaram com seu sopro' — a reasonable reading of censers blown upon; no content lost

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 24 blocos, com conferência do diário, dos metadados e da auditoria mecânica; nenhum defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [12] — “Has had a grudge against you” traduzido por “teve inveja de vós”. — No contexto da alegação de que Deus impede os humanos de se tornarem semelhantes a ele, “inveja” é uma interpretação defensável.
