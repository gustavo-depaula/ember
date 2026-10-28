# Missale Romanum

Could the Ordinary Form Mass in Ember be rebuilt from a single source of its texts, with the selection of a day's texts expressed as data plus a small resolver?

## Where things stand

Graduated, and closed. The missal lives in `content/missal/` and is maintained there; the calendar and the assembly of a day's Mass are `packages/missal` (`@ember/missal`); the app's Mass is `apps/app/src/sources/missal/`.

The corpus was imported once from the Cordova app at `github.com/pedropasinn/Missale_romanum` (commit `be8004c`). The importer did its work and was removed; it is in this repository's history under `scripts/missal/`, last present in the commit before "Missal: the corpus stands on its own". Nothing in the repository reads that app any more.

## What the import settled

- **Texts:** every passage was carried over, in seven languages, as ordered items tagged by part, lectionary cycle and alternative. The import was checked to lose no text.
- **Calendar:** the source app chose texts with a chain of date branches and a switch on day and month. Ember keeps the table of saints that switch yields and resolves a day with its own code: regions, the Table of Liturgical Days, the transfer of impeded solemnities. `packages/missal/src/__tests__/reference-calendar.json` is what the source app selected for every day of 2020-2040, and the tests name each place the two differ and why.
- **Assembly:** the proper of the celebration first, then the common it draws on, then the day; a memorial reads the weekday unless its readings are proper.
- **Vocabulary:** the source's element ids, style classes and precedence codes were translated to named tags, roles and the numbers of the Table.

## Days that do not fit the part vocabulary

On these days most of the rite is not one of the standard parts of a Mass, so the day's own sequence is read in order:

| Day | What stands outside the standard parts |
| --- | --- |
| Palm Sunday | the procession, *Gloria, laus* |
| Holy Thursday evening | the washing of feet, the transfer of the Blessed Sacrament |
| Good Friday | everything: it is not a Mass |
| Easter Vigil | the Exsultet, the readings, the litany, the baptismal liturgy |

The four sequences are their own part of the readings: *Victimae paschali* (Easter Sunday and its octave), *Veni, Sancte Spiritus* (Pentecost), *Lauda, Sion* (Corpus Christi), *Stabat Mater* (15 September).

## Gaps the corpus still has

A few dozen passages are missing in Latin, English or Portuguese (the snapshot of `packages/missal/src/__tests__/sweep.test.ts` lists those a day of 2025-2027 meets), and the French regional sanctoral has titles but no texts.
