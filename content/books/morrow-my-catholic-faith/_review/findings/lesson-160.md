# lesson-160 — findings

PDF pages: 340–341

## Issues

### Image caption absorbed into item 3 body as blockquote
- **Type:** structural drift
- **Line:** 24
- **Markdown says:** `> As an introduction to Holy Orders, a candidate receives the tonsure. The minor orders follow: porter, lector, exorcist, and acolyte. Then come the major orders: subdeacon, deacon, and priest. Finally, at his consecration, a bishop receives the fullness of the priesthood.` (rendered as a blockquote inside numbered item 3 of the "What are the major orders?" answer)
- **PDF says:** This sentence is an italicised image caption below the second illustration on p. 333 (the ordination-ranks diagram). It is not body text under item 3; it stands alone as a figure caption, visually separated from the numbered list.
- **Suggested fix:** Remove the blockquote from inside item 3 and place it as a standalone italic caption line immediately after the image reference, e.g. `*As an introduction to Holy Orders, a candidate receives the tonsure. The minor orders follow: porter, lector, exorcist, and acolyte. Then come the major orders: subdeacon, deacon, and priest. Finally, at his consecration, a bishop receives the fullness of the priesthood.*`
