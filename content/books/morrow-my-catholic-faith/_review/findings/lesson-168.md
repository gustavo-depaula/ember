# lesson-168 — findings
PDF pages: 356–357

## Issues

### Lent/Advent answer merged with point 1

Type: structural drift
Line: 42
Markdown says: "— The Church allows Catholics to marry during Lent and Advent, provided they do so quietly and without much ceremony; a Nuptial Mass is forbidden during these seasons. 1. It is an error to think that the Church prohibits the contracting of marriage on any day of the year. …" (all in one paragraph)
PDF says: The answer ("— The Church allows Catholics to marry…") ends as its own block, then "1. It is an error…" opens a new numbered paragraph with a blank line between them.
Suggested fix: Insert a blank line after "…is forbidden during these seasons." so point 1 starts its own paragraph.

### Final-answer sequence items run together

Type: structural drift
Line: 60
Markdown says: "— To prepare for a holy and happy marriage. Catholics should: *First*, pray that God may direct their choice; *Second*, seek the advice of their parents and confessors; *Third,* practice the virtues, especially chastity; *Fourth*, frequently receive the sacraments of Penance and the Holy Eucharist." (single paragraph)
PDF says: Each ordinal (*First* / *Second* / *Third* / *Fourth*) begins on its own line, formatted as a broken list within the answer block.
Suggested fix: Place each item on its own line (preserve the semicolons; no bullet markers needed — just a newline before each ordinal to mirror the PDF's visual separation).
