# lesson-048 — findings

PDF pages: 105

## Issues

### Short apostle paragraphs merged into one blockquote (left-column items)
- **Type:** column-merge
- **Line:** 20
- **Markdown says:** One single blockquote containing St. James the Less, St. Andrew, St. Thomas, St. Philip, St. Bartholomew, and St. Simon all run together
- **PDF says:** Each apostle entry is a separate small-font paragraph: St. James the Less is its own paragraph, then St. Andrew its own, St. Thomas its own, St. Philip its own, St. Bartholomew its own, St. Simon its own
- **Suggested fix:** Split line 20 into six separate blockquotes, one per apostle entry

### St. Jude and St. Matthias merged into one blockquote
- **Type:** column-merge
- **Line:** 22
- **Markdown says:** One blockquote containing both St. Jude and St. Matthias run together
- **PDF says:** St. Jude is a separate paragraph ("St. Jude preached in Syria, and was martyred in Persia. He wrote the 'Catholic Epistle'.") and St. Matthias is a separate paragraph ("St. Matthias, chosen to take the place of Judas, preached in Ethiopia, and was martyred in Sebastopolis.")
- **Suggested fix:** Split into two separate blockquotes
