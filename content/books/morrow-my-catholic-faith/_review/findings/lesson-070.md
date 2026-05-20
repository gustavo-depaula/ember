# lesson-070 — findings

PDF pages: 148–149

## Issues

### Merged blockquote paragraphs under Q2 / point 1
- **Type:** structural drift
- **Line:** 41
- **Markdown says:** One single `>` blockquote paragraph beginning "A baptised Protestant…" running all the way through "…with which he can merit eternal life."
- **PDF says:** Two distinct indented paragraphs. The first ends at "…everyone having the use of reason can do that." The second begins "Whoever then obeys the natural law will be enlightened by God…" and ends "…with which he can merit eternal life."
- **Suggested fix:** Split the blockquote at line 41 into two separate `>` paragraphs, with a blank `>` line between them — first ending after "…everyone having the use of reason can do that." and the second starting "Whoever then obeys the natural law…"
