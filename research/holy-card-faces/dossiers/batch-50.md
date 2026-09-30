# Batch 50: liturgical objects and vestments, from the Corporal to the Stole

The next ten items of "## Liturgical objects and vestments" after batch 48's Altar and Ambo and batch 49's Tabernacle … Lavabo, in catalog order: the last three Vessels and linens (Corporal, Purificator, Pall), the Other line (Thurible and boat, Aspergillum, Altar bells) and the first four Vestments (Amice, Alb, Cincture, Stole). Two items remain in the section after this batch: Chasuble and Dalmatic. The cards are modelled on batch 49. No portraits: `face` is `-`. Every card carries the quatrefoil medallion on a deep blue starred ground, copied from `batches/README.md` step 4. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`. The vestments are laid out, hanging or coiled, never worn.

`consult/batch-50/build.py` writes `batches/batch-50.json` and checks it:
- every excerpt against its source text, rebuilt from the repo with only the edits named in `excerptSource`;
- the rubrics around the lines taken, the reading citations, and the Latin behind "robes" in the alb and stole excerpts;
- the GIRM sentences the bases quote, in the saved copies, and the Catholic Encyclopedia sentences, in the corpus;
- the frame against the README's object template, with no figures and no words for people, hands or wearing in the subjects;
- no `box`, `feast` or `proper`;
- the initials;
- the ten items against the catalog order after batches 48 and 49, and the two left after them;
- ids against `content/saints/`, the holy-card data files and every batch;
- each `catalogMatch` by `accept-batch.py`'s current rule (the item ends at end of line or a separator), ticking batch 48's Altar and Ambo and all of batch 49 first.

It prints OK. `consult/batch-50/find.py` is the search used to find the excerpts (`python3 …/find.py en-US 'regex'` over the Order of Mass and the formularies).

**No `feast`, no `proper`, no `box`.** An object has none of them (README, "Before cards without a fixed date ship"; batch 48, Decisions on box).

**Sources consulted:**
- The GIRM (USCCB edition), chapters 4, 5 and 6 (`girm-en-ch{4,5,6}.*`, copied from batch 49): 118–120, 139, 150–151, 163, 276–277, 279; 304; 336, 340, 343–344, 346. The Code of Canon Law and Redemptionis Sacramentum copies came along with them; no card here cites them.
- The Catholic Encyclopedia (1907–12, public domain, in the corpus at `content/books/catholic-encyclopedia/en-US/`), for the traditional forms the GIRM leaves open: Corporal (04386c), Censer (03519c), Incense (07716a), Altar Bell (01349b), Amice (01428c), Alb (01251b), Cincture (03776a), Stole (14301a). Its rules are pre-conciliar; the cards take from it only the form, and the bases call it traditional, not prescribed.
- In the repo: `content/of/order/order-of-mass.json` (`order.preparation-of-gifts`, `order.communion-silent`, `order.sprinkling-rite`) and the formularies `tempore/ordinary-time/week-7/saturday`, `tempore/holy-week/easter-vigil`, `tempore/ordinary-time/week-30/thursday`, `common/martyrs/mart8`, `sanctoral/01-07`, `tempore/lent/week-2/saturday`; `content/do/web/www/missa/Latin/Tempora/Quad2-6.txt` for the Vulgate of Lk 15:22.

## Decisions

1. **Excerpts.** The brief allows "the words of the Mass in which it is used, or Scripture"; each one names or uses the object:
   - **Corporal:** the Order of Mass rubric "Then he places the paten with the bread on the corporal." The Order names the corporal in both languages only here and for the chalice a few lines on.
   - **Purificator:** "What has passed our lips as food, O Lord, may we possess in purity of heart …", the prayer said while the vessels are purified; GIRM 163 has the chalice dried with the purificator as it is said. No en-US line in the Mass data names the purificator.
   - **Pall:** the blessing over the wine, "Blessed are you, Lord God of all creation, … it will become our spiritual drink." The pall covers the chalice that holds this wine. No en-US line in the Mass data names the pall: the pt-BR opening rubric of the Preparation of the Gifts does ("o corporal, o sanguinho, o cálice, a pala e o Missal"), and its en-US counterpart is missing from the data. Batch 47's `preparation_of_gifts` took the blessing over the bread, so the two do not repeat.
   - **Thurible and boat:** Ps 141:2, "Let my prayer come like incense before you.", the refrain of the Psalm on Saturday of the Seventh Week in Ordinary Time, Year II. GIRM 276 cites this verse for the meaning of incense.
   - **Aspergillum:** the rubric of the Rite for the Blessing and Sprinkling of Water, "Afterward, taking the aspergillum, the priest sprinkles himself …". The antiphon "Sprinkle me with hyssop" was the alternative, but its en-US source writes "o Lord" in lower case.
   - **Altar bells:** the Easter Vigil rubric for the Gloria, "… while bells are rung, according to local custom." The bells, silent since the Gloria of Holy Thursday, ring again here (Catholic Encyclopedia, "Altar Bell"). It is the one line in the Mass data that names bells in both languages. It is long, 49 words in en-US.
   - **Amice:** Eph 6:17, "… accept salvation from God to be your helmet …", from Thursday of the Thirtieth Week, Year II. The amice's vesting prayer calls it *galeam salutis* (Catholic Encyclopedia, "Amice").
   - **Alb:** "These who are clothed in white robes …", the Entrance Antiphon of the Common of Several Martyrs in Easter Time (Rev 7:13-14); its Latin in the same file is *amicti sunt stolis albis*.
   - **Cincture:** Lk 12:35, "Gird your loins and light your lamps.", from the Gospel of Saint Raymond of Penyafort. The Catholic Encyclopedia gives this verse as the source of the cincture's meaning. The 19th Sunday (C) and Tuesday of Week 29 have the same verse, but their en-US says "dressed for action", with no girding.
   - **Stole:** Lk 15:22, "Quick! Bring out the best robe and put it on him.", from the Gospel of Saturday of the Second Week of Lent. The Vulgate calls this robe *stolam primam* (`content/do` Quad2-6). The Entrance Antiphon of Saint Athanasius (2 May), whose Latin in the formulary reads *stolam gloriae induit eum* ("clothed him in a robe of glory"), was the other candidate. It would make the stole white, a fourth white card.
2. **Edits to the source text, all named in `excerptSource`.** The Easter Vigil rubric drops its number "31." in en-US, and its pt-BR has a stray space removed ("nas alturas , que" → "nas alturas, que"). Two excerpts are cut to a clause and closed with a full stop: the en-US cincture before " and be like servants" (its opening quotation mark dropped too), the en-US stole before "; put a ring". All the others are verbatim, with the Order of Mass's line breaks joined.
3. **Forms, materials and colours.** Where the norms fix something, the card follows it; where they leave it open, the card takes the traditional form, and the `basis` says it is a choice:
   - **Corporal:** a square of plain white linen folded in three each way, with one small cross, on the white altar cloth (GIRM 118c, 139, 304; the linen and the form are traditional).
   - **Purificator:** white linen oblongs folded in three, with a small red cross. The GIRM names its use (163, 279), not its form.
   - **Pall:** a stiff white linen square, embroidered with a cross, wheat and grapes. It is optional (GIRM 118c: "if appropriate"), and the GIRM gives it no form.
   - **Thurible and boat:** gilded brass, a pierced lid on chains, and a boat with its spoon (GIRM 119 names both; the form is the Catholic Encyclopedia's).
   - **Aspergillum:** a silver bucket and a rod ending in a pierced ball. The Missal names the aspergillum and GIRM 118c "the vessel of water to be blessed"; neither gives a form.
   - **Altar bells:** four brass bells on one handle. GIRM 150 says "a small bell"; the cluster is traditional, chosen for the catalog's plural.
   - **Amice, alb, cincture:** white linen. GIRM 336 requires the alb, with the cincture and amice where needed, and gives no colour. The alb is white by name and custom, and its lace border is a permitted ornament (Catholic Encyclopedia, "Alb"). The amice has a cross in the middle and two tapes, and the cincture is a cord with tassels, both traditional.
   - **Stole: violet.** A stole takes the colour of the day (GIRM 346), so a card must show one. Violet (346d, Advent and Lent) fits the Lenten Gospel of its excerpt. It is also the only colour in this batch that is not white or gold, and batches 48–49 have no violet. It has a gold cross at each end and at the middle: the Church prescribes only the one in the middle (Catholic Encyclopedia, "Stole"). It hangs over a rail, not worn, so it is neither the priest's nor the deacon's way of wearing it (GIRM 340).
4. **Card order: Pall first.** `accept-batch.py` ticks in card order. Once batch 49 is accepted, the Vessels line holds only Corporal, Purificator and Pall. Ticked last, Pall would be that line's only box. The inline rule needs two, and the fallback then also finds "St. Palladius" (6 Jul, line 420), so it fails. Ticked first, Pall is one of three boxes and matches its line alone. The file lists Pall, Corporal, Purificator, then the other seven in catalog order. `build.py` simulates this after batch 48's Altar and Ambo and all of batch 49, and checks that "Altar" did not take "Altar bells".
5. **Ids.** `corporal`, `purificator`, `pall`, `thurible` (the item's head noun; the boat is in its subject), `aspergillum`, `altar_bells`, `amice`, `alb`, `cincture`, `stole`. All are unique against `content/saints/`, the holy-card data files and every batch.
6. **Names.** en-US as the catalog writes them. pt-BR: "Corporal", "Sanguinho", "Pala" and "Aspersório" are the terms the Mass data uses. The Mass data has no word for the rest, so these are the usual Brazilian liturgical terms: "Turíbulo e naveta" ("turíbulo" is in the Holy Week rubrics, "naveta" isn't), "Campainhas do altar", "Amito", "Alva", "Cíngulo", "Estola".

## Pall (`pall`)

Straight on at eye level: a stiff white linen square standing on edge, embroidered in gold and red with a cross, wheat and grapes, on polished black marble that reflects it, lit by one warm lamp (GIRM 118c).

- Excerpt: the blessing over the wine. "Blessed are you, Lord God of all creation …" / "Bendito sejais, Senhor, Deus do universo …"

## Corporal (`corporal`)

Three-quarters from a little above: the white linen square spread on the altar cloth, its nine fold-squares raised by golden dawn light from a high window (GIRM 118c, 139, 151, 304).

- Excerpt: "Then he places the paten with the bread on the corporal." / "Em seguida, coloca a patena com o pão sobre o corporal."

## Purificator (`purificator`)

From above at an angle, into an open drawer: three folded purificators in red-brown cedar, the top one with a small red cross, in cool north light (GIRM 118c, 139, 163, 279).

- Excerpt: "What has passed our lips as food, O Lord …" / "Fazei, Senhor, que conservemos num coração puro …"

## Thurible and boat (`thurible`)

From below, looking up: a gilded brass thurible hanging on its chains, coals glowing, blue-grey smoke through a shaft of sunlight in a dim stone apse, and the boat with its spoon on a ledge below (GIRM 119–120, 276–277).

- Excerpt: Ps 141:2. "Let my prayer come like incense before you." / "Minha oração suba a vós como incenso!"

## Aspergillum (`aspergillum`)

At eye level, a little from the side: a silver bucket of water with the aspergillum lifted in it and drops falling, on the limestone rim of a font in bright spring morning light (GIRM 118c; the Rite of Sprinkling).

- Excerpt: the rubric "Afterward, taking the aspergillum …" / "Tomando então o aspersório …"

## Altar bells (`altar_bells`)

From floor level: a cluster of four brass bells on a turned handle, lying on the top sanctuary step of black and white marble squares, with candlelight from above (GIRM 150).

- Excerpt: the Easter Vigil Gloria rubric, "… while bells are rung, according to local custom." / "… enquanto se tocam os sinos, segundo o costume do lugar."

## Amice (`amice`)

From steeply above: the white linen oblong with its cross and two tapes spread on a dark oak vesting cabinet, with stained-glass colour scattered over it (GIRM 119, 336).

- Excerpt: Eph 6:17. "… accept salvation from God to be your helmet …" / "Tomai, enfim, o capacete da salvação …"

## Alb (`alb`)

Straight on, full length: a white linen alb on a wooden hanger against a pale blue-grey plaster wall, with a lace hem and cuffs and pearl-grey folds in morning light (GIRM 119, 336, 343–344).

- Excerpt: Rev 7:13-14. "These who are clothed in white robes …" / "Estes, vestidos com túnicas brancas …"

## Cincture (`cincture`)

Close, three-quarters from above: a white linen cord coiled in a spiral with its tassels on a honey-coloured stone windowsill, a small clay oil lamp burning beside it, blue dusk outside (GIRM 336).

- Excerpt: Lk 12:35. "Gird your loins and light your lamps." / "Que vossos rins estejam cingidos e as lâmpadas acesas."

## Stole (`stole`)

Straight on at eye level: a violet silk stole folded over a brass rail, with its two ends side by side, gold crosses at the ends and the middle, and gold fringe, against warm grey stone (GIRM 340, 346).

- Excerpt: Lk 15:22. "Quick! Bring out the best robe and put it on him." / "Trazei depressa a melhor túnica para vestir meu filho."

## Look-alike risks

Each card has its own angle, dominant colour and setting inside the medallion:

| Card | Angle | Colour | Setting |
|---|---|---|---|
| `altar` (b48) | front, slightly above | pale stone, white linen | lilies on the floor |
| `ambo` (b48) | slight angle | pale stone, red book | high-window light |
| `tabernacle` (b49) | frontal, eye level | gold, ruby red | white marble shelf, shadowed chapel |
| `altar_crucifix` (b49) | low, looking up | ivory, brass, candle glow | wine-red damask, night |
| `roman_missal` (b49) | side, three-quarters | brown leather, many ribbons | altar cloth, morning |
| `lectionary` (b49) | close, front and above | green | green-draped desk, daylight |
| `book_of_gospels` (b49) | straight on, upright | gold and jewels | white-and-gold silk |
| `chalice` (b49) | pure profile | silver-gilt, silver-blue | grey stone niche |
| `paten` (b49) | directly above | gold on dark wood | walnut table, raking light |
| `ciborium` (b49) | three-quarters above | gold, ivory | oak credence, late afternoon |
| `cruets` (b49) | eye level, side | clear glass, red wine | lace cloth by a window |
| `lavabo` (b49) | low, side | silver, dark green | green marble, cool morning |
| `pall` | straight on, upright on edge | white, gold, red on black | black marble mirror, one lamp |
| `corporal` | three-quarters above | white linen, golden light | altar top, dawn |
| `purificator` | above, into a drawer | white on red-brown cedar | vestment chest, north light |
| `thurible` | from below, looking up | gilded brass, blue-grey smoke | dim stone apse, sunbeam |
| `aspergillum` | eye level, slight side | silver, pale blue water | limestone font, spring morning |
| `altar_bells` | floor level | brass on black and white | marble step, candlelight |
| `amice` | steeply above | white with stained-glass spots | dark oak cabinet |
| `alb` | straight on, full length | white, pearl-grey | blue-grey plaster wall, morning |
| `cincture` | close, three-quarters above | white cord, lamplight | stone sill, oil lamp, dusk |
| `stole` | straight on, eye level | violet and gold | brass rail, warm grey stone |

- **Six white linens: `corporal`, `purificator`, `pall`, `amice`, `alb`, `cincture`.** They differ by shape and ground: the corporal flat on the altar in gold dawn light, the purificators stacked in red cedar, the amice spread on dark oak under coloured light, the alb upright and full length, the cincture coiled beside a flame, the pall standing on black. If two blur, push the ground: the cedar redder, the plaster bluer.
- **`corporal` against `altar` (b48).** Both show white linen on an altar top. The altar is the whole table from the front; the corporal is a close three-quarter view of one creased square. If it reads as a second altar, crop tighter onto the creases.
- **`pall` against `chalice` and `paten` (b49).** The pall is shown alone, with no chalice under it, so it does not repeat the chalice. If the generator puts it on a chalice, say "no chalice, no vessel".
- **`thurible` and "no figures".** The thurible hangs from the top of the medallion. If a hand or a thurifer appears holding the chains, add "the chains rise out of the frame, held by no one".
- **`aspergillum` against `lavabo` (b49).** Both are silver vessels with water drops. The lavabo is a ewer in a basin on green marble in cool light; the aspergillum is a bucket and a rod on pale stone in bright light. If they blur, lighten the aspergillum's setting further.
- **`altar_bells`.** The generator may draw a single hand bell or a church bell. The subject says four small bells on one handle, lying on the step.
- **`stole` and "not worn".** The stole hangs over a brass rail. If it appears on shoulders or a mannequin, repeat "over a brass rail, no one wearing it".

## TLM look (2026-09-30)

Only `subject` changed.

- **`alb`:** deep lace from the knee to the hem, with lace cuffs.
- **`stole`:** Roman form, with the ends widening into spade-shaped panels.
- Unchanged: `pall`, `corporal`, `purificator`, `thurible`, `aspergillum`, `altar_bells`, `amice`, `cincture`. The traditional rite uses the same objects and the drawings imply nothing specific to the new rite.
