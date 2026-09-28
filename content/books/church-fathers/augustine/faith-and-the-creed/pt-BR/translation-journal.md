# Translation Journal — On Faith and the Creed (pt-BR)

Source: en-US (trans. S. D. F. Salmond, Nicene and Post-Nicene Fathers, First Series, Vol. 3; via New Advent)
Target: pt-BR

## Key Terms

Rows marked *(creed)* are copied from the sister work `augustine/creed/pt-BR/translation-journal.md`; rows marked *(Confessions)* from `augustine-confessions/pt-BR`.

| English | Portuguese | Notes |
|---------|------------|-------|
| Augustine of Hippo | Agostinho de Hipona | book.json author field *(creed)* |
| On Faith and the Creed | Sobre a Fé e o Credo | parallels the sister title "Sobre o Credo: Sermão aos Catecúmenos" |
| the Creed | o Credo | *(creed)*; "Apostles' Creed" (Introductory Notice) → "Credo dos Apóstolos" |
| Almighty | Todo-Poderoso | *(creed)*; lowercase "todo-poderoso" where the source writes "almighty" as a predicate (¶2) |
| the Word | o Verbo | *(Confessions)*; ¶3–4 contrast the Word with "our own words" → "nossas próprias palavras"; the contrast is explicit in the text, so no note added |
| Only-Begotten / Only Son | Unigênito / Filho único | Unigênito *(Confessions)*; Filho único *(creed)* |
| First-begotten | Primogênito | |
| Holy Ghost / Holy Spirit | Espírito Santo | both *(creed)* |
| Godhead (*deitas*, θεότης) | Divindade | capitalized as the source capitalizes "Godhead" |
| Person | Pessoa | capitalized, as the source does in brackets |
| substance / consubstantial | substância / consubstancial | |
| co-eternal / co-eval | coeterno / coevo | *(creed)* |
| Begetter / Begotten | Genitor / Gerado | ¶18 |
| beget / create / fashion (*condere*) / make | gerar / criar / fundar / fazer | ¶5 turns on these verbs: *condere* glossed "(fundar, estabelecer)"; "fashioned and made" → "fundada e feita" so the gloss ties back |
| Beginning (*principium*) | Princípio | ¶18–19 |
| Gift of God | Dom de Deus | ¶19 |
| temporal dispensation | dispensação temporal | recurring; "administration" (*administratio*, ¶18) kept distinct as "administração" |
| assumption (of human nature) | assunção | |
| catholic | católica | lowercase as the source; "Church catholic" → "Igreja católica" |
| heretics / schismatics | hereges / cismáticos | |
| animal body / animal man (*animale*, *anima*) | corpo animal / homem animal | kept literal: ¶13 argues from *animale*/*anima* |
| quick (and the dead) | vivos | |
| draught / cups (¶17) | bebida / copos | |
| wood / three woods (¶17) | madeira / três madeiras | |
| *competentes* | *competentes* | technical term kept in Latin italics |

## Creed articles

The source marks the Creed's articles in small caps (rendered by New Advent as title case, e.g. "Who Was Born Through the Holy Ghost of the Virgin Mary"). Round 1 review (2026-09-27): the initial pass set these in *italics*, reasoning that Portuguese title case reads as noise. Rejected — `.claude/rules/books.md` and the translate-book skill reserve `*italics*` for Latin phrases, book titles, and emphasis matching the source's own markdown; New Advent's title-casing is a small-caps rendering artifact, not source emphasis, so it doesn't license italics under that rule. The sister work `augustine/creed/pt-BR/ch001.md` marks its equivalent Creed citations with curly quotation marks (e.g. “Subiu ao céu”, “A santa Igreja”, “O perdão dos pecados”), which also matches this file's own existing convention for quoting Scripture inline. Changed all nine marked instances (¶8, ¶11, ¶12, ¶13, ¶14, ¶15, ¶16, ¶21 ×2, ¶22, ¶23/¶24) from italics to quotation marks. Also quoted ¶3, which the original pass had deliberately left unmarked (see the struck-through note below) — since the marking mechanism is no longer "italics matching the source's title-case" but "quotation marks for the discourse's Creed citations, as the sibling work does," the source's title-casing (or lack of it) is no longer the deciding factor, and leaving ¶3 bare while the other eight are quoted would itself be a within-book inconsistency.

- ¶3 "Jesus Christ, the Son of God the Only-Begotten of the Father, that is to say, His Only Son, our Lord" → "Jesus Cristo, Filho de Deus, Unigênito do Pai, isto é, seu Filho único, nosso Senhor" (~~not italicized: the source does not title-case it~~ — now quoted, see round 1 note above).
- ¶8 "Who Was Born Through the Holy Ghost of the Virgin Mary" → “que nasceu, por meio do Espírito Santo, da Virgem Maria” (source "through … of", not the sister sermon's "of … and of").
- ¶11 "Who Under Pontius Pilate Was Crucified and Buried" → “que sob Pôncio Pilatos foi crucificado e sepultado” (no "padeceu", "morto": absent in this source).
- ¶12 “ao terceiro dia ressuscitou dos mortos”; ¶13 “subiu ao céu” (singular, as source; creed has the same).
- ¶14 "He Sits at the Right Hand of the Father" → “está sentado à direita do Pai”; the gloss's "sits" → "está sentado" in every occurrence so Augustine's discussion of the posture finds its word.
- ¶15 "He Will Come from Thence, and Will Judge the Quick and the Dead" → “virá de lá e julgará os vivos e os mortos” (two finite verbs as source, not the sister's "há de vir a julgar").
- ¶16 “Espírito Santo”; ¶21 "The Holy Church, [intending thereby] assuredly the Catholic" → “santa Igreja”, [entendendo com isso] certamente a “católica” (no "católica" inside the article, *(creed)*).
- ¶22 "The Remission of Sins" → “remissão dos pecados” (the sister sermon's source says "Forgiveness", hence its "perdão"; this source says "Remission").
- ¶23 “ressurreição da carne”; ¶24 "Eternal Life" → “vida eterna”.

## Translation Decisions

- 2026-09-27: Footnotes. The en-US file carries no footnotes; nothing dropped. The Introductory Notice is the NPNF editor's (Salmond's) text but sits in the chapter body as a section, so it is translated like the rest. Editorial square brackets are kept as brackets, rendered in Portuguese.
- 2026-09-27: Scripture follows the source's wording; the source gives no chapter-and-verse references, so none were added. Examples: ¶1 "Unless ye believe, you shall not understand" → "Se não crerdes, não entendereis"; ¶11 "being made subject even unto death, yea, the death of the cross" → "fazendo-se sujeito até a morte, sim, a morte de cruz" (not the familiar "obediente"); ¶21 "with all your mind" → "de toda a tua mente"; ¶24 "your contention" → "a tua contenda". ¶2 Wis 11:17, addressed to God, uses the reverent "Vós que fizestes" *(creed, Confessions)*.
- 2026-09-27: Address and pronouns. The discourse speaks in the first person plural before bishops; no "vós" address to the audience arises. Pronouns for God lowercase ("ele", "si mesmo"), divine titles capitalized (Verbo, Sabedoria, Cabeça, Mediador, Dom), as in the sister work.
- 2026-09-27: Chapter headings "Chapter N.— Title" → "Capítulo N — Título", sentence case; the source's ".—" is not transplanted. Paragraph numbers written `**N.**` per `.claude/rules/books.md` (the en-US file uses `N.` list markers; the run 1–25 is gapless, so it renders correctly). ¶3 and ¶21 run across a chapter heading in the source; the broken sentence and its resuming dash ("— Sendo assim, repito…", "— Visto, repito, que assim é…") are kept.
- 2026-09-27: Transcription slips in the en-US file, translated as intended and not mirrored: "flesh and blood?'" (stray "?", Introductory Notice), "admonishesus" (¶9), "proofs texts" (¶19). Latin slips corrected in the pt-BR gloss: "principia isne principio" → *principia sine principio* (¶19), "subsantiœ" → *substantiæ* (¶20). The en-US file was not edited.
- 2026-09-27: Place names. "Hippo-Regius" → "Hipona", matching the author field; "Bona, in the modern territory of Algiers" kept as the 1887 editor wrote it ("Bona, no atual território de Argel") rather than updated to Annaba/Algeria, since it is the editor's dated description.
- 2026-09-27: ¶19 wordplay *Spiritus Sanctus* / *sanciuntur* / *sanctitatem* / *a sanciendo* rendered "santidade / sancionadas / santidade / sanção", keeping the Latin in parentheses as the source does, so the derivation argument remains visible.
- 2026-09-27: ¶9 "Woman, what have I to do with you?" → "Mulher, que tenho eu contigo?", and the gloss "the hour at which I shall recognize you" → "em que te reconhecerei", keeping the singular address to Mary.
- 2026-09-27 (round 1 review): Fixed two defects found in a clause-by-clause bilingual pass. (1) Introductory Notice: "Bishop of the first Church" (the source's own wording, glossed *primæ sedis episcopus*) had been rendered "Bispo da primeira Sé" — pulled toward the Latin gloss's "sedis" (see) rather than the English source's "Church," which the sister rule in `.claude/rules/books.md` reserves for a documented, mirrored edition error, not a silent word swap. Fixed to "Bispo da primeira Igreja." (2) ¶2: the opening clause "de que Deus Pai não é Todo-Poderoso" capitalized "Todo-Poderoso" although it is a predicate ("God the Father is not almighty"), the same construction as the paragraph's four other predicate uses ("seja/é/não é todo-poderoso"), all lowercase per this journal's own stated rule. Lowercased for consistency with the other four.
- 2026-09-27 (round 2 review): Fixed two defects. (1) ¶2: "in their traditions they are convicted of entertaining and crediting such a notion" had been rendered "nas suas tradições são convencidas de acolher e dar crédito" — a false friend: English "convicted" means exposed/proven guilty (by their own tradition's internal evidence), not "convinced" (persuaded). "São convencidas" reverses the sense, making the tradition the persuader rather than the evidence. Fixed to "nas suas tradições revelam-se culpadas de acolher e dar crédito." (2) ¶6: "because, on the one hand, that which *was*, *now is* not; and, on the other, that which *shall be, as yet is* not" — the source places a comma inside each italicized pair to mark the two separate temporal predicates. The pt-BR rendering, "o que *foi* *agora não é*" / "o que *será* *ainda não é*," had dropped both commas, running the predicates together. Added commas: "o que *foi*, *agora não é*" / "o que *será*, *ainda não é*."

## Revisão (coordenação, após rodada 3)

- ¶18: "o Pai não deve a ninguém tudo o que é" → "o Pai não deve a ninguém nada do que é". EN "the Father owes whatsoever He is to no one" is a total negation (aseity: the Father owes nothing of what He is to anyone). In Portuguese, "não … tudo" under negation reads as partial ("does not owe *all*"), implying He owes part — a doctrinal misreading. "nada do que é" keeps the total negation.
- 2026-09-27: The en-US OCR slips recorded in this journal were corrected in the en-US source. The pt-BR text already rendered the corrected reading.
