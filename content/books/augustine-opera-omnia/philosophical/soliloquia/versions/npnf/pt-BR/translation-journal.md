# Diário de tradução — Solilóquios (pt-BR)

Fonte: en-US/ch001.md e ch002.md; tradução de C. C. Starbuck indicada em book.json. A obra não possui diretório la/.
Destino: pt-BR.

## Termos

| Inglês | Português | Convenção |
| --- | --- | --- |
| Augustine of Hippo | Agostinho de Hipona | Metadados de `augustine/patience` e `enchiridion`; sem honorífico. |
| Soliloquies | Solilóquios | Título; Livro I e Livro II no sumário. |
| Reason / reason | Razão / razão | Interlocutora personificada / faculdade. |
| soul / mind | alma / mente | Distinção preservada. |
| Truth / true | Verdade / verdadeiro | A distinção entre a Verdade e as coisas verdadeiras governa o argumento. |
| Wisdom | Sabedoria | Personificação preservada. |
| knowledge / science / discipline | conhecimento / ciência / disciplina | Conforme o emprego no argumento. |
| false / falsity | falso / falsidade | Coisas falsas e proposições falsas são distinguidas conforme o diálogo. |
| fallacious / mendacious | enganador / mentiroso | II, 16–18 distingue intenção de enganar de ficção sem essa intenção. |
| inane | vazio | II, 31 preserva o jogo entre vazio físico e vazio intelectual. |
| Alypius / Cornelius Celsus | Alípio / Cornélio Celso | Nomes portugueses; Platão, Plotino e Cícero igualmente. |
| understanding / intellect | entendimento / intelecto | Apreensão intelectual, distinta dos sentidos. |
| faith, hope, charity | fé, esperança, caridade | Conforme `patience` e `enchiridion`; love traduzido por amor. |
| intelligible / sensible | inteligível / sensível | Objetos da inteligência / dos sentidos. |

## Decisões

- 2026-10-02: Tradução integral da única língua disponível, en-US, preservando arquivos, parágrafos e ordem das falas. Numeração em negrito; o primeiro parágrafo do Livro I não tem número e a fonte salta de 5 para 7: ambos preservados, sem reconstrução de texto ausente.
- Convenções de `augustine/patience` e `enchiridion` (fontes verificadas nos metadados): aspas curvas, tratamento de Deus com Vós e diálogo com tu. Pronomes referentes a Deus em minúsculas fora do tratamento Vós; títulos personificados conservam maiúsculas.
- Citações traduzidas da redação fornecida, sem substituição por Bíblia portuguesa nem acréscimo de referências. Notas editoriais de rodapé omitidas por padrão; glosas integrantes do corpo preservadas.
- As referências implícitas à Escritura na oração não recebem remissões novas. Não há notas de rodapé na fonte. A citação poética em II, 29 conserva seu bloco separado e a continuação do parágrafo seguinte. `Non sequitur` permanece em latim; *Phantasia* e *Phantasma* conservam as formas gregas transliteradas, sem notas acrescentadas.
- Conservadas as afirmações da edição, inclusive a formulação geométrica de I, 10, a afirmação sobre a mandíbula do crocodilo em II, 15 e a sequência de siglas em II, 33, sem corrigir o argumento nem completar interlocutores. Lapsos gráficos evidentes foram compreendidos em seu sentido contextual (por exemplo, `rotaries` por devotos, I, 22; `resuits` por resulta, II, 15; `made to time` por feitas a ti, II, 34), sem alteração dos arquivos ingleses.
- Metadados: pt-BR acrescentado somente aos campos existentes de nome, autor, idiomas e títulos do sumário. Sem build, conforme instrução desta execução.

## Alterações na fonte

- Nenhuma.

## Review log

### Round 1

- Foco: completude, alinhamento de todos os parágrafos e referências; auditoria mecânica 1–6, metadados e afirmações do diário. Fonte canônica: en-US, sem la/. Veredito: 1 defeito corrigido.
- I, §12 (`ch001.md:23`): “Pois aquilo que ainda não pode ser mostrado à alma…” → “Pois, quanto àquilo que ainda não pode ser mostrado à alma…”. O sintagma inicial ficava sem função sintática na oração principal “não cuida de sua saúde”. A construção de tópico explicita a ligação, conservando a condição e todo o conteúdo de “For what cannot yet be shown forth to her … if she does not believe that otherwise she will not see, she gives no heed to her health” (`en-US/ch001.md:23`).
- Rejeitado: aparente lacuna do §6 e ausência do número inicial em I. A fonte começa “As I had been…” e passa de “5. Henceforth” a “7. A. Behold” (`en-US/ch001.md:3,11,13`); não cabe reconstruir a edição.
- Rejeitado: corrigir a geometria de I, §10 (“no two resulting circles will be equal”, `en-US/ch001.md:19`), a mandíbula do crocodilo em II, §15 (“move its upper jaw”, `en-US/ch002.md:31`) ou a repetição de A. em II, §33 (`en-US/ch002.md:71`, “Why then do we hesitate? … A. God avert such madness”). O português conserva as afirmações e siglas da fonte; não são defeitos da tradução.
- Rejeitado: trocar “e não haver Verdade” em II, §2 por identificação entre coisa verdadeira e Verdade. “anything can be true, and not be Truth” (`en-US/ch002.md:5`) admite leitura existencial, sustentada pela sequência “There will therefore be Truth” e “if Truth is not”; a tradução preserva esse argumento.
- Rejeitado: exigir parênteses gráficos idênticos ou igual contagem de frases. Os apartes, como “(as I believe)” (`en-US/ch001.md:15`) e “(conceding their occurrence)” (`en-US/ch002.md:23`), estão traduzidos como incisos; a pontuação de I, §27 e II, §§14, 29 e 32 divide frases sem dividir parágrafos nem suprimir conteúdo.
- Rejeitado: “feitas a ti” no diário como alegada citação inexata. É uma glosa contextual de “made to time” (`en-US/ch002.md:73`); o capítulo efetivamente diz “as falsas sugestões que te fazem”, com o mesmo sentido. Também “rotaries” → “devotos” (I, §22) e “resuits” → “resulta” (II, §15) são leituras contextuais de lapsos já declarados, não alterações clandestinas da fonte.
- Rejeitado: impor concordância global em I, §11 (“not only the objects … but the knowledge itself appears”, `en-US/ch001.md:21`): “não só os objetos … mas o próprio conhecimento parece” admite concordância por proximidade. Em II, §35 (“that, when this is seen, is not seen”, `en-US/ch002.md:75`), “quando esta é vista, aquela não é vista” retoma respectivamente Verdade e Fantasia, conforme a oposição do parágrafo; não há inversão.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__soliloquies/evidence/review-1.md`.

### Round 2

- Foco: cotejo bilíngue integral, oração por oração, com en-US; auditoria mecânica 1–6, metadados e afirmações do diário. Veredito: 1 defeito corrigido.
- I, §4 (`ch001.md:9`): “Vós, Deus único, tudo o que eu tenha dito, vinde em meu auxílio” → “Seja o que for que eu tenha dito, Vós, Deus único, vinde em meu auxílio”. O sintagma “tudo o que eu tenha dito” ficava sem função na construção imperativa; a concessiva explicita a ligação de “Whatever has been said by me, Thou the only God, do Thou come to my help” (`en-US/ch001.md:9`), sem acrescentar conteúdo ao pedido.
- Rejeitado: tratar “sensible” → “sujeito a perturbação” em I, §16 como violação de “sensível” no glossário. A fonte diz “sensible to perturbation” (`en-US/ch001.md:31`), isto é, suscetível à perturbação; não designa aqui a classe dos objetos sensíveis. Igualmente, “obtains faith” → “encontra crédito” em II, §29 (`en-US/ch002.md:63`) designa acreditar numa proposição, não a virtude da fé.
- Rejeitado: impor “enganadoras” em II, §35, em lugar de “enganosas”, por causa da linha “fallacious / mendacious”. “Those imaginations … are detected as fallacious” (`en-US/ch002.md:75`) qualifica representações que induzem ao erro; “enganosas” preserva esse sentido, enquanto a oposição técnica entre enganador e mentiroso permanece em II, §16.
- Rejeitado: trocar “me gabava de ter escapado” em II, §15 por uma tradução mais literal de “I flattered myself that I had long since sailed away” (`en-US/ch002.md:31`). A complacência retrospectiva está presente; a forma reflexiva portuguesa não exige que ele tenha feito uma declaração pública. A preferência por “me iludia” seria uma escolha de redação, não correção demonstrável.
- Rejeitado: alterar o início de II, §33 (“What need is there any longer than that we should inquire concerning the science of disputation?”, `en-US/ch002.md:71`). “Que necessidade há ainda de investigarmos a ciência da discussão?” é sustentado pela explicação seguinte: a presença das figuras geométricas na alma já basta ao argumento, sem nova investigação da dialética. A construção inglesa irregular não exige inverter a pergunta.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__soliloquies/evidence/review-2.md`.

### Round 3

- Foco: leitura integral do pt-BR sem abrir os capítulos-fonte, seguida de verificação das suspeitas no en-US e varredura ortográfica e de pontuação; auditoria mecânica 1–6, metadados e diário. Veredito: CLEAN; nenhum defeito objetivo confirmado, nenhuma correção de capítulos, metadados ou termos.
- Rejeitado: inserir “em” em “na medida que o momento exige” (I, §15). “Que” é objeto de “exige”, não parte da locução proporcional “à medida que”; corresponde a “so far as the present time requires” (`en-US/ch001.md:29`).
- Rejeitado: considerar “adiado num miserável definhamento” (I, §22) uma frase sem sentido. “Put off with miserable pining” (`en-US/ch001.md:43`) apresenta o próprio interlocutor mantido à espera; a imagem é recuperável, embora incomum.
- Rejeitado: substituir “nossa saúde e nossa força” depois de “cada um” (I, §23). A fonte também combina “our soundness and strength” com “each one” (`en-US/ch001.md:45`); o plural inclui os interlocutores, sem erro de concordância.
- Rejeitado: feminizar “aquele que ardo por ver” ou alterar o imperativo “contém” (I, §26). “He whom I burn to see” refere-se a Deus, não obriga a retomar Sabedoria; “refrain from tears” dirige-se ao interlocutor tratado por tu (`en-US/ch001.md:51`), cujo imperativo afirmativo é “contém”.
- Rejeitado: impor “lembrar-me de” a “lembrar […] de” (II, §15). O sentido de “call to mind” está preservado (`en-US/ch002.md:31`); a regência sem pronome é documentada no português brasileiro, não um defeito inequívoco. Ver [Ciberdúvidas, com referência a Celso Luft](https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/o-verbo-lembrar-se-e-ou-nao-reflexo/30189).
- Rejeitado: inverter premissa e conclusão na retomada de II, §28. A construção aparentemente circular já está em “From this truth […] that Truth cannot perish, we have concluded” (`en-US/ch002.md:57`); não cabe corrigir o argumento da edição.
- Rejeitado: eliminar um “se” de “se se prova” (II, §32), alerta da busca de palavras repetidas. São conjunção condicional e pronome da passiva, correspondentes a “if […] is proved” (`en-US/ch002.md:69`).
- Rejeitado: exigir subjuntivo em “a não ser que esqueceste” (II, §33). Aqui a exceção é de conteúdo, equivalente a “exceto o fato de que”, como “except that you have forgotten” (`en-US/ch002.md:71`); não é condição hipotética.
- Rejeitado: tratar “Esses” (II, §34) como pronome sem referente. “Such therefore do not yet see the truth” (`en-US/ch002.md:73`) também generaliza as pessoas na situação de esquecimento parcial descrita pelo exemplo anterior.
- Rejeitado: substituir a condição “quando alguma coisa causar inquietação acerca da vida da alma” (II, §36). A fonte diz “when anything gives anxiety concerning the life of the soul” (`en-US/ch002.md:77`), não “depois de resolver a questão da vida da alma”.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__soliloquies/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas obrigatórias de gênero, antecedente e tratamento; leitura integral da fonte en-US e do pt-BR, auditoria mecânica 1–6, metadados e diário. Veredito: CLEAN; nenhum defeito objetivo confirmado, nenhuma alteração de capítulos, metadados, termos ou afirmações existentes do diário.
- Rejeitado: uniformizar “vossas necessidades comuns” para “tuas” em I, §18. “All your joint necessities” (`en-US/ch001.md:35`) inclui Agostinho e os amigos; o plural é do grupo, não uma troca do tratamento tu por Vós.
- Rejeitado: considerar “a ele” em I, §27 uma identificação acrescentada de Deus. “A certain radiance seizes me, inviting me to conduct you to it” (`en-US/ch001.md:53`) tem como antecedente o resplendor; o masculino português acompanha esse substantivo.
- Rejeitado: trocar “coopera com ela” por “coopera consigo” em II, §3. “The soul operates, or cooperates with the falsity” (`en-US/ch002.md:7`) toma a falsidade como complemento, não a própria alma.
- Rejeitado: considerar invertida a retomada “tender a estas” em II, §32. “Those embodied figures […] tend towards these” (`en-US/ch002.md:69`) retoma as figuras geométricas como padrão das corporificadas; o contraste explícito permite a mesma retomada em português, apesar do antecedente interveniente.
- Rejeitado: inverter “Esse esquecimento […] daquele; aquele […] fica no meio” em II, §34. “This oblivion therefore differs exceedingly from that, but that stands midway” (`en-US/ch002.md:73`) distingue o esquecimento total da infância do parcial anteriormente descrito; a distribuição dos demonstrativos está preservada.
- Rejeitado: inverter “quando esta é vista, aquela não é vista” em II, §35. “That, when this is seen, is not seen” (`en-US/ch002.md:75`) opõe Fantasia a Verdade; o contexto sustenta esta = Verdade e aquela = Fantasia, confirmando a decisão da rodada 1.
- Evidências: `.claude/codex-runs/runs/church-fathers__augustine__soliloquies/evidence/review-4.md`.
