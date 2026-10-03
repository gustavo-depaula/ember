# Translation Journal — History of Joseph the Carpenter (pt-BR)

Source: en-US (Alexander Walker translation, Ante-Nicene Fathers Vol. 8, New Advent edition)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|-----------|-------|
| History of Joseph the Carpenter | História de José, o Carpinteiro | |
| Apocrypha (author field) | Apócrifos | As in `protoevangelium-of-james`. |
| Saviour | Salvador | |
| the holy old man / righteous Joseph | o santo ancião / o justo José | "old man" is always *ancião*. |
| father after the flesh | pai segundo a carne | |
| James the Less | Tiago Menor | |
| Judas, Justus, James, Simon / Simeon | Judas, Justo, Tiago, Simão / Simeão | ¶2 "Simon" and ¶11 "Simeon" mirrored as printed. |
| Assia, Lydia | Assia, Lídia | |
| Salome / Herod the Great / Archelaus | Salomé / Herodes, o Grande / Arquelau | |
| Rachel / Jacob / Benjamin | Raquel / Jacó / Benjamim | |
| Michael / Gabriel | Miguel / Gabriel | |
| Enoch / Elias / Schila / Tabitha | Enoque / Elias / Schila / Tabita | Enoque, Tabita as in sibling Church Fathers pt-BR; Schila kept as printed. |
| Abib / Ab | Abib / Ab | Month names kept. |
| cave (Nativity; tomb) | gruta | As in the Protoevangelium. |
| Gehenna | geena | As in `assumption-of-mary`. |
| Death (personified, ¶21, ¶28) | a Morte | Capitalized where the source capitalizes. |
| banquet of the thousand years | banquete dos mil anos | |
| shroud / burial-clothes | mortalha / panos de sepultura | |
| departure (from this world) | partida | |
| for evermore | para sempre | |

## Translation Decisions

- **Address.** Human singular addressees use *tu*, plural *vós*. Prayers to God, Joseph's address to Jesus (¶17), and the apostles' address to Christ (¶30, ¶32) use reverent *Vós* with 2nd-person-plural verbs, as in the sibling apocrypha. Christ speaking to Joseph and to Mary, and Mary to Christ, use *tu*. In ¶17 the remembered exchange ("My son, take care of yourself" / "Are you not my father…") stays *tu*, since it is quoted from Jesus' boyhood.
- **Divine pronouns** capitalized where the source capitalizes them.
- **Paragraph numbers** written as inert bold (`**1.**`) instead of the en-US `1. ` list markers, per `.claude/rules/books.md`. The four unnumbered opening paragraphs are kept.
- **Inline Scripture references** (ANF/New Advent apparatus) kept in place with pt-BR book names and the source's colon format (`Lucas 24:49`, `2 Reis 2:11`, `Apocalipse 22:18-19`), as in the sibling apocrypha. Mirrored as printed, including ¶1 "Luke 24:37" (the verse quoted is 24:47) and ¶4 "Luke 24:10".
- **Scripture echoes** (Mt 1:20-21 in ¶6 and ¶17, Ps 51:5 and Job 3 echoes in ¶16, Jer 9:23-24 in ¶1) rendered from the source's wording, not harmonized to a Portuguese Bible.
- **Source oddities kept literal:** ¶17 "raised him from the dead, and restore him" (tense slip) rendered as past ("o restituístes"); ¶26 "The smell or corruption of death" kept as "O cheiro ou a corrupção"; ¶28 "Think you that I can ask…" kept without negation.
- **Opening formula** "of one essence and three persons" → "uno em essência e trino em pessoas".
- **Punctuation.** The source's `:—` becomes a colon; its em-dash asides become spaced em dashes.
- **Footnotes.** The source carries none. No translator notes added.
- **Source edits.** None.

## Review log

### Round 1

Focus: completeness, paragraph by paragraph (37 ↔ 37 blocks, 14 Scripture references), Bible book names and chapter:verse; plus the mechanical audit and `book.json`.

Verdict: clean. No changes.

Considered and rejected:
- ¶17 "do not be angry with me" → "não Vos ireis contra mim": *ireis* is the present subjunctive of *irar-se* (vós), a correct negative imperative, not the future of *ir*.
- ¶16 "which have too often walked" → "que muitas vezes andaram": a weaker intensifier, not a different meaning; style.
- ¶16 "is now, behold, near at hand for me" → "está agora, eis, muito próxima de mim": "near at hand" means imminent; "muito próxima" renders that.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__history-of-joseph-the-carpenter/review-1.md`.

### Round 2

Focus: clause-by-clause bilingual fidelity read of the whole text against en-US; plus the mechanical audit and `book.json`.

Verdict: clean. No changes.

Considered and rejected:
- ¶28 "Think you that I can ask my good Father…" → "Pensais": the source does not say who is addressed. The address to Death ends after its first sentence, and the speech then moves to the third person ("Death spares not", "it makes an onset"). Bystanders are present, so plural *vós* is defensible. Changing it to *Pensas* (addressing Death) would not be more faithful.
- ¶22 "And I say unto you" → "E eu vos digo" (lowercase): the source capitalizes "Your" for the Father in the same prayer and leaves this "you" lowercase. The words are addressed to the hearers, so lowercase is correct.
- ¶11 "not otherwise than if I had been one of his sons" → "não de outro modo do que se eu fosse": the meaning is exact. *do que* after *outro modo* instead of *senão como* is a matter of style.
- ¶5 "he could endure neither to eat nor drink" → "não pôde suportar nem comer nem beber": a literal rendering of the source's construction. Grammatical, so a style choice.

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__history-of-joseph-the-carpenter/review-2.md`.

### Round 3

Focus: source-blind cold read of the pt-BR, each mark then verified against en-US; then a spelling, diacritics, crase, hyphenation and punctuation sweep; plus the mechanical audit and `book.json`.

Verdict: clean. No changes.

Considered and rejected:
- ¶26 "na assembleia das virgens" and later "na igreja das virgens": the source itself has "congregation of the virgins" and then "church of the virgins". Mirrored, not an inconsistency.
- ¶28 "aquela tribulação e violência da morte desceu" (singular verb): the source has "that trouble and violence of death has descended". A singular verb after a closely linked compound subject is grammatical.
- ¶32 "por causa do opróbrio que lhe trazem" for "from the reproach they bring upon him": "from" is causal here, matching ¶31 "because of the reproach".
- ¶16 "Ai dos pés sobre os quais me sentei": the odd image is the source's ("feet upon which I sat").

Evidence: `/Users/gustavo/Documents/ember-translation-evidence/church-fathers__apocrypha__history-of-joseph-the-carpenter/review-3.md`.
