# lesson-073 — findings

PDF pages: 154–155

## Issues

### Caption paragraph appears before lesson heading in PDF but after it in MD
- **Type:** structural drift
- **Line:** 1–5
- **Markdown says:** `# 73. The Gates of Hell` → image ref → caption paragraph
- **PDF says:** Image + italic caption paragraph → then heading "73. THE GATES OF HELL" — the caption belongs to the illustration and precedes the lesson title on the page
- **Suggested fix:** Move the caption paragraph (lines 5) to before the `# 73. The Gates of Hell` heading, or mark it as a figure caption. The current MD order inverts the PDF's image-then-title structure.
