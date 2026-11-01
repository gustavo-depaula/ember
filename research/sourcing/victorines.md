# The Victorines (Hugh of St Victor, †1141; Richard of St Victor, †1173): sourcing report

The modern critical editions (Corpus Christianorum CCCM 176–177 and following for Hugh, *Hugonis de Sancto Victore Opera*; Ribaillier's *De Trinitate* 1958; Châtillon's *Liber exceptionum* 1958; Sources Chrétiennes; *Victorine Texts in Translation*, Brepols/New City Press) are all **C**. The public-domain base is Migne: **PL 175–177** for Hugh (reprinting the 1648 Rouen edition of the canons of St Victor) and **PL 196** for Richard. Attribution guidance follows R. Goy, *Die Überlieferung der Werke Hugos von St. Viktor* (1976), and the PL editors' own notes. Doubtful items are flagged with "(dub.)". Nothing by either author is in the corpus (`_corpus-books.txt`, `content/books/`: no hits).

## Source keys

**Latin**
- **[CC-H]** / **[CC-R]**: Corpus Corporum, *Patrologia Latina* corpus.
  - Hugh is "Hugo de S. Victore" (author id 2230): 34 works, 750.2k words. CC also has "Auctor incertus (Hugo de S. Victore?)" (id 2229): 5 works, 289.4k words.
  - Richard is "Richardus S. Victoris" (id 2350): 31 works, 533.2k words.

  Browse: `https://mlat.uzh.ch/browser?path=/38/<author-id>/<work-id>`. TEI: get the text id from `https://mlat.uzh.ch/php_modules/navigate.php?load=/38/<author-id>/<work-id>`, then `https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=<text-id>`. The edition is Migne PL, machine-corrected OCR, with `<head>`s per chapter. Two checks:
  - *De sacramentis*, text 11082: 185.4k words, 539 heads (prologue, books, parts, chapters), clean.
  - *Benjamin minor*, text 11528: 24.6k words, chapters I–LXXXVII, clean.

  **Tier A.** Copies are in `victorines/cc/`.
- **[TLL]**: thelatinlibrary.com, `https://www.thelatinlibrary.com/hugo.html`.
  - Didascalicon books I–VI: `hugo/hugo1.html`–`hugo6.html`. PL text with column markers ([770C]…); book I is about 4.2k words.
  - *Soliloquium de arrha animae*: `hugo/hugo.solo.html`, about 8.0k words.

  Clean HTML. **A**. Nothing by Richard.
- **[DCO]**: Documenta Catholica Omnia. Hugh has 45 "MLT" PL-scan PDFs plus 3 retyped "LT" files (*Didascalicon*, *Soliloquium de arrha animae* ×2). Richard has 32 MLT PDFs (author listing "Richardus S Victoris Prior"). **A**, with poor OCR on the MLT files. DCO also has Portuguese renderings of several Hugh opuscula (PT): of no use for import, but worth knowing.
- **[WS]**: la.wikisource, `https://la.wikisource.org/wiki/Scriptor:Hugo_de_Sancto_Victore`, about 32 titles. They include *Didascalicon* (subpages I–VI), *De sacramentis Christianae fidei*, *De arca Noe*, *De arrha animae*, *Practica geometrica*, *De grammatica* and *Epitome Dindimi*. The last three are not in PL; their source is probably Baron's 1966 edition, which is **C**, so check before use. Edition and completeness not checked (the API rate-limited me). Richard has no Scriptor page.
- **[PL-scan]**: Google scans of PL 175–177 and PL 196 on archive.org: `https://archive.org/details/bub_gb_PlZ_Dz0KvCkC`, `bub_gb_1KasbjUZEiAC`, and `richardisanctovi00rich` (PL 196, Garnier 1880). Raw Latin OCR. **A**. The 1621 Rouen Richard is at `bub_gb_IlodL0qDTsUC`.
- **[Buttimer]**: C. H. Buttimer, *Hugonis de Sancto Victore Didascalicon de studio legendi: a critical text* (Catholic University of America, Washington 1939). archive.org `hugonisdesanctov0000brot` / `didascalicon0000brot`, lending only. **Unverified**: a US publication of 1939 whose renewal I have not checked.

**English**
- **[Smith]**: Dom Aloysius Smith, *Explanation of the Rule of St. Augustine by Hugh of St. Victor* (Sands, London 1911). `https://archive.org/details/explanationofthe00vicuoft` (31k raw, 0.98). **A**. An older version is *The Rule of the Great S. Augustin Expounded by … Hugh of S. Victor* (John De Cock, Bruges 1735), `https://archive.org/details/wotb_7197614`, early-modern type with weaker OCR (0.87). **A**.
- **[Pepwell]**: Edmund G. Gardner (ed.), *The Cell of Self-Knowledge: Seven Early English Mystical Treatises printed by Henry Pepwell in 1521* (Chatto & Windus 1910). Item I is *A very devout treatise, named Benjamin, of the mights and virtues of man's soul* (the Cloud-author's Middle English **abridgment** of Richard's *Benjamin minor*). Gutenberg #4544 (`https://www.gutenberg.org/ebooks/4544`, clean e-text, 37k words for the whole book; the Benjamin is only a few thousand). **A**, but it is a loose paraphrase, not a translation.
- **[McKeon]**: Richard McKeon, *Selections from Medieval Philosophers* I (1929). It has no Victorine text. Listed only to rule it out.
- **[Deferrari]**: Roy J. Deferrari, *On the Sacraments of the Christian Faith (De sacramentis)* (Mediaeval Academy of America, Cambridge MA 1951; reprinted and still sold by Wipf & Stock). archive.org copies (`onsacramentsofch0000hugh` lending, plus user uploads). **C** in practice. A 1951 US publication can only be B if its renewal was missed, and I did not verify that. Treat it as unusable unless it is checked.
- **[Taylor]**: Jerome Taylor, *The Didascalicon of Hugh of St. Victor* (Columbia 1961; reissued 1991). **C**.
- **[Herbert]**: Kevin Herbert, *Soliloquy on the Earnest Money of the Soul* (Marquette 1956). **Unverified, probably C** (Marquette still sells the series).
- **[Praise]**: *Praise of Love* (Hugh, *De laude charitatis*; St. Anthony Guild Press, Paterson NJ 1941, 29 pp.). archive.org `praiseoflove0000hugh`, lending only. **Unverified**: possibly B, if not renewed.
- **[CSMV]**: *Hugh of Saint-Victor: Selected Spiritual Writings*, tr. a Religious of C.S.M.V. (Faber 1962). It has *De arca Noe morali* and *De vanitate mundi*. The full text is on archive.org (`hughofsaintvicto012978mbp`, a Digital Library of India scan), but that does not change its status. **C**.
- **C, for reference.** Clare Kirchberger, *Richard of Saint-Victor: Selected Writings on Contemplation* (Faber 1957: parts of *Benjamin minor* and *major*, *De IV gradibus violentae caritatis*, …). Grover Zinn, *The Twelve Patriarchs, The Mystical Ark, Book Three of the Trinity* (Paulist CWS 1979). Ruben Angelici, *On the Trinity* (2011). F. Sherwood Taylor, *The Soul's Betrothal-Gift* (1945). Homann, *Practical Geometry* (1991). The *Victorine Texts in Translation* series.

## Summary table: Hugh of St Victor

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| De sacramentis christianae fidei (2 books, 30 parts) | 1 [CC-H] 6042 (text 11082); 2 [WS]; 3 [DCO] MLT; 4 [PL-scan] PL 176 | A | 1 [Deferrari] 1951 | C (unv.) | 183.4k / – | no |
| Didascalicon de studio legendi (6 books; PL appends as "book VII" the *De tribus diebus*) | 1 [TLL] I–VI (clean HTML); 2 [CC-H] 6047 "Eruditio didascalica"; 3 [DCO] LT; 4 [WS]; 5 [Buttimer] 1939 | A (Buttimer unv.) | 1 [Taylor] 1961 | C | 38.7k (including *De tribus diebus*) / – | no |
| De tribus diebus | in [CC-H] 6047 as Didascalicon VII | A | none PD | – | ≈10k est. / – | no |
| Soliloquium de arrha animae | 1 [TLL]; 2 [DCO] LT ×2; 3 [CC-H] 6050; 4 [WS] | A | 1 [Herbert] 1956; Sherwood Taylor 1945 | unv. / C | 8.0k / – | no |
| De arca Noe morali (4 books) / De arca Noe mystica (Libellus de formatione arche) | 1 [CC-H] 6032, 6033; 2 [WS]; 3 [DCO] | A | [CSMV] 1962 (morali only) | C | 25.6k + 9.1k / – | no |
| De vanitate mundi | 1 [CC-H] 6044; 2 [DCO] | A | [CSMV] 1962 | C | 14.9k / – | no |
| De institutione novitiorum | 1 [CC-H] 6036; 2 [WS] | A | none PD | – | 10.7k / – | no |
| De laude charitatis | 1 [CC-H] 6037; 2 [WS] | A | 1 [Praise] 1941 | unv. | 2.6k / – | no |
| De amore sponsi ad sponsam | 1 [CC-H] 6031; 2 [WS] | A | none PD | – | 2.4k / – | no |
| De modo orandi; De quinque septenis; De septem donis | 1 [CC-H] 6038, 6020; [CC] incertus 793 | A | none PD | – | 4.1k + 3.4k + 1.1k / – | no |
| De substantia dilectionis; De modo dicendi et meditandi (= De meditatione) | 1 [CC] incertus 794, 6028; 2 [WS] | A | none PD | – | 1.9k + 1.4k / – | no |
| De sapientia animae Christi; De quatuor voluntatibus in Christo; De potestate et voluntate Dei; De virginitate B. Mariae; Explanatio in Canticum B. Mariae | 1 [CC-H] 6043, 6040, 6039, 6045, 6022 | A | none PD | – | 4.5k + 1.8k + 0.8k + 8.1k + 7.4k / – | no |
| Expositio in Hierarchiam caelestem Dionysii (10 books) | 1 [CC-H] 6024; 2 [WS] | A | none PD | – | 89.1k / – | no |
| Homiliae in Ecclesiasten (19) | 1 [CC-H] 6025 | A | none PD | – | 61.3k / – | no |
| De scripturis et scriptoribus sacris; Adnotationes in Pentateuchon, Judices, Regum; Adnotatiunculae in Threnos; Expositio in Abdiam | 1 [CC-H] 6021, 6014, 6019, 6015, 6018, 6023 | A | none PD | – | 6.9k + 23.5k + 3.6k + 6.9k + 26.1k + 13.0k / – | no |
| Institutiones in Decalogum; Epistolae | 1 [CC-H] 6049, 6046 | A | none PD | – | 3.4k + 2.4k / – | no |
| Practica geometriae; De grammatica; Epitome Dindimi in philosophiam | not in PL. [WS] has pages (source probably Baron, *Opera propaedeutica*, 1966) | C (unv.) | Homann 1991 (geometry) | C | ~25k est. / – | no |
| Chronicon; Libellus de formatione arche (critical) | unedited, or CCCM 176 | C | – | – | – | no |
| **Doubtful or spurious in PL** | | | | | | |
| Summa sententiarum (dub.; not Hugh) | [CC-H] 6051 | A | none | – | 55.2k | no |
| Quaestiones in epistolas Pauli (spurious) | [CC-H] 6026 | A | none | – | 81.7k | no |
| Expositio in regulam S. Augustini (dub.) | 1 [CC-H] 6048; 2 [WS] | A | 1 [Smith] 1911; 2 1735 Bruges | A | 17.3k / ~25k | no |
| De sacramentis legis naturalis et scriptae (dub.); Adnotatiunculae in Joelem (dub.); De fructibus carnis et spiritus (spurious) | [CC-H] 6041, 6017, 6035 | A | none | – | 9.9k + 19.5k + 3.0k | no |
| Miscellanea (partly authentic); Posteriores excerptiones (= Richard's *Liber exceptionum* part II) | [CC] incertus 6053, 6013 | A | none | – | 173.1k + 115.0k | no |
| Sermones centum (PL 177; attributed to Richard or others) | [PL-scan] PL 177 / [DCO] | A | none | – | ~90k est. | no |

## Summary table: Richard of St Victor

| Work | Original source | Tier | English source | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Benjamin minor (De praeparatione animi ad contemplationem; The Twelve Patriarchs) | 1 [CC-R] 6480 (text 11528); 2 [DCO] MLT; 3 [PL-scan] PL 196 | A | 1 [Pepwell] 1910 (Middle English abridgment only); Kirchberger 1957, Zinn 1979 | A partial / C | 24.2k / ~4k abridged | no |
| Benjamin major (De gratia contemplationis, 5 books; The Mystical Ark) | 1 [CC-R] 6479; 2 [DCO]; 3 [PL-scan] | A | none PD (Zinn 1979, Kirchberger 1957) | C | 54.1k / – | no |
| De Trinitate (6 books) | 1 [CC-R] 6482; 2 [DCO]; 3 [PL-scan] (critical: Ribaillier 1958, C) | A | none PD (Zinn book III; Angelici 2011) | C | 41.5k / – | no |
| De quatuor gradibus violentae charitatis | 1 [CC-R] 6493; 2 [DCO] | A | none PD (Kirchberger) | C | 7.0k / – | no |
| De gradibus charitatis; De exterminatione mali et promotione boni; De statu interioris hominis; De eruditione hominis interioris (3 books) | 1 [CC-R] 6490, 6488, 6496, 6487 | A | none PD | – | 5.4k + 16.3k + 17.1k + 53.4k / – | no |
| De Emmanuele (2 books); De Verbo incarnato; De tribus appropriatis; Quomodo Spiritus Sanctus est amor; De missione Spiritus Sancti | 1 [CC-R] 6481, 6483, 6498, 6507, 6508 | A | none | – | 25.8k + 6.4k + 1.4k + 0.6k + 5.3k / – | no |
| Adnotationes mysticae in Psalmos; In visionem Ezechielis; Expositio de tabernaculo; In Apocalypsim (7 books); Explicatio in Cantica (dub.) | 1 [CC-R] 6478, 6505, 6503, 6504, 6502 | A | none | – | 55.7k + 24.4k + 14.7k + 82.2k + 49.6k / – | no |
| Short tracts: De potestate ligandi; De judiciaria potestate; De spiritu blasphemiae; De differentia peccati; De gemino paschate; De sacrificio David; De superexcellenti baptismo; De differentia sacrificii Abrahae; De comparatione Christi ad florem; Quomodo Christus ponitur in signum; Declarationes; Explicatio passuum Apostoli; Epistolae et miscellanea | 1 [CC-R] 6492, 6491, 6495, 6485, 6489, 6494, 6497, 6486, 6484, 6506, 6499, 6501, 6500 | A | none | – | ≈52k total / – | no |
| Liber exceptionum | Part II only, in PL 177 as Hugh's "Posteriores excerptiones" ([CC] 6013); full critical text Châtillon 1958 | A partial / C | none | – | 115k (PL part) / – | no |
| Sermones et opuscula inedita; Ad me clamat ex Seir | Châtillon 1951 / Ribaillier 1967 | C | – | – | – | no |

## Notes

- **Latin is easy; English is the problem.** CC covers essentially all of PL 175–177 and 196, cleanly, with chapter `<head>`s. Not one major Victorine work has a complete public-domain English translation. Every translation of *De sacramentis*, the *Didascalicon*, the two *Benjamins* and *De Trinitate* is from 1951 or later, and all are still sold or are recent. The only public-domain English found:
  - the *Explanation of the Rule of St Augustine* (1911 and 1735). It is doubtfully Hugh's, but was transmitted under his name.
  - the Pepwell/Gardner Middle English *Benjamin* abridgment, a few thousand words.
  - two short items whose status is unverified: *Praise of Love* 1941 and Herbert's 1956 *Soliloquy*. A US Copyright Office renewal check could move these to B. The Stanford renewal database timed out during this run.
- **Didascalicon numbering.** PL and CC treat *De tribus diebus* as book VII, which Buttimer and Taylor detach. Split it into its own work. TLL gives books I–VI only.
- **Attributions.** PL 175–177 mixes in a great deal that is not Hugh's. The *Summa sententiarum* and the *Quaestiones in epistolas Pauli* are certainly not his. The "Miscellanea" are partly his. The *Sermones centum* are not his. The "Posteriores excerptiones" are part of Richard's *Liber exceptionum*. CC already separates some of these under "Auctor incertus (Hugo?)", but not all of them (it lists the *Summa sententiarum* and the *Quaestiones* under Hugh). Follow Goy's catalogue when building the canon.
- **What is not in PL.** The *Practica geometriae*, *De grammatica* and *Epitome Dindimi* exist critically only in Baron's 1966 *Opera propaedeutica* (C). WS seems to have them, but they are probably transcribed from Baron, so check before using. Richard's *Liber exceptionum* (complete) and his inedita need Châtillon's editions (C).

## Recommendation

Layout: two author collections, `hugh-of-st-victor-opera/` and `richard-of-st-victor-opera/`, with these groups:
- Hugh:
  - `de-sacramentis/`: 2 books, with chapters per part.
  - `didascalicon/`: 6 books.
  - `opuscula-spiritualia/`: arrha animae, de arca Noe ×2, de vanitate mundi, de institutione novitiorum, de laude charitatis, de amore sponsi, de modo orandi, de quinque septenis, de meditatione, de substantia dilectionis.
  - `theologica/`: sapientia animae Christi and the other short theological tracts.
  - `exegetica/`: Hierarchia, Ecclesiastes, notulae.
  - `dubia/`: the Rule commentary goes here, since it is the one piece with a public-domain English.
- Richard:
  - `benjamin-minor/`
  - `benjamin-major/`
  - `de-trinitate/`
  - `opuscula/`: four degrees, De gradibus charitatis, De statu interioris hominis, De exterminatione mali, De eruditione hominis interioris, …
  - `exegetica/`

All Latin comes from CC. Import first: Hugh's *Didascalicon* (TLL plus CC as two witnesses) and *De arrha animae*, Richard's *Benjamin minor*, *Benjamin major* and *De Trinitate*. These are the spiritually central works, all clean Latin, with pt-BR translated from the Latin. Then *De sacramentis* (183k), then the opuscula and exegesis.

Cannot be sourced cleanly:
- every usable English version of the major works (all C)
- the CCCM, Ribaillier and Châtillon critical texts
- Hugh's *propaedeutica* (Baron 1966)
- Richard's complete *Liber exceptionum* and inedita

**Total size.** Latin in PL:
- Hugh: ≈750k words, about 560k of it reasonably genuine once the *Summa sententiarum* (55k), the *Quaestiones in Paulum* (82k) and the other dubia are set aside. The "incertus" material adds a further 289k.
- Richard: ≈533k words.
- Combined: **≈1.28M words**, or ≈1.09M of genuine works.

Public-domain English: under 40k words (the Rule commentary plus the Benjamin abridgment).

## Portuguese

No Portuguese translation of any Victorine work is tier A. Nothing turned up from before 1930, and no translator is known to have died by 1955. Almost all free Portuguese comes from one source:

- **[CRIST]**: *Introdução ao Cristianismo*, `https://www.cristianismo.org.br/` (a frameset; the index is `sumary.htm`). This is an anonymous Brazilian site built around Hugh and Aquinas, last updated 5 Sept 2025. Its translations come "diretamente do original latino tal como se encontra na Patrologia de Migne" (introduction to *O Estudo das Sagradas Escrituras*). They are clean HTML in modern pt-BR, with Scripture references inline and the translator's notes marked "(Nota do Tradutor)".
  - **Rights**, from `como-cop.htm`: "Todo o material contido neste site, a menos que seja mencionado o contrário, é constituído de obras ou traduções originais. A reprodução, desde que não utilizada para fins comerciais, é livre." That makes it **tier B with a non-commercial condition**. It is free and openly given away, but under a stated licence term, so Ember would rely on being non-commercial. The site names no translator. Its contact is a mail form.
  - **[DCO-PT]**: Documenta Catholica Omnia mirrors the same translations as PDF prints of the site, dated 2 June 2006 (`https://www.documentacatholicaomnia.eu/03d/1096-1141,_Hugo_De_S_Victore,_<Title>,_PT.pdf` and `…/1162-1173,_Richardus_S_Victoris_Prior,_<Title>,_PT.pdf`). They carry the same text, with browser headers and footers in the text layer. Use them only as a fallback. Copies and `pdftotext` output are in `victorines/pt/`, and page copies of [CRIST] are in `victorines/pt/cristianismo/`.

### Hugh of St Victor

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| **Didascalicon** I–VI | 1. *Didascálicon: Da arte de ler*, tr. Antonio Marchionni (Vozes, Petrópolis 2001). Verified only as a bibliographic citation in *Mirabilia* 2013 (`revistamirabilia.com/sites/default/files/pdfs/2013_01_03.pdf`, copy in `victorines/pt/refs/`), which says its Latin follows a critical edition. It is the standard Brazilian scholarly citation. | none online | C (in-print commercial publisher, 2001) | complete per its title; not seen |
| | 2. *Didascalicon: sobre a arte de ler*, bilingual Latin–Portuguese, "Tradução e notas: Roger Campanhari" (Kírion, 1st ed. 2018, 246 pp., ISBN 9788594090188). Verified on the Martins Fontes listing `martinsfontespaulista.com.br/didascalicon--sobre-a-arte-de-ler-853139/p`. | none online | C (sold) | complete; not seen |
| | 3. A Vide Editorial 2015 edition, 246 pp., ISBN 9788567394527. Seen only in a search snippet of `touchelivros.com.br`, and the page did not confirm it. It may be the same book (same page count). | – | C, unverified | – |
| | 4. [CRIST] *O Estudo das Sagradas Escrituras* (`ese-00.htm`; DCO-PT "O_Estudo_Das_Sagradas_Escrituras", 31.4k words with intro). Selections from Didascalicon IV–VI, which the translator explains he did not translate integrally. Also has the *Praenotatiunculae* (= *De scripturis et scriptoribus sacris*, partial) and two pieces on Joel. | as left | B-NC (above) | **partial**; clean HTML |
| | 5. [CRIST] *Textos notáveis sobre a memória* (`h-memo00.htm`; 10.6k words). An anthology that includes Didascalicon III.8 and III.12. | as left | B-NC | excerpts |
| **De tribus diebus** (PL Didascalicon "VII") | [CRIST] *Tratado dos Três Dias*, within *Princípios Fundamentais de Pedagogia* (`pfp-05.htm` and subpages `pfp05-a…`). The intro says "traduzimos integralmente o livro sétimo". About 16k pt words (Latin ≈10k est.). | `https://www.cristianismo.org.br/pfp-05.htm` | B-NC | **complete**; clean HTML |
| De modo dicendi et meditandi (the translator reads *discendi*) | [CRIST] *Opúsculo sobre o Modo de Aprender e de Meditar* (`h-opusc.htm`, `pfp-03.htm`; 2.1k words) | `https://www.cristianismo.org.br/h-opusc.htm` | B-NC | complete; clean |
| De meditatione | [CRIST] *Opúsculo sobre a Arte de Meditar* (`pfp-04.htm`) | as left | B-NC | appears complete (short); clean |
| De substantia dilectionis | [CRIST] *A Substância do Amor* (`h-subsam.htm`; 2.6k words). It cites *Inst. in Decalogum* c. 4, PL 176, and *Miscellanea* I.171. | as left | B-NC | complete; clean |
| De arca Noe morali | [CRIST] *Tratado sobre a Arca de Noé* (`h-arcanoe-ind.htm` + `h-arcanoe.pdf`): prologue, IV.1 and IV.4 only (about 3k words) | as left | B-NC | **excerpts** |
| De verbo Dei; notes on Ps. 118 (from *Miscellanea*); *Quaestiones in ep. ad Romanos* (spurious, selected questions) | [CRIST] *A Palavra de Deus* (`h-verb.htm`, 4.0k), *Anotações sobre o Salmo 118* (`h-m26779.htm`, 4.2k), *Anotações sobre a Epístola aos Romanos* (`h-rom00.htm`, 17.0k) | as left | B-NC | complete / partial / selection; clean |
| Sermones centum (PL 177; doubtful) | [CRIST] `sermo-00.htm` … `sermo100.htm`: prologue plus **≈50 of the 100 sermons** (1–20, 23, 34, 38–40, 56, 57, 60, 61, 63, 66, 69, 70, 75–84, 88, 94–97, 99, 100). DCO-PT has two PDF versions, ≈90k and ≈85k words. | `https://www.cristianismo.org.br/sermo-00.htm` | B-NC | half; clean |
| Expositio in Hierarchiam caelestem | [CRIST] the prologue only (`dionisio-hierarquiaceleste.htm` area). Seen in the index; I did not open it. | – | B-NC | prologue |
| **De sacramentis** | none found (searched [CRIST], whose De sacramentis file is Latin only; DCO PT listing; pt.wikisource; BND Portugal) | – | – | gap |
| **Soliloquium de arrha animae** | none found (same, plus one web query) | – | – | gap |
| De institutione novitiorum, De vanitate mundi, De laude charitatis, De amore sponsi, the theological and exegetical tracts | none found (same sources) | – | – | gap |

### Richard of St Victor

| Work | Portuguese translation | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| **De quatuor gradibus violentae charitatis** | [CRIST] *Tratado sobre os Quatro Graus da Consumação da Caridade* (`rsv-consumacao0.htm` → `rsv-cons1/2/3.htm`): 3 parts, about 9.3k pt words against 7.0k Latin. It opens "Ferida estou pela caridade" (*Vulneratus caritate*) and ends on the four degrees of "ressuscita". | `https://www.cristianismo.org.br/rsv-consumacao0.htm` | B-NC | **complete**; clean HTML |
| **Benjamin major** | [CRIST] *Tratado sobre a Arca da Aliança … Benjamin Maior: Condensado do Livro I* (`r-benmaj.htm`, about 4.9k words; DCO-PT "Tratado_Sobre_A_Arca_Da_Alianca") | `https://www.cristianismo.org.br/r-benmaj.htm` | B-NC | **condensed book I only**, against 54k Latin |
| **De Trinitate** | [CRIST] *Tratado sobre a Santíssima Trindade*, book III chs 2–7 (`r-trintt.htm`, about 2.0k words) | `https://www.cristianismo.org.br/r-trintt.htm` | B-NC | excerpt |
| Explicatio in Cantica (dub.) | [CRIST] prologue plus chs 1 and 34 (`cant-ind.htm`, about 6.0k words). The site notes the Latin has 42 chapters. | as left | B-NC | excerpts |
| **Benjamin minor** | none found. A Porto dissertation, Gabriela Inês Lopes Poças, *A doutrina espiritual em Ricardo de S. Victor na obra Benjamin Minor* (2004, `repositorio-aberto.up.pt/handle/10216/10883`), is a study. I did not check whether it contains a translation. | – | – | gap |
| In Apocalypsim | [CRIST] index lists "Comentário ao Apocalipse" with no link | – | – | not online |
| All other works | none found | – | – | gap |

Notes:
- Search coverage was cut short:
  - The session's web-search budget ran out after a few queries.
  - archive.org returned "Temporarily Offline" throughout.
  - dominiopublico.gov.br now sits behind a Cloudflare JavaScript challenge (HTTP 403 to scripts).
  - bndigital.bn.gov.br had no scripted search.
  - Google Books was not checked.

  So a manual pass on Domínio Público, BN Brasil, Google Books and archive.org (`language:por`) is still owed. Brazilian publishers (Paulus "Patrística", Ecclesiae, Kírion, Vide) are the most likely to have a *De arrha animae* or *Benjamin* volume, all C.
- Searched and found nothing Portuguese:
  - pt.wikisource (API full-text search for "Hugo de São Vítor", "Ricardo de São Vítor", "Didascálicon")
  - BND Portugal (`bndigital.bnportugal.gov.pt/records?search=…`), which has only Latin Alcobaça manuscripts and incunabula (an *Expositio in Regulam*, Richard's *De coelesti vita*)
- The [CRIST] texts follow PL and are careful, readable, modern pt-BR. They are the best free Portuguese reference we have. Their numbering is the translator's own (paragraphs "01.", "02." …), not PL's.

**Recommendation.** For the *Didascalicon*, Marchionni (Vozes 2001) and Campanhari (Kírion 2018, bilingual) are the Portuguese references for our own pt-BR. Both are C and not online, so our pipeline translates from CC/TLL. [CRIST] gives us usable B-NC pt-BR for these complete texts:
- *De tribus diebus*
- Richard's *Four Degrees*
- *De modo discendi*, *De meditatione* and *De substantia dilectionis*
- half the *Sermones centum*

Those could be imported as reference or even as pt-BR if the non-commercial condition is accepted. Everything else, including *De sacramentis*, *De arrha animae*, both *Benjamins* and *De Trinitate*, has no complete Portuguese.
