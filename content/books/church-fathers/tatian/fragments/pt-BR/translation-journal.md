# Translation Journal — Fragments (pt-BR)

Source: en-US (Ante-Nicene Fathers, Vol. 2, trans. J.E. Ryland)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Tatian | Taciano | standard Portuguese form of the author's name |
| Encratites | encratitas | |
| heresiarch | heresiarca | |
| Æons | Éons | |
| the old man / the new man | o homem velho / o homem novo | Pauline pair (Ephesians 4:22–24 register) |
| Logos | Logos | kept untranslated, as in the source |
| Nazarites | nazireus | standard Portuguese term (cf. Numbers 6) |
| precative / imperative | precativa / imperativa | grammatical mood terms |

## Translation Decisions

- 2026-09-05: This is a fragment collection — twelve short excerpts from other Church Fathers (Clement of Alexandria, Jerome, Irenaeus, Origen, Archelaus/Routh) quoting or refuting Tatian, not a continuous work by Tatian himself. Each fragment's trailing citation (e.g. "— Clem. Alex.: *Strom.*, iii. c. 12.") is bibliographic apparatus, not prose — kept in its original Latin/scholarly abbreviated form (author sigla and work titles: *Strom.*, *Adv. Hœr.*, *De Orat.*, *Com. in Amos.*, etc.) rather than translated, matching how citation apparatus is handled elsewhere in the corpus.
- 2026-09-05: Scripture quotations embedded in the fragments (1 Corinthians 7:5, Matthew 6:19–20 paraphrase, Isaiah 50:9 paraphrase, Romans 5:20, Genesis 1:3, Exodus 20:2–3/Isaiah 45:5, Numbers 6) were translated fresh from the English apparatus text rather than substituted with a standard Portuguese Bible translation, since the English itself is a loose/paraphrased rendering embedded in the patristic quotation, not a verbatim citation of a specific English Bible version.
- 2026-09-05: "he" opening fragment 1 refers to Tatian (per the source's own ambiguity — the antecedent is established only by the chapter title/context) — left with the same ambiguity in Portuguese ("ele") rather than resolved to "Taciano", to match the source.
- 2026-09-05: Bracketed editorial material in fragment 12 (Archelaus's testimony, with the Routh/Edinburgh Series cross-reference) is original to the source apparatus (not a later editorial footnote), so it was translated and kept in brackets, not dropped.
- No footnotes in the markdown footnote-syntax sense are present in the source; none added.
- 2026-09-05: Quotation marks rendered as straight `"`/`'` rather than the source's curly `“ ”`/`‘ ’`, matching the dominant convention across existing `church-fathers/*/pt-BR` chapters (13 of 17 sampled use straight quotes per docs/journal.md).

## Review Round 1 (2026-09-05, structural/mechanical pass)

- Rejected: fragment 1's inline reference "1 Corinthians 7:5" was rendered as "1 Coríntios 7:5". Flagged by the reviewer as a violation of "Scripture references preserved as-is," but a corpus survey of inline body-prose Scripture references across `church-fathers/*/pt-BR` (ambrose/mysteries, ignatius/*, gregory-thaumaturgus/*) shows the dominant, consistent practice is to translate the book name ("1 Coríntios", "1 Timóteo", etc.) while keeping the chapter:verse locator intact. No change made.
- Fixed: three citation-apparatus formatting drifts, corrected to match the en-US source byte-for-byte (citations are bibliographic apparatus, not translated prose, and the source's own inconsistencies — even a stray-space typo — are preserved rather than silently normalized):
  - Fragment 3: restored the source's stray space before the colon ("Hieron .:", not "Hieron.:").
  - Fragment 4: removed italics added around "Adv. Hœr." — the en-US source leaves this citation un-italicized (unlike fragment 5's "*Adv. Heres.*", which the source does italicize; the source itself is inconsistent here and that inconsistency is preserved rather than harmonized).
  - Fragment 9: moved the italic closing marker to match the source's boundary ("*Adv. Jovin*., i. 3." — period outside the italics), which had drifted to "*Adv. Jovin.*, i. 3." in the first draft.

## Review Round 2 (2026-09-05, bilingual fidelity pass)

- Fixed: fragment 3 — "the very violent heresiarch" had been rendered as a superlative "o mais violento heresiarca" (implying "most violent among heresiarchs," a comparison the English intensifier doesn't make). Corrected to "o violentíssimo heresiarca" — Portuguese's synthetic absolute superlative (`-íssimo`) is an intensifier, not a comparative, so it matches "very violent" without introducing a comparison to other heresiarchs.
- Fixed: fragment 4 — "a conceit of his teacher" was rendered as "a vaidade de seu mestre" ("his teacher's own vanity"), misattributing the conceit to a third party (Tatian's late teacher Justin Martyr) instead of Tatian himself. In context (Irenaeus, *Adv. Haer.* I.28, on Tatian setting himself up as a master after Justin's martyrdom), the conceit is Tatian's own — his self-regard as a teacher, which is what leads into "as if he were superior to the rest." Corrected to "a pretensão de ser mestre" ("the conceit of [considering himself] a teacher"), correctly attributing it to Tatian.
- Fixed: fragment 6 — "punished and chastised" (a punitive doublet) had "chastised" rendered as "corrigidos" ("corrected"), which shifts toward remediation and loses the punitive force of the pairing. Corrected to "castigados."

## Review Round 3 (2026-09-05, monolingual fresh-eyes proofread)

A native-Portuguese proofreader with no access to the English source flagged 10 items. Cross-checked each against en-US: six mirror a feature already present in the source (this is a *fragment* collection — several fragments are genuinely sentence-fragments in English too, e.g. participial clauses with no finite verb) and were rejected as faithful translation, not defects. Four were genuine Portuguese-specific readability issues (a structural ambiguity the source doesn't have, or a calque/redundancy a native reader stumbles on) and were fixed.

Rejected (source itself has the same feature — translating it away would be a fidelity error, not a fix):
- Fragment 1: "1 Coríntios 7:5" is inserted with no delimiter — matches the en-US source, which does the same ("the 'consent' 1 Corinthians 7:5, but by want of consent").
- Fragment 2: "aduzem" (plural) has no explicit plural antecedent in the two preceding singular subjects ("certo indivíduo," "alguém") — the en-US source has the identical unresolved "they" for the same reason (likely the Encratites in general, left implicit by the source).
- Fragment 4: "Imaginando... e negando... como opinião própria." is a verbless sentence fragment — so is the en-US source's second sentence ("Imagining certain invisible Æons... and denying the salvation of Adam as an opinion of his own."), consistent with the fragmentary-testimonia genre this whole chapter belongs to.
- Fragment 5: the whole fragment has no finite verb ("Taciano, tentando... mas ignorando...") — neither does its en-US source sentence ("Tatian attempting... but ignoring...").
- Fragment 6, first sentence: "Contra Taciano, que diz..." has no main clause — neither does the en-US source ("Against Tatian, who says...").
- Fragment 9: "para uso" ("for use") reads clipped with no complement — the en-US source is equally terse ("meats which God has created for use").

Fixed (genuine Portuguese-specific issue, not present in — or worse in Portuguese than — the source):
- Fragment 6, second sentence: "os quais são punidos e castigados" left the relative pronoun's antecedent ambiguous (grammatically closest to "castigos," yielding a nonsensical "the punishments are punished"). The en-US "which" has the same theoretical ambiguity but is resolved by adjacency to "licentious words"; the Portuguese gender mismatch ("os quais," masc. pl., vs. the nearer fem. pl. "as palavras licenciosas") removes that cue entirely. Restructured to "têm os seus castigos, sendo tais ofensas punidas e castigadas pelo Logos," naming the offenses explicitly as what is punished.
- Fragment 8: "mas não, como nós dizemos, entendendo" split the negation from the verb it negates with a parenthetical wedged between — grammatical but unnatural word order in Portuguese, reading as a transplant of the English clause order. Reordered to "mas não entendendo, como nós dizemos," which is the natural Portuguese sequence and changes no meaning.
- Fragment 8: "ab-rogando a lei" (gerund) attached loosely to the sentence with "nós" (concordamos) as the nearest grammatical subject, though the abrogating is Taciano's. (The en-US source has the identical dangling-participle shape — "but not in the sense he wishes, abrogating the law" — also nearest to "we agree.") Tightened to "ao ab-rogar a lei," an infinitival construction that reads more clearly as tied to "ele" (Taciano) in Portuguese than the gerund did, without adding meaning the source lacks.
- Fragment 11: "que ele mesmo rejeitou" stacks a relative pronoun with an explicit resumptive subject pronoun — grammatical in Portuguese for emphasis, but a fresh reader misparsed it as a double subject. Changed to "que ele próprio rejeitou," which reads as unambiguous emphatic phrasing without the resumptive-pronoun shape.

## Review Round 4 (2026-09-05, full re-verification, fresh eyes)

Independent, source-comparing re-derivation of every check (completeness, fidelity, citation apparatus byte-for-byte, grammaticality with the English checked before flagging anything, diacritics/punctuation/book.json) after rounds 1–3's fixes. **CLEAN — no issues found.** Explicitly re-verified that the round-2/3 fixes (fragment 3's "violentíssimo," fragment 4's "pretensão de ser mestre") correctly resolve their ambiguities against the historical context (Irenaeus I.28) rather than introducing new ones, and that the round-3-rejected "fragments" (verbless sentences in 4, 5, 6; undelimited citation in 1) still correctly mirror the English source shape.

## Review Round 5 (2026-09-05, mechanical corpus-tooling pass)

A different instrument from rounds 1–4 (all close-reading): ran `wc`/`grep`/Python counts on both files rather than reading prose. Heading count 12/12, bracket count 3/3, citation-line count 12/12 — all match. Quote-character counts: en-US has 24 curly double-quote chars (12 pairs) and pt-BR has 24 straight double-quote chars (12 pairs) — match. Single-quote/apostrophe counts initially looked mismatched (en-US 6, pt-BR 2) but reading the 6 en-US instances shows only one pair is an actual quotation ('consent'...'consent'); the other 4 are English possessive apostrophes ("Saviour's," "Paul's" ×2, "apostle's") that have no Portuguese apostrophe equivalent (rendered via "de" constructions) — not a translation gap. **CLEAN — no issues found**, second consecutive clean round.
