# lesson-170 — findings
PDF pages: 360–361

## Issues

### Structural drift — Q1 answer and point 1 merged into one paragraph

Type: structural drift
Line: 10
Markdown says: `— A couple who have decided to get married should separately appear, with baptismal certificate, before the parish priest of the bride, for the canonical examination. 1. This should be done about a month before the projected marriage…`
PDF says: The catechism answer ends at "…for the canonical examination." as its own sentence/paragraph; then "1. This should be done about a month before…" opens as a separate indented paragraph.
Suggested fix: Split at the period after "examination." — end the answer there and begin a new paragraph starting `1. This should be done about a month…`

### Structural drift — Q2 (banns) answer and point 1 merged into one paragraph

Type: structural drift
Line: 21
Markdown says: `— The banns of matrimony are a public proclamation of an intended marriage, made at the principal Mass on three successive Sundays or festival days, in the church or churches to which the bride and groom belong. 1. The purpose of the banns is to discover impediments…`
PDF says: The catechism answer ends at "…to which the bride and groom belong." as its own paragraph (split across pages 352–353); then "1. The purpose of the banns is to discover impediments…" is a separate indented paragraph on p. 353.
Suggested fix: Split after "…belong." and start a new paragraph with `1. The purpose of the banns…`

### Structural drift — full-page caption placed inside Q2 blockquote instead of between Q2 and Q3

Type: structural drift
Line: 23
Markdown says: The "Christian marriage is a holy union…" passage is rendered as a blockquote nested within the banns answer section (between point 1's blockquote and point 2).
PDF says: This italic passage appears as a standalone full-width caption block beneath the large family illustration at the top of p. 353, physically between the banns question section and the "What does the marriage ceremony include?" question — it is not a sub-item of the banns answer.
Suggested fix: Move the blockquote (lines 23–24) to its own paragraph between the banns section and the `**What does the marriage ceremony include?**` heading, with a blank line on each side.
