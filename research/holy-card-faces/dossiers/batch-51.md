# Batch 51: liturgical objects and vestments, the Chasuble and the Dalmatic

The last two items of "## Liturgical objects and vestments", after batch 48's Altar and Ambo, batch 49's Tabernacle … Lavabo and batch 50's Corporal … Stole. With them the section is complete. The cards are modelled on batch 50. No portraits: `face` is `-`. Both cards carry the quatrefoil medallion on a deep blue starred ground, copied from `batches/README.md` step 4. `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`. The vestments are laid out or displayed, never worn.

`consult/batch-51/build.py` writes `batches/batch-51.json` and checks it:
- both excerpts against their source text, rebuilt from the repo with only the edit named in `excerptSource`;
- the Latin behind each excerpt, the reading citation, the Mass for a Council's title and colour in the data;
- the GIRM sentences the bases quote, in the saved copies, and the Catholic Encyclopedia sentences, in the corpus;
- the frame against the README's object template, with no figures and no words for people, hands, shoulders or wearing in the subjects;
- no `box`, `feast` or `proper`;
- the initials;
- the two items as all that is left of the section after batches 48–50, and no box left in the section after them;
- ids against `content/saints/`, the holy-card data files and every batch;
- each `catalogMatch` by `accept-batch.py`'s current rule, ticking all of batches 48, 49 and 50 first, each in its file order (batch 50 ticks Pall first).

It prints OK. `consult/batch-51/find.py` is batch 50's search, copied.

**No `feast`, no `proper`, no `box`.** An object has none of them (README, "Before cards without a fixed date ship"; batch 48, Decisions on box).

**Sources consulted:**
- The GIRM (USCCB edition), chapters 4 and 6 (`girm-en-ch{4,6}.*`, copied from batch 50): 119; 337–338, 342, 344, 346–347.
- The Catholic Encyclopedia (1907–12, public domain, in the corpus at `content/books/catholic-encyclopedia/en-US/`): Chasuble (03639a), Dalmatic (04608a). Its rules are pre-conciliar; the cards take from it only the form and the ordination formulas, and the bases call the form traditional, not prescribed.
- In the repo: the formularies `ritual/various-needs/div009` (Mass for a Council or a Synod) and `tempore/advent/week-3/sunday`. The search also covered the Holy Week rubrics that name the chasuble (Palm Sunday, Holy Thursday, Good Friday); the Mass data never names the dalmatic, in either language.

## Decisions

1. **Excerpts.** Each one evokes the vestment through the words the Church attaches to it:
   - **Chasuble:** "And over all things put on love, which is the bond of perfection, and let the peace of Christ rule in your hearts." (Col 3:14-15), the Entrance Antiphon of the Mass for a Council or a Synod. At the bestowal of the chasuble in ordination the bishop says: "Receive the priestly vestment, by which is signified charity", and the chasuble is the vestment "covering all the rest" (Catholic Encyclopedia, "Chasuble"). The pt-BR keeps the clothing image, "Revesti-vos, sobretudo, do amor". Col 3:14 is also in the Holy Family and Thursday of Week 23 (Year I) readings, but there the pt-BR reads "amai-vos uns aos outros", with no clothing. Two other candidates: Mt 11:30, "my yoke is easy and my burden light", for the vesting prayer's "yoke of Christ" (in the Encyclopedia too); and the Palm Sunday rubric "puts on the chasuble" / "veste a casula", which names it but is a rubric.
   - **Dalmatic:** Is 61:10, "I exult for joy in the Lord … for he has clothed me in the garments of salvation …", the First Reading of Gaudete Sunday, Year B. At a deacon's ordination the bishop says: "May the Lord clothe thee with the garment of salvation and with the vesture of praise, and may he cover thee with the dalmatic of righteousness forever" (Catholic Encyclopedia, "Dalmatic"). The Latin in the same file is *induit me vestimentis salutis*. The same verse is the Entrance Antiphon of the Immaculate Conception (8 Dec), "clothed me with a robe of salvation, and wrapped me in a mantle of justice", closer still to "dalmatic of righteousness". It would make the dalmatic white.
2. **Edits to the source text, all named in `excerptSource`.** The antiphon's line breaks are joined. The en-US Isaiah drops its opening quotation mark. Both are otherwise verbatim.
3. **Forms, materials and colours.** Both vestments follow the colour of the day (GIRM 346). They must differ from each other and from batch 50's violet stole:
   - **Chasuble: green.** Green is the colour of Ordinary Time (346c). A Mass for Various Needs takes "the color proper to the day or the time of year" (GIRM 347), and the Council Mass's formulary in the data has `color: green`. Green is also the colour most often worn. The ample cut and the Y-shaped gold orphrey cross on the back are traditional (Encyclopedia: "In medieval chasubles these orphrey crosses often assume a Y form"). The GIRM leaves the form to the Conferences (342) and the beauty to material and design (344).
   - **Dalmatic: rose.** Rose "may be used, where it is the practice, on Gaudete Sunday" (346f), the Sunday of the excerpt. The dalmatic takes the colour of the day, like the chasuble it goes with (Encyclopedia: "with which it must agree in colour"). The Roman form is traditional: knee-length, with wide sleeves and two narrow vertical stripes joined near the hem by two narrow cross-stripes, and fringe on the sleeves (Encyclopedia). GIRM 338 lets the dalmatic be omitted "on account of a lesser degree of solemnity" and sets no seasonal limit. The Encyclopedia's rule that it is not worn in Advent is pre-conciliar, and the card doesn't rely on it.
   - Red was also open to the chasuble (the Palm Sunday rubric names it and prescribes red), and white to the dalmatic (the Immaculate Conception antiphon). Green and rose were chosen because each fits its excerpt. No vestment in batches 48–50 is green or rose: green appears only in batch 49's Lectionary drape and Lavabo marble, and rose nowhere.
4. **Card order.** After batch 50 the Vestments line holds only Chasuble and Dalmatic. Chasuble is ticked first, while the line still has two boxes, so the inline rule matches it. Dalmatic is then the line's only box, and the fallback finds "[ ] Dalmatic" there and nowhere else. `build.py` simulates this after all of batches 48, 49 and 50, and checks that the section has no box left.
5. **Ids.** `chasuble` and `dalmatic`. Both are unique against `content/saints/`, the holy-card data files and every batch.
6. **Names.** en-US as the catalog writes them. pt-BR: "Casula" is the Mass data's word (Holy Week rubrics). The data has no word for the dalmatic; "Dalmática" is the usual Brazilian liturgical term.

## Chasuble (`chasuble`)

From low at three-quarters along the counter: an ample deep green silk chasuble spread back-up on a pale oak vesting counter, its folds falling over the front edge, with a tall gold Y-orphrey cross. Behind it are tall oak drawers, with late-afternoon sun in long warm bars through clear windows (GIRM 337, 346c, 347).

- Excerpt: Col 3:14-15. "And over all things put on love …" / "Revesti-vos, sobretudo, do amor …"

## Dalmatic (`dalmatic`)

At eye level, a little from the left: a rose silk dalmatic spread full width on a wooden cross-bar in a glass-fronted walnut case lined with indigo velvet. It has two narrow gold vertical bands joined near the hem by two cross-bands, gold fringe on the sleeves, and soft light from the top of the case (GIRM 338, 346f).

- Excerpt: Is 61:10. "I exult for joy in the Lord …" / "Exulto de alegria no Senhor …"

## Look-alike risks

| Card | Angle | Colour | Setting |
|---|---|---|---|
| `lectionary` (b49) | close, front and above | green | green-draped desk, daylight |
| `amice` (b50) | steeply above | white with stained-glass spots | dark oak cabinet |
| `alb` (b50) | straight on, full length | white, pearl-grey | blue-grey plaster wall, morning |
| `stole` (b50) | straight on, eye level | violet and gold | brass rail, warm grey stone |
| `chasuble` | low, three-quarters along a counter | deep green and gold | pale oak counter, sun bars |
| `dalmatic` | eye level, a little from the left | rose and gold on indigo | walnut glass case, inner light |

- **`chasuble` against `lectionary` (b49).** Both are green. The lectionary is a book on a green-draped desk from above; the chasuble is a wide garment from low along a counter, with gold sun bars. If they blur, push the chasuble's green deeper and keep the counter pale.
- **`chasuble` against `amice` (b50).** Both are vestments laid out on a sacristy surface. The amice is small, white, seen from steeply above on dark oak; the chasuble fills the counter, green, seen from low on pale oak.
- **`dalmatic` against `alb` and `stole` (b50).** All three hang upright. The alb is white on plaster, straight on; the stole is violet over a rail; the dalmatic is rose, spread wide in a glass case. If the generator draws a long robe like the alb, repeat "knee-length, short wide sleeves".
- **Rose drifting to pink or red.** Rose is a muted, dusty pink-violet. If it comes out candy pink or red, say "muted old-rose silk, Gaudete rose".
- **"Not worn".** Both are laid out or displayed. If a chasuble appears on a body or the dalmatic on a mannequin, repeat "laid flat on the counter" / "spread on a wooden cross-bar, no one wearing it".
- **The dalmatic read as a chasuble.** A dalmatic has sleeves and a closed tunic shape; a chasuble has none. The subject names the sleeves and the stripes; keep them.
