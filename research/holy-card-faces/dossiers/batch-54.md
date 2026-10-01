# Batch 54: canonized since 2022, 25 August to 9 December

Eight cards, the rest of "Canonized since 2022" (lines 21–28) in the section's date order: `maria_troncatti`, `bartolo_longo`, `carlo_acutis`, `jose_gregorio_hernandez`, `vincenza_maria_poloni`, `artemide_zatti`, `charles_de_foucauld`, `fulton_sheen`. With batches 52 and 53 this covers the whole section.

The card data is in `../batches/batch-54.json`, written by `../consult/batch-54/build.py` from `cards.py`. The script checks:
- each saying's original wording against the saved copy of the source it cites, and a second witness where there is one; Sheen's three English sentences verbatim in the saved Dicastery page;
- that Longo's en-US and pt-BR are not the Vatican's translations (the English and Portuguese of *Rosarium Virginis Mariae*, saved);
- each feast against the catalog line and the "Memoria liturgica" field of the saved Dicastery page (`../consult/canonizations/`, and Sheen's page, saved in `../consult/batch-54/`);
- that no OF formulary or calendar entry in the repo names any of the eight, and that no card has `proper` or `lifeChapter`;
- that each catalogMatch hits one unticked line among the section's lines 21–28, in order, and that no other batch claims it;
- the en-US and pt-BR names against the catalog, ids, initials ("Bl." skipped), refs, and that every portrait used is saved.

Consulted material is in `../consult/batch-54/`:
- the Dicastery portraits (`causesanti-*.jpg`, sheet `causesanti-sheet.jpg`) and page texts (`causesanti-*.txt`; Sheen's page also as `.html`);
- Wikipedia summaries and extracts (`*.json`, `*.txt`);
- Commons copies (`Longo*.jpg`, `Hernandez-*.jpg`, `Poloni-*.jpg`, `Zatti-1..4.jpg`, `Foucauld*.jpg`, `Sheen-*.jpg`; `commons-meta.txt`), other photographs (`Troncatti-2026.jpg`, `Troncatti-sucua.jpg`, `Zatti-migrer.jpg`, `Zatti-bs.jpg`), face crops (`*-face.jpg`) and sheets (`sheet-1..8.jpg`);
- the quote and fact sources (`src-*.html` / `.txt` / `.pdf`);
- the existing cards compared (`existing-sheet.jpg`) and every face line of batches 1–31, 52 and 53 and of the card files (`faces-all.txt`). Batch 32 had no file yet.

`fetch.sh`, `getc.sh`, `crop.py`, `sheet.py`, `totext.py` and `totext2.py` (keeps inline quotes whole) are the tools. `sheet.py` and `crop.py` need `/usr/bin/python3` (PIL).

**Dates, names, initials.** Each feast is the Dicastery's memorial, as the catalog gives it. Sheen's Dicastery page (fetched 30 September 2026) now carries "Memoria Liturgica: 9 dicembre", and the apostolic letter read at the beatification (EWTN) says he "may be celebrated on the ninth day of December". None of the eight is on the General Calendar. Names follow the catalog; Sheen is "Bl. Fulton J. Sheen" / "Bem-aventurado Fulton J. Sheen", initial F. Initials: M, B, C, J, V, A, C, F.

**proper.** None. No OF formulary or calendar entry in the repo names any of the eight. The formularies on their dates are other saints (Louis of France; Faustina, with Benedict the Moor for Brazil; Aparecida and the Pilar for Brazil and Spain on 12 October; Martin of Tours; Frances Cabrini for the US; Clementine Anuarite for Africa; Juan Diego). There is no 26 October file.

**Excerpts.** All eight are the saints' own short words, cited. **Every en-US and pt-BR rendering is ours** from the original language (Italian, Spanish, French), except Sheen's en-US, which is his English. Troncatti (1969), Acutis (2006) and Sheen (1979) are single short quotations; Zatti's (1951) is his three-word motto. The others died before 1930.

## St. Maria Troncatti (25 August)

- The Dicastery: born at Corteno Golgi (Brescia) in 1883, a Salesian Sister (FMA) from 1908, a nurse of wounded soldiers in the First World War, sent to Ecuador in 1922; from 1925 at Macas and beyond the river Upano among the Shuar; "the only doctor of the area" before the hospital of Sucúa; she died in a plane crash at Sucúa on 25 August 1969, aged 86.
- Face: her photographs in old age. The Salesian Sisters' coloured portrait (cgfmanet.org, August 2026) and the Dicastery's portrait drawn from a photograph agree: a broad, rounded face with full cheeks, round spectacles and a wide, warm smile, in a black habit and veil with a broad, rounded white collar and a small cross. The photograph of her on a white horse at Sucúa (AGFMA, in Rivista DMA) is too small for the face.
- Excerpt: «Io vi do le medicine, ma chi vi ottiene la guarigione è Maria Ausiliatrice», which the Dicastery's page says she "used to say" (the page misspells *guarigone*); the Salesian Sisters' note on her canonization emblem quotes it too. Her «Sono ogni giorno più felice della mia vocazione religiosa missionaria!», also on the page, is an alternative.
- The bag and rosary follow the emblem of her canonization, which joins a nurse's bag to a rosary to express that saying (cgfmanet).
- **Against `teresa_calcutta`** (old nun with a child): Troncatti's face is broad and round, bespectacled and smiling broadly; the habit is black with a white collar, not white and blue.

## St. Bartolo Longo (5 October)

- The Dicastery and Italian Wikipedia: born at Latiano in 1841, a lawyer who fell into spiritualism in Naples, converted, and from 1872 in the valley of Pompeii spread the Rosary, built the shrine (from 1876), orphanages and the works for prisoners' children, and wrote the *Supplica* (first recited 14 October 1883). He died on 5 October 1926.
- Face: his photographs (Commons: the portrait of about 1900, at thirty-five, and with his wife in 1920; the Dicastery's drawing from the first). A long face under a high, domed forehead, wavy hair receding and brushed back, deep-set eyes, a pince-nez on a cord and a full, bushy beard. The card makes him about sixty, beard greying.
- Excerpt: the close of the *Supplica*, «O Rosario benedetto di Maria, catena dolce che ci rannodi a Dio, vincolo d'amore che ci unisci agli Angeli…» (Famiglia Cristiana's text and the Ambrosianeum leaflet); John Paul II quotes it as Longo's closing words at the end of *Rosarium Virginis Mariae* (43). The Vatican's English ("sweet chain which unites us to God") and Portuguese ("doce cadeia que nos prende a Deus") are **not** used: ours render *rannodi* ("ties us back", "nos reata") and are checked against them.
- The Supplica recited today is a lightly revised text; the closing clauses used are the same in the modern text and in John Paul II's quotation.
- **Against `maximilian_kolbe`** (round spectacles, long pointed beard, habit) and `cesar_de_bus` (pointed chin beard): Longo is a layman in a frock coat and wing collar, with a pince-nez and a broad, bushy beard.

## St. Carlo Acutis (12 October)

- The Dicastery: born in London in 1991, raised in Milan; daily Mass from his First Communion, his website of the world's Eucharistic miracles, his love of Assisi; he died of leukaemia on 12 October 2006; his body was moved to Assisi in 2007.
- Face: his photographs (English Wikipedia's lead photograph in the red polo shirt; the Dicastery's drawing). A soft, broad oval face with full cheeks under a mop of dark curls, straight dark brows, brown eyes and a wide, easy smile. The red polo and backpack straps are from the photograph.
- Excerpt: «L'Eucaristia è la mia autostrada per il Cielo!», on the Dicastery's page twice (and in the decree's Latin). Seven words: our renderings are the literal ones, which any translation will share.
- The Host in a monstrance in the sky is the card's sign of his Eucharistic devotion; no computer, which would look anachronistic on the card.
- **Against `pier_giorgio_frassati`** (young layman of batch 53, broad square face, hair brushed up) and `aloysius_gonzaga`: Acutis is fifteen, curly-headed, full-cheeked, in a red polo shirt.

## St. José Gregorio Hernández (26 October)

- The Dicastery: born at Isnotú (Trujillo) on 26 October 1864, physician trained in Caracas and Paris, professor at the University of Caracas, "the doctor of the poor"; he died on 29 June 1919, struck by a car. The memorial is his birthday, not his death day (the solemnity of Sts. Peter and Paul).
- Face: his photographs (Commons: the head-and-shoulders portrait in hat, about 1910s; the full-length photograph; the Dicastery's drawing). A smooth, round face with full cheeks, large, heavy-lidded eyes under brows raised at the inner ends, a short straight nose and a neat dark moustache, in a black suit, stiff collar and wide-brimmed black hat, which is his known image.
- Excerpt: «Mi madre que me amaba, desde la cuna me enseñó la virtud, me crió en la ciencia de Dios, y me puso de guía la santa caridad» (josegregorio.org, "Sus palabras"; Diario de Los Andes); the Dicastery's page has it in Italian. **Its written source (letter or notebook) is not given by any of them.**
- **Against `artemide_zatti`** in this batch (the other moustached layman): Hernández is round, smooth and grave, hatted, in a black suit; Zatti is square, tousled and laughing, in a white coat.

## St. Vincenza Maria Poloni (11 November)

- The Dicastery: born in Verona in 1802; with three companions she moved in 1840 into the city's Pio Ricovero and began the Sisters of Mercy of Verona; vows in 1848; she died on 11 November 1855. The page says no letters or conferences of hers survive, only "sayings" and "teachings" reported by eyewitnesses.
- Face: no photograph; two 19th-century painted portraits (Commons) and the Dicastery's drawing from one. A long, narrow oval face with a long, prominent nose, heavy-lidded eyes glancing aside, fine arched brows and a small, thin mouth with a faint smile; black habit, deep hooded black veil, broad square white collar, hand on the breast.
- Excerpt: her words to a novice ashamed of garden work, «Una serva dei poveri, anziché vergognarsi di ciò che fa in servizio loro, se ne deve gloriare», Dicastery. The headline "I poveri sono i nostri padroni…" on the same page was not used: it is the Vincentian maxim her community took over, not clearly her own.
- **Against `maria_santocanale`** (long narrow face, brows sloping down) and `elena_guerra` (strong-boned, square chin, wide mouth): Poloni's nose is the dominant feature, her mouth small and wry, her gaze sideways.

## St. Artemide Zatti (13 November)

- The Dicastery: born at Boretto (Reggio Emilia) in 1880, emigrated with his family to Bahía Blanca in 1897; sent to Viedma with tuberculosis; after his healing he professed as a Salesian brother (1911) and ran the San José hospital and its pharmacy, going round the town and across the Río Negro to Patagones; he died on 15 March 1951. The memorial (13 November) is not his death day; the Dicastery gives no reason.
- Face: his photographs (the early portrait on MigrER; the Bollettino Salesiano photograph with the boys of Viedma; the Dicastery's drawing from a late photograph in a white coat, smiling). A square, broad face with high cheekbones, tousled dark hair over the brow, deep-set smiling eyes, a thick drooping moustache and a broad smile. The card makes him about sixty, greying.
- Excerpt: his motto «Creí, prometí, sané», from his account of his healing published in *Flores del Campo* on 23 May 1915 (Spanish Wikipedia), which was the motto of his canonization (Salesianos España; ACI Stampa in Italian). The fuller sentence around it differs between sources, so only the three words are used.
- **Against `stephen_hungary`** (square face, drooping moustache, but crowned and bearded) and `jose_gregorio_hernandez` above.

## St. Charles de Foucauld (1 December)

- The Dicastery and French Wikipedia: born at Strasbourg in 1858, officer and explorer of Morocco, converted in Paris in October 1886, Trappist, then hermit at Nazareth, priest (1901), and hermit at Beni Abbès and in the Hoggar (Tamanrasset, and a hermitage on the Assekrem); killed at Tamanrasset on 1 December 1916.
- Face: his photograph as a hermit (Commons, the source of the Dicastery's portrait). A lean, triangular face, close-cropped dark hair, deep-set eyes, high cheekbones over hollow cheeks, a short dark beard, in the white gandoura with the heart and cross and a leather belt with a rosary. The Commons photograph "in hat" (about 1910) shows him older with a white beard and head-cloth; the card keeps the better-known face at about fifty-five, beard flecked with grey.
- The heart and cross are red (Clairval: "a red heart surmounted by a cross"); the photographs are black and white.
- Excerpt: «Aussitôt que je crus qu'il y avait un Dieu, je compris que je ne pouvais faire autrement que de ne vivre que pour Lui», French Wikipedia, which does not name the letter it comes from; the decree on the Dicastery's page quotes it in Latin.
- **Against `camillus`** (red cross on a black habit, square jaw, full beard) and `cesar_de_bus`: Foucauld is in white, lean and triangular, close-cropped, with a short beard.

## Bl. Fulton J. Sheen (9 December)

- The Dicastery: born at El Paso, Illinois, in 1895; priest of Peoria (1919); doctorate at Louvain; *The Catholic Hour* on radio from 1930 and *Life Is Worth Living* on television (from 1951); auxiliary bishop of New York (1951), bishop of Rochester, titular archbishop (1969); he died in New York on 9 December 1979. Beatified at St. Louis on 24 September 2026, Cardinal Tagle presiding; memorial 9 December.
- Face: his photographs (Commons: the New York World-Telegram photograph of 1952 in cape and pectoral cross; ABC's of 1956; the Library of Congress portraits as a young priest; the Dicastery's portrait). A long, lean face with high cheekbones, dark wavy hair brushed back, arched brows over large, deep-set, intense eyes, and a wide, thin smile. The card makes him about sixty, as in the television years.
- Excerpt: his answer to a friend on why he became a priest, «I was called to tell this story (the Gospel). I never tire of telling it. I never tire of improving my telling of it. I love my calling.», as Cardinal Tagle quoted it in the beatification homily (on the Dicastery's page; Vatican News). His books are in copyright, so this is a single short spoken saying, second-hand; the card drops Tagle's gloss and the third sentence. His answer to Pius XII about conversions ("simply a porter…") in the same homily is the alternative.
- New York: Wikipedia records his years as auxiliary bishop there and his burial in St. Patrick's Cathedral until 2019.
- **Against `giovanni_battista_scalabrini`** (bishop in black and purple, square chin, level brows) and `giuseppe_allamano` (lean, white-haired, laughing): Sheen has dark hair, arched brows, high cheekbones and the large, intense eyes, under the long purple cape.

### Redraw: the rays of a Blessed, not a halo (1 October 2026) — awaiting regeneration

- The card on main (`content/saints/fulton_sheen.png`) shows him with the set's full gold disc and dotted ring, like the canonized saints. `new-card.sh` asks for it on every card: its default frame text ends "a gold dotted-ring halo", and the reference cards all have one. Nothing in his entry said otherwise.
- The convention: a nimbus for saints, rays for the beatified.
  - New Catholic Encyclopedia, "Halo" (C. J. Corcoran; on encyclopedia.com): "The blessed, those beatified but not yet canonized, are depicted with a halo less explicit, formed by shafts of light radiating from behind the head."
  - Wikipedia, "Halo (religious iconography)": "Beatified figures, not yet canonised as saints, are sometimes shown in medieval Italian art with linear rays radiating out from the head, but no circular edge of the nimbus defined".
  - Catholic Encyclopedia, "Nimbus": "Urban VIII formally prohibited giving the nimbus to persons who were not beatified", and the nimbus "by the omission of the circumference, may be transposed into a garland of rays or a glory".
  - The Catholic Encyclopedia does not itself state the saints/blesseds distinction; the New Catholic Encyclopedia does. Copies are in `../consult/batch-43/` (`encyclopedia-halo.*`, `Halo.txt`, `cathen-nimbus.*`).
- What changed in `../batches/batch-54.json`, `fulton_sheen` only:
  - a new `"frame"`, which `gen-batch.sh` passes to `new-card.sh` as `FRAME` in place of the default: "an inner arched, gold-edged window holding the scene; the figure has NO ring halo and NO disc halo: instead the rays of a Blessed, fine straight gold rays of light spreading from behind the head like a sunburst, with no circle round them";
  - one sentence added to `subject`, before "Radiant, warm and persuasive": "He is a Blessed, not yet canonized: behind his head there is NO halo ring and NO gold disc, only a glory of fine, straight gold RAYS spreading outward from behind the head, with no circle round them."
  - Face, refs, excerpt and everything else are as they were.
- **The card awaits regeneration.** The image and the card file are untouched. To redraw: `research/holy-card-faces/gen-batch.sh batches/batch-54.json fulton_sheen`, review the draft, copy it over `content/saints/fulton_sheen.png` by hand and add a dated `history` line to the card file. `accept-batch.py` is not for this: it takes a whole batch and stops on the catalog lines already ticked.
- Reject a draft with any ring, disc or dotted circle behind the head (the three reference cards all have one, and the model may copy it), and one with no glory at all. The face should stay the one on the present card.
- **Other Blesseds with the full halo, not changed.** Of the cards on main, two more show someone beatified and not canonized under the same gold disc: `inacio_azevedo` ("Bl. Ignatius de Azevedo and Companions", beatified 1854; the Martyrology of 2004 has "beatórum mártyrum Ignátii de Azevedo … atque trigínta et octo sociórum" on 15 July), both figures haloed; and `veronica_milan`, whom the book and the card call "St." but the Martyrology of 2004 calls "beátæ Verónicæ de Binásco" (13 January; Leo X allowed her cult in 1517, and she was never canonized). `peter_luxemburg` (batch 31, "Bl.", not generated yet) has no `frame` either. Checked: every card whose name begins "Bl.", and the doubtful older names against the Martyrology of 2004 (`../consult/batch-43/martyrologium-2004.txt`), where Benezet, Herman Joseph, Catharine of Sweden, Jane of Valois, John de Britto, Gontran, Bathildes, Maud, Aelred, Zita, Colette and Stanislas Kostka are all "sancti". It is not a card-by-card audit of all 352 saints.

## Doubts

- **Sheen's excerpt** is spoken and second-hand (a friend's recollection, via Cardinal Tagle); no written source of his was used because his books are in copyright. Choose it or the "porter" line.
- **Hernández's excerpt**: the Spanish is widely quoted (the foundation's site, the press, the Dicastery in Italian), but none gives the letter or notebook it comes from.
- **Zatti's motto** is three words; the fuller sentence varies between sources.
- **Acutis's pt-BR and en-US** are literal and will match any other translation of seven words.
- **Poloni has no likeness from life**; the face follows the two 19th-century painted portraits.
- **Zatti's memorial (13 November)** is not his death day (15 March), and no source explains it; the card follows the Dicastery.

## Look-alike risks that remain

- **Hernández and Zatti** (two moustached laymen in one batch): Hernández round, smooth, grave, in hat and black suit; Zatti square, high-cheekboned, tousled, laughing, in a white coat with a bicycle. Reject a hat or a black suit on Zatti.
- **Longo against `maximilian_kolbe`**: reject round wire spectacles and a narrow pointed beard; Longo has a pince-nez, a broad bushy beard and a lay frock coat.
- **Sheen against `giovanni_battista_scalabrini` and `paul_vi`**: reject a square chin, white or bald head; Sheen's hair is dark and wavy, the eyes large and intense.
- **Acutis against `pier_giorgio_frassati`**: reject hair brushed up and a square jaw; Acutis has dark curls and full cheeks.
- **Troncatti against `teresa_calcutta`**: the round spectacles, broad smile and black-and-white habit are the check.
- **Poloni against `maria_santocanale` and `elena_guerra`**: the long prominent nose, sideways glance and small wry mouth.
- **Foucauld against `camillus`**: white gandoura, lean triangular face, short beard; reject a black habit or full beard.
