# One-off book scans

Books that come as a scanned PDF rather than as text, read with the Denis pipeline (`../denis-carthusian/`) and proofread the same way. Data lives in `~/ember-data/ocr-books/`, laid out as Denis's is: `zips/<book>_tif.zip` (the pages, rendered from the PDF at 300 dpi), `dots/<book>/<leaf>.md|.raw.txt`, `checked/<book>/<leaf>.jsonl`.

1. Render the PDF and zip the pages as `<book>_<leaf>.tif`, then draft with `run_volumes.py --volumes <book>` under `DENIS_DATA=~/ember-data/ocr-books`.
2. `drafts.py <book>` rewrites the drafts from the layout JSON. `ocr_local.dots_markdown` is written for Denis's two-column folios: it sets narrow blocks aside as margin notes, which on a one-column page are the short last lines of paragraphs, and its line-end hyphen rule deletes the hyphen of every compound ("self-examination").
3. `check_pages.py --volume <book> --leaves 0000-9999 --prompt ../ocr-books/fix-prompt.md` proofreads, with this directory's prompt for English prose.
4. `assemble.py <book>` applies the fixes and joins the pages into `~/ember-data/ocr-books/<book>.md`, page-foot notes as Markdown footnotes numbered through each chapter (Bruyère numbers them by chapter, Frost by page).
5. `corpus.py <book>` cuts that into `content/books/<book>/`, leaving out what its entry in `books` names: library stamps, title and copyright pages, contents pages, indexes keyed to page numbers.

## The books

- **Cécile Bruyère, *The Spiritual Life and Prayer*** (Stanbrook translation, 1900, from the Mediatrix Press reprint of 2016): 352 pages, 218 fixes, 668 footnotes. Leaf 0235 (p. 216) is a blank verso; the faint print on it is p. 215 showing through, mirrored.
- **Bede Frost, *The Art of Mental Prayer*** (revised edition, 1935): 292 pages, 1,052 fixes (mostly italics, which dots.mocr drops). The bibliography, a list of books in print in 1935 with their prices, and the two indexes are left out. Frost died in 1961, so the book is under copyright until 2031 (US) and 2032 (Brazil); it is in the corpus at the owner's decision (23 October 2026).

Proofreading both cost $10.89 at API rates, about $0.017 a page. 49 of the 1,270 fixes could not be applied, nearly all italic runs whose words occur twice on the page.
