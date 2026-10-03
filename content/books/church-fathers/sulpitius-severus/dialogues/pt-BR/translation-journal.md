# Diário de tradução — Diálogos (pt-BR)

Fonte canônica: `en-US/ch001.md`, `ch002.md` e `ch003.md`; o livro não possui diretório `la/`.
Destino: `pt-BR`. Data: 2026-10-02.

## Termos principais

| Fonte | Português | Observação |
|---|---|---|
| Sulpitius Severus | Sulpício Severo | Conforme a Vida de São Martinho deste autor |
| Martin / St. Martin | Martinho / São Martinho | Sem acrescentar título |
| Postumianus / the Gaul | Postumiano / o gaulês | Interlocutores |
| Hieronymus / Jerome | Jerônimo | As duas formas designam a mesma pessoa |
| bishop / presbyter / priest | bispo / presbítero / sacerdote | Conforme a obra irmã |
| monastery / cell | mosteiro / cela | |
| anchorite / recluse / eremite | anacoreta / solitário / eremita | Conforme o contexto |
| virtues | virtudes / poderes | Qualidade moral ou poder de operar milagres |
| vanity / spurious righteousness | vaidade / falsa justiça | |
| Gaul / Treves | Gália / Tréveris | Conforme a obra irmã |
| Paulinus / Arborius / Maximus / Valentinian | Paulino / Arbório / Máximo / Valentiniano | Conforme a obra irmã |
| Anthony / Agnes / Thecla / Cyprian | Antão / Inês / Tecla / Cipriano | Nomes portugueses |
| Refrigerius / Evagrius / Aper / Sabbatius | Refrigério / Evágrio / Apro / Sabácio | Interlocutores e testemunhas |
| Avitianus / Brictio / Ithacius / Theognitus | Aviciano / Brício / Itácio / Teognito | |
| Priscillian / Victricius / Valentinus | Prisciliano / Vitrício / Valentim | |
| chief-deacon / catechumen | arquidiácono / catecúmeno | |
| communion / communicate | comunhão / comungar | Também comunhão eclesial no episódio de Itácio |
| pounds of silver | libras de prata | Medida de peso; não moeda moderna |
| Calupio | Calupião | Diácono de III, 1; forma portuguesa atestada em estudo dos Diálogos (ver Round 5) |

## Decisões

- Tradução integral e individual, sem perguntas nem agentes auxiliares. Notas editoriais são omitidas por padrão; esclarecimentos integrantes dos parágrafos são preservados.
- Consultados os capítulos, termos e metadados de `life-of-st-martin`, cuja fonte é a mesma tradução inglesa de Alexander Roberts. Adotados nomes portugueses, aspas curvas, pronomes reverenciais em minúsculas e tratamento por tu/vós. Referências bíblicas conservam posição e numeração, com nomes portugueses dos livros; citações seguem a redação fornecida.
- Preservados arquivos, títulos, parágrafos e ordem da fonte; capítulos internos permanecem títulos, não listas numeradas. Os parágrafos longos não são subdivididos.
- Apenas campos existentes de `book.json` recebem localização; a descrição bibliográfica da fonte permanece intacta. Não executar build nem comandos que alterem o estado do Git, conforme instrução.

- Não há notas de rodapé nem referências bíblicas numéricas nos três arquivos. As alusões evangélicas e a citação sobre julgar os anjos permanecem sem acrescentar referências. Mantidos os dois subtítulos em negrito dos diálogos II e III e o subtítulo em nível 2 do diálogo I.
- Mantidos os detalhes e afirmações peculiares da edição: “Arriana” como nome da esposa de Valentiniano (II, 5), “cabeleira” para a chama descrita como “hair” (II, 2), as previsões sobre Nero e o Anticristo (II, 14), as duas Espanhas e os dezesseis anos finais (III, 11–13). Não se substituem por reconstruções históricas.
- Em I, 15, “through the instrumentality of the best” foi entendido contextualmente como “por intermédio da fera”: a leoa acaba de oferecer a pele. A grafia inglesa permanece intacta; não foi necessário emendar a fonte para exprimir seu referente inequívoco. Em III, 8, o aparte com parêntese sem fechamento é pontuado com travessões completos em português; em III, 16, o ponto isolado de “and. directed” não é reproduzido.
- Conservado *tripets*, termo gaulês explicitamente explicado pela comparação com *trípodes* (II, 1); *status*, usado no inglês como substantivo, é traduzido por *condição* (III, 12). “Family” é traduzido por “casa” quando designa o conjunto doméstico, sem inventar parentescos.

## Alterações da fonte

Nenhuma.

## Estrutura final

| Arquivo | Títulos fonte / destino | Parágrafos fonte / destino |
|---|---:|---:|
| ch001.md | 29 / 29 | 52 / 52 |
| ch002.md | 15 / 15 | 22 / 22 |
| ch003.md | 19 / 19 | 30 / 30 |

Os parágrafos incluem os subtítulos em negrito de II e III. Sequência de blocos preservada, totalizando 63 títulos e 104 parágrafos em cada idioma.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo, referências bíblicas e auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: **ISSUES 6** — seis defeitos corrigidos em `pt-BR/ch001.md`.

Defeitos corrigidos:

1. `ch001.md:43, Chapter 6., P14`: “reunidos em numerosos sínodos” → “reunidos em sínodos muito concorridos”. Fonte: “crowded synods”. O adjetivo descreve a afluência aos sínodos, não o número de sínodos; recuperada essa informação.
2. `ch001.md:51, Chapter 8., P16`: `é lido no mundo inteiro.` → `é lido no mundo inteiro.”`. Fonte: “since he is, in fact, read the whole world over.”. Fechada a fala de Postumiano antes da resposta do gaulês em I, 8; a abertura acrescentada em I, 5 ficava sem fechamento na troca de interlocutor.
3. `ch001.md:69, Chapter 10., P23`: “aproximando-se de seus próprios pés” → “aproximando-se até os pés deles”. Fonte: “moving up to their very feet”. A serpente aproxima-se dos pés dos meninos; “seus próprios pés” atribuía reflexivamente os pés à serpente.
4. `ch001.md:79, Chapter 12., P26`: “do que o atacado” → “do que tê-lo atacado”. Fonte: “he rather pitied than inveighed against the fugitive”. Corrigida a colocação do pronome: ele não pode ser anteposto ao particípio “atacado”; o infinitivo composto mantém o contraste entre compadecer-se e atacar.
5. `ch001.md:105, Chapter 16., P35`: “sendo, porém, mais admirador das virtudes alheias do que fazendo eu próprio qualquer tentativa de manifestar” → “porém, mais admirando as virtudes alheias do que tentando eu próprio manifestar”. Fonte: “being, however, rather an admirer of the virtues of others, than myself making any attempt to manifest”. Reparada a coordenação comparativa quebrada entre predicativo nominal (“sendo ... admirador”) e gerúndio (“fazendo”); preservado o contraste entre admirar e tentar imitar.
6. `ch001.md:161, Chapter 27., P52`: “passarei por seus primeiros feitos” → “omitirei seus primeiros feitos”. Fonte: “I shall pass over his early achievements”. “Pass over” anuncia a omissão dos primeiros feitos, em paralelo com “nor will I touch”; “passarei por” não exprimia essa omissão.

Achados considerados e rejeitados:

- Fonte `ch001.md:101, Chapter 15., P34`: “through the instrumentality of the best”; tradução: “por intermédio da fera”. O contexto imediato é a leoa que oferece a pele; mantida a interpretação já justificada no diário, sem alterar a fonte.
- Fonte `ch002.md:11, Chapter 2., P03`: “the flame produced a hair”; tradução: “a chama produziu uma cabeleira”. Reprodução da imagem peculiar da fonte; não substituir por outra descrição do prodígio.
- Fonte `ch002.md:27, Chapter 5., P08`: “his wife Arriana”; tradução: “sua esposa Arriana”. O inglês apresenta a palavra como nome; não reconstruir a história ou substituir pela religião da esposa.
- Fonte `ch003.md:41, Chapter 8., P12`: “(if I may ... hardly Latin ,”; tradução: “— se me é permitido ... mal é latina —”. O aparte integral permanece; o fechamento do travessão sana apenas a pontuação no destino.
- Fonte `ch003.md:65, Chapter 12., P20`: “as respected the *status* of every one of them”; tradução: “para a *condição* de cada um deles”. “Status” funciona como substantivo inglês nesse contexto, não como citação latina a conservar; decisão existente defensável.
- Fonte `ch001.md:65, Chapter 9., P22`: “my whole family”; tradução: “toda a minha família”. A fonte não decide se o conjunto inclui parentes, dependentes ou ambos. A forma coletiva não inventa parentes individuais; não impor “casa” em toda ocorrência.
- Fonte `ch002.md:67, Chapter 13., P20`: “he kept his place at a distance from the rest”; tradução: “Martinho se mantinha afastado dos demais”. O retiro habitual, a notícia do anjo e a última frase sustentam Martinho como antecedente; a ocorrência adicional do nome esclarece um pronome.
- Fonte `ch003.md:61, Chapter 11., P19`: “being obnoxious to the bishops, he could not be reconciled to them”; tradução: “sendo Martinho odioso aos bispos, não podia reconciliar-se com eles”. Martinho é o adversário dos bispos no episódio; explicitação sustentada pelo contexto.
- Fonte `ch001.md:83, Chapter 12., P28`: “Sulpitius, what you request, as I see you are all so desirous”; tradução: “Sulpício, o que pedes, pois vejo que todos desejais”. Tu dirige-se a Sulpício e vós inclui os ouvintes; as alternâncias de I, 1–2 e I, 12 são compatíveis com essa audiência, não erro de concordância.
- Fonte `ch003.md:69, Chapter 13., P21`: “ordination of Felix as bishop”; tradução: “ordenação episcopal de Félix”. A ocorrência inglesa de bishop está representada pelo adjetivo episcopal, não omitida.
- Fonte `ch001.md:73, Chapter 11., P24`: “As they enter the cell together”; tradução: “Ao entrarem juntos”. “Cela” é objeto explícito da frase imediatamente anterior; a elipse portuguesa preserva a entrada no mesmo lugar.
- Fonte `ch002.md:59, Chapter 11., P18`: “the nunnery of the young women”; tradução: “o mosteiro das jovens”. A ocorrência adicional de mosteiro corresponde a nunnery, sem adição de lugar.
- Aspas continuadas: fonte `ch001.md:65–77, 87–127, 131–135, 145–149` (I, 9–12, 12–21, 21–22 e 24–25), e `ch002.md:27–31, 67–71` (II, 5–6 e 13–14): reabertura de aspas em parágrafo novo do mesmo interlocutor não exige fechamento do parágrafo anterior. Não confundir com a troca de falante corrigida em I, 8.
- Diferenças de frases rejeitadas como lacunas: fonte `ch001.md` P04/P26/P45, `ch002.md` P05 e `ch003.md` P07/P08/P23/P27. São mudanças de pontuação, a abreviação “viz.” e o ponto isolado em “and. directed” (III, 16, fonte L87); as proposições permanecem. Evidência contém cada par integral e a explicação específica.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, oração por oração, e auditoria mecânica 1–6, metadados, termos e afirmações do diário.
- Veredito: **ISSUES 2** — dois defeitos corrigidos em `pt-BR/ch002.md`.

Defeitos corrigidos:

1. `ch002.md:31, II, 6`: “uma obteve o desejo de ouvir um sábio” → “uma realizou seu desejo de ouvir um sábio”. Fonte: “the one obtained her desire to hear a wise man”. A rainha conseguiu o que desejava, isto é, ouvir o sábio; não adquiriu o desejo de ouvi-lo.
2. `ch002.md:37, II, 7`: “e isso aos setenta anos” → “e isso em seu septuagésimo ano de vida”. Fonte: “and that when in his seventieth year”. O ordinal indica o ano de vida em curso, não setenta anos completos; recuperada a indicação exata da fonte.

Achados considerados e rejeitados:

- Fonte `ch001.md:101, I, 15`: “We arrived at the den”; “Chegamos à toca” preserva a primeira pessoa da edição, embora o episódio seja apresentado como relato de terceiros. Não substituir por terceira pessoa.
- Fonte `ch002.md:13, II, 2`: “a boy belonging to my uncle’s family”; “um menino da casa de meu tio” não identifica parentesco que o coletivo inglês deixa aberto. Não substituir por filho ou primo.
- Fonte `ch002.md:31/37, II, 6–7`: “frequently sent for Martin” e “once in his life only” referem-se, respectivamente, aos convites do rei e ao serviço pessoal da rainha. A aparente divergência de frequência não justifica harmonizar os relatos.
- Fonte `ch003.md:37, III, 7`: “Romulus, the son of that Auspicius I mentioned, an honored and religious man”. A aposição “homem honrado e religioso” conserva a abertura do inglês; não há erro de referente confirmado.
- Fonte `ch003.md:79, III, 14`: “with outspread legs and exposed person”. “Com as pernas abertas e as partes íntimas expostas” explicita o sentido de person sustentado pela exposição indecorosa censurada em seguida; não acrescenta um acontecimento.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral do pt-BR antes de abrir os capítulos da fonte, seguida de verificação das marcas no inglês e varredura separada de ortografia, diacríticos, crase, hífen, pontuação e aspas; auditoria mecânica 1–6, metadados e diário.
- Veredito: **ISSUES 1** — um defeito de sintaxe corrigido em `pt-BR/ch003.md`.

Defeito corrigido:

1. `ch003.md:33, III, 6`: “nem repreendia ninguém com palavras, como a multidão de expressões geralmente proferidas pelos clérigos” → “nem repreendia ninguém com palavras, como fazem os clérigos com a multidão de expressões que geralmente proferem”. Fonte: “reproached no one in words, as a multitude of expressions is generally rolled forth by the clerics”. A comparação estava sem ligação sintática entre a ação e os clérigos que a praticam; restaurado o predicado comparativo, preservando a profusão verbal habitual da fonte.

Achados considerados e rejeitados:

- Fonte `ch001.md:91, I, 13`: “the only kind of tree [...] even these are rare”. Em “mesmo elas são raras”, o pronome retoma as árvores da espécie, as palmeiras do contexto; não é concordância com o singular “espécie”.
- Fonte `ch001.md:109, I, 17`: “Amid much talk which the two had together”. “As muitas coisas que conversaram” admite o uso transitivo de conversar com conteúdo como objeto, registrado nos dicionários; “sobre as quais conversaram” seria alternativa, não correção obrigatória.
- Fonte `ch002.md:17, II, 3`: “some necessity or other [...] compelling us to keep behind”. Em “tendo alguma necessidade [...] obrigado a nós a ficar para trás”, necessidade é sujeito e “a nós” é objeto direto preposicionado tônico; não falta obrigatoriamente um clítico.
- Fonte `ch003.md:57, III, 10`: “testifies that he saw [...] and that [...] he heard”. “Testemunha ter visto [...] e que [...] ouviu” coordena complementos de formas diferentes sem inverter os agentes: Martinho move a mão, Arbório vê e ouve.
- Fonte `ch003.md:61, III, 11`: “both of whom had belonged [...] and who had thus incurred”. “Ambos pertencentes [...] e que assim haviam incorrido” mantém Narses e Leucádio como antecedentes da relativa, apesar do inciso extenso; reordenar seria estilístico.
- Fonte `ch003.md:65, III, 12`: “went in terror to the king”. “Foram aterrorizados ao rei” emprega ir com predicativo dos bispos; não é passiva incompleta de aterrorizar.
- Fonte `ch001.md:105, I, 16`: “an Ibex”. “Íbex” tem acento dicionarizado; não substituir por ibex nem impor a variante íbice.
- Fonte `ch001.md:109, I, 17`: “covered with bristles growing on his own body”. “Pelos pelos” combina preposição/artigo com o substantivo; a repetição é legítima e o substantivo segue a grafia sem acento diferencial.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-3.md`.


### Round 4

- Foco: palavras funcionais, títulos/rótulos, referentes e escolhas obrigatórias de gênero e tratamento, com rastreamento dos destinatários; auditoria mecânica 1–6, metadados, termos e afirmações do diário.
- Veredito: **ISSUES 2** — dois defeitos corrigidos em `pt-BR/ch001.md`.

Defeitos corrigidos:

1. `ch001.md:9, I, 1`: “tomando-me pela mão” → “segurando-me com a mão”. Fonte: “laying hold of me with your hand”. A mão é instrumento de Sulpício, não a parte do corpo de Postumiano que ele segura. A preposição anterior impunha um detalhe que a fonte deixa aberto; restaurada a relação instrumental.
2. `ch001.md:61, I, 9`: “também essas pessoas, por sua vez, manifestam sua cólera” → “também essas pessoas, por sua vez, segundo se diz, manifestam sua cólera”. Fonte: “so those people, again, are said to express their rage”. Restaurada a atribuição a relato alheio, omitida na afirmação direta portuguesa; o “diz-se” da frase anterior se refere à estima por Jerônimo, não substitui esta ressalva explícita sobre a cólera.

Achados considerados e rejeitados:

- Fonte `ch002.md:7, II, 1`: “Let the garment which has been got ready [...] be brought to me”. “Tragam-me a veste” usa agente indeterminado para a passiva, não tratamento plural dirigido ao único diácono. O “Vê” da resposta dirige-se singularmente a Martinho; não há mudança indevida para vocês.
- Fonte `ch002.md:43, II, 8`: “I had often heard her blaming others who acted in such a manner”. “Outras” é leitura contextual defensável das mulheres que se conduziam como a virgem censurada; a sequência sobre viúva, virgem e familiaridades sustenta o feminino sem identificar pessoas. Não há base suficiente para impor “outros”.
- Fonte `ch002.md:45, II, 8`: “a possessed person [...] the person was cured”. “Um possesso [...] a pessoa ficou curada” emprega masculino genérico da categoria e feminino gramatical de pessoa; não afirma sexo ou parentesco do enfermo.
- Fonte `ch002.md:59, II, 11`: “she maintains her chastity; and the first excellence, as well as completed victory of that”. “Dessa castidade” explicita o antecedente imediato, cuja preservação é a vitória descrita; não precisa ser substituído por referência à ausência do marido.
- Fonte `ch002.md:63, II, 12`: “the excellence of those others, who often came from remote regions”. “Daquelas outras” retoma as virgens visitantes da comparação, não os sacerdotes mencionados no meio da argumentação; o contexto sustenta a escolha feminina.
- Fonte `ch003.md:41, III, 8`: “Blowing upon him [...] Avitianus thought that he was blowing at *him*”. “Soprou sobre ele [...] Aviciano pensou que soprava sobre *ele*” conserva o equívoco intencional: o alvo real é o demônio, o alvo presumido é Aviciano. A resposta seguinte distingue ambos; não substituir o primeiro referente por Aviciano.
- Fonte `ch003.md:57, III, 10`: “showed Christ also working in him, who, glorifying his own holy follower everywhere, conferred upon that one man the gifts of various graces”. A explicitação “Cristo, glorificando” resolve a relativa pelo agente que concede graças a seu seguidor Martinho; não acrescenta um segundo agente nem atribui a autoglorificação a Martinho.
- Fonte `ch003.md:91, III, 17`: “the volume of discourse which we either completed yesterday, or have said today. You will relate all to him”. “Tanto o que concluímos ontem como o que dissemos hoje” mantém a enumeração inclusiva das duas jornadas, confirmada pelo “all” seguinte; não é necessário transformar a entrega integral em alternativa exclusiva.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-4.md`.


### Round 5

- Foco: termos por parágrafo em ambas as direções, afirmações do diário e nomes próprios, com auditoria mecânica 1–6 e metadados.
- Veredito: **ISSUES 1** — um nome corrigido; correspondência acrescentada aos Termos principais.

Defeito corrigido:

1. `pt-BR/ch003.md:9, III, 1`: “Calúpio” → “Calupião”. Fonte: “with Calupio the deacon”. A forma portuguesa do nome desse diácono é Calupião, atestada no estudo de Figuinha, *O monasticismo de Martinho de Tours e as aristocracias na Gália do século IV*, p. 21 ([Revista Brasileira de História](https://www.scielo.br/j/rbh/a/9xxqvHXrPLBKZBrjBXn5frw/?lang=pt)). Não há ocorrência nas obras irmãs que sustente a forma anterior.

Achados considerados e rejeitados:

- Fonte `ch001.md:9/27`: “making for Narbonne” / “setting sail from Narbonne”. Mantido Narbonne: a Infopédia registra Narbona, mas também emprega Narbonne no próprio artigo em português; a forma conservada identifica corretamente o porto, sem erro objetivo demonstrado.
- Fonte `ch003.md:65`: “pertinacity of Theognitus” / “Theognitus had created disunion”. Mantido Teognito, forma portuguesa atestada; não substituir a grafia da edição por Teognosto, nem impor acento sem fundamento suficiente.
- Fonte `ch003.md:9`: “Aper, Sabbatius, Agricola”, “Amator the subdeacon” e “admit Eucherius”. Apro, Amador e Euquério são adaptações portuguesas defensáveis; a retenção de Aper e Amator em estudo histórico não torna obrigatória a latinização desses nomes.
- Fonte `ch001.md:69`: “a solitary life”; `ch002.md:59`: “nunnery”; `ch003.md:31/47`: “miraculous powers” / “powers of heaven”. Solitária, mosteiro e poderes têm aqui fontes próprias legítimas; a tabela não impõe exclusividade lexical que proíba essas correspondências. Todas as ocorrências de “virtues” estão como “virtudes”; “poderes” na tabela é alternativa de sentido, não afirmação de ocorrência neste livro.
- Fonte `ch003.md:69`: “his communicating” → “sua participação na comunhão”. A nominalização explica simultaneamente uma ocorrência a menos de comungar e uma a mais de comunhão; não omite o ato. Mantêm-se as elipses e explicitações já justificadas no Round 1.
- Formas anteriores às correções e alternativas rejeitadas nos logs não descrevem o texto atual. Fonte `ch002.md:13`: “my uncle's family”; o apóstrofo tipográfico do Round 2 não altera a citação. Fonte `ch003.md:41`: “Blowing upon him”; “Soprou sobre ele” no Round 4 abrevia “Quando soprou sobre ele de longe”, sem mudar o referente. As reticências dos logs indicam excertos descontínuos, não lacunas dos capítulos.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-5.md`.


### Round 6

- Foco: completude parágrafo por parágrafo, citações, apartes e referências bíblicas; auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: **CLEAN** — nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados ou Termos principais.

Achados considerados e rejeitados:

- Diferenças de contagem de frases: fonte `ch001.md:13/79/139`, `ch002.md:17` e `ch003.md:23/75`. Pontos, exclamações e atribuições de fala redistribuem as frases, sem eliminar ou acrescentar proposições; os parágrafos permanecem individuais. Em `ch003.md:87`, o ponto de “and. directed” é pontuação defeituosa da fonte, não conteúdo omitido.
- Aparente falta de parênteses: fonte `ch001.md:7/27/95/117/123/135/141/145/153`, `ch002.md:7/31/59/63/67` e `ch003.md:17/41/55/79/83`. Os apartes estão integralmente vertidos como incisos, travessões ou intervenções do narrador; a troca do delimitador não os suprime. Mantida a justificativa anterior para o parêntese aberto de III, 8.
- Aparente falta de termos estrangeiros: fonte `ch002.md:7`, “tripets” / “tripods”, e `ch003.md:65`, “status”. O termo gaulês permanece; “trípodes” traduz o substantivo inglês, e “condição” traduz o uso substantivo integrado à frase, conforme decisão já registrada. Não há frase latina ou grega omitida.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-6.md`.


### Round 7

- Foco: leitura bilíngue integral, oração por oração, de fidelidade; auditoria mecânica 1–6, metadados, termos por parágrafo, referentes/tratamentos e afirmações do diário.
- Veredito: **CLEAN** — nenhum defeito objetivo confirmado; nenhuma alteração nos capítulos, metadados ou Termos principais.

Achados considerados e rejeitados:

- Fonte `ch002.md:21`, II, 4: “no one in that village was acquainted with a Christian”. “Ninguém naquela aldeia conhecia um cristão” conserva a relação de conhecimento; substituir por “ninguém era cristão” mudaria a afirmação da edição.
- Fonte `ch002.md:55`, II, 10: “she had two coats, and one of them she has given to him who had none”. O passado em “tinha duas túnicas e deu uma delas” corresponde à aplicação do preceito à ovelha; não substituir pela formulação bíblica imperativa.
- Fonte `ch003.md:51`, III, 9: “Serpents hear me, but men will not hear.” “Os homens não querem ouvir” exprime o sentido volitivo defensável de will not, sustentado pelo contraste moral e pela lamentação; não é obrigatório empregar futuro.
- Fonte `ch003.md:69`, III, 13: “through necessity, and not with a cordial spirit”. “Por necessidade e não de coração” preserva o contraste entre necessidade e adesão interior voluntária; cordial não exige aqui o sentido de amabilidade social.
- Evidência: `/Users/gustavo/Documents/prayer/.claude/worktrees/expressive-pondering-dragonfly/.claude/codex-runs/runs/church-fathers__sulpitius-severus__dialogues/evidence/review-7.md`.
