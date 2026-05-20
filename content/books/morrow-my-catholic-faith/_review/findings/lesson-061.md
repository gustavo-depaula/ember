# lesson-061 — findings

PDF pages: 130–131

## Issues

### Paragraph merge in "What does Tradition and Scripture teach us?" answer
- **Type:** structural drift
- **Line:** 60
- **Markdown says:** "...are united among themselves. Holy Scripture and the Tradition of the Church teach us that only in extraordinary cases did the Apostles and their successors meet together in Councils, and act as a collegiate body under the authority of Peter or of the Roman Pontiffs. The Apostles, in fact, fulfilled their mission personally and transmitted their power to their successors as they themselves had received it from Our Lord. The Holy Council of Trent, basing itself on these sacred traditions, confirms that the Roman Pontiff alone possesses..."
- **PDF says:** Three separate paragraphs: (1) "According to the Gospel, St. Peter and the other Apostles founded a College...are united among themselves." (2) "Holy Scripture and the Tradition of the Church teach us...received it from Our Lord." (3) "The *Holy Council of Trent*, basing itself on these sacred traditions, confirms that..."
- **Suggested fix:** Split line 60 into three paragraphs at "Holy Scripture and the Tradition..." and again at "The Holy Council of Trent..."

### Missing bold-italic emphasis on "Holy Council of Trent"
- **Type:** structural drift
- **Line:** 60
- **Markdown says:** "The Holy Council of Trent, basing itself on these sacred traditions..."
- **PDF says:** "The ***Holy Council of Trent***, basing itself on these sacred traditions..." (rendered in bold italic in the PDF)
- **Suggested fix:** "The ***Holy Council of Trent***, basing itself on these sacred traditions..."
