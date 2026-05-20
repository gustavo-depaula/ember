# lesson-030 — findings

PDF pages: 68–69

## Issues

### Spurious section heading from running page header
- **Type:** structural drift
- **Line:** 21
- **Markdown says:** `## The Incarnation`
- **PDF says:** "THE INCARNATION" appears only as a running page header at the top of page 61 — there is no mid-chapter subheading in the body text. The chapter flows directly from the page-60 content into "How was the Son of God made man?" with no intervening heading.
- **Suggested fix:** Delete line 21 (`## The Incarnation`) entirely.

### Missing article "a" before "prayer"
- **Type:** ocr
- **Line:** 49
- **Markdown says:** `…commemorated daily by the Angelus, prayer said by Catholics…`
- **PDF says:** `…commemorated daily by the Angelus, a prayer said by Catholics…`
- **Suggested fix:** `…commemorated daily by the Angelus, a prayer said by Catholics…`

### Unclosed quotation mark in Angelus blockquote
- **Type:** ocr
- **Line:** 51
- **Markdown says:** `…the Hail Mary is recited. "This procedure is repeated three times for the three verses and three Hail Marys. Then follows continual ringing while the Prayer is said. During the Easter time…`
- **PDF says:** The direct-quote block ends with a closing `"` after "Prayer is said." — the sentence `During the Easter time…` is outside the quotation. The opening `"` before "This procedure" has no matching closing `"`.
- **Suggested fix:** `…the Hail Mary is recited. "This procedure is repeated three times for the three verses and three Hail Marys. Then follows continual ringing while the Prayer is said." During the Easter time…`
