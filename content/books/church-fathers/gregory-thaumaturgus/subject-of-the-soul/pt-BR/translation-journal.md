# Diário de tradução — Sobre a Alma (pt-BR)

Fonte: en-US/, tradução de S. D. F. Salmond (Ante-Nicene Fathers, vol. 6, 1886), revista para o New Advent por Kevin Knight.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Gregory Thaumaturgus | Gregório Taumaturgo | como nas obras irmãs |
| Tatian | Taciano | destinatário; tratado por *tu* |
| soul | alma | |
| substance / accident | substância / acidente | em itálico no item 4 do prefácio, como na fonte |
| incorporeal / incorporeality | incorpóreo / incorporeidade | |
| simple / compound, composite | simples / composto | "uncompound(ed)" → *não composta* |
| multiplex | múltiplo | |
| dissoluble / indissoluble | dissolúvel / indissolúvel | |
| rationale (proper to a soul) | noção (própria de uma alma) | |
| put in action | posto em ação | fórmula recorrente dos argumentos |
| impulsion / traction | impulso / tração | |
| soulless things | coisas sem alma | |
| animate / inanimate | animado / inanimado | |
| self-acting / ever-acting | ativo por si mesmo / sempre ativo | |
| contraries | contrários | |
| take on contraries in succession | receber sucessivamente os contrários | definição de substância |
| apprehend / apprehension | apreender / apreensão | |
| criterion | critério | |
| sense(s) | sentidos | |
| intellect | intelecto | |
| rational / irrational | racional / irracional | |
| corruption / incorruptible | corrupção / incorruptível | |
| gainsayers | contraditores | |
| Holy Scriptures | Sagradas Escrituras | |

## Decisões

- Título: "Sobre a Alma", forma usual em português para o tratado (gr. *Peri psychês*); "On the Subject of the Soul" não é vertido literalmente. Mesmo título no toc.
- Títulos das seções numeradas em caixa de frase, à maneira portuguesa, mantendo a numeração da fonte.
- Parágrafo 7: "shall be known property by its effects" é erro tipográfico da edição por "properly"; traduzido como "propriamente".
- O travessão solto da fonte em "Scripture,— a method" virou vírgula; no último parágrafo, o inciso entre travessões ficou entre parênteses para clareza da longa frase.
- A fonte alterna "we" e "I" para o autor; a alternância foi mantida.
- Não há notas do editor nem notas do tradutor.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 (27 paragraphs), book.json and journal: one minor enclisis error in [3]; otherwise complete and faithful.
- `pt-BR/ch001.md` [3]: “Desejas-o, antes, com vistas” → “Deseja-lo, antes, com vistas” — Enclisis of o after a verb ending in -s drops the -s and takes the form -lo: desejas + o = deseja-lo.
- Rejected: pt-BR/ch001.md [27] — Audit: parentheses differ (source 0, pt-BR 1) — The source's dash-delimited aside became a parenthesis on purpose, as the journal records. The content is complete.
- Rejected: pt-BR/ch001.md [3] — One source sentence split in two ("Disseste… / Desejas-o, antes…") — Every clause is kept and the sense is unchanged. This is a valid style choice.
- Rejected: pt-BR/ch001.md [26] — "are felt to be incapable" rendered as "se reconhecem incapazes" — It reads as a passive-reflexive ("são reconhecidos incapazes"). The sense is kept.
- Rejected: pt-BR/ch001.md [7] — "property" rendered as "propriamente" — This is an unmistakable typo in the edition, recorded in the journal. The rendering is correct.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 27 parágrafos, do book.json e do diário: encontrado um erro de referente pronominal.
- `pt-BR/ch001.md` [26]: “repousar nelas sem investigação” → “repousar nos sentidos sem investigação” — No argumento, “rest in these” retoma os sentidos, cuja insuficiência exige investigação racional. “Nelas” remete às coisas e altera esse referente. *(meaning)*
- Rejected: pt-BR/ch001.md [27] — O audit aponta parênteses ausentes na fonte. — Os parênteses delimitam integralmente o inciso entre travessões da fonte, conforme a decisão registrada no diário.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [25]-[27]: the fix in [26] is correct and fits its sentence; no new defects.
- Rejected: pt-BR/ch001.md [26] — Check of the previous round's fix: "repousar nelas" → "repousar nos sentidos" — The fix is correct. The argument is that we do not rest in the senses without rational inquiry, and "nos sentidos" fits that sense. The sentence stays grammatical. The repeated "sentidos" in the next clause is acceptable.
- Rejected: pt-BR/ch001.md [26] — "à parte da razão" for "apart from reason" — "À parte de" is valid Portuguese for "separate from". This is a style choice, not a defect.
- Rejected: pt-BR/ch001.md [27] — Audit: parentheses differ (source 0, pt-BR 1) — Rounds 1 and 2 already rejected this. The dash-delimited aside became a parenthesis, as the journal records. No content is lost.
