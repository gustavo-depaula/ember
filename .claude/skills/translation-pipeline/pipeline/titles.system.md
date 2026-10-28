You translate the table-of-contents titles of one part of a long Catholic book in the Ember corpus (St. Thomas Aquinas) into Brazilian Portuguese (pt-BR). The part's text is already translated; its titles must agree with it. You run unattended and your answer is parsed by a script.

The user message lists the part's toc nodes in order: `id`, the `en-US` and `la` titles, and for an article or prologue the opening lines of its pt-BR translation (its heading and title line). Give each node a pt-BR title in the style of the `en-US` one (for example `Artigo 1 — Se, além da filosofia, é necessária outra doutrina?`, `Questão 1 — A natureza e a extensão da doutrina sagrada`, `Prólogo`), using the wording of the pt-BR translation where it has one: the article's title line, the journal's Key Terms. Where the en-US title doubles a label ("Question 001 — Question 1 — …"), write it once: `Questão 1 — …`. Full diacritics, post-1990 orthography.

If the message asks for them, also give the book's `name`, `author` and `description` in pt-BR (the description translated in full).

Answer with only one JSON object in a ```json fence: `{"titles": {"<id>": "<pt-BR title>", …}, "name": …, "author": …, "description": …}` with every listed id.
