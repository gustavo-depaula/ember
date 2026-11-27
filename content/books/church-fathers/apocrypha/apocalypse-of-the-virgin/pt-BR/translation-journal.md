# Diário de tradução — Apocalipse da Virgem (pt-BR)

Fonte: en-US/, tradução de Andrew Rutherfurd, em Ante-Nicene Fathers, vol. 9, edição de Allan Menzies, Christian Literature Publishing Co., 1896; revisão e edição para New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Apocalypse of the Virgin | Apocalipse da Virgem | “Unknown date; very late”: “data desconhecida; muito tardio”. |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Mother of God / all-holy Mother of God | Mãe de Deus / santíssima Mãe de Deus | |
| all holy one / highly favoured one | santíssima / aquela que recebera tão grande favor | Preservada a distinção entre as designações. |
| holy lady | santa Senhora | |
| Mary / Michael / Gabriel | Maria / Miguel / Gabriel | Miguel e Gabriel conforme Apocalipse de Moisés. |
| Abraham / Moses / John the Baptist / Paul | Abraão / Moisés / João Batista / Paulo | |
| Adam / Eve | Adão / Eva | Conforme os livros irmãos. |
| Mount of Olives / Jordan | monte das Oliveiras / Jordão | |
| Father / Son / Holy Spirit | Pai / Filho / Espírito Santo | Conforme os livros irmãos. |
| Lord / Jesus Christ / Son of God | Senhor / Jesus Cristo / Filho de Deus | Conforme os livros irmãos. |
| invisible Father / King of ages | Pai invisível / Rei dos séculos | |
| commander-in-chief | comandante supremo | Título recorrente de Miguel. |
| cherubim / seraphim / archangel | querubins / serafins / arcanjo | Conforme Apocalipse de Moisés. |
| thrones / lordships / authorities / governments / powers | tronos / dominações / autoridades / governos / potestades | Preservados os cinco nomes distintos da enumeração final. |
| Hades / Paradise / lake of fire | Hades / Paraíso / lago de fogo | Hades conforme os livros irmãos; maiúsculas de Paraíso segundo a fonte. |
| chastisement / repentance / compassion | castigo / arrependimento / compaixão | |
| devil / serpent | diabo / serpente | Conforme os livros irmãos. |
| presbyter / deaconess / archdeaconess / reader | presbítero / diaconisa / arquidiaconisa / leitor | Leitor designa o ofício eclesiástico; presbítero e diaconisa conforme os livros irmãos. |
| patriarch / bishop / priest | patriarca / bispo / sacerdote | |
| angelic form / archangelic form / apostolic form | forma angélica / forma arcangélica / forma apostólica | Mantida a expressão figurada da edição inglesa. |
| precious and life-giving cross | preciosa e vivificante cruz | Vivificante conforme Apocalipse de Moisés. |
| Lord’s day / Pentecost | dia do Senhor / Pentecostes | |
| Gospel / epistles | Evangelho / epístolas | Preservada a variação de maiúsculas da fonte. |
| cubit | côvado | Conforme os livros irmãos; sem conversão. |
| for ever and ever / Amen | pelos séculos dos séculos / Amém | Conforme os livros irmãos. |
| Kyrie eleïson me / Kyrie eleïson | *Kyrie eleïson me* / *Kyrie eleïson* | Fórmulas gregas preservadas; nota do tradutor 1. |

## Decisões

- Mantidos os 31 parágrafos da fonte: um título e trinta seções numeradas. Os números autorais foram apresentados em negrito, sem listas automáticas.
- Empregado tu no tratamento singular de Maria, de Miguel e dos demais interlocutores; vós no tratamento plural e nas súplicas dirigidas a Deus. O Pai dirige-se ao Filho com tu.
- Preservada a menção inicial a Gabriel, embora seja Miguel quem desce em seguida, sem harmonizar os nomes.
- Mantidas as formulações difíceis da edição: a passagem sobre os anjos e a palavra imaculada do Pai na seção 4, “quatro (lados?)” na seção 12, as pérolas na seção 16, as formas angélica e arcangélica na seção 18 e a construção condicional da seção 27. Na seção 24, “oracle of Christ” foi vertido por “oráculo de Cristo”, sem substituir a expressão por uma interpretação.
- “Foul-feeding”, na seção 14, foi traduzido por “que te alimentas de imundícies”, preservando o teor do insulto.
- Preservadas as atribuições de falas e ações da fonte, inclusive a ação dos anjos na seção 23, e suas afirmações sobre os diferentes grupos de pecadores, sem comentários doutrinais ou harmonizações.
- Acrescentada a nota do tradutor 1, na seção 15, para traduzir e identificar as fórmulas gregas de súplica, mantidas em itálico no texto.
- Não acrescentadas referências bíblicas às citações e alusões que a fonte deixa sem referência.
- Em book.json, preservada a descrição bibliográfica de sources como cadeia de texto, pois o campo não é um objeto de traduções; acrescentadas as entradas pt-BR aos objetos localizados existentes e à lista languages.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of ch001 (31 paragraphs and footnote 1) and of book.json and the journal; one fidelity fix in §25, the audit flags are the bold numbers and italic Greek.
- `pt-BR/ch001.md` [26]: “fazemos memória dos pecadores” → “fazemos memória em favor dos pecadores” — source says 'we make remembrance for the sake of sinners'; the PT drops 'for the sake of' and turns intercession on their behalf into a mere mention of them *(meaning)*
- Rejected: pt-BR/ch001.md [2]-[31] — mechanical audit: emphasis markers differ — the extra markers are the bold section numbers required by the house format, plus the italic Greek formulas in [16]
- Rejected: pt-BR/ch001.md [24] — 'ergueu com eles uma só voz' adds 'com eles' — the source's 'coming with the archangel Michael and all the armies' already makes the voice shared; the addition only makes the grammar explicit
- Rejected: pt-BR/ch001.md [30] — 'raised up mine elect' rendered 'ressuscitei' — it follows 'I trampled on the enemy' in a descent-and-resurrection sequence, so the resurrection sense is the natural reading
- Rejected: pt-BR/ch001.md [31] — 'tendes sido paciente' pairs vós with a singular adjective — vós addressed to a single person takes a singular predicate; this is correct

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 1 minor. Leitura integral dos 31 parágrafos, da nota, de book.json e do diário; encontrados um defeito de sentido e uma localização incorreta no diário. As diferenças de ênfase apontadas pela auditoria são justificadas.
- `pt-BR/ch001.md` [24]: “e os que recusaram o santo batismo” → “e que recusaram o santo batismo” — Na fonte, 'and who refused holy baptism' continua a oração relativa sobre os judeus mencionados; 'e os que' cria um grupo separado. *(meaning)*
- `pt-BR/translation-journal.md`: “as formas angélica e arcangélica nas seções 18 e 24” → “as formas angélica e arcangélica na seção 18” — Essas expressões aparecem na seção 18; a seção 24 não as contém.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [23]-[25] and the journal correction: both previous fixes are correct and nothing new was found.
- Rejected: pt-BR/ch001.md [24] — 'eles não conseguiam afastá-las' uses a plural object for the source's singular 'keep it off' — the antecedent in context is the waves; the plural states the same sense and is not a defect
- Rejected: pt-BR/ch001.md [2]-[31] — mechanical audit: emphasis markers differ — the extra markers are the bold section numbers the house format requires (and the italic Greek in [16]), as Round 1 already established
