# St. Robert Bellarmine (1542–1621): sourcing report

Bibliography basis: the Vivès *Opera omnia* (ed. Justin Fèvre, Paris 1870–74, 12 vols), whose per-volume tables of contents I read from the OCR (downloads in `bellarmine/vives/`); la.wikisource `Scriptor:Robertus Bellarminus`; and Bellarmine's own *Recognitio librorum omnium* (1608, Vivès t. 1). Word counts are OCR tokens from archive.org `_djvu.txt` files (`wc -w`). They include running heads, notes and indexes, and hyphenated words split at line ends count as two, so a count runs about 5–10 % above the real text.

Nothing by Bellarmine is in the corpus (`_corpus-books.txt` and `content/books/` checked).

## Summary

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| *Disputationes de controversiis christianae fidei* (15 controversies, ~60 books) | Vivès t. 1–6 OCR: [t.1](https://archive.org/details/operaomnia01bell_0) [t.2](https://archive.org/details/operaomnia02bell_0) [t.3](https://archive.org/details/operaomnia03bell_0) [t.4](https://archive.org/details/operaomnia04bell) [t.5](https://archive.org/details/operaomnia05bell) [t.6](https://archive.org/details/operaomnia06bell_0) | A | Only *De laicis*: K. E. Murphy, Fordham UP 1928, [archive](https://archive.org/details/in.ernet.dli.2015.260111). Everything else: Ryan Grant (Mediatrix Press, 2015–), Kenneth Baker SJ (2016) | A (De laicis) / C (rest) | ≈2.51M / 33k | no |
| *Recognitio librorum omnium* (1608) | Vivès t. 1 | A | none | – | ~25k est. / – | no |
| *De indulgentiis* (2 bks), *Appendix de cultu imaginum*, *Judicium de libro Concordiae* | Vivès [t. 7](https://archive.org/details/operaomnia07bell) (first ~90k tokens) | A | none | – | 90k / – | no |
| *Appendix ad libros de Summo Pontifice*, *De exemptione clericorum*, *De translatione imperii* | Vivès t. 6 (end) | A | none | – | ~120k est. / – | no |
| Venetian Interdict *Risposte* (Italian, 1606) | Vivès [t. 8](https://archive.org/details/operaomnia08bell) | A | none | – | 60k / – | no |
| *De potestate Summi Pontificis in temporalibus* (vs Barclay), *Apologia* (vs James I), *Responsio Matthaei Torti* | Vivès [t. 12](https://archive.org/details/operaomnia12bell) | A | Tutino, *Writings on Temporal and Spiritual Authority* (Liberty Fund 2012) | C | ~150k est. / – | no |
| *De officio principis christiani* (1619) | Vivès t. 8 | A | none found | – | 97k / – | no |
| *De ascensione mentis in Deum* (1615) | Vivès t. 8 | A | "Monialis", *The Mind's Ascent to God*, 1925, [archive](https://archive.org/details/mindsascenttogod00bell); F. Young 1616, [EEBO-TCP A08035](https://github.com/textcreationpartnership/A08035) | A | 55k / 83k (with intro) | no |
| *De aeterna felicitate sanctorum* (1616) | Vivès t. 8 | A | J. Dalton, *Eternal Happiness of the Saints*, London: Richardson [18--], [archive](https://archive.org/details/theeternalhappin00belluoft); T. Everard ("A.B."), 1638, [TCP A08047](https://github.com/textcreationpartnership/A08047) | A | 54k / 68k | no |
| *De gemitu columbae* (1617) | Vivès t. 8 | A | none complete (an excerpt in the 1638 Everard volume) | – | 64k / – | no |
| *De septem verbis* (1618) | Vivès t. 8 | A | Anon., Burns & Oates 1877, [archive](https://archive.org/details/sevenwordsspoken00bell); 1638, [TCP A08054](https://github.com/textcreationpartnership/A08054) | A | 43k / 61k | no |
| *De arte bene moriendi* (1620) | Vivès t. 8 | A | J. Dalton, 1847, [archive](https://archive.org/details/theartofdyingwel00belluoft); E. Coffin 1621, [TCP B00457](https://github.com/textcreationpartnership/B00457) | A | 51k / 37k | no |
| *Tractatus de cognitione Dei* (Vivès t. 8; attribution not verified) | Vivès t. 8 | A | none | – | 18k / – | no |
| *Conciones habitae Lovanii* (Louvain sermons) | Vivès [t. 9](https://archive.org/details/operaomnia09bell) | A | none (Baxter, *Sermons from the Latins*, 1902, are free adaptations) | – | 500k / – | no |
| *Explanatio in Psalmos* (1611) | Vivès [t. 10](https://archive.org/details/operaomnia10bell), [t. 11](https://archive.org/details/operaomnia11bell) | A | J. O'Sullivan, Dublin: Duffy 1866, [archive](https://archive.org/details/commentaryonbook0000bell) | A | ≈700k / 495k | no |
| *Dottrina cristiana breve* (Italian, 1597) | Vivès t. 12 | A | R. Gibbons 1614, [TCP A08064](https://github.com/textcreationpartnership/A08064); 1676, [TCP A27362](https://github.com/textcreationpartnership/A27362) | A | ~12k est. / 5k–9k | no |
| *Dichiarazione più copiosa della dottrina cristiana* (Italian, 1598) | Vivès t. 12 | A | R. Hadock, *An Ample Declaration*, 1604, [TCP A07972](https://github.com/textcreationpartnership/A07972) | A | ~45k est. / 43k | no |
| *De scriptoribus ecclesiasticis* (1613) + *Chronologia brevis* | Vivès t. 12 | A | none | – | ~120k est. / – | no |
| *Exhortationes domesticae* (Roman College conferences) | ed. [Brussels 1899](https://archive.org/details/exhortationesdom0000card) | A | none | – | 105k / – | no |
| *Opera oratoria postuma* (unpublished sermons, ed. Tromp, Rome 1942–50, 9+ vols) | archive.org, lending-only (`operaoratoriapos000Nsrob`) | C / unverified | none | – | ? / – | no |
| Autobiography (*Vita*, 1613) | Döllinger & Reusch, Bonn 1887 (Latin + German), [archive](https://archive.org/details/dieselbstbiogra00reusgoog) | A | none PD (Brodrick's biography quotes it) | – | ~10k est. / – | no |
| *Institutiones linguae hebraicae* (1578) | scans only: [1622](https://archive.org/details/bub_gb_2wjBMQoCtNsC) | A (scan) | none | – | ? / – | no |
| Letters | *Epistolae familiares* (1650), [BSB scan](https://archive.org/details/10402190bsb); Le Bachelet, *Bellarmin avant son cardinalat* (1911) and *Auctarium Bellarminianum* (1913), not located online | A (scan) / unverified | none | – | ? / – | no |

**Not Bellarmine's, though printed in his works.** Vivès t. 7, from line ~16 100 to the end (≈445k tokens), is Vitus Erbermann SJ's *Vindiciae* of the Controversies, written against Amesius' *Bellarminus enervatus*. Exclude it. *Solida christianae fidei demonstratio* (1611) is Balduinus Junius' compilation from Bellarmine.

## Sources per work, ranked

### Latin/Italian text (all works)
1. **Vivès 1870–74, Boston College copy**: `operaomnia01bell_0`, `02bell_0`, `03bell_0`, `04bell`, `05bell`, `06bell_0`, `07bell`–`12bell` on archive.org. This is the complete set. The OCR is fair, with typical errors (`Roberti Rellarmini`, `TOMUS`), clean italic Latin, `¬` hyphenation at line ends and two-column flow resolved. **Use as the primary source.**
2. **Vivès, a second scan with an independent OCR**: `bellarminiopera0001just`, `0002`, `0004`, `0005`, `0006`, `robertibellarmin0003just`, `operaomniarobert0007just`, `0008just`, `0009`–`0012just`. Use it for cross-checking OCR errors.
3. **Naples, Giuliano 1856–62** (6 vols in 8; archive.org dates it 1836 by mistake): `operaomnia01bell`, `02bell`, `03bell`, `p1/p2operaomnia04bell`, `p1/p2operaomnia05bell`, `operaomnia06bell`; also as PDFs on [documentacatholicaomnia.eu](https://www.documentacatholicaomnia.eu/20_50_1542-1621-_Bellarminus,_Robertus,_Sanctus.html) (vols 1–4, 6). This is an independent edition with its own OCR, so it is useful for variants.
4. Early prints, scans only: Controversies (Ingolstadt 1586–93; Venice 1599, e.g. `bub_gb_CYhfGhPyoSwC`; 1721, `bub_gb_SfJq79_HdscC`), *De gemitu* 1617 (`bub_gb_5_j4Pj8VVwcC`), *De septem verbis* 1618 (`bub_gb_PN1_t4WhaqIC`), *De officio principis* 1619 (`micro_IA40244319_0030`), *Dichiarazione* 1627 (`bub_gb_SradtmnXlAoC`). Collate against these only when Vivès is doubtful.
5. *Opuscula ascetica* t. 1 (1925) is a separate Latin edition of the ascetical works. It appears only inside the uploader's ["Coleção de Livros"](https://archive.org/details/sao-roberto-belarmino-de-scriptoribus-ecclesiasticis-liber-unus-1728-1) item, with publisher not checked. Tier A by date.

No clean HTML or plain-text Latin of any Bellarmine work exists online: there is nothing on la.wikisource, thelatinlibrary or Corpus Corporum, and DCO has PDF scans only.

### English, per work, best first
- **De ascensione**: (1) Monialis 1925 (Mowbray), a modern and faithful translation; the djvu text is clean, 83k tokens with preface. (2) F. Young 1616, EEBO-TCP A08035, a CC0 keyed transcription in early-modern spelling (69k). (3) *Steps of Ascension to God*, 1705 ([`stepsofascension00bell`](https://archive.org/details/stepsofascension00bell)). (4) *The Soul's Ascension*, 1703 (ECCO scan). Paulist's *Spiritual Writings* (Donnelly & Teske 1989) is tier C.
- **De aeterna felicitate**: (1) Dalton, *Eternal Happiness of the Saints*, Richardson n.d. (c. 1850s), complete and clean. (2) Everard 1638, TCP A08047, CC0 (87k; includes a *De gemitu* excerpt). (3) Jenks, *Ouranography* 1710 (abridged paraphrase, [`ouranographyorh00unkngoog`](https://archive.org/details/ouranographyorh00unkngoog)).
- **De septem verbis**: (1) Burns & Oates 1877, reprinted from the *Messenger of the Sacred Heart*, translator anonymous; clean OCR. (2) 1638, TCP A08054, CC0 (65k).
- **De arte bene moriendi**: (1) Dalton 1847, clean. en.wikisource has it only partially proofread ([The Art of Dying Well](https://en.wikisource.org/wiki/The_Art_of_Dying_Well): preface plus 16 chapters). (2) Edward Coffin 1621, TCP B00457, CC0 (72k). (3) 1720 edition ([`artofdyingwell00bell`](https://archive.org/details/artofdyingwell00bell)). LibriVox audio exists.
- **Explanatio in Psalmos**: O'Sullivan 1866, complete; 495k tokens of fair OCR. en.wikisource has transcribed only the Life and Psalms 1–3.
- **Catechisms**: Hadock 1604 (TCP A07972, the *Dichiarazione* in full); Gibbons 1614 (TCP A08064, the *Dottrina breve*, short); "Christian doctrine… translated into better English" 1676 (TCP A27362). All are CC0 keyed texts in early-modern spelling.
- **Controversies**: only *De laicis* has a PD translation: Murphy 1928 (Fordham UP, © 1928, now PD in the US; DLI scan, OCR fair). Everything else is tier C: Ryan Grant (Mediatrix Press) has translated *De Romano Pontifice*, *De Ecclesia militante*, *De Christo*, *De purgatorio*, *De verbo Dei*, *De clericis* and others, and is sold. Archive.org items such as [`roman-pontiff-saint-robert-bellarmine`](https://archive.org/details/roman-pontiff-saint-robert-bellarmine) and [`on-the-roman-pontiff-bellarmine-st.-robert-bellarmime`](https://archive.org/details/on-the-roman-pontiff-bellarmine-st.-robert-bellarmime) are unauthorized uploads of Grant's translation (the first even carries a false "Public Domain Mark" and the date 1900). **Do not use them.** EEBO-TCP A02568 (1609) has polemical selections only.
- **De gemitu columbae, De officio principis, Conciones, Exhortationes, De scriptoribus, Risposte**: no PD English found. These would be Latin/Italian-only imports, translated by our pipeline.

## Notes per work
- **Controversies.** Structure follows Bellarmine's controversies → books → chapters, e.g. `controversiae/de-summo-pontifice/book-1/chapter-1`. From the Vivès distribution (read from volume heads): t. 1 = Fèvre's prefaces, *Recognitio*, *De verbo Dei*, *De Christo*, *De Summo Pontifice* bks 1–2; t. 2 = *De Summo Pontifice* bks 3–5, *De conciliis et ecclesia militante*, *De clericis*, *De monachis*; t. 3 = *De laicis*, *De purgatorio*, *De ecclesia triumphante* (saints, relics, images), *De sacramentis in genere*, *De baptismo*, *De confirmatione*; t. 4 = *De Eucharistia*, *De missa*, *De poenitentia*; t. 5 = *De extrema unctione*, *De ordine*, *De matrimonio*, *De gratia primi hominis*, *De amissione gratiae et statu peccati*; t. 6 = *De gratia et libero arbitrio*, *De justificatione*, *Appendix de Summo Pontifice*, *De exemptione clericorum*, *De translatione imperii*. Footnotes are sparse marginal references. Per-volume tokens: 408k, 420k, 402k, 443k, 402k, 432k.
- **Vivès t. 8** opens with the Italian *Risposte* (the Venetian Interdict pamphlets), then *De officio principis* (3 books; books 2–3 are lives of holy princes), the five ascetical opuscula and *De cognitione Dei*, then an index. Each ascetical work has a clean book/chapter (*gradus* for *De ascensione*) structure. I measured line ranges per work (Risposte 60k, Officio 97k, Ascensione 55k, Felicitate 54k, Gemitu 64k, Septem verbis 43k, Arte 51k, Cognitione 18k).
- **Vivès t. 12** holds the Barclay treatise, the *Apologia*, the *Responsio* to *Triplici nodo*, the *Dottrina breve*, *De scriptoribus*, the *Dichiarazione*, the *Chronologia* and the general index. Measured: 297k tokens before the indices.
- **Psalms**: t. 10 (361k) and t. 11 (353k), Psalms in Vulgate numbering. Split one chapter per psalm.
- **Conciones**: t. 9, 503k tokens up to `FINIS CONCIONUM`. Split one chapter per *concio*, grouped by liturgical feast.

## Portuguese
Searched: archive.org (language: por), pt.wikisource and web search. I did not query dominiopublico.gov.br or BN Digital directly.
1. *Compendio de doctrina christãm*, 1775 (archive [`compendiodedoct00bellgoog`](https://archive.org/details/compendiodedoct00bellgoog)): an old Portuguese version of the *Dottrina breve*. Tier A; a Google scan, OCR not checked.
2. Modern PDFs bundled in the archive.org ["São Roberto Belarmino: Coleção de Livros"](https://archive.org/details/sao-roberto-belarmino-de-scriptoribus-ecclesiasticis-liber-unus-1728-1): *Disputas sobre a Fé Cristã, t. 1: Sobre o Sumo Pontífice* (2021), *A Monarquia Eclesiástica do Romano Pontífice*, *Catecismo de Doutrina Cristã* (2016). Translators and rights are not stated: **unverified, assume C**.
3. *A Definição de Igreja* (Apostolado São Lucas, 2021, [archive](https://archive.org/details/226.-sao-roberto-belarmino-a-definicao-de-igreja-ed.-2021)): a short excerpt; unverified.
4. *Compêndio da doutrina cristã* (Martins Fontes, in print): C.

No Portuguese translation was found of the ascetical opuscula, the Psalms or the Controversies. A Lisbon print of 1631 (BN Portugal) is the Castilian *Declaracion copiosa*, not Portuguese.

## Recommendation
- Layout: `bellarmine-opera-omnia/<work>`, e.g. `ascetica/de-ascensione-mentis`, `ascetica/de-aeterna-felicitate`, `ascetica/de-gemitu-columbae`, `ascetica/de-septem-verbis`, `ascetica/de-arte-bene-moriendi`, `catechismi/dottrina-cristiana-breve`, `catechismi/dichiarazione-piu-copiosa`, `explanatio-in-psalmos`, `conciones`, `exhortationes-domesticae`, `controversiae/<controversy>`, `polemica/<work>`, `de-officio-principis`, `de-scriptoribus-ecclesiasticis`, `vita`.
- **Import first:** the five ascetical opuscula and the two catechisms. Together they are ~320k Latin/Italian words, each has a tier-A English translation (often two, one of them a CC0 keyed TCP text for cross-checking), and they are what a prayer app needs. Then the Psalms commentary (O'Sullivan English exists), then the Controversies, Latin only plus our translation, *De laicis* excepted.
- **Hard parts:** every Latin source is OCR, with no clean digital Latin anywhere, so each import needs OCR cleanup against the two independent Vivès scans plus Naples. *Opera oratoria postuma* is lending-only (C/unverified). Le Bachelet's letters and documents were not located (unverified). No PD English exists for the Controversies apart from *De laicis*, nor for *De gemitu*, *De officio principis* or the sermons.
- **Total size:** the Vivès OCR is ≈5.09M tokens. Less Erbermann (~0.45M) and indexes (~0.25M), Bellarmine's own text is **≈4.4M tokens (≈4.0M words)**. Add the *Exhortationes* (~0.1M). Usable PD English is ≈0.85M words.
