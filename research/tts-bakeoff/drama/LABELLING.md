# Labelling who speaks

How to write `drama/<book>/<edition>/attribution/<NN>.json` for a multi-voice reading. Careful reading, not coding.

## Input

`drama/<book>/<edition>/verses.json` is `{chapter: {verse: text}}`. Never alter it. The Douay-Rheims has no quotation marks: speech is introduced by a colon ("And he said to them: Follow me") and sometimes resumes after an interjection ("..., saith he, ...").

## Output

One file per chapter, two-digit name (`01.json`):

```
{"pericopes": [1, 18, 26],
 "cast": {"<speakerId>": {"name": "...", "kind": "narrator|individual|group|spirit|divine|angel", "gender": "male|female|mixed", "age": "child|young|adult|old", "note": "one line: who they are and their manner here"}},
 "verses": {"1": [{"s": "<speakerId>", "t": "<verbatim text>"}, ...]}}
```

- `pericopes`: the verse numbers where a new scene or unit begins in this chapter (always including the first verse). Use the customary divisions: each miracle, parable, discourse section, change of place. A listener hears a longer silence before each. Aim for the granularity of the section headings in a study Bible, not one per paragraph.
- Every verse of the chapter must be present. The `t` values of a verse joined with single spaces must reproduce the verse text EXACTLY. Split only at spaces.

## Who gets what

- `narrator` reads all narration, including the words that introduce speech ("And he said to them:", "saying:", "saith he,"), glosses ("which is, being interpreted, ...") and anything written, not spoken (an inscription).
- Spoken words go to whoever speaks them. Speech continuing across verses gets spans in each verse.
- Nested quotation stays with the outer speaker: Jesus telling a parable or quoting Scripture is all `jesus`, including what characters inside the parable say. The narrator quoting Scripture stays `narrator`. A letter read out in the narrative (Acts 15, Acts 23) goes to its writer.
- Indirect speech ("he told them that ...") is narration.
- Canticles and prayers belong to their speaker (the Magnificat is `mary`, the Benedictus `zachary`).
- A group speaking together gets a group id.
- If a decision is genuinely uncertain, make your best call and add `"q": "short reason"` to that span.

## Speaker ids

Kebab-case. Use these whenever they apply, so one person keeps one voice across every book:

`narrator`, `jesus`, `god-the-father` (the voice from heaven), `the-lord` (God speaking in the Old Testament, or the risen Lord's voice to Saul and Ananias is still `jesus`), `angel-gabriel`, `angel` (any other angel, including those at the tomb), `satan` (the devil), `unclean-spirit`, `legion`, `mary` (the mother of Jesus), `joseph`, `elizabeth`, `zachary`, `simeon`, `anna`, `shepherds`, `magi`, `john-the-baptist`, `peter`, `andrew`, `james`, `john`, `james-and-john`, `philip`, `thomas`, `nathanael`, `judas` (Iscariot), `disciples`, `a-disciple`, `pharisees`, `a-pharisee`, `scribes`, `lawyer`, `sadducees`, `chief-priests`, `high-priest`, `council-members`, `herod`, `pilate`, `centurion`, `soldiers`, `crowd`, `bystanders`, `martha`, `mary-of-bethany`, `mary-magdalene`, `nicodemus`, `samaritan-woman`, `zacheus`, `good-thief`, `bad-thief`, `cleophas`, `servant-girl`, `paul` (also as Saul), `stephen`, `barnabas`, `james-of-jerusalem`, `ananias-of-damascus`, `cornelius`, `gamaliel`, `festus`, `agrippa`, `felix`.

For anyone else invent a descriptive id (`leper`, `rich-man`, `jairus`, `man-born-blind`, `lydia`, `town-clerk`). Every id used in a chapter must have an entry in that chapter's `cast`, with gender, age and kind filled in honestly: the voice is chosen from them.

## Checking

From the `tts-bakeoff` directory: `BOOK=<book> python3 drama/check_attribution.py <chapters...>` until it prints OK. It only proves the text is intact. Who speaks, and where the pericopes fall, is on you: reread each chapter's speech boundaries after it passes.

Writing exact spans by hand is error-prone. A reliable method: record, per verse, only the split points and speakers, and have a small script slice the original verse text. Keep helper scripts outside the repo (`/tmp`).
