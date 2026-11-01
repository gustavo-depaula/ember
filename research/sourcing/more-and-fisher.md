# St. Thomas More (1478–1535) and St. John Fisher (1469–1535): sourcing report

Both wrote in **English and Latin**. For the English works the original is the English text: early Tudor English, in old spelling. For the Latin works the original is `la`, and the table lists English translations separately. Every 16th-century text is **tier A**.

**The obstacle is modern editions.** The standard critical edition is the *Yale Edition of the Complete Works of St. Thomas More* (15 vols, 1963–97), which is **tier C**. There is no modern critical *Opera* for Fisher. Modern English translations of the Latin works are all post-1930 and tier C or unverified: Miller's *Sadness of Christ*, the Yale Latin volumes, Rogers' *Correspondence* (1947), Hallett's Fisher (1935).

**The breakthrough is EEBO-TCP.** The Text Creation Partnership hand-keyed the early printed editions of almost all of More's English polemics, the *Dialogue of Comfort*, Robinson's *Utopia*, and most of Fisher's English sermons, as clean TEI-XML. Each text has a public GitHub repo, `github.com/textcreationpartnership/<TCP id>`; the catalogue is `Texts/TCP.csv`, saved as `more-and-fisher/TCP.csv`. Phase I texts are public domain (CC0). Phase II texts, marked "Restricted" in the CSV, were released to the public in 2020: their repos downloaded freely (A00765, A06423). TCP keeps old spelling and marks illegible characters as `<gap>`. Both counts are given below, from `more-and-fisher/tcp/*.xml`.

How I measured:
- TCP: words in the `<text>` body.
- archive.org: `_djvu.txt` full text (`_scripts/ia_count.py`). "q" is the English-dictionary hit rate. It is not meaningful for Latin or for old spelling, so 0.5–0.75 on 16th-century texts reflects spelling as much as OCR.
- Gutenberg: plain text between the markers.
- Raw files are in `more-and-fisher/{tcp,ia,pg}/`.

**Bibliography used:**
- More: the Yale CW volume plan (vol. 1 English poems, *Pico*, *Last Things*; 2 *Richard III*; 3 Lucian and Latin poems; 4 *Utopia*; 5 *Responsio ad Lutherum*; 6 *Dialogue concerning Heresies*; 7 *Letter to Bugenhagen*, *Supplication of Souls*, *Letter against Frith*; 8 *Confutation*; 9 *Apology*; 10 *Debellation*; 11 *Answer to a Poisoned Book*; 12 *Dialogue of Comfort*; 13 *Treatise on the Passion*, *Treatise on the Blessed Body*, *Instructions and Prayers*; 14 *De Tristitia Christi*; 15 Latin letters to Dorp, Oxford, Lee and a Monk, and *Historia Richardi Tertii*)
- Fisher: the DNB and *Catholic Encyclopedia*, and J. E. B. Mayor's *English Works* (EETS 1876)

---

# Part 1: St. Thomas More

## Summary table

| Work | Original source (URL, edition), best first | Tier | English source (translator, year, URL), best first | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **Utopia** (Latin, 1516) | 1. thelatinlibrary.com/more.html (complete Books I–II, no parerga; edition not stated; 27,219 w); 2. la.wikisource.org/wiki/Utopia (22 subpages; index cites "ed. Bolchazy, Gichan, Theobald", a modern edition, so tier unverified); 3. Lupton's edition, *Latin of March 1518 + Robinson*, Oxford 1895: archive.org/details/theutopiaofsirth00moreuoft (166,285 incl. English and notes), `utopiaofsirthoma00moreuoft`, `cu31924030364982`; 4. Michels & Ziegler, Berlin 1895 (*Lateinische Litteraturdenkmäler* 11): `lateinischelitt02moregoog`, `aju6750.0001.001.umich.edu`; 5. scans of the 1518 Basel ed. `deoptimoreipstat00more` and the 1613 ed. `deoptimorepvblic00more` | A (TLL text: edition unverified, but a public-domain base is likely) | 1. **Ralph Robinson, 1551**: TCP A07706 (old spelling, 54,258 w, 1,078 gaps), TCP A07711 (1639 ed., 48,578 w), Lupton 1895 (above), IA `mostpleasantfrui00morerich` (1808 Dibdin ed., q 0.95, 148k with notes); 2. **Gilbert Burnet, 1684**: TCP A51327 (42,988 w, 13 gaps), Gutenberg #2130 (Morley/Cassell 1901, modern spelling, 43,525 w); 3. en.wikisource.org/wiki/Utopia_(1901) (10 subpages, 44,844 w; translation probably Burnet/Morley, unverified); 4. Everyman 1910 (Robinson): IA `utopiawiththedia00moreuoft` | A | 27k / 43–54k | no |
| **Epigrammata** (Latin poems, Basel 1518/1520) | scans only: 1518 Froben ed. (bound with *Utopia*) `deoptimoreipstat00more`; Louvain *Opera* 1566 `bub_gb_uBpaVn168owC` | A (scan only) | Bradner & Lynch, *The Latin Epigrams of Thomas More* (Chicago 1953): not online, **unverified/C** | C | est. 25k / – | no |
| **Historia Richardi Tertii** (Latin) / **The History of King Richard III** (English) | Latin: *Opera* 1566 (scan) | A | English (More's own version, c. 1513): 1. J. R. Lumby's Cambridge ed. 1883, IA `moreshistoryofki00morerich` (q 0.875, 87,016 incl. notes and glossary), `historykingrich00lumbgoog`, `historykingrich00moregoog`; 2. TCP A51324 (1641 *Historie of … Edward the Fifth*, 66,360 w; includes others' continuations); 3. Wikisource "History of King Richard III" (index page only, 1,322 w) | A | est. 30k / ≈40k | no |
| **Life of John Picus, Earl of Mirandula** (English translation of G. F. Pico, c. 1510) | – | – | 1. TCP A09627 (1525 ed., 23,248 w); 2. J. M. Rigg's ed. 1890, IA `giovannipicodell00picouoft` (q 0.782, 37,493 incl. intro), `giovannipicodel00moregoog` | A | – / ≈23k | no |
| **The Four Last Things** (English, c. 1522, unfinished) | – | – | 1. D. O'Connor's modernised ed. 1903, IA `fourlastthings00more` (q 0.967, 23,912); 2. *Workes* 1557 scan `thomasmoreworkes` (old spelling) | A | – / ≈20k | no |
| **English poems** (*Lady Fortune*, *A Mery Gest*, the Pageant verses, *Rueful Lamentation*) | – | – | 1. TCP A07691 (*Lady Fortune*, 2,889 w), A07705 (*Mery Gest*, 1,944 w); 2. Wikisource "Lady Fortune"; 3. *Workes* 1557 (scan) | A | – / ≈8k | no |
| **Responsio ad Lutherum** (Latin, 1523, under the name "Gulielmus Rosseus") | *Opera* 1566 (scan `bub_gb_uBpaVn168owC`, Latin OCR poor) | A (scan only) | Yale CW 5 (1969): **C** | C | est. 90k / – | no |
| Latin letters: to Dorp (1515), to the University of Oxford (1518), to Edward Lee (1519), to a Monk (1519/20), to Brixius (1520) | *Opera* 1566 (scan); the letters to Erasmus are in P. S. Allen, *Opus Epistolarum Erasmi* (vols I–VII, 1906–28, A; on IA) | A (scan) | Yale CW 15 (1986); Rogers, *Selected Letters* (1961): **C** | C | est. 60k / – | no |
| la.wikisource *Epistulae*: to Erasmus (1516), to Peter Giles (1517) (the *Utopia* parerga) | la.wikisource.org/wiki/Epistulae_(Thomas_Morus) | A (edition "incognita") | Robinson's *Utopia* has the Giles letter | A | ≈2k | no |
| **A Dialogue concerning Heresies** (1529) | – | – | TCP A07698 (1529 1st ed., 164,841 w; **4,445 gaps**, a damaged copy); *Workes* 1557 (scan) | A | – / ≈165k | no |
| **The Supplication of Souls** (1529) | – | – | TCP A68478 (1529, 51,034 w, 371 gaps) | A | – / ≈51k | no |
| **Letter against Frith** (1533) | – | – | TCP A07704 (11,360 w, 22 gaps) | A | – / ≈11k | no |
| **The Confutation of Tyndale's Answer** (1532–33) | – | – | TCP A07693 (Part 1, 1532, 165,811 w) + A07694 (*second parte*, 1533, 263,521 w) | A | – / ≈430k | no |
| **The Apology** (1533) | – | – | TCP A07692 (78,052 w, 1,540 gaps) | A | – / ≈78k | no |
| **The Debellation of Salem and Bizance** (1533) | – | – | TCP A07695 (100,247 w) | A | – / ≈100k | no |
| **The Answer to a Poisoned Book** (1533) | – | – | TCP A07690 (95,560 w) | A | – / ≈96k | no |
| **A Dialogue of Comfort against Tribulation** (English, Tower 1534) | – | – | 1. TCP A07696 (Tottel 1553 1st ed., 117,684 w, 1,440 gaps); 2. 1847 Dolman ed., IA `dialogueofcomfor00moreuoft` (q 0.964, 126,389, modernised spelling); 3. Everyman 1910, *Utopia and Dialogue of Comfort*, IA `utopiawiththedia00moreuoft` (q 0.858, 185,411 for both); 4. Gutenberg #17075 (Monica Stevens' modernisation, Sheed & Ward 1951, 103,831 w; **tier B**: a 1951 US/UK publication cleared by PG as not renewed); 5. CCEL ccel.org/ccel/more/comfort | A (B for #17075) | 117k | no |
| **Treatise on the Passion**, **Treatise to Receive the Blessed Body**, **Instructions and Prayers** (Tower works, 1534–35, incl. the *Godly Meditation* "Give me thy grace, good Lord") | – | – | *Workes* 1557 only: archive.org/details/thomasmoreworkes (scan, OCR q 0.737; the whole *Workes* is 1,234,976 w); the prayer alone: Wikisource "Prayer of Thomas More"; Yale CW 13 (C) | A (scan only) | – / est. 70k | no |
| **De Tristitia Christi** (Latin, Tower 1535, autograph in Valencia, unfinished) | Latin: *Opera* 1565/66 Louvain (scan `bub_gb_uBpaVn168owC`); the autograph transcription is Yale CW 14 (1976, C). **No public-domain Latin e-text found** | A (scan only) | 1. **Mary Basset's translation** (*An Exposicion of a Parte of the Passion*), in *Workes* 1557 (scan `thomasmoreworkes`; no TCP); 2. Clarence Miller, *The Sadness of Christ* (Yale 1976 / Scepter 1993): **C** | A (scan) / C | est. 25k / est. 30k | no |
| Translations of Lucian (Latin, with Erasmus, 1506) | *Opera*; 1506 Paris ed. (scan) | A | TCP A06423 (*Necromantia*, 1530, English, attribution to More doubtful, 980 w) | A | est. 20k | no |
| English letters (to his family from the Tower, to Cromwell, etc.) | – | – | *Workes* 1557 (scan); Wikisource "Thomas More Letter to his Daughter"; Rogers, *Correspondence* (Princeton 1947): **C** | A (scan) | – / est. 40k | no |
| Doubtful or compilations: *A brief fourme of confession* (1576, Vaux, with pieces from More and Vives); *Lac puerorum* verses | TCP A68062 (34,046), A03484 | A | – | – | – | skip |
| Lives of More (Roper c. 1557; Harpsfield; Cresacre More 1631; Stapleton) | TCP A07675 (1631 Cresacre More, 475 pp.), A51279 (1642); Roper: Wikisource "The Life of Sir Thomas More" | A | – | – | – | no (not More's own writing; a possible later import) |

## Notes on More

- **English text policy.** TCP texts are old spelling ("syr", "yt", "ye"), with `<gap>` marks where the source scan was illegible. The *Dialogue concerning Heresies* has 4,445 gaps and the *Confutation* about 5,500. Each gap must be filled from a second witness: the 1557 *Workes* scan, or the 1931 Campbell & Reed facsimile, whose status is unverified. Decide whether the corpus `en-US` text stays old-spelling or gets modernised. Precedent from the user's other books: keep the source orthography and record the edition. For the *Dialogue of Comfort*, the 1847 modern-spelling edition is the clean reading text, with TCP 1553 as the authority.
- **The 1557 *Workes*** (Rastell) is the comprehensive English witness, ≈1.23M words of OCR. It is the only source for the Tower devotional works and for Basset's *Sadness of Christ*. But it is black-letter OCR (q 0.737) with no TCP transcription. Importing those works means vision-reading the scan, or accepting heavy cleanup.
- **Latin.** Only *Utopia* has clean Latin e-text: The Latin Library, plus la.wikisource, which cites a modern edition. Every other Latin work (*Epigrammata*, *Responsio*, *Historia Richardi Tertii*, the letters, *De Tristitia*, Lucian) exists only in 16th-century scans: Louvain 1565/66, Basel 1563 *Lucubrationes*, Frankfurt 1689. The OCR of the 1566 *Opera* is unusable (q 0.42, ligatures and abbreviations), so these are scans only.

---

# Part 2: St. John Fisher

## Summary table

| Work | Original source (URL, edition), best first | Tier | English source / modernisation, best first | Tier | Words | In corpus? |
|---|---|---|---|---|---|---|
| **Sermons on the Seven Penitential Psalms** (*This treatyse concernynge the fruytfull saynges of Dauid*, English, 1508) | 1. Mayor, *The English Works of John Fisher* (EETS ES 27, 1876; old spelling, edited): IA `englishworksjoh00mayogoog` (OCR q 0.696, 193,842 for the whole volume); 2. 1509 W. de Worde black-letter scan `thistreatyseconc00fish` (q 0.519; **not in TCP**); 3. ECCO 1714 reprint `bim_eighteenth-century_a-treatise-concerning-th_fisher-saint-john-card_1714` | A | modern-spelling ed. **1914** (*Commentary on the Seven Penitential Psalms*, 2 vols, *Catholic Library* 14, Manresa Press 1914, ed. with preface and glossary by J. S. Phillimore (d. 1926), confirmed on the title page): IA `commentaryonseve01fishuoft` (q 0.951, 51,846) + `commentaryonseve02fishuoft` (q 0.944, 45,478); duplicates `Commentary7PenitentialPsalmsV1`/`V2`, `CommentaryOnTheSevenPenitentialPsalmsV1`/`V2` | A | ≈95k | no |
| **Funeral sermon for Henry VII** (1509) | TCP A00779 (7,671 w, 7 gaps); EETS 1876 | A | – | – | ≈7.5k | no |
| **Month's Mind sermon for Lady Margaret Beaufort** (1509) | TCP A00766 (7,291 w, 2 gaps); Hymers' ed. 1840, IA `funeralsermonofm00fishuoft` (q 0.835, 75,949 incl. Baker's notes); EETS; ECCO 1708/1711 reprints | A | – | – | ≈7k | no |
| **Sermon against the pernicious doctrine of Martin Luther** (1521) | TCP A00771 (12,855 w); EETS | A | – | – | ≈13k | no |
| **Sermon at Paul's at the abjuration of Barnes** (1526) | TCP A00769 (18,362 w); EETS; IA `bim_early-english-books-1475-1640_a-sermon-had-at-paulis-_fisher-john-saint-and-_1527` (scan) | A | – | – | ≈18k | no |
| **Two fruitful sermons** (printed 1532; occasion not checked) | TCP A00789 (15,786 w) | A | – | – | ≈16k | no |
| **A Spiritual Consolation to his sister Elizabeth** + **The Ways to Perfect Religion** (Tower 1535; printed 1578) | TCP A00776 (1578 ed., 26,478 w for both treatises) | A | modernised 1903, *A Spiritual Consolation and other Treatises*: IA `spiritualconsola00fish` (q 0.964, 25,999) | A | ≈26k | no |
| **De necessitate orandi** / **Treatise of Prayer** (Latin original lost or unpublished; English versions) | – | – | 1. TCP A00762 (*A Godlie treatisse declaryng the benefites … of prayer*, 1560, tr. A. Browne, Viscount Montagu, 17,629 w); 2. TCP A00765 (*A treatise of prayer*, 1640, tr. "R.A.", 20,724 w; TCP Phase II, released) | A | ≈18–21k | no |
| ***Psalmi seu precationes*** (Latin 1525) / *Psalms or Prayers taken out of Holy Scripture* (English 1544, 1569) | Latin: not located | – | TCP A16113 (1569, 28,532 w). **Attribution doubtful**: it is ascribed to Fisher in the 1569 ed., and the English version is sometimes credited to Henry VIII or Katherine Parr | A | ≈28k | no |
| **Assertionis Lutheranae Confutatio** (Latin, Antwerp 1523) | scans: IA `bub_gb_ZVFQCapVGHkC` (1545), `bub_gb_1IerDaigLbUC` (1545), `bub_gb_QNLIRjo3WCsC` (1558), `assertionis-lutheranae-confutatio-…` (1564); OCR not usable | A (scan only) | none in public domain | – | est. 200k | no |
| **Defensio Regiae Assertionis contra Babylonicam Captivitatem** (Latin, 1525) | scans only (1525 Cologne; *Opera* Würzburg 1597) | A (scan) | none | – | est. 80k | no |
| **Sacri Sacerdotii Defensio contra Lutherum** (Latin, 1525) | 1525 ed. (scan); critical ed. H. K. Schmeink, *Corpus Catholicorum* 9 (Münster 1925): A by date but **not located online** | A | P. E. Hallett, *The Defence of the Priesthood* (Burns Oates 1935): **C/unverified** | C | est. 40k / – | no |
| **De Veritate Corporis et Sanguinis Christi in Eucharistia** (Latin, against Oecolampadius, 1527) | scans: IA `ARes05513` (1527 Cologne), `bub_gb_0fHSytaknGEC` (1561), `ARes34409` (1554) | A (scan) | none (a 1969 thesis translating the prefaces only: IA `bim_early-english-books-1641-1700_sister-thrse-mari_1969_…`, unverified) | – | est. 250k | no |
| *De unica Magdalena* (1519), *Confutatio secundae disceptationis* (1519), *Eversio munitionis* (1519): the Magdalene controversy | scans (Paris 1519; *Opera* 1597) | A (scan) | none | – | est. 120k | no |
| *Convulsio calumniarum Ulrichi Veleni* (1522, on St Peter in Rome) | scans | A (scan) | none | – | est. 40k | no |
| ***Opera omnia*** (Würzburg 1597, collected Latin works) | scan (Google Books / BSB; id not confirmed in this pass) | A (scan) | – | – | – | no |
| Letters (to Erasmus etc.) | Allen, *Opus Epistolarum Erasmi* (1906–58; vols to 1928 are A, on IA) | A | – | – | est. 10k | no |

## Notes on Fisher

- **English works.** All are tier A and almost all are clean via TCP. The exception is the most important one: the *Penitential Psalms* is not in TCP. For it, use the 1914 modern-spelling edition (q 0.95, clean, 2 vols) as the reading text and check it against Mayor's EETS 1876 old-spelling text. EETS published only Part I, which contains the Psalms and the 1509–1526 sermons.
- **Latin works.** Every one is scan-only, in 16th-century print. That OCR is not usable, and there is no public-domain English translation of any of them. This is the biggest gap in the whole assignment: about 0.7M words of Fisher's Latin theology (the anti-Luther and Eucharistic treatises) can only be imported through vision transcription of the scans.

---

## Recommendation (both authors)

- **Layout:**
  - `more-opera-omnia/<work>`. English works get `en-US` as canonical and *preserve the source orthography*; record the edition. Latin works get `la` as canonical, with `en-US` where a public-domain translation exists.
  - `fisher-opera-omnia/<work>`, the same way.
- **Import first:**
  1. More, *Dialogue of Comfort*: TCP 1553 as the authority, 1847 as the modern reading text, Everyman and PG #17075 as cross-checks.
  2. Fisher, *Penitential Psalms*: 1914 modern edition, plus EETS.
  3. Fisher, *Spiritual Consolation* and *Ways to Perfect Religion*: TCP plus 1903.
  4. More, *Utopia*: Latin from The Latin Library, with Lupton 1895 as the scan check, and Robinson 1551 (TCP) / Burnet (PG) as `en-US`.
  5. More, *Four Last Things* (1903) and *Life of Pico* (TCP).
  6. Fisher's English sermons (TCP).
  7. Fisher's *Treatise of Prayer* (TCP).
  8. More's polemics: *Dialogue concerning Heresies*, *Supplication of Souls*, *Confutation*, *Apology*, *Debellation*, *Answer*, *Letter against Frith*, all from TCP, with the gaps filled from the *Workes* 1557 scan.
- **Cannot be sourced cleanly:**
  - ***De Tristitia Christi***: only the 1565/66 scan for the Latin, and Basset's translation exists only in the 1557 *Workes* scan. Miller's translation and the Yale text are tier C. The work the user named is therefore **scan-only**. It is short (≈25k Latin), so a vision transcription of the Louvain *Opera* is feasible.
  - More's Tower devotional works (scan only), his other Latin works (*Responsio*, epigrams, Latin letters, *Historia Richardi Tertii*: scans only), and his correspondence as a whole (Rogers 1947, C).
  - All of Fisher's Latin works (scans only; no translations).

**Total size:**

| Group | Words |
|---|---|
| More, English | ≈1.25M (TCP covers ≈1.15M of it) |
| More, Latin | ≈0.3M (est.; only *Utopia*, 27k, as clean text) |
| Fisher, English | ≈0.25M (≈0.14M via TCP, plus the Psalms ≈95k) |
| Fisher, Latin | ≈0.73M (est., scan only) |
| **Clean-sourceable now** | **≈1.4M** |
| Scan-only | ≈1.1M |

## Portuguese

Coverage is partial. Midway through this pass the session's web-search budget ran out, and the Google Books API hit its daily quota. So these were searched only through each site's own catalogue or API:
- archive.org (`language:por` plus Portuguese titles)
- pt.wikisource (API)
- pt.wikipedia
- BNP Biblioteca Nacional Digital (`bndigital.bnportugal.gov.pt`)
- Open Library
- ebooksbrasil
- Montfort (site search)

These could not be checked:
- dominiopublico.gov.br, behind a Cloudflare JavaScript challenge
- Permanência (`permanencia.org.br`), which timed out or returned 508
- obrascatolicas.com, which returned no response
- Quadrante, whose VTEX shop has no scriptable search
- Estante Virtual (403)

All three need a manual pass in a browser.

### St. Thomas More

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| **Utopia** | 1. Luís de Andrade, Athena/Atena Editora, Rio de Janeiro 1937 (per Bottmann). Reprinted in *Os Pensadores* X, Abril Cultural, São Paulo 1972, whose colophon reads "Tradução e notas de Luís de Andrade … Copyright desta edição, 1972, Abril S.A. … Traduções publicadas sob licença de: Atena Editora". The same text circulates uncredited as the "Edição Ridendo Castigat Mores / eBooksBrasil" e-book ("© 2001"). | eBooksBrasil HTML `http://www.ebooksbrasil.org/eLibris/utopia.html` (PDF `…/adobeebook/utopia.pdf`); archive.org `utopia-thomas-morus` (the Ridendo PDF, with djvu txt); archive.org `os-pensadores-10-erasmo-de-rotterdam-thomas-more` (1972 scan, OCR) | **Unverified, probably C.** Published 1937, so after 1930. The translator is unidentified: Bottmann suspects a pseudonym, so the 70-year rule can't be applied. Atena licensed it to Abril in 1972, and it is still reprinted. The free web copies carry no licence and no translator credit. | Books I–II complete, with the translator's notes and without the parerga (letters to Giles, verses). eBooksBrasil is clean HTML (≈39.8k words including a modern intro); the Ridendo djvu txt is OCR of that PDF. I verified it is the **same text as Os Pensadores 1972** (identical opening: "O invencível rei da Inglaterra, Henrique, oitavo do nome, príncipe dum gênio raro e superior…", "…chover no molhado"). It is a **translation of Victor Stouvenel's French (Paris, Paulin 1842)**, not of the Latin: the opening matches fr.wikisource `L’Utopie (More, trad. Stouvenel)/Livre 1` word for word ("prince d'un génie rare et supérieur…"). Copies are in `more-and-fisher/pt/`. |
| | 2. Leandro Dorval Cardoso, Vozes 2016 | – | C (modern, sold) | Bottmann calls it the only Brazilian translation she knows made from the Latin. Seen only in her blog post `goodreads.com/author_blog_posts/14436058-a-utopia-no-brasil`; not seen in a catalogue. |
| | 3. Autêntica 2019, "2. ed.", bilingual Latin–Portuguese, described as "a primeira tradução brasileira da obra feita diretamente do latim" | `minhabiblioteca.com.br/catalogo/livro/79574/utopia` | C | The page names no translator. Catalogue listing only. |
| | 4. Anah de Melo Franco, Editora UnB 1980 (Clássicos IPRI; reissued 2004); 5. Jefferson Luiz Camargo & Marcelo Brandão Cipolla, Martins Fontes 1993 (3rd ed. 2009); 6. Paulo Neves, L&PM 1997 | – | C | All seen only in Bottmann's post. Their source language is not stated. Two other editions are reported to be disguised copies and should be avoided: Rideel (credited to "Heloísa da Graça Buratti", a copy of Andrade) and Martin Claret ("Pietro Nassetti", a copy of Maria Isabel Gonçalves Tomás). |
| | 7. European Portuguese: José Marinho, *A utopia*, Guimarães Editores, Lisboa [1961]; Maria Isabel Tomás, *Utopia*, Europa-América 1973 | Open Library records only | C (José Marinho died 1975; Europa-América still in print) | Catalogue listings only; no online text. BNP's digital library has only the two 1518 Basel Latin editions (items 84301 and 91158), with no Portuguese version. |
| **A Dialogue of Comfort against Tribulation** | Aldo dos Santos Dias, *Um Diálogo de Conforto contra a Tribulação*, "Queluz", 2024, ISBN 9786501113319 (a Brazilian 978-65 prefix) | – | C | Seen only in the pt.wikipedia "Thomas More" bibliography (raw wikitext), not in a catalogue. No online text. |
| **De Tristitia Christi** | Aldo dos Santos Dias, *A Tristeza, o Enfado, o Pavor e a Oração de Cristo antes de Sua Captura*, Queluz, n.d., ISBN 9786501862163 | – | C | pt.wikipedia listing only. archive.org `SantoTomsMoroLaAgonaDeCristo` is **Spanish**, not Portuguese. No other Portuguese version was found; the Quadrante and Ecclesiae catalogues were not checked. |
| **The Four Last Things** | Aldo dos Santos Dias, *Lembra-te do teu Fim*, Queluz 2024, ISBN 9786501262772 | – | C | pt.wikipedia listing only. |
| Treatise on the Passion | Aldo dos Santos Dias, *Um Tratado (intérmino) sobre a Paixão de Cristo*, Queluz 2025, ISBN 9786501368696 | – | C | pt.wikipedia listing only. |
| A Dialogue concerning Heresies | Aldo dos Santos Dias, *Um Diálogo sobre Heresias*, Queluz 2026, ISBN 9786502181454 | – | C | pt.wikipedia listing only. |
| Last letter to Margaret Roper (5 July 1535) | anonymous Wikisource contributors, *Última carta de Thomas More* | `https://pt.wikisource.org/wiki/Última_carta_de_Thomas_More` | **B**: the page carries `{{GFDL}}`, an open licence, translator unnamed | Complete letter, ≈550 words, clean wikitext. The source text it was translated from is not stated. It is the only item in pt.wikisource's "Categoria:Thomas More". |
| Prayers (*Godly Meditation* "Give me thy grace, good Lord", the Tower prayers), Life of Pico, English poems, polemics other than *Heresies*, Latin works other than *Utopia*, letters | none found | – | – | Searched archive.org, pt.wikisource and Open Library. pt.wikipedia lists "Piedosa Instrução", "Orações" and "Epitáfio" with no translator or edition, and "Um homem para todas as horas" for the correspondence. The prayer texts that circulate on Brazilian devotional sites could not be searched once the budget ran out. |

### St. John Fisher

**No Portuguese translation of any Fisher work was found.** Searched: archive.org (`"john fisher"` with santo/são/bispo, and `creator:fisher` with `language:por`), pt.wikisource (no hits besides an unrelated "T. Fisher Unwin"), pt.wikipedia (the "John Fisher" article cites no translations), Open Library ("John Fisher Rochester"), and Montfort (site search). Brazilian Catholic publishers and Domínio Público remain unchecked (see above).

### Notes

- **Andrade/Ridendo is a translation of a translation.** It renders Stouvenel's 1842 French, including his paraphrases. One example: in the praise of Tunstall, Stouvenel's proverb "faire voir le soleil une lanterne à la main" becomes Andrade's "chover no molhado". It is a fluent pt-BR reading text, but not a witness to More's Latin, and its rights status is unresolved. Use it as stylistic reference only.
- **The Queluz series** (Aldo dos Santos Dias: *Four Last Things*, *Dialogue of Comfort*, *Treatise on the Passion*, *De Tristitia*, *Heresies*, plus Stapleton's life of More) is the only Portuguese coverage of More's devotional works I found. It is evidently a recent, small, probably self-published series (Brazilian ISBNs). I did not verify a publisher page, price or licence; treat it as C until someone sees it.

**Recommendation:** no Portuguese text here is importable as tier A, and none of the headline works is available as B. The only free-licensed text is the Wikisource *Last letter* (B, ≈550 words). For our pt-BR *Utopia*, translate from the Latin. Consult Vozes 2016 or Autêntica 2019 (both from the Latin, both C) for terminology if a copy is at hand; the Andrade/eBooksBrasil text, being from the French, is only a fallback stylistic reference. For the *Dialogue of Comfort*, *De Tristitia*, the *Four Last Things* and all of Fisher, pt-BR comes from our own pipeline, with no Portuguese reference available.
