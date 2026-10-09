# Translation Journal — Second Apology (pt-BR)

Source: en-US (trans. Marcus Dods and George Reith, Ante-Nicene Fathers, Vol. 1; via New Advent)
Target: pt-BR

## Key Terms

Conventions inherited from the sibling Justin books (`first-apology/pt-BR`, `discourse-to-the-greeks/pt-BR`) are marked *(sibling)*.

| English | Portuguese | Notes |
|---------|------------|-------|
| Justin Martyr (author) | Justino Mártir | *(sibling)* book.json `author` |
| Second Apology | Segunda Apologia | matches *Primeira Apologia* |
| the Word (capitalized) | o Verbo | *(sibling)* |
| word (lowercase: "spermatic word", "implanted word", "word diffused", "by the word") | verbo (minúsculo) | mirrors the source's capitalization; "spermatic word" = "verbo seminal" |
| seed of reason [the Logos] | semente da razão [o Logos] | translator's bracket kept |
| the right Reason, when He came (Ch. 9) | a reta Razão, quando veio | capital as in the source; "right reason" (faculty) = "reta razão" |
| demons / devils | demônios / diabos | *(sibling)* kept distinct as the source alternates |
| evil demons / wicked demons / evil spirits | demônios maus / demônios maus / espíritos maus | |
| unbegotten / ineffable | ingênito / inefável | *(sibling)* |
| divine pronouns | Ele, Sua, d'Ele, Lhe, Se | *(sibling)* capitalized, straight apostrophe |
| address to the Romans / Senate | vós (plural) | *(sibling)*; "you, the Emperor" (Ch. 2) also vós ("ó Imperador … vós concedestes"). Lucius addressing Urbicus: tu |
| convicted | provado culpado | *(sibling)* never `convicto` |
| men of like passions | homens sujeitos às mesmas paixões | Ch. 1; Ch. 10 "made of like passions" = "Se fez sujeito às mesmas paixões" |
| Urbicus, Ptolemæus, Lucius, Crescens | Úrbico, Ptolomeu, Lúcio, Crescente | |
| Heraclitus, Musonius, Socrates, Xenophon, Plato | Heráclito, Musônio, Sócrates, Xenofonte, Platão | |
| Sardanapalus, Epicurus / Epicureans | Sardanapalo, Epicuro / epicuristas | |
| Noah / Deucalion | Noé / Deucalião | |
| Neptune, Pluto, Saturn, Jupiter, Hercules | Netuno, Plutão, Saturno, Júpiter, Hércules | *(sibling)* Roman forms |
| Stoics / Cynic | estoicos / cínico | |
| Sotadists, Philænidians, Dancers | sotadistas, filênidas, dançarinos | lowercase, as group names |
| Simon of my own nation | Simão, da minha própria nação | *(sibling)* Simão |
| Pontius Pilate | Pôncio Pilatos | |
| Virtue / Vice (personified, Ch. 11) | a Virtude / o Vício | Vício is masculine in Portuguese, so the pronouns for Vice follow (ele/o), not the source's "her" |
| bill of divorce | carta de divórcio | |
| fixed to the stake | pregado ao poste | |

## Translation Decisions

- 2026-10-09: First pt-BR translation. Single file `ch001.md` (title, italic subtitle, 15 chapters), same headings and 1:1 paragraph structure as en-US.
- **Editor footnotes**: none in the source. Translator brackets ([a Christian], [virtue and vice], [the Logos], [among men]) kept, translated.
- **Quote style**: curly “” as in the source and the *Primeira Apologia*. Virtue's speech in Ch. 11 is unquoted in the source and left unquoted.
- **Ch. 5 "ascribed them to god himself"**: lowercase in the source (the pagan supreme god, Jupiter); rendered "ao próprio deus", lowercase.
- **Ch. 12 "intercourse with woman"**: rendered "comércio … com mulheres" for natural Portuguese.
- **Ch. 13 "the seed and imitation imparted"**: "a semente e a imitação concedidas".

## Source Edits (en-US, OCR-class slips)

All against the ANF print; no edition attests the slip.

- Ch. 2 "in the prison And," → "in the prison. And," (missing period)
- Ch. 10 "For I whatever" → "For whatever"; "since they I did not" → "since they did not" (stray "I")
- Ch. 12 "other-things" → "other things"
- Ch. 13 "tile wicked disguise" → "the wicked disguise"; "imitation impacted" → "imitation imparted"
- Ch. 14 "may he known" → "may be known"; "a fair chalice" → "a fair chance"

## Review log

### Round 1

Focus: completeness, paragraph by paragraph, plus the mechanical audit and `book.json`. Verdict: CLEAN, no changes.

Considered and rejected:
- Ch. 2 "when she was overpersuaded by her friends, who advised her still to continue with him" → "foi dissuadida pelos amigos": being persuaded to stay is being dissuaded from the divorce named just before. Same event, not a reversal.
- Ch. 11 "she would always enable him to pass his life in pleasure" → "ele sempre o faria passar a vida": masculine *ele* refers to o Vício (see Key Terms), and "se o seguisse" makes the referent clear.
- Ch. 13 "the Word who is from the unbegotten and ineffable God" → "o Verbo que procede do Deus ingênito": *proceder de* means "come from" and adds nothing to the source.
- Ch. 7 "they are not very felicitous in what they say" → "não são muito felizes no que dizem": *feliz* in the sense "apt" is standard usage.
- Ch. 12 "not even the slightest sympathy with them" → "a menor simpatia": *simpatia* means affinity, the source's sense. Not a false friend here.

Evidence: `ember-translation-evidence/church-fathers__justin-martyr__second-apology/review-1.md` (outside the repo).

### Round 2

Focus: clause-by-clause bilingual fidelity read against en-US, plus the mechanical audit and `book.json`; Key Terms rows and journal claims re-grepped. Verdict: CLEAN, no changes.

Considered and rejected:
- Ch. 2 "considering it wicked to live any longer as a wife" → "considerando ímpio": *ímpio* (impious) names the same moral judgment as "wicked" in this context. Not a mistranslation.
- Ch. 2 "when the man came to Urbicus" → "quando o homem foi levado a Úrbico": a prisoner held by the centurion "comes" before the prefect by being brought. Same event.
- Ch. 2 "Why have you punished this man, not as an adulterer, nor … convicted of any crime" → "Por que puniste este homem, que não é adúltero, … nem foi provado culpado": Lucius's point is that the man is none of these and has only confessed the name. The relative clause carries the same contrast with "mas que apenas confessou".
- Ch. 5 "after they were enslaved by lustful passions" → "depois de se terem escravizado às paixões lascivas": *escravizar-se a* is "to become a slave to", the same state as the English passive. No change of agent.

Evidence: `ember-translation-evidence/church-fathers__justin-martyr__second-apology/review-2.md` (outside the repo).

### Round 3

Focus: source-blind cold read of the pt-BR, marks verified against en-US, then a spelling, diacritics, crase, hyphenation and punctuation sweep, plus the mechanical audit and `book.json`. Verdict: 3 defects, all misdirected pronouns, fixed.

Fixed:
- Ch. 2 "tendo ela se afastado dele contra a sua vontade" → "sem que ele o desejasse". Source: "without his desire". *Sua* defaults to the clause subject *ela*, which reads as "against her will".
- Ch. 2 "um centurião — que havia lançado Ptolomeu na prisão e lhe era amigo —" → "e era amigo do marido". Source: "friendly to himself" (the husband). *Lhe* attached to Ptolomeu, the nearest noun.
- Ch. 15 "se derdes a este livro a vossa autoridade, nós o exporemos diante de todos" → "exporemos Simão diante de todos". Source: "we will expose him" (Simon). *O* attached to *livro*, which reads as "we will display the book".

Considered and rejected:
- Ch. 1 "quem quer que seja corrigido … e os demônios maus … incitam-nos": the broken construction is the source's ("whoever is corrected … and the evil demons … incite them").
- Ch. 5 "sujeitaram … o gênero humano … ensinando-os": plural by sense follows the source's "the human race … teaching them".
- Ch. 9 "uma vez que estes não são injustos, e o seu Pai os ensina pelo verbo": obscure, but it is as obscure in the source ("since these are not unjust, and their Father teaches them by the word").

Evidence: `ember-translation-evidence/church-fathers__justin-martyr__second-apology/review-3.md` (outside the repo).

### Round 4

Focus: function words (prepositions, articles, demonstratives, connectors, possessive *seu/sua*), every heading, the tu/vós address traced turn by turn, and places where the Portuguese must commit and the source is open. Also the mechanical audit and `book.json`, with Key Terms counts re-checked. Verdict: CLEAN, no changes.

Considered and rejected:
- Ch. 2 "by sharing his table and his bed, become a partaker also in his wickednesses" → "partilhando a sua mesa e o seu leito, participante também das suas maldades": *sua/suas* directly follows "com ele", and *participante de* needs someone else's acts, so the reading "her own wickedness" does not hold.
- Ch. 3 "by some of those I have named, or perhaps by Crescens" → "por algum dos que nomeei": the alternative is one man (Crescens), so a single agent fits. Singular is defensible.
- Ch. 5 "did these things to … cities, and nations, which they related, ascribed them" → "às nações, as quais relatavam, as atribuíram": *as atribuíram* that follows ties *as quais* to *estas coisas*. It does not attach to *nações*.
- Ch. 7 "the seed of the Christians, who know that they are the cause" → "que sabem que são eles a causa": the plural verb matches the source's "who know".
- Ch. 12 "to avoid such instruction, and all who practise them" → "todos os que a praticam": *a* refers to *instrução*, the same teaching the source's "them" points to.

Evidence: `ember-translation-evidence/church-fathers__justin-martyr__second-apology/review-4.md` (outside the repo).

### Round 5

Focus: Key Terms term-frequency diff per chapter in both directions, every journal claim grepped (Key Terms, Translation Decisions, Source Edits, *(sibling)* markers), and every proper name checked against standard Portuguese and sibling pt-BR works. Also the mechanical audit and `book.json`. Verdict: CLEAN, no changes.

Considered and rejected:
- Ch. 4 "either in word or deed" → "seja em palavra, seja em obra": the lowercase-*word* row covers only the Logos uses it lists. Here *word* means speech, so *palavra* is correct.
- Ch. 15 "Philænidians" → "filênidas": no sibling form exists for the group name. It is built regularly on the stem of Philaenis (*Filênis* in Tatian, genitive *Philaenidis*), so it is not a wrong name.
- Ch. 15 "Epicureans" → "epicuristas": sibling works use both *epicuristas* and *epicureus*, and both are standard.

Evidence: `ember-translation-evidence/church-fathers__justin-martyr__second-apology/review-5.md` (outside the repo).
