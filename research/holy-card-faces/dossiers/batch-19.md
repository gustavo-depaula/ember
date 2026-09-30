# Batch 19 — the Pictorial Lives, 2 to 11 January

Ten cards, the first ten unclaimed lines of "From the Pictorial Lives of the Saints": `fulgentius`, `macarius_alexandria`, `genevieve`, `gregory_langres`, `simeon_stylites`, `lucian_antioch`, `apollinaris_hierapolis`, `julian_basilissa`, `william_bourges`, `theodosius_cenobiarch`. St. Peter's Chair at Rome (18 Jan) is skipped here because batch 18 already claims it. The card data is in `../batches/batch-19.json`, written by `../consult/batch-19/build.py`. That script checks each excerpt verbatim in both languages, checks that each `lifeChapter` exists in en-US and pt-BR and that the one `proper` resolves to exactly one formulary, and checks each feast against the index day. It also confirms that each catalogMatch hits one unticked line no other batch claims, and that no id collides with `content/saints/` or another batch. The consulted pictures and Wikipedia extracts are saved in the same folder (`*.jpg`, `*.txt`, `*.json`).

**Dates, names, initials.** Feasts follow the book (the index day keys 01-02 … 01-11). Names are the book's own, tidied, with a see or place added where a bare name would be ambiguous in the set: "St. Gregory of Langres" (the book has "St. Gregory, Bishop"), "St. William of Bourges" (the book has "St. William, Archbishop"). The initials are F, M, G, G, S, L, A, J, W, T.

**lifeChapter.** Every card has its own chapter, and all ten are checked. Two dates need care:
- **2 Jan** has two chapters. The index points at `jan-02-macarius-of-alexandria`, but its reflection is the one from `jan-02-fulgentius`. So each card names its own chapter, and Macarius takes his excerpt from his own chapter's reflection rather than the index.
- **4 Jan** has `jan-04-titus` and `jan-04-gregory`. Titus is already on `timothy_titus`. Gregory's chapter has **no Reflection paragraph**, so his card will carry no reflection. Its excerpt comes from the Common of Pastors (for a bishop), `past1.json` entrance antiphon.

**proper.** Only Genevieve has a formulary of her own in the repo: `sanctorale.01-03.france` (the French proper, optional memorial). No formulary exists under `content/of/formularies/` for the other nine; I searched by date folder and by name. **Caveat:** that formulary's collect exists only in French, and `useSaintCollect` falls back to `en-US`, then `la`. So in en-US and pt-BR the collect slot will stay empty until the formulary gains those languages. Also note that `accept-batch.py` copies `lifeChapter` into the card file but not `proper` yet.

**Excerpts.** Eight come from that day's reflection in the index, which is also the chapter's last paragraph: a whole reflection or one sentence of it, as `excerptSource` records. Macarius takes his from his own chapter, and Gregory from the Common, as explained above. Everything is verified verbatim by `build.py`.

## Structures across the batch

| | Age | Structure | Hair and beard |
|---|---|---|---|
| Fulgentius | 65 | short, broad, flat cheekbones, low flat-bridged nose, round wide-set eyes | bald crown, grey-black curly fringe; short grizzled beard |
| Macarius | 75 | wide, low, rounded-square, smile-creased narrow eyes | hooded; thin, sparse grey beard |
| Genevieve | 20 | broad, square-jawed, wide-set grey-green eyes | flaxen braids under a white veil |
| Gregory of Langres | 85 | long face on a heavy lantern jaw, high-bridged nose, deep nasolabial lines | short white; short white beard along the jaw |
| Simeon Stylites | 65 | small, narrow, chiselled, sharp cheekbones, hollow cheeks, fine aquiline nose | hooded; short grey beard forked in two |
| Lucian | 60 | broad-browed, short, domed forehead, square chin | iron-grey combed forward; short rounded beard |
| Apollinaris of Hierapolis | 60 | broad full oval, hooked nose, arched dark brows | balding, black greying; thick black square-cut beard |
| Julian | 45 | kite-shaped, angular cheekbones, small firm chin | grey-streaked dark; short beard |
| Basilissa | 35 | long, slender, long neck, almond eyes | dark, under a white veil |
| William of Bourges | 65 | wide, short, flat profile, high rounded cheekbones, broad chin | tonsured brown-grey; short brown-grey beard |
| Theodosius | 90 | broad, flat-planed, full high cheekbones, soft rounded cheeks | bald with white wisps; long white beard forked in two |

## St. Fulgentius (2 Jan)

Face: an olive-brown North African of about sixty-five with a short, broad face, flat cheekbones, a low flat-bridged nose, round wide-set eyes and full lips. His crown is bald, with a fringe of cropped grey-black curls, and he has a short grizzled beard.

- The seventeenth-century portrait on Wikipedia (local `Fulgentius_of_Ruspe.jpg`, inscribed "S. Fulgentius Episcopus Ruspensis"), which I checked: bald with a fringe, a full greying beard, a soft broad face, a black habit and a white pallium with black crosses, a crozier and an open book. The card keeps the dress and the bald crown with the full beard.
- Wikipedia: born 462 at Telepte (today's Tunisia) of a senatorial family, a tax procurator before becoming a monk, then Bishop of Ruspe, exiled to Sardinia. The book: after Thrasimund's death he "retired to an island monastery" for his last year. That gives the setting of a white monastery on a low island off the Tunisian coast; the island's look is our choice.
- He should not look like `augustine`, also North African: Augustine has close-cropped dark hair and a short dark beard, Fulgentius the bald crown, the grizzled beard and the flat, broad face.

## St. Macarius of Alexandria (2 Jan)

Face: an Egyptian of about seventy-five, deep bronze, with a wide, low, rounded-square face, smile-creased narrow eyes, broad cheeks, a wide mouth and a thin, sparse grey beard under a dark hood.

- Painter's Manual (Didron, `consult/prelates-src/didron-fr.txt` l. 15099): "Saint Macaire d'Alexandrie : visage souriant", a smiling face, the only mark it gives. The card is built around the smile.
- The icon on the Blaj iconostasis (Wikipedia lead image, local `Macarius_of_Alexandria.jpg`), which I checked: a dark monastic hood, a short, thin brownish beard, a long face. I kept the hood and the thin beard. The long face is not kept, to stay clear of the set's many long-faced hermits.
- Book: he left his fruit stall at Alexandria for the desert, carried a basket of sand ("I am tormenting my tormentor"), and passed on the grapes he was given, which went round the desert and came back to him untouched. Hence the basket and the grapes. Wikipedia: born c. 300, died 395, a monk of the Nitrian desert. Hence the setting and his old age.
- The book's engraving (Macarius with a disciple before St. Pachomius) shows a long-bearded monk. I followed the Manual's smile and the icon's thin beard instead, because another long-bearded elder would repeat `anthony_abbot` and `francis_paola`.

## St. Genevieve (3 Jan)

Face: a fair young woman of about twenty with a broad, square-jawed face, wide-set grey-green eyes, straight fair brows and a wide calm mouth. Her flaxen braids fall from under a white veil.

- No likeness survives. The book's engraving shows the little shepherdess with a crook and sheep, met by St. Germanus. Wikipedia's iconography section: the commonest image shows her holding a candle, with a demon trying to put it out and an angel relighting it. The shepherdess type is a later tradition that became "immediately popular". The card keeps the lit candle, the crook and two sheep. It leaves out the demon and the angel, so the window stays uncluttered.
- Setting: the Seine and the walled Gallo-Roman city on its island, with a small early church, for the patroness of Paris (Wikipedia). There is no Notre-Dame, which would be anachronistic.
- Age: she died at eighty-nine, but both the book's engraving and the popular image show her young. The square-jawed peasant face is our choice, against the set's oval-faced virgins.
- `proper`: `sanctorale.01-03.france` ("Sainte Geneviève, vierge", French text only; see above).

## St. Gregory of Langres (4 Jan)

Face: a Gallo-Roman patrician of about eighty-five with a long face on a heavy lantern jaw, a large high-bridged nose, small heavy-lidded pale-grey eyes and deep lines from nose to mouth. He has short white hair and a short white beard clipped along the jaw.

- Book: a senator of Autun, widowed, consecrated Bishop of Langres at fifty-seven, and he governed for thirty-three years. So he was about ninety at death, and the card paints him about eighty-five. The book's engraving shows him mitred with a short beard, standing before two angels.
- Wikipedia: born around 446, count of Autun, bishop of Langres 506–539.
- Setting: a Romanesque cloister opening on the walled hill town of Langres. The architecture is our choice (a devotional anachronism, as on other cards).
- Excerpt: the Common of Pastors, because the chapter has no Reflection and there is no formulary of his own.

## St. Simeon Stylites (5 Jan)

Face: a Syrian ascetic of about sixty-five with a small, narrow, sharply chiselled face, sharp cheekbones over hollow cheeks, a fine aquiline nose and large deep-set eyes lifted to heaven. He wears a hood and a short grey beard forked in two.

- Painter's Manual (l. 15110): "Saint Siméon le Stylite : vieillard, barbe courte, séparée en deux", an old man whose short beard is parted in two. The card follows it.
- The sixth-century silver plaque in the Louvre (Wikipedia lead image, local `Simeon_Stylites.jpg`): hooded, on the railed platform of his column. The book's engraving shows him kneeling at the railing with arms outstretched. The card combines the two: arms raised at the railing, half-length.
- Wikipedia: died 2 September 459 after about thirty-six years on the pillar near Aleppo. The book gives c. 401 as the start of his monastic life, while still a child, so he was about sixty-five to seventy at death.

## St. Lucian (7 Jan)

Face: a Syrian of about sixty with a broad-browed, short face, a domed forehead, a short straight nose, intent narrowed eyes and a square chin. His iron-grey hair is combed forward, with a short rounded beard.

- The Menologion of Basil II (Wikipedia lead image, local `Lucian_of_Antioch.jpg`), which I checked: Lucian seated in prison, in a pale tunic, with dark short hair and a short beard. The card keeps the pale tunic and the short beard.
- The Painter's Manual has three Lucians (a young beardless one, a grey-haired one with a rounded beard, an old one), and it is unclear which is ours. I took nothing from it.
- Book: born at Samosata, a priest who revised the text of the Old and New Testaments. Hence the codex, pen and scrolls. The palm is for his martyrdom. The book's prison Eucharist is not shown, to avoid chains. The setting is Antioch: his vita says he founded a school, and scholars since Harnack take him as the first head of the School of Antioch (Wikipedia).
- The id is `lucian_antioch` (the name he is known by), while the card name stays the book's "St. Lucian".

## St. Apollinaris the Apologist (8 Jan)

Face: a Greek of Asia Minor, about sixty, with a broad, full oval face, a crown going bald, a large, gently hooked nose, lively brown eyes under arched dark brows and full cheeks. His black hair greys at the temples, and his thick black beard is cut square and streaked with grey.

- No likeness survives. The book's engraving for this chapter shows a mitred bishop with a short beard. The book: Bishop of Hierapolis in Phrygia, known above all for the apology he addressed to Marcus Aurelius about 175. Hence the scroll and the speaking gesture.
- Dress: second-century, so no mitre. We give a paenula and pallium, as on the early mosaics the set already uses for `apollinaris`.
- Setting: Hierapolis with its colonnade and theatre above the travertine terraces (Wikipedia, Hierapolis). That is the real site.
- He must not be confused with `apollinaris` (of Ravenna, batch 13). That card has a short, wide-cheeked face, a white forward fringe and a short, pointed white beard. This one has a full oval, a hooked nose, a balding crown and a black, square-cut beard.
- The two engravings may be swapped: `jan-07-lucian.webp` carries a "January 8" running head and shows a writing bishop, and `jan-08-apollinaris-the-apologist.webp` shows a bishop speaking to a young man. I relied on neither for the face.

## Sts. Julian and Basilissa (9 Jan)

Faces: Julian (left) is an Egyptian man of about forty-five with a kite-shaped face, angular cheekbones, a small firm chin and kind deep-set hazel eyes. His dark hair is grey-streaked, with a short beard. Basilissa (right), about thirty-five, has a long, slender face and neck, a long straight nose, large dark almond eyes and gently hollowed cheeks. She wears a white veil.

- The book's engraving: Julian bearded in a plain tunic, Basilissa veiled with a tray of phials, among the sick in their hospital. The card follows it. Book: a married couple living in continence who made their house a hospital. She "died in peace", he was martyred later. So the palm is his alone.
- Batoni's altarpiece (Wikipedia lead image, local `Julian_and_Basilissa.jpg`): Julian bearded with a palm, Basilissa in blue.
- Wikipedia: martyrs "at either Antioch or, more probably, at Antinoe" in Egypt. The book says Egypt, hence the Nile at Antinoë.
- Painter's Manual, calendar of martyrs, 6 January (l. 17383): "Saint Julien : cheveux gris", grey hair. The Roman Martyrology's date for this pair is 6 January (Wikipedia), but the identification is uncertain, so the grey is only a streak.

## St. William of Bourges (10 Jan)

Face: a Frenchman of about sixty-five with a wide, short face and flat profile, high rounded cheekbones, a short broad nose, heavy-lidded gentle blue-grey eyes and a broad chin. His brown-grey hair is cut around the tonsure, with a short brown-grey beard.

- A modern mural of "S. Guillelmus" (Wikipedia lead image, local `William_of_Donjeon.jpg`), which I checked: mitred, with short brown hair and a short brown beard, holding a church. The book's engraving: in the Cistercian habit before an altar with a monstrance, receiving the news of his election.
- Wikipedia: born c. 1140, a canon of Soissons and Paris, then in the Order of Grandmont, then a Cistercian (Pontigny, Chaalis), and Archbishop of Bourges 1200–1209. Known for his devotion to the Blessed Sacrament, and he oversaw the new cathedral, whose choir was almost finished in December 1208. Hence the white cowl under the pallium, the monstrance and the choir of Bourges in scaffolding.
- He must be told apart from `bernard_clairvaux`, the other white Cistercian.

## St. Theodosius the Cenobiarch (11 Jan)

Face: a Cappadocian of about ninety with a broad, flat-planed face, full high cheekbones over soft rounded cheeks, a short broad nose and small kindly eyes. He is bald with white wisps, and his long white beard is forked in two.

- Painter's Manual (l. 14845): "Saint Théodose, le chef des cénobites : vieillard, barbe divisée en deux", an old man whose beard is divided in two.
- The icon with scenes of his life (Wikipedia lead image, local `Theodosius_the_Cenobiarch.jpg`): a long beard, a red-brown mantle over a dark habit.
- Book: born in Cappadocia in 423 and died at a hundred and six. He lived in a cave near Bethlehem, and his disciples grew into a great monastery; he served the poor ("on some days the monks laid more than a hundred tables for those in want"). Hence the cave, the monastery in the Judaean desert, and the bread.
- The sources call for a long white beard. The broad, soft-cheeked structure has to separate him from `romuald` (a long face under a bald dome) and `anthony_abbot` (triangular).

## Look-alike risks that remain

- **Three desert elders in one batch** (Macarius, Simeon, Theodosius), plus `anthony_abbot`, `romuald` and `francis_paola` already made. The structures differ (wide and smiling; small and chiselled; broad and soft), and so do the beards (sparse, short and forked, long and forked). Put the three on one face sheet with those older cards.
- **Theodosius** still risks the stock white-bearded elder the brief warns about. The Manual's forked beard, the soft broad cheeks and the bread have to carry him.
- **Fulgentius against `augustine`**: both are North African bishops in black with olive-brown skin. Reject a draft that gives Fulgentius a full head of dark hair.
- **Apollinaris of Hierapolis against `apollinaris`**: the same name, both early bishops without a mitre. Check the beard colour and cut, and the face shape.
- **Gregory of Langres** is one more aged mitred bishop. Reject him if the lantern jaw comes out as a plain long face like `damasus` or `martin_i`.
- **William against `bernard_clairvaux`**: both in white Cistercian cowls. William has the mitre, the pallium and the monstrance.
- **Genevieve**: the generator may soften the square jaw into the set's usual oval virgin. Check it against `agnes` and `clare_assisi`.
