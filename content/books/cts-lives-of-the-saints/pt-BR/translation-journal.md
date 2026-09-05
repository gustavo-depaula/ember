# Translation Journal — Lives of the Saints (CTS) (pt-BR)

Source: en-US (Catholic Truth Society pamphlets, digitized by ecatholic2000.com)
Target: pt-BR

## Format Notes

- Chapters are plain narrative prose: `# Title` then `## Section` subheadings (not every chapter has subsections).
- No footnotes in the source — nothing to drop or preserve on that front.
- Quoted speech in the source uses straight single quotes as a loose approximation of dialogue punctuation (an OCR artifact of the original pamphlets); render as normal Portuguese dialogue/quotation punctuation, don't preserve the single-quote convention literally.
- Keep proper names, place names, and dates as in the source unless a well-known Portuguese form exists (below).

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| St. (male) | São | before a consonant-initial name (São Francisco, São João, São Bento) |
| St. (male, vowel/silent-H initial) | Santo | Santo Antônio, Santo Inácio, Santo Aelredo |
| St. (female) | Santa | Santa Rita, Santa Teresa |
| Blessed | Beato / Beata | |
| Confessor | Confessor | |
| Martyr | Mártir | |
| Virgin | Virgem | |
| Bishop | Bispo | |
| Archbishop | Arcebispo | |
| Cardinal | Cardeal | |
| Abbot | Abade | |
| Pope | Papa | |
| Our Lord | Nosso Senhor | |
| Our Lady / Blessed Virgin | Nossa Senhora / Santíssima Virgem | |
| Holy Communion | Sagrada Comunhão / Santa Comunhão | |
| Confession | Confissão | |
| Guardian Angel | Anjo da Guarda | |
| Salesian | Salesiano | |
| Holy Year | Ano Santo | |
| Basilica | Basílica | |

## Proper Names Rendered

| English | Portuguese |
|---------|------------|
| Dominic (Savio) | Domingos |
| Charles Savio | Carlos Savio |
| Brigid (Savio's mother) | Brígida |
| Pius XII | Pio XII |
| St. Anthony (of Lisbon/Padua) | Santo Antônio (de Pádua) — distinct from St. Anthony the Hermit/Abbot, "Santo Antão" |
| St. Catherine of Siena | Santa Catarina de Siena |
| St. John Berchmans | São João Berchmans |
| St. Perpetua and Felicitas | Santas Perpétua e Felicidade |
| St. Gerard Majella | São Gerardo Majella |
| St. Thomas More | São Tomás Moro (family surname "More"/"Roper" kept untranslated for relatives, e.g. Alice Middleton, Margaret Roper) |
| Blessed John Fisher | Beato João Fisher |
| St. Vincent Pallotti | São Vicente Pallotti (his "Society of the Catholic Apostolate" → "Sociedade do Apostolado Católico") |
| St. Vincent Strambi | São Vicente Strambi |
| St. Wenceslas | São Venceslau (Czech names — Drahomira, Ludmila, Boleslau, Bořivoj — kept in standard transliterated forms) |
| Bohemia | Boêmia |

## Translation Decisions

- (seed) No editor footnotes present in this book — no drop/keep decision needed.
- A few chapters (e.g. saint-margaret-clitherow.md) DO contain the *original author's* own asterisk-marked bibliographic citations (not later editor apparatus) — these are kept and translated, since the "no footnotes" note only covers markdown `[^N]` editor-footnote style, which never appears in this book.
- "Don" (Italian religious title, e.g. Don Bosco, Don Cafasso) → "Dom" throughout.
- Mass propers (Introit, Collect, Epistle, Gradual, Gospel, Offertory, Secret, Preface, Communion, Postcommunion), where a chapter includes them in full (e.g. saint-jude-helper-in-great-need.md), use standard Portuguese Missal headings: Intróito, Coleta, Epístola, Gradual, Evangelho, Ofertório, Secreta, Prefácio, Comunhão, Pós-Comunhão.
- One-off untranslatable foreign legal/idiomatic phrases (e.g. French *peine forte et dure*, *les pauvres honteux*) kept italicized in the original with a short parenthetical Portuguese gloss.
- **saint-camillus-de-lellis.md**: the source has visibly OCR-garbled Peru/Ecuador place names ("Popogani, Quamanga, Quayquillo Truxillo", "Cattano" among Italian cholera cities). Rendered using the real, identifiable place names (Popayán, Huamanga, Guayaquil, Trujillo, Catânia) rather than transcribing the garbling — flagged here since it's an interpretive OCR correction, not a straight translation choice.
- **Strigonia** (old name for Esztergom, Hungary) kept as "Strigônia" (attested archaic Portuguese form), matching the source's own archaic usage rather than modernizing.
- Latin phrases the source itself glosses inline (e.g. *Tolle lege* / "Take up and read", *Doctor mellifluus*) are kept in Latin with the Portuguese gloss immediately following, mirroring the source's own bilingual presentation.

## Proper Names Rendered (continued)

| English | Portuguese |
|---------|------------|
| Dominic Savio (surname) | Sávio (accented; parents "Carlos Sávio"/"Brígida Sávio") |
| Friars Preachers / Order of Preachers | Frades Pregadores / Ordem dos Pregadores |
| Theatines / Clerks Regular | Teatinos / Clérigos Regulares |
| Camillians / Ministers of the Sick | Camilianos / Ministros dos Enfermos |
| Redemptorists | Redentoristas (abbreviation "C.SS.R." kept untranslated) |
| Josephism | Josefismo |
| St. Robert Southwell | São Roberto Southwell |
| St. Philip Howard | São Filipe Howard |
| Fr. Robert Parsons | Padre Roberto Parsons |
| St. Louis Gonzaga (Aloysius) | São Luís Gonzaga |
| St. Peter of Alcantara | São Pedro de Alcântara |
| St. Raymund Nonnatus | São Raimundo Nonato |

## Known Inconsistencies to Resolve in Review

- **saint-philip-benizi-confessor.md**: chapter heading reads "Santo Filipe Benizi, Confessor" but book.json TOC / this journal use "São Filipe Benízio, Conf." — "Filipe" is consonant-initial so "São" is correct per this journal's own rule; needs reconciling to "São Filipe Benízio" (or "Benizi" — pick one spelling) during review.
- **the-adventurous-nun.md**: the source quotes the historical slur "nigger-lovers" (1960s U.S. civil-rights usage) as reported speech describing how such activists were labelled, paralleling the period term "negrophiles" used of Bl. Anne-Marie Javouhey. Rendered descriptively as "amantes de negros" rather than importing an equivalent Portuguese slur — preserves the passage's point (that defending persecuted people invites ugly labels) without reproducing a slur. Kept in quotes as reported speech, same as the source.
