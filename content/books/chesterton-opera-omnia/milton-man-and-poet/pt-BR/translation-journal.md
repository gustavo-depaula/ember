# Diário de tradução — Milton: O Homem e o Poeta (pt-BR)

Fonte: en-US/, Milton: Man and Poet (The Catholic World, 1917), Project Gutenberg Australia, ebooks09/0900721h.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Milton: Man and Poet / G. K. Chesterton | Milton: O Homem e o Poeta / G. K. Chesterton | Formas dos metadados recebidos. |
| God / Satan / Christmas | Deus / Satanás / Natal | Convenções das obras irmãs. |
| England / English / Scotland | Inglaterra / inglês / Escócia | Formas portuguesas tradicionais. |
| Charles I / Charles II / James I | Carlos I / Carlos II / Jaime I | Convenções dos nomes régios. |
| Cavalier / Puritan | Cavaleiro realista; Cavaleiro / puritano | Conforme A Espada de Madeira; explicitação política na primeira ocorrência. |
| Merry England | Alegre Inglaterra | Conforme A Espada de Madeira. |
| State / common sense / fraternity | Estado / senso comum / fraternidade | Convenções das obras irmãs. |
| Calvinism / Puritanism / Protestantism | calvinismo / puritanismo / protestantismo | Minúsculas usuais em português. |
| predestination / election / the elect | predestinação / eleição / os eleitos | Preservado o contraste entre eleição teológica e política. |
| free will / free speech / self-government | livre-arbítrio / liberdade de expressão / autogoverno | Distinções do argumento político e teológico. |
| aristocracy / oligarchy / despotism | aristocracia / oligarquia / despotismo | Categorias políticas recorrentes. |
| democracy | democracia; povo | “Povo” quando designa o corpo popular vencido por Cromwell, conforme a convenção de Divórcio contra Democracia. |
| Reformation / Renaissance / Middle Ages | Reforma / Renascimento / Idade Média | Designações históricas. |
| French Revolution / Thirty Years' War / Great Rebellion | Revolução Francesa / Guerra dos Trinta Anos / Grande Rebelião | Conservada a repetição paradoxal de “Grande Rebelião”. |
| Homer / Virgil / Eve / Adam / Samson / Apollo | Homero / Virgílio / Eva / Adão / Sansão / Apolo | Formas portuguesas tradicionais. |
| Wickliffe / Luther / Euphrosyne | Wycliffe / Lutero / Eufrósine | Grafia corrente do reformador inglês e formas portuguesas dos demais nomes. |
| Paradise Lost / Pilgrim's Progress | Paraíso Perdido / O Peregrino | Títulos em português; destaque tipográfico conforme a fonte. |
| L' Allegro / L'Allegro / Il Penseroso / Defensus Populi Anglicani | L' Allegro / L'Allegro / Il Penseroso / Defensus Populi Anglicani | Títulos conservados como fornecidos, inclusive variantes gráficas. |
| Thalabe the Destroyer | Thalabe, o Destruidor | Conservada a grafia do nome na fonte recebida. |
| peers / House of Lords / House of Equals / House of Peers | pares / Câmara dos Lordes / Câmara dos Iguais / Câmara dos Pares | Preservado o encadeamento etimológico do argumento. |
| Pride's Purge / spiritual pride | Expurgo de Pride / orgulho espiritual | O sobrenome e seu sentido são esclarecidos na nota [^1]. |

## Decisões

- Preservados os 26 parágrafos da fonte, inclusive os versos isolados, as transições breves e as quebras internas dos trechos poéticos. A definição da nota do tradutor é um parágrafo adicional de aparato.
- O tratamento do leitor é singular, com “tu” implícito. A invocação a Eufrósine também emprega “tu”; a invocação a Deus no trecho citado do Coro emprega “Vós”.
- “Selfish” e “egoistic” foram diferenciados por “egoístas” e “fazia do egoísmo uma doutrina”, preservando o contraste entre conduta e princípio.
- A edição eletrônica consultada reproduz “A ready” e “sy nodical”. No primeiro caso, adotou-se por conjectura contextual “Arcádia”; no segundo, recompôs-se a palavra inequivocamente fragmentada e traduziu-se “sinodal”. Não se trata de variantes confirmadas em exemplar impresso.
- “Deliberate”, associado ao governo por debate, foi entendido como “deliberativo”; “abstract republicans”, como “republicanos em teoria”.
- “Public schools” foi traduzido por “colégios”, evitando a equivalência enganosa com as atuais escolas públicas brasileiras.
- Acrescentada a nota [^1] para explicar o sentido inglês do sobrenome Pride, necessário à alusão alegórica e à observação sobre o sobrenome certo.
- “The cauld banes of morality” recebeu “os ossos frios da moralidade”; preserva-se a imagem, sem criar um dialeto regional português para imitar o escocês.
- As citações poéticas foram traduzidas diretamente, conservando suas imagens, elipses e inversões relevantes, sem impor rima ou métrica.
- Os metadados em pt-BR já recebidos foram mantidos; acrescentaram-se apenas o título do sumário e a entrada de idioma em `languages`.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 0 minor. Full read of the single chapter (26 paragraphs plus the translator's note); one meaning fix: the person of the verb in the Paradise Lost quotation in [15].
- `pt-BR/ch01-milton-man-and-poet.md` [15]: “...nem às vezes esqueças,” → “...nem às vezes esqueço,” — In Paradise Lost III, 32-33 the subject of "nor sometimes forget" is the poet ("Nightly I visit: nor sometimes forget / Those other two equalled with me in fate"); "esqueças" makes it an imperative addressed to someone else. *(meaning)*
- Rejected: pt-BR/ch01-milton-man-and-poet.md [18], [20], [22] — Source parentheses rendered as commas (audit flag) — The asides are kept whole; the punctuation change is a defensible style choice.
- Rejected: pt-BR/translation-journal.md (Cavalier row) — "cavaleiro realista" ×0 in pt-BR (audit flag) — [20] uses the plural "Cavaleiros realistas" at the first occurrence and [24] uses "Cavaleiros", as the row states.
- Rejected: pt-BR/ch01-milton-man-and-poet.md [24] — "high republican type" rendered as "republicano austero" — A defensible reading of "high" (lofty, rigorous); the sense is not altered.
- Rejected: pt-BR/ch01-milton-man-and-poet.md [23] — "Vós ... elegestes" for "thou hast elected" — In Samson Agonistes the Chorus addresses God; the journal records the "Vós" convention.

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 0 minor. Leitura integral dos 26 parágrafos, da nota do tradutor, dos metadados e do diário; encontrado um defeito de sentido.
- `pt-BR/ch01-milton-man-and-poet.md` [13]: “Ou do eterno raio coeterno” → “Ou do Eterno o raio coeterno” — Na fonte, “the eternal” designa Deus, de quem procede o “coeternal beam”. A tradução faz de ambos os termos adjetivos de “raio”, perdendo essa relação. A correção preserva também a inversão discutida pelo autor. *(meaning)*

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch01 [12]–[14] and the footnote; the round-2 fix to [13] is right and its neighbours are intact; no defects.
- Rejected: pt-BR/ch01-milton-man-and-poet.md [13] — Round-2 change “Ou do Eterno o raio coeterno” — Correct: in Paradise Lost III, 2 (“Or of th' Eternal Coeternal beam”) “the Eternal” is God and the beam is coeternal with him. The fix keeps that relation and the inversion Chesterton comments on, and it fits [12] “Teria achado” and [14] “um tanto obscuro” (masculine, agreeing with the quoted line).
- Rejected: pt-BR/ch01-milton-man-and-poet.md [18], [20], [22]; journal Cavalier row — Audit flags: parentheses differ; “cavaleiro realista” ×0 — Not in the shown paragraphs, and round 1 already rejected both with reasons. No new argument.
