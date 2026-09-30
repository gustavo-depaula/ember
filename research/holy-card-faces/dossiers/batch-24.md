# Batch 24 — the Pictorial Lives, 15 to 30 March

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 23: `zachary`, `abraham_mary`, `wulfran`, `catharine_sweden`, `victorian_carthage`, `ludger`, `john_egypt`, `gontran`, `jonas_barachisius`, `john_climacus`. **One line in the stretch is skipped on purpose: 24 Mar, "St. Simon, Infant Martyr"** (see the end). John Climacus (30 Mar) takes its place as the tenth. The book's other chapters in this stretch are covered elsewhere: Patrick (17 Mar) is `patrick`, Cyril of Jerusalem (18 Mar) is `cyril_jerusalem`, Joseph (19 Mar) is `joseph`, Benedict (21 Mar) is `benedict`, the Annunciation (25 Mar) is `annunciation`.

The card data is in `../batches/batch-24.json`, written by `../consult/batch-24/build.py`. The script checks each excerpt verbatim in both languages against the card's chapter or its day's index reflection; that each `lifeChapter` exists in en-US and pt-BR, is the index's chapter for its day and is used by no other batch or existing card; which chapters have a `**Reflection**`/`**Reflexão**` paragraph (both languages agree); each feast against the index day; that each catalogMatch hits one unticked line no other batch claims; that no id collides with `content/saints/`, the holy-card data or another batch; that each initial matches the name and each ref exists. It lists every OF formulary on the ten dates and every formulary whose title names one of the ten, with the languages of its collect. Consulted material is in the same folder: Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`), the Theodotus chapel photographs (`zach_*.jpg`, `zach-sheet.jpg`, note `Zachary-portrait-note.txt`), the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`), and existing cards compared against (`existing/`, sheet `existing-sheet.jpg`). `fetch.sh` is the fetcher; `list*.txt`, `l3`, `l4` its inputs.

**Dates, names, initials.** Feasts follow the book (index days 03-15, 03-16, 03-20, 03-22, 03-23, 03-26, 03-27, 03-28, 03-29, 03-30). Names are the book's, pt-BR forms kept as the book has them (São Wulfrano, São Ludgero, São Gontrão, São Baraquísio); "Catharine" keeps the book's spelling, as batch 23 kept "Cunegundes". The long catalog titles are shortened: "Sts. Jonas and Barachisius" / "São Jonas e São Baraquísio" (the companions go into the patron line's plural), and "Sts. Victorian and Others" / "Santos Vitoriano e Outros" is kept. All ten were already "St." in the book and none has changed title: Catharine's cult was approved by Innocent VIII in 1484 and the formal process was never finished, but she is *sancta* in the Roman Martyrology (Swedish Wikipedia, local `Katarina_sv.txt`); the others predate canonization procedures. Initials: Z, A, W, C, V, L, J, G, J, J.

**lifeChapter and reflection.** Each card has its own chapter, the index's chapter for its day, in both languages. Eight chapters end with a `**Reflection**—` paragraph (identical to the index reflection). **Zachary** and **Victorian** have none, so those two cards carry no reflection.

**proper.** None of the ten gets one. On the dates: 03-15 Clement Mary Hofbauer (German only), 03-23 Turibius of Mogrovejo (another saint), 03-26 **"Hl. Liudger, Bischof" — St. Ludger's own formulary, but German only** (`sanctoral/03-26/german-speaking.json`, id `sanctorale.03-26.german-speaking`), so it can't show on the card; the script fails if it ever gains en-US or pt-BR text. Nothing on the other dates. Title matches elsewhere are other saints (Anthony Mary Zaccaria 07-05, Catherine of Siena 04-29, Catherine of Alexandria 11-25). No Swedish/Nordic formulary for Catharine exists in the repo.

**Excerpts.**
- From the day's reflection: Abraham and Mary (first sentence), Wulfran (first sentence), Catharine (its first clause, closed with a full stop), John of Egypt (first sentence), Gontran (the Beatitude it quotes).
- **Zachary** (no reflection): "He loved the clergy and people of Rome to that degree that he hazarded his life for them", the first paragraph's second sentence up to "for them".
- **Victorian** (no reflection): the first sentence of his answer to Huneric, "Tell the king that I trust in Christ."
- **Ludger:** his answer to Charlemagne, "whilst we are occupied with Him, it is our duty to forget everything else", capitalised. The reflection's three sentences are all long.
- **Jonas and Barachisius:** their answer, "it was more reasonable to obey the immortal King of heaven and earth than a mortal prince", capitalised. The reflection's sentences are long.
- **John Climacus:** "Never was novice more fervent, more unrelaxing in his efforts for self-mastery." The reflection quotes the *Imitation*, split in the middle by "says the *Imitation of Christ*", so only a fragment could be used.

## Structures across the batch

| | Age | Structure | Hair, beard, headdress |
|---|---|---|---|
| Zachary | 70 | soft long face, every feature sloping down: drooping brows and outer eye corners, long slender nose with a down-turned tip, small round chin | short thin white hair; short soft rounded white beard |
| Abraham | 65 | long, narrow, a knobby chin jutting forward below a lean jaw, heavy-lidded large eyes | bald crown, grey-black hair to the shoulders; thin beard trimmed short along the jaw |
| Mary | 27 | round and soft, wide-set large eyes, rounded nose tip, full cheeks | violet veil |
| Wulfran | 60 | long face, long broad drooping nose with a big soft tip, small deep-set eyes under bushy brows arched up at the centre, short receding chin | small tonsure, brown-grey hair; short full curly brown-grey beard |
| Catharine | 45 | short, broad heart: wide forehead and cheekbones to a small neat chin, large round wide-set eyes, short upper lip | Bridgettine wimple, black veil, white crown with five red marks |
| Victorian | 50 | long strong face, large high-bridged straight nose, deep nasolabial folds, long square chin | clean-shaven; short grey hair combed forward |
| Victorian's brothers | 30 / 20 | broad round, short wide nose / narrow triangle, pointed chin | curly black beard / beardless |
| Ludger | 65 | long oblong head, very high forehead, very small close-set eyes, long thin nose, large protruding ears, long upper lip, small prim mouth | clean-shaven; thin white tonsure ring, bare-headed |
| John of Egypt | 90 | elfin triangle: broad bulging bald forehead to a small pointed chin, large ears, small bright eyes, small hooked nose, wide smile | bald; short, thin, wispy white beard |
| Gontran | 60 | large, full, round, heavy jowls and double chin, short thick nose, heavy drooping lids | long fair-grey Merovingian hair past the shoulders; drooping moustache, short rounded beard |
| Jonas | 25 | square-jawed broad young face, brows nearly meeting, almond eyes | thick wavy black hair; shadow of first beard |
| Barachisius | 40 | long, gaunt, hollow-cheeked, big aquiline nose | short brown hair; long thin straight "rush-like" brown beard |
| John Climacus | 75 | lean bony long rectangle, two vertical furrows between the brows, large grey eyes, long nose with a broad tip | bald crown, curling grey sides; large full grey-white beard cut square at mid-chest |

## St. Zachary (15 Mar)

- A contemporary portrait exists: in the main fresco of the Theodotus chapel in Santa Maria Antiqua, Pope Zachary stands left of the Madonna with the square nimbus of the living, Theodotus on the right with the chapel model (web search 2026-09-29, note in `Zachary-portrait-note.txt`). The Commons photographs (`zach-sheet.jpg`) show the left part of that panel badly damaged; no features can be read. Wikipedia's lead image (`Zachary.jpg`) is a detail of the same chapel showing Theodotus with candles, not the pope. So the face is ours.
- Wikipedia (`Zachary.txt`): of a Greek family from Santa Severina in Calabria, born 679, pope 741–752, restored the Lateran Palace, freed the slaves the Venetian merchants had bought, buried in St. Peter's. The book: "a man of singular meekness and goodness"; its engraving shows him paying the merchants as the slaves go free. Hence the freed youth, the open fetters and the Lateran.
- Moss-green chasuble, to keep him from the ivory of `simplicius` (batch 23) and the red of `callistus`, `clement_i`. No tiara, as for the other early popes.
- **Against `romanus`** (batch 22, soft oval, raised brows): Zachary's brows and eyes droop, and he is bearded. **Against `gregory_great`**: Gregory is broad and brown-bearded.

## Sts. Abraham and Mary (16 Mar)

- Wikipedia (`Abraham.txt`): his Vita was written by his friend St. Ephrem; the walled-up cell with a small window; died about 360 at seventy. Its lead image, the Menologion of Basil II (`Abraham.jpg`), shows a grey-bearded monk. The book's engraving: Abraham at the door of his cell, Mary at hers.
- Mary's age: placed in her cell as a child (Wikipedia: trained until she was twenty), fell after twenty years, came back after two: about twenty-seven.
- Mary's past is shown only by her penitent posture and plain dress.
- **Against the desert elders** (`anthony_abbot`, `paul_hermit`, `macarius_alexandria`): Abraham's beard is short so the knobbed chin shows, and his hair is grey-black, not white.

## St. Wulfran (20 Mar)

- Wikipedia (`Wulfram.txt`): Ovon hanged and saved while Wulfram prayed; he stood in for Boniface in Friesland; lead image a Victorian statue at Grantham. The book: son of an officer of Dagobert, Archbishop of Sens 682, resigned to preach in Friesland, saved Ovon and two children, died at Fontenelle. Its engraving: lifting Ovon from the gallows.
- The card shows a child (the two children saved from drowning) and no gibbet.
- He goes "in quality of a poor missionary priest", so no mitre, a cloak over the alb and a cross-staff.
- **Against `ansgar`** (batch 11, clean-shaven, broad square brow, cleft chin, missionary of the north): Wulfran is long-faced and bearded, with a big soft nose and a receding chin. **Against `valentine`** (batch 21, short rounded dark beard, wide smile): Wulfran's mouth is small and his look earnest, not smiling.

## St. Catharine of Sweden (22 Mar)

- Wikipedia (`Catherine.txt`): c. 1332–1381, daughter of St. Bridget, married Eggert van Kyren and both kept virginity, first abbess at Vadstena, "generally represented with a hind (female red deer) at her side". Lead image: a medieval wooden statue at Tróno (`Catherine.jpg`), stylised. Bridgettines (`Bridgettines.txt`): the veil's "Crown of the Five Holy Wounds". Vadstena Abbey on Lake Vättern (`Vadstena.txt`). The book's engraving: Catharine and Bridget on pilgrimage.
- **Against her mother `bridget_sweden`** (same habit and crown, an older long oval face, holding a quill): Catharine is younger, short and heart-shaped with round eyes, holds the Rule and the hind. Put the two on one face sheet. **Against `gertrude`** and `angela_merici` (heart-shaped too): theirs are narrow and fine; hers is short and broad, fair, with a short upper lip.

## Sts. Victorian and Others (23 Mar)

- English Wikipedia has no article on him (no `Victorian.*`). The book (after Butler, from Victor of Vita): Victorian, proconsul of Carthage, the king's wealthiest subject, martyred in Huneric's persecution of 484; with him the Martyrology joins four others: two brothers, and two merchants both called Frumentius. The engraving shows Victorian before the enthroned king. Huneric (`Huneric.txt`), Carthage's harbours (`Carthage.txt`).
- The card shows Victorian and the two brothers. The chapter's two Frumentii, Liberatus and his wife, and the twelve children are left out.
- Late-Roman official dress (a tunic with purple bands, a cloak fastened at the right shoulder with a gold brooch) is a general period choice, not a source about him.
- **Against `sixtus_ii`** (long lean clean-shaven bald elder, hooked nose): Victorian has short grey hair, a straight high-bridged nose and a square chin. The brothers differ from `faustinus_jovita` (batch 21) and `adrian_eubulus` (batch 23): one bearded and round, one beardless and triangular.

## St. Ludger (26 Mar)

- Wikipedia (`Ludger.txt`): 742–809, missionary among the Frisians and Saxons, founder of Werden, first Bishop of Münster; "represented either as a bishop holding a church and a book or as standing between two geese". German Wikipedia (`Liudger_de.txt`): the goose as his attribute since the seventeenth century, after the grey geese he drove from the Münsterland. The book: schooled under Alcuin at York, three and a half years at Monte Cassino, Werden, Münster, the answer to Charlemagne, died on Passion Sunday night. Its engraving: at the altar raising a chalice.
- Bare-headed with a tonsure: both images on Wikipedia (`Ludger.jpg`, `Liudger_de.jpg`) give him a mitre, but they are late and without features.
- **Against `ansgar`** (clean-shaven Frank of the north), `romanus` and `albinus_angers` (clean-shaven old men): Ludger's head is long, the eyes very small and close, the ears large and the mouth prim.

## St. John of Egypt (27 Mar)

- Wikipedia (`JohnEgypt.txt`): John of Lycopolis, c. 305–394, carpenter until twenty-five, cells cut in the cliff and walled up save a window, spoke to visitors twice a week, foretold Theodosius's victories. Lycopolis is Asyut on the Nile (`Asyut.txt`). The book: "a holy joy and cheerfulness which consoled all who conversed with him", "blessing oil for their sick". Its engraving: blessing through the window.
- The Painter's Manual has "Saint John the solitary, a very old man" among the holy men, but it is not certain that this is he, so it is not cited.
- **Against the set's desert elders** (`paul_hermit`, `macarius_alexandria`, `simeon_stylites`, `anthony_abbot`): John is dark-skinned, small-faced, pointed-chinned and merry, with a short wispy beard. `macarius_alexandria` (batch 19, wide low rounded-square, smile-creased eyes, sparse grey beard) is the nearest: John's face is a triangle, not a square, and bald without a hood.

## St. Gontran (28 Mar)

- Wikipedia (`Guntram.txt`): king of Burgundy 561–592, repented of a period of intemperance, "caregiver to the sick" after Gregory of Tours, generous in plague and famine, forgiving of two attempts on his life; buried in Saint-Marcel, which he founded at Chalon. Lead image: a tremissis struck at Chalon, a stylised profile (`Guntram.jpg`). The Merovingians' long hair "distinguished them from other Franks" (`Merovingian.txt`). The book: died in his sixty-eighth year (Wikipedia: born 532–534, so about sixty); its engraving: among the sick.
- The red-rimmed eyes stand for his tears of repentance (the book: "He fasted, prayed, wept").
- **Against `louis_france`, `stephen_hungary`, `wenceslaus`, `canutus`** (royal saints): Gontran is heavy, round and jowled, with long hair past the shoulders and a drooping moustache. **Against `albert_great`** and `maud` (jowled): he is bearded and long-haired.

## Sts. Jonas and Barachisius (29 Mar)

- The Painter's Manual (Hetherington, martyrdoms of March, 27th, local `../hermeneia-ocr.txt`): "St. Jonah and Baricesius die by the sword; Jonah a young man and the other has a brown, rush-like beard." The card follows both.
- English Wikipedia has no article. The book: brothers of Beth-Asa, went to Hubaham to encourage the condemned under Sapor, their answer, Jonas set in a frozen pond. The engraving shows them seized by soldiers. The Persian dress and mud-brick town are general period choices.
- **Against `adrian_eubulus`** (batch 23, also a young and an older man): Jonas has near-meeting brows and a square jaw (Adrian is round-cheeked, Eubulus long-faced), and Barachisius is gaunt with a long thin brown beard.

## St. John Climacus (30 Mar)

- The Painter's Manual (the holy men): "John Climacus, an old man with a large beard, says: 'Ascend the ladder of the virtues…'". Wikipedia (`Climacus.txt`): monk of Sinai, hegumen at about sixty-five (the book: seventy-five), and the icon of the Ladder with monks climbing (`Ladder.jpg`). Lead image: a Russian icon, bald with a long beard and a scroll (`Climacus.jpg`). The book's engraving shows him seated in the rocks with a book and a cross.
- The card keeps the ladder of the icon, without its demons and falling monks.
- **Against `justin`** (square-cut beard, broad oblong face, wavy hair) and `jerome` (bald, long white beard, scholar): Climacus is lean and long with furrows between the brows, and his beard is wide and cut square. Put him on a sheet with `paul_hermit`, `theodosius_cenobiarch`, `tarasius`.

## St. Simon of Trent (24 Mar): skipped, needs a decision

The book's chapter tells the Trent accusation as fact (with William of Norwich), with only a footnote that the charge of ritual murder "has been proved to be false". Wikipedia (`SimonTrent.txt`): Simon's death in 1475 "was weaponized as a blood libel against the city's Jewish community", the accused were tortured into confessing, and on 28 October 1965 the Archbishop of Trent abolished the cult and suppressed the procession with his relics. The card is not drafted here. The catalog line `24 Mar · St. Simon, Infant Martyr` should probably be removed, not carded, and the Saint of the Day index entry for 03-24 (`mar-24-simon-infant`) may need the same decision.

## Look-alike risks that remain

- **Catharine against `bridget_sweden`**: same habit and crown. The heart shape, the round eyes and the hind must show.
- **Wulfran and Ludger against `ansgar`**: three Frankish/Frisian missionaries of the north. Wulfran must keep the beard and the big soft nose, Ludger the long head, small close eyes and large ears. Reject a mitre on Ludger.
- **John of Egypt against `macarius_alexandria`** and the other desert fathers: reject a hood, a square face or a long beard.
- **John Climacus** is one more bald, bearded elder (`jerome`, `paul_hermit`, `theodosius_cenobiarch`, `tarasius`, `simeon_jerusalem`). The square-cut wide beard and the furrowed brow are the check.
- **Zachary** may come out as a generic kindly pope. The downward slope of brows, eyes and nose tip is the check; compare with `simplicius`, `callistus`, `clement_i`, `fabian`.
- **Gontran** may lose the long hair under the crown; reject short hair.
- **Victorian's brothers and Jonas/Barachisius**: two more pairs of young and older men after `adrian_eubulus` and `faustinus_jovita`. Check the pairs side by side.
- **Abraham and Mary**: two figures at cells; keep Mary's figure modest and penitent, and check Abraham's chin shows under the short beard.
