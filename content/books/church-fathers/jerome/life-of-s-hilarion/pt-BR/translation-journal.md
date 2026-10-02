# Diário de tradução — Vida de Santo Hilarião (pt-BR)

Fonte exclusiva: `en-US/ch001.md`. Destino: `pt-BR/ch001.md`.

## Termos e precedentes

Consultados os metadados, o diário e o capítulo de `jerome/perpetual-virginity-of-blessed-mary` e, para o vocabulário monástico, `athanasius/vita-s-antoni`. Ambos identificam em `sources` suas traduções inglesas de origem.

| Inglês | Português | Observação |
|---|---|---|
| Jerome | São Jerônimo | Autor nos metadados, como na obra irmã |
| Hilarion / Antony | Hilarião / Antão | Santo Hilarião no título; Antão conforme a vida de Atanásio |
| blessed / saint | bem-aventurado / santo | Sem acrescentar títulos ausentes |
| Hesychius / Aristæneté | Hesíquio / Aristenete | |
| monk / monastery / cell | monge / mosteiro / cela | Convenção de Atanásio |
| discipline / brethren / old man | ascese / irmãos / ancião | Conforme o contexto |
| sackcloth / cowl / cloak | cilício / capuz / manto | Cilício como tecido áspero, não instrumento metálico |
| Saracens / Gentiles | sarracenos / gentios | Vocabulário histórico da fonte |
| Majoma / Majuma | Maioma / Maiuma | Variantes da fonte preservadas |

## Decisões — 2026-10-02

- Tradução integral, feita nesta sessão sem subagentes nem perguntas. Introdução editorial mantida como texto da fonte. Política padrão: excluir notas editoriais de rodapé; o arquivo não contém notas. Sem notas do tradutor.
- Mesmos parágrafos, ordem e título; números autorais em negrito inerte. Aspas curvas “ ” e pronomes reverenciais em minúsculas, como na obra irmã de Jerônimo.
- Citações traduzidas do inglês, sem substituição por uma versão bíblica. Referências na mesma posição, com nomes portugueses (Mateus, Lucas, Isaías, Êxodo, 2 Tessalonicenses) e números inalterados, inclusive Mateus 14:32 (§41).
- Unidades da fonte mantidas (milhas, pés, onças, libras, pintas e alqueires), sem conversão aproximativa. Preservadas as cronologias e identificações históricas da edição, inclusive os intervalos de idade do §11 e França/francês no §22.
- Metadados: acrescentado pt-BR apenas a `name`, `author`, `languages` e títulos do sumário; sem criar descrição. Build reservado ao orquestrador, conforme instrução do usuário.

## Expressões e particularidades

- `life and conversation` (§1): “vida e conduta”, no sentido antigo de comportamento; `king's-evil` (§34): “escrófulas”.
- `team` (§20): “atrelagem”, sem especificar um número de cavalos que o inglês não fornece; `flagons` (§27): “cântaros”.
- Conservados em itálico o siríaco *Barech*, com a glosa “Abençoa”, e o nome *boas* das serpentes (§39), ligado pelo texto à imagem dos bois. Não restam trechos ingleses sem tradução.

## Alterações na fonte

- §31: `was hidden by Antony to stand still` → `was bidden by Antony to stand still`. Confusão gráfica inequívoca de h/b: o animal recebe ordem de ficar parado, não é escondido. Única correção no inglês.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo, incluindo citações, apartes, expressões estrangeiras e referências bíblicas; auditoria mecânica 1–6 e metadados.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma correção nos capítulos, metadados ou termos/afirmações anteriores deste diário.
- Suspeitas consideradas e rejeitadas (linhas de `en-US/ch001.md`):
  - Apartes sem parênteses no alvo: §§5, 13–15, 17, 22, 25, 27, 30, 37, 43–44 (linhas 13, 29–33, 37, 47, 53, 57, 63, 77, 89–91). O conteúdo de todos os apartes da fonte permanece, delimitado por vírgulas ou travessões; a mudança de pontuação não é omissão.
  - Contagem de frases do §21 (linha 45): `howl and confess.` tornou-se `uivar e confessar:`, introduzindo a fala seguinte. A diferença de um terminal de frase não representa conteúdo perdido nem fusão de parágrafos.
  - Aparente divergência no glossário: `blessed` é verbo nos §§27, 30 e 32 (linhas 57, 63, 67), corretamente traduzido por formas de “abençoar”; a equivalência “bem-aventurado” refere-se ao adjetivo. `professed themselves monks` (§14, linha 31) e `monk's life` (§33, linha 69) aparecem como “professaram a vida monástica” e “vida monástica”, sem perda de sentido. Os demais excedentes lexicais de “santo”, “irmãos” e “ancião” correspondem a `holy`/`saintly`, `brothers` e `aged`, ou à explicitação de Antão em `his burial place` (§31, linha 65), não a conteúdo acrescentado.
  - Particularidades da fonte: intervalos de idade do §11 (linha 25), `France`/`French` do §22 (linha 47), `fasting-time, that is, after sunset` do §30 (linha 63) e `Matthew 14:32` do §41 (linha 85). O alvo conserva essas informações; não cabe corrigir a edição por plausibilidade histórica, cronológica ou por outra redação bíblica.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__jerome__life-of-s-hilarion/evidence/review-1.md` (fora do corpus).

### Round 2

- Foco: leitura bilíngue integral, frase por frase e oração por oração; auditoria mecânica 1–6, metadados e afirmações verificáveis do diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; nenhuma alteração nos capítulos, metadados ou termos/afirmações anteriores do diário.
- Suspeitas consideradas e rejeitadas (linhas de `en-US/ch001.md`):
  - §10, linha 23: `which he had once put on` → “que vestira de uma vez por todas”. O contexto é a continuidade do uso sem lavagem, com troca expressamente admitida quando a túnica se tornava farrapos; a expressão não suprime essa condição.
  - §11, linha 25: `at times when others are wont to allow themselves some laxity of living` → “na idade em que outros costumam permitir-se algum relaxamento na vida”. A velhice é o contexto imediato; leitura temporal defensável, sem perda de um acontecimento ou condição específica.
  - §17, linha 37: `told the Father` → “avisaram o Padre”. Título de pai monástico no contexto; não afirma ordenação sacerdotal.
  - §30, linha 63: `kept dromedaries which were hired [...] to carry travellers` → “possuía dromedários alugados [...] para transportar os viajantes”. A construção admite animais de sua propriedade postos em locação; não exige a leitura de animais alugados por ele.
  - §41, linha 85: `Are these more than the army of Pharaoh?` → “São estes mais numerosos que o exército do faraó?” Comparação quantitativa defensável entre os piratas e um exército; a fonte não obriga “mais fortes”.
  - §43, linha 89: `who he was, or how he had been brought` → “quem era e como havia sido trazido”. A coordenação reúne as duas perguntas narradas; não acrescenta informação nem altera a identidade ou o transporte do homem.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__jerome__life-of-s-hilarion/evidence/review-2.md` (fora do corpus).

### Round 3

- Foco: leitura integral do pt-BR às cegas, seguida de confronto das marcas com a fonte e varredura ortográfica; auditoria mecânica 1–6, metadados e diário.
- Veredito: ISSUES 2. Duas ocorrências de crase indevida corrigidas em `pt-BR/ch001.md`, §35, linha 73; termos e afirmações anteriores do diário mantidos.
- Defeitos corrigidos (fonte: `en-US/ch001.md`, linha 73):
  1. “até que eu chegue à terra” → “até que eu chegue a terra”; `until I reach land` refere-se a desembarcar. Terra, sem determinante e em oposição a bordo, não admite crase.
  2. “ao chegar à terra” → “ao chegar a terra”; `on reaching shore` tem o mesmo sentido marítimo, explicitado por `sailors and merchants on board`.
- Suspeitas consideradas e rejeitadas (linhas de `en-US/ch001.md`):
  - §6, linha 15, `those whom he shuddered to hear`: em “aqueles que estremecia ao ouvir”, o relativo é objeto de ouvir, não complemento de estremecer; não há quebra de regência.
  - §17, linha 37, `When he was free … said he`: a alternância de sujeito em “Quando ficou livre, disse-lhe” é resolvida pela ordem e pela reação seguinte: Marsitas é libertado, Hilarião fala. Não há pronome irresolúvel.
  - §32, linha 67, `did not remain unknown … any more than to others`: “não o permanecera” retoma o predicativo desconhecido; construção pouco usual, mas inteligível e defensável, não erro de transitividade.
  - §43, linha 89, `though surrounded … he never ate … it had close by`: cercado e tinha perto de si descrevem o lugar; ele no aparte dos frutos é Hilarião. A alternância não deixa a oração sem sujeito recuperável.
  - §14, linha 31, `semi-tertian ague`, e §20, linha 43, `Duumvir`: semiterçã e duúnviro são grafias válidas; raridade lexical não justifica substituição.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__jerome__life-of-s-hilarion/evidence/review-3.md` (fora do corpus).

### Round 4

- Foco: palavras funcionais, títulos e compromissos de gênero, antecedente e tratamento; leitura integral e auditoria mecânica 1–6, metadados e diário.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; capítulos, metadados e termos/afirmações anteriores do diário mantidos.
- Suspeitas consideradas e rejeitadas (linhas de `en-US/ch001.md`):
  - Gênero: §13, linha 29, `an object of compassion`: “digno” concorda com “alguém”, sem masculinizar a mulher. §14, linha 31, `three children`: “filhos” é corroborado pelo subsequente `three sons`. §44, linha 91, `his servant`: “servidor” é masculino de função, apoiado pelo contexto dos acompanhantes; não acrescenta identidade.
  - §18, linha 39, `You crowd of demons`: “contigo” pode dirigir-se ao coletivo singular “multidão”; não afirma um só demônio. “Ficai” antes se dirige aos irmãos, e “liberta” depois a Jesus: são destinatários distintos.
  - §22, linha 47, `On his inquiring`: o sujeito contextual de “Ao perguntar” continua sendo o oficial que acaba de chegar; os habitantes são os agentes da reação. A elipse não obriga a atribuir a pergunta aos habitantes.
  - §24, linha 51, `Following his example`: “seu exemplo” retoma Hilarião no cenário palestino. O inglês também muda de Antão, sujeito da fala anterior, para Hilarião; não há novo antecedente imposto pelo português.
  - §31, linha 65, `This pool` e `You see`: “Essa cisterna” é dêixis admissível de objeto apresentado pelos guias; “Vês” toma o visitante principal, Hilarião, por interlocutor de Isaac. O inglês não exige “esta” nem tratamento plural.
  - §36, linha 75, `for the passage of himself and Gazanus`: “dele” retoma Hilarião, passageiro e sujeito da oferta; o contexto não atribui ao capitão uma passagem a pagar.
  - §37, linha 77, `Freely ye received, freely give`, e §40, linha 83, `If you have faith`: os plurais preservam citações explicitamente dirigidas aos discípulos/Apóstolos. Não devem ser ajustados ao ouvinte singular de Hilarião no §37; no §40, `Remove` muda o destinatário para a montanha e justifica “Move-te”.
  - §43, linha 89, `who was to return in the spring`: “devendo voltar” refere-se a Hesíquio enviado, confirmado por `When the latter returned`; não obriga a atribuir a viagem a Hilarião.
- Evidência integral: `.claude/codex-runs/runs/church-fathers__jerome__life-of-s-hilarion/evidence/review-4.md` (fora do corpus).

### Round 5

- Foco: termos por parágrafo nos dois sentidos, afirmações do diário e nomes próprios; leitura integral e auditoria mecânica 1–6 e metadados.
- Veredito: CLEAN. Nenhum defeito objetivo confirmado; capítulos, metadados e termos/afirmações anteriores mantidos.
- Suspeitas consideradas e rejeitadas (linhas de `en-US/ch001.md`):
  - Introdução, linha 3, `Jerome`: a tabela restringe “São Jerônimo” aos metadados; “Jerônimo” na narrativa não a contradiz. Diferenças de frequência de blessed/saint/monk/brethren/old man são as flexões, derivações e equivalências contextuais já justificadas na rodada 1, não novas omissões.
  - §1, linha 5, `life and conversation`: “vida e conduta” no diário resume a equivalência lexical; o capítulo inclui os artigos em “vida e da conduta”. Zero no grep literal não torna a afirmação falsa. Também não se exigem no texto atual as formas antigas da rodada 3 nem as reticências dos excertos abreviados.
  - §§18–19, linhas 39–41, `Aira` e `Majomites`; §30, linha 63, `Aphroditon`, `Baisanes`, `Pelusianus`; §42, linha 87, `Lapetha`: as formas adotadas conservam ou adaptam a fonte. Variantes de outras traduções não demonstram nome errado nem autorizam substituir a edição canônica. §§3 e 46, linhas 9 e 95, `Majoma`/`Majuma`: a distinção Maioma/Maiuma é deliberada e fiel.
- Evidência: `.claude/codex-runs/runs/church-fathers__jerome__life-of-s-hilarion/evidence/review-5.md` (fora do corpus).
