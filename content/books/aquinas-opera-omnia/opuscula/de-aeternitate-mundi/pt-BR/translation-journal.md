# Diário de Tradução — Da Eternidade do Mundo (pt-BR)

Fonte canônica: `la/ch001.md` (latim, texto Leonino/Marietti conforme os metadados do corpus).
Consulta secundária: `en-US/ch001.md` (Robert T. Miller, revista pelo Aquinas Institute), somente para registro e terminologia.
Destino: pt-BR.

## Termos-chave

Vocabulário conforme os diários de *Do Ente e da Essência* e *Dos Princípios da Natureza*.

| Latim | Português | Notas |
|---|---|---|
| ens / esse / non esse | ente / ser / não ser | Verbo existencial também vertido por “existir”. |
| essentia / substantia | essência / substância | |
| potentia / actus | potência / ato | *potentia passiva*: potência passiva; *infinita actu*: infinitas coisas em ato. |
| materia / forma / natura | matéria / forma / natureza | |
| causa agens / causatum | causa agente / efeito | *causatum* também “aquilo que é causado”, conforme a construção. |
| repugnantia intellectuum | contradição entre os conceitos | Incompatibilidade lógica das noções. |
| duratione / natura | na duração / por natureza | Distinção entre anterioridade na duração e anterioridade por natureza. |
| virtus | virtude | Poder operativo, como em *Das Razões da Fé*. |
| ex nihilo / ab aeterno | do nada / desde a eternidade | |
| coaeternus | coeterno | |
| substitutionis initium | início no estabelecimento do ser | Origem causal, distinta do início no tempo, no exemplo da pegada (parágrafo 20). |
| Augustinus / Anselmus / Boetius | Agostinho / Anselmo / Boécio | Sem acrescentar títulos ausentes do latim. |
| Damascenus / Hugo de sancto Victore | Damasceno / Hugo de São Vítor | |
| De civitate Dei / De consolatione | A Cidade de Deus / A Consolação da Filosofia | Títulos portugueses. |
| Monologium / De sacramentis / Contra Faustum | Monológio / Dos Sacramentos / Contra Fausto | |

## Decisões de tradução

- 2026-10-02: tradução integral diretamente do latim, inclusive citações; preservados o título, os 26 parágrafos e a quebra entre os parágrafos 16 e 17, mesmo continuando a mesma frase. Não se acrescenta numeração ausente da fonte.
- Aparato editorial descartado por padrão: as referências PL/PG, explicações e complementos exclusivos do inglês não entram na tradução. O latim não tem notas de rodapé. Não se acrescentam notas do tradutor nem referências bíblicas inferidas.
- Citações em itálico como no latim; aspas duplas retas para expressões citadas, conforme *Dos Princípios da Natureza*. Títulos de obras vertidos em português. Conservadas as referências de livros e capítulos que o latim efetivamente fornece, inclusive XII, 15 de *A Cidade de Deus*.
- Preservadas duas formulações difíceis da fonte, sem emenda conjectural: no parágrafo 6, *non solum non est falsum sed etiam impossibile* (“não só não é falso, mas é até impossível”), embora aparentemente contradiga o argumento; no parágrafo 25, *in cuius motu* (“em cujo movimento”), referido ao Criador. Não há evidência suficiente para classificá-las como corrupção de OCR. A ironia *cum illis oritur sapientia* mantém “com eles nasce a sabedoria”, sem substituição pela passagem bíblica aludida.
- Metadados: “Da Eternidade do Mundo”; autor “Santo Tomás de Aquino”, conforme *Do Ente e da Essência*. Acrescentado pt-BR somente aos campos existentes. O `description` já existia neste livro e foi traduzido, sem criação de campo novo.
- Execução individual e sem perguntas. Build do corpus reservado ao orquestrador, conforme a instrução desta tarefa.

## Edições na fonte

Nenhuma.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo contra `la/`, incluindo citações, apartes e referências; auditoria mecânica 1–6 e `book.json`. Veredito: CLEAN; nenhum defeito objetivo confirmado e nenhuma correção no texto, nos metadados ou nos Termos-chave/afirmações do diário.

Achados considerados e rejeitados:
- `ch001` ¶6, fonte linha 13, *non solum non est falsum sed etiam impossibile*: a aparente contradição está no latim; “não só não é falso, mas é até impossível” é fiel. Não emendar pelo inglês nem presumir erro de OCR.
- `ch001` ¶25, fonte linha 51, *Creatori, in cuius motu*: “ao Criador, em cujo movimento” preserva a formulação da fonte; não é erro introduzido em português. Na mesma linha, *capitulo 15* exige manter “capítulo 15”, apesar da ressalva editorial inglesa sobre a numeração.
- `ch001` ¶16–17, fonte linhas 33/35, *quam quod ex alio habetur; / esse autem non habet creatura nisi ab alio*: a quebra de parágrafo no meio da frase é da fonte; não unir os parágrafos.
- `ch001` ¶22, fonte linha 45, *cum illis oritur sapientia*: “com eles nasce a sabedoria” conserva a ironia literal; não substituir pela passagem bíblica aludida nem acrescentar a referência exclusiva do inglês.
- `ch001` ¶5/15, fonte linhas 11/31, *Quisquis ita dicit* / *Tertia … interpretatio*: traduzir essas citações como “Quem diz assim” / “A terceira interpretação” não omite frases latinas; numa obra inteiramente latina, as citações também se traduzem, preservando seu conteúdo e itálico.

Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-aeternitate-mundi/evidence/review-1.md` (fora do corpus).

### Round 2

Foco: leitura bilíngue integral, cláusula por cláusula, contra `la/`, com auditoria mecânica 1–6, `book.json` e conferência do diário. Veredito: CLEAN; nenhum defeito objetivo confirmado; nenhuma correção no texto, nos metadados ou nos Termos-chave/afirmações anteriores.

Achados considerados e rejeitados:
- `ch001` ¶8, fonte linha 17, *si ipse voluisset*: “se assim o tivesse querido” conserva a condição relativa ao querer de Deus produzir sem anterioridade temporal; não importar o “unless” da tradução inglesa.
- `ch001` ¶12/23, fonte linhas 25/47, *non minus potest … immo multo magis* / *aptum natum*: “não tem menor potência … tem muito maior potência” e “apto por natureza” explicitam as construções latinas; as ocorrências adicionais de “potência”/“natureza” na contagem lexical não são conteúdo acrescentado.
- `ch001` ¶18, fonte linha 37, *ex incontingenti … idest ex eo quod non contingit simul esse*: “a partir daquilo que não pode coexistir com ele” é confirmado pela glosa que o próprio latim fornece, não um falso amigo de “contingente”.
- `ch001` ¶21, fonte linha 43, *dicunt quidem aliquid, et cetera*: “dizem certamente alguma coisa, etc.” acompanha a fonte; o predicado suplementar do inglês não deve ser incorporado.
- Reavaliados e mantidos os achados rejeitados na Round 1: ¶6, linha 13, *impossibile*; ¶25, linha 51, *in cuius motu* e *capitulo 15*, todos presentes na fonte; ¶16–17, linhas 33/35, quebra original; ¶22, linha 45, *oritur*, literalmente “nasce”; ¶5/15, linhas 11/31, citações latinas traduzidas integralmente. As dificuldades não são defeitos introduzidos pelo português.

Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-aeternitate-mundi/evidence/review-2.md` (fora do corpus).

### Round 3

Foco: leitura a frio integral do pt-BR, seguida de verificação das marcas no latim e varredura de ortografia, diacríticos, crase, hifens, pontuação e aspas; auditoria mecânica 1–6, metadados e diário. Veredito: CLEAN; nenhum defeito objetivo confirmado, nenhuma correção no texto, metadados ou Termos-chave/afirmações anteriores.

Achados considerados e rejeitados:
- `ch001` ¶8, fonte linha 17, *si ipse voluisset*: “se assim o tivesse querido” conserva a condição relativa ao querer divino; a correlação difícil não autoriza substituir a condição pelo “unless” inglês.
- `ch001` ¶16, fonte linha 33, *Prius enim naturaliter inest unicuique quod convenit sibi in se, quam quod ex alio habetur*: “é naturalmente anterior ... aquilo ... ao que” tem regência correta, apenas com sujeito e complemento separados pela inversão.
- `ch001` ¶18, fonte linha 37, *si eum sibi sol relinqueret*: em “se o sol o abandonasse a si”, o objeto e “a si” retomam o ar deixado a si mesmo, continuando o exemplo do ¶17; não há pronome irrecuperável.
- `ch001` ¶20, fonte linha 41, *nec alterum altero prius esset*: “nenhum dos dois” retoma pé e pegada; o masculino é regular para esse par misto.
- `ch001` ¶23, fonte linha 47, *pro eis facere ... praestant eis debile fulcimentum*: “sua posição” e “lhes” retomam os opositores do parágrafo anterior, não os autores citados depois.
- `ch001` ¶25, fonte linha 51, *eorum motus ... Creatori ... coaeterni esse non possunt*: o sujeito implícito de “não podem ser coeternos” admite os anjos mencionados na citação; a proximidade de “movimentos” não impede recuperar o antecedente. Mantidas também as rejeições anteriores de ¶6, linha 13, *impossibile*, e ¶25, linha 51, *in cuius motu*: as dificuldades de sentido são da fonte, não defeitos introduzidos na tradução.

Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-aeternitate-mundi/evidence/review-3.md` (fora do corpus).
