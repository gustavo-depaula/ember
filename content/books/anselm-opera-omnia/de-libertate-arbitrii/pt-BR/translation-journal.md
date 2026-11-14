# Diário de tradução — Sobre a liberdade do arbítrio (pt-BR)

Fonte: la/ — S. Anselmi Cantuariensis archiepiscopi opera omnia, ed. J.-P. Migne, Patrologia Latina 158 (Paris 1853), texto de Gerberon; TEI XML do Corpus Corporum (Universidade de Zurique), texto 10618.
Destino: pt-BR.

## Termos

| Latim | Português | Notas |
|---|---|---|
| Anselmus Cantuariensis | Santo Anselmo de Cantuária | Convenção das obras irmãs. |
| De libertate arbitrii | Sobre a liberdade do arbítrio | Título do livro, conforme *Sobre a verdade*. |
| Caput | Capítulo | Numeração romana mantida. |
| MAG. / DISC. | MEST. / DISC. | Mestre e discípulo; tratamento por tu, como em *Sobre a verdade*. |
| libertas arbitrii / liberum arbitrium | liberdade do arbítrio / livre-arbítrio | Preservada a distinção entre a liberdade e o arbítrio dotado dela. |
| arbitrium | arbítrio | |
| rectitudo voluntatis | retidão da vontade | Convenção das obras irmãs. |
| propter ipsam rectitudinem | por causa da própria retidão | Fórmula fixa da definição. |
| propter se servata | conservada por si mesma | Definição da justiça, como em *Sobre a verdade*. |
| servare / tenere | conservar / manter | |
| potestas / potentia / impotentia | poder / poder / incapacidade | Conforme as obras irmãs; *potens / impotens* = poderosa / impotente (título do c06). |
| potestas peccandi / non peccandi | poder de pecar / de não pecar | |
| servus / servitus / servire | servo / servidão / servir | Também em João 8:34, para manter a família de palavras do argumento. |
| dominari | dominar | |
| sponte / ex necessitate | espontaneamente / por necessidade | |
| cogere / coactio | coagir / coação | Conforme *Por que Deus se fez homem*. |
| invitus / nolens / volens | contra a vontade / não querendo / querendo | c05; distinção que sustenta o argumento. |
| tentatio | tentação | |
| deserere / averti / abstrahi | abandonar / ser desviado / ser arrancado | |
| recuperare / reddere | recuperar / restituir | |
| visus / visio | vista / visão | c07: *visus* designa a faculdade e o ato; *visio*, o ato. |
| instrumentum volendi / usus, opus | instrumento de querer / uso, obra | c07. |
| aequivocatio / aequivoce | equivocidade / equivocamente | c07. |
| fortitudo / fortiter | força / fortemente | c07. |
| diffinitio / genus / differentiae | definição / gênero / diferenças | c13. |
| dividere / divisio | dividir / divisão | c14. |
| separabiliter / inseparabiliter | de modo separável / de modo inseparável | c14. |
| recuperabiliter / irrecuperabiliter | de modo recuperável / de modo irrecuperável | c14. |
| confirmare / ruina | confirmar / queda | c14: confirmação dos anjos bons. |
| electi / reprobi | eleitos / réprobos | Convenção das obras irmãs. |
| apostata angelus | anjo apóstata | c02. |
| rationalis natura / rationalis creatura | natureza racional / criatura racional | Convenção das obras irmãs. |
| nefas est dicere | é ímpio dizer | Convenção do Monológio. |
| salus | saúde; salvação | Saúde em c05 (exemplo do absinto); salvação em c09. |
| Joan. / Psal. | João / Salmo | Referências com dois-pontos; numeração dos Salmos da fonte. |

## Decisões

- *Invitus*, *nolens* e *volens* traduzidos de modo fixo por “contra a vontade”, “não querendo” e “querendo”, porque o c05 define um termo pelo outro. A convenção do Monológio (*volens / nolens* = “por querer / contra a vontade”) não se aplica aqui, pois *invitus* precisa de forma própria.
- *Servus peccati* em João 8:34 traduzido por “servo do pecado”, e não “escravo”, para manter a família servo / servidão / servir em que se apoiam os capítulos II, X, XI e XII.
- *Salus* em c09: “salvação” nos dois usos (temporal e eterno), para conservar o paralelo do argumento entre *salus temporalis* e *salus aeterna*.
- Em c06, *impugnare… expugnare nequit invitam* traduzido por “pode combater a vontade que não consente, mas não pode subjugar a vontade que não consente”.
- Erros residuais do OCR corrigidos tacitamente na tradução: *per re* → *per se* (c03), *ra ionalis*, *Qomodo*, *sepaparabiliter*, *separabililer*, *saepe fatam* (= *saepefatam*, “tantas vezes mencionada”, c08), *vivendi* → *videndi* (duas vezes em c04), *Nonne… notum!* lido como pergunta (c04), *Si ergo fit* → *Sic ergo fit* (c10).
- c03 [23]: o texto traz *Si non adesset* e *dicet se posse videre montem*; o sentido do exemplo exige “se o monte estivesse presente” e “dirá que não pode ver”, como na tradição textual comum. Traduzido conforme o sentido.
- c13 [4]: *a potestati* lido como *a potestate*.
- Os parágrafos do discípulo sem rubrica no início de c05, c11 e c12 continuam a fala anterior e ficam sem rubrica, como na fonte.
- Notas do tradutor: c07 [^1], sobre a teoria antiga da visão por um raio que sai dos olhos (extramissão); c13 [^1], sobre a definição por gênero e diferenças na dialética de Porfírio e Boécio.

## Review log

### Round 1 (claude, full read)
Verdict: 0 meaning-level, 2 minor. Full read of c01–c14, book.json and the journal: the c05 title drifted from the Key Terms entry for cogere (fixed in the heading and book.json); no other defects.
- `pt-BR/c05.md` [1]: “Que nenhuma tentação obriga alguém” → “Que nenhuma tentação coage alguém” — source: cogat; the Key Terms table sets cogere = coagir, and the body of c05 and c06 uses coagir/coage throughout
- `book.json`: “Capítulo V. Que nenhuma tentação obriga alguém a pecar contra a vontade” → “Capítulo V. Que nenhuma tentação coage alguém a pecar contra a vontade” — keeps the toc title the same as the corrected c05 heading (cogat = coage, per Key Terms)
- Rejected: pt-BR/c05.md [3] — audit flag: repeated word “quer quer” — renders omnis volens ipsum suum velle vult: subject “todo aquele que quer” followed by the verb “quer”; this is correct Portuguese and intended
- Rejected: pt-BR/c09.md [2]-[3] — salus rendered as “salvação” where the sense is bodily safety (fear of death, torments) — a deliberate decision recorded in the journal to keep the parallel salus temporalis / salus aeterna; “salvação” also means rescue from danger, and “salvação temporal” in [3] settles the sense
- Rejected: pt-BR/c08.md [2] — Nunquid vel Deus potest rendered “Acaso nem mesmo Deus lhe pode tirar” — nunquid expects a negative answer; the Portuguese question carries the same expectation and agrees with the chapter title
- Rejected: pt-BR/c03.md [13] — a sentence printed as a question in the source is rendered as a statement — the source’s ? marks a rhetorical clause; the meaning is unchanged

### Round 2 (codex, full read)
Verdict: 1 meaning-level, 3 minor. Leitura integral de c01–c14, das duas notas do tradutor, de book.json e do diário: um defeito de sentido e três menores.
- `pt-BR/c01.md` [5]: “o livre-arbítrio divino e o dos anjos bons não pode pecar” → “o livre-arbítrio divino e o dos anjos bons não podem pecar” — O sujeito composto exige concordância verbal no plural.
- `pt-BR/c07.md` [13]: “a vontade não é arrastada por nenhuma força alheia” → “a vontade não é arrancada por nenhuma força alheia” — Abstrahitur corresponde a «ser arrancado», conforme a tabela de termos do diário.
- `pt-BR/c08.md` [19]: “a arrasta da retidão que ela mantém” → “a arranca da retidão que ela mantém” — Abstrahere corresponde a «arrancar», conforme a convenção registrada para abstrahi no diário.
- `pt-BR/c11.md` [2]: “porque eu já pensava estar certo de que o homem sempre tem a liberdade do arbítrio” → “porque eu já pensava ser seguro para o homem ter sempre a liberdade do arbítrio” — Securum exprime segurança, não certeza sobre uma proposição. A advertência sobre a perda da retidão abala a segurança que o discípulo julgava encontrar na posse permanente do livre-arbítrio. *(meaning)*
- Rejected: Diário, tabela de termos: cogere / coactio — A auditoria não encontrou a forma literal «coagir» na tradução. — O verbo aparece flexionado, como em «coage», «coagido» e «coagi-la»; a ausência do infinitivo não contradiz a tabela.

### Round 3 (claude, delta read)
Verdict: 1 meaning-level, 0 minor. Delta read of four changes and their neighbours (c01, c07, c08, c11): three correct; the c11 [2] rewrite misplaces the subject of securum and is corrected.
- `pt-BR/c11.md` [2]: “porque eu já pensava ser seguro para o homem ter sempre a liberdade do arbítrio” → “porque eu já pensava que o homem estava seguro de ter sempre a liberdade do arbítrio” — source: putabam esse securum hominem semper habere libertatem arbitrii; securum agrees with hominem, so the man is secure in always having free choice. «ser seguro para o homem ter» says that having it is safe for man, which distorts the sense *(meaning)*
- Rejected: pt-BR/c01.md [5] — plural «podem» against the singular potest — the Portuguese has two noun phrases («o livre-arbítrio divino e o dos anjos bons»), so the plural is correct agreement and does not change the sense
- Rejected: pt-BR/c07.md [13], pt-BR/c08.md [19] — «arrancada» / «arranca» for abstrahi / abstrahere — they match the Key Terms table and c11 [3] («ser arrancado da retidão»); concord and sentence intact
- Rejected: journal, Key Terms: cogere / coactio — audit: «coagir» ×0 in pt-BR — already rejected in round 2: the verb occurs in inflected forms (coage, coagido, coagi-la)

### Round 4 (codex, full read)
Verdict: 2 meaning-level, 0 minor. Leitura integral de c01–c14, das duas notas do tradutor, de book.json e do diário; encontrados dois defeitos de sentido.
- `pt-BR/c11.md` [2]: “que o homem estava seguro de ter sempre a liberdade do arbítrio” → “que o homem estava em segurança por ter sempre a liberdade do arbítrio” — Securum qualifica hominem, conforme reconhecido na rodada 3, mas exprime segurança, não certeza. Em português, «estar seguro de ter» significa estar certo de possuir: a redação atual reintroduz esse desvio semântico. O discípulo julgava que a posse permanente da liberdade o deixava em segurança. *(meaning)*
- `pt-BR/c12.md` [3]: “só então não temos aquele poder que a sua presença nos dá” → “então só nos falta aquele poder que a sua presença nos dá” — Tunc solummodo non habemus illam potestatem restringe aquilo que falta: falta apenas o poder proporcionado pela presença do sol. «Só então» restringe o momento, afirmando indevidamente que esse poder só falta nessa circunstância. *(meaning)*

### Round 5 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of c11 [1]–[3] and c12 [2]–[4]: both changes are correct and their neighbours are unbroken; no defects.
- Rejected: pt-BR/c11.md [2] — «estava em segurança por ter» might over-commit the reading of securum, which could be impersonal ("it was safe/certain that man always has"). — The reading of securum with hominem was settled in round 3. The new wording gives the sense of safety, not certainty, and fits the disciple's exultation now checked by the servitude. Concord and sentence are intact.
- Rejected: pt-BR/c12.md [3] — «então só nos falta aquele poder» repeats «falta» from the preceding clause. — The repetition mirrors the Latin parallel (deest … non habemus). The restriction now falls on what is lacking, as tunc solummodo non habemus requires. The second half («só quando nos falta aquela retidão») still matches tantummodo quando.
- Rejected: journal, Key Terms: cogere / coactio — Audit: «coagir» ×0 in pt-BR. — Already rejected in rounds 2 and 3: the verb occurs in inflected forms (coage, coagido, coagi-la).
