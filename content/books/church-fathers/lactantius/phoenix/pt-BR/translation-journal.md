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

- Verified `book.json` structure (field names, order, TOC shape) matches the established convention used by other bilingual books (e.g. `kempis-imitation-of-christ`); confirmed it is valid JSON.
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
