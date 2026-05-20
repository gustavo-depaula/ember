# lesson-167 — findings
PDF pages: 354–355

## Issues

### Item 9 run-on with spiritual-affinity blockquote

Type: structural drift
Line: 49
Markdown says: `> This is no longer an impediment. Nevertheless on the account of tradition rooted in serious reasons, the parentage even spiritual must remain above carnal concupiscence. 9. Legal relationship. In the case of adoption, the impediment is always diriment in the direct line and in the collateral line up to second degree, for example; between brother and adopted sister. 10. Other impediments…`
PDF says: "This is no longer an impediment…carnal concupiscence." ends the blockquote for item 8. Then "9. *Legal relationship.*" opens a new numbered paragraph. Likewise "10. *Other impediments.*" is its own paragraph.
Suggested fix: Close the blockquote after "concupiscence." Then write item 9 and item 10 as separate plain paragraphs (not inside the blockquote), matching the PDF's numbered-paragraph structure.

### Image caption — figure label format

Type: image-ref
Line: 5
Markdown says: `(Fig 1)` … `(Fig. 2)`
PDF says: `FIG: 1` … `FIG: 2` (both labels printed in bold caps with colon, no period)
Suggested fix: Standardise to `(FIG: 1)` and `(FIG: 2)` to match the printed figure labels. Also note the PDF caption spells "colateral" (OCR artifact) — the MD's "collateral" is the correct and preferred form; no change needed there.
