# Batch 25 — the Pictorial Lives, 31 March to 10 April

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 24: `benjamin`, `hugh_grenoble`, `richard_chichester`, `celestine_i`, `hegesippus`, `herman_joseph`, `perpetuus`, `mary_egypt`, `john_almoner`, `bademus`. No line in the stretch is skipped: none of the ten has a suppressed cult or rests on a discredited story. The book's other chapters here are carded elsewhere: Francis of Paula (2 Apr) is `francis_paola`, Isidore (4 Apr) is `isidore`, Vincent Ferrer (5 Apr) is `vincent_ferrer`.

The card data is in `../batches/batch-25.json`, written by `../consult/batch-25/build.py` (adapted from batch 24's). The script checks each excerpt verbatim in both languages against the card's chapter or its own Reflection; that each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is used by no other batch or existing card; which chapters have a `**Reflection**`/`**Reflexão**` paragraph (both languages agree); feasts against the index days; that each catalogMatch hits one unticked line no other batch claims; that no id collides; that each initial matches the name and each ref exists. It lists every OF formulary on the eight dates and every formulary whose title names one of the ten, with the languages of its collect. Consulted material is in the same folder: Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`), larger copies of the van Dyck, Zurbarán, San Giovanni Elemosinario and Perpetuus images (`big_*.jpg`), the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`), and the existing cards compared against (`existing-sheet.jpg`). `fetch.sh` is the fetcher; `list.txt`, `list2.txt` its inputs.

**Dates, names, initials.** Feasts follow the book (index days 03-31, 04-01, 04-03, 04-06, 04-07 twice, 04-08, 04-09 twice, 04-10). Names are the book's, with the pt-BR forms it uses (São Benjamim, Santo Hugo, São Hegésipo, Hermano José, São Perpétuo, Santa Maria Egipcíaca, São João, o Esmoler, São Bademo). Three names are tidied: "St. Hugh of Grenoble" / "Santo Hugo de Grenoble" (the catalog has Hugh of Cluny on 29 Apr), and the ids `celestine_i` (as `john_i`, `martin_i`) and `hugh_grenoble` keep them apart from later popes and Hughs. Initials: B, H, R, C, H, H, P, M, J, B.

**Herman Joseph: "Blessed" in the book, now "St."** The book (and the catalog line) call him "Blessed Herman Joseph of Steinfeld". He was never formally canonized, but Pius XII confirmed his cult as a saint on 11 August 1958 (English Wikipedia: "in 1958 his status as a saint of the Roman Catholic Church was formally recognized"; German Wikipedia: "offiziell wurde Hermann Joseph der Heiligenstatus am 11. August 1958 … zuerkannt"; local `Herman.txt`, `Herman_de.txt`). The card calls him "St. Herman Joseph of Steinfeld" / "São Hermano José de Steinfeld", keeping the book's pt-BR "Hermano José". The German-speaking OF proper also has him as "Hl. Hermann Josef" (see proper, below). The other nine were already "St." in the book.

**lifeChapter and reflection.** Each card has its own chapter in both languages. Two days have two chapters, and the index points at only one: on **04-07** the index's chapter is Hegesippus's, but its reflection is Herman Joseph's; on **04-09** the index's chapter is John the Almoner's, but its reflection is Mary of Egypt's. The cards take each saint's own chapter, so each gets its own Reflection. Nine chapters end with a `**Reflection**—` paragraph. **Hegesippus**'s has none, so his card carries no reflection (the index's 04-07 reflection belongs to Herman Joseph and is not borrowed).

**proper.** None of the ten gets one. On the dates, only 04-07 has a formulary, John Baptist de la Salle (another saint). By title, the one match is **"Hl. Hermann Josef, Ordenspriester, Mystiker" (`sanctoral/05-21/german-speaking.json`, id `sanctorale.05-21.german-speaking`)**: Herman Joseph's own formulary, but German only, so it cannot show on the card; the script fails if it ever gains en-US or pt-BR text. Perpetua and Felicity (03-07) match the pattern but are other saints. No formulary for Richard of Chichester exists in the repo.

**Excerpts.**
- From the saint's own Reflection: Hugh (the whole of it), Richard (second sentence), Celestine (the Gospel words it quotes), Herman Joseph (second sentence), Perpetuus (the first clause of its last sentence, closed with a full stop), Mary of Egypt (second sentence), John the Almoner (the whole of it, one question).
- **Benjamin**: the day's reflection is one long prayer to the martyrs with no self-contained clause, so the excerpt is from the chapter: "Benjamin, who was a minister of the Gospel, declared that he should miss no opportunity of announcing Christ."
- **Hegesippus** (no Reflection): "Down to his time no episcopal see or particular church had fallen into error", the close of the chapter's account of his history, capitalised.
- **Bademus**: the reflection's sentences are all long, so the excerpt is from the chapter: "He triumphed over his torments by the patience and joy with which he suffered them for Christ", without its opening "But" / "Mas".

## St. Benjamin (31 Mar)

- Wikipedia (`Benjamin.txt`): a deacon martyred about 424 under Varanes V; released through an ambassador of Theodosius II on condition he stop preaching, and refused; feast 13 October in the East, 31 March in the Roman Martyrology. Lead image: a modern icon of a young, curly-haired deacon with a book (`Benjamin.jpg`).
- The Painter's Manual (Hetherington, the holy deacons, local `../hermeneia-ocr.txt`): "Benjamin, a young man with an incipient beard. October 13th." The card follows it.
- The book's engraving shows him seated in his dungeon. The card leaves out the torments and shows him announcing the Gospel. The Persian town is generic; the book names no city.
- **Against `jonas_barachisius`** (batch 24, the other young Persian): Jonas is square-jawed with meeting brows; Benjamin is round-cheeked with a receding chin, a long arched nose and high, separate brows. **Against `adrian_eubulus`**: Eubulus is long and thin with a hump; Benjamin is soft and short-chinned.

## St. Hugh of Grenoble (1 Apr)

- Wikipedia (`Hugh.txt`): born at Châteauneuf-sur-Isère in 1053, bishop of Grenoble 1080–1132, received Bruno and six companions after a dream of seven stars and set them in the Chartreuse, canonized in 1134. Lead image: Zurbarán's *Saint Hugo in the Refectory* (`Hugh.jpg`, `big_San_Hugo_en_el_Refectorio.jpg`): a stooped, bald old bishop.
- **The seven stars and the Chartreuse are already on `bruno`** (its card shows the stars over the Alps; `existing-sheet.jpg`). So Hugh's card shows him as the pastor of Grenoble at prayer with a book, the cathedral of Notre-Dame (first mentioned 902, Wikipedia `GrenobleCathedral.txt`) and the Isère behind, no stars. Bruno's card is a clean-shaven long rectangle in white; Hugh is a small, apple-round old face in rose-violet.
- **Against `cajetan`** (round, bearded), **`john_xxiii`** (large, heavy, jowled), **`frei_galvao`** (full round with a long slender nose): Hugh is small and delicate, with a button nose, a long upper lip and very large round eyes.

## St. Richard of Chichester (3 Apr)

- Wikipedia (`Richard.txt`): born near Droitwich, worked his brother's farm, chancellor of Oxford and of Canterbury under St. Edmund, bishop of Chichester 1245, ascetic, died at Dover in 1253 aged 56. Lead image: a Victorian window at Eastbourne (`Richard.jpg`), a generic mitred bishop.
- Chichester (`Chichester.txt`): the Norman cathedral consecrated 1108; the central tower completed in the thirteenth century; the spire only about 1402. The card shows the Norman church with its tower and **no spire**.
- The book's engraving shows him pointing a kneeling priest out of the church. The card shows instead his feeding the poor.
- **Against `aelred`** (batch 20, English, clean-shaven, upturned nose): Aelred's face is long and soft; Richard's is broad and short, freckled, with wide-set eyes and a short, rounded chin. **Against `ansgar`** (clean-shaven, square-browed, cleft chin, pale eyes): Richard has no cleft, a snub nose and a wide smile.

## St. Celestine (6 Apr)

- Wikipedia (`Celestine.txt`): a Roman, pope 422–432, condemned Nestorius, supported the mission of Germanus to Britain and sent Palladius to Ireland; the Roman church keeps his feast on 27 July. Lead image: a modern window at Dundalk (`Celestine.jpg`). Santa Sabina (`SantaSabina.txt`): he established its cardinal title in 423.
- The book's engraving shows him blessing from a canopied bed, with a kneeling bishop. The card shows him with a sealed letter, sending his missionaries.
- **Against `simplicius`** (batch 23, clean-shaven, broad, hump nose) and `leo_great` (clean-shaven, heavy): Celestine has a short, tightly curled white beard, a massive hooked nose and a low brow ridge. Against `nicholas` (white beard, wide face): Celestine's beard is short and crisp, his face heavy-boned and hook-nosed.

## St. Hegesippus (7 Apr)

- Wikipedia (`Hegesippus.txt`): a convert from Judaism, travelled by Corinth to Rome under Anicetus, wrote the *Hypomnemata* in five books, quoted by Eusebius. Lead image: the Nuremberg Chronicle woodcut, a curly-haired, bearded writer with a book (`Hegesippus.jpg`).
- The book's engraving shows him standing among ancient ruins with a book. The card gives him a traveller's staff and five scrolls (the five books) on a Roman road with tombs.
- The chapter has **no Reflection**, so the card has none.
- **Against `tarasius`** (bald, domed, wedge beard), `severinus_agaunum` (spade beard), `jerome`: Hegesippus has curling hair, very large eyes, a fleshy, round-tipped nose and a long, rounded, curly beard. Forked beards are already on several cards, so his is not forked.

## St. Herman Joseph of Steinfeld (7 Apr)

- Wikipedia (`Herman.txt`, `Herman_de.txt`): born in Cologne about 1150, his boyhood devotion at St. Maria im Kapitol, the apple offered to the image, a Premonstratensian canon of Steinfeld, sacristan, died in 1241 at Hoven; confirmation of his cult in 1958; attributes an apple, a chalice with three roses. St. Maria im Kapitol (`MariaKapitol.txt`) keeps a "Hermann-Josef Virgin with the apple" of about 1180.
- Van Dyck's *Vision of the Blessed Hermann Joseph* (`big_Anton_van_Dyck_…jpg`) shows him young, with dark curly hair, in the white habit. The card follows van Dyck and the book, which speaks of his "early and saintly death … about the year 1230"; Wikipedia says he died in 1241 at about ninety. See the doubts.
- The Virgin and Child on the card are a **painted wooden statue**, so `recurring-figures.md` does not apply.
- **Against `pancras`** (a boy, round) and `vincent_saragossa` (full oval, straight hair): Herman is a young man with a bossed forehead, a flat, low nose bridge and a small upturned nose, and dark curls round a tonsure.

## St. Perpetuus (8 Apr)

- Wikipedia (`Perpetuus.txt`): of a senatorial family of the Auvergne, bishop of Tours about 460–490, rebuilt the church over St. Martin's tomb (translation of the body 473), friend of Sidonius, left his wealth to the poor. Lead image: an engraving of a mitred bishop (`Perpetuus.jpg`). The basilica (`MartinTours.txt`): the first consecrated in 471.
- The book gives his will "declaring the poor his heirs" and the little gold cross with relics left to his sister; the card shows both. Its engraving shows him kneeling at an altar.
- **Against `albinus_angers`** (pear-shaped, jowled, clean-shaven) and `william_bourges`: Perpetuus has a long oval, heavy hooded lids, a flat, broad nose bridge, a full projecting lower lip and a short beard.

## St. Mary of Egypt (9 Apr)

- Wikipedia (`MaryEgypt.txt`): Eastern icons show her "gaunt, elderly and emaciated", covered by her hair or by Zosimus's mantle, often with the three loaves; the West made her younger and conflated her with Mary Magdalene. Lead image: a Ukrainian icon with scenes of her life (`MaryEgypt.jpg`). The Painter's Manual lists her among the holy women without a description.
- The card follows the Eastern type, fully covered in the mantle, with the loaves, by the Jordan.
- The chapter has no engraving.
- **Against `mary_magdalene`** (young, long hair): Mary of Egypt is old, sun-darkened, gaunt and covered. **Against `hildegard`** (long, noble, narrow, in a veil): Mary's face is darker and more sculpted, with hollow cheeks and loose white hair. Against `marcella` (short heart-shaped, hooked nose): long, straight nose, long chin.

## St. John the Almoner (9 Apr)

- Wikipedia (`JohnAlmoner.txt`): born at Amathus, Cyprus, widowed, Patriarch of Alexandria 606–616, the poor his "lords and masters", seven churches become seventy, the merchant's grain carried to Britain, died in Cyprus about 620. Lead image: the altar of San Giovanni Elemosinario, a white-bearded patriarch giving alms (`big_San_Giovanni_Elemosinario.jpg`).
- The Painter's Manual (the holy hierarchs): "Saint John the Almsgiver, an old man with a long white beard". The card follows it.
- The book tells his sitting on a bench before the church on Wednesdays and Fridays to hear the poor, which the card shows. The Pharos stood at Alexandria in his time (Wikipedia `Pharos.txt`).
- **Against `nicholas`** (white beard, wide face, mitred): John has close-set, twinkling small eyes, a round fleshy nose tip and a long, flowing, wavy beard to mid-breast, bare-headed and bald. **Against `theodosius_cenobiarch`** (broad, flat, forked white beard) and `zachary`: undivided wavy beard, round rosy cheeks.

## St. Bademus (10 Apr)

- Wikipedia (`Bademus.txt`): a rich, noble citizen of Bethlapeta, founder of a monastery, martyred in 376 under Shapur II by the apostate Nersan. Lead image: the book's own engraving of him kneeling at a desk. Bethlapeta is the Syriac Beth Lapat, Gundeshapur in Khuzistan (`Gundeshapur.txt`).
- The card leaves out the sword, Nersan and the chains.
- **Against `jonas_barachisius`** (batch 24, Persian martyrs: square-jawed youth, gaunt aquiline elder): Bademus is fifty, heavy-jawed with square fleshy cheeks, a broad straight nose with flared nostrils, and long eyes tilting down. **Against `eulogius_cordoba`** (hooked nose, square black beard) and `stephen_hungary`: straight broad nose, rounded beard.

## Doubts

- **Herman Joseph's age.** The book says he died young ("his early and saintly death … about the year 1230"); Wikipedia says born about 1150, died 1241, so about ninety. The card follows the book and van Dyck (a young canon). If the older date is preferred, the face line needs an old man.
- **The index for 04-07 and 04-09** points at one chapter but carries the other saint's reflection (Hegesippus's day with Herman Joseph's reflection; John the Almoner's day with Mary of Egypt's). The cards use each saint's own chapter, so nothing is wrong on the cards; the Saint of the Day index may deserve a look.
- **Excerpts from the chapter, not the Reflection** (Benjamin, Hegesippus, Bademus), following batch 24. Hegesippus has no Reflection at all, so his card has no reflection.

## Look-alike risks that remain

- **Hugh against `bruno`**: related saints in the Alps. Reject any stars, Carthusian monks or white habit on Hugh; his face must stay small and round.
- **John the Almoner against `nicholas`** and the set's white-bearded elders: the close-set eyes, rosy cheeks and wavy, undivided beard are the check; he is bare-headed.
- **Benjamin and Bademus against `jonas_barachisius`**: three more Persians. Check the receding chin on Benjamin and the down-tilted eyes on Bademus.
- **Richard against `aelred` and `ansgar`**: three clean-shaven northern clerics. Richard must stay broad, short and snub-nosed.
- **Celestine** may come out as a generic kindly pope; the hooked nose and low brow ridge are the check (compare `leo_great`, `simplicius`, `zachary`, `clement_i`).
- **Mary of Egypt**: keep her fully covered and old; reject a young, long-haired Magdalene.
- **Herman Joseph**: the statue must read as a statue; reject a living Virgin.
