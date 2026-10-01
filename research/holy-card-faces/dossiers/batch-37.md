# Batch 37 — the Pictorial Lives, 7 to 22 October

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 36: `mark_pope`, `louis_bertrand`, `francis_borgia`, `tarachus_companions`, `wilfrid`, `edward_confessor`, `gall`, `peter_alcantara`, `ursula`, `mello`. **No line in this stretch is skipped**: each of the ten is in the current Roman Martyrology (entries quoted below), though three rest on legend (see Doubts). The lines already waiting on a decision are left alone: Vitus, Crescentia and Modestus (15 Jun), Seraphia (3 Sep), Thecla (23 Sep), Cyprian and Justina (26 Sep). The book's other chapters here are carded already: Bruno (6 Oct) `bruno`, Bridget of Sweden (8) `bridget_sweden`, Dionysius (9) `denis`, Callistus (14) `callistus`, Teresa (15) `teresa`, Hedwig and Margaret Mary (17) `hedwig`, `margaret_mary`, Luke (18) `luke`, John Cantius (20) `john_kanty`. The next unclaimed line is St. Hilarion (22 Oct), for batch 38; he shares `oct-22-mello` with Mello.

The card data is in `../batches/batch-37.json`. `../consult/batch-37/build.py` writes it from `cards.py` (copied from batch 36's, every output path changed to batch 37 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but `oct-22-mello` (Mello and Hilarion), in both languages; Mello's excerptSource says it has none;
- that `louis_bertrand` has no `lifeChapter` (see below) and that his excerpt is in `oct-09-dionysius-and-his-companions`;
- that no card has a `proper`, and that every sanctoral formulary whose title names one of the ten has no en-US or pt-BR collect (listed below); it lists the formularies on every card's date, on the Martyrology's other days for them (30 Sep, 18 Oct, 5 Jan, 24 Apr) and on Spain's day for Francis Borgia (3 Oct);
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides and that no other card uses the chapter; initials and refs.

Consulted material is in `../consult/batch-37/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`, crops of the full-size portraits of Borgia, Louis Bertrand and Peter of Alcantara in `crops.jpg`): Pope Mark (en; it: the medallion), Louis Bertrand (en, es: Zurbarán), Francis Borgia (en, es), Tarachus, Probus and Andronicus (Greek fresco), Wilfrid, Edward the Confessor (Bayeux Tapestry), Gall (Pfärrenbach mural), Peter of Alcantara (en: Cleveland statue; es: the El Greco museum painting), Ursula (Crivelli), Mellonius (en, fr: Saint-Ouen window), Hilarion (for batch 38);
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`);
- St. Teresa's *Life*, tr. David Lewis, from Project Gutenberg (`teresa-life.txt`; ch. 27 §19 describes Peter of Alcantara);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`; the 22 October chapter has none);
- existing cards compared against (`existing-sheet.jpg`: Ignatius, Francis Xavier, Dominic, Vincent Ferrer, Louis of France, Henry, Stephen of Hungary, Columban, Sylvester, Augustine of Canterbury, Thomas Becket, Agnes, Lucy, Cecilia, Catherine of Alexandria, Francis of Assisi). Cards of batches 19–36 and 52–54 are compared through their face lines;
- every face line of batches 1–36 and 52–54 (`faces-all.txt`, regenerated for this batch).

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 10-07, 10-09, 10-10, 10-11, 10-12, 10-13, 10-16, 10-19, 10-21, 10-22). Names are the book's, with its pt-BR forms (São Marcos, São Luís Bertrando, São Francisco de Borja, São Taraco, São Wilfrido, Santo Eduardo, o Confessor, São Galo, São Pedro de Alcântara, Santa Úrsula, São Melônio). Titles after the name are dropped ("Bishop", "Abbot", "Virgin and Martyr"), except **"St. Mark, Pope" / "São Marcos, Papa"**, which keeps the book's "Pope" so the gallery doesn't show two cards named "St. Mark" (the Evangelist is `mark`). "His Companions" becomes "St. Tarachus and Companions" / "São Taraco e Companheiros". Ids add a word where the name is taken or common: `mark_pope` (`mark` is the Evangelist), `tarachus_companions`, `edward_confessor`, `peter_alcantara`. Initials: M, L, F, T, W, E, G, P, U, M.

**Titles.** None changes: all ten were "St." in the book and are "san/sant'/santi" in the Martyrology (`sb-*.txt`). Louis Bertrand was canonized in 1671, Francis Borgia in 1670, Peter of Alcantara in 1669, Edward in 1161 (Wikipedia); the others are of the first millennium. No saint here died after 1930.

**lifeChapter and reflection.** Nine cards have their chapter as lifeChapter and eight of them get its own `**Reflection**` paragraph. **Louis Bertrand has no lifeChapter.** He is told in the second to fourth paragraphs of `oct-09-dionysius-and-his-companions`, which `denis` (batch 9) already has as its lifeChapter, and its Reflection ("The Saints fasted, toiled, and wept… How shall we… face the judgment-seat of Christ?") is about the saints in general, not about him; so his card has no lifeChapter and no reflection, as with Agapetus (batch 34) and Rosalia (batch 35). **Mello's chapter `oct-22-mello` has no Reflection**, so his card has none; there is no fallback. Hilarion, in the same chapter, is left for batch 38 and will share it.

**proper.** None. No formulary in the repo is proper to any of the ten with en-US or pt-BR collect text. Formularies whose titles name them have Spanish or German text only: `sanctorale.10-03.spain` (Francisco de Borja, es), `sanctorale.10-19.spain` (Pedro de Alcántara, es), `sanctorale.10-16.german-speaking` (Gallus, de), `sanctorale.10-21.german-speaking` (Ursula und Gefährtinnen, de). There is none for Mark, Louis Bertrand, Tarachus, Wilfrid, Edward or Mello. Namesake: `sanctorale.04-25` (Mark the Evangelist). The title regex also catches `sanctorale.09-19.uruguay` ("Aguiar-Mella"), unrelated. `sanctorale.10-09.argentina` is untitled (its title is its own id) and has only a Gospel (Mt 5:13-16), no collect; nothing ties it to Louis Bertrand, so it is not his `proper`. Brazil has no formulary on 19 October for Peter of Alcantara, its patron. The formularies on the ten dates belong to other saints or feasts (10-07 Our Lady of the Rosary, 10-09 Denis, 10-10 Africa's Daniel Comboni and Spain's Thomas of Villanova, 10-11 John XXIII and Spain's Soledad Torres Acosta, 10-12 Brazil's Aparecida and Spain's Pilar, 10-16 Hedwig, 10-19 Brébeuf and Jogues, 10-22 John Paul II); nothing on 10-13; on the Martyrology's other days: 09-30 Jerome, 10-18 Luke, 01-05 the United States' John Neumann, 04-24 Fidelis.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Francis Borgia, Tarachus, Wilfrid, Edward, Gall, Peter of Alcantara, Ursula;
  - first sentence: Mark ("A Christian ought to be afraid of no enemy more than himself…").
- From the chapter, where the card has no Reflection of its own:
  - **Louis Bertrand**: the second sentence of his second paragraph ("He was favored with the gift of miracles, and while preaching in his native Spanish was understood in various languages.");
  - **Mello**: his paragraph after the semicolon, capitalised ("His zeal for the Faith engaged him in the sacred ministry… which see he is said to have held forty years.").

## St. Mark, Pope (7 October)

- Wikipedia (`Mark.txt`): pope from 18 January to 7 October 336, a Roman, son of Priscus by the Liber Pontificalis, which credits him with the basilica of San Marco and a cemetery church over the catacomb of Balbina, where he was buried. Martyrology (`sb-Marco.txt`): "A Roma, san Marco, papa, che costruì la chiesa del titolo in Pallacinis e una basilica nel cimitero di Balbina sulla via Ardeatina, dove egli stesso fu inumato."
- The book: a Roman of the clergy, watchful in peace as in persecution, pope eight months and twenty days, buried on the Ardeatine Way. The engraving shows him with a book among building stones.
- The card: the pope of 336 in a paenula and pallium, bareheaded, with the Gospels, his basilica on the Via Ardeatina rising behind.
- Face: the Italian medallion (`MarkIt.jpg`) is broad and bearded with curly hair. **Against the other popes** (`gal_clermont` is not a pope but is round and soft; `zephyrinus` flat-featured; `felix_i` curly-browed, protruding eyes; `marcellinus_pope` short, soft, heavy-lidded; `sylvester` long, narrow; `linus` hexagonal): Mark is round but firm, with small, deep-set, watchful eyes, one vertical frown line, a short high-bridged nose and a crisp, round grey beard.

## St. Louis Bertrand (9 October)

- Wikipedia (`Louis.txt`, `LouisEs.txt`): 1526 – 9 October 1581, a Valencian related to Vincent Ferrer, Dominican 1544, master of novices, buried the dead in the plague of 1557, landed at Cartagena in 1562, defended the natives' rights, "grave in demeanour" with "a gentle and sweet disposition"; canonized 1671; patron of Colombia (es). Martyrology (`sb-Luigi.txt`): "A Valencia in Spagna, san Luigi Bertrán, sacerdote dell'Ordine dei Predicatori, che insegnò il Vangelo di Cristo a varie popolazioni indigene dell'America Meridionale e le difese dagli oppressori."
- The book: the same; its "In 1545… he was professed" differs by a year from Wikipedia's clothing in 1544 (not on the card).
- The card: the Dominican preaching with a crucifix on the shore of Cartagena, indigenous listeners in the distance. The chalice with a serpent of Zurbarán's painting (the poison legend, which Wikipedia mentions) is left out: it is not in the book.
- Face after Zurbarán (`Louis.jpg`, `crops.jpg`): a narrow, triangular face under the black hood, lowered eyes, a thin moustache and small beard. **Against `vincent_ferrer`** (the other Valencian Dominican: long full oval, clean-shaven), `thomas_villanova` (soft long oval, heavy lids), `peter_verona` (square-round) and `robert_bellarmine` (rectangular, grey goatee): Louis is a sharply inverted triangle with hollow cheeks and low, straight brows.

## St. Francis Borgia (10 October)

- Wikipedia (`Borgia.txt`, `BorgiaEs.txt`): 28 October 1510 – 30 September 1572, Duke of Gandía, escorted the body of the Empress Isabella to Granada in 1539, Jesuit after his wife's death, third Superior General from 1565; canonized 1670. Martyrology (`sb-Borgia.txt`), on 30 September: "A Roma, san Francesco Borgia, sacerdote, che, morta la moglie… entrò nella Compagnia di Gesù e… eletto preposito generale, restò celebre per austerità di vita e spirito di preghiera."
- The book: the funeral of Queen Isabella, the Society, the embassy with Pius V's nephew; it dates his death **10 October 1572; Wikipedia and the Martyrology give 30 September** (not on the card).
- The card: the Jesuit in black with a small ivory skull wearing a ducal crown, Gandia behind.
- Face after the Spanish portrait (`Borgia.jpg`, `crops.jpg`): the high bald dome, long face and nose, down-turned eyes, thin grey moustache and chin tuft. **Against `ignatius_loyola`** (bald too, in the same black: a rounder face and a dark, full short beard), `antoninus_florence` (domed, short-faced, round eyes), `turibius` (broad at the jaw) and `john_capistrano` (triangular): Borgia is very long and narrow-jawed with a full, drooping nose tip and down-slanting eyes.

## St. Tarachus and Companions (11 October)

- Wikipedia (`Tarachus.txt`): martyrs of the persecution of Diocletian about 304 in Cilicia; "two versions of their Acts exist, both medieval fictions" by Wikipedia's wording, though Ruinart held the first authentic and Delehaye classed it among "historical romances". By the first version, Tarachus (born about 239) was a former soldier of Claudiopolis in Isauria, Probus a plebeian of Side, Andronicus a patrician of Ephesus; tried at Tarsus, Mopsuestia and Anazarbus; the beasts would not touch them. Martyrology (`sb-Taraco.txt`): "Ad Ainvarza in Cilicia… santi Táraco, Probo e Androníco, martiri, che durante la persecuzione dell'imperatore Diocleziano diedero la vita per testimoniare la fede in Cristo."
- The book: the same three examinations, the beasts crouching at their feet, the gladiators.
- The card: the three side by side with palms in the empty arena of Anazarbus, two beasts lying down far off; no wounds.
- **Kept, not skipped**: the Acts' historicity is disputed, but the three are in the current Martyrology.
- **Against the other groups** (`theban_legion`, `nereus_achilleus`, `faustinus_jovita`, `adrian_eubulus`): Tarachus is square and heavy with a broken nose and a square grey beard; Probus long-lower-faced, hollow-cheeked, close-eyed with a sparse black beard; Andronicus beardless, broad-cheeked and hexagonal with chestnut waves.

## St. Wilfrid (12 October)

- Wikipedia (`Wilfrid.txt`): about 633 – 709 or 710, Northumbrian noble, studied at Lindisfarne, Canterbury, Lyon and Rome, abbot of Ripon (where he introduced the Rule of St. Benedict), spokesman of the Roman party at Whitby in 664, bishop of York, twice exiled, appealed to Rome, one of the first bishops to bring relics back from Rome; "usually depicted either as a bishop preaching and baptising or else as a robed bishop holding an episcopal staff". Martyrology (`sb-Vilfrido.txt`), on 24 April: "A York nella Northumbria… san Vilfrido, vescovo, che esercitò per quarantacinque anni… il suo ministero e, costretto ripetutamente a cedere ad altri la sua sede, terminò in pace i suoi giorni tra i monaci di Ripon, dei quali era stato abate."
- The book: "A quick walker, expert at all good works, with never a sour face"; born about 634 (Wikipedia: about 633); Lindisfarne, Rome, Ripon; **bishop "of Lindisfarne" in 664 and of York five years later** (Wikipedia: of Northumbria in 664, installed at York in 669); died 12 October 709.
- The card: the bishop in green with a staff and a small reliquary from Rome, the stone church of Ripon behind.
- Face: no likeness; the book's "never a sour face" gives the smile. **Against `oswald_worcester`** (long, handsome), `richard_chichester` (broad, short, snub-nosed), `elphege` (bulging brow, short face) and `thomas_becket`: Wilfrid is clean-shaven, short-browed and long in the lower face, with a beaked nose, a long upper lip and a forward chin.

## St. Edward the Confessor (13 October)

- Wikipedia (`Edward.txt`): about 1003 – 5 January 1066, king from 1042, builder of Westminster Abbey, canonized 1161; 13 October is the day of his translations (1163, 1269) and an optional memorial in England only. The *Vita Aedwardi Regis* as quoted: "of outstanding height, and distinguished by his milky white hair and beard, full face and rosy cheeks, thin white hands, and long translucent fingers… he walked with eyes downcast". Martyrology (`sb-Edoardo.txt`), on 5 January: "A Londra in Inghilterra, sant'Edoardo, detto il Confessore: re degli Angli, amatissimo dal suo popolo per la sua grande carità, assicurò la pace al suo regno e promosse con tenacia la comunione con la sede di Roma." Emblems (Santi e Beati): crown, ring.
- The book: the exile, chastity in marriage, charity to beggars and lepers, peace, Westminster; died 5 January 1066.
- The card: the white-haired king crowned, with sceptre and ring, Westminster by the Thames and poor people at the gate.
- The white-bearded elder is required here by the Vita. **Against `stephen_hungary`** (grey-bearded, crowned), `henry` (brown-bearded), `gontran` (heavy jowls, weeping) and `ladislas` (long hexagonal): Edward is a smooth, full, rosy oval with lowered eyes and a milk-white beard parted in two soft points (the Bayeux Tapestry's long beard).

## St. Gall (16 October)

- Wikipedia (`Gall.txt`): about 550 – about 645, by his ninth-century Reichenau biographers an Irishman, companion of Columbanus from Bangor, left ill at Arbon in 612, hermit near the Steinach, refused the see of Constance and the abbacy of Luxeuil, died at ninety-five; **Hilty (2001) and Schär (2010) question the Irish origin**. Iconography: the bear that brought wood to his fire. Martyrology (`sb-Gallo.txt`): "Presso Arbon nell'odierna Svizzera, san Gallo, sacerdote e monaco, che, accolto ancora fanciullo da san Colombano nel monastero di Bangor in Irlanda, propagò con dedizione il Vangelo in questa regione… finché riposò quasi centenario nel Signore."
- The book: Irish, with Columban to England and France, Anegray, Luxeuil, left behind by illness, the cells by the Lake of Constance, refused Constance, died 646. The engraving shows him at a fire beside a half-built timber cell.
- The card: the monk in a black cowl with staff, bread and satchel, the fire and log cell in the forest, a small bear bringing a log.
- **Against the Irishmen** (`columban`: long, big-boned, jutting chin, red-grey, and his card has a bear too; `columba`: broad, clean-shaven, white; `fiaker`: heart-shaped, dark beard; `finbarr`: long, narrow, flaxen forked beard) and `francis_paola` (hooded, square grey beard): Gall is compact and square, snub-nosed, with a short bristly sandy-white beard and the Irish tonsure.

## St. Peter of Alcantara (19 October)

- Wikipedia (`Peter.txt`, `PeterEs.txt`): 1499 – 18 October 1562, Franciscan at sixteen, reformer of the Strict Observance, counsellor of St. Teresa; beatified 1622, canonized 1669; named patron of Brazil in 1826. Martyrology (`sb-Pietro.txt`), on 18 October: "Ad Arenas nella Castiglia in Spagna, san Pietro di Alcántara, sacerdote dell'Ordine dei Frati Minori, che, insigne per il dono del consiglio e per la sua vita di penitenza e di austerità… fu consigliere di santa Teresa di Gesù…". St. Teresa (`teresa-life.txt`, ch. 27 §19): "he was an aged man when I made his acquaintance; and his weakness was so great, that he seemed like nothing else but the roots of trees. With all his sanctity, he was very agreeable".
- The book: the cell four and a half feet long, a meal every three days, sackcloth, head and feet always bare, St. Teresa; died kneeling, 18 October 1562, at sixty-three.
- The card: the barefoot-order friar in sackcloth, bareheaded, with a cross and a book, a tiny friary on a Castilian hillside; no skull. Patron line from Wikipedia (Brazil, 1826). St. Teresa, who is in the book's engraving, is left off.
- Face after Teresa's words and the Spanish painting (`PeterEs.jpg`, `crops.jpg`): bald, gaunt, a short dark beard, eyes lifted. **Against `pius_v`** (gaunt, white beard), `bernardine_siena` and `john_capistrano` (smooth domes, clean-shaven), `paschal_baylon` (the other Spanish Franciscan: long, angular, thick-browed, black-haired) and `paphnutius`: Peter's skull and face show every bone — knobbed crown, brow bones, sunken temples, jutting cheekbones — with a sparse dark-grey beard.

## St. Ursula (21 October)

- Wikipedia (`Ursula.txt`): the legend of the British princess, the pilgrimage and the massacre at Cologne; the commemoration was removed from the General Calendar in 1969 because "their Passio is entirely fabulous: nothing, not even their names, is known about the virgin saints who were killed at Cologne", but they are still in the Martyrology. Martyrology (`sb-Orsola.txt`): "Presso Colonia in Germania, commemorazione delle sante vergini, che terminarono la loro vita con il martirio per Cristo nel luogo in cui fu poi costruita la basilica della città dedicata in onore della piccola Orsola, vergine innocente, ritenuta di tutte la capofila." Santi e Beati also notes an inscription in the choir of her church at Cologne, held authentic today and dated to the fourth or fifth century. Emblems: palm, arrow, crown, banner, the sheltering mantle.
- The book: a teacher of Christian children who fled the Saxons to the Rhine near Cologne, killed with her companions by the Huns in 453; "patroness of young persons and the model of teachers".
- The card: the young Briton with banner, arrow and palm, two small maidens under her mantle, the Rhine and Roman Cologne behind.
- **Kept, not skipped**: her Passio is legendary and her feast left the calendar, but the current Martyrology still names her. See Doubts.
- **Against the virgin martyrs** (`agnes`, `lucy`, `cecilia`: young soft ovals; `margaret_antioch`: short, square; `rosalia`: long, narrow, golden; `euphrasia`: high forehead; `julia_corsica`: convex profile): Ursula is long in the lower face with a strong, rounded chin, a Grecian nose and copper-red plaits.

## St. Mello (22 October)

- Wikipedia (`Mello.txt`, `MelloFr.txt`): Mellonius, bishop of Rouen, "known only from a 17th-century 'Life' of little historical value, meaning the historicity of his existence is uncertain"; the Life makes him a Briton sent by Pope Stephen I. The 2004 Martyrology lists him on 22 October. Martyrology (`sb-Mallone.txt`): "A Rouen nella Gallia lugdunense, ora in Francia, san Mallone, vescovo, che si ritiene abbia annunciato in questa città la fede cristiana e costituito la sede episcopale."
- The book: "said to have been a native of Great Britain", first bishop of Rouen, "said to have held" the see forty years, died about the beginning of the fourth century. No engraving.
- The card: the old bishop blessing, in gold, Gallo-Roman Rouen on the Seine behind.
- **Kept, not skipped**: the only source is a late Life, but he is in the current Martyrology, whose own entry is hedged ("si ritiene").
- **Against the old bishops of Gaul** (`albinus_angers`: pear-shaped, clean-shaven; `paternus_avranches`: shield-shaped; `remigius`: long, symmetrical, medium silver beard; `lambert`: rectangular, short dark-grey beard; `medard`: square, laughing): Mello's face is dish-shaped in profile (prominent brow and chin, a short snub nose set back), with round, close-set pale-blue eyes and a long, waving white beard.

## Look-alike risks that remain

- **Francis Borgia against `ignatius_loyola`**: both bald Jesuits in black. Reject a full dark beard or a round face on Borgia; his are a thin grey moustache, a chin tuft, a very long face and a drooping nose tip.
- **Peter of Alcantara against Francis Borgia**: both bald, gaunt Spaniards. Peter is dark, bony, bearded and in brown sackcloth with lifted eyes; Borgia pale, smooth-domed, nearly clean-shaven, in black with lowered eyes.
- **Louis Bertrand against Borgia**: both have a thin moustache and chin tuft. Louis is forty, dark-haired, hooded and sharply triangular; reject a bald head or grey on him.
- **Edward against Mello**: both white-bearded. Edward is crowned, full-cheeked and rosy, beard parted in two points, eyes lowered; Mello is tall and spare, dish-profiled, beard waving and undivided. Reject a parted beard on Mello.
- **Gall against `columban`**: same bear, same Irish tonsure. Keep the bear small and in the background with its log; Gall's face is compact, square and snub-nosed, not long and big-boned; his cowl is black, Columban's white.
- **Mark against Tarachus**: both grey-bearded, square-to-round older men. Reject a broken nose on Mark or a round face on Tarachus.
- **Tarachus's companions**: reject three similar men; they differ in age, beard and bone structure.

## Doubts

- **Louis Bertrand has no lifeChapter**: his chapter is `denis`'s lifeChapter and its Reflection is about the saints in general. If a Reflection that follows his paragraphs should count as his, he would share the chapter with `denis` (as `cletus` does with `marcellinus_pope` in batch 27).
- **Three cards rest on legend, kept because they are in the current Martyrology**: Ursula (Passio "entirely fabulous", feast removed 1969; the Martyrology names her as leader of the Cologne virgins), Tarachus and Companions (Acts called "medieval fictions" by Wikipedia, though Ruinart held them authentic), Mello (known only from a seventeenth-century Life). If any should be skipped, Hilarion (22 Oct) and then Theodoret (23 Oct) are next.
- **No `proper`** on any card: only Spanish (Borgia, Peter of Alcantara) and German (Gall, Ursula) formularies exist, and England's 13 October memorial of Edward isn't in the repo.
- **Dates that differ from the Martyrology or Wikipedia**, the card following the book: Borgia (Martyrology 30 Sep; the book dates his death 10 Oct, Wikipedia 30 Sep), Wilfrid (24 Apr), Edward (5 Jan; 13 Oct is his translation), Peter of Alcantara (18 Oct). The book also makes Wilfrid bishop "of Lindisfarne" in 664, where Wikipedia has bishop of Northumbria. None is on a card.
- **Gall's Irish origin** is the book's and the Martyrology's; two modern scholars (Wikipedia) think he came from Alsace or the Vosges. The card keeps the Irish tonsure.
- **"St. Mark, Pope"** keeps "Pope" in the name, unlike the batch's other names, to tell him from the Evangelist's `mark` card.
- **Patron lines not from the book**: Louis Bertrand "Patron of Colombia" (Spanish Wikipedia), Borgia "Superior General of the Jesuits" (Wikipedia), Tarachus "Martyrs of Cilicia", Edward "King of England", Gall "Monk and missionary" (the Martyrology), Peter "Patron of Brazil" (Wikipedia, 1826). From the book: Mark "Successor of St. Sylvester", Wilfrid "Bishop of York", Ursula "Patroness of young people and teachers", Mello "First bishop of Rouen".
- **Emblems not in the book**: Borgia's crowned skull, Edward's ring, Ursula's arrow and banner, Gall's bear (in Wikipedia and Santi e Beati, not in the chapters).
- **Louis Bertrand's and Mello's excerpts** are narrative sentences of the chapter, not devotional lines, because neither card has a Reflection.
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: St. Teresa (in Peter's engraving), Columban (in Gall's chapter), Queen Isabella and the companions of Ursula are left off or unnamed.
