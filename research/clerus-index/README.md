# The Clerus citation index

**The question:** for any passage of Scripture, where has the Church spoken of it? Can one index answer that across the Catechism, the Fathers, St Thomas, the councils and the popes, and can Ember turn it into something a reader reaches from a verse?

## What Clerus has

[Biblia Clerus](https://www.clerus.org/bibliaclerusonline/pt/index.htm), published by the Dicastery for the Clergy, divides the whole Bible into 3,036 passages (Mt 19:1–2, Jn 1:1–18, each psalm whole). Beside each passage it links a page listing every place in its library that cites it. The library is large and multilingual: 707 works, in French, Spanish, Portuguese, Latin and Italian.

The texts are a mixed lot and mostly not ours to take: translations in copyright, the Fathers in nineteenth-century French. The index is the asset. It says *that* Augustine's third Tractate treats John 1:1–18 and *that* the Catechism cites it at 241, 291 and 423, and that knowledge can point into texts Ember already holds.

## The dataset

`scripts/build-clerus-index.py <cache dir>` crawls the passage pages (about 3,200 requests, static pages last changed in 2016) and writes:

| File | What |
| --- | --- |
| `index.jsonl.gz` | One passage a line: `{book, from: [chapter, verse], to: [chapter, verse], page, cited: [{group, work, places}]}`. A place is `[file, anchor, label]`: the page and anchor on Clerus, and the number or title Clerus shows for it. |
| `works.json` | The 707 works with how many places each has, most cited first. |
| `content/bible/clerus/<book>.json` | What the app reads today: per chapter, each passage with the Catechism paragraphs that cite it. |

Only links are kept: no sentence of any cited work is in the dataset.

`book` is the Douay slug the corpus uses. `from`/`to` in the index are in **Clerus's numbering, which is the Hebrew** (Psalm 23 is "The Lord is my shepherd"; Joel has four chapters). The app's files are renumbered to the Douay-Rheims; the table is `douay()` in the script.

`group` is Clerus's own heading for where the work sits in its library. The first works on a page, with `group` empty, are the ones that *treat the passage itself* (a homily on it, a commentary's lecture), as against citing it in passing. That distinction is the most valuable thing in the index after the Catechism.

## Where things stand

217,692 citations across 3,036 passages; every passage has at least one.

| Clerus's heading | Citations | What is in it |
| --- | ---: | --- |
| Padres | 53,019 | Augustine (by far the most), Chrysostom, Cyril, Irenaeus, Origen, Jerome, Hilary, Ambrose |
| Obras bíblicas | 44,517 | A biblical dictionary (French, and one in Portuguese), a thematic concordance |
| Magistério | 35,871 | Encyclicals, exhortations, audiences and addresses from Leo XIII to Benedict XVI, many in Portuguese |
| Essentialia | 29,419 | The Catechism (4,099), Vatican II, sermon collections of Augustine, Chrysostom, Bernard, Leo, papal homilies |
| Profissão da Fé | 22,571 | St Thomas: the Summa by article, Contra Gentiles, the commentaries on Paul, the Catena |
| Oração cristã | 9,617 | Teresa of Ávila, John of the Cross, Thérèse, Francis de Sales, Bernard, Catherine of Siena |
| *(treats the passage itself)* | 9,006 | The Catena (857 passages), Chrysostom on Matthew, John, Acts, Romans, Genesis; Augustine on John and the Psalms; Hilary on Matthew; St Thomas on John and Paul; Denzinger; the lectionary |
| Direito, celebração, literatura, other | 13,672 | Canon law, the Missal and lectionary, a few literary authors |

In the app: the Catechism's paragraphs, on the verse's own page in the Bible reader. 1,183 of the 3,154 passages (as the app divides them by chapter) have at least one.

## What it is not

- **By passage, not by verse.** A citation of John 1:14 is filed under John 1:1–18. The app says so in the heading.
- **Not checked.** No citation has been verified against the work it points to. The Catechism prints its own index of Scripture citations, which is the obvious thing to measure the Catechism slice against.
- **Clerus's place numbers are its own.** `Chrysostome sur Jean: 6801` is homily 68, section 1, in Clerus's scheme; `Suma Teológica III: 1461` is not an article number anyone else uses. Each work needs its numbering decoded before a place can be opened anywhere but on Clerus.
- **Duplicated by language.** The same work often appears two or three times (`Dei Verbum PT`, `Dei verbum LA`).
- **A compilation someone made.** The links are facts, and the Catechism's own Scripture index is public; but the selection across 707 works is Clerus's labour. If Ember ever publishes the whole of it as a feature, credit it.

## What it could become

In the order I would build, each step a thing a reader can use:

1. **Catechism on the verse page.** Done. The paragraph text is read from vatican.va in the reader's language, which makes it the first commentary a Portuguese reader has in Portuguese.
2. **"Read the homily."** For the works that treat a passage, Ember holds English texts of several: Augustine's Tractates on John, Chrysostom's Homilies on Matthew and on John, the Enarrations on the Psalms, the whole Catena, St Thomas on John and Paul. The work is one table per book: Clerus's homily number → Ember's chapter id. Start with the two on John, where the numbers are plain homily numbers.
3. **The Summa by article.** 7,000 citations into the Summa, which Ember has in full. Needs Clerus's article numbers decoded.
4. **The magisterium in Portuguese.** Councils, encyclicals and papal homilies, section by section, read from the publisher at runtime as the CNBB Bible is. This is where a Portuguese reader gets real depth.
5. **The reverse index.** Reading the Catechism or a homily in Ember, show the Scripture it cites and open it in the reader. The same data turned around.
6. **The lectionary.** Clerus links each passage to where the Missal reads it. With Ember's own calendar, a verse could say "read on the Second Sunday of Lent".
