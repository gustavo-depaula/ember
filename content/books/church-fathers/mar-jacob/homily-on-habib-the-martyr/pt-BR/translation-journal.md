# Diário de tradução — Homilia sobre Habib, o Mártir (pt-BR)

Fonte: en-US/, tradução de B. P. Pratten, Ante-Nicene Fathers, vol. 8 (Buffalo, 1886), revista por Kevin Knight para New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Mar Jacob | Mar Jacó | Jacó de Sarug; o título siríaco "Mar" é mantido |
| Habib | Habib | |
| Hananiah / Azariah / Michael | Ananias / Azarias / Misael | os três jovens da fornalha (Daniel 3); ver Decisões |
| Edessa / Edessæans | Edessa / edessenos | |
| Abgar | Abgar | rei de Edessa |
| Addæus | Adai | o apóstolo de Edessa da tradição siríaca |
| Sharbil | Sarbélio | sacerdote pagão convertido e mártir |
| Shamuna and Guria | Samona e Gúria | mártires de Edessa |
| Shamuna the Second | a Segunda Samona | mãe dos sete irmãos de 2 Macabeus 7; nota do tradutor |
| the Parthians | os partos | "a filha dos partos" = Edessa |
| Constantine | Constantino | |
| the Defamer | o Difamador | o demônio |
| errour / error | o erro | personificado como feminino na fonte; em português segue o gênero masculino |
| paganism / pagans | paganismo / pagãos | |
| Godhead | Divindade (incenso "para a Divindade"); divindade (natureza) | |
| manhood | humanidade | |
| the Only-begotten | o Unigênito | |
| took a body and became man | tomou um corpo e se fez homem | fórmula fixa, repetida |
| the fire of sacrifice (as bride) | a fogueira do sacrifício | feminino para manter a imagem nupcial |
| combs | pentes | instrumento de tortura |
| the block | o cavalete | instrumento de tortura em que se erguia o réu |
| stocks | tronco | |
| stripes | chagas | |
| deacon / high-priest / priest | diácono / sumo sacerdote / sacerdote | |
| congregations / assemblies | congregações / assembleias | |
| marriage-feast | banquete de núpcias | |
| judgment-hall | pretório | |

## Decisões

- **Tratamento.** Tu para o mártir (¶47), para a mãe (¶121-128), para Habib nas zombarias (¶201) e para o juiz (¶154); vós no plural de João 18 (¶161). Em ¶211 a fonte dirige-se a Cristo com "You": "Vós", com maiúscula, como os pronomes divinos (Ele, Dele, Aquele, O).
- **¶21.** A fonte traz "Michael" entre os três jovens da fornalha; trata-se de Misael (Mishael), e assim se traduziu, para não confundir com o arcanjo.
- **Itálicos.** As palavras supridas pelo tradutor inglês, marcadas em itálico, conservam o itálico na palavra portuguesa correspondente quando ela existe. Em "Only-*begotten*" (¶242, ¶245, ¶266) o itálico parcial não tem correspondente em "Unigênito", que fica em redondo.
- **¶223.** A fonte não tem pontuação no fim do verso; espelhado.
- **¶309.** Nota do tradutor: "Shamuna" designa aqui a mãe dos Macabeus, não o mártir de ¶245. Os dois recebem a mesma forma, Samona, como na fonte.
- **¶324.** "she exalted" é lapso da fonte por "exulted"; traduzido "exultou".
- **Citações bíblicas.** A fonte não dá referências; nenhuma foi acrescentada. As palavras de Cristo (¶160-162) e Jeremias 17:5 (¶234) seguem a redação da fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral de ch001.md (345 parágrafos), do diário e do book.json, sem defeitos objetivos. Os alertas de itálico da auditoria correspondem à decisão do diário sobre "Unigênito".
- Rejected: pt-BR/ch001.md [242], [245], [266] — Auditoria: a fonte tem itálico parcial em "Only- *begotten*" e o PT não tem itálico — "Unigênito" é uma só palavra e não tem parte que corresponda à palavra suprida pelo tradutor inglês. A decisão está registrada no diário.
- Rejected: pt-BR/ch001.md [104] — "O despeito o aguilhoava": o pronome poderia remeter a Habib — O sujeito da oração anterior é "o erro", que continua como sujeito de "procurava tirar-lhe a vida". A leitura se resolve pelo contexto.
- Rejected: pt-BR/ch001.md [87]-[88] — "revestiu-os" e "derrubados" no masculino, depois de "Fortalecia-as" (congregações) em [86] — É silepse de gênero: a concordância se faz com as pessoas das congregações. O recurso é aceito em português e não muda o sentido.
- Rejected: pt-BR/ch001.md [316] — "por causa dele": o pronome poderia remeter a Habib em vez do "olho" — O antecedente masculino mais próximo é "Outro olho", na mesma frase. O sentido da fonte ("by reason of this") se mantém.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 1 minor. Leitura integral dos 345 parágrafos, do diário, do book.json e dos três alertas: um defeito menor, a definição ausente de uma nota.
- `pt-BR/ch001.md` [345]: “composta por Mar Jacó.” → “composta por Mar Jacó.

[^1]: A mãe de Habib é comparada à mãe dos sete irmãos de 2 Macabeus 7, chamada Samona, e não ao mártir Samona mencionado anteriormente.” — A chamada [^1] em [309] não tem definição no texto fornecido. Acrescenta-se a nota explicativa já prevista no diário.
- Rejected: pt-BR/ch001.md [242], [245], [266] — Ausência do itálico parcial de Only-begotten. — A solução para a palavra única «Unigênito» está justificada no diário; os alertas não indicam perda de conteúdo.
- Rejected: pt-BR/ch001.md [256] — Possível leitura da negação como restrita a «tomou um corpo». — A construção acompanha a fonte e admite negação de toda a fórmula coordenada; o contexto esclarece que se trata da negação da encarnação.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001.md [344]-[346]: the footnote added in round 2 agrees with the journal and the context, and its grammar and formatting are correct. No defects.
- Rejected: pt-BR/ch001.md [346] — Mechanical audit: 345 source blocks vs 346 pt-BR blocks — The extra block is the definition of translator's footnote [^1] at the end of the file. House rules allow a translator's footnote, so this is not content out of alignment.
- Rejected: pt-BR/ch001.md [346] — "chamada Samona": the mother in 2 Maccabees 7 has no name in the biblical text — The note explains the name as the homily uses it. Syriac tradition calls her Shmuni/Shamuna, and the journal's Key Terms record "a Segunda Samona". The note does not misinform the reader.
- Revertida (orquestrador): a nota acrescentada em `pt-BR/ch001.md` [345] duplicava a definição já existente do mesmo marcador; o revisor não via as notas do tradutor.
