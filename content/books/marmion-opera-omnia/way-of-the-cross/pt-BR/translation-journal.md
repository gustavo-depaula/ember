# Diário de tradução — A Via-Sacra: sua eficácia e prática (pt-BR)

Fonte: en-US/, The Way of the Cross, its Efficacy and Practice, tradução de uma monja do Convento de Tyburn, Edinburgh/London: Sands, 1923 (imprimatur de Edimburgo, 9 de maio de 1923). Digitalização do Internet Archive, texto OCR.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Bl. Columba Marmion | Bem-aventurado Columba Marmion | Forma dos metadados, conforme o diário das cartas inglesas. |
| Abbot Columba Marmion | abade Columba Marmion | Conforme a designação da fonte e a convenção das cartas inglesas. |
| Christ in His Mysteries | Cristo em seus mistérios | Título estabelecido nas cartas inglesas. |
| St. Paul / St. John / St. Francis of Assisi | São Paulo / São João / São Francisco de Assis | Formas portuguesas tradicionais. |
| Benedict XV | Bento XV | Forma estabelecida nas cartas inglesas. |
| Isaias / Simeon / Joseph of Arimathea | Isaías / Simeão / José de Arimateia | |
| Simon the Cyrenean / Pilate | Simão Cireneu / Pilatos | |
| Thabor / Golgotha / Calvary / Pretorium | Tabor / Gólgota / Calvário / Pretório | |
| Way of the Cross / station / Sorrowful Way | Via-Sacra / estação / Via Dolorosa | |
| Passion / immolation / oblation | Paixão / imolação / oblação | “Oblação” conforme as cartas inglesas. |
| expiation / satisfaction | expiação / satisfação | “Satisfação” no sentido teológico de reparação. |
| Divine good pleasure | beneplácito divino | |
| Man-God / Word Incarnate | Homem-Deus / Verbo encarnado | |
| High Priest / Mediator / Victim | Sumo Sacerdote / Mediador / Vítima | |
| Divine Head / mystical body | Cabeça divina / corpo místico | “Cabeça” designa Cristo em relação a seus membros. |
| Sacred Heart / Blessed Virgin / Holy Spirit | Sagrado Coração / Santíssima Virgem / Espírito Santo | |
| Sacrifice of the Mass / Holy Scripture | Sacrifício da Missa / Sagrada Escritura | |
| grace / sanctifying grace / soul | graça / graça santificante / alma | |
| compunction / abnegation / abandonment | compunção / abnegação / abandono | |
| fortitude / meekness / gentleness | fortaleza / mansidão / doçura | |
| virtue | virtude / força | “Força” quando significa poder eficaz, não hábito moral. |
| self-love / self-will | amor-próprio / vontade própria | |
| affections | afetos | Movimentos da vontade na meditação. |
| Holy of Holies | Santo dos Santos | Imagem do santuário aplicada à Paixão. |

## Decisões

- Traduzido o texto inglês fornecido, inclusive seus paratextos; o francês não foi reconstruído nem utilizado como fonte.
- Conservada uma unidade de saída para cada parágrafo numerado recebido, mesmo quando a segmentação de OCR interrompe frases, palavras ou citações. Mantidos os parágrafos constituídos de cabeçalhos, paginação e sinais de impressão; traduzido “THE WAY OF THE CROSS” e conservadas as sequências residuais sem sentido, para não suprimir unidades da fonte.
- Corrigidos na tradução os erros evidentes de OCR do inglês, como “ts”, “Chnst”, “tmmolation” e “explanation” grafado na fonte como “explation”; reconstruída a expressão legível pelo contexto em station-03, parágrafo 5, como clamor a Deus por misericórdia, e o final de station-08, parágrafo 4, como reconhecimento da inteira equidade da justiça.
- As citações latinas foram conservadas exatamente como recebidas, inclusive formas corrompidas pelo OCR, capitalização irregular e sinais intrusivos, e colocadas em itálico. Sua correção exige cotejo posterior com a edição; não foram acrescentadas traduções ausentes da fonte.
- Empregado “vós” no tratamento reverente de Deus e de Jesus; “tu” no tratamento singular de Maria. Em efficacy, parágrafo 15, o plural explícito de “your souls” determina o tratamento plural dos destinatários; empregado esse tratamento de modo consistente.
- A nota editorial do prefácio, parágrafo 5, conserva o asterisco isolado da fonte; não foi criada numeração de rodapé inexistente no texto recebido. A afirmação sobre as indulgências foi traduzida como afirmação histórica da edição de 1923.
- “Nota da tradutora” identifica o paratexto da tradução inglesa, atribuída nos metadados a uma monja de Tyburn; a referência a “deste ano de 1923” conserva sua perspectiva temporal.
- Não foram acrescentadas notas do tradutor: o trecho não exige esclarecimentos adicionais de alusões ou termos, e as intervenções de tratamento do OCR ficam registradas neste diário.
- Conservadas as entradas pt-BR já existentes de nome, autor e descrição em book.json; acrescentados o idioma em languages e os títulos portugueses de todas as entradas do sumário.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of all 17 files against en-US; the translation is faithful and complete; one minor journal fix to a Key Terms row naming terms that do not occur.
- `pt-BR/translation-journal.md`: “| Holy Sacrifice / Sacred Scripture | Santo Sacrifício / Sagrada Escritura | Conforme as cartas inglesas. |” → “| Sacrifice of the Mass / Holy Scripture | Sacrifício da Missa / Sagrada Escritura | |” — “Holy Sacrifice” and “Sacred Scripture” do not occur in the source, and “Santo Sacrifício” does not occur in the translation. The text has “Sacrifice of the Mass” (foreword [3]) and “Holy Scripture” (foreword [5]), rendered “Sacrifício da Missa” and “Sagrada Escritura”.
- Rejected: mechanical audit, emphasis markers — The PT has italics markers where the source has none. — The translation italicizes retained Latin, as the house rules require.
- Rejected: mechanical audit, unbalanced quotes (station-05 [3]/[4], [6]/[7]; station-08 [2]/[3]) — Opening and closing quotes fall in different paragraphs. — The OCR page breaks split each quotation across two paragraphs, and the journal keeps that segmentation on purpose.
- Rejected: pt-BR/efficacy.md [14] — The source's “?” is rendered as “!”. — The question is rhetorical, and the exclamation keeps its sense. This is a defensible punctuation choice.
- Rejected: book.json station-02 title — “Jesus é carregado com sua Cruz” could be read as “Jesus is carried”. — “Carregar alguém com algo” is standard for “to load someone with something”, so the title renders “laden with” correctly.
- Rejected: book.json description pt-BR — It omits “English only: no open French text exists” and cites the French title instead of “Cristo em seus mistérios”. — The omitted sentence is a note about which language editions exist and has no bearing on the Portuguese reader. Citing the original French title is a deliberate choice, not a term drift.
- Rejected: pt-BR/foreword.md [7] — The paragraph starts with “pertencer” and no governing word. — It continues the “sem” at the end of [4] across the OCR break, so the grammar holds.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 6 minor. Leitura integral dos 18 arquivos, metadados, diário e apontamentos mecânicos: nenhuma falha de sentido; corrigidos o tratamento inconsistente em efficacy [15] e sua justificativa no diário.
- `pt-BR/efficacy.md` [15]: “interrompendo teu trabalho” → “interrompendo vosso trabalho” — O plural explícito de “your souls” determina o tratamento plural dos destinatários; o inglês anterior não exige singular.
- `pt-BR/efficacy.md` [15]: “tuas preocupações” → “vossas preocupações” — Uniformiza o tratamento com o plural explícito de “your souls”, traduzido por “vossas almas”.
- `pt-BR/efficacy.md` [15]: “teu coração” → “vosso coração” — Uniformiza o tratamento dos destinatários no plural; o singular distributivo de “coração” permanece.
- `pt-BR/efficacy.md` [15]: “acompanhas o Homem-Deus” → “acompanhais o Homem-Deus” — O verbo deve acompanhar o tratamento plural determinado por “vossas almas”.
- `pt-BR/efficacy.md` [15]: “tem a certeza de que” → “tende a certeza de que” — O imperativo deve acompanhar o tratamento plural dos mesmos destinatários.
- `pt-BR/translation-journal.md`: “Em efficacy, parágrafo 15, o inglês passa do destinatário individual a “your souls”; conservada essa passagem por “tu” e depois “vossas almas”.” → “Em efficacy, parágrafo 15, o plural explícito de “your souls” determina o tratamento plural dos destinatários; empregado esse tratamento de modo consistente.” — “You” e “your” não marcam singular em inglês; a fonte não estabelece a mudança de número alegada pelo diário.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of efficacy [14]–[16] and the journal: the plural address fixes in [15] and the journal note are correct; no defects.
- Rejected: pt-BR/efficacy.md [15] — “graças especiais” for “choice graces” could read as weaker than “graças escolhidas/seletas”. — “Especiais” keeps the sense of select, privileged graces. This is a defensible style choice.
- Rejected: pt-BR/efficacy.md [15] — Singular “vosso coração” beside the plural addressees. — The source has the singular “your heart”, and the distributive singular is idiomatic in Portuguese.
