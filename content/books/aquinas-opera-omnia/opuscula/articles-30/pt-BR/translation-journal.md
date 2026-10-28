# Translation Journal — Carta a Bassiano de Lodi sobre os 30 Artigos (pt-BR)

Source: la (texto latino Leonina / Marietti, via aquinas.cc — canônico; não há en-US neste livro)
Target: pt-BR

## Key Terms

Herdados de *Carta a Bassiano de Lodi sobre os 36 Artigos* (`articles-36/`), que responde em grande parte às mesmas questões; as respostas paralelas seguem a redação daquela tradução sempre que o latim coincide.

| Latim | Português | Notas |
|-------|-----------|-------|
| Item, an… | Igualmente, se… | enunciados como interrogativas indiretas, regidas por "respondesse… a saber:" |
| Ad primum / Ad 2 … dico | Ao primeiro / Ao segundo… digo | ordinais por extenso (undécimo, duodécimo, décimo terceiro…), como em `articles-36` |
| Angelus / Daemones | anjo / demônios | minúsculas, como nas obras irmãs |
| Infernus | inferno | minúscula |
| virtus | virtude | potência operativa |
| ordo virtutum | ordem das Virtudes | maiúscula para o coro angélico; *virtutes caelorum* → "virtudes dos céus" |
| potestas | poder; potestade (*potestas angelica*) | |
| imperium | império | |
| ratio | razão | "a mesma razão", "a razão do órgão" |
| corpora mixta / elementata | corpos mistos / compostos de elementos | |
| factores | fazedores | |
| infinita inferius / ex parte post | infinita inferiormente / da parte do futuro | |
| calumniam habere | dar lugar a censura; "que censura isto possa receber" (art. 28) | |
| ministerio / auctoritate | por ministério / com (por) autoridade | |
| ex traduce | por propagação (*ex traduce*) | |
| dos corporis gloriosi | dote do corpo glorioso | |
| Commentator / Glossa | o Comentador / a Glosa | |
| Augustinus / Dionysius / Origenes / Damascenus | Agostinho / Dionísio / Orígenes / Damasceno | |
| faber / malleus, martellus | ferreiro / martelo | |
| karitas vestra | a vossa caridade | tratamento por "vós", como em `articles-36` |

Obras citadas, em itálico: *Da Trindade*, *Oitenta e Três Questões*, *A Cidade de Deus*, *Sobre a Adivinhação dos Demônios*, *Retratações* (Agostinho); *Hierarquia Celeste*, *Sobre os Nomes Divinos* (Dionísio); *Metafísica*, *Sobre os Animais* (Aristóteles).

## Translation Decisions

- Títulos: Proêmio, Solução (como "Proêmio" nas obras irmãs).
- Saudação: *Baxiano* → "Bassiano", forma do `book.json`. O latim diz *lectori fratrum … de Venetiis* ("leitor dos frades … de Veneza"); o título "de Lodi" fica como nas obras irmãs. Fórmula modelada em `articles-6` ("Ao seu caríssimo irmão…, da mesma Ordem, saudação…").
- Numeração: o latim escreve os enunciados como `1. …` e `- 2. …`, que o markdown converte em listas ordenadas (e renumera). No pt-BR os números ficam em negrito inerte (`**1.**`, `- **2.**`), com a mesma estrutura (o 1 como parágrafo, os 2–30 como itens de lista). O latim não foi alterado: não é erro de OCR.
- Escritura no formato abreviado das obras irmãs, sem acrescentar o que a fonte não dá: Mt 24, Rm 8, Jo 1, Lc 5; *in Eccle.* → "no Eclesiastes" (sem capítulo no latim). As citações traduzem o latim (Jo 1: *peccata*, "os pecados do mundo").
- Itálicos seguem o latim: as citações de Agostinho no ad 1 e de Dionísio no ad 5 ficam em redondo, como na fonte.
- Passagens corrompidas no texto transmitido, traduzidas pelo sentido, sem alterar o latim:
  - Questão 6: *angelicus pergit* — falta *spiritus*; suprido entre colchetes: "o [espírito] angélico".
  - Ad 5: *Nihil autem est … majus esse videtur … nisi administratio* — verbo duplicado; traduzido "nada parece haver… maior… senão a administração dos corpos celestes".
  - Ad 10: *quod quidem … dubium esse possit* → "o que possa haver de duvidoso" (*quid*), como em `articles-36`, art. 3.
  - Ad 11: *hoc quidem mihi videatur supra … dictum est* → "o que me parece sobre isto foi dito acima" (*quid de hoc*).
  - Ad 21: *tollere naturalia peccata* traduzido literalmente, "os pecados naturais" (o paralelo em `articles-36` traz *actualia*); a leitura faz sentido como "pecados da natureza", isto é, o original.
- Ad 22: o latim interrompe-se (*puto verum esse quod*). Mantido truncado, com reticências marcando a lacuna; sem nota do tradutor. A resposta completa está em `articles-36`, art. 15.
- Ad 28: *conveniens est quod … erunt passibilia* → "é conveniente que… sejam passíveis" (subjuntivo exigido em português).

## Source edits

Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo contra o latim canônico, incluindo citações e referências bíblicas. Veredito: 1 defeito corrigido.
- Corrigido — `30articuli-c02.md`, [13], resposta 12: “para a incorrupção do corpo humano basta só a natureza” → “para a corrupção do corpo humano basta só a natureza”. Fonte: `ad corruptionem humani corporis sola natura sufficiat quasi incorruptio humani corporis a natura causetur`. A decisão anterior substituía a leitura canônica pela do paralelo de `articles-36`; a incoerência da fonte deve ser conservada, sem emenda conjectural. Removida a decisão anterior; o segundo “incorrupção”, correspondente a `incorruptio`, permanece.
- Rejeitado — c01 [4] e [5], negrito dos números: fonte `1. An Angeli` / `- 2. Item, an Angeli`; os números inertes cumprem a regra de livros e não acrescentam conteúdo.
- Rejeitado — c01 [5], parênteses e itálico em “por propagação (*ex traduce*)”: fonte `anima Christi sit ex traduce`; preservação da expressão técnica com sua tradução, não acréscimo de proposição.
- Rejeitado — c01 [5], itálico em “Sobre os Animais”: fonte `in libro de animalibus`; título de obra, conforme a convenção registrada.
- Rejeitado — c02 [2], [3], [6], [19], [20], [21], itálicos adicionais: fonte `de Trinitate` / `83 quaestionum`; `de divinis nominibus`; `caelestis hierarchiae`; `de civitate Dei`; `de divinatione Daemonum` / `Retractationum`; `Metaph.` / `de animalibus`, respectivamente. São títulos, não conteúdo adicional nem alteração das citações.
- Rejeitado — c02 [8], aspas retas em “fazer”: fonte `verbum faciendi`; delimitam a palavra mencionada. A regra de livros proíbe normalizar o estilo de aspas nesta revisão.
- Rejeitado — c01 [5], questão 6: fonte `angelicus pergit`; “[espírito] angélico” explicita, com colchetes, o substantivo elíptico retomado de `spiritus` na mesma questão.
- Rejeitado — c02 [6], resposta 5: fonte `Nihil autem est … majus esse videtur … nisi administratio`; “nada parece haver … maior … senão a administração” acomoda a construção redundante sem suprimir a exceção.
- Rejeitado — c02 [11] e [12], respostas 10 e 11: fonte `quod quidem … dubium esse possit` / `quod hoc quidem mihi videatur supra articulo 8 dictum est`; “o que possa haver de duvidoso” / “o que me parece sobre isto foi dito acima, no artigo oitavo” são acomodações sintáticas defensáveis, sem inversão de conteúdo.
- Rejeitado — c02 [22], resposta 21: fonte `tollere naturalia peccata`; “tirar os pecados naturais” preserva esta leitura, mesmo divergindo do paralelo.
- Rejeitado — c02 [23], resposta 22: fonte `Ad 22 dico quod puto verum esse quod`; “julgo ser verdadeiro que…” conserva o término incompleto da própria fonte, sem omissão da tradução.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-30/review-1.md`.

### Round 2

- Foco: leitura bilíngue cláusula por cláusula contra o latim. Veredito: limpo; nenhuma alteração no texto.
- Rejeitado — c02 [19]: fonte `IX de civitate Dei cap. V`; "cap. 5" em arábico, enquanto Dionísio fica "cap. IV"/"cap. VIII". Mesmo valor de referência; só estilo de numeral.
- Rejeitado — c02 [20]: fonte `hominum … dispositiones … consignant`; "os demônios as assinalam" explicita o sujeito implícito (os demônios), sem o qual o português leria "as disposições" como sujeito.
- Rejeitado — c02 [25]: fonte `ratio organi ministri quia utrumque movet`; "a do órgão e a do ministro" é exigido por `utrumque`.
- Rejeitado — c02 [13]: fonte `scilicet causa naturalis corruptionis subtracta erit`; "a saber, porque…" explicita o nexo causal do `scilicet`.
- Rejeitado — c02 [7]: fonte `Rom. VIII quod spiritus interpellat`; "o Espírito" (Espírito Santo em Rm 8) com maiúscula, distinto do `spiritus` do Eclesiastes na questão 6.
- Rejeitado — c01 [5], questão 30: fonte `actio creatoris vel creaturae mensurato tempore`; "ação …, medida pelo tempo" conserva a ambiguidade do ablativo.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-30/review-2.md`.

### Round 3

- Foco: leitura integral do pt-BR sem a fonte, seguida de verificação no latim e varredura ortográfica e de pontuação. Veredito: 1 defeito corrigido.
- Corrigido — c02 [20], resposta 19: “ou se os conhecem por outra força espiritual” → “ou se conhecem essas coisas por outra força espiritual”. Fonte: `pervenire ista ad notitiam Daemonum […] aut alia vi spirituali cognoscant`, esclarecido por `Sed si spirituali vi cogitationes cognoscant`. “Os” retomava os sinais corporais; o objeto da alternativa é o conteúdo conhecido (disposições/pensamentos), retomado agora por “essas coisas”, em referência a “estas coisas” na frase anterior.
- Rejeitado — c02 [6]: “sofram estupor, isto é, afastadas” / `pati stuporem, remotas scilicet`: particípio circunstancial referido às virtudes; elipse defensável, sem necessidade de impor outro nexo lógico.
- Rejeitado — c02 [12]: “a sua causa e princípio está” / `ejus causa et principium est`: singular defensável para termos próximos que exprimem uma unidade conceitual sob um determinante comum.
- Rejeitado — c02 [13] e [23]: “corrupção […] incorrupção” / `corruptionem […] incorruptio` e “julgo ser verdadeiro que…” / `puto verum esse quod`: incoerência e lacuna da própria fonte, já registradas; mantidas.
- Rejeitados os alertas de ênfase: c01 [4]–[5], `1. An Angeli` / `- 2. Item` → números inertes em negrito; c01 [5], `ex traduce` → expressão latina em itálico; c01 [5] e c02 [2], [3], [6], [19], [20], [21], `de animalibus`, `de Trinitate`, `83 quaestionum`, `de divinis nominibus`, `caelestis hierarchiae`, `de civitate Dei`, `de divinatione Daemonum`, `Retractationum`, `Metaph.` → itálicos de títulos. Confirmadas as razões da rodada 1, sem alteração de conteúdo.
- Rejeitados os alertas de parênteses, c01 [5], “por propagação (*ex traduce*)” / `ex traduce` (termo preservado com tradução), e aspas, c02 [8], 'o verbo "fazer"' / `verbum faciendi` (aspas pareadas de menção, sem regra de normalização).
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-30/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas forçadas (gênero, antecedente, tratamento). Veredito: limpo; nenhuma alteração no texto.
- Rejeitado — c01 [5], questão 10: fonte `suo imperio moveant ea potestate sibi a Deo tradita`; “os movem… com o poder” lê `ea` como objeto (os corpos) e `potestate` como ablativo de meio, como a resposta 10 separa `suo imperio` e `potestate a Deo donata`.
- Rejeitado — c02 [5]: fonte `quod mediantibus Angelis ea moveat`; “que os mova”: sujeito implícito Deus, “os” = corpos celestes.
- Rejeitado — c02 [6]: fonte `inter exequentes exteriora ministeria`; “entre as que executam”, feminino referido às ordens (`Hic … ordo`).
- Rejeitado — c02 [10]: fonte `motu …, quae est per Angelos`; “que se dá por meio dos anjos” refere-se ao movimento, apesar da discordância de gênero do latim.
- Rejeitado — c02 [20]: fonte `secundum non excludit primum`; “a segunda afirmação… a primeira” nomeia as duas citações de Agostinho.
- Rejeitado — c02 [29]: fonte `Quod autem`; “E que” — `autem` continuativo, sem contraste.
- Rejeitado — c02 [32]: fonte `orationum suffragia rependatis`; “o sufrágio das vossas orações”, singular coletivo da fórmula de despedida; tratamento por “vós” coerente com [3].
- Rejeitado — c02 [31]: fonte `intelligere et ejus velle`; “o seu entender e o seu querer”, o possessivo estende-se ao entender de Deus (`velle autem et intelligere Dei`).
- Fora de escopo — `book.json` `description` (todas as línguas) fala em Trindade, cristologia e sacramentos, mas a carta trata de anjos, corpos celestes e milagres; o pt-BR segue o `la`. Não alterado.
- Rejeitados os alertas mecânicos de ênfase, parênteses e aspas: mesmas razões das rodadas 1 e 3.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-30/review-4.md`.

### Round 5

- Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes próprios. Veredito: limpo; nenhuma alteração nos capítulos, nos Key Terms ou nas afirmações anteriores.
- Rejeitado — c02 [20], contagem de “demônios”: fonte `hominum … dispositiones … consignant`, no contexto de `de divinatione Daemonum`; “os demônios as assinalam” explicita o sujeito de `consignant`. As duas ocorrências nominais latinas correspondem a três portuguesas por essa explicitação já fundamentada na rodada 2, não por troca de termo.
- Rejeitado — c01 [2], “Bassiano” e “Veneza”: fonte `fratri Baxiano, lectori fratrum ordinis praedicatorum de Venetiis`; formas portuguesas defensáveis. “De Lodi” pertence ao título registrado nos metadados, não foi interpolado na saudação nem substitui “de Veneza”.
- Rejeitado — c01 [5] e c02 [21], “Sobre os Animais”: fonte `in libro de animalibus`; conserva o título abreviado transmitido, sem o expandir para o título moderno de um tratado zoológico específico.
- Rejeitado — diário, rodada 2, c02 [25]: a formulação abreviada “a do órgão e a do ministro” resume “a razão do órgão e a do ministro”; fonte `ratio organi ministri quia utrumque movet`. A ausência literal da abreviação no capítulo não invalida a afirmação sobre os dois termos regidos por `utrumque`.
- Rejeitado — diário, “Proêmio” nas obras irmãs: fonte c01 [1], `Prooemium` → “Proêmio”. Embora `articles-6` e `articles-36` usem “Prólogo”, há “Proêmio” em `de-sortibus`, `de-ente-et-essentia` e outras obras irmãs; a afirmação não atribui esse título especificamente às duas cartas.
- Rejeitados os alertas mecânicos: c01 [4]–[5], `1. An Angeli` / `- 2. Item` → números inertes; c01 [5], `ex traduce` → “por propagação (*ex traduce*)”; c01 [5] e c02 [2], [3], [6], [19], [20], [21], `de animalibus`, `de Trinitate`, `83 quaestionum`, `de divinis nominibus`, `caelestis hierarchiae`, `de civitate Dei`, `de divinatione Daemonum`, `Retractationum`, `Metaph.` → títulos em itálico; c02 [8], `verbum faciendi` → 'o verbo "fazer"'. Valem as justificativas das rodadas 1 e 3: formatação prevista, preservação do termo técnico e aspas de menção.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/aquinas-opera-omnia__opuscula__articles-30/review-5.md`.
