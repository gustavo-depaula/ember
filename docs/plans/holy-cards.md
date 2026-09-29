# Holy Cards

> A missal full of *santinhos*, each one a moment you actually lived.

The collectibility layer for the saints gallery (Devotion pillar, Engagement track #302). Today `isCollected` in `apps/app/src/features/saints/data/collection.ts` means "has art"; this design replaces that seam.

---

## Principle

Holy cards are **given, not earned** — at a First Communion, a funeral, a feast. A card marks a real act of the Church's life (Mass, a season kept, a practice kept faithfully), never app activity. The act is the point; the card remembers it.

It must feel like a missal, not a game:

- **Nothing is gated.** Every Life, prayer, and explanation stays readable whether or not you hold the card. A card marks a relationship, not access.
- **Nothing is lost.** Cards never expire or decay. A missed season or feast simply returns next year.
- **No points, ranks, or percentages.** No "37/120".
- **No farming.** At most one card per Mass; app time and opens never count.
- **Every card is holographic.** Copies differ by their back — the record of how and when each was received — not by rarity.
- **No odds to chase.** Which card you receive always follows from the act. Only the print of a copy may be random, and every print is equally likely.

---

## Doors

| Act | Card |
|---|---|
| Mass on a saint's feast or memorial | That saint |
| Sunday Mass | The next Roman Canon saint (unheld first) |
| Weekday Mass with no feast | The next part or object of the Mass |
| A season's Sundays, all attended | That season's Sunday card |
| A season's weekdays, attended faithfully | That season's weekday card |
| All three Triduum liturgies | The Triduum card |
| A practice kept faithfully | The next saint in that practice's lineage |
| Finishing a saint's book | That saint (e.g. *Story of a Soul* → Thérèse) |
| Setup | Baptismal and confirmation saints |

Praying at home never mints a feast card — feast cards need actual Mass.

### Mass check-in

An honor-system "I was at the liturgy" on Today and on the Mass screen, recorded per date. "Liturgy", not "Mass": Good Friday has no Mass. It must be distinct from completing `practice/mass`, which means reading the Mass in-app — otherwise reading at home would silently count as attending.

### One card per Mass, in precedence

When several per-Mass doors are due on the same day: **feast saint → Canon saint → Mass part/object**. Season cards are outside this rule (below).

### Roman Canon saints (Sundays)

Sunday gives the next Canon saint, ordered by *upcoming feast*, so the card arrives just before the saint's day: the Sunday before 22 November gives Cecilia — "her memorial is Saturday." Saints not yet held come first; if you already received her at her memorial Mass, Sunday prefers someone new. Once every Canon saint is held, the cycle repeats and Sundays keep giving copies.

The list must come from the Missal's Eucharistic Prayer I — it is not in the repo yet.

### Parts and objects of the Mass (weekdays)

Dealt in the order of the Mass, cycling back to the entrance once complete — entrance, Kyrie, Gloria, readings, homily, Creed, offertory, Sanctus, consecration, Our Father, Agnus Dei, communion, dismissal — interleaved with the object each part uses (thurible, ambo, chalice, paten, …). Weekday Mass slowly catechizes the Mass start to finish; each back explains the part's meaning. Source the order from the Order of Mass in `practice/mass`, not from memory.

### Seasons

One shared set, with season boundaries from `resolveOfDay` for every user regardless of the form they attend:

Advent · Christmas · Lent · Easter · Ordinary Time I (after Christmas) · Ordinary Time II (after Pentecost) — each with a **Sunday** and a **weekday** card — plus the **Triduum** card and the rose cards for **Gaudete** and **Laetare**.

- **Sunday card:** Mass on every Sunday of the season (Lent includes Palm Sunday; Easter includes Pentecost). No excuse mechanism: a missed Sunday means the card waits for next year.
- **Weekday card:** weekday Mass faithfully through the season (threshold TBD: ~2/3 of weekdays, or at least one per week).
- **Triduum:** Holy Thursday, Good Friday, and the Easter Vigil.
- Granted the day after the season closes ("Advent is over — you were at Mass every Sunday"), so they never compete with that day's per-Mass card.
- Keeping the plan of life through the season adds a *Kept Lent 2027* line to the card's back.
- **Progress is visible during the season** as a quiet row of Sunday dots on the season card.

### Practice lineages (faithfulness)

Each practice carries an ordered **lineage** — the saints who taught, spread, or lived it (Rosary → Dominic, then others who championed it; examen → Ignatius, then his companions; pairings to be sourced, not recalled). Each faithful window grants the next saint in the lineage, so a long-kept practice keeps introducing the people behind it.

- Kept faithfully = **~20 of its last 30 scheduled occurrences**, measured against the slot's `schedule` (`apps/app/src/db/events/state.ts`), so a daily practice and a weekly one each get a fair window with no per-practice setting. Not user-tunable — a tunable threshold gets tuned until the card drops.
- The next card needs a fresh window after the last grant — windows don't overlap. After the lineage's last saint, it starts over with copies.
- Lineages live in the practice's `manifest.json`, so they ship through Hearth and grow as art arrives.
- This is the main door for people who pray at home but attend only Sunday Mass: most sanctoral saints need weekday Mass, and a Sunday-only user would otherwise plateau once the Canon and Mass pools run out. - Consistency counts only through practices the user chose.

---

## Copies

A card can be received more than once — the same saint at Sunday Mass, at her memorial, again next year. Each copy is its own object with its own back, the record of the act that brought it:

- *Received at Mass, 1 Oct 2026*
- *Sunday before her memorial, 16 Nov 2026*
- *20 of 30 days of the Rosary, Sep 2026*
- *Sundays of Lent 2027 · plan of life kept*
- An optional line for the user's intention.

The gallery shows one card per saint as a stack; flipping through the stack reads its history. No "×3" badge.

### Later: variants

Alternate art for the same card. A copy's print is drawn at random, preferring prints you don't hold yet — like a parish handing out whichever santinho it has. Every print is equally likely, with no rarity tiers or "rare" labels: unequal odds are what turn a surprise into a chase. The draw is seeded by the copy's id, so deriving the collection stays deterministic.

### Later: giving

Duplicates make giving possible. Frame it as **giving**, not trading: giving a holy card is the tradition, while a two-way trade prices cards against each other and brings back the rarity economy the design refuses. A given copy keeps its back and adds a line — *Given by Maria, 3 Dec 2026*. Needs accounts and sync; today's backend serves Mass times only.

---

## Catalog and art

A fixed, curated catalog; every collectible gets bespoke art (no text-only cards). The full list, by category and phase, is [holy-cards-catalog.md](holy-cards-catalog.md). New cards ship through Hearth like the current holy cards (data blob + image), not an app release.

## Data shape

Store only the acts — liturgy check-ins (existing: completions, book progress) — and **derive** the copies as a pure function of them plus the calendar. Each copy gets a stable id from its act (card + door + date), so a note or a future gift can point at it. The derivation (precedence, Canon ordering, cycling, season windows, faithfulness windows) is the logic that earns tests. Intention notes — and later, gifts — are the only copy-specific state.

## Open

- The receiving moment — animation at check-in vs. silently appearing in the gallery. Ask before designing.
- Weekday season threshold.
- Whether optional memorials count as feast doors.
- How the four Ember Days cards are received (e.g. Mass, or fasting kept, on the three days of the week). Their dates come from the Divinum Officium missal, not from `resolveOfDay`.
