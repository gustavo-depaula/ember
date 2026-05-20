# lesson-054 — findings

PDF pages: 116–117

## Issues

### Column-merge: first 400 years split into two paragraphs in PDF
- **Type:** column-merge
- **Line:** 10
- **Markdown says:** "— The following is a brief summary: The first 400 years: The Apostles dispersed to different countries in order to carry out Christ's command to teach. The Apostles baptised, preached, and ruled in various countries to which they were sent. They appointed bishops and priests to rule and minister to the faithful. In spite of sufferings and persecutions they persevered, until finally they sealed their faith by martyrdom. Peter and Paul were especially interested in the conversion of the Roman Empire, the mightiest and also most wicked empire of ancient days."
- **PDF says:** Two distinct paragraphs: (1) "The first 400 years: The Apostles dispersed … minister to the faithful." then (2) "In spite of sufferings and persecutions they persevered … empire of ancient days." — with the second paragraph starting as a new paragraph break in the printed column
- **Suggested fix:** Split line 10 into two paragraphs: end the first at "minister to the faithful." and begin a new paragraph with "In spite of sufferings and persecutions they persevered…"

### Structural drift: last paragraph of line 30 merges two PDF paragraphs
- **Type:** structural drift
- **Line:** 30
- **Markdown says:** "…(see Chapter 191 on Propagation of the Faith) At present, the Church has a membership…"
- **PDF says:** Two separate paragraphs: one ending "…(see Chapter 191 on Propagation of the Faith)" and a new paragraph beginning "At present, the Church has a membership…"
- **Suggested fix:** Insert a blank line between "…on Propagation of the Faith)" and "At present, the Church has a membership…" to restore the paragraph break.
