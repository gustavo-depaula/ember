# lesson-080 — findings

PDF pages: 168–169

## Issues

### Missing opening quotation mark before "Assumption"
- **Type:** ocr
- **Line:** 79
- **Markdown says:** `> Assumption" in this sense means the taking up of the Blessed Virgin's body into heaven.`
- **PDF says:** `"Assumption" in this sense means the taking up of the Blessed Virgin's body into heaven.`
- **Suggested fix:** `> "Assumption" in this sense means the taking up of the Blessed Virgin's body into heaven.`

### Answer and point 1 run together on one line
- **Type:** structural drift
- **Line:** 84
- **Markdown says:** `— The bodies of the damned will also rise, to share in the eternal punishment of their souls. 1. The risen body of the wicked will be hideous and repulsive, a horror to behold.`
- **PDF says:** Two separate paragraphs: the catechism answer ends at "their souls." and "1. The risen body of the wicked…" opens as a new paragraph.
- **Suggested fix:** Split into two paragraphs with a blank line between the answer and "1. The risen body of the wicked will be hideous and repulsive, a horror to behold."
