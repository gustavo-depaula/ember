# Diário de Tradução — Da Perfeição da Vida Espiritual (pt-BR)

Fonte canônica: `la/`, texto latino integral. Destino: `pt-BR`.
Referência secundária: `en-US/`, somente para terminologia e registro; a estrutura e o texto seguem o latim, conforme o precedente de *Do Ente e da Essência*.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| caritas / dilectio | caridade / amor | Conforme os termos das obras irmãs de Tomás. |
| perfectio / status perfectionis | perfeição / estado de perfeição | |
| simpliciter / secundum quid | absolutamente / sob certo aspecto | |
| actus / habitus / potentia | ato / hábito / potência | “Ato” e “potência” conforme *Do Ente e da Essência*; “hábito” adotado nesta tradução. |
| ratio | noção; razão | Segundo o sentido, conforme a mesma obra. |
| beatitudo / fruitio | bem-aventurança / fruição | |
| viator / comprehensor | peregrino / bem-aventurado | Quem caminha nesta vida / quem já alcançou a bem-aventurança. |
| praeceptum / consilium | preceito / conselho | |
| religio / religiosus | vida religiosa ou ordem religiosa / religioso | “Religião” quando se trata da virtude do culto (cap. 12) ou da religião cristã (cap. 30). |
| cura animarum | cura de almas | |
| presbyter / episcopatus | presbítero / episcopado | Conforme *Dos Artigos da Fé*. |
| praelatus / subditus | prelado / súdito | |
| continentia / castitas | continência / castidade | |
| votum / obedientia | voto / obediência | |
| Philosophus | o Filósofo | Aristóteles. |

## Decisões

- 2026-10-02: Tradução diretamente do latim, incluindo citações e rubricas; preservados os parágrafos e a marcação dos subtítulos, inclusive quando não têm destaque. Citações bíblicas traduzidas segundo o texto citado, com abreviaturas portuguesas e capítulos em algarismos arábicos; referências incompletas ou peculiares do original são conservadas.
- Notas editoriais são omitidas por padrão; nenhum aparato da tradução inglesa é incorporado. Citações de autoridades integradas pelo autor pertencem ao texto e são preservadas.
- Nomes portugueses e vocabulário escolástico seguem as traduções irmãs de Tomás; autor nos metadados: “Santo Tomás de Aquino”. Aspas tipográficas e itálicos das citações mantidos de modo consistente.
- O campo `description` já existe no `book.json` recebido: sua entrada foi localizada, sem criar campo novo. Os títulos descritivos do sumário foram traduzidos das rubricas latinas, mantendo no corpo as traduções das rubricas latinas correspondentes.
- Nenhuma alteração no texto-fonte. Sem execução do build, conforme a instrução desta tarefa.
- Mantidas as particularidades da fonte: o cap. 14 anuncia três aspectos e enumera quatro; o cap. 27 cita Mt 20 para “Quem se humilha”; o cap. 28 atribui a passagem de Dionísio à *Hierarquia Celeste*. Não se corrigiram essas referências. `I Reg.` permanece “1 Rs”, na nomenclatura da Vulgata usada também nas *Instruções Catequéticas*, sem substituir por 1 Samuel.
- No cap. 29, os dois acentos graves isolados antes de `Ex quibus` não foram reproduzidos: são resíduo de marcação, sem conteúdo textual. Os suplementos latinos entre sinais angulares foram integrados normalmente à tradução. A fonte não foi alterada.
- No cap. 30, “estudos” preserva a ambiguidade de *studia* que o autor em seguida esclarece como “dissensões”; não se antecipa essa explicação na primeira citação. *Christianitatem largiri* foi vertido como “ministrar a iniciação cristã”. Nomes latinos de capítulos canônicos (p. ex., ‘Sunt nonnulli’) permanecem como identificadores das referências, não como texto omitido.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo, citações e referências bíblicas, com auditoria mecânica 1–6 e metadados. Veredito: **ISSUES 4**, quatro defeitos corrigidos.
- `ch022.md:7` (P2): “dizer em latim ‘supervisionar’” → “dizer em latim ‘superintendere’ (‘supervisionar’)”. A fonte (`la/ch022.md:7`) diz *latine superintendere dicere possumus*: faltava o vocábulo latino que o autor explica; o português era indevidamente apresentado como latim.
- `ch027.md:29` (P13): “embora se guarde na carne, e por isso seja virgindade corporal, é também espiritual aquela que” → “embora se guarde na carne, também a virgindade corporal é, por isso, espiritual: é aquela que”. Em `la/ch027.md:29`, *ac per hoc etiam virginitas corporalis spiritualis est* conclui o caráter espiritual da virgindade corporal consagrada a Deus; o conector havia sido ligado a “seja virgindade corporal”.
- Termos-chave, linha `actus / habitus / potentia`: “Convenções de Do Ente e da Essência” → atribuição apenas de “ato” e “potência” à obra irmã, identificando “hábito” como escolha desta tradução. A tabela e os capítulos dessa obra não contêm o par *habitus/hábito*; *habitudo* é outro termo. Nenhuma equivalência terminológica foi alterada.
- Decisões, rubricas: “mantendo no corpo as rubricas latinas correspondentes” → “mantendo no corpo as traduções das rubricas latinas correspondentes”. Os corpos trazem rubricas portuguesas, como `la/ch001.md:3` e `pt-BR/ch001.md:3` demonstram.
- Considerado e rejeitado: acrescentar o aparato ou as referências expandidas do inglês. A fonte é o latim; por exemplo, `la/ch006.md:13` tem *I Cor. ult.*, corretamente vertido “no último capítulo de 1 Cor”. A referência precisa do inglês não autoriza acréscimo.
- Considerado e rejeitado: “abaixo de nós” em `ch014.md:9`; `la/ch014.md:9` traz *particulare infra nos constitutum*. A estranheza vem da fonte, não da tradução.
- Considerado e rejeitado: corrigir a enumeração do cap. 14, Mt 20, “Hierarquia Celeste” ou “1 Rs”. As fontes dizem, respectivamente, *tria* (`la/ch014.md:11`) e *Quarto* (`:29`), *Matth. XX* (`la/ch027.md:49`), *Caelestis Ierarchiae* (`la/ch028.md:9`) e *I Reg.* (`la/ch012.md:17`; `la/ch026.md:11`). Preservam-se as particularidades da edição e a nomenclatura declarada.
- Considerado e rejeitado: reproduzir os dois acentos graves de `la/ch029.md:19` antes de *Ex quibus*. São resíduo de marcação sem valor textual; a omissão já justificada no diário é adequada.
- Considerado e rejeitado: “estudos” em `ch030.md:7`; `la/ch030.md:7` explora *studia / studere* e só depois glosa *id est dissensiones*. Antecipar “dissensões” destruiria a discussão do equívoco.
- Considerado e rejeitado: “privação dos jejuns” (`la/ch010.md:29`, *ieiuniorum inediam*) e “velhice / novidade” (`la/ch011.md:11`, *per vetustatem / per novitatem*). O primeiro admite o genitivo descritivo, a privação própria dos jejuns; o segundo conserva a metáfora da condição espiritual antiga/nova. Reformulações mais explícitas seriam melhorias de clareza, não defeitos objetivos confirmados.
- Considerado e rejeitado: exigir igualdade automática de frequências dos Termos-chave. *Habitus* em `la/ch018.md:5` é particípio em *ut supra habitum est* (“como se expôs acima”), e *actus* em `la/ch027.md:15` é particípio em *sursum actus* (“elevada”). Não faltam “hábito” ou “ato” nesses trechos. Em `la/ch014.md:11`, *dilectionis sive amoris* justifica “dileção ou amor”, sem contrariar o uso corrente de “amor”.
- Considerado e rejeitado: converter citações integradas em blocos ou uniformizar o destaque dos identificadores canônicos. As citações continuam dentro dos mesmos parágrafos da fonte; os identificadores já conservam suas palavras latinas. Não há oração ou seção de citação autônoma que exija divisão do parágrafo.
- Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-perfectione-vitae/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, oração por oração, de `la/` e `pt-BR/`, com auditoria mecânica 1–6, metadados e verificação do diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual ou terminológica.
- Considerado e rejeitado: eliminar um “isso” em `ch005.md:5`. A fonte (`la/ch005.md:5`) tem *unde ... hoc*: “Por isso” exprime a consequência e o segundo “isso” retoma a proposição anterior. Há repetição estilística, não erro gramatical comprovado.
- Considerado e rejeitado: exigir “razão” em `ch008.md:21` ou “absolutamente” em `ch013.md:39`. As fontes têm *ea ratione ... quasi* e *simpliciter consideratum*, respectivamente; “como se” conserva a razão hipotética, e “considerada em si mesma” distingue a obra de jejuar do motivo superior de cumprir o voto. Não há perda de conteúdo nem contradição do glossário.
- Considerado e rejeitado: substituir a construção de Ct 8, 7 em `ch016.md:7` pela forma bíblica em que o doador é desprezado. A fonte (`la/ch016.md:7`) diz *Si dederit homo ... despiciet illam*: “ele a desprezará” conserva o homem como sujeito e a riqueza como objeto.
- Considerado e rejeitado: deixar indeterminado “isso último” em `ch016.md:23`. Em `la/ch016.md:23`, *licet hoc perfectius esse videatur* remete à exposição ao perigo de morte; a comparação seguinte, *magis mortem refugiunt quam servitutem*, justifica a explicitação.
- Considerado e rejeitado: completar “mais do que estes” em `ch022.md:13`. A fonte (`la/ch022.md:13`), *diligis me plus his?*, não explicita o segundo termo da comparação; a tradução conserva essa abertura.
- Considerado e rejeitado: alterar “colunas próximas ao altar” em `ch024.md:21`. Em `la/ch024.md:21`, *quasi columnae proximi circa aram*, a concordância latina é com os diáconos; a comparação portuguesa conserva a proximidade deles ao altar, retomada sem ambiguidade em `ch027.md:35`.
- Considerado e rejeitado: substituir “plena noção do governo” em `ch028.md:13`. A fonte (`la/ch028.md:13`) tem *perfectam regiminis rationem*. “Noção” admite o sentido técnico declarado para *ratio*, e o contexto distingue governo principal de serviço auxiliar; o risco de uma leitura coloquial como mero conhecimento não basta para confirmar uma alteração objetiva de sentido.
- Considerado e rejeitado: corrigir “sente-se solitário” em `ch030.md:13`. A fonte (`la/ch030.md:13`) diz *sedeat solitarius et taceat*. “Sente-se” é o subjuntivo jussivo de sentar-se, coordenado a “cale-se”; “sinta-se” mudaria indevidamente o verbo para sentir.
- Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-perfectione-vitae/evidence/review-2.md`.

### Round 3

- Foco: leitura integral a frio de `pt-BR/`, seguida de conferência integral com `la/` e varredura ortográfica, com auditoria mecânica 1–6, metadados e diário. Veredito: **ISSUES 1**, um defeito corrigido.
- `ch006.md:5`: “se nada nos faltar ao amor divino que não refiramos a Deus em ato ou em hábito” → “se nada em nós ficar fora do amor divino, nada havendo que não refiramos a Deus em ato ou em hábito”. A construção anterior quebrava a ligação de “faltar” com seus complementos e com o relativo negativo. A fonte (`la/ch006.md:5`), *si nihil nobis desit ad divinam dilectionem quod actu vel habitu in Deum non referamus*, exige a ordenação integral a Deus, em ato ou hábito, como explicam os quatro desdobramentos seguintes; a correção conserva essa totalidade e ambos os modos, sem exigir referência atual contínua.
- Considerado e rejeitado: uniformizar “são amadas / prendem” em `ch008.md:5`. A fonte (`la/ch008.md:5`) também alterna *diliguntur artius adepta / concupita constringant*: a assimetria pertence à comparação de Agostinho.
- Considerado e rejeitado: explicitar “sua defesa” em `ch010.md:25`. Em `la/ch010.md:25`, *defensionem suam opponebat, ne ... frater absorberetur*, a finalidade identifica o jovem defendido; o português mantém esse contexto suficiente.
- Considerado e rejeitado: substituir os dois “fazê-lo” em `ch013.md:35`. A fonte (`la/ch013.md:35`) tem *ad vovendum / a vovendo*; os pronomes retomam “fazer votos”, expresso nas duas frases anteriores e retomado na conclusão. A referência é recuperável, embora a repetição do substantivo pudesse facilitar a leitura.
- Considerado e rejeitado: uniformizar os modos de “queira / procura / repele” em `ch014.md:29`. A fonte (`la/ch014.md:29`) distingue *ut ... velit* de *sed unusquisque ... procurat et ... repellit*. As ações efetivas podem ser lidas como afirmação coordenada, preservando a alternância do original.
- Considerado e rejeitado: substituir “Por esta” em `ch027.md:25`. Em `la/ch027.md:25`, *propter salutem aliorum; propter quam*, o antecedente é a salvação dos outros, também imediatamente anterior no português.
- Considerado e rejeitado: deslocar “nos sacramentos do altar” em `ch027.md:37`. Em `la/ch027.md:37`, *quo loco martyres, et quo defunctae sanctimoniales ad altaris sacramenta recitentur*, o adjunto indica a menção litúrgica. A elipse portuguesa de “são mencionadas” é recuperável; a frase não exige a leitura de que as religiosas morreram durante os sacramentos.
- Considerado e rejeitado: trocar “de aonde” em `ch030.md:9`. A fonte (`la/ch030.md:9`) diz *Miror ad quid tendat*. “De” rege a oração dependente de admirar-se; “aonde” pertence a chegar, em sentido figurado. Não há regência quebrada.
- Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-perfectione-vitae/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, rubricas e compromissos interpretativos (antecedentes, gênero e tratamento), com leitura integral, auditoria mecânica 1–6, metadados e diário. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual ou terminológica.
- Considerado e rejeitado: trocar “Perdoai-nos” por “Perdoa-nos” em `ch015.md:11`. A fonte (`la/ch015.md:11`) tem *Dimitte nobis debita nostra*; o vós reverencial português pode dirigir-se a Deus no singular. A oração não troca de destinatário nem alterna internamente o tratamento.
- Considerado e rejeitado: trocar “Este” por “Esta” em `ch021.md:5`. A fonte (`la/ch021.md:5`) tem *ex perfectione divinae dilectionis derivatur; quae quidem ... praevalet*. A retomada portuguesa pelo amor divino é justificada pela força desse amor que leva a servir ao próximo, explicitada em seguida por *caritas Christi urget nos*; não há concordância quebrada.
- Considerado e rejeitado: expandir “mais do que estes” em `ch022.md:13`. A fonte (`la/ch022.md:13`), *diligis me plus his?*, mantém aberto o segundo termo da comparação. Já “filho de João” explicita o patronímico *Simon Iohannis*, sem acrescentar um personagem ou mudar o destinatário, identificado como Pedro.
- Considerado e rejeitado: atribuir “seus ensinamentos” aos monges em `ch027.md:15`. Em `la/ch027.md:15`, *qui per eorum traditiones edocetur*, a ordem dos monges é instruída pelos bispos, descritos logo depois como aperfeiçoadores. O possessivo português conserva essa leitura contextual; “elevada” concorda com “ordem”, sem atribuir sexo feminino aos monges.
- Considerado e rejeitado: uniformizar os antecedentes de “suas igrejas”, “não lhes pertencem” e “lhes respondam” em `ch029.md:17`. Em `la/ch029.md:17`, *in ecclesiis suis quae ad eos pleno iure non pertinent ... episcopis ... ut eis de plebis cura respondeant*, os dois primeiros remetem aos religiosos, e o último aos bispos a quem os presbíteros devem responder. O contexto português permite a mesma distinção.
- Considerado e rejeitado: exigir “caridade da verdade” em `ch022.md:7`. A fonte (`la/ch022.md:7`) diz *otium sanctum quaerit caritas veritatis, negotium iustum suscipit necessitas caritatis*. “Amor da verdade” é tradução contextual defensável, ao lado de “necessidade da caridade”; a tabela de termos não declara exclusividade absoluta de uma palavra portuguesa em todos os contextos.
- Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-perfectione-vitae/evidence/review-4.md`.

### Round 5

- Foco: termos, diário e nomes, com leitura integral, contagem terminológica bidirecional por parágrafo, auditoria mecânica 1–6 e metadados. Veredito: **CLEAN**; nenhum defeito objetivo confirmado, nenhuma correção textual, terminológica ou de afirmações do diário.
- Considerado e rejeitado: impor correspondência lexical exclusiva aos termos do glossário. Em `la/ch005.md:11`, *beatorum* justifica “bem-aventurados”, embora o mesmo termo português traduza *comprehensor*; em `la/ch014.md:11`, *dilectionis sive amoris* justifica “dileção ou amor”. São sinônimos expressos na fonte, não troca de conceitos. Mantém-se também a exceção contextual de *caritas veritatis* (`la/ch022.md:7`) já fundamentada na rodada 4.
- Considerado e rejeitado: uniformizar “potência” e “poder”. Em `la/ch004.md:5`, *nullius virtutis finitae potest esse actus infinitus* permite “nenhuma potência finita pode ter um ato infinito”; *potentia naturae* (`la/ch010.md:31`) e *sacerdotalis officii potentia* (`la/ch030.md:9`) designam poder, não a potência contraposta ao ato.
- Considerado e rejeitado: tomar diferenças de contagem por omissão ou acréscimo. *Consilium datur militi* (`la/ch008.md:21`) corresponde a “aconselhar um soldado”; *ad vovendum* (`la/ch013.md:35`), a “a fazer votos”; *statum praelationis* (`la/ch022.md:5`), a “estado de prelado”; *curatum sibi subditum* (`la/ch026.md:15`; `la/ch029.md:17`), a “cura a ele sujeito”. São mudanças gramaticais que conservam o sentido.
- Considerado e rejeitado: exigir apenas “noção” ou “razão” para *ratio*. Em `la/ch030.md:9`, *executionis rationem* é o “fundamento do exercício”; o contexto trata do fundamento da faculdade de exercer as chaves, preservado pela tradução.
- Considerado e rejeitado: expandir ou substituir nomes e títulos segundo o aparato inglês. A fonte tem *Astulpho* (`la/ch012.md:13`), *Therasiam* (`la/ch008.md:5`) e *Armentarium et Paulinam* (`la/ch013.md:47`), corretamente vertidos “Astolfo”, “Terásia” e “Armentário e Paulina”; *Dialogo suo* (`la/ch021.md:23`) permite “seu Diálogo”, sem exigir o título editorial expandido. A ausência de certas formas nas obras patrísticas irmãs não comprova erro.
- Evidência: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__de-perfectione-vitae/evidence/review-5.md`.
