# Batch 3 of new cards: faces

Faces, dress and settings for four calendar saints and six saints named in the Roman Canon who are not on the universal calendar. Each "Face:" line uses only marks with a source quoted below it; where a mark is an artistic choice made to keep two cards apart, the entry says so. The card data is in `../batches/batch-3.json`.

"Dionysius" is the *Painter's Manual* in Didron's French (1845), local copy `../consult/prelates-src/didron-fr.txt`. Pictures and texts consulted for this batch are in `../consult/batch-3/`, including the Divinum Officium files (`do-missa-*`, `do-horas-*`, `kal*.txt`) fetched from the DivinumOfficium GitHub repository, because the `content/do` submodule is not checked out in this worktree. The contact sheets `sheet-men.jpg` and `sheet-women.jpg` there show the existing cards these faces were checked against.

## Canon saints: feasts and excerpts

These six are not in `content/of-data/calendar`. Their feast is the pre-1970 date of the General Roman Calendar, which is also their day in the Roman Martyrology. The dates come from the Divinum Officium calendars (`kal1570.txt`, `kal1960.txt`) and propers:

| Card | Feast | Evidence |
|---|---|---|
| Linus | 23 Sep | `09-23=…S. Lini Papae et Martyris` (1570); Mass *S. Lini Papæ et Martyris* (Sancti/09-23) |
| Cletus | 26 Apr | `04-26=S. Cleti et Marcellini Pontif Martyrum` (1570); Mass *SS. Cleti et Marcellini* (Sancti/04-26) |
| Chrysogonus | 24 Nov | `11-24=11-24o=S. Chrysogoni Martyris` (1570); office Sancti/11-24o |
| John and Paul | 26 Jun | `06-26=Ss. Joannis et Pauli Martyrum` (1570, 1955); Mass Sancti/06-26 |
| Alexander | 3 May | `05-03=05-03r=Ss. Alexandri et sociorum Martyrum` (1960); office Sancti/05-03r |
| Anastasia | 25 Dec | Commemoration *Pro S. Anastasia* in the second Mass of Christmas (missa Sancti/12-25m2) |

The 1570 calendar also keeps a separate "S. Anacleti" on 13 July, the old doubling of Cletus and Anacletus; the card follows the 26 April feast. Anastasia's 25 December falls on the Nativity card's day.

Four excerpts come from the Canon in `content/of/order/order-of-mass.json`, taking the line of the prayer that names the saint: the Communicantes for Cletus, the Nobis quoque for Anastasia, and the institution narrative for Alexander (see below). The other three are public-domain texts: Irenaeus for Linus, the Breviary lesson for Chrysogonus, and the pre-1970 collect for John and Paul, in my translation.

## Calendar saints

## Timothy and Titus (one card)

Face (Timothy): a slender young man of about twenty-five, short straight light-brown hair with a soft fringe, a sparse, short, fair-brown beard rounded along the jaw, fine features, a gentle, slightly lowered gaze.

Face (Titus): a clean-shaven man of about forty-five, black hair cut short in a straight Roman fringe with grey at the temples, a square jaw, olive complexion, a steady, direct gaze.

- Dionysius, p. 315, among the Seventy: "Titus : jeune, imberbe" (young, beardless).
- Dionysius, p. 392, the martyrs by month, 22 January (the Byzantine feast of the apostle Timothy): "Saint Timothée : jeune, barbe arrondie" (young, rounded beard). Hetherington's index calls this entry "Timothy, martyr (Jan. 22nd)" and lists the bishop of Ephesus separately, so the identification is probable, not certain.
- 1 Tim 4:12, "Let no man despise thy youth", supports a young Timothy.
- The icon on Wikipedia (local copy `timothy_lead.jpg`), which I checked, has a short rounded brown beard and short brown curls. That is exactly the stock thirties face, so the card makes him younger, with a sparse fair beard and straight hair.
- Titus's age is my choice. Paul took him to Jerusalem "fourteen years after" (Gal 2:1), before Timothy joined Paul at Lystra (Acts 16:1), so Titus is the senior. The 13th–15th-century fresco on Wikipedia (local copy `titus_fresco.jpg`) gives him a long, dark pointed beard instead. That would put him next to the Paul card's long dark beard, so I kept Dionysius's beardless Titus and aged him.
- Dress: early bishops with pallium and no mitre; Timothy holding Paul's letters, Titus blessing with a staff.
- Background: Ephesus, Timothy's see, with the theatre of Acts 19 and the harbour street, and a ship for Crete, Titus's see.
- Excerpt: the communion antiphon, "Go into all the world, and proclaim the Gospel." The collect's "living justly and devoutly in this present age" (Titus 2:12) is closer to them, but it does not stand alone as a sentence.

## Cyril and Methodius (one card)

Face (Cyril): a thin, pale, scholarly man of about forty, a long, narrow black beard, dark eyes under straight black brows, a high forehead under the monastic hood, a calm, inward gaze.

Face (Methodius): a broad-faced man of about sixty, a long, full iron-grey beard with darker streaks, heavy dark eyebrows, a kindly, fatherly gaze.

- Zahari Zograf, Troyan Monastery, 1848 (local copy `cm_zograf.jpg`), which I checked: both brothers in dark monastic hoods, with long grey beards, holding a scroll of the Slavonic alphabet between them.
- Jan Matejko, 1885 (local copy `cm_matejko.jpg`), which I checked: Cyril with a full dark beard and dark hair, holding an open book; Methodius old and white-bearded in a blue mantle with a cross-staff.
- Wikipedia: Methodius was the elder brother. Cyril, "the Philosopher", became a monk and died in Rome in 869 at about forty-two; Methodius was consecrated archbishop by Pope Adrian II. The calendar title in the repo is "Ss Cyril, monk, and Methodius, bishop". https://en.wikipedia.org/wiki/Saints_Cyril_and_Methodius
- The ages follow the dates, and the dark and grey beards follow Matejko. Methodius's beard is grey, not white, and his brows are heavy, to keep him off the stock elder and Athanasius.
- Dress and attributes: Cyril in a black monastic habit and hood, Methodius as an archbishop with a mitre, pallium and double-barred cross; the alphabet scroll between them (Zograf).
- Background: the Morava valley, the heart of Great Moravia where they preached, with a small round stone church like those excavated at Mikulčice.

## John Baptist de la Salle

Face: a clean-shaven man of about sixty, an oval face with full cheeks, a long straight nose, soft grey hair brushed back to the collar, dark brown eyes, a gentle half-smile.

- The official portrait, dated 1734 and attributed to Pierre Léger, kept in the Brothers' archives in Rome. The Lasallian archives say no portrait was painted from life. The Brothers first relied on a mortuary portrait (attributed to Du Phly, 1719), and the 1734 Léger was later "designated the official portrait". https://lasalle-po.org/2026/05/05/archives-lasalliennes-portraits-de-saint-jean-baptiste-de-la-salle/
- The portrait on Wikipedia (local copy `lasalle_leger.jpg`), which I checked: clean-shaven, grey hair falling to the collar, a long nose, a mild smile, a black habit with the white rabat.
- Wikipedia: born 1651, died 1719 at 67, a canon of Reims Cathedral from the age of sixteen; "Pope Pius XII proclaimed him Patron Saint of All Teachers of Youth on 15 May 1950"; attributes: a book, the Brothers' habit.
- Dress and attributes: a black soutane and mantle with the white rabat, a schoolboy with a primer, a slate and book.
- Background: Reims Cathedral, where he was a canon and where he opened his first schools.
- Not Vianney: Vianney is thin and wasted, with long snow-white hair and a stole; La Salle is fuller-faced, his hair is grey and shorter, and he wears the rabat without a surplice.

## Teresa of Calcutta

Face: a small woman of about seventy, slightly stooped, a small, kindly face softly lined with age, deep brown eyes, a strong nose, a warm, gentle smile.

- The Wikipedia lead photograph (local copy `teresa_photo.jpg`), which I checked: a white sari over her head with one broad and two narrow blue stripes, a small wooden crucifix pinned at her left shoulder, a deeply lined face with a broad smile and dark eyes. Wikipedia says she chose "a white sari with two blue borders" in 1950; the photograph shows three stripes, as the batch brief asks. https://en.wikipedia.org/wiki/Mother_Teresa
- Wikipedia: in 1952 she opened "Kalighat, the Home of the Pure Heart (Nirmal Hriday)" for the dying; the Missionaries of Charity received approval on 7 October 1950. Infobox attributes: religious habit, rosary.
- Age: 1910–1997. Seventy is the age of the photographs everyone knows.
- The wrinkles are kept soft: holy cards idealise.
- Excerpt: from the collect only, because her own writings are in copyright.

## Saints of the Roman Canon

## Linus

Face: a man of about fifty, dark hair greying at the temples and receding at the brow, a full, rounded salt-and-pepper beard of medium length, a broad, calm face, dark eyes, a steady, gentle gaze.

- Dionysius, p. 313, among the Seventy: "Linus : jeune, barbe arrondie" (young, rounded beard). The East counts the Linus of 2 Tim 4:21 among the Seventy and as the first bishop of Rome after Peter.
- The Menologion of Basil II (Wikipedia lead image, local copy `linus_menologion.jpg`), which I checked: an older man, balding, with grey hair and a rounded white beard, in an omophorion, holding a jewelled book.
- The age is a choice between the two: Dionysius's young man would sit too close to Timothy and Ambrose, and the Menologion's white-bearded elder too close to Ignatius of Antioch and Nicholas.
- Roman Breviary, 23 September (DO horas Sancti/09-23): "Linus Pontifex, Volaterris in Etruria natus, primus post Petrum gubernavit Ecclesiam … Scripsit res gestas beati Petri … Sepultus est in Vaticano prope sepulcrum Principis Apostolorum."
- Dress: an early pope without a tiara, in a red chasuble with the white pallium; a book (the acts of Peter) and a palm.
- Background: Volterra, his birthplace in the Breviary.
- Excerpt: Irenaeus, *Against Heresies* III.3.3 (ANF, New Advent): "The blessed apostles, then, having founded and built up the Church, committed into the hands of Linus the office of the episcopate." https://www.newadvent.org/fathers/0103303.htm. The pt-BR is my rendering.

## Cletus

Face: a lean old man of about seventy, close-cropped silver hair, a narrow, ascetic face, an aquiline nose, deep-set kind eyes, a long silver-grey beard divided into two points at the end.

- Palma il Giovane, *Papa Cleto*, 1592–93, sacristy of the Gesuiti, Venice (Wikipedia lead image, local copy `cletus_palma.jpg`), which I checked: an old pope with a long white beard and a tiara, blessing, holding a cross-staff.
- The statue at San Cleto, Rome (local copy `cletus_sanbasilio.jpg`), which I checked: a long, wavy dark beard and a blessing hand. Its long hair and brown beard read as Christ, so I did not use it.
- No source describes Cletus's features. The images agree on an old, bearded, blessing pope. Palma's long white beard would repeat the stock elder, and Leo is the clean-shaven, heavy-set pope, so Cletus is lean and grey, with a forked beard. The fork is an artistic choice.
- Roman Breviary, 26 April (DO horas Sancti/04-26): "Cletus Romanus … Primus in litteris verbis illis usus est: Salutem et apostolicam benedictionem … in Vaticano juxta corpus beati Petri sepultus." The raised blessing hand echoes this.
- Dress: no tiara (the brief asks for early popes in pallium and chasuble), a gold chasuble, a simple cross-staff, a palm.
- Background: the Vatican hill above the Tiber, where he was buried beside Peter.
- Excerpt: the Communicantes that names "Linus, Cletus". An alternative is the Breviary's "Salutem et apostolicam benedictionem" ("Greeting and apostolic blessing"), which is charming but not a prayer.

## Chrysogonus

Face: a man of about forty-five, close-cropped iron-grey hair, a short, square-trimmed black beard streaked with grey, a strong jaw, dark eyes, a calm, resolute gaze.

- christianiconography.info: "Before the 14th century Chrysogonus was more likely to be arrayed as a Roman military officer of high rank" in "cloak, cuirass, and the feather-style skirt"; "In medieval images of the 14th and 15th centuries St. Chrysogonus is presented as a Crusader." https://www.christianiconography.info/chrysogonus.html
- Michele Giambono, *St. Chrysogonus on Horseback*, San Trovaso, Venice, c. 1444 (local copy `chrysogonus_giambono.jpg`), which I checked: a beardless young knight with brown curls, a lance and banner, on a white horse. The modern icon with Anastasia (local copy `chrysogonus_anastasia.jpg`) shows him in Roman armour with dark curly hair and a short beard.
- No source gives his features. Both pictures give the young-soldier faces the collection already has (George, Martin, Sebastian), so his age, grey and heavier build are my choice.
- Roman Breviary, 24 November (DO horas Sancti/11-24o): imprisoned in Rome for two years, supported by Anastasia, "mutuis epistolis est consolatus"; taken to Aquileia, where Diocletian offered him honours. "At ille: Ego eum, qui vere est Deus, mente et oratione veneror; deos autem … odi et exsecror." He was beheaded "ad Aquas Gradatas", and his body was "projectum in mare". The excerpt is my translation of his answer.
- Dress and attributes: cuirass and crimson cloak, a sealed letter (the letters to Anastasia), a light chain (the prison), a palm.
- Background: the lagoon and shore of Aquileia.

## John and Paul (one card)

Face (John, the elder): a man of about forty, close-cropped black hair, a short, neatly trimmed black beard, a square face, a grave, steady gaze.

Face (Paul): a clean-shaven man of about twenty-eight, short light-brown hair combed forward in a straight Roman fringe, a narrower face, a gentle expression.

- Sant'Apollinare Nuovo, Ravenna, procession of martyrs (local copy `johnpaul_sancti.jpg`), which I checked: "SCS IOHANNIS" and "SCS PAULUS", both young, clean-shaven, with short cropped hair, in white pallia with clavi, carrying crowns.
- Roman Breviary, 26 June (DO horas Sancti/06-26): "Joannes et Paulus, fratres Romani", who had served Constantia, the daughter of Constantine, gave her bequest to the poor, refused Julian the Apostate, and were beheaded in their house ("domi").
- Wikipedia: officers entrusted with Constantia; beheaded in their house on the Caelian Hill, over which the basilica of Santi Giovanni e Paolo stands. https://en.wikipedia.org/wiki/Saints_John_and_Paul
- Ravenna makes them near-twins, and two beardless young men would repeat the stock youth. The card keeps Paul as Ravenna has him and makes John older and bearded, since he is named first. That is an artistic choice.
- Dress: white Roman tunics with purple clavi and white mantles, as in Ravenna, with palms and a crown.
- Background: the Caelian Hill, with the basilica's Romanesque bell tower and portico.
- Excerpt: the 1962 collect (DO missa Sancti/06-26): "quos eadem fides et passio vere fecit esse germanos". My translation: "The same faith and the same passion made them truly brothers."

## Alexander

Face: a clean-shaven young man of about thirty, short chestnut hair combed forward in a straight fringe, an oval face, large dark almond-shaped eyes, a long straight nose, a serene, open gaze.

- The 8th-century fresco "Sanctus Alexander Papa" in Santa Maria Antiqua, Rome (Wikipedia lead image, local copy `alexander_smantiqua.jpg`), which I checked: beardless and young, with short brown hair in a fringe, large eyes, a long nose, white garments with a pallium and a jewelled book.
- Roman Breviary, 3 May (DO horas Sancti/05-03r): "Alexander Romanus … in Canone Missæ addidit, Qui pridie quam pateretur. Idem decrevit ut aqua benedicta, sale admixto, perpetuo in ecclesia asservaretur … Martyrio coronatus est una cum Eventio et Theodulo presbyteris, sepultusque est via Nomentana."
- The Catholic Encyclopedia notes that the Qui pridie attribution is not historical, since those words are original to the Mass, and that "his so-called 'Acts' are not genuine". https://en.wikisource.org/wiki/Catholic_Encyclopedia_(1913)/Pope_St._Alexander_I
- Identity is a real doubt. The 1960 reform stopped identifying the martyr Alexander of the Via Nomentana with the pope, and the Canon's "Alexander" has been read as either. The card follows the brief and the Breviary's pope.
- Dress and attributes: white vestments and pallium, as in the fresco; a chalice and Host (the Qui pridie), holy water with an aspergillum, a palm.
- Background: the Via Nomentana, where the Breviary places his burial.
- Excerpt: the Canon's "On the day before he was to suffer, he took bread in his holy and venerable hands", the words the Breviary says he added.

## Anastasia

Face: a young woman of about twenty-five, light auburn hair braided and coiled at the nape under a pearl fillet, a fair oval face with high cheekbones, grey eyes, a composed, compassionate gaze.

- Vittore Carpaccio, *St. Anastasia*, from the polyptych in Zadar, where her relics are kept (local copy `anastasia_carpaccio.jpg`), which I checked: light auburn hair under a pearled fillet, a green gown with a dark mantle, a palm and a book.
- The Greek icon on Wikipedia (local copy `anastasia_lead.jpg`), which I checked: a veiled woman in a red-brown maphorion holding a hand cross and a medicine phial, inscribed ἡ Φαρμακολύτρια.
- Dionysius, p. 362, among the female martyrs: "Sainte Anastasie, qui donne des médicaments", apart from "Sainte Anastasie la Romaine".
- christianiconography.info: Anastasia of Sirmium "was burned at the stake"; in the West she sometimes holds "a flame in her hand, either in a bowl or directly on the palm of the hand". https://www.christianiconography.info/anastasia.html
- Wikipedia: Chrysogonus was her teacher, and she was executed at Sirmium on 25 December 304; she had "the distinction, unique in the Roman liturgy, of having a special commemoration in the second Mass on Christmas Day". https://en.wikipedia.org/wiki/Anastasia_of_Sirmium
- Complexion and hair beyond Carpaccio are not attested. The braided, coiled hair, instead of loose waves, is an artistic choice to set her apart from Agnes, Agatha, Lucy, Cecilia and Mary Magdalene.
- Background: Sirmium on the Sava.

## Pairs that may still look alike

- **Cletus and the white-bearded elders** (Athanasius, Nicholas, Ignatius of Antioch, Methodius): his beard is silver-grey and forked, his face lean, his hair cropped. Check him on the contact sheet. If he still collapses into the stock elder, the fallback is a clean-shaven, lean Cletus kept apart from Leo by build.
- **Methodius and Athanasius / Ignatius**: Methodius is grey-bearded with heavy dark brows and a mitre. Athanasius is broad and white and Ignatius bald with a tapering beard.
- **Linus and Gregory the Great**: both are bearded popes of middle age. Gregory is bald on the crown with a tawny reddish beard and a mitre; Linus has dark hair greying at the temples, a salt-and-pepper beard, and a pallium without a mitre or tiara.
- **Linus, Cletus and Alexander**: fifty with a rounded grey-streaked beard, seventy with a forked silver beard, and thirty and clean-shaven; red, gold and white vestments. Leo remains the only heavy-set clean-shaven pope, in a tiara.
- **Alexander and the beardless youths** (Stephen, Lawrence, Aloysius): Alexander's straight chestnut fringe, large almond eyes and papal pallium must carry the difference.
- **Timothy and Philip (philip_james)**: both are young and slender. Timothy has a sparse fair rounded beard; Philip is beardless with a tousled forelock.
- **Titus and Paul (the John and Paul card)**: both are clean-shaven, short-haired Romans. Titus is older, black-haired with grey temples and olive-skinned, in a chasuble; Paul is younger and light-brown-haired, in a white Roman mantle.
- **John (John and Paul), Chrysogonus and Ambrose**: short dark beards. John is about forty, black-bearded, in white; Chrysogonus is greyer and older, in armour; Ambrose is in a mitre. John and Chrysogonus are the closest pair in this batch.
- **La Salle and Vianney / Alphonsus**: clean-shaven priests. La Salle is fuller-faced, with grey hair to the collar and the rabat. Vianney is gaunt and snow-white, and Alphonsus old and white-bearded.
- **Chrysogonus and George / Martin / Sebastian**: soldier saints. Only Chrysogonus is middle-aged and grey-bearded, with a letter and chain rather than a lance or arrows.
- **Anastasia and Perpetua / Agatha**: Roman noblewomen. Anastasia is unveiled, with braided auburn hair, a pearl fillet, a green gown and a phial; Perpetua has dark hair, a white veil and a diadem, and Agatha blonde hair and a red veil.
- **Teresa of Calcutta and Monica / Anne**: older women. The sari with blue stripes identifies her at once.

Face lines in `../batches/batch-3.json` were given explicit bone structure on 2026-09-29 (face shape, nose, eyes, brows, cheekbones, jaw, mouth before hair, beard and gaze), because lines of age, hair and beard alone produced one shared underlying face; the structures were chosen so that no two faces across batches 1–5 and the existing cards share one. The "Face:" lines above keep the sourced marks but not the added structure.
