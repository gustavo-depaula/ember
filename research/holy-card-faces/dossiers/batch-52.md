# Batch 52: canonized since 2022, 14 January to 9 May

Ten cards from the first ten lines of "Canonized since 2022", in the section's date order: `lazarus_devasahayam`, `maria_santocanale`, `maria_domenica_mantovani`, `marie_rivier`, `giuseppe_allamano`, `mama_antula`, `elena_guerra`, `cesar_de_bus`, `marie_leonie_paradis`, `carmen_rendiles`. Batches 53–54 take the rest of the section, from Palazzolo (22 May).

The card data is in `../batches/batch-52.json`, written by `../consult/batch-52/build.py` from `cards.py`. The script checks:
- each excerpt's original-language wording against the saved copy of the source it cites, and a second witness where there is one;
- that the one formulary excerpt is verbatim in en-US and pt-BR;
- each feast against the catalog line and against the "Memoria liturgica" field of the saved Dicastery page (`../consult/canonizations/`);
- that no OF formulary title and no OF calendar entry in the repo names any of the ten, and that no card has `proper` or `lifeChapter`;
- that each catalogMatch hits one unticked line among the section's first ten, in order, and that no other batch claims it;
- the pt-BR names against the catalog, ids, initials, refs, and that every portrait used is saved.

Consulted material is in `../consult/batch-52/`:
- the Dicastery portraits (`causesanti-*.jpg`, sheet `causesanti-sheet.jpg`) and biographies (`causesanti-*.txt`);
- Wikipedia summaries and extracts (`*.json`, `*.txt`);
- Commons originals (`*.orig.*` and named copies, with `*.meta.json`; sheets `wiki-sheet.jpg`, `wiki-sheet-2.jpg`, `rivier-sheet.jpg`, `rendiles-sheet.jpg`) and face crops (`faces-crop*.jpg`);
- the quote sources (`src-*.html` / `.txt`, `src-antula-novena.pdf`);
- existing cards compared (`existing-sheet.jpg`) and every face line of batches 1–28 (`faces-all.txt`).

`fetch.sh`, `sheet.py` and `totext.py` are the tools.

**Dates, names, initials.** Each feast is the Dicastery's memorial, as the catalog gives it. None of the ten is on the General Calendar. Names follow the catalog. The one tidy is the en-US **"St. María Antonia (Mama Antula)"** / pt-BR "Santa Maria Antônia (Mama Antula)", which shortens the catalog's "de Paz y Figueroa" to fit the card. Initials: L, M, M, M, G, M, E, C, M, C.

**proper.** None. No OF formulary in the repo, in any language, names any of the ten, and neither does `content/of-data/calendar`. The universal formularies on these dates are other saints and feasts: Angela Merici, the Presentation, Blase, Perpetua and Felicity, Stanislaus, Philip and James, and France's Louise de Marillac on 9 May.

**Excerpts.** Where they have them, the excerpts are the saints' own short, attested words. All ten died before 1930 except Mantovani (1934) and Rendiles (1977). Theirs are single short quotations. **Every rendering is ours**, from the Italian, French or Spanish original saved beside it. No published en-US or pt-BR version was used. Devasahayam left no recorded words, so his card uses the Common of Martyrs (one martyr, outside Easter Time 2), whose communion antiphon ("Whoever follows me will not walk in darkness…") suits a convert. It is verbatim in both languages.

## St. Lazarus Devasahayam (14 January)

- The Dicastery: Nilakandan Pillai, a Nair official of the Travancore palace, was drawn to Christ through the Dutch prisoner De Lannoy. He was baptized in 1745 as Devasahayam (Lazarus, "God's help"), arrested in 1749, and tied to a tree for months. He was shot on a hillock in the forest of Aralvaimozhy on 14 January 1752. Wikipedia names the hillock Kaattadimalai.
- No likeness from life survives. The traditional image, which is the Dicastery's picture and the painting and Kottar cathedral statue on Commons, shows a man with long black hair and a full black beard, kneeling bare-chested in a white veshti with chains at his wrists.
- The card keeps the hair, beard, veshti and chains, and adds a shawl across the chest. The face is broad and square, with a low forehead, a low-bridged broad nose, thick brows and a beard trimmed round. That structure keeps a long-haired, bearded young martyr from reading as Christ.
- **Against `moses_the_black`, `charles_lwanga` and `andrew_dung_lac`** (lean, long-jawed): Devasahayam is square, low-browed and full-bearded, with long hair.

## St. Maria of Jesus Santocanale (27 January)

- The Dicastery and Wikipedia: born in Palermo in 1852 to a noble family, she became a Capuchin tertiary in 1887 and went door to door among the poor. At Cinisi she founded the Capuchin Sisters of the Immaculate of Lourdes, and died on 27 January 1923.
- Her photograph shows a long, narrow face, a long high-bridged nose, large dark eyes with drooping outer corners, a long upper lip and a small mouth. She wears a black veil and white wimple. Famiglia Cristiana quotes a sister: "bella, alta, dai lineamenti fini".
- **The habit's colour is not verified**, because the photograph is monochrome. The card gives the brown of the Capuchin family with a white cord.
- Excerpt: her last words to her sisters, reported by Famiglia Cristiana, shortened at the source's own ellipses.
- **Against `hildegard`, `elizabeth_portugal` and `elena_guerra`** (the other long faces): her brows slope down, her eyes droop, and she has hollow temples and a small, full mouth. Guerra is heavy-browed and square-chinned.

## St. Maria Domenica Mantovani (2 February)

- The Dicastery: born in 1862 at Castelletto di Brenzone on Lake Garda. With Bl. Giuseppe Nascimbeni she co-founded the Little Sisters of the Holy Family and was its first superior. She died on 2 February 1934.
- Her photograph shows a face broad in its lower half under a narrower brow, small eyes narrowed by a smile, raised brows, a broad-tipped nose and a wide mouth. She wears a black veil and a wide, round white collar with a medal.
- Excerpt: her written resolution "Con l'aiuto della Sacra Famiglia sarò tutta a tutti" (Città Nuova). The Dicastery says she made herself "tutta a tutti".
- **Against `catherine_ricci`** (moon face, flat cheeks), `veronica_milan` (short, broad, apple cheeks) and `jane_frances_chantal`: Mantovani is pear-shaped, widest at the jaw, and smiling.

## St. Marie Rivier (3 February)

- The Dicastery and Wikipedia: she was crippled in infancy and healed. She began teaching children at Thueyts during the Revolution, founded the Presentation of Mary in 1796, and moved the motherhouse to Bourg-Saint-Andéol. She died there on 3 February 1838. The beatification homily quoted by the Dicastery mentions her "mancata crescita fisica", so she is shown small.
- There is no photograph. The painted portrait published by the diocese of Viviers (`Rivier-ardeche.jpg`) and the nineteenth-century window in the motherhouse chapel agree on a round, soft, jowled face with heavy lids, a long, fleshy-tipped nose, a small half-smile and the head tilted. **The portrait's date and painter are not established**, so it may be posthumous.
- Excerpt: from a letter, as the congregation quotes it on its page of her letters.
- **Against `catherine_ricci`** (short broad nose, moon face) and `bathildes` (round, young): Rivier is old and jowled, with drooping lids, a long nose and her head tilted.

## St. Giuseppe Allamano (16 February)

- Wikipedia (it) and the Dicastery: born in 1851, nephew of St. Joseph Cafasso and a pupil at Don Bosco's Valdocco. He was rector of the Consolata from 1880, founded the Consolata Missionaries in 1901 and the Missionary Sisters in 1910, and died on 16 February 1926.
- His photograph shows a long, lean face, short white hair under a black skullcap, deep-set crinkled eyes, a long prominent nose, deep smile creases, a wide smile and prominent ears.
- Excerpt: his motto "Prima santi, poi missionari", with his own fuller words, from consolata.org.
- **Against `pius_x`** (broad, handsome, silver), `john_bosco` (square, curly), `paul_vi` (narrow, aquiline, unsmiling) and `peter_julian_eymard`: Allamano is long and lean but broadly smiling, with big ears, a long straight nose and his head turned.

## St. María Antonia de Paz y Figueroa, "Mama Antula" (7 March)

- Wikipedia (es) and the Dicastery: born in 1730 at Silípica, Santiago del Estero, she became a beata of the Society of Jesus at fifteen. After the expulsion of 1767 she walked barefoot through the north and on to Buenos Aires, giving the Spiritual Exercises. She founded the Santa Casa de Ejercicios and died on 7 March 1799.
- Her portraits are José de Salas's (Commons, dated 1799) and an anonymous colonial one. Both show a smooth, long oval, large wide-set light eyes under high arched brows, a long straight nose and a small mouth. She wears the black mantle and white toca, with a cross-staff and a book. Spanish Wikipedia calls her "hermosa y de distinguida presencia".
- **The excerpt's wording varies between witnesses** ("no fuese conocido" / "no es conocido para hacerlo conocer" / "no sea conocido"), and I did not locate the letter itself. The card renders the shared sense. A Radio María page I had listed turned out to be a 404 and was dropped.
- **Against `margaret_scotland`, `hedwig` and `elizabeth_portugal`** (long ovals): Mama Antula is smoother and younger-looking, with wide-set large eyes, high arches and a small mouth. Her criolla complexion and the toca also set her apart.

## St. Elena Guerra (11 April)

- The Dicastery and Wikipedia (it): born in Lucca in 1835 to a noble family, she founded the Oblates of the Holy Spirit in 1882 and taught the young Gemma Galgani. She wrote thirteen letters to Leo XIII, which led to the novena of Pentecost and *Divinum illud munus*. She died on 11 April 1914.
- Her photograph shows a long, strong face with thick, low, level brows, hooded deep-set eyes, a long nose with a rounded tip, long cheek creases, a wide thin mouth and a square chin, in a black veil and white collar.
- Excerpt: her memory of the Pentecost novena, from L'Osservatore Romano and the Dicastery. Her better-known line "Pentecost is not over" is only in English (EWTN) in what I found, with no located Italian, so it was not used.
- **Against `hildegard`** (narrow, noble, eyes raised), `rita_cascia` and `maria_santocanale`: Guerra has the heavy low brows, the hooded eyes and the square chin.

## St. César de Bus (15 April)

- The Dicastery and the diocese of Avignon: born at Cavaillon in 1544, he was a soldier and courtier, converted, and was ordained in 1582. He founded the Fathers of Christian Doctrine at L'Isle-sur-la-Sorgue in 1592 and moved to Avignon. He went blind in later life but kept preaching and confessing, and died on Easter morning, 15 April 1607.
- The Carnavalet portrait (about 1607) and the engraving of about 1726 show a long face, receding dark hair, heavy half-lowered lids, a long nose, a drooping moustache and a short beard, in a black soutane with a white collar and his hands joined.
- Excerpt: his saying on his blindness, as the Dicastery gives it. The diocese of Avignon's French version looks translated back from the Italian, so the rendering is ours from the Italian.
- **Against `camillus`** (heavy square jaw, full beard, receding dark hair; see the sheet), `peter_canisius` and `vincent_de_paul`: De Bus has a narrow jaw, a beard close on the cheeks and pointed at the chin, a drooping moustache and lowered lids.

## St. Marie-Léonie Paradis (3 May)

- Wikipedia and the DCB: born at L'Acadie in 1840, she was first a Marianite Sister of Holy Cross. She founded the Little Sisters of the Holy Family in 1880 to keep house for priests and colleges. The motherhouse moved to Sherbrooke in 1895, and she died there on 3 May 1912.
- Her 1906 photographs show a wide, flat, rectangular face in a stiff white coif, straight heavy brows, small deep-set eyes, a short nose, a long flat upper lip and a thin, straight mouth. The 1872 photograph, in her first congregation's fluted bonnet, was not used.
- Excerpt: her counsel on humility (Vatican News; a fuller form in Marie de Nazareth).
- **Against `jane_frances_chantal`** (broad, square face in a white coif and black veil; see the sheet) and `maud` (broad, square, prominent jaw): Paradis's marks are the long flat upper lip, the thin straight mouth, small deep-set eyes and a short nose. Chantal's nose is long and strong.

## St. Carmen Rendiles (9 May)

- Wikipedia and Vatican News: born in Caracas in 1903 without a left arm, she wore a prosthesis. She entered the Servants of Jesus in the Blessed Sacrament in 1927 and founded its Venezuelan branch, the Servants of Jesus. She died on 9 May 1977.
- Her later photographs (the Dicastery's portrait and the congregation's) show a long face, high cheekbones, centre-parted dark hair under a white veil, a long straight nose, arched brows and a wide, warm smile, in a grey-blue habit with a wide white collar. A photograph of her in the 1920s (`Rendiles-young.jpg`) confirms the structure.
- The card shows only her right hand, with the veil falling over the left side, without drawing attention to it.
- Excerpt: "quiero ser santa, como San Pablo…", as Cardinal Amato quoted her (Vatican News 2018; Italian on the Dicastery page). It is a short quotation from a saint who died in 1977.
- **Against `elizabeth_portugal`** (long rectangular, grave) and `teresa_calcutta` (small, pointed chin): Rendiles has the high cheekbones, a broad smile, visible parted hair and a white veil.

## Doubts

- **Mama Antula's excerpt** is her best-known saying, but its wording differs in each witness and the letter was not located. The alternative is a Common of Virgins or Holy Women antiphon.
- **Rivier's face** rests on a painted portrait and a window of unknown date, possibly both posthumous.
- **Santocanale's habit colour** (brown) is inferred from the Capuchin family, not from a colour source.
- **Allamano's excerpt** is the motto as his missionaries give it, not a sentence located in his writings. His fuller words are in the same source.
- **Mama Antula's shortened name** on the card.

## Look-alike risks that remain

- **Paradis against `jane_frances_chantal`**: both are broad-faced nuns in a white coif and black veil. Reject a long, strong nose or grey-blue wide-set eyes. Paradis has a short nose, small deep-set eyes, a long flat upper lip and a thin mouth.
- **De Bus against `camillus`**: both are bearded priests in black with receding dark hair. Reject a full, square beard. De Bus has a pointed chin beard, a drooping moustache and lowered lids.
- **Santocanale against Guerra** in this batch (two long-faced Italian nuns in black veils): Santocanale's brows and eyes slope down and her mouth is small; Guerra's brows are heavy and level, her mouth wide and her chin square.
- **Devasahayam against a Christ face**: reject a long oval or a pointed beard.
- **Mantovani and Rivier against `catherine_ricci`**: reject a moon face for either. Mantovani is pear-shaped and smiling; Rivier is old, jowled and tilted.
- **Five nuns in dark veils in one batch** (Santocanale, Mantovani, Rivier, Guerra, Paradis): the habits differ (brown and white wimple; wide round collar; hooded veil and shawl; plain veil and collar; stiff coif and bib). Check that each draft keeps its own.
