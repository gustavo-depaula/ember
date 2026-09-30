# Batch 42 — the Pictorial Lives, 20 to 30 December

Six cards, the last unclaimed lines of "From the Pictorial Lives of the Saints": `philogonius`, `ischyrion`, `servulus`, `delphinus`, `thrasilla_emiliana`, `sabinus_companions`. **No line in this stretch is skipped.** All are in the current Roman Martyrology (entries quoted below), Emiliana on 5 January and Sabinus on 7 December. The book's other chapters here are carded already: Thomas (21 Dec), Christmas (25), Stephen (26), John (27), the Holy Innocents (28), Thomas of Canterbury (29), Sylvester (31).

**The rest of the section.** A scan of every unticked line of the Pictorial Lives section against the `catalogMatch` of every `batches/*.json` finds only four other unclaimed lines, all left out earlier and waiting on a decision: Vitus, Crescentia and Modestus (15 Jun, `to-assess.md`, batch 30), Seraphia (3 Sep, batch 35), Thecla (23 Sep, batch 36), Cyprian and Justina (26 Sep, batch 36). Seraphia, Thecla, and Cyprian and Justina are recorded as skipped in those batches' dossiers but have no line in `to-assess.md`. With this batch, every other line of the section is claimed.

The card data is in `../batches/batch-42.json`. `../consult/batch-42/build.py` writes it from `cards.py`. Both were copied from batch 40's, and every output path and the batch number were changed to 42 before the first run. The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- every chapter has a `**Reflection**`/`**Reflexão**` in both languages;
- that no other card uses any of the chapters. `delphinus` has no lifeChapter (declared in `no_life`), so `dec-24-delphinus` belongs to `thrasilla_emiliana` alone;
- that no card has a `proper`. It lists every formulary whose title names one of the six (none) and the formularies on the cards' dates and on the Martyrology's other days (12-07, 01-05);
- that every word of each pt-BR name appears in the chapter title (accent-folded);
- feasts against the index days; that each catalogMatch hits one unticked line no other batch claims; that no id collides with `content/saints/`, the holy-card data or any batch (41 included, now committed); initials and refs.

It prints `all checks pass`.

Consulted material is in `../consult/batch-42/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Philogonius (en and it; the Menologion of Basil II, enlarged `PhilogoniusL.jpg`, face crop `PhilogoniusFace.jpg`), Servulus (Callot's plate for 23 December), Sabinus of Spoleto (Pietro Lorenzetti's predella, `SabinusL.jpg`, crop `SabinusFace.jpg`), Delphin de Bordeaux (fr, no image). The titles for Delphinus (en), Tarsilla, Emiliana (a disambiguation page), Sabino (it) and Servolo (it, a name page) gave nothing useful;
- the mosaic of Sabinus in Sant'Apollinare Nuovo, Ravenna (`SabinusRavenna.jpg`, crop `SabinusRavennaFace.jpg`), from Wikimedia Commons;
- thirteen Fayum mummy portraits (`fayum-*.jpg`, sheet `fayum-sheet.jpg`), and the British Museum description of the one used for Ischyrion (`fayum-06.txt`);
- Santi e Beati pages with the current Roman Martyrology entry for each (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-12-20.html` … `sb-12-30.html`). Sabinus is not on the 30 December list; his entry (7 December) was found by search;
- S. Boesch Gajano, "Un giovane aristocratico romano" (`boesch-gregorio.pdf`, `.txt`), on Gregory the Great's family. It quotes John the Deacon, *Vita Gregorii* IV.83, on the portraits of Gregory's parents in the atrium of St. Andrew's on the Caelian;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- every face line in `../consult/batch-40/faces-all.txt` and batches 40 and 41, which the faces were compared against.

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets (run with `research/holy-card-faces/.venv/bin/python`).

**Dates, names, initials.** Feasts follow the book (index days 12-20, 12-22, 12-23, 12-24, 12-24, 12-30). Names are the book's, with its pt-BR forms (São Filogônio, Santo Isquírion, São Sérvulo, São Delfino, Santas Trasila e Emiliana, São Sabino e Companheiros). Titles after the name are dropped ("Bishop", "Martyr", "Virgins"). The book's spelling "Thrasilla" is kept; the Martyrology and Santi e Beati have "Tarsilla". Delphinus stays bare, with his see in the patron line, as `maximus_riez` does. Initials: P, I, S, D, T, S.

**Titles.** None changes. All are "san/sant'/santa" in the Martyrology, Servulus, Thrasilla, Emiliana and Ischyrion as a "commemorazione". No saint here died after 590.

**lifeChapter and reflection.** Five cards have their chapter as lifeChapter, and each chapter ends with a Reflection, which the card gets. **`dec-24-delphinus` tells two lives**: a paragraph on Delphinus, then three on Thrasilla and Emiliana, and one Reflection: "We may often think the austerities of the Saints are beyond our strength; let us, then, imitate the guard they kept over their tongue." That fits the sisters, who lived "far removed from the conversation of men", and says nothing of Delphinus. So `thrasilla_emiliana` takes the chapter and **`delphinus` has no lifeChapter and no reflection**, as `agapetus` (batch 34) with Helena's chapter. His excerpt comes from his own paragraph.

**proper.** None. No formulary in the repo names any of the six, in any language. The formularies on these dates belong to other feasts (12-23 John of Kanty; on the Martyrology's other days, 12-07 Ambrose and 01-05 the United States' John Neumann). There is nothing on 12-20, 12-22, 12-24 or 12-30, and those are Advent and Christmas-octave weekdays.

**Excerpts.**
- From the saint's own Reflection: Philogonius (second sentence), Ischyrion (first sentence), Servulus (the whole of it), Thrasilla and Emiliana (first sentence), Sabinus (the whole of it).
- From the chapter: **Delphinus**, the third sentence of his paragraph ("He baptized St. Paulinus in 388, and the latter, in several letters, speaks of him as his father and his master.").

## St. Philogonius (20 December)

- Wikipedia (`Philogonius.txt`, `FilogonioIt.txt`): an advocate at Antioch, married with a daughter; made bishop in 318 without first being a priest; opposed Arius with Alexander of Alexandria; died 322 or 324. St. John Chrysostom's panegyric on him survives. Martyrology (`sb-Filogonio.txt`): "Ad Antiochia in Siria, san Filogonio, vescovo, che, avvocato, chiamato da Dio a governare un giorno questa Chiesa, diede inizio insieme al vescovo sant'Alessandro e ad altri compagni alla lotta per la fede cattolica contro l'arianesimo…". Santi e Beati's notice: he completed the old church of Antioch (the Palaia) between the Orontes and the mountain, and died before Nicaea.
- The Menologion of Basil II (`PhilogoniusFace.jpg`): grey hair, a medium grey beard ending in a point, a strong straight nose, a dark phelonion and a white omophorion with crosses.
- The book: an advocate admired for his eloquence, bishop of Antioch in 318, received Alexander's synodal letter, Confessor under Maximin and Licinius, died 322. Its engraving shows a seated, bearded bishop speaking with a raised hand.
- The card: a Greek bishop in a plum-purple phelonion and omophorion, the sealed synodal letter in one hand and the other raised like an orator's, with Antioch, the Orontes and Mount Silpius behind. No council.
- **Against `gregory_thaumaturgus`** (narrow, bald crown with a curl, short curly beard), **`eulogius_alexandria`** (another Antiochene: oblong, bald dome, near-meeting brows), `anicetus` (tall egg, Syrian), `lucian_antioch` (short, broad-browed), `theodoret_antioch` (bell-shaped), `athanasius`: Philogonius is widest at broad, high cheekbones, keeps thick wavy iron-grey hair, and has mobile arched brows with one raised, large prominent eyes, a full lower lip and a beard close at the cheeks ending in a blunt point.

## St. Ischyrion (22 December)

- Martyrology (`sb-Ischirione.txt`): "Commemorazione di sant'Ischirione, martire in Egitto, che… essendosi rifiutato di fronte a richiami e maltrattamenti di sacrificare agli idoli, fu ucciso trafitto nelle viscere da un palo acuminato." Santi e Beati quotes Dionysius of Alexandria in Eusebius: "Ischirione amministrava, come stipendiato, i beni di uno dei magistrati." This was in the persecution of Decius (c. 250).
- The book: "an inferior officer who attended on a magistrate of a certain city in Egypt". Its engraving shows him kneeling in an Egyptian hall.
- Face: the British Museum's encaustic portrait of a man (`fayum-06.jpg`, `fayum-06.txt`), with a round, full face, close-cropped black hair and a short black beard, chosen for the look of Roman Egypt in his century.
- The card: a steward in a white linen tunic with dark-red clavi, holding writing tablets, an account roll and a palm, with a Nile town, palms and a felucca behind. No stake.
- **Against `nemesion`** (batch 41, an Alexandrian of the same persecution: lean, angular, square-jawed), `julian_basilissa` (kite-shaped), `pachomius`, `macarius_alexandria`, `peter_alexandria` (round, but sixty-five and grey), `moses_the_black`: Ischyrion is a man of thirty-five with a round, full, fleshy-cheeked face, a broad nose, heavy-lidded patient eyes and a short dense black beard.

## St. Servulus (23 December)

- Wikipedia (`Servulus.txt`): paralysed from infancy, he lay in the porch of St. Clement's in Rome and died c. 590. Butler cites St. Gregory's homily on the Gospels and the *Dialogues*, Book IV; the Ramsgate *Book of Saints* says Gregory "seems to have known Saint Servulus personally". Martyrology (`sb-Servolo.txt`): "A Roma, commemorazione di san Sérvulo, che, giacendo paralitico fin dall'infanzia sotto il portico della chiesa di San Clemente, cercò sempre… di rendere grazie a Dio e distribuì ai poveri tutto quello che raccoglieva dalle elemosine."
- Callot's plate (`Servulus.jpg`) and the book's engraving both show him lying on his pallet, bearded, with helpers reading beside him. Callot adds angels above.
- The card: reclining on a straw pallet under the porch of old St. Clement's, an open psalter and an alms bowl beside him, singing, with the Colosseum down the street in evening light. No angels and no twisted limbs; his hands lie quietly on the blanket.
- **Against `odo_cluny`** (a clean-shaven, upright egg with round grey eyes), `mesmin` (wide at the brow, narrow jaw, neat beard), `eleutherius` (moon-round, tearful), `alexius` (the other beggar of a Roman church porch): Servulus has a soft, oval-round face, fine straight light-brown hair, a sparse soft beard, a small upturned nose, high-arched brows and wide hazel eyes lifted up, with his mouth open in song. The pose alone, reclining, sets him apart from every other card.

## St. Delphinus (24 December)

- Martyrology (`sb-Delfino.txt`): "A Bordeaux in Aquitania, in Francia, san Delfino, vescovo, che fu unito a san Paolino da Nola da intima familiarità e si adoperò strenuamente per combattere l'eresia priscillianista." French Wikipedia (`DelphinFr.txt`): the first certain bishop of Bordeaux (c. 380–404), he baptized Paulinus, was a friend of Phoebadius of Agen and corresponded with Ambrose. Nominis: his sarcophagus is in the crypt aisle of Saint-Seurin. The Saint-Michel spire statue and the north-portal statue of the cathedral are modern or Gothic and were not consulted.
- The book: at the Council of Saragossa (it says 330; Santi e Beati gives 380) and at Bordeaux; he baptized Paulinus in 388; died 24 December 403. The left half of its engraving shows a bearded, balding man handing a written sheet to a seated young man.
- The card: a Gallo-Roman bishop without mitre, in a white tunic and a green paenula, holding a silver baptismal shell and a Gospel codex, with Roman Bordeaux on the Garonne behind (the Piliers de Tutelle temple, walls, quays, vineyards).
- **Against `paulinus_nola`** (his godson: clean-shaven, heart-shaped), `nicasius` (full, soft, round curly beard), `valery`, `hilary`, `martin_tours`, `ambrose`: Delphinus is a rounded rectangle, even in width, with strong rounded cheekbones, a widow's peak, a short, gently scooped nose, a long upper lip, a humorous mouth and a short curly salt-and-pepper beard.

## Sts. Thrasilla and Emiliana (24 December)

- Martyrology: Tarsilla (`sb-Tarsilla.txt`), "A Roma, commemorazione di santa Tarsilla, vergine, della quale san Gregorio Magno, suo nipote, loda l'assidua preghiera, il rigore di vita e il singolare spirito di penitenza"; Emiliana (`sb-Emiliana.txt`, 5 January), "A Roma, commemorazione di santa Emiliana, vergine, zia del papa san Gregorio Magno, che, poco dopo sua sorella Tarsilla, fece anch'ella ritorno al Signore." Santi e Beati: their family counted Pope Felix III among its forebears, and a third sister, Gordiana, went back to the world.
- Boesch Gajano (`boesch-gregorio.txt`): the aunts lived a life of strict penance in the family house, and Gregory tells the story in the *Homilies on the Gospels* and the *Dialogues*, Book IV. She quotes John the Deacon on the portrait of their brother Gordianus, Gregory's father: "statura longa, facies deducta, virides oculi, barba modica, capilli condensi, vultus gravis" (tall, a long, drawn face, green eyes, a moderate beard, thick hair, a grave look). Thrasilla's face takes his long face and green eyes as a family likeness.
- The book: the aunts of St. Gregory lived in their father's house "as retired as in a monastery"; St. Felix appeared to Thrasilla, who died on 24 December, and she appeared to Emiliana, who died on 8 January. The right half of the engraving shows the vision.
- The card: the two sisters side by side in dark mantles over white veils, Thrasilla with a psalter and eyes lifted, Emiliana with joined hands turned toward her, in the courtyard of the Caelian house with the Palatine at dusk and one star. No vision.
- **Against each other**: Thrasilla long, drawn, green-eyed, lean; Emiliana shorter, round, full-cheeked and dark-eyed. **Against `monica`, `olympias`** (square-oval, near-meeting brows), `leocadia` and `bibiana` (young), `scholastica` (a round fair face, forty): both are women of fifty and more, veiled, and neither has Scholastica's smile.

## St. Sabinus and his Companions (30 December)

- Wikipedia (`Sabinus.txt`): the legend has Sabinus and his deacons arrested at Assisi under Diocletian, the deacons killed, Sabinus's hands cut off, the governor Venustian healed and converted, and Sabinus beaten to death at Spoleto. The feast is 30 December in the East and the Martyrology. Martyrology (`sb-Sabino.txt`): "A Spoleto in Umbria, san Sabino, venerato come vescovo e martire", on **7 December**. Santi e Beati: Spoleto venerates him with the deacons Marcellinus and Exuperantius; Ivrea claims his relics; "San Sabino è raffigurato anche nei mosaici bizantini di Sant'Apollinare Nuovo a Ravenna."
- The Ravenna mosaic (`SabinusRavennaFace.jpg`): a long face, a straight fringe of short greyish hair, large eyes, a long nose and a short beard. Lorenzetti's predella (`SabinusFace.jpg`) shows him mitred with a short grey beard.
- The book: Bishop of "Assisium", his deacons Marcellus and Exuperantius, the governor Venustianus converted, Sabinus beaten to death at Spoleto, relics at Faenza. Its engraving shows the moment before his hands are cut.
- The card: three figures with palms. Sabinus is bareheaded in a red paenula, his hands hidden in its folds. The two deacons are in white dalmatics, Marcellus with a Gospel book. Behind them is the Umbrian valley at Spoleto. No wounds and no instruments.
- **Against `tarachus_companions`** (three martyrs: a square-bearded veteran, a lean plebeian, a young patrician), `philip_james`, `gatian`, `saturninus_toulouse`: Sabinus keeps the Ravenna fringe, a long narrow face with a square level chin and a short grey-brown beard. Marcellus is square, black-curled and bearded; Exuperantius is round-faced with wavy chestnut hair and a first beard.

## Look-alike risks that remain

- **Philogonius against `gregory_thaumaturgus`** (batch 40): two Greek bishops in phelonion and omophorion. Philogonius has thick hair, a plum phelonion and a letter, not a book; reject a bald crown or a short curly beard.
- **Ischyrion against `nemesion`** (batch 41): two Egyptian laymen of the Decian persecution in striped tunics with palms. Ischyrion is round and full with tablets, Nemesion lean and angular; reject a hollow-cheeked face.
- **Delphinus against `sabinus_companions`' Sabinus**: two bareheaded bishops in paenulae. Delphinus is in green with curly salt-and-pepper beard and a widow's peak; Sabinus in red, with a fringe. Reject a fringe on Delphinus.
- **Servulus against `alexius`**: both beggars at a Roman church. Servulus lies on a pallet and sings; reject an upright, seated pose.
- **The Ravenna fringe on Sabinus** may come out as the Christ-like young man the brief warns against if the generator drops his age; reject a young or long-haired Sabinus.

## Doubts

- **Delphinus without a lifeChapter.** The shared chapter's Reflection is given to the sisters; the alternative is to give both cards the chapter (a `shared_in_batch` declaration), so Delphinus's card would also carry a Reflection about the guard of the tongue.
- **Sabinus as a group card**, following the catalog line and `tarachus_companions`; batch 41 showed Nicasius alone despite "and his Companions". The alternative is Sabinus alone ("St. Sabinus", "Bishop and martyr").
- **Book dates kept against the Martyrology**: Sabinus 30 December (Martyrology 7 December), Emiliana with her sister on 24 December (Martyrology 5 January; the book says she died on 8 January).
- **Book facts that conflict with other sources**, none on a card: the book puts Philogonius at Nicaea, but Santi e Beati says he died before it; the book dates the Council of Saragossa to 330, Santi e Beati to 380; the book calls Sabinus bishop of Assisi, the Martyrology "venerated as bishop" at Spoleto. The deacons are Marcellus in the book and Marcellinus in Santi e Beati; the card leaves the names off the picture.
- **Servulus's excerpt** is his whole Reflection, a rebuke to the healthy and rich, following the rule (Reflection first). The gentler alternative is his dying words from the chapter: "Silence! do you not hear the sweet melody and praise which resound in the heavens?"
- **Patron lines**: Philogonius "Bishop of Antioch", Ischyrion "Martyr of Egypt", Servulus "Paralyzed beggar of Rome", Delphinus "Bishop of Bordeaux" / "Bispo de Bordeaux" (the book's pt-BR says "Bordéus", the Portuguese form; Brazil writes "Bordeaux"), Thrasilla and Emiliana "Virgins, aunts of St. Gregory the Great", Sabinus "Bishop and martyrs of Umbria".
- **Attributes not in the book**: the letter and orator's gesture (Philogonius), tablets and account roll (Ischyrion, from Dionysius's "administered for pay"), the baptismal shell (Delphinus), the psalter (Thrasilla, after Silvia's portrait in John the Deacon), the deacons' Gospel book, and all the landscapes.
- **Faces are ours** for Delphinus, Emiliana and the two deacons; Thrasilla's is inferred from her brother's portrait; Ischyrion's is a type from Roman Egypt, not a likeness.
- **`recurring-figures.md`**: unchanged. No figure here appears on another card (Paulinus, Felix III and Gregory are left off).
