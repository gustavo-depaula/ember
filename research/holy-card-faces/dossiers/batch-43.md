# Batch 43 — St. Vitus (15 June)

One card, `vitus`: the Pictorial Lives line of 15 June that batch 30 skipped ("Sts. Vitus, Crescentia, and Modestus, Martyrs"; see `batch-30.md`, "Skipped"). The decision in `../to-assess.md` is a card of St. Vitus alone, with his chapter but no reflection. Research only: no image yet.

The card data is in `../batches/batch-43.json`, written by `../consult/batch-43/build.py`. The script checks:

- the excerpt is verbatim in both languages in `content/of/formularies/common/martyrs/mart6.json` (the two pt-BR lines joined), and is not in the chapter;
- the chapter exists in en-US and pt-BR and is the index's chapter for 06-15;
- the only sanctoral formulary whose title names Vitus is `sanctorale.06-15.german-speaking`, with a German collect only;
- "In Lucánia, sancti Viti, mártyris." is in the saved Martyrology of 2004, with no Crescentia near it;
- the catalogMatch hits one unticked line that no other batch claims; no id, image, card file or chapter collides;
- the refs are original cards, and the initial.

Consulted material is in `../consult/batch-43/`:

- the texts: Stracke's iconography page and his Golden Legend chapter (`ci-vitus.*`, `gl-vitus.*`), the Catholic Encyclopedia (`cathen-vitus.*`), Wikipedia en and de (`Vitus.txt`, `VitusDe.txt`), the Ökumenisches Heiligenlexikon (`hl-vitus.*`), the Roman Martyrology of 2004 (`martyrologium-2004.pdf`, `.txt`), the river Sele and the Portuguese name of the Holy Helpers (`Sele.txt`, `HelpersPt.txt`);
- the pictures (`commons-files.txt` and `commons-meta.txt` list them; sheets `commons-sheet.jpg`, `faces-crop.jpg`): Master Theodoric's panel, the Očko votive painting, the Master of Meßkirch's panel, a Swiss master's altar wing, the Flein predella, the Salzburg statue in the cauldron, Spranger's Wenceslas and Vitus, Bergant's Vitus in the cauldron, the window of St. Veit an der Gölsen (1891), Cahier's plate of 1867, and the book's engraving;
- every face line of the batch files and card files (`faces-all.txt`), and the boys and youths among them (`boys.py`);
- for the halo question of `batch-54.md`: `cathen-nimbus.*`, `encyclopedia-halo.*`, `Halo.txt`, `holyart-halo.*`, `VeronicaMilan.txt`, `Azevedo2.txt`, and the sheet `blessed-cards-sheet.jpg`.

`fetch.sh`, `get.sh`, `commons.py`, `meta.py`, `totext.py` and `sheet.py` are the tools; `sheet.py` needs `/usr/bin/python3` (PIL).

**Name, date, initial.** "St. Vitus" / "São Vito", 15 June, initial V. The Roman Martyrology of 2004 has, on 15 June, no. 3: "In Lucánia, sancti Viti, mártyris." Modestus and Crescentia are not in it. The catalog line now reads "15 Jun · St. Vitus, Martyr · *São Vito, Mártir*", with a note of the book's title.

**Patron line.** "Martyr, one of the Fourteen Holy Helpers" / "Mártir, um dos Catorze Santos Auxiliares". Wikipedia and the Heiligenlexikon count him among the Fourteen Holy Helpers; Portuguese Wikipedia's article is "Catorze santos auxiliares". His patronages are many (dancers and actors, those with chorea or epilepsy, against lightning and the bites of animals), so the line names none.

**lifeChapter.** `jun-15-sts-vitus-crescentia-and-modestus`, in both languages. It is the book's chapter of the three, and tells the legend of the nurse and her husband as fact.

**The reflection is left off by `"reflection": false`.** `scripts/build-corpus.py` copies the `**Reflection**` paragraph of a card's `lifeChapter` into the card unless the card says so; this chapter's reflection is about Crescentia, whom the card leaves out. `accept-batch.py` carries the field from the batch file to the card.

**proper.** None. `sanctorale.06-15.german-speaking` ("Hl. Vitus (Veit), Märtyrer") is his, but has a German collect only; by the rule of batches 30 and 40 it is not set as `proper`. The other 15 June formulary is María Micaela (Spain).

**Excerpt.** The Entrance Antiphon of the Common of Martyrs, outside Easter Time, for one martyr (`common.martyrs.mart6`, Wis 10:12): "The Lord granted him a stern struggle, that he might know that wisdom is mightier than all else." / "Um duro combate o Senhor deu-lhe enfrentar para que aprendesse a vencer, pois a sabedoria é em tudo a mais poderosa." Verbatim; the pt-BR is two lines in the Missal, joined. No card or batch uses it yet (`pancras` and `josaphat` have the same formulary's Communion Antiphon). 15 June is never in Easter Time. The alternative is his own collect in the German-speaking proper, "mit deiner Kraft hat der heilige Vitus in jugendlichem Alter die Qualen des Martyriums bestanden", which would need our own en-US and pt-BR renderings.

## St. Vitus (15 June)

- Wikipedia (`Vitus.txt`, from the Catholic Encyclopedia and Delehaye): a historical martyr, in the Martyrologium Hieronymianum ("In Sicilia, Viti, Modesti et Crescentiae", and a Vitus "In Lucania" on the same day); the narrative of the sixth or seventh century is "purely legendary", making him "a 7-year-old son of a senator of Lucania (some versions make him 12 years old)". One of the Fourteen Holy Helpers. "He is represented as a young man with a palm-leaf, in a cauldron, sometimes with a raven and a lion", because the legend throws him into "a cauldron of boiling tar and molten lead" from which he came out unharmed.
- Stracke (`ci-vitus.txt`): "St. Vitus is customarily pictured as a youth with curly blond hair"; in some images he holds a cross; at San Vito lo Capo his attribute is a dog or two. The Golden Legend "aged the boy to 12 years old"; Caxton's text opens "S. Vitus was a child much noble that suffered martyrdom in the age of twelve years" (`gl-vitus.txt`).
- Heiligenlexikon (`hl-vitus.txt`): "Attribute: im Ölkessel, Adler, Rabe, Hahn, Hermelin, Wolf, Löwe, Hund an der Leine"; "Veit wird dargestellt mit einem Hahn".
- The pictures. Master Theodoric (Karlštejn, 14th century): a princely youth with a palm, a long, full face broad at the jaw, a long nose, a very small mouth, large eyes, and thick golden-brown curls to the shoulders. The Očko votive painting (about 1370): a fair youth with a palm and smooth golden hair. The Master of Meßkirch (1535–40, inscribed with his name): a curly blond youth in red with a palm, carrying a three-legged cauldron by its handle. The Swiss master's wing: a youth holding a small cauldron and a palm. The Salzburg statue, the Flein predella, Bergant and the Gölsen window: the boy praying in the cauldron, the statue's hair in tight ringlets. Cahier's plate (1867): a boy of about ten in a short tunic with a palm, a cock at his feet. The book's engraving: the three in a boat.
- The card follows them: a boy of about twelve (the Golden Legend's age, between the legend's seven and the "young man" of the pictures), fair, with bright blond ringlets, in a white tunic with a noble boy's purple stripes (the book: "a child nobly born") and a martyr's red mantle, with the palm, a small empty cauldron carried as an attribute as the Master of Meßkirch and the Swiss master have it, and the cock. No fire and no torment are shown, and no lion, raven or dog, to keep the card clear. Modestus and Crescentia are not shown.
- The background is Lucania, where the Martyrology places him. The older Martyrology named the river ("At the River Silar in Lucania", quoted by Stracke); the Silarus is the Sele, whose mouth is on the Tyrrhenian Sea near Paestum (`Sele.txt`). The Doric temple far off stands for Paestum.
- The face's bone structure is taken from Theodoric's panel, idealised: long, fullest below, with a broad, soft jaw, a long nose, a very small mouth. The blue eyes are our choice to go with the fair hair.
- **Against the boys and youths of the set** (`boys.py`): `pancras` (fourteen, round, dark-brown tight curls, green cloak, a book), `cyril_caesarea` (twelve, square and flat-planed, dark curls, brows nearly meeting), `agapetus` (fifteen, heart-shaped, straight light-brown hair, toga praetexta and bulla), `venantius_camerino` (fifteen, wide and flat, straight black hair, red cloak, a spring), `benezet` (fifteen, narrow and bony, freckled, straw hair), `carlo_acutis`, `stanislas_kostka`, and the Christ Child of `finding_temple` (twelve, softly round, brown eyes, soft golden-brown curls, a plain gold halo). Vitus is the only one with a long face fullest at the jaw, blue eyes and bright blond ringlets, and the only one with a cauldron and a cock.

## Doubts

- **The excerpt is from the Common**, not his own. His German collect is the alternative, in our renderings.
- **The age.** The oldest legend says seven, the Golden Legend twelve, and the pictures show anything from a child to a young man. The card says about twelve.
- **The cauldron** is held as an attribute, not shown as the torment. If it reads oddly at card size, the palm and the cock alone are enough.
- **The patron line** names the Holy Helpers and no patronage. "Patron of dancers and actors" is the alternative.

## Look-alike risks that remain

- **Against the Christ Child of `finding_temple`**: reject a round face, brown eyes, soft golden-brown curls or a plain gold disc; Vitus is long-faced and full-jawed, blue-eyed, with tight bright-blond ringlets and the set's dotted-ring halo.
- **Against `pancras` and `venantius_camerino`** (boys with a palm in a tunic and cloak): reject dark hair, a book or a spring; the cauldron and the cock must be there.
- **Against a girl martyr** (`agnes` is a reference card, and the ringlets are long): reject a girlish face or dress; he is a boy in a knee-length tunic.
