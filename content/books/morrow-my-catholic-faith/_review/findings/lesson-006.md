# lesson-006 — findings

PDF pages: 20–21

## Issues

### Missing second illustration
- **Type:** illustration
- **Line:** (between lines 27 and 28 — no image ref present)
- **Markdown says:** (no second image reference exists in the file)
- **PDF says:** Page 21 opens with a full-width illustration of a pagan sacrifice scene, captioned separately from the body text.
- **Suggested fix:** Insert `![](../images/lesson-006-2.webp)` before the caption blockquote at line 28, once the image asset is confirmed.

### Caption misplaced as body blockquote instead of illustration caption
- **Type:** structural drift
- **Line:** 28
- **Markdown says:** `> From Adam and Eve down to the present, all men have acknowledged the existence of God. Even pagans and primitive peoples recognize a Supreme Being, a god. They have sacrifices, and they worship some deity whom they recognize as superior and supernatural, on whom man depends.`
- **PDF says:** This text is the caption of the second illustration (pagan sacrifice scene) on PDF page 21. It appears visually separated from the body text, between the image and the continuation of the "order and harmony" answer. In the markdown it is embedded as a blockquote under point 1 of that answer, which misrepresents its structural role.
- **Suggested fix:** Place this blockquote immediately after the second image ref (once added), not inline within the numbered list under point 1.
