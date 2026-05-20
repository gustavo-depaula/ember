# lesson-150 — findings

PDF pages: 320–321

## Issues

### Image captions rendered as body paragraphs
- **Type:** image-ref / structural drift
- **Line:** 5–7
- **Markdown says:** Two numbered paragraphs appear as regular body text immediately after the image tag: "1. Before confessing to the priest…" and "2. In Confession, we tell our sins…"
- **PDF says:** These two texts are italic captions printed beneath the two side-by-side illustrations ("EXAMINATION OF CONSCIENCE" and "SACRAMENTAL CONFESSION"). They belong to the illustration block, not to the running body text.
- **Suggested fix:** Mark them as figure captions (e.g. italicise and label them under the `![](../images/lesson-150.webp)` line, or add a second image tag for the right panel with its own caption), so they are clearly distinguished from the numbered body paragraphs that follow.
