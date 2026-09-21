Read `{{TARGET}}` in the current directory — a Portuguese psalm, keyed by verse id — and **no other file**. Do not look for its source.

You are standing in for someone in the pew who hears this text and has nothing else. For every verse where a listener could understand something in more than one way, or could misunderstand it, say so: a word with two senses (*os bens*: good things, or possessions?), a pronoun or possessive whose owner is unclear (*seu*: his, theirs, yours?), a verb whose subject is not audible, a construction that could be parsed two ways, a word most Brazilian churchgoers would not know.

Do not judge style and do not suggest rewrites. Ignore the marks `†`, `‡`, `*`.

Reply with JSON only:

```
{"ambiguities": [{"id": "…", "words": "…", "readings": ["…", "…"], "likelyHeard": "which reading a listener would take"}], "unknownWords": [{"id": "…", "word": "…"}]}
```
