# Jean-Jacques Olier (1608–1657): sourcing report

Bibliography followed: the *Œuvres complètes de M. Olier*, ed. Migne (Paris, 1856, one volume), whose *Table des matières* (read from the OCR) gives the published works. That list is completed by what the Sulpicians printed separately: the *Lettres* (1862, then the fuller 1885 edition), the *Vie intérieure de la très sainte Vierge* (compiled by Faillon from Olier's manuscripts, 1866 and later), and the *Pensées choisies* (1916). The autograph *Mémoires* (8 manuscript vols) were never printed whole before the modern critical edition (Honoré Champion, MYST series, 2010s); Migne prints only extracts. Nothing by Olier is in the corpus.

Word counts were **measured** on the archive.org OCR (`research/sourcing/olier/`). Migne totals were split by running headers (script `research/sourcing/_seg.py`), so they are ±5%.

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Catéchisme chrétien pour la vie intérieure (1656) | archive.org `uvrescompltesd00olie` (Migne 1856) | A | *Catechism of an Interior Life*, anon., Baltimore: Murphy 1852, archive.org `catechismofanint00olieuoft` | A | ~26k / 28k | no |
| Introduction à la vie et aux vertus chrétiennes (1657) | Migne 1856 | A | in *Bérulle and the French School*, Paulist CWS 1989 | C | ~59k / — | no |
| La Journée chrétienne (1655) | Migne 1856 | A | in CWS 1989 | C | ~56k / — | no |
| Explication des cérémonies de la grand'messe de paroisse (1657) | Migne 1856 | A | none found | — | ~91k / — | no |
| Traité des saints ordres (1676, posth.) | Migne 1856 | A | none found | — | ~120k / — | no |
| Lettres spirituelles | Migne 1856 (~185k); **Lettres de M. Olier**, Paris: Lecoffre 1885, 2 vols, archive.org `lettresdemolierf01olie`, `…f02olie` (~386k incl. notes); *Lettres spirituelles* 1862, Poussielgue, 2 vols, `lettresspiritue00oliegoog`, `lettresspiritue01oliegoog` (~189k) | A | none found | — | ~185k (Migne) / ~350k (1885, est. net) / — | no |
| Extraits des Mémoires (autograph notes) | Migne 1856 | A | none | — | ~53k / — | no |
| L'Esprit d'un directeur des âmes; Maximes et pratiques; Règles / *Regulae artis artium*; Avis; Examen sur les vertus | Migne 1856 | A | none | — | ~44k / — | no |
| Sentiments sur les grandeurs de saint Joseph | Migne 1856 | A | none | — | ~5k / — | no |
| Vie intérieure de la très sainte Vierge (compiled by Faillon from Olier's writings) | 1866 Rome, Salviucci, 2 vols, archive.org `vieintrieurede01olie`, `…02olie` (~394k OCR incl. editor's apparatus); clean HTML of the 1-vol edition: jesusmarie.free.fr and bibliotheque-monastique.ch (Wayback) | A | none found | — | ~101k (1-vol ed.) / — | no |
| Pensées choisies (1916, anthology) | archive.org `penseschoisies00olie` | A | — | — | not measured | no |
| Mémoires (complete), Correspondance (critical) | Champion (2010s) / Lettres ed. Levesque 1935 (Gigord) | C / unverified | — | — | — | no |

## Sources per work, ranked

**French, best first**

1. **Migne 1856, archive.org `uvrescompltesd00olie`** (Toronto, ABBYY 8; 663k words in all, about 21k of them the opening *Vie de M. Olier*). URL `https://archive.org/download/uvrescompltesd00olie/uvrescompltesd00olie_djvu.txt`. OCR is **fair** (two-column Migne, hyphenation, running heads, `OL1EU`, `CllIlKTIENNli`). It covers every work above except the *Vie intérieure* and the fuller 1885 letters.
2. **Second Migne scan, `uvrescompltesru00oliegoog`** (Harvard/Google copy, 664k words). It is an **independent OCR of the same edition**, so use it to vote on OCR errors against #1. A third copy, `ceuvrescompletes0000demo`, also exists.
3. **Lettres de M. Olier, 1885** (Paris, V. Lecoffre, 2 vols; Toronto scans `lettresdemolierf01olie` 189k, `lettresdemolierf02olie` 197k, plus Google copies `lettresdemolierf0001olie`, `…0002olie`). This is a **fuller, better-dated** letter edition than Migne. OCR is good (single column).
4. **Lettres spirituelles, 1862** (Poussielgue-Rusand, 2 vols, Oxford/Google: `lettresspiritue00oliegoog` = t. I 95k, `lettresspiritue01oliegoog` = t. II 94k). An earlier, smaller selection, kept as a witness.
5. **Vie intérieure de la T. S. Vierge.** (a) the 1-volume edition as clean HTML, `http://jesusmarie.free.fr/olier_vie_de_la_tres_sainte_vierge_marie.html` (101k words, retyped, no OCR noise; the free.fr site gives no licence, so take it as tier A text with an unknown transcriber); (b) the same text on the Abbaye Saint-Benoît / bibliotheque-monastique.ch site, now dead and **Wayback only** (`web.archive.org/web/2021/https://www.bibliotheque-monastique.ch/bibliotheque/bibliotheque/saints/olier/index.htm`, 100.8k words), which makes a second witness; (c) the 1866 Rome 2-vol edition (archive.org, OCR good, with Faillon's long notes), the page-image witness.
6. *Pensées choisies* (Letourneau, 1916; `penseschoisies00olie`) is an anthology, so skip it.

**English, best first**

1. *Catechism of an Interior Life* (Baltimore: Murphy & Co., 1852; translator anonymous; Toronto scan `catechismofanint00olieuoft`, 28k words). It is **tier A** and complete, both parts in "Lessons". The OCR is good, with some blackletter title noise.
2. *Bérulle and the French School: Selected Writings* (Paulist Press CWS, 1989) translates the *Introduction* and the *Journée chrétienne*, possibly in part. It's on sale, so **tier C**.
3. No other English Olier was found (archive.org and the web were searched). The *Explication des cérémonies*, *Saints ordres*, letters and *Vie intérieure* have no English.

## Notes per work

- **Catéchisme chrétien**: 2 parts in numbered *leçons* (questions and answers). It is short and devotional, and the obvious first import.
- **Introduction à la vie et aux vertus chrétiennes**: 15 chapters (religion of Jesus Christ, conformity, then the virtues: humility, pride, penance, mortification, patience, meekness, poverty, chastity, obedience, charity), each subdivided into numbered sections.
- **Journée chrétienne**: a preface and two parts of short "exercises" and "actes" (rising, Mass, office, meals, work, the walk in the fields, sickness, sleep). It needs careful flow-DSL-like structuring if used as prayers.
- **Explication des cérémonies de la grand'messe**: 9 books plus the Mass for the dead, a mystical commentary on the parish High Mass.
- **Traité des saints ordres**: on tonsure, minor and major orders, the priesthood. It was edited after Olier's death (Tronson, 1676), so the attribution of its exact wording is partly the editor's (it is an "ouvrage recueilli").
- **Lettres**: Migne prints about 250. The 1885 edition is chronological, with a numbering of its own. Prefer 1885 as the base, and use Migne and 1862 as witnesses.
- **Vie intérieure de la très sainte Vierge**: *compiled*, not composed, by Olier. Faillon assembled it from scattered manuscripts (see its *Avertissement*). Treat it as "Olier, ed. Faillon".
- The *Mémoires* extracts in Migne are autobiographical and mystical notes. The full critical *Mémoires* (Champion) is tier C.

## Recommendation

- Layout `olier-opera-omnia/<work>`: `catechisme-chretien`, `introduction-vie-et-vertus`, `journee-chretienne`, `ceremonies-grand-messe`, `traite-des-saints-ordres`, `lettres` (1885 base), `vie-interieure-de-la-sainte-vierge`, `opuscules` (Esprit d'un directeur, Maximes, Avis, Examen, Saint Joseph, Extraits des Mémoires).
- **Import first**: *Catéchisme chrétien* (FR Migne cleaned by voting between the two scans; EN 1852, tier A), then *Introduction à la vie et aux vertus chrétiennes* and *Journée chrétienne* (FR only), then *Vie intérieure de la Vierge* (clean HTML base, with 1866 as witness).
- **Cannot be sourced cleanly**: English for everything except the *Catéchisme* (the only other translation is CWS, tier C); the full *Mémoires* and modern letter editions (tier C); Migne-only works depend on fair OCR, which two scans make manageable.

**Total size**: Olier's own text is about **0.84 M words** of French (Migne works about 0.64M once the life and tables are removed; the *Vie intérieure* about 0.10M; the extra letters in the 1885 edition beyond Migne about 0.1M (est.)). English: **28k words** usable (tier A).

## Portuguese

**No Portuguese translation of any Olier work was found.** Searched: archive.org (advancedsearch `creator:olier` with `language:por`: zero hits); pt.wikisource (no hits); Biblioteca Nacional Digital (Portugal) (no hits for "Olier"); web search for the expected Portuguese titles *Catecismo cristão para a vida interior* and *Catecismo da vida interior* (only the French and English editions). Not checkable from here: dominiopublico.gov.br (HTTP 403), bndigital.bn.gov.br (Cloudflare), Google Books (quota or captcha). The web-search budget ran out before a 19th-century Portuguese *Catecismo christão para a vida interior* (plausible, since the Sulpician catechism circulated widely) could be checked in the BNP catalogue (Porbase), so that one is **unverified**.

| Work | Translation | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| all works | none found | — | — | — |

**pt-BR reference:** none. The pipeline translates from the Migne French. The 1852 English *Catechism of an Interior Life* serves as the second witness.
