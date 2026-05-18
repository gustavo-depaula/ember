# Catechetical Formation — Design

89-day catechetical formation track that pairs the **Catechism in Pictures** (1908, Maison de la Bonne Presse) with the **Compendium of the Catechism of the Catholic Church** (2005, John Paul II / Benedict XVI).

## Why this design

The 1908 *Catéchisme en Images* is already a complete catechism — 68 illustrated lessons covering the Apostles' Creed, the Sacraments, the Commandments, and Prayer/Last Things/Sin/Virtues/Works of Mercy. Each plate is one short, illustrated lesson with the visual and the doctrinal explanation already paired. It is built to be read in a single sitting.

The 2005 Compendium is a question-and-answer companion to the full Catechism of the Catholic Church (1992) — same structure, same scope, modern doctrinal precision, indexed by number for citation. It is built for cross-reference.

Pairing them: the plate carries the day (image + concise traditional exposition), and the Compendium provides the deeper, more precise modern formulation a reader can pursue when curious.

The formation book **does not duplicate either underlying text.** Each day's chapter is a tiny reference file: title, a markdown link to the plate, a list of Compendium paragraph citations. The reader navigates to the source books to read the substance. The app handles the rendering.

## Audience

Young-adult lay Catholic, 18–35. Audience floor: someone returning to the faith after years away or just beginning. Audience ceiling: a soul who has read it three times and still finds the eighty-ninth day worth opening.

Bilingual EN-US + PT-BR.

## Day format

Each `day-NN.md` chapter is short and structural. The plate image is bundled in this book and placed *immediately above* the Compendium section (which is doctrinally what explains the image):

```markdown
# Day 8 — I Believe in God — Trinity

[Plate 2 — The Trinity](book/catechism-in-pictures/plate-02) — *from Catéchisme en Images (1908)*

![Plate 2 — The Trinity](../images/day-08.jpg)

## *Compendium of the Catechism*

- §§ 36–43 — *I believe in God; the Name and nature of God*
- §§ 44–49 — *The Most Holy Trinity*
```

Compendium-only days drop the plate link and the image:

```markdown
# Day 1 — Man's Capacity for God

*A Compendium-only day — no plate from the* Catechism in Pictures *for today.*

## *Compendium of the Catechism*

- §§ 1–5 — *Man's desire for God; knowledge of God by reason; how we speak of Him*
```

## Length

89 days. Each day fits inside 15 minutes of attentive reading (a plate is short; a Compendium paragraph is shorter). 30 of the 89 days are Compendium-only — they cover topics the 1908 plates leave thin (faith, Revelation, Tradition and Scripture, the mysteries of Christ's public life, the marks of the Church, the Marian dogmas, the liturgy and the rite of the Mass, conscience and the moral foundations, the wellsprings and battle of prayer, the petitions of the Our Father).

## Data spine

```
content/books/catechetical-formation/
├── book.json           ← TOC; generated from sessions.json (one-shot)
├── sessions.json       ← day-by-day mapping: plate ref + Compendium paragraph ranges
├── en-US/day-NN.md     ← per-day chapter (89 files)
├── pt-BR/day-NN.md     ← per-day chapter (89 files)
└── images/day-NN.jpg   ← bundled plate illustrations (59 files; 30 Compendium-only days have no image)
```

`sessions.json` is the authoritative source for the day-by-day plan. `book.json` and the chapter `.md` files were generated from it with a one-shot Python script (no permanent build pipeline). If the plan changes, regenerate them.

The chapters reference the plate via markdown links of the form `[Plate Title](book/catechism-in-pictures/plate-NN)`. The app's renderer is expected to resolve these links to the plate in the sister book. The Compendium is referenced by paragraph numbers only; readers follow the citation either to the imported `book/compendium-ccc` (when present) or to the public Vatican URL.

## Compendium Q ranges

The Compendium of the Catechism has 598 numbered questions. This program walks them in their canonical order, anchored to the plates wherever the topics align. The full day-by-day plan is in [`mapping.md`](./mapping.md); the canonical machine-readable source is `content/books/catechetical-formation/sessions.json`.

When the `book/compendium-ccc` import lands in main, audit the Q ranges in `sessions.json` against the actual paragraph numbering — the ranges in this initial pass are based on the public structure of the Compendium and may need small tightening at the section boundaries.

## Open questions

- **The link format `book/catechism-in-pictures/plate-NN`** is a convention for cross-book references inside a chapter. The app does not yet have a renderer for it; that's the rendering work referred to in the user's request ("we'll render the markdown"). Until that renderer ships, the link is a placeholder that human readers can interpret.
- **Image at the top of each day** — once the cross-book link renders the plate inline, the day's chapter will display the plate's colored illustration through that link rather than carrying its own copy. This avoids any image duplication between the two books.
