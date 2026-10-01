# Batch 40 — the Pictorial Lives, 17 November to 4 December

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 39: `gregory_thaumaturgus`, `odo_cluny`, `felix_valois`, `peter_alexandria`, `maximus_riez`, `james_marches`, `saturninus_toulouse`, `eligius`, `bibiana`, `barbara`. **No line in this stretch is skipped**: all ten are in the current Roman Martyrology (entries on Santi e Beati, quoted below), though Bibiana and Barbara rest on legendary Acts (see Doubts). The lines already waiting on a decision are left alone. The book's other chapters here are carded already: Elizabeth of Hungary (19 Nov) `elizabeth_hungary`, the Presentation (21) `presentation_bvm`, Cecilia (22) `cecilia`, Clement (23) `clement_i`, John of the Cross (24) `john_of_the_cross`, Catherine of Alexandria (25) `catherine_alexandria`, Andrew (30) `andrew`, Francis Xavier (3 Dec) `francis_xavier`. The next unclaimed line is St. Sabas (5 Dec), for batch 41.

The card data is in `../batches/batch-40.json`. `../consult/batch-40/build.py` writes it from `cards.py` (adapted from batch 39's; every output path changed to batch 40 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but `nov-28-james-of-la-marca-of-ancona`, in both languages; James's excerptSource says it has none;
- that no other card uses any of the ten chapters;
- that no card has a `proper`, listing every sanctoral formulary whose title names one of the ten and the formularies on every card's date and on the Martyrology's other days for them (4 Nov Felix, 25 Nov Peter on Santi e Beati);
- that every word of each pt-BR name appears in the chapter title (accent-folded);
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides; initials and refs.

The first run failed on two things, both fixed: Felix's excerpt (the first sentence of his Reflection) ended with a closing quotation mark that the book puts only at the end of the second sentence, so the card takes the whole Reflection; and the formulary regex caught "religiosa" through "eligi", now anchored as `\beligi`.

Consulted material is in `../consult/batch-40/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Gregory Thaumaturgus (Greek icon), Odo of Cluny (en: miniature; fr), Felix of Valois (en: painting with the stag; fr), Peter I of Alexandria (fresco with the vision of the Child), Maxime de Riez (fr: the baptistery of Riez), James of the Marches (en: Zurbarán, also `James-large.jpg`; it: painting; Crivelli's panel of 1477, text only, `JamesCrivelli.*`), Saturnin (en: miniature of the martyrdom; fr), Eligius (en: Petrus Christus; fr: window), Bibiana (the altar with Bernini's statue; `Bibiana-large.jpg`, `BibianaFace.jpg`), Barbara (altarpiece; Palma Vecchio's altarpiece in Santa Maria Formosa, `BarbaraPalma.jpg`);
- Santi e Beati pages with the current Roman Martyrology entry and emblems for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`);
- the Catholic Encyclopedia on Barbara, Bibiana and Eligius (`ce-*.txt`);
- St. Ouen's Life of St. Eligius, Medieval Sourcebook translation (`eligius-vita.html`, `.txt`), chapter 12 describing him;
- John of Salerno's Life of Odo as retold on Nobility.org (`nobility-odo.html`, `.txt`);
- the Painter's Manual (`../hermeneia-ocr.txt`): line 7040, "Saint Gregory of Neo-Caesarea; an old man with curly hair and a short beard. November 17th"; line 7033, "Peter of Alexandria, an old man with a rounded beard". The Saturninus of line 9173 ("an old man with a wide beard", with Plutinus) is another martyr and is not used;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`), and a sheet of the original cards used as refs (`existing-sheet.jpg`);
- every face line of batches 1–39 and 44–54 (`faces-all.txt`, batch 39's appended for this batch), against which the faces were compared.

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets (run with `research/holy-card-faces/.venv/bin/python`).

**Dates, names, initials.** Feasts follow the book (index days 11-17, 11-18, 11-20, 11-26, 11-27, 11-28, 11-29, 12-01, 12-02, 12-04). Names are the book's, with its pt-BR forms (São Gregório Taumaturgo, Santo Odão de Cluny, São Félix de Valois, São Pedro de Alexandria, São Máximo, São Tiago de La Marca de Ancona, São Saturnino, Santo Elói, Santa Bibiana, Santa Bárbara). Titles after the name are dropped ("Bishop", "Martyr", "Virgin, Martyr"); some become the patron line. The book's forms are kept where English usage differs: "St. James of La Marca of Ancona" (usually "James of the Marches"), and "St. Maximus" with no see, the see going into the patron line ("Abbot of Lérins, bishop of Riez"). Ids add a place where the bare name is ambiguous: `gregory_thaumaturgus`, `odo_cluny`, `felix_valois` (not `felix_i`), `peter_alexandria`, `maximus_riez`, `james_marches` (not `james_greater`), `saturninus_toulouse`; `eligius`, `bibiana` and `barbara` stand alone. Initials: G, O, F, P, M, J, S, E, B, B.

**Titles.** None changes: all ten are "St." in the book and "san/sant'/santa" in the Martyrology (`sb-*.txt`). James was canonized in 1726 (Wikipedia); no saint here died after 1930.

**lifeChapter and reflection.** All ten have their chapter as lifeChapter, each telling one life. Nine end with their own `**Reflection**`, which the card gets. **James's chapter `nov-28-james-of-la-marca-of-ancona` has no Reflection** (and the index's 11-28 has none), so his card has none; there is no fallback.

**proper.** None. No formulary in the repo with en-US or pt-BR collect text names any of the ten. Barbara has a German-speaking formulary, `sanctorale.12-04.german-speaking` ("Hl. Barbara, Märtyrin"), with a German collect only; by the rule it is not set as `proper`. The OF calendar names no other of the ten. The formularies on the ten dates belong to other saints or feasts (11-17 Elizabeth of Hungary and Argentina's Roque González, 11-18 the Dedication of the Basilicas and the United States' Rose Philippine Duchesne, 11-26 Germany's Konrad and Gebhard, 11-28 a prelature anniversary, 12-01 Africa's Bl. Clementine Anuarite, 12-02 Germany's Luzius, 12-04 John Damascene); nothing on 11-20, 11-27 or 11-29.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Odo (Newman), Felix (St. John Chrysostom), Peter (Mark 10:23), Maximus (Colossians 4:1), Bibiana, Barbara;
  - first sentence: Gregory ("Devotion to the blessed Mother of God is the sure protection of faith in her Divine Son."), Saturninus ("When beset by the temptations of the devil, let us call upon the Saints, who reign with Christ."), Eligius ("When God called His Saints to Himself, He might… have taken their bodies also; but He willed to leave them in our charge, for our help and consolation.").
- From the chapter, where the card has no Reflection: **James**, second paragraph, second sentence ("He began his spiritual war against the devil, the world, and the flesh, with assiduous prayer and extraordinary fasts and watchings.").

## St. Gregory Thaumaturgus (17 November)

- Wikipedia (`Gregory.txt`): about 213 – about 270, born of a wealthy pagan family at Neocaesarea in Pontus, a pupil of Origen, bishop of his native city. Martyrology (`sb-Gregorio.txt`): "A Neocesarea nel Ponto, nell'odierna Turchia, san Gregorio, vescovo, che, abbracciata fin dall'adolescenza la fede cristiana, fu grande cultore delle scienze sia umane sia divine; ordinato vescovo si mostrò insigne per dottrina, virtù e zelo apostolico e per i numerosi miracoli da lui operati ricevette il nome di Taumaturgo." Santi e Beati's notice tells of the staff he planted to hold back the flooding river, which became a great tree.
- The book: Origen's pupil, the creed given through St. John and Our Lady, the rock, the river and the lake; died 270.
- The card: the Greek bishop, bareheaded, in phelonion and omophorion with a Gospel book, blessing; the valley of the Lycus with the tree grown from his staff and Neocaesarea. **The vision is left off.**
- Face after the Painter's Manual and the icon. **Against `athanasius`** (bald, long white beard), `lambert`, `hilary` (trapezoid, wider at the temples), `honoratus`, `remigius`: Gregory is narrow with sunken temples, a single white curl over a bald brow, a furrowed brow, a long narrow nose, close-set eyes and a short, curly white beard.

## St. Odo of Cluny (18 November)

- Wikipedia (`Odo.txt`): about 878 – 18 November 942, a page at the court of Aquitaine, canon of St. Martin at Tours, monk at Baume, second abbot of Cluny from 927, reformer of Fleury and other houses. Martyrology (`sb-Oddone.txt`): "A Tours in Neustria, sempre in Francia, transito di sant'Oddone, abate di Cluny, che rinnovò l'osservanza monastica secondo i dettami della regola di san Benedetto e la disciplina di san Benedetto di Aniane."
- The book: born on Christmas Eve after his father's prayer, offered to St. Martin, abbot of Cluny "which was then building", peacemaker for the Pope, died at Tours in 942.
- Nobility.org, after John of Salerno: "He habitually walked with back bent and eyes fixed on the ground, a posture so suggestive of a laborer with a spade that he was nick-named 'the Digger.'" and "A mood of hilarity sometimes seized this earnest saint".
- The card: the abbot in the black cowl with a wooden staff and the Rule, head a little bowed, eyes lowered; Cluny being built in the valley of the Grosne.
- **Against `hugh_cluny`** (his successor at Cluny: square-oval, Greek nose), `edmund_canterbury` (lean, sharp cheekbones, hooked nose), `didacus`, `ludger`, `elphege`, `polycarp`, `leonard_noblac`: Odo's face is an upright egg, widest at a high, rounded forehead, with soft cheeks, a short, upturned nose and large, round, lowered eyes. The first face written for him (a diamond, widest at the cheekbones) was changed after comparing it with batch 39's `edmund_canterbury`.

## St. Felix of Valois (20 November)

- Wikipedia (`Felix.txt`, `FelixFr.txt`): 1127 – 4 November 1212, a hermit at Cerfroid in the diocese of Meaux, seventy when John of Matha came to him; with him founder of the Order of the Holy Trinity for the redemption of captives, approved by Innocent III in 1198. French Wikipedia tells the vision of a white stag drinking at the spring with a red and blue cross between its antlers, the habit of the Order to come. Martyrology (`sb-Felice.txt`), on 4 November: "Presso Cerfroid nel territorio di Meaux in Francia, san Felice di Valois, che, dopo avere condotto per lungo tempo vita solitaria, si ritiene sia stato compagno di san Giovanni de Matha nel fondare l'Ordine della Santissima Trinità per la liberazione degli schiavi."
- The book: son of the Count of Valois, a Cistercian at Clairvaux, a hermit in Italy and at Cerfroid, co-founder with St. John of Matha; died 1213.
- The card: the very old Trinitarian in white habit and scapular with the red and blue cross, hands on a rosary and book; the forest of Cerfroid with his cell and a white stag drinking at the spring. **The cross between the antlers is left off**: the order's cross is already on his scapular, and a crucifix between antlers is on `eustachius` (batch 36).
- The long white beard is from the tradition of his images (the painting on English Wikipedia), which the sources leave no reason to change. **Against `john_matha`** (his companion, batch 21: clean-shaven, convex, curved nose), `anthony_abbot`, `fabian`, `athanasius`: Felix is long and narrow with hollow temples and cheeks, a bald dome, hooded, downcast eyes under drooping white brows, a thin arched nose and a very long, wavy white beard to the waist.

## St. Peter of Alexandria (26 November)

- Wikipedia (`Peter.txt`): patriarch of Alexandria 300–311, beheaded under Maximinus. Martyrology (`sb-Pietro.txt`): "Ad Alessandria d'Egitto, san Pietro, vescovo e martire, che, ornato di ogni virtù, fu improvvisamente decapitato per ordine dell'imperatore Galerio Massimiano, divenendo ultima vittima della grande persecuzione e sigillo dei martiri…"
- The book: bishop in Diocletian's persecution, the first to excommunicate Melitius and Arius, martyred in 311.
- The card: the bishop, bareheaded, in a crimson phelonion and white omophorion with Gospel book and palm; the harbour of Alexandria with the Pharos. **The vision of the Child in the torn tunic** (the Wikipedia fresco; the Painter's Manual's scene) **is left off**, as is the executioner.
- Face after the Painter's Manual ("an old man with a rounded beard"). **Against `cyril_alexandria`** (oblong, high-nosed), `athanasius`, `lucian_antioch`, and Gregory of this batch: Peter is round and full-cheeked with a short, round-tipped nose, large heavy-lidded eyes and a full, rounded grey beard.

## St. Maximus (27 November)

- French Wikipedia (`MaximusFr.txt`): died about 460, a monk of Lérins under St. Honoratus, abbot of Lérins when Honoratus became bishop of Arles (427), bishop of Riez from 433 or 434; known from Faustus of Riez's panegyric and Dynamius's Life. Martyrology (`sb-Massimo.txt`): "Presso Riez nella Provenza, in Francia, san Massimo, padre del cenobio di Lérins dopo sant'Onorato e poi vescovo della Chiesa di Riez." No English Wikipedia article was fetched for him.
- The book: abbot of Lérins after St. Honoratus, famous for gentleness; he fled the see of Fréjus and was compelled to take Riez; died 460, "regretted as the best of fathers".
- The card: the monk-bishop, bareheaded, in an undyed chasuble and narrow pallium with a wooden staff, his hand held out in welcome; the plateau of Riez with its four standing Roman columns and early baptistery.
- **Against `honoratus`** (his abbot, batch 20: domed forehead, small lower face), `willibrord` (square-oval, laughing), `luigi_maria_palazzolo`, `denis`, `leonard_noblac`, Peter of this batch: Maximus is clean-shaven, pear-shaped (narrow temples, wide soft jaw), with a low forehead, a short blunt nose, low straight brows and a quiet smile. The first face written for him (square, with smiling crescent eyes) was changed after comparing it with `willibrord`.

## St. James of La Marca of Ancona (28 November)

- Wikipedia (`James.txt`, `JamesIt.txt`): Domenico Gangala, about 1391 – 28 November 1476, of Monteprandone in the March of Ancona, a student at Perugia, Friar Minor of the Observance, disciple of St. Bernardine, preacher of the Holy Name across Italy and central Europe, papal legate and inquisitor; the Precious Blood dispute of 1462; died at Naples, body now at Monteprandone; canonized 1726; "generally represented holding in his right hand a chalice, out of which a snake is escaping". Martyrology (`sb-Giacomo.txt`): "A Napoli, deposizione di san Giacomo della Marca, sacerdote dell'Ordine dei Minori, insigne per la predicazione e per l'austerità di vita."
- The book: the same; refused the archbishopric of Milan; died ninety years old in 1476.
- The card: the Observant friar holding up a plain golden chalice, the hill town of Monteprandone above the Adriatic. **The serpent is left off.**
- **No portrait from life was found.** Crivelli's panel of 1477 (Louvre) was painted a year after his death, and Italian Wikipedia says Crivelli based it on images of St. Bernardine; its image was not fetched. The face follows Zurbarán (English Wikipedia's lead, `James-large.jpg`): gaunt, long-faced, balding, eyes raised. **Against the Observant preachers** (`bernardine_siena` thin, pointed; `john_capistrano` small, triangular) and `gregory_langres`, `paschal_baylon`, `didacus`, `peter_damian`: James is long and rectangular, bald with a grey ring, with a long heavy nose with a broad, rounded tip, large round eyes lifted, a wide thin mouth and a long, broad chin.

## St. Saturninus (29 November)

- Wikipedia (`Saturninus.txt`, `SaturninusFr.txt`): one of the seven bishops sent to Gaul, probably under Pope Fabian, in the consulate of Decius and Gratus (250–251), first bishop of Toulouse, killed by being tied to a bull. Martyrology (`sb-Saturnino.txt`): "A Tolosa nella Gallia narbonense, ora in Francia, commemorazione di san Saturnino, vescovo e martire, che, come si tramanda, sempre al tempo dell'imperatore Decio, fu tenuto prigioniero dai pagani sulla rocca di questa città e, precipitato giù dalla sua sommità, con la testa frantumata e il corpo interamente straziato rese l'anima a Cristo." Emblems: pastoral staff, palm.
- The book: the same; "I know but one God…"; dragged by the bull down the steps of the capitol.
- The card: the bishop, bareheaded, in a Roman paenula and pallium with staff and palm; Roman Toulouse on the Garonne with the capitol on its rise and a small house-church apart. **No bull, no crowd.**
- **Against `lambert`, `firmin`, `denis`, `germanus_auxerre` and Cornelius (`cornelius_cyprian`)**: Saturninus is a Roman with a long, shield-shaped face, level straight brows, a humped Roman nose, hollow cheeks and a short, dense, cropped black-and-grey beard.

## St. Eligius (1 December)

- Wikipedia (`Eligius.txt`, `EligiusFr.txt`): 588 – 1 December 660, a Gallo-Roman goldsmith at the court of Clotaire II, counsellor of Dagobert I, bishop of Noyon–Tournai from 642; his Life was written by his friend Audoin (St. Ouen). Martyrology (`sb-Eligio.txt`): "A Noyon in Neustria, ora in Francia, sant'Eligio, vescovo, che, orefice e consigliere del re Dagoberto, dopo aver contribuito alla fondazione di molti monasteri e costruito edifici sepolcrali di insigne arte e bellezza in onore dei santi, fu elevato alla sede di Noyon e Tournai, dove attese con zelo al lavoro apostolico."
- St. Ouen's Life, chapter 12 (`eligius-vita.txt`): "He was tall with a rosy face. He had a pretty head of hair with curly locks. His hands were honest and his fingers long. He had the face of an angel and a prudent look."
- The book: the two thrones, the redemption of captives, his delight in shrines for relics; bishop of Noyon; died 665.
- The card: the bishop, bareheaded, in a wine-red bell chasuble, holding up a small gold reliquary set with garnets, a goldsmith's hammer and anvil beside him; Noyon over the Oise.
- Face after St. Ouen's description. **Against `edmund_canterbury`, `hubert`, `polycarp`, `blase`, `remigius`**: Eligius is tall, rosy and clean-shaven, with a long, full oval, a long nose with a raised tip, prudently narrowed hazel eyes and tight chestnut curls. The first face written for him (heart-shaped) was changed after comparing it with batch 39's `edmund_canterbury` and `hubert`.

## St. Bibiana (2 December)

- Wikipedia (`Bibiana.txt`) and the Catholic Encyclopedia (`ce-bibiana.txt`): the Liber Pontificalis records Pope Simplicius (468–483) consecrating her basilica near the "palatium Licinianum"; the Acts, with her father Flavian, her mother Dafrosa and sister Demetria under Julian the Apostate, are legendary. Santi e Beati (`sb-Bibiana.txt`) gives a short summary ("Fu martire durante le persecuzioni di Giuliano l'Apostata… Una chiesa sull'Esquilino ne custodisce la tomba") rather than the Martyrology's words; emblem: palm.
- The book: the same Acts; scourged at a pillar.
- The card: the young Roman in pale rose and grey-blue, leaning on a short marble column with a palm; the Esquiline with an herb garden and her small basilica. **No scourge.**
- Face after Bernini's statue in Santa Bibiana (`BibianaFace.jpg`): a long oval on a long neck, a straight Greek nose, eyes lifted, lips parted. **Against `catherine_alexandria`, `anastasia`, `dorothy`, `margaret_antioch`, `christina_bolsena`, Barbara of this batch.** The Greek profile is shared with batch 39's `theodore_tyro`, a young man.

## St. Barbara (4 December)

- Wikipedia (`Barbara.txt`) and the Catholic Encyclopedia (`ce-barbara.txt`): the Acts are legendary; shown with a tower (and chains); one of the Fourteen Holy Helpers; patroness against lightning and of those who work with explosives. Martyrology (`sb-Barbara.txt`): "A Nicomedia, commemorazione di santa Barbara, che fu, secondo la tradizione, vergine e martire." Santi e Beati's notice: "si tratta, però, di narrazioni leggendarie, il cui valore storico è molto scarso". Emblems: palm, tower.
- The book: shut in a tower by her father Dioscorus, baptized secretly, beheaded by her father, who was struck by lightning.
- The card: the young noblewoman in crimson with a white veil and a thin gold circlet, holding up a chalice with the Host and a palm; a tower with three windows on a hillside. The chalice is her patronage for a good death, which the book's Reflection asks for. **No sword, no lightning, no father.**
- Face after Palma Vecchio's Santa Barbara (Santa Maria Formosa, Venice; `BarbaraPalma.jpg`): tall, full-faced, auburn-haired. **Against `catherine_alexandria`, `margaret_antioch`, `genevieve`, `dorothy`, `ursula`, Bibiana of this batch.**

## Doubts

- **Bibiana and Barbara** rest on legendary Acts; both are kept because both are in the current Martyrology (Barbara expressly "secondo la tradizione") and both chapters are the book's own. Bibiana's Martyrology entry itself was not seen (Santi e Beati shows a summary).
- **James's name** keeps the book's "La Marca of Ancona"; English usage is "James of the Marches". It is a long name for the card.
- **Maximus's name** is the book's bare "St. Maximus"; the see is in the patron line and the id.
- **Felix's excerpt** is the whole Reflection (two sentences), because the first sentence alone breaks the quotation marks.
- **Barbara's patron line** ("Patroness against sudden death") follows the Reflection; "Virgin and martyr" would match Bibiana's.
- Crivelli's James and Palma's Barbara were identified from Wikipedia and Wikimedia Commons; the Crivelli image itself was not fetched (disk space).

## Look-alike risks that remain

- **Gregory against Peter**: two bareheaded Greek bishops in omophorion. Gregory is narrow, balding with a single curl, with a short, curly white beard; Peter round and full with a fuller, rounded grey beard and hair. Reject a round face on Gregory or a narrow one on Peter.
- **Felix against `anthony_abbot` and `athanasius`**: very old men with long white beards. Felix must be long and narrow with drooping brows and downcast hooded eyes, in the white Trinitarian habit.
- **Odo against `edmund_canterbury` and `didacus`**: clean-shaven, tonsured and ascetic. Odo is egg-shaped, widest at the forehead, with a short, upturned nose and round, lowered eyes; reject sharp cheekbones, a hooked nose or a long, thin nose.
- **Maximus against `willibrord` and `luigi_maria_palazzolo`**: kindly, clean-shaven, broad-faced. Maximus has narrow temples, a low forehead and a short blunt nose; reject laughing, creased eyes or a high forehead.
- **James against `bernardine_siena` and `john_capistrano`**: three bald, clean-shaven Observant Franciscans. James is long and rectangular with a heavy, round-tipped nose and eyes lifted; reject a pointed or triangular face.
- **Saturninus against `lambert`**: long-faced, short-bearded bishops. Saturninus narrows at the bottom to a blunt chin and has a humped Roman nose; reject a square jaw.
- **Eligius against `edmund_canterbury`**: reject high, sharp cheekbones or a hooked nose; Eligius is full-cheeked and rosy, with tight curls.
- **Bibiana against Barbara**: two virgin martyrs with palms, two days apart. Bibiana is pale, long-necked, light-brown-haired, eyes lifted, bareheaded, by a column; Barbara broad and full-faced, auburn, veiled and crowned, with the tower and chalice.
