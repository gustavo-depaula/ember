# Batch 33 — the Pictorial Lives, 28 July to 14 August

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 32: `nazarius_celsus`, `germanus_auxerre`, `stephen_i`, `finding_stephen_relics`, `cyriacus`, `peter_favre`, `romanus_ostiarius`, `tiburtius_susanna`, `radegundes`, `eusebius_rome`. No line in this stretch is skipped: no cult here is suppressed, and each of the ten is in the Roman Martyrology (or, for the Finding, is a historical event), though several chapters tell legendary Acts (see Doubts). The 15 June line (Sts. Vitus, Crescentia, and Modestus) is still left alone. The book's other chapters here are carded elsewhere or claimed: Martha (29 Jul) `martha_mary_lazarus`, Ignatius (31) `ignatius_loyola`, Peter's Chains (1 Aug) is claimed by batch 18 (`peter_chains`), Alphonsus (2) `alphonsus_liguori`, Dominic (4) `dominic`, St. Mary ad Nives (5) `mary_major`, the Transfiguration (6) `transfiguration`, Cajetan (7) `cajetan`, Laurence (10) `lawrence`, Clare (12) `clare_assisi`, the Assumption (15) `assumption`. The next unclaimed line is St. Hyacinth (16 August), left for batch 34.

The card data is in `../batches/batch-33.json`. `../consult/batch-33/build.py` writes it from `cards.py` (adapted from batch 32's, every output path changed to batch 33 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day (Peter Favre's chapter is the second one on 8 August; the index points at Cyriacus's);
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Eight do in both languages. Stephen I's and Radegundes's have none, and their excerptSources say so;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`, and lists the formularies on every card's date (and on 31 Jul and 1 Aug, the Martyrology's days for Germanus and Favre);
- that every word of each pt-BR name appears in the chapter title, except the places added to two names (Auxerre, Roma), which must appear in the chapter, and Stephen's ordinal;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides and that no other card uses the chapter; initials and refs.

Consulted material is in `../consult/batch-33/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Nazarius and Celsus (en, it), Germanus of Auxerre (en: stained glass; fr: statue), Pope Stephen I (en: Speyer reliquary head; it: St. Paul Outside the Walls medallion), Saint Stephen (the relics), Cyriacus, Peter Faber (en, fr: two engraved portraits), Romanus Ostiarius, Tiburtius and Susanna (disambiguation), Susanna of Rome, Radegund (en, fr), Eusebius of Rome, and Hyacinth of Poland as the reserve;
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`; Favre's chapter has none);
- existing cards compared against (`existing-sheet.jpg`: Ignatius, Francis Xavier, Peter Canisius, Stephen, Lawrence, Sixtus II, Elizabeth of Hungary, Hedwig, Ambrose, Eusebius of Vercelli, Nereus and Achilleus, Cornelius and Cyprian);
- every face line of batches 1–32, 52 and 53 (`faces-all.txt`, regenerated for this batch).

`fetch.sh` is the fetcher, `list.txt` and `list2.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 07-28, 07-30, 08-02, 08-03, 08-08 twice, 08-09, 08-11, 08-13, 08-14). Names are the book's, with its pt-BR forms (São Nazário e São Celso, São Germano, São Estêvão, O Achado das Relíquias de Santo Estêvão, São Ciríaco e Seus Companheiros, São Pedro Favre, São Romano, São Tibúrcio e Santa Susana, Santa Radegundes, Santo Eusébio). Titles after the name are dropped ("Martyrs", "Bishop", "Pope and Martyr", "Queen", "Priest"). Three names are extended because the book's bare name collides with another card:
- **"St. Germanus of Auxerre" / "São Germano de Auxerre"**: `germanus_paris` (28 May) is already "St. Germanus". "Auxerre" is in both chapters.
- **"St. Stephen I" / "São Estêvão I"**: apart from `stephen` (the protomartyr) and `stephen_hungary`, as batch 10 did with `clement_i` and `sylvester`.
- **"St. Eusebius of Rome" / "Santo Eusébio de Roma"**: apart from `eusebius_vercelli`; "Rome"/"Roma" are in the chapter, and the Martyrology has him "A Roma".

Initials: N, G, S, F (The Finding), C, P, R, T, R, E.

**Titles.** One changes. **Peter Favre is "Blessed" in the book and in the catalog line; he is now "St."**: beatified 5 September 1872, canonized by Pope Francis by equipollent canonization on 17 December 2013 (Wikipedia en and fr; Santi e Beati). The card is "St. Peter Favre" / "São Pedro Favre", keeping the book's "Favre" and "Pedro". The Roman Martyrology of 2004 (quoted on Santi e Beati) still has "beato Pietro Favre", because it predates the canonization. The other nine were "St." in the book and still are; all have had a cult since before canonization procedures. **Stephen I's patron line is "Pope", not the book's "Pope and Martyr"**: the Martyrology entry does not call him a martyr, and Wikipedia says the Depositio episcoporum of 354 does not either and the Church does not celebrate him as one.

**lifeChapter and reflection.** Each card's lifeChapter is its own chapter. The card's reflection is the chapter's own `**Reflection**` paragraph, for eight of the ten. Stephen I and Radegundes have chapters with no Reflection, so their cards have none; there is no fallback. The index's 08-02 reflection ("Let us do with all our heart the duty of each day…") is not in Stephen's chapter and is not used. Peter Favre's Reflection is in his own chapter (`aug-08-blessed-peter-favre`), separate from Cyriacus's, although the index's 08-08 entry points at Cyriacus.

**proper.** None. No sanctoral formulary in the repo is proper to any of the ten. The title hits are namesakes: `sanctorale.08-02` (Eusebius of Vercelli), `sanctorale.08-16` (Stephen of Hungary), `sanctorale.12-26` (St. Stephen, the First Martyr: his own feast, not the Finding of his relics, so not the Finding card's proper — this is our reading, not a tie stated anywhere in the data). The formularies on the ten dates belong to other saints: 07-28 Africa Victor I; 07-30 Peter Chrysologus (Africa: Justin De Jacobis); 07-31 Ignatius; 08-01 Alphonsus; 08-02 Eusebius of Vercelli; 08-08 Dominic; 08-09 Teresa Benedicta (Argentina: Rubatto); 08-11 Clare; 08-13 Pontian and Hippolytus; 08-14 Maximilian Kolbe. Nothing for Favre's Jesuit feast (2 Aug) is in the repo.

**Excerpts.**
- From the saint's own Reflection:
  - first sentence: Nazarius and Celsus, Romanus, Tiburtius and Susanna, Eusebius;
  - second sentence: Peter Favre;
  - last sentence: Cyriacus ("The cross is the ladder by which we must ascend to heaven.");
  - the whole of it, the quotation of 2 Tim. 1:13 without its marks and reference: Germanus;
  - the words of St. Augustine it quotes: the Finding.
- From the chapter, where there is no Reflection:
  - **Stephen I**: the last sentence of the second paragraph ("Thus by his zeal he preserved the integrity of faith…");
  - **Radegundes**: the first sentence of the second paragraph ("As a great queen, she continued no less an enemy to sloth and vanity…").

## Sts. Nazarius and Celsus (28 July)

- Wikipedia (`Nazarius.txt`): "little is known beyond the discovery of their bodies by Ambrose". Paulinus's Vita Ambrosii tells Ambrose finding Nazarius's body, with severed head and liquid blood, in a garden outside Milan after 395, and Celsus's in the same garden. The legend (disciple of Peter, preaching through Gaul, Trier, Nero) "is without historical foundation"; Paulinus says the date of martyrdom is unknown. Martyrology (`sb-Nazario.txt`): "A Milano, santi Nazario e Celso, martiri, i cui corpi furono rinvenuti da sant'Ambrogio."
- The book: the legend (the mother Perpetua, preaching, beheaded at Milan "soon after Nero"), then the finding by Ambrose in 395. The engraving shows the two led by soldiers.
- The card shows the preacher and the boy in the garden outside Milan's walls, no soldiers.
- **Against the youths of `seven_brothers`** (Martialis chubby with tight curls; Silvanus round and snub-nosed) and against `nereus_achilleus`: Celsus has a short, wide face and a straight black bowl-cut fringe. Nazarius is clean-shaven with a long midface and a bump high on the nose.

## St. Germanus of Auxerre (30 July)

- Wikipedia (`Germanus.txt`, `GermanusFr.txt`): c. 378 – c. 442–448, a noble trained in law at Rome, a high official, bishop of Auxerre from 418; the mission to Britain against Pelagianism (c. 429) with Lupus of Troyes, the cult of St. Alban, and the "Alleluia" victory, traditionally at Mold. The source is Constantius of Lyon's Vita Germani (c. 480). The Martyrology (`sb-Germano.txt`) keeps him on 31 July, his death at Ravenna.
- The book: lawyer, soldier and huntsman, tonsured almost by force, the missions to Britain, the Alleluia victory, died 448. **The book's 30 July against the Martyrology's 31 July**: the card follows the book, as the brief says.
- The card shows the bishop blessing in a British valley, with newly baptised Britons far off, and no battle.
- **Against `germanus_paris`** (eighty, clean-shaven, bald, with an underbite), `eusebius_vercelli` (curly grey hair, heavy brow ridge), `damasus` (rectangular, large wide-set dark eyes, rounded grey beard): Germanus has small pale-grey eyes with crow's-feet, a domed forehead, and a clipped iron-grey beard cut square.

## St. Stephen I (2 August)

- Wikipedia (`Stephen.txt`, `StephenIt.txt`): pope 254–257, archdeacon of Lucius, the rebaptism controversy with Cyprian. The account of his beheading in his chair is from the Golden Legend; he is not celebrated as a martyr. Martyrology (`sb-StefanoI.txt`): "A Roma nel cimitero di Callisto, santo Stefano I, papa", with the baptism controversy and no martyrdom.
- The book: elected 3 May 253, the controversy, the catacomb Masses, beheaded in his chair on 2 August 257. **The book gives his election as 253; Wikipedia gives 12 May 254.** The card shows no date and no martyrdom: the pope seated in the catacombs, blessing.
- The Speyer reliquary head (`Stephen.jpg`) is beardless; the Roman medallion (`StephenIt.jpg`) is a curly-bearded type close to `eusebius_vercelli`. The card follows Speyer.
- **Against `sixtus_ii`** (bald, hooked nose), **`fabian`** (clean-shaven, long, fine-boned, hump-nosed, grey-blue eyes), `sylvester`, `marcellinus_pope`: Stephen has a bulging, rounded forehead, deep-set dark eyes, a short pointed chin and a straight dark fringe.

## The Finding of St. Stephen's Relics (3 August)

- Wikipedia (`Protomartyr.txt`): in 415 the priest Lucian "purportedly had a dream" (Gamaliel appearing to him) revealing the tomb at Beit Jimal; Bishop John II with Eutonius of Sebaste and Eleutherius of Jericho came to the tomb; the relics went to Holy Sion on 26 December 415. The "Invention" was formerly kept on 3 August.
- The book: the same, after Lucian's letter (Caphargamala, the three visions, the digging, the earthquake and fragrance, seventy-three healed). The engraving shows the kneeling priest, two bishops and a digger at the open tomb.
- The card is a scene: Bishop John in Eastern vestments without a mitre (no mitres in 415), Lucian kneeling, a young labourer small at the side, the stone chest opened with light rising and no bones. It does not show Gamaliel or Stephen, so no recurring figure is involved.
- **Against `stephen`**: the protomartyr is not painted. John is long-faced with a humped nose and a long, square-cut grey-black beard; Lucian is small, bald and sparse-bearded, not the stock white-bearded elder.

## St. Cyriacus and His Companions (8 August)

- Wikipedia (`Cyriacus.txt`): all that is certain, beyond their names and martyrdom, is their burial at the seventh milestone of the Via Ostiensis on 8 August; the rest (the Baths of Diocletian, the exorcisms of Artemia and of a Persian princess) is legend, partly impossible. One of the Fourteen Holy Helpers; off the General Calendar since 1969. Martyrology (`sb-Ciriaco.txt`): "A Roma al settimo miglio della via Ostiense, santi Ciriaco, Largo, Crescenziano, Memmia, Giuliana e Smaragdo, martiri."
- The book: a short, sober chapter: deacon under Marcellinus and Marcellus, martyred in 303 with Largus, Smaragdus and twenty others, reburied on Lucina's farm on the Ostian Road. The engraving shows him in a dalmatic among soldiers.
- The card shows the three the book names, on the Via Ostiensis. The Martyrology's Crescentianus, Memmia and Juliana are not shown.
- **Against `julian_basilissa`** (kite-shaped face), `lawrence` and `stephen` (young deacons in dalmatics): Cyriacus is forty, with a full, soft, square face and wide-set hazel eyes; Largus is long-faced and drooping; Smaragdus is narrow and fox-like, with green eyes and reddish hair.

## St. Peter Favre (8 August)

- Wikipedia (`Faber.txt`, `FaberFr.txt`): 13 April 1506 – 1 August 1546, a shepherd boy of Villaret in Savoy, roommate of Ignatius and Xavier at Sainte-Barbe, the first priest of the Society (1534), missions in Germany, Spain and Portugal, died in Rome on the way to Trent. Beatified 1872, canonized 17 December 2013. The two engraved portraits (`Faber.jpg`, `FaberFr.jpg`) show a broad face, large wide-set eyes, full lips and a short dark beard; one has a biretta.
- The book: the same outline; he "died, in his fortieth year… in the very arms of… St. Ignatius". Wikipedia agrees on the age (40) and on his reaching Rome on the way to Trent. The chapter has no engraving. The card does not show the death.
- **Against `francis_xavier`** (oval face, curly hair, no biretta), `ignatius_loyola` (bald), `peter_canisius` (grey, oblong): Favre is broad-faced, with large, slightly prominent wide-set eyes and a short rounded beard, in a biretta, with the Alps of Savoy behind.

## St. Romanus (9 August)

- Wikipedia (`Romanus.txt`): a soldier converted by the example of Lawrence and baptised by him in prison; "His legend states…". Martyrology (`sb-Romano.txt`): "A Roma nel cimitero di san Lorenzo sulla via Tiburtina, san Romano, martire." Santi e Beati speaks of "svariate e valide testimonianze" of his ancient cult, linked to Lawrence's.
- The book: the same, beheaded the day before Lawrence, his relics at Lucca. The engraving shows Lawrence pouring water from a pitcher on the kneeling soldier.
- The card shows Romanus alone with the pitcher of his baptism and a palm, in the prison, so Lawrence (`lawrence`) is not painted again.
- **Against `victor_marseilles`** (sandy, cleft chin, broken nose), **`nereus_achilleus`** (blocky Nereus, beardless Achilleus), `pantaleon` (beardless, curly), `peter_verona` (compact, clean-shaven, brows nearly meeting): Romanus is long-headed and narrow-jawed, bearded, with a single line of brow and ears that stand out.

## Sts. Tiburtius and Susanna (11 August)

- Wikipedia (`TibSus.txt`, `Susanna.txt`): two unrelated saints on the same day. Susanna's hagiography (450–500) "is of no historical value", though "it is probable that a real martyr named Susanna lies behind" it; her General Calendar commemoration was removed in 1969. Martyrology: Tiburtius "al terzo miglio della via Labicana nel cimitero ad Duas Lauros… le cui lodi furono celebrate dal papa san Damaso" (`sb-Tiburzio.txt`); Susanna as a "commemorazione… sotto il cui nome… fu dedicata a Dio nel VI secolo una basilica nel titolo di Caio" (`sb-Susanna.txt`).
- The book: Tiburtius as the son of Chromatius (from the Acts of St. Sebastian), subdeacon, beheaded on the Lavican Road; Susanna "said to have been niece to Pope Caius", martyred c. 295. The engraving shows the two side by side.
- The card follows the engraving: the two side by side, with the two laurels of the Via Labicana behind.
- **Against the virgin martyrs (`agnes`, `cecilia`, `lucy`, `margaret_antioch`)**: Susanna is long and narrow-faced, with a fine aquiline nose, heavy-lidded almond eyes and a pointed chin. Tiburtius is square-faced and snub-nosed with wavy chestnut hair, apart from the long, curly `pantaleon` and the young `lawrence`.

## St. Radegundes (13 August)

- Wikipedia (`Radegund.txt`, `RadegundFr.txt`): c. 520 – 13 August 587, a Thuringian princess taken captive by Clothar I, queen, then consecrated by Medard, founder of the Holy Cross abbey at Poitiers, named for the relic of the True Cross she obtained from Justin II, for which Fortunatus wrote the *Vexilla Regis*. She is "typically depicted with royal robes, crown, and sceptre". Martyrology (`sb-Radegonda.txt`): "A Poitiers… santa Radegonda, che, regina dei Franchi, prese il sacro velo…".
- The book: the same outline, without the relic. It has no Reflection, and the index has none for 08-13.
- The card shows the crowned nun holding a reliquary cross (from Wikipedia, not the book), before the abbey at Poitiers.
- **Against `clotilda`** (her mother-in-law: lean, long, drooping grey eyes), `hedwig` and `margaret_scotland` (long ovals), `maud` (broad, square-jawed), `cunegundes` (triangular, wide-set prominent eyes), `elizabeth_hungary`: Radegundes has a short, wide face with high rounded cheekbones, narrow hooded dark-blue eyes and a wide mouth.

## St. Eusebius of Rome (14 August)

- Wikipedia (`EusebiusRome.txt`): died c. 357, founder of the church on the Esquiline, "listed in the Roman Martyrology" on 14 August. His Acts (arrest for opposing Liberius and Constantius, confinement, death after seven months) are "generally admitted" to be a forgery in whole or part. Martyrology (`sb-EusebioRoma.txt`): "A Roma, sant'Eusebio, fondatore della basilica del suo titolo sul colle Esquilino."
- The book: its first paragraph is this Eusebius ("opposed the Arians, at Rome… imprisoned in his room by order of the Emperor Constantius"); the rest tells "another Saint of the same name, a priest and martyr" in Palestine under Maximian. The engraving shows a man praying alone in a closed room, i.e. the Roman confined to his house.
- The card is the Roman, the saint the day is kept for and the one the engraving shows. Its Reflection ("courage in the service of God… to endure suffering") fits both.
- **Against `eusebius_vercelli`** (heavy brow ridge, curly grey beard), `jerome`, `john_francis_regis`: Eusebius is clean-shaven, broad at the brow, with close-set black eyes, a sharp high nose bridge, drawn cheeks and a long narrow chin.

## Look-alike risks that remain

- **Stephen I against `fabian`**: both clean-shaven popes with long faces. Reject a hump-nosed, grey-blue-eyed, silver-haired Stephen; he has dark eyes, a bulging forehead and a straight dark fringe. Reject a tiara or a curly beard.
- **Peter Favre against `francis_xavier`**: both bearded young Jesuits in black. Reject an oval face or curls; Favre is broad-faced, with wide-set large eyes, and wears a biretta.
- **Susanna against the virgin martyrs**: reject an oval, idealised face.
- **Romanus against `nereus_achilleus` and `victor_marseilles`**: reject a clean-shaven or sandy soldier; he is dark, bearded, with a single brow line.
- **Germanus against `damasus`**: reject large, wide-set dark eyes or a rounded beard.
- **The Finding**: reject any figure of Stephen, bones, or a mitre on Bishop John.
- **Cyriacus's three faces**: reject repeated faces; the deacon must not look like `lawrence` or `stephen` (young, beardless, dalmatic).

## Doubts

- **Legendary Acts, lines kept.** None of these cults is suppressed; each saint is in the current Roman Martyrology (entries quoted above). Several chapters, though, tell what the sources call legend:
  - **Nazarius and Celsus**: the legend "is without historical foundation"; only the finding by Ambrose is attested. The card shows no legendary episode.
  - **Stephen I**: the beheading in his chair is from the Golden Legend; the Church does not keep him as a martyr. The card drops "Martyr" and shows no martyrdom.
  - **Cyriacus**: all but names, martyrdom and burial is legend. The book tells only the sober outline.
  - **Tiburtius and Susanna**: Tiburtius's parentage comes from the Acts of St. Sebastian, and Susanna's Acts are "of no historical value"; the Martyrology keeps her only as a commemoration tied to her titular church. She is the weakest of the ten. If "rests on a discredited story" should cover her, skip the line, and the replacement is St. Hyacinth (16 Aug).
  - **Eusebius of Rome**: his Acts are held to be a forgery, but the Martyrology keeps him.
  - **The Finding**: Lucian's vision is told as "purportedly" by Wikipedia; the finding and translation of the relics in 415 are historical.
- **Eusebius's chapter tells two saints.** The card is the Roman (the book's first paragraph, the engraving, the Martyrology's 14 August); most of the chapter tells the Palestinian martyr. The alternative is a card of the Palestinian martyr, who is not among the Martyrology saints Santi e Beati lists for 14 August (`sb-08-14.html`).
- **Peter Favre's feast.** The card uses the book's 8 August; his Jesuit feast is 2 August and the Martyrology's day 1 August.
- **Added names**: "of Auxerre", "of Rome" and the ordinal "I" are added to the book's names to keep them apart from `germanus_paris`, `eusebius_vercelli`, `stephen` and `stephen_hungary`. Alternative: the book's bare names, with the distinction in the id only.
- **Radegundes's reliquary cross** comes from Wikipedia (the Holy Cross relic), not from the book.
- **`recurring-figures.md`** is unchanged: no figure of this batch appears on another card.
