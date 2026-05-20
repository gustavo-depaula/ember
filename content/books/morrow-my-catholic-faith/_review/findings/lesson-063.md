# lesson-063 — findings

PDF pages: 134–135

## Issues

### Section C and D merged onto one line (column-merge)
- **Type:** column-merge
- **Line:** 40
- **Markdown says:** "…'from whose right functioning depends the good civil society itself.' *(Pius XI)* D. The Defence of the Rights and Liberty of the Church: It is the duty…"
- **PDF says:** Section C closes with its own paragraph ending `(Pius XI)`. Section D — "**D. The Defence of the Rights and Liberty of the Church:**" — begins as a new bold-italic heading on a separate paragraph.
- **Suggested fix:** Split line 40 at `D.` — close out section C (with its attribution), add a blank line, then start section D as its own paragraph: `D. The Defence of the Rights and Liberty of the Church: It is the duty…`

### Section E and F merged onto one line (column-merge)
- **Type:** column-merge
- **Line:** 48
- **Markdown says:** "…'by every just and lawful means.' *(St. Pius X, Il Fermo)* F. Co-operation in the Scholastic Field: The School is among…"
- **PDF says:** Section E closes with its own sentence ending `(St. Pius X, Il Fermo)`. Section F — "**F. Co-operation in the Scholastic Field:**" — begins as a new bold-italic heading on a separate paragraph.
- **Suggested fix:** Split line 48 at `F.` — close out section E (with its attribution), add a blank line, then start section F as its own paragraph: `F. Co-operation in the Scholastic Field: The School is among…`
