# One-off book scans

Books that come as a scanned PDF rather than as text, read with the Denis pipeline (`../denis-carthusian/`) and proofread the same way. Data lives in `~/ember-data/ocr-books/`, laid out as Denis's is: `zips/<book>_tif.zip` (the pages, rendered from the PDF at 300 dpi), `dots/<book>/<leaf>.md|.raw.txt`, `checked/<book>/<leaf>.jsonl`.

1. Render the PDF and zip the pages as `<book>_<leaf>.tif`, then draft with `run_volumes.py --volumes <book>` under `DENIS_DATA=~/ember-data/ocr-books`.
2. `drafts.py <book>` rewrites the drafts from the layout JSON. `ocr_local.dots_markdown` is written for Denis's two-column folios: it sets narrow blocks aside as margin notes, which on a one-column page are the short last lines of paragraphs, and its line-end hyphen rule deletes the hyphen of every compound ("self-examination").
3. `check_pages.py --volume <book> --leaves 0000-9999 --prompt ../ocr-books/fix-prompt.md` proofreads, with this directory's prompt for English prose.
4. `second_pass.py <book>` lays out the corrected pages as drafts of their own, and `check_pages.py` with `--drafts ~/ember-data/ocr-books/dots2/<book> --out ~/ember-data/ocr-books/checked2/<book>` proofreads them again. The second pass catches what the first missed, and takes off italics the first wrongly added.
5. `review.py <book>` flags what is still suspect, for a review against the scans (`review/INSTRUCTIONS.md` in the data directory): a word no English or French word list knows, a paragraph that starts in lower case, and a fix neither pass could place. The reviewers' fixes go to `checked3/`. A fix can carry `context` to pick out one of two identical words for italics.
6. `assemble.py <book>` applies the three fix lists in order and joins the pages into `~/ember-data/ocr-books/<book>.md`, page-foot notes as Markdown footnotes numbered through each chapter (Bruyère numbers them by chapter, Frost by page).
7. `corpus.py <book>` cuts that into `content/books/<book>/`, leaving out what its entry in `books` names: library stamps, title and copyright pages, contents pages, indexes keyed to page numbers.

## The books

- **Cécile Bruyère, *The Spiritual Life and Prayer*** (Stanbrook translation, 1900, from the Mediatrix Press reprint of 2016): 352 pages, 218 fixes, 668 footnotes. Leaf 0235 (p. 216) is a blank verso; the faint print on it is p. 215 showing through, mirrored.
- **Bede Frost, *The Art of Mental Prayer*** (revised edition, 1935): 292 pages, 1,052 fixes (mostly italics, which dots.mocr drops). The bibliography, a list of books in print in 1935 with their prices, and the two indexes are left out. Frost died in 1961, so the book is under copyright until 2031 (US) and 2032 (Brazil); it is in the corpus at the owner's decision (23 October 2026).

The first pass cost $10.89 at API rates (about $0.017 a page) and the second about the same, adding 1,418 fixes. On 24 October 2026 eight agents reviewed the 325 flagged pages against the scans and wrote 177 more fixes, all of which applied. They corrected typos of the Mediatrix reprint, which was retypeset from the 1900 edition, to the intended English or Vulgate Latin ("dicit Dominus" for "elicit Dominus"). They kept archaic and period spelling ("behoveth", "connexion"), and left the author's own wrong references as printed. They also found four blank versos in Bruyère (pp. 40, 70, 84 and 94, each before a chapter opening) where dots.mocr had invented a page of text from the print showing through. Those pages are blanked at the source (`dots/<book>/<leaf>.source` says why).
