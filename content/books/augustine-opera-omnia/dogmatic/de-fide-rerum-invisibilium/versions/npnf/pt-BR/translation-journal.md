# Diário de tradução — Sobre a Fé nas Coisas que Não se Veem (pt-BR)

Fonte: en-US/ch001.md, tradução de C. L. Cornish (NPNF, primeira série, vol. 3), conforme book.json. A obra não possui diretório la/; o inglês disponível é a fonte desta tradução.
Destino: pt-BR.

## Termos

| Inglês | Português | Convenção |
| --- | --- | --- |
| Augustine of Hippo | Agostinho de Hipona | Metadados de `faith-and-the-creed` e `creed`; sem honorífico acrescentado. |
| Concerning Faith of Things Not Seen | Sobre a Fé nas Coisas que Não se Veem | Padrão de título das obras irmãs. |
| faith / believe | fé / crer | Preservado o vínculo entre fé religiosa e confiança humana no argumento. |
| will / good will | vontade / boa vontade | Disposição interior, distinta de seus sinais exteriores. |
| Holy Ghost | Espírito Santo | Conforme `creed`. |
| Abraham / Isaac / Jacob / Judah | Abraão / Isaac / Jacó / Judá | Abraão e Isaac conforme `patience`; formas portuguesas tradicionais. |
| Chrism / anointing | Crisma / unção | Mantida a explicação da relação com o nome Cristo. |
| Bridegroom / Bride | Esposo / Esposa | Imagem nupcial de Cristo e da Igreja. |
| Song of Songs | Cântico dos Cânticos | Nome português do livro bíblico. |

## Decisões

- 2026-10-02: Tradução integral, com título latino e introdução editorial no corpo, mantendo os parágrafos e as onze seções; números em `**N.**`. Notas editoriais de rodapé seriam omitidas por padrão; não há nenhuma na fonte. O título latino e a expressão bibliográfica *ad Darium Comitem* permanecem em latim, como na fonte.
- Aspas curvas; pronomes divinos em minúsculas, títulos divinos em maiúsculas, seguindo `creed`. Interlocutor individual tratado por tu, assembleia por vós; invocações a Deus por Vós.
- Citações traduzidas da redação inglesa, sem substituição por uma Bíblia portuguesa ou acréscimo de referências ausentes. A remissão editorial § 10 é preservada.
- Metadados pt-BR acrescentados somente aos campos existentes de nome, autor, idiomas e título do sumário. Sem build nesta execução, conforme solicitado.

## Expressões e particularidades

- `Seed` (§ 5): “Descendência”, mantendo a identificação explícita com Cristo e as repetições da promessa a Abraão.
- `confess unto you` (§§ 5–6): “louvar”, no contexto da proclamação do louvor da graça; `confess Christ` permanece “confessar Cristo”.
- § 7: “engrandecer o calcanhar” conserva a imagem incomum da fonte, seguida de sua própria explicação, “pisou-me”. “Palavra de Deus” designa a promessa citada, não o título pessoal Verbo.
- §§ 6 e 8: preservadas as particularidades da redação inglesa, inclusive Deus reconhecer a filha do Rei e as coisas presentes não serem vistas em sua totalidade; sem corrigir conjecturalmente a edição. A sequência condicional de § 6 permanece em um único parágrafo, com pontuação portuguesa.

## Alterações na fonte

- Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, citações e referências; auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: ISSUES 1; defeito corrigido.
- Correção: `pt-BR/ch001.md:3`, `De fide rerum quæ non videntur` → `*De fide rerum quæ non videntur*`. O título latino estava sem o itálico exigido pelas skills; palavras conferidas na fonte, linha 3.
- Rejeitados: fonte, linha 7 (§ 1), os incisos parentéticos estão integralmente traduzidos, embora sem parênteses; linha 11 (§ 3), a interrogação portuguesa explicita o argumento do período inglês irregular, sem adicionar conteúdo; linha 17 (§ 6), “If He acknowledges not the King's daughter” justifica Deus como sujeito de “não a reconhece”, sem emenda conjectural; linha 19 (§ 7), “enlarged his heel upon Me” justifica “engrandeceu seu calcanhar contra mim”, com a explicação “pisou-me” preservada; linha 21 (§ 8), “things present” exige conservar “coisas presentes”, não substituir por futuras. As citações incorporadas aos parágrafos, inclusive o Salmo no § 5 (fonte, linha 15), não foram destacadas em novos blockquotes para não dividir a estrutura original. “confess unto you” (§§ 5–6, linhas 15–17) admite “louvar” no contexto explícito de “the praise of grace”.
- Rejeitado também desvio de tratamento: fonte, linhas 15–19 (§§ 5–7), a filha/Igreja recebe tu, o Rei recebe Vós, e o Filho recebe Tu na fala de Deus; não são todos destinatários de oração. Fonte, linha 23 (§ 9), “let them examine” retoma os incrédulos em terceira pessoa, enquanto “receive ye” volta ao auditório; “examinem” e “ouvi” conservam a mudança.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__concerning-faith-of-things-not-seen/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, oração por oração, com auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: CLEAN; nenhum defeito objetivo confirmado, nenhuma correção textual ou de termos.
- Rejeitado: § 4, fonte linha 13, “that of parents by sons, and that of sons by parents”. “A dos pais para os filhos e a dos filhos para os pais” explicita a direção das vontades; no contexto de suspeita e falta de reciprocidade, conserva os dois polos do argumento, sem trocar o possuidor da vontade.
- Rejeitado: § 6, fonte linha 17, “If ... there are not so great multitudes ... and without end ... confess”. O segundo “não” em “e não lhe proclamam” explicita o alcance negativo da condição coordenada, sem negar uma afirmação independente.
- Rejeitado: § 7, fonte linha 19, “upon My vesture they cast the lot”. “Sobre minha túnica lançaram sortes” usa a expressão idiomática portuguesa, sem mudar o acontecimento nem acrescentar conteúdo bíblico.
- Rejeitado: § 10, fonte linha 25, “there arises not any perverse sect ... as that it affect not ... to glory in the name of Christ”. A dupla negação portuguesa conserva a afirmação de que mesmo as seitas reivindicam o nome de Cristo.
- Rejeitado: § 11, fonte linha 27, “lest they who now seem being approved to be mingled with the reprobate, find, not life, but punishment everlasting”. “Parecem aprovados, misturados aos réprobos” admite a aparência presente de aprovação; “para que ... não encontrem o castigo eterno, em vez da vida” conserva a advertência preventiva, não inverte o destino nem garante salvação.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__concerning-faith-of-things-not-seen/evidence/review-2.md`.

### Round 3

- Foco: leitura integral a frio do pt-BR, seguida de conferência na fonte inglesa e varredura de ortografia, diacríticos, crase, hífens, pontuação e aspas; auditoria mecânica 1–6, metadados e diário.
- Veredito: CLEAN; nenhum defeito objetivo confirmado, nenhuma alteração no capítulo, nos metadados ou nos termos e afirmações do diário.
- Rejeitado: § 2, fonte linha 9, “Although a man may also deceive ... or, if he have no thought to do harm ... feigns”. A oração portuguesa iniciada por “Embora” é uma concessão destacada que retoma a frase anterior; “possa enganar” e “finja” são alternativas válidas no subjuntivo, e “se não pensa” é a condição intercalada. Reunir os períodos seria ajuste de estilo, não correção de gramática ou sentido.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__concerning-faith-of-things-not-seen/evidence/review-3.md`.
