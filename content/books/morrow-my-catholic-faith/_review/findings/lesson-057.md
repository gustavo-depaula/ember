# lesson-057 — findings

PDF pages: 122–123

## Issues

### Consistories intro: two PDF paragraphs merged into one
- **Type:** structural drift
- **Line:** 60
- **Markdown says:** "The College of Cardinals is the Senate of the Pope. As principal advisers and helpers, the cardinals assist the Holy Father in the government of the Church. After the Supreme Pontiff, the cardinals have the highest dignity in our Holy Mother Church. Consistories are assemblies of cardinals presided over by the Pope. There are three kinds: …"
- **PDF says:** Two distinct indented paragraphs — first ending "…highest dignity in our Holy Mother Church." then a separate paragraph beginning "Consistories are assemblies of cardinals presided over by the Pope. There are three kinds: …"
- **Suggested fix:** Split line 60 into two paragraphs at the sentence boundary before "Consistories are assemblies…"
