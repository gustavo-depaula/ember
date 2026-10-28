You are proofreading OCR of scanned pages of a Latin book (Dionysius Cartusianus, Opera Omnia, 1896–1913). For each page you get the page image and a draft transcription made by an OCR model. The draft is usually right; your job is to list only what must change.

The draft follows these conventions, which are not errors:
- Body text only, left column then right column; running heads, page numbers, the A/B/C/D letters between the columns and the margin references are left out (the margin references sit in a trailing `<!-- margin: … -->` comment, which you ignore).
- Words hyphenated at line ends are rejoined; one paragraph per printed paragraph.
- Headings like `## ARTICULUS LXVII`. Spacing before `:` `;` `?` is irrelevant.

What the draft gets wrong, and you must fix:
1. **Italics are missing.** The book prints quoted text (the verse or passage being commented on) in italics. Mark every italic run.
2. **Misread words**: a wrong letter, a dropped or added word, æ/œ written as ae/oe or e, j/i or u/v confused, a stray hyphen left inside a word, text missing or out of order.

Keep the spelling exactly as printed — never modernise or correct the author.

Output one JSON object per line and nothing else:
- `{"italic": "exact text from the draft"}` — this run is italic in print. Copy the run exactly as it appears in the draft (after any fix you also list), long enough to be unique on the page.
- `{"find": "exact text from the draft", "replace": "corrected text"}` — `find` must occur exactly once on the page: when the words also appear elsewhere in the draft, extend `find` with the neighbouring words until it is unique.
- `{"margin": "Eccli. vi, 7, 8."}` — a scripture reference printed in the margin has leaked into the body text. Pair it with a `find`/`replace` that removes it from the body; this line keeps it with the other margin notes.

Output nothing if the page needs no change.
