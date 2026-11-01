# Thomas à Kempis (Thomas Hemerken, c. 1380–1471): sourcing report

Bibliography basis: M. J. Pohl's critical *Opera omnia* (Freiburg: Herder, 1902–1922, 7 vols; the 8th volume, on his life, never appeared). The plan of the whole edition is printed in Pohl's preface to vol. II (1904), which I read in `kempis/pohl/operaomniaimitat0000thom.txt` and summarize below. Word counts are archive.org OCR tokens (`wc -w`), inflated by Pohl's Latin prolegomena and critical apparatus (~20–30 % of each volume).

**Already in the corpus:** `kempis-imitation-of-christ` has **en-US and pt-BR only**. The en-US text is Aloysius Croft & Harold Bolton (Bruce, Milwaukee 1940) via CCEL, 117 files, 57.8k words. The pt-BR text comes from `sources/portuguese-originals/imitacao-de-cristo-lcc.pdf`, translator not stated in the file (see Portuguese). **There is no Latin.** Adding `la/` to the Imitation is the first gap to fill.

## Pohl's plan (the corpus split should follow it)
- **Vol. I (1910):** *Liber de tribus tabernaculis*; *De vera compunctione*; *Sermones IX ad fratres*; *De fideli dispensatore*; *Soliloquium animae*.
- **Vol. II (1904):** *De imitatione Christi* libri IIII (from the 1441 Brussels autograph), with nine tractatuli: *De disciplina claustralium*, *Epistula devota ad quendam regularem*, *Libellus spiritualis exercitii*, *De recognitione propriae fragilitatis*, *Recommendatio humilitatis*, *De mortificata vita*, *De bona pacifica vita*, *De elevatione mentis*, *Brevis admonitio spiritualis exercitii*.
- **Vol. III (1904):** *Meditatio de incarnatione Christi*; *Sermones de vita et passione Domini*; *Alphabetum monachi*; *Van goeden woerden to horen ende die to spreken* (Middle Dutch, with Latin facing); *Orationes de passione Domini et beata virgine et aliis sanctis*.
- **Vol. IV (1918):** *Hortulus rosarum*; *Vallis liliorum*; *Consolatio pauperum*; *Epitaphium monachorum*; *Vita boni monachi*; *Manuale parvulorum*; *Doctrinale iuvenum*; *Hospitale pauperum*; *Cantica* (hymns); *De solitudine et silentio*; *Epistulae*.
- **Vol. V (1902):** *Orationes et meditationes de vita Christi*.
- **Vol. VI (1905):** *Sermones ad novicios*; *Vita Lidewigis virginis* (historical).
- **Vol. VII (1922):** *Dialogus noviciorum* in four parts (the dialogue proper; *Vita Gerardi Magni*; *Vita Florentii*; *Vitae discipulorum Florentii*); *Chronica Montis S. Agnetis*.

**Doubtful or spurious:** *Vera sapientia* (English by F. Byrne 1904) is printed in old editions but not by Pohl, so treat it as doubtful. The *Vita Lidewigis* is partly Johannes Brugman's: Thomas edited and abridged the life, and Scully's English mixes both. The Imitation's authorship by Thomas is the scholarly consensus. The rival "Gersen" theory (Wolfsgruber 1879/1889) has no value for us beyond its Latin text.

## Summary

| Work (Pohl vol.) | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| *De imitatione Christi* (II) | Pohl 1904, [`operaomniaimitat0000thom`](https://archive.org/details/operaomniaimitat0000thom), second scan [`thomaehemerkena03pohlgoog`](https://archive.org/details/thomaehemerkena03pohlgoog); [thelatinlibrary](https://www.thelatinlibrary.com/kempis.html); Gerlach 1909 | A | Croft & Bolton 1940 (in corpus, via [CCEL](https://ccel.org/ccel/kempis/imitation)); Benham ([Gutenberg 1653](https://www.gutenberg.org/ebooks/1653)); Challoner ([Gutenberg 60377](https://www.gutenberg.org/ebooks/60377)) | B (Croft) / A | ~42k (LatinLibrary 42.5k) / 58k | **en-US + pt-BR only** |
| Nine tractatuli (II) | Pohl vol. II (same scans) | A | none PD found | – | ~25k est. / – | no |
| *Soliloquium animae* (I) | Pohl I not online; Sommalius Antwerp 1615, [`bub_gb_nPb3WGcYj1wC`](https://archive.org/details/bub_gb_nPb3WGcYj1wC) (poor OCR) | A (scan) | T. Rogers 1592, [EEBO-TCP A13700](https://github.com/textcreationpartnership/A13700) (CC0); 1653 *Soliloquies* (EEBO scan) | A | ~40k est. / 44k | no |
| *De tribus tabernaculis*, *De vera compunctione*, *Sermones ad fratres*, *De fideli dispensatore* (I) | Sommalius only (1615 / 1728 / 1759 scans) | A (scan) | none PD found | – | ~45k est. / – | no |
| *Meditatio de incarnatione*, *Sermones de vita et passione*, *Alphabetum*, *Van goeden woerden*, *Orationes* (III) | Pohl 1904, [`operaomnia0002thom`](https://archive.org/details/operaomnia0002thom) | A | V. Scully, *A Meditation on the Incarnation… Sermons on the Life and Passion… Of Hearing and Speaking Good Words*, Kegan Paul 1907, [`meditationincarn00thomuoft`](https://archive.org/details/meditationincarn00thomuoft) | A | 83k / 83k | no |
| *Hortulus rosarum*, *Vallis liliorum* + 8 opuscula, *Cantica*, *Epistulae* (IV) | Pohl 1918, [`operaomnia0000thom_q8k7`](https://archive.org/details/operaomnia0000thom_q8k7) | A | *Little Garden of Roses and Valley of Lilies*: London: T. Jones 1840, [archive](https://archive.org/details/littlegardenofro00thom); Baltimore: Murphy 1867, [archive](https://archive.org/details/littlegardenrose00thom) | A | 133k / 41k–44k | no |
| *Orationes et meditationes de vita Christi* (V) | Pohl 1902, [`thomaehemerkena02pohlgoog`](https://archive.org/details/thomaehemerkena02pohlgoog); separate 1901 issue [`orationesetmedit0000unse`](https://archive.org/details/orationesetmedit0000unse) | A | W. Duthoit, *Prayers and Meditations on the Life of Christ*, Kegan Paul 1904/1908, [archive](https://archive.org/details/prayersandmedita00thomuoft) | A | 90k / 105k | no |
| *Sermones ad novicios*, *Vita Lidewigis* (VI) | Pohl 1905, [`thomaehemerkena00pohlgoog`](https://archive.org/details/thomaehemerkena00pohlgoog) | A | V. Scully, *Sermons to the Novices Regular* 1907, [archive](https://archive.org/details/sermonstonovices00thom); Scully, *St. Lydwine of Schiedam* 1912, [archive](https://archive.org/details/stlydwineofschied00thomuoft) | A | 96k / 81k + 39k | no |
| *Dialogus noviciorum* incl. lives of Groote, Radewijns & disciples (VII) | Pohl VII not online; Sommalius scans | A (scan) | J. P. Arthur, *The Founders of the New Devotion* 1905, [archive](https://archive.org/details/foundersofnewdev00thom) (the lives; the dialogue proper is not translated) | A | ~70k est. / 88k | no |
| *Chronica Montis S. Agnetis* (VII) | Pohl VII not online; Rosweyde 1621; Sommalius | A (scan) | J. P. Arthur, *Chronicle of the Canons Regular of Mount St. Agnes* 1906, [Gutenberg 16759](https://www.gutenberg.org/ebooks/16759) | A | ~35k est. / 58k | no |

## Sources ranked

### Latin of the Imitation
1. **Pohl vol. II (1904), edited from the 1441 autograph.** Two independent scans: Boston (`operaomniaimitat0000thom`) and Google (`thomaehemerkena03pohlgoog`). OCR is fair, with apparatus at the foot of the page to strip. This is the authoritative text, with Thomas's own *versiculi* punctuation.
2. **Gerlach, Herder 1909, 3rd ed.** (Imitation plus parallel "considerationes" from the other opuscula): [librinostri.catholica.cz PDF](https://librinostri.catholica.cz/download/KempLat1909Liberi-r.pdf). A clean text layer (91.6k words including the considerationes). Tier A by date; the site is a free Czech Catholic library.
3. **thelatinlibrary.com** (`kempis/kempis1–4.shtml`), 42.5k words. Clean HTML, but the edition is not stated, and it has long-s OCR slips (`fervit` for `servit`, `confiderat`). la.wikisource *De imitatione Christi* (41.5k) is a copy of it. Convenient for a first draft, never as the authority.
4. Hirsche, Berlin 1874 ([`deimitationechri00kemp`](https://archive.org/details/deimitationechri00kemp)); Wolfsgruber 1889 ([`deimitationechri00thom`](https://archive.org/details/deimitationechri00thom)); Ruelens 1885 facsimile of the autograph ([`imitationofchris00ruel`](https://archive.org/details/imitationofchris00ruel)). For cross-checking.

### Latin of the other works
1. **Pohl vols. II–VI** on archive.org (above). There are two scans of vol. V and of the 1901 *Orationes* issue. Vol. III exists as a single scan (Boston), and vol. IV as a single 1918 scan.
2. **Pohl vols. I (1910) and VII (1922): not found online.** archive.org has none, HathiTrust could not be checked (blocked), and Google is unverified. The fallback is Sommalius, *Opera omnia* (Antwerp 1607/1615, [`bub_gb_nPb3WGcYj1wC`](https://archive.org/details/bub_gb_nPb3WGcYj1wC); Cologne 1728, [`bub_gb__IzBduOc6pUC`](https://archive.org/details/bub_gb__IzBduOc6pUC); Cologne 1759, [`venvirithomaemal00thom`](https://archive.org/details/venvirithomaemal00thom)). Its OCR is **poor** (e/c confusion, long s, ligatures) and needs re-OCR or manual keying.

### English (besides the table)
- Imitation: Croft & Bolton is in the corpus, from CCEL. CCEL lists it as public domain, but a 1940 Bruce copyright renewal was not checked, so it stays **B/unverified**. PD alternatives: Benham (Gutenberg 1653/26222), Challoner's *Following of Christ* (Gutenberg 60377), Whitford c. 1530 and Page 1639 (EEBO-TCP A68812, A13699, CC0).
- Kegan Paul's 1904–08 "Works of Thomas à Kempis" series (Google scans [`worksthomaskemp00`–`03pohlgoog`](https://archive.org/details/worksthomaskemp01pohlgoog)) is the same set as the Duthoit, Arthur and Scully volumes and gives second scans for cross-checking.
- **No PD English found** for *De tribus tabernaculis*, *De vera compunctione*, *Sermones ad fratres*, *De fideli dispensatore*, the nine tractatuli, the minor opuscula of vol. IV other than Hortulus and Vallis, the *Cantica*, the letters or the *Dialogus* proper. William Griffin's *Consolations for my Soul* (2004, *Soliloquium*) is C.

## Portuguese
Searched: archive.org (language: por), pt.wikisource and web search.
1. *Imitação de Christo*, Paris: Belin-Leprieur et Morizot 1848 ([`imitaodechri00thom`](https://archive.org/details/imitaodechri00thom), second scan [`imitacaodechris00morigoog`](https://archive.org/details/imitacaodechris00morigoog)). Translator anonymous; tier A; OCR fair. The best PD Portuguese found.
2. *Imitaçam de Christo, que vulgarmente se intitula Contemptus mundi*, 1674 ([`bub_gb_Xaum2JA8eNIC`](https://archive.org/details/bub_gb_Xaum2JA8eNIC)). Old Portuguese; tier A; OCR poor.
3. Recorded but no digital copy located: João Álvares' 16th-century version (studied by I. V. Cepeda 1962), and Diogo Vaz Carrilho's.
4. Afonso Celso's translation (he died in 1938, so it is PD in Brazil): no digital copy located. Worth hunting in BN Digital.
5. The corpus pt-BR (`imitacao-de-cristo-lcc.pdf`) opens "Quem me segue não anda nas trevas… Seja, pois, o nosso principal empenho meditar…". **Its source and translator are unidentified; verify the tier before relying on it.** Modern Paulus (Rouanet Bastos 2023), Vozes, Loyola and Borgmeier editions are C. Archive.org uploads (`imitacao-de-cristo-tomas-de-kempis_202505`, Ed. Ecclesiae; `tomas-de-kempis-imitacao-de-cristo`) have unclear rights: unverified.
6. No Portuguese found for any other work by Kempis.

## Recommendation
- Layout: `kempis-opera-omnia/<work>` following Pohl, e.g. `imitatio-christi` (or add `la/` to the existing `kempis-imitation-of-christ`), `soliloquium-animae`, `hortulus-rosarum`, `vallis-liliorum`, `orationes-de-vita-christi`, `sermones-ad-novicios`, `meditatio-de-incarnatione`, `sermones-de-vita-et-passione`, `vita-lidewigis`, `dialogus-noviciorum`, `chronica-montis-sanctae-agnetis`, `tractatuli/<name>`, `cantica`, `epistulae`.
- **Import first:** (1) the **Latin of the Imitation** (Pohl II checked against Gerlach and LatinLibrary) into the existing book; (2) the vol. II–VI works that already have a PD English partner: *Orationes de vita Christi* (Duthoit), *Sermones ad novicios* (Scully), vol. III (Scully), *Hortulus/Vallis* (1867), *Chronica* and *Vitae* (Arthur); (3) *Soliloquium animae* with Rogers 1592.
- **Cannot be sourced cleanly:** Pohl vols. I and VII are not online, so their works depend on poor Sommalius OCR or an untested HathiTrust or Google copy. The en-US Imitation's tier (Croft & Bolton) and the pt-BR source both need confirming.
- **Total size:** Pohl II–VI is ≈500k OCR tokens (≈380k words of Thomas once apparatus is removed). Vols. I and VII add ≈150k words (estimate). **Complete Latin works ≈ 530k words.** PD English ≈ 590k words.
