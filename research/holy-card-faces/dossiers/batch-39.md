# Batch 39 — the Pictorial Lives, 3 to 16 November

Ten cards from the unclaimed lines of "From the Pictorial Lives of the Saints" after batch 38: `hubert`, `bertille`, `leonard_noblac`, `willibrord`, `theodore_tyro`, `andrew_avellino`, `stanislas_kostka`, `didacus`, `laurence_otoole`, `edmund_canterbury`. **No line in this stretch is skipped**: each of the ten is in the current Roman Martyrology (entries quoted below), though Leonard and Theodore rest on late or legendary Acts (see Doubts). The lines already waiting on a decision are left alone: Vitus, Crescentia and Modestus (15 Jun), Seraphia (3 Sep), Thecla (23 Sep), Cyprian and Justina (26 Sep). The book's other chapters here are carded already: Charles Borromeo (4 Nov) `charles_borromeo`, the Holy Relics (8) `holy_relics`, Martin of Tours (11) `martin_tours`, Martin, Pope (12) `martin_i`, Gertrude (15) `gertrude`. The next unclaimed line is St. Gregory Thaumaturgus (17 Nov), for batch 40.

The card data is in `../batches/batch-39.json`. `../consult/batch-39/build.py` writes it from `cards.py` (copied from batch 38's, every output path changed to batch 39 before the first run). The script checks:

- each excerpt is verbatim in both languages against the card's chapter, and against its Reflection when the excerptSource says so;
- each `lifeChapter` exists in en-US and pt-BR, is on the card's day, and is the index's chapter for that day, except `nov-14-laurence-otoole`, the day's second chapter (the index's 11-14 points at `nov-14-didacus` and names both);
- which chapters have a `**Reflection**`/`**Reflexão**` paragraph: all but `nov-14-laurence-otoole`, in both languages; Laurence's excerptSource says it has none;
- that no other card uses any of the ten chapters;
- that no card has a `proper`, listing every sanctoral formulary whose title names one of the ten and the formularies on every card's date and on the Martyrology's other days for them (30 May Hubert, 17 Feb Theodore on Santi e Beati, 15 Aug Stanislaus, 12 Nov Didacus);
- that every word of each pt-BR name appears in the chapter title (accent-folded, for "Dídaco");
- feasts against the index days; that each catalogMatch hits one unticked line that no other batch claims; that no id collides; initials and refs.

Consulted material is in `../consult/batch-39/`:

- Wikipedia summaries, extracts and lead images (`*.json`, `*.txt`, `*.jpg`; sheet `wiki-sheet.jpg`): Hubert (en: window at Ottawa; fr: chromolithograph), Bertilla of Chelles (woodcut), Leonard of Noblac (en: statue; fr: statue at Westerheim), Willibrord (Georg Sturm), Theodore of Amasea (icon), Andrew Avellino (en: statue at Milan; it: nineteenth-century painting, also `c-Andreas_Avellino.jpg`), Stanislaus Kostka (en: Le Gros's statue; pl: painting; the "Scipione Delfine portrait" from the article, `c-StanislausKostka.jpg`; sheet `c-sheet.jpg`; Wikidata `wd-Kostka.json`), Didacus (en and es: Zurbarán), Laurence O'Toole (window at Wexford), Edmund of Abingdon (Nuremberg Chronicle; the thumbnail came out black);
- Santi e Beati pages with the current Roman Martyrology entry for each saint (`sb-*.html`, `sb-*.txt`), and the day lists they were found from (`sb-MM-DD.html`);
- the Painter's Manual (`../hermeneia-ocr.txt`, line 7167): "Theodore Teron (10), a black beard, and his hair coming down over his ears. February 17th." It has nothing for the other nine;
- the book's engravings (`book-*.jpg`, sheet `book-sheet.jpg`);
- every face line of batches 1–38 and 44–54 (`faces-all.txt`, regenerated for this batch), against which the faces were compared.

`fetch.sh` is the fetcher, `list.txt` its input, `sheet.py` makes the sheets (run with `research/holy-card-faces/.venv/bin/python`).

**Dates, names, initials.** Feasts follow the book (index days 11-03, 11-05, 11-06, 11-07, 11-09, 11-10, 11-13, 11-14, 11-14, 11-16). Names are the book's, with its pt-BR forms (Santo Huberto, Santa Bertila, São Leonardo, São Vilibrordo, São Teodoro Tiro, Santo André Avelino, São Estanislau Kostka, São Dídaco, São Lourenço O'Toole, Santo Edmundo de Cantuária). Titles after the name are dropped ("Bishop", "Abbess", "Martyr", "Archbishop of Dublin"; the last is Laurence's patron line). The book's spellings are kept where English usage differs: "Stanislas" (usually "Stanislaus"), "Bertille" (also "Bertilla"). "São Dídaco" follows the index and the catalog; the pt-BR chapter title has "SÃO DIDACO" without the accent. Ids add a place where the bare name is ambiguous: `leonard_noblac` (not Leonard of Port Maurice), `edmund_canterbury` (not Edmund the Martyr); `stanislas_kostka` keeps the book's spelling and stands apart from `stanislaus` (of Kraków). Initials: H, B, L, W, T, A, S, D, L, E.

**Titles.** None changes: all ten were "St." in the book and are "san/sant'/santa" in the Martyrology (`sb-*.txt`). Canonizations where recent enough to check: Stanislaus Kostka 1726 (Wikipedia), Andrew Avellino (year not checked; the Martyrology calls him "sant'Andrea"), Laurence O'Toole 1225 (Wikipedia), Edmund 1246 (the book and Wikipedia); Didacus is "san Diego" in the Martyrology. No saint here died after 1930.

**lifeChapter and reflection.** All ten have their chapter as lifeChapter. Nine chapters tell one life and end with their own `**Reflection**`, which the card gets. **Laurence O'Toole's chapter `nov-14-laurence-otoole` has no Reflection**, so his card has none; there is no fallback. It is the day's second chapter; the index's 11-14 reflection ("If God be in your heart…") is the close of St. Didacus's chapter and goes on Didacus's card.

**proper.** None. No formulary in the repo with en-US or pt-BR collect text names any of the ten. Two German-speaking formularies name them with a German collect only: `sanctorale.11-06.german-speaking` (Hl. Leonhard, Einsiedler) and `sanctorale.11-07.german-speaking` (Hl. Willibrord, Bischof, Glaubensbote); by the rule they are not set as `proper`. The OF calendar has a German-speaking entry for Hubert (`content/of-data/calendar/sanctorale/11-03/german-speaking/form-2.json`, "Hl. Hubert, Bischof") with no formulary behind it. The regex also hit two other saints' formularies, left out: St. Stanislaus of Kraków (04-11) and St. Juan Diego ("Ioannis Didaci", 12-09). The formularies on the ten dates belong to other saints or feasts (11-03 Martin de Porres and Germany's Pirmin, 11-05 Spain's Ángela de la Cruz, 11-06 the Spanish martyrs, Africa's All Saints, 11-09 the Lateran, 11-10 Leo the Great, 11-13 Spain's Leander and the United States' Frances Cabrini, 11-16 Margaret of Scotland); nothing on 11-07 (besides Willibrord's German one) or 11-14.

**Excerpts.**
- From the saint's own Reflection:
  - the whole of it: Hubert, Bertille, Leonard (Proverbs 5:22), Stanislas, Didacus, Edmund;
  - first sentence: Willibrord ("True zeal has its root in the love of God."), Theodore ("We are enlisted in the same service as the holy martyrs…");
  - second sentence: Andrew Avellino ("Ask him to be with you in your last hour, and to bring Jesus and Mary to your aid.").
- From the chapter, where the card has no Reflection: **Laurence**, first paragraph, third sentence ("The holy youth, by his fidelity in corresponding with the divine grace, grew to be a model of virtues."). His dying words quoted by Wikipedia ("God knows, I have not a penny under the sun…") were not used: no public-domain source for them was saved.

## St. Hubert (3 November)

- Wikipedia (`Hubert.txt`): about 656 – 30 May 727, a Frankish noble, huntsman, first bishop of Liège; "the iconography of his legend is entangled with the legend of the martyr Saint Eustace"; patron of hunters. Martyrology (`sb-Uberto.txt`), on 30 May: "A Tervueren sempre nel Brabante in Austrasia, transito di sant'Uberto, vescovo di Tongeren e Maastricht, che, discepolo e successore di san Lamberto, si adoperò con tutte le forze per diffondere il Vangelo nel Brabante e nelle Ardenne, dove estirpò i costumi pagani." Santi e Beati's notice calls the stag "Leggenda, e nemmeno esclusiva"; emblems: crozier, book, stag, dog.
- The book: early life "obscured by popular traditions", patron of hunters, ordained by St. Lambert and his successor in 681, apostle of the Ardenne, died 30 May 727.
- The card: the bishop, bareheaded, in a bell chasuble with a wooden crozier and an ivory hunting horn, the autumn Ardennes with a small church and an ordinary stag standing calmly. **The crucifix between the antlers is left off**: it is the legend the book passes over, and it is already on `eustachius` (batch 36).
- **Against `lambert`** (his master: long, parallel-sided, square-jawed, short dense beard), `eustachius` (hawkish), `germanus_auxerre` (the other huntsman bishop: oblong, domed, round-chinned), `boniface`, `remigius`: Hubert is widest at high, rounded cheekbones and tapers to a firm chin, with a short, flared nose, deep-set pale eyes, tufted brows and a full, rounded sandy-grey beard.

## St. Bertille (5 November)

- Wikipedia (`Bertille.txt`): of a noble family of Soissons, a nun of Jouarre, first abbess of Chelles in 646 (founded by Queen Bathildis), forty-six years abbess, died 692; after Butler, she "martyred herself with austerities". Martyrology (`sb-Bertilla.txt`): "Nel monastero di Calais presso Meaux nella Gallia lugdunense, sempre in Francia, santa Bertilla, prima badessa di questo cenobio."
- The book: the same, with St. Ouen's counsel.
- The card: the abbess in the black habit and white wimple with a wooden staff and the Rule, the abbey of Chelles by the Marne.
- **Against `bathildes`** (the queen who retired to her abbey: round, full, short-nosed), `bertha_blangy` (broad, square), `rosalia`, `elena_guerra`, `maria_santocanale`, `angela_merici`: Bertille is long and spare with a long, down-curving aquiline nose, deep-set eyes under heavy lids, lean cheeks and a narrow, rounded chin.

## St. Leonard (6 November)

- Wikipedia (`Leonard.txt`): died 559; "According to the romance that accrued to his name, recorded in an 11th-century vita"; "there is no previous mention of Leonard either in literature, liturgy or in church dedications" before the eleventh century; the cult spread after Bohemond's release in 1103; patron of prisoners. Santi e Beati: "le prime notizie sulla sua esistenza risalgono al secolo XI". Martyrology (`sb-Leonardo.txt`): "Nella cittadina vicino a Limoges in Francia in seguito insignita del suo nome, san Leonardo, eremita."
- The book: a noble of Clovis's court and his godson, a disciple of St. Remigius, a monk at Micy, a hermit at Noblac, the comforter of prisoners; died about 550.
- **Kept, not skipped**: the Vita is late and legendary, but the Martyrology names him (as a hermit) and the cult is of long standing.
- The card: the hermit in a brown cowl holding opened fetters with a broken chain, the woods and a small oratory of Noblac. Remigius is left off.
- **Against `ludger`**, `fiaker`, `lambert`, `anthony_abbot` and Crispin (`crispin_crispinian`): Leonard's face is wide and flat across the eyes, with a low-bridged broad nose, down-sloping wide-set eyes, full lips and a short, curly dark beard.

## St. Willibrord (7 November)

- Wikipedia (`Willibrord.txt`): about 658 – 7 November 739, a Northumbrian, twelve years in Ireland under Ecgberht, missionary to Frisia with eleven companions, consecrated by Sergius I in 695, who gave him a pallium; first bishop of Utrecht; founded Echternach, where he died. Martyrology (`sb-Villibrordo.txt`): "A Echternach in Austrasia… deposizione di san Villibrordo, che, di origine inglese, ordinato vescovo di Utrecht dal papa san Sergio I, predicò il Vangelo tra le popolazioni dell'Olanda e della Danimarca e fondò sedi episcopali e monasteri…"
- The book: the same, archbishop of Utrecht; "stately and comely in person, frank and joyous, wise in counsel, pleasant in speech".
- The card: the archbishop, bareheaded, with a pallium, crozier and Gospel book, a new church on a mound in the Frisian flatlands by the sea.
- Face after the book's description. **Against `wilfrid`** (under whom he grew up: clean-shaven, beak-nosed, long-chinned), `oswald_worcester`, `edward_confessor`, `richard_chichester`, `malachi_armagh`, `ludger`: Willibrord is square-oval, broadly smiling with dimples and laughing blue eyes, a broad-tipped nose and a strong, cleft chin.

## St. Theodore Tyro (9 November)

- Wikipedia (`Theodore.txt`): "According to legend, he was a legionary in the Roman army who suffered martyrdom by immolation at Amasea"; venerated by the late fourth century (St. Gregory of Nyssa's encomium); later legends add dragons. Martyrology (`sb-Teodoro.txt`): "Ad Amasea in Ellesponto, nell'odierna Turchia, passione di san Teodoro Tirone, che, al tempo dell'imperatore Massimiano, per aver confessato la sua fede cristiana fu violentemente percosso e gettato in carcere e, infine, dato a bruciare sul rogo. Celebrò le sue lodi san Gregorio di Nissa in un celebre encomio." Santi e Beati files him under 17 February.
- The book: a youth in the legion in Pontus, 306; he burned the temple of Isis, confessed, and was burnt.
- **Kept, not skipped**: the Acts are legendary in detail, but the Martyrology names him and the cult is attested by St. Gregory of Nyssa.
- The card: the young recruit in ring-mail with a palm and a plain shield, the gorge and rock-cut tombs of Amasea in winter. No fire, no temple, no dragon.
- Face after the Painter's Manual (black beard, hair over the ears). **Against the soldier saints** (`george`, `sebastian`, `eustachius`, `romanus_ostiarius`, `marcellus_centurion`, `pantaleon`, `theodoret_antioch`): Theodore is young, narrow and long-faced with a straight Greek profile, heavy-lidded almond eyes, glossy black hair over the ears and a short black beard.

## St. Andrew Avellino (10 November)

- Wikipedia (`Avellino.txt`, `AvellinoIt.txt`): 1521 – 10 November 1608, baptised Lancelotto, a lawyer-priest at Naples, Theatine from 1556, founder of houses at Milan and Piacenza, patron against sudden death. Martyrology (`sb-Avellino.txt`): "A Napoli, sant'Andrea Avellino, sacerdote della Congregazione dei Chierici regolari, che… si impegnò in un arduo voto di perfezionamento quotidiano nelle virtù e, ricco di meriti, morì santamente ai piedi dell'altare."
- The book: the same; struck down at the *Judica* of his last Mass in his eighty-ninth year.
- The card: the very old priest vested for Mass, hands joined at the foot of the altar, before his stroke.
- **No portrait from life was found** (one web search). The nineteenth-century painting on Italian Wikipedia and the Milan statue show a bald old man with a short white beard, which the card keeps. **Against `cajetan`** (his order's founder: round, soft, dark-bearded), `john_leonardi`, `laurence_justinian`, `francis_caracciolo`, `peter_alcantara`, `andre_soveral`: Andrew is broad, big-boned and square under a massive bald dome, with a short, flat-tipped nose, bushy white brows and a short, full, rounded white beard.

## St. Stanislas Kostka (13 November)

- Wikipedia (`Kostka.txt`): 28 October 1550 – 15 August 1568, son of a Polish senator, at the Jesuit college in Vienna, mistreated by his brother Paul, the Communion brought by St. Barbara and two angels, the walk to Rome, admitted by St. Francis Borgia, died a novice; canonized 1726. Martyrology (`sb-Kostka.txt`), on 15 August: "A Roma, san Stanislao Kostka, che, di origine polacca, spinto dal desiderio di entrare nella Compagnia di Gesù fuggì dalla casa paterna e si recò a piedi a Roma, dove, ammesso nel noviziato da san Francesco Borgia, morì in fama di santità…"
- The book: the same; died on the Assumption at seventeen.
- The card: the novice in a black cassock with lilies and a rosary, the Quirinal garden above Rome in August light.
- Face after the portrait on English Wikipedia (`c-StanislausKostka.jpg`, captioned only "Scipione Delfine portrait"; its date and painter were not established; Wikidata's image is Le Gros's statue of 1705, `wd-Kostka.json`). **Against the youths** (`pancras`, `herman_joseph`, `carlo_acutis`, `venantius_camerino`, `casimir`, `peter_luxemburg`, the student of `john_kanty`, and the original `aloysius_gonzaga`): Stanislas is broad across the eyes, with a long, straight nose broad at the base, large, heavy-lidded, wide-set dark eyes under high-arched brows and a small, full mouth.

## St. Didacus (14 November)

- Wikipedia (`Didacus.txt`, `DidacusEs.txt`): about 1400 – 12 November 1463, a hermit in youth, a Franciscan lay brother, guardian at Fuerteventura in the Canaries, infirmarian at Ara Coeli in the Jubilee of 1450, died at Alcalá de Henares. Martyrology (`sb-Diego.txt`), on 12 November: "Ad Alcalá de Henares in Spagna, san Diego, religioso dell'Ordine dei Minori, che sia nelle isole Canarie sia a Roma nel monastero di Santa Maria in Ara Coeli rifulse per umiltà e carità nella cura degli infermi."
- The book: the same; died embracing the cross with the *Dulce lignum* on his lips.
- The card: the lay brother embracing a wooden cross, the friary at Alcalá on the Castilian plain with the poor at the door. Zurbarán's roses are left off.
- Face after Zurbarán. **Against `paschal_baylon`** (the other Spanish Franciscan lay brother: angular, moustached, chin tuft), `peter_alcantara`, `frei_galvao`, `benedito`, `nicholas_tolentino`: Didacus is a long, narrow, smooth oval, clean-shaven, with a very long, thin, drooping-tipped nose, small almond eyes under thin, high brows and a small, pursed mouth.

## St. Laurence O'Toole (14 November)

- Wikipedia (`OToole.txt`): Lorcán Ua Tuathail, 1128 – 14 November 1180, youngest son of King Muirchertach of the Uí Muiredaig, a hostage of Diarmait Mac Murchada, abbot of Glendalough at twenty-six, archbishop of Dublin, mediator after the Norman invasion; died at Eu; canonized 1225. Martyrology (`sb-OToole.txt`): "A Eu nella Normandia, in Francia, transito di san Lorenzo O'Toole (Lorcan Ua Tuathail), vescovo di Dublino, che… promosse strenuamente l'osservanza della disciplina della Chiesa e, impegnato a riportare la concordia tra i principi, passò alla gioia della pace eterna mentre si recava da Enrico re d'Inghilterra."
- The book: the same; the blow at the altar at Canterbury, stanched with blessed water.
- The card: the archbishop in a red chasuble and low mitre, blessing, with Glendalough's round tower and churches by the lake behind. No attacker.
- **Against the Irish cards** (`malachi_armagh` clean-shaven and smooth, `columba`, `finbarr`, `gall`, `columban`) and `thomas_becket`: Laurence is tall and lean with a strong, angular jaw, a long, arched nose, deep-set grey eyes under straight brows and a short, trimmed, greying dark beard.

## St. Edmund of Canterbury (16 November)

- Wikipedia (`Edmund.txt`): Edmund of Abingdon (Edmund Rich), about 1174 – 1240, lecturer at Paris and Oxford, an ascetic, archbishop of Canterbury from 1234, in conflict with Henry III, died in France; canonized 1246. Martyrology (`sb-Edmondo.txt`): "Presso la cittadina di Provins in Francia, transito di sant'Edmondo Rich, vescovo di Canterbury, che, colpito dall'esilio per aver difeso la Chiesa, morì vivendo santamente tra i monaci cistercensi di Pontigny."
- The book: the same; his vow at Oxford and espousal to Mary; buried at Pontigny.
- The card: the archbishop in a white chasuble and mitre with an open book, the Cistercian church of Pontigny behind. No pallium (not checked).
- **Against the archbishops of Canterbury** (`anselm` long-headed with a jutting, short-bearded chin; `thomas_becket` long, fine-nosed; `augustine_canterbury` square-bearded; `elphege` bulge-browed) and `simon_stock`, `richard_chichester`: Edmund is lean and angular, widest at high, sharp cheekbones, with a hooked-tipped nose, deep-set pale-grey eyes, a thin, smiling mouth and a small, pointed chin.

## Look-alike risks that remain

- **Hubert against `lambert` and `germanus_auxerre`**: three Frankish bishops, two of them former huntsmen. Hubert must taper to a narrow chin under a full, rounded sandy beard; reject a square jaw or a short, dense beard.
- **Leonard against Hubert**: both Franks with dark-to-sandy beards. Leonard is a tonsured monk with a flat, wide face and a short, curly dark beard; Hubert, bareheaded bishop, sandy-grey and tapering.
- **Andrew Avellino against `john_leonardi`**: both bald, old Italian priests. Andrew has a white beard and bushy white brows; reject a clean chin.
- **Didacus against `paschal_baylon`**: both Spanish Franciscan lay brothers. Didacus must be clean-shaven and smooth; reject a moustache or chin tuft.
- **Stanislas against `aloysius_gonzaga`** (the other Jesuit youth, original card) and `herman_joseph`: reject a long, thin face or an upturned nose; Stanislas is broad across the eyes, dark-haired, with heavy lids.
- **Laurence against `malachi_armagh`**: two Irish archbishops in chasuble and low mitre. Laurence is bearded, angular and long-nosed, in red; Malachi clean-shaven, smooth, in green.
- **Edmund against `anselm`**: both lean, scholarly archbishops of Canterbury. Edmund is clean-shaven with a pointed chin and a hooked nose tip; reject a beard on him.
- **Willibrord against `wilfrid`**: both clean-shaven Northumbrians with silver tonsures. Willibrord smiles broadly with dimples and a cleft chin; reject a beaked nose.

## Doubts

- **Laurence O'Toole** gets no reflection (his chapter has none); his excerpt is a sentence of the chapter, following the precedent of batches 22–38.
- **Kept though resting on late or legendary Acts**, both in the current Martyrology: Leonard (an eleventh-century Vita with no earlier trace) and Theodore Tyro (Wikipedia: "According to legend"; later dragon legends). If either should be skipped, St. Gregory Thaumaturgus (17 Nov) and then St. Odo of Cluny (18 Nov) are next.
- **Dates that differ from the Martyrology**, the card following the book: Hubert (30 May), Stanislaus (15 Aug), Didacus (12 Nov); Santi e Beati files Theodore on 17 February (the Painter's Manual has the same date), though the book and many calendars keep 9 November. Not checked against the Latin Martyrology itself.
- **Hubert's stag** is shown without the crucifix (see his section); the alternative is the traditional vision, which repeats `eustachius`'s composition.
- **Stanislas's portrait**: its date and painter were not established; the web search's claim of a 1568 portrait was not confirmed by Wikidata, so the basis says only what the Wikipedia caption says.
- **Andrew Avellino's face** has no portrait from life behind it, only later images.
- **Book spellings kept**: "Stanislas" (not "Stanislaus"), "Bertille"; pt-BR "Dídaco" with the index's accent against the chapter title's "DIDACO".
- **Patron lines not from the book**: Leonard "Patron of prisoners" (Wikipedia; the book has him comforting prisoners), Willibrord "Apostle of the Frisians" (Wikipedia), Theodore "Soldier and martyr" (Santi e Beati), Stanislas "Jesuit novice" (Santi e Beati). From the book: Hubert "Patron of hunters", Bertille "Abbess of Chelles", Andrew "Patron against sudden death", Didacus "Franciscan lay brother", Laurence "Archbishop of Dublin", Edmund "Archbishop of Canterbury".
- **Attributes not in the book**: Hubert's horn and stag (iconographic tradition, Santi e Beati's emblems), Leonard's fetters (his patronage, Wikipedia), Willibrord's pallium (Wikipedia), Theodore's shield, Stanislas's lilies and rosary (traditional; not sourced here), Glendalough's round tower (a real place, not dated here).
- **`recurring-figures.md`**: unchanged. No figure here appears on two cards: Lambert (Hubert), Remigius (Leonard), Our Lady, St. Barbara and the angels (Stanislas, Andrew) are left off.
