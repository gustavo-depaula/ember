# Réginald Garrigou-Lagrange, OP (1877–1964): sourcing

**Copyright frame.** Garrigou died 15 February 1964, so his own texts enter the public domain in Brazil and the EU on **1 January 2035**. Until then the tier depends on the date and place of publication:

- **French and Latin originals published in 1930 or earlier** are PD in the US by date. That makes them tier A under the brief (published ≤1930), but they stay protected in Brazil and France until 2035. Flag this in import metadata, since the app's main audience is Brazilian.
- **Originals published in 1931 or later** are foreign works, so URAA restored their US copyright for 95 years from publication. They are protected everywhere: **tier C until 2035**, unless a page shows the Order's consent (none found).
- **English translations from B. Herder (St. Louis & London) and Newman Press (Westminster, Md.), 1934–1963.** The title pages say "ALL RIGHTS RESERVED / Printed in U.S.A. / Copyright 19xx B. HERDER BOOK CO." The NYPL transcription of the US renewal records (1950–2001, minus the 1994 and 1997–2000 files) has **no renewal at all under Garrigou-Lagrange or any of these titles**. The grep is saved in `research/sourcing/garrigou-lagrange/renewals-grep.tsv` (0 rows), with the list of files searched in `renewals-files-searched.txt`. So the translators' and Herder's US copyright lapsed: **tier B under the brief ("US publication of 1931–1963 never renewed")**.
  - **Caveat.** A translation is a derivative work. Where the French or Latin original is itself post-1930 (*Three Ages*, *Providence*, *Our Saviour*, *Predestination*, the Summa commentaries, *Reality*, *Life Everlasting*…), the underlying original is URAA-restored in the US and protected in Brazil until 2035. Only the translation layer is free, so those English texts are **B with a cloud over them**: free in practice, not clean in law.
  - The English translations of **pre-1931 originals** (*God: His Existence and His Nature* 1934–36, *Christian Perfection and Contemplation* 1937, *The Love of God and the Cross of Jesus* 1947–51) have **no such cloud in the US**. These are the solid tier B.
- **Translations first published outside the US** (*Mother of the Saviour*, Golden Eagle Books, Dublin 1948; *The Priest in Union with Christ*, Mercier Press, Cork 1951; *The Three Ways of the Spiritual Life*, Burns Oates, London 1938) are foreign works, so URAA-restored and **C** for now. Also unverified, because the US Newman/Herder editions of the same translations may have been registered separately.
- **Post-1963 English** (*The Theological Virtues* 1964–65, *The Last Writings* 1969) had automatic renewal: **C**. So are the modern Minerd translations (Emmaus Academic: *Thomistic Common Sense*, *The Sense of Mystery*, *The Order of Things*, *On Divine Revelation* 2022) and the TAN/Ex Fontibus reprints, which are sold.

**What the hosting pages say (for tier B):**
- archive.org collection [`Garrigou-LagrangeEnglish`](https://archive.org/details/Garrigou-LagrangeEnglish): "Some Fr. Garrigou-Lagrange, O.P., works in English". No licence or rights field. Its siblings [`GarrigouLagrangeFrench`](https://archive.org/details/GarrigouLagrangeFrench) ("Some … works in French") and [`GarrigouLagrangeLatin`](https://archive.org/details/GarrigouLagrangeLatin) are the same.
- archive.org [`Lagrange-English`](https://archive.org/details/Lagrange-English) ("Fr. R. Garrigou-Lagrange in English"; folkscanomy collection): a list of contents, no licence.
- Thomistica.net (Sacra Doctrina Project) announced the archive.org trove on 6 Jan 2016 with no rights statement: https://thomistica.net/news/2016/1/6/a-trove-of-digitized-garrigou-lagrange-texts
- christianperfection.info (the *Three Ages* in HTML): the footer says only "Copyright © Christian Perfection 2023". No operator is named and there are no licence terms.
- EWTN library, *Life Everlasting* (https://www.ewtn.com/catholicism/library/life-everlasting-12603): EWTN's pages carry their own site copyright ("© 2025 EWTN Inc").

**Corpus check.** There is no Garrigou-Lagrange in `_corpus-books.txt` or `content/books/`.

**Not searched:** Gallica and HathiTrust (Cloudflare blocks scripted requests). Gallica may hold the pre-1931 Beauchesne, Desclée and Vie Spirituelle editions in text mode.

**Bibliography used:** B. Zorcolo OP, *Bibliografia del P. Garrigou-Lagrange*, Angelicum 1965, open at https://archive.org/details/BibliografiaDelP.Garrigou-lagrange (local copy `garrigou-lagrange/zorcolo-bibliografia.txt`). It lists about 700 items year by year: books ("Opere"), articles ("Articoli", mostly in *Revue Thomiste*, *Vie Spirituelle*, *Angelicum* and the DTC), reviews and prefaces, plus every translation. The books are below. The articles (several hundred, about 1904–1960) are listed by Zorcolo but not sourced here; most are post-1930, and the few that are online are noted.

## Summary table

Words are djvu OCR counts (they include indices and front matter); "est." means estimated from file size.

| Work (1st ed.) | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| *Le sens commun, la philosophie de l'être et les formules dogmatiques* (1909) | [lesenscommunlaph00garr](https://archive.org/details/lesenscommunlaph00garr) (2e éd., Nouvelle Librairie Nationale 1922) | A (US); BR 2035 | *Thomistic Common Sense*, Minerd, Emmaus 2021, sold | C | 112k / — | No |
| *Dieu, son existence et sa nature* (1914–15) | [GarrigouLagrangeFrench](https://archive.org/details/GarrigouLagrangeFrench) "Dieu…" (Beauchesne 1914, 1st ed.) | A (US); BR 2035 | *God: His Existence and His Nature*, Dom Bede Rose OSB, Herder 1934–36 (from the 5th French ed.): [Lagrange-English](https://archive.org/details/Lagrange-English) vols 1–2 | B (unrenewed US; underlying PD in US) | 297k / 376k | No |
| *De revelatione per Ecclesiam catholicam proposita* (1918, 2 vols) | [derevelationeper0012frre](https://archive.org/details/derevelationeper0012frre) (2nd ed. 1921, open; djvu download failed with a 500 error at check time); [garrigou-lagrange-de-revelatione-i](https://archive.org/details/garrigou-lagrange-de-revelatione-i) (Ferrari, metadata 1929) | A (US; editions ≤1930); BR 2035 | *On Divine Revelation*, Minerd, Emmaus 2022, C. The older *Principles of Catholic Apologetics* (J. Walshe, London–St Louis [c.1926?]) is an adaptation, not a translation: [PrinciplesOfCatholicApologetics](https://archive.org/details/PrinciplesOfCatholicApologetics) | C / unverified | ~460k / — | No |
| *Perfection chrétienne et contemplation* (1923, 2 vols) | [perfectionchrtie01garr](https://archive.org/details/perfectionchrtie01garr) + [02garr](https://archive.org/details/perfectionchrtie02garr) (Éd. de la Vie Spirituelle, Saint-Maximin 1923) | A (US); BR 2035 | *Christian Perfection and Contemplation*, Sr M. Timothea Doyle OP, Herder 1937: [christianperfection_202001](https://archive.org/details/christianperfection_202001) | **B** (solid) | 233k / 184k | No |
| *L'amour de Dieu et la croix de Jésus* (1929, 2 vols) | [lamourdedieuetla0001preg](https://archive.org/details/lamourdedieuetla0001preg) + [0002preg](https://archive.org/details/lamourdedieuetla0002preg) (Cerf, Juvisy 1929) | A (US); BR 2035 | *The Love of God and the Cross of Jesus*, Sr Jeanne Marie (Maryknoll), Herder 1947–51: [Garrigou-LagrangeEnglish](https://archive.org/details/Garrigou-LagrangeEnglish) vols 1–2 | **B** (solid) | 306k / 275k | No |
| *De methodo S. Thomae* (1928, article) | GarrigouLagrangeLatin, "De methodo S. Thomae" | A (US) | — | — | 7k / — | No |
| *La Providence et la confiance en Dieu* (1932) | not found open | C (→2035) | *Providence*, Bede Rose, Herder 1937: Lagrange-English "Providence" (7th printing 1953) | B (cloud) | — / 118k | No |
| *Le réalisme du principe de finalité* (1932) | GarrigouLagrangeFrench "Le Réalisme…" (Desclée 1932) | C (→2035) | *The Order of Things*, Minerd 2020, sold | C | 107k / — | No |
| *Les trois conversions et les trois voies* (1933) | lending only ([lestroisconversi0000rpga](https://archive.org/details/lestroisconversi0000rpga)) | C | *The Three Ways of the Spiritual Life*, Burns Oates 1938 / Newman 1950: Lagrange-English | C/unverified (UK first) | — / 38k | No |
| *Le Sauveur et son amour pour nous* (1933) | not found open | C | *Our Savior and His Love for Us*, A. Bouchard, Herder 1951: Garrigou-LagrangeEnglish | B (cloud) | — / 161k | No |
| *Le sens du mystère et le clair-obscur intellectuel* (1934) | GarrigouLagrangeFrench (3e éd.), two copies | C | *The Sense of Mystery*, Minerd 2017, sold | C | 84k / — | No |
| *La prédestination des saints et la grâce* (1936) | lending only ([lapredestination0000garr](https://archive.org/details/lapredestination0000garr)) | C | *Predestination*, Bede Rose, Herder 1939: Lagrange-English / Garrigou-LagrangeEnglish | B (cloud) | — / 129k | No |
| DTC articles 1936 (*Prémotion physique*; *Providence*; *S. Thomas commentateur d'Aristote*…) | [PremotionPhysique](https://archive.org/details/PremotionPhysique); [SaintThomasCommentateurDAristoteEtc](https://archive.org/details/SaintThomasCommentateurDAristoteEtc) | C | — | — | 31k + ~27k / — | No |
| *Les trois âges de la vie intérieure* (1938, 2 vols) | tome 2 only open: [1938GarrigouLagrange…Tome2](https://archive.org/details/1938GarrigouLagrangeLesTroisAgesDeLaVieInterieureTome2600dpiBWBestOf4050); full set lending only ([lestroisagesdela0001garr](https://archive.org/details/lestroisagesdela0001garr)) | C | *The Three Ages of the Interior Life*, Sr M. Timothea Doyle OP, Herder 1947–48: Lagrange-English vols 1–2; Garrigou-LagrangeEnglish vols 1–2 | B (cloud) | ~300k (t.2 only) / 490k | No |
| *De Deo uno* (1938) | GarrigouLagrangeLatin "De Deo Uno"; [dedeouno0000garr_1](https://archive.org/details/dedeouno0000garr_1) | C | *The One God*, Bede Rose, Herder 1943: Lagrange-English | B (cloud) | 246k / 334k | No |
| *La Mère du Sauveur et notre vie intérieure* (1941) | lending only ([bwb_T3-BOJ-727](https://archive.org/details/bwb_T3-BOJ-727), Cerf 1948) | C | *The Mother of the Saviour*, Bernard J. Kelly CSSp, Golden Eagle, Dublin 1948: Lagrange-English | C/unverified (Irish first) | — / 101k | No |
| *De Deo trino et creatore* (1943) | GarrigouLagrangeLatin; [dedeotrinoetcrea0000regi_g9d3_1](https://archive.org/details/dedeotrinoetcrea0000regi_g9d3_1) | C | *The Trinity and God the Creator*, Frederic C. Eckhoff, Herder 1952: Lagrange-English | B (cloud) | 192k / 265k | No |
| *De Eucharistia, accedunt de Poenitentia quaestiones* (1943) | GarrigouLagrangeLatin | C | — | — | 169k / — | No |
| *De Christo Salvatore* (1945) | GarrigouLagrangeLatin | C | *Christ the Saviour*, Bede Rose, Herder 1950: Lagrange-English | B (cloud) | 219k / 295k | No |
| *De gratia* (1946–47) | GarrigouLagrangeLatin; [de-gratia-commentarius…](https://archive.org/details/de-gratia-commentarius-in-summam-theologicam-s-thomae-iae-disseruit-reginaldus-g) | C | *Grace*, Dominican Nuns of Corpus Christi Monastery (Menlo Park), Herder 1952: Lagrange-English | B (cloud) | 110k / 235k | No |
| *La synthèse thomiste* (1946) | lending only ([lasynthesethomis0000preg](https://archive.org/details/lasynthesethomis0000preg)) | C | *Reality: A Synthesis of Thomistic Thought*, Patrick Cummins OSB, Herder 1950: Lagrange-English | B (cloud) | — / 147k | No |
| *De unione sacerdotis cum Christo* (1948) | not found open | C | *The Priest in Union with Christ*, G. W. Shelton, Mercier Cork 1951 / Newman 1952: Lagrange-English | C/unverified (Irish first) | — / 85k | No |
| *De virtutibus theologicis* (1948–49) | GarrigouLagrangeLatin | C | *The Theological Virtues* I, Thomas à Kempis Reilly, Herder 1965 | C (post-1963) | 232k / 206k | No |
| *L'éternelle vie et la profondeur de l'âme* (1950) | not found open | C | *Life Everlasting*, Patrick Cummins, Herder 1952: Lagrange-English; EWTN HTML | B (cloud) | — / 79k | No |
| *De beatitudine* (1951) | GarrigouLagrangeLatin | C | *Beatitude*, Patrick Cummins, Herder 1956: Lagrange-English | B (cloud) | 180k / 118k | No |
| Minor books (*Dieu accessible à tous* 1941; *La seconde conversion* 1951; *Mère Marie de Jésus* 1937; *Les XXIV thèses thomistes* 1944; *Essenza e attualità del tomismo* 1946; *De sanctificatione sacerdotum* 1946) | only *XXIV thèses* found (GarrigouLagrangeFrench, 5k) | C | — | — | — | No |
| *La nouvelle théologie où va-t-elle?* (Angelicum 1946) | [la-nouvelle-theologie-…ou-va-t-elle-articles](https://archive.org/details/la-nouvelle-theologie-garrigou-lagrange-reginald-ou-va-t-elle-articles) | C | "Where is the New Theology Leading Us?" (Garrigou-LagrangeEnglish; translator unknown, modern) | unverified | ~35k / 9k | No |
| *The Last Writings* (posthumous, New City 1969) | — | — | Garrigou-LagrangeEnglish | C | — / 73k | No |

## Notes per work, with ranked sources

### Tier A in the US (pre-1931 originals) and solid-B English

**Perfection chrétienne et contemplation selon S. Thomas d'Aquin et S. Jean de la Croix** (1923). The book that started the contemplation debate. Two volumes in chapters and articles, with long appendices; heavy footnotes (St Thomas, St John of the Cross, Teresa).
- French, best first:
  1. archive.org `perfectionchrtie01garr` / `02garr` (Éd. de la Vie Spirituelle, Saint-Maximin [1923]; University of Toronto scans; 136k + 98k words). Clean, complete 1st edition.
  2. archive.org `perfection-chretienne-et-contemplation-garrigou-lagrange` (1923, community upload; 0.83 MB djvu, apparently one volume). For cross-checking.
  3. Gallica, unchecked.
- English, best first:
  1. archive.org `christianperfection_202001` (Doyle, Herder 1937, Claremont scan; 184k words).
  2. `Garrigou-LagrangeEnglish` → "Christian Perfection & Contemplation" (183k; title page "Copyright 1937 B. HERDER BOOK CO. Reprinted 1958").
  3. `Lagrange-English` → same text (183k).
  4. `ChristianPerfectionContempGarrigouLagrangeReginaldO` (open).

  Avoid `christianperfect0000rgin` (TAN 2003 reprint, lending; C).
- **Tier:** French A (US); English B (Herder 1937, no renewal in 1964–65). The cleanest Garrigou pairing there is.

**L'amour de Dieu et la croix de Jésus** (1929). Two volumes on the passive purifications. French: archive.org `lamourdedieuetla0001preg` / `0002preg` (Cerf, Juvisy [1929], GTU scans, 152k + 154k words, good modern OCR), the only copies found. English, best first: (1) `Garrigou-LagrangeEnglish` vols 1–2 (Sr Jeanne Marie of Maryknoll, Herder 1947 / 1951; title page "Copyright 1947 B. HERDER BOOK CO.", 128k + 147k); (2) lending copies `loveofgodcrossof0000garr`, `…0000revr`, `…0002revr` for checking. Tiers: French A (US); English B (no renewal in 1975–79).

**Dieu, son existence et sa nature** (1914; 11 editions to 1950). Philosophical natural theology in two parts (existence; nature and attributes, with the "antinomies"). French, best first: (1) `GarrigouLagrangeFrench` → "Dieu…" (Beauchesne 1914, a Google scan with Google boilerplate; 297k words); (2) `dieu-son-existence-et-sa-nature-solution-thomiste-des-antinomies-agnostiques-gar` (open, 285k, same or a close edition). Later editions (5th 1928 and later) were revised; the English follows the 5th. English, best first: (1) `Lagrange-English` "God, His Existence and His Nature-1/-2" (Bede Rose, Herder; "Copyright 1934 B. HERDER BOOK CO. Seventh Printing, 1955"; 145k + 232k); (2) `Garrigou-LagrangeEnglish` vols 1–2 (145k + 228k); (3) lending copies `godhisexistenceh0001garr` / `0002garr` and others. Tiers: French A (US); English B. **Edition mismatch:** the English is from the 5th French edition and the open French copy is the 1st, so for an aligned pair we need the 5th edition (1928, also ≤1930, so A); look for it on Gallica.

**Le sens commun** (1909; 2nd ed. 1922; 4th 1936). Ranked: (1) archive.org `lesenscommunlaph00garr` (2nd ed. 1922, Toronto; 112k) and (2) `lesenscommunlap00garr` (a second 1922 scan); (3) `GarrigouLagrangeFrench` "Le Sens Commun (4e édition)" (1936, 119k; the revised 4th edition is post-1930, so C). English: only Minerd 2021 (C).

**De revelatione per Ecclesiam catholicam proposita** (1918; 2nd 1921, 3rd 1926/1931, 4th 1945, 5th 1950). Latin apologetics in two volumes. Ranked: (1) `derevelationeper0012frre` (1921, internetarchivebooks; open item, but the djvu download returned HTTP 500 at check time); (2) `garrigou-lagrange-de-revelatione-i` (Ferrari, metadata 1929; 366k words, carries obrascatolicas.com watermarks; vol. I only, with `…-de-revelatione-ii` dated 1950); (3) `de_revelatione_per_ecclesiam_catholicam_proposita_1932-garrigou-lagrange` (3rd ed. 1932, C); (4) `GarrigouLagrangeLatin` De Revelatione vols 1–2 ("editio emendata", ~1950, C). Use only ≤1930 editions. English: none usable.

**De methodo S. Thomae** (1928): a short Latin article in `GarrigouLagrangeLatin` (7k). A.

### Post-1930 works (originals C until 2035; English B with a cloud)
For the spiritual books the English texts are all available open on archive.org in two independent community collections (`Lagrange-English`, `Garrigou-LagrangeEnglish`), plus Herder lending scans for cross-checks:
- ***The Three Ages of the Interior Life***, the magnum opus (Doyle 1947–48; 2 vols, 214k + 276k). Other copies: `TheThreeAgesOfTheInteriorLifeVol.2` (open); `TheThreeAgesOfTheSpiritualLife` (open, 3.2 MB, likely both volumes); the HTML at https://christianperfection.info (tta1–tta29.php, ≈120k words, i.e. partial: about vol. 1 only; Doyle's translation, with a "Translator's Preface"); index and bibliography files in `Garrigou-LagrangeEnglish`. The structure is four parts (sources; purification of beginners; the illuminative way of proficients; the unitive way), chapters with articles, footnotes. French: only tome 2 is open. Tome 1 is lending-only, and Cerf keeps it in print (C).
- *Providence* (Rose 1937, 118k); *Predestination* (Rose 1939, 129k); *Our Savior and His Love for Us* (Bouchard 1951, 161k); *Life Everlasting* (Cummins 1952, 79k; also EWTN HTML); *Reality* (Cummins 1950, 147k; also `a-synthesis-of-thomistic-thought`, `RealityASynthesis…`).
- The Summa commentaries *The One God* (334k), *The Trinity and God the Creator* (265k), *Christ the Savior* (295k; also `ChristTheSaviorGarrigouLagrange…`), *Grace* (235k; also `grace-commentary-on-summa-theologiae…`) and *Beatitude* (118k) are all Herder 1943–56 with "Copyright 19xx B. HERDER BOOK CO." and no renewal. Their Latin originals (*De Deo uno*, *De Deo trino*, *De Christo Salvatore*, *De gratia*, *De beatitudine*, *De Eucharistia*, *De virtutibus theologicis*) are open in `GarrigouLagrangeLatin` but are C until 2035.
- *The Mother of the Saviour* (Kelly, Dublin 1948, 101k) and *The Priest in Union with Christ* (Shelton, Cork 1951 / Newman 1952, 85k) were first published in Ireland, so URAA probably restored them (C/unverified). *The Three Ways of the Spiritual Life* (London 1938 / Newman 1950, 38k) is the same case.

## Portuguese

| Work | Portuguese source | Translator, year | Tier | Quality |
|---|---|---|---|---|
| *Les trois conversions et les trois voies* | archive.org [2.-as-tres-vias-e-as-tres-conversoes-garrigou-lagrange](https://archive.org/details/2.-as-tres-vias-e-as-tres-conversoes-garrigou-lagrange) ("As Três Vias e as Três Conversões", 34k words, complete) | not named; modern | C/unverified (original protected until 2035; translation recent and unattributed) | Poor. Reads like a machine or hasty translation, probably via Spanish ("São Tomé" for São Tomás; "o seu próximo como você"). Reference only. |
| *La Mère du Sauveur* | archive.org [amaedosalvadorgarrigoulagrange](https://archive.org/details/amaedosalvadorgarrigoulagrange) (preface only, 3.7k words) | unnamed | C/unverified | Good Brazilian Portuguese, but a fragment. |
| *Les trois âges de la vie intérieure* | archive.org [introducaodastresidades_201909](https://archive.org/details/introducaodastresidades_201909) (introduction only, 2.3k words) | unnamed (probably taken from a published Brazilian edition) | C/unverified | Good; fragment. A two-tome Portuguese edition, *As três idades da vida interior*, exists (LibraryThing pt lists Tomo I/II); publisher and translator unconfirmed. It is a modern commercial edition (C). |
| others | none found on archive.org; Domínio Público, pt.wikisource, BNDigital and purl.pt not reached in this pass; Google Books full view impossible for in-copyright works | — | — | Brazilian Catholic publishers (Ecclesiae, Cultor de Livros, Casa Pedro, which published a Garrigou book on Madre Francisca de Jesus, 2023) sell modern translations: C. |

No Portuguese text is importable. Our pt-BR pipeline would translate from French (or from the English for the post-1930 works, if we accept the cloud).

## Recommendation

- **Layout:** `garrigou-lagrange-opera-omnia/<work>`. Canonical `fr-FR` (or `la`) beside `en-US`.
- **Import first (cleanest, highest value for a prayer app):**
  1. ***Perfection chrétienne et contemplation* / *Christian Perfection and Contemplation*.** French A (US) with a complete 1923 OCR; English B (solid, unrenewed Herder 1937); several copies of each for cross-checking.
  2. ***L'amour de Dieu et la croix de Jésus* / *The Love of God and the Cross of Jesus*** (the same status).
  3. *Dieu, son existence et sa nature* / *God* (philosophical; find the 5th French edition to match the English).
- **Hold until 1 Jan 2035, or import in English only if the user accepts tier B with the derivative-work cloud:** *The Three Ages of the Interior Life* (the work users will ask for), *Providence*, *Life Everlasting*, *Our Savior*, *Predestination*, *Reality* and the Summa commentaries. Their English is freely distributed with no one claiming it online, and TAN/Ex Fontibus reprint them commercially. Their originals remain protected in Brazil and France until 2035, and most French originals of this group are not even open online (*Trois âges* t.1, *Providence*, *Sauveur*, *Éternelle vie*).
- **Not cleanly sourceable:** *Mother of the Saviour*, *Priest in Union with Christ* and *Three Ways* (Irish/UK first editions → URAA); *Theological Virtues* and *Last Writings* (post-1963, C); every Minerd translation (C); every Portuguese translation (C or poor).
- The several hundred articles (Zorcolo's bibliography) are out of scope for now.

**Total size.** Book-length œuvre, roughly 4.5–5M words in the originals (the books above, excluding articles). Online and open now: originals ≈ 2.9M (French ≈ 1.25M including the post-1930 *Réalisme*, *Sens du mystère* and *Trois âges* t.2; Latin ≈ 1.6M); English ≈ 3.6M across 22 works. Recommended first import (A/B-solid only): ≈ 836k French (*Perfection* 233k, *Amour de Dieu* 306k, *Dieu* 297k) + ≈ 835k English.

Raw downloads: `research/sourcing/garrigou-lagrange/` (`ia/` djvu texts, `cpinfo/` christianperfection.info HTML, `pt/` Portuguese texts, `zorcolo-bibliografia.txt`, `access.txt` / `access2.txt` with each item's open/lending status).
