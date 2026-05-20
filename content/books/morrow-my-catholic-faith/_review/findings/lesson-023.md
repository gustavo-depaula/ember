# lesson-023 — findings

PDF pages: 54–55

## Issues

### "venialis" split into two words with italic artifact
- **Type:** ocr
- **Line:** 20
- **Markdown says:** `the Latin *venial is*`
- **PDF says:** `the Latin venialis`
- **Suggested fix:** `the Latin *venialis*`

### Numbered point 1 and sub-point "a." merged into one paragraph
- **Type:** drift
- **Line:** 10
- **Markdown says:** `— Venial sin is a less serious offence against the law of God, which does not deprive the soul of sanctifying grace, and which can be pardoned even without sacramental confession. 1. A sin can be venial in two ways: a. When the evil done is not seriously wrong. If we sin against God in matters of slight importance, we commit venial sin.`
- **PDF says:** The answer sentence ends after "sacramental confession." Then "1. A sin can be venial in two ways:" is a standalone paragraph. Then "a. When the evil done is not seriously wrong. If we sin against God in matters of slight importance, we commit venial sin." is a separate paragraph. All three are structurally distinct in the PDF.
- **Suggested fix:** Split into three separate paragraphs: (1) the Q&A answer, (2) `1. A sin can be venial in two ways:`, (3) `a. When the evil done is not seriously wrong...`
