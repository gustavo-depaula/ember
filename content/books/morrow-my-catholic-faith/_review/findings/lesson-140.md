# lesson-140 — findings
PDF pages: 294–301

## Issues

### Spurious `## Gloria` heading derived from photo caption
Type: structural drift
Line: 34
Markdown says: `## Gloria` (H2 heading preceding **The Kyrie** and **The Gloria** subsections)
PDF says: No "Gloria" section heading exists in the text; "Gloria" appears only as a photo caption label on p. 287. The first text heading in that section is "The Kyrie".
Suggested fix: Remove the `## Gloria` line entirely. The **The Kyrie** and **The Gloria** bold subheadings that follow are sufficient.

### Column-merge artifact in Introit aside: "Post- communions"
Type: column-merge
Line: 32
Markdown says: `Post- communions`
PDF says: `Post-communions` (single hyphenated word; the space before the hyphen is a line-break artefact from two-column layout)
Suggested fix: Replace `Post- communions` with `Post-communions`.

### OCR double-single-quote in "Nobis quoque peccatoribus" aside
Type: OCR
Line: 158
Markdown says: `''Nobis quoque peccatoribus"`
PDF says: `"Nobis quoque peccatoribus"`
Suggested fix: Replace the opening `''` with `"`.

### OCR double-single-quote in "Lord, I am not worthy" quotation
Type: OCR
Line: 192
Markdown says: `''Lord, I am not worthy that Thou shouldst enter under my roof; say but the word, and my soul shall be healed."`
PDF says: `"Lord, I am not worthy that Thou shouldst enter under my roof; say but the word, and my soul shall be healed."`
Suggested fix: Replace the opening `''` with `"`.

### OCR double-single-quote opening "Ite, Missa est"
Type: OCR
Line: 216
Markdown says: `'' *Ite, Missa est* "`
PDF says: `"*Ite, Missa est*"`
Suggested fix: Replace `'' *Ite, Missa est* "` with `"*Ite, Missa est*"`.
