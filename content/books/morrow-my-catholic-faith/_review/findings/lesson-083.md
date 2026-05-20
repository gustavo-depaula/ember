# lesson-083 — findings

PDF pages: 174–177

## Issues

### Spurious comma before "David speaks" in intro paragraph
- **Type:** ocr
- **Line:** 5
- **Markdown says:** "of heaven, David speaks:"
- **PDF says:** "of heaven David speaks:"
- **Suggested fix:** "of heaven David speaks:"

### Missing "and" before "are known and loved by God in return"
- **Type:** drift
- **Line:** 21
- **Markdown says:** "they know and love God to their utmost capacity, and are known and loved by God in return"
- **PDF says:** "They know and love God to their utmost capacity, and are known and loved by God in return" (PDF p.167 left column begins: "capacity, and are known and loved by God in return" — the full sentence on p.166 right column reads "They know and love God to their utmost")
- **Suggested fix:** Confirm sentence reads "They know and love God to their utmost capacity, and are known and loved by God in return." (capital T, not lowercase t — MD has lowercase "they" mid-sentence which may be a column-merge artifact)

### Lowercase "they" mid-sentence (column-merge artifact)
- **Type:** column-merge
- **Line:** 21
- **Markdown says:** "they know and love God to their utmost capacity"
- **PDF says:** Sentence begins at top of new column/page as "They know and love God to their utmost capacity" — capital T indicates a sentence start; the MD lowercased it when merging columns
- **Suggested fix:** "They know and love God to their utmost capacity, and are known and loved by God in return."

### Part Two title page: merged into single flat heading
- **Type:** structural drift
- **Line:** 63
- **Markdown says:** `## The Commandments of God of the Church` (single heading)
- **PDF says:** Three separate large display lines: "THE COMMANDMENTS / OF GOD / OF THE CHURCH" on a dedicated title page (p.177), where each phrase is its own typographic line — not a single run-on title
- **Suggested fix:** The title page content is a display element; "The Commandments of God of the Church" as a single heading is acceptable if the book format does not support title-page markup, but the rendering should not concatenate "OF GOD" and "OF THE CHURCH" without a line break distinction. Consider splitting or treating as a section divider. Needs human eyes.
