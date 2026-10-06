# Holy cards: what's missing in how cards are won

The rules engine (`packages/holy-cards`) already has a rule for every door a
card is won through. What's missing is the
app feeding it the acts, and the cards' art.

| Door | Status | What's missing |
|---|---|---|
| Mass → the date's saint | Done | — |
| Office → a saint not on the current calendar | Done | — |
| Starter cards on first open | Done | — |
| Novena finished | Done | — (every novena with a card of its own names it; the generic novenas and the Surrender novena give none) |
| Finishing a saint's book | Rule ready | The app never reports a finished book, and no book names its saint yet. The art already exists (*Story of a Soul* → Thérèse). Open question: what "finished" means for a book — the last chapter read, or every chapter |
| Mass with no carded saint → a liturgical card | Rule ready, art drawn | The app passes the rules an empty pool (`liturgical: []` in `usePendingHolyCards`): it must list the 53 Mass-part and object cards (`kind` `mass` and `object`) |
| Season Sunday / weekday cards, Triduum, Gaudete, Laetare | Rules ready, art drawn | The app passes `seasons: {}`: it must say which card is each season's Sunday, weekday, Triduum, Gaudete and Laetare card. Divine Mercy Sunday is also the Easter Sundays card's day, so that day needs a choice |
| Ember Days program | Rule ready, art drawn | No Ember Days practice exists in `content/` yet: the three-day program needs writing, then an act for finishing it |
| Practice lineages (the Rosary → Dominic → …) | Rule ready | The app passes no practice history (`occurrences: []` in `usePendingHolyCards`), and no practice has a lineage. The pairings must be researched from sources, not recalled |

## Outside the doors

- **The optional intention line on the back.** The plan lists it, but
  redeeming doesn't ask for it and copies don't store it.

## Suggested order

1. **Books.** The art exists, so this is code plus deciding what "finished"
   means — the quickest door left to make real.
2. **Intention line.** Small, and it completes the card's back.
3. **Liturgical and season doors.** The art is drawn; the app must hand the
   rules their cards.
4. **Lineages.** Source the pairings first.
5. **Ember Days.** Write the program first.
