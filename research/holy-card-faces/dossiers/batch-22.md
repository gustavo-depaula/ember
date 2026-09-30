# Batch 22 — the Pictorial Lives, 18 to 29 February

Ten cards, the next ten unclaimed lines of "From the Pictorial Lives of the Saints" after batch 21: `simeon_jerusalem`, `barbatus`, `eucherius_orleans`, `severianus_scythopolis`, `serenus`, `tarasius`, `porphyry_gaza`, `leander`, `romanus_lupicinus`, `oswald_worcester`. The book's other chapters in this stretch are covered elsewhere: Peter's Chair at Antioch (22 Feb) is batch 14's `chair_peter` (the calendar feast, not yet made), Matthias (24 Feb) is the card `matthias`, and St. Peter Damian (23 Feb, in the index beside Serenus) is `peter_damian`. The card data is in `../batches/batch-22.json`, written by `../consult/batch-22/build.py`. That script checks each excerpt verbatim in both languages against the card's own chapter or its day's index reflection, that each `lifeChapter` exists in en-US and pt-BR and is the index's chapter for its day, each feast against the index day, that each catalogMatch hits one unticked line no other batch claims, that no id collides with `content/saints/` or another batch, and that each initial matches the name. It also lists every OF formulary on the ten dates and every sanctoral formulary whose title names one of the ten, with the languages of its collect. Consulted pictures and extracts are saved in the same folder: Wikipedia summaries and extracts with lead images (`*.json`, `*.txt`, `*.jpg`), Commons metadata (`commons-*.json`), the book's engravings (`book-*.jpg`, on one sheet in `book-sheet.jpg`), the Wikipedia pictures on one sheet (`wiki-sheet.jpg`), and the existing cards compared against (`existing/`, sheet `existing-sheet.jpg`). `fetch.sh` is the fetcher.

**Dates, names, initials.** Feasts follow the book (index days 02-18 … 02-29, skipping 02-22 and 02-24). Names are the book's, tidied, with a place added where the name is shared: Simeon of Jerusalem (not the Stylite of batch 19), Eucherius of Orléans (not Eucherius of Lyon), Severianus of Scythopolis, Porphyry of Gaza, Leander of Seville, Oswald of Worcester (not the king). "St. Serenus, a Gardener" becomes "St. Serenus the Gardener" / "São Sereno, o Jardineiro", Wikipedia's name for him. All ten were already "St." in the book; none has changed title since. The initials are S, B, E, S, S, T, P, L, R, O.

**lifeChapter.** Each card has its own chapter, checked in both languages, and each is the index's chapter for its day. Two notes: the 02-23 index entry names Peter Damian and Serenus and points at Serenus's chapter, but its reflection is Peter Damian's; the chapter's own Reflection is about the garden, and that is where the excerpt comes from. Leander's and Romanus and Lupicinus's chapters have no Reflection paragraph at all (the index has no `reflection` for 02-27 and 02-28), so the reflection the card shows at build time will be the chapter's last paragraph, which for Leander is his death and the cathedral of Seville and for Romanus and Lupicinus is Lupicinus's austerities. Oswald's chapter has no engraving.

**proper.** None of the ten gets one. The formularies on these dates are other saints': 02-18 Bernadette (French only), 02-21 Peter Damian, 02-23 Polycarp, 02-25 Walburga (German only), 02-26 Alexander of Alexandria (Africa), 02-27 Gregory of Narek; nothing on 02-19, 02-20, 02-28 or 02-29. The one sanctoral formulary naming one of the ten is `sanctoral/11-13/spain.json`, "San Leandro, obispo", whose collect is in Spanish only, so it can't show on the card. Oswald's modern date in England and Tarasius's Latin date (18 Feb, per Wikipedia) have no formulary either.

**Excerpts.**
- Six from the day's index reflection: Simeon (its last sentence), Barbatus (the words of St. Augustine it quotes, in quotation marks), Eucherius (first sentence), Severianus (the verse of 1 Cor 10:12 it quotes; the pt-BR line is verbatim with its full stop, the en-US has the stop added because the book runs two quotations together), Tarasius (the whole reflection), Porphyry (second sentence), and Oswald (the first clause, "A soul without discipline is like a ship without a helm", closed with a full stop).
- **Serenus:** the first sentence of his own chapter's Reflection, since the 02-23 index reflection is Peter Damian's.
- **Leander:** the first clause of the chapter's last paragraph ("St. Leander was no less zealous in the reformation of manners than in restoring the purity of faith").
- **Romanus and Lupicinus:** "The brothers governed the monks jointly and in great harmony", from the chapter, the clause before "though Lupicinus was the more inclined to severity".

## Structures across the batch

| | Age | Structure | Hair, beard, headdress |
|---|---|---|---|
| Simeon | past 100 | long, narrow hatchet face keeled like a blade, long thin straight nose, small deep eyes under a jutting brow, sunken temples, deep furrows | bare head; long thin straight white hair from a bald crown; sparse wispy white beard to the collarbone |
| Barbatus | 65 | broad, low flat-topped forehead, large bulbous nose, small laughing creased eyes, bushy straight brows, full rosy cheeks, wide mouth | grey hair cropped round; great bushy salt-and-pepper beard spreading wide |
| Eucherius | 55 | concave (dished) profile: rounded prominent forehead, short scooped nose, firm forward chin; close-set long-lashed grey-green eyes, low straight brows, long neck | clean-shaven; light-brown monk's crown |
| Severianus | 55 | round and full, fleshy cheeks, short rounded fleshy nose, large heavy-lidded almond eyes, thick horizontal brows | black curls receding; short round black beard with a white blaze at the chin |
| Serenus | 45 | lean and angular, classical Greek profile (no dip at the bridge), sharp high cheekbones, long strong jaw, wide thin mouth | short-cropped black hair greying; close-trimmed short black beard |
| Tarasius | 70 | full oval, high bald domed forehead, heavy-lidded almond eyes with pouches, broad-bridged straight nose, full soft cheeks | grey-brown hair at sides to the nape; long wedge-shaped wavy grey-brown beard ending in a point |
| Porphyry | 65 | diamond: narrow forehead and chin, wide jutting cheekbones, short low-bridged nose, very large prominent eyes, wide thin mouth | bald crown, dark-grey hair long behind; long straight dark beard greying |
| Leander | 60 | lean and long, receding hairline, deep-set heavy-lidded black eyes, strong arched brows, nose with a hump, narrow pointed chin | white mitre; short close-trimmed black beard flecked with grey |
| Romanus | 70 | soft rounded oval, long broad blunt nose, round wide-open eyes under raised curved brows, small soft chin | clean-shaven; white tonsure ring |
| Lupicinus | 55 | long and bony, slightly undershot jutting jaw, stern wide mouth, deep-set eyes, heavy brows knotted by a furrow, sunken cheeks | hood of his skin cowl up; short stiff black-grey beard |
| Oswald | 65 | long handsome face, broad high forehead, long narrow straight nose, high broad cheekbones, deep-set blue eyes, clean-cut jaw | silver-fair hair level at the ears; short neat silver-fair beard |

## St. Simeon of Jerusalem (18 Feb)

Face: a Jew well past a hundred, with a long, narrow hatchet face, a long thin straight nose, small deep dark eyes under a jutting brow and sunken temples. Bare-headed, long thin white hair from a bald crown, a sparse white beard to the collarbone.

- The book: son of Cleophas, kinsman of Our Lord, chosen bishop after James, led the Church to Pella and back, crucified under Trajan at a hundred and twenty. Wikipedia (local `Simeon_of_Jerusalem.txt`) gives Eusebius's account of his election.
- The Painter's Manual: "Siméon, frère du Seigneur : très-vieux" (`consult/prelates-src/didron-fr.txt` l. 14004). The book's engraving (local `book-feb-18-simeon.jpg`): a haloed old man with a long staff, bareheaded, rebuking the Jews in a street of Jerusalem. The card keeps the staff and adds a plain wooden cross for his death.
- Very old, so the white-bearded elder is unavoidable; the hatchet shape, the sparse straight beard and the bare head are our choice to keep him apart. I first gave him a mantle over the head and dropped it: `john_damascene` (local `existing/john_damascene.png`) already wears a striped head-cloth with a long grey beard.
- Background: the ruins of Jerusalem after 70, where the book says the Christians returned "and settled themselves amidst its ruins".

## St. Barbatus (19 Feb)

Face: a Samnite of about sixty-five with a broad, low, flat-topped forehead, a large bulbous nose, small laughing creased eyes, bushy brows, rosy full cheeks and a great bushy salt-and-pepper beard spreading wide.

- No likeness survives. The book's engraving (local `book-feb-19-barbatus.jpg`): a bearded priest preaching from a raised ambo to a crowd. Italian Wikipedia's lead image (local `Barbato_it.jpg`) shows him, mitred, felling the tree.
- English Wikipedia (local `Barbatus.txt`): after the siege "he then cut down the tree the locals had worshipped, and melted the viper into a chalice for use in the church"; Italian Wikipedia calls it the "noce delle streghe", a walnut. The book tells only the golden viper and the tree hung with a skin. Hence the chalice and the felled walnut. The Arch of Trajan is Benevento's (Wikipedia, local `Arch_Benevento.txt`).
- Died 682 "at about seventy" (Wikipedia; the book: "about seventy years old"). Bishop 663–682. Seventh century, so no mitre.
- **Against `nicholas` and `polycarp`**: jovial old bishops. Barbatus's beard is salt-and-pepper and spreading, not white and short, and the bulbous nose is the check.

## St. Eucherius of Orléans (20 Feb)

Face: a Frank of about fifty-five, clean-shaven, with a dished profile (rounded forehead, short scooped nose, firm forward chin), close-set grey-green eyes under low straight brows and a long neck. A monk's crown of light-brown hair.

- No likeness survives. The book's engraving (local `book-feb-20-eucherius.jpg`): a mitred bishop at a church door handing bread from a basket to a crowd of poor. The book: Robert of Hesbaye "made him the distributor of his large alms" at Sarchinium (Saint-Trond). The card keeps the basket and the bread.
- Wikipedia (local `Eucherius.txt`): born c. 687, a monk of Jumièges from 714, bishop 721, exiled by Charles Martel, died 743 at Sint-Truiden. Hence fifty-five, the black habit under the chasuble, no mitre.
- **Against `aelred`** (batch 20, a beardless monk with an upturned nose and very large eyes, smiling): Eucherius's nose is scooped but short and straight-tipped, his eyes are close-set and deep, he is grave, and he wears a crimson chasuble with a basket of bread. **Against `peter_claver`** (triangular, clean-shaven, aquiline nose): the dished profile and full lips.

## St. Severianus of Scythopolis (21 Feb)

Face: a Palestinian Greek of about fifty-five with a round, full face, a short fleshy nose, large heavy-lidded almond eyes, thick horizontal brows and a short round black beard with a white blaze at the chin.

- No likeness survives. The book's engraving (local `book-feb-21-severianus.jpg`): a bearded bishop struck down on his knees by soldiers outside the city. The card shows no soldiers or wounds, only the palm.
- The book and Wikipedia (local `Severianus.txt`): bishop of Scythopolis, killed in late 452 or early 453 by the soldiers of the Eutychian monk Theodosius for upholding Chalcedon. His age is unknown.
- Scythopolis is Beit She'an: its tell, Roman theatre and cardo are from Wikipedia (local `Beth_Shean.txt`), which also places the Battle of Gilboa there.
- **Against `flavian`** (batch 21, lean, beaked, narrow pointed grey beard, pale phelonion) and `apollinaris_hierapolis`: Severianus is round-faced, black-bearded with a white blaze, in purple-red.

## St. Serenus the Gardener (23 Feb)

Face: a Greek of about forty-five, sun-dark and lean, with a classical straight profile, sharp high cheekbones, a long strong jaw, a wide thin mouth, short black hair greying and a close-trimmed black beard.

- No likeness survives. The book's engraving (local `book-feb-23-serenus-a-gardener.jpg`): a bearded, hooded man in a long robe with a spade and a watering pot, rebuking the woman at his garden fence. Wikipedia's lead image (local `Serenus.jpg`) is a nineteenth-century window at Billom, where his relics are claimed. The card keeps the spade and the garden and leaves the woman out.
- Sirmium, now Sremska Mitrovica, lay on the Sava (Wikipedia, local `Sirmium.txt`). Beheaded 307 (book).
- **Against the stock thirties man**: he is forty-five, greying, with a sharp angular face. Check the straight profile and the cheekbones.

## St. Tarasius (25 Feb)

Face: a Byzantine noble of about seventy with a full oval face, a high bald domed forehead, heavy-lidded almond eyes with pouches, full soft cheeks, and a long wedge-shaped wavy grey-brown beard ending in a point.

- The fourteenth-century fresco in the church of the Theotokos Peribleptos (Commons metadata `commons-Agios_Tarasios_Peribleptos.json`, image `Tarasius.jpg`): a long face, a high bare forehead, heavy-lidded eyes and a long, wavy, pointed brown-grey beard, in a polystavrion, holding a jewelled Gospel book. The Painter's Manual: "Saint Tarasios de Constantinople : vieillard, barbe en pointe" (l. 14234). The card follows both.
- The book's engraving (local `book-feb-25-tarasius.jpg`): mitred, rebuking the seated emperor. The book: a layman made patriarch, the council of 786–787 on holy images, died 806 after twenty-one years. Wikipedia: patriarch 784–806.
- Hagia Sophia was completed in 537 (Wikipedia, local `Hagia_Sophia.txt`), so it stands behind him; `flavian` is painted before it.
- I had given him an icon to hold for Nicaea II and dropped it: `john_damascene` already holds one.

## St. Porphyry of Gaza (26 Feb)

Face: a Thessalonian of about sixty-five, lean, with a diamond face (narrow forehead and chin, wide jutting cheekbones), a short low-bridged nose, very large prominent eyes, a bald crown and a long straight dark beard greying.

- The sixteenth-century fresco at the Dionysiou monastery on Athos (Commons metadata `commons-Порфирий_Газский.json`, image `Porphyry.jpg`): balding, a long dark beard with grey, a phelonion with crosses. The card keeps those.
- The book: a monk of Scete and then Palestine, keeper of the relics of the True Cross, bishop of Gaza, who built a church on the site of the chief temple and paved its approach with the temple's marbles; died 420. Wikipedia (local `Porphyry.txt`): bishop "at the age of 45" according to the Vita, whose historicity it reports as disputed. Hence about sixty-five and the reliquary cross.
- The book's engraving (local `book-feb-26-porphyry.jpg`) shows a man prostrate before a vision of Christ on the cross with the Good Thief, which the chapter does not tell; not used.
- **Against `clement_i`** (diamond face, aquiline nose, close-cropped black hair): Porphyry has a short low-bridged nose, a bald crown and a long beard.

## St. Leander of Seville (27 Feb)

Face: a Hispano-Roman of about sixty with a lean, long, sallow face, receding dark hair, deep-set heavy-lidded black eyes under strong arched brows, a nose with a hump, a narrow pointed chin and a short close-trimmed black beard flecked with grey.

- Murillo's San Leandro (1655, Seville Cathedral; Wikipedia lead image `Leander.jpg`, Commons metadata `commons-San_Leandro.json`): a lean, dark, short-bearded face under a white mitre, in a white cope with a crozier, holding a sheet written against the Arians. Commons: "según la tradición el rostro del santo está inspirado en el del licenciado Alonso de Herrera". So the face is a seventeenth-century Sevillian's, the only established image; the card follows it, with the scroll blank.
- The book's engraving (local `book-feb-27-leander.jpg`): a bearded bishop in a study, mitre and crozier set by, beside a youth writing.
- Wikipedia (local `Leander.txt`): Hispano-Roman family of Cartagena, c. 534 – 13 March 600 or 601; the book has him die about 596. The Guadalquivir and the name Hispalis are from Wikipedia's Seville (local `Seville.txt`).
- **Against `john_britto`** (batch 21, lean with a full black beard) and `john_damascene`: Leander's beard is short and close, his chin narrow, and he wears the white mitre and cope.

## Sts. Romanus and Lupicinus (28 Feb)

Faces: Romanus (left), about seventy, clean-shaven and rosy, with a soft rounded oval, a long broad blunt nose, round wide-open eyes under raised curved brows and a white tonsure ring. Lupicinus (right), about fifty-five, gaunt, with a long bony face, a slightly undershot jaw, a stern wide mouth, deep-set eyes under heavy knotted brows and a short stiff black-grey beard, his skin cowl up.

- No likenesses survive. The book's engraving (local `book-feb-28-sts-romanus-and-lupicinus.jpg`): two haloed monks at a rock shelter in the forest, one seated with his hood up, one standing. The painted statue of St. Romain at Savennières (French Wikipedia lead image, local `Romain_fr.jpg`): beardless and tonsured in a dark habit, holding a red book. Romanus follows the statue.
- The book: Romanus left for the forests of the Jura at thirty-five, settled at Condat at the meeting of two rivers; his brother Lupicinus joined him; "Lupicinus was the more inclined to severity"; "His tunic was made of various skins of beasts sewn together, with a cowl", and he lived on hard bread softened in water "so that he could eat it with a spoon". Hence the skin cowl, the bowl and the spoon. Romanus died about 460 (Wikipedia: c. 390 – c. 463), so about seventy; Lupicinus is younger (Wikipedia, local `Romanus.txt`, `Lupicinus.txt`).
- Two brothers on one card, as `faustinus_jovita` and `philip_james`. The soft, beardless Romanus against the gaunt, bearded, hooded Lupicinus keeps them apart.
- **Romanus against `honoratus`** (batch 20, a domed forehead over a small lower face, short rounded white beard, rosy): Romanus is clean-shaven with a long blunt nose and no dome.

## St. Oswald of Worcester (29 Feb)

Face: an Englishman of Danish blood, about sixty-five, with a long handsome face, a broad high forehead, a long narrow straight nose, high broad cheekbones, deep-set clear blue eyes, a clean-cut jaw, and a short neat silver-fair beard.

- The book: "of a noble Saxon family, and was endowed with a very rare and beautiful form of body"; Wikipedia (local `Oswald.txt`): "of Danish parentage", c. 925 – 29 February 992, monk of Fleury, Bishop of Worcester 961, Archbishop of York 972 with the pallium from John XIII, died "in the act of washing the feet of the poor at Worcester, as was his daily custom during Lent". Hence the towel and basin, the pallium, the Danish colouring.
- Wikipedia's lead image (local `Oswald.jpg`, Commons metadata `commons-Oswald_and_Eadnoth.json`) is a Ramsey Psalter miniature of c. 1300 that Commons describes only as "a bishop above a ram, and an abbot above a bull": a mitred bishop with a short beard. The beard follows it; the mitre does not, since the tenth century had none.
- The book has no engraving for this day. Worcester is on the Severn (Wikipedia, local `Worcester.txt`).
- **Against `boniface`** (Anglo-Saxon, broad, flat-planed, flaxen, square beard, mitre): Oswald's face is long and fine, his beard silver and close, no mitre.

## Look-alike risks that remain

- **Three Eastern bishops in one batch** (Severianus, Tarasius, Porphyry) plus `flavian` and `apollinaris_hierapolis` from earlier batches and `athanasius`, `john_damascene`. Vestments differ (purple-red, black-cross polystavrion, ivory with red crosses) and so do the structures (round with a white blaze; full oval with a bald dome and wedge beard; diamond with jutting cheekbones and bulging eyes). Put all five on one face sheet.
- **Simeon** is one more white-bearded elder, beside `paul_hermit`, `theodosius_cenobiarch`, `macarius_alexandria`, `anthony_abbot` and `john_damascene`. Reject a full or forked beard, a head-cloth or a broad face; the hatchet shape and the sparse straight beard must show.
- **Tarasius and Porphyry** are both old, balding and long-bearded. Tarasius is full-cheeked with a grey-brown wavy beard ending in a point; Porphyry is lean and diamond-shaped with a straight dark beard and bulging eyes. Check them side by side.
- **Barbatus** may slide toward `nicholas` or `polycarp`. Check the bulbous nose and the spreading salt-and-pepper beard.
- **Eucherius** against `aelred` and `peter_claver` (clean-shaven religious). The dished profile is easy to lose; reject a straight or aquiline nose.
- **Leander** against `john_britto` and `charles_borromeo`: keep the beard short and the chin narrow.
- **Romanus and Lupicinus** may come out as two similar monks. Romanus must be beardless and soft, Lupicinus bearded, hooded and gaunt in a tunic of skins.
- **Oswald** may become a generic handsome bishop. Check the long narrow nose, the high cheekbones and the silver beard against `boniface` and, once made, `augustine_canterbury` (batch 12).
- **Oswald's feast is 29 February.** `feastLabel` in `apps/app/src/features/saints/data/catalog.ts` formats `new Date(2001, month - 1, day)`, and 2001 is not a leap year, so this card would be labelled "March 1". Use a leap year there before the card ships.
