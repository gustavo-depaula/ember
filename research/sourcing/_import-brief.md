# Import brief: first wave of the sourced authors

You are importing one author's first-wave works into the Ember corpus (repo root: the worktree you are in; `content/books/` holds books, one markdown file per chapter per language). Read, in this order:

1. `research/sourcing/README.md`: the **Decisions** section is binding (tiers, keep editors' notes, works and editions, language folders).
2. The author's report, `research/sourcing/<author>.md`: the ranked sources per work. Use the top-ranked source unless it fails; cross-check doubtful passages against the second.
3. `.claude/skills/import-book/SKILL.md`: the import procedure (download → map structure → split → clean → book.json → verify). Follow it, with the rules below taking precedence.

## Layout

- **Folder:** `content/books/<author-slug>-opera-omnia/<work-slug>/` (e.g. `teresa-opera-omnia/moradas/`). Look at `content/books/aquinas-opera-omnia/` for the shape.
- **id:** `<author-short>-<work-slug>` (e.g. `teresa-moradas`), unique across `content/books/**/book.json` (grep before choosing).
- **Language folders:** `la/`, `es-ES/`, `fr-FR/`, `it/`, `en-US/` (and `dum/`, `gmh/` for medieval Dutch/German). The original language comes first in `languages`.
- **A book is one source edition plus the translations made from it.** Put the original in its folder. Put a public-domain English translation in `en-US/` of the same book **only when its chapters follow the original's** (same chapter ids, one file each); otherwise make it its own book (`<id>-<translator>`) with the same `work`.
- **Do not create `pt-BR/`.** Our pipeline translates later.
- **Raw downloads** go in the book's `sources/<lang>-originals/` as `.txt` (one per work), as the skill says. Keep any huge scan PDFs out of git (leave them in `research/sourcing/<author>/`).

## book.json

Required fields, besides the skill's (`id`, `name`, `author`, `description`, `composed`, `languages`, `sources`, `toc`):

```json
"work": "<author-slug>/<work-slug>",
"editions": {
  "es-ES": { "editor": "P. Silverio de Santa Teresa", "year": 1915 },
  "en-US": { "translator": "Benedictines of Stanbrook", "year": 1921 }
}
```

- `name`, `author`, `description` and toc titles in the book's own languages plus `en-US` and `pt-BR` (a short pt-BR name/author/description you write; chapter titles in pt-BR come later from the pipeline, so toc titles need only the book's languages).
- Every `sources` entry names its language, URL and edition, and its **copyright tier with the evidence** (A: public domain because…; B: free in practice because…).
- **Editors' notes stay**, as markdown footnotes `[^N]`, in the files of the language they annotate.
- Each chapter file starts with an `#` H1 matching its toc title in that language.

## Author entry

If `content/authors/` has no file whose `matches` covers the book's `author["en-US"]`, add `content/authors/<author-slug>.json` (`name` en-US/pt-BR, `century`, `matches`; `saint` only if `content/saints/` has that saint's id). Look at `content/authors/augustine.json`.

## Check, commit, push

- `python3 scripts/check-book.py content/books/<…>/<work>` must exit 0; fix every error and every H1/TOC warning you can.
- Spot-check word counts against the report's figures; a big shortfall means lost text.
- **Commit each book on its own** with only that book's files (and the author file): `Import <Author>'s <Work> (<langs>)`, a body naming the sources and their tiers. No `Co-Authored-By` line.
- Then `git pull --rebase origin main && git push origin HEAD:main` (retry the pull on a rejected push).
- Do not run the translation pipeline. `pnpm build:corpus` is not needed.

## Requests

Generic User-Agent `EmberCorpusResearch/1.0`; never put personal data (email, name, GitHub user) in any request. Be polite with sites (one request at a time, small delays).

## Report

When done: per book, the id, path, languages, word counts per language, sources used (tier), what was left out or uncertain, and the commit sha.
