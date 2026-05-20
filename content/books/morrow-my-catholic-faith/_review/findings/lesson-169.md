# lesson-169 — findings
PDF pages: 358–359

## Issues

### Column-merge — three-paragraph story collapsed into one blockquote paragraph

Type: column-merge
Line: 31
Markdown says: The entire story about the accomplished young lady is rendered as a single `>` blockquote paragraph running from "An accomplished young lady was engaged…" through "…an agony and a danger for her."
PDF says: The story is printed as three separate indented paragraphs:
  1. "An accomplished young lady was engaged to marry a prominent young man. The day before the wedding, a party was given at the house of the young lady. The conversation turned towards religion; the young man spoke with open contempt of all beliefs, boasting that he was an 'open-minded' person of the 20th century and free from all 'medieval notions' and 'priest-invented' ceremonials."
  2. "The young lady, shocked beyond measure, gently protested, begging him not to speak in such a manner. But he laughed at her, saying that he meant every word he said and more, and that she would soon enough unlearn her 'religious non-sense'."
  3. "The young lady then said, 'I cannot marry a man who does not respect God and religion, for he surely will not respect his wife.' Thus the engagement was broken, and a worthy young lady freed from a life that would have been an agony and a danger for her."
Suggested fix: Split the single blockquote into three separate `>` blockquote paragraphs, one per PDF paragraph (separated by a blank line between each).
