# Batch 36 — the Pictorial Lives, 15 September to 5 October

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 35: `catherine_genoa`, `lambert`, `thomas_villanova`, `eustachius`, `theban_legion`, `firmin`, `finbarr`, `remigius`, `gerard_brogne`, `placid`. **Two lines are skipped: St. Thecla (23 Sep) and Sts. Cyprian and Justina (26 Sep)**, so the batch runs to St. Placid (5 Oct); see below. The 15 June (Vitus, Crescentia and Modestus) and 3 September (Seraphia) lines are still left alone. The book's other chapters here are carded already: the Exaltation of the Cross (14 Sep) `exaltation_cross`, Cornelius and Cyprian (16) `cornelius_cyprian`, Januarius (19) `januarius`, Matthew (21) `matthew`, Our Lady of Mercy (24) `our_lady_mercy`, Cosmas and Damian (27) `cosmas_damian`, Wenceslas (28) `wenceslaus`, Michael (29) `michael_archangel`, Jerome (30) `jerome`, the Guardian Angels (2 Oct) `guardian_angels`, Francis of Assisi (4) `francis_assisi`. The next unclaimed line is St. Mark, Pope (7 Oct), for batch 37.

The card data is in `../batches/batch-36.json`. `../consult/batch-36/build.py` writes it from `cards.py` (copied from batch 35's, every output path changed to batch 36 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day;
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but the 25 September chapter (Firmin and Finbarr), in both languages; both cards' excerptSource say it has none;
- that the one chapter shared inside the batch (`sep-25-firmin`) is shared only by Firmin and Finbarr;
- that `theban_legion`'s `proper` exists and has en-US collect text; that every sanctoral formulary whose title names one of the ten is listed, and that any with en-US or pt-BR collect text is the card's `proper` or a named namesake; it lists the formularies on every card's date and on the Martyrology's other days for them (8 Sep, 13 Jan) and the national days (10 Oct Spain, 15 Jan France);
- that every word of each pt-BR name appears in the chapter title;
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides and that no other card uses the chapter; initials and refs.

Consulted material is in `../consult/batch-36/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`, crops `crops.jpg`): Catherine of Genoa (en; it: Ratti's painting), Lambert (the Palude diptych), Thomas of Villanova (en: engraving; es: portrait), Eustace (Cretan icon), Theban Legion, Maurice, Thecla, Fermin (en; fr: the Amiens portal statue), Finbar of Cork (Harry Clarke's window), Cyprian and Justina, Remigius (the Master of Saint Giles's Baptism of Clovis), Gérard of Brogne (en, fr), Placidus (Perugino's panel);
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`, including 8 Sep for Thomas); the lists mark each Martyrology entry with a "Presente nel Martirologio Romano" icon;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- existing cards compared against (`existing-sheet.jpg`: Catherine of Siena, Monica, Augustine, Sebastian, George, Patrick, Boniface, Thomas Becket, Denis, Aloysius Gonzaga, Benedict, Stanislaus). Cards of batches 18–35 are compared through their face lines;
- every face line of batches 1–35 and 52–54 (`faces-all.txt`, regenerated for this batch).

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets.

**Skipped lines.**
- **St. Thecla (23 Sep).** Her whole story is the apocryphal Acts of Paul and Thecla, whose author, Tertullian says, was a presbyter of Asia removed from office for writing it (`Thecla.txt`, `sb-Tecla.txt`); Kirsch (quoted by Wikipedia) calls the story "purely legendary". Her feast left the calendar in 1969 "for lack of historic evidence". **No current-Martyrology entry for her was found**: her Santi e Beati page has no "Martirologio Romano" paragraph, and on the 23 September list her entry has no Martyrology icon, while the entries around it do. As for Seraphia, that absence is inferred from Santi e Beati, not read in the 2004 Martyrology.
- **Sts. Cyprian and Justina (26 Sep).** Wikipedia (`Cyprian.txt`): deleted from the calendar in 1969 "because of the lack of historical evidence of their existence", and "their names were also removed from the 2001 revision of the Roman Martyrology". Santi e Beati agrees in substance (Amore: Cyprian of Antioch probably never existed; the story is a fourth-century legend of the magician and the virgin), and its page and list carry no Martyrology entry for them. The cult is suppressed, so the line is skipped.

**Dates, names, initials.** Feasts follow the book (index days 09-15, 09-17, 09-18, 09-20, 09-22, 09-25 twice, 10-01, 10-03, 10-05). Names are the book's, with its pt-BR forms (Santa Catarina de Gênova, São Lamberto, São Tomás de Vilanova, Santo Eustáquio, A Legião Tebana, São Firmino, São Finbarr, São Remígio, São Gerardo, São Plácido). Titles after the name are dropped ("Bishop", "Martyr", "Abbot"). Ids add a place where the name is common: `gerard_brogne` (the card's name stays the book's "St. Gerard"). Initials: C, L, T, E, T (The Theban Legion, skipping "The"), F, F, R, G, P.

**Titles.** None changes: all ten were "St." in the book and are "san/santo/santa" in the Martyrology (`sb-*.txt`). Catherine was canonized in 1737 and Thomas in 1658 (Wikipedia); the other eight are of the first millennium. No saint here died after 1930.

**Two names differ from the catalog line:**
- **Eustachius**: the line is "Sts. Eustachius and Companions, Martyrs"; the card is "St. Eustachius" / "Santo Eustáquio" and shows him alone. The current Martyrology keeps him alone ("commemorazione di sant'Eustachio martire, il cui nome è venerato in un'antica diaconia dell'Urbe", `sb-Eustachio.txt`); his wife and sons (Theopistis, Agapius, Theopistus) have a Santi e Beati page (`sb-09-20.html`, "Santi Teopista ed Agapio") with no Martyrology entry. See Doubts.
- **Placid**: the line is "St. Placid, Martyr"; the card is "St. Placid", patron line "Disciple of St. Benedict". See below.

**lifeChapter and reflection.** All ten cards have their chapter as lifeChapter. Eight get the chapter's own `**Reflection**` paragraph, each about the card's saint or feast. **Firmin and Finbarr share `sep-25-firmin`**, which tells the two lives one after the other and has no Reflection, so neither card has a reflection; there is no fallback. This follows batch 31 (`prosper_aquitaine`, `william_montevergine`) and batch 27 (`cletus`, `marcellinus_pope`).

**proper.** One card: **`theban_legion` → `sanctorale.09-22.africa`**, "Saint Maurice and Companions, Martyrs", an optional memorial of the African calendar with an en-US collect ("Father, we celebrate the memory of Saint Maurice and his companions…"). Its title names Maurice and his companions, which is the Theban Legion of the book and of the Martyrology, so the tie is by the formulary's own title, not inferred from the date alone; it is a regional formulary, not the General Calendar. The other title hits have no en-US or pt-BR text: `sanctorale.09-22.german-speaking` (Mauritius, de), `sanctorale.09-18.german-speaking` (Lambert, de), `sanctorale.10-10.spain` (Tomás de Villanueva, es), `sanctorale.01-15.france` (Remi, fr). Namesakes: `sanctorale.04-29` (Catherine of Siena) and `sanctorale.11-25` (Catherine of Alexandria). The formularies on the ten dates belong to other saints or feasts (09-15 Our Lady of Sorrows, 09-17 Robert Bellarmine, 09-20 the Korean Martyrs, 09-25 German-speaking Nicholas of Flüe, 10-01 Thérèse of Lisieux and Our Lady Queen of Nigeria, plus an empty African placeholder `sanctorale.10-01.africa` with no collect, 10-03 Brazil's André de Soveral and Spain's Francis Borgia, 10-05 Faustina Kowalska, Brazil's Benedict the Moor and Spain's Ember days); on the Martyrology's other days: 09-08 the Nativity of Our Lady, 01-13 Hilary.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Catherine, Lambert, Thomas (his saying), Eustachius, Remigius, Gerard (with its quotation of 1 John 2:17), Placid;
  - first two sentences: the Theban Legion ("Thank God for every slight and injury you have to bear. An injury borne in meekness and silence is a true victory.").
- From the chapter, where the card has no Reflection of its own:
  - **Firmin**: the second sentence of his paragraph ("He preached the Faith in the countries of Agen, Anjou, and Beauvais, and being arrived at Amiens, there chose his residence…");
  - **Finbarr**: the first sentence of his paragraph ("St. Finbarr, who lived in the sixth century, was a native of Connaught, and instituted a monastery or school at Lough Eire…").

## St. Catherine of Genoa (15 September)

- Wikipedia (`Catherine.txt`): Caterina Fieschi Adorno, 1447 – 15 September 1510, married at sixteen to Giuliano Adorno, converted in 1473, served the sick of the Pammatone hospital, wrote (or inspired) the *Treatise on Purgatory*; beatified 1675, canonized 1737; Pius XII declared her patroness of hospitals in Italy. Martyrology (`sb-Caterina.txt`): "A Genova, santa Caterina Fieschi, vedova, insigne per il disprezzo del mondo… e la carità verso i bisognosi e gli infermi."
- The book: the same; the hospital, the husband's conversion, the Holy Souls, death on 14 September 1510. The engraving shows her bringing a bowl to a sick man in a hospital ward.
- The card: the veiled widow with a bowl of broth, the Pammatone ward and Genoa's harbour behind; no purgatory. Patron line from Wikipedia.
- Face: Ratti's painting (`CatherineIt.jpg`) gives a long face and long nose under a veil. **Against `catherine_siena`** (young, oval), `colette` (small, short-nosed), `catherine_ricci` (moon-faced) and `jane_frances_chantal` (broad, square): Catherine is fifty-five, diamond-shaped, with high cheekbones, a long aquiline nose and a narrow pointed chin.

## St. Lambert (17 September)

- Wikipedia (`Lambert.txt`): c. 636 – c. 705, bishop of Maastricht from about 670 after the murder of Theodard, exiled to Stavelot under Ebroin for seven years, restored by Pepin, killed at Liège; his early biographers call him "a prudent young man of pleasing looks… well-built, strong, a good fighter". Martyrology (`sb-Lamberto.txt`): "A Liegi… passione di san Lamberto, vescovo di Maastricht e martire, che, mandato in esilio, si ritirò nel monastero di Stavelot…".
- The book: the same, with the winter night at Stavelot, praying barefoot at the cross; killed on 17 September **709**. **The book's year (709) differs from Wikipedia's (about 705)**; the card shows none.
- The card: the bishop in a red chasuble with palm and crosier; behind him the snowy abbey of Stavelot and its stone cross, the book's story and engraving. No spear.
- **Against `boniface`** (broad, flat-planed, snub nose), `denis` (short, square, curly beard), `david_wales` (white, heavy brow ridge) and `gregory_langres` (lantern jaw): Lambert has a long, parallel-sided rectangular face, a broad-tipped nose and a short, dense, dark-grey beard.

## St. Thomas of Villanova (18 September)

- Wikipedia (`Thomas.txt`, `ThomasEs.txt`): Tomás García y Martínez, 1488 – 8 September 1555, a miller's son of Villanueva de los Infantes, professor at Alcalá, Augustinian friar at Salamanca, court preacher to Charles V, Archbishop of Valencia from 1545; canonized 1658. Martyrology (`sb-Tommaso.txt`), on 8 September: "A Valencia in Spagna, san Tommaso da Villanova, vescovo: eremita sotto la regola di sant'Agostino… per un amore per i poveri così ardente…".
- The book: the same, the alms, the orphans and foundlings, death on the Nativity of Our Lady 1555.
- Face after the Spanish portraits (`Thomas.jpg`, `ThomasEs.jpg`, crops in `crops.jpg`): clean-shaven, a long soft-oval face, a long nose, heavy lids, eyes lowered.
- The card: the Augustinian habit under a plain cope and low mitre, a purse and a coin for a poor boy, the Micalet of Valencia behind.
- **Against `john_fagondez`** (the other Castilian Augustinian: wide, angular, broad jaw) and `thomas_becket` (lean, narrow, fine nose): Thomas is soft and long-oval with heavy, drooping lids and a fleshy nose tip.

## St. Eustachius (20 September)

- Wikipedia (`Eustace.txt`): the legend of Placidus, the stag with the cross between its antlers, the loss and recovery of his family, the brazen bull; "the historicity of Eustace cannot be substantiated, and he is widely seen as a 'fictitious saint'"; removed from the General Calendar in 1970 "because of the completely fabulous character of the saint's Acta", "though he continued to be commemorated in the latest edition of the Roman Martyrology". Martyrology (`sb-Eustachio.txt`): "A Roma, commemorazione di sant'Eustachio martire, il cui nome è venerato in un'antica diaconia dell'Urbe." Emblems: stag with a cross between its antlers, soldier's or knight's dress.
- The book: the legend as above, under Trajan.
- The card: the Roman officer at the moment of the vision, the white stag with a small radiant crucifix between its antlers in a forest clearing; no family, no lions, no brazen bull. The tiny figure on the crucifix follows the Christ line of `recurring-figures.md` but is too small for features.
- **Kept, not skipped**: the Acts are legendary, but he is in the current Martyrology.
- **Against `george`** and `sebastian` (young, curly), `victor_marseilles` (sandy, cleft chin) and `laurence_justinian` (old, clean-shaven, hooked nose): Eustachius is a bearded, hawkish forty-five with a jutting chin.

## The Theban Legion (22 September)

- Wikipedia (`Theban.txt`, `Maurice.txt`): the legion from the Thebaid in Egypt, massacred at Agaunum (Saint-Maurice, Valais) under Maximian for refusing an order; the earliest account is Eucherius of Lyon's, about 150 years later; **some modern historians (Van Berchem, 1956; Woods) regard the account as a literary production**. Maurice has been shown as a dark-skinned African since the Magdeburg statue of about 1240, with European features before. Martyrology (`sb-Maurizio.txt`): "Nell'antica Agauno… santi martiri Maurizio, Esuperio, Candido, soldati, che, come riferisce sant'Eucherio di Lione, furono uccisi per Cristo sotto l'imperatore Massimiano…".
- The book: the refusal, the decimations, Maurice's speech ("we are your soldiers, but we are servants also of the true God"), the arms flung down. The engraving shows Maurice speaking among his officers.
- The card: Maurice with his sword reversed, Exuperius setting down his shield, Candidus with a palm, in the Rhône valley at Agaunum; no blood. Proper `sanctorale.09-22.africa` (see above).
- **Against `charles_lwanga`** (young, clean-shaven), `benedito` (round, broad) and the old Egyptians `paphnutius` and `macarius_alexandria`: Maurice is a bearded, long-oval forty in armour; his companions differ from him and from each other (square, hook-nosed and grizzled; young, triangular, beardless).

## St. Firmin (25 September)

- Wikipedia (`Firmin.txt`, `FirminFr.txt`): Fermin, by tradition a senator's son of Pamplona, taught by Honestus, consecrated by Honoratus of Toulouse, missionary in Gaul and bishop of Amiens, beheaded there; the earliest texts are of the ninth century; co-patron of Navarre. Martyrology (`sb-Firmino.txt`): "Ad Amiens… san Firmino, venerato come vescovo e martire."
- The book: the same, the date of the martyrdom "uncertain". The engraving shows him blessing kneeling converts outside a town.
- The card: the young missionary bishop blessing, the Somme marshes and the small Gallo-Roman town of Amiens behind, no cathedral.
- Face: the Amiens portal statue (`FirminFr.jpg`) is young and beardless. **Against `thomas_becket`** (fair, long, fine-nosed) and `symphorian` (young, blond): Firmin is an olive, black-haired Navarrese with a long straight nose, strongly arched brows and a jutting chin.

## St. Finbarr (25 September)

- Wikipedia (`Finbarr.txt`): Fionnbharra, c. 550 – 623, born near Bandon, renamed at his tonsure ("Is fionn barr Lócháin", "fair is the crest of Loan"), hermit at Gougane Barra, founder of a monastery and school on the marsh where Cork grew, bishop of Cork. Martyrology (`sb-Findbar.txt`): "A Cork nel Munster in Irlanda, san Finbar, vescovo." Santi e Beati warns that his tradition is tangled with those of Finnian of Movilla and Clonard.
- The book: a native of Connaught (**Wikipedia: born near Bandon, County Cork; his father from Galway**), the school at Lough Eire, the origin of Cork, bishop seventeen years, died at Cloyne.
- The card: the Irish monk-bishop with a crook crosier and a book satchel, teaching, before the marsh islands of the Lee.
- **Against the other Irishmen**: `columba` (broad, open, clean-shaven, white-haired), `columban` (big-boned, jutting chin, red-grey), `fiaker` (heart-shaped, dark beard): Finbarr has a long, narrow face with a soft chin, down-sloping pale-blue eyes and a pale, forked flaxen beard.

## St. Remigius (1 October)

- Wikipedia (`Remigius.txt`): c. 437 – 13 January 533, bishop of Reims young, baptized Clovis on 25 December 496 with about 3,000 Franks; 1 October was his feast in the 1960 calendar. Martyrology (`sb-Remigio.txt`), on 13 January: "A Reims… deposizione di san Remigio, vescovo: dopo che il re Clodoveo fu iniziato al sacro fonte battesimale… convertì i Franchi a Cristo e, dopo oltre sessant'anni di episcopato…". Emblems: crosier, flask of oil.
- The book: "unusually tall, his face impressed with blended majesty and serenity", archbishop at twenty-two, died 533 after 74 years of episcopate. The engraving shows the baptism of Clovis.
- The card: the tall bishop in white with a flask of chrism, early Reims behind on a Christmas morning; no Clovis and no dove (the Holy Ampulla story is not in the book).
- **Against `gregory_langres`** (lantern jaw), `medard` (square, laughing), `germanus_auxerre` (domed, square beard) and `germanus_paris` (clean-shaven, underbite): Remigius is long-necked and long-faced, symmetrical, with a medium, smooth silver beard.

## St. Gerard (3 October)

- Wikipedia (`Gerard.txt`, `GerardFr.txt`): c. 895 – 3 October 959, of the family of the dukes of Lower Lotharingia, at first a soldier, monk at Saint-Denis about 917, who brought a relic of St. Eugene to Brogne, founded Brogne Abbey and reformed eighteen others. Martyrology (`sb-Gerardo.txt`): "…san Gerardo, primo abate del monastero di Brogne da lui fondato, che si adoperò per il rinnovamento della disciplina monastica…". Santi e Beati notes that the *Vita Gerardi* (1074–75) is "often fantastic and at times frankly fraudulent"; the card uses only what the Martyrology and Wikipedia also say.
- The book: "an engaging sweetness of temper", Saint-Denis, Brogne in 931, the reforms, death in 959. **The book's "France" for Namur is its own; Namur is in present-day Belgium.**
- The card: the abbot in a black cowl with the reliquary of St. Eugene, Brogne in its valley behind.
- **Against `hugh_cluny`** (square-oval with a Greek nose), `gal_clermont` (round with a white beard) and `benedict_aniane` (lean, high square forehead): Gerard is short, wide and full-cheeked, clean-shaven, with an upturned nose and a dimpled smile.

## St. Placid (5 October)

- Wikipedia (`Placid.txt`): son of the patrician Tertullus, given to Benedict at Subiaco as a child; Gregory the Great (Dialogues II.7) tells how Maurus, sent by Benedict, ran on the lake and drew him out; the Messina martyrdom with his brothers and sister; relics found in 1588 and cult authorized by Sixtus V. Martyrology (`sb-Placido.txt`): "Commemorazione di san Placido, monaco, che fu sin dalla fanciullezza discepolo carissimo di san Benedetto." Santi e Beati: he was invoked as a confessor through the early Middle Ages and "transformed into a martyr at the end of the eleventh century" by a "false account of his Passion"; Wikipedia adds that medieval martyrologies confused him with a third-century Placidus.
- The book: tells both the monastic youth and the Messina martyrdom (with Eutychius, Victorinus, Flavia and thirty monks).
- **Kept, not skipped**: his cult as Benedict's disciple is in the current Martyrology and rests on Gregory's Dialogues; only the martyrdom is discredited. The card calls him "St. Placid", "Disciple of St. Benedict", and paints the young monk at the lake of Subiaco with no palm and no martyrdom. The chapter's Reflection (on adversity) stays as his reflection. See Doubts.
- Face after Perugino (`Placid.jpg`): young, tonsured, eyes lifted. **Against `pancras`** (round boy), `aloysius_gonzaga` (soft oval, cassock) and `nicholas_tolentino` (heart-shaped, older): Placid is long and narrow-oval with a slender high-bridged Roman nose and a delicate narrow chin.

## Look-alike risks that remain

- **Firmin against Eustachius and Placid**: three dark-haired, olive men with long noses. Reject a beard on Firmin or Placid, or a clean chin on Eustachius; Firmin is forty with arched brows and a jutting chin, Placid twenty and delicate, Eustachius bearded and hawkish.
- **Lambert against Remigius**: both bearded old bishops. Reject a long, flowing beard; Lambert's is short, dense and dark-grey on a parallel-sided face, Remigius's smooth, silver and medium on a long, slender one.
- **Thomas of Villanova against Firmin**: both clean-shaven and dark. Thomas is older, softer, with heavy drooping lids; reject a jutting chin on him.
- **Finbarr**: reject a dark beard (Harry Clarke's window); the pale, fair hair and forked flaxen beard are the mark.
- **Catherine of Genoa against `catherine_siena`**: reject youth or a round face.
- **The Theban Legion**: reject three similar soldiers; the three differ in age, skin and beard, and Maurice alone is dark-brown and in a red cloak.

## Doubts

- **Thecla skipped** (23 Sep): legendary Acts, feast removed in 1969, and no current-Martyrology entry found (inferred from Santi e Beati, not read in the 2004 Martyrology). If she should be kept, she would take Placid's place or be an eleventh line.
- **Cyprian and Justina skipped** (26 Sep): removed from the 2001 Martyrology (Wikipedia), story considered fictitious.
- **Eustachius kept with a legendary story**: Wikipedia calls him "widely seen as a 'fictitious saint'", but the Martyrology still commemorates him. The card drops "and Companions" and shows him alone, because only he is in the current Martyrology; the alternative is the line's name with his wife and two sons on the card.
- **Placid kept, but not as a martyr**: the line says "Martyr"; the Martyrology and Santi e Beati treat the martyrdom as a late forgery, and the card leaves it out. If the discredited martyrdom should count as the line resting on a discredited story, skip him and take St. Mark, Pope (7 Oct).
- **Theban Legion `proper`** is an African regional formulary (`sanctorale.09-22.africa`, en-US only), tied by its own title ("Saint Maurice and Companions, Martyrs"); the historicity of the massacre is disputed by some modern historians, while the Martyrology keeps it on Eucherius's word.
- **Maurice's skin**: the card follows the Magdeburg tradition (dark-brown, from about 1240); earlier art gave him European features. The legion came from the Thebaid, so an Upper Egyptian look fits either way.
- **Dates that differ from the Martyrology or Wikipedia**, the card following the book: Thomas (Martyrology 8 Sep), Remigius (13 Jan); the book's year of Lambert's death (709) differs from Wikipedia's (about 705), and Finbarr's birthplace (Connaught) from Wikipedia's (near Bandon). None is on a card.
- **Patron lines not from the book**: Catherine "Patroness of hospitals in Italy" (Wikipedia: Pius XII), Lambert "Bishop and martyr", Thomas "Archbishop of Valencia" (the book), Eustachius "Soldier and martyr", Theban Legion "St. Maurice and his soldiers, martyrs", Firmin "Bishop of Amiens, martyr" (the book), Finbarr "Patron of Cork" (Wikipedia), Remigius "Apostle of the Franks" (Wikipedia), Gerard "Abbot of Brogne", Placid "Disciple of St. Benedict" (the Martyrology).
- **Firmin's and Finbarr's excerpts** are narrative sentences of the chapter, not devotional lines, because the chapter has no Reflection.
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: Clovis, Benedict, Maurus and Theodard, who appear in these chapters, are left off; the tiny crucifix on Eustachius's card uses the existing Christ line.
