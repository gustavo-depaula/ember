# Batch 27 — the Pictorial Lives, 22 April to 13 May

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 26: `leonides`, `marcellinus_pope`, `zita`, `vitalis_ravenna`, `peter_verona`, `hugh_cluny`, `antoninus_florence`, `mammertus`, `epiphanius_salamis`, `john_silent`. No line in the stretch is skipped: none of the ten has a suppressed cult, though Marcellinus and Vitalis come close to the rule (see Doubts). The lines for 3, 6 and 8 May (the Discovery of the Holy Cross, St. John before the Latin Gate, the Apparition of St. Michael) are claimed by batch 18, and the book's other chapters here are carded elsewhere (George, Fidelis, Mark, Cletus, Paul of the Cross, Catherine of Siena, Philip and James, Athanasius, Monica, Pius V, Stanislaus, Gregory Nazianzen). Pachomius (14 May) is the next unclaimed line, left for batch 28.

The card data is in `../batches/batch-27.json`, written by `../consult/batch-27/build.py` (adapted from batch 26's). The script checks each excerpt verbatim in both languages against the card's chapter and, when the excerptSource says so, against its Reflection; that each `lifeChapter` exists in en-US and pt-BR and is on the card's day; which chapters have a `**Reflection**`/`**Reflexão**` paragraph (both languages agree); that no OF formulary title in any language names one of the ten; feasts against the index days; that each catalogMatch hits one unticked line no other batch claims; that no id collides; that no other card uses the chapter (but for the one shared with `cletus`); initials and refs. Consulted material is in the same folder: Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`), the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`; Peter's chapter has none), and the existing cards compared against (`existing-sheet.jpg`: Dominicans, abbots, Greek bishops, popes, women). `fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the image sheets. Pachomius's files are there too, fetched as the reserve.

**Dates, names, initials.** Feasts follow the book (index days 04-22, 04-26 to 04-29, 05-10 to 05-13; Peter and Hugh share 04-29). Names are the book's with its pt-BR forms (São Leônides, São Marcelino, Santa Zita, São Vital, São Pedro, Santo Hugo, Santo Antonino, São Mamerto, Santo Epifânio, São João, o Silencioso). Tidied: "St. Peter, Martyr" becomes "St. Peter Martyr" / "São Pedro Mártir" (his usual name in both languages, the book's own words without the comma); "St. Hugh, Abbot of Cluny" becomes "St. Hugh of Cluny" / "Santo Hugo de Cluny", apart from `hugh_grenoble`. The ids `marcellinus_pope` (apart from `marcellinus_embrun` and `marcellinus_peter`), `vitalis_ravenna`, `peter_verona`, `hugh_cluny`, `antoninus_florence`, `epiphanius_salamis` keep them apart from namesakes. None is "Blessed" in the book, so no title changes (Zita was canonized in 1696, Antoninus in 1523, Peter in 1253, Hugh in 1120). Initials: L, M, Z, V, P, H, A, M, E, J.

**lifeChapter and reflection.** Each card has its chapter in both languages. **Leonides** and **Hugh** have no `**Reflection**` paragraph, so their cards carry none. On **04-29** the book has two chapters and the index points at Hugh's while its reflection is Peter's; Hugh's card takes `apr-29-hugh` (no reflection), Peter's `apr-29-peter` (his own). **Marcellinus** shares `apr-26-sts-cletus-and-marcellinus` with the existing `cletus` card; its Reflection, on the cross as the road to eternal bliss, names neither pope, so it is as much his as Cletus's (see Doubts).

**proper.** None. No OF formulary in the repo, in any language or scope, is proper to any of the ten (the script matches every formulary title; the only hits are Zeno of Verona, Marcellinus of Embrun and Sts. Marcellinus and Peter, all other saints). The formularies on the ten book days are other saints (Peter Chanel, Catherine of Siena, John of Avila, Damien, Nereus and Achilleus, Our Lady of Fatima, …). Antoninus's Martyrology day, 2 May (Wikipedia), has Athanasius and a prelature dedication only.

**Excerpts.**
- From the saint's own Reflection: Zita (its second sentence, the voice's "Work and pray, pray and work", with the quotation marks), Vitalis (last sentence), Mammertus (the whole of it, Judith 4:11, without the quotation marks and the reference), John the Silent (first sentence).
- The saint's own words from the chapter, where the Reflection is generic or borrowed: Peter ("I believe in God, Creator of heaven and earth", his answer as a boy and the words he wrote dying), Antoninus ("To serve God is to reign", his dying words; the Reflection quotes St. Augustine on alms), Epiphanius (his saying on labour and the crown; the Reflection quotes 1 John 4:10).
- From the chapter, where it has no Reflection: Leonides ("He was a Christian philosopher, and excellently versed both in the profane and sacred sciences"), Hugh ("From his infancy he was exceedingly given to prayer and meditation, and his life was remarkably innocent and holy").
- **Marcellinus**: "In those stormy times of persecution Marcellinus acquired great glory", from his part of the shared chapter, because the Reflection names no one.

## St. Leonides (22 Apr)

- Wikipedia (`Leonides.txt`): Eusebius makes him Origen's father and a Greek, martyred under Septimius Severus in 202, beheaded under the prefect Laetus, his property seized; his wife hid Origen's clothes. Lead image: the Nuremberg Chronicle's Origen (not him). The Hermeneia's "Leonides, an old man with a short beard" (16 April) is another Leonides, a bishop, and is not used.
- The book's engraving shows him in a prison court, reading a letter, a chain at his wrist, which the card follows, with the Pharos of Alexandria through the window.
- **Against `justin`** (large, broad oblong, hump nose, grey curls) and `apollonius` (batch 26: broad, short, round-jawed Antonine bust): Leonides is square, with a flat vertical forehead, a cleft chin, wide-set grey-green eyes, a very short black beard. Against `lucian_antioch` (batch 19: domed forehead, square chin): the forehead here is flat and the eyes light and wide-set.

## St. Marcellinus (26 Apr)

- Wikipedia (`Marcellinus.txt`): pope 296–304; the Liber Pontificalis tells a lapse into offering incense, repentance and martyrdom, which Augustine denied and which other sources doubt; the joint feast with Cletus was removed from the General Roman Calendar in 1969, and "Saint Marcellinus is no longer mentioned" in the Roman Martyrology. Lead image: a medieval miniature of his beheading.
- The book tells only his pontificate "in those stormy times of persecution" and that "He has been styled a martyr, though his blood was not shed". The card's patron line is therefore "Pope" / "Papa", with no palm, and it shows neither the lapse nor a martyrdom. The engraving shows a pope led out among Romans and a soldier. The background is the Via Salaria with the catacomb of Priscilla, his burial place (Wikipedia).
- **Against `cletus`**, his companion of the day and chapter (lean, narrow, bony, close-set bright eyes, forked beard): Marcellinus is short, wide and soft, bald, with heavy lids and a short rounded beard. Against `callistus` (wide rectangle, full dark hair): grey, bald and soft. Against the other popes (`linus` hexagonal, `sylvester` long narrow, `julius_i` trapezoid, `anicetus` egg, `soter` heart, `celestine_i` hooked nose): his marks are the short, soft width and the grief lines.

## St. Zita (27 Apr)

- Wikipedia (`Zita.txt`): c. 1212–1272, a servant of the Fatinelli, silk merchants of Lucca, from the age of twelve; patroness of maids and domestic servants, invoked for lost keys; the bread made by angels; a star over her attic at her death; canonized 1696; her cult at San Frediano, whose façade mosaic is of the 13th–14th century (`SanFrediano.txt`). Lead image: a Baroque painting of her with a pitcher.
- The book's engraving shows a young servant with a pitcher on her head at a door. The card shows her with loaves for the poor in her apron and the keys at her belt, in her late forties (she served forty-eight years).
- **Against `veronica_milan`** (batch 20: short, broad, low brow, apple cheeks) and `maud` (broad, square): Zita's oval face leads with its lower half, a long upper lip and forward mouth, a short upturned nose. Against `jane_valois` (long, fuller below, small heavy-lidded eyes) and `euphrasia` (narrow oblong, high rounded forehead): a sloping forehead and large, round, bright eyes.

## St. Vitalis (28 Apr)

- Wikipedia (`Vitalis.txt`): "His legend relates" a citizen of Milan, husband of Valeria and said to be father of Gervasius and Protasius, who encouraged Ursicinus at Ravenna and was racked and buried under stones; "He was martyred in Ravenna, but all else in the story is suspect." Principal patron of Ravenna; the Basilica of San Vitale is built on the purported site of his martyrdom (`SanVitale.txt`). Lead image: Carpaccio's altarpiece of him as a knight on a white horse.
- The book tells the same story, with its own hedge ("is said to have been the father"). The card shows only a citizen of Milan with a palm at Roman Ravenna, near a lone palm tree (the book's "place called the Palm-tree"), and no burial or torments; it leaves out the sixth-century basilica. The engraving shows him with a spade beside Ursicinus's body.
- **Against `george`, `sebastian`, `hermenegild`** (batch 26: long, flat-cheeked, projecting chin, long Gothic hair) and `faustinus_jovita` (batch 21: long rectangular): Vitalis is a wedge, broad and square at the forehead with a heavy brow ridge, narrowing in straight lines to a narrow chin, with cropped hair.

## St. Peter Martyr (29 Apr)

- Wikipedia (`Peter.txt`): born at Verona in 1205 to a family perhaps sympathetic to the Cathars, received by St. Dominic, preacher and inquisitor in Lombardy, killed near Barlassina on the road from Como to Milan on 6 April 1252, reciting the Creed; the legend of the Creed written in his blood; canonized eleven months later; buried at Sant'Eustorgio (`SantEustorgio.txt`). Lead image: Pedro Berruguete's panel, a Dominican with a book.
- The book's chapter has no engraving. The card shows the Dominican habit and cappa, the book of the Creed and a palm, on the Como–Milan road, with a single cloud for the shade he obtained for his hearers. No axe, knife or blood, though his usual attribute is the blade in his head.
- **Against `thomas_aquinas`** (soft, round, youthful, pale), `dominic` (young oval) and `vincent_ferrer` (long, full oval): Peter is compact and square-round, with a muscular jaw, a dimpled chin, thick black brows almost meeting, and the dark shadow of a shaven beard.

## St. Hugh of Cluny (29 Apr)

- Wikipedia (`Hugh.txt`, `Cluny.txt`): born 1024 of the lords of Semur, abbot of Cluny 1049–1109, godfather of Henry IV and mediator at Canossa; he began the third abbey church, Cluny III, in 1089, the world's largest church until St. Peter's. Lead image: Codex Vat. lat. 4922, Hugh with Henry IV and Matilda.
- The book: a prince of the house of Burgundy, professed at sixteen under Odilo, abbot at twenty-five for sixty-two years, died 29 April 1109, canonized by Calixtus II. The engraving shows monks in a cloister. The card shows the great church rising behind him with its scaffolding.
- **Against `hugh_grenoble`** (batch 25: small, apple-round, bald dome), `aelred` (batch 20: long, soft, rounded chin, upturned nose, very large wide-set eyes), `bernard_clairvaux` (lean), `bruno` (long rectangle) and `norbert` (egg): Hugh is full-cheeked and square-oval, with a long, straight nose that runs from a high root with no dip and heavy-lidded, level eyes.

## St. Antoninus (10 May)

- Wikipedia (`Antoninus.txt`): Antonio Pierozzi, 1389–1459, Dominican at Fiesole at sixteen, Archbishop of Florence from 1446; since 1969 not in the General Calendar, but kept in the Martyrology on 2 May; usually shown in his habit with the mitre set aside, giving food to the needy. Lead image (`Antoninus.jpg`): a painted portrait of a small, bald, clean-shaven Dominican archbishop with a long nose, raised brows and hollow cheeks, holding scales and a basket. San Marco (`SanMarco.txt`): his priory and tomb.
- The book: "Little Antony", named for his small stature, "the Counsellor", "the Father of the Poor", who gave his cloak to a beggar. The engraving shows him blessing among fallen men before the Palazzo Vecchio. The card follows the portrait's features, with the loaf and the scales and the mitre set aside.
- **Against `bernardine_siena`** (thin, pointed face, pointed chin, heavy lids), `pius_v` (gaunt, long, aquiline, white-bearded), `honoratus` (batch 20: domed forehead, drooping pale eyes, beard) and `hugh_grenoble` (apple-round, soft, large blue-grey eyes): Antoninus has a big domed cranium over a short face widest at the cheekbones, with a long narrow nose, round dark eyes under high-raised brows, a wide thin mouth and a short square chin.

## St. Mammertus (11 May)

- Wikipedia (`Mamertus.txt`, `Rogation.txt`): Bishop of Vienne from shortly before 462, died c. 475, brother of Claudianus Mamertus, of a family from the Lyon region; founder of the Minor Rogations before Ascension, from Sidonius and Avitus. Lead image: a statue of him. Vienne (`Vienne.txt`): a Roman provincial capital, with a Roman temple still standing.
- The book: the calamities, the fire quenched by his prayer, the three days of fasting and supplication. The engraving shows a bishop in procession under a canopy. The card shows him with the processional cross, the procession small among the fields behind. The pallium is left out (the book calls him Archbishop; the card does not claim a pallium for fifth-century Vienne).
- **Against `john_matha`** (batch 21: clean-shaven oval with a convex profile), `leander` (lean, long, hump), `eulogius_cordoba` (wide, hooked) and `celestine_i` (massive hooked nose, broad jaw): Mammertus's whole profile is convex, from the sloping forehead through a large curved nose to a firm chin, on a long, lean face with a trimmed grey beard.

## St. Epiphanius (12 May)

- Wikipedia (`Epiphanius.txt`): born c. 310–320 in Palestine, Bishop of Salamis in Cyprus, author of the Panarion against eighty heresies, strongly against images in churches. Lead image: a Serbian fresco (Kosovo) of a bald bishop with a long white beard. Salamis (`Salamis.txt`): rebuilt as Constantia, with the basilica of Bishop Epiphanius, where he is buried. The Hermeneia (`../hermeneia-ocr.txt`): "Epiphanius of Cyprus, an old man, bald, with a white beard."
- The book: monk in Egypt and Palestine, disciple of Hilarion, bishop about 367 while still wearing the monk's habit, died 403 after thirty-six years as bishop. The engraving shows a monk with a staff in the desert. The card has the monastic tunic under the bishop's omophorion.
- **Against `athanasius`** (bald, broad white beard), `simeon_stylites` (batch 19: small, chiselled, hooded, large eyes), `simeon_jerusalem` (batch 22: hatchet, long narrow) and `paul_hermit` (batch 20: long tapering, long hair): Epiphanius's face is small and bird-like, with pinched temples, a sharp pointed nose, small close-set black eyes under tufted white brows.

## St. John the Silent (13 May)

- Wikipedia (`John.txt`): born 454 at Nicopolis in Armenia, bishop of Colonia at twenty-eight for nine years, led by a bright cross to the laura of St. Sabas, lived hidden there and in the desert, died c. 558. Lead image: the Menologion of Basil II, an old monk with a white beard in a dark habit. Mar Saba (`MarSaba.txt`): the laura over the Kidron valley.
- The book tells the same, ending with forty years in his cell. The engraving shows a monk drawing water at a well. The card shows him hooded, hands folded, the laura's cells in the cliffs behind, the cross of light in the sky.
- **Against `john_climacus`** (batch 24: lean, bony, long rectangle), `theodosius_cenobiarch` (batch 19: broad, flat-planed, bald) and `anthony_abbot`: John has broad temples and a wide, high forehead, deep sockets with large, lowered eyes, a long nose with a hump and a down-pointing tip, and a long beard ending square.

## Doubts

- **Marcellinus.** His cult is not formally suppressed, but the 1969 reform removed his feast and, per Wikipedia, the Roman Martyrology no longer names him; the Liber Pontificalis's story of his lapse is doubted. The book's account (pontificate, glory in the persecution, "styled a martyr though his blood was not shed") is not discredited, so the card stands as "Pope" with no palm. If the set should follow the current Martyrology, this line is skipped and Pachomius (14 May) comes in.
- **Marcellinus's lifeChapter** is `apr-26-sts-cletus-and-marcellinus`, already `cletus`'s. The research brief counts a two-life chapter only if its reflection is about the saint; this Reflection is about neither pope, and the task asks that every card set `lifeChapter`. Both cards will show the same reflection. Alternative: omit `lifeChapter` on this card.
- **Vitalis.** Wikipedia: martyred at Ravenna, "all else in the story is suspect". The cult is not suppressed (principal patron of Ravenna; San Vitale), so the card stands, as Benezet's and Hermenegild's did in batch 26, but it keeps only a citizen of Milan with a palm at Ravenna. If "rests on a discredited story" should cover him, skip him and take Pachomius.
- **Hugh's and Leonides's excerpts** are plain sentences of the chapter, which has no Reflection. Alternative: leave `prayerExcerpt` off their cards.
- **Peter Martyr's name** is tidied from the book's "St. Peter, Martyr" to "St. Peter Martyr" / "São Pedro Mártir".

## Look-alike risks that remain

- **Peter against `thomas_aquinas`**: both clean-shaven, round-headed Dominicans. Reject a soft, pale, youthful face; Peter is older, olive, with a muscular jaw, a dimpled chin and near-meeting black brows.
- **Antoninus against `bernardine_siena`, `pius_v` and `hugh_grenoble`**: the small bald old man. Check the short, squared chin (not pointed), the round dark eyes under raised brows, the wide thin mouth; no beard.
- **Marcellinus against `cletus`**: same day and chapter, both old popes. Marcellinus must read soft and wide, bald, with a short rounded beard; reject a narrow face or a forked beard.
- **Hugh against `aelred` and the clean-shaven abbots**: the straight Greek line of the nose and the full cheeks are the check.
- **Zita against `jane_valois` and the young virgins**: she is a woman in her forties with a forward mouth and an upturned nose, not a soft young oval.
- **Epiphanius and John the Silent against the white-bearded elders** (`athanasius`, `anthony_abbot`, `theodosius_cenobiarch`, `paternus_avranches`): Epiphanius small and sharp, John broad at the temples with lowered eyes and a square-ended beard.
- **Peter**: reject a blade in the head or blood; the book and the palm carry the martyrdom.
