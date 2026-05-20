# lesson-120 — findings
PDF pages: 250–251

## Issues

### Lowercase "then" capitalised in blockquote

Type: OCR
Line: 66
Markdown says: `We should always be temperate rather than eat too much ordinarily. Then fast to excess on special occasions.`
PDF says: `We should always be temperate rather than eat too much ordinarily. then fast to excess on special occasions.`
Suggested fix: Lowercase "then" — the PDF treats this as a continuation clause ("ordinarily, then fast…"), not a new sentence. Change `Then` → `then` and consider joining with a comma: `We should always be temperate rather than eat too much ordinarily. then fast to excess on special occasions.` — or render as a single sentence: `We should always be temperate rather than eat too much ordinarily, then fast to excess on special occasions.`
