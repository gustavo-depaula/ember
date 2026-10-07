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
| `content/bible/clerus/<book>.json` | What the app reads today: per chapter, each passage with the Catechism paragraphs that cite it, the homilies on it that the corpus holds, and the councils' and popes' documents that cite it. |

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

In the app, on the verse's own page in the Bible reader:

- **The Fathers preaching on the passage**, for the works the corpus holds in English: 733 passages link to a homily of Chrysostom (on Matthew, John, Acts and fourteen of Paul's letters) or of Augustine (the Tractates on John, the Expositions of the Psalms, the homilies on 1 John, On the Sermon on the Mount). Each opens in the book reader.
- **The Catechism's paragraphs**: 4,130 citations on 1,126 passages. Not from Clerus's index (see below) but from the Catechism's own footnotes on Clerus's pages.
- **Councils and popes**: 8,226 citations of 112 documents Clerus has in Portuguese (Vatican II, encyclicals and exhortations from Leo XIII to Francis). A section's text is read from Clerus when opened.

## What was checked

Samples drawn at random and checked by hand-reading (by Sonnet subagents, each item against the text itself):

| Slice | Sample | Result |
| --- | ---: | --- |
| Homilies → the corpus's books | 48 | 44 right. Clerus's homily numbers are the corpus's for every series checked. The misses: one off by one in Acts (Clerus's own); two in On the Sermon on the Mount, since fixed by taking the book from the chapter; one where the corpus's text of Augustine's tenth homily on 1 John is cut short. |
| Catechism, as Clerus indexes it | 40 | **19 right, 21 wrong.** Clerus prints a section's footnotes after the section's last paragraph and credits them all to it. The paragraph numbers are real; the attributions are not. |
| Catechism, rebuilt from its footnotes | 40 | **40 right.** Each was checked against the paragraph's own footnote marks in the English Catechism, Psalms renumbered. It tests that a paragraph cites a verse inside the passage, not that the slice has every citation. |
| Councils and popes | 30 | See the note below the table. |

The Catechism slice was rebuilt: `catechism()` in the script reads the Catechism's pages, and takes each footnote back to the paragraph that calls it. Fourteen of fifteen corrections the first check named are in the rebuilt slice, and none of the wrong attributions it named.

**The fault very likely runs through the rest of the index**, wherever a work's notes are gathered at the end of a group of sections. Anything taken from `index.jsonl.gz` for a work with footnotes should be checked the same way before it is shown.
## What it is not

- **By passage, not by verse.** A citation of John 1:14 is filed under John 1:1–18. The app says so in the heading.
- **Wrong in a patterned way for works with endnotes**, as above. The index is a lead to follow, not an authority.
- **Clerus's place numbers are its own.** `Chrysostome sur Jean: 6801` is homily 68, section 1, in Clerus's scheme; `Suma Teológica III: 1461` is not an article number anyone else uses. Each work needs its numbering decoded before a place can be opened anywhere but on Clerus.
- **Duplicated by language.** The same work often appears two or three times (`Dei Verbum PT`, `Dei verbum LA`).
- **A compilation someone made.** The links are facts, and the Catechism's own Scripture index is public; but the selection across 707 works is Clerus's labour. If Ember ever publishes the whole of it as a feature, credit it.

## What it could become

In the order I would build, each step a thing a reader can use:

1. **Catechism on the verse page.** Done, from the Catechism's own footnotes. The paragraph text is read from vatican.va in the reader's language, which makes it the first commentary a Portuguese reader has in Portuguese. The footnotes cite verses, so this could be shown by verse and not by passage.
2. **"Read the homily."** Done for the twenty series the corpus holds. Still to do: the homilies Clerus lists that the corpus lacks in English (Chrysostom on Genesis, on the Psalms, on Galatians; Hilary on Matthew), and the passages a second homily also treats.
3. **The Summa by article.** 7,000 citations into the Summa, which Ember has in full. Needs Clerus's article numbers decoded.
4. **The magisterium in Portuguese.** Done for the documents Clerus marks as Portuguese, read from Clerus at runtime. Papal homilies, audiences and addresses (another 20,000 citations) are not in yet: their places are numbered by Clerus's own scheme.
5. **The reverse index.** Reading the Catechism or a homily in Ember, show the Scripture it cites and open it in the reader. The same data turned around.
6. **The lectionary.** Clerus links each passage to where the Missal reads it. With Ember's own calendar, a verse could say "read on the Second Sunday of Lent".
