# St. Bonaventure (c. 1217–1274)

Bibliography: the Quaracchi *Opera omnia* (*Doctoris seraphici S. Bonaventurae… opera omnia*, Ad Claras Aquas 1882–1902, 10 vols. in 11, folio, two columns). Its general table, *Tabula operum omnium huius editionis* (vol. X), is the work list below, with page ranges. The editors' *Dissertatio de scriptis* (X, 1–38) separates genuine from doubtful works. Later corrections are flagged per work: Bougerol's *Introduction to the Works of Bonaventure* (1961/64) and the post-Quaracchi editions of the Hexaemeron and the sermons.

**Already in the corpus:** nothing by Bonaventure, original or English (`_corpus-books.txt`, `content/books/`).

Raw downloads used for counting are in `research/sourcing/bonaventure/`: `quaracchi/` (the 11 `_djvu.txt` files), `la/` (thelatinlibrary, la.wikisource, Decem opuscula 1900, Tria opuscula 1911, Hefele 1861, Vicenza 1874), `en/` (archive.org English texts) and `scripts/` (`ias.sh` archive.org search, `wsdump.py` Wikisource dump, `htmlwc.py` HTML word count).

## How the size was measured

Measured OCR word counts of the Quaracchi volumes (archive.org, Boston College / Toronto scans, `doctorisseraphicNNbona_djvu.txt`):

| Vol. | Contents | Year | OCR words (incl. prolegomena, scholia, footnotes, indices) |
|---|---|---|---|
| I (2 parts: `…11bona`, `…12bona`) | In I Sententiarum | 1882 | 833k |
| II | In II Sent. | 1885 | 955k |
| III | In III Sent. | 1887 | 849k |
| IV | In IV Sent. | 1889 | 929k |
| V | Opuscula theologica (QQ. disp., Breviloquium, Itinerarium, Reductio, Collationes, Sermones selecti) | 1891 | 614k |
| VI | Ecclesiastes, Wisdom, John, Collationes in Ioannem | 1893 | 624k |
| VII | Luke (+ two dubia) | 1895 | 952k |
| VIII | Opuscula mystica, Franciscan opuscula, Legendae, dubia | 1898 | 849k |
| IX | Sermons | 1901 | 658k |
| X | Dissertations, indices (editorial; not Bonaventure) | 1902 | 302k |
| | **Total** | | **7.57M** |

The Quaracchi apparatus (footnotes, scholia, marginal sigla) is heavy. Calibration against clean texts: the *Itinerarium* takes 24 Quaracchi pages and has 10.2k words of clean text (≈425 words/page); the *Legenda maior* takes 61 pages and has 40.3k (≈650/page); *De triplici via* has 24.5k OCR words for ≈12k of text. So the author's text is roughly **50–65% of the OCR**. Per-work figures below are page-based estimates (≈500 words/page for treatises and sermons, ≈600 for the Sentences, which are denser) unless marked "counted".

**OCR quality:** fair to good. The scans are clean, but two-column pages with marginal notes produce typical errors: `h`→`li` ("tahs actuahtas"), interleaved marginalia ("Additio du- 86"), and hyphenation at line ends. Every Quaracchi text needs a column/marginalia-aware clean-up pass, like the Denis Vivès volumes.

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **Commentaria in IV libros Sententiarum** (I–IV) | archive.org `doctorisseraphic11bona`, `…12bona`, `…02bona`, `…03bona`, `…04bona` (Quaracchi I–IV) | A | none PD (Franciscan Archive Book I, claims © and withdrawn from the web; Mediatrix Press print) | C | ≈2.1M / — | no |
| Quaestiones disputatae de scientia Christi, de mysterio Trinitatis, de perfectione evangelica | Quaracchi V 1–198 (`doctorisseraphic05bona`) | A | none PD (Hayes 1979/1992, Karris 2008: Franciscan Institute) | C | ≈100k / — | no |
| **Breviloquium** | Quaracchi V 199–291; *Tria opuscula* (Quaracchi 1911) `triaopusculaseraphici3ed`; Hefele 1861 `opusculaduopraestantissimabre`; Vicenza 1874 `breviloquiumadiectisillusvicet1` | A | E. E. Nemmers, Herder 1946 (renewal unverified); de Vinck 1963 and Monti 2005 (C) | unverified / C | ≈50k / ≈55k | no |
| **Itinerarium mentis in Deum** | thelatinlibrary.com/bonaventura.itinerarium.html (counted); la.wikisource (counted); Quaracchi V 293–316; *Tria opuscula* 1911 | A | P. Boehner, Franciscan Institute 1956, archive.org `worksofsaintbona02bona` ("Public domain according to HathiTrust"); G. Boas 1953 (unverified) | B | 10.2k / ≈11k | no |
| De reductione artium ad theologiam | la.wikisource (counted); Quaracchi V 317–325; *Tria opuscula* 1911 | A | Sr. Emma Thérèse Healy, 1940 (2nd ed. 1955), archive.org `worksofsaintbona01bona` ("Public domain according to HathiTrust") | B | 3.6k / ≈4k | no |
| Collationes in Hexaemeron | Quaracchi V 327–454 | A | de Vinck 1970 (C) | C | ≈65k / — | no |
| Collationes de septem donis Spiritus Sancti | Quaracchi V 455–503; la.wikisource (one collatio only); franciscan-archive.org `opera/collat1–9.html` | A | Franciscan Archive (Bugnolo, © claimed); Hayes 2008 (C) | C | ≈25k / — | no |
| Collationes de decem praeceptis | Quaracchi V 505–532 | A | Spaeth 1995 (C) | C | ≈14k / — | no |
| Sermones selecti de rebus theologicis (incl. *Christus unus omnium magister*) | Quaracchi V 532–579; la.wikisource (Sermo IV); franciscan-archive.org `opera/bon05567.html` | A | none PD | — | ≈24k / — | no |
| Commentarius in Ecclesiasten | Quaracchi VI 1–103 | A | Murray & Monti 2005 (C) | C | ≈50k / — | no |
| Commentarius in librum Sapientiae (authenticity disputed) | Quaracchi VI 105–235 | A | none | — | ≈65k / — | no |
| Commentarius in Evangelium Ioannis | Quaracchi VI 237–532 | A | Karris 2007 (C) | C | ≈150k / — | no |
| Collationes in Evangelium Ioannis | Quaracchi VI 533–634 | A | Karris 2007 (C) | C | ≈50k / — | no |
| Commentarius in Evangelium Lucae | Quaracchi VII 1–604 | A | Karris 2001–04 (C) | C | ≈300k / — | no |
| De triplici via | Quaracchi VIII 3–27; **Decem opuscula** (Quaracchi 1900) `decemopusculaadt00bona` | A | none PD found (de Vinck 1960, unverified) | unverified | ≈12k / — | no |
| Soliloquium de quatuor mentalibus exercitiis | Quaracchi VIII 28–67; Decem opuscula 1900 | A | *The Soliloquies of St. Bonaventure* (London, 17th c., Wing B3555), archive.org `TheSoliloquiesOfSt.Bonaventure` | A | ≈20k / 33k OCR | no |
| Lignum vitae | Quaracchi VIII 68–87; Decem opuscula 1900 | A | none PD found (de Vinck 1960, Cousins 1978: C) | unverified / C | ≈10k / — | no |
| De quinque festivitatibus pueri Iesu | Quaracchi VIII 88–98; Decem opuscula 1900 | A | none PD (Doyle 1984, C) | C | ≈5k / — | no |
| Tractatus de praeparatione ad Missam | VIII 99–106; Decem opuscula | A | none PD found | — | ≈4k / — | no |
| **De perfectione vitae ad sorores** | VIII 107–127; Decem opuscula | A | Laurence Costello, *Holiness of Life*, Herder 1923 (1928 ed.), archive.org `holinessoflife00costuoft`, `holinessoflifebe00bona` | A | ≈10k / 25k OCR (≈12k) | no |
| De regimine animae | VIII 128–130; Decem opuscula | A | none PD | — | ≈1.5k / — | no |
| **De sex alis Seraphim** | VIII 131–151; Decem opuscula | A | Sabinus Mollitor OFM, *The Virtues of a Religious Superior*, Herder 1920/21, archive.org `virtuesofreligio00bonauoft`, `cu31924029403262` | A | ≈10k / 21k OCR (≈13k) | no |
| Officium de passione Domini | VIII 152–158; Decem opuscula | A | none PD | — | ≈2.5k / — | no |
| Vitis mystica | VIII 159–229; Decem opuscula | A | "a Friar of S.S.F.", Mowbray 1955 (C/unverified) | C | ≈25k / — | no |
| Apologia pauperum | VIII 233–330 | A | de Vinck 1966 (C) | C | ≈50k / — | no |
| Epistola de tribus quaestionibus | VIII 331–336 | A | Monti 1994 (C) | C | ≈3k / — | no |
| Determinationes quaestionum circa Regulam (dubious) | VIII 337–374 | A | none | — | ≈19k / — | no |
| Quare Fratres Minores praedicent… (dubious) | VIII 375–385 | A | none | — | ≈5k / — | no |
| Epistola de sandaliis Apostolorum | VIII 386–390 | A | none | — | ≈2.5k / — | no |
| Expositio super Regulam FF. Minorum (dubious; now generally denied) | VIII 391–437 | A | none | — | ≈23k / — | no |
| Sermo super Regulam | VIII 438–448 | A | Monti 1994 (C) | C | ≈5k / — | no |
| Constitutiones Narbonenses | VIII 449–467 | A | Monti 1994 (C) | C | ≈10k / — | no |
| Epistolae officiales | VIII 468–474 | A | Monti 1994 (C) | C | ≈3.5k / — | no |
| Regula novitiorum | VIII 475–490 | A | none PD | — | ≈8k / — | no |
| Epistola continens XXV memorialia | VIII 491–498 | A | none PD | — | ≈4k / — | no |
| Epistola de imitatione Christi | VIII 499–503 | A | none PD | — | ≈2.5k / — | no |
| **Legenda maior S. Francisci** | poliba (Wayback) `ff_leggendamaggiore_lat.html` (counted); franciscanos.net (Wayback) `fuentes/legmaior.htm` (counted); Quaracchi VIII 504–564 | unverified / A | **E. Gurney Salter**, Temple Classics 1904 (Everyman 1910), archive.org `TheLifeOfSaintFrancis`, `lifesaintfranci00bonagoog`; Lockhart/Manning 1868, archive.org `lifeofstfranciso00bona` | A | 40.3k / 63k OCR (≈45k) | no |
| Legenda minor S. Francisci | poliba (Wayback) `ff_leggendaminore_lat.html` (counted); Quaracchi VIII 565–579 | unverified / A | none PD found | — | 9.2k / — | no |
| Opuscula dubia, vol. VIII (Speculum disciplinae, Speculum conscientiae, Summa de gradibus virtutum, De contemptu saeculi, De humilitate, Ep. ad novitium, Rhythmica) | VIII 583–≈700 | A | none PD | — | ≈60k / — | no |
| Dubia, vol. VII (Expositio in Lamentationes, Expositio orationis dominicae) | VII 605–≈700 | A | none | — | ≈45k / — | no |
| Ars praedicandi (dubious) + Sermones de tempore | IX 3–461 | A | none PD | — | ≈230k / — | no |
| Sermones de sanctis | IX 463–631 | A | none PD | — | ≈85k / — | no |
| Sermones de B. Virgine Maria | IX 633–721 | A | none PD | — | ≈45k / — | no |
| Sermones de diversis | IX 723 ff. | A | none PD | — | ≈5k / — | no |

## Sources per work, ranked

### Commentaria in IV libros Sententiarum (Quaracchi I–IV)

Original, ranked:
1. **Quaracchi I–IV** (1882–89), archive.org `doctorisseraphic11bona` + `doctorisseraphic12bona` (vol. I in two parts), `doctorisseraphic02bona`, `…03bona`, `…04bona`. Duplicate scans for cross-checking OCR: `doctorisseraphic02bona_0`, `…03bona_0`, `…04bona_0`, `05636860.5.emory.edu` (vol. 5), `gtu_32400003130063_5`, and Google scans `doctorisseraphi00italgoog`, `…01italgoog`, `…00bonagoog`. Tier **A**. The Lombard text is printed above each distinction. The text runs in **distinction → part → article → question**, with *Conclusio*, *ad opposita* and *dubia circa litteram* in the standard scholastic layout, plus the editors' *Scholion* after each question (editorial, drop or put in notes). Bugnolo puts the Latin at "approximately 3,600 pages".
2. **Franciscan Archive Latin transcription** (franciscan-archive.org/bonaventura/sent.html → `I-Sent.html` …): Quaracchi text "in parallel" with English for Book I. Footer "© 2006-7 English Translations, emendations and digitization of texts". The translation "is no longer available on the web". Tier **C** for the English, unverified for the digitized Latin. Useful only as a spot-check.
3. Peltier ed., *Opera omnia* (Paris: Vivès, 1864–71, 15 vols.; Sentences in vols. 1–6) and the Vatican edition (Rome 1588–96, archive.org `sanctibonaventuraeoperarom1`; Mainz 1609 `sanctibonaventuraeopera1`; Lyon 1668 `bub_gb_*`). Tier A, pre-critical. Last-resort witnesses only.

English: **none usable**. Book I by Br. Alexis Bugnolo (Franciscan Archive / Mediatrix Press, sold): C. Partial academic translations (Hayes, Houser) are C. This work is Latin-only in our corpus unless our pipeline translates it.

Size: ≈3.57M OCR words. The author's text is ≈2.0–2.3M (≈60%). **It is the largest Bonaventure item by far, more than half the opera omnia.**

### Volume V: the systematic opuscula

- **Breviloquium** (prologue + 7 parts, 72 chapters). Original: (1) **Tria opuscula** (Quaracchi 1911, 3rd ed.), archive.org `triaopusculaseraphici3ed` (103k OCR for three works with notes; small octavo, much cleaner OCR than the folio). (2) Quaracchi V 199–291. (3) C. J. Hefele, *S. Bonaventurae opuscula duo praestantissima: Breviloquium et Itinerarium* (Tübingen 1861), `opusculaduopraestantissimabre` (74k). (4) A. M. da Vicenza, *Breviloquium adiectis illustrationibus* (1874; 1881 ed.), `breviloquiumadiectisillusvicet1` (166k incl. commentary). All tier A. English: E. E. Nemmers, *Breviloquium* (St Louis: Herder, 1946), archive.org `breviloquium0000stbo_o8m6`/`bwb_W9-ADJ-836` (lending only). Its renewal status is **unverified**; check the Stanford renewal database before use. The rest are C: de Vinck 1963 (`stbonaventurebre0000jose`, St Anthony Guild), Monti 2005 (Franciscan Institute).
- **Itinerarium mentis in Deum** (prologue + 7 chapters). Original: (1) **thelatinlibrary.com/bonaventura.itinerarium.html** (10.3k words, clean HTML, edition unstated, Quaracchi text). (2) la.wikisource `Itinerarium mentis in Deum` (10.2k, "editio: incognita"). (3) Tria opuscula 1911. (4) Hefele 1861. (5) Quaracchi V 293–316. (6) franciscanos.net `document/itinerl.htm` (offline, no Wayback copy found). Tier A. English: (1) **Philotheus Boehner OFM, *Saint Bonaventure's Itinerarium Mentis in Deum*** (Works of St Bonaventure II, Franciscan Institute 1956), archive.org `worksofsaintbona02bona`: a facing Latin/English text with commentary. It says "All rights reserved", but archive.org records "Copyright review: Public domain according to HathiTrust rights database" (a US work not renewed). Tier **B** (non-renewal confirmed by HathiTrust's review). Note the Franciscan Institute sells a **revised 2002 edition**, which is C; only the 1956 text is usable. (2) George Boas, *The Mind's Road to God* (Liberal Arts Press 1953), reproduced at EWTN (`ewtn.com/library/SOURCES/ROAD.TXT`) and Crossroads Initiative; renewal **unverified**. (3) Franciscan Archive (Bugnolo, 2005), © claimed: C. (4) Fr. James OFMCap, *The Franciscan Vision* (Burns Oates 1937), unverified, not located.
- **De reductione artium ad theologiam** (26 sections). Original: la.wikisource (3.6k), Tria opuscula 1911, Quaracchi V 317–325; also forumromanum.org/literature/bonaventura/reduct.html and hiphi.ubbcluj.ro (not opened). English: **Sr. Emma Thérèse Healy** (St Bonaventure College 1940; 2nd ed. 1955), archive.org `worksofsaintbona01bona`. "Copyright, 1940, by Sister Emma Thérèse Healy… All rights reserved", but HathiTrust's rights review says PD (not renewed). Tier **B**.
- **Collationes in Hexaemeron** (23 collations, *reportatio* A). Original: Quaracchi V 327–454 only. F. Delorme's edition of the other reportatio, *Collationes in Hexaemeron et Bonaventuriana quaedam selecta* (Quaracchi 1934), is unverified. English: de Vinck 1970, C.
- **Collationes de septem donis** (9 collations), **de decem praeceptis** (7), **Quaestiones disputatae** (de scientia Christi 7 qq., de mysterio Trinitatis 8 qq., de perfectione evangelica 4 qq.), **Sermones selecti** (5, incl. *Christus unus omnium magister*, *De regno Dei*): Quaracchi V only, apart from partial clean HTML on la.wikisource (Collatio VII de dono consilii; Sermo IV) and franciscan-archive.org (`opera/bon05567.html`, `opera/collat1.html`–`collat9.html`, Latin + English, © claimed). English: all modern, C.

### Volumes VI–VII: Scripture commentaries

Quaracchi VI (`doctorisseraphic06bona`, also `operaomnia06bona`) and VII (`doctorisseraphic07bona`, `operaomnia07bona`) are the only sources. Tier A. Structure: chapter by chapter of the biblical book, with *quaestiones* inserted and *Collationes in Ioannem* as separate conferences (Coll. 1–79 + appendix). The Wisdom commentary is printed as genuine by Quaracchi, but its authenticity has since been questioned (unverified here); vol. VII's Lamentations and Pater noster expositions are Quaracchi's own *dubia*. English: Karris (Luke, John), Murray–Monti (Ecclesiastes), all Franciscan Institute, C.

### Volume VIII: mystical opuscula (I–X)

Original, ranked:
1. **Decem opuscula ad theologiam mysticam spectantia** (Quaracchi 1900), archive.org `decemopusculaadt00bona` (116k OCR). The ten mystical opuscula, De triplici via to Vitis mystica, in the Quaracchi critical text but in a small octavo **single-column** setting, so the OCR is much cleaner than the folio. Tier **A**. Best base for import. Also `decemopuscula0005coll` / `bwb_C0-ANN-222` (1926 ed.).
2. Quaracchi VIII 3–229 (`doctorisseraphic08bona`). Tier A. Counted spans: De triplici via 24.5k OCR, Soliloquium 41.2k OCR, Lignum vitae 15.5k OCR.
3. Vatican/Vivès editions (pre-critical; Vitis mystica differs).

English (PD): **Costello, *Holiness of Life*** (De perfectione vitae ad sorores; 1923, 1928 ed.), tier A. **Mollitor, *The Virtues of a Religious Superior*** (De sex alis Seraphim; 1920), tier A. ***The Soliloquies of St. Bonaventure*** (17th-century English recusant translation, with the "Bundle of Myrrh" and "XIII Spirituall Exercises", which are pseudo-Bonaventure), tier A. It has long-s and early-modern spelling and poor OCR, so it needs heavy clean-up or is worth keeping only as a witness. Nothing PD found for De triplici via, Lignum vitae, Quinque festivitates, Praeparatio ad Missam, Regimine animae or the Officium. De Vinck's *Works of Bonaventure* I (*Mystical Opuscula*, St Anthony Guild 1960; archive.org `worksofbonaventu0001bona`) translates most of them. As a 1960 US book it needed renewal in 1988; **status unverified**, worth checking (if not renewed it unlocks six opuscula).

### Volume VIII: Franciscan opuscula (XI–XXIV) and the Legends

- **Legenda maior** (prologue + 15 chapters + miracles in 10 chapters). Original, ranked: (1) poliba (Wayback snapshot 20051111) `http://rilievo.poliba.it/bsc/bsc/st/cc/orm/francescani/fonti/ff_leggendamaggiore_lat.html`: 40.3k words, clean, with `cfr.` apparatus, edition not stated, tier unverified (see `francis-of-assisi.md`). (2) franciscanos.net (Wayback 20191119) `fuentes/legmaior.htm`: 39.9k words, clean, same apparatus style, unverified. (3) **Quaracchi VIII 504–564**: tier A, the OCR witness. Also the Quaracchi *editio minor* (*Legendae duae de vita S. Francisci*, 1898; 1923), not located. English, ranked: (1) **E. Gurney Salter, *The Life of Saint Francis*** (Temple Classics, Dent 1904), archive.org `TheLifeOfSaintFrancis` (63k OCR), `lifesaintfranci00bonagoog`, `lifesaintfranci01bonagoog`; reprinted in Okey's Everyman volume (1910, `thelittleflowers00okey`, pp. 181–300). Tier **A**. (2) **Lockhart, with preface by Cardinal Manning** (1868; 1915 reprint), archive.org `lifeofstfranciso00bona` (61k OCR). Tier A.
- **Legenda minor** (7 chapters × 9 lessons). Original: poliba (Wayback 20051111) `ff_leggendaminore_lat.html` (9.2k); franciscanos.net (Wayback 20220129) `fuentes/legminor.htm`; Quaracchi VIII 565–579. English: none PD found.
- **Apologia pauperum, Constitutiones Narbonenses, Epistolae officiales, Sermo super Regulam, Regula novitiorum, XXV memorialia, De imitatione Christi, Ep. de tribus quaestionibus, Ep. de sandaliis**, and the doubtful *Determinationes*, *Quare FF. Minores praedicent* and *Expositio super Regulam*: Quaracchi VIII is the only source (A). The English is modern only: de Vinck 1966 *Defense of the Mendicants*; Monti 1994 *Writings Concerning the Franciscan Order*. Both C.

### Volume IX: Sermons

Quaracchi IX (`doctorisseraphic09bona`, `operaomnia09bona`) only, tier A: de tempore (Advent through the Sundays after Pentecost), de sanctis, de BVM, de diversis, with the doubtful *Ars praedicandi* as introduction. Most are *schemata* (outlines) and *reportationes*, not finished sermons. Quaracchi's selection was superseded by Bougerol's critical editions, *Sermones dominicales* (1977) and *Sermons de diversis* (Paris 1993, 2 vols., ≈2× the Quaracchi *de diversis*). Both are C, so the extra material is unavailable. English: none PD (T. Johnson, *Sunday Sermons*, 2008, C).

### Pseudo-Bonaventure (out of scope for the opera omnia)

Quaracchi excluded these: *Meditationes vitae Christi* (John of Caulibus), *Stimulus amoris* (James of Milan), *Psalterium maius BMV*, *Speculum BMV* (Conrad of Saxony), *Diaeta salutis*, *De septem itineribus aeternitatis* (Rudolph of Biberach), *Centiloquium*, *Pharetra* and others. They have abundant PD English: *Psalter of the BVM* (1840/1852), archive.org `ThePsalterOfTheBVM` (25.5k OCR); *Meditations on the Supper of Our Lord* (EETS 1875); *Mirrour of the Blessed Lyf of Jesu Christ* (Nicholas Love, ed. Powell 1908); *The Life of Our Lord* (1739); *The Mirror of the BVM and the Psalter of Our Lady* (Sr Mary Emmanuel, Herder 1932, unverified). Latin: la.wikisource `Psalterium majus Beatissimae Mariae Virginis` (9.8k) and the Vatican/Vivès editions. If wanted, a separate `pseudo-bonaventura/` collection, clearly labelled.

## Recommendation

Layout, mirroring Quaracchi's grouping (Latin slugs as in `denis-opera-omnia`):

```
bonaventura-opera-omnia/
  sententiae/in-i-sententiarum … in-iv-sententiarum        (chapter = distinction; Lombard's text as a lead block; scholia dropped or in notes)
  theologica/quaestiones-de-scientia-christi, -de-mysterio-trinitatis, -de-perfectione-evangelica,
             breviloquium, itinerarium, de-reductione-artium, collationes-in-hexaemeron,
             collationes-de-septem-donis, collationes-de-decem-praeceptis, sermones-selecti
  commentaria/in-ecclesiasten, in-sapientiam, in-ioannem, collationes-in-ioannem, in-lucam
  mystica/de-triplici-via, soliloquium, lignum-vitae, de-quinque-festivitatibus, de-praeparatione-ad-missam,
          de-perfectione-vitae-ad-sorores, de-regimine-animae, de-sex-alis-seraphim, officium-de-passione, vitis-mystica
  ordo/apologia-pauperum, constitutiones-narbonenses, epistolae-officiales, regula-novitiorum, …,
       legenda-maior, legenda-minor
  sermones/de-tempore, de-sanctis, de-beata-virgine, de-diversis
  dubia/  (vol. VII and VIII appendices, Ars praedicandi, Determinationes, Expositio super Regulam…)
```

Import order (from most value per word to least):
1. **Legenda maior + Legenda minor** (≈50k). Clean Latin (poliba ×2 witnesses + Quaracchi) and Salter's PD English; it pairs with the Franciscan sources.
2. **Itinerarium, De reductione, Breviloquium** (≈64k). Clean Latin (thelatinlibrary, wikisource, Tria opuscula 1911). English: Boehner 1956 and Healy 1955 (both HathiTrust-PD); Nemmers 1946 once its renewal is checked.
3. **The ten mystical opuscula** from *Decem opuscula* 1900 (≈100k, clean single-column OCR). PD English for De perfectione vitae (Costello) and De sex alis (Mollitor). Check de Vinck vol. I (1960) for renewal; if it was not renewed it covers the rest.
4. Volume V remainder: Collationes in Hexaemeron, de septem donis, de decem praeceptis, QQ. disputatae, Sermones selecti (≈230k, Latin-only, folio OCR).
5. Franciscan opuscula of vol. VIII (≈150k), then the sermons (IX, ≈365k), then the Scripture commentaries (VI–VII, ≈615k).
6. **Commentaria in Sententias last** (≈2.1M, Latin-only, the heaviest OCR clean-up). Split by distinction (I: 48, II: 44, III: 40, IV: 50 distinctions → ≈182 chapters of ≈10–15k words each; consider splitting by question for reader-sized chapters).

Cannot be sourced cleanly:
- Everything outside the Itinerarium, De reductione, the Legends and fragments on wikisource exists **only as Quaracchi folio OCR** (or the 1900/1911 octavo OCR).
- PD English exists only for the Legenda maior, Itinerarium, De reductione, De perfectione vitae, De sex alis Seraphim and the Soliloquium. Probably the Breviloquium too (Nemmers 1946) and the de Vinck opuscula (1960), both pending renewal checks. Everything else (Sentences, Hexaemeron, commentaries, sermons, disputed questions, Apologia) has tier C English only.
- Post-Quaracchi critical texts (Bougerol's sermons, Delorme's Hexaemeron reportatio B) are C or unverified.

## Total size

- Quaracchi OCR: **7.57M words** across 11 files (incl. apparatus and the editorial vol. X).
- Bonaventure's own text, genuine works: **≈3.7M words** (Sentences ≈2.1M; vol. V ≈290k; VI ≈315k; VII ≈300k; VIII genuine ≈280k; IX ≈365k), plus ≈130k of Quaracchi *dubia*. Range ±20%.
- PD/B English available: ≈11k (Itinerarium) + ≈4k (Reductio) + ≈45k (Legenda maior) + ≈12k (Perf. vitae) + ≈13k (Sex alis) + ≈25k (Soliloquies) ≈ **110k words**, ≈+55k with Nemmers' Breviloquium and ≈+60k with de Vinck vol. I if their renewal checks clear.

## Portuguese

Bonaventure has little free Portuguese. The one tier-A find is Frei Marcos de Lisboa's 1562 volume at the BNP: Portuguese versions of *De perfectione vitae ad sorores*, the *Lignum vitae*, a treatise for novices and a short "A.B.C. spiritual". The Brazilian Franciscan sites that host the early Franciscan sources (franciscanos.org.br, capuchinhos.org.br; see `francis-of-assisi.md`) have **no Bonaventure**. Their *Legenda maior* entry (capuchinhos.org.br/capitulos/legenda-maior) is an empty page, and the OFM Província I.C. Word-file collection stops before Bonaventure. Every modern Portuguese Bonaventure I know of is sold (tier C). Nothing turned up for the Sentences, the disputed questions, the commentaries or the sermons.

Searched: archive.org (advancedsearch: titles and creators "Boaventura/Bonaventura", "Itinerário", "Soliloquio", "Breviloquio", "seraphico"), pt.wikisource (API: nothing), BNP Digital/purl.pt (all Portuguese-language records for "Boaventura"/"Boauentura" and the creator facet "Boaventura, Santo, 1221-1274"), and franciscanos.org.br (WordPress search: no texts). Not searched: the shared WebSearch budget ran out, the Google Books API quota was spent, and Domínio Público and BN Brasil sit behind Cloudflare challenges. So "none found" below means none in those four places, not none in existence.

| Work | Translation (translator, year, publisher) | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| **De perfectione vitae ad sorores** | Frei Marcos de Lisboa OFM, *Tractado do Seraphico Doctor S. Boauentura chamado Da perfeiçam da vida…*, Lisboa: João Blávio, 1562 (108 ff., 8º; BNP RES-98-P) | purl.pt/22947 (record: bndigital.bnportugal.gov.pt/idurl/1/92133) | A (BNP: "PUBLIC DOMAIN … Public Domain Mark"; 1562) | A full scan, with public copies of 4.7 MB and 154.7 MB. 16th-c. type and orthography ("lingoagem", "religiam"). OCR not checked. The only Portuguese found. |
| **Lignum vitae** | same volume: "Tractado do mesmo sancto chamado Aruore da vida" | purl.pt/22947 | A | As above. The only Portuguese found. |
| Regula novitiorum (probably) | same volume: "Tractado do mesmo sancto & forma breue pera insino dos nouiços na religiam" | purl.pt/22947 | A | The title suggests the *Regula novitiorum* (Quaracchi VIII 475–490), but I have not matched it to the Latin. |
| (unidentified) | same volume: "Hum breue A.B.C. spiritual do mesmo Sancto" | purl.pt/22947 | A | Possibly a pseudo-Bonaventuran alphabet. Not identified. |
| **Legenda maior S. Francisci** | 1. *Fontes Franciscanas e Clarianas*, Vozes/FFB 2004; *Fontes Franciscanas*, Editorial Franciscana (Braga) (contents and date unverified) | sold | C | Reference only. |
| | 2. Indirect: 15th-c. Portuguese *Chronica XXIV Generalium*, ed. J. J. Nunes, Coimbra 1918, which draws on Bonaventure's legend; Marcos de Lisboa, *Chronicas* I (1557/1566/1587) | dl.uc.pt/bitstream/10316.2/3256/1/cronica_da_ordem_dos_frades_menores.pdf; purl.pt/14929, /14772, /15302 | A | Compilations, not translations of the LM. Old Portuguese. Philological interest only. |
| Legenda minor | none found | — | — | — |
| **Itinerarium mentis in Deum** | 1. António Soares Pinheiro SJ, *Itinerário da Mente para Deus* (intr., tr. and notes), Braga: Faculdade de Filosofia (UCP), 1998 per a library record (ribac.cimac.pt, bmmn_195571); an earlier edition is unverified | sold / library | C | Reference. A European-Portuguese scholarly version. |
| | 2. Luís A. De Boni & Saturnino Schneider (trs.), in Boaventura, *Obras escolhidas*, Porto Alegre: EST/Sulina/UCS, 1983, pp. 163–203 (as cited in *Scintilla*) | sold / out of print | C | Reference. Brazilian. |
| | 3. Mário Ferreira dos Santos, *Comentários ao Itinerário da Mente a Deus* (1968 per archive.org metadata) | archive.org `itinerario-da-mente-a-deus-comentado-por-mario-ferreira-dos-santos` | C (author d. 1968; the upload is unofficial) | Commentary. The item lists no text or PDF files, so I could not check whether it prints the whole translation. |
| Breviloquium | none found free. A modern Brazilian version may exist in De Boni's collections (unverified) | — | C/unverified | — |
| De reductione artium ad theologiam | possibly in *Obras escolhidas* (1983), unverified | — | C/unverified | — |
| De triplici via, Soliloquium, De sex alis Seraphim, De quinque festivitatibus, Vitis mystica, Collationes, Quaestiones disputatae, Sentences, commentaries, sermons, Franciscan opuscula | none found | — | — | — |
| (spurious, listed under Quaracchi's exclusions) *Stimulus amoris* (James of Milan) | *Liuro chamado Stimulo de amor diuino, tirado do que fez Sam Bõaue[n]tura*, Lisboa: Germão Galharde, 1550 | purl.pt/22946 | A (BNP public domain) | Scan, 16th-c. Portuguese. |
| (spurious) *Philomena* (John Peckham) | 1561 Portuguese verse version, reprinted by J. Mendes dos Remédios, Coimbra 1907 | archive.org `philomenareimpr00bonagoog` | A ("NOT_IN_COPYRIGHT") | Google scan with OCR. |
| (spurious) *Psalterium B. V. Mariae* | Lisbon printings 1611, 1651, 1673 are **Latin** (BNP 262166, 262161, 262496) | — | — | Not Portuguese. |

**pt-BR reference:** there is no usable free modern Portuguese for any Bonaventure work. Our pt-BR has to come from the pipeline, translating from Quaracchi and the *Decem opuscula* and checking against the PD English. For the *Itinerarium*, the published Brazilian (De Boni–Schneider) and Portuguese (Soares Pinheiro) versions are the references to consult, both tier C. Marcos de Lisboa's 1562 *Perfeição da vida* and *Árvore da vida* are a PD witness of how 16th-century Portuguese friars rendered these two works, useful for vocabulary but not as a model for pt-BR.
