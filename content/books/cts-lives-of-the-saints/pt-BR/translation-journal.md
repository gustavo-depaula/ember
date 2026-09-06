# Translation Journal — Lives of the Saints (CTS) (pt-BR)

Source: en-US
Target: pt-BR

All 75 chapters were translated from the en-US originals in 8 parallel batches
(bin-packed by word count, sub-agent per batch). This journal consolidates
each batch's term glossary and translation decisions for reference; it is a
working document and is not rendered in the app.

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Saint / St. | São / Santa / Santo | Standard Portuguese liturgical form for the saint's name (e.g. "St. Francis de Sales" → "São Francisco de Sales") |
| Blessed Virgin | Virgem Santíssima / Santíssima Virgem | |
| confessor | confessor | |
| virgin and martyr | virgem e mártir | |
| feast day | dia de festa / festa | |
| patron | padroeiro / patrono | |
| religious order | ordem religiosa | |
| the Church | a Igreja | |
| Amen | Amém | |
| Bishop | Bispo | |
| Pope | Papa | |
| relics | relíquias | |
| Holy Ghost / Holy Spirit | Espírito Santo | |
| Sacred Heart | Sagrado Coração | |
| Viaticum / Holy Viaticum | Viático / Santo Viático | |
| Extreme Unction | Extrema-Unção | (also "Unção dos Enfermos" where the source itself uses the modern term) |
| Discalced Carmelites | Carmelo Descalço / Carmelitas Descalças | |
| stigmata / bilocation / ecstasy | estigmas / bilocação / êxtase | |
| Nihil Obstat / Imprimatur / Imprimi Potest | (kept in Latin, untranslated) | Established convention (see padre-pio.md): these closing ecclesiastical-approbation colophons stay in Latin verbatim, with only the surrounding office titles (Archbishop of X, Diocesan Censor) rendered in Portuguese. Dates and names inside them are transcribed exactly as in the source, even where they look like OCR errors — see Translation Decisions below. |

## Translation Decisions

- Bin-packed the 75 chapters into 8 batches translated in parallel by sub-agents; each batch owner was responsible for internal consistency and for logging new terms/decisions.
- Saints' names rendered in standard Portuguese devotional form throughout (e.g. "St. Thomas More" → "São Tomás Moro"; where no traditional Portuguese form is widely used, the closest Portuguese transliteration or the English form was kept, e.g. "Edith Stein", "MacKillop").
- Editor/publisher footnotes were dropped only when clearly detachable scholarly apparatus unrelated to the author's own text; in practice, no such footnotes were found in this book — all footnote-like material (author citations, Nihil Obstat/Imprimatur colophons, translator credits) is original front/back matter and was preserved.
- Measurements and currency are preserved as given in the source (miles, feet, stones, pounds, £) rather than silently converted, except in a few chapters (Don Bosco, Peter Chanel, John Francis Regis, Martin of Tours) where a batch converted distances to metric for readability — flagged here for a future consistency pass if the corpus wants one uniform policy.
- **Correction (post-batch, applied 2026-09-06):** the batch-6 sub-agent had silently "normalized" figures in `saint-pius-x.md` that it judged to be source errors — the Eucharistic Congress year (source says 1879; agent changed it to 1897) and the imprimatur day-of-month (source says "die 70, Jan."; agent changed it to "dia 30 de janeiro") — and had also translated the Latin Nihil Obstat/Imprimatur colophon into Portuguese, unlike every other chapter in this book. Both were reverted to match the en-US source verbatim: translations must not silently "fix" the source's own facts or dates, however implausible they read, and the established convention (see padre-pio.md) is to leave these closing Latin colophons untranslated.
- Batch 1 (saint-teresa-of-avila, saint-vincent-pallotti, saint-margaret-mary-alacoque, the-life-of-saint-anthony, saint-gregory-nazianzen-b-c, saint-john-of-god, poet-priest-martyr, saint-philip-neri, saint-benedict-abbot):
  - Spanish names in the Teresa chapter normalized to standard historical spelling (the English source itself has OCR-type inconsistencies, e.g. "Bezadas" for Becedas).
  - "Cure of Ars" → "Cura d'Ars" (used consistently across the whole book wherever it recurs).
  - One added bracketed Portuguese gloss for "Quam magnificata sunt opera Tua" (left fully untranslated in the English source) — the only added gloss in this batch, a deliberate accessibility judgment call rather than a footnote.
  - Gregory Nazianzen's own endnote apparatus (1–36) kept in full as author-integral citations, not a later editor's.
- Batch 2 (saint-ignatius-of-loyola, saint-francis-of-assisi, saint-augustine-bishop-of-hippo, saint-mary-mazzarello, saint-francis-de-sales, saint-clare-of-assisi, saint-dominic-confessor, saint-bernadette, saint-joseph-cafasso, saint-peregrine-the-cancer-saint):
  - Translated in three passes after two sub-agent interruptions (rate limit, then timeout); verified afterward that all 10 files exist exactly once with no duplication or gaps.
  - Measurements kept as in source (miles, stones, pounds), with a parenthetical metric gloss added only for "16 stones" (unfamiliar unit to pt-BR readers).
  - Garbled proper names in the Dominic chapter normalized to their standard historical French/Spanish spellings (e.g. "Verfeuil" → "Verfeil") — same historical referent, not a change of fact.
  - St Peregrine chapter's plain-text section titles (Novena, Prayer, Preparation for a Sick Call, etc.) kept as plain text, not converted to markdown headings, matching the source's actual (non-uniform) structure.
- Batch 3 (saint-stanislaus-kostka, saint-john-the-baptist, saint-rita, saint-bernard-abbot-of-clairvaux, saint-patrick, saint-edmund-campion, saint-john-fisher, saint-edith-stein, saint-joseph-calasanctius, saint-lucy-of-syracuse):
  - "St. Rita of Cascia" → "Santa Rita de Cássia" (well-established Brazilian devotional form for the place name).
  - "Clairvaux" → "Claraval" (universal Portuguese form); minor French monastery names with no standard exonym kept in French.
  - Scripture and prayer quotations translated fresh from the source's own (often KJV-derived) wording rather than substituted with an existing Portuguese Bible translation, to preserve each essay's own paraphrase and register.
  - "Non-Aryan" (Edith Stein chapter) kept literal/period rather than softened — it is quoted Nazi-era bureaucratic language, not the narrator's own voice.
- Batch 4 (saint-clement-mary-hofbauer-c-ss-r, saint-pius-v, saint-pascal-baylon, saint-dominic-savio, saint-margaret-of-cortona, saint-brigid, saint-vincent-strambi-c-p, saint-john-bosco, saint-rita-of-cascia):
  - Translated in two passes after a rate-limit interruption.
  - "Dom Bosco" kept as his primary reference throughout (matching the source's own usage), "Dom" being the standard Lusophone rendering of the Italian honorific "Don" for a priest.
  - Italian nicknames ("la mamma della misericordia", "la santa cigala") kept in Italian with the source's own English gloss translated into Portuguese.
  - St. Rita's litany translated using the same response conventions already established in the corpus's existing `saint-rita.md`, for cross-chapter consistency.
- Batch 5 (padre-pio, saint-gemma-galgani, saint-maximilian-kolbe, saint-elizabeth-of-hungary, saint-louise-de-marillac, saint-francis-xavier-s-j, saint-cataldus, saint-jude-helper-in-great-need, saint-dymphna):
  - Visible OCR noise in the English source (irregular spacing, broken line-wraps, a duplicated sentence in the Kolbe chapter) was silently resolved to the single most plausible reading rather than reproduced as a glitch.
  - The Tridentine Mass propers in `saint-jude-helper-in-great-need.md` were translated fully into Portuguese devotional register, since the source itself presents them only in English (not bilingual).
  - "w = W" mnemonic pun (Kolbe chapter) kept exactly as in source, untranslated — the surrounding text already glosses it in-line, so no translator's note was added.
- Batch 6 (saint-pius-x, saint-peter-aloysius-mary-chanel, eugene-de-mazenod, saint-mary-euphrasia-pelletier, saint-philomena, saint-john-francis-regis, the-dauntless-virgin-of-siena, saint-martin-of-tours, saint-cajetan-or-gaetano-confessor, saint-raymund-nonnatus):
  - "The Dauntless Virgin of Siena" kept as a translated literary nickname ("A Virgem Destemida de Sena") rather than swapped for St. Catherine's formal name, per the guidelines; she is identified by her full name within the body text.
  - "Mohammedans" (saint-raymund-nonnatus.md) kept as the source's own period English term ("maometanos") rather than modernized to "muçulmanos" — flagged here in case a future editorial pass prefers modernizing this term across the corpus for consistency with other translated books.
  - Distances converted to metric in the Chanel, John Francis Regis, and Martin of Tours chapters for readability.
  - See the correction entry above regarding `saint-pius-x.md`'s dates and colophon, which this batch's agent had altered and which were reverted to match the source.
- Batch 7 (saint-camillus-de-lellis, saint-gertrude, the-life-of-saint-john-berchmans-s-j, the-adventurous-nun, saint-pius-x-460, saint-joseph, saint-mary-magdalen, mary-mckillop, saint-philip-benizi-confessor):
  - `saint-pius-x-460.md` is a distinct, independent chapter about St. Pius X (a fictional-dialogue narrative, "Pope of the Eucharist") from the other Pius X chapter translated in batch 6 — translated as its own standalone piece with its own conversational register.
  - "St. Mary MacKillop": kept the English surname "MacKillop" (no Portuguese equivalent); the source's own inconsistent "McKillop"/"MacKillop" spelling was preserved in running prose as the source has it, with "MacKillop" used in the H1 title.
  - "negrophile" and the 1964 US racial slur (The Adventurous Nun) translated literally rather than softened, since the author is deliberately using the historical contrast to make a rhetorical point about racism — softening would blunt the argument.
- Batch 8 (saint-jean-b-m-vianney-cure-of-ars-1785-1859, saint-thomas-more, saint-rose-of-lima, saint-margaret-clitherow, the-mothers-saint, saint-wenceslas, saint-anthony-and-you, saint-louis-ix-king-of-france-confessor, the-martyrdom-of-saint-perpetua-and-felicitas-with-their-companions):
  - Caught and corrected two of its own drafting slips before finalizing (St. Martin de Porres misnamed "de Lima"; a place name transposed) — verified against source before writing.
  - Czech place/dynasty names in the Wenceslas chapter given standard modern Czech diacritics (e.g. Stará Boleslav, Bořivoj) while the saint's own name and his brother's follow the standard Portuguese royal-name convention (Venceslau, Boleslau) — flagged as a judgment call for a future editor who might want one policy applied uniformly.
  - No outdated terms required modernization in this batch; period vocabulary (e.g. "sarracenos" for "Saracens" in the Saint Louis IX chapter) was left as-is, being standard in Portuguese historical writing about the Crusades.
