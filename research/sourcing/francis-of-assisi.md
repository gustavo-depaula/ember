# St. Francis of Assisi and the early Franciscan sources

Scope: the writings of Francis himself (Latin, plus two Umbrian pieces) and the early biographical and narrative sources about him: Thomas of Celano, the *Legend of the Three Companions*, the *Anonymous of Perugia*, the *Assisi Compilation* (*Legenda Perusina*), the *Speculum perfectionis*, the *Sacrum commercium*, the *Actus beati Francisci*, the *Fioretti* with the *Considerazioni sulle stimmate* and the lives and sayings of Brothers Juniper and Giles. Bonaventure's *Legenda maior* and *Legenda minor* are listed in `bonaventure.md` (their author's report) and referenced here.

Bibliographical frame: for Francis's writings, K. Esser, *Opuscula S. P. Francisci Assisiensis* (Grottaferrata 1978, 2nd ed.), the canon that every modern edition follows. Before it came the Quaracchi *Opuscula* (1904) and H. Boehmer, *Analekten* (1904). For the legends, *Analecta Franciscana* X (Quaracchi 1926–41) and *Fontes Franciscani* (ed. Menestò–Brufani, Assisi 1995).

**Already in the corpus:** nothing. `_corpus-books.txt` and `content/books/` hold no Franciscan work, not even in English. (Francis appears only as a subject in `butler-lives-of-saints`, `catholic-encyclopedia` and the other lives-of-saints collections.)

Raw downloads used for counting are in `research/sourcing/francis-of-assisi/` (`ia/` = archive.org `_djvu.txt`, `wayback/` = archived poliba and franciscanos.net pages, `la-esser/` = Esser's Latin from franciscanos.org, `it/` = Italian Fioretti texts, `en/` = CCEL Little Flowers).

## Summary table

Word counts: **orig** is a count of the clean HTML text where one exists, otherwise an estimate (marked ≈). **en** is the OCR count of the archive.org volume including its introduction and notes, with an estimate of the translation proper in brackets.

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| **Writings of Francis** (Esser canon, 40 pieces: Admonitions, Rules, Testaments, letters, praises, Office of the Passion…) | franciscanos.org/esfa/omfra.html (Esser 1978, Latin); archive.org `opusculasanctipa00fran` (Quaracchi 1904) | B (Esser, hosted with publisher's permission) / A (Quaracchi 1904) | Paschal Robinson, *The Writings of St Francis of Assisi*, 1906, archive.org `writingsofsaintf00fran` | A | 27.7k / 59k OCR (≈30k translation) | no |
| Canticle of Brother Sun (Umbrian) | it.wikisource `Cantico_di_Frate_Sole` | A (CC BY-SA transcription) | Robinson 1906 (in the same volume) | A | ≈0.25k | no |
| *Audite poverelle* (Umbrian, found 1976) | franciscanos.org/esfa/audite.html; it.wikisource `Audite_poverelle` | B | none found pre-1964 | — | ≈0.15k | no |
| Thomas of Celano, *Vita prima* (1C) | poliba (Wayback) `ff_vitaprima_lat.html`; archive.org `sfrancisciassisi00thom` (d'Alençon 1906) | unverified / A | A. G. Ferrers Howell, *The Lives of S. Francis of Assisi*, 1908, archive.org `livesofsfranciso00thom` | A | 31.8k / (≈32k of 106k vol.) | no |
| Celano, *Vita secunda* (2C, *Memoriale*) | poliba (Wayback) `ff_vitaseconda_lat.html`; d'Alençon 1906 | unverified / A | Howell 1908 (same volume) | A | 42.9k / (≈45k of 106k vol.) | no |
| Celano, *Tractatus de miraculis* (3C) | poliba (Wayback) `ff_trattatomiracoli_lat.html`; d'Alençon 1906 | unverified / A | **none PD** (only Armstrong et al., *Francis of Assisi: Early Documents*, 1999–2001, New City Press) | C | 24.0k / — | no |
| Celano, *Legenda ad usum chori* | d'Alençon 1906 (scan/OCR only) | A | none found | — | ≈2k | no |
| *Legenda trium sociorum* (3Soc) | poliba (Wayback) `ff_trecompagni_lat.html`; archive.org `laleggendadisan00marcgoog` (Marcellino da Civezza & Domenichelli 1899, Latin + Italian) | unverified / A | E. Gurney Salter, *The Legend of St Francis by the Three Companions*, 1902, archive.org `legendsaintfran00saltgoog` | A | 14.7k / 27k OCR (≈20k) | no |
| *Anonymus Perusinus* | poliba (Wayback) `ff_anonimoperugino_lat.html` | unverified | none PD | — | 7.8k / — | no |
| *Legenda Perusina* / *Compilatio Assisiensis* | poliba (Wayback) `ff_leggendaperugina_lat.html` | unverified | none PD (only modern, C) | C | 38.2k / — | no |
| *Speculum perfectionis* (1318 redaction) | archive.org `speculumperfecti0000unse` (Sabatier 1898); `documentaantiqua00lemm` (Lemmens 1901, other redaction) | A | Sebastian Evans, *The Mirror of Perfection*, 1898/1899, archive.org `mirrorofperfecti00leob`; Robert Steele 1903/Everyman 1910 | A | ≈40k (no clean text) / 57k OCR (≈45k) | no |
| *Sacrum commercium S. Francisci cum domina Paupertate* | poliba (Wayback) `ff_sacrocommercio_lat.html`; archive.org `sacrumcommercium0000appc` (Quaracchi 1929) | unverified / A | Montgomery Carmichael, *The Lady Poverty*, 1901, Gutenberg #66025 | A | 8.8k / ≈12k | no |
| *Actus beati Francisci et sociorum eius* | poliba (Wayback) `ff_attifrancesco_lat.html`; archive.org `actusbeatifranc00sabagoog` (Sabatier 1902) | unverified / A | no direct PD translation (the Fioretti translations cover about two-thirds of it) | — | 45.2k / — | no |
| *Fioretti di San Francesco* (53 chapters) | it.wikisource `Fioretti_di_San_Francesco` (Cesari text, Livorno 1860, proofread) | A (CC BY-SA transcription) | Manning 1864 tr. rev. Hudleston 1926, CCEL `ugolino/flowers`; T. Okey 1910 (Everyman); T. W. Arnold 1898 | A | 44.9k / ≈55k | no |
| *Considerazioni sulle stimmate* | poliba (Wayback) `ff_stimmatefrancesco_ita.html`; archive.org `ifiorettidisanfr00franuoft` (Cesari 1868) | unverified / A | CCEL (Hudleston) and Okey 1910 | A | 16.3k / ≈17k | no |
| *Vita di frate Ginepro* | poliba (Wayback) `ff_vitaginepro_ita.html`; Cesari 1868 | unverified / A | CCEL (Hudleston) and Okey 1910 | A | 6.2k / ≈6k | no |
| *Vita di frate Egidio* | poliba (Wayback) `ff_vitaegidio_ita.html` | unverified | CCEL (Hudleston), Part III | A | 3.4k / ≈4k | no |
| *Detti di frate Egidio* | poliba (Wayback) `ff_dettiegidio_ita.html` | unverified | CCEL (Hudleston), Part IV | A | 11.8k / ≈10k | no |
| Bonaventure, *Legenda maior* and *Legenda minor* | see `bonaventure.md` | | | | 40.3k + 9.2k | no |

## Sources per work, ranked

### Writings of Francis (the *Opuscula*)

The canon (Esser 1978): Admonitiones (28); Audite poverelle; Benedictio fratri Bernardo; Benedictio s. Clarae; Benedictio fratri Leoni; Canticum fratris Solis; Epistola ad s. Antonium; Epistola civibus Bononiensibus (doubtful); Epistola s. Clarae de ieiunio (doubtful); Epistola ad clericos (two recensions); Epistolae ad custodes I–II; Epistola ad fideles I (earlier recension) and II; Epistola fratribus Franciae (doubtful); Epistola dominae Iacobae (fragment, doubtful); Epistola ad fratrem Leonem; Epistola ad ministrum; Epistola toti Ordini missa; Epistola ad populorum rectores; Exhortatio ad laudem Dei; Expositio in Pater noster; Forma vivendi s. Clarae; Fragmenta alterius Regulae; Laudes Dei altissimi; Laudes ad omnes horas; Officium Passionis Domini; Oratio ante Crucifixum; Regula bullata (1223); Regula non bullata (1221); Regula pro eremitoriis; Salutatio BMV; Salutatio virtutum; Testamentum; Testamentum Senis factum; Ultima voluntas s. Clarae scripta; De vera et perfecta laetitia. Esser lists a doubtful *Oratio "Absorbeat"*, which Quaracchi 1904 printed as genuine; Quaracchi 1904 also lists *opuscula spuria* (pp. 203 ff.).

Original Latin, ranked:
1. **franciscanos.org (OFM Valencia, "Directorio Franciscano")**: https://www.franciscanos.org/esfa/omfra.html is all 40 pieces on one page (27,748 words with index and sigla), with per-piece pages listed at https://www.franciscanos.org/esfa/menud1.html. The text is **Esser 1978**, the critical edition. The introduction (`introd.html`) says the texts are reproduced "con la gentil y generosa autorización de los Editori di Quaracchi-Grottaferrata… de la edición crítica del P. Kajetan Esser, Opuscula Sancti Patris Francisci Assisiensis (Bibliotheca Franciscana Ascetica Medii Aevi, Tom. XII), Grottaferrata… 1978". Tier **B**: the publisher gave permission to this host, not to everyone. The text itself is medieval, and Italy's right in critical editions (20 years) has expired, but I have not confirmed how that applies. Best: the complete modern canon in clean HTML.
2. **Quaracchi 1904**, *Opuscula sancti patris Francisci Assisiensis*, archive.org `opusculasanctipa00fran` (`_djvu.txt` 34k words including introduction and apparatus). Tier **A**. Good OCR: single column, small octavo, only light errors. It lacks pieces found later (Audite poverelle, Exhortatio ad laudem Dei, the first recension of the letter to the faithful, De vera laetitia, the Bologna and France letters). Use it to cross-check Esser.
3. **la.wikisource**, `Scriptor:Franciscus_Assisiensis`: Regula bullata, Regula non bullata, Testamentum, Epistola toti Ordini missa, Canticum fratris Solis. Tier A (CC BY-SA transcription). Partial; edition not stated.
4. **H. Boehmer, *Analekten zur Geschichte des Franciscus von Assisi*** (Tübingen 1904; 2nd ed. Wiegand 1930), archive.org `analektenzurgesc0000hboe`, `analektenzurges00boehgoog`. Tier A. An independent critical text of the same date as Quaracchi, useful as a third witness. The djvu text for the Google copy did not download; I have not checked the OCR.
5. The Franciscan Archive (franciscan-archive.org/patriarcha/) links Latin texts said to be from Esser, but its `opera/opuscula.html` returns 404 now.

English, ranked:
1. **Paschal Robinson OFM, *The Writings of Saint Francis of Assisi*** (Philadelphia: Dolphin Press, 1906), archive.org `writingsofsaintf00fran` (also `cu31924029364787`, `writingssaintfr02frangoog`). Tier **A** (1906). It covers what Quaracchi 1904 printed: Admonitions, Salutation of the Virtues, On the Lord's Body, both Rules, fragments from the Clares' Rule, Testament, Hermitages, six letters, the Praises and Lord's Prayer paraphrase, the Salutation of the BVM, Absorbeat, Praises of God, Blessing of Leo, Canticle and Office of the Passion, plus an appendix of lost, doubtful and spurious pieces. The OCR is good. The same translation is on sacred-texts.com (`chr/stf`), which blocked our client.
2. "By a Religious of the Order", *The Words of St Francis* (1882; 2nd ed. 1890) and Countess de la Warr's translation of d'Alençon (1907). Both are tier A and listed by Okey (Everyman 1910 bibliography); neither is located online yet.
3. There is no PD English for the post-1904 discoveries. The modern translations (Armstrong–Hellmann–Short, *Francis of Assisi: Early Documents*, New City Press 1999; Armstrong–Brady, Paulist 1982) are tier **C**.

Structure: one chapter per opusculum, grouped Rules / Testaments / Letters / Admonitions / Praises and prayers / Office of the Passion. The Admonitions (28) and the Office (15 psalms) need sub-sections. The Rule of 1221 has 24 chapters, the Rule of 1223 has 12.

### Canticle of Brother Sun and *Audite poverelle* (Umbrian)

- Canticle, original: (1) it.wikisource `Cantico_di_Frate_Sole` (with a diplomatic Lucas variant `Laudes_creaturarum_(Lucas)`); (2) franciscanos.org/esfa/cantsol.html (Esser, from cod. Assisi 338); (3) Quaracchi 1904 (OCR). English: Robinson 1906; Matthew Arnold's prose version in *Essays in Criticism* (1865), tier A.
- Audite poverelle, original: it.wikisource `Audite_poverelle` and franciscanos.org/esfa/audite.html. It was found in 1976 (ed. Boccali), so there is no PD English. Tier B for the Italian text.
- These two go to `it/` as the original language.

### Thomas of Celano: *Vita prima*, *Vita secunda*, *Tractatus de miraculis*, *Legenda ad usum chori*

Original Latin, ranked:
1. **poliba.it "Fonti francescane"** (Politecnico di Bari, M. Mastrorilli 2000–02; offline now, preserved in the Wayback Machine): `ff_vitaprima_lat.html` (31.8k words), `ff_vitaseconda_lat.html` (42.9k), `ff_trattatomiracoli_lat.html` (24.0k), from `http://rilievo.poliba.it/bsc/bsc/st/cc/orm/francescani/fonti/` (snapshots 2004–06; the list is in `francis-of-assisi/wayback/cdx.txt`). Complete, clean HTML with paragraph numbers and biblical `cfr.` references. The `cfr.` references match the *Fontes Franciscani* (1995) / *Fonti Francescane* apparatus, so the text is probably from that edition. The page gives no edition, only "Trascrizione, impaginazione e link: Maurizio Mastrorilli, 2002", and no licence. Tier **unverified** (B at best: an abandoned free site). Best clean text, but a modern critical text of uncertain status.
2. **É. d'Alençon, *S. Francisci Assisiensis vita et miracula, additis opusculis liturgicis, auctore fr. Thoma de Celano*** (Rome 1906), archive.org `sfrancisciassisi00thom` (157k OCR words including prolegomena and apparatus; also `sfrancisciassis00dogoog`). Tier **A**. It contains 1C, 2C, 3C and the liturgical pieces. This is the edition Howell translated, and the safe base for import, with the poliba text for cross-checking.
3. *Analecta Franciscana* X (Quaracchi 1926–41), the standard critical edition. Fascicles 1926–28 are pre-1930, but I could not find it on archive.org (the `analectafrancisc0Ncoll` items there are vols. I–IX).
4. H. G. Rosedale, *St Francis of Assisi according to Brother Thomas of Celano* (London 1904), archive.org `stfrancisassisi00rosegoog` (138k OCR). Tier A. Latin text of 1C/2C with an English introduction; a third witness.

English, ranked:
1. **A. G. Ferrers Howell, *The Lives of S. Francis of Assisi by Brother Thomas of Celano*** (London: Methuen, 1908), archive.org `livesofsfranciso00thom` (also `livessfrancisas00howegoog`, `cu31924101858318`). Tier **A**. Contains 1C (three parts) and 2C, translated from d'Alençon 1906, with d'Alençon's chapter numbering. It does **not** contain the *Tractatus de miraculis*.
2. archive.org `the-first-life-of-saint-francis-brother-thomas-of-celano` and `the-second-life-of-saint-franci-brother-thomas-of-celano`, uploads dated 1908 that appear to be Howell split in two. Not opened.
3. *Tractatus de miraculis* and *Legenda ad usum chori*: **no PD English found**. The only translations are FA:ED (New City Press, C) and the Omnibus (Franciscan Herald 1973, C). Import these Latin-only, or leave them for our own pipeline.

Structure: 1C has a prologue and 3 books (*opuscula*) with 30 chapters and numbered paragraphs 1–151. 2C has a prologue and 2 books, numbered 1–224. 3C has 19 chapters, numbered 1–198.

### *Legend of the Three Companions*

- Original: (1) poliba (Wayback) `ff_trecompagni_lat.html`, 14.7k words, with the dedicatory letter of Greccio (1246) and 18 chapters; clean, tier unverified as above. (2) **Marcellino da Civezza & T. Domenichelli, *La leggenda di S. Francesco scritta da tre suoi compagni*** (Rome 1899), archive.org `laleggendadisan00marcgoog` (134k OCR, Latin + Italian + apparatus). Tier **A**. This is the "first complete edition" that Salter translated.
- English: (1) **E. Gurney Salter, *The Legend of Saint Francis by the Three Companions*** (London: Dent, Temple Classics, 1902), archive.org `legendsaintfran00saltgoog` and `legendofsaintfra00unse`. Tier **A**. (2) Countess de la Warr, 1902; tier A, not located online.

### *Anonymus Perusinus* (*De inceptione*) and *Legenda Perusina* (*Compilatio Assisiensis*)

- Original: poliba (Wayback) `ff_anonimoperugino_lat.html` (7.8k) and `ff_leggendaperugina_lat.html` (38.2k, 119 numbered sections in the Perugia MS 1046 order, so the Bigaroni/Fontes text). Both clean and both tier unverified. I found no pre-1930 edition: these texts were edited in 1922 (Delorme, *Legenda antiqua*, partial, *Archivum Franciscanum Historicum*) and later in 1970 and 1975. Delorme 1926 (*La "Legenda antiqua S. Francisci"*) may be PD, but I have not located it.
- English: **none PD**. Translations exist only in the Omnibus (1973) and FA:ED (both C). These two would be Latin-only imports. Much of the *Compilatio* material reappears in the *Speculum perfectionis*, which does have PD English.

### *Speculum perfectionis*

- Original: (1) **P. Sabatier, *Speculum perfectionis seu S. Francisci Assisiensis legenda antiquissima auctore fratre Leone*** (Paris: Fischbacher, 1898), archive.org `speculumperfecti0000unse` (204k OCR including a long French *étude critique*; the Latin text is ≈40k by estimate). Tier **A**. This is the 1318 redaction in 124 chapters, the text Evans translated. (2) P. Sabatier, *Le Speculum perfectionis ou Mémoires de frère Léon* (Manchester, British Society of Franciscan Studies, 1928–31, 2 vols.), archive.org `lespeculumperfec01unse` and `lespeculumperfec02unse`. Vol. 1 (1928) is tier A; vol. 2 (1931) is unverified. (3) L. Lemmens, *Documenta antiqua franciscana* II (Quaracchi 1901), the "Speculum perfectionis (redactio I)", archive.org `documentaantiqua00lemm`. Tier A; a different, shorter redaction. I found **no clean HTML Latin anywhere**: OCR clean-up from Sabatier 1898 is required.
- English: (1) **Sebastian Evans, *The Mirror of Perfection*** (London: Nutt, 1898; Boston 1899), archive.org `mirrorofperfecti00leob` (57k OCR) and a 1920 reprint `themirrorofperfe00unknuoft`. Tier **A**. (2) **Robert Steele** (Temple Classics 1903; reprinted in Okey's Everyman volume, 1910), archive.org `thelittleflowers00okey`, pp. 301 ff. Tier **A**. (3) Constance Wyatt (?), archive.org `TheMirrorOfPerfection` (1902), not checked.

### *Sacrum commercium*

- Original: (1) poliba (Wayback) `ff_sacrocommercio_lat.html`, 8.8k, clean, unverified. (2) **Quaracchi 1929**, *Sacrum commercium S. Francisci cum domina Paupertate*, archive.org `sacrumcommercium0000appc`. Tier A (1929). (3) d'Alençon 1900, the first critical edition, not located online.
- English: (1) **Montgomery Carmichael, *The Lady Poverty*** (1901), Project Gutenberg #66025. Tier **A**; clean text. (2) Canon H. D. Rawnsley, *Sacrum Commercium* (Temple Classics 1904, Latin and English). Tier A, not located online.

### *Actus beati Francisci et sociorum eius*

- Original: (1) poliba (Wayback) `ff_attifrancesco_lat.html`, 45.2k, 76 chapters, clean, unverified. (2) **P. Sabatier, *Actus beati Francisci et sociorum eius*** (Paris 1902), archive.org `actusbeatifranc00sabagoog` and `actusbeatifranc01sabagoog`. Tier **A**.
- English: no direct PD translation. The Fioretti translations render most chapters of the Actus, but not all.
- Note: the *Actus* is the Latin source and the *Fioretti* its Italian reworking. They are distinct works with different chapter sets, and both deserve a place.

### *Fioretti*, *Considerazioni sulle stimmate*, Juniper and Giles

Original Italian, ranked:
1. **it.wikisource `Fioretti_di_San_Francesco`**: Cesari's text (*Fioretti di S. Francesco, testo di lingua secondo la lezione adottata dal P. A. Cesari*, Livorno: Mazzajoli, 1860), 53 chapter pages and 44.9k words, marked "riletto e controllato" (proofread twice against the scan). Licence "CC BY-SA 3.0 / GFDL" on the transcription; the text is PD. Tier **A**. Best clean text, but **it contains only the 53 chapters**: no Considerazioni and no Juniper/Giles.
2. **poliba (Wayback)**: `ff_fiorettifrancesco_ita.html` (40.9k), `ff_stimmatefrancesco_ita.html` (Considerazioni, 16.3k), `ff_vitaginepro_ita.html` (6.2k), `ff_vitaegidio_ita.html` (3.4k), `ff_dettiegidio_ita.html` (11.8k). Clean, edition not stated, tier unverified. This is **the only clean source found for the Considerazioni and the Juniper and Giles texts.**
3. **Liber Liber**, *I fioretti di san Francesco* (1st e-edition 1998, from Newton Compton 1993, introduction by F. Grisi), mirror https://linux.studenti.polito.it/static_resources/liberliber/biblioteca/f/fioretti_di_san_francesco/i_fioretti_di_san_francesco/ (zip, pdf, rtf; 39.4k words). Header: "DIRITTI D'AUTORE: no", "INDICE DI AFFIDABILITA': 1" (medium). 53 chapters only. Tier A for the text (Grisi's introduction is excluded).
4. **Cesari, *I Fioretti di San Francesco*** (Verona/Firenze 1868 ed.), archive.org `ifiorettidisanfr00franuoft` (79k OCR). Tier **A**. It contains the Fioretti, the five Considerazioni, the Vita di frate Ginepro and Giles. Fair OCR: `t`→`l` errors ("elade", "spirilo"), hyphenation. This is the PD scan to rebuild or check the Considerazioni against.
5. L. Manzoni, *I Fioretti di Sancto Franciescho secondo la lezione del codice fiorentino scritto da Amaretto Manelli* (Rome 1902), archive.org `ifiorettidisanct00manz` (75k OCR). Tier A. A diplomatic edition of the oldest dated MS (1396), useful for variants. Also A. della Torre (1909) `ifiorettidisfran00fran`, and L. Amoni (1889) `fiorettidisfranc00amon`.

English, ranked:
1. **CCEL, *The Little Flowers of St. Francis of Assisi*** (https://ccel.org/ccel/ugolino/flowers, txt at `/ccel/u/ugolino/flowers/cache/flowers.txt`, 81.5k words). This is "the first English translation" (Manning/Fullerton 1864) "revised and emended by Dom Roger Hudleston" (Burns Oates 1926), from the Heritage Press reprint with a 1965 introduction by Arthur Livingston. CCEL header: "Rights: Public Domain"; marked "Proofed". It contains Part I (Fioretti, 58 chapters with the Considerazioni at the end of Part I), Part II (Life of Juniper), Part III (Life of Giles) and Part IV (Sayings of Giles). Tier **A** for the 1864/1926 translation. **Drop Livingston's 1965 introduction**, which is not PD. Best: clean, proofread, and complete across all five works.
2. **Thomas Okey, *The Little Flowers, Life and Mirror of St Francis*** (Everyman's Library, Dent 1910; reprinted 1912), archive.org `thelittleflowers00okey` (183k OCR). Okey's Fioretti, the Considerations and Juniper (translated from Cesari, with readings from Passerini), plus Salter's *Legenda maior* and Steele's *Mirror of Perfection*. Tier **A** (1910; Okey d. 1935). Good OCR. Strong second witness.
3. **T. W. Arnold**, *The Little Flowers of Saint Francis* (Temple Classics 1898; 1908 ed. with Biagi), archive.org `littleflowersofs00arnouoft`, `littleflowersofs00arno`. Tier A.
4. W. Heywood, *The Little Flowers of the Glorious Messer St Francis and of his Friars* (Methuen 1906), archive.org `TheLittleFlowers`. Tier A. Also Abby Langdon Alger (Boston 1887), archive.org `littleflowersofs01alge`, tier A.

## Notes

- **The poliba corpus is the backbone of clean text but has no edition statement.** It is a dead university site (Politecnico di Bari, "Biblioteca di Scienze del Cristianesimo", 2000–02) that survives only in the Wayback Machine. Its Latin carries the `cfr.` biblical apparatus of *Fontes Franciscani* (1995), which suggests a modern critical text copied without credit. Treat it as a cross-check witness and pair each poliba text with a PD print edition: d'Alençon 1906 for Celano, Marcellino 1899 for 3Soc, Sabatier 1902 for the Actus, Cesari 1868 for the Considerazioni. Where only poliba exists (Anonymus Perusinus, Compilatio Assisiensis), the import is tier unverified.
- **franciscanos.net** (BEBF) also hosted Latin texts (`fuentes/legmaior.htm`, `fuentes/legminor.htm`, `maestros/colltap.htm`, `escritos/opuscula.htm`). It is offline now, with some pages in the Wayback Machine: `legmaior.htm` (2019 snapshot) has 39.9k words of *Legenda maior* Latin, a third witness for Bonaventure.
- Gaps with no PD English: *Tractatus de miraculis*, *Legenda ad usum chori*, *Anonymus Perusinus*, *Compilatio Assisiensis*, *Actus*, *Legenda minor*, and Francis's post-1904 writings. All have clean or PD originals, so our pipeline can supply both en and pt-BR, or they can ship original-only.
- Clare: the *Legenda S. Clarae* (poliba `ff_leggendachiara_lat.html`, 10.6k; English: Paschal Robinson, *The Life of St Clare ascribed to Thomas of Celano*, 1910, archive.org `lifesaintclarea00robigoog`, A), the canonization process (Italian, poliba) and Clare's writings belong in a Clare report. They are not counted here.

## Recommendation

Layout, Latin-titled like `denis-opera-omnia`:

```
franciscus-opera-omnia/
  opuscula/<regula-bullata|regula-non-bullata|testamentum|admonitiones|epistolae|laudes-et-orationes|officium-passionis|canticum-fratris-solis|…>   la (Esser/Quaracchi), it for the two Umbrian pieces; en Robinson 1906
fontes-franciscani/
  thomas-de-celano-vita-prima/        la d'Alençon 1906 (×poliba) · en Howell 1908
  thomas-de-celano-vita-secunda/      la d'Alençon 1906 (×poliba) · en Howell 1908
  thomas-de-celano-tractatus-de-miraculis/   la only
  legenda-trium-sociorum/             la Marcellino 1899 (×poliba) · en Salter 1902
  anonymus-perusinus/                 la poliba only (unverified)
  compilatio-assisiensis/             la poliba only (unverified)
  speculum-perfectionis/              la Sabatier 1898 (OCR) · en Evans 1898 (×Steele)
  sacrum-commercium/                  la Quaracchi 1929 (×poliba) · en Carmichael 1901
  actus-beati-francisci/              la Sabatier 1902 (×poliba)
  fioretti/                           it wikisource Cesari 1860 · en CCEL Hudleston (×Okey)
  considerazioni-stimmate/            it poliba (×Cesari 1868 OCR) · en CCEL (×Okey)
  vita-frate-ginepro/                 it poliba (×Cesari 1868) · en CCEL
  vita-frate-egidio/ and detti-frate-egidio/   it poliba · en CCEL Parts III–IV
```

(The *Legenda maior* and *minor* sit under `bonaventura-opera-omnia/`; `fontes-franciscani/` can cross-reference them.)

Import order:
1. **Fioretti + Considerazioni + Juniper + Giles.** The most-read Franciscan book: clean Italian (wikisource and poliba) and a proofread PD English (CCEL) that covers every part.
2. **Francis's Opuscula.** Small (≈28k) and central to the plan of life (Rule, Testament, Admonitions, Office of the Passion, Praises). Esser's Latin with Quaracchi 1904 to check it, and Robinson's English.
3. **Celano 1C + 2C** (Howell) and **3Soc** (Salter).
4. **Speculum perfectionis** (needs Latin OCR clean-up) and **Sacrum commercium**.
5. The Latin-only sources: Actus, 3C, Anonymus Perusinus, Compilatio Assisiensis.

Cannot be sourced cleanly: a clean Latin *Speculum perfectionis* (scan/OCR only); PD English for 3C, AP, CA, Actus and the Legenda ad usum chori; a verified-status clean text for the Compilatio and the Anonymus (poliba only, no edition named).

## Total size

- Original-language texts: Francis's writings ≈28k; Celano ≈101k; 3Soc 15k; AP 8k; CA 38k; Speculum ≈40k; Sacrum commercium 9k; Actus 45k; Fioretti 45k; Considerazioni 16k; Juniper/Giles ≈21k. **≈366k words** (plus Bonaventure's two legends, ≈50k, counted in `bonaventure.md`).
- PD English available: ≈30k (Robinson) + ≈77k (Howell, 1C+2C) + ≈20k (Salter) + ≈45k (Evans) + ≈12k (Carmichael) + ≈80k (CCEL Little Flowers and appendices). **≈265k words**.

## Portuguese

Two Brazilian Franciscan bodies host one modern Brazilian translation of almost the whole early Franciscan corpus, free and with no licence statement. The **Província Franciscana da Imaculada Conceição (OFM)** has it at franciscanos.org.br/carisma/fontes-franciscanas, as 593 Word files. The **Conferência dos Capuchinhos do Brasil** has it at capuchinhos.org.br/biblioteca, as HTML. The two hosts carry the same text: the 3Soc and Compilatio passages I compared match word for word. Neither site names the translator. The introductions speak in the first person ("Neste nosso programa de Internet…", "A nossa [tradução] deve estar sendo a primeira"), so this is one in-house Franciscan translation, not a reprint of the Vozes *Fontes*. I could not identify the translator. It is a modern pt-BR text, clean, with verse numbers inline. The Writings follow the Esser canon. I did not check which Latin edition each legend was translated from. Under the brief these are **tier B**: the Order gives them away and no one claims them. Neither page has any copyright or permission line. The franciscanos.org.br Word files carry the document author "Provincia Franciscana I.C. do Brasil". Before those, the only PD Portuguese is old: a 15th-century Portuguese translation of the *Chronica XXIV Generalium*, edited in 1918, and Frei Marcos de Lisboa's *Chronicas* (1557–87). Neither translates any single work in the list.

Downloads are in `research/sourcing/francis-of-assisi/pt/`: `franciscanos-org-br/` (`doc/` = the 593 originals, `txt/` = textutil conversions), `capuchinhos/` (per-work text, `_counts.json`) and `cronica-nunes/` (the 1918 PDF and its text layer). The crawl scripts are in `research/sourcing/_pt-franciscan-scripts/`.

Search limits: the shared WebSearch budget ran out after four queries, and the Google Books API daily quota was already used up. Domínio Público (dominiopublico.gov.br) and BN Brasil (bndigital.bn.gov.br) sit behind Cloudflare challenges that block a script. None of these four were searched. Searched: archive.org (advancedsearch), pt.wikisource (API: nothing Franciscan), BNP Digital/purl.pt (catalogue search), and franciscanos.org.br and capuchinhos.org.br in full.

| Work | Translation (translator, year, publisher) | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| **Writings of Francis** | 1. Anon. modern pt-BR (OFM Província I.C.) | franciscanos.org.br/carisma/fontes-franciscanas → `wp-content/uploads/2011/10/*.doc` + `2021/06/admoestacoes.doc` | B | **All 25 groups of the Esser canon**: Admonitions 1–28, Canticle, Leo blessing, all letters, Rules 1221 (24 chapters) and 1223, Hermitages, Office of the Passion, Praises, Salutations, Testament, Ultima voluntas, the dictated pieces, *De vera laetitia*. 33.4k words with short introductions. Clean Word text, verse-numbered. *Audite poverelle* is absent. Best. |
| | 2. Same translation (CCB) | capuchinhos.org.br/livro/escritos-de-sao-francisco | B | Index only: every piece is listed but each page says "Nenhum sub-capítulo encontrado". Empty. |
| | 3. Frei Celso Márcio Teixeira (org./tr.), *Escritos de São Francisco*, Vozes/FFB 2009; *Fontes Franciscanas e Clarianas*, Vozes/FFB 2004 | sold (ISBN 9788532638359) | C | Reference only. The standard Brazilian scholarly text. |
| Canticle of Brother Sun | in 1 above (`o_cantigo_do_irmao_sol.doc`) | — | B | Complete. |
| *Audite poverelle* | none found (capuchinhos lists "Ouvi Pobrezinhas", but the page is empty) | — | — | — |
| **Celano, Vita prima** (1C) | Anon. pt-BR (OFM Província I.C.) | franciscanos.org.br … `capitulo_1.doc` … `MILAGRESDESaOFRANCISCO.doc` | B | Complete: 3 books, 30 + 10 chapters, and the miracles of Book III. 33.2k words. Clean. (The capuchinhos entry is empty.) |
| **Celano, Vita secunda** (2C) | same | franciscanos.org.br … `cap1.doc` … `cap166.doc`, `Doc2.doc` | B | Complete: prologue, 166 + 1 chapters and the companions' prayer. 48.8k words. Clean. |
| Celano, *Tractatus de miraculis* (3C) | none found free (capuchinhos "Tratado dos milagres" is empty); Vozes *FFC* 2004 | — | C | — |
| Celano, *Legenda ad usum chori* | none found free (capuchinhos entry empty) | — | — | — |
| **Legenda trium sociorum** | 1. Anon. pt-BR (OFM Província I.C.) | franciscanos.org.br … `introducaoit.doc`, `rubrica_cartait.doc`, `capit01–18.doc` | B | Complete: letter + 18 chapters. 19.3k words. Clean. Best. |
| | 2. Same, partial (CCB) | capuchinhos.org.br/capitulos/legenda-dos-tres-companheiros | B | Chapters 1–5 only, Latin and Portuguese interleaved, and one introduction page mislabelled (it holds the Office-of-the-Passion intro). |
| **Anonymus Perusinus** | 1. Anon. pt-BR (OFM Província I.C.) | franciscanos.org.br … `1introducao.doc`, `1prologo.doc`, `1cap01–12.doc` | B | Complete: 12 chapters. 11.1k words with introduction. |
| | 2. Same (CCB) | capuchinhos.org.br/capitulos/anonimo-perusino | B | Complete in 4 pages. 8.3k words. Clean HTML. |
| **Legenda Perusina / Compilatio Assisiensis** | 1. Anon. pt-BR, "Legenda Perusina" (OFM Província I.C.) | franciscanos.org.br … `2introducao.doc`, `2cap01…` | B | 115 numbered sections in *Legenda Perusina* order. 41.2k words. Clean. |
| | 2. Same translation, "Compilação de Assis" order (CCB) | capuchinhos.org.br/capitulos/compilacao-de-assis | B | Chapters 1–120 in Bigaroni's *Compilatio* numbering. 45.7k words. Clean HTML. Use this to match the poliba Latin (CA numbering). |
| **Speculum perfectionis** | 1. Anon. pt-BR (OFM Província I.C.) | franciscanos.org.br … `introducao1.doc`, `cap01…` | B | 124 chapters (edition not stated). 44.7k words with introduction. Clean. The capuchinhos entries "Espelho da Perfeição" and "…Menor" are empty. |
| *Sacrum commercium* | none found free (capuchinhos entry empty) | — | — | — |
| **Actus beati Francisci** | Anon. pt-BR (CCB) | capuchinhos.org.br/capitulos/actus-beati-francisci-et-sociorum-eius | B | Introduction and 68 chapters. 53.0k words. Clean HTML, verse-numbered. Numbering may differ from Sabatier's: the chapter-1 page opens mid-story ("Por isso, certa ocasião…"). Check it against Sabatier 1902. |
| **Fioretti** | 1. Anon. pt-BR (CCB), from Sabatier/Padovan with Bughetti's additions | capuchinhos.org.br/texto/i-fioreti-di-san-francesco-introducao → `/texto/i-fioret(t)i-di-san-francesco-capitulo-N` (the slug spelling varies; chapter 29 exists but is missing from the index) | B | **All 53 chapters** plus "Aggiunte". ≈39k words of text plus a 2k introduction. Clean modern pt-BR ("monsior São Francisco"). Best. |
| | 2. Durval de Morais, *I Fioretti de São Francisco*, Vozes (several editions; from Cesari's text) | not found online | A if the translator died 70+ years ago (I believe he died in 1948; unverified) | The classic Brazilian literary version, praised in the CCB introduction. Find a scan before relying on it. |
| | 3. Adelino Capistrano, *I Fioretti de São Francisco, seguidos do Cântico do Sol* (2nd ed.; date unverified) | not found online | unverified | Studied in D. de S. Balancin's USP dissertation (teses.usp.br, tde-25092008-163046). |
| | 4. M. L. Carbonati, *Fioretti de S. Francisco*, Livraria Morais 1960; Carbonati & M. I. Tamen, Paulinas 2018; V. Anagnostopoulos, *Crônicas de São Francisco: I Fioretti*, Minha Biblioteca Católica 2021 | sold | C | Reference only. |
| *Considerazioni sulle stimmate*, *Vita di frate Ginepro*, *Vita/Detti di frate Egidio* | none found free (the capuchinhos sub-pages "Considerações sobre os Estigmas", "Frei Egídio" and "Vida do Frei Junípero" are empty); in Durval de Morais and Vozes *FFC* | — | C (Vozes) | — |
| (Not in the work list) Julian of Speyer, *Vita s. Francisci* | Anon. pt-BR (CCB) | capuchinhos.org.br/capitulos/juliano-de-spira | B | Prologue and chapters 1, 3–13 (2 is missing). 16.9k words. |
| (Not in the work list) Jordan of Giano, *Chronica*; Clare sources (Rule, letters to Agnes, Legend, Process, *Legenda versificada*) | Anon. pt-BR (OFM Província I.C.) | franciscanos.org.br/carisma/fontes-franciscanas | B | Jordan 10.6k; Clarian sources 67.5k. |
| *Chronica XXIV Generalium* (draws on Celano, 3Soc, Bonaventure, Bernard of Bessa, the *Speculum*) | 15th-c. Portuguese translation, ed. José Joaquim Nunes, *Crónica da Ordem dos Frades Menores (1209–1285)*, vol. I, Coimbra: Imprensa da Universidade, 1918 | dl.uc.pt/bitstream/10316.2/3256/1/cronica_da_ordem_dos_frades_menores.pdf | A (medieval text; Nunes d. 1932) | Full scan with a text layer (508 pp., ≈138k words OCR). Medieval Portuguese ("húa", "aquella"), so of philological use, not a pt-BR model. It translates none of our works on its own. |
| Life of Francis and his companions (compiled from the legends) | Frei Marcos de Lisboa OFM, *Chronicas da Ordem dos Frades Menores*, parte I, Lisboa: Blávio 1557 (purl.pt/14929; purl.pt/16615, 2 vols.); 2nd ed. Manuel João 1566 (purl.pt/14772); A. Ribeiro 1587 (purl.pt/15302) | purl.pt | A (BNP: "PUBLIC DOMAIN … Public Domain Mark") | Folio scans, 16th-c. orthography, OCR not checked. A retelling and compilation, not a translation of one work. A witness for older Portuguese Franciscan vocabulary only. |

**pt-BR reference:** use the OFM Província I.C. Word files (franciscanos.org.br) for the Writings, 1C, 2C, 3Soc, AP, the *Legenda Perusina* and the *Speculum*. Use capuchinhos.org.br (the same translation) for the Fioretti, the Actus and the *Compilatio* in CA order. Together they cover every work in the list except 3C, the *Legenda ad usum chori*, the *Sacrum commercium*, the *Considerazioni* and the Juniper/Giles texts, for which no free Portuguese turned up. They are tier B: good to translate against and to compare. Importing them as-is would need the Province's or the CCB's say-so, since no licence is stated. Durval de Morais's Fioretti is the one tier-A candidate for a classic Brazilian text, but it needs a scan first and a check of the translator's death year.
