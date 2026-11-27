# Diário de tradução — Atos e Martírio de São Mateus Apóstolo (c. 550) (pt-BR)

Fonte: en-US/, tradução de Alexander Walker em Ante-Nicene Fathers, vol. 8, editado por Alexander Roberts, James Donaldson e A. Cleveland Coxe, Christian Literature Publishing Co., 1886; revisão e edição para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Acts and Martyrdom of St. Matthew the Apostle | Atos e Martírio de São Mateus Apóstolo | |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Matthew / Andrew / David / Herod | Mateus / André / Davi / Herodes | Conforme os livros irmãos; Mateus distinto de Matias. |
| Jesus Christ / Lord / Son of God | Jesus Cristo / Senhor / Filho de Deus | Conforme os livros irmãos. |
| Father / Holy Ghost | Pai / Espírito Santo | Conforme os livros irmãos. |
| Plato / Myrna / Bethlehem | Platão / Mirna / Belém | Mirna não foi identificada com Esmirna. |
| Fulvanus / Fulvana / Erva | Fulvano / Fulvana / Erva | Mantida a distinção entre os nomes do rei, do filho, da rainha e da nora. |
| Ziphagia / Sophia / Synesis | Zifágia / Sofia / Sínesis | Zifágia designa a rainha no parágrafo 31. |
| Asmodæus / Beelzebul / Satan | Asmodeu / Beelzebu / Satanás | Mantidas as três designações da fonte. |
| devil / demon / unclean spirit | diabo / demônio / espírito impuro | |
| Hades / Gehenna / paradise | Hades / Geena / paraíso | Hades e paraíso conforme os livros irmãos; preservadas as designações distintas. |
| man-eaters | antropófagos | Conforme Atos de André e Matias. |
| Satyr | Sátiro | Designação da figura adorada pelos habitantes. |
| bishop / presbyter / deacon | bispo / presbítero / diácono | |
| presbyteress / deaconess | presbítera / diaconisa | Preservadas as designações femininas da fonte. |
| seal / to seal | selo / marcar com o selo | Conforme os livros irmãos. |
| holy mysteries / Eucharist / thanksgiving | santos mistérios / Eucaristia / ação de graças | Distinções conforme os livros irmãos. |
| remission of sins / repentance / resurrection | remissão dos pecados / arrependimento / ressurreição | Conforme os livros irmãos. |
| Gospel / Psalter of David / Alleluia | Evangelho / Saltério de Davi / Aleluia | Davi e Aleluia conforme os livros irmãos. |
| Revelation | Apocalipse | Apocalipse 22:2, única referência bíblica explícita do trecho. |
| rod / staff | vara / bastão | Mantida a variação vocabular da fonte para o mesmo objeto. |
| cubit / furlong / talent | côvado / estádio / talento | Unidades antigas preservadas, sem conversão. |
| executioners / soldiers / publican | carrascos / soldados / publicano | Carrascos conforme os livros irmãos. |
| for ever / to ages of ages | para sempre / pelos séculos dos séculos | Conforme os livros irmãos. |
| Amen | Amém | Conforme os livros irmãos. |

## Decisões

- Conservada a divisão dos 37 parágrafos, incluindo o título. A única nota acrescentada é uma definição de rodapé, separada do parágrafo narrativo.
- Empregado “tu” nos diálogos entre indivíduos e nas falas de Jesus a Mateus; “vós” para interlocutores plurais e na oração dirigida a Deus. Nas primeiras falas de Mateus à criança ainda não reconhecida, mantido “tu”.
- Preservadas as particularidades da fonte sem harmonização: a rainha chama-se Fulvana no parágrafo 5 e Zifágia no parágrafo 31; o rei e seu filho têm ambos o nome Fulvano e recebem ambos o nome Mateus.
- “The once married” foi traduzido por “os que se casaram uma só vez”, sem restringir a expressão a viúvos, mencionados separadamente.
- “Clothing of the rams of the sheep” foi vertido por “peles dos carneiros dos rebanhos”, explicitando o material subentendido das vestes.
- Mantidas as formulações incomuns dos parágrafos 19 e 30: “até quando deixarás de cumprir as obras de teu pai, o diabo?” e “na hora da perfuração na cruz”, sem corrigir por conjectura o texto recebido.
- Mantidos “nossa divindade” no decreto real e os títulos “presbítera” e “diaconisa”, sem substituir as designações da narrativa por outras funções.
- Conservadas as invocações “Ephphatha, Jesus” e “Adonai eloi sabaoth marmari marmunth”, com o itálico da fonte na segunda.
- A nota do tradutor 1 explica o significado dos nomes Sofia e Sínesis, relevante à mudança de nomes após o batismo.
- As citações bíblicas não identificadas na fonte permanecem sem referências acrescentadas; preservado Apocalipse 22:2 no mesmo ponto da narrativa.
- No JSON, acrescentadas as entradas pt-BR aos objetos de localização existentes e o idioma à lista; a descrição bibliográfica de sources, que é uma string simples, foi preservada integralmente.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of 37 paragraphs, the footnote, the journal and book.json; one meaning fix: an ambiguous subject/object order in the conjuration of paragraph 16.
- `pt-BR/ch001.md` [16]: “eu te conjuro pelo Deus que proclama aquele a quem chamas Mateus” → “eu te conjuro pelo Deus que é proclamado por aquele a quem chamas Mateus” — source: 'by the God whom he whom you call Matthew proclaims'; the PT order naturally reads as God proclaiming Matthew, reversing subject and object *(meaning)*
- Rejected: pt-BR/ch001.md [3] — 'boast of the widowed' and 'glory of the presbyters' both rendered 'glória' — 'glória' is a defensible rendering of 'boast'; the sense is unchanged
- Rejected: pt-BR/ch001.md [24] — 'Peace to you!' rendered with plural 'vós' — Matthew is dying among the gathered brethren and the king; the plural is a sound choice in context
- Rejected: pt-BR/ch001.md [31] — footnote on Sofia/Sínesis — the meanings 'sabedoria' and 'entendimento' are accurate, and the note bears on the renaming

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 37 parágrafos, da nota do tradutor, do diário e do book.json; nenhum defeito objetivo encontrado.
