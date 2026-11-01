# Bishop Richard Challoner (1691–1781): sourcing report

Challoner wrote in English, so the original is the English text. He died in 1781, so all his editions are **tier A**. That includes the 19th-century and 1924 revisions, with one caveat: some of those revisions are no longer purely Challoner's text, as noted per work.

**Bibliography used:**
- E. H. Burton, *The Life and Times of Bishop Challoner* (1909), appendix list of works
- the DNB article (Wikisource)
- the archive.org author index (`challoner/ia-search.txt`, 150 items)

**Where the texts are:** no Challoner work is on Gutenberg or CCEL, apart from his Douay-Rheims revision and his translation of the *Imitation*. Wikisource has only *Think Well On't* and *The Lord's Prayer and the Angelic Salutation*. Everything else comes from archive.org scans of two kinds:

- **19th-century reprints** (University of Toronto and other `…uoft`/`…chal` scans). The OCR is clean: dictionary score 0.96–0.98.
- **ECCO first editions** (`bim_eighteenth-century_…` items, Eighteenth Century Collections Online, released on archive.org). Here the OCR is fair: 0.91–0.94, with long-s errors like *fuch* for *such*. This is the only source for the controversial pamphlets. I did not check whether ECCO-TCP has hand-keyed any of these titles; that is worth a lookup at import time.

How I measured: `_scripts/ia_count.py` counted the full text, including front and back matter. "q" is the share of lowercase tokens found in an English dictionary. The files are in `challoner/ia/`.

## Summary table

| Work | Original source (URL, edition), best first | Tier | English source | Tier | Words | In corpus? |
|---|---|---|---|---|---|---|
| **Douay-Rheims Bible, Challoner revision** (1749–52) | newadvent.org/bible | A | – | – | ≈900k | **yes**: `douay-rheims-challoner` |
| **Meditations for Every Day in the Year** (= *Considerations upon Christian Truths and Christian Duties, digested into Meditations for every day*, 1753, 2 vols) | 1. archive.org/details/ConsiderationsUponChristianTruths (1874, q 0.971, 307,248, both vols); 2. `Meditations1859` (1859, q 0.970, 306,129); 3. `MN5108ucmf_1` (1800, vol 1, q 0.978, 145,457), `considerationsup00chaluoft` (q 0.975, 157,756, one vol), `ConsiderationsUponChristianV1`/`V2` (1815); 4. ECCO 1st ed. `bim_eighteenth-century_considerations-upon-chri_challoner-richard_1753` (q 0.92, 164,967, vol), 1754/1759/1784 eds. | A | original | – | ≈300k | no |
| **The Garden of the Soul** (1740) | 1. ECCO 18th-c. eds.: `bim_eighteenth-century_the-garden-of-the-soul_challoner-richard-bish_1759`, `…_1755`, `…_1775`/`1779`/`1793` (closest to Challoner; long-s OCR); 2. `a556282700chaluoft` (1775 ed.; scan only, no OCR text); 3. archive.org/details/TheGardenOfTheSoul (q 0.970, 90,569; later edition, date given as 1945, unverified); 4. `GardenOfTheSoul1871` (q 0.951, 226,479); `gardensoulorama01chalgoog` (1872) | A (1871/1872 eds. **heavily expanded** by later editors) | original | – | ≈60–90k (Challoner's core; the 19th-c. versions swell to 226k) | no |
| **Think Well On't, or Reflections on the Great Truths of the Christian Religion for every day of the month** (1728) | 1. en.wikisource.org/wiki/Think_Well_On't (34 subpages, 40,661 w, transcribed; edition not recorded on the index); 2. archive.org/details/thinkwellontorre00chaluoft (1801, q 0.961, 35,789); 3. `thinkwellontorre00chalrich` (1841), `cihm_91756` (1854); 4. ECCO `…think-well-ont-or-ref_challoner-richard_1736`/`1749`/`1751` | A | original | – | ≈35k | no |
| **The Catholic Christian Instructed in the Sacraments, Sacrifice, Ceremonies and Observances of the Church** (1737) | 1. archive.org/details/catholicchristia02chal (1853, q 0.970, 92,443); 2. `catholicchristia00chal` (1800, q 0.967), `CatholicChristianInstructed` (1878, q 0.965, 98,605); 3. ECCO `…the-catholick-christian-_challoner-richard_1737` (1st ed.) | A | original | – | ≈90k | no |
| **Memoirs of Missionary Priests … 1577–1684** (1741–42, 2 vols) | 1. archive.org/details/memoirsofmission00chal (1924 ed., rev. J. H. Pollen SJ, q 0.974, 306,003); 2. `memoirsofmission01chaliala` (1803, q 0.968, 307,971), `MemoirsOfMissionaryPriests` (q 0.972, 299,657); 3. `memoirsmissiona01chalgoog` (1839, q 0.957); 4. ECCO 1741 `…memoirs-of-missionary-pr_challoner-richard_1741_1`/`_2` | A (1924 Pollen ed.: published 1924 = A) | original | – | ≈300k | no |
| **Britannia Sancta: the Lives of the most celebrated British, English, Scottish and Irish Saints** (1745, 2 vols, a calendar of saints, by day) | ECCO only: `bim_eighteenth-century_britannia-sancta-or-th_challoner-richard_1745_1_0` (q 0.928, 192,204) + `…_1745_2_0` (q 0.927, 155,603); duplicates `…_1745_1`, `…_1745_2`, `…britannia-sancta-_challoner-richard-bis_1745_1`/`_2` | A | original | – | ≈340k | no |
| **A Memorial of Ancient British Piety, or a British Martyrology** (1761) | 1. archive.org/details/bub_gb_U3BbAAAAQAAJ (Google, 1761, q 0.804, 63,768); 2. ECCO `…a-memorial-of-ancient-br_challoner-richard_1761` | A | original | – | ≈60k | no |
| **The Wonders of God in the Wilderness** (1755) = *Lives of the Fathers of the Eastern Deserts* | 1. archive.org/details/thelivesofthefat00chaluoft (1852, q 0.972, 161,624); 2. `livesoffathersof00chal` (1885; text download failed with HTTP 500); 3. `wondersgodinwil00chalgoog` (1755, q 0.846, 130,604), `TheWondersOfGodInTheWilderness` | A | original | – | ≈150k | no |
| **The Grounds of Catholic Doctrine** (1732, a catechism on the Creed of Pius IV) | 1. archive.org/details/GroundsOfCatholicDoctrine1868 (q 0.968, 20,019); 2. `a626005800chaluoft` (1775, q 0.90, 19,612); 3. ECCO 1736/1747/1752/1753/1790 | A | original | – | ≈19k | no |
| The Grounds of the Old Religion (1742) | ECCO `…the-grounds-of-the-old-r_challoner-richard_1742` (q 0.921, 75,459); 1746/1751/1798 eds. | A | original | – | ≈73k | no |
| The Unerring Authority of the Catholick Church (1732) | ECCO `…the-unerring-authority-o_challoner-richard_1732` (q 0.916, 79,246); 1735 ed. | A | original | – | ≈77k | no |
| A Short History of the First Beginning and Progress of the Protestant Religion (1733) | 1. archive.org/details/ashorthistoryfi00chalgoog (1742, q 0.885, 25,729); 2. ECCO 1735/1736/1742/1753/1795 | A | original | – | ≈25k | no |
| A Specimen of the Spirit of the Dissenting Teachers (1736) | ECCO `…a-specimen-of-the-spirit_challoner-richard_1736` (q 0.927, 78,744) | A | original | – | ≈77k | no |
| The Young Gentleman Instructed in the Grounds of the Christian Religion (1735) | ECCO `…the-young-gentleman-inst_challoner-richard_1755` (q 0.926, 29,773); 1735 ed. | A | original | – | ≈29k | no |
| Instructions and Meditations for the Time of the Jubilee (1751; 1770) | ECCO `…instructions-for-the-tim_challoner-richard_1770` (q 0.922, 30,840); 1751, 1760 | A | original | – | ≈30k | no |
| A Short Explanation of Indulgences (1742) | ECCO `…a-short-explanation-of-i_challoner-richard_1742` (q 0.922, 20,928) | A | original | – | ≈20k | no |
| The City of God of the New Testament (1760) | ECCO `…the-city-of-god-of-the-n_challoner-richard_1787` (q 0.909, 21,702); 1799 | A | original | – | ≈21k | no |
| A Profession of Catholick Faith … with an explanation (1734) | ECCO `…a-profession-of-catholic_challoner-richard_1734` (q 0.924, 20,243); 1750 | A | original | – | ≈20k | no |
| A Letter to a Friend concerning the Infallibility of the Church (1743) | ECCO `…a-letter-to-a-friend-co_challoner-richard_1743` (q 0.942, 16,273) | A | original | – | ≈16k | no |
| A Caveat against the Methodists (1760) | ECCO `…a-caveat-against-the-met_challoner-richard_1760` (q 0.924, 13,097) | A | original | – | ≈13k | no |
| The Scripture Doctrine of the Church (1740) | ECCO `…the-scripture-doctrine-o_challoner-richard_1740` (q 0.935, 11,792) | A | original | – | ≈12k | no |
| A Plain Answer to Dr. Middleton's Letter from Rome (1741) | ECCO `…a-plain-answer-to-dr-mi_challoner-richard_1741` (q 0.936, 8,976) | A | original | – | ≈9k | no |
| The Touchstone of the New Religion (1734) | ECCO `…the-touchstone-of-the-ne_challoner-richard_1741` (q 0.912, 5,784); 1748/1795 | A | original | – | ≈6k | no |
| A Roman Catholick's Reasons why he cannot conform to the Protestant Religion (1735) | ECCO `…a-roman-catholicks-reas_challoner-richard_1735` (q 0.93, 3,351); 1736/1740/1796 | A | original | – | ≈3k | no |
| The Morality of the Bible (1762); Rules of a Christian Life; Abridgment of Christian Doctrine (catechism); The Devotion of Catholics to the Blessed Virgin | **not located** on archive.org in this pass | unverified | – | – | est. 10–60k each | no |
| Extracts reprinted 1915 (*The Lord's Prayer and the Angelic Salutation*, *Our Saviour in Glory*, *Passion Week Meditations*) | Wikisource (6,781 w); IA `thelordsprayeran00chaluoft`, `challoner_ascension1915`, `challoner_passion_week1915` | A | – | – | ≈20k | no (extracts of *Meditations*; skip) |
| Translation: **The Following of Christ** (Imitation, tr. Challoner, 1737) | 1. gutenberg.org/ebooks/60377 (64,104 w; proofread from IA `followingofchris00thom`, 1819; the PG transcriber modernised bible book names); 2. IA `followingofchris00thom` (q 0.95, 67,619); `TheFollowingOfChristIn4Books` (1833) | A | – | – | ≈64k | **work present**: `kempis-imitation-of-christ` (CCEL en-US; a different translation). Challoner's would be an alternative English witness only |
| Translation: St. Augustine's *Confessions* (tr. Challoner, 1739) | not searched in detail | unverified | – | – | est. 80k | the work is in the corpus (`augustine-confessions`, Outler) |

## Notes

- ***Meditations for Every Day*** is the same book as *Considerations upon Christian Truths and Christian Duties* (1753); the shorter title came with 19th-century reprints. The year runs as 365 dated meditations, each in three points. That is a perfect fit for a daily practice in the app: one meditation per day, or one chapter per day grouped by month.
- ***Garden of the Soul.*** The 19th-century editions (1871/1872, 226k words) are heavily expanded. Later editors added devotions, indulgenced prayers and a different Mass rite that Challoner never wrote. For a faithful text, use an 18th-century ECCO edition (1755 or 1759, the closest to the 1740 first edition) and accept long-s OCR cleanup. Alternatively, use the shorter undated archive.org edition (90k), but check its contents against an ECCO copy first.
- ***Memoirs of Missionary Priests.*** The 1924 Pollen edition is the best text (clean OCR, revised dates and names) and is tier A by year. It is organised chronologically, by priest and martyr, which makes natural short chapters.
- ***Britannia Sancta*** exists only in ECCO first-edition OCR. It is arranged by calendar day, which is useful for a saints-of-the-day feature.
- **ECCO OCR.** The dictionary scores of 0.91–0.94 hide long-s confusion (*ſ* read as *f*). A systematic f→s pass against a word list fixes most of it, and the rest needs a two-witness diff where a second edition exists.
- **Corpus overlap.** The Douay-Rheims Challoner revision is already in the corpus. The *Imitation* and the *Confessions* are present in other translations, so Challoner's versions would only be alternative English texts.

## Recommendation

- **Layout:** `challoner-opera-omnia/<work>` with `en-US` canonical: `meditations-every-day`, `garden-of-the-soul`, `think-well-ont`, `catholic-christian-instructed`, `memoirs-missionary-priests`, `britannia-sancta`, `memorial-british-piety`, `wonders-of-god-in-the-wilderness`, `grounds-catholic-doctrine`, then the controversial works (`grounds-old-religion`, `unerring-authority`, …) as one `controversial-works` collection.
- **Import first:** *Meditations for Every Day* (the daily-meditation fit), *Think Well On't* (Wikisource), *The Garden of the Soul* (from an 18th-century edition), *The Catholic Christian Instructed*, *Memoirs of Missionary Priests* (1924).
- **Cannot be sourced cleanly:** *The Morality of the Bible*, the catechism, *Rules of a Christian Life*, and the Marian devotion book were not located. *Britannia Sancta* and the pamphlets need long-s cleanup. Nothing is blocked by copyright.

**Total size (Challoner's own works, excluding the Bible and translations):** ≈1.85M words. *Meditations* ≈300k, *Memoirs* ≈300k, *Britannia Sancta* ≈340k, *Wonders* ≈150k, *Catholic Christian* ≈90k, *Garden* ≈75k, *Memorial* ≈60k, *Think Well* ≈35k, controversial and minor works ≈470k, unlocated ≈est. 50–100k.

## Portuguese

Searched: archive.org (`creator:challoner` in non-English languages, which returned only a German *Denkwürdigkeiten der Missionspriester*, 1852, `denkwrdigkeiten00chalgoog`; title queries for *Pensai/Pensae bem*, *Jardim da alma*, *Meditações … para cada dia do anno*, *missionarios … martyres … Inglaterra*), Open Library (`author:challoner`, Portuguese: none) and pt.wikisource (none). A general web search for modern Brazilian editions (e.g. a *Pensai bem nisso*) was not possible in this pass (budget exhausted), so a recent tier-C edition may exist unseen.

| Work | Portuguese translation | URL | Tier | Notes |
|---|---|---|---|---|
| *Think Well On't* | none found | – | – | Searched as *Pensai/Pensae bem (n'isto/nisso)*. |
| *The Garden of the Soul* | none found | – | – | An English recusant manual. No Portuguese tradition expected. |
| *Meditations for Every Day in the Year* | none found | – | – | – |
| *Memoirs of Missionary Priests* | none found | – | – | A German translation (1852) exists. No Portuguese. |
| *Catholic Christian Instructed*, *Grounds of Catholic Doctrine*, *Britannia Sancta*, other works | none found | – | – | – |

**Recommendation:** there is no Portuguese reference for Challoner. The pt-BR has to be translated from the English originals, which are tier A.
