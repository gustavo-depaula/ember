# Diário de tradução — Atos de Xantipa e Polixena (pt-BR)

Fonte: en-US/, tradução de W. A. Craigie em *Ante-Nicene Fathers*, vol. 9, edição de Allan Menzies, Christian Literature Publishing Co., 1896; revisão e edição para New Advent de Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Acts of Xanthippe and Polyxena | Atos de Xantipa e Polixena | |
| Apocrypha | Apócrifos | Conforme os livros irmãos. |
| Xanthippe / Polyxena | Xantipa / Polixena | |
| Probus / Philotheus | Probo / Filoteu | |
| Barandus / Gnosteas | Barando / Gnósteas | |
| Paul / Peter / Philip / Andrew | Paulo / Pedro / Filipe / André | Conforme os livros irmãos. |
| Rebecca / Simon / Nero | Rebeca / Simão / Nero | Simão é o mago da narrativa. |
| Noah / Adam / Eve | Noé / Adão / Eva | Conforme os livros irmãos. |
| Jacob / Judah / Jesse / Mary | Jacó / Judá / Jessé / Maria | Jacó conforme os livros irmãos. |
| Rome / Spain / Greece / Babylonia | Roma / Espanha / Grécia / Babilônia | |
| Jesus Christ / Son of God / Saviour | Jesus Cristo / Filho de Deus / Salvador | Conforme os livros irmãos. |
| Holy Ghost / Holy Spirit | Espírito Santo | Conforme os livros irmãos. |
| life-giving Trinity | Trindade vivificante | |
| only begotten | unigênito | Conforme Atos de Tomé. |
| sun of righteousness | Sol da justiça | Conforme Atos de Filipe. |
| Devil / Evil one / Satan | Diabo / Maligno / Satanás | |
| Hades / deep | Hades / abismo | Hades conforme os livros irmãos. |
| dragon / serpent | dragão / serpente | Conforme os livros irmãos. |
| poison / gall | veneno / fel | Conforme os livros irmãos. |
| seal / to seal | selo / marcar com o selo | Conforme Atos de Tomé e Atos de Filipe. |
| holy baptism / baptism of regeneration | santo batismo / batismo da regeneração | |
| eucharist / thanksgiving | Eucaristia / ação de graças | Distinção conforme os livros irmãos. |
| repentance / remission of sins | arrependimento / remissão dos pecados | Conforme o Apocalipse de Paulo. |
| fornication / abstinence | fornicação / abstinência | Fornicação conforme os livros irmãos. |
| kingdom of heaven | reino dos céus | |
| foreknowledge | presciência | Quando se refere ao conhecimento de Deus. |
| ex-prefect | antigo prefeito | |
| pieces of gold | moedas de ouro | Sem atribuir denominação monetária ausente da fonte. |
| Alleluia | Aleluia | Conforme os livros irmãos. |
| Psalm | Salmo | Mantida a numeração da fonte em Salmo 38:6. |
| to all eternity | por toda a eternidade | |
| Thecla / Onesimus / Lucius | Tecla / Onésimo / Lúcio | |
| Antioch | Antioquia | |
| providence | providência | Distinta de “presciência” (*foreknowledge*). |
| virginity | virgindade | |
| ass-driver | condutor de jumentos | |

## Decisões

- Mantidos os 36 parágrafos da fonte, inclusive os cinco versos separados do cântico da seção 19; os números autorais das seções foram apresentados como texto em negrito.
- Empregado “tu” no tratamento singular entre personagens, inclusive quando acompanhado de “senhor” ou “mestre”; “vós” nas invocações a Deus e no tratamento plural. Na seção 15, a mudança do interlocutor de Paulo suposto para Cristo reconhecido acompanha a mudança de “tu” para “vós”.
- Preservadas expressões incomuns da edição, como a alma “incuravelmente” tomada pelo ensinamento, “dai cumprimento ao meu sono”, “filhotes de leão saídos de Judá” e a mente que “não se desdobra até o fim”, sem harmonização conjectural.
- Na seção 1, o evidente erro gráfico inglês “water m his hands” foi entendido como “water in his hands”: “água em suas mãos”.
- Na visão da seção 17, o pronome de “the eagle carried it up into heaven” foi explicitado como “o reino”, conforme a interpretação dada na seção seguinte.
- “Anthems and responses” foi traduzido por “antífonas e responsos”, conservando a imagem do canto alternado no louvor das aves.
- Nota do tradutor [^1], na seção 12: esclarece o costume antigo de cear reclinado sobre um leito.
- Nota do tradutor [^2], na seção 24: identifica brevemente Simão, o Mago, e a tradição apócrifa de seu confronto com Pedro, sem acrescentar referência bíblica ao texto narrativo.
- As citações foram traduzidas segundo a redação inglesa fornecida, sem inserir referências ausentes. Preservada a referência expressa a Salmo 38:6.
- Em `book.json`, a descrição bibliográfica de `sources` foi conservada literalmente: é uma string da fonte, não um campo de descrições localizadas. Acrescentadas entradas pt-BR apenas nos objetos localizáveis existentes e na lista de idiomas.
- Mantidos os 13 parágrafos finais da fonte, correspondentes às seções 30–42. Preservada a passagem à narração em primeira pessoa por Onésimo na seção 38.
- Conservadas, sem atenuação ou harmonização, a expressão “imundície do casamento” na seção 31, a mudança da segunda para a terceira pessoa na aclamação da seção 37 (“Em verdade, vós sois, e aquele que Polixena invoca é o único Deus”) e a construção condicional “eu teria blasfemado contra ti” na seção 40.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 40 minor. Full read of ch001 (49 blocks), journal and book.json: 'Próbo' is misspelled in 39 places plus the Key Terms row (correct form 'Probo'); one ambiguous pronoun in [15] fixed; otherwise faithful and complete.
- `pt-BR/ch001.md` [15]: “ocorrera contra a vontade dele;” → “ocorrera contra a vontade do porteiro;” — source: 'without his will' = the porter's; 'dele' after 'Próbo' reads as Probus's will *(meaning)*
- `pt-BR/translation-journal.md`: “| Probus / Philotheus | Próbo / Filoteu | |” → “| Probus / Philotheus | Probo / Filoteu | |” — paroxytone ending in -o takes no accent; Portuguese form is Probo
- `pt-BR/ch001.md` [3]: “chamado Próbo,” → “chamado Probo,” — spelling: Probo
- `pt-BR/ch001.md` [3]: “também Próbo se afligia” → “também Probo se afligia” — spelling: Probo
- `pt-BR/ch001.md` [4]: “Próbo, seu marido” → “Probo, seu marido” — spelling: Probo
- `pt-BR/ch001.md` [4]: “Próbo lhe disse: “E qual” → “Probo lhe disse: “E qual” — spelling: Probo
- `pt-BR/ch001.md` [4]: “Próbo lhe disse: “Seja” → “Probo lhe disse: “Seja” — spelling: Probo
- `pt-BR/ch001.md` [6]: “e Próbo a ouvia” → “e Probo a ouvia” — spelling: Probo
- `pt-BR/ch001.md` [7]: “também Próbo voltou” → “também Probo voltou” — spelling: Probo
- `pt-BR/ch001.md` [9]: “Ora, Próbo ouviu” → “Ora, Probo ouviu” — spelling: Probo
- `pt-BR/ch001.md` [10]: “Próbo, ouvindo isso” → “Probo, ouvindo isso” — spelling: Probo
- `pt-BR/ch001.md` [10]: “oração por Próbo” → “oração por Probo” — spelling: Probo
- `pt-BR/ch001.md` [11]: “casa de Próbo” → “casa de Probo” — spelling: Probo
- `pt-BR/ch001.md` [11]: “semblante de Próbo” → “semblante de Probo” — spelling: Probo
- `pt-BR/ch001.md` [11]: “chamou Próbo” → “chamou Probo” — spelling: Probo
- `pt-BR/ch001.md` [12]: “Próbo, novamente” → “Probo, novamente” — spelling: Probo
- `pt-BR/ch001.md` [12]: “Para que Próbo” → “Para que Probo” — spelling: Probo
- `pt-BR/ch001.md` [12]: “se Próbo vier” → “se Probo vier” — spelling: Probo
- `pt-BR/ch001.md` [13]: “persuadir também Próbo” → “persuadir também Probo” — spelling: Probo
- `pt-BR/ch001.md` [13]: “Então Próbo chamou” → “Então Probo chamou” — spelling: Probo
- `pt-BR/ch001.md` [13]: “consentisse, Próbo disse” → “consentisse, Probo disse” — spelling: Probo
- `pt-BR/ch001.md` [13]: “sono sobre Próbo” → “sono sobre Probo” — spelling: Probo
- `pt-BR/ch001.md` [14]: “Mas Próbo, ainda” → “Mas Probo, ainda” — spelling: Probo
- `pt-BR/ch001.md` [14]: “oprimido por Próbo” → “oprimido por Probo” — spelling: Probo
- `pt-BR/ch001.md` [15]: “se Próbo percebesse” → “se Probo percebesse” — spelling: Probo
- `pt-BR/ch001.md` [15]: “com Próbo, num” → “com Probo, num” — spelling: Probo
- `pt-BR/ch001.md` [18]: “E Próbo levantou-se” → “E Probo levantou-se” — spelling: Probo
- `pt-BR/ch001.md` [18]: “Próbo, porém, tendo” → “Probo, porém, tendo” — spelling: Probo
- `pt-BR/ch001.md` [18]: “Próbo diz a Gnósteas” → “Probo diz a Gnósteas” — spelling: Probo
- `pt-BR/ch001.md` [18]: “Próbo disse: “Parecia-me” → “Probo disse: “Parecia-me” — spelling: Probo
- `pt-BR/ch001.md` [19]: “Próbo disse: “Vamos” → “Probo disse: “Vamos” — spelling: Probo
- `pt-BR/ch001.md` [26]: “Também Próbo veio” → “Também Probo veio” — spelling: Probo
- `pt-BR/ch001.md` [26]: “Próbo, vendo isso” → “Probo, vendo isso” — spelling: Probo
- `pt-BR/ch001.md` [26]: “E Próbo se afligia” → “E Probo se afligia” — spelling: Probo
- `pt-BR/ch001.md` [27]: “Próbo ouviu esse” → “Probo ouviu esse” — spelling: Probo
- `pt-BR/ch001.md` [27]: “Meu filho Próbo” → “Meu filho Probo” — spelling: Probo
- `pt-BR/ch001.md` [27]: “Próbo voltou para” → “Probo voltou para” — spelling: Probo
- `pt-BR/ch001.md` [28]: “Então Próbo, levantando-se” → “Então Probo, levantando-se” — spelling: Probo
- `pt-BR/ch001.md` [29]: “Depois da ceia, Próbo” → “Depois da ceia, Probo” — spelling: Probo
- `pt-BR/ch001.md` [29]: “também Próbo a amava” → “também Probo a amava” — spelling: Probo
- `pt-BR/ch001.md` [48]: “E Próbo me disse” → “E Probo me disse” — spelling: Probo
- Rejected: pt-BR/ch001.md [4], [5], [46] — audit: parentheses dropped — the parentheticals are kept as commas or dashes; no content lost
- Rejected: pt-BR/ch001.md [2]–[49] — audit: emphasis markers differ — bold section numbers, as the journal states
- Rejected: pt-BR/ch001.md [48] — 'Do you see how by many devices God saves many?' placed inside Probus's quotation — the source has no quotation marks; attributing the line to Probus is a defensible reading
- Rejected: pt-BR/ch001.md [38] — 'mande buscar-me e nos separe' for 'send and separate us' — explicates the implied object; sense unchanged
- Rejected: pt-BR/ch001.md [5] — 'fulfil my desire' rendered as an imperative to God — the source is open; the imperative matches the parallel 'think me but worthy'

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 2 minor. Leitura integral dos 49 blocos, das duas notas, do diário e de book.json: tradução sem defeitos objetivos; duas contagens incorretas no registro da rodada 1.
- `pt-BR/translation-journal.md`: “Verdict: 1 meaning-level, 40 minor.” → “Verdict: 1 meaning-level, 39 minor.” — O registro enumera 38 correções de Probo no capítulo e uma na tabela de termos, totalizando 39 correções minor.
- `pt-BR/translation-journal.md`: “is misspelled in 41 places plus the Key Terms row” → “is misspelled in 38 places plus the Key Terms row” — Há 38 ocorrências no capítulo, correspondentes às 38 substituições enumeradas no registro, além da linha da tabela.
- Rejected: pt-BR/ch001.md — auditoria mecânica — Diferenças de ênfase e de parênteses. — A ênfase corresponde aos números das seções em negrito; os três trechos parentéticos foram integralmente preservados entre vírgulas ou travessões.
- Rejected: pt-BR/translation-journal.md — Decisões — A menção a 36 parágrafos parece contradizer os 49 blocos. — O diário registra separadamente os 13 parágrafos finais acrescentados aos 36 iniciais; juntos, correspondem aos 49 blocos.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 2 minor. Leitura delta das duas correções da rodada 2 no diário: ambas as contagens estão erradas. O registro tem 39 correções de Probo no capítulo e 40 minor no total, e foram corrigidas.
- `pt-BR/translation-journal.md`: “Verdict: 1 meaning-level, 39 minor. Full read of ch001” → “Verdict: 1 meaning-level, 40 minor. Full read of ch001” — O registro da rodada 1 lista 39 substituições de Próbo no capítulo ([3] 2, [4] 3, [6] 1, [7] 1, [9] 1, [10] 2, [11] 3, [12] 3, [13] 4, [14] 2, [15] 2, [18] 4, [19] 1, [26] 3, [27] 3, [28] 1, [29] 2, [48] 1) e mais uma na tabela de termos, total de 40 correções minor.
- `pt-BR/translation-journal.md`: “'Próbo' is misspelled in 38 places” → “'Próbo' is misspelled in 39 places” — As substituições enumeradas no capítulo somam 39, não 38.

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Leitura delta das duas correções no diário: confirmadas 39 substituições no capítulo e uma na tabela de termos, totalizando 40 minor; nenhum defeito encontrado.
