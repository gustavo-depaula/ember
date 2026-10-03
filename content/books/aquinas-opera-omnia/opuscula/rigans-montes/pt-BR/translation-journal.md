# Diário de Tradução — Rigans Montes (Sermão Inaugural I) (pt-BR)

Fonte canônica: `la/rigans-c01.md` (latim, texto Marietti conforme o aparato presente na fonte).
Referência secundária: `en-US/`, somente para registro e terminologia, conforme o precedente de *Do Ente e da Essência*.
Destino: `pt-BR`.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| sacra doctrina | sagrada doutrina | |
| divina sapientia | sabedoria divina | |
| sacri doctores | doutores sagrados | *doctores* = doutores; *doctor doctorum* = mestre dos mestres. |
| Sacra Scriptura | Sagrada Escritura | |
| scientia / intelligentia | ciência / inteligência | Conforme o vocabulário das obras irmãs de Tomás. |
| ratio | razão | Faculdade racional neste sermão. |
| virtus | virtude | Poder operativo, conforme *Das Razões da Fé*. |
| praedicare / legere / disputare | pregar / ensinar pela leitura / disputar | Ofícios do mestre; *lectio* = lição, *disputatio* = disputa. |
| sensus rectitudo | retidão do entendimento | Capacidade de julgar do ouvinte. |
| Dionysius / Augustinus / Gregorius / Damascenus | Dionísio / Agostinho / Gregório / Damasceno | Formas das obras irmãs; autor nos metadados: Santo Tomás de Aquino. |

## Decisões

- 2026-10-02: Tradução integral do latim, com a mesma separação de parágrafos, o subtítulo, o bloco de citação e os destaques. O título inglês presente no arquivo latino é traduzido como “Regando os Montes”. Não se incorporam os subtítulos adicionais da versão inglesa.
- Omitido o aparato editorial: nota bibliográfica inicial e variantes de Estler intercaladas no latim. Conservadas as citações de autoridades que pertencem ao texto de Tomás; nenhuma nota do tradutor acrescentada.
- Citações traduzidas da redação latina fornecida, sem harmonização com uma Bíblia portuguesa. Referências conservam a numeração e as lacunas da fonte, com abreviaturas portuguesas, capítulos arábicos e vírgula entre capítulo e versículo, conforme as obras irmãs.
- *De superioribus suis* = “de suas alturas”; conservada a preposição “de”, decisiva na explicação sobre a participação limitada na sabedoria. *In altum defixi* = “cravados no alto”, conforme a glosa imediata sobre a elevação da vida.
- Conservados *investigabiles* (“investigáveis”, Ef 3), a referência a Ef 4 junto a *parvuli sensibus* e a atribuição à *Regra Pastoral*: não corrigir peculiaridades da edição com base no texto bíblico ou na referência inglesa.
- O campo `description` já existe: acrescenta-se somente sua entrada pt-BR, assim como em `name`, `author` e no título do sumário; inclui-se pt-BR em `languages`.
- Nenhuma alteração na fonte. Build reservado ao orquestrador, conforme instrução do usuário.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo e referências bíblicas; auditoria mecânica e do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, nos metadados ou nos termos-chave.
- Achados considerados e rejeitados:
  - `la/rigans-c01.md:7–99`: nota bibliográfica e variantes marcadas “Estler” ausentes no português. São aparato editorial, cuja remoção é prevista; não constituem omissão autoral.
  - `la/rigans-c01.md:51,53,57,73`: “in pastorali”, “in altum defixi”, “investigabiles” e “Ephes. IV” sustentam respectivamente “Regra Pastoral”, “cravados no alto”, “investigáveis” e “Ef 4”. Não harmonizar com a versão inglesa ou outra redação bíblica.
  - `la/rigans-c01.md:37`: “quae sursum sunt sapite” → “saboreai as coisas do alto”. O sentido sapiencial de saborear/apreciar é defensável; não se confirmou erro de sentido.
  - `la/rigans-c01.md:47`: “non ascendistis ex adverso” → “não subistes ao encontro do inimigo”. Explicitação sustentada pelo contexto imediato de defesa e batalha, não conteúdo novo.
  - `la/rigans-c01.md:93,99`: “ministravit” e “qui faciunt” sustentam “me serviu” e “que fazem”. O passado e a terceira pessoa pertencem à fonte canônica, mesmo quando a referência inglesa diverge.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__rigans-montes/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, cláusula por cláusula, contra o latim canônico; auditoria mecânica e do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, nos metadados ou nos termos-chave.
- Achados considerados e rejeitados:
  - `la/rigans-c01.md:43`: “nostra autem conversatio in caelis est” → “a nossa vida está nos céus”. *Conversatio* admite vida/conduta; não exige “conversação” nem a harmonização bíblica “cidadania”.
  - `la/rigans-c01.md:55`: “nisi in vitae altitudine defigatur” → “se não estiver fixado na elevação da vida”. O sujeito continua sendo *cor*, não o doutor; a tradução mantém a condição e o sujeito.
  - `la/rigans-c01.md:77`: “per quam ex paucis auditis multa bonus auditor annuntiet” → “pela qual, a partir de poucas coisas ouvidas, o bom ouvinte anuncia muitas”. O presente geral é defensável nesta relativa caracterizadora; o subjuntivo latino não obriga a transformar a descrição em ordem ou finalidade explícita.
  - `la/rigans-c01.md:81`: “superiora montibus influens” → “fazendo fluir as alturas sobre os montes”. *Superiora* é objeto, contrastado com o partitivo *de superioribus*; a formulação conserva o contraste do argumento e não deve ser substituída pela leitura inglesa.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__rigans-montes/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral do pt-BR, verificação posterior no latim e varredura de ortografia, diacríticos, crase, hifenização e pontuação; auditoria mecânica e do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção no capítulo, nos metadados ou nos termos-chave.
- Achados considerados e rejeitados:
  - `la/rigans-c01.md:45`: “mentium splendorem” sustenta “esplendor das mentes”; a imagem incomum não exige substituir o complemento por “nas mentes”.
  - `la/rigans-c01.md:57`: “investigabiles divitias Christi” sustenta “investigáveis riquezas de Cristo”; a suspeita da leitura fria não autoriza inserir a negação ausente na fonte, conforme a rejeição da rodada 1.
  - `la/rigans-c01.md:79`: “Ordo autem generationis” sustenta “A ordem da geração”; trocar geração por comunicação apagaria uma distinção lexical da fonte.
  - `la/rigans-c01.md:17,55,71,75,83,103`: “qui ... quorum”, “cor”, “debent”, “quod ... hi sunt”, “eam” e “Debet autem petere ... Nobis Christus concedat” não deixam pronomes ou sujeitos irrecuperáveis no português: doutores, coração, ouvintes, predicativo plural, ciência e suficiência/sabedoria são recuperáveis pelo contexto. A concordância de “o que caiu ... são aqueles” com o predicativo é admissível; “pedi-la”, “peça-a” e “no-la” estão corretamente hifenizados.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__rigans-montes/evidence/review-3.md`.
