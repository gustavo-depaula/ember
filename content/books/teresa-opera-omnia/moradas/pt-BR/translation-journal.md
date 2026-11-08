
## Termos

| continuanza | continuança | `m7-c3` ¶9, com a n. 2 (*Continuação*) |
| cierva (herida) | corça | `m7-c3` ¶15 |
| ñau | nau | `m7-c3` ¶16 e n. 18 |
| cosas ponzoñosas | coisas peçonhentas | `m7-c4` ¶3 |
| arrabal | arrabalde | `m7-c4` ¶3 |
| allegar / llegar almas | ajuntar almas | `m7-c4` ¶13, ¶14, ¶16 |
| obras, obras | obras, obras | `m7-c4` ¶8 |
| nuestro padre Elías | nosso pai Elias | `m7-c4` ¶13, com nota do tradutor |
| Santo Domingo | São Domingos | `m7-c4` ¶13 |
| Teresa de Jesús | Teresa de Jesus | `prologo` ¶2; `m7-c4` n. 20 |
| San Josef del Carmen (Toledo) | São José do Carmo | `prologo` ¶6 |
| Relación | Relação | `m7-c3` n. 1 |
| Camino de Perfección | Caminho de Perfeição | `m7-c4` n. 18 |
| Conceptos del amor de Dios | Conceitos do amor de Deus | `m7-c4` n. 18 |
| III Rey. (Vulgata) | 3 Reis | `m7-c4` n. 3 e 14 |

## Decisões

- Notas de Silverio que comentam só a grafia (*intrevalo*, *inispiraciones*, *Trenidad*, *so*, *ñau*, *alabalde*, *fierro*): o texto fica em português normal e a nota cita a forma espanhola; quando a nota não nomeia a forma, ela se acrescenta entre parênteses (`m7-c4` n. 9 e 11; `prologo` n. 2).
- Notas que comentam a construção ficam espelhadas no texto: `m7-c3` ¶15 "não porque entenda esta não o é" (n. 16); `m7-c4` ¶5 "Também lhes dão as almas" (n. 2), ¶6 "se reparastes a nisso" (n. 5) e "fazer-no-lo maior" (n. 6), ¶17 "que vamos" (n. 19, subjuntivo também em português); `prologo` ¶7 "e com o amor" sem *que* (n. 5).
- `m7-c3` ¶14 e n. 12: a glosa marginal leva os colchetes de Silverio na tradução portuguesa: "o tira[r] chama-se aqui quanto a perde[r] os sentid[os]".
- `m7-c3` ¶13 "no te dejan mirar": mantido o *te* singular da fonte.
- `m7-c4` ¶8 "ser tenida en nada" → "ser tida em alguma conta": *nada* em contexto negativo vale *algo*; "ser tida em nada" inverteria o sentido.
- `m7-c4` n. 8: a antífona latina fica sem tradução, como na fonte.
- `m7-c4` n. 20 (P. Rodrigo Álvarez) e `prologo` n. 1 (P. Francisco de Ribera): citações traduzidas para o português; María de San José fica na forma espanhola.
- Nota do tradutor `m7-c4` [^21], posta logo depois do ¶13: Elias como pai e fundador espiritual dos carmelitas, para explicar o "nosso pai Elias".
- Referências bíblicas das notas: livros com nome português, numeração da Vulgata como na fonte (3 Reis, Salmo 111:1, Salmo 17:26).

## Review log

### Part 1 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 7 minor. Read all 14 files of part 1: one meaning error (pronoun antecedent in m3-c2 ¶9), one wrong conjunction in a Silverio note, two translator's notes without markers, three Key Terms departures, one tense slip and one commentary sentence in a translator's note.
- `pt-BR/m3-c2.md` [9]: “Mas eu quereria que o tivéssemos” → “Mas eu quereria que a tivéssemos” — source 'que la tuviésemos': feminine *la* refers to *razón* ('I would want us to have the reason not to be content…'); 'o' turns it into *amor*, which is masculine in the source *(meaning)*
- `pt-BR/m4-c3.md` [33]: “Frei Luís de León, ou Gracián,” → “Frei Luís de León e Gracián,” — the source's *u* is the OCR of *y*, as in Silverio's other notes; the verb *leen* is plural, so both witnesses read *flaqueza* *(meaning)*
- `pt-BR/m4-c3.md` [13]: “E eu o chamo abobamento,” → “E eu o chamo abobamento[^18],” — translator's note [^18] on arrobamiento/abobamiento is defined, but its marker is missing from the text
- `pt-BR/m5-c1.md` [5]: “do Monte Carmelo, que em” → “do Monte Carmelo[^30], que em” — translator's note [^30] on the hermits of Mount Carmel is defined, but its marker is missing from the text
- `pt-BR/m1-c2.md` [37]: “que em boa parte desapareceu quando se aparam as margens.” → “que em boa parte desapareceu quando se apararam as margens.” — source 'cuando se recortaron': past event; the present tense clashes with 'desapareceu'
- `pt-BR/m4-c1.md`: “quando dilataste o meu coração”. A Santa contrapõe esse dilatar-se do coração ao aperto que descreve em seguida.” → “quando dilataste o meu coração”.” — the last sentence of translator's note [^21] only comments on what the text says next; the house rule removes such comment
- `pt-BR/m1-c2.md` [15]: “cobras, víboras e bichos peçonhentos que” → “cobras, víboras e coisas peçonhentas que” — Key Terms: cosas (em)ponzoñosas → coisas peçonhentas; 'bichos' is the book's rendering of *sabandijas*
- `pt-BR/m2.md` [5]: “fugir das cobras e bichos peçonhentos e entendam que é bom deixá-los” → “fugir das cobras e coisas peçonhentas e entendam que é bom deixá-las” — Key Terms: cosas emponzoñosas → coisas peçonhentas; the pronoun follows the feminine nouns, as in the source's *dejarlas*
- `pt-BR/m4-c1.md` [6]: “poucas vezes entram os bichos peçonhentos” → “poucas vezes entram as coisas peçonhentas” — Key Terms: cosas ponzoñosas → coisas peçonhentas
- Rejected: pt-BR/m1-c2.md [11] — 'caminho de todos' while the source reads 'camino de lodos' — 'lodos' is an OCR slip for 'todos'; the translation follows the right reading
- Rejected: pt-BR/m5-c3.md [22], pt-BR/m6-c1.md [20] — '6 ou 7', 'p. 73 ou 74' may render an OCR'd *y* — both 'o' and 'y' are possible readings here; no clear defect
- Rejected: pt-BR/m4-c3.md [33], pt-BR/m5-c1.md [30] — 'Córdoba' where other files use 'Córdova' — each file is internally consistent; not a defect
- Rejected: mechanical audit (emphasis, parentheses) — italics count and parentheses differ from the source — italics mark the Spanish forms Silverio's notes discuss, per the journal's policy; the added parentheses close the source's unbalanced ones or set off asides; nothing is lost
- Rejected: pt-BR/m4-c1.md [21] — is Ps 118:32 the end of the last psalm of Prime? — yes: the Retribue section (vv. 17–32) closes Prime in the Tridentine psalter

### Part 1 of 2, Round 2 (claude, full read)
Verdict: 1 meaning-level, 1 minor. Full read of part 1 (epilogo, m1-c1 to m6-c1): one pronoun commitment (m6-c1 ¶12) against the context and one commentary sentence in a translator's note; otherwise clean.
- `pt-BR/m6-c1.md` [12]: “que ele veio a entender que já não estava na mão dela.” → “que ele veio a entender que já não estava em sua mão.” — source 'vino él a entender que no era más en su mano': the subject is the confessor, so 'su' most naturally means his power to help, not hers; 'dela' assigns the incapacity to the soul. 'em sua mão' keeps the source's reading open. *(meaning)*
- `pt-BR/m5-c4.md`: “era o gesto com que o celebravam. A Santa toma destes costumes a imagem com que distingue a união destas moradas do desposório das sextas.” → “era o gesto com que o celebravam.” — translator's note [^16]: the last sentence only restates what the text says; the house rule removes such commentary, as round 1 did in m4-c1 [^21].
- Rejected: pt-BR/m4-c2.md [11] — 'quem o ama de verdade' where SRC reads 'quién le llama de verdad' — 'llama' is an OCR slip for 'ama' (autograph reading); the translation follows the right reading
- Rejected: pt-BR/m6-c1.md [^7] — note says 'apagou o *o*' while SRC says 'borró la e' — 'olvidado' has no e to erase; the OCR 'e' stands for 'o', and the note reads correctly
- Rejected: pt-BR/m4-c3.md [11] — 'desaparece:' has no word in the source — it makes explicit the contrast the source states with 'ya le parece que todo lo podrá en Dios'; nothing is added to the sense
- Rejected: mechanical audit (emphasis, parentheses) — italics and parentheses counts differ from the source — the italics mark the Spanish forms in Silverio's notes; the added parentheses close the source's unbalanced ones (m4-c1 [14], m4-c2 [10]) or set off asides (m5-c3 [12], [14]; m6-c1 [^6], [^15]); nothing is lost

### Part 1 of 2, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of m6-c1 [11]-[13] and the m5-c4 [^16] change: both round-2 fixes are correct and nothing is broken; no new defects.
- Rejected: pt-BR/m6-c1.md [12] — 'em sua mão' (round 2 fix) may still leave the referent unclear — the source 'en su mano' is itself ambiguous between the confessor and the soul; the possessive keeps that open, and the sentence reads correctly after the change
- Rejected: pt-BR/m6-c1.md [12] — 'Se o quer tomar' is singular where the source has 'Si le quieren tomar' — the subject is the tormented soul throughout the passage; the singular states the same sense and the paragraph stays consistent
- Rejected: pt-BR/m6-c1.md [12] — 'senão ao que padecem no inferno' where the source reads 'a los que padecen' — comparing the torment to what the damned suffer or to the damned themselves comes to the same thing; nothing is lost
- Rejected: pt-BR/m5-c4.md [^16] — the removal of the note's last sentence (round 2 fix) — the sentence only commented on the text; what remains ends cleanly at 'era o gesto com que o celebravam.'

### Part 2 of 2, Round 1 (claude, full read)
Verdict: 2 meaning-level, 4 minor. Full read of m6-c10 to prologo (15 files): fixed a wrong Pilate quote, a misleading clitic, three orphaned translator's-note markers, and one 1 Reis that should be 3 Reis per the journal.
- `pt-BR/m6-c10.md` [7]: “lhe disse que era a verdade[^2]” → “lhe perguntou o que era a verdade[^2]” — source 'le dijo qué era verdad' is Pilate's question (Jo 18:38); 'lhe disse que era a verdade' reads as Pilate stating that something was the truth *(meaning)*
- `pt-BR/m6-c4.md` [10]: “fica aberta para nos entrar” → “fica aberta para entrarmos” — source 'queda abierta para entrarnos' means 'for us to enter'; 'para nos entrar' reads as 'to enter us' *(meaning)*
- `pt-BR/m6-c5.md` [4]: “quando o âmbar a levanta, se o tendes observado” → “quando o âmbar a levanta[^14], se o tendes observado” — translator's note [^14] on amber is defined but has no marker in the text
- `pt-BR/m6-c6.md` [5]: “este grande Deus das Cavalarias.” → “este grande Deus das Cavalarias[^16].” — translator's note [^16] on 'Deus das Cavalarias' is defined but has no marker in the text
- `pt-BR/m6-c7.md` [12]: “posto na f[^21];” → “posto na f[^21][^28];” — translator's note [^28] on the truncated 'f' is defined but has no marker in the text
- `pt-BR/m6-c7.md` [34]: “(Cf. 1 Reis 18:30-39.)” → “(Cf. 3 Reis 18:30-39.)” — source 'Lib. III Rey.'; the journal's Key Terms and decisions keep Vulgate numbering as '3 Reis'
- Rejected: pt-BR/m6-c6.md [27], [29] — source note says 'entre paréntesis', translation says 'entre colchetes' — the text actually uses square brackets, so the translation describes what the reader sees
- Rejected: pt-BR/m6-c4.md [^23] — translator's note offers the Mass Memento as a possible reading of 'memento' — it is presented as one of two possibilities, and the Memento's description is accurate
- Rejected: pt-BR/m6-c11.md [9] [^9] — translator's note on 'penas acidentais' could be read as doctrinal comment — it explains a technical term the reader needs to follow the text
- Rejected: pt-BR/m6-c10.md [6] — '¿Hasta cuándo… imitaremos?' rendered 'Quando chegaremos… a imitar' — this is a defensible reading of the rhetorical question

### Part 2 of 2, Round 2 (claude, full read)
Verdict: 2 meaning-level, 1 minor. Full read of m6-c10 to prologo (15 files): fixed a reversed sentence on the origin of the grace (m6-c2), an ambiguous rendering of 'se le pasó por alto' (m6-c4 n. 4), and cut an unconfirmable claim about the English translation in a translator's note (m6-c7).
- `pt-BR/m6-c2.md` [10]: “O nascimento desta mercê é donde vem o que ficou dito;” → “Esta mercê nasce de onde nasce o que ficou dito;” — source 'Su nacimiento de esta merced es de donde lo que queda dicho': this grace springs from the same place as the impulses described before; the PT says the impulses come from this grace's origin, which reverses the relation *(meaning)*
- `pt-BR/m6-c4.md` [22]: “já Gracián o deixou passar na cópia de Córdova” → “já Gracián o omitiu por descuido na cópia de Córdova” — source 'a Gracián se le pasó por alto': Gracián overlooked it, so it is missing from his copy; 'deixou passar' can be read as 'let it through', the opposite of the contrast with Fr. Luís, who printed it *(meaning)*
- `pt-BR/m6-c7.md`: “; pelo sentido, a meditação vai do Horto até a cruz (a tradução inglesa de Stanbrook entende “até a crucifixão”).” → “; pelo sentido, a meditação vai do Horto até a cruz.” — translator's note [^28]: the exact reading of the Stanbrook translation cannot be confirmed from the material; cut back to the inference from the sense
- Rejected: pt-BR/m6-c6.md [^2], pt-BR/m6-c7.md [^1], [^16] — 'Córdoba', while m6-c4 and m7 use 'Córdova' — each file is internally consistent and the Key Terms table has no row for the city; not an objective defect
- Rejected: pt-BR/m6-c7.md [10] — 'nosso Pai Elias' against the Key Terms 'nosso pai Elias' — the source capitalizes 'Padre' here; house rules forbid normalizing reverential capitalization
- Rejected: pt-BR/m7-c2.md [^11] — the note gives 'Mihi bivere cristus es' where the source reads 'MU bivere cristas es' — these are evident OCR slips in quoting the autograph; not worth reverting

### Part 2 of 2, Round 3 (claude, delta read)
Verdict: 0 meaning-level, 0 minor. Delta read of the three round-2 fixes (m6-c2 [10], m6-c4 n. 4, m6-c7 [^28]) and their neighbouring paragraphs: all fixes are correct and no new defects were found.
- Rejected: pt-BR/m6-c2.md [10] — Check of the round-2 fix 'Esta mercê nasce de onde nasce o que ficou dito' — Matches 'Su nacimiento de esta merced es de donde lo que queda dicho': the grace has the same origin as the impulses described before. The sentence and its neighbours stay intact.
- Rejected: pt-BR/m6-c2.md [10] — 'estando a rezar' is a European-Portuguese construction — It is acceptable in literary pt-BR and renders 'estando rezando' without the awkward double gerund. This is a style choice, not a defect.
- Rejected: pt-BR/m6-c2.md [9] — Antecedent of 'o' in 'jamais o pôde ter' — It refers to 'temor', as the source's 'le' does. The reading is correct.
- Rejected: pt-BR/m6-c4.md [22] — Check of the round-2 fix 'o omitiu por descuido' — It correctly renders 'se le pasó por alto' and keeps the contrast with Fr. Luís, who printed the addition.
- Rejected: pt-BR/m6-c4.md [22], [23] — The audit flags italics absent from the source — In [22] the italics set off the quoted marginal addition. In [23] they mark the Spanish word forms, which the journal's decision on spelling notes requires.
- Rejected: pt-BR/m6-c7.md [^28] — Check of the round-2 cut of the Stanbrook claim — The remaining note keeps only the inference from the sense, and its sentence is complete.
