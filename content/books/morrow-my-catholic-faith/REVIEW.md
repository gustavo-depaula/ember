# My Catholic Faith — review punch list

Status of known follow-ups after the initial import + three rounds of automated/manual cleanup. Reproducibility is no longer the constraint — these are targeted fixes to be done by hand or by per-chapter LLM review.

## Chapters without a header illustration

These chapters render with no image at the top. The source PDF either lacks an illustration here (heading sits at the very top of the page with no room above) or the illustration is rendered as Type3 vector glyphs that `pdfimages` doesn't extract.

| Chapter | Reason |
|---|---|
| `lesson-014` (Revelation and Science) | No raster image on adjacent pages — likely Type3 vector |
| `lesson-048` (The Apostles: First Bishops of the Church) | 1-page lesson; image lives on the previous lesson's divider page |
| `lesson-058` (The Roman Curia) | No raster image on adjacent pages |
| `lesson-066` (Authority of the Church) | 1-page lesson; image lives on the previous lesson's divider page |
| `lesson-137` (Vestments) | 1-page lesson; image lives on the previous lesson's divider page |
| `appendix-prayers` (The Most Important Prayers) | Text-only prayer reference; no illustration in source |

**Recovery option for the vector cases (14, 58):** use `pymupdf`'s `page.get_pixmap(clip=Rect(0, 30, width, heading_y - 4))` at 2× zoom on the lesson's first page. The pipeline already does this as a fallback (`scripts/import-my-catholic-faith.py` → `extract_image`), but for these specific pages the heading sits near the top so the clip region is empty. A different region (e.g. middle of the page) might catch the vector illustration. Manual crop is also acceptable.

## OCR-baked typos already corrected

All of these were edited by hand. Logged here so the per-chapter reviewer doesn't second-guess them, and so the next ingestion of the same source PDF can short-circuit the same fixes.

| Chapter | Original (in PDF) | Corrected to | Context |
|---|---|---|---|
| `lesson-082` | `enjoy Cod.` | `enjoy God.` | torments of hell |
| `lesson-082` | `and ail creatures` | `and all creatures` | God created |
| `lesson-082` | `one think needed for happiness` | `one thing needed for happiness` | pain of loss |
| `lesson-082` | `pains of hell;,` | `pains of hell,` | stray punctuation |
| `lesson-083` | `wipe away every tear from there eyes` | `…their eyes` | Apoc. 21:4 |
| `lesson-084` | `"Do not steel.` | `"Do not steal.` | conscience caption |
| `lesson-096` | `Offers believe in signs and omens` | `Others believe…` | superstition |
| `lesson-107` | `fell info despair` | `fell into despair` | Judas |
| `lesson-110` | `the framing she gave helped` | `the training she gave…` | Queen Blanche |
| `lesson-112` | `whatever he hod taken wrongly` | `whatever he had taken…` | Zacheus |
| `lesson-139` | `Mass is nor instruction` | `Mass is not instruction` | manner of assisting at Mass |
| `lesson-144` | `resolution to at one for them` | `resolution to atone for them` | penance |
| `lesson-080` | `the trumpet shall sound,and` | `…sound, and` | 1 Cor. 15:52 |
| `lesson-024` / `-027` / `-050` | `to he infected` / `would he abandoned` / `may he one` | `to be …` | OCR he/be |
| `lesson-072` | `F. Marion XIII in 1896, after…` | `F. Marion Crawford, …` (sentence tail moved to Pope Leo XIII context) | convert list / Anglican orders |
| `lesson-108` | `(Math 18: 6-7)` | `(Matt. 18: 6-7)` | citation |
| `lesson-120` | `must not be equal the quantity` | `must not be equal to the quantity` | fasting law |
| `lesson-146` | `wasted if in a far country` | `wasted it in a far country` | Prodigal Son |
| `lesson-192` | `# 192. Chruch Symbolism` | `# 192. Church Symbolism` | source typo |
| `appendix-church-year` | `the king of Persia, Chooses, carried` | `…Persia, Chosroes, carried` | Exaltation of the Holy Cross |

Lots of additional automated fixes were applied for compound-word splits (`thereby`, `therein`, `non-Catholic`, `submarine`, `holdeth`, `predella`, `Zaragoza`, etc.) and 30 broken feast headings in `appendix-church-year`. See PR #195 commit history for the full list.

## Open follow-ups (chapter-level LLM review needed)

These are areas where automated heuristics couldn't safely repair the content, but a model reading for understanding probably can:

1. **`appendix-prayers`** — the Latin hymns (Tantum Ergo Sacramentum, Pange Lingua, Psalm 116 Latin) have OCR syllable-splits like `Sacrament um`, `anti qu um`, `ju bil a tio`, `Proc eden ti`, `Lau date`, `Qu on iam`, `confirm at a`, `Spirit ui`, `sae cul or um`. Some were partially fixed by the import pipeline's `SPLIT_FIXES` table, but Latin lyrics aren't in the English `wordfreq` dictionary so most survived. Manual reflow against a known Latin text is the cleanest fix.
2. **`lesson-014` "Other scientists" list** — short proper names like `Sem mel we is`, `End li cher`, `Leverrie r`, `Mende l`, `He is`, `Pashcal` were OCR-split. Some were fixed; verify the remaining names against historical lists of Catholic scientists.
3. **`lesson-072` convert list** — the names were aggressively re-joined, but some may have been incorrectly joined or still be slightly wrong (e.g. obscure converts whose names match a common-English fragment).
4. **Hyphenated compounds in the source** — `luke-warmness`, `self-existing`, `all-encompassing`, `co-eternal`, `fellow-man` were preserved as-is. These ARE the correct printed form in the 1949 catechism; whether to modernize (`lukewarmness`, `self-existing`, `all-encompassing`, `coeternal`, `fellow man`) is an editorial call.
5. **Italic Latin/Greek words inline** — `*credo*`, `*venialis*`, `*caput*`, `*spiritus*`, `*papa*`, `*Theos*`, `*episcopos*`, `*Corpus Christi*`, etc. were re-inlined as italic spans. Spot-check that none were misplaced.
6. **Lesson 157 sickbed diagram** — the legend has items 1, 3, 4, 5, 6, 7, 8 but item 2 is "candle" inferred from the body text ("two lighted candles"). Verify against the printed source if possible.
7. **Punctuation around block quotes** — some Scripture citations end with an extra period or missing closing quotation mark from the PDF source. Sweep `(Matt. X: Y)` patterns for consistency.
8. **Subtle proper-noun mis-spellings** — `Caananites` was corrected to `Canaanites`, but similar OCR artifacts may persist (e.g. `Pashcal` → `Pascal`, already fixed). Run a spell-check against a Catholic vocabulary list.

## Prompt for chapter-level LLM review

Paste this prompt with one chapter's markdown to get an actionable review:

```
You are reviewing one chapter of a PDF-extracted Catholic catechism ("My
Catholic Faith" by Bp. Louis LaRavoire Morrow, 1949 / 2021 revision).
Multiple rounds of automated and manual cleanup have already been done;
the goal of this pass is to catch what semantic understanding (not
pattern matching) can reveal.

Read the chapter end-to-end as a thoughtful copy editor. Flag any of:

1. Sentences that don't parse, where words seem missing, swapped, or
   substituted (OCR artifacts: 'he' for 'be', 'info' for 'into',
   'framing' for 'training', 'there' for 'their', 'nor' for 'not', etc.)
2. Sentences that read as if part of them belongs somewhere else (a
   column-merge ghost — content from a parallel column ended up mid-
   sentence here).
3. Proper names that look slightly wrong: missing letter, extra space,
   wrong spelling for a known saint / pope / scientist / place. Verify
   against your knowledge of Church history.
4. Scripture citations malformed: wrong book abbreviation, impossible
   verse range, missing parenthesis. Check the citation against your
   knowledge of the quoted passage.
5. Numbered-point sequences that skip (1, 3 with 2 missing) or repeat.
6. Section headings that don't match their content, or content that
   would benefit from a section break the extraction missed.
7. Latin or Greek words that are mis-rendered or have stray spaces
   (compare against the canonical hymn / Vulgate text in your training
   data: Tantum Ergo, Pange Lingua, Salve Regina, Pater Noster, etc.).
8. Anachronisms — content that contradicts itself or contradicts the
   1949 vintage (the original was published before Vatican II; the 2021
   revision adds a few modern notes but most content reflects pre-conciliar
   practice).

Output format:
- For each issue: file:line — short description, then the exact snippet,
  then the proposed correction (or 'needs human eyes' if you're not sure).
- If the chapter is clean, say so explicitly.

DO NOT modernize prose for style. DO NOT rewrite paragraphs that are
merely old-fashioned. ONLY flag genuine errors / extraction artifacts.
Keep the 1949 voice intact.
```
