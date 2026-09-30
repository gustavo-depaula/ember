# Batch 38 — the Pictorial Lives, 22 October to 2 November

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 37: `hilarion`, `theodoret_antioch`, `magloire`, `crispin_crispinian`, `evaristus`, `frumentius`, `narcissus_jerusalem`, `marcellus_centurion`, `quintin`, `malachi_armagh`. **No line in this stretch is skipped**: each of the ten is in the current Roman Martyrology (entries quoted below), though several rest on late or legendary Acts (see Doubts). The lines already waiting on a decision are left alone: Vitus, Crescentia and Modestus (15 Jun), Seraphia (3 Sep), Thecla (23 Sep), Cyprian and Justina (26 Sep). The book's other chapters here are carded already: Simon and Jude (28 Oct) `simon_jude`, All Saints (1 Nov) `all_saints`, All Souls (2 Nov) `all_souls`. The next unclaimed line is St. Hubert (3 Nov), for batch 39.

The card data is in `../batches/batch-38.json`. `../consult/batch-38/build.py` writes it from `cards.py` (copied from batch 37's, every output path changed to batch 38 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day, except `nov-02-malachi`, the day's second chapter (the index's 11-02 points at `nov-02-all-souls` and names both);
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but `oct-22-mello` (Mello and Hilarion), in both languages; Hilarion's excerptSource says it has none;
- that `hilarion` shares `oct-22-mello` with `mello` (batch 37) and that no other card uses any of the chapters;
- that no card has a `proper`, and that no sanctoral formulary's title names one of the ten; it lists the formularies on every card's date, on the Martyrology's other days for them (21 Oct Hilarion, 27 Oct Evaristus, 20 Jul Frumentius) and on 3 Nov (Ireland's day for Malachy);
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides; initials and refs.

Consulted material is in `../consult/batch-38/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Hilarion (Byzantine miniature), Theodoret of Antioch (no image), Magloire (en: painting; fr), Crispin and Crispinian (Kalkar statues), Evaristus (en: Sistine Chapel; it: medallion), Frumentius (icon), Narcissus of Jerusalem (window), Marcellus of Tangier (icon with Cassian), Quentin (en: Pontormo; fr: miniature), Malachy (window);
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`); Frumentius was found through a web search (id 75400);
- St. Jerome's *Life of St. Hilarion* (NPNF, New Advent: `jerome-hilarion.txt`): the sackcloth shirt, the cloak of skins St. Antony gave him, the baskets of rushes, the tiny cell;
- St. Bernard's *Life of St. Malachy*, tr. H. J. Lawlor, 1920 (Project Gutenberg 25761: `bernard-malachy.txt`), §43 and §72 on his countenance;
- the Painter's Manual (`../hermeneia-ocr.txt`, line 7404): "Saint Hilarion the Great, an old man with a brown, rush-like beard divided into three points. October 21st." It has nothing for the other nine;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`; the 22 October chapter has none);
- every face line of batches 1–37 and 52–54 (`faces-all.txt`, regenerated for this batch), against which the faces were compared.

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 10-22, 10-23, 10-24, 10-25, 10-26, 10-27, 10-29, 10-30, 10-31, 11-02). Names are the book's, with its pt-BR forms (Santo Hilarião, São Teodoreto, São Maglório, São Crispim e São Crispiniano, Santo Evaristo, São Frumêncio, São Narciso, São Marcelo, o Centurião, São Quintino, São Malaquias). Titles after the name are dropped ("Abbot", "Bishop", "Martyr", "Pope and Martyr"), except **"the Centurion" / "o Centurião"**, an epithet kept like batch 37's "the Confessor". The book's "Malachi" is kept in the name, though English usage is mostly "Malachy". Ids add a place where the bare name is ambiguous: `theodoret_antioch` (not Theodoret of Cyrrhus), `narcissus_jerusalem`, `marcellus_centurion`, `malachi_armagh` (not the prophet). Initials: H, T, M, C, E, F, N, M, Q, M.

**Titles.** None changes: all ten were "St." in the book and are "san/sant'/santi" in the Martyrology (`sb-*.txt`). Malachy was formally canonized (Wikipedia: the first native-born Irish saint to be; the year wasn't checked); the others are of the first millennium. No saint here died after 1930. **Evaristus**: the book calls him "Pope and Martyr", but the Martyrology names him "papa" without the martyr's title (`sb-Evaristo.txt`; English and Italian Wikipedia say the same). The name drops the title either way; his patron line ("Successor of St. Anacletus", from the book) and his card (no palm) don't call him a martyr.

**lifeChapter and reflection.** All ten have their chapter as lifeChapter. Nine chapters tell one life and end with their own `**Reflection**`, which the card gets. **Hilarion shares `oct-22-mello` with Mello** (batch 37), as batch 37 foresaw: the chapter tells both lives and has no Reflection, so his card has none; there is no fallback. **Malachi's chapter `nov-02-malachi`** is the day's second chapter; its Reflection (Our Lord's words to St. Gertrude on freeing souls) belongs to his story of the Masses said for his sister, so it counts as his.

**proper.** None. No formulary in the repo names any of the ten. The formularies on the ten dates belong to other saints or feasts (10-21 Germany's Ursula, 10-22 John Paul II, 10-23 John of Capistrano, 10-24 Anthony Claret, 10-25 Brazil's Frei Galvão, 10-31 Germany's Wolfgang, 11-02 All Souls); nothing on 10-26, 10-27, 10-29, 10-30; on the Martyrology's other days: 07-20 Apollinaris and Germany's Margaret; 11-03 Martin de Porres and Germany's Pirmin. Ireland's 3 November memorial of Malachy is not in the repo.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Magloire (Hebrews 13:7), Crispin and Crispinian, Frumentius, Narcissus, Marcellus, Quintin, Malachi;
  - first sentence: Evaristus ("The disciples of the apostles… seemed no longer inhabitants of this world.");
  - second sentence: Theodoret ("Take care to meditate upon the four last things, and to live in holy fear.").
- From the chapter, where the card has no Reflection of its own: **Hilarion**, his dying words ("Go forth, my soul; why dost thou doubt? Nigh seventy years hast thou served God, and dost thou fear death?").

## St. Hilarion (22 October)

- Wikipedia (`Hilarion.txt`): about 291 – 371, born of pagan parents at Tabatha near Gaza, studied at Alexandria, visited Anthony, hermit near Maiuma for twenty-two years, fled the crowds to Egypt, Sicily, Dalmatia and Cyprus, where he died at eighty; Jerome's *Life* is hagiography, "though there can be no doubt that Hilarion was a historical figure". Martyrology (`sb-Ilarione.txt`), on 21 October: "Nell'isola di Cipro, sant'Ilarione, abate, che, seguendo le orme di sant'Antonio, dapprima condusse vita solitaria vicino a Gaza e fu poi fondatore e modello di vita eremitica in questa provincia."
- The book: the same, "still only in his fifteenth year" a solitary; the dying words.
- The card: the old hermit in sackcloth and Antony's cloak of skins, weaving a rush basket, his reed-and-clay cell in the desert inland from Gaza, the sea far off (Jerome).
- Face after the Painter's Manual: old, with a brown, rush-like beard in three points. **Against the desert fathers** (`anthony_abbot` triangular and hooded, `paul_hermit` long, tapering and bald, `simeon_stylites` small and chiselled with a two-point beard, `john_egypt` elfin, `paphnutius` horse-like, `porphyry_gaza` diamond-shaped, `macarius_alexandria` rounded-square): Hilarion has a convex profile (sloping forehead, long projecting nose, receding chin) and heavy, lowered lids.

## St. Theodoret (23 October)

- Wikipedia (`Theodoret.txt`): priest of Antioch, keeper of the sacred vessels, who went on celebrating when Count Julian (the apostate emperor's uncle) banned the clergy; tortured and beheaded in 362; "His life is recorded only by apologetic works"; relics at Uzès. Martyrology (`sb-Teodoreto.txt`): "Ad Antiochia in Siria, san Teodoreto, sacerdote e martire, che, come si tramanda, fu arrestato dall'empio Giuliano, imperatore d'Oriente… e condotto, infine, al martirio."
- The book: the same, with his prophecy to the Count.
- The card: the priest in a paenula with palm and a chalice, Antioch on the Orontes under Mount Silpius. No ropes or pulleys.
- **Against `lucian_antioch`** (the other Antiochene martyr: short, domed-browed, iron-grey), `cosmas_damian`, `romanus_ostiarius` (joined brows) and `eusebius_rome`: Theodoret's face is bell-shaped, narrow at the brow and wide, angular at the jaw, with a bumped nose and a short, curly black beard.

## St. Magloire (24 October)

- Wikipedia (`Magloire.txt`, `MagloireFr.txt`): "Little reliable information is known… the earliest written sources appeared three centuries after his death"; by the *Vita*, cousin of Samson, bishop of Dol after him, then abbot of sixty-two monks on Sark. Martyrology (`sb-Maglorio.txt`): "Nella Bretagna in Francia, san Maglorio, che, discepolo di sant'Iltuto, si tramanda sia succeduto a san Sansone vescovo di Dol e abbia vissuto in solitudine sull'isola di Sark."
- The book: born in Brittany; with Sampson; bishop after him; resigned at seventy; a monastery of sixty monks **on Jersey** (Wikipedia and the Martyrology: Sark); died about 575.
- The card: the old bishop-abbot in a monk's cowl with a wooden crozier, blessing, on an unnamed rocky Channel island with a few cells.
- Face after the Wikipedia painting (`Magloire.jpg`: high bald forehead, long white beard). **Against the old bishops of the West with white beards** (`mello` dish-profiled and snub-nosed, `david_wales` heavy-browed and broad, `paternus_avranches` shield-shaped, `hilary` trapezoid with a broad beard, `remigius` long and symmetrical): Magloire is tall and narrow, longest between eyes and mouth, bald-domed, with a long, drooping-tipped nose, wide-set pale eyes, large ears and a straight beard tapering to one point.

## Sts. Crispin and Crispinian (25 October)

- Wikipedia (`Crispin.txt`): nobly born Romans who preached at Soissons and made shoes by night, beheaded about 286; "It is stated that they were twin brothers"; removed from the General Calendar after the Council, "still commemorated on that day in the most recent edition of the Roman Church's martyrology"; patrons of shoemakers. Martyrology (`sb-Crispino.txt`): "A Soissons nella Gallia belgica, ora in Francia, santi Crispino e Crispiniano, martiri." Santi e Beati: a sixth-century basilica at Soissons, known to Gregory of Tours; emblems palm and shoes.
- The book: "said to have been nobly born, and brothers" (not twins); the trial before Rictius Varus; the sword, about 287.
- The card: the brothers in leather aprons with a sandal, an awl, a last and palms, in their Soissons workshop with the night lamp (the book's engraving shows the workshop).
- **Kept, not skipped**: the Passio is late, but the Martyrology names them and the cult at Soissons is attested from the sixth century.
- **Against `cosmas_damian`** (the twin brothers: olive, square-jawed and narrower): Crispin is short, flat, broad-nosed and clean-shaven; Crispinian triangular, pale and grey-eyed with a sparse chin beard. They are drawn as different men, not twins.

## St. Evaristus (26 October)

- Wikipedia (`Evaristus.txt`, `EvaristusIt.txt`): bishop of Rome about 99/100 – 107/108; by the Liber Pontificalis a Greek, son of a Jew named Judah of Bethlehem; divided the titles among the priests, ordained seven deacons; buried near St. Peter; the Martyrology lists him without the martyr's title. Martyrology (`sb-Evaristo.txt`), on 27 October: "A Roma, sant'Evaristo, papa, che resse la Chiesa di Roma per quarto dopo il beato Pietro, sotto l'imperatore Traiano."
- The book: successor of Anacletus under Trajan, the titles and the seven deacons, ordinations in December, buried near St. Peter; dies in 112.
- The card: the bishop of Rome in tunic and pallium, bareheaded, with a scroll, the Vatican hill and Trajan's Rome behind. No palm.
- **Against the early popes** (`mark_pope` round and bald, `anicetus` egg-shaped, `soter` heart-shaped, `linus` hexagonal, `cletus` bony with a two-point beard, `clement_i` diamond, `sylvester` long and narrow, `zephyrinus` flat-featured): Evaristus is dominated by a large, arched Levantine nose, hooded down-slanting eyes, a widow's peak of thick wavy grey hair and a square-cut black-and-grey beard.

## St. Frumentius (27 October)

- Wikipedia (`Frumentius.txt`): of Tyre, captured as a boy with his brother Edesius on a voyage (Rufinus), secretary and treasurer to the king of Axum, tutor of the heir Ezana, consecrated by Athanasius first bishop of Axum; died about 383. Martyrology (`sb-Frumenzio.txt`), **on 20 July**: "In Etiopia, san Frumenzio, vescovo, che fu dapprima prigioniero e, ordinato poi vescovo da sant'Atanasio, propagò il Vangelo in questa regione."
- The book: the same, on 27 October.
- The card: the bishop with Gospel book, blessing, the stelae and hills of Axum behind, Aksumite people small in the distance. Edesius and Athanasius are left off.
- Face after the modern icon's colouring (`Frumentius.jpg`: dark hair and full dark beard). **Against `anicetus`** (Syrian: tall and egg-shaped), `severianus_scythopolis` (round, soft), `lucian_antioch` and the Copts `pachomius`, `macarius_alexandria`: Frumentius is wide, low and flat-cheeked, with high-arched thick brows, large prominent eyes and a curved, fleshy-tipped nose.

## St. Narcissus (29 October)

- Wikipedia (`Narcissus.txt`): bishop of Jerusalem from about 180, already old; Eusebius's miracle of water turned to oil at the Easter Vigil; falsely accused, withdrew into solitude, returned, took Alexander as coadjutor. Martyrology (`sb-Narciso.txt`): "Commemorazione di san Narciso, vescovo di Gerusalemme, esemplare per santità, pazienza e fede, che… affermò che il mistero della Risurrezione del Signore non poteva che celebrarsi di domenica e alla veneranda età di centosedici anni passò felicemente al Signore."
- The book: the same; "died in extreme old age, bishop to the last".
- The card: the very old bishop, bareheaded, holding the lit oil lamp of the Paschal vigil, Jerusalem at dusk behind (the Reflection's "in the evening time there is light").
- The very old man is required by the sources. **Against `simeon_jerusalem`** (the other centenarian bishop of Jerusalem: long, hatchet-shaped, long-bearded), `polycarp` (heart-shaped, rosy, full-haired), `paul_hermit`, `theodosius_cenobiarch` and `zephyrinus`: Narcissus is small, round and shrunken, with a fallen-in mouth that brings a small hooked nose and a curving chin close together, and only a short, sparse white beard.

## St. Marcellus the Centurion (30 October)

- Wikipedia (`Marcellus.txt`): a centurion at Tingis (Tangier) who at the emperor Maximian's birthday feast threw off his belt, weapons and vine staff; sentenced by the deputy prefect Aurelius Agricolanus; the notary Cassian refused to record the sentence; relics at León. An "alternative version" making him a centurion of the Legio VII Gemina born at León, with a wife and twelve sons, "has been shown to be largely apocryphal". Martyrology (`sb-Marcello.txt`): "A Tangeri in Mauritania, nell'odierno Marocco, passione di san Marcello, centurione, che nella festa dell'imperatore, mentre tutti sacrificavano agli dei, gettò la cintura militare, le armi e la vita stessa davanti alle insegne…"
- The book: centurion "in the legion of Trajan, then posted in Spain"; sent to Agricolaus; beheaded 30 October 298; Cassian's refusal.
- The card: the centurion unbuckling his belt and sword, his vine staff at his feet, the standards and tents of the camp behind (the book's engraving has the tents and his arms on the ground). **The place is left unnamed**: the book puts the legion in Spain, the Martyrology the passion at Tangier. Cassian is left off.
- **Against the soldier saints** (`victor_marseilles` angular and cleft-chinned, `romanus_ostiarius` long with joined brows, Tarachus of `tarachus_companions` square and broken-nosed, Maurice of `theban_legion`, `george`, `sebastian`): Marcellus is a round, short, thick-necked veteran with an upturned nose, a dimpled chin and a close grizzled beard.

## St. Quintin (31 October)

- Wikipedia (`Quentin.txt`, `QuentinFr.txt`): by his legend a Roman, son of a senator Zeno, missionary to Gaul with Lucian of Beauvais, preached at Amiens, tortured and beheaded at Augusta Veromanduorum (Saint-Quentin) about 287; the Passio (seventh–eighth century) is "rempli de poncifs hagiographiques", though archaeology confirms the age of the cult. Martyrology (`sb-Quintino.txt`): "Nella cittadina in seguito insignita del suo nome… san Quintino, martire, che, senatore, subì la passione per Cristo sotto l'imperatore Massimiano."
- The book: a Roman of senatorial family, with Lucian to Amiens, where he stayed, was imprisoned and tortured; died 31 October 287.
- The card: the young patrician with a palm, preaching at Amiens on the Somme. No nails or wires, though they are the book's.
- **Kept, not skipped**: the Passio is legendary in its details, but the Martyrology names him and the cult is ancient.
- **Against the young men** (`alexander` smooth oval with a fringe, `pancras` a round-faced boy, `victor_marseilles`, `romanus_ostiarius`, the youngest of `forty_martyrs_sebaste`): Quintin is long and rectangular with a flat-bottomed jaw, a high-bridged, slightly hooked nose, deep-set grey-green eyes and tight, fair curls, clean-shaven.

## St. Malachi (2 November)

- Wikipedia (`Malachy.txt`): Máel Máedóc Ua Morgair, 1094 – 2 November 1148, of Armagh, abbot of Bangor, bishop of Connor, archbishop of Armagh, reformer on Roman lines, died at Clairvaux in St. Bernard's arms; the "Prophecy of the Popes" attributed to him is a sixteenth-century forgery (not on the card). Martyrology (`sb-Malachia.txt`): "Nel monastero di Chiaravalle in Burgundia… deposizione di san Malachia, vescovo di Down e Connor in Irlanda, che rinnovò la vita della sua Chiesa e, giunto a Chiaravalle mentre era in cammino per Roma, rese lo spirito al Signore alla presenza dell'abate san Bernardo."
- The book: bishop of Connor, archbishop of Armagh, the Masses for his sister, two pilgrimages to Rome, died at Clairvaux, 2 November 1148, aged fifty-four.
- The card: the archbishop in a green chasuble and low mitre, crozier and blessing, a small stone church on a green Irish hill behind. **No pallium**: the book says he came back from Rome "with the pall for Armagh", which the card doesn't show (Wikipedia doesn't confirm it; not checked further).
- Face after St. Bernard (`bernard-malachy.txt` §43: "neither did sadness darken nor laughter turn to levity the joyousness of his countenance"; §72: his brow unwrinkled, his face not wasted even in death). **Against the Irish cards** (`columba` broad, white-haired, Irish-tonsured; `finbarr` long, flaxen; `fiaker` heart-shaped; `gall` square, snub-nosed; `columban` big-boned) and `oswald_worcester`, `wilfrid`: Malachy is a smooth, unlined oval with a neat, slightly upturned nose, wide-set grey-blue smiling eyes, a small rounded chin, clean-shaven with a Roman tonsure.

## Look-alike risks that remain

- **Magloire against `mello`**: both tall old bishops of the Channel coast with long white beards. Magloire's beard is straight and tapers to one point, his face long and narrow with a bald dome and wide-set eyes; Mello's is dish-profiled with a snub nose and a waving beard. Reject a snub nose or a waving beard on Magloire.
- **Narcissus against Magloire and `simeon_jerusalem`**: all very old. Narcissus must be small, round and shrunken with only a short, sparse beard; reject a long beard on him.
- **Hilarion against `paul_hermit`**: old desert hermits with long noses. Hilarion is not bald, his beard is brown in three points, his eyes lowered; Paul's are wide open and lifted.
- **Crispin and Crispinian against `cosmas_damian`**: reject look-alike brothers; they must differ in age, colouring and bone structure.
- **Evaristus against Theodoret and Frumentius**: three Levantines with dark or grey beards. Evaristus is narrow-chinned with a great arched nose and square-cut beard; Theodoret bell-shaped, wide-jawed, short curly black beard; Frumentius wide, low and flat-cheeked, round full beard.
- **Marcellus against Crispin**: both round-to-wide, short faces. Marcellus is bearded and grizzled, Crispin clean-shaven and black-haired.
- **Quintin against Crispinian**: both young and fair. Quintin is clean-shaven and square-jawed with tight curls; Crispinian triangular with a pointed chin, wavy hair and a chin beard.

## Doubts

- **Hilarion shares `oct-22-mello` with `mello`** and gets no reflection. The brief's rule ("its Reflection is about this saint") is vacuous for a chapter with none; the card follows `mello`'s precedent in batch 37 and sets lifeChapter, so the life links from both cards.
- **Malachi's Reflection** is about praying for the souls in purgatory (St. Gertrude), not about Malachi by name; it is the close of his own chapter and fits his sister's story, so it is taken as his.
- **Kept though resting on late or legendary Acts**, all in the current Martyrology: Crispin and Crispinian (feast removed from the General Calendar), Theodoret ("come si tramanda"; "recorded only by apologetic works"), Magloire (a Vita three centuries late), Quintin (a Passio full of hagiographic commonplaces). If any should be skipped, St. Hubert (3 Nov) and then St. Bertille (5 Nov) are next.
- **Evaristus's martyrdom**: the book's "Pope and Martyr" against the Martyrology's plain "papa"; the card doesn't call him a martyr.
- **Dates that differ from the Martyrology**, the card following the book: Hilarion (21 Oct), Evaristus (27 Oct), Frumentius (20 Jul). The book also has Magloire's island as Jersey where the Martyrology has Sark (the card leaves it unnamed), and puts Marcellus's legion in Spain where the Martyrology has Tangier (unnamed too).
- **Malachy's see**: the book's "Archbishop of Armagh" is the patron line; the Martyrology calls him "vescovo di Down e Connor", the see he held last.
- **"Malachi"** is the book's spelling and is kept; "Malachy" is the usual English form.
- **Patron lines not from the book**: Hilarion "Hermit of Palestine" (the Martyrology), Theodoret "Priest and martyr of Antioch" (the Martyrology), Crispin and Crispinian "Patrons of shoemakers" (Wikipedia), Quintin "Martyr of Picardy" (the book's Amiens in Picardy). From the book: Magloire "Bishop and abbot in Brittany", Evaristus "Successor of St. Anacletus", Frumentius "Bishop of the Ethiopians", Narcissus "Bishop of Jerusalem", Marcellus "A soldier of Jesus Christ", Malachi "Archbishop of Armagh".
- **Attributes not in the book**: Theodoret's chalice (Wikipedia: keeper of the sacred vessels), Hilarion's basket and cloak (Jerome), Frumentius's Axum stelae.
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: St. Antony (Hilarion), St. Athanasius and Edesius (Frumentius), Cassian (Marcellus), Lucian of Beauvais (Quintin) and St. Bernard (Malachi) are left off.
