# Batch 49: liturgical objects, from the Tabernacle to the Lavabo

The next ten items of "## Liturgical objects and vestments" after batch 48's Altar and Ambo, in catalog order: the rest of the Sanctuary line (Tabernacle and sanctuary lamp, Altar crucifix and candles), the Books (Roman Missal, Lectionary, Book of the Gospels) and the first five Vessels and linens (Chalice, Paten, Ciborium, Cruets, Lavabo). They are modelled on batch 48's `altar` and `ambo`. No portraits: `face` is `-`. Every card carries the quatrefoil medallion on a deep blue starred ground, copied from `batches/README.md` step 4. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`.

`consult/batch-49/build.py` writes `batches/batch-49.json` and checks it:
- every excerpt against its source text, rebuilt from the repo with only the edits named in `excerptSource`;
- the rubrics around the lines taken, and the reading citations;
- the GIRM, Code of Canon Law and Redemptionis Sacramentum sentences the bases quote, in the saved copies;
- the frame against the README's object template, with no figures and no words for people or hands in the subjects;
- no `box`, `feast` or `proper`;
- the initials;
- the ten items against the catalog order after batch 48's Altar and Ambo;
- ids against `content/saints/`, the holy-card data files and every batch;
- each `catalogMatch` by `accept-batch.py`'s current rule (the item ends at end of line or a separator), ticking batch 48's Altar and Ambo first, since they share the Sanctuary line.

It prints OK.

**No `feast`, no `proper`, no `box`.** An object has none of them (README, "Before cards without a fixed date ship"; batch 48, Decisions on box).

**Sources consulted**, saved in `consult/batch-49/`:
- The GIRM (USCCB edition), chapters 4, 5 and 6 (`girm-en-ch{4,5,6}.*`, copied from batch 48): 117–120, 133–134, 139, 142, 145, 160, 163, 173, 175; 307–308, 314–316; 327–332, 349–350.
- Code of Canon Law, Book IV, cann. 879–958 (`cic-cann879-958.*`, vatican.va): cann. 938–940 (the tabernacle, the pyx, the lamp).
- Redemptionis Sacramentum (`redemptionis-sacramentum.*`, vatican.va), no. 117 (materials of sacred vessels).
- In the repo: `content/of/order/order-of-mass.json` (`order.preparation-of-gifts`, `order.communion-silent`) and the formularies `tempore/ordinary-time/week-1/wednesday`, `sanctoral/09-13`, `tempore/holy-week/good-friday`, `tempore/ordinary-time/week-29/sunday`, `tempore/advent/week-2/sunday`, `tempore/holy-week/lords-supper`.

## Decisions

1. **Excerpts.** The brief allows "the words of the Mass in which it is used, or Scripture"; each one names or uses the object:
   - **Tabernacle and sanctuary lamp:** 1 Sam 3:3, "The lamp of God had not yet gone out, and Samuel was lying in the sanctuary of the Lord where the ark of God was." The lamp before the ark, the tabernacle's Old Testament type, both halves of the item in one verse. Exodus 40:34 ("the glory of the Lord filled the tabernacle", Thursday of Week 17, Year I) was the other candidate, but its pt-BR says *santuário* and has no lamp.
   - **Altar crucifix and candles:** 1 Cor 1:23-24, "We proclaim Christ crucified", the Communion Antiphon of Saint John Chrysostom. It names the figure the GIRM requires on the cross. Gal 6:14 was taken by batch 45's `triduum`. The candles have no line of their own.
   - **Roman Missal:** the Good Friday rubric "A cloth is spread on the altar, and a corporal and the Missal put in place." It is the one place where the app's Mass data names the Missal in both languages; the Order of Mass names it only in pt-BR (the opening rubric of the Preparation of the Gifts). "Lord, teach us to pray" (Lk 11:1) was the alternative if a rubric reads too dry.
   - **Lectionary:** 2 Tim 3:16, "All scripture is inspired by God …", the Second Reading of the Twenty-Ninth Sunday, Year C. "The Word of the Lord" went to batch 46's `first_reading`, Lk 4 to batch 47's `homily`, Neh 8 to batch 48's `ambo`.
   - **Book of the Gospels:** Mk 1:1, "The beginning of the Good News about Jesus Christ, the Son of God", the Gospel of the Second Sunday of Advent, Year B. The en-US text says "Good News" where the pt-BR says *Evangelho*; both are verbatim.
   - **Chalice:** the refrain of the Psalm at the Evening Mass of the Lord's Supper, "Our blessing-cup is a communion with the blood of Christ" (1 Cor 10:16). The pt-BR keeps its source comma ("abençoado, é").
   - **Paten:** the Order of Mass rubric "The Priest, standing at the altar, takes the paten with the bread …". Batch 47's `preparation_of_gifts` already took the blessing over the bread, so the paten takes the rubric before it.
   - **Ciborium:** the Communion rubric "After this, he takes the paten or ciborium and approaches the communicants." Batch 48's `holy_communion` took the words after it ("The Body of Christ. Amen.").
   - **Cruets:** the prayer at the mingling, "By the mystery of this water and wine …".
   - **Lavabo:** "Wash me, O Lord, from my iniquity and cleanse me from my sin." (Ps 51:4).
2. **Edits to the source text, all named in `excerptSource`.** Four excerpts are cut to a clause and closed with a full stop, where the source sentence runs on: the en-US Samuel (before ", when the Lord called"), the pt-BR Timothy (before v. 17, "a fim de que"), the paten rubric in both languages (en-US before ", saying in a low voice:", pt-BR before " e, levantando-a"; so the en-US keeps "holds it slightly raised" and the pt-BR stops at "recebe a patena com o pão em suas mãos") and the pt-BR ciborium rubric (before " e mostra a hóstia"). The Good Friday rubric drops its number "22." in en-US.
3. **Forms, materials and colours.** Where the norms fix something, the card follows it; where they leave it open, the card takes a traditional, dignified form and the `basis` says it is a choice:
   - **Tabernacle:** gilded bronze, closed and locked, on a marble shelf (GIRM 314; can. 938: irremovable, solid, not transparent, locked). No tabernacle veil: the GIRM doesn't mention one. The lamp burns oil or wax (GIRM 316; can. 940); its red glass is custom, not law.
   - **Altar crucifix and candles:** a cross with the corpus (GIRM 117, 308); six candles, the Sunday number GIRM 117 allows, on the altar (GIRM 307 allows on or around it), rising toward the cross in the traditional arrangement.
   - **Books:** "truly worthy, dignified, and beautiful" (GIRM 349). The Missal on a bookstand with ribbons in the liturgical colours, the Lectionary in green for Ordinary Time, the Book of the Gospels with a gilded, jewelled cover, the cross and the four Evangelists' symbols. None of these is prescribed. No page shows letters.
   - **Chalice, paten, ciborium:** precious metal, gilded inside, non-absorbent bowl (GIRM 328–330; Redemptionis Sacramentum 117). The form is left to the artist (GIRM 332): a silver-gilt chalice with knop and six-lobed foot, a plain gold paten with one large host, a lidded ciborium with a cross.
   - **Cruets:** clear glass on a silver tray. Redemptionis Sacramentum 117's bar on glass is for the vessels of the Body and Blood; the cruets hold the wine before the Consecration. GIRM 118c names them, not their material.
   - **Lavabo:** ewer, basin and towel in silver and linen. GIRM 118c says only "whatever is needed for the washing of hands".
4. **The bread on the paten and in the ciborium.** The paten holds one large unconsecrated host, before the Offertory, as its rubric. The ciborium shows many small hosts with its lid set aside. Neither card claims the hosts are consecrated.
5. **Ids.** `tabernacle`, `altar_crucifix` (the catalog item's head noun; the candles are in its subject), `roman_missal`, `lectionary`, `book_of_gospels`, `chalice`, `paten`, `ciborium`, `cruets`, `lavabo`. All are unique against `content/saints/`, the holy-card data files and every batch. The `x_chalice` test draft in `drafts/` is a different id.
6. **Names.** en-US as the catalog writes them ("Tabernacle and sanctuary lamp", "Altar crucifix and candles"). pt-BR in the terms the repo uses: "Sacrário" (the Mass data's word; "tabernáculo" is rarer in Brazil), "Cibório" (the Good Friday rubric; "âmbula" also occurs), "Galhetas", "Lavabo", "Evangeliário". Where the repo has no term: "Lâmpada do Santíssimo", "Crucifixo e velas do altar", "Missal Romano", "Lecionário", "Cálice", "Patena".
7. **catalogMatch.** Every item is the text right after its `[ ] `. None is a prefix of another item, so each matches exactly one line under `accept-batch.py`'s rule. Batch 48 must be accepted first: after its Altar and Ambo, "Altar crucifix and candles" is the last box on the Sanctuary line, and the fallback finds it on that one line. `build.py` simulates this order.

## Tabernacle and sanctuary lamp (`tabernacle`)

Frontal, at eye level: a gilded bronze tabernacle with wheat-and-vine doors on a white marble shelf, and a ruby-red lamp hanging on gilded chains to its right, in a shadowed side chapel (GIRM 314–316; cann. 938, 940).

- Excerpt: 1 Sam 3:3. "The lamp of God had not yet gone out …" / "A lâmpada de Deus ainda não se tinha apagado …"

## Altar crucifix and candles (`altar_crucifix`)

From low down past the altar's front edge: a dark wooden crucifix with an ivory corpus, three gilded brass candlesticks on either side rising toward it, lit, against wine-red damask, at night (GIRM 117, 307–308).

- Excerpt: 1 Cor 1:23-24. "We proclaim Christ crucified …" / "Nós anunciamos Cristo crucificado …"

## Roman Missal (`roman_missal`)

Side view at three-quarters: a thick brown-leather missal open on a gilded bookstand on the altar cloth, six coloured ribbons falling, morning light (GIRM 118a, 139, 349).

- Excerpt: the Good Friday rubric that puts the Missal on the altar.

## Lectionary (`lectionary`)

Close from the front and a little above, the book filling the medallion: a green-bound Lectionary open on a green-draped desk, a green ribbon across blank pages, even daylight (GIRM 118b, 120d, 349).

- Excerpt: 2 Tim 3:16. "All scripture is inspired by God …" / "Toda a Escritura é inspirada por Deus …"

## Book of the Gospels (`book_of_gospels`)

Straight on: the book standing upright and closed on the altar, its gold cover set with stones, a jewelled cross and the four Evangelists' symbols, before white silk embroidered in gold (GIRM 117, 120d, 133–134, 349).

- Excerpt: Mk 1:1. "The beginning of the Good News about Jesus Christ, the Son of God." / "Início do Evangelho de Jesus Cristo, Filho de Deus."

## Chalice (`chalice`)

Pure side profile at eye level: a silver-gilt chalice, empty and uncovered, in a grey stone niche, silver-blue shadow, one shaft of light on its rim (GIRM 327–332; RS 117).

- Excerpt: "Our blessing-cup is a communion with the blood of Christ." / "O cálice por nós abençoado, é a nossa comunhão com o sangue do Senhor."

## Paten (`paten`)

From directly above: a gold paten with one large host on dark walnut, raking side light (GIRM 327–331, 118c).

- Excerpt: the rubric of the paten raised at the Preparation of the Gifts.

## Ciborium (`ciborium`)

Three-quarters from a little above: a gilded ciborium full of small hosts, its cross-topped lid set beside it, on white linen over a light oak credence, ivory wall, late-afternoon light (GIRM 118c, 160, 163, 328).

- Excerpt: "After this, he takes the paten or ciborium and approaches the communicants." / "Em seguida, toma a patena ou o cibório, aproxima-se dos que vão comungar."

## Cruets (`cruets`)

At eye level, a little from the side: two clear glass cruets, wine and water, on a silver tray on a lace-edged credence cloth by a window, their red and clear reflections on the linen (GIRM 118c, 142).

- Excerpt: "By the mystery of this water and wine …" / "Pelo mistério desta água e deste vinho …"

## Lavabo (`lavabo`)

From low at the side: a silver ewer standing in a silver basin, drops on the rim, a folded linen towel with a small cross, on dark green marble, cool morning light (GIRM 118c, 145).

- Excerpt: "Wash me, O Lord, from my iniquity and cleanse me from my sin." / "Lavai-me, Senhor, de minhas faltas e purificai-me do meu pecado."

## Look-alike risks

Each card has its own angle, dominant colour and setting inside the medallion:

| Card | Angle | Colour | Setting |
|---|---|---|---|
| `altar` (b48) | front, slightly above | pale stone, white linen | lilies on the floor |
| `ambo` (b48) | slight angle | pale stone, red book | high-window light |
| `tabernacle` | frontal, eye level | gold, ruby red | white marble shelf, shadowed chapel |
| `altar_crucifix` | low, looking up | ivory, brass, candle glow | wine-red damask, night |
| `roman_missal` | side, three-quarters | brown leather, many ribbons | altar cloth, morning |
| `lectionary` | close, front and above | green | green-draped desk, daylight |
| `book_of_gospels` | straight on, upright | gold and jewels | white-and-gold silk |
| `chalice` | pure profile | silver-gilt, silver-blue | grey stone niche |
| `paten` | directly above | gold on dark wood | walnut table, raking light |
| `ciborium` | three-quarters above | gold, ivory | oak credence, late afternoon |
| `cruets` | eye level, side | clear glass, red wine | lace cloth by a window |
| `lavabo` | low, side | silver, dark green | green marble, cool morning |

- **`lectionary` against `ambo` and `roman_missal`.** All three are open books. The ambo is the stone structure with a red book; the Missal lies on a bronze stand with many ribbons, seen from the side; the Lectionary is a close-up of a green book. If the Lectionary reads as a second ambo, crop tighter onto the pages.
- **`chalice` against `ciborium`.** Both are gilded cups on a stem. The chalice is empty, in profile, cool and grey; the ciborium is full of hosts with its lid off, warm and seen from above. If they blur, keep the ciborium's lid on its cup.
- **`altar_crucifix` against `altar`.** Both show an altar edge. The altar is bare and seen from above; this one is from below, at night, with the cross and candles filling the medallion.
- **`altar_crucifix` and "no figures".** The corpus of Christ must stay on the cross (GIRM 117, 308), while the frame says "no figures". The subject calls it a "carved corpus" of ivory. If the generator drops it, add "the crucifix bears the corpus" to the edit.
- **`book_of_gospels` and its Evangelists' symbols.** The angel of Matthew is small, in a corner, as metalwork. If it reads as a figure, keep only the jewelled cross.

## TLM look (2026-09-30)

Only `subject` changed. The still-life frame stays. Sources, kept in `consult/tlm/`: **RS** = *Ritus servandus in celebratione Missae*, Missale Romanum 1962 (`ritus-servandus-1962-lat.pdf`, from aomoi.net); **F** = Fortescue, *The Ceremonies of the Roman Rite Described* (1920 impression; `fortescue-1920.txt`, archive.org), cited by the line of that file.

- **`tabernacle`:** the tabernacle now stands in the middle of the altar (F l. 2075–2081) and is **veiled** in white silk, parted to show a strip of the door, because "there is no permission ever to dispense with the tabernacle veil" (F l. 2100–2108). The lamp now hangs before it from above (F l. 2087–2088). Fortescue adds that the lamp's glass "should be white" (n., F l. 2116); the red glass is kept as the common practice.
- **`altar_crucifix`:** the crucifix and candles stand on the gradine, and the centre altar card leans at the foot of the cross (F l. 2981–2985).
- **`roman_missal`:** the Missal rests on its stand at the epistle end beside the epistle-side altar card (F l. 2961–2962, 2986–2988).
- **`lectionary` (no Lectionary in the old rite):** the card now shows the **book of lessons**, the epistles and gospels taken from the Missal for the ministers at High Mass (F l. 2921–2925). It lies on a lectern covered in the colour of the day (F l. 2286–2290). The image barely changes.
- **`book_of_gospels`:** the book now lies **flat** on the middle of the altar, where the deacon lays it before the Gospel (F l. 8598–8603), instead of standing enthroned.
- **`ciborium`:** a white silk veil lies beside it (F l. 2712–2716).
- Unchanged: `chalice`, `paten`, `cruets` (glass, as F l. 2741–2745 asks), `lavabo`.
