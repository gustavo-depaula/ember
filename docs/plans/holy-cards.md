# Holy Cards

> A missal full of *santinhos*, each one a moment you actually lived.

The collectibility layer for the saints gallery (Devotion pillar, Engagement track #302). Today `isCollected` in `apps/app/src/features/saints/data/collection.ts` means "has art"; this design replaces that seam.

---

## Principle

Holy cards are **given, not earned** — at a First Communion, a funeral, a feast. A card marks a real act of the Church's life (Mass, the Divine Office, a season kept, a novena prayed), never app activity. The act is the point; the card remembers it, and receiving it is itself a small act: you pray with the saint before the envelope opens.

It must feel like a missal, not a game:

- **Nothing is gated.** Every Life, prayer, and explanation stays readable whether or not you hold the card. A card marks a relationship, not access.
- **Nothing held is lost.** A redeemed card never expires or decays. An unredeemed one lapses after its window (below), but the same act brings it again: next year's feast, the next Sunday, the next novena.
- **No points, ranks, or percentages.** No "37/120".
- **No farming.** A rule gives one card per act, never several; app time and opens never count. One act can still complete several rules — the Sunday that finishes Advent gives its saint *and* the Advent Sunday card — and each rule gives its own card.
- **Every card is holographic.** Copies differ by their back — the full condition each was received under — not by rarity.
- **No odds to chase.** Saints always follow from the act. Only the liturgical cards (parts of the Mass, objects, vestments) and a copy's print are drawn at random, unheld first, every candidate equally likely.

---

## Doors

| Act | Card |
|---|---|
| Mass on a date with a saint on the current calendar (celebrated that day or outranked) | That saint (you pick when there are several) |
| The Divine Office, any hour, on a saint's assigned day | A saint not on the current calendar, assigned that day |
| Mass on a date with no saint (or whose saints have no card yet) | A liturgical card: a part of the Mass, a liturgical object, or a vestment |
| A novena, finished | The card it is prayed to |
| A season's Sundays, all attended | That season's Sunday card |
| A season's weekdays, attended faithfully | That season's weekday card |
| All three Triduum liturgies | The Triduum card |
| The Ember Days program, finished | That season's Ember Days card |
| A practice kept faithfully | The next saint in that practice's lineage |
| Finishing a saint's book | That saint (e.g. *Story of a Soul* → Thérèse) |
| First open | Two starter cards the user picks from a pool |

A saint on the current calendar comes only through Mass; the Office gives only the saints who have no Mass.

### Attending Mass

Honour system. Tapping **Amen** on the Mass practice, or ticking Mass in the plan of life, counts as attending that day — including praying the Mass at home. (The Mass Times church check-in already completes the practice, so it counts too.)

### One card per Mass, in precedence

Each Mass gives **the date's saint, or else a liturgical card**. The other doors are independent rules, so a day — even a single Mass — can bring several envelopes: the feast saint at Mass and a novena finishing the same day; the last Sunday of a season and that season's Sunday card. Each rule gives its own card.

- **The date's saints:** every saint the current calendar assigns to that date is a candidate, whatever the rank — and even when the day's liturgy doesn't celebrate them. A memorial falling on a Sunday is omitted at Mass that year (`resolveOfDay` suppresses it), but Sunday Mass still gives its saint: on Sunday 4 October 2026, St. Francis.
- **Several saints, you pick:** you choose whose card it is, on the envelope. Rank only orders the list (solemnity, feast, obligatory memorial, optional memorial).
- **No art yet:** if none of the date's saints has a card drawn yet, that Mass gives a liturgical card instead — the same as a date with no saint.

### Liturgical cards: parts, objects, vestments

Mass on a date with no saint — or whose saints have no card yet — gives one liturgical card from the pool of the parts of the Mass (entrance, Kyrie, Gloria, readings, … dismissal), liturgical objects (thurible, ambo, chalice, paten, …) and vestments (amice, alb, cincture, stole, chasuble, …) — drawn at random, unheld first, every candidate equally likely; once all are held, copies. The draw is seeded by the act (date + door), so it's stable. Each back explains the part, object or vestment. Source the parts from the Order of Mass in `practice/mass`, not from memory.

### The Divine Office (saints not on the current calendar)

Every saint in the catalog who isn't on the current Roman calendar — the Pictorial Lives saints, the saints canonized since 2022, figures like Philomena — is **assigned a day**: their day in the Roman Martyrology (their *dies natalis*) by default; where there is none, a day we set (Philomena: 11 August, her old feast). The day is researched with the card, like its `lifeChapter` and `proper`.

- **Praying any hour of the Divine Office** on that day gives one of the saints assigned to it: the Liturgy of the Hours, the Roman Breviary (any edition) or the monastic breviary. The Little Offices don't count — they're devotions, not the Office.
- **Several on one day, you pick**, on the envelope, as at Mass.
- **Independent of Mass**, so a day can bring two envelopes: the calendar saint from Mass, the assigned saint from the Office.
- The Office never gives a calendar saint, and Mass never gives an assigned one.

### Novenas

Finishing a novena (all nine days of its program) gives the card it is prayed to: the Guadalupe novena gives Our Lady of Guadalupe, the St. Joseph novena gives Joseph, the Holy Spirit novena gives Pentecost. Each novena's `manifest.json` names its card; a generic novena ("any saint", "any Marian feast") gives the saint or title the user prays it to. One novena, one card.

### Seasons

One shared set, with season boundaries from `resolveOfDay` for every user regardless of the form they attend:

Advent · Christmas · Lent · Easter · Ordinary Time I (after Christmas) · Ordinary Time II (after Pentecost) — each with a **Sunday** and a **weekday** card — plus the **Triduum** card and the rose cards for **Gaudete** and **Laetare**.

- **Sunday card:** Mass on every Sunday of the season (Lent includes Palm Sunday; Easter includes Pentecost). No excuse mechanism: a missed Sunday means the card waits for next year.
- **Weekday card:** Mass on at least two thirds of the season's weekdays.
- **Triduum:** Holy Thursday, Good Friday, and the Easter Vigil.
- **Gaudete, Laetare:** Mass on that Sunday.
- Granted with the Mass that completes the condition, alongside that Mass's own card: the Sunday card with the season's last Sunday, the weekday card with the Mass that reaches two thirds.
- Keeping the plan of life through the season adds a *Kept Lent 2027* line to the card's back.
- **Progress is visible during the season** as a quiet row of Sunday dots on the season card.

### Ember Days

Four cards a year (Advent, Lent, Pentecost, September), received by finishing the Ember Days program — a three-day practice program, like the novenas — during that season's Ember Days. Their dates come from the Divinum Officium missal, not from `resolveOfDay`.

### Practice lineages

Each practice carries an ordered **lineage** — the saints who taught, spread, or lived it (Rosary → Dominic, then others who championed it; examen → Ignatius, then his companions; pairings to be sourced, not recalled). Each faithful window grants the next saint in the lineage, so a long-kept practice keeps introducing the people behind it.

- Kept faithfully = **~20 of its last 30 scheduled occurrences**, measured against the slot's `schedule` (`apps/app/src/db/events/state.ts`), so a daily practice and a weekly one each get a fair window with no per-practice setting. Not user-tunable — a tunable threshold gets tuned until the card drops.
- The next card needs a fresh window after the last grant — windows don't overlap. After the lineage's last saint, it starts over with copies.
- Lineages live in the practice's `manifest.json`, so they ship through Hearth and grow as art arrives.
- Consistency counts only through practices the user chose.

### Starter cards

On first open the user picks two cards from a curated pool. They wait as envelopes with no redeeming window.

The pool — twenty-two saints long loved by the whole Church, all with art drawn:

Joseph (`joseph`) · Peter (`peter`) · Paul (`paul`) · John the Evangelist (`john_evangelist`) · Michael the Archangel (`michael_archangel`) · Augustine (`augustine`) · Benedict (`benedict`) · Francis of Assisi (`francis_assisi`) · Anthony of Padua (`anthony_padua`) · Dominic (`dominic`) · Thomas Aquinas (`thomas_aquinas`) · Catherine of Siena (`catherine_siena`) · Ignatius of Loyola (`ignatius_loyola`) · Teresa of Ávila (`teresa`) · Thérèse of the Child Jesus (`therese`) · Agnes (`agnes`) · Lucy (`lucy`) · Sebastian (`sebastian`) · George (`george`) · John Vianney (`john_vianney`) · Rita of Cascia (`rita_cascia`) · Padre Pio (`padre_pio`)

---

## Receiving

A won card arrives **sealed**: an envelope first in Today's featured carousel (several waiting form one stack). Nothing of the card shows until it's redeemed.

**Redeeming** (prototyped on the branch `prototype/holy-card-redeem`, route `ember://dev/redeem-prototype`):

1. **The envelope** — paper, a wax seal with a gold ✠, the saint's name and the date written on it, how it was won, and when it must be opened by. When the act offers several saints, the envelope lists them (for Mass, by liturgical rank) and you choose whose it is before praying. The card's holographic sheen crosses it now and then, and under a finger it tilts and shimmers: a hint of what's inside.
2. **A short introduction and the prayer**, on one page — two or three sentences written for the card (drawn from its Pictorial Lives entry), then "Let us pray" with the collect of the saint's Mass (or the card's prayer excerpt when there's none), and **Amen**.
3. **The opening** — the seal splits, the flap swings up, the card rises out shimmering and settles full-size.
4. **After** — "Read his life" under the card slides up the full Pictorial Lives entry and its reflection. The long reading comes after the reveal, as a reward rather than a toll.

Redeeming is what records a copy permanently: the copy is stored at that moment, so a growing catalog can never rewrite what an old act gave.

### Windows

| Card | Redeem by |
|---|---|
| Mass saint, Office saint, liturgical card | the end of the next day |
| Novena, season, Triduum, Ember Days, practice lineage, book | within a week |
| Starter cards | no window |

Days end at local midnight. A lapsed card is simply not received; its door brings it again the next time the act comes round.

### The back

Every copy's back states the full condition it was received under:

- *Received at Mass on his memorial, 4 Oct 2026*
- *Sunday Mass on his day, 4 Oct 2026*
- *Novena to Our Lady of Guadalupe, finished 12 Dec 2026*
- *Sundays of Lent 2027 · plan of life kept*
- An optional line for the user's intention.

### Content each card needs

- The **short introduction** (two or three sentences, both languages) — written with the card's research, faithful to its Pictorial Lives entry.
- The **prayer**: the card's `proper` collect, or its prayer excerpt.
- For a saint not on the current calendar, the **assigned day** (Martyrology date, or one we set).
- Non-saint cards (parts, objects, vestments, seasons, Ember Days) need their own introduction and prayer written.

---

## Copies

A card can be received more than once — the same saint at Sunday Mass, at her memorial, again next year. Each copy is its own object with its own back. The gallery shows one card per saint as a stack; flipping through the stack reads its history. No "×3" badge.

### Later: variants

Alternate art for the same card. A copy's print is drawn at random, preferring prints you don't hold yet — like a parish handing out whichever santinho it has. Every print is equally likely, with no rarity tiers or "rare" labels: unequal odds are what turn a surprise into a chase. The draw is seeded by the copy's id.

### Later: giving

Duplicates make giving possible. Frame it as **giving**, not trading: giving a holy card is the tradition, while a two-way trade prices cards against each other and brings back the rarity economy the design refuses. A given copy keeps its back and adds a line — *Given by Maria, 3 Dec 2026*. Needs accounts and sync; today's backend serves Mass times only.

---

## Catalog and art

A fixed, curated catalog; every collectible gets bespoke art (no text-only cards). The full list, by category and phase, is [holy-cards-catalog.md](holy-cards-catalog.md). New cards ship through Hearth like the current holy cards (data blob + image), not an app release.

## Data shape

Acts are already stored (practice completions, plan-of-life ticks, book progress). **Pending cards are derived** from the acts plus the calendar, as a pure function: the date's saints (outranked memorials included), assigned Office days, the liturgical-card draw, season windows, faithfulness windows, redeeming windows. That derivation is the logic that earns tests. **Redeemed copies are stored** — card, door, date, the back's condition line, the optional intention — with a stable id from the act (card + door + date), so a note or a future gift can point at it.
