# Brief: an author's reading guide

The app shows each author's works on their author page and on their saint's holy card, in the order of the author's **reading guide**: titled sections of works, in the order a reader should take them, each work with a short line on why to read it. You write guides for the authors you are given. Look at `content/authors/therese-of-lisieux.json`, the model.

## Format

Add a `guide` key at the end of `content/authors/<author>.json`, leaving every other key as it is:

```json
"guide": [
  {
    "title": { "en-US": "Start here", "pt-BR": "Comece por aqui" },
    "note": { "en-US": "One sentence on the section.", "pt-BR": "Uma frase sobre a seção." },
    "works": [
      { "work": "therese-of-lisieux/histoire-d-une-ame",
        "why": { "en-US": "The book that made her known, as first published in 1898",
                 "pt-BR": "O livro que a tornou conhecida, como saiu em 1898" } }
    ]
  }
]
```

- `work` is the key `guide_works.py` lists: the book's `work`, or its book id when it names none. Each of the author's works appears **exactly once**.
- `note` is optional; `why` is wanted on every work (one line, under about 70 characters, no final period). On an author with more than about 40 works, `why` is required on the works of the first sections and welcome on the rest.
- Both languages everywhere. pt-BR is Brazilian Portuguese. Use the pt-BR titles the books already have when you name a work.

## How to order

1. **Start here**: the one to three works a newcomer should read first, the most representative and readable (Confessions, Introduction to the Devout Life, the Story of a Soul…).
2. **The major works**, then **themed groups** that fit this author: treatises, sermons and homilies, Scripture commentaries, letters, poems and hymns, prayers, controversy, minor works. Five to ten sections is typical; a one- or two-work author gets one section.
3. An edition or selection of a work goes right after the complete work. Doubtful or spurious works go last (an "Attributed works" section).
4. Within a section, put the most important or most readable first, not alphabetical order.

Ground every line in what the corpus and the reports say: each book's `description` and `composed` (in its `book.json`), its size, and the author's report in `research/sourcing/<author>.md` (its recommended order and notes on each work), when there is one. Write nothing you can't support: no invented anecdotes or counts.

For Thomas Aquinas, start from the groups his holy card already uses (`content/practices/saint-of-the-day/data/holy-cards/thomas_aquinas.json`, `related.read`), then reorder them into a guide.

## Steps, per author

1. `python3 research/sourcing/_scripts/guide_works.py <author>` lists the works.
2. Read the report and the descriptions you need; write the guide.
3. `python3 research/sourcing/_scripts/guide_works.py <author> --check` must print no ERROR.
4. Commit only that file: `git add -- content/authors/<author>.json && git commit -m "Reading guide for <Author>" -- content/authors/<author>.json`, then push with `research/sourcing/_scripts/commit_retry.sh` or `git pull --rebase --autostash origin main && git push origin HEAD:main` (retry on rejection; on `index.lock`, wait and retry). No `Co-Authored-By` line. Never `git add -A`, stash, reset or check out other paths: other agents work in this checkout.

Do no web requests, run no build, and edit no other file. When done, report per author: sections, works, and anything you were unsure of.
