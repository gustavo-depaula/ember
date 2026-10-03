# Diário de Tradução — Do Movimento do Coração (pt-BR)

Fonte canônica: `la/`, texto latino (edições Leonina / Marietti, via aquinas.cc). Destino: `pt-BR`.
Referência secundária: `en-US/` (Larkin, revisado pelo Aquinas Institute), somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

O vocabulário escolástico segue as tabelas de `de-ente-et-essentia/pt-BR/`, `de-principiis-naturae/pt-BR/` e `de-operationibus-occultis/pt-BR/`.

| Latim | Português | Notas |
|---|---|---|
| motus / movere / motor | movimento / mover / motor | *motus localis*, *secundum locum* → movimento local, segundo o lugar. |
| pulsus et tractus | impulso e atração | Ordem do latim mantida em cada ocorrência (*tractu et pulsu* → “atração e impulso”). |
| anima nutritiva / sensitiva / intellectiva | alma nutritiva / sensitiva / intelectiva | |
| appetitus / appetere / appetibilia | apetite / apetecer / coisas apetecíveis | |
| apprehensio | apreensão | |
| affectio | afeição | |
| passiones animae | paixões da alma | *propriae passiones* (¶3) → “paixões próprias”, sentido técnico de propriedades. |
| alteratio | alteração | |
| per se / per accidens | por si / por acidente | |
| violentus | violento | Oposto de natural, sentido aristotélico. |
| intelligentia | inteligência | Substância separada motora. |
| spiritus | espíritos | “espíritos gerados” (¶5): os espíritos vitais da fisiologia medieval. |
| principiatum | principiado | |
| deficere a | ficar aquém de | |
| morula | breve pausa | |
| operationes vitales / animales | operações vitais / animais | Distinção dos médicos (¶15). |
| motus progressivus | movimento progressivo | |
| imperium voluntatis | império da vontade | |
| pudendum | partes pudendas | |
| phantasia | fantasia | |
| magnes | ímã | Como em *Das Obras Ocultas da Natureza*. |
| minor mundus | mundo menor | |

## Decisões

- 2026-10-03: Tradução diretamente do latim, parágrafo por parágrafo (título, subtítulo e 17 parágrafos). Mantidos os dois espaços finais de linha que a fonte traz nos parágrafos.
- Título *De Motu Cordis* → *Do Movimento do Coração*, no padrão “Do/Das …” dos opúsculos irmãos; subtítulo → “a Mestre Filipe de Castro Caeli” (topônimo mantido em latim, como na referência inglesa).
- Obras de Aristóteles, no padrão dos irmãos (“no VIII da *Física*”, “no III do *Sobre a Alma*”): *De motu animalium* → *Sobre o Movimento dos Animais*; *De partibus animalium* → *Sobre as Partes dos Animais*; *De causa motus animalium* → *Sobre a Causa do Movimento dos Animais*. Numerais ordinais por extenso (*in octavo*, *in tertio*) mantidos por extenso, como no latim.
- Citações em itálico seguem exatamente os limites do itálico latino, inclusive as glosas de Tomás que a fonte deixa dentro do itálico (¶11 *scilicet inquantum est principium motus*; ¶13 *scilicet in corde*; ¶17 *idest cordis et pudendi*). Única exceção: no ¶5 a fonte põe o título e a citação num só itálico (*De motu animalium oportet … esse*); o pt-BR separa *Sobre o Movimento dos Animais* da citação, com dois-pontos, como nas demais citações. Erro de marcação, não do texto; a fonte não foi alterada.
- As citações de Aristóteles são traduzidas a partir da versão latina citada por Tomás, não do grego nem da referência inglesa (que parafraseia e acrescenta referências Bekker ausentes do latim; estas não foram importadas).
- Sem notas editoriais na fonte; nenhuma nota do tradutor acrescentada.
- `book.json`: entradas pt-BR acrescentadas a `name`, `author`, `description` (campo já existente) e ao título do sumário; `pt-BR` incluído em `languages`.

## Alterações na fonte

Nenhuma.

## Review log

### Round 1

Foco: completude parágrafo a parágrafo contra `la/` (17 parágrafos alinhados um a um; citações, glosas e referências a Aristóteles). Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- ¶12 *puta ignis* → “a saber, o fogo”: *puta* é “por exemplo”, mas o fogo é de fato o elemento mais nobre no argumento; a identificação não altera a afirmação.
- ¶9 *Sic igitur et cum motus omnium aliorum membrorum causentur* → “embora”: *cum* admite leitura concessiva, sustentada pelo contraste *quidem … sed* que se segue.
- ¶15 “e dizem que, cessando as animais, permanecem as vitais”: “dizem” supre o verbo que a oração com *quod* subentende; nada acrescentado.
- ¶17 “move-se o coração e as partes pudendas”: verbo no singular com sujeito composto posposto, espelhando *movetur cor et pudendum*; concordância válida.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-motu-cordis/review-1.md`.

### Round 2

Foco: leitura bilíngue oração por oração, `la/` × `pt-BR/`, nos 17 parágrafos; auditoria mecânica e `book.json`. Veredito: 1 defeito, corrigido.

Corrigido:
- ¶17, *Et praeter rationem utique facti motus*: “E também os movimentos” → “E, de fato, os movimentos”. *utique* é partícula afirmativa (“certamente”, “de fato”), não aditiva; “também” acrescentava uma adição que o latim não tem e perdia a ênfase.

Achados considerados e rejeitados:
- ¶3 *aliquod principium intrinsecum consequuntur* → “seguem-se de algum princípio intrínseco”: a regência com “de” exprime a dependência que *consequi* tem aqui (decorrer de um princípio); sentido preservado.
- ¶8 *Differt enim secundum qualem motum quod movetur eveniat* → “o tipo de movimento que sucede ao que se move”: latim obscuro da versão; a leitura é defensável e não inverte o sentido.
- ¶17 *praeter rationem* → “contra a razão”: “à margem da razão” seria mais literal, mas a referência inglesa (*against reason*) e o contexto (movimento involuntário, sem ordem do intelecto) sustentam “contra”.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-motu-cordis/review-2.md`.

### Round 3

Foco: leitura do pt-BR sem a fonte, com cada marcação verificada depois contra `la/`; varredura mecânica de ortografia, diacríticos, crase, hífen, pontuação e pares de itálico; auditoria mecânica e `book.json`. Veredito: 1 defeito, corrigido.

Corrigido:
- ¶13, *Unde ad hoc quod cor esset principium et finis omnium motuum, habet*: “para que o coração fosse princípio e fim … tem” → “para que o coração seja princípio e fim … tem”. Com a principal no presente do indicativo, a final pede presente do subjuntivo. O *esset* latino segue o uso medieval e não indica um quadro no passado, já que *habet* está no presente.

Achados considerados e rejeitados:
- ¶1 “são gerar, usar o alimento, e o aumento e a diminuição”: a série mistura infinitivos e substantivos porque o latim também mistura (*generare, alimento uti, et augmentum et diminutio*).
- ¶11 “e porque cada uma das partes … está naturalmente disposta …, de modo que não há …”: a oração com “porque” fica sem principal, mas o latim tem o mesmo anacoluto (*et quia natum est … ut nihil opus sit … sed … alia quidem vivere*). Foi mantido.
- ¶15 “chamando vitais às que acompanham”: regência “chamar a alguém algo”, com crase. A mesma construção aparece no ¶11 (“Chamo … ao do coração”).
- ¶17 “sem que contudo o intelecto o ordene”: o latim (*non tamen iubente intellectu*) não tem objeto. O “o” neutro equivale a “isso”, o movimento, e é legível.
- Itálicos: 22 trechos no pt-BR contra 21 no latim. A diferença vem da separação do ¶5, já registrada em Decisões.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-motu-cordis/review-3.md`.

### Round 4

Foco: palavras funcionais (preposições, artigos, demonstrativos, conectivos adversativos, possessivos), títulos e pontos em que o português precisa se comprometer onde o latim fica aberto; auditoria mecânica e `book.json`. Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- ¶10 *et movens hunc motum est quod dat formam* → “aquele que dá a forma”: o *quod* é neutro, mas a frase anterior identifica o agente (*generans, quod dat formam* → “o gerador”); o masculino é justificado.
- ¶11 *in quodam principio corporis existente* → “existindo ela”: o sujeito implícito do ablativo absoluto é a alma (*esse animam*), não acréscimo.
- Partículas sem equivalente explícito: ¶8 *Cum enim animal movetur deorsum* (“Quando o animal…”), ¶11 *In animalibus autem* (“Nos animais…”), ¶13 *sicut et principiatum* (“assim como o principiado”), ¶15 *Neque etiam oportet* (“Nem é preciso”), ¶9 segundo *sed* (*sed ex appetitu ultimi finis*) vertido como dois-pontos. Em todos, a relação lógica permanece legível pela sequência; nenhuma muda a afirmação. Escolha de estilo.
- Tratamento: não há tu/vós/você no texto; só a primeira pessoa do autor (*Dico* → “Chamo”, *dicimus* → “dizemos”), espelhada.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-motu-cordis/review-4.md`.

### Round 5

Foco: diferença de frequência de termos por parágrafo contra a tabela de Termos-chave, nos dois sentidos; verificação por grep de cada afirmação falseável do diário (linhas da tabela, números de parágrafo, contagens); nomes próprios e títulos de obras contra os opúsculos irmãos; auditoria mecânica e `book.json`. Veredito: limpo, nenhuma alteração.

Achados considerados e rejeitados:
- “motor” aparece duas vezes, mas *movens/motorem* cinco: ¶1 *habere motorem* → “ter um motor”; ¶10 *movens hunc motum* → “o motor deste movimento”. As demais ocorrências de *movens* são participiais (¶6 *movens seipsum*, ¶10 *per se movens*, ¶13 *movens organice*) e foram vertidas por “o que move”. *Movens* substantivado como “motor” é a forma escolástica corrente, e “motor” não traduz nenhum outro termo. Não há conflito com a tabela.
- `book.json`: as descrições en-US e la trazem “Castro Coeli”, mas o subtítulo latino do capítulo e o pt-BR trazem “Caeli”. A descrição pt-BR segue o capítulo; os campos fora do pt-BR não pertencem a esta revisão.

Evidência: `ember-translation-evidence/aquinas-opera-omnia__opuscula__de-motu-cordis/review-5.md`.
