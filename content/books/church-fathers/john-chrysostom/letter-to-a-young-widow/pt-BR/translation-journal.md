# Translation Journal — Letter to a Young Widow (pt-BR)

Source: en-US (W. R. W. Stephens translation, NPNF First Series Vol. 9, via New Advent `1904.htm`)
Target: pt-BR

Single chapter (`ch001.md`): title, editorial introduction, seven numbered sections spread over fourteen paragraphs.

## Terms

| en-US | pt-BR | Notes |
|-------|-------|-------|
| widow / widowhood | viúva / viuvez | |
| blessed (Paul, David, Therasius) | bem-aventurado | |
| Therasius | Terásio | |
| Valens, Theodosius, Hadrianople, Goths | Valente, Teodósio, Adrianópolis, godos | |
| Theodore of Sicily, Artemisia | Teodoro da Sicília, Artemísia | |
| Epaminondas, Socrates, Aristeides, Diogenes, Krates | Epaminondas, Sócrates, Aristides, Diógenes, Crates | standard Portuguese forms |
| præfect / prefect | prefeito | the Roman office |
| vainglory / popular glory | vanglória / glória popular | as in *Sobre o Sacerdócio* |
| glory (personified as "mistress", "she") | glória, "senhora", "ela" | feminine in Portuguese too, so the personification carries over |
| Old / New Dispensation | Antiga / Nova Dispensação | |
| world-ruler of darkness | dominador do mundo das trevas | |
| enrolled (widow) | inscrita | |

## Decisions

- Chrysostom addresses the widow as tu throughout, following the tu of *Sobre o Sacerdócio*; en-US mixes "you" and two "thou"s (§5 "For thou, my excellent friend", §7 "do thou hold on"). "your noble self" → "a tua nobre pessoa", "your dear self" → "tu". Where he turns to women in general (§6 "among you women") the address is vós.
- Paragraph numbers are `**N.**`. en-US writes them as `1. ` list markers; pt-BR follows `.claude/rules/books.md`. Unnumbered continuation paragraphs stay unnumbered.
- Scripture references stay inline after the quotation, with Portuguese book names (Sirach → Eclesiástico, Hosea → Oseias), as in the sibling Chrysostom translations. Quotations follow the Stephens English, not a standard Portuguese Bible (e.g. 1 Tim 5:11 "quando se tiverem tornado lascivas contra Cristo, quererão casar-se", which §2 glosses).
- Wrong citations carried by the edition are mirrored, not corrected: Hosea 6:2 (the verse is 6:1), Philippians 1:33 (1:23), Isaiah 40:5 (40:6).
- Quotes are curly “ ”, as in the en-US file and in *Sobre o Sacerdócio*.
- "between the cup and the lip there is many a slip" → the Portuguese proverb "do prato à boca perde-se a sopa".
- §1 "the almighty hand the understanding of which there is no measure" lacks a word in the edition; rendered by sense as "à mão todo-poderosa, à inteligência que não tem medida".
- §2 "If you seek a proof of Christ who is speaking in me?" is kept as the edition's question.
- §5 "saw … and receive … and learn" (edition's mixed tenses) rendered uniformly in the past.
- Editorial introduction translated; there are no footnotes.

## Source corrections

Fixed in en-US as OCR slips:

- §3: "The affection which you be stowed on him" → "bestowed".
- §2: "but also a among those who are outside the Church" → "also among".
- §2: "when they have departed this, life" → "this life".

## Review log

### Round 1

Focus: completeness paragraph by paragraph (15 ↔ 15 paragraphs aligned, sentences, quotations, parentheticals, Scripture references), plus the mechanical audit and `book.json`.

Verdict: 1 defect, fixed.

Fixed:

- Journal header: "seven numbered sections spread over twelve paragraphs" → "fourteen paragraphs". §1–§7 hold 2+1+2+2+2+2+3 = 14 body paragraphs in both files.

Rejected:

- §2 1 Tim 5:5 "continues in prayers and supplications day and night" → "persevera em orações e súplicas noite e dia". The word order follows Portuguese Bible usage, but the meaning is the same, so it is a style choice, not a mistranslation.
- §2 1 Cor 7:40 "she is more blessed if she abide thus" → "será mais feliz". *Feliz* is a standard rendering of the beatitude word. The Key Terms row for *bem-aventurado* covers the epithet given to persons (Paul, David, Therasius), not this predicate.
- §4 "a conspiracy of his household guards" → "uma conspiração dos seus guardas". *Seus* already makes them the emperor's own guard, so no content is lost.
- §2 "the sight of contemporaries in prosperity" → "mulheres da mesma idade". The context is the widow's peers, so the feminine is justified.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-1.md` (outside the repo).

### Round 2

Focus: clause-by-clause bilingual fidelity read of all 16 blocks, plus the mechanical audit and `book.json`.

Verdict: 2 defects, fixed.

Fixed:

- §7 "it is very irrational, when one wishes to buy land, …, if, Heaven being proposed to him … he abides still on earth": "que alguém, querendo comprar terras e buscando solo produtivo, se, sendo-lhe proposto o Céu …, ainda permaneça na terra" → dropped "se,". The "se" opened a conditional with no finite verb, because "permaneça" belongs to "que".
- §7 "do thou hold on to the same way of life as his, yea even let it be more exact": "e até que seja mais exato" → "e que seja até mais exato". "Até que" + subjunctive reads as "until it is more exact".

Rejected:

- §4 "in proportion to men's elevation and splendour is the ruin wrought for them" → "é a ruína que se lhes prepara". Both say the ruin falls on them in proportion to their rise. Style choice.
- §6 "And this I expect will speedily be the case … and … you will display" → "espero que … venha a ser … e que … mostrarás". The future indicative after "esperar que" is attested Portuguese, so the grammar is not broken.
- §6 Sirach 2:10 "look … and see" → plural "olhai … vede". English "look" has no number, and the verse speaks to a plural audience.
- §1 "He has supplied his place to you" → "Ele mesmo te ocupou o lugar dele". Same meaning: God took the husband's place for her.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-2.md` (outside the repo).

### Round 3

Focus: source-blind cold read of the pt-BR, each mark then verified against en-US, followed by a mechanical sweep of spelling, diacritics, crase, hyphenation, punctuation and quote pairing; plus the mechanical audit and `book.json`.

Verdict: clean, no changes.

Rejected:

- §2 "thus it is a state which seems to be not reproached, but admired" → "tanto é um estado que parece não ser censurado, mas admirado". "Tanto é" reads as an intensifier ("so true is it"). It is grammatical and keeps the source's inference, so this is a style choice.
- §7 "and that he would have lost the office he actually held" → "e que ele não teria perdido o cargo". The English list depends on "on what grounds was it evident that…", and the sense needs the negation (the doubtful outcome is that he would *not* have lost his office). The preceding "that things would not have turned out the other way" carries the same negation. Rendered by sense, not a mistranslation.
- §5 "a que não faria mal quem lhe chamasse sua filha" ("whom one would not do wrong to call her daughter"). *Chamar* with *lhe* and a predicative is accepted usage.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-3.md` (outside the repo).

### Round 4

Focus: function words, headings and forced commitments (prepositions, articles, este/esse/aquele, connectors, possessive *seu/sua*, gender and antecedent commitments, turn-by-turn tu/vós trace), plus the mechanical audit and `book.json`.

Verdict: 1 defect, fixed.

Fixed:

- Journal, Decisions, first bullet: "en-US mixes "you" and one "thou" (§5)" → "two "thou"s (§5 …, §7 …)". en-US also has a *thou* in §7 ("do thou hold on to the same way of life as his"), so the old count was false and could have exempted §7 from the address check. pt-BR uses tu in both places.

Rejected:

- §4 "that human things are nothingness but that truly as the prophet says" → "e que verdadeiramente". This "but" corrects the negative statement and adds a positive one; it does not set up a contrast, so *e* keeps the logic.
- §1 "the female sex is the more apt to be sensitive" → "o sexo feminino é o mais propenso". When only two things are compared, article + *mais* is the Portuguese comparative.
- §1 "lest, if they be neglected" → "se forem descuidadas" (the wounds). The antecedent is "the healing of their wounds", and the next clause, "aggravate the wound", confirms it.
- §2 "lighten the burden of your widowhood, and the consequences of it" → "aliviará o fardo da tua viuvez e das suas consequências". The English allows either attachment, and the meaning is the same either way.
- §3 ¶2 "in the latter case … in the former" → "no caso destas (cartas) … no daquelas (visões)"; §6 "the former … the latter" → "aquelas (aflições) … estas (prosperidades)". Both match *este*/*aquele* correctly to latter/former.
- §5 ¶2 "brought back to his wife" → "à sua esposa". The singular *esposa* and the preceding "o imperador" make the antecedent clear.
- §6 "barred every avenue against these pestilential diseases" → "te tenha fechado todo acesso a estas doenças". *Acesso a* names what is shut out. This is a defensible rendering and does not reverse the meaning.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-4.md` (outside the repo).

### Round 5

Focus: terms, journal and names. A per-paragraph term-frequency diff of every Terms row in both directions; a grep of every falsifiable journal claim; proper names checked against standard Portuguese and the sibling Chrysostom pt-BR works; plus the mechanical audit and `book.json`.

Verdict: clean, no changes.

Rejected:

- §5, §6 extra *tu* (5 in pt-BR against 2 "thou" in en-US): "your dear self" → "gozaste tu" (see Decisions), "you know them better than I do" → "tu os conheces", "you would yourself admit" → "tu mesma o admitirias". These are emphatic pronouns for "you", and the address stays tu, so the Decisions bullet is still accurate.
- Terms row "vainglory / popular glory … as in *Sobre o Sacerdócio*": that book has *vanglória* but never translates "popular glory", because its en-US has no such phrase. The note refers to *vanglória*, and no sibling usage conflicts with it.
- Terms row "blessed (Paul, David, Therasius)": en-US also applies the epithet to the husband twice ("that blessed husband of yours", §1 ¶2 and §3), and pt-BR renders both "bem-aventurado marido". The row is consistent with the text; the name list just doesn't include every case.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-5.md` (outside the repo).

### Round 6

Focus: completeness paragraph by paragraph (16 ↔ 16 blocks aligned; quotations, parentheticals, Scripture references, sentence counts), Bible book names and chapter:verse numbers; plus the mechanical audit and `book.json`.

Verdict: clean, no changes.

Rejected:

- §3 ¶2 "nor for 20, or 100, nor for a thousand" → "nem vinte, nem cem, nem mil". The edition mixes digits and words; spelling all three out keeps every number, so it is a formatting choice.
- §2 "“what women there are among the Christians.”" → "“que mulheres há entre os cristãos!”". The sophist "uttered a loud exclamation", so the exclamation mark matches the sense; punctuation, not content.

Evidence: `ember-translation-evidence/church-fathers__john-chrysostom__letter-to-a-young-widow/review-6.md` (outside the repo).
