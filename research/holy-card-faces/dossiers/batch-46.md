# Batch 46: the parts of the Mass, from the Greeting to the Gospel

The next ten items of "## Parts of the Mass" after batch 45's Entrance, in catalog order: the rest of the Introductory Rites (Greeting, Penitential Act, Kyrie, Gloria, Collect) and the Liturgy of the Word up to the Gospel (First Reading, Responsorial Psalm, Second Reading, Gospel Acclamation, Gospel). No portraits: `face` is `-`. Every card carries the pointed Gothic arch of `batches/README.md` step 4 and no `box`, like `entrance`. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`.

`consult/batch-46/build.py` writes `batches/batch-46.json` and checks it: every excerpt against its source text, rebuilt from the repo (`order-of-mass.json`, the Ordinary Time formularies, the people's replies in `apps/app/src/sources/of/responses.ts`) with only the edits named in `excerptSource`; the Order of Mass rubrics the scenes rely on; the GIRM sentences the bases quote, in the saved copies; the frame against the README template; no `box`, `feast` or `proper`; the initials; the white-and-gold priest; the ten items against the catalog order after batch 45; ids against `content/saints/` and every batch; and each `catalogMatch` by the rule `accept-batch.py` uses, ticking in batch order. It prints OK.

**No `feast`, no `proper`.** A part of the Mass has neither (README, "Before cards without a fixed date ship").

**Sources consulted**, saved in `consult/batch-46/`: the GIRM (USCCB edition) chapter 2, nos. 42–67 (`girm-en-ch2.*`: postures 43, silence 45, the Introductory Rites 46–54, the readings, Psalm, Alleluia and Gospel 55–64). From batch 45's folder, GIRM chapter 4 (`girm-en-ch4.*`: 117 candles, 118 the Missal next to the chair, 124–134 the rites at the chair and the ambo, 171–175 the deacon, 189 the acolyte presents the book, 194–196 the reader); from batch 44's, chapter 5 (305 flowers, 309 the ambo, 310 the chair facing the people). In the repo: the rubrics of `content/of/order/order-of-mass.json` (the Greeting "abrindo os braços, saúda o povo"; the Confiteor "striking their breast"); the reading slots of `content/of/formularies/tempore/ordinary-time/week-{2,11,13}/sunday.json` and their renderer `apps/app/src/sources/of/blocks/readings.ts`.

## Decisions

1. **Where the excerpts come from.** The Order of Mass in the repo has the Greeting, Penitential Act, Kyrie and Gloria, but no Collect and no Liturgy of the Word: the Collect is a proper, and the readings with their acclamations ("The Word of the Lord." / "Palavra do Senhor.", the Gospel's announcement) live in each formulary's `readings`, the people's replies in `responses.ts`. So those six cards take their words from a Sunday formulary, chosen for an en-US / pt-BR pair that says the same thing: the Second Sunday in Ordinary Time (the Collect's Trinitarian conclusion; Year A's First Reading; Year C's Second Reading from 1 Corinthians and Gospel from John, the Wedding at Cana), the Eleventh (Year A's Psalm 100 response, "We are his people: the sheep of his flock"), the Thirteenth (Year C's Alleluia verse, "Speak, O Lord, your servant is listening"). All is ICEL / Lectionary / CNBB text the app already ships.
2. **The priest at the chair.** The Introductory Rites after the Entrance are said at the chair, which faces the people (GIRM 124, 127, 310), not at the altar. The ad orientem convention of batches 44–45 applies at the altar (the Gospel Acclamation card); at the chair the priest is still painted from behind or in profile, never as a portrait.
3. **No deacon.** The Gospel is proclaimed by the priest, as GIRM 133–134 give it when no deacon is present, so the white-and-gold priest carries the Liturgy of the Word's climax and the cards need no dalmatic.
4. **Readers are laymen, the psalmist a young man in cassock and surplice.** Alb for the First Reading, a dark suit for the Second (GIRM 194 "approved attire"; both are usual), so the two reading cards differ in more than angle. All ministers are male; a woman reader or cantor is equally within the rubrics if wanted.
5. **Sunday Masses throughout**, since the Gloria, a Second Reading and (in practice) incense and a sung Psalm belong to Sundays and feasts. The Gloria card is a great feast: six candles, flowers around the altar, and the angels' song of Luke 2:14 painted as a vault fresco (angels over shepherds, no Christ or Our Lady, so no recurring figure).
6. **catalogMatch "Gospel"** is also the start of "Gospel Acclamation" on the same catalog line. `accept-batch.py` ticks the cards in batch order, so the Acclamation is ticked first and "[ ] Gospel" is then a single whole item; `build.py` simulates exactly that. Keep the two cards in this order.
7. **Names.** The catalog's names; pt-BR as the repo labels them: "Saudação", "Ato Penitencial", "Senhor, tende piedade" (the Order of Mass's title for the Kyrie), "Glória", "Oração do Dia" (the Collect's label in `structures/mass.ts`), "Primeira Leitura", "Salmo Responsorial", "Segunda Leitura", "Aclamação ao Evangelho", "Evangelho".

## Greeting (`greeting`)

From behind the priest at the chair, his arms opened wide over the whole standing congregation in the nave: the reverse of every other card, the assembly seen as the priest sees it. GIRM 124: "facing the people and extending his hands".

- Excerpt: the first greeting formula, whole, verbatim both languages.

## Penitential Act (`penitential_act`)

Close on three of the faithful in a pew, standing, heads bowed, striking the breast; the priest small at the chair doing the same. The rubric of the Confiteor, "striking their breast", at the very words of the excerpt.

- Excerpt: "Through my fault, through my fault, through my most grievous fault." / "Por minha culpa, minha culpa, minha tão grande culpa."

## Kyrie (`kyrie`)

From the organ gallery: a choir of men and boys in the foreground, the standing people below, the priest far away at the chair. GIRM 52: the Kyrie is sung by the people with the choir or cantor.

- Excerpt: the three invocations, verbatim both languages.

## Gloria (`gloria`)

Looking up from the nave on a great feast: the people singing, six candles, lilies and roses around the altar, and the vault painted with the angels singing over the shepherds.

- Excerpt: its first two lines, "Glory to God in the highest, and on earth peace to people of good will." / "Glória a Deus nas alturas, e paz na terra aos homens por ele amados."

## Collect (`collect`)

Close and in profile: the priest at the chair, hands extended, a server holding the open Missal before him (GIRM 118a, 127, 189).

- Excerpt: the Trinitarian conclusion (GIRM 54), from the Second Sunday in Ordinary Time.

## First Reading (`first_reading`)

From a side aisle: a grey-haired reader in an alb at a stone ambo, the people seated in profile listening, the priest seated at the chair (GIRM 43, 128).

- Excerpt: the acclamation and reply, "The Word of the Lord. Thanks be to God." / "Palavra do Senhor. Graças a Deus."

## Responsorial Psalm (`responsorial_psalm`)

From among the seated people as they sing the response, the psalmist small at the ambo in cassock and surplice (GIRM 61, 129).

- Excerpt: the response of Psalm 100, "We are his people: the sheep of his flock." / "Nós somos o povo e o rebanho do Senhor."

## Second Reading (`second_reading`)

Low beside the ambo looking up: a reader in a dark suit, the ambo carved with a small St. Paul with sword and book, the nave and rose window beyond. No priest in view.

- Excerpt: the announcement, "A reading from the first Letter of Saint Paul to the Corinthians." / "Leitura da Primeira Carta de São Paulo aos Coríntios."

## Gospel Acclamation (`gospel_acclamation`)

From the side of the sanctuary: the priest bowing profoundly before the altar (Munda cor meum) with the Book of the Gospels lying on it, candle-bearers and thurifer waiting at the step, a cantor leading the standing people in the Alleluia (GIRM 62, 131–133).

- Excerpt: the Alleluia and verse of the Thirteenth Sunday, Year C, whole.

## Gospel (`gospel`)

From the nave looking up at the ambo: the priest incensing the open Book of the Gospels, a lit candle on either side, the people standing and turned toward it (GIRM 133–134).

- Excerpt: the announcement and the people's reply, "A reading from the holy Gospel according to John. Glory to you, O Lord." / "Proclamação do Evangelho de Jesus Cristo segundo João. Glória a vós, Senhor."

## Look-alike risks

- `gospel` against `entrance` and `gospel_acclamation`: all three carry candles, a thurible and the red-and-gold Book. The entrance is a procession up the nave from behind; the Acclamation is the bow at the altar with the Book lying closed on it; the Gospel is the ambo, the Book open, incense rising. If drafts blur, drop the thurifer from the Acclamation first.
- `first_reading`, `responsorial_psalm`, `second_reading`: three ambo cards, told apart by angle (side aisle; from the pews; low beside the ambo) and by the minister (alb; cassock and surplice; dark suit).
- `greeting` and `collect`: both the priest at the chair with hands extended; the Greeting is wide from behind him over the people, the Collect close in profile with the Missal.
- `kyrie` and `gloria`: both singing, standing congregations; the Kyrie is seen from the gallery with the choir, the Gloria from below with the vault fresco and festive light.
- None shows the altar with the elevation, so none echoes `x_consecration`.
