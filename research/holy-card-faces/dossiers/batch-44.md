# Batch 44: the seasons, Advent to Laetare

The first ten non-saint cards, in catalog order: Advent (Sunday, weekday, Gaudete), Christmas (Sunday, weekday), Ordinary Time I (Sunday, weekday), Lent (Sunday, weekday, Laetare). No portraits: `face` is `-`, and each card carries the seasons' frame variant from `batches/README.md` step 4 with its liturgical colour as `box` and in `frame` (violet, rose, white, green). `refs` are the brief's default, `exaltation_cross annunciation thomas_aquinas`, as on the test drafts.

`consult/batch-44/build.py` writes `batches/batch-44.json` and checks it: every excerpt fragment against its formulary, every `proper` against the repo's formulary ids and seasons, the frame text against the README template, ids against `content/saints/` and every batch, and each `catalogMatch` by the rule `accept-batch.py` uses. It prints OK.

**No `feast` on any card.** Seasons have no fixed date, and none of these ten has one in the calendar data (Gaudete and Laetare are moveable Sundays). The app must make `feast` optional before they ship (README, "Before cards without a fixed date ship").

**Sources consulted**, saved in `consult/batch-44/`: the GIRM (USCCB edition), chapter 5 (299 altar; 305 flowers: moderate in Advent, forbidden in Lent except Laetare, solemnities and feasts, always around the altar rather than on it; 307–308 candles and crucifix; 313 organ: moderate in Advent, only to support singing in Lent except Laetare) and chapter 6 (346: violet in Advent and Lent, white in Christmas Time, green in Ordinary Time, and 346f "rose may be used, where it is the practice, on Gaudete Sunday … and on Laetare Sunday"); the Directory on Popular Piety and the Liturgy (98 Advent wreath, 104 crib). The repo's formularies give **violet** as the colour of both rose Sundays (`advent/week-3/sunday.json`, `lent/week-4/sunday.json`): violet is the obligatory colour, rose the permitted one.

## Decisions

1. **Ad orientem.** Every card with a priest at the altar shows him facing it, seen from behind. The rite allows both: GIRM 299 calls Mass facing the people "desirable wherever possible", while the Order of Mass (`content/of/order/order-of-mass.json`) turns the priest "facing the people" only at set moments (the greeting, "Pray, brethren", "Behold the Lamb of God"), which presupposes he otherwise faces the altar. Chosen because the brief asks for a priest seen from behind or in profile (no face to paint, no face to repeat), and because the tested draft `x_consecration` already does so, so the season cards match the parts-of-the-Mass cards. Switching to versus populum would put the priest's face toward the viewer.
2. **Rose on Gaudete and Laetare.** Painted in rose, as the catalog line asks, on GIRM 346f; the formulary's own colour is violet.
3. **Sunday and weekday told apart by the scene**, not the rite: Sundays show a full church or the parish arriving; weekdays show a quiet early Mass with a few faithful. The Mass moments themselves (Gloria, Gospel, Consecration…) are left to the parts-of-the-Mass cards.
4. **Representative formularies (`proper`):** the first Sunday or weekday of each season that has its own formulary, except Ordinary Time I Sunday (week 2: the first Sunday is the Baptism of the Lord) and Christmas (the Second Sunday after Christmas and 29 December, the Sunday and weekday of Christmas Time that are neither a feast nor a solemnity already carded: `holy_family`, `baptism_lord`, `mary_mother_of_god`).
5. **Names** follow the catalog, tidied so the initial is the season's letter: "Advent Sundays", "Lenten Weekdays", "Ordinary Time I Sundays" / "Domingos do Advento", "Dias de semana da Quaresma", "Domingos do Tempo Comum I". "Ordinary Time I" is the plan's own term (`docs/plans/holy-cards.md`: after Christmas); the caption says "between Christmas and Lent".

## Advent Sundays (`advent_sunday`)

The test draft `x_advent_sunday`, kept: the wreath on the altar step with the first violet candle lit, a violet frontal, moderate greenery, a round window on a snowy village and the morning star. The wreath is a custom (Directory 98), not a rubric; three violet and one rose candle is the common form, and the Directory names no colours.

- Excerpt: entrance antiphon of the First Sunday, "To you, I lift up my soul, O my God." / "A vós, meu Deus, elevo a minha alma." (pt-BR's comma made a full stop).
- Proper: `tempore.advent.week-1.sunday`.

## Advent Weekdays (`advent_weekday`)

A weekday Mass before dawn by candlelight, violet, a few faithful holding candles: the watchfulness of the week's Monday collect ("watchful in prayer"). Not the Rorate Mass: that is a Marian votive Mass, in white.

- Excerpt: communion antiphon of Monday of the First Week, "Come, O Lord, visit us in peace." / "Vinde, Senhor, visitai-nos na paz."
- Proper: `tempore.advent.week-1.monday`.

## Gaudete Sunday (`gaudete`)

The wreath with three candles lit (two violet and the rose) in front; behind it the priest in a rose chasuble, a rose frontal, flowers only around the altar.

- Excerpt: the whole entrance antiphon, verbatim both languages.
- Proper: `tempore.advent.week-3.sunday`.

## Christmas Sundays (`christmas_sunday`)

A church crib at night, carved statues under a gilded star, a mother and her son kneeling at the crib rail, the altar in white and gold behind. Statues, not a living scene, so it stays apart from `nativity_christ` and `holy_family`; the Directory (104) commends the crib in churches.

- Excerpt: entrance antiphon of the Second Sunday after Christmas, its second clause, "Your all-powerful Word, O Lord, bounded from heaven's royal throne." / "A vossa palavra onipotente, Senhor, desceu do céu, do vosso trono real." (first letter capitalised).
- Proper: `tempore.christmas.second-sunday-after-christmas`.

## Christmas Weekdays (`christmas_weekday`)

A weekday Mass at sunrise in white, the sun through the east window, the crib small at the side.

- Excerpt: communion antiphon of 29 December, whole, verbatim both languages; the pt-BR is the missal's own shape ("… que sobre nós fará brilhar o Sol nascente").
- Proper: `tempore.christmas.dec-29`.

## Ordinary Time I Sundays (`ordinary_time_1_sunday`)

Outside a village church on a Sunday morning, the bell swinging, families walking in, a green-vested priest small through the open doors; green hills.

- Excerpt: entrance antiphon of the Second Sunday in Ordinary Time: en-US the first clause, pt-BR the whole (the Brazilian missal renders the verse more briefly).
- Proper: `tempore.ordinary-time.week-2.sunday`.

## Ordinary Time I Weekdays (`ordinary_time_1_weekday`)

A plain weekday Mass in green: a workman, an old woman with a rosary, a schoolgirl, a nurse.

- Excerpt: the collect of the First Week, "Attend to the pleas of your people with heavenly care, O Lord." / "Senhor, atendei com bondade paterna as preces do vosso povo suplicante." (en-US without "we pray"). The weekday formularies of the week carry no orations of their own: `week-1/monday.json` has `inheritsOrationsFrom: tempore.ordinary-time.week-1.sunday`, so this is the collect said on those weekdays.
- Proper: `tempore.ordinary-time.week-1.monday`.

## Lenten Sundays (`lent_sunday`)

A full church in violet, the altar bare of flowers (GIRM 305), priest, deacon in a violet dalmatic and servers at the altar, the congregation kneeling. The crucifix is painted unveiled (the veiling of crosses late in Lent is not in the repo's Mass data, so the card leaves it out). Palm Sunday, which counts toward this card, is red; the card shows the season's ordinary Sunday.

- Excerpt: entrance antiphon of the First Sunday, first clause, "When he calls on me, I will answer him." / "Ele me invocará e eu o ouvirei."
- Proper: `tempore.lent.week-1.sunday`.

## Lenten Weekdays (`lent_weekday`)

A side chapel on a grey morning: violet, no flowers, a carved Station of the Cross on the wall, three faithful.

- Excerpt: collect of Monday of the First Week, its opening words, "Convert us, O God our Savior." / "Convertei-nos, ó Deus, nosso Salvador."
- Proper: `tempore.lent.week-1.monday`.

## Laetare Sunday (`laetare`)

The one Lenten Sunday on which flowers may stand by the altar and the organ play alone (GIRM 305, 313): rose vestments and frontal, pale spring blossom beside the altar, an organist in the loft.

- Excerpt: entrance antiphon, "Rejoice, Jerusalem, and all who love her." / "Alegra-te, Jerusalém! Reuni-vos, vós todos que a amais!" (two pt-BR lines joined).
- Proper: `tempore.lent.week-4.sunday`.

## Look-alike risks

- `advent_weekday`, `ordinary_time_1_weekday`, `lent_weekday` and `christmas_weekday` share a composition (a priest from behind at a small altar, a few faithful): told apart by colour, light (candlelit night, clear morning, grey morning, sunrise) and one prop each (hand candles, a nurse and a workman, a Station of the Cross, the crib). If the drafts look alike, change a weekday card's viewpoint first.
- `gaudete` and `laetare` are both rose; the wreath (Gaudete) and the spring blossom with the organ (Laetare) must stay visible.
- `christmas_sunday` must read as carved statues, or it repeats `nativity_christ`.

## TLM look (2026-09-30)

Every card now shows the traditional Latin Mass. Only `subject` changed; names, excerpts, `proper`, frame and box stay. Sources, kept in `consult/tlm/`: **RS** = *Ritus servandus in celebratione Missae*, Missale Romanum 1962 (`ritus-servandus-1962-lat.pdf`, from aomoi.net); **F** = Fortescue, *The Ceremonies of the Roman Rite Described* (1920 impression; `fortescue-1920.txt`, archive.org), cited by the line of that file.

- **All eight Mass scenes** (`advent_weekday`, `gaudete`, `christmas_weekday`, `ordinary_time_1_weekday`, `lent_sunday`, `lent_weekday`, `laetare`, and the altar of `christmas_sunday`): a high altar with gradines, crucifix, three altar cards and the tabernacle veiled in the day's colour, with a frontal of the same colour (F l. 2090–2160, 2981–2992); an altar rail with its Communion cloth (F l. 1929–1935). The priest wears a Roman chasuble with maniple over amice and lace alb. At the Low Masses two of the six candles burn; at sung Masses all six burn (F l. 2143–2150). Hands "extended before the breast, no higher than the shoulders" (RS V.1) replace "arms raised".
- **`lent_sunday`:** the deacon in a violet dalmatic is gone. At a solemn Mass in Lent the ministers wear folded chasubles, not the dalmatic (F l. 2396–2434, 15852 ff.). The card is now a sung Mass with two servers, which avoids that detail.
- **Flowers** on `gaudete`, `laetare` and `christmas_weekday` move onto the gradine, where the traditional altar holds them (F l. 2084–2086, 2170–2172). On Gaudete and Laetare "the altar is decorated as for feasts, and the organ is played" (F l. 15840–15846), which supports the flowers and the organ on those two cards.
- **Advent wreath** (`advent_sunday`, `gaudete`) now stands outside the altar rail. It remains a custom, not a rubric.
- **Faithful:** women's heads are covered (1917 Code, c. 1262 §2, "mulieres autem, capite cooperto"; canonlaw.ninja/?nums=1262&v=1917).
- `ordinary_time_1_sunday` (the exterior) only gains the high altar and the Roman chasuble seen through the doors, and a woman in a mantilla.
