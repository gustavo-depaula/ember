# Diário de tradução — Vida de Malco, o Monge Cativo (pt-BR)

Fonte: `en-US/ch001.md`, única língua disponível no livro; não há diretório `la/`.
Destino: `pt-BR/ch001.md`.

## Termos e precedentes

Consultados os capítulos, diários e metadados das vidas de Paulo e Hilarião, de Jerônimo; seus campos `sources` identificam as traduções inglesas de origem.

| Inglês | Português | Observação |
|---|---|---|
| Jerome | São Jerônimo | Autor nos metadados, conforme as obras irmãs |
| Malchus / Evagrius / Sabianus | Malco / Evágrio / Sabiano | Nomes adaptados ao português |
| Zacharias / Elizabeth / John | Zacarias / Isabel / João | Nomes bíblicos |
| Jacob / Moses / Solomon | Jacó / Moisés / Salomão | Nomes bíblicos |
| Maronia / Nisibis / Chalcis | Marônia / Nísibis / Cálcis | Topônimos |
| Immæ / Beroa / Edessa | Imas / Bereia / Edessa | Topônimos |
| monk / monastery / cell / abbot | monge / mosteiro / cela / abade | monge, mosteiro e cela seguem as obras irmãs; abade traduz abbot nesta obra |
| chastity / virgin state | castidade / virgindade | Conservada a distinção da fonte |
| Saracens / Ishmaelites | sarracenos / ismaelitas | Designações históricas da fonte |
| master / fellow slave | senhor / companheiro de escravidão | Contexto do cativeiro |

## Decisões — 2026-10-02

- Tradução integral nesta sessão, sem perguntas nem subagentes. Política padrão de excluir notas editoriais de rodapé; não há nenhuma. Introdução editorial traduzida integralmente, conservando o negrito. Sem notas do tradutor.
- Preservados título, parágrafos e ordem das dez seções; números autorais em negrito inerte. Aspas curvas e pronomes reverenciais em minúsculas, conforme as obras irmãs. Tratamento singular por “tu” e plural por “vós”.
- Citações e alusões bíblicas traduzidas das palavras da fonte inglesa, sem harmonização com outra Bíblia nem acréscimo de referências ausentes. Unidades conservadas: milhas e côvados.
- Metadados pt-BR apenas em `name`, `author`, `languages` e título do sumário. Sem descrição nova. Build reservado ao orquestrador por instrução do usuário.

## Expressões e particularidades

- `dregs of time` (§1): “escória dos tempos”, conservando a censura retórica à época do autor.
- `monk's estate` (§5): “condição de monge”, não propriedade material; `bottles` (§8): “odres”, feitos das peles dos bodes.
- Preservadas as imagens do casamento espiritual (§6), da morte como sono (§10) e a distinção final entre amar como irmã e entregar-se aos cuidados da companheira como se fosse irmã.
- A pontuação anômala de `a.d. , 391` na introdução é vertida normalmente como “391 d.C.”, sem alteração do arquivo-fonte.

## Alterações na fonte

Nenhuma.

## Review log

### Round 1

- Foco: completude parágrafo a parágrafo contra `en-US/ch001.md`, com auditoria mecânica 1–6 e metadados.
- Veredito: CLEAN; nenhum defeito objetivo confirmado ou corrigido. Capítulo, metadados e termos/afirmações anteriores do diário inalterados.
- Suspeitas rejeitadas:
  - §§1, 3 e 6, fonte linhas 5, 9 e 15: incisos entre parênteses passaram a travessões, sem perda de conteúdo; mudança de pontuação defensável.
  - §3, fonte linha 9, `I blush to confess my faithlessness`: “coro ao confessar minha infidelidade” emprega corretamente a primeira pessoa de corar.
  - §9, fonte linha 23, `the rage of the lion`: “leão” conserva a alternância lion/lioness da fonte, não é troca indevida do sexo do animal.
  - §10, fonte linha 25, `the new supply of grain`: “novas provisões de grãos” consta da fonte, embora a narrativa não explique sua obtenção; não é acréscimo.
  - §10, fonte linha 25, `I did not commit myself to her as if she were my sister`: “não me entreguei a seus cuidados como se ela fosse minha irmã” preserva a distinção entre amar como irmã e confiar-se à companheira.
- Evidências: `.claude/codex-runs/runs/church-fathers__jerome__life-of-malchus-the-captive-monk/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, cláusula por cláusula, contra `en-US/ch001.md`, com auditoria mecânica e verificação do diário.
- Veredito: ISSUES 1; corrigida uma atribuição de precedente no diário. Texto traduzido e metadados inalterados.
- Correção: tabela de termos, linha `monk / monastery / cell / abbot`: “Vocabulário monástico das obras irmãs” → “monge, mosteiro e cela seguem as obras irmãs; abade traduz abbot nesta obra”. `abade` não ocorre nos capítulos nem nos diários pt-BR das vidas de Paulo e Hilarião consultadas; é tradução correta de `abbot` nesta obra (§§3 e 10, fonte linhas 9 e 25), mas não um precedente dessas obras.
- Suspeitas rejeitadas:
  - §4, fonte linha 11, `They carried their bows unstrung`: “arcos com as cordas soltas” exprime ausência de tensão/armação, sem afirmar arcos prontos para disparar.
  - §6, fonte linha 15, `Supposing my husband should return to me, I would preserve the chastity`: “Mesmo que meu marido voltasse para mim, eu conservaria a castidade” mantém a hipótese e o condicional; o valor concessivo é defensável no contexto.
  - §6, fonte linha 15, `I now loved her as a wife still more`: “agora a amava ainda mais como esposa” conserva a tensão entre casamento e castidade que a própria fonte estabelece.
- Evidências: `.claude/codex-runs/runs/church-fathers__jerome__life-of-malchus-the-captive-monk/evidence/review-2.md`.

### Round 3

- Foco: leitura integral do pt-BR sem abrir o capítulo-fonte, seguida de conferência das marcas no inglês e varredura ortográfica e de pontuação; auditoria mecânica 1–6, metadados e diário.
- Veredito: CLEAN; nenhum defeito objetivo confirmado ou corrigido. Capítulo, fonte, metadados e termos/afirmações anteriores do diário inalterados.
- Suspeitas rejeitadas:
  - §3, fonte linha 9, `How my father threatened ... requires no other proof`: “De quanto meu pai me ameaçava ... não é necessária outra prova” antepõe o complemento de “prova”; a regência é válida e conserva a intensidade das ameaças e persuasões.
  - §9, fonte linha 21, `If the Lord helps ... we have found safety ... we have found our grave`: “se ... encontramos” admite pretérito perfeito; o lugar já encontrado será refúgio ou sepultura conforme o desfecho. Não cabe impor futuro.
  - §10, fonte linha 25, `returned to the monastic life, while I entrusted my companion`: “voltei ... enquanto confiei” reúne ações contemporâneas e contrapostas; o perfeito não quebra a construção.
- Evidências: `.claude/codex-runs/runs/church-fathers__jerome__life-of-malchus-the-captive-monk/evidence/review-3.md`.

### Round 4

- Foco: palavras funcionais, títulos e escolhas de gênero, antecedente e tratamento; auditoria mecânica integral, metadados e diário.
- Veredito: CLEAN; nenhum defeito objetivo confirmado ou corrigido. Capítulo, fonte, metadados e termos/afirmações anteriores do diário inalterados.
- Suspeitas rejeitadas:
  - §5, fonte linha 13, `her children`: “a seus filhos” mantém a senhora como possuidora; o masculino plural é genérico e não afirma que sejam todos meninos.
  - §6, fonte linha 15, `yourself ... my soul` e `witness ... unburied`: “ti mesma ... minha alma” e “testemunha ... insepulta” concordam com substantivos femininos, sem atribuir sexo feminino a Malco.
  - §9, fonte linha 21, `He, when he saw that he was long in returning`: “Este, ao ver que o servo demorava a voltar” resolve corretamente senhor/servo; o senhor aguarda fora e só entra depois da demora do servo.
  - §9, fonte linha 23, `her cub ... it`: “seu filhote ... o” usa masculino genérico para a cria; não acrescenta uma identificação de sexo.
  - Epílogo, fonte linha 27, `you ... Virgins`: “vós ... Virgens” é plural sustentado pelo vocativo; Jerônimo reassume a narrativa, portanto não contradiz o “imaginas” dirigido a ele por Malco no §9.
- Evidências: `.claude/codex-runs/runs/church-fathers__jerome__life-of-malchus-the-captive-monk/evidence/review-4.md`.
