# Diário de tradução — A Virgindade Perpétua da Bem-aventurada Maria (pt-BR)

Fonte: `en-US/ch001.md`, único texto canônico usado para a tradução.
Destino: `pt-BR/ch001.md`.
Data: 2026-10-02.

## Preparação e precedentes

Lidos integralmente o skill `translate-book`, o `CLAUDE.md` e as regras de livros. Não havia tradução pt-BR neste livro nem em outras obras de Jerônimo. Consultados capítulos, diários e metadados de `ambrose/repentance`, `athanasius/statement-of-faith` e `athanasius/incarnation-of-the-word`, incluindo a procedência em `sources`.

Adotadas as aspas curvas “ ”, os nomes bíblicos portugueses e os números de referências inalterados de *Sobre a Penitência* e *Sobre a Encarnação do Verbo*. O diário de *Declaração de Fé* conserva nomes bíblicos ingleses; essa convenção divergente não foi adotada. O autor recebe o nome “São Jerônimo”, seguindo o uso de “Santo Ambrósio” nos metadados; não se acrescentam datas ausentes da fonte.

## Termos principais

| Inglês | Português | Observações |
|---|---|---|
| Blessed Mary / Blessed Virgin | Bem-aventurada Maria / Bem-aventurada Virgem | Título e invocações |
| perpetual virginity | virgindade perpétua | |
| Helvidius | Helvídio | |
| Joseph / Mary | José / Maria | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| brethren | irmãos | Preservado também quando o argumento distingue irmãos de primos |
| first-born / only begotten | primogênito / unigênito | Distinção central; precedente “Unigênito” em Atanásio |
| betrothed / entrusted | prometida em casamento / confiada | Manter a oposição na discussão |
| know (conjugal) | conhecer | Preservar a palavra discutida pelo autor |
| till / until / unto | até / até que | Conforme a construção sintática |
| continency / chastity | continência / castidade | |
| marriage / wedlock | casamento / matrimônio | Conforme a construção |
| kindred / race / nature / love | parentesco / povo / natureza / amor | Quatro sentidos de “irmãos” |
| James / Joses | Tiago / Josés | “Josés” distingue a forma de “Joseph”, José |
| Cleophas / Clopas | Cléofas / Clopas | Preservadas as duas formas da introdução |
| the Apostle / Saviour | o Apóstolo / Salvador | Pronomes reverenciais em minúsculas |

## Decisões de tradução

- 2026-10-02: Execução integral nesta sessão, sem perguntas nem subagentes. Política padrão: excluir notas editoriais de rodapé; a fonte não contém notas de rodapé. A introdução editorial, o resumo e o subtítulo são texto corrido da fonte e serão integralmente traduzidos, com os mesmos parágrafos.
- 2026-10-02: As citações bíblicas serão traduzidas diretamente das palavras inglesas, sem consulta ou substituição por outra Bíblia. Nomes dos livros localizados; números, ordem e posição das referências preservados, inclusive aparentes erros da edição.
- 2026-10-02: Tratamento de Helvídio por “tu”; plural por “vós” quando cabível. Mantido o tom polêmico e retórico, sem abrandamentos nem acréscimos doutrinais.
- 2026-10-02: Numeração autoral em negrito inerte (`**1.**` etc.), conforme `.claude/rules/books.md`, conservando cada número e cada quebra de parágrafo. A numeração da sinopse editorial também ficará inerte para evitar renumeração automática. A fonte inglesa permanecerá inalterada.
- 2026-10-02: O build do corpus não será executado por instrução expressa do usuário. Validação local de estrutura, referências e JSON ao concluir. Nenhum comando de alteração de estado do Git será usado.

## Expressões e particularidades

As escolhas consolidadas estão registradas abaixo, em “Expressões e particularidades — registro final”.

## Alterações na fonte

Nenhuma.

## Registro da tradução integral

- 2026-10-02: Traduzidos sequencialmente o título, o subtítulo, todos os parágrafos introdutórios e as seções 1–24. A seção 22 conserva seus dois parágrafos; nenhum parágrafo foi dividido ou fundido.
- Preservadas as particularidades do texto canônico: “dez meses” na seção 2 e “nove meses” na seção 20; a formulação sobre os ídolos “perdidos” até o presente na seção 7; a frase aparentemente invertida “primogênito, e não apenas unigênito” na seção 12; “sobrinho [...] chamado filho” na seção 16, embora o contexto discuta “irmão”; Aram como pai de Ló; Judas como zelota na seção 15. Não se usou outra edição para harmonizar o texto.
- A sinopse editorial conserva seus números de capítulos, mesmo quando não correspondem à numeração do corpo. Preservadas todas as referências da edição, inclusive Lucas 1:18 na seção 18, Gênesis 20:11 e Levítico 18:9 na seção 17. Também se mantêm a citação composta atribuída a Paulo na seção 13 e as duplicações “no Gênesis, Gênesis…” e “de Jeremias, Jeremias…”.
- “Cleophas or Clopas” → “Cléofas ou Clopas”; “Joses” → “Josés”, sem fundi-lo com a forma “Joseph” → “José”. “Almah”, “Bethulah”, “Sanior” e “Sanir” conservam as formas da fonte; não houve consulta a outra fonte canônica.
- Nomes recorrentes adicionais: Tertuliano, Vitorino, Dâmaso, Inácio, Policarpo, Irineu, Justino Mártir, Teódoto de Bizâncio, Valentim; Aarão, Isaac, Rebeca, Jacó, Labão, Raquel, Salfaad, Batuel, Alfeu, Zebedeu, Natanael. Mantém-se “São” onde o texto traz “S.”; não se acrescentam títulos aos nomes da lista da seção 19.
- `book.json`: acrescentados `pt-BR` em `languages`, título em `name` e no sumário, e autor “São Jerônimo”. A descrição bibliográfica em `sources` permanece como estava.

## Expressões e particularidades — registro final

- “worth two-pence” → “valesse dois vinténs”: equivalente idiomático do desprezo pelo valor da teoria, sem converter uma quantia histórica.
- “on the horns of a dilemma” → “entre as duas pontas de um dilema”, preservando a imagem.
- “a team of four brethren” → “uma quadriga de irmãos”: preserva a imagem de uma atrelagem de quatro animais, sem o contrassenso de chamar quatro de uma “parelha”.
- “the rocks and shoals”, “spread sail”, “fountain” e “streams” conservam as imagens náuticas e aquáticas.
- *paternitas* e o grego πατρία permanecem no trecho etimológico. *rara avis* permanece em latim, seguida da glosa portuguesa “ave rara”. Não se acrescentaram notas de rodapé.
- “change of life” → “menopausa”; “debt of marriage” → “débito conjugal”; “huckstering” → “comércio miúdo”. Mantida a crítica ascética do autor sem introduzir um juízo adicional do tradutor.
- Revisão corrigiu a primeira formulação de “team of four”, especificou “divã” e “taças” na descrição da casa, e tornou explícito o sentido fisiológico de “change of life”. As alterações foram feitas somente no português.

## Verificação final — 2026-10-02

- Fonte e destino: 35 blocos separados por linha em branco em cada arquivo; 1 título Markdown e 34 parágrafos não classificados como título (incluindo o subtítulo em negrito e os itens da introdução).
- Os 3 itens numerados da sinopse e as 24 seções do tratado têm correspondência exata, na mesma ordem. A seção 22 mantém o segundo parágrafo sem número.
- Conferidas as 55 referências bíblicas explícitas em formato capítulo:versículo: mesmos livros, números, intervalos e sequência, com os nomes traduzidos. A referência romana da introdução, Mt. i. 18-25, também foi preservada.
- Conferidos os itálicos e as aspas por bloco. Na seção 13, fecham-se e reabrem-se as aspas ao redor do comentário explicativo do autor sobre a cruz; nenhuma palavra da citação é omitida.
- Revisão bilíngue de integridade e sentido: todos os parágrafos traduzidos, sem resumo nem trecho inglês residual; os termos gregos, hebraicos e latinos intencionalmente conservados estão registrados acima. Acentuação portuguesa em Unicode NFC validada; a grafia grega πατρία conserva os caracteres da fonte, inclusive a variante de acento que não está em NFC.
- `book.json` lido com sucesso pelo parser JSON; campos localizados e arquivo correspondente ao único item do sumário verificados.
- Arquivo inglês idêntico byte a byte à versão em HEAD, conferido por SHA-256. Nenhuma correção de OCR na fonte.
- Nenhum build e nenhum comando de alteração de estado do Git executado. Arquivos escritos apenas dentro do diretório deste livro.

## Review log

### Round 1

- Data: 2026-10-02. Revisão independente, integral e sem subagentes.
- Foco: completude parágrafo por parágrafo, incluindo citações, incisos, termos latinos/gregos, referências e contagem de frases; estrutura e metadados.
- Resultado: **nenhum defeito objetivo confirmado**; nenhuma correção.
- Evidência detalhada e referências às notas da rodada: [diário anterior à condensação](../../../../../../.claude/codex-runs/runs/church-fathers__jerome__perpetual-virginity-of-blessed-mary/evidence/journal-before-tidy.md#round-1).

#### Defeitos corrigidos

Nenhum.

#### Achados considerados e rejeitados

- Fonte, linha 23 (§2), “He abode for ten months” → “habitou durante dez meses”; linha 59 (§20), “the womb for nine months growing larger” → “o ventre crescendo durante nove meses”. Não harmonizar dez com nove: a diferença já está na fonte e foi corretamente documentada.
- Fonte, linha 33 (§7), “and lost them until this day” → “e os perdeu até este dia”. A formulação incomum é canônica para esta revisão; não substituir por uma versão bíblica lembrada.
- Fonte, linha 43 (§12), “the first-born but not merely the only begotten” → “primogênito, e não apenas unigênito”. A aparente inversão lógica não nasceu na tradução. Também “the firstling of an ox” → “o primogênito de uma vaca” designa a cria bovina pela mãe, sem alterar a classe de animais discutida; “the money of five shekels” → “cinco siclos de prata” é a expressão monetária contextual, não uma mudança de quantidade. Não se confirmou erro que exigisse literalizar esses sintagmas.
- Fonte, linha 45 (§13), “And I went up by revelation, but other of the apostles saw I none, save Peter and James the Lord's brother” → “E subi por revelação, mas não vi nenhum outro dos apóstolos, a não ser Pedro e Tiago, o irmão do Senhor”. Não harmonizar a citação composta com outra edição. Na mesma linha, “(doubtless at the Lord's cross)” → “sem dúvida junto à cruz do Senhor” permanece como inciso entre dois segmentos citados; as aspas adicionais não acrescentam texto nem dividem parágrafo.
- Fonte, linha 49 (§15), “Judas the zealot [...] Thaddaeus” → “Judas, o zelota [...] Tadeu”. Preservar a identificação da fonte. “Mary of Clopas,” “whether after her father, or kindred, or for some other reason” → “Maria de Clopas”, “quer por causa de seu pai, quer por seu parentesco, quer por alguma outra razão”: a tradução conserva a abertura quanto ao motivo do nome, sem resolver a genealogia por conta própria.
- Fonte, linha 51 (§16), “if she (the latter)” → “se esta última”: o antecedente especificado na fonte é preservado. “a nephew can be called a son” → “um sobrinho possa ser chamado filho”; “Aram begot Lot” → “Aram gerou Ló”. Não trocar filho por irmão nem Aram por outra grafia; seriam alterações das afirmações canônicas. “Laban said unto Jacob. Because you are my brother” → “Labão disse a Jacó: Por seres meu irmão”: o ponto convertido em dois-pontos altera a contagem bruta de frases, não o conteúdo.
- Fonte, linha 53 (§17), “Genesis 20:11” → “Gênesis 20:11” e “Leviticus 18:9” → “Levítico 18:9”; linha 55 (§18), “Luke 1:18” → “Lucas 1:18”. São os números efetivamente presentes na fonte. Não corrigir referências por conhecimento de outra Bíblia.
- Fonte, linha 55 (§18), “a team of four brethren” → “uma quadriga de irmãos”. Não falta o número quatro: está contido em quadriga. “all” → “todas” concorda com “irmãs”, antecedente explícito de “sisters”; não restringe indevidamente um referente aberto.
- Fonte, linha 65 (§22, segundo parágrafo), “a *rara avis* indeed” → “de fato uma *rara avis* (ave rara)”. A glosa lexical é permitida pela diretriz de conservar o latim com tradução e foi declarada no diário; não é acréscimo ao argumento. “having passed the change of life” → “tendo passado pela menopausa” exprime o sentido contextual, confirmado por “has ceased to perform the functions of a woman” → “deixou de exercer as funções de mulher”.
- Formatação das citações: por exemplo, fonte, linha 25 (§3), “His first statement was: ‘Matthew says’” (aspas internas aqui apenas para delimitar o excerto) → “Sua primeira afirmação foi: ‘Mateus diz’”. Os discursos e citações permanecem dentro dos parágrafos argumentativos, como na fonte. Não criar blocos `>` separados: isso dividiria os parágrafos cuja preservação foi expressamente exigida. Os itálicos de *paternitas* (linha 51) e *rara avis* (linha 65) já estão corretos.

### Round 2

- Data: 2026-10-02. Revisão independente, integral e sem subagentes.
- Foco: leitura bilíngue oração por oração da introdução, sinopse e §§1–24; sujeitos, objetos, negações, tempos/modos, qualificadores, citações e termos discutidos pelo autor; estrutura, metadados e glossário.
- Resultado: **nenhum defeito objetivo confirmado**; nenhuma correção.
- Evidência detalhada e referências às notas da rodada: [diário anterior à condensação](../../../../../../.claude/codex-runs/runs/church-fathers__jerome__perpetual-virginity-of-blessed-mary/evidence/journal-before-tidy.md#round-2).

#### Defeitos corrigidos

Nenhum.

#### Achados considerados e rejeitados

- Introdução, fonte linha 5: “either children of Joseph by a former marriage, or first cousins” / pt-BR “ou filhos de José de um casamento anterior, ou primos em primeiro grau”. A alternativa parece conflitar com a conclusão do §21, mas a sinopse inglesa efetivamente a afirma. Não cabe harmonizar o editor com o tratado.
- §4, fonte linha 27: “before he repented, was cut off by death” / “antes de se arrepender, foi arrebatado pela morte”; “sometimes refers only to order in thought” / “às vezes se refere apenas à ordem do pensamento”. A tradução não transforma o arrependimento hipotético em acontecimento posterior obrigatório. A distinção lógica que sustenta a refutação permanece.
- §6, fonte linha 31: “Even to old age I am he” / “Até a velhice eu sou o mesmo”; “I am with you always, even unto the end of the world” / “estou convosco todos os dias, até o fim do mundo”. Considerada a possibilidade de aproximação indevida de uma fórmula bíblica conhecida. Rejeitada: “o mesmo” exprime a identidade continuada em discussão; “todos os dias” conserva a continuidade de “always” no período expresso. Não há conteúdo ou qualificativo suprimido que exija mudança.
- §10, fonte linha 39: “so that the Evangelist may not be convicted of falsehood” / “para que o Evangelista não seja convencido de falsidade”. “Convencido de” admite o sentido de demonstrado culpado, embora menos usual hoje; não se trata necessariamente de persuadir o Evangelista a crer numa falsidade. A troca por outra expressão seria estilística.
- §12, fonte linha 43: “the first-born but not merely the only begotten” / “primogênito, e não apenas unigênito”; “the firstling of an ox” / “o primogênito de uma vaca”; “the money of five shekels” / “cinco siclos de prata”. Reexaminadas as rejeições anteriores: a aparente inversão pertence ao inglês; a cria bovina é expressa pela mãe no contexto de abrir o ventre; prata é a leitura monetária contextual já documentada. Não se confirmou mudança objetiva de argumento, espécie ou valor que justifique reabrir os achados.
- §15, fonte linha 49: “the latter had already been slain by Herod” / “este já havia sido morto por Herodes”; “whether after her father, or kindred, or for some other reason” / “quer por causa de seu pai, quer por seu parentesco, quer por alguma outra razão”. “Este” retoma o filho de Zebedeu mencionado imediatamente antes; a segunda passagem mantém em aberto a origem do nome de Maria de Clopas. Não resolver a genealogia por inferência externa.
- §16, fonte linha 51: “Possibly the case might be” / “Poderia ser”; “if she (the latter) had been the Lord's mother” / “se esta última fosse a mãe do Senhor”. Modalidade hipotética e antecedente feminino preservados; o português não afirma categoricamente a existência de uma segunda Maria. Mantidas também as rejeições da rodada 1 sobre “a nephew can be called a son” / “um sobrinho possa ser chamado filho” e “Aram begot Lot” / “Aram gerou Ló”.
- §18, fonte linha 55: “a team of four brethren” / “uma quadriga de irmãos”; “And his sisters, are they not all with us?” / “E suas irmãs, não estão todas entre nós?”. Quadriga conserva quatro; o gênero feminino de todas é imposto por irmãs. Não há número omitido nem restrição indevida do referente.
- §21, fonte linha 61: “But as we do not deny what is written, so we do reject what is not written” / “Mas, assim como não negamos o que está escrito, rejeitamos o que não está escrito”. A construção enfática inglesa não introduz outra negação; a polaridade portuguesa está correta.
- §22, fonte linha 65: “which is a *rara avis* indeed” / “o que é de fato uma *rara avis* (ave rara)”; “having passed the change of life” / “tendo passado pela menopausa”. Reconfirmadas as rejeições anteriores: glosa lexical autorizada pela diretriz sobre latim e sentido fisiológico explicitado pelo contexto, sem adição de argumento.
- §23, fonte linha 67: “though for anything I know she may be a virgin in body” / “embora, pelo que sei, possa ser virgem no corpo”. Considerada possível mudança de grau de certeza. O subjuntivo “possa” conserva a possibilidade, sem afirmar conhecimento de virgindade corporal; não há erro objetivo a corrigir.
- Referências e particularidades já rejeitadas na rodada 1 foram reconferidas nos pares integrais: fonte linha 23 “ten months” / “dez meses” versus linha 59 “nine months” / “nove meses”; linha 33 “lost them until this day” / “os perdeu até este dia”; linha 45 “save Peter and James the Lord's brother” / “a não ser Pedro e Tiago, o irmão do Senhor”; linha 49 “Judas the zealot” / “Judas, o zelota”; linha 53 “Genesis 20:11” / “Gênesis 20:11” e “Leviticus 18:9” / “Levítico 18:9”; linha 55 “Luke 1:18” / “Lucas 1:18”. A fonte canônica sustenta todas essas formas; não substituir por outra Bíblia ou reconstrução histórica.

### Round 3

- Data: 2026-10-02. Revisão independente, integral e sem subagentes.
- Foco: leitura fria do português quanto a gramática, concordância, regência, antecedentes e inteligibilidade, seguida de conferência contra a fonte e revisão ortográfica e tipográfica; estrutura e metadados.
- Resultado: **1 defeito confirmado e corrigido**, no §16. As conclusões CLEAN anteriores são registros históricos das respectivas revisões; esta rodada registra o defeito que elas não detectaram.
- Evidência detalhada e referências às notas da rodada: [diário anterior à condensação](../../../../../../.claude/codex-runs/runs/church-fathers__jerome__perpetual-virginity-of-blessed-mary/evidence/journal-before-tidy.md#round-3).

#### Defeitos corrigidos

1. **§16, `pt-BR/ch001.md`, linha 51 — construção distributiva quebrada.** Antes: “e separaram-se um de seu irmão.” → depois: “e cada um se separou de seu irmão.” Fonte, `en-US/ch001.md`, linha 51: “and they separated each from his brother.” O “um” isolado não exprime o distributivo “each” e deixa incompleta a construção com o verbo plural. “Cada um” fornece o sujeito distributivo, com verbo singular. A correção conserva “seu irmão”, necessário à prova lexical de Jerônimo; não se adotou “um do outro”, que apagaria essa palavra da citação. Verificados tanto o diagnóstico como a redação final contra a oração inglesa completa. Trata-se de um único defeito sintático, não de alteração do glossário.

#### Achados considerados e rejeitados

- Sinopse, linha 19: pt-BR “não só Maria, mas também José, permaneceu no estado virginal” / fonte “not only Mary but Joseph also remained in the virgin state”. O singular pode concordar com o núcleo mais próximo na construção correlativa; ambos continuam incluídos. Não impor plural por preferência editorial.
- §4, linha 27: “se interveio uma causa suficiente para impedi-lo” / “if sufficient cause intervened to prevent it”. “Lo” retoma a realização do que se pensou, expressa na oração anterior; não precisa concordar com o substantivo plural “pensamentos”. Nenhum antecedente irrecuperável.
- §7, linha 33: “e os perdeu até este dia” / “and lost them until this day”. A estranheza já está no inglês; a redação preserva o sentido da fonte, como documentado anteriormente.
- §10, linha 39: “para que o Evangelista não seja convencido de falsidade” / “so that the Evangelist may not be convicted of falsehood”. “Convencido de” comporta o sentido de demonstrado culpado; o contexto exclui a leitura de simples persuasão. Mantida a rejeição da rodada 2; trocar a expressão seria uma modernização estilística.
- §12, linha 43: “que ele se revele primogênito, e não apenas unigênito” / “it should prove to be the first-born but not merely the only begotten”. A aparente inversão lógica pertence à fonte, não à tradução. Não inverter os termos.
- §15, linha 49: “este já havia sido morto por Herodes” / “the latter had already been slain by Herod”. “Este” retoma o filho de Zebedeu mencionado imediatamente antes; não há referente insolúvel.
- §16, linha 51: “se esta última fosse a mãe do Senhor” / “if she (the latter) had been the Lord's mother”. “Esta última” é a segunda Maria da hipótese anterior, conforme o esclarecimento explícito do inglês. Na mesma linha: “um sobrinho possa ser chamado filho” / “a nephew can be called a son”. A aparente incoerência filho/irmão está na fonte e não autoriza corrigir o autor.
- §16, linha 51: “Põe-no aqui diante de meus irmãos” / “Set it here before my brethren”. “Põe-no” é a forma correta do imperativo “põe” com o pronome “o” após terminação nasal; não é erro de hífen nem deve virar “põe-o”.
- §17, linha 53: “quem eram mais verdadeiramente seus irmãos do que os apóstolos” / “who were more truly His brethren than the apostles”. A concordância plural com o predicativo “irmãos” na interrogativa com “ser” é defensável; não impor “era”.
- §22, linha 65: “O parasita é desprezado e sente orgulho da honra” / “The parasite is snubbed and feels proud of the honour”. A contradição aparente é a ironia do original, não uma frase sem sentido introduzida pela tradução. “desagradar-se delas e provocar seu marido” / “be displeased, and provoke her husband”: a forma pronominal exprime descontentamento com as apresentações, em oposição a “deleitar-se”; não é inversão do objeto de agradar.
- §23, linha 67: “apenas persuade ao que é conveniente” / “he only persuades to that which is proper”. O destinatário humano é recuperável de “ninguém” e “todos os homens”; a construção com “a” exprime indução à conduta conveniente. A explicitação do destinatário seria estilística. “É apenas um acréscimo à regra geral” / “It is only one addition to the general rule”: formulação difícil, mas presente na fonte; não reescrever a tese ascética para torná-la mais familiar.
- Grafias e crase verificadas, sem correção: §13, linha 45, “Judeia” / “Judæa”; §20, linha 59, “os enjoos” / “the sickness”; §22, linha 65, “seminuas” / “half-naked”; §12, linha 43, “à meia-noite” / “at midnight”; §4, linha 27, “ir à Espanha” / “went to Spain”, e §15, linha 49, “subi a Jerusalém” / “went up to Jerusalem”. As formas portuguesas respeitam a ortografia vigente e a presença ou ausência de artigo nos topônimos; não criar acentos ou hífens.

### Round 4

- Data: 2026-10-02. Revisão independente, integral e sem subagentes.
- Foco: preposições, artigos, demonstrativos, conjunções e adversativas, possessivos e antecedentes, reflexivos versus companhia, títulos e rótulos; escolhas obrigatórias de gênero e de tratamento, com rastreamento de cada mudança de interlocutor nas citações e apóstrofes.
- Resultado: **nenhum defeito objetivo confirmado**; nenhuma correção.
- Evidência detalhada e referências às notas da rodada: [diário anterior à condensação](../../../../../../.claude/codex-runs/runs/church-fathers__jerome__perpetual-virginity-of-blessed-mary/evidence/journal-before-tidy.md#round-4).

#### Defeitos corrigidos

Nenhum.

#### Achados considerados e rejeitados

- **§4, linha 27 — plural e singular coletivo na mesma lei.** Fonte: “then you shall bring them both out unto the gate of that city, and you shall stone them with stones that they die” e “so you shall put away the evil from the midst of you”. Pt-BR: “então levareis ambos à porta daquela cidade e os apedrejareis até que morram” e “assim extirparás o mal do meio de ti”. Foi considerada a uniformização para “extirpareis [...] de vós”. Rejeitada como correção objetiva: o inglês you não fixa número; a comunidade de Israel pode ser interpelada em seus membros no ato executório e como unidade coletiva na conclusão. O destinatário permanece o mesmo. A justificativa já constava expressamente nas notas da rodada 1; a rodada 4 a reexaminou contra a oração inteira. Uniformizar seria decisão editorial, não reparação de sentido demonstravelmente errado.
- **§3, linha 25 — possessivo no nascimento.** Fonte: “took unto him his wife; and knew her not till she had brought forth her son”. Pt-BR: “recebeu sua mulher; e não a conheceu até que ela deu à luz seu filho”. Considerada ambiguidade de “seu filho” como atribuição de paternidade biológica a José. Rejeitada: a oração explícita “ela deu à luz” fornece Maria como possuidora, enquanto “sua mulher” pertence ao sujeito José na oração anterior. O português não afirma uma relação biológica adicional. §4, linha 27, “the child conceived was not his” / “o filho concebido não era seu” torna expressa a distinção.
- **§7, linha 33 — demonstrativo e sujeito do enterro.** Fonte: “until this day”, “since that day” e “he buried him”. Pt-BR: “até este dia”, “desde aquele dia” e “ele o sepultou”. Este mantém o presente da narrativa citada; aquele é o momento passado visto por Jerônimo. O sujeito de “ele o sepultou” continua sem nome, como no inglês, e o objeto é Moisés. Não substituir por um sujeito nominal deduzido de outra Bíblia.
- **§8, linha 35 — companhia, não reflexivo.** Fonte: “the heavenly host had joined with him in the chorus”. Pt-BR: “a multidão celeste se unira a ele no coro”. “Ele” retoma o anjo que anuncia a notícia, não José. A proximidade do anjo e a função do coro sustentam a referência; trocar por “consigo” faria a multidão unir-se a si mesma. Do mesmo modo, §22, linha 63, “we are made one spirit with Him” / “tornamo-nos um só espírito com ele” mantém o Senhor distinto de nós.
- **§§15–16, linhas 49–51 — demonstrativos e genealogia.** Fonte: “the latter had already been slain by Herod” / pt-BR “este já havia sido morto por Herodes”; fonte: “if she (the latter) had been the Lord's mother” / pt-BR “se esta última fosse a mãe do Senhor”. O primeiro retoma o filho de Zebedeu imediatamente mencionado; o segundo retoma a segunda Maria da hipótese, como especifica latter. Fonte, linha 49: “whether after her father, or kindred, or for some other reason” / “quer por causa de seu pai, quer por seu parentesco, quer por alguma outra razão” conserva a origem do nome em aberto. Não fixar pai, marido ou genealogia que a fonte não escolheu.
- **§16, linha 51 — gênero genérico na lei e objeto indeterminado.** Fonte: “an Hebrew man, or an Hebrew woman [...] you shall let him go free” / pt-BR “um homem hebreu ou uma mulher hebreia [...] o deixarás sair livre”. O masculino retoma “irmão” como classe e não exclui a mulher expressamente incluída. Fonte: “your brother's ox or his sheep [...] you shall bring it home” / pt-BR “o boi ou a ovelha de teu irmão [...] o recolherás à tua casa”. O pronome retoma o animal indeterminado, não escolhe o boi em detrimento da ovelha. Fonte: “what have you found of all your household stuff? Set it here” / “que encontraste de todos os objetos de tua casa? Põe-no aqui”. “No” retoma aquilo que se teria encontrado, não exige plural por “objetos”. Não há mudança objetiva de referente.
- **§§13 e 18, linhas 45 e 55 — all e them.** Fonte: “his sisters, are they not all with us?” / pt-BR “suas irmãs, não estão todas entre nós?”. Todas é imposto por sisters. Fonte, linha 45: “the other women with them” / “as outras mulheres que estavam com elas”. Elas retoma o conjunto feminino nomeado na mesma citação, sem excluir um grupo masculino mencionado ali. Não alterar o gênero com base na abertura morfológica de all/them isolados.
- **§20, linha 59 — sexo versus gênero gramatical.** Fonte: “Are virgins better” / pt-BR “São as virgens melhores”; fonte: “so that he may be proved to be unclean” / pt-BR “para que se demonstre que ele era impuro”. Virgens femininas é escolha contextual no argumento sobre Maria e o parto; não nega o uso masculino de virgin no §21. “Ele” é Jesus, conforme he na fonte e a circuncisão, embora a tradução use antes o substantivo feminino “criança”. Não mudar para ela nem atribuir a impureza a Maria.
- **§22, linha 65 — vítimas seminuas.** Fonte: “the half-naked victims of the passions” e “take pleasure in them”. Pt-BR: “as vítimas seminuas das paixões” e “deleitar-se nelas”. O feminino concorda com o substantivo de gênero fixo vítimas; não afirma que todas as pessoas sejam mulheres. Substituir por masculino criaria erro de concordância, não maior fidelidade.
- **§§17, 22 e 23, linhas 53, 63 e 67 — mudança de tratamento entre níveis de discurso.** Fonte: “Tell these who hate you” / pt-BR “Dizei aos que vos odeiam”; fonte: “Why do you cavil?” / “Por que levantas objeções capciosas?”; fonte: “I want you to be what the angels are” / “quero que sejais o que os anjos são”. Vós se dirige aos ouvintes do profeta ou aos homens da hipótese paulina; tu, ao adversário no comentário de Jerônimo. Não uniformizar destinatários distintos. Em João 20:17, linha 53, “Go unto my brethren and say to them” / “Vai a meus irmãos e dize-lhes”, o excerto não nomeia o emissário; a tradução também não lhe impõe sexo.
- **Particularidades anteriores, reconferidas sem novo achado:** linha 23 “ten months” / “dez meses” e linha 59 “nine months” / “nove meses”; linha 43 “the first-born but not merely the only begotten” / “primogênito, e não apenas unigênito”, “the firstling of an ox” / “o primogênito de uma vaca” e “the money of five shekels” / “cinco siclos de prata”; linha 51 “a nephew can be called a son” / “um sobrinho possa ser chamado filho”; linha 65 “a *rara avis* indeed” / “de fato uma *rara avis* (ave rara)”. Mantidas as razões registradas nas rodadas anteriores: variantes canônicas não harmonizadas, cria bovina designada pela mãe, leitura monetária contextual e glosa lexical permitida. Nenhum desses trechos oferece novo defeito de palavra funcional, gênero ou antecedente nesta rodada.

### Round 5

- Data: 2026-10-02. Revisão independente, integral e sem subagentes.
- Foco: termos, afirmações do diário e nomes; frequências bidirecionais por parágrafo de todas as linhas dos Termos principais, flexões, sinônimos, desvios de contagem e formas citadas; nomes de pessoas, lugares, povos, livros e títulos comparados ao original e aos precedentes pt-BR locais.
- Resultado: **nenhum defeito objetivo confirmado**; nenhuma correção.
- Evidência detalhada e referências às notas da rodada: [diário anterior à condensação](../../../../../../.claude/codex-runs/runs/church-fathers__jerome__perpetual-virginity-of-blessed-mary/evidence/journal-before-tidy.md#round-5).

#### Defeitos corrigidos

Nenhum.

#### Achados considerados e rejeitados

- **Frequência reversa de irmãos, §§11–13 e 16, linhas 41–45 e 51, além da sinopse, linha 17.** Fonte: “brothers and sisters” / pt-BR “irmãos e irmãs”; §12, linha 43, “younger brothers” / “irmãos mais novos”. Há 58 ocorrências de brethren e outras 11 de brothers que completam as 69 de irmãos. O sinônimo inglês não é conteúdo adicional no português nem uso indevido de termo técnico. A tabela brethren/irmãos não proíbe traduzir brothers pelo mesmo substantivo.
- **Frequência reversa de primogênito, §12, linha 43.** Fonte: “the first born of man”, “the firstling of unclean beasts”, “the firstlings” / pt-BR “o primogênito do homem”, “o primogênito dos animais impuros”, “os primogênitos”. Aos 22 first-born desse parágrafo somam-se um first born e seis firstling(s), perfazendo 29 primogênito(s), 33 no capítulo. Não há confusão com “only begotten” / “unigênito”, cujas 11 ocorrências correspondem. Mantida também a inversão aparente da própria fonte: “the first-born but not merely the only begotten” / “primogênito, e não apenas unigênito”.
- **Prometida e locuções matrimoniais, §§3–4, 11, 22 e 24.** Fonte, linha 27: “his betrothed”, “has betrothed a wife” / pt-BR “sua prometida”, “prometeu casar-se com uma mulher”. As 17 ocorrências de betrothed correspondem, com elipse ou flexão contextual. Fonte, linha 65: “debt of marriage” / “débito conjugal”; linha 69: “marriage state” / “estado matrimonial”. O glossário já permite adequação à construção; não substituir locuções corretas por correspondências mecânicas. Introdução, linha 5: “matrimony” / “matrimônio” também explica frequência reversa, sem troca de conceito.
- **Parentesco, povo e amor, §§8, 16–17 e 19.** Fonte, linha 57: “in point of kinship” / pt-BR “por parentesco”; linha 35: “all people” / “todo o povo”; linha 51: “for my brethren's sake” / “por amor de meus irmãos”. As ocorrências reversas adicionais têm origem explícita, respectivamente kinship, people e sake. Fonte, linha 53: “by affection” / “por afeto” retoma a quarta classe com outro substantivo já usado pelo inglês. Não há genealogia acrescentada, quinto sentido de irmãos ou contradição da tabela.
- **Conhecer e até fora dos sentidos técnicos.** Fonte, linha 27: “I know not a man” / pt-BR “não conheço homem”, mas “his parents knew not of it” / “seus pais não o souberam”; linha 51: “if you know him not” / “se não o conheceres”. A tabela fixa o conhecer conjugal, não todos os sentidos de know. Fonte, linha 31: “even unto the end of the world” / “até o fim do mundo”, mas linha 51: “unto your brother” / “a teu irmão”. Unto direcional não é até temporal. Fonte, linha 67: “even adulteresses” / “até adúlteras” usa até inclusivo. Todos esses usos têm suporte na fonte e não alteram o argumento sobre a virgindade.
- **Nomes próximos que não devem ser fundidos.** Fonte, linha 17: “Cleophas or Clopas” / pt-BR “Cléofas ou Clopas”; linha 45: “James, and Joseph” / “Tiago, José”, mas “James and Joses” / “Tiago e de Josés”. Distinções da edição e do diário preservadas. Fonte, linha 51: “Aram begot Lot” / “Aram gerou Ló”, mas “departed out of Haran” / “saiu de Harã”. Não substituir o nome pessoal Aram pelo topônimo Harã nem harmonizar a genealogia com outra edição.
- **Grafias raras.** Fonte, linha 51: “Bethuel” / pt-BR “Batuel”; linha 53: “Zelophehad” / “Salfaad”; linha 55: “Craterius” / “Cratério”; linha 57: “Petavium” / “Petávio” e “Ebion” / “Ebion”; linha 49: “Itabyrium” / “Itabírio”. As verificações de uso português estão vinculadas nas notas; não se confirmou nome errado. “Sanior” / “Sanior” e “Sanir” / “Sanir”, linha 49, são formas deliberadamente preservadas da fonte, não erros de acentuação a corrigir por lembrança de outra Bíblia.
- **Títulos e nome clássico.** Fonte, linha 5: “Early Days of Christianity” / pt-BR “Os Primeiros Dias do Cristianismo”; linha 31: “fourth Song of Ascents” / “quarto Cântico das Subidas”; linha 55: “temple of Diana” / “templo de Diana”. A tradução do título de Farrar não afirma que exista edição brasileira com esse nome; Cântico das Subidas é denominação fiel; Diana é o nome da própria edição, não deve ser convertido em Ártemis por reconstrução histórica.
- **Zeros no grep do diário.** Fonte, linha 51: “and they separated each from his brother” / pt-BR atual “e cada um se separou de seu irmão”. A forma antiga citada no antes da rodada 3 é histórico da correção, não afirmação falsa de texto atual. Fonte, linha 33: “lost them” / pt-BR “os perdeu”: a menção resumida a ídolos “perdidos” não promete identidade literal de flexão. Fonte, linha 51: “a nephew can be called a son” / “um sobrinho possa ser chamado filho”: a forma abreviada “sobrinho [...] chamado filho” é sustentada pelo trecho completo. Propostas expressamente rejeitadas, como “parelha”, “põe-o”, “um do outro” e “extirpareis [...] de vós”, não têm de estar no capítulo. Os demais excertos com reticências, aspas explicativas e formas dos metadados foram verificados nos respectivos locais; resultados detalhados nas notas.
- **Rejeições históricas reconferidas.** Fonte, linha 23: “ten months” / pt-BR “dez meses”; linha 59: “nine months” / “nove meses”; linha 49: “Judas the zealot” / “Judas, o zelota”; linha 53: “Genesis 20:11” / “Gênesis 20:11” e “Leviticus 18:9” / “Levítico 18:9”; linha 55: “Luke 1:18” / “Lucas 1:18”. Nenhuma nova evidência permite tratar particularidades da edição como defeitos da tradução. Relatos de ações de sessões anteriores não são demonstráveis pelos capítulos; não se presume falsidade nem correção a partir deles.
