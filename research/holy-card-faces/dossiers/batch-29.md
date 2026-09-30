# Batch 29 — the Pictorial Lives, 28 May to 7 June

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 28: `germanus_paris`, `cyril_caesarea`, `felix_i`, `petronilla`, `pamphilus`, `pothinus_blandina`, `clotilda`, `francis_caracciolo`, `robert_newminster`, `claude_besancon`. No line in the stretch is skipped. No cult is suppressed, but three chapters rest partly on stories that have since been questioned: Felix I's martyrdom, Petronilla's descent from St. Peter, and the Life of Claude (see Doubts). 5 and 6 June (Boniface, Norbert) are carded already. The next unclaimed line is St. Medard (8 June), left for batch 30.

The card data is in `../batches/batch-29.json`. `../consult/batch-29/build.py` writes it from `cards.py` (adapted from batch 28's). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day. Robert's chapter is the one exception: the index's 06-07 entry names both saints but points at Claude's chapter;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Nine do in both languages; Claude's has none, and his excerptSource says so;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`;
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days;
- that each catalogMatch hits one unticked line that no other batch claims;
- that no id collides and no other card uses the chapter;
- initials and refs.

Consulted material is in `../consult/batch-29/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheets `wiki-sheet.jpg`, `wiki-sheet-2.jpg`), and the CatholicSaints.Info page for Cyril (`CyrilCSI.txt`);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`);
- every face line of batches 1–28 (`faces-all.txt`).

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 05-28 to 06-04, and 06-07 twice). Names are the book's, with its pt-BR forms (São Germano, São Cirilo, São Félix I, Santa Petronilha, São Pânfilo, São Potino and Santa Blandina, Santa Clotilde, São Francisco Caracciolo, São Roberto de Newminster, São Cláudio). Titles the book puts after the name are dropped ("Bishop", "Martyr", "Pope and Martyr", "Virgin", "Queen", "Archbishop"), and the book's "Felix I." loses its full stop. None of the ten is "Blessed" in the book, so no title changes: Francis Caracciolo was canonized in 1807, and the others have had a cult since before canonization procedures existed. The ids `germanus_paris` (apart from the 30 July Germanus), `cyril_caesarea` (apart from the three carded Cyrils), `claude_besancon` and `robert_newminster` (apart from `robert_bellarmine`) keep namesakes apart. Initials: G, C, F, P, P, P, C, F, R, C.

**The Lyons card's name** is our tidy of a long line: "Sts. Pothinus, Blandina and Companions" / "São Potino, Santa Blandina e Companheiros", with the patron line "Martyrs of Lyons" / "Mártires de Lião". "Potino", "Blandina" and "Lião" are the book's forms; "Companheiros" is ours. The book's line is "Sts. Pothinus, Bishop, Sanctus, Attalus, Blandina, and the other Martyrs of Lyons". The card shows all four named martyrs.

**lifeChapter and reflection.** Each card has its own chapter in both languages, and none is shared with another card. Nine chapters close with a `**Reflection**` paragraph, and that paragraph is the card's reflection. **Claude's chapter (`jun-07-claude`) has none**, so his card has no reflection. The corpus build (`scripts/build-corpus.py`, `_life_reflection`) reads only the card's own chapter and has no fallback. The index's 06-07 reflection is the one closing Robert's chapter, and it belongs to Robert's card alone. Robert's chapter has no engraving.

**proper.** None. No formulary in the repo with en-US or pt-BR collect text is proper to any of the ten. Two are proper to them, but only in French: `sanctorale.06-02.france` ("Saints Pothin, évêque, Blandine, vierge, et leurs compagnons, martyrs") and `sanctorale.06-04.france` ("Sainte Clotilde"). The script's other title hits are other saints: 02-14 Cyril and Methodius, 03-18 Cyril of Jerusalem, 06-27 Cyril of Alexandria, and 09-17 Robert Bellarmine. The universal formularies on the book's days belong to other saints and feasts: Paul VI, the Visitation, Justin, Marcellinus and Peter, and Charles Lwanga.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Germanus (the book's verses of the Psalms, quotation marks kept), the martyrs of Lyons, Clotilda, and Robert (two sentences, the longest excerpt in the batch);
  - the first sentence: Cyril, Felix I, Petronilla, Pamphilus and Francis Caracciolo.
- From the chapter, where there is no Reflection: **Claude** ("Fearing the obligations of that charge, he fled and hid himself, but was discovered and compelled to take it upon him."), from the first paragraph.

## St. Germanus (28 May)

- Wikipedia (`Germanus.txt`, `GermainDesPres.txt`): c. 496–576, born near Autun, abbot of St. Symphorian, Bishop of Paris from 555, called "Father of the Poor" in an early biography. Under his influence Childebert led a reformed life. He dedicated Childebert's church of St. Vincent (later Saint-Germain-des-Prés) in 558. Lead image: an old engraving of a clean-shaven, mitred bishop with a book.
- The book tells the same story: born about 469 at Autun, abbot, the dream of the keys of Paris, made bishop in 554, his house full of the poor, Childebert converted, and his death on 28 May 576 "being eighty years old". **The book's birth year (469) is older than Wikipedia's (c. 496)**; the card shows no date. The engraving shows a bald, bearded bishop at table with the poor.
- The card shows a sixth-century bishop without a mitre, like `albinus_angers`, giving bread to a poor man's hands, with Paris and the new basilica of St. Vincent behind him. He is clean-shaven, as in Wikipedia's engraving.
- **Against `gregory_langres`** (batch 19: long face with a heavy lantern jaw, high-bridged nose, heavy-lidded), `albinus_angers` (pear, jowls), `peter_celestine` (narrow, straight-sided, flat), `hugh_grenoble` (small apple-round), `wulfran` (long drooping nose) and `paternus_avranches`: Germanus's lower jaw and lip protrude slightly beyond the upper (an underbite), under a sloping forehead, with a thin straight nose and hollow cheeks.

## St. Cyril (29 May)

- There is no English Wikipedia article (French and Italian titles tried too). CatholicSaints.Info (`CyrilCSI.txt`): a boy of a wealthy pagan family, baptized in secret, banished by his father, imprisoned and beheaded in 251 at Caesarea in Cappadocia; memorial 29 May. It cites the Pictorial Lives among its sources, so it is not an independent witness.
- The book: a boy of the third century who repeated the name of Christ, was beaten and turned out by his father, and refused the judge's offer ("I left my home gladly, for I have a greater and a better which is waiting for me"). Led to the fire, "he expired, hastening, as he said, to his home". The book says fire and CatholicSaints.Info says beheading, so the card shows neither. The engraving shows a barefoot boy in a short tunic walking from his father's door.
- The card shows the boy with a palm, and behind him Caesarea (Kayseri) under Mount Argaeus (Erciyes; `Kayseri.txt`).
- **Against `pancras`** (round child's fullness), `venantius_camerino` (wide, flat across the cheekbones, blunt fringe), `benezet` (narrow, long, bony, freckled), `forty_martyrs_sebaste`'s youngest (narrow heart), `herman_joseph` (short, round, bossed forehead) and `aloysius_gonzaga`: Cyril's face is square and flat-planed, with a level hairline, a high-bridged straight nose, deep-set grey-green eyes under nearly meeting brows, a wide thin mouth and a square little chin, framed by short, tousled dark curls.

## St. Felix I (30 May)

- Wikipedia (`FelixI.txt`): Roman, pope from 269 to his death on 30 December 274, author of a dogmatic letter on the unity of Christ's Person, and the pope whose recognition Aurelian made the test in the Antioch dispute with Paul of Samosata. He was buried in the catacomb of Callixtus. "While later accounts mistakenly honored him as a martyr, contemporary scholarship suggests he died of natural causes". Wikipedia says the martyrdom in the Liber Pontificalis is "manifestly due to a confusion" with a martyr of the same name on the Via Aurelia.
- The book tells the Antioch affair and "He himself obtained the glory of martyrdom". The card's patron line is **"Pope" / "Papa"**, like `marcellinus_pope` and `soter`, and it shows no palm and no sword. The excerpt is the book's first reflection sentence, on patience under trials.
- The lead images are an engraving of an old, tiaraed, clean-shaven pope (en) and a papal portrait medallion (it, `FelixIt.jpg`) with thick curly hair and a full curly beard. The card keeps the medallion's curls and beard. The catacomb of Callixtus is the background.
- **Against `linus`** (hexagonal, curly salt-and-pepper beard; the closest existing card), `hegesippus` (tall, high-domed, protruding eyes), `apollonius` (Antonine bust, broad, short, round-jawed), `celestine_i`, `soter` and `julius_i`: Felix's width is in flaring, fleshy cheekbones under a low, creased forehead with curls growing low on it. He has large, slightly protruding eyes under high arched brows and a short, wide nose.

## St. Petronilla (31 May)

- Wikipedia (`Petronilla.txt`, `Domitilla.txt`): an early Roman virgin, perhaps of the Aurelii. Her identification as Peter's daughter "may have stemmed simply from the similarity of names", and "the mistake arose from misunderstanding an inscription". Her grave is in the catacomb of Domitilla on the Via Ardeatina, with a fresco of her receiving the dead Veneranda into heaven; her relics were later taken to the Vatican. She is in the Roman Martyrology on 31 May. Lead image: a manuscript miniature of a young woman healing cripples.
- The book is cautious itself: "She is said to have been a daughter of the apostle St. Peter … But it seems not certain whether St. Petronilla was more than the spiritual daughter of that apostle", buried on the way to Ardea. The engraving shows her seated by a boat at the shore.
- The card shows no kinship with Peter. She wears the catacomb dress (a dalmatic with clavi and a light veil) and holds a book and lilies, before the Via Ardeatina and Domitilla's entrance.
- **Against `saragossa_martyrs`'s Engratia** (long oval, square-tipped chin, strong straight nose), `euphrasia` (narrow oblong, high rounded forehead, long neck), `anastasia` (diamond), `genevieve` (broad, square-jawed) and the original virgin martyrs (`agnes`, `lucy`, `cecilia`, `philomena`: soft ovals): Petronilla's face is a long rectangle with soft corners, a widow's peak, deep-set eyes under low straight brows, a short upper lip and a small square chin.

## St. Pamphilus (1 June)

- Wikipedia (`Pamphilus.txt`): of a rich and honourable family of Berytus, pupil of Pierius at Alexandria, a priest at Caesarea Maritima, founder of its library, and teacher of Eusebius. He was tortured under Urbanus in November 307, wrote the Apology for Origen with Eusebius in prison, and was beheaded in February 309. Wikipedia gives his feast as 16 February, "with an additional commemoration on 1 June". Lead image: a Menologion miniature of the martyrdom.
- The Hermeneia (`../hermeneia-ocr.txt`, l. 7199): "Pamphilus, a young man with a small beard". The card keeps the small beard and makes him about fifty, as his career requires. He was a magistrate before becoming a pupil at Alexandria.
- The book's life matches Wikipedia, except that it ends "by a slow fire" where Wikipedia has beheading; the card shows neither. The patron line "Priest and martyr" comes from Wikipedia, because the book does not call him a priest. The engraving shows him copying at a desk among scrolls, which is the card's scene.
- **Against `anicetus`** (tall egg, sloping forehead, long thin nose), `john_climacus` (lean bony rectangle, vertical furrows), `hegesippus` (high dome, protruding eyes), `jerome` and `simeon_jerusalem` (hatchet): Pamphilus has a bulging forehead with horizontal creases over a narrow jaw whose chin thrusts forward, a large arched nose, small close-set eyes narrowed in a short-sighted squint, and a small close-trimmed beard.

## Sts. Pothinus, Blandina and Companions (2 June)

- Wikipedia (`Lyon.txt`, `Pothinus.txt`, `Blandina.txt`): the persecution at Lugdunum in 177 is known from the letter of the churches of Lyons and Vienne in Eusebius, and 48 martyrs are counted. Pothinus was "born around the year 87, probably at Smyrna", a disciple of Polycarp and the first bishop of Lyon. He died at about ninety of ill-treatment in prison. Attalus was a Roman citizen of Pergamum. Sanctus was the deacon of Vienne. Blandina was a slave taken with her mistress; she wore out her torturers, encouraged the fifteen-year-old Ponticus, and was the last to die. Lead images: the Amphitheatre of the Three Gauls, and a stained-glass St. Pothin.
- The book tells the same story, with Irenaeus a priest of the city. Its engraving shows the old bishop dying in chains in a cell.
- The card has four figures half-length, each with a palm: Pothinus and Blandina in front, Sanctus and Attalus behind. The background is Lugdunum at the meeting of the rivers, with Fourvière. There are no beasts and no amphitheatre.
- **Pothinus against `polycarp`** (his master: small heart, apple cheeks, short rounded beard), `john_egypt` (elfin triangle, large ears), `epiphanius_salamis` (small, narrow, bird-like) and `irenaeus` (long, narrow, ash-brown beard; the existing card's background is also Lyons): Pothinus is an inverted triangle, wide and bald above a small chin, with a big, bony, beaked nose and a thin, wispy white beard.
- **Blandina against `genevieve`** (broad, square-jawed) and `veronica_milan` (short, broad, apple cheeks, upturned nose): Blandina is plain and round-cheeked, with a snub nose, small, deep-set, shining eyes, a wide smiling mouth and a full, round chin. She is small and slight.
- **Sanctus** is heavy, square and clean-shaven, with a cleft chin and a flattened nose. **Attalus** is tall and narrow, with high sharp cheekbones, an aquiline nose and a trimmed grey beard.

## St. Clotilda (3 June)

- Wikipedia (`Clotilde.txt`, `Clovis.txt`): c. 474–545, of Burgundy, whose uncle Gundobad killed her father. As wife of Clovis she brought him to baptism, and she built the church of the Holy Apostles in Paris. She was a widow for thirty-four years near St. Martin's tomb at Tours, where she died on 3 June 545. Art shows her "as a praying queen and as a nun". Lead image: Delpech's lithograph, with a crown over a veil.
- The book tells the same: the court of Gondebald, the marriage, Clovis's conversion in 496 as "the fruit of our Saint's prayers", the church of Sts. Peter and Paul, the quarrels of her sons, and her widowhood in prayer. The engraving shows her crowned, standing beside the seated king.
- The card shows the praying widow-queen at Tours, in a white widow's veil and wimple with a slender circlet, with the Loire and St. Martin's basilica behind her.
- **Against `margaret_scotland`, `elizabeth_portugal` and `hedwig`** (existing crowned or veiled queens with lowered eyes), `jane_valois` (long, fuller in the lower half, small heavy-lidded eyes), `maud` (broad, square) and `cunegundes` (triangle): Clotilda's face is lean and long, with high rounded cheekbones and soft hollows beneath, large grey eyes that droop at the outer corners, and a small firm mouth. She wears a circlet, not a tall crown.

## St. Francis Caracciolo (4 June)

- Wikipedia (`Caracciolo.txt`, `CaraccioloIt.txt`): Ascanio Caracciolo, 1563–1608, born at Villa Santa Maria in the Abruzzo, cured of a leprosy-like disease at twenty-two. He co-founded the Clerics Regular Minor (1588), whose fourth vow is not to seek dignities and whose rule includes perpetual adoration by turns. He died at Agnone on the vigil of Corpus Christi, 4 June 1608, at forty-four, and was canonized in 1807. Iconography (it): the monstrance, and episcopal insignia at his feet.
- Lead images: an old engraving of him adoring the monstrance with his hand on his heart (it), and an engraving of him sweeping a sickroom in a cassock (en). The face follows the first: long, with a receding hairline, heavy-lidded eyes turned up, a long, fleshy-tipped nose, a moustache and a short beard. The it article says the disease disfigured his face for a time; the card idealises it away.
- The book: the "Preacher of Divine Love", prayer before the tabernacle, "The zeal of Thy house hath eaten me up". The book says "his face usually emitted brilliant rays of light", which the card leaves out.
- **Against `camillus`** (existing: black cassock, dark hair and short beard; the closest), `john_nepomucene` (soft long oval, prominent eyes, clean-shaven), `leander` (lean, long, receding, arched black brows) and `philip_neri`: Francis has soft, full cheeks and a soft jaw, puffy upper eyelids and a fleshy nose tip, with the rapt, upturned gaze of the engraving. Camillus is broad and sturdy with a bold gaze.

## St. Robert of Newminster (7 June)

- Wikipedia (`Robert.txt`, `Newminster.txt`, `Fountains.txt`): born at Gargrave, c. 1100–1159, studied at Paris, a parish priest and then a monk of St. Mary's at York. He was among the monks expelled in 1132 who founded Fountains on the Skell, which became Cistercian. He was abbot of Newminster near Morpeth from about 1138, "devout, prayerful, and gentle", and "merciful in his judgment of others". His feast is 7 June. **The lead image**, a Baroque pulpit figure at Baumgartenberg (Austria), is not clearly of him and was not used.
- The book agrees, apart from dates: it has him a monk at **Whitby** and Newminster founded in **1137**, where Wikipedia has St. Mary's at York and about 1138. It tells the honeyed bread sent to the poor, the plate returned by itself, and St. Godric's vision at his death in 1159. The chapter has no engraving.
- The card shows him in the Cistercian white cowl with an abbot's staff and the plate of honeyed bread, before Newminster in the Wansbeck valley.
- **Against `aelred`** (batch 20, the other English Cistercian abbot: long face, soft rounded chin, very large soft eyes), `richard_chichester` (broad, short, open), `bruno` (existing, white habit) and `bernard_clairvaux`: Robert's face tapers from a wide forehead to a small, round, dimpled chin, with a short nose with a bump on the bridge, wide-spaced grey eyes with crow's-feet, and a wide, thin-lipped mouth with a long upper lip.

## St. Claude (7 June)

- Wikipedia (`Claude.txt`, `ClaudeFr.txt`, `SaintClaude.txt`): c. 607–696/699, of Salins (by tradition of the castle of Bracon), canon of Besançon, abbot of Condat (the later Saint-Claude in the Jura) and bishop of Besançon, who returned to Condat. The Catholic Encyclopedia says his Life "has been the subject of much controversy", and Wace called it "a vast farrago of improbabilities". **The order of his offices differs**: Wikipedia has him abbot at thirty-four (641/2), bishop in 685, then back to Condat; the book has him bishop about 683 for seven years, then a monk at St. Oyend in 690 and abbot after that, dying in 703 (born about 603, so about a hundred). The card shows the monk-abbot with the mitre laid aside, which fits both accounts.
- Images: a stained-glass bishop (en) and a painted rondel of a monk with a crozier and a mitre at his feet (fr). Both are clean-shaven, and the card is too.
- The card's excerpt is from the chapter's first paragraph, and **the card has no reflection** because the chapter has none.
- **Against `william_bourges`** (batch 19: wide, short, flat profile, about sixty-five), `hugh_grenoble` (small, apple-round, large round eyes), `marcellinus_pope` (short, wide, soft, heavy upper lids), `benedict` and `anthony_abbot`: Claude is about ninety, with a short, wide, rounded-square face, a flat snub nose, small bright deep-set eyes in a web of wrinkles, a wide mouth drawn in by age and a soft fold under the chin.

## Doubts

- **Felix I's martyrdom** is the book's; Wikipedia calls it a later confusion with a namesake. His cult is not suppressed, since he is still venerated as a pope. The card keeps the book's chapter and reflection, but its patron line is only "Pope" and it shows no palm. If "rests on a discredited story" should cover this, the line would be skipped and St. Medard (8 June) would come in.
- **Petronilla** as Peter's daughter is a legend the book itself doubts; her cult (tomb, basilica, fresco) is ancient and genuine. The card shows no kinship.
- **Claude's Life** is disputed (Catholic Encyclopedia, Wace), and the book's chronology differs from Wikipedia's. The card keeps to what both share.
- **The Lyons card's name** ("Sts. Pothinus, Blandina and Companions" / "São Potino, Santa Blandina e Companheiros") is our tidy; "Companheiros" is not the book's word. An alternative is the book's full line, which is long for a card.
- **Cyril** has no Wikipedia article. The only other source, CatholicSaints.Info, cites the Pictorial Lives, so nothing independent confirms the book's details. Its beheading differs from the book's fire, and the card shows neither.
- **Pamphilus's patron line** "Priest and martyr" comes from Wikipedia, not from the book.

## Look-alike risks that remain

- **Felix I against `linus`**: both have grizzled curls and a curly beard in a red chasuble. Check Felix's broad, short face with flaring cheekbones, protruding eyes under high arched brows and a low creased forehead. Reject a hexagonal, gently arched Linus face.
- **Francis Caracciolo against `camillus`**: both wear a black cassock and have dark hair and a short beard. Check the receding hairline, the puffy upper lids with the upturned gaze, and the soft, full cheeks. Reject a broad, bold, square face.
- **Clotilda against `margaret_scotland`, `elizabeth_portugal` and `hedwig`**: a veiled, crowned or wimpled lady with lowered eyes. Check the lean face with high cheekbones and hollows, the drooping outer eye corners and the slender circlet. Reject a soft round face or a tall crown.
- **Pothinus against `polycarp` and `irenaeus`** (his master and his successor; `irenaeus` also has Lyons behind him): check the wide bald dome over a small chin, the beaked nose and the wispy beard. Reject a round, rosy elder.
- **Germanus and Claude against the clean-shaven old men** (`hugh_grenoble`, `peter_celestine`, `albinus_angers`, `william_bourges`): Germanus is long, with a forward jaw and lower lip; Claude is short and wide, with a snub nose. The two must differ from each other: reject either as a generic, kindly, bald old bishop.
- **Cyril against `pancras` and `venantius_camerino`**: a boy of twelve with a square face, a high-bridged nose and nearly meeting brows. Reject a round child or a wide, flat face with a blunt fringe.
- **Petronilla against the original virgin martyrs**: reject a soft oval. She has a widow's peak, a long rectangular face and a small square chin.
- **Robert against `aelred` and `bruno`**: a white Cistercian cowl on a clean-shaven tonsured man. Check the tapering face with the dimpled chin and the bumped nose.
