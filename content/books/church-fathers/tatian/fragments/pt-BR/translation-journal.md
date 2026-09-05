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
