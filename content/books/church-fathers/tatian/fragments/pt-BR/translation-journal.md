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
- 2026-09-05: Scripture quotations embedded in the fragments — 1 Corinthians 7:5 (fragment 1); Matthew 6:19–20 paraphrase, Isaiah 50:9 paraphrase, and Luke 20:34–35 (fragment 2); Galatians 6:8 (fragment 3); Romans 5:20 (fragment 5); Genesis 1:3 and Isaiah 45:5 (fragment 6); Genesis 1:3 again (fragment 7); Amos 2:12 (fragment 10) — were translated fresh from the English apparatus text rather than substituted with a standard Portuguese Bible translation, since the English itself is a loose/paraphrased rendering embedded in the patristic quotation, not a verbatim citation of a specific English Bible version. Numbers 6 (the Nazirite vow) is *referred to* in fragment 10's surrounding prose but never quoted, so it is not in this list.
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

## Review Round 6 (2026-09-05, post-merge re-audit, three independent lenses)

Re-ran the full audit after the translation had already merged, with three reviewers working in parallel and none permitted to read this journal first (to avoid anchoring on rounds 1–5's conclusions).

- Bilingual fidelity + completeness (source-comparing): **CLEAN.** All 12 fragments match on heading placement, paragraph splits (fragments 2 and 6 are two-paragraph in both languages; the other ten are single-paragraph in both), bracketed insertions (3/3), negations, and inline Scripture. All 12 trailing citations diffed byte-for-byte between the two files and match, including every en-US quirk (fragment 3's stray pre-colon space, fragment 4's un-italicized "Adv. Hœr." against fragment 5's italicized "*Adv. Heres.*" for the same work, fragment 8's missing "c.", fragment 9's italics closing inside the period).
- pt-BR monolingual proofread (native-register, fragment-aware): **CLEAN.** Diacritics, crase (à oração, à mesma união, às Escrituras, à procriação, à incontinência, à fornicação), agreement, proper-name forms, and quote/bracket pairing all correct.
- Corpus conventions + tooling: **CLEAN.** `book.json` top-level key set matches all 420 `church-fathers/**/book.json` files exactly; TOC↔file correspondence complete in both languages; no `[^n]` footnote markers in either file; `build-corpus.py` skips `translation-journal.md` by design (its stem is in `NON_CHAPTER_STEMS`), so it is neither ingested as a chapter nor warned about. `pnpm build:corpus` runs clean with zero warnings naming this book.

## Review Round 7 (2026-09-05, regression audit + journal claim-checking)

Two lenses aimed at the two things rounds 1–6 could not check about themselves: whether rounds 1–3's *fixes* were themselves correct, and whether this journal's own factual assertions hold.

**Regression audit of all seven previously-changed passages** — six VERIFIED-CORRECT, one flagged and **rejected on primary evidence**:

- Rejected (proposed reversion of the round-2 fragment-4 fix): the reviewer read "a conceit of his teacher" as *about* Justin Martyr and proposed reverting "pela pretensão de ser mestre" back to "pela presunção de seu mestre" — i.e. back to the exact reading round 2 corrected. Settled decisively against the reversion by this repo's own copy of the passage being excerpted: `content/books/church-fathers/irenaeus/adversus-haereses/en-US/ch029.md` (*Adv. Haer.* I.28.1, same ANF translation family) renders the full sentence "excited and puffed up by **the thought of being a teacher**, as if he were superior to others." ANF's own unabridged rendering of the very sentence the fragment abridges resolves the ambiguity to Tatian's conceit of *being* a teacher. The Greek agrees (οἰήματι διδασκάλου, genitive of the role assumed), and so does the logic of the following clause — being puffed up by someone *else's* vanity does not make one think oneself "superior to the rest." No change. **This spot has now been read in opposite directions by two different rounds; do not flip it again without new primary evidence.**
- Verified-correct, with the reasoning re-derived rather than assumed: fragment 3's "violentíssimo" is the synthetic *absolute* superlative (an intensifier, "very violent"), and "dos encratitas" attaches to the noun "heresiarca" as its ordinary genitive complement, not to the adjective as a comparison set — a relative superlative would require "o mais violento… dos", so the round-2 fix cannot have reintroduced the comparative reading it removed. Also re-verified: the three citation-apparatus restorations, fragment 6's punitive doublet and restructured relative clause, fragment 8's "ao ab-rogar", fragment 11's "que ele próprio".

**Claim-checking of this journal and the `docs/journal.md` entry** — the Key Terms table (all 8 rows, both columns, string-attested with matching counts), the fragment count, the five cited authorities, round 3's 6-rejected/4-fixed tally, and every round-5 mechanical count all re-measured in Python and CONFIRMED. Four defects found, all in the journal prose rather than the translation itself, and all fixed:

- The Translation Decisions Scripture list misidentified fragment 10's quotation as **Numbers 6**; it is **Amos 2:12** verbatim, as the fragment's own citation ("*Com. in Amos.*") says outright. Numbers 6 is referred to in the surrounding prose but never quoted.
- The same list omitted **Luke 20:34–35** (fragment 2's "Os filhos daquele mundo não se casam…").
- The same list also omitted **Galatians 6:8** (fragment 3's "Se alguém semeia na carne…"), which Jerome's own citation ("*Com. in Ep. ad Gal.*") likewise names. This one survived round 7's first pass and was caught only on adjudication — a reminder that a citation-apparatus line is itself evidence for identifying the quotation above it.
- "Exodus 20:2–3/Isaiah 45:5" hedged between two references for fragment 6's "Eu sou Deus, e não há outro além de mim"; only Isaiah 45:5 actually matches, so the Exodus alternative was dropped.
- In `docs/journal.md`: the defect summary said "two citation-formatting drifts" where round 1 recorded and shows **three**, and listed **three** round-3 readability fixes where round 3 recorded and shows **four** (omitting the "ab-rogando" → "ao ab-rogar" tightening) — 8 items claimed against 10 actually fixed. Corrected, with the total now stated explicitly. Word count "~800" re-measured at 742 body words (768 whole-file) → "~750"; backlog figure "~398" re-measured at exactly 397 of 420.

**The lesson generalizes the standing rule.** The repo's rule was "every falsifiable claim in a translation journal is a claim to verify, counts included." Rounds 4 and 5 both certified this book CLEAN and neither caught any of the four above, because both were auditing the *translation* while the errors were in the *prose describing* the translation — including a summary that miscounted the very fixes listed three inches above it. Add: **a journal's self-description is in scope for review, and a count of a list is checkable against the list.** Note also that rounds 4–5's "two consecutive clean rounds" stopping rule was satisfied while four defects were still present — consecutive clean rounds are evidence of convergence only across the dimensions actually being examined, so a new round should introduce a new instrument rather than repeat an old one.
