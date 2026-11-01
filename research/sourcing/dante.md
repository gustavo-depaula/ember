# Dante Alighieri (1265–1321): complete works

Nothing by Dante is in the corpus yet (`_corpus-books.txt` and `content/books/` checked: no `dante*` dir, no Dante book under another slug).

Bibliography: the canon as fixed by the Società Dantesca Italiana's *Le Opere di Dante. Testo critico* (Barbi, Parodi, Pellegrini, Pistelli, Rajna, Rostagno, Vandelli; Florence, Bemporad, 1921), the first complete critical edition, plus the attributed *Fiore* and *Detto d'Amore* (Parodi, appendix volume 1922). The lost *serventese* on sixty Florentine ladies (VN VI) is not listed.

Raw downloads used for counts: `research/sourcing/dante/raw/` (Gutenberg plain texts, archive.org `_djvu.txt`, Latin Library pages, the Gutenberg catalogue CSV). I counted words with `wc -w`, on the text between the Gutenberg START/END markers or on the whole archive.org OCR, apparatus included. For the originals, I split the 1921 SDI OCR by its running heads (`leoperedidantebarbi.txt`). Those counts include running heads and line numbers, so they run about 5% high.

## Summary

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **Commedia** (100 canti) | Gutenberg #1012 / #1000 (Petrocchi's vulgate text); SDI 1921 (Vandelli) on archive.org | A (Vandelli 1921) / B (Petrocchi 1966–67 text) | Longfellow 1867, Gutenberg #1004 | A | 98k / 114k (Longfellow), 150k (Norton), 152k (Cary w/ notes) | no |
| **Vita Nuova** | it.wikisource *Vita nuova* (Barbi critical text, djvu-backed); Gutenberg #71218 (Agresti) | A | D. G. Rossetti 1861, Gutenberg #41085 | A | 20k / 25k | no |
| **Rime** (incl. *dubbie*) | it.wikisource *Rime (Dante)*; SDI 1921 | A / B (see notes) | Lyell, *The Canzoniere of Dante* 1835/1840 (bilingual), archive.org | A, but incomplete | 25k / ≈35k of Dante's text in Lyell (67k incl. intro/notes) | no |
| **Convivio** | it.wikisource *Convivio* (4 trattati); SDI 1921; Liber Liber (Busnelli–Vandelli) | A | Wicksteed 1903 (Temple Classics), archive.org `convivioofdantea00dantuoft` | A | 76k / 135k incl. notes (Sayer 1887: 84k) | no |
| **De vulgari eloquentia** (Latin) | thelatinlibrary.com `dante/vulgar.shtml` + `vulgar2.shtml`; la.wikisource; SDI 1921 (Rajna) | A | A. G. Ferrers Howell 1904 (Temple *Latin Works*), archive.org `translationoflat00dantuoft` | A | 12k / ≈20k text (37k w/ notes & appendices) | no |
| **Monarchia** (Latin) | thelatinlibrary.com `dante/mon1–3.shtml`; la.wikisource *De monarchia*; SDI 1921 | A | Aurelia Henry 1904, archive.org `demonarchiaofdan00dant`; F. J. Church 1878, Gutenberg #33896 | A | 19.7k / ≈28k (Church, w/ notes) | no |
| **Epistole** I–XIII (Latin) | thelatinlibrary.com `dante/ep.shtml` (all 13, SDI numbering); la.wikisource *Epistulae (Dantes Aligherius)* | A | Toynbee 1920 (Latin + English + notes), archive.org `epistolaeletters00dantuoft` | A | 10.1k / ≈15k text (130k w/ apparatus) | no |
| **Eclogae** (2 by Dante + 2 by Giovanni del Virgilio) | SDI 1921 (OCR); la.wikisource *Eclogae (Dantes)*; Latin Library `ec1` has **only Del Virgilio's first poem** | A | Wicksteed & Gardner 1902 (critical text + verse transl. + commentary), archive.org `dantegiovannidel00dantuoft`; Temple 1904 | A | 2.3k / ≈3k (119k whole book) | no |
| **Quaestio de aqua et terra** (Latin) | la.wikisource *Quaestio de aqua et terra* (≈30 KB page); SDI 1921 | A | Wicksteed 1904 (Temple *Latin Works*); A. C. White 1903 (archive.org `atranslationqua00aliggoog`) | A | 4.9k / ≈6k | no |
| *Il Fiore* (doubtful, 232 sonnets) | it.wikisource *Fiore*; Parodi 1922, archive.org `ilfioreeildettodamoreparodi` | A | none PD (Casciani–Kleinhenz 2000 is C) | — | ≈22k (est.) / — | no |
| *Detto d'Amore* (doubtful, 480 settenari) | it.wikisource *Detto d'Amore* (100%, from *Poemetti allegorico-didattici* 1941); Parodi 1922 | A | none PD | — | ≈2.5k (est.) / — | no |

**Total original ≈ 290k words** (Italian ≈ 245k, Latin ≈ 40k, attributed works ≈ 25k). **Total English of Dante's text ≈ 270k words** in one PD translation per work, or ≈ 450k counted with the editions' notes.

## Notes per work, with every usable source ranked

### Commedia (Inferno 34, Purgatorio 33, Paradiso 33 canti; ≈14,233 lines)
Split one chapter per canto. That gives 100 chapters in three parts (`inferno/canto-01` …).

Original:
1. **Gutenberg #1012**, *La Divina Commedia di Dante* (UTF-8, typographic apostrophes, "Inferno • Canto I" headings). This is Petrocchi's *antica vulgata* text, the same as it.wikisource *Divina Commedia* ("a cura di Giorgio Petrocchi"). It's the cleanest file and has the modern standard reading. 97,942 words. Tier B: Dante's words are PD, and the Petrocchi constitution (Mondadori 1966–67) is past Italy's 20-year protection for critical editions (L. 633/1941 art. 85-quater). Wikisource, Gutenberg and Liber Liber all redistribute it freely.
2. **Gutenberg #1000** (complete) and #1009–1011 (per cantica): the same vulgate text in an older transcription (97,896 words). Use it to cross-check #1012.
3. **it.wikisource** *Divina Commedia* (Petrocchi). It's proofread, a page per canto, easy to fetch through `action=raw`.
4. **SDI 1921, ed. Vandelli**, archive.org `leoperedidantebarbi` (OCR, good but with running heads and line numbers). ≈110k words with heads. Tier A. It's the pre-Petrocchi critical text, useful where Petrocchi and Vandelli differ.
5. **Liber Liber**: "edizione Petrocchi" and "edizione Scartazzini-Vandelli" (https://liberliber.it/autori/autori-a/dante-alighieri/). Licence CC BY-NC-SA 4.0, so use it only to cross-check.
6. Moore's Oxford *Tutte le opere* 1894/1904 (archive.org `tutteleoperedida00dant`, 320k words for all works). Two-column OCR, weaker. Tier A.

English (all verse or prose of the whole poem):
1. **Longfellow 1867**, blank verse, line-for-line. Gutenberg #1004 (complete; #1001–1003 per cantica), 113,545 words. Tier A. It's the most literal verse rendering and keeps the canto/line structure, so it aligns cleanly with the Italian.
2. **C. E. Norton 1891–92**, prose. Gutenberg #1995–1997, 150k words. Tier A. It's accurate and Catholic-sympathetic, a good second English witness. It's prose, so it doesn't align line for line.
3. **H. F. Cary 1814**, Miltonic blank verse with notes. Gutenberg #1008 (#8800 with Doré illustrations), 152k words incl. notes. Tier A. Classic, but its expansion is freer.
4. **Temple Classics prose** (J. A. Carlyle *Inferno* 1849, rev. Okey 1900; T. Okey *Purgatorio* 1901; P. H. Wicksteed *Paradiso* 1899), Italian facing. archive.org e.g. `infernoofdanteal00dant_0` (Oelsner ed. 1901, 102k). OCR. Tier A.
5. J. R. Sibbald, *Inferno* 1884, Gutenberg #41537 (116k with notes), Inferno only. Tier A.
6. Tier C, unusable: Sinclair (1939, Bodley Head/OUP; translator d. 1968), Sayers/Reynolds (Penguin), Singleton, Mandelbaum (shown on Digital Dante), Hollander (Princeton Dante Project), Musa, Ciardi.

### Vita Nuova (42 chapters in Barbi's division, 31 poems, prose *divisioni*)
Split by Barbi's chapters (I–XLII). The poems stay inline as verse blocks.

Original:
1. **it.wikisource *Vita nuova*** (djvu-backed, Barbi's critical text with his introduction). Tier A.
2. **Gutenberg #71218** (ed. A. Agresti, 22,391 words incl. editor's matter). Tier A. Clean UTF-8.
3. SDI 1921 OCR (≈20k words, Barbi). Tier A.
4. Liber Liber has four editions (Bemporad 1932 = Barbi; Roux-Viarengo 1903; Newton 1993; one more), all CC BY-NC-SA. Use them to cross-check.

English:
1. **D. G. Rossetti 1861** (*The Early Italian Poets*; separately *The New Life*), Gutenberg #41085, 24,778 words. Tier A. It's the classic, and its verse renders the poems as poems. It's somewhat free in places.
2. **C. E. Norton 1867** (*The New Life*, with essays), archive.org `newlifedant00dant` (1889 printing, 45,859 words incl. essays). Tier A. It's more literal than Rossetti.
3. T. Okey 1906 (Temple Classics, with Italian). Tier A, archive.org (not opened).
4. Theodore Martin 1862. Tier A, archive.org (not opened).

### Rime
The canon is uncertain: Barbi 1921 has ≈89 numbered items plus *rime dubbie*, and Contini and De Robertis (2002) differ. The poems already embedded in the VN and the Convivio repeat there. Suggested layout: one chapter per poem, grouped (giovanili / allegoriche e dottrinali / petrose / esilio / tenzoni / dubbie). Tenzone partners' poems (Forese Donati, Cino, Cavalcanti, Dante da Maiano) come in with their replies, attributed.

Original:
1. **it.wikisource *Rime (Dante)*** (75% quality, a page per poem, opens with the VN poems). Tier A.
2. SDI 1921 (Barbi) OCR, 25k words incl. dubbie. Tier A. Barbi's numbering is the standard reference.
3. Liber Liber (CC BY-NC-SA). Use it to cross-check.

English:
1. **Charles Lyell, *The Canzoniere of Dante Alighieri, including the poems of the Vita nuova and Convito*** (London 1835; 1840 printing on archive.org `thecanzionereofdantealighi`, 67k words, Italian + English). Tier A. It's the only near-complete PD English, but it predates the modern canon, so some poems are missing and it has some spurious ones.
2. Rossetti, *Dante and his Circle* (1874; the 1861 *Early Italian Poets* revised): a selection, including the tenzoni with their partners' poems. Tier A, archive.org.
3. E. H. Plumptre, *The Commedia and Canzoniere* (1886–87), vol. II. Tier A, archive.org (not opened).
4. Foster & Boyde 1967 is C.

So the Rime can be imported in Italian complete, but English covers only part of it. Lyell + Rossetti + Plumptre would need a poem-by-poem concordance against Barbi's numbering, and some poems will have no PD English.

### Convivio (4 *trattati*: I 13 chapters, II 15, III 15, IV 30; three canzoni)
Split by trattato/chapter (73 chapters).

Original:
1. **it.wikisource *Convivio*** (subpages per trattato, 50% quality). Tier A.
2. SDI 1921 (ed. Parodi & Pellegrini) OCR, ≈76k words. Tier A.
3. Liber Liber: Busnelli–Vandelli (1934–37) and Vasoli–De Robertis (1988) editions, CC BY-NC-SA. Cross-check only.
4. Moore 1904 OCR. Tier A.

English:
1. **P. H. Wicksteed 1903** (Temple Classics; rev. 1908/1912), archive.org `convivioofdantea00dantuoft` / `convivioofdantea01dant`, 135k words incl. extensive notes. Tier A (Wicksteed d. 1927). It's the most accurate and was made from the critical text of its day.
2. **Elizabeth Price Sayer 1887**, *The Banquet (Il Convito)*, Gutenberg #12867, 83,791 words. Tier A. Clean text, but older base text and a looser translation.
3. Katharine Hillard 1889, *The Banquet*. Tier A, archive.org (not opened).

### De vulgari eloquentia (Latin; unfinished: Book I 19 chapters, Book II 14)
Split by book/chapter.

Original:
1. **The Latin Library** `https://www.thelatinlibrary.com/dante/vulgar.shtml` and `vulgar2.shtml` (6,052 + 5,707 words). Tier A. It's clean HTML. Its edition isn't stated; it's the standard modern text.
2. la.wikisource *De Vulgari Eloquentia*. Tier A. (it.wikisource's *De la vωlgare εlωquεnzia* is **Trissino's 1529 Italian translation**, not the Latin.)
3. SDI 1921 (Rajna) OCR, 12.5k words; Rajna's own editions 1896/1897 on archive.org (`iltrattatodevulg00dantuoft`). Tier A.
4. Liber Liber (Marigo 1948 text). CC BY-NC-SA.

English:
1. **A. G. Ferrers Howell**, Temple Classics *A Translation of the Latin Works of Dante* (1904), archive.org `translationoflat00dantuoft`. Tier A. The same translation first appeared in 1890 (Kegan Paul).
2. Howell 1890 separate edition (not located on archive.org in this pass).

### Monarchia (Latin; 3 books: 16, 11, 16 chapters)
Original:
1. **The Latin Library** `dante/mon1.shtml`, `mon2`, `mon3` (5,503 + 6,637 + 7,559 words). Tier A.
2. la.wikisource *De monarchia* (25% quality, per book). Tier A.
3. SDI 1921 (Rostagno) OCR; Witte 1863/1874, Moore 1916 Oxford text (`demonarchiaoxfor00dantuoft`). Tier A.
4. Liber Liber (Ricci 1965 text). CC BY-NC-SA.

English:
1. **Aurelia Henry 1904** (Houghton Mifflin, with notes), archive.org `demonarchiaofdan00dant`, 63,566 words incl. intro/notes. Tier A. Faithful, and it has chapter summaries.
2. **F. J. Church 1878** (appended to R. W. Church's essay), Gutenberg #33896, Monarchia portion ≈31k words incl. footnotes. Tier A. It's the clean-text option.
3. P. H. Wicksteed 1896/1904 (Temple *Latin Works*). Tier A, OCR.

### Epistole (13 letters, Latin)
- I–XII (political and personal letters, 1304–1315).
- **XIII to Cangrande**, whose authenticity is disputed. The dedication (§§1–4) is widely accepted. The exegetical part (§§5–90, the "four senses"/subject of the Comedy) is contested: Mazzoni and Hollander for, Dronke and Kelly against. Mark it "authenticity disputed" in book.json.
- The three letters "of the Countess of Battifolle" to Margaret of Brabant (Ep. VIII–X, SDI) are by Dante as secretary.

Numbering differs by edition: Toynbee/Moore number Cangrande X, SDI numbers it XIII. Use SDI numbering, the modern standard, and note Toynbee's in each title.

Original:
1. **The Latin Library** `https://www.thelatinlibrary.com/dante/ep.shtml`: all 13 letters, SDI numbering, 10,083 words. Tier A.
2. la.wikisource *Epistulae (Dantes Aligherius)* (75%) + *Epistola ad Cangrande*. Tier A.
3. Toynbee 1920 (critical Latin text). Tier A.
4. SDI 1921 (Pistelli) OCR, 13k words. Tier A. Also Hoepli 1921 *Le lettere di Dante* (archive.org `dantisalagheriie00dant`).
5. it.wikisource *Epistole (Dante)* is **Torri's 1842 Italian translation**. Liber Liber's *Epistole* is CC BY-NC-SA, with Latin from SDI 1921.

English:
1. **Paget Toynbee, *Dantis Alagherii Epistolae: The Letters of Dante*** (Oxford, 1920), archive.org `epistolaeletters00dantuoft`. Latin + English + very full notes (130k words whole volume; the English letters run ≈15k). Tier A (published 1920; Toynbee d. 1932). It's the best: a critical text and a translation together.
2. C. S. Latham, *A Translation of Dante's Eleven Letters* (1891), archive.org `translationofdan00dant` (75k incl. notes). Tier A. Eleven letters only.
3. Wicksteed, Temple *Latin Works* 1904: Ep. I–X in Moore numbering. Tier A.

### Eclogae (Latin bucolic exchange, 1319–20)
The set is four poems:
- Giovanni del Virgilio's verse epistle
- Dante's Ecloga I (reply)
- Del Virgilio's *Ecloga responsiva*
- Dante's Ecloga II

The authenticity of Dante's eclogues is now generally accepted, with older doubts (Rajna, Belloni). Import all four, with Del Virgilio's poems attributed to him.

Original:
1. **SDI 1921** OCR (≈2.3k words for all four). Tier A.
2. **Wicksteed & Gardner 1902**, critical text. Tier A.
3. la.wikisource *Eclogae (Dantes)* and *Eclogae (Iohannes de Virgilio)*. Tier A.
4. Liber Liber *Egloghe* (CC BY-NC-SA).

The Latin Library's `dante/ec1.shtml` holds **only Del Virgilio's opening poem** (475 words), so it's not a full source.

English:
1. **Wicksteed & Gardner, *Dante and Giovanni del Virgilio*** (Constable, 1902), archive.org `dantegiovannidel00dantuoft` (119k incl. commentary and the Latin). Tier A.
2. Wicksteed, Temple *Latin Works* 1904. Tier A.

### Quaestio de aqua et terra (Latin, Verona 1320)
It survives only in the 1508 Venice print (Moncetti), so its authenticity was long debated. Most scholars accept it now (Mazzoni 1957 and Padoan). Note it in book.json. It's one continuous text in 24 numbered sections, so split it into ≈5 chapters by its own argument or keep it as one chapter.

Original:
1. **la.wikisource *Quaestio de aqua et terra*** (≈30 KB page). Tier A.
2. SDI 1921 OCR, ≈4.9k words. Tier A.
3. Biagi 1907 (critical, archive.org `laquaestiodeaqua00dantuoft`); 1508 facsimile 1905. Tier A.
4. Liber Liber (CC BY-NC-SA). it.wikisource *Dissertazione intorno all'acqua e alla terra* is an Italian translation.

English:
1. **Wicksteed**, Temple *Latin Works* 1904 (≈9k words incl. notes and postscripts). Tier A.
2. **Alain Campbell White**, *A Translation of the Quaestio de Aqua et Terra, with a discussion of its authenticity* (Boston, 1903), archive.org `atranslationqua00aliggoog` (26k incl. discussion). Tier A.
3. C. H. Bromby 1897. Tier A, not located.

### Il Fiore and Detto d'Amore (attributed)
They're anonymous in the sole manuscript, signed "Durante". Contini argued for Dante's authorship (1984), which many accept and others reject. Mark both "attribution doubtful".
- *Fiore*: 232 sonnets after the *Roman de la Rose*. One chapter per ~20 sonnets, or one book with 232 short sections.
- *Detto*: 480 settenari, a single chapter.

Original:
1. it.wikisource (*Detto d'Amore* at 100%, from the 1941 *Poemetti allegorico-didattici del secolo XIII*). Tier A.
2. **Parodi 1922**, archive.org `ilfioreeildettodamoreparodi` (49.8k incl. notes/glossary). Tier A.
3. Liber Liber (CC BY-NC-SA).

English: no PD translation exists; Casciani & Kleinhenz (2000) is C. They'd import as Italian-only, pt-BR translated from the Italian.

## Portuguese

Where I looked: pt.wikisource (author page *Autor:Dante Alighieri* and the page *A Divina Comédia*, which lists the PD translations, citing Manupella's *Dantesca luso-brasileira*, 1966), archive.org (language:por), and web searches. **I did not search dominiopublico.gov.br, bndigital.bn.gov.br or purl.pt directly.** The pipeline translates pt-BR from the original anyway. A PD Portuguese version is useful as a reference and a cross-check, or as the imported pt-BR text if one is good enough.

| Work | Portuguese translations, best first | Tier | Quality / completeness |
|---|---|---|---|
| Commedia | 1. **José Pedro Xavier Pinheiro** (1822–1882), *Divina Comedia*, 1st complete ed. Rio de Janeiro 1907 (3 vols; Inferno alone 1888). On **pt.wikisource**: scans (`A Divina Comédia (Xavier Pinheiro)/1907`) plus a **transcription with updated spelling, all 100 cantos** (`A Divina Comédia (Xavier Pinheiro)/grafia atualizada/{Inferno,Purgatório,Paraíso}/<canto>`, 34+33+33 pages, checked through the API) | A (translator d. 1882) | Verse in rhymed tercets, Brazilian, readable 19th-c diction. Clean wiki text. The best PD pt-BR candidate for any Dante work. |
| | 2. Francisco Bonifácio de Abreu, **Barão da Villa da Barra**, *A Divina Comedia*, Rio de Janeiro, Imprensa Nacional 1887/88 (posthumous), reprinted Garnier 1907–1910 | A | Complete. No scan or transcription located in this pass. |
| | 3. Joaquim Pinto de Campos, *A Divina Comedia… versão portugueza commentada*, Lisbon, Imprensa Nacional 1886 | A | **Inferno only**, European Portuguese, annotated. Scan not located. |
| | 4. Machado de Assis, a single canto (in *Ocidentais*, *Poesias completas* 1901), pt.wikisource | A | Fragment. |
| | Tier C (do not use): Cristiano Martins (1976), Italo Eugenio Mauro (Ed. 34, 1998), Vasco Graça Moura (Portugal, 1995), Hernâni Donato, Jorge Wanderley (Inferno). A 1955–57 prose translation with notes is uploaded on archive.org (`dante-divina-comedia-01-03-inferno`, `…02-03-purgatorio`) with no translator named; it's an unauthorised upload of a modern edition. | C | |
| Vita Nuova | Paulo M. Oliveira & Blasio Demetrio (or Fúlvio Abramo), *Vida Nova*, Athena, Rio de Janeiro 1937 | unverified (translators' death dates unknown) | Complete. Not online. |
| | Tier C: Vasco Graça Moura (bilingual, Quetzal), Jorge Vaz de Carvalho (Relógio d'Água 2010), Jorge Wanderley (poems only, 1988), Décio Pignatari (2006) | C | |
| Convivio | Emanuel França de Brito, complete (Penguin-Companhia 2019); Brito, partial with commentary (*TradTerm*, USP, 2012, open access); Carlos Eduardo de Soveral (Portugal) | C | No PD Portuguese found. |
| Monarchia | Ciro Mioranza (Escala 2006 / Lafonte 2017); archive.org `da-monarquia` (no translator or edition stated) | C / unverified | No PD Portuguese found. |
| De vulgari eloquentia, Epistole, Eclogae, Quaestio, Rime, Fiore, Detto | none PD found | — | pt-BR must come from our pipeline. |

So only the Commedia has a usable PD Portuguese text (Xavier Pinheiro on pt.wikisource). It's rhymed verse, so it doesn't align line for line with the Italian. Keep it as a reference translation (or as `pt-BR` with an attribution note), and translate everything else.

## Recommendation

**Layout:** `content/books/dante-opera-omnia/<work>`, mirroring `aquinas-opera-omnia/`:
- `commedia` (three parts inferno/purgatorio/paradiso, canto chapters)
- `vita-nuova`
- `rime`
- `convivio`
- `de-vulgari-eloquentia`
- `monarchia`
- `epistole`
- `eclogae`
- `quaestio-de-aqua-et-terra`
- `fiore`, `detto-d-amore` (marked attributed)

Canonical language is `it` for the vernacular works and `la` for the Latin ones, with `en-US` beside each.

**Import order:**
1. **Commedia**: Gutenberg #1012 (it) + Gutenberg #1004 Longfellow (en). Both are clean UTF-8 with no OCR, and they align canto for canto and nearly line for line. It's the highest-value work and the cheapest to import.
2. **Vita Nuova**: it.wikisource or Gutenberg #71218 + Rossetti #41085. Clean texts.
3. **Monarchia**: Latin Library + Church (Gutenberg #33896, clean) cross-checked with Henry 1904.
4. **Epistole**: Latin Library + Toynbee 1920 (OCR; the English needs cleanup).
5. **De vulgari eloquentia**, **Eclogae**, **Quaestio**: Latin from the Latin Library / la.wikisource / SDI. English from Temple *Latin Works* 1904 and Wicksteed–Gardner 1902, all OCR, so they need a proofing pass against the page images.
6. **Convivio**: it.wikisource + Sayer (Gutenberg, clean) or Wicksteed (better, OCR).
7. **Rime**: Italian complete; English partial (Lyell/Rossetti/Plumptre concordance needed).
8. **Fiore / Detto**: Italian only.

**Can't be sourced cleanly:**
- **No PD English** for *Fiore* and *Detto d'Amore*.
- The **Rime** have only partial, older-canon PD English.
- All Latin-works English (Temple 1904, Toynbee 1920, Henry 1904, Wicksteed–Gardner 1902) exists **only as archive.org OCR**. It's of decent quality but has running heads, footnote interleaving and the facing Latin to strip.
- Liber Liber texts are CC BY-NC-SA. Use them only to cross-check, never as the imported source.
- Copyright renewal/US status didn't need checking: every English source above is pre-1930 or by a translator dead 70+ years.

**Total size:** ≈290k words of original (Commedia 98k, Convivio 76k, Rime 25k, VN 20k, Monarchia 20k, DVE 12k, Epistole 10k, Quaestio 5k, Eclogae 2.3k, Fiore + Detto ≈25k est.). ≈270k words of English text, one translation per work (≈450k with editors' notes).
