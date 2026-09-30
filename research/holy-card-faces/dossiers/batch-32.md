# Batch 32 — the Pictorial Lives, 10 to 27 July

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 31: `seven_brothers`, `james_nisibis`, `john_gualbert`, `eugenius_carthage`, `simon_stock`, `alexius`, `margaret_antioch`, `victor_marseilles`, `christina_bolsena`, `pantaleon`. No line in this stretch is skipped. No cult here is suppressed, but five chapters rest on stories that historians now call legendary: the Seven Brothers' kinship, the scapular vision, Alexius, Margaret and Christina (see Doubts). The 15 June line (Sts. Vitus, Crescentia, and Modestus), skipped by batch 30, is still left alone. The book's other chapters here are carded elsewhere: Elizabeth of Portugal (8 Jul) is `elizabeth_portugal`, Ephrem (9) `ephrem`, Bonaventure (14) `bonaventure`, Henry (15) is claimed by batch 13, Camillus (18) `camillus`, Vincent de Paul (19) `vincent_de_paul`, Jerome Emiliani (20, his own chapter `jul-20-jerome-emiliani`) `jerome_emiliani`, Mary Magdalen (22) `mary_magdalene`, Apollinaris (23) is claimed by batch 13, James the Apostle (25) `james_greater`, and Anne (26) `anne`. The next unclaimed line is Sts. Nazarius and Celsus (28 July), left for batch 33.

The card data is in `../batches/batch-32.json`. `../consult/batch-32/build.py` writes it from `cards.py` (adapted from batch 31's). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Six do in both languages (the Seven Brothers, John Gualbert, Eugenius, Simon Stock, Alexius, Pantaleon). The other four (James, Margaret, Victor, Christina) have none, and their excerptSources say so;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`;
- that every word of each pt-BR name appears in the chapter title, except the two places added to a name (Nísibis, Antioquia), which must appear in the chapter;
- feasts against the index days;
- that each catalogMatch hits one unticked line that no other batch claims;
- that no id collides and that no other card uses the chapter;
- initials and refs.

Consulted material is in `../consult/batch-32/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Felicitas of Rome, Jacob of Nisibis (Hildesheim reliquary), John Gualbert (en: Neri di Bicci; it: Luca di Tommè), Eugenius of Carthage (en, fr), Simon Stock (Pietro Novelli), Alexius of Rome (Russian icon), Margaret the Virgin (Cretan icon), Victor of Marseilles (en, fr: statue with millstone), Christina of Bolsena (en: Ravensburg statue; it: Lotto), Saint Pantaleon (Hosios Loukas mosaic), and Nazarius and Celsus, fetched as the reserve;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`: the virgin martyrs Agnes, Agatha, Lucy, Cecilia, Philomena, Catherine, Perpetua and Felicity, Anastasia; the soldiers George, Sebastian, Nereus and Achilleus; Alexander, Cosmas and Damian, Ephrem, Romuald, John of the Cross, Cyril of Alexandria, Athanasius, the First Martyrs of Rome, the Servite Founders);
- every face line of batches 1–31, 52 and 53 (`faces-all.txt`).

`fetch.sh` is the fetcher, `list.txt` and `list2.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 07-10 to 07-13, 07-16, 07-17, 07-20, 07-21, 07-24, 07-27). Names are the book's, with its pt-BR forms (Os Sete Irmãos e Santa Felicidade, São Tiago, São João Gualberto, São Eugênio, São Simão Stock, Santo Aleixo, Santa Margarida, São Vítor, Santa Cristina, São Pantaleão). Titles after the name are dropped ("Martyrs", "their Mother", "Bishop", "Virgin and Martyr", "Martyr"). Two names get a place, because the book's bare name matches an existing card: **"St. James of Nisibis" / "São Tiago de Nísibis"** (the book has "St. James, Bishop"; `james_greater` exists) and **"St. Margaret of Antioch" / "Santa Margarida de Antioquia"** (the book has "St. Margaret"; `margaret_scotland` and `margaret_mary` exist). Both places come from the chapters ("Nisibis", "Antioch in Pisidia"). The other place names are in the ids only (`eugenius_carthage`, `victor_marseilles`, `christina_bolsena`), as batch 31 did with `gal_clermont`. Initials: S (The Seven Brothers), J, J, E, S, A, M, V, C, P.

**Titles.** None changes. All ten are "St." in the book and still are: John Gualbert was canonized in 1193, and the others have had a cult since before canonization procedures existed. Simon Stock was never formally canonized, but his cult has been approved (a liturgical office from 1435, extended to the whole Carmelite Order in 1564, per Wikipedia), and he has never been only "Blessed", so he stays "St.".

**lifeChapter and reflection.** Each card's lifeChapter is its own chapter, which the index names for its day. The card's reflection is the chapter's own `**Reflection**` paragraph, for six of the ten cards. James, Margaret, Victor and Christina have chapters with no Reflection, so their cards have none. There is no fallback. Margaret's chapter is separate from Jerome Emiliani's, although the index's 07-20 entry names both and carries Jerome's reflection. Margaret's card therefore gets no reflection, and Jerome's text stays with `jerome_emiliani`.

**proper.** None. No sanctoral formulary in the repo is proper to any of the ten with en-US or pt-BR text. The title hits are these:
- `sanctorale.07-20.german-speaking` ("Hl. Margareta, Jungfrau, Märtyrin") is Margaret of Antioch, but its collect is in German only, so the card can't use it;
- `sanctorale.03-07` is Perpetua and Felicity, the African Felicity, a different saint (Wikipedia: "not the same");
- `sanctorale.11-16` is Margaret of Scotland;
- `sanctorale.07-28.africa` is Pope Victor I;
- `sanctorale.08-18.africa` is Victoria Rasoamanarivo.

The formularies on the book's days belong to other saints. On 07-10 the German-speaking proper keeps Knud, Erich and Olaf. The others are 07-11 Benedict, 07-13 Henry, 07-16 Our Lady of Mount Carmel, 07-17 Inácio de Azevedo (Brazil), 07-20 Apollinaris, 07-21 Lawrence of Brindisi and 07-24 Charbel (German-speaking: Christopher). Simon Stock's own feast in the Carmelite proper, 16 May, has no formulary in the repo.

**Excerpts.**
- From the saint's own Reflection:
  - the Seven Brothers: the first clause of the second sentence, closed with a full stop ("Let them imitate the earnestness of St. Felicitas…");
  - the first sentence: John Gualbert, Simon Stock, Alexius;
  - the second sentence of the quotation: Eugenius ("Water quencheth a flaming fire, and alms resisteth sin.");
  - the whole of it: Pantaleon.
- From the chapter, where there is no Reflection:
  - **James**: the first clause of his prayer on the tower ("Lord, Thou art able by the weakest means…");
  - **Margaret**: the first sentence;
  - **Victor**: the sentence after "In this general consternation,";
  - **Christina**: "Christina remained unshaken in her faith."

## The Seven Brothers and St. Felicitas (10 July)

- Wikipedia (`Felicitas.txt`): the seven are real Roman martyrs. The Depositio Martyrum (mid-fourth century) keeps them on 10 July in four cemeteries: Alexander, Vitalis and Martialis in the Jordani, Januarius in Praetextatus, Felix and Philip in Priscilla, Silvanus in Maximus. Januarius's tomb dates from the late second century. Felicitas is certain only by name and her burial on the Via Salaria (23 November). "A legend presents her as the mother of the seven", and the Depositio "does not say that they were brothers". The Nuremberg Chronicle woodcut (lead) shows her veiled, with seven small heads on a sword.
- The book: a noble widow under Antoninus, brought with her sons before the prefect Publius, telling them "look up to heaven". It gives each son's death and says she was martyred four months later. The engraving shows her with her boys before the seated prefect.
- The card shows the mother with her seven sons, graded by age (about twelve to twenty-four), and no instruments of death.
- **Against `first_martyrs_rome`** (a veiled matron at the centre of a group), **`perpetua_felicity`** (the African Felicity), **`servite_founders`** (seven faces) and **`monica`**: Felicitas is fifty-five, long-faced, with high, flat cheekbones and a square, prominent chin, in plum and dark grey. The sons are told apart by structure, from the long, aquiline, bearded Januarius to the chubby Martialis.

## St. James of Nisibis (11 July)

- Wikipedia (`James.txt`): an anchorite near Nisibis from about 280, who according to Theodoret wore no clothes and built no shelter. He became bishop (c. 300–308), was present at Nicaea (325) and prayed from the walls during Shapur II's siege (337/338), when the gnats came. The Chronicle of 724 says he died during that siege. Lead image: the Hildesheim reliquary head.
- The book: a hermit of the high mountain, the feigned dead man, the siege and the gnats, "He died in 350". **The book's 350 against Wikipedia's 337/338:** the card shows no date. The book's engraving shows him praying from the wall.
- **Against `ephrem`** (his disciple: small, compact, sparse beard, in a black hood), `simeon_stylites` (small, narrow, chiselled), `lucian_antioch`, `john_damascene` (long, narrow) and `athanasius`: James is square and big-boned, with a heavy flat brow ridge, a broad, flat-bridged nose, small, very dark deep-set eyes and a long, dense grey-streaked black beard.

## St. John Gualbert (12 July)

- Wikipedia (`Gualbert.txt`, `GualbertIt.txt`): c. 985 – 12 July 1073, the Good Friday forgiveness, the crucifix of San Miniato that bowed its head, Vallombrosa founded in 1036, the struggle against simony, canonized in 1193. Neri di Bicci's panel (lead) and Luca di Tommè's show an old monk in a grey-brown habit with a short grey beard.
- The book: born 999, the blood feud, San Miniato, Vallombrosa, the burning of San Salvi, died 11 July 1073. **The book's birth year (999) and day of death (11 July) differ from Wikipedia's (c. 985, 12 July).** The card shows neither. The engraving shows the kneeling enemy with his arms out like a cross.
- **Against `romuald`** (white habit, bald dome, long white beard), `benedict`, `bernard_clairvaux`, `bruno`, `william_montevergine` (white habit, black beard): John is in ash-grey, with a short, close silver beard, high jutting cheekbones over flat cheeks, and a narrow, square-tipped chin, and he holds a bowing crucifix.

## St. Eugenius (13 July)

- Wikipedia (`Eugenius.txt`, `EugeniusFr.txt`): elected to Carthage in 480, allowed by Huneric at the instance of Zeno. He defended the faith at the conference of 484 and was exiled to the desert of Tripoli under the Arian Antonius. Gunthamund recalled him, Thrasamund exiled him again, and he died on 13 July 505 at Vieux near Albi in a monastery over St. Amaranthus's tomb. Lead image: a Milanese statue of a mitred bishop.
- The book: the same outline, with 481 for the election and alms "excessive"; its Reflection is on alms. The engraving shows a bishop in exile in a street.
- **Against `augustine`, `cyril_alexandria`, `athanasius`, `fulgentius` (short, broad, bald), `victorian_carthage` and `marcellinus_embrun`** (long, fine-boned, narrow): Eugenius is long-faced with sunken temples, a tall crown, a strongly arched bony nose, heavy-lidded eyes, full lips and a tight, curled white beard, and he is giving a loaf.

## St. Simon Stock (16 July)

- Wikipedia (`SimonStock.txt`): an English Carmelite of the thirteenth century and perhaps prior general from 1254. "Historical evidence about Simon's life is very scarce": two fourteenth-century necrologies attest his holiness. "There is no evidence for him having lived for a time in a hollow tree." The scapular vision is first recorded more than a century later, scholars question it, and the Swanington letter is "a fabrication". The devotion itself "remains widespread and is recommended by the Catholic Church". His feast is 16 May.
- The book: the boy hermit in the tree trunk, prior general at Aylesford in 1245, the vision at Cambridge on 16 July 1251, the scapular, death at Bordeaux in 1265. The engraving shows the Virgin holding out the scapular to a kneeling friar.
- **Recurring face.** He already appears on the batch-16 card `mount_carmel`, kneeling before Our Lady. This card copies that face line word for word, so the two cards agree. `recurring-figures.md` has no entry for him, and this batch doesn't add one (see Doubts).
- The card shows him alone, holding the scapular, with a light above him and no figure in it, so it doesn't repeat the `mount_carmel` scene. It leaves out the hollow tree, which Wikipedia says has no evidence behind it.
- **Against `peter_luxemburg`** (also triangular, but a youth of eighteen) and `john_of_the_cross` (a Carmelite, but bearded and dark): Simon is seventy, gaunt, white-haired and tonsured.

## St. Alexius (17 July)

- Wikipedia (`Alexius.txt`): two versions of the story. In the Syriac, a "man of God" begged at Edessa under Bishop Rabbula (412–435). The Greek makes him the son of the Roman Euphemianus, who lived seventeen years under his father's stairs. His cult came to Rome only in the late tenth century (Santi Bonifacio e Alessio on the Aventine). The feast left the General Calendar in 1969 "because of the legendary character of the written life". The Roman Martyrology keeps him on 17 July, but with the wording "a man of God is celebrated under the name of Alexius, who, as reported by tradition…". Lead image: a Russian icon, long-haired and bearded.
- The book: the Greek story, told as fact. The engraving shows him lying under the stairs with a scroll.
- **Against `paul_hermit`, `simeon_stylites`, `mary_egypt`** (desert ascetics), `john_damascene` and the long-haired, Christ-like type: Alexius is small, narrow and tall-faced, with long flat cheeks, a fine nose, down-sloping soft eyes, a small receding chin, cropped greying hair and a sparse, patchy beard.

## St. Margaret of Antioch (20 July)

- Wikipedia (`Margaret.txt`): a martyr of Antioch in Pisidia, c. 304. In her legend she is the daughter of the pagan priest Aedesius, raised by a Christian nurse as a shepherdess, courted by Olybrius, swallowed by a dragon and beheaded. Britannica calls the story "generally regarded to be fictitious"; the Golden Legend already called the dragon legend. She is in the Roman Martyrology on 20 July and left the General Calendar in 1969. She is one of the Fourteen Holy Helpers, and her iconography is the shepherdess or the dragon.
- The book: a short, careful chapter, "According to the ancient Martyrologies…", with the rest told as "She is said to have been…". It has no Reflection. The engraving shows a kneeling girl before an executioner.
- The card shows the shepherdess of her Life, with a cross and a palm. It leaves out the dragon.
- **Against the virgin martyrs (`agnes`, `lucy`, `agatha`, `catherine_alexandria`, `anastasia`, `philomena`)**, which all share one oval, idealised face, and `genevieve` (broad, square-jawed, twenty, a Frank): Margaret is sixteen, with a short, square face, wide flat cheekbones, a broad-bridged nose, very large wide-set eyes and strong level brows, and she wears black braids. The sheep grazing behind her must not become a lamb in her arms, which is Agnes's attribute.

## St. Victor (21 July)

- Wikipedia (`Victor.txt`, `VictorFr.txt`): a Roman officer at Marseilles, racked, dragged and imprisoned; he converted his guards Longinus, Alexander and Felician, kicked over Jupiter's altar, was put under a millstone and then beheaded (c. 290 or 303/304). John Cassian built the abbey of Saint-Victor over the cave. He is the patron of Tallinn and of millers. The images are a Dutch medallion and a Belgian statue, both bearded soldiers with a millstone.
- The book: the same, told at length. It has no Reflection. The engraving shows the soldier overturning the altar.
- **Against `george`** (a youthful knight in armour), **`sebastian`** (a nude youth) and **`nereus_achilleus`** (Roman soldiers: blocky and flat-topped, and a beardless youth): Victor is a sandy-haired, blue-grey-eyed Gaul with sharply cut cheekbones, a flat-bottomed cleft chin and a slightly broken nose, and he holds a millstone.

## St. Christina (24 July)

- Wikipedia (`Christina.txt`, `ChristinaIt.txt`): "The existence of Christina is poorly attested". Archaeology shows a female martyr's tomb and cult at Bolsena by the late fourth century, and she appears in the procession of virgins at Sant'Apollinare Nuovo. Her Passion dates from the ninth century. The 1969 reform omitted her "because nothing is known of this virgin and martyr apart from her name and her burial at Bolsena", but the 2004 Roman Martyrology keeps her and tells the legend (the idols, the lake, the furnace, the arrows). Her images carry a millstone and arrows (the Ravensburg statue, Lotto).
- The book: the legend, told as fact. It has no Reflection. The engraving shows her unharmed in the furnace.
- **Against `maria_goretti`** (a round-faced child), `pancras`, `agnes` and `cecilia`: Christina is thirteen, a small inverted triangle with a high, rounded forehead, a tiny upturned nose, round, far-apart light-brown eyes and fair-auburn hair.

## St. Pantaleon (27 July)

- Wikipedia (`Pantaleon.txt`): a physician of Nicomedia, recalled to the faith by Hermolaus and beheaded in 305. The Catholic Encyclopedia calls the Lives "valueless", but his martyrdom is backed by fifth-century cult (Theodoret, Procopius, the Hieronymianum). He is one of the Fourteen Holy Helpers and the patron of physicians, "depicted as a beardless young man". Lead image: the Hosios Loukas mosaic, a youth with short curls.
- The book: the emperor's physician, who apostatised and was recalled by Hermolaus, gave all to the poor and was beheaded at Nicomedia in 303. **The book gives 303; Wikipedia gives 305.** The card shows no date. The engraving shows a bearded man, perhaps Hermolaus, pointing to a physician at his table.
- **Against `cosmas_damian`** (bearded physician twins), `casimir` (long, narrow, pale, straight shoulder-length hair), `vincent_saragossa`, `sebastian` and `herman_joseph`: Pantaleon is olive-skinned, with a cap of short, tight curls, long, thin nose, close-set almond eyes and a long, narrow chin. He holds a medicine box and a spoon.

## Look-alike risks that remain

- **Margaret and Christina against the virgin martyrs**: the model tends to paint every young martyr with the same oval face. Reject an oval face on either. Margaret is square-jawed with black braids. Christina is a thirteen-year-old with a small triangular face, a high forehead and a tiny upturned nose. Reject a lamb in Margaret's arms (Agnes).
- **Pantaleon against `casimir`**: both young, clean-shaven and long-faced. Reject straight or shoulder-length hair on Pantaleon; he has tight short curls, olive skin and a medicine box.
- **Simon Stock against `mount_carmel`**: they must match. Check his face against the `mount_carmel` draft once both exist.
- **The Seven Brothers**: eight faces in one window. Reject repeated faces among the sons, and a Felicitas who looks like a young woman.
- **John Gualbert against `romuald`**: reject a white habit or a long white beard.
- **Victor against `nereus_achilleus`**: reject a dark-haired, blocky Roman soldier.
- **James against `ephrem`**: reject a small, slight man in a black hood.

## Doubts

- **Legendary stories, lines kept.** The rule skips a line whose cult is suppressed or which rests on a discredited story. None of these cults is suppressed; all ten saints are in the Roman Martyrology. Five chapters, though, tell stories the sources call legendary:
  - **Margaret**: "generally regarded to be fictitious" (Britannica, via Wikipedia). The book itself hedges ("is said to have been"), and the card leaves out the dragon.
  - **Christina**: "nothing is known … apart from her name and her burial at Bolsena". Her tomb and cult are real, but the book tells the whole legend as fact.
  - **Alexius**: the Martyrology itself says "a man of God is celebrated under the name of Alexius, who, as reported by tradition…". His feast left the calendar because of "the legendary character" of the Life.
  - **The Seven Brothers**: the seven martyrs are historical, but "a legend" makes Felicitas their mother, and the book's Reflection turns on that kinship.
  - **Simon Stock**: the man is historical, but the scapular vision the book tells, and his Reflection's scapular, are historically questioned. The Church still recommends the devotion.

  These follow the precedent of `vitalis_ravenna`, `marcus_marcellianus` and `john_nepomucene`, which were kept because their cults are genuine. Vitus's line was skipped only because the Martyrology drops his companions as fictitious. If "rests on a discredited story" should cover Margaret, Christina or Alexius, skip that line, and the replacements in order are Nazarius and Celsus (28 Jul), then Germanus (30 Jul).
- **Simon Stock in `recurring-figures.md`.** He is now on two cards. The brief says to add a recurring figure there, but this task allowed only the batch's own files, so the line wasn't added. Proposed entry: his face line as on `mount_carmel`, which this card copies.
- **James's and Margaret's names** add a place ("of Nisibis", "of Antioch") to the book's bare name, to keep them apart from `james_greater` and `margaret_scotland`. The pt-BR places are the chapters' own ("Nísibis", "Antioquia"). Alternative: the book's bare names, with the place in the id only.
- **The Seven Brothers card** has eight figures, one more than `servite_founders`. If that crowds the window, show the three youngest in front and the four eldest behind, less individually.
