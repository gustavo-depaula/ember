# lesson-002 — findings

PDF pages: 12–13

## Issues

### Answer paragraph merged with point 1
- **Type:** drift
- **Line:** 31
- **Markdown says:** `— The Apostles' Creed may be divided into twelve articles. 1. All the articles are absolutely necessary to faith: if even one article is omitted or changed, faith would be destroyed.`
- **PDF says:** The catechism answer `— The Apostles Creed may be divided into twelve articles.` ends as its own unit; then `1. All the articles are absolutely necessary to faith:…` begins as a separate indented paragraph.
- **Suggested fix:** Split into two paragraphs: `— The Apostles' Creed may be divided into twelve articles.` followed by a blank line, then `1. All the articles are absolutely necessary to faith: if even one article is omitted or changed, faith would be destroyed.`

### Twelve articles collapsed into one run-on sentence
- **Type:** drift
- **Line:** 35
- **Markdown says:** `2. The following are the articles: (1) I believe in God… (2) And in… … (12) And life everlasting. Amen.` (all on one line)
- **PDF says:** Each article is a separate indented paragraph — `2. The following are the articles:` followed by twelve individually set-off items, each on its own line.
- **Suggested fix:** Render each article as a separate line/paragraph matching the PDF layout. The internal punctuation (semicolons vs. periods per item) should also be verified against the PDF during reformatting: items (4) and (7) end with a period; items (5), (6), (8), (9), (10), (11) end with a semicolon; item (12) ends with `Amen.`
