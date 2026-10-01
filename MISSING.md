# Holy cards: what's missing in how cards are won

The rules engine (`packages/holy-cards`) already has a rule for every door in
[docs/plans/holy-cards.md](docs/plans/holy-cards.md). What's missing is the
app feeding it the acts, and the cards' art.

| Door | Status | What's missing |
|---|---|---|
| Mass → the date's saint | Done | — |
| Office → a saint not on the current calendar | Done | — |
| Starter cards on first open | Done | — |
| Novena finished | Done | Art for about 22 novenas' cards (Guadalupe, Holy Spirit/Pentecost, Sacred Heart, Divine Mercy…), plus St. Raphael for the Holy Archangels novena |
| Finishing a saint's book | Rule ready | The app never reports a finished book, and no book names its saint yet. The art already exists (*Story of a Soul* → Thérèse). Open question: what "finished" means for a book — the last chapter read, or every chapter |
| Mass with no carded saint → a liturgical card | Rule ready | Art: 53 cards (29 parts of the Mass, 24 objects and vestments), none drawn. Until then such a Mass gives nothing |
| Season Sunday / weekday cards, Triduum, Gaudete, Laetare | Rules ready, fed by the Mass acts already in place | Art only: 19 season cards, none drawn. Each door starts working as soon as its card is drawn, with no code needed |
| Ember Days program | Rule ready | No Ember Days practice exists in `content/` yet: the three-day program needs writing, then an act for finishing it, and 4 cards of art |
| Practice lineages (the Rosary → Dominic → …) | Rule ready | The app passes no practice history (`occurrences: []` in `usePendingHolyCards`), and no practice has a lineage. The pairings must be researched from sources, not recalled |

## Outside the doors

- **The optional intention line on the back.** The plan lists it, but
  redeeming doesn't ask for it and copies don't store it.

## Suggested order

1. **Books.** The art exists, so this is code plus deciding what "finished"
   means — the quickest door left to make real.
2. **Intention line.** Small, and it completes the card's back.
3. **Art.** Liturgical cards and season cards; their doors work once drawn.
4. **Lineages.** Source the pairings first.
5. **Ember Days.** Write the program first.
