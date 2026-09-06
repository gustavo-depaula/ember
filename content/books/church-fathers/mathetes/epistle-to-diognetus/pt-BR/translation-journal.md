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
