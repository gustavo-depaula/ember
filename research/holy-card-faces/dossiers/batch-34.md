# Batch 34 — the Pictorial Lives, 16 to 31 August

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 33: `hyacinth`, `liberatus`, `helena`, `agapetus`, `louis_toulouse`, `symphorian`, `philip_benizi`, `zephyrinus`, `fiaker`, `raymund_nonnatus`. No line in this stretch is skipped: no cult here is suppressed, and each of the ten is in the current Roman Martyrology (entries quoted below), though several chapters tell legend (see Doubts). The 15 June line (Sts. Vitus, Crescentia, and Modestus) is still left alone. The book's other chapters here are carded already: the Assumption (15 Aug) `assumption`, Bernard (20) `bernard_clairvaux`, Jane Frances de Chantal (21) `jane_frances_chantal`, Bartholomew (24) `bartholomew`, Louis of France (25) `louis_france`, Joseph Calasanctius (27) `joseph_calasanz`, Augustine (28) `augustine`, the Beheading (29) `beheading_john_baptist`, Rose of Lima (30) `rose_lima`. The next unclaimed line is St. Giles (1 September), left for batch 35.

The card data is in `../batches/batch-34.json`. `../consult/batch-34/build.py` writes it from `cards.py` (copied from batch 33's, every output path changed to batch 34 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day (Fiaker's chapter is the second one on 30 August; the index points at Rose of Lima's);
- that Agapetus has no `lifeChapter` (see below) and that his excerpt is in the chapter he shares with Helena;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Nine of the ten cards' chapters do in both languages. Louis's has none, and his excerptSource says so;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`; it lists the formularies on every card's date and on the Martyrology's other days for them (15 Aug, 2 Jul, 20 Dec);
- that every word of each pt-BR name appears in the chapter title, except "Toulouse", added to Louis's name, which must appear in the chapter;
- that Helena's face is the `recurring-figures.md` line word for word;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides and that no other card uses the chapter; initials and refs.

Consulted material is in `../consult/batch-34/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Hyacinth of Poland (en, pl), Helena, Agapitus of Palestrina, Louis of Toulouse (en: Simone Martini's Assisi fresco; fr: Vivarini), Symphorian (en: Ingres; fr), Philip Benizi, Pope Zephyrinus (en, it), Saint Fiacre, Raymond Nonnatus (lead image, and `RaymundLarge.jpg`/`RaymundCrop.jpg`, the Camón Aznar canvas at full size), the Mercedarians (the habit), and Saint Giles as the reserve. English Wikipedia has no page on Liberatus and his companions;
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`, including 15 Aug for Hyacinth, 2 Jul for Liberatus and 20 Dec for Zephyrinus);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`: Dominic, Thomas Aquinas, Vincent Ferrer, Raymund of Penyafort, the Servite founders, Louis of France, Bonaventure, Anthony of Padua, Pancras, Callistus, Fabian, Columban, Sixtus II). Cards of batches 18–33 are not yet in `content/saints/`, so they are compared through their face lines;
- every face line of batches 1–33 and 52–54 (`faces-all.txt`, regenerated for this batch).

`fetch.sh` is the fetcher, `list.txt` and `list2.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 08-16, 08-17, 08-18 twice, 08-19, 08-22, 08-23, 08-26, 08-30, 08-31). Names are the book's, with its pt-BR forms (São Jacinto, São Liberato e Seis Monges, Santa Helena, Santo Agapito, São Luís, São Sinforiano, São Filipe Benício, São Zeferino, São Fiacro, São Raimundo Nonato). Titles after the name are dropped ("Abbot", "Martyrs", "Empress", "Bishop", "Pope and Martyr", "Anchorite"). One name is extended because the book's bare name collides with another card:
- **"St. Louis of Toulouse" / "São Luís de Toulouse"**: `louis_france` (25 Aug) is "St. Louis of France". "Toulouse" is in both chapters, and the Martyrology names the see ("sede di Tolosa").

Liberatus's card is "St. Liberatus and Six Monks" / "São Liberato e Seis Monges", the book's name without its titles, as batch 33 did with "St. Cyriacus and His Companions". Fiaker keeps the book's English spelling (Wikipedia and the Martyrology: Fiacre, Fiacrio).

Initials: H, L, H, A, L, S, P, Z, F, R.

**Titles.** None changes. All ten were "St." in the book and still are: Hyacinth (canonized 1594 per the Polish Wikipedia), Louis (canonized 1317, Wikipedia), Raymund (canonized 1657, Wikipedia), Philip Benizi, and six saints of the first millennium with an immemorial cult. **Zephyrinus's patron line is "Pope", not the book's "Pope and Martyr"**: the Martyrology keeps him on 20 December as "san Zefirino, papa" (`sb-Zefirino.txt`), and Wikipedia says the 26 August feast was removed in 1969 "since he was not a martyr". The book itself says he "perhaps did not die by the executioner". No saint here died after 1930.

**lifeChapter and reflection.** Nine cards have their own chapter as lifeChapter. The card's reflection is the chapter's own `**Reflection**` paragraph, for eight of them. Louis's chapter has no Reflection, so his card has none; there is no fallback, and the index has none for 08-19.

**Agapetus has no lifeChapter.** His life is the fourth paragraph of `aug-18-helena`, a chapter headed with both names, and its Reflection is about Helena ("St. Helena thought it the glory of her life to find the cross…"). The corpus build (`scripts/build-corpus.py`, `_life_reflection`) copies a chapter's Reflection onto every card that names it, so a lifeChapter would give his card Helena's reflection. The research brief counts a two-life chapter only if its reflection is about the saint. His card therefore has no lifeChapter and no reflection; `helena` has the chapter. See Doubts.

**proper.** None. No sanctoral formulary in the repo is proper to any of the ten. The title hits are namesakes: `sanctorale.01-07` (Raymund of Penyafort), `sanctorale.05-09.france` (Louise de Marillac, French only), `sanctorale.06-21` (Aloysius Gonzaga, "São Luís Gonzaga"), `sanctorale.08-25` (Louis of France). The formularies on the ten dates belong to other saints: 08-16 Stephen of Hungary (and an untitled Argentine formulary with readings but no collect); 08-18 Africa Victoria Rasoamanarivo, Chile Alberto Hurtado; 08-19 John Eudes (Spain: Ezequiel Moreno); 08-22 the Queenship of Mary; 08-23 Rose of Lima; 08-26 Argentina Ceferino Namuncurá, France Caesarius of Arles, Spain Teresa Jornet; 08-30 Argentina Rose of Lima; 08-31 German-speaking Paulinus of Trier. Nothing is on 17 Aug, and nothing for Hyacinth on 15 Aug (the Assumption vigil), Liberatus on 2 Jul or Zephyrinus on 20 Dec.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Hyacinth;
  - first sentence: Helena, Philip Benizi;
  - first clause of the first sentence: Zephyrinus ("God has always raised up holy pastors zealous to maintain the faith of His Church inviolable.");
  - the main clause of the last sentence: Symphorian ("We must choose as St. Symphorian chose, and obey God rather than man.");
  - the Scripture it quotes: Liberatus (from "if as a Christian"), Fiaker (the words of St. Paul, "If any man will not work, neither let him eat."), Raymund ("He that giveth to the poor shall not want.").
- From the chapter, where the card has no Reflection:
  - **Louis**: the second sentence of the fourth paragraph ("His modesty, mildness, and devotion inspired a love of piety in all who beheld him.");
  - **Agapetus**: the second sentence of his paragraph ("His name is famous in the ancient calendars of the Church of Rome.").

## St. Hyacinth (16 August)

- Wikipedia (`Hyacinth.txt`, `HyacinthPl.txt`): Jacek Odrowąż, c. 1185 – 15 August 1257, received the habit from Dominic in 1220 and was sent back to found the Order in Poland and Kiev. The wide travels (Sweden, Norway, Scotland, Russia, Greece) "are heavily disputed and are not supported by the earliest hagiographies". The Kiev miracle of the ciborium and the Marian statue is under "Legend". Martyrology (`sb-Giacinto.txt`), on 15 August: "A Cracovia in Polonia, san Giacinto, sacerdote dell'Ordine dei Predicatori, che fu designato da san Domenico a propagare l'Ordine in quella nazione…".
- The book: the same outline, with the travels, the Kiev miracle (the ciborium, the alabaster statue "light as a reed", walking dry-shod over the Dnieper) and his death on the Assumption. The engraving shows him with the ciborium and the statue amid the flames of Kiev.
- The card shows the book's miracle, calmly: the friar with the ciborium and the small alabaster Virgin, walking on the Dnieper below Kiev, no Tartars or fire. It holds a ciborium, as the book says, not the monstrance of later paintings (Wikipedia notes monstrances are anachronistic). The statue is a carved image, so the recurring Our Lady face does not apply.
- **Against the Dominicans** (`dominic`, `thomas_aquinas`, `vincent_ferrer`: long full oval; `peter_verona`: compact, dark, brows meeting; `raymund_penyafort`: shield-shaped with a white beard; `antoninus_florence`: domed, bald; `albert_great`: heavy, jowled) and `john_kanty`, `stanislaus` (Poles): Hyacinth is an oblong, flat-topped face with high, rounded Slavic cheekbones, a short upturned nose, small pale-blue eyes and a cleft chin, fair.

## St. Liberatus and Six Monks (17 August)

- Martyrology (`sb-Liberato.txt`), on 2 July: "Commemorazione dei santi martiri Liberato, abate, Bonifacio, diacono, Servio e Rustico, suddiaconi, Rogato e Settimo, monaci, e il fanciullo Massimo: a Cartagine… sotto il re ariano Unnerico… uccisi a colpi di remi sul capo mentre erano inchiodati a legni su cui si era tentato di bruciarli". English Wikipedia has no article.
- The book: Huneric's edict, the seven monks of a monastery near Capsa in Byzacena summoned to Carthage, the boy Maximus who would not be parted from his abbot, the ship that would not burn, their death by oars in 483. The engraving shows the seven in the boat.
- **The book's 17 August against the Martyrology's 2 July**: the card follows the book. The book calls all seven monks; the Martyrology gives Boniface as deacon and Servus and Rusticus as subdeacons. The card shows all in monastic dress.
- The card shows the seven standing on the shore at Carthage, with the old boat drawn up behind, no fire and no oars.
- **Seven faces**, described one by one. Against `seven_brothers` (the other seven-figure card of boys and men): Maximus is the darkest-skinned, with a soft oval face, a broad nose and short tight curls, not the triangular, big-eared Vitalis or the chubby Martialis. Liberatus is a boxy head with a Roman nose and a square-cut white beard, apart from the long white beards of `peter_damian` and `romuald`.

## St. Helena (18 August)

- Wikipedia (`Helena.txt`): mother of Constantine, the pilgrimage to Palestine, the finding of the Cross by tradition. Martyrology (`sb-Elena.txt`): "A Roma sulla via Labicana, santa Elena, madre dell'imperatore Costantino, che si adoperò con singolare impegno nell'assistenza ai poveri…".
- The book: her British birth (as it says, "disputed"), her conversion late in life, the pilgrimage "in her eightieth year", the finding of the three crosses and the healing that told the true one, Constantine's vision, her death in 328. The engraving shows her standing crowned beside a tall upright cross.
- **Recurring figure.** Helena is already on `discovery_cross` (batch 18), and `recurring-figures.md` has her face; the card uses it word for word, and the checker compares them. `recurring-figures.md` now names her card (`helena`, batch 34); no other change.
- The card follows the engraving: Helena alone, the upright cross in her arm and the three nails in her hand, before the basilica rising on Calvary. It avoids the finding scene of `discovery_cross` (no pit, no three crosses, no sick woman, no Macarius).

## St. Agapetus (18 August)

- Wikipedia (`Agapetus.txt`): martyred perhaps in 274; "according to his legend", a sixteen-year-old perhaps of the noble Anicia family of Palestrina, thrown to beasts that would not touch him, then beheaded. The latest editions of the Martyrology give only: "In Palestrina, Lazio, Saint Agapitus, martyr." (`sb-Agapito.txt`: "A Palestrina nel Lazio, sant'Agapíto, martire.") A basilica in his honour by Felix III.
- The book: one paragraph at the end of Helena's chapter: a youth martyred at Praeneste under Aurelian about 275, famous in the old Roman calendars, with churches at Palestrina.
- The card shows the youth alone before Palestrina, with the palm; the toga praetexta and bulla of a freeborn boy show his noble family (from the legend, not the book). No beasts, no arena.
- **Against the other boy martyrs** (`pancras`: round, curly; `venantius_camerino`: wide, flat, fringe; the Celsus of `nazarius_celsus`: short, wide, bowl fringe; `seven_brothers`: Martialis chubby, Vitalis triangular and big-eared, Philip heart-shaped at twenty with a first moustache), and the young deacon Agapitus of `sixtus_ii` (a man of thirty, rectangular, cleft chin, black hair — a different saint of the same name): Agapetus is a fair heart-shaped face with large grey eyes and straight light-brown hair.

## St. Louis of Toulouse (19 August)

- Wikipedia (`Louis.txt`, `LouisFr.txt`): 9 February 1274 – 19 August 1297, second son of Charles II of Naples and Mary of Hungary, great-nephew of St. Louis IX; a hostage in Catalonia for seven years, renounced the crown for his brother Robert, a Franciscan, consecrated Bishop of Toulouse on 5 February 1297, dead at Brignoles at twenty-three; canonized 1317. Iconography: "a young bishop, usually wearing a brown or grey Franciscan habit under his cope… decorated with the French fleur-de-lys. Sometimes there is a discarded crown by his feet." Simone Martini's Naples altarpiece was commissioned by Robert. Martyrology (`sb-Ludovico.txt`): "Presso Brignoles… transito di san Ludovico, vescovo, che, nipote del re san Luigi… fu elevato alla sede di Tolosa".
- The book: the same, and "the archbishopric of Toulouse". **Toulouse was a bishopric then** (Wikipedia and the Martyrology), so the patron line is "Bishop of Toulouse", following the book's own heading "Bishop". The card shows no archbishop's pallium. The chapter has no Reflection.
- Face after Simone Martini's Assisi fresco (`Louis.jpg`), painted within about twenty years of his death: pale, the face wider at the jaw than the brow, a long straight nose, small narrow heavy-lidded eyes, a small mouth, a thick neck.
- **Against `louis_france`** (his great-uncle, whose card is a long, narrow oval with a fine nose and light-blue eyes): Louis of Toulouse is broad in the jaw, with small, narrow grey eyes, and young and beardless. Against `stanislaus` (pear-shaped bishop, dark, about fifty) he is twenty-three and pale.

## St. Symphorian (22 August)

- Wikipedia (`Symphorian.txt`, `SymphorianFr.txt`): "According to a legendary passio of St. Benignus of Dijon", a young noble of Autun who would not honour the goddess's procession, flogged and put to death about 178; his mother, "the Blessed Augusta", called to him from the city wall. Patron of Autun; a church over his grave by Bishop Euphronius (died 490). Martyrology (`sb-Sinforiano.txt`): "A Autun nella Gallia lugdunense… san Sinforiano, martire, che, mentre era condotto al supplizio, dal muro della città fu ammonito dalla madre con queste parole: «Figlio, figlio, Sinforiano, tieni a mente il Dio vivo…»".
- The book: the procession of Ceres, "My name is Symphorian; I am a Christian!", the hammer for the idol, the prison, death by the sword, the mother on the walls. The engraving shows him led out with the mother at the gate.
- The card shows him walking out of the gate with the palm, the mother small on the wall. Her name, Augusta, is from Wikipedia; the book does not name her.
- **Against `tiburtius_susanna`** (Tiburtius square-faced, snub-nosed, chestnut), `pantaleon` (olive, curly, long smooth face), `casimir` (long chestnut hair), `pancras`: Symphorian is fair and blond, long-jawed with a deep square chin and a thin, high-bridged aquiline nose.

## St. Philip Benizi (23 August)

- Wikipedia (`Benizi.txt`): 15 August 1233 – 22 August 1285, born in Florence, a lay brother of the Servites made priest, General from 1267, the crisis after Lyons II, died at Todi in the Octave of the Assumption. Feast 23 August. Martyrology (`sb-Benizi.txt`), on 22 August: "A Todi in Umbria, san Filippo Benizi, sacerdote fiorentino, che, uomo di insigne umiltà e propagatore dell'Ordine dei Servi di Maria, considerava Cristo crocifisso l'unico suo libro."
- The book: the same, with the vision of Our Lady, the flight from the papal throne, the gift of tongues at Lyons, and his penitent death. The engraving shows him as a friar with a plough and oxen.
- The card: the Servite with a crucifix held as a book (the Martyrology's words), the tiara set aside (the book's refusal of the papacy), Florence below.
- Face: the only picture on Wikipedia (`Benizi.jpg`, a detail of a Renaissance painting, not from life) shows a round, fleshy face with a large nose; the card keeps that and gives him a full tonsure ring, not a bald dome.
- **Against `servite_founders`** (seven faces; Bonfilius broad and square with a beard, Bonajuncta round with a snub nose and beard, Amadeus bald and rectangular), `albert_great` (square, jowled, keen small grey eyes, old), `antoninus_florence` (domed, bald, short face): Philip is a soft, round, clean-shaven face with a large aquiline nose hooked at the tip and small, down-slanting eyes.

## St. Zephyrinus (26 August)

- Wikipedia (`Zephyrinus.txt`, `ZephyrinusIt.txt`): pope 199 – 20 December 217, a Roman, succeeded by his adviser Callistus; fought the Theodotians; the 26 August feast as "Pope and Martyr" removed in 1969 "since he was not a martyr and 26 August is not the anniversary of his death". Martyrology (`sb-Zefirino.txt`), on 20 December: "A Roma accanto al cimitero di Callisto sulla via Appia, deposizione di san Zefirino, papa, che governò per diciotto anni la Chiesa di Roma e diede mandato al suo diacono san Callisto di costruire il cimitero della Chiesa di Roma sulla via Appia."
- The book: pope from 202, the persecution of Severus, Tertullian's fall, "the principal defender of Christ's divinity", died 219, possibly not by the executioner. **The book's dates (202–219) differ from Wikipedia's (199–217)**; the card shows no dates.
- The card shows the pope teaching on the Via Appia at the mouth of the cemetery he had Callistus make, without tiara or mitre (as `stephen_i`), and without a palm.
- Face: no likeness. The engraving's long white beard is kept; the structure is flat and broad (flat, low-bridged nose, low bulging brow, tufted brows flaring up at the ends).
- **Against `callistus`** (his deacon: wide, rectangular, Roman fringe, square black-and-grey beard), `pontian_hippolytus` (Pontian round, dark-bearded), `soter` (heart-shaped, silver beard), `anicetus` (tall, egg-shaped, long black beard), `felix_i` (broad, curly), `fabian` and `stephen_i` (clean-shaven, long), `peter_damian`, `romuald` and `paul_hermit` (other long white beards: long, hook-nosed faces): Zephyrinus's flat, broad nose and flaring brows set him apart.

## St. Fiaker (30 August)

- Wikipedia (`Fiacre.txt`): Fiacre of Breuil, c. 600 – 18 August 670, an Irish priest and hermit who went to France; Bishop Faro of Meaux gave him land at Breuil (now Saint-Fiacre, Seine-et-Marne) for a hermitage, a garden, an oratory of the Virgin and a hospice; "the patron saint of gardeners". The lead image is a window at Bar-le-Duc with a spade. Martyrology (`sb-Fiacrio.txt`), on 30 August: "A Breuil sempre nel territorio di Meaux, san Fiacrio, eremita, che originario dell'Irlanda, condusse vita solitaria." Santi e Beati adds that almost nothing is known of his life.
- The book: the same outline, his exclusion of women from the enclosure, and Chillen's visit. The engraving shows him in his garden with a spade before the oratory. **Wikipedia gives his death as 18 August; the book and the Martyrology keep him on 30 August.** The card follows the book.
- The card shows him in his garden with the spade, the cell and the oratory of Our Lady in the forest.
- **Against `columban`** (long, big-boned, jutting chin, red-grey) and **`columba`** (broad, clean-shaven, white hair), the other Irish monks with the ear-to-ear tonsure: Fiaker is heart-shaped, narrow at the chin, with a short, pointed dark-brown beard, a knobbed nose tip and small, close-set eyes.

## St. Raymund Nonnatus (31 August)

- Wikipedia (`Raymund.txt`): 1204 – 31 August 1240, a Catalan Mercedarian, trained by Peter Nolasco, ransomed captives in Valencia and Algiers and gave himself as a hostage in Tunis; the padlock through his lips is "a legend"; the cardinalate "resulted from a confusion" with Robert Somercote (Paravicini Bagliani), and "Raymond was never a cardinal". Canonized 1657. Patron of childbirth, midwives and pregnant women. Martyrology (`sb-Raimondo.txt`): "A Cardona in Catalogna, san Raimondo Nonnato… si tramanda che abbia molto patito in nome di Cristo per la liberazione dei prigionieri."
- The book: his shepherd youth, profession under Nolasco, the ransom and hostage at Algiers, the bastinado, the cardinalate from Gregory IX, his death at Cardona at thirty-six. The engraving shows him among captives in a North African street.
- The card shows him in the white Mercedarian habit (Wikipedia, `Mercedarians.txt`: the white habit and the cross of Barcelona cathedral on it) with the small red-and-gold shield on his breast as in the Camón Aznar canvas (`RaymundCrop.jpg`), a palm and opened fetters, before Algiers. **No cardinal's red and no padlock**: the one is disproved, the other legend (and would be a wound).
- **Against `romanus_ostiarius`** (long, narrow, single brow, dense black beard), `francis_caracciolo` (long, soft, receding hair, rounded beard), `william_montevergine` (broad flat cheekbones, thick beard high on the cheeks), `john_fagondez` (jaw broader than forehead, clean-shaven): Raymund is a short, broad face with a wide, gently bulging forehead, thick arched brows, a short high-bridged nose and a round, prominent chin, with a close black beard.

## Look-alike risks that remain

- **Louis of Toulouse against `louis_france`**: reject a long, narrow oval or light-blue eyes; he is broad in the jaw with small, narrow grey eyes.
- **Philip Benizi against `albert_great` and `antoninus_florence`**: reject a square jaw or a bald dome; he has a thick tonsure ring, a soft round face and a large hooked nose.
- **Zephyrinus against the white-bearded elders** (`romuald`, `peter_damian`, `paul_hermit`) and against `callistus`: reject a long, hook-nosed face or a short square beard; his nose is flat and broad.
- **Agapetus against the Philip of `seven_brothers`** (also heart-shaped, but twenty, wavy brown hair, a moustache): reject a moustache or waves; he is a boy of fifteen with straight light-brown hair.
- **Liberatus's seven**: reject repeated faces; Maximus must not become the chubby Martialis.
- **Helena against `discovery_cross`**: the face must match (it is the same woman); the scene must not repeat the finding.
- **Fiaker against `columban`**: reject a jutting chin or red hair.
- **Hyacinth** against the other Dominicans: reject a dark or bearded friar (Carracci's type); he is fair and clean-shaven.

## Doubts

- **Agapetus's lifeChapter.** Omitted, so his card has no reflection and does not open the life in the book, although the chapter (`aug-18-helena`) tells it in one paragraph. Setting it would put Helena's Reflection on his card. Alternatives: set it anyway (the card shows Helena's reflection), or change the corpus build to skip the Reflection for a card whose chapter is headed by another saint.
- **Legendary material, lines kept.** None of these cults is suppressed; each saint is in the current Roman Martyrology. But:
  - **Hyacinth**: Wikipedia files the Kiev miracle under "Legend" and calls the wide travels "heavily disputed". The card paints that miracle, because it is the book's scene and his universal image.
  - **Symphorian**: his story comes from "a legendary passio" (Wikipedia); the Martyrology keeps the mother's cry, which the card shows.
  - **Agapetus**: all but his name, Palestrina and his martyrdom is legend; the book tells only that much.
  - **Raymund Nonnatus**: the book's cardinalate is disproved and the padlock is legend. The card shows neither.
- **Dates that differ from the Martyrology**, the card following the book as the brief says: Hyacinth (Martyrology 15 Aug), Liberatus (2 Jul), Philip Benizi (22 Aug), Zephyrinus (20 Dec). Fiaker's day agrees with the Martyrology, though Wikipedia dates his death 18 August.
- **Zephyrinus's patron line** drops "Martyr" (Martyrology and Wikipedia).
- **The added name "of Toulouse"** keeps Louis apart from `louis_france`. Alternative: the book's bare "St. Louis", with the distinction in the id only.
- **Patron lines from Wikipedia, not the book**: Fiaker "Patron of gardeners", Raymund "Patron of expectant mothers" ("Padroeiro das gestantes"). The book's own titles would be "Anchorite" and none.
- **Liberatus's companions' roles** (deacon, subdeacons) are the Martyrology's; the book calls them all monks, and the card dresses them so.
- **`recurring-figures.md`**: only the note under St. Helena changes, to name her card. No new recurring figure: the alabaster Virgin that Hyacinth carries is a statue.
