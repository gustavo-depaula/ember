# Diário de tradução — Ad Martyras (pt-BR)

Fonte: en-US/ch001.md (S. Thelwall, Ante-Nicene Fathers, vol. 3, edição New Advent).
Destino: pt-BR.

## Termos

| Inglês | Português | Observações |
|---|---|---|
| Tertullian | Tertuliano | Conforme as demais obras de Tertuliano em pt-BR. |
| Ad Martyras | Ad Martyras | Título e sumário; a fonte só traz o título latino, conservado como em *De Corona*. |
| Blessed Martyrs Designate | Benditos mártires designados | Os catecúmenos e fiéis presos à espera do martírio. |
| O blessed (ones) | ó benditos | Apóstrofe recorrente. |
| Holy Spirit / Holy Ghost | Espírito Santo | |
| the wicked one / devil | o maligno / o diabo | |
| warfare of the living God | milícia do Deus vivo | |
| sacramental words | palavras sacramentais | O juramento batismal (*sacramentum*). |
| superintendent / trainer | presidente / treinador | Agonótetas e treinador dos jogos. |
| martyrs | mártires | |
| proconsul | procônsul | |
| *testudo* | *testudo* | Itálico conservado. |
| διαμαστύγωσις | διαμαστύγωσις | Grego conservado, com a glosa “flagelação”. |
| Lucretia / Mucius / Heraclitus / Empedocles / Peregrinus / Dido / Hasdrubal / Scipio / Regulus / Cleopatra | Lucrécia / Múcio / Heráclito / Empédocles / Peregrino / Dido / Asdrúbal / Cipião / Régulo / Cleópatra | Formas portuguesas usuais. |
| Ætna / Lacedæmonian / Spartan | Etna / lacedemônia / espartanos | |

## Decisões

- 2026-10-03: Tradução integral do arquivo en-US: título, linha “Ad Martyras.”, 6 cabeçalhos de capítulo e 6 parágrafos, na mesma ordem. A fonte não tem parágrafos numerados nem notas de rodapé; nenhuma nota editorial a omitir, nenhuma nota de tradutor acrescentada.
- Convenções seguidas de *De Corona*, *Sobre a Paciência* e *Sobre a Oração*: cabeçalhos “## Capítulo N”; aspas curvas “ ”; vós para os mártires (destinatários plurais); pronomes reverenciais em minúsculas (ele, seu); referências bíblicas inline no formato capítulo:versículo, na mesma posição da fonte, sem pontuação adicional.
- Citações bíblicas traduzidas da redação da fonte: “onde estiver o vosso coração, ali estará o vosso tesouro” (cap. 2, Mateus 6:21, que a fonte inverte em relação ao Evangelho; mantida a inversão, de que depende a frase seguinte); “para obterem uma coroa corruptível” (cap. 3); “a carne é fraca, e o espírito, pronto” (cap. 4).
- Cap. 5, primeira frase: a sintaxe de Thelwall (“a mere vanity you find among men … as trampled under foot”) foi reordenada: “encontrais entre os homens uma mera vaidade … que os calca aos pés”.
- Cap. 4 “bit off her tongue” → “cortou a língua com os dentes”.

## Fonte

Duas correções de lapsos de OCR/digitação em `en-US/ch001.md`, refletidas na tradução:

- Cap. 4: “Let the spirit hold convene with the flesh” → “hold converse with” (“convene” não é transitivo nesse sentido; o ANF traz “converse”).
- Cap. 4: “her husband suppliant as Scipio's feet” → “suppliant at Scipio's feet”.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo (alinhamento 6 ↔ 6 parágrafos, frase a frase), citações, referências bíblicas, grego/latim; mais a auditoria mecânica (estrutura, notas, diacríticos, formato, `book.json`).
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem na tabela de termos.
- Achados considerados e rejeitados:
  - Cap. 5, “Todos esses mesmos combates cruéis e dolorosos, encontrais entre os homens uma mera vaidade … que os calca aos pés” (fonte: “All these same cruel and painful conflicts, a mere vanity you find among men … as trampled under foot”): anacoluto deliberado que reproduz a sintaxe da fonte, já registrado em Decisões; o sentido (a vaidade humana calca aos pés esses combates) está preservado.
  - Cap. 4, “se tenha entregue aos golpes” (fonte: “has given itself to stripes”): particípio irregular com *ter* é uso aceito no pt-BR; escolha de estilo, não erro.
  - Cap. 4, “suportou outras tantas crucifixões” (fonte: “he endured so many crucifixions”): “outras tantas” = tantas quantas os cravos; sentido fiel.
  - Cap. 2, “Ela está cheia de trevas” (fonte: “It is full of darkness”): “ela” retoma a prisão real, como “It” na fonte, não o “lugar de segurança”.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__tertullian__ad-martyras/review-1.md`.

### Round 2

- Foco: leitura bilíngue de fidelidade, oração por oração; mais a auditoria mecânica.
- Veredito: 1 defeito, corrigido.
- Corrigido:
  - Cap. 1, “como uma serpente desencantada ou expulsa pela fumaça” → “como uma serpente expulsa por encantamento ou pela fumaça” (fonte: “an outcharmed or smoked-out snake”). “Desencantar” é livrar de encantamento ou desiludir; “outcharmed” (lat. *excantatus*) é a serpente tirada da toca por encantamento. Falso cognato.
- Achados considerados e rejeitados:
  - Cap. 1, “os treinadores e os supervisores” (fonte: “the trainers and overseers”) não contradiz a linha “superintendent → presidente” dos termos: são palavras distintas na fonte; “superintendent” (cap. 3) é o agonóteta.
  - Cap. 1, “a paz entre vós é guerra contra ele” (fonte: “peace among you is battle with him”): “guerra” mantém a antítese com “paz”; escolha de estilo.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__tertullian__ad-martyras/review-2.md`.

### Round 3

- Foco: leitura fria só do pt-BR (gramática, concordância, regência, pronomes), cada marca verificada depois na fonte; varredura de ortografia, diacríticos, crase, hífen, pontuação e pareamento de aspas; mais a auditoria mecânica.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem na tabela de termos.
- Achados considerados e rejeitados:
  - Cap. 5, “Quantos amantes do conforto não entrega à espada a presunção das armas?” (fonte: “How many ease-lovers does the conceit of arms give to the sword?”): o sujeito é “a presunção”, singular; a concordância com “entrega” está correta.
  - Cap. 3, “para que as suas forças físicas sejam edificadas” (fonte: “that they may have their physical powers built up”): literal, mas inteligível; escolha de estilo.
  - Cap. 4, “transpassado por toda parte” (fonte: “everywhere pierced”): “transpassar” é variante registrada no VOLP, não erro de grafia.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__tertullian__ad-martyras/review-3.md`.

### Round 4

- Foco: palavras funcionais (preposições, artigos, demonstrativos, conectivos), possessivos *seu/sua*, antecedentes, gênero, tratamento vós e cabeçalhos; mais a auditoria mecânica.
- Veredito: limpo. Nenhuma alteração nos capítulos, no `book.json` nem na tabela de termos; as linhas da tabela e a contagem de 6 cabeçalhos e 6 parágrafos conferem com o texto.
- Achados considerados e rejeitados:
  - Cap. 3, “Admitamos agora, ó benditos” (fonte: “Grant now, O blessed”): abertura concessiva; a 1.ª pessoa do plural mantém o sentido e o vocativo.
  - Cap. 6, “pelas mãos dos seus inimigos, se foram seus partidários” (fonte: “from his enemies if they have been his partisans”): o paralelo com “pelas mãos dele … contra ele” e o “seus partidários” seguinte, que só pode ser “dele”, resolvem “seus” para o homem; lido como “deles”, os inimigos seriam os mesmos.
- Evidência: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__tertullian__ad-martyras/review-4.md`.
