# Translation Journal — Commentary on the Apostles' Creed (pt-BR)

Source: en-US (W. H. Fremantle, NPNF Second Series Vol. 3, via New Advent). The book has no Latin directory, so the en-US file is the only source.
Target: pt-BR

No other Rufinus work has pt-BR. Conventions come from `ambrose/repentance` and `athanasius/`:
- Curly quotes “ ”.
- tu for a single addressee: both Laurentius and the catechumen reader. vós only where the source addresses a group (¶19, Rufinus answering the Jews).
- Reverential pronouns lowercase (ele, seu); capitals only on nouns the source capitalizes (Pessoa, Verbo, Poder do Altíssimo).
- Scripture follows the source's wording, not a Portuguese Bible. The source gives no chapter:verse references, so none were added.
- Author is "Rufino", without "São", since he is not a canonized saint. Athanasius's book.json also omits the title. The en-US gives no dates, so none were added.

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| Creed | Símbolo | Rufinus argues from the name "Symbol" in ¶2, so the same word is used throughout. Title: "Comentário ao Símbolo dos Apóstolos" |
| symbol / watchword (¶2) | símbolo / senha | |
| sign or token (Indicium) | sinal ou marca | |
| article / clause | artigo / cláusula | |
| deliver (the Creed) | transmitir | |
| rehearse (the Creed) | recitar | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| only Son / only-begotten | Filho único / unigênito | |
| "only," "unique" (¶6, ¶8) | "único", "singular" | ¶6 "“only” (unique)" → "“único” (singular)" |
| Almighty | Todo-Poderoso | |
| invisible and impassible | invisível e impassível | |
| dispensation | economia | "dispensation of the flesh" (¶35) → "economia da carne" |
| hell (descent into) | infernos | "Desceu aos infernos". "Inferno" (singular) where the source speaks of the devil's realm that holds the captives ("ferrolhos do inferno" ¶16, "despojos do inferno" ¶29, "cativeiro do inferno" and "levara ao inferno" ¶31) |
| forgiveness / remission of sins | remissão dos pecados | The ¶36 heading has singular "Sin"; mirrored as "do pecado" |
| resurrection of this flesh | ressurreição desta carne | ¶43 and ¶45 argue from "this"; rendered "desta" each time |
| the preposition "in" (¶35–36) | "em" (with contractions "na", "no") | The argument needs "Cremos a santa Igreja" with no preposition. This is non-idiomatic Portuguese, but it is required |
| Council of vanity | Conselho da vaidade | Repeated formula in ¶39 |
| congregations of malignants | congregações de malignos | |
| animal body / spiritual body | corpo animal / corpo espiritual | ¶46–47 argue from the pairing |
| quick and the dead | os vivos e os mortos | |
| Antichrist / Son of Perdition | Anticristo / Filho da Perdição | |
| delusion (¶34) | ilusão | |
| traditorship | traição (entrega dos livros sagrados) | |
| the lapsed | os caídos | as in Ambrose's *Repentance* |
| Canticles | Cânticos | |

Names: Lourenço (Laurentius), Fontanini, Concórdia, Aquileia, Fotino, Ausés filho de Nave (the source's form for Joshua; ¶37 "Jesus Nave (Josué, filho de Nun)"), Fênix, Minerva, Júpiter, Baco, Vênus, Afrodite, Castor e Pólux, Mirmidões, Deucalião e Pirra, Jarim, Herodes, Pilatos, Bosra, Edom, Sião, Marcião, Valentino, Ebião, Mani (Manichæus, the founder; "maniqueus" for his followers, as in Cyril's *Catechetical Lectures* and Athanasius's *Vita S. Antoni*), Ário, Eunômio, Paulo de Samósata, Donato, Novato, Hermas, Filho de Sirac.

## Translation Decisions

- The Creed of Aquileia list keeps the Latin and translates only the English gloss in parentheses. The heading line says "as versões latina original e portuguesa".
- Paragraph numbers are written as `**N.**`, as `.claude/rules/books.md` requires. The en-US file still uses `N. ` list markers. That file was left as it is, because this run edits the source only for OCR slips.
- The numbered article headings (¶3 and ¶4 "*Creio em Deus Pai Todo-Poderoso*") drop the source's oddly split italic ("I *Believe…*") and italicize the whole article.
- ¶9 "Who Was Born by *(de)* The Holy Ghost": "Que nasceu por obra *(de)* do Espírito Santo". This keeps the Latin cue the editor inserted.
- ¶21 *xenium* kept in Latin, as in the source.
- ¶39 "turn a deaf ear" → "faça ouvidos de mercador", the pt-BR idiom.
- Intro ¶2 "about 307-309" is mirrored. It is an anachronism for Rufinus (the date is probably 397–409), but it is the editor's text, not a scan slip.
- ¶1 Scripture "a short word will the Lord make upon the earth" → "o Senhor fará uma palavra breve". Later references to the "short word" use "palavra breve" to match.
- No editor footnotes are present, so none were dropped.

## Source edits (en-US, OCR-class)

- ¶2 "the name or Symbol" → "the name of Symbol".
- ¶2 "κύμβολον" → "σύμβολον".
- ¶6 "Having shown them what “Jesus” is" → "then".
- ¶20 "let the point out" → "let me point out".
- ¶20 "Let the show you" → "Let me show you".
- ¶22 "the life of the whole word" → "world".
- ¶34 "Let no than deceive you" → "man".
- ¶40 "enough simple to believe" → "simply".
- ¶43 (closing section) "And afterways he adds" → "afterwards".
- ¶47 "advanced to all animal body" → "an animal body".

Mirrored, not corrected: ¶4 stray punctuation "they deliver it., " (translated normally); ¶19 "he says the Gentiles lie" (rendered "estão"); ¶43 first paragraph, a question ending in a period.

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (89 source blocks aligned one to one with 89 pt-BR blocks), plus Scripture names and numbers, and the mechanical audit (headings, `**N.**` numbering, footnotes, Greek/Latin, quotes, diacritics, `book.json`, journal claims).

Verdict: 1 defect, fixed.

- ¶6, "He is “only” (unique), as thought is to the mind": "Ele é “único”, como o pensamento" → "Ele é “único” (singular), como o pensamento". The source's parenthetical gloss was dropped. Rendered "singular" per the Key Terms row for "unique".

Considered and rejected:
- ¶15 "Having stript them then of their almighty power" → "poder absoluto". Not the divine title "Almighty" (Todo-Poderoso); the source means the rebel powers' unchecked rule, which "poder absoluto" states.
- ¶27 "I will give the malignant for his burial" → "Darei os malignos". English "the malignant" is a collective plural here (Isaiah 53:9, *dabo impios*); the plural is correct.
- ¶20 "What then is meant by his words were made soft?" → quoted as “suas palavras tornaram-se brandas”. Quote marks only mark the cited phrase; no content change.
- Creed of Aquileia, last line: "(The resurrection of this flesh)" → "(A ressurreição *desta* carne)". The italic follows the list's own convention (words peculiar to this creed, as in line 1's *invisible and impassible*), matching the Latin *Hujus*.
- ¶32 "Your seat, O God" → "O teu trono", while "a heavenly seat" in the previous sentence is "assento celeste". Both are correct renderings of "seat"; the argument does not turn on the word.
- ¶39 "in which is believed one God the Father" → "na qual se crê em um só Deus Pai". The added "em" is consistent with ¶35–36, where faith in the Godhead takes the preposition.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of the whole chapter (negation, subject/object, tense/mood, false friends, dropped qualifiers, Scripture pulled toward familiar wording), plus the mechanical audit and a Key Terms frequency check.

Verdict: 1 defect, fixed.

- ¶27, "These words of the Prophet point most plainly to His burial": "claríssimamente" → "clarissimamente". Adverbs in -mente drop the written accent of the base adjective.

Considered and rejected:
- ¶15 "We were sold under our sins" → "fomos vendidos em nossos pecados". "em" keeps the sense (sold in the state of our sins). The gloss that follows, "Under that bond", picks up "the bonds of sin" from the previous sentence, not the quote's preposition, so nothing in the argument depends on "under".
- ¶39 "let him not turn aside in the Council of vanity" → "não se desvie para o Conselho da vaidade". English "turn aside in" means to stray into the council. "desviar-se para" says the same, and the formula "Conselho da vaidade" is kept intact.
- ¶15 "led away principalities and powers, triumphing over them" → "levou cativos os principados e potestades". In this triumph image "led away" means led off as captives, which "levar cativo" states. Rufinus's gloss ("Christ is said to have triumphed") is unaffected.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-2.md`.

### Round 3

Focus: source-blind cold read of the whole pt-BR chapter, with each marked sentence then checked against the en-US. After that, a mechanical spelling sweep (post-1990 orthography, diacritics, crase, hyphenation, por que/porque, quote and parenthesis pairing, italic balance), plus the mechanical audit.

Verdict: 2 defects, fixed.

- ¶11, "Who, forsooth, if they are hard of belief": "se são difíceis de crer" → "se custam a crer". "Difícil de crer" said of a person means the person is hard to believe. The source means the pagans are slow to believe.
- ¶43, "If one should mix … will not the grain … shoot forth": "Se alguém misturasse …, não brotará" → "não brotaria". A "se" clause with the imperfect subjunctive takes the conditional in the main clause. The English "will" carries no future sense here; the question ending in a period stays mirrored, as recorded above.

Considered and rejected:
- ¶7 "the things which they are brought to exemplify" → "às coisas que são trazidos para exemplificar". "que" is the object of "exemplificar" and the implied subject is "os exemplos", so the masculine plural is correct.
- ¶23 "of which the Jews sought that it might be upon themselves" → "sobre o qual os judeus pediram que caísse sobre eles". The two "sobre" phrases are heavy but grammatical, and both are in the source.
- ¶24 "that day known to the Lord" / "that day shall be known to the Lord" → "é conhecido" / "será conhecido". The source's own two wordings differ; mirrored.
- ¶26 "the wine mingled with myrrh which the Lord has given Him to drink" → "que o Senhor lhe deu a beber". The odd referent is the source's; mirrored.
- ¶34 "lo, here is Christ" → "Eis aqui está o Cristo". "Eis aqui está" is an established, if pleonastic, form. A style choice.
- ¶14 "make protestation to unbelievers" → "protestar aos incrédulos". "Protestar a" in the sense of solemnly declaring to someone is attested; it matches the source.
- ¶41 "Although on this point also the faith of the Church is impugned…" → a standalone "Embora…" sentence. The source has the same fragment; mirrored.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-3.md`.

### Round 4

Focus: function words (prepositions, articles, demonstratives, adversative connectors, possessive "seu/sua", "consigo" vs "com ele"), every heading and Creed-list label, a turn-by-turn tu/vós trace, and every place where the Portuguese must commit and the source is open. The mechanical audit was also run.

Verdict: 1 defect, fixed.

- ¶34, Malachi, "as fuller's soap": "como a erva dos lavandeiros" → "como o sabão dos lavandeiros". "Erva" is the Vulgate's *herba fullonum*, not the source's word. The translation follows the source's wording, not a familiar Bible.

Considered and rejected:
- ¶15 "taught them rather to follow their own perverse guidance" → "a seguir a sua própria direção perversa". The English "their own" can mean either the powers or mankind, and "sua própria" leaves the same two readings. Nothing is lost.
- ¶15 "delivered to men the power which was taken from them" → "entregou aos homens o poder que lhes fora tirado". The English "them" sits right after "men", just as "lhes" sits after "aos homens". Sense and ambiguity are the same in both.
- ¶22 "suspended on the wood of which it is made" → "do madeiro de que ela é feita". The English "it" can be the cross or the life, and so can "ela" (cruz or vida). Mirrored.
- ¶32 "according to the flesh He was the Son, of David" → "era o Filho de Davi". The source's comma lets "of David" apply to both titles. In the pt-BR, the preceding quote ("Davi … o chama Senhor") already makes Christ David's Lord, so the sense survives without the comma.
- ¶26 "wine mingled with myrrh which is bitterer than gall" → "mais amargo". The masculine attaches the comparison to the wine, not the myrrh (mirra). The wine is what was given to drink, so this is a defensible commitment.
- ¶2 "the one … the other" → "uma … a outra". The feminine points to the two towers, which the sentence contrasts. Justified.
- ¶19 Isaiah "Deliver all these things to the nations" → "Entrega". The source leaves the number open, and singular is a valid choice.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-4.md`.

### Round 5

Focus: Key Terms, journal claims and proper names. A per-paragraph term-frequency diff ran in both directions for every Key Terms row. Every falsifiable journal claim was grepped against the chapter files, and every proper name was checked against standard Portuguese and the sibling pt-BR works in `church-fathers/` and `aquinas-opera-omnia/`. The mechanical audit was also run.

Verdict: 1 defect, fixed.

- ¶39 (both paragraphs), "Manichæus": "Maniqueu" → "Mani". Rufinus names the founder, who "calls himself the Paraclete". In Portuguese "maniqueu" is the word for a follower, so the text read as "a Manichaean". The sibling works use "Mani" (Cyril, *Catechetical Lectures*; Athanasius, *Vita S. Antoni*; Augustine, *Confessions*). ¶41 "the Manicheans" → "os maniqueus" stays. The names list above is updated to match.

Journal clarified (the claim was true but incomplete): the Key Terms row for "hell" now lists all four singular "inferno" sites (¶16, ¶29, ¶31 ×2).

Considered and rejected:
- "traição" also renders ¶2 "treachery" and ¶20 "betrayal", not only ¶39 "traditorship". Those are the ordinary senses of the word. The Key Terms row is told apart by its gloss "(entrega dos livros sagrados)", and no reader can confuse the three.
- ¶9 "was uniquely born" → "nasceu de modo singular". This uses the same stem as the "unique" → "singular" row, and the sense is the same.
- ¶15 "almighty power" → "poder absoluto" is the only "almighty" not rendered "Todo-Poderoso". This was already decided in Round 1.
- "Deliver" outside the Creed (¶12 "act of delivery" → "parto", ¶19 "delivered to corruption" → "entregue", ¶35 "delivered above" → "se expôs", ¶48 "delivered from confusion" → "livres") is not covered by the "deliver (the Creed) → transmitir" row. Every Creed-delivery instance (¶4, ¶5, ¶18, ¶43) is "transmitir".
- "Ausés" (Auses) is a transliteration with no Portuguese Bible equivalent, since Num 13 gives "Oseias/Josué". It is the source's form and is recorded in the names list.
- ¶5 "Lord God of Sabaoth" → "Senhor Deus Sabaoth". "Deus Sabaoth" is the established Portuguese liturgical form, and the sense is unchanged.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-5.md`.

### Round 6

Focus: completeness, paragraph by paragraph (79 source blocks aligned one to one with 79 pt-BR blocks, each read in full), plus every number, Bible book name, Latin/Greek item and parenthetical, and the mechanical audit.

Verdict: clean. No changes.

Considered and rejected:
- Intro, "especially their variations. (In the church of Aquileia, …)" → one sentence, "de suas variantes (na igreja de Aquileia, …)". The source's full stop before a parenthesis that continues the list item is a punctuation slip; nothing is dropped.
- ¶6 "this Christ, the meaning of whose name we have expounded" → "este Cristo, cujo nome explicamos". In Portuguese "explicar o nome" means explaining what the name signifies; no content is lost.
- ¶34 Daniel "there was given to Him dominion, and honour, and a kingdom" → "o domínio, e a honra, e o reino". The article choice does not change the sense, and Rufinus's gloss ("His dominion and kingdom") reads the same.
- ¶2 "σύμβολον": the en-US uses U+1F7B (ύ with oxia), the pt-BR U+03CD (with tonos). The two are canonically equivalent under NFC; not a spelling difference.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-6.md`.

### Round 7

Focus: clause-by-clause bilingual fidelity read of all 79 blocks (negation, subject/object, tense/mood, false friends, dropped qualifiers, Scripture pulled toward familiar wording), plus the mechanical audit.

Verdict: clean. No changes.

Considered and rejected:
- ¶2 "For this the Apostles did in these words" → "Isto fizeram os Apóstolos nestas palavras". The connective "For" is not rendered, but the sentence still glosses *Collatio* right after the definition. No sense is lost.
- ¶8 "a spark which is so unsubstantial but yet is fire" → "tão sem consistência". The sense is the same, and the contrast with "esplendor substancial" still reads.
- ¶1 "while yet the Holy Spirit has taken care" → "quando o Espírito Santo cuidou", and ¶39 "since Christ conferred one and the same salvation" → "quando Cristo conferiu". Adversative "quando" (= whereas) is standard Portuguese and keeps the contrast.
- ¶42 "Did you not believe that …" → "Não crias que …". The imperfect indicative matches the past-tense question.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__rufinus__commentary-on-the-apostles-creed/review-7.md`.
