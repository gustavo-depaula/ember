# Batch 41 — the Pictorial Lives, 5 to 19 December

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 40: `sabas`, `leocadia`, `eulalia_merida`, `valery`, `finian_clonard`, `nicasius`, `mesmin`, `olympias`, `gatian`, `nemesion`. **No line in this stretch is skipped.** Nine are in the current Roman Martyrology (entries quoted below); Nemesion's entry was not found (see Doubts). The lines already waiting on a decision are left alone: Vitus, Crescentia and Modestus (15 Jun), Seraphia (3 Sep), Thecla (23 Sep), Cyprian and Justina (26 Sep). The book's other chapters here are carded already: Nicholas (6 Dec) `nicholas`, Ambrose (7) `ambrose`, the Immaculate Conception (8) `immaculate_conception`, Damasus (11) `damasus`, Lucy (13) `lucy`, Eusebius (16) `eusebius_vercelli`. The next unclaimed line is St. Philogonius (20 Dec), for batch 42.

The card data is in `../batches/batch-41.json`. `../consult/batch-41/build.py` writes it from `cards.py` (copied from batch 39's, every output path changed to batch 41 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but `dec-05-sabas` and `dec-12-valery`, in both languages; those cards' excerptSources say so;
- that no other card uses any of the ten chapters, except that `valery` and `finian_clonard` share `dec-12-valery`, which tells both lives (declared in `shared_in_batch`);
- that no card has a `proper`, listing every sanctoral formulary whose title names one of the ten and the formularies on every card's date and on the Martyrology's other days for them (1 April Valery, 25 July Olympias);
- that every word of each pt-BR name appears in the chapter title (accent-folded);
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides, including batch 40's; initials and refs.

Consulted material is in `../consult/batch-41/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Sabbas the Sanctified (icon with scenes), Leocadia (en: her crypt; es: engraving, "Verdadero Retrato de Sta. Leocadia", 1770), Eulalia of Mérida (en: statue in the cathedral; es: painting), Walaric (en: his apparition to Hugh Capet; fr `ValeryFr`, "Valery de Leuconay"), Finnian of Clonard (statue at Clonard), Nicasius of Rheims (en: window of his martyrdom; fr: the portal statue at Rheims), Maximin de Micy (fr `MesminFr`: window at Saint-Mesmin; the English title fetched nothing), Olympias the Deaconess (icon), Gatianus of Tours (en and fr: window at La Celle-Guenand), Nemesion (Spinello Aretino, 1385; Commons metadata in `commons-Nemesion.txt`);
- Santi e Beati pages with the current Roman Martyrology entry for nine of them (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`, including 04-01, 07-25 and 09-10);
- the Painter's Manual (`../hermeneia-ocr.txt`, line 7396): "Saint Sabbas, an old man with a beard divided into two points and his chin badaros (5)… December 5th." The footnote glossing "badaros" was not found in the OCR, so only the divided beard is used. It has nothing for the other nine;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- every face line of batches 1–39 and 44–54 (`faces-all.txt`), and batch 40's from `../batches/batch-40.json` (written while this batch was in progress), against which the faces were compared.

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets (run with `research/holy-card-faces/.venv/bin/python`).

**Dates, names, initials.** Feasts follow the book (index days 12-05, 12-09, 12-10, 12-12, 12-12, 12-14, 12-15, 12-17, 12-18, 12-19). Names are the book's, with its pt-BR forms (São Sabas, Santa Leocádia, Santa Eulália, São Valério, São Finiano, São Nicásio, São Mesmin, Santa Olímpia, São Gaciano, São Nemésio). Titles after the name are dropped ("Abbot", "Virgin, Martyr", "Bishop", "Widow", "Martyr"), and Nicasius's "and his Companions" with them: the card shows him alone, as `eustachius` (batch 36) shows Eustachius alone. The book's spellings are kept where English usage differs: "Sabas" (Wikipedia "Sabbas"), "Valery" ("Walaric"), "Finian" ("Finnian"), "Mesmin" (the Martyrology's "Maximinus"). Ids add a place where the bare name is ambiguous: `eulalia_merida` (not Eulalia of Barcelona), `finian_clonard` (not Finnian of Moville). Initials: S, L, E, V, F, N, M, O, G, N.

**Titles.** None changes: all ten were "St." in the book; nine are "san/sant'/santa" in the Martyrology (`sb-*.txt`). No saint here died after 622.

**lifeChapter and reflection.** All ten have their chapter as lifeChapter. Eight chapters end with their own `**Reflection**`, which the card gets. **Sabas's chapter `dec-05-sabas` has no Reflection**, so his card has none. **Valery and Finian share `dec-12-valery`**, which tells the two lives one after the other and has no Reflection, so neither card has one; this follows batch 36 (`firmin`, `finbarr`). There is no fallback.

**proper.** None. No formulary in the repo with en-US or pt-BR collect text names any of the ten. Spain's `sanctorale.12-10.spain` ("Santa Eulalia de Mérida, virgen y mártir") has a Spanish collect only, so by the rule it is not set; its calendar entry `content/of-data/calendar/sanctorale/12-10/spain.json` is the only OF calendar entry naming any of the ten. The formularies on the ten dates belong to other saints or feasts (12-05 Germany's Anno, 12-09 Juan Diego, 12-10 Our Lady of Loreto, 12-12 Our Lady of Guadalupe, 12-14 John of the Cross; on the Martyrology's other days, 07-25 St. James); nothing on 12-15, 12-17, 12-18, 12-19 or 04-01.

**Excerpts.**
- From the saint's own Reflection, the whole of it: Leocadia, Eulalia (Acts 5:41), Nicasius, Mesmin, Olympias (Matthew 6:19–20), Gatian, Nemesion.
- From the chapter, where the card has no Reflection:
  - **Sabas**: third paragraph, second sentence ("He was at first unwilling to consent, but finally founded a new monastery of persons all desirous to devote themselves to praise and serve God without interruption.");
  - **Valery**: the last sentence of his paragraph ("Saint Valery went to receive the recompense of his happy perseverance on the 12th of December in 622.");
  - **Finian**: the fourth sentence of his paragraph ("In the love of his flock and his zeal for their salvation he was infirm with the infirm, and wept with those that wept.").

## St. Sabas (5 December)

- Wikipedia (`Sabas.txt`): 439–532, a Cappadocian Greek, son of the military commander John, born at Moutalaske near Caesarea; hermit in a cave, founder of the Great Lavra in the Kidron valley (484), Mar Saba. Martyrology (`sb-Saba.txt`): "Vicino a Gerusalemme, san Saba, abate, che, nato in Cappadocia, raggiunse il deserto di Giuda in Palestina, dove istituì una nuova forma di vita eremitica in sette monasteri, che ebbero il nome di laure… lottando strenuamente in difesa della fede calcedonese."
- The Painter's Manual: an old man with a beard divided into two points (above).
- The book: born 439 near Caesarea, a monk at eight, in St. Euthymius's monastery at eighteen, a cave above the brook Cedron, priest at fifty-three, Superior-General of the anchorites of Palestine, died at ninety-four.
- The card: the old abbot in a dark mantle with a staff and scroll, the cliffs and caves of the Cedron gorge behind. No lion.
- **Against `theodosius_cenobiarch`** (the other Cappadocian cenobiarch of Judaea: bald, broad, flat), **`john_silent`** (his disciple: broad-templed, hump-nosed), `hilarion`, `john_climacus`, `anthony_abbot`: Sabas has a tall oval face, thick white hair brushed back, a chiselled, slightly hooked nose tip, keen grey eyes under arched brows, hollow cheeks and a long white beard forked into two points.

## St. Leocadia (9 December)

- Wikipedia (`Leocadia.txt`, `LeocadiaEs.txt`): virgin martyr of Toledo under Dacian, died in prison; patroness of Toledo. Martyrology (`sb-Leocadia.txt`): "A Toledo in Spagna, santa Leucadia, vergine e martire, insigne per la sua testimoniaza di fede in Cristo." Santi e Beati's notice: "Esistono poche notizie su di lei"; the passio is of the mid-seventh century.
- The book: taken by Dacian in 304; hearing of Eulalia's martyrdom, she prayed to be united with her; died in prison; patroness of Toledo.
- The card: a young woman in white and dusty blue, palm and small cross, eyes lifted, Toledo on its hill above the Tagus. No prison.
- **Against `eulalia_merida`** (next card: a narrow, bold child) and the Spanish virgin Engratia of `saragossa_martyrs` (long oval, square-tipped chin, strong nose), `margaret_antioch`, `christina_bolsena`, `julia_corsica` and batch 40's `barbara`: Leocadia is a soft, wide, heart-shaped young woman with full cheeks, a short rounded nose and heavy-lidded eyes lifted in longing.

## St. Eulalia (10 December)

- Wikipedia (`Eulalia.txt`, `EulaliaEs.txt`): martyred at Mérida under Diocletian at about twelve or thirteen; Prudentius: "as she expired a dove flew out of her mouth", and "a miraculous snow" covered her; Spanish Wikipedia: her usual emblems are the palm and a small oven, and the dove is "compañera inseparable". Martyrology (`sb-Eulalia.txt`): "A Mérida in Spagna, santa Eulalia, vergine e martire, che, come si tramanda, ancor giovane, non esitò a offrire la propria vita per testimoniare la fede in Cristo."
- The book: twelve years old; she rebuked the judge Dacianus, threw down the idol, was torn with hooks and burned.
- The card: a child in a white tunic and rose-red mantle with a palm and a white dove, Mérida's Roman bridge and aqueduct under a light snow. No torments.
- **Against `leocadia`**, `christina_bolsena` (the other child martyr: inverted triangle, upturned nose), `margaret_antioch`, Engratia, `maria_goretti` and batch 40's `bibiana` (a young woman, long oval, Greek nose): Eulalia has a long, narrow oval face, a short, slender straight nose, bold almond eyes under straight brows and a firm small mouth; long straight black hair with a white band.

## St. Valery (12 December)

- Wikipedia (`Valery.txt`, `ValeryFr.txt`): Walaric, 565 – 619, a shepherd's son of the Auvergne, monk at Auxerre, then at Luxeuil under St. Columban; founder of Leuconay at the mouth of the Somme (Saint-Valery-sur-Somme). Martyrology (`sb-Valerico.txt`), on 1 April: "A Lauconne presso Amiens in Francia, san Valerico, sacerdote, che attrasse non pochi compagni alla vita eremitica." Santi e Beati's notice: "Magro e di alta statura, era severo con se stesso, ma mite con il prossimo"; he learned his letters on wooden tablets while tending the flock; he asked to be buried under the oak where he prayed.
- The book: born in the Auvergne, kept his father's sheep, monk at St. Antony's, St. Germanus of Auxerre and Luxeuil, founded a monastery in Neustria, died 12 December 622. The engraving shows him reading at the door of his monastery.
- The card: a lean, tall monk in an undyed cowl with a staff and open book, the monastery, the great oak and the sea at the mouth of the Somme. No king, no apparition.
- **Against his master `columban`** (big-boned, jutting chin, Irish tonsure), `eucherius_orleans`, `magloire`, `wulfran`, `omer` and **`finian_clonard`** on the same day: Valery has a long, narrow face and jaw, a small rounded nose tip, mild, wide-open light-brown eyes, a gentle lifted mouth and a short, thin brown-grey beard, with a Roman ring of cropped hair.

## St. Finian (12 December)

- Wikipedia (`Finian.txt`): Finnian of Clonard, about 470 – 549, of Leinster, trained in Wales, founder of Clonard on the Boyne, teacher of the "Twelve Apostles of Ireland". Martyrology (`sb-Finniano.txt`): "A Clonard in Irlanda, san Finniano, abate, che, fondatore di molti monasteri, fu padre e maestro di una grande schiera di monaci." Santi e Beati's notice: "maestro dei santi d'Irlanda", almost three thousand disciples.
- The book: of Leinster, taught by St. Patrick's disciples, in Wales, back in Ireland about 520, founder of monasteries and schools, bishop of Clonard, "infirm with the infirm, and wept with those that wept", died 552.
- The card: the old monk-bishop in a dark-grey cloak with a short crook crozier and a Gospel book, the wattle cells of Clonard and young monks at their books by the Boyne.
- **Against the Irish cards** (`columba` clean-shaven, broad and ruddy; `finbarr` long, narrow, receding chin; `columban`; `gall`; `david_wales`; `malachi_armagh`) and `valery`: Finian has a short, broad face, round at the jaw, a broad fleshy nose, wide-set moist eyes under compassionately lifted brows and a full, soft, wavy white beard.

## St. Nicasius (14 December)

- Wikipedia (`Nicasius.txt`, `NicasiusFr.txt`): bishop of Rheims, founder of the first cathedral of Rheims, killed by invaders (Wikipedia gives 407 or 451), with his sister Eutropia, the deacon Florentius and the lector Jucundus; a cephalophore at the Rheims portal. Martyrology (`sb-Nicasio.txt`): "A Reims nella Gallia belgica… passione di san Nicasio, vescovo, che insieme alla sorella Eutropia, vergine consacrata a Cristo, al diacono Fiorenzo e a Giocondo fu ucciso durante una incursione di alcuni pagani davanti alla porta della basilica da lui stesso fondata."
- The book: he foretold the calamity, went from door to door encouraging his flock, was beheaded with Florens and Jocond; Eutropia chose death.
- The card: the bishop bareheaded in a red chasuble with a palm and Gospel book, the Roman gate and a new church of Rheims behind. No head in his hands, no barbarians, no companions.
- **Against `remigius`** (his successor at Rheims: very tall, long and smooth), **`denis`** (the other cephalophore: broad, short, square, tight curls), `gregory_langres`, `mammertus`, `lambert`: Nicasius has a full, soft oval face, a broad low nose with a round tip, round pale-grey eyes under brows raised in concern and a thick, curled chestnut-grey beard cut round.

## St. Mesmin (15 December)

- French Wikipedia (`MesminFr.txt`): Maximin (Mesmin) of Micy, of Verdun, nephew of Euspicius, first abbot of Micy near Orléans. Martyrology (`sb-Massimino.txt`): "Nel territorio di Orléans… san Massimino, sacerdote, ritenuto primo abate di Micy." Santi e Beati's notice: the one source is a Life written in the first half of the ninth century, "per cui lo storico deve usare cautela".
- The book: of Verdun, taken by his uncle Euspice to Clovis's court, Micy founded on the Loire, abbot after Euspice's death, fed Orleans in a famine, drove out a serpent, died 520 after ten years as abbot.
- The card: the abbot in a black habit with a loaf and a sheaf of wheat, the abbey of Micy on the Loire with sacks of grain and the poor. No serpent, no king.
- **Against `avitus`** (a monk of Micy: lean, flat, wide, snub-nosed) and **`eucherius_orleans`** (concave profile, clean-shaven), `gal_clermont`, `omer`, `john_egypt`: Mesmin is wide at the brow and narrow at the jaw, with a long, thin, gently aquiline nose, close-set bright hazel eyes, a wide mouth and a short, neat chestnut beard.

## St. Olympias (17 December)

- Wikipedia (`Olympias.txt`): about 365 – 25 July 408, a noblewoman of Constantinople, married at eighteen to Nebridius, widowed after two years, deaconess, friend of St. John Chrysostom. Martyrology (`sb-Olimpia.txt`), on 25 July: "A Nicomedia in Bitinia… transito di santa Olimpiade, vedova: dopo aver perso il marito in ancor giovane età, trascorse piamente a Costantinopoli il resto della sua vita tra le donne consacrate a Dio, assistendo i poveri e rimanendo fedele collaboratrice di san Giovanni Crisostomo anche durante il suo esilio." Santi e Beati's notice: the old Martyrology had her on 17 December.
- The book: noble and wealthy, orphaned, raised by Theodosia, widowed within twenty days, gave her fortune to the poor, deaconess charged with the altar linen, faithful to Chrysostom in his exile, died about 410.
- The card: the widow in plain dark brown and a deep-red mantle-veil, holding folded altar linen, a timber-roofed basilica and the Bosphorus behind. No Chrysostom.
- **Against `marcella`** (the Roman widow: old, heart-shaped), `bathildes`, `radegundes`, `clotilda`, `helena`: batch 40's `barbara` (young, full oval, light-brown eyes): Olympias has a square-oval face with a broad, straight jaw, a slight bump high on the nose, very large, deep-set dark eyes under thick brows that nearly meet, and a full mouth.

## St. Gatian (18 December)

- Wikipedia (`Gatian.txt`, `GatianFr.txt`): first bishop of Tours, one of the seven bishops sent from Rome about 250 (Gregory of Tours). Martyrology (`sb-Graziano.txt`): "A Tours nella Gallia lugdunense… san Gaziano, primo vescovo, che si dice sia stato trasferito da Roma a questa città e sia stato sepolto nel cimitero cristiano del luogo." Santi e Beati's notice: Gregory's catalogue gives him an episcopate of fifty years.
- The book: came from Rome with St. Dionysius of Paris, preached at Tours, gathered his flock "in grots and caves", often lay hid, laboured nearly fifty years, died in peace.
- The card: the missionary bishop bareheaded in an undyed cloak with a staff and chalice, a cave in the limestone cliffs above the Loire with a small altar and kneeling Christians. No pagans.
- **Against `denis`** (his companion from Rome: broad, short, square, curly), `remigius`, `firmin`, `gregory_langres`, batch 40's `saturninus_toulouse` (long, shield-shaped) and `sabas`: Gatian has a diamond-shaped face with a bald crown, sharp wide cheekbones, a short straight nose, small deep-set watchful eyes, heavy grey brows and a short, pointed grey beard.

## St. Nemesion (19 December)

- Wikipedia (`Nemesion.txt`): Nemesion (Nemesius), an Egyptian martyred at Alexandria under Decius (died 250); feast 19 December, or 10 September in some calendars; it quotes the Ramsgate *Book of Saints* (1921): "burned at the stake between two thieves", after Dionysius of Alexandria in Eusebius. No Santi e Beati entry was found on 19 December or 10 September.
- The book: arrested for theft, cleared of it, accused as a Christian, scourged and burned with the robbers; with him the four soldiers and others beheaded, and Heron, Ater, Isidore and the boy Dioscorus.
- The card: an Alexandrian layman in a striped white tunic with a palm, the harbour and the Pharos behind. No fire, no thieves, no companions.
- **Against the Egyptian cards** (`macarius_alexandria`, `pachomius`, `john_egypt`, `paphnutius`, `eulogius_alexandria`), `severianus_scythopolis` and Tarachus of `tarachus_companions`: batch 40's `peter_alexandria` (round, full, grey, short-nosed): Nemesion is a man of forty, not an old monk, with a lean, angular, square-jawed face, high sharp cheekbones over hollow cheeks, a long straight nose, full lips, short tight black curls and a close-trimmed curly beard.

## Look-alike risks that remain

- **Sabas against `theodosius_cenobiarch` and `john_silent`**: three old monks of the Judaean desert. Sabas keeps thick white hair and a long forked beard; reject a bald crown or a single-pointed beard.
- **Leocadia against Eulalia**: two Spanish virgin martyrs on adjacent days, both in Dacian's persecution. Leocadia is a soft-cheeked young woman, veiled, eyes lifted; Eulalia a narrow-faced child, bareheaded, looking straight out. Reject a child's face on Leocadia or a veil on Eulalia.
- **Valery against Finian** (same day): Valery lean, brown-bearded, Roman tonsure; Finian broad, white-bearded, Irish tonsure.
- **Nicasius against `denis`**: two bishops later shown as cephalophores, both curly-bearded. Nicasius is fuller and softer, with lighter chestnut-grey curls and grey eyes; reject a square jaw or dark tight curls.
- **Gatian against `denis`**: companions from Rome. Gatian is bald, diamond-faced, with a short pointed beard; reject curly hair.
- **Mesmin against `avitus`**: two monks of Micy. Mesmin has a long, thin, aquiline nose and a neat chestnut beard; reject a snub nose.
- **Nemesion against `peter_alexandria`** (batch 40): two Alexandrian martyrs. Nemesion is younger, lean and square-jawed with black curls; reject a round, full face.
- **Olympias against `barbara`** (batch 40): Olympias is older, veiled, deep-eyed, with near-meeting brows; reject a soft young oval.

## Doubts

- **Nemesion's Martyrology entry was not found** on Santi e Beati (the 19 December and 10 September lists), so his presence in the current Martyrology is unconfirmed; he is carded on the book's authority and Eusebius's (via Wikipedia). If he should be skipped, St. Philogonius (20 Dec) is next.
- **Sabas, Valery and Finian** get no reflection (their chapters have none); their excerpts are sentences of the chapter, following batches 36 and 39. Valery's is narrative, the only sentence of his paragraph that speaks of his perseverance.
- **Nicasius's companions** (Eutropia, Florens, Jocond) are left off; the alternative is a group card like `tarachus_companions`, named after the line ("St. Nicasius and his Companions").
- **Dates that differ from the Martyrology**, the card following the book: Valery (1 April; Turin's Consolata keeps 12 December, per Santi e Beati), Olympias (25 July). Years of death differ, none on a card: Valery (the book and Santi e Beati's notice 622, Wikipedia and Santi e Beati's heading 619), Finian (the book 552, Santi e Beati and Wikipedia 549).
- **Patron lines not from the book**: Valery "Abbot of Leuconay" (Santi e Beati, French Wikipedia), Olympias "Widow and deaconess" (the book calls her both, in the title and text), Eulalia "Virgin and martyr of Mérida", Nicasius "Bishop of Rheims, martyr" (the book's title says "Archbishop", its text and the Martyrology "bishop"), Nemesion "Martyr of Alexandria". From the book: Sabas "Patriarch of the monks of Palestine", Leocadia "Patroness of Toledo", Finian "Bishop of Clonard" (the Martyrology calls him abbot), Mesmin "Abbot of Micy", Gatian "First bishop of Tours" (the Martyrology's "primo vescovo").
- **Attributes not in the book**: Sabas's scroll and mantle (his icon), Leocadia's palm and cross (the 1770 engraving), Eulalia's dove and snow (Prudentius via Wikipedia), Valery's oak (Santi e Beati), Finian's crozier and the Irish tonsure (the Clonard statue; the other Irish cards), Nicasius's palm, Gatian's chalice, Nemesion's palm; the landscapes of Mérida (bridge, aqueduct), Rheims (the Roman gate), Alexandria (the Pharos) are real places, not dated here.
- **Mesmin's age** is inferred: the book has him come young with his uncle and govern Micy ten years until 520; no birth year was found.
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: Eulalia appears only on her own card (Leocadia's shows her alone), and St. Euthymius, St. Columban, Clovis, St. Dionysius of Paris and St. John Chrysostom, who appear in these chapters, are left off.
