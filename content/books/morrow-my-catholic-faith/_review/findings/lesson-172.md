# lesson-172 — findings
PDF pages: 364–365

## Issues

### Dominic Savio resolutions rendered inline instead of as a list

Type: structural drift
Line: 43
Markdown says: `(1) frequent confession and communion; (2) Jesus and Mary as friends; and (3) death rather than sin.` — all inline within the blockquote paragraph
PDF says: three items printed on separate indented lines:
```
(1) frequent confession and communion;
(2) Jesus and Mary as friends; and
(3) death rather than sin.
```
Suggested fix: break the three items onto separate lines within the blockquote (or render as a sub-list) to match the PDF's enumerated layout.
