# lesson-011 — findings

PDF pages: 30–31

## Issues

### Answer and footnote 1 merged onto one line (column-merge / structural drift)
- **Type:** column-merge
- **Line:** 17
- **Markdown says:** `— In God, there are three Divine Persons — the Father, the Son, and the Holy Ghost. 1. In speaking of the "Persons" in God, we do not use the term in exactly the same way we use it when speaking of people. We use it only for lack of another to show our meaning better.`
- **PDF says:** The answer (`In God, there are three Divine Persons — the Father, the Son, and the Holy Ghost.`) ends the response block; then footnote `1.` opens as a separate indented paragraph: `1. In speaking of the "Persons" in God, we do not use the term in exactly the same way we use it when speaking of people. We use it only for lack of another to show our meaning better.`
- **Suggested fix:** Split into two separate blocks — the answer paragraph ending after `Holy Ghost.`, then a new paragraph beginning `1. In speaking of the "Persons" in God, we do not use the term…`
