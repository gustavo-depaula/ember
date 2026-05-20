# lesson-012 — findings

PDF pages: 32–33

## Issues

### Opening Athanasian Creed caption placed after heading instead of before
- **Type:** drift
- **Line:** 3–5
- **Markdown says:** `# 12. Unity of the Blessed Trinity` → image ref (line 3) → Athanasian Creed block quote (line 5)
- **PDF says:** On p. 24 the italic Athanasian Creed caption ("And the Catholic Faith is this, that we worship one God in Trinity…") appears as an image caption ABOVE the printed chapter heading "12. UNITY OF THE BLESSED TRINITY". The heading comes after the caption, not before it.
- **Suggested fix:** Reorder so the image ref and its caption precede the `# 12.` heading — i.e. image → italic caption paragraph → heading. Alternatively, if the heading must lead (as is convention for the series), flag for human decision.
