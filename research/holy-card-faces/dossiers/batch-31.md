# Batch 31 — the Pictorial Lives, 25 June to 7 July

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 30: `prosper_aquitaine`, `william_montevergine`, `ladislas`, `gal_clermont`, `heliodorus`, `bertha_blangy`, `peter_luxemburg`, `goar`, `palladius`, `pantaenus`. No line in this stretch is skipped. The 15 June line (Sts. Vitus, Crescentia, and Modestus), skipped by batch 30, is left alone pending a decision. The book's other chapters here are carded elsewhere: John the Baptist (24 Jun) is `john_baptist`, John and Paul (26) `john_paul_martyrs`, Irenæus (28) `irenaeus`, Peter (29) `peter`, Paul (30) `paul`, the Visitation (2 Jul) `visitation`, and Elizabeth of Portugal (8 Jul) `elizabeth_portugal`. The next unclaimed line is The Seven Brothers and St. Felicitas (10 July), left for batch 32.

The card data is in `../batches/batch-31.json`. `../consult/batch-31/build.py` writes it from `cards.py` (adapted from batch 30's). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day. Palladius's is the one exception: the index's 07-06 entry names Goar and Palladius but points at Goar's chapter;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph. Four do in both languages (Ladislas, Peter, Palladius, Pantænus); the other six cards' chapters have none, and their excerptSources say so;
- that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text would have to be the card's `proper`;
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days;
- that each catalogMatch hits one unticked line that no other batch claims;
- that no id collides, that no other card uses the chapter, and that the one chapter shared inside the batch (25 June) is shared only by Prosper and William;
- initials and refs.

Consulted material is in `../consult/batch-31/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Prosper (en, fr), William (en, it; Montevergine abbey, it), Ladislaus (en, hu), Gall Ier de Clermont (fr; the English title redirects to the Archdiocese of Clermont, saved as `ClermontArch.*`), Heliodorus (en, it), Bertha (en, fr), Pierre de Luxembourg (en, fr), Goar (en, de), Palladius, Pantaenus;
- Commons pictures (`commons-files.txt` lists them, `c-*.jpg`; sheet `commons-sheet.jpg`): Zenale's William of Vercelli, the Avignon School panel of Pierre de Luxembourg, the Goar window at St. Goar, the Murano statue of Heliodorus, Winckler's Pantaenus, a Bertha devotional card, the chapel at Fordoun; face crops of the Győr herm, the Avignon panel and Zenale (`crop-*.jpg`, `faces-crop.jpg`); `commons-search.txt` is the search log;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`; Palladius's chapter has none);
- existing cards compared against (`existing-sheet.jpg`: Aloysius, Charles Borromeo, Stephen of Hungary, Casimir, the Doctors, Patrick, Justin, Benedict, the Benedictine abbesses);
- every face line of batches 1–30 and 52 (`faces-all.txt`).

`fetch.sh` is the fetcher, `list.txt` and `list2.txt` its input, `sheet.py` makes the sheets.

**Dates, names, initials.** Feasts follow the book (index days 06-25 twice, 06-27, 07-01, 07-03 to 07-05, 07-06 twice, 07-07). Names are the book's, with its pt-BR forms (São Próspero da Aquitânia, São Guilherme de Monte-Vergine, São Ladislau, São Galo, Santo Heliodoro, Santa Berta, Pedro de Luxemburgo, São Goar, São Paládio, São Panteno). Titles the book puts after the name are dropped ("King", "Bishop", "Widow, Abbess", "Priest", "Bishop, Apostle of the Scots", "Father of the Church"); the book's "St William" gets its full stop, and "Pantænus" and "Luxemburg" keep the book's spelling. The ids `gal_clermont` (apart from St. Gall of the Swiss abbey, 16 Oct) and `bertha_blangy` (apart from Bertha of Kent) keep namesakes apart. Initials: P, W, L, G, H, B, P, G, P, P.

**Peter of Luxemburg: "St." in the book, "Blessed" in fact.** The book and the catalog line call him "St. Peter of Luxemburg". He was never canonized: Clement VII beatified him on 9 April 1527, and Urban VIII allowed the Carthusians his Mass and Office in 1629 (Wikipedia en, fr; local `PeterLux.txt`, `PeterLuxFr.txt`). Following "the saint's current title", the card calls him **"Bl. Peter of Luxemburg" / "Beato Pedro de Luxemburgo"**, as `inacio_azevedo` is "Bl." / "Beato". The book's words in the excerpt, "St. Peter teaches us…", are left as they are. Wikipedia adds that his see of Metz and his cardinal's hat came from the Avignon claimant Clement VII during the Western Schism (a "pseudocardinal"). His cult is not suppressed, so the line stays. See the doubts. The other nine have always been "St." in the book, and none has changed title since: Ladislaus was canonized in 1192, and the rest have had a cult since before canonization procedures existed.

**lifeChapter and reflection.**
- **Prosper and William share one chapter**, `jun-25-prosper-of-aquitaine-st-william-of-monte-vergine`, which tells the two lives one after the other and has no Reflection. Each card's lifeChapter is that chapter, because it tells each saint's life, and neither card has a reflection. This follows batch 27, where `cletus` and `marcellinus_pope` share a chapter.
- **Goar and Palladius** have separate chapters (`jul-06-goar`, `jul-06-palladius`). Goar's has no Reflection. The index's 07-06 reflection is the one that closes the Palladius chapter, and Palladius's card takes the Reflection of its own chapter. Goar's card has none, with no fallback to the day's.
- **Gal, Heliodorus and Bertha**: their chapters have no Reflection, so their cards have none.
- **Ladislas, Peter, Palladius, Pantænus**: each card's reflection is its own chapter's `**Reflection**` paragraph.

**proper.** None. No formulary in the repo is proper to any of the ten, in any language. The script's one title hit is `sanctorale.10-16.german-speaking`, "Hl. Gallus, Mönch, Einsiedler, Glaubensbote": St. Gall of the Swiss abbey, a different saint, with German text only. The formularies on the book's days all belong to other saints: 06-27 Cyril of Alexandria (German-speaking: Hemma of Gurk), 07-01 Junípero Serra (US), 07-03 Thomas, 07-04 Elizabeth of Portugal (Ulrich; US Independence Day), 07-05 Anthony Zaccaria, 07-06 Maria Goretti, 07-07 Willibald (German-speaking). There is none on 06-25.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Peter of Luxemburg and Pantænus;
  - the first sentence: Palladius;
  - the first clause of the first sentence, before the semicolon, closed with a full stop: Ladislas.
- From the chapter, where there is no Reflection:
  - **Prosper**: the first paragraph's third sentence.
  - **William**: the clause after "where" in the third paragraph, capitalised.
  - **Gal**: the main clause about Evodius's insult ("The Saint, without making the least reply, arose meekly…").
  - **Heliodorus**: the first paragraph's last sentence.
  - **Bertha**: the clause after "And then, after establishing a regular observance in her community,", capitalised.
  - **Goar**: the clause after "having been raised to sacred orders,", capitalised.

## St. Prosper of Aquitaine (25 June)

- Wikipedia (`Prosper.txt`, `ProsperFr.txt`): c. 390 – c. 455, a layman of Aquitaine who came to Marseille as a refugee by 417, corresponded with Augustine, and served Leo I in Rome "in some secretarial or notarial capacity" from 440. He defended Augustine on grace (*De vocatione omnium gentium*, *Contra collatorem*) and continued Jerome's Chronicle; Marcellinus mentions him under 463. Lead image: the book's own engraving.
- The book: born 403, "a holy and venerable man", a layman, Leo's secretary, the Pelagians put down in Rome, "still living in 463". The engraving shows him at a writing table.
- The card shows the layman at his desk, with the Lateran and the Aurelian walls behind him.
- **Against `lucian_antioch`, `pamphilus` and `leonides`** (the bearded scholars), `robert_bellarmine` (long, rectangular, old) and the Doctors (`augustine`, `jerome`): Prosper is clean-shaven and forty-five, with a sharp widow's peak, a long, thin aquiline nose, small close-set eyes, deep nose-to-mouth lines and a long, square-ended chin.

## St. William of Monte-Vergine (25 June)

- Wikipedia (`William.txt`, `WilliamIt.txt`): born at Vercelli in 1085, orphaned, a pilgrim to Compostela in an iron girdle, attacked by robbers on the way to Jerusalem, then a hermit on Monte Vergine (Monte Vergiliana) between Nola and Benevento, where he founded the monastery. He later founded Goleto, where he died on 25 June 1142. "The Miracle of the Wolf": the wolf that killed his donkey took its place, "often depicted", even at Montevergine. The earliest source is the thirteenth-century *Legenda*. Lead image: the marble statue at Montevergine, with a long beard and a crozier.
- Bernardino Zenale's panel (`c-Guglielmo-Zenale.jpg`, crop `crop-William.jpg`): white habit, crozier, a heavy dark beard, heavy brows, eyes lowered.
- The book: an orphan of Piedmont who left at fifteen, the pilgrimage to St. James, the desert mountain, the congregation founded in 1119, his death on 25 June 1142. The engraving shows a young man kneeling in prayer before a cross with an old hermit.
- **The book has him leave "at fifteen years of age"**; Wikipedia gives no age. The card shows him at about forty-five, as founder.
- **Against `john_fagondez`** (wide, angular, clean-shaven), `benedict` (white beard), `bruno` and the white-habited `romuald` (bald, white beard): William is black-bearded, broad and flat across the cheekbones, with a short, square forehead and a broad, flat-nostrilled nose. His white habit is like Romuald's; the wolf and the black beard tell them apart.

## St. Ladislas (27 June)

- Wikipedia (`Ladislaus.txt`, `LaszloHu.txt`): 1040–1095, King of Hungary from 1077, the victories over Pechenegs and Cumans, the conquest of Croatia, canonized in 1192. He is "often depicted as a mature, bearded man wearing a royal crown and holding a long sword or banner". The Győr herm (lead image, `crop-Ladislaus.jpg`) is fifteenth-century, and its face may follow Béla III. Hungarian Wikipedia: "erős, hatalmas termetű férfi … a többi ember közül vállal kimagaslott" (a strong, huge-bodied man who stood a shoulder above the others). The Illuminated Chronicle miniature (`LaszloHu.jpg`) shows him armoured with a battle-axe.
- The book: born 1041, forced to the throne in 1080, chaste, austere, liberal to the poor, merciful to enemies, died 30 July 1095 preparing for the Crusade. The engraving shows a young king walking in a church.
- **The book gives 1041 and 1080; Wikipedia gives 27 June 1040 and king from 1077.** The card shows no date.
- **Against `stephen_hungary`** (the other Hungarian king: a square, heavy-boned face, straight hair, a square-cut beard, the Holy Crown), `canutus` (diamond-shaped, red-gold), `gontran` (round, jowly), `louis_france` (long, narrow, clean-shaven) and `wenceslaus`: Ladislas is long and hexagonal, with a straight nose in one line from the brow, large wide-open eyes, a drooping moustache, a forked, curled beard and rolled locks, a lily crown and a battle-axe. The prompt gives him a lily crown so that he is not confused with Stephen's Holy Crown.

## St. Gal (1 July)

- French Wikipedia (`GalFr.txt`): born at Clermont about 505, son of Georgius and Leocadia, a monk of Cournon, bishop in 525, died 14 May 551, the paternal uncle of Gregory of Tours; kept on 14 May in the West and on 1 July in the East. The page has no image, and none of him was found on Commons.
- The book: born about 489, a monk at Cournon, bishop in 527, struck on the head without anger, forgiving Evodius, died about 553. The engraving shows a young man kneeling before a monk in a doorway.
- **The book's dates (489, 527, 553) differ from French Wikipedia's (505, 525, 551)**, and the book keeps him on 1 July, not 14 May. The card follows the book's day and shows no year.
- **Against `hugh_grenoble`** (apple-round, bald, clean-shaven, a long upper lip), `claude_besancon` (short, wide, clean-shaven, a snub nose), `albinus_angers` (pear-shaped, jowly) and `nicholas`: Gal is round and soft-featured, with a short, small, straight nose, round, wide-set eyes under thin, high, lifted brows, a small mouth and a short, rounded white beard.

## St. Heliodorus (3 July)

- Wikipedia (`Heliodorus.txt`, `HeliodorusIt.txt`): born in Dalmatia, a disciple of Valerianus of Aquileia among the ascetics there with Chromatius, Jerome's companion to the East, first Bishop of Altino, present at the Council of Aquileia (381), died about 410. His relics are at Torcello. Lead images: his altar at Torcello and the Baroque statue at Murano (`c-Heliodorus-Murano.jpg`), a mitred, bearded bishop.
- The book: Jerome's countryman and disciple, who stayed "in the world, though not of it", went to the East with Jerome and returned for his parents, received Jerome's letter urging him to leave the world, and was made Bishop of Altino. **The book says he "died about the year 290", a slip for about 410** (Wikipedia). The engraving shows a monk on a rocky shore. The card shows no date.
- **Against `jerome`, `ambrose` and `augustine`**, and the lean clerics (`peter_damian`, `josaphat`, `pamphilus`): Heliodorus is lantern-jawed, with low cheekbones, hollow cheeks, a long, heavy jaw ending in a broad, jutting chin, a flat-tipped nose, heavy-lidded deep-set eyes and a close-trimmed grey beard that follows the jaw.

## St. Bertha (4 July)

- Wikipedia (`Bertha.txt`, `BerthaFr.txt`): mid-seventh century – 4 July 725, daughter of Count Rigobert, her mother "the daughter of the King of Kent". She married Siegfried, was widowed in 672 with five daughters, founded Blangy in Artois about 682–685, left Deotila abbess, and ended her life as a recluse. "The whole story of Bertha, as her biographers agree, is of a very late date but not entirely legendary." French Wikipedia's lead image is a devotional print of her kneeling in a black habit (`BerthaFr.jpg`).
- The book: the same outline, adding the three churches (St. Omer, St. Vaast, St. Martin), Roger's slander before Thierry III, and her death about 725. The engraving shows a nun kneeling at a lectern.
- The card shows the abbess with a model church, in the valley of the Ternoise.
- **Against `hildegard` and `scholastica`** (the Benedictine abbesses), `etheldreda` (pear-shaped, classical profile), `catharine_sweden` (heart-shaped), `bathildes` (round) and `juliana_falconieri` (inverted egg): Bertha is broad and square, with a strong jaw, a short, broad-bridged nose, wide-set grey eyes under straight, low brows and a wide, resolute mouth.

## Bl. Peter of Luxemburg (5 July)

- Wikipedia (`PeterLux.txt`, `PeterLuxFr.txt`): born 20 July 1369 at Ligny-en-Barrois, orphaned at four, a hostage in London in 1381, named Bishop of Metz in 1384 by the Avignon claimant, entering the city barefoot on a mule, and made cardinal of San Giorgio in Velabro. He died on 2 July 1387 at Villeneuve-lès-Avignon from his austerities, was named patron of Avignon in 1432, and was beatified in 1527. Lead image: the Avignon School panel of his vision (`c-PeterLux-Avignon.jpg`, crop `crop-PeterLux.jpg`), young, pale, beardless, tonsured, in a red cappa at a prie-dieu.
- The book: the hostage at twelve, Bishop of Metz at fifteen, the revenues in three parts, "I shall always be an unprofitable servant, but I can at least obey", the scourging at his death, the raising of the child in 1432, and his death at eighteen. The engraving shows a young cleric kneeling before a seated prelate.
- **The book has him "born in Lorraine" and makes the child's fall and raising in 1432 the reason for the patronage; Wikipedia gives Ligny-sur-Ornain and says Avignon named him patron in 1432.** These agree in substance.
- **Against `aloysius_gonzaga`** (round-faced youth in a surplice), `casimir` (long, narrow face with a drooping nose tip, shoulder-length hair), `charles_borromeo` and `robert_bellarmine` (cardinals in scarlet), `stanislaus`: Peter is triangular, with a broad, rounded forehead over a small, pointed chin, hollow cheeks, large, round, slightly prominent eyes and a round bowl haircut with a tonsure. He wears a cappa and a flat red hat hanging behind him, not a biretta.

## St. Goar (6 July)

- Wikipedia (`Goar.txt`, `GoarDe.txt`): a priest of Aquitaine who became a hermit near Oberwesel in the diocese of Trier. He was accused before Bishop Rusticus and vindicated, hung his cloak on a sunbeam, refused a see, and died there. He is patron of innkeepers, potters and vine growers, "depicted … as holding a pitcher", and the town of Sankt Goar grew round his cell. English Wikipedia dates him c. 585–649 and German Wikipedia c. 495–575. Wandalbert of Prüm's Vita (839) is "semi-legendary". The lead images are a Nuremberg Chronicle woodcut and the window of the collegiate church at St. Goar (`c-Goar-window.jpg`: clean-shaven and tonsured, with a church model).
- The book: of an illustrious family of Aquitaine, a hermit near Trier, "the oracle and miracle of the whole country", called by Sigebert to be Bishop of Metz (English Wikipedia says Trier), who died in 575. The engraving shows a hermit at his cell by a rustic fence.
- The card shows the pitcher and the cloak on the sunbeam in the Rhine gorge. The sunbeam is from his legend, told in Wikipedia; the book doesn't tell it.
- **Against `medard` and `macarius_alexandria`** (smiling old men), `francis_paola`, `avitus` and `anthony_padua`: Goar is clean-shaven, egg-shaped (broadest at the crown), with a high, bossed forehead, a short, blunt nose, a long, deep upper lip, a wide, generous smile and a round, slightly prominent chin.

## St. Palladius (6 July)

- Wikipedia (`Palladius.txt`): a deacon, perhaps of Rome or of Germanus of Auxerre, from a noble Gallo-Roman family. Prosper's Chronicle says he urged Celestine to send Germanus to Britain in 429 and was sent in 431 as "first bishop to the Scotti believing in Christ". He landed at Arklow and is associated with Leinster and Clonard; Muirchu has him leave for North Britain, and Scottish tradition places his grave at Fordoun/Auchenblae in the Mearns. The page has no image; the Commons search found only churches (`c-Palladius-Fordoun.jpg`).
- The book: a Roman, deacon of the Church of Rome, sent in 431, banished by the King of Leinster, preaching in North Britain, the first bishop and apostle of the Scots, died at Fordun about 450. The chapter has no engraving.
- **Against `patrick`** (a mitred, white-bearded bishop in green, with the shamrock), `boniface` (a broad, flat-planed Anglo-Saxon), `columba` and `columban`: Palladius is a Roman with an olive complexion, a trapezoid face broadest at the angular jaw, a short nose, very dark round deep-set eyes under a heavy brow, short black curly hair greying, a short, close beard, and no mitre.

## St. Pantænus (7 July)

- Wikipedia (`Pantaenus.txt`): a Sicilian, a Stoic philosopher converted to Christianity, head of the Catechetical School of Alexandria from about 180, "the Sicilian bee" to his pupil Clement; Eusebius sends him to India, where he found Matthew's Gospel "in Hebrew letters" left by Bartholomew. He died about 200. Lead image: Michael Burghers's engraving (`Pantaenus.jpg`), an old man in a philosopher's cloak with a long beard. Winckler's etching (`c-Pantaenus-Winckler.jpg`) shows him teaching.
- The book: a Sicilian Stoic won by the Christians' innocence, head of the school before 179, missionary to the Indies, bringing back St. Matthew's Gospel, teaching till about 216. The engraving shows him at a table with his disciples.
- **The book has him live till "about the year 216"; Wikipedia gives about 200.** The card shows no date.
- **Against `justin`** (the other philosopher: large, broad, oblong, a Roman nose with a hump, a square-cut beard), `jerome` (old, long white beard), `apollonius`, `leonides` and the white-bearded elders: Pantænus has a short, wide, snub-nosed philosopher's head, with a domed bald forehead, round, slightly bulging, twinkling eyes and a long, wavy white beard. The snub nose and the bulging eyes are what set him apart. Reject a long, narrow ascetic face.

## Look-alike risks that remain

- **Ladislas against `stephen_hungary`**: both Hungarian kings, crowned and bearded. Check the long, hexagonal face, the forked, curled beard, the rolled locks, the lily crown and the axe. Reject a square face, a square-cut beard or the Holy Crown with its bent cross.
- **Peter against `casimir` and `aloysius_gonzaga`**: pale, devout, beardless youths. Peter is triangular with a pointed chin, large, prominent eyes and a bowl cut with a tonsure. Reject shoulder-length hair or a round, full-cheeked boy.
- **Pantænus against `jerome` and the stock white-bearded elder**: reject a long, narrow face or an aquiline nose; he is short-faced and snub-nosed, with bulging, twinkling eyes.
- **William against `romuald`** (both in white habits): William's beard is black and blunt, his hair is dark round the tonsure, and the wolf is with him. Reject a bald dome or a white beard.
- **Gal against `hugh_grenoble` and `claude_besancon`**: round old clerics. Gal is bearded, with lifted brows. Reject clean-shaven, a long upper lip or a snub nose.
- **Palladius against `patrick`**: reject a white beard, a mitre or green vestments.
- **Goar against `medard`** (both laughing or smiling): Goar is clean-shaven, with a full head of grey-brown hair round the tonsure and a bossed forehead. Reject a bald dome or a beard.
- **Bertha against `hildegard` and `scholastica`**: a black habit and wimple. Bertha is broad and square-jawed. Reject a long, narrow noble face.

## Doubts

- **Peter of Luxemburg's title.** The card uses his current title, "Bl." / "Beato", although the book and the catalog line say "St.". If the book's "St." should stand, or if a Blessed shouldn't be carded under this rule, change the name (the letter stays P). Wikipedia also notes that his see and his red hat came from the Avignon obedience in the Schism. His cult was confirmed and is not suppressed, so the line is kept.
- **Bertha's story** is "of a very late date but not entirely legendary" (Wikipedia). It is neither suppressed nor discredited, so the line is kept. If a late Life counts as a "discredited story", it would be skipped and the Seven Brothers (10 July) would come in.
- **Prosper and William share one lifeChapter**, a chapter that tells both lives and has no Reflection. It follows batch 27's `cletus` / `marcellinus_pope`, and the app only uses the chapter to open the life and to hide the plain index entry for 25 June.
