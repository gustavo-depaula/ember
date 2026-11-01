# Cardinal Pierre de Bérulle (1575–1629): sourcing report

Bibliography followed: the *Œuvres complètes du cardinal de Bérulle*, ed. Migne (Paris, 1856, one volume of about 1,660 columns, reprinting François Bourgoing's 1644 collected edition), whose own *Table des matières* (checked in the OCR) is the work list below; checked against the modern critical *Œuvres complètes* (Cerf / Oratoire de France, ed. Michel Dupuy et al., 1995–), which adds unpublished pieces and the *Correspondance* (ed. Jean Dagens, 3 vols, Paris–Louvain 1937–39). Nothing by Bérulle is in the corpus (`_corpus-books.txt`, `content/books/`).

Sourcing is thin. French Wikisource has **no Bérulle author page and no text**, Gallica (text mode) was blocked by Cloudflare from this machine, and Google Books' API quota was exhausted. The **only complete digital text is the archive.org OCR of Migne 1856**. Word counts were **measured** on that OCR (`research/sourcing/berulle/oc1856_djvu.txt`, 999k words in all) by line ranges between section headings, so they are ±5%.

## Summary table

| Work | Original source (URL, edition) | Tier | English source (translator, year, URL) | Tier | Words (orig / en) | In corpus? |
|---|---|---|---|---|---|---|
| Discours de l'état et des grandeurs de Jésus (1623), 12 discours + dédicaces, approbations | archive.org `oeuvrescompl00br` (Migne 1856), cols ~111–400 | A | *Discourses on the State and Grandeurs of Jesus*, Lisa Richmond, CUA Press 2023 | C | ~158k (incl. prefatory matter) / — | no |
| Vie de Jésus (1629, unfinished; préambule + 30 ch.) | same, cols ~401–506 | A | excerpts in *Bérulle and the French School*, Glendon, Paulist CWS 1989 | C | ~57k / — | no |
| Élévations (à Jésus sur ses états; à la Trinité; à Dieu sur la part de Marie; Oraison à Marie) | same, cols 507–530 | A | excerpts CWS 1989 | C | ~12k / — | no |
| Élévation à Jésus-Christ … vers sainte Madeleine (1627), 20 ch. + Observations | same, cols 531–587; **2nd witness**: 1922 ed. (Éd. de la Vie spirituelle), archive.org `lvationaj00bruoft` | A | CWS 1989 (part) | C | ~33k / — | no |
| Narré / Vœu à Dieu, Vœu à Marie (vœux de servitude) + approbations | Migne, cols ~588–651 | A | excerpts CWS 1989 | C | ~24k / — | no |
| Œuvres de controverse (Discours de la mission des pasteurs; Sacrifice de la messe; Présence réelle; conférence Dumoulin) + Discours sur l'Eucharistie (I–IX+) | Migne, cols ~655–800 | A | none | — | ~74k / — | no |
| Opuscules divers contre les hérétiques | Migne | A | none | — | ~18k / — | no |
| Mémorial de direction pour les supérieurs | Migne, col. ~809 | A | none | — | ~14k / — | no |
| Traité des énergumènes (1599) | Migne col. 855; 1599 original scan archive.org `per_witchcraft-in-europe-and-america_berulle-pierre_1599_103` | A | none | — | ~20k / — | no |
| Bref discours de l'abnégation intérieure (1597) | Migne col. 875 (under "Œuvres de piété") | A | none (CWS has a version, C) | C | in next row | no |
| Œuvres de piété / Opuscules de piété (~203 pieces, nos. I–CCIII) | Migne, cols 875–1330 | A | excerpts CWS 1989 | C | ~245k (incl. Abnégation) / — | no |
| Lettres (I aux Carmélites, II aux Pères de l'Oratoire, III à diverses personnes, lettres relatives au mariage d'Henriette, extraits à Richelieu CCXLVI–CCLIV) + Fragments | Migne, cols ~1330–1622 | A | none | — | ~148k / — | no |
| Règlement de la Congrégation de l'Oratoire + Office de Jésus (Latin) + Supplément | Migne, cols 1623–end | A | none | — | ~61k / — | no |
| (front) Vie du cardinal by Caraccioli; Bourgoing's dedication & preface | Migne cols 9–110 | A | — | — | ~52k (not Bérulle) | — |
| Correspondance (complete, ed. Dagens 1937–39; Cerf OC vols) | not online | unverified/C | — | — | ~ unknown | no |

## Sources per work, ranked

**French, best first**

1. **Migne 1856, archive.org `oeuvrescompl00br`** (Toronto/Kelly copy, ABBYY FineReader 8). Full text: `https://archive.org/download/oeuvrescompl00br/oeuvrescompl00br_djvu.txt`, with page images in the PDF beside it. It is the only complete text. OCR quality is **fair**: two-column Migne with hyphenation at every line end, running heads (`DISCOURS DE L'ÉTAT…`, `OEUVRES DE PIÉTÉ. — CX.`) and column numbers interleaved, and character errors around 2–5% of words (`cha[iilre`, `j)ureté`, `\ ierge`). Latin passages are worse. It is usable as a base, but every chapter needs cleanup and a check against the page image.
2. **Bourgoing's 1644 *Œuvres*** (Paris, Estienne & Vitré, folio; reissued 1657, 1665) is the edition Migne reprints. It was not found on archive.org. Gallica and Google Books have copies (I could not open them from here: Gallica returned 403 via Cloudflare and the Google API quota was spent), so this is **unverified**. Use it as the image witness for 17th-c. spelling if it can be reached.
3. **1922 *Élévation … sainte Madeleine*** (Saint-Maximin, Éd. de la Vie spirituelle; Toronto scan `lvationaj00bruoft`, 137k OCR words, because the volume also bundles Denis the Carthusian, Bona and Lacordaire). This is a second witness for the Madeleine only. Tier A (1922).
4. **1599 *Traicté des énergumènes*** scan (`per_witchcraft-in-europe-and-america_berulle-pierre_1599_103`). It is the original edition, and the OCR of 1599 type is poor, so it is image-only in practice.
5. The biographies (Houssaye 3 vols 1872–75; Nourrisson 1856; Caraccioli) quote letters and are useful to check single letters only.

**English, best first**

1. *Discourses on the State and Grandeurs of Jesus*, tr. Lisa Richmond (Catholic University of America Press, 2023). It is the first complete English *Grandeurs*. It's on sale, so **tier C**.
2. *Bérulle and the French School: Selected Writings*, ed. William M. Thompson, tr. Lowell M. Glendon (Paulist Press, Classics of Western Spirituality, 1989). These are selections, **tier C**.
3. There is no public-domain English Bérulle. I found no 17th–19th-c. translation (searched archive.org and the web). *Some Spiritual Guides of the Seventeenth Century* (1927, archive.org `some-spiritual-guides-of-the-seventeenth-century`) and *Half-hours with the Saints* (1882) have only short extracts. Everything in English will be a pipeline translation from the French.

## Notes per work

- **Grandeurs de Jésus**: Dédicace au roi, Avis au lecteur, approbations, Latin pieces (*Propempticon*, *Commendatio*), Préface, then **12 discours**: I the singularity of the Incarnation; II an elevation; III–IV the unity of God; V–IX God's communication in the Incarnation; X–XII the three births of Jesus. Split one chapter per discours, with the front matter as one item.
- **Vie de Jésus**: a préambule (*Discours de l'état de Jésus dans le néant…*) and 30 chapters, unfinished at Bérulle's death.
- **Élévation sur sainte Madeleine**: a dedication to Queen Henrietta Maria and 20 chapters, plus the *Observations sur le texte de saint Luc*.
- **Œuvres de piété**: about 203 short numbered pieces (I–CCIII) in Migne: meditations on the mysteries, the Virgin, the Eucharist, abnégation, direction notes and the Oratory. They are posthumous gatherings by Bourgoing (the modern Cerf edition reorders and renumbers them). The natural split is groups of pieces by theme as Migne's table lists them, or one piece per section.
- **Lettres**: grouped I (Carmelites), II (Oratorians), III (various, incl. Richelieu, the Queen of England). Migne prints about 250 letters and extracts. Dagens's 1937–39 *Correspondance* (about 600 letters) is the complete one, but it's not online, and the editor died in 1984, so **unverified/C**.
- **Office de Jésus** is a Latin office and Mass for the feast of Jesus (28 January) that Bérulle composed for the Oratory, printed at the end.
- **Doubtful/spurious**: none flagged in Migne. The *Vie de la sœur Catherine de Jésus* (1626/1628) is Bérulle's preface to a life by Madeleine de Saint-Joseph and is not his work.

## Recommendation

- Layout `berulle-opera-omnia/<work>`: `grandeurs-de-jesus`, `vie-de-jesus`, `elevations`, `elevation-sainte-madeleine`, `voeux-de-servitude` (Narré + Vœux), `controverse` (incl. Eucharistie discourses and opuscules contre les hérétiques), `memorial-de-direction`, `traite-des-energumenes`, `oeuvres-de-piete` (incl. the *Abnégation*), `lettres`, `reglement-et-office-de-l-oratoire`.
- **Import first**: *Grandeurs de Jésus* (his masterpiece), then *Élévation sur sainte Madeleine* (with the 1922 witness) and *Vie de Jésus*, then *Œuvres de piété*. Import controversy, *Énergumènes* and the Règlement last.
- **Cannot be sourced cleanly**: (a) the whole corpus exists only as a fair-quality Migne OCR, so budget for heavy cleanup, ideally a fresh OCR of the page images (Migne's two-column layout breaks the djvu text often); (b) **no usable English at all**, since both translations are tier C, so `en-US` would have to be our own; (c) the complete letters (Dagens) are unavailable.

**Total size**: Migne volume OCR is **999k words**. Bérulle's own text is about **0.86 M words** (excluding Caraccioli's life, Bourgoing's preface and about 83k words of tables). English: **0** usable.

## Portuguese

**No Portuguese translation of any Bérulle work was found.** Searched: archive.org (advancedsearch `creator:berulle` / `title:berulle` with `language:por`: zero hits); pt.wikisource (no hits); Biblioteca Nacional Digital (Portugal) `bndigital.bnportugal.gov.pt` (no hits for "Berulle"); web search in Portuguese for *grandezas de Jesus*, *Elevações*, *Opúsculos de piedade* (only the English Richmond/CUA 2023 and Glendon/CWS 1989 came up). Not checkable from here: dominiopublico.gov.br (HTTP 403), bndigital.bn.gov.br (Cloudflare), Google Books (quota or captcha). The web-search budget ran out before Brazilian publisher catalogues (Paulus "Clássicos de espiritualidade", Vozes, Loyola) could be searched one by one, so a recent tier-C Brazilian anthology is **unverified, not ruled out**.

| Work | Translation | URL | Tier | Completeness / quality |
|---|---|---|---|---|
| all works | none found | — | — | — |

**pt-BR reference:** none. The pipeline translates straight from the cleaned Migne French.
