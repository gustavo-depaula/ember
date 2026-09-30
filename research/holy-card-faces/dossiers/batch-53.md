# Batch 53: canonized since 2022, 22 May to 6 August

Ten cards from lines 11–20 of "Canonized since 2022", in the section's date order: `luigi_maria_palazzolo`, `giovanni_battista_scalabrini`, `ignatius_maloyan`, `pier_giorgio_frassati`, `peter_to_rot`, `damascus_martyrs`, `compiegne_martyrs`, `titus_brandsma`, `giustino_russolillo`, `maria_francesca_rubatto`. Batch 54 takes the rest of the section, from Troncatti (25 Aug) to Bl. Fulton Sheen.

The card data is in `../batches/batch-53.json`, written by `../consult/batch-53/build.py` from `cards.py`. The script checks:
- each saying's original wording against the saved copy of the source it cites, and a second witness where there is one; Maloyan's en-US line verbatim in the saved vatican.va homily;
- that the one formulary excerpt (Compiègne, Ps 117) is verbatim in en-US and pt-BR;
- each feast against the catalog line and the "Memoria liturgica" field of the saved Dicastery page (`../consult/canonizations/`);
- that no OF formulary or calendar entry in the repo names any of the ten, except the one known below, and that no card has `proper` or `lifeChapter`;
- that each catalogMatch hits one unticked line among the section's lines 11–20, in order, and that no other batch claims it;
- the pt-BR names against the catalog, ids, initials, refs, and that every portrait used is saved.

Consulted material is in `../consult/batch-53/`:
- the Dicastery portraits (`causesanti-*.jpg`, sheet `causesanti-sheet.jpg`) and full page texts (`causesanti-*.txt`);
- Wikipedia summaries and extracts (`*.json`, `*.txt`);
- Commons originals and copies (`*.orig.*`, `*-2.jpg` etc.; `commons-meta.txt`; sheets `wiki-sheet.jpg`, `sheet-2.jpg`, `massabki-sheet.jpg`, `russolillo-sheet.jpg`, `rubatto-sheet.jpg`) and face crops (`faces-crop*.jpg`, `*-face.jpg`);
- the quote and fact sources (`src-*.html` / `.txt`);
- existing cards compared (`existing-sheet.jpg`) and every face line of batches 1–29 and 52 and of the card files (`faces-all.txt`).

`fetch.sh`, `getc.sh`, `crop.py`, `sheet.py` and `totext.py` are the tools.

**Dates, names, initials.** Each feast is the Dicastery's memorial, as the catalog gives it. None of the ten is on the General Calendar. Names follow the catalog; the group cards take "The Martyrs of Damascus" / "Mártires de Damasco" and "The Carmelite Martyrs of Compiègne" / "Mártires Carmelitas de Compiègne", dropping the catalog's parenthesis. Initials: L, G, I, P, P, M, C, T, G, M ("The" skipped on the two groups).

**Palazzolo's 22 May** (the canonizations dossier found it unexplained): the Dicastery's biography and the Istituto Palazzolo both date the founding of the Sisters of the Poor to 22 May 1869, so the memorial keeps the foundation day, not his death (15 June 1886).

**proper.** None. No OF formulary or calendar entry in the repo names nine of the ten. The one hit is `content/of/formularies/sanctoral/08-09/argentina.json`, "Beata María Francisca Rubatto, Virgen", a proper of Argentina on 9 August (not the Dicastery's 6 August) whose collect is **in Spanish only**. With no en-US or pt-BR collect it cannot be the card's `proper`; `build.py` flags it if that changes. The universal formularies on the other dates are other saints (Rita, Justin, Barnabas, Elizabeth of Portugal, Joachim and Anne, Eusebius / Peter Julian Eymard, the Transfiguration), with national propers on some (Spain, Germany, the US, Brazil's Inácio de Azevedo on 17 July).

**Excerpts.** Nine are the saints' own short, attested words; the Compiègne card uses Scripture from the repo's formulary. Palazzolo (1886), Scalabrini (1905), Maloyan (1915), Frassati (1925), Rubatto (1904) and the Damascus martyrs (1860) died long ago. Brandsma (1942), To Rot (1945) and Russolillo (1955) are single short quotations. **Every en-US and pt-BR rendering is ours** from the Italian (or Latin) the Dicastery gives, except Maloyan's en-US, which is the vatican.va English of John Paul II's homily verbatim (a short quotation); his pt-BR is ours.

## St. Luigi Maria Palazzolo (22 May)

- The Dicastery and Wikipedia (it): born in Bergamo in 1827, priest of the Oratory of San Bernardino, he founded with Teresa Gabrieli the Sisters of the Poor (Suore delle Poverelle) on 22 May 1869 for orphaned and abandoned girls, and died on 15 June 1886.
- Face: the 19th-century painted portrait from the Istituto Palazzolo (Commons, anonymous, public domain) and the Dicastery's drawn portrait with a crucifix. Both show a broad, heavy face widening to a jowled jaw, receding grey-brown hair under a biretta, a long nose with a rounded tip, heavy lids over eyes glancing aside, and a wide mouth turned down at the corners. No photograph found.
- Excerpt: the last clause of his saying «Io cerco e raccolgo il rifiuto di tutti gli altri…», Dicastery; the Istituto's home page has it with small variants ("dove altri non giunge").
- **Against `john_xxiii`** (round, twinkling, broad smile) and `albinus_angers` (jowled, pear-shaped, clean-shaven bishop): Palazzolo has the biretta, the long round-tipped nose, the sideways glance and the down-turned mouth.

## St. Giovanni Battista Scalabrini (1 June)

- The Dicastery: born at Fino Mornasco in 1839, Bishop of Piacenza from 1876 at thirty-six, "apostle of the catechism", founder of the Missionaries of St. Charles (1887) and the Missionary Sisters (1895) for Italian emigrants; he died on 1 June 1905. Italian Wikipedia quotes his own account of the emigrants crowding Milan station, which set him to the work.
- Face: his photographs as bishop (Commons, two; the Dicastery's). A long, rectangular clean-shaven face with a square chin, grey hair receding and brushed back, straight dark brows darker than the hair, deep-set eyes, a long strong nose and a wide, thin mouth.
- Excerpt: his first pastoral letter (1876), as the Dicastery quotes it, without the relative clause "che traggono miseramente la vita nella desolazione".
- **Against `pius_x`** (broad, silver, smiling), `giuseppe_allamano` (lean, white-haired, wide smile, big ears) and `paul_vi` (narrow, aquiline, bald): Scalabrini has the square chin, the dark straight brows under grey hair and the firm mouth.

## St. Ignatius Maloyan (11 June)

- The Dicastery and Wikipedia: born at Mardin in 1869, Armenian Catholic priest, Archbishop of Mardin from 1911; arrested with his faithful in June 1915 and shot on 11 June after refusing to become a Muslim. John Paul II's homily gives his age as forty-six.
- Face: his photograph of 1911 (Commons, from the diocese of Mardin; the Dicastery's copy), with the Vatican stamp of 2015 and the Bzommar bronze bust consulted. A full, soft oval with heavy-lidded dark eyes, thick arched brows, a straight broad-tipped nose and a long, dense black beard, in the black veghar hood with a pectoral cross. The card drops the two Ottoman decorations on his breast.
- **Against `gregory_narek`** (broad flat oval, very large wide-open eyes, Armenian monk), `josaphat` (lean, narrow) and `lawrence_brindisi` (very long beard, Capuchin): Maloyan is soft and full-cheeked, heavy-lidded, in the pointed black hood.

## St. Pier Giorgio Frassati (4 July)

- The Dicastery: born in Turin in 1901, son of the founder of *La Stampa*; engineering student, member of Catholic Action, the FUCI, the St. Vincent de Paul Society and the Dominican Third Order (1922); a mountaineer of the CAI and Giovane Montagna; he died of polio on 4 July 1925. The canonization homily recalls that he wrote "Verso l'alto" on his last mountain photograph, in the Val di Lanzo.
- Face: the photographs on Commons (arms-crossed portrait; climbing photographs of 1924–25) and the Dicastery's. A broad, square face, thick black hair brushed up, thick low level brows over deep-set eyes, a strong straight nose, full lips, a square chin. The card leaves out his pipe.
- Excerpt: "Gesù mi fa visita ogni mattina…", on the Dicastery's page.
- **Against `aloysius_gonzaga`**, `pancras` and the stock beardless youth: Frassati is a sturdy, square-jawed young man in modern climbing clothes.

## St. Peter To Rot (7 July)

- The Dicastery, the ADB and Wikipedia: born about 1912 at Rakunai, New Britain, son of a Tolai chief; catechist of Rakunai from 1933 with the official catechist's cross; married Paula Ia Varpit in 1936. Under the Japanese occupation he kept the mission going, opposed the legalising of polygamy, and was killed by lethal injection in prison in July 1945.
- Face: his one known photograph (the Dicastery's portrait; English Wikipedia's copy). A broad, square face, low heavy straight brows, deep-set eyes, a broad flat nose, a wide full mouth, short tightly curled hair, white shirt.
- Excerpt: his words in prison, as the Dicastery gives them in Italian. The English form in circulation ("I am here because of those who broke their marriage vows and because of those who do not want the growth of God's kingdom") was not found in John Paul II's beatification homily (`src-torot-jp2-homily.txt`), so the rendering is ours from the Dicastery.
- **The laplap and the church are not from a source**: the photograph shows only the shirt. Village dress of the Tolai and a timber mission church are the card's choice.
- **Against `lazarus_devasahayam`** (broad, square, but long hair and full beard), `charles_lwanga` (long, sculpted) and `martin_de_porres` (slender, heavy-lidded): To Rot is clean-shaven with short curled hair, low brows and a set mouth.

## The Martyrs of Damascus (10 July)

- The Dicastery: eight Franciscans of the Custody of the Holy Land (seven Spaniards and the Austrian Engelbert Kolland) and three Maronite brothers, Francis, Abdel Mooti and Raphael Massabki, killed in the friary of St. Paul on the night of 9–10 July 1860. The guardian, Manuel Ruiz (56), ran to consume the Eucharist and was killed at the altar. Francis was a silk merchant and father of eight; Raphael was the unmarried youngest.
- **No likenesses from life.** Consulted: the official image of the 1926 beatification (Commons; bearded friars in brown), a Maronite icon of the three brothers (Fr Yuhanna Azize's page: long robes, mantles and turbans, the outer two white-bearded), a plain modern icon on the Maronite Eparchy of Australia's page, and the Dicastery's modern group picture (Ruiz bald and long-bearded, Francis a bald white-bearded elder). The card follows these types. **The brothers' ages are not recorded**; Francis at about sixty and Raphael at about forty are ours.
- The card shows three of the eleven, as `north_american_martyrs` and `paul_miki` show two: Ruiz with the ciborium, Francis and Raphael Massabki.
- Excerpt: Francis Massabki's answer, Dicastery (Italian), Fr Azize (English) and French Wikipedia; our rendering from the Italian, shortened by its opening clause about Sheikh Abdallah's debt.
- **Against `francis_assisi`, `anthony_padua`, `lawrence_brindisi`** (Franciscans in brown): Ruiz is old, bald and long-bearded with the ciborium. Against the Christ type: Raphael has a turban and a short trim beard.

## The Carmelite Martyrs of Compiègne (17 July)

- The Dicastery: sixteen members of the Discalced Carmel of Compiègne (the prioress Teresa of St. Augustine, choir nuns, a novice, lay sisters and two externs), who offered themselves in 1792, were expelled and dressed as laywomen, arrested and taken to the Conciergerie, condemned on 17 July 1794 and guillotined at the Barrière du Trône, singing psalms and the Veni Creator and renewing their vows. Equipollent canonization on 18 December 2024.
- French Wikipedia (saved): before their transfer to Paris they put on their habits again, with the white choir mantle, and went to the scaffold in them; Sister Constance, the novice and youngest (29), went first, intoning the Laudate Dominum. English Wikipedia: Sister Charlotte of the Resurrection, 78, walked with a crutch and was "naturally inclined towards gaiety"; the prioress was 41.
- **No portraits from life.** The card shows three of the sixteen: the prioress, the novice (in the white novice's veil) and the eldest. Their faces are ours, set apart by age and structure: a heart-shaped face at 41, a round, upturned-nosed face at 29, a long, lined, merry face at 78. The Quidenham window and three 19th/20th-century prints (Commons) were consulted for the scene; none gives faces.
- Excerpt: Ps 117:1, from the psalm of the Conversion of St. Paul (`sanctoral/01-25.json`), the psalm Constance began on the scaffold; both lines joined.
- **Against `teresa`, `therese`, `teresa_benedicta`** (Carmelites in the same brown habit and white mantle): each figure has its own age; reject a young oval for the prioress or a square jaw for any of them.

## St. Titus Brandsma (26 July)

- The Dicastery: born in 1881 at Oegeklooster near Bolsward, Friesland; Carmelite from 1898; professor of philosophy and of the history of mysticism at the Catholic University of Nijmegen and its rector (1932–33); ecclesiastical adviser to the Catholic press. Arrested in January 1942 for telling Catholic editors to refuse Nazi propaganda, he died at Dachau on 26 July 1942.
- Face: his photographs (Nationaal Archief, late 1920s; the rector's portrait of 1932; the Dicastery's). A long face widening at the cheekbones, a crest of thick wavy hair brushed up, small smiling eyes behind round steel spectacles, a long nose with a rounded tip, a thin smile. The card makes him about sixty, grey.
- Excerpt: "La preghiera è vita…", Dicastery.
- **Against `maximilian_kolbe`** (round spectacles, but bearded and balding) and `josemaria_escriva` (round face, dark rectangular glasses, cassock): Brandsma is clean-shaven, grey-crested, in the brown and white Carmelite habit.

## St. Giustino Russolillo (2 August)

- The Dicastery: born at Pianura, Naples, in 1891; ordained in 1913; parish priest of San Giorgio Martire in Pianura from 1920; founder of the Society of Divine Vocations (Vocationists, 1920) and the Vocationist Sisters (1921) to bring poor boys to the priesthood; he died on 2 August 1955.
- Face: the Dicastery's portrait and the Vocationists' painted portrait (Vatican News) of him as a young priest: a long, narrow face with a pointed chin, short dark hair, round wire spectacles, prominent ears and full lips, in a cassock with a short cape. His late photographs (`Russolillo-smiling.jpg`) show a round face with a wide, toothy smile, which is too close to `josemaria_escriva`, so the card keeps the younger face at about forty.
- Excerpt: the second clause of his conviction on faith, Dicastery. His better-known aphorism "La contemplazione nell'azione e l'azione per la contemplazione" is, by the Dicastery's own wording, one he took "from the school of the great mystics", so it was not used.
- **Against `titus_brandsma`** in this batch (the other bespectacled cleric): Russolillo is forty, dark-haired and narrow-faced, in a black cassock; Brandsma is sixty, grey-crested and broad at the cheekbones, in brown and white.

## St. Maria Francesca of Jesus Rubatto (6 August)

- The Dicastery and the Archivio Rubatto: born at Carmagnola in 1844; she took the habit of a Capuchin tertiary at Loano on 23 January 1885 and led the new community; she made eight Atlantic crossings for the missions in Uruguay and Argentina and died in Montevideo on 6 August 1904, the first saint of Uruguay.
- Face: her photograph (Commons, before 1904), the congregation's coloured photograph (scmrubatto.org) and the Dicastery's drawn portrait. A broad, full face with thick dark brows, large pale eyes, a broad-bridged straight nose and a small full mouth. The coloured photograph gives the habit's colours: dark brown, black veil, white wimple and a broad white guimpe.
- Excerpt: «Servae sumus pauperum…», the Latin in which the decree quoted on the Dicastery's page gives her words. **The Italian original was not located**; the rendering is ours from the Latin. Vatican News (September 2022) quotes her "Siate le suore del popolo" as an alternative.
- **Against `marie_leonie_paradis`** (wide, flat, rectangular face in a coif, small deep-set eyes, thin mouth) and `maria_santocanale` (brown habit, black veil, long narrow face): Rubatto is full and rounded, with large, wide-open pale eyes, the broad white guimpe and a rosary, not a loaf.

## Doubts

- **The two group cards show three of eleven and three of sixteen.** Damascus's faces and Compiègne's faces are ours; there is no likeness from life for any of them.
- **The Massabki brothers' ages** are not recorded; the card's are an inference from their family roles.
- **Rubatto's excerpt** survives only in the decree's Latin; the Italian was not located.
- **To Rot's laplap and village church** are the card's choice; his photograph shows only a white shirt.
- **Maloyan's pt-BR** is ours; his en-US is John Paul II's English verbatim.
- **Rubatto has an Argentinian proper (9 August) with a Spanish-only collect**; no `proper` is set.

## Look-alike risks that remain

- **Brandsma and Russolillo** (two bespectacled clerics in one batch): check that Russolillo stays young, dark and narrow and Brandsma grey, crest-haired and broad at the cheekbones. Reject a round smiling face for Russolillo (`josemaria_escriva`) and a beard for either (`maximilian_kolbe`).
- **Scalabrini against `giuseppe_allamano` and `pius_x`**: reject white hair, a broad smile or big ears; he has grey receding hair, dark straight brows and a square chin.
- **Palazzolo against `john_xxiii`**: reject a round, laughing face.
- **To Rot against `lazarus_devasahayam`** (both broad and square): To Rot is clean-shaven with short hair.
- **Rubatto against `marie_leonie_paradis` and `maria_santocanale`**: the broad white guimpe, the large pale eyes and the full cheeks are the check.
- **Compiègne against `teresa`, `therese` and `teresa_benedicta`**: same habit and mantle; three clearly different ages must read, and Constance's veil must be white.
- **Damascus**: reject a Christ-like Raphael, weapons or blood; keep all three inside the arched window.
- **Maloyan against `gregory_narek`**: reject wide-open eyes; his are heavy-lidded, under the pointed black hood.
