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

## Conclusion

Nine review rounds so far (7 with fixes; rounds 8–9 run post-merge).
