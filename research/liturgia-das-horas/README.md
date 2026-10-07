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

**The text** (`scripts/loth/normalize.ts`, `slots.ts`). Each hour's HTML becomes blocks of lines with five marks (rubric, verse number, note, bold, italic), and is cut into slots by the titles and red labels the book prints: hymn, each antiphon, each psalm, each psalm-prayer, reading, responsory, Gospel canticle, intercessions, prayer, conclusion. A part is stored once however many hours it is prayed in: 13,570 parts, 15 MB.

**The layers** (`scripts/loth/layers.ts`, `packages/loth/src/index-types.ts`). For each slot of each hour, the importer asks which coordinates of the day are enough to tell its part: the psalter week and weekday; the season; the week of the season; the date; the celebration. It files the part under every set of coordinates that is enough and needs nothing more, as far as all 21 years can show. The engine looks a slot up from the most particular layer down. This is the book's own order (Ordinary, Psalter, Proper of Time, Proper of Saints), found from the data rather than typed in, and it is what lets a saint's day be assembled on a psalter day it never fell on in those years.

The 18 hours laid out unlike any other (the Easter Vigil's readings) are kept whole.

## How it is checked

- `packages/loth/src/__tests__/reference.test.ts`: every hour of every day of 2020–2040, and the second office of every memorial, assembled from `content/loth/` by the engine and compared with a hash of the letters and digits of the archive's HTML. The calendar likewise, day by day.
- `scripts/loth/compare-site.ts`: the same against the day files the site serves (2020–2030): 32,144 hours and 2,695 second offices, none different. Seven days fetched from the live site on 2026-10-06 agreed too.
- `scripts/loth/import.ts --holdout 2035`: the layers built from 2020–2034 alone, asked for the days of 2035–2040 of a kind they had never met. Between 95% (Office of Readings, Lauds, Vespers) and 99% (the little hours) of those come out exactly as the archive has them. With all 21 years filed the share after 2040 will be higher, but it is not 100%: a day of a kind 2020–2040 never had may read differently from the book. The app says so above any hour outside those years.
- `beyond.test.ts`: every hour of 2041–2050 still assembles into an hour.

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
