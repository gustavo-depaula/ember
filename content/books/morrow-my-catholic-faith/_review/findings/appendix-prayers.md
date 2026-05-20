# appendix-prayers — findings
PDF pages: 412–415

## Issues

### 1. "Prayer to the Guardian Angel" and "The Divine Praises" merged into one paragraph

Type: Column-merge / Missing heading / Structural drift
Line: 115
Markdown says: `Angel of God, my guardian dear, To whom God's love entrusts me here, Ever this day be at my side, To light and guard, to rule and guide, from stain of sin, Oh keep me free and at my death my helper be. Amen. The Divine Praises Blessed be God. Blessed be His holy Name. Blessed be Jesus Christ, true God and true man. Blessed be the Name of Jesus. Blessed be His most Sacred Heart. Blessed be Jesus in the Most Holy Sacrament of the Altar. Blessed be the great Mother of God, Mary most holy. Blessed be her holy and Immaculate Conception. Blessed be the name of Mary, Virgin and Mother. Blessed be St. Joseph, her most chaste spouse. Blessed be God in His Angels and in His Saints.` (all one paragraph, "The Divine Praises" buried inline)
PDF says: Prayer to Guardian Angel ends. Then a bold heading **The Divine Praises** followed by each "Blessed be…" clause on its own line.
Suggested fix: Split at "Amen." End the Guardian Angel prayer there. Add `**The Divine Praises**` as a new bold heading. Then render each "Blessed be…" clause on its own line (one per paragraph or with line breaks).

---

### 2. "The Angelus" collapsed into one paragraph — V./R. structure lost

Type: Column-merge / Structural drift
Line: 120
Markdown says: One continuous paragraph running all versicles, responses, and "Hail Mary, etc." together.
PDF says: Each versicle (V.) and response (R.) is on its own line; "Hail Mary, etc." is on its own line; "Let us Pray" is on its own line before the collect.
Suggested fix: Reformat with each V./R. pair and "Hail Mary, etc." on separate lines, and "Let us Pray" as its own line before the collect paragraph.

---

### 3. "Regina Coeli" collapsed into one paragraph — antiphon structure lost

Type: Column-merge / Structural drift
Line: 127
Markdown says: One continuous paragraph running all antiphon lines, versicle, response, "Let us Pray", and collect together.
PDF says: Each antiphon line is on its own line (e.g. "Queen of heaven, rejoice. Alleluia." / "For He whom thou didst deserve to bear. Alleluia." / "Hath risen as He said. Alleluia." / "Pray for us to God. Alleluia."), then V./R. on separate lines, then "Let us Pray" as its own line.
Suggested fix: Reformat each antiphon line and versicle/response on separate lines; "Let us Pray" on its own line before the collect.

---

### 4. "The Mysteries of the Rosary" collapsed into one paragraph

Type: Column-merge / Structural drift
Line: 139
Markdown says: One continuous paragraph with all three sets of mysteries (Five Joyful, Five Sorrowful, Five Glorious) run together.
PDF says: Each set has its own group heading ("The Five Joyful Mysteries", etc.) followed by numbered items on separate lines, with blank space between groups.
Suggested fix: Render each group heading on its own line, then each numbered mystery on its own line.

---

### 5. Tantum Ergo — italic subtitle duplicates first stanza line

Type: Structural drift / OCR artefact
Line: 191–193
Markdown says:
```
*Tantum ergo Sacramentum.*

Tantum ergo Sacramentum
Veneremur cernui: (bow your head)
```
PDF says: The italic line `Tantum ergo Sacramentum.` is the incipit/subtitle in small italic. The stanza immediately below begins `Veneremur cernui: (bow your head)` — "Tantum ergo Sacramentum" is not repeated as a separate stanza line in the PDF body; it is only the italic caption.
Suggested fix: The MD correctly shows "Tantum ergo Sacramentum" as the first line of the stanza (this is canonically correct as the hymn's first word), but the italic `*Tantum ergo Sacramentum.*` caption above it creates a visual duplication. If the italic line is meant to be a subtitle/incipit label only (as printed), consider dropping it or changing it to a parenthetical rubric so the stanza is not repeated. The canonical Latin text does have "Tantum ergo Sacramentum" as stanza line 1, so the stanza body is correct; the subtitle is the issue.

---

### 6. Ejaculation indulgence note for "Jesus, Mary, and Joseph, bless us…" missing from blockquote

Type: Structural drift
Line: 177–181
Markdown says: `Jesus, Mary, and Joseph, bless us now and at the hour of our death.` with no indulgence note following it; the three "Jesus, Mary, Joseph…" sentences then run together in one paragraph.
PDF says: After "Jesus, Mary, and Joseph, bless us now and at the hour of our death." the note `(500 days' indulgence)` appears inline, and then the three "Jesus, Mary, Joseph, I give you…" / "…assist me…" / "…may I breathe…" sentences are each on their own line.
Suggested fix: Add `> (500 days' indulgence)` after line 177. Then split the three "Jesus, Mary, Joseph" sentences onto separate lines/paragraphs.
