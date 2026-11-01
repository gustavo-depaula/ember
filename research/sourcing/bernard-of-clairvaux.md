# St. Bernard of Clairvaux (1090–1153): sourcing report

Canon follows the critical *Sancti Bernardi Opera* (SBO), edited by J. Leclercq, H. Rochais and C. H. Talbot (8 vols, Editiones Cistercienses, Rome 1957–77). Its text is copyrighted, but its table of contents is the authority. The public-domain base is Mabillon's Maurist edition (1667/1690), reprinted by Gaume (1839) and in Migne PL 182–185. Nothing by Bernard is in the corpus yet (no hits in `_corpus-books.txt` or `content/books/`).

## Source keys

**Latin**
- **[CC]**: Corpus Corporum, *Patrologia Latina*, author "Bernardus Claraevallensis" (id 2268): 72 work entries, **790.9k words**. Browse: `https://mlat.uzh.ch/browser?path=/38/2268/<work-id>`. TEI download: get the text id from `https://mlat.uzh.ch/php_modules/navigate.php?load=/38/2268/<work-id>`, then `https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=<text-id>`. The edition is Migne PL 182–185 (= Mabillon), machine-corrected OCR. I checked two texts:
  - *Sermones in Cantica*, text 11258: 173.7k words, 872 `<head>`s (each sermon plus its numbered paragraphs), clean.
  - *Epistolae*, text 21392: 188.7k words, letters I–CDLX with Mabillon's *Monita*, clean.

  **Tier A.** Copies are in `bernard-of-clairvaux/cc/`. Four CC entries have 0 words (*In verba Evangelii*, *Formula honestae vitae*, *In Canticum B. V.*, *In verba Matthaei*). Liturgical-year sermons are split into one CC entry per feast.
- **[DCO-LT]**: Documenta Catholica Omnia, author page `https://www.documentacatholicaomnia.eu/20_50_1090-1153-_Bernardus_Claraevallensis_Abbas,_Sanctus.html`. It has 37 "LT" Word files, **retyped** rather than OCR'd, and has the letters in five files (1–100 … 401–460). I opened *De diligendo Deo* (`…/03d/1090-1153,_Bernardus_Claraevallensis_Abbas,_De_Diligendo_Deo,_LT.doc`, 11.9k words): it carries PL column 0971 and Mabillon's *Admonitio*, so it is PL text and clean. **Tier A**, the best second Latin witness against CC's OCR. Sample in `bernard-of-clairvaux/dco/`.
- **[DCO-MLT]**: the same site's 83 PL page-scan PDFs, with a poor OCR layer. **A**.
- **[WM]**: Watkin Williams & Barton R. V. Mills, *Select Treatises of S. Bernard: De diligendo Deo & De gradibus humilitatis et superbiae* (Cambridge Patristic Texts, 1926). A corrected Latin text with notes. `https://archive.org/details/dediligendodeo`. **A**.
- **[Gaume]**: Mabillon's edition as reprinted by Gaume, Paris 1839 (*Opera omnia … post Horstium denuo recognita*), `https://archive.org/details/p1operaomniasanc01bern`, `…p2operaomniasanc02bern`, `operaomniapostho01bernuoft`, `…05bern`. Scans with Latin OCR. **A**.
- **[WS]**: la.wikisource, `https://la.wikisource.org/wiki/Scriptor:Bernardus_Claraevallensis`. Only *De laude novae militiae* and *Sermones in Canticum Canticorum*; edition not checked. **A**.
- **[SBO]**: the critical edition. **C**. Use it only for numbering concordance, especially for the *Sententiae* and *Sermones de diversis*, which SBO enlarged greatly. The old online SBO transcription at binetti.ru is gone: the domain now serves a betting-spam page.

**English**
- **[Eales]**: Samuel J. Eales (tr. and ed.), *Life and Works of Saint Bernard, Abbot of Clairvaux, edited by Dom John Mabillon* (John Hodges, London 1889–96; 2nd ed. Burns & Oates/Benziger). archive.org, by volume:

  | Vol. | Contents | archive.org | Raw words | Quality |
  |---|---|---|---|---|
  | 1 | Prefaces, chronology, letters 1–145 | `https://archive.org/details/saintbernardlife00bernuoft` | 180k | 0.98 |
  | 2 | Letters 146–380, including the anti-Abelard treatise (Ep. 190) | `…/saintbernardlife02bernuoft` | 197k | 0.98 |
  | 3 | Letters 381–490 (spurious omitted), Advent sermons I–XIX and *Missus est* | `…/lifeworksofsaint03bern` | 152k | 0.98 |
  | 4 | *Cantica Canticorum: Eighty-Six Sermons* | `…/LifeAndWorksOfSaintBernardV4` | 336k raw (Google scan, boilerplate included) | 0.98 |

  Duplicate scans: `LifeWorksOfSBernardClairvauxV1`–`V4`, `lifeworksofsaint01bern`/`02bern`. **Tier A.**
- **[MM-S]**: *St. Bernard's Sermons for the Seasons & Principal Festivals of the Year*, "translated from the original Latin by a Priest of Mount Melleray" (Ailbe J. Luddy, O.Cist.), 3 vols (Browne & Nolan, Dublin 1921–25). Coverage: the *Sermones de tempore* (Advent to the Sundays after Pentecost), the 17 sermons on *Qui habitat* (Lent), and the *Sermones de sanctis*. archive.org:
  - vol. 1 (1921): `https://archive.org/details/stbernardssermon0001prie_y4z3`, 144k raw words
  - vol. 2 (1923): `…/stbernardssermon0002prie_a0a5`, 152k raw
  - vol. 3 (1925): `…/stbernardssermon0003prie_s9b1`, 173k raw
  - Newman Press reprint: `…/stbernardssermon0000prie`

  OCR quality 0.97. **Tier A** (published 1921–25).
- **[MM-C]**: *St. Bernard's Sermons on the Canticle of Canticles*, by the same Mount Melleray priest, 2 vols (Browne & Nolan 1920). `https://archive.org/details/stbernardssermon01bern` (163k raw) and `…02bern` (175k raw), quality 0.97. **A**.
- **[MM-Cons]**: *St. Bernard's Treatise on Consideration*, by the same priest (Browne & Nolan 1921). `https://archive.org/details/stbernardstreati00bern` (87k raw, which includes a long introduction and notes). **A**.
- **[Lewis]**: George Lewis, *Saint Bernard On Consideration* (Clarendon Press, Oxford 1908). `https://archive.org/details/bernarddeclirvau00bernuoft` (56k raw, 0.98). **A**.
- **[Patmore]**: Marianne Caroline & Coventry Patmore, *St. Bernard on the Love of God* (Kegan Paul 1881; 2nd ed. Burns & Oates 1884). `https://archive.org/details/OnTheLoveOfGod`, `https://archive.org/details/saintbernardlove00bernuoft` (50k raw, which includes the "Three Rosaries of Our Lady"). **A**.
- **[CCEL-LG]**: *On Loving God*, CCEL HTML (`https://ccel.org/ccel/bernard/loving_god/loving_god`), "made available to the net by Paul Halsall". The translator is not named; the wording is not Patmore's (ch. 2 opens "Those who admit the truth of what I have said know, I am sure, why we are bound to love God"). CCEL and Gutenberg (audio #21152) both treat it as public domain. **Unverified** until the translator is identified. It is widely reproduced, but I could not trace its printed source.
- **[Mills]**: Barton R. V. Mills, *The Twelve Degrees of Humility and Pride* (SPCK/Macmillan 1929). `https://archive.org/details/MN41533ucmf_0` (37k raw, 0.98). **A**.
- **[Burch]**: George Bosworth Burch, *The Steps of Humility* (Harvard 1940; Latin and English). archive.org lending only. **Unverified** (renewal not checked).
- **[WW-G]**: Watkin W. Williams, *Concerning Grace and Free Will* (SPCK 1920), with the Latin text. `https://archive.org/details/treatiseofstbern00bern`, `cu31924029216681`. **A**.
- **[WW-Conv]**: Watkin Williams, *St. Bernard of Clairvaux: Of Conversion* (Burns Oates & Washbourne 1938). archive.org: `stbernardofclair0000watk`, lending only. **A** under the brief's 70-year rule, since the translator died in 1944. US status is unverified (a 1938 UK publication).
- **[Lawlor]**: H. J. Lawlor, *St. Bernard of Clairvaux's Life of St. Malachy of Armagh* (SPCK 1920). Gutenberg #25761 (`https://www.gutenberg.org/ebooks/25761`), CCEL (`https://ccel.org/ccel/bernard/st_malachy/st_malachy`), archive.org `stbernardofclair00bernuoft`. Clean e-text. **A**.
- **[Wash]**: *Sermons of St. Bernard on Advent and Christmas, including the famous treatise on the Incarnation called "Missus est"* (R. & T. Washbourne/Benziger 1909). `https://archive.org/details/sermonsofstberna00bernuoft` (46k raw, 0.98). **A**.
- **[Gasquet]**: *Some Letters of Saint Bernard*, Eales's translation selected by F. A. Gasquet (John Hodges 1904; Benziger 1906). `https://archive.org/details/somelettersofsai00bernuoft`; also CCEL HTML `https://ccel.org/ccel/bernard/letters/letters`. **A**. It is a subset of [Eales], useful as a second transcription.
- **[Coulton]**: G. G. Coulton, *Life in the Middle Ages* IV (Cambridge 1930). Contains the famous chapter of the *Apologia* on monastic art, as an extract only. archive.org `lifeinmiddleages0004ggco`. **A** (1930).
- **Tier C, for reference.** *The Letters of St Bernard*, tr. Bruno Scott James (Burns Oates 1953). The Cistercian Fathers series (Kalamazoo, 1970–): Walsh/Edmonds *On the Song of Songs*; Greenia *In Praise of the New Knighthood*; Casey *Apologia*; the *Sermons for the Summer Season*; and the *Sermones de diversis*. *St Bernard on the Song of Songs*, tr. a Religious of CSMV (Mowbray 1952).

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **Treatises** | | | | | | |
| De gradibus humilitatis et superbiae | 1 [CC] 6156; 2 [WM] 1926; 3 [DCO-LT]? (DCO lists only the ES file; use DCO-MLT); 4 [Gaume] | A | 1 [Mills] 1929; 2 [Burch] 1940; 3 C: Webb & Walker 1957 | A / unv. | 12.6k / ~15k | no |
| Apologia ad Guillelmum | 1 [CC] 6148; 2 [DCO-LT]; 3 [Gaume] | A | partial only: [Coulton] 1930 (art chapter); C: Casey 1970 | A partial | 7.2k / – | no |
| De diligendo Deo | 1 [CC] 6155; 2 [DCO-LT] (retyped PL); 3 [WM] 1926 | A | 1 [Patmore] 1881/84; 2 [CCEL-LG] (translator unknown) | A / unv. | 10.8k / ~13k | no |
| De gratia et libero arbitrio | 1 [CC] 6157; 2 [DCO-LT]; 3 [WW-G] 1920 (Latin en face) | A | 1 [WW-G] 1920 | A | 11.3k / ~14k | no |
| De laude novae militiae | 1 [CC] 6158; 2 [DCO-LT]; 3 [WS] | A | none PD (C: Greenia 1977) | – | 8.1k / – | no |
| De praecepto et dispensatione | 1 [CC] 6160; 2 [DCO-LT] | A | none PD (C: Greenia, Cistercian) | – | 13.6k / – | no |
| De conversione ad clericos | 1 [CC] 6153; 2 [DCO-LT] | A | 1 [WW-Conv] 1938 | A (US unv.) | 8.8k / ~10k | no |
| De consideratione | 1 [CC] 21483; 2 [DCO-LT]; 3 Paris 1845 school ed., `https://archive.org/details/sbernardidecons00berngoog` | A | 1 [Lewis] 1908; 2 [MM-Cons] 1921 | A | 26.2k / ~32k | no |
| De moribus et officio episcoporum (= Ep. 42) | 1 [CC] 6159; 2 [DCO-LT] | A | 1 [Eales] vol. 1 (as Letter 42) | A | 9.0k / in Eales | no |
| De baptismo (= Ep. 77) | 1 [CC] 6151; 2 [DCO-LT] | A | 1 [Eales] vol. 1 (Letter 77) | A | 5.3k / in Eales | no |
| Contra quaedam capitula errorum Abaelardi (= Ep. 190) | 1 [CC] 6150; 2 [DCO-LT] "De erroribus Abaelardi" | A | 1 [Eales] vol. 2 (Letter 190 "treatise") | A | 6.8k / in Eales | no |
| Vita S. Malachiae | 1 [CC] 6165; 2 [DCO-LT] | A | 1 [Lawlor] 1920 (Gutenberg/CCEL e-text) | A | 17.8k / ~22k | no |
| **Sermons** | | | | | | |
| Sermones super Cantica canticorum (86) | 1 [CC] 6217 (text 11258); 2 [DCO-LT]; 3 Paris 1888 school ed., `https://archive.org/details/sermonesincanti00berngoog`; 4 [WS] | A | 1 [Eales] vol. 4 (1896); 2 [MM-C] 1920 | A | 163.4k / ~210k | no |
| Sermones per annum (*de tempore*: Advent → Pentecost, Sundays, dedication; 42 CC entries, ids 6168–6211 + 21529) | 1 [CC] per feast; 2 [DCO-LT] "Sermones de tempore"; 3 Paris 1891 school ed., `https://archive.org/details/sermonesdetempo00berngoog` | A | 1 [MM-S] vols 1–3; 2 [Eales] vol. 3 (Advent I–VII, Christmas); 3 [Wash] 1909 (Advent and Christmas) | A | ≈152k (sum of 42 CC entries) / ~185k | no |
| Sermones de sanctis | 1 [CC] per feast (e.g. 6195 All Saints, 6184 Assumption, 6196 Benedict, 6208 Malachy); 2 [DCO-LT] "Sermones de sanctis" | A | 1 [MM-S] vols 2–3 | A | in the ≈152k above | no |
| In psalmum *Qui habitat* (17 sermons) | 1 [CC] 6205; 2 DCO (ES only; use MLT) | A | 1 [MM-S] vol. 1 (Lent) | A | 28.1k / ~34k | no |
| In laudibus Virginis Matris (*Missus est*, 4 homilies) | 1 [CC] 6170; 2 [DCO-LT] | A | 1 [Eales] vol. 3; 2 [Wash] 1909; 3 [MM-S] | A | 12.9k / ~15k | no |
| Sermones de diversis (PL 125; SBO more) | 1 [CC] 6216; 2 [DCO-LT] | A | none PD (C: Cistercian Fathers) | – | 83.1k / – | no |
| Parabolae; Sententiae | 1 [CC] 6213, 6215; 2 [DCO-LT] | A | none PD | – | 6.0k + 3.2k (SBO's Sententiae are far larger; not PD) / – | no |
| **Letters** | | | | | | |
| Epistolae (Mabillon 1–460 plus later finds; SBO about 550) | 1 [CC] 21511 (text 21392); 2 [DCO-LT] 5 files; 3 [Gaume] | A | 1 [Eales] vols 1–3; 2 [Gasquet] selection (Eales); 3 [CCEL] HTML of Gasquet; C: Scott James 1953 | A | 188.7k / ~420k raw across Eales 1–3 (includes prefaces) | no |
| **Liturgical and minor** | | | | | | |
| Prologus in Antiphonarium (De cantu); Officium de S. Victore; hymn on Malachy | 1 [CC] 6152, 6212; 2 [DCO-LT] | A | none PD | – | 4.2k + 1.5k / – | no |
| Chartae; Opuscula duo; Formula confessionis | 1 [CC] 6149, 6161, 6175 | A | none | – | 7.8k / – | no |

**Doubtful or spurious** (in CC under Bernard or "Auctor incertus (Bernardus?)", 52.9k words):
- *Tonale* and *Tractatus cantandi graduale*. These are the Cistercian chant commission's work, not Bernard's.
- *De corpore Domini*.
- *Scala paradisi* (= Guigo II, *Scala claustralium*).
- *De interiori domo*.
- *Meditationes piissimae de cognitione humanae conditionis*.
- *Lamentatio in passionem Christi*.
- *Formula honestae vitae*.
- *Super hymnum Jesu nostra redemptio*.
- *Jubilus / Jesu dulcis memoria* (DCO-LT).
- *Vitis mystica* (DCO "De passione Christi"; it is Bonaventure's).
- *The Golden Epistle* (archive.org `goldenepistleofs00bern`, 1916). This is William of St-Thierry's *Epistola ad fratres de Monte Dei*, not Bernard's.

## Notes per work

- **Letters.** Mabillon's numbering (used by PL, CC and Eales) differs from SBO's for the letters after about 300. Keep Mabillon's numbering, since our Latin and English both use it. Eales omits the spurious letters (Mabillon's appendix) apart from two, and he renumbers 474 and 479 as 460 and 459. Three of Mabillon's "treatises" are really letters and sit inside Eales: Ep. 42 *De moribus*, Ep. 77 *De baptismo*, and Ep. 190 *Contra errores Abaelardi*. Import them once, as letters or as treatises but not both, with a cross-reference.
- **Sermons on the Song of Songs.** CC's TEI has one `<head>` per sermon and per numbered paragraph, so it splits naturally into 86 chapters. Two complete public-domain Englishes exist. Eales's is Victorian. Mount Melleray's is more literal and is annotated.
- **Liturgical sermons.** CC splits them into 42 per-feast entries. The chapter layout should follow the liturgical year as SBO and Mount Melleray do (*Sermones per annum*: Advent … Dedication; then *de sanctis*). Mount Melleray's 3 volumes cover almost all of them. Spot-check that each CC feast entry has a matching Mount Melleray sermon. The volume headings I sampled, from Advent through Low Sunday, Rogations, Ascension, Pentecost, the Sundays after Pentecost and the saints' feasts (Andrew, Clement, Martin, Benedict, Malachy, Humbert, Peter & Paul, All Saints), match.
- **Gaps in English.** The *Sermones de diversis* (83k), *De laude novae militiae*, *De praecepto et dispensatione*, the *Apologia* (except the extract), the *Parabolae* and *Sententiae* have no public-domain English. Their pt-BR must come straight from the Latin.
- **OCR quality.** CC's Bernard texts are clean. The archive.org English scans are good (0.97–0.98 dictionary match) but carry running heads and page numbers. Where CCEL or Gutenberg HTML exists (Malachy, the *Some Letters* selection, *On Loving God*), prefer it.

## Recommendation

Layout: `bernard-opera-omnia/` with these groups:
- `treatises/`: de-gradibus-humilitatis, apologia, de-diligendo-deo, de-gratia-et-libero-arbitrio, de-laude-novae-militiae, de-praecepto, de-conversione, de-consideratione, vita-malachiae.
- `sermones-super-cantica/`: 86 chapters.
- `sermones-per-annum/`: by season, with *Qui habitat* inside Lent and *Missus est* as its own book.
- `sermones-de-sanctis/`.
- `sermones-de-diversis/`.
- `parabolae-sententiae/`.
- `epistolae/`: Mabillon numbering, chunked about 50 letters per file group.
- `dubia/`: optional.

Import order:
1. *De diligendo Deo*, *De gradibus*, *De consideratione*, *De gratia*: CC Latin plus Patmore, Mills, Lewis and Williams. All tier A and short.
2. *Sermons on the Song of Songs*: CC plus Eales vol. 4 or Mount Melleray.
3. The liturgical sermons: CC plus Mount Melleray.
4. Letters: CC plus Eales.
5. *Life of Malachy*: CC plus Lawlor's Gutenberg text.
6. The Latin-only remainder: *De diversis*, the *New Knighthood*, *De praecepto*, *Apologia*, *Parabolae*.

Cannot be sourced cleanly: SBO's critical text and its extra *Sententiae* and *Sermones de diversis* (C); and English for the works listed under gaps. The CCEL *On Loving God* stays unverified until its translator is identified; Patmore is the safe choice.

**Total size.** Latin (PL canon): **≈791k words**, plus ≈53k of doubtful works. Public-domain English: ≈1.1M raw scanned words across Eales and Mount Melleray (including their duplicate coverage and apparatus). Distinct English coverage is roughly 600k words, about 75% of the Latin canon.

## Portuguese

No complete Portuguese translation of any major work is tier A or B. The Portuguese Bernard is almost entirely Brazilian and recent: Paulus, Vozes and Ecclesiae, 2013–2026, all tier C. The one importable tier-A text is the *Memorare*, which is attributed to Bernard but not his.

What I searched:
- archive.org (`language:por`, Portuguese titles)
- pt.wikisource (API full-text search, including the Página namespace)
- Biblioteca Nacional de Portugal (bndigital.bnportugal.gov.pt and purl.pt)
- Documenta Catholica Omnia (Bernard has no PT files there: 40 LT, 84 MLT, 2 EN, 2 IT)
- cristianismo.org.br (only Ribadeneira's *Vida* and a summary of Luddy; no works)
- ricardocosta.com
- the Paulus preview PDFs on `deg.paulus.com.br`
- the Martins Fontes bookshop catalogue (search "bernardo de claraval": 16 hits; spec tables read for each)
- `content/loth/`

Not checked:
- dominiopublico.gov.br (Cloudflare challenge, HTTP 403 to scripts)
- Permanência (HTTP 508 "Resource Limit Is Reached")
- Montfort (its site search returns no matches)
- Obras Católicas (no response)
- Google Books (API daily quota exceeded)
- BN Brasil (no scriptable search)

The session's web-search budget also ran out mid-pass. Older Portuguese printings (18th–19th c.) may exist in BNP/BN Brasil and need a manual browser pass. Downloads are in `bernard-of-clairvaux/pt/`.

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| **De diligendo Deo** | 1. *Tratado sobre o amor de Deus*, tr. Nei Ricardo de Souza (Paulus, São Paulo 2015; ISBN 978-85-349-4147-1; 104 pp.). The ficha gives "Título original: De diligendo Deo", so it is from the Latin. Best reference. | preview `https://deg.paulus.com.br/4075.pdf` (5 pp. of front matter only) | **C** ("© Paulus – 2015") | complete (per listing); print only |
| | 2. Gilson, *A teologia mística de São Bernardo* (Paulus 2017), with the Latin passages translated by Pe. José Dias Goulart. Quotations inside a study, not the treatise. | `https://deg.paulus.com.br/4429.pdf` (preview) | C | excerpts only |
| **De gradibus humilitatis et superbiae** | 1. *Os degraus da humildade e da soberba*, tr. Frei Ary E. Pintarelli (Vozes 2025; ISBN 9788532672568; 96 pp.). Seen only in the bookshop listing. | `https://www.martinsfontespaulista.com.br/os-degraus-da-humildade-e-da-soberba-1163496/p` | **C** (current Vozes title) | complete (per listing); print only |
| **De gratia et libero arbitrio** | 1. *Opúsculo sobre o livre-arbítrio* (Ecclesiae, 1st ed. 2013, ISBN 9788563160393, 99 pp.; 3rd ed. 2025, ISBN 9788584913237, 132 pp.). The listing says it was translated "diretamente do latim" but names no translator. | `https://www.martinsfontespaulista.com.br/opusculo-sobre-o-livre-arbitrio-845300/p`, `…-1177207/p` | **C** | complete (per listing); print only |
| **De consideratione** | 1. *Da Consideração (1149-1152)*, tr. and notes by Ricardo da Costa (ricardocosta.com, online since about 2010). His note 1: "Tradução a partir da edição *Obras completas de San Bernardo* II. Madrid: BAC, MCMXCIV, p. 52-185". BAC is a Latin–Spanish bilingual edition, so the Latin/Spanish basis is ambiguous. Page numbers [394]–[419] are inlined. | `https://www.ricardocosta.com/traducoes/textos/da-consideracao-1149-1152` (old URL `/textos/bernardo2.htm` redirects) | **C** (footer "© 1998-2026 Ricardo da Costa", no licence; ask him if wanted) | **books I–II only** (of V); about 11.4k words on the page, including about 210 notes; clean HTML |
| | No complete Portuguese *De consideratione* found. | | | |
| **Contra errores Abaelardi** (Ep. 190) | 1. *As heresias de Pedro Abelardo* (É Realizações 2017; ISBN 9788580332940; 120 pp.). Translator not shown on the listing. | `https://www.martinsfontespaulista.com.br/heresias-de-pedro-abelardo--as-809426/p` | **C** | presumably complete; print only |
| **In laudibus Virginis Matris** (*Missus est*) | 1. *Louvores à Virgem Maria*, tr. Pe. Mário José Santos (Paulus 2026; ISBN 9788534964715; 96 pp.). The ficha gives "Título original: *Lodi della Vergine Madre*", so it is translated from Italian. The preview's sumário lists Homilies I, II, III and "VI" (a misprint for IV), plus the "Sermão na natividade de Maria Santíssima" (*De aquaeductu*). | `https://deg.paulus.com.br/9788534964715.pdf` (preview) | **C** | 4 homilies complete; secondhand (from Italian) |
| | 2. *Sermões sobre Nossa Senhora*, tr. Frei Ary E. Pintarelli (Vozes 2025; ISBN 9788532669261; 264 pp.). Contents not seen; at 264 pp. it probably holds the homilies plus the Marian feast sermons, but this is unverified. | `https://www.martinsfontespaulista.com.br/sermoes-sobre-nossa-senhora-1125659/p` | **C** | unverified |
| | 3. *A Virgem Mãe* (Cultor de Livros 2022; ISBN 9788556382658; 150 pp.). Translator and contents not shown on the listing; the title suggests *In laudibus*, unverified. | `https://www.martinsfontespaulista.com.br/a-virgem-mae-1014527/p` | **C** | unverified |
| | 4. *Tratado dos louvores da Virgem Mãe*, "tradução portuguesa da Irmã Margarida Martins da Silva (o Tratado) e Isabel A. Ferreira (a introdução)", apparently a Portuguese–Spanish edition with Damián Yáñez Neira's Spanish. Seen only as a search snippet of a catalogue entry (readinglength.com, which returns 403); publisher and year not verified. | – | unverified, probably C | – |
| | 5. *Liturgia das Horas* (Brazilian edition), Office of Readings: Hom. 2,1-2.4 and Hom. 4,8-9. | already in `content/loth/parts/reading-09.json`, `reading-14.json` | in corpus | excerpts |
| **Sermones per annum** (de tempore, de sanctis) | 1. *Sermões*, vol. 1 and vol. 2, tr. Luiz Fernando Dias Pita (Paulus, Coleção Clássicos do Cristianismo 14/1, 2023, ISBN 978-85-349-5199-9, 472 pp.; 14/2, 2026, ISBN 978-85-349-6544-6, 528 pp.). The ficha gives "Título original: *Sancti Bernardi Abbatis Claraevallensis Sermones*", so it is from the Latin. The vol. 2 preview sumário runs from late Lent through Palm Sunday ("Sobre a procissão e a Paixão"), Holy Week, Easter and its octave, the Ascension (6 sermons) and Pentecost (3), then on to a "Sermão aos abades" and sanctoral sermons ("Da dupla assunção", "Sobre o seio de Abraão…"). Vol. 1's preview shows only the presentation; its contents were not seen (presumably Advent to Lent). | `https://deg.paulus.com.br/7315.pdf` (vol. 1 preview), `https://deg.paulus.com.br/9788534965446.pdf` (vol. 2 preview) | **C** ("Todos os direitos reservados pela Paulus Editora") | the most extensive Portuguese Bernard; print only |
| | 2. *Sermões de Natal* (Quadrante, Coleção Devocional pocket, 3rd ed. 2023; ISBN 9788574655758; 128 pp.). Translator and contents not shown on the listing. | `https://www.martinsfontespaulista.com.br/pocket-sermoes-de-natal---3ª-edicao---colecao-devocional-1078288/p` | **C** | selection |
| | 3. *Liturgia das Horas* excerpts: In Adventu 5; In Epiphania 1; *Qui habitat* 12; Sunday in the octave of the Assumption; *De aquaeductu*; "Sermo 2" (the saints in glory). | `content/loth/parts/reading-10…14.json` | in corpus | excerpts |
| **In psalmum Qui habitat** | only the LoH excerpt (Sermo 12,3.6-8). The Paulus *Sermões* vol. 1 may contain it (Lent), unverified. | `content/loth/parts/reading-11.json` | in corpus / C | excerpt |
| **Sermones super Cantica** | No Portuguese translation, complete or partial, found. LoH has Sermo 61,3-5 and 83,4-6 (`reading-02.json`, `reading-09.json`). A *Medievalis* 2012 article quotes Sermon 20,4 "in (SANTOS, 2001)", a source I could not identify. | – | – | gap |
| **Sermones de diversis** | 1. *Sermões diversos* (Ecclesiae 2023; ISBN 9786587135984; 376 pp.). Translator not shown on the listing; the description covers the short *diversis* sermons. Whether it covers all of PL's 125 is not verified. 2. LoH: de diversis 5 and 15 (`reading-02/10/16.json`). | `https://www.martinsfontespaulista.com.br/sermoes-diversos-1038678/p` | **C** | unverified extent; print only |
| **Epistolae** | 1. Ep. 1, to his nephew Robert: tr. Ricardo da Costa, "a partir da edição *Obras completas de San Bernardo* (edición bilíngüe), BAC 1990, vol. VII". About 4.6k words on the page, with notes. | `https://www.ricardocosta.com/traducoes/textos/carta-de-bernardo-roberto-seu-sobrinho-que-mudou-da-ordem-cisterciense-para` | **C** (© notice) | one letter; clean HTML |
| | 2. Ep. 241, to Count Hildefonsus on the heretic Henry: "Tradutor do texto latino: Gustavo Petrônio Toledo"; its stated source is Abbé Charpentier's *Œuvres complètes de Saint Bernard*, vol. I (Vivès 1865). An uploaded PDF, item "145." of an unnamed series; no licence stated. | `https://archive.org/details/145.-sao-bernardo-de-claraval-epistola-ccxli-1147` | unverified | one letter, about 1k words; clean born-digital text |
| | 3. Ep. 190: see É Realizações above. | | | |
| **Memorare** (traditionally "Oração de S. Bernardo"; not Bernard's) | 1. José Ignacio Roquette, *Novas Horas Marianas ou Officio Menor da SS. Virgem Maria* (Guillard, Aillaud & Cª, Paris 1888), p. 217: "Lembrai-vos, ó piedosissima Virgem Maria, que nunca jamais se ouvio…". Old spelling ("ouvio", "Mãi", "Deos"). | `https://pt.wikisource.org/wiki/Página:Novas_Horas_Marianas_ou_Officio_Menor_da_SS._Virgem_Maria_Nossa_Senhora.pdf/257` (and `/258`) | **A** (published 1888; Roquette d. 1870) | complete; wiki text proofread to level 3, with the Commons scan behind it |
| **Meditationes piissimae** (spurious) | 1. Old Portuguese, 15th c.: *Virgeu de consolaçon. Meditações de São Bernardo. Visão de Túndalo*, Alcobaça codex ALC-211 (BNP). A 2023 *LaborHistórico* article (revistas.ufrj.br) edits part of the "Tractado das meditações e pensamentos de Sã Bernardo"; I saw it only in a search result. | `https://purl.pt/24108` | **A** | manuscript scan only |
| Apologia; De laude novae militiae; De praecepto; De conversione; Vita Malachiae; Parabolae; Sententiae; De moribus episcoporum; De baptismo; liturgical pieces | none found | – | – | gap |

Notes:
- **Portuguese titles to search for in a manual pass:** *Tratado do amor de Deus* (often confused with St Francis de Sales's *Tratado do amor de Deus*, Paulus/Leme), *Os graus da humildade*, *Da consideração*, *Sermões sobre o Cântico dos Cânticos*, *Louvores da Virgem Mãe* / *Homilias sobre o Missus est*. Cistercian Portugal (Alcobaça) is the likeliest source of pre-1930 printings. None turned up in archive.org or BNP's scripted search, but those catalogues can't be searched by phrase.
- **Ricardo da Costa's pages** are the only free online Portuguese Bernard of any length (*De consideratione* I–II, Ep. 1). They carry a copyright notice, so they are C. They are useful as a reading reference, but his base is the BAC bilingual edition.
- **The *Liturgia das Horas* excerpts in `content/loth/`** are the Portuguese the app already shows for Bernard. For the passages they cover (Cant. 61 and 83, *Missus est* 2 and 4, Advent 5, *Qui habitat* 12, *De diversis* 5 and 15, …), our pt-BR should be checked against them for consistency of key phrases.
- Already in the corpus elsewhere: nothing of Bernard's in `pt-BR` under `content/books/`.

**Recommendation.** Translate pt-BR from the CC Latin through our own pipeline; no Portuguese Bernard can be imported except the *Memorare* (Roquette 1888, tier A, after modernising the spelling). Best references to consult:
- *De diligendo Deo*: Paulus 2015 (Souza).
- *De gradibus*: Vozes 2025 (Pintarelli).
- *De gratia*: Ecclesiae.
- *De consideratione*: Ricardo da Costa, I–II only.
- The liturgical sermons: Paulus *Sermões* 1–2 (Pita, from the Latin).
- *Missus est*: Vozes 2025 (Pintarelli), if it proves to contain the four homilies (unverified). Paulus 2026 does contain them, but it is translated from the Italian.

There is no Portuguese reference at all for the Song of Songs sermons beyond the two LoH excerpts.
