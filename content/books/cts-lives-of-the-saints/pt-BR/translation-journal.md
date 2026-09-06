# Translation Journal — Lives of the Saints (CTS) (pt-BR)

Source: en-US
Target: pt-BR

## Key Terms

| English | Portuguese | Notes |
|---------|------------|-------|
| Saint / St. | São / Santa / Santo | Use standard Portuguese liturgical form for the saint's name (e.g. "St. Francis de Sales" → "São Francisco de Sales"); use "Santo" before names starting with a vowel-friendly form only where customary (e.g. Santo Antônio, but São Francisco) |
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

## Translation Decisions

- Bin-packed the 72 chapters into 8 batches translated in parallel by sub-agents; each batch owner is responsible for internal consistency and for logging new terms/decisions below before merge.
- Saints' names rendered in standard Portuguese devotional form throughout (e.g. "St. Thomas More" → "São Thomas More" is avoided in favor of the traditional Lusophone form where one is well established; when no traditional Portuguese form is widely used, keep the closest Portuguese transliteration).
- Editor/publisher footnotes (if any) dropped per skill default; author asides kept.
- Batch 3 (saint-stanislaus-kostka, saint-john-the-baptist, saint-rita, saint-bernard-abbot-of-clairvaux, saint-patrick, saint-edmund-campion, saint-john-fisher, saint-edith-stein, saint-joseph-calasanctius, saint-lucy-of-syracuse): see `journal-notes-batch-3.md` for this batch's term table and decisions.
- Batch 1 (saint-teresa-of-avila, saint-vincent-pallotti, saint-margaret-mary-alacoque, the-life-of-saint-anthony, saint-gregory-nazianzen-b-c, saint-john-of-god, poet-priest-martyr, saint-philip-neri, saint-benedict-abbot): see `journal-notes-batch-1.md`.
- Batch 2 (saint-ignatius-of-loyola, saint-francis-of-assisi, saint-augustine-bishop-of-hippo, saint-mary-mazzarello, saint-francis-de-sales, saint-clare-of-assisi, saint-dominic-confessor, saint-bernadette, saint-joseph-cafasso, saint-peregrine-the-cancer-saint): see `journal-notes-batch-2.md`. Translated in two passes after two rate-limit/timeout interruptions on the sub-agent; no content overlap or duplication resulted — verified all 10 files present exactly once.
- Batch 4 (saint-clement-mary-hofbauer-c-ss-r, saint-pius-v, saint-pascal-baylon, saint-dominic-savio, saint-margaret-of-cortona, saint-brigid, saint-vincent-strambi-c-p, saint-john-bosco, saint-rita-of-cascia): see `journal-notes-batch-4.md`. Also translated in two passes after a rate-limit interruption.
- Batch 5 (padre-pio, saint-gemma-galgani, saint-maximilian-kolbe, saint-elizabeth-of-hungary, saint-louise-de-marillac, saint-francis-xavier-s-j, saint-cataldus, saint-jude-helper-in-great-need, saint-dymphna): see `journal-notes-batch-5.md`.
- Batch 6 (saint-pius-x, saint-peter-aloysius-mary-chanel, eugene-de-mazenod, saint-mary-euphrasia-pelletier, saint-philomena, saint-john-francis-regis, the-dauntless-virgin-of-siena, saint-martin-of-tours, saint-cajetan-or-gaetano-confessor, saint-raymund-nonnatus): see `journal-notes-batch-6.md`. CORRECTED post-batch: the sub-agent had silently "normalized" the source's own date/day figures in saint-pius-x.md (Eucharistic Congress year 1879→1897, and the imprimatur's "die 70, Jan." → "dia 30 de janeiro") and had translated the Latin Nihil Obstat/Imprimatur colophon into Portuguese, unlike every other chapter in this book which leaves such Latin colophons untranslated (see padre-pio.md for the established convention). Reverted both the dates and the colophon to match the en-US source verbatim — translations must not silently "fix" the source's facts, however implausible they read.
- Batch 7 (saint-camillus-de-lellis, saint-gertrude, the-life-of-saint-john-berchmans-s-j, the-adventurous-nun, saint-pius-x-460, saint-joseph, saint-mary-magdalen, mary-mckillop, saint-philip-benizi-confessor): see `journal-notes-batch-7.md`.
- Batch 8 (saint-jean-b-m-vianney-cure-of-ars-1785-1859, saint-thomas-more, saint-rose-of-lima, saint-margaret-clitherow, the-mothers-saint, saint-wenceslas, saint-anthony-and-you, saint-louis-ix-king-of-france-confessor, the-martyrdom-of-saint-perpetua-and-felicitas-with-their-companions): see `journal-notes-batch-8.md`. NOTE FOR REVIEW: agent reported catching/fixing two of its own factual slips mid-draft (St. Martin de Porres name, a place name) before finalizing — worth spot-checking against source.
