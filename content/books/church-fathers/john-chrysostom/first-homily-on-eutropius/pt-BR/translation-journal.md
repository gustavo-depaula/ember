# Diário de tradução — Primeira Homilia sobre Eutrópio (pt-BR)

Fonte exclusiva: en-US/ch001.md (W. R. W. Stephens, NPNF I/9, conforme book.json).
Destino: pt-BR.

## Termos

| en-US | pt-BR | Observação |
|---|---|---|
| John Chrysostom | João Crisóstomo | Metadados conforme Quatro Cartas a Olímpia. |
| Eutropius | Eutrópio | Conforme Apologia de Fuga (Atanásio). |
| eunuch, Patrician and Consul / consulship | eunuco, patrício e cônsul / consulado | |
| Vanity of vanities, all is vanity | Vaidade das vaidades, tudo é vaidade | |
| lovingkindness / loving kindness | benignidade | Conforme Quatro Cartas a Olímpia e Sobre o Sacerdócio. |
| Emperor / king | imperador / rei | Segue a palavra da fonte em cada ocorrência. |
| the Holy Table / the altar | a Santa Mesa / o altar | |
| right of refuge / asylum | direito de asilo / asilo | |
| harlot | meretriz | |
| hippodrome / theatre | hipódromo / teatro | |
| Holy Paschal Feast | santa festa da Páscoa | |
| fellow-servant | conservo | |

## Decisões — 2026-10-11

- “Tu” para Eutrópio e para o interlocutor singular (“beloved brother”, “O man”); “vós” para a assembleia. Aspas curvas “ ”, como as obras irmãs.
- Numeração da fonte (`1.` em lista) convertida em negrito (`**1.**`), conforme `.claude/rules/books.md`. O parágrafo sem número do §3 mantido como parágrafo à parte.
- Referências bíblicas conservadas na posição e forma da fonte, com nomes portugueses (Provérbios 27:6, Lucas 23:34, Isaías 40:6-7, Mateus 6:12). As citações sem referência na fonte (“quero misericórdia e não sacrifício”, os versos dos Salmos no §4) ficam sem referência. Citações traduzidas do inglês, sem substituir por uma Bíblia portuguesa.
- Não há notas de rodapé; aplicar-se-ia a opção padrão de excluir notas editoriais.
- book.json: pt-BR acrescentado apenas a name, author, languages e toc.title.

## Correções da fonte

Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, citações e referências bíblicas, contra a fonte canônica en-US.
- Veredito: CLEAN; nenhum defeito objetivo confirmado e nenhuma alteração no capítulo.
- Alertas rejeitados — ch001 [3], [4], [5], [7] e [8]: a fonte inicia respectivamente com `1.`, `2.`, `3.`, `4.` e `5.`; o pt-BR usa `**1.**`, `**2.**`, `**3.**`, `**4.**` e `**5.**`. Cada diferença de quatro asteriscos decorre da numeração inerte em negrito exigida por `.claude/rules/books.md`, não de ênfase acrescentada ao discurso.
- Possível alteração de sentido rejeitada — ch001 [6]: “human nature convicted” → “a natureza humana posta a nu”. No contexto da demonstração pública da fragilidade humana, a expressão portuguesa conserva a exposição dessa fragilidade; não exige uma condenação judicial.
- Possível alteração de sentido rejeitada — ch001 [8]: “not for investigating claims but for conceding them” → “não de examinar pretensões, mas de renunciar a elas”. O contexto contrapõe cobrança e vingança à misericórdia; ceder nas próprias pretensões é uma leitura defensável, não uma inversão do sentido.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__first-homily-on-eutropius/review-1.md`.

### Round 2

- Foco: leitura bilíngue de fidelidade, oração por oração, contra a fonte en-US.
- Veredito: CLEAN. Nenhum defeito objetivo e nenhuma alteração no capítulo.
- Rejeitado — ch001 [4]: “from the royal court” → “da corte imperial”. A linha “Emperor / king” dos Termos vale para os substantivos com que a homilia se refere a Arcádio. O adjetivo designa a corte dele, que era imperial, por isso a tradução não contradiz a tabela.
- Rejeitado — ch001 [7]: “enjoy the possession of all men” → “gozar … da posse dos bens de todos os homens”. A tradução explicita o sentido (possuir o que todos possuem) e não acrescenta nenhuma ideia.
- Rejeitado — ch001 [7]: “the Holy Table to which the man had fled for refuge” → “a Santa Mesa à qual o homem se refugiara”. A regência “refugiar-se a” é menos comum, mas está atestada e tem sentido claro. É uma escolha de estilo.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__first-homily-on-eutropius/review-2.md`.

### Round 3

- Foco: leitura a frio integral do pt-BR antes da fonte, seguida de verificação no en-US e varredura de ortografia e pontuação.
- Veredito: ISSUES 1; um defeito corrigido no capítulo.
- Corrigido — ch001 [7], §4: “declarando que lhe era grato por estas” → “declarando que lhe era grato por essa boa ação”. Em “not only his offenses, but any good deed […] declaring that he felt gratitude for the latter”, a gratidão se refere à boa ação. O plural “estas” não concordava com esse antecedente singular e podia retomar “ofensas”.
- Rejeitado — ch001 [4]: “mais nada do que o próprio nada” corresponde a “more naught than nonentities”; a hipérbole paradoxal pertence à fonte, não constitui frase sem sentido.
- Rejeitado — ch001 [6]: “E de que não se usaram argumentos persuasivos, vós mesmos sois testemunhas” corresponde a “And that no persuasive arguments have been used, you yourselves are witnesses”. O complemento de “testemunhas” está antecipado; a negação é da fonte, cujo período seguinte explica a convocação pelos atos, sem fala.
- Alertas rejeitados — ch001 [3], [4], [5], [7] e [8]: `1.`, `2.`, `3.`, `4.` e `5.` na fonte → `**1.**`, `**2.**`, `**3.**`, `**4.**` e `**5.**` no pt-BR; os quatro asteriscos por bloco cumprem a regra de numeração inerte, sem acrescentar ênfase ao discurso.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__first-homily-on-eutropius/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas forçadas (tratamento tu/vós, gênero, antecedentes, possessivos).
- Veredito: CLEAN. Nenhuma alteração no capítulo.
- Rejeitado — ch001 [6]: “you yourselves are witnesses of the enthusiasm, and the concourse of the people” → “vós mesmos sois testemunhas, pelo entusiasmo e pela afluência do povo”. “Witnesses” já tem complemento (“that no persuasive arguments…”). Na fonte, “of the enthusiasm” é a prova vista pelos ouvintes, e “pelo” explicita esse vínculo sem acrescentar ideia.
- Rejeitado — ch001 [6]: “Thus the man has summoned you” → “Assim, este homem vos convocou”. Eutrópio está presente e é “este homem” em todo o texto ([4], [7]). O referente é o mesmo.
- Rejeitado — ch001 [7]: “incensed on account of his misdeeds” → “irritado por causa dos seus crimes”. A fonte é igualmente aberta. O contexto (o exército exige a entrega dele) fixa o antecedente em Eutrópio.
- Rejeitado — ch001 [6]: “she whom he attacked” → “aquela a quem ele atacou”. Objeto direto preposicionado com “quem”, construção padrão.
- Tratamento conferido fala a fala: tu para Eutrópio ([3]) e para o “irmão amado” / “ó homem” ([6]); vós para a assembleia e para o aviso de Eutrópio “a todos” ([6]). Confirma a decisão registrada.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__first-homily-on-eutropius/review-4.md`.


### Round 5

- Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes, contra a fonte en-US.
- Veredito: CLEAN; nenhum defeito confirmado. Nenhuma alteração no capítulo, nos metadados ou na tabela de termos.
- Alertas rejeitados — ch001 [3], [4], [5], [7] e [8]: `1.`, `2.`, `3.`, `4.` e `5.` na fonte → `**1.**`, `**2.**`, `**3.**`, `**4.**` e `**5.**` no pt-BR; os quatro asteriscos por bloco decorrem da numeração inerte exigida pelo projeto.
- Rejeitado — ch001 [6]/[7]: “right of refuge” → “direito de asilo”; “this asylum” → “este asilo”. O grep de `asilo` inclui a expressão composta de [6], por isso retorna duas ocorrências contra uma de `asylum`. Ambas as equivalências já constam da tabela; não há ocorrência excedente nem correção a fazer.
- Rejeitado — ch001 [4]: “from the royal court” → “da corte imperial”. Mantida a decisão da rodada 2: o adjetivo designa a corte imperial; a tabela “Emperor / king” regula os substantivos e não exige “corte real”.
- Evidências: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__first-homily-on-eutropius/review-5.md`.
