# lesson-147 — findings
PDF pages: 314–315

## Issues

### Honey-story blockquote merged into one paragraph

Type: structural drift / column-merge
Line: 52
Markdown says: Single blockquote paragraph containing all four sentences of the honey story (the three boys' statements + the summary), run together with no breaks.
PDF says (p. 307, right col.): Four separate indented paragraphs — one for the setup ("A mother sent…"), then one each for the first child's words, the second child's words, the third child's words, and finally the summary sentence ("The first two boys had attrition…").
Suggested fix: Split the single blockquote into four separate `>` paragraphs matching the PDF paragraph breaks:

```
> A mother sent her three young sons to take a big jar of honey to their grandmother. On the way the boys stopped to play. They stumbled over the jar, breaking it and spilling the honey. They all began to weep.

> The first said, "Mother will surely spank us!" The second cried, "She ...will be so displeased she will give us no cookies!" And the third wept, "Mother will surely be sad!"

> The first two boys had attrition: one had the fear of punishment, and the second had sorrow at the loss of reward. The third child had perfect contrition, for he thought only of the sadness and offence he caused to one he loved.
```

(The PDF has the three children's quotes in a single paragraph and the summary as a separate paragraph — adjust accordingly to match the exact PDF breaks.)
