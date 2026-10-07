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
- **The Catechism's paragraphs**: 4,218 citations. From two editions reconciled (see below), not from Clerus's index. Under a paragraph, once open, the other verses it cites: the same index turned around (`content/bible/catechism.json`).
- **Councils and popes**: 7,776 citations of 102 documents Clerus has in Portuguese (Vatican II, encyclicals and exhortations from Leo XIII to Francis), taken from the documents' own pages, not from the index. A section's text is read from Clerus when opened.
- **The Summa Theologiae, by verse**: 8,541 citations by 2,241 articles, each opening in the corpus's Summa. From the corpus's own English text, which prints its references; the Spanish Summa on Clerus is laid beside it as a second witness and agrees on 6,652.
- **The popes, by verse**: 18,307 citations by 3,696 homilies, audiences and addresses of John Paul II and Benedict XVI in Portuguese, read from Clerus when opened.

Beside these, and not from Clerus: **when a verse is read at Mass** (2,993 readings), from Ember's own lectionary. Clerus has a lectionary too, in French and by its own numbers; the missal in the corpus already knew.

## What was checked

Samples drawn at random and checked by hand-reading (by Sonnet subagents, each item against the text itself), and one census:

| Slice | Sample | Result |
| --- | ---: | --- |
| Homilies → the corpus's books | 48 | 44 right. Clerus's homily numbers are the corpus's for every series checked. The misses: one off by one in Acts (Clerus's own); two in On the Sermon on the Mount, since fixed by taking the book from the chapter; one where the corpus's text of Augustine's tenth homily on 1 John is cut short. |
| Catechism, as Clerus indexes it | 40 | **19 right, 21 wrong.** Clerus prints a section's footnotes after the section's last paragraph and credits them all to it. The paragraph numbers are real; the attributions are not. |
| Catechism, rebuilt from its footnotes | 40 | **40 right.** Each was checked against the paragraph's own footnote marks in the English Catechism, Psalms renumbered. It tests that a paragraph cites a verse inside the passage, not that the slice has every citation. |
| Catechism, the two editions reconciled (the rule as it stands) | 50 | 49 right, read paragraph by paragraph against the official Portuguese and, where that lacks the reference, the official English. The miss was a bare number after a semicolon read as a verse ("Gen 3:24; 19"), since fixed. It also showed why the Portuguese alone falls short: in 17 of the 50 its note gives only the council and drops the "cf." to Scripture that the English keeps. |
| The popes' psalm citations | 82 | Two samples, read against the words quoted. A first repair, by each text's habit alone, had 31 of 42 right; the rule as it stands keeps 59 right and 3 wrong of the 82, and leaves out 20 (15 that were wrong, 5 that were right). The first sample was tuned against, the second (33 of 40 before the last change) was not. |
| Councils and popes, as Clerus indexes them | 30 | 25 right. One credited to the last section of Mediator Dei, which prints the whole encyclical's notes after it; four on a passage the section does not cite (three of them a passage that runs across two chapters, shown under the chapter the citation is not in). Both of Redemptor hominis's links named the page beside the one the section is on. Three of the 25 rest on a chapter cited whole ("cf. Mt 5-7"). |
| Catechism, the whole of it, against the English edition | 4,148 | **A census, not a sample: 93.9% of ours found in the English, 88.3% of the English found in ours.** The sample of 40 above had missed this. Ours was wrong in four ways: a note credited to a neighbouring paragraph where the Portuguese text misnumbers a call or a section's notes begin on the page before (37); a commandment's own words credited to the paragraph before them (24); Clerus's linker reading one book for another, Jonas as John, 1 for 2 Corinthians (15); a verse's last digit dropped, 6,11 as 6,1 (8). And it lacked what Clerus never linked (about 160). |
| The Summa, as Clerus links it | 40 | 33 right, against the corpus's English text. Two are the linker's misreadings (Sir 41:15 as 1:15, Habacuc 2:4 as Hebrews 2:4). Five the English does not print: three are words St Thomas quotes that the Spanish editors gave a reference to and the English does not, one is a neighbouring verse, one has no trace. All twelve psalms in the sample carry the Vulgate's number, which is the Douay's: the Summa is not renumbered. |
| The Summa, from the corpus's own text | 40 | 39 right, 25 of them references Clerus does not have. The miss was the parser's ("Job 40:28 says" read as 40:2, a verse cut short when a word followed), since fixed. |
| Catechism, the two editions reconciled (first rule) | 50 | 42 right, on a sample weighted to what only one edition had: all 10 that both had; 22 of 25 that only the English had; 10 of 15 that only the Portuguese had. So what only the Portuguese has is no longer kept, a chapter cited whole needs both, and two misreadings of the English notes ("Eph 1:13; 4, 30", "Deut 31:9. 24") were mended. |
| The popes' homilies and addresses | 30 | 29 right, and every title a fair name for its text. The miss: a 1980 address cites a psalm by the Vulgate's number (136:5, "If I forget thee, Jerusalem"), which Clerus's linker took for the modern one, so it is filed a psalm early. Older texts' psalms may share this. |
| Councils and popes, rebuilt from the documents | 30 | **30 right**, on a fresh sample: 21 cited in the section's own text, 9 in a note the section calls (one of them printed on the next page). |

The Catechism slice was rebuilt: `catechism()` in the script reads the Catechism's pages, and takes each footnote back to the paragraph that calls it. Fourteen of fifteen corrections the first check named are in the rebuilt slice, and none of the wrong attributions it named.

The councils' and popes' documents were rebuilt the same way: `document()` walks a document's pages from any one of them, takes each note back to the section that calls it, and takes a section's page from where it is. A chapter cited whole is left out, except a psalm. Of the first sample's five faults, the rebuilt slice drops the three that were wrong and keeps the two cross-chapter ones, which are right for the passage as Clerus divides it. Miranda prorsus (14 citations) is lost: its sections are headings, not numbers.

The census changed the Catechism slice a second time. What could be mended in the reading of Clerus was: calls are kept from page to page, what stands under a heading goes to the paragraph after, "Mt 5-7" is three chapters. What could not (the linker's misreadings, the references it never linked) needed a second witness, so `catechism()` now lays the Portuguese beside the official English on vatican.va (`scripts/ccc_english.py`). 3,915 citations are in both. Of the 527 only the English has, the 303 that name a verse the book has are kept; a chapter cited whole is not, since that is how a misprint reads ("Gen 1-26" for 1:26). The 247 only the Portuguese has are dropped: checked by hand, most were Clerus's slips.

The Summa went the same way and further. The corpus's own English Summa prints its references, so the index is built from that, and Clerus's Spanish Summa is only counted beside it.

**Two faults run through everything taken from Clerus.** Its index credits a note to the section it is printed after, and can name the wrong page; that is mended by reading the works themselves. And its linker misreads about one reference in twenty and misses about one in ten; that is not mended without a second witness. The Catechism and the Summa have one. The councils' and popes' documents and the popes' homilies do not: they carry that error, less the references to verses that do not exist, which are left out.

**The psalms had a third.** The linker takes every psalm number for the modern one, but the popes' texts cite by either, and often by the Vulgate's (the liturgy's): a citation so read is filed a psalm early. `psalm_links()` settles each reference by what the text gives. Where it prints both numbers ("Sal 139 [138],14"), which Clerus links as two psalms, that is one psalm and the lower number is the Vulgate's. Otherwise the words quoted beside the reference are laid against the corpus's Psalters, which number as the Vulgate does (Matos Soares, and the Clementine for a verse quoted in Latin), under each reading. Failing that, the text is taken to number as its other references show. Where nothing says, the reference is left out. That keeps 729 of the popes' 952 psalm citations. The same words were tried as a witness for the other books and gave too little: a third of references quote their verse and agree, and among the rest only a score of misreadings could be told apart from allusions.

## What it is not

- **By passage, not by verse.** In `index.jsonl.gz` a citation of John 1:14 is filed under John 1:1–18. What the app shows was rebuilt from the works and knows the verse.
- **Wrong in a patterned way for works with endnotes**, as above. The index is a lead to follow, not an authority.
- **Clerus's place numbers are its own.** `Chrysostome sur Jean: 6801` is homily 68, section 1, in Clerus's scheme; `Suma Teológica III: 1461` is not an article number anyone else uses. Each work needs its numbering decoded before a place can be opened anywhere but on Clerus.
- **Duplicated by language.** The same work often appears two or three times (`Dei Verbum PT`, `Dei verbum LA`).
- **A compilation someone made.** The links are facts, and the Catechism's own Scripture index is public; but the selection across 707 works is Clerus's labour. If Ember ever publishes the whole of it as a feature, credit it.

## What it could become

In the order I would build, each step a thing a reader can use:

1. **Catechism on the verse page.** Done, from the Catechism's own footnotes. The paragraph text is read from vatican.va in the reader's language, which makes it the first commentary a Portuguese reader has in Portuguese. The footnotes cite verses, so this could be shown by verse and not by passage.
2. **"Read the homily."** Done for the twenty series the corpus holds. Still to do: the homilies Clerus lists that the corpus lacks in English (Chrysostom on Genesis, on the Psalms, on Galatians; Hilary on Matthew), and the passages a second homily also treats.
3. **The Summa by article.** Done, by verse.
4. **The magisterium in Portuguese.** Done for the documents, and for the homilies, audiences and addresses of John Paul II and Benedict XVI, by verse. Paul VI is in French on Clerus and is left out.
5. **The reverse index.** Done for the Catechism: a paragraph shows the verses it cites. A homily or an article of the Summa could show its own the same way, from the indexes already built.
6. **The lectionary.** Done, from Ember's missal and not from Clerus. A reading could open its Mass.
7. **A second witness for the rest.** The documents and the popes' texts are on vatican.va with their own references. Laying each beside what Clerus links would mend the linker's one in twenty, as it did for the Catechism and the Summa.
8. **By verse throughout.** Done: under a verse, the Catechism's paragraphs and the documents' sections that cite the verse itself come first, then those that cite the rest of Clerus's passage. A citation of several verses counts for each of them.
