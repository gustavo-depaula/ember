# Per-chapter PDF verification — roll-up

195 chapters reviewed against `/Users/gustavo/Downloads/my-catholic-faith.pdf` (Sonnet sub-agents, one per chapter, report-only mode). Each `lesson-NNN.md` / `appendix-*.md` in this directory holds the per-chapter findings.

## Tallies

- **Clean:** 73 chapters (no issues found)
- **Flagged:** 122 chapters
- **Total issues raised:** 195

## Issue mix

| Type | Count |
|---|---|
| drift | 34 |
| ocr | 30 |
| structural | 26 |
| column-merge | 11 |
| citation | 5 |
| proper-name | 3 |
| image-ref | 2 |
| illustration | 1 |
| heading | 1 |

Most common failure modes:
1. **Structural drift / column-merge** (~37 issues combined) — the dominant pattern. The catechism answer paragraph is repeatedly merged with the first numbered sub-point, and numbered/lettered lists are often flattened into single run-on paragraphs.
2. **OCR punctuation noise** — opening double-quotes rendered as `''`, stray spaces before periods/commas, period/comma swaps, missing terminal periods after Scripture citations.
3. **Word-level drift** — small word drops (`at disadvantage` → `at a disadvantage`, missing articles), single-word substitutions, occasional silent "corrections" that changed the printed text.

## Top chapters by issue count

| Chapter | # Issues |
|---|---|
| `appendix-prayers` | 6 |
| `lesson-140` (Holy Mass — long chapter) | 5 |
| `lesson-097` | 5 |
| `lesson-071` | 5 |
| `lesson-093` | 4 |
| `lesson-083` | 4 |
| `lesson-014` | 4 |
| `lesson-191` | 3 |
| `lesson-170` | 3 |
| `lesson-098` | 3 |
| `lesson-077` | 3 |
| `lesson-030` | 3 |
| `lesson-029` | 3 |
| `lesson-028` | 3 |

`appendix-prayers` and `lesson-140` are the long-form chapters and predictably accumulated the most paragraph-merge / column-merge artifacts. `lesson-014` is one of the chapters REVIEW.md already flagged as having OCR-split scientist names.

## Cross-check against REVIEW.md predictions

Items REVIEW.md anticipated, confirmed by this pass:
- `lesson-014` "Other scientists" list — still has space-before-comma artifacts on every bold name (24 lines) and likely needs hand-pass.
- `appendix-prayers` — the prayer-list section structure is mangled (Angelus / Regina Coeli / Divine Praises / Rosary mysteries all flattened to single paragraphs). Latin syllable splits in the hymns were NOT found (those were cleaned up successfully).
- `lesson-072` convert list — `John Swinnerton` flagged as possibly wrong (vs. `Frank Swinnerton`); needs human eyes.

Items REVIEW.md predicted but the pass did NOT see:
- Latin syllable splits in `Tantum Ergo`, `Pange Lingua`, `Psalm 116 Latin` (Tantum Ergo had a different defect: subtitle/incipit duplication, not syllable splits).

New patterns this pass surfaced that REVIEW.md did not list:
- **Systematic paragraph-merge bug** between catechism answers and their first numbered sub-point. Roughly two dozen chapters exhibit this; it looks like a general extraction issue, not a one-off.
- **Missing second illustrations** on chapters that have two figures (`lesson-006`, `lesson-131`, `lesson-132`, `lesson-138`, `lesson-193`) — only the top-of-page image was extracted.
- **OCR `''` → `"`** opening double-quote artifact survived in several blockquotes (e.g. `lesson-076`, `lesson-098`, `lesson-140`, `lesson-174`, `lesson-175`, `lesson-183`).

## How to use this directory

Each finding entry includes the markdown line number, the exact MD snippet, the corresponding PDF snippet, and a suggested fix. They were written by AI but mark themselves as "needs human eyes" where uncertain. Apply by hand or via Edit; nothing in `en-US/` was modified by this pass.

To replay a single chapter (e.g. if you want a second opinion): re-run the same prompt template against the chapter's page range from `_review/page-map.json`. The Sonnet pass cost about 21k tokens / chapter.

## Operational notes (for future runs)

- **Report-only worked once tightened.** One agent in the pilot did `Edit` the markdown despite instructions; reverted, and after adding an emphatic "STRICT REPORT-ONLY — NO EXCEPTIONS, violation = critical failure" block, no further unauthorized edits occurred across the remaining 190 chapters.
- **Path drift.** A subset of Sonnet agents wrote to `_review/findings/<file>.md` resolved at the project root or under `en-US/_review/`, instead of the intended `content/books/morrow-my-catholic-faith/_review/findings/`. All were moved to the correct location after the run. For next time: always pass the full absolute target path in the prompt, never a relative form.
- **Big-batch (20+) parallel dispatch worked**, but the path-drift bug was correlated with the highly-compressed prompt template used in the 75-chapter pool. Keep the absolute output path explicit even when compressing.
