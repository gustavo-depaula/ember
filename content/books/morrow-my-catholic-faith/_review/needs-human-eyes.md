# Needs human eyes

Items the apply-findings pass skipped because the fix required editorial judgment (citations potentially wrong in the original 1949 edition, accented proper-name verification, table column reorder, etc.). Each row was logged by the per-chapter agent at the time it processed the corresponding findings file.

| Chapter | Line | Type | Issue | Suggested fix |
|---|---|---|---|---|
| lesson-005 | 72 | citation | MD `(Gen. 50: 20)` vs PDF `(Gen. 50: 30)`; verse 50:20 is scripturally correct, so MD may have silently corrected | Decide: keep scripturally-correct `50:20` or restore PDF's `50:30` for source fidelity |
| lesson-006 | 27-28 | illustration | Second illustration (pagan sacrifice scene, PDF p. 21) missing; asset `lesson-006-2.webp` does not exist | Source asset, then insert image ref before the caption blockquote |
| lesson-006 | 28 | structural drift | Caption blockquote is misplaced inside the numbered list (it's actually the second illustration's caption) | Once `lesson-006-2.webp` is added, move blockquote to sit after image ref |
| lesson-012 | 3-5 | structural | Athanasian Creed italic caption appears above chapter heading in PDF but below it in MD | Decide: reorder image+caption above heading per PDF, or keep heading-first series convention |
| lesson-014 | 134 | ocr | Picard entry ends without terminal period in PDF (likely OCR/column dropout); MD currently has a period | Verify against higher-quality scan; document if adding period is editorial |
| lesson-039 | 58 | drift | Citation dash spacing `(Rom. 8: 16-17)` matches PDF but is internally inconsistent with line 50's `(Rom. 8: 15 - 16)` | Decide on one form (spaced vs unspaced dash) and apply chapter-wide |
| lesson-051 | 8 | structural | Table column order differs from PDF — PDF has `Place of Origin | Name | Founder | Year` (PoO leftmost); MD has `Name | Founder | Year | Place of Origin` | Decide whether to reorder to match PDF or keep current arrangement |
| lesson-072 | 38 | proper-name | "John Swinnerton" in converts list — well-known Catholic convert is Frank Swinnerton; both PDF and MD agree on "John" | Verify whether to preserve source-faithful "John" or correct to "Frank" |
| lesson-083 | 63 | structural | Part Two title page rendered as flat heading; PDF p.177 has 3-line display "THE COMMANDMENTS / OF GOD / OF THE CHURCH" | Decide whether book format supports multi-line title page; keep flat or split |
| lesson-097 | 47 | citation | `(John 11: 15)` cited for "If you love Me, keep My commandments" — correct ref is John 14:15; PDF and MD both agree (likely 1949 misprint) | Verify against another edition; if confirmed misprint, change to `(John 14: 15)` |
| lesson-097 | 49 | citation | `(Rom. 9: 24)` cited for "Who shall deliver me from the body of this death?" — correct ref is Rom. 7:24; PDF and MD both agree (likely 1949 misprint) | Verify against another edition; if confirmed misprint, change to `(Rom. 7: 24)` |
| lesson-099 | 5 | proper-name | "Beaupre" likely should be "Beaupré" (Sainte-Anne-de-Beaupré); PDF rendering ambiguous | Verify whether PDF carries the accent; if so, add `é` |
| lesson-131 | ~24–27 | image-ref | Two side-by-side Last Supper illustrations on PDF p. 269 missing (only `lesson-131.webp` exists) | Export as `lesson-131b.webp` / `lesson-131c.webp`; insert refs before the Matt. 26 caption |
| lesson-132 | 22 | image-ref | Second illustration (grape pressing scene, PDF p. 271) missing | Export as `lesson-132b.webp`; insert ref before the matching caption |
| lesson-134 | 35 | image-ref | Second illustration on PDF p. 275 missing — agent removed the orphan caption text when reunifying a split blockquote; the caption ("hosts consecrated at Mass…") needs to be restored alongside the image | Export the image as `lesson-134b.webp`; restore the caption beneath it |
| lesson-138 | 29 | image-ref | Second full-page illustration (liturgical vestments + colour wheel, PDF p. 283) missing | Export as `lesson-138b.webp`; append image ref after the body |
| lesson-193 | 39 | image-ref | Second illustration at bottom of PDF p. 407 missing (caption: "Go into the whole world and preach the gospel to every creature" — Mark 16:15) | Export as `lesson-193b.webp`; append image + caption at end of chapter |
