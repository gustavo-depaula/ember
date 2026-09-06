# Translation Journal — Epistle to Diognetus (pt-BR)

Source: en-US (Roberts–Donaldson translation, Ante-Nicene Fathers, Vol. 1)
Target: pt-BR

Single chapter (`ch001.md`), ~4,300 words. Twelve numbered sub-sections
("Chapter 1" through "Chapter 12" in the source) inside the one file, matching
`book.json`'s single TOC entry.

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| the Word | o Verbo | Standard rendering across `church-fathers/*/pt-BR` for the Logos/Christ (see e.g. `athanasius/statement-of-faith`). |
| Diognetus | Diogneto | Standard Portuguese form of the name. |
| Mathetes | Mathetes | Pseudonym of the unknown author (Greek for "disciple"); left as-is, matching `book.json`'s `author` field. |
| the Gentiles | os gentios | |
| the Jews | os judeus | |
| paradise | paraíso | |
| the Serpent | a Serpente | Capitalized as in the source. |
| sweet exchange (ἀντιδοσις) | doce permuta | The famous *admirabile commercium* line in Ch. 9. |

### Scripture references

Book names localized to standard Portuguese Catholic usage, verse numbers
unchanged: Galatians → Gálatas, 2 Corinthians → 2 Coríntios, Philippians →
Filipenses, 1 Peter → 1 Pedro, Matthew → Mateus — following the convention
already established in `church-fathers/ignatius/epistle-to-the-ephesians/pt-BR`.

## Translation Decisions

- **Second-person address kept uniformly singular ("tu") throughout,
  addressed to Diognetus.** The letter is explicitly framed (Ch. 1) as
  addressed to one man, "most excellent Diognetus." The English source does
  not distinguish singular/thou from plural/you, so it cannot by itself
  justify switching to a plural "vós" in the idol-polemic sections (Ch. 2)
  the way some critical Greek editions are read. Rather than assert a
  singular/plural shift I cannot verify from the English text alone, I kept
  "tu" consistently across all twelve sections, including the idol-worship
  diatribe in Ch. 2 and the direct exhortations in Ch. 7 and Ch. 10–12. If a
  future translator works from the Greek and confirms a deliberate number
  shift, this should be revisited.
- **"they do not destroy their offspring" (Ch. 5) rendered literally** as
  "não destroem sua prole," not glossed as a specific reference to
  exposure/infanticide (which is the standard scholarly gloss but is an
  interpretive addition beyond what the English source states).
- **Brackets `[...]` preserved exactly where the English source has them** —
  these mark editorial insertions not in the Greek, e.g. `[of piety]`,
  `[are right]`, `[acceptable]`. Kept as translator-neutral bracketed
  insertions in Portuguese at the same points.
- **No footnotes to translate or drop.** The source file has no footnote
  markers — the inline Scripture citations (e.g. "Galatians 4:10") are the
  only apparatus, and per convention these are kept inline, not converted to
  markdown footnotes.
- Chapters 11–12 are widely considered by scholars a later, separate
  addition to the letter (a different, more homiletic style, absent from the
  oldest manuscript witness). This is left unremarked in the translation
  itself, matching the English source, which presents all twelve sections as
  one continuous letter without any such note.

## Review Log

- **Round 1 (clean except two minor bracket-placement fixes).** A
  paragraph-by-paragraph comparison against the English found the
  translation complete and accurate (all 19 rhetorical questions in the Ch.
  2 idol polemic, all 8 Scripture citations, the 5 antithetical pairs and
  11-item title list in Ch. 9, and the singular "tu" register all verified
  consistent). Two bracket-placement defects found and fixed:
  - Ch. 2: `[system of] doctrine` had been translated as `uma nova
    [doutrina]` — the bracket wrapped the base noun instead of the
    editorial gloss. Fixed to `um novo [sistema de] doutrina`.
  - Ch. 11: `speaking plainly [to them]` had folded "to them" into the
    clitic pronoun "-lhes" with no bracket at all. Fixed by restructuring
    to `falando com clareza [a eles]`, giving the bracketed insertion a
    standalone counterpart.

- **Round 2 (independent adversarial pass — 4 defects found and fixed).**
  Deliberately used different check angles than round 1 (clause-diagramming
  long sentences, mood in parallel conditionals, re-verifying lists
  independently) rather than re-checking round 1's fixes.
  - Ch. 2: a reversed comparison direction. "Would not those things which
    are now vessels... become like to such, if they met with the same
    artificers?" had been translated with no explicit subject, so by
    pro-drop continuity from the preceding sentence its implicit subject
    became "the idols" rather than "ordinary vessels" — stating the
    argument's other, already-covered direction instead of this one. Fixed
    to give the sentence its own explicit subject: "Não se tornariam essas
    coisas que hoje são vasos... semelhantes a eles, se caíssem nas mãos dos
    mesmos artífices?"
  - Ch. 2: a conditional-mood mismatch between the two branches of one
    either/or rhetorical dilemma — "se elas tivessem sentimento" (imperfect
    subjunctive, counterfactual) vs. the parallel "se... são destituídas"
    (present indicative, factual), with nothing in the English motivating
    treating one branch as more hypothetical than the other. Fixed the
    first branch to indicative: "se elas têm sentimento."
  - Ch. 9: the five antithetical titles for Christ ("the holy One... the
    blameless One... the righteous One... the incorruptible One... the
    immortal One") were capitalized inconsistently — only "Santo" was
    capitalized, the other four were lowercase, though grammatically
    identical substantized titles in the same sentence (and the paragraph
    capitalizes the same concept again a few lines later, "único Justo").
    Fixed all five to capitals.
  - Ch. 10: a third, previously-missed instance of round 1's bracket-span
    defect — `[the nature of] that fire` had been translated as `[a
    natureza d]aquele fogo`, with the bracket cutting through the
    obligatory Portuguese contraction "de" + "aquele," stranding a bare "d"
    inside the bracket. Fixed by substituting "tal fogo" for "aquele fogo,"
    since "de tal" does not contract in Portuguese, letting the bracket
    cleanly wrap the whole gloss: `[a natureza de] tal fogo`.

- **Round 3 (1 defect found and fixed — a side effect of round 2's own
  fix).** Independent pass targeting verb agreement across long clauses,
  pronoun antecedents in Chs. 6–9, the full Ch. 6 soul/body chain,
  "conhecimento"/"vida" consistency, the Ch. 12 two-trees passage, a full
  bracket resweep, and re-verification of every sentence edited in rounds
  1–2. Ch. 6, Ch. 7, Ch. 8, Ch. 9, Ch. 12, and 5 of the 6 previously-edited
  sentences all held up clean.
  - Ch. 2: round 2's fix changed this branch's protasis from subjunctive
    "se elas tivessem sentimento" to indicative "se elas têm sentimento" to
    match the parallel branch's indicative mood, but left the apodosis
    "não as punirias" (conditional) unchanged — leaving a real/Type-1
    protasis paired with a conditional-mood main clause, which is not
    grammatical Portuguese ("se + presente do indicativo" requires a
    present/future indicative apodosis, not "punirias"). Fixed the
    apodosis to indicative: "não as punes antes [de honrá-las], se elas
    têm sentimento?" — now both branches of the dilemma are fully
    indicative/factual, matching the English's plain present-tense
    question.
  - **Considered and left as-is**: Ch. 3, "they... might justly reckon it
    rather an act of folly than of divine worship" → "poderiam com justiça
    ser reputados antes um ato de insensatez do que de culto divino." The
    English's own referent for "it" (their practice, vs. "they" as
    grammatical subject of "reckon") is genuinely ambiguous/awkward in the
    source itself; the Portuguese passive construction is a defensible
    reading of that ambiguity, not a clear-cut error, so left unchanged
    rather than risk introducing a different error by "fixing" a source
    ambiguity.

- **Round 4 (1 defect found and fixed, 1 cosmetic nit fixed).** Independent
  pass focused on Chs. 1/3/4/5 (least-scrutinized so far), collective-noun
  agreement, the Ch. 2 six-materials catalogue, the Ch. 7 servant/angel/
  ruler list, and a byte-level check of quote marks, italics, and the Ch. 7
  ellipsis.
  - Ch. 10: pronoun-antecedent collision. "...to whom He has promised a
    kingdom in heaven, and will give it to those who have loved **Him**"
    had been translated "...e **o** dará aos que **o** tiverem amado" —
    stacking two clitic "o" pronouns back to back, with the second one's
    nearest antecedent being "reino" (from "o dará," two words prior)
    rather than "Deus," making the natural reading "loved it [the
    kingdom]" instead of "loved Him [God]." Fixed to "e o dará aos que **a
    ele** tiverem amado," disambiguating the second pronoun from the
    kingdom.
  - Ch. 7: the ellipsis "...quem suportará a sua manifestação?**...**Não
    vês tu" had no space before the ellipsis, where the English has "His
    appearing? **... **Do you not see." Cosmetic only (the ellipsis itself
    was never dropped), but fixed the spacing to match the source exactly:
    "manifestação? ... Não vês tu."
  - Chs. 1, 3, 4, 5 (full sentence-by-sentence close read), collective-noun
    agreement, the six-materials catalogue's gender agreement, the
    servant/angel/ruler list, and all quote-mark/italics formatting held up
    clean.

- **Round 5 (1 defect found and fixed — round 1 of 2 required clean rounds
  restarts).** Independent fresh read of the whole Portuguese text as
  continuous prose, a full re-verification of every sentence edited in
  rounds 1–4, a scan for leftover English/Latin fragments (none found), a
  heading/paragraph-boundary recount (12 `##` headings in both files; the
  28-vs-30-paragraph-block difference is entirely the pre-existing,
  previously-noted Ch. 7 split into 3 Portuguese paragraphs vs. 1 English
  paragraph, with no sentence orphaned across the split), a full bracket
  resweep (all 29 bracket pairs span the same content as their English
  counterparts), and a fresh subjunctive/indicative check of the
  conditional and hypothetical constructions in Chs. 3, 4, 8, and 9 (all
  correct — real/factual conditionals in the present indicative, "como se"
  clauses in the imperfect subjunctive, and matching
  subjunctive-protasis/conditional-apodosis pairs throughout).
  - Ch. 2: capitalization inconsistency. "Certainly you do not show [by
    your conduct] that he [your **God**] is possessed of sense" had been
    translated "...que ele [teu **deus**] é dotado de sentimento" — the
    sole lowercase instance of "deus" standing for English "God" in the
    entire chapter (40 other occurrences of English "God"/en-US capital-G
    all correspond to a capitalized Portuguese "Deus," including other
    ironic/false-god referents such as Ch. 8's "chamando de **Deus** aquilo
    a que eles mesmos haveriam de ir ter," where a pagan philosopher's fire
    is still rendered with capital "Deus" to match the English capital).
    The lone lowercase instance broke this document's own otherwise
    perfect, consistent capitalization correspondence, with no journal
    entry documenting it as a deliberate choice. Fixed to "[teu **Deus**]."
  - No other defects found. This is round 1 of the 2 consecutive clean
    rounds now required before the translation is considered done — the
    next round must come back clean with no fixes for the review to
    conclude.

- **Round 6 (clean).** An exhaustive capitalization audit of every
  occurrence of Deus, Verbo, Filho, Pai, Espírito, Serpente, Apóstolo(s),
  Igreja, Salvador, Criador, and Senhor across all 12 chapters (extending
  round 5's spot-check to a full sweep), including the two genuinely tricky
  same-word-different-referent cases in the file — "Filho" (Christ) vs.
  lowercase "filho" (an earthly king's son, in the Ch. 7 simile) and "Pai"
  (God) vs. lowercase "pais" (the Church Fathers, in Ch. 11) — confirmed
  every instance tracks its English counterpart correctly, with no
  recurrence of round 5's capitalization slip anywhere else in the
  document. A second full chapter-by-chapter close reading against the
  English (clause structure, tense/mood, the Ch. 2 catalogue, the Ch. 6
  soul/body chain, the Ch. 9 titles and antithetical pairs, the Ch. 10
  imitator-of-God passage, the Ch. 11 Word/Church/Apostles passage, the
  Ch. 12 two-trees passage, and all 8 Scripture references) found nothing
  further. **No objective defects found — clean.** First of the two
  required consecutive clean rounds.

- **Round 7 (clean — review concludes).** A native-reader pass (Portuguese
  read straight through with no English open, checking for anything that
  would make a native speaker stumble — nothing did), a book.json
  consistency check (languages, name/author/toc translations, chapter id,
  folder contents all consistent), a spot-check of this journal's own
  claims against the current file (all verified accurate), and a full
  sweep of every "not...but"/"neither...nor" contrastive pair in the file
  (English "neither" × 4 + "nor" × 17 = 21, matching the Portuguese "nem"
  count of 21 exactly, with every pair complete on both sides). **No
  objective defects found — clean.** This is the second consecutive clean
  round — the review process concludes here.

- **Round 8 (post-merge — 1 defect found and fixed; the two-clean-round
  counter restarts).** Run after PR #421 merged, as an adversarial
  re-derivation rather than a re-check: three independent passes over
  Chs. 1–4, 5–8, and 9–12, each instructed to distrust the seven prior
  rounds and re-derive every reading from scratch. Mechanical
  cross-checks all held (12/12 `##` headings, 30/30 bracket pairs, the
  single `*these*` → `*estas*` italic, all 8 Scripture citations present
  with correct pt-BR book names and digit-identical chapter:verse
  numbers, the 28-vs-30 paragraph delta still fully accounted for by the
  Ch. 7 split). Chs. 1–4 and 9–12 came back clean.
  - Ch. 6: gender-matched noun ambiguity. "The flesh hates the soul, and
    wars against it, 1 Peter 2:11 though **itself** suffering no injury,
    because **it** is prevented from enjoying pleasures" had been
    translated "...luta contra **ela**, 1 Pedro 2:11 embora **ela mesma**
    não sofra nenhum dano, porque é impedida...". English "itself"
    unambiguously continues the main clause's subject, *the flesh*; but
    "a carne" and "a alma" are both feminine singular in Portuguese, so
    "ela mesma" binds by proximity to the "ela" two words earlier — which
    is *a alma*. That parse then propagates into the subjectless "porque
    é impedida," yielding "the soul is prevented from enjoying
    pleasures," which is not merely a different referent but an
    incoherent motive for the flesh's hatred. The parallel clause in the
    same sentence escapes the trap only by accident of number ("o mundo"
    singular vs. "os cristãos" plural), so it gave no warning. Fixed by
    restating the noun instead of relying on the pronoun: "embora **a
    própria carne** não sofra nenhum dano."
  - **Noted, not changed — an `en-US` source question, not a translation
    defect.** In Ch. 5 the inline citation attached to "they are reviled,
    and bless" reads "2 Corinthians 4:12" in the `en-US` file, and the
    pt-BR faithfully carries it as "2 Coríntios 4:12". The quoted clause
    is 1 Cor 4:12 ("we are reviled, and we bless"); 2 Cor 4:12 reads
    "death worketh in us, but life in you" and has no relation to it. The
    surrounding citations are all genuinely 2 Corinthians (6:9, 6:10,
    10:3), which is exactly the environment in which a stray "2" would
    stick. This could not be checked against newadvent.org — the domain
    is blocked by the review environment's network egress policy — so the
    `en-US` file was left as imported rather than edited away from its
    cited source on an unverified reading. By this skill's own criteria
    the pt-BR is correct here: the reference is preserved as-is with the
    correct Portuguese book name and unchanged numbers. Left for a human
    with source access to decide; it belongs to the import, not the
    translation.

- **Round 9 (1 defect found and fixed; the counter restarts again).**
  Three passes: one re-deriving round 8's own Ch. 6 edit from scratch,
  and two fresh full sweeps over Chs. 1–6 and 7–12. Round 8's fix was
  independently confirmed correct on all five points checked (referent,
  the subjectless "porque é impedida" now binding to "a própria carne"
  with correct feminine agreement on *impedida*, the concessive present
  subjunctive matching the parallel "embora ... seja prejudicado", and
  native readability). Chs. 5–8 and 7–12 came back clean, including
  recounts of Ch. 9's five antithetical pairs and eleven-item title list
  and Ch. 10's "to whom" chain, and confirmation that Ch. 10's
  "a qual"/"à qual" crase alternation is correct.
  - Ch. 2: tonic-pronoun proximity ambiguity, in the same sentence round
    2 had already edited — but on a different word, so this is not the
    "polishing a bad parse" anti-pattern the dev journal warns about.
    Round 2 settled the sentence's *subject* (ordinary vessels, not the
    idols), and that parse re-derives correctly from the paragraph's
    reciprocal argument; untouched by that fix was the pronoun in
    "become like **to such**", rendered "semelhantes **a eles**". It sat
    immediately after "formadas dos mesmos materiais", making
    *materiais* — not the gods — the nearest masculine-plural
    antecedent, so the first parse is the circular "become similar to
    the materials they are made of". Fixed by reordering to pull the
    pronoun away from the trap rather than by adding a gloss, which
    keeps the file's bracket parity intact: "Não se tornariam
    **semelhantes a eles** essas coisas que hoje são vasos, formadas dos
    mesmos materiais, se caíssem nas mãos dos mesmos artífices?" The
    nearest antecedent is now "desses [deuses]" in the preceding
    sentence, which is the correct one.

- **Round 10 (2 defects found and fixed; the counter restarts again).**
  Round 9's Ch. 2 reordering was independently re-derived and confirmed
  correct on all five points checked — subject, referent of "such",
  the post-reorder antecedent (no new attraction toward "artífices",
  since Portuguese resolves anaphorically, backward, and the pronoun now
  precedes both "materiais" and "artífices" in its own sentence),
  the naturalness of the heavy-NP-shift VS order, and the surviving
  "formadas"/"se caíssem"/"tornariam" agreements.
  - Ch. 6: clitic-placement inconsistency. "God has assigned them this
    illustrious position, which it were unlawful for them to forsake"
    read "...que **lhes não** é lícito abandonar." Clitic-before-negator
    is *not* ungrammatical — it is legitimate classical Portuguese
    proclisis, the relative "que" attracting the clitic ahead of "não" —
    so this was decided on internal consistency rather than on
    correctness, the same way round 5's "teu deus" was. This file itself
    writes "**não lhes** foi transmitido" in Ch. 7, and across the whole
    `church-fathers/*/pt-BR` corpus the modern negator-first order
    appears 7 times against this single old-style instance, which is the
    only one in the corpus. Nothing in the journal documented the
    archaism as deliberate. Fixed to "que **não lhes** é lícito
    abandonar."
  - Ch. 12: semantic drift losing an antithesis. "nor is Eve then
    corrupted, but **is trusted as a virgin**" read "mas é tida por
    **confiável** como virgem" — "held to be *trustworthy*", a
    character-trait claim. The English's contrast is
    *corrupted ↔ virgin*, and "confiável" introduces a sense the source
    does not carry while pushing "como virgem" from predicate
    complement to bare comparison, so the antithesis the sentence exists
    to make is lost. Fixed to "mas é **tida por virgem**", which keeps
    the corrompida/virgem contrast and matches the file's own "ter por"
    idiom (Ch. 1, "não tendo por deuses os que os gregos reputam como
    tais").

- **Round 11 (clean).** Both of round 10's edits were independently
  re-derived and confirmed, together with fresh full sweeps of Chs. 1–6
  and 7–12. On the Ch. 6 clitic change, the reviewer agreed that
  consistency — not grammaticality — was the right basis, since both
  orders are grammatical Portuguese, and confirmed by targeted scan that
  no clitic-before-negator instance remains anywhere in the file (every
  apparent hit being a false positive: "os cristãos não", "mostrou-se
  não apenas", the conditional "se não a entristeceres"). It also
  settled a question the change raised but did not answer: English "it
  **were** unlawful" is an archaic formal subjunctive functioning as a
  categorical present deontic, not a real counterfactual, so the present
  indicative "não lhes é lícito" is correct and "não lhes seria lícito"
  would wrongly import a hypothetical nuance. On Ch. 12, "tida por
  virgem" was confirmed to carry the "believed/regarded to be" sense of
  πιστεύεται and to match the file's own "ter por" idiom, with the old
  "confiável ... como virgem" identified as having double-counted the
  trust idea. Recounts held throughout: Ch. 2's question chains (6 + 13),
  30/30 bracket pairs on both sides, all 8 citations, Ch. 5's antitheses,
  Ch. 7's 8-clause relative chain and realm list, Ch. 9's five title
  pairs and eleven-item list, Ch. 10's 7-clause relative chain and its
  full future/future-subjunctive sequence, and Ch. 11's five-clause
  chain and doxology referents. Ch. 10's switch from "à qual"
  (humanidade) to "a ele" (Deus) at the end of the relative chain was
  checked and is a correct disambiguation. **No objective defects found
  — clean.** First of the two required consecutive clean rounds.

- **Round 12 (1 defect found and fixed — and it reverses round 3's
  explicit decision to leave this sentence alone).** A full-file
  re-derivation of all twelve chapters, including re-verification of all
  four post-merge edits, came back clean. A separate native-reader pass
  — Portuguese read straight through with the English closed, only then
  opened to check each stumble — cleared four first-pass stumbles as
  faithful renderings of the source's own tangled syntax (the Ch. 1
  infinitive-to-subjunctive shift, the Ch. 6 flesh/soul causation, the
  Ch. 2 "[teu Deus]" bracket, and Ch. 9's singular "pairava" with a
  three-item subject) and found one real defect.
  - Ch. 3: a category mismatch, in the one sentence **round 3 examined
    and deliberately left unchanged**. "they... might justly reckon
    **it** rather an act of folly than of divine worship" had been
    rendered "eles... poderiam com justiça **ser reputados** antes um
    ato de insensatez do que de culto divino" — a passive whose subject
    is *eles*, the Jews, equated with the predicate "um ato de
    insensatez". People cannot be an act; the English's "it" (their
    practice) had been dropped and the persons had taken its
    grammatical place. Round 3 had justified leaving this on the grounds
    that the English's referent for "it" is itself ambiguous and the
    passive was "a defensible reading of that ambiguity." That reasoning
    does not hold: the ambiguity in the English is about **who** does
    the reckoning, not **what** is reckoned, and under every available
    reading the thing called "an act of folly" is the practice, never
    the people — so the passive is not a reading of the source's
    ambiguity but outside the space of readings it allows. **Source
    ambiguity licenses choosing among the source's readings; it does not
    license a construction that is none of them.** Fixed by restoring
    the dropped object and mirroring the English's own
    subject/verb/object structure: "poderiam com justiça **reputar
    isso** antes um ato de insensatez do que de culto divino" — which
    preserves, rather than silently resolves, the source's own oddity
    that the Jews would be the ones reckoning their practice folly.

- **Round 13 (1 defect found and fixed).** An adjudication pass
  re-derived round 12's Ch. 3 change and upheld it on every point: in
  Portuguese "X ser reputado Y" is an equative passive that obligatorily
  identifies subject with predicate, so there is no idiomatic reading of
  "eles ... ser reputados ... um ato" that rescues the old wording; the
  English's "it" cannot pick out the people under any of its readings;
  and "reputar isso" matches the file's own idiom (Ch. 4, "quem
  reputaria isto uma parte do culto divino"). Its full twelve-chapter
  secondary sweep was clean. A second native-reader pass then found the
  round's one defect — again something a mechanical English-vs-Portuguese
  comparison cannot see.
  - Ch. 12: verb government. "which the Serpent cannot reach, and **to
    which** deception does not approach" read "às quais a Serpente não
    pode chegar, e **às quais** o engano não se aproxima". Reflexive
    *aproximar-se* governs **de**, not **a**. The first relative clause
    is right, since *chegar* does take "a"; the second carried that
    preposition across by parallelism with it and with the English's
    "to which". All ten occurrences of *aproximar-se* elsewhere in the
    corpus take "de". Fixed to "**das quais** o engano não se aproxima."
    Coordinated relative clauses taking different prepositions is
    correct here, not an inconsistency — each verb governs its own.

- **Round 14 (clean — three reported findings, all rejected on
  evidence).** Round 13's Ch. 12 preposition fix was independently
  confirmed (including that coordinated relative clauses taking
  different prepositions is required here, not a wobble, since *chegar*
  and *aproximar-se* govern differently). A full government/crase sweep
  — every `à`/`às` in the file checked against its governing verb, and
  some forty verb-government pairs spot-checked — and a third
  native-reader pass then produced three candidate defects. **All three
  were verified against the corpus and rejected; recorded here so later
  rounds do not re-raise them.**
  - **Rejected — Ch. 4, "aprender nada de mim" / "aprender de nenhum
    mortal".** Reported as an English calque of "learn from", with
    "aprender com" claimed to be the only standard regência. It is not:
    "aprender de alguém" is the ordinary biblical-register regência in
    Portuguese, and the corpus itself carries 47 instances of it
    ("Aprendei de mim", Mt 11:29; "aprendestes de nós", Phil 4:9). The
    elevated register makes it the *better* choice here, not an error.
  - **Rejected — Ch. 2, "depois de teres te libertado".** Reported as
    non-standard clitic placement in a compound personal infinitive,
    with "te teres libertado" or "teres-te libertado" proposed. Both of
    those are indeed more prescriptive, but the corpus is genuinely
    mixed — "terem se desviado" elsewhere uses the same unhyphenated
    pattern, against "ter-se convertido", "se ter purificado", "me
    teres julgado" — and this file contains only the one such
    construction, so there is no internal inconsistency to correct. The
    consistency argument that justified round 10's Ch. 6 clitic fix
    (7:1 corpus-wide, plus a same-file contradiction) does not transfer
    to a 2:4 split with no same-file conflict. Style, not defect.
  - **Rejected — Ch. 9, "nossa Sabedoria, Luz, Honra, Glória, Poder e
    Vida".** Reported as a gender-agreement break, since *Poder* is
    masculine while the elided "nossa" is feminine. But a determiner
    heading a coordinated list agrees with the nearest noun and
    distributes over the remainder — "sua fé, esperança e amor" is
    ordinary Portuguese with exactly this mixed-gender shape. Repeating
    the possessive would also have meant either reordering the
    eleven-item list (breaking the source order prior rounds verified)
    or adding words the English does not have.
  - **The general lesson: a reported defect in an archaizing register
    needs a corpus check before it is believed.** Two of the three
    findings above flagged constructions that are not merely
    permissible but idiomatic in elevated/biblical Portuguese, and a
    grep decided each in under a minute. First of the two required
    consecutive clean rounds.

- **Round 15 (clean — review concludes).** A final full-file
  re-derivation of all twelve chapters, re-verifying each of the six
  post-merge fixes from scratch, came back clean. A parallel adversarial
  pass deliberately targeting classes not yet exhausted — number
  agreement, correlative completeness, comparatives, tense/aspect,
  definiteness, rhetorical repetition, and the logical force of every
  connective — produced one observation, recorded here as considered and
  rejected.
  - **Considered and left as-is — Ch. 7, the "as X He sent Him"
    anaphora.** The English repeats one frame six times ("as a king
    sends his son... as God He sent Him; as to men He sent Him; as a
    Saviour He sent Him... As calling us He sent Him... as loving us He
    sent Him"). The Portuguese keeps "como X o enviou" for the first
    four members and then recasts the last two as purpose and cause
    clauses: "Enviou-o **para** nos chamar, não para nos perseguir com
    vingança; enviou-o **por** nos amar, não por nos julgar." The
    observation is accurate as description, but it is a question of
    rhetorical texture, not an objective defect: nothing is missing, the
    propositions are unchanged, the negative foils stay parallel on the
    Portuguese side, and *para*/*por* are defensible renderings of the
    Greek participles behind "calling" and "loving" (καλῶν carrying
    purpose, ἀγαπῶν cause). Restoring the anaphora would mean heavier
    constructions ("como quem nos chama o enviou") that are themselves a
    style call. Left for a maintainer who wants the anaphora tightened;
    the review does not treat it as a defect. The Ch. 7 paragraph split
    the same pass noted (one English paragraph, three Portuguese) is the
    known, accepted difference documented in round 5.
  - **No objective defects found — clean.** Second consecutive clean
    round; the review concludes here.

- **Round 16 (post-merge again — 1 defect found and fixed; the counter
  restarts).** Run after PR #422 merged. Three passes, each assigned a
  chapter range for a from-scratch fidelity re-derivation plus two
  whole-file categories chosen because no earlier round had run them:
  second-person address consistency and orthography/homophones; lexical
  consistency mapping and punctuation/markdown parity; clause-level
  omission and negation scope.
  - Ch. 1: a dropped quantifier. "…what form of religion they observe,
    so as **all** to look down upon the world itself, and despise
    death…" read "…de modo a desprezarem o próprio mundo e a
    menosprezarem a morte…". English "all" is a floated quantifier over
    the implicit subject, and it had no counterpart anywhere in the
    clause. It is not decoration: it asserts that the contempt for the
    world and for death is *universal* among the Christians, which is
    exactly what makes Diognetus's question worth asking. Fixed to "de
    modo a **todos** desprezarem …", with "todos" as the explicit
    subject of the personal infinitive; the second coordinate keeps its
    plural personal-infinitive ending (`menosprezarem`), so the
    quantifier distributes over both verbs. Round 17 re-derived the fix
    and confirmed it on all five points checked, including a corpus
    check that quantifier + plural personal infinitive is idiomatic
    ("para todos lerem", `morrow-my-catholic-faith/pt-BR`).
  - **Four findings rejected, with evidence.** Ch. 8's "nenhum homem
    **jamais** o viu" was reported as an inserted intensifier; it is
    not — English present-perfect universal negation carries the "ever"
    reading inherently, Portuguese preterite `viu` alone reads as
    bounded past, and the clause alludes to John 1:18, which the
    Douay-Rheims renders "No man hath seen God **at any time**… he hath
    declared him" (the seen/declared pair is this very sentence). Round
    18 independently found the corpus rendering "Ninguém **jamais** viu
    a Deus" in `gregory-thaumaturgus/trinity/pt-BR`. Ch. 4's trailing
    "a esse respeito" was reported as an addition; it is a resumptive
    with no propositional content, licensed by the distance between the
    fronted `quanto a` topic and the main clause. Ch. 2's italic
    `*estas*` was reported as an unmotivated shift from the four
    preceding anaphoric `essas`; the fifth instance is emphatic deixis
    carrying the English's own italic, and Portuguese proximal `estas`
    is the natural emphatic form. And every semicolon, em-dash, colon
    and quote-style delta was traced to ordinary punctuation-density
    variation between the languages, with no clause lost and no logical
    relation changed.

- **Round 17 (clean).** Three passes: a from-scratch re-derivation of
  round 16's fix, plus three whole-file categories never before run —
  third-person possessive and pronoun referent disambiguation,
  constituent attachment, and mood/sequence-of-tenses with voice
  fidelity. The possessive sweep enumerated all 62 `seu/sua`-family
  occurrences plus every `dele/dela/deles/delas` and third-person
  clitic and traced each to its referent; the attachment sweep
  enumerated every relative, PP, scope-sensitive adverb (`apenas`,
  `somente`, `só`, `também`, `mesmo`, `antes`, `muito mais`, `de todo`,
  `sempre`, `ainda`, `já`) and coordination. Both came back clean.
  **Three reported findings from the mood/voice pass were checked and
  rejected**; recorded here so later rounds do not re-raise them.
  - **Rejected — Ch. 2, "supões [que tais coisas *sejam* deuses]".**
    Reported as requiring the indicative on the ground that affirmative
    verbs of opinion take it. The corpus contradicts the rule for
    `supor`, which genuinely alternates: "supor que **estejas** na
    graça de Deus", "supor que tal poder se **restrinja**", "supondo
    que já **esteja** livre do pecado", "suponham que **seja** uma dor
    perceptível", "supunha que essas ilusões **viessem** de Vós". The
    subjunctive marks the content as the addressee's conjecture, which
    is the pragmatic point here.
  - **Rejected — Ch. 9, "tendo-nos sido manifestado".** Reported as an
    agent-dropping passive that should be active, on the parallel of
    "Tendo-nos, pois, convencido" two sentences later. The parallel does
    not hold, and the proposed fix would introduce a defect: in
    "…**we** might through the power of God be made able" the
    main-clause subject is *we*, so an active participle would bind to
    `pudéssemos` and assert that we made our own inability manifest —
    a reading the English does not allow. The agentless passive
    withholds the agent (as a genitive absolute does) rather than
    asserting a wrong one. The later clause is correctly active because
    *there* the English main-clause subject really is "He".
  - **Rejected — Ch. 9, "seria possível".** Reported as breaking the
    parallelism of "era capaz … seria possível". The English doublet is
    not parallel either — "what other thing **was capable** of covering"
    against "by what other one **was it possible** that we … **could
    be** justified", where the second carries a modal the first lacks —
    and the conditional suits a rhetorical question about an
    alternative that does not exist. The finding's own corpus citation
    ("Seria possível que … fosse empecilho…?", `montfort-true-devotion`)
    is that same construction.
  - Two further constructions were examined and recorded as considered:
    Ch. 9's `arrastados`, whose two available parses converge on the
    same proposition, and the `PP + somente + verb` order in Chs. 8 and
    10, an attested pattern for binding the adverb to the preceding PP.
  **First of the two required consecutive clean rounds.**

- **Round 18 (clean — review concludes).** Three passes over categories
  still unrun: word-level lexical precision and the rendering (not
  capitalization) of every divine title; Scripture allusion and citation
  fidelity; and enumeration integrity with cross-chapter formula
  consistency and a final native-reader pass. All three clean.
  - The lexical pass checked every content word and cleared each
    flagged candidate against the corpus: `dispensação` (Ignatius,
    "a antiga dispensação"), `ordenações` in the decree sense (Rom 13:2
    as "a ordenação de Deus" in two catechisms), `peregrinos` (the same
    1 Pet 2:11 the text cites, as "estrangeiros e peregrinos"),
    `piedade`, `envaidece` (1 Cor 13:4 "não se envaidece"),
    `enunciados`, and the Ch. 9 title list. `Sustentador` for
    "Nourisher" was examined closely, since the corpus uses it elsewhere
    for "Sustainer", and kept: Portuguese `sustento` carries the
    material-provision sense the sentence needs, its clause ending "para
    que não nos preocupássemos com vestimenta e alimento".
  - Citation placement was verified clause-by-clause for all 8
    citations in both languages — none drifted — with book names in
    correct pt-BR form and every chapter:verse digit-identical.
  - Every enumerated chain was counted member by member: Ch. 2's six
    materials and four craftsmen and seven-question volley, Ch. 5's 17
    antithesis clauses, Ch. 7's 5-member list and 9-member realm list
    and 8-clause relative chain, Ch. 9's 5 title pairs and 11-item list,
    Ch. 10's 7-clause chain and its 5-`então`/4-`quando` chain, Ch. 11's
    5 participles. All match in membership and order.
  - **Considered and rejected — "sense" as `sentimento` (Ch. 2) vs.
    `sentido` (Ch. 3).** English repeats one word; Portuguese splits it.
    Each chapter is internally consistent and each choice matches its
    own collocation — Ch. 2 pairs it with `razão` ("dotado de sentimento
    e razão", sentience as a trait of living beings), Ch. 3 with
    `audição` ("sentido e audição", a sensory faculty). Idiomatic in
    both places; no corpus convention forces one word.
  - The native-reader pass found four stumbles, every one of them a
    place where the English is equally or more tangled. **No objective
    defects found — clean.** Second consecutive clean round; the review
    concludes here.

- **Round 19 (post-merge again — 1 defect found and fixed; the counter
  restarts).** Run after PR #423 merged. Three passes, each a
  from-scratch bidirectional re-derivation of a chapter range plus one
  whole-file category no earlier round had run: discourse-connective and
  logical-relation fidelity; grammatical number, agreement and degree
  constructions; determiner and article semantics.
  - Ch. 5: **three dropped concessives.** The English carries "yet"
    fourteen times. Eleven had an explicit Portuguese counterpart —
    `mas` four times, `no entanto` five, and `ainda`/`ainda assim` for
    the two adverbial uses in Chs. 7 and 9. The other three were bare
    `e`, all inside the Ch. 5 antithesis catalogue: "in lack of all
    things, and yet abound in all"; "dishonoured, and yet in their very
    dishonour are glorified"; "they do good, yet are punished as
    evil-doers". "Yet" is a lexical word, not punctuation density, and
    it carries the concession the catalogue is built on. The drop
    mattered more here than it would elsewhere, because the same list
    uses bare `e` for genuine "and" ("Amam a todos, e por todos são
    perseguidos"; "são injuriados, e abençoam"), so at the three gaps
    the concessive was indistinguishable from ordinary addition.
    "Fazem o bem, e são punidos" had no compensating device at all.
    Fixed to match the four instances already correct in the same
    chapter — which is also what the English does, repeating one word
    rather than varying it. Ch. 5 now has seven `no entanto` for seven
    "yet".
  - **Rejected — Ch. 9, `de algum modo` in "não foi porque ele se
    comprazesse de algum modo em nossos pecados".** Reported as the
    wrong member of the `de algum modo` / `de modo algum` pair, on the
    ground that English "at all" is an emphatic total negation.
    **The proposed fix would have reversed the sentence.** Preposed
    `algum` is the negative-polarity member, licensed here by the
    downward-entailing `não foi porque`, and the corpus attests it
    throughout such contexts ("se de algum modo O tenha ofendido", "se
    de algum modo pudessem receber", "se de algum modo puderem ser
    levadas ao arrependimento"). Ch. 6's `de modo algum` is not a
    parallel: there no other negator is present, so the phrase must
    supply the negation itself. Here `não foi porque` already supplies
    it, and inserting the self-negating `de modo algum` into the
    subordinate clause would yield "it was not because he in no way
    delighted" — asserting that God DID delight in our sins.
  - **Rejected — Ch. 3, `a seres desprovidos de sentido e audição`.**
    Reported as flattening the English's definite, anaphoric "those that
    are destitute of sense and hearing" into a bare generic, on the
    claim that Portuguese renders the English's definite and indefinite
    versions identically. The claim is factually wrong: the text does
    distinguish them, `a seres desprovidos de sentido e audição` against
    the later `a coisas desprovidas de sentido`.

- **Round 20 (1 defect found and fixed).** Three passes: bidirectional
  re-derivations plus verb tense and aspect (with a check of every
  future-subjunctive form's morphology), demonstrative deixis and
  anaphoric chains, and information structure with markdown/typography
  integrity.
  - Ch. 2: **a gnomic present flattened into a narrated past.** The idol
    volley builds present, present, past, past — "Are not all these of
    corruptible matter? Are they not fabricated by means of iron and
    fire? Did not the sculptor fashion one of them…? Was not every one
    of them… subject to change?" The first pair states what the idols
    timelessly are; the second narrates who made them. The Portuguese
    had moved that boundary one clause early with `Não foram
    fabricados`, so a class-property became a report of a single
    completed manufacture. The same paragraph preserves every other
    present the English has, including another present passive ("que
    agora são adorados por ti") and two present copulas ("Não são todos
    eles de matéria corruptível", "que hoje são vasos") — this clause
    was the lone departure. Fixed to `Não são fabricados`.
  - Deixis, focus and markup all came back clean: 30/30 bracket pairs,
    the single italic pair, the ellipsis, and every cleft and fronting
    ("Este é aquele que…", "na própria desonra, são glorificados", "não
    é… que se encontra a felicidade", "é a desobediência que se mostra
    destrutiva", Ch. 7's OSV "Este [mensageiro] ele lhes enviou",
    Ch. 12's VS "nem então é Eva corrompida"). Every future subjunctive
    (`tiveres`, `quiser`, `souberes`, `desprezares`, `temeres`, `forem`,
    `entristeceres`, `amares`) is correctly built.
  - **Rejected — Ch. 9's pluperfect/preterite mix.** Three sequential
    "when… had…" clauses render as simple preterite while the fourth,
    nested one level deeper, takes mais-que-perfeito (`havia
    estabelecido`). That is exactly the distinction Portuguese reserves
    the tense for; the other three are plain chronological sequence.
  - Also rejected: `nem visando a algo` (Ch. 11 — an attested
    reduced-clause gerund, with two more in this file and some eighteen
    across `church-fathers/*/pt-BR`), `e como` for "and when" (Ch. 12 —
    `como` is causal here and changes no assertion), `despojados e
    postos nus` (Ch. 12 — one event, two participles, nothing added),
    the `—,` sequence, the straight-vs-curly quote style, and the five
    extra em-dashes, all traced to punctuation-density variation.

- **Round 21 (1 defect found and fixed).** Three passes: modality;
  coordination and ellipsis recovery; and an exhaustive target-to-source
  addition sweep with a check of the headings and `book.json`.
  - Ch. 2: **an unlicensed intensifier.** "But if, on the other hand,
    they are destitute of sense, you convict them of this fact" was
    rendered `tu mesmo as condenas por esse fato`. The English is plain
    "you convict them". The file's own practice settles it: nine
    emphatic uses of `mesmo` (setting aside `o mesmo`/`a mesma` for
    "same", `do mesmo modo`, `ao mesmo tempo`, `até mesmo`), and eight
    render an explicit English reflexive — "you yourselves" (Ch. 2),
    "they themselves" (Ch. 8), "in ourselves" (Ch. 9), "He Himself"
    twice (Chs. 3, 9), "revealed Himself" (Ch. 8), "to Himself"
    (Ch. 10), "in yourselves" (Ch. 12). Every English reflexive in the
    letter is likewise accounted for, the rest by clitics or by
    `próprio`/`si`. This one had no trigger, two sentences after the
    licensed `não és tu mesmo` it was most likely carried over from.
    Removed; the overt `tu` stays, marking the subject switch from
    `elas`.
  - Modality came back clean across some 45 modal tokens — epistemic,
    deontic and dynamic all preserved, with "because they **will not**
    deny God" correctly read as volition (`por não quererem negar`) and
    distinguished from the thirteen predictive futures in the same
    chapter. **`haver de` was checked and kept**: the corpus uses it
    throughout for archaic prophetic "shall/will" ("a ira que há de
    vir", "hão de julgar o mundo"), so it is register, not a force
    upgrade to obligation.
  - Ellipsis recovery clean: `tanto a falar quanto a ouvir` repeats its
    preposition correctly, Ch. 4's `à`/`às` crase varies per coordinate,
    and no shared verb, auxiliary, article or elided subject recovers
    the wrong antecedent. Headings and `book.json` (name, author,
    languages, toc ids) all correct and consistent with disk.

- **Round 22 (clean).** Three passes over three unrun categories:
  second-person verb morphology and concord; thematic-role fidelity; and
  adjunct-preposition semantics with a full named-entity inventory.
  - The morphology sweep enumerated all 18 `te/ti/teu`-family tokens
    (all bound to Diognetus), all 14 `lhe/lhes` (all third-person, never
    a misdirected addressee), every explicit `tu` and its verb, and every
    future, future-subjunctive, imperative and preterite form. Zero
    `você` or `vós` leakage anywhere. Note this is distinct from round
    16, which checked which person is addressed, not whether the
    morphology is correctly built.
  - Thematic roles clean, including the verbs whose Portuguese argument
    structure differs from their English counterparts (`carecer`,
    `parecer`, `lembrar-se`, `comprazer-se`); no argument swap, no
    experiencer promoted to agent, no beneficiary re-encoded as patient.
  - Prepositions clean (instrument never turned into agent, means never
    into path, accompaniment never into instrument), and every named
    entity matched count-for-count across both files. **`um reino nos
    céus` for "a kingdom in heaven" was checked and kept** — the fixed
    Portuguese biblical idiom, matching the underlying plural.

- **Round 23 (2 defects found and fixed).** Three passes: assertion
  versus presupposition; non-declarative speech-act integrity; and a
  fresh Portuguese-first native-reader pass, warranted because the text
  had changed three times since the last one.
  - Ch. 2: **a comparative that read as temporal.** "do you not, if they
    are possessed of sense, rather punish [than honour] them?" was
    rendered `não as punes antes [de honrá-las]`. `antes de` +
    infinitive is temporal in Portuguese, not comparative, so the clause
    said you punish them *before* honouring them — implying the honour
    still comes, when the sentence's whole point is that these gifts are
    never honour at all. Ch. 2 settles it against itself: one paragraph
    earlier the same chapter uses the same construction temporally,
    `antes de ser formado pelas artes desses [artesãos]`. The corpus
    agrees (antes de morrer, de nascer, de expirar, de comungar — all
    temporal), and the comparative is the correlative `antes … do que`,
    which this file already uses correctly in Ch. 3 and Ch. 4. Fixed to
    `antes [do que honrá-las]`, keeping "rather" outside the bracket as
    `antes` and "[than honour]" inside, as the English splits it.
  - Ch. 11: **a non-restrictive relative made restrictive.** "but
    conversing with the disciples, who, being esteemed faithful by Him,
    acquired a knowledge of the mysteries of the Father?" had `com os
    discípulos que,` with no comma before `que`. In Portuguese the comma
    is the only signal, and the difference is truth-conditional: without
    it the relative partitions the disciples into faithful and not, a
    claim the English does not make about a group it introduced two
    clauses earlier. The English has seventeen non-restrictive relatives
    (comma + who/which/whom) and sixteen carry the comma in the
    Portuguese; this was the only one missing it. Comma added. This is a
    truth-conditional comma, not the punctuation-density variation
    earlier rounds dismissed.
  - Speech acts clean, verified mechanically: 38 question marks and 6
    exclamation marks in each file, matching chapter by chapter, with
    every negative question keeping the polarity that expects "yes", and
    every imperative, jussive and optative (`Vem`, `contempla`, `Seja o
    teu coração`, `a quem seja a glória`) keeping its mood and addressee.

- **Round 24 (clean).** Three passes: a deliberate sibling-hunt for
  round 23's truth-conditional punctuation defect; pronominal-verb
  correctness and verb valency; relative-pronoun selection, together
  with an adversarial re-derivation of all five fixes from rounds 19–23.
  - The punctuation sibling-hunt found none: every relative in the file
    now carries the same restrictive status as its English counterpart,
    every appositive is symmetrically enclosed, every list groups as the
    English groups, every fronted adjunct closes, and no comma separates
    a subject from its verb.
  - **All five recent fixes were re-derived from scratch by an
    adversarial pass and all five held**, including the confirmation
    that the Ch. 2 `antes` reading had been not merely weaker but
    semantically wrong.
  - Relative-pronoun selection clean: `cujas ordenações` and `por cuja
    causa` agree with the possessed noun, `quem` appears only with
    personal antecedents, and Ch. 10's `à qual`/`a qual` crase
    alternation correctly tracks each verb's valency (`formar` takes a
    direct object; the other five take indirect).
  - **Rejected — Ch. 11, `crido pelos gentios`.** Reported as a valency
    error, on the claim that Portuguese `crer` with a personal object
    requires `em` and cannot passivize, with "zero counterexamples" in
    the corpus. The claim is false in both halves: the corpus attests
    `Deus visto e Deus crido` in two independent books — a divine,
    personal referent as the bare participial object of `crer` — and
    separately `deve ser crido por todos`, the passive with a `por`
    agent. The clause combines the two to mirror the English's own
    unusual "believed on by". **The proposed fix would also have
    introduced a defect**, promoting the temporal adjunct "quando
    pregado pelos Apóstolos" to a coordinate main clause and so changing
    what the sentence asserts versus backgrounds.

- **Round 25 (clean — review concludes).** Three passes: clitic
  placement as a system; adverb and adverbial scope; and, for the first
  time in the review, an audit of the **English** file itself.
  - The clitic sweep enumerated every clitic in the file against its
    environment — proclisis triggers, sentence-initial enclisis,
    infinitive/gerund attachment, the `-lo/-la` allomorph (`vigiá-la`,
    `honrá-las`, `enviá-lo`, `distribuí-las`), and the combined
    `fornecer-lhas` — and found the file internally consistent, with the
    thirteen mid-sentence `e` + clitic sites all proclitic and the one
    sentence-initial `E manifestou-se` correctly enclitic.
  - The adverbial sweep traced every `-mente` adverb, bare adverb and
    adverbial PP for scope and attachment. Clean.
  - **The en-US audit found no new import defects.** All twelve headings
    match the standard Roberts–Donaldson titles; seven of the eight
    Scripture citations were verified against actual verse content and
    are correct in book, chapter:verse and attachment; no doubled,
    dropped or run-together words, no OCR artefact, 30/30 brackets. The
    Ch. 5 "2 Corinthians 4:12" remains the only citation defect, and it
    has no siblings. The pt-BR neither compounds nor silently corrects
    any English defect: where the two differ (spaced em-dashes, the
    Ch. 7 "He"/"he" inconsistency that pro-drop simply gives no surface
    to) the difference is target-language convention, not a
    disagreement of fact.
  - **Rejected, for the second time — Ch. 4's `já` in "Suponho, pois,
    que já estás suficientemente convencido".** Round 20 considered it
    and set it aside; round 25 re-raised it as an added aspectual claim.
    Settled here so it stops recurring. It is not the same case as
    round 21's `tu mesmo`: `mesmo` had a convention to violate, eight of
    nine instances tied to an explicit English reflexive, whereas `já`
    has two instances in the whole file, one licensed by "already"
    (Ch. 2) and one not — which is not a pattern. And the English marks
    this clause as the conclusion of the preceding four chapters with
    "then", rendered `pois`; `já` restates that same inferential
    relation rather than adding a new one. No proposition changes.
  - **No objective defects found — clean.** Second consecutive clean
    round; the review concludes here.

## Conclusion

Twenty-five review rounds total (16 with fixes). Rounds 1–7 ran before
PR #421 merged; rounds 8–15 after it, and found six defects those seven
rounds had missed; rounds 16–18 after PR #422 merged, and found one
more; rounds 19–25 after PR #423 merged, and found five more.

The rounds 8–15 batch fixed two pronouns binding to the wrong
same-gender antecedent (Chs. 6 and 2), a clitic-placement inconsistency
(Ch. 6), a word carrying a sense the English lacks and losing an
antithesis (Ch. 12), a passive equating persons with an act in a
sentence round 3 had explicitly examined and chosen to leave (Ch. 3),
and a calqued preposition (Ch. 12).

Round 16 then found a seventh: Ch. 1 had silently dropped the quantifier
"all" from "so as **all** to look down upon the world itself" — an
omission that survived fifteen rounds, four of them clean, because a
one-word quantifier leaves no structural trace. Nothing counts it: not
heading, bracket, citation or paragraph parity, not a pronoun or
government sweep, not a native reader, for whom the sentence is perfectly
idiomatic without it. Only a clause-by-clause re-derivation against the
English catches a word like this, and only if the sweep is defined over
*every* word rather than over the categories previous defects fell into.

Rounds 17 and 18 came back clean back to back, exhausting eight further
categories along the way (possessive/pronoun referents, constituent
attachment, mood and sequence of tenses, voice fidelity, word-level
lexical precision, divine-title rendering, Scripture allusion and
citation placement, enumeration integrity). Eleven reported findings
across rounds 16–18 were checked against the corpus and rejected — one
of them, Ch. 9's "tendo-nos sido manifestado", carrying a proposed fix
that would itself have introduced a defect.

Rounds 19–25 found five further defects, every one of them of a kind no
standing check counted:

- three dropped "yet" concessives in Ch. 5's antithesis catalogue, where
  the same list uses bare "e" for genuine "and", so the loss was
  invisible (round 19);
- a gnomic present narrowed to a completed past in Ch. 2, moving the
  boundary of the English's own present/past build one clause early
  (round 20);
- an emphatic "mesmo" in Ch. 2 with no English reflexive to license it,
  against a file convention otherwise kept eight times out of nine
  (round 21);
- "antes de" for a comparative in Ch. 2, which in Portuguese is
  temporal, so the clause said the idols were punished *before* being
  honoured (round 23);
- and a missing comma in Ch. 11 that turned a non-restrictive relative
  restrictive, partitioning a group of disciples the English keeps whole
  (round 23).

Rounds 24 and 25 came back clean back to back. Between them they
exhausted a further sixteen categories — discourse connectives, number
and agreement, degree constructions, determiners and articles, tense and
aspect, future-subjunctive morphology, demonstrative deixis, information
structure, markdown and typography, modality, coordination and ellipsis
recovery, second-person morphology, thematic roles, adjunct prepositions,
named entities, assertion versus presupposition, non-declarative speech
acts, truth-conditional punctuation, pronominal verbs and valency,
relative-pronoun selection, clitic placement, and adverbial scope. Round
24 also re-derived all five of the new fixes adversarially, trying to
prove each wrong; all five held. Round 25 audited the **English** file
for the first time and found no import defect beyond the long-known
Ch. 5 "2 Corinthians 4:12", which has no siblings among the other seven
citations.

Eight further reported findings across rounds 19–25 were checked and
rejected with evidence, two of them carrying proposed fixes that would
themselves have introduced defects: Ch. 9's "de algum modo", where the
replacement would have doubled a negation and asserted that God delighted
in our sins, and Ch. 11's "crido pelos gentios", where it would have
promoted a temporal adjunct to a main clause.

The translation is complete, faithful, and considered done.
