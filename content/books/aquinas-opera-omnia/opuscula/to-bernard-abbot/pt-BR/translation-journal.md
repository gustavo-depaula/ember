# Diário de Tradução — Carta ao Abade Bernardo de Monte Cassino (pt-BR)

Fonte canônica: `la/ch001.md` (latim). Consulta secundária: `en-US/ch001.md`, somente para registro e terminologia, conforme o precedente de *Do Ente e da Essência*.
Destino: pt-BR.

## Termos-chave

| Latim | Português (pt-BR) | Notas |
|---|---|---|
| Thomas de Aquino | Tomás de Aquino | Santo Tomás de Aquino nos metadados, como nas obras irmãs. |
| praescientia / praescire | presciência / conhecer de antemão | Presciência conforme *Das Razões da Fé*. |
| providentia / scientia / cognitio | providência / ciência / conhecimento | Distinções preservadas. |
| necessitas absoluta / conditionalis | necessidade absoluta / condicional | *Haec conditionalis*: esta proposição condicional. |
| secundum se | considerado em si mesmo | Consideração distinta da relação com a presciência divina. |
| poenitentia | penitência | |
| beatus Gregorius / Benedictus / beatus Maurus | São Gregório / Bento / São Mauro | Nomes portugueses; *beatus* como título de santo. |
| Ezechias / Malachias / Moyses / Petrus | Ezequias / Malaquias / Moisés / Pedro | |
| Casinensis / Gallia | de Monte Cassino / França | |

## Decisões de tradução

- 2026-10-02: Tradução integral do latim, com o mesmo título, onze parágrafos e itálicos. As citações latinas também são traduzidas; não se duplica o original. Tratamento epistolar por “vós”.
- 2026-10-02: Notas editoriais descartadas por padrão. O latim não tem notas; não se importaram as referências numéricas e bibliográficas acrescentadas pelo inglês. As citações de Malaquias e de Moisés seguem a redação latina, sem completar pela Bíblia.
- 2026-10-02: Preservados os dois sinais `(...)` da fonte, inclusive a ruptura sintática do sétimo parágrafo. No fragmento *doctoris exprimunt*, “exprimem o que diz o doutor” apenas torna legível o genitivo, sem reconstruir o conteúdo ausente. Não se adotaram as omissões ou reformulações do inglês para encobrir as lacunas.
- 2026-10-02: *Scripturae mandatur* no segundo parágrafo significa “posto por escrito”; *sortiuntur effectum*, “chegam a realizar-se”, não destino; *laqueo*, “por enforcamento”; *oculata fide*, “com a evidência do que se vê”.
- 2026-10-02: Nome e título da toc traduzem o título latino. O campo `description` já existia: recebeu tradução da descrição existente, embora esta caracterize o assunto como oração dos moribundos, enquanto o texto discute presciência e necessidade. Nenhum campo novo foi criado. A compilação do corpus fica a cargo do orquestrador, conforme solicitado.

## Edições na fonte

Nenhuma. As lacunas e a diferença entre as duas citações sobre a perda dos bens da misericórdia divina foram conservadas, sem correção conjectural.


## Review log

### Round 1

- Foco: completude parágrafo por parágrafo; auditoria mecânica e metadados. Veredito: **ISSUES 1**.
- Corrigido `book.json`, `description.pt-BR`: “Uma breve carta que Tomás de Aquino escreveu perto do fim de sua vida a Bernardo Aiglier OSB, abade de Monte Cassino, sobre uma questão relativa ao ensinamento de Gregório Magno acerca do que acontece à oração daqueles que morrem em pecado mortal.” → “Uma breve carta de Tomás de Aquino ao abade Bernardo de Monte Cassino que esclarece palavras de São Gregório sobre a presciência divina, o momento da morte e a distinção entre necessidade absoluta e condicional.” A descrição herdada, registrada acima, atribuía ao livro um assunto ausente; a nova descrição se apoia no título e em `la/ch001.md:9,13`. A decisão anterior documenta o estado inicial, agora corrigido em pt-BR.
- Rejeitado: corrigir a sintaxe interrompida do parágrafo 7 (`la/ch001.md:15`, “et (...) doctoris exprimunt”). A ruptura pertence à fonte; o genitivo admite a explicitação já registrada, sem reconstruir o trecho ausente.
- Rejeitado: harmonizar as citações de misericórdia divina (`la/ch001.md:9,11`, “amittunt” / “non ex necessitate amittunt”). A diferença portuguesa reproduz a diferença latina.
- Rejeitado: acrescentar “acrescentados” na segunda citação dos quinze anos (`la/ch001.md:15`, “anni ad vitam quindecim”). Só a primeira citação contém “additi” (`:9`).
- Rejeitado: importar referências numéricas do inglês ou duplicar as citações em latim (`la/ch001.md:9,17`). A fonte não contém os números; as citações do original latino foram traduzidas integralmente em itálico, conforme a decisão registrada.
- Rejeitado: trocar “vossa carta” por plural (`la/ch001.md:7`, “vestrae litterae”). O plural latino pode designar uma única carta.
- Evidência integral: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__to-bernard-abbot/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, oração por oração, contra o latim canônico, além da auditoria mecânica e do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual.
- Rejeitado: tratar a formulação da necessidade absoluta como inversão da tese (`la/ch001.md:13`, “non quidem absolutam, ut omnino, secundum se considerata, non possint ... aliter evenire”). Em português, “não absoluta, de modo que ... não ... pudessem acontecer de outro modo” descreve a modalidade negada; a oposição seguinte com “mas condicional” preserva o argumento. Preferir “como se” seria opção de estilo.
- Rejeitado: considerar “por muitos anos” acréscimo factual no fecho (`la/ch001.md:23`, “Valeat paternitas vestra diu”). É expressão idiomática de duração longa para “diu”, num voto de saúde, sem prazo numérico.
- Evidência integral: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__to-bernard-abbot/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral do português antes de consultar a fonte, seguida de conferência latina e varredura de ortografia, diacríticos, crase, hifens e pontuação; auditoria mecânica, metadados e diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual.
- Rejeitado: reparar o sujeito ausente em “e (...) exprimem” (`la/ch001.md:15`, “et (...) doctoris exprimunt”). A leitura fria detecta a ruptura, mas ela pertence à lacuna do original; reconstruí-la acrescentaria conteúdo sem apoio.
- Rejeitado: substituir a ligação “não absoluta, de modo que” como erro de sentido ou gramática (`la/ch001.md:13`, “non quidem absolutam, ut omnino, secundum se considerata, non possint ... aliter evenire”). A oração caracteriza a necessidade absoluta negada, em oposição à condicional; mantém-se a justificativa da rodada 2.
- Evidência integral: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__to-bernard-abbot/evidence/review-3.md`.
