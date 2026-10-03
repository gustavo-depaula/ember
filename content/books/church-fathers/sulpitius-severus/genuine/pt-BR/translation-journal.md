# Diário de tradução — Cartas autênticas (pt-BR)

Fonte canônica: `en-US/ch001.md`, única língua disponível neste livro; não há diretório `la/`.
Destino: `pt-BR/ch001.md`.
Data: 2026-10-02.

## Termos principais

| Inglês | Português | Observação |
|---|---|---|
| Genuine | Cartas autênticas | Título explicita o gênero das três peças |
| Sulpitius Severus | Sulpício Severo | Conforme `life-of-st-martin`, inclusive datas nos metadados |
| St. Martin / Martin | São Martinho / Martinho | Conforme a obra irmã |
| Clarus / Treves | Claro / Tréveris | Conforme a obra irmã |
| Eusebius / Aurelius / Bassula | Eusébio / Aurélio / Bássula | Destinatários |
| bishop / presbyter / deacon | bispo / presbítero / diácono | |
| monastery / cell / sackcloth | mosteiro / cela / pano de saco | Conforme a obra irmã |
| Gentiles / Lamb | gentios / Cordeiro | |
| Matthew / Acts | Mateus / Atos | Referências por extenso, com capítulo:versículo |
| Nero / Decius / Isaiah / Abraham | Nero / Décio / Isaías / Abraão | |
| Condate / Tours / Toulouse | Condate / Tours / Toulouse | Topônimos conservados |

## Decisões de tradução

- Execução individual e sem perguntas. Consultados metadados, termos e capítulos de `sulpitius-severus/life-of-st-martin`, cuja fonte é a tradução inglesa de Alexander Roberts. Adotados aspas curvas, pronomes reverenciais em minúsculas, tratamento singular por tu e plural por vós; saudações com “saúda”.
- Notas editoriais são omitidas por padrão; a fonte não contém notas de rodapé. Conservados os resumos e as saudações como parágrafos próprios, assim como todos os parágrafos longos, sem subdivisão.
- Citações traduzidas da redação fornecida, sem substituí-las por versões bíblicas portuguesas. Na carta 1, preservada a afirmação de que o pregador dos gentios passou três dias e três noites no mar; não se corrige a edição por conjectura. Na carta 2, conservados os cabelos de púrpura da visão.
- Na carta 3, “righteous thong” conserva a imagem jurídica jocosa da “correia justa”; “rich entrance” mantém “rica entrada”, em contraste com a pobreza de Martinho na terra. “Your worldly great men” dirige-se retoricamente ao público mundano no plural; ao fim retorna-se a Bássula no singular.
- Metadados localizados apenas nos campos existentes, sem descrição nova. Não executar build do corpus nem comandos que alterem o estado do Git, conforme instrução desta tarefa.

## Alterações da fonte

Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo; revisão integral e individual, com auditoria mecânica 1–6, metadados e afirmações do diário.
- Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados, termos ou afirmações anteriores.
- Achados considerados e rejeitados (linhas de `en-US/ch001.md`):
  - L7, “(except that, from such cases, the human mind might be instructed as to the dangers connected with shipwrecks and serpents!)”: o aparte permanece em “senão para que [...]”; mudança de pontuação não constitui omissão. O mesmo vale para “(with all respect for the saints on high be it said)” em L17, delimitado por travessões na tradução.
  - L7, “after three days and three nights”, e L17, “with purple hair”: as peculiaridades pertencem à fonte; não substituir por uma versão bíblica ou descrição mais familiar.
  - L15, “sends greeting—”: o ponto final em “saúda o diácono Aurélio.” apenas encerra a saudação; a diferença na contagem automática de frases não indica acréscimo.
  - L23, “his venerable parent”: “sua venerável mãe” é tratamento afetivo defensável para Bássula; o título identifica corretamente a sogra. L25, “with a righteous thong”: “com uma correia justa” conserva a imagem jocosa explícita, ainda que incomum.
  - L27, “Allow me, dear brother”: “Permite-me, querido irmão” conserva o singular da fala mesmo após a menção aos presbíteros no plural. L29, “Your worldly great men”: o plural retórico “os grandes de vosso mundo” é admissível; a última frase volta à destinatária singular.
  - L7, “Truly it is clear” e “all his acts”: “É verdadeiramente claro” e “todos os seus feitos” não são desvios dos pares Clarus/Claro e Acts/Atos; são homógrafos comuns capturados pela busca terminológica sem distinção de maiúsculas.
- Evidências: `.claude/codex-runs/runs/church-fathers__sulpitius-severus__genuine/evidence/review-1.md` (cotejo integral fora do corpus).

### Round 2

- Foco: fidelidade bilíngue, cláusula por cláusula, nas três cartas integrais.
- Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados, termos ou afirmações anteriores.
- Achados considerados e rejeitados (linhas de `en-US/ch001.md`; mantidas também as rejeições fundamentadas da rodada 1):
  - L9, “passed through it with true acceptance”: “o atravessou mostrando-se verdadeiramente aprovado” exprime aprovação após a prova, sustentada por “tried by that danger”; não exige substituir por aceitação voluntária do perigo.
  - L17, “he is second to no one”: “não é inferior a ninguém” conserva a negativa e não afirma superioridade exclusiva.
  - L27, “I have sinned if I leave you a different example”: “terei pecado se vos deixar um exemplo diferente” exprime o resultado da condição ainda futura; não converte a declaração em pecado passado efetivamente cometido.
  - L29, “he looks upon me, as my guardian”: “ele olha por mim, como meu guardião” é sustentado pelo aposto protetor da própria fonte; não acrescenta uma função ausente.
- Evidências: `.claude/codex-runs/runs/church-fathers__sulpitius-severus__genuine/evidence/review-2.md` (cotejo integral e verificações fora do corpus).

### Round 3

- Foco: leitura integral do português sem abrir a fonte, seguida de verificação das marcas na fonte e varredura ortográfica; auditoria mecânica 1–6 e metadados.
- Veredito: **ISSUES 1**. Corrigido um defeito de ligação sintática na carta 2 (`ch001.md`, L17): “tendo atravessado [...] acompanhá-lo, subindo numa nuvem” → “tendo ele atravessado [...] acompanhá-lo em sua subida numa nuvem”. As orações reduzidas ficavam ligadas ao sujeito de “já não pude vê-lo”, o narrador; explicita-se Martinho como quem atravessa o ar e sobe. Fonte L17: “having passed through the vast expanse of the air [...] followed him ascending in a rapidly moving cloud, he could no longer be seen by me”.
- Achados considerados e rejeitados:
  - Carta 1, L9, “impedido pelo perigo iminente”: fonte L9, “being prevented by the pressing danger [...] was longer than he ought to have been in having recourse to the aid of prayer”. A oração principal fornece o ato retardado, recorrer à oração; não é necessário acrescentar um complemento ao particípio.
  - Carta 2, L17, “que aquilo que não posso obter por mim mesmo, ao menos seja considerado digno de alcançar”: fonte L17, “what I cannot obtain of myself, I may, at any rate, be thought worthy of”. “Aquilo” é o objeto anteposto de “alcançar”; o sujeito elíptico continua sendo o narrador, identificável por “por mim mesmo” e pelo contexto. Construção difícil, mas defensável; não alterar por fluência.
  - Carta 3, L29, preferência por entristecer-se e alegrar o outro: fonte L29, “each single person preferred that he himself should grieve, but that another should rejoice”. O paradoxo está na fonte e corresponde ao contraste entre luto e alegria pela glória de Martinho.
- Evidências: `.claude/codex-runs/runs/church-fathers__sulpitius-severus__genuine/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e compromissos de gênero, antecedente e tratamento; revisão integral individual, com auditoria mecânica 1–6, metadados e diário.
- Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados, termos ou afirmações anteriores.
- Achados considerados e rejeitados (linhas de `en-US/ch001.md`):
  - L23, “his venerable parent”: o feminino de “sua venerável mãe” é sustentado por “Mother-In-Law” no título L19; o parentesco afetivo não apaga “sogra” da rubrica. Mantida a rejeição da rodada 1.
  - L27, “Allow me, dear brother”: o vocativo singular autoriza “Permite-me”, embora os presbíteros presentes sejam plurais. L29, “your worldly great men”: “vosso mundo” admite público retórico plural; “upon you while you read them” retorna a Bássula singular. Mantidas as rejeições anteriores.
  - L29, “each single person ... he himself ... another”: “ela própria” e “outra” concordam com “pessoa”; não acrescentam sexo feminino aos participantes.
  - L17, “a disciple of Martin's who had lately died”: a relativa de “discípulo de Martinho que morrera havia pouco” conserva a abertura sintática da fonte; não impõe novo antecedente. “Seu mestre” continua sendo Martinho.
  - L17, “Martin suffered along with him”: “com ele” retoma outro sofredor, e não o sujeito Martinho; trocar por “consigo” mudaria a relação.
  - L17, “as a consequence, indeed as the source”: “como consequência, ou antes, como fonte” explicita a retomada explicativa do próprio inglês; não acrescenta uma alternativa factual.
- Evidências: `.claude/codex-runs/runs/church-fathers__sulpitius-severus__genuine/evidence/review-4.md`.

### Round 5

- Foco: termos, afirmações do diário e nomes próprios; revisão integral individual e auditoria mecânica 1–6 e metadados.
- Veredito: **CLEAN**. Nenhum defeito objetivo confirmado; nenhuma alteração nos capítulos, metadados, termos ou afirmações anteriores.
- Achados considerados e rejeitados (linhas de `en-US/ch001.md`):
  - L7, “Truly it is clear” e “all his acts”: os usos comuns de “claro” e “feitos” não são ocorrências dos nomes Claro e Atos. Mantida a rejeição da rodada 1; as frequências terminológicas correspondem por parágrafo nos dois sentidos.
  - L25, “situated at Toulouse”, e L27, “church at Condate”: conservar Toulouse e Condate não troca os lugares; Toulouse é forma usada em português, e substituir Condate pelo nome moderno seria desnecessário. L29, “cruel Tartarus”: “cruel Tártaro” usa a forma portuguesa correta, mesmo sem ocorrência nas obras irmãs.
  - L29, “your worldly great men”: a inicial maiúscula em excertos do diário não altera a afirmação sobre o tratamento. O mesmo vale para “Aquilo” e “Seu mestre” na discussão de L17. As formas anteriores à correção da rodada 3 estão explicitamente registradas como substituídas, não como texto atual.
- Evidências: `.claude/codex-runs/runs/church-fathers__sulpitius-severus__genuine/evidence/review-5.md`.
