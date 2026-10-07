# Liturgia das Horas

**Question.** Can the Brazilian Liturgy of the Hours be prayed in Ember from the corpus, by an engine of our own that gives, hour for hour, what the breviary app its text was drawn from gives?

**Answer.** Yes for every hour of 2020–2040, which is as far as that app was ever run: 61,017 of the 61,368 hours of those years and some 8,100 second offices a memorial allows are the archive's, none different; the other 351 hours, and the second office of a saint who may only be commemorated, are where the archive goes against the book's own rules (below), and there the corpus follows the rule. The result is `content/loth/`, `packages/loth` and the importer in `scripts/loth/`.

## What there was to work from

The archive (`liriocatolico.com.br/liturgia_horas.zip`, not in this repo) holds three things:

- the JavaScript of the app, which builds an hour by choosing one HTML file out of some four thousand and then rewriting it in place (a memorial is the weekday's file with the saint's hymn, reading and prayer cut in);
- a harness that runs that code under a fake runtime, for every day of 2020–2040, and stores the HTML of each hour in parquet under a key of sixteen liturgical coordinates;
- the site built from it, `liriocatolico.com.br/liturgia_horas/`.

The four thousand files themselves are not in it. So the only form the text exists in is the *assembled hour*: 7,106 distinct ones, 144 MB of HTML, in which Psalm 94 occurs some thousands of times. One text is the exception: the Sunday's antiphon of the Gospel canticle, which the app keeps in a table by year of the cycle and sets into the hour only as it is shown (`dump.py` reads the table).

## What was built instead

Not a port. The app's code and the harness were read to learn what an hour depends on (which celebration keeps a day, which evenings are tomorrow's) and were never run, translated or kept.

**The day** (`packages/loth/src/day.ts`, `office.ts`). The year is reckoned by `temporalDay`, which the Mass uses too. On top of it: the week of the psalter, the calendar of the Brazilian breviary (`content/loth/calendar.json`), which celebration keeps a day, and whether an evening already belongs to tomorrow. Written to the cases the harness distinguishes and held against the archive's calendar for all 7,671 days until nothing differed; it has not been derived afresh from the General Instruction (the archive has it, `000InsGeralLH.pdf`), which is the way to settle a case the two sources leave open.

**The text** (`scripts/loth/normalize.ts`, `slots.ts`). Each hour's HTML becomes blocks of lines with five marks (rubric, verse number, note, bold, italic), and is cut line by line into slots at the titles and labels the book prints: what opens the hour (one slot to each kind of line), the opening versicle, hymn, each antiphon, each psalm, each psalm-prayer, reading, responsory, Gospel canticle and its antiphon, intercessions, prayer, conclusion. The cut reads the words, not the markup: the source loses a red label in one hour and runs a psalm into its antiphon in another, and if the cut followed that, a saint's day would seem to have psalms of its own. Parts with the same letters and digits are one part: 10,105 of them, 13 MB.

**The layers** (`scripts/loth/layers.ts`, `packages/loth/src/index-types.ts`). For each slot of each hour, a part is filed under the coordinates of the day that are enough to tell it, in four tiers that are the book's own: the season (Ordinary, Psalter, Proper of Time), the rank (what any solemnity or memorial brings), the Common, the celebration. Which coordinates a slot may depend on is written down, not found: left to itself the data decides, from a handful of days, that a saint's psalms follow the Sunday cycle. A rank or a Common gives what most of its celebrations have, each of them always; the few with something of their own say so in the tier above. The engine looks a slot up from the most particular tier down.

**The rule** (`packages/loth/src/rules.ts`). Before any layer is asked, the General Instruction says whose the part is. On a memorial the psalms and their antiphons, the first reading of the Office of Readings, and the whole of the little hours and of Night Prayer are the weekday's (arts. 235–236); on a saint's feast the psalms of the little hours and the whole of Night Prayer (arts. 231–233). Such a part is looked up as the weekday's, with the saint left out of the question, and the importer files the saint's day there as one more sight of that weekday. The exceptions are the book's and are named: the six memorials with antiphons of their own, Saint Barnabas and the Guardian Angels with their own little hours, the six feasts that say the weekday's psalms under one antiphon. A saint's own part may go by the season and by falling on a Sunday, nothing else; only Saint Mary on Saturday takes her texts in turn. See "Whose each part is" below for what this found.

In 21 years, six parts are told by no layer and are filed under their whole day. The 16 hours laid out unlike any other (the Easter Vigil's readings) are kept whole.

## How it is checked

- `packages/loth/src/__tests__/reference.test.ts`: every hour of every day of 2020–2040, and the second office of every memorial, assembled from `content/loth/` by the engine and compared with a hash of the letters and digits of the archive's HTML. The calendar likewise, day by day.
- `scripts/loth/compare-site.ts`: the same against the day files the site serves (2020–2030): 31,951 hours and 2,321 second offices, none different (the hours the corpus has otherwise than the archive are left out). Seven days fetched from the live site on 2026-10-06 agreed too.
- `beyond.test.ts`: every hour of 2020–2050 is whole. It has what an hour of its kind never goes without (psalmody, reading, Gospel canticle with its antiphon, intercessions, prayer), and no part is a label with nothing after it. This is the check that found the archive's own gaps.
- `supplied.test.ts`: the texts the archive lacks or has wrong, by name, each as `liturgiadashoras.online` has it.
- `scripts/loth/import.ts --holdout 2035 [--misses]`: the layers built from 2020–2034 alone, asked for the days of 2035–2040 of a kind they had never met. Of 4,723 such hours (the Invitatory aside, which counts each of its psalms), 16 differ: 99.7%, where the layers alone gave 69 and the first cut of the corpus 274. `--misses` prints each with the slot that differs and the layer that answered. All 16 are days the engine itself marks as unchecked: a saint met in a season for the first time (an antiphon that gains "Aleluia" in Easter time, a rank the archive prints in one season and not another). One hymn for the other where the book lets either be said is not counted a miss.
- So after 2040 it is not 100%: a day of a kind 2020–2040 never had may read differently from the book. The app says so above any hour outside those years.

## A second source

`liturgiadashoras.online` is a second transcription of the same breviary, kept by hand, one post to an hour (its WordPress API lists some 3,400). `scripts/loth/compare-second.ts` cuts each post into the same slots and sets it beside the engine's hour for the day. It is a witness, not an authority: it follows a later printing in places (the Gospel canticles, the doxology), keeps the spelling of before 2009, has slips of its own, and a post written for one year is often served again in another with the wrong year's antiphon. Fifteen of 3,256 hours agree word for word; the rest differ in some 2,600 distinct places, nearly all of them the edition, the spelling, or what one of the two sets out in full (the doxology, the response after each intercession, both hymns of a little hour).

It is used for two things. Where the archive has *nothing* and it has a text, the text can be taken from it. Where the archive has a text and it has another, the archive is kept unless the book's own rule, or the archive's other hours, show which is the slip.

## Where the archive is at fault, and what the corpus has instead

- **The Sunday's antiphon of the Gospel canticle** is blank in every generated hour of Advent, Lent, Easter, Palm Sunday and the Holy Family (a label and nothing after: some 900 hours in 21 years). The importer supplies it from the archive's own table, and files from the same table the Sundays of Ordinary Time that 2020–2040 never had in a given year of the cycle. Against the second source, wherever its post names the year: 118 the same, 6 different, each of the 6 a slip or a misdated post of its own.
- **From 17 December the Magnificat has the antiphon of the date**, on a Sunday as on any day. The archive leaves it blank on those Sundays and their eves, and on two evenings has it a day late ("Ó Adonai" on a Sunday that is the 17th, "Ó Emanuel" on a Saturday that is the 22nd). The corpus has the antiphon the weekday of that date has, as the second source does.
- **Second Vespers of Christ the King** stop after the responsory. The rest is as at first Vespers, whose intercessions and prayer the second source also gives for the second; the antiphon of the Magnificat, which the archive has nowhere, is the second source's.
- **Misspellings** (`scripts/loth/corrections.ts`: six words, and a letter typed for the figure one in five citations) are put right in the archive's HTML before anything reads it, so the reference is the archive as corrected.
- **A title run into the line beside it** ("em latim" and then "Oração", a responsory's last word and then "Hino", "Segunda leitura" after the end of the first) is cut as a title. The words are the archive's; the prayer is no longer filed with the intercessions.

Parts that were supplied are bundled apart (`parts/supplied-*`), the engine marks them, and the reference test takes them out again before comparing, so the rest of each such hour is still held to the archive.

## Other editions

`ibreviary.com` serves the Latin *editio typica*, Portugal's Portuguese and the American English for any date (a POST sets the day, as `apps/app/src/sources/ibreviary/session.ts` does). The words are another translation, but what an hour is made of is not: its psalms and the citation of its reading are the same book. All of 2026 and 2041 in Latin, and 17 December to 13 January of 2042–2050, were set beside the engine's hours by the numbers of the psalms and of the reading.

It is a rough witness. It keeps the weekday on most saints' days, has the general calendar (the Epiphany on 6 January, Corpus Christi on its Sunday), and is plainly wrong in places of its own (Good Friday's Psalm 53 as 52; the fourth week's Friday reading at Sext as the second's on memorials; the Sundays of 17–24 December). So each difference was read, not counted. Of some 250 in each year, all but the following were its calendar or its slips:

- **A fault of the engine after 2040.** On Friday 11 January 2041 the Office of Readings had Saturday's first reading. 11 January fell on a Saturday in every year I of 2020–2040, and a layer filed by "date, weekday or Sunday, year of the readings" outweighed the one filed by date and weekday. A year of the readings is now filed straight after the layer it divides (`layers.ts`).
- **A second of the same kind**, found by then asking of every part of 2041–2050 whether two layers no less particular than each other disagree: at Lauds of the Sunday that is 22 December, the antiphon of the Benedictus came in year C's wording in a year B, the date having met a Sunday only in years C. The fourth Sunday's antiphon is now filed by date and year from the archive's table for 18–23 December. Every 17–24 December to 2099 now has one antiphon to each rule: the date's at Vespers and on weekdays, the Sunday's by its year at Lauds, the date's on a Sunday that is the 17th or the 24th.
- **Slips of the archive's**: a letter typed for the figure one in a citation ("lCor", "ICor", "IPd", "ISm", "PG 6l"), now in `corrections.ts`.

It also settled two questions that were open: the Latin and Portugal's have "O Sapientia" at Vespers and the antiphon of the 17th at Lauds on Sunday 17 December 2023, as the corpus does; and all three editions have "All power in heaven and on earth has been given to me" at second Vespers of Christ the King.

## Against the book's rules

The General Instruction of the Liturgy of the Hours (in the archive as a PDF) says what each hour is made of; the Universal Norms on the Liturgical Year say which celebration has a day or an evening. Every day of 2020–2040 was checked against both: where an impeded solemnity lands, every evening against the table of precedence, the psalms of Lauds, the little hours and Compline by rank, the Te Deum, the verse that opens an hour. Where the archive goes against them the corpus follows the rule, the importer learns nothing from the archive's hour (`scripts/loth/departures.ts`), the reference holds no hash for it, and `norms.test.ts` holds it to the rule instead.

- **Saint Joseph** is kept the Monday after when 19 March is a Sunday of Lent (2023, 2028, 2034; the archive has the Saturday before, the norm of before 1990), and the Saturday before Palm Sunday when it falls in Holy Week (2035; the archive leaves him out).
- **All Saints on a Saturday** (2025, 2031, 2036) has its own second Vespers, where the archive has first Vespers of a Sunday that is not kept, and the complementary psalms at the little hours, where the archive has the Sunday's Psalm 117 (art. 229). iBreviary's Latin has the Sunday's Vespers too, and is wrong with the archive: the CNBB's directory for 2025, as the archdiocese of Rio's circular gives it, has the solemnity "with second Vespers included", and so do the guides for the United States.
- **"Aleluia" ends the verse that opens an hour except in Lent** (art. 79). The archive's hours of the saints had it the other way some 1,170 times in 21 years, and "(T.P. Aleluia)" as if it were Easter's alone. It is set by the season in the archive's HTML before anything reads it, so the reference is the archive as corrected.
- **A memorial in Lent, on 17–24 December or in the octave of Christmas is only commemorated** (arts. 237–239): every hour is the weekday's, the Invitatory too, and the second office offered is the weekday's with the saint added (his reading and responsory after the second reading and his prayer to end the Office of Readings; his antiphon and prayer after the concluding prayer of Lauds and Vespers). The archive lays out a whole memorial there, as in Ordinary Time, without the Te Deum in the octave. The saint's parts are still the archive's.

Found in conformity: the Immaculate Conception on a Sunday that is 8 December (Brazil's own practice), the Annunciation's transfers, the Baptist on 23 June when the Sacred Heart has the 24th, every other evening of the 21 years, and the make-up of the hours by rank. Left as the archive has them, the rule being open to two readings: the whole office of the dead on a Sunday that is 2 November; first Vespers of the Sacred Heart the evening of the Baptist (2022, 2033), and of All Saints the evening of All Souls (2024, 2030), where the two rank alike.

## Whose each part is

The layers were first left to find where a saint's day takes the weekday's text, and found it by coincidence as often as by rule: a saint who fell four times on a Tuesday had "his" psalm. Predicting 2035–2040 from 2020–2034 missed 69 hours that way. The General Instruction decides it now (`rules.ts`, above), and the archive is only the test. Held against the archive's 21 years, the rule and the archive part in 351 − 339 = 12 more hours of the first office and a few dozen second offices; the importer prints each (`import.ts --check --against`), writes no hash for those whose words differ, and `norms.test.ts` holds the rule on the years after the reference.

- **The collect of a psalm said in two sections** (Thursday of week III, Office of Readings) stands after the second; on three saints' days the archive has it after the first.
- **Night Prayer on the Saturday of a solemnity whose Vespers are the Sunday's first** is the Sunday's first too. The archive has it so for Saint Joseph and the Annunciation in Lent, and not for the Immaculate Conception (2029, 2035, 2040), where it gives the Sunday's Vespers and the solemnity's night.
- **Saint Raymond's and the Holy Name's Office of Readings** (7 and 3 January) come in the archive with the first reading before the verse and the collect that lead to it. They are put together like any other memorial's.
- **A feast with an antiphon of its own at the little hours** (the Conversion of Saint Paul, the Transfiguration, the Nativity of Mary, the Exaltation of the Cross, the Archangels, Guadalupe) says the weekday's psalms under that one antiphon. The archive prints the three sections of a long psalm as one there; the corpus keeps them as the weekday has them, the numeral over each section now cut with the section and not with the antiphon before it.
- **Night Prayer of a saint's feast** is the weekday's. On Saint Andrew's Saturday (2024, 2030) and the Chair of Peter (2027, 2035) the archive's differs in the hymn it picks or prints.
- **A memorial's Saturday evening** is the Sunday's, and no saint is offered there (23 December).

**Where the book leaves a choice.** The Ordinary gives each little hour and Night Prayer two hymns. The archive prints one, by the weekday on ordinary days and by no rule that could be found on feasts, and both with "Ou:" at Night Prayer in Ordinary Time. The corpus offers both everywhere the two belong (`choices` in an hour's index, a picker in the app), opened on the one the archive prints that day, which is what the reference still checks. What a memorial has not of its own is taken "from the Common or from the current weekday" (art. 235). The archive always takes the Common, and that is the saint's office here; a third office, "Memória com os textos da féria", is the same with the weekday's hymn, short reading and responsory, antiphon of the Gospel canticle and intercessions wherever the saint's are his Common's, and without the Common named over the hour. A part is the saint's own when it is filed under him and is neither what a layer of a Common gives nor a text of the Commons in `library/offices.json`, known by its first words (the importer lists these as `ofTheCommons` in an hour's index). Taking a Common's text for a saint's own only leaves the Common's where the weekday's might be; the other mistake would drop a proper text, so the test leans to the first. Nothing in the archive is this office, so only its rule is tested (`norms.test.ts`). Not offered: a second Common where the book names two (22 saints, "dos pastores, e doutores da Igreja"); the archive prints one set of texts and nothing says which parts would change.

More slips of the archive's met on the way and put right in `corrections.ts`: the name of a source file ("3 janeiro") left in the middle of the Office of Readings, "a sua graça a sua bênção" for "e sua bênção", "agor a e sempre", the versicle that opens an hour typed "V./R." or short of a comma or of the full stop after "Aleluia".

## What is still open

- `variants.tsv` (`scripts/loth/variants.py`): 473 places where the archive has one text in two wordings, each with how often it is used and whether the second source has it. 177 have one wording there and not the other; that is a witness, not yet a verdict (it reads "A minha alma engrandece ao Senhor" where the archive has "A minh'alma engrandece o Senhor", which is the printing, not a slip). None of these is corrected yet.
- On 6 October (Saint Bruno, Ordinary Time) the archive ends the antiphon of the Benedictus "…que em vós há de falar. Aleluia."; the second source has "Aleluia" only in Easter time. Kept as the archive has it.

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
python3 scripts/loth/dump.py <archive>/liturgia_horas_motor/parquet /tmp/dumps   # needs pyarrow; reads ../fonte_js/lib/gx.js too
npx tsx scripts/loth/import.ts /tmp/dumps            # content/loth/{index,parts,extras.json} and the tests' reference
npx tsx scripts/loth/import-library.ts /tmp/dumps    # content/loth/library/
npx tsx scripts/loth/compare-site.ts <archive>/liturgia_horas/dados
npx tsx scripts/loth/compare-second.ts <posts>       # the second source; the API call is in the file's head
python3 scripts/loth/variants.py <posts> > research/liturgia-das-horas/variants.tsv
```

`content/loth/calendar.json` is edited by hand; the importer reads it and does not write it.
