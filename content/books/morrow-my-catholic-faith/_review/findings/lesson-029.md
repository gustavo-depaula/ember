# lesson-029 — findings

PDF pages: 66–67

## Issues

### "Therefore Jesus Christ is both God and man…" is blockquote but should be main text
- **Type:** drift
- **Line:** 37
- **Markdown says:** `> It was to the Blessed Virgin that the Archangel Gabriel announced: … (Luke 1: 32). Therefore Jesus Christ is both God and man; He has both Divine and human powers; He has knowledge, can will and act as God and as man. For example, with His human nature Jesus worked, ate, spoke, felt pain. But it was His divine nature that enabled Him to become transfigured, walk on the waters, raise the dead.`
- **PDF says:** The Luke 1:32 quote (`"And behold, thou shalt conceive…"`) is italic/indented. The sentence beginning "Therefore Jesus Christ is both God and man…" through "…raise the dead." is regular (non-indented) main-body text — a separate paragraph outside the italic block.
- **Suggested fix:** Close the blockquote after `(Luke 1: 32).` and put the "Therefore…raise the dead." paragraph as regular main text (not `>`).

### Answer line for "What does the name Christ mean?" merged with item 1
- **Type:** drift
- **Line:** 63
- **Markdown says:** `— The name Christ means "The Anointed One". 1. "Christ" is a Greek word, with the same meaning as "Messias". In the Old Law, it was the custom to anoint with oil prophets, high priests, and kings.`
- **PDF says:** The answer `— The name Christ means "The Anointed One".` ends as its own line, then item `1. "Christ" is a Greek word…` begins as a separate paragraph.
- **Suggested fix:** Split at the period after `"The Anointed One".` — insert a blank line before `1. "Christ" is a Greek word…`.

### OCR period instead of comma after "David"
- **Type:** ocr
- **Line:** 73
- **Markdown says:** `David. who was born poor, did great deeds for his people, and became King.`
- **PDF says:** `David, who was born poor, did great deeds for his people, and became King.`
- **Suggested fix:** Change `David.` → `David,`
