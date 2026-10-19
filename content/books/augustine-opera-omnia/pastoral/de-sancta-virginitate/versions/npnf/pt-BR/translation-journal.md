# Diário de tradução — Sobre a Santa Virgindade (pt-BR)

Fonte: en-US/ch001.md (C. L. Cornish, conforme book.json).
Destino: pt-BR.

## Termos

| Inglês | Português | Convenção |
| --- | --- | --- |
| Augustine of Hippo | Agostinho de Hipona | Metadados de `augustine/creed`. |
| Holy Virginity / Good of Marriage / Retractions | Santa Virgindade / Bem do Matrimônio / Retratações | Padrão dos títulos das obras irmãs de Agostinho. |
| continence / chastity / virginity | continência / castidade / virgindade | Conforme `continence`; preservadas as distinções. |
| charity / righteousness / lust, concupiscence | caridade / justiça / concupiscência | Conforme `continence` e `patience`; concupiscência traduz tanto `lust` (§34) como `concupiscence` (§24). |
| Word / Holy Spirit / Lamb | Verbo / Espírito Santo / Cordeiro | Verbo para a Pessoa divina; palavra nos demais contextos. |
| Mary / Susanna / Thecla / Crispina / Zaccheus | Maria / Susana / Tecla / Crispina / Zaqueu | Formas portuguesas. |
| command / counsel / vow | mandamento / conselho / voto | Distinção central do argumento. `counsel` como propósito divino: desígnio (§§1, 43); como orientação: conselho. |
| eunuchs / sanctimoniales | eunucos / sanctimoniales | Mantidas a imagem bíblica e a designação latina explicada pelo contexto. |

## Decisões

- 2026-10-02: Tradução integral exclusivamente do inglês local, incluindo o título latino e a introdução das Retratações, com os mesmos parágrafos e numeração em `**N.**`. Notas editoriais de rodapé são omitidas por padrão; não há nenhuma na fonte.
- Aspas curvas e pronomes divinos em geral em minúsculas, conforme as obras irmãs; preservado “Quem” em maiúscula no §4; Vós no tratamento direto a Deus, tu ao interlocutor singular e vós ao plural. Títulos divinos conservados em maiúsculas.
- Citações traduzidas da redação inglesa, sem substituição por versão bíblica publicada. Referências e seus números conservados, com nomes portugueses dos livros quando presentes; nenhuma remissão acrescentada.
- Metadados: pt-BR somente em `name`, `author`, `languages` e título do sumário. Sem descrição nova e sem build, conforme a instrução desta execução.

## Expressões e particularidades

- `penny` (§26): “denário”, moeda da parábola; `preventing one another` (§47): “antecipando-vos uns aos outros”, no sentido antigo do verbo inglês.
- Preservadas as formulações da edição: “casar-se em Cristo” (§34), “O Senhor torna sábios os cegos” (§43) e as diferentes formas das citações repetidas. Não substituídas por versões bíblicas familiares.
- `sanctimoniales` (§57) permanece em latim, pois a frase explica a relação do nome com a santidade. `De virginitate` permanece como título latino da fonte.

## Alterações na fonte

- Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo, citações, incisos, frases latinas e referências; auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: **ISSUES 5**, corrigidos.
- §25, linha 55: “no próprio fato de se absterem delas” → “no próprio fato de se absterem dela”. O antecedente português é o singular “toda relação sexual”; a fonte tem “abstain from these”. Corrigida a concordância sem alterar o objeto da abstinência.
- §30, linha 65: “Pois não se pode dizer: Não te casarás, como se diz: ‘Não cometerás adultério, não matarás.’” → “Pois não se pode dizer, como se diz: ‘Não cometerás adultério, não matarás’, também: Não te casarás.” Restaurada a ordem da fonte, “For not as, ‘You shall not commit adultery, You shall not kill,’ can it so be said, You shall not wed”, da qual dependem “As primeiras coisas são exigidas; as últimas são oferecidas”.
- §39, linha 83: “Àquelas palavras acompanha o temor […] ; a estas palavras acompanha o temor” → “Aquelas palavras são acompanhadas pelo temor […] ; estas palavras são acompanhadas pelo temor”. Corrigida a regência de “acompanhar” nas duas orações paralelas; a fonte tem “With those sayings there companies fear […] but with these sayings there companies chaste fear”. Contado como um defeito repetido na mesma construção.
- §57, linha 119: “sanctimoniales” → “*sanctimoniales*”. Aplicado o itálico exigido para a designação latina, sem alterar a palavra da fonte.
- Diário, Decisões: “pronomes divinos em minúsculas” → “pronomes divinos em geral em minúsculas […] preservado ‘Quem’ em maiúscula no §4”. A afirmação absoluta não descrevia “antes de saber Quem dela nasceria” (fonte, linha 13: “before she knew Who was to be born of her”). Corrigida a descrição; preservada a capitalização do capítulo conforme books.md.
- Considerados e rejeitados: §22, fonte linha 49, “is divided; […] that is, distinguished, and separated” → “é distinta”: o próprio comentário define divisão como distinção, sem perda de conteúdo. §34, fonte linha 73, “they wish to wed in Christ” → “querem casar-se em Cristo”, e §43, fonte linha 91, “The Lord makes wise the blind” → “o Senhor torna sábios os cegos”: conservam as formulações locais, já justificadas no diário; não substituir por versões bíblicas familiares. §45, fonte linha 95, “Whence […] does she know but that she herself be not as yet Thecla, that other be already Crispina” → “De onde […] sabe que ela própria ainda não é Tecla e que a outra já é Crispina?”: a pergunta, precedida por “talvez” e seguida pela ausência de comprovação sem provação, mantém a incerteza sobre os dons ocultos; não é afirmação da inferioridade da virgem. §46, fonte linha 97, “those these chastities”: duplicação estranha já presente na fonte; “dessas castidades” transmite o referente sem duplicar determinantes. Não se emendou a fonte sem prova de lapso de OCR.
- Considerados e rejeitados, estrutura: §1, fonte linha 7, “(whom the Apostle sets forth as the olive […] )”, e §32, fonte linha 69, “(whereas Luke most plainly signifies […] )”: os incisos estão integralmente presentes, com travessões ou incorporados à sintaxe; não há omissão pela ausência dos parênteses. §7, fonte linha 19, período iniciado por “I have said this”: a redistribuição das orações em frases portuguesas não divide o parágrafo. §35, fonte linha 75, citação iniciada por “I confess to You, O Father”: permanece integrada ao mesmo parágrafo; convertê-la em bloco separado alteraria a estrutura da fonte. Numeração da fonte “1.” etc.: preservada por não constituir corrupção OCR; no destino já se usa a numeração inerte exigida.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-1.md`.

### Round 2

- Foco: leitura bilingue integral, cláusula por cláusula; auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual ou de termos.
- Considerados e rejeitados: §26, fonte linha 57, “this corruptible” → “este corpo corruptível”: o substantivo explicita a elipse, sem acrescentar conteúdo ao contraste mortal/imortal. §35, fonte linha 75, “I confess to You, O Father” → “Eu vos louvo, ó Pai”: reconhecimento laudatório, coerente com a revelação aos pequeninos; não se trata de confessar pecados. §45, fonte linha 95, “Whence ... does she know but that she herself be not as yet Thecla, that other be already Crispina”: mantida a rejeição da rodada 1; a pergunta sobre como saber, entre “talvez” e a necessidade da provação, conserva a incerteza, sem afirmar inferioridade pessoal. §52, fonte linha 109, “The Guardian therefore of virginity is Charity” → “A Guardiã da virgindade é, portanto, a Caridade”, depois “seu Guardião”: o gênero acompanha Caridade e Deus, sem mudança de agente.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-2.md`.

### Round 3

- Foco: leitura integral do pt-BR sem consultar o capítulo-fonte, seguida de conferência das marcas com a fonte, varredura ortográfica e auditoria mecânica 1–6 e dos metadados. Veredito: **ISSUES 2**, corrigidos.
- §2, linha 9: “De quem cuidamos, então, da pureza virginal” → “Da pureza virginal de quem cuidamos, então”. Corrigida a construção que desligava “de quem” do nome “pureza”; fonte: “For whose virgin purity consult we for”. A correção preserva a pergunta sobre a pureza da Igreja.
- §45, linha 95: “Pois, para passar por cima dos demais” → “Pois, deixando de lado o restante”. Defeito encontrado na conferência: “For, to pass over the rest” é uma transição que deixa outras considerações de lado, não uma ação de superar ou desprezar outras pessoas.
- Considerados e rejeitados: §7, fonte linha 19, “we could not both have the whole”: “ambas” refere-se às duas classes, casadas e virgens. §35, fonte linha 75, “What, I beseech You […] to learn what of You, come we to You?”: a interrogação portuguesa é retomada após os vocativos, sem ruptura sintática. §39, fonte linha 83, “Those sayings let him have had […] and she”: “Tenha tido” anteposto admite concordância com o primeiro núcleo do sujeito.
- Considerados e rejeitados: §46, fonte linha 97, “married charity”: conservar “caridade conjugal”, sem normalizar para castidade. §49, fonte linha 103, “such unto one such”: o referente de “alguém como ele” é explicitado por “o mesmo João” na frase seguinte. §55, fonte linha 115, “the price of him that believes”: “o preço daquele que crê” conserva a imagem da pessoa resgatada; não trocar o verbo para referi-lo a Cristo.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e compromissos de gênero, antecedente e tratamento; leitura integral contra a fonte inglesa declarada (não há `la/`), auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma alteração no capítulo, nos metadados ou nos termos.
- Considerados e rejeitados: §6, fonte linha 17, “having been dyed in His Sacraments, may become members of Christ”: “Sacramentos dele” refere-se a Cristo, confirmado pelo resultado “membros de Cristo”; a proximidade de Adão não obriga a esse antecedente. §29, fonte linha 63, “you shall hear of yourselves”: “vós mesmos” é coletivo masculino dos homens e mulheres explicitamente convocados no §27, não erro de concordância por ser usado o nome “virgens”.
- Considerados e rejeitados: §30, fonte linha 65, “if you shall have spent any thing more, on His return He will repay you”, e §41, fonte linha 87, “What […] have you, which you have not received?”: o tu individualiza distributivamente a exortação ao grupo; a fonte deixa o número de “you” aberto, e os contextos “each”/“each one” sustentam a escolha. §40, fonte linha 85, “lest you be accounted among the many”: “contada” retoma a alma/virgem singular dos §§38–39, sem excluir os homens do público geral.
- Considerados e rejeitados: §42, fonte linha 89, “By the Lord the steps of a man are directed, and He shall will His way”: “ele quererá seu caminho” conserva a abertura dos antecedentes da citação, sem impor nova identificação. §53, fonte linha 111, “Love the one that you may imitate it; mourn over the other”: “Amai uma coisa […] lamentai a outra” retoma perseverar e cair, ações das duas classes imediatamente anteriores; não acrescenta objetos alheios. §57, fonte linha 119, “ye be not joined in marriage”: “não estejais unidas” continua o feminino explícito de “daughters of God” e “husbands” no §56, não contradiz as exortações anteriores ao grupo misto.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-4.md`.

### Round 5

- Foco: termos em ambas as direções por parágrafo, afirmações do diário e nomes próprios; auditoria mecânica 1–6 e metadados. Veredito: **ISSUES 2**, corrigidos na tabela de termos.
- Termos, linha `charity / righteousness / lust`: `lust` → `lust, concupiscence` na origem de “concupiscência”. A correspondência inversa estava incompleta: §24, fonte linha 53, “the very root of concupiscence”, além dos dois `lust` em §34, linha 73. Incorporada a convenção já registrada em `continence`; capítulo preservado.
- Termos, linha `command / counsel / vow`: `counsel → conselho` sem ressalva → conselho como orientação; desígnio como propósito divino. A tabela não descrevia §1, fonte linha 7, “the very deep counsel of God”, nem §43, linha 91, “by secret counsel, by unrighteous He cannot”. As traduções existentes exprimem o propósito de Deus, não um conselho dirigido a alguém; corrigida a tabela.
- Considerados e rejeitados: §4, fonte linha 13, “vowed herself unto God as a virgin”: a nominalização “pelo voto de virgindade” explica a ocorrência adicional de virgindade. §9, linha 23, “most rightly”, e §42, linha 89, “Your righteousnesses”: “com toda justiça” e “vossos preceitos de justiça” explicam a diferença na contagem de justiça, sem acréscimo de conteúdo. §43, linha 91, “by unrighteous”: o segundo “desígnio” explicita a elipse, não acrescenta outro propósito.
- Considerados e rejeitados: §§14, 29 e 34, fonte linhas 33, 63 e 73, “not to have vowed […] vowed and performed”, “what you have vowed with ardor” e “which they had vowed at the first”: “prometer” retoma o compromisso religioso já expresso; a diferença de contagem de voto não implica omissão. §3, linha 11, “word had been brought to Him” e “hear the Word of God”: notícia e palavra designam comunicação, não a Pessoa divina; mantido Verbo em §§27 e 37, linhas 59 e 79, “the Word of God” e “the Word made flesh”.
- Considerados e rejeitados: §32, fonte linha 69, “unto Him” → “até Jesus” explicita o referente, justificando a ocorrência adicional do nome; “Canaan” é Canaã, não Caná. §45, linha 95, “Thecla […] Crispina”: Tecla tem precedente nas obras irmãs, e Crispina, sem ocorrência nelas, tem forma portuguesa confirmada; não alterar os nomes nem reabrir a interpretação já discutida. §57, linha 119, “Three Children”: Três Jovens é a designação do grupo bíblico, não omissão de nomes individuais.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-5.md`.

### Round 6

- Foco: completude parágrafo por parágrafo, citações, incisos, frases e referências; auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual ou de termos.
- Considerados e rejeitados: §10, fonte linha 25, “For not even herein […] but a sacred virgin not even of marriage”: o único período inglês é distribuído em três frases portuguesas, conservando todas as oposições no mesmo parágrafo; não há divisão de parágrafo. §15, fonte linha 35, “You are bound to a wife, seek not loosening: you are loosed from a wife, seek not a wife”: as perguntas “Estás ligado a uma esposa?” e “Estás livre de esposa?” explicam a maior contagem de frases, sem adicionar ou omitir condições ou mandamentos. §24, fonte linha 53, “(such as are the eunuchs of rich men and of kings,)”: o inciso está conservado entre travessões; a mudança de delimitador não é perda de conteúdo.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-6.md`.

### Round 7

- Foco: leitura bilingue integral, oração por oração, contra a fonte inglesa local declarada; auditoria mecânica 1–6, metadados, termos e afirmações do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual ou de termos.
- Considerados e rejeitados: §11, fonte linha 27, “because she could not, even as Mary, conceive Him in her flesh”: “por não poder, como Maria, concebê-lo em sua carne” compara o modo de conceber com o de Maria, sem atribuir a Maria a impossibilidade; uma reformulação seria esclarecimento estilístico. §39, fonte linha 83, “keeping in your heart that you have been born again, keeping in your flesh that you have been born”: “aquilo em que renasceste […] aquilo em que nasceste” conserva a condição virginal do coração e da carne indicada por “as you are a virgin”, sem apagar o contraste entre renascimento e nascimento.
- Considerado e rejeitado novamente: §45, fonte linha 95, “Whence […] does she know but that she herself be not as yet Thecla, that other be already Crispina”: a pergunta sobre Tecla e Crispina, no contexto de “talvez” e da necessidade de provação, conserva a incerteza; mantida a rejeição fundamentada das rodadas anteriores.
- Evidência: `.claude/codex-runs/runs/church-fathers__augustine__holy-virginity/evidence/review-7.md`.
