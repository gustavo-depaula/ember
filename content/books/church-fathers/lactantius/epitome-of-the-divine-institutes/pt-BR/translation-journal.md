
## Termos

| Democritus / Epicurus / Dicæarchus | Demócrito / Epicuro / Dicearco | “Dicearco” segue a forma empregada na tradução de *Exortação aos pagãos*, de Clemente de Alexandria. |
| Milesian Apollo | Apolo de Mileto | |
| Trismegistus / Hystaspes / Sibyls | Trismegisto / Histaspes / sibilas | |
| general judgment / Millenarian Reign | juízo universal / reinado de mil anos | |
| self-restraint | domínio de si | |
| crown of faith | coroa da fé | |

## Decisões

- Preservada a correspondência dos 191 parágrafos da fonte, incluindo os títulos; acrescentadas oito notas do tradutor ([^1] a [^8]).
- Nota [^8], após o parágrafo 189: esclarece o sentido de *Polyandrion*, conservado com a grafia da fonte e em itálico como termo grego transliterado.
- No parágrafo 187, “nearly two parts” foi vertido por “quase duas terças partes”, pois a sequência identifica uma terceira parte que foge.
- No parágrafo 186, preservada a repetição de “hand” como “força das mãos”, explicitando o sentido de aquisição e defesa pela violência.
- Mantidas sem harmonização doutrinal a cronologia de seis mil anos, a descrição do reinado terreno de mil anos e a sequência das ressurreições e dos julgamentos.

## Review log

### Round 1 (claude, full read)
Verdict: 1 meaning-level, 3 minor. Full read of all 191 paragraphs, book.json and the journal: one reversed sense in [91], masculine 'epítome' in [3] and [4], and a false paragraph and note count in the journal.
- `pt-BR/ch001.md` [91]: “Portanto, não se ocupa apenas dos assuntos humanos, mas tampouco das coisas celestes.” → “Portanto, não descuida apenas dos assuntos humanos, mas também das coisas celestes.” — Source: 'He disregards not only the affairs of men, but also heavenly things'. As written, the Portuguese says he does not deal only with human affairs, which implies he does deal with them and contradicts the next clause. *(meaning)*
- `pt-BR/ch001.md` [3]: “o propósito de toda a Epítome” → “o propósito de todo o Epítome” — 'Epítome' is masculine (VOLP, s.m.).
- `pt-BR/ch001.md` [4]: “que se faça para ti uma epítome deles” → “que se faça para ti um epítome deles” — 'Epítome' is masculine (VOLP, s.m.).
- `pt-BR/translation-journal.md`: “Preservada a correspondência dos oito parágrafos da fonte, incluindo os três títulos; acrescentada uma definição de nota do tradutor.” → “Preservada a correspondência dos 191 parágrafos da fonte, incluindo os títulos; acrescentadas oito notas do tradutor ([^1] a [^8]).” — The claim is false: the chapter has 191 paragraphs, many headings and eight translator's notes.
- Rejected: pt-BR/ch001.md [38], [42], [61], [161], [189] — The mechanical audit flags emphasis markers that differ from the source. — These are italics for retained Greek and Latin words (Zankronou, Lupa, anthropos, the Latin phrase, Polyandrion), as the house rules require.
- Rejected: pt-BR/ch001.md [166] — 'fala falsamente numa conversa ociosa' adds 'falsamente', which the English lacks. — The context is about falsehood (Latin 'mentitur'). The English ellipsis would otherwise make the sentence nonsensical, so the explicit word is defensible.
- Rejected: pt-BR/ch001.md [10] — 'nem os próprios comandantes' fixes the antecedent of the ambiguous 'by themselves'. — The following clause, 'each consults his own interests', supports the commanders as subject. This is a defensible reading.
- Rejected: pt-BR/ch001.md [168] — 'trata segundo a lei e a condição desse mesmo homem' resolves the ambiguous 'His own'. — It matches the Latin 'sua lege suaque condicione' and the next sentence (mercy to the merciful).

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 2 minor. Leitura integral dos 191 parágrafos, das oito notas, de book.json e do diário: dois defeitos de sentido e dois menores; os cinco alertas de ênfase são justificados.
- `pt-BR/ch001.md` [2]: “*Dirigida a seu irmão Pentádio*” → “*Dirigido a seu irmão Pentádio*” — O particípio refere-se ao Epítome, substantivo masculino.
- `pt-BR/ch001.md` [144]: “Por que se dá ouvidos aos filósofos” → “Por que se dão ouvidos aos filósofos” — Na construção com se apassivador, o verbo concorda com o sujeito plural 'ouvidos'.
- `pt-BR/ch001.md` [177]: “e nada fez por si mesmo, mas em vista de outra coisa.” → “e nada fez como um fim em si mesmo, mas em vista de outra coisa.” — A fonte diz que nenhuma coisa foi feita por causa dela própria, como finalidade última. 'Por si mesmo' refere-se naturalmente a Deus e sugere que ele nada fez sozinho ou em benefício próprio. *(meaning)*
- `pt-BR/ch001.md` [180]: “porque todas as coisas resultaram no uso do homem.” → “porque todas as coisas vieram a servir ao homem.” — A fonte afirma que todas as coisas servem ao uso humano; 'resultaram no uso do homem' transforma essa relação de utilidade numa relação de consequência. *(meaning)*
- Rejected: pt-BR/ch001.md [11] — Possível falta de concordância entre 'cada um' e 'têm'. — São orações distintas; o sujeito implícito plural da principal pode retomar os deuses, enquanto 'cada um' é sujeito apenas da condicional.
- Rejected: pt-BR/ch001.md [165] — 'Nunca insultará aquele que espera uma bênção de Deus' poderia restringir quem não deve ser insultado. — 'Aquele que espera uma bênção de Deus' admite leitura como sujeito posposto, fiel à fonte. A inversão não constitui defeito objetivo.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of ch001 [1]-[3], [143]-[145], [176]-[181] and notes [^1]-[^8]: the four previous fixes are correct and no new defects found.
- Rejected: pt-BR/ch001.md [177] — 'nada fez como um fim em si mesmo' could be read as describing God rather than the things made. — With 'nada' as the object, the phrase reads as nothing being made as an end in itself. That matches 'nor did He make anything for its own sake' and the examples that follow (house, ship, vessels).
- Rejected: pt-BR/ch001.md [145] — 'seguem a Deus e à verdade' puts a crase on the direct object of 'seguir'. — This continues the emphatic preposition already used in 'seguir a Deus' across the coordinated object. It is a defensible choice, not a grammatical error.
- Rejected: pt-BR/ch001.md [181] — 'seguindo os passos regulares do raciocínio' adds 'do raciocínio'. — It makes explicit what 'regular gradations' means here, the middle arguments named in the next sentence. No content is changed.
