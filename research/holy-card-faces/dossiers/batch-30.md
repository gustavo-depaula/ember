# Batch 30 — the Pictorial Lives, 8 to 23 June

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 29: `medard`, `primus_felicianus`, `columba`, `john_fagondez`, `john_francis_regis`, `avitus`, `marcus_marcellianus`, `juliana_falconieri`, `silverius`, `etheldreda`. **One line is skipped: 15 Jun, "Sts. Vitus, Crescentia, and Modestus, Martyrs"** (see the next section), so Etheldreda (23 June) comes in as the tenth. The book's other chapters in this stretch are carded elsewhere: Margaret of Scotland (10 Jun) is `margaret_scotland`, Barnabas (11) `barnabas`, Antony of Padua (13) `anthony_padua`, Basil (14) `basil_gregory`, Aloysius (21) `aloysius_gonzaga`, and Paulinus of Nola (22) is claimed by batch 12. The next unclaimed line is St. Prosper of Aquitaine (25 June), left for batch 31.

The card data is in `../batches/batch-30.json`. `../consult/batch-30/build.py` writes it from `cards.py` (adapted from batch 29's). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day. Columba's is the one exception: the index's 06-09 entry names both lines but points at the chapter of Primus and Felicianus;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Eight do in both languages; Avitus's and Silverius's have none, and their excerptSources say so;
- that every sanctoral formulary whose title names one of the ten (or the skipped Vitus line) is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`;
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days;
- that each catalogMatch hits one unticked line that no other batch claims;
- that no id collides and no other card uses the chapter;
- initials and refs.

Consulted material is in `../consult/batch-30/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`), including the skipped line's `Vitus.*` and `ModestoIt.*`;
- Commons pictures (`commons-files.txt` lists them; sheet `commons-sheet.jpg`): the Santo Stefano Rotondo mosaics of Primus and Felician, Karl Parsons's Columba window, Ghezzi's drawing of Juliana, the Nuremberg Chronicle's Silverius; larger copies and face crops of the Regis portrait and Samacchini's Silverius (`Regis-big.jpg`, `Silverius-big.jpg`, `faces-crop.jpg`); the Commons caption of the Etheldreda miniature (`commons-etheldreda.txt`);
- Adomnán's Life of Columba in Reeves's 1874 translation (`Adamnan-Reeves1874.txt`, archive.org);
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`: the Jesuits, popes, Patrick, the twin physicians, the nuns);
- every face line of batches 1–29 (`faces-all.txt`).

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

## Skipped: Sts. Vitus, Crescentia, and Modestus (15 June)

The book's chapter rests wholly on the Acts: Vitus, a noble child, taught the faith by "his Christian nurse, named Crescentia, and her faithful husband, Modestus", flees with them to Lucania, and the Reflection is about the nurse's formation of the child. Wikipedia (`Vitus.txt`, from the Catholic Encyclopedia and Delehaye): Vitus is a historical martyr (Martyrologium Hieronymianum), but the narrative is "purely legendary", "the figures of Modestus and Crescentia are probably fictitious", their joint feast left the General Calendar in 1969, and the Roman Martyrology keeps Vitus alone on 15 June, "while Modestus and Crescentia … have been omitted, because they appear to be merely fictitious personages". Italian Wikipedia (`ModestoIt.txt`): "Il Martirologio Romano non li cita", their cult "sicuramente privo di storicità". The repo's only formulary for the day, `sanctorale.06-15.german-speaking`, is "Hl. Vitus (Veit), Märtyrer", with a German collect only. Two of the line's three saints are dropped from the Martyrology as fictitious, and the chapter's story and reflection turn on them, so the line is skipped under the rule for discredited stories. If a card of St. Vitus alone is wanted instead, it would have to leave out the chapter's story and its reflection.

**Dates, names, initials.** Feasts follow the book (index days 06-08, 06-09 twice, 06-12, 06-16 to 06-20, 06-23). Names are the book's, with its pt-BR forms (São Medardo, São Primo e São Feliciano, São Columba, São João de São Fagondez, São João Francisco Regis, Santo Ávito, São Marco e São Marceliano, Santa Juliana Falconieri, São Silvério, Santa Eteldreda). Titles the book puts after the name are dropped ("Bishop", "Martyrs", "Abbot", "Pope and Martyr", "Abbess"), and "or Columkille" is left off Columba's. **"St. John of St. Fagondez"** is the book's form of the saint usually called John of Sahagún; the card keeps the book's, as batch 27 kept "Mammertus", and the id `john_fagondez` follows it. None of the ten is "Blessed" in the book, so no title changes: John of Sahagún was canonized in 1690, John Francis Regis and Juliana Falconieri in 1737, and the others have had a cult since before canonization procedures existed. Initials: M, P, C, J, J, A, M, J, S, E.

**lifeChapter and reflection.** Each card has its own chapter in both languages, and none is shared with another card. Eight chapters close with a `**Reflection**` paragraph, and that paragraph is the card's reflection. **Avitus's (`jun-17-avitus`) and Silverius's (`jun-20-silverius`) chapters have none**, so their cards have no reflection, and there is no fallback. Columba's chapter has no date heading (it follows Primus and Felicianus on 9 June), and the index's 06-09 reflection is the one closing the Primus and Felicianus chapter; Columba's card takes the Reflection of its own chapter.

**proper.** None. No formulary in the repo is proper to any of the ten with en-US or pt-BR collect text; there is none at all for Medard, Columba, John of Sahagún, Regis, Avitus, Juliana, Silverius or Etheldreda, and none for Primus and Felician or Mark and Marcellian. The script's title hits are other saints: 04-25 Mark the Evangelist, 06-02 Marcellinus and Peter, 04-20 (Africa) a Bishop Marcellinus, 12-26 Stephen (Italian "primo martire"), and the German-speaking Vitus. The universal formularies on the book's days belong to other saints: Ephrem (and Anchieta in Brazil) on 06-09, Romuald on 06-19; the other dates have only regional formularies of other saints (Onophrius, Benno).

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Medard (the book's capitals and quotation marks kept) and John of St. Fagondez;
  - the first sentence: Primus and Felicianus, Columba, Marcus and Marcellianus, and Etheldreda;
  - the last sentence: John Francis Regis;
  - Juliana: the last sentence of the words of St. Paul of the Cross that her Reflection quotes ("If you seek the Cross, there you will find the Mother; and where the Mother is, there also is the Son."), without the closing quotation mark.
- From the chapter, where there is no Reflection: **Avitus** ("In quest of a closer retirement, St. Avitus, who had succeeded St. Maximin, soon after resigned the abbacy."; the book's sentence goes on after a comma, which the excerpt closes with a full stop), and **Silverius** ("He neither could nor would obey her unjust demands and betray the cause of the Catholic faith."; the book's clause after "that", capitalised; in pt-BR "Nem podia nem queria …", the clause after "que").

## St. Medard (8 June)

- Wikipedia (`Medard.txt`, `MedardFr.txt`): c. 456–545 (fr: died 560), of Salency, ordained at thirty-three, bishop of Vermand in 530, who moved the see to Noyon and also governed Tournai. "Often depicted laughing, with his mouth wide open, and therefore he was invoked against toothache" (fr: "il a la bouche entrouverte et montre ses dents"); as a child an eagle sheltered him from the rain, "how he was most commonly depicted"; the Rosière of Salency, a maiden crowned with roses, "is said to have been started by Medardus himself". Lead image: a statue of a mitred bishop in a niche.
- The book: born about 457, the coat given to a blind man, priest at thirty-three, bishop in 530 at seventy-two, consecrated by Remigius, the apostle of Flanders, dead in 545 "at an advanced age". The engraving shows him holding a wreath over a bowing maiden before seated nobles.
- The card shows the old bishop without a mitre, as `germanus_paris` and `albinus_angers`, holding a wreath of white roses, with the eagle spread over him in the rain and Picardy and Noyon behind.
- **Against `barbatus`** (batch 22: broad, low flat-topped forehead, bulbous nose, laughing eyes, a great, wide, bushy beard), `john_xxiii` (large round face, double chin, broad smile), `maud` and `marcellinus_peter`'s Marcellinus (laugh lines), and the clean-shaven old bishops of batch 29 (`germanus_paris`, `claude_besancon`): Medard is heavy-boned and square-jawed under a bald dome, with a long, gently hooked nose, the mouth open in laughter, and a short, square-cut beard that follows the jaw.

## Sts. Primus and Felicianus (9 June)

- Wikipedia (`Primus.txt`): brothers martyred c. 297 and buried at the fourteenth milestone of the Via Nomentana (Nomentum); their Acts make them patricians who cared for the poor and prisoners, beheaded at Nomentum, Primus eighty; in 648 Pope Theodore I moved their relics to Santo Stefano Rotondo, whose chapel has seventh-century mosaics of the two flanking a jewelled cross. Their feast left the General Calendar in 1969 for local calendars.
- The mosaics (`Primo-mosaic.jpg`, `Feliciano-mosaic.jpg`): both in white tunics with dark clavi and pallia; **Primus grey-haired with a short grey beard, Felicianus with darker hair and beard**. The card follows this: Primus about eighty, Felicianus about seventy.
- The book agrees (brothers "grown old", scourged, taken twelve miles from Rome, beheaded on 9 June). Its engraving is a torture scene, not used.
- **Against `marcellinus_peter`, `nereus_achilleus`, `john_paul_martyrs`, `donatian_rogatian` and `cosmas_damian`** (the other pairs), and `cletus` and `celestine_i` (Roman elders): Primus's length is in the middle of the face (eyes set high, a long drooping nose, a long upper lip) over a short, neat silver beard; Felicianus is short and round-oval with a bossed forehead and a small, receding chin in a full, dark, grey-streaked beard.

## St. Columba (9 June)

- Wikipedia (`Columba.txt`): 521–597, of Gartan in Tír Chonaill, founder of Derry and Durrow, who sailed with twelve companions in 563 and founded Iona; his name means "dove". Lead image: a painting of Columba at King Bridei's fort, not used for the face.
- Adomnán (`Adamnan-Reeves1874.txt`, the second preface): "he was angelic in appearance, graceful in speech, holy in work … a holy joy ever beaming on his face revealed the joy and gladness with which the Holy Spirit filled his inmost soul"; and at Mass his face "appeared as if suffused with a ruddy glow". Reeves's introduction: his order's tonsure was "ab aure ad aurem, that is, the anterior half of the head was made bare, but the occiput was untouched", kept until 718.
- Karl Parsons's window (1913; `Columba-Parsons.jpg`): clean-shaven, tonsured, with a dove and a book.
- The book: noble birth at Gartan in 521, the Picts converted, Iona, the vision of the angels, his death in choir at seventy-seven on 9 June 597. **The book dates his departure to 565 and has him found "a hundred religious houses"; Wikipedia has about 563.** The card shows no date. The engraving shows a later cleric in a cassock, not used.
- The card shows the old abbot in an undyed cowl with the dove, a Gospel book with interlace, and Iona with Mull behind.
- **Against `columban`** (batch 13: the other Irish monk, also with the Irish tonsure: long, big-boned, windburnt and freckled, a jutting chin, red-grey hair), `patrick` (mitred, white-bearded), `robert_newminster` (tapering to a small dimpled chin, bumped nose), `paternus_avranches` (long shield) and `honoratus` (large domed forehead over a small lower face): Columba is clean-shaven, with a broad, open face as wide at the jaw as at the cheekbones, smooth full cheeks, a slightly upturned nose, very large luminous grey eyes, a wide smiling mouth and a cleft chin.

## St. John of St. Fagondez (12 June)

- Wikipedia (`Sahagun.txt`, `SahagunEs.txt`): Juan González del Castrillo, c. 1430–1479, of Sahagún (San Facundo), canon of Burgos, student at Salamanca, an Augustinian from 1463, prior, the peacemaker of Salamanca's noble factions; "rumored" to have been poisoned by a woman; canonized 1690; in the Roman Martyrology on 11 June. "In art, John is represented holding a chalice and host surrounded by rays of light", as on the tiled panel of its lead image (a clean-shaven, tonsured friar in a dark habit).
- The book tells the same, with the poison as fact, and dates his death on 11 June 1479. The engraving shows him preaching from a pulpit.
- The card shows the Augustinian with the chalice and the Host in rays, and Salamanca's Old Cathedral and Roman bridge behind him.
- **Against `thomas_aquinas`, `antoninus_florence`, `peter_verona`, `yvo` (clean-shaven friars and clerics) and `bademus` (wide, heavy-jawed, flared nostrils, but bearded)**: John is clean-shaven, wide and angular with the jaw broader than the forehead, flared nostrils, wide-set steady eyes under brows angled down toward the nose, and a prominent rounded chin.

## St. John Francis Regis (16 June)

- Wikipedia (`Regis.txt`, `RegisFr.txt`): 1597–1640, of Fontcouverte in Languedoc, a Jesuit from 1616, priest in 1630, missionary in the Vivarais and Velay mountains, "especially in the winter", who died of pneumonia at forty-three at Lalouvesc; canonized 1737. **The book says "at the age of forty-four"**; the card shows about forty-three.
- The lead image, an old painted portrait (`Regis-big.jpg`, crop in `faces-crop.jpg`): a long, narrow face with high cheekbones, a long straight nose, large eyes looking aside, short auburn hair, a thin moustache and a short pointed beard, one hand raised and a crucifix in the other. The face follows it.
- The book: the winter missions, the leg broken on the way to Marthes and healed in the confessional. The engraving shows him in a broad hat on a snowy mountain path with a companion.
- **Against `francis_xavier`** (existing: dark, curly hair and a full beard), `ignatius_loyola`, `peter_claver`, `peter_canisius` and `robert_bellarmine` (the other Jesuits), and `francis_caracciolo` (batch 29: soft, puffy lids, receding hairline): Regis is lean and chiselled, auburn, with high cheekbones over flat hollows and a chin-only pointed beard.

## St. Avitus (17 June)

- There is no English Wikipedia article. French Wikipedia (`AvitFr.txt`): third abbot of Micy near Orleans, a hermit, died about 530, of a family of humble farmers of the Beauce, the monastery's cellarer, who fled to the forest of Sologne for solitude and advised Clodomir. **It gives his feast as 19 December**, and says two cults of the name (Perche, Aquitaine) may be two men, "Pourtant, la chronologie et les dates de célébrations sont identiques". The card keeps the book's 17 June.
- The book: a native of Orleans, monk at Menat with St. Calais, abbot of Micy after St. Maximin, who resigned to live as a recluse in the Dunois; King Clotaire built him a monastery near Châteaudun; died about 530. The book and the French article differ on his birthplace (Orleans, the Beauce). The engraving shows two monks walking in open country.
- The card shows the recluse abbot in a forest clearing with his cell, the river valley beyond.
- **Against `david_wales`** (overhanging brow, short broad flat nose), `claude_besancon` (short, wide, snub-nosed, clean-shaven, about ninety), `hospitius` and `john_climacus` (lean hermits): Avitus's face is flat and wide with a dished, concave profile and a short, scooped, upturned nose, wide-set pale-green eyes, and a small round chin in a rough grey-brown beard.

## Sts. Marcus and Marcellianus (18 June)

- Wikipedia (`Marcus.txt`): in the Roman Martyrology on 18 June; removed from the General Calendar in 1969 "because nothing is known about them except their names, the fact of their martyrdom, and that they were buried on 18 June in the cemetery of Santa Balbina on the Via Ardeatina". The twins, their parents Tranquillinus and Martia, and Sebastian's part come from the Acts of St. Sebastian, "which, though ancient, is largely legendary". Their basilica in the catacomb of Balbina was rediscovered in 1902.
- The book tells the Acts' story as fact. The engraving shows two young, beardless men bound to pillars.
- The card shows the twins in tunics and pallia with palms on the Via Ardeatina, without pillars or lances, and does not show Sebastian.
- **Against `cosmas_damian`** (existing twin physicians, also side by side with palms: square-jawed and rounder, olive-brown, wavy hair), `timothy_titus`, `cyril_caesarea` (brows nearly meeting, but a square face) and `jonas_barachisius`: the twins share one V-shaped face with a broad square forehead, a pointed chin, a bumped nose, close-set eyes and prominent ears; Marcus is bearded, Marcellianus clean-shaven.

## St. Juliana Falconieri (19 June)

- Wikipedia (`Juliana.txt`, `JulianaIt.txt`): 1270–1341, of the Falconieri who funded the Santissima Annunziata, niece of Alexis, one of the seven founders, clothed c. 1285 by Philip Benizi, foundress of the Servite tertiaries, "Mantellate"; the Host on her breast at her death; canonized 1737. **Wikipedia describes the habit as "a black gown, secured by a leather girdle, and a white veil"; the book's engraving and Ghezzi's drawing show a dark veil over a white wimple.** The card follows the engraving: black veil, white wimple. "Juliana is usually represented in the habit of her Order with a host upon her breast." Lead image: the marble statue at Padua, hand on her breast.
- The book: born 1270, never used a mirror nor looked on a man's face, the habit at fourteen from Philip Benizi, the Mantellate, the Host on her heart; "Juliana died A. D. 1340" in her seventieth year. The engraving shows her holding out a dish at a window in a cloister.
- **Against `catherine_siena`, `margaret_mary`, `clare_assisi` (existing nuns), `clotilda` (lean, long, high cheekbones, wimpled), `jane_valois` and `euphrasia`**: Juliana's face is an inverted egg, wide and square-set at the forehead, narrowing to a slightly jutting chin, with a long narrow nose hooked at the tip and small, deep-set, lowered eyes.

## St. Silverius (20 June)

- Wikipedia (`Silverius.txt`, `Palmarola.txt`): son of Pope Hormisdas, of Frosinone, pope from 8 June 536, deposed by Belisarius in March 537; Procopius says he was "put in a monk's habit"; exiled to Patara and, after Justinian ordered his return, handed to Vigilius and banished to Palmarola, "where he starved to death"; recognized as a saint by popular acclamation, patron of Ponza, feast 20 June. **Wikipedia dates his death 2 December 537; the book, 20 June 538.** The card shows no date.
- The lead image (Samacchini, 1570s; `Silverius-big.jpg`) shows a bald pope with a white beard looking up; the Nuremberg Chronicle woodcut is a stock papal figure. Neither is a likeness, and the card does not follow them.
- The book's patron line "Pope and Martyr" is kept ("Pope and martyr" / "Papa e mártir"); Wikipedia does not call him a martyr but tells his death of starvation in the exile imposed on him.
- The card shows the deposed pope in a plain monk's habit with a palm on Palmarola, as in the book's engraving of him seated on the shore watching a boat.
- **Against `martin_i`** (the other pope who died in exile: long, narrow, emaciated, Roman nose), `felix_i`, `marcellinus_pope`, `john_i`, `soter` and `celestine_i`, and `epiphanius_salamis` (small, narrow, bird-like): Silverius has a round skull with a full, curved forehead, round cheekbones standing out over hunger's hollows, small close-set grey-green eyes, a short nose pinched at the bridge, large ears and a short, sparse, grizzled beard.

## St. Etheldreda (23 June)

- Wikipedia (`Etheldreda.txt`, `Ely.txt`): Æthelthryth, 636–679, daughter of King Anna of East Anglia, married to Tondberct, then to Ecgfrith of Northumbria, a nun at Coldingham under Æbbe, who fled back to Ely and founded its double monastery in 673 (Anglo-Saxon Chronicle); Bede says she died of a neck tumour she took as penance for the necklaces of her youth; the legend of her staff growing into an ash; her incorrupt body translated in 695. Lead image: the Benedictional of St. Æthelwold (`commons-etheldreda.txt`), a veiled abbess with a book and a budding staff.
- The book: two marriages kept in virginity, Coldingham, the refuge on the headland, Ely founded in 672, death in 679. **The book says Ely in 672; Wikipedia, 673.**
- The card follows the Benedictional's figure (veil, book, budding staff, no crown), with the Fens and a small early minster, not the Norman cathedral.
- **Against `bathildes`** (round, full), `bridgid` (wide oblong), `maud` (broad square), `jane_valois` (long, fuller below, small close-set eyes), `euphrasia` (narrow oblong, close-set eyes) and `margaret_scotland`: Etheldreda is pear-shaped, narrow at the temples and full at the jaw, with a straight nose continuing the forehead, large, wide-set, heavy-lidded pale-blue eyes and a short, rounded chin.

## Doubts

- **The skipped Vitus line.** Skipped because Modestus and Crescentia are dropped from the Roman Martyrology as fictitious and the chapter turns on them. Alternatives: a card of St. Vitus alone, without the chapter's reflection; or remove the line from the catalog, as batch 24 proposed for Simon of Trent.
- **Marcus and Marcellianus.** Their cult is genuine (Martyrology, Balbina basilica), but everything in the book's chapter besides their names and martyrdom comes from the legendary Acts of St. Sebastian, twins included. The card stands, as `vitalis_ravenna` and `venantius_camerino` did, showing only two brothers with palms. If "rests on a discredited story" should cover it, the line is skipped and St. Prosper of Aquitaine (25 June) comes in.
- **Primus and Felicianus.** Wikipedia gives their Acts (patricians, Primus eighty) without calling them legendary; their burial and cult are fourth-century. The card keeps the book's outline.
- **Silverius as martyr.** The book's title; Wikipedia neither uses nor denies it.
- **Avitus's date.** French Wikipedia gives 19 December; the card keeps the book's 17 June.
- **"St. John of St. Fagondez"** is the book's name; the usual English form is "St. John of Sahagún". Alternative: tidy the name, and the id to `john_sahagun`.
- **Juliana's veil** is black on the card (engraving, Ghezzi); Wikipedia's text says a white veil.
- **Juliana's excerpt** is St. Paul of the Cross's words quoted in the book's Reflection, not the book's own.

## Look-alike risks that remain

- **Marcus and Marcellianus against `cosmas_damian`**: twins side by side with palms, one bearded. Check the V-shaped face with the pointed chin, the bump on the nose and the prominent ears. Reject square jaws or full cheeks.
- **Columba against `columban`**: both Irish monks with the ear-to-ear tonsure and long hair behind. Columba is clean-shaven, broad and smooth-cheeked, with a cleft chin and a glad smile. Reject a long, big-boned, windburnt face with a jutting chin.
- **Medard against `barbatus` and `john_xxiii`**: laughing old men. Check the long, hooked nose, the bald dome and the short, square-cut beard. Reject a bulbous nose, a great spreading beard, or a round, clean-shaven face.
- **Regis against `francis_xavier`**: a black Jesuit cassock with a crucifix. Regis is auburn, lean and narrow, with a chin-only pointed beard. Reject dark curls and a full beard.
- **Silverius against `martin_i`**: a pope wasted in exile. Silverius is round-skulled with round cheekbones and small close-set eyes. Reject a long, narrow, Roman-nosed face.
- **Primus against the white-bearded elders**: reject a generic kindly old man; his face is long in the middle, with a long drooping nose and a long upper lip, and a short, neat beard.
- **Etheldreda against `jane_valois` and `euphrasia`**: reject a long, narrow face with close-set eyes; she is pear-shaped, with large, wide-set eyes.
- **Juliana against the existing nuns**: reject a soft young oval; she is about sixty-five, with an inverted-egg face and a hooked nose tip.
- **Avitus against `david_wales` and `claude_besancon`**: reject an overhanging brow or a clean-shaven snub-nosed elder; Avitus's profile is dished, with wide-set eyes and a rough beard.
