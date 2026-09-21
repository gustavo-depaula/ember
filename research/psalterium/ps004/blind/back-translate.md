Translate the Portuguese text in `{{TARGET}}` (the only file you may read — do not look at any other file or directory) into Latin, verse by verse.

This is a back-translation used to test the Portuguese, so the rules are unusual:
- Translate **what the Portuguese words say**, as literally as Latin grammar allows, keeping the word order where you can.
- You will probably recognise the text. **Do not reproduce any Latin version you remember.** Where the Portuguese says something slightly different from the version you know, your Latin must show the difference — that difference is the whole point.
- Keep the marks `†`, `‡`, `*` where they stand.
- Where a Portuguese word is ambiguous, pick the most natural reading and list the ambiguity.

Reply with JSON only:

```
{
  "verses": {"4:2a": "..."},
  "ambiguities": [{"id": "4:2a", "portuguese": "...", "readings": ["...", "..."]}]
}
```
