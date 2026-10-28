You are translating one book of the Ember corpus into Brazilian Portuguese (pt-BR).

Book directory: `content/books/__BOOK__/`

Use the `translate-book` skill: read its SKILL.md in full first and execute its whole pipeline (preparation, journal setup, translation, book.json metadata) for target language `pt-BR`. Also read the project's `CLAUDE.md`.

How this run differs from the skill's interactive wording:

- You run unattended. Never stop to ask a question: translate every source footnote (the skill's rule), decide anything else yourself, and record the decision in `pt-BR/translation-journal.md`.
- Do all the work yourself, in this session. Do not launch sub-agents.
- The canonical source is the original-language text. If the book has a `la/` directory, that Latin is the source: translate from it, keep its file and paragraph structure, and consult `en-US/` only as a secondary reference for register and terminology, as `content/books/aquinas-opera-omnia/opuscula/de-ente-et-essentia/pt-BR/translation-journal.md` records. Otherwise the source is the book's only language directory (`en-US/` for the Church Fathers). Record the source in the journal header.
- Translate the whole text. Every heading, paragraph, numbered section, quotation and Scripture reference in the source must have its counterpart, in the same order, with the same paragraph breaks. Work through long chapters section by section and write as you go; do not summarize, abridge or skip.
- Before coining names, titles and recurring terms, look at how sibling works already translated in this corpus did it: the same author's other works if any have a `pt-BR/` directory (for Aquinas, the pt-BR works under `content/books/aquinas-opera-omnia/` — their Key Terms tables govern scholastic vocabulary), and otherwise `content/books/church-fathers/ambrose/repentance/` and `content/books/church-fathers/athanasius/` (their `pt-BR/` chapters, `translation-journal.md` and `book.json`). Match their conventions for book.json (`name`, `author`, `languages`, toc titles), Scripture reference style and Bible book names in Portuguese, saints' names, and quotation marks.
- Portuguese must carry full diacritics.
- Follow `.claude/rules/books.md` (bold paragraph numbers, never translate from a line-clipped read, source edits only for OCR-class corruption).
- In `book.json`, add pt-BR entries only to fields that already exist. Do not add a top-level `description`; the sibling works have none.
- Keep the journal a concise working reference (terms, decisions, source edits), like the sibling journals — not a log of every check you ran.
- Touch only files inside `content/books/__BOOK__/`: create `pt-BR/` (chapter files + `translation-journal.md`) and update `book.json`. Edit the source-language file only to fix an unmistakable OCR/scan slip, and list every such edit in the journal.
- Do not run `git commit`, `git add`, `git stash` or any other state-changing git command. Do not run `pnpm build:corpus`; the orchestrator builds once at the end.

Before finishing, verify your own output: the pt-BR file has the same number of headings and paragraphs as the source, `book.json` is valid JSON, and nothing is left untranslated.

End your final message with a short summary: files written, paragraph counts source vs target, and the main decisions recorded in the journal.
