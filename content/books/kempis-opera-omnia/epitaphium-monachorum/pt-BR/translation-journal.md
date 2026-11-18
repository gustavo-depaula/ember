# Diário de tradução — O Epitáfio dos Monges (pt-BR)

Fonte: la/, *Thomae Hemerken a Kempis Epitaphium monachorum*, ed. M. J. Pohl (Freiburg: Herder 1918), Opera omnia IV; OCR bruto do archive.org.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Thomas a Kempis | Tomás de Kempis | Convenção das obras irmãs e dos metadados. |
| Epitaphium monachorum | O Epitáfio dos Monges | Título dos metadados. |
| via / iter | caminho / senda | p1-01. |
| monachus / clericus / religiosus / devotus | monge / clérigo / religioso / devoto | Os quatro interlocutores de p1-01. |
| cella / chorus / mensa / cena | cela / coro / mesa / ceia | Vocabulário da vida religiosa. |
| custodia cordis et oris | guarda do coração e da boca | Convenção das obras irmãs. |
| acedia / gula / lascivia carnis | acédia / gula / lascívia da carne | As três feras de p1-02. |
| otiosus / verbosus / taciturnus | ocioso / palavroso / calado | |
| vana gloria | glória vã | Convenção das obras irmãs. |
| consolatio / solacium | consolação | Convenção das obras irmãs. |
| compunctio / contritio | compunção / contrição | |
| secretum | recolhimento | Convenção das obras irmãs. |
| distractio / recollectio | dispersão / recolhimento | |
| detractio / dolus | detração / dolo | p1-10. |
| munditia / mundus | pureza / puro | p1-09 (em p1-03, “limpo”). |
| Pater noster / oratio Dominica | Pai-Nosso / oração dominical | |
| Ave Maria | Ave-Maria | |
| sacra lectio | leitura sagrada | |
| proficere / profectus | progredir / progresso | Convenção das obras irmãs. |
| Spiritus sanctus | Espírito Santo | |
| Daniel / Augustinus | Daniel / Agostinho | Formas portuguesas. |
| tu, dirigido ao leitor | tu | Exortações individuais. |
| tu, dirigido a Deus | vós | Tratamento reverente das obras irmãs (p1-05). |

## Decisões

- O OCR bruto foi limpo sem marca: letras soltas e sequências espúrias junto às capitulares e no meio do texto (p. ex. “N »”, “LY)”, “5395397539453 …”, “(933953953 VI. VII …”, “FFF”) foram descartadas; erros evidentes corrigidos na leitura (“via10”, “scorde”, “custodiàt”, “benes”, “quis”, “is tractant”, “sin odio”).
- Capitulares truncadas restituídas pelo versículo evidente: “Via iustorum” (p1-01), “Dixi: Custodiam” (p1-02), “Regnum caelorum” (p1-04), “Vincenti dabo” (p1-06), “Vanitas omnis” (p1-08), “Beati mundo corde” (p1-09), “Beati pacifici” (p1-10).
- p1-03: o início do versículo perdido mantém-se como “[...]”, com nota do tradutor (eco de Salmo 118(119):117).
- p1-07: “Eremum meum mihi” traduzido como está (“O meu ermo é para mim”), com nota do tradutor sobre a provável leitura *Secretum meum mihi* (Isaías 24:16).
- Citações bíblicas sem referência na fonte ficam sem referência; nenhuma foi acrescentada ao texto.
- “Fel Christi vulnera penso” (p1-01): lido como “Fel; pondero as chagas de Cristo”.
- “Clavus clavo expellitur” (p1-04): vertido pelo provérbio português “um prego se tira com outro prego”.
- Notas do tradutor: p1-01 (rimas dos dísticos e *penso*/*pensasti*), p1-03 (versículo truncado), p1-05 (*virtus*: força e virtude), p1-07 (*Eremum*/*Secretum*).

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 2 minor. Leitura integral dos 10 capítulos com a fonte ao lado. Uma nota do tradutor identificava errado o versículo truncado de p1-03 (é Sl 118:117, não Jr 17:14), e o diário tinha duas imprecisões. O resto está fiel e correto.
- `pt-BR/p1-03.md` [2]: “coincidem com o fim de Jeremias 17:14 na Vulgata: “Salva-me, e serei salvo”.” → “coincidem com o fim de Salmo 118(119):117 na Vulgata: *Adiuva me et salvus ero*, “Ajuda-me, e serei salvo”.” — Jr 17:14 na Vulgata diz *salvum me fac et salvus ero*, e o *fac* não cabe em “… me et salvus ero”. Sl 118:117 (*Adiuva me et salvus ero*) coincide palavra por palavra, e o capítulo segue com *iuvaberis*. *(meaning)*
- `pt-BR/translation-journal.md`: “com nota do tradutor (eco de Jeremias 17:14).” → “com nota do tradutor (eco de Salmo 118(119):117).” — Acompanha a correção da nota de p1-03.
- `pt-BR/translation-journal.md`: “| munditia / mundus | pureza / puro | p1-09 e p1-10. |” → “| munditia / mundus | pureza / puro | p1-09 (em p1-03, “limpo”). |” — p1-10 não contém *munditia* nem *mundus* (traz *cor purum*). Em p1-03, *mundus* foi vertido por “limpo”.
- Rejected: pt-BR/p1-06.md [2] — Auditoria: parênteses diferentes (fonte 1, pt-BR 0) — O parêntese da fonte faz parte do lixo de OCR “(933953953 VI. VII …”, descartado conforme o diário.
- Rejected: pt-BR/p1-06.md [2] — “Quem engana o outro, nele não há verdade” tem anacoluto — Reproduz a construção do latim (*Qui alium decipit: non est veritas in eo*). O sentido fica claro.
- Rejected: pt-BR/p1-07.md [2] — Nota sobre *Secretum meum mihi* — Is 24:16 na Vulgata está certo, e a hipótese vem formulada com cautela (“sugerem”).
- Rejected: pt-BR/p1-01.md [2] — *flagrare* talvez seja *fragrare* — “Arder” traduz a fonte como ela está. Não se corrige a edição.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos dez capítulos, com cotejo do latim, notas do tradutor, book.json, diário e auditoria mecânica; nenhum novo defeito objetivo encontrado.
