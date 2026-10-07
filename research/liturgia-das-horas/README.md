# Liturgia das Horas

**Question.** Can the Brazilian Liturgy of the Hours be prayed in Ember from the corpus, by an engine of our own that gives, hour for hour, what the breviary app its text was drawn from gives?

**Answer.** Yes for every hour of 2020–2040, which is as far as that app was ever run: 61,368 hours and the 8,849 second offices a memorial allows, none different. The result is `content/loth/`, `packages/loth` and the importer in `scripts/loth/`.

## What there was to work from

The archive (`liriocatolico.com.br/liturgia_horas.zip`, not in this repo) holds three things:

- the JavaScript of the app, which builds an hour by choosing one HTML file out of some four thousand and then rewriting it in place (a memorial is the weekday's file with the saint's hymn, reading and prayer cut in);
- a harness that runs that code under a fake runtime, for every day of 2020–2040, and stores the HTML of each hour in parquet under a key of sixteen liturgical coordinates;
- the site built from it, `liriocatolico.com.br/liturgia_horas/`.

The four thousand files themselves are not in it. So the only form the text exists in is the *assembled hour*: 7,106 distinct ones, 144 MB of HTML, in which Psalm 94 occurs some thousands of times.

## What was built instead

Not a port. The app's code was read to learn what an hour depends on and was never run, translated or kept.

**The day** (`packages/loth/src/day.ts`, `office.ts`). The year is reckoned by `temporalDay`, which the Mass uses too. On top of it: the week of the psalter, the calendar of the Brazilian breviary (`content/loth/calendar.json`), which celebration keeps a day, and whether an evening already belongs to tomorrow. Written from the General Instruction and the breviary's own habits, then held against the archive's calendar for all 7,671 days until nothing differed.

**The text** (`scripts/loth/normalize.ts`, `slots.ts`). Each hour's HTML becomes blocks of lines with five marks (rubric, verse number, note, bold, italic), and is cut line by line into slots at the titles and labels the book prints: what opens the hour (one slot to each kind of line), the opening versicle, hymn, each antiphon, each psalm, each psalm-prayer, reading, responsory, Gospel canticle and its antiphon, intercessions, prayer, conclusion. The cut reads the words, not the markup: the source loses a red label in one hour and runs a psalm into its antiphon in another, and if the cut followed that, a saint's day would seem to have psalms of its own. Parts with the same letters and digits are one part: 10,109 of them, 13 MB.

**The layers** (`scripts/loth/layers.ts`, `packages/loth/src/index-types.ts`). For each slot of each hour, a part is filed under the coordinates of the day that are enough to tell it, in four tiers that are the book's own: the season (Ordinary, Psalter, Proper of Time), the rank (what any solemnity or memorial brings), the Common, the celebration. Which coordinates a slot may depend on is written down, not found: left to itself the data decides, from a handful of days, that a saint's psalms follow the Sunday cycle. A rank or a Common gives what most of its celebrations have, each of them always; the few with something of their own say so in the tier above. The engine looks a slot up from the most particular tier down.

In 21 years, six parts are told by no layer and are filed under their whole day. The 16 hours laid out unlike any other (the Easter Vigil's readings) are kept whole.

## How it is checked

- `packages/loth/src/__tests__/reference.test.ts`: every hour of every day of 2020–2040, and the second office of every memorial, assembled from `content/loth/` by the engine and compared with a hash of the letters and digits of the archive's HTML. The calendar likewise, day by day.
- `scripts/loth/compare-site.ts`: the same against the day files the site serves (2020–2030): 32,144 hours and 2,695 second offices, none different. Seven days fetched from the live site on 2026-10-06 agreed too.
- `scripts/loth/import.ts --holdout 2035 [--misses]`: the layers built from 2020–2034 alone, asked for the days of 2035–2040 of a kind they had never met. Of 4,983 such hours (the Invitatory aside, which counts each of its psalms), 84 differ: 98.3%, where the first cut of the corpus gave 95–99% by hour and 274 misses in all. `--misses` prints each with the slot that differs and the layer that answered. What is left is of three kinds: a text those years never had (the antiphon of a Sunday that falls before Lent only when Easter is late); a saint met in a season for the first time, whose antiphons change there in no regular way; and the hymn of a little hour on a memorial, which the source chooses by the day of the psalter with exceptions of its own.
- So after 2040 it is not 100%: a day of a kind 2020–2040 never had may read differently from the book. The app says so above any hour outside those years.
- `beyond.test.ts`: every hour of 2041–2050 still assembles into an hour.

## Where the archive itself is doubtful

Agreeing with the archive is not always being right. On 6 October (Saint Bruno, Ordinary Time) the archive ends the antiphon of the Benedictus "…que em vós há de falar. Aleluia.", and on other days of Ordinary Time gives the same antiphon of the same Common without it. `liturgiadashoras.online`, a second transcription of the same edition kept by hand and indexed by liturgical day (its WordPress API lists some 3,400 hours), has it without "Aleluia" outside Easter time and with it inside. The corpus keeps what the archive has; the cases are not yet listed.

## What differs from the app, on purpose

- **The Invitatory** is not an hour of its own but folded at the head of the Office of Readings and of Lauds, with its four psalms as a choice. The corpus also holds each psalm without the antiphon repeated between strophes; nothing offers it yet.
- **A memorial's second office** is offered at the Office of Readings, Lauds and Vespers. At the other hours the two are the same text but for 34 days in 21 years.
- **Only the first** of two optional memorials on one day has a text: the archive never asked the app for the second.

## What the calendar disagrees with the Mass about

`content/loth/calendar.json` is the calendar the Brazilian breviary is printed with, and it is not yet the one `content/missal/` gives Brazil:

- Saints Peter and Paul, the Assumption and All Saints are kept on a Sunday in Brazil; the missal keeps them on their dates.
- Saint Joseph on a Sunday of Lent goes back to the Saturday in the breviary, forward to the Monday in the missal.
- Our Lady of Mount Carmel, Saint Rose of Lima and Our Lady of Guadalupe are feasts in Brazil; Saints Ephrem, Augustine Zhao Rong and Pontian give their dates to Saint José de Anchieta, Saint Paulina and Saint Dulce.
- The missal has a dozen recent optional memorials the breviary has no text for.

Where the same celebration is in both, it has the same id. Bringing the missal's Brazilian calendar into line is the Mass's work to do; until then the two can name a day differently.

## Running it again

```bash
python3 scripts/loth/dump.py <archive>/liturgia_horas_motor/parquet /tmp/dumps   # needs pyarrow
npx tsx scripts/loth/import.ts /tmp/dumps            # content/loth/{index,parts,extras.json} and the tests' reference
npx tsx scripts/loth/import-library.ts /tmp/dumps    # content/loth/library/
npx tsx scripts/loth/compare-site.ts <archive>/liturgia_horas/dados
```

`content/loth/calendar.json` is edited by hand; the importer reads it and does not write it.
