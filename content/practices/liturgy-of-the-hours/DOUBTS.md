# Liturgy of the Hours (Brazil): what is not certain

The hours are assembled by `@ember/loth` from `content/loth/`. How it was built and how it is checked is in `research/liturgia-das-horas/README.md`; this file is only the list of what could still be wrong, so that whoever prays from it or works on it knows where to look.

## What can be relied on

From 2020 to 2040 every hour is word for word what the Lírio Católico archive prints, or is one of the departures written out in the README ("Against the book's rules"), each with the article of the General Instruction behind it. The reference test holds this hour by hour.

## It has never been read against the printed book

The archive is a transcription of the breviary, and everything here rests on it. Where it is wrong in a way no rule and no second source shows, the corpus is wrong with it.

- **473 texts in two wordings.** The archive prints the same psalm, antiphon or prayer one way on some days and another way on others, mostly by a word or a comma. The corpus shows each day what the archive shows that day, so one of the two is probably wrong wherever it appears. They are listed in `research/liturgia-das-horas/variants.tsv`; 177 have one wording and not the other in the second source, which is a witness and not a verdict. Only the book settles them.
- **Saint Bruno (6 October).** The antiphon of the Benedictus ends "…que em vós há de falar. Aleluia." in Ordinary Time, where the second source has "Aleluia" in Easter time only. Kept as the archive has it.
- **Three malformed citations of Scripture** are kept as the archive has them.

## Days where the rule can be read two ways

Left as the archive has them, because the norms do not clearly say otherwise:

- **2 November on a Sunday**: the whole office of the dead is said, not the Sunday's.
- **The evening of the Birth of John the Baptist before the Sacred Heart** (2022, 2033): first Vespers of the Sacred Heart.
- **The evening of All Souls when All Saints follows it** (2024, 2030): first Vespers of All Saints, the two ranking alike. The next is 2 November 2030.

## Where the corpus goes against the archive

Each of these follows the General Instruction over the archive, and is held by `norms.test.ts`, not by the reference. If the reading of the rule is wrong, these hours are wrong:

- Saint Joseph's transfer out of a Sunday of Lent or Holy Week.
- All Saints on a Saturday keeping its second Vespers (confirmed by the CNBB's directory for 2025; iBreviary's Latin disagrees).
- Compline on the Saturday of a solemnity that yields its evening to the Sunday (the Immaculate Conception in 2029, 2035, 2040).
- Memorials in Lent, on 17–24 December and in the octave of Christmas reduced to a commemoration.
- "Aleluia" on the opening verse by season.
- The parts of a memorial or a feast that are the weekday's (little hours, Compline, psalmody), where the archive now and then prints something else.

## Offices the archive never prints

- **"Memória com os textos da féria"** (a memorial with the weekday's hymn, reading, canticle antiphon and intercessions in place of the Common's, art. 235). There is nothing to compare it with. Whether a part is the saint's own or his Common's is told by whether its opening words are found in the stored Commons; a part judged wrongly would keep the Common's text where the weekday's was meant, or drop a proper one. The label itself is ours, not the book's.
- **The second hymn of a little hour and of Compline** on days when the archive prints only one: both are offered, the archive's first.
- **A second Common is not offered.** Twenty-two saints name two (pastors and doctors, say); the archive prints one set of texts and nothing says which parts the other would change.

## The engine is not built from the rubrics alone

The rules decide the day, whose evening it is, which office is offered and whose each part is on a saint's day. Which text fills each place is learned from the 21 years of the archive: the importer works out what each part depends on (season, week, weekday, psalter week, date, celebration), and the engine looks it up by those keys.

- Inside 2020–2040 this is exact, being checked against what it learned from.
- **After 2040 it is a prediction.** Learning from 2020–2034 and predicting 2035–2040, 16 of 4,723 hours differ (0.3%), all of them days the engine marks as unchecked: a saint met in a season for the first time, a rank the archive prints in one season and not another.
- An engine that could be trusted without end would need the book's own tables (proper of seasons, psalter, proper of saints, Commons) and the rubrics choosing among them. The archive is not laid out that way.

## The calendar

The saints' days are the breviary's, not the Brazilian missal's, so the hours and the Mass can name different celebrations on the same day (README, "What the calendar disagrees with the Mass about").
