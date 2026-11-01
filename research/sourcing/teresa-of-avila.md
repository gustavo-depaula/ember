# St. Teresa of Ávila (Teresa de Jesús, 1515–1582): sourcing report

Research only; nothing written under `content/`. Raw downloads used for measuring are in `research/sourcing/teresa-of-avila/raw/` and the helper scripts in `research/sourcing/teresa-of-avila/scripts/` (`iameta.py` = archive.org metadata, `wcrange.py` = body/footnote word split of a line range in a djvu.txt).

**Bibliography used:** the table of contents of P. Silverio de Santa Teresa's critical *Obras de Sta. Teresa de Jesús* (Biblioteca Mística Carmelitana, Burgos, 9 vols, 1915–1924), checked against Vicente de la Fuente's BAE vols. 53/55 (1861–62) as listed on es.wikisource. Teresa's corpus is closed and well catalogued. The only real uncertainty is the letters (Silverio prints 437, and later editions add more) and the minor pieces of doubtful attribution.

**Already in the corpus?** No. `_corpus-books.txt` and `content/books/` hold nothing by Teresa, and no Spanish (`es*/`) book exists yet. Everything below would be new.

**Tier notes that apply throughout**
- Teresa's own text is PD everywhere (she died in 1582).
- **Silverio, ed. 1915–1924**: published ≤1930 (US PD), and P. Silverio died in 1954, so 70 years have passed (PD under life+70 since 1 Jan 2025). His notes and introductions are therefore also **A**.
- **Lewis** (†1895), **Dalton** (†1874), **Zimmerman** (†1937), **Agnes Mason** (†1941): all **A**.
- **Benedictines of Stanbrook** (anonymous corporate translators, 1906–1924): published ≤1930, and UK anonymous works run 70 years from publication, so **A**. The books print "All rights reserved", but that has lapsed.
- **E. Allison Peers** (†21 Dec 1952): life+70 expired 1 Jan 2023, so his translations are PD in the UK/EU. The *Complete Works* (Sheed & Ward, London/NY 1946) was very likely restored in the US under URAA (it was still protected in the UK in 1996), which would give 95 years (to 2041). CCEL labels its Peers *Way* (from the 1964 Image Books edition) "in the public domain", with no evidence given. **Tier: A by the brief's life+70 rule; US status unverified/likely C.** Not needed: the Stanbrook/Lewis translations cover every major work.
- **ICS (Kavanaugh/Rodriguez 1976–85)**: **C**, actively sold. Not used.
- **Navarro Tomás** (†1979) and other editors of 1910–1930 editions: the editions were published ≤1930, so **A** in the US. Their notes are not PD under life+70. Teresa's text in them is PD regardless.

## Summary table

Words are Teresa's text only. For the Spanish, counts come from Silverio's djvu.txt with footnote blocks split out (`wcrange.py`); running heads and some misclassified notes inflate them by roughly 10%, so the figures below are discounted and marked "≈". English counts are `wc -w` of the downloaded text, which includes the translator's notes unless stated.

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Libro de la Vida (40 ch.) | Silverio t.1 (1915) [archive.org/details/obrasdestateresa01tere](https://archive.org/details/obrasdestateresa01tere) | A | David Lewis, 3rd ed. 1904 (Zimmerman intro), [CCEL](https://ccel.org/ccel/teresa/life) / [Gutenberg #8120](https://www.gutenberg.org/ebooks/8120) | A | ≈110k / ≈135k (145k with notes) | no |
| Relaciones / Cuentas de conciencia (67) | Silverio t.2 (1915) pp. 1–88 [obrasdestateresa02tere](https://archive.org/details/obrasdestateresa02tere) | A | Lewis, Relations I–XI, appended to the Life (same CCEL/Gutenberg files) | A | ≈21k / ≈33k | no |
| Camino de perfección: Valladolid redaction (CV) | Silverio t.3 (1916) pp. 5–205 [obrasdestateresa03tere](https://archive.org/details/obrasdestateresa03tere) | A | Benedictines of Stanbrook, ed. Zimmerman, 1911 / 2nd ed. 1919, [thewayofperfecti00tereuoft](https://archive.org/details/thewayofperfecti00tereuoft) | A | ≈50k / ≈80k (91k with intro and notes) | no |
| Camino de perfección: Escorial redaction (CE) | Silverio t.3, Appendix "Autógrafo de El Escorial" pp. 209–355 (same scan) | A | No separate PD English. The Stanbrook 1911/1919 prints the Escorial variants in brackets inside the Valladolid text | A | ≈47k / (inside the above) | no |
| Moradas del castillo interior | Silverio t.4 (1917) pp. 5–210 [obrasdestateresa04tere](https://archive.org/details/obrasdestateresa04tere) | A | Stanbrook, rev. Zimmerman, 3rd ed. 1921, [CCEL castle2](https://ccel.org/ccel/teresa/castle2) (txt: `ccel.org/ccel/t/teresa/castle2/cache/castle2.txt`) | A | ≈55k / ≈80k (90k with notes) | no |
| Libro de las Fundaciones (31 ch. + epilogue) | Silverio t.5 (1918) [obrasdestateresa05tere](https://archive.org/details/obrasdestateresa05tere) | A | Lewis, rev. Zimmerman, 1913, [bookoffoundation00tereuoft](https://archive.org/details/bookoffoundation00tereuoft) | A | ≈85k / ≈125k (with notes) | no |
| Conceptos del amor de Dios (Meditaciones sobre los Cantares, 7 ch.) | Silverio t.4 pp. 211–268, plus fragment witnesses in the appendix | A | Stanbrook, *Minor Works*, 1913, [minorworksofstte00tere](https://archive.org/details/minorworksofstte00tere) | A | ≈14k / ≈14k (est.) | no |
| Exclamaciones del alma a Dios (17) | Silverio t.4 pp. 269–296; complete HTML on [es.wikisource](https://es.wikisource.org/wiki/Exclamaciones_o_meditaciones_del_alma_a_su_Dios) (BAE 53) | A | Stanbrook, *Minor Works* 1913 (same scan) | A | ≈7k / ≈7k (est.) | no |
| Constituciones (1567) | Silverio t.6 (1919) [obrasdestateresa06tere](https://archive.org/details/obrasdestateresa06tere) | A | Lewis/Zimmerman 1913 Foundations vol.: "The Rule… Constitutions" | A | ≈6.5k / ≈10k (with appendices) | no |
| Modo de visitar los conventos (Visita de descalzas) | Silverio t.6 | A | Lewis/Zimmerman 1913: "Visitation of Nunneries" | A | ≈6k / ≈8k | no |
| Avisos (69) | Silverio t.6 (plus the Évora and Antequera copies in its appendix) | A | Stanbrook *Minor Works* 1913 "Maxims"; Lewis "Maxims" in Burke 1911 | A | ≈1.2k / ≈2k | no |
| Desafío espiritual (Respuesta a un desafío) | Silverio t.6 | A | **none PD found** (Peers 1946 vol. III only) | — | ≈1.4k / — | no |
| Vejamen (Respuesta a un vejamen) | Silverio t.6 | A | **none PD found** (Peers 1946 vol. III only) | — | ≈0.8k / — | no |
| Pensamientos y sentencias (compiled sayings, partly doubtful) | Silverio t.6 | A | partly in Stanbrook *Minor Works* "Additional maxims" | A | ≈2k / ? | no |
| Poesías (~31 authentic + attributed) | Silverio t.6 pp. ~87–125 | A | Stanbrook *Minor Works* 1913 (36 poems) | A | ≈3.7k / ≈5k (est.) | no |
| Ordenanzas de una cofradía (attributed) | Silverio t.6, appendix | A | none found | — | ≈1k / — | no |
| Epistolario (437 letters in Silverio) | Silverio t.7–9 (1922–24) [07](https://archive.org/details/obrasdestateresa07tere) [08](https://archive.org/details/obrasdestateresa08tere) [09](https://archive.org/details/obrasdestateresa09tere) | A | Stanbrook, 4 vols 1919–1924: v.1 [letterst01tere](https://archive.org/details/letterst01tere), v.2 [letterst02tere](https://archive.org/details/letterst02tere), v.3 [lettersofsaintte03tere](https://archive.org/details/lettersofsaintte03tere), v.4 on HathiTrust only ([record 000909957](https://catalog.hathitrust.org/Record/000909957)) | A | ≈275k / ≈350k (est., with notes) | no |

## Sources per work, ranked (best first)

Abbreviations:
- **S-W**, **S-P**, **S-P0**: three independent archive.org scans of Silverio's *Obras* (Burgos 1915–24). S-W = Wellesley College (`obrasdestateresaNNtere`, vols 1–9). S-P = Princeton Theological Seminary (`obrasdesantatereNNtere`, vols 1–6, plus `obrasdestateresa82tere`). S-P0 = Princeton (`obrasdestateresaNNtere_0`, vols 1, 2, 3, 5, 6, 7, 9).
- Djvu text URL pattern: `https://archive.org/download/<id>/<id>_djvu.txt`.
- **BAE**: La Fuente, *Escritos de Santa Teresa*, Biblioteca de Autores Españoles 53 (1861; reprint 1877) and 55 (1862; reprint 1879), Rivadeneyra, Madrid.
- **ApP**: *Obras*, Madrid, Apostolado de la Prensa, 1916, 4 vols. IA holds vols 1, 2 and 4 (`obrastheo01tereuoft`, `…02…`, `…04…`). Vol. 3 (Fundaciones and opúsculos) is not on IA.

Per-volume years given here (t.3 1916, t.4 1917, t.5 1918, t.6 1919, t.7–9 1922–24) are the commonly cited ones. archive.org metadata stamps every volume "1915", and I confirmed only t.6 = 1919 (title page via search snippet) and the 1919/1921 imprimaturs of the English letters. All of them are ≤1924 either way.

OCR quality for Silverio, sampled from t.1: good. Errors are scattered (`s€r`, `qu€`, `E5T0`), there is end-of-line hyphenation, and footnotes sit between the page bodies. The three scans OCR'd independently (S-W and S-P word counts differ by <0.2% per volume), so they are good for automated cross-checking. ApP 1916 is cleaner OCR, has numbered paragraphs and few notes, making it a good second witness. BAE OCR is fair: two-column Google scans that read in order in the sample.

### Libro de la Vida
Spanish:
1. **Silverio t.1** (S-W `obrasdestateresa01tere`, S-P `obrasdesantatere01tere`, S-P0 `obrasdestateresa01tere_0`), A, complete. This is the critical text from the Escorial autograph, the best text, and it has three scans to cross-check. About 120k body + 20k note words in the main-text range.
2. **es.wikisource *Su vida*** (Espasa-Calpe, Colección Universal, Madrid 1927, 2 vols), A (Teresa's text; 1927 edition). [Su vida (Santa Teresa de Jesús)](https://es.wikisource.org/wiki/Su_vida_(Santa_Teresa_de_Jes%C3%BAs)), 40 chapters. Both index volumes are transcribed (239 + 245 Página pages; tomo I is flagged progress "V", and the work page still says "pendiente de revisar"). It is the only clean HTML of the whole Vida. Ch. I–VII measured 15k words. The API rate-limited the rest.
3. **ApP 1916 vol. 1** (`obrastheo01tereuoft`), A, complete: clean OCR, numbered paragraphs.
4. **Mesa y López, *Obras escogidas*** (Nelson, London 1912: Vida + Moradas), `obrasescogidasde00tere`, A, complete.
5. **BAE 53** (`escritosdesanta00jesgoog` 1861; `escritosdesanta01fuengoog` 1877), A. Pre-critical (La Fuente), fair OCR.
6. La Fuente's 1873 photo-typographic edition of the autograph (`vida-de-santa-teresa-1873`), A. Mainly a facsimile.

English:
1. **David Lewis, 3rd ed. 1904** (Zimmerman intro), A, complete: [CCEL `life`](https://ccel.org/ccel/teresa/life) (labelled "Proofed", txt 213k words incl. Relations and index) = [Gutenberg #8120](https://www.gutenberg.org/ebooks/8120) (same edition; 207k). Clean e-texts that need no OCR. Lewis follows La Fuente's text and numbers the paragraphs.
2. **Lewis, 4th ed. rev. Zimmerman 1911/1916** (`lifeofstteresaof00tereuoft`, linked from en.wikisource): a revised witness for cross-checking.
3. **Lewis 1870 1st ed.** (`LifeOfStTeresaOfJesusWritten`; 1888 `cu31924029424789`).
4. **Burke (ed.), *St. Teresa of Jesus… Life, Relations, Maxims and Foundations*** (Columbus Press, NY 1911), `StTeresaOfJesus` (383k words). This is Lewis's text re-set for US readers, so it is a third Lewis witness. A (US 1911; Burke †1966, so not life+70, but the translation is Lewis's).
5. **John Dalton 1851/1870** (`lifeofsaintteres00tere_0`, Cunningham 1870), A. An independent older translation.
6. Peers 1944/46 (IntraText [ENG0032](https://www.intratext.com/IXT/ENG0032/)): tier as above, avoid. Abraham Woodhead 1671 and Toby Matthew *The Flaming Hart* 1623/1642 (EEBO-TCP HTML exists): archaic, record pages blocked by bot protection, unverified. Low priority.

### Relaciones (Cuentas de conciencia)
Structure: Silverio numbers 67 *relaciones* (I–VI long, the rest short). Lewis groups them as Relations I–XI with subsections, covering the corpus known to La Fuente.

Spanish:
1. **Silverio t.2** (S-W, S-P, S-P0), A: pp. 1–88. The rest of t.2 (~85%) is documentary appendices about the Vida (not Teresa's text). ≈23k body + 8.5k notes.
2. **BAE 53** "Libro de las relaciones", A.

English:
1. **Lewis**, appended to the Life (CCEL/Gutenberg, ≈35k words with notes), A.
2. **Burke 1911** (Lewis text), A.

The ~56 short relaciones that Silverio adds beyond Lewis's grouping need checking against Lewis's arrangement. Some may have no English.

### Camino de perfección (two redactions)
Silverio t.3 prints the **Valladolid autograph** (second redaction) as the main text, 42 chapters. The **Escorial autograph** (first redaction, 73 chapters) and the **Toledo codex** follow as appendices.

Spanish:
1. **Silverio t.3** (S-W, S-P, S-P0), A. CV ≈55k body, CE ≈52k body.
2. **ApP 1916 vol. 2** (`obrastheo02tereuoft`), A. One redaction (the Valladolid-based vulgate). Good OCR.
3. **BAE 53**, A.
4. Herrero Bayona, *Reproducción foto-litográfica… del Camino de perfección y El modo de visitar* (Valladolid 1883): HathiTrust page images (per Online Books), Escorial autograph with transcription, A.
5. J. M. Aguado, *Camino de perfección; reproducción fidelísima del autógrafo de El Escorial* (La Lectura 1929): HathiTrust US-only, A in US. Would be a clean CE witness, but page images only.

English:
1. **Stanbrook, ed. Zimmerman, 1911** (`wayofperfection00tere_0`) / **2nd ed. 1919** (`thewayofperfecti00tereuoft`, `wayofperfection00tereuoft`), A. "Translated from the autograph… including all the variants of the Escorial and Valladolid editions". CV base with bracketed CE variants ("[Escorial: begins to…]"), so it is the best PD English for both redactions. Clean OCR. Later reprints exist (1925; 4th ed. 1935 `wayofperfection04edtere`).
2. **John Dalton 1852** (*Way of Perfection and Conceptions of Divine Love*), A. Clean HTML at [Celebration of Women Writers](https://digital.library.upenn.edu/women/teresa/perfection/perfection.html) (53k words incl. Conceptions).
3. Woodhead (1675; ed. Waller, Dent 1902, HathiTrust US-only): archaic, unverified.
4. Peers (CCEL [way](https://ccel.org/ccel/teresa/way), Image 1964, "only a few of the nearly 1200 footnotes"; IntraText ENG0034): avoid (tier as above).

No PD English renders CE as a separate text. For a CE `en-US/`, either assemble it from Stanbrook's bracketed variants (hard) or ship CE Spanish-only.

### Moradas del castillo interior
Structure: 7 *moradas* (1:2 ch., 2:1, 3:2, 4:3, 5:4, 6:11, 7:4), plus prologue and epilogue.

Spanish:
1. **Silverio t.4** (S-W `obrasdestateresa04tere`, S-P `obrasdesantatere04tere`; no S-P0), A. ≈61k body + 10.6k notes.
2. **Navarro Tomás, Clásicos Castellanos** (La Lectura, Madrid 1910 `lasmoradas00tere_0`; 1916 `lasmoradas00tereuoft`; 1922 `lasmoradas00tere`), A (≤1930). A careful text from the autograph. OCR carries marginal line numbers (5, 10, 15…) that must be stripped.
3. **ApP 1916 vol. 2**, A.
4. **Mesa y López 1912** (pp. 337–544), A.
5. **BAE 53**, A.
6. 1882 lithographic facsimile of the autograph (`elcastillointeri00tere`), page images only.

English:
1. **Stanbrook, rev. Zimmerman, 3rd ed. 1921**, A: [CCEL castle2](https://ccel.org/ccel/teresa/castle2) ("Rights: Public Domain"; txt 90k words). Clean e-text. The same edition is on [sacred-texts](https://sacred-texts.com/chr/tic/index.htm) (Cloudflare-blocked to me; listed by Online Books) and the biblehub library.
2. Stanbrook scans as cross-check witnesses: 1912 2nd ed. (`TheInteriorCastle2ndEd1912`, Benziger), 1921 (`interiorcastleor00tere`), 1930 (`interiorcastle0000unse`).
3. **John Dalton 1852** (`interiorcastleor00tere_0`, `_1`), A. Independent, 101k words with intro.
4. Peers (IntraText [ENG0033](https://www.intratext.com/IXT/ENG0033/)): avoid.

### Libro de las Fundaciones
Structure: prologue, 31 chapters, epilogue-type additions (ch. 27 ends the first campaign; ch. 28–31 later foundations).

Spanish:
1. **Silverio t.5** (S-W, S-P, S-P0 `obrasdestateresa05tere_0`), A. ≈96k "body" + 55k notes by my split. Notes are heavy here and some leak into the body count, so I estimate ≈85k for Teresa's text.
2. **BAE 53**, A.
3. La Fuente & Selfa, *Libro de las fundaciones* (Aguado 1880): HathiTrust, A.
4. Cervantes Virtual has an HTML/facsimile record ([obra](https://www.cervantesvirtual.com/obra/libro-de-las-fundaciones-de-su-reformacion), from the 1882 José del Ojo ed.). The site returned **403** to me: **unverified**.
5. ApP 1916 vol. 3: not on IA.

English:
1. **Lewis, rev. Zimmerman, 1913** (`bookoffoundation00tereuoft`, Toronto, "NOT_IN_COPYRIGHT"), A. Includes the Visitation, Rule and Constitutions. Clean OCR. Foundations ≈143k words with Zimmerman's long intro and notes.
2. **Agnes Mason, *Saint Theresa: the History of her Foundations*** (Cambridge UP 1909), `sainttheresahist00tereuoft`, A. Independent translation, 103k words, clean.
3. **Burke 1911** (Lewis text), A.
4. Lewis 1871 1st ed. (Burns & Oates): HathiTrust.
5. Dalton 1853 (`TheBookOfTheFoundations`): the IA OCR stops at ch. XIV (32k words for a 285-image scan), so it is **incomplete as text**.

### Conceptos del amor de Dios
Silverio t.4 gives the Baeza/Gracián text (7 chapters + prologue) and, in the appendix, the fragment witnesses (Alba, Consolación, Baeza copies). These are useful if you want variants.

Spanish:
1. **Silverio t.4**, A.
2. **BAE 53**, A.
3. Gracián's editio princeps (Brussels 1611/1612), `wotb_7658178`, scan only.

English:
1. **Stanbrook, *Minor Works*, ed. Zimmerman, 1913**, A: `minorworksofstte00tere` (Wellesley) and `minorworksconcep00tereuoft` (Toronto, "NOT_IN_COPYRIGHT"). Two scans with clean OCR.
2. **Dalton 1852**, in the UPenn HTML above, A.

### Exclamaciones del alma a Dios (17)
Spanish:
1. **es.wikisource**, 17 chapter pages transcluded from the BAE 53 djvu: clean HTML, A. The rendered count failed under rate-limiting, and Silverio's count is ≈7.5k.
2. **Silverio t.4**, with the Salamanca codex variant in its appendix, A.
3. **BAE 53**.

English:
1. **Stanbrook *Minor Works* 1913**, A.
2. *The Exclamations of the Soul to God* (London, Coghlan 1790; IA `a609478400tereuoft`, 16k words incl. front matter), A. An older independent version, attributed in IA metadata to John Milner.

### Constituciones, Modo de visitar (Visita de descalzas), Avisos, Desafío, Vejamen, Pensamientos, Poesías, Ordenanzas
All are in **Silverio t.6** (1919; S-W, S-P, S-P0). Body/notes by `wcrange.py`: Constituciones 7.5k/1.8k, Visita 6.4k/0.8k, Avisos 1.3k/0.3k, Desafío 1.5k/0.5k, Vejamen 0.9k/0.3k, Pensamientos 2.1k/1.2k, Poesías 4.0k/1.5k. About 70% of t.6 is appendices: friars' constitutions by Rubeo, Gracián and the 1581 chapter (not Teresa's); the Évora and Antequera Avisos; the Ordenanzas de una cofradía (≈1k); documents. **BAE 53** also has them ("Libro de las constituciones", "Avisos", "Modo de visitar", "Poesías", "Escritos breves", plus "Obras atribuidas").

Poems, extra Spanish witnesses:
- es.wikisource has 6 single-poem HTML pages (*Nada te turbe*, *Vivo sin vivir en mí*, *Vuestra soy*, *Yo toda me entregué*, *Si el amor que me tenéis*, and the sonnet *Si para recobrar lo recobrado*).
- IntraText has 20 poems as separate texts (ESL1221–ESL1240; source edition not stated, modernized spelling). "Some rights reserved"/CC on the site's own markup. **B/unverified** for the transcription; the text itself is PD.

English:
- **Constituciones** and **Visita**: Lewis/Zimmerman 1913 (above), A. The only PD English found.
- **Avisos**: Stanbrook *Minor Works* 1913 "Maxims" and Burke 1911 "Maxims of S. Teresa", A.
- **Poesías**: Stanbrook *Minor Works* 1913 (36 poems, with notes), A. Longfellow's *Nada te turbe* ("Santa Teresa's Bookmark") is a single-poem alternative.
- **Desafío, Vejamen, Ordenanzas**: no PD English found. These would be Spanish-only, or need our own en translation.

### Epistolario
Structure: one file per letter. Silverio numbers I–CDXXXVII (t.7: I–CLVII; t.8: CLVIII–CCCXLIII; t.9: CCCXLIV–CDXXXVII + appendices of fragments, doubtful letters and documents). Measured body ≈306k with notes ≈193k. Headnotes and running heads are counted in the body, so Teresa's text is ≈275k (est.).

Spanish:
1. **Silverio t.7–9** (S-W 07/08/09; S-P0 07 and 09; Princeton `obrasdestateresa82tere` = t.8 pt. 2), A, 437 letters. The best numbered critical set.
2. **BAE 55** (La Fuente 1862, `bub_gb_C70MFyY_nBIC`; 1879 reprint `escritosdesanta00unkngoog`), A, ~409 letters. Older numbering, good cross-check.
3. **ApP 1916 vol. 4** (`obrastheo04tereuoft`), A.
4. *Cartas de Santa Teresa de Jesús y otros escritos* (Garnier, Paris 1893), `cartasdesantater00tere`, A.
5. Palafox / Antonio de San José edition (Madrid 1752–71, 4 vols, `cartasdesantate00josgoog`, `wotb_9040042_1…4`): archaic, A.

English:
1. **Benedictines of Stanbrook, *The Letters of Saint Teresa: a complete edition*** (intro Cardinal Gasquet; London, Baker, 1919–1924, 4 vols), A.
   - v.1 1919 `letterst01tere` (I–XCIX)
   - v.1 2nd impr. 1926 `lettersofstteres0001unse`
   - v.2 1921 `letterst02tere`, `lettersofstteres0002unse`, `lettersstteresa02tereuoft`, `lettersofsaintte02tere` (to CC)
   - v.3 `lettersofsaintte03tere`, `lettersofstteres0003unse` (to CCCXIV)
   - **v.4 (1924) is not on archive.org**. HathiTrust record [000909957](https://catalog.hathitrust.org/Record/000909957) lists a full-view v.4 (Wisconsin).
   - ~93k words per volume with notes; OCR clean.
   - Stanbrook's numbering follows the Spanish of their day (La Fuente/Grégoire de S. Joseph), not Silverio's. A concordance is needed.
2. **John Dalton**, *The Letters of St. Teresa* (1853; reprints 1860 `lettersofsaintte0000tere`, 1893 `TheLettersOfSaintTeresa`, 1902), A. A **selection** (~64 letters). Clean HTML of the 1902 edition at [Celebration of Women Writers](https://digital.library.upenn.edu/women/teresa/letters/letters.html) (88k words).
3. Peers, *Letters* (1951): avoid (tier as above).

## Doubtful and spurious attributions
- **Sonnet "No me mueve, mi Dios, para quererte"**: anonymous, not Teresa's. en.wikisource lists a "Soneto a Cristo crucificado (attr.)", and Stanbrook's no. 35 "Sonnet to Jesus crucified" is likely this one. Flag it, don't attribute it.
- **Pensamientos y sentencias**: later compilations from her writings, partly not verbatim.
- **Avisos**: the 69 Évora avisos are accepted by Silverio. The Antequera copy and other sets are doubtful.
- **Ordenanzas de una cofradía**: attributed.
- **Doubtful letters and "revelaciones"**: Silverio t.9 appendices; BAE 55 Anexo II, "Cartas, revelaciones y escritos atribuidos".
- **"Siete meditaciones sobre el Padrenuestro"** and similar devotional pieces printed under her name in old editions: spurious. Not imported.

## Recommendation

**Layout:** `content/books/teresa-opera-omnia/<work>/`, mirroring `denis-opera-omnia/`. Use `es-ES/` for the canonical text, following the `fr-FR/` convention for modern national languages, plus `en-US/` and `pt-BR/`.
- `vida/`: 40 chapters + prologue
- `relaciones/`: one file per Silverio relación
- `camino-valladolid/` and `camino-escorial/`: both redactions as separate books, with CE Spanish-only
- `moradas/`: one file per chapter, grouped by morada
- `fundaciones/`
- `conceptos/`
- `exclamaciones/`
- `escritos-breves/`: Constituciones, Visita, Avisos, Desafío, Vejamen, Ordenanzas, each a chapter
- `poesias/`
- `cartas/`: one file per letter, Silverio numbering, with the Stanbrook number in front matter

**Base text:** Silverio throughout, for one edition and one numbering. OCR-clean by diffing the three independent scans (S-W/S-P/S-P0) and checking against ApP 1916 or Navarro Tomás where they overlap. Drop Silverio's footnotes from the reading text, or keep only the textual ones. His notes are PD, but they are dense and Spanish-only.

**Import order:**
1. **Moradas**: CCEL Stanbrook en is a clean e-text, plus Silverio, Navarro Tomás and ApP for the es cross-check.
2. **Vida + Relaciones**: CCEL/Gutenberg Lewis, Silverio + Wikisource HTML.
3. **Camino**: CV first with Stanbrook en; CE after.
4. **Fundaciones**: Lewis 1913; Mason 1909 as the check.
5. **Conceptos, Exclamaciones, Poesías, Avisos**: Stanbrook *Minor Works*.
6. **Constituciones + Visita**: Lewis 1913.
7. **Epistolario**: the largest job. It needs a Silverio↔Stanbrook concordance and HathiTrust v.4.

**Cannot be sourced cleanly:**
- No PD English for **Desafío, Vejamen, Ordenanzas** or the **Escorial Camino as a separate text**. Ship these Spanish-first, or translate en ourselves.
- **Stanbrook Letters v.4** exists only as HathiTrust page images, and is not on IA, so it needs OCR from page images. Check access from outside the US.
- **Cervantes Virtual**: blocked (403), unverified.
- **EEBO-TCP** (Woodhead, Toby Matthew): record pages bot-blocked, unverified, low priority.
- **No clean HTML exists for any Spanish work except Vida (Wikisource) and Exclamaciones/6 poems.** Everything else is good OCR from page scans.

**Total size (estimates):**
- Spanish: ≈690k words of Teresa's text (≈640k without the duplicate Escorial Camino). The letters are ≈275k of that, and the treatises ≈400k.
- English PD: ≈850k words (Lewis + Stanbrook, incl. their notes).
- Silverio's apparatus (notes, intros, documentary appendices) adds ≈2.5M words across the 9 volumes. It is not needed.

## Portuguese

Portuguese translations found for each work. Two things limited the search. The session's web-search budget ran out early. Domínio Público, BN Brasil (acervo/Hemeroteca), HathiTrust and the Google Books API all returned 403/429 from this machine, and pt.wikisource's API rate-limited us; the wiki's own search was read through the web view instead. What was checked directly: archive.org (advancedsearch plus `_djvu.txt` downloads), Biblioteca Nacional Digital de Portugal (bndigital.bnportugal.gov.pt, record pages and PDFs), the Google Books legacy feed (full-view filter), pt.wikisource, Brasiliana USP, Inocêncio's *Diccionario bibliographico portuguez* (23 vols of OCR on archive.org, grepped), carmelitas.pt / carmelo.pt (Edições Carmelo), carmelitas.org.br, Montfort, and the Paulus store API. Downloads are in `research/sourcing/teresa-of-avila/pt/` and the helper scripts in `teresa-of-avila/scripts/` (`ia.py`, `bnd.py`, `gbooks.py`).

**Overall:** no Portuguese Teresa text exists as clean, verified-PD transcribed text. Of the PD witnesses found, two are 18th-century Portuguese manuscripts at the BNP, explicitly marked public domain (*Caminho*, and Andrade's commented *Avisos*). They are handwritten scans with no OCR. A third, a printed 18th-century *Vida*, is known only from bibliography. The best complete Brazilian translation is the one by the **Carmelitas Descalças do Convento de Santa Teresa, Rio de Janeiro** (Vozes, 8 vols, from c. 1939; approvals dated 1935–37; translated from Silverio's critical edition). Its rights status is unverified, and Paulus still sells it in a revised form. It survives on archive.org as unofficial uploads.

### The Rio Carmelites' translation (Vozes, "Obras de Santa Teresa de Jesus", 8 vols), covering all works
1. **Carmelitas Descalças do Convento de Santa Teresa do Rio de Janeiro**, *Obras de Santa Teresa de Jesus*, Petrópolis: Vozes. The volume plan printed in t. I: I Livro da Vida · II As Fundações · III Caminho de Perfeição · IV Castelo Interior ou Moradas · V Opúsculos · VI–VIII Cartas I–III. "Tradução do texto original segundo a edição crítica do R. P. Frei Silvério de Santa Teresa." The approvals are Cardinal Leme's of 18 Dec 1935 and the OCD generals' of 21 Nov 1935 and 4 Aug 1937, so the first edition dates from about 1938 onward. The exact first-edition year per volume is unverified.
   - **t. I Livro da Vida, 3rd ed. 1961**: [archive.org/details/livro-da-vida-santa-teresa-de-jesus](https://archive.org/details/livro-da-vida-santa-teresa-de-jesus) (anonymous upload, 2024). Verified: the djvu.txt opens, about 124k words, and is complete (ch. I–XL plus the covering letter to Fr. García de Toledo). OCR is good: pre-1971 Brazilian orthography (`tôdas`, `êsse`), scattered errors (`cmbora`, `cu`), running heads to strip.
   - **Tier: unverified, C in practice.** The 1961 imprint says "TODOS OS DIREITOS RESERVADOS". The translation is credited only to the community. Tradition, repeated in the Família Católica blurb below, names the prioress **Madre Maria José de Jesus** as translator; her death year of 1959 comes from memory and is unverified. If she is the legal author, Brazilian life+70 runs to 2030. If it is treated as an anonymous/collective work (Lei 9.610 art. 43: 70 years from publication), volumes first published before 1956 would already be PD in Brazil. The US status is probably restored under URAA. **Not importable until the first-edition dates and authorship are established.** It is a reference text of high quality.
   - Other volumes (Fundações, Caminho, Moradas, Opúsculos, Cartas): no scan of the Vozes edition was found on archive.org or elsewhere. The Paulus *Castelo* and the Família Católica *Caminho* below derive from this translation.
2. **Edições Carmelo (OCD Portugal, Avessadas/Marco de Canaveses)**, *Obras Completas de Santa Teresa de Jesus*, 5th ed. (2015), 2016 pp., ISBN 978-972-640-142-1: [carmelo.pt](https://carmelo.pt/inicio/42-obras-completas-de-santa-teresa-de-jesus.html). Contents per the product page: Vida, Caminho, Moradas, Fundações, Contas de Consciência, Conceitos, Exclamações, Constituições, Modo de visitar, Poesias (31), Certame, Resposta a um desafio, Cartas (486). "nova tradução mais moderna". **Tier C** (sold). European Portuguese. Also sold singly: *Livro da Vida* 3rd ed. (ISBN 978-972-640-139-8), *Caminho de Perfeição* 4th ed. (978-972-640-182-7), *As Moradas* 4th ed. (978-972-640-211-4).
3. **Edições Loyola + Editora Carmelitana (Edições Carmelitanas, OCD Brazil)**, *Obras Completas Santa Teresa de Jesus* (ISBN 978-65-5504-207-8, 1224 pp., hardcover and paperback), [edicoescarmelitanas.com.br](https://www.edicoescarmelitanas.com.br/obras-completas-santa-teresa-de-jesus-capa-dura). The page calls it "a publicação mais completa disponível atualmente no Brasil": the major works, 446 letters, minor texts, notes and introductions. **Tier C.** Translators not given on the product page (lead). Edições Carmelitanas also sells *Obras seletas de Santa Teresa de Jesus* (2 tomos, 1088 pp.) and "Leitura Orante" editions of *Livro da vida*, *Caminho*, *Castelo* and *As Fundações* (all C).
3b. **Cultor de Livros** (ISBN prefix 978-85-5638 / 978-65-86580): *Livro da vida* (396 pp., ISBN 978-65-86580-42-6), *Castelo interior* (282 pp.), *Caminho de perfeição* (220 pp., ISBN 978-65-86580-78-5), *Exclamações* (76 pp.), and *Obras de Santa Teresa de Jesus* (2 tomos). Sold through edicoescarmelitanas.com.br and the Paulus store. **Tier C.** Translators not checked.
4. **Paulus**, "Clássicos do Cristianismo" vol. 8/1 *Castelo interior ou moradas* (ISBN 978-65-5562-078-8), 8/3 *Caminho de perfeição* (978-65-5562-161-7), plus ordinary and pocket editions (*Castelo* 978-85-349-0333-2, *Caminho* 978-85-349-1180-1). **Tier C.** Paulus prints the Rio Carmelites' translation (see Moradas).

### Libro de la Vida
1. **Rio Carmelites / Vozes, 3rd ed. 1961.** See above; tier unverified/C. Complete; good OCR. Best reference.
2. **Fr. António de São José, OCD** (Carmelita descalço, b. Cadaval), *Vida da Seraphica Madre Santa Theresa de Jesus, composta pela mesma Santa, traduzida do castelhano em portuguez e illustrada com reflexões asceticas*, Lisboa, Off. da Musica, **1740**; reprinted Lisboa, António Vicente da Silva, **1761**, 4.º, viii-499 pp. Source: Inocêncio, *Dicc. bibl. port.* t. I, no. 839 ([archive.org 000011320-01](https://archive.org/details/000011320-01), djvu line ~14286). Inocêncio's verdict: "A phrase e estylo desta traducção nada tem que os recommende." A secondary list also cites an edition of 1783. **Tier A** (18th c.). **Lead, not verified: no digitized copy found** (not on archive.org, BND Portugal, or Google Books full view).
3. Edições Carmelo *Livro da Vida* (C); Loyola/Carmelitana *Obras Completas* (C); Paulus vol. 8/2 *Livro da vida* (C); Cultor de Livros (C).

### Relaciones / Cuentas de conciencia
- Rio Carmelites/Vozes: presumably in t. V *Opúsculos* (not seen; lead). Edições Carmelo *Obras Completas* includes "Contas de Consciência" (C). No PD Portuguese found.

### Camino de perfección
1. **Fr. Manuel de São José Lisboa, OFM** (fl. 1757–1780), *Caminho de Perfeição que escreveo para as suas freiras a Santa Madre Teresa de Jesus … tradusido da lingoa hespanhola na portugueza*, **manuscript, 1757**, [1] f., 333 p., [4] f., BNP cod-5052. Links: [bndigital.bnportugal.gov.pt/records/item/27252](https://bndigital.bnportugal.gov.pt/records/item/27252-caminho-de-perfeicao) · [purl.pt/30858](https://purl.pt/30858). Verified: the record opens and the purl viewer loads. The page states "PUBLIC DOMAIN – Obra no domínio público, i.e. já não abrangida por direitos de autor. Conteúdo reutilizável livremente (Public Domain Mark)". **Tier A.** It looks complete (333 pp.). Which redaction it follows is not checked (likely the printed Valladolid/Évora text). **Quality: handwritten scan, no OCR.** It would need transcription, so it is a historical witness, not an import source. The record's "Descarregar PDF" link returned 404 to curl for this item; the page viewer works.
2. **Rio Carmelites' translation, via Editora Família Católica, 2018**: [archive.org/details/caminho-de-perfeicao-santa-teresa-de-jesus](https://archive.org/details/caminho-de-perfeicao-santa-teresa-de-jesus) (anonymous upload 2025). The description says "Com a tradicional tradução para o português da Madre Maria José de Jesus, do Convento de Santa Teresa do Rio de Janeiro". Verified: about 54k words, prologue plus ch. 1–42 (Valladolid numbering), clean OCR of an ebook. The text uses European/pre-1943 hyphenation (`hão-de`), so its link to the Vozes text is unconfirmed. **Tier C:** "Copyright © 2018 Editora Família Católica. Todos os direitos reservados."
3. Edições Carmelo *Caminho de Perfeição* 4th ed. (C); Paulus vol. 8/3 and the pocket edition (C); Loyola (C).

### Moradas del castillo interior
1. **Rio Carmelites' "nova tradução", revised with Prof. Jacyntho José Lins Brandão (UFMG)**, Paulus ebook 2016 (col. "Teologia hoje"), credits: "Tradução: Carmelitas Descalças do Convento Santa Teresa, Rio de Janeiro, segundo a edição crítica de Frei Silvério de Santa Teresa, OCD". Unauthorized upload: [archive.org/details/castelo-interior-ou-moradas-santa-teresa-de-jesus](https://archive.org/details/castelo-interior-ou-moradas-santa-teresa-de-jesus). Verified: about 63k words incl. intro and notes; complete (prologue, 7 moradas, epilogue); clean ebook text. **Tier C** (© Paulus 2016, sold). Best-quality modern Brazilian reference.
2. **E. L. de Souza Campos (tr.)**, *O Castelo Interior*, Niterói: Valdemar Teodoro Editor, 2023: [archive.org/details/santa-tereza-davila-o-castelo-interior](https://archive.org/details/santa-tereza-davila-o-castelo-interior) (item carries a CC Public Domain Mark set by the uploader). The credits page reads "© 2023 Valdemar Teodoro Editor … Toda cópia e divulgação são permitidas, desde que citada a fonte." **Tier B** (open permission from the publisher). Caveat: the translator's identity and dates, and whether this is an older translation re-edited, are unknown. It reads like a close, literal rendering ("como os pássaros a quem ensinam a falar"). Complete; a clean `.txt` is in the item. The djvu.txt has page numbers and garbage OCR in the final index pages. About 74k words incl. noise.
3. Edições Carmelo *As Moradas* 4th ed. (C); Paulus vol. 8/1, ordinary and pocket editions (C); Loyola (C). The Vozes t. IV (original Rio Carmelite version) was not found online.

### Libro de las Fundaciones
- Rio Carmelites/Vozes t. II (not found online; tier unverified/C). Edições Carmelo *Obras Completas* (C), Loyola (C). **No PD Portuguese found.**

### Conceptos del amor de Dios · Exclamaciones · Constituciones · Modo de visitar · Desafío · Vejamen · Pensamientos · Poesías · Ordenanzas
1. **Avisos only:** **Fr. Manuel de São José Lisboa, OFM**, *Avisos espirituaes de Santa Teresa de Jesus, commentados, e escritos na lingoa espanhola pelo P. Affonço de Andrade; traduzidos na lingoa portuguesa*, **manuscript, 1769**, [I], [514] f., BNP cod-4103. Links: [bndigital.bnportugal.gov.pt/records/item/27228](https://bndigital.bnportugal.gov.pt/records/item/27228-avisos-espirituaes) · [purl.pt/30857](https://purl.pt/30857). Verified record, marked "PUBLIC DOMAIN … Public Domain Mark". **Tier A.** It translates Alonso de Andrade's commentary (*Avisos espirituales de Santa Teresa comentados*, 1647), so Teresa's Avisos are embedded in a much larger commentary. Handwritten, no OCR.
2. All of these minor works are in Edições Carmelo *Obras Completas* 2015 (C) and presumably in Vozes t. V *Opúsculos* (lead) and Loyola (C).
3. Not Teresa: BNP cod-6276, *[Obras de Santa Teresa de Jesus]* [17--], 27 f., Portuguese MS ([purl.pt/30860](https://purl.pt/30860), PD mark). I downloaded the PDF (`pt/bnp-cod-6276.pdf`, 58 pp.). The first leaf is a list of precepts for friars ("A nossa regra se divide em cinco partes principaes … que nenhum frade …"). That is a religious rule, not an identifiable Teresian text, so the catalogue title should not be trusted. Unexamined beyond the opening pages.
- **Poesías:** no PD Portuguese translation found, and pt.wikisource has no Teresa texts at all (her author page lists only a Wikidata magnum-opus link).

### Epistolario
- Rio Carmelites/Vozes t. VI–VIII *Cartas* I–III (not found online; unverified/C). Edições Carmelo *Obras Completas* includes 486 letters (C). **No PD Portuguese found.**

### Searched without result
pt.wikisource (no Teresa texts). Google Books full view: no Portuguese Teresa volume among the `"santa thereza de jesus"` full-view hits, which were all Spanish/German. archive.org: nothing in Portuguese before the modern uploads above. Brasiliana USP: sermons on Teresa only. carmelitas.org.br and Montfort: articles, no texts. Inocêncio: only the 1740 *Vida* entry (above). The BNP also holds *Censura da obra intitulada Vida e Obra da Madre serafica Santa Thereza de Jesus* by José Agostinho de Macedo ([item 25687](https://bndigital.bnportugal.gov.pt/records/item/25687), after 1826). It suggests that a Portuguese edition of the Vida/works was submitted for censorship c. 1826–31 (lead, not verified). **Not reachable from here:** Domínio Público, BN Brasil Hemeroteca/acervo, HathiTrust, Google Books API. Still worth a check: 1920s–30s Brazilian Catholic periodicals in the Hemeroteca (e.g. *Mensageiro do Carmelo*, *A Ordem*) may carry Portuguese Teresa poems and letters. The old obrascatolicas.com PDF library now redirects to a publisher site.

### Best Portuguese reference per work

| Work | Best PT source | Tier | Form |
|---|---|---|---|
| Vida | Rio Carmelites / Vozes 3rd ed. 1961 ([archive.org](https://archive.org/details/livro-da-vida-santa-teresa-de-jesus)) | unverified (C in practice) | good OCR, complete |
| Relações | Edições Carmelo *Obras Completas* 2015 | C | print |
| Caminho | Fr. Manuel de São José Lisboa MS 1757 ([purl.pt/30858](https://purl.pt/30858)) for PD; Família Católica 2018 ([archive.org](https://archive.org/details/caminho-de-perfeicao-santa-teresa-de-jesus)) for reading | A / C | manuscript / clean ebook |
| Moradas | Valdemar Teodoro 2023, tr. E. L. de Souza Campos ([archive.org](https://archive.org/details/santa-tereza-davila-o-castelo-interior)); Paulus/Rio Carmelites 2016 for quality | B / C | clean txt / clean ebook |
| Fundações | Edições Carmelo *Obras Completas* 2015; Edições Carmelitanas *As Fundações* (Vozes t. II not online) | C | print |
| Conceitos, Exclamações, Constituições, Modo de visitar, Desafio, Vejamen, Poesias | Edições Carmelo *Obras Completas* 2015 | C | print |
| Avisos | Andrade commentary tr. Fr. Manuel de São José Lisboa MS 1769 ([purl.pt/30857](https://purl.pt/30857)) | A | manuscript, embedded in commentary |
| Cartas | Edições Carmelo *Obras Completas* 2015 (486 letters) | C | print |

**Recommendation.** None of these can be imported directly as a public-domain Portuguese text. The PD witnesses are the two BNP manuscripts (1757 *Caminho*, 1769 *Avisos* in Andrade's commentary). They are handwritten and would need full transcription. The printed 1740/1761 *Vida* by Fr. António de São José is known only from Inocêncio, who disparages its style. The one openly licensed modern text is the 2023 Valdemar Teodoro *Castelo Interior*, tier B ("Toda cópia e divulgação são permitidas, desde que citada a fonte"), but its translator's provenance is unclear. It is usable as a cross-check reference, and as an import only after the translator is identified. The Rio Carmelites' Vozes translation is the natural Brazilian reference for our pt-BR pipeline: complete, made from Silverio's text (the same edition our Spanish source uses), and Brazilian. Its PD status hinges on first-edition dates and on whether it counts as an anonymous collective work, so treat it as **reference only** until that is settled. The Edições Carmelo, Loyola and Paulus editions are tier C references. Plan to translate every work ourselves from Silverio's Spanish, checking against the Vozes *Vida*, the Paulus/Valdemar *Moradas* and the Família Católica *Caminho*.
