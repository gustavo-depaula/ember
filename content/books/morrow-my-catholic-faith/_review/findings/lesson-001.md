# lesson-001 — findings

PDF pages: 10–11

## Issues

### "1. Believe" merged into preceding sentence instead of its own paragraph
- **Type:** drift
- **Line:** 31
- **Markdown says:** `"In order to practice this virtue, we must: 1. Believe all the truths revealed by God."`
- **PDF says:** "In order to practice this virtue, we must:" ends the sentence, then "1. *Believe* all the truths revealed by God." appears as a separate bold-italic numbered line on its own.
- **Suggested fix:** Split into two paragraphs: `"In order to practice this virtue, we must:"` / `"1. **_Believe_** all the truths revealed by God."`

### "1. Believe" and "2. Carry out" missing bold-italic emphasis
- **Type:** drift
- **Line:** 31, 35
- **Markdown says:** `"1. Believe all the truths revealed by God."` / `"2. Carry out in our lives…"`
- **PDF says:** "1. *Believe* all the truths revealed by God." / "2. *Carry out* in our lives…" (both keywords are bold-italic in the PDF)
- **Suggested fix:** `"1. ***Believe*** all the truths revealed by God."` / `"2. ***Carry out*** in our lives…"`
