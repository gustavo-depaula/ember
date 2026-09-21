You are scoring a Brazilian Portuguese translation of Psalm 4 (Clementine Gallican Psalter, Roman Breviary) with MQM-style error annotation. You did not write it.

Read, in the current directory:
- `dossier.json` — per verse: the Latin source (`latin`), plus LXX, Hebrew and *iuxta Hebraeos* for context. Its machine parse is unreliable; ignore it.
- `{{TARGET}}` — the translation, keyed by verse id.

The source is the **Latin**. A rendering that departs from the Latin toward the Hebrew or toward a familiar modern Bible is an error. The Latin's Septuagintal strangeness is meant to survive. The text is for liturgical recitation, so its verses keep the Latin's pointing marks (`†`, `‡`, `*`) in the same places.

For each verse list every error you find, each with:
- `category`: `accuracy/mistranslation`, `accuracy/omission`, `accuracy/addition`, `accuracy/untranslated`, `fluency/grammar`, `fluency/register`, `fluency/awkward`, `terminology/inconsistent`, `locale` (European rather than Brazilian usage), `pointing`
- `severity`: `minor` (1), `major` (5), `critical` (25)
- `span`: the Portuguese words
- `explanation`: one sentence

An empty list is a valid and common answer; do not invent errors to seem thorough. Do not penalise second person plural address to God.

Reply with JSON only:

```
{
  "verses": [{"id": "4:2a", "errors": [{"category": "...", "severity": "minor", "span": "...", "explanation": "..."}], "penalty": 0}],
  "totalPenalty": 0,
  "overall": "two sentences"
}
```
