# Translation Journal — The Phoenix / A Fênix (pt-BR)

Source: en-US (Fletcher translation, Ante-Nicene Fathers, Vol. 7)
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---|---|---|
| the Phoenix (bird) | a Fênix | feminine noun in Portuguese, kept feminine throughout as in the source ("she") |
| the eternal pole | o polo eterno | "pole" = celestial pole/axis, poetic for "sky" |
| grove of the sun | bosque do sol | |
| living fountain | fonte "viva" | kept the quotation marks around "living" as in the source, since the text glosses the fountain's name |
| Phœbus | Febo | epithet for the sun-god/the sun |
| Deucalion's waters | águas de Deucalião | mythological flood reference, kept as proper name |
| Phaethon's fires | fogos de Faetonte | mythological reference, kept as proper name |
| Syria / Phœnice | Síria / Fenícia | Venus's naming of the land, kept as proper noun pair to preserve the etymological pun with "Fênix" |
| Æolus / Æolas | Éolo | god of the winds |
| cassia, acanthus, spikenard, myrrh, frankincense, amomum, balsam | cássia, acanto, nardo, mirra, incenso, amomo, bálsamo | standard Portuguese botanical/aromatic terms |
| Assyrian / Arabian / Pygmæan / Sabæan | assírio / arábio / pigmeu / sabeu | ethnonyms, standard Portuguese forms |
| Iris (Tris) | Íris | goddess of the rainbow; source spells it "Tris," a known OCR/typo for "Iris" — corrected silently, noted below |
| jacinth | jacinto | gemstone, standard rendering |
| bird of Phasis (peacock relative, i.e. pheasant) | ave de Fásis | kept literal per source, a poetic circumlocution for the pheasant |
| Venus | Vênus | kept as proper name throughout (goddess and planet) |
| Mars | Marte | god of war |
| the Arabian(s) | o árabe / os árabes | standardized on the standard demonym noun "árabe" (fixed an initial inconsistency where "arábio" — an adjectival/toponymic form, cf. "golfo Arábio" — was used once for a person; "árabe" is the correct noun for a person from Arabia) |
| Cyrrhæan strains | acordes cirreus | transliterated epithet from Cirrha/Kirrha (town near Delphi sacred to Apollo); no standard Portuguese equivalent exists for this rare classical adjective, so it was rendered by direct adaptation, consistent with how the English source itself keeps the Latinized form |

## Translation Decisions

- 2026-09-10: Preserved the single unbroken paragraph structure of the source — the poem is transmitted as continuous prose-verse in this translation, with no internal paragraph breaks, matching the original en-US file exactly.
- 2026-09-10: Corrected "Tris" to "Íris" (goddess Iris, personification of the rainbow) — a well-documented transcription slip in this text's transmission history, not a deliberate variant. No translator's note added since it's a silent correction of an obvious proper-name typo, consistent with how the source itself is a lightly modernized 19th-century translation.
- 2026-09-10: Kept "Phœbus," "Faetonte," "Deucalião," "Éolo," "Vênus," "Marte," "Íris" as proper names (Latin/Greek mythological figures) rather than translating them, since Lactantius (or the poem's uncertain author) uses them as literary epithets, not literal deities — this matches how the English source treats them.
- 2026-09-10: "Æolas shuts in the winds" — the source's "Æolas" is a variant/poetic form of "Æolus"; rendered simply as "Éolo," the standard Portuguese form of the god of the winds, since the variant spelling carries no meaning distinct from the standard name.
- 2026-09-10: Rendered the parenthetical attribution line "Written by an uncertain author, and attributed to Lactantius" as "Escrito por um autor incerto, e atribuído a Lactâncio" — "Lactâncio" is the standard Portuguese form of "Lactantius," used consistently.

## Review Pass 1 (2026-09-10)

- Verified sentence-terminator count matches the en-US source exactly (67 = 67) — no dropped or merged sentences.
- Fixed "ungüento" → "unguento": the trema/diaeresis was abolished by the 1990 Lusophone Orthographic Agreement (in force in Brazil since 2009); "ungüento" is now a misspelling.
- Fixed inconsistent demonym: "arábio" (an adjectival/toponymic form) was used once where "árabe" (the correct noun for a person from Arabia) was used elsewhere for the same English word "Arabian." Standardized on "árabe."
- Confirmed all mythological proper names (Febo, Éolo, Íris, Vênus, Marte, Faetonte, Deucalião, Fenícia) are consistently and correctly accented throughout, with no stray unaccented duplicates.
- Confirmed the single-paragraph structure, heading, and italicized attribution line match the source 1:1.

## Review Pass 2 (2026-09-10)

- Full clause-by-clause re-comparison against the en-US source, sentence by sentence. No omissions, no mistranslations, no theological/factual drift found.
- Verified "bico" (beak) is used consistently both times the source says "mouth" (a natural localization for a bird, applied consistently in both instances — not flagged as an error).
- Verified "árabe"/"árabes" now used consistently in both remaining instances after the Pass 1 fix; no stray "arábio" or trema (ü) left anywhere in the file.
- No issues found. Clean.

## Review Pass 3 (2026-09-10)

- Verified `book.json` structure (field names, order, TOC shape) matches the established convention used by other bilingual books (e.g. `kempis-imitation-of-christ`); confirmed it is valid JSON. **(The verdict holds but the citation is backwards — `kempis-imitation-of-christ` is one of only three corpus-wide outliers on field order. See the `book.json` correction at the end of this file.)**
- Fixed a quoting-style inconsistency: the en-US source uses curly/smart quotes for the fountain's name ("living"), but the pt-BR file used straight quotes ("viva"). Changed to curly quotes ("viva") to match.
- No further issues found.

## Review Pass 4 (2026-09-10)

- Re-verified the fix from Pass 3 landed correctly and re-ran the full sentence-count and diacritics checks — all still consistent (67 = 67 sentence-enders, no stray unaccented mythological names, no trema).
- No issues found. Clean.

## Review Pass 5 (2026-09-10)

- Scanned for doubled-letter typos; only legitimate Portuguese words with doubled vowels found ("voo," "escoou"), no misspellings.
- Confirmed "atribuído" spelled correctly (single t).
- Rebuilt the corpus (`pnpm build:corpus`) — no drift/format warnings for `book/lactantius-phoenix`, blob and catalog entries generated cleanly for pt-BR.
- No issues found. Clean. (Second consecutive clean pass — review complete.)

## Post-Merge Audit Round 1 (2026-09-10)

Run after PR #438 merged. Three independent reviewers on separate lenses (completeness/structure; pt-BR mechanics; semantic fidelity), none primed with the pre-merge findings and all instructed to treat this journal's claims as unverified.

- Completeness/structure: clean. Sentence alignment re-walked independently (67 = 67), heading and attribution line match 1:1, single-paragraph structure intact, `book.json` valid and carrying pt-BR in `languages`, `name`, `author`, and the TOC title. (This round's reviewer also compared field order against `kempis-imitation-of-christ` and `augustine-confessions` — see the correction below for why those are the wrong exemplars.)
- Semantic fidelity: clean. No mistranslation, no numeral/measure drift, no mythological confusion, no theological drift, no untranslated leftovers.
- **One real defect found and fixed — pronoun concord with a mixed-gender coordinated antecedent.** The clause listing what the bird encloses — "todos os restos do próprio corpo, e os ossos ou cinzas, e as relíquias de si mesma" — is mixed gender (`os restos` m., `os ossos` m., `cinzas` f., `as relíquias` f.), and the en-US source resumes the whole list with a single collective "it"/"this" ("brings **it** into a round form… carrying **this** with her feet… draws **it** forth"). The pt-BR used feminine plural clitics (`as molda`, `levando-as`, `as deposita`), which agree only with the nearest item, `as relíquias`, narrowing the referent and dropping the rest of the list from the action. Standard concord for a pronoun resuming mixed-gender coordinated nouns is masculine plural. Fixed to `os molda`, `levando-os`, `os deposita`.
- **Reported and rejected: the `“viva”` curly quotes are not a defect, and the Pass 3 entry above mis-describes what it did.** See the correction below; Pass 3's premise was wrong even though its result is acceptable.

### Correction to Review Pass 3 — quote style is a per-file convention, not a corpus-wide character

Pass 3 above claims it "fixed a quoting-style inconsistency." It did not: the file was internally consistent both before and after, and the change was a style swap, not a defect fix. A reviewer in this round re-flagged `“viva”` as a house-convention violation on the strength of a straight-quote count; the fuller measurement refutes both readings. Counting straight `"` vs curly `“ ”` across all 31 pt-BR chapter files under `content/books/church-fathers/` (journals excluded):

- 738 straight quote marks vs 14 curly-open / 14 curly-close — straight dominates *by volume*.
- But by file: **20 files straight-only, 6 files curly-only, 5 files with no quote marks at all (20 + 6 + 5 = 31), and 0 files that mix the two styles internally.**

Zero mixed files is the signal. The corpus convention that actually holds is **be internally consistent within a file**; the character itself splits per file, and curly-only is a real, established cluster (`gregory-thaumaturgus/all-the-saints`, `gregory-thaumaturgus/matthew-6`, `hippolytus/against-plato`, `hippolytus/apostles-and-the-disciples`, `origen/africanus-to-origen`, and now this file). So `“viva”` is a defensible choice and must not be "fixed."

**Do not flip this character again in either direction.** Measuring two straight-only files (as the `docs/journal.md` entry for `ignatius/martyrdom` and `polycarp/martyrdom` did) samples one cluster and reads as a corpus-wide rule it cannot support — that is how a single quote mark gets flipped back and forth across review rounds. Recorded closed by name, per the standing lesson that a candidate re-derived this many times should be retired from future rounds.

### Correction — `book.json` field order: the right verdict from the wrong exemplars

Review Pass 3 above, and this round's structure reviewer, both checked this book's `book.json` field order against `kempis-imitation-of-christ` (and `augustine-confessions`) and pronounced it conformant. The verdict is correct but the citation is exactly backwards, and a future reviewer who opens those files to spot-check will find a mismatch and may wrongly flag this book.

Measured across all 548 `book.json` files in `content/books/`:

- **545 put `author` before `languages`** — including all **420** under `church-fathers/`, unanimously. This book does the same (`id, name, author, languages, sources, toc`).
- **Only 3 invert it** (`languages` before `author`, plus a `composed` field this book has no data for): `augustine-confessions`, `kempis-imitation-of-christ`, `sales-introduction-to-the-devout-life`.

So two of the three corpus-wide outliers are precisely the books that were cited as "the established convention." This book conforms to the real one. **When checking a structural convention, measure all of `content/books/**/book.json` rather than opening one or two familiar books** — the same error as the quote-style claim above, in a different field.
