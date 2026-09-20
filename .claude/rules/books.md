---
paths:
  - "content/books/**"
---

# Book chapters and translations

Format reference: `docs/content/book-format.md`. The import, translation and review procedures live in the `import-book`, `translate-book` and `review-book-translation` skills.

- Write paragraph numbers the author chose as inert bold text (`**47.**`), never as `47. ` list markers. `marked` turns `N. ` runs into `<ol start>` and silently renumbers gaps and repeats, destroying citation handles.
- Never translate from a line-clipped read. Book paragraphs exceed 2,000 characters, and a reader's `(line truncated to 2000 chars)` marker has been translated into the corpus before. After bulk generation run `rg 'truncated to [0-9]+ chars' content/` and restore any hit from the original.
- Edit an imported source chapter only for OCR-class corruption that no printed edition attests (`it`→`if`, `Presybters`). An error the edition itself carries (e.g. a wrong Scripture citation) is documented and mirrored, so the language files never disagree on a fact.
- Before citing another book's en-US→pt-BR pairing as precedent, check its `book.json` `sources`. Several books (Trent catechism, both Pius X catechisms, Morrow, …) align independent historical translations, so their pairings say nothing about how this corpus renders a word.
- When grepping the corpus to adjudicate a rendering, search recursively on the inflected stem (`goz[aeio]`, not `gozar`), exclude `translation-journal.md`, and remember books sit at two depths (`content/books/*/` and `content/books/church-fathers/*/*/`) — a fixed-depth glob misses one set.
- Don't normalize pt-BR quote style (straight vs curly) or reverential capitalization in a per-book pass, and don't transplant source punctuation such as English `:—`. No house rule exists; keep each file internally consistent.
- Before starting a self-chosen translation, check open PRs and recent merges touching that book path. Parallel scheduled sessions have duplicated a whole translation.
