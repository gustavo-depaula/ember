# Diário de Tradução — Hic est Liber (Sermão Inaugural II) (pt-BR)

Fonte canônica: `la/hicest-c01.md` (latim; redação principal, sem incorporar as variantes de Estler).
Referência secundária: `en-US/`, somente para registro e terminologia, conforme o precedente de *Do Ente e da Essência*.
Destino: `pt-BR`.

## Termos-chave

| Latim | Português | Notas |
|---|---|---|
| Sacra Scriptura / sacra doctrina | Sagrada Escritura / sagrada doutrina | Conforme *Rigans Montes*. |
| intellectus / scientia / natura / actus | intelecto / ciência / natureza / ato | Vocabulário das obras irmãs de Tomás. |
| virtus | virtude | Também para a eficácia operativa; “poder de Deus” na citação paulina, conforme *Das Razões da Fé*. |
| dilectio / praeceptum / bonum commune | amor / preceito / bem comum | Conforme *Da Perfeição da Vida Espiritual* e *Do Governo dos Príncipes*. |
| mandatum coactorium / monitorium | mandamento coercitivo / admoestador | Distinção entre o rei que pode punir e o pai que instrui. |
| agiographa / apocrypha | hagiógrafos / apócrifos | Categorias da divisão bíblica exposta no sermão. |
| virtutes politicae / purgatoriae / purgati animi / exemplares | virtudes políticas / purificadoras / da alma purificada / exemplares | Graus atribuídos a Plotino. |
| Augustinus / Hieronymus / Plotinus | Agostinho / Jerônimo / Plotino | Autor nos metadados: Santo Tomás de Aquino, como em *Do Governo dos Príncipes*. |
| Paralipomena / Ecclesiasticus / Cantica | Paralipômenos / Eclesiástico / Cântico dos Cânticos | Mantida a designação histórica do primeiro. |

## Decisões

- 2026-10-02: Tradução integral do latim, preservando os blocos, sua ordem e os destaques. Traduzido também o título inglês do arquivo latino: “Este é o Livro”. Subtítulos que a fonte apresenta como parágrafos permanecem assim; nenhuma numeração acrescentada.
- Omitidas as intervenções editoriais de Estler, inclusive variantes e acréscimos. Nenhuma nota do tradutor acrescentada; as citações de autoridades pertencentes ao texto são conservadas.
- Citações bíblicas traduzidas da redação fornecida, sem harmonização com outra Bíblia. Referências com abreviaturas portuguesas, números arábicos e vírgula entre capítulo e versículo, conforme as obras irmãs; não se completam referências incompletas do latim com dados do inglês.
- Preservadas as peculiaridades da fonte: Josué entre os hagiógrafos, as etimologias de “hagiógrafos” e “apócrifos”, a referência a 3 Esdras e a sequência de três graus das virtudes seguida de um quarto. Não são tratados como erros inequívocos de OCR.
- Na frase final, o latim principal elide o verbo após *quousque sponsa*. “Até que a esposa entre” explicita apenas o movimento exigido por *in thalamum*, sem incorporar a variante editorial como texto-fonte.
- O campo `description` já existe em `book.json`: recebe apenas a entrada pt-BR, como `name`, `author` e o título do sumário; pt-BR é acrescentado a `languages`.
- Nenhuma alteração na fonte. Build reservado ao orquestrador por instrução do usuário.

## Review log

### Round 1

- Foco: completude parágrafo por parágrafo e auditoria mecânica. Veredito: **CLEAN**; nenhum defeito confirmado ou corrigido.
- Achados considerados e rejeitados (linhas de `la/hicest-c01.md`):
  - L17–219, intervenções `Estler:`: sua ausência no pt-BR é a exclusão autorizada de aparato editorial, não omissão autoral; inclui o acréscimo duplicado de L101.
  - L149, `in Iosue, quem Hieronymus inter agiographos ponit`: “Josué” reproduz a fonte; substituir por Daniel seria emenda conjectural.
  - L51, `III Esdr. IV`; L171, `tres gradus`, seguido de `In quarto` em L179: referências e enumeração peculiares pertencem ao original, não à tradução.
  - L93–95, `agios`, `graphia`, `apo`, `cryphon`: formas e explicações conservadas; o original também não as destaca em itálico. Não corrigir as etimologias do autor.
  - L153, `iustitia, qua est bonum commune`: “pela qual existe o bem comum” respeita o ablativo `qua`; não impor a leitura `quae` nem o inglês “which is”.
  - L219, `quousque sponsa ... in thalamum`: “até que a esposa entre” supre defensavelmente a elipse de movimento; não incorpora a variante de Estler como fonte.
  - Referências sem versículo (p. ex. L103, `Deut. V`): não completar com os números adicionais do inglês; o padrão é o latim.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__hic-est-liber/evidence/review-1.md`.

### Round 2

- Foco: leitura bilíngue integral, cláusula por cláusula, contra o latim principal, com auditoria mecânica e verificação do diário. Veredito: **CLEAN**; nenhum defeito confirmado ou corrigido.
- Achados considerados e rejeitados (linhas de `la/hicest-c01.md`):
  - L35, `creditis in Deum et in me credite`: “credes ... crede” conserva a leitura indicativa possível da primeira forma e o imperativo da segunda; não é preciso uniformizar os modos.
  - L129, `quod beneficium Deus improperat eis`: “esse benefício Deus lhes recorda em censura” conserva a censura; não substituir pela concessão sugerida pelo inglês.
  - L139, `unde dicebat: de industria dissolvit manus virorum bellantium`: “donde dizia: deliberadamente enfraqueceu...” acompanha a atribuição e a terceira pessoa da fonte; a estranheza não autoriza harmonização bíblica.
  - L141, `de advocatione ... ad iudicium`: “da convocação ao juízo” segue o texto principal; “advogado” importaria a variante editorial `advocato`.
  - L169, `aliud opus eius`, e L179, `derivantur ab eis`: “do sábio” retoma `sapientis` de L165; “delas” retoma as virtudes exemplares. A repetição de “preceitos” em L179 apenas explicita o sujeito elíptico, sem adição de conteúdo.
  - L205, `a praedicatione eius`, e L209, `ad alta divinitatis eius`: os possessivos portugueses podem retomar Cristo, como os latinos; não substituir por João Batista nem atribuir divindade ao evangelista.
  - L149, `in Iosue`; L153, `qua est bonum commune`; L171–179, `tres gradus`/`In quarto`; L219, `quousque sponsa ... in thalamum`: mantidas as rejeições fundamentadas na rodada 1; não há motivo textual para emendar essas passagens.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__hic-est-liber/evidence/review-2.md`.

### Round 3

- Foco: leitura fria integral do pt-BR antes de abrir a fonte, seguida de conferência no latim e varredura ortográfica; auditoria mecânica e do diário. Veredito: **CLEAN**; nenhum defeito confirmado ou corrigido.
- Achados considerados e rejeitados (linhas de `la/hicest-c01.md`):
  - L139, `unde dicebat: de industria dissolvit manus virorum bellantium`: a atribuição estranha a Jeremias pertence à redação principal; mudar para “diziam dele” seria emenda conjectural.
  - L145, `in duo ... verbo et facto ... facto tantum ... verbo tantum ... verbo et facto`: dois meios de instrução permitem três combinações; a enumeração portuguesa acompanha a fonte.
  - L149, `in Iosue, quem Hieronymus inter agiographos ponit`: o nome e a classificação suspeitos na leitura fria estão expressos no latim; mantida a rejeição anterior.
  - L171–179, `tres gradus` / `In quarto`: o quarto grau e a ausência de preceitos para ele são explícitos no original; não corrigir a contagem.
  - L57/59/185, `ad quam ... disponit` / `ad quam ... dirigit` / `ad vitam aeternam ordinat`: “dispõe”, “dirige” e “ordena” conservam a finalidade e admitem objeto humano genérico elíptico; não há regência quebrada.
  - L205/209, `a praedicatione eius` / `ad alta divinitatis eius`: os possessivos têm Cristo como antecedente recuperável pelo contexto; sua proximidade aos nomes dos evangelistas não exige alteração.
- Evidências: `.claude/codex-runs/runs/aquinas-opera-omnia__opuscula__hic-est-liber/evidence/review-3.md`.
