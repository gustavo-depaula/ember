# lesson-014 — findings

PDF pages: 36–37

## Issues

### Systematic: space before comma in bold scientist-name entries
- **Type:** drift
- **Line:** 36, 40, 44, 50, 52, 54, 60, 62, 66, 70, 72, 76, 86, 92, 94, 104, 108, 118, 126, 134, 136, 138, 142, 144 (all bold scientist entries with descriptive clauses)
- **Markdown says:** `"Algue , a priest"` / `"Becquerel , Antoine Cesar"` / `"Binet , mathematician"` / `"Caesalpinus , a Papal physician"` / `"Carrell , Nobel prize winner"` / `"Cassiodorus , a priest"` / `"Copernicus , a priest"` / `"De Chauliac , a Papal physician"` / `"De Vico , a priest"` / `"Endlicher , botanist"` / `"Eustachius , for whom"` / `"Fallopius , for whom"` / `"Galilei , a great astronomer"` / `"Galvani , one of"` / `"Gioja , father of"` / `"Kircher , a priest"` / `"Lancisi , a Papal physician"` / `"Malpighi , a Papal physician"` / `"Morgagni , founder"` / `"Picard , a priest"` / `"Regiomontanus , a Bishop"` / `"Scheiner , a priest"` / `"Steensen , a Bishop"` / `"Theodoric , a Bishop"`
- **PDF says:** No space between the bold name and the comma in every case — e.g. `"Algue, a priest"` / `"Becquerel, Antoine Cesar"` / `"Binet, mathematician"` etc.
- **Suggested fix:** Remove the stray space before the comma in every scientist entry, e.g. `"Algue, a priest"`, `"Becquerel, Antoine Cesar"`, etc.

### Pascal — uncorrected OCR proper-name artifact retained in Picard missing period
- **Type:** ocr
- **Line:** 134
- **Markdown says:** `"Picard , a priest, was the first to measure accurately a degree of the meridian"`
- **PDF says:** `"Picard, a priest, was the first to measure accurately a degree of the meridian"` — entry ends without a terminal period in the PDF (apparent OCR/layout dropout at column edge)
- **Suggested fix:** needs human eyes — verify whether the period is present in a higher-quality scan; if not, adding one is a reasonable editorial correction but should be documented.

### Pascal — OCR artifact "Pashcal" correctly fixed (informational, not a defect)
- **Type:** ocr (resolved — documented for audit trail)
- **Line:** 130
- **Markdown says:** `"Pascal demonstrated practically that a column of air has weight."`
- **PDF says:** `"Pashcal demonstrated practically that a column of air has weight."` (OCR artifact; `Pashcal` → `Pascal` is the correct proper name)
- **Suggested fix:** No change needed — fix is correct. Matches REVIEW.md note on lesson-014 OCR artifacts.

### Volta — stray semicolon correctly removed (informational, not a defect)
- **Type:** ocr (resolved — documented for audit trail)
- **Line:** 150
- **Markdown says:** `"Volta invented the first complete galvanic battery; the \"volt\" is named after him."`
- **PDF says:** `"Volta invented the first; complete galvanic battery; the \"volt\" is named after him."` (stray semicolon after "first" is an OCR artifact)
- **Suggested fix:** No change needed — fix is correct.
