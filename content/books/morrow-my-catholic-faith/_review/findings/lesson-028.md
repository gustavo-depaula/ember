# lesson-028 — findings

PDF pages: 64–65

## Issues

### Extra space before period in blockquote citation
- **Type:** ocr
- **Line:** 18
- **Markdown says:** `"believe the works" (John 10: 38) . Christ foretold future`
- **PDF says:** `"believe the works" (John 10: 38). Christ foretold future`
- **Suggested fix:** Remove the space before the period → `(John 10: 38). Christ foretold future`

### Missing closing period on Luke blockquote
- **Type:** ocr
- **Line:** 37
- **Markdown says:** `…from his own mouth'" (Luke 22: 70-71)`
- **PDF says:** `…from his own mouth'" (Luke 22: 70-71).`
- **Suggested fix:** Add period at end → `(Luke 22: 70-71).`

### Sub-items a–d merged into single paragraph
- **Type:** drift
- **Line:** 69
- **Markdown says:** `a. Christ performed miracles on inanimate objects… b. He healed in an instant the sick, the blind, the lame. He expelled devils. c. He raised the dead to life; as the daughter of Jairus, the son of the widow of Naim and Lazarus… d. He worked miracles on His own Person, as in the Transfiguration, Resurrection, and Ascension.`
- **PDF says:** Four separate paragraphs: `a. Christ performed miracles…` / `b. He healed in an instant…` / `c. He raised the dead to life; as the daughter of Jairus, the son of the widow of Naim and Lazarus…` / `d. He worked miracles on His own Person, as in the Transfiguration, Resurrection, and Ascension.`
- **Suggested fix:** Split into four separate paragraphs, each starting on its own line with a blank line between them.
