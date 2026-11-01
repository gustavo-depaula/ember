# Fr. Frederick William Faber (1814–1863): sourcing report

Faber wrote in English, so the original is the English text. He died in 1863, so every edition he published, and the posthumous ones, is **tier A**. He was received into the Church in November 1845, and the table marks each work **ANG**/**CATH** by when it was written.

**Bibliography used:**
- Faber's article in the *Dictionary of National Biography* (on Wikisource)
- J. E. Bowden, *The Life and Letters of F. W. Faber* (1869), list of works
- the archive.org author index

**No clean transcription exists for any Faber work.** He is not on Project Gutenberg, CCEL, Newman Reader or Wikisource, except single hymns. The only digital texts are **archive.org scan OCR**. That OCR is good: most University of Toronto (`…uoft`) and Princeton (`…00fabe`) scans score 0.965–0.985 on the dictionary test. Every major work also exists in 2–5 independent scans of different editions, which gives the cross-checking the brief asks for. TAN Books and others sell modern reprints (**C**); they are irrelevant here because the 19th-century editions are public domain.

How I measured: `_scripts/ia_count.py` counted the `_djvu.txt` full text, which includes the front matter, Faber's own analytic table of contents and the index (≈3–8% over the body text). "q" is the share of lowercase tokens found in an English dictionary. The files are in `faber/ia/`, and the search listing is in `faber/ia-search.txt`.

## Summary table

| Work | Original source (URL, edition), best first | Tier | English source | Tier | Words (scan) | In corpus? |
|---|---|---|---|---|---|---|
| **All for Jesus, or the Easy Ways of Divine Love** (CATH, 1853) | 1. archive.org/details/allforjesusoreas00fabeuoft (1853, q 0.979, 141,088); 2. `allforjesusoreasdlo00fabe` (1855, q 0.976, 137,597); 3. `a579609100fabeuoft` (1866, q 0.973, 147,189); 4. `allforjesus00fabeuoft` (1854), `allforjesusoreas00faberich` (1854) | A | original | – | ≈138k | no |
| **Growth in Holiness, or the Progress of the Spiritual Life** (CATH, 1854) | 1. archive.org/details/growthinholiness00faberich (1855, q 0.974, 151,917); 2. `growthinholiness00fabe` (1864, q 0.969, 151,722); 3. `a580640100Fabeuoft` (1856, q 0.963); 4. `GrowthInHoliness1855` | A | original | – | ≈150k | no |
| **The Blessed Sacrament, or the Works and Ways of God** (CATH, 1855) | 1. archive.org/details/theblessedsacram00fabeuoft (1855, q 0.970, 186,516); 2. `a579622000fabeuoft` (1855, q 0.965, 184,787); 3. `blessedsacramen01fabegoog` (1861) | A | original | – | ≈183k | no |
| **The Creator and the Creature, or the Wonders of Divine Love** (CATH, 1857) | 1. archive.org/details/creatorcreature00fabeuoft (1857, q 0.975, 145,098); 2. `a579620500fabeuoft` (1857, q 0.975, 150,048); 3. `creatorcreatureo00faber` (1858), `creatorcreatureo02fabe` (1900) | A | original | – | ≈146k | no |
| **The Foot of the Cross, or the Sorrows of Mary** (CATH, 1858) | 1. archive.org/details/a580635100fabeuoft (1858, q 0.976, 163,797); 2. `footofcrossorsor00fabeuoft` (1864, q 0.966, 162,569); 3. `FootOfTheCrossOrTheSorrowsOfMary` (1858), `bub_gb_BfwCAAAAQAAJ` (1858, Google) | A | original | – | ≈160k | no |
| **Spiritual Conferences** (CATH, 1859) | 1. archive.org/details/a580835700fabeuoft (1859, q 0.975, 139,947); 2. `spiritualconfer00fabe` (1858/9, q 0.972, 144,550); 3. `spiritualconfere00fabeuoft` (1892) | A | original | – | ≈140k | no |
| **The Precious Blood, or the Price of our Salvation** (CATH, 1860) | 1. archive.org/details/a5807812fabe00uoft (1860, q 0.972, 111,312); 2. `preciousbloodorp00fabe` (1894, q 0.965, 117,658); 3. `preciousblood00fabe` (1860), `ThePreciousBlood` (1860), `preciousbloodorp00fabeuoft` (1890) | A | original | – | ≈110k | no |
| **Bethlehem** (CATH, 1860) | 1. archive.org/details/bethlehem00fabeuoft (1900 reprint, q 0.976, 178,560); 2. `Bethlehem1860` (1860), `bethlehem00fabegoog`; ⚠ `bethlehem-by-father-faber` is only 21,992 w (a fragment or abridgment; don't use) | A | original | – | ≈175k | no |
| **Notes on Doctrinal and Spiritual Subjects** I–II (CATH, posth. 1866) | 1. `a580662901fabeuoft` + `a580662902fabeuoft` (1866, q 0.975/0.972, 88,888 + 93,095); 2. `notesondoctrinal01fabeuoft` + `notesondoctrinal02fabeuoft` (q 0.978/0.976, 93,987 + 93,464); 3. `a580665901fabeuoft`/`02`, `notesondoctrinal01fabeiala`/`02` | A | original | – | ≈182k | no |
| **Hymns** (CATH, complete ed. 1862; earlier *Jesus and Mary* 1849, *Oratory Hymns* 1854) | 1. archive.org/details/hymns00faberich (1880, q 0.979, 73,217: the complete 150 hymns); 2. `a5806473fabe00uoft` (*Faber's Hymns*, 1894, q 0.985, 40,484, a selection); 3. `jescatho00fabe` (*Jesus and Mary*, 1849, 17,341), `orats00fabe` (*Oratory Hymns*, 26,839); 4. single hymns on en.wikisource.org (Author:Frederick_William_Faber, 14 hymns) and hymnary.org | A | original | – | ≈70k | no |
| **Poems** (collected, 1857; mostly ANG verse) | 1. archive.org/details/poemsfab00fabeuoft (1889, q 0.984, 114,735); 2. `poem00fabe`, `poems00fabe` (1857; no full text on the first) | A | original | – | ≈112k | no |
| **Ethel's Book, or Tales of the Angels** (CATH, 1858, for children) | archive.org/details/a579644000fabeuoft (q 0.989, 19,906) | A | original | – | ≈19k | no |
| **Kindness** (CATH; four conferences reprinted from *Spiritual Conferences*, 1901) | archive.org/details/kindness00fabe (q 0.975, 21,609); `kindness-by-father-frederick-william-faber` (20,850) | A | original | – | (inside *Spiritual Conferences*) | no |
| **Essay on the Interest and Characteristics of the Lives of the Saints** (CATH, 1853; the preface to the Oratorian Lives) | archive.org/details/a579642500fabeuoft (q 0.975, 37,476) | A | original | – | ≈36k | no |
| **The Spirit and Genius of St. Philip Neri** (CATH, 1850 lectures) | archive.org/details/TheSpiritAndGeniusOfStPhilipNeri (q 0.972, 98,657: bound with other matter, so the lectures are ≈25k est.) | A | original | – | est. 25k | no |
| **Essay on Beatification, Canonization and the Congregation of Rites** (CATH, 1848) | archive.org/details/anessayonbeatif00fabegoog (Google, q 0.95, 39,985); `EssayOnBeatificationCanonization` | A | original | – | ≈38k | no |
| Sights and Thoughts in Foreign Churches (ANG, 1842) | archive.org/details/sigthsthoughtsin00fabeuoft (q 0.977, 175,170) | A | original | – | ≈170k | no |
| Tracts on the Church and her Offices (ANG, 1840) | archive.org/details/tractsonchurchhe00fabe (q 0.975, 81,136) | A | original | – | ≈80k | no |
| The Cherwell Water-Lily and other poems (ANG, 1840) | archive.org/details/cherwellwaterlil00fabeuoft (q 0.978, 44,723) | A | original | – | ≈44k | no |
| Sir Lancelot (ANG verse romance, 1844) | archive.org/details/sirlancelotlegen00faberich (q 0.980, 83,313); `cu31924013457068` (1857) | A | original | – | ≈82k | no |
| The Styrian Lake (1842), The Rosary and other poems (1845) (ANG verse; most of it reprinted in *Poems* 1857) | not located separately; covered by *Poems* | A | – | – | (in *Poems*) | no |
| Life of St. Wilfrid (ANG, 1844, in Newman's *Lives of the English Saints*) | `livessaints…` / `livesofenglishsai00gilbuoft` (series volume; Faber's share not isolated) | A | original | – | est. 60k | no |
| **Letters**, in J. E. Bowden, *Life and Letters of F. W. Faber* (1869) | archive.org/details/a548608200bowduoft, `a548612100bowduoft`, `thelifeandletter00bowduoft`, `lifeandlettersf00fabegoog` | A | original | – | not counted (est. 200k, about half of it letters) | no |
| Translation: Montfort, *Treatise on the True Devotion to the Blessed Virgin* (tr. Faber, 1863) | archive.org/details/ATreatiseOnTheTrueDevotion (1863, Google, q 0.961, 52,222); `cihm_75551` (1901) | A | – | – | ≈50k | **work present**: `montfort-true-devotion` has fr-FR + an en-US translation (not Faber's); Faber's version would only be an alternative English text |
| Edited: Oratorian *Lives of the Modern Saints* (1847–56: St Rose of Lima, Segneri/Pinamonti, Liguori, etc., translated by the Oratorians under Faber) | `LifeOfSaintRoseOfLima` (59,148), `TheLivesOfFather` (152,461), `LifeOfSAlphonsoMariaDeLiguoriV1…5` | A | – | – | – | no (not Faber's own writing) |
| Anthologies (*Spirit of Father Faber* 1914, *Thoughts on Great Mysteries* 1884, *Selections* 1904, *On Thanksgiving* 1911) | IA | A | – | – | – | skip (extracts) |

## Notes

- **Structure.** The eight great treatises (*All for Jesus* through *Bethlehem*) divide into chapters with numbered sections. Faber prints a long analytic table of contents in front, and a few volumes have an index. Chapter split means one corpus chapter per Faber chapter; the subsections can stay as headings. The front tables should be dropped, because they summarise the chapter text. *Spiritual Conferences* is a set of separate conferences ("Kindness", "Death", "Heaven and Hell", "Self-deceit", …), which are natural chapters. *Notes on Doctrinal and Spiritual Subjects* is fragmentary notes, numbered in many short pieces.
- **OCR.** Long-s is no issue (1850s type). Running heads and page numbers interleave the djvu text, so strip them. Greek is rare; Latin quotations are frequent but short. The 0.97 dictionary score means roughly one damaged word in 30–40 *after* proper names and Latin are allowed for. Plan a two-witness diff (e.g. `…uoft` against `…00fabe`) to locate OCR errors, then the PDF/vision audit for disputed places.
- **The hymns.** *Hymns* (1862) is Faber's definitive collection of 150 hymns. Many are still sung ("Faith of our Fathers", "There's a wideness in God's mercy", "My God, how wonderful Thou art"). It fits a prayer app well: one hymn is one short practice or chapter.
- **Not Faber.** Two items in his archive.org search results are not his own writing, and both are omitted. *The Spiritual Doctrine of Father Louis Lallemant* (1855, `a589552400lalluoft`) is Lallemant's work, published in Faber's Oratorian series and listed under Faber only as editor. I did not check whether Faber also wrote its preface. *The Private Devotions of Dr. William Laud* is a misattribution.

## Recommendation

- **Layout:** `faber-opera-omnia/<work>` with `en-US` canonical: `all-for-jesus`, `growth-in-holiness`, `blessed-sacrament`, `creator-and-creature`, `foot-of-the-cross`, `spiritual-conferences`, `precious-blood`, `bethlehem`, `notes-doctrinal-spiritual`, `hymns`, `poems`, `ethels-book`, `lives-of-saints-essay`, `spirit-of-st-philip`, `beatification-canonization`, then the Anglican works.
- **Import first:** *All for Jesus*, *Growth in Holiness* (the spiritual-life classic), *The Foot of the Cross*, *The Precious Blood*, *The Blessed Sacrament*, and the *Hymns*.
- **Every Faber text comes from scan OCR.** It is good, but each work needs the OCR clean-up pass (header stripping, two-witness diff). No clean e-text exists to save that step.
- **Cannot be sourced cleanly:** nothing is blocked by copyright. *The Styrian Lake* and *The Rosary* (1842/45) were not located as separate scans, but their contents are in *Poems*. Faber's letters exist only inside Bowden's biography.

**Total size:** the Catholic works ≈1.57M words (8 treatises ≈1.20M + *Notes* ≈0.18M + *Hymns*, *Ethel*, essays ≈0.19M). The Anglican prose and verse add ≈0.55M (including *Poems*), and the letters ≈0.1M (estimate). Overall ≈2.2M words. These are scan counts, so the body text is ≈5% less.

## Portuguese

**Searched:** the Biblioteca Nacional de Portugal catalogue (catalogo.bnportugal.gov.pt; author "Faber Frederick" gives 18 records, plus keyword searches for the Portuguese titles); archive.org (`language:por` and Portuguese titles: nothing by Faber); pt.wikisource (nothing); Open Library (nothing); the Cultor de Livros catalogue; Estante Virtual (estantevirtual.com.br, the Brazilian new and used book marketplace, author and title searches); Permanência's site search. **Could not search:** Domínio Público, BN Digital / BN Brasil catalogue, HathiTrust (Cloudflare 403) and Google Books (API 429). The session's web-search budget also ran out. So the **19th-century Brazilian editions (Garnier, Laemmert, Vozes) are under-documented here**: they show up only as used-book listings. Rows marked "listing" were seen only in a catalogue or bookseller record.

| Work | Portuguese translation (translator, year, publisher) | URL | Tier (evidence) | Completeness / quality |
|---|---|---|---|---|
| **All for Jesus** | 1. *Tudo por Jesus ou caminhos faceis do amor divino*, tr. F. Preto Pacheco; Porto: José Fructuoso da Fonseca, **1893**, 431 pp (BNP shelfmark R. 28920 P.) | BNP record (catalogo.bnportugal.gov.pt, title search "tudo por jesus caminhos") | **A** (published 1893) | Complete book. **Print only**: BNP holds it but hasn't digitised it (no BND link), and no scan found elsewhere. The 1945 4th edition credits "trad. M. de Bernhardt, F. Preto Pacheco", so the Portuguese was probably made from Bernhardt's French *Tout pour Jésus* (inference from the credit) |
| | 2. Same translation, 4th ed., Porto: [s.n.] (Tip. Fonseca), 1945, 438 pp | BNP record | text A if unchanged from 1893 (unverified); this edition is 1945 | print only |
| | 3. *Tudo por Jesus ou caminhos faceis do amor divino*, "Padre Frederico William Faber", H. Garnier (Rio de Janeiro/Paris), 432 pp, hardback, no year shown | listing only (Estante Virtual, publisher facet "H. Garnier") | **unverified**, probably A: Garnier's Rio house printed until the 1930s, but the year wasn't seen | print. Translator not seen. May be the same Bernhardt-based text |
| | 4. *Tudo por Jesus, ou caminhos fáceis do amor divino*, Edições Livre, 2026, ISBN 9786583952509 | estantevirtual.com.br/livro/tudo-por-jesus-ou-caminhos-faceis-do-amor-divino-O11-1749-000-BK | C | print (possibly a reprint of an old translation; not stated) |
| | 5. *Tudo por Jesus*, Editora São João Bosco, 2025, ISBN 9786598394776 | estantevirtual.com.br/livro/tudo-por-jesus-LNI-1906-000-BK | C | print |
| **Growth in Holiness** | 1. *O progresso na vida espiritual*, Vozes (Petrópolis), **1924**, 510 pp | listing only (Estante Virtual offer "Código 2868652: Ano 1924, Editora Vozes") | **A** by date (1924). Translator not seen | Complete-sounding (510 pp). Print only, no scan found |
| | 2. *Progresso na vida espiritual*, 1947, 462 pp (publisher not shown; Vozes appears twice in the facet) | listing only | unverified (probably a reprint of 1) | print |
| | 3. A new hardback, 480 pp, listed as "Tradução de Carolina Nabuco" (2024; publisher not shown in the offer) | listing only (Estante Virtual) | **C**: Carolina Nabuco died 1981 | print. Whether the 1924 Vozes text is also hers is unverified. If it is, the 1924 printing still counts as A by publication date, but any later revision of hers does not |
| | 4. *Progresso na vida espiritual*, Cultor de Livros (Clássicos de Espiritualidade), 2020, 446 pp, ISBN 9786586580396 | cultordelivros.com.br/produtos/progresso-na-vida-espiritual/ | C | print |
| | 5. *Progresso na vida espiritual*, Edições Livre, 2019, ISBN 9788569712213; plus a 2019 "fac-símile conforme a 1ª edição" (publisher not shown) | listing (Estante Virtual) | C as editions. The facsimile reproduces an older translation whose date wasn't seen | print |
| **The Creator and the Creature** | *O criador e a criatura*, Flos Carmeli Edições, 2023, ISBN 9786588751237 | listing (Estante Virtual) | C | print |
| **The Blessed Sacrament** | *O Santíssimo Sacramento*, Cultor de Livros (Clássicos de Espiritualidade), 2020, 494 pp, ISBN 9786586580501 | cultordelivros.com.br/produtos/santissimo-sacramento-o/ | C | print |
| **The Precious Blood** | 1. *Sangue precioso: preço da nossa salvação*, tr. Pedro Augusto Machado (per a bookseller's description), Cultor de Livros (Clássicos de Espiritualidade vol. 26), 2021, 304 pp, ISBN 9788556382320 | cultordelivros.com.br/produtos/sangue-precioso-preco-da-nossa-salvacao/ | C | print |
| | 2. *Preciosíssimo Sangue: o preço da nossa salvação*, hardback, 415 pp, sold with a reading guide *Tomai e comei* (publisher not shown; "Imaculada" in the facet) | listing only | C | print |
| | 3. Short excerpts on permanencia.org.br (2020 Sunday "Capela" pages), translated from the French *Le Précieux Sang* | permanencia.org.br (site search "faber") | unverified | clean HTML, excerpts only |
| **The Foot of the Cross** | none found in Portuguese (BNP holds only the French *Le pied de la croix*, 1858 and 1893) | – | – | – |
| **Bethlehem** | none found | – | – | – |
| **Spiritual Conferences** | Partial: *A bondade* (the *Kindness* conferences), Edições Livre, 2026, ISBN 9786583952783; Distribuidora Loyola, 2024, ISBN 9786587994642 | listing (Estante Virtual) | C | print, the four *Kindness* conferences only (per blurb) |
| Sermon *Devotion to the Pope* (1860) | *Da devoção ao papa*, Cultor de Livros, 54 pp, ISBN 9788556380142; Caritatem, 2022, ISBN 9788553152537 | cultordelivros.com.br/produtos/da-devocao-ao-papa/ | C | print |
| *Purgatory* (an extract; source chapter not verified) | *O purgatório*, Ecclesiae, 2013; 2nd ed. 2026, ISBN 9788584916016 | listing (Estante Virtual) | C | print |
| Notes, Hymns, Poems, *Ethel's Book*, *Spirit and Genius of St Philip*, essays, Anglican works, letters | none found | – | – | – |

**Notes.**
- Faber was widely read in Portuguese, mostly at second hand: BNP's Faber holdings are mainly the French Bernhardt translations (Bray, Paris 1854–93), and the one 19th-century Portuguese edition it holds (*Tudo por Jesus*, Porto 1893) is credited to Bernhardt as well. When an old Portuguese Faber text is found, check whether it was made from the French.
- **Two tier-A Portuguese texts exist in print**: *Tudo por Jesus* (Pacheco, Porto 1893) and *O progresso na vida espiritual* (Vozes, Petrópolis 1924; translator unknown). **No digitisation of either was found.** They could become importable only by getting a scan (BNP reproduction service for the 1893 book; a used copy of the Vozes 1924, which was on sale). The 1924 Vozes is Brazilian Portuguese, which makes it the more useful of the two.
- Today's Brazilian Faber is Cultor de Livros (four titles), Edições Livre, Ecclesiae, Flos Carmeli, São João Bosco and Caritatem: all tier C.

**Recommendation:** translate from the English (the scans listed above). Use the Cultor de Livros editions (*Progresso*, *Santíssimo Sacramento*, *Sangue precioso*) and Flos Carmeli's *O criador e a criatura* as current pt-BR terminology references. Nothing is importable today. Getting the Vozes 1924 *Progresso* or the Porto 1893 *Tudo por Jesus* scanned is the only route to a tier-A Portuguese Faber text.
