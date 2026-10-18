# Diário de tradução — Confissão de Fé por Partes (pt-BR)

Fonte: en-US/ (trad. S. D. F. Salmond, Ante-Nicene Fathers, vol. 6, 1886; revisada para New Advent por Kevin Knight).
Destino: pt-BR.

## Termos

| Inglês | Português | Notas |
|---|---|---|
| Gregory Thaumaturgus | Gregório Taumaturgo | como nas obras irmãs |
| A Sectional Confession of Faith | Confissão de Fé por Partes | gr. *Hē katà méros pístis* |
| Apostolic Confession | Confissão Apostólica | |
| Word | Verbo | |
| God the Word | Deus Verbo | como em *Doze Capítulos sobre a Fé* |
| word that is spoken / uttered | palavra proferida | analogia rejeitada |
| Holy Spirit / Holy Ghost | Espírito Santo | as duas formas inglesas convergem |
| the Holy Trinity / holy Trinity | a Santíssima Trindade | "holy and august Trinity" → *santa e augusta Trindade* |
| Monad | Mônada | |
| Tetrad | Tétrade | |
| divinity | divindade | |
| Godhead | Deidade | para distinguir de *divinity* |
| lordship | senhorio | |
| person | pessoa | maiúscula onde a fonte tem maiúscula |
| hypostasis | hipóstase | |
| subsistence / subsist | subsistência / subsistir | |
| substance | substância | |
| consubstantial / consubstantiality | consubstancial / consubstancialidade | |
| property (of the Father) | propriedade (do Pai) | |
| Begetter / Begotten | Genitor / Gerado | |
| unbegotten | ingênito | |
| only-begotten | unigênito | |
| offspring | progênie | "only-begotten Offspring" → *Progênie unigênita* |
| first-born of the creature | primogênito da criatura | |
| aeon | éon | nota do tradutor 1 |
| First Cause | Causa Primeira | |
| appellation / designation | denominação / nome | |
| incarnation / incarnate / unincarnate | encarnação / encarnado / não encarnado | |
| economy | economia | nota do tradutor 2 |
| energy | energia | |
| impassibility / passibility / passible | impassibilidade / passibilidade / passível | |
| affections / sensibilities (of the flesh) | afeições / sensibilidades (da carne) | |
| appearing (of Christ) | manifestação | |
| worship / cultus | adoração, culto / culto | |
| doxology | doxologia | |
| acknowledge | confessar, reconhecer | *confessar* no sentido doutrinal |
| anathematize | anatematizar | |
| make divine | divinizar | |
| very God of very God | Deus verdadeiro de Deus verdadeiro | |
| forgiveness of sins | remissão dos pecados | fórmula do Credo |
| Sabellius | Sabélio | nota do tradutor 3 |
| the Greeks | os gregos | os pagãos |

## Decisões

- Título: "Confissão de Fé por Partes", do grego *katà méros*, que a fonte verte por "Sectional".
- Referências bíblicas: mantidas na posição da fonte, logo após a citação e sem parênteses. Quando a citação termina no meio da frase, a pontuação vem depois da referência.
- Citações sem referência na fonte ficam sem referência: Salmo 33:6 (§ 10), Romanos 15:15-19 (§ 11) e 2 Coríntios 11:4 (§ 22).
- § 7: a fonte remete a "1 Corinthians 3:6" para "Vós sois o templo de Deus", que está em 1 Coríntios 3:16. A referência ficou como na fonte, sem nota.
- § 8: "we call the Son God" foi vertido por *chamamos Deus ao Filho*, para evitar a leitura "Filho de Deus".
- Pronomes referidos a Deus em maiúscula (Ele, O, Si, d’Ele), salvo a primeira pessoa de Deus dentro de citações (Hebreus 3:7-11), que fica em minúscula como na fonte.
- Os erros tipográficos da fonte ("mast", "lie", "into wit", "sane") foram traduzidos pelo sentido evidente.
- Notas do tradutor: [^1] "éon" (§ 1); [^2] "economia" (§ 6); [^3] Sabélio (§ 7).

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 1 minor. Full read of ch001 [1]–[49], footnotes, book.json and journal: one minor fix (a reflexive pronoun referring to God not capitalized in [49]); the parentheses audit flag in [11] was checked and rejected.
- `pt-BR/ch001.md` [49]: “o não encarnado, que se manifestou na carne” → “o não encarnado, que Se manifestou na carne” — the reflexive refers to God; the file and the journal capitalize pronouns referring to God (cf. [37] 'Se manifestou', [49] 'Ele Se encarnou')
- Rejected: pt-BR/ch001.md [11] — Audit flag: the source has two parentheses, pt-BR has one; '(the) Spirit' became 'no Espírito' — the bracket marks an English article supplied by the editor; Portuguese requires the article anyway, so a bracket would mark nothing; the second bracket '(rito do)' is kept
- Rejected: pt-BR/ch001.md [49] — 'diz em breve' for 'says shortly' — 'em breve' in the sense of 'em poucas palavras' is attested in Portuguese and matches a possible reading of 'shortly'; not an objective error
- Rejected: pt-BR/ch001.md [45] — 'fomos todos batizados' for 'are we all baptized' — the KJV present refers to a completed baptism; the past tense is the normal Portuguese rendering
- Rejected: pt-BR/ch001.md [25] — the opening 'For' of 1 Cor 2:4 is not translated — the connective has no weight in the excerpted quotation; the meaning is unchanged

### Round 2 (codex, full read)
Verdict: 2 meaning-level, 2 minor. Leitura integral dos parágrafos [1]–[49], notas, book.json, diário e auditoria: dois defeitos de sentido e dois menores.
- `pt-BR/ch001.md` [7]: “a sabedoria por cujo instrumento todas as coisas foram criadas” → “a sabedoria por meio da qual todas as coisas foram criadas” — A fonte apresenta a própria sabedoria como meio da criação; a tradução introduz um instrumento pertencente à sabedoria. *(meaning)*
- `pt-BR/ch001.md` [15]: “permanece no Pai, se manifesta” → “permanece no Pai, Se manifesta” — O pronome refere-se ao Filho; a maiúscula segue a convenção do diário e a correção equivalente aceita na rodada anterior.
- `pt-BR/ch001.md` [47]: “como um só com o que vem da pessoa do Pai” → “como proveniente da pessoa do Pai” — “As one from the person of the Father” apresenta o discurso como proveniente da pessoa do Pai; não afirma sua identidade com outro discurso. *(meaning)*
- `pt-BR/translation-journal.md`: “§§ 8 e 15: "we call the Son God"” → “§ 8: "we call the Son God"” — A expressão e a tradução citadas ocorrem no § 8, mas não no § 15.
- Rejected: pt-BR/ch001.md [11] — Diferença na quantidade de parênteses apontada pela auditoria. — “(The) Spirit” foi corretamente vertido como “no Espírito”; os parênteses assinalam um artigo suprido em inglês. O outro parêntese foi preservado em “(rito do)”.

### Round 3 (claude, delta read)
Verdict: 0 meaning-level, 2 minor. Delta read of ch001 [6]–[8], [14]–[16], [46]–[48], the footnotes and the journal: all four previous fixes are correct; one minor fix moves the [^3] marker in [15] to the name Sabélio.
- `pt-BR/ch001.md` [15]: “1 Coríntios 3:6[^3]” → “1 Coríntios 3:6” — a nota [^3] trata de Sabélio; colocada após a referência bíblica, parece comentar 1 Coríntios 3:6 (que a fonte cita erradamente por 3:16)
- `pt-BR/ch001.md` [15]: “nos desvinculamos de Sabélio, que diz” → “nos desvinculamos de Sabélio[^3], que diz” — o marcador da nota sobre Sabélio deve ficar junto ao nome que ela explica
- Rejected: pt-BR/ch001.md [7] — 'por meio da qual' could lose the idea of instrumentality in 'by whose instrumentality' — 'por meio de' expresses instrumentality and makes the wisdom itself the means, as the source does
- Rejected: pt-BR/ch001.md [15] — capitalized 'Se manifesta' inside Sabellius's view — the pronoun refers to the Son (the Word); the journal capitalizes pronouns that refer to God, and the reported view does not change the referent
- Rejected: pt-BR/ch001.md [47] — 'como proveniente da pessoa do Pai' drops 'one' — 'as one from' here means 'as coming from'; the earlier rendering added an identity the source does not state

### Round 4 (codex, delta read)
Verdict: 0 meaning-level, 0 minor. Revisados os parágrafos [14]–[16], as notas, book.json e o diário: o deslocamento de [^3] para Sabélio está correto, sem duplicação da definição; nenhum novo defeito.
- Rejected: pt-BR/ch001.md [15] — A citação sobre o templo de Deus remete a 1 Coríntios 3:6. — A referência reproduz a fonte canônica, conforme a regra e a decisão registrada no diário; não cabe corrigi-la na tradução.
