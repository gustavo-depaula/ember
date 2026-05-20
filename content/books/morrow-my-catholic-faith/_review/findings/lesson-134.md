# lesson-134 — findings
PDF pages: 282–283

## Issues

### Image caption merged as inline body paragraph inside split blockquote

Type: structural drift / column-merge  
Lines: 33–37  
Markdown says: The blockquote beginning "Today, it is more convenient to make a money offering. The money is most certainly not the price of" (line 33–34) is interrupted by a plain paragraph on line 35 ("The hosts consecrated at Mass…"), then the blockquote resumes on line 37 ("the Mass, as the bread and wine were not."). The caption text is rendered as a bare paragraph with no prefix.  
PDF says: The figure caption "The hosts consecrated at Mass, taken by the priest and people, are made of pure unleavened wheat flour mixed with water and baked. They are prepared by chosen persons, usually religious." appears as a printed italic caption below the second image on p. 275, entirely separate from the money-offering blockquote. The blockquote text reads continuously as one unit: "Today, it is more convenient to make a money offering. The money is most certainly not the price of the Mass, as the bread and wine were not."  
Suggested fix: Remove line 35 from the body of the blockquote and attach it to the image reference as a caption (or a separate blockquote following the image marker), then reunite the split blockquote into a single `>` block: "Today, it is more convenient to make a money offering. The money is most certainly not the price of the Mass, as the bread and wine were not."
