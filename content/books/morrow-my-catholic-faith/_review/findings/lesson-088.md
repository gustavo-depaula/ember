# lesson-088 — findings

PDF pages: 186–187

## Issues

### Luke 6:29 quote rendered as body paragraph instead of blockquote
- **Type:** structural drift
- **Line:** 29
- **Markdown says:** `"And to him that strikes thee on the one cheek, offer the other also" (Luke 6:29). 2. We should return good for evil, avenging ourselves in God's way, by doing good to those that hate us.`
- **PDF says:** The Luke 6:29 quote appears as an indented sub-paragraph (same indent level as the Samaritan village paragraph above it), belonging to point 1's discussion block. Point 2 then begins as a new numbered item. In the markdown the quote is merged into the same line as the start of point 2 with no blockquote formatting.
- **Suggested fix:** Split into two elements: (1) a `>` blockquote for the Luke 6:29 sentence, then (2) a new plain paragraph beginning `2. We should return good for evil…`
