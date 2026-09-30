# Batch 21 — the Pictorial Lives, 8 to 17 February

Ten cards, the next ten unclaimed lines of "From the Pictorial Lives of the Saints" after batch 20: `john_matha`, `apollonia`, `severinus_agaunum`, `benedict_aniane`, `catherine_ricci`, `valentine`, `faustinus_jovita`, `john_britto`, `onesimus`, `flavian`. The book's other chapters in this stretch (Romuald 7 Feb, Scholastica 10 Feb) are already cards; the other catalog lines on these dates (Jerome Emiliani, Lourdes, the Servite Founders) are claimed by earlier batches, and nothing else in the catalog falls on 8–17 February unclaimed except St. Giuseppe Allamano (16 Feb), which is a canonization line, not a Pictorial Lives one. The card data is in `../batches/batch-21.json`, written by `../consult/batch-21/build.py`. That script checks each excerpt verbatim in both languages against the card's own chapter or its day's index reflection, that each `lifeChapter` exists in en-US and pt-BR and is the index's chapter for its day (John de Britto excepted, see below), each feast against the index day, that each catalogMatch hits one unticked line no other batch claims, that no id collides with `content/saints/` or another batch, and that each initial matches the name. It also lists every OF formulary on the ten dates and every formulary whose title names one of the ten. Consulted pictures and extracts are saved in the same folder: Wikipedia summaries and extracts with lead images (`*.json`, `*.txt`, `*.jpg`), Catholic Encyclopedia articles (`ce-*.txt`), the book's engravings (`book-*.jpg`), Commons pictures (`John_of_Matha_LaHyre.jpg`, `John_of_Matha_Quellinus.jpg`, `Benedict_Aniane_SaintGuilhem.jpg`, `Flavian_icon.jpg`, `Naldini_Ricci.jpg` with its Commons page `Naldini_Ricci_commons.txt`), and copies of existing cards compared against (`existing/`). `fetch.sh` is the fetcher.

**Dates, names, initials.** Feasts follow the book (index days 02-08 … 02-17; Britto and Onesimus share 02-16). Names are the book's, tidied: "St. Severinus of Agaunum" adds the place, since there are several Severinuses (the OF has Severin of Noricum and a Severinus martyr); "St. Apollonia" drops "and the Martyrs of Alexandria" because the card shows her alone (as batch 20 did with Bridgid). **John de Britto** is "Blessed" in the book (written before 1947) and in the catalog line; he was canonized by Pius XII on 22 June 1947 (Wikipedia), so the card calls him "St. John de Britto" / "São João de Brito". See the doubts at the end. The initials are J, A, S, B, C, V, F, J, O, F.

**lifeChapter.** Every card has its own chapter, all ten checked in both languages. On 16 Feb the index names both Britto and Onesimus and points at `feb-16-onesimus-disciple-of-st-paul`, but its reflection is Britto's (the Imitation of Christ line that closes his chapter). Each card carries its own chapter, so each gets its own chapter's reflection at build time.

**proper.** None of the ten gets one. The formularies on these dates are other saints' or feasts: 02-08 Jerome Emiliani, 02-11 Lourdes, 02-14 Cyril and Methodius (and a religious-orders "Mother of Fair Love"), 02-17 the Servite Founders; nothing on 02-09, 02-12, 02-13, 02-15 or 02-16. No formulary title anywhere names Matha, Apollonia, Anian, Ricci, Valentine, Faustinus, Jovita, Britto, Onesimus or Flavian; the two "Severin" hits are other saints (`01-08/german-speaking`, Severin of Noricum; `11-08/religious-orders`, Severinus, martyr). John of Matha's modern date (17 Dec) has no formulary either.

**Excerpts.**
- Six come from the day's reflection in the index: a whole sentence, a first clause closed with a full stop (Matha), or a closing clause capitalised (Apollonia). Benedict of Anian's is the whole one-sentence reflection. Valentine's is the first sentence of his reflection; it is the only line the short chapter offers, though it reads a little dry.
- **Catherine of Ricci:** her own words from the chapter ("I long to suffer all imaginable pains, that souls may quickly see and praise their Redeemer").
- **John de Britto:** his reply to the Nuncio, from the chapter. His chapter's Reflection is a line of the Imitation, not his.
- **Onesimus:** the first sentence of his own chapter's Reflection, since the 02-16 index reflection is Britto's.

## Structures across the batch

| | Age | Structure | Hair, beard, headdress |
|---|---|---|---|
| John of Matha | 50 | medium oval, convex profile: sloping forehead, large curved high-bridged nose, short chin set back, close-set eyes, thin arched brows | clean-shaven; dark cropped crown with tonsure |
| Apollonia | 65 | short and wide, low broad forehead, small soft chin, very large close-set Fayum eyes, near-meeting arched brows, long slender hooked nose | grey-streaked black hair under a deep-blue veil |
| Severinus | 60 | long mid-face: long straight nose with a broad tip, long upper lip, wide-set drooping eyes with pouches, upswept brows, large ears | iron-grey tonsure ring; long spade-shaped iron-grey beard |
| Benedict of Anian | 70 | very high square forehead with three level lines, moist deep-set pale eyes, thin crooked nose, hollow cheeks, lean square jaw | thin white tonsure ring; short close-trimmed white beard |
| Catherine of Ricci | 45 | broad moon face, wide flat high-coloured cheeks, short broad nose with flared nostrils, small wide-set heavy-lidded eyes, faint high brows, parted lips | white wimple and white veil |
| Valentine | 50 | oblong, rounded lifting cheekbones, crinkling eyes, deep smile lines, very wide full-lipped smiling mouth | short dark curls greying; short rounded dark beard |
| Faustinus | 32 | long rectangle, straight jaw, high narrow nose bridge, heavy straight brows | short wavy dark-blond; short neat beard |
| Jovita | 25 | short soft round, wide snub nose, round eyes, full cheeks | beardless; chestnut curls |
| John de Britto | 45 | lean and long, sharply cut cheekbones over deep hollows, narrow very high-bridged nose, arched black brows | saffron turban-cloth; full round black beard |
| Onesimus | 30 | wide, flat-planed, high wide-set cheekbones, broad low-bridged nose, very wide-set eyes, wide full mouth, square cleft chin | beardless; short tight black curls |
| Flavian | 58 | high rounded cheekbones over sunken temples, short flat forehead with a low hairline, long beaked nose, close-set eyes, long narrow chin | short tight grey curls; long narrow pointed grey beard |

## St. John of Matha (8 Feb)

Face: a Provençal of about fifty, clean-shaven, with a convex profile: a sloping forehead, a large curved nose, a short chin set back, close-set bright eyes under thin arched brows. Dark cropped hair with a small tonsure.

- The engraving by Martin van den Enden after Erasmus Quellinus II (Commons, local `John_of_Matha_Quellinus.jpg`) and La Hyre's full-length study (local `John_of_Matha_LaHyre.jpg`), which I checked: both clean-shaven with cropped hair in the white habit and scapular with the cross, La Hyre with a shackle and chain in hand. The book's engraving (local `book-feb-08-john-of-matha.jpg`) shows the cross on the breast and a purse held out to a Moor. The card keeps all three: the white habit, the shackle, the purse.
- The cross: "white, with the red and blue cross" (Wikipedia, Trinitarians); the Trinitarian scapular's upright is red and its crossbar blue (same article). The book says the angel's cross was "red and blue".
- Book: on his second return from Tunis with 120 freed slaves, the Moors took the rudder and sails; he tied his cloak to the mast, and the ship reached Ostia. Hence the background.
- Age: the book has him die in 1213 at fifty-three; Wikipedia gives a birth in 1169, so forty-four. The card takes about fifty.

## St. Apollonia (9 Feb)

Face: an Alexandrian of about sixty-five with a short, wide face, a low broad forehead, a small soft chin, very large close-set dark eyes under thick arched brows that nearly meet, and a long slender hooked nose. A deep-blue veil.

- The book calls her "an aged virgin" and the Catholic Encyclopedia quotes Dionysius's *parthénos presbûtis*, which it reads as possibly a deaconess rather than aged. The card follows the book and shows her old, not the young girl of Zurbarán (Wikipedia lead image, local `Saint_Apollonia.jpg`) or the book's hooded figure at the pyre (local `book-feb-09-apollonia-and-the.jpg`).
- "She is represented in art with pincers in which a tooth is held" (Catholic Encyclopedia). The card keeps that sign, held up gently, and a palm. No fire and no wound.
- The eyes and brows are those of the Roman-Egyptian Fayum portraits, a real type of her city and century; the structure is our choice. Setting: the walls of Alexandria (the book: she was led outside the city) with the Pharos.

## St. Severinus of Agaunum (11 Feb)

Face: a Burgundian of about sixty with a long mid-face, a long straight nose with a broad tip, a long upper lip, wide-set drooping grey eyes with pouches, upswept brows and rather large ears. A long, spade-shaped iron-grey beard.

- No likeness survives. The book's engraving (local `book-feb-11-severinus.jpg`): a tonsured monk with a long beard, spreading his cloak by the sick king's bed. The card keeps the tonsure, the long beard and the cloak, offered forward over his arm.
- French Wikipedia (local `Severin_d_Agaune.txt`): he "étend son manteau sur le malade, et la fièvre tombe", and died at Château-Landon on 11 February 507. Its lead image is a stained-glass window with crossed croziers at Château-Landon, of no use for the face. English Wikipedia has no article.
- His age is unknown: the book says only that he had governed his community "many years". Sixty and an iron-grey beard keep him off the white-bearded elder.
- Setting: Saint-Maurice in the Valais, the abbey at the foot of its cliff in the Rhône valley. Early sixth century, so a plain staff and no mitre.

## St. Benedict of Anian (12 Feb)

Face: a Visigoth of about seventy with a long face under a very high square forehead with three level lines, moist deep-set pale-blue eyes, a thin nose with a crook in the bridge, hollow cheeks and a lean square jaw under a short white beard.

- The gilded statue in the church of Aniane (Wikipedia lead image, local `Benedict_of_Aniane.jpg`) and the painted relief from Saint-Guilhem-le-Désert (Commons, local `Benedict_Aniane_SaintGuilhem.jpg`): both bearded, in the black Benedictine habit. The book's engraving (local `book-feb-12-benedict-of-anian.jpg`): an old, bearded monk resting under trees in open country.
- Wikipedia and the Catholic Encyclopedia: born c. 747 as Witiza, son of the Goth Aigulf, Count of Maguelone; died 821. Hence about seventy and the fair colouring. The book: the gift of tears, his hermitage on the brook Anian, and his code of the monastic rules collated with one another. Hence the moist eyes, the brook and the two books.
- **Against `benedict`**: the same name, initial, black habit and book. This card has no crozier, a short close beard rather than a long flowing one, a lean hollow-cheeked face, two books, and the Languedoc garrigue instead of an Italian hill.

## St. Catherine of Ricci (13 Feb)

Face: a Florentine woman of about forty-five with a broad, moon-shaped face, wide flat high-coloured cheeks, a short broad nose with flared nostrils, small wide-set heavy-lidded grey eyes, faint high brows and a small parted mouth. White wimple and veil.

- The portrait inscribed "B. Catherina de Ricciis Florentina" in the Museo Civico of Montepulciano (Commons, local `Naldini_Ricci.jpg`, page `Naldini_Ricci_commons.txt`), attributed there to Giovanni Battista Naldini (1535–1591), who was her contemporary. The inscription's "B." (*Beata*, a title she received formally in 1732) suggests the lettering at least was added later, and I could not confirm whether the face was painted from life. The card follows its face, its all-white habit and veil, the open book and the open hand.
- The later lead image on Wikipedia (local `Catherine_de_Ricci.jpg`) gives her a long, idealised oval, and the book's engraving a black mantle and crucifix. I followed the older portrait.
- Book: her compassion for the Holy Souls. Hence the open hand. The stigmata and the chain are not shown.
- **Against `catherine_siena`** (existing card, local `existing/catherine_siena.jpg`): the same initial C, a Dominican nun with a crucifix and a Tuscan town. This card has the white veil (no black), a broad face, no lily and no crown of thorns, the crucifix standing on a ledge rather than in her hands, and Prato's green-and-white cathedral instead of Siena's tower.

## St. Valentine (14 Feb)

Face: a Roman of about fifty with an oblong face, rounded cheekbones that lift when he smiles, crinkling dark eyes, deep smile lines and a very wide, full-lipped, warm smile. Short dark curls greying, a short rounded beard.

- No likeness survives. The Catholic Encyclopedia counts two or three Valentines on this day and finds their Acts "of no historical value". The book makes him a Roman priest who helped the martyrs under Claudius II, beaten and beheaded about 270, with a church near the Ponte Mole on the Flaminian Way. Its engraving (local `book-feb-14-valentine.jpg`) shows a bearded priest raising the chalice in a prison.
- Wikipedia (local `Saint_Valentine.jpg`, a bishop by Bradaška) shows the Terni tradition with a mitre. The card follows the book: a priest, no mitre.
- The warm, smiling face is our choice. No hearts or lovers' tokens, which belong to later custom (the Catholic Encyclopedia's second section).

## Sts. Faustinus and Jovita (15 Feb)

Faces: Faustinus (left), about thirty-two, has a long rectangular face with a straight jaw, a high narrow nose bridge, heavy straight brows and a short dark-blond beard. Jovita (right), about twenty-five, is beardless, with a short, soft, round face, a wide snub nose, round brown eyes and chestnut curls.

- No likenesses survive. The Catholic Encyclopedia: noble brothers of Brescia, "the elder brother, Faustinus, being a priest, the younger, a deacon". English Wikipedia's lead swaps the roles and also reports the 1969 remark that Jovita was a woman; I followed the Catholic Encyclopedia and the book (both brothers).
- Foppa's Pala della Mercanzia (Wikipedia lead image, local `Faustinus_and_Jovita.jpg`): both young and beardless, one in a red chasuble with a book, the other in a dalmatic, each with a palm. The book's engraving (local `book-feb-15-sts-faustinus-and-jovita.jpg`): both bearded, kneeling for the sword. The card takes Foppa's vestments and gives the beard to the elder only, so the brothers read apart.
- Setting: the Capitolium of Brescia, a first-century temple, stood in their day; the Cidneo hill above the town.

## St. John de Britto (16 Feb)

Face: a Portuguese of about forty-five, sun-browned, with a lean, long face, sharply cut cheekbones over deep hollows, a narrow very high-bridged nose, deep-set dark eyes under arched black brows and a full black beard cut round. A saffron turban-cloth.

- The popular image (Wikipedia lead image, local `John_de_Britto.jpg`): bearded, in a cream-and-saffron shawl and a red cap, with a crucifix and a palm. I found no portrait from life.
- Catholic Encyclopedia (local `ce-john-de-britto.txt`): "His dress was yellow cotton; he abstained from every kind of animal food and from wine." Wikipedia: he took the Tamil name Arul Anandar and lived as a Tamil sannyasi. He was born 1647 and beheaded at Oriyur on the Marava coast in 1693, so forty-five. The Catholic Encyclopedia dates his death 11 February, Wikipedia 4 February. The card uses the book's day, 16 February.
- **Against `francis_xavier`** (local `existing/francis_xavier.jpg`: an oval face, a short dark beard, a black cassock): this card has the saffron dress and turban, a lean hollow-cheeked face and a fuller beard.

## St. Onesimus (16 Feb)

Face: a Phrygian of about thirty, beardless, with a wide, flat-planed face, high wide-set cheekbones, a broad low-bridged nose, very wide-set dark eyes, a wide full-lipped mouth and a square cleft chin. Short, tight black curls.

- No likeness survives. The book's engraving (local `book-feb-16-onesimus-disciple-of-st-paul.jpg`): a young, beardless man in a belted tunic, kneeling with a scroll before a toga'd man (Philemon). The card follows it: the letter-bearer.
- The Painter's Manual lists "Onésime : vieillard" among the Seventy (`consult/prelates-src/didron-fr.txt` l. 13991). The book also makes him a bishop and a martyr under Domitian in 95. I chose the book's picture of the freed slave carrying the letter, which is what the chapter tells. If you prefer the Manual's old bishop, the face and dress would change.
- Setting: Colossae in the Lycus valley under Mount Cadmus, Philemon's city. I avoided the travertine of Hierapolis, which `apollinaris_hierapolis` already uses.

## St. Flavian (17 Feb)

Face: a Greek of about fifty-eight with high rounded cheekbones over sunken temples, a short flat forehead with the grey hair growing low in tight curls, a long beaked nose, close-set deep-set grey eyes and a long, narrow, pointed grey beard.

- No likeness survives. The Menologion of Basil II (Wikipedia lead image, local `Flavian_of_Constantinople.jpg`) and a modern icon (Commons, local `Flavian_icon.jpg`): bearded, in a phelonion and an omophorion with large crosses. The book's engraving (local `book-feb-17-flavian.jpg`): mitred and bearded before Dioscorus. The card keeps the Byzantine vestments without the mitre.
- Book and Catholic Encyclopedia: Patriarch 447–449, deposed at the Robber Council of Ephesus and so ill-used that he died in exile three days later (Catholic Encyclopedia); his appeal to Pope Leo. Hence the sealed scroll. Constantinople is painted before Justinian, with no Hagia Sophia dome.
- His age is unknown. The structure is our choice.

## Look-alike risks that remain

- **Benedict of Anian against `benedict`**: the same name, initial and habit. Reject a draft that gives him a long flowing beard, a crozier or a broad face. The high lined forehead, the hollow cheeks and the two books must show.
- **Catherine of Ricci against `catherine_siena`**: the same initial and order. Reject a black veil, a lily or a crown of thorns. The broad, flat-cheeked face from Naldini is the check.
- **Severinus and Benedict of Anian in one batch**: two old tonsured monks. Severinus has grey-brown wool, a long spade beard, drooping eyes and large ears; Benedict has the black cowl, a short white beard and hollow cheeks. Put them on one sheet with `romuald`, `benedict` and `francis_paola`.
- **John de Britto against `francis_xavier`** and `peter_claver` (Jesuits): the saffron dress carries most of it. Check that the beard is fuller and the cheeks hollow.
- **Valentine** may slide into the stock thirties man with brown curls and a short beard. He is fifty, greying, and the very wide smile and lifting cheekbones must come through.
- **Onesimus and Jovita**: two beardless young men. Onesimus is wide and flat-planed with tight black curls and darker skin; Jovita is soft and round with chestnut curls. Compare with `pancras` and `alexander`.
- **Flavian** against `apollinaris_hierapolis` and `cyril_alexandria` (Greek bishops): the low curly hairline, the beaked nose and the narrow pointed beard are the check. His pointed beard is grey and he is nearly sixty, so he is not the Christ-like young man the brief warns against.
- **John of Matha**: the generator may straighten the profile into a stock clean-shaven friar. Check the curved nose and the short chin, and compare with `thomas_aquinas` (also in white).
- **Apollonia** against `jane_frances_chantal` and `monica` (older women). The near-meeting arched brows and very large eyes must show; reject a young face.
