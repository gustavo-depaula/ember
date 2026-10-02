# Curating each holy card's `related`

Every holy card opens a page: the card, its life, then everything the app holds
about it. The card lists that content itself, in `related`:

```json
"related": {
  "pray": [{ "title": { "en-US": "Novenas", "pt-BR": "Novenas" }, "refs": ["practice/st-joseph-novena"] }],
  "read": [{ "refs": ["book/montfort-true-devotion", "chapter/about-montfort"] }],
  "collections": ["collection/carmelite"],
  "cards": ["joseph", "holy_family"]
}
```

- **pray**: practices (`practice/…`), in groups. The page shows each as a row with a Pray button.
- **read**: books (`book/…`) and chapters (`chapter/…`), in groups. The page shows them as shelves of covers.
- **collections**: collections (`collection/…`), shown as the last reading shelf.
- **cards**: other holy cards, by bare card id. A link is written on **one** card only, and the app shows it from both sides.

A group with a heading has a `title` in both `en-US` and `pt-BR` (Brazilian Portuguese).
If a key has one group, leave it untitled; give every group a title when there are several.
Reuse the headings already in use where they fit: Novenas/Novenas, Devotions/Devoções,
Litanies/Ladainhas, Hymns/Hinos, Writings/Escritos, About/Sobre.

## What belongs

Fewer, truer links are better. A page that lists everything vaguely nearby is the superficiality this replaces.

- **A practice** belongs if it is addressed to this saint or mystery, written or composed by the saint, is the devotion the saint founded or is known for spreading, or is the rite or prayer the card depicts. A generic prayer that merely mentions a saint in passing (a litany of all saints, the Confiteor naming Michael) does not.
- **A book** belongs if the saint wrote it, or it is about the saint or about the mystery or object on the card. The church-fathers shelf holds hundreds of the Fathers' own works, so look there for any Father, Doctor or early bishop. A general catechism or encyclopedia does not belong, even if it has a section on the topic.
- **A collection** belongs if it is devoted to this saint or devotion, or to the order or spirituality the saint founded or shaped.
- **A card** belongs if it is the same person or event on another day (the conversion, the translation of relics, the finding), family (parents, siblings, spouses), founder and first companions, master and disciple, co-martyrs, the mystery that this card is a station of, or the vestment that this Mass card's rite uses, the devotion or feast the saint spread or founded (Bernardine and the Holy Name), the patron an order is named for (the Ursulines and Ursula), the one feast kept under two names in the two calendars, and a namesake who restored the saint's work (Benedict of Aniane and Benedict). The link should be plain from the cards' names, the Pictorial Lives chapter, or well-established hagiography. Being of the same order or century is not enough.
- **When nothing in the corpus fits, propose nothing for the card.** Most obscure martyrs will have no prayers or books, and that is fine. Card links can still apply.

Never invent an id. Every ref must exist, so grep the inventory or the content before using it.

## Where to look

Run from the repo root.

- `research/holy-card-faces/related/inventory/*.tsv`: one line per card, practice, book, chapter and collection, with names, tags and descriptions. Grep these first, by English and Portuguese name, Latin name, surname, city, order, and patronage.
- `content/practices/saint-of-the-day/data/holy-cards/<id>.json`: the card itself (name, patronage, `lifeChapter`, `proper`).
- `content/books/pictorial-lives-of-saints/en-US/<lifeChapter>.md`: the saint's life as the app shows it. It is the best source for family, companions, and the same saint on other days.
- The content itself, for what the inventory names don't show. For example, `grep -ril "benedict" content/practices/*/manifest.json content/practices/*/flow.json content/chapters content/collections` finds a prayer that is the saint's own but doesn't say so in its name.
- `cards.tsv` shows which cards already have a list (`has_related`). Read those cards' `related` before linking to them, and write no link they already make.
- Curated examples: `thomas_aquinas`, `divine_mercy`, `louis_de_montfort`, `augustine`, `peter`.

## Output

For a batch `NN`, the card ids are in `related/batch-NN.cards`. Write two files:

1. `related/batch-NN.json`: `{ "<card id>": { …related… }, … }`, with only the cards you propose something for.
2. `related/batch-NN.md`: one line per card in the batch, in the batch's order:
   - `id: <what you linked, in short>`, plus a reason for any link that isn't obvious;
   - `id: nothing (<what you checked>)`.

   At the end, list your **doubts**: links you left out because you weren't sure, and why.

Then validate with
`python3 research/holy-card-faces/apply-related.py related/batch-NN.json --check`
and fix the file until it passes. Do not run it without `--check`, do not edit card files, and do not commit. The coordinator reviews and applies the batch.
