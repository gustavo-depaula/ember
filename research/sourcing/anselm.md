# St. Anselm of Canterbury (1033–1109): sourcing report

Canon follows F. S. Schmitt's critical *S. Anselmi Opera omnia* (6 vols, Seckau/Edinburgh 1938–61), which is what modern scholarship counts as genuine. Migne PL 158–159 (reprinting Gerberon's 1675/1721 Maurist edition) carries the same genuine works plus a large appendix of doubtful and spurious pieces; those are listed separately at the end of the table. Nothing by Anselm is in the corpus yet (`_corpus-books.txt`, `content/books/`: no hits).

## Source keys

Each work's rows below point to these. They are ranked by how useful they are as an import base; the per-work notes say where the ranking changes.

**Latin**
- **[CC]**: Corpus Corporum (Zürich), *Patrologia Latina* corpus, author "Anselmus Cantuariensis" (author id 1938). Browse: `https://mlat.uzh.ch/browser?path=/38/1938/<work-id>`. Clean TEI XML per work: get the text id from `https://mlat.uzh.ch/php_modules/navigate.php?load=/38/1938/<work-id>`, then download `https://mlat.uzh.ch/php_modules/download.php?type=file-xml&idno=<text-id>`. The edition is Migne PL 158 (machine-corrected OCR from Open Greek and Latin), with `<head>` per chapter and PL column numbers. I checked the Proslogion (text 10631, 6,866 words), which is clean apart from scattered OCR slips, and the Epistolae (text 10620). **Tier A** (Migne 1853–54). Word counts in the table are CC's own counts. **Gap: CC has only PL 158, so letter books III–IV (PL 159) are missing.** Copies are in `anselm/cc/`.
- **[Schmitt]**: Schmitt's critical edition, vols 1–6, scanned on archive.org with full-text OCR: `https://archive.org/details/sanselmicantuari01anse` through `…06anse`. Vol. 1 (1938): Monologion to De casu diaboli. Vol. 2 (1940/46): Epistola de incarnatione to De concordia. Vol. 3: the prayers, the meditations, and letters 1–147. Vols 4–5: letters 148–475. Vol. 6: indices. The OCR is good, but the apparatus and line numbers are interleaved with the text (I sampled vol. 3). Raw words per volume: 99k / 111k / 107k / 81k / 70k / 188k. **Tier unverified, effectively C**: Schmitt died in 1972, and vols 2–6 came from Nelson, Edinburgh. Use it to cross-check readings and to decide authenticity, not as the import text.
- **[WS]**: la.wikisource, `https://la.wikisource.org/wiki/Scriptor:Anselmus_Cantuariensis`, about 45 pages covering nearly every PL title, including *Epistolae Anselmi*, *Orationes LXXIV* and *Meditationes XXI*. The Monologion page (`/wiki/Monologion`) holds the full text, about 200k characters, but is tagged "editio: incognita". Its alternate chapter numbers "[al. …]" point to the Gerberon/PL tradition. **Tier A** (old edition), edition unconfirmed. I did not open the other pages (the API rate-limited me), so it is a secondary cross-check.
- **[DCO]**: Documenta Catholica Omnia, author page `https://www.documentacatholicaomnia.eu/20_50_1033-1109-_Anselmus_Cantuariensis.html`, 62 "MLT" (Migne Latin) PDFs. For the letters, `…/02m/1033-1109,_Anselmus_Cantuariensis,_Epistolarum_Libri_Quatuor,_MLT.pdf` (23 MB) is a page scan of **PL 159 with a poor OCR text layer**: about 108k raw words with heavy errors (`fralnbus`, `veslra`), two columns interleaved, and the variant apparatus included. **Tier A**. Downloaded to `anselm/dco/epist4.pdf`.
- **[TLL]**: thelatinlibrary.com has only `anselmproslogion.html` (about 6.4k words, clean HTML, edition unstated, chapter numbering like Schmitt's) and `anselmepistula.html` (= Epistola de incarnatione Verbi, the version addressed to Pope Urban). **Tier A** in practice.
- **[Gerb]**: Gerberon's 1675 and 1721 Paris editions on Google Books / archive.org (`https://archive.org/details/bub_gb_a4GAf1chAyMC`, 1721). Scans only. **A**.

**English**
- **[Deane]**: S. N. Deane, *St. Anselm: Proslogium; Monologium; an Appendix in Behalf of the Fool by Gaunilon; and Cur Deus Homo* (Open Court, Chicago 1903). Clean HTML on CCEL, `https://ccel.org/ccel/anselm/basic_works/basic_works`. OCR on archive.org: `https://archive.org/details/stanselmeproslog00anseuoft` (100k raw words including front matter and index; dictionary-match quality 0.98). **Tier A** (1903).
- **[Webb]**: C. C. J. Webb, *The Devotions of Saint Anselm* (Methuen, Library of Devotion, 1903). Webb's translation of the Proslogion plus the prayers and meditations, chosen critically with spurious pieces flagged. CCEL HTML at `https://ccel.org/ccel/anselm/devotions/devotions`; archive.org at `https://archive.org/details/devotionofsaint00anseuoft` (45k raw words, 0.98). **A**.
- **[MR]**: *St. Anselm's Book of Meditations and Prayers*, translated by "M. R.", preface by Manning (Burns & Oates 1872). Translates the Gerberon/PL corpus of 21 meditations and 74 prayers, most of them spurious. CCEL HTML at `https://ccel.org/ccel/anselm/meditations/meditations`; archive.org at `https://archive.org/details/StAnselmsBook` (74k raw words, 0.97). **A**.
- **[Pusey]**: *Meditations and Prayers to the Holy Trinity and our Lord Jesus Christ*, edited by E. B. Pusey (A. A. Innes, London 1856). archive.org: `https://archive.org/details/meditationspraye00anse` (88k raw words, 0.97). **A**.
- **[GF]**: *Cur Deus Homo? … to which is added a selection from his letters* (Griffith Farran Okeden & Welsh, "Ancient & Modern Library of Theological Literature", printed 3/1891; translator anonymous). archive.org: `https://archive.org/details/curdeushomo00anse` (87k raw words, 0.98). It contains a Life, Cur Deus Homo, and **58 letters** in three groups: as monk/prior, as abbot of Bec, and as archbishop. Reissued unchanged by J. Grant, Edinburgh 1909 (`https://archive.org/details/curdeushomo00anseuoft`). **A**.
- **[Oxf]**: *Cur Deus Homo = Why God Became Man* (J. H. & J. Parker, Oxford/London 1865), anonymous. archive.org: `https://archive.org/details/curdeushomowhyg00ansegoog`. Google scan, weak OCR (0.88). **A**.
- **[McKeon]**: Richard McKeon, *Selections from Medieval Philosophers* I (Scribner, New York 1929). Contains a full translation of the *Dialogue on Truth* (De veritate). archive.org: `https://archive.org/details/selectionsfromme032882mbp` (0.98). **A** (1929).
- **[H&R]**: Jasper Hopkins & Herbert Richardson, *Complete Philosophical and Theological Treatises* (Edwin Mellen 1974–76; reissued by Banning/ex fontibus, still on sale). The only English version of every treatise. Hopkins's own site (jasper-hopkins.info) is now a parked domain. **C**.
- **[Fröhlich]**: Walter Fröhlich, *The Letters of Saint Anselm* (Cistercian Publications 1990–94, 3 vols). **C**.
- **[Ward]**: Benedicta Ward, *Prayers and Meditations of St Anselm* (Penguin 1973). **C**.

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Monologion | 1 [CC] work 5590 (PL 158); 2 [Schmitt] v.1; 3 [WS] `/wiki/Monologion`; 4 [DCO] "De Divinitatis Essentia Monologium" | A (Schmitt unverified) | 1 [Deane] 1903; 2 [H&R] | A / C | 29.3k / ~31k est. | no |
| Proslogion | 1 [CC] 5594; 2 [Schmitt] v.1; 3 [TLL]; 4 [WS]; 5 [DCO] | A | 1 [Deane]; 2 [Webb] (separate version); 3 [H&R] | A / C | 6.9k / ~7.5k | no |
| Gaunilo, *Pro insipiente* + Anselm's *Responsio* (Liber apologeticus) | 1 [CC] 5587 (Responsio; Gaunilo is under his own CC author); 2 [Schmitt] v.1; 3 [WS] *Liber pro insipiente*, *Liber Apologeticus*; 4 [DCO] | A | 1 [Deane] | A | 3.2k + ~1.5k / ~5.5k | no |
| De grammatico | 1 [CC] 5580; 2 [Schmitt] v.1; 3 [WS] | A | none PD (D. P. Henry 1964; [H&R]) | C | 6.4k / – | no |
| De veritate | 1 [CC] 5582; 2 [Schmitt] v.1; 3 [WS] | A | 1 [McKeon] 1929; 2 [H&R] | A / C | 7.1k / ~7.5k | no |
| De libertate arbitrii | 1 [CC] 5581; 2 [Schmitt] v.1; 3 [WS] | A | none PD ([H&R]) | C | 5.4k / – | no |
| De casu diaboli | 1 [CC] 5579; 2 [Schmitt] v.1; 3 [WS] | A | none PD ([H&R]) | C | 12.1k / – | no |
| Epistola de incarnatione Verbi (PL "De fide Trinitatis") | 1 [CC] 5573; 2 [Schmitt] v.2 (both recensions); 3 [TLL] `anselmepistula.html`; 4 [WS] | A | none PD ([H&R]) | C | 8.6k / – | no |
| Cur Deus homo | 1 [CC] 5569; 2 [Schmitt] v.2; 3 [WS]; 4 Laemmer's ed. (Berlin 1857), `https://archive.org/details/sanselmicantuar04laemgoog` | A | 1 [Deane]; 2 [GF] 1891; 3 [Oxf] 1865; 4 [H&R] | A / C | 23.5k / ~26k | no |
| De conceptu virginali et de originali peccato | 1 [CC] 5571; 2 [Schmitt] v.2; 3 [WS] | A | none PD ([H&R]) | C | 9.8k / – | no |
| De processione Spiritus Sancti | 1 [CC] 5576; 2 [Schmitt] v.2; 3 [WS] | A | none PD ([H&R]) | C | 14.5k / – | no |
| Epistola de sacrificio azimi et fermentati | 1 [CC] 5570; 2 [Schmitt] v.2; 3 [WS] | A | none PD ([H&R]) | C | 2.0k / – | no |
| Epistola de sacramentis ecclesiae (Ad Walerannum) | 1 [CC] 5596 "Responsio"; 2 [Schmitt] v.2; 3 [DCO] "Ad Waleranni quaerelas responsio" | A | none PD ([H&R]) | C | 0.8k / – | no |
| De concordia praescientiae… cum libero arbitrio | 1 [CC] 5572; 2 [Schmitt] v.2; 3 [WS] | A | none PD ([H&R]) | C | 12.1k / – | no |
| Orationes sive meditationes (genuine: 19 prayers + 3 meditations, Schmitt v.3) | 1 [Schmitt] v.3 (only source that separates genuine from spurious); 2 [CC] 5593 *Orationes* + 5589 *Meditationes et orationes* (PL, mixed); 3 [WS] *Orationes LXXIV*, *Meditationes XXI* | A (Schmitt unverified) | 1 [Webb] 1903; 2 [MR] 1872; 3 [Pusey] 1856; 4 [Ward] | A / C | genuine ≈25k est. (PL 93.6k mixed) / Webb 45k raw | no |
| Epistolae (Schmitt 475 letters; PL 4 books) | Books I–II: 1 [CC] 5583 (PL 158, 42.8k, clean). Books III–IV: 1 [DCO] PL 159 PDF (poor OCR); 2 [Schmitt] v.3–5; 3 [WS] *Epistolae Anselmi* (coverage unchecked) | A (Schmitt unverified) | 1 [GF] 1891, 58 letters; 2 [Fröhlich] complete | A partial / C | ≈150k est. (42.8k clean + ~100k from PL 159) / GF ≈20k | no |
| Minor genuine pieces: *De humanis moribus* (Similitudines), *Dicta Anselmi*, philosophical fragments | none clean. PL prints a reworked *Liber de similitudinibus* among the spuria; the critical texts are in Southern & Schmitt, *Memorials of St Anselm* (1969) | C | none PD | – | ~30k est. / – | no |

**Doubtful / spurious in PL 158–159 (in CC; not in Schmitt's canon).** All are Latin [CC] **A**, with no English except as noted.
- *Meditatio super Miserere* (14.1k). [MR] translates it.
- *Homiliae et exhortationes* (36.4k).
- *Hymni et psalterium de S. Maria* (3.0k).
- *Carmen de contemptu mundi* (4.7k + 0.9k; by Roger of Caen).
- *Exhortatio ad contemptum temporalium* (3.1k).
- *Admonitio morienti* (0.5k). Traditional, and in [MR].
- *De voluntate* (0.9k).
- *De voluntate Dei* (1.2k).
- *Quaedam dicta utilia* (2.3k).
- *Tractatus asceticus* (5.0k).
- *De pace et concordia* (2.2k).
- *De nuptiis consanguineorum* (1.4k).
- *Offendiculum sacerdotum* (0.4k).
- *Versus de Lanfranco* (0.3k).
- *Sermo de passione* (0.6k).
- Under CC's "Auctor incertus (Anselmus?)" (24.1k in total):
  - *Meditationes* (20.5k). Mostly John of Fécamp and others; [MR] and [Pusey] translate them as Anselm's.
  - *De cognitione verae vitae* (13.1k).
  - *De contritione cordis* (3.5k).
  - *Dialogus B. Mariae et Anselmi de passione* (4.8k).
  - *De mensuratione crucis* (5.0k).
  - Marian pieces by Eadmer: *De conceptione B. Mariae* (6.6k + 1.6k sermon).
  - *Miracula S. Jacobi*.
  - *Passio SS. Guinerii…*

## Notes per work

- **Monologion / Proslogion / Responsio / Cur Deus homo.** These have the best coverage: three independent Latin witnesses (CC-PL, Schmitt, WS) and a clean public-domain English (Deane, already HTML on CCEL). PL's chapter divisions match Schmitt's for these works, though chapter titles differ a little. Deane's Gaunilo section translates Gaunilo, not Anselm. Ship it as an appendix chapter, as every edition does.
- **The three dialogues (De veritate, De libertate arbitrii, De casu diaboli) and De grammatico.** Latin is clean. Only De veritate has a public-domain English (McKeon 1929, complete, with the chapter headings). The other three need our own Latin→pt-BR translation without an English pivot, as Ember already does for Denis.
- **Theological letters and treatises of the archbishop years** (De incarnatione Verbi, De conceptu virginali, De processione, the two Waleran letters, De concordia). Latin is clean in CC. No English we may use: Hopkins & Richardson is the only translation, and it is sold (C). PL's *De fide Trinitatis* is the second recension of the Epistola de incarnatione. Schmitt prints both recensions, and TLL has the final one.
- **Prayers and meditations.** This is the big attribution trap. PL's 21 meditations and 74 prayers are mostly by others (John of Fécamp, Elmer of Canterbury, Ekbert of Schönau and more). Wilmart's and Schmitt's work leaves 19 prayers and 3 meditations as genuine. Webb 1903 is the only public-domain English that follows the critical selection. M. R. 1872 and Pusey 1856 translate the old corpus wholesale and are useful only for the pieces they share with Schmitt. Recommendation: build the work on Schmitt's list of 19+3 pieces, with Latin text from CC-PL for each matching piece (spot-checked against Schmitt) and English from Webb, falling back to M. R.
- **Letters.** CC breaks off at the end of PL 158 (book II, letter LIII). PL 159 (books III–IV, about two-thirds of the letters) exists only as Migne page scans with poor OCR (DCO) and as Schmitt's 1946–51 critical text (vols 4–5, unverified tier). Clean Latin for books III–IV would need re-OCR of the PL 159 scans or correction of the DCO text layer, roughly 100k words. PL and Schmitt also number the letters differently, so a concordance is needed. English: the anonymous 1891 selection covers 58 letters (A). Fröhlich is complete but C.
- **Minor genuine works** (*De humanis moribus*, *Dicta*, philosophical fragments) exist critically only in Southern & Schmitt 1969 (C). PL's *Liber de similitudinibus* is a later compilation. Mark these as not sourceable cleanly.

## Recommendation

Layout: `anselm-opera-omnia/` with Schmitt's order and these groups:
- `treatises/`: monologion, proslogion (with Gaunilo + responsio), de-grammatico, de-veritate, de-libertate-arbitrii, de-casu-diaboli, epistola-de-incarnatione-verbi, cur-deus-homo, de-conceptu-virginali, de-processione-spiritus-sancti, de-sacrificio-azimi, de-sacramentis-ecclesiae, de-concordia.
- `orationes-meditationes/`: the 22 genuine pieces.
- `epistolae/`: four books, PL numbering, with Schmitt numbers in the headings.
- `dubia/`: optional. The PL spuria, labelled as such, if wanted for completeness.

`la/` is the canonical text from CC-PL 158. Import order:
1. Proslogion, Monologion, Responsio and Cur Deus homo, all with Deane's English. Fully tier A and already clean HTML.
2. De veritate with McKeon's English.
3. The remaining treatises, Latin only (pt-BR translated from the Latin).
4. The prayers and meditations, using Webb's English.
5. Letters books I–II, from clean CC text.
6. Letters books III–IV, after re-OCR or correction of PL 159.

Cannot be sourced cleanly: English for 10 of the 15 treatises (tier C only, Hopkins & Richardson), the complete English letters (Fröhlich, C), the minor works in Southern & Schmitt (C), and clean Latin for letter books III–IV (scans only).

**Total size.** Genuine Latin: about 170k words of treatises and prayers in CC, plus about 150k of letters, so **≈320k words**. Adding the PL dubia brings it to about 430k. Usable public-domain English: about 77k words of works (Deane ≈70k, McKeon ≈7.5k), Webb's devotions, and about 20k of letters.

## Portuguese

The general web-search budget ran out partway through this pass. After that, searching went through site catalogues only: archive.org advancedsearch, the pt.wikisource API (no Anselm), the Martins Fontes Paulista catalogue API ("santo anselmo", "anselmo de cantuária", "proslogio", "monologio", "cur deus homo"), and Permanência / Montfort site search. Domínio Público was Cloudflare-blocked.

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| Monologion | **Angelo Ricci**, "Monológio", in *Os Pensadores* vol. VII: *Santo Anselmo / Abelardo*, São Paulo: Abril Cultural, 1ª ed. May 1973 | https://archive.org/details/os-pensadores-07-santo-anselmo-abelardo (`anselm/pt/ia-pensadores07_djvu.txt`, a fan upload) | **C**: the copyright page reads "Copyright desta edição, 1973, Abril S.A. Cultural… Direitos exclusivos sobre as presentes traduções" | Complete with the letter to Lanfranc, and Ricci's notes. OCR'd scan with decent OCR (hyphenation, running heads). The Brazilian academic standard for decades. |
| Proslogion (+ Gaunilo, *Pro insipiente*, + Anselm's *Responsio*) | **Angelo Ricci**, same volume ("Proslógio", "Objeção de Gaunilo…", "Resposta de Anselmo a Gaunilo") | same | C (same) | Complete, with all three texts and notes. OCR as above. |
| Proslogion | **Sérgio de Carvalho Pachá**, *Proslógio – edição bilíngue*, Concreta, 1ª ed. 2022, 124 pp., ISBN 9788568962121 | https://www.martinsfontespaulista.com.br/proslogio---edicao-bilingue-781156/p | C | Latin–Portuguese. Listing only (whether Gaunilo is included is unknown). Print. |
| Proslogion (excerpt) | *Liturgia das Horas* (pt-BR), "Do livro Proslógion, de Santo Anselmo" (ch. 1) | `content/loth/parts/reading-*.json` | as the LotH corpus | 1 excerpt |
| De veritate | **Ruy Afonso da Costa Nunes**, "A Verdade", *Os Pensadores* VII (1973) | archive.org item above | C (Abril 1973) | Complete. OCR as above. |
| De grammatico | **Ruy Afonso da Costa Nunes**, "O Gramático", *Os Pensadores* VII (1973) | archive.org item above | C (Abril 1973) | Complete as far as the OCR shows. OCR as above. |
| Orationes sive meditationes (excerpt) | LotH "Das Meditações de Santo Anselmo" | `content/loth/` | as the LotH corpus | 1 excerpt |
| Cur Deus homo | **none verified** (no hit in the archive.org or Martins Fontes catalogues; web search was exhausted before this could be checked further) | – | – | – |
| De libertate arbitrii, De casu diaboli, Epistola de incarnatione Verbi, De conceptu virginali, De processione Spiritus Sancti, De azymo, De sacramentis, De concordia, Epistolae, minor pieces | none found (same searches) | – | – | – |

Notes:
- *Os Pensadores* went through several later Abril / Nova Cultural editions. Only the 1973 1st edition was seen (the archive.org scan). Both translators worked well after 1955, so this is tier C whatever the edition.
- In the same volume, the note saying the text is "resumo" rather than literal translation belongs to Abelard's *Historia calamitatum*, not to any Anselm text.
- No tier-A Portuguese Anselm was found. archive.org has no pre-1930 Portuguese Anselm; its "Santo Anselmo" hits are Italian.

**Recommendation.** For the pt-BR translation, the best reference is **Ricci's *Monológio* and *Proslógio* (with Gaunilo and the Responsio)** in *Os Pensadores* VII, with Pachá's 2022 bilingual *Proslógio* as a second check. For *De veritate* and *De grammatico*, use Costa Nunes from the same volume. Nothing is importable (all C). *Cur Deus homo* and the other treatises have no Portuguese reference found, so they rely on the pipeline alone.
