# lesson-149 — findings
PDF pages: 318–319

## Issues

### Spurious opening quotation mark on "For instance" blockquote
Type: OCR
Line: 53
Markdown says: `"For instance it is not enough to say merely, I stole five dollars," if they were stolen from a blind beggar…`
PDF says: `For instance it is not enough to say merely, I stole five dollars," if they were stolen from a blind beggar…` (no opening `"` before "For instance")
Suggested fix: Remove the opening `"` so the blockquote begins: `For instance it is not enough…`

### Answer and numbered point 1 merged into single paragraph under "Is it necessary to confess every sin?"
Type: structural drift
Line: 62
Markdown says: `— It is necessary to confess every mortal sin which has not yet been confessed and forgiven; it is not necessary: to confess our venial sins, but it is better to do so. 1. We must confess all our mortal sins, God surely can forgive us without Confession;…` (all one paragraph)
PDF says: The catechism answer ends after "it is better to do so." and numbered point "1. We must confess all our mortal sins…" begins as a separate paragraph.
Suggested fix: Split into two paragraphs — close the answer after "it is better to do so." and start point 1 as a new paragraph: `1. We must confess all our mortal sins,…`
