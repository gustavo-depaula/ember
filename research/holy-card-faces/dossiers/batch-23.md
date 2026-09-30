# Batch 23 — the Pictorial Lives, 1 to 14 March

Ten cards, the next ten unclaimed lines of "From the Pictorial Lives of the Saints" after batch 22: `david_wales`, `albinus_angers`, `simplicius`, `cunegundes`, `adrian_eubulus`, `colette`, `forty_martyrs_sebaste`, `eulogius_cordoba`, `euphrasia`, `maud`. The book's other chapters in this stretch are covered elsewhere: Casimir (4 Mar) is `casimir` (batch 11), Thomas Aquinas (7 Mar) is `thomas_aquinas`, John of God (8 Mar) is `john_of_god`, Frances of Rome (9 Mar) is `frances_rome`, Gregory the Great (12 Mar) is `gregory_great`. The card data is in `../batches/batch-23.json`, written by `../consult/batch-23/build.py`. The script checks each excerpt verbatim in both languages against the card's own chapter or its day's index reflection; that each `lifeChapter` exists in en-US and pt-BR, is the index's chapter for its day (David excepted, below) and is used by no other batch; each feast against the index day; that each catalogMatch hits one unticked line no other batch claims; that no id collides with `content/saints/` or another batch; and that each initial matches the name. It also lists every OF formulary on the ten dates and every sanctoral formulary whose title names one of the ten, with the languages of its collect. Consulted pictures and extracts are in the same folder: Wikipedia summaries and extracts with lead images (`*.json`, `*.txt`, `*.jpg`), Commons metadata (`commons-*.json`), the book's engravings (`book-*.jpg`, on one sheet in `book-sheet.jpg`), the Wikipedia pictures on one sheet (`wiki-sheet.jpg`), and the existing cards compared against (`existing/`, sheet `existing-sheet.jpg`). `fetch.sh` is the fetcher.

**Dates, names, initials.** Feasts follow the book (index days 03-01, 03-02, 03-03, 03-05, 03-06, 03-10, 03-11, 03-13, 03-14; David and Albinus share 03-01). Names are the book's, tidied, with a place added where the name is shared: David of Wales (not the king), Albinus of Angers, Eulogius of Córdoba (not the Eulogius of 01-20 in Spain's calendar). Maud keeps the book's English name; in pt-BR she is "Santa Matilde", her name in Brazil (the book's pt-BR has "Santa Maud"). David is "São Davi" in pt-BR (the book writes "David"). All ten were already "St." in the book and none has changed title since (Cunegundes canonized 1200, Colette 1807, the rest before canonization procedures). The initials are D, A, S, C, A, C, F, E, E, M; the Forty skip "The", as the brief says.

**lifeChapter.** Each card has its own chapter, checked in both languages. **David** is the one exception to the index check: his chapter `mar-01-david` exists in both languages but the 03-01 index entry points at `mar-01-albinus`, and its reflection is Albinus's. David's chapter has no Reflection and no engraving, so the card's reflection will be its last paragraph, his death ("Take me up with Thee"). **Euphrasia**'s chapter has no Reflection either (no `reflection` in the index for 03-13); hers will be the last paragraph, the stones she carried for thirty days.

**proper.** None of the ten gets one. The formularies on these dates are other saints': 03-03 Katharine Drexel (United States), 03-06 Fridolin (German only), 03-14 "Hl. Mathilde, Königin" — St. Maud's own formulary, but German only, so it can't show on the card. Nothing on 03-01, 03-02, 03-05, 03-10, 03-11 or 03-13. Other formularies naming these saints: `sanctoral/07-13.json` (St. Henry) names Kunigunde only in its German title and collect, its en-US and pt-BR collect is Henry's alone, so it is not proper to Cunegundes; `sanctoral/01-09/spain.json` (Eulogius of Córdoba) is Spanish only; `sanctoral/01-09/africa.json` is Adrian of Canterbury, another saint. No Welsh or English formulary for St. David exists in the repo.

**Excerpts.**
- Five from the day's index reflection: Albinus (the words of Christ it quotes), Simplicius (the verse of Ecclesiasticus it quotes, closed with a full stop), Cunegundes (first sentence), Adrian and Eubulus (first sentence), Eulogius (third sentence), Maud (first sentence).
- **David:** his last words in the chapter, "Take me up with Thee" / "Leva-me contigo", closed with a full stop.
- **Colette:** the clause of the chapter's last paragraph, "she would count that day the unhappiest of her life in which she suffered nothing for her God", capitalised; the pt-BR starts at "Contaria" (the verb carries the subject). The day's reflection has a stray comma ("and, devotion to Christ's Vicar") that would have to be copied verbatim, so it was passed over.
- **The Forty:** their prayer on the ice, "grant that forty may be crowned" / "concedei que quarenta sejam coroados", capitalised; the book splits the cry with "they cried", so only its second half is used.
- **Euphrasia:** her vow at seven, "By vow I consecrate myself to Christ" (the en-US chapter lacks the full stop; the pt-BR has it).

## Structures across the batch

| | Age | Structure | Hair, beard, headdress |
|---|---|---|---|
| David | 70 | broad upright rectangle, heavy overhanging brow ridge, short broad flat-bridged nose, square chin | insular tonsure ear to ear, white hair behind; short cropped white beard |
| Albinus | 80 | pear-shaped: narrow temples, full jowls, double chin; long thick nose | clean-shaven; white fringe round a bald crown |
| Simplicius | 65 | broad powerful head, big humped Roman nose, deep vertical creases, jutting broad chin | clean-shaven; grey Roman fringe |
| Cunegundes | 40 | soft triangle: broad forehead to a pointed chin; far-set pale eyes, high arched brows | two fair plaits, veil, imperial crown |
| Adrian | 30 | compact, broad, short; round high cheekbones, upturned narrow eyes, flattened nose | tight black curls; short rounded black beard |
| Eubulus | 22 | long, thin, bony; humped long nose; long narrow chin | straight black hair; faint down |
| Colette | 45 | small, narrow, sharp cheekbones, jutting pointed chin, very large eyes | grey habit, white wimple, black veil |
| The Forty (four) | 18 / 60 / 50 / 35 | small heart / broad square, broken nose / long narrow, hooked nose / wide flat-cheeked | beardless / bald, rounded white beard / pointed grey beard / moustache and stubble |
| Eulogius | 45 | wide face, low broad forehead, sharply hooked aquiline nose, wide flat cheekbones | bald crown with black fringe; short square black beard touched with grey |
| Euphrasia | 22 | narrow oblong under a high rounded forehead, long neck, high-bridged fine nose, close-set eyes | brown veil over white head-cloth |
| Maud | 65 | broad square Saxon face, short flat-bridged nose, prominent square jaw, small twinkling eyes | widow's wimple and veil under a plain gold crown |

## St. David of Wales (1 Mar)

Face: a Briton of about seventy with a broad, upright rectangular face under a heavy, overhanging brow ridge, small deep-set sea-grey eyes, a short broad flat-bridged nose, a square chin, the insular tonsure and a short cropped white beard.

- No likeness survives. The book: son of Sant and Non, pupil of St. Paulinus, called from his cell to preach at Brevi, where "the ground beneath his feet rose and became a hill"; bishop, moved his see to Menevia; died "about eighty years of age" on 1 March. No engraving on this day.
- Wikipedia (local `David.txt`): "A white dove, which became his emblem, was seen settling on his shoulder"; "Saint David is usually represented standing on a hill with a dove on his shoulder"; his monks were "watermen" who ate bread, salt and herbs. Hence the dove, the rise of ground and the plain undyed wool. Its lead image (local `David.jpg`) is the Castell Coch window, a Victorian mitred archbishop, which the card does not follow. The leek is the symbol of Wales, not of his life, and stays off the card.
- The tonsure: Wikipedia's Tonsure (local `Tonsure.txt`) says the Celtic tonsure "in some way involved shaving the head from ear to ear" and its exact shape is unclear. The face line asks only for the front shaved back to the ears.
- Age: the card shows him preaching at Brefi. Wikipedia dates the synod about 550 and his death about 589; the book, 561 at about eighty. Seventy splits the difference and is only a painter's age.
- **Against the white-bearded elders** (`simeon_jerusalem`, `paul_hermit`, `theodosius_cenobiarch`, `anthony_abbot`, `patrick`): David's beard is short and cropped, his head half-shaved, his brow heavy and his nose short and flat.

## St. Albinus of Angers (1 Mar)

Face: a Breton Gallo-Roman of about eighty, clean-shaven, with a pear-shaped face — narrow temples, full soft jowls and a double chin, a long thick nose, small gentle pouched eyes, a white fringe round a bald crown.

- No likeness survives. The book's engraving (local `book-mar-01-albinus.jpg`): a mitred, haloed bishop at a church door giving alms among the poor and crippled, a basin at his side. The card keeps the alms, as bread to a child.
- The book: of a noble family in Brittany, monk at Tintillant near Angers, abbot at thirty-five (504), bishop twenty-five years later, died 1 March 549; Wikipedia (local `Albinus.txt`): c. 470 – 550, so about eighty. Angers at the confluence forming the Maine (local `Angers.txt`). Wikipedia's lead image (local `Albinus.jpg`) is a manuscript miniature of him at the Third Council of Orléans.
- Two old men on the same day: David is bearded and square with a heavy brow, Albinus clean-shaven and pear-shaped.
- **Against `honoratus`** (batch 20, domed forehead over a small lower face, rosy) and `eucherius_orleans` (batch 22, clean-shaven, dished profile): Albinus's weight is at the bottom of the face, not the top, and his nose is long and thick.

## St. Simplicius (2 Mar)

Face: a Roman of Tivoli of about sixty-five, clean-shaven, with a broad, powerful head, a wide flat forehead, a big fleshy nose with a strong hump, heavy-lidded shrewd eyes under level brows, deep vertical creases, a wide full mouth and a broad jutting chin; short grey hair in a fringe.

- No likeness survives. Wikipedia's lead image (local `Simplicius.jpg`) is Jacques Callot's seventeenth-century engraving with a tiara; the book's engraving (local `book-mar-02-simplicius.jpg`) shows him enthroned, tiara-crowned, among kneeling afflicted people. Neither is a likeness, and a fifth-century pope wore no tiara, so the card gives him chasuble and pallium as `callistus` and `clement_i` are dressed, but in ivory rather than red.
- Wikipedia (local `Simplicius.txt`): born at Tivoli, son of Castinus, pope 468–483; the fall of the Western Empire in 476. The book: "buried in St. Peter's". Hence Old St. Peter's in the background (local `OldStPeters.txt`). His age at death is unknown; sixty-five is a painter's age.
- **Against `fabian`** (clean-shaven, long, fine-boned, tiara) and `callistus` (broad, bearded): Simplicius is broad but clean-shaven, and the humped nose and jutting chin carry him.

## St. Cunegundes (3 Mar)

Face: a Luxembourg countess of about forty with a softly triangular face — a broad, high forehead tapering to a narrow pointed chin, a short straight nose, large far-set pale-blue eyes under high thin arched brows, a small bow mouth, two fair plaits.

- No likeness from life. The dedication picture of the Pericopes of Henry II (German Wikipedia lead image, local `Kunigunde_de.jpg`) shows the crowned couple being crowned by Christ, with no individual features; Wikipedia (local `Cunigunde.txt`): on the Adamspforte of Bamberg Cathedral (c. 1235) "she is holding the model of a church", and "Cunigunde's usual attribute is a ploughshare", from the ordeal. The card carries both, the ploughshare cool on the ground.
- The book: daughter of Siegfried of Luxemburg, crowned at Paderborn 1002 and at Rome 1014; walked on red-hot ploughshares unhurt; founded Kaufungen, took the veil there, died 3 March 1040, buried at Bamberg. Wikipedia: patroness of Luxembourg (hence the patron line), founder with Henry of the cathedral and diocese of Bamberg.
- Age forty: the ordeal and the Bamberg foundation fall in her married years (Wikipedia: born c. 975, married 999, widowed 1024).
- **Against `henry`** (batch 13, her husband, heart-shaped face with full wide cheeks): hers is a straight-sided triangle with a pointed chin, and she has far-set pale eyes. **Against the crowned women** `elizabeth_portugal`, `hedwig`, `margaret_scotland`, `bathildes`, `jane_valois`: those are long ovals or round; she wears no wimple, but a veil with plaits.

## Sts. Adrian and Eubulus (5 Mar)

Faces: Adrian (left), about thirty, compact and broad with round high cheekbones, upturned narrow eyes, a short flattened nose, tight black curls and a short rounded black beard. Eubulus (right), about twenty-two, long, thin and bony, with a humped long nose, a long narrow chin, straight black hair and only a faint down of beard.

- No likenesses survive. The Painter's Manual (Hetherington translation, local `../hermeneia-ocr.txt`, the martyrdoms of February, 3rd day): "St. Adrianus and St. Eubulus [die] by the sword; Adrianus a young man with a rounded beard, the other with an incipient beard." The card follows it.
- The book: they "came out of the country called Magantia to Cæsarea, in order to visit the holy confessors there", confessed at the gates, and were exposed to beasts and killed by the sword in the persecution under Firmilian; Eubulus "was the last that suffered in this persecution at Cæsarea". The engraving (local `book-mar-05-sts-adrian-and-eubulus.jpg`) shows two haloed men seized by soldiers at the city gate. Hence the gate, the travelling cloaks and the bread for the prisoners. Caesarea's harbour from Wikipedia (local `Caesarea.txt`).
- English Wikipedia has no article for them.
- **Against `onesimus`** (batch 21, beardless, wide and flat-planed) and `faustinus_jovita` (batch 21, two brothers): Adrian is bearded and compact, Eubulus long and bony; neither is round like Jovita.
- The engraving's central figure is a long-haired bearded man near the Christ type; the card's Adrian has short tight curls and a round beard to avoid it.

## St. Colette (6 Mar)

Face: a Picard woman of about forty-five with a small, narrow face, sharply defined cheekbones, a small jutting pointed chin, a short fine nose and very large dark eyes; hair hidden under the wimple and veil.

- No portrait from life. The Master of Lourinhã's panel of St. Clare and St. Colette (c. 1520, National Museum of Ancient Art, Lisbon; Wikipedia's lead image, local `Colette.jpg`, Commons metadata `commons-Santa_Coleta_Lourinha.json`): she reads, in a grey-brown habit, white wimple and black veil. The card keeps the dress and the book; the painted face is a long pale oval that would repeat `jane_valois`, so the face is ours.
- The book: a hut near her parish church of Corbie in Picardy for four years; St. Francis bade her in a vision reform the Order; seventeen convents; helped end the Schism; died 6 March 1447. French Wikipedia (local `Colette_fr.txt`): walled up as a recluse "dans un reclusoir attenant à l'église Saint-Étienne". The book's engraving (local `book-mar-06-colette.jpg`): kneeling in her cell under a ray of light, a crucifix on the wall. Corbie lies in the Somme valley (local `Corbie.txt`).
- Born 1381, died at sixty-six; forty-five is the age of her reform.
- **Against `clare_assisi`** (brown habit, black veil, white wimple, oval face) and `catherine_siena`: Colette's habit is ash-grey with a white cord, her face small with a pointed chin, and she has the ray of light and the book rather than a monstrance or lily.

## The Forty Martyrs of Sebaste (10 Mar)

Faces: four principal figures. The youngest, about eighteen, beardless, with a small narrow heart-shaped face and very large dark eyes; an old soldier of about sixty, bald, broad and square with a flattened nose and a rounded white beard; a grey-haired man of about fifty with a long narrow face, a hooked nose and a pointed grey beard; the guard Aglaius, about thirty-five, wide and flat-cheeked with a black moustache and stubble.

- The Painter's Manual (Hetherington, the forty martyrs of Sebaste, 9 March) lists each of the Forty by type: "Meliton, a young man, beardless", "Sisinnius, a bald old man with a rounded beard", "Theodulus, grey-haired, with a pointed beard", and so on. The card takes its four foreground types from that list without naming them, save the guard.
- The book: soldiers at Sebaste in Armenia about 320, condemned to lie naked on a frozen pond, warm baths near for anyone who denied Christ; "Forty, we have come to combat: grant that forty may be crowned"; angels descended with thirty-nine crowns; one fled to the fire; a watching soldier confessed Christ and took his place; the youngest held out longest and his mother lifted him into the cart. Wikipedia (local `Forty.txt`, after St. Basil's homily) names the guard Aglaius and gives the Legio XII Fulminata. The book's engraving (local `book-mar-10-the-forty.jpg`) and the Orthodox icon (local `Forty.jpg`) show them crowded together in loincloths.
- A scene card like the Rosary mysteries: the four in front half-length, the rest small behind, the crowns above. Modesty: white loincloths, no wounds, no fire.
- The book does not name the youngest; the card leaves him unnamed. The mother is left out, to keep the window from crowding.

## St. Eulogius of Córdoba (11 Mar)

Face: a Hispano-Roman of about forty-five with a wide face, a low broad forehead, a bald crown with a black fringe, a sharply hooked aquiline nose, wide flat cheekbones, small crinkled kindly eyes and a short square black beard touched with grey.

- No likeness from life. Wikipedia (local `Eulogius.txt`): his friend and biographer Paulus Alvarus "described him as gentle, reverent, well-educated, steeped in Scripture, and so humble…", "a pleasant demeanor". Its lead image (local `Eulogius.jpg`), a painting of his beheading, shows him bald and bearded in white; the card keeps the bald crown and the beard. The Spanish Wikipedia image (local `Eulogio_es.jpg`) is a late baroque bust with a crucifix.
- The book: of a senatorial family of Córdoba, head of its chief ecclesiastical school, wrote his *Exhortation to Martyrdom* in prison, elected Archbishop of Toledo but not consecrated, beheaded 11 March 859 for sheltering Leocritia. The engraving (local `book-mar-11-eulogius.jpg`): seated in prison beside a book, a chain on the wall. Hence the book and the palm. He was ordained before 848 and so born before about 819 (Wikipedia): about forty-five at most at his death is a fair painter's age.
- The Roman bridge on the Guadalquivir stood in his day (local `Cordoba_bridge.txt`).
- **Against `john_matha`** (convex profile, clean-shaven) and `leander` (batch 22, another Andalusian, lean and long with a pointed chin): Eulogius is wide, bald and square-bearded.

## St. Euphrasia (13 Mar)

Face: a young Greek noblewoman of about twenty-two with a long slender neck and a narrow, oblong face under a high rounded forehead, a fine high-bridged nose, close-set heavy-lashed dark almond eyes, straight fine brows, a small full mouth with a slight smile.

- No likeness survives. The book's engraving (local `book-mar-13-euphrasia.jpg`, the same engraving as Wikipedia's lead image, local `Euphrasia.jpg`): a young veiled nun carrying a block of stone among ruined columns in Egypt. The card keeps the stone and the setting.
- The book: daughter of noble parents; her widowed mother withdrew with her to Egypt near a monastery of a hundred and thirty nuns; at seven she kissed an image of Christ given by the abbess and said "By vow I consecrate myself to Christ"; refused Theodosius's senator; carried stones for thirty days against temptation; died in 410, the thirtieth year of her age. Wikipedia (local `Euphrasia.txt`): "a Constantinopolitan nun", daughter of Antigonus, a kinsman of Theodosius I. Hence the small image of Christ on the card, and the Greek face.
- The age: the stones are told after the Emperor's death in 395, when she was about fifteen; twenty-two is a painter's age inside her convent years.
- **Against `dorothy`** (batch 20, round and smiling) and `agnes`, `philomena`: Euphrasia is narrow and long-necked with a high brow; her smile is slight, her veil brown.

## St. Maud (14 Mar)

Face: a Saxon matron of about sixty-five with a broad, square, strong-boned face, a wide low forehead, a short flat-bridged nose, a prominent square jaw softening into jowls, small twinkling grey eyes with laughter lines, and a kindly half-smile under a widow's wimple and a plain crown.

- No likeness from life. Wikipedia's images (local `Matilda.jpg`, `Mathilde_de.jpg`) are chronicle drawings of a crowned, veiled queen holding an orb, without individual features.
- The book: daughter of Count Theodoric, raised at the monastery of Erford by her grandmother Maud, married Henry of Saxony in 913 (Wikipedia: 909), king of Germany; mother of Otto, Henry and St. Bruno; after Henry's death in 936 founded many churches and five monasteries; died 14 March 968 lying on sackcloth. The engraving (local `book-mar-14-maud.jpg`): a crowned lady bringing a cup to the sick in their beds. Wikipedia (local `Matilda.txt`): founded the convent at Quedlinburg in 936, where she lived as a widow and was buried. Hence the widow's dress, the bowl and loaf, and Quedlinburg. The thumbnail of `Quedlinburg.jpg` shows the castle and abbey church above the town.
- **Against `veronica_milan`** (batch 20, short, broad, apple-cheeked) and the long-faced queens (`elizabeth_portugal`, `hedwig`, `margaret_scotland`, `jane_valois`): Maud's breadth is in the jaw, not the cheeks, and she is older than all but `hedwig`.
- **Against `monica` and `anne`** (older veiled women): check the square jaw and the laughter lines.

## Look-alike risks that remain

- **David among the white-bearded elders** (`simeon_jerusalem`, `paul_hermit`, `theodosius_cenobiarch`, `macarius_alexandria`, `anthony_abbot`, `patrick`). Reject a long or flowing beard, a mitre, or a full head of hair; the heavy brow, the short flat nose and the shaved forehead must show.
- **Albinus against `nicholas`**, `honoratus` and `eucherius_orleans` (old or clean-shaven bishops). The jowled, pear-shaped face has to read; reject a lean or bearded face.
- **Simplicius against `callistus`, `clement_i`, `fabian`** (early popes). Put all four on one face sheet; the ivory chasuble, the clean-shaven broad face and the humped nose are the check.
- **Cunegundes** may slide into the set's oval queen. Check the pointed chin and far-set eyes, and compare with `henry` once made, so husband and wife do not share a face.
- **Adrian and Eubulus**: the generator may make two similar young bearded men, or give either the Christ type. Eubulus must be nearly beardless and long-faced.
- **Colette against `clare_assisi`**: same order and veil. Reject brown in place of grey, a monstrance or a lily, or an oval face.
- **The Forty** is a crowd scene: check that the figures stay inside the arched window, that the loincloths are there, and that the four foreground faces differ.
- **Eulogius against `jerome`** (bald, bearded scholar with a book). Eulogius's beard is short, black and square, his face wide, and he wears a priest's chasuble.
- **Euphrasia against `rose_lima` and `clare_assisi`** (young veiled women). The high forehead and long neck are the check.
- **Maud** may come out as a gentle oval; reject it. The square jaw and the laughter lines must show.
