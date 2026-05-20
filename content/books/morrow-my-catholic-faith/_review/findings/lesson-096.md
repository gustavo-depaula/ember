# lesson-096 — findings

PDF pages: 202–203

## Issues

### Sacrilege answer: structural drift — answer body and commentary merged into one paragraph
- **Type:** structural drift
- **Line:** 38
- **Markdown says:** "— A person sins by sacrilege when he mistreats sacred persons, places, or things. Sacrilege is a kind of blasphemy consisting of the violation or profanation of a person, place, or thing consecrated to God. For example, it is sacrilege incurring excommunication to lay violent hands upon a priest, a nun, or any other person consecrated to God. It is sacrilege to commit acts of impurity or of violence, like killing or fighting, in a church or consecrated graveyard to receive the sacraments unworthily, to steal sacred vessels or other Church property, to do damage in a church, to despise relics and holy pictures, mutilate images, etc."
- **PDF says:** The Q&A answer ends after "sacred persons, places, or things." The next block begins as a bold-italic paragraph: "**_Sacrilege_** is a kind of blasphemy consisting of…" (indented commentary block, not part of the direct answer)
- **Suggested fix:** Split at "Sacrilege is a kind of blasphemy…" — the answer proper is only "— A person sins by sacrilege when he mistreats sacred persons, places, or things." The remainder ("Sacrilege is a kind of blasphemy…") should open a new `>` blockquote paragraph.
