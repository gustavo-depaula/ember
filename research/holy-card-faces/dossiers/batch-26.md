# Batch 26 — the Pictorial Lives, 12 to 22 April

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 25: `julius_i`, `hermenegild`, `benezet`, `paternus_avranches`, `saragossa_martyrs`, `anicetus`, `apollonius`, `elphege`, `marcellinus_embrun`, `soter`. No line in the stretch is skipped: none of the ten has a suppressed cult, and none rests on a discredited story (see Hermenegild and Benezet under Doubts for what the sources qualify). The book's other chapters here are carded elsewhere: Leo the Great (11 Apr) is `leo_great`, Anselm (21 Apr) is `anselm`. Leonides (22 Apr, the second chapter of Soter's day) is the next unclaimed line, left for batch 27.

The card data is in `../batches/batch-26.json`, written by `../consult/batch-26/build.py` (adapted from batch 25's). The script checks each excerpt verbatim in both languages against the card's chapter (case-insensitive, because the book sets each chapter's first words in capitals) and, when the excerptSource says so, against its own Reflection; that each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is used by no other batch or existing card; which chapters have a `**Reflection**`/`**Reflexão**` paragraph (both languages agree); that each `proper` exists, has en-US or pt-BR collect text and a calendar entry, and that no other formulary with such text names one of the ten; feasts against the index days; that each catalogMatch hits one unticked line no other batch claims; that no id collides; that each initial matches the name and each ref exists. Consulted material is in the same folder: Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`), the Commons record of Bermejo's Santa Engracia (`Engratia_commons.json`), the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`), and the existing cards compared against (`existing-sheet.jpg`: the popes, bishops and young virgin martyrs). `fetch.sh` is the fetcher (now URL-encodes titles); `list.txt`, `list2.txt` its inputs.

**Dates, names, initials.** Feasts follow the book (index days 04-12 to 04-20 and 04-22). Names are the book's, with its pt-BR forms (São Júlio, São Hermenegildo, São Benezet, São Paterno, Santa Engrácia, Santo Aniceto, Santo Apolônio, Santo Elfego, São Marcelino, São Sótero). Tidied: "St. Benezet, or Little Bennet" becomes "St. Benezet"; "Eighteen Martyrs of Saragossa, and St. Encratis, or Engratia, Virgin, Martyr" becomes "The Eighteen Martyrs of Saragossa and St. Engratia" / "Os Dezoito Mártires de Saragoça e Santa Engrácia" (the book's own alternative name; initial E from "Eighteen"); "St. Marcellinus" becomes "St. Marcellinus of Embrun" / "São Marcelino de Embrun", to keep him apart from Pope Marcellinus (26 Apr) and `marcellinus_peter`. The ids `julius_i` (as `celestine_i`), `paternus_avranches` and `marcellinus_embrun` keep them apart from namesakes. None is "Blessed" in the book, so no title changes. Initials: J, H, B, P, E, A, A, E, M, S.

**Martyr titles.** The book (and the catalog) call Anicetus and Soter "Pope, Martyr". Wikipedia's Soter quotes the book on the 1969 calendar reform: "There are no grounds for including Saint Soter and Saint Caius among the martyrs", and the Roman Martyrology's entry for him has no martyr title; his card says "Pope" / "Papa". For Anicetus, Wikipedia says tradition makes him a martyr "but there are no historical grounds for this account", and the book itself hedges ("If he did not shed his blood for the Faith, he at least purchased the title of martyr by great sufferings"). His card keeps the book's "Pope and martyr" / "Papa e mártir". See Doubts.

**lifeChapter and reflection.** Each card has its own chapter in both languages. On **04-22** the book has two chapters (Soter, Leonides) and the index points at Leonides's; Soter's card takes `apr-22-soter`. Eight chapters end with a `**Reflection**—` paragraph. **Julius** and **Soter** have none, so their cards carry no reflection (the index has no reflection for 04-12 or 04-22 either, so nothing could be borrowed).

**proper.** One card has one: **`marcellinus_embrun` → `sanctorale.04-20.africa`** ("Saint Marcellinus, Bishop", optional memorial, en-US collect: "…as we celebrate the memorial of Saint Marcellinus, and fill us with the same missionary zeal and spirit"; calendar entry `content/of-data/calendar/sanctorale/04-20/africa.json`). The identification rests on the scope's other entries: the `africa` sanctoral honours saints born in Africa (Adrian of Canterbury, Alexander of Alexandria, Zeno of Verona, Victor I, Maurice, Daniel Comboni, …), and the only African-born bishop Marcellinus on 20 April is the Berber first bishop of Embrun (fr Wikipedia: "d'origine berbère … fêté le 20 avril"). The collect's missionary zeal fits him. (The collect's en-US text has a typo, "look with kindness o us"; not ours to fix here.) **Hermenegild** has his own formulary, `sanctorale.04-13.spain` ("San Hermenegildo, mártir"), in Spanish only, so no `proper`; the script fails if it gains en-US or pt-BR text. No formulary exists for the other eight; 06-02 (Marcellinus and Peter) is other saints.

**Excerpts.**
- From the saint's own Reflection: Hermenegild (the whole of it), Benezet (first sentence), Paternus (the Gospel words it quotes), the Saragossa martyrs (last sentence), Apollonius (third sentence), Marcellinus (the whole of it).
- **Julius** (no Reflection): the chapter's first sentence, "St. Julius was a Roman, and chosen Pope on the 6th of February in 337." It is plain; nothing else in the chapter stands alone and short.
- **Soter** (no Reflection): "By the sweetness of his discourses he comforted all persons with the tenderness of a father", the first clause of the chapter's second sentence, closed with a full stop.
- **Anicetus**: the Reflection's second sentence hangs on "this rule" in the first, and the first is one long hypothetical question, so the excerpt is from the chapter: "His vigilance protected his flock from the wiles of the heretics Valentine and Marcion", closed with a full stop before "who sought…".
- **Elphege**: his own words from the chapter, refusing to tax his tenants for his ransom: "Better give up to the poor what is ours, than take from them the little which is their own." The Reflection says the same of him in the book's voice.

## St. Julius (12 Apr)

- Wikipedia (`Julius.txt`): a Roman, pope 337–352, received Athanasius, the Roman synod, the letter to the Eastern bishops, the Council of Sardica; the Christmas-date attribution is spurious (the card does not use it). Lead image: the Santa Maria in Trastevere mosaic figure (`Julius.jpg`): tonsured, a short dark beard, a book. Santa Maria in Trastevere (`Trastevere.txt`): "In 340, it was rebuilt on a larger scale by Pope Julius I"; its apse mosaic is 1130–1143.
- The book's engraving shows him at a desk writing, a monk at the door. The card shows the sealed letter.
- **Against the existing popes** (`existing-sheet.jpg`): `clement_i` (diamond), `linus` (hexagonal), `callistus` (wide rectangle), `damasus` (rectangle), `celestine_i` (massive hooked nose): Julius's face widens downward from narrow temples to a bony, angular jaw, with small, close-set round eyes and a thin, wide mouth. Against `stanislaus` and `albinus_angers` (pear-shaped, soft): Julius's lower face is bone, not flesh.

## St. Hermenegild (13 Apr)

- Wikipedia (`Hermenegild.txt`): son of Liuvigild, married the Catholic Ingund, converted under Leander, revolted, was imprisoned, refused the Eucharist from an Arian bishop at Easter and was beheaded on 13 April 585. Lead image: Herrera the Younger's *Triumph of St. Hermenegild*.
- The book's engraving shows the death-stroke in the cell. The card shows him in fetters with the light from his cell over Seville, no executioner.
- **Against `leander`** (batch 22, his mentor: lean, long, receding hair, hump nose) and `casimir` (long, narrow, clean-shaven prince): Hermenegild has flat, long cheeks, very wide-set pale-green eyes with a low flat bridge, a projecting rounded chin and long Gothic hair. **Against `wenceslaus`** (broad Slavic, high flat cheekbones): no prominent cheekbones.

## St. Benezet (14 Apr)

- Wikipedia (`Benezet.txt`, `Benezet_fr.txt`): c. 1163–1184, a shepherd boy, the bridge at Avignon begun 1177, buried on the bridge, incorrupt when the coffin was opened after the 1669 flood. Lead image: a statue at Notre-Dame des Doms of a young man carrying a great stone. The bridge (`PontAvignon.txt`).
- The card leaves out the Papal Palace (fourteenth century) and shows only a small Romanesque church on the rock.
- **Against `pancras`** (round boy's face) and `aloysius_gonzaga`: Benezet is narrow, bony and freckled, with a pointed chin and ears that stand out.

## St. Paternus (15 Apr)

- Wikipedia has no article on Paternus of Avranches; its `Padarn` (`Padarn.txt`) says the Welsh Padarn "appears to be the same individual as … Saint Paternus of Avranches". Lead image: a modern icon of a bearded bishop. French Wikipedia's "Pair d'Avranches" does not exist under that title (`Paternus_fr.*` empty, removed).
- The book: born at Poitiers about 482, monk at Marnes, founded Llanbadarn, hermit with Scubilion in the forest of Scicy near the sea, Bishop of Avranches, retired for peace. The engraving shows a bishop with a monk and a man with a scroll among ruins.
- The lone rock in the bay is shown with no buildings (the card does not name it or put an abbey on it).
- **Against `patrick`, `anthony_abbot`, `theodosius_cenobiarch`** and the set's white-bearded elders: the shield-shaped face with the straight, high cheekbone line and narrow, upward-slanting grey eyes, and a narrow, straight beard.

## The Eighteen Martyrs of Saragossa and St. Engratia (16 Apr)

- Wikipedia (`Engratia.txt`, `Engratia_es.txt`, `Martires_es.txt`): Engratia of Braga (the book: "a native of Portugal"), on her way to marry in Roussillon, reproached Dacian at Saragossa; the eighteen, headed by Optatus, beheaded; Prudentius's hymn; the Basilica of Santa Engracia (`SantaEngracia.txt`). Lead image of the Spanish article: Bartolomé Bermejo's *Santa Engracia*, c. 1474, Isabella Stewart Gardner Museum (`Engratia_commons.json`), a crowned young noblewoman with a palm.
- The book's engraving shows her, veiled, leaving her father's house. The card shows her with Optatus and the companions small behind, with no torments.
- **Against the young virgin martyrs** (`agnes`, `lucy`, `agatha`, `philomena`, `cecilia`: soft ovals, loose hair; `euphrasia`: narrow oblong, long neck; `genevieve`: broad, square-jawed): Engratia has a long oval with a strong, high-bridged straight nose, a firm square-tipped chin and low straight brows, her hair braided under a veil. **Optatus against `barbatus`** (bulbous nose) and `john_egypt` (elfin): round, domed bald head, a broad flat nose and a curly beard.

## St. Anicetus (17 Apr)

- Wikipedia (`Anicetus.txt`): a Syrian of Emesa (Liber Pontificalis), pope about 157–168, Polycarp's visit, against Gnostics and Marcion, decreed that priests should not wear long hair; the martyrdom has "no historical grounds". Lead image: a Baroque statue at Wolnzach of an old bearded pope. Hadrian's mausoleum (`CastelSantAngelo.txt`): built 134–139, so standing in his time.
- **Against `hegesippus`** (batch 25, who came to Rome under him: domed head, protruding eyes, long curly beard) and `celestine_i`: Anicetus's head is narrow and egg-shaped with a sloping forehead, a long thin arched nose, heavy lower lids, full lips and cropped hair. Against `sylvester` (long narrow face, straight nose, white): Anicetus is olive-brown, black-and-grey, with high-arching thick brows and full lips.

## St. Apollonius (18 Apr)

- Wikipedia (`Apollonius.txt`): the Roman Martyrology (21 April) "philosopher and martyr" under Commodus, before Perennis and the Senate; the sources disagree on the manner of death. Its lead image shows Apollonius of Antinoe, another saint (not used).
- The book: a Roman senator, accused by his slave, beheaded about 186. The engraving shows him in a toga before a seated Roman.
- **Against `justin`** (the other philosopher-martyr: long face, grey curly hair and beard, blue mantle, scroll): Apollonius is broad and short, round-jawed, with heavy-lidded prominent eyes, dark curls and a senator's toga with the purple stripe.

## St. Elphege (19 Apr)

- Wikipedia (`Elphege.txt`): Ælfheah, monk of Deerhurst, anchorite and abbot at Bath, Bishop of Winchester 984, Archbishop of Canterbury 1006, captured in 1011, killed at Greenwich on 19 April 1012 after refusing ransom, canonised 1078; "often depict[ed] … holding a pile of stones in his chasuble". St Alfege Church, Greenwich (`StAlfege.txt`). No lead image.
- The book's engraving shows him praying on a city wall among Danish archers.
- **Against `boniface`** (Anglo-Saxon, broad, snub nose, bearded), `aelred` and `richard_chichester` (clean-shaven Englishmen: long and soft; broad, snub, freckled): Elphege's short, wide face sits under a rounded, bulging brow, with a small tucked chin.

## St. Marcellinus of Embrun (20 Apr)

- Wikipedia (`Marcellinus.txt`, `Marcellin_fr.txt`): a native of Africa Proconsularis, "d'origine berbère", came with Vincent and Domninus, first Bishop of Embrun, died 374, feast 20 April. Lead image: a seal of the later archbishops of Embrun (not him). Embrun Cathedral (`EmbrunCathedral.txt`) is later; the card shows only a small chapel.
- The book's engraving shows a bishop sending off two companions below mountains, which the card follows.
- **Against the North Africans** (`fulgentius`: short, broad, bald; `victorian_carthage`: long, strong, large nose; `augustine`, `moses_the_black`): Marcellinus has a long, fine-boned narrow face, a narrow straight nose, a small pointed chin and light hazel-green eyes.

## St. Soter (22 Apr)

- Wikipedia (`Soter.txt`): born at Fondi into a Greek family, pope about 167–174, alms to Corinth; the Roman Martyrology praises his charity to exiles and to those condemned to the mines, without the title of martyr. Lead image: a silver reliquary bust of a bearded pope.
- The chapter has no engraving. The card shows him sending alms and his letter to Corinth from Ostia.
- **Against `zachary`** (batch 24: soft long face, all features sloping down) and `john_almoner` (wide, soft, rosy, close-set eyes): Soter's face is heart-shaped, broad at the temples and tapering to a small chin, with very large down-turned eyes and a small, fine nose. Against `nicholas`: shorter, softer beard, no mitre.

## Doubts

- **Anicetus's and Soter's martyr titles.** The book and catalog have "Pope, Martyr" for both. Soter's card drops "martyr" (the 1969 reform and the Roman Martyrology, via Wikipedia); Anicetus's keeps the book's "Pope and martyr", as the book defends it, though Wikipedia says the martyrdom has no historical grounds. If the set should follow the current Martyrology for both, Anicetus's patron line becomes "Pope" / "Papa".
- **Hermenegild.** Wikipedia notes that contemporary Spanish chronicles tell only his revolt, and that Gregory the Great first called him a martyr. The cult is not suppressed (he is in the Spanish OF proper, `sanctorale.04-13.spain`), so the card stands; the book's account follows Gregory.
- **Benezet.** The single-handed stone and the miracles are legend (Wikipedia: "Christian tradition states"); the bridge, the burial on it and the translation of the relics are history. The card shows the stone as his traditional attribute.
- **Julius's excerpt** is a plain fact of the chapter; the chapter has nothing better that stands alone. Alternative: leave `prayerExcerpt` off his card.

## Look-alike risks that remain

- **The three popes (Julius, Anicetus, Soter)** share the crimson chasuble and pallium of the existing pope cards. Check the bone structure: Julius's broad angular jaw, Anicetus's narrow egg-shaped head with full lips and cropped hair, Soter's heart shape with big down-turned eyes. Reject a generic kindly bearded pope.
- **Engratia against `agnes`, `lucy` and the young virgin martyrs**: the strong, high-bridged nose, square-tipped chin and braided hair under the veil are the check.
- **Benezet against `pancras`**: reject a round face; he is narrow and freckled, with ears that stand out.
- **Paternus against the white-bearded elders** (`theodosius_cenobiarch`, `john_almoner`, `anthony_abbot`): the straight high cheekbone line and slanting grey eyes.
- **Elphege**: reject blood or an axe; the stones in the chasuble should read as an attribute, not a wound.
- **Marcellinus against `victorian_carthage`**: both North Africans; Marcellinus is finer-boned, with a small pointed chin and light eyes.
