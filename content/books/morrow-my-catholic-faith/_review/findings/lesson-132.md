# lesson-132 — findings

PDF pages: 278–279

## Issues

### Missing second image reference
- **Type:** image-ref
- **Line:** 22 (before the caption)
- **Markdown says:** caption "The illustration shows religious preparing wine from grapes for consecration…" appears inline with no preceding image tag
- **PDF says:** a full-page illustration of religious pressing grapes appears at the top of PDF page 271 (p. 279 in PDF), immediately above the caption
- **Suggested fix:** Insert `![](../images/lesson-132b.webp)` on a blank line before line 22 (the caption line), and ensure the corresponding image is exported/named accordingly
