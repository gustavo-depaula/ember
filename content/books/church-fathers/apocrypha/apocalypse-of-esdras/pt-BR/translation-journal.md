# Diário de tradução — Apocalipse de Esdras (pt-BR)

Fonte: en-US/, tradução de Alexander Walker, em Ante-Nicene Fathers, vol. 8, edição de Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revista e editada para o New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Apocalypse of Esdras | Apocalipse de Esdras | “Unknown date”: “data desconhecida”, conforme Narrativa de Zósimo. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Esdras / Most High | Esdras / Altíssimo | |
| Lord / Son of God / only begotten Son | Senhor / Filho de Deus / Filho unigênito | Conforme os livros irmãos. |
| Father / Son / Holy Spirit | Pai / Filho / Espírito Santo | Conforme os livros irmãos. |
| Michael / Gabriel / Raphael / Uriel | Miguel / Gabriel / Rafael / Uriel | Formas portuguesas usuais. |
| Gabuthelon / Aker / Arphugitonos / Beburos / Zebuleon | Gabutélon / Áquer / Arfugitonos / Béburos / Zebuleon | Formas adotadas para os nomes angélicos menos usuais. |
| Adam / Eve / Abraham / Joseph | Adão / Eva / Abraão / José | Conforme os livros irmãos. |
| Enoch / Elias / Moses | Enoque / Elias / Moisés | |
| Peter / Paul / John / Luke / Matthias | Pedro / Paulo / João / Lucas / Matias | |
| Herod / Antichrist | Herodes / Anticristo | |
| Jerusalem / Sodom / Gomorrha / Jehoshaphat | Jerusalém / Sodoma / Gomorra / Josafá | |
| paradise / tree of life / commandment | paraíso / árvore da vida / mandamento | Conforme os livros irmãos. |
| Gehenna / Tartarus / Hades / abyss | Geena / Tártaro / Hades / abismo | Preservadas as diferentes designações da fonte. |
| righteous / righteousness / sinners | justo / justiça / pecadores | Conforme os livros irmãos. |
| virginity / covenant / long-suffering | virgindade / aliança / longanimidade | |
| plead / judgment / day of the consummation | pleitear / julgamento / dia da consumação | “Pleitear” mantém a linguagem judicial do diálogo. |
| soul / body / flesh | alma / corpo / carne | Conforme os livros irmãos. |
| commander of the host / host | comandante do exército / exército | |
| storax rod / landmarks | vara de estoraque / marcos de divisa | |
| cubit / span | côvado / palmo | Medidas conservadas, sem conversão. |
| trust | depósito | Aquilo que Deus confiou a Esdras e pede de volta: sua alma. |
| blessed / patriarchs / cherubim | bem-aventurado / patriarcas / querubins | |
| Matthew / Genesis / Corinthians | Mateus / Gênesis / Coríntios | Nomes das referências bíblicas. |
| Deuteronomy / Exodus / Timothy / Ecclesiastes | Deuteronômio / Êxodo / Timóteo / Eclesiastes | Nomes das referências bíblicas. |
| to ages of ages / Amen | pelos séculos dos séculos / Amém | Conforme as fórmulas dos livros irmãos. |

## Decisões

- Mantidos os cinco parágrafos da fonte, inclusive os três longos parágrafos narrativos, sem subdivisões.
- Empregado “vós” no tratamento reverente a Deus, “tu” ao dirigir-se individualmente a Esdras ou a um anjo e “vós” ao dirigir-se aos anjos ou aos santos em conjunto.
- Preservadas as alternâncias entre primeira e terceira pessoa, entre passado e presente e entre as designações dos interlocutores, sem harmonizar a narrativa.
- “Race” foi traduzido por “raça”, mantendo a recorrência de “raça dos cristãos”, “raça dos homens” e “raça humana”.
- Preservadas as particularidades da fonte: os dois períodos de jejum, a sequência de degraus, a ausência do oitavo mês na descrição da gestação e as medidas dos castigos.
- A passagem fragmentária “Since. ..there is evil” foi vertida como “Porque... há mal”, sem completar o trecho.
- Conservada a referência “Mateus xxiv” com o numeral romano da fonte; as referências com versículos mantêm capítulo:versículo.
- Não foram acrescentadas notas do tradutor: as particularidades textuais foram preservadas e registradas neste diário.
- A descrição bibliográfica em `sources` permanece intacta: é uma cadeia de texto, não um campo com entradas por idioma.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 [1]–[5], journal and book.json: complete and faithful; one meaning fix (God's 'Your sins' refers to mankind, so 'Vossos', not 'Teus').
- `pt-BR/ch001.md` [3]: “E Deus disse: Teus pecados ultrapassam minha clemência.” → “E Deus disse: Vossos pecados ultrapassam minha clemência.” — Source: 'Lord, You deal with us according to our deserts. … Your sins transcend my clemency'. The 'your' answers the prophet's 'us/our', so the sins are mankind's, not those of Esdras, whom God has just praised as uncorrupted. 'Teus' wrongly makes them Esdras's own; the plural 'vossos' fits the context. *(meaning)*
- Rejected: pt-BR/ch001.md [3] — 'Let us plead in Your hearing' rendered 'Pleiteemos em vossa presença' — Pleading in someone's hearing and in their presence come to the same thing here; a defensible choice.
- Rejected: pt-BR/ch001.md [3], [5] — Comma or colon added after inline Scripture references (Mateus 27:34, Gênesis 22:17, Deuteronômio 34:10) — The punctuation keeps the Portuguese sentence readable around the inline reference and changes no content.
- Rejected: pt-BR/ch001.md [4] — 'ela nasce sã e salva' with a feminine subject in the gestation passage — It agrees with 'semente', the subject of the whole sequence; grammatically consistent.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de ch001 [1]–[5], com comparação oração por oração, e conferência do diário, do book.json e da auditoria mecânica: nenhum defeito objetivo encontrado.
