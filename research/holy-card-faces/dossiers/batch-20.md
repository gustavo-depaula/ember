# Batch 20 — the Pictorial Lives, 12 January to 6 February

Ten cards, the next ten unclaimed lines of "From the Pictorial Lives of the Saints" after batch 19: `aelred`, `veronica_milan`, `paul_hermit`, `honoratus`, `canutus`, `bathildes`, `marcella`, `bridgid`, `jane_valois`, `dorothy`. St. Peter's Chair at Rome (18 Jan) is skipped because batch 18 claims it; the book's other chapters in this stretch (Hilary, Antony, Ignatius, Candlemas, Blase, Agatha, the Martyrs of Japan) are already cards or claimed. The card data is in `../batches/batch-20.json`, written by `../consult/batch-20/build.py`. That script checks each excerpt verbatim in both languages (Marcella's pt-BR is our rendering), that each `lifeChapter` exists in en-US and pt-BR and is the index's chapter for its day, each feast against the index day, that each catalogMatch hits one unticked line no other batch claims, and that no id collides with `content/saints/` or another batch. It also lists any OF formulary whose title names one of the ten. Consulted pictures and extracts are saved in the same folder (`*.jpg`, `*.txt`, `*.json`, `jerome-letter-127.txt`, `Knud_den_Hellige.da.txt`, `catholic-encyclopedia-orders-of-the-annunciation.txt`).

**Dates, names, initials.** Feasts follow the book (index days 01-12 … 02-06). Names are the book's, tidied, keeping its spellings "Bathildes", "Canutus" and "Bridgid"; "St. Honoratus of Arles" adds the see, since there are several saints of the name. The initials are A, V, P, H, C, B, M, B, J, D.

**lifeChapter.** Every card has its own chapter, all ten checked. On 1 Feb the index names Bridgid and Ignatius and points at `feb-01-bridgid`, whose reflection is hers. Ignatius is already `ignatius_antioch`.

**proper.** None of the ten gets one. I searched `content/of/formularies/` by each date folder and by name in every formulary title:
- 01-13 is St. Hilary, 01-15 has only the French St. Remi, 01-31 is St. John Bosco, 02-04 has only the German-speaking Rabanus Maurus, 02-06 is St. Paul Miki. Nothing on 01-12, 01-16, 01-19, 01-30 or 02-01.
- The only formulary that names one of them is `sanctorale.07-10.german-speaking` ("Hl. Knud von Dänemark, … Erich von Schweden, … Olaf von Norwegen"), a joint memorial whose collect is in German only. `useSaintCollect` falls back from the app language to en-US to Latin, so it would show nothing. Following the rule, Canutus gets no `proper`.

**Excerpts.**
- Six come from the day's reflection in the index: a sentence, a clause, or the whole of it. `excerptSource` says which. Canutus's is the closing clause of a one-sentence reflection, capitalised; Paul's is the first clause, closed with a full stop.
- **Veronica:** her own words as the reflection quotes them.
- **Jane of Valois:** her words at the sentence of separation, from the chapter. The index reflection has a gap in the source ("The sound of the thrice each day", with "Angelus" missing), so I avoided it.
- **Dorothy:** her words at her sentence, from the chapter, first letter capitalised.
- **Marcella:** her chapter has **no Reflection**, and the Commons of Holy Women (`sanct14`, `sanct15`) have no pt-BR text. So her excerpt is St. Jerome on her, Letter 127 §4 (Fremantle, NPNF 1893, public domain): "Her delight in the divine scriptures was incredible." The pt-BR is our rendering. This follows the precedent of earlier batches that used a public-domain saying with a pt-BR rendering. Her card will carry no reflection.

## Structures across the batch

| | Age | Structure | Hair, beard, headdress |
|---|---|---|---|
| Aelred | 55 | long, soft rounded chin, upturned nose, very large wide-set eyes, high arched brows, wide smiling mouth | clean-shaven; auburn-grey tonsure ring |
| Veronica | 50 | short, broad, low wide brow, apple cheekbones, snub nose, small deep-set eyes, small square chin | wimple and black veil |
| Paul the Hermit | ~110 | long, tapering, hollow cheeks, long thin hooked nose, large eyes wide open and raised | bald crown, long thin white hair to the shoulders; undivided white beard to the waist |
| Honoratus | 75 | high, broad domed forehead over a short, small lower face, drooping wide-set eyes, full rosy cheeks | bald with a white fringe; short neat rounded white beard |
| Canutus | 42 | diamond: narrowish forehead, very wide high cheekbones, firm rounded chin, narrow wide-set pale eyes | straight red-gold hair to the jaw; short full red-gold beard; crown |
| Bathildes | 35 | round and full, high rounded forehead, round grey-blue eyes, bow mouth, dimpled chin | honey-blond braid under a veil and crown |
| Marcella | 85 | short heart shape gone thin, prominent cheekbones over fallen cheeks, small pointed chin, small hooked nose | white hair under a dark veil |
| Bridgid | 45 | wide oblong, broad flat cheekbones, long firm rounded jaw, freckles | white veil, copper-red strands |
| Jane of Valois | 40 | long, fuller below, very high forehead, small heavy-lidded close-set eyes, long upper lip, small pursed mouth | wimple, black veil, crown |
| Dorothy | 18 | small, round, dimpled, smiling, short rounded nose, large sparkling eyes | curling black hair under a wreath of roses |

## St. Aelred (12 Jan)

Face: an Englishman of about fifty-five, clean-shaven, with a long face ending in a soft, rounded chin, a gently upturned nose, very large, wide-set grey eyes under high arched brows and a wide, warm smile. A ring of auburn-grey hair circles his tonsure.

- The initial from a *Speculum caritatis* manuscript (Wikipedia lead image, local `Aelred_of_Rievaulx.jpg`), which I checked, shows a young, hooded, clean-shaven monk. I kept the shaven face. The Cistercian choir monks were tonsured and shaven.
- Wikipedia (1110–1167, so about fifty-seven at death) quotes Jocelyn of Furness ("witty and eloquent, a pleasant companion … patience and tenderness") and Knowles ("a singularly attractive figure"). The book stresses his love for his friends and his *Spiritual Friendship* and *Mirror of Charity*. Hence the warm, open face and the book.
- Setting: Rievaulx in its valley of the Rye (the book spells it "Rieveaux"). The abbey buildings are painted as a devotional near-anachronism, as on other cards.
- He must be told apart from `william_bourges` (batch 19: a white Cistercian cowl, but a wide, flat, bearded face, a mitre and a monstrance) and from `bernard_clairvaux`.

## St. Veronica of Milan (13 Jan)

Face: a Lombard countrywoman of about fifty with a short, broad face, a low wide brow, round apple cheekbones, a short upturned nose and small bright deep-set eyes. She wears a wimple.

- The roundel "Beata Veronica" (Wikipedia lead image, local `Veronica_of_Binasco.jpg`), which I checked: a black habit, a white wimple, a black veil, an olive branch, and a white bread or cloth in her hand. The card keeps the habit, the olive sprig and the bread.
- Book and Wikipedia: peasants' daughter of Binasco near Milan, field work, a lay sister of St. Martha's at Milan whose office was to beg the community's food through the city, died 1497 aged fifty-two. Hence the alms-sack, the loaf, the Milan street and the poplar-lined fields.
- The "three mystical letters" are not shown, because the card must carry no lettering.

## St. Paul the First Hermit (15 Jan)

Face: an Egyptian of about a hundred and ten, lean and sun-browned, with a long, tapering face, hollow cheeks, a long thin hooked nose and large dark eyes lifted in wonder. His crown is bald, with long thin white hair falling from the sides, and his undivided white beard reaches the waist.

- Painter's Manual (Didron, `consult/prelates-src/didron-fr.txt` l. 14883): "Saint Paul de la Thébaïde : vieillard, grande barbe qui descend jusqu'au milieu du corps. Il est vêtu d'une natte". So he is an old man, his great beard reaches the middle of the body, and he wears a mat. The card follows this. The scene of the meeting with Antony (l. 16738) adds the raven with a loaf.
- Ribera's *St. Paul the Hermit* (Wikipedia lead image, local `Paul_of_Thebes.jpg`), which I checked: bald, a white beard, gaunt, in a palm-leaf skirt at a cave mouth.
- Book: the palm gave him food and clothing, a spring gave him water, and a raven brought him half a loaf for sixty years. He died in his hundred and thirteenth year. The lions and the burial are left out to keep him half-length and alone.
- This is the stock white-bearded elder, which the sources demand. The long, tapering face, the raised wondering eyes, the long side hair and the undivided waist-length beard carry him.

## St. Honoratus of Arles (16 Jan)

Face: a Gallo-Roman of about seventy-five whose high, broad, domed forehead dominates a short, small lower face. He has wide-set, drooping pale-blue eyes, full rosy cheeks, a small smiling mouth and a short, neat, rounded white beard.

- No likeness survives. The woodcut of the Occitan *Vida de sant Honorat* (Wikipedia lead image, local `Honoratus_of_Arles.jpg`) shows a generic mitred archbishop.
- Book: of a consular Roman family in Gaul. He founded Lérins on the smaller island (now Saint-Honorat) about 400, was made Archbishop of Arles in 426 and died in 429. Wikipedia gives c. 350–429, so he was about seventy-nine at death.
- St. Hilary's praise of the "charity, concord, humility" of his community (as the book reports it) gives the kindly, fatherly face.
- Dress: fifth century, so a monastic cowl under a pallium, with no mitre. The island with umbrella pines and the red Estérel coast is the real view from Saint-Honorat. The snakes of the legend are left out.

## St. Canutus (19 Jan)

Face: a Dane of about forty-two, strongly built, with a diamond-shaped face: a narrowish forehead, very wide high cheekbones and a firm rounded chin. He has narrow, wide-set pale-blue eyes, straight red-gold hair to the jaw and a short full red-gold beard.

- Danish Wikipedia (local `Knud_den_Hellige.da.txt`) gives his dates as c. 1043 to 10 July 1086. It reports the forensic studies of the Odense skeleton:
  - In 2008 the right forearm bone was found much larger than the left, so he was right-handed. The article does not report the height or build that I quote below.
  - The 1985 study found the skull of a man of 39–55, with bones possibly from more than one person.
  - The 2015 study found a healed leg fracture and slight tuberculosis.
- The search summary of *Kristeligt Dagblad*, "Knud den Hellige på retsmedicinsk", gives "strong and muscular" and 1.70 m. I could not open the article itself (HTTP 405), so the height is **unverified**. Neither source says anything about his face, hair or beard.
- Iconography: the same article records a twelfth-century picture of him on a column of the Church of the Nativity at Bethlehem, "med krone på hovedet, i højre hånd en lanse og et korsmærket skjold på venstre arm" (crowned, a lance in his right hand, a cross-marked shield on his left arm). The card follows that.
- Book: the church in Odense where he was killed at the altar. Wikipedia: St. Alban's.
- Colouring and structure are our choice for a Dane. He is kept apart from `wenceslaus` (broad Slavic, chestnut) and `stephen_hungary` (square, drooping moustache).

## St. Bathildes (30 Jan)

Face: an Anglo-Saxon woman of about thirty-five with a round, full face, a high rounded forehead, round grey-blue eyes, a bow-shaped mouth and a dimpled chin. A honey-blond braid shows under her veil and crown.

- The medieval miniature (Wikipedia lead image, local `Balthild.jpg`), which I checked: crowned and haloed in a rose-red mantle, between nuns and monks. Nothing about the face.
- Wikipedia describes the chemise of Balthild at Chelles: a linen tabard embroidered in silk with necklaces "in the exact likeness of the jewellery" she wore as queen and a jewelled cross. The card dresses her in it. The *Vita* calls her "beautiful, intelligent, modest".
- Book: born in England, sold as a slave, married to Clovis II, then regent. She founded hospitals and houses and ended her life at Chelles in 680, serving the sick. Hence the loaf and cloth for the poor and the abbey on the Marne.
- Age: born c. 626–627 (Wikipedia), so about thirty-five as regent.

## St. Marcella (31 Jan)

Face: a Roman lady of about eighty-five with a short, heart-shaped face grown thin, prominent cheekbones over fallen cheeks, a small pointed chin, a small hooked nose and quick, bright dark eyes. She wears a dark veil.

- No likeness survives. The engraving on Wikipedia (local `Marcella_of_Rome.jpg`) shows her kneeling before the Goths, a veiled old woman.
- Jerome, Letter 127 (local `jerome-letter-127.txt`): "Her very clothing was such as to remind her of the tomb" (§6). Also her "delight in the divine scriptures" (§4). She "never came to see me that she did not ask me some question concerning them" (§7). Hence the coarse dark dress, the open codex and the questioning, lifted gaze.
- Wikipedia: 325–410, a palace on the Aventine, eighty-five at the sack. Hence her age and the Aventine terrace.
- The scourging is not shown.

## St. Bridgid (1 Feb)

Face: an Irishwoman of about forty-five with a fair, freckled complexion and a wide, oblong face with broad flat cheekbones and a long firm jaw. She has large wide-set blue eyes and copper-red strands of hair under a white veil.

- No likeness survives. Book: at her profession St. Mel invested her "with a snow-white habit, and a cloak of the same color". She founded Kildare and tended the monastery's cattle. The card dresses her in white and puts a cow in the field.
- Wikipedia iconography: a Brigid's cross, an abbess's crozier and a lamp, the perpetual flame of Kildare, and the cow. The Cong window (lead image, local `Brigid_of_Kildare.jpg`) shows her in white with a lamp.
- The book's reflection speaks of her "outward resemblance to Our Lady". I did **not** give her Our Lady's face from `recurring-figures.md`, so that the card is not read as a Marian one. Tell me if you would rather she carried it.
- She stays clear of `bridget_sweden` (a different saint, the 07-23 formulary) by the white habit, the Irish colouring and the lamp.

## St. Jane of Valois (4 Feb)

Face: a French princess of about forty with a long face, fuller in its lower half. She has a very high forehead, small heavy-lidded close-set blue-grey eyes, a long upper lip, a small pursed mouth and soft full lower cheeks. She wears a wimple.

- The portrait "Joan of Valois Queen of France" on Wikipedia (local `Joan_of_France_Duchess_of_Berry.jpg`; Commons gives the author as unknown and no date) shows a pale, long face with a very high forehead and small heavy-lidded eyes. It also shows a long upper lip and a small, pursed mouth, in a dark hood lined red. The card follows that structure.
- Wikipedia: 1464–1505, so forty at death, and she had "a hump on her back and walked with a limp". The half-length pose and the mantle leave that out, as the brief asks: keep the marks, never the unflattering details.
- Habit: "grey with scarlet scapular and white mantle" (Catholic Encyclopedia, "The Orders of the Annunciation", local copy).
- The book says she was buried in the royal crown and purple over the habit. Hence the slender crown on the veil. Her lifelong devotion to the Hail Mary and the Angelus (book, Wikipedia) gives the rosary and the Bourges evening.

## St. Dorothy (6 Feb)

Face: a Cappadocian girl of about eighteen with a small, round, dimpled face, a joyful smile, a short rounded nose and large sparkling dark eyes. Her curling black hair is gathered under a wreath of roses.

- No likeness survives. Book: at the rack Sapricius "was amazed at the heavenly look she wore, and asked her the cause of her joy", and "her joy grew" to the end. That gives the smiling face, which also sets her apart from the set's composed, oval-faced virgin martyrs.
- Book: the child with three apples and three roses. Wikipedia iconography: a basket of flowers and fruit and a wreath of roses. Zurbarán's *Santa Dorotea* (lead image, local `Dorothea_of_Caesarea.jpg`), which I checked, holds a dish of apples and roses in rose-pink and golden-yellow, and the card borrows those colours.
- Setting: Caesarea in Cappadocia (Wikipedia) under Mount Argaeus (Erciyes), in winter as the book says.
- The angel-child is left out to keep a single figure. He could be added small at her side if wanted.

## Look-alike risks that remain

- **Paul the Hermit** against `anthony_abbot`, `theodosius_cenobiarch`, `macarius_alexandria` and `charbel`: another white-bearded desert elder. Reject a draft that gives him a forked beard, a hood or a broad face. The undivided waist-length beard, the bare bald crown with long side hair and the wide, wondering eyes must show.
- **Honoratus** against `nicholas` and `polycarp`: an old man with a short rounded white beard and rosy cheeks. The domed forehead over a small lower face has to read clearly, with no mitre.
- **Aelred**: the generator may give him a stock beardless-monk face. Check that the upturned nose, the very large eyes and the smile come through. Compare with `william_bourges` and `bernard_clairvaux` on one sheet.
- **Canutus** against `louis_france` and `stephen_hungary` (crowned kings). Check the red-gold beard and the diamond cheekbones, and keep the lance and shield inside the window.
- **Three crowned women** (Bathildes, Jane of Valois, and `elizabeth_portugal`, `hedwig` already made). Bathildes must stay round and young, Jane long and pale with heavy lids. Jane's crown sits on a nun's veil: reject a draft that turns her into a secular queen.
- **Bridgid** in white may come out like `clare_assisi` or a generic abbess. The freckles and copper hair are the check.
- **Dorothy** may lose her smile and slide into the set's oval virgin (`agnes`, `philomena`). Reject if she comes out composed rather than joyful.
- **Veronica** against `rita_cascia` (black Augustinian habit, both). Veronica is broad and ruddy with an upturned nose; Rita pale and fine-boned.
- **Marcella**'s thin heart-shaped old face against `teresa_calcutta` (small, tapering). The veil colour and setting differ; check the bright, questioning eyes.
