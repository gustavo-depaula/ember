# Diário de tradução — A Grande Catequese (pt-BR)

Fonte: en-US/, tradução de William Moore e Henry Austin Wilson (Nicene and Post-Nicene Fathers, Second Series, vol. 5, ed. Philip Schaff e Henry Wace, 1893), revista por Kevin Knight para o New Advent.
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Gregory of Nyssa | Gregório de Nissa | como nos outros livros `gregory-nyssa` |
| The Great Catechism | A Grande Catequese | título; forma usual em português para a *Oratio catechetica magna* |
| Logos / logos / Λόγος | Logos / logos / Λόγος | mantido como na fonte; minúsculo para o logos humano |
| the Word | o Verbo | como em `faith` |
| Godhead / Deity / Divinity | Divindade | sempre maiúsculo, como em `not-three-gods` e `holy-spirit` |
| hypostasis / hypostases | hipóstase / hipóstases | |
| Hellenism / Judaism | helenismo / judaísmo | |
| heathen polytheism / Jewish monotheism | politeísmo pagão / monoteísmo judaico | |
| nature / essence / attribute | natureza / essência / atributo | como nos livros irmãos |
| community (of the Spirit with the essence) | comunhão | como em `holy-spirit-and-godhead` |
| Incarnation | Encarnação | |
| scheme (of the Incarnation, of Love) | plano | |
| freedom / free will / self-determination | liberdade / livre-arbítrio / autodeterminação | |
| privation | privação | |
| ransom | resgate | |
| the Evil one / the great adversary | o Maligno / o grande adversário | |
| “lump” (of humanity) | “massa” | mantém as aspas da fonte; eco de Romanos 11:16 |
| “abundant honour” | “honra abundante” | aspas da fonte (cf. 1 Coríntios 12:23) |
| Baptism / Eucharist / Regeneration | Batismo / Eucaristia / Regeneração | maiúsculas como na fonte |
| Prayer, Water, Faith | Oração, Água, Fé | maiúsculas como na fonte |
| Antidote / the Faithful | Antídoto / os Fiéis | maiúsculas como na fonte |
| the sacred Benediction | a sagrada Bênção | |
| baptismal Invocation | Invocação batismal | |
| skin-bottle | odre | |

## Decisões

- O texto da fonte é a análise sumária da obra que vem na edição do NPNF, não o tratado inteiro. Traduzido como está, com um parágrafo para cada parágrafo da fonte.
- Os rótulos de capítulo seguem o modelo “Capítulos V e VI. —”, com numerais romanos sem ponto entre eles. O “Prólogo e capítulo 1.” conserva o algarismo arábico da fonte.
- Os títulos de seção em negrito (**A Trindade.**, **Razoabilidade da Encarnação.**, **Os Sacramentos.**) conservam o negrito e o ponto da fonte.
- Os pronomes que se referem a Deus ou a Cristo vão com maiúscula (Ele, Lhe, O, Seu, Si, Nele). O reflexivo “se” fica sempre em minúscula.
- Capítulo II: a fonte diz “inhaled and exhaled fire”. Mantive “fogo” por fidelidade à fonte, embora o sentido esperado fosse “ar”.
- O travessão que liga o fim do capítulo XVIII ao começo do XIX foi mantido. O capítulo XIX começa então com “mas” minúsculo, porque continua a frase.
- “fiat” fica sem itálico, como na fonte.
- “of like nature with God the Father” → “da mesma natureza que Deus Pai”. É o sentido do inglês da época e o do argumento de Gregório.
- Algumas frases longas foram divididas para facilitar a leitura, sem omitir nenhuma oração da fonte.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of ch001 (26 paragraphs), book.json and the journal; found one added qualifier in [20] and three uncapitalized possessives for the Logos in [3].
- `pt-BR/ch001.md` [20]: “Mas a graça pela fé ainda não chegou a todos” → “Mas a graça pela fé não chegou a todos” — source says “grace through faith has not come to all”; “ainda” adds a temporal expectation the source does not state *(meaning)*
- `pt-BR/ch001.md` [3]: “A sua vontade, por ser divina” → “A Sua vontade, por ser divina” — source “His will”; the journal capitalizes possessives referring to God or Christ (Seu/Sua), as elsewhere in the file
- `pt-BR/ch001.md` [3]: “deve igualar-se o seu poder” → “deve igualar-se o Seu poder” — refers to the Logos; the journal rule on capitalizing Seu/Sua, and consistency with “A Sua vontade” in the next sentence
- `pt-BR/ch001.md` [3]: “senão perderia a sua simplicidade” → “senão perderia a Sua simplicidade” — refers to the Logos; the journal rule on capitalizing Seu/Sua, kept consistent within the paragraph
- Rejected: pt-BR/ch001.md [23] — audit: the parenthesis “(as Miracles prove that He has come already)” is turned into a “como” clause and moved to the end of the sentence — nothing is lost and the sense is the same; dropping the parentheses is a style choice
- Rejected: pt-BR/ch001.md [8] — “Dessa inveja nasceria…” is split off from “foi possível que” — the conditional keeps the sequence of the source, and the narrative goes on to say that the fall happened; it does not misinform the reader
- Rejected: pt-BR/ch001.md [24] — “pelo Verbo que neles habitava” has a plural antecedent — it refers to nourishment and Body, which are both named as changed in Christ; this reading is defensible
- Rejected: pt-BR/ch001.md [18] — a capitalized “Ele” refers to the Evil one — the capital comes from the start of the sentence, and the antecedent is clear from the sentence before

### Round 2 (codex, full read)
Verdict: 0 meaning-level, 0 minor. Leitura integral dos 26 parágrafos, cotejados com a fonte, do book.json e do diário; nenhum novo defeito objetivo encontrado.
- Rejected: pt-BR/ch001.md [23] — A auditoria aponta um par de parênteses ausente. — O conteúdo do parêntese foi preservado na oração iniciada por “como”, sem alteração de sentido, conforme já reconhecido na rodada anterior.
