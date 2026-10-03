# Translation Journal — Homily on St. Ignatius (pt-BR)

Source: en-US (T. P. Brandram translation, NPNF First Series Vol. 9, via New Advent `1905.htm`)
Target: pt-BR

Single chapter (`ch001.md`): title, bold editorial heading, five numbered sections over eight paragraphs (§1 and §2 each have one unnumbered continuation; §5 has one).

## Terms

| en-US | pt-BR | Notes |
|-------|-------|-------|
| John Chrysostom | João Crisóstomo | as in the sibling Chrysostom works |
| St. Ignatius | Santo Inácio | title: Homilia sobre Santo Inácio |
| Eulogy | Panegírico | heading |
| god-bearer | portador de Deus | lowercase epithet in the source; the corpus's *Teóforo* is kept for the name used as a proper noun |
| arch-bishop of Antioch the great | arcebispo de Antioquia, a grande | |
| Pelagia | Pelágia | |
| Episcopal office / episcopate | ofício episcopal / episcopado | |
| bishop / Bishop | bispo / Bispo | capital kept where the source capitalizes |
| crown / crowned one | coroa / o coroado | |
| contest / conflict / fighting(s) | combate(s) | "fightings" (the persecutions and struggles of §3) and "fights against God" (§4) also take combate |
| wrestling | luta | |
| athlete / champion | atleta / campeão | |
| oversight (of the Church) | superintendência | |
| piety / word of piety | piedade / palavra da piedade | |
| readiness | prontidão | |
| Gehenna | Geena | |
| Sanhedrin | Sinédrio | |
| Elisha | Eliseu | 2 Kings → 2 Reis, as in the corpus |
| remains | restos | |
| despondency | abatimento | as in *Quatro Cartas a Olímpia* |
| lovingkindness | benignidade | as in *Sobre o Sacerdócio* |
| the Devil / the devil | o Diabo / o diabo | source capitalization mirrored |

## Decisions

- Address: the congregation is vós ("vede", "vós gozastes", "enviastes"). The rhetorical objector in §2 ("What do you say?") and in §4 ("how couldest thou account") is tu.
- Pronouns for God and Christ are capitalized (Ele, Aquele) where they refer to Him, matching *Homilia sobre a “Humildade de Espírito”*; possessives stay lowercase.
- Paragraph numbers are `**N.**`; en-US writes them as `N. ` list markers. Unnumbered continuation paragraphs stay unnumbered.
- Scripture references stay inline where the edition puts them, with Portuguese book names. Quotations follow the Brandram English, not a Portuguese Bible. The 1 Tim 3:2-3 paraphrase in §2 has no reference in the source; none added.
- Quotes are curly “ ”, as in the sibling Chrysostom works.
- Ignatius's words "may I have joy of these/your wild beasts" rendered "Possa eu gozar destas/das vossas feras", keeping the source's two forms.
- Source oddities mirrored rather than smoothed: "betray their teachers" (§4) → "trair os seus mestres"; the repeated "it is, it is possible" (after §5) → "Pois é possível, é possível"; "a fear of God … be established" (§1) rendered as a conditional clause.
- The source heading's bold line is kept bold. There are no footnotes.
- book.json: pt-BR added to `name`, `author`, `languages` and the toc title only.

## Source corrections

None.

## Review log

### Round 1

Focus: completeness paragraph by paragraph; Scripture book names and chapter:verse numbers; mechanical audit. Verdict: 2 defects, fixed. Eight paragraphs align one to one; all 13 references match.

Fixed:
- §2, 1 Cor 15:11: "Seja, pois, eu, sejam eles, assim pregamos." → "Sejam, pois, eles, seja eu, assim pregamos." The source reads "Whether therefore they, or I"; the old order followed the Portuguese Bible, against the decision that quotations follow Brandram.
- §4, sun comparison: "a luz espiritual da doutrina" → "a luz intelectual da doutrina". Source: "the intellectual light of doctrine". The homily uses "spiritual" (espiritual) as a separate word throughout.

Rejected:
- §1 "Neither do men alone disrobe" → "se despem para a luta": "para a luta" is a gloss on the athletic sense of disrobing. It adds no claim, so it was left as is.
- §4 "a hundred men, and of fifty alone" → "ou só de cinquenta": "and … alone" here means "or even only fifty". "ou" keeps that meaning.
- §4 "…they were sending a teacher to the Jews who dwelt there. This indeed accordingly happened in the case of Ignatius in larger measure." The pt-BR joins these into one comparison sentence. Both clauses are present and the paragraph is not merged.
- §4 "those who believe in Him" → "nele creem", "to see him" → "vê-lo", "confessing him" → "confessá-lo": contracted and enclitic pronouns stay lowercase, and the capitalization decision covers the free-standing forms (Ele, Aquele). Under `.claude/rules/books.md`, reverential capitalization is not normalized in a per-book pass.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of the whole chapter; mechanical audit (book.json valid with pt-BR name/author/toc; 13 references match; curly quotes balanced; no list-marker numbers or footnotes). Verdict: 2 defects, fixed.

Fixed:
- §3, 2 Cor 12:21: "“Que, quando eu for de novo a vós, Deus me humilhe" → "“Não aconteça que, quando eu for de novo a vós, Deus me humilhe". Source: "Lest when I come again to you, God humble me". A sentence-initial "Que" + subjunctive reads in Portuguese as a wish ("may God humble me"), the reverse of the feared outcome.
- §3, Acts 17:20: "“Trazes coisas estranhas aos nossos ouvidos.”" → "“Trazes certas coisas estranhas aos nossos ouvidos.”". Source: "You bring certain strange things to our ears." "certain" had been dropped, matching the familiar Bible wording instead of Brandram's.

Rejected:
- §2 "nor because he won greater grace from above, nor only because they caused more abundant energy" → "nem apenas porque obteve maior graça do alto, nem só porque…": the "only" of the second member governs the pair; Chrysostom does not deny the grace he has just described. Not a mistranslation.
- §2, Titus 1:9 "to convict the gainsayers" → "refutar os que a contradizem": the clitic "a" (the sound doctrine) is the object Portuguese "contradizer" needs, and it is the doctrine they contradict. Adds no claim.
- §3 "rejoicing because they had been beaten" (Acts 5:41) → "açoitados": the event is the Acts 5:40 flogging, and Brandram himself calls it "scourged" in §5. Narration, not a quotation.
- §5 "fills those who come to him with blessings, with boldness" → "de confiança": the homily's boldness/assurance (parrhesia) is rendered "confiança" in both places ("muita confiança diante de Deus"). Defensible.
- §5 "this turned out for his behoof" → "redundou em proveito deste" (the martyr): the antithesis "what he thought to do against the martyr" makes the martyr the beneficiary.
- §5 "“may I have joy,” said he, “of these wild beasts.”" → one quotation "disse: “Possa eu gozar destas feras.”": the split quote is rejoined; no word lost. Hence 12 quote pairs in pt-BR against 13 in en-US.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, each mark then checked against the source; spelling, diacritics, crase, hyphenation, punctuation and quote-pairing sweep; mechanical audit (book.json valid with pt-BR name/author/toc; 8 paragraphs and 13 references align; 12 curly quote pairs balanced and alternating; no list-marker numbers or footnotes). Verdict: 1 defect, fixed.

Fixed:
- After §5, "Pois é, é possível a quem vem aqui com fé" → "Pois é possível, é possível a quem vem aqui com fé". Source: "For it is, it is possible for him who comes hither". In Brazilian Portuguese "Pois é" is a fixed colloquial interjection ("yeah, right"), so a reader takes it as a conversational filler, not the start of the repeated "it is possible". The new wording keeps the repetition. The Decisions line is updated to match.

Rejected:
- §1 "Nem só os homens se despem … nem só as mulheres se portaram varonilmente, para que o sexo masculino não fosse envergonhado": the present/past mix copies the source ("Neither do men alone disrobe … nor have women only quitted themselves like men, lest the race of men be put to shame"), and "fosse" agrees with the past tense of "se portaram".
- §3 "Mas, como estes foram os primeiros a semear": "estes" points to the nearest antecedent, "os profetas", which is the source's "they" ("But since they first sowed").
- §4 "persuadindo os que moram em Roma de que não desdenhariam … se não estivessem firmemente persuadidos": the unstated subject (the martyrs) is just as open in the source ("that they would not … disdain … did they not firmly persuade themselves"). Not a defect.
- Final paragraph (after §5) "não deixando que a sua consciência se eleve, pelos seus grandes feitos": the source's "by the mighty deeds" is just as open; "seus" does not decide the question one way or the other.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-3.md`.

### Round 4

Focus: function words (prepositions, articles, demonstratives, connectors, seu/sua, consigo), headings, and every place where the Portuguese must commit and the source is open (gender, antecedent, tu/vós); mechanical audit (book.json valid with pt-BR name/author/toc; 8 paragraphs and 13 references align; 12 curly quote pairs; no list-marker numbers or footnotes). Verdict: 1 defect, fixed.

Fixed:
- After §2, "Vedes como, entretanto, apareceu uma dupla coroa do episcopado" → "Vedes como, até aqui, apareceu…". Source: "Do you see how in the meanwhile a double crown of the episcopate has appeared". In Brazilian Portuguese "entretanto" reads as the adversative "however". The source sums up the crowns counted so far and has no contrast.

Rejected:
- Heading "arch-bishop of Antioch the great" → "arcebispo de Antioquia, a grande": the feminine ties the epithet to the city. Antioch the Great is the city's standard name, and Ignatius already has his own epithet ("the god-bearer").
- ¶2 after §1 "who had been reared, and who had everywhere held converse with them" → "que fora criado entre eles, que em toda parte convivera com eles": "with them" governs both verbs in the source, so "entre eles" adds no claim.
- §4 "not knowing that having Jesus with him … the power that was with him" → "tendo consigo Jesus … do poder que estava com ele": "consigo" is reflexive to the subject of its own clause (Ignatius, "ele antes se tornava mais forte"), so it is correct.
- §5 "the cities in order receiving this saint" → "recebendo por sua vez": "in order" means one after another, and "por sua vez" (each in turn) gives that sense.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-4.md`.

### Round 5

Focus: per-paragraph term-frequency diff against the Terms table in both directions; every falsifiable journal claim grepped against the chapter files and the sibling works it cites; proper names against standard Portuguese and the sibling Chrysostom and Ignatius works; mechanical audit (book.json valid with pt-BR name/author/toc; 8 paragraphs and 13 references align; 12 curly quote pairs; no list-marker numbers or footnotes). Verdict: 1 defect, fixed. The chapter text needed no change.

Fixed:
- Terms table, row "contest / wrestling / conflict → combate / luta / combate": the reverse diff found "combate(s)" also renders "fightings" (§3, four times) and "fights against God" (§4). The row implied combate was reserved for contest/conflict. It is now split into "contest / conflict / fighting(s) → combate(s)" and "wrestling → luta".

Rejected:
- §4 "the master of the whole world, Peter" → "o mestre do mundo inteiro": "mestre" covers "master" in this sense, and the forward diff's extra "mestre" against "teacher" comes from this line only. Not a mistranslation.
- §1 "wrestlings" 2 → "lutas" 3: the extra is "se despem para a luta", already rejected in Round 1. §5 "wrestled down all his antagonists" → "derrubou" is the verb, not the noun.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-5.md`.

### Round 6

Focus: completeness paragraph by paragraph (title, bold heading and eight paragraphs aligned one to one; quotations, parentheticals and Scripture references present); Bible book names and chapter:verse numbers; mechanical audit (book.json valid with pt-BR name/author/toc; 13 references match; 12 curly quote pairs; no list-marker numbers or footnotes). Verdict: clean, no change.

Rejected:
- §2, Titus 1:7 "no brawler" → "não briguento", against ¶ after §2 "nor given to wine" → "nem dado ao vinho": each renders Brandram's own word. The variation is his, so it is mirrored.
- ¶ after §2 "blameless and without reproach" → "irrepreensível e sem censura": two terms in the source, two in the pt-BR. Nothing is lost.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read of the whole chapter (negation, subject/object, tense and mood, false friends, dropped qualifiers, Scripture wording); mechanical audit (book.json valid with pt-BR name/author/toc; 8 paragraphs and 13 references align; 12 curly quote pairs; no list-marker numbers, footnotes or truncation markers). Verdict: clean, no change.

Rejected:
- §3 "both rulers, and kings, and people and cities and nations" → "povos, cidades e nações": "people" is collective in a list of plural groups. The plural adds no claim.
- §3, 2 Cor 12:21 "have not repented of their uncleanness, and wantonness, and fornication" → "da impureza, da lascívia e da fornicação que cometeram": the Portuguese article carries the possessive, and "que cometeram" ties the sins to them. Nothing is lost.
- §2 "some most excellent painter from life" → "um excelentíssimo pintor de retratos": a painter from life is a portraitist. Same meaning.
- §4 "becoming weaker through fear to betray their teachers" → "a ponto de trair": spells out the consequence the bare infinitive already expresses. Adds no claim.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__john-chrysostom__homily-on-st-ignatius/review-7.md`.
