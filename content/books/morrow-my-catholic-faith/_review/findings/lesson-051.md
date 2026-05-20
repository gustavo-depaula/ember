# lesson-051 — findings

PDF pages: 110–111

## Issues

### Table column order differs from PDF
- **Type:** structural drift
- **Line:** 8 (table header)
- **Markdown says:** `| Name | Founder | Year | Place of Origin |`
- **PDF says:** columns ordered Place of Origin | Name | Founder | Year (Place of Origin is the leftmost column in the PDF)
- **Suggested fix:** Reorder columns to `| Place of Origin | Name | Founder | Year |` to match PDF layout, or accept current order as a deliberate reformat — needs human eyes

### "fellow men" should be "fellowmen"
- **Type:** drift
- **Line:** 67
- **Markdown says:** `"…hidden souls that burn with the love of God and their fellow men."`
- **PDF says:** "…hidden souls that burn with the love of God and their fellowmen."
- **Suggested fix:** `fellow men` → `fellowmen`
