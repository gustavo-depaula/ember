# lesson-131 — findings
PDF pages: 276–277

## Issues

### Structural drift — answer and point 1 merged into one paragraph

Type: structural drift
Line: 29
Markdown says: `— Our Divine Saviour said the first Mass, at the Last Supper, the night before He died. 1. At the Last Supper, Jesus Christ offered Himself up as a sacrifice to the Eternal Father, under the appearances of bread and wine.`
PDF says: The catechism answer ("Our Divine Saviour said the first Mass, at the Last Supper, the night before He died.") is its own paragraph, followed by a separate indented paragraph beginning "1. At the Last Supper, Jesus Christ offered Himself up…"
Suggested fix: Split into two paragraphs — end the answer line after "He died." and start a new paragraph with `1. At the Last Supper…`

### Image ref missing — two Last Supper images on page 269

Type: image-ref
Line: (between lines 24 and 27, i.e. between the Matt. 26 caption paragraph and the "Who said the first Mass?" heading)
Markdown says: No image references for the two illustrations on page 269.
PDF says: Page 269 opens with two side-by-side illustrations of the Last Supper (labelled 1 and 2) above the caption block for Matt. 26:26, 28.
Suggested fix: Insert two image references (e.g. `![](../images/lesson-131b.webp)` and `![](../images/lesson-131c.webp)`) before the Matt. 26 caption paragraph, matching the convention used for other in-chapter illustrations.
