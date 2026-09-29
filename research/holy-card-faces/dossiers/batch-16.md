# Batch 16 — the moveable feasts of the Lord and the feasts of Our Lady

Ten scene cards: four solemnities of the Lord without a fixed date (`trinity`, `corpus_christi`, `sacred_heart`, `christ_king`) and six feasts of Our Lady. Christ and Our Lady use their lines from `recurring-figures.md`; God the Father appears for the first time and now has a line there. Every excerpt is copied from the feast's own formulary and checked verbatim by script, case-insensitive, against both languages. Every catalogMatch hits exactly one line of `docs/plans/holy-cards-catalog.md`, and that line is unticked.

**No `feast`** on `trinity`, `corpus_christi`, `sacred_heart`, `christ_king`: they are moveable (Sunday after Pentecost, the Thursday or Sunday after it, the Friday after the second Sunday after Pentecost, the last Sunday of the year). They can't ship until `feast` is optional in the app (see `README.md`).

## The Most Holy Trinity

The Father and the Son enthroned side by side on cloud, with the dove between them in golden light. This is the common Western Baroque type (Reni, Ribera, the Coronation altarpieces). I chose it over the Throne of Grace, which puts a crucifix in the Father's hands, and over Rublev's three angels, which would not match the set's Christ. The Father is the Ancient of Days of Daniel 7:9, a new recurring line. The Son has his rose-red and blue, the wounds as small clean marks, and holds a plain cross.

- Excerpt: entrance antiphon, whole.

## Corpus Christi

The procession through a hill-town street: a priest in profile under the canopy raising the monstrance, servers, a flower girl, a carpet of petals, townsfolk kneeling. There is no principal face. The Host carries no IHS or cross, following the no-lettering rule.

- Excerpt: communion antiphon (Jn 6:56), whole.

## The Sacred Heart of Jesus

Christ half-length pointing to his Heart, which has the crown of thorns, flame, cross and rays but no blood. This is St. Margaret Mary's description as the nineteenth-century devotional image paints it. Behind him is the Visitation chapel at Paray-le-Monial.

- Excerpt: entrance antiphon (Ps 33:11, 19), whole. I passed over the communion antiphon (the lance), in keeping with the no-gore rule.

## Christ the King

Christ enthroned with crown, sceptre and orb, in a white robe and a crimson royal mantle. Kneeling angels flank him and the earth lies small below. His robe departs from the glory colours of his line (white robe, white mantle) because a king's mantle is part of the image; his face is unchanged.

- Excerpt: the collect's opening, "…the King of the universe" / "…Rei do universo".

## Our Lady of Lourdes (11 Feb)

Our Lady stands in the niche of Massabielle exactly as Bernadette described her: white dress, blue sash, white veil, a yellow rose on each foot, a rosary of white beads with a gold chain. The eglantine grows below and the Gave runs to the right. Bernadette kneels at the lower left in the white capulet. Her face is taken from the Billard-Perrin photograph of 1863 (copy in `consult/batch-16/`): a soft oval face broad at the cheekbones, strong straight dark brows, large wide-set dark eyes, a straight nose with a rounded tip, full lips. It is made younger, to fourteen. Our Lady keeps the set's face. Bernadette said the Lady was a young girl of about her own size, so she is described as about sixteen.

- Excerpt: collect, opening. The Mass takes its readings from the Common, so there is no proper antiphon.

## Our Lady of Mount Carmel (16 Jul)

Our Lady appears in the Carmelite brown and white with the Christ Child (about two) and holds out a plain brown scapular to St. Simon Stock, who kneels below. Behind him is Aylesford Friary on the Medway. Tradition puts the vision there in 1251 (Cambridge is sometimes named). No portrait of Simon exists. To avoid the stock white-bearded elder, his face is invented: clean-shaven, a gaunt triangular face, a long aquiline nose, pale blue eyes, a wide tonsure.

- Excerpt: collect, middle clause, "the mountain which is Christ" / "o monte que é Cristo".

## Dedication of the Basilica of St. Mary Major (5 Aug)

The snow on the Esquiline, after Masolino's panel (c. 1428, copy in `consult/batch-16/`). Our Lady lets the snow fall from a round glory. Pope Liberius traces the plan of the basilica in the snow with a hoe, and the patrician John and his wife kneel. Masolino puts Christ in the glory as well; I left him out, so this card doesn't repeat the Father-and-Son composition of `trinity` and `queenship`. Liberius is elderly and clean-shaven, as Masolino paints him, with a broad square face and heavy jaw. John has a long narrow face and a black beard; his wife has a round face.

- Excerpt: first reading, Rev 21:3, "Here God lives among men…" / "Esta é a morada de Deus entre os homens…". The Mass has only a proper collect, and the collect asks pardon without evoking the church, so I chose the reading instead.

## The Queenship of the Blessed Virgin Mary (22 Aug)

Christ crowns his Mother, who kneels beside him on the cloud, with the dove above and angel musicians around them. The card also serves the fifth Glorious mystery, whose catalog item says "shares the Queenship of Mary". `accept-batch.py` won't tick that item, so it needs ticking by hand. Our Lady is matured to about forty-eight, as on `assumption`.

- Excerpt: entrance antiphon (Ps 45:10), whole.

## The Most Holy Name of Mary (12 Sep)

The rule against lettering rules out the usual monogram. The card shows the traditional meaning of the name instead: *stella maris* (St. Jerome; St. Bernard, "Respice stellam, voca Mariam"). Our Lady appears above a stormy sea at dusk with one star over her head, a small sailing ship below and a chapel and lighthouse on a headland.

- Excerpt: communion antiphon (Lk 1:48), whole. The entrance antiphon's two versions diverge ("undying on our lips" / "todos os povos cantem").

## Our Lady of Sorrows (15 Sep)

Mater Dolorosa, half-length, in violet-blue and black under a white veil. Seven silver swords fan out from a glowing heart on her breast, with no blood and no wound. One tear. Behind her is the empty cross of Calvary with its linen cloth, at dusk.

- Excerpt: entrance antiphon, last clause (Lk 2:35).

## Look-alike risks

- Our Lady appears on six cards of this batch, plus `trinity`'s neighbour `queenship`. Check the recurring face holds, and that `holy_name_mary` (sea, star) doesn't read like `assumption` or `immaculate_conception`, or `lourdes` like `fatima` (both are apparitions to kneeling children; here it is the grotto, the capulet and the Gave).
- `trinity`, `queenship` and `christ_king` all put Christ on golden cloud. They differ in the Father and the dove, in Mary kneeling crowned, and in the crown, sceptre and crimson mantle.
- `sacred_heart` against `margaret_mary`: that card presumably shows the heart as well. Here Christ is the only figure, facing out.
- God the Father against `peter` and any white-bearded patriarch: a long, flowing, wavy white beard and a triangular halo.
- Liberius's tiara may be drawn with lettering or gems in the form of letters; reject any lettering. The same goes for the monstrance, the scapular and the swords.
- `sacred_heart` and `our_lady_sorrows` may tip into gore (blood on the heart, wounds). Reject that.
- The model may give Simon Stock a beard by habit. He is clean-shaven.

## Initials

The letters follow the precedents of `holy_name_jesus` (H) and `lateran_basilica` (D). `mary_major` takes D (Dedication), `queenship` Q and `holy_name_mary` H: those names are feasts, not "Our Lady of …" titles. `lourdes`, `mount_carmel` and `our_lady_sorrows` take M, like `fatima`. If every Marian feast should carry M instead, change those three letters.
