# Diário de tradução — Gaunilo, Em favor do insipiente, e a Resposta de Anselmo (pt-BR)

Fonte: la/, textos de Gaunilo e Anselmo na edição de J.-P. Migne, Patrologia Latina 158 (Paris, 1853), conforme as transcrições do Corpus Corporum e da Wikisource latina indicadas em book.json.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Anselmus Cantuariensis | Santo Anselmo de Cantuária | Convenção das obras irmãs. |
| Gaunilo / Gaunilonis | Gaunilo / de Gaunilo | Forma portuguesa do nome. |
| Pro insipiente | Em favor do insipiente | Harmonizado com o vocabulário do Proslógio. |
| Proslogion / Monologion | Proslógio / Monológio | Convenção das obras irmãs. |
| id quo majus cogitari nequit / non potest | aquilo do qual não se pode pensar nada maior | Fórmula fixa do Proslógio; com aliquid: “algo do qual nada maior se pode pensar”. |
| majus omnibus | maior do que tudo | Mantida a distinção em relação à fórmula anterior, decisiva em c05. |
| summum magnum | o sumamente grande | Fórmula dos resumos dos capítulos. |
| summa res / summa natura | realidade suprema / natureza suprema | |
| cogitare / cogitatio | pensar / pensamento | Conforme o Proslógio. |
| intelligere / intellectus | entender / inteligência | Conforme o Proslógio; “esse in intellectu”: “estar na inteligência”. |
| in re / reipsa / in rei veritate | na realidade | “Existir” distingue a existência real do estar na inteligência. |
| secundum rem | segundo uma coisa / segundo uma realidade | Conforme a construção; preservado o contraste com “segundo a palavra”. |
| vox | palavra | Conforme o Proslógio. |
| insipiens / stultus | insipiente / estulto | Conforme o Proslógio. |
| genus / species | gênero / espécie | Sentido lógico. |
| conjicere | formar uma noção | Conhecimento de algo a partir de outras coisas; não mera suposição. |
| ars / opus | arte / obra | Em g3, distingue o projeto na inteligência de sua realização. |
| arca | arca | Objeto fabricado no exemplo atribuído a Santo Agostinho. |
| sanctus Augustinus | Santo Agostinho | Forma portuguesa consagrada. |
| divina substantia / divina essentia | substância divina / essência divina | Mantida a alternância da fonte. |
| bonitas ipsa | a própria bondade | |
| insula perdita / fortunatae insulae | ilha perdida / ilhas Afortunadas | |
| Rom. | Romanos | Referência normalizada para Romanos 1:20. |

## Decisões

- 2026-11-14: Tradução diretamente do latim fornecido, com tratamento singular em “tu” entre os interlocutores e preservação de todos os parágrafos, títulos e repetições. O trecho apologético integral incorporado a g8 foi mantido, embora repita o prefácio e c01–c10.
- 2026-11-14: O título português preexistente em book.json empregava “insensato”; substituído por “insipiente”, conforme a convenção expressamente estabelecida pelo Proslógio. A descrição portuguesa foi harmonizada com essa escolha.
- 2026-11-14: Mantidos os números soltos 36–40 presentes nos parágrafos fornecidos, embora aparentem ser resíduos de paginação. Os títulos internos de g8 permanecem parágrafos em maiúsculas, sem acrescentar níveis de cabeçalho.
- 2026-11-14: Em c01 e g8, conservada a intervenção editorial “[quod]”, com a leitura latina em itálico. Erros gráficos inequívocos, como “neccsse”, “eogitari”, “auaitum”, “illua”, “quisptam” e “e sentiam”, foram interpretados como “necesse”, “cogitari”, “auditum”, “illud”, “quispiam” e “essentiam”.
- 2026-11-14: Em c04 e no trecho correspondente de g8, “Quod sic aliquid” foi entendido como uma condicional, “Se, porém, alguma…”, em continuidade com a alternativa argumentativa. Preservada a dupla leitura de “enquanto”: simultaneidade entre pensar e saber, e simultaneidade de existência e inexistência.
- 2026-11-14: Em c05 e no trecho correspondente de g8, a construção abreviada “Si vero vel aliud argumentum potest” foi explicitada como “Se, porém, isso pode ser provado ao menos por outro argumento”; “magis”, na fórmula recorrente, foi entendido como “majus”.
- 2026-11-14: Em g5, “Prius enim certum nihil necesse est fiat” apresenta uma sequência corrompida; o “nihil”, sem função sintática coerente nesse contexto, não foi incorporado à tradução. A frase foi entendida como exigência de estabelecer primeiro a existência real daquilo que é maior.
- 2026-11-14: Em c10 e g8, “melius esse quam esse” foi entendido como “melius esse quam non esse”, com restituição da negação aparentemente omitida, exigida pelos três exemplos imediatamente seguintes. A emenda fica registrada aqui.
- 2026-11-14: Em c09 e g8, “respuendus / conspuendus” foi traduzido como “deve ser rejeitada / deve ser cuspido”, conservando a aspereza retórica, embora o jogo sonoro latino não se reproduza.
- 2026-11-14: Romanos 1:20 foi traduzido segundo a redação latina fornecida, sem substituir a citação por uma versão bíblica portuguesa. Mantida a diferença de itálicos entre c08 e sua repetição em g8.
- 2026-11-14: Não foram acrescentadas notas do tradutor; as decisões textuais foram registradas neste diário, preservando a correspondência estrita dos parágrafos solicitados.

## Review log

### Round 1 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of g1–g8, the preface and c01–c10: in c10/g8 [25] «significatio» was wrongly attached to the proof (meaning), and the journal's secundum rem row lists a rendering that does not occur (minor).
- `pt-BR/c10.md` [2]: “Pois o significado dessa prova contém em si tamanha força que” → “Pois o significado contém em si tamanha força desta prova que” — source: «Tantam vim hujus probationis in se continet significatio»; the genitive goes with «vim», not «significatio». It is the meaning of the expression that holds the force of the proof, not the proof's meaning. *(meaning)*
- `pt-BR/g8.md` [25]: “Pois o significado dessa prova contém em si tamanha força que” → “Pois o significado contém em si tamanha força desta prova que” — Same sentence as c10: «vim hujus probationis» is the object; «significatio» is not «of the proof». *(meaning)*
- `pt-BR/translation-journal.md`: “| secundum rem | segundo a coisa / segundo uma realidade |” → “| secundum rem | segundo uma coisa / segundo uma realidade |” — The text renders «secundum rem» as «segundo uma coisa» (c08, g8 [21], g4) and «segundo uma realidade»; «segundo a coisa» does not occur.
- Rejected: pt-BR/c01.md [2], pt-BR/g8.md [7] — Audit: emphasis and parentheses differ — The italics are the «[*quod*]» reading the journal keeps; the parenthetical «quicunque es…» is rendered with em dashes, which keeps the content and is a legitimate style choice.
- Rejected: pt-BR/g3.md [2] — Audit: parentheses differ — «(sicut sanctus Augustinus ait)» is rendered with commas, with nothing lost.
- Rejected: pt-BR/g3.md [2], pt-BR/g8.md [5], [9], [15], [23] — Stray numbers 36–40 in the text — They are in the source; the journal records the decision to keep them.
- Rejected: pt-BR/c01.md [2] — «Sed ponamus non esse, si vel cogitari valet» rendered with «embora» — The sense is concessive in the hypothesis (it does not exist, yet it can be thought); defensible.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de todos os parágrafos, incluindo a repetição em g8, títulos, book.json, diário e alertas mecânicos; nenhum defeito objetivo adicional encontrado.
- Rejected: pt-BR/c10.md [2]; pt-BR/g8.md [25] — A tradução acrescenta «não» em «melhor ser do que não ser». — A leitura literal «melius esse quam esse» é manifestamente defeituosa; os três exemplos seguintes confirmam a negação restituída, registrada no diário.
