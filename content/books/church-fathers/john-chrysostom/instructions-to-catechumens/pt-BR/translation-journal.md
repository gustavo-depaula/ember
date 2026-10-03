# Translation Journal — Instructions to Catechumens (pt-BR)

Source: en-US (T. P. Brandram, NPNF First Series Vol. 9, New Advent `1908.htm`)
Target: pt-BR

Single chapter (`ch001.md`): two instructions, each with an argument line and five numbered sections, plus unnumbered paragraphs as in en-US.

## Key Terms

| en-US | pt-BR | Notes |
|-------|-------|-------|
| catechumens | catecúmenos | |
| those about to be illuminated / illumination | os que estão para ser iluminados / iluminação | baptismal sense, kept literal |
| initiated / initiation | iniciados / iniciação | |
| laver (of regeneration) | banho (da regeneração) | as in Tito 3:5 in pt-BR usage |
| pool of waters / divine fountain | piscina das águas / fonte divina | |
| newly-enlightened | recém-iluminados | the Greek *neophotistoi*; one word in the source, and "recém-iluminados" carries the "ever new light" pun |
| mysteries / dread | mistérios / tremendo | |
| Master (Christ, God) | Senhor | also "master's blood" → "sangue do Senhor"; "Lord" is Senhor too, so Senhor alone does not tell the two apart |
| lovingkindness / kindliness | benignidade | |
| forbearance / forbearing | paciência / paciente | as in *Sobre o Sacerdócio* |
| self-restraint / self-control | continência | |
| philosophy / philosopher | filosofia / filósofo | ascetic sense, as in *Sobre o Sacerdócio* |
| oaths / perjury | juramentos / perjúrio | |
| custom | costume | "morals" (Second Instruction §2, §4) is "costumes" in the sense of mores; "habit" is "hábito" |
| omens | presságios; "shunned him as an omen" → "evitou-o como mau agouro" | |
| pomp (of Satan) | pompa | "Renuncio a ti, Satanás, e à tua pompa, e ao teu serviço" |
| covenant | aliança; "receives covenants from you" → "recebe de ti compromissos" | |
| wrestling school | palestra | |
| president (of the games) | presidente | capitalized only where en-US capitalizes it ("o Presidente dos combates pela santidade", Second Instruction §3); "O presidente dos nossos combates", also God, stays lowercase as in en-US |
| Sirach | Eclesiástico | as in *Sobre o Sacerdócio* |
| Ausis (Job 1:1) | Ausis | LXX name kept |

## Decisions

- Author and title follow the sibling Chrysostom books: `João Crisóstomo`; title `Instruções aos Catecúmenos`; headings `Primeira Instrução`, `Segunda Instrução`.
- Paragraph numbers as `**N.**` (en-US has `N. ` list markers, left as imported, as in *Sobre o Sacerdócio*).
- Curly quotes `“ ”`, matching *Sobre o Sacerdócio*. Scripture references stay inline after the quotation, with Portuguese book names. Quotations follow the Brandram English, not a Portuguese Bible.
- Address: the catechumens as a group are vós; where the homily turns to the single hearer ("thou", "Have you a wife?", "Are you a handicraftsman?") it is tu. The Second Instruction from §1 "you are called faithful" on is mostly tu, matching the source's "art"/"thou". The passage on adornment addresses a woman, so "when thou were initiated" → "quando foste iniciada".
- Baptismal formulas without quote marks in en-US (Renuncio a ti, Satanás…; Deixo as tuas fileiras, Satanás…) stay unquoted.
- "dyed red with such blood, and has become a golden sword" (the tongue) kept literal.
- No footnotes in the source; nothing dropped. No translator notes added.

## Source edits

- §4 (First Instruction): "I will give the heathen for three inheritance" → "for your inheritance". OCR slip for "thy"; the parallel "for your possession" follows.

## Edition errors mirrored (not edited)

Wrong citations carried by the New Advent text, kept identical in both files:

- "Galatians 2:11" for the circumcision quotation (Colossians 2:11).
- "Mark 12:27" for "By your words you shall be condemned" (Matthew 12:37).
- "Matthew 5:35" for "yea and nay" (Matthew 5:37).
- "Sirach 20:25" for "Make a door and bars" (Sirach 28:25).
- "1 Corinthians 7:25" for "you were bought with a price" (1 Corinthians 7:23).

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (19 ↔ 19 paragraphs, including the two argument lines, plus 3 ↔ 3 headings), every quotation, reference and italic present; Bible book names and chapter:verse (41 ↔ 41). Plus the mechanical audit and `book.json`.

Verdict: clean. No defects; nothing changed.

Considered and rejected:

- Second Instruction §1, "Hear, at least, what he says concerning Job" → "o que ela diz": "ela" is "a divina Escritura" of the sentence before, the same speaker as the source's "he".
- Second Instruction (after §1), "did he not there dispense the whole" → "não reservou tudo para lá": same contrast (why not everything in the next life, but grace now).
- Second Instruction §2, "think that thou dost not receive this in your hand, but also puttest it to your mouth" → "não só recebes … mas também o levas": the source's "not … but also" is an elliptical "not only … but also".
- Second Instruction §5, "but except you have grace, He says" → "a não ser que o aceites de bom grado": Greek χάριν ἔχειν (to be grateful, willing); the sentence goes on "of your own accord and will".

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of all 19 paragraphs (negation, subject/object, tense/mood, false friends, dropped qualifiers, quotation wording). Plus the mechanical audit and `book.json`.

Verdict: 2 defects, both fixed.

- Second Instruction §3, "but kings, because of services required by them": "por causa dos serviços que deles se requerem" → "por causa dos serviços de que precisam". "deles" could only take "os reis", so the Portuguese said the services were required *of* the kings; the source contrasts God's lack of need with the kings' need.
- Second Instruction §5, "and when we have learned that they are willing, then we put down the price": "quando soubemos que estão dispostos" → "quando ficamos sabendo que estão dispostos". The preterite broke the habitual present of the sentence ("perguntamos … pagamos").

Considered and rejected:

- Second Instruction §3, "before therefore the true coloring of the spirit comes" → "as verdadeiras cores do Espírito": the baptismal grace in this homily is the Holy Spirit's ("instead of fire sending forth the grace of the Spirit", First Instruction §3); capitalizing reads the same noun, it adds nothing.
- First Instruction §4, "Let us learn from thence already his grip" → "a sua pegada": "pegada" also means the act or manner of seizing; in the wrestling image it is not the false friend "footprint".
- Second Instruction §5, "as men who are about in that world at that day to have that word demanded of them" → "hão de ter de responder por essa palavra": same sense, accountability for the spoken word; the deposit image follows in the next clause.
- Second Instruction §3, "you may no more wipe them out in the future; and add damage and scars" → "não mais os apagues no futuro, acrescentando danos e cicatrizes": the participle stays inside the negated purpose clause, as in the source.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-2.md`.

### Round 3

Focus: source-blind cold read of all 19 paragraphs, each mark then checked against en-US; then a mechanical sweep of spelling, diacritics, crase, hyphenation, punctuation and quote pairing. Plus the mechanical audit and `book.json`.

Verdict: 1 defect, fixed.

- Second Instruction §2, "guard your tongue in purity from base and insolent words": "guarda a tua língua em pureza de palavras torpes" → "guarda a tua língua pura de palavras torpes". "pureza de X" reads as purity consisting of X; "puro de" is the Portuguese for free from.

Considered and rejected:

- First Instruction §1, "restore you to the country which is on high, Jerusalem, which is free— to the city" → "à pátria …, a Jerusalém que é livre, à cidade": "a Jerusalém" is an apposition without the repeated preposition, not a missing crase.
- Elliptical or mixed constructions that mirror the source, not broken grammar: "mas como se nascêssemos de novo" ("but so as if we were born again", I §3); "é melhor que … seja mordida … do que … não poder obter" (I §4); "Fazendo tudo por causa daqueles a quem não julgas dignos de dirigir a palavra." (fragment in the source, II §4); "se alguma vez o tivéssemos escolhido, compramo-los" (II §5); "sejais um soldado bem equipado" (singular in the source, II §5).
- First Instruction §4, "and brings him to it" → "e o leva a ele": o = the prophet, ele = the vessel, as in the source.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-3.md`.

### Round 4

Focus: function words, headings and forced commitments: prepositions, articles, demonstratives, connectors, possessive seu/sua, consigo; gender of referents, pronoun antecedents, a turn-by-turn tu/vós trace. Plus the mechanical audit and `book.json`.

Verdict: 1 defect, fixed.

- First Instruction §4, "as though giving over its body to these executioners": "como quem entrega o seu corpo a estes carrascos" → "como quem entrega o corpo dela a estes carrascos". After "quem entrega", "o seu corpo" reads as the speaker's own body, which makes sense on its own; the source means the tongue's body, the tongue treated as a condemned criminal.

Considered and rejected:

- First Instruction (after §1), "nor hears their voice" → "nem ouve a sua voz", and "the voice of the physician despairing of his life" → "do médico que desespera da sua vida": the reading where "sua" points back to the subject (the soul's own voice, the doctor's own life) makes no sense in context, so the reader takes "sua" as the source's referent.
- Second Instruction §3, "God has made us inaccessible to all his designs" → "a todos os seus desígnios": God's own designs makes no sense, and "nem sequer o próprio diabo" ends the clause just before.
- Second Instruction §1, "what the names of it are intended to show forth" → "o que os seus nomes pretendem significar": the gift's names (faithful, newly-enlightened) are the names the people who hold it bear, so either antecedent gives the same sense.
- Vós at "estais para ser chamados recém-iluminados … a vossa luz" (after Second Instruction §1) inside a tu passage: the source "you" is open, and the title belongs to the whole class of candidates.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-4.md`.

### Round 5

Focus: terms, journal and names. Per-paragraph term-frequency diff against the Key Terms table in both directions; every falsifiable journal claim grepped against the chapter files; every proper name checked against the standard Portuguese form and the sibling pt-BR works in `content/books/church-fathers/`. Plus the mechanical audit and `book.json`.

Verdict: 3 defects, all fixed.

- After Second Instruction §1, "you are about to be called newly-enlightened": "estais para ser chamados neófitos, isto é, recém-iluminados" → "estais para ser chamados recém-iluminados". The source has one word (Greek *neophotistoi*); "neófitos" (Greek *neophytoi*, newly planted) was added, and the Key Terms note claiming "both words" in the source was false. Row corrected.
- Key Terms, president: "capitalized for God as in en-US" was false for "The president of our conflicts" (God, lowercase in both files). Note now says capitalized only where en-US capitalizes it.
- Review log, Rounds 1–3: "22 paragraphs" → 19 paragraphs (including the two argument lines) plus 3 headings. The Round 4 quote of the neophyte sentence updated to the current text.

Table notes added, no text change: "Lord" also renders as Senhor; "morals" renders as "costumes".

Considered and rejected:

- "costumes" for "morals" (Second Instruction §2 "defects in his morals", §4 "strictness of morals") alongside "costume" for "custom": standard Portuguese for mores, and "habit" in the same passages is "hábito", so the custom argument of First Instruction §5 is not blurred.
- "benign-" also for "kind" ("What could be more kind?", "forbearing and kind", Second Instruction §3): the same word family as "lovingkindness/kindliness"; "benignidade" itself occurs exactly 8 times, once for each lovingkindness/kindliness.
- "oath" 14 vs "juramento" 13 in First Instruction §5: "takes an oath" (second occurrence) → "aquele que jura"; the verb carries the same term.
- "dreadful" → "temível" (after Second Instruction §1): not the "dread" of the mysteries; all six "dread" instances are "tremendo".
- "ridicule" → "zombaria" (First Instruction §5): not a Key Term; "raillery" also has "zombaria" without clash.
- Names checked and correct: Davi (no sibling pt-BR file uses "David"), Alexandre da Macedônia, Faraó, José, Moisés, Jó, Ausis, Abraão, João, Pedro, São Paulo, Querubins, Hades, Satanás; author "João Crisóstomo" as in the sibling Chrysostom books.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-5.md`.

### Round 6

Focus: completeness, paragraph by paragraph, read in full without line clipping: 19 ↔ 19 paragraphs plus 3 ↔ 3 headings aligned one to one; every quotation (unreferenced ones included), parenthetical, clause list and italic present; 41 ↔ 41 references in the same order per paragraph, with Portuguese book names. Plus the mechanical audit and `book.json`.

Verdict: clean. No defects; nothing changed.

Considered and rejected:

- First Instruction §4, "this organ becomes a means of safety for you" → "este instrumento": the referent is the sword of the simile (ὄργανον, instrument); the tongue stays "órgão" in the same paragraph.
- First Instruction §4, "your own transgression becomes the cause of your slaughter" → "a causa da tua morte": same sense in the sword image; nothing lost.
- First Instruction §1, more sentences in pt-BR than en-US: the translation splits at the source's colons ("this relationship with you: For I know" → "convosco. Pois sei"); no content added.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read of all 19 paragraphs (negation, subject/object, tense/mood, false friends, dropped qualifiers, quotation wording), each paragraph read in full without line clipping. Plus the mechanical audit and `book.json`.

Verdict: clean. No defects; nothing changed.

Considered and rejected:

- First Instruction §4, "Let us learn from thence already to get the better …" / "Let us learn from thence already his grip" → "Aprendamos desde já": "from thence already" renders Greek ἐντεῦθεν ἤδη, which is temporal (from now on, already); the thirty-day training ground is named in the sentence just before, so nothing is dropped.
- After First Instruction §2, "and this St. Paul again has called it" → "e assim a chamou também São Paulo", and Second Instruction §2, "having reflected again" → "tendo refletido também": "again" here is the additive "moreover / in turn" (Paul has just been quoted for Titus 3:5); "também" carries the same addition.
- First Instruction §5, "even if you attempted it, you will pay the penalty" → "ainda que o tentasses, pagarias a pena": the conditional follows the hypothetical "you would not dare … even if you attempted it"; the sense is unchanged.
- After Second Instruction §5, "and do you not take courage in it?" → "e não tens coragem nela?": understood as "take heart in it", parallel to "is it not worth trusting"; a style choice, not a mistranslation.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__instructions-to-catechumens/review-7.md`.
