# Diário de tradução — Leo Tolstói (pt-BR)

Fonte: en-US/, Leo Tolstoy (Hodder and Stoughton, 1903), Project Gutenberg #62045.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Leo Tolstoy / G. K. Chesterton | Leo Tolstói / G. K. Chesterton | Formas dos metadados recebidos. |
| Tolstoyan | tolstoiano | Adjetivo referente ao pensamento de Tolstói. |
| English / Middle Ages | inglês / Idade Média | Convenções das obras irmãs. |
| Mr. | sr. | Conforme as obras irmãs. |
| Scriptures / Bible | Escrituras / Bíblia | Convenções católicas das obras irmãs. |
| Christianity / Catholic church / Churches | cristianismo / Igreja Católica / Igrejas | Preservada a imagem de Tolstói como uma Igreja inteira. |
| faith / creed / theology | fé / credo / teologia | Vocabulário religioso do argumento. |
| ethics / ethical / moralist | ética / ético / moralista | Distinção entre sistema ético e seus proponentes. |
| fanaticism / mysticism / mystic | fanatismo / misticismo / místico | Categorias centrais do ensaio. |
| simplification of life | simplificação da vida | Fórmula repetida integralmente no argumento. |
| enthusiasm | entusiasmo | Mantida a explicação histórica dada pelo autor. |
| Mahometans | muçulmanos | Conforme a convenção da obra irmã sobre Thackeray. |
| Doukhabor / Doukhabors | ducobor / ducobores | Unificadas as variantes gráficas da fonte. |
| Home Rule Bill | projeto de lei de autonomia irlandesa | Explicitação do referente político para o leitor brasileiro. |
| House of Commons | Câmara dos Comuns | Nome tradicional da instituição britânica. |
| Napoleon Buonaparte / Athens / Adamites | Napoleão Bonaparte / Atenas / adamitas | Formas portuguesas. |
| Synthetic Philosophy | Filosofia Sintética | Título traduzido; aspas preservadas. |

## Decisões

- Preservados os dez parágrafos fornecidos, inclusive as divisões no meio das frases entre os parágrafos 2–3 e 5–6 e a legenda repartida entre 7–8.
- Mantida a forma “Leo Tolstói” recebida nos metadados, também no título do capítulo.
- “Silk hat” traduzido por “cartola de seda”; “black abortion”, por “aborto negro”, conservando a violência da imagem satírica.
- “Peddling compromise” traduzido por “solução de compromisso mesquinha”, mantendo o juízo depreciativo sobre a proposta política.
- Nas falas imaginárias de Tolstói, o interlocutor singular recebe “tu”, com “deves” e “leva”.
- “Faggots” traduzido por “fogueiras”, seu sentido contextual como instrumento de perseguição.
- Mantida como afirmação do autor a passagem sobre Cowper; não foram acrescentadas correções ou ressalvas históricas.
- Não acrescentadas notas do tradutor: as explicações indispensáveis puderam ser incorporadas às equivalências lexicais, e o próprio autor explica o contraste histórico de “entusiasmo”.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of the 10 paragraphs, journal and book.json. The translation is faithful and complete. Two Key Terms rows list forms that do not occur in the text.
- `pt-BR/translation-journal.md`: “| England / English / Middle Ages | Inglaterra / inglês / Idade Média |” → “| English / Middle Ages | inglês / Idade Média |” — “England”/“Inglaterra” does not occur in the source or the translation; the row claims a form that is not there
- `pt-BR/translation-journal.md`: “| Scripture / Scriptures / Bible | Escritura / Escrituras / Bíblia |” → “| Scriptures / Bible | Escrituras / Bíblia |” — the singular “Scripture”/“Escritura” does not occur; only “Scriptures” (para 6) and “Bible” (paras 4, 6)
- Rejected: pt-BR/ch01-leo-tolstoy.md [4] — Audit flag: the parentheses around “(as I believe)” were dropped — Rendered as “, segundo creio,”. Same content, and commas are a normal Portuguese choice for the aside.
- Rejected: pt-BR/ch01-leo-tolstoy.md [2] — “fierce” rendered as “ardente” instead of “feroz” — “ardente e prática” is a defensible rendering of the fervour of faith. The image of violence remains in “aos gritos”.
- Rejected: pt-BR/ch01-leo-tolstoy.md [6] — “expose themselves like the Adamites” rendered as “se exibiriam nus”, which adds “nus” — It makes explicit the sense of the source, which is about nakedness (see “nakedness in the street” earlier in the paragraph). It adds no content.
- Rejected: pt-BR/ch01-leo-tolstoy.md [3] — “nevertheless” has no explicit equivalent in “Mas ainda há algo a dizer” — “Mas” with “ainda” carries the adversative sense. No meaning is lost.

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 10 parágrafos, cotejados com a fonte, além de book.json, diário e alerta mecânico: nenhum defeito objetivo encontrado; mantida a rejeição anterior do alerta sobre parênteses.
