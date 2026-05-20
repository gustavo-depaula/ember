# lesson-190 — findings
PDF pages: 400–401

## Issues

### Column-merge: confraternities list run into one paragraph
Type: column-merge / structural drift
Line: 32
Markdown says: `1. The Confraternity of Christian Doctrine by order of the Holy See, is to be instituted in every parish … 2. The Holy Name Society aims to promote due love and reverence for the Holy Name of God and Jesus. (See page 199.) 3. The Society of the Holy Family is an archconfraternity, aiming to sanctify Christian families. Men, women, and children can all become members.`
PDF says: Three separate numbered paragraphs, each starting on its own line, with distinct bold headings: (1) **Confraternity of Christian Doctrine**, (2) **Holy Name Society**, (3) **Society of the Holy Family**.
Suggested fix: Split line 32 into three separate paragraphs with a blank line between each, matching the PDF's paragraph structure. The bold formatting on each society name should be preserved (matching items 1–4 in the pious societies list below).

### OCR / punctuation: curly braces rendered as parentheses
Type: OCR
Line: 32
Markdown says: `(See page 199.)`
PDF says: `{See page 199.}` (curly braces, not parentheses)
Suggested fix: Change `(See page 199.)` to `{See page 199.}`
