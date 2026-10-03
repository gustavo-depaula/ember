# Translation Journal — O Ensinamento dos Apóstolos (pt-BR)

Source: en-US/ch001.md (B. P. Pratten, Ante-Nicene Fathers, vol. 8, via New Advent). Única língua disponível; não há diretório la/.
Target: pt-BR

## Key Terms

| English | Português | Notas |
|---|---|---|
| Teaching / Miscellaneous | Ensinamento / Diversos | Conforme miscellaneous/didache; esta obra mantém seu próprio título. |
| priesthood / priest | sacerdócio / sacerdote | Conforme ambrose/repentance. |
| elders / deacons / subdeacons / overseer | presbíteros / diáconos / subdiáconos / bispo | Cargos eclesiásticos. |
| Guide / Ruler | Guia / Governante | Preservada a distinção lexical da fonte. |
| Ordinances and Laws | Ordenanças e Leis | |
| service / oblation | ofício / oblação | Contexto litúrgico. |
| Spirit, the Paraclete | Espírito, o Paráclito | |
| Simon Cephas / Judas Thomas | Simão Cefas / Judas Tomé | Mantidas as formas compostas da fonte. |
| Addæus / Aggæus | Adeu / Ageu | Mantidos como personagens distintos. |
| mammon / nativities | mamom / horóscopos de nascimento | Riqueza e astrologia, respectivamente. |

## Translation Decisions

- 2026-10-02: Tradução integral, com os mesmos parágrafos, itálicos e duas séries numéricas (1–27 e 1–10). Números em negrito no destino, conforme books.md; fonte intocada.
- Adotados de Ambrósio, Sobre a Penitência, e da Didaquê: aspas curvas, vós nas exortações coletivas, nomes bíblicos em português e referência Mateus 24:27 com os números originais. Pronomes reverenciais em minúsculas. Citações traduzidas da redação inglesa, sem substituição por versões bíblicas ou litúrgicas.
- Notas editoriais seriam descartadas por padrão; não há notas de rodapé na fonte. Preservados o resumo inicial e a referência bíblica no corpo. Nenhuma nota do tradutor acrescentada.
- Preservadas as datas e atribuições históricas da edição, inclusive a comemoração da ascensão após cinquenta dias e a morte de Simão Cefas pela espada. Heziran e Canun mantidos; “latter Canun” → “segundo Canun”; “long number of the Greeks” → “longa contagem dos gregos”, sem conversão de calendário.
- Metadados: pt-BR somente nos campos existentes name, author, languages e toc.title; “unknown date” → “data desconhecida”. Build reservado ao orquestrador, conforme instrução do usuário.

## Source Edits

Nenhuma alteração na fonte.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, referências bíblicas e auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no texto, nos metadados ou nos Key Terms.
- Considerado e rejeitado: trocar cinquenta por quarenta dias na ordenança 9. A fonte, `en-US/ch001.md:31`, diz “At the completion of fifty days”; preserva-se a edição, sem harmonização histórica.
- Considerado e rejeitado: corrigir a morte de Simão Cefas para crucifixão. A fonte, linha 107, diz “dispatched with the sword”; “matou pela espada” é fiel.
- Considerado e rejeitado: normalizar Prisco e Áquilo para Priscila e Áquila. A fonte, linha 105, traz “Priscus and Aquilus”; a tradução conserva esses nomes, sem substituí-los pelo par bíblico mais conhecido.
- Considerado e rejeitado: supostas divergências do glossário em “guide” e “ofício”. Na linha 69, “He would guide them lawfully” tem verbo, corretamente “os guiasse segundo a lei”; nas linhas 93, 97 e 99, “office” também corresponde legitimamente a “ofício”, sem contradizer service → ofício.
- Evidência: `.claude/codex-runs/runs/church-fathers__miscellaneous__teaching-of-the-apostles/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, cláusula por cláusula, e auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, na fonte, nos metadados ou nos Key Terms/afirmações do diário.
- Considerado e rejeitado: esclarecer “entre eles” na ordenança 15. A fonte, `en-US/ch001.md:43`, diz “among them” e “minister with them”; o contexto ministerial determina o grupo, e a tradução preserva a elipse, sem inverter o referente.
- Considerado e rejeitado: alterar a aceitação das cadeias injustas na ordenança 21. A fonte, linha 55, diz “accidentally” e “as if he had been equitably bound”; “acidentalmente” e “como se tivesse sido acorrentado com equidade” preservam a regra, mesmo estranha, da edição.
- Considerado e rejeitado: tratar “se pedirão contas” como acréscimo na ordenança 24. A fonte, linha 61, diz “at whose hand all of them shall be required”; a expressão traduz a responsabilidade do Governante pelos presbíteros, sem acrescentar obrigação distinta.
- Considerado e rejeitado: suprimir o pronome feminino em “a fronteira que a separa dos bárbaros”. A fonte, linha 97, diz “the boundary which separates from the barbarians”; o antecedente territorial é a região da Trácia, e o português apenas explicita o objeto recuperável.
- Mantidas, após reconferência, as rejeições da Round 1 sobre cinquenta dias, morte pela espada, Prisco/Áquilo e guide/ofício.
- Evidência: `.claude/codex-runs/runs/church-fathers__miscellaneous__teaching-of-the-apostles/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral do português antes da fonte, seguida de varredura ortográfica e auditoria mecânica 1–6, metadados e diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, na fonte, nos metadados ou nos Key Terms/afirmações do diário.
- Considerado e rejeitado: completar sintaticamente o resumo inicial. `en-US/ch001.md:3`, “At that time …; and how …; and the Ordinances and Laws …”, já apresenta uma enumeração de assuntos; o português preserva sua função de resumo.
- Considerado e rejeitado: alterar “no cuidado que ele tem por nós, que nos prometeu”. Fonte, linha 9: “His care for us, which He promised us”. O último relativo retoma cuidado como objeto de prometeu; o sujeito elíptico é nosso Senhor, sem referente irrecuperável.
- Considerado e rejeitado: eliminar a retomada “Quem …, não volte esse homem”. Fonte, linha 41: “Whosoever lends …, let not this man minister again”. A retomada do tópico é enfática, sem quebra de concordância.
- Considerado e rejeitado: suprimir o segundo “ali” na descrição da Índia. Fonte, linha 87: “in which he also ministered there”. A repetição locativa é da fonte, e sua retirada seria estilística.
- Considerado e rejeitado: simplificar “que ele mesmo” nas linhas 89, 97 e 99. Fonte: “who himself laid”, “who himself built”, “who himself made”; a ênfase identifica o próprio Simão Cefas, Lucas ou Adeu como agente, sem erro de referente ou concordância.
- Evidência: `.claude/codex-runs/runs/church-fathers__miscellaneous__teaching-of-the-apostles/evidence/review-3.md`.
