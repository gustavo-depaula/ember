# lesson-097 — findings

PDF pages: 204–205

## Issues

### OCR artifact: "rig our" in caption
- **Type:** ocr
- **Line:** 5
- **Markdown says:** "because of the rig our of them that are over the works"
- **PDF says:** "because of the rigour of them that are over the works"
- **Suggested fix:** "because of the rigour of them that are over the works"

### OCR artifact: wrong opening quotation mark
- **Type:** ocr
- **Line:** 27
- **Markdown says:** `''Seek first the kingdom of God`
- **PDF says:** `"Seek first the kingdom of God`
- **Suggested fix:** Replace `''` with `"`

### OCR artifact: comma before ellipsis in Matt. 13 quote
- **Type:** ocr
- **Line:** 61
- **Markdown says:** "will gather out of his kingdom all scandals ,.. and cast them"
- **PDF says:** "will gather out of his kingdom all scandals ... and cast them"
- **Suggested fix:** Replace `,..` with `...`

### Citation mismatch: John 11:15 vs. John 14:15
- **Type:** citation
- **Line:** 47
- **Markdown says:** `(John 11: 15)`
- **PDF says:** `(John 11: 15)`
- **Note:** Both MD and PDF agree, but the correct Scriptural reference for "If you love Me, keep My commandments" is John 14:15, not John 11:15. This appears to be a misprint in the original 1949 edition reproduced in both. Flag for human review.
- **Suggested fix:** needs human eyes

### Citation mismatch: Rom. 9:24 vs. Rom. 7:24
- **Type:** citation
- **Line:** 49
- **Markdown says:** `(Rom. 9: 24)`
- **PDF says:** `(Rom. 9: 24)`
- **Note:** Both MD and PDF agree, but "Who shall deliver me from the body of this death?" is Romans 7:24, not 9:24. Likely a misprint in the original edition reproduced in both. Flag for human review.
- **Suggested fix:** needs human eyes
